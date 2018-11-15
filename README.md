# Losant CLI

[![Build Status](https://travis-ci.org/Losant/losant-cli.svg?branch=master)](https://travis-ci.org/Losant/losant-cli) [![npm version](https://badge.fury.io/js/losant-cli.svg)](https://badge.fury.io/js/losant-cli)

## Description

Losant CLI is a command line tool to help manage your [Losant Application](https://docs.losant.com/applications/overview/) and its resources.
It easily lets you manage [Experience Views](https://docs.losant.com/experiences/views/), [Experience Versions](https://docs.losant.com/experiences/versions/), and [Files](https://docs.losant.com/applications/files/) in your Applications.

## Installation

The CLI requires [Node.js](https://nodejs.org/en/) version 8.3 or higher. The latest stable version is available in NPM and can be installed using:

```bash
npm install -g losant-cli
```

## Usage

```bash
losant [options] [command]
```

## Commands

* [login](#login)
* [configure](#configure)
* [experience](#experience)
* [files](#files)

### Login

Before you run any other commands, you will want to run `losant login` to authenticate with your Losant account.
This will ask for the email address and password (and optionally your 2 factor code) for your Losant account, and store
an authentication token on your computer.

### Configure

The `losant configure` command configures and links the current directory to one of your Losant Applications.

### Experience

The `losant experience` command is how you manage the Experience Views and Versions for a configured Application. It has the following subcommands:

* download
* status
* upload
* version
* watch

#### Experience Examples

* Download all experience views (components, layouts and pages)  
  `$ losant experience download`
* Download component views  
  `$ losant experience download --type components`
* Download component views with names that start with error  
  `$ losant experience download --type components error*`
* Force a download of all views overwriting local modifications  
  `$ losant experience download -f`
* Check status of all experience files  
  `$ losant experience status`
* Upload all experience views  
  `$ losant experience upload`
* Upload only component views  
  `$ losant experience upload --type components /*`
* List all of your current experience versions  
  `$ losant experience version`
* List all of your experience versions that match a pattern  
  `$ losant experience version -l v1.*`
* Create a new experience version  
  `$ losant experience version v1.0.0`
* Create a new experience version with a description  
  `$ losant experience version v1.0.1 -d "updated home page"`
* Watch your Experience while you make changes and have them automatically uploaded  
  `$ losant experience watch`

### Files

The `losant files` command is how you manage the files for a configured Application. It has the following subcommands:

* download
* status
* upload
* watch

#### Files Examples

* Download all files  
  `$ losant files download`
* Download files in images directory  
  `$ losant files download images/*`
* Force a download of all files overwriting local modifications  
  `$ losant files download -f`
* Check status of all experience files  
  `$ losant files status`
* Upload all files  
  `$ losant files upload`
* Upload files in images directory  
  `$ losant files upload images/*`
* Force an upload of all files overwriting remote modifications  
  `$ losant files upload -f`
* Watch your Files while you make changes and have them automatically uploaded  
  `$ losant files watch`

*****

Copyright (c) 2018 Losant IoT, Inc

<https://www.losant.com>