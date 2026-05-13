provider "aws" {
	region="ap-southeast-2"
}

resource "aws_s3_bucket" "my-bucket" {
  bucket = "tf-state-bucket"
}