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

import React from 'react';
import PropTypes from 'prop-types';
import { Types } from 'iobroker.type-detector';

import VisRxWidget from '../../visRxWidget';
//import SmartTile from './material/SmartTile/SmartTile';

class MaterialSwitch extends VisRxWidget {
    constructor(props) {
        super(props);

        this.mainId = 'nothing_selected';
        this.name = 'My Switch';

        // prepare channelInfo
        this.channelInfo = {
            states: [
                { name: 'SET', id: this.mainId },
                { name: 'ACTUAL' },
            ],
            type: Types.light,
        };

        const parentId = MaterialSwitch.getParentId(this.mainId);
        // simulate objects
        this.objects = {
            [parentId]: {
                type: 'device',
                common: {
                    name: this.name,
                },
            },
        };
    }

    static getParentId(id) {
        const pos = id.lastIndexOf('.');
        if (pos !== -1) {
            return id.substring(0, pos);
        }
        return id;
    }

    static getWidgetInfo() {
        return {
            id: 'tplMWSwitch',
            visSet: 'material-widgets',
            visName: 'Switch',
            visAttrs: 'oid;battery-oid',
            visPrev: 'widgets/material-widgets/img/prev_switch.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return MaterialSwitch.getWidgetInfo();
    }

    componentDidMount() {
        super.componentDidMount();
        this.props.socket.getSystemConfig()
            .then(systemConfig => {
                this.setState({ systemConfig, ready: true });
            });
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        if (!this.state.ready) {
            return null;
        }

        return <div></div>;
        /*return <SmartTile
            editMode={false}
            socket={this.props.socket}
            systemConfig={this.state.systemConfig}
            themeType="dark"
            doNavigate={() =>
                console.log('Navigate')}
        />;*/
    }
}

MaterialSwitch.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default MaterialSwitch;
