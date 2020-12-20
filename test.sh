#!/bin/bash
# Spins up test database and runs all tests
echo "Running tests:"
echo
(
    # TODO: Is this only needed for windows?
    # Copy the .env file to the same directory as our server docker-compose
    cp .env ./server/tests/.env
    # Spin up the MongoDB image
    cd './server/tests'
    docker-compose up -d mongo
    # Run our tests
    cd '..'
    npm run test
    # Bring down our test DB
    cd './tests'
    docker-compose down
    # Remove the .env file we copied
    rm '.env'
)