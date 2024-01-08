/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Tooltip,
    ButtonGroup, Radio,
    RadioGroup,
    FormControlLabel, MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormLabel, Slider,
    List,
} from '@mui/material';

import {
    I18n,
    Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';
import BulkEditor from './BulkEditor';
import { deepClone } from '../../../Utils/utils';

class JQuiState extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplJquiButtonState',
            visSet: 'jqui',
            visName: 'States control',
            visWidgetLabel: 'jqui_states_control',
            visPrev: 'widgets/jqui/img/Prev_ButtonState.png',
            visOrder: 14,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            noTranslation: true,
                            default: 'button',
                            options: ['button', 'select', 'radio', 'slider'],
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name]) {
                                    if (await BulkEditor.generateFields(data, socket)) {
                                        changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'readOnly',
                            type: 'checkbox',
                        },
                        {
                            name: 'click_id',
                            type: 'id',
                            noSubscribe: true,
                            hidden: data => !!data.readOnly,
                        },
                        {
                            name: 'count',
                            type: 'slider',
                            min: 0,
                            default: 1,
                            max: 10,
                            hidden: data => !!data.percents,
                        },
                        {
                            type: 'custom',
                            component: (
                                field,
                                data,
                                onDataChange,
                                props, // {context: {views, view, socket, themeType, projectName, adapterName, instance, id, widget}, selectedView, selectedWidget, selectedWidgets}
                            ) => <BulkEditor
                                // TODO: if multiple widgets of this type selected data will get undefined, check why
                                data={data || {}}
                                onDataChange={onDataChange}
                                socket={props.context.socket}
                                themeType={props.context.themeType}
                                adapterName={props.context.adapterName}
                                instance={props.context.instance}
                                projectName={props.context.projectName}
                            />,
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'text', 'standard'],
                            default: 'contained',
                            hidden: data => data.type !== 'button' && data.type !== 'select',
                        },
                        {
                            name: 'orientation',
                            label: 'orientation',
                            type: 'select',
                            options: ['horizontal', 'vertical'],
                            default: 'horizontal',
                            hidden: data => data.type !== 'button' && data.type !== 'slider',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'jqui_name',
                            type: 'text',
                        },
                        {
                            name: 'timeout',
                            label: 'jqui_set_timeout',
                            type: 'number',
                            hidden: data => data.type !== 'slider',
                        },
                        {
                            name: 'open',
                            label: 'jqui_open',
                            type: 'checkbox',
                            hidden: data => data.type !== 'select',
                        },
                    ],
                },
                {
                    name: 'states',
                    label: 'jqui_group_value',
                    indexFrom: 1,
                    indexTo: 'count',
                    hidden: data => !!data.percents,
                    fields: [
                        {
                            name: 'value',
                            type: 'text',
                            label: 'jqui_value',
                            default: '0',
                        },
                        {
                            name: 'test',
                            type: 'checkbox',
                            label: 'jqui_test',
                            onChange: async (field, data, changeData, socket, index) => {
                                if (data[field.name]) {
                                    let changed = false;
                                    // deactivate all other tests
                                    for (let i = 1; i <= data.count; i++) {
                                        if (i !== index) {
                                            if (data[`test${i}`]) {
                                                changed = true;
                                                data[`test${i}`] = false;
                                            }
                                        }
                                    }
                                    changed && changeData(data);
                                }
                            },
                            hidden: (data, index) => data.type === 'slider' || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'onlyIcon',
                            type: 'checkbox',
                            label: 'jqui_only_icon',
                        },
                        {
                            name: 'text',
                            default: I18n.t('Value'),
                            type: 'text',
                            label: 'jqui_text',
                            hidden: (data, index) => !!data[`onlyIcon${index}`] || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                            hidden: (data, index) => data.type === 'slider' || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'activeColor',
                            type: 'color',
                            label: 'jqui_active_color',
                            hidden: (data, index) => data.type === 'slider' || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'image',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: (data, index) => data.type === 'slider' || !!data.icon || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: (data, index) => data.type === 'slider' || !!data.image || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                        {
                            name: 'tooltip',
                            label: 'jqui_tooltip',
                            type: 'text',
                            hidden: (data, index) => data.type === 'slider' || data[`value${index}`] === '' || data[`value${index}`] === null || data[`value${index}`] === undefined,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 300,
                height: 40,
            },
        };
    }

    async componentDidMount() {
        await super.componentDidMount();

        // convert old tplJquiRadioSteps data to JquiState data
        if (this.props.tpl === 'tplJquiRadioSteps' && this.state.data && this.props.context.onWidgetsChanged && this.state.data.count === undefined) {
            const data = JSON.parse(JSON.stringify(this.state.data));

            data.count = 5;
            const min = parseFloat(data.min || 0, 10);
            const max = parseFloat(data.max || 100, 10);

            data.value1 = min;
            data.text1 = I18n.t('jqui_off');
            data['g_states-1'] = true;

            data.value5 = max;
            data.text5 = '100%';
            data['g_states-5'] = true;

            data.value2 = (max - min) * 0.25 + min;
            data.text2 = '25%';
            data['g_states-2'] = true;

            data.value3 = (max - min) * 0.5 + min;
            data.text3 = '50%';
            data['g_states-3'] = true;

            data.value4 = (max - min) * 0.75 + min;
            data.text4 = '75%';
            data['g_states-4'] = true;

            data.min = null;
            data.max = null;

            setTimeout(() => this.props.context.onWidgetsChanged([{
                wid: this.props.id,
                view: this.props.view,
                data,
            }]), 100);
        }

        // convert old tplJquiRadioList data to JquiState data
        if ((this.props.tpl === 'tplJquiRadioList' || this.props.tpl === 'tplJquiSelectList') && this.state.data && this.state.data.values && this.state.data.texts && this.props.context.onWidgetsChanged) {
            // convert
            const values = this.state.data.values.split(';');
            const texts = this.state.data.texts.split(';');
            const data = deepClone(this.state.data);
            data.values = null;
            data.texts = null;
            data.count = values.length;
            for (let i = 1; i <= values.length; i++) {
                data[`value${i}`] = values[i - 1];
                data[`text${i}`] = texts[i - 1];
                data[`g_states-${i}`] = true;
            }
            data.type = this.props.tpl === 'tplJquiRadioList' ? 'radio' : 'select';
            setTimeout(() => this.props.context.onWidgetsChanged([{
                wid: this.props.id,
                view: this.props.view,
                data,
            }]), 100);
        }

        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            try {
                const state = await this.props.context.socket.getState(this.state.rxData.oid);
                this.onStateUpdated(this.state.rxData.oid, state);
            } catch (error) {
                console.error(`Cannot get state ${this.state.rxData.oid}: ${error}`);
            }
        }
    }

    async componentWillUnmount() {
        super.componentWillUnmount();
        this.controlTimeout && clearTimeout(this.controlTimeout);
        this.controlTimeout = null;
    }

    static findField(widgetInfo, name) {
        return VisRxWidget.findField(widgetInfo, name);
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiState.getWidgetInfo();
    }

    onStateUpdated(id, state) {
        if (id === this.state.rxData.oid && state) {
            const value = state.val === null || state.val === undefined ? '' : state.val;

            if (this.state.value !== value.toString()) {
                this.setState({ value: value.toString() });
            }
        }
    }

    getControlOid() {
        if (this.state.rxData.click_id && this.state.rxData.click_id !== 'nothing_selected') {
            return this.state.rxData.click_id;
        }
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            return this.state.rxData.oid;
        }
        return '';
    }

    async onClick(indexOrValue, immediately) {
        if (this.state.rxData.readOnly || this.props.editMode) {
            return;
        }

        if (this.state.rxData.type === 'slider') {
            this.controlTimeout && clearTimeout(this.controlTimeout);
            this.controlTimeout = setTimeout(() => {
                this.controlTimeout = null;
                const oid = this.getControlOid();
                if (oid) {
                    this.props.context.setValue(oid, parseFloat(indexOrValue));
                }
            }, immediately ? 0 : parseInt(this.state.rxData.timeout, 10) || 300);
            this.setState({ value: indexOrValue });
        } else {
            const oid = this.getControlOid();
            if (oid) {
                if (this.state.valueType === 'number') {
                    this.props.context.setValue(oid, parseFloat(this.state.rxData[`value${indexOrValue}`]));
                } else {
                    this.props.context.setValue(oid, this.state.rxData[`value${indexOrValue}`]);
                }
            }
            this.setState({ value: this.state.rxData[`value${indexOrValue}`] });
        }
    }

    getSelectedIndex(value) {
        if (value === undefined) {
            value = this.state.value;
        }

        if (this.props.editMode) {
            for (let i = 1; i <= this.state.rxData.count; i++) {
                if (this.state.rxData[`test${i}`]) {
                    return i;
                }
            }
        }
        for (let i = 1; i <= this.state.rxData.count; i++) {
            if (this.state.rxData[`value${i}`] === value) {
                return i;
            }
        }
        return 0;
    }

    renderIcon(i, selectedIndex) {
        let color;
        let icon = this.state.rxData[`icon${i}`] || this.state.rxData[`image${i}`];
        if (icon && this.state.rxData[`color${i}`]) {
            color = this.state.rxData[`color${i}`];
            if (i === selectedIndex && this.state.rxData[`activeColor${i}`]) {
                color = this.state.rxData[`activeColor${i}`];
            }
        }

        if (icon) {
            if (icon.startsWith('_PRJ_NAME/')) {
                icon = icon.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
            }
            const style = { color };
            style.width = 'auto';
            style.height = 24;

            return <Icon
                key="icon"
                style={style}
                src={icon}
            />;
        }
        return null;
    }

    renderText(i, selectedIndex) {
        if (this.state.rxData[`onlyIcon${i}`]) {
            return null;
        }
        let text = this.state.rxData[`text${i}`];
        let color = this.state.rxData[`color${i}`];
        if (i === selectedIndex && this.state.rxData[`activeColor${i}`]) {
            color = this.state.rxData[`activeColor${i}`];
        }

        text = text || this.state.rxData[`value${i}`];

        return <span style={{ color }}>{text}</span>;
    }

    renderButton(i, selectedIndex, buttonStyle) {
        const icon = this.renderIcon(i, selectedIndex);
        const text = this.renderText(i, selectedIndex);

        // Button
        const button = <Button
            key={i}
            style={{ ...buttonStyle, flexGrow: 1 }}
            startIcon={text ? icon : undefined}
            color={selectedIndex === i ? 'primary' : 'grey'}
            onClick={() => this.onClick(i)}
        >
            {text || icon}
        </Button>;

        if (this.state.rxData[`tooltip${i}`]) {
            return <Tooltip key={i} title={this.state.rxData[`tooltip${i}`]}>
                {button}
            </Tooltip>;
        }

        return button;
    }

    renderRadio(i, selectedIndex, buttonStyle) {
        const icon = this.renderIcon(i, selectedIndex);
        let text = this.renderText(i, selectedIndex);

        if (icon && text) {
            text = <div style={{ display: 'flex', gap: 4 }}>
                {icon}
                {text}
            </div>;
        }

        // Button
        const button = <FormControlLabel
            key={i}
            style={buttonStyle}
            control={<Radio
                onClick={() => this.onClick(i)}
                checked={selectedIndex === i}
            />}
            labelPlacement="end"
            label={text || icon}
        />;

        if (this.state.rxData[`tooltip${i}`]) {
            return <Tooltip key={i} title={this.state.rxData[`tooltip${i}`]}>
                {button}
            </Tooltip>;
        }
        return button;
    }

    renderMenuItem(i, selectedIndex, buttonStyle) {
        const icon = this.renderIcon(i, selectedIndex);
        let text = this.renderText(i, selectedIndex);

        if (icon && text) {
            text = <div style={{ display: 'flex', gap: 4 }}>
                {icon}
                {text}
            </div>;
        }

        // Button
        return <MenuItem
            title={this.state.rxData[`tooltip${i}`]}
            key={i}
            selected={selectedIndex === i}
            style={buttonStyle}
            value={this.state.rxData[`value${i}`]}
            onClick={this.state.rxData.open ? () => this.onClick(i) : undefined}
        >
            {text || icon}
        </MenuItem>;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const selectedIndex = this.getSelectedIndex();

        if (this.state.object?._id !== this.state.rxData.oid && this.state.object !== false) {
            this.state.object = false;
            setTimeout(async () => {
                if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
                    const obj = await this.props.context.socket.getObject(this.state.rxData.oid);
                    if (obj?.common?.type) {
                        this.setState({ object: { _id: obj._id, common: { type: obj.common.type } } });
                        return;
                    }
                }
                this.setState({ object: { _id: this.state.rxData.oid, common: { type: 'string' } } });
            }, 0);
        }

        const buttonStyle = {};
        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = this.state.rxStyle[attr];
            if (value !== null &&
                value !== undefined &&
                VisRxWidget.POSSIBLE_MUI_STYLES.includes(attr)
            ) {
                attr = attr.replace(
                    /(-\w)/g,
                    text => text[1].toUpperCase(),
                );
                buttonStyle[attr] = value;
            }
        });

        let content;
        if (
            (!this.state.rxData.count ||
                (this.state.rxData.count === 1 && !this.state.rxData.text0 && !this.state.rxData.icon0 && !this.state.rxData.image0)) &&
            (!this.state.rxData.oid || this.state.rxData.oid === 'nothing_selected')
        ) {
            content = <Button
                variant="outlined"
                style={{ width: '100%', height: '100%' }}
            >
                {I18n.t('Select object ID')}
            </Button>;
        } else if (!this.state.rxData.count) {
            content = <Button
                variant="outlined"
                style={{ width: '100%', height: '100%' }}
            >
                {I18n.t('Please define states')}
            </Button>;
        }  else if (this.state.rxData.type === 'radio') {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderRadio(i, selectedIndex, buttonStyle));
            }

            content = <RadioGroup
                style={{ width: '100%', height: '100%' }}
                variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
            >
                {buttons}
            </RadioGroup>;
        } else if (this.state.rxData.type === 'select') {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderMenuItem(i, selectedIndex, buttonStyle));
            }

            let variant = 'standard';
            if (this.state.rxData.variant === 'contained') {
                variant = 'filled';
            } else if (this.state.rxData.variant === 'outlined') {
                variant = 'outlined';
            }

            if (this.state.rxData.open) {
                content = <List
                    style={{ width: '100%', height: '100%' }}
                    value={this.state.value}
                    onChange={e => this.onClick(this.getSelectedIndex(e.target.value))}
                    variant={variant}
                >
                    {buttons}
                </List>;
            } else {
                content = <Select
                    style={{ width: '100%', height: '100%' }}
                    value={this.state.value === undefined ? '' : this.state.value}
                    onChange={e => this.onClick(this.getSelectedIndex(e.target.value))}
                    variant={variant}
                >
                    {buttons}
                </Select>;
            }
        } else if (this.state.rxData.type === 'slider') {
            props.style.overflow = 'visible';
            const marks = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                marks.push({
                    value: parseFloat(this.state.rxData[`value${i}`] || 0),
                    label: this.state.rxData[`text${i}`] || 0,
                });
            }

            content = <Slider
                style={!this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal' ?
                    { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' } :
                    { marginTop: 10, marginBottom: 10 }}
                value={parseFloat(this.state.value) || 0}
                valueLabelDisplay="auto"
                min={marks[0].value}
                max={marks[marks.length - 1].value}
                orientation={this.state.rxData.orientation || 'horizontal'}
                marks={marks}
                onChangeCommitted={(e, value) => this.onClick(value, true)}
                onChange={(e, value) => this.onClick(value)}
            />;
        } else {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderButton(i, selectedIndex, buttonStyle));
            }

            content = <ButtonGroup
                style={{ width: '100%', height: '100%' }}
                orientation={this.state.rxData.orientation || 'horizontal'}
                variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
            >
                {buttons}
            </ButtonGroup>;
        }

        if (this.state.rxData.widgetTitle) {
            content = <FormControl
                fullWidth
                style={{
                    marginTop: this.state.rxData.type === 'select' ? 5 : undefined,
                    width: '100%',
                    height: '100%',
                }}
            >
                {this.state.rxData.type === 'select' ?
                    <InputLabel>{this.state.rxData.widgetTitle}</InputLabel> :
                    <FormLabel style={this.state.rxData.type === 'slider' ? { marginLeft: 10 } : undefined}>{this.state.rxData.widgetTitle}</FormLabel>}
                {content}
            </FormControl>;
        }

        return <div className="vis-widget-body">
            {content}
        </div>;
    }
}

JQuiState.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiState;
