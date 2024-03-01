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
import { withStyles } from '@mui/styles';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
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

import type { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import type { TextFieldVariants } from '@mui/material';
import dayjs from 'dayjs';
import VisRxWidget from '../../visRxWidget';

const styles = {
    textRoot: {
        '& .MuiInputBase-root': {
            width: '100%',
            height: '100%',
        },
    },
};

type RxData = GetRxDataFromWidget<typeof JQuiInputDate>

class JQuiInputDate extends VisRxWidget<RxData> {
    /** If user does not want to use full date */
    private readonly EASY_DATE_FORMAT = 'DD.MM.YYYY';

    static getWidgetInfo() {
        return {
            id: 'tplJquiInputDate',
            visSet: 'jqui',
            visName: 'Input Date',
            visWidgetLabel: 'jqui_input_date',
            visPrev: 'widgets/jqui/img/Prev_InputDate.png',
            visOrder: 30,
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
                            name: 'disableFuture',
                            label: 'jqui_disableFuture',
                            type: 'checkbox',
                            hidden: '!!data.disablePast',
                        },
                        {
                            name: 'disablePast',
                            label: 'jqui_disablePast',
                            type: 'checkbox',
                            hidden: '!!data.disableFuture',
                        },
                        {
                            name: 'asFullDate',
                            label: 'jqui_asFullDate',
                            type: 'checkbox',
                        },
                        {
                            name: 'displayWeekNumber',
                            label: 'jqui_displayWeekNumber',
                            type: 'checkbox',
                        },
                        {
                            name: 'wideFormat',
                            label: 'jqui_wideFormat',
                            type: 'checkbox',
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 250,
                height: 56,
            },
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiInputDate.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps) {
        super.renderWidgetBody(props);

        return <div
            className="vis-widget-body"
        >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={this.props.context.lang}>
                <DatePicker
                    value={this.state.rxData.asFullDate ? dayjs(this.state.values[`${this.state.rxData.oid}.val`]) || '' : dayjs(this.state.values[`${this.state.rxData.oid}.val`], this.EASY_DATE_FORMAT)}
                    label={this.state.rxData.widgetTitle || null}
                    autoFocus={this.state.rxData.autoFocus || false}
                    onChange={newValue => {
                        if (!newValue) {
                            return;
                        }

                        const val = this.state.rxData.asFullDate ? newValue.toDate() : newValue.format(this.EASY_DATE_FORMAT);
                        this.props.context.setValue(this.state.rxData.oid, val);
                    }}
                    formatDensity={this.state.rxData.wideFormat ? 'spacious' : 'dense'}
                    slotProps={{
                        textField: {
                            variant: this.state.rxData.variant as TextFieldVariants || 'standard',
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
                    disableFuture={this.state.rxData.disableFuture || false}
                    disablePast={this.state.rxData.disablePast || false}
                    displayWeekNumber={this.state.rxData.displayWeekNumber || false}
                />
            </LocalizationProvider>
        </div>;
    }
}

export default withStyles(styles)(JQuiInputDate);
