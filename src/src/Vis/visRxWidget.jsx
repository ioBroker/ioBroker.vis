/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
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

import {
    Card,
    CardContent,
} from '@mui/material';

import { I18n, Icon } from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisBaseWidget from './visBaseWidget';
import { addClass, getUsedObjectIDsInWidget } from './visUtils';
import { calculateOverflow } from './utils';

const POSSIBLE_MUI_STYLES = [
    'background-color',
    'border',
    'background',
    'background-image',
    'background-position',
    'background-repeat',
    'background-size',
    'background-clip',
    'background-origin',
    'color',
    'box-sizing',
    'border-width',
    'border-style',
    'border-color',
    'border-radius',
    'box-shadow',
    'text-align',
    'text-shadow',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'font-style',
    'font-variant',
    'letter-spacing',
    'word-spacing',
];

class VisRxWidget extends VisBaseWidget {
    static POSSIBLE_MUI_STYLES = POSSIBLE_MUI_STYLES;

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

        getUsedObjectIDsInWidget(props.context.views, props.view, props.id, this.linkContext);

        // do not change it to lambda function as onStateChanged could be inherited.
        this.onStateChangedBind = this.onStateChanged.bind(this);

        // apply bindings and modifications
        const newState = this.onStateChanged(null, null, true);

        this.resizeLocked = options.visResizeLocked;

        // find in fields visResizable name
        // if resizable exists, take the resizable from data
        this.visDynamicResizable = VisRxWidget.findField(options, 'visResizable');
        if (this.visDynamicResizable) {
            this.visDynamicResizable = { default: this.visDynamicResizable.default !== undefined ? this.visDynamicResizable.default : true, desiredSize: this.visDynamicResizable.desiredSize };
        } else {
            this.visDynamicResizable = null;
        }

        this.state = {
            ...this.state,
            resizable: options.resizable === undefined ? (options.visResizable === undefined ? true : options.visResizable) : options.resizable,
            draggable: options.visDraggable === undefined ? true : options.visDraggable,
            resizeHandles: options.resizeHandles === undefined ? (options.visResizeHandles === undefined ? ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'] : options.visResizeHandles) : options.resizeHandles,
            rxData: newState.rxData,
            rxStyle: newState.rxStyle,
            /** @type {Record<string, any>} */
            values: {},
            visible: newState.visible,
            disabled: false,
        };
    }

    static findField(widgetInfo, name) {
        if (!widgetInfo.visAttrs) {
            return null;
        }
        for (let g = 0; g < widgetInfo.visAttrs.length; g++) {
            const group = widgetInfo.visAttrs[g];
            if (group.fields) {
                for (let f = 0; f < group.fields.length; f++) {
                    if (group.fields[f].name === name) {
                        return group.fields[f];
                    }
                }
            }
        }

        return null;
    }

    static getI18nPrefix() {
        return '';
    }

    static getText(text) {
        if (typeof text === 'object') {
            return text[I18n.getLanguage()] || text.en;
        }

        return text;
    }

    static t(key, ...args) {
        if (this.getI18nPrefix) {
            return I18n.t(`${this.getI18nPrefix()}${key}`,  ...args);
        }

        return I18n.t(key);
    }

    static getLanguage() {
        return I18n.getLanguage();
    }

