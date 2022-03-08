import PropTypes from 'prop-types';
import {
    Tab, Tabs, Typography,
} from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import { useState } from 'react';

import clsx from 'clsx';
import { withStyles } from '@mui/styles';
import CSS from './CSS';
import Scripts from './Scripts';
import View from './View';
import Widget from './Widget';

const style = theme => ({
    blockHeader: theme.classes.blockHeader,
    lightedPanel: theme.classes.lightedPanel,
    viewTabs: theme.classes.viewTabs,
    viewTab: theme.classes.viewTab,
});

const tabs = {
    CSS, Scripts, View, Widget,
};

const Attributes = props => {
    const [selected, setSelected] = useState(window.localStorage.getItem('Attributes')
        ? window.localStorage.getItem('Attributes')
        : 'View');

    if (!props.openedViews.length) {
        return null;
    }

    const TabContent = tabs[selected];

    return <>
        <Typography variant="h6" gutterBottom className={clsx(props.classes.blockHeader, props.classes.lightedPanel)}>
            {I18n.t('Attributes')}
        </Typography>
        <Tabs
            className={props.classes.viewTabs}
            value={selected}
            variant="scrollable"
            scrollButtons="auto"
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
        <TabContent {...props} classes={{}} />
    </>;
};

Attributes.propTypes = {
    classes: PropTypes.object,
    openedViews: PropTypes.array,
};

export default withStyles(style)(Attributes);
