#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"
tmp="/tmp/delayed_out"
check="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status"
restart="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job restart"
mail="liermann@uni-mainz.de"
success="Restart of Chemotion delayed jobs on $(hostname) successful"
fail="Restart of Chemotion delayed jobs on $(hostname) unsuccesful"
log="/var/log/delayed_jobs_watchdog"

failfunction() {
    echo "$(date): $fail" | mail -s "$fail" $mail 
    echo "$(date): $fail" > $log
    exit 1
}

cd $prodDir

eval $check 2> $tmp
delayedOutput=$( cat $tmp )
match="no instances running"

# echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then
    echo "$(date): Delayed processes stopped. Restarting now..." | tee $log
    eval $restart || failfunction()
    echo "$(date): $success" | mail -s "$success" $mail 
    echo "$(date): $success" > $log
else
    echo "$(date): Delayed jobs running." | tee $tmp
fi
