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
import { extractBinding } from './visUtils';

class VisFormatUtils {
    constructor(props) {
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
    static getObjPropValue(obj, propPath) {
        if (!obj) {
            return undefined;
        }
        const parts = propPath.split('.');
        for (const part of parts) {
            obj = obj[part];
            if (!obj) {
                return undefined;
            }
        }
        return obj;
    }

    getSpecialValues(name, view, wid, widgetData) {
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

    static formatValue(value, decimals, _format) {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals;
        }

        // format = (_format === undefined) ? (this.vis.isFloatComma) ? ".," : ",." : _format;
        // does not work...
        // using default german...
        const format = _format === undefined || _format === null ? '.,' : _format;

        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return Number.isNaN(value) ? '' : value.toFixed(decimals || 0).replace(format[0], format[1]).replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    }

    formatMomentDate(dateObj, _format, useTodayOrYesterday, moment) {
        useTodayOrYesterday = typeof useTodayOrYesterday !== 'undefined' ? useTodayOrYesterday : false;

        if (!dateObj) return '';
        const type = typeof dateObj;
        if (type === 'string') {
            dateObj = moment(dateObj);
        }

        if (type !== 'object') {
            const j = parseInt(dateObj, 10);
            if (j === dateObj) {
                // maybe this is an interval?
                if (j < 946681200) {
                    dateObj = moment(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? moment(j * 1000) : moment(j);
                }
            } else {
                dateObj = moment(dateObj);
            }
        }
        const format = _format || this.vis.dateFormat || 'DD.MM.YYYY';

        let result;

        if (useTodayOrYesterday) {
            if (dateObj.isSame(moment(), 'day')) {
                const todayStr = this.vis._('Today');
                result = moment(dateObj).format(format.replace('dddd', todayStr).replace('ddd', todayStr).replace('dd', todayStr)) || '';
            } if (dateObj.isSame(moment().subtract(1, 'day'), 'day')) {
                const yesterdayStr = this.vis._('Yesterday');
                result = moment(dateObj).format(format.replace('dddd', yesterdayStr).replace('ddd', yesterdayStr).replace('dd', yesterdayStr)) || '';
            }
        } else {
            result = moment(dateObj).format(format) || '';
        }

        return result;
    }

    static _put(ss, dateObj, result) {
        let v = '';

        switch (ss) {
            case 'YYYY':
            case 'JJJJ':
            case 'ГГГГ':
            case 'YY':
            case 'JJ':
            case 'ГГ':
                v = dateObj.getFullYear();
                if (ss.length === 2) {
                    v %= 100;
                }
                break;
            case 'MM':
            case 'M':
            case 'ММ':
            case 'М':
                v = dateObj.getMonth() + 1;
                if ((v < 10) && (ss.length === 2)) {
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
                if (v < 10 && ss.length === 2) {
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
                if (v < 10 && ss.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'mm':
            case 'm':
            case 'мм':
            case 'м':
                v = dateObj.getMinutes();
                if (v < 10 && ss.length === 2) {
                    v = `0${v}`;
                }
                break;
            case 'ss':
            case 's':
            case 'cc':
            case 'c':
                v = dateObj.getSeconds();
                if (v < 10 && ss.length === 2) {
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

    formatDate(dateObj, isDuration, _format) {
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
        const type = typeof dateObj;
        if (type === 'string') {
            dateObj = new Date(dateObj);
        } else if (type !== 'object') {
            const j = parseInt(dateObj, 10);
            if (j === dateObj) {
                // maybe this is an interval
                if (j < 946681200) {
                    isDuration = true;
                    dateObj = new Date(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? new Date(j * 1000) : new Date(j);
                }
            } else {
                dateObj = new Date(dateObj);
            }
        }
        const format = _format || this.vis.dateFormat || 'DD.MM.YYYY';

        isDuration && dateObj.setMilliseconds(dateObj.getMilliseconds() + dateObj.getTimezoneOffset() * 60 * 1000);

        const validFormatChars = 'YJГMМDTДhSчmмsс';
        let s = '';
        let result = '';

        for (let i = 0; i < format.length; i++) {
            if (validFormatChars.includes(format[i])) {
                // combine format character
                s += format[i];
            } else {
                result = VisFormatUtils._put(s, dateObj, result);
                s = '';
                result += format[i];
            }
        }
        result = VisFormatUtils._put(s, dateObj, result);
        return result;
    }

    extractBinding(format) {
        if (!format) {
            return null;
        }
        if (!this.vis.editMode && this.bindingsCache[format]) {
            return JSON.parse(JSON.stringify(this.bindingsCache[format]));
        }

        const result = extractBinding(format);

        // cache bindings
        if (result && this.bindingsCache && !this.vis.editMode) {
            this.bindingsCache[format] = JSON.parse(JSON.stringify(result));
        }

        return result;
    }

    formatBinding(format, view, wid, widget, widgetData, values, moment) {
        values = values || this.vis.states;

        const oids = this.extractBinding(format);

        for (let t = 0; t < oids.length; t++) {
            let value;
            if (oids[t].visOid) {
                value = this.getSpecialValues(oids[t].visOid, view, wid, widgetData);
                if (value === undefined || value === null) {
                    value = values[oids[t].visOid];
                }
            }
            if (oids[t].operations) {
                for (let k = 0; k < oids[t].operations.length; k++) {
                    switch (oids[t].operations[k].op) {
                        case 'eval': {
                            let string = ''; // '(function() {';
                            for (let a = 0; a < oids[t].operations[k].arg.length; a++) {
                                if (!oids[t].operations[k].arg[a].name) {
                                    continue;
                                }
                                value = this.getSpecialValues(oids[t].operations[k].arg[a].visOid, view, wid, widgetData);
                                if (value === undefined || value === null) {
                                    value = values[oids[t].operations[k].arg[a].visOid];
                                }
                                if (value === null) {
                                    string += `const ${oids[t].operations[k].arg[a].name} = null;`;
                                } else if (value === undefined) {
                                    string += `const ${oids[t].operations[k].arg[a].name} = undefined;`;
                                } else {
                                    const type = typeof value;
                                    if (type === 'string') {
                                        try {
                                            value = JSON.parse(value);
                                            // if array or object, we format it correctly, else it should be a string
                                            if (typeof value === 'object') {
                                                string += `const ${oids[t].operations[k].arg[a].name} = JSON.parse("${JSON.stringify(value).replace(/\x22/g, '\\\x22')}");`;
                                            } else {
                                                string += `const ${oids[t].operations[k].arg[a].name} = "${value}";`;
                                            }
                                        } catch (e) {
                                            string += `const ${oids[t].operations[k].arg[a].name} = "${value}";`;
                                        }
                                    } else if (type === 'object') {
                                        string += `const ${oids[t].operations[k].arg[a].name} = ${JSON.stringify(value)};`;
                                    } else {
                                        // boolean, number, ...
                                        string += `const ${oids[t].operations[k].arg[a].name} = ${value.toString()};`;
                                    }
                                }
                            }

                            const { formula } = oids[t].operations[k];
                            if (formula && formula.includes('widget.')) {
                                const w = JSON.parse(JSON.stringify(widget));
                                w.data = widgetData;
                                string += `const widget = ${JSON.stringify(w)};`;
                            }
                            string += `return ${oids[t].operations[k].formula};`;

                            if (string.includes('\\"')) {
                                string = string.replace(/\\"/g, '"');
                            }

                            // string += '}())';
                            try {
                                // eslint-disable-next-line no-new-func
                                value = new Function(string)();
                            } catch (e) {
                                console.error(`Error in eval[value]: ${format}`);
                                console.error(`Error in eval[script]: ${string}`);
                                console.error(`Error in eval[error]: ${e}`);
                                value = 0;
                            }
                            break;
                        }
                        case '*':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) * oids[t].operations[k].arg;
                            }
                            break;
                        case '/':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) / oids[t].operations[k].arg;
                            }
                            break;
                        case '+':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) + oids[t].operations[k].arg;
                            }
                            break;
                        case '-':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) - oids[t].operations[k].arg;
                            }
                            break;
                        case '%':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) % oids[t].operations[k].arg;
                            }
                            break;
                        case 'round':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.round(parseFloat(value));
                            } else {
                                value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                            }
                            break;
                        case 'pow':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) * parseFloat(value);
                            } else {
                                value = parseFloat(value) ** oids[t].operations[k].arg;
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
                            value = VisFormatUtils.formatValue(value, parseInt(oids[t].operations[k].arg, 10));
                            break;
                        case 'array':
                            value = oids[t].operations[k].arg[parseInt(value, 10)];
                            break;
                        case 'date':
                            value = this.formatDate(value, oids[t].operations[k].arg);
                            break;
                        case 'momentDate':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                const params = oids[t].operations[k].arg.split(',');

                                if (params.length === 1) {
                                    value = this.formatMomentDate(value, params[0], false, moment);
                                } else if (params.length === 2) {
                                    value = this.formatMomentDate(value, params[0], params[1], moment);
                                } else {
                                    value = 'error';
                                }
                            }
                            break;
                        case 'min':
                            value = parseFloat(value);
                            value = (value < oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'max':
                            value = parseFloat(value);
                            value = (value > oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'random':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.random();
                            } else {
                                value = Math.random() * oids[t].operations[k].arg;
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
                                } catch (e) {
                                    console.warn(`Cannot parse JSON string: ${value}`);
                                }
                            }
                            if (value && typeof value === 'object') {
                                value = VisFormatUtils.getObjPropValue(value, oids[t].operations[k].arg);
                            }
                            break;
                        default:
                            // unknown condition
                            console.warn(`Unknown operator: ${format}`);
                            break;
                    } // switch
                }
            } // if for
            format = format.replace(oids[t].token, value);
        } // for

        format = format.replace(/{{/g, '{').replace(/}}/g, '}');
        return format;
    }
}

export default VisFormatUtils;
