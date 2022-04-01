/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022 bluefox https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

function replaceGroupAttr(inputStr, groupAttrList) {
    let newString = inputStr;
    let match = false;
    const ms = inputStr.match(/(groupAttr\d+)+?/g);
    if (ms) {
        match = true;
        ms.forEach(m => {
            newString = newString.replace(/groupAttr(\d+)/, groupAttrList[m]);
        });

        console.log(`Replaced ${inputStr} with ${newString} (based on ${ms})`);
    }

    return { doesMatch: match, newString };
}

function getWidgetGroup(views, view, widget) {
    const widgets = views[view].widgets;
    if (widgets[widget].groupid) {
        return views[view].widgets[widget].groupid;
    }

    for (const w in widgets) {
        if (!Object.prototype.hasOwnProperty.call(widgets, w)) {
            continue;
        }
        const members = widgets[w].data.members;
        if (members?.includes(widget)) {
            return w;
        }
    }

    return null;
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
            // If first symbol '"' => it is JSON
            if (_oid && _oid[0] === '"') {
                continue;
            }
            const parts = _oid.split(';');
            result = result || [];
            let systemOid = parts[0].trim();
            let visOid = systemOid;

            let test1 = visOid.substring(visOid.length - 4);
            let test2 = visOid.substring(visOid.length - 3);

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
            const isEval = visOid.match(/^[\d\w_]+:\s?[-\d\w_.]+/) || (!visOid.length && parts.length > 0); // (visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);

            if (isEval) {
                const xx = visOid.split(':', 2);
                const yy = systemOid.split(':', 2);
                visOid = xx[1];
                systemOid = yy[1];
                operations = operations || [];
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
                    if (parts[u].trim().match(/^[\d\w_]+:\s?[-.\d\w_]+$/)) { // parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
                        let _systemOid = parts[u].trim();
                        let _visOid = _systemOid;

                        test1 = _visOid.substring(_visOid.length - 4);
                        test2 = _visOid.substring(_visOid.length - 3);

                        if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                            _visOid += '.val';
                        }

                        test1 = systemOid.substring(_systemOid.length - 4);
                        test2 = systemOid.substring(_systemOid.length - 3);

                        if (test1 === '.val' || test1 === '.ack') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                        } else if (test2 === '.lc' || test2 === '.ts') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                        }
                        const x1 = _visOid.split(':', 2);
                        const y1 = _systemOid.split(':', 2);

                        operations[0].arg.push({
                            name: x1[0],
                            visOid: x1[1],
                            systemOid: y1[1],
                        });
                    } else {
                        parts[u] = parts[u].replace(/::/g, ':');
                        if (operations[0].formula) {
                            const n = JSON.parse(JSON.stringify(operations[0]));
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
                        } else
                        // date formatting
                        if (parse[1] === 'date' || parse[1] === 'momentDate') {
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({ op: parse[1], arg: parse[2] });
                        } else
                        // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                        if (parse[1] === 'array') {
                            operations = operations || [];
                            let param = (parse[2] || '').trim();
                            param = param.substring(1, param.length - 1);
                            param = param.split(',');
                            if (Array.isArray(param)) {
                                operations.push({ op: parse[1], arg: param }); // xxx
                            }
                        } else
                        // value formatting
                        if (parse[1] === 'value') {
                            operations = operations || [];
                            let param = (parse[2] === undefined) ? '(2)' : (parse[2] || '');
                            param = param.trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op: parse[1], arg: param });
                        } else
                        // operators have optional parameter
                        if (parse[1] === 'pow' || parse[1] === 'round' || parse[1] === 'random') {
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
    const widget = views[view].widgets[wid];

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
        const parentWidgetData = views[view].widgets[widget.groupid].data;
        const aCount = parseInt(parentWidgetData.attrCount, 10);

        if (aCount && data) {
            data = JSON.parse(JSON.stringify(data));

            Object.keys(data).forEach(attr => {
                if (typeof data[attr] === 'string') {
                    const result = replaceGroupAttr(data[attr], parentWidgetData);
                    if (result.doesMatch) {
                        data[attr] = result.newString || '';
                    }
                }
            });
        }
    }

    Object.keys(data).forEach(attr => {
        if (!attr) {
            return;
        }
        /* TODO DO do not forget remove it after a while. Required for import from DashUI */
        /*
        if (attr === 'state_id') {
            data.state_oid = data[attr];
            delete data[attr];
            attr = 'state_oid';
        } else
        if (attr === 'number_id') {
            data.number_oid = data[attr];
            delete data[attr];
            attr = 'number_oid';
        } else
        if (attr === 'toggle_id') {
            data.toggle_oid = data[attr];
            delete data[attr];
            attr = 'toggle_oid';
        } else
        if (attr === 'set_id') {
            data.set_oid = data[attr];
            delete data[attr];
            attr = 'set_oid';
        } else
        if (attr === 'temp_id') {
            data.temp_oid = data[attr];
            delete data[attr];
            attr = 'temp_oid';
        } else
        if (attr === 'drive_id') {
            data.drive_oid = data[attr];
            delete data[attr];
            attr = 'drive_oid';
        } else
        if (attr === 'content_id') {
            data.content_oid = data[attr];
            delete data[attr];
            attr = 'content_oid';
        } else
        if (attr === 'dialog_id') {
            data.dialog_oid = data[attr];
            delete data[attr];
            attr = 'dialog_oid';
        } else
        if (attr === 'max_value_id') {
            data.max_value_oid = data[attr];
            delete data[attr];
            attr = 'max_value_oid';
        } else
        if (attr === 'dialog_id') {
            data.dialog_oid = data[attr];
            delete data[attr];
            attr = 'dialog_oid';
        } else
        if (attr === 'weoid') {
            data.woeid = data[attr];
            delete data[attr];
            attr = 'woeid';
        }
        */

        if (typeof data[attr] === 'string') {
            let m;
            // Process bindings in data attributes
            const oids = extractBinding(data[attr]);

            if (oids) {
                for (let t = 0; t < oids.length; t++) {
                    const ssid = oids[t].systemOid;
                    if (ssid) {
                        // Save id for subscribe
                        !linkContext.IDs.includes(ssid) && linkContext.IDs.push(ssid);

                        if (linkContext.byViews && !linkContext.byViews[view].includes(ssid)) {
                            linkContext.byViews[view].push(ssid);
                        }

                        linkContext.bindings[ssid] = linkContext.bindings[ssid] || [];
                        oids[t].type = 'data';
                        oids[t].attr = attr;
                        oids[t].view = view;
                        oids[t].widget = wid;

                        linkContext.bindings[ssid].push(oids[t]);
                    }

                    if (oids[t].operations && oids[t].operations[0].arg instanceof Array) {
                        for (let ww = 0; ww < oids[t].operations[0].arg.length; ww++) {
                            const systemOid = oids[t].operations[0].arg[ww].systemOid;
                            if (!systemOid) {
                                continue;
                            }

                            !linkContext.IDs.includes(systemOid) && linkContext.IDs.push(systemOid);

                            if (linkContext.byViews && linkContext.byViews[view].includes(systemOid)) {
                                linkContext.byViews[view].push(systemOid);
                            }

                            linkContext.bindings[systemOid] = linkContext.bindings[systemOid] || [];
                            linkContext.bindings[systemOid].push(oids[t]);
                        }
                    }
                }
            } else
            if (attr !== 'oidTrueValue' &&
                attr !== 'oidFalseValue' &&
                (
                    (attr.match(/oid\d{0,2}$/) ||
                        attr.startsWith('oid') ||
                        attr.startsWith('signals-oid-') ||
                        attr === 'lc-oid'
                    ) && data[attr]
                )
            ) {
                if (data[attr] && data[attr] !== 'nothing_selected') {
                    if (!linkContext.IDs.includes(data[attr])) {
                        linkContext.IDs.push(data[attr]);
                    }
                    if (linkContext.byViews && !linkContext.byViews[view].includes(data[attr])) {
                        linkContext.byViews[view].push(data[attr]);
                    }
                }

                // Visibility binding
                if (attr === 'visibility-oid' && data['visibility-oid']) {
                    let vid = data['visibility-oid'];

                    if (widget.grouped) {
                        const vGroup = getWidgetGroup(views, view, wid);
                        if (vGroup) {
                            const result1 = replaceGroupAttr(vid, views[view].widgets[vGroup].data);
                            if (result1.doesMatch) {
                                vid = result1.newString;
                            }
                        }
                    }

                    linkContext.visibility[vid] = linkContext.visibility[vid] || [];
                    linkContext.visibility[vid].push({ view, widget: wid });
                }

                // Signal binding
                if (attr.startsWith('signals-oid-') && data[attr]) {
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
                }
                if (attr === 'lc-oid') {
                    let lcsid = data[attr];

                    if (widget.grouped) {
                        const gGroup = getWidgetGroup(views, view, wid);
                        if (gGroup) {
                            const result3 = replaceGroupAttr(lcsid, views[view].widgets[gGroup].data);
                            if (result3.doesMatch) {
                                lcsid = result3.newString;
                            }
                        }
                    }

                    linkContext.lastChanges[lcsid] = linkContext.lastChanges[lcsid] || [];
                    linkContext.lastChanges[lcsid].push({ view, widget: wid });
                }
            } else
            // eslint-disable-next-line no-cond-assign
            if ((m = attr.match(/^attrType(\d+)$/)) && data[attr] === 'id') {
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
    });

    // build bindings for styles
    if (style) {
        Object.keys(style).forEach(cssAttr => {
            if (cssAttr && typeof style[cssAttr] === 'string') {
                const objIDs = extractBinding(style[cssAttr]);
                if (objIDs) {
                    for (let tt = 0; tt < objIDs.length; tt++) {
                        const sidd = objIDs[tt].systemOid;
                        if (sidd) {
                            !linkContext.IDs.includes(sidd) && linkContext.IDs.push(sidd);
                            if (linkContext.byViews && linkContext.byViews[view].includes(sidd)) {
                                linkContext.byViews[view].push(sidd);
                            }

                            linkContext.bindings[sidd] = linkContext.bindings[sidd] || [];

                            objIDs[tt].type = 'style';
                            objIDs[tt].attr = cssAttr;
                            objIDs[tt].view = view;
                            objIDs[tt].widget = wid;

                            linkContext.bindings[sidd].push(objIDs[tt]);
                        }

                        if (objIDs[tt].operations && objIDs[tt].operations[0].arg instanceof Array) {
                            for (let w = 0; w < objIDs[tt].operations[0].arg.length; w++) {
                                const systemOid = objIDs[tt].operations[0].arg[w].systemOid;
                                if (!systemOid) {
                                    continue;
                                }

                                !linkContext.IDs.includes(systemOid) && linkContext.IDs.push(systemOid);

                                if (linkContext.byViews && !linkContext.byViews[view].includes(systemOid)) {
                                    linkContext.byViews[view].push(systemOid);
                                }
                                linkContext.bindings[systemOid] = linkContext.bindings[systemOid] || [];
                                linkContext.bindings[systemOid].push(objIDs[tt]);
                            }
                        }
                    }
                }
            }
        });
    }
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
            Object.keys(views).forEach(view => {
                if (view === '___settings') {
                    return;
                }

                Object.values(views[view].widgets).forEach(widget => {
                    // Add all OIDs from this view to parent
                    if (widget.tpl === 'tplContainerView' && widget.data.contains_view) {
                        const ids = linkContext.byViews[widget.data.contains_view];
                        if (ids) {
                            for (let a = 0; a < ids.length; a++) {
                                if (ids[a] && !linkContext.byViews[view].includes(ids[a])) {
                                    linkContext.byViews[view].push(ids[a]);
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

function removeClass(actualClass, toAdd) {
    if (actualClass) {
        const parts = actualClass.split(' ').map(cl => cl.trim()).filter(cl => cl);
        const pos = parts.indexOf(toAdd);
        if (pos !== -1) {
            parts.splice(pos, 1);
        }
        return parts.join(' ');
    }

    return '';
}

module.exports = {
    getUsedObjectIDs,
    extractBinding,
    getWidgetGroup,
    replaceGroupAttr,
    getUsedObjectIDsInWidget,
    getUrlParameter,
    addClass,
    removeClass,
};
