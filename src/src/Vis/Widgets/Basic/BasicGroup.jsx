/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
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

import { I18n } from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class BasicGroup extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: '_tplGroup',
            visSet: 'basic',
            visAttrs: (data, onChange, context) => { // this will be dynamically rendered in src/src/Attributes/Widget/index.jsx => Widget class
                // Try to find all fields where could be groupAttrX
                const listOfWidgets = data.members;
                const attributes = [];

                listOfWidgets.forEach(wid => {
                    const widgetData = context.views[context.view].widgets[wid]?.data;
                    widgetData && Object.keys(widgetData).forEach(attr => {
                        if (typeof widgetData[attr] === 'string') {
                            let ms = widgetData[attr].match(/(groupAttr\d+)+?/g);
                            if (ms) {
                                ms.forEach(m => !attributes.includes(m) && attributes.push(m));
                            }

                            // new style: {html}, {myAttr}, ...
                            ms = widgetData[attr].match(/%([-_a-zA-Z\d]+)+?%/g);
                            if (ms) {
                                ms.forEach(m => {
                                    const _attr = m.substring(1, m.length - 1);
                                    !attributes.includes(_attr) && attributes.push(_attr);
                                });
                            }
                        }
                    });
                });

                const common = {
                    name: 'common',
                    fields: [{
                        name: 'group_hint',
                        label: 'group_hint',
                        type: 'help',
                        text: 'group_help',
                    }],
                };
                const objects = {
                    name: 'objects',
                    label: 'group_fields',
                    fields: [],
                };

                const groupFields = [common, objects];

                for (let i = 0; i < attributes.length; i++) {
                    const attrName = attributes[i];
                    const num = attrName.startsWith('groupAttr') ? parseInt(attrName.substring(9), 10) : 0;
                    // Add to common
                    common.fields.push({
                        name: attrName,
                        title: data[`attrName_${attrName}`] || data[`attrName${num}`] || attrName,
                        type: data[`attrType_${attrName}`] || data[`attrType${num}`] || '',
                    });
                    // add to objects
                    objects.fields.push({
                        name: `attrName_${attrName}`,
                        title: `${I18n.t('group_attrName')} [${attrName}]`,
                        type: '',
                    });
                    objects.fields.push({
                        name: `attrType_${attrName}`,
                        title: `${I18n.t('group_attrType')} [${attrName}]`,
                        type: 'select',
                        noTranslation: true,
                        options: [
                            '',
                            'text',
                            'checkbox',
                            'number',
                            'html',
                            'image',
                            'icon',
                            'icon64',
                            'id',
                            'color',
                            'views',
                            'widget',
                            'history',
                            'password',
                            'fontname',
                            'widget',
                            'groups',
                            'class',
                            'filters',
                            'json',
                        ],
                    });
                }

                return groupFields;
            },
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.setState({ mounted: true });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        // render dynamical attributes
        const info = BasicGroup.getWidgetInfo();
        info.visAttrs = info.visAttrs(this.props.context.views[this.props.view].widgets[this.props.id].data, null, {
            views: this.props.context.views,
            view: this.props.view,
            socket: this.props.context.socket,
            themeType: this.props.context.themeType,
            projectName: this.props.context.projectName,
            adapterName: this.props.context.adapterName,
            instance: this.props.context.instance,
            id: this.props.id,
            widget: this.props.context.views[this.props.view].widgets[this.props.id],
        });
        return info;
    }

    renderWidgetBody(props) {
        const context = this.props.context;
        super.renderWidgetBody(props);
        const widget = context.views[this.props.view].widgets[this.props.id];

        if (this.props.id === this.props.selectedGroup) {
            props.style.overflow = 'visible';
        }

        const groupWidgets = [...(widget?.data?.members || [])];
        let rxGroupWidgets = null;

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        if (groupWidgets?.length && this.state.mounted) {
            // first relative, then absolute
            groupWidgets.sort((a, b) => {
                const widgetA = context.views[this.props.view].widgets[a] || {};
                const widgetB = context.views[this.props.view].widgets[b] || {};
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
                const _widget = context.views[this.props.view].widgets[id];
                if (!_widget) {
                    return null;
                }

                const isRelative = _widget.style && (
                    _widget.style.position === 'relative' ||
                    _widget.style.position === 'static' ||
                    _widget.style.position === 'sticky'
                );

                // use the same container for relative and absolute widgets (props.refService)
                return this.props.context.VisView.getOneWidget(index, _widget, {
                    selectedGroup: this.props.selectedGroup,
                    selectedWidgets: this.props.selectedWidgets,
                    context: this.props.context,
                    editMode: this.props.editMode,
                    moveAllowed: this.props.moveAllowed,
                    mouseDownOnView: this.props.mouseDownOnView,
                    index,
                    id,
                    view: this.props.view,
                    isRelative,
                    askView: this.props.askView,
                    refParent: props.refService,
                    relativeWidgetOrder: groupWidgets,
                    viewsActiveFilter: this.props.viewsActiveFilter,
                    customSettings: this.props.customSettings,
                });
            });
        }

        return rxGroupWidgets;
    }
}

BasicGroup.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicGroup;
