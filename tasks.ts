// Build tasks of ioBroker.vis (replaces the former gulpfile.js).
// The version from package.json is written into io-package.json and into the files of the runtime/editor,
// so the browsers can detect a new version (cache.manifest) and the GUI shows the right version.
//
// usage: tsx tasks.ts (called by "npm run build" and by the release script before the commit)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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

try {
    updateVersion();
} catch (e) {
    console.error(`[tasks] ${(e as Error).message}`);
    process.exit(1);
}
