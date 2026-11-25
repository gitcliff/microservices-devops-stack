variable "namespace" {
  description = "Kubernetes namespace for Kyverno"
  type        = string
  default     = "kyverno"
}

variable "chart_version" {
  description = "Kyverno Helm chart version"
  type        = string
  default     = "3.3.4"
}

variable "policy_mode" {
  description = "Kyverno policy validation failure action: Audit or Enforce"
  type        = string
  default     = "Audit"

  validation {
    condition     = contains(["Audit", "Enforce"], var.policy_mode)
    error_message = "policy_mode must be 'Audit' or 'Enforce'."
  }
}

variable "ecr_registry" {
  description = "ECR registry URL prefix for image verification"
  type        = string
}

variable "github_repo_pattern" {
  description = "GitHub repository pattern for OIDC subject matching in attestation verification"
  type        = string
  default     = "https://github.com/gitcliff/microservices-devops-stack/*"
}

variable "target_namespace" {
  description = "Namespace to enforce image verification"
  type        = string
  default     = "boutique"
}

variable "excluded_namespaces" {
  description = "Namespaces excluded from image verification policy"
  type        = list(string)
  default     = ["kube-system", "kube-node-lease", "kube-public", "kyverno", "argocd", "monitoring"]
}
