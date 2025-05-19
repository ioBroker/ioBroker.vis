import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { Box, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Update as UpdateIcon, Block as DeletedIcon } from '@mui/icons-material';

import { I18n, Utils, type LegacyConnection, type ThemeType } from '@iobroker/adapter-react-v5';

import type { MarketplaceWidgetRevision, Project } from '@iobroker/types-vis-2';

import { store } from '@/Store';
import type { WidgetType } from '@/Vis/visWidgetsCatalog';
import helpers from '../Components/wizardHelpers';

const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

const styles: Record<string, any> = {
    widget: {
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: 'orange',
        width: '100%',
        display: 'inline-flex',
        margin: 4,
        minHeight: 36,
    },
    widgetTitle: {
        textAlign: 'left',
        marginLeft: 8,
        flex: 1,
        alignSelf: 'center',
        color: 'black',
    },
    widgetImage: {
        // transform: 'scale(0.3)',
        width: 30,
        height: 30,
        transformOrigin: '0 0',
    },
    widgetImageWithSrc: {
        maxWidth: 60,
        maxHeight: 32,
        width: 'auto',
        borderRadius: 4,
    },
    widgetTooltip: {
        '& $widgetImage': {
            zoom: 0.6,
        },
        '& $widgetImageWithSrc': {
            height: 64,
        },
    },
    widgetImageContainer: {
        // borderLeftStyle: 'solid',
        // borderLeftWidth: 1,
        // borderLeftColor: 'gray',
        display: 'flex',
        padding: 4,
        alignItems: 'center',
        overflow: 'hidden',
    },
    widgetMarketplace: {
        fontSize: '80%',
        fontStyle: 'italic',
    },
    widgetDeleted: {
        marginTop: 9,
        color: '#F00',
    },
};

const WIDGET_ICON_HEIGHT = 34;

interface WidgetProps {
    widgetSetProps?: Record<string, any>;
    widgetSet: string;
    widgetType: WidgetType;
    widgetTypeName: string;
    socket?: LegacyConnection;
    themeType: ThemeType;
    changeProject?: (project: Project, ignoreHistory?: boolean) => Promise<void>;
    changeView?: (view: string) => void;
    editMode: boolean;
    widgetMarketplaceId?: string;
    selectedView: string;

    /** Used for a marketplace */
    updateWidgets?: (widget: MarketplaceWidgetRevision) => void;
    uninstallWidget?: (widgetId: string) => void;
    marketplace?: MarketplaceWidgetRevision;
    marketplaceUpdates?: MarketplaceWidgetRevision[];
    marketplaceDeleted?: string[];
}

