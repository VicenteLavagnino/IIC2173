#!/bin/bash
cd /home/ubuntu/
echo "Stop Application"
docker compose --file compose.production.yml down