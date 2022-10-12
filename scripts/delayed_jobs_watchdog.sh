#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"
tmp="/tmp/delayed_out"
check="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status"
restart="source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job restart"
mail="liermann@uni-mainz.de"

cd $prodDir

eval $check 2> $tmp
delayedOutput=$( cat $tmp )
match="no instances running"

# echo $delayedOutput

if [[ "$delayedOutput" == *"$match"* ]]; then
    echo "Delayed processes stopped. Restarting now..."
    eval $restart || mail -s "Restart of Chemotion delayed jobs on $(hostname) unsuccesful" $mail && exit 1
    mail -s "Restart of Chemotion delayed jobs on $(hostname) succesful" $mail
else
    echo "Delayed jobs running."
fi
