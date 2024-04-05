import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';

import {
    IconButton,
    Tab, Tabs, Tooltip, Typography,
} from '@mui/material';

import {
    Clear as ClearIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon, ListAlt as IconAttributes,
} from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

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
    View, Widget, CSS, Scripts,
};

const Attributes = props => {
    const [selected, setSelected] = useState(window.localStorage.getItem('Attributes')
        ? window.localStorage.getItem('Attributes')
        : 'View');
    const [isAllOpened, setIsAllOpened] = useState(false);
    const [isAllClosed, setIsAllClosed] = useState(true);
    const [triggerAllOpened, setTriggerAllOpened] = useState(0);
    const [triggerAllClosed, setTriggerAllClosed] = useState(0);

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
        <Typography
            variant="h6"
            gutterBottom
            className={Utils.clsx(props.classes.blockHeader, props.classes.lightedPanel)}
            style={{
                display: 'flex',
                lineHeight: '34px',
                height: 34,
            }}
        >
            <IconAttributes style={{ marginTop: 4, marginRight: 4 }} />
            {I18n.t('Attributes')}
            <div style={{ flex: 1 }}></div>
            {selected === 'View' || selected === 'Widget' ? <div style={{ textAlign: 'right' }}>
                {!isAllOpened ? <Tooltip title={I18n.t('Expand all')}>
                    <IconButton
                        size="small"
                        onClick={() => setTriggerAllOpened(triggerAllOpened + 1)}
                    >
                        <UnfoldMoreIcon />
                    </IconButton>
                </Tooltip> : <IconButton size="small" disabled><UnfoldMoreIcon /></IconButton>}
                { !isAllClosed ? <Tooltip size="small" title={I18n.t('Collapse all')}>
                    <IconButton onClick={() => setTriggerAllClosed(triggerAllClosed + 1)}>
                        <UnfoldLessIcon />
                    </IconButton>
                </Tooltip> : <IconButton size="small" disabled><UnfoldLessIcon /></IconButton> }
            </div> : null}
            <Tooltip title={I18n.t('Hide attributes')}>
                <IconButton
                    size="small"
                    onClick={() =>
                        props.onHide(true)}
                >
                    <ClearIcon />
                </IconButton>
            </Tooltip>
        </Typography>
        <Tabs
            className={props.classes.viewTabs}
            value={selected || 'View'}
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
        <div style={{ height: 'calc(100% - 89px', overflowY: 'hidden' }}>
            {
                selected === 'Widget' && !(props.widgetsLoaded && props.selectedView && props.selectedWidgets?.length) ?
                    null : <TabContent
                        adapterId={props.adapterId}
                        adapterName={props.adapterName}
                        key={selected}
                        {...props}
                        classes={{}}
                        setIsAllOpened={setIsAllOpened}
                        setIsAllClosed={setIsAllClosed}
                        isAllOpened={isAllOpened}
                        isAllClosed={isAllClosed}
                        triggerAllOpened={triggerAllOpened}
                        triggerAllClosed={triggerAllClosed}
                    />
            }
        </div>
    </>;
};

Attributes.propTypes = {
    classes: PropTypes.object,
    themeType: PropTypes.string,
    openedViews: PropTypes.array,
    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    saveCssFile: PropTypes.func.isRequired,
    editMode: PropTypes.bool,
    onHide: PropTypes.func,
    adapterId: PropTypes.string.isRequired,
    userGroups: PropTypes.object.isRequired,
};

export default withStyles(style)(Attributes);
