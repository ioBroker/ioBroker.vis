'use strict';

const gulp     = require('gulp');
const fs       = require('fs');
const path     = require('path');
const cp       = require('child_process');
const axios    = require('axios');
const unzipper = require('unzipper');

function deleteFoldersRecursive(path, exceptions) {
    if (fs.existsSync(path)) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            const files = fs.readdirSync(path);
            for (const file of files) {
                const curPath = `${path}/${file}`;
                if (exceptions && exceptions.find(e => curPath.endsWith(e))) {
                    continue;
                }

                const stat = fs.statSync(curPath);
                if (stat.isDirectory()) {
                    deleteFoldersRecursive(curPath);
                    fs.rmdirSync(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
        } else {
            fs.unlinkSync(path);
        }
    }
}

function buildRuntime() {
    return new Promise((resolve, reject) => {
        const options = {
            stdio: 'pipe',
            cwd:   `${__dirname}/runtime/`,
        };

        const version = JSON.parse(fs.readFileSync(`${__dirname}/package.json`).toString('utf8')).version;
        const data = JSON.parse(fs.readFileSync(`${__dirname}/runtime/package.json`).toString('utf8'));
        if (data.version !== version) {
            data.version = version;
            fs.writeFileSync(`${__dirname}/runtime/package.json`, JSON.stringify(data, null, 4));
        }

        console.log(options.cwd);

        let script = `${__dirname}/runtime/node_modules/@craco/craco/dist/bin/craco.js`;
        if (!fs.existsSync(script)) {
            script = `${__dirname}/node_modules/@craco/craco/dist/bin/craco.js`;
        }

        if (!fs.existsSync(script)) {
            console.error(`Cannot find execution file: ${script}`);
            reject(`Cannot find execution file: ${script}`);
        } else {
            const cmd = `node ${script} --max-old-space-size=7000 build`;
            const child = cp.exec(cmd, { cwd: `${__dirname}/runtime` });

            child.stderr.pipe(process.stderr);
            child.stdout.pipe(process.stdout);

            child.on('exit', (code /* , signal */) => {
                // code 1 is a strange error that cannot be explained. Everything is installed but error :(
                if (code && code !== 1) {
                    reject(`Cannot install: ${code}`);
                } else {
                    console.log(`"${cmd} in ${__dirname}/runtime finished.`);
                    // command succeeded
                    resolve(null);
                }
            });
        }
    });
}

gulp.task('runtime-0-clean', done => {
    deleteFoldersRecursive(`${__dirname}/runtime`, ['node_modules', 'package-lock.json']);
    done();
});

gulp.task('runtime-1-copy-src', done => {
    !fs.existsSync(`${__dirname}/runtime`) && fs.mkdirSync(`${__dirname}/runtime`);
    !fs.existsSync(`${__dirname}/runtime/src`) && fs.mkdirSync(`${__dirname}/runtime/src`);
    !fs.existsSync(`${__dirname}/runtime/src/Vis`) && fs.mkdirSync(`${__dirname}/runtime/src/Vis`);
    !fs.existsSync(`${__dirname}/runtime/src/i18n`) && fs.mkdirSync(`${__dirname}/runtime/src/i18n`);
    !fs.existsSync(`${__dirname}/runtime/public`) && fs.mkdirSync(`${__dirname}/runtime/public`);
    copyFolder(`${__dirname}/src/public`, `${__dirname}/runtime/public`, ['ace', 'visEditWords.js']);
    let text = fs.readFileSync(`${__dirname}/runtime/public/index.html`).toString('utf-8');
    let runtimeText = text.replace('<title>Editor.vis</title>', '<title>ioBroker.vis</title>');
    runtimeText = runtimeText.replace('faviconEdit.ico', 'favicon.ico');
    if (runtimeText !== text) {
        fs.writeFileSync(`${__dirname}/runtime/public/index.html`, runtimeText);
    }

    copyFolder(`${__dirname}/src/src/Vis`, `${__dirname}/runtime/src/Vis`,  ['visContextMenu.jsx', 'oldVis.jsx', 'visOrderMenu.jsx', 'BulkEditor.jsx']);
    copyFolder(`${__dirname}/src/src/img`, `${__dirname}/runtime/src/img`);

    fs.writeFileSync(`${__dirname}/runtime/src/Vis/visOrderMenu.jsx`, `
import React from 'react';

class VisOrderMenu extends React.Component {
    render() {
        return null;
    }
}

export default VisOrderMenu;

`);

    fs.writeFileSync(`${__dirname}/runtime/src/Vis/Widgets/JQui/BulkEditor.jsx`, `
import React from 'react';

class BulkEditor extends React.Component {
    render() {
        return null;
    }
    
    static async generateFields() {
        return false;
    }
}

export default BulkEditor;

`);

    const pack = JSON.parse(fs.readFileSync(`${__dirname}/src/package.json`).toString());
    delete pack.dependencies['@devbookhq/splitter'];
    delete pack.dependencies['ace-builds'];
    delete pack.dependencies['iobroker.type-detector'];
    delete pack.dependencies['mui-nested-menu'];
    delete pack.dependencies['react-ace'];
    delete pack.dependencies['react-dnd'];
    delete pack.dependencies['react-dnd-html5-backend'];
    delete pack.dependencies['react-dnd-preview'];
    delete pack.dependencies['react-dnd-touch-backend'];
    delete pack.dependencies['react-dropzone'];

    fs.writeFileSync(`${__dirname}/runtime/package.json`, JSON.stringify(pack, null, 2));
    fs.writeFileSync(`${__dirname}/runtime/craco.config.js`, fs.readFileSync(`${__dirname}/src/craco.config.js`));
    fs.writeFileSync(`${__dirname}/runtime/modulefederation.config.js`, fs.readFileSync(`${__dirname}/src/modulefederation.config.js`));
    fs.writeFileSync(`${__dirname}/runtime/src/App.jsx`, fs.readFileSync(`${__dirname}/src/src/Runtime.jsx`));
    fs.writeFileSync(`${__dirname}/runtime/tsconfig.json`, fs.readFileSync(`${__dirname}/src/tsconfig.json`));
    fs.writeFileSync(`${__dirname}/runtime/src/Store.tsx`, fs.readFileSync(`${__dirname}/src/src/Store.tsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/serviceWorker.jsx`, fs.readFileSync(`${__dirname}/src/src/serviceWorker.jsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/index.jsx`, fs.readFileSync(`${__dirname}/src/src/index.jsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/theme.jsx`, fs.readFileSync(`${__dirname}/src/src/theme.jsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/bootstrap.jsx`, fs.readFileSync(`${__dirname}/src/src/bootstrap.jsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/index.css`, fs.readFileSync(`${__dirname}/src/src/index.css`));
    copyFolder(`${__dirname}/src/src/i18nRuntime`, `${__dirname}/runtime/src/i18n`);
    done();
});

gulp.task('runtime-2-npm', () => {
    return npmInstall(`${__dirname}/runtime`);
});

gulp.task('runtime-2-npm-dep', gulp.series('runtime-0-clean', 'runtime-1-copy-src', 'runtime-2-npm'));

gulp.task('runtime-4-build', () => buildRuntime());

gulp.task('runtime-4-build-dep', gulp.series('runtime-2-npm-dep', 'runtime-4-build'));

function copyRuntimeFiles() {
    copyFolder(path.join(__dirname, 'runtime/build'), path.join(__dirname, 'www'), ['asset-manifest.json']);
    return Promise.resolve();
}

gulp.task('runtime-6-copy', () => copyRuntimeFiles());

gulp.task('runtime-6-copy-dep', gulp.series('runtime-4-build-dep', 'runtime-6-copy'));

gulp.task('runtime-7-patch', done => {
    patchFile(`${__dirname}/www/index.html`);
    patchFile(`${__dirname}/runtime/build/index.html`);
    done();
});

gulp.task('runtime-7-patch-dep',  gulp.series('runtime-6-copy-dep', 'runtime-7-patch'));

gulp.task('0-clean', done => {
    deleteFoldersRecursive(`${__dirname}/src/build`);
    deleteFoldersRecursive(`${__dirname}/www`);
    done();
});

function npmInstall(dir) {
    dir = dir || `${__dirname}/src/`;
    return new Promise((resolve, reject) => {
        // Install node modules
        const cwd = dir.replace(/\\/g, '/');

        const cmd = `npm install -f`;
        console.log(`"${cmd} in ${cwd}`);

        // System call used for update of js-controller itself,
        // because during the installation of the npm packet will be deleted too, but some files must be loaded even during the installation process.
        const child = cp.exec(cmd, {cwd});

        child.stderr.pipe(process.stderr);
        child.stdout.pipe(process.stdout);

        child.on('exit', (code /* , signal */) => {
            // code 1 is a strange error that cannot be explained. Everything is installed but error :(
            if (code && code !== 1) {
                reject(`Cannot install: ${code}`);
            } else {
                console.log(`"${cmd} in ${cwd} finished.`);
                // command succeeded
                resolve(null);
            }
        });
    });
}

gulp.task('2-npm', () => {
    if (fs.existsSync(`${__dirname}/src/node_modules`)) {
        return Promise.resolve();
    } else {
        return npmInstall();
    }
});

gulp.task('2-npm-dep', gulp.series('0-clean', '2-npm'));

gulp.task('3-svg-icons', done => {
    const svgPath = path.join(__dirname, 'src/node_modules/@material-icons/svg/');
    const data = JSON.parse(fs.readFileSync(`${svgPath}data.json`).toString('utf8'));
    !fs.existsSync(`${__dirname}/src/public/material-icons`) && fs.mkdirSync(`${__dirname}/src/public/material-icons`);
    fs.writeFileSync(`${__dirname}/src/public/material-icons/index.json`, JSON.stringify(data.icons));
    const folders = fs.readdirSync(`${svgPath}svg`);
    const result = {};
    folders.forEach(folder => {
        const files = fs.readdirSync(`${svgPath}svg/${folder}`);

        files.forEach(file => {
            result[file] = result[file] || {};
            let data = fs.readFileSync(`${svgPath}svg/${folder}/${file}`).toString('utf8');
            // add currentColor
            data = data.replace(/<path /g, '<path fill="currentColor" ');
            data = data.replace(/<circle /g, '<circle fill="currentColor" ');
            if (data.includes('line')) {
                console.log(`"${file} in ${folder} has fill or stroke`);
            }

            result[file][folder] = Buffer.from(data).toString('base64');
            // console.log(pako.inflate(Buffer.from(result[file][folder], 'base64'), {to: 'string'}));
        });
    });
    Object.keys(result).forEach(file =>
        fs.writeFileSync(`${__dirname}/src/public/material-icons/${file.replace('.svg', '')}.json`, JSON.stringify(result[file])));

    // prepare https://github.com/OpenAutomationProject/knx-uf-iconset/archive/refs/heads/master.zip
    if (!fs.existsSync(`${__dirname}/knx-uf-iconset/master.zip`)) {
        axios('https://github.com/OpenAutomationProject/knx-uf-iconset/archive/refs/heads/master.zip', {responseType: 'arraybuffer'})
            .then(async res => {
                !fs.existsSync(`${__dirname}/knx-uf-iconset`) && fs.mkdirSync(`${__dirname}/knx-uf-iconset`);
                fs.writeFileSync(`${__dirname}/knx-uf-iconset/master.zip`, res.data);

                const zip = fs.createReadStream(`${__dirname}/knx-uf-iconset/master.zip`).pipe(unzipper.Parse({forceStream: true}));
                for await (const entry of zip) {
                    const fileName = entry.path;
                    if (entry.type === 'File' && fileName.endsWith('.svg')) {
                        entry.pipe(fs.createWriteStream(`${__dirname}/knx-uf-iconset/${path.basename(fileName)}`));
                    } else {
                        entry.autodrain();
                    }
                }

                // prepare KNX-UF icons
                const files = fs.readdirSync(`${__dirname}/knx-uf-iconset/`).filter(file => file.endsWith('.svg'));
                const result = {}
                for (let f = 0; f < files.length; f++) {
                    let data = fs.readFileSync(`${__dirname}/knx-uf-iconset/${files[f]}`).toString('utf8');
                    // add currentColor
                    data = data.replace(/fill="#FFFFFF"/g, 'fill="currentColor"');
                    data = data.replace(/stroke="#FFFFFF"/g, 'stroke="currentColor"');
                    data = data.replace(/fill:#FFFFFF/g, 'fill:currentColor');
                    data = data.replace(/stroke:#FFFFFF/g, 'stroke:currentColor');
                    data = data.replace(/xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"\s?/g, '');
                    data = data.replace(/<!DOCTYPE\s[^>]+>\s?/g, '');
                    data = data.replace(/x="0px"\s?/g, '');
                    data = data.replace(/y="0px"\s?/g, '');
                    data = data.replace(/<!--[^>]+>/g, '');
                    data = data.replace(/\s?xml:space="preserve"/g, '');
                    data = data.replace(/\r\n/g, '\n');
                    data = data.replace(/\n\n/g, '\n');
                    data = data.replace(/\n\n/g, '\n');
                    data = data.replace(/\sid="([^"]+)?"/g, '');
                    data = data.replace(/<g>\n<\/g>\n?/g, '');
                    data = data.replace(/<g>\n<\/g>\n?/g, '');

                    result[files[f].replace('.svg', '')] = Buffer.from(data).toString('base64');
                }

                fs.writeFileSync(`${__dirname}/src/public/material-icons/knx-uf.json`, JSON.stringify(result));
                done();
            });
    } else {
        done();
    }
});

function build() {
    // copy ace files into src/public/lib/js/ace
    let ace = `${__dirname}/src/node_modules/ace-builds/src-min-noconflict/`;
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/worker-html.js`, fs.readFileSync(`${ace}worker-html.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/mode-html.js`, fs.readFileSync(`${ace}mode-html.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/snippets/html.js`, fs.readFileSync(`${ace}snippets/html.js`));

    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/worker-css.js`, fs.readFileSync(`${ace}worker-css.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/mode-css.js`, fs.readFileSync(`${ace}mode-css.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/snippets/css.js`, fs.readFileSync(`${ace}snippets/css.js`));

    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/mode-json.js`, fs.readFileSync(`${ace}mode-json.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/worker-json.js`, fs.readFileSync(`${ace}worker-json.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/snippets/json.js`, fs.readFileSync(`${ace}snippets/json.js`));

    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/mode-javascript.js`, fs.readFileSync(`${ace}mode-javascript.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/worker-javascript.js`, fs.readFileSync(`${ace}worker-javascript.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/snippets/javascript.js`, fs.readFileSync(`${ace}snippets/javascript.js`));

    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/ext-language_tools.js`, fs.readFileSync(`${ace}ext-language_tools.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/ext-searchbox.js`, fs.readFileSync(`${ace}ext-searchbox.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/theme-clouds_midnight.js`, fs.readFileSync(`${ace}theme-clouds_midnight.js`));
    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/theme-chrome.js`, fs.readFileSync(`${ace}theme-chrome.js`));

    fs.writeFileSync(`${__dirname}/src/public/lib/js/ace/ace.js`, fs.readFileSync(`${ace}ace.js`));

    // synchronise i18n: copy all new words from runtime into src
    const langsRuntime = {
        en: require('./src/src/i18nRuntime/en.json'),
    };
    const langsEditor = {
        en: require('./src/src/i18n/en.json'),
    };
    Object.keys(langsRuntime.en).forEach(key => {
        if (!langsEditor.en[key]) {
            // load all languages
            if (!langsEditor.de) {
                fs.readdirSync(`${__dirname}/src/src/i18nRuntime`).forEach(file => {
                    langsRuntime[file.replace('.json', '')] = require(`./src/src/i18nRuntime/${file}`);
                    langsEditor[file.replace('.json', '')] = require(`./src/src/i18n/${file}`);
                });
            }
            Object.keys(langsEditor).forEach(lang => langsEditor[lang][key] = langsRuntime[lang][key]);
        }
    });

    if (langsEditor.de) {
        Object.keys(langsEditor).forEach(lang =>
            fs.writeFileSync(`${__dirname}/src/src/i18n/${lang}.json`, JSON.stringify(langsEditor[lang], null, 2)));
    }

    return new Promise((resolve, reject) => {
        const options = {
            stdio: 'pipe',
            cwd:   `${__dirname}/src/`
        };

        const version = JSON.parse(fs.readFileSync(`${__dirname}/package.json`).toString('utf8')).version;
        const data = JSON.parse(fs.readFileSync(`${__dirname}/src/package.json`).toString('utf8'));
        data.version = version;
        fs.writeFileSync(`${__dirname}/src/package.json`, JSON.stringify(data, null, 4));

        console.log(options.cwd);

        let script = `${__dirname}/src/node_modules/@craco/craco/dist/bin/craco.js`;
        if (!fs.existsSync(script)) {
            script = `${__dirname}/node_modules/@craco/craco/dist/bin/craco.js`;
        }
        if (!fs.existsSync(script)) {
            console.error(`Cannot find execution file: ${script}`);
            reject(`Cannot find execution file: ${script}`);
        } else {
            const cmd = `node ${script} --max-old-space-size=7000 build`;
            const child = cp.exec(cmd, { cwd: `${__dirname}/src` });

            child.stderr.pipe(process.stderr);
            child.stdout.pipe(process.stdout);

            child.on('exit', (code /* , signal */) => {
                // code 1 is a strange error that cannot be explained. Everything is installed but error :(
                if (code && code !== 1) {
                    reject(`Cannot install: ${code}`);
                } else {
                    console.log(`"${cmd} in ${__dirname}/src finished.`);
                    // command succeeded
                    resolve(null);
                }
            });
        }
    });
}

gulp.task('4-build', () => build());

gulp.task('4-build-dep', gulp.series('2-npm-dep', '3-svg-icons', '4-build'));

function copyFiles() {
    copyFolder(path.join(__dirname, 'src/build'), path.join(__dirname, 'www'), ['index.html']);
    fs.writeFileSync(path.join(__dirname, 'www/edit.html'), fs.readFileSync(path.join(__dirname, 'src', 'build', 'index.html')));
    return Promise.resolve();
}

gulp.task('6-copy', () => copyFiles());

gulp.task('6-copy-dep', gulp.series('4-build-dep', '6-copy'));

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
            const curSource = path.join(source, file).replace(/\\/g, '/');
            const curTarget = path.join(target, file).replace(/\\/g, '/');
            if (ignore && ignore.includes(file)) {
                return;
            }
            if (ignore && ignore.find(pattern => pattern.startsWith('.') && file.endsWith(pattern))) {
                // check that file is smaller than 8MB
                if (fs.lstatSync(curSource).size > 8 * 1024 * 1024) {
                    return;
                }
            }

            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolder(curSource, curTarget, ignore);
            } else {
                fs.writeFileSync(curTarget, fs.readFileSync(curSource));
            }
        });
    } else {
        fs.writeFileSync(target, fs.readFileSync(source));
    }
}

gulp.task('7-patch', done => {
    patchFile(`${__dirname}/www/edit.html`);
    patchFile(`${__dirname}/src/build/index.html`);
    patchFile(`${__dirname}/src/build/edit.html`);
    fs.existsSync(`${__dirname}/www/marketplaceConfig.sample.js`) && fs.unlinkSync(`${__dirname}/www/marketplaceConfig.sample.js`);
    done();
});

gulp.task('7-patch-dep',  gulp.series('6-copy-dep', '7-patch'));

gulp.task('buildReact', gulp.series('7-patch-dep', 'runtime-7-patch-dep'));

gulp.task('default', gulp.series('buildReact'));
