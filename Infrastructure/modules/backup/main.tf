# =============================================================
# AWS Backup — Automated EBS Volume Snapshots
# =============================================================

# Backup Vault — where snapshots are stored
resource "aws_backup_vault" "eks" {
  name = "${var.cluster_name}-backup-vault"

  tags = {
    Terraform = "true"
    Cluster   = var.cluster_name
  }
}

# IAM Role — allows AWS Backup to snapshot EBS volumes
resource "aws_iam_role" "backup" {
  name = "${var.cluster_name}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "backup.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Backup Plan — schedule and retention rules
resource "aws_backup_plan" "eks_volumes" {
  name = "${var.cluster_name}-ebs-backup-plan"

  rule {
    rule_name         = "daily-ebs-snapshots"
    target_vault_name = aws_backup_vault.eks.name
    schedule          = var.backup_schedule

    lifecycle {
      delete_after = var.retention_days
    }

    enable_continuous_backup = var.enable_continuous_backup
  }

  tags = {
    Terraform = "true"
    Cluster   = var.cluster_name
  }
}

# Backup Selection — which EBS volumes to back up
# Targets all EBS volumes tagged as belonging to this EKS cluster
resource "aws_backup_selection" "eks_volumes" {
  name         = "${var.cluster_name}-ebs-selection"
  plan_id      = aws_backup_plan.eks_volumes.id
  iam_role_arn = aws_iam_role.backup.arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "${var.target_tag_key}/${var.cluster_name}"
    value = var.target_tag_value
  }
}
