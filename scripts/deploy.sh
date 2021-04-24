#!/bin/bash

cd /home/paradone/paradone;
pm2 stop paradone;
gulp clean;
git pull;
gulp build;
pm2 start paradone;
