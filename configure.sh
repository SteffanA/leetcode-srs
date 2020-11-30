#!/bin/sh

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
        echo "This feature is a TODO.  You'll have to edit by hand for now!"
        # Do 
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