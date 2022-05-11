import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Tooltip } from '@mui/material';

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
        textAlign: 'center', flex: 1, alignSelf: 'center', color: 'black',
    },
    widgetImage: {
        // width: 20,
        zoom: 0.3,
    },
    widgetImageWithSrc: {
        height: 32,
        width: 'auto',
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
    if (window.visSets && window.visSets[props.widgetSet]?.color) {
        style.backgroundColor = window.visSets[props.widgetSet].color;
    }
    let img;
    if (props.widgetType.preview?.startsWith('<img')) {
        const m = props.widgetType.preview.match(/src="([^"]+)"/) || props.widgetType.preview.match(/src='([^']+)'/);
        if (m) {
            img = <img src={m[1]} className={props.classes.widgetImageWithSrc} alt={props.widgetType.id} />;
        }
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

    const result =
    <Tooltip
        title={props.widgetType.help ? <div className={props.classes.widgetTooltip}>
            <div>{ img }</div>
            <div>{props.widgetType.help}</div>
        </div> : ''}
        placement="right-end"
    >
        <div className={props.classes.widget} style={style}>
            <div className={props.classes.widgetTitle}>{window._(props.widgetType.title)}</div>
            <span className={props.classes.widgetImageContainer}>
                { img }
            </span>
        </div>
    </Tooltip>;

    const widthRef = useRef();
    const [, dragRef, preview] = useDrag(
        {
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
        }, [props.widgetType],
    );

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
};

export default withStyles(styles)(Widget);
