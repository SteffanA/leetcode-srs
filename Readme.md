
## LeetCode SRS

 

This is a web application designed to provide Spaced Repetition Studying for LeetCode problems.  Spaced repetition studying works by showing you the same problem multiple times over different periods of time, ensuring that you don't repeat the same problem too many times, while also ensuring you re-visit a problem right before you may forget how to approach it.  [This project is currently live on my website.](https://lcs.steffan.duckdns.org/)

 

**How to Use**

* First, make an account by clicking the login/register page on the navigation bar.

You will be redirected to the main page, where you will be prompted to visit the manage lists page, which you can access from the prompt or by selecting Manage Lists in the navigation bar.

* From here, create a new list, which is private by default (explained below).

Your new list will auto-populate in the drop-down list selector, and new options will appear - the ability to edit your list, change the name, or set public (if created as a private list).

* Select Edit List, and the list editor will appear, where you can add/remove problems from your list.  By default, the first 50 LeetCode problems are shown, but you can search for problems based on their title.  Once you have added problems, click the Save Changes button.

* After your changes have been saved, return to the main page by clicking the 'LeetCode SRS' title on the top of the page, in the center of the navbar.

Two drop downs will appear - one for your lists, and one for the problems in your selected list.

* Problems in the drop down list will be color-coded based on when you should do them - problems "due" within the next 3 days are red, within the next week yellow, and after a week in green.

* After you have selected the problem you wish to attempt, click Start Problem.

* A LeetCode link will appear, and as that page loads, a form and a timer will also appear on the LeetCodeSRS site.  Once you complete your LeetCode problem, fill in the form with the results of your submission - whether you were successful or not, what your submitted code was, LeetCode's reported memory used and execution time, and the time you spent doing the problem.  The time spent can be auto-filled based on the state of the timer - click the "Finish Recording" button and the current time shown is auto-filled into the form.  If this sounds like too much work for you, don't worry - the only two fields required are the time spent and if you were successful or not.

* After you've filled the form to your satisfaction, click Submit, and the page will refresh, and the next problem to do will be automatically selected in the problem drop-down.

* After you have attempted some problems, you can go back and view your submissions for the problems you have done by visiting the "Submission History" link in the navbar. Once here, all problems that you have attempted (between all your lists) are presented, and you may view your submission results in table format, including your submitted code.

 

One final feature to note is that of public versus private lists - public lists are, as the name implies, public - anyone can see the list by name, and the problems contained within them.  They may only be edited by you, but a public list cannot be set back to private.  All public lists are visible via the 'View Public Lists' link on the navbar.  There, in addition to viewing the lists, users may also clone the list in its current state to their collection of private lists, where the user may edit it as they please.

#

**How To Run/Develop**

 

This project has been built with ease of development and deployment in mind, and relies highly on Docker (specifically docker-compose).

 

There are 3 core parts to this project:

- the "leetcode-srs" client built on ReactJS,

- the "server" backend server built on NodeJS using Express and Mongoose

- The database for this project, MongoDB

 

All of these parts work in tandem together and are linked via the root level

docker-compose.yml file.  This compose file spins up a MongoDB database, the server, the client, and the nginx container to expose the site to the wider internet.

