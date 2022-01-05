import {
    Tab, Tabs, Typography,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';
import { useState } from 'react';

import CSS from './CSS';
import Scripts from './Scripts';
import View from './View';
import Widget from './Widget';

const tabs = {
    CSS, Scripts, View, Widget,
};

const Attributes = props => {
    const [selected, setSelected] = useState(window.localStorage.getItem('Attributes')
        ? window.localStorage.getItem('Attributes')
        : 'View');

    if (!Object.keys(props.project).find(view => !view.startsWith('__'))) {
        return null;
    }

    const TabContent = tabs[selected];

    return <>
        <Typography variant="h6" gutterBottom>
            {I18n.t('Attributes')}
        </Typography>
        <Tabs
            className={props.classes.viewTabs}
            value={selected}
            variant="scrollable"
            scrollButtons="on"
        >
            {
                ['View', 'Widget', 'CSS', 'Scripts'].map(tab => <Tab
                    label={I18n.t(tab)}
                    value={tab}
                    key={tab}
                    className={props.classes.viewTab}
                    onClick={() => {
                        setSelected(tab);
                        window.localStorage.setItem('Attributes', tab);
                    }}
                />)
            }
        </Tabs>
        <TabContent {...props} />
    </>;
};

export default Attributes;
