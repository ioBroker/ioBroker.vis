import React from 'react';

import { type SelectChangeEvent, TextField } from '@mui/material';

import { Close as CloseIcon } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import { background, theme as ViewTheme } from '@/Attributes/ViewData';
import { store } from '@/Store';
import type { Project, View } from '@iobroker/types-vis-2';
import commonStyles from '@/Utils/styles';

export interface Field {
    label: string;
    attr: string;
    type: string;
    options?: { label: string; value: string }[];
    field: string;
    itemModify?: (item: any) => React.JSX.Element;
    renderValue?: (value: string | number) => React.JSX.Element;
    hidden?: boolean | string | ((settings: Record<string, any>) => boolean);
    notStyle?: boolean;
    clearButton?: boolean;
    applyToAll?: boolean;
    groupApply?: boolean;
    noTranslation?: boolean;
    title?: string;
    min?: number;
    max?: number;
    step?: number;
    Component?: React.JSX.Element;
    disabled?: boolean | string | ((settings: Record<string, any>) => boolean);
    error?: string | ((settings: Record<string, any>) => boolean);
    width?: number;
    value?: any;
    onChange?: (e: SelectChangeEvent<string | number>) => void;
    marks?:
        | boolean
        | {
              value: number;
              label?: string;
          }[];
    valueLabelDisplay?: 'on' | 'auto' | 'off';
}

export interface FieldGroup {
    label: string;
    fields: Field[];
    hidden?: string | ((settings: Record<string, any>) => boolean);
}

export const resolution = [
    { value: 'none', label: 'not defined' },
    { value: 'user', label: 'User defined' },
    { value: '375x667', label: 'iPhone SE - Portrait' },
    { value: '667x375', label: 'iPhone SE - Landscape' },
    { value: '414x896', label: 'iPhone XR - Portrait' },
    { value: '896x414', label: 'iPhone XR - Landscape' },
    { value: '390x844', label: 'iPhone 12 Pro - Portrait' },
    { value: '844x390', label: 'iPhone 12 Pro - Landscape' },
    { value: '393x851', label: 'Pixel 5 - Portrait' },
    { value: '851x393', label: 'Pixel 5 - Landscape' },
    { value: '360x740', label: 'Samsung Galaxy S8+ - Portrait' },
    { value: '740x360', label: 'Samsung Galaxy S8+ - Landscape' },
    { value: '412x915', label: 'Samsung Galaxy S20 Ultra - Portrait' },
    { value: '915x412', label: 'Samsung Galaxy S20 Ultra - Landscape' },
    { value: '820x1180', label: 'iPad Air - Portrait' },
    { value: '1180x820', label: 'iPad Air - Landscape' },
    { value: '768x1024', label: 'iPad Mini - Portrait' },
    { value: '1024x768', label: 'iPad Mini - Landscape' },
    { value: '1024x1366', label: 'iPad Pro - Portrait' },
    { value: '1366x1024', label: 'iPad Pro - Landscape' },
    { value: '912x1368', label: 'Surface Pro 7 - Portrait' },
    { value: '1368x912', label: 'Surface Pro 7 - Landscape' },
    { value: '540x720', label: 'Surface Duo - Portrait' },
    { value: '720x540', label: 'Surface Duo - Landscape' },
    { value: '280x653', label: 'Galaxy Fold - Portrait' },
    { value: '653x280', label: 'Galaxy Fold - Landscape' },
    { value: '412x914', label: 'Samsung Galaxy A51/71 - Portrait' },
    { value: '914x412', label: 'Samsung Galaxy A51/71 - Landscape' },
    { value: '600x1024', label: 'Nest Hub - Portrait' },
    { value: '1024x600', label: 'Nest Hub - Landscape' },
    { value: '800x1280', label: 'Nest Hub Max - Portrait' },
    { value: '1280x800', label: 'Nest Hub Max - Landscape' },
    { value: '720x1280', label: 'HD - Portrait' },
    { value: '1280x720', label: 'HD - Landscape' },
    { value: '1080x1920', label: 'Full HD - Portrait' },
    { value: '1920x1080', label: 'Full HD - Landscape' },
];

