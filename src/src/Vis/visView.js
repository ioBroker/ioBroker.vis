import React from 'react';
import PropTypes from 'prop-types';
import VisCanWidget from './visCanWidget';

class VisView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mounted: false,
        };

        this.refView = React.createRef();
        this.refRelativeView = React.createRef();
        this.widgetsRefs = {};
    }

    componentDidMount() {
        this.setState({ mounted: true });
    }

    componentWillUnmount() {
        this.widgetsRefs = {};
    }

    onClick(e) {
        e.stopPropagation();
        // deselect all widgets as clicked on none of them
        this.props.setSelectedWidgets([]);
    }

    registerRef = (id, widDiv, refService, onMove, onResize) => {
        this.widgetsRefs[id] = {widDiv, refService, onMove, onResize};
    };

    mouseDown = this.props.runtime ? null : e => {
        e.stopPropagation();

        this.refView.current.addEventListener('mousemove', this.onMouseMove);
        window.document.body.addEventListener('mouseup', this.onMouseUp);

        this.movement = {
            moved: false,
            x: 0,
            y: 0,
        }

        console.log('Mouse down');

        this.props.selectedWidgets.forEach(wid => {
            if (this.widgetsRefs[wid]?.onMove) {
                this.widgetsRefs[wid]?.onMove(); // indicate start of movement
            }
        });
    }

    onMouseUp = !this.props.runtime ? e => {
        e.stopPropagation();
        console.log('Mouse up');
        this.refView.current.removeEventListener('mousemove', this.onMouseMove);
        window.document.body.removeEventListener('mouseup', this.onMouseUp);

        if (this.movement.moved) {
            this.props.selectedWidgets.forEach(wid => {
                if (this.widgetsRefs[wid]?.onMove) {
                    this.widgetsRefs[wid]?.onMove(this.movement.x, this.movement.y, true); // indicate end of movement
                }
            });
        }
    } : null;

    onMouseMove = !this.props.runtime ? e => {
        console.log(`Mouse move: ${e.movementX}, ${e.movementY} ${e.button}`);
        this.movement.moved = true;
        this.movement.x += e.movementX;
        this.movement.y += e.movementY;

        this.props.selectedWidgets.forEach(wid => {
            if (this.widgetsRefs[wid]?.onMove) {
                this.widgetsRefs[wid]?.onMove(this.movement.x, this.movement.y, false);
            }
        });
    } : null;

    render() {
        const rxAbsoluteWidgets = [];
        const rxRelativeWidgets = [];

        if (this.state.mounted && this.props.views) {
            const widgets = this.props.views[this.props.view]?.widgets;
            if (widgets) {
                Object.keys(widgets).forEach(id => {
                    const widget = this.props.views[this.props.view].widgets[id];
                    if (!widget) {
                        return;
                    }

                    if (widget.grouped) {
                        return;
                    }

                    const isRelative = widget.style && (
                        widget.style.position === 'relative' ||
                        widget.style.position === 'static' ||
                        widget.style.position === 'sticky'
                    );

                    const rxWidget = <VisCanWidget
                        key={id}
                        id={id}
                        view={this.props.view}
                        views={this.props.views}
                        can={this.props.can}
                        canStates={this.props.canStates}
                        userGroups={this.props.userGroups}
                        editMode={this.props.editMode}
                        user={this.props.user}
                        allWidgets={this.props.allWidgets}
                        jQuery={this.props.jQuery}
                        socket={this.props.socket}
                        isRelative={isRelative}
                        viewsActiveFilter={this.props.viewsActiveFilter}
                        setValue={this.props.setValue}
                        $$={this.props.$$}
                        refParent={isRelative ? this.refRelativeView : this.refView}
                        linkContext={this.props.linkContext}
                        formatUtils={this.props.formatUtils}
                        selectedWidgets={this.props.selectedWidgets}
                        setSelectedWidgets={this.props.setSelectedWidgets}
                        runtime={this.props.runtime}
                        mouseDownOnView={this.mouseDown}
                        registerRef={this.props.runtime ? null : this.registerRef}
                        onWidgetsChanged={this.props.onWidgetsChanged}
                    />;

                    if (isRelative) {
                        rxRelativeWidgets.push(rxWidget);
                    } else {
                        rxAbsoluteWidgets.push(rxWidget);
                    }
                });
            }
        }

        const relativeStyle = {};
        if (this.props.views && this.props.views[this.props.view]) {
            const settings = this.props.views[this.props.view].settings;
            // this was only if this.props.editMode
            if (rxRelativeWidgets.length && settings.sizex) {
                let ww = settings.sizex;
                let hh = settings.sizey;
                if (parseFloat(ww).toString() === ww.toString()) {
                    ww = parseFloat(ww);
                }
                if (parseFloat(hh).toString() === hh.toString()) {
                    hh = parseFloat(hh);
                }

                if (typeof ww === 'number' || ww.match(/\d$/)) {
                    ww += 'px';
                }
                if (typeof hh === 'number' || hh.match(/\d$/)) {
                    hh += 'px';
                }
                relativeStyle.width = ww;
                relativeStyle.height = hh;
            }
        }

        const style = {
            width: '100%',
            height: '100%',
        };

        return <div
            ref={this.refView}
            id={`visview_${this.props.view}`}
            onClick={!this.props.runtime ? e => this.props.editMode && this.onClick(e) : undefined}
            style={style}
        >
            {rxRelativeWidgets.length ?
                <div ref={this.refRelativeView} style={relativeStyle}>
                    { rxRelativeWidgets }
                </div>
                : null}
            { rxAbsoluteWidgets }
        </div>;
    }
}

VisView.propTypes = {
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    can: PropTypes.object.isRequired,
    canStates: PropTypes.object.isRequired,
    editMode: PropTypes.bool,
    user: PropTypes.string,
    userGroups: PropTypes.object,
    allWidgets: PropTypes.object,
    jQuery: PropTypes.func,
    socket: PropTypes.object,
    viewsActiveFilter: PropTypes.object,
    setValue: PropTypes.func,
    $$: PropTypes.func, // Gestures library
    linkContext: PropTypes.object,
    formatUtils: PropTypes.object,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    runtime: PropTypes.bool,
    onWidgetsChanged: PropTypes.func,
};

export default VisView;
