# !/bin/bash
echo "Starting the application"
cd /home/ubuntu/
docker compose --file compose.production.yml up -d