import React, { useRef } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { DndProvider, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

import {
    IconButton,
    Paper,
    Popper,
    Tab,
    Tabs,
    Tooltip,
    LinearProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    Box,
} from '@mui/material';

import {
    Add as AddIcon,
    Close as CloseIcon,
    Code as CodeIcon,
    CodeOff as CodeOffIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    Palette as IconPalette,
    ListAlt as IconAttributes,
    ClearAll as ClearAllIcon,
    Layers,
} from '@mui/icons-material';

import {
    I18n,
    Utils,
    Confirm as ConfirmDialog,
    Message as MessageDialog,
    SelectFile as SelectFileDialog,
    Icon,
    type IobTheme,
    type LegacyConnection,
    type ThemeName,
} from '@iobroker/adapter-react-v5';

import type {
    AnyWidgetId,
    GroupData,
    GroupWidget,
    GroupWidgetId,
    MarketplaceWidgetRevision,
    Project,
    RxWidgetInfoGroup,
    SingleWidget,
    SingleWidgetId,
    ViewSettings,
    Widget,
    WidgetData,
    WidgetSetName,
    WidgetStyle,
    VisTheme,
} from '@iobroker/types-vis-2';
import { recalculateFields, store, updateProject } from './Store';
import {
    isGroup,
    getNewWidgetId,
    getNewGroupId,
    pasteGroup,
    unsyncMultipleWidgets,
    deepClone,
    pasteSingleWidget,
} from './Utils/utils';

import Attributes from './Attributes';
import Palette from './Palette';
import Toolbar from './Toolbar';
import CodeDialog from './Components/CodeDialog';
import CreateFirstProjectDialog from './Components/CreateFirstProjectDialog';
import { DndPreview, isTouchDevice } from './Utils';
import VisWidgetsCatalog, {
    getWidgetTypes,
    parseAttributes,
    type WidgetAttributesGroupInfoStored,
    type WidgetType,
} from './Vis/visWidgetsCatalog';
import VisContextMenu from './Vis/visContextMenu';
import Runtime, { type RuntimeProps, type RuntimeState } from './Runtime';
import ImportProjectDialog from './Toolbar/ProjectsManager/ImportProjectDialog';
import { findWidgetUsages } from './Vis/visUtils';
import MarketplaceDialog, { type MarketplaceDialogProps } from './Marketplace/MarketplaceDialog';
import type { VisEngineHandlers } from './Vis/visView';

const styles: Record<string, any> = {
    block: {
        overflow: 'auto',
        height: 'calc(100vh - 102px)',
        padding: '0px 8px',
    },
    blockNarrow: {
        height: 'calc(100vh - 67px)',
    },
    blockVeryNarrow: {
        height: 'calc(100vh - 39px)',
    },
    canvas: {
        height: 'calc(100vh - 154px)',
    },
    canvasNarrow: {
        height: 'calc(100vh - 119px)',
    },
    canvasVeryNarrow: {
        height: 'calc(100vh - 91px)',
    },
    menu: {
        display: 'flex',
        alignItems: 'center',
    },
    app: (theme: IobTheme): React.CSSProperties => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    }),
    tabsContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    tab: {
        padding: '6px 12px',
    },
    tabButton: {
        display: 'inline-block',
        lineHeight: '36px',
        verticalAlign: 'top',
    },
    groupEditTab: (theme: VisTheme): React.CSSProperties => ({
        color: theme.palette.mode === 'dark' ? '#bad700' : '#f3bf00',
    }),
    tabsName: {
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        textTransform: 'none',
    },
    viewTabs: (theme: VisTheme): React.CSSProperties => ({
        display: 'inline-block',
        ...theme.classes.viewTabs,
    }),
    viewTab: (theme: VisTheme): React.CSSProperties => ({
        padding: '6px 12px',
        ...theme.classes.viewTab,
    }),
    buttonShowAttributes: {
        position: 'absolute',
        top: 4,
        right: 0,
        zIndex: 10,
    },
    buttonShowPalette: {
        // position: 'absolute',
        // top: 4,
        // left: 0,
        // zIndex: 10,
    },
    iconBlink: {
        animationName: 'colorBlink',
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
    },
    listItemIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    loadingText: (theme: VisTheme): React.CSSProperties => ({
        position: 'absolute',
        height: 50,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        color: theme.palette.mode === 'dark' ? 'white' : 'black',
        width: 320,
        zIndex: 2000,
        top: 50,
        borderRadius: '10px',
        left: 'calc(50% - 160px)',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }),
};

interface ViewDropProps {
    addMarketplaceWidget: Editor['addMarketplaceWidget'];
    addWidget: Editor['addWidget'];
    editMode: boolean;
    children: React.JSX.Element;
}

const ViewDrop: React.FC<ViewDropProps> = props => {
    const targetRef = useRef<HTMLDivElement>();

    const [{ CanDrop, isOver }, drop] = useDrop<
        {
            widgetSet: WidgetSetName;
            widgetType: WidgetType | MarketplaceWidgetRevision;
        },
        unknown,
        {
            isOver: boolean;
            CanDrop: boolean;
        }
    >(
        () => ({
            accept: ['widget'],
            drop(item, monitor) {
                if (targetRef.current) {
                    if (item.widgetSet === '__marketplace') {
                        void props.addMarketplaceWidget(
                            (item.widgetType as MarketplaceWidgetRevision).id,
                            monitor.getClientOffset().x - targetRef.current.getBoundingClientRect().x,
                            monitor.getClientOffset().y - targetRef.current.getBoundingClientRect().y,
                        );
                    } else {
                        void props.addWidget(
                            item.widgetType.name,
                            monitor.getClientOffset().x - targetRef.current.getBoundingClientRect().x,
                            monitor.getClientOffset().y - targetRef.current.getBoundingClientRect().y,
                        );
                    }
                }
            },
            canDrop: () => props.editMode,
            collect: monitor => ({
                isOver: monitor.isOver(),
                CanDrop: monitor.canDrop(),
            }),
        }),
        [props.editMode],
    );

    return (
        <div
            ref={drop}
            style={
                isOver && CanDrop
                    ? {
                          borderStyle: 'dashed',
                          borderRadius: 4,
                          borderWidth: 1,
                          height: '100%',
                          width: '100%',
                      }
                    : { height: '100%', width: '100%' }
            }
        >
            <div
                ref={targetRef}
                style={{ height: '100%', width: '100%' }}
            >
                {props.children}
            </div>
        </div>
    );
};

export interface EditorProps extends RuntimeProps {
    version: string;
}

export interface EditorState extends RuntimeState {
    theme: VisTheme;
    needSave: boolean;
    widgetsClipboard: {
        type: 'cut' | 'copy' | '';
        view?: string;
        widgets: Record<string, Widget>;
        groupMembers?: Record<string, Widget>;
    };
    loadingProgress: {
        step: number;
        total: number;
    };
    deleteWidgetsDialog: boolean;
    viewsManager: boolean;
    updateWidgetsDialog: MarketplaceWidgetRevision | false;
    align: {
        alignType: 'width' | 'height';
        alignIndex: number;
        alignValues: number[];
    };
    showCode: boolean;
    marketplaceDialog: Partial<MarketplaceDialogProps> | false;
    askAboutInclude: {
        wid: AnyWidgetId;
        toWid: AnyWidgetId;
        cb: (wid: AnyWidgetId, toWid: AnyWidgetId) => void;
    };
    hidePalette: boolean;
    hideAttributes: boolean;
    toolbarHeight: 'narrow' | 'veryNarrow';
    loadingText: string;
    legacyFileSelector:
        | {
              callback: (data: { path: string; file: string }, userArg: any) => void;
              options: {
                  path?: string;
                  userArg?: any;
              };
          }
        | false;
}

declare global {
    interface Window {
        visAddWidget: (
            widgetType: string,
            x: number,
            y: number,
            data: Partial<WidgetData>,
            style: Partial<WidgetStyle>,
        ) => Promise<AnyWidgetId>;
    }
}

class Editor extends Runtime<EditorProps, EditorState> {
    mainRef: React.RefObject<HTMLDivElement>;

    tempProject: Project;

    visEngineHandlers: Record<string, Partial<VisEngineHandlers>>;

    savingTimer: ReturnType<typeof setTimeout>;

    historyTimer: ReturnType<typeof setTimeout>;

    onIgnoreMouseEvents = (ignore: boolean): void => {
        if (this.state.ignoreMouseEvents !== ignore) {
            setTimeout(() => this.setState({ ignoreMouseEvents: ignore }), 100);
        }
    };

    initState = (newState: Partial<EditorState>): void => {
        this.visEngineHandlers = {};
        window.visAddWidget = this.addWidget; // Used for tests

        this.mainRef = React.createRef();

        // this function will be called from Runtime

        let runtime = false;

        if (window.location.search.includes('runtime') || !window.location.pathname.endsWith('edit.html')) {
            runtime = true;
        }
        if (
            window.location.search.includes('edit') ||
            (window.location.port.startsWith('300') && !window.location.search.includes('runtime'))
        ) {
            runtime = false;
        }

        if (!runtime) {
            window.document.body.style.overflow = 'hidden';
        } else {
            window.document.body.style.overflow = 'visible'; // default behavior
        }

        Object.assign(newState, {
            runtime,
            viewsManager: false,
            projectsDialog: false,
            createFirstProjectDialog: false,
            align: {
                alignType: null,
                alignIndex: 0,
                alignValues: [],
            },
            showCode: window.localStorage.getItem('showCode') === 'true',
            editMode: true,
            history: [],
            historyCursor: 0,
            widgetsClipboard: {
                type: null,
                widgets: {},
            },
            lockDragging: JSON.parse(window.localStorage.getItem('lockDragging')),
            disableInteraction: JSON.parse(window.localStorage.getItem('disableInteraction')),
            toolbarHeight: window.localStorage.getItem('Vis.toolbarForm') || 'full',
            updateWidgetsDialog: false,
            deleteWidgetsDialog: false,
            messageDialog: null,
            widgetHint: window.localStorage.getItem('widgetHint') || 'light',
            hidePalette: window.localStorage.getItem('Vis.hidePalette') === 'true',
            hideAttributes: window.localStorage.getItem('Vis.hideAttributes') === 'true',
            loadingProgress: { step: 0, total: 0 },
            loadingText: null,
            showCodeDialog: null,
            confirmDialog: null,
            showProjectUpdateDialog: false,
            ignoreMouseEvents: false,
            legacyFileSelector: null,
            askAboutInclude: null,
        });
    };

