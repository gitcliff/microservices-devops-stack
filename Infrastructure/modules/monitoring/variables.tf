variable "namespace" {
  description = "Kubernetes namespace for the monitoring stack"
  type        = string
  default     = "monitoring"
}

variable "chart_version" {
  description = "kube-prometheus-stack Helm chart version"
  type        = string
  default     = "65.1.0"
}

variable "grafana_service_type" {
  description = "Kubernetes service type for Grafana"
  type        = string
  default     = "ClusterIP"
}

variable "prometheus_service_type" {
  description = "Kubernetes service type for Prometheus"
  type        = string
  default     = "ClusterIP"
}

variable "alertmanager_service_type" {
  description = "Kubernetes service type for Alertmanager"
  type        = string
  default     = "ClusterIP"
}
