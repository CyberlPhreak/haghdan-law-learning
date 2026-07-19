const path = require('node:path');

process.env.EXPO_NO_DOCTOR = process.env.EXPO_NO_DOCTOR || '1';
process.env.EXPO_NO_TELEMETRY = process.env.EXPO_NO_TELEMETRY || '1';

const cli = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');
process.argv = [process.argv[0], cli, ...process.argv.slice(2)];
require(cli);
