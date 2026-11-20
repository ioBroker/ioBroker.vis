// Build tasks of ioBroker.vis (replaces the former gulpfile.js).
// The version from package.json is written into io-package.json and into the files of the runtime/editor,
// so the browsers can detect a new version (cache.manifest) and the GUI shows the right version.
//
// usage: tsx tasks.ts (called by "npm run build" and by the release script before the commit)
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = __dirname;
const version: string = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;

/** Applies the replacements to the file and writes it only if something changed */
function patchFile(fileName: string, replacements: [RegExp, string][]): void {
    const path = join(root, fileName);
    const original = readFileSync(path, 'utf8');
    let text = original;
    for (const [search, replacement] of replacements) {
        text = text.replace(search, replacement);
    }
    if (text !== original) {
        writeFileSync(path, text);
        console.log(`[tasks] ${fileName}: version set to ${version}`);
    }
}

function updateVersion(): void {
    if (!/^\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`Invalid version in package.json: "${version}"`);
    }

    // common.version (the release script does it too, but "npm run build" should work also after a manual change)
    patchFile('io-package.json', [[/("common":\s*\{[^]*?"version":\s*)"[^"]*"/, `$1"${version}"`]]);

    // vis.js: "version: '1.5.7'," in the vis object
    patchFile('www/js/vis.js', [[/(\n\s+version:\s*)'[.0-9]*',/, `$1'${version}',`]]);

    // The browsers reload all files from cache.manifest if this file changes. main.js counts "dev build" up
    // if index.html changed on the server; a new version starts again with 0.
    patchFile('www/cache.manifest', [
        [/# vis Version [.0-9]+/, `# vis Version ${version}`],
        [/# dev build [0-9]+/, '# dev build 0'],
    ]);

    patchFile('www/index.html', [[/<!-- vis Version [.0-9]+ -->/, `<!-- vis Version ${version} -->`]]);
    patchFile('www/edit.html', [[/<!-- vis Version [.0-9]+ -->/, `<!-- vis Version ${version} -->`]]);
}

/**
 * Copies the helpers for hosts of `@iobroker/web-components` (the main entry and the modules it imports, ES modules)
 * to www/lib/js/iobroker-web-components/. The runtime and the editor import them with `import()` to find, check and
 * load the web components of the installed adapters (see www/js/visWebComponents.js).
 */
function copyWebComponentsLib(): void {
    // the main entry is build/index.js ("package.json" is not exported by the package)
    const source = dirname(require.resolve('@iobroker/web-components'));
    const target = join(root, 'www/lib/js/iobroker-web-components');
    const version: string = JSON.parse(readFileSync(join(source, '..', 'package.json'), 'utf8')).version;

    // follow the imports from index.js: the files for authors (element.js) and the CLI are not needed
    const files: string[] = [];
    const queue = ['index.js'];
    while (queue.length) {
        const file = queue.shift()!;
        if (files.includes(file)) {
            continue;
        }
        files.push(file);
        const text = readFileSync(join(source, file), 'utf8');
        for (const match of text.matchAll(/(?:from|import)\s*['"]\.\/([\w.-]+\.js)['"]/g)) {
            queue.push(match[1]);
        }
    }

    if (!existsSync(target)) {
        mkdirSync(target, { recursive: true });
    }
    // remove files of an older version that are not imported anymore
    for (const file of readdirSync(target)) {
        if (file.endsWith('.js') && !files.includes(file)) {
            unlinkSync(join(target, file));
        }
    }
    let changed = 0;
    for (const file of files) {
        // the source maps point into the sources, that are not in the package
        const text = `// @iobroker/web-components ${version}\n${readFileSync(join(source, file), 'utf8').replace(/\n?\/\/# sourceMappingURL=.*\s*$/, '\n')}`;
        const fileName = join(target, file);
        if (!existsSync(fileName) || readFileSync(fileName, 'utf8') !== text) {
            writeFileSync(fileName, text);
            changed++;
        }
    }
    if (changed) {
        console.log(`[tasks] www/lib/js/iobroker-web-components: ${changed} file(s) of version ${version} copied`);
    }
}

try {
    updateVersion();
    copyWebComponentsLib();
} catch (e) {
    console.error(`[tasks] ${(e as Error).message}`);
    process.exit(1);
}
