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

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.jQuery = $;
        window.$ = $;
        window.systemDictionary = {};

        this.state = {
            ready: false,
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

        this.loadWidgets()
            .then(() => this.setState({ ready: true }));
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        const views = JSON.stringify(nextProps.views);
        if (views !== this.views) {
            this.views = views;
            this.vis.updateViews(JSON.parse(JSON.stringify(nextProps.views)));
        }
    }

    static setInnerHTML(elm, html) {
        elm.innerHTML = html;
        Array.from(elm.querySelectorAll('script'))
            .forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes)
                    .forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
    }

    loadWidgets() {
        return fetch('widgets.html')
            .then(data => data.text())
            .then(text => {
                const div = document.createElement('div');
                document.body.appendChild(div);
                console.log('Loaded');
                VisEngine.setInnerHTML(div, text);
                this.props.onLoaded && this.props.onLoaded();
            })
            .catch(error =>
                console.error(`Cannot load widgets: ${error}`));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.divRef.current) {
            this.vis.main(this.divRef.current);
        }
    }

    render() {
        if (!this.state.ready) {
            return null;
        } else {
            return <div id="vis_container" ref={this.divRef} style={{width: '100%', height: '100%'}} />;
        }
    }
}

VisEngine.propTypes = {
    onLoaded: PropTypes.func,
    socket: PropTypes.object.isRequired,
    views: PropTypes.object,
    lang: PropTypes.string,
};

export default VisEngine;
