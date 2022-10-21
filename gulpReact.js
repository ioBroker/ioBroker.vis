/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
'use strict';
const fs   = require('fs');
const path = require('path');
const cp   = require('child_process');

function init(gulp) {
    gulp.task('0-clean', done => {
        delFolder(path.join(__dirname, 'src/build'));
        delFolder(path.join(__dirname, 'beta'));
        delFolder(path.join(__dirname, 'www'));
        done();
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

    gulp.task('2-npm-dep', gulp.series('0-clean', '2-npm'));

    function build() {
        // copy ace files into src/public/lib/js/ace
        let ace = __dirname + '/src/node_modules/ace-builds/src-min-noconflict/';
        fs.writeFileSync(__dirname + '/src/public/lib/js/ace/worker-css.js', fs.readFileSync(ace + 'worker-css.js'));
        fs.writeFileSync(__dirname + '/src/public/lib/js/ace/worker-html.js', fs.readFileSync(ace + 'worker-html.js'));
        fs.writeFileSync(__dirname + '/src/public/lib/js/ace/worker-javascript.js', fs.readFileSync(ace + 'worker-javascript.js'));
        fs.writeFileSync(__dirname + '/src/public/lib/js/ace/worker-json.js', fs.readFileSync(ace + 'worker-json.js'));

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

            let script = __dirname + '/src/node_modules/@craco/craco/bin/craco.js';
            if (!fs.existsSync(script)) {
                script = __dirname + '/node_modules/@craco/craco/bin/craco.js';
            }
            if (!fs.existsSync(script)) {
                console.error('Cannot find execution file: ' + script);
                reject('Cannot find execution file: ' + script);
            } else {
                const child = cp.fork(script, ['build'], options);
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
        copyFolder(path.join(__dirname, 'src/build'), path.join(__dirname, 'www'));
        fs.writeFileSync(path.join(__dirname, 'www/edit.html'), fs.readFileSync(path.join(__dirname, 'src', 'build', 'index.html')));
        return Promise.resolve();
    }

    gulp.task('5-copy', () => copyFiles());

    gulp.task('5-copy-dep', gulp.series('3-build-dep', '5-copy'));

    function patchFile(htmlFile) {
        if (fs.existsSync(htmlFile)) {
            let code = fs.readFileSync(htmlFile).toString('utf8');
            code = code.replace(/<script>const script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);
            code = code.replace(/<script>var script=document[^<]+<\/script>/, `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`);

            fs.writeFileSync(htmlFile, code);
        }
    }

    function copyFolder(source, target, ignore) {
        !fs.existsSync(target) && fs.mkdirSync(target);

        // Copy
        if (fs.lstatSync(source).isDirectory()) {
            const files = fs.readdirSync(source);
            files.forEach(file => {
                const curSource = path.join(source, file);
                const curTarget = path.join(target, file);
                if (ignore && ignore.includes(file)) {
                    return;
                }
                if (fs.lstatSync(curSource).isDirectory()) {
                    copyFolder(curSource, curTarget);
                } else {
                    fs.writeFileSync(curTarget, fs.readFileSync(curSource));
                }
            });
        } else {
            fs.writeFileSync(target, fs.readFileSync(source));
        }
    }

    function delFolder(folder, keepFolder) {
        if (fs.existsSync(folder)) {
            if (fs.lstatSync(folder).isDirectory()) {
                fs.readdirSync(folder).forEach(file =>
                    delFolder(path.join(folder, file)));
                !keepFolder && fs.rmdirSync(folder);
            } else {
                fs.unlinkSync(folder);
            }
        }
    }

    gulp.task('6-patch', done => {
        patchFile(__dirname + '/www/index.html');
        patchFile(__dirname + '/www/edit.html');
        patchFile(__dirname + '/src/build/index.html');
        patchFile(__dirname + '/src/build/edit.html');
        done();
    });

    gulp.task('6-patch-dep',  gulp.series('5-copy-dep', '6-patch'));

    gulp.task('buildReact', gulp.series('6-patch-dep'));

    gulp.task('7-beta', async () => {
        !fs.existsSync(path.join(__dirname, 'beta')) && fs.mkdirSync(path.join(__dirname, 'beta'));

        copyFolder(path.join(__dirname, 'admin'), path.join(__dirname, 'beta/admin'), ['i18n']);
        copyFolder(path.join(__dirname, 'img'), path.join(__dirname, 'beta/img'));
        copyFolder(path.join(__dirname, 'lib'), path.join(__dirname, 'beta/lib'));
        copyFolder(path.join(__dirname, 'www'), path.join(__dirname, 'beta/www'));
        // delete all other widgets and let only
        const baseWidgets = ['basic', 'jqplot', 'jqui', 'swipe', 'tabs'];
        const files = fs.readdirSync(path.join(__dirname, 'beta/www/widgets'));
        files.forEach(file => {
            if (!baseWidgets.includes(file) && !baseWidgets.includes(file.replace('.html', ''))) {
                delFolder(path.join(__dirname, 'beta/www/widgets', file));
            }
        });

        fs.writeFileSync(path.join(__dirname, 'beta/io-package.json'), fs.readFileSync(path.join(__dirname, 'io-package.json')));
        fs.writeFileSync(path.join(__dirname, 'beta/package.json'), fs.readFileSync(path.join(__dirname, 'package.json')));
        fs.writeFileSync(path.join(__dirname, 'beta/LICENSE'), fs.readFileSync(path.join(__dirname, 'LICENSE')));
        fs.writeFileSync(path.join(__dirname, 'beta/main.js'), fs.readFileSync(path.join(__dirname, 'main.js')));
        fs.writeFileSync(path.join(__dirname, 'beta/README.md'), fs.readFileSync(path.join(__dirname, 'README.md')));
        const ioPack = JSON.parse(fs.readFileSync(path.join(__dirname, 'beta', 'io-package.json')));
        const pack = JSON.parse(fs.readFileSync(path.join(__dirname, 'beta', 'package.json')));
        ioPack.common.name = 'vis-2-beta';
        ioPack.common.welcomeScreen.link = 'vis-2-beta/index.html';
        ioPack.common.welcomeScreen.name = 'vis 2 Runtime';
        ioPack.common.welcomeScreen.img = 'vis-2-beta/img/favicon.png';
        ioPack.common.welcomeScreenPro.link = 'vis-2-beta/edit.html';
        ioPack.common.welcomeScreenPro.name = 'vis 2 Editor';
        ioPack.common.welcomeScreenPro.img = 'vis-2-beta/img/faviconEdit.png';
        pack.name = 'iobroker.vis-2-beta';
        delete pack.scripts;
        delete pack.devDependencies;
        fs.writeFileSync(path.join(__dirname, 'beta', 'io-package.json'), JSON.stringify(ioPack, null, 2));
        fs.writeFileSync(path.join(__dirname, 'beta', 'package.json'), JSON.stringify(pack, null, 2));

        if (fs.existsSync(path.join(__dirname, '../ioBroker.vis-2-beta'))) {
            delFolder(path.join(__dirname, '../ioBroker.vis-2-beta'), true);
            copyFolder(path.join(__dirname, 'beta'), path.join(__dirname, '../ioBroker.vis-2-beta'));
        }
    });

    gulp.task('beta', gulp.series('6-patch-dep', '7-beta'));
}

module.exports = init;