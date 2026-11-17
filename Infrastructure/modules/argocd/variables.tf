variable "namespace" {
  description = "Kubernetes namespace for ArgoCD"
  type        = string
  default     = "argocd"
}

variable "chart_version" {
  description = "ArgoCD Helm chart version"
  type        = string
  default     = "7.7.5"
}

variable "service_type" {
  description = "Kubernetes service type for ArgoCD server"
  type        = string
  default     = "ClusterIP"
}

variable "server_insecure" {
  description = "Run ArgoCD server in insecure mode (TLS terminated at ingress/ALB)"
  type        = bool
  default     = true
}
