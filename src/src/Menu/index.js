import {
    Tab, Tabs,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';
import { useState } from 'react';

import Toolbar from '../Toolbar';

const menuItems = ['View', 'Widgets', 'Tools', 'Setup', 'Help'];

const Menu = props => {
    const [selected, setSelected] = useState('View');

    return <>
        <div>
Vis
            <Tabs className={props.classes.viewTabs} value={selected}>
                {
                    menuItems.map(tab => <Tab
                        label={I18n.t(tab)}
                        value={tab}
                        className={props.classes.viewTab}
                        onClick={() => setSelected(tab)}
                    />)
                }
            </Tabs>
        </div>
        <Toolbar
            selected={selected}
            {...props}
        />
    </>;
};

export default Menu;
