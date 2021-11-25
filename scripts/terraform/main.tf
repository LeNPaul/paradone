provider "aws" {
  region     = "us-east-2"
  access_key = var.access_key
  secret_key = var.secret_key
}

variable "access_key" {
  description = "AWS access key"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "AWS secret key"
  type        = string
  sensitive   = true
}

resource "aws_vpc" "main_vpc" {
  cidr_block = "172.31.0.0/16"
  tags = {
    Name = "tf-example"
  }
}

resource "aws_subnet" "main_subnet" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "172.31.0.0/20"
  availability_zone = "us-east-2a"
  tags = {
    Name = "tf-example"
  }
}
