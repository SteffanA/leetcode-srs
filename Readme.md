
## LeetCode SRS

 

This is a web application designed to provide Spaced Repetition Studying

for LeetCode problems.  Spaced repetition studying works by showing you the same

problem multiple times over different periods of time, ensuring that you don't

repeat the same problem too many times, while also ensuring you re-visit a

problem right before you may forget how to approach it.  [This project is currently live on my website.](http://lcs.steffan.duckdns.org/)

 

**How to Use**

* First, make an account by clicking the login/register page on the navigation bar.

You will be redirected to the main page, where you will be prompted to visit the manage lists page, which you can access from the prompt or by selecting Manage Lists in the navigation bar.

* From here, create a new list, as either public or private (explained below).

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
 - [Docker](https://www.docker.com/get-started)
 - [Docker-Compose](https://docs.docker.com/compose/install/)

Soft Requirements:
 - [Python3](https://www.python.org/downloads/)

 

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

TBD

#

**WIP Features**

Making the site less ugly :)

Addition of problem text for all problems, and the ability to search problems via said problem text.

Ability to mark what language your submitted code is in, and see your submitted results with correct code highlighting.

Fully automated testing of both the Express server and React frontend.

> For now, testing of APIs is done with Postman, and a selection of test cases have been exported for your use (after some adjustment).

 

Conversion to TypeScript

Automated refreshing of problem information from LeetCode

 

#

**Feedback**

Any feature suggestions, documentation suggestions, or overall feedback is welcomed - feel free to open an issue on this repo.
