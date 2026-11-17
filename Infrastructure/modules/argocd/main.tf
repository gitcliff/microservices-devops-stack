terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  namespace  = kubernetes_namespace_v1.argocd.metadata[0].name
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = var.chart_version
  timeout    = 600

  create_namespace = false

  values = [
    yamlencode({
      server = {
        service = {
          type = var.service_type
        }
      }
      configs = {
        params = {
          "server.insecure" = var.server_insecure
        }
      }
    })
  ]
}
