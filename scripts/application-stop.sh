#!/bin/bash
cd /home/ubuntu/
echo "Stop Application"
echo "My path is: $(pwd)"
docker compose --file /home/ubuntu/compose.production.yml down
