import React from 'react';
import './App.scss';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';

import GenericApp from '@iobroker/adapter-react/GenericApp';
import Loader from '@iobroker/adapter-react/Components/Loader';
import {
    Grid, Tab, Tabs,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

import Attributes from './Attributes';
import Widgets from './Widgets';
import Menu from './Menu';

const styles = theme => ({
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
    }
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
        this.socket.readFile('vis.0', 'main/vis-views.json').then(file => this.setState({ project: JSON.parse(file) }));
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
                <Menu
                    classes={this.props.classes}
                    selectedView={this.state.selectedView}
                    project={this.state.project}
                    changeView={this.changeView}
                />
                <Grid container>
                    <Grid item xs={2}>
                        <Widgets />
                    </Grid>
                    <Grid item xs={8}>
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
                        <div style={{ overflow: 'scroll', height: '100vh' }}>
                            <pre>
                                {JSON.stringify(this.state.project, null, 2)}
                            </pre>
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <Attributes classes={this.props.classes} />
                    </Grid>
                </Grid>
            </div>
        </MuiThemeProvider>;
    }
}

export default withStyles(styles)(App);
