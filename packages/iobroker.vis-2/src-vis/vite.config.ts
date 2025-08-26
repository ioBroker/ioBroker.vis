import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import { resolve } from 'node:path';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
    plugins: [
        federation({
            name: 'iobroker_vis',
            shared: moduleFederationShared(),
            exposes: {
                './visRxWidget': './src/Vis/visRxWidget',
            },
            remotes: {},
            filename: 'remoteEntry.js',
            manifest: true,
        }),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: (i: number): string => `__tla_${i}`,
        }),
        react(),
        vitetsConfigPaths(),
        commonjs(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/_socket': 'http://localhost:8082',
            '/vis-2.0': 'http://localhost:8082',
            '/adapter': 'http://localhost:8082',
            '/habpanel': 'http://localhost:8082',
            '/vis-2': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082/vis-2',
            '/widgets.html': 'http://localhost:8082/vis-2',
            '/web': 'http://localhost:8082',
            '/state': 'http://localhost:8082',
        },
    },
    base: './',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@iobroker/types-vis-2': resolve(__dirname, '..', '..', 'types-vis-2'),
        },
    },
    build: {
        target: 'chrome89',
        outDir: './build',
    },
});