Hard requirements to run are:
 - [NPM](https://nodejs.org/en/download/)
 > Note Node version 12 or higher is required due to the use of Object.fromEntries().  Ubuntu's repository at time of writing is v10, which does not have this function added.
 - [Docker](https://www.docker.com/get-started)
 - [Docker-Compose](https://docs.docker.com/compose/install/)

Soft Requirements:
 - [Python3](https://www.python.org/downloads/)


The recommended development environment would be to run the database modules via the command 'docker-compose up -d mongo mongo-express', and run the server and client seperately by using the 'npm run server' command in ./server and using 'npm run start' in ./leetcode-srs .
However, if you are developing only against the server or the client, you can add (respectively) 'server' or 'client' as an argument to the docker-compose.
It is recommended to always ignore the nginx container until deploying.

 

***First-Time Setup***

This project requires both NPM and Docker, and optionally Python3 for importing problem data into the database.  Once these are installed, first-time setup can be done in one of two ways:

 

*Semi-Automated Setup*

A shell script has been provided to automate much of the first time setup.  To use it, run "./configure.sh" from the root directory, and from there follow the prompts to install the npm modules, optionally fill in the .env files, and optionally pre-fill the database with LeetCode problems.  You may need to run this as sudo to install the required packages.  If running on Linux, remember
to "chmod +x configure.sh" to enable execution of the file!

 

*Manual Setup*

* After CDing into the leetcode-srs/ folder and server/ folder, run the "npm install" command to install all the npm module requirements.

* In this project are two .env.sample files listing all the environmental variables to be defined.  One exists in the root of the project, and the other in the root of the leetcode-srs/ ReactJS client.  As a first step, please copy these sample files in a new .env file in the same root location as the .sample file, and fill in the variables with appropriate data.

* The next step is to load the Problem data from LeetCode, for which there is a Python script provided in the utility/ folder, lcAPIparser.py.

* Before running the script, ensure your MongoDB database is live.  Assuming the environmental variables have been set in the prior step, running the MongoDB container is as simple as executing "docker-compose up mongo -d" at the root of the project.

* Once the MongoDB instance is running, CD into the utility/ folder to install the requirements for the script first by running "python -m pip install -r requirements.txt", then run the script itself with "python lcAPIparser.py" to automatically fill your database's Problems table with all problems LeetCode currently exposes.

              >If you wish to be more selective about what problems to import, the script can also be ran against a provided file containing JSON in the same format as the direct LeetCode API.  Don't worry about duplicate imports - both the Python script and backend server adding new problems to the MongoDB instance have checks against adding duplicate problems, so this script can be run as often as you'd like to check for newly added LeetCode problems.

 

***Development***

Complete the first time setup, then:

* To run the database, use "docker-compose up mongo -d".

* To run the React client alone, enter the leetcode-srs/ folder and run "npm run start"

* To run the Express server alone, enter the server/ folder and run "npm run start"

* To run both the Express server and React client simultaneously, enter the server/ folder and run "npm run dev"

              > Note: The concurrently module that the npm run dev script utilizes has personally been flaky for me, so if this fails, you will need to resort to running both separately.

#

***Deployment***

Deployment is simple - just fill in the .env files in the root and in ./leetcode-srs with valid credentials, then run 'docker-compose up -d' at the root, and you're up and running!

One known issue is that the nginx reverse proxy does not currently handle HTTPS versions of the server very well - it is recommended to have the server HTTPS environmental variable set to blank for the time being.

#

***Testing***

Note: Testing remains a WIP, and currently is only implemented for the server.

This project is setup for automated testing and code coverage results via the Mocha and NYC (Istanbul) projects.  If you have setup your environmental variable file, running the tests is simple and can be done in two ways:

*Automatic running*
 * At the root of the project, run ./test.sh.
 > Like the configuration, remember to "chmod +x test.sh" to run the script if on Linux.
 * Follow the prompt to decide if you just want to run tests, or would like to run tests and gather code coverage data.

*Manual running*
TODO: Need to determine if copying .env is required.
 * To manually run the server's tests:
 * Run "cp .env ./server/tests/.env" to copy the .env file from the root to the test folder (Windows only?)
 * Change to the ./server/tests directory from the root of the project.
 * Run "docker-compose up -d mongo" to bring up the temporary test MongoDB.
 > If you would like, running "docker-compose up -d" will also launch a MongoExpress instance for you to view the information in the database.
 * CD back one directory to ./server.
 * Ensure that the .env file at the root of the project has the TESTING variable set to 'true' or any non-falsey value.
 * To run tests alone, run "npm run test"
 * To run tests and collect coverage, run "npm run coverage"
 * CD back to the ./server/tests directory
 * Run "docker-compose down" to bring down your test database.

If you ran tests, the output will be in the command line.  If you ran coverage, your coverage results will be in ./server/coverage/lcov-report, where you can browse the results via the index.html web page.

Both tests and coverage can be run for specific subsections - for example, to run only Auth route tests, invoke the test.sh script as "./test.sh authTest", or for coverage invoke the coverage.sh script as "./coverage.sh authCoverage".  Likewise, if running manually, run the test as "npm run authTest" or coverage as "npm run authCoverage".

*Test Status:*
| Test           | Status       |
| :------------- | :----------: |
|  Server Tests | 87.2% coverage |
| > Auth Routes | 92% coverage - remaining is defensive |
| > Users Routes | 82% coverage - remaining is defensive |
| > Lists Routes | 87% coverage - remaining is defensive |
| > Problems Routes | 86% coverage - remaining is defensive |
| > ProblemStatuses Routes | 89% - remaining is defensive |
| > Submissions Routes | 91% - remaining is defensive |
| > Middleware | 100% |
|  React Frontend | TBD |

*Postman Tests*
A selection of manual Postman test cases has also been provided for your use.  There will be some tuning needed for the imported calls, mainly switching the endpoint of the api to whichever IP your server is hosted on.
#

***WIP Features***

Making the site less ugly :)

Addition of problem text for all problems, and the ability to search problems via said problem text.

Ability to mark what language your submitted code is in, and see your submitted results with correct code highlighting.

Fully automated testing of both the Express server and React frontend.

Conversion to TypeScript

Automated refreshing of problem information from LeetCode

 

#

***Feedback***

Any feature suggestions, documentation suggestions, or overall feedback is welcomed - feel free to open an issue on this repo.
