""" common.py

Common functions used across both inputs.

"""
import datetime
import logging
import re
import sys
import splunk.entity as entity
import splunk.rest


def get_session_key():
    """
    Grabs session key from first line of stdin
    :return: session_key
    """
    first_line = sys.stdin.readline().strip()
    session_key = re.sub(r'sessionKey=', "", first_line)
    if session_key is None or session_key == "":
        sys.stderr.write("Please provide a session key for this input to work properly\n")
        sys.exit(0)
    else:
        return session_key


def get_credentials(session_key):
    """
    :param session_key:
    :return: API Key
    """
    myapp = 'marvel'
    try:
        # list all credentials
        entities = entity.getEntities(
            ['admin', 'passwords'], namespace=myapp, owner='nobody', sessionKey=session_key
        )
    except Exception as unknown_exception:
        raise Exception("Could not get %s credentials from splunk. Error: %s"
                        % (myapp, str(unknown_exception)))

    # grab first set of credentials
    public_key = None
    private_key = None
    if entities:  # pylint: disable=no-else-return
        for stanza in entities.values():
            if stanza['eai:acl']['app'] == myapp:
                if stanza['username'] == 'public_key':
                    public_key = stanza['clear_password']
                if stanza['username'] == 'private_key':
                    private_key = stanza['clear_password']

        return public_key, private_key
    else:
        message = "No credentials have been found. Please retrieve them from api.marvel.com."
        make_error_message(message, session_key, 'common.py')
        return public_key, private_key



def make_error_message(message, session_key, filename):
    """
    Generates Splunk Error Message
    :param message:
    :param session_key:
    :param filename:
    :return: error message
    """
    logging.error(message)
    splunk.rest.simpleRequest(
        '/services/messages/new',
        postargs={'name': 'Marvel App for Splunk', 'value': '%s - %s' % (filename, message),
                  'severity': 'error'}, method='POST', sessionKey=session_key
    )

def newer_timestamp(checkpoint, timestamp):
    """ Check if timestamp is newer """
    checkpoint = checkpoint.split('T')[0]
    timestamp = timestamp.split('T')[0]
    checkpoint_dt = datetime.datetime.strptime(checkpoint, '%Y-%m-%d')
    timestamp_dt = datetime.datetime.strptime(timestamp, '%Y-%m-%d')
    return bool(timestamp_dt > checkpoint_dt)
