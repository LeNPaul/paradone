#!/bin/bash

# Update OS first
sudo apt update

# Create user for running application

# Add user
adduser paradone

# Add permissions for user
usermod -aG sudo paradone

# Install and configure components needed to run application

# Need to install git on Ubuntu first to clone repository
sudo apt install -y git

# Install MongoDB
sudo apt install -y mongodb

# Install cURL
sudo apt install -y curl

# Install NodeJS
(cd ~ ;
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh;
sudo bash nodesource_setup.sh;
sudo apt install -y nodejs;
sudo apt install -y npm;)

# Install PM2
sudo npm install pm2@latest -g
pm2 startup systemd > temp.txt ; cat temp.txt | grep sudo > pm2.sh
bash pm2.sh
rm temp.txt
rm pm2.sh

# Install nginx and update firewall
sudo apt install -y nginx
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'ssh'

# Install Let's Encrypt
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
