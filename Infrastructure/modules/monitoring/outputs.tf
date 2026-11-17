output "namespace" {
  description = "Monitoring namespace"
  value       = kubernetes_namespace_v1.monitoring.metadata[0].name
}

output "release_name" {
  description = "kube-prometheus-stack Helm release name"
  value       = helm_release.kube_prometheus_stack.name
}

output "release_status" {
  description = "kube-prometheus-stack Helm release status"
  value       = helm_release.kube_prometheus_stack.status
}
