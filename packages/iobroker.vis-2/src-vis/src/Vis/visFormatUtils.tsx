/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */
import { type Moment } from 'moment';
import { deepClone } from '@/Utils/utils';
import type {
    VisLegacy,
    AnyWidgetId,
    WidgetData,
    Widget,
    VisRxWidgetStateValues,
    VisBinding,
    VisBindingOperationArgument,
} from '@iobroker/types-vis-2';

import { extractBinding } from './visUtils';

interface VisFormatUtilsProps {
    vis: VisLegacy;
}

class VisFormatUtils {
    private readonly vis: VisLegacy;

    private readonly bindingsCache: Record<string, any>;

    constructor(props: VisFormatUtilsProps) {
        this.vis = props.vis;
        this.bindingsCache = {};
        // required options in vis
        //      user
        //      loginRequired
        //      instance
        //      language
        //      dateFormat
        //      _
        //      editMode
        //      states (originally canStates
    }

    // get value of Obj property PropPath. PropPath is string like "Prop1" or "Prop1.Prop2" ...
    private static getObjPropValue(obj: ioBroker.Object, propPath: string): any {
        if (!obj) {
            return undefined;
        }
        const parts = propPath.split('.');
        let _obj = obj as Record<string, any>;
        for (const part of parts) {
            _obj = _obj[part];
            if (!_obj) {
                return undefined;
            }
        }
        return _obj;
    }

    private getSpecialValues(
        name: string,
        view: string,
        wid: AnyWidgetId,
        widgetData: WidgetData,
    ): string | number | undefined | boolean {
        switch (name) {
            case 'username.val':
                return this.vis.user;
            case 'login.val':
                return this.vis.loginRequired;
            case 'instance.val':
                return this.vis.instance;
            case 'language.val':
                return this.vis.language;
            case 'wid.val':
                return wid;
            case 'wname.val':
                return widgetData?.name || wid;
            case 'view.val':
                return view;
            default:
                return undefined;
        }
    }

    static formatValue(value: number | string, decimals?: number | string, _format?: string): string {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals as unknown as string;
        }

