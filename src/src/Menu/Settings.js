import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, withStyles,
} from '@material-ui/core';
import { useEffect, useState } from 'react';

import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';

const styles = () => ({
    dialog: {
        width: 400,
    },
});

const Settings = props => {
    const [settings, setSettings] = useState({});
    const [instance, setInstance] = useState('');
    /* eslint no-underscore-dangle: 0 */
    useEffect(() => setSettings(props.project.___settings), [props.open]);

    const fields = [
        {
            type: 'select',
            name: 'Reload if sleep longer than',
            field: 'reloadOnSleep',
            items: [
                { value: 0, name: 'never' },
                { value: 30, name: '30 seconds' },
                { value: 60, name: '1 minute' },
                { value: 300, name: '5 minutes' },
                { value: 600, name: '10 minutes' },
                { value: 1800, name: '30 minutes' },
                { value: 3600, name: '1 hour' },
                { value: 7200, name: '2 hours' },
                { value: 10800, name: '3 hours' },
                { value: 21600, name: '6 hours' },
                { value: 43200, name: '12 hours' },
                { value: 86400, name: '1 day' },
            ],
        },
        {
            type: 'select',
            name: 'Reconnect interval',
            field: 'reconnectInterval',
            items: [
                { value: 1000, name: '1 second' },
                { value: 2000, name: '2 seconds' },
                { value: 5000, name: '5 seconds' },
                { value: 10000, name: '10 seconds' },
                { value: 20000, name: '20 seconds' },
                { value: 30000, name: '30 seconds' },
                { value: 60000, name: '1 minute' },
            ],
        },
        { type: 'checkbox', name: 'Dark reconnect screen', field: 'darkReloadScreen' },
        {
            type: 'select',
            name: 'Destroy inactive view',
            field: 'destroyViewsAfter',
            items: [
                { value: 0, name: 'never' },
                { value: 1, name: '1 second' },
                { value: 5, name: '5 seconds' },
                { value: 10, name: '10 seconds' },
                { value: 20, name: '20 seconds' },
                { value: 30, name: '30 seconds' },
                { value: 60, name: '1 minute' },
                { value: 300, name: '5 minutes' },
                { value: 600, name: '10 minutes' },
                { value: 1800, name: '30 minutes' },
                { value: 3600, name: '1 hour' },
                { value: 7200, name: '2 hours' },
                { value: 10800, name: '3 hours' },
                { value: 21600, name: '6 hours' },
                { value: 43200, name: '12 hours' },
                { value: 86400, name: '1 day' },
            ],
        },
        { name: 'States Debounce Time (millis)', field: 'statesDebounceTime', type: 'number' },
        {
            type: 'raw',
            Node: <>
                <TextField label={I18n.t('Instance id')} value={instance} onChange={e => setInstance(e.target.value)} />
                <Button onClick={() => {
                    let newInstance = (Math.random() * 4294967296).toString(16);
                    newInstance = `0000000${newInstance}`;
                    newInstance = newInstance.substring(newInstance.length - 8);
                    setInstance(newInstance);
                }}
                >
                    {I18n.t('Create instance')}
                </Button>
            </>,
        },
    ];

    const save = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings = settings;
        props.changeProject(project);
        props.onClose();
    };

    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Settings')}</DialogTitle>
        <DialogContent className={props.classes.dialog}>
            {fields.map((field, key) => {
                const value = settings[field.field];

                const change = changeValue => {
                    const newSettings = JSON.parse(JSON.stringify(settings));
                    newSettings[field.field] = changeValue;
                    setSettings(newSettings);
                };

                if (field.type === 'checkbox') {
                    return <div key={key}>
                        <FormControlLabel
                            control={<Checkbox checked={value} />}
                            onChange={e => change(e.target.checked)}
                            label={I18n.t(field.name)}
                        />
                    </div>;
                }
                if (field.type === 'select') {
                    return <div key={key}>
                        <FormControl fullWidth>
                            <InputLabel>{I18n.t(field.name)}</InputLabel>
                            <Select value={value} onChange={e => change(e.target.value)}>
                                {field.items.map(selectItem => <MenuItem
                                    value={selectItem.value}
                                    key={selectItem.value}
                                >
                                    {I18n.t(selectItem.name)}
                                </MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>;
                }
                if (field.type === 'raw') {
                    return <div key={key}>{field.Node}</div>;
                }
                return <div key={key}>
                    <TextField fullWidth value={value} onChange={e => change(e.target.value)} label={I18n.t(field.name)} type={field.type} />
                </div>;
            })}
        </DialogContent>
        <DialogActions>
            <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                onClick={save}
            >
                {I18n.t('Save')}
            </Button>
            <Button
                startIcon={<CloseIcon />}
                variant="contained"
                onClick={props.onClose}
            >
                {I18n.t('Cancel')}
            </Button>
        </DialogActions>
    </Dialog>;
};

export default withStyles(styles)(Settings);
