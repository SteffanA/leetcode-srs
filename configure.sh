#!/bin/sh
# Function for writing user input env variables into env file
# Read the .env file line by line, skipping comments, erasing anything after
# =, and then adding user input after the =
# Writes to a temp file first, then replaces the .env with the temp and removes
# the temp
get_env_input () {
    envFile=$1
    tempFile=$2
    while IFS= read -r line
    do
        # Check if this is a comment line - if so, simply print it.
        if [[ $line =~ ^#.* ]]; then
            echo "$line"
            # Also print to our output file
            echo "$line" >> $output
        # Else ask for a value to provide for the variable
        else
            echo "Enter the value you would like to provide for:"
            # Grab just the environmental variable
            # Use sed to find the first =, then replace all non-equal after with
            # an empty string
            curVar = sed 's/=[^=]*$//' $line
            read -p "$curVar" inputVar
            echo
            # Write the curVar and inputVar into our output file
            echo -n "$curVar" >> $tempFile
            echo "$inputVar" >> $tempFile
        fi
    done < "$envFile"
    # Replace the env file with our temp file
    cp $tempFile $envFile
    # Delete the temp file
    rm $tempFile
}

envFile = ./leetcode-srs/.env
# Use a temp file for adding our output to
output = ./leetcode-srs/.env-temp
echo
get_env_input($envFile, $output)
exit(1)

# Install the npm modules for the server and frontend
(cd ./server/ && npm install)
(cd ./leetcode-srs/ && npm install)

# Ask if we should configure initialize the .env files
read -p "Do you want to create the required .env files? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    # Simply copy the samples
    cp ./leetcode-srs/.env-sample ./leetcode-srs/.env
    cp ./env.sample ./.env
    # Check if user wants to fill in the .env now
    read -p "Would you like to input the required variables now?" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo "Adding variables for the React frontend"
        envFile = ./leetcode-srs/.env
        # Use a temp file for adding our output to
        output = ./leetcode-srs/.env-temp
        echo
        get_env_input($envFile, $output)
        echo "Adding variables for the rest of the application"
        $envFile= ./.env
        $output = ./.env-temp
        echo
        get_env_input($envFile, $output)
    fi
fi
echo "Would you like to fill your database with LeetCode problems?" -n 1 -r
echo "Note this requires the .env files to be setup already."
echo 
dockerRunning=0
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Note this requires the MongoDB database and backend server to be running."
    echo "We can launch the docker containers for your server/MongoDB now if you wish."
    echo
    echo "Should we run the containers now?" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        # Run MongoDB container only
        echo "Running MongoDB and server containers..."
        docker-compose up mongo server -d
        # Mark that we have containers running we'll need to clean up
        dockerRunning=1
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
if [["$dockerRunning" == 1]]
then
    # Close the docker container
    echo "Shutting down containers..."
    docker-compose down
fi
exit 1