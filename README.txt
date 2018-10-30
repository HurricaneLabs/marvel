Copyright 2018 Hurricane Labs


# Version Support #
7.2, 7.1, 7.0


# Marvel for Splunk #
- Comics are awesome and Splunk is awesome, so we've combined two awesome things into one! TOO MUCH POWER!
- The purpose of this app is to provide a comprehensive overview of how to build a Splunk app!


# Who is this app for? #
- Anyone who is awesome and loves comics and Splunk.
- Anyone who wants to build a cool Splunk app.


# How does the app work? #
- It pulls Marvel Comic character and comic book data from the Marvel API.


# Steps to use: #
- First, before using this app you will need to sign-up to a Marvel developer account here: https://developer.marvel.com/
- Once you've obtained your private and public keys, you will enter them into this app's setup page.
- Once your keys are added to the setup page then you can add new comics and characters using the prebuilt Modular Inputs
that ship with this app: Comics and Characters.
- In Splunk UI go to Settings < Data inputs. You should see two Marvel inputs provided: Marvel Characters and Marvel Comics
   - Add any valid Marvel Characters and/or comics
- Once you've added some characters and comics visit the app's dashboard to view the descriptions about specific characters
and comics that you've added via the Modular Inputs.
- Rinse and Repeat


### Example Search ###
The data is found in either the marvel_characters or marvel_comics sourcetypes e.g.:
sourcetype="marvel_characters" | table name, description


# Release Notes #
## v 1.0.0 ##
- Initial release.
- Comics and Characters dashboards
- Comics and Characters Modular Inputs


# Possible Issues #
- None found yet, but if you find anything let us know!


# For support #
- Send email to splunk-app@hurricanelabs.com
- Support is not guaranteed and will be provided on a best effort basis.