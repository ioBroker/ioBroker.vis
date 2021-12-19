import {
    Tab, Tabs,
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
    const [selected, setSelected] = useState('View');

    const TabContent = tabs[selected];

    return <>
        {I18n.t('Attributes')}
        <Tabs className={props.classes.viewTabs} value={selected}>
            {
                ['View', 'Widget', 'CSS', 'Scripts'].map(tab => <Tab
                    label={I18n.t(tab)}
                    value={tab}
                    key={tab}
                    className={props.classes.viewTab}
                    onClick={() => setSelected(tab)}
                />)
            }
        </Tabs>
        <TabContent {...props} />
    </>;
};

export default Attributes;
