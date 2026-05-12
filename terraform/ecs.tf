resource "aws_ecs_cluster" "main" {
    name = "pulsecheck-cluster"
}

resource "aws_ecs_task_definition" "backend" {
  family = "backend-task"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs-to-ecr.arn

  container_definitions = jsonencode([
    {
        name = "backend",
        image = "${aws_ecr_reporsitory.backend-ecr.repository_url}:${var.backend_image_tag}"
        essential = true
        portMappings = [
            {
                containerPort = 3000
                hostPort = 3000
            }
        ]
    }
  ])
}

resource "aws_ecs_task_definition" "frontend" {
  family = "frontend-task"
  network_mode = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu = "256"
  memory = "512"

  execution_role_arn = aws_iam_role.ecs-to-ecr.arn

  container_definitions = jsonencode([
    {
        name = "frontend",
        image = "${aws_ecr_reporsitory.frontend-ecr.repository_url}:${var.frontend_image_tag}"
        essential = true
        portMappings = [
            {
                containerPort = 80
                hostPort = 80
            }
        ]
    }
  ])
}

resource "aws_ecs_service" "backend_service" {
  name = "backend-service"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count = 1
  launch_type = "FARGATE"
}

resource "aws_ecs_service" "frontend_service" {
  name = "frontend_service"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count = 1
  launch_type = "FARGATE"
}