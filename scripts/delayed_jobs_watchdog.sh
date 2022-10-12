#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"

cd $prodDir

source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status > /tmp/delay.out
delayedOutput=$(cat "/tmp/delay.out")
match="no instances running"

echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then
    echo "Delayed processes stopped."
else
    echo "Delayed jobs running."
fi