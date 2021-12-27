import ToolbarItems from './ToolbarItems';

const resolution = [
    { value: '" class="translate" data-lang="not defined', name: 'not defined' },
    { value: 'user" class="translate" data-lang="User defined', name: 'User defined' },
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

const toolbar = [
    {
        type: 'select', name: 'Resolution', items: resolution, width: 240,
    },
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
    { name: 'Grid size', field: 'gridSize' },
    { type: 'divider' },
    { name: 'Instance ID' },
    { type: 'button', name: 'Create instance' },
    { type: 'divider' },
    { type: 'checkbox', name: 'Available for all' },
];

const Tools = props => <div className={props.classes.toolbar}>
    <ToolbarItems items={toolbar} {...props} />
</div>;

export default Tools;
