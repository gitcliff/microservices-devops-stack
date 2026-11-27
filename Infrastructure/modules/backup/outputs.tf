output "vault_name" {
  description = "Name of the AWS Backup vault"
  value       = aws_backup_vault.eks.name
}

output "vault_arn" {
  description = "ARN of the AWS Backup vault"
  value       = aws_backup_vault.eks.arn
}

output "plan_id" {
  description = "ID of the backup plan"
  value       = aws_backup_plan.eks_volumes.id
}

output "backup_role_arn" {
  description = "ARN of the IAM role used by AWS Backup"
  value       = aws_iam_role.backup.arn
}
