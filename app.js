"use strict";
var mediaData = require("./oldData");
var MediaCenterMigrator = require("./converterScript");
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  MediaCenterMigrator.convert(mediaData, function (list) {
    res.send(list);
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Converter app listening at http://%s:%s', host, port);
});
