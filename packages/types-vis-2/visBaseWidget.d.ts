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
import type React, { type JSX } from 'react';
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
} from './index';

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
    applyBindings?:
        | false
        | true
        | {
              top: string | number;
              left: string | number;
          };
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
declare class VisBaseWidget<TState extends Partial<VisBaseWidgetState> = VisBaseWidgetState> extends React.Component<
    VisBaseWidgetProps,
    TState & VisBaseWidgetState
> {
    static FORBIDDEN_CHARS: RegExp;
    /** We do not store the SVG Element in the state because it is cyclic */
    // eslint-disable-next-line react/no-unused-class-component-methods
    private relativeMoveMenu?: EventTarget & SVGSVGElement;
    /** if currently resizing */
    // eslint-disable-next-line react/no-unused-class-component-methods
    private resize: Resize;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private readonly uuid: string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected refService: React.refObject<HTMLDivElement>;
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected widDiv: null | CanHTMLDivElement;
    // eslint-disable-next-line react/no-unused-class-component-methods
    readonly onCommandBound: typeof this.onCommand;
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected onResize: undefined | (() => void);
    // eslint-disable-next-line react/no-unused-class-component-methods
    private updateInterval?: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private pressTimeout?: ReturnType<typeof setTimeout>;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private shadowDiv: HTMLDivElement | null;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private stealCursor?: string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private beforeIncludeColor?: string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    private lastClick?: number;
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected movement?: VisBaseWidgetMovement;
    /** If resizing is currently locked */
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected resizeLocked?: boolean;
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected visDynamicResizable:
        | undefined
        | null
        | {
              default: boolean;
              desiredSize:
                  | {
                        width: number;
                        height: number;
                    }
                  | boolean;
          };
    // eslint-disable-next-line react/no-unused-class-component-methods
    protected isCanWidget?: boolean;
    constructor(props: VisBaseWidgetProps);
    static replacePRJ_NAME(data: Record<string, any>, style: Record<string, any>, props: VisBaseWidgetProps): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onCommand(command: VisWidgetCommand, _option?: any): any;
    static getDerivedStateFromProps(props: VisBaseWidgetProps, state: VisBaseWidgetState): Partial<VisBaseWidgetState>;
    static removeFromArray(items: Record<string, any>, IDs: string[], view: string, widget: string): void;
    static parseStyle(style: string, isRxStyle?: boolean): Record<string, string | number>;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onMouseDown(e: React.MouseEvent): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    createWidgetMovementShadow(): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    isResizable(): boolean;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onMove: (
        x: number | undefined,
        y: number | undefined,
        save?: boolean,
        calculateRelativeWidgetPosition?:
            | null
            | ((id: AnyWidgetId, left: string, top: string, shadowDiv: HTMLDivElement, order: AnyWidgetId[]) => void),
    ) => void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onTempSelect: (selected?: boolean) => void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onResizeStart(e: React.MouseEvent, type: Resize): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    getResizeHandlers(selected: boolean, widget: Widget, borderWidth: string): JSX.Element[];
    // eslint-disable-next-line react/no-unused-class-component-methods
    isUserMemberOfGroup(user: string, userGroups: string[]): boolean;
    static isWidgetFilteredOutStatic(
        viewsActiveFilter: {
            [view: string]: string[];
        } | null,
        widgetData: WidgetData | GroupData,
        view: string,
        editMode: boolean,
    ): boolean;
    // eslint-disable-next-line react/no-unused-class-component-methods
    isWidgetFilteredOut(widgetData: WidgetData | GroupData): boolean;
    static isWidgetHidden(widgetData: WidgetData | GroupData, states: VisRxWidgetStateValues, id: string): boolean;
    /**
     * Render the widget body
     *
     * @param _props
     */
    // eslint-disable-next-line react/no-unused-class-component-methods
    renderWidgetBody(_props: RxRenderWidgetProps): JSX.Element | JSX.Element[] | null;
    // eslint-disable-next-line react/no-unused-class-component-methods
    changeOrder(e: React.MouseEvent, dir: number): void;
    static formatValue(value: string | number, decimals: number | string, _format?: string): string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    formatIntervalHelper(value: number, type: 'seconds' | 'minutes' | 'hours' | 'days'): string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    formatInterval(timestamp: number, isMomentJs: boolean): string;
    // eslint-disable-next-line react/no-unused-class-component-methods
    startUpdateInterval(): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    formatDate(
        value: string | Date | number,
        format?: boolean | string,
        interval?: boolean,
        isMomentJs?: boolean,
        forRx?: boolean,
    ): string | JSX.Element;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onToggleRelative(e: React.MouseEvent): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onToggleWidth(e: React.MouseEvent): void;
    // eslint-disable-next-line react/no-unused-class-component-methods
    onToggleLineBreak(e: React.MouseEvent): void;
    static correctStylePxValue(value: string | number): string | number;
    // eslint-disable-next-line react/no-unused-class-component-methods
    renderRelativeMoveMenu(): JSX.Element;

    render(): JSX.Element;
}
export default VisBaseWidget;
