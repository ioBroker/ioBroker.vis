import React from 'react';
import { createRoot } from 'react-dom/client';

import { Utils } from '@iobroker/adapter-react-v5';

import type VisRxWidget from '@/Vis/visRxWidget';
import './index.css';
import App from './Editor';
import * as serviceWorker from './serviceWorker';
import packageJson from './version.json';

declare global {
    interface Window {
        adapterName: string;
        visRxWidget?: typeof VisRxWidget;
        disableDataReporting?: boolean;
        sentryDSN?: string;
        visConfigLoaded?: Promise<void>;
    }
}

window.adapterName = 'vis-2';

console.log(`iobroker.${window.adapterName}@${packageJson.version}`);

import('./Vis/visRxWidget')
    .then(_VisRxWidget => window.visRxWidget = _VisRxWidget.default);

function modifyClasses(className: string, addClass?: string, removeClass?: string): string {
    const classes = (className || '').split(' ').map(c => c.trim()).filter(c => c);
    const pos = classes.indexOf(removeClass);
    if (pos !== -1) {
        classes.splice(pos, 1);
    }
    !classes.includes(addClass) && classes.push(addClass);
    return classes.join(' ');
}

/**
 * Checks if vis is rendered inside an iFrame
 */
function inIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}

// apply background color only if not in iframe
function setBackground() {
    if (!inIframe()) {
        if (Utils.getThemeType() === 'dark') {
            window.document.body.className = modifyClasses(window.document.body.className, 'body-dark', 'body-light');
        } else {
            window.document.body.className = modifyClasses(window.document.body.className, 'body-light', 'body-dark');
        }
    } else {
        window.document.body.className = '';
    }
}

setBackground();

function build() {
    const container = document.getElementById('root');
    const root = createRoot(container);
    return root.render(<App
        setBackground={() => setBackground()}
        version={packageJson.version}
    />);
}

// wait till all scrips are loaded
window.visConfigLoaded
    .then(() => {
        if (!window.disableDataReporting) {
            window.sentryDSN = 'https://db8b6e837c71447a876069559a00a742@sentry.iobroker.net/232';
        }
        build();
    });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
