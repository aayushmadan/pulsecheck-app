terraform {
  backend "s3" {
    bucket = "tf-state-bucket-867345910980-ap-southeast-2-an "
    key    = "./terraform/terraform.tfstate"
    region = "ap-southeast-2"
  }
}