#!/bin/bash

prodDir="/var/www/chemotion_ELN/current"

cd $prodDir

delayedOutput=$("source ~/.profile && RAILS_ENV=production bundle exec bin/delayed_job status")

echo $delayedOutput