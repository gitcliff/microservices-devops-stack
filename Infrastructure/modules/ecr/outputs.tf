output "repository_urls" {
  value = {
    for repo in aws_ecr_repository.repos :
    repo.name => repo.repository_url
  }
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions to push to ECR via OIDC"
  value       = aws_iam_role.github_actions_ecr_push.arn
}