    onCommand(command, options) {
        const result = super.onCommand(command, options);
        if (result === false) {
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

        return result;
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onStateUpdated(id, state) {

    }

    onStateChanged(id, state, doNotApplyState) {
        this.newState = this.newState || {
            values: JSON.parse(JSON.stringify(this.state.values || {})),
            rxData: { ...this.state.data },
            rxStyle: { ...this.state.style },
            editMode: this.props.editMode,
            applyBindings: false,
        };

        delete this.newState.rxData._originalData;
        delete this.newState.rxStyle._originalData;

        if (id && state) {
            Object.keys(state).forEach(attr => this.newState.values[`${id}.${attr}`] = state[attr]);
            // wait till the state is saved in this.newState.values
            setTimeout(() => this.onStateUpdated(id, state), 60);
        }

        Object.keys(this.linkContext.bindings).forEach(_id => this.applyBinding(_id, this.newState));

        this.newState.visible = this.checkVisibility(id, this.newState);
        const userGroups = this.newState.rxData['visibility-groups'];
        this.newState.disabled = false;

        if (this.newState.rxData.filterkey && typeof this.newState.rxData.filterkey === 'string') {
            this.newState.rxData.filterkey = this.newState.rxData.filterkey.split(/[;,]+/).map(f => f.trim()).filter(f => f);
        }

        if (userGroups && userGroups.length && !this.isUserMemberOfGroup(this.props.context.user, userGroups)) {
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
            const value = this.props.context.formatUtils.formatBinding({
                format: item.format,
                view: item.view,
                wid: this.props.id,
                widget: this.props.context.views[item.view].widgets[this.props.id],
                widgetData: newState.rxData,
                values: newState.values,
                moment: this.props.context.moment,
            });

            if (item.type === 'data') {
                newState.rxData[item.attr] = value;
            } else {
                newState.rxStyle[item.attr] = value;
            }
        });
    }

    async componentDidMount() {
        super.componentDidMount();
        this.linkContext.IDs.length && (await this.props.context.socket.subscribeState(this.linkContext.IDs, this.onStateChangedBind));
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onRxDataChanged(prevRxData) {

    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onRxStyleChanged(prevRxData) {

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState) {
            if (JSON.stringify(this.state.rxData) !== JSON.stringify(prevState.rxData)) {
                this.onRxDataChanged(prevState.rxData);
            }
            if (JSON.stringify(this.state.rxStyle) !== JSON.stringify(prevState.rxStyle)) {
                this.onRxStyleChanged(prevState.rxStyle);
            }
        }
    }

    async componentWillUnmount() {
        this.linkContext.IDs.length && (await this.props.context.socket.unsubscribeState(this.linkContext.IDs, this.onStateChangedBind));
        super.componentWillUnmount();
    }

    checkVisibility(stateId, newState) {
        newState = newState || this.state;
        if (!this.state.editMode) {
            if (!this.isWidgetFilteredOut(newState.rxData)) {
                if (stateId) {
                    if (this.linkContext.visibility[stateId]) {
                        return !VisBaseWidget.isWidgetHidden(newState.rxData, newState.values, this.props.id);
                    }
                } else {
                    // check if visible
                    return !VisBaseWidget.isWidgetHidden(newState.rxData, newState.values, this.props.id);
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
            widgetAttrInfo: this.linkContext.widgetAttrInfo,
        };

        const context = this.props.context;

        // extract bindings anew as data or style was changes
        getUsedObjectIDsInWidget(
            context.views,
            this.props.view,
            this.props.id,
            this.linkContext,
        );

        // subscribe on some new IDs and remove old IDs
        const unsubscribe = oldIDs.filter(id => !this.linkContext.IDs.includes(id));
        unsubscribe.length && (await context.socket.unsubscribeState(unsubscribe, this.onStateChangedBind));

        const subscribe = this.linkContext.IDs.filter(id => !oldIDs.includes(id));
        subscribe.length && (await context.socket.subscribeState(subscribe, this.onStateChangedBind));

        this.onStateChanged();
    }

    formatValue(value, round) {
        if (typeof value === 'number') {
            if (round === 1) {
                value = Math.round(value * 10) / 10;
            } else if (round === 0) {
                value = Math.round(value);
            } else {
                value = Math.round(value * 100) / 100;
            }
            if (this.props.context.systemConfig?.common?.isFloatComma) {
                value = value.toString().replace('.', ',');
            }
        }

        return value === undefined || value === null ? '' : value.toString();
    }

    // eslint-disable-next-line no-unused-vars
    wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick, components) {
        if (this.props.context.views[this.props.view].widgets[this.props.id].usedInWidget) {
            return content;
        }

        const MyCard = components?.Card || Card;
        const MyCardContent = components?.CardContent || CardContent;

        const style = {
            width: 'calc(100% - 8px)',
            height: 'calc(100% - 8px)',
            margin: 4,
            ...this.props.customSettings?.viewStyle?.visCard,
        };

        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = this.state.rxStyle[attr];
            if (value !== null &&
                value !== undefined &&
                POSSIBLE_MUI_STYLES.includes(attr)
            ) {
                attr = attr.replace(
                    /(-\w)/g,
                    text => text[1].toUpperCase(),
                );
                style[attr] = value;
            }
        });

        this.wrappedContent = true;

        return <MyCard
            className="vis_rx_widget_card"
            style={style}
            onClick={onCardClick}
        >
            <MyCardContent
                className="vis_rx_widget_card_content"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: 'calc(100% - 32px)',
                    paddingBottom: 16,
                    position: 'relative',
                    ...cardContentStyle,
                }}
            >
                {this.state.rxData.widgetTitle ? <div
                    className="vis_rx_widget_card_name"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
                    <div
                        className="vis_rx_widget_card_name_div"
                        style={{
                            fontSize: 24,
                            paddingTop: 0,
                            paddingBottom: 4,
                            ...headerStyle,
                        }}
                    >
                        {this.state.rxData.widgetTitle}
                    </div>
                    {addToHeader || null}
                </div> : (addToHeader || null)}
                {content}
            </MyCardContent>
        </MyCard>;
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
                if (!this.wrappedContent || !POSSIBLE_MUI_STYLES.includes(attr)) {
                    attr = attr.replace(
                        /(-\w)/g,
                        text => text[1].toUpperCase(),
                    );
                    props.style[attr] = value;
                }
            }
        });

        if (this.props.isRelative) {
            props.style.position = this.state.rxStyle.position || 'relative';
            delete props.style.top;
            delete props.style.left;
        } else {
            props.style.position = 'absolute';
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

    getWidgetView(view, props) {
        const context = this.props.context;
        const VisView = context.VisView;
        props = props || {};

        return <VisView
            context={this.props.context}
            viewsActiveFilter={this.props.viewsActiveFilter}
            activeView={view}
            editMode={false}
            key={`${this.props.id}_${view}`}
            askView={this.props.askView}
            view={view}
            visInWidget
            {...props}
        />;
    }

    // eslint-disable-next-line no-unused-vars
    getWidgetInWidget(view, wid, props) {
        props = props || {};

        // old (can) widgets require props.refParent
        return this.props.context.VisView.getOneWidget(props.index || 0, this.props.context.views[view].widgets[wid], {
            // custom attributes
            context: this.props.context,
            editMode: this.state.editMode,
            id: wid,
            isRelative: props.isRelative !== undefined ? props.isRelative : true,
            mouseDownOnView: this.mouseDownOnView,
            moveAllowed: false,
            ignoreMouseEvents: this.state.editMode ? true : this.ignoreMouseEvents,
            onIgnoreMouseEvents: this.props.onIgnoreMouseEvents,
            refParent: props.refParent,
            askView: this.props.askView,
            relativeWidgetOrder: [wid],
            selectedGroup: this.props.selectedGroup,
            selectedWidgets: this.movement?.selectedWidgetsWithRectangle || this.props.selectedWidgets,
            view,
            viewsActiveFilter: this.props.viewsActiveFilter,
            customSettings: this.props.customSettings,
        });
    }

    isSignalVisible(index, val) {
        const oid = this.state.rxData[`signals-oid-${index}`];

        if (oid) {
            if (val === undefined || val === null) {
                val = this.state.values[`${oid}.val`];
            }

            const condition = this.state.rxData[`signals-cond-${index}`];
            let value = this.state.rxData[`signals-val-${index}`];

            if (val === undefined || val === null) {
                return condition === 'not exist';
            }

            if (!condition || value === undefined || value === null) {
                return condition === 'not exist';
            }

            if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
                return false;
            }

            const t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = value === 'true' || value === true || value === 1 || value === '1';
            } else if (t === 'number') {
                value = parseFloat(value);
            } else if (t === 'object') {
                val = JSON.stringify(val);
            }

            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '>=':
                    return val >= value;
                case '<=':
                    return val <= value;
                case '>':
                    return val > value;
                case '<':
                    return val < value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().includes(value);
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return !val.toString().includes(value);
                case 'exist':
                    return value !== 'null';
                case 'not exist':
                    return value === 'null';
                default:
                    console.log(`Unknown signals condition for ${this.props.id}: ${condition}`);
                    return false;
            }
        } else {
            return false;
        }
    }

    static text2style(textStyle, style) {
        if (textStyle) {
            style = style || {};
            const parts = textStyle.split(';');
            parts.forEach(part => {
                const [attr, value] = part.split(':');
                if (attr && value) {
                    // convert attr into camelCase notation
                    const attrParts = attr.trim().split('-');
                    for (let p = 1; p < attrParts.length; p++) {
                        attrParts[p] = attrParts[p][0].toUpperCase() + attrParts[p].substring(1);
                    }

                    style[attrParts.join('')] = value.trim();
                }
            });
        }
        return style;
    }

    renderSignal(index) {
        const oid = this.state.rxData[`signals-oid-${index}`];
        if (!oid) {
            return null;
        }
        if (this.props.editMode && this.state.rxData[`signals-hide-edit-${index}`]) {
            return null;
        }

        // check value
        if (this.props.editMode || this.isSignalVisible(index)) {
            let icon = this.state.rxData[`signals-smallIcon-${index}`];
            let color;
            if (icon) {
                color = this.state.rxData[`signals-color-${index}`];
            } else {
                icon = this.state.rxData[`signals-icon-${index}`];
            }
            const style = {
                color,
                position: 'absolute',
                top: `${parseInt(this.state.rxData[`signals-vert-${index}`], 10) || 0}%`,
                left: `${parseInt(this.state.rxData[`signals-horz-${index}`], 10) || 0}%`,
                zIndex: 10,
                textAlign: 'center',
            };
            if (icon) {
                const imageStyle = {
                    width: parseFloat(this.state.rxData[`signals-icon-size-${index}`]) || 32,
                    height: 'auto',
                };
                icon = <Icon src={icon} style={imageStyle} className="vis-signal-icon" />;
            }
            VisRxWidget.text2style(this.state.rxData[`signals-icon-style-${index}`], style);
            let text = this.state.rxData[`signals-text-${index}`];
            if (text) {
                const textStyle = {
                    color: this.state.rxData[`signals-color-${index}`],
                };
                VisRxWidget.text2style(this.state.rxData[`signals-text-style-${index}`], textStyle);
                text = <div
                    className="vis-signal-text"
                    style={textStyle}
                >
                    {this.state.rxData[`signals-text-${index}`]}
                </div>;
            } else {
                text = null;
            }

            // class name only to address the icon by user's CSS
            return <div style={style} className={this.state.rxData[`signals-blink-${index}`] ? 'vis-signals-blink' : null}>
                {icon}
                {text}
            </div>;
        }
        return null;
    }

    renderLastChange(widgetStyle) {
        // show last change
        const border = parseInt(this.state.rxData['lc-border-radius'], 10) || 0;
        const style = {
            backgroundColor: 'rgba(182, 182, 182, 0.6)',
            fontFamily: 'Tahoma',
            position: 'absolute',
            zIndex: 0,
            borderRadius: this.state.rxData['lc-position-horz'] === 'left' ?
                `${border}px 0 0 ${border}px` :
                (this.state.rxData['lc-position-horz'] === 'right' ? `0 ${border}px ${border}px 0` : border),
            whiteSpace: 'nowrap',
        };
        const fontSize = this.state.rxData['lc-font-size'];
        if (fontSize) {
            if (fontSize.match(/\D/)) {
                style.fontSize = this.state.rxData['lc-font-size'];
            } else {
                style.fontSize = parseFloat(this.state.rxData['lc-font-size']);
            }
        }
        if (this.state.rxData['lc-font-style']) {
            style.fontStyle = this.state.rxData['lc-font-style'];
        }
        if (this.state.rxData['lc-font-family']) {
            style.fontFamily = this.state.rxData['lc-font-family'];
        }
        if (this.state.rxData['lc-bkg-color']) {
            style.backgroundColor = this.state.rxData['lc-bkg-color'];
        }
        if (this.state.rxData['lc-color']) {
            style.color = this.state.rxData['lc-color'];
        }
        if (this.state.rxData['lc-border-width']) {
            style.borderWidth = parseInt(this.state.rxData['lc-border-width'], 10) || 0;
        }
        if (this.state.rxData['lc-border-style']) {
            style.borderStyle = this.state.rxData['lc-border-style'];
        }
        if (this.state.rxData['lc-border-color']) {
            style.borderColor = this.state.rxData['lc-border-color'];
        }
        const padding = parseInt(this.state.rxData['lc-padding'], 10);
        if (padding) {
            style.padding = padding;
        } else {
            style.paddingTop = 3;
            style.paddingBottom = 3;
        }
        if (this.state.rxData['lc-zindex']) {
            style.zIndex = this.state.rxData['lc-zindex'];
        }
        if (this.state.rxData['lc-position-vert'] === 'top') {
            style.top = parseInt(this.state.rxData['lc-offset-vert'], 10);
        } else if (this.state.rxData['lc-position-vert'] === 'bottom') {
            style.bottom = parseInt(this.state.rxData['lc-offset-vert'], 10);
        } else if (this.state.rxData['lc-position-vert'] === 'middle') {
            style.top = `calc(50% + ${parseInt(this.state.rxData['lc-offset-vert'], 10) - 10}px)`;
        }
        const offset = parseFloat(this.state.rxData['lc-offset-horz']) || 0;
        if (this.state.rxData['lc-position-horz'] === 'left') {
            style.right = `calc(100% - ${offset}px)`;
            if (!padding) {
                style.paddingRight = 10;
                style.paddingLeft = 10;
            }
        } else if (this.state.rxData['lc-position-horz'] === 'right') {
            style.left = `calc(100% + ${offset}px)`;
            if (!padding) {
                style.paddingRight = 10;
                style.paddingLeft = 10;
            }
        } else if (this.state.rxData['lc-position-horz'] === 'middle') {
            style.left = `calc(50% + ${offset}px)`;
        }

        const divLastChange = window.document.createElement('div');
        // `<div class="vis-last-change" data-type="${data['lc-type']}" data-format="${data['lc-format']}" data-interval="${data['lc-is-interval']}">${this.binds.basic.formatDate(this.states.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment'])}</div>`
        divLastChange.className = '';

        calculateOverflow(widgetStyle);

        return <div
            className="vis-last-change" // just to have a possibility to address it in user's CSS
            style={style}
        >
            {this.formatDate(
                this.state.values[`${this.state.rxData['lc-oid']}.${this.state.rxData['lc-type'] === 'last-change' ? 'lc' : 'ts'}`],
                this.state.rxData['lc-format'],
                this.state.rxData['lc-is-interval'],
                this.state.rxData['lc-is-moment'],
                true,
            )}
        </div>;
    }

    renderSignals() {
        const count = parseInt(this.state.rxData?.['signals-count'], 10) || 0;
        if (!count) {
            return null;
        }
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.renderSignal(i));
        }
        return result;
    }

    render() {
        if (!this.state.visible && !this.state.editMode) {
            return null;
        }

        if (this.state.applyBindings && !this.bindingsTimer) {
            this.bindingsTimer = setTimeout(async () => {
                this.bindingsTimer = null;
                await this.onPropertiesUpdated();

                const refs = [];
                // if widget has included widgets => inform them about the new size or position
                const oWidget = this.props.context.views[this.props.view].widgets[this.props.id];
                const attrs = Object.keys(oWidget.data);
                attrs.forEach(attr => {
                    if (attr.startsWith('widget') && oWidget.data[attr]) {
                        const ref = this.props.askView && this.props.askView('getRef', { id: oWidget.data[attr] });
                        ref && refs.push(ref);
                    }
                });

                this.informIncludedWidgets && clearTimeout(this.informIncludedWidgets);
                if (refs) {
                    this.informIncludedWidgets = setTimeout(() => {
                        this.informIncludedWidgets = null;
                        refs.forEach(ref => ref.onCommand('updatePosition'));
                    }, 200);
                }
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
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    isRelative: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    refParent: PropTypes.object.isRequired,
    askView: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    selectedWidgets: PropTypes.array,
    viewsActiveFilter: PropTypes.object.isRequired,
};

export default VisRxWidget;
