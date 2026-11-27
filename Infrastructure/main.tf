data "aws_caller_identity" "current" {}

module "vpc" {
  source = "./modules/vpc"

  vpc_name             = var.vpc_name
  cidr_block           = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  cluster_name         = var.cluster_name
}

module "eks" {
  source = "./modules/eks"

  cluster_name    = var.cluster_name
  node_group_name = var.node_group_name
  instance_types  = var.instance_types
  capacity_type   = var.capacity_type
  min_size        = var.min_size
  desired_size    = var.desired_size
  max_size        = var.max_size
  disk_size       = var.disk_size

  subnet_ids = module.vpc.private_subnet_ids

  depends_on = [module.vpc]
}

module "ecr" {
  source = "./modules/ecr"

  repositories = var.repositories
  github_org   = var.github_org
  github_repo  = var.github_repo
}

# --- Kubernetes / Helm auth for in-cluster modules ---

data "aws_eks_cluster_auth" "eks" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  alias                  = "eks"
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.eks.token
}

provider "helm" {
  alias = "eks"

  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.eks.token
  }
}

# --- ArgoCD ---

module "argocd" {
  source = "./modules/argocd"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  depends_on = [module.eks]
}

# --- Monitoring (kube-prometheus-stack) ---

module "monitoring" {
  source = "./modules/monitoring"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  depends_on = [module.eks]
}

# --- Kyverno Admission Controller ---

module "kyverno" {
  source = "./modules/kyverno"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  ecr_registry = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"

  depends_on = [module.eks]
}

# --- AWS Backup (EBS Volume Snapshots) ---

module "backup" {
  source = "./modules/backup"

  cluster_name = var.cluster_name

  depends_on = [module.eks]
}
