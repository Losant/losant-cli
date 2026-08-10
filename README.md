# Losant CLI

[![Run Tests](https://github.com/Losant/losant-cli/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/Losant/losant-cli/actions/workflows/test.yml) [![npm version](https://badge.fury.io/js/losant-cli.svg)](https://badge.fury.io/js/losant-cli)

## Description

[Losant CLI](https://docs.losant.com/cli/overview) is a command line tool to help manage your [Losant Application](https://docs.losant.com/applications/overview/) and its resources.
It easily lets you manage [Experience Views](https://docs.losant.com/experiences/views/), [Experience Versions](https://docs.losant.com/experiences/versions/), [Files](https://docs.losant.com/applications/files/), and [Data Tables](https://docs.losant.com/data-tables/overview/) in your Applications.

## Installation

The CLI requires [Node.js](https://nodejs.org/en/) version 22 or higher. The latest stable version is available in NPM and can be installed using:

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

Before you run any other commands, authenticate with your Losant account using `losant login` or `losant set-token`. Both store credentials on your computer, and both accept a `LOSANT_API_URL` environment variable (default `https://api.losant.com`) to target a specific Losant installation, e.g. `LOSANT_API_URL=<api.private.install> losant login`. If you're logged in to multiple installations, `losant configure` asks which one to use for a given directory; every later request for that application uses the same API URL.

### Login

`losant login` checks whether your account is linked to a Single Sign-On (SSO) provider: if so, it prompts for a User Token; otherwise it prompts for your Losant password (and, if enabled, your multi-factor code).

### Set-token

`losant set-token` is an alternative for accounts linked to an SSO provider. Give it a token and it verifies that token against the API before storing it.

### Configure

The `losant configure` command configures and links the current directory to one of your Losant Applications, adding these directories so the CLI can detect files, experience views, and data tables you want to sync:

* **experience/components**, **experience/layouts**, **experience/pages** — your Experience views, broken out by type. For example, add a new component under `experience/components`, or remove a page by deleting it from `experience/pages`.
* **files/** — mirrors the directory structure and files in your Losant Application's Files.
* **dataTables/** — your Losant Application's data tables, stored as CSV files.

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

* Download all experience views (components, layouts, and pages)  
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

Copyright (c) 2023 Losant IoT, Inc

<https://www.losant.com>
