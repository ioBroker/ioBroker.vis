const CracoEsbuildPlugin = require('craco-esbuild');
const { ProvidePlugin } = require('webpack');
const cracoModuleFederation = require('@iobroker/adapter-react-v5/craco-module-federation');

const { setFlagsFromString } = require('v8');
const { runInNewContext } = require('vm');

setFlagsFromString('--expose_gc');
const gc = runInNewContext('gc'); // nocommit

setInterval(() => {
    gc();
}, 10000);

module.exports = {
    plugins: [
        { plugin: CracoEsbuildPlugin },
        { plugin: cracoModuleFederation },
    ],
    devServer: {
        proxy: {
            '/_socket': 'http://localhost:8082',
            '/vis.0': 'http://localhost:8082',
            '/adapter': 'http://localhost:8082',
            '/habpanel': 'http://localhost:8082',
            '/vis': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082/vis',
            '/widgets.html': 'http://localhost:8082/vis',
            '/web': 'http://localhost:8082',
            '/state': 'http://localhost:8082',
        },
    },
    webpack: {
        output: {
            publicPath: './',
        },
        plugins: [
            new ProvidePlugin({
                React: 'react',
            }),
        ],
        configure: (webpackConfig, { env, paths }) => {
            /* ... */
            console.log(webpackConfig);
            // process.exit(0);
            // delete webpackConfig.cache;
            // webpackConfig.target = 'es2020';
            // delete webpackConfig.devtool;
            // webpackConfig.output.chunkLoading = false;
            // webpackConfig.output.chunkFormat = 'array-push';
            webpackConfig.plugins = webpackConfig.plugins.filter(p => !['ESLintWebpackPlugin'].includes(p.constructor.name));
            // webpackConfig.optimization.splitChunks = {
            //     chunks: 'async',
            //     minSize: 20000,
            //     minRemainingSize: 0,
            //     minChunks: 1,
            //     maxAsyncRequests: 30,
            //     maxInitialRequests: 30,
            //     enforceSizeThreshold: 50000,
            //     // cacheGroups: {
            //     //     defaultVendors: {
            //     //         test: /[\\/]node_modules[\\/]/,
            //     //         priority: -10,
            //     //         reuseExistingChunk: true,
            //     //     },
            //     //     default: {
            //     //         minChunks: 2,
            //     //         priority: -20,
            //     //         reuseExistingChunk: true,
            //     //     },
            //     // },
            // };

            return webpackConfig;
        },
    },
};
