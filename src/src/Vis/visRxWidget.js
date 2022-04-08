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

import PropTypes from 'prop-types';
import VisBaseWidget from './visBaseWidget';
import { addClass, getUsedObjectIDsInWidget } from './visUtils';

class VisRxWidget extends VisBaseWidget {
    constructor(props) {
        super(props, true);

        const options = this.getWidgetInfo();

        this.state = {
            ...this.state,
            resizable: options.resizable === undefined ? true : options.resizable,
            resizeHandles: options.resizeHandles === undefined ? this.state.resizeHandles : options.resizeHandles,
            rxData: this.state.data,
            rxStyle: this.state.style,
            values: {},
            visible: true,
            disabled: false,
        };

        this.linkContext = {
            IDs: [],
            bindings: {},
            visibility: {},
            lastChanges: {},
            signals: {},
        };

        getUsedObjectIDsInWidget(props.views, props.view, props.id, this.linkContext);

        this.onStateChangedBind = this.onStateChanged.bind(this);
    }

    onStateChanged(id, state) {
        const newState = {
            values: JSON.parse(JSON.stringify(this.state.values)),
            rxData: { ...this.state.data },
            rxStyle: { ...this.state.style },
            applyBindings: false,
        };

        id && state && Object.keys(state).forEach(attr => newState.values[`${id}.${attr}`] = state[attr]);

        Object.keys(this.linkContext.bindings).forEach(_id => this.applyBinding(_id, newState));

        newState.visible = this.checkVisibility(id, newState);
        const userGroups = newState.rxData['visibility-groups'];
        newState.disabled = false;

        if (userGroups && userGroups.length && !this.isUserMemberOfGroup(this.props.user, userGroups)) {
            if (newState.rxData['visibility-groups-action'] === 'disabled') {
                newState.disabled = true;
            } else {
                // newState.rxData['visibility-groups-action'] === 'hide'
                newState.visible = false;
            }
        }

        this.setState(newState);
    }

    applyBinding(stateId, newState) {
        this.linkContext.bindings[stateId] && this.linkContext.bindings[stateId].forEach(item => {
            const value = this.props.formatUtils.formatBinding(
                item.format,
                item.view,
                this.props.id,
                this.props.views[item.view].widgets[this.props.id],
                newState.rxData,
                newState.values,
            );

            if (item.type === 'data') {
                newState.rxData[item.attr] = value;
            } else {
                newState.rxStyle[item.attr] = value;
            }
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.linkContext.IDs.forEach(oid => this.props.socket.subscribeState(oid, this.onStateChangedBind));
    }

    componentWillUnmount() {
        this.linkContext.IDs.forEach(oid => this.props.socket.unsubscribeState(oid, this.onStateChangedBind));
        super.componentWillUnmount();
    }

    checkVisibility(stateId, newState) {
        if (!this.editMode) {
            if (!this.isWidgetFilteredOut(newState.rxData)) {
                if (this.linkContext.visibility[stateId]) {
                    return this.isWidgetHidden(newState.rxData, newState.values);
                }
            } else {
                return false;
            }
        }

        return true;
    }

    onPropertiesUpdated() {
        const oldIDs = this.linkContext.IDs;
        this.linkContext = {
            IDs: [],
            bindings: {},
            visibility: {},
            lastChanges: {},
            signals: {},
        };
        // extract bindings anew as data or style were changes
        getUsedObjectIDsInWidget(this.props.views, this.props.view, this.props.id, this.linkContext);

        // subscribe on some new IDs and remove old IDs
        const unsubscribe = oldIDs.filter(id => !this.linkContext.IDs.includes(id));
        unsubscribe.forEach(id => this.props.socket.unsubscribeState(id, this.onStateChangedBind));

        const subscribe = this.linkContext.IDs.filter(id => !oldIDs.includes(id));
        subscribe.forEach(id => this.props.socket.subscribeState(id, this.onStateChangedBind));

        this.onStateChanged();
    }

    renderWidgetBody(props) {
        props.id = this.props.id;

        props.className = `vis-widget ${this.state.rxData.class || ''}`;

        if (this.props.isRelative) {
            props.style.position = 'relative';
        } else {
            props.style.position = 'absolute';
        }

        if (!this.state.editMode && this.state.disabled) {
            props.className = addClass(props.className, 'vis-user-disabled');
        }

        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = this.state.rxStyle[attr];
            attr = attr.replace(/(-\w)/g, text => text[1].toLowerCase());
            props.style[attr] = value;
        });

        if (this.props.editMode) {
            const zIndex = parseInt((this.state.rxStyle['z-index'] || 0), 10);
            if (this.state.selected) {
                // move widget to foreground
                props.style.zIndex = 800 + zIndex;
            } else {
                props.style.zIndex = zIndex;
            }
        }
    }

    render() {
        if (!this.state.visible) {
            return null;
        }

        if (this.state.applyBindings && !this.bindingsTimer) {
            this.bindingsTimer = setTimeout(() => {
                this.bindingsTimer = null;
                this.onPropertiesUpdated();
            }, 10);
        }

        return super.render();
    }
}

VisRxWidget.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    id: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    views: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    view: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    can: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    canStates: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    editMode: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    runtime: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    userGroups: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    user: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    allWidgets: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    jQuery: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    socket: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    isRelative: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    viewsActiveFilter: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setValue: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    $$: PropTypes.func, // Gestures library
    // eslint-disable-next-line react/no-unused-prop-types
    refParent: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    linkContext: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    formatUtils: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    selectedWidgets: PropTypes.array,
    // eslint-disable-next-line react/no-unused-prop-types
    setSelectedWidgets: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    mouseDownOnView: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    registerRef: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    onWidgetsChanged: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    showWidgetNames: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    editGroup: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    VisView: PropTypes.any,

    // eslint-disable-next-line react/no-unused-prop-types
    adapterName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    instance: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectName: PropTypes.string.isRequired,
};

export default VisRxWidget;
