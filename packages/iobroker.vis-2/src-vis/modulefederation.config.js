const makeFederation = require('@iobroker/vis-2-widgets-react-dev/modulefederation.config');

module.exports = makeFederation(
    'iobroker_vis',
    {
        './visRxWidget': './src/Vis/visRxWidget',
    },
    true,
);
