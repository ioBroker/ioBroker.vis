import {
    useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import {
    Autocomplete,
    Box,
    Button, Checkbox, Input, ListItemText, ListSubheader, MenuItem, Select, Slider, TextField,
} from '@mui/material';

import ColorPicker from '@iobroker/adapter-react-v5/Components/ColorPicker';
import SelectID from '@iobroker/adapter-react-v5/Dialogs/SelectID';
import TextWithIcon from '@iobroker/adapter-react-v5/Components/TextWithIcon';
import i18n from '@iobroker/adapter-react-v5/i18n';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileIcon from '@mui/icons-material/InsertDriveFile';

import FileBrowser from './FileBrowser';
import IODialog from '../../Components/IODialog';
import TextDialog from './TextDialog';

function collectClasses() {
    const result = [];
    const sSheetList = document.styleSheets;
    for (let sSheet = 0; sSheet < sSheetList.length; sSheet++) {
        if (!document.styleSheets[sSheet]) {
            continue;
        }
        try {
            const ruleList = document.styleSheets[sSheet].cssRules;
            if (ruleList) {
                for (let rule = 0; rule < ruleList.length; rule++) {
                    if (!ruleList[rule].selectorText) {
                        continue;
                    }
                    const _styles = ruleList[rule].selectorText.split(',');
                    for (let s = 0; s < _styles.length; s++) {
                        const subStyles = _styles[s].trim().split(' ');
                        const _style = subStyles[subStyles.length - 1].replace('::before', '').replace('::after', '').replace(':before', '').replace(':after', '');

                        if (!_style || _style[0] !== '.' || _style.includes(':')) {
                            continue;
                        }

                        let name = _style;
                        name = name.replace(',', '');
                        name = name.replace(/^\./, '');

                        const val  = name;
                        name = name.replace(/^hq-background-/, '');
                        name = name.replace(/^hq-/, '');
                        name = name.replace(/^ui-/, '');
                        name = name.replace(/[-_]/g, ' ');

                        if (name.length > 0) {
                            name = name[0].toUpperCase() + name.substring(1);
                            let fff = document.styleSheets[sSheet].href;

                            if (fff && fff.includes('/')) {
                                fff = fff.substring(fff.lastIndexOf('/') + 1);
                            }

                            if (!result[val]) {
                                if (subStyles.length > 1) {
                                    result[val] = {
                                        name, file: fff, attrs: ruleList[rule].style, parentClass: subStyles[0].replace('.', ''),
                                    };
                                } else {
                                    result[val] = { name, file: fff, attrs: ruleList[rule].style };
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    return result;
}

function getStylesOptions(options) {
    // Fill the list of styles
    const _internalList = window.collectClassesValue;

    options.filterName  = options.filterName  || '';
    options.filterAttrs = options.filterAttrs || '';
    options.filterFile  = options.filterFile  || '';

    let styles = {};

    if (options.styles) {
        styles = { ...options.styles };
    } else if (options.filterFile || options.filterName) {
        // IF filter defined
        const filters = (options.filterName)  ? options.filterName.split(' ')  : null;
        const attrs   = (options.filterAttrs) ? options.filterAttrs.split(' ') : null;
        const files   = (options.filterFile)  ? options.filterFile.split(' ')  : [''];

        Object.keys(_internalList).forEach(style =>
            files.forEach(file => {
                if (!options.filterFile ||
                        (_internalList[style].file && _internalList[style].file.includes(file))
                ) {
                    let isFound = !filters;

                    isFound = isFound || (!!filters.find(filter => style.includes(filter)));

                    if (isFound) {
                        isFound = !attrs;
                        if (!isFound) {
                            isFound = attrs.find(attr => {
                                const t = _internalList[style].attrs[attr];
                                return t || t === 0;
                            });
                        }
                    }

                    if (isFound) {
                        let n = _internalList[style].name;
                        if (options.removeName) {
                            n = n.replace(options.removeName, '');
                            n = n[0].toUpperCase() + n.substring(1).toLowerCase();
                        }
                        styles[style] = {
                            name:        n,
                            file:        _internalList[style].file,
                            parentClass: _internalList[style].parentClass,
                        };
                    }
                }
            }));
    } else {
        styles = { ...styles, ..._internalList };
    }

    return styles;
}

const getViewOptions = (project, options = [], parentId = null, level = 0) => {
    project.___settings.folders
        .filter(folder => (folder.parentId || null) === parentId)
        .forEach(folder => {
            options.push({
                type: 'folder',
                folder,
                level: level + 1,
            });
            getViewOptions(project, options, folder.id, level + 1);
        });
    Object.keys(project)
        .filter(view => (project[view].parentId || null) === parentId &&
                !view.startsWith('__'))
        .forEach(view => {
            options.push({
                type: 'view',
                view,
                level: level + 1,
            });
        });
    return options;
};

// Optimize translation
const wordsCache = {};

const t = (word, ...args) => {
    const hash = `${word}_${args.join(',')}`;
    if (!wordsCache[hash]) {
        wordsCache[hash] = i18n.t(word, ...args);
    }
    return wordsCache[hash];
};

const WidgetField = props => {
    const [idDialog, setIdDialog] = useState(false);

    const [objectCache, setObjectCache] = useState(null);

    const {
        field,
        widget,
        adapterName,
        instance,
        projectName,
        isDifferent,
    } = props;

    const [cachedValue, setCachedValue] = useState('');

    const cacheTimer = useRef(null);

    const applyValue = newValues => {
        const project = JSON.parse(JSON.stringify(props.project));
        props.selectedWidgets.forEach((selectedWidget, i) => {
            const value = Array.isArray(newValues) ? newValues[i] : newValues;

            const data = props.isStyle
                ? project[props.selectedView].widgets[selectedWidget].style
                : project[props.selectedView].widgets[selectedWidget].data;

            if (field.default && data[field.name] === field.default) {
                delete data[field.name];
            } else {
                data[field.name] = value;
            }

            if (field.onChangeFunc) {
                window.vis.binds[widget.widgetSet][field.onChangeFunc](
                    selectedWidget, props.selectedView, value, field.name, props.isStyle,
                    props.isStyle ? widget.style[field.name] : widget.data[field.name],
                );
            }
        });

        props.changeProject(project);
    };

    const change = changeValue => {
        if (Array.isArray(changeValue) || field.immediateChange) {
            // apply immediately
            applyValue(changeValue);
        } else {
            setCachedValue(changeValue);
            cacheTimer.current && clearTimeout(cacheTimer.current);
            cacheTimer.current = setTimeout(() => applyValue(changeValue), 300);
        }
    };

    const propValue = props.isStyle ? widget.style[field.name] : widget.data[field.name];
    useEffect(() => {
        setCachedValue(propValue);
    }, [propValue]);
    let value = cachedValue;
    if (value === undefined || value === null) {
        if (field.default) {
            value = field.default;
        } else {
            value = '';
        }
    }

    if (!window.collectClassesValue) {
        window.collectClassesValue = collectClasses();
    }

    if (field.type === 'id' || field.type === 'hid' || field.type === 'history') {
        if (value && (!objectCache || value !== objectCache._id)) {
            props.socket.getObject(value).then(objectData => setObjectCache(objectData)).catch(() => setObjectCache(null));
        }
        if (objectCache && !value) {
            setObjectCache(null);
        }

        return <>
            <TextField
                variant="standard"
                fullWidth
                placeholder={isDifferent ? t('different') : null}
                InputProps={{
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                    endAdornment: <Button size="small" onClick={() => setIdDialog(true)}>...</Button>,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />
            <div style={{ fontStyle: 'italic' }}>
                {objectCache ? (typeof objectCache.common.name === 'object' ? objectCache.common.name[i18n.lang] : objectCache.common.name) : null}
            </div>
            {idDialog ? <SelectID
                selected={value}
                onOk={selected => change(selected)}
                onClose={() => setIdDialog(false)}
                socket={props.socket}
                customFilter={field.filter}
            /> : null}
        </>;
    }

    if (field.type === 'checkbox') {
        return <Checkbox
            checked={!!value}
            classes={{
                root: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            size="small"
            onChange={e => change(e.target.checked)}
        />;
    }

    if (field.type === 'image') {
        return <>
            <TextField
                variant="standard"
                fullWidth
                placeholder={isDifferent ? t('different') : null}
                InputProps={{
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                    endAdornment: <Button size="small" onClick={() => setIdDialog(true)}>...</Button>,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />
            <IODialog
                title={t('Select file')}
                open={idDialog}
                onClose={() => setIdDialog(false)}
            >
                <FileBrowser
                    ready
                    allowUpload
                    allowDownload
                    allowCreateFolder
                    allowDelete
                    allowView
                    showToolbar
                    selected={value}
                    onSelect={(selected, isDoubleClick) => {
                        const projectPrefix = `${adapterName}.${instance}/${projectName}/`;
                        if (selected.startsWith(projectPrefix)) {
                            selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                        }
                        change(selected);
                        isDoubleClick && setIdDialog(false);
                    }}
                    actionTitle={t('Select')}
                    actionDisabled={!value}
                    t={t}
                    lang={i18n.lang}
                    socket={props.socket}
                />
            </IODialog>
        </>;
    }

    if (field.type === 'dimension') {
        const [, _value, _unit] = (value || '').toString().match(/^(-?[,.0-9]+)(.*)$/) || ['', '', 'px'];
        const unit = _unit || 'px';

        return <TextField
            variant="standard"
            fullWidth
            placeholder={isDifferent ? t('different') : null}
            InputProps={{
                classes: {
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
                endAdornment: !isDifferent ? <Button
                    size="small"
                    title={t('Convert %s to %s', unit, unit === '%' ? 'px' : '%')}
                    onClick={() => {
                        if (unit !== '%') {
                            props.onPxToPercent(props.selectedWidgets, field.name, newValues => change(newValues));
                        } else {
                            props.onPercentToPx(props.selectedWidgets, field.name, newValues => change(newValues));
                        }
                    }}
                >
                    {unit}
                </Button> : null,
            }}
            value={unit === '%' || unit === 'px' || unit === 'em' || unit === 'rem' || unit === 'vh' || unit === 'vmin' || unit === 'vmax' || unit === 'vw' ? _value : _value + unit}
            onChange={e => {
                if (!e.target.value) {
                    change('');
                } else {
                    const [, newValue, _newUnit] = e.target.value.toString().match(/^(-?[,.0-9]+)(.*)$/) || ['', '', 'px'];
                    const newUnit = _newUnit || unit;
                    change(newUnit === 'px' ? newValue : newValue + newUnit);
                }
            }}
        />;
    }

    if (field.type === 'color') {
        return <ColorPicker
            value={value}
            className={props.classes.fieldContentColor}
            onChange={color => change(color)}
            openAbove
        />;
    }

    if (field.type === 'eff_opt') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
    }

    if (field.type === 'slider') {
        return <div style={{ display: 'flex' }}>
            <Slider
                className={props.classes.fieldContentSlider}
                size="small"
                onChange={(e, newValue) => change(newValue)}
                value={typeof value === 'number' ? value : 0}
                min={field.min}
                max={field.max}
                step={field.step}
            />
            <Input
                className={props.classes.fieldContentSliderInput}
                value={value}
                size="small"
                onChange={e => change(parseInt(e.target.value))}
                classes={{
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                }}
                inputProps={{
                    step: field.step,
                    min: field.min,
                    max: field.max,
                    type: 'number',
                }}
            />
        </div>;
    }

    if (field.type === 'select' || field.type === 'nselect' || field.type === 'fontname' || field.type === 'effect' || field.type === 'widget') {
        let { options } = field;

        if (field.type === 'fontname') {
            options = props.fonts;
        }

        if (field.type === 'effect') {
            options = [
                '',
                'show',
                'blind',
                'bounce',
                'clip',
                'drop',
                'explode',
                'fade',
                'fold',
                'highlight',
                'puff',
                'pulsate',
                'scale',
                'shake',
                'size',
                'slide',
            ];
        }

        if (field.type === 'widget') {
            options = Object.keys(props.project[props.selectedView].widgets);
        }

        return <Select
            variant="standard"
            value={value}
            placeholder={isDifferent ? t('different') : null}
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            fullWidth
        >
            {options.map(selectItem => <MenuItem
                value={selectItem}
                key={selectItem}
                style={{ fontFamily: field.type === 'fontname' ? selectItem : null }}
            >
                {
                    selectItem === ''
                        ? <i>{t('none')}</i>
                        : (field.type === 'select' ? t(selectItem) : selectItem)
                }
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'select-views') {
        const options = getViewOptions(props.project).filter(option => option.type === 'folder' || option.view !== props.selectedView);
        return <Select
            variant="standard"
            value={value || []}
            placeholder={isDifferent ? t('different') : null}
            multiple
            renderValue={selected => selected.join(', ')}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value.filter(selectValue => selectValue !== null))}
            fullWidth
        >
            {options.map((option, key) =>
                (option.type === 'view' ?
                    <MenuItem
                        value={option.view}
                        key={key}
                        style={{ paddingLeft: option.level * 16 }}
                    >
                        <FileIcon />
                        <Checkbox checked={(value || []).includes(option.view)} />
                        <ListItemText primary={t(option.view)} />
                    </MenuItem>
                    :
                    <ListSubheader key={key} style={{ paddingLeft: option.level * 16 }}>
                        <FolderOpenIcon />
                        {option.folder.name}
                    </ListSubheader>))}
        </Select>;
    }

    if (field.type === 'groups') {
        return <Select
            variant="standard"
            value={value || []}
            placeholder={isDifferent ? t('different') : null}
            multiple
            renderValue={selected => <div style={{ display: 'flex' }}>
                {props.groups
                    .filter(group => selected.includes(group._id.split('.')[2]))
                    .map((group, key) =>
                        <span key={key} style={{ padding: '4px 4px' }}>
                            <TextWithIcon
                                value={group._id}
                                t={t}
                                lang={i18n.getLanguage()}
                                list={[group]}
                            />
                        </span>)}
            </div>}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            fullWidth
        >
            {props.groups.map(group => <MenuItem
                value={group._id.split('.')[2]}
                key={group._id.split('.')[2]}
            >
                <Checkbox checked={(value || []).includes(group._id.split('.')[2])} />
                <TextWithIcon
                    value={group._id}
                    t={t}
                    lang={i18n.getLanguage()}
                    list={[group]}
                />
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'auto' || field.type === 'class')  {
        let options = field.options;
        if (field.type === 'class') {
            options = window.collectClassesValue.filter(cssClass => cssClass.match(/^vis-style-/));
        }
        if (field.type === 'views') {
            options = Object.keys(props.project)
                .filter(view => !view.startsWith('__'));
        }

        return <Autocomplete
            freeSolo
            fullWidth
            placeholder={isDifferent ? t('different') : null}
            options={options || []}
            inputValue={value || ''}
            value={value || ''}
            onInputChange={(e, inputValue) => change(inputValue)}
            onChange={(e, inputValue) => change(inputValue)}
            classes={{
                input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
            }}
            renderOption={
                (optionProps, option) => (field.name === 'font-family'
                    ? <div style={{ fontFamily: option }} {...optionProps}>{option}</div> : option)
            }
            renderInput={params => (
                <TextField
                    variant="standard"
                    {...params}
                />
            )}
        />;
    }

    if (field.type === 'views')  {
        const options = getViewOptions(props.project);

        return <Autocomplete
            freeSolo
            fullWidth
            placeholder={isDifferent ? t('different') : null}
            options={options || []}
            inputValue={value || ''}
            value={value || ''}
            onInputChange={(e, inputValue) => {
                if (typeof inputValue === 'object' && inputValue !== null) {
                    inputValue = inputValue.type === 'view' ? inputValue.view : inputValue.folder.name;
                }
                change(inputValue);
            }}
            onChange={(e, inputValue) => {
                if (typeof inputValue === 'object' && inputValue !== null) {
                    inputValue = inputValue.type === 'view' ? inputValue.view : inputValue.folder.name;
                }
                change(inputValue);
            }}
            classes={{
                input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
            }}
            getOptionLabel={option => {
                if (typeof option === 'string') {
                    return option;
                }
                return option.type === 'view' ? option.view : option.folder.name;
            }}
            getOptionDisabled={option => option.type === 'folder'}
            renderOption={(optionProps, option) => (option.type === 'view' ?
                <Box
                    component="li"
                    style={{ paddingLeft: option.level * 16 }}
                    {...optionProps}
                    key={`view${option.view}`}
                >
                    <FileIcon />
                    {t(option.view)}
                </Box>
                :
                <Box
                    component="li"
                    style={{ paddingLeft: option.level * 16 }}
                    {...optionProps}
                    key={`folder${option.folder.id}`}
                >
                    <FolderOpenIcon />
                    {option.folder.name}
                </Box>)}
            renderInput={params => (
                <TextField
                    variant="standard"
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                    }}
                />
            )}
        />;
    }

    if (field.type === 'style') {
        const stylesOptions = getStylesOptions({
            filterFile:  field.filterFile,
            filterName:  field.filterName,
            filterAttrs: field.filterAttrs,
            removeName:  field.removeName,
        });
        return <Select
            variant="standard"
            value={value}
            placeholder={isDifferent ? t('different') : null}
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            renderValue={selectValue => <div className={props.classes.backgroundClass}>
                <span className={stylesOptions[selectValue]?.parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${selectValue}`} />
                </span>
                {t(stylesOptions[selectValue]?.name)}
            </div>}
            fullWidth
        >
            {Object.keys(stylesOptions).map(styleName => <MenuItem
                value={styleName}
                key={styleName}
            >
                <span className={stylesOptions[styleName].parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${styleName}`} />
                </span>
                {t(stylesOptions[styleName].name)}
            </MenuItem>)}
        </Select>;
    }

    if (field.type === 'custom') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
    }

    if (field.type === 'text' || field.type === 'html') {
        return <>
            <TextField
                size="small"
                placeholder={isDifferent ? t('different') : null}
                variant="standard"
                value={value}
                multiline
                fullWidth
                InputProps={{
                    endAdornment: <Button size="small" onClick={() => setIdDialog(true)}>{i18n.t('Edit')}</Button>,
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                }}
                rows={2}
                disabled
            />
            <TextDialog
                open={idDialog}
                value={value}
                onChange={newValue => change(newValue)}
                onClose={() => setIdDialog(false)}
                type={field.type}
            />
        </>;
    }

    if (!field.type || field.type === 'number' || field.type === 'password') {
        return <TextField
            variant="standard"
            fullWidth
            placeholder={isDifferent ? t('different') : null}
            InputProps={{
                classes: {
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
            }}
            value={value}
            onChange={e => change(e.target.value)}
            type={field.type ? field.type : 'text'}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            inputProps={{
                min: field.min,
                max: field.max,
                step: field.step,
            }}
        />;
    }

    return <>
        {field.type}
        {'/'}
        {value}
    </>;
};

WidgetField.propTypes = {
    adapterName: PropTypes.string.isRequired,
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    field: PropTypes.object.isRequired,
    fonts: PropTypes.array,
    groups: PropTypes.array,
    instance: PropTypes.number.isRequired,
    isDifferent: PropTypes.bool,
    isStyle: PropTypes.bool,
    onPercentToPx: PropTypes.func,
    onPxToPercent: PropTypes.func,
    project: PropTypes.object,
    projectName: PropTypes.string.isRequired,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    socket: PropTypes.object,
    widget: PropTypes.object.isRequired,
};

export default WidgetField;
