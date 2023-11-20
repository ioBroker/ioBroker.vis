import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { IconButton, Tooltip } from '@mui/material';
import {
    Delete as DeleteIcon,
    Update as UpdateIcon,
    Block as DeletedIcon,
} from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';
import helpers from '../Components/WizardHelpers';
import { store } from '../Store';

const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

const styles = () => ({
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
    widgetMarketplace:{
        fontSize: '80%',
        fontStyle: 'italic',
    },
    widgetDeleted: {
        marginTop: 9,
        color: '#F00',
    },
});

const WIDGET_ICON_HEIGHT = 34;
const Widget = props => {
    const imageRef = useRef();
    const style = {};

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

    const titleStyle = {};
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
            img = <img src={m[1]} className={props.classes.widgetImageWithSrc} alt={props.widgetType.id} />;
        }
    } else if (props.widgetType.preview &&
        (
            IMAGE_TYPES.find(ext => props.widgetType.preview.toLowerCase().endsWith(ext)) ||
            props.widgetSet === '__marketplace'
        )
    ) {
        img = <img src={props.widgetType.preview} className={props.classes.widgetImageWithSrc} alt={props.widgetType.id} />;
    }

    if (!img) {
        img = <span
            className={props.classes.widgetImage}
            ref={imageRef}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: props.widgetType.preview }}
        />;
    }

    let label = props.widgetType.label ? I18n.t(props.widgetType.label) : window.vis._(props.widgetType.title);
    // remove legacy stuff
    label = label.split('<br')[0];
    label = label.split('<span')[0];
    label = label.split('<div')[0];

    let marketplaceUpdate;
    let marketplaceDeleted;
    if (props.widgetSet === '__marketplace') {
        marketplaceUpdate = props.marketplaceUpdates?.find(u => u.widget_id === props.widgetType.widget_id);
        marketplaceDeleted = props.marketplaceDeleted?.includes(props.widgetType.widget_id);
    }

    const result = <Tooltip
        title={<div className={props.classes.widgetTooltip}>
            <div>{img}</div>
            {props.widgetType.help ? <div>{props.widgetType.help}</div> : null}
        </div>}
        placement="right-end"
    >
        <div className={props.classes.widget} style={style}>
            <span style={{ display: 'none' }}>{props.widgetTypeName}</span>
            <div className={props.classes.widgetTitle} style={titleStyle}>
                <div>{label}</div>
                {props.widgetSet === '__marketplace' && props.marketplace && <div className={props.classes.widgetMarketplace}>
                    {`${I18n.t('version')} ${props.marketplace.version}`}
                </div>}
            </div>
            {props.widgetSet === '__marketplace' && <>
                <Tooltip title={I18n.t('Uninstall')}>
                    <IconButton onClick={() => props.uninstallWidget(props.widgetType.id)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                {marketplaceUpdate && <Tooltip title={`${I18n.t('Update to version')} ${marketplaceUpdate.version}`}>
                    <IconButton onClick={async () => {
                        await props.updateWidgets(marketplaceUpdate);
                    }}
                    >
                        <UpdateIcon />
                    </IconButton>
                </Tooltip>}
                {marketplaceDeleted && <Tooltip title={I18n.t('Widget was deleted in widgeteria')}>
                    <DeletedIcon className={props.classes.widgetDeleted} />
                </Tooltip>}
            </>}
            <span className={props.classes.widgetImageContainer}>
                {img}
            </span>
        </div>
    </Tooltip>;

    const widthRef = useRef();
    const [, dragRef, preview] = useDrag({
        type: 'widget',
        item: () => ({
            widgetType: props.widgetType,
            widgetSet: props.widgetSet,
            preview: <div style={{ width: widthRef.current.offsetWidth }}>
                {result}
            </div>,
        }),
        collect: monitor => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }, [props.widgetType]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
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
            themeType: props.themeType,
            helpers,
        });
    }

    return <span ref={props.editMode ? dragRef : null} id={`widget_${props.widgetTypeName}`} className={`widget-${props.widgetSet}`}>
        <span ref={widthRef}>
            {result}
        </span>
    </span>;
};

Widget.propTypes = {
    classes: PropTypes.object,
    widgetSetProps: PropTypes.object,
    widgetSet: PropTypes.string,
    widgetType: PropTypes.object,
    widgetTypeName: PropTypes.string,
    updateWidgets: PropTypes.func,
    marketplace: PropTypes.object,
    marketplaceUpdates: PropTypes.array,
    marketplaceDeleted: PropTypes.array,
    uninstallWidget: PropTypes.func,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    changeProject: PropTypes.func,
    editMode: PropTypes.bool,
};

export default withStyles(styles)(Widget);
