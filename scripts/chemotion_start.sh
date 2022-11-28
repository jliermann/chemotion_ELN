#!/bin/bash

sleep 60

echo "$(date): Starting Chemotion docker instance..."
cd /home/production/chemotion
if docker compose up -d ; then
    echo "$(date): Chemotion started successfully."
else
    echo "$(date): Chemotion start unsuccessful."
fi