#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"

cd $prodDir

delayedOutput=$(source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status)
match="no instances running"

echo $delayedOutput

if [[ "$delayedOutput" =~ (^| )$match($| ) ]]; then
    echo "Delayed processes stopped."
else
    echo "Delayed jobs running."
fi