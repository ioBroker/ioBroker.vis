/**
 *
 *      ioBroker vis Adapter
 *
 *      (c) 2014-2015 bluefox
 *
 *      MIT License
 *
 */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils =   require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('vis');
var fs =      require('fs');
var path =    require('path');

adapter.on('ready', function () {
    main();
});

function copyFileSync(source, target) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.createReadStream(source).pipe(fs.createWriteStream(targetFile));
}

function copyFolderRecursiveSync(source, target) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach(function ( file ) {
            var curSource = path.join( source, file );
            if (fs.lstatSync( curSource ).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

function deleteFolderRecursive (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function(file, index){
            var curPath = path + '/' + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

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

var generic = [
    'bars',
    'basic',
    'colorpicker',
    'dev',
    'fancyswitch',
    'hqWidgets',
    'jqplot',
    'jqui',
    'jqui-mfd',
    'knob',
    'lcars',
    'plumb',
    'RGraph',
    'special',
    'swipe',
    'tabs',
    'timeAndWeather',
    'vkb',
    'weather-adapter',
    'weather'
];

var widgetSetsDependencies = {
    "fancyswitch":  ["basic"],
    "jqui":         ["basic"],
    "jqui-mfd":     ["basic", "jqui"],
    "lcars":        ["basic"]
};

function syncWidgetSets() {
    // find all installed widget sets
    var dirs = fs.readdirSync(__dirname + '../');
    var sets = [];
    for (var d = 0; d < dirs.length; d++) {
        if (dirs[d].match(/^iobroker\.vis\-/i)) {
            var pack = null;
            try {
                pack = JSON.parse(fs.readFileSync(__dirname + '../' + dirs[d] + '/io-package.json').toString());
            } catch (e) {
                adapter.log.warn('Cannot parse "' + __dirname + '../' + dirs[d] + '/io-package.json": ' + e);
            }
            sets.push({path: __dirname + '../' + dirs[d], name: dirs[d].toLowerCase(), pack: pack});
        }
    }
    try {
        dirs = fs.readdirSync(__dirname + '../../../');
        for (d = 0; d < dirs.length; d++) {
            if (dirs[d].match(/^iobroker\.vis\-/i)) {
                var found = false;
                var name = dirs[d].toLowerCase();
                for (var s = 0; s < sets.length; s++) {
                    if (sets[s].name == name) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var pack = null;
                    try {
                        pack = JSON.parse(fs.readFileSync(__dirname + '../../../' + dirs[d] + '/io-package.json').toString());
                    } catch (e) {
                        adapter.log.warn('Cannot parse "' + __dirname + '../../../' + dirs[d] + '/io-package.json": ' + e);
                    }
                    sets.push({path: __dirname + '../../../' + dirs[d], name: dirs[d].toLowerCase()});
                }
            }
        }
    } catch (e) {

    }

    // Now we have the list of widgets => copy them all to widgets directory
    for (d = 0; d < sets.length; d++) {
        copyFolderRecursiveSync(sets[d].path + '/www/widgets/', __dirname + '/widgets/');
    }
    var widgetSets = [];

    // Read the list of installed widgets
    var installed = fs.readdir(__dirname + '/www/widgets/');
    for (d = 0; d < installed.length; d++) {
        if (installed[d].match(/\.html$/)) {
            var name = installed[d].replace('.html', '');
            var isGeneric = generic.indexOf(name) != -1;
            var found = isGeneric;

            if (!found) {
                for (var s = 0; s < sets.length; s++) {
                    if (sets[s].name == name) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                //delete
                fs.unlinkSync(__dirname + '/www/widgets/' + name + '.html');
                if (fs.existsSync(__dirname + '/www/widgets/' + name)) {
                    deleteFolderRecursive(__dirname + '/www/widgets/' + name);
                }
            }
            else {
                if (isGeneric) {
                    if (widgetSetsDependencies[name]) {
                        widgetSets.push({name: name, depends: widgetSetsDependencies[name]});
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    for (var g = 0; g < sets.length; g++) {
                        if (sets[d].name == name){
                            if (sets[d].pack && sets[d].pack.common && sets[d].pack.common.dependencies) {
                                var vis = sets[d].pack.common.dependencies.indexOf('vis');
                                if (vis != -1) sets[d].pack.common.dependencies.splice(vis, 1);
                                widgetSets.push({name: name, depends: sets[d].pack.common.dependencies});
                            } else {
                                widgetSets.push(name);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
    // build config file
    var visConfig = {
        widgetSets: widgetSets
    };

    var text = "var visConfig = " + JSON.stringify(visConfig, null, 4) + ";\n";
    text += "if (typeof exports != 'undefined') {\n";
    text += "    exports.config = visConfig;\n";
    text += "} else {\n";
    text += "    visConfig.language = window.navigator.userLanguage || window.navigator.language;\n";
    text += "}\n";

    fs.writeFileSync(__dirname + '/www/js/config.js', text);
}

function main() {
    syncWidgetSets();

    var count = 0;
    // Update index.html
    count++;
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
                        if (!(--count)) adapter.stop();
                    });
                });
            } else {
                if (!(--count)) adapter.stop();
            }
        });
    });

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
                if (!(--count)) adapter.stop();
            }) ;
        } else {
            if (!(--count)) adapter.stop();
        }
    });

    // Create common user CSS file
    count++;
    adapter.readFile('vis', 'css/vis-common-user.css', function (err, data) {
        if (err || data === null || data === undefined) {
            adapter.writeFile('vis', 'css/vis-common-user.css', '', function () {
                if (!(--count)) adapter.stop();
            });
        } else {
            if (!(--count)) adapter.stop();
        }
    });


}