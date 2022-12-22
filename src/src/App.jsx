import React, { useRef } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { withStyles, StylesProvider, createGenerateClassName } from '@mui/styles';
import { DndProvider, useDrop } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactSplit, { SplitDirection, GutterTheme } from '@devbookhq/splitter';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';

import {
    IconButton, Paper, Popper, Tab, Tabs, Tooltip, Snackbar, LinearProgress,
} from '@mui/material';

// import html2canvas from 'html2canvas';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';
import PlayIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import IconPalette from '@mui/icons-material/Palette';
import IconAttributes from '@mui/icons-material/ListAlt';

import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import {
    i18n as I18n, Utils, Loader, Confirm as ConfirmDialog,
    Message as MessageDialog,
} from '@iobroker/adapter-react-v5';

import Attributes from './Attributes';
import Palette from './Palette';
import Toolbar from './Toolbar';
import CodeDialog from './Components/CodeDialog';
import CreateFirstProjectDialog from './Components/CreateFirstProjectDialog';
import VisEngine from './Vis/visEngine';
import { registerWidgetsLoadIndicator } from './Vis/visUtils';
import { DndPreview, isTouchDevice } from './Utils';
import VisWidgetsCatalog, { getWidgetTypes, parseAttributes } from './Vis/visWidgetsCatalog';
import VisContextMenu from './Vis/visContextMenu';

const generateClassName = createGenerateClassName({
    productionPrefix: 'vis-e',
});

const WIDGETS_LOADING_STEP_NOT_STARTED = 0;
const WIDGETS_LOADING_STEP_HTML_LOADED = 1;
const WIDGETS_LOADING_STEP_ALL_LOADED = 2;

const styles = theme => ({
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
        overflow: 'auto',
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
    app: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
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
    groupEditTab: {
        color: theme.palette.mode === 'dark' ? '#bad700' : '#f3bf00',
    },
    tabsName: {
        whiteSpace: 'nowrap',
    },
    viewTabs: {
        display: 'inline-block',
        ...theme.classes.viewTabs,
    },
    viewTab: {
        padding: '6px 12px',
        ...theme.classes.viewTab,
    },
    alert_info: {

    },
    alert_error: {
        backgroundColor: '#f44336',
    },
    alert_success: {
        backgroundColor: '#4caf50',
    },
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
    editModeComponentClass: {
        zIndex: 1002,
    },
});

const ViewDrop = props => {
    const targetRef = useRef();

    const [{ CanDrop, isOver }, drop] = useDrop(() => ({
        accept: ['widget'],
        drop(item, monitor) {
            console.log(monitor.getClientOffset());
            console.log(targetRef.current.getBoundingClientRect());
            console.log(item);
            props.addWidget(
                item.widgetType.name,
                monitor.getClientOffset().x - targetRef.current.getBoundingClientRect().x,
                monitor.getClientOffset().y - targetRef.current.getBoundingClientRect().y,
            );
        },
        canDrop: () => props.editMode,
        collect: monitor => ({
            isOver: monitor.isOver(),
            CanDrop: monitor.canDrop(),
        }),
    }), [props.editMode]);

    return <div
        ref={drop}
        style={isOver && CanDrop ? {
            borderStyle: 'dashed', borderRadius: 4, borderWidth: 1, height: '100%', width: '100%',
        } : { height: '100%', width: '100%' }}
    >
        <div ref={targetRef} style={{ height: '100%', width: '100%' }}>
            {props.children}
        </div>
    </div>;
};

class App extends GenericApp {
    constructor(props) {
        const extendedProps = { ...props };
        extendedProps.translations = {
            en: require('./i18n/en'),
            de: require('./i18n/de'),
            ru: require('./i18n/ru'),
            pt: require('./i18n/pt'),
            nl: require('./i18n/nl'),
            fr: require('./i18n/fr'),
            it: require('./i18n/it'),
            es: require('./i18n/es'),
            pl: require('./i18n/pl'),
            uk: require('./i18n/uk'),
            'zh-cn': require('./i18n/zh-cn'),
        };

        extendedProps.sentryDSN = window.sentryDSN;

        if (window.location.port === '3000') {
            extendedProps.socket = { port: '8082' };
        }
        super(props, extendedProps);

        this.visEngineHandlers = {};

        this.alert = window.alert;
        window.alert = message => {
            if (message && message.toString().toLowerCase().includes('error')) {
                console.error(message);
                this.showAlert(message.toString(), 'error');
            } else {
                console.log(message);
                this.showAlert(message.toString(), 'info');
            }
        };

        this.adapterId = `${this.adapterName}.0`;

        // temporary disable translation warnings
        // I18n.disableWarning(true);
        registerWidgetsLoadIndicator(this.setWidgetsLoadingProgress);
    }

    onIgnoreMouseEvents = ignore => {
        if (this.state.ignoreMouseEvents !== ignore) {
            setTimeout(() => this.setState({ ignoreMouseEvents: ignore }), 100);
        }
    };

    setStateAsync(newState) {
        return new Promise(resolve => {
            this.setState(newState, () =>
                resolve());
        });
    }

    componentDidMount() {
        super.componentDidMount();
        let runtime = false;

        if (window.location.search.includes('runtime') || !window.location.pathname.endsWith('edit.html')) {
            runtime = true;
        }
        if (window.location.search.includes('edit') || (window.location.port.startsWith('300') && !window.location.search.includes('runtime'))) {
            runtime = false;
        }

        this.setState({
            alert: false,
            alertType: 'info',
            alertMessage: '',
            runtime,
            projectName: 'main',
            viewsManager: false,
            projectsDialog: false,
            createFirstProjectDialog: false,
            selectedWidgets: [],
            align: {
                alignType: null,
                alignIndex: 0,
                alignValues: [],
            },
            showCode: window.localStorage.getItem('showCode') === 'true',
            editMode: true,
            widgetsLoaded: WIDGETS_LOADING_STEP_NOT_STARTED,
            fonts: [],
            history: [],
            historyCursor: 0,
            widgetsClipboard: {
                type: null,
                widgets: {},
            },
            // clipboardImages: [],
            lockDragging: JSON.parse(window.localStorage.getItem('lockDragging')),
            disableInteraction: JSON.parse(window.localStorage.getItem('disableInteraction')),
            toolbarHeight: window.localStorage.getItem('Vis.toolbarForm') || 'full',
            deleteWidgetsDialog: false,
            messageDialog: null,
            visCommonCss: null,
            visUserCss: null,
            widgetHint: window.localStorage.getItem('widgetHint') || 'light',
            hidePalette: window.localStorage.getItem('Vis.hidePalette') === 'true',
            hideAttributes: window.localStorage.getItem('Vis.hideAttributes') === 'true',
            loadingProgress: { step: 0, total: 0 },
            showCodeDialog: null,
            confirmDialog: null,
            showProjectUpdateDialog: false,
            ignoreMouseEvents: false,
        });

        window.addEventListener('hashchange', this.onHashChange, false);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('beforeunload', this.onBeforeUnload, false);
    }

    componentWillUnmount() {
        // eslint-disable-next-line no-unused-expressions
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = null;
        super.componentWillUnmount();
        window.removeEventListener('hashchange', this.onHashChange, false);
        window.removeEventListener('keydown', this.onKeyDown, false);
        window.removeEventListener('beforeunload', this.onBeforeUnload, false);
        window.alert = this.alert;
    }

