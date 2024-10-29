#!/bin/sh
set -e

case "$1" in
    "app")
        exec gunicorn main:app \
            --worker-class uvicorn.workers.UvicornWorker \
            --workers 3 \
            --bind 0.0.0.0:8000
        ;;
    "celery")
        exec celery -A worker.celery_config worker --loglevel=info
        ;;
    "flower")
        exec celery -A worker.celery_config flower --port=5555
        ;;
    *)
        exec "$@"
        ;;
esac