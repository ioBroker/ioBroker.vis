import React from 'react';
import './App.scss';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import Loader from '@iobroker/adapter-react/Components/Loader';
import {
    IconButton,
    Tab, Tabs,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

import ReactSplit, { SplitDirection, GutterTheme } from '@devbookhq/splitter';

import Attributes from './Attributes';
import Widgets from './Widgets';
import MainMenu from './Menu';

const styles = () => ({
    viewTabs: {
        minHeight: 0,
    },
    viewTab: {
        minWidth: 0,
        minHeight: 0,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 0px',
    },
    block: {
        overflow: 'auto',
        height: 'calc(100vh - 106px)',
        padding: '0px 8px',
    },
    canvas: {
        overflow: 'auto',
        height: 'calc(100vh - 154px)',
    },
    menu: {
        display: 'flex',
        alignItems: 'center',
    },
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
    }

    onConnectionReady() {
        this.setState({
            selectedView: '',
            splitSizes: window.localStorage.getItem('splitSizes')
                ? JSON.parse(window.localStorage.getItem('splitSizes'))
                : [20, 60, 20],
        }, () => this.socket.readFile('vis.0', 'main/vis-views.json')
            .catch(err => {
                console.warn(`Cannot read project file vis-views.json: ${err}`);
                return '{}';
            })
            .then(file => {
                const project = JSON.parse(file);
                project.___settings = project.___settings || {};
                project.___settings.folders = project.___settings.folders || [];
                let selectedView;
                if (Object.keys(project).includes(window.localStorage.getItem('selectedView'))) {
                    selectedView = window.localStorage.getItem('selectedView');
                } else {
                    selectedView = Object.keys(project).find(view => !view.startsWith('__')) || '';
                }
                this.setState({
                    project,
                    selectedView,
                    openedViews: [selectedView],
                });

                return this.socket.getGroups();
            })
            .then(groups => this.setState({ groups })));
    }

    changeView = view => {
        this.setState({ selectedView: view });
        window.localStorage.setItem('selectedView', view);
    }

    changeProject = project => {
        this.setState({ project });
    }

    render() {
        if (!this.state.loaded || !this.state.project || !this.state.groups) {
            return <MuiThemeProvider theme={this.state.theme}>
                <Loader theme={this.state.themeType} />
            </MuiThemeProvider>;
        }

        return <MuiThemeProvider theme={this.state.theme}>
            <div>
                <MainMenu
                    classes={this.props.classes}
                    selectedView={this.state.selectedView}
                    project={this.state.project}
                    changeView={this.changeView}
                    changeProject={this.changeProject}
                />
                <div>
                    <ReactSplit
                        direction={SplitDirection.Horizontal}
                        initialSizes={this.state.splitSizes}
                        onResizeFinished={(gutterIdx, newSizes) => {
                            this.setState({ splitSizes: newSizes });
                            window.localStorage.setItem('splitSizes', JSON.stringify(newSizes));
                        }}
                        theme={GutterTheme.Light}
                        gutterClassName="Light visGutter"
                    >
                        <div className={this.props.classes.block}>
                            <Widgets />
                        </div>
                        <div>
                            <Tabs
                                value={this.state.selectedView}
                                className={this.props.classes.viewTabs}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {
                                    Object.keys(this.state.project)
                                        .filter(view => !view.startsWith('__'))
                                        .map(view => <Tab
                                            label={<span>
                                                {view}
                                                <IconButton size="small"><CloseIcon fontSize="small" /></IconButton>
                                            </span>}
                                            className={this.props.classes.viewTab}
                                            value={view}
                                            onClick={() => this.changeView(view)}
                                            key={view}
                                        />)
                                }
                            </Tabs>
                            <div className={this.props.classes.canvas}>
                                <pre>
                                    {JSON.stringify(this.state.project, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className={this.props.classes.block}>
                            <Attributes
                                classes={this.props.classes}
                                selectedView={this.state.selectedView}
                                groups={this.state.groups}
                                project={this.state.project}
                                changeProject={this.changeProject}
                            />
                        </div>
                    </ReactSplit>
                </div>
            </div>
        </MuiThemeProvider>;
    }
}

export default withStyles(styles)(App);
