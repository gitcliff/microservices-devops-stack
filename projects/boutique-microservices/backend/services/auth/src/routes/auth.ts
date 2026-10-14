import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../database/connection";

const router = express.Router();

let _currentUser: any = null;

function toUserProfile(row: any) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
  };
}

function toUserResponse(row: any) {
  return {
    ...toUserProfile(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildAuthResponse(row: any, message: string) {
  return {
    user: toUserResponse(row),
    token: row.id.toString(),
    refreshToken: row.id.toString(),
    message,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at, updated_at",
      [email, hashedPassword, firstName, lastName, "customer"],
    );

    const user = result.rows[0];
    _currentUser = toUserProfile(user);

    res.status(201).json(buildAuthResponse(user, "Registration successful"));
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo mode: accept any email with password "demo"
    if (password === "demo") {
      let user;
      const result = await query(
        "SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE email = $1",
        [email],
      );

      if (result.rows.length === 0) {
        // Create demo user if doesn't exist
        const hashedPassword = await bcrypt.hash("demo", 10);
        const newUser = await query(
          "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at, updated_at",
          [email, hashedPassword, "Demo", "User", "customer"],
        );
        user = newUser.rows[0];
      } else {
        user = result.rows[0];
      }

      _currentUser = toUserProfile(user);
      res.json(buildAuthResponse(user, "Demo login successful"));
      return;
    }

    // Normal password check
    const result = await query(
      "SELECT id, email, password_hash, first_name, last_name, role, created_at, updated_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    _currentUser = toUserProfile(user);
    res.json(buildAuthResponse(user, "Login successful"));
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  _currentUser = null;
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!userId || userId === "undefined") {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const result = await query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE id = $1",
      [userId],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json(toUserProfile(result.rows[0]));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export { router as authRoutes };
