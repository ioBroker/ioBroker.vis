/**
 *
 *      iobroker vis Adapter
 *
 *      (c) 2014-2015 bluefox, hobbyquaker
 *
 *      CC-NC-BY 4.0 License
 *
 */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils          = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter        = utils.adapter('vis');
var fs             = require('fs');
var path           = require('path');
var syncWidgetSets = require(__dirname + '/lib/install.js');

adapter.on('ready', function () {
    main();
});

function writeFile(fileName, callback) {
    var config = require(__dirname + '/www/js/config.js').config;
    var index  = fs.readFileSync(__dirname + '/www/' + fileName).toString();

    // enable cache
    index = index.replace('<!--html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html"-->',
        '<html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html">');

    var begin = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - BEGIN ------------------------------------------- -->';
    var end   = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - END   ------------------------------------------- -->';
    var bigInsert = '';
    for (var w in config.widgetSets) {
        var file;
        var name;

        if (typeof config.widgetSets[w] == 'object') {
            name = config.widgetSets[w].name + '.html';
        } else {
            name = config.widgetSets[w] + '.html';
        }
        file = fs.readFileSync(__dirname + '/www/widgets/' + name);
        bigInsert += '<!-- --------------' + name + '--- START -->\n' + file.toString() + '\n<!-- --------------' + name + '--- END -->\n';
    }
    var pos = index.indexOf(begin);
    if (pos != -1) {
        var start = index.substring(0, pos + begin.length);
        pos = index.indexOf(end);
        if (pos != -1) {
            var _end = index.substring(pos);
            index    = start + '\n' + bigInsert + '\n' + _end;
            var original = start + '\n' + _end;
            original = original.replace('<html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html">',
                '<!--html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html"-->');
            adapter.readFile('vis', fileName, function (err, data) {
                if (data && data != index) {
                    fs.writeFileSync(__dirname + '/www/' + fileName + '.original', original);
                    fs.writeFileSync(__dirname + '/www/' + fileName, index);
                    adapter.writeFile('vis', fileName, index, function () {
                        if (callback) callback(true);
                    });
                } else {
                    if (callback) callback(false);
                }
            });
        } else if (callback) {
            callback(false);
        }
    } else if (callback) {
        callback(false);
    }
}

function upload(callback) {
    adapter.log.info('Upload ' + adapter.name + ' anew, while changes detected...');
    var file = utils.controllerDir + '/lib/setup.js';

    var child = require('child_process').spawn('node', [file, 'upload', adapter.name, 'widgets']);
    var count = 0;
    child.stdout.on('data', function (data) {
        count++;
        adapter.log.debug(data.toString().replace('\n', ''));
        if ((count % 100) === 0) adapter.log.info(count + ' files uploaded...');
    });
    child.stderr.on('data', function (data) {
        adapter.log.error(data.toString().replace('\n', ''));
    });
    child.on('exit', function (exitCode) {
        adapter.log.info('Uploaded.');
        callback(exitCode);
    });
}

// Update index.html
function checkFiles(configChanged) {
    writeFile('index.html', function (indexChanged) {
        // Update edit.html
        writeFile('edit.html', function (editChanged) {
            if (indexChanged || editChanged || configChanged) {
                adapter.log.info('Changes in index.html detected => update cache.manifest');
                var data = fs.readFileSync(__dirname + '/www/cache.manifest').toString();
                var build = data.match(/# dev build ([0-9]+)/);
                data = data.replace(/# dev build [0-9]+/, '# dev build ' + (parseInt(build[1] || 0, 10) + 1));
                fs.writeFileSync(__dirname + '/www/cache.manifest', data);

                adapter.writeFile('vis', 'cache.manifest', data, function () {
                    upload(function () {
                        adapter.stop();
                    });
                });
            } else {
                adapter.stop();
            }
        });
    });
}

function main() {
    var changed = syncWidgetSets();
    var count = 0;

    if (changed) {
        // upload config.js
        count++;
        var config = changed;
        adapter.readFile('vis', 'js/config.js', function (err, data) {
            if (data && data != config) {
                adapter.log.info('config.js changed. Upload.');
                adapter.writeFile('vis', 'js/config.js', config, function () {
                    if (!(--count)) checkFiles(changed);
                });
            } else {
                if (!(--count)) checkFiles(changed);
            }
        });
        changed = true;
    }

    // create command variable
    count++;
    adapter.getObject('command', function (err, obj) {
        if (!obj) {
            adapter.setObject('command', {
                common: {
                    name: 'Command interface for vis',
                    type: 'object',
                    desc: 'Write object: {instance: "FFFFFFFFF", command: "changeView", data: "ViewName"} to change the view',
                    role: 'command'
                },
                type: 'state',
                native: {}
            }, function () {
                if (!--count) checkFiles(changed);
            }) ;
        } else {
            if (!--count) checkFiles(changed);
        }
    });

    // Create common user CSS file
    count++;
    adapter.readFile('vis', 'css/vis-common-user.css', function (err, data) {
        if (err || data === null || data === undefined) {
            adapter.writeFile('vis', 'css/vis-common-user.css', '', function () {
                if (!--count) checkFiles(changed);
            });
        } else {
            if (!--count) checkFiles(changed);
        }
    });
}