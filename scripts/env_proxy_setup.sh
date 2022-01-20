#!/bin/bash

# Script for retrieving all environment variables concerning webproxy and SSH and passing them to the deploy script

# Define Variables

keywords=("SSH" "proxy" "PROXY" "PATH")
loops=${#keywords[@]}
filename="/home/production/jgu_env.sh"

# Assemble export statements

for (( i=0; i<$loops; i++ )); do
    length=$(env | grep ${keywords[i]} | wc -l)  # Determine number of env for each keyword
    for (( j=0; j<$length; j++)); do
        envall=$(env | grep ${keywords[i]} | sed -n "$(expr $j + 1) p" ) # Get env line per line
        envname=$(echo $envall | sed -e "s/\([^=]*\)=.*/\1/") # extract variable name
        envval=$(echo $envall | sed -e "s/\([^=]*=\)//") # extract variable value
        echo "export $envname=\"$envval\"" >> $filename # create export statements with double quotes
    done
done

chmod +x $filename
