output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "argocd_namespace" {
  description = "ArgoCD namespace"
  value       = module.argocd.namespace
}

output "monitoring_namespace" {
  description = "Monitoring namespace"
  value       = module.monitoring.namespace
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions ECR push via OIDC"
  value       = module.ecr.github_actions_role_arn
}

output "kyverno_namespace" {
  description = "Kyverno namespace"
  value       = module.kyverno.namespace
}

output "backup_vault_name" {
  description = "AWS Backup vault name"
  value       = module.backup.vault_name
}

output "backup_plan_id" {
  description = "AWS Backup plan ID"
  value       = module.backup.plan_id
}
