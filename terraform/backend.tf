terraform {
  backend "s3" {
    bucket = "tf-state-bucket"
    key    = "./terraform/terraform.tfstate"
    region = "ap-southeast-2"
  }
}