const CracoEsbuildPlugin = require('craco-esbuild');
const { ProvidePlugin, IgnorePlugin } = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;

console.log('craco');

module.exports = {
    plugins: [{ plugin: CracoEsbuildPlugin }],
    webpack: {
        plugins: [
            // new HtmlWebpackPlugin(),
            new ProvidePlugin({
                React: 'react',
            }),
            new ModuleFederationPlugin({
                name: 'vis',
                filename: 'remoteEntry.js',
                remotes: {
                },
                exposes: {
                    './visRxWidget': './src/Vis/visRxWidget',
                },
                shared: {
                    react: {
                        singleton: true,
                    // requiredVersion: pkg.dependencies.react,
                    },
                    'react-dom': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['react-dom'],
                    },
                    '@iobroker/adapter-react-v5': {
                        singleton: true,
                    },
                    '@mui/material': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['@mui/material'],
                    },
                    '@mui/icons-material': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['@mui/material'],
                    },
                    '@mui/styles': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['@mui/material'],
                    },
                    'react-ace': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['@mui/material'],
                    },
                    'prop-types': {
                        singleton: true,
                    // requiredVersion: pkg.dependencies['@mui/material'],
                    },
                    './src/myvisRxWidget': {
                        singleton: true,
                    },
                },
            }),
            new IgnorePlugin({
              resourceRegExp: /myvisRxWidget/,
            })
        ],
        // configure: (webpackConfig) => {
        //   console.log(webpackConfig);
        //   process.exit();
        //   return webpackConfig;
        // }
    },
};
