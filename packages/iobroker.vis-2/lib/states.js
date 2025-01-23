'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = calcProjects;
/**
 * Stringify-parse copy with type inference
 *
 * @param obj The object which should be cloned
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Determine if the string is of form identifier:ioBrokerId, like, val:hm-rpc.0.device.channel.state
 */
function isIdBinding(
    /** the possible assignment to check */
    assignment,
) {
    return !!assignment.match(/^[\d\w_]+:\s?[-.\d\w_#]+$/);
}
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
            const isEval =
                visOid.match(/^[\d\w_]+:\s?[-._/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+$/u) ||
                (!visOid.length && parts.length > 0); // (visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);
            if (isEval) {
                const xx = visOid.split(':', 2);
                const yy = systemOid.split(':', 2);
                visOid = xx[1].trim();
                systemOid = yy[1].trim();
                operations = [];
                operations.push({
                    op: 'eval',
                    arg: [
                        {
                            name: xx[0],
                            visOid,
                            systemOid,
                        },
                    ],
                });
                for (let u = 1; u < parts.length; u++) {
                    // eval construction
                    const trimmed = parts[u].trim();
                    if (isIdBinding(trimmed)) {
                        // parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
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
                        operations[0].arg?.push({
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
                }
            } else {
                for (let u = 1; u < parts.length; u++) {
                    const parse = parts[u].match(/([\w\s/+*-]+)(\(.+\))?/);
                    if (parse && parse[1]) {
                        const op = parse[1].trim();
                        // operators requires parameter
                        if (
                            op === '*' ||
                            op === '+' ||
                            op === '-' ||
                            op === '/' ||
                            op === '%' ||
                            op === 'min' ||
                            op === 'max'
                        ) {
                            if (parse[2] === undefined) {
                                console.log(`Invalid format of format string: ${format}`);
                            } else {
                                // try to extract number
                                let argStr = (parse[2] || '').trim().replace(',', '.');
                                argStr = argStr.substring(1, argStr.length - 1).trim();
                                const arg = parseFloat(argStr);
                                if (arg.toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                } else {
                                    operations = operations || [];
                                    operations.push({ op, arg });
                                }
                            }
                        } else if (op === 'date' || op === 'momentDate') {
                            // date formatting
                            operations = operations || [];
                            let arg = (parse[2] || '').trim();
                            // Remove braces from {momentDate(format)}
                            arg = arg.substring(1, arg.length - 1);
                            operations.push({ op, arg });
                        } else if (op === 'array') {
                            // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                            operations = operations || [];
                            let param = (parse[2] || '').trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({ op, arg: param.split(',') }); // xxx
                        } else if (op === 'value') {
                            // value formatting
                            operations = operations || [];
                            let arg = parse[2] === undefined ? '(2)' : parse[2] || '';
                            arg = arg.trim();
                            arg = arg.substring(1, arg.length - 1);
                            operations.push({ op, arg });
                        } else if (op === 'pow' || op === 'round' || op === 'random') {
                            // operators have optional parameter
                            if (parse[2] === undefined) {
                                operations = operations || [];
                                operations.push({ op });
                            } else {
                                let argStr = (parse[2] || '').trim().replace(',', '.');
                                argStr = argStr.substring(1, argStr.length - 1);
                                const arg = parseFloat(argStr.trim());
                                if (arg.toString() === 'NaN') {
                                    console.log(`Invalid format of format string: ${format}`);
                                } else {
                                    operations = operations || [];
                                    operations.push({ op, arg });
                                }
                            }
                        } else if (op === 'json') {
                            // json(objPropPath)  ex: json(prop1);  json(prop1.propA)
                            operations = operations || [];
                            let arg = (parse[2] || '').trim();
                            arg = arg.substring(1, arg.length - 1);
                            operations.push({ op, arg });
                        } else {
                            // operators without parameter
                            operations = operations || [];
                            operations.push({ op: op });
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
function getWidgetGroup(views, view, widget) {
    const widgets = views[view].widgets;
    const groupId = widgets[widget]?.groupid;
    if (groupId && widgets[groupId]) {
        return views[view].widgets[widget].groupid;
    }
    const widgetKeys = Object.keys(widgets);
    return widgetKeys.find(w => widgets[w].data?.members?.includes(widget));
}
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
    if (widget.grouped && widget.groupid) {
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
                    const operation0 = item.operations && item.operations[0];
                    // If we have more than one argument
                    if (operation0 && Array.isArray(operation0.arg)) {
                        for (let ww = 0; ww < operation0.arg.length; ww++) {
                            const arg = operation0.arg[ww];
                            const _systemOid = arg.systemOid;
                            if (!_systemOid) {
                                continue;
                            }
                            !linkContext.IDs.includes(_systemOid) && linkContext.IDs.push(_systemOid);
                            if (linkContext.byViews && !linkContext.byViews[view].includes(_systemOid)) {
                                linkContext.byViews[view].push(_systemOid);
                            }
                            linkContext.bindings[_systemOid] = linkContext.bindings[_systemOid] || [];
                            if (!linkContext.bindings[_systemOid].includes(item)) {
                                linkContext.bindings[_systemOid].push(item);
                            }
                        }
                    }
                });
            } else if (
                attr !== 'oidTrueValue' &&
                attr !== 'oidFalseValue' &&
                data[attr] &&
                data[attr] !== 'nothing_selected'
            ) {
                let isID = !!attr.match(/oid\d{0,2}$/);
                if (attr.startsWith('oid')) {
                    isID = true;
                } else if (attr.startsWith('signals-oid-')) {
                    isID = true;
                } else if (linkContext.widgetAttrInfo) {
                    const _attr = attr.replace(/\d{0,2}$/, '');
                    if (
                        linkContext.widgetAttrInfo[_attr]?.type === 'id' &&
                        linkContext.widgetAttrInfo[_attr].noSubscribe !== true
                    ) {
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
            const styleValue = style[cssAttr];
            if (cssAttr && styleValue && typeof styleValue === 'string') {
                const OIDs = extractBinding(styleValue);
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
                        const operation0 = item.operations && item.operations[0];
                        if (operation0 && Array.isArray(operation0.arg)) {
                            for (let w = 0; w < operation0.arg.length; w++) {
                                const arg = operation0.arg[w];
                                const _systemOid = arg.systemOid;
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
                    if (widget.tpl === 'tplContainerView' && widget.data.contains_view && linkContext.byViews) {
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
function calcProject(objects, projects, instance, result, callback) {
    if (!projects?.length) {
        callback(null, result || []);
        return;
    }
    result = result || [];
    const project = projects.shift();
    if (!project?.isDir) {
        setImmediate(calcProject, objects, projects, instance, result, callback);
        return;
    }
    // calculate the data points in one project
    void objects.readFile(`vis-2.${instance}`, `/${project.file}/vis-views.json`, (err, data, _mimeType) => {
        let json;
        try {
            json = JSON.parse(data?.toString() || '{}');
        } catch {
            console.error(`Cannot parse "/${project.file}/vis-views.json`);
            setImmediate(calcProject, objects, projects, instance, result, callback);
            return;
        }
        const dps = getUsedObjectIDs(json, false);
        if (dps?.IDs) {
            result.push({
                id: `vis-2.${instance}.datapoints.${project.file.replace(/[.\\s]/g, '_')}`,
                val: dps.IDs.length,
            });
        }
        setImmediate(calcProject, objects, projects, instance, result, callback);
    });
}
function calcProjects(objects, _states, instance, config, callback) {
    objects.readDir(`vis-2.${instance}`, '/', null, (err, projects) => {
        if (err || !projects?.length) {
            if (callback) {
                callback(err || null, [{ id: `vis-2.${instance}.datapoints.total`, val: 0 }]);
            }
        } else {
            calcProject(objects, projects, instance, [], (err, result) => {
                if (result && result.length) {
                    let total = 0;
                    for (let r = 0; r < result.length; r++) {
                        total += result[r].val;
                    }
                    result.push({ id: `vis-2.${instance}.datapoints.total`, val: total });
                }
                if (callback) {
                    callback(err, result);
                }
            });
        }
    });
}
//# sourceMappingURL=states.js.map
