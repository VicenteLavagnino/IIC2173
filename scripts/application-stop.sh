#!/bin/bash

echo "Current Directory: $(pwd)"
echo "Stop Application"
docker compose --file /home/ubuntu/compose.production.yml down
