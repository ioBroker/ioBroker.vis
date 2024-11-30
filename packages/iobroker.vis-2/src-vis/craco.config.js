// const CracoEsbuildPlugin = require('craco-esbuild');
const { ProvidePlugin } = require('webpack');
const path = require('node:path');
const cracoModuleFederation = require('@iobroker/adapter-react-v5/craco-module-federation');

module.exports = {
    plugins: [
        // { plugin: CracoEsbuildPlugin },
        { plugin: cracoModuleFederation },
    ],
    devServer: {
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
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@iobroker/types-vis-2': path.resolve(__dirname, '..', '..', 'types-vis-2'),
        },
        output: {
            publicPath: './',
        },
        plugins: [
            new ProvidePlugin({
                React: 'react',
            }),
        ],
    },
};
