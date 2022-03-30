import ColorPicker from '@iobroker/adapter-react-v5/Components/ColorPicker';
import SelectID from '@iobroker/adapter-react-v5/Dialogs/SelectID';
import FileBrowser from './FileBrowser';
import i18n from '@iobroker/adapter-react-v5/i18n';
import {
    Autocomplete,
    Button, Checkbox, Dialog, Input, MenuItem, Select, Slider, TextField,
} from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import IODialog from '../../Components/IODialog';
import TextDialog from './TextDialog';

const WidgetField = props => {
    const [idDialog, setIdDialog] = useState(false);

    const { field } = props;
    const { widget } = props;

    const change = changeValue => {
        const project = JSON.parse(JSON.stringify(props.project));
        const data = props.isStyle
            ? project[props.selectedView].widgets[props.selectedWidgets[0]].style
            : project[props.selectedView].widgets[props.selectedWidgets[0]].data;
        data[field.name] = changeValue;
        props.changeProject(project);
    };

    const value = props.isStyle ? widget.style[field.name] : widget.data[field.name];

    if (field.type === 'id') {
        return <>
            <TextField
                variant="standard"
                fullWidth
                InputProps={{
                    classes: {
                        input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                    endAdornment: <Button onClick={() => setIdDialog(true)}>...</Button>,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />
            {idDialog ? <SelectID
                selected={value}
                onOk={selected => change(selected)}
                onClose={() => setIdDialog(false)}
                socket={props.socket}
            /> : null}
        </>;
    }
    if (field.type === 'hid') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
    }
    if (field.type === 'checkbox') {
        return <Checkbox
            checked={!!value}
            classes={{
                root: clsx(props.classes.fieldContent, props.classes.clearPadding),
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
                        input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                    },
                    endAdornment: <Button onClick={() => setIdDialog(true)}>...</Button>,
                }}
                value={value}
                onChange={e => change(e.target.value)}
            />
            <IODialog title="Select file" open={idDialog} onClose={() => setIdDialog(false)}>
                <FileBrowser
                    ready
                    selected={value}
                    onSelect={selected => {
                        change(selected);
                        setIdDialog(false);
                    }}
                    t={i18n.t}
                    lang={i18n.lang}
                    socket={props.socket}
                />
            </IODialog>
        </>;
    }
    if (field.type === 'dimension') {
        const parts = (value || '').match(/^(-?[0-9]+)(.*)$/) || ['', ''];

        return <TextField
            variant="standard"
            fullWidth
            InputProps={{
                classes: {
                    input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
                endAdornment: <Button onClick={() => change(parts[1] + (parts[2] === 'px' ? '%' : 'px'))}>{parts[2]}</Button>,
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
    if (field.type === 'views') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
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
                    input: clsx(props.classes.clearPadding, props.classes.fieldContent),
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
                select: clsx(props.classes.fieldContent, props.classes.clearPadding),
            }}
            onChange={e => change(e.target.value)}
            fullWidth
        >
            {options.map(selectItem => <MenuItem
                value={selectItem}
                key={selectItem}
            >
                {field.type === 'select' ? i18n.t(selectItem) : selectItem}
            </MenuItem>)}
        </Select>;
    }
    if (field.type === 'auto') {
        return <Autocomplete
            freeSolo
            options={field.options || []}
            inputValue={value || ''}
            value={value || ''}
            onInputChange={(e, inputValue) => change(inputValue)}
            onChange={(e, inputValue) => change(inputValue)}
            classes={{
                input: clsx(props.classes.clearPadding, props.classes.fieldContent),
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
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
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
            <Button onClick={() => setIdDialog(true)}>Edit</Button>
            <TextDialog
                open={idDialog}
                value={value}
                onChange={newValue => change(newValue)}
                onClose={() => setIdDialog(false)}
                type={field.type}
            />
        </>;
    }
    if (field.type === 'widget') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
    }
    if (field.type === 'history') {
        return <>
            {field.type}
            {'/'}
            {value}
        </>;
    }
    if (!field.type || field.type === 'number' || field.type === 'password') {
        return <TextField
            variant="standard"
            fullWidth
            InputProps={{
                classes: {
                    input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                },
            }}
            value={value}
            onChange={e => change(e.target.value)}
            type={field.type ? field.type : 'text'}
        />;
    }
    return <>
        {field.type}
        {'/'}
        {value}
    </>;
};

export default WidgetField;
