import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Menu, MenuItem } from '@mui/material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import { getWidgetTypes } from './visWidgetsCatalog';

const styles = () => ({
    widgetIcon: {
        overflow: 'hidden',
        width: 40,
        height: 40,
        display: 'inline-block',
        marginRight: 4,
    },
    icon: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    widgetName: {
        verticalAlign: 'top',
        display: 'inline-block',
    },
    widgetImage: {
        display: 'block',
        width: 30,
        height: 30,
        transformOrigin: '0 0',
    },
    widgetType: {
        verticalAlign: 'top',
        display: 'inline-block',
        fontSize: 12,
        fontStyle: 'italic',
        marginLeft: 8,
    },
    widgetNameText: {
        lineHeight: '20px',
    },
    coloredWidgetSet: {
        padding: '0 3px',
        borderRadius: 3,
    },
    number: {
        marginRight: 8,
    },
});

const WIDGET_ICON_HEIGHT = 34;

const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

const Widget = ({
    id,
    children,
    index,
    moveCard,
    onDropped,
    selected,
}) => {
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
        accept: 'widget',
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(/* item, monitor */) {
            onDropped();
        },
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            moveCard(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'widget',
        item: () => ({ id, index }),
        collect: monitor => ({ isDragging: monitor.isDragging() }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));

    return <MenuItem
        ref={ref}
        selected={selected}
        style={{ opacity }}
        data-handler-id={handlerId}
        onClick={() => onDropped(index)}
    >
        {children}
    </MenuItem>;
};

class VisOrderMenu extends React.Component {
    constructor(props) {
        super(props);
        this.widgetTypes = getWidgetTypes();
        this.imageRef = [];
        for (let i = 0; i < this.props.order.length; i++) {
            this.imageRef.push(React.createRef());
        }

        this.state = {
            order: [...this.props.order],
        };
    }

    componentDidUpdate(/* prevProps, prevState, snapshot */) {
        for (let i = 0; i < this.state.order.length; i++) {
            if (this.imageRef[i].current?.children[0]) {
                const height = this.imageRef[i].current.children[0].clientHeight;
                if (height > WIDGET_ICON_HEIGHT) {
                    this.imageRef[i].current.style.transform = `scale(${WIDGET_ICON_HEIGHT / height})`;
                }
            }
        }
    }

    moveCard = (dragIndex, hoverIndex) => {
        const order = [...this.state.order];
        const dragCard = order[dragIndex];
        order.splice(dragIndex, 1);
        order.splice(hoverIndex, 0, dragCard);
        this.setState({ order });
    };

    getWidgetDiv(id, index) {
        const widget = this.props.views[this.props.view].widgets[id];
        const tpl = widget.tpl;
        const _widgetType = this.widgetTypes.find(foundWidgetType => foundWidgetType.name === tpl);
        let widgetLabel = _widgetType?.title || '';
        let widgetColor = _widgetType?.setColor;
        if (_widgetType?.label) {
            widgetLabel = I18n.t(_widgetType.label);
        }
        // remove legacy stuff
        widgetLabel = widgetLabel.split('<br')[0];
        widgetLabel = widgetLabel.split('<span')[0];
        widgetLabel = widgetLabel.split('<div')[0];

        let setLabel = _widgetType?.set;
        if (_widgetType?.setLabel) {
            setLabel = I18n.t(_widgetType.setLabel);
        } else if (setLabel) {
            const widgetWithSetLabel = this.widgetTypes.find(w => w.set === setLabel && w.setLabel);
            if (widgetWithSetLabel) {
                widgetColor = widgetWithSetLabel.setColor;
                setLabel = I18n.t(widgetWithSetLabel.setLabel);
            }
        }

        let widgetIcon = _widgetType?.preview || '';
        if (widgetIcon.startsWith('<img')) {
            const prev = widgetIcon.match(/src="([^"]+)"/);
            if (prev && prev[1]) {
                widgetIcon = prev[1];
            }
        }

        let img;
        if (_widgetType?.preview?.startsWith('<img')) {
            const m = _widgetType?.preview.match(/src="([^"]+)"/) || _widgetType?.preview.match(/src='([^']+)'/);
            if (m) {
                img = <img src={m[1]} className={this.props.classes.icon} alt={id} />;
            }
        } else if (_widgetType?.preview && IMAGE_TYPES.find(ext => _widgetType.preview.toLowerCase().endsWith(ext))) {
            img = <img src={_widgetType?.preview} className={this.props.classes.icon} alt={id} />;
        }

        if (!img) {
            img = <span
                className={this.props.classes.widgetImage}
                ref={this.imageRef[index]}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: _widgetType?.preview }}
            />;
        }

        let widgetBackColor;
        if (widgetColor) {
            widgetBackColor = Utils.getInvertedColor(widgetColor, this.props.themeType, false);
            if (widgetBackColor === '#DDD') {
                widgetBackColor = '#FFF';
            } else if (widgetBackColor === '#111') {
                widgetBackColor = '#000';
            }
        }
        if (tpl === '_tplGroup') {
            widgetLabel = I18n.t('group');
        }
        if (widget.marketplace) {
            setLabel = `${widget.marketplace.name}`;
            widgetLabel = `${I18n.t('version')} ${widget.marketplace.version}`;
        }

        return <Widget
            key={id}
            id={id}
            index={index}
            selected={this.props.wid === id}
            moveCard={this.moveCard}
            onDropped={i => this.onMove(i)}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {widgetIcon ? <div className={this.props.classes.widgetIcon}>{img}</div> : null}
                <div className={this.props.classes.widgetName}>{id}</div>
                <div className={this.props.classes.widgetType}>
                    <div
                        style={{
                            fontWeight: 'bold',
                            color: widgetColor,
                            backgroundColor: widgetBackColor,
                        }}
                        className={Utils.clsx(this.props.classes.widgetNameText, widgetBackColor && this.props.classes.coloredWidgetSet)}
                    >
                        {setLabel}
                    </div>
                    <div className={this.props.classes.widgetNameText}>{widgetLabel}</div>
                </div>
            </div>
        </Widget>;
    }

    onMove(index) {
        if (index !== undefined) {
            // move actual widget to the index
            const order = [...this.state.order];
            const w = order[index];
            order[index] = this.props.wid;
            order[this.state.order.indexOf(this.props.wid)] = w;
            this.setState({ order }, () => {
                if (JSON.stringify(this.state.order) !== JSON.stringify(this.props.order)) {
                    this.props.onClose(this.state.order);
                }
            });
            return;
        }

        if (JSON.stringify(this.state.order) !== JSON.stringify(this.props.order)) {
            this.props.onClose(this.state.order);
        }
    }

    render() {
        return <Menu
            anchorEl={this.props.anchorEl}
            open={!0}
            onClose={() => this.props.onClose()}
        >
            <div
                style={{
                    padding: 21,
                    fontWeight: 'normal',
                    width: 250,
                    fontSize: 12,
                    fontStyle: 'italic',
                    textAlign: 'center',
                }}
            >
                {I18n.t('order_help')}
            </div>
            <DndProvider backend={HTML5Backend}>
                {this.state.order.map((id, i) => this.getWidgetDiv(id, i))}
            </DndProvider>
        </Menu>;
    }
}

VisOrderMenu.propTypes = {
    wid: PropTypes.string,
    view: PropTypes.string,
    anchorEl: PropTypes.object,
    order: PropTypes.array,
    views: PropTypes.object,
    themeType: PropTypes.string,
    onClose: PropTypes.func,
};

export default withStyles(styles)(VisOrderMenu);
