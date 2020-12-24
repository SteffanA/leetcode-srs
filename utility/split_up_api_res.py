'''
Super small helper script to take the results of a copy-pasted API result from the 
LeetCode API page and make it more human-readable with newlines before each new problem.
'''
import sys, re
if __name__ == '__main__':
    if (len(sys.argv) < 2):
        print('Need to provide file to clean up.')
        exit(1)
    file_path = sys.argv[1]

    with open(file_path, 'r+') as f:
        contents = f.read()
        # Add a newline before the start of the problem contents
        contents = re.sub(r'"stat_status_pairs":', r'"stat_status_pairs":\n', contents)
        # Add a newline before each new problem stat
        contents = re.sub(r'{"stat":', r'\n{"stat":', contents)
        # Write out our resulting contents
        f.seek(0)
        f.write(contents)
        f.truncate()