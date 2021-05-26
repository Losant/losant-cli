# Losant CLI Changelog

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
