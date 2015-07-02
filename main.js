/**
 *
 *      ioBroker vis Adapter
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

    var index = fs.readFileSync(__dirname + '/www/' + fileName).toString();
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
            index = start + '\n' + bigInsert + '\n' + _end;
            adapter.readFile('vis', fileName, function (err, data) {
                if (data && data != index) {
                    adapter.writeFile('vis', fileName, index);
                    if (callback) callback(true);
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
    var cp = require('child_process');
    var file = utils.controllerDir + '/lib/setup.js';
    var pid = cp.fork(file, 'upload ' + adapter.name);
    pid.on('exit', function () {
        adapter.log.info('Uploaded.');
        if (callback) callback();
    });
}

// Update index.html
function checkFiles(changed) {
    writeFile('index.html', function (isChanged1) {
        // Update edit.html
        writeFile('edit.html', function (isChanged2) {
            if (isChanged1 || isChanged2) {
                adapter.log.info('Changes in index.html detected => update cache.manifest');
                // update cache.manifest if changes detected
                adapter.readFile('vis', 'cache.manifest', function (err, data) {
                    data = data.toString();
                    var build = data.match(/# dev build ([0-9]+)/);
                    data = data.replace(/# dev build [0-9]+/, '# dev build ' + (parseInt(build[1] || 0, 10) + 1));
                    adapter.writeFile('vis', 'cache.manifest', data, function () {
                        upload(function () {
                            adapter.stop();
                        });
                    });
                });
            } else if (changed) {
                upload(function () {
                    adapter.stop();
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
                if (!(--count)) checkFiles(changed);
            }) ;
        } else {
            if (!(--count)) checkFiles(changed);
        }
    });

    // Create common user CSS file
    count++;
    adapter.readFile('vis', 'css/vis-common-user.css', function (err, data) {
        if (err || data === null || data === undefined) {
            adapter.writeFile('vis', 'css/vis-common-user.css', '', function () {
                if (!(--count)) checkFiles(changed);
            });
        } else {
            if (!(--count)) checkFiles(changed);
        }
    });
}