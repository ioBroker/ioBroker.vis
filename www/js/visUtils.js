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

/************************************************************** */
function replaceGroupAttr(inputStr, groupAttrList) {
    var newString = inputStr;
    var match = false;
    var ms = inputStr.match(/(groupAttr\d+)+?/g); //get array, allmatching
    if (ms) {
        ms.forEach(function (m) {
            if (m in groupAttrList){
              newString = newString.replace(/groupAttr(\d+)/, groupAttrList[m]);
              match = true;
            }
        });
        if (match) console.log('Replaced ' + inputStr + ' with ' + newString + ' (based on ' + ms + ')');
    }
    return {doesMatch: match, newString: newString};
}

/***************************************************************/
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

/***************************************************************/
//Format: {objectID1;operation1;operation2;...} ..{ }.. { }
//examples:
//  {objectRed.lc; date(hh:mm)} .. {h:height; w:width; Math.max(20, Math.sqrt(h*h + w*w))} ...
//  "color={objectRed;/(100);*(255);HEX2}"
//
//Return array of object
//   {visOid     - 'objectRed.val' 
//    systemOid  - 'objectRed'
//    token      - '{objectRed;/(100);*(255);HEX2}'
//    operations[] - {op, arg[], formula}...
//    format     - 'color={objectRed;/(100);*(255);HEX2}'
//    isSeconds  - false
//later next fields are added:  
//    type - 'date'|'style'  
//    attr - 
//    view - 
//    widget - 
//  }
function extractBinding(format) {
    var oid = format.match(/{(.+?)}/g);
    var result = null;
    if (oid) {
        if (oid.length > 50) {
            console.warn('Too many bindings in one widget: ' + oid.length + '[max = 50]');
        }
        for (var p = 0; p < oid.length && p < 50; p++) {
            var _oid = oid[p].substring(1, oid[p].length - 1);
            if (_oid[0] === '{') continue;
            // If first symbol '"' => it is JSON
            if (_oid && _oid[0] === '"') continue;
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
                        visOid: visOid,
                        systemOid: systemOid
                    }]
                });
            }

            for (var u = 1; u < parts.length; u++) {
                // eval construction
                if (isEval) {
                    if (parts[u].trim().match(/^[\d\w_]+:\s?[-.\d\w_]+$/)) {//parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
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
                    var parse = parts[u].match(/([\w\s\/+*-]+)(\(.+\))?/);  //Examples:  *(256); HEX2; date(hh:mm); array(value1,value2) 
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
                        } else
                        // operators without parameter
                        {
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

//**********************************************************************************/
//Helper  for finding Group of widget(wid) 
//avoids repeated searches for a single widget
function GroupHelper(views){
    this.views = views;
    this.view = null;
    this.wid = null;
    this.groupwid = null; 
    this.tryFound = false
    
    //reset props for new widget id 
    this.initforWidget = function(view, wid){
        this.view = view;
        this.wid = wid;
        this.groupwid = null;
        this.tryFound = false
    }  

    this.tryGetGroupID = function(){
        if ((this.groupwid==null) && !this.tryFound){
            this.groupwid = getWidgetGroup(this.views, this.view, this.wid);
            this.tryFound = true;
            
            if (this.groupwid)
               this.views[this.view].widgets[this.wid].groupid = this.groupwid;                  
         }

    } 
    //Checking widget attribute value for presence of "groupAttr". if so then replace to actual value
    //If groupAttr Index wrone, then return "groupAttrN" -> "undefine"
    this.checkValue = function(value) {
        let result=value;

        if (value.indexOf('groupAttr')>=0){
        
            this.tryGetGroupID();

            if (this.groupwid) {
                let res = replaceGroupAttr(value, this.views[this.view].widgets[this.groupwid].data); //Если индекс группы не найден то должен вернуть undefine
                if (res.doesMatch) {
                    result = res.newString;
            }
         }
        }
        else 
        if (this.views[this.view].widgets[this.wid].grouped &&
           !this.views[this.view].widgets[this.wid].groupid){
            this.tryGetGroupID();
           }


        return result;
    }
}

/************************************************************** */
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
    
    //helper to optimize gettting(replacing) "groupAttr" for one widget
    let groupHelper = new GroupHelper(views);

    for (view in views) {
        if (!views.hasOwnProperty(view)) continue;

        if (view === '___settings') continue;

        if (_views) _views[view] = [];

        for (id in views[view].widgets) {
            if (!views[view].widgets.hasOwnProperty(id)) continue;
           
            // Check all attributes
            var data  = views[view].widgets[id].data;
            var style = views[view].widgets[id].style;

            {//Region for version compatibility
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
            }//region end
            
            //Begin handling next widget model
            groupHelper.initforWidget(view, id);

            //define common finction to adding to subscribing Arrays
            function sub_AddtoSubscribingArray(tagid, bindObj){
            
                //if (tagid.indexOf('local_')===0) return;   //adding because "local_" need for getting it state  in subscribeStates method 
                if (tagid.indexOf('groupAttr')===0) return;  //skip. we prevent subscribe  

                if (IDs.indexOf(tagid) === -1) IDs.push(tagid);
                if (_views && _views[view].indexOf(tagid) === -1) _views[view].push(tagid);   

                if (bindObj){
                    if (!bindings[tagid]) bindings[tagid] = [];
                    bindings[tagid].push(bindObj);
                }            
            }    

            //define common finction to check binging format
            function sub_CheckBindingPresent(attrValue, attr, typeId) {
                var res=false;
            
                attrValue = groupHelper.checkValue(attrValue); //Check attrValue for "groupAttr" and replace it
            
                var oids = extractBinding(attrValue);
                if (oids) {
                    res=true;
                    
                    for (var t = 0; t < oids.length; t++) {
                        var ssid = oids[t].systemOid;
                        if (ssid) {
                            oids[t].type = typeId;
                            oids[t].attr = attr;
                            oids[t].view = view;
                            oids[t].widget = id;

                            sub_AddtoSubscribingArray(ssid, oids[t]);
                        }
            
                        if (oids[t].operations && oids[t].operations[0].arg instanceof Array) {
                            for (var ww = 0; ww < oids[t].operations[0].arg.length; ww++) {
                                let opssid = oids[t].operations[0].arg[ww].systemOid;
                                if (opssid && opssid !== ssid) 
                                    sub_AddtoSubscribingArray(opssid,oids[t]);
                            }
                        }
                    }
                }
            
             return res;
            }

            //check all widget attributes 
            for (var attr in data) {
                if (!data.hasOwnProperty(attr) || !attr) continue;
                /* TODO DO do not forget remove it after a while. Required for import from DashUI */
                
                { //region
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
                }//region end 

                var attrValue = data[attr];
                var savedValue = attrValue;

                if (typeof attrValue === 'string') {
                  
                    //try find {xxx} templates in string widget attribute       
                    if (sub_CheckBindingPresent(attrValue, attr, 'data'))
                    {
                        //done. added to binding collections  
                    }
                    else
                    //try check "oid" attributes  
                    if (attr !== 'oidTrueValue'  && 
                        attr !== 'oidFalseValue' && 
                        attrValue &&
                        (attr.match(/oid\d{0,2}$/) || attr.match(/^oid/) || attr.match(/^signals-oid-/) || attr === 'lc-oid')
                       ){
                        if (attrValue !== 'nothing_selected') {

                            attrValue = groupHelper.checkValue(attrValue);  //check value for "groupAttr" and if is replace it
                            sub_AddtoSubscribingArray(attrValue);
                            
                            if (!vis.editMode &&(savedValue != attrValue)) //for run mode, if "groupAttr" changed to realTag
                                data[attr]=attrValue;
                        }

                        // Visibility binding
                        if (attr === 'visibility-oid') {
                            attrValue = groupHelper.checkValue(attrValue); 

                            if (!visibility[attrValue]) visibility[attrValue] = [];
                            visibility[attrValue].push({
                                    view: view,
                                    widget: id
                            });
                        }

                        // Signal binding
                        if (attr.match(/^signals-oid-/) ) {
                            attrValue = groupHelper.checkValue(attrValue); 

                            if (!signals[attrValue]) signals[attrValue] = [];
                            signals[attrValue].push({
                                view:   view,
                                widget: id,
                                index:  parseInt(attr.substring('signals-oid-'.length), 10)
                            });
                        }
                        // lastChanges
                        if (attr === 'lc-oid') {
                            attrValue = groupHelper.checkValue(attrValue); 

                            if (!lastChanges[attrValue]) lastChanges[attrValue] = [];
                            lastChanges[attrValue].push({
                                view:   view,
                                widget: id
                            });
                        }
                    } else{
                        var m;
                        // attribute has type="id" (using for groups attr)
                        if ((m = attr.match(/^attrType(\d+)$/)) && data[attr] === 'id') {
                            var _id = 'groupAttr' + m[1];
                            if (data[_id]) 
                                sub_AddtoSubscribingArray(data[_id]);
                        }
                    }
                }
            }

            // build bindings for styles
            if (style) {
                for (var cssAttr in style) {
                    if (!style.hasOwnProperty(cssAttr) || !cssAttr) continue;
                    if (typeof style[cssAttr] === 'string') {
                        sub_CheckBindingPresent(style[cssAttr], cssAttr,'style');
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