    componentDidMount(): void {
        super.componentDidMount();
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('beforeunload', this.onBeforeUnload, false);
    }

    componentWillUnmount(): void {
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = null;
        super.componentWillUnmount();
        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('beforeunload', this.onBeforeUnload, false);
    }

    onBeforeUnload = (e: BeforeUnloadEvent): null | string => {
        if (this.state.needSave) {
            this.needRestart = true;
            e.returnValue = I18n.t("Project doesn't saved. Are you sure?");
            return e.returnValue;
        }

        return null;
    };

    onKeyDown = async (e: KeyboardEvent): Promise<void> => {
        if (!this.state.editMode) {
            return;
        }
        const controlKey = e.ctrlKey || (e as any).cmdKey;
        if (document.activeElement.tagName === 'BODY') {
            if (controlKey && e.key === 'z' && this.state.historyCursor !== 0) {
                e.preventDefault();
                await this.undo();
            } else if (controlKey && e.key === 'y' && this.state.historyCursor !== this.state.history.length - 1) {
                e.preventDefault();
                await this.redo();
            } else if (this.state.selectedWidgets.length) {
                if (controlKey && e.key === 'c') {
                    e.preventDefault();
                    await this.copyWidgets();
                } else if (controlKey && e.key === 'x') {
                    e.preventDefault();
                    await this.cutWidgets();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    await this.setSelectedWidgets([]);
                } else if (e.key === 'Delete') {
                    e.preventDefault();
                    this.deleteWidgets();
                }
            } else if (controlKey && e.key === 'v' && Object.keys(this.state.widgetsClipboard.widgets).length) {
                e.preventDefault();
                await this.pasteWidgets();
            } else if (controlKey && e.key === 'a') {
                e.preventDefault();
                if (this.state.selectedGroup) {
                    await this.setSelectedWidgets(
                        (
                            Object.keys(store.getState().visProject[this.state.selectedView].widgets) as AnyWidgetId[]
                        ).filter(
                            widget =>
                                !store.getState().visProject[this.state.selectedView].widgets[widget].data.locked &&
                                store.getState().visProject[this.state.selectedView].widgets[widget].groupid ===
                                    this.state.selectedGroup,
                        ),
                    );
                } else {
                    await this.setSelectedWidgets(
                        (
                            Object.keys(store.getState().visProject[this.state.selectedView].widgets) as AnyWidgetId[]
                        ).filter(
                            widget =>
                                !store.getState().visProject[this.state.selectedView].widgets[widget].data.locked &&
                                !store.getState().visProject[this.state.selectedView].widgets[widget].grouped,
                        ),
                    );
                }
            }
        }
    };

    setWidgetsLoadingProgress = (step: number, total: number): void => {
        this.setState({ loadingProgress: { step, total } });
    };

    onWidgetSetsChanged = (id: string, state: ioBroker.State): void => {
        if (state && this.lastUploadedState && state.val !== this.lastUploadedState) {
            this.lastUploadedState = state.val;
            this.onVisChanged();
        }
    };

    setViewsManager = (isOpen: boolean): void => {
        if (!!isOpen !== this.state.viewsManager) {
            this.setState({ viewsManager: !!isOpen });
        }
    };

    setProjectsDialog = (isOpen: boolean): void => this.setState({ projectsDialog: isOpen });

    loadSelectedWidgets(selectedView: string): AnyWidgetId[] {
        selectedView = selectedView || this.state.selectedView;
        const selectedWidgets: AnyWidgetId[] =
            JSON.parse(window.localStorage.getItem(`${this.state.projectName}.${selectedView}.widgets`) || '[]') || [];

        // Check that all selectedWidgets exist
        for (let i = selectedWidgets.length - 1; i >= 0; i--) {
            if (
                !store.getState().visProject[selectedView] ||
                !store.getState().visProject[selectedView].widgets ||
                !store.getState().visProject[selectedView].widgets[selectedWidgets[i]]
            ) {
                selectedWidgets.splice(i, 1);
            }
        }

        return selectedWidgets;
    }

    addWidget = async (
        widgetType: string,
        x: number,
        y: number,
        data?: Partial<WidgetData>,
        style?: Partial<WidgetStyle>,
    ): Promise<AnyWidgetId> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        const newKey = getNewWidgetId(store.getState().visProject);
        widgets[newKey] = {
            tpl: widgetType,
            data: {
                bindings: [],
            },
            style: {
                bindings: [],
                left: `${x}px`,
                top: `${y}px`,
            },
        } as Widget;

        if (this.state.selectedGroup) {
            widgets[newKey].grouped = true;
            widgets[newKey].groupid = this.state.selectedGroup;
            widgets[this.state.selectedGroup].data.members.push(newKey);
        }

        // check if we have any fields contain "oid" in it and pre-fill it with "nothing_selected" value
        const widgetTypes = getWidgetTypes();
        const tplWidget = widgetTypes.find(item => item.name === widgetType);

        // extract groups
        const fields: WidgetAttributesGroupInfoStored[] = parseAttributes(
            tplWidget.params as string | RxWidgetInfoGroup[],
        );

        fields.forEach(group => {
            if (group.fields) {
                group.fields.forEach(field => {
                    if (field.name === 'oid') {
                        widgets[newKey].data.oid = 'nothing_selected';
                    }
                    if (field.default !== undefined && field.default !== null) {
                        widgets[newKey].data[field.name] = field.default;
                        widgets[newKey].data[`g_${group.name}`] = true;
                    }
                });
            }
        });

        // apply default style
        if (tplWidget.style) {
            Object.assign(widgets[newKey].style, tplWidget.style);
            if (widgets[newKey].style.position === 'relative') {
                widgets[newKey].style.width = '100%';
            }
        }

        // used by tests
        data && Object.assign(widgets[newKey].data, data);
        style && Object.assign(widgets[newKey].style, style);

        widgets[newKey].widgetSet = tplWidget.set;

        // Custom init of widgets
        if (tplWidget.init) {
            if (window.vis && window.vis.binds[tplWidget.set] && window.vis.binds[tplWidget.set][tplWidget.init]) {
                window.vis.binds[tplWidget.set][tplWidget.init](widgetType, widgets[newKey].data);
            }
        }

