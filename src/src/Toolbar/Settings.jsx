import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    FormHelperText,
} from '@mui/material';

import { Save as SaveIcon } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import IODialog from '../Components/IODialog';
import { store } from '../Store';

const styles = () => ({
    dialog: {
        width: 400,
    },
    field: {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 0px',
    },
});

const Settings = props => {
    const [projectMode, setProjectMode] = useState(0);

    const [settings, setSettings] = useState({});
    const [instance, setInstance] = useState(window.localStorage.getItem('visInstance'));
    /* eslint no-underscore-dangle: 0 */
    useEffect(() => {
        const _settings = { ...store.getState().visProject.___settings };
        if (_settings.reloadOnEdit === undefined) {
            _settings.reloadOnEdit = true;
        }

        // read project settings
        props.socket.readDir(`${props.adapterName}.${props.instance}`, props.projectName)
            .then(files => {
                const file = files.find(f => f.file === 'vis-views.json');
                if (file?.mode || file?.acl?.permissions) {
                    setProjectMode(file.mode || file.acl.permissions);
                }
            });

        setSettings(_settings);
    }, []);

    const fields = [
        {
            type: 'select',
            name: 'Reload all browsers if project changed',
            field: 'reloadOnEdit',
            items: [
                { value: true, name: 'reload' },
                { value: false, name: 'no_reload' },
            ],
        },
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
                <TextField variant="standard" label={I18n.t('Browser instance ID')} value={instance || ''} onChange={e => setInstance(e.target.value)} />
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => {
                        let newInstance = (Math.random() * 4294967296).toString(16);
                        newInstance = `0000000${newInstance}`;
                        newInstance = newInstance.substring(newInstance.length - 8);
                        window.localStorage.setItem('visInstance', newInstance);
                        window.vis.instance = newInstance;
                        setInstance(newInstance);
                    }}
                >
                    {I18n.t('Create instance')}
                </Button>
            </>,
        },
        { type: 'switchMode' }, // very specific control
        {
            type: 'select',
            name: 'Body overflow',
            field: 'bodyOverflow',
            help: 'Default: auto',
            noTranslate: true,
            items: [
                { value: 'auto', name: 'auto' },
                { value: 'scroll', name: 'scroll' },
                { value: 'hidden', name: 'hidden' },
                { value: 'visible', name: 'visible' },
            ],
        },
    ];

    const save = () => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project.___settings = settings;
        props.changeProject(project);
        props.onClose();
    };

    return <IODialog
        open={!0}
        onClose={props.onClose}
        title="Settings"
        ActionIcon={SaveIcon}
        action={save}
        actionTitle="Save"
        actionDisabled={JSON.stringify(store.getState().visProject.___settings) === JSON.stringify(settings)}
    >
        <div className={props.classes.dialog}>
            {fields.map((field, key) => {
                const value = settings[field.field];

                const change = changeValue => {
                    const newSettings = JSON.parse(JSON.stringify(settings));
                    newSettings[field.field] = changeValue;
                    setSettings(newSettings);
                };

                let result;

                if (field.type === 'checkbox') {
                    result = <FormControlLabel
                        control={<Checkbox checked={!!value} onChange={e => change(e.target.checked)} />}
                        label={I18n.t(field.name)}
                    />;
                } else if (field.type === 'select') {
                    result = <FormControl
                        variant="standard"
                        fullWidth
                    >
                        <InputLabel>{I18n.t(field.name)}</InputLabel>
                        <Select variant="standard" value={value || ''} onChange={e => change(e.target.value)}>
                            {field.items.map(selectItem => <MenuItem
                                value={selectItem.value}
                                key={selectItem.value}
                            >
                                {field.noTranslate ? selectItem.name : I18n.t(selectItem.name)}
                            </MenuItem>)}
                        </Select>
                        {field.help ? <FormHelperText>{I18n.t(field.help)}</FormHelperText> : null}
                    </FormControl>;
                } else if (field.type === 'raw') {
                    result = field.Node;
                } else if (field.type === 'switchMode') {
                    result = <FormControlLabel
                        label={I18n.t('Available for all')}
                        control={<Switch
                            // eslint-disable-next-line no-bitwise
                            checked={!!(projectMode & 0x60)}
                            onChange={e => {
                                // eslint-disable-next-line no-bitwise
                                props.socket.getRawSocket().emit(
                                    'chmodFile',
                                    `${props.adapterName}.${props.instance}`,
                                    `${props.projectName}/*`,
                                    { mode: e.target.checked ? 0x644 : 0x600 },
                                    (err, files) => {
                                        if (err) {
                                            window.alert(err);
                                        } else {
                                            const file = files.find(f => f.file === 'vis-views.json');
                                            if (file?.mode || file?.acl?.permissions) {
                                                setProjectMode(file.mode || file.acl.permissions);
                                            }
                                        }
                                    },
                                );
                            }}
                        />}
                    />;
                } else {
                    result = <TextField
                        variant="standard"
                        fullWidth
                        value={value || ''}
                        onChange={e => change(e.target.value)}
                        label={I18n.t(field.name)}
                        helperText={field.help ? I18n.t(field.help) : null}
                        type={field.type}
                    />;
                }

                return <div key={key} className={props.classes.field}>{result}</div>;
            })}
        </div>
    </IODialog>;
};

Settings.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    onClose: PropTypes.func,
    project: PropTypes.object,
    socket: PropTypes.object,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
    projectName: PropTypes.string,
};

export default withStyles(styles)(Settings);
