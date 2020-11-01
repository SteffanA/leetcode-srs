'''
This takes the results of the LeetCode api page and transforms it into the data we want

Assumes that the results of the standard LC api are stored in this folder as apiresults.json

This helper script may or may not work depending on if LC changes their API structure.
TODO: Have the last updated date auto-update on call?
Last tested: 2/16/2020
Last updated: 2/16/2020
'''
from requests import post # For sending request to backend
import json # For converting from/to JSON
from dotenv import load_dotenv # For getting environmental variables from .env file
from os import getenv # For getting environmental variables

# DEFERRED: Maybe make this get the JSON through a call to LC api directly vs a file w/ results
class helper:
    def __init__(self):
        # Setup environmental variables
        env_path = '../server/.env'
        load_dotenv(dotenv_path=env_path)

    '''
    Take a block of JSON and convert it into a smaller block with:
        id
        name
        link
        difficulty
        premium status

    We can also add problem text - for now a simple "No text yet."
    '''
    def convert_block(self, info_block):
        if not info_block:
            print('No block passed')
            return
        # info contains a block of 'stat'
        stats = info_block['stat']
        convert = {
            'id': stats['question_id'],
            'name': stats['question__title'],
            'link': stats['question__title_slug'],
            'difficulty': info_block['difficulty']['level'],
            'is_premium': info_block['paid_only'],
            'problem_text': 'No text yet.',
        }
        return json.dumps(convert)

    '''
    Parse the provided JSON file from the LeetCode API and POST
    the parsed results into our backend
    '''
    def parse(self, file_location):
        if not file_location:
            print('No file passed.')
            return
        with open(file_location, 'r') as file:
            asJson = json.load(file)
            question_info = asJson['stat_status_pairs']
            if not question_info:
                print('No question info found in file')
                return
            # Get a login token for the admin user
            admin_email = getenv('ADMIN_EMAIL')
            admin_pass = getenv('ADMIN_PASS')
            login_url = getenv('LOGIN_URL')
            body = json.dumps({
                'email': admin_email,
                'password': admin_pass
            })
            # Get auth user token.
            headers = {
                'Content-Type': 'application/json'
            }
            login_res = post(url=login_url, headers=headers, data=body).json()
            if not login_res.get('token', None):
                print('No token receieved. Wrong credentials?')
                return
            token = login_res['token']

            # Setup url and headers for POSTing a new problem
            post_url= getenv('POST_URL')
            headers = {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }
            # Question info contains an array of blocks of information for each question
            for info in question_info:
                # Convert block to info we need
                converted_block = self.convert_block(info)
                # print(str(converted_block))
                if not converted_block:
                    print('Failed to convert info')
                else:
                    # Post to server
                    prob_add_res = post(url=post_url, headers=headers, data=converted_block).json()
                    if prob_add_res.get('errors', None):
                        # Some kind of error.
                        print('Errors when adding problem ' + str(info['stat']['question_id']))
                        print(str(prob_add_res['errors']))

# Create our helper and parse
helper = helper()
helper.parse(r'apiresults.json')