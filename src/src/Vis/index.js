import React from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/selectable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/widgets/selectable';
import 'jquery-ui/ui/widgets/progressbar';
import 'jquery-ui/ui/widgets/dialog';
import './lib/can.custom.min.js';
import './visWords';
import './visUtils';
import Vis from './vis';
import VisWidget from './visWidget';

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.jQuery = $;
        window.$ = $;
        window.systemDictionary = {};

        this.state = {
            ready: false,
            editMode: !!props.editMode,
        };
        this.views = JSON.stringify(props.views);

        this.divRef = React.createRef();

        const visConfig = {
            widgetSets: [
                {
                    name: 'bars',
                    depends: [],
                },
                'basic',
                'dwd',
                'echarts',
                'eventlist',
                { name: 'google-fonts', always: true },
                'jqplot',
                {
                    name: 'jqui',
                    depends: [
                        'basic',
                    ],
                },
                {
                    name: 'metro',
                    depends: [
                        'jqui-mfd',
                        'basic',
                    ],
                },
                'swipe',
                'tabs',
            ],
        };

        this.vis = new Vis({
            $: window.jQuery,
            can: window.can,
            views: props.views,
            visConfig,
            lang: props.lang || 'en',
            socket: props.socket,
            _: window._,
        });

        window.vis = this.vis;
        this.can = window.can;

        this.bindings = {};
        this.subscribes = {};

        this.initCanObjects();

        this.loadWidgets()
            .then(() => this.setState({ ready: true }));
    }

    initCanObjects() {
        // creat Can objects
        this.canStates = new this.can.Map({ 'nothing_selected.val': null });

        if (this.state.editMode) {
            this.canStates.__attrs = this.canStates.attr; // save original attr

            const that = this;
            this.canStates.attr = function (attr, val) {
                const type = typeof attr;
                if (type !== 'string' && type !== 'number') {
                    // allow only dev1, dev2, ... to be bound
                    if (Object.keys(attr).find(o => o && o.match(/^dev\d+(.val|.ack|.tc|.lc)+/))) {
                        return this.__attrs(attr, val);
                    }
                } else if (arguments.length === 1 && attr) {
                    if (attr.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                        this.can.__reading(this, attr);
                        return this._get(attr);
                    }
                    return that.canStates[attr];
                } else {
                    console.log('This is ERROR!');
                    this._set(attr, val);
                    return this;
                }
            };

            // binding
            this.canStates.___bind = this.canStates.bind; // save original bind
            this.canStates.bind = function (id, callback) {
                // allow only dev1, dev2, ... to be bound
                if (id && id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                    return this.___bind(id, callback);
                }
                // console.log('ERROR: binding in edit mode is not allowed on ' + id);
            };
        }
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        const views = JSON.stringify(nextProps.views);
        if (views !== this.views) {
            this.views = views;
            this.vis.updateViews(JSON.parse(JSON.stringify(nextProps.views)));
        }

        if (nextProps.editMode !== this.state.editMode) {
            this.vis.setEditMode(nextProps.editMode);
            this.setState({ editMode: nextProps.editMode });
        }
    }

    static setInnerHTML(elm, html) {
        elm.innerHTML = html;
        const loadPromises = [];
        Array.from(elm.querySelectorAll('script'))
            .forEach(oldScript => {
                const newScript = document.createElement('script');
                let onLoad = false;
                Array.from(oldScript.attributes)
                    .forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                        if (attr.name === 'src') {
                            onLoad = true;
                        }
                    });

                if (onLoad) {
                    const promise = new Promise(resolve => newScript.onload = resolve);
                    loadPromises.push(promise);
                }

                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

        return Promise.all(loadPromises);
    }

    loadWidgets() {
        return fetch('widgets.html')
            .then(data => data.text())
            .then(text => {
                const div = document.createElement('div');
                document.body.appendChild(div);

                return VisEngine.setInnerHTML(div, text)
                    .then(() => {
                        console.log('Loaded');
                        this.props.onLoaded && this.props.onLoaded();
                    });
            })
            .catch(error =>
                console.error(`Cannot load widgets: ${error}`));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.divRef.current) {
            this.vis.main(this.divRef.current);
        }
    }

    onStateChange = (id, state) => {
        console.log(`onStateChange: ${id} = ${JSON.stringify(state)}`);
    }

    subscribe = IDs => {
        if (!Array.isArray(IDs)) {
            IDs = [IDs];
        }
        IDs.forEach(id => {
            if (this.subscribes[id]) {
                this.subscribes[id]++;
            } else {
                this.subscribes[id] = 1;
                this.props.socket.subscribeState(id, this.onStateChange);
                this.createCanState(id);
            }
        });
    }

    createCanState(id) {
        const _val = `${id}.val`;

        const now = Date.now();

        const bindings = this.bindings[id];
        const obj = {};
        let created;

        if (this.canStates[_val] === undefined || this.canStates[_val] === null) {
            created = true;
            if (this.state.editMode) {
                this.canStates[_val] = 'null';
                this.canStates[`${id}.ts`] = now;
                this.canStates[`${id}.ack`] = false;
                this.canStates[`${id}.lc`] = now;
            } else {
                // set all together
                obj[_val] = 'null';
                obj[`${id}.ts`] = now;
                obj[`${id}.ack`] = false;
                obj[`${id}.lc`] = now;
            }
        }

        // Check if some bindings installed for this widget
        if (!this.state.editMode && bindings && (created || id === 'username' || id === 'login')) {
            for (let b = 0; b < bindings.length; b++) {
                const widget = this.views[bindings[b].view].widgets[bindings[b].widget];
                widget[bindings[b].type][bindings[b].attr] =
                    this.formatBinding(bindings[b].format, bindings[b].view, bindings[b].widget, widget);
            }
        }

        if (!this.state.editMode) {
            try {
                this.canStates.attr(obj);
            } catch (e) {
                this.socket.log(`Error: can't create states objects (${e})`, 'error');
            }
        }
    }

    unsubscribe = IDs => {
        IDs.forEach(id => {
            if (this.subscribes[id]) {
                this.subscribes[id]--;
                if (!this.subscribes[id]) {
                    this.props.socket.unsubscribeState(id, this.onStateChange);
                    delete this.subscribes[id];
                }
            }
        });
    }

    render() {
        if (!this.state.ready) {
            return null;
        } else {
            return <div id="vis_container" ref={this.divRef} style={{ width: '100%', height: '100%' }} />;
            const widgets = this.props.views[this.props.activeView]?.widgets;
            if (widgets) {
                return Object.keys(widgets).map(id => <VisWidget
                    key={id}
                    id={id}
                    options={widgets[id]}
                    view={this.props.activeView}
                    views={this.props.views}
                    subscribe={this.subscribe}
                    unsubscribe={this.unsubscribe}
                />);
            } else {
                return null;
            }
        }
    }
}

VisEngine.propTypes = {
    onLoaded: PropTypes.func,
    socket: PropTypes.object.isRequired,
    views: PropTypes.object,
    activeView: PropTypes.string,
    editMode: PropTypes.bool,
    lang: PropTypes.string,
};

export default VisEngine;
