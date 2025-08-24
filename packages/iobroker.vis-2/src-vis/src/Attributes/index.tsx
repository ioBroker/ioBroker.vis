import React, { useEffect, useState, type JSXElementConstructor, type ReactNode } from 'react';

import { IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';

import {
    Clear as ClearIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
    ListAlt as IconAttributes,
} from '@mui/icons-material';

import { I18n, Utils, type ThemeType, type LegacyConnection } from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import type { AdditionalIconSet, VisTheme } from '@iobroker/types-vis-2';
import CSS from './CSS';
import Scripts from './Scripts';
import View from './View';
import Widget from './Widget';
import usePrevious from '../Utils/usePrevious';

const styles: Record<string, any> = {
    blockHeader: (theme: VisTheme) => theme.classes.blockHeader,
    lightedPanel: (theme: VisTheme) => theme.classes.lightedPanel,
    viewTabs: (theme: VisTheme) => theme.classes.viewTabs,
    viewTab: (theme: VisTheme) => theme.classes.viewTab,
};

const tabs: Record<string, JSXElementConstructor<any> | ((props: Record<string, any>) => ReactNode)> = {
    View,
    Widget,
    CSS,
    Scripts,
};

interface AttributesProps {
    themeType: ThemeType;
    openedViews: string[];
    adapterName: string;
    instance: number;
    projectName: string;
    saveCssFile: Editor['saveCssFile'];
    editMode: boolean;
    onHide: (hide: boolean) => void;
    adapterId: string;
    userGroups: Editor['state']['userGroups'];
    selectedWidgets: string[];
    widgetsLoaded: boolean;
    selectedView: string;
    changeProject: Editor['changeProject'];
    socket: LegacyConnection;
    fonts: string[];
    cssClone: Editor['cssClone'];
    onPxToPercent: Editor['onPxToPercent'];
    onPercentToPx: Editor['onPercentToPx'];
    theme: VisTheme;
    additionalSets: AdditionalIconSet;
}

const Attributes = (props: AttributesProps): React.JSX.Element => {
    const [selected, setSelected] = useState(
        window.localStorage.getItem('Attributes') ? window.localStorage.getItem('Attributes') : 'View',
    );
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.selectedWidgets]);

    if (!props.openedViews.length) {
        return null;
    }

    const TabContent: JSXElementConstructor<any> | ((props_: Record<string, any>) => ReactNode) = tabs[selected];

    return (
        <>
            <Typography
                variant="h6"
                gutterBottom
                sx={Utils.getStyle(props.theme, styles.blockHeader, styles.lightedPanel)}
                style={{
                    display: 'flex',
                    lineHeight: '34px',
                    height: 34,
                }}
            >
                <IconAttributes style={{ marginTop: 4, marginRight: 4 }} />
                {I18n.t('Attributes')}
                <div style={{ flex: 1 }}></div>
                {selected === 'View' || selected === 'Widget' ? (
                    <div style={{ textAlign: 'right' }}>
                        {!isAllOpened ? (
                            <Tooltip
                                title={I18n.t('Expand all')}
                                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setTriggerAllOpened(triggerAllOpened + 1)}
                                >
                                    <UnfoldMoreIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <IconButton
                                size="small"
                                disabled
                            >
                                <UnfoldMoreIcon />
                            </IconButton>
                        )}
                        {!isAllClosed ? (
                            <Tooltip
                                title={I18n.t('Collapse all')}
                                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                            >
                                <IconButton onClick={() => setTriggerAllClosed(triggerAllClosed + 1)}>
                                    <UnfoldLessIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <IconButton
                                size="small"
                                disabled
                            >
                                <UnfoldLessIcon />
                            </IconButton>
                        )}
                    </div>
                ) : null}
                <Tooltip
                    title={I18n.t('Hide attributes')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        size="small"
                        onClick={() => props.onHide(true)}
                    >
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            </Typography>
            <Tabs
                sx={styles.viewTabs}
                value={selected || 'View'}
                variant="scrollable"
                scrollButtons="auto"
            >
                {['View', 'Widget', 'CSS', 'Scripts'].map(tab => (
                    <Tab
                        label={I18n.t(tab)}
                        value={tab}
                        disabled={tab === 'Widget' && !props.selectedWidgets.length}
                        key={tab}
                        sx={styles.viewTab}
                        onClick={() => {
                            setSelected(tab);
                            window.localStorage.setItem('Attributes', tab);
                        }}
                    />
                ))}
            </Tabs>
            <div style={{ height: 'calc(100% - 89px', overflowY: 'hidden' }}>
                {selected === 'Widget' &&
                !(props.widgetsLoaded && props.selectedView && props.selectedWidgets?.length) ? null : (
                    <TabContent
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
                        additionalSets={props.additionalSets}
                    />
                )}
            </div>
        </>
    );
};

export default Attributes;
