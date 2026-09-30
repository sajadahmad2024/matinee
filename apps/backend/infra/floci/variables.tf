variable "aws_region" {
  description = "Region passed to every AWS resource (Floci accepts any region — no real AWS account is involved)."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Matches NODE_ENV — used to namespace bucket / queue / secret names."
  type        = string
  default     = "development"
}

variable "app_name" {
  description = "Prefix used for every named resource (S3 buckets, SQS queues, Lambda function, IAM role)."
  type        = string
  default     = "maintinee"
}

variable "floci_endpoint" {
  description = "Floci's unified AWS-service edge endpoint. Matches FLOCI_ENDPOINT in .env.example."
  type        = string
  default     = "http://localhost:4566"
}

variable "transcoder_lambda_image_uri" {
  description = <<-EOT
    Container image URI for the transcoder Lambda. Locally: image name pulled from the host
    Docker daemon (e.g. "dummy-transcoder:latest" after `pnpm media:lambda:build`).
    In real AWS: an ECR URI (built + pushed by CI, e.g.
    "ACCOUNT.dkr.ecr.REGION.amazonaws.com/transcoder:latest").
  EOT
  type        = string
  default     = "dummy-transcoder:latest"
}

variable "transcoder_lambda_memory_mb" {
  description = "Lambda memory (dummy is tiny; bump for real FFmpeg/MediaConvert-invoking impl)."
  type        = number
  default     = 512
}

variable "transcoder_lambda_timeout_seconds" {
  description = "Lambda max duration. Dummy takes <2s. AWS caps at 900s."
  type        = number
  default     = 60
}

variable "transcoder_lambda_database_url" {
  description = <<-EOT
    Postgres connection string the Lambda uses to update media_metadata directly. Under Floci,
    the Lambda container reaches host Postgres at host.docker.internal:5432. In prod, this is
    an RDS endpoint — the Lambda must be in a VPC that can reach it. Populate via terraform.tfvars.
  EOT
  type        = string
  default     = "postgresql://postgres:postgres@host.docker.internal:5432/postgres"
  sensitive   = true
}

variable "media_source_bucket_name" {
  description = "Override for the source (upload) bucket name; empty = auto-name from app_name+env."
  type        = string
  default     = ""
}

variable "media_output_bucket_name" {
  description = "Override for the output (HLS) bucket name; empty = auto-name from app_name+env."
  type        = string
  default     = ""
}

variable "app_secrets" {
  description = <<-EOT
    Opaque application secrets with no Terraform-managed infrastructure counterpart — JWT
    signing keys, OAuth client credentials, third-party API keys, provider-selection flags,
    etc. Merged into the single Secrets Manager JSON blob alongside the computed S3/SQS/
    Lambda values (see secrets.tf). Populate via terraform.tfvars (gitignored) — copy
    terraform.tfvars.example and fill in real values. Never commit real secrets.
  EOT
  type        = map(string)
  default     = {}
  sensitive   = true
}

# Update the endpoints block in provider.tf if you rename secretsmanager. Kept here so the
# secrets file has the SDK client dependency spelled out next to the Terraform-side one.


variable "lambda_aws_endpoint_url" {
  description = <<-EOT
    AWS endpoint the transcoder Lambda's SDK clients use. Inside the Lambda container,
    `localhost` is the container itself, NOT Floci — so this must be an address reachable from
    the container: `http://host.docker.internal:4566` works on Docker Desktop (macOS/Windows);
    on Linux use the Floci container name on a shared network. Set to "" in real AWS — the
    variable is then omitted from the function env entirely.
  EOT
  type        = string
  default     = "http://host.docker.internal:4566"
}

variable "transcoder_lambda_database_secret_id" {
  description = <<-EOT
    Prod: Secrets Manager secret id whose JSON has a DATABASE_URL key. When set, the Lambda
    reads the connection string from Secrets Manager and DATABASE_URL is NOT placed in the
    function env (or Terraform state). Leave "" locally to use transcoder_lambda_database_url.
  EOT
  type        = string
  default     = ""
}

variable "media_source_events_max_receive_count" {
  description = "Deliveries of an S3 event before it moves to the DLQ. The Lambda only marks a row FAILED on the last one."
  type        = number
  default     = 5
}
