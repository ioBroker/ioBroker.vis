module.exports = {
    name: 'iobroker_vis',
    filename: 'remoteEntry.js',
    remotes: {
    },
    exposes: {
        './visRxWidget': './src/Vis/visRxWidget',
    },
    shared:
                [
                    'react', 'react-dom', '@mui/material', '@mui/styles', '@mui/icons-material', 'prop-types', '@iobroker/adapter-react-v5', 'react-ace',
                ],
};
