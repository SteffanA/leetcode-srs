#!/bin/bash
# Spins up test database and runs all tests with coverage.
echo "Running tests and coverage:"
echo
(
    # TODO: Is this only needed for windows?
    # Copy the .env file to the same directory as our server docker-compose
    cp .env ./server/tests/.env
    # Spin up the MongoDB image
    cd './server/tests'
    docker-compose up -d mongo
    # Run our tests/coverage
    cd '..'
    npm run coverage
    # Bring down our test DB
    cd './tests'
    docker-compose down
    # Remove the .env file we copied
    rm .env
)