    onBeforeUnload = e => {
        if (this.state.needSave) {
            this.needRestart = true;
            e.returnValue = I18n.t('Project doesn\'t saved. Are you sure?');
            return e.returnValue;
        }

        return null;
    };

    onKeyDown = async e => {
        if (!this.state.editMode) {
            return;
        }
        const controlKey = e.ctrlKey || e.cmdKey;
        if (document.activeElement.tagName === 'BODY') {
            if (controlKey && e.key === 'z' && this.state.historyCursor !== 0) {
                e.preventDefault();
                await this.undo();
            }
            if (controlKey && e.key === 'y' && this.state.historyCursor !== this.state.history.length - 1) {
                e.preventDefault();
                await this.redo();
            }
            if (this.state.selectedWidgets.length) {
                if (controlKey && e.key === 'c') {
                    e.preventDefault();
                    await this.copyWidgets();
                }
                if (controlKey && e.key === 'x') {
                    e.preventDefault();
                    await this.cutWidgets();
                }
            }
            if (controlKey && e.key === 'v' && Object.keys(this.state.widgetsClipboard.widgets).length) {
                e.preventDefault();
                await this.pasteWidgets();
            }
            if (controlKey && e.key === 'a') {
                e.preventDefault();
                if (this.state.selectedGroup) {
                    this.setSelectedWidgets(Object.keys(this.state.project[this.state.selectedView].widgets)
                        .filter(widget => !this.state.project[this.state.selectedView].widgets[widget].data.locked && this.state.project[this.state.selectedView].widgets[widget].groupid === this.state.selectedGroup));
                } else {
                    this.setSelectedWidgets(Object.keys(this.state.project[this.state.selectedView].widgets)
                        .filter(widget => !this.state.project[this.state.selectedView].widgets[widget].data.locked && !this.state.project[this.state.selectedView].widgets[widget].grouped));
                }
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.setSelectedWidgets([]);
            }
            if (e.key === 'Delete') {
                e.preventDefault();
                await this.deleteWidgets();
            }
        }
    };

    onHashChange = () => {
        this.changeView(decodeURIComponent(window.location.hash.slice(1)))
            .then(() => {});
    };

    onProjectChange = (id, fileName) => {
        if (fileName.endsWith('.json')) {
            // if runtime => just update project
            if (this.state.runtime) {
                this.loadProject(this.state.projectName);
            } else if (fileName.endsWith(`${this.state.projectName}/vis-views.json`)) {
                // compare last executed file with new one
                this.socket.readFile(this.adapterId, fileName)
                    .then(file => {
                        if (!file || this.lastProjectJSONfile !== file.file) { // adapter-react-v5@4.x delivers file.file
                            this.setState({ showProjectUpdateDialog: true });
                        }
                    });
            }
        }
    };

    loadProject = async (projectName, file) => {
        if (!file) {
            try {
                file = await this.socket.readFile(this.adapterId, `${projectName}/vis-views.json`);
                if (typeof file === 'object') {
                    file = file.file; // adapter-react-v5@4.x delivers file.file
                }
            } catch (err) {
                console.warn(`Cannot read project file vis-views.json: ${err}`);
                file = '{}';
            }
        }

        if (!this.state.runtime) {
            // remember last loaded project file
            this.lastProjectJSONfile = file;
        }

        let project;
        try {
            project = JSON.parse(file);
        } catch (e) {
            window.alert('Cannot parse project file!');
            project = {
                'Cannot parse project file!': {
                    widgets: {},
                },
            };
        }

        project.___settings = project.___settings || {};
        project.___settings.folders = project.___settings.folders || [];
        let selectedView;
        if (decodeURIComponent(window.location.hash.slice(1)).length) {
            selectedView = decodeURIComponent(window.location.hash.slice(1));
        } else if (Object.keys(project).includes(window.localStorage.getItem('selectedView'))) {
            selectedView = window.localStorage.getItem('selectedView');
        } else {
            selectedView = Object.keys(project).find(view => !view.startsWith('__')) || '';
        }
        let openedViews;
        if (window.localStorage.getItem('openedViews')) {
            openedViews = JSON.parse(window.localStorage.getItem('openedViews'));
        } else {
            openedViews = [selectedView];
        }

        const len = openedViews.length;

        // fix project
        Object.keys(project).forEach(view => {
            if (project[view].widgets) {
                Object.keys(project[view].widgets).forEach(wid => {
                    if (!project[view].widgets[wid]) {
                        delete project[view].widgets[wid];
                        return;
                    }
                    if (!project[view].widgets[wid].data) {
                        project[view].widgets[wid].data = {};
                    }
                    if (!project[view].widgets[wid].style) {
                        project[view].widgets[wid].style = {};
                    }

                    if (project[view].widgets[wid].data.members && !Array.isArray(project[view].widgets[wid].data.members)) {
                        project[view].widgets[wid].data.members = [];
                    }

                    if (project[view].widgets[wid].data.members) {
                        project[view].widgets[wid].data.members.forEach((_wid, i) =>
                            project[view].widgets[wid].data.members[i] = _wid.replace(/\s/g, '_'));
                    }

                    if (wid.includes(' ')) {
                        const newWid = wid.replace(/\s/g, '_');
                        const widget = project[view].widgets[wid];
                        delete project[view].widgets[wid];
                        project[view].widgets[newWid] = widget;
                    }
                    // If widget is not unique, change its name
                    if (Object.keys(project).find(v => v !== view && project[v].widgets && project[v].widgets[wid])) {
                        const _newWid = wid[0] === 'g' ? this.getNewGroupId(project) : this.getNewWidgetId(project);
                        console.log(`Rename widget ${wid} to ${_newWid}`);
                        const widget = project[view].widgets[wid];
                        delete project[view].widgets[wid];
                        project[view].widgets[_newWid] = widget;
                    }
                });
            }
        });

        let changed = false;
        for (let i = len - 1; i >= 0; i--) {
            if (!project[openedViews[i]]) {
                openedViews.splice(i, 1);
                changed = true;
            }
        }

        if (!openedViews.length) {
            const view = Object.keys(project).find(_view => _view !== '___settings');
            if (view) {
                openedViews[0] = view;
                changed = true;
            }
        }
        if (changed) {
            window.localStorage.setItem('openedViews', JSON.stringify(openedViews));
        }

        // check that selectedView and openedViews exist
        if (!project[selectedView]) {
            selectedView = openedViews[0] || '';
            window.localStorage.setItem('selectedView', selectedView);
        } else
        if (openedViews && !openedViews.includes(selectedView)) {
            selectedView = openedViews[0];
            window.localStorage.setItem('selectedView', selectedView);
        }

        const groups = await this.socket.getGroups();

        window.localStorage.setItem('projectName', projectName);

        if (this.subscribedProject && (this.subscribedProject !== projectName || project.___settings.reloadOnEdit === false)) {
            this.subscribedProject = null;
            this.socket.unsubscribeFiles(this.adapterId, `${this.subscribedProject}/*`, this.onProjectChange);
        }

        if (this.state.runtime) {
            if (project.___settings.reloadOnEdit !== false) {
                this.subscribedProject = projectName;
                // subscribe on changes
                this.socket.subscribeFiles(this.adapterId, `${projectName}/*`, this.onProjectChange);
            }
        } else {
            this.subscribedProject = projectName;
            // subscribe on changes
            this.socket.subscribeFiles(this.adapterId, `${projectName}/*`, this.onProjectChange);
        }

        await this.setStateAsync({
            visCommonCss: null,
            visUserCss: null,
            project,
            history: [project],
            historyCursor: 0,
            visProject: project,
            openedViews,
            projectName,
            groups,
        });

        await this.changeView(selectedView);
    };

