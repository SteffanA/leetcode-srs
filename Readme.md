TODO: Update markdown/finish setup instructions
***
LeetCode SRS
***

This is a web application designed to provide Spaced Repetition Studying
for LeetCode problems.  Spaced repetition studying works by showing you the same
problem multiple times over different periods of time, ensuring that you don't
repeat the same problem too many times, while also ensuring you re-visit a 
problem right before you may forget how to approach it.

**
How To Run/Develop
**

*
Background info
*
This project has been built with ease of development in mind, and relies
highly on Docker for deployment.

There are 3 core parts to this project:
 - the "leetcode-srs" client built on ReactJS,
 - the "server" backend server built on MongoDB and Express
 - the nginx proxy used when hosting the deployed site

All of these parts work in tandem together and are linked via the root level
docker-compose.yml file.  This compose file spins up a MongoDB database, the server,
the client, and the nginx proxy containers.

*
First steps
*
In this project are two .env.sample files listing all the environmental
variables to be defined.  As a first step, please copy these sample files in a 
new .env file in the same root location as the .sample file, and fill in the variables
with appropriate data.

*
Running
*

Next, enter both the leetcode-srs and the server folders, and in each run the
"npm install" command to fetch and install all the dependencies for this project.

To run the client alone, enter the leetcode-srs folder and run "npm run start"

To run the server alone, enter the server folder and run "npm run start"

To run both the server and client simultaneously, run "npm run dev"