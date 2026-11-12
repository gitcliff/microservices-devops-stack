import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the boutique app title", () => {
  render(<App />);
  expect(screen.getByText(/luxury boutique/i)).toBeInTheDocument();
});
