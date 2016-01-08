var fs =      require('fs');
var path =    require('path');

function copyFileSync(source, target) {
    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
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
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
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

var generic = [
    'bars',
    'basic',
    'colorpicker',
    'dev',
    'fancyswitch',
    'jqplot',
    'jqui',
    'jqui-mfd',
    'homematic',
    'knob',
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
    "jqui-mfd":     ["basic", "jqui"]
};

function syncWidgetSets() {
    var pack = null;
    var changed = false;
    var found;
    var name;
    // find all installed widget sets
    var dirs = fs.readdirSync(__dirname + '/../../');
    var sets = [];
    for (var d = 0; d < dirs.length; d++) {
        if (dirs[d].match(/^iobroker\./i) && fs.existsSync(__dirname + '/../../' + dirs[d] + '/widgets/')) {
            pack = null;
            try {
                pack = JSON.parse(fs.readFileSync(__dirname + '/../../' + dirs[d] + '/io-package.json').toString());
            } catch (e) {
                adapter.log.warn('Cannot parse "' + __dirname + '/../../' + dirs[d] + '/io-package.json": ' + e);
            }
            sets.push({path: __dirname + '/../../' + dirs[d], name: dirs[d].toLowerCase(), pack: pack});
        }
    }
    try {
        dirs = fs.readdirSync(__dirname + '/../../../../');
        for (d = 0; d < dirs.length; d++) {
            if (dirs[d].match(/^iobroker\./i) && fs.existsSync(__dirname + '/../../../../' + dirs[d] + '/widgets/')) {
                found = false;
                name = dirs[d].toLowerCase();
                for (var s = 0; s < sets.length; s++) {
                    if (sets[s].name == name) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    pack = null;
                    try {
                        pack = JSON.parse(fs.readFileSync(__dirname + '/../../../../' + dirs[d] + '/io-package.json').toString());
                    } catch (e) {
                        adapter.log.warn('Cannot parse "' + __dirname + '/../../../../' + dirs[d] + '/io-package.json": ' + e);
                    }
                    sets.push({path: __dirname + '/../../../../' + dirs[d], name: dirs[d].toLowerCase()});
                }
            }
        }
    } catch (e) {

    }
    // Now we have the list of widgets => copy them all to widgets directory
    for (d = 0; d < sets.length; d++) {
        copyFolderRecursiveSync(sets[d].path + '/widgets/', __dirname + '/../www/');
    }
    var widgetSets = [];

    // Read the list of installed widgets
    var installed = fs.readdirSync(__dirname + '/../www/widgets/');
    for (d = 0; d < installed.length; d++) {
        if (installed[d].match(/\.html$/)) {
            name = installed[d].replace('.html', '');
            var isGeneric = generic.indexOf(name) != -1;
            found = isGeneric;

            if (!found) {
                for (var b = 0; b < sets.length; b++) {
                    if (sets[b].name == 'iobroker.vis-' + name || sets[b].name == 'ioBroker.vis-' + name ||
                        sets[b].name == 'iobroker.' + name || sets[b].name == 'ioBroker.' + name) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                changed = true;
                //delete
                fs.unlinkSync(__dirname + '/../www/widgets/' + name + '.html');
                if (fs.existsSync(__dirname + '/../www/widgets/' + name)) {
                    deleteFolderRecursive(__dirname + '/../www/widgets/' + name);
                }
            }
            else {
                if (isGeneric) {
                    if (widgetSetsDependencies[name] && widgetSetsDependencies[name].length) {
                        widgetSets.push({name: name, depends: widgetSetsDependencies[name]});
                    } else {
                        widgetSets.push(name);
                    }
                } else {
                    for (var g = 0; g < sets.length; g++) {
                        if (sets[g].name == 'iobroker.vis-' + name || sets[g].name == 'ioBroker.vis-' + name ||
                            sets[g].name == 'iobroker.' + name || sets[g].name == 'ioBroker.' + name) {
                            if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.always) {
                                widgetSets.push({name: name, always: true});
                            } else if (sets[g].pack && sets[g].pack.native && sets[g].pack.native.dependencies) {
                                widgetSets.push({name: name, depends: sets[g].pack.native.dependencies});
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

    var oldText = fs.readFileSync(__dirname + '/../www/js/config.js');
    if (oldText != text) {
        fs.writeFileSync(__dirname + '/../www/js/config.js', text);
        return text;
    } else {
        return false;
    }
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports = syncWidgetSets;
} else {
    syncWidgetSets();
}
