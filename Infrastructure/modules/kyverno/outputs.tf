output "namespace" {
  description = "Kyverno namespace"
  value       = kubernetes_namespace_v1.kyverno.metadata[0].name
}

output "release_name" {
  description = "Kyverno Helm release name"
  value       = helm_release.kyverno.name
}

output "release_status" {
  description = "Kyverno Helm release status"
  value       = helm_release.kyverno.status
}
