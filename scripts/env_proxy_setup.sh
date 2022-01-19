#!/bin/bash

# Script for retrieving all environment variables concerning webproxy and SSH and passing them to the deploy script

keywords=("SSH" "http" "HTTP")
loops=${#keywords[@]}

for (( i=0; i<$loops; i++ )); do
    echo ${keywords[i]}
    length[i]=$(env | grep ${keywords[i]} | wc -l)
    echo ${length[i]}
done

