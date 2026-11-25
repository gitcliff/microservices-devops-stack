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

resource "kubernetes_namespace_v1" "kyverno" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "kyverno" {
  name       = "kyverno"
  namespace  = kubernetes_namespace_v1.kyverno.metadata[0].name
  repository = "https://kyverno.github.io/kyverno"
  chart      = "kyverno"
  version    = var.chart_version
  timeout    = 600

  create_namespace = false
}

# ── Image Attestation Verification Policy ───────────────────────────
#
# Requires all container images in the target namespace to have valid
# SLSA build provenance attestations signed via Sigstore keyless
# (GitHub Actions OIDC).
#
# Starts in Audit mode by default — violations are logged in policy
# reports but do not block deployments. Switch to Enforce after
# confirming all images carry valid attestations.
#
# Uses kubernetes_manifest because Kyverno CRDs must exist before
# the policy can be applied; the implicit dependency on helm_release
# ensures correct ordering.

resource "kubernetes_manifest" "require_slsa_provenance" {
  depends_on = [helm_release.kyverno]

  manifest = {
    apiVersion = "kyverno.io/v1"
    kind       = "ClusterPolicy"
    metadata = {
      name = "require-slsa-provenance"
      annotations = {
        "policies.kyverno.io/title"       = "Require SLSA Build Provenance"
        "policies.kyverno.io/category"    = "Supply Chain Security"
        "policies.kyverno.io/severity"    = "high"
        "policies.kyverno.io/description" = "Requires container images in the boutique namespace to have valid SLSA build provenance attestations from GitHub Actions."
      }
    }
    spec = {
      validationFailureAction = var.policy_mode
      background              = true
      rules = [
        {
          name = "verify-slsa-provenance"
          match = {
            any = [
              {
                resources = {
                  kinds      = ["Pod"]
                  namespaces = [var.target_namespace]
                }
              }
            ]
          }
          verifyImages = [
            {
              imageReferences = ["${var.ecr_registry}/*"]
              attestations = [
                {
                  type = "https://slsa.dev/provenance/v1"
                  attestors = [
                    {
                      entries = [
                        {
                          keyless = {
                            issuer  = "https://token.actions.githubusercontent.com"
                            subject = var.github_repo_pattern
                            rekor = {
                              url = "https://rekor.sigstore.dev"
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
