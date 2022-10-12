#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"
tmp="/tmp/delayed_out"

cd $prodDir

source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status 2> $tmp
delayedOutput=$( cat $tmp )
match="no instances running"

# echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then
    echo "Delayed processes stopped."
else
    echo "Delayed jobs running."
fi
