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
import { I18n } from '@iobroker/adapter-react-v5';
import { deepClone } from '@/Utils/utils';
import { store, updateWidget } from '../Store';

function replaceGroupAttr(inputStr, groupAttrList) {
    let newString = inputStr;
    let match = false;
    // old style: groupAttr0, groupAttr1, groupAttr2, ...
    let ms = inputStr.match(/(groupAttr\d+)+?/g);
    if (ms) {
        match = true;
        ms.forEach(m => {
            const val = groupAttrList[m];
            if (val === null || val === undefined) {
                newString = newString.replace(/groupAttr(\d+)/, '');
            } else {
                newString = newString.replace(/groupAttr(\d+)/, groupAttrList[m]);
            }
        });
    }

    // new style: %html%, %myAttr%, ...
    ms = inputStr.match(/%([-_a-zA-Z\d]+)+?%/g);
    if (ms) {
        match = true;
        ms.forEach(m => {
            const attr = m.substring(1, m.length - 1);
            const val = groupAttrList[attr];
            if (val === null || val === undefined) {
                newString = newString.replace(m, '');
            } else {
                newString = newString.replace(m, val);
            }
        });
    }

    return { doesMatch: match, newString };
}

function getWidgetGroup(views, view, widget) {
    const widgets = views[view].widgets;
    if (widgets[widget]?.groupid && widgets[widgets[widget].groupid]) {
        return views[view].widgets[widget].groupid;
    }

    return Object.keys(widgets).find(w => widgets[w].data?.members?.includes(widget));
}

/**
 * Determine if the string is of form identifier:ioBrokerId, like, val:hm-rpc.0.device.channel.state
 *
 * @param {string} assignment the possible assignment to check
 * @return {boolean}
 */
