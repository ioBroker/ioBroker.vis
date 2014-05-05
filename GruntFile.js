/**
 * Process DashUI
 * Date: 15.04.14
 */

module.exports = function (grunt) {

    var destDir = "dashui.min/";
    var srcDir  = "dashui/";
    var deliveryDir = 'delivery/';
    var ioaddon = grunt.file.readJSON(srcDir + 'io-addon.json');

    // Copyright header
    var htmlBanner =
          '/**\n'
        + ' *  DashUI\n'
        + ' *  https://github.com/hobbyquaker/dashui/\n'
        + ' *\n'
        + ' *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox\n'
        + ' *  MIT License (MIT)\n'
        + ' *\n'
        + ' *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated\n'
        + ' *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the\n'
        + ' *  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to\n'
        + ' *  permit persons to whom the Software is furnished to do so, subject to the following conditions:\n'
        + ' *v'
        + ' *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of\n'
        + ' *  the Software.\n'
        + ' *\n'
        + ' *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO\n'
        + ' *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n'
        + ' *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,\n'
        + ' *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n'
        + ' *  SOFTWARE.\n'
        + ' */\n';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),


        env: {
            debug: {
                NODE_ENV: 'debug'
            },

            production: {
                NODE_ENV: 'production'
            }
        },

        clean: ['.build', destDir],

        copy: {
            static: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + 'img/',
                        src: ['**/*'],
                        dest: '.build/output/img'
                    },
                    {
                        expand: true,
                        cwd: srcDir,
                        src: ['*.manifest', "*.json"],
                        dest: '.build/output/'
                    },
                    {
                        expand: true,
                        cwd: srcDir+'js/',
                        src: ['*.js', '!dashui*.js'],
                        dest: '.build/output/js/'
                    },
                    {
                        expand: true,
                        cwd: srcDir+'css/',
                        src: [/*'doc.css',*/ '*.css', '!dashui.css', '!doc.css', '!backgrounds.css'],
                        dest: '.build/output/css/'
                    }
                ]
            },
            widget: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + 'widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>',
                        src: ['**/*', '*'],
                        dest: '.build/output/widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>'
                    }
                ]
            },
            widgetHtml: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + 'widgets/',
                        src: ['<%= grunt.task.current.args[0] %>.html'],
                        dest: '.build/widgets/'
                    }
                ]
            },
            widgetSubHtml: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + 'widgets/<%= grunt.task.current.args[0] %>',
                        src: ['<%= grunt.task.current.args[1] %>'],
                        dest: '.build/output/widgets/<%= grunt.task.current.args[0] %>'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.build/output/',
                        src: ['**/*'],
                        dest: destDir
                    }
                ]
            }
        },

        concat: {
            js: {
                src: [srcDir+'js/dashuiEdit.js', srcDir+'js/dashuiEditExt.js', srcDir+'js/dashuiLang.js', srcDir+'js/dashuiWizard.js'],
                dest: '.build/js/dashuiEdit.js'
            },
            css: {
                src: [srcDir+'css/dashui.css', srcDir+'css/backgrounds.css'],
                dest: '.build/css/dashui.css'
            },
            widgetJs: {
                src: [srcDir+'widgets/<%= grunt.task.current.args[0] %>/js/*', '!'+srcDir+'widgets/hqWidgets/js/hqWidgetsEditDashUI.js', '!'+srcDir+'widgets/hqWidgets/js/hqWidgetsEdit.js'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.concat.js'
            },
            widgetEditJs: {
                src: [srcDir+'widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>EditDashUI.js', srcDir+'widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.js'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.concat.js'
            },            
            widgetCss: {
                src: [srcDir+'widgets/<%= grunt.task.current.args[0] %>/css/*'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.concat.css'
            },
            widgetAddJs: {
                options: {
                    banner: '<script type="text/javascript" src="widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.min.js"></script>'
                },
                src: ['.build/widgets/replaced/<%= grunt.task.current.args[0] %>.html'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>.html'
            },
            widgetAddCss: {
                options: {
                    banner: '<link rel="stylesheet" type="text/css" href="widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.min.css" />'
                },
                src: ['.build/widgets/replaced/<%= grunt.task.current.args[0] %>.html'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>.html'
            },
            widgetAddJsCss: {
                options: {
                    banner: '<link rel="stylesheet" type="text/css" href="widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.min.css" /><script type="text/javascript" src="widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.min.js"></script>'
                },
                src: ['.build/widgets/replaced/<%= grunt.task.current.args[0] %>.html'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>.html'
            },
            widgetAddEdit: {
                options: {
                    banner: '<script type="text/javascript" src="widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.min.js"></script>'
                },
                src: ['.build/widgets/replaced/<%= grunt.task.current.args[0] %>Edit.html'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>Edit.html'
            },
            addHeader: {
                options: {
                    banner: htmlBanner
                },
                src: ['.build/compressed/<%= grunt.task.current.args[0] %>'],
                dest: '.build/output/<%= grunt.task.current.args[1] %><%= grunt.task.current.args[0] %>'

            }
        },
        // Remove links to combined css and js files
        replace: {
            dist: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<link rel=\"stylesheet\" href=\"css\/backgrounds\.css\" \/\>/g,
                            replacement: ''
                        },
                        {
                            match: /\<script type=\"text\/javascript\" src=\"js\/dashuiLang\.js\"\>\<\/script\>/g,
                            replacement: ''
                        },
                        {
                            match: /\<script type=\"text\/javascript\" src=\"js\/dashuiEditExt\.js\"\>\<\/script\>/g,
                            replacement: ''
                        },
                        {
                            match: /\<script type=\"text\/javascript\" src=\"js\/dashuiWizard\.js\"\>\<\/script\>/g,
                            replacement: ''
                        },
                        {
                            match: /dashui\.js/g,
                            replacement: 'dashui.min.js'
                        },
                        {
                            match: /dashuiEdit\.js/g,
                            replacement: 'dashuiEdit.min.js'
                        },
                        {
                            match: /dashui\.js/g,
                            replacement: 'dashui.min.js'
                        },
                        {
                            match: /dashui\.css/g,
                            replacement: 'dashui.min.css'
                        },
                        {
                            match: /widgets\/colorpicker\/css\/farbtastic\.css/g,
                            replacement: 'widgets/colorpicker/css/colorpicker.min.css'
                        },
                        {
                            match: /widgets\/colorpicker\/js\/farbtastic\.js/g,
                            replacement: 'widgets/colorpicker/js/colorpicker.min.js'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir + "*.html"],
                        dest: '.build/'
                    }
                ]
            },
            widgetJs: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<script type=\"text\/javascript\" src=\"[-\/0-9a-zA-Z.]+\"\s*\>\<\/script\>/g,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir +'widgets/<%= grunt.task.current.args[0] %>.html'],
                        dest: '.build/widgets/replaced/'
                    }
                ]
            },
            widgetEditJs: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<script type=\"text\/javascript\" src=\"[-\/0-9a-zA-Z.]+\"\s*\>\<\/script\>/g,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir +'widgets/<%= grunt.task.current.args[0] %>Edit.html'],
                        dest: '.build/widgets/replaced/'
                    }
                ]
            },
            widgetCss: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<link rel=\"stylesheet\" type=\"text\/css\" href=\"[-\/0-9a-zA-Z.]+\"\s*\/\>/g,
                            replacement: ''
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir +'widgets/<%= grunt.task.current.args[0] %>.html'],
                        dest: '.build/widgets/replaced/'
                    }
                ]
            },
            widgetJsCss: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<script type=\"text\/javascript\" src=\"[-\/0-9a-zA-Z.]+\"\s*\>\<\/script\>/g,
                            replacement: ''
                        },
                        {
                            match: /\<link rel=\"stylesheet\" type=\"text\/css\" href=\"[-\/0-9a-zA-Z.]+\"\s*\/\>/g,
                            replacement: ''
                        }

                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir +'widgets/<%= grunt.task.current.args[0] %>.html'],
                        dest: '.build/widgets/replaced/'
                    }
                ]
            },
            widgetReplaceHtml: {
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /\<link rel=\"stylesheet\" href=\"..\/..\/css\/doc.css\"\s*\/\>/g,
                            replacement: '<link rel="stylesheet" href="../../css/doc.min.css" />'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [srcDir +'widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>'],
                        dest: '.build/widgets/<%= grunt.task.current.args[0] %>/'
                    }
                ]
            },
			setVersion:{
                options: {
                    force: true,
                    patterns: [
                        {
                            match: /(#+\s+DashUI\s+Version\s+)[\.0-9A-Za-z]+/g,
                            replacement: '# DashUI Version ' + ioaddon.version
                        },
                        {
                            match: /<!--\s+DashUI\s+Version\s+[\.0-9A-Za-z]+\s+-->/g,
                            replacement: '<!-- DashUI Version ' + ioaddon.version + ' -->'
                        },
                        {
                            match: /(\s+version:\s+)'[\.0-9A-Za-z]+',/g,
                            replacement: '$1\'' + ioaddon.version + '\','
                        }
                    ]
                },
                files: [
                    {
                        flatten: true,
                        src: [srcDir + '*.html', srcDir + '*.manifest', srcDir + 'js/dashui.js'],
                        dest: './'
                    }
                ]
			}
		},

        uglify: {
            dist: {
                options: {
                    mangle: false
                },

                files: {
                    //'.build/output/js/dashui.min.js': [srcDir+'js/dashui.js'],
                    //'.build/output/js/dashuiEdit.min.js': ['.build/js/dashuiEdit.js']
                    '.build/compressed/dashui.min.js': [srcDir+'js/dashui.js'],
                    '.build/compressed/dashuiEdit.min.js': ['.build/js/dashuiEdit.js']
                }
            },
            widget: {
                options: {
                    mangle: false
                },
                files: {
                    '.build/output/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.min.js' : ['.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.concat.js']
                }
            },
			widgetEdit: {
                options: {
                    mangle: false
                },
                files: {
                    '.build/output/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.min.js' : ['.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.concat.js']
                }
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    removeComments: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '.build/',
                        src: ['*.html'],
                        dest: '.build/output/'
                    },
                    {
                        expand: true,
                        cwd: '.build/widgets/',
                        src: ['*.html'],
                        dest: '.build/output/widgets/'
                    }

                ]
            },
            widgetHtml: {
                options: {
                    collapseWhitespace: true,
                    removeComments: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '.build/widgets/<%= grunt.task.current.args[0] %>',
                        src: ['<%= grunt.task.current.args[1] %>'],
                        dest: '.build/output/widgets/<%= grunt.task.current.args[0] %>'
                    }
                ]
            }
        },

        cssmin: {
            build: {
                files: {
                    '.build/output/css/dashui.min.css': ['.build/css/dashui.css'],
                    '.build/output/css/doc.min.css': [srcDir+'css/doc.css']
                }
            },
            widget: {
                files: {
                    '.build/output/widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.min.css' : ['.build/widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.concat.css']
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: deliveryDir+'ioBroker.addon.' + ioaddon.name + '.' + ioaddon.version + '.zip'
                },
                files: [
                    {expand: true, src: ['**'],  dest: '/', cwd: destDir}
                ]
            }
        },
		
        // Lint
        jshint: {
            options: {
                force:true,
				globalstrict: true
            },
            all: [ 'dashui/js/*.js','dashui/*.html','dashui/widgets/hqWidgets/js/*.js']
        }
    });

    var gruntTasks = [
          'grunt-env',
          'grunt-contrib-cssmin',
          'grunt-replace',
          'grunt-contrib-htmlmin',
          'grunt-contrib-clean',
          'grunt-contrib-concat',
          'grunt-contrib-copy',
          'grunt-contrib-uglify',
          'grunt-contrib-compress',
          'grunt-contrib-jshint',
          'grunt-zip'
        ];
    var i;

    for (i in gruntTasks) {
        grunt.loadNpmTasks(gruntTasks[i]);
    }

    grunt.registerTask('buildAllWidgets', function () {
        var dirs = {};
        // Exclude these widgets from minmizing and combining
        var exclude = ["swipe", "highcharts"];
        grunt.file.recurse(srcDir + "widgets/", function (abspath, rootdir, subdir, filename) {
            if (filename == ".DS_Store") return;
            if (!subdir && filename.indexOf('.html') != -1 ) {
                // remove extension
                var parts = filename.split('.');
                var widgetName = parts.splice(parts.length - 2, 1).join('.');
                if (!dirs[widgetName]) {
                    dirs[widgetName] = {subdirs:{}};
                }
                dirs[widgetName].html = true;
            } else {
                // Check if the widget has clear structure (js, css, img, doc.html)
                var parts = subdir.split('/');
                if (parts.length > 2) {
                    // Do not minify and combine widgets with subdirectories
                    if (parts[1] == 'js') {
                        if (!dirs[parts[0]]) {
                            dirs[parts[0]] = {subdirs:{}};
                        }
                        dirs[parts[0]].subdirs[parts[1]] = {justCopy: true};
                    }
                    else
                    if (parts[1] == 'css') {
                        if (!dirs[parts[0]]) {
                            dirs[parts[0]] = {subdirs:{}};
                        }
                        dirs[parts[0]].subdirs[parts[1]] = {justCopy: true};
                    }
                }

                if (parts.length > 1) {
                    if (!dirs[parts[0]]) {
                        dirs[parts[0]] = {subdirs:{}};
                    }
                    if (parts[1] != 'js' && parts[1] != 'css') {
                        dirs[parts[0]].subdirs[parts[1]] = {justCopy: true};
                    } else
                    {
                        if (!dirs[parts[0]].subdirs[parts[1]]) {
                            dirs[parts[0]].subdirs[parts[1]] = {};
                        }
                    }
                } else if (subdir && subdir.indexOf('/') == -1 && filename) {
                    if (!dirs[subdir]) {
                        dirs[subdir] = {subdirs:{}};
                    }
                    if (!dirs[subdir].files) {
                        dirs[subdir].files = {};
                    }

                    if (filename == "doc.html") {
                        // Replace doc.css with doc.min.css
                        dirs[subdir].files[filename] = {replace: true};
                    } else {
                        // Just copy file
                        dirs[subdir].files[filename] = {justCopy: true};
                    }
                }
            }
        });
        for (var t in dirs) {
			if (t.indexOf("Edit") != -1) {
				t = t.replace("Edit", "");
				grunt.task.run(['replace:widgetEditJs:'+t]);
				grunt.task.run(['concat:widgetEditJs:'+t]);
				grunt.task.run(['concat:widgetAddEdit:'+t]);
                grunt.task.run(['uglify:widgetEdit:'+t]);
			} else
            if (dirs[t].subdirs) {
                var isJs = false;
                var isCss = false;
                for (var dir in dirs[t].subdirs) {
                    console.log("Process:" + t + "/" + dir);
                    if (dirs[t].subdirs[dir].justCopy || exclude.indexOf(t) != -1) {
                        grunt.task.run(['copy:widget:'+ t+':'+dir]);
                    } else if (dir == 'js') {
                        // Combine all javascript files
                        grunt.task.run(['concat:widgetJs:'+t]);
                        grunt.task.run(['uglify:widget:'+t]);
                        isJs = true;
                    }
                    else if (dir == 'css') {
                        // Combine all css files
                        grunt.task.run(['concat:widgetCss:'+t]);
                        grunt.task.run(['cssmin:widget:'+t]);
                        isCss = true;
                    } else {
                        console.log('Nothing to do for '+t+':'+dir);
                    }
                }

                if (isJs && !isCss) {
                    console.log ("Remove js in "+t);
                    // Remove from widget.html all javascripts
                    grunt.task.run(['replace:widgetJs:'+t]);
                    // Add one line <script type="text/javascript" src="widgets/*/js/*.min.js"></script>
                    grunt.task.run(['concat:widgetAddJs:'+t]);
                } else if (isCss && !isJs) {
                    console.log ("Remove css in "+t);
                    // Remove from widget.html all javascripts
                    grunt.task.run(['replace:widgetCss:'+t]);
                    // Add one line <link rel="stylesheet" type="text/css" href="widgets/*/css/*.min.css">
                    grunt.task.run(['concat:widgetAddCss:'+t]);
                } else if (isCss && isJs) {
                    console.log ("Remove js and css in "+t);
                    // Remove from widget.html all javascripts
                    grunt.task.run(['replace:widgetJsCss:'+t]);
                    // Add one line <link rel="stylesheet" type="text/css" href="widgets/*/css/*.min.css">
                    grunt.task.run(['concat:widgetAddJsCss:'+t]);
                } else {
                    console.log ("Just copy "+t);
                    grunt.task.run(['copy:widgetHtml:'+t]);
                }

                if (dirs[t].files) {
                    for (var f in dirs[t].files) {
                        if (dirs[t].files[f].replace) {
                            grunt.task.run(['replace:widgetReplaceHtml:'+t + ':'+f]);
                            grunt.task.run(['htmlmin:widgetHtml:'+t + ':'+f]);
                        } else {
                            grunt.task.run(['copy:widgetSubHtml:'+t + ':'+f]);

                        }
                    }
                }
            }
        }
    });

    grunt.registerTask('makeWorkingCopy', function () {
        grunt.task.run([
			'replace:setVersion',
//			'jshint',
            'clean',
            'copy:static',
            'replace:dist',
            'concat:js',
            'concat:css',
            'buildAllWidgets'
        ]);
    });
    grunt.registerTask('optimizeWorkingCopy', function () {
        grunt.task.run([
            'cssmin:build',
            'htmlmin:dist',
            'uglify:dist',
            'concat:addHeader:dashui.min.js:js/',
            'concat:addHeader:dashuiEdit.min.js:js/'
        ]);
    });
    grunt.registerTask('deployWorkingCopy', function () {
        grunt.task.run([
            'copy:dist'
        ]);
    });
	grunt.registerTask('createPackage', function () {
        grunt.task.run([
            'compress'
        ]);
        console.log(srcDir + 'io-addon.json ==> ' + deliveryDir + 'ioBroker.addon.' + ioaddon.name + '.' + ioaddon.version + '.json');
        grunt.file.copy(srcDir + 'io-addon.json', deliveryDir + 'ioBroker.addon.' + ioaddon.name + '.' + ioaddon.version + '.json');
    });

    grunt.registerTask('updateReadme', function () {
        var readme = grunt.file.read(__dirname + '/README.md');
        if (readme.indexOf(ioaddon.version) == -1) {
            var timestamp = new Date();
            var date = timestamp.getFullYear() + '-' +
                ("0" + (timestamp.getMonth() + 1).toString(10)).slice(-2) + '-' +
                ("0" + (timestamp.getDate()).toString(10)).slice(-2);

            var news = "";
            if (ioaddon.whatsNew) {
                for (var i = 0; i < ioaddon.whatsNew.length; i++) {
                    if (typeof ioaddon.whatsNew[i] == 'string') {
                        news += '* ' + ioaddon.whatsNew[i] + '\r\n';
                    } else {
                        news += '* ' + ioaddon.whatsNew[i]['en'] + '\r\n';
                    }
                }
            }

            grunt.file.write(__dirname + '/README.md', readme.replace(/##\s+Changelog\s+/, '## Changelog\r\n\r\n### ' + ioaddon.version + ' [' + date + ']\r\n' + news + '\r\n'));
        }
    });

    grunt.registerTask('default', ['updateReadme', 'env:production', 'makeWorkingCopy', 'optimizeWorkingCopy', 'deployWorkingCopy', 'createPackage']);
}