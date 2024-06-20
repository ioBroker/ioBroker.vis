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

import type React from 'react';

import { I18n } from '@iobroker/adapter-react-v5';

import type {
    GetRxDataFromWidget,
    RxRenderWidgetProps,
    RxWidgetInfo,
    WidgetData,
    RxWidgetInfoAttributesField,
    Project,
    SingleWidget,
    SingleWidgetId,
    RxWidgetInfoAttributesFieldHelp,
    RxWidgetInfoGroup,
    RxWidgetInfoAttributesFieldSelect, RxWidgetInfoAttributesFieldText,
} from '@iobroker/types-vis-2';

import VisView from '@/Vis/visView';

// eslint-disable-next-line import/no-cycle
import type { VisRxWidgetState } from '../../visRxWidget';
import VisRxWidget from '../../visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicGroup>;

interface BasicGroupState extends VisRxWidgetState {
    mounted: boolean;
}

interface RxWidgetInfoGroupReadWrite extends RxWidgetInfoGroup {
    /** Fields of this attribute section */
    fields: RxWidgetInfoAttributesField[];
}

class BasicGroup extends VisRxWidget<RxData, BasicGroupState> {
    static getWidgetInfo() {
        return {
            id: '_tplGroup',
            visSet: 'basic',
            visName: 'Group',
            visPrev: '',
            visAttrs: [
                {
                    name: 'common',
                    fields: [],
                },
            ] as RxWidgetInfoGroupReadWrite[],
            _visAttrs: (data: Record<string, any>, views: Project, view: string) => { // this will be dynamically rendered in src/src/Attributes/Widget/index.jsx => Widget class
                // Try to find all fields where could be groupAttrX
                const listOfWidgets: SingleWidgetId[] = data.members;
                const attributes: string[] = [];

                listOfWidgets.forEach(wid => {
                    const widgetData: WidgetData | undefined = (views[view].widgets[wid] as SingleWidget)?.data;
                    widgetData && Object.keys(widgetData).forEach(attr => {
                        if (typeof widgetData[attr] === 'string') {
                            let ms = widgetData[attr].match(/(groupAttr\d+)+?/g);
                            if (ms) {
                                ms.forEach((m: string) => !attributes.includes(m) && attributes.push(m));
                            }

                            // new style: {html}, {myAttr}, ...
                            ms = widgetData[attr].match(/%([-_a-zA-Z\d]+)+?%/g);
                            if (ms) {
                                ms.forEach((m: string) => {
                                    const _attr = m.substring(1, m.length - 1);
                                    !attributes.includes(_attr) && attributes.push(_attr);
                                });
                            }
                        }
                    });
                });

                const common: RxWidgetInfoGroupReadWrite = {
                    name: 'common',
                    fields: [
                        {
                            name: 'group_hint',
                            label: 'group_hint',
                            type: 'help',
                            text: 'group_help',
                        } as RxWidgetInfoAttributesFieldHelp,
                    ],
                };

                const objects: RxWidgetInfoGroupReadWrite = {
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
                    } as RxWidgetInfoAttributesField);
                    // add to objects
                    objects.fields.push({
                        name: `attrName_${attrName}`,
                        title: `${I18n.t('group_attrName')} [${attrName}]`,
                        type: 'text',
                    } as RxWidgetInfoAttributesFieldText);
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
                    } as RxWidgetInfoAttributesFieldSelect);
                }

                return groupFields;
            },
        };
    }

    async componentDidMount() {
        await super.componentDidMount();
        this.setState({ mounted: true });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        // render dynamical attributes
        const info = BasicGroup.getWidgetInfo();
        info.visAttrs = info._visAttrs(
            this.props.context.views[this.props.view].widgets[this.props.id].data,
            this.props.context.views,
            this.props.view,
        );
        delete info._visAttrs;
        return info as RxWidgetInfo;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        const context = this.props.context;
        super.renderWidgetBody(props);
        const widget = context.views[this.props.view].widgets[this.props.id];

        if (this.props.id === this.props.selectedGroup) {
            props.style.overflow = 'visible';
        }

        const groupWidgets = [...(widget?.data?.members || [])];
        let rxGroupWidgets: (React.JSX.Element | null)[] | null = null;

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        if (groupWidgets?.length && this.state.mounted) {
            // first relative, then absolute
            groupWidgets.sort((a, b) => {
                const widgetA = context.views[this.props.view].widgets[a];
                const widgetB = context.views[this.props.view].widgets[b];
                const isRelativeA = widgetA?.style && (
                    widgetA.style.position === 'relative' ||
                    widgetA.style.position === 'static'   ||
                    widgetA.style.position === 'sticky'
                );
                const isRelativeB = widgetB?.style && (
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
                return VisView.getOneWidget(index, _widget, {
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
                    refParent: props.refService as React.RefObject<HTMLElement>,
                    relativeWidgetOrder: groupWidgets,
                    viewsActiveFilter: this.props.viewsActiveFilter,
                    customSettings: this.props.customSettings,
                });
            });
        }

        return rxGroupWidgets as any as React.JSX.Element;
    }
}

export default BasicGroup;
