#!/bin/bash

# Script for retrieving all environment variables concerning globally and passing them to the deploy script

# Define Variables

filename="/home/production/jgu_env.sh"

# Assemble export statements

length=$(env | wc -l)  # Determine number of env for each keyword
for (( j=0; j<$length; j++)); do
    envall=$(env | sed -n "$(expr $j + 1) p" ) # Get env line per line
    envname=$(echo $envall | sed -e "s/\([^=]*\)=.*/\1/") # extract variable name
    envval=$(echo $envall | sed -e "s/\([^=]*=\)//") # extract variable value
    echo "export $envname=\"$envval\"" >> $filename # create export statements with double quotes
done

chmod +x $filename
