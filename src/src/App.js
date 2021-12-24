import React from 'react';
import './App.scss';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import Loader from '@iobroker/adapter-react/Components/Loader';
import {
    Tab, Tabs,
} from '@material-ui/core';

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
    },
    block: {
        overflow: 'auto',
        height: 'calc(100vh - 106px)',
    },
    menu: {
        display: 'flex',
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

        this.state = {
            ...this.state,
            selectedView: '',
        };

        // icon cache
        this.icons = {};
    }

    onConnectionReady() {
        this.socket.readFile('vis.0', 'main/vis-views.json').then(file => {
            const project = JSON.parse(file);
            this.setState({
                project,
                selectedView: Object.keys(project).find(view => !view.startsWith('__')) || '',
            });
        });
    }

    changeView = view => {
        this.setState({ selectedView: view });
    }

    render() {
        if (!this.state.loaded || !this.state.project) {
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
                />
                <div>
                    <ReactSplit
                        direction={SplitDirection.Horizontal}
                        initialSizes={[20, 60, 20]}
                        theme={GutterTheme.Light}
                        gutterClassName="Light visGutter"
                    >
                        <div className={this.props.classes.block}>
                            <Widgets />
                        </div>
                        <div className={this.props.classes.block}>
                            <Tabs value={this.state.selectedView} className={this.props.classes.viewTabs}>
                                {
                                    Object.keys(this.state.project)
                                        .filter(view => !view.startsWith('__'))
                                        .map(view => <Tab
                                            label={view}
                                            className={this.props.classes.viewTab}
                                            value={view}
                                            onClick={() => this.changeView(view)}
                                            key={view}
                                        />)
                                }
                            </Tabs>
                            <div>
                                <pre>
                                    {JSON.stringify(this.state.project, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className={this.props.classes.block}>
                            <Attributes classes={this.props.classes} />
                        </div>
                    </ReactSplit>
                </div>
            </div>
        </MuiThemeProvider>;
    }
}

export default withStyles(styles)(App);
