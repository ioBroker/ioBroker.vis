import {
    Tab, Tabs,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';
import { useState } from 'react';

const Attributes = props => {
    const [selected, setSelected] = useState('View');

    return <>
        {I18n.t('Attributes')}
        <Tabs className={props.classes.viewTabs} value={selected}>
            {
                ['View', 'Widget', 'CSS', 'Scripts'].map(tab => <Tab
                    label={I18n.t(tab)}
                    value={tab}
                    className={props.classes.viewTab}
                    onClick={() => setSelected(tab)}
                />)
            }
        </Tabs>
    </>;
};

export default Attributes;
