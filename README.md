# Losant CLI

[![Build Status](https://travis-ci.org/Losant/losant-cli.svg?branch=master)](https://travis-ci.org/Losant/losant-cli) [![npm version](https://badge.fury.io/js/losant-cli.svg)](https://badge.fury.io/js/losant-cli)

## Description

[Losant CLI](https://docs.losant.com/cli/overview) is a command line tool to help manage your [Losant Application](https://docs.losant.com/applications/overview/) and its resources.
It easily lets you manage [Experience Views](https://docs.losant.com/experiences/views/), [Experience Versions](https://docs.losant.com/experiences/versions/), [Files](https://docs.losant.com/applications/files/), and [Data Tables](https://docs.losant.com/data-tables/overview/) in your Applications.

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
* [set-token](#set-token)
* [configure](#configure)
* [experience](#experience)
* [files](#files)
* [datatables](#data-tables)

### Login

Before you run any other commands, you must run `losant login` to authenticate with your Losant account. This command checks to see if your account is linked to a Single Sign-On (SSO) provider. If so, the command will prompt for a User Token; otherwise it will prompt for the password (and optionally your two-factor code) for your Losant account. After either is given successfully, the command will store
the authentication token on your computer.

### Set-token

The set-token command, `losant set-token`, is an alternative way to log in for those users whose account is linked to a Single Sign-On (SSO) provider. This will take the given token, verify that token against the API, and then set it on your user configuration file.

### Configure

The `losant configure` command configures and links the current directory to one of your Losant Applications. Once you have configured you will notice a few new directories into your current directory. There will be the following directories added:

* experience/components
* experience/pages
* experience/layouts
* files/
* dataTables/

This is how the CLI will be able to detect new files, experience views, or data tables that you want to add, update or remove from your Losant Application. The files directory will contain and reflect the directory and files on your Losant Application's Files. Similarly, the dataTables directory will contain your Losant Application's data tables as csv files. and The experience directory is broken down by view type (components, layouts and pages), e.g. if you want to create a new component add this to your components directory, or if you want to remove a page, you will find that page located under experience/pages.

### Experience

The `losant experience` command is how you manage the Experience Views and Versions for a configured Application. It has the following subcommands:

* download
* status
* upload
* layout
* bootstrap
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
* Check status of all experience views  
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
* View all your experience pages with their layouts  
  `$ losant experience layout`
* View all of your experience pages that match this pattern with their layout  
  `$ losant experience layout -l v1.*`
* View all your experience pages with their layouts  
  `$ losant experience layout`
* To generate our standard experience starter views  
  `$ losant experience bootstrap`

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
* Check status of all files  
  `$ losant files status`
* Upload all files  
  `$ losant files upload`
* Upload files in images directory  
  `$ losant files upload images/*`
* Force an upload of all files overwriting remote modifications  
  `$ losant files upload -f`
* Watch your Files while you make changes and have them automatically uploaded  
  `$ losant files watch`

### Data Tables

The `losant datatables` command is how you manage the data tables for a configured Application. It has the following subcommands:

* export

#### Data Tables Examples

* Export all data tables  
  `$ losant datatables export`
* Export all data tables whose names start with `Chicago`  
  `$ losant datatables export Chicago`
* Force a export of all data tables overwriting local modifications  
  `$ losant datatables export -f`

*****

Copyright (c) 2019 Losant IoT, Inc

<https://www.losant.com>
