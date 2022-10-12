#!/bin/bash


# Variables

mail="liermann@uni-mainz.de" # Add your mail here

prodDir="/var/www/chemotion_ELN/current"
tmp="/tmp/delayed_out"
check="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status"
restart="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job restart"
success="Restart of Chemotion delayed jobs on $(hostname) successful"
fail="Restart of Chemotion delayed jobs on $(hostname) unsuccesful"
log="/var/log/delayed_jobs_watchdog"

match="no instances running"  # Output criterium for non-running jobs


# Notification in case of failure

failfunction() {
    echo "$(date): $fail" | mail -s "$fail" $mail 
    echo "$(date): $fail" >> $log
    exit 1
}


# Working directory

cd $prodDir


# Execute status and write output to variable

eval $check 2> $tmp
delayedOutput=$( cat $tmp )


# echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then # ... then jobs are not running
    echo "$(date): Delayed processes stopped. Restarting now..." | tee -a $log
    eval $restart || failfunction
    echo "$(date): $success" | mail -s "$success" $mail 
    echo "$(date): $success" >> $log
else # ... everything seems normal
    echo "$(date): Delayed jobs running." | tee -a $log
fi
