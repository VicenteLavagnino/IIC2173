# !/bin/bash
echo "Pulling the application"
cd /home/ubuntu/
docker compose --file compose.production.yml pull