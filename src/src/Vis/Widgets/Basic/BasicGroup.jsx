/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 bluefox https://github.com/GermanBluefox,
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
            // visAttrs: 'attrCount[1]/slider,0,20,1;group.objects;attrName(1-attrCount)//onAttrChanged;attrType(1-attrCount)/select,,id,checkbox,image,color,views,html,widget,history/onAttrChanged;',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'objects',
                        singleName: 'objects',
                        fields: [{
                            name: 'attrCount',
                            type: 'slider',
                            min: 1,
                            max: 19,
                            step: 1,
                        }],
                    },
                ],
                // todo: implement autodetect of attributes
            }],
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

        if (this.props.id === this.props.selectedGroup) {
            props.style.overflow = 'visible';
        }

        const groupWidgets = [...(widget?.data?.members || [])];
        let rxGroupWidgets = null;

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        if (groupWidgets?.length && this.state.mounted) {
            // first relative, then absolute
            groupWidgets.sort((a, b) => {
                const widgetA = this.props.views[this.props.view].widgets[a];
                const widgetB = this.props.views[this.props.view].widgets[b];
                const isRelativeA = widgetA.style && (
                    widgetA.style.position === 'relative' ||
                    widgetA.style.position === 'static'   ||
                    widgetA.style.position === 'sticky'
                );
                const isRelativeB = widgetB.style && (
                    widgetB.style.position === 'relative' ||
                    widgetB.style.position === 'static'   ||
                    widgetB.style.position === 'sticky'
                );
                if (isRelativeA && isRelativeB) {
                    return 0;
                }
                if (isRelativeA) {
                    return -1;
                }
                return 1;
            });

            rxGroupWidgets = groupWidgets.map((id, index) => {
                const _widget = this.props.views[this.props.view].widgets[id];
                if (!_widget) {
                    return null;
                }
                if (this.props.selectedGroup) {
                    return null;
                }
                const isRelative = _widget.style && (
                    _widget.style.position === 'relative' ||
                    _widget.style.position === 'static' ||
                    _widget.style.position === 'sticky'
                );

                // use the same container for relative and absolute widgets (props.refService)
                return this.props.VisView.getOneWidget({
                    props: this.props,
                    index,
                    id,
                    widget: _widget,
                    registerRef: this.props.registerRef,
                    isRelative,
                    refParent: props.refService,
                    relativeWidgetOrder: groupWidgets,
                });
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
