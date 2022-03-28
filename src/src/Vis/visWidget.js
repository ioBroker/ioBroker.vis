import React from 'react';
import PropTypes from 'prop-types';
import { getUsedObjectIDsInWidget } from './visUtils';

class VisWidget extends React.Component {
    constructor(props) {
        super(props);
        this.outputs = {
            IDs: [],
            visibility: {},
            bindings: {},
            lastChanges: {},
            signals: {},
        };

        getUsedObjectIDsInWidget(this.props.views, this.props.view, this.props.id, this.outputs);
    }

    componentDidMount() {
        // subscribe on all IDs
        this.props.subscribe(this.outputs.IDs);
    }

    componentWillUnmount() {
        this.props.unsubscribe(this.outputs.IDs);
    }

    render() {
        return <div id={this.props.id}><pre>{JSON.stringify(this.props.options, null, 2)}</pre></div>;
    }
}

VisWidget.propTypes = {
    options: PropTypes.object,
    id: PropTypes.string,
    views: PropTypes.object,
    view: PropTypes.string,
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
};

export default VisWidget;