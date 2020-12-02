#!/bin/sh

# Function for writing user input for specified env vars into .env file
# Reads the sample .env line by line, outputting comments as whole,
# or variables by the defition, then asks for user input for each, defining
# said var with the provided input in the final .env file provided
# 
# Accepts 2 parameters: $1 = sample .env path, $2 = final .env path
get_env_input () {
    sampleFile=$1
    envFile=$2
    # Remove any existing env output file
    rm "$envFile"
    while IFS= read -r line
    do
        # Check if this is a comment line - if so, simply print it.
        if [[ $line =~ ^#.* ]]
        then
            echo "$line"
            # Also print to our output file
            echo "$line" >> "$envFile"
        # Check if newline - don't prompt or output, just add to output file
        elif [[ -z $line ]]
        then
            echo "$line" >> "$envFile"
        # Else ask for a value to provide for the variable
        else
            # Grab just the environmental variable
            # Use sed to find the first =, then replace all non-equal after with
            # an empty string and pass to curVar
            curVar=$(echo "$line" | sed 's/=[^=]*$//')
            if [[ ! -z $curVar ]]
            then
                echo "Enter the value you would like to provide for $curVar:"
                # Read directly from tty, not stdout, since we're printing to stdout
                read -p "     " inputVar < /dev/tty
                echo
                # Write the curVar and inputVar into our output file
                echo -n "$curVar=" >> "$envFile"
                echo "$inputVar" >> "$envFile"
            else
                # TODO: Understand why this isn't caught by the elif statement
                echo "$curVar" >> "$envFile"
            fi
        fi
    done < "$sampleFile"
}

# BEGIN CONFIGURE SCRIPT

# Install the npm modules for the server and frontend
(cd ./server/ && npm install)
(cd ./leetcode-srs/ && npm install)

# Ask if we should configure initialize the .env files
read -p "Do you want to create the required .env files? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Simply copy the samples
    cp "./leetcode-srs/.env.sample" "./leetcode-srs/.env"
    cp "./.env.sample" "./.env"
    # Check if user wants to fill in the .env now
    read -p "Would you like to input the required variables now? " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # Go ahead and remove the .env since we'll generate them here
        rm "./.env"
        rm "./leetcode-srs/.env"
        echo "Adding variables for the React frontend"
        sampleFile="./leetcode-srs/.env.sample"
        envFile="./leetcode-srs/.env"
        get_env_input "$sampleFile" "$envFile"
        echo "Adding variables for the rest of the application"
        sampleFile="./.env.sample"
        envFile="./.env"
        echo
        get_env_input "$sampleFile" "$envFile"
    fi
fi
dockerRunning="0"
echo "Would you like to fill your database with LeetCode problems? "
read -p "Note this requires the .env files to be setup already. " -n 1 -r
echo 
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Note this requires the MongoDB database and backend server to be running."
    echo "We can launch the docker containers for your server/MongoDB now if you wish."
    echo
    read -p "Should we run the containers now? " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # Run MongoDB container only
        echo "Running MongoDB and server containers..."
        docker-compose up mongo server -d
        # Mark that we have containers running we'll need to clean up
        dockerRunning="1"
    else
        echo "Skipping running containers."
        echo
    fi
    # Run the python import script, but ensure requirements are met first
    echo "Installing python script requirements.."
    python -m pip install -r requirements.txt
    echo "Running problem import script..."
    echo
    python ./utility/lcAPIparser.py
fi
# Cleanup
if [[ "$dockerRunning" == "1" ]]
then
    # Close the docker container
    echo "Shutting down containers..."
    docker-compose down
fi
exit 1