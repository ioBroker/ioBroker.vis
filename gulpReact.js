/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';
const fs         = require('fs');
const rename     = require('gulp-rename');
const replace    = require('gulp-replace');
const del        = require('del');
const cp         = require('child_process');

function init(gulp) {
    gulp.task('clean', () => {
        return del([
            // 'src/node_modules/**/*',
            'admin/**/*',
            'admin/*',
            'src/build/**/*'
        ]).then(() => del([
            // 'src/node_modules',
            'src/build',
            'admin/'
        ]));
    });

    function npmInstall() {
        return new Promise((resolve, reject) => {
            // Install node modules
            const cwd = __dirname.replace(/\\/g, '/') + '/src/';

            const cmd = `npm install`;
            console.log(`"${cmd} in ${cwd}`);

            // System call used for update of js-controller itself,
            // because during installation npm packet will be deleted too, but some files must be loaded even during the install process.
            const exec = require('child_process').exec;
            const child = exec(cmd, {cwd});

            child.stderr.pipe(process.stderr);
            child.stdout.pipe(process.stdout);

            child.on('exit', (code /* , signal */) => {
                // code 1 is strange error that cannot be explained. Everything is installed but error :(
                if (code && code !== 1) {
                    reject('Cannot install: ' + code);
                } else {
                    console.log(`"${cmd} in ${cwd} finished.`);
                    // command succeeded
                    resolve();
                }
            });
        });
    }

    gulp.task('2-npm', () => {
        if (fs.existsSync(__dirname + '/src/node_modules')) {
            return Promise.resolve();
        } else {
            return npmInstall();
        }
    });

    gulp.task('2-npm-dep', gulp.series('clean', '2-npm'));

    function build() {
        return new Promise((resolve, reject) => {
            const options = {
                stdio: 'pipe',
                cwd:   __dirname + '/src/'
            };

            const version = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString('utf8')).version;
            const data = JSON.parse(fs.readFileSync(__dirname + '/src/package.json').toString('utf8'));
            data.version = version;
            fs.writeFileSync(__dirname + '/src/package.json', JSON.stringify(data, null, 4));

            console.log(options.cwd);

            let script = __dirname + '/src/node_modules/react-scripts/scripts/build.js';
            if (!fs.existsSync(script)) {
                script = __dirname + '/node_modules/react-scripts/scripts/build.js';
            }
            if (!fs.existsSync(script)) {
                console.error('Cannot find execution file: ' + script);
                reject('Cannot find execution file: ' + script);
            } else {
                const child = cp.fork(script, [], options);
                child.stdout.on('data', data => console.log(data.toString()));
                child.stderr.on('data', data => console.log(data.toString()));
                child.on('close', code => {
                    console.log(`child process exited with code ${code}`);
                    code ? reject('Exit code: ' + code) : resolve();
                });
            }
        });
    }

    gulp.task('3-build', () => build());

    gulp.task('3-build-dep', gulp.series('2-npm', '3-build'));

    function copyFiles() {
        return del([
            'www/react/**/*'
        ]).then(() => {
            return Promise.all([
                gulp.src([
                    'src/build/**/*',
                    '!src/build/index.html',
                    '!src/build/static/js/main.*.chunk.js',
                    '!src/build/i18n/**/*',
                    '!src/build/i18n',
                    'admin-config/*'
                ])
                    .pipe(gulp.dest('www/react/')),

                gulp.src([
                    'src/build/index.html',
                ])
                    .pipe(replace('href="/', 'href="'))
                    .pipe(replace('src="/', 'src="'))
                    .pipe(rename('index.html'))
                    .pipe(gulp.dest('www/react/')),
                gulp.src([
                    'src/build/static/js/main.*.chunk.js',
                ])
                    .pipe(replace('s.p+"static/media/copy-content', '"./static/media/copy-content'))
                    .pipe(gulp.dest('www/react/static/js/')),
            ]);
        });
    }

    gulp.task('5-copy', () => copyFiles());

    gulp.task('5-copy-dep', gulp.series('3-build-dep', '5-copy'));

    gulp.task('6-patch', done => {
        if (fs.existsSync(__dirname + '/www/react/index.html')) {
            let code = fs.readFileSync(__dirname + '/www/react/index.html').toString('utf8');
            code = code.replace(/<script>const script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);
            code = code.replace(/<script>var script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);

            fs.writeFileSync(__dirname + '/www/react/index.html', code);
        }
        if (fs.existsSync(__dirname + '/src/build/index.html')) {
            let code = fs.readFileSync(__dirname + '/src/build/index.html').toString('utf8');
            code = code.replace(/<script>const script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);
            code = code.replace(/<script>var script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);

            fs.writeFileSync(__dirname + '/src/build/index.html', code);
        }
        done();
    });

    gulp.task('6-patch-dep',  gulp.series('5-copy-dep', '6-patch'));

    gulp.task('buildReact', gulp.series('6-patch-dep'));
}

module.exports = init;