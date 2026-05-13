resource "aws_ecr_repository" "backend-ecr" {
    name = "backend-ecr"

    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
      scan_on_push = true
    }

    encryption_configuration {
      encryption_type = "AES256"
    }

    tags = {
        name = "backend-ecr"
    }
}

resource "aws_ecr_repository" "frontend-ecr" {
    name = "frontend-ecr"

    image_tag_mutability = "MUTABLE"

    image_scanning_configuration {
      scan_on_push = true
    }

    encryption_configuration {
      encryption_type = "AES256"
    }

    tags = {
        name = "frontend-ecr"
    }
}