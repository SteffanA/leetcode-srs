'''
Last Run: 12/03/2020
Last Updated: 12/03/2020

This takes the results of the LeetCode api page and transforms it into the data we want
This helper script may or may not work depending on if LC changes their API structure.
'''
from requests import post, get # For sending request to backend
import json # For converting from/to JSON
from dotenv import load_dotenv # For getting environmental variables from .env file
import os # For getting path info of this file and env variables
import re # For matching for last run/updated
from datetime import date # For getting the current date

class helper:
    def __init__(self):
        # Setup environmental variables
        cur_dir_path = os.path.normpath(os.path.dirname(os.path.abspath(__file__)))
        env_path = os.path.normpath(os.path.join(cur_dir_path, os.path.normpath('../.env')))
        load_dotenv(dotenv_path=env_path)

    '''
    Updates the header of this file's last run and last updated
    blocks.  This relies on the assumption that Last run: and Last updated:'s
    first matches are at the top of the file.
    '''
    def update_header_dates(self, last_run_only: bool = False):
        with open(__file__, 'r+') as f:
            # Find the 'Last Run' and 'Last Updated' blocks
            contents = f.read()
            today = date.today()
            cur_date_string = today.strftime("%m/%d/%Y")
            last_run_regex = r'Last Run: \d+/\d+/\d+'
            last_run = re.search(last_run_regex, contents)
            if not last_run:
                print('Couldn\'t find last run string to edit.')
            else:
                contents = re.sub(last_run_regex, 'Last Run: ' + cur_date_string, contents, 1)
            if not last_run_only:
                last_updated_regex = r'Last Updated: \d+/\d+/\d+'
                last_updated = re.search(last_updated_regex, contents)
                if not last_updated:
                    print('Couldn\'t find last updated string to edit.')
                else:
                    contents = re.sub(last_updated_regex, 'Last Updated: ' + cur_date_string, contents, 1)
            f.seek(0)
            f.write(contents)
            f.truncate()
        # Finished editing the file

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
        return convert
        # return json.dumps(convert)

    '''
    Parse the results from the LeetCode API, which we either
    gather from a GET request or we can parse a provided file.
    POST the results via our running server instance into our DB.
    '''
    def parse(self, file_location: str = None):
        lc_url = 'https://leetcode.com/api/problems/algorithms/'
        question_info = None
        if not file_location:
            print('No file passed, grabbing info directly')
            lc_res = get(url=lc_url).json()
            question_info = None
            try:
                question_info = lc_res.get('stat_status_pairs', None)
            except Exception:
                print('Could not retrieve question info from LC')
                self.update_header_dates(True)
                raise
                exit(1)
        else:
            with open(file_location, 'r') as file:
                asJson = json.load(file)
                question_info = asJson.get('stat_status_pairs', None)
        if question_info:
            # Define our server URL endpoints here:
            base_server_url = os.getenv('SERVER_BASE_URL')
            server_port = os.getenv('SERVER_PORT')
            server_url = base_server_url + ':' + server_port

            problem_post_url = server_url + '/api/problems/bulk'
            problem_get_url = server_url + '/api/problems'
            login_url = server_url + '/api/auth'
            register_url = server_url+ '/api/users'

            # Get a login token for the admin user
            admin_email = os.getenv('ADMIN_EMAIL')
            admin_pass = os.getenv('ADMIN_PASS')
            admin_name = os.getenv('ADMIN_NAME')

            body = json.dumps({
                'name': admin_name,
                'email': admin_email,
                'password': admin_pass
            })
            headers = {
                'Content-Type': 'application/json'
            }

            # Try to register the user first, in case of first time setup
            register_res = None
            token = None 
            try:
                register_res = post(url=register_url, headers=headers, data=body).json()
                if register_res.get('token', False):
                    token = register_res.get('token')
            except Exception:
                print('Unable to register user.')
                print(register_url)
                print(headers)
                # print(body)
                self.update_header_dates(True)
                raise
                exit(1)

            # Get auth user token if register didn't provide it
            if not token:
                login_res = None
                try:
                    login_res = post(url=login_url, headers=headers, data=body).json()
                except Exception:
                    print('Unable to login to server.')
                    print(login_url)
                    print(headers)
                    # print(body)
                    self.update_header_dates(True)
                    raise
                    exit(1)
                if not login_res.get('token', None):
                    print('No token receieved. Wrong credentials?')
                    self.update_header_dates(True)
                    exit(1)
                token = login_res['token']


            # Setup headers for POSTing a new problem and GETing our cur problems
            headers = {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            }

            # Get all problems currently in the database
            all_probs_res = None
            try:
                all_probs_res = get(url=problem_get_url, headers=headers).json()
            except Exception:
                print('Couldn\'t get all problems from the server.')
                print(problem_get_url)
                print(headers)
                self.update_header_dates(True)
                raise
                exit(1)
            # All we really care about is the 'id' values for the problems
            existing_problem_ids = set()
            for prob in all_probs_res:
                lc_id = prob.get('id', None)
                existing_problem_ids.add(lc_id)

            blocks = []
            # print(question_info[:100])
            # Question info contains an array of blocks of information for each question
            for info in question_info:
                # Convert block to info we need if it's not already in our DB
                cur_id = info.get('stat', {}).get('question_id', None)
                if cur_id and cur_id not in existing_problem_ids:
                    # Convert and add to blocks to POST
                    converted_block = self.convert_block(info)
                    if not converted_block:
                        print('Failed to convert info')
                    else:
                        blocks.append(converted_block)
            blocks_as_dict = {"problems" : blocks}
            # Convert to JSON so we can POST it to the DB
            blocks_as_json = json.dumps(blocks_as_dict)
            # POST to server
            prob_add_res = None
            try:
                prob_add_res = post(url=problem_post_url, headers=headers, data=blocks_as_json).json()
            except Exception:
                print('Unable to POST problems to server.')
                print(problem_post_url)
                print(headers)
                self.update_header_dates(True)
                raise
                exit(1)
            print(prob_add_res)
            if prob_add_res.get('errors', None):
                # Some kind of error.
                print('Errors when adding problems in bulk.')
                print(str(prob_add_res['errors']))
                self.update_header_dates(True)
                exit(1)
            # Update the last run/last tested dates
            self.update_header_dates()
        else:
            print('No question info could be gathered.')
            # Update the last run, but not the last tested date
            self.update_header_dates(True)

# Create our helper and parse
helper = helper()
# helper.parse(r'apiresults.json')
helper.parse()
