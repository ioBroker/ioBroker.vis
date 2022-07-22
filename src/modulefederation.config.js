const makeFederation = require('@iobroker/vis-widgets-react-dev/modulefederation.config');

module.exports = makeFederation(
    'iobroker_vis',
    {
        './visRxWidget': './src/Vis/visRxWidget',
    },
    true,
);
/*
const makeShared = pkgs => {
    const result = {};
    pkgs.forEach(
        packageName => {
            result[packageName] = {
                requiredVersion: '*',
                singleton: true,
                eager: true,
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
            'react',
            'react-dom',
            'react-dom/client',
            'clsx',
            '@mui/material',
            '@mui/styles',
            '@mui/material/styles',
            '@mui/icons-material',
            'prop-types',
            '@iobroker/adapter-react-v5',
            'react-ace',
            '@iobroker/vis-widgets-react-dev',
        ]),
};*/
