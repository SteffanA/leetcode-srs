#!/bin/bash
# Spins up test database and runs all tests with coverage.

coverageType='coverage'
# If optional arg was passed, it determines the subset of tests to run.
if [ $# -ne 0 ]
then
    # Grab the first argument as the type of test to run.
    coverageType=$1
fi 
printf "Running tests and %s:\n" "$coverageType"
(
    # TODO: Is this only needed for windows?
    # Copy the .env file to the same directory as our server docker-compose
    cp .env ./server/tests/.env
    # Spin up the MongoDB image
    cd './server/tests'
    docker-compose up -d mongo
    # Run our tests/coverage
    cd '..'
    npm run $coverageType
    # Bring down our test DB
    cd './tests'
    docker-compose down
    # Remove the .env file we copied
    rm .env
)