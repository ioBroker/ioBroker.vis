/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2022-2025 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React from 'react';

import { Tab, Tabs } from '@mui/material';
import { Icon } from '@iobroker/adapter-react-v5';

import type { RxRenderWidgetProps, RxWidgetInfo, WidgetData } from '@iobroker/types-vis-2';
import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';

interface RxData extends WidgetData {
    show_tabs: number;
    vertical: boolean;
    variant: '' | 'centered' | 'fullWidth';
    color: string;
    [key: `title_tab_${number}`]: string;
    [key: `contains_view_${number}`]: string;
    [key: `icon_tab_${number}`]: string;
    [key: `image_tab_${number}`]: string;
    [key: `icon_size_${number}`]: number;
    [key: `icon_color_${number}`]: string;
    [key: `overflow_x_${number}`]: '' | 'visible' | 'hidden' | 'scroll' | 'auto' | 'initial' | 'inherit';
    [key: `overflow_y_${number}`]: '' | 'visible' | 'hidden' | 'scroll' | 'auto' | 'initial' | 'inherit';
}

interface TabsSliderTabsState extends VisRxWidgetState {
    tabIndex: number;
}

class TabsSliderTabs extends VisRxWidget<RxData, TabsSliderTabsState> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplSTab',
            visSet: 'tabs',
            visName: 'SliderTabs',
            visSetLabel: 'Tabs',
            visPrev: 'widgets/tabs/img/Prev_SliderTabs.png',
            visWidgetLabel: 'vis_2_widgets_widgets_tabs_label', // Label of widget
            visSetIcon: 'widgets/tabs/img/Prev_SliderTabs.png', // Icon of a widget set
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'show_tabs',
                            type: 'slider',
                            min: 1,
                            max: 20,
                            label: 'vis_2_widgets_widgets_tabs_show_tabs',
                            default: 2,
                        },
                        {
                            name: 'vertical',
                            type: 'checkbox',
                            label: 'vis_2_widgets_widgets_tabs_vertical',
                        },
                        {
                            name: 'variant',
                            type: 'select',
                            label: 'vis_2_widgets_widgets_tabs_variant',
                            hidden: '!!data.vertical',
                            options: [
                                { value: '', label: 'vis_2_widgets_widgets_tabs_variant_default' },
                                { value: 'centered', label: 'vis_2_widgets_widgets_tabs_variant_centered' },
                                { value: 'fullWidth', label: 'vis_2_widgets_widgets_tabs_variant_full_width' },
                            ],
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'vis_2_widgets_widgets_tabs_color',
                        },
                    ],
                },
                {
                    name: 'node',
                    label: 'vis_2_widgets_widgets_tabs_group_tab',
                    indexFrom: 1,
                    indexTo: 'show_tabs',
                    fields: [
                        {
                            name: 'title_tab_',
                            label: 'vis_2_widgets_widgets_tabs_tab_title',
                        },
                        {
                            name: 'contains_view_',
                            multiple: false,
                            type: 'select-views',
                            label: 'vis_2_widgets_widgets_tabs_tab_view',
                        },
                        {
                            name: 'icon_tab_',
                            type: 'icon64',
                            label: 'vis_2_widgets_widgets_tabs_tab_icon',
                            hidden: '!!data["image_tab_" + index"]',
                        },
                        {
                            name: 'image_tab_',
                            type: 'image',
                            label: 'vis_2_widgets_widgets_tabs_tab_image',
                            hidden: '!!data["icon_tab_" + index"]',
                        },
                        {
                            name: 'icon_size_',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            label: 'vis_2_widgets_widgets_tabs_tab_icon_size',
                            hidden: '!data["icon_tab_" + index"] && !data["image_tab_" + index"]',
                        },
                        {
                            name: 'icon_color_',
                            type: 'color',
                            label: 'vis_2_widgets_widgets_tabs_tab_icon_color',
                            hidden: '!data["icon_tab_" + index"]',
                        },
                        {
                            name: 'overflow_x_',
                            label: 'vis_2_widgets_widgets_tabs_tab_overflow_x',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'],
                        },
                        {
                            name: 'overflow_y_',
                            label: 'vis_2_widgets_widgets_tabs_tab_overflow_y',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'],
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 250,
                height: 250,
            },
        } as const;
    }

    componentDidMount(): void {
        super.componentDidMount();
        const tabIndexStr = window.localStorage.getItem(`${this.props.id}-tabIndex`);
        let tabIndex = 0;
        if (tabIndexStr) {
            tabIndex = parseInt(tabIndexStr, 10) || 0;
        }
        this.setState({ tabIndex });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return TabsSliderTabs.getWidgetInfo();
    }

    getWidgetView(): React.JSX.Element {
        const view = this.state.rxData[`contains_view_${this.state.tabIndex + 1}`];
        const style: React.CSSProperties = {
            flex: 1,
            position: 'relative',
        };
        const overflowX = this.state.rxData[`overflow_x_${this.state.tabIndex + 1}`];
        const overflowY = this.state.rxData[`overflow_y_${this.state.tabIndex + 1}`];

        if (overflowX && overflowY) {
            if (overflowY === overflowX) {
                style.overflow = overflowX;
            } else {
                style.overflowX = overflowX;
                style.overflowY = overflowY;
            }
        } else if (overflowX) {
            style.overflowX = overflowX;
        } else if (overflowY) {
            style.overflowY = overflowY;
        } else {
            style.overflow = 'hidden';
        }

        return (
            <div
                className="vis-widget-body"
                style={style}
            >
                {this.state.editMode ? <div className="vis-editmode-helper" /> : null}
                {view ? super.getWidgetView(view) : null}
            </div>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        // set default width and height
        if (props.style.width === undefined) {
            props.style.width = 250;
        }
        if (props.style.height === undefined) {
            props.style.height = 250;
        }

        const tabs = [];
        for (let t = 0; t < parseInt(this.state.rxData.show_tabs as unknown as string, 10); t++) {
            const color = this.state.rxData[`icon_color_${t + 1}`];
            const icon = this.state.rxData[`icon_tab_${t + 1}`];
            let image = this.state.rxData[`image_tab_${t + 1}`];
            const size = this.state.rxData[`icon_size_${t + 1}`];
            const title = this.state.rxData[`title_tab_${t + 1}`];
            if (image && image.startsWith('_PRJ_NAME/')) {
                image = image.replace(
                    '_PRJ_NAME/',
                    `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`,
                );
            }

            tabs.push(
                <Tab
                    label={title || (icon || image ? '' : `Tab ${t + 1}`)}
                    icon={
                        icon ? (
                            <Icon
                                src={icon}
                                style={{ color, width: size, height: size }}
                            />
                        ) : image ? (
                            <Icon
                                src={image}
                                style={{ width: size, height: size }}
                            />
                        ) : null
                    }
                    iconPosition="start"
                    value={t}
                    key={t.toString()}
                    style={{ color: this.state.rxData.color, textTransform: 'none' }}
                    wrapped
                />,
            );
        }

        return (
            <div
                className="vis-widget-body"
                style={{
                    display: 'flex',
                    flexDirection: this.state.rxData.vertical ? 'row' : 'column',
                }}
            >
                <div style={{ width: '100%', overflow: 'hidden' }}>
                    <Tabs
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: this.state.rxData.color,
                            },
                        }}
                        value={this.state.tabIndex || 0}
                        onChange={(_e, tabIndex) => {
                            window.localStorage.setItem(`${this.props.id}-tabIndex`, tabIndex.toString());
                            this.setState({ tabIndex });
                        }}
                        scrollButtons="auto"
                        centered={this.state.rxData.variant === 'centered'}
                        variant={
                            this.state.rxData.variant === 'fullWidth'
                                ? 'fullWidth'
                                : this.state.rxData.variant === 'centered'
                                  ? undefined
                                  : 'scrollable'
                        }
                        orientation={this.state.rxData.vertical ? 'vertical' : undefined}
                    >
                        {tabs}
                    </Tabs>
                </div>
                {this.getWidgetView()}
            </div>
        );
    }
}

export default TabsSliderTabs;
