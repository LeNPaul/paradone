#!/bin/bash

cd /home/paradone/paradone;
pm2 stop paradone;
git pull;
pm2 start paradone;
