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
import { withStyles } from '@mui/styles';

import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/uk';
import 'dayjs/locale/it';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/nl';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

const styles = {
    textRoot: {
        '& .MuiInputBase-root': {
            width: '100%',
            height: '100%',
        },
    },
};

class JQuiInputDateTime extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplJquiInputDatetime',
            visSet: 'jqui',
            visName: 'Input Time',
            visWidgetLabel: 'jqui_input_time',
            visPrev: 'widgets/jqui/img/Prev_InputDateTime.png',
            visOrder: 31,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            options: [
                                { label: 'standard', value: 'standard' },
                                { label: 'outlined', value: 'outlined' },
                                { label: 'filled', value: 'filled' },
                            ],
                            default: 'standard',
                        },
                        {
                            name: 'autoFocus',
                            type: 'checkbox',
                        },
                        {
                            name: 'clearable',
                            label: 'jqui_clearable',
                            type: 'checkbox',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'jqui_widgetTitle',
                            type: 'text',
                        },
                        {
                            name: 'ampm',
                            label: 'jqui_ampm',
                            type: 'checkbox',
                        },
                        {
                            name: 'stepMinute',
                            label: 'jqui_stepMinute',
                            type: 'select',
                            options: [
                                { label: '1 minute', value: 1 },
                                { label: '2 minutes', value: 2 },
                                { label: '3 minutes', value: 3 },
                                { label: '4 minutes', value: 4 },
                                { label: '5 minutes', value: 5 },
                                { label: '10 minutes', value: 10 },
                                { label: '15 minutes', value: 15 },
                                { label: '20 minutes', value: 20 },
                                { label: '30 minutes', value: 30 },
                                { label: '60 minutes', value: 60 },
                            ],
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 250,
                height: 56,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiInputDateTime.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <div
            className="vis-widget-body"
            onClick={this.state.rxData.html ? () => this.onClick() : undefined}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={this.props.context.lang}>
                <TimePicker
                    value={this.state.values[`${this.state.rxData.oid}.val`] || ''}
                    ampm={this.state.rxData.ampm || false}
                    minutesStep={parseInt(this.state.rxData.stepMinute, 10) || 1}
                    label={this.state.rxData.widgetTitle || null}
                    formatDensity={this.state.rxData.wideFormat ? 'spacious' : 'dense'}
                    autoFocus={this.state.rxData.autoFocus || false}
                    onChange={newValue => this.props.context.setValue(this.state.rxData.oid, newValue)}
                    slotProps={{
                        textField: {
                            variant: this.state.rxData.variant || 'standard',
                            size: this.state.rxData.small ? 'small' : undefined,
                            style: {
                                width: '100%',
                                height: '100%',
                            },
                            classes: {
                                root: this.props.classes.textRoot,
                            },
                        },
                        field: { clearable: this.state.rxData.clearable, onClear: () => this.props.context.setValue(this.state.rxData.oid, '') },
                    }}
                />
            </LocalizationProvider>
        </div>;
    }
}

JQuiInputDateTime.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default withStyles(styles)(JQuiInputDateTime);
