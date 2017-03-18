// To use this file in WebStorm, right click on the file name in the Project Panel (normally left) and select "Open Grunt Console"

/** @namespace __dirname */
/* jshint -W097 */
/* jshint strict:false */
/* jslint node: true */
'use strict';

function getAppName() {
    var parts = __dirname.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1].split('.')[0].toLowerCase();
}

module.exports = function (grunt) {

    var srcDir    = __dirname + '/';
    var pkg       = grunt.file.readJSON('package.json');
    var iopackage = grunt.file.readJSON('io-package.json');
    var version   = (pkg && pkg.version) ? pkg.version : iopackage.common.version;
    var appName   = getAppName();

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        replace: {
            core: {
                options: {
                    patterns: [
                        {
                            match: /var version = *'[\.0-9]*';/g,
                            replacement: "var version = '" + version + "';"
                        },
                        {
                            match: /"version": *"[\.0-9]*",/g,
                            replacement: '"version": "' + version + '",'
                        },
                        {
                            match: /version: *"[\.0-9]*",/,
                            replacement: 'version: "' + version + '",'
                        },
                        {
                            match: /version: *'[\.0-9]*',/,
                            replacement: "version: '" + version + "',"
                        },                        {
                            match: /<!-- vis Version [\.0-9]+ -->/,
                            replacement: '<!-- vis Version ' + version + ' -->'
                        },
                        {
                            match: /# vis Version [\.0-9]+/,
                            replacement: '# vis Version ' + version
                        },
                        {
                            match: /# dev build [\.0-9]+/g,
                            replacement: '# dev build 0'
                        }
                    ]
                },
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                                srcDir + 'package.json',
                                srcDir + 'io-package.json'
                        ],
                        dest:    srcDir
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'www/cache.manifest',
                            srcDir + 'www/edit.html',
                            srcDir + 'www/index.html'
                        ],
                        dest:    srcDir + '/www'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'www/js/vis.js'
                        ],
                        dest:    srcDir + '/www/js'
                    }
                ]
            },
            name: {
                options: {
                    patterns: [
                        {
                            match:       /iobroker/gi,
                            replacement: appName
                        },
						{
                            match:       / *  Copyright \(c\) \d+-\d+ bluefox https:\/\/github.com\/GermanBluefox, hobbyquaker https:\/\/github.com\/hobbyquaker/gi,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + '*.*',
                            srcDir + '.travis.yml',
                            '!' + srcDir + 'Gruntfile.js'
                        ],
                        dest:    srcDir
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'admin/*.*',
                            '!' + srcDir + 'admin/*.png'
                        ],
                        dest:    srcDir + 'admin'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'lib/*.*'
                        ],
                        dest:    srcDir + 'lib'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'example/*.*'
                        ],
                        dest:    srcDir + 'example'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'www/*.*'
                        ],
                        dest:    srcDir + 'www'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'www/js/*.*'
                        ],
                        dest:    srcDir + 'www/js'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'www/widgets/*.*'
                        ],
                        dest:    srcDir + 'www/widgets'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'test/*.*'
                        ],
                        dest:    srcDir + 'test'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + 'test/lib/*.*'
                        ],
                        dest:    srcDir + 'test/lib'
                    }
                ]
            },
            minify: {
                options: {
                    patterns: [
                        {
                            match:       /<script type="text\/javascript" src="cordova\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/translate\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/app\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/can\.custom\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/jquery.ui.touch-punch.min.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/jquery\.multiselect-1\.13\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/quo\.standalone\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/loStorage\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/conn\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/vis\.js"><\/script>/,
                            replacement: '<script type="text/javascript" src="js/vis.min.js"></script>'
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/backgrounds.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/vis.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/app.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/styles.css" \/>/,
                            replacement: '<link rel="stylesheet" type="text/css" href="css/vis.min.css" />'
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="lib\/css\/jquery.multiselect-1\.13\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/fm\/fileManager\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visLang\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visAbout\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visEditWelcome\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visEdit\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visEditExt\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="js\/visEditInspect\.js"><\/script>/,
                            replacement: '<script type="text/javascript" src="js/visEdit.min.js"></script>'
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/jquery\.fancytree-all\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/colResizable-1\.5\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/dropzone\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/html2canvas\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/jquery\.jgrowl\.min\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/superclick\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/ace\/ace\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/ace\/ext-language_tools\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<script type="text\/javascript" src="lib\/js\/farbtastic\.js"><\/script>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="lib\/css\/fancytree\/ui.fancytree\.min\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="lib\/css\/superfish\/superfish\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="lib\/css\/jquery\.jgrowl\.min\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="lib\/css\/farbtastic\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/vis\.min\.css" \/>/,
                            replacement: '<link rel="stylesheet" type="text\/css" href="css\/visEdit\.min\.css" \/>'
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="css\/vis-editor\.css" \/>/,
                            replacement: ''
                        },
                        {
                            match:       /<link rel="stylesheet" type="text\/css" href="js\/fm\/fileManager\.css" \/>/,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + '/www/index.html',
                            srcDir + '/www/edit.html'
                        ],
                        dest:    srcDir + '/www/'
                    }
                ]
            },
            minifyEdit: {
                options: {
                    patterns: [
                        {
                            match:       /<script type="text\/javascript" src="js\/vis\.min\.js"><\/script>/,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                            srcDir + '/www/edit.html'
                        ],
                        dest:    srcDir + '/www/'
                    }
                ]
            }
        },
        // Javascript code styler
        jscs:   require(__dirname + '/tasks/jscs.js'),
        // Lint
        jshint: require(__dirname + '/tasks/jshint.js'),
        http: {
            get_utilsfile: {
                options: {
                    url: 'https://raw.githubusercontent.com/' + appName + '/' + appName + '.build/master/adapters/utils.js'
                },
                dest: 'lib/utils.js'
            },
            get_jscsRules: {
                options: {
                    url: 'https://raw.githubusercontent.com/' + appName + '/' + appName + '.js-controller/master/tasks/jscsRules.js'
                },
                dest: 'tasks/jscsRules.js'
            }
        },
        concat: {
            options: {
                separator: ';\n'
            },
            index: {
                src: [
                    'www/lib/js/can.custom.min.js',
                    'www/lib/js/jquery.ui.touch-punch.min.js',
                    'www/lib/js/jquery.multiselect-1.13.min.js',
                    'www/lib/js/quo.standalone.js',
                    'www/lib/js/loStorage.js',
                    'www/js/vis.mmin.js'
                ],
                dest: 'www/js/vis.min.js'
            },
            edit: {
                src: [
                    'www/lib/js/jquery.fancytree-all.min.js',
                    'www/lib/js/colResizable-1.5.min.js',
                    'www/lib/js/dropzone.js',
                    'www/lib/js/html2canvas.min.js',
                    'www/lib/js/jquery.jgrowl.min.js',
                    'www/lib/js/superclick.js',
                    'www/lib/ace/ace.js',
                    'www/lib/ace/ext-language_tools.js',
                    'www/lib/ace/ext-searchbox.js',
                    'www/lib/ace/mode-css.js',
                    'www/lib/ace/mode-html.js',
                    'www/lib/ace/mode-javascript.js',
                    //'www/lib/ace/worker-css.js',  - needs to be in root
                    //'www/lib/ace/worker-html.js',
                    //'www/lib/ace/worker-javascript.js',
                    'www/lib/js/farbtastic.js',
                    'www/js/vis.min.js',
                    'www/js/visEdit.mmin.js'
                ],
                dest: 'www/js/visEdit.min.js'
            }
        },
        uglify: {
            index: {
                files: {
                    'www/js/vis.mmin.js': [
                        'www/lib/js/translate.js',
                        'www/js/conn.js',
                        'www/js/vis.js'
                    ]
                }
            },
            edit: {
                files: {
                    'www/js/visEdit.mmin.js': [
                        'www/js/fm/fileManager.js',
                        'www/js/visLang.js',
                        'www/js/visEditWelcome.js',
                        'www/js/visEdit.js',
                        'www/js/visEditExt.js',
                        'www/js/visEditInspect.js'
                    ]
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            index: {
                files: {
                    'www/css/vis.min.css': [
                        'www/lib/css/jquery.multiselect-1.13.css',
                        'www/css/background.css',
                        'www/css/styles.css',
                        'www/css/vis.css'
                    ]
                }
            },
            edit: {
                files: {
                    'www/css/visEdit.min.css': [
                        'www/lib/css/fancytree/ui.fancytree.min.css',
                        'www/lib/css/superfish/superfish.css',
                        'www/lib/css/jquery.jgrowl.min.css',
                        'www/lib/css/farbtastic.css',
                        'www/js/fm/fileManager.css',
                        'www/css/vis.min.css',
                        'www/css/vis-editor.css'
                    ]
                }
            }
        }
    });

    grunt.registerTask('updateReadme', function () {
        var readme = grunt.file.read('README.md');
        var pos = readme.indexOf('## Changelog');
        if (pos != -1) {
            var readmeStart = readme.substring(0, pos + '## Changelog\r'.length);
            var readmeEnd   = readme.substring(pos + '## Changelog\r'.length);

            if (readme.indexOf(version) == -1) {
                var timestamp = new Date();
                var date = timestamp.getFullYear() + '-' +
                    ('0' + (timestamp.getMonth() + 1).toString(10)).slice(-2) + '-' +
                    ('0' + (timestamp.getDate()).toString(10)).slice(-2);

                var news = '';
                if (iopackage.common.whatsNew) {
                    for (var i = 0; i < iopackage.common.whatsNew.length; i++) {
                        if (typeof iopackage.common.whatsNew[i] == 'string') {
                            news += '* ' + iopackage.common.whatsNew[i] + '\r\n';
                        } else {
                            news += '* ' + iopackage.common.whatsNew[i].en + '\r\n';
                        }
                    }
                }

                grunt.file.write('README.md', readmeStart + '### ' + version + ' (' + date + ')\r\n' + (news ? news + '\r\n\r\n' : '\r\n') + readmeEnd);
            }
        }
    });

    grunt.registerTask('beta-pre', function () {
        // change name of project
        var fs = require('fs');
        var iop = JSON.parse(fs.readFileSync(__dirname + '/io-package.json').toString());
        iop.common.name = 'vis-beta';
        iop.common.title = 'iobroker Visualisation BETA!!';
        iop.common.desc.en = 'iobroker Visualisation BETA!!';
        iop.common.desc.de = 'iobroker Visualisation BETA!!';
        iop.common.desc.ru = 'iobroker Visualisation BETA!!';
        for (var w = 0; w < iop.common.welcomeScreen.length; w++) {
            iop.common.welcomeScreen[w].link = iop.common.welcomeScreen[w].link.replace(/^vis\//, 'vis-beta/');
            iop.common.welcomeScreen[w].name = iop.common.welcomeScreen[w].name.replace(/^vis\s/, 'vis-beta ');
            iop.common.welcomeScreen[w].name = iop.common.welcomeScreen[w].name.replace(/^vis$/, 'vis-beta');
            iop.common.welcomeScreen[w].img  = iop.common.welcomeScreen[w].img.replace(/^vis\//, 'vis-beta/');
        }
        iop.common.localLink = iop.common.localLink.replace(/\/vis\//, '/vis-beta/');
        fs.writeFileSync(__dirname + '/io-package.json', JSON.stringify(iop, null, 2));
        
        var pack = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
        pack.name = 'iobroker.vis-beta';
        pack.description =  'BETA graphical user interface for iobroker.';
        pack.devDependencies = {
            "grunt": "^0.4.5",
            "grunt-replace": "^0.9.3",
            "grunt-contrib-jshint": "^0.11.2",
            "grunt-jscs": "^2.0.0",
            "grunt-http": "^1.6.0",
            "grunt-npm-install": "^0.3.1",
            "iobroker.web": "*",
            "mocha": "^2.3.4",
            "chai": "^3.4.1",
            "iobroker.dwd": "https://github.com/ioBroker/ioBroker.dwd/tarball/master",
            "iobroker.kodi": "https://github.com/instalator/ioBroker.kodi/tarball/master",
            "iobroker.mihome-vacuum": "https://github.com/ioBroker/ioBroker.mihome-vacuum/tarball/master",
            "iobroker.milight": "https://github.com/foxthefox/ioBroker.milight/tarball/master",
            "iobroker.starline": "https://github.com/instalator/ioBroker.starline/tarball/master",
            "iobroker.vis-bars": "https://github.com/ioBroker/ioBroker.vis-bars/tarball/master",
            "iobroker.vis-canvas-gauges": "https://github.com/ioBroker/ioBroker.vis-canvas-gauges/tarball/master",
            "iobroker.vis-colorpicker": "https://github.com/ioBroker/ioBroker.vis-colorpicker/tarball/master",
            "iobroker.vis-fancyswitch": "https://github.com/ioBroker/ioBroker.vis-fancyswitch/tarball/master",
            "iobroker.vis-google-fonts": "https://github.com/ioBroker/ioBroker.vis-google-fonts/tarball/master",
            "iobroker.vis-history": "https://github.com/ioBroker/ioBroker.vis-history/tarball/master",
            "iobroker.vis-hqwidgets": "https://github.com/ioBroker/ioBroker.vis-hqwidgets/tarball/master",
            "iobroker.vis-jqui-mfd": "https://github.com/ioBroker/ioBroker.vis-jqui-mfd/tarball/master",
            "iobroker.vis-justgage": "https://github.com/Pmant/ioBroker.vis-justgage/tarball/master",
            "iobroker.vis-keyboard": "https://github.com/ioBroker/ioBroker.vis-keyboard/tarball/master",
            "iobroker.vis-lcars": "https://github.com/ioBroker/ioBroker.vis-lcars/tarball/master",
            "iobroker.vis-map": "https://github.com/ioBroker/ioBroker.vis-map/tarball/master",
            "iobroker.vis-metro": "https://github.com/ioBroker/ioBroker.vis-metro/tarball/master",
            "iobroker.vis-plumb": "https://github.com/ioBroker/ioBroker.vis-plumb/tarball/master",
            "iobroker.vis-players": "https://github.com/instalator/ioBroker.vis-players/tarball/master",
            "iobroker.vis-rgraph": "https://github.com/ioBroker/ioBroker.vis-rgraph/tarball/master",
            "iobroker.vis-timeandweather": "https://github.com/ioBroker/ioBroker.vis-timeandweather/tarball/master",
            "iobroker.yr": "https://github.com/ioBroker/ioBroker.yr/tarball/master"
        };
        pack.scripts.install = 'node main.js --install --beta';
        fs.writeFileSync(__dirname + '/package.json', JSON.stringify(pack, null, 2));

        var conn = fs.readFileSync(__dirname + '/www/js/conn.js').toString().replace('\'vis.0\'', '\'vis-beta.0\'');
        fs.writeFileSync(__dirname + '/www/js/conn.js', conn);

        var index = fs.readFileSync(__dirname + '/www/index.html').toString().replace('<title>vis</title>', '<title>vis-beta</title>');
        fs.writeFileSync(__dirname + '/www/index.html', index);

        var edit = fs.readFileSync(__dirname + '/www/edit.html').toString().replace('<title>Edit vis</title>', '<title>Edit vis BETA</title>');
        fs.writeFileSync(__dirname + '/www/edit.html', edit);
    });
    grunt.registerTask('beta-post', function () {
        var syncWidgetSets = require(__dirname + '/lib/install.js');
        syncWidgetSets(true);
    });

    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-npm-install');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('copyAce', function () {
        var fs = require('fs');
        fs.writeFileSync('www/worker-css.js', fs.readFileSync('www/lib/ace/worker-css.js'));
        fs.writeFileSync('www/worker-html.js', fs.readFileSync('www/lib/ace/worker-html.js'));
        fs.writeFileSync('www/worker-javascript.js', fs.readFileSync('www/lib/ace/worker-javascript.js'));

        fs.writeFileSync('www/css/channel.png', fs.readFileSync('www/lib/css/fancytree/channel.png'));
        fs.writeFileSync('www/css/device.png', fs.readFileSync('www/lib/css/fancytree/device.png'));
        fs.writeFileSync('www/css/icons.gif', fs.readFileSync('www/lib/css/fancytree/icons.gif'));
        fs.writeFileSync('www/css/loading.gif', fs.readFileSync('www/lib/css/fancytree/loading.gif'));
        fs.writeFileSync('www/css/state.png', fs.readFileSync('www/lib/css/fancytree/state.png'));
    });

    var fs = require('fs');
    if (!fs.existsSync('www/index.full.html')) fs.writeFileSync('www/index.full.html', fs.readFileSync('www/index.html'));
    if (!fs.existsSync('www/edit.full.html')) fs.writeFileSync('www/edit.full.html', fs.readFileSync('www/edit.html'));
    grunt.registerTask('copySrc', function () {
    });

    grunt.registerTask('minify', [
        'copySrc',
        'uglify:index',
        'uglify:edit',
        'cssmin:index',
        'cssmin:edit',
        'concat:index',
        'concat:edit',
        'replace:minify',
        'replace:minifyEdit',
        'copyAce'
    ]);

    grunt.registerTask('beta', [
            'beta-pre',
            'npm-install',
            'beta-post'
        ]);
    grunt.registerTask('default', [
        'http',
        'replace:core',
        'updateReadme',
        'jshint',
        'jscs'
    ]);
	
	grunt.registerTask('prepublish', ['replace:core', 'updateReadme']);
	grunt.registerTask('p', ['prepublish']);
    grunt.registerTask('rename', ['replace:name']);
};