        // format = (_format === undefined) ? (this.vis.isFloatComma) ? ".," : ",." : _format;
        // does not work...
        // using default german...
        const format = _format === undefined || _format === null ? '.,' : _format;

        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return Number.isNaN(value)
            ? ''
            : value
                  .toFixed(decimals || 0)
                  .replace(format[0], format[1])
                  .replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    }

    private formatMomentDate(
        dateObj: string | number | Date,
        _format?: string,
        useTodayOrYesterday?: boolean,
        moment?: any,
    ): string {
        useTodayOrYesterday = typeof useTodayOrYesterday !== 'undefined' ? useTodayOrYesterday : false;

        if (!dateObj) {
            return '';
        }
        let momentObject: Moment | undefined;
        const type = typeof dateObj;
        if (type === 'string') {
            momentObject = moment(dateObj);
        } else if (type !== 'object') {
            const j = parseInt(dateObj as string, 10);
            if (j === dateObj) {
                // maybe this is an interval?
                if (j < 946681200) {
                    momentObject = moment(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    momentObject = j < 946681200000 ? moment(j * 1000) : moment(j);
                }
            } else {
                momentObject = moment(dateObj);
            }
        }
        const format = _format || this.vis.dateFormat || 'DD.MM.YYYY';

        let result;

        if (useTodayOrYesterday && momentObject && moment) {
            if (momentObject.isSame(moment(), 'day')) {
                const todayStr = this.vis._('Today');
                result =
                    moment(momentObject).format(
                        format.replace('dddd', todayStr).replace('ddd', todayStr).replace('dd', todayStr),
                    ) || '';
            }
            if (momentObject.isSame(moment().subtract(1, 'day'), 'day')) {
                const yesterdayStr = this.vis._('Yesterday');
                result =
                    moment(momentObject).format(
                        format.replace('dddd', yesterdayStr).replace('ddd', yesterdayStr).replace('dd', yesterdayStr),
                    ) || '';
            }
        } else {
            result = moment(momentObject).format(format) || '';
        }

        return result;
    }

    private static _put(token: string, dateObj: Date, result: string): string {
        let v: string | number = '';

        switch (token) {
            case 'YYYY':
            case 'JJJJ':
            case 'ГГГГ':
            case 'YY':
            case 'JJ':
            case 'ГГ':
                v = dateObj.getFullYear();
                if (token.length === 2) {
                    v %= 100;
                }
                break;
            case 'MM':
            case 'M':
            case 'ММ':
            case 'М':
                v = dateObj.getMonth() + 1;
                if (v < 10 && token.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'DD':
            case 'TT':
            case 'D':
            case 'T':
            case 'ДД':
            case 'Д':
                v = dateObj.getDate();
                if (v < 10 && token.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'hh':
            case 'SS':
            case 'h':
            case 'S':
            case 'чч':
            case 'ч':
                v = dateObj.getHours();
                if (v < 10 && token.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'mm':
            case 'm':
            case 'мм':
            case 'м':
                v = dateObj.getMinutes();
                if (v < 10 && token.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'ss':
            case 's':
            case 'cc':
            case 'c':
                v = dateObj.getSeconds();
                if (v < 10 && token.length === 2) {
                    v = `0${v}`;
                }
                v = v.toString();
                break;
            case 'sss':
            case 'ссс':
                v = dateObj.getMilliseconds();
                if (v < 10) {
                    v = `00${v}`;
                } else if (v < 100) {
                    v = `0${v}`;
                }
                v = v.toString();
                break;
            default:
                break;
        }

        result += v;
        return result;
    }

    formatDate(dateObj: string | Date | number, isDuration?: boolean | string, _format?: string): string {
        // copied from js-controller/lib/adapter.js
        if ((typeof isDuration === 'string' && isDuration.toLowerCase() === 'duration') || isDuration === true) {
            isDuration = true;
        }
        if (typeof isDuration !== 'boolean') {
            _format = isDuration;
            isDuration = false;
        }

        if (!dateObj) {
            return '';
        }
        let realDateObj: Date | undefined;
        const type = typeof dateObj;
        if (type === 'string') {
            realDateObj = new Date(dateObj);
        } else if (type !== 'object') {
            const j = parseInt(dateObj as string, 10);
            if (j === dateObj) {
                // maybe this is an interval
                if (j < 946681200) {
                    isDuration = true;
                    realDateObj = new Date(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    realDateObj = j < 946681200000 ? new Date(j * 1000) : new Date(j);
                }
            } else {
                realDateObj = new Date(dateObj);
            }
        }
        let result = '';
        if (realDateObj) {
            const format = _format || this.vis.dateFormat || 'DD.MM.YYYY';

            isDuration &&
                realDateObj.setMilliseconds(
                    realDateObj.getMilliseconds() + realDateObj.getTimezoneOffset() * 60 * 1000,
                );

            const validFormatChars = 'YJГMМDTДhSчmмsс';
            let s = '';

            for (let i = 0; i < format.length; i++) {
                if (validFormatChars.includes(format[i])) {
                    // combine format character
                    s += format[i];
                } else {
                    result = VisFormatUtils._put(s, realDateObj, result);
                    s = '';
                    result += format[i];
                }
            }
            result = VisFormatUtils._put(s, realDateObj, result);
        }

        return result;
    }

    extractBinding(format: string): VisBinding[] | null {
        if (!format) {
            return null;
        }
        if (!this.vis.editMode && this.bindingsCache[format]) {
            return deepClone(this.bindingsCache[format]);
        }

        const result = extractBinding(format);

        // cache bindings
        if (result && this.bindingsCache && !this.vis.editMode) {
            this.bindingsCache[format] = deepClone(result);
        }

        return result;
    }

    /**
     * Format given binding
     */
    formatBinding(options: {
        format: string;
        view: string;
        wid: AnyWidgetId;
        widget: Widget;
        widgetData: WidgetData;
        values?: VisRxWidgetStateValues;
        moment: any;
    }): string {
        const { view, wid, widget, widgetData, moment } = options;

        let { format } = options;

        const _values = options.values || this.vis.states;

        const oids = this.extractBinding(options.format);

        for (const oid of oids) {
            let value: any;
            if (oid.visOid) {
                value = this.getSpecialValues(oid.visOid, view, wid, widgetData);
                if (value === undefined || value === null) {
                    value = (_values as Record<string, any>)[oid.visOid];
                }
            }

            if (oid.operations) {
                for (const operation of oid.operations) {
                    if (operation.op === 'eval') {
                        let string = ''; // '(function() {';
                        const evalArgs: VisBindingOperationArgument[] = operation.arg as VisBindingOperationArgument[];
                        for (let a = 0; a < evalArgs.length; a++) {
                            if (!evalArgs[a].name) {
                                continue;
                            }
                            value = this.getSpecialValues(evalArgs[a].visOid, view, wid, widgetData);

                            if (value === undefined || value === null) {
                                value = evalArgs[a].visOid.startsWith('widgetOid.')
                                    ? (_values as Record<string, any>)[
                                          evalArgs[a].visOid.replace(/^widgetOid\./g, `${widget.data.oid}.`)
                                      ]
                                    : (_values as Record<string, any>)[evalArgs[a].visOid];
                            }
                            if (value === null) {
                                string += `const ${evalArgs[a].name} = null;`;
                            } else if (value === undefined) {
                                string += `const ${evalArgs[a].name} = undefined;`;
                            } else {
                                const type = typeof value;
                                if (type === 'string') {
                                    try {
                                        value = JSON.parse(value);
                                        // if array or object, we format it correctly, else it should be a string
                                        if (typeof value === 'object') {
                                            string += `const ${evalArgs[a].name} = JSON.parse("${JSON.stringify(value).replace(/\x22/g, '\\\x22')}");`;
                                        } else {
                                            string += `const ${evalArgs[a].name} = "${value}";`;
                                        }
                                    } catch {
                                        string += `const ${evalArgs[a].name} = "${value}";`;
                                    }
                                } else if (type === 'object') {
                                    string += `const ${evalArgs[a].name} = ${JSON.stringify(value)};`;
                                } else {
                                    // boolean, number, ...
                                    string += `const ${evalArgs[a].name} = ${value.toString()};`;
                                }
                            }
                        }

                        const { formula } = operation;
                        if (formula && formula.includes('widget.')) {
                            const w = deepClone(widget);
                            w.data = widgetData;
                            string += `const widget = ${JSON.stringify(w)};`;
                        }
                        string += `return ${operation.formula};`;

                        if (string.includes('\\"')) {
                            string = string.replace(/\\"/g, '"');
                        }

                        // string += '}())';
                        try {
                            // eslint-disable-next-line no-new-func
                            value = new Function(string)();

                            if (value && typeof value === 'object') {
                                value = JSON.stringify(value);
                            }
                        } catch (e) {
                            console.error(`Error in eval[value]: ${format}`);
                            console.error(`Error in eval[script]: ${string}`);
                            console.error(`Error in eval[error]: ${e}`);
                            value = 0;
                        }
                    } else {
                        const operationArg: string | number | undefined | null | string[] = operation.arg as
                            | string
                            | number
                            | undefined
                            | null
                            | string[];

                        switch (operation.op) {
                            case '*':
                                if (operationArg !== undefined && operationArg !== null) {
                                    value = parseFloat(value) * (operationArg as number);
                                }
                                break;

                            case '/':
                                if (operationArg !== undefined && operationArg !== null) {
                                    value = parseFloat(value) / (operationArg as number);
                                }
                                break;
                            case '+':
                                if (operationArg !== undefined && operationArg !== null) {
                                    value = parseFloat(value) + (operationArg as number);
                                }
                                break;
                            case '-':
                                if (operationArg !== undefined && operationArg !== null) {
                                    value = parseFloat(value) - (operationArg as number);
                                }
                                break;
                            case '%':
                                if (operationArg !== undefined && operationArg !== null) {
                                    value = parseFloat(value) % (operationArg as number);
                                }
                                break;
                            case 'round':
                                if (operationArg === undefined) {
                                    value = Math.round(parseFloat(value));
                                } else {
                                    value = parseFloat(value).toFixed(operationArg as number);
                                }
                                break;
                            case 'pow':
                                if (operationArg === undefined) {
                                    value = parseFloat(value) * parseFloat(value);
                                } else {
                                    value = parseFloat(value) ** (operationArg as number);
                                }
                                break;
                            case 'sqrt':
                                value = Math.sqrt(parseFloat(value));
                                break;
                            case 'hex':
                                value = Math.round(parseFloat(value)).toString(16);
                                break;
                            case 'hex2':
                                value = Math.round(parseFloat(value)).toString(16);
                                if (value.length < 2) {
                                    value = `0${value}`;
                                }
                                break;
                            case 'HEX':
                                value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                                break;
                            case 'HEX2':
                                value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                                if (value.length < 2) {
                                    value = `0${value}`;
                                }
                                break;
                            case 'value':
                                value = VisFormatUtils.formatValue(value, parseInt(operationArg as string, 10));
                                break;
                            case 'array':
                                value = (operationArg as string[])[parseInt(value, 10)];
                                break;
                            case 'date':
                                value = this.formatDate(value, operationArg as string);
                                break;
                            case 'momentDate':
                                if (
                                    operationArg !== undefined &&
                                    operationArg !== null &&
                                    typeof operationArg === 'string'
                                ) {
                                    const params = operationArg.split(',');

                                    if (params.length === 1) {
                                        value = this.formatMomentDate(value, params[0], false, moment);
                                    } else if (params.length === 2) {
                                        value = this.formatMomentDate(value, params[0], !!params[1], moment);
                                    } else {
                                        value = 'error';
                                    }
                                }
                                break;
                            case 'min':
                                value = parseFloat(value);
                                value = value < operationArg ? operationArg : value;
                                break;
                            case 'max':
                                value = parseFloat(value);
                                value = value > operationArg ? operationArg : value;
                                break;
                            case 'random':
                                if (operationArg === undefined) {
                                    value = Math.random();
                                } else {
                                    value = Math.random() * (operationArg as number);
                                }
                                break;
                            case 'floor':
                                value = Math.floor(parseFloat(value));
                                break;
                            case 'ceil':
                                value = Math.ceil(parseFloat(value));
                                break;
                            case 'json':
                                if (value && typeof value === 'string') {
                                    try {
                                        value = JSON.parse(value);
                                    } catch {
                                        console.warn(`Cannot parse JSON string: ${value}`);
                                    }
                                }
                                if (value && typeof value === 'object') {
                                    value = VisFormatUtils.getObjPropValue(value, operationArg as string);
                                }
                                break;
                            default:
                                // unknown condition
                                console.warn(`Unknown operator: ${format}`);
                                break;
                        } // switch
                    }
                }
            } // if for
            format = format.replace(oid.token, value);
        } // for

        format = format.replace(/{{/g, '{').replace(/}}/g, '}');

        return format;
    }
}

export default VisFormatUtils;