export function getFields(
    resolutionSelect: string,
    view: View,
    selectedView: string,
    editMode: boolean,
    changeProject: (project: Project) => void,
): FieldGroup[] {
    return [
        {
            label: 'CSS Common',
            fields: [
                {
                    label: 'display',
                    attr: 'display',
                    type: 'select',
                    options: [
                        { label: 'flex', value: 'flex' },
                        { label: 'block', value: 'block' },
                    ],
                    noTranslation: true,
                    title: 'For widgets with relative position',
                },
                { label: 'Comment', attr: 'comment', notStyle: true },
                { label: 'CSS Class', attr: 'class', notStyle: true },
                {
                    label: 'Initial filter',
                    attr: 'filterkey',
                    notStyle: true,
                    type: 'filter',
                },
                {
                    label: 'Only for groups',
                    attr: 'group',
                    notStyle: true,
                    type: 'groups',
                    title: 'This view will be shown only to defined groups',
                },
                {
                    label: 'Theme',
                    attr: 'theme',
                    notStyle: true,
                    type: 'select',
                    options: ViewTheme,
                    noTranslation: true,
                },
                {
                    label: 'If user not in group',
                    attr: 'group_action',
                    notStyle: true,
                    type: 'select',
                    options: [
                        { label: 'Disabled', value: 'disabled' },
                        { label: 'Hide', value: 'hide' },
                    ],
                },
            ] as Field[],
        },
        {
            label: 'CSS background (background-...)',
            fields: [
                {
                    label: 'Image',
                    attr: 'bg-image',
                    type: 'image',
                    hidden: 'data.useBackground || (data.style && (!!data.style.background_class || !!data.style["background-color"] || !!data.style["background-image"] || !!data.style["background-size"] || !!data.style["background-repeat"] || !!data.style["background-position"] || !!data.style["background-attachment"]))',
                    notStyle: true,
                },
                {
                    label: 'Position left',
                    attr: 'bg-position-x',
                    type: 'slider',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                    min: -100,
                    max: 500,
                },
                {
                    label: 'Position top',
                    attr: 'bg-position-y',
                    type: 'slider',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                    min: -100,
                    max: 500,
                },
                {
                    label: 'Width',
                    attr: 'bg-width',
                    type: 'text',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    label: 'Height',
                    attr: 'bg-height',
                    type: 'text',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    label: 'Color',
                    attr: 'bg-color',
                    type: 'color',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    label: 'Background class',
                    type: 'select',
                    options: background,
                    attr: 'background_class',
                    itemModify: item => (
                        <>
                            <span
                                style={commonStyles.backgroundClassSquare}
                                className={item.value}
                            />
                            {I18n.t(item.label)}
                        </>
                    ),
                    renderValue: (value: string) => {
                        const backItem = background.find(item => item?.value === value);
                        return (
                            <div style={commonStyles.backgroundClass}>
                                <span
                                    style={commonStyles.backgroundClassSquare}
                                    className={value}
                                />
                                {I18n.t(backItem?.label || value)}
                            </div>
                        );
                    },
                    hidden: '!!data["bg-image"]',
                },
                {
                    label: 'One parameter',
                    type: 'checkbox',
                    attr: 'useBackground',
                    notStyle: true,
                    hidden: '!!data.background_class || !!data["bg-image"]',
                },
                {
                    label: 'background',
                    attr: 'background',
                    hidden: '!data.useBackground || !!data.background_class || !!data["bg-image"]',
                },
                {
                    label: '-color',
                    type: 'color',
                    attr: 'background-color',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                },
                {
                    label: '-image',
                    attr: 'background-image',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                },
                {
                    label: '-repeat',
                    type: 'autocomplete',
                    attr: 'background-repeat',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit'],
                },
                {
                    label: '-attachment',
                    attr: 'background-attachment',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['scroll', 'fixed', 'local', 'initial', 'inherit'],
                },
                {
                    label: '-position',
                    attr: 'background-position',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: [
                        'left top',
                        'left center',
                        'left bottom',
                        'right top',
                        'right center',
                        'right bottom',
                        'center top',
                        'center center',
                        'center bottom',
                        'initial',
                        'inherit',
                    ],
                },
                {
                    label: '-size',
                    attr: 'background-size',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['auto', 'cover', 'contain', 'initial', 'inherit'],
                },
                {
                    label: '-clip',
                    attr: 'background-clip',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                },
                {
                    label: '-origin',
                    attr: 'background-origin',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                },
            ] as Field[],
        },
        {
            label: 'CSS Font & Text',
            fields: [
                { label: 'color', type: 'color', attr: 'color' },
                { label: 'text-shadow', attr: 'text-shadow' },
                { label: 'font-family', attr: 'font-family' },
                { label: 'font-style', attr: 'font-style' },
                { label: 'font-variant', attr: 'font-variant' },
                { label: 'font-weight', attr: 'font-weight' },
                { label: 'font-size', attr: 'font-size' },
                { label: 'line-height', attr: 'line-height' },
                { label: 'letter-spacing', attr: 'letter-spacing' },
                { label: 'word-spacing', attr: 'word-spacing' },
            ] as Field[],
        },
        {
            label: 'Options',
            fields: [
                {
                    type: 'checkbox',
                    label: 'Default',
                    attr: 'useAsDefault',
                    notStyle: true,
                },
                {
                    type: 'checkbox',
                    label: 'Render always',
                    attr: 'alwaysRender',
                    notStyle: true,
                },
                {
                    type: 'select',
                    label: 'Grid',
                    attr: 'snapType',
                    options: [
                        { label: 'Disabled', value: 0 },
                        { label: 'Elements', value: 1 },
                        { label: 'Grid', value: 2 },
                    ],
                    notStyle: true,
                },
                {
                    type: 'color',
                    label: 'Grid color',
                    attr: 'snapColor',
                    hidden: 'data.snapType !== 2',
                    notStyle: true,
                },
                {
                    type: 'number',
                    label: 'Grid size',
                    attr: 'gridSize',
                    notStyle: true,
                    hidden: 'data.snapType !== 2',
                },
                {
                    type: 'select',
                    label: 'Resolution',
                    options: resolution,
                    width: 236,
                    value: resolutionSelect,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const project = JSON.parse(JSON.stringify(store.getState().visProject));
                        if (e.target.value === 'none') {
                            delete project[selectedView].settings.sizex;
                            delete project[selectedView].settings.sizey;
                            delete project[selectedView].settings.resolution;
                        } else if (e.target.value === 'user') {
                            project[selectedView].settings.sizex = project[selectedView].settings.sizex || 0;
                            project[selectedView].settings.sizey = project[selectedView].settings.sizey || 0;
                            project[selectedView].settings.resolution = e.target.value || 'none';
                            // const _resolutionSelectX = `${project[selectedView].settings.sizex}x${project[selectedView].settings.sizey}`;
                            // if (resolution.find(item => item.value === _resolutionSelectX)) {
                            //     project[selectedView].settings.sizex++;
                            // }
                        } else {
                            const match = e.target.value.match(/^([0-9]+)x([0-9]+)$/);
                            if (match) {
                                project[selectedView].settings.sizex = match[1];
                                project[selectedView].settings.sizey = match[2];
                                project[selectedView].settings.resolution = e.target.value || 'none';
                            }
                        }
                        changeProject(project);
                    },
                    notStyle: true,
                },
                {
                    type: 'raw',
                    label: 'Width x height (px)',
                    hidden: 'data.sizex === undefined && data.sizey === undefined',
                    Component: (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                variant="standard"
                                value={view.settings?.sizex === undefined ? '' : view.settings.sizex}
                                disabled={!editMode || view.settings.resolution !== 'user'}
                                slotProps={{
                                    input: {
                                        sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                                    },
                                }}
                                onChange={e => {
                                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                    project[selectedView].settings.sizex = e.target.value;
                                    changeProject(project);
                                }}
                            />
                            <CloseIcon
                                fontSize="small"
                                style={{
                                    padding: '0px 10px',
                                }}
                            />
                            <TextField
                                variant="standard"
                                value={view.settings?.sizey === undefined ? '' : view.settings.sizey}
                                disabled={!editMode || view.settings.resolution !== 'user'}
                                slotProps={{
                                    input: {
                                        sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                                    },
                                }}
                                onChange={e => {
                                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                    project[selectedView].settings.sizey = e.target.value;
                                    changeProject(project);
                                }}
                            />
                        </span>
                    ),
                    notStyle: true,
                },
                {
                    type: 'checkbox',
                    label: 'Limit screen',
                    attr: 'limitScreen',
                    hidden: 'data.sizex === undefined && data.sizey === undefined',
                    notStyle: true,
                },
                {
                    type: 'text',
                    label: 'Limit only for instances',
                    attr: 'limitForInstances',
                    hidden: '!data.limitScreen',
                    title: 'Enter the browser instances divided by comma',
                    notStyle: true,
                },
                {
                    type: 'checkbox',
                    label: 'Only for desktop',
                    attr: 'limitScreenDesktop',
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen',
                    notStyle: true,
                },
                {
                    type: 'slider',
                    label: 'Limit border width',
                    attr: 'limitScreenBorderWidth',
                    min: 0,
                    max: 20,
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen',
                    notStyle: true,
                },
                {
                    type: 'color',
                    label: 'Limit border color',
                    attr: 'limitScreenBorderColor',
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen || !data.limitScreenBorderWidth',
                    notStyle: true,
                },
                {
                    type: 'select',
                    label: 'Limit border style',
                    attr: 'limitScreenBorderStyle',
                    noTranslation: true,
                    options: [
                        { label: 'solid', value: 'solid' },
                        { label: 'dotted', value: 'dotted' },
                        { label: 'dashed', value: 'dashed' },
                        { label: 'double', value: 'double' },
                        { label: 'groove', value: 'groove' },
                        { label: 'ridge', value: 'ridge' },
                        { label: 'inset', value: 'inset' },
                        { label: 'outset', value: 'outset' },
                    ],
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen || !data.limitScreenBorderWidth',
                    notStyle: true,
                },
                {
                    type: 'color',
                    label: 'Limit background color',
                    attr: 'limitScreenBackgroundColor',
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen',
                    notStyle: true,
                },
            ] as Field[],
        },
        {
            label: 'Navigation',
            fields: [
                {
                    type: 'checkbox',
                    label: 'Show navigation',
                    attr: 'navigation',
                    notStyle: true,
                    // applyToAll: true,
                    groupApply: true,
                },
                {
                    type: 'text',
                    label: 'Title',
                    attr: 'navigationTitle',
                    notStyle: true,
                    hidden: '!data.navigation',
                },
                {
                    type: 'number',
                    label: 'Order',
                    attr: 'navigationOrder',
                    notStyle: true,
                    hidden: '!data.navigation',
                },
                {
                    // Icon for THIS page in navigation menu. It can be defined icon or image but not together
                    type: 'icon64',
                    label: 'Icon',
                    attr: 'navigationIcon',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationImage',
                },
                {
                    // Image for THIS page in navigation menu. It can be defined icon or image but not together
                    type: 'image',
                    label: 'Image',
                    attr: 'navigationImage',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationIcon',
                },
                {
                    // Menu orientation
                    type: 'select',
                    label: 'Orientation',
                    attr: 'navigationOrientation',
                    notStyle: true,
                    default: 'vertical',
                    hidden: '!data.navigation',
                    applyToAll: true,
                    options: [
                        { value: 'vertical', label: 'Vertical' },
                        { value: 'horizontal', label: 'Horizontal' },
                    ],
                },
                {
                    // By horizontal menu do not show text if icon provided
                    type: 'checkbox',
                    label: 'Only icon',
                    attr: 'navigationOnlyIcon',
                    title: 'By horizontal menu do not show text if icon provided',
                    notStyle: true,
                    default: true,
                    hidden: '!data.navigation || data.navigationOrientation !== "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'color',
                    label: 'Background color',
                    attr: 'navigationBackground',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'color',
                    label: 'Background color if selected',
                    attr: 'navigationSelectedBackground',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'color',
                    label: 'Text color if selected',
                    attr: 'navigationSelectedColor',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    // Color of text in the upper/top corner if the header is defined
                    type: 'color',
                    label: 'Menu header text color',
                    attr: 'navigationHeaderTextColor',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                },
                {
                    type: 'color',
                    label: 'Text color',
                    attr: 'navigationColor',
                    notStyle: true,
                    hidden: '!data.navigation',
                    applyToAll: true,
                },
                {
                    type: 'checkbox',
                    label: 'Hide menu',
                    attr: 'navigationHideMenu',
                    notStyle: true,
                    title: 'Show only toolbar on the top and hide menu itself',
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'text',
                    label: 'Menu header text',
                    attr: 'navigationHeaderText',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'text',
                    label: 'Menu width',
                    attr: 'navigationWidth',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal"',
                    applyToAll: true,
                },
                {
                    type: 'checkbox',
                    label: 'Hide after selection',
                    attr: 'navigationHideOnSelection',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal" || data.navigationHideMenu || data.navigationNoHide',
                    applyToAll: true,
                },
                {
                    type: 'checkbox',
                    label: 'Do not hide menu',
                    attr: 'navigationNoHide',
                    notStyle: true,
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal" || data.navigationHideMenu || data.navigationHideOnSelection',
                    applyToAll: true,
                },
                {
                    type: 'color',
                    label: 'Chevron icon color',
                    attr: 'navigationChevronColor',
                    notStyle: true,
                    title: 'Style of menu button only when the menu is hidden',
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal" || data.navigationHideMenu || data.navigationNoHide',
                    applyToAll: true,
                },
                {
                    type: 'checkbox',
                    label: 'Show background of button',
                    attr: 'navigationButtonBackground',
                    notStyle: true,
                    title: 'Style of menu button only when the menu is hidden',
                    hidden: '!data.navigation || data.navigationOrientation === "horizontal" || data.navigationHideMenu || data.navigationNoHide',
                    applyToAll: true,
                },
            ] as Field[],
        },
        {
            label: 'App bar',
            hidden: '!!data.navigation && data.navigationOrientation === "horizontal"',
            fields: [
                {
                    type: 'checkbox',
                    label: 'Show app bar',
                    attr: 'navigationBar',
                    notStyle: true,
                    default: true,
                    // applyToAll: true,
                    groupApply: true,
                },
                {
                    type: 'color',
                    label: 'Bar color',
                    attr: 'navigationBarColor',
                    notStyle: true,
                    hidden: '!data.navigationBar',
                    applyToAll: true,
                },
                {
                    type: 'text',
                    label: 'Bar text',
                    attr: 'navigationBarText',
                    notStyle: true,
                    hidden: '!data.navigationBar',
                    applyToAll: true,
                },
                {
                    type: 'icon64',
                    label: 'Bar icon',
                    attr: 'navigationBarIcon',
                    notStyle: true,
                    hidden: '!data.navigationBar || !!data.navigationBarImage',
                    applyToAll: true,
                },
                {
                    type: 'image',
                    label: 'Bar image',
                    attr: 'navigationBarImage',
                    notStyle: true,
                    hidden: '!data.navigationBar || !!data.navigationBarIcon',
                    applyToAll: true,
                },
            ] as Field[],
        },
        {
            label: 'Responsive settings',
            fields: [
                /*
            {
                type: 'select',
                label: 'Direction',
                attr: 'flexDirection',
                notStyle: true,
                options: [
                    { label: 'Column', value: 'column' },
                    { label: 'Row', value: 'row' },
                ],
            },
            {
                type: 'select',
                label: 'Wrap',
                attr: 'flexWrap',
                notStyle: true,
                options: [
                    { label: 'Wrap', value: 'wrap' },
                    { label: 'No wrap', value: 'nowrap' },
                ],
            },
            {
                type: 'select',
                label: 'Justify content',
                attr: 'justifyContent',
                notStyle: true,
                options: [
                    { label: 'flex-start', value: 'flex-start' },
                    { label: 'center', value: 'center' },
                    { label: 'flex-end', value: 'flex-end' },
                    { label: 'space-between', value: 'space-between' },
                    { label: 'space-around', value: 'space-around' },
                    { label: 'space-evenly', value: 'space-evenly' },
                ],
            },
            {
                type: 'select',
                label: 'Align items',
                attr: 'alignItems',
                notStyle: true,
                options: [
                    { label: 'flex-start', value: 'flex-start' },
                    { label: 'center', value: 'center' },
                    { label: 'flex-end', value: 'flex-end' },
                    { label: 'stretch', value: 'stretch' },
                    { label: 'baseline', value: 'baseline' },
                ],
            },
            {
                type: 'select',
                label: 'Align content',
                attr: 'alignContent',
                hidden: data => data.flexWrap === 'nowrap',
                notStyle: true,
                options: [
                    { label: 'flex-start', value: 'flex-start' },
                    { label: 'center', value: 'center' },
                    { label: 'flex-end', value: 'flex-end' },
                    { label: 'stretch', value: 'stretch' },
                    { label: 'space-between', value: 'space-between' },
                    { label: 'space-around', value: 'space-around' },
                ],
            },
            */
                {
                    type: 'slider',
                    label: 'Column width',
                    attr: 'columnWidth',
                    min: 200,
                    max: 2000,
                    step: 10,
                    notStyle: true,
                },
                {
                    type: 'slider',
                    label: 'Column gap',
                    attr: 'columnGap',
                    min: 0,
                    max: 200,
                    step: 1,
                    notStyle: true,
                },
                {
                    type: 'slider',
                    label: 'Row gap',
                    attr: 'rowGap',
                    min: 0,
                    max: 200,
                    step: 1,
                    notStyle: true,
                },
            ] as Field[],
        },
    ];
}
