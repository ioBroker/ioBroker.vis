/**
 *
 *      iobroker vis Adapter
 *
 *      (c) 2014-2017 bluefox, hobbyquaker
 *
 *      CC-NC-BY 4.0 License
 *
 */
/* jshint -W097 */
/* jshint strict:false */
/* jslint node: true */
'use strict';

var adapterName    = require(__dirname + '/package.json').name.split('.').pop();
var isBeta         = adapterName.indexOf('beta') !== -1;

var utils          = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter        = utils.adapter(adapterName);
var fs             = require('fs');
var path           = require('path');
var syncWidgetSets = require(__dirname + '/lib/install.js');
var https          = require('https');
var jwt            = require('jsonwebtoken');
//var minify         = require('html-minifier').minify;

adapter.on('ready', function () {
    main();
});

function writeFile(fileName, callback) {
    var config = require(__dirname + '/www/js/config.js').config;
    var index;
    var srcFileNameParts = fileName.split('.');
    var ext = srcFileNameParts.pop();
    var srcFileName = srcFileNameParts.join('.') + '.src.' + ext;
    if (fs.existsSync(__dirname + '/www/' + srcFileName)) {
        index = fs.readFileSync(__dirname + '/www/' + srcFileName).toString();
    } else {
        index = fs.readFileSync(__dirname + '/www/' + fileName).toString();
        fs.writeFileSync(__dirname + '/www/' + srcFileName, index);
    }

    // enable cache
    index = index.replace('<!--html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html"--><html>',
        '<html manifest="cache.manifest" xmlns="http://www.w3.org/1999/html">');

    var begin = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - BEGIN ------------------------------------------- -->';
    var end   = '<!-- ---------------------------------------  DO NOT EDIT INSIDE THIS LINE - END   ------------------------------------------- -->';
    var bigInsert = '';
    for (var w in config.widgetSets) {
        if (!config.widgetSets.hasOwnProperty(w)) continue;
        var file;
        var name;

        if (typeof config.widgetSets[w] === 'object') {
            name = config.widgetSets[w].name + '.html';
        } else {
            name = config.widgetSets[w] + '.html';
        }
        file = fs.readFileSync(__dirname + '/www/widgets/' + name);
        // extract all css and js


        bigInsert += '<!-- --------------' + name + '--- START -->\n' + file.toString() + '\n<!-- --------------' + name + '--- END -->\n';
    }
    var pos = index.indexOf(begin);
    if (pos !== -1) {
        var start = index.substring(0, pos + begin.length);
        pos = index.indexOf(end);
        if (pos !== -1) {
            var _end = index.substring(pos);
            index    = start + '\n' + bigInsert + '\n' + _end;

            /*index = minify(index, {
                removeAttributeQuotes: true,
                removeComments: true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                decodeEntities: true,
                minifyCSS: true,
                minifyJS: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            });*/

            adapter.readFile(adapterName, fileName, function (err, data) {
                if (data && data !== index) {
                    fs.writeFileSync(__dirname + '/www/' + fileName, index);
                    adapter.writeFile(adapterName, fileName, index, function () {
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

function updateCacheManifest(callback) {
    adapter.log.info('Changes in index.html detected => update cache.manifest');
    var data = fs.readFileSync(__dirname + '/www/cache.manifest').toString();
    var build = data.match(/# dev build ([0-9]+)/);
    data = data.replace(/# dev build [0-9]+/, '# dev build ' + (parseInt(build[1] || 0, 10) + 1));
    fs.writeFileSync(__dirname + '/www/cache.manifest', data);

    adapter.writeFile(adapterName, 'cache.manifest', data, function () {
        callback && callback();
    });
}
// Update index.html
function checkFiles(configChanged, isBeta) {
    if (isBeta) {
        adapter.stop();
        return;
    }
    writeFile('index.html', function (indexChanged) {
        // Update edit.html
        writeFile('edit.html', function (editChanged) {
            if (indexChanged || editChanged || configChanged) {
                updateCacheManifest(function () {
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

function copyFiles(root, filesOrDirs, callback) {
    if (!filesOrDirs) {
        adapter.readDir('vis.0', root, function (err, filesOrDirs) {
            copyFiles(root, filesOrDirs || [], callback);
        });
        return;
    }
    if (!filesOrDirs.length) {
        if (typeof callback === 'function') callback();
        return;
    }

    var task = filesOrDirs.shift();
    if (task.isDir) {
        copyFiles(root + task.file + '/', null, function () {
            setTimeout(copyFiles, 0, root, filesOrDirs, callback);
        })
    } else {
        adapter.readFile('vis.0', root + task.file, function (err, data) {
            if (data || data === 0 || data === '') {
                adapter.writeFile(adapterName + '.0', root + task.file, data, function () {
                    setTimeout(copyFiles, 0, root, filesOrDirs, callback);
                });
            } else {
                setTimeout(copyFiles, 0, root, filesOrDirs, callback);
            }
        });
    }
}

function generatePages(isLicenseError) {
    var count = 0;
    var changed = false;

    if (!isBeta) {
        changed = syncWidgetSets(false, isLicenseError);

        if (changed) {
            // upload config.js
            count++;
            var config = changed;
            adapter.readFile(adapterName, 'js/config.js', function (err, data) {
                if (data && data !== config) {
                    adapter.log.info('config.js changed. Upload.');
                    adapter.writeFile(adapterName, 'js/config.js', config, function () {
                        if (!--count) checkFiles(changed, isBeta);
                    });
                } else {
                    if (!--count) checkFiles(changed, isBeta);
                }
            });
            changed = true;
        }
    } else {
        count++;
        // try to read vis-beta.0/files
        adapter.readDir(adapterName + '.0', '/', function (err, dirs) {
            if (!dirs || !dirs.length) {
                // copy all directories
                copyFiles('/', null, function () {
                    if (!--count) checkFiles(changed, isBeta);
                })
            } else {
                if (!--count) checkFiles(changed, isBeta);
            }
        });
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
                if (!--count) checkFiles(changed, isBeta);
            }) ;
        } else {
            if (!--count) checkFiles(changed, isBeta);
        }
    });

    // Create common user CSS file
    count++;
    adapter.readFile(adapterName, 'css/vis-common-user.css', function (err, data) {
        if (err || data === null || data === undefined) {
            adapter.writeFile(adapterName, 'css/vis-common-user.css', '', function () {
                if (!--count) checkFiles(changed, isBeta);
            });
        } else {
            if (!--count) checkFiles(changed, isBeta);
        }
    });
}

function indicateError(callback) {
    var data = fs.readFileSync(__dirname + '/www/js/config.js').toString();
    if (data.indexOf('license: false,') === -1) {
        data = data.replace('var visConfig = {', 'var visConfig = {license: false,');
        fs.writeFileSync(__dirname + '/www/js/config.js', data);

        adapter.writeFile(adapterName, 'js/config.js', data, function () {
            updateCacheManifest(callback);
        });
    } else {
        callback && callback();
    }
}

function main() {
    // first of all check license
    if (!adapter.config.license) {
        indicateError(function () {
            adapter.log.error('No license found for vis. Please get one on https://iobroker.net !');
            //adapter.stop();
            generatePages(true);
        });
    } else {
        // An object of options to indicate where to post to
        var postOptions = {
            host: 'iobroker.net',
            path: '/cert/',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(adapter.config.license)
            }
        };

        // Set up the request
        var postReq = https.request(postOptions, function (res) {
            res.setEncoding('utf8');
            var result = '';
            res.on('data', function (chunk) {
                result += chunk;
            });

            res.on('end', function () {
                try {
                    var data = JSON.parse(result);
                    if (data.result === 'OK') {
                        adapter.log.info('vis license is OK.');
                        generatePages();
                    } else {
                        indicateError(function () {
                            adapter.log.error('License is invalid! Nothing updated. Error: ' + (data ? data.result: 'unknown'));
                            //adapter.stop();
                            generatePages(true);
                        });
                    }
                } catch (e) {
                    indicateError(function () {
                        adapter.log.error('Cannot check license! Nothing updated. Error: ' + (data ? data.result: 'unknown'));
                        //adapter.stop();
                        generatePages(true);
                    });
                }
            });
        }).on('error', function (error) {
            jwt.verify(adapter.config.license, fs.readFileSync(__dirname + '/lib/cloudCert.crt'), function (err, decoded) {
                if (err) {
                    adapter.log.error('Cannot check license: ' + error);
                    //adapter.stop();
                    generatePages(true);
                } else {
                    if (decoded && decoded.expires * 1000 < new Date().getTime()) {
                        adapter.log.error('Cannot check license: Expired on ' + new Date(decoded.expires * 1000).toString());
                        adapter.stop();
                    } else if (!decoded) {
                        adapter.log.error('Cannot check license: License is empty');
                        //adapter.stop();
                        generatePages(true);
                    } else {
                        generatePages(false);
                    }
                }
            });
        });

        postReq.write(adapter.config.license);
        postReq.end();
    }
}