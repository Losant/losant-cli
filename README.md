# Losant CLI

## `losant`

### Description

Losant CLI is a command line tool to aid developers while creating custom application on top of the Losant Platform

### Usage: 

```
losant [options] [command]
```

#### Options

```
  -V, --version  output the version number
  -h, --help     output usage information
```

#### Commands

```
  configure   Configure the command line tool
  views       Manage experience views
  help [cmd]  display help for [cmd]
```

## `losant-configure`

### Description

Configure the command line tool options.

### Usage: 

```
losant-configure [options]
```

#### Options

```
  -a, --app <id>       set the application id
  -t, --token <token>  set the api token
  -c, --config <file>  config file to run the command with. (default: "losant.yml")
  -d, --dir <dir>      directory to run the command in. (default: current directory)
  -h, --help           output usage information
```

## `losant-views`

### Description

Manage Losant Experience Views from the command line.

### Usage: 

```
losant-views [options]
```

#### Options

```
  -h, --help           output usage information
```

#### Commands

```
  download [options] [pattern]
  upload [options] [pattern]
  status [options]
```

#### Examples

Download all views
```
$ losant views download
```

Download component views

```
$ losant views download components/*
```

Force a download of all views overwriting local modifications

```
$ losant views download -f
```

Check local modification status

```
$ losant views status
```

Check remote modification status

```
$ losant views status -r
```

Upload all view

```
$ losant views upload
```

Upload component view

```
$ losant views upload components/*
```

Force an upload of all views overwriting remote modifications

```
$ losant views upload -f
```