import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { useEffect, useState } from 'react';

import {
    IconButton,
    Tab, Tabs, Tooltip, Typography,
} from '@mui/material';

import { i18n as I18n, Utils } from '@iobroker/adapter-react-v5';

import CSS from './CSS';
import Scripts from './Scripts';
import View from './View';
import Widget from './Widget';
import usePrevious from '../Utils/usePrevious';
import ClearIcon from "@mui/icons-material/Clear";

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
            style={{ display: 'flex', lineHeight: '34px' }}
        >
            {I18n.t('Attributes')}
            <div style={{ flex: 1 }}></div>
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
        <div style={{ height: 'calc(100% - 89px', overflowY: 'auto' }}>
            {
                selected === 'Widget' && !(props.widgetsLoaded && props.selectedView && props.selectedWidgets?.length) ?
                    null : <TabContent key={selected} {...props} classes={{}} />
            }
        </div>
    </>;
};

Attributes.propTypes = {
    classes: PropTypes.object,
    openedViews: PropTypes.array,
    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    saveCssFile: PropTypes.func.isRequired,
    editMode: PropTypes.bool,
    onHide: PropTypes.func,
};

export default withStyles(style)(Attributes);
