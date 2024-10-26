# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12.5
FROM python:${PYTHON_VERSION}-slim as base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY requirements.txt .
RUN python -m pip install --upgrade pip
RUN python -m pip install --no-cache-dir -r requirements.txt

USER appuser

COPY . .

EXPOSE 8000

CMD ["gunicorn", "main:app", "--worker-class", "uvicorn.workers.UvicornWorker", "--workers", "3", "--bind", "0.0.0.0:8000"]
