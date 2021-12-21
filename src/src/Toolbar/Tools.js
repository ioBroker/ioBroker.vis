import {
    Button,
    Checkbox, Divider, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

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

const Tools = props => <div className={props.classes.toolbar}>
    <FormControl>
        <InputLabel>{I18n.t('Resolution')}</InputLabel>
        <Select>
            {resolution.map(item => <MenuItem
                value={item.value}
                key={item.value}
            >
                {I18n.t(item.name)}
            </MenuItem>)}
        </Select>
    </FormControl>
    <FormControlLabel
        control={<Checkbox />}
        label={I18n.t('Default')}
    />
    <FormControlLabel
        control={<Checkbox />}
        label={I18n.t('Render always')}
    />
    <Divider orientation="vertical" flexItem />
    <FormControl>
        <InputLabel>{I18n.t('Grid')}</InputLabel>
        <Select>
            <MenuItem value={0}>Disabled</MenuItem>
            <MenuItem value={1}>Elements</MenuItem>
            <MenuItem value={2}>Grid</MenuItem>
        </Select>
    </FormControl>
    <TextField label={I18n.t('Grid size')} />
    <Divider orientation="vertical" flexItem />
    <TextField label={I18n.t('Instance ID')} />
    <Button>{I18n.t('Create Instance')}</Button>
    <Divider orientation="vertical" flexItem />
    <FormControlLabel
        control={<Checkbox />}
        label={I18n.t('Available for all')}
    />
</div>;

export default Tools;
