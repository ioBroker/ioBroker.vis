// To use this file in WebStorm, right click on the file name in the Project Panel (normally left) and select "Open Grunt Console"

/** @namespace __dirname */
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

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
                            srcDir + '.travis.yml'
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

                grunt.file.write('README.md', readmeStart + '### ' + version + ' (' + date + ')\r\n' + (news ? news + '\r\n\r\n' : '\r\n') + readmeEnd);
            }
        }
    });

    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-http');

    grunt.registerTask('default', [
        'http',
        'replace:core',
        'updateReadme',
        'jshint',
        'jscs'
    ]);
	
	grunt.registerTask('prepublish', ['replace', 'updateReadme']);
	grunt.registerTask('p', ['prepublish']);
    grunt.registerTask('rename', [
        'replace:name'
    ]);
};