#!/bin/bash
# Spins up test database and runs all tests and/or coverage.

echo "You can run either just tests, or tests+coverage via this script."
read -p "Would you like to run just tests? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Running tests:"
    echo
    (
        # Set the test environmental variable to true
        # TODO: Does this work? Supposed to make it so don't need to manually
        # set testing to something within the .env
        TESTING="true"
        # TODO: Is this only needed for windows?
        # Copy the .env file to the same directory as our server docker-compose
        cp .env ./server/tests/.env
        # Spin up the MongoDB image
        cd './server/tests'
        docker-compose up -d mongo
        # Remove the .env file we copied
        rm .env
        # Run our tests
        cd '..'
        npm run test
        # Bring down our test DB
        cd './tests'
        docker-compose down
    )
else
    echo "Running tests and coverage:"
    echo
    (
        # Set the test environmental variable to true
        # TODO: Does this work? Supposed to make it so don't need to manually
        # set testing to something within the .env
        TESTING="true"
        # TODO: Is this only needed for windows?
        # Copy the .env file to the same directory as our server docker-compose
        cp .env ./server/tests/.env
        # Spin up the MongoDB image
        cd './server/tests'
        docker-compose up -d mongo
        # Remove the .env file we copied
        rm .env
        # Run our tests
        cd '..'
        npm run coverage
        # Bring down our test DB
        cd './tests'
        docker-compose down
    )
fi
