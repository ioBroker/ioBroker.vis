import React, { useEffect, useState } from 'react';

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
    IconButton,
} from '@mui/material';

import { ContentCopy, Save as SaveIcon, Refresh } from '@mui/icons-material';

import { I18n, Utils, type LegacyConnection } from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import { store } from '@/Store';
import { deepClone } from '@/Utils/utils';
import type { ProjectSettings } from '@iobroker/types-vis-2';
import commonStyles from '@/Utils/styles';
import IODialog from '../Components/IODialog';

const styles: { dialog: React.CSSProperties; field: React.CSSProperties } = {
    dialog: {
        width: 400,
    },
    field: {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 0px',
    },
};

interface SettingsFieldBase {
    name?: string;
    field?: string;
    help?: string;
    noTranslate?: boolean;
}

interface SettingsFieldSelect extends SettingsFieldBase {
    type: 'select';
    items: { value: string | number | boolean; name: string }[];
}

interface SettingsFieldRaw extends SettingsFieldBase {
    type: 'raw';
    Node: React.JSX.Element;
}

interface SettingsFieldCheckbox extends SettingsFieldBase {
    type: 'checkbox';
}

interface SettingsFieldSwitchMode extends SettingsFieldBase {
    type: 'switchMode';
}

interface SettingsFieldNumber extends SettingsFieldBase {
    type: 'number';
}

type SettingsField =
    | SettingsFieldSelect
    | SettingsFieldRaw
    | SettingsFieldCheckbox
    | SettingsFieldSwitchMode
    | SettingsFieldNumber;

interface SettingsProps {
    changeProject: Editor['changeProject'];
    onClose: () => void;
    socket: LegacyConnection;
    adapterName: string;
    instance: number;
    projectName: string;
}

