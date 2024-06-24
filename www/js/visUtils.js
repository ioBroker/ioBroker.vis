/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2022 bluefox https://github.com/GermanBluefox,
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
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
    var newString = inputStr;
    var match = false;
    var ms = inputStr.match(/(groupAttr\d+)+?/g);
    if (ms) {
        match = true;
        ms.forEach(function (m) {
            newString = newString.replace(/groupAttr(\d+)/, groupAttrList[m]);
        });
        console.log('Replaced ' + inputStr + ' with ' + newString + ' (based on ' + ms + ')');
    }
    return {doesMatch: match, newString: newString};
}

function getWidgetGroup(views, view, widget) {
    var widgets = views[view].widgets;
    var groupID = widgets[widget].groupid;
    if (groupID) {
        return groupID;
    }

    for (var w in widgets) {
        if (!widgets.hasOwnProperty(w) || !widgets[w].data) {
            continue;
        }
        var members = widgets[w].data.members;
        if (members && members.indexOf(widget) !== -1) {
            return w;
        }
    }

    return null;
}

// get value of Obj property PropPath. PropPath is string like "Prop1" or "Prop1.Prop2" ...
function getObjPropValue(obj, propPath) {
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

function extractBinding(format) {
    var oid = format.match(/{(.+?)}/g);
    var result = null;
    if (oid) {
        if (oid.length > 50) {
            console.warn('Too many bindings in one widget: ' + oid.length + '[max = 50]');
        }
        for (var p = 0; p < oid.length && p < 50; p++) {
            var _oid = oid[p].substring(1, oid[p].length - 1);
            if (_oid[0] === '{') {
                continue;
            }
            // If first symbol '"' => it is JSON
            if (_oid && _oid[0] === '"') {
                continue;
            }
            var parts = _oid.split(';');
            result = result || [];
            var systemOid = parts[0].trim();
            var visOid = systemOid;

            var test1 = visOid.substring(visOid.length - 4);
            var test2 = visOid.substring(visOid.length - 3);

            if (visOid && test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                visOid = visOid + '.val';
            }

            var isSeconds = (test2 === '.ts' || test2 === '.lc');

            test1 = systemOid.substring(systemOid.length - 4);
            test2 = systemOid.substring(systemOid.length - 3);

            if (test1 === '.val' || test1 === '.ack') {
                systemOid = systemOid.substring(0, systemOid.length - 4);
            } else if (test2 === '.lc' || test2 === '.ts') {
                systemOid = systemOid.substring(0, systemOid.length - 3);
            }
            var operations = null;
            var isEval = visOid.match(/^[\d\w_]+:\s?[-\d\w_.]+/) || (!visOid.length && parts.length > 0);//(visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);

            if (isEval) {
                var xx = visOid.split(':', 2);
                var yy = systemOid.split(':', 2);
                visOid = xx[1];
                systemOid = yy[1];
                operations = operations || [];
                operations.push({
                    op: 'eval',
                    arg: [{
                        name: xx[0],
                        visOid,
                        systemOid,
                    }]
                });
            }

            for (var u = 1; u < parts.length; u++) {
                // eval construction
                if (isEval) {
                    if (parts[u]
  .trim()
  .match(
    /^[0-9A-Z_a-z]+:[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]?(?:[ !#-&\(\)\+\x2D-:=@-Z\^_a-~\xB5\xC0-\xD6\xD8-\xF6\xF8-\u01BA\u01BC-\u01BF\u01C4\u01C6\u01C7\u01C9\u01CA\u01CC-\u01F1\u01F3-\u0293\u0295-\u02AF\u0370-\u0373\u0376\u0377\u037B-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0560-\u0588\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FD-\u10FF\u13A0-\u13F5\u13F8-\u13FD\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FBB\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCB\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFB\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2134\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C7B\u2C7E-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA620-\uA629\uA640-\uA66D\uA680-\uA69B\uA722-\uA76F\uA771-\uA787\uA78B-\uA78E\uA790-\uA7CA\uA7D0\uA7D1\uA7D3\uA7D5-\uA7D9\uA7F5\uA7F6\uA7FA\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uAB30-\uAB5A\uAB60-\uAB68\uAB70-\uABBF\uABF0-\uABF9\uFB00-\uFB06\uFB13-\uFB17\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]|\uD801[\uDC00-\uDC4F\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC]|\uD803[\uDC80-\uDCB2\uDCC0-\uDCF2\uDD30-\uDD39]|\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDEF0-\uDEF9]|\uD805[\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDD50-\uDD59]|\uD807[\uDC50-\uDC59\uDD50-\uDD59\uDDA0-\uDDA9\uDF50-\uDF59]|\uD81A[\uDE60-\uDE69\uDEC0-\uDEC9\uDF50-\uDF59]|\uD81B[\uDE40-\uDE7F]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD837[\uDF00-\uDF09\uDF0B-\uDF1E\uDF25-\uDF2A]|\uD838[\uDD40-\uDD49\uDEF0-\uDEF9]|\uD839[\uDCF0-\uDCF9]|\uD83A[\uDD00-\uDD43\uDD50-\uDD59]|\uD83E[\uDFF0-\uDFF9])+$/
  )) {
                        var _systemOid = parts[u].trim();
                        var _visOid = _systemOid;

                        test1 = _visOid.substring(_visOid.length - 4);
                        test2 = _visOid.substring(_visOid.length - 3);

                        if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                            _visOid = _visOid + '.val';
                        }

                        test1 = systemOid.substring(_systemOid.length - 4);
                        test2 = systemOid.substring(_systemOid.length - 3);

                        if (test1 === '.val' || test1 === '.ack') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                        } else if (test2 === '.lc' || test2 === '.ts') {
                            _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                        }
                        var x1 = _visOid.split(':', 2);
                        var y1 = _systemOid.split(':', 2);

                        operations[0].arg.push({
                            name:      x1[0],
                            visOid:    x1[1],
                            systemOid: y1[1]
                        });
                    } else {
                        parts[u] = parts[u].replace(/::/g, ':');
                        if (operations[0].formula) {
                            var n = JSON.parse(JSON.stringify(operations[0]));
                            n.formula = parts[u];
                            operations.push(n);
                        } else {
                            operations[0].formula = parts[u];
                        }
                    }
                } else {
                    var parse = parts[u].match(/([\w\s\/+*-]+)(\(.+\))?/);
                    if (parse && parse[1]) {
                        parse[1] = parse[1].trim();
                        // operators requires parameter
                        if (parse[1] === '*' ||
                            parse[1] === '+' ||
                            parse[1] === '-' ||
                            parse[1] === '/' ||
                            parse[1] === '%' ||
                            parse[1] === 'min' ||
                            parse[1] === 'max') {
                            if (parse[2] === undefined) {
                                console.log('Invalid format of format string: ' + format);
                                parse[2] = null;
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log('Invalid format of format string: ' + format);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({op: parse[1], arg: parse[2]});
                                }
                            }
                        } else
                        // date formatting
                        if (parse[1] === 'date' || parse[1] === 'momentDate' ) {
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({op: parse[1], arg: parse[2]});
                        } else
                        // returns array[value]. e.g.: {id.ack;array(ack is false,ack is true)}
                        if (parse[1] === 'array') {
                            operations = operations || [];
                            param = (parse[2] || '').trim();
                            param = param.substring(1, param.length - 1);
                            param = param.split(',');
                            if (Array.isArray(param)) {
                                operations.push ({op: parse[1], arg: param}); //xxx
                            }
                        } else
                        // value formatting
                        if (parse[1] === 'value') {
                            operations = operations || [];
                            var param = (parse[2] === undefined) ? '(2)' : (parse[2] || '');
                            param = param.trim();
                            param = param.substring(1, param.length - 1);
                            operations.push({op: parse[1], arg: param});
                        } else
                        // operators have optional parameter
                        if (parse[1] === 'pow' || parse[1] === 'round' || parse[1] === 'random') {
                            if (parse[2] === undefined) {
                                operations = operations || [];
                                operations.push({op: parse[1]});
                            } else {
                                parse[2] = (parse[2] || '').trim().replace(',', '.');
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                parse[2] = parseFloat(parse[2].trim());

                                if (parse[2].toString() === 'NaN') {
                                    console.log('Invalid format of format string: ' + format);
                                    parse[2] = null;
                                } else {
                                    operations = operations || [];
                                    operations.push({op: parse[1], arg: parse[2]});
                                }
                            }
                        } else if (parse[1] === 'json') {
                            // json(objPropPath)  ex: json(prop1);  json(prop1.propA)
                            operations = operations || [];
                            parse[2] = (parse[2] || '').trim();
                            parse[2] = parse[2].substring(1, parse[2].length - 1);
                            operations.push({op: parse[1], arg: parse[2]});
                        } else {
                            // operators without parameter
                            operations = operations || [];
                            operations.push({op: parse[1]});
                        }
                    } else {
                        console.log('Invalid format ' + format);
                    }
                }
            }

            result.push({
                visOid: visOid,
                systemOid: systemOid,
                token: oid[p],
                operations: operations ? operations : undefined,
                format: format,
                isSeconds: isSeconds
            });
        }
    }
    return result;
}