    setWidgetsLoadingProgress = (step, total) => {
        // console.log('setWidgetsLoadingProgress', step, total);
        this.setState({ loadingProgress: { step, total } });
    };

    onVisChanged() {
        this.setState({
            messageDialog: {
                text: I18n.t('Detected new version of vis files. Reloading in 2 seconds...'),
                title: I18n.t('Reloading'),
                ok: I18n.t('Reload now'),
                callback: () => {
                    if (!this.state.runtime && this.changeTimer) {
                        this.needRestart = true;
                    } else {
                        setTimeout(() =>
                            window.location.reload(), 2000);
                    }
                },
            },
        });
        if (!this.state.runtime && this.changeTimer) {
            this.needRestart = true;
        } else {
            setTimeout(() =>
                window.location.reload(), 2000);
        }
    }

    onWidgetSetsChanged = (id, state) => {
        if (state && this.lastUploadedState && state.val !== this.lastUploadedState) {
            this.lastUploadedState = state.val;
            this.onVisChanged();
        }
    };

    async onConnectionReady() {
        // preload all widgets first
        if (this.state.widgetsLoaded === WIDGETS_LOADING_STEP_HTML_LOADED) {
            await VisWidgetsCatalog.collectRxInformation(this.socket);
            await this.setStateAsync({ widgetsLoaded: WIDGETS_LOADING_STEP_ALL_LOADED });
        }

        await this.refreshProjects();

        const user = await this.socket.getCurrentUser();
        const currentUser = await this.socket.getObject(`system.user.${user || 'admin'}`);
        await this.setStateAsync({
            currentUser,
            selectedView: '',
            splitSizes: window.localStorage.getItem('Vis.splitSizes')
                ? JSON.parse(window.localStorage.getItem('Vis.splitSizes'))
                : [20, 60, 20],
        });

        // subscribe on info.uploaded
        this.socket.subscribeState(`${this.adapterName}.${this.instance}.info.uploaded`, this.onWidgetSetsChanged);
        const uploadedState = await this.socket.getState(`${this.adapterName}.${this.instance}.info.uploaded`);
        if (uploadedState && uploadedState.val !== this.lastUploadedState) {
            if (this.lastUploadedState) {
                this.onVisChanged();
            } else {
                this.lastUploadedState = uploadedState.val;
            }
        }

        if (window.localStorage.getItem('projectName')) {
            await this.loadProject(window.localStorage.getItem('projectName'));
        } else if (this.state.projects.includes('main')) {
            await this.loadProject('main');
        } else {
            // take first project
            await this.loadProject(this.state.projects[0]);
        }
    }

    refreshProjects = async reloadCurrentProject => {
        let projects;

        try {
            projects = await this.socket.readDir(this.adapterId, '');
        } catch (e) {
            projects = [];
        }

        await this.setStateAsync({
            projects: projects.filter(dir => dir.isDir).map(dir => dir.file),
            createFirstProjectDialog: !projects.length,
        });
        if (reloadCurrentProject) {
            await this.loadProject(this.state.projectName);
        }
    };

    setViewsManager = isOpen => this.setState({ viewsManager: isOpen });

    setProjectsDialog = isOpen => this.setState({ projectsDialog: isOpen });

    loadSelectedWidgets(selectedView) {
        selectedView = selectedView || this.state.selectedView;
        const selectedWidgets = JSON.parse(window.localStorage.getItem(
            `${this.state.projectName}.${selectedView}.widgets`,
        ) || '[]') || [];

        // Check that all selectedWidgets exist
        for (let i = selectedWidgets.length - 1; i >= 0; i--) {
            if (!this.state.project[selectedView] || !this.state.project[selectedView].widgets || !this.state.project[selectedView].widgets[selectedWidgets[i]]) {
                selectedWidgets.splice(i, 1);
            }
        }

        return selectedWidgets;
    }

    changeView = async selectedView => {
        let selectedWidgets = JSON.parse(window.localStorage.getItem(
            `${this.state.projectName}.${selectedView}.widgets`,
        ) || '[]') || [];

        // Check that all selectedWidgets exist
        for (let i = selectedWidgets.length - 1; i >= 0; i--) {
            if (!this.state.project[selectedView] || !this.state.project[selectedView].widgets || !this.state.project[selectedView].widgets[selectedWidgets[i]]) {
                selectedWidgets = selectedWidgets.splice(i, 1);
            }
        }

        const newState = {
            selectedView,
            selectedWidgets,
        };

        if (!this.state.openedViews || !this.state.openedViews.includes(selectedView)) {
            const openedViews = this.state.openedViews ? [...this.state.openedViews] : [];
            openedViews.push(selectedView);
            newState.openedViews = openedViews;
        }

        window.localStorage.setItem('selectedView', selectedView);

        if (window.location.hash !== `#${selectedView}`) {
            window.location.hash = selectedView;
        }

        await this.setStateAsync(newState);
    };

    getNewWidgetIdNumber = (isGroup, project) => {
        const widgets = [];
        project = project || this.state.project;
        Object.keys(project).forEach(view =>
            project[view].widgets && Object.keys(project[view].widgets).forEach(widget =>
                widgets.push(widget)));
        let newKey = 1;
        widgets.forEach(name => {
            const matches = isGroup ? name.match(/^g([0-9]+)$/) : name.match(/^w([0-9]+)$/);
            if (matches) {
                const num = parseInt(matches[1], 10);
                if (num >= newKey) {
                    newKey = num + 1;
                }
            }
        });

        return newKey;
    };

    getNewWidgetId = project => {
        let newKey = this.getNewWidgetIdNumber(false, project);

        newKey = `w${newKey.toString().padStart(6, 0)}`;

        return newKey;
    };

    getNewGroupId = project => {
        let newKey = this.getNewWidgetIdNumber(true, project);

        newKey = `g${newKey.toString().padStart(6, 0)}`;

        return newKey;
    };

    addWidget = async (widgetType, x, y) => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        const newKey = this.getNewWidgetId();
        widgets[newKey] = {
            tpl: widgetType,
            data: {},
            style: {
                left: `${x}px`,
                top: `${y}px`,
            },
        };

        if (this.state.selectedGroup) {
            widgets[newKey].grouped = true;
            widgets[newKey].groupid = this.state.selectedGroup;
            widgets[this.state.selectedGroup].data.members.push(newKey);
        }

        // check if we have any fields contain "oid" in it and pre-fill it with "nothing_selected" value
        const widgetTypes = getWidgetTypes();
        const tplWidget = widgetTypes.find(item => item.name === widgetType);

        // extract groups
        const fields = parseAttributes(tplWidget.params);

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

