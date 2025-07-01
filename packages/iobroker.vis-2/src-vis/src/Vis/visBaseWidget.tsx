/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2022-2025 Denis Haev https://github.com/GermanBluefox,
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

import {
    Anchor as AnchorIcon,
    Expand as ExpandIcon,
    ArrowUpward as UpIcon,
    ArrowDownward as DownIcon,
    KeyboardReturn,
} from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

import { calculateOverflow, deepClone, isVarFinite } from '@/Utils/utils';
import type {
    AnyWidgetId,
    ResizeHandler,
    GroupData,
    WidgetData,
    WidgetStyle,
    Widget,
    RxRenderWidgetProps,
    VisRxWidgetStateValues,
    VisWidgetCommand,
    VisBaseWidgetProps,
} from '@iobroker/types-vis-2';
import { addClass, removeClass, replaceGroupAttr } from './visUtils';

import VisOrderMenu from './visOrderMenu';

interface HTMLDivElementResizers extends HTMLDivElement {
    _storedOpacity: string;
}

type Resize = 'left' | 'right' | 'top' | 'bottom' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | boolean;

export interface WidgetDataState extends WidgetData {
    bindings: string[];
    _originalData?: string;
}

export interface GroupDataState extends GroupData {
    bindings?: string[];
    _originalData?: string;
}

export interface WidgetStyleState extends WidgetStyle {
    bindings?: string[];
    _originalData?: string;
}

export interface VisBaseWidgetState {
    applyBindings?: false | true | { top: string | number; left: string | number };
    data: WidgetDataState | GroupDataState;
    draggable?: boolean;
    editMode: boolean;
    gap?: number;
    hideHelper?: boolean;
    isHidden?: boolean;
    multiViewWidget?: boolean;
    resizable?: boolean;
    resizeHandles?: ResizeHandler[];
    rxStyle?: WidgetStyleState;
    selected?: boolean;
    selectedOne?: boolean;
    showRelativeMoveMenu?: boolean;
    style: WidgetStyleState;
    usedInWidget: boolean;
    widgetHint?: 'light' | 'dark' | 'hide';
}

export interface VisBaseWidgetMovement {
    top: number;
    left: number;
    width: number;
    height: number;
    order?: AnyWidgetId[];
}

interface Handler {
    top?: string | number;
    left?: string | number;
    bottom?: string | number;
    height?: string | number;
    right?: string | number;
    width?: string | number;
    cursor: 'nwse-resize' | 'ns-resize' | 'ew-resize' | 'nesw-resize' | 'default';
    background: string;
    opacity: number;
    borderTop?: string;
    borderBottom?: string;
    borderLeft?: string;
    borderRight?: string;
}

interface ResizerElement extends HTMLDivElement {
    _storedOpacity: string;
}

/**
 * Methods, which should be optionally implemented by inherited classes
 */
interface VisBaseWidget {
    renderSignals(): React.ReactNode;
    renderLastChange(style: unknown): React.ReactNode;
}

interface CanHTMLDivElement extends HTMLDivElement {
    _customHandlers?: {
        onShow: (el: HTMLDivElement, id: string) => void;
        onHide: (el: HTMLDivElement, id: string) => void;
    };
    _storedDisplay?: React.CSSProperties['display'];
}

class VisBaseWidget<TState extends Partial<VisBaseWidgetState> = VisBaseWidgetState> extends React.Component<
    VisBaseWidgetProps,
    TState & VisBaseWidgetState
