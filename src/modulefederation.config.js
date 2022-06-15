const makeShared = pkgs => {
    const result = {};
    pkgs.forEach(
        packageName => {
            result[packageName] = {
                requiredVersion: '*',
            };
        },
    );
    return result;
};

module.exports = {
    name: 'iobroker_vis',
    filename: 'remoteEntry.js',
    remotes: {
    },
    exposes: {
        './visRxWidget': './src/Vis/visRxWidget',
    },
    shared:
        makeShared([
            'react', 'react-dom', '@mui/material', '@mui/styles', '@mui/icons-material', 'prop-types', '@iobroker/adapter-react-v5', 'react-ace',
        ]),
};
