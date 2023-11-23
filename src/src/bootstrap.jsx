import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import { StylesProvider, createGenerateClassName } from '@mui/styles';

import './index.css';
import { Utils } from '@iobroker/adapter-react-v5';
import App from './App';
import * as serviceWorker from './serviceWorker';
import packageJson from '../package.json';
import theme from './theme';

window.adapterName = 'vis-2';
const themeName = Utils.getThemeName();

console.log(`iobroker.${window.adapterName}@${packageJson.version} using theme "${themeName}"`);
window.sentryDSN = 'https://db8b6e837c71447a876069559a00a742@sentry.iobroker.net/232';

import('./Vis/visRxWidget').then(VisRxWidget =>
    window.visRxWidget = VisRxWidget.default);

const generateClassName = createGenerateClassName({
    productionPrefix: 'vis-a',
});

function modifyClasses(className, addClass, removeClass) {
    const classes = (className || '').split(' ').map(c => c.trim()).filter(c => c);
    const pos = classes.indexOf(removeClass);
    if (pos !== -1) {
        classes.splice(pos, 1);
    }
    !classes.includes(addClass) && classes.push(addClass);
    return classes.join(' ');
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

const ThemeContainer = () => {
    const [currentTheme, setCurrentTheme] = useState(themeName);

    const newTheme = theme(currentTheme);

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
                backgroundColor: newTheme.palette.mode === 'dark' ? 'hsl(0deg 0% 20%)' : 'hsl(0deg 0% 90%)',
            },
            toolbar: {
                display: 'flex',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 10,
            },
            viewManageBlock: {
                display: 'flex',
                alignItems: 'center',
            },
            viewManageButtonActions: {
                textAlign: 'right',
                flex: 1,
            },
        },
    });

    const getTheme = () => createTheme(appTheme(), newTheme);

    // apply background color only if not in iframe
    if (!inIframe()) {
        if (newTheme.palette.mode === 'dark') {
            window.document.body.className = modifyClasses(window.document.body.className, 'body-dark', 'body-light');
        } else {
            window.document.body.className = modifyClasses(window.document.body.className, 'body-light', 'body-dark');
        }
    }

    return <StylesProvider generateClassName={generateClassName}>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={getTheme()}>
                <App
                    version={packageJson.version}
                    onThemeChange={_theme => {
                        // apply background color only if not in iframe
                        if (!inIframe()) {
                            if (newTheme.palette.mode === 'dark') {
                                window.document.body.className = modifyClasses(window.document.body.className, 'body-dark', 'body-light');
                            } else {
                                window.document.body.className = modifyClasses(window.document.body.className, 'body-light', 'body-dark');
                            }
                        }

                        setCurrentTheme(_theme);
                    }}
                />
            </ThemeProvider>
        </StyledEngineProvider>
    </StylesProvider>;
};

function build() {
    const container = document.getElementById('root');
    const root = createRoot(container);
    return root.render(
        <ThemeContainer />,
    );
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
