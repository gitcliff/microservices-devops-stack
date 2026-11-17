region   = "us-east-1"
vpc_name = "EKS-Demo-VPC"
vpc_cidr = "10.1.0.0/16"

availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
private_subnet_cidrs = ["10.1.4.0/24", "10.1.5.0/24", "10.1.6.0/24"]

cluster_name    = "eks-cluster"
node_group_name = "eks-node-group"

instance_types = ["m7i-flex.large"]
capacity_type  = "ON_DEMAND"

desired_size = 1
min_size     = 1
max_size     = 2

disk_size = 30

repositories = [
  "frontend",
  "gateway",
  "auth",
  "order-service",
  "orders",
  "product-service",
  "user-service"
]
