import { useState } from 'react';
import PropTypes from 'prop-types';

import {
    Autocomplete,
    Button, Checkbox, Divider, Input, ListItemText, MenuItem, Select, Slider, TextField,
} from '@mui/material';

import ColorPicker from '@iobroker/adapter-react-v5/Components/ColorPicker';
import SelectID from '@iobroker/adapter-react-v5/Dialogs/SelectID';
import TextWithIcon from '@iobroker/adapter-react-v5/Components/TextWithIcon';
import i18n from '@iobroker/adapter-react-v5/i18n';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import FileBrowser from './FileBrowser';
import IODialog from '../../Components/IODialog';
import TextDialog from './TextDialog';

function collectClasses() {
    const result = [];
    const sSheetList = document.styleSheets;
    for (let sSheet = 0; sSheet < sSheetList.length; sSheet++) {
        if (!document.styleSheets[sSheet]) continue;
        try {
            const ruleList = document.styleSheets[sSheet].cssRules;
            if (ruleList) {
                for (let rule = 0; rule < ruleList.length; rule++) {
                    if (!ruleList[rule].selectorText) continue;
                    const _styles = ruleList[rule].selectorText.split(',');
                    for (let s = 0; s < _styles.length; s++) {
                        const substyles = _styles[s].trim().split(' ');
                        const _style = substyles[substyles.length - 1].replace('::before', '').replace('::after', '').replace(':before', '').replace(':after', '');

                        if (!_style || _style[0] !== '.' || _style.indexOf(':') !== -1) continue;

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

                            if (fff && fff.indexOf('/') !== -1) {
                                fff = fff.substring(fff.lastIndexOf('/') + 1);
                            }

                            if (!result[val]) {
                                if (substyles.length > 1) {
                                    result[val] = {
                                        name, file: fff, attrs: ruleList[rule].style, parentClass: substyles[0].replace('.', ''),
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
    const _internalList = collectClasses();

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

        for (const style in _internalList) {
            if (!_internalList.hasOwnProperty(style)) continue;
            for (let f = 0; f < files.length; f++) {
                if (!options.filterFile ||
                        (_internalList[style].file && _internalList[style].file.indexOf(files[f]) !== -1)) {
                    let isFound = !filters;
                    if (!isFound) {
                        for (let k = 0; k < filters.length; k++) {
                            if (style.indexOf(filters[k]) !== -1) {
                                isFound = true;
                                break;
                            }
                        }
                    }
                    if (isFound) {
                        isFound = !attrs;
                        if (!isFound) {
                            for (let u = 0; u < attrs.length; u++) {
                                const t = _internalList[style].attrs[attrs[u]];
                                if (t || t === 0) {
                                    isFound = true;
                                    break;
                                }
                            }
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
            }
        }
    } else {
        styles = { ...styles, ..._internalList };
    }

    return styles;
}

const WidgetField = props => {
    const [idDialog, setIdDialog] = useState(false);

    const {
        field,
        widget,
        adapterName,
        instance,
        projectName,
    } = props;

    const change = changeValue => {
        const project = JSON.parse(JSON.stringify(props.project));
        props.selectedWidgets.forEach(selectedWidget => {
            const data = props.isStyle
                ? project[props.selectedView].widgets[selectedWidget].style
                : project[props.selectedView].widgets[selectedWidget].data;
            data[field.name] = changeValue;
            if (field.onChangeFunc) {
                window.vis.binds[widget.widgetSet][field.onChangeFunc](
                    selectedWidget, props.selectedView, changeValue, field.name, props.isStyle,
                    props.isStyle ? widget.style[field.name] : widget.data[field.name],
                );
            }
        });
        props.changeProject(project);
    };

    let value = props.isStyle ? widget.style[field.name] : widget.data[field.name];
    if (value === undefined) {
        value = '';
    }

    if (field.type === 'id' || field.type === 'hid' || field.type === 'history') {
        return <>
            <TextField
                variant="standard"
                fullWidth
                InputProps={{
                    classes: {
                        input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                    endAdornment: <Button size="small" onClick={() => setIdDialog(true)}>...</Button>,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />
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
                title={i18n.t('Select file')}
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
                    actionTitle={i18n.t('Select')}
                    actionDisabled={!value}
                    t={i18n.t}
                    lang={i18n.lang}
                    socket={props.socket}
                />
            </IODialog>
        </>;
    }
    if (field.type === 'dimension') {
        const parts = (value || '').toString().match(/^(-?[0-9]+)(.*)$/) || ['', ''];

        return <TextField
            variant="standard"
            fullWidth
            InputProps={{
                classes: {
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
                endAdornment: <Button size="small" onClick={() => change(parts[1] + (parts[2] === 'px' ? '%' : 'px'))}>{parts[2]}</Button>,
            }}
            value={parts[1]}
            onChange={e => change(e.target.value === '' ? '' : (e.target.value + (parts[2] ? parts[2] : 'px')))}
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
                size="small"
                onChange={(e, newValue) => change(newValue)}
                value={value}
                min={field.min}
                max={field.max}
                step={field.step}
                valueLabelDisplay
            />
            <Input
                value={value}
                size="small"
                onChange={e => change(e.target.value)}
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
            options = [
                'Verdana, Geneva, sans-serif',
                'Georgia, "Times New Roman", Times, serif',
                '"Courier New", Courier, monospace',
                'Arial, Helvetica, sans-serif',
                'Tahoma, Geneva, sans-serif',
                '"Trebuchet MS", Arial, Helvetica, sans-serif',
                '"Arial Black", Gadget, sans-serif',
                '"Times New Roman", Times, serif',
                '"Palatino Linotype", "Book Antiqua", Palatino, serif',
                '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                '"MS Serif", "New York", serif',
                '"Comic Sans MS", cursive',
            ];
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
            >
                {
                    selectItem === ''
                        ? <i>{i18n.t('none')}</i>
                        : (field.type === 'select' ? i18n.t(selectItem) : selectItem)
                }
            </MenuItem>)}
        </Select>;
    }
    if (field.type === 'select-views') {
        const options = Object.keys(props.project)
            .filter(view => !view.startsWith('__') && view !== props.selectedView);
        return <Select
            variant="standard"
            value={value || []}
            multiple
            renderValue={selected => selected.join(', ')}
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
            >
                <Checkbox checked={(value || []).includes(selectItem)} />
                <ListItemText primary={i18n.t(selectItem)} />
            </MenuItem>)}
        </Select>;
    }
    if (field.type === 'groups') {
        const options = props.groups.map(group => ({
            name: typeof group.common.name === 'string' ? group.common.name : group.common.name[i18n.getLanguage()] || group.common.name.en,
            /* eslint no-underscore-dangle: 0 */
            value: group._id.replace(/^system\.group\./, ''),
        }));
        return <Select
            variant="standard"
            value={value || []}
            multiple
            renderValue={selected => <div style={{ display: 'flex' }}>
                {props.groups
                    .filter(group => selected.includes(group._id.split('.')[2]))
                    .map(group =>
                        <span style={{ padding: '4px 4px' }}>
                            <TextWithIcon
                                value={group._id}
                                t={i18n.t}
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
                    t={i18n.t}
                    lang={i18n.getLanguage()}
                    list={[group]}
                />
            </MenuItem>)}
        </Select>;
    }
    if (field.type === 'auto' || field.type === 'class' || field.type === 'views')  {
        let options = field.options;
        if (field.type === 'class') {
            options = collectClasses().filter(cssClass => cssClass.match(/^vis-style-/));
        }
        if (field.type === 'views') {
            options = Object.keys(props.project)
                .filter(view => !view.startsWith('__'));
        }

        return <Autocomplete
            freeSolo
            fullWidth
            options={options || []}
            inputValue={value || ''}
            value={value || ''}
            onInputChange={(e, inputValue) => change(inputValue)}
            onChange={(e, inputValue) => change(inputValue)}
            classes={{
                input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
            }}
            renderInput={params => (
                <TextField
                    variant="standard"
                    {...params}
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
            defaultValue={field.default}
            classes={{
                root: props.classes.clearPadding,
                select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            renderValue={selectValue => <div className={props.classes.backgroundClass}>
                <span className={stylesOptions[selectValue].parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${selectValue}`}></span>
                </span>
                {i18n.t(stylesOptions[selectValue].name)}
            </div>}
            fullWidth
        >
            {Object.keys(stylesOptions).map(styleName => <MenuItem
                value={styleName}
                key={styleName}
            >
                <span className={stylesOptions[styleName].parentClass}>
                    <span className={`${props.classes.backgroundClassSquare} ${styleName}`}></span>
                </span>
                {i18n.t(stylesOptions[styleName].name)}
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
                variant="standard"
                value={value}
                multiline
                fullWidth
                InputProps={{
                    endAdornment: <Button size="small" onClick={() => setIdDialog(true)}>Edit</Button>,
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
            InputProps={{
                classes: {
                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
            }}
            value={value}
            onChange={e => change(e.target.value)}
            type={field.type ? field.type : 'text'}
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
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
};

export default WidgetField;
