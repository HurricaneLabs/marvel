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


# Installation
- Once you place this app inside of Splunk's etc/app folder run `npm install` inside the bin/app folder to pull down
all the dependencies.
- Then restart Splunk


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


# Third-party software attributions/credits: #
## requirejs/text.js 2.0.15 ##
(https://github.com/requirejs/text) - MIT License

Copyright jQuery Foundation and other contributors, https://jquery.org/

This software consists of voluntary contributions made by many
individuals. For exact contribution history, see the revision history
available at https://github.com/requirejs/text

The following license applies to all parts of this software except as
documented below:

====

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.