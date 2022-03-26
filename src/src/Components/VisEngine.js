import React from 'react';
import jQuery from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/selectable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/widgets/selectable';
import PropTypes from 'prop-types';

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.vis = {
            binds: {

            },
            navChangeCallbacks: [],
        };
        window.jQuery = jQuery;
        window.$ = jQuery;
        window.systemDictionary = {};
        this.loadWidgets();
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

    render() {
        return <div>

        </div>;
    }
}

VisEngine.propTypes = {
    onLoaded: PropTypes.func,
};

export default VisEngine;