        // Custom init of widgets
        if (tplWidget.init) {
            if (window.vis && window.vis.binds[tplWidget.set] && window.vis.binds[tplWidget.set][tplWidget.init]) {
                window.vis.binds[tplWidget.set][tplWidget.init](widgetType, widgets[newKey].data);
            }
        }

        await this.changeProject(project);
        this.setSelectedWidgets([newKey]);
    };

    deleteWidgets = async () => this.setState({ deleteWidgetsDialog: true });

    deleteWidgetsAction = async () => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        this.state.selectedWidgets.forEach(selectedWidget => {
            if (widgets[selectedWidget].tpl === '_tplGroup') {
                widgets[selectedWidget].data.members.forEach(member => {
                    delete widgets[member];
                });
            }
            delete widgets[selectedWidget];
        });
        this.setSelectedWidgets([]);
        await this.changeProject(project);
    };

    lockWidgets = async type => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        this.state.selectedWidgets.forEach(selectedWidget =>
            widgets[selectedWidget].data.locked = type === 'lock');
        await this.changeProject(project);
    };

    toggleWidgetHint = () => {
        let widgetHint;
        if (this.state.widgetHint === 'light') {
            widgetHint = 'dark';
        } else
        if (this.state.widgetHint === 'dark') {
            widgetHint = 'hide';
        } else
        if (this.state.widgetHint === 'hide') {
            widgetHint = 'light';
        }
        this.setState({ widgetHint });
        window.localStorage.setItem('widgetHint', widgetHint);
    };

    cutWidgets = async () => {
        this.cutCopyWidgets('cut');
    };

    copyWidgets = async () => {
        this.cutCopyWidgets('copy');
    };

    cutCopyWidgets = async type => {
        const widgets = {};
        const project = JSON.parse(JSON.stringify(this.state.project));

        this.state.selectedWidgets.forEach(selectedWidget => {
            widgets[selectedWidget] = this.state.project[this.state.selectedView].widgets[selectedWidget];
            if (type === 'cut' && project[this.state.selectedView]) {
                delete project[this.state.selectedView].widgets[selectedWidget];
            }
        });

        await this.setStateAsync({
            widgetsClipboard: {
                type,
                view: this.state.selectedView,
                widgets,
            },
            // clipboardImages: JSON.parse(JSON.stringify(this.state.selectedWidgets)),
        });

        // deselect all widgets
        if (type === 'cut') {
            await this.setSelectedWidgets([]);
            await this.changeProject(project);
        }

        /*
        const clipboardImages = [];
        for (const k in this.state.selectedWidgets) {
            clipboardImages.push(this.state.selectedWidgets[k]);
            // let canvas;
            // try {
            //     canvas = (await html2canvas(window.document.getElementById(this.state.selectedWidgets[k])));
            // } catch (e) {
            // //
            // }
            // if (canvas) {
            //     const newCanvas = window.document.createElement('canvas');
            //     newCanvas.height = 80;
            //     newCanvas.width = Math.ceil((canvas.width / canvas.height) * newCanvas.height);
            //     if (newCanvas.width > 80) {
            //         newCanvas.width = 80;
            //         newCanvas.height = Math.ceil((canvas.height / canvas.width) * newCanvas.width);
            //     }
            //     const ctx = newCanvas.getContext('2d');
            //     ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
            //     ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
            //     clipboardImages.push(newCanvas.toDataURL(0));
            // }
        }
         */
    };

    pasteWidgets = async () => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;

        const newKeys = [];
        Object.keys(this.state.widgetsClipboard.widgets).forEach(clipboardWidgetId => {
            const newWidget = JSON.parse(JSON.stringify(this.state.widgetsClipboard.widgets[clipboardWidgetId]));
            if (this.state.widgetsClipboard.type === 'copy' && this.state.selectedView === this.state.widgetsClipboard.view) {
                const boundingRect = App.getWidgetRelativeRect(clipboardWidgetId);
                newWidget.style = this.pxToPercent(newWidget.style, {
                    left: `${boundingRect.left + 10}px`,
                    top: `${boundingRect.top + 10}px`,
                });
            }
            const newKey = this.getNewWidgetId();
            widgets[newKey] = newWidget;
            newKeys.push(newKey);
        });
        this.setSelectedWidgets([]);
        await this.changeProject(project);
        this.setSelectedWidgets(newKeys);
    };

    cloneWidgets = async () => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;

        const newKeys = [];
        this.state.selectedWidgets.forEach(selectedWidget => {
            const newWidget = JSON.parse(JSON.stringify(widgets[selectedWidget]));
            const boundingRect = App.getWidgetRelativeRect(selectedWidget);
            newWidget.style = this.pxToPercent(newWidget.style, {
                left: boundingRect.left + 10,
                top: boundingRect.top + 10,
            });
            const newKey = this.getNewWidgetId();
            widgets[newKey] = newWidget;
            newKeys.push(newKey);
        });
        this.setSelectedWidgets([]);
        await this.changeProject(project);
        this.setSelectedWidgets(newKeys);
    };

    alignWidgets = type => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        const newCoordinates = {
            left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0,
        };
        const selectedWidgets = [];
        this.state.selectedWidgets.forEach(selectedWidget => {
            const boundingRect = App.getWidgetRelativeRect(selectedWidget);
            selectedWidgets.push({ id: selectedWidget, widget: widgets[selectedWidget], coordinate: boundingRect });
        });
        if (type === 'left') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.left === 0 || selectedWidget.coordinate.left < newCoordinates.left) {
                    newCoordinates.left = selectedWidget.coordinate.left;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.left = `${newCoordinates.left}px`);
        } else if (type === 'right') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.right === 0 || selectedWidget.coordinate.right > newCoordinates.right) {
                    newCoordinates.right = selectedWidget.coordinate.right;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.left = `${newCoordinates.right - selectedWidget.coordinate.width}px`);
        } else if (type === 'top') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.top === 0 || selectedWidget.coordinate.top < newCoordinates.top) {
                    newCoordinates.top = selectedWidget.coordinate.top;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.top = `${newCoordinates.top}px`);
        } else if (type === 'bottom') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.bottom === 0 || selectedWidget.coordinate.bottom > newCoordinates.bottom) {
                    newCoordinates.bottom = selectedWidget.coordinate.bottom;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.top = `${newCoordinates.bottom - selectedWidget.coordinate.height}px`);
        } else if (type === 'horizontal-center') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.left === 0 || selectedWidget.coordinate.left < newCoordinates.left) {
                    newCoordinates.left = selectedWidget.coordinate.left;
                }
                if (newCoordinates.right === 0 || selectedWidget.coordinate.right > newCoordinates.right) {
                    newCoordinates.right = selectedWidget.coordinate.right;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.left = `${(newCoordinates.left + (newCoordinates.right - newCoordinates.left) / 2) - (selectedWidget.coordinate.width / 2)}px`);
        } else if (type === 'vertical-center') {
            selectedWidgets.forEach(selectedWidget => {
                if (newCoordinates.top === 0 || selectedWidget.coordinate.top < newCoordinates.top) {
                    newCoordinates.top = selectedWidget.coordinate.top;
                }
                if (newCoordinates.bottom === 0 || selectedWidget.coordinate.bottom > newCoordinates.bottom) {
                    newCoordinates.bottom = selectedWidget.coordinate.bottom;
                }
            });
            selectedWidgets.forEach(selectedWidget => selectedWidget.widget.style.top = `${(newCoordinates.top + (newCoordinates.bottom - newCoordinates.top) / 2) - (selectedWidget.coordinate.height / 2)}px`);
        } else if (type === 'horizontal-equal') {
            let widgetsWidth = 0;
            let spaceWidth = 0;
            let currentLeft = 0;
            selectedWidgets.sort((selectedWidget1, selectedWidget2) => (selectedWidget1.coordinate.left > selectedWidget2.coordinate.left ? 1 : -1));
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
            selectedWidgets.sort((selectedWidget1, selectedWidget2) => (selectedWidget1.coordinate.top > selectedWidget2.coordinate.top ? 1 : -1));
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
                    if (alignValues.indexOf(w) === -1) { alignValues.push(w); }
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
                    if (alignValues.indexOf(h) === -1) { alignValues.push(h); }
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
        this.changeProject(project);
    };

    orderWidgets = type => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        let minZ = 0;
        let maxZ = 0;
        Object.keys(widgets).forEach(widget => {
            const currentZ = parseInt(widgets[widget].style['z-index'] || 0);
            if (minZ > currentZ || minZ === 0) {
                minZ = currentZ;
            }
            if (maxZ < currentZ || maxZ === 0) {
                maxZ = currentZ;
            }
        });

        this.state.selectedWidgets.forEach(selectedWidget => {
            const currentZ = parseInt(widgets[selectedWidget].style['z-index']) || 0;
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

    static getWidgetRelativeRect(widget) {
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
            };
        }

        return null;
    }

    groupWidgets = () => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        const group = {
            tpl: '_tplGroup',
            widgetSet: null,
            data: {
                members: this.state.selectedWidgets,
            },
            style: {

            },
        };
        const groupId = this.getNewGroupId();
        let left = 0;
        let top = 0;
        let right = 0;
        let bottom = 0;
        this.state.selectedWidgets.forEach(selectedWidget => {
            widgets[selectedWidget].grouped = true;
            widgets[selectedWidget].groupid = groupId;
            const widgetBoundingRect = App.getWidgetRelativeRect(selectedWidget);
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
            const widgetBoundingRect = App.getWidgetRelativeRect(selectedWidget);
            widgets[selectedWidget].style.left = widgetBoundingRect.left - left;
            widgets[selectedWidget].style.top = widgetBoundingRect.top - top;
        });
        group.style.left = `${left}px`;
        group.style.top = `${top}px`;
        group.style.width = `${right - left}px`;
        group.style.height = `${bottom - top}px`;
        widgets[groupId] = group;

        return this.changeProject(project);
    };

    ungroupWidgets = () => {
        const project = JSON.parse(JSON.stringify(this.state.project));
        const widgets = project[this.state.selectedView].widgets;
        const group = widgets[this.state.selectedWidgets[0]];
        group.data.members.forEach(member => {
            const widgetBoundingRect = App.getWidgetRelativeRect(member);
            widgets[member].style.left = `${widgetBoundingRect.left}px`;
            widgets[member].style.top = `${widgetBoundingRect.top}px`;
            widgets[member].style.width = `${widgetBoundingRect.width}px`;
            widgets[member].style.height = `${widgetBoundingRect.height}px`;
            delete widgets[member].grouped;
            delete widgets[member].groupid;
        });
        this.setSelectedWidgets(group.data.members);
        delete widgets[this.state.selectedWidgets[0]];

        return this.changeProject(project);
    };

    setSelectedGroup = groupId => {
        this.setState({ selectedGroup: groupId });
        this.setSelectedWidgets([]);
    };

    undo = async () => {
        this.setSelectedWidgets([]);
        await this.changeProject(this.state.history[this.state.historyCursor - 1], true);
        await this.setStateAsync({ historyCursor: this.state.historyCursor - 1 });
    };

    redo = async () => {
        this.setSelectedWidgets([]);
        await this.changeProject(this.state.history[this.state.historyCursor + 1], true);
        await this.setStateAsync({ historyCursor: this.state.historyCursor + 1 });
    };

    toggleLockDragging = () => {
        window.localStorage.setItem('lockDragging', JSON.stringify(!this.state.lockDragging));
        this.setState({ lockDragging: !this.state.lockDragging });
    };

    toggleDisableInteraction = () => {
        window.localStorage.setItem('disableInteraction', JSON.stringify(!this.state.disableInteraction));
        this.setState({ disableInteraction: !this.state.disableInteraction });
    };

    saveHistory(project) {
        this.historyTimer && clearTimeout(this.historyTimer);

        this.historyTimer = setTimeout(() => {
            this.historyTimer = null;

            let history = JSON.parse(JSON.stringify(this.state.history));
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

    changeProject = async (project, isHistory) => {
        const newState = { project, needSave: true };
        if (!isHistory) {
            // do not save history too often
            this.saveHistory(project);
        }

        // save changes after 1 second
        // eslint-disable-next-line no-unused-expressions
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = setTimeout(async () => {
            this.savingTimer = null;
            this.lastProjectJSONfile = JSON.stringify(this.state.project, null, 2);
            if ('TextEncoder' in window) {
                const encoder = new TextEncoder();
                const data = encoder.encode(JSON.stringify(this.state.project, null, 2));
                await this.socket.writeFile64(this.adapterId, `${this.state.projectName}/vis-views.json`, data);
            } else {
                await this.socket.writeFile64(this.adapterId, `${this.state.projectName}/vis-views.json`, JSON.stringify(this.state.project, null, 2));
            }

            this.setState({ needSave: false });
            if (this.needRestart) {
                window.location.reload();
            }
        }, 1000);

        newState.visProject = project;
        await this.setStateAsync(newState);
    };

    addProject = async projectName => {
        try {
            const project = {
                ___settings: {
                    folders: [],
                },
                default: {
                    name: 'Default',
                    settings: {
                        style: {},
                    },
                    widgets: {},
                    activeWidgets: {},
                },
            };
            await this.socket.writeFile64(this.adapterId, `${projectName}/vis-views.json`, JSON.stringify(project));
            await this.socket.writeFile64(this.adapterId, `${projectName}/vis-user.css`, '');
            await this.refreshProjects();
            await this.loadProject(projectName);
            // close dialog
            this.setProjectsDialog(false);
        } catch (e) {
            window.alert(`Cannot create project: ${e.toString()}`);
        }
    };

    renameProject = async (fromProjectName, toProjectName) => {
        try {
            // const files = await this.socket.readDir(this.adapterId, fromProjectName);
            await this.socket.rename(this.adapterId, fromProjectName, toProjectName);
            await this.refreshProjects();
            if (this.state.projectName === fromProjectName) {
                await this.loadProject(toProjectName);
            }
        } catch (e) {
            // eslint-disable-next-line no-alert
            window.alert(`Cannot rename: ${e}`);
            console.error(e);
        }
    };

    deleteProject = async projectName => {
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

    toggleView = (view, isShow, isActivate) => {
        const openedViews = JSON.parse(JSON.stringify(this.state.openedViews));
        if (isShow && !openedViews.includes(view)) {
            openedViews.push(view);
        }
        if (!isShow && openedViews.includes(view)) {
            openedViews.splice(openedViews.indexOf(view), 1);
        }
        window.localStorage.setItem('openedViews', JSON.stringify(openedViews));
        this.setState({ openedViews }, async () => {
            if (isActivate) {
                this.setViewsManager(false);
                await this.changeView(view);
            } else
            if (!openedViews.includes(this.state.selectedView)) {
                await this.changeView(openedViews[0]);
            }
        });
    };

    setSelectedWidgets = (selectedWidgets, cb) => {
        this.setState({
            selectedWidgets,
            alignType: null,
            alignIndex: 0,
            alignValues: [],
        }, () => cb && cb());
        window.localStorage.setItem(`${this.state.projectName}.${this.state.selectedView}.widgets`, JSON.stringify(selectedWidgets));
    };

    toggleCode = () => {
        const oldShowCode = this.state.showCode;
        this.setState({ showCode: !oldShowCode });
        window.localStorage.setItem('showCode', JSON.stringify(!oldShowCode));
    };

    onWidgetsChanged = (changedData, view, viewSettings) => {
        this.tempProject = this.tempProject || JSON.parse(JSON.stringify(this.state.project));
        changedData && changedData.forEach(item => {
            if (item.style) {
                const currentStyle = this.tempProject[item.view].widgets[item.wid].style;
                if (item.style.noPxToPercent) {
                    delete item.style.noPxToPercent;
                    Object.assign(currentStyle, item.style);
                } else {
                    const percentStyle = this.pxToPercent(currentStyle, item.style);
                    Object.assign(currentStyle, percentStyle);
                }
                Object.keys(currentStyle).forEach(key => {
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
                widget.data = widget.data || {};
                widget.data.members = order;
            }

            Object.keys(viewSettings).forEach(attr => {
                if (viewSettings[attr] === null) {
                    delete this.tempProject[view].settings[attr];
                } else {
                    this.tempProject[view].settings[attr] = viewSettings[attr];
                }
            });
        }

        this.changeTimer && clearTimeout(this.changeTimer);

        // collect changes from all widgets
        this.changeTimer = setTimeout(() => {
            this.changeTimer = null;
            this.changeProject(this.tempProject);
            this.tempProject = null;
        }, 200);
    };

    onFontsUpdate = fonts => {
        this.setState({ fonts });
    };

    cssClone = (attr, cb) => {
        if (this.visEngineHandlers[this.state.selectedView] && this.visEngineHandlers[this.state.selectedView].onStealStyle) {
            this.visEngineHandlers[this.state.selectedView].onStealStyle(attr, cb);
        } else {
            cb && cb(attr, null); // cancel selection
        }
    };

    onPxToPercent = (wids, attr, cb) => {
        if (this.visEngineHandlers[this.state.selectedView] && this.visEngineHandlers[this.state.selectedView].onPxToPercent) {
            return this.visEngineHandlers[this.state.selectedView].onPxToPercent(wids, attr, cb);
        }
        // cb && cb(wids, attr, null); // cancel selection
        return null;
    };

    pxToPercent = (oldStyle, newStyle) => {
        if (this.visEngineHandlers[this.state.selectedView] && this.visEngineHandlers[this.state.selectedView].pxToPercent) {
            return this.visEngineHandlers[this.state.selectedView].pxToPercent(oldStyle, newStyle);
        }
        // cb && cb(wids, attr, null); // cancel selection
        return null;
    };

    onPercentToPx = (wids, attr, cb) => {
        if (this.visEngineHandlers[this.state.selectedView] && this.visEngineHandlers[this.state.selectedView].onPercentToPx) {
            return this.visEngineHandlers[this.state.selectedView].onPercentToPx(wids, attr, cb);
        }
        return null;
        // cb && cb(wids, attr, null); // cancel selection
    };

    registerCallback = (name, view, cb) => {
        // console.log(`${!cb ? 'Unr' : 'R'}egister handler for ${view}: ${name}`);

        if (cb) {
            this.visEngineHandlers[view] = this.visEngineHandlers[view] || {};
            this.visEngineHandlers[view][name] = cb;
        } else if (this.visEngineHandlers[view]) {
            delete this.visEngineHandlers[view][name];
            if (!Object.keys(this.visEngineHandlers[view]).length) {
                delete this.visEngineHandlers[view];
            }
        }
    };

    saveCssFile = (directory, fileName, data) => {
        if (fileName.endsWith('vis-common-user.css')) {
            this.setState({ visCommonCss: data });
        } else if (fileName.endsWith('vis-user.css')) {
            this.setState({ visUserCss: data });
        }

        this.socket.writeFile64(directory, fileName, data);
    };

    showAlert(message, type) {
        if (type !== 'error' && type !== 'warning' && type !== 'info' && type !== 'success') {
            type = 'info';
        }

        this.setState({
            alert: true,
            alertType: type,
            alertMessage: message,
        });
    }

    renderAlertDialog() {
        return <Snackbar
            className={this.props.classes[`alert_${this.state.alertType}`]}
            open={this.state.alert}
            autoHideDuration={6000}
            onClose={reason => {
                if (reason === 'clickaway') {
                    return;
                }
                this.setState({ alert: false });
            }}
            message={this.state.alertMessage}
        />;
    }

    renderTabs() {
        return <div className={this.props.classes.tabsContainer}>
            {this.state.hidePalette ? <Tooltip title={I18n.t('Show palette')}>
                <div className={this.props.classes.tabButton}>
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
            </Tooltip> : null}
            {!this.state.showCode ? <Tooltip title={I18n.t('Toggle runtime')}>
                <div className={this.props.classes.tabButton}>
                    <IconButton
                        onClick={() => this.setState({ editMode: !this.state.editMode })}
                        size="small"
                        disabled={!!this.state.selectedGroup}
                        style={this.state.selectedGroup ? { opacity: 0.5 } : null}
                    >
                        {this.state.editMode ? <PlayIcon style={{ color: 'green' }} /> : <StopIcon style={{ color: 'red' }} /> }
                    </IconButton>
                </div>
            </Tooltip> : null}
            <Tooltip title={I18n.t('Show view')}>
                <div className={this.props.classes.tabButton}>
                    <IconButton onClick={() => this.setViewsManager(true)} size="small" disabled={!!this.state.selectedGroup}>
                        <AddIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <Tabs
                value={this.state.selectedView}
                style={{ width: `calc(100% - ${68 + (!this.state.showCode ? 40 : 0) + (this.state.hidePalette ? 40 : 0) + (this.state.hideAttributes ? 40 : 0)}px)` }}
                className={this.props.classes.viewTabs}
                variant="scrollable"
                scrollButtons="auto"
            >
                {
                    Object.keys(this.state.project)
                        .filter(view => !view.startsWith('__'))
                        .filter(view => this.state.openedViews.includes(view))
                        .map(view => {
                            const isGroupEdited = !!this.state.selectedGroup && view === this.state.selectedView;

                            return <Tab
                                component="span"
                                disabled={!!this.state.selectedGroup && view !== this.state.selectedView}
                                label={<span className={Utils.clsx(isGroupEdited && this.props.classes.groupEditTab, this.props.classes.tabsName)}>
                                    {isGroupEdited ? `${I18n.t('Group %s', this.state.selectedGroup)}` : view}
                                    <Tooltip title={isGroupEdited ? I18n.t('Close group editor') : I18n.t('Hide')}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                disabled={!!this.state.selectedGroup && view !== this.state.selectedView}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (isGroupEdited) {
                                                        this.setState({ selectedGroup: null });
                                                    } else {
                                                        this.toggleView(view, false);
                                                    }
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </span>}
                                className={this.props.classes.viewTab}
                                value={view}
                                onClick={() => this.changeView(view)}
                                key={view}
                                // wrapped
                            />;
                        })
                }
            </Tabs>
            <IconButton
                onClick={() => this.toggleCode()}
                size="small"
                style={{
                    cursor: 'default', opacity: this.state.showCode ? 1 : 0, width: 34, height: 34,
                }}
                className={this.props.classes.tabButton}
            >
                {this.state.showCode ? <CodeOffIcon /> : <CodeIcon />}
            </IconButton>
            {this.state.hideAttributes ? <Tooltip title={I18n.t('Show palette')}>
                <div className={this.props.classes.tabButton}>
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
            </Tooltip> : null}
        </div>;
    }

    renderPalette() {
        return <div
            style={this.state.hidePalette ? { display: 'none' } : null}
            className={Utils.clsx(
                this.props.classes.block,
                this.state.toolbarHeight === 'narrow' && this.props.classes.blockNarrow,
                this.state.toolbarHeight === 'veryNarrow' && this.props.classes.blockVeryNarrow,
            )}
        >
            {this.state.widgetsLoaded !== WIDGETS_LOADING_STEP_ALL_LOADED ? <LinearProgress variant="indeterminate" value={(this.state.loadingProgress.step / this.state.loadingProgress.total) * 100} /> : null}
            <Palette
                classes={{}}
                widgetsLoaded={this.state.widgetsLoaded === WIDGETS_LOADING_STEP_ALL_LOADED}
                onHide={() => {
                    window.localStorage.setItem('Vis.hidePalette', 'true');
                    this.setState({ hidePalette: true });
                }}
            />
        </div>;
    }

    renderWorkspace(visEngine) {
        return <div key="engine">
            {this.renderTabs()}
            <div
                className={Utils.clsx(
                    this.props.classes.canvas,
                    this.state.toolbarHeight === 'narrow' && this.props.classes.canvasNarrow,
                    this.state.toolbarHeight === 'veryNarrow' && this.props.classes.canvasVeryNarrow,
                )}
            >
                {this.state.showCode
                    ? <pre>
                        {JSON.stringify(this.state.project, null, 2)}
                    </pre> : null}
                <ViewDrop addWidget={this.addWidget} editMode={this.state.editMode}>
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
                            project={this.state.project}
                            selectedView={this.state.selectedView}
                            changeProject={this.changeProject}
                            getNewWidgetIdNumber={this.getNewWidgetIdNumber}
                            lockWidgets={this.lockWidgets}
                            groupWidgets={this.groupWidgets}
                            ungroupWidgets={this.ungroupWidgets}
                            setSelectedGroup={this.setSelectedGroup}
                        >
                            { visEngine }
                        </VisContextMenu>
                    </div>
                </ViewDrop>
            </div>
        </div>;
    }

    renderAttributes() {
        return <div
            className={Utils.clsx(
                this.props.classes.block,
                this.state.toolbarHeight === 'narrow' && this.props.classes.blockNarrow,
                this.state.toolbarHeight === 'veryNarrow' && this.props.classes.blockVeryNarrow,
            )}
        >
            <Attributes
                classes={{}}
                selectedView={this.state.selectedView}
                groups={this.state.groups}
                project={this.state.project}
                changeProject={this.changeProject}
                openedViews={this.state.openedViews}
                projectName={this.state.projectName}
                themeType={this.state.themeType}
                selectedWidgets={this.state.editMode ? this.state.selectedWidgets : []}
                widgetsLoaded={this.state.widgetsLoaded === WIDGETS_LOADING_STEP_ALL_LOADED}
                socket={this.socket}
                themeName={this.state.themeName}
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
            />
        </div>;
    }

    async onWidgetsLoaded() {
        let widgetsLoaded = WIDGETS_LOADING_STEP_HTML_LOADED;
        if (this.socket.isConnected()) {
            await VisWidgetsCatalog.collectRxInformation(this.socket);
            widgetsLoaded = WIDGETS_LOADING_STEP_ALL_LOADED;
        }
        this.setState({ widgetsLoaded });
    }

    renderConfirmDialog() {
        if (this.state.confirmDialog) {
            return <ConfirmDialog
                text={this.state.confirmDialog.message}
                title={this.state.confirmDialog.title}
                fullWidth={false}
                ok={I18n.t('Ok')}
                onClose={isYes => {
                    const callback = this.state.confirmDialog.callback;
                    this.setState({ confirmDialog: null }, () =>
                        typeof callback === 'function' && callback(isYes));
                }}
            />;
        }

        return null;
    }

    renderShowCodeDialog() {
        if (this.state.showCodeDialog !== null) {
            return <CodeDialog
                themeType={this.state.themeType}
                onClose={() => this.setState({ showCodeDialog: null })}
                title={this.state.showCodeDialog.title}
                code={this.state.showCodeDialog.code}
                mode={this.state.showCodeDialog.mode}
            />;
        }

        return null;
    }

    renderShowProjectUpdateDialog() {
        if (!this.state.showProjectUpdateDialog) {
            return null;
        }
        return <ConfirmDialog
            text={I18n.t('Project was updated by another browser instance. Do you want to reload it?')}
            title={I18n.t('Project was updated')}
            fullWidth={false}
            onClose={result =>
                this.setState({ showProjectUpdateDialog: false }, () => {
                    if (result) {
                        this.loadProject(this.state.projectName);
                    }
                })}
        />;
    }

    renderCreateFirstProjectDialog() {
        return this.state.createFirstProjectDialog ? <CreateFirstProjectDialog
            open={!0}
            onClose={() => this.setState({ createFirstProjectDialog: false })}
            addProject={this.addProject}
        /> : null;
    }

    renderDeleteDialog() {
        return this.state.deleteWidgetsDialog ?
            <ConfirmDialog
                fullWidth={false}
                title={I18n.t('Delete widgets')}
                text={I18n.t('Are you sure to delete widgets %s?', this.state.selectedWidgets.join(', '))}
                ok={I18n.t('Delete')}
                dialogName="deleteDialog"
                suppressQuestionMinutes={5}
                onClose={isYes => {
                    if (isYes) {
                        this.deleteWidgetsAction();
                    }
                    this.setState({ deleteWidgetsDialog: false });
                }}
            />
            : null;
    }

    renderMessageDialog() {
        return this.state.messageDialog ? <MessageDialog
            text={this.state.messageDialog.text}
            title={this.state.messageDialog.title}
            onClose={() => {
                if (!this.state.messageDialog.noClose) {
                    this.setState({ messageDialog: null });
                }
            }}
        /> : null;
    }

    render() {
        if (!this.state.loaded || !this.state.project || !this.state.groups) {
            return <StylesProvider generateClassName={generateClassName}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={this.state.theme}>
                        <Loader theme={this.state.themeType} />
                    </ThemeProvider>
                </StyledEngineProvider>
            </StylesProvider>;
        }

        for (const i in this.state.selectedWidgets) {
            if (!this.state.project[this.state.selectedView]?.widgets[this.state.selectedWidgets[i]]) {
                this.setSelectedWidgets([]);
                return null;
            }
        }

        const visEngine = <VisEngine
            key={this.state.projectName}
            widgetsLoaded={this.state.widgetsLoaded}
            activeView={this.state.selectedView || ''}
            editMode={!this.state.runtime && this.state.editMode}
            runtime={this.state.runtime}
            socket={this.socket}
            visCommonCss={this.state.visCommonCss}
            visUserCss={this.state.visUserCss}
            lang={this.socket.systemLang}
            views={this.state.visProject}
            adapterName={this.adapterName}
            instance={this.instance}
            selectedWidgets={this.state.selectedWidgets}
            setSelectedWidgets={this.setSelectedWidgets}
            onLoaded={() => this.onWidgetsLoaded()}
            selectedGroup={this.state.selectedGroup}
            setSelectedGroup={this.setSelectedGroup}
            onWidgetsChanged={this.onWidgetsChanged}
            projectName={this.state.projectName}
            lockDragging={this.state.lockDragging}
            disableInteraction={this.state.disableInteraction}
            widgetHint={this.state.widgetHint}
            onFontsUpdate={this.state.runtime ? null : this.onFontsUpdate}
            registerEditorCallback={this.state.runtime ? null : this.registerCallback}
            themeType={this.state.themeType}
            themeName={this.state.themeName}
            theme={this.state.theme}
            adapterId={this.adapterId}
            editModeComponentClass={this.props.classes.editModeComponentClass}
            onIgnoreMouseEvents={this.onIgnoreMouseEvents}
            onConfirmDialog={(message, title, icon, width, callback) => {
                console.log(message);
                this.setState({
                    confirmDialog: {
                        message,
                        title,
                        icon,
                        width,
                        callback,
                    },
                });
            }}
            onShowCode={(code, title, mode) => this.setState({ showCodeDialog: { code, title, mode } })}
        />;

        if (this.state.runtime) {
            return visEngine;
        }

        const simulatePreload = true;

        return <StylesProvider generateClassName={generateClassName}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    {!simulatePreload ? <VisRxWidget /> : null}
                    <Popper
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
                            {/* {this.state.clipboardImages.map((clipboardImage, key) => <img
                                style={{ padding: 4 }}
                                key={key}
                                src={clipboardImage}
                                alt=""
                            />)} */}
                            {Object.keys(this.state.widgetsClipboard.widgets).join(', ')}
                        </Paper>
                    </Popper>
                    <div className={this.props.classes.app}>
                        <Toolbar
                            classes={{}}
                            selectedView={this.state.selectedView}
                            project={this.state.project}
                            changeView={this.changeView}
                            changeProject={this.changeProject}
                            openedViews={this.state.openedViews}
                            toggleView={this.toggleView}
                            socket={this.socket}
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
                            toggleTheme={() => this.toggleTheme()}
                            refreshProjects={this.refreshProjects}
                            viewsManager={this.state.viewsManager}
                            setViewsManager={this.setViewsManager}
                            projectsDialog={this.state.projects && this.state.projects.length ? this.state.projectsDialog : !this.state.createFirstProjectDialog}
                            setProjectsDialog={this.setProjectsDialog}
                            selectedWidgets={this.state.editMode ? this.state.selectedWidgets : []}
                            setSelectedWidgets={this.setSelectedWidgets}
                            history={this.state.history}
                            historyCursor={this.state.historyCursor}
                            undo={this.undo}
                            redo={this.redo}
                            deleteWidgets={this.deleteWidgets}
                            widgetsLoaded={this.state.widgetsLoaded === WIDGETS_LOADING_STEP_ALL_LOADED}
                            widgetsClipboard={this.state.widgetsClipboard}
                            cutWidgets={this.cutWidgets}
                            copyWidgets={this.copyWidgets}
                            pasteWidgets={this.pasteWidgets}
                            alignWidgets={this.alignWidgets}
                            cloneWidgets={this.cloneWidgets}
                            orderWidgets={this.orderWidgets}
                            getNewWidgetIdNumber={this.getNewWidgetIdNumber}
                            lockDragging={this.state.lockDragging}
                            disableInteraction={this.state.disableInteraction}
                            toggleLockDragging={this.toggleLockDragging}
                            toggleDisableInteraction={this.toggleDisableInteraction}
                            adapterName={this.adapterName}
                            selectedGroup={this.state.selectedGroup}
                            setSelectedGroup={this.setSelectedGroup}
                            widgetHint={this.state.widgetHint}
                            toggleWidgetHint={this.toggleWidgetHint}
                            instance={this.instance}
                            editMode={this.state.editMode}
                            toolbarHeight={this.state.toolbarHeight}
                            setToolbarHeight={value => {
                                window.localStorage.setItem('Vis.toolbarForm', value);
                                this.setState({ toolbarHeight: value });
                            }}
                        />
                        <div style={{ position: 'relative' }}>
                            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                                <DndPreview />
                                {this.state.hidePalette && this.state.hideAttributes ? this.renderWorkspace(visEngine) : null}
                                <ReactSplit
                                    direction={SplitDirection.Horizontal}
                                    initialSizes={this.state.hidePalette && !this.state.hideAttributes ? [this.state.splitSizes[0] + this.state.splitSizes[1], this.state.splitSizes[2]] : (
                                        !this.state.hidePalette && this.state.hideAttributes ? [this.state.splitSizes[0], this.state.splitSizes[1] + this.state.splitSizes[2]] : this.state.splitSizes)}
                                    minWidths={this.state.hidePalette && !this.state.hideAttributes ? [0, 240] : (
                                        !this.state.hidePalette && this.state.hideAttributes ? [240, 0] : [240, 0, 240])}
                                    onResizeFinished={(gutterIdx, newSizes) => {
                                        let splitSizes = [];
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
                                        this.setState({ splitSizes });
                                        window.localStorage.setItem('Vis.splitSizes', JSON.stringify(splitSizes));
                                    }}
                                    theme={this.state.themeName === 'dark' ? GutterTheme.Dark : GutterTheme.Light}
                                    gutterClassName={this.state.themeName === 'dark' ? 'Dark visGutter' : 'Light visGutter'}
                                >
                                    {!this.state.hidePalette ? this.renderPalette() : null}
                                    {this.renderWorkspace(visEngine)}
                                    {!this.state.hideAttributes ? this.renderAttributes() : null}
                                </ReactSplit>
                            </DndProvider>
                        </div>
                    </div>
                    {this.renderCreateFirstProjectDialog()}
                    {this.renderDeleteDialog()}
                    {this.renderAlertDialog()}
                    {this.renderConfirmDialog()}
                    {this.renderShowCodeDialog()}
                    {this.renderShowProjectUpdateDialog()}
                    {this.renderMessageDialog()}
                </ThemeProvider>
            </StyledEngineProvider>
        </StylesProvider>;
    }
}

export default withStyles(styles)(App);
