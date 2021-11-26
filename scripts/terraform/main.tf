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

resource "aws_vpc" "tf_vpc" {
  cidr_block = "172.31.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "tf-example"
  }
}

resource "aws_subnet" "tf_subnet" {
  vpc_id            = aws_vpc.tf_vpc.id
  cidr_block        = "172.31.0.0/20"
  availability_zone = "us-east-2a"
  tags = {
    Name = "tf-example"
  }
}

resource "aws_internet_gateway" "tf_internet_gateway" {
  vpc_id = aws_vpc.tf_vpc.id
  tags = {
    Name = "tf-example"
  }
}

resource "aws_route_table" "tf_route_table" {
  vpc_id = aws_vpc.tf_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.tf_internet_gateway.id
  }
  tags = {
    Name = "tf-example"
  }
}

resource "aws_route_table_association" "tf_route_table_association" {
  subnet_id      = aws_subnet.tf_subnet.id
  route_table_id = aws_route_table.tf_route_table.id
}

resource "aws_security_group" "tf_security_group" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = aws_vpc.tf_vpc.id
  ingress {
    description      = "TLS from VPC"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["99.247.121.26/32"]
  }
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  tags = {
    Name = "allow_ssh"
  }
}

resource "aws_instance" "tf_instance" {
  # Ubuntu Server 20.04 LTS (HVM), SSD Volume Type
  ami           = "ami-0629230e074c580f2" # us-east-2
  instance_type = "t2.micro"
  subnet_id = aws_subnet.tf_subnet.id
  associate_public_ip_address = true
  key_name = "uw-test"
  vpc_security_group_ids = [aws_security_group.tf_security_group.id]
  tags = {
    Name = "tf-example"
  }
}
