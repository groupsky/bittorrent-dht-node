#!/usr/bin/env node

var fs = require('fs');
var debounce = require('debounce');
var DHT = require('bittorrent-dht');
var dht = new DHT();
var config = require('./config');

fs.readFile(config.nodesStorage, function (err, data) {
  // we silently ignore error, as this most likely means we don't have a nodes file yet
  if (err) return;

  var nodes;
  try {
    nodes = JSON.parse(data);
    if (!Array.isArray(nodes)) throw new Error('Expected Array got '+(typeof nodes));
  } catch (err) {
    console.error('broken nodes file:', err);
    return;
  }

  nodes.forEach(function (node) {
    try {
      dht.addNode(node);
    } catch (err) {
      console.warn('invalid node', node, err);
    }
  });
});

var persistNodes = debounce(function(){
  var nodes = dht.toArray();
  fs.writeFile(config.nodesStorage, JSON.stringify(nodes), function(err) {
    if (err) {
      console.error('cannot store nodes list:', err);
      return;
    }
    console.info('saved', nodes.length, 'nodes');
  });
}, 1000);

dht.on('ready', function() {
  console.log('DHT node is bootstrapped with', dht.toArray().length, 'nodes');
});

dht.on('error', function(err) {
  console.error(err);
});

dht.on('node', function (node) {
  console.info('new node connected:', node);
  persistNodes();
});

dht.listen(config.port, function() {
  console.log('DHT node is running'+(config.port && 'on port '+config.port || ''));
});
