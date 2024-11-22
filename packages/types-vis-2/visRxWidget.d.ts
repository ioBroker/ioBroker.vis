/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2022-2024 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */
import type React from 'react';
import type { Component, JSX } from 'react';
import type { AnyWidgetId, RxWidgetInfo, VisRxWidgetStateValues, StateID, RxWidgetInfoAttributesField, RxRenderWidgetProps, RxWidgetInfoWriteable, Writeable, VisViewProps, VisBaseWidgetProps, VisWidgetCommand } from './index';
import type { VisBaseWidgetState } from './visBaseWidget';
import type VisBaseWidget from './visBaseWidget';
type VisRxWidgetProps = VisBaseWidgetProps;

interface VisRxData {
    _originalData?: string;
    filterkey?: string | string[];
    /** If value is hide widget should be hidden if user not in groups, else disabled */
    'visibility-groups-action': 'hide' | 'disabled';
    /** If entry in an array but user not in array, apply visibility-groups-action logic */
    'visibility-groups': string[];
}

export interface VisRxWidgetState extends VisBaseWidgetState {
    rxData: VisRxData;
    values: VisRxWidgetStateValues;
    visible: boolean;
    disabled?: boolean;
}

export declare const POSSIBLE_MUI_STYLES: string[];

declare class VisRxWidget<TRxData extends Record<string, any>, TState extends Partial<VisRxWidgetState> = VisRxWidgetState> extends VisBaseWidget<VisRxWidgetState & TState & {
    rxData: TRxData;
}> {
    static POSSIBLE_MUI_STYLES: string[];
    private linkContext;
    /** Method called when state changed */
    private readonly onStateChangedBind;
    private newState?;
    private wrappedContent?;
    private updateTimer?;
    private ignoreMouseEvents?;
    private mouseDownOnView?;
    private bindingsTimer?;
    private informIncludedWidgets?;
    private filterDisplay?;
    constructor(props: VisRxWidgetProps);
    static findField(widgetInfo: RxWidgetInfo | RxWidgetInfoWriteable, name: string): Writeable<RxWidgetInfoAttributesField> | null;
    static getI18nPrefix(): string;
    static getText(text: string | ioBroker.Translated): any;
    static t(key: string, ...args: string[]): string;
    static getLanguage(): ioBroker.Languages;
    onCommand(command: VisWidgetCommand, _option?: any): any;
    onStateUpdated(id: string, state: ioBroker.State): void;
    onIoBrokerStateChanged: (id: StateID, state: ioBroker.State | null | undefined) => void;
    /**
     * Called if ioBroker state changed
     */
    onStateChanged(
    /** state object */
    id?: StateID | null,
    /** state value */
    state?: ioBroker.State | null | undefined,
    /** if state should not be set */
    doNotApplyState?: boolean): Partial<VisRxWidgetState & TState & {
        rxData: TRxData;
    }>;
    applyBinding(stateId: string, newState: typeof this.state): void;
    componentDidMount(): void;
    onRxDataChanged(_prevRxData: typeof this.state.rxData): void;
    onRxStyleChanged(_prevRxStyle: typeof this.state.rxStyle): void;
    componentDidUpdate(prevProps: VisRxWidgetProps, prevState: typeof this.state): void;
    componentWillUnmount(): void;
    /**
     * Check if the logged-in user's group has visibility permissions for this widget
     */
    isWidgetVisibleForGroup(newState: typeof this.newState): boolean;
    /**
     * Checks if widget is visible, according to the state, id
     *
     * @param stateId state id to check visibility for
     * @param newState the new state
     */
    checkVisibility(stateId?: string | null, newState?: typeof this.newState): boolean;
    onPropertiesUpdated(): Promise<void>;
    formatValue(value: number | string, round: number): string;
    wrapContent(content: React.JSX.Element | React.JSX.Element[], addToHeader?: React.JSX.Element | null | React.JSX.Element[], cardContentStyle?: React.CSSProperties, headerStyle?: React.CSSProperties, onCardClick?: (e?: React.MouseEvent<HTMLDivElement>) => void, components?: Record<string, Component<any>>): any;
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null;
    getWidgetView(view: string, props?: Partial<VisViewProps>): JSX.Element;
    getWidgetInWidget(view: string, wid: AnyWidgetId, props?: {
        index?: number;
        refParent?: React.RefObject<HTMLDivElement>;
        isRelative?: boolean;
    }): any;
    isSignalVisible(index: number): any;
    static text2style(textStyle: string, style: any): any;
    renderSignal(index: number): JSX.Element;
    renderLastChange(widgetStyle: any): JSX.Element;
    renderSignals(): React.ReactNode;
    render(): any;
    /**
     * Get information about specific widget, needs to be implemented by widget class
     */
    getWidgetInfo(): Readonly<RxWidgetInfo>;
}
export default VisRxWidget;
