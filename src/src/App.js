import React from 'react';
import './App.scss';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import withStyles from '@mui/styles/withStyles';

import GenericApp from '@iobroker/adapter-react-v5/GenericApp';
import Loader from '@iobroker/adapter-react-v5/Components/Loader';
import {
    IconButton,
    Tab, Tabs, Tooltip,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import CodeOffIcon from '@mui/icons-material/CodeOff';

import ReactSplit, { SplitDirection, GutterTheme } from '@devbookhq/splitter';

import I18n from '@iobroker/adapter-react-v5/i18n';
import Attributes from './Attributes';
import Widgets from './Widgets';
import Toolbar from './Toolbar';
import CreateFirstProjectDialog from './CreateFirstProjectDialog';
import VisEngine from './Vis/index';

const styles = theme => ({
    block: {
        overflow: 'auto',
        height: 'calc(100vh - 100px)',
        padding: '0px 8px',
    },
    canvas: {
        overflow: 'auto',
        height: 'calc(100vh - 138px)',
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
        display: 'flex',
        alignItems: 'center',
    },
    viewTabs: theme.classes.viewTabs,
    viewTab: theme.classes.viewTab,
});

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
            'zh-cn': require('./i18n/zh-cn'),
        };

        extendedProps.sentryDSN = window.sentryDSN;

        super(props, extendedProps);

        // icon cache
        this.icons = {};

        this.state = {
            projectName: 'main',
            viewsManage: false,
            projectsDialog: false,
            createFirstProjectDialog: false,
            showCode: false,
            ...this.state,
        };
    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener('hashchange', this.onHashChange, false);
    }

    componentWillUnmount() {
        // eslint-disable-next-line no-unused-expressions
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = null;
        super.componentWillUnmount();
        window.removeEventListener('hashchange', this.onHashChange, false);
    }

    onHashChange = () => {
        this.changeView(decodeURIComponent(window.location.hash.slice(1)));
    }

    loadProject = async projectName => {
        let file;
        try {
            file = await this.socket.readFile('vis.0', `${projectName}/vis-views.json`);
            if (typeof file === 'object') {
                file = file.data;
            }
        } catch (err) {
            console.warn(`Cannot read project file vis-views.json: ${err}`);
            file = '{}';
        }
        const project = JSON.parse(file);
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
        if (openedViews && !openedViews.includes(selectedView)) {
            // eslint-disable-next-line prefer-destructuring
            selectedView = openedViews[0];
        }
        this.setState({
            project,
            openedViews,
            projectName,
        });
        this.changeView(selectedView);

        const groups = await this.socket.getGroups();
        this.setState({ groups });
        window.localStorage.setItem('projectName', projectName);
    }

    async onConnectionReady() {
        this.setState({
            selectedView: '',
            splitSizes: window.localStorage.getItem('splitSizes')
                ? JSON.parse(window.localStorage.getItem('splitSizes'))
                : [20, 60, 20],
        });

        if (window.localStorage.getItem('projectName')) {
            this.loadProject(window.localStorage.getItem('projectName'));
        } else {
            this.socket.readDir('vis.0', '').then(projects => this.loadProject(projects[0].file));
        }

        await this.refreshProjects();

        const user = await this.socket.getCurrentUser();
        const currentUser = await this.socket.getObject(`system.user.${user || 'admin'}`);
        this.setState({ currentUser });
    }

    refreshProjects = () => this.socket.readDir('vis.0', '')
        .then(projects => this.setState({
            projects: projects.filter(dir => dir.isDir).map(dir => dir.file),
            createFirstProjectDialog: !projects.length,
        }));

    setViewsManage = newValue => this.setState({ viewsManage: newValue })

    setProjectsDialog = newValue => this.setState({ projectsDialog: newValue })

    changeView = view => {
        this.setState({ selectedView: view });
        window.localStorage.setItem('selectedView', view);
        window.location.hash = view;
    }

    changeProject = project => {
        this.setState({ project, needSave: true });

        // save changes after 1 second
        // eslint-disable-next-line no-unused-expressions
        this.savingTimer && clearTimeout(this.savingTimer);
        this.savingTimer = setTimeout(() => {
            this.savingTimer = null;
            this.socket.writeFile64('vis.0', `${this.state.projectName}/vis-views.json`, JSON.stringify(this.state.project, null, 2));
            this.setState({ needSave: false });
        }, 1000);
    }

    addProject = async projectName => {
        try {
            const project = {
                ___settings: {
                    folders: [],
                },
                DemoView: {
                    name: 'DemoView',
                    settings: {
                        style: {},
                    },
                    widgets: {},
                    activeWidgets: {},
                },
            };
            await this.socket.writeFile64('vis.0', `${projectName}/vis-views.json`, JSON.stringify(project));
            await this.socket.writeFile64('vis.0', `${projectName}/vis-user.css`, '');
            await this.refreshProjects();
            await this.loadProject(projectName);
        } catch (e) {
            console.error(e);
        }
    }

    renameProject = async (fromProjectName, toProjectName) => {
        try {
            // const files = await this.socket.readDir('vis.0', fromProjectName);
            await this.socket.rename('vis.0', fromProjectName, toProjectName);
            await this.refreshProjects();
            if (this.state.projectName === fromProjectName) {
                await this.loadProject(toProjectName);
            }
        } catch (e) {
            // eslint-disable-next-line no-alert
            window.alert(`Cannot rename: ${e}`);
            console.error(e);
        }
    }

    deleteProject = async projectName => {
        try {
            await this.socket.deleteFolder('vis.0', projectName);
            await this.refreshProjects();
            if (this.state.projectName === projectName) {
                await this.loadProject(this.state.projects[0]);
            }
        } catch (e) {
            console.error(e);
        }
    }

    toggleView = (view, isShow) => {
        const openedViews = JSON.parse(JSON.stringify(this.state.openedViews));
        if (isShow && !openedViews.includes(view)) {
            openedViews.push(view);
        }
        if (!isShow && openedViews.includes(view)) {
            openedViews.splice(openedViews.indexOf(view), 1);
        }
        this.setState({ openedViews });
        window.localStorage.setItem('openedViews', JSON.stringify(openedViews));
        if (!openedViews.includes(this.state.selectedView)) {
            this.changeView(openedViews[0]);
        }
    }

    render() {
        if (!this.state.loaded || !this.state.project || !this.state.groups) {
            return <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                    <Loader theme={this.state.themeType} />
                </ThemeProvider>
            </StyledEngineProvider>;
        }

        return <StyledEngineProvider injectFirst>
            <ThemeProvider theme={this.state.theme}>
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
                        toggleTheme={() => this.toggleTheme()}
                        refreshProjects={this.refreshProjects}
                        viewsManage={this.state.viewsManage}
                        setViewsManage={this.setViewsManage}
                        projectsDialog={this.state.projects && this.state.projects.length ? this.state.projectsDialog : !this.state.createFirstProjectDialog}
                        setProjectsDialog={this.setProjectsDialog}
                        adapterName={this.adapterName}
                        instance={this.instance}
                    />
                    <div>
                        <ReactSplit
                            direction={SplitDirection.Horizontal}
                            initialSizes={this.state.splitSizes}
                            minWidths={[240, 0, 240]}
                            onResizeFinished={(gutterIdx, newSizes) => {
                                this.setState({ splitSizes: newSizes });
                                window.localStorage.setItem('splitSizes', JSON.stringify(newSizes));
                            }}
                            theme={this.state.themeName === 'dark' ? GutterTheme.Dark : GutterTheme.Light}
                            gutterClassName={this.state.themeName === 'dark' ? 'Dark visGutter' : 'Light visGutter'}
                        >
                            <div className={this.props.classes.block}>
                                <Widgets
                                    classes={{}}
                                />
                            </div>
                            <div>
                                <div className={this.props.classes.tabsContainer}>
                                    <Tooltip title={I18n.t('Toggle code')}>
                                        <IconButton onClick={() => this.setState({ showCode: !this.state.showCode })} size="small">
                                            {this.state.showCode ? <CodeOffIcon /> : <CodeIcon />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={I18n.t('Show view')}>
                                        <IconButton onClick={() => this.setViewsManage(true)} size="small">
                                            <AddIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tabs
                                        value={this.state.selectedView}
                                        className={this.props.classes.viewTabs}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                    >
                                        {
                                            Object.keys(this.state.project)
                                                .filter(view => !view.startsWith('__'))
                                                .filter(view => this.state.openedViews.includes(view))
                                                .map(view => <Tab
                                                    component="span"
                                                    label={<span>
                                                        {view}
                                                        <Tooltip title={I18n.t('Hide')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    this.toggleView(view, false);
                                                                }}
                                                            >
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </span>}
                                                    className={this.props.classes.viewTab}
                                                    value={view}
                                                    onClick={() => this.changeView(view)}
                                                    key={view}
                                                />)
                                        }
                                    </Tabs>
                                </div>
                                <div className={this.props.classes.canvas}>
                                    {this.state.showCode
                                        ? <pre>
                                            {JSON.stringify(this.state.project, null, 2)}
                                        </pre>
                                        : <div style={{ position: 'relative' }}>
                                            <VisEngine
                                                socket={this.socket}
                                                lang={this.socket.systemLang}
                                                views={this.state.project}
                                            />
                                        </div>}
                                </div>
                            </div>
                            <div className={this.props.classes.block}>
                                <Attributes
                                    classes={{}}
                                    selectedView={this.state.selectedView}
                                    groups={this.state.groups}
                                    project={this.state.project}
                                    changeProject={this.changeProject}
                                    openedViews={this.state.openedViews}
                                    projectName={this.state.projectName}
                                    socket={this.socket}
                                    themeName={this.state.themeName}
                                />
                            </div>
                        </ReactSplit>
                    </div>
                </div>
                <CreateFirstProjectDialog
                    open={this.state.createFirstProjectDialog}
                    onClose={() => this.setState({ createFirstProjectDialog: false })}
                    addProject={this.addProject}
                />
            </ThemeProvider>
        </StyledEngineProvider>;
    }
}

export default withStyles(styles)(App);
