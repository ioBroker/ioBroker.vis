import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider, createGenerateClassName } from '@mui/styles';

import {
    DialogContent,
    DialogTitle,
    LinearProgress,
    Snackbar,
    ListItemButton,
    Dialog,
    ListItemText,
    MenuList,
    Paper,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';

import IconAdd from '@mui/icons-material/Add';
import IconClose from '@mui/icons-material/Close';

import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import {
    i18n as I18n, Loader,
} from '@iobroker/adapter-react-v5';

import VisEngine from './Vis/visEngine';
import { registerWidgetsLoadIndicator } from './Vis/visUtils';
import VisWidgetsCatalog from './Vis/visWidgetsCatalog';

const generateClassName = createGenerateClassName({
    productionPrefix: 'vis-r',
});

class Runtime extends GenericApp {
    static WIDGETS_LOADING_STEP_NOT_STARTED = 0;

    static WIDGETS_LOADING_STEP_HTML_LOADED = 1;

    static WIDGETS_LOADING_STEP_ALL_LOADED = 2;

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
        if (window.socketUrl && window.socketUrl.startsWith(':')) {
            window.socketUrl = `${window.location.protocol}//${window.location.hostname}${window.socketUrl}`;
        }

        super(props, extendedProps);

        // do not control this state
        this.socket.setStateToIgnore('nothing_selected');

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

    setStateAsync(newState) {
        return new Promise(resolve => {
            this.setState(newState, () =>
                resolve());
        });
    }

    componentDidMount() {
        super.componentDidMount();

        const newState = {
            alert: false,
            alertType: 'info',
            alertMessage: '',
            runtime: true,
            projectName: 'main',
            selectedWidgets: [],
            editMode: false,
            widgetsLoaded: Runtime.WIDGETS_LOADING_STEP_NOT_STARTED,
            fonts: [],
            visCommonCss: null,
            visUserCss: null,
            showProjectsDialog: false,
            showNewProjectDialog: false,
            newProjectName: '',
            projects: null,
            projectDoesNotExist: false,
        };

        if (this.initState) {
            // get edit states
            this.initState(newState);
        }

        this.setState(newState);

        window.addEventListener('hashchange', this.onHashChange, false);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        super.componentWillUnmount();
        window.removeEventListener('hashchange', this.onHashChange, false);
        window.alert = this.alert;
    }

    onHashChange = () => {
        const currentPath = VisEngine.getCurrentPath();
        this.changeView(currentPath.view)
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

        if (!file || file === '{}') {
            // read if show projects dialog allowed
            const obj = await this.socket.getObject(`system.adapter.${this.adapterName}.${this.instance}`);
            if (this.state.runtime && obj.native.doNotShowProjectDialog) {
                this.setState({ projectDoesNotExist: true });
            } else {
                !this.state.projects && (await this.refreshProjects());
                // show project dialog
                this.setState({ showProjectsDialog: true });
            }
            return;
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

        // take selected view from hash
        const currentPath = VisEngine.getCurrentPath();
        let selectedView = currentPath.view;
        if (!selectedView || !project[selectedView]) {
            // take from local storage
            if (Object.keys(project).includes(window.localStorage.getItem('selectedView'))) {
                selectedView = window.localStorage.getItem('selectedView');
            }
            // take first view
            if (!selectedView || !project[selectedView]) {
                selectedView = Object.keys(project).find(view => !view.startsWith('__')) || '';
            }
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
        if (this.state.widgetsLoaded === Runtime.WIDGETS_LOADING_STEP_HTML_LOADED) {
            await VisWidgetsCatalog.collectRxInformation(this.socket);
            await this.setStateAsync({ widgetsLoaded: Runtime.WIDGETS_LOADING_STEP_ALL_LOADED });
        }

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

        // read project name from URL
        let projectName = window.location.search.replace('?', '');
        if (projectName) {
            projectName = decodeURIComponent(projectName.split('&')[0]).split('/')[0];
            if (projectName.includes('=')) {
                projectName = '';
            }
        }
        projectName = projectName || window.localStorage.getItem('projectName') || 'main';

        if (!this.state.runtime) {
            await this.refreshProjects();
        }

        if (!this.state.projects || this.state.projects.includes(projectName)) {
            await this.loadProject(projectName);
        } else {
            // read if show projects dialog allowed
            const obj = this.state.runtime && (await this.socket.getObject(`system.adapter.${this.adapterName}.${this.instance}`));
            if (this.state.runtime && obj.native.doNotShowProjectDialog) {
                this.setState({ projectDoesNotExist: true });
            } else {
                !this.state.projects && (await this.refreshProjects());
                // show project dialog
                this.setState({ showProjectsDialog: true });
            }
        }
    }

    changeView = async selectedView => {
        if (selectedView === this.state.selectedView) {
            return;
        }

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

        const currentPath = VisEngine.getCurrentPath();
        const newPath = VisEngine.buildPath(selectedView, currentPath.path);

        if (window.location.hash !== newPath) {
            window.location.hash = newPath;
        }

        await this.setStateAsync(newState);
    };

    onFontsUpdate = fonts => this.setState({ fonts });

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
            style={this.state.alertType === 'error' ?
                { backgroundColor: '#f44336' } :
                (this.state.alertType === 'success' ?
                    { backgroundColor: '#4caf50' } : undefined)}
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

    async onWidgetsLoaded() {
        let widgetsLoaded = Runtime.WIDGETS_LOADING_STEP_HTML_LOADED;
        if (this.socket.isConnected()) {
            await VisWidgetsCatalog.collectRxInformation(this.socket);
            widgetsLoaded = Runtime.WIDGETS_LOADING_STEP_ALL_LOADED;
        }
        this.setState({ widgetsLoaded });
    }

    addProject = async (projectName, doNotLoad) => {
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
            if (!doNotLoad) {
                await this.refreshProjects();
                await this.loadProject(projectName);
                // close dialog
                this.setState({ projectsDialog: false });
            }
        } catch (e) {
            window.alert(`Cannot create project: ${e.toString()}`);
        }
    };

    showCreateNewProjectDialog() {
        if (!this.state.showNewProjectDialog) {
            return null;
        }
        return <Dialog
            open={!0}
            onClose={() => this.setState({ showNewProjectDialog: false })}
        >
            <DialogTitle>{I18n.t('Create new project')}</DialogTitle>
            <DialogContent>
                <TextField
                    variant="standard"
                    label={I18n.t('Project name')}
                    autoFocus
                    fullWidth
                    onKeyDown={e =>
                        e.keyCode === 13 &&
                        this.state.newProjectName &&
                        !this.state.projects.includes(this.state.newProjectName) &&
                        this.addProject(this.state.newProjectName)
                    }
                    value={this.state.newProjectName}
                    onChange={e => this.setState({ newProjectName: e.target.value })}
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    default
                    color="primary"
                    disabled={!this.state.newProjectName || this.state.projects.includes(this.state.newProjectName)}
                    onClick={async () => {
                        await this.addProject(this.state.newProjectName, true);
                        window.location.href = `?${this.state.newProjectName}`;
                    }}
                    startIcon={<IconAdd />}
                >
                    {I18n.t('Create')}
                </Button>
                <Button
                    variant="contained"
                    default
                    color="primary"
                    onClick={() => this.setState({ showNewProjectDialog: false })}
                    startIcon={<IconClose />}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    showSmallProjectsDialog() {
        return <Dialog
            open={!0}
            onClose={() => {}} // do nothing
        >
            <DialogTitle>{I18n.t('Select project')}</DialogTitle>
            <DialogContent>
                {!this.state.projects ? <LinearProgress /> : <Paper sx={{ width: 320, maxWidth: '100%' }}>
                    <MenuList>
                        {this.state.projects.map(project =>
                            <ListItemButton key={project} onClick={() => window.location.href = `?${project}`}>
                                <ListItemText>{project}</ListItemText>
                            </ListItemButton>)}
                        <ListItemButton
                            onClick={() => this.setState({ showNewProjectDialog: true })}
                            style={{ backgroundColor: '#112233', color: '#ffffff' }}
                        >
                            <ListItemText>{I18n.t('Create new project')}</ListItemText>
                        </ListItemButton>
                    </MenuList>
                </Paper>}
            </DialogContent>
            {this.showCreateNewProjectDialog()}
        </Dialog>;
    }

    renderProjectDoesNotExist() {
        return <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                color: '#982828',
            }}
        >
            {I18n.t('Project "%s" does not exist', this.state.projectName)}
        </div>;
    }

    getVisEngine() {
        if (this.state.projectDoesNotExist) {
            return this.renderProjectDoesNotExist();
        }

        if (this.state.showProjectsDialog) {
            return this.showSmallProjectsDialog();
        }

        return <VisEngine
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
            editModeComponentClass={this.props.classes?.editModeComponentClass}
            onIgnoreMouseEvents={this.onIgnoreMouseEvents}
            onConfirmDialog={(message, title, icon, width, callback) => this.showConfirmDialog && this.showConfirmDialog({
                message,
                title,
                icon,
                width,
                callback,
            })}
            onShowCode={(code, title, mode) => this.showCodeDialog && this.showCodeDialog({ code, title, mode })}
        />;
    }

    render() {
        return <StylesProvider generateClassName={generateClassName}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    {
                        !this.state.loaded || !this.state.project || !this.state.groups ?
                            <Loader theme={this.state.themeType} /> :
                            this.getVisEngine()
                    }
                </ThemeProvider>
            </StyledEngineProvider>
        </StylesProvider>;
    }
}

export default Runtime;
