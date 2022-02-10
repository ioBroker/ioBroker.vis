import { useState } from 'react';

import SyncIcon from '@material-ui/icons/Sync';

import ToolbarItems from './OldToolbarItems';

const resolution = [
    { value: 'none', name: 'not defined' },
    { value: 'user', name: 'User defined' },
    { value: '320x460', name: 'iPhone 3G, 3GS, 4, 4S - Portrait' },
    { value: '480x300', name: 'iPhone 3G, 3GS, 4, 4S - Landscape' },
    { value: '320x548', name: 'iPhone 5, 5S - Portrait' },
    { value: '568x300', name: 'iPhone 5, 5S - Landscape' },
    { value: '768x1004', name: 'iPad - Portrait' },
    { value: '1024x748', name: 'iPad - Landscape' },
    { value: '320x533', name: 'Samsung S2 - Portrait' },
    { value: '533x320', name: 'Samsung S2 - Landscape' },
    { value: '360x640', name: 'Samsung S3, Note 2 - Portrait' },
    { value: '640x360" selected="selected', name: 'Samsung S3, Note 2 - Landscape' },
    { value: '360x640', name: 'Samsung S4, S5, Note 3 - Portrait' },
    { value: '640x360', name: 'Samsung S4, S5, Note 3 - Landscape' },
    { value: '384x640', name: 'Nexus 4 - Portrait' },
    { value: '640x384', name: 'Nexus 4 - Landscape' },
    { value: '360x640', name: 'Nexus 5 - Portrait' },
    { value: '640x360', name: 'Nexus 5 - Landscape' },
    { value: '604x966', name: 'Nexus 7 (2012) - Portrait' },
    { value: '966x604', name: 'Nexus 7 (2012) - Landscape' },
    { value: '800x1280', name: 'Nexus 10 - Portrait' },
    { value: '1280x800', name: 'Nexus 10 - Landscape' },
    { value: '720x1280', name: 'HD - Portrait' },
    { value: '1280x720', name: 'HD - Landscape' },
    { value: '1080x1920', name: 'Full HD - Portrait' },
    { value: '1920x1080', name: 'Full HD - Landscape' },
];

const Tools = props => {
    const [userResolution, setUserResolution] = useState(false);

    if (!props.project[props.selectedView]) {
        return null;
    }

    const view = props.project[props.selectedView];

    let resolutionSelect = `${view.settings.sizex}x${view.settings.sizey}`;
    if (!(view.settings.sizex && view.settings.sizey)) {
        resolutionSelect = 'none';
    } else if (!resolution.find(item => item.value === `${view.settings.sizex}x${view.settings.sizey}`)) {
        resolutionSelect = 'user';
    }

    const toolbar = [
        {
            type: 'select',
            name: 'Resolution',
            items: resolution,
            width: 236,
            hide: userResolution,
            value: resolutionSelect,
            onChange: e => {
                const project = JSON.parse(JSON.stringify(props.project));
                const match = e.target.value.match(/^([0-9]+)x([0-9]+)$/);
                if (e.target.value === 'none') {
                    project[props.selectedView].settings.sizex = 0;
                    project[props.selectedView].settings.sizey = 0;
                } else if (e.target.value === 'user') {
                    setUserResolution(true);
                } else {
                    [, project[props.selectedView].settings.sizex, project[props.selectedView].settings.sizey] = match;
                }
                props.changeProject(project);
            },
        },
        {
            type: 'number', name: 'Width (px)', field: 'sizex', hide: !userResolution,
        },
        {
            type: 'number', name: 'Height (px)', field: 'sizey', hide: !userResolution,
        },
        {
            type: 'icon-button', name: 'user/profile', Icon: SyncIcon, onClick: () => setUserResolution(!userResolution),
        },
        { type: 'divider' },
        { type: 'checkbox', name: 'Default', field: 'useAsDefault' },
        { type: 'checkbox', name: 'Render always', field: 'alwaysRender' },
        { type: 'divider' },
        {
            type: 'select',
            name: 'Grid',
            field: 'snapType',
            items: [
                { name: 'Disabled', value: 0 },
                { name: 'Elements', value: 1 },
                { name: 'Grid', value: 2 },
            ],
            width: 120,
        },
        { type: 'number', name: 'Grid size', field: 'gridSize' },
        { type: 'divider' },
        { name: 'Instance ID' },
        { type: 'button', name: 'Create instance' },
        { type: 'divider' },
        { type: 'checkbox', name: 'Available for all' },
    ];

    return <div className={props.classes.toolbar}>
        <ToolbarItems items={toolbar} {...props} />
    </div>;
};

export default Tools;
