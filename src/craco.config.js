const CracoEsbuildPlugin = require('craco-esbuild');
const { ProvidePlugin } = require('webpack');

console.log('craco');

module.exports = {
    plugins: [{ plugin: CracoEsbuildPlugin }],
    webpack: {
        plugins: [
            // new HtmlWebpackPlugin(),
            new ProvidePlugin({
                React: 'react',
            }),
        ],
        // configure: (webpackConfig) => {
        //   console.log(webpackConfig);
        //   process.exit();
        //   return webpackConfig;
        // }
    },
};
