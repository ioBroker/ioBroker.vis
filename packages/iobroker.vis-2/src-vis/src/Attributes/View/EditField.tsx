import React from 'react';
import {
    Autocomplete,
    Checkbox,
    IconButton,
    Input,
    ListItemText,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Slider,
    TextField,
} from '@mui/material';

import {
    ColorPicker,
    I18n,
    IconPicker,
    TextWithIcon,
    type LegacyConnection,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import { Clear as ClearIcon } from '@mui/icons-material';

import { deepClone } from '@/Utils/utils';
import commonStyles from '@/Utils/styles';
import type { Field } from '@/Attributes/View/Items';
import type { AdditionalIconSet, Project, ViewSettings, VisTheme } from '@iobroker/types-vis-2';

import EditFieldImage from './EditFieldImage';
import EditFieldIcon64 from './EditFieldIcon64';

interface EditFieldProps {
    field: Field;
    view: string;
    editMode: boolean;
    themeType: ThemeType;
    theme: VisTheme;
    checkFunction: (
        funcText: boolean | string | ((settings: ViewSettings) => boolean),
        settings: ViewSettings,
    ) => boolean;
    changeProject: (project: Project) => void;
    userGroups: Record<string, ioBroker.GroupObject>;
    adapterName: string;
    instance: number;
    projectName: string;
    socket: LegacyConnection;
    disabled: boolean;
    project: Project;
    additionalSets: AdditionalIconSet;
}

export default function getEditField(gProps: EditFieldProps): React.JSX.Element {
    const {
        field,
        view,
        editMode,
        themeType,
        checkFunction,
        changeProject,
        project,
        userGroups,
        adapterName,
        instance,
        projectName,
        socket,
        disabled,
        theme,
        additionalSets,
    } = gProps;
    const viewSettings = project[view].settings;

    // if hidden
    if (checkFunction(field.hidden, viewSettings || {})) {
        return null;
    }
    const error = checkFunction(field.error, viewSettings || {});

    const rawValue: any = field.notStyle
        ? (viewSettings as Record<string, any>)?.[field.attr]
        : (viewSettings as Record<string, any>)?.style[field.attr];
    let value: any = rawValue;
    if (value === null || value === undefined) {
        value = '';
    }

    const change = (changeValue: boolean | number | string | null): void => {
        const newProject = deepClone(project);
        if (newProject[view].settings) {
            if (field.notStyle) {
                (newProject[view].settings as Record<string, any>)[field.attr] = changeValue;
            } else {
                (newProject[view].settings as Record<string, any>).style[field.attr] = changeValue;
            }
        }
        changeProject(newProject);
    };

    if (field.type === 'autocomplete' || field.type === 'filter') {
        let options;
        if (field.type === 'filter') {
            options = window.vis ? window.vis.updateFilter() : [];
            options.unshift('');
        } else {
            options = field.options || [];
        }

        return (
            <Autocomplete
                freeSolo
                options={options}
                disabled={!editMode || disabled}
                inputValue={value}
                value={value}
                onInputChange={(_e, inputValue) => change(inputValue)}
                onChange={(_e, inputValue) => change(inputValue)}
                sx={{ ...commonStyles.clearPadding, ...commonStyles.fieldContent }}
                renderInput={params => (
                    <TextField
                        variant="standard"
                        {...params}
                    />
                )}
            />
        );
    }
    if (field.type === 'checkbox') {
        return (
            <Checkbox
                disabled={!editMode || disabled}
                checked={!!value}
                sx={{ ...commonStyles.clearPadding, ...commonStyles.fieldContent }}
                size="small"
                onChange={e => change(e.target.checked)}
            />
        );
    }
    if (field.type === 'select') {
        return (
            <Select
                disabled={!editMode || disabled}
                variant="standard"
                value={field.value ? field.value : value}
                sx={{
                    ...commonStyles.clearPadding,
                    '& .MuiSelect-select': { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                }}
                onChange={
                    field.onChange ? field.onChange : (e: SelectChangeEvent<string | number>) => change(e.target.value)
                }
                renderValue={field.renderValue}
                fullWidth
            >
                {field.options?.map(selectItem => (
                    <MenuItem
                        value={selectItem.value}
                        key={selectItem.value}
                    >
                        {field.itemModify
                            ? field.itemModify(selectItem)
                            : field.noTranslation
                              ? selectItem.label
                              : I18n.t(selectItem.label)}
                    </MenuItem>
                ))}
            </Select>
        );
    }
    if (field.type === 'multi-select') {
        return (
            <Select
                disabled={!editMode || disabled}
                variant="standard"
                renderValue={selected => selected.join(', ')}
                sx={{
                    ...commonStyles.clearPadding,
                    '& .MuiSelect-select': { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                }}
                value={value || []}
                onChange={e => change(e.target.value)}
                multiple
                fullWidth
            >
                {field.options?.map(selectItem => (
                    <MenuItem
                        value={selectItem.value}
                        key={selectItem.value}
                    >
                        <Checkbox checked={value.includes(selectItem.value)} />
                        <ListItemText primary={field.noTranslation ? selectItem.label : I18n.t(selectItem.label)} />
                    </MenuItem>
                ))}
            </Select>
        );
    }
    if (field.type === 'groups') {
        return (
            <Select
                variant="standard"
                disabled={!editMode || disabled}
                value={value || []}
                fullWidth
                multiple
                sx={{
                    ...commonStyles.clearPadding,
                    '& .MuiSelect-select': { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                }}
                renderValue={selected => (
                    <div style={{ display: 'flex' }}>
                        {Object.values(userGroups)
                            .filter(_group => selected.includes(_group._id.split('.')[2]))
                            .map(_group => (
                                <span
                                    key={_group._id}
                                    style={{ padding: '4px 4px' }}
                                >
                                    <TextWithIcon
                                        value={_group._id}
                                        lang={I18n.getLanguage()}
                                        list={[_group]}
                                    />
                                </span>
                            ))}
                    </div>
                )}
                onChange={e => change(e.target.value)}
            >
                {Object.values(userGroups).map((_group, i) => (
                    <MenuItem
                        value={_group._id.split('.')[2]}
                        key={`${_group._id.split('.')[2]}_${i}`}
                    >
                        <Checkbox
                            disabled={disabled}
                            checked={(value || []).includes(_group._id.split('.')[2])}
                        />
                        <TextWithIcon
                            value={_group._id}
                            lang={I18n.getLanguage()}
                            list={[_group]}
                        />
                    </MenuItem>
                ))}
            </Select>
        );
    }
    if (field.type === 'raw') {
        return field.Component;
    }
    if (field.type === 'color') {
        return (
            <ColorPicker
                value={value}
                style={commonStyles.fieldContentColor}
                disabled={!editMode || disabled}
                onChange={color => change(color)}
            />
        );
    }
    if (field.type === 'icon') {
        return (
            <IconPicker
                value={value}
                onChange={fileBlob => change(fileBlob)}
                disabled={!editMode || disabled}
                // icon={ImageIcon}
                // classes={classes}
            />
        );
    }
    if (field.type === 'image') {
        return (
            <EditFieldImage
                theme={theme}
                field={field}
                value={value}
                error={error}
                editMode={editMode}
                disabled={disabled}
                themeType={themeType}
                change={change}
                adapterName={adapterName}
                instance={instance}
                projectName={projectName}
                socket={socket}
            />
        );
    }
    if (field.type === 'slider') {
        return (
            <div style={{ display: 'flex' }}>
                <Slider
                    disabled={!editMode || disabled}
                    style={commonStyles.fieldContentSlider}
                    size="small"
                    onChange={(_e, newValue) => change(Array.isArray(newValue) ? newValue[0] : newValue)}
                    value={typeof value === 'number' ? value : 0}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    marks={field.marks}
                    valueLabelDisplay={field.valueLabelDisplay}
                />
                <Input
                    style={commonStyles.fieldContentSliderInput}
                    value={value}
                    disabled={!editMode || disabled}
                    size="small"
                    onChange={e => change(parseFloat(e.target.value))}
                    sx={{ ...commonStyles.clearPadding, ...commonStyles.fieldContent }}
                    inputProps={{
                        step: field.step,
                        min: field.min,
                        max: field.max,
                        type: 'number',
                    }}
                />
                <IconButton
                    disabled={!editMode || disabled}
                    onClick={() => change(null)}
                >
                    <ClearIcon />
                </IconButton>
            </div>
        );
    }
    if (field.type === 'icon64') {
        return (
            <EditFieldIcon64
                value={value}
                error={error}
                editMode={editMode}
                disabled={disabled}
                themeType={themeType}
                change={change}
                theme={theme}
                additionalSets={additionalSets}
            />
        );
    }

    return (
        <TextField
            disabled={!editMode || disabled}
            variant="standard"
            fullWidth
            slotProps={{
                input: {
                    endAdornment:
                        field.clearButton && rawValue !== null && rawValue !== undefined ? (
                            <IconButton
                                size="small"
                                onClick={() => change(null)}
                            >
                                <ClearIcon />
                            </IconButton>
                        ) : null,
                    sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                },
            }}
            value={value}
            onChange={e => change(e.target.value)}
            type={field.type}
            error={!!error}
            helperText={typeof error === 'string' ? I18n.t(error) : null}
        />
    );
}