function getUsedObjectIDs(views, isByViews) {
    if (!views) {
        console.log('Check why views are not yet loaded!');
        return null;
    }

    var _views = isByViews ? {} : null;
    var IDs         = [];
    var visibility  = {};
    var bindings    = {};
    var lastChanges = {};
    var signals     = {};

    var view;
    var id;
    var sidd;
    for (view in views) {
        if (!views.hasOwnProperty(view)) continue;

        if (view === '___settings') continue;

        if (_views) _views[view] = [];

        for (id in views[view].widgets) {
            if (!views[view].widgets.hasOwnProperty(id)) continue;
            // Check all attributes
            var data  = views[view].widgets[id].data;
            var style = views[view].widgets[id].style;

            // fix error in naming
            if (views[view].widgets[id].groupped) {
                views[view].widgets[id].grouped = true;
                delete views[view].widgets[id].groupped;
            }

            // rename hqWidgets => hqwidgets
            if (views[view].widgets[id].widgetSet === 'hqWidgets') {
                views[view].widgets[id].widgetSet = 'hqwidgets';
            }

            // rename RGraph => rgraph
            if (views[view].widgets[id].widgetSet === 'RGraph') {
                views[view].widgets[id].widgetSet = 'rgraph';
            }

            // rename timeAndWeather => timeandweather
            if (views[view].widgets[id].widgetSet === 'timeAndWeather') {
                views[view].widgets[id].widgetSet = 'timeandweather';
            }

            // convert "Show on Value" to HTML
            if (views[view].widgets[id].tpl === 'tplShowValue') {
                views[view].widgets[id].tpl = 'tplHtml';
                views[view].widgets[id].data['visibility-oid'] = views[view].widgets[id].data.oid;
                views[view].widgets[id].data['visibility-val'] = views[view].widgets[id].data.value;
                delete views[view].widgets[id].data.oid;
                delete views[view].widgets[id].data.value;
            }

            // convert "Hide on >0/True" to HTML
            if (views[view].widgets[id].tpl === 'tplHideTrue') {
                views[view].widgets[id].tpl = 'tplHtml';
                views[view].widgets[id].data['visibility-cond'] = '!=';
                views[view].widgets[id].data['visibility-oid'] = views[view].widgets[id].data.oid;
                views[view].widgets[id].data['visibility-val'] = true;
                delete views[view].widgets[id].data.oid;
            }

            // convert "Hide on 0/False" to HTML
            if (views[view].widgets[id].tpl === 'tplHide') {
                views[view].widgets[id].tpl = 'tplHtml';
                views[view].widgets[id].data['visibility-cond'] = '!=';
                views[view].widgets[id].data['visibility-oid'] = views[view].widgets[id].data.oid;
                views[view].widgets[id].data['visibility-val'] = false;
                delete views[view].widgets[id].data.oid;
            }

            // convert "Door/Window sensor" to HTML
            if (views[view].widgets[id].tpl === 'tplHmWindow') {
                views[view].widgets[id].tpl = 'tplValueBool';
                views[view].widgets[id].data.html_false = views[view].widgets[id].data.html_closed;
                views[view].widgets[id].data.html_true = views[view].widgets[id].data.html_open;
                delete views[view].widgets[id].data.html_closed;
                delete views[view].widgets[id].data.html_open;
            }

            // convert "Door/Window sensor" to HTML
            if (views[view].widgets[id].tpl === 'tplHmWindowRotary') {
                views[view].widgets[id].tpl = 'tplValueListHtml8';
                views[view].widgets[id].data.count = 2;
                views[view].widgets[id].data.value0 = views[view].widgets[id].data.html_closed;
                views[view].widgets[id].data.value1 = views[view].widgets[id].data.html_open;
                views[view].widgets[id].data.value2 = views[view].widgets[id].data.html_tilt;
                delete views[view].widgets[id].data.html_closed;
                delete views[view].widgets[id].data.html_open;
                delete views[view].widgets[id].data.html_tilt;
            }

            // convert "tplBulbOnOff" to tplBulbOnOffCtrl
            if (views[view].widgets[id].tpl === 'tplBulbOnOff') {
                views[view].widgets[id].tpl = 'tplBulbOnOffCtrl';
                views[view].widgets[id].data.readOnly = true;
            }

            // convert "tplValueFloatBarVertical" to tplValueFloatBar
            if (views[view].widgets[id].tpl === 'tplValueFloatBarVertical') {
                views[view].widgets[id].tpl = 'tplValueFloatBar';
                views[view].widgets[id].data.orientation = 'vertical';
            }

            for (var attr in data) {
                if (!data.hasOwnProperty(attr) || !attr) continue;
                /* TODO DO do not forget remove it after a while. Required for import from DashUI */
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

                if (typeof data[attr] === 'string') {
                    var m;
                    var oids = extractBinding(data[attr]);
                    if (oids) {
                        for (var t = 0; t < oids.length; t++) {
                            var ssid = oids[t].systemOid;
                            if (ssid) {
                                if (IDs.indexOf(ssid) === -1) IDs.push(ssid);
                                if (_views && _views[view].indexOf(ssid) === -1) _views[view].push(ssid);
                                if (!bindings[ssid]) bindings[ssid] = [];
                                oids[t].type = 'data';
                                oids[t].attr = attr;
                                oids[t].view = view;
                                oids[t].widget = id;

                                bindings[ssid].push(oids[t]);
                            }

                            if (oids[t].operations && oids[t].operations[0].arg instanceof Array) {
                                for (var ww = 0; ww < oids[t].operations[0].arg.length; ww++) {
                                    ssid = oids[t].operations[0].arg[ww].systemOid;
                                    if (!ssid) continue;
                                    if (IDs.indexOf(ssid) === -1) IDs.push(ssid);
                                    if (_views && _views[view].indexOf(ssid) === -1) _views[view].push(ssid);
                                    if (!bindings[ssid]) bindings[ssid] = [];
                                    bindings[ssid].push(oids[t]);
                                }
                            }
                        }
                    } else
                    if (attr !== 'oidTrueValue' && attr !== 'oidFalseValue' && ((attr.match(/oid\d{0,2}$/) || attr.match(/^oid/) || attr.match(/^signals-oid-/) || attr === 'lc-oid') && data[attr])) {
                        if (data[attr] && data[attr] !== 'nothing_selected') {
                            if (IDs.indexOf(data[attr]) === -1) {
                                IDs.push(data[attr]);
                            }
                            if (_views && _views[view].indexOf(data[attr]) === -1) {
                                _views[view].push(data[attr]);
                            }
                        }

                        // Visibility binding
                        if (attr === 'visibility-oid' && data['visibility-oid']) {
                            var vid = data['visibility-oid'];
                            var vgroup = getWidgetGroup(views, view, id);
                            if (vgroup) {
                                var result1 = replaceGroupAttr(vid, views[view].widgets[vgroup].data);
                                if (result1.doesMatch) {
                                    vid = result1.newString;
                                }
                            }

                            if (!visibility[vid]) visibility[vid] = [];
                            visibility[vid].push({view: view, widget: id});
                        }

                        // Signal binding
                        if (attr.match(/^signals-oid-/) && data[attr]) {
                            var sid = data[attr];
                            var group = getWidgetGroup(views, view, id);
                            if (group) {
                                var result2 = replaceGroupAttr(sid, views[view].widgets[group].data);
                                if (result2.doesMatch) {
                                    sid = result2.newString;
                                }
                            }

                            if (!signals[sid]) {
                                signals[sid] = [];
                            }
                            signals[sid].push({
                                view:   view,
                                widget: id,
                                index:  parseInt(attr.substring('signals-oid-'.length), 10)
                            });
                        }
                        if (attr === 'lc-oid') {
                            var lcsid = data[attr];
                            var ggroup = getWidgetGroup(views, view, id);
                            if (ggroup) {
                                var result3 = replaceGroupAttr(lcsid, views[view].widgets[ggroup].data);
                                if (result3.doesMatch) {
                                    lcsid = result3.newString;
                                }
                            }

                            if (!lastChanges[lcsid]) {
                                lastChanges[lcsid] = [];
                            }
                            lastChanges[lcsid].push({
                                view:   view,
                                widget: id
                            });
                        }
                    } else
                    if ((m = attr.match(/^attrType(\d+)$/)) && data[attr] === 'id') {
                        var _id = 'groupAttr' + m[1];
                        if (data[_id]) {
                            if (IDs.indexOf(data[_id]) === -1) {
                                IDs.push(data[_id]);
                            }
                            if (_views && _views[view].indexOf(data[_id]) === -1) {
                                _views[view].push(data[_id]);
                            }
                        }
                    }
                }
            }

            // build bindings for styles
            if (style) {
                for (var cssAttr in style) {
                    if (!style.hasOwnProperty(cssAttr) || !cssAttr) continue;
                    if (typeof style[cssAttr] === 'string') {
                        var objIDs = extractBinding(style[cssAttr]);
                        if (objIDs) {
                            for (var tt = 0; tt < objIDs.length; tt++) {
                                sidd = objIDs[tt].systemOid;
                                if (sidd) {
                                    if (IDs.indexOf(sidd) === -1) IDs.push(sidd);
                                    if (_views && _views[view].indexOf(sidd) === -1) _views[view].push(sidd);
                                    if (!bindings[sidd]) bindings[sidd] = [];

                                    objIDs[tt].type = 'style';
                                    objIDs[tt].attr = cssAttr;
                                    objIDs[tt].view = view;
                                    objIDs[tt].widget = id;

                                    bindings[sidd].push(objIDs[tt]);
                                }

                                if (objIDs[tt].operations && objIDs[tt].operations[0].arg instanceof Array) {
                                    for (var w = 0; w < objIDs[tt].operations[0].arg.length; w++) {
                                        sidd = objIDs[tt].operations[0].arg[w].systemOid;
                                        if (!sidd) continue;
                                        if (IDs.indexOf(sidd) === -1) IDs.push(sidd);
                                        if (_views && _views[view].indexOf(sidd) === -1) _views[view].push(sidd);
                                        if (!bindings[sidd]) bindings[sidd] = [];
                                        bindings[sidd].push(objIDs[tt]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (_views) {
        var changed;
        do {
            changed = false;
            // Check containers
            for (view in views) {
                if (!views.hasOwnProperty(view)) continue;

                if (view === '___settings') continue;

                for (id in views[view].widgets) {
                    if (!views[view].widgets.hasOwnProperty(id)) continue;

                    // Add all OIDs from this view to parent
                    if (views[view].widgets[id].tpl === 'tplContainerView' && views[view].widgets[id].data.contains_view) {
                        var ids = _views[views[view].widgets[id].data.contains_view];
                        if (ids) {
                            for (var a = 0; a < ids.length; a++) {
                                if (ids[a] && _views[view].indexOf(ids[a]) === -1) {
                                    _views[view].push(ids[a]);
                                    changed = true;
                                }
                            }
                        } else {
                            console.warn('View does not exist: "' + views[view].widgets[id].data.contains_view + '"');
                        }
                    }
                }
            }
        } while (changed);
    }

    return {IDs: IDs, byViews: _views, visibility: visibility, bindings: bindings, lastChanges: lastChanges, signals: signals};
}

if (typeof module !== 'undefined' && module.parent) {
    module.exports.getUsedObjectIDs = getUsedObjectIDs;
}
