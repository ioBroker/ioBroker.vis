import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { Tooltip } from '@mui/material';

import { i18n as I18n, Utils } from '@iobroker/adapter-react-v5';

const styles = () => ({
    widget: {
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: 'orange',
        width: 240,
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
        transform: 'scale(0.3)',
        width: 30,
        height: 30,
        transformOrigin: '0 0',
    },
    widgetImageWithSrc: {
        height: 32,
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
    },
});

const Widget = props => {
    const style = {};
    if (props.widgetType?.color) {
        style.backgroundColor = props.widgetType.color;
    } else if (props.widgetSetProps?.color) {
        style.backgroundColor = props.widgetSetProps.color;
    } else
    if (window.visSets && window.visSets[props.widgetSet]?.color) {
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
    } else if (props.widgetType.preview && (props.widgetType.preview.endsWith('.svg') || props.widgetType.preview.endsWith('.png') || props.widgetType.preview.endsWith('.jpg'))) {
        img = <img src={props.widgetType.preview} className={props.classes.widgetImageWithSrc} alt={props.widgetType.id} />;
    }

    if (!img) {
        img = <span
            className={props.classes.widgetImage}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={
                { __html: props.widgetType.preview }
            }
        />;
    }

    let label = props.widgetType.label ? I18n.t(props.widgetType.label) : window.vis._(props.widgetType.title);
    // remove legacy stuff
    label = label.split('<br')[0];
    label = label.split('<span')[0];
    label = label.split('<div')[0];

    const result = <Tooltip
        title={<div className={props.classes.widgetTooltip}>
            <div>{img}</div>
            {props.widgetType.help ? <div>{props.widgetType.help}</div> : null}
        </div>}
        placement="right-end"
    >
        <div className={props.classes.widget} style={style}>
            <span style={{ display: 'none' }}>{props.widgetTypeName}</span>
            <div className={props.classes.widgetTitle} style={titleStyle}>{label}</div>
            <span className={props.classes.widgetImageContainer}>
                { img }
            </span>
        </div>
    </Tooltip>;

    const widthRef = useRef();
    const [, dragRef, preview] = useDrag({
        type: 'widget',
        item: () => ({
            widgetType: props.widgetType,
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

    return <span ref={dragRef}>
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
};

export default withStyles(styles)(Widget);
