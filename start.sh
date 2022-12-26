#! /bin/bash
set -e

cp .env.example .env

export PUBLIC_URL=${PUBLIC_URL:-http://localhost:5050}

envsubst '$PUBLIC_URL' < /.env

exec node build