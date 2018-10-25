""" marvel_config.py
Custom Splunk endpoint, used to facilitate app setup process
"""
import common
import splunk.admin as admin

"""
Copyright (C) 2005 - 2010 Splunk Inc. All Rights Reserved.
Description:  This skeleton python script handles the parameters in the configuration page.

      handleList method: lists configurable parameters in the configuration page
      corresponds to handleractions = list in restmap.conf

      handleEdit method: controls the parameters and saves the values
      corresponds to handleractions = edit in restmap.conf

"""


class MarvelConfig(admin.MConfigHandler):
    """ MarvelConfig config handler"""

    def setup(self):
        """
        Placeholder; does nothing
        :return:
        """
        return

    def handleList(self, confInfo):
        """Handle list function"""
        public_key, private_key = common.get_credentials(self.getSessionKey())

        if public_key is not None:
            public_key = "<encrypted>"
        if private_key is not None:
            private_key = "<encrypted>"

        confInfo['config']['public_key'] = public_key
        confInfo['config']['private_key'] = private_key

    def handleEdit(self, confInfo):
        """Handle edit function"""
        return


admin.init(MarvelConfig, admin.CONTEXT_NONE)