> {
    static FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js

    /** We do not store the SVG Element in the state because it is cyclic */
    private relativeMoveMenu?: EventTarget & SVGSVGElement;

    /** if currently resizing */
    private resize: Resize = false;

    protected readonly uuid = `${Date.now()}.${Math.round(Math.random() * 1_000_000)}`;

    protected refService = React.createRef<HTMLDivElement>();

    protected widDiv: null | CanHTMLDivElement = null;

    readonly onCommandBound: typeof this.onCommand;

    protected onResize: undefined | (() => void);

    private updateInterval?: ReturnType<typeof setTimeout>;

    private pressTimeout?: ReturnType<typeof setTimeout>;

    private shadowDiv: HTMLDivElement | null;

    private stealCursor?: string;

    private beforeIncludeColor?: string;

    protected lastClick?: number;

    protected movement?: VisBaseWidgetMovement;

    /** If resizing is currently locked */
    protected resizeLocked?: boolean;

    protected visDynamicResizable:
        | undefined
        | null
        | { default: boolean; desiredSize: { width: number; height: number } | boolean };

    protected isCanWidget?: boolean;

    constructor(props: VisBaseWidgetProps) {
        super(props);

        const widget = props.context.views[props.view].widgets[props.id];
        const multiViewWidget = props.id.includes('_');

        const selected = !multiViewWidget && props.editMode && props.selectedWidgets?.includes(props.id);

        const data: WidgetDataState | GroupDataState = deepClone(widget.data || {}) as WidgetDataState | GroupDataState;
        const style: WidgetStyle = deepClone(widget.style || {});
        VisBaseWidget.replacePRJ_NAME(data, style, props);

        this.state = {
            data,
            style,
            applyBindings: false,
            editMode: !multiViewWidget && this.props.editMode,
            multiViewWidget,
            selected,
            selectedOne: selected && this.props.selectedWidgets.length === 1,
            resizable: true,
            resizeHandles: ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'],
            widgetHint: props.context.widgetHint,
            isHidden: VisBaseWidget.isWidgetFilteredOutStatic(
                props.viewsActiveFilter,
                widget.data,
                props.view,
                props.editMode,
            ),
            usedInWidget: widget.usedInWidget,
            hideHelper: false,
            gap:
                style.position === 'relative'
                    ? isVarFinite(props.context.views[props.view].settings?.rowGap)
                        ? parseFloat(props.context.views[props.view].settings?.rowGap as string)
                        : 0
                    : 0,
        } as TState & VisBaseWidgetState;

        this.onCommandBound = this.onCommand.bind(this);
    }

    static replacePRJ_NAME(data: Record<string, any>, style: Record<string, any>, props: VisBaseWidgetProps): void {
        const context = props.context;
        if (data) {
            delete data._originalData;
            Object.keys(data).forEach(attr => {
                if (
                    attr &&
                    data[attr] &&
                    typeof data[attr] === 'string' &&
                    (attr.startsWith('src') || attr.endsWith('src') || attr.includes('icon')) &&
                    data[attr].startsWith('_PRJ_NAME')
                ) {
                    if (!data._originalData) {
                        data._originalData = JSON.stringify(data);
                    }
                    // "_PRJ_NAME".length = 9
                    data[attr] =
                        `../${context.adapterName}.${context.instance}/${context.projectName}${data[attr].substring(9)}`;
                }
            });
        }
        if (style) {
            delete style._originalData;
            if (style['background-image'] && style['background-image'].startsWith('_PRJ_NAME')) {
                if (!style._originalData) {
                    style._originalData = JSON.stringify(style);
                }
                style['background-image'] =
                    `../${context.adapterName}.${context.instance}/${context.projectName}${style['background-image'].substring(9)}`; // "_PRJ_NAME".length = 9
            }
        }
    }

    componentDidMount(): void {
        // register service ref by view for resize and move only in edit mode
        this.props.askView &&
            this.props.askView('register', {
                id: this.props.id,
                uuid: this.uuid,
                widDiv: this.widDiv,
                refService: this.refService,
                onMove: this.onMove,
                onResize: this.onResize,
                onTempSelect: this.onTempSelect,
                onCommand: this.onCommandBound,
            });
    }

    componentWillUnmount(): void {
        this.updateInterval && clearInterval(this.updateInterval);
        this.updateInterval = undefined;

        this.pressTimeout && clearTimeout(this.pressTimeout);
        this.pressTimeout = undefined;

        // delete service ref from view only in edit mode
        this.props.askView && this.props.askView('unregister', { id: this.props.id, uuid: this.uuid });
        if (this.shadowDiv) {
            this.shadowDiv.remove();
            this.shadowDiv = null;
        }
    }

    // this method may be not in form onCommand = command => {}, as it can be overloaded
    onCommand(command: VisWidgetCommand, _option?: any): any {
        if (command === 'includePossible') {
            const overlay: HTMLDivElement = this.refService.current?.querySelector('.vis-editmode-overlay');
            if (overlay && this.beforeIncludeColor === undefined) {
                this.beforeIncludeColor = overlay.style.backgroundColor;
                overlay.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            }
            return true;
        }
        if (command === 'includePossibleNOT') {
            if (this.beforeIncludeColor !== undefined) {
                const overlay: HTMLDivElement = this.refService.current?.querySelector('.vis-editmode-overlay');
                overlay && (overlay.style.backgroundColor = this.beforeIncludeColor);
                this.beforeIncludeColor = undefined;
            }
            return true;
        }

        if (command === 'startStealMode') {
            this.stealCursor = this.refService.current?.style.cursor || 'nocursor';
            if (this.refService.current) {
                this.refService.current.style.cursor = 'crosshair';
                this.refService.current.className = addClass(
                    this.refService.current.className,
                    'vis-editmode-steal-style',
                );
            }
            const resizers: NodeListOf<HTMLDivElement> =
                this.refService.current?.querySelectorAll('.vis-editmode-resizer');
            resizers?.forEach(item => (item.style.display = 'none'));
            return true;
        }

        if (command === 'cancelStealMode') {
            if (this.stealCursor !== 'nocursor' && this.refService.current && this.stealCursor) {
                this.refService.current.style.cursor = this.stealCursor;
            }
            this.stealCursor = undefined;
            if (this.refService.current) {
                this.refService.current.className = removeClass(
                    this.refService.current.className,
                    'vis-editmode-steal-style',
                );
            }
            const resizers: NodeListOf<HTMLDivElement> =
                this.refService.current?.querySelectorAll('.vis-editmode-resizer');
            resizers?.forEach(item => (item.style.display = ''));
            return true;
        }

        if (command === 'startMove' || command === 'startResize') {
            const overlay = this.refService.current?.querySelector('.vis-editmode-overlay');
            if (overlay) {
                if (this.state.selected) {
                    overlay.className = removeClass(overlay.className, 'vis-editmode-selected');
                } else {
                    overlay.className = removeClass(overlay.className, 'vis-editmode-overlay-not-selected');
                }
            }

            if (command === 'startResize') {
                this.resize = true;
            }
            return true;
        }

        if (command === 'stopMove' || command === 'stopResize') {
            const overlay: HTMLDivElement = this.refService.current?.querySelector('.vis-editmode-overlay');
            if (overlay) {
                if (this.beforeIncludeColor !== undefined) {
                    overlay.style.backgroundColor = this.beforeIncludeColor;
                    this.beforeIncludeColor = undefined;
                }

                if (this.state.selected) {
                    overlay.className = addClass(overlay.className, 'vis-editmode-selected');
                } else {
                    overlay.className = addClass(overlay.className, 'vis-editmode-overlay-not-selected');
                }
            }

            // show resizers again
            const resizers: NodeListOf<HTMLDivElement> =
                this.refService.current?.querySelectorAll('.vis-editmode-resizer');
            resizers?.forEach(item => (item.style.display = 'block'));

            if (command === 'stopResize') {
                this.resize = false;
            }
            return true;
        }

        return false;
    }

    static getDerivedStateFromProps(
        props: VisBaseWidgetProps,
        state: VisBaseWidgetState,
    ): Partial<VisBaseWidgetState> | null {
        const context = props.context;
        let newState: Partial<VisBaseWidgetState> | null = null; // No change to state by default
        let widget = context.views[props.view].widgets[props.id];
        const gap =
            widget.style.position === 'relative'
                ? isVarFinite(context.views[props.view].settings?.rowGap)
                    ? parseFloat(context.views[props.view].settings?.rowGap as string)
                    : 0
                : 0;
        let copied = false;

        if (widget.groupid) {
            // this widget belongs to group
            const parentWidgetData = context.views[props.view].widgets[widget.groupid].data;
            // extract attribute names
            const names = Object.keys(parentWidgetData)
                .map(attr => (attr.startsWith('attrType_') ? attr.substring(9) : null))
                .filter(attr => attr);

            if (names.length && widget.data) {
                for (const [attr, val] of Object.entries(widget.data)) {
                    if (typeof val === 'string' && names.find(a => val.includes(a))) {
                        const result = replaceGroupAttr(widget.data[attr], parentWidgetData);
                        if (result.doesMatch) {
                            // create a copy as we will substitute the values
                            if (!copied) {
                                copied = true;
                                widget = deepClone(widget);
                            }
                            widget.data[attr] = result.newString || '';
                        }
                    }
                }
            }
        }

        // take actual (old) style and data
        const styleStr: string = state.style?._originalData ? state.style._originalData : JSON.stringify(state.style);
        const dataStr: string = state.data?._originalData ? state.data._originalData : JSON.stringify(state.data);

        const isHidden = VisBaseWidget.isWidgetFilteredOutStatic(
            props.viewsActiveFilter,
            widget.data,
            props.view,
            props.editMode,
        );

        // compare with new style and data
        if (
            JSON.stringify(widget.style || {}) !== styleStr ||
            JSON.stringify(widget.data || {}) !== dataStr ||
            gap !== state.gap ||
            isHidden !== state.isHidden
        ) {
            if (!props.runtime) {
                const styleObj: WidgetStyle = JSON.parse(styleStr);
                Object.keys(styleObj as Record<string, string>).forEach(attr => {
                    const oldStyle = (widget.style as Record<string, string>)[attr];
                    const newStyle = (styleObj as Record<string, string>)[attr];
                    if (newStyle !== oldStyle) {
                        console.log(
                            `[${Date.now()} / ${props.id}] Rerender because of style.${attr}: ${newStyle} !== ${oldStyle}`,
                        );
                    }
                });
                Object.keys(widget.style).forEach((attr: string) => {
                    const oldStyle = (widget.style as Record<string, string>)[attr];
                    const newStyle = (styleObj as Record<string, string>)[attr];
                    if (newStyle !== oldStyle) {
                        console.log(
                            `[${Date.now()} / ${props.id}] Rerender because of style.${attr}: ${newStyle} !== ${oldStyle}`,
                        );
                    }
                });

                const dataObj: GroupData = JSON.parse(dataStr);
                Object.keys(dataObj).forEach((attr: string) => {
                    if (JSON.stringify(dataObj[attr]) !== JSON.stringify(widget.data[attr])) {
                        console.log(
                            `[${Date.now()} / ${props.id}] Rerender because of data.${attr}: ${dataObj[attr]} !== ${widget.data[attr]}`,
                        );
                    }
                });
            }

            let data: WidgetDataState;
            let style: WidgetStyleState;
            // restore original data
            if (copied) {
                data = (widget.data as WidgetDataState) || { bindings: [] };
                // detect for CanWidgets if size was changed
                style = (widget.style as WidgetStyleState) || { bindings: [] };
            } else {
                data = widget.data
                    ? (deepClone(widget.data) as WidgetDataState)
                    : ({ bindings: [] } as WidgetDataState);
                // detect for CanWidgets if size was changed
                style = widget.style
                    ? (deepClone(widget.style) as WidgetStyleState)
                    : ({ bindings: [] } as WidgetStyleState);
            }

            // replace all _PRJ_NAME with vis.0/name
            VisBaseWidget.replacePRJ_NAME(data, style, props);

            newState = {};
            newState.isHidden = isHidden;
            newState.style = style;
            newState.data = data;
            newState.gap = gap;
            newState.applyBindings = { top: widget.style.top as number, left: widget.style.left as number };
        }

        if (props.editMode !== state.editMode) {
            newState = newState || {};
            newState.editMode = props.editMode;
            newState.applyBindings = true;
        }

        if (props.context.widgetHint !== state.widgetHint) {
            newState = newState || {};
            newState.widgetHint = props.context.widgetHint;
        }

        const selected =
            !state.multiViewWidget &&
            props.editMode &&
            props.selectedWidgets &&
            props.selectedWidgets.includes(props.id);
        const selectedOne = selected && props.selectedWidgets.length === 1;

        if (selected !== state.selected || selectedOne !== state.selectedOne) {
            newState = newState || {};
            newState.selected = selected;
            newState.selectedOne = selectedOne;
        }

        if (!!widget.usedInWidget !== !!state.usedInWidget) {
            newState = newState || {};
            newState.usedInWidget = !!widget.usedInWidget;
        }

        return newState;
    }

    static removeFromArray(items: Record<string, any>, IDs: string[], view: string, widget: string): void {
        items &&
            Object.keys(items).forEach(id => {
                if (!IDs || IDs.includes(id)) {
                    for (let i = items[id].length - 1; i >= 0; i--) {
                        const item = items[id][i];
                        if (item.view === view && item.widget === widget) {
                            items[id].splice(i, 1);
                        }
                    }
                }
            });
    }

    static parseStyle(style: string, isRxStyle?: boolean): Record<string, string | number> {
        const result: Record<string, string | number> = {};
        // style is like "height: 10; width: 20"
        (style || '').split(';').forEach(part => {
            part = part.trim();
            if (part) {
                let [attr, value] = part.split(':');
                attr = attr.trim();
                if (attr && value) {
                    value = value.trim();
                    if (!isRxStyle && (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height')) {
                        if (!isRxStyle) {
                            if (value !== '0' && value.match(/^[-+]?\d+$/)) {
                                value = `${value}px`;
                            }
                        } else {
                            const f = parseFloat(value);
                            if (value === f.toString()) {
                                // @ts-expect-error fix later
                                value = f;
                            }
                        }
                    }

                    if (value) {
                        if (isRxStyle) {
                            attr = attr.replace(/(-\w)/, text => text[1].toUpperCase());
                        }

                        result[attr] = value;
                    }
                }
            }
        });

        return result;
    }

    onMouseDown(e: React.MouseEvent): void {
        e.stopPropagation();
        if (this.stealCursor && !this.state.multiViewWidget) {
            e.stopPropagation();
            this.props.mouseDownOnView(e, this.props.id, this.props.isRelative);
            return;
        }
        if (this.props.context.views[this.props.view].widgets[this.props.id].data.locked) {
            return;
        }

        if (this.lastClick !== undefined && Date.now() - this.lastClick < 250) {
            console.log('AAA');
        }

        // detect double click for multi-view widgets
        if (this.lastClick) {
            if (this.state.multiViewWidget) {
                if (Date.now() - this.lastClick < 250) {
                    // change view
                    const parts: string[] = this.props.id.split('_');
                    const multiView: string = parts[0];
                    const multiId: AnyWidgetId = parts[1] as AnyWidgetId;
                    this.props.context.setSelectedWidgets([multiId], multiView);
                }

                this.lastClick = Date.now();
                return;
            }
        }

        if (e.shiftKey || e.ctrlKey) {
            // add or remove
            const pos = this.props.selectedWidgets.indexOf(this.props.id);
            if (pos === -1) {
                const selectedWidgets = [...this.props.selectedWidgets, this.props.id];
                this.props.context.setSelectedWidgets(selectedWidgets);
            } else {
                const selectedWidgets = [...this.props.selectedWidgets];
                selectedWidgets.splice(pos, 1);
                this.props.context.setSelectedWidgets(selectedWidgets);
            }
            return;
        }

        if (!this.props.selectedWidgets.includes(this.props.id)) {
            // set select
            this.props.context.setSelectedWidgets([this.props.id]);
        } else if (this.props.moveAllowed && this.state.draggable !== false) {
            if (!this.props.isRelative) {
                // User can drag only objects of the same type
                this.props.mouseDownOnView(
                    e,
                    this.props.id,
                    this.props.isRelative,
                    false,
                    this.lastClick !== undefined && Date.now() - this.lastClick < 300,
                );
            } else if (this.lastClick && Date.now() - this.lastClick < 250) {
                // if double-click on a group
                if (
                    this.props.selectedWidgets.length === 1 &&
                    this.props.context.views[this.props.view].widgets[this.props.selectedWidgets[0]].tpl === '_tplGroup'
                ) {
                    this.props.context.setSelectedGroup(this.props.selectedWidgets[0]);
                }
            }
        }
        this.lastClick = Date.now();
    }

    createWidgetMovementShadow(): void {
        if (this.shadowDiv) {
            this.shadowDiv.remove();
            this.shadowDiv = null;
        }

        if (!this.movement) {
            console.error('Unknown issue, movement is falsy');
            return;
        }

        this.shadowDiv = window.document.createElement('div');
        this.shadowDiv.setAttribute('id', `${this.props.id}_shadow`);
        this.shadowDiv.className = 'vis-editmode-widget-shadow';
        if (this.refService.current) {
            this.shadowDiv.style.width = `${this.refService.current.clientWidth}px`;
            this.shadowDiv.style.height = `${this.refService.current.clientHeight}px`;
            if (this.refService.current.style.borderRadius) {
                this.shadowDiv.style.borderRadius = this.refService.current.style.borderRadius;
            }
        }

        let parentDiv: HTMLElement;
        if (Object.prototype.hasOwnProperty.call(this.props.refParent, 'current')) {
            parentDiv = this.props.refParent.current;
        } else {
            parentDiv = this.props.refParent as any as HTMLElement;
        }

        if (this.widDiv) {
            parentDiv.insertBefore(this.shadowDiv, this.widDiv);
            this.widDiv.style.position = 'absolute';
            this.widDiv.style.left = `${this.movement.left}px`;
            this.widDiv.style.top = `${this.movement.top}px`;
        } else {
            parentDiv.insertBefore(this.shadowDiv, this.refService.current);
            if (this.refService.current) {
                this.refService.current.style.position = 'absolute';
            }
        }
        if (this.refService.current) {
            this.refService.current.style.left = `${this.movement.left}px`;
            this.refService.current.style.top = `${this.movement.top}px`;
        }
    }

    isResizable(): boolean {
        if (this.visDynamicResizable) {
            // take data from field "visResizable"
            // this value cannot be bound, so we can read it directly from widget.data
            return typeof this.state.data.visResizable === 'boolean'
                ? this.state.data.visResizable
                : this.visDynamicResizable.default; // by default all widgets are resizable
        }

        return this.state.resizable;
    }

    onMove = (
        x: number | undefined,
        y: number | undefined,
        save?: boolean,
        calculateRelativeWidgetPosition?:
            | null
            | ((id: AnyWidgetId, left: string, top: string, shadowDiv: HTMLDivElement, order: AnyWidgetId[]) => void),
    ): void => {
        if (this.state.multiViewWidget || !this.state.editMode) {
            return;
        }

        const movement = this.movement;

        if (!this.refService.current) {
            return;
        }
        if (this.resize) {
            if (this.isResizable() === false) {
                return;
            }

            if (x === undefined) {
                // start of resizing
                const rect = (this.widDiv || this.refService.current)?.getBoundingClientRect();

                if (rect) {
                    this.movement = {
                        top: this.refService.current.offsetTop,
                        left: this.refService.current.offsetLeft,
                        width: rect.width,
                        height: rect.height,
                    };
                }
                const resizers: NodeListOf<ResizerElement> =
                    this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => {
                    item._storedOpacity = item.style.opacity;
                    item.style.opacity = '0.3';
                });
            } else if (movement && y !== undefined /* && x !== undefined */) {
                if (this.resize === 'top') {
                    this.refService.current.style.top = `${movement.top + y}px`;
                    this.refService.current.style.height = `${movement.height - y}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.width = this.refService.current.style.height;
                    }

                    if (this.widDiv) {
                        this.widDiv.style.top = `${movement.top + y}px`;
                        this.widDiv.style.height = `${movement.height - y}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.width = this.widDiv.style.height;
                        }
                    }
                } else if (this.resize === 'bottom') {
                    this.widDiv && (this.widDiv.style.height = `${movement.height + y}px`);
                    this.refService.current.style.height = `${movement.height + y}px`;

                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.width = this.refService.current.style.height;
                    }
                    if (this.widDiv && this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.widDiv.style.width = this.widDiv.style.height;
                    }
                } else if (this.resize === 'left') {
                    this.refService.current.style.left = `${movement.left + x}px`;
                    this.refService.current.style.width = `${movement.width - x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }
                    if (this.widDiv) {
                        this.widDiv.style.left = `${movement.left + x}px`;
                        this.widDiv.style.width = `${movement.width - x}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.height = this.widDiv.style.width;
                        }
                    }
                } else if (this.resize === 'right') {
                    this.widDiv && (this.widDiv.style.width = `${movement.width + x}px`);
                    this.refService.current.style.width = `${movement.width + x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }
                    if (this.widDiv && this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.widDiv.style.height = this.widDiv.style.width;
                    }
                } else if (this.resize === 'top-left') {
                    this.refService.current.style.top = `${movement.top + y}px`;
                    this.refService.current.style.left = `${movement.left + x}px`;
                    this.refService.current.style.height = `${movement.height - y}px`;
                    this.refService.current.style.width = `${movement.width - x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }

                    if (this.widDiv) {
                        this.widDiv.style.top = `${movement.top + y}px`;
                        this.widDiv.style.left = `${movement.left + x}px`;
                        this.widDiv.style.height = `${movement.height - y}px`;
                        this.widDiv.style.width = `${movement.width - x}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.height = this.widDiv.style.width;
                        }
                    }
                } else if (this.resize === 'top-right') {
                    this.refService.current.style.top = `${movement.top + y}px`;
                    this.refService.current.style.height = `${movement.height - y}px`;
                    this.refService.current.style.width = `${movement.width + x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }
                    if (this.widDiv) {
                        this.widDiv.style.top = `${movement.top + y}px`;
                        this.widDiv.style.height = `${movement.height - y}px`;
                        this.widDiv.style.width = `${movement.width + x}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.height = this.widDiv.style.width;
                        }
                    }
                } else if (this.resize === 'bottom-left') {
                    this.refService.current.style.left = `${movement.left + x}px`;
                    this.refService.current.style.height = `${movement.height + y}px`;
                    this.refService.current.style.width = `${movement.width - x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }
                    if (this.widDiv) {
                        this.widDiv.style.left = `${movement.left + x}px`;
                        this.widDiv.style.height = `${movement.height + y}px`;
                        this.widDiv.style.width = `${movement.width - x}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.height = this.widDiv.style.width;
                        }
                    }
                } else {
                    // bottom-right
                    this.refService.current.style.height = `${movement.height + y}px`;
                    this.refService.current.style.width = `${movement.width + x}px`;
                    if (this.resizeLocked) {
                        // noinspection JSSuspiciousNameCombination
                        this.refService.current.style.height = this.refService.current.style.width;
                    }
                    if (this.widDiv) {
                        this.widDiv.style.height = `${movement.height + y}px`;
                        this.widDiv.style.width = `${movement.width + x}px`;
                        if (this.resizeLocked) {
                            // noinspection JSSuspiciousNameCombination
                            this.widDiv.style.height = this.widDiv.style.width;
                        }
                    }
                }
            }

            // end of resize
            if (save) {
                const resizers: NodeListOf<HTMLDivElementResizers> =
                    this.refService.current?.querySelectorAll('.vis-editmode-resizer');
                resizers?.forEach(item => {
                    if (item._storedOpacity !== undefined) {
                        item.style.opacity = item._storedOpacity;
                        delete item._storedOpacity;
                    }
                });
                this.resize = false;
                this.props.context.onWidgetsChanged([
                    {
                        wid: this.props.id,
                        view: this.props.view,
                        style: {
                            top: this.refService.current.style.top,
                            left: this.refService.current.style.left,
                            width: this.refService.current.style.width,
                            height: this.refService.current.style.height,
                        },
                    },
                ]);

                this.movement = undefined;
            }
        } else if (x === undefined) {
            if (this.state.draggable === false) {
                return;
            }

            // initiate movement
            this.movement = {
                top: this.refService.current.offsetTop,
                left: this.refService.current.offsetLeft,
                order: [...this.props.relativeWidgetOrder],
                width: 0,
                height: 0,
            };

            // hide resizers
            const resizers: NodeListOf<HTMLDivElement> =
                this.refService.current.querySelectorAll('.vis-editmode-resizer');
            resizers.forEach(item => (item.style.display = 'none'));

            if (this.props.isRelative) {
                // create shadow widget
                this.createWidgetMovementShadow();
            }
        } else if (this.movement && y !== undefined && x !== undefined) {
            // move widget
            const left = `${this.movement.left + x}px`;
            const top = `${this.movement.top + y}px`;

            if (this.refService.current) {
                this.refService.current.style.left = left;
                this.refService.current.style.top = top;
            }

            if (this.widDiv) {
                this.widDiv.style.left = left;
                this.widDiv.style.top = top;

                // @ts-expect-error check later
                if (this.widDiv._customHandlers && this.widDiv._customHandlers.onMove) {
                    // @ts-expect-error check later
                    this.widDiv._customHandlers.onMove(this.widDiv, this.props.id);
                }
            }

            if (this.props.isRelative && calculateRelativeWidgetPosition) {
                // calculate widget position
                calculateRelativeWidgetPosition(this.props.id, left, top, this.shadowDiv, this.movement.order);
            }

            // End of movement
            if (save) {
                // show resizers
                const resizers: NodeListOf<HTMLDivElement> =
                    this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => (item.style.display = 'block'));

                if (this.props.isRelative) {
                    let parentDiv: HTMLElement;
                    if (Object.prototype.hasOwnProperty.call(this.props.refParent, 'current')) {
                        parentDiv = this.props.refParent.current;
                    } else {
                        parentDiv = this.props.refParent as any as HTMLElement;
                    }
                    // create shadow widget
                    if (this.widDiv) {
                        this.widDiv.style.position = 'relative';
                        this.widDiv.style.top = '0';
                        this.widDiv.style.left = '0';
                        parentDiv.insertBefore(this.widDiv, this.shadowDiv);
                        this.refService.current.style.top = `${this.widDiv.offsetTop}px`;
                        this.refService.current.style.left = `${this.widDiv.offsetLeft}px`;
                    } else {
                        parentDiv.insertBefore(this.refService.current, this.shadowDiv);
                        this.refService.current.style.position = 'relative';
                        this.refService.current.style.top = '0';
                        this.refService.current.style.left = '0';
                    }
                    this.shadowDiv.remove();
                    this.shadowDiv = null;

                    this.props.context.onWidgetsChanged(
                        [
                            {
                                wid: this.props.id,
                                view: this.props.view,
                                style: {
                                    left: null,
                                    top: null,
                                },
                            },
                        ],
                        this.props.view,
                        { order: this.movement.order },
                    );
                } else {
                    this.props.context.onWidgetsChanged([
                        {
                            wid: this.props.id,
                            view: this.props.view,
                            style: {
                                left: this.movement.left + x,
                                top: this.movement.top + y,
                            },
                        },
                    ]);
                }

                this.movement = undefined;
            }
        }
    };

    onTempSelect = (selected?: boolean): void => {
        const ref: HTMLElement = this.refService.current?.querySelector('.vis-editmode-overlay');
        if (!ref) {
            return;
        }
        if (selected === null || selected === undefined) {
            // restore original state
            if (this.props.selectedWidgets.includes(this.props.id)) {
                if (!ref.className.includes('vis-editmode-selected')) {
                    ref.className = addClass('vis-editmode-selected', ref.className);
                }
            } else {
                ref.style.backgroundColor = '';
                ref.className = removeClass(ref.className, 'vis-editmode-selected');
            }
        } else if (selected) {
            if (!ref.className.includes('vis-editmode-selected')) {
                ref.className = addClass('vis-editmode-selected', ref.className);
            }
        } else {
            ref.className = removeClass(ref.className, 'vis-editmode-selected');
        }
    };

    onResizeStart(e: React.MouseEvent, type: Resize): void {
        e.stopPropagation();
        this.resize = type;
        this.props.mouseDownOnView(e, this.props.id, this.props.isRelative, true);
    }

    getResizeHandlers(selected: boolean, widget: Widget, borderWidth: string): React.JSX.Element[] | null {
        if (!this.state.editMode || !selected || this.props.selectedWidgets?.length !== 1) {
            return null;
        }

        const thickness = 0.4;
        const shift = 0.3;
        const square = 0.4;

        const squareShift = `calc(${shift - square}em - ${borderWidth})`;
        const squareWidthHeight = `${square}em`;
        const shiftEm = `${shift}em`;
        const thicknessEm = `${thickness}em`;
        const offsetEm = `calc(${shift - thickness}em - ${borderWidth})`;

        const widgetWidth100 = widget.style.width === '100%';
        const widgetHeight100 = widget.style.height === '100%';

        const color = '#014488'; // it is so, to be able to change color in web storm
        const border = `0.1em dashed ${color}`;
        const borderDisabled = '0.1em dashed #888';

        const resizable = this.isResizable();

        let resizeHandlers: ResizeHandler[] = resizable && this.state.resizeHandles ? this.state.resizeHandles : [];

        if (resizable && this.props.selectedGroup && this.props.selectedGroup === this.props.id) {
            resizeHandlers = ['s', 'e', 'se'];
        }

        const RESIZERS_OPACITY = 0.9;
        const RESIZERS_OPACITY_DISABLED = 0.5;

        const isRelative = widget.usedInWidget || this.props.isRelative;

        const controllable = {
            top: !isRelative && resizeHandlers.includes('n'),
            bottom: !widget.usedInWidget && !widgetHeight100 && resizeHandlers.includes('s'),
            left: !isRelative && resizeHandlers.includes('w'),
            right: !widget.usedInWidget && !widgetWidth100 && resizeHandlers.includes('e'),
            'top-left': !widgetHeight100 && !widgetWidth100 && !isRelative && resizeHandlers.includes('nw'),
            'top-right': !widgetHeight100 && !widgetWidth100 && !isRelative && resizeHandlers.includes('ne'),
            'bottom-left': !widgetHeight100 && !widgetWidth100 && !isRelative && resizeHandlers.includes('sw'),
            'bottom-right':
                !widgetHeight100 && !widgetWidth100 && !widget.usedInWidget && resizeHandlers.includes('se'),
        };

        const handlers: Record<string, Handler> = {
            top: {
                top: offsetEm,
                height: thicknessEm,
                left: controllable['top-left'] ? shiftEm : 0,
                right: controllable['top-right'] ? shiftEm : 0,
                cursor: 'ns-resize',
                background: 'transparent',
                opacity: controllable.top ? RESIZERS_OPACITY : RESIZERS_OPACITY_DISABLED,
                borderTop: controllable.top ? border : borderDisabled,
            },
            bottom: {
                bottom: offsetEm,
                height: thicknessEm,
                left: controllable['bottom-left'] ? shiftEm : 0,
                right: controllable['bottom-right'] ? shiftEm : 0,
                cursor: 'ns-resize',
                background: 'transparent',
                opacity: controllable.bottom ? RESIZERS_OPACITY : RESIZERS_OPACITY_DISABLED,
                borderBottom: controllable.bottom ? border : borderDisabled,
            },
            left: {
                top: controllable['top-left'] ? shiftEm : 0,
                bottom: controllable['bottom-left'] ? shiftEm : 0,
                left: offsetEm,
                width: thicknessEm,
                cursor: 'ew-resize',
                background: 'transparent',
                opacity: controllable.left ? RESIZERS_OPACITY : RESIZERS_OPACITY_DISABLED,
                borderLeft: controllable.left ? border : borderDisabled,
            },
            right: {
                top: controllable['top-right'] ? shiftEm : 0,
                bottom: controllable['bottom-right'] ? shiftEm : 0,
                right: offsetEm,
                width: thicknessEm,
                cursor: 'ew-resize',
                background: 'transparent',
                opacity: controllable.right ? RESIZERS_OPACITY : RESIZERS_OPACITY_DISABLED,
                borderRight: controllable.right ? border : borderDisabled,
            },
            'top-left': {
                top: squareShift,
                height: squareWidthHeight,
                left: squareShift,
                width: squareWidthHeight,
                cursor: 'nwse-resize',
                background: color,
                opacity: RESIZERS_OPACITY,
            },
            'top-right': {
                top: squareShift,
                height: squareWidthHeight,
                right: squareShift,
                width: squareWidthHeight,
                cursor: 'nesw-resize',
                background: color,
                opacity: RESIZERS_OPACITY,
            },
            'bottom-left': {
                bottom: squareShift,
                height: squareWidthHeight,
                left: squareShift,
                width: squareWidthHeight,
                cursor: 'nesw-resize',
                background: color,
                opacity: RESIZERS_OPACITY,
            },
            'bottom-right': {
                bottom: squareShift,
                height: squareWidthHeight,
                right: squareShift,
                width: squareWidthHeight,
                cursor: 'nwse-resize',
                background: color,
                opacity: RESIZERS_OPACITY,
            },
        };

        const style = {
            position: 'absolute',
            zIndex: 1001,
        };

        return Object.keys(handlers).map((key: string) => {
            const handler = handlers[key];
            if (!(controllable as Record<string, boolean>)[key]) {
                if (key.includes('-')) {
                    return null;
                }
                handler.cursor = 'default';
            }

            return (
                <div
                    key={key}
                    className="vis-editmode-resizer"
                    style={Object.assign(handler as React.CSSProperties, style)}
                    onMouseDown={
                        handler.opacity === RESIZERS_OPACITY ? e => this.onResizeStart(e, key as Resize) : undefined
                    }
                />
            );
        });
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    isUserMemberOfGroup(user: string, userGroups: string[]): boolean {
        if (!userGroups) {
            return true;
        }
        if (!Array.isArray(userGroups)) {
            userGroups = [userGroups];
        }

        return !!userGroups.find(groupId => {
            const group = this.props.context.userGroups[`system.group.${groupId}`];
            return group?.common?.members?.length && group.common.members.includes(`system.user.${user}`);
        });
    }

    static isWidgetFilteredOutStatic(
        viewsActiveFilter: { [view: string]: string[] } | null,
        widgetData: WidgetData | GroupData,
        view: string,
        editMode: boolean,
    ): boolean {
        if (!viewsActiveFilter) {
            console.warn(`viewsActiveFilter is not defined in ${view}, data: ${JSON.stringify(widgetData)}`);
            return false;
        }

        const vf = viewsActiveFilter[view];
        if (!editMode && widgetData?.filterkey && vf?.length) {
            if (vf[0] === '$') {
                return true;
            }

            let filterKeys: string[];

            if (typeof widgetData.filterkey === 'string') {
                // deprecated, but for back compatibility
                filterKeys = (widgetData.filterkey as any as string)
                    .split(',')
                    .map(f => f.trim())
                    .filter(f => f);
            } else {
                filterKeys = widgetData.filterkey;
            }

            // we cannot use here find as filterkey could be observable (can) and is not normal array
            for (let f = 0; f < filterKeys.length; f++) {
                if (vf.includes(filterKeys[f])) {
                    return false; // widget is not hidden
                }
            }
            return true;
        }

        return false;
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    isWidgetFilteredOut(widgetData: WidgetData | GroupData): boolean {
        return VisBaseWidget.isWidgetFilteredOutStatic(
            this.props.viewsActiveFilter,
            widgetData,
            this.props.view,
            this.state.editMode,
        );
    }

    static isWidgetHidden(widgetData: WidgetData | GroupData, states: VisRxWidgetStateValues, id: string): boolean {
        const oid = widgetData['visibility-oid'];
        const condition = widgetData['visibility-cond'];

        if (oid) {
            if (!Object.keys(states).includes(`${oid}.val`)) {
                // if we don't have state information yet - hide to prevent shortly showing widget during render
                return true;
            }

            let val = states[`${oid}.val`];

            if (val === undefined || val === null) {
                return condition === 'not exist';
            }

            let value = widgetData['visibility-val'];

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

            // Take care: return true if the widget is hidden!
            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') {
                        val = 'true';
                    }
                    if (value === '1') {
                        value = 'true';
                    }
                    if (val === '0') {
                        val = 'false';
                    }
                    if (value === '0') {
                        value = 'false';
                    }
                    return value !== val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') {
                        val = 'true';
                    }
                    if (value === '1') {
                        value = 'true';
                    }
                    if (val === '0') {
                        val = 'false';
                    }
                    if (value === '0') {
                        value = 'false';
                    }
                    return value === val;
                case '>=':
                    return val < value;
                case '<=':
                    return val > value;
                case '>':
                    return val <= value;
                case '<':
                    return val >= value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return !val.toString().includes(value);
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().includes(value);
                case 'exist':
                    return val === 'null';
                case 'not exist':
                    return val !== 'null';
                default:
                    console.log(`[${id}] Unknown visibility condition: ${condition}`);
                    return false;
            }
        } else {
            return condition && condition === 'not exist';
        }
    }

    /**
     * Render the widget body
     */
    renderWidgetBody(_props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        // Default render method. Normally it should be overwritten
        if (this.props.context.views.___settings?.ignoreNotLoaded && !this.state.editMode) {
            return null;
        }
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    background: 'repeating-linear-gradient(45deg, #333, #333 10px, #666 10px, #666 20px)',
                    color: '#FFF',
                }}
            >
                <div style={{ color: '#FF0000', paddingLeft: 10 }}>
                    {I18n.t('Unknown widget type "%s"', this.props.tpl)}
                </div>
                <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
            </div>
        );
    }

    changeOrder(e: React.MouseEvent, dir: number): void {
        e.stopPropagation();
        e.preventDefault();
        if (this.state.multiViewWidget || !this.state.editMode) {
            return;
        }

        const order = [...this.props.relativeWidgetOrder];

        const pos = order.indexOf(this.props.id);
        if (dir > 0) {
            if (pos === order.length - 1) {
                return;
            }
            const nextId = order[pos + 1];
            order[pos + 1] = this.props.id;
            order[pos] = nextId;
        } else if (!pos) {
            return;
        } else {
            const nextId = order[pos - 1];
            order[pos - 1] = this.props.id;
            order[pos] = nextId;
        }

        this.props.context.onWidgetsChanged(null, this.props.view, { order });
    }

    static formatValue(value: string | number, decimals: number | string, _format?: string): string {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals as any as string;
        }
        const format = _format === undefined ? '.,' : _format;
        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return Number.isNaN(value)
            ? ''
            : value
                  .toFixed(decimals || 0)
                  .replace(format[0], format[1])
                  .replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    }

    formatIntervalHelper(value: number, type: 'seconds' | 'minutes' | 'hours' | 'days'): string {
        let singular;
        let plural;
        let special24;
        if (this.props.context.lang === 'de') {
            if (type === 'seconds') {
                singular = 'Sekunde';
                plural = 'Sekunden';
            } else if (type === 'minutes') {
                singular = 'Minute';
                plural = 'Minuten';
            } else if (type === 'hours') {
                singular = 'Stunde';
                plural = 'Stunden';
            } else if (type === 'days') {
                singular = 'Tag';
                plural = 'Tagen';
            }
        } else if (this.props.context.lang === 'ru') {
            if (type === 'seconds') {
                singular = 'секунду';
                plural = 'секунд';
                special24 = 'секунды';
            } else if (type === 'minutes') {
                singular = 'минуту';
                plural = 'минут';
                special24 = 'минуты';
            } else if (type === 'hours') {
                singular = 'час';
                plural = 'часов';
                special24 = 'часа';
            } else if (type === 'days') {
                singular = 'день';
                plural = 'дней';
                special24 = 'дня';
            }
        } else if (type === 'seconds') {
            singular = 'second';
            plural = 'seconds';
        } else if (type === 'minutes') {
            singular = 'minute';
            plural = 'minutes';
        } else if (type === 'hours') {
            singular = 'hour';
            plural = 'hours';
        } else if (type === 'days') {
            singular = 'day';
            plural = 'days';
        }

        if (value === 1) {
            if (this.props.context.lang === 'de') {
                if (type === 'days') {
                    return `einem ${singular}`;
                }
                return `einer ${singular}`;
            }

            if (this.props.context.lang === 'ru') {
                if (type === 'days' || type === 'hours') {
                    return `один ${singular}`;
                }
                return `одну ${singular}`;
            }

            return `one ${singular}`;
        }

        if (this.props.context.lang === 'de') {
            return `${value} ${plural}`;
        }

        if (this.props.context.lang === 'ru') {
            const d = value % 10;
            if (d === 1 && value !== 11) {
                return `${value} ${singular}`;
            }
            if (d >= 2 && d <= 4 && (value > 20 || value < 10)) {
                return `${value} ${special24}`;
            }

            return `${value} ${plural}`;
        }

        return `${value} ${plural}`;
    }

    formatInterval(timestamp: number, isMomentJs?: boolean): string {
        if (isMomentJs) {
            // init moment
            return this.props.context.moment(new Date(timestamp)).fromNow();
        }
        let diff = Date.now() - timestamp;
        diff = Math.round(diff / 1000);
        let text;
        if (diff <= 60) {
            if (this.props.context.lang === 'de') {
                text = `vor ${this.formatIntervalHelper(diff, 'seconds')}`;
            } else if (this.props.context.lang === 'ru') {
                text = `${this.formatIntervalHelper(diff, 'seconds')} назад`;
            } else {
                text = `${this.formatIntervalHelper(diff, 'seconds')} ago`;
            }
        } else if (diff < 3600) {
            const m = Math.floor(diff / 60);
            const s = diff - m * 60;
            text = '';
            if (this.props.context.lang === 'de') {
                text = `vor ${this.formatIntervalHelper(m, 'minutes')}`;
            } else if (this.props.context.lang === 'ru') {
                text = this.formatIntervalHelper(m, 'minutes');
            } else {
                text = this.formatIntervalHelper(m, 'minutes');
            }

            if (m < 5) {
                // add seconds
                if (this.props.context.lang === 'de') {
                    text += ` und ${this.formatIntervalHelper(s, 'seconds')}`;
                } else if (this.props.context.lang === 'ru') {
                    text += ` и ${this.formatIntervalHelper(s, 'seconds')}`;
                } else {
                    text += ` and ${this.formatIntervalHelper(s, 'seconds')}`;
                }
            }

            if (this.props.context.lang === 'de') {
                // nothing
            } else if (this.props.context.lang === 'ru') {
                text += ' назад';
            } else {
                text += ' ago';
            }
        } else if (diff < 3600 * 24) {
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff - h * 3600) / 60);
            text = '';
            if (this.props.context.lang === 'de') {
                text = `vor ${this.formatIntervalHelper(h, 'hours')}`;
            } else if (this.props.context.lang === 'ru') {
                text = this.formatIntervalHelper(h, 'hours');
            } else {
                text = this.formatIntervalHelper(h, 'hours');
            }

            if (h < 10) {
                // add seconds
                if (this.props.context.lang === 'de') {
                    text += ` und ${this.formatIntervalHelper(m, 'minutes')}`;
                } else if (this.props.context.lang === 'ru') {
                    text += ` и ${this.formatIntervalHelper(m, 'minutes')}`;
                } else {
                    text += ` and ${this.formatIntervalHelper(m, 'minutes')}`;
                }
            }

            if (this.props.context.lang === 'de') {
                // nothing
            } else if (this.props.context.lang === 'ru') {
                text += ' назад';
            } else {
                text += ' ago';
            }
        } else {
            const d = Math.floor(diff / (3600 * 24));
            const h = Math.floor((diff - d * (3600 * 24)) / 3600);
            text = '';
            if (this.props.context.lang === 'de') {
                text = `vor ${this.formatIntervalHelper(d, 'days')}`;
            } else if (this.props.context.lang === 'ru') {
                text = this.formatIntervalHelper(d, 'days');
            } else {
                text = this.formatIntervalHelper(d, 'days');
            }

            if (d < 3) {
                // add seconds
                if (this.props.context.lang === 'de') {
                    text += ` und ${this.formatIntervalHelper(h, 'hours')}`;
                } else if (this.props.context.lang === 'ru') {
                    text += ` и ${this.formatIntervalHelper(h, 'hours')}`;
                } else {
                    text += ` and ${this.formatIntervalHelper(h, 'hours')}`;
                }
            }

            if (this.props.context.lang === 'de') {
                // nothing
            } else if (this.props.context.lang === 'ru') {
                text += ' назад';
            } else {
                text += ' ago';
            }
        }
        return text;
    }

    startUpdateInterval(): void {
        this.updateInterval =
            this.updateInterval ||
            setInterval(() => {
                const timeIntervalEl: HTMLDivElement = (this.widDiv || this.refService.current)?.querySelector(
                    '.time-interval',
                );
                if (timeIntervalEl) {
                    const time = parseInt(timeIntervalEl.dataset.time, 10);
                    timeIntervalEl.innerHTML = this.formatInterval(time, timeIntervalEl.dataset.moment === 'true');
                }
            }, 10_000);
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    formatDate(
        value: string | Date | number,
        format?: boolean | string,
        interval?: boolean,
        isMomentJs?: boolean,
        forRx?: boolean,
    ): string | React.JSX.Element {
        if (typeof format === 'boolean') {
            interval = format;
            format = 'auto';
        }

        if (format === 'auto') {
            format = `${this.props.context.dateFormat || 'DD.MM.YYYY'} hh:mm:ss`;
        }

        format = format || this.props.context.dateFormat || 'DD.MM.YYYY';

        if (!value) {
            return '';
        }
        let dateObj: Date;
        const text = typeof value;
        if (text === 'string') {
            dateObj = new Date(value);
        }
        if (text !== 'object') {
            if (isVarFinite(value as string)) {
                const i = parseInt(value as string, 10);
                // if greater than 2000.01.01 00:00:00
                if (i > 946681200000) {
                    dateObj = new Date(value);
                } else {
                    dateObj = new Date((value as number) * 1000);
                }
            } else {
                dateObj = new Date(value);
            }
        }
        if (interval) {
            this.startUpdateInterval();
            if (forRx) {
                return (
                    <span
                        className="time-interval"
                        data-time={dateObj.getTime()}
                        data-moment={isMomentJs || false}
                        title={dateObj.toLocaleString()}
                    >
                        {this.formatInterval(dateObj.getTime(), isMomentJs)}
                    </span>
                );
            }

            return `<span class="time-interval" data-time="${dateObj.getTime()}" data-moment="${isMomentJs || false}">${this.formatInterval(dateObj.getTime(), isMomentJs)}</span>`;
        }

        // Year
        if (format.includes('YYYY') || format.includes('JJJJ') || format.includes('ГГГГ')) {
            const yearStr = dateObj.getFullYear().toString();
            format = format.replace('YYYY', yearStr);
            format = format.replace('JJJJ', yearStr);
            format = format.replace('ГГГГ', yearStr);
        } else if (format.includes('YY') || format.includes('JJ') || format.includes('ГГ')) {
            const yearStr = (dateObj.getFullYear() % 100).toString();
            format = format.replace('YY', yearStr);
            format = format.replace('JJ', yearStr);
            format = format.replace('ГГ', yearStr);
        }
        // Month
        if (format.includes('MM') || format.includes('ММ')) {
            const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            format = format.replace('MM', monthStr);
            format = format.replace('ММ', monthStr);
        } else if (format.includes('M') || format.includes('М')) {
            const monthStr = (dateObj.getMonth() + 1).toString();
            format = format.replace('M', monthStr);
            format = format.replace('М', monthStr);
        }

        // Day
        if (format.includes('DD') || format.includes('TT') || format.includes('ДД')) {
            const dateStr = dateObj.getDate().toString().padStart(2, '0');
            format = format.replace('DD', dateStr);
            format = format.replace('TT', dateStr);
            format = format.replace('ДД', dateStr);
        } else if (format.includes('D') || format.includes('TT') || format.includes('Д')) {
            const dateStr = dateObj.getDate().toString();
            format = format.replace('D', dateStr);
            format = format.replace('T', dateStr);
            format = format.replace('Д', dateStr);
        }

        // hours
        if (format.includes('hh') || format.includes('SS') || format.includes('чч')) {
            const hoursStr = dateObj.getHours().toString().padStart(2, '0');
            format = format.replace('hh', hoursStr);
            format = format.replace('SS', hoursStr);
            format = format.replace('чч', hoursStr);
        } else if (format.includes('h') || format.includes('S') || format.includes('ч')) {
            const hoursStr = dateObj.getHours().toString();
            format = format.replace('h', hoursStr);
            format = format.replace('S', hoursStr);
            format = format.replace('ч', hoursStr);
        }

        // minutes
        if (format.includes('mm') || format.includes('мм')) {
            const minutesStr = dateObj.getMinutes().toString().padStart(2, '0');
            format = format.replace('mm', minutesStr);
            format = format.replace('мм', minutesStr);
        } else if (format.includes('m') || format.includes('м')) {
            const minutesStr = dateObj.getMinutes().toString();
            format = format.replace('m', minutesStr);
            format = format.replace('v', minutesStr);
        }

        // milliseconds
        if (format.includes('sss') || format.includes('ссс')) {
            const msStr = dateObj.getMilliseconds().toString().padStart(3, '0');
            format = format.replace('sss', msStr);
            format = format.replace('ссс', msStr);
        }

        // seconds
        if (format.includes('ss') || format.includes('сс')) {
            const secondsStr = dateObj.getSeconds().toString().padStart(2, '0');
            format = format.replace('ss', secondsStr);
            format = format.replace('cc', secondsStr);
        } else if (format.includes('s') || format.includes('с')) {
            const secondsStr = dateObj.getSeconds().toString();
            format = format.replace('s', secondsStr);
            format = format.replace('с', secondsStr);
        }

        return format;
    }

    onToggleRelative(e: React.MouseEvent): void {
        e.stopPropagation();
        e.preventDefault();

        const widget = this.props.context.views[this.props.view].widgets[this.props.id];

        const width = this.props.isRelative ? widget.style.absoluteWidth || '100px' : '100%';

        this.props.context.onWidgetsChanged([
            {
                wid: this.props.id,
                view: this.props.view,
                style: {
                    position: this.props.isRelative ? 'absolute' : 'relative',
                    width,
                    absoluteWidth: !this.props.isRelative ? widget.style.width : null,
                    noPxToPercent: true, // special command
                },
            },
        ]);
    }

    onToggleWidth(e: React.MouseEvent): void {
        e.stopPropagation();
        e.preventDefault();
        const widget = this.props.context.views[this.props.view].widgets[this.props.id];

        this.props.context.onWidgetsChanged([
            {
                wid: this.props.id,
                view: this.props.view,
                style: {
                    width: widget.style.width === '100%' ? widget.style.absoluteWidth || '100px' : '100%',
                    absoluteWidth: widget.style.width !== '100%' ? widget.style.width : null,
                    noPxToPercent: true, // special command
                },
            },
        ]);
    }

    onToggleLineBreak(e: React.MouseEvent): void {
        e.stopPropagation();
        e.preventDefault();

        const widget = this.props.context.views[this.props.view].widgets[this.props.id];

        this.props.context.onWidgetsChanged([
            {
                wid: this.props.id,
                view: this.props.view,
                style: { newLine: !widget.style.newLine },
            },
        ]);
    }

    static correctStylePxValue(value: string | number): string | number {
        if (typeof value === 'string') {
            if (isVarFinite(value)) {
                return parseFloat(value) || 0;
            }
        }

        return value;
    }

    renderRelativeMoveMenu(): React.JSX.Element | null {
        if (this.props.context.runtime || !this.state.editMode) {
            return null;
        }

        return (
            <VisOrderMenu
                anchorEl={this.state.showRelativeMoveMenu ? this.relativeMoveMenu : undefined}
                order={this.props.relativeWidgetOrder}
                wid={this.props.id}
                view={this.props.view}
                views={this.props.context.views}
                themeType={this.props.context.themeType}
                onClose={(order: AnyWidgetId[]) => {
                    this.props.onIgnoreMouseEvents(false);
                    this.setState({ showRelativeMoveMenu: false });
                    order && this.props.context.onWidgetsChanged(null, this.props.view, { order });
                }}
            />
        );
    }

    render(): React.JSX.Element | null {
        const widget = this.props.context.views[this.props.view].widgets[this.props.id];
        if (!widget || typeof widget !== 'object') {
            console.error(`EMPTY Widget: ${this.props.id}`);
            return null;
        }

        const style: React.CSSProperties = {
            boxSizing: 'border-box',
        };
        const selected =
            !this.state.multiViewWidget && this.state.editMode && this.props.selectedWidgets?.includes(this.props.id);
        const classNames = selected ? ['vis-editmode-selected'] : ['vis-editmode-overlay-not-selected'];
        if (selected && this.state.widgetHint === 'hide') {
            classNames.push('vis-editmode-selected-background');
        }

        if (this.state.editMode && !(widget.groupid && !this.props.selectedGroup)) {
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'top')) {
                style.top = VisBaseWidget.correctStylePxValue(this.state.style.top);
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'left')) {
                style.left = VisBaseWidget.correctStylePxValue(this.state.style.left);
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'width')) {
                style.width = VisBaseWidget.correctStylePxValue(this.state.style.width);
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'height')) {
                style.height = VisBaseWidget.correctStylePxValue(this.state.style.height);
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'right')) {
                style.right = VisBaseWidget.correctStylePxValue(this.state.style.right);
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'bottom')) {
                style.bottom = VisBaseWidget.correctStylePxValue(this.state.style.bottom);
            }

            style.position = this.props.isRelative ? 'relative' : 'absolute';
            style.userSelect = 'none';

            if (selected) {
                if (
                    this.props.moveAllowed &&
                    this.state.draggable !== false &&
                    !this.props.isRelative &&
                    (!this.props.selectedGroup || this.props.selectedGroup !== this.props.id)
                ) {
                    style.cursor = 'move';
                } else {
                    style.cursor = 'default';
                }
            } else if (widget.data?.locked) {
                style.cursor = 'default';
            } else if (this.props.selectedGroup !== this.props.id && !this.state.multiViewWidget) {
                style.cursor = 'pointer';
            }

            if (this.props.tpl?.toLowerCase().includes('image')) {
                classNames.push('vis-editmode-helper');
            }
        }

        const props = {
            className: '',
            overlayClassNames: classNames,
            style,
            id: `rx_${this.props.id}`,
            refService: this.refService,
            widget,
        };

        // If the resizable flag can be controlled dynamically by settings, and it is now not resizable
        let doNotTakeWidth = false;
        let doNotTakeHeight = false;
        if (this.visDynamicResizable && !this.isResizable()) {
            if (this.visDynamicResizable.desiredSize === false) {
                doNotTakeWidth = true;
                doNotTakeHeight = true;
                delete style.width;
                delete style.height;
            } else if (typeof this.visDynamicResizable.desiredSize === 'object') {
                if (this.state.style.width) {
                    style.width = VisBaseWidget.correctStylePxValue(this.visDynamicResizable.desiredSize.width);
                } else {
                    doNotTakeWidth = true;
                    delete style.width;
                }

                if (this.state.style.height) {
                    style.height = VisBaseWidget.correctStylePxValue(this.visDynamicResizable.desiredSize.height);
                } else {
                    doNotTakeHeight = true;
                    delete style.height;
                }
            }
        }

        if (
            this.props.isRelative &&
            isVarFinite(this.props.context.views[this.props.view].settings?.rowGap as string)
        ) {
            style.marginBottom = parseFloat(this.props.context.views[this.props.view].settings?.rowGap as string) || 0;
        }

        const rxWidget = this.renderWidgetBody(props as any);

        if (doNotTakeWidth) {
            delete style.width;
        }
        if (doNotTakeHeight) {
            delete style.height;
        }

        // in group edit mode show it in the top left corner
        if (this.props.id === this.props.selectedGroup) {
            style.top = 0;
            style.left = 0;
        }

        if (!this.props.isRelative) {
            style.top = style.top || 0;
            style.left = style.left || 0;
        }

        // convert string to number+'px'
        [
            'top',
            'left',
            'width',
            'height',
            'right',
            'bottom',
            'fontSize',
            'borderRadius',
            'paddingLeft',
            'paddingTop',
            'paddingRight',
            'paddingBottom',
            'marginTop',
            'marginBottom',
            'marginLeft',
            'marginRight',
            'borderWidth',
        ].forEach(attr => {
            const anyStyle = style as Record<string, number | string | undefined>;
            if (anyStyle[attr] !== undefined && typeof anyStyle[attr] === 'string') {
                if (isVarFinite(anyStyle[attr])) {
                    anyStyle[attr] = parseFloat(anyStyle[attr] as any as string) || 0;
                } else if (anyStyle[attr].includes('{')) {
                    // try to steal style by rxWidget
                    const value = (this.state.rxStyle as Record<string, string | undefined>)?.[attr];
                    if (this.state.rxStyle && value !== undefined) {
                        if (value && typeof value === 'string' && !value.includes('{')) {
                            anyStyle[attr] = VisBaseWidget.correctStylePxValue(value);
                        }
                    } else {
                        const styleVal: string | number | undefined | null = (
                            this.props.context.allWidgets[this.props.id]?.style as unknown as Record<
                                string,
                                string | number
                            >
                        )?.[attr];
                        if (styleVal !== undefined && styleVal !== null) {
                            // try to steal style by canWidget
                            if (!styleVal.toString().includes('{')) {
                                anyStyle[attr] = VisBaseWidget.correctStylePxValue(styleVal);
                            }
                        }
                    }
                }
            }
        });

        classNames.push('vis-editmode-overlay');

        let widgetName = null;
        let widgetMoveButtons = null;
        const borderWidth =
            (typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth) || '0px';
        if (
            this.state.widgetHint !== 'hide' &&
            !this.state.hideHelper &&
            this.state.editMode &&
            (!widget.groupid || this.props.selectedGroup) &&
            this.props.selectedGroup !== this.props.id &&
            this.props.context.showWidgetNames !== false
        ) {
            // show widget name on widget body
            const widgetNameBottom =
                !widget.usedInWidget &&
                (this.refService.current?.offsetTop === 0 ||
                    (this.refService.current?.offsetTop && this.refService.current?.offsetTop < 15));

            // come again when the ref is filled
            if (!this.refService.current) {
                setTimeout(() => this.forceUpdate(), 50);
            }

            const parts: (string | null)[] = this.state.multiViewWidget ? this.props.id.split('_') : [null, null];
            const multiView: string | null = parts[0];
            const multiId: AnyWidgetId | null = parts[1] as AnyWidgetId | null;

            const resizable = !widget.usedInWidget && this.isResizable();

            widgetName = (
                <div
                    title={
                        this.state.multiViewWidget
                            ? I18n.t('Jump to widget by double click')
                            : this.props.tpl === '_tplGroup'
                              ? I18n.t('Switch to group edit mode by double click')
                              : undefined
                    }
                    className={Utils.clsx(
                        'vis-editmode-widget-name',
                        selected && 'vis-editmode-widget-name-selected',
                        this.state.widgetHint,
                        widgetNameBottom && 'vis-editmode-widget-name-bottom',
                        this.props.isRelative && resizable && 'vis-editmode-widget-name-long',
                    )}
                    style={{
                        top: widgetNameBottom ? undefined : `calc(-14px - ${borderWidth})`,
                    }}
                    onMouseDown={e => {
                        if (this.props.context.setSelectedWidgets) {
                            this.onMouseDown(e);
                        }
                    }}
                >
                    <span>
                        {this.state.multiViewWidget
                            ? I18n.t('%s from %s', multiId as string, multiView)
                            : widget.data?.name || this.props.id}
                    </span>
                    {this.state.multiViewWidget || widget.usedInWidget ? null : (
                        <AnchorIcon
                            onMouseDown={e => this.onToggleRelative(e)}
                            className={Utils.clsx(
                                'vis-anchor',
                                this.props.isRelative ? 'vis-anchor-enabled' : 'vis-anchor-disabled',
                            )}
                        />
                    )}
                    {this.state.multiViewWidget ||
                    !this.props.isRelative ||
                    !resizable ||
                    widget.usedInWidget ? null : (
                        <ExpandIcon
                            onMouseDown={e => this.onToggleWidth(e)}
                            className={Utils.clsx(
                                'vis-expand',
                                widget.style.width === '100%' ? 'vis-expand-enabled' : 'vis-expand-disabled',
                            )}
                        />
                    )}
                    {this.state.multiViewWidget || !this.props.isRelative || widget.usedInWidget ? null : (
                        <KeyboardReturn
                            onMouseDown={e => this.onToggleLineBreak(e)}
                            className={Utils.clsx(
                                'vis-new-line',
                                widget.style.newLine ? 'vis-new-line-enabled' : 'vis-new-line-disabled',
                            )}
                        />
                    )}
                </div>
            );

            if (this.props.isRelative && !this.state.multiViewWidget && !widget.usedInWidget) {
                const pos = this.props.relativeWidgetOrder.indexOf(this.props.id);
                const showUp = !!pos;
                let showDown = pos !== this.props.relativeWidgetOrder.length - 1;
                if (showDown && this.props.selectedGroup) {
                    // Check if the next widget is relative
                    const widget__ =
                        this.props.context.views[this.props.view].widgets[this.props.relativeWidgetOrder[pos + 1]];
                    if (widget__.style.position === 'absolute') {
                        showDown = false;
                    }
                }

                if (showUp || showDown) {
                    widgetMoveButtons = (
                        <div
                            className={Utils.clsx(
                                'vis-editmode-widget-move-buttons',
                                this.state.widgetHint,
                                widgetNameBottom && 'vis-editmode-widget-name-bottom',
                            )}
                            style={{ width: !showUp || !showDown ? 30 : undefined }}
                        >
                            <div className="vis-editmode-widget-number">
                                {this.props.relativeWidgetOrder.indexOf(this.props.id) + 1}
                            </div>
                            {showUp ? (
                                <div
                                    className="vis-editmode-move-button"
                                    title={I18n.t('Move widget up or press longer to open re-order menu')}
                                >
                                    <UpIcon
                                        onMouseDown={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            this.pressTimeout = setTimeout(
                                                target => {
                                                    this.props.onIgnoreMouseEvents(true);
                                                    this.relativeMoveMenu = target;
                                                    this.setState({ showRelativeMoveMenu: true });
                                                    this.pressTimeout = undefined;
                                                },
                                                300,
                                                e.currentTarget,
                                            );
                                        }}
                                        onMouseUp={e => this.changeOrder(e, -1)}
                                    />
                                </div>
                            ) : null}
                            {showDown ? (
                                <div
                                    className="vis-editmode-move-button"
                                    style={{ left: showUp ? 30 : undefined }}
                                    title={I18n.t('Move widget down or press longer to open re-order menu')}
                                >
                                    <DownIcon
                                        onMouseDown={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            this.pressTimeout = setTimeout(
                                                target => {
                                                    this.props.onIgnoreMouseEvents(true);
                                                    this.relativeMoveMenu = target;
                                                    this.setState({ showRelativeMoveMenu: true });
                                                    this.pressTimeout = undefined;
                                                },
                                                300,
                                                e.currentTarget,
                                            );
                                        }}
                                        onMouseUp={e => this.changeOrder(e, 1)}
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                }
            }

            calculateOverflow(style);
        }

        // if multi-view widget and it is not "canJS", dim it in edit mode
        if (!this.isCanWidget && this.state.multiViewWidget && this.state.editMode) {
            if (style.opacity === undefined || style.opacity === null || (style.opacity as number) > 0.5) {
                style.opacity = 0.5;
            }
        }

        const overlay =
            !this.state.hideHelper && // if the helper isn't hidden
            !widget.usedInWidget && // not used in another widget, that has own overlay
            this.state.editMode && // if edit mode
            !widget.data.locked && // if not locked
            (!widget.groupid || this.props.selectedGroup) && // if not in group or in the edit group mode
            this.props.selectedGroup !== this.props.id ? ( // and it does not the edited group itself
                <div
                    className={classNames.join(' ')}
                    onMouseDown={e => {
                        if (this.props.context.setSelectedWidgets) {
                            this.onMouseDown(e);
                        }
                    }}
                />
            ) : null;

        let groupInstructions = null;

        // Show border of the group if in group edit mode
        if (this.props.selectedGroup === this.props.id) {
            style.borderBottom = '1px dotted #888';
            style.borderRight = '1px dotted #888';
            groupInstructions = (
                <div
                    style={{
                        position: 'absolute',
                        bottom: -24,
                        left: 0,
                        fontSize: 10,
                        fontStyle: 'italic',
                        opacity: 0.5,
                        width: 350,
                        cursor: 'pointer',
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        this.props.context.setSelectedWidgets([this.props.id]);
                    }}
                >
                    {I18n.t('group_size_hint')}
                </div>
            );
        }

        const signals = this.renderSignals ? this.renderSignals() : null;

        const lastChange = this.renderLastChange ? this.renderLastChange(style) : null;

        return (
            <div
                id={props.id}
                className={props.className}
                ref={this.refService}
                style={style}
            >
                {signals}
                {lastChange}
                {widgetName}
                {widgetMoveButtons}
                {overlay}
                {this.getResizeHandlers(selected, widget, borderWidth)}
                {rxWidget}
                {groupInstructions}
                {this.state.showRelativeMoveMenu && this.renderRelativeMoveMenu()}
            </div>
        );
    }
}

export default VisBaseWidget;