function isIdBinding(assignment) {
    return !!assignment.match(/^[\d\w_]+:\s?[-.\d\w_#]+$/);
}

function extractBinding(format) {
    const oid = format.match(/{(.+?)}/g);
    let result = null;

    if (oid) {
        if (oid.length > 50) {
            console.warn(`Too many bindings in one widget: ${oid.length}[max = 50]`);
        }

        for (let p = 0; p < oid.length && p < 50; p++) {
            const _oid = oid[p].substring(1, oid[p].length - 1);
            if (_oid[0] === '{') {
                continue;
            }
            // If the first symbol is '"' => it is JSON
            if (_oid && _oid[0] === '"') {
                continue;
            }
            const parts = _oid.split(';');
            result = result || [];
            let systemOid = parts[0].trim();
            let visOid = systemOid;

            let test1 = visOid.substring(visOid.length - 4).trim();
            let test2 = visOid.substring(visOid.length - 3).trim();

            if (visOid && test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                visOid += '.val';
            }

            const isSeconds = test2 === '.ts' || test2 === '.lc';

            test1 = systemOid.substring(systemOid.length - 4);
            test2 = systemOid.substring(systemOid.length - 3);

            if (test1 === '.val' || test1 === '.ack') {
                systemOid = systemOid.substring(0, systemOid.length - 4);
            } else if (test2 === '.lc' || test2 === '.ts') {
                systemOid = systemOid.substring(0, systemOid.length - 3);
            }
            let operations = null;
            const isEval = visOid.match(/^[\d\w_]+:\s?[-._/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+$/u) || (!visOid.length && parts.length > 0); // (visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);

            if (isEval) {
                const xx = visOid.split(':', 2);
                const yy = systemOid.split(':', 2);
                visOid = xx[1].trim();
                systemOid = yy[1].trim();
                operations = [];
                operations.push({
                    op: 'eval',
                    arg: [{
                        name: xx[0],
                        visOid,
                        systemOid,
                    }],
                });
            }

            for (let u = 1; u < parts.length; u++) {
                // eval construction
                if (isEval) {
                    const trimmed = parts[u].trim();
                    if (isIdBinding(trimmed)) { // parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
                        const argParts = trimmed.split(':', 2);
                        let _visOid = argParts[1].trim();
                        let _systemOid = _visOid;

                        test1 = _visOid.substring(_visOid.length - 4);
                        test2 = _visOid.substring(_visOid.length - 3);

                        if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                            _visOid += '.val';
                        }

                        test1 = _systemOid.substring(_systemOid.length - 4);

                        if (test1 === '.val' || test1 === '.ack') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                        } else {
                            test2 = _systemOid.substring(_systemOid.length - 3);
                            if (test2 === '.lc' || test2 === '.ts') {
                                _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                            }
                        }

                        operations[0].arg.push({
                            name: argParts[0].trim(),
                            visOid: _visOid,
                            systemOid: _systemOid,
                        });
                    } else {
                        parts[u] = parts[u].replace(/::/g, ':');
                        if (operations[0].formula) {
                            const n = deepClone(operations[0]);
                            n.formula = parts[u];
                            operations.push(n);
                        } else {
                            operations[0].formula = parts[u];
                        }
                    }
                } else {
                    const parse = parts[u].match(/([\w\s/+*-]+)(\(.+\))?/);
                    if (parse && parse[1]) {
                        parse[1] = parse[1].trim();
                        // operators requires parameter
                        if (parse[1] === '*' ||
                            parse[1] === '+' ||
                            parse[1] === '-' ||
                            parse[1] === '/' ||
                            parse[1] === '%' ||
                            parse[1] === 'min' ||
                            parse[1] === 'max'
                        ) {
                            if (parse[2] === undefined) {
                                console.log(`Invalid format of format string: ${format}`);
                                parse[2] = null;
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({ op: parse[1], arg: parse[2] });
                                }
                            }
                        } else if (parse[1] === 'date' || parse[1] === 'momentDate') {
                            // date formatting
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({ op: parse[1], arg: parse[2] });
                        } else if (parse[1] === 'array') {
                            // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                            operations = operations || [];
                            let param = (parse[2] || '').trim();
                            param = param.substring(1, param.length - 1);
                            param = param.split(',');
                            if (Array.isArray(param)) {
                                operations.push({ op: parse[1], arg: param }); // xxx
                            }
                        } else if (parse[1] === 'value') {
                            // value formatting
                            operations = operations || [];
                            let param = (parse[2] === undefined) ? '(2)' : (parse[2] || '');
                            param = param.trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op: parse[1], arg: param });
                        } else if (parse[1] === 'pow' || parse[1] === 'round' || parse[1] === 'random') {
                            // operators have optional parameter
                            if (parse[2] === undefined) {
                                operations = operations || [];
                                operations.push({ op: parse[1] });
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({ op: parse[1], arg: parse[2] });
                                }
                            }
                        } else if (parse[1] === 'json') {
                            // json(objPropPath)  ex: json(prop1);  json(prop1.propA)
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({ op: parse[1], arg: parse[2] });
                        } else {
                            // operators without parameter
                            operations = operations || [];
                            operations.push({ op: parse[1] });
                        }
                    } else {
                        console.log(`Invalid format ${format}`);
                    }
                }
            }

            result.push({
                visOid,
                systemOid,
                token: oid[p],
                operations: operations || undefined,
                format,
                isSeconds,
            });
        }
    }

    return result;
}

