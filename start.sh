#!/bin/bash


if [ "$1" == "dev" ]; then
    echo "Starting in dev mode"
    docker compose -f docker-compose-dev.yaml build
    docker compose -f docker-compose-dev.yaml down
    docker compose -f docker-compose-dev.yaml up -d
# if [ "$1" = "down" ]; then
#     echo "Stopping containers"
#     docker compose -f docker-compose-dev.yaml down
else
    echo "Invalid mode"
    echo "Mode: $mode"
fi