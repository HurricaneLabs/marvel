""" common.py

Common functions

"""
import splunk.entity as entity


def get_credentials(session_key):
    """
    :param session_key:
    :return: public_key, private_key
    """
    myapp = 'marvel'
    try:
        # list all credentials
        entities = entity.getEntities(
            ['admin', 'passwords'], namespace=myapp, owner='nobody', sessionKey=session_key
        )
    except Exception as unknown_exception:
        raise Exception("Could not get %s credentials from splunk. "
                        "Error: %s"
                        % (myapp, str(unknown_exception)))

    # grab first set of credentials
    public_key = None
    private_key = None
    if entities:
        for stanza in entities.values():
            if stanza['eai:acl']['app'] == myapp:
                if stanza['username'] == 'public_key':
                    public_key = stanza['clear_password']
                if stanza['username'] == 'private_key':
                    private_key = stanza['clear_password']

        return public_key, private_key
    else:
        return public_key, private_key
