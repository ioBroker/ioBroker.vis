const {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    createReadStream,
    createWriteStream,
    readdirSync,
    lstatSync,
    unlinkSync,
} = require('node:fs');
const path = require('node:path');
const { deleteFoldersRecursive, buildReact, npmInstall } = require('@iobroker/build-tools');
const axios = require('axios');
const unzipper = require('unzipper');

function clean() {
    deleteFoldersRecursive(`${__dirname}/www`);
    deleteFoldersRecursive(`${__dirname}/runtime`, ['node_modules', 'package-lock.json']);
    const version = JSON.parse(readFileSync(`${__dirname}/package.json`, 'utf8')).version;
    writeFileSync(`${__dirname}/src-vis/src/version.json`, JSON.stringify({ version }, null, 2));
}

function copyRuntimeSrc() {
    !existsSync(`${__dirname}/runtime`) && mkdirSync(`${__dirname}/runtime`);
    !existsSync(`${__dirname}/runtime/src-vis`) && mkdirSync(`${__dirname}/runtime/src`);
    // copy only a single shared utils file now
    !existsSync(`${__dirname}/runtime/src-vis/Vis`) && mkdirSync(`${__dirname}/runtime/src/Vis`);
    !existsSync(`${__dirname}/runtime/src-vis/Utils`) && mkdirSync(`${__dirname}/runtime/src/Utils`);
    !existsSync(`${__dirname}/runtime/src-vis/i18n`) && mkdirSync(`${__dirname}/runtime/src/i18n`);
    !existsSync(`${__dirname}/runtime/public`) && mkdirSync(`${__dirname}/runtime/public`);
    copyFolder(`${__dirname}/src-vis/public`, `${__dirname}/runtime/public`, ['visEditWords.js']);
    writeFileSync(`${__dirname}/runtime/index.html`, readFileSync(`${__dirname}/src-vis/index.html`));
    let text = readFileSync(`${__dirname}/runtime/index.html`).toString('utf-8');
    let runtimeText = text.replace('<title>Editor.vis</title>', '<title>ioBroker.vis</title>');
    runtimeText = runtimeText.replace('faviconEdit.ico', 'favicon.ico');
    if (runtimeText !== text) {
        writeFileSync(`${__dirname}/runtime/index.html`, runtimeText);
    }

    copyFolder(`${__dirname}/src-vis/src/Vis`, `${__dirname}/runtime/src/Vis`, [
        'visContextMenu.tsx',
        'oldVis.jsx',
        'visOrderMenu.tsx',
        'BulkEditor.tsx',
    ]);
    copyFolder(`${__dirname}/src-vis/src/img`, `${__dirname}/runtime/src/img`);

    writeFileSync(
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

    writeFileSync(
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

    writeFileSync(
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

    const pack = JSON.parse(readFileSync(`${__dirname}/src-vis/package.json`).toString());
    delete pack.devDependencies['@devbookhq/splitter'];
    delete pack.devDependencies['@monaco-editor/react'];
    delete pack.devDependencies['iobroker.type-detector'];
    delete pack.devDependencies['mui-nested-menu'];
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

    writeFileSync(`${__dirname}/runtime/package.json`, JSON.stringify(pack, null, 2));
    writeFileSync(`${__dirname}/runtime/vite.config.ts`, readFileSync(`${__dirname}/src-vis/vite.config.ts`));
    writeFileSync(`${__dirname}/runtime/src/Editor.tsx`, readFileSync(`${__dirname}/src-vis/src/Runtime.tsx`));
    writeFileSync(`${__dirname}/runtime/src/version.json`, readFileSync(`${__dirname}/src-vis/src/version.json`));
    writeFileSync(`${__dirname}/runtime/tsconfig.json`, readFileSync(`${__dirname}/src-vis/tsconfig.json`));
    writeFileSync(`${__dirname}/runtime/src/Store.tsx`, readFileSync(`${__dirname}/src-vis/src/Store.tsx`));
    writeFileSync(`${__dirname}/runtime/src/Utils/utils.tsx`, readFileSync(`${__dirname}/src-vis/src/Utils/utils.tsx`));
    writeFileSync(
        `${__dirname}/runtime/src/serviceWorker.tsx`,
        readFileSync(`${__dirname}/src-vis/src/serviceWorker.tsx`),
    );
    writeFileSync(`${__dirname}/runtime/src/index.tsx`, readFileSync(`${__dirname}/src-vis/src/index.tsx`));
    writeFileSync(`${__dirname}/runtime/src/theme.tsx`, readFileSync(`${__dirname}/src-vis/src/theme.tsx`));
    writeFileSync(`${__dirname}/runtime/src/index.css`, readFileSync(`${__dirname}/src-vis/src/index.css`));
    writeFileSync(
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
    const oldData = readFileSync(fileName).toString('utf8').replace(/\r\n/g, '\n');
    data = data.replace(/\r\n/g, '\n');
    if (oldData !== data) {
        writeFileSync(fileName, data);
    }
}

async function generateSvgFiles() {
    const svgPath = path.join(__dirname, '/../../node_modules/@material-icons/svg/');
    const data = JSON.parse(readFileSync(`${svgPath}data.json`).toString('utf8'));

    !existsSync(`${__dirname}/src-vis/public/material-icons`) &&
        mkdirSync(`${__dirname}/src-vis/public/material-icons`);

    updateFile(`${__dirname}/src-vis/public/material-icons/index.json`, JSON.stringify(data.icons));

    const folders = readdirSync(`${svgPath}svg`);
    const result = {};
    folders.forEach(folder => {
        const files = readdirSync(`${svgPath}svg/${folder}`);

        files.forEach(file => {
            result[file] = result[file] || {};
            let data = readFileSync(`${svgPath}svg/${folder}/${file}`).toString('utf8');
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
    if (!existsSync(`${__dirname}/knx-uf-iconset/master.zip`)) {
        const res = await axios(
            'https://github.com/OpenAutomationProject/knx-uf-iconset/archive/refs/heads/master.zip',
            { responseType: 'arraybuffer' },
        );
        !existsSync(`${__dirname}/knx-uf-iconset`) && mkdirSync(`${__dirname}/knx-uf-iconset`);
        writeFileSync(`${__dirname}/knx-uf-iconset/master.zip`, res.data);

        const zip = createReadStream(`${__dirname}/knx-uf-iconset/master.zip`).pipe(
            unzipper.Parse({ forceStream: true }),
        );
        for await (const entry of zip) {
            const fileName = entry.path;
            if (entry.type === 'File' && fileName.endsWith('.svg')) {
                entry.pipe(createWriteStream(`${__dirname}/knx-uf-iconset/${path.basename(fileName)}`));
            } else {
                entry.autodrain();
            }
        }

        // prepare KNX-UF icons
        const files = readdirSync(`${__dirname}/knx-uf-iconset/`).filter(file => file.endsWith('.svg'));
        const result = {};
        for (let f = 0; f < files.length; f++) {
            let data = readFileSync(`${__dirname}/knx-uf-iconset/${files[f]}`).toString('utf8');
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
    let dataSource = readFileSync(dest).toString('utf8');
    // remove all CR/LF
    dataSource = dataSource.replace(/\r\n/g, '\n');
    if (existsSync(target)) {
        let dataTarget = readFileSync(target).toString('utf8');
        dataTarget = dataTarget.replace(/\r\n/g, '\n');
        if (dataTarget !== dataSource) {
            writeFileSync(target, dataSource);
        }
    } else {
        writeFileSync(target, dataSource);
    }
}

function buildEditor() {
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
                readdirSync(`${__dirname}/src-vis/src/i18nRuntime`).forEach(file => {
                    langsRuntime[file.replace('.json', '')] = require(`./src-vis/src/i18nRuntime/${file}`);
                    langsEditor[file.replace('.json', '')] = require(`./src-vis/src/i18n/${file}`);
                });
            }
            Object.keys(langsEditor).forEach(lang => (langsEditor[lang][key] = langsRuntime[lang][key]));
        }
    });

    if (langsEditor.de) {
        Object.keys(langsEditor).forEach(lang =>
            writeFileSync(`${__dirname}/src-vis/src/i18n/${lang}.json`, JSON.stringify(langsEditor[lang], null, 2)),
        );
    }

    return buildReact(`${__dirname}/src-vis/`, { vite: true, ramSize: 7000, rootDir: `${__dirname}/../../` });
}

function copyAllFiles() {
    copyFolder(path.join(__dirname, 'src-vis/build'), path.join(__dirname, 'www'), ['index.html']);
    writeFileSync(
        path.join(__dirname, 'www/edit.html'),
        readFileSync(path.join(__dirname, 'src-vis', 'build', 'index.html')),
    );
}

function copyBackend() {
    if (!existsSync(`${__dirname}/lib`)) {
        mkdirSync(`${__dirname}/lib`);
    }
    writeFileSync(`${__dirname}/lib/states.js`, readFileSync(`${__dirname}/build-backend/lib/states.js`));
    writeFileSync(`${__dirname}/build-backend/lib/cloudCert.crt`, readFileSync(`${__dirname}/src/lib/cloudCert.crt`));
    writeFileSync(`${__dirname}/build-backend/lib/updating.html`, readFileSync(`${__dirname}/src/lib/updating.html`));
}

function patchFile(htmlFile) {
    if (existsSync(htmlFile)) {
        let code = readFileSync(htmlFile).toString('utf8');
        code = code.replace(
            /<script>[\s\S]*const script\s?=\s?document[^<]+<\/script>/,
            `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`,
        );
        code = code.replace(
            /<script>[\s\S]*var script=document[^<]+<\/script>/,
            `<script type="text/javascript" onerror="setTimeout(function(){window.location.reload()}, 5000)" src="../../lib/js/socket.io.js"></script>`,
        );

        writeFileSync(htmlFile, code);
    }
}

function copyFolder(source, target, ignore) {
    !existsSync(target) && mkdirSync(target);

    // Copy
    if (lstatSync(source).isDirectory()) {
        const files = readdirSync(source);
        files.forEach(file => {
            const curSource = path.join(source, file).replace(/\\/g, '/');
            const curTarget = path.join(target, file).replace(/\\/g, '/');
            if (ignore && ignore.includes(file)) {
                return;
            }
            if (ignore && ignore.find(pattern => pattern.startsWith('.') && file.endsWith(pattern))) {
                // check that file is smaller than 8MB
                if (lstatSync(curSource).size > 8 * 1024 * 1024) {
                    return;
                }
            }

            if (lstatSync(curSource).isDirectory()) {
                copyFolder(curSource, curTarget, ignore);
            } else {
                writeFileSync(curTarget, readFileSync(curSource));
            }
        });
    } else {
        writeFileSync(target, readFileSync(source));
    }
}

function patchEditor() {
    patchFile(`${__dirname}/www/edit.html`);
    patchFile(`${__dirname}/www/index.html`);
    patchFile(`${__dirname}/src-vis/build/index.html`);
    patchFile(`${__dirname}/src-vis/build/edit.html`);
    if (existsSync(`${__dirname}/www/marketplaceConfig.sample.js`)) {
        unlinkSync(`${__dirname}/www/marketplaceConfig.sample.js`);
    }

    copyFolder(`${__dirname}/www`, `${__dirname}/../../www`);
    writeFileSync(`${__dirname}/../../io-package.json`, readFileSync(`${__dirname}/io-package.json`).toString());
    writeFileSync(`${__dirname}/../../main.js`, readFileSync(`${__dirname}/build-backend/main.js`).toString());
    copyFolder(`${__dirname}/build-backend/lib`, `${__dirname}/../../lib`);

    let readme = readFileSync(`${__dirname}/../../README.md`).toString('utf8');
    readme = readme.replaceAll('packages/iobroker.vis-2/', '');
    writeFileSync(`${__dirname}/README.md`, readme);
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
    if (!existsSync(`${__dirname}/src-vis/node_modules`)) {
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
} else if (process.argv.includes('--build-editor')) {
    deleteFoldersRecursive(`${__dirname}/www`);
    deleteFoldersRecursive(`${__dirname}/src-vis/build`);

    let npmPromise = !existsSync(`${__dirname}/src-vis/node_modules`)
        ? npmInstall(`${__dirname}/src-vis`)
        : Promise.resolve();
    npmPromise
        .then(() => generateSvgFiles())
        .then(() => buildEditor())
        .then(() => copyAllFiles())
        .then(() => patchEditor())
        .then(() => {
            writeFileSync(`${__dirname}/www/index.html`, readFileSync(`${__dirname}/www/edit.html`));
        })
        .catch(e => console.error(`Cannot build: ${e}`));
} else {
    clean();
    copyRuntimeSrc();
    npmInstall(`${__dirname}/runtime`)
        .then(() => buildReact(`${__dirname}/runtime/`, { vite: true, ramSize: 7000, rootDir: `${__dirname}/../../` }))
        .then(() => copyRuntimeDist())
        .then(() => patchRuntime())
        .then(() => deleteFoldersRecursive(`${__dirname}/src-vis/build`))
        .then(() => {
            if (!existsSync(`${__dirname}/src-vis/node_modules`)) {
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
