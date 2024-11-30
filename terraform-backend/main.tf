variable "my_access_key" {
  description = "Access-key-for-AWS"
  default = "no_access_key_value_found"
}

variable "my_secret_key" {
  description = "Secret-key-for-AWS"
  default = "no_secret_key_value_found"
}

provider "aws" {
    region = "us-east-2"
    access_key = var.my_access_key
    secret_key = var.my_secret_key
}

resource "aws_instance" "backend" {
    ami = "ami-0866a04d72a1f5479"  # Amazon Linux 2 AMI para us-east-2
    instance_type = "t2.micro"

    user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y httpd
              sudo systemctl start httpd
              sudo systemctl enable httpd
              echo "<h1>Backend Server configurado con Terraform</h1>" > /var/www/html/index.html
              EOF

    tags = {
        Name = "Backend Server"
    }
    vpc_security_group_ids = [aws_security_group.backend.id]
}

resource "aws_security_group" "backend" {
    name = "backend-security-group"

    ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

output "public_ip" {
    value = aws_instance.backend.public_ip
    description = "IP pública del servidor backend"
}