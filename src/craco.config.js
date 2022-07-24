const CracoEsbuildPlugin = require('craco-esbuild');
const { ProvidePlugin } = require('webpack');
const cracoModuleFederation = require('craco-module-federation');

module.exports = {
    plugins: [
        { plugin: CracoEsbuildPlugin },
        { plugin: cracoModuleFederation },
    ],
    devServer: {
        proxy: {
            '/vis': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082',
            'widgets': 'http://localhost:8082',
        },
    },
    webpack: {
        plugins: [
            new ProvidePlugin({
                React: 'react',
            }),
        ],
    },
};
