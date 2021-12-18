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

const styles = theme => {};

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
        };

        // icon cache
        this.icons = {};
    }

    onConnectionReady() {
        this.socket.readFile('vis.0', 'main/vis-views.json').then(file => this.setState({ project: JSON.parse(file) }));
    }

    render() {
        if (!this.state.loaded || !this.state.project) {
            return <MuiThemeProvider theme={this.state.theme}>
                <Loader theme={this.state.themeType} />
            </MuiThemeProvider>;
        }

        return <MuiThemeProvider theme={this.state.theme}>
            <div style={{ overflow: 'scroll', height: '100%' }}>
                <div>
Vis
                    <Tabs>
                        {
                            ['View', 'Widgets', 'Tools', 'Setup', 'Help'].map(tab => <Tab label={I18n.t(tab)} />)
                        }
                    </Tabs>
                </div>
                <div>Panel</div>
                <Grid container>
                    <Grid item xs={2}>
                        <Widgets />
                    </Grid>
                    <Grid item xs={8}>
                        <Tabs>
                            {
                                Object.keys(this.state.project)
                                    .filter(project => !project.startsWith('__'))
                                    .map(project => <Tab label={project} />)
                            }
                        </Tabs>
                        <pre>
                            {JSON.stringify(this.state.project, null, 2)}
                        </pre>
                    </Grid>
                    <Grid item xs={2}>
                        <Attributes />
                    </Grid>
                </Grid>
            </div>
        </MuiThemeProvider>;
    }
}

export default withStyles(styles)(App);
