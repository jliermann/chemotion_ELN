#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"
tmp="/tmp/delayed_out"
check="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status"
restart="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job restart"
mail="liermann@uni-mainz.de"
success="Restart of Chemotion delayed jobs on $(hostname) successful"
fail="Restart of Chemotion delayed jobs on $(hostname) unsuccesful"

cd $prodDir

eval $check 2> $tmp
delayedOutput=$( cat $tmp )
match="no instances running"

# echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then
    echo "Delayed processes stopped. Restarting now..."
    eval $restart || echo "$(date): $fail" | mail -s $fail $mail && exit 1
    echo "$(date): $success" | mail -s $success $mail
else
    echo "Delayed jobs running."
fi
