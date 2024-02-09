# Losant CLI Changelog

## Losant CLI v1.3.3

### Fixed

* Fixing race condition on watch when saving the same file multiple times before the watch queue is processed.

--

## Losant CLI v1.3.2

### Changed

* Updating commands to quit early if no meta configuration file is found.
* Upload command uploads in a specific order to remove any resources needed first and then add or update any resources needed.
* Upgrade default version of Node to 18.18.2
* Upgrade various dependencies
* Dropping support for Node 14.

--

## Losant CLI v1.3.1

### Changed

* Rotating rollbar key

--

## Losant CLI v1.3.0

### Added

* new `--reset` option on `experience download` which will remove all files from your experience directory and then download all experience files from the application.

### Changed

* Upgraded various dependencies.
* Adding version 20 to travis.

### Fixed

* Ensure the path delimiter is what the losant API expects when uploading new files in nested directories.
* Fixing the path pattern properly match on any either Mac/Linux or Windows.

--

## Losant CLI v1.2.3

### Added

* Set token command (`losant set-token`)

### Changed

* Updated `losant login` command to prompt for a User Token when an email is linked to a Single Sign-On provider.
* Updated the losant-rest client version

--

## Losant CLI v1.2.2

### Fixed

* sanitizing experience file names

--

## Losant CLI v1.2.1

### Fixed

* watch command now has a queueing process incase you have slow internet or a lot of changes at once.

--

## Losant CLI v1.2.0

### Added

* Data Tables export command (`losant datatable export`)

### Fixed

* sanitizing file names

--

## Losant CLI v1.1.1

### Fixed

* locking down client API version.
* now properly scoping the user token.

--

## Losant CLI v1.1.0

### Added

* Experience layout command (`losant experience layout [page]`)
* Experience bootstrap command (`losant experience bootstrap`)

### Fixed

* Ensuring lock file unlocks when closing the watcher
* Actually generating folder structure on configure

--