// outputs: {
//    IDs: [],       //
//    bindings: {},  //
//    views: {},     //
//    visibility: {} //
//    signals: {}    //
// }
function getUsedObjectIDsInWidget(views, view, wid, linkContext) {
    // Check all attributes
    const widget = deepClone(views[view].widgets[wid]);

    // fix error in naming
    if (widget.groupped) {
        widget.grouped = true;
        delete widget.groupped;
    }

    // rename hqWidgets => hqwidgets
    if (widget.widgetSet === 'hqWidgets') {
        widget.widgetSet = 'hqwidgets';
    }

    // rename RGraph => rgraph
    if (widget.widgetSet === 'RGraph') {
        widget.widgetSet = 'rgraph';
    }

    // rename timeAndWeather => timeandweather
    if (widget.widgetSet === 'timeAndWeather') {
        widget.widgetSet = 'timeandweather';
    }

    // convert "Show on Value" to HTML
    if (widget.tpl === 'tplShowValue') {
        widget.tpl = 'tplHtml';
        widget.data['visibility-oid'] = widget.data.oid;
        widget.data['visibility-val'] = widget.data.value;
        delete widget.data.oid;
        delete widget.data.value;
    }

    // convert "Hide on >0/True" to HTML
    if (widget.tpl === 'tplHideTrue') {
        widget.tpl = 'tplHtml';
        widget.data['visibility-cond'] = '!=';
        widget.data['visibility-oid'] = widget.data.oid;
        widget.data['visibility-val'] = true;
        delete widget.data.oid;
    }

    // convert "Hide on 0/False" to HTML
    if (widget.tpl === 'tplHide') {
        widget.tpl = 'tplHtml';
        widget.data['visibility-cond'] = '!=';
        widget.data['visibility-oid'] = widget.data.oid;
        widget.data['visibility-val'] = false;
        delete widget.data.oid;
    }

    // convert "Door/Window sensor" to HTML
    if (widget.tpl === 'tplHmWindow') {
        widget.tpl = 'tplValueBool';
        widget.data.html_false = widget.data.html_closed;
        widget.data.html_true = widget.data.html_open;
        delete widget.data.html_closed;
        delete widget.data.html_open;
    }

    // convert "Door/Window sensor" to HTML
    if (widget.tpl === 'tplHmWindowRotary') {
        widget.tpl = 'tplValueListHtml8';
        widget.data.count = 2;
        widget.data.value0 = widget.data.html_closed;
        widget.data.value1 = widget.data.html_open;
        widget.data.value2 = widget.data.html_tilt;
        delete widget.data.html_closed;
        delete widget.data.html_open;
        delete widget.data.html_tilt;
    }

    // convert "tplBulbOnOff" to tplBulbOnOffCtrl
    if (widget.tpl === 'tplBulbOnOff') {
        widget.tpl = 'tplBulbOnOffCtrl';
        widget.data.readOnly = true;
    }

    // convert "tplValueFloatBarVertical" to tplValueFloatBar
    if (widget.tpl === 'tplValueFloatBarVertical') {
        widget.tpl = 'tplValueFloatBar';
        widget.data.orientation = 'vertical';
    }

    let { data } = widget;
    const { style } = widget;

    // if widget is in the group => replace groupAttrX values
    if (widget.grouped) {
        if (!widget.groupid) {
            store.dispatch(updateWidget({ viewId: view, widgetId: widget, data: { ...widget, groupid: getWidgetGroup(views, view, wid) } }));
        }

        if (!store.getState().visProject[view].widgets[widget.groupid]) {
            store.dispatch(updateWidget({ viewId: view, widgetId: widget, data: { ...widget, groupid: getWidgetGroup(views, view, wid) } }));
            if (!widget.groupid) {
                // create a fictive group
                let groupNum = 1;
                let gId = `g${groupNum.toString().padStart(5, '0')}`;
                while (views[view].widgets[gId]) {
                    groupNum++;
                    gId = `g${groupNum.toString().padStart(5, '0')}`;
                }
                views[view].widgets[gId] = {
                    tpl: '_tplGroup',
                    data: {
                        members: [wid],
                    },
                    style: {
                        top: '100px',
                        left: '100px',
                        width: '200px',
                        height: '200px',
                    },
                    widgetSet: null,
                };
            }
        }

        const parentWidgetData = views[view].widgets[widget.groupid]?.data;
        if (parentWidgetData) {
            let newGroupData;

            Object.keys(data).forEach(attr => {
                if (typeof data[attr] === 'string') {
                    const result = replaceGroupAttr(data[attr], parentWidgetData);
                    if (result.doesMatch) {
                        newGroupData = newGroupData || deepClone(data);
                        newGroupData[attr] = result.newString || '';
                    }
                }
            });
            if (newGroupData) {
                data = newGroupData;
            }
        } else {
            console.error(`Invalid group id "${widget.groupid}" in widget "${wid}"`);
        }
    }

    Object.keys(data || {}).forEach(attr => {
        if (!attr) {
            return;
        }

        if (typeof data[attr] === 'string') {
            let m;
            // Process bindings in data attributes
            const OIDs = extractBinding(data[attr]);

            if (OIDs) {
                OIDs.forEach(item => {
                    const systemOid = item.systemOid;
                    if (systemOid) {
                        // Save id for subscribing
                        !linkContext.IDs.includes(systemOid) && linkContext.IDs.push(systemOid);

                        if (linkContext.byViews && !linkContext.byViews[view].includes(systemOid)) {
                            linkContext.byViews[view].push(systemOid);
                        }

                        linkContext.bindings[systemOid] = linkContext.bindings[systemOid] || [];
                        item.type = 'data';
                        item.attr = attr;
                        item.view = view;
                        item.widget = wid;

                        linkContext.bindings[systemOid].push(item);
                    }

                    if (item.operations && Array.isArray(item.operations[0].arg)) {
                        for (let ww = 0; ww < item.operations[0].arg.length; ww++) {
                            const _systemOid = item.operations[0].arg[ww].systemOid;
                            if (!_systemOid) {
                                continue;
                            }

                            !linkContext.IDs.includes(_systemOid) && linkContext.IDs.push(_systemOid);

                            if (linkContext.byViews && linkContext.byViews[view].includes(_systemOid)) {
                                linkContext.byViews[view].push(_systemOid);
                            }

                            linkContext.bindings[_systemOid] = linkContext.bindings[_systemOid] || [];
                            if (!linkContext.bindings[_systemOid].includes(item)) {
                                linkContext.bindings[_systemOid].push(item);
                            }
                        }
                    }
                });
            } else if (attr !== 'oidTrueValue' && attr !== 'oidFalseValue' && data[attr] && data[attr] !== 'nothing_selected') {
                let isID = attr.match(/oid\d{0,2}$/);
                if (attr.startsWith('oid')) {
                    isID = true;
                } else if (attr.startsWith('signals-oid-')) {
                    isID = true;
                } else if (linkContext.widgetAttrInfo) {
                    const _attr = attr.replace(/\d{0,2}$/, '');
                    if (linkContext.widgetAttrInfo[_attr]?.type === 'id' && linkContext.widgetAttrInfo[_attr].noSubscribe !== true) {
                        isID = true;
                    }
                }

                if (isID) {
                    if (!data[attr].startsWith('"')) {
                        if (!linkContext.IDs.includes(data[attr])) {
                            linkContext.IDs.push(data[attr]);
                        }
                        if (linkContext.byViews && !linkContext.byViews[view].includes(data[attr])) {
                            linkContext.byViews[view].push(data[attr]);
                        }
                    }

                    // Visibility binding
                    if (attr === 'visibility-oid') {
                        let vid = data['visibility-oid'];

                        if (widget.grouped) {
                            const vGroup = getWidgetGroup(views, view, wid);
                            if (vGroup) {
                                if (views[view].widgets[vGroup]) {
                                    const result1 = replaceGroupAttr(vid, views[view].widgets[vGroup].data);
                                    if (result1.doesMatch) {
                                        vid = result1.newString;
                                    }
                                } else {
                                    console.warn(`Invalid group: ${vGroup} in ${view} / ${wid}`);
                                }
                            }
                        }

                        linkContext.visibility[vid] = linkContext.visibility[vid] || [];
                        linkContext.visibility[vid].push({ view, widget: wid });
                    } else if (attr.startsWith('signals-oid-')) {
                        // Signal binding
                        let sid = data[attr];
                        if (widget.grouped) {
                            const group = getWidgetGroup(views, view, wid);
                            if (group) {
                                const result2 = replaceGroupAttr(sid, views[view].widgets[group].data);
                                if (result2.doesMatch) {
                                    sid = result2.newString;
                                }
                            }
                        }

                        linkContext.signals[sid] = linkContext.signals[sid] || [];

                        linkContext.signals[sid].push({
                            view,
                            widget: wid,
                            index: parseInt(attr.substring(12), 10), // 'signals-oid-'.length = 12
                        });
                    } else if (attr === 'lc-oid') {
                        let lcSid = data[attr];

                        if (widget.grouped) {
                            const gGroup = getWidgetGroup(views, view, wid);
                            if (gGroup) {
                                const result3 = replaceGroupAttr(lcSid, views[view].widgets[gGroup].data);
                                if (result3.doesMatch) {
                                    lcSid = result3.newString;
                                }
                            }
                        }

                        linkContext.lastChanges[lcSid] = linkContext.lastChanges[lcSid] || [];
                        linkContext.lastChanges[lcSid].push({ view, widget: wid });
                    }
                } else if (data[attr] === 'id') {
                    m = attr.match(/^attrType(\d+)$/);
                    if (m) {
                        const _id = `groupAttr${m[1]}`;
                        if (data[_id]) {
                            if (!linkContext.IDs.includes(data[_id])) {
                                linkContext.IDs.push(data[_id]);
                            }
                            if (linkContext.byViews && !linkContext.byViews[view].includes(data[_id])) {
                                linkContext.byViews[view].push(data[_id]);
                            }
                        }
                    }
                }
            }
        }
    });

    // build bindings for styles
    if (style) {
        Object.keys(style).forEach(cssAttr => {
            if (cssAttr && typeof style[cssAttr] === 'string') {
                const OIDs = extractBinding(style[cssAttr]);
                if (OIDs) {
                    OIDs.forEach(item => {
                        const systemOid = item.systemOid;
                        if (systemOid) {
                            !linkContext.IDs.includes(systemOid) && linkContext.IDs.push(systemOid);
                            if (linkContext.byViews && linkContext.byViews[view].includes(systemOid)) {
                                linkContext.byViews[view].push(systemOid);
                            }

                            linkContext.bindings[systemOid] = linkContext.bindings[systemOid] || [];

                            item.type = 'style';
                            item.attr = cssAttr;
                            item.view = view;
                            item.widget = wid;

                            linkContext.bindings[systemOid].push(item);
                        }

                        if (item.operations && Array.isArray(item.operations[0].arg)) {
                            for (let w = 0; w < item.operations[0].arg.length; w++) {
                                const _systemOid = item.operations[0].arg[w].systemOid;
                                if (!_systemOid) {
                                    continue;
                                }

                                !linkContext.IDs.includes(_systemOid) && linkContext.IDs.push(_systemOid);

                                if (linkContext.byViews && !linkContext.byViews[view].includes(_systemOid)) {
                                    linkContext.byViews[view].push(_systemOid);
                                }
                                linkContext.bindings[_systemOid] = linkContext.bindings[_systemOid] || [];
                                if (!linkContext.bindings[_systemOid].includes) {
                                    linkContext.bindings[_systemOid].push(item);
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    // as we are fixing the widget in this method, write it back to store
    store.dispatch(updateWidget({ viewId: view, widgetId: wid, data: widget }));
}

function getUsedObjectIDs(views, isByViews) {
    if (!views) {
        console.log('Check why views are not yet loaded!');
        return null;
    }

    const linkContext = {
        IDs: [],
        visibility: {},
        bindings: {},
        lastChanges: {},
        signals: {},
    };

    if (isByViews) {
        linkContext.byViews = {};
    }

    Object.keys(views).forEach(view => {
        if (view === '___settings') {
            return;
        }

        if (linkContext.byViews) {
            linkContext.byViews[view] = [];
        }

        Object.keys(views[view].widgets).forEach(wid => getUsedObjectIDsInWidget(views, view, wid, linkContext));
    });

    if (isByViews) {
        let changed;
        do {
            changed = false;
            // Check containers
            // eslint-disable-next-line no-loop-func
            Object.keys(views).forEach(view => {
                if (view === '___settings') {
                    return;
                }

                Object.values(views[view].widgets).forEach(widget => {
                    // Add all OIDs from this view to parent
                    if (widget.tpl === 'tplContainerView' && widget.data.contains_view) {
                        const ids = linkContext.byViews[widget.data.contains_view];
                        if (ids) {
                            for (const id of ids) {
                                if (id && !linkContext.byViews[view].includes(id)) {
                                    linkContext.byViews[view].push(id);
                                    changed = true;
                                }
                            }
                        } else {
                            console.warn(`View does not exist: "${widget.data.contains_view}"`);
                        }
                    }
                });
            });
        } while (changed);
    }

    return linkContext;
}

function getUrlParameter(attr) {
    const sURLVariables = window.location.search.substring(1).split('&');

    for (let i = 0; i < sURLVariables.length; i++) {
        const sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === attr) {
            return typeof sParameterName[1] === 'undefined' ? true : decodeURIComponent(sParameterName[1]);
        }
    }

    return '';
}

function readFile(socket, id, fileName, withType) {
    return socket.readFile(id, fileName)
        .then(file => {
            let mimeType = '';
            if (typeof file === 'object') {
                if (withType) {
                    if (file.mimeType) {
                        mimeType = file.mimeType;
                    } else if (file.type) {
                        mimeType = file.type;
                    }
                }

                if (file.file) {
                    file = file.file; // adapter-react-v5@4.x delivers file.file
                } else if (file.data) {
                    file = file.data; // LegacyConnection delivers file.data
                }
            }
            if (withType) {
                return { file, mimeType };
            }
            return file;
        });
}

const getOrLoadRemote = (remote, shareScope, remoteFallbackUrl = undefined) => {
    window[`_promise_${remote}`] = window[`_promise_${remote}`] || new Promise((resolve, reject) => {
        // check if remote exists on window
        // search dom to see if remote tag exists, but might still be loading (async)
        const existingRemote = document.querySelector(`[data-webpack="${remote}"]`);
        // when remote is loaded...
        const onload = async () => {
            // check if it was initialized
            if (!window[remote]) {
                if (remoteFallbackUrl.startsWith('http://') || remoteFallbackUrl.startsWith('https://')) {
                    console.error(`Cannot load remote from url "${remoteFallbackUrl}"`);
                } else {
                    reject(new Error(`Cannot load ${remote} from ${remoteFallbackUrl}`));
                }
                resolve();
                return;
            }
            if (!window[remote].__initialized) {
                // if share scope doesn't exist (like in webpack 4) then expect shareScope to be a manual object
                // eslint-disable-next-line camelcase
                if (typeof __webpack_share_scopes__ === 'undefined') {
                    // use the default share scope object, passed in manually
                    await window[remote].init(shareScope.default);
                } else if (window[remote].init) {
                    // otherwise, init share scope as usual

                    try {
                        // eslint-disable-next-line camelcase,no-undef
                        await window[remote].init(__webpack_share_scopes__[shareScope]);
                    } catch (e) {
                        console.error(`Cannot init remote "${remote}" with "${shareScope}"`);
                        console.error(e);
                        reject(new Error(`Cannot init remote "${remote}" with "${shareScope}"`));
                        reject(e);
                        return;
                    }
                } else {
                    reject(new Error(`Remote init function not found for ${remote} from ${remoteFallbackUrl}`));
                    return;
                }
                // mark remote as initialized
                window[remote].__initialized = true;
            }
            // resolve promise so marking remote as loaded
            resolve();
        };
        if (existingRemote) {
            console.warn(`SOMEONE IS LOADING THE REMOTE ${remote}`);
            // if existing remote but not loaded, hook into its onload and wait for it to be ready
            // existingRemote.onload = onload;
            // existingRemote.onerror = reject;
            resolve();
            // check if remote fallback exists as param passed to function
            // TODO: should scan public config for a matching key if no override exists
        } else if (remoteFallbackUrl) {
            // inject remote if a fallback exists and call the same onload function
            const d = document;
            const script = d.createElement('script');
            script.type = 'text/javascript';
            // mark as data-webpack so runtime can track it internally
            script.setAttribute('data-webpack', `${remote}`);
            script.async = true;
            script.onerror = () => {
                if (!remoteFallbackUrl.includes('iobroker.net')) {
                    reject(new Error(`Cannot load ${remote} from ${remoteFallbackUrl}`));
                } else {
                    resolve();
                }
            };
            script.onload = onload;
            script.src = remoteFallbackUrl;
            d.getElementsByTagName('head')[0].appendChild(script);
        } else {
            // no remote and no fallback exist, reject
            reject(new Error(`Cannot Find Remote ${remote} to inject`));
        }
    });

    return window[`_promise_${remote}`];
};

export const loadComponent = (remote, sharedScope, module, url) =>
    () => getOrLoadRemote(remote, sharedScope, url)
        .then(() => window[remote] && window[remote].get(module))
        .then(factory => factory && factory());

function registerWidgetsLoadIndicator(cb) {
    window.__widgetsLoadIndicator = cb;
}

function _loadComponentHelper(context) {
    // expected in context
    // visWidgetsCollection
    // countRef
    // dynamicWidgetInstance
    // i18nPrefix
    // result
    const promises = [];

    for (const componentKey in context.visWidgetsCollection.components) {
        ((_componentKey, _visWidgetsCollection) => {
            // const start = Date.now();
            const promise = loadComponent(_visWidgetsCollection.name, 'default', `./${_visWidgetsCollection.components[_componentKey]}`, _visWidgetsCollection.url)()
                .then(Component => {
                    context.countRef.count++;

                    if (Component.default) {
                        Component.default.adapter = context.dynamicWidgetInstance._id.substring('system.adapter.'.length).replace(/\.\d*$/, '');
                        Component.default.version = context.dynamicWidgetInstance.common.version;
                        Component.default.url = _visWidgetsCollection.url;
                        if (context.i18nPrefix) {
                            Component.default.i18nPrefix = context.i18nPrefix;
                        }
                        context.result.push(Component.default);
                    } else {
                        console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}. No default found`);
                    }
                    window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(context.countRef.count, context.promises.length);
                })
                .catch(e => {
                    console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}: ${e.toString()}`);
                    console.error(`Cannot load widget ${context.dynamicWidgetInstance._id}: ${JSON.stringify(e)}`);
                });

            promises.push(promise);
        })(componentKey, context.visWidgetsCollection);
    }

    return Promise.all(promises);
}

function getRemoteWidgets(socket, onlyWidgetSets) {
    return socket.getObjectViewSystem(
        'instance',
        'system.adapter.',
        'system.adapter.\u9999',
    )
        .then(objects => {
            const result = [];
            const countRef = { count: 0 };
            const instances = Object.values(objects);
            const dynamicWidgetInstances = instances.filter(obj =>
                obj.common.visWidgets &&
                !obj.common.visWidgets.ignoreInVersions?.includes(2) &&
                (!onlyWidgetSets || onlyWidgetSets.includes(obj.common.name)));

            const promises = [];
            for (let i = 0; i < dynamicWidgetInstances.length; i++) {
                const dynamicWidgetInstance = dynamicWidgetInstances[i];
                for (const widgetSetName in dynamicWidgetInstance.common.visWidgets) {
                    if (widgetSetName === 'i18n') {
                        // ignore
                        // find first widget set that is not i18n
                        const _widgetSetName = Object.keys(dynamicWidgetInstance.common.visWidgets).find(name => name !== 'i18n');
                        console.warn(`common.visWidgets.i18n is deprecated. Use common.visWidgets.${_widgetSetName}.i18n instead.`);
                    } else {
                        const visWidgetsCollection = dynamicWidgetInstance.common.visWidgets[widgetSetName];
                        if (!visWidgetsCollection.url?.startsWith('http')) {
                            visWidgetsCollection.url = `./widgets/${visWidgetsCollection.url}`;
                        }
                        if (visWidgetsCollection.components) {
                            ((collection, instance) => {
                                try {
                                    let i18nPrefix = false;
                                    let i18nPromiseWait;

                                    // 1. Load language file ------------------
                                    // instance.common.visWidgets.i18n is deprecated
                                    if (collection.url && (collection.i18n === true || instance.common.visWidgets.i18n === true)) {
                                        // load i18n from files
                                        const pos = collection.url.lastIndexOf('/');
                                        let i18nURL;
                                        if (pos !== -1) {
                                            i18nURL = collection.url.substring(0, pos);
                                        } else {
                                            i18nURL = collection.url;
                                        }
                                        const lang = I18n.getLanguage();

                                        const i18nPromise = fetch(`${i18nURL}/i18n/${lang}.json`)
                                            .then(data => data.json())
                                            .then(json => {
                                                countRef.count++;
                                                I18n.extendTranslations(json, lang);
                                                window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                            })
                                            .catch(error => {
                                                if (lang !== 'en') {
                                                    // try to load English
                                                    return fetch(`${i18nURL}/i18n/en.json`)
                                                        .then(data => data.json())
                                                        .then(json => {
                                                            countRef.count++;
                                                            I18n.extendTranslations(json, lang);
                                                            window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                                        })
                                                        .catch(_error => console.log(`Cannot load i18n "${i18nURL}/i18n/${lang}.json": ${_error}`));
                                                }
                                                console.log(`Cannot load i18n "${i18nURL}/i18n/${lang}.json": ${error}`);
                                                return null;
                                            });
                                        promises.push(i18nPromise);
                                    } else if (collection.url && (collection.i18n === 'component' || instance.common.visWidgets.i18n === 'component')) {
                                        // instance.common.visWidgets.i18n is deprecated

                                        i18nPromiseWait = loadComponent(collection.name, 'default', './translations', collection.url)()
                                            .then(translations => {
                                                countRef.count++;

                                                // add automatic prefix to all translations
                                                if (translations.default.prefix === true) {
                                                    translations.default.prefix = `${instance.common.name}_`;
                                                }
                                                i18nPrefix = translations.default.prefix;

                                                I18n.extendTranslations(translations.default);
                                                window.__widgetsLoadIndicator && window.__widgetsLoadIndicator(countRef.count, promises.length);
                                            })
                                            .catch(error =>
                                                console.log(`Cannot load i18n "${collection.name}": ${error}`));
                                    } else if (collection.i18n && typeof collection.i18n === 'object') {
                                        try {
                                            I18n.extendTranslations(collection.i18n);
                                        } catch (error) {
                                            console.error(`Cannot import i18n: ${error}`);
                                        }
                                    }

                                    // 2. Load all components ------------------
                                    if (collection.components) {
                                        if (i18nPromiseWait) {
                                            // we must wait for it as the flag i18nPrefix will be used in the component
                                            promises.push(i18nPromiseWait
                                                .then(() => _loadComponentHelper({
                                                    visWidgetsCollection: collection,
                                                    countRef,
                                                    dynamicWidgetInstance: instance,
                                                    i18nPrefix,
                                                    result,
                                                })));
                                        } else {
                                            // do not wait for languages
                                            promises.push(_loadComponentHelper({
                                                visWidgetsCollection: collection,
                                                countRef,
                                                dynamicWidgetInstance: instance,
                                                i18nPrefix,
                                                result,
                                            }));
                                        }
                                    } else if (i18nPromiseWait) {
                                        promises.push(i18nPromiseWait);
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            })(visWidgetsCollection, dynamicWidgetInstance);
                        }
                    }
                }

                // deprecated
                if (dynamicWidgetInstance.common.visWidgets?.i18n && typeof dynamicWidgetInstance.common.visWidgets?.i18n === 'object') {
                    try {
                        I18n.extendTranslations(dynamicWidgetInstance.common.visWidgets.i18n);
                    } catch (error) {
                        console.error(`Cannot import i18n: ${error}`);
                    }
                }
            }

            return Promise.all(promises)
                .then(() => result);
        })
        .catch(e => console.error('Cannot read instances', e));
}

function addClass(actualClass, toAdd) {
    if (actualClass) {
        const parts = actualClass.split(' ').map(cl => cl.trim()).filter(cl => cl);
        if (!parts.includes(toAdd)) {
            parts.push(toAdd);
        }
        return parts.join(' ');
    }

    return toAdd;
}

function removeClass(actualClass, toRemove) {
    if (actualClass) {
        const parts = actualClass.split(' ').map(cl => cl.trim()).filter(cl => cl);
        const pos = parts.indexOf(toRemove);
        if (pos !== -1) {
            parts.splice(pos, 1);
        }
        return parts.join(' ');
    }

    return '';
}

function parseDimension(field) {
    const result = { value: 0, dimension: 'px' };
    if (!field) {
        return result;
    }
    const match = field.toString().match(/^([0-9-.]+)([a-z%]*)$/);
    if (!match) {
        return result;
    }
    result.value = parseInt(match[1]);
    result.dimension = match[2] || 'px';
    return result;
}

function findWidgetUsages(views, view, widgetId, _result) {
    if (view) {
        _result = _result || [];
        // search in specific view

        Object.keys(views[view].widgets).forEach(wid => {
            if (wid === widgetId) {
                return;
            }
            const oWidget = views[view].widgets[wid];
            const attrs = Object.keys(oWidget.data);
            attrs.forEach(attr => {
                if (attr.startsWith('widget') && oWidget.data[attr] === widgetId) {
                    _result.push({ view, wid, attr });
                }
            });
        });
        return _result;
    }

    // search in all views
    const result = [];
    Object.keys(views).forEach(_view => _view !== '___settings' && findWidgetUsages(views, _view, widgetId, _result));
    return result;
}

export {
    getUsedObjectIDs,
    extractBinding,
    getWidgetGroup,
    replaceGroupAttr,
    getUsedObjectIDsInWidget,
    getUrlParameter,
    parseDimension,
    addClass,
    removeClass,
    getRemoteWidgets,
    registerWidgetsLoadIndicator,
    readFile,
    findWidgetUsages,
};
