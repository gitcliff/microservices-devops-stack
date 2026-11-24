variable "repositories" {
  type = list(string)
}

variable "github_org" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

# ── ECR Repositories ─────────────────────────────────────────────────────────

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)

  name         = each.value
  force_delete = true  # To delete the images inside the repo

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "IMMUTABLE"
}

# ── GitHub Actions OIDC ──────────────────────────────────────────────────────
# Allows GitHub Actions to assume an IAM role via OpenID Connect, avoiding
# long-lived AWS access keys.

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",]
}

# ─── Trust policy ─────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scope to this specific repo — no other GitHub repo can assume this role
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:gitcliff/microservices-devops-stack:*"]
          # "repo:gitcliff@46714226/microservices-devops-stack@1382059702:ref:refs/heads/main"

    }
  }
}

resource "aws_iam_role" "github_actions_ecr_push" {
  name               = "github-actions-ecr-push"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json
}

data "aws_iam_policy_document" "ecr_push" {
  statement {
    sid    = "ECRGetAuthToken"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ECRPushPull"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [for repo in aws_ecr_repository.repos : repo.arn]
  }
}

resource "aws_iam_role_policy" "github_actions_ecr_push" {
  name   = "ecr-push"
  role   = aws_iam_role.github_actions_ecr_push.id
  policy = data.aws_iam_policy_document.ecr_push.json
}
