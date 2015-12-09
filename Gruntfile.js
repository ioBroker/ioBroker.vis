// To use this file in WebStorm, right click on the file name in the Project Panel (normally left) and select "Open Grunt Console"

/** @namespace __dirname */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

module.exports = function (grunt) {

    var srcDir    = __dirname + '/';
    var dstDir    = srcDir + '.build/';
    var pkg       = grunt.file.readJSON('package.json');
    var iopackage = grunt.file.readJSON('io-package.json');
    var version   = (pkg && pkg.version) ? pkg.version : iopackage.common.version;

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        clean: {
            all: ['cordova/www/**/*']
        },
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
                            match: /<!-- ioBroker\.vis Version [\.0-9]+ -->/,
                            replacement: '<!-- ioBroker.vis Version ' + version + ' -->'
                        },
                        {
                            match: /# ioBroker\.vis Version [\.0-9]+/,
                            replacement: '# ioBroker.vis Version ' + version
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
                                srcDir + 'controller.js',
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
            index: {
                options: {
                    patterns: [
                        {
                            match: /\.\.\/\.\.\//g,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     [
                                'cordova/www/index.html'
                        ],
                        dest:    'cordova/www'
                    }
                ]
            }
        },
        // Javascript code styler
        jscs:   require(__dirname + '/tasks/jscs.js'),
        // Lint
        jshint: require(__dirname + '/tasks/jshint.js'),
        http: {
            /*get_hjscs: {
                options: {
                    url: 'https://raw.githubusercontent.com/ioBroker/ioBroker.js-controller/master/tasks/jscs.js'
                },
                dest: 'tasks/jscs.js'
            },
            get_jshint: {
                options: {
                    url: 'https://raw.githubusercontent.com/ioBroker/ioBroker.js-controller/master/tasks/jshint.js'
                },
                dest: 'tasks/jshint.js'
            },
            get_gruntfile: {
                options: {
                    url: 'https://raw.githubusercontent.com/ioBroker/ioBroker.build/master/adapters/Gruntfile.js'
                },
                dest: 'Gruntfile.js'
            },*/
            get_utilsfile: {
                options: {
                    url: 'https://raw.githubusercontent.com/ioBroker/ioBroker.build/master/adapters/utils.js'
                },
                dest: 'lib/utils.js'
            },
            get_jscsRules: {
                options: {
                    url: 'https://raw.githubusercontent.com/ioBroker/ioBroker.js-controller/master/tasks/jscsRules.js'
                },
                dest: 'tasks/jscsRules.js'
            },
            get_iconOnline: {
                options: {
                    encoding: null,
                    url: iopackage.common.extIcon || 'https://raw.githubusercontent.com/ioBroker/ioBroker.js-controller/master/adapter/example/admin/example.png'
                },
                dest: dstDir + 'ioBroker.adapter.' + iopackage.common.name + '.png'

            },
            get_iconOffline: {
                options: {
                    encoding: null,
                    url: iopackage.common.extIcon || 'https://raw.githubusercontent.com/ioBroker/ioBroker.js-controller/master/adapter/example/admin/example.png'
                },
                dest: dstDir + 'ioBroker.adapter.offline.' + iopackage.common.name + '.png'

            }
        },
        copy: {
            vis: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: 'www/',
                        src: ['**', '!edit.html', '!offline.html', '!cache.manifest', '!cordova.js', '!js/app.js'],
                        dest: 'cordova/www'
                    }
                ]
            },
            web: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/iobroker.web/www/',
                        src: ['lib/css/themes/**', 'lib/js/jquery-1.11.2.min.*', 'lib/js/jquery-ui-1.11.4.full.min.js', 'lib/js/socket.io.js'],
                        dest: 'cordova/www'
                    }
                ]
            },
            app: {
                files: [
                    {
                        expand: true,
                        cwd: 'cordova',
                        src: ['app.js'],
                        dest: 'cordova/www/js'
                    }
                ]
            }
        },
        exec: {
            build: {
                cwd: 'cordova',
                cmd: 'cordova.cmd build android'
            },
            run: {
                cwd: 'cordova',
                cmd: 'cordova.cmd run android'
            }

        }
    });

    grunt.registerTask('updateReadme', function () {
        var readme = grunt.file.read('README.md');
        var pos = readme.indexOf('## Changelog');
        if (pos != -1) {
            var readmeStart = readme.substring(0, pos + '## Changelog\r'.length);
            var readmeEnd   = readme.substring(pos + '## Changelog\r'.length);

            if (iopackage.common && readme.indexOf(iopackage.common.version) == -1) {
                var timestamp = new Date();
                var date = timestamp.getFullYear() + '-' +
                    ("0" + (timestamp.getMonth() + 1).toString(10)).slice(-2) + '-' +
                    ("0" + (timestamp.getDate()).toString(10)).slice(-2);

                var news = "";
                if (iopackage.common.whatsNew) {
                    for (var i = 0; i < iopackage.common.whatsNew.length; i++) {
                        if (typeof iopackage.common.whatsNew[i] == 'string') {
                            news += '* ' + iopackage.common.whatsNew[i] + '\r\n';
                        } else {
                            news += '* ' + iopackage.common.whatsNew[i].en + '\r\n';
                        }
                    }
                }

                grunt.file.write('README.md', readmeStart + '### ' + iopackage.common.version + ' (' + date + ')\r\n' + (news ? news + '\r\n\r\n' : '\r\n') + readmeEnd);
            }
        }
    });

    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', [
        'http',
        'replace:core',
        'updateReadme',
        'jshint',
        'jscs'
    ]);
	
	grunt.registerTask('prepublish', ['replace', 'updateReadme']);
	grunt.registerTask('p', ['prepublish']);
    grunt.registerTask('app', ['copy', 'replace:index', 'exec:build']);
    grunt.registerTask('run', ['copy', 'replace:index', 'exec:run']);
};