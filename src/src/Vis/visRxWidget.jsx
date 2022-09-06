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

        const widgetAttrInfo = {};
        // collect all attributes (only types)
        if (Array.isArray(options.visAttrs)) {
            options.visAttrs.forEach(group =>
                group.fields && group.fields.forEach(item => {
                    widgetAttrInfo[item.name] = { type: item.type };
                }));
        }

        this.linkContext = {
            IDs: [],
            bindings: {},
            visibility: {},
            lastChanges: {},
            signals: {},
            widgetAttrInfo,
        };

        getUsedObjectIDsInWidget(props.views, props.view, props.id, this.linkContext);

        this.onStateChangedBind = this.onStateChanged.bind(this);

        // apply bindings and modifications
        const newState = this.onStateChanged(null, null, true);

        this.resizeLocked = options.visResizeLocked;

        this.state = {
            ...this.state,
            resizable: options.resizable === undefined ? (options.visResizable === undefined ? true : options.visResizable) : options.resizable,
            draggable: options.visDraggable === undefined ? true : options.visDraggable,
            resizeHandles: options.resizeHandles === undefined ? (options.visResizeHandles === undefined ? ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'] : options.visResizeHandles) : options.resizeHandles,
            rxData: newState.rxData,
            rxStyle: newState.rxStyle,
            values: {},
            visible: true,
            disabled: false,
        };
    }

    onCommand(command, options) {
        if (!super.onCommand(command, options)) {
            if (command === 'collectFilters') {
                return this.state.rxData?.filterkey;
            }

            if (command === 'changeFilter') {
                const visible = this.checkVisibility();
                if (visible !== this.state.visible) {
                    this.setState({ visible });
                }
                /*
                if (!options || !options.filter.length) {
                    // just show

                } else if (options.filter[0] === '$') {
                    // hide all
                    if (this.state.rxData.filterkey) {
                        this.setState({ visible: false });
                    }
                } else {
                    const wFilters = this.state.rxData.filterkey;

                    if (wFilters) {
                        const found = wFilters.find(f => options.filter.includes(f));

                        if (!found) {
                            this.setState({ visible: false });
                        } else  {
                            const visible = this.checkVisibility();
                            if (visible !== this.state.visible) {
                                this.setState({ visible });
                            }
                        }
                    }
                }
                */
            }
        }

        return null;
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onStateUpdated(id, state) {

    }

    onStateChanged(id, state, doNotApplyState) {
        this.newState = this.newState || {
            values: JSON.parse(JSON.stringify(this.state.values || {})),
            rxData: { ...this.state.data },
            rxStyle: { ...this.state.style },
            applyBindings: false,
        };

        delete this.newState.rxData._originalData;
        delete this.newState.rxStyle._originalData;

        if (id && state) {
            Object.keys(state).forEach(attr => this.newState.values[`${id}.${attr}`] = state[attr]);
            this.onStateUpdated(id, state);
        }

        Object.keys(this.linkContext.bindings).forEach(_id => this.applyBinding(_id, this.newState));

        this.newState.visible = this.checkVisibility(id, this.newState);
        const userGroups = this.newState.rxData['visibility-groups'];
        this.newState.disabled = false;

        if (this.newState.rxData.filterkey && typeof this.newState.rxData.filterkey === 'string') {
            this.newState.rxData.filterkey = this.newState.rxData.filterkey.split(/[;,]+/).map(f => f.trim()).filter(f => f);
        }

        if (userGroups && userGroups.length && !this.isUserMemberOfGroup(this.props.user, userGroups)) {
            if (this.newState.rxData['visibility-groups-action'] === 'disabled') {
                this.newState.disabled = true;
            } else {
                // newState.rxData['visibility-groups-action'] === 'hide'
                this.newState.visible = false;
            }
        }

        if (doNotApplyState) {
            const newState = this.newState;
            this.newState = null;
            return newState;
        }

        this.updateTimer && clearTimeout(this.updateTimer);

        // compare
        if (JSON.stringify(this.state.values) !== JSON.stringify(this.newState.values) ||
            JSON.stringify(this.state.rxData) !== JSON.stringify(this.newState.rxData) ||
            JSON.stringify(this.state.rxStyle) !== JSON.stringify(this.newState.rxStyle) ||
            JSON.stringify(this.state.applyBindings) !== JSON.stringify(this.newState.applyBindings)
        ) {
            this.updateTimer = setTimeout(() => {
                this.updateTimer = null;
                const newState = this.newState;
                this.newState = null;
                this.setState(newState);
            }, 50);
        } else {
            this.newState = null;
        }

        return null;
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

    async componentDidMount() {
        super.componentDidMount();
        for (let i = 0; i < this.linkContext.IDs.length; i++) {
            await this.props.socket.subscribeState(this.linkContext.IDs[i], this.onStateChangedBind);
        }
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onRxDataChanged(prevRxData) {

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState && JSON.stringify(this.state.rxData) !== JSON.stringify(prevState.rxData)) {
            this.onRxDataChanged(prevState.rxData);
        }
    }

    async componentWillUnmount() {
        for (let i = 0; i < this.linkContext.IDs.length; i++) {
            await this.props.socket.unsubscribeState(this.linkContext.IDs[i], this.onStateChangedBind);
        }
        super.componentWillUnmount();
    }

    checkVisibility(stateId, newState) {
        newState = newState || this.state;
        if (!this.state.editMode) {
            if (!this.isWidgetFilteredOut(newState.rxData)) {
                if (stateId) {
                    if (this.linkContext.visibility[stateId]) {
                        return !this.isWidgetHidden(newState.rxData, newState.values);
                    }
                } else {
                    // check if visible
                    return !this.isWidgetHidden(newState.rxData, newState.values);
                }
            } else {
                return false;
            }
        }

        return true;
    }

    async onPropertiesUpdated() {
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
        for (let i = 0; i < unsubscribe.length; i++) {
            await this.props.socket.unsubscribeState(unsubscribe[i], this.onStateChangedBind);
        }

        const subscribe = this.linkContext.IDs.filter(id => !oldIDs.includes(id));
        for (let i = 0; i < subscribe.length; i++) {
            await this.props.socket.subscribeState(subscribe[i], this.onStateChangedBind);
        }

        this.onStateChanged();
    }

    renderWidgetBody(props) {
        props.id = this.props.id;

        props.className = `vis-widget${this.state.rxData.class ? ` ${this.state.rxData.class}` : ''}`;

        if (!this.state.editMode && this.state.disabled) {
            props.className = addClass(props.className, 'vis-user-disabled');
        }

        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = this.state.rxStyle[attr];
            if (value !== null && value !== undefined) {
                attr = attr.replace(
                    /(-\w)/g,
                    text => text[1].toUpperCase(),
                );
                props.style[attr] = value;
            }
        });

        if (this.props.isRelative) {
            props.style.position = this.state.rxStyle.position || 'relative';
            delete props.style.top;
            delete props.style.left;
        } else {
            props.style.position = 'absolute';
        }

        // by default, it is border-box
        if (!this.state.rxStyle['box-sizing']) {
            props.style.boxSizing = 'border-box';
        }

        if (this.state.editMode) {
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
        if (!this.state.visible && !this.state.editMode) {
            return null;
        }

        if (this.state.applyBindings && !this.bindingsTimer) {
            this.bindingsTimer = setTimeout(async () => {
                this.bindingsTimer = null;
                await this.onPropertiesUpdated();
            }, 10);
        }

        // restore visibility in editMode
        if (this.state.editMode && this.filterDisplay !== undefined && this.refService.current) {
            this.refService.current.style.display = this.filterDisplay;
            delete this.filterDisplay;
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
