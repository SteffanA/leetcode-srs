# Docker file for hosting this server
FROM node:alpine

# Setup a working directory in the container
WORKDIR "./srv"
# copy the package file
COPY ./package.json ./
# Install the modules
RUN npm install
# Copy everything in the container
COPY . .
# Debug add bash
# RUN apk add --no-cache bash coreutils grep sed
# Start up the server
CMD ["npm", "run", "start"]