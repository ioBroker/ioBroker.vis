/**
 * Process DashUI
 * Date: 15.04.14
 */

module.exports = function (grunt) {

    var destDir = "dashui.min";
    var srcDir  = "dashui";

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
                        cwd: srcDir + '/img/',
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
                        cwd: srcDir+'/js/',
                        src: ['config.js'],
                        dest: '.build/output/js/'
                    },
                    {
                        expand: true,
                        cwd: srcDir+'/css/',
                        src: [/*'doc.css',*/ 'dashui-user.css'],
                        dest: '.build/output/css/'
                    }
                ]
            },
            widget: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + '/widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>',
                        src: ['**/*', '*'],
                        dest: '.build/output/widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>'
                    }
                ]
            },
            widgetHtml: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + '/widgets/',
                        src: ['<%= grunt.task.current.args[0] %>.html'],
                        dest: '.build/widgets/'
                    }
                ]
            },
            widgetSubHtml: {
                files: [
                    {
                        expand: true,
                        cwd: srcDir + '/widgets/<%= grunt.task.current.args[0] %>',
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
                src: [srcDir+'/js/dashuiEdit.js', srcDir+'/js/dashuiEditExt.js', srcDir+'/js/dashuiLang.js', srcDir+'/js/dashuiWizard.js'],
                dest: '.build/js/dashuiEdit.js'
            },
            css: {
                src: [srcDir+'/css/dashui.css', srcDir+'/css/backgrounds.css'],
                dest: '.build/css/dashui.css'
            },
            widgetJs: {
                src: [srcDir+'/widgets/<%= grunt.task.current.args[0] %>/js/*', '!'+srcDir+'/widgets/hqWidgets/js/hqWidgetsEditDashUI.js', '!'+srcDir+'/widgets/hqWidgets/js/hqWidgetsEdit.js'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>.concat.js'
            },
            widgetEditJs: {
                src: [srcDir+'/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>EditDashUI.js', srcDir+'/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.js'],
                dest: '.build/widgets/<%= grunt.task.current.args[0] %>/js/<%= grunt.task.current.args[0] %>Edit.concat.js'
            },            
			widgetCss: {
                src: [srcDir+'/widgets/<%= grunt.task.current.args[0] %>/css/*'],
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
                        src: [srcDir + "/*.html"],
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
                        src: [srcDir +'/widgets/<%= grunt.task.current.args[0] %>.html'],
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
                        src: [srcDir +'/widgets/<%= grunt.task.current.args[0] %>Edit.html'],
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
                        src: [srcDir +'/widgets/<%= grunt.task.current.args[0] %>.html'],
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
                        src: [srcDir +'/widgets/<%= grunt.task.current.args[0] %>.html'],
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
                        src: [srcDir +'/widgets/<%= grunt.task.current.args[0] %>/<%= grunt.task.current.args[1] %>'],
                        dest: '.build/widgets/<%= grunt.task.current.args[0] %>/'
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
                    '.build/output/js/dashui.min.js': [srcDir+'/js/dashui.js'],
                    '.build/output/js/dashuiEdit.min.js': ['.build/js/dashuiEdit.js']
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
                    '.build/output/css/doc.min.css': [srcDir+'/css/doc.css']
                }
            },
            widget: {
                files: {
                    '.build/output/widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.min.css' : ['.build/widgets/<%= grunt.task.current.args[0] %>/css/<%= grunt.task.current.args[0] %>.concat.css']
                }
            }
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
          'grunt-contrib-uglify'
        ];
    var i;

    for (i in gruntTasks) {
        grunt.loadNpmTasks(gruntTasks[i]);
    }

    grunt.registerTask('buildAllWidgets', function () {
        var dirs = {};
        grunt.file.recurse (srcDir + "/widgets/", function (abspath, rootdir, subdir, filename) {
            if (!subdir && filename.indexOf('.html') != -1) {
                // remove extension
                var parts = filename.split('.');
                var widgetName = parts.splice(parts.length - 2, 1).join ('.');
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
                    if (dirs[t].subdirs[dir].justCopy) {
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
            'uglify:dist'
        ]);
    });
    grunt.registerTask('deployWorkingCopy', function () {
        grunt.task.run([
            'copy:dist'
        ]);
    });

    grunt.registerTask('default', ['env:production', 'makeWorkingCopy', 'optimizeWorkingCopy', 'deployWorkingCopy']);
}