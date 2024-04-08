/**
 * Release script adds a version entry to private packages, which introduces conflicts in the following releases
 */
const fs = require('node:fs');
const path = require('node:path');

function removePackEntry() {
    const packPath = path.join(__dirname, 'packages', 'vis-2', 'src', 'package.json');
    const packString = fs.readFileSync(packPath, {
        encoding: 'utf-8',
    });

    const packJson = JSON.parse(packString);

    delete packJson.version;

    fs.writeFileSync(packPath, JSON.stringify(packJson, null, 2), { encoding: 'utf-8' });
}

if (require.main === module) {
    removePackEntry();
}
