const path = require('node:path');
process.env.IOBROKER_ROOT_DIR = path.normalize(`${__dirname}/../`).replace(/\\/g, '/');
require('@iobroker/legacy-testing/tests/testPackageFiles');
