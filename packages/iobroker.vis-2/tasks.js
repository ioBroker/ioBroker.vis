const fs = require('node:fs');
const path = require('node:path');
const { deleteFoldersRecursive, buildReact, npmInstall } = require('@iobroker/build-tools');
const axios = require('axios');
const unzipper = require('unzipper');
const { mkdirSync, writeFileSync } = require('node:fs');
const rootDir = path.join(__dirname, '..', '..');

function clean() {
    deleteFoldersRecursive(`${__dirname}/www`);
    deleteFoldersRecursive(`${__dirname}/../../www`);
    deleteFoldersRecursive(`${__dirname}/runtime`, ['node_modules', 'package-lock.json']);
}

function copyRuntimeSrc() {
    !fs.existsSync(`${__dirname}/runtime`) && fs.mkdirSync(`${__dirname}/runtime`);
    !fs.existsSync(`${__dirname}/runtime/src-vis`) && fs.mkdirSync(`${__dirname}/runtime/src`);
    // copy only a single shared utils file now
    !fs.existsSync(`${__dirname}/runtime/src-vis/Vis`) && fs.mkdirSync(`${__dirname}/runtime/src/Vis`);
    !fs.existsSync(`${__dirname}/runtime/src-vis/Utils`) && fs.mkdirSync(`${__dirname}/runtime/src/Utils`);
    !fs.existsSync(`${__dirname}/runtime/src-vis/i18n`) && fs.mkdirSync(`${__dirname}/runtime/src/i18n`);
    !fs.existsSync(`${__dirname}/runtime/public`) && fs.mkdirSync(`${__dirname}/runtime/public`);
    copyFolder(`${__dirname}/src-vis/public`, `${__dirname}/runtime/public`, ['ace', 'visEditWords.js']);
    fs.writeFileSync(`${__dirname}/runtime/index.html`, fs.readFileSync(`${__dirname}/src-vis/index.html`));
    let text = fs.readFileSync(`${__dirname}/runtime/index.html`).toString('utf-8');
    let runtimeText = text.replace('<title>Editor.vis</title>', '<title>ioBroker.vis</title>');
    runtimeText = runtimeText.replace('faviconEdit.ico', 'favicon.ico');
    if (runtimeText !== text) {
        fs.writeFileSync(`${__dirname}/runtime/public/index.html`, runtimeText);
    }

    copyFolder(`${__dirname}/src-vis/src/Vis`, `${__dirname}/runtime/src/Vis`, [
        'visContextMenu.tsx',
        'oldVis.jsx',
        'visOrderMenu.tsx',
        'BulkEditor.tsx',
    ]);
    copyFolder(`${__dirname}/src-vis/src/img`, `${__dirname}/runtime/src/img`);

    fs.writeFileSync(
        `${__dirname}/runtime/src/Vis/visOrderMenu.tsx`,
        `
import React from 'react';

class VisOrderMenu extends React.Component<any, any> {
    render(): React.ReactNode {
        return null;
    }
}

export default VisOrderMenu;

`,
    );

    fs.writeFileSync(
        `${__dirname}/runtime/src/Vis/Widgets/JQui/BulkEditor.tsx`,
        `
import React from 'react';

class BulkEditor extends React.Component<any, any> {
    render(): React.ReactNode  {
        return null;
    }
    
    static async generateFields(): Promise<any> {
        return false;
    }
}

export default BulkEditor;

`,
    );

    fs.writeFileSync(
        `${__dirname}/runtime/src/Vis/Widgets/Basic/FiltersEditorDialog.tsx`,
        `
import React from 'react';

class FiltersEditorDialog extends React.Component<any, any> {
    render(): React.ReactNode {
        return null;
    }
}

export default FiltersEditorDialog;

`,
    );

    const pack = JSON.parse(fs.readFileSync(`${__dirname}/src-vis/package.json`).toString());
    delete pack.devDependencies['@devbookhq/splitter'];
    delete pack.devDependencies['ace-builds'];
    delete pack.devDependencies['iobroker.type-detector'];
    delete pack.devDependencies['mui-nested-menu'];
    delete pack.devDependencies['react-ace'];
    delete pack.devDependencies['react-dnd'];
    delete pack.devDependencies['react-dnd-html5-backend'];
    delete pack.devDependencies['react-dnd-preview'];
    delete pack.devDependencies['react-dnd-touch-backend'];
    delete pack.devDependencies['react-beautiful-dnd'];
    delete pack.devDependencies['react-dropzone'];
    delete pack.devDependencies['html-to-image'];
    delete pack.devDependencies['react-dropzone'];
    delete pack.devDependencies['@iobroker/vis-2-widgets-testing'];
    delete pack.devDependencies['@types/react-beautiful-dnd'];

    fs.writeFileSync(`${__dirname}/runtime/package.json`, JSON.stringify(pack, null, 2));
    fs.writeFileSync(`${__dirname}/runtime/vite.config.ts`, fs.readFileSync(`${__dirname}/src-vis/vite.config.ts`));
    fs.writeFileSync(`${__dirname}/runtime/modulefederation.vis.config.js`, fs.readFileSync(`${__dirname}/src-vis/modulefederation.vis.config.js`));
    fs.writeFileSync(`${__dirname}/runtime/modulefederation.vis.config.d.ts`, fs.readFileSync(`${__dirname}/src-vis/modulefederation.vis.config.d.ts`));
    fs.writeFileSync(`${__dirname}/runtime/modulefederation.config.js`, fs.readFileSync(`${__dirname}/src-vis/modulefederation.config.js`));
    fs.writeFileSync(
        `${__dirname}/runtime/modulefederation.config.js`,
        fs.readFileSync(`${__dirname}/src-vis/modulefederation.config.js`),
    );
    fs.writeFileSync(`${__dirname}/runtime/src/Editor.tsx`, fs.readFileSync(`${__dirname}/src-vis/src/Runtime.tsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/version.json`, fs.readFileSync(`${__dirname}/src-vis/src/version.json`));
    fs.writeFileSync(`${__dirname}/runtime/tsconfig.json`, fs.readFileSync(`${__dirname}/src-vis/tsconfig.json`));
    fs.writeFileSync(`${__dirname}/runtime/src/Store.tsx`, fs.readFileSync(`${__dirname}/src-vis/src/Store.tsx`));
    fs.writeFileSync(
        `${__dirname}/runtime/src/Utils/utils.tsx`,
        fs.readFileSync(`${__dirname}/src-vis/src/Utils/utils.tsx`),
    );
    fs.writeFileSync(
        `${__dirname}/runtime/src/serviceWorker.tsx`,
        fs.readFileSync(`${__dirname}/src-vis/src/serviceWorker.tsx`),
    );
    fs.writeFileSync(`${__dirname}/runtime/src/index.tsx`, fs.readFileSync(`${__dirname}/src-vis/src/index.tsx`));
    fs.writeFileSync(`${__dirname}/runtime/src/theme.tsx`, fs.readFileSync(`${__dirname}/src-vis/src/theme.tsx`));
    fs.writeFileSync(
        `${__dirname}/runtime/src/bootstrap.tsx`,
        fs.readFileSync(`${__dirname}/src-vis/src/bootstrap.tsx`),
    );
    fs.writeFileSync(`${__dirname}/runtime/src/index.css`, fs.readFileSync(`${__dirname}/src-vis/src/index.css`));
    fs.writeFileSync(
        `${__dirname}/runtime/src/Utils/styles.tsx`,
        'const commonStyles: Record<string, any> = {};\nexport default commonStyles;',
    );
    copyFolder(`${__dirname}/src-vis/src/i18nRuntime`, `${__dirname}/runtime/src/i18n`);
}

function copyRuntimeDist() {
    copyFolder(path.join(__dirname, 'runtime/build'), path.join(__dirname, 'www'), ['asset-manifest.json']);
}

function patchRuntime() {
    patchFile(`${__dirname}/www/index.html`);
    patchFile(`${__dirname}/runtime/build/index.html`);
    copyFolder(`${__dirname}/www`, `${__dirname}/../../www`);
}

function updateFile(fileName, data) {
    const oldData = fs.readFileSync(fileName).toString('utf8').replace(/\r\n/g, '\n');
    data = data.replace(/\r\n/g, '\n');
    if (oldData !== data) {
        fs.writeFileSync(fileName, data);
    }
}

async function generateSvgFiles() {
    const svgPath = path.join(__dirname, '/../../node_modules/@material-icons/svg/');
    const data = JSON.parse(fs.readFileSync(`${svgPath}data.json`).toString('utf8'));

    !fs.existsSync(`${__dirname}/src-vis/public/material-icons`) &&
        fs.mkdirSync(`${__dirname}/src-vis/public/material-icons`);

    updateFile(`${__dirname}/src-vis/public/material-icons/index.json`, JSON.stringify(data.icons));

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

    Object.keys(result).forEach(file => {
        updateFile(
            `${__dirname}/src-vis/public/material-icons/${file.replace('.svg', '')}.json`,
            JSON.stringify(result[file]),
        );
    });

    // prepare https://github.com/OpenAutomationProject/knx-uf-iconset/archive/refs/heads/master.zip
    if (!fs.existsSync(`${__dirname}/knx-uf-iconset/master.zip`)) {
        const res = await axios(
            'https://github.com/OpenAutomationProject/knx-uf-iconset/archive/refs/heads/master.zip',
            { responseType: 'arraybuffer' },
        );
        !fs.existsSync(`${__dirname}/knx-uf-iconset`) && fs.mkdirSync(`${__dirname}/knx-uf-iconset`);
        fs.writeFileSync(`${__dirname}/knx-uf-iconset/master.zip`, res.data);

        const zip = fs
            .createReadStream(`${__dirname}/knx-uf-iconset/master.zip`)
            .pipe(unzipper.Parse({ forceStream: true }));
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
        const result = {};
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

        updateFile(`${__dirname}/src-vis/public/material-icons/knx-uf.json`, JSON.stringify(result));
    }
}

function syncFiles(target, dest) {
    let dataSource = fs.readFileSync(dest).toString('utf8');
    // remove all CR/LF
    dataSource = dataSource.replace(/\r\n/g, '\n');
    if (fs.existsSync(target)) {
        let dataTarget = fs.readFileSync(target).toString('utf8');
        dataTarget = dataTarget.replace(/\r\n/g, '\n');
        if (dataTarget !== dataSource) {
            fs.writeFileSync(target, dataSource);
        }
    } else {
        fs.writeFileSync(target, dataSource);
    }
}

function buildEditor() {
    // copy ace files into src-vis/public/lib/js/ace
    let ace = `${rootDir}/node_modules/ace-builds/src-min-noconflict/`;
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/worker-html.js`, `${ace}worker-html.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/mode-html.js`, `${ace}mode-html.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/snippets/html.js`, `${ace}snippets/html.js`);

    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/worker-css.js`, `${ace}worker-css.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/mode-css.js`, `${ace}mode-css.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/snippets/css.js`, `${ace}snippets/css.js`);

    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/mode-json.js`, `${ace}mode-json.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/worker-json.js`, `${ace}worker-json.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/snippets/json.js`, `${ace}snippets/json.js`);

    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/mode-javascript.js`, `${ace}mode-javascript.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/worker-javascript.js`, `${ace}worker-javascript.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/snippets/javascript.js`, `${ace}snippets/javascript.js`);

    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/ext-language_tools.js`, `${ace}ext-language_tools.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/ext-searchbox.js`, `${ace}ext-searchbox.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/theme-clouds_midnight.js`, `${ace}theme-clouds_midnight.js`);
    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/theme-chrome.js`, `${ace}theme-chrome.js`);

    syncFiles(`${__dirname}/src-vis/public/lib/js/ace/ace.js`, `${ace}ace.js`);

    // synchronise i18n: copy all new words from runtime into src
    const langsRuntime = {
        en: require('./src-vis/src/i18nRuntime/en.json'),
    };
    const langsEditor = {
        en: require('./src-vis/src/i18n/en.json'),
    };
    Object.keys(langsRuntime.en).forEach(key => {
        if (!langsEditor.en[key]) {
            // load all languages
            if (!langsEditor.de) {
                fs.readdirSync(`${__dirname}/src-vis/src/i18nRuntime`).forEach(file => {
                    langsRuntime[file.replace('.json', '')] = require(`./src-vis/src/i18nRuntime/${file}`);
                    langsEditor[file.replace('.json', '')] = require(`./src-vis/src/i18n/${file}`);
                });
            }
            Object.keys(langsEditor).forEach(lang => (langsEditor[lang][key] = langsRuntime[lang][key]));
        }
    });

    if (langsEditor.de) {
        Object.keys(langsEditor).forEach(lang =>
            fs.writeFileSync(`${__dirname}/src-vis/src/i18n/${lang}.json`, JSON.stringify(langsEditor[lang], null, 2)),
        );
    }

    return buildReact(`${__dirname}/src-vis/`, { vite: true, ramSize: 7000, rootDir: `${__dirname}/../../` });
}

