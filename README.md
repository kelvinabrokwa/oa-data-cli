# oa-data-cli

CLI for downloading OpenAddresses data

### To install

```
$ npm i oa-data-cli -g
```

### Usage
```
$ oa-data-cli <command> [options]
```
```
Commands and Options:
    
    ls                                 Show all available processed zips
    
    -h, --help                         Shows help

    -f, --file <name-of-source>        Download a specific source zips

    -c, --country <country_iso_2>      Download all CSVs for a country

    -a, --all                          Downloads all OpenAddresses zips (use with care)
```

### Examples

List files available for download

```
$ oa-data-cli ls
```

Download specific files. For multiple files, use a comma separated list (no spaces)

```
$ oa-data-cli --file pl-slaskie
$ oa-data-cli --file us-va-fairfax,us-va-greene
```

Download all files for a specific country (identified by the ISO-2 code). For multiple countries, use a comma separated list (no spaces)

```
$ oa-data-cli --country us
$ oa-data-cli --country pl,kr,za
```

Download all OpenAddresses CSVs

```
$ oa-data-cli -a 
```