const Widget = (props: WidgetProps): React.JSX.Element => {
    const imageRef = useRef<HTMLSpanElement>();
    const style: React.CSSProperties = {};

    useEffect(() => {
        if (imageRef.current?.children[0]) {
            const height = imageRef.current.children[0].clientHeight;
            if (height > WIDGET_ICON_HEIGHT) {
                imageRef.current.style.transform = `scale(${WIDGET_ICON_HEIGHT / height})`;
            }
        }
    }, [imageRef]);

    if (props.widgetType?.color) {
        style.backgroundColor = props.widgetType.color;
    } else if (props.widgetSetProps?.color) {
        style.backgroundColor = props.widgetSetProps.color;
    } else if (window.visSets && window.visSets[props.widgetSet]?.color) {
        style.backgroundColor = window.visSets[props.widgetSet].color;
    }

    const titleStyle: React.CSSProperties = {};
    if (style.backgroundColor) {
        if (Utils.isUseBright(style.backgroundColor)) {
            titleStyle.color = 'white';
        } else {
            titleStyle.color = 'black';
        }
    }

    let img;
    if (props.widgetType.preview?.startsWith('<img')) {
        const m = props.widgetType.preview.match(/src="([^"]+)"/) || props.widgetType.preview.match(/src='([^']+)'/);
        if (m) {
            img = (
                <img
                    src={m[1]}
                    style={styles.widgetImageWithSrc}
                    alt={props.widgetType.name}
                />
            );
        }
    } else if (
        props.widgetType.preview &&
        (IMAGE_TYPES.find(ext => props.widgetType.preview.toLowerCase().endsWith(ext)) ||
            props.widgetSet === '__marketplace')
    ) {
        img = (
            <img
                src={props.widgetType.preview}
                style={styles.widgetImageWithSrc}
                alt={props.widgetType.name}
                onError={e => {
                    if (e.target) {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = './img/no-image.svg';
                        (e.target as HTMLImageElement).style.height = '24px';
                    }
                }}
            />
        );
    }

    if (!img) {
        img = (
            <span
                style={styles.widgetImage}
                ref={imageRef}
                dangerouslySetInnerHTML={{ __html: props.widgetType.preview }}
            />
        );
    }

    let label = props.widgetType.label ? I18n.t(props.widgetType.label) : window.vis._(props.widgetType.title);
    // remove legacy stuff
    label = label.split('<br')[0];
    label = label.split('<span')[0];
    label = label.split('<div')[0];

    let marketplaceUpdate: MarketplaceWidgetRevision | null = null;
    let marketplaceDeleted;
    if (props.widgetSet === '__marketplace') {
        marketplaceUpdate = props.marketplaceUpdates?.find(u => u.widget_id === props.widgetMarketplaceId);
        marketplaceDeleted = props.marketplaceDeleted?.includes(props.widgetMarketplaceId);
    }

    const result = (
        <Tooltip
            title={
                <Box
                    component="div"
                    sx={styles.widgetTooltip}
                >
                    <div>{img}</div>
                    {props.widgetType.help ? <div>{props.widgetType.help}</div> : null}
                </Box>
            }
            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
            placement="right-end"
        >
            <div style={{ ...styles.widget, ...style }}>
                <span style={{ display: 'none' }}>{props.widgetTypeName}</span>
                <div style={{ ...styles.widgetTitle, ...titleStyle }}>
                    <div>{label}</div>
                    {props.widgetSet === '__marketplace' && props.marketplace && (
                        <div style={styles.widgetMarketplace}>
                            {`${I18n.t('version')} ${props.marketplace.version}`}
                        </div>
                    )}
                </div>
                {props.widgetSet === '__marketplace' && (
                    <>
                        <Tooltip
                            title={I18n.t('Uninstall')}
                            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                        >
                            <IconButton onClick={() => props.uninstallWidget(props.widgetType.name)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        {marketplaceUpdate && (
                            <Tooltip
                                title={`${I18n.t('Update to version')} ${marketplaceUpdate.version}`}
                                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                            >
                                <IconButton onClick={() => props.updateWidgets(marketplaceUpdate)}>
                                    <UpdateIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {marketplaceDeleted && (
                            <Tooltip
                                title={I18n.t('Widget was deleted in widgeteria')}
                                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                            >
                                <DeletedIcon style={styles.widgetDeleted} />
                            </Tooltip>
                        )}
                    </>
                )}
                <span style={styles.widgetImageContainer}>{img}</span>
            </div>
        </Tooltip>
    );

    const widthRef = useRef<HTMLSpanElement>();
    const [, dragRef, preview] = useDrag(
        {
            type: 'widget',
            item: () => ({
                widgetType: props.widgetType,
                widgetSet: props.widgetSet,
                preview: <div style={{ width: widthRef.current?.offsetWidth || 100 }}>{result}</div>,
            }),
            collect: monitor => ({
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
            }),
        },
        [props.widgetType],
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.widgetType]);

    if (typeof props.widgetType.customPalette === 'function') {
        if (!props.editMode) {
            return null;
        }
        return props.widgetType.customPalette({
            socket: props.socket,
            project: store.getState().visProject,
            changeProject: props.changeProject,
            selectedView: props.selectedView,
            changeView: props.changeView,
            themeType: props.themeType,
            helpers,
        });
    }

    return (
        <span
            ref={props.editMode ? dragRef : null}
            id={`widget_${props.widgetTypeName}`}
            className={`widget-${props.widgetSet}`}
        >
            <span ref={widthRef}>{result}</span>
        </span>
    );
};

export default Widget;