function copyAllFiles() {
    copyFolder(path.join(__dirname, 'src-vis/build'), path.join(__dirname, 'www'), ['index.html']);
    fs.writeFileSync(
        path.join(__dirname, 'www/edit.html'),
        fs.readFileSync(path.join(__dirname, 'src-vis', 'build', 'index.html')),
    );
}

function copyBackend() {
    if (!fs.existsSync(`${__dirname}/lib`)) {
        mkdirSync(`${__dirname}/lib`);
    }
    writeFileSync(`${__dirname}/lib/states.js`, fs.readFileSync(`${__dirname}/build-backend/lib/states.js`));
    writeFileSync(
        `${__dirname}/build-backend/lib/cloudCert.crt`,
        fs.readFileSync(`${__dirname}/src/lib/cloudCert.crt`),
    );
    writeFileSync(
        `${__dirname}/build-backend/lib/updating.html`,
        fs.readFileSync(`${__dirname}/src/lib/updating.html`),
    );
}

function patchFile(htmlFile) {
    if (fs.existsSync(htmlFile)) {
        let code = fs.readFileSync(htmlFile).toString('utf8');
        code = code.replace(
            /<script>[\s\S]*const script\s?=\s?document[^<]+<\/script>/,
            `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`,
        );
        code = code.replace(
            /<script>[\s\S]*var script=document[^<]+<\/script>/,
            `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`,
        );

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

function patchEditor() {
    patchFile(`${__dirname}/www/edit.html`);
    patchFile(`${__dirname}/www/index.html`);
    patchFile(`${__dirname}/src-vis/build/index.html`);
    patchFile(`${__dirname}/src-vis/build/edit.html`);
    if (fs.existsSync(`${__dirname}/www/marketplaceConfig.sample.js`)) {
        fs.unlinkSync(`${__dirname}/www/marketplaceConfig.sample.js`);
    }

    copyFolder(`${__dirname}/www`, `${__dirname}/../../www`);
    fs.writeFileSync(`${__dirname}/../../io-package.json`, fs.readFileSync(`${__dirname}/io-package.json`).toString());
    fs.writeFileSync(`${__dirname}/../../main.js`, fs.readFileSync(`${__dirname}/build-backend/main.js`).toString());
    copyFolder(`${__dirname}/build-backend/lib`, `${__dirname}/../../lib`);

    let readme = fs.readFileSync(`${__dirname}/../../README.md`).toString('utf8');
    readme = readme.replaceAll('packages/iobroker.vis-2/', '');
    fs.writeFileSync(`${__dirname}/README.md`, readme);
}

if (process.argv.includes('--runtime-0-clean')) {
    clean();
} else if (process.argv.includes('--runtime-1-copy-src')) {
    copyRuntimeSrc();
} else if (process.argv.includes('--runtime-2-npm')) {
    npmInstall(`${__dirname}/runtime`).catch(e => console.error(`Cannot install: ${e}`));
} else if (process.argv.includes('--runtime-3-build')) {
    buildReact(`${__dirname}/runtime/`, { vite: true, ramSize: 7000, rootDir: `${__dirname}/../../` }).catch(e =>
        console.error(`Cannot build: ${e}`),
    );
} else if (process.argv.includes('--runtime-4-copy')) {
    copyRuntimeDist();
} else if (process.argv.includes('--runtime-5-patch')) {
    patchRuntime();
} else if (process.argv.includes('--0-clean')) {
    deleteFoldersRecursive(`${__dirname}/src-vis/build`);
} else if (process.argv.includes('--1-npm')) {
    if (!fs.existsSync(`${__dirname}/src-vis/node_modules`)) {
        npmInstall(`${__dirname}/src-vis`).catch(e => console.error(`Cannot install: ${e}`));
    }
} else if (process.argv.includes('--2-svg-icons')) {
    generateSvgFiles().catch(e => console.error(`Cannot generate SVG icons: ${e}`));
} else if (process.argv.includes('--3-build')) {
    buildEditor().catch(e => console.error(`Cannot build: ${e}`));
} else if (process.argv.includes('--4-copy')) {
    copyAllFiles();
} else if (process.argv.includes('--5-patch')) {
    patchEditor();
} else if (process.argv.includes('--copy-backend')) {
    copyBackend();
} else {
    clean();
    copyRuntimeSrc();
    npmInstall(`${__dirname}/runtime`)
        .then(() => buildReact(`${__dirname}/runtime/`, { vite: true, ramSize: 7000, rootDir: `${__dirname}/../../` }))
        .then(() => copyRuntimeDist())
        .then(() => patchRuntime())
        .then(() => deleteFoldersRecursive(`${__dirname}/src-vis/build`))
        .then(() => {
            if (!fs.existsSync(`${__dirname}/src-vis/node_modules`)) {
                return npmInstall(`${__dirname}/src-vis`);
            }
            return Promise.resolve();
        })
        .then(() => generateSvgFiles())
        .then(() => buildEditor())
        .then(() => copyAllFiles())
        .then(() => patchEditor())
        .catch(e => console.error(`Cannot build: ${e}`));
}
