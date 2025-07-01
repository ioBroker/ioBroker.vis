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

import {
    I18n,
    Utils,
    type LegacyConnection,
    SelectFile as SelectFileDialog,
    type Connection,
} from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import { store } from '@/Store';
import { deepClone } from '@/Utils/utils';
import type { ProjectSettings, VisTheme } from '@iobroker/types-vis-2';
import commonStyles from '@/Utils/styles';
import IODialog from '../Components/IODialog';
import { applyTitleAndIcon } from '@/Vis/visUtils';

const styles: { dialog: React.CSSProperties; field: React.CSSProperties } = {
    dialog: {
        width: 400,
    },
    field: {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 0px',
        marginBottom: '10px',
    },
};

interface SettingsFieldBase {
    name?: string;
    field?: keyof ProjectSettings;
    help?: string;
    noTranslate?: boolean;
}

interface SettingsFieldSelect extends SettingsFieldBase {
    type: 'select';
    items: { value: string | number | boolean; name: string }[];
    fullWidth?: boolean;
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

interface SettingsFieldText extends SettingsFieldBase {
    type: 'text';
}

interface SettingsFieldIcon extends SettingsFieldBase {
    type: 'image';
}

type SettingsField =
    | SettingsFieldSelect
    | SettingsFieldRaw
    | SettingsFieldCheckbox
    | SettingsFieldSwitchMode
    | SettingsFieldText
    | SettingsFieldIcon
    | SettingsFieldNumber;

interface SettingsProps {
    changeProject: Editor['changeProject'];
    onClose: () => void;
    socket: LegacyConnection;
    adapterName: string;
    adapterInstance: number;
    projectName: string;
    theme: VisTheme;
}

export function Settings(props: SettingsProps): React.JSX.Element {
    const [projectMode, setProjectMode] = useState(0);
    const [imageDialog, setImageDialog] = useState(false);

    const [settings, setSettings] = useState<ProjectSettings>({} as ProjectSettings);
    const [browserInstance, setBrowserInstance] = useState('');

    useEffect(() => {
        const _settings = { ...store.getState().visProject.___settings };
        if (_settings.reloadOnEdit === undefined) {
            _settings.reloadOnEdit = true;
        }

        const _instance = (window.localStorage.getItem('visInstance') || '').replace(/^"/, '').replace(/"$/, '');
        setBrowserInstance(_instance);

        // read project settings
        void props.socket.readDir(`${props.adapterName}.${props.adapterInstance}`, props.projectName).then(files => {
            const file = files.find(f => f.file === 'vis-views.json');
            if ((file as any)?.mode || file?.acl?.permissions) {
                setProjectMode((file as any).mode || file.acl.permissions);
            }
        });

        setSettings(_settings);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fields: SettingsField[] = [
        {
            type: 'select',
            name: 'Reload all browsers if project changed',
            field: 'reloadOnEdit',
            fullWidth: true,
            items: [
                { value: true, name: 'reload' },
                { value: false, name: 'no_reload' },
            ],
        },
        { type: 'checkbox', name: 'Dark reconnect screen', field: 'darkReloadScreen' },
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
                        value={browserInstance || ''}
                        onChange={e => setBrowserInstance(e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: browserInstance ? (
                                    <IconButton onClick={() => Utils.copyToClipboard(browserInstance)}>
                                        <ContentCopy />
                                    </IconButton>
                                ) : null,
                                sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                            },
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
                            setBrowserInstance(newInstance);
                        }}
                        startIcon={<Refresh />}
                    >
                        {I18n.t('Create instance')}
                    </Button>
                </div>
            ),
        },
        { type: 'switchMode' }, // very specific control
        { name: 'Browser tab title', type: 'text', field: 'title' },
        { name: 'Browser tab favicon', type: 'image', field: 'favicon' },
        { name: 'Ignore not loaded widgets', type: 'checkbox', field: 'ignoreNotLoaded' },
        {
            type: 'select',
            name: 'Body overflow',
            field: 'bodyOverflow',
            help: 'Default: auto',
            noTranslate: true,
            fullWidth: false,
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
            onClose={props.onClose}
            title="Project settings"
            ActionIcon={SaveIcon}
            action={save}
            actionTitle="Save"
            actionDisabled={JSON.stringify(store.getState().visProject.___settings) === JSON.stringify(settings)}
        >
            <div style={styles.dialog}>
                {fields.map((field, index) => {
                    let result: React.JSX.Element;
                    if (field.type === 'raw') {
                        return (
                            <div
                                key="raw"
                                style={styles.field}
                            >
                                {field.Node}
                            </div>
                        );
                    }
                    if (field.type === 'switchMode') {
                        return (
                            <div
                                key="switchMode"
                                style={styles.field}
                            >
                                <FormControlLabel
                                    label={I18n.t('Available for all')}
                                    control={
                                        <Switch
                                            checked={!!(projectMode & 0x60)}
                                            onChange={e => {
                                                props.socket.getRawSocket().emit(
                                                    'chmodFile',
                                                    `${props.adapterName}.${props.adapterInstance}`,
                                                    `${props.projectName}/*`,
                                                    { mode: e.target.checked ? 0x644 : 0x600 },
                                                    (
                                                        err: string,
                                                        files: {
                                                            file: string;
                                                            mode: number;
                                                            acl: {
                                                                owner: string;
                                                                ownerGroup: string;
                                                                permissions: number;
                                                            };
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
                            </div>
                        );
                    }

                    const value = settings[field.field];

                    const change = (changeValue: any): void => {
                        const newSettings = deepClone(settings);
                        (newSettings as Record<string, any>)[field.field] = changeValue;
                        setSettings(newSettings);
                        applyTitleAndIcon(newSettings.title, newSettings.favicon, {
                            themeType: props.theme.palette.mode,
                            adapterName: props.adapterName,
                            instance: props.adapterInstance,
                            projectName: props.projectName,
                        });
                    };

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
                                style={{ marginBottom: 10 }}
                                fullWidth
                            >
                                <InputLabel>{I18n.t(field.name)}</InputLabel>
                                <Select
                                    variant="standard"
                                    value={value || ''}
                                    onChange={e => change(e.target.value)}
                                >
                                    {field.items.map((selectItem, index) => (
                                        <MenuItem
                                            value={selectItem.value as any}
                                            key={selectItem.name || index.toString()}
                                        >
                                            {field.noTranslate ? selectItem.name : I18n.t(selectItem.name)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {field.help ? <FormHelperText>{I18n.t(field.help)}</FormHelperText> : null}
                            </FormControl>
                        );
                    } else if (field.type === 'image') {
                        let _value: string;
                        if (imageDialog) {
                            _value = (value as string) || '';
                            if (_value.startsWith('../')) {
                                _value = _value.substring(3);
                            } else if (_value.startsWith('_PRJ_NAME/')) {
                                _value = _value.replace(
                                    '_PRJ_NAME/',
                                    `../${props.adapterName}.${props.adapterInstance}/${props.projectName}/`,
                                );
                            }
                        }

                        result = (
                            <>
                                <TextField
                                    variant="standard"
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                                            endAdornment: (
                                                <Button
                                                    tabIndex={-1}
                                                    style={{ minWidth: 30 }}
                                                    size="small"
                                                    onClick={() => setImageDialog(true)}
                                                >
                                                    ...
                                                </Button>
                                            ),
                                        },
                                    }}
                                    label={I18n.t(field.name)}
                                    value={value || ''}
                                    onChange={e => change(e.target.value)}
                                />
                                {imageDialog ? (
                                    <SelectFileDialog
                                        title={I18n.t('Select file')}
                                        onClose={() => setImageDialog(false)}
                                        restrictToFolder={`${props.adapterName}.${props.adapterInstance}/${props.projectName}`}
                                        allowNonRestricted
                                        allowUpload
                                        allowDownload
                                        allowCreateFolder
                                        allowDelete
                                        allowView
                                        showToolbar
                                        imagePrefix="../"
                                        selected={_value}
                                        filterByType="images"
                                        theme={props.theme}
                                        onOk={_selected => {
                                            let selected = Array.isArray(_selected) ? _selected[0] : _selected;
                                            const projectPrefix = `${props.adapterName}.${props.adapterInstance}/${props.projectName}/`;
                                            if (selected.startsWith(projectPrefix)) {
                                                selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                                            } else if (selected.startsWith('/')) {
                                                selected = `..${selected}`;
                                            } else if (!selected.startsWith('.')) {
                                                selected = `../${selected}`;
                                            }
                                            change(selected);
                                            setImageDialog(false);
                                        }}
                                        socket={props.socket as any as Connection}
                                    />
                                ) : null}
                            </>
                        );
                    } else {
                        // type === 'text' or type === 'number'
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
                            key={field.field || index.toString()}
                            style={styles.field}
                        >
                            {result}
                        </div>
                    );
                })}

                <Button
                    style={{
                        marginBottom: 10,
                    }}
                    color="grey"
                    variant="contained"
                    onClick={() =>
                        props.socket
                            .sendTo(`${props.adapterName}.${props.adapterInstance}`, 'rebuild', null)
                            .then(() => {
                                window.alert(I18n.t('Rebuild of HTML pages was started'));
                                props.onClose();
                            })
                            .catch(e => window.alert(`Cannot rebuild: ${e}`))
                    }
                    startIcon={<Refresh />}
                >
                    {I18n.t('Rebuild HTML pages')}
                </Button>
                <Button
                    style={{
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
}
