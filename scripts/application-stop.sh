#!/bin/bash
cd /home/ubuntu/
echo "Stop Application"
docker compose --file /home/ubuntu/compose.production.yml down