const Settings: React.FC<SettingsProps> = props => {
    const [projectMode, setProjectMode] = useState(0);

    const [settings, setSettings] = useState<ProjectSettings>({} as ProjectSettings);
    const [instance, setInstance] = useState('');
    /* eslint no-underscore-dangle: 0 */
    useEffect(() => {
        const _settings = { ...store.getState().visProject.___settings };
        if (_settings.reloadOnEdit === undefined) {
            _settings.reloadOnEdit = true;
        }

        const _instance = (window.localStorage.getItem('visInstance') || '').replace(/^"/, '').replace(/"$/, '');
        setInstance(_instance);

        // read project settings
        void props.socket.readDir(`${props.adapterName}.${props.instance}`, props.projectName).then(files => {
            const file = files.find(f => f.file === 'vis-views.json');
            if ((file as any)?.mode || file?.acl?.permissions) {
                setProjectMode((file as any).mode || file.acl.permissions);
            }
        });

        setSettings(_settings);
    }, []);

    const fields: SettingsField[] = [
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
            Node: (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'baseline',
                    }}
                >
                    <TextField
                        variant="standard"
                        style={{ flexGrow: 1 }}
                        label={I18n.t('Browser instance ID')}
                        value={instance || ''}
                        onChange={e => setInstance(e.target.value)}
                        InputProps={{
                            endAdornment: instance ? (
                                <IconButton onClick={() => Utils.copyToClipboard(instance)}>
                                    <ContentCopy />
                                </IconButton>
                            ) : null,
                            sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                        }}
                    />
                    <Button
                        variant="contained"
                        color="grey"
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                            let newInstance = (Math.random() * 4294967296).toString(16);
                            newInstance = `0000000${newInstance}`;
                            newInstance = newInstance.substring(newInstance.length - 8);
                            window.localStorage.setItem('visInstance', newInstance);
                            window.vis.instance = newInstance;
                            setInstance(newInstance);
                        }}
                        startIcon={<Refresh />}
                    >
                        {I18n.t('Create instance')}
                    </Button>
                </div>
            ),
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

    const save = (): void => {
        const project = deepClone(store.getState().visProject);
        project.___settings = settings;
        void props.changeProject(project);
        props.onClose();
    };

    return (
        <IODialog
            open={!0}
            onClose={props.onClose}
            title="Settings"
            ActionIcon={SaveIcon}
            action={save}
            actionTitle="Save"
            actionDisabled={JSON.stringify(store.getState().visProject.___settings) === JSON.stringify(settings)}
        >
            <div style={styles.dialog}>
                {fields.map((field, key) => {
                    const value = settings[field.field as keyof ProjectSettings];

                    const change = (changeValue: any): void => {
                        const newSettings = deepClone(settings);
                        (newSettings[field.field as keyof ProjectSettings] as any) = changeValue;
                        setSettings(newSettings);
                    };

                    let result;

                    if (field.type === 'checkbox') {
                        result = (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!value}
                                        onChange={e => change(e.target.checked)}
                                    />
                                }
                                label={I18n.t(field.name)}
                            />
                        );
                    } else if (field.type === 'select') {
                        result = (
                            <FormControl
                                variant="standard"
                                fullWidth
                            >
                                <InputLabel>{I18n.t(field.name)}</InputLabel>
                                <Select
                                    variant="standard"
                                    value={value || ''}
                                    onChange={e => change(e.target.value)}
                                >
                                    {field.items.map(selectItem => (
                                        <MenuItem
                                            value={selectItem.value as any}
                                            key={selectItem as any}
                                        >
                                            {field.noTranslate ? selectItem.name : I18n.t(selectItem.name)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {field.help ? <FormHelperText>{I18n.t(field.help)}</FormHelperText> : null}
                            </FormControl>
                        );
                    } else if (field.type === 'raw') {
                        result = field.Node;
                    } else if (field.type === 'switchMode') {
                        result = (
                            <FormControlLabel
                                label={I18n.t('Available for all')}
                                control={
                                    <Switch
                                        // eslint-disable-next-line no-bitwise
                                        checked={!!(projectMode & 0x60)}
                                        onChange={e => {
                                            // eslint-disable-next-line no-bitwise
                                            props.socket.getRawSocket().emit(
                                                'chmodFile',
                                                `${props.adapterName}.${props.instance}`,
                                                `${props.projectName}/*`,
                                                { mode: e.target.checked ? 0x644 : 0x600 },
                                                (
                                                    err: string,
                                                    files: {
                                                        file: string;
                                                        mode: number;
                                                        acl: { owner: string; ownerGroup: string; permissions: number };
                                                    }[],
                                                ) => {
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
                                    />
                                }
                            />
                        );
                    } else {
                        result = (
                            <TextField
                                variant="standard"
                                fullWidth
                                value={value || ''}
                                onChange={e => change(e.target.value)}
                                label={I18n.t(field.name)}
                                helperText={field.help ? I18n.t(field.help) : null}
                                type={field.type}
                            />
                        );
                    }

                    return (
                        <div
                            key={key}
                            style={styles.field}
                        >
                            {result}
                        </div>
                    );
                })}
                <Button
                    style={{
                        marginTop: 10,
                        opacity: window.localStorage.getItem('developerMode') === 'true' ? 1 : 0,
                    }}
                    variant="contained"
                    onClick={async () => {
                        if (window.localStorage.getItem('developerMode') === 'true') {
                            window.localStorage.removeItem('developerMode');
                            // disable all development URL
                            const objects = await props.socket.getObjectViewSystem(
                                'instance',
                                'system.adapter.',
                                'system.adapter.\u9999',
                            );
                            const instances = Object.values(objects);
                            for (let i = 0; i < instances.length; i++) {
                                if (instances[i].common?.visWidgets) {
                                    if (
                                        Object.keys(instances[i].common.visWidgets).find(key =>
                                            instances[i].common.visWidgets[key].url?.startsWith('http'),
                                        )
                                    ) {
                                        Object.keys(instances[i].common.visWidgets).forEach(key => {
                                            const name: ioBroker.StringOrTranslated = instances[i].common.name;
                                            if (typeof name === 'object') {
                                                instances[i].common.visWidgets[key].url = `${name.en}/customWidgets.js`;
                                            } else {
                                                instances[i].common.visWidgets[key].url = `${name}/customWidgets.js`;
                                            }
                                        });
                                        await props.socket.setObject(instances[i]._id, instances[i]);
                                    }
                                }
                            }
                        } else {
                            window.localStorage.setItem('developerMode', 'true');
                        }
                        window.location.reload();
                    }}
                >
                    Development mode
                </Button>
            </div>
        </IODialog>
    );
};

export default Settings;