        await this.changeProject(project);
        await this.setSelectedWidgets([newKey]);
        return newKey;
    };

    deleteWidgets = (): void => this.setState({ deleteWidgetsDialog: true });

    updateWidgets = (marketplaceWidget: MarketplaceWidgetRevision): void =>
        this.setState({ updateWidgetsDialog: marketplaceWidget });

    updateWidgetsAction = async (
        marketplace: MarketplaceWidgetRevision,
        widgets: {
            name: string;
            widgets: AnyWidgetId[];
        }[],
    ): Promise<void> => {
        await this.installWidget(marketplace.widget_id, marketplace.id);
        const project = deepClone(store.getState().visProject);
        widgets.forEach(view => {
            view.widgets.forEach(widget => {
                const widgetData = project[view.name].widgets[widget];
                if (widgetData.tpl === '_tplGroup') {
                    widgetData.data.members.forEach(member => {
                        delete project[view.name].widgets[member];
                    });
                }
                delete project[view.name].widgets[widget];
                Editor.importMarketplaceWidget(
                    project,
                    view.name,
                    JSON.parse(JSON.stringify(marketplace.widget)),
                    marketplace.id,
                    null,
                    null,
                    widget,
                    JSON.parse(JSON.stringify(widgetData.data)),
                    JSON.parse(JSON.stringify(widgetData.style)),
                );
            });
        });
        await this.changeProject(project);
    };

    deleteWidgetsAction = async (): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        for (const selectedWidget of this.state.selectedWidgets) {
            if (widgets[selectedWidget].tpl === '_tplGroup') {
                widgets[selectedWidget].data.members.forEach(member => {
                    delete widgets[member];
                });
            }
            if (widgets[selectedWidget].usedInWidget) {
                // find widget where this widget is used
                findWidgetUsages(project, null, selectedWidget).forEach(usage => {
                    console.log(`Widget removed from ${usage.wid}, attribute ${usage.attr}`);
                    project[usage.view].widgets[usage.wid].data[usage.attr] = '';
                });
            }
            // If this widget is a member of a group, remove it from the group too
            if (widgets[selectedWidget].groupid) {
                const group = widgets[widgets[selectedWidget].groupid];
                group?.data?.members && group.data.members.splice(group.data.members.indexOf(selectedWidget), 1);
            }

            delete widgets[selectedWidget];
        }
        await this.setSelectedWidgets([]);
        await this.changeProject(project);
    };

    lockWidgets = async (type: 'lock' | 'unlock'): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        this.state.selectedWidgets.forEach(selectedWidget => (widgets[selectedWidget].data.locked = type === 'lock'));
        await this.changeProject(project);
    };

    toggleWidgetHint = (): void => {
        let widgetHint: 'light' | 'dark' | 'hide';
        if (this.state.widgetHint === 'light') {
            widgetHint = 'dark';
        } else if (this.state.widgetHint === 'dark') {
            widgetHint = 'hide';
        } else if (this.state.widgetHint === 'hide') {
            widgetHint = 'light';
        }
        this.setState({ widgetHint });
        window.localStorage.setItem('widgetHint', widgetHint);
    };

    cutWidgets = async (): Promise<void> => {
        await this.cutCopyWidgets('cut');
    };

    copyWidgets = async (): Promise<void> => {
        await this.cutCopyWidgets('copy');
    };

    cutCopyWidgets = async (type: 'cut' | 'copy'): Promise<void> => {
        const widgets: Record<string, Widget> = {};
        const groupMembers: Record<string, Widget> = {};
        const project = deepClone(store.getState().visProject);
        const { visProject } = deepClone(store.getState());

        this.state.selectedWidgets.forEach(selectedWidget => {
            widgets[selectedWidget] = visProject[this.state.selectedView].widgets[selectedWidget];
            const copiedWidget = widgets[selectedWidget];

            if (isGroup(copiedWidget)) {
                for (const wid of copiedWidget.data.members) {
                    groupMembers[wid] = visProject[this.state.selectedView].widgets[wid];
                }
            }

            if (project[this.state.selectedView]) {
                const widget = project[this.state.selectedView].widgets[selectedWidget];

                if (widget.groupid) {
                    delete widgets[selectedWidget].groupid;
                    delete widgets[selectedWidget].grouped;
                }
            }
        });

        await this.setStateAsync({
            widgetsClipboard: {
                type,
                view: this.state.selectedView,
                widgets,
                groupMembers,
            },
        });

        // deselect all widgets
        if (type === 'cut') {
            await this.deleteWidgetsAction();
        }
    };

    pasteWidgets = async (): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;

        const newKeys: AnyWidgetId[] = [];
        let widgetOffset = 0;
        let groupOffset = 0;

        for (const clipboardWidgetId of Object.keys(this.state.widgetsClipboard.widgets)) {
            const newWidget = deepClone(this.state.widgetsClipboard.widgets[clipboardWidgetId as AnyWidgetId]);
            if (
                this.state.widgetsClipboard.type === 'copy' &&
                this.state.selectedView === this.state.widgetsClipboard.view
            ) {
                const boundingRect = Editor.getWidgetRelativeRect(clipboardWidgetId as AnyWidgetId);
                newWidget.style = this.pxToPercent(newWidget.style, {
                    left: `${(boundingRect?.left ?? 0) + 10}px`,
                    top: `${(boundingRect?.top ?? 0) + 10}px`,
                });
            }
            let newKey: AnyWidgetId;

            if (isGroup(newWidget)) {
                newKey = pasteGroup({
                    group: newWidget,
                    widgets,
                    offset: groupOffset,
                    groupMembers: this.state.widgetsClipboard.groupMembers,
                    project: store.getState().visProject,
                });

                groupOffset++;
            } else {
                newKey = pasteSingleWidget({
                    widget: newWidget,
                    offset: widgetOffset,
                    project: store.getState().visProject,
                    selectedGroup: this.state.selectedGroup,
                    widgets,
                });
                widgetOffset++;
            }

            newKeys.push(newKey);
        }

        await this.setSelectedWidgets([]);
        await this.changeProject(project);
        await this.setSelectedWidgets(newKeys);
    };

    cloneWidgets = async (): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;

        const newKeys: SingleWidgetId[] = [];
        this.state.selectedWidgets.forEach(selectedWidget => {
            const newWidget = deepClone(widgets[selectedWidget]);
            const boundingRect = Editor.getWidgetRelativeRect(selectedWidget);
            newWidget.style = this.pxToPercent(newWidget.style, {
                left: boundingRect.left + 10,
                top: boundingRect.top + 10,
            });

            if (isGroup(newWidget)) {
                pasteGroup({
                    group: newWidget,
                    widgets,
                    groupMembers: widgets,
                    project: store.getState().visProject,
                });
            } else {
                const newKey = pasteSingleWidget({
                    widget: newWidget,
                    project: store.getState().visProject,
                    selectedGroup: this.state.selectedGroup,
                    widgets,
                });

                newKeys.push(newKey);
            }
        });
        await this.setSelectedWidgets([]);
        await this.changeProject(project);
        await this.setSelectedWidgets(newKeys);
    };

    alignWidgets = (
        type:
            | 'left'
            | 'right'
            | 'top'
            | 'bottom'
            | 'horizontal-center'
            | 'vertical-center'
            | 'horizontal-equal'
            | 'vertical-equal'
            | 'width'
            | 'height',
    ): void => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        const newCoordinates = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0,
        };
        const selectedWidgets: {
            id: AnyWidgetId;
            widget: Widget;
            coordinate: DOMRect;
        }[] = [];
        this.state.selectedWidgets.forEach(selectedWidget => {
            const boundingRect = Editor.getWidgetRelativeRect(selectedWidget);
            selectedWidgets.push({ id: selectedWidget, widget: widgets[selectedWidget], coordinate: boundingRect });
        });
        if (type === 'left') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.left === 0 || selectedWidget.coordinate.left < newCoordinates.left) {
                    newCoordinates.left = selectedWidget.coordinate.left;
                }
            });
            selectedWidgets.forEach(selectedWidget => (selectedWidget.widget.style.left = `${newCoordinates.left}px`));
        } else if (type === 'right') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.right === 0 || selectedWidget.coordinate.right > newCoordinates.right) {
                    newCoordinates.right = selectedWidget.coordinate.right;
                }
            });
            selectedWidgets.forEach(
                selectedWidget =>
                    (selectedWidget.widget.style.left = `${newCoordinates.right - selectedWidget.coordinate.width}px`),
            );
        } else if (type === 'top') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.top === 0 || selectedWidget.coordinate.top < newCoordinates.top) {
                    newCoordinates.top = selectedWidget.coordinate.top;
                }
            });
            selectedWidgets.forEach(selectedWidget => (selectedWidget.widget.style.top = `${newCoordinates.top}px`));
        } else if (type === 'bottom') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.bottom === 0 || selectedWidget.coordinate.bottom > newCoordinates.bottom) {
                    newCoordinates.bottom = selectedWidget.coordinate.bottom;
                }
            });
            selectedWidgets.forEach(
                selectedWidget =>
                    (selectedWidget.widget.style.top = `${newCoordinates.bottom - selectedWidget.coordinate.height}px`),
            );
        } else if (type === 'horizontal-center') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.left === 0 || selectedWidget.coordinate.left < newCoordinates.left) {
                    newCoordinates.left = selectedWidget.coordinate.left;
                }
                if (newCoordinates.right === 0 || selectedWidget.coordinate.right > newCoordinates.right) {
                    newCoordinates.right = selectedWidget.coordinate.right;
                }
            });
            selectedWidgets.forEach(
                selectedWidget =>
                    (selectedWidget.widget.style.left = `${newCoordinates.left + (newCoordinates.right - newCoordinates.left) / 2 - selectedWidget.coordinate.width / 2}px`),
            );
        } else if (type === 'vertical-center') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.top === 0 || selectedWidget.coordinate.top < newCoordinates.top) {
                    newCoordinates.top = selectedWidget.coordinate.top;
                }
                if (newCoordinates.bottom === 0 || selectedWidget.coordinate.bottom > newCoordinates.bottom) {
                    newCoordinates.bottom = selectedWidget.coordinate.bottom;
                }
            });
            selectedWidgets.forEach(
                selectedWidget =>
                    (selectedWidget.widget.style.top = `${newCoordinates.top + (newCoordinates.bottom - newCoordinates.top) / 2 - selectedWidget.coordinate.height / 2}px`),
            );
        } else if (type === 'horizontal-equal') {
            let widgetsWidth = 0;
            let spaceWidth = 0;
            let currentLeft = 0;
            selectedWidgets.sort((selectedWidget1, selectedWidget2) =>
                selectedWidget1.coordinate.left > selectedWidget2.coordinate.left ? 1 : -1,
            );
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.left === 0 || selectedWidget.coordinate.left < newCoordinates.left) {
                    newCoordinates.left = selectedWidget.coordinate.left;
                }
                if (newCoordinates.right === 0 || selectedWidget.coordinate.right > newCoordinates.right) {
                    newCoordinates.right = selectedWidget.coordinate.right;
                }
                widgetsWidth += selectedWidget.coordinate.width;
            });
            spaceWidth = newCoordinates.right - newCoordinates.left - widgetsWidth;
            if (spaceWidth < 0) {
                spaceWidth = 0;
            }
            selectedWidgets.forEach((selectedWidget, index) => {
                selectedWidget.widget.style.left = `${newCoordinates.left + currentLeft}px`;
                currentLeft += selectedWidget.coordinate.width;
                if (index < selectedWidgets.length - 1) {
                    currentLeft += spaceWidth / (selectedWidgets.length - 1);
                }
            });
        } else if (type === 'vertical-equal') {
            let widgetsHeight = 0;
            let spaceHeight = 0;
            let currentTop = 0;
            selectedWidgets.sort((selectedWidget1, selectedWidget2) =>
                selectedWidget1.coordinate.top > selectedWidget2.coordinate.top ? 1 : -1,
            );
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.top === 0 || selectedWidget.coordinate.top < newCoordinates.top) {
                    newCoordinates.top = selectedWidget.coordinate.top;
                }
                if (newCoordinates.bottom === 0 || selectedWidget.coordinate.bottom > newCoordinates.bottom) {
                    newCoordinates.bottom = selectedWidget.coordinate.bottom;
                }
                widgetsHeight += selectedWidget.coordinate.height;
            });
            spaceHeight = newCoordinates.bottom - newCoordinates.top - widgetsHeight;
            if (spaceHeight < 0) {
                spaceHeight = 0;
            }
            selectedWidgets.forEach((selectedWidget, index) => {
                selectedWidget.widget.style.top = `${newCoordinates.top + currentTop}px`;
                currentTop += selectedWidget.coordinate.height;
                if (index < selectedWidgets.length - 1) {
                    currentTop += spaceHeight / (selectedWidgets.length - 1);
                }
            });
        } else if (type === 'width') {
            let { alignIndex, alignType, alignValues } = this.state.align;
            if (alignType !== 'width') {
                alignType = 'width';
                alignIndex = 0;
                alignValues = [];
            }
            if (!alignValues.length) {
                this.state.selectedWidgets.forEach(selectedWidget => {
                    const boundingRect = window.document.getElementById(selectedWidget).getBoundingClientRect();
                    const w = boundingRect.width;
                    if (alignValues.indexOf(w) === -1) {
                        alignValues.push(w);
                    }
                });
            }

            alignIndex++;
            if (alignIndex >= alignValues.length) {
                alignIndex = 0;
            }

            this.state.selectedWidgets.forEach(selectedWidget => {
                widgets[selectedWidget].style.width = alignValues[alignIndex];
            });
            this.setState({ align: { alignType, alignIndex, alignValues } });
        } else if (type === 'height') {
            let { alignIndex, alignType, alignValues } = this.state.align;
            if (alignType !== 'height') {
                alignType = 'height';
                alignIndex = 0;
                alignValues = [];
            }
            if (!alignValues.length) {
                this.state.selectedWidgets.forEach(selectedWidget => {
                    const boundingRect = window.document.getElementById(selectedWidget).getBoundingClientRect();
                    const h = boundingRect.height;
                    if (alignValues.indexOf(h) === -1) {
                        alignValues.push(h);
                    }
                });
            }

            alignIndex++;
            if (alignIndex >= alignValues.length) {
                alignIndex = 0;
            }

            this.state.selectedWidgets.forEach(selectedWidget => {
                widgets[selectedWidget].style.height = alignValues[alignIndex];
            });
            this.setState({ align: { alignType, alignIndex, alignValues } });
        }
        void this.changeProject(project);
    };

    orderWidgets = (type: 'front' | 'back'): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        let minZ = 0;
        let maxZ = 0;
        Object.keys(widgets).forEach((widget: AnyWidgetId) => {
            const currentZ = parseInt(widgets[widget].style['z-index'].toString()) || 0;
            if (minZ > currentZ || minZ === 0) {
                minZ = currentZ;
            }
            if (maxZ < currentZ || maxZ === 0) {
                maxZ = currentZ;
            }
        });

        this.state.selectedWidgets.forEach(selectedWidget => {
            const currentZ = parseInt(widgets[selectedWidget].style['z-index'].toString()) || 0;
            if (type === 'front' && currentZ <= maxZ) {
                widgets[selectedWidget].style['z-index'] = maxZ + 1;
                if (widgets[selectedWidget].style['z-index'] > 1599) {
                    widgets[selectedWidget].style['z-index'] = 1599;
                }
            }
            if (type === 'back' && currentZ >= minZ) {
                widgets[selectedWidget].style['z-index'] = minZ - 1;
                if (widgets[selectedWidget].style['z-index'] < 0) {
                    widgets[selectedWidget].style['z-index'] = 0;
                }
            }
        });

        return this.changeProject(project);
    };

    static getWidgetRelativeRect(widget: AnyWidgetId): DOMRect {
        const el = window.document.getElementById(widget);
        if (el) {
            const widgetBoundingRect = el.getBoundingClientRect();
            const viewBoundingRect = window.document.getElementById('vis-react-container').getBoundingClientRect();
            return {
                left: widgetBoundingRect.left - viewBoundingRect.left,
                top: widgetBoundingRect.top - viewBoundingRect.top,
                right: widgetBoundingRect.right - viewBoundingRect.left,
                bottom: widgetBoundingRect.bottom - viewBoundingRect.top,
                width: widgetBoundingRect.width,
                height: widgetBoundingRect.height,
            } as DOMRect;
        }

        return null;
    }

    groupWidgets = async (): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        const group: GroupWidget = {
            tpl: '_tplGroup',
            widgetSet: 'basic',
            data: {
                members: this.state.selectedWidgets,
            },
            style: {},
        };
        const groupId = getNewGroupId(project);
        let left = 0;
        let top = 0;
        let right = 0;
        let bottom = 0;
        this.state.selectedWidgets.forEach(selectedWidget => {
            widgets[selectedWidget].grouped = true;
            widgets[selectedWidget].groupid = groupId;
            const widgetBoundingRect = Editor.getWidgetRelativeRect(selectedWidget);
            if (!left || widgetBoundingRect.left < left) {
                left = widgetBoundingRect.left;
            }
            if (!top || widgetBoundingRect.top < top) {
                top = widgetBoundingRect.top;
            }
            if (!right || widgetBoundingRect.right > right) {
                right = widgetBoundingRect.right;
            }
            if (!bottom || widgetBoundingRect.bottom > bottom) {
                bottom = widgetBoundingRect.bottom;
            }
        });
        this.state.selectedWidgets.forEach(selectedWidget => {
            const widgetBoundingRect = Editor.getWidgetRelativeRect(selectedWidget);
            widgets[selectedWidget].style.left = widgetBoundingRect.left - left;
            widgets[selectedWidget].style.top = widgetBoundingRect.top - top;
        });

        if (this.state.selectedGroup) {
            group.grouped = true;
            group.groupid = this.state.selectedGroup;

            const parentGroupWidget = widgets[this.state.selectedGroup];
            parentGroupWidget.data.members.push(groupId);
            // and remove the ungrouped versions
            for (const wid of this.state.selectedWidgets) {
                const idx = parentGroupWidget.data.members.indexOf(wid);
                parentGroupWidget.data.members.splice(idx, 1);
            }
        }

        group.style.left = `${left}px`;
        group.style.top = `${top}px`;
        group.style.width = `${right - left}px`;
        group.style.height = `${bottom - top}px`;
        widgets[groupId] = group;

        await this.changeProject(project);
        await this.setSelectedWidgets([groupId]);
    };

    ungroupWidgets = async (): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = project[this.state.selectedView].widgets;
        const group = widgets[this.state.selectedWidgets[0]];

        for (const member of group.data.members) {
            const widgetBoundingRect = Editor.getWidgetRelativeRect(member);

            if (widgetBoundingRect) {
                widgets[member].style.left = `${widgetBoundingRect.left}px`;
                widgets[member].style.top = `${widgetBoundingRect.top}px`;
                widgets[member].style.width = `${widgetBoundingRect.width}px`;
                widgets[member].style.height = `${widgetBoundingRect.height}px`;
            }

            delete widgets[member].grouped;
            delete widgets[member].groupid;
        }

        if (this.state.selectedGroup) {
            const parentGroupWidget = widgets[this.state.selectedGroup];

            // if ungrouped nested group, re-add the single members
            for (const member of group.data.members) {
                parentGroupWidget.data.members.push(member);

                widgets[member].grouped = true;
                widgets[member].groupid = this.state.selectedGroup;
            }

            const idx = parentGroupWidget.data.members.indexOf(this.state.selectedWidgets[0]);
            parentGroupWidget.data.members.splice(idx, 1);
        }

        await this.setSelectedWidgets(group.data.members);

        delete widgets[this.state.selectedWidgets[0]];

        return this.changeProject(project);
    };

    setSelectedGroup = (groupId: GroupWidgetId): void => {
        if (store.getState().visProject[this.state.selectedView].widgets[groupId].marketplace) {
            return;
        }
        this.setState({ selectedGroup: groupId });
        void this.setSelectedWidgets([]);
    };

    undo = async (): Promise<void> => {
        void this.setSelectedWidgets([]);
        await this.changeProject(this.state.history[this.state.historyCursor - 1], true);
        await this.setStateAsync({ historyCursor: this.state.historyCursor - 1 });
    };

    redo = async (): Promise<void> => {
        void this.setSelectedWidgets([]);
        await this.changeProject(this.state.history[this.state.historyCursor + 1], true);
        await this.setStateAsync({ historyCursor: this.state.historyCursor + 1 });
    };

    toggleLockDragging = (): void => {
        window.localStorage.setItem('lockDragging', JSON.stringify(!this.state.lockDragging));
        this.setState({ lockDragging: !this.state.lockDragging });
    };

    toggleDisableInteraction = (): void => {
        window.localStorage.setItem('disableInteraction', JSON.stringify(!this.state.disableInteraction));
        this.setState({ disableInteraction: !this.state.disableInteraction });
    };

    saveHistory(project: Project): void {
        this.historyTimer && clearTimeout(this.historyTimer);

        this.historyTimer = setTimeout(() => {
            this.historyTimer = null;

            let history = deepClone(this.state.history);
            let historyCursor = this.state.historyCursor;
            if (historyCursor !== history.length - 1) {
                history = history.slice(0, historyCursor + 1);
            }
            history.push(project);
            if (history.length > 50) {
                history.shift();
            }
            historyCursor = history.length - 1;
            this.setState({ history, historyCursor });
        }, 1000);
    }

    changeProject = async (project: Project, ignoreHistory = false): Promise<void> => {
        // set timestamp
        project.___settings.ts = `${Date.now()}.${Math.random().toString(36).substring(7)}`;

        Runtime.syncMultipleWidgets(project);

        if (!ignoreHistory) {
            // do not save history too often
            this.saveHistory(project);
        }

        store.dispatch(updateProject(project));
        store.dispatch(recalculateFields(true));
        await this.setStateAsync({ needSave: true });

        // save changes after 1 second
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = setTimeout(async () => {
            this.savingTimer = null;

            // remove all special structures. project will be cloned in unsyncMultipleWidgets
            project = unsyncMultipleWidgets(project);

            const projectStr = JSON.stringify(project, null, 2);

            if ('TextEncoder' in window) {
                const encoder = new TextEncoder();
                const data = encoder.encode(projectStr);
                await this.socket.writeFile64(
                    this.adapterId,
                    `${this.state.projectName}/vis-views.json`,
                    data as unknown as string,
                );
            } else {
                await this.socket.writeFile64(this.adapterId, `${this.state.projectName}/vis-views.json`, projectStr);
            }

            this.setState({ needSave: false });
            if (this.needRestart) {
                window.location.reload();
            }
        }, 1_000);
    };

    renameProject = async (fromProjectName: string, toProjectName: string): Promise<void> => {
        try {
            await this.socket.rename(this.adapterId, fromProjectName, toProjectName);
            if (this.state.projectName === fromProjectName) {
                window.location.href = `?${toProjectName}${window.location.hash || ''}`;
            } else {
                await this.refreshProjects();
            }
        } catch (e) {
            window.alert(`Cannot rename: ${e}`);
            console.error(e);
        }
    };

    deleteProject = async (projectName: string): Promise<void> => {
        try {
            await this.socket.deleteFolder(this.adapterId, projectName);
            await this.refreshProjects();
            if (this.state.projectName === projectName) {
                await this.loadProject(this.state.projects[0]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    toggleView = async (view: string, isShow: boolean, isActivate = false): Promise<void> => {
        let changed = false;
        const project = deepClone(store.getState().visProject);
        const pos = project.___settings.openedViews.indexOf(view);
        if (isShow && pos === -1) {
            project.___settings.openedViews.unshift(view);
            changed = true;
        } else if (!isShow && pos !== -1) {
            project.___settings.openedViews.splice(pos, 1);
            changed = true;
        }

        if (changed) {
            await this.changeProject(project, false);
        }

        if (isActivate) {
            this.setViewsManager(false);
            await this.changeView(view);
        } else if (!project.___settings.openedViews.includes(this.state.selectedView)) {
            await this.changeView(project.___settings.openedViews[0]);
        }
    };

    setSelectedWidgets = async (
        selectedWidgets: AnyWidgetId[],
        selectedView?: string | (() => void),
        cb?: () => void,
    ): Promise<void> => {
        if (typeof selectedView === 'function') {
            cb = selectedView;
            selectedView = null;
        }

        if (cb) {
            // It should never happen, as cb not used
            // eslint-disable-next-line
            debugger;
        }

        store.dispatch(recalculateFields(true));

        if (selectedView) {
            window.localStorage.setItem(
                `${this.state.projectName}.${selectedView}.widgets`,
                JSON.stringify(selectedWidgets),
            );
            // changeView reads selected widgets from localStorage
            await this.changeView(selectedView as string /* , true, true, true */);
        } else {
            window.localStorage.setItem(
                `${this.state.projectName}.${this.state.selectedView}.widgets`,
                JSON.stringify(selectedWidgets),
            );

            await this.setStateAsync({
                selectedWidgets,
                alignType: null,
                alignIndex: 0,
                alignValues: [],
            });
        }
    };

    toggleCode = (): void => {
        const oldShowCode = this.state.showCode;
        this.setState({ showCode: !oldShowCode });
        window.localStorage.setItem('showCode', JSON.stringify(!oldShowCode));
    };

    onWidgetsChanged = (
        changedData: {
            wid: AnyWidgetId;
            view: string;
            style: WidgetStyle;
            data: WidgetData;
        }[],
        view: string,
        viewSettings: ViewSettings,
    ): void => {
        this.tempProject = this.tempProject || deepClone(store.getState().visProject);
        changedData?.forEach(item => {
            if (item.style) {
                const currentStyle = this.tempProject[item.view].widgets[item.wid].style;
                if (item.style.noPxToPercent) {
                    delete item.style.noPxToPercent;
                    Object.assign(currentStyle, item.style);
                } else {
                    const percentStyle = this.pxToPercent(currentStyle, item.style);
                    Object.assign(currentStyle, percentStyle);
                }
                Object.keys(currentStyle).forEach((key: keyof WidgetStyle) => {
                    if (currentStyle[key] === undefined || currentStyle[key] === null) {
                        delete currentStyle[key];
                    }
                });
            }
            if (item.data) {
                const currentData = this.tempProject[item.view].widgets[item.wid].data;
                Object.assign(currentData, item.data);
                Object.keys(currentData).forEach(key => {
                    if (currentData[key] === undefined || currentData[key] === null) {
                        delete currentData[key];
                    }
                });
            }
        });

        // settings of view are changed
        if (view && viewSettings) {
            // special processing for group editing
            if (viewSettings.order && this.state.selectedGroup) {
                const order = viewSettings.order;
                delete viewSettings.order;
                const widget = this.tempProject[this.state.selectedView].widgets[this.state.selectedGroup];
                widget.data = widget.data || ({} as GroupData);
                widget.data.members = order;
            }

            Object.keys(viewSettings).forEach((attr: keyof ViewSettings) => {
                if (viewSettings[attr] === null) {
                    delete this.tempProject[view].settings[attr];
                } else {
                    (this.tempProject[view].settings[attr] as any) = viewSettings[attr];
                }
            });
        }

        this.changeTimer && clearTimeout(this.changeTimer);

        // collect changes from all widgets
        this.changeTimer = setTimeout(() => {
            this.changeTimer = null;
            void this.changeProject(this.tempProject);
            this.tempProject = null;
        }, 200);
    };

    onFontsUpdate(fonts: string[]): void {
        this.setState({ fonts });
    }

    cssClone = (attr: string, cb: (value: string | number | boolean) => void): void => {
        if (
            this.visEngineHandlers[this.state.selectedView] &&
            this.visEngineHandlers[this.state.selectedView].onStealStyle
        ) {
            this.visEngineHandlers[this.state.selectedView].onStealStyle(attr, cb);
        } else {
            cb && cb(attr); // cancel selection
        }
    };

    registerCallback = (
        name: 'onStealStyle' | 'pxToPercent' | 'onPxToPercent' | 'onPercentToPx',
        view: string,
        cb:
            | VisEngineHandlers['onStealStyle']
            | VisEngineHandlers['pxToPercent']
            | VisEngineHandlers['onPxToPercent']
            | VisEngineHandlers['onPercentToPx'],
    ): void => {
        if (cb) {
            this.visEngineHandlers[view] = this.visEngineHandlers[view] || {};
            if (name === 'onStealStyle') {
                this.visEngineHandlers[view].onStealStyle = cb as VisEngineHandlers['onStealStyle'];
            } else if (name === 'pxToPercent') {
                this.visEngineHandlers[view].pxToPercent = cb as VisEngineHandlers['pxToPercent'];
            } else if (name === 'onPxToPercent') {
                this.visEngineHandlers[view].onPxToPercent = cb as VisEngineHandlers['onPxToPercent'];
            } else if (name === 'onPercentToPx') {
                this.visEngineHandlers[view].onPercentToPx = cb as VisEngineHandlers['onPercentToPx'];
            } else {
                throw new Error(`Unknown callback name: ${name}`);
            }
        } else if (this.visEngineHandlers[view]) {
            delete this.visEngineHandlers[view][name];
            if (!Object.keys(this.visEngineHandlers[view]).length) {
                delete this.visEngineHandlers[view];
            }
        }
    };

    onPxToPercent = (wids: AnyWidgetId[], attr: string, cb: (results: string[]) => void): string[] => {
        if (
            this.visEngineHandlers[this.state.selectedView] &&
            this.visEngineHandlers[this.state.selectedView].onPxToPercent
        ) {
            return this.visEngineHandlers[this.state.selectedView].onPxToPercent(wids, attr, cb);
        }

        return null;
    };

    pxToPercent = (oldStyle: WidgetStyle, newStyle: WidgetStyle): WidgetStyle | null => {
        if (this.visEngineHandlers[this.state.selectedView]?.pxToPercent) {
            return this.visEngineHandlers[this.state.selectedView].pxToPercent(oldStyle, newStyle);
        }
        // cb && cb(wids, attr, null); // cancel selection
        return null;
    };

    onPercentToPx = (wids: AnyWidgetId[], attr: string, cb: (results: string[]) => void): string[] | null => {
        if (
            this.visEngineHandlers[this.state.selectedView] &&
            this.visEngineHandlers[this.state.selectedView].onPercentToPx
        ) {
            return this.visEngineHandlers[this.state.selectedView].onPercentToPx(wids, attr, cb);
        }
        return null;
        // cb && cb(wids, attr, null); // cancel selection
    };

    saveCssFile = (directory: string, fileName: string, data: string): void => {
        if (fileName.endsWith('vis-common-user.css')) {
            this.setState({ visCommonCss: data });
        } else if (fileName.endsWith('vis-user.css')) {
            this.setState({ visUserCss: data });
        }

        void this.socket.writeFile64(directory, fileName, data);
    };

    showConfirmDialog(confirmDialog: {
        message: string;
        title: string;
        icon: string;
        width: number;
        callback: (isYes: boolean) => void;
    }): void {
        this.setState({ confirmDialog });
    }

    showCodeDialog(codeDialog: {
        code: string;
        title: string;
        mode: 'json' | 'html' | 'javascript' | 'text' | 'css';
    }): void {
        this.setState({ showCodeDialog: codeDialog });
    }

    setMarketplaceDialog = (marketplaceDialog: Partial<MarketplaceDialogProps>): void =>
        this.setState({ marketplaceDialog });

    installWidget = async (widgetId: string, id: string): Promise<void> => {
        if (window.VisMarketplace?.api) {
            const project = deepClone(store.getState().visProject);
            const marketplaceWidget = await window.VisMarketplace.api.apiGetWidgetRevision(widgetId, id);
            if (!project.___settings.marketplace) {
                project.___settings.marketplace = [];
            }
            const widgetIndex = project.___settings.marketplace.findIndex(
                item => item.widget_id === marketplaceWidget.widget_id,
            );
            if (widgetIndex === -1) {
                project.___settings.marketplace.push(marketplaceWidget);
            } else {
                project.___settings.marketplace[widgetIndex] = marketplaceWidget;
            }
            await this.changeProject(project);
        }
    };

    uninstallWidget = async (widget: string): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgetIndex = project.___settings.marketplace.findIndex(item => item.id === widget);
        if (widgetIndex !== -1) {
            project.___settings.marketplace.splice(widgetIndex, 1);
        }
        await this.changeProject(project);
    };

    static importMarketplaceWidget(
        project: Project,
        view: string,
        widgets: (GroupWidget | SingleWidget)[],
        id: string,
        x: number,
        y: number,
        widgetId: AnyWidgetId,
        oldData: WidgetData,
        oldStyle: WidgetStyle,
    ): Project {
        const newWidgets: Record<AnyWidgetId, Widget> = {};

        widgets.forEach(_widget => {
            if (_widget.isRoot) {
                _widget.marketplace = deepClone(
                    store.getState().visProject.___settings.marketplace.find(item => item.id === id),
                );
            }
            if (isGroup(_widget)) {
                let newKey: AnyWidgetId = getNewGroupId(store.getState().visProject);
                if (_widget.isRoot) {
                    if (widgetId) {
                        newKey = widgetId;
                        oldData.members = _widget.data.members;
                        _widget.data = oldData as GroupData;
                        _widget.style = oldStyle;
                    } else {
                        _widget.style.top = y;
                        _widget.style.left = x;
                    }
                }
                newWidgets[newKey] = _widget;
                // find all widgets that belong to this group and change groupid
                let w;
                do {
                    w = widgets.find(item => item.groupid === _widget._id);
                    if (w) {
                        w.groupid = newKey as GroupWidgetId;
                    }
                } while (w);
            } else {
                const newKey = getNewWidgetId(store.getState().visProject);
                newWidgets[newKey as GroupWidgetId] = _widget;
                if (
                    _widget.grouped &&
                    newWidgets[_widget.groupid] &&
                    newWidgets[_widget.groupid].data &&
                    newWidgets[_widget.groupid].data.members
                ) {
                    // find group
                    const pos = newWidgets[_widget.groupid].data.members.indexOf(_widget._id as AnyWidgetId);
                    if (pos !== -1) {
                        newWidgets[_widget.groupid].data.members[pos] = newKey;
                    }
                }
            }
        });

        Object.keys(newWidgets).forEach((wid: AnyWidgetId) => delete newWidgets[wid]._id);

        (project[view].widgets as Record<AnyWidgetId, Widget>) = { ...project[view].widgets, ...newWidgets };
        return project;
    }

    addMarketplaceWidget = async (
        id: string,
        x: number,
        y: number,
        widgetId?: AnyWidgetId,
        oldData?: WidgetData,
        oldStyle?: WidgetStyle,
    ): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widgets = deepClone(
            store.getState().visProject.___settings.marketplace.find(item => item.id === id).widget,
        );
        Editor.importMarketplaceWidget(
            project,
            this.state.selectedView,
            widgets,
            id,
            x,
            y,
            widgetId,
            oldData,
            oldStyle,
        );
        await this.changeProject(project);
    };

    updateWidget = async (id: AnyWidgetId): Promise<void> => {
        const project = deepClone(store.getState().visProject);
        const widget = project[this.state.selectedView].widgets[id];
        if (widget?.marketplace) {
            const marketplace: MarketplaceWidgetRevision | null = deepClone(
                store
                    .getState()
                    .visProject.___settings.marketplace.find(item => item.widget_id === widget.marketplace.widget_id),
            );
            await this.deleteWidgetsAction();
            if (marketplace) {
                await this.addMarketplaceWidget(marketplace.id, null, null, id, widget.data, widget.style);
            }
        }
    };

    renderAskAboutIncludeDialog(): React.JSX.Element | null {
        if (this.state.askAboutInclude) {
            return (
                <Dialog
                    open={!0}
                    onClose={() => this.setState({ askAboutInclude: null })}
                >
                    <DialogTitle id="alert-dialog-title">{I18n.t('Include widget?')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {I18n.t(
                                'Do you want to include "%s" widget into "%s"?',
                                this.state.askAboutInclude.wid,
                                this.state.askAboutInclude.toWid,
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                const project = deepClone(store.getState().visProject);
                                project[this.state.selectedView].widgets[
                                    this.state.askAboutInclude.toWid
                                ].data.doNotWantIncludeWidgets = true;
                                void this.changeProject(project, true).then(() =>
                                    this.setState({ askAboutInclude: null }),
                                );
                            }}
                        >
                            {I18n.t('Do not ask again')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const askAboutInclude = this.state.askAboutInclude;
                                this.setState({ askAboutInclude: null });
                                askAboutInclude.cb(askAboutInclude.wid, askAboutInclude.toWid);
                            }}
                            color="primary"
                            autoFocus
                            startIcon={<AddIcon />}
                        >
                            {I18n.t('Add')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => this.setState({ askAboutInclude: null })}
                            color="grey"
                            startIcon={<CloseIcon />}
                        >
                            {I18n.t('Cancel')}
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        }

        return null;
    }

    askAboutInclude = (
        wid: AnyWidgetId,
        toWid: AnyWidgetId,
        cb: (wid: AnyWidgetId, toWid: AnyWidgetId) => void,
    ): void => this.setState({ askAboutInclude: { wid, toWid, cb } });

    renderTabs(): React.JSX.Element {
        const { visProject } = store.getState();
        const views = visProject.___settings.openedViews.filter(view => Object.keys(visProject).includes(view));

        return (
            <div style={styles.tabsContainer}>
                {this.state.hidePalette ? (
                    <Tooltip
                        title={I18n.t('Show palette')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <div style={styles.tabButton}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    window.localStorage.removeItem('Vis.hidePalette');
                                    this.setState({ hidePalette: false });
                                }}
                            >
                                <IconPalette />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : null}
                {!this.state.showCode ? (
                    <Tooltip
                        title={I18n.t('Toggle runtime')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <div style={styles.tabButton}>
                            <IconButton
                                onClick={() => this.setState({ editMode: !this.state.editMode })}
                                size="small"
                                disabled={!!this.state.selectedGroup}
                                style={this.state.selectedGroup ? { opacity: 0.5 } : null}
                            >
                                {this.state.editMode ? (
                                    <PlayIcon style={{ color: 'green' }} />
                                ) : (
                                    <StopIcon style={{ color: 'red' }} />
                                )}
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : null}
                <Tooltip
                    title={I18n.t('Show view')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <div style={styles.tabButton}>
                        <IconButton
                            onClick={() => this.setViewsManager(true)}
                            size="small"
                            disabled={!!this.state.selectedGroup}
                        >
                            <Layers style={views.length ? undefined : styles.iconBlink} />
                        </IconButton>
                    </div>
                </Tooltip>
                <Tabs
                    value={
                        this.state.selectedView === 'null' ||
                        this.state.selectedView === 'undefined' ||
                        !this.state.selectedView
                            ? views[0] || ''
                            : this.state.selectedView
                    }
                    style={{
                        width: `calc(100% - ${68 + (!this.state.showCode ? 40 : 0) + (this.state.hidePalette ? 40 : 0) + (this.state.hideAttributes ? 40 : 0)}px)`,
                    }}
                    sx={styles.viewTabs}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {views.map(view => {
                        const isGroupEdited = !!this.state.selectedGroup && view === this.state.selectedView;
                        const viewSettings = isGroupEdited ? {} : store.getState().visProject[view].settings || {};
                        let icon = viewSettings.navigationIcon || viewSettings.navigationImage;
                        if (icon && icon.startsWith('_PRJ_NAME/')) {
                            icon = `../${this.adapterName}.${this.instance}/${this.state.projectName}${icon.substring(9)}`; // "_PRJ_NAME".length = 9
                        }

                        return (
                            <Tab
                                component="span"
                                disabled={!!this.state.selectedGroup && view !== this.state.selectedView}
                                label={
                                    <Box
                                        component="span"
                                        style={Utils.getStyle(
                                            this.state.theme,
                                            isGroupEdited && styles.groupEditTab,
                                            styles.tabsName,
                                        )}
                                    >
                                        {icon ? (
                                            <Icon
                                                src={icon}
                                                style={styles.listItemIcon}
                                            />
                                        ) : null}
                                        {isGroupEdited
                                            ? `${I18n.t('Group %s', this.state.selectedGroup)}`
                                            : viewSettings.navigationTitle || view}
                                        <Tooltip
                                            title={isGroupEdited ? I18n.t('Close group editor') : I18n.t('Hide')}
                                            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                        >
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={
                                                        !!this.state.selectedGroup && view !== this.state.selectedView
                                                    }
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (isGroupEdited) {
                                                            this.setState({ selectedGroup: null });
                                                        } else {
                                                            void this.toggleView(view, false);
                                                        }
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Box>
                                }
                                sx={styles.viewTab}
                                value={view}
                                onClick={() => this.changeView(view)}
                                key={view}
                                // wrapped
                            />
                        );
                    })}
                </Tabs>
                <IconButton
                    onClick={() => this.toggleCode()}
                    size="small"
                    style={{
                        ...styles.tabButton,
                        cursor: 'default',
                        opacity: this.state.showCode ? 1 : 0,
                        width: 34,
                        height: 34,
                    }}
                >
                    {this.state.showCode ? <CodeOffIcon /> : <CodeIcon />}
                </IconButton>
                {views.length > 1 ? (
                    <Tooltip
                        title={I18n.t('Close all but current view')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <div style={styles.tabButton}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    const project = deepClone(store.getState().visProject);
                                    project.___settings.openedViews = [this.state.selectedView];
                                    void this.changeProject(project, true);
                                }}
                            >
                                <ClearAllIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : null}
                {this.state.hideAttributes ? (
                    <Tooltip
                        title={I18n.t('Show attributes')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <div style={styles.tabButton}>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    window.localStorage.removeItem('Vis.hideAttributes');
                                    this.setState({ hideAttributes: false });
                                }}
                            >
                                <IconAttributes />
                            </IconButton>
                        </div>
                    </Tooltip>
                ) : null}
            </div>
        );
    }

    renderPalette(): React.JSX.Element {
        return (
            <div
                style={{
                    ...styles.block,
                    ...(this.state.toolbarHeight === 'narrow' ? styles.blockNarrow : undefined),
                    ...(this.state.toolbarHeight === 'veryNarrow' ? styles.blockVeryNarrow : undefined),
                    display: this.state.hidePalette ? 'none' : undefined,
                }}
            >
                {this.state.widgetsLoaded !== Runtime.WIDGETS_LOADING_STEP_ALL_LOADED ? (
                    <LinearProgress
                        variant="indeterminate"
                        value={(this.state.loadingProgress.step / this.state.loadingProgress.total) * 100}
                    />
                ) : null}
                <Palette
                    theme={this.state.theme}
                    widgetsLoaded={this.state.widgetsLoaded === Runtime.WIDGETS_LOADING_STEP_ALL_LOADED}
                    onHide={() => {
                        window.localStorage.setItem('Vis.hidePalette', 'true');
                        this.setState({ hidePalette: true });
                    }}
                    uninstallWidget={this.uninstallWidget}
                    setMarketplaceDialog={this.setMarketplaceDialog}
                    updateWidgets={this.updateWidgets}
                    selectedView={this.state.selectedView}
                    changeView={this.changeView}
                    changeProject={this.changeProject}
                    socket={this.socket as unknown as LegacyConnection}
                    editMode={this.state.editMode}
                    themeType={this.state.themeType}
                />
            </div>
        );
    }

    renderWorkspace(): React.JSX.Element {
        const visEngine = this.getVisEngine();

        return (
            <div key="engine">
                {this.renderTabs()}
                <div
                    style={{
                        ...styles.canvas,
                        ...(this.state.toolbarHeight === 'narrow' ? styles.canvasNarrow : undefined),
                        ...(this.state.toolbarHeight === 'veryNarrow' ? styles.canvasVeryNarrow : undefined),
                        overflow: this.state.editMode
                            ? 'auto'
                            : store.getState().visProject.___settings?.bodyOverflow || 'auto',
                    }}
                >
                    {this.state.showCode ? <pre>{JSON.stringify(store.getState().visProject, null, 2)}</pre> : null}
                    <ViewDrop
                        addWidget={this.addWidget}
                        addMarketplaceWidget={this.addMarketplaceWidget}
                        editMode={this.state.editMode}
                    >
                        <div
                            id="vis-react-container"
                            style={{
                                position: 'relative',
                                display: this.state.showCode ? 'none' : 'block',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <VisContextMenu
                                disabled={!this.state.editMode || this.state.ignoreMouseEvents}
                                selectedWidgets={this.state.selectedWidgets}
                                deleteWidgets={this.deleteWidgets}
                                setSelectedWidgets={this.setSelectedWidgets}
                                cutWidgets={this.cutWidgets}
                                copyWidgets={this.copyWidgets}
                                pasteWidgets={this.pasteWidgets}
                                orderWidgets={this.orderWidgets}
                                widgetsClipboard={this.state.widgetsClipboard}
                                selectedView={this.state.selectedView}
                                changeProject={this.changeProject}
                                lockWidgets={this.lockWidgets}
                                groupWidgets={this.groupWidgets}
                                ungroupWidgets={this.ungroupWidgets}
                                setSelectedGroup={this.setSelectedGroup}
                                setMarketplaceDialog={this.setMarketplaceDialog}
                                themeType={this.state.themeType}
                            >
                                {visEngine}
                            </VisContextMenu>
                        </div>
                    </ViewDrop>
                </div>
            </div>
        );
    }

    renderAttributes(): React.JSX.Element {
        return (
            <div
                style={{
                    ...styles.block,
                    ...(this.state.toolbarHeight === 'narrow' ? styles.blockNarrow : undefined),
                    ...(this.state.toolbarHeight === 'veryNarrow' ? styles.blockVeryNarrow : undefined),
                }}
            >
                <Attributes
                    theme={this.state.theme}
                    selectedView={this.state.selectedView}
                    userGroups={this.state.userGroups}
                    changeProject={this.changeProject}
                    openedViews={store.getState().visProject.___settings.openedViews}
                    projectName={this.state.projectName}
                    themeType={this.state.themeType}
                    selectedWidgets={this.state.editMode ? this.state.selectedWidgets : []}
                    widgetsLoaded={this.state.widgetsLoaded === Runtime.WIDGETS_LOADING_STEP_ALL_LOADED}
                    socket={this.socket as unknown as LegacyConnection}
                    fonts={this.state.fonts}
                    adapterName={this.adapterName}
                    instance={this.instance}
                    cssClone={this.cssClone}
                    onPxToPercent={this.onPxToPercent}
                    onPercentToPx={this.onPercentToPx}
                    saveCssFile={this.saveCssFile}
                    editMode={this.state.editMode}
                    onHide={() => {
                        window.localStorage.setItem('Vis.hideAttributes', 'true');
                        this.setState({ hideAttributes: true });
                    }}
                    adapterId={this.adapterId}
                    additionalSets={VisWidgetsCatalog.additionalSets}
                />
            </div>
        );
    }

    renderConfirmDialog(): React.JSX.Element | null {
        if (this.state.confirmDialog) {
            return (
                <ConfirmDialog
                    text={this.state.confirmDialog.message}
                    title={this.state.confirmDialog.title}
                    fullWidth={false}
                    ok={I18n.t('Ok')}
                    onClose={isYes => {
                        const callback = this.state.confirmDialog.callback;
                        this.setState({ confirmDialog: null }, () => typeof callback === 'function' && callback(isYes));
                    }}
                />
            );
        }

        return null;
    }

    renderShowCodeDialog(): React.JSX.Element | null {
        if (this.state.showCodeDialog !== null) {
            return (
                <CodeDialog
                    themeType={this.state.themeType}
                    onClose={() => this.setState({ showCodeDialog: null })}
                    title={this.state.showCodeDialog.title}
                    code={this.state.showCodeDialog.code}
                    mode={this.state.showCodeDialog.mode}
                />
            );
        }

        return null;
    }

    renderShowProjectUpdateDialog(): React.JSX.Element | null {
        if (!this.state.showProjectUpdateDialog) {
            return null;
        }
        return (
            <ConfirmDialog
                text={I18n.t('Project was updated by another browser instance. Do you want to reload it?')}
                title={I18n.t('Project was updated')}
                fullWidth={false}
                onClose={result =>
                    this.setState({ showProjectUpdateDialog: false }, () => {
                        if (result) {
                            void this.loadProject(this.state.projectName);
                        }
                    })
                }
            />
        );
    }

    renderCreateFirstProjectDialog(): React.JSX.Element | null {
        return this.state.createFirstProjectDialog ? (
            <CreateFirstProjectDialog
                onClose={() => this.setState({ createFirstProjectDialog: false })}
                addProject={this.addProject}
            />
        ) : null;
    }

    renderUpdateDialog(): React.JSX.Element | null {
        if (!this.state.updateWidgetsDialog) {
            return null;
        }
        const widgets: {
            name: string;
            widgets: AnyWidgetId[];
        }[] = [];
        Object.keys(store.getState().visProject).forEach(view => {
            if (view !== '___settings') {
                const viewWidgets: {
                    name: string;
                    widgets: AnyWidgetId[];
                } = {
                    name: view,
                    widgets: [],
                };
                const pWidgets = store.getState().visProject[view].widgets;
                Object.keys(pWidgets).forEach((widget: AnyWidgetId) => {
                    if (
                        this.state.updateWidgetsDialog &&
                        pWidgets[widget].marketplace?.widget_id === this.state.updateWidgetsDialog.widget_id &&
                        pWidgets[widget].marketplace?.version !== this.state.updateWidgetsDialog.version
                    ) {
                        viewWidgets.widgets.push(widget);
                    }
                });
                if (viewWidgets.widgets.length) {
                    widgets.push(viewWidgets);
                }
            }
        });
        return (
            <ConfirmDialog
                fullWidth={false}
                title={I18n.t('Update widgets')}
                text={
                    <>
                        <div>{I18n.t('Are you sure to update widgets:')}</div>
                        <div>
                            {widgets.map(view => (
                                <div key={view.name}>
                                    <b>
                                        {view.name}
                                        {': '}
                                    </b>
                                    {view.widgets.join(', ')}
                                </div>
                            ))}
                        </div>
                    </>
                }
                ok={I18n.t('Update')}
                dialogName="updateDialog"
                suppressQuestionMinutes={5}
                onClose={isYes => {
                    if (isYes) {
                        if (this.state.updateWidgetsDialog) {
                            void this.updateWidgetsAction(this.state.updateWidgetsDialog, widgets);
                        }
                    }
                    this.setState({ updateWidgetsDialog: false });
                }}
            />
        );
    }

    setLoadingText = (text: string): void => {
        this.setState({ loadingText: I18n.t(text) });
    };

    renderDeleteDialog(): React.JSX.Element | null {
        return this.state.deleteWidgetsDialog ? (
            <ConfirmDialog
                fullWidth={false}
                title={I18n.t('Delete widgets')}
                text={I18n.t('Are you sure to delete widgets %s?', this.state.selectedWidgets.join(', '))}
                ok={I18n.t('Delete')}
                dialogName="deleteDialog"
                suppressQuestionMinutes={5}
                onClose={isYes => {
                    if (isYes) {
                        void this.deleteWidgetsAction();
                    }
                    this.setState({ deleteWidgetsDialog: false });
                }}
            />
        ) : null;
    }

    renderMessageDialog(): React.JSX.Element | null {
        return this.state.messageDialog ? (
            <MessageDialog
                text={this.state.messageDialog.text}
                title={this.state.messageDialog.title}
                onClose={() => {
                    if (!this.state.messageDialog.noClose) {
                        this.setState({ messageDialog: null });
                    }
                }}
            />
        ) : null;
    }

    renderImportProjectDialog(): React.JSX.Element | null {
        if (!this.state.showImportDialog) {
            return null;
        }
        return (
            <ImportProjectDialog
                projects={this.state.projects}
                themeType={this.state.themeType}
                onClose={(created, newProjectName) => {
                    this.setState({ showImportDialog: false });
                    if (newProjectName) {
                        window.location.href = `edit.html?${newProjectName}`;
                    }
                }}
                openNewProjectOnCreate
                projectName={this.state.projectName}
                socket={this.socket as unknown as LegacyConnection}
                adapterName={this.adapterName}
                instance={this.instance}
                loadProject={this.loadProject}
                refreshProjects={this.refreshProjects}
            />
        );
    }

    showLegacyFileSelector = (
        callback: (data: { path: string; file: string }, userArg: any) => void,
        options: {
            path?: string;
            userArg?: any;
        },
    ): void => this.setState({ legacyFileSelector: { callback, options } });

    renderLegacyFileSelectorDialog(): React.JSX.Element {
        return this.state.legacyFileSelector ? (
            <SelectFileDialog
                title={I18n.t('Select file')}
                onClose={() => this.setState({ legacyFileSelector: false })}
                restrictToFolder={`${this.adapterName}.${this.instance}/${this.state.projectName}`}
                allowNonRestricted
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                theme={this.state.theme}
                selected={this.state.legacyFileSelector.options?.path || ''}
                filterByType="images"
                onOk={(selected: string) => {
                    const projectPrefix = `${this.adapterName}.${this.instance}/${this.state.projectName}/`;
                    if (selected.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (!selected.startsWith('.')) {
                        selected = `../${selected}`;
                    }
                    const parts = selected.split('/');
                    const file = parts.pop();
                    const path = `${parts.join('/')}/`;
                    this.state.legacyFileSelector &&
                        this.state.legacyFileSelector.callback(
                            { path, file },
                            this.state.legacyFileSelector.options?.userArg,
                        );
                    this.setState({ legacyFileSelector: null });
                }}
                socket={this.socket}
            />
        ) : null;
    }

    renderLoadingText(): React.JSX.Element | null {
        if (!this.state.loadingText) {
            return null;
        }
        return (
            <Box
                component="div"
                sx={styles.loadingText}
            >
                {this.state.loadingText}
            </Box>
        );
    }

    toggleTheme(newThemeName?: ThemeName): void {
        super.toggleTheme(newThemeName);

        // apply background color only if not in iframe
        this.props.setBackground();
    }

    render(): React.JSX.Element {
        if (this.state.projectDoesNotExist) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>{this.renderProjectDoesNotExist()}</ThemeProvider>
                </StyledEngineProvider>
            );
        }

        if (this.state.showProjectsDialog) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>{this.showSmallProjectsDialog()}</ThemeProvider>
                </StyledEngineProvider>
            );
        }

        if (!this.state.loaded || !store.getState().visProject.___settings || !this.state.userGroups) {
            return (
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        {this.renderLoadingText()}
                        {this.renderLoader()}
                    </ThemeProvider>
                </StyledEngineProvider>
            );
        }

        if (this.state.runtime) {
            return this.getVisEngine();
        }

        for (const widgetId of this.state.selectedWidgets) {
            if (!store.getState().visProject[this.state.selectedView]?.widgets[widgetId]) {
                void this.setSelectedWidgets([]);
                return null;
            }
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <style>
                        {`
@keyframes colorBlink {
    0% {
        color: #FF0000;
    }
    50% {
        color: ${this.state.theme.palette.text.primary};
    }
    100% {
        color: #FF0000
    }
}`}
                    </style>
                    <Popper
                        id="vis_main_popper"
                        placement="top-start"
                        anchorEl={this.mainRef.current}
                        open={!!Object.keys(this.state.widgetsClipboard.widgets).length}
                        style={{ width: '100%', textAlign: 'center', pointerEvents: 'none' }}
                    >
                        <Paper
                            style={{
                                display: 'inline-block',
                                pointerEvents: 'initial',
                                zIndex: 1000,
                                padding: 10,
                                cursor: 'pointer',
                                opacity: 0.8,
                            }}
                            title={I18n.t('Click to close')}
                            onClick={() => this.setState({ widgetsClipboard: { widgets: {}, type: '' } })}
                        >
                            {Object.keys(this.state.widgetsClipboard.widgets).join(', ')}
                        </Paper>
                    </Popper>
                    <Box
                        component="div"
                        sx={styles.app}
                    >
                        <Toolbar
                            selectedView={this.state.selectedView}
                            changeView={this.changeView}
                            changeProject={this.changeProject}
                            openedViews={store.getState().visProject.___settings.openedViews}
                            toggleView={this.toggleView}
                            socket={this.socket as unknown as LegacyConnection}
                            projects={this.state.projects}
                            loadProject={this.loadProject}
                            projectName={this.state.projectName}
                            addProject={this.addProject}
                            renameProject={this.renameProject}
                            deleteProject={this.deleteProject}
                            needSave={this.state.needSave}
                            currentUser={this.state.currentUser}
                            themeName={this.state.themeName}
                            themeType={this.state.themeType}
                            theme={this.state.theme}
                            toggleTheme={() => this.toggleTheme()}
                            refreshProjects={this.refreshProjects}
                            viewsManager={this.state.viewsManager}
                            setViewsManager={this.setViewsManager}
                            projectsDialog={
                                this.state.projects && this.state.projects.length
                                    ? this.state.projectsDialog
                                    : !this.state.createFirstProjectDialog
                            }
                            setProjectsDialog={this.setProjectsDialog}
                            selectedWidgets={this.state.editMode ? this.state.selectedWidgets : []}
                            setSelectedWidgets={this.setSelectedWidgets}
                            history={this.state.history}
                            historyCursor={this.state.historyCursor}
                            undo={this.undo}
                            redo={this.redo}
                            deleteWidgets={this.deleteWidgets}
                            widgetsLoaded={this.state.widgetsLoaded === Runtime.WIDGETS_LOADING_STEP_ALL_LOADED}
                            widgetsClipboard={this.state.widgetsClipboard}
                            cutWidgets={this.cutWidgets}
                            copyWidgets={this.copyWidgets}
                            pasteWidgets={this.pasteWidgets}
                            alignWidgets={this.alignWidgets}
                            cloneWidgets={this.cloneWidgets}
                            orderWidgets={this.orderWidgets}
                            lockDragging={this.state.lockDragging}
                            // disableInteraction={this.state.disableInteraction}
                            toggleLockDragging={this.toggleLockDragging}
                            // toggleDisableInteraction={this.toggleDisableInteraction}
                            adapterName={this.adapterName}
                            selectedGroup={this.state.selectedGroup}
                            // setSelectedGroup={this.setSelectedGroup}
                            widgetHint={this.state.widgetHint}
                            toggleWidgetHint={this.toggleWidgetHint}
                            instance={this.instance}
                            editMode={this.state.editMode}
                            toolbarHeight={this.state.toolbarHeight}
                            setToolbarHeight={(value: 'narrow' | 'veryNarrow') => {
                                window.localStorage.setItem('Vis.toolbarForm', value);
                                this.setState({ toolbarHeight: value });
                            }}
                            version={this.props.version}
                        />
                        <div
                            style={{ position: 'relative' }}
                            ref={this.mainRef}
                        >
                            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                                <DndPreview />
                                {this.state.hidePalette && this.state.hideAttributes ? this.renderWorkspace() : null}
                                <ReactSplit
                                    direction={SplitDirection.Horizontal}
                                    initialSizes={
                                        this.state.hidePalette && !this.state.hideAttributes
                                            ? [
                                                  this.state.splitSizes[0] + this.state.splitSizes[1],
                                                  this.state.splitSizes[2],
                                              ]
                                            : !this.state.hidePalette && this.state.hideAttributes
                                              ? [
                                                    this.state.splitSizes[0],
                                                    this.state.splitSizes[1] + this.state.splitSizes[2],
                                                ]
                                              : this.state.splitSizes
                                    }
                                    minWidths={
                                        this.state.hidePalette && !this.state.hideAttributes
                                            ? [0, 240]
                                            : !this.state.hidePalette && this.state.hideAttributes
                                              ? [240, 0]
                                              : [240, 0, 240]
                                    }
                                    onResizeFinished={(gutterIdx, newSizes: [number, number, number]) => {
                                        let splitSizes: [number, number, number] = [0, 0, 0];
                                        if (this.state.hidePalette && !this.state.hideAttributes) {
                                            splitSizes[0] = this.state.splitSizes[0];
                                            splitSizes[1] = newSizes[0] - this.state.splitSizes[0];
                                            splitSizes[2] = newSizes[1];
                                        } else if (!this.state.hidePalette && this.state.hideAttributes) {
                                            splitSizes[0] = newSizes[0];
                                            splitSizes[1] = newSizes[1] - this.state.splitSizes[2];
                                            splitSizes[2] = this.state.splitSizes[2];
                                        } else {
                                            splitSizes = newSizes;
                                        }

                                        const sum = splitSizes.reduce((prev, curr) => prev + curr);
                                        if (Math.ceil(sum) !== 100) {
                                            if (Math.ceil(sum) === 101 || Math.ceil(sum) === 99) {
                                                // Round the first 2 sizes to 0.01 and calculate the last
                                                splitSizes[0] = Math.round(splitSizes[0] * 100) / 100;
                                                splitSizes[1] = Math.round(splitSizes[1] * 100) / 100;
                                                splitSizes[2] = 100 - splitSizes[0] - splitSizes[1];
                                                this.setState({ splitSizes });
                                                window.localStorage.setItem(
                                                    'Vis.splitSizes',
                                                    JSON.stringify(splitSizes),
                                                );
                                            } else {
                                                // https://github.com/devbookhq/splitter/issues/15
                                                console.log(
                                                    'Decline resize, to work around bug in @devbookhq/splitter',
                                                );
                                                this.setState({ splitSizes: this.state.splitSizes });
                                            }
                                        } else {
                                            this.setState({ splitSizes });
                                            window.localStorage.setItem('Vis.splitSizes', JSON.stringify(splitSizes));
                                        }
                                    }}
                                    // theme={this.state.themeType === 'dark' ? GutterTheme.Dark : GutterTheme.Light}
                                    gutterClassName={
                                        this.state.themeType === 'dark' ? 'Dark visGutter' : 'Light visGutter'
                                    }
                                >
                                    {!this.state.hidePalette ? this.renderPalette() : null}
                                    {this.renderWorkspace()}
                                    {!this.state.hideAttributes ? this.renderAttributes() : null}
                                </ReactSplit>
                            </DndProvider>
                        </div>
                    </Box>
                    {this.renderLoadingText()}
                    {this.renderCreateFirstProjectDialog()}
                    {this.renderDeleteDialog()}
                    {this.renderUpdateDialog()}
                    {this.renderAlertDialog()}
                    {this.renderConfirmDialog()}
                    {this.renderShowCodeDialog()}
                    {this.renderShowProjectUpdateDialog()}
                    {this.renderMessageDialog()}
                    {this.renderLegacyFileSelectorDialog()}
                    {this.renderAskAboutIncludeDialog()}
                    {this.state.marketplaceDialog ? (
                        <MarketplaceDialog
                            onClose={() => this.setState({ marketplaceDialog: false })}
                            installWidget={this.installWidget}
                            updateWidgets={this.updateWidgets}
                            installedWidgets={store.getState().visProject?.___settings.marketplace}
                            {...this.state.marketplaceDialog}
                            themeName={this.state.themeName}
                        />
                    ) : null}
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export default Editor;
