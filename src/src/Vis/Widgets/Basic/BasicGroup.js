/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022 bluefox https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import PropTypes from 'prop-types';
import VisRxWidget from '../../visRxWidget';

class BasicGroup extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: '_tplGroup',
            visSet: 'basic',
            visAttrs: 'attrCount[1]/slider,0,20,1;group.objects;attrName(1-attrCount)//onAttrChanged;attrType(1-attrCount)/select,,id,checkbox,image,color,views,html,widget,history/onAttrChanged;',
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.setState({ mounted: true });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicGroup.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const widget = this.props.views[this.props.view].widgets[this.props.id];

        const groupWidgets = widget?.data?.members;
        let rxGroupWidgets = null;

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        if (groupWidgets?.length && this.state.mounted) {
            rxGroupWidgets = groupWidgets.map(id => {
                const _widget = this.props.views[this.props.view].widgets[id];
                if (!_widget) {
                    return null;
                }

                // use same container for relative and absolute widgets (props.refService)
                const { rxWidget } = this.props.VisView.getOneWidget(this.props, id, _widget, this.props.registerRef, props.refService, props.refService);
                return rxWidget;
            });
        }

        return rxGroupWidgets;
    }
}

BasicGroup.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicGroup;
