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
    }

    componentDidMount() {
        this.setState({ mounted: true });
    }

    render() {
        const rxAbsoluteWidgets = [];
        const rxRelativeWidgets = [];

        if (this.state.mounted) {
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
                        subscribe={this.props.subscribe}
                        unsubscribe={this.props.unsubscribe}
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
                    />;

                    if (isRelative) {
                        rxRelativeWidgets.push(rxWidget);
                    } else {
                        rxAbsoluteWidgets.push(rxWidget);
                    }
                });
            }
        }

        const settings = this.props.views[this.props.view].settings;
        const relativeStyle = {};
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

        return <div ref={this.refView} id={`visview_${this.props.view}`}>
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
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
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
};

export default VisView;
