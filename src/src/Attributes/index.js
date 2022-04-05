import PropTypes from 'prop-types';
import {
    Tab, Tabs, Typography,
} from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import { useEffect, useState } from 'react';

import clsx from 'clsx';
import { withStyles } from '@mui/styles';
import CSS from './CSS';
import Scripts from './Scripts';
import View from './View';
import Widget from './Widget';
import usePrevious from '../Utils/usePrevious';

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

    const prevSelectedWidgets = usePrevious(props.selectedWidgets);

    useEffect(() => {
        if (selected === 'Widget' && !props.selectedWidgets.length) {
            setSelected('View');
        }
        if (prevSelectedWidgets && !prevSelectedWidgets.length && props.selectedWidgets.length) {
            setSelected('Widget');
        }
    }, [props.selectedWidgets]);

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
                    disabled={tab === 'Widget' && !props.selectedWidgets.length}
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
    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
};

export default withStyles(style)(Attributes);
