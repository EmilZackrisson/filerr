#!/bin/bash


if [ "$1" == "dev" ]; then
    echo "Starting in dev mode"
    docker compose -f docker-compose-dev.yaml build
    docker compose -f docker-compose-dev.yaml down
    docker compose -f docker-compose-dev.yaml up -d
# elif [ "$mode" = "prod" ]; then
#     echo "Starting in prod mode"
#     npm run prod
else
    echo "Invalid mode"
    echo "Mode: $mode"
fi