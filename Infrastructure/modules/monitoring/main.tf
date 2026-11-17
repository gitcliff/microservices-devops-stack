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

resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  namespace  = kubernetes_namespace_v1.monitoring.metadata[0].name
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = var.chart_version
  timeout    = 600

  create_namespace = false

  values = [
    yamlencode({
      grafana = {
        service = {
          type = var.grafana_service_type
        }
        sidecar = {
          dashboards = {
            enabled = true
            label   = "grafana_dashboard"
          }
        }
      }

      prometheus = {
        service = {
          type = var.prometheus_service_type
        }
        prometheusSpec = {
          serviceMonitorSelectorNilUsesHelmValues = false
          podMonitorSelectorNilUsesHelmValues     = false
        }
      }

      alertmanager = {
        service = {
          type = var.alertmanager_service_type
        }
      }
    })
  ]
}
