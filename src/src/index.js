/* eslint-disable */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import './index.css';
// import theme from '@iobroker/adapter-react-v5/Theme';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import App from './App';
import * as serviceWorker from './serviceWorker';
import packageJson from '../package.json';
import theme from './theme';

window.adapterName = 'vis';
let themeName = Utils.getThemeName();

console.log(`iobroker.${window.adapterName}@${packageJson.version} using theme "${themeName}"`);
//window.sentryDSN = 'https://6ccbeba86d86457b82ded80109fa7aba@sentry.iobroker.net/144';

const appTheme = () => ({
    classes: {
        blockHeader: {
            fontSize: 16,
            textAlign: 'left',
            marginTop: 8,
            borderRadius: 2,
            paddingLeft: 8,
        },
        viewTabs: {
            minHeight: 0,
        },
        viewTab: {
            minWidth: 0,
            minHeight: 0,
        },
        lightedPanel: {
            backgroundColor: theme(themeName).palette.mode === 'dark' ? 'hsl(0deg 0% 20%)' : 'hsl(0deg 0% 90%)',
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            paddingTop: '10px',
            paddingBottom: '10px',
        },
        viewManageBlock: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'grab',
        },
        viewManageButtonActions: {
            textAlign: 'right',
            flex: 1,
        },

    }
});

const getTheme = () => createTheme(appTheme(), theme(themeName));

function build() {
    const container = document.getElementById('root');
    const root = createRoot(container);
    return root.render(
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={getTheme()}>
                <App
                    socket={{port: 8082}}
                    onThemeChange={(_theme) => {
                        themeName = _theme;
                        build();
                    }}
                />
            </ThemeProvider>
        </StyledEngineProvider>,
    );
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
