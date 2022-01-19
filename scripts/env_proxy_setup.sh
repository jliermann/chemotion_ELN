#!/bin/bash

# Script for retrieving all environment variables concerning webproxy and SSH and passing them to the deploy script

keywords=("SSH" "http" "HTTP")
loops=${#keywords[@]}
filename="/home/production/jgu_env.sh"

# Determine number of env for each keyword

for (( i=0; i<$loops; i++ )); do
    # echo ${keywords[i]}
    length[i]=$(env | grep ${keywords[i]} | wc -l)
    # echo ${length[i]}
done

# Assemble export statements

for (( i=0; i<$loops; i++ )); do
    for (( j=0; j<${length[i]}; j++)); do
        envvar=$(env | grep ${keywords[i]} | sed -n "$(expr $j + 1) p")
        echo "EXPORT $envvar" >> $filename
        echo $envvar
    done
    # echo ${keywords[i]}
    # length[i]=$(env | grep ${keywords[i]} | wc -l)
    # echo ${length[i]}
done

chmod +x $filename
