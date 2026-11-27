variable "cluster_name" {
  description = "EKS cluster name, used for naming backup resources"
  type        = string
}

variable "backup_schedule" {
  description = "Cron expression for backup frequency (UTC)"
  type        = string
  default     = "cron(0 3 * * ? *)" # Daily at 03:00 UTC
}

variable "retention_days" {
  description = "Number of days to retain backup snapshots"
  type        = number
  default     = 14
}

variable "target_tag_key" {
  description = "Tag key used to select EBS volumes for backup"
  type        = string
  default     = "kubernetes.io/cluster"
}

variable "target_tag_value" {
  description = "Tag value used to select EBS volumes for backup"
  type        = string
  default     = "owned"
}

variable "enable_continuous_backup" {
  description = "Enable continuous (point-in-time) backup for EBS volumes"
  type        = bool
  default     = false
}
