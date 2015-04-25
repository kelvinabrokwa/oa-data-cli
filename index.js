#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    request = require('request'),
    argv = require('minimist')(process.argv.slice(2));

var meta_cache = path.join('/tmp/', 'data.json');

if (argv._[0] === 'ls')
  ls();
else if (argv.f || argv.file)
  (argv.f || argv.file).split(',').forEach(function(f) { downloadFile(f); });
else if (argv.c || argv.country)
  (argv.c || argv.country).split(',').forEach(function(c) {downloadCountry(c); });
else if (argv.a || argv.all)
  downloadAll();
else
['\nUsage:',
  '    oa-data-cli <command> [options]\n',
  'Commands and Options:',
  '    ls                                 Show all available processed CSVs',
  '    -h, --help                         Usage information',
  '    -f, --file <name-of-source>        Download a specific source zip file',
  '    -c, --country <country_iso_2>      Download all zips for a country',
  '    -a, --all                          Downloads all OpenAddresses zips (use with caution)\n'].forEach(function(i) { console.error(i); });  

function fetchData(cb) {
  var url = 'http://data.openaddresses.io/runs/1429682917.812/state.txt';
  request(url, function(err, resp, txt) {
    if (err) throw err;
    
    var sources = txt.split('\n').map(function(row) {
      return row.split('\t').map(function(item) {
        return item.replace(/[\r\n]/g,'').trim();
      });
    }).filter(function(row) {
      return (row.length === 11) && (row[1]);
    });
    sources.shift();

    var output = {};

    sources.forEach(function(source) {
      var code = source[0].split('.')[0].split('-')[0];
      if (!(code in output))
        output[code] = [];
      output[code].push(source[0].split('.')[0]);
    });
    
    fs.writeFileSync(meta_cache, JSON.stringify(output, null, 2));
    cb(null);
  });
}

function ls() {
  if (!(fs.existsSync(meta_cache))) {
    fetchData(function() {
      ls();
    });
  } else {
    var log = JSON.parse(fs.readFileSync(meta_cache));
    for (var key in log) {
      for (var i in log[key]) {
        console.log(log[key][i]);
      }
    }
  }
}

function download(name) {
  var url = 'http://data.openaddresses.io.s3.amazonaws.com/' + name + '.zip';
  var file = fs.createWriteStream(name + '.zip');
  http.get(url, function(resp) {
    resp.pipe(file);
  }).on('error', function(e) {
    console.log('Unable to download ' + name + '\n', e);
  });
}

function downloadFile(file) {
  if (!(fs.existsSync(meta_cache))) {
    fetchData(function() {
      downloadFile(file);
    });
  } else {
    var all = JSON.parse(fs.readFileSync(meta_cache))[file.split('-')[0]];
    all.forEach(function(source) {
      if (source === file.trim()) {
        download(source);
      }
    });
  }
}

function downloadCountry(country) {
  if (!(fs.existsSync(meta_cache))) {
    fetchData(function() {
      downloadCountry(country);
    });
  } else {
    var log = JSON.parse(fs.readFileSync(meta_cache));
    log[country].forEach(function(file) { download(file); });
  }
}

function downloadAll() {
  if (!(fs.existsSync(meta_cache))) {
    fetchData(function() {
      downloadAll();
    });
  } else {
    var log = JSON.parse(fs.readFileSync(meta_cache));
    for (var key in log) {
      log[key].forEach(function(file) { download(file); });
    }    
  } 
}