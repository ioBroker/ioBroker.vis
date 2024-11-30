import React, { useState, useMemo } from 'react';

import {
    MdAlignHorizontalCenter,
    MdAlignHorizontalLeft,
    MdAlignHorizontalRight,
    MdAlignVerticalBottom,
    MdAlignVerticalCenter,
    MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';
import { AiOutlineColumnWidth, AiOutlineColumnHeight } from 'react-icons/ai';
import { BiImport, BiExport, BiCut, BiCopy, BiPaste } from 'react-icons/bi';
import { RiBringToFront, RiSendToBack } from 'react-icons/ri';
import {
    Delete as DeleteIcon,
    FilterAlt as FilterIcon,
    FileCopy as FileCopyIcon,
    OpenInNew as OpenInNewIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';
import type { AnyWidgetId, GroupWidgetId, VisTheme } from '@iobroker/types-vis-2';
import type Editor from '@/Editor';
import { store } from '../Store';

import ToolbarItems, { type ToolbarGroup, type ToolbarItem } from './ToolbarItems';
import { getWidgetTypes } from '../Vis/visWidgetsCatalog';
import WidgetImportDialog from './WidgetImportDialog';
import WidgetExportDialog from './WidgetExportDialog';
import WidgetFilterDialog from './WidgetFilterDialog';

interface WidgetsProps {
    openedViews: string[];
    themeType: ThemeType;
    selectedView: string;
    selectedWidgets: AnyWidgetId[];
    setSelectedWidgets: Editor['setSelectedWidgets'];
    selectedGroup: GroupWidgetId;
    editMode: boolean;
    lockDragging: boolean;
    widgetHint: string;
    historyCursor: number;
    history: Editor['state']['history'];
    widgetsLoaded: boolean;
    changeProject: Editor['changeProject'];
    deleteWidgets: Editor['deleteWidgets'];
    cloneWidgets: Editor['cloneWidgets'];
    cutWidgets: Editor['cutWidgets'];
    copyWidgets: Editor['copyWidgets'];
    pasteWidgets: Editor['pasteWidgets'];
    undo: Editor['undo'];
    redo: Editor['redo'];
    alignWidgets: Editor['alignWidgets'];
    orderWidgets: Editor['orderWidgets'];
    toggleLockDragging: Editor['toggleLockDragging'];
    toggleWidgetHint: Editor['toggleWidgetHint'];
    widgetsClipboard: Editor['state']['widgetsClipboard'];
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    theme: VisTheme;
}

const Widgets: React.FC<WidgetsProps> = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);

    const viewSettings = store.getState().visProject?.[props.selectedView];

    const toolbar = useMemo<ToolbarGroup>(() => {
        if (!props.widgetsLoaded) {
            return null;
        }
        if (!props.openedViews.length) {
            return null;
        }
        if (!viewSettings) {
            return null;
        }

        const widgetTypes = getWidgetTypes();
        const widgets = viewSettings.widgets;

        const shownWidgets = Object.keys(widgets).filter((widget: AnyWidgetId) =>
            props.selectedGroup
                ? widgets[widget].groupid === props.selectedGroup || widget === props.selectedGroup
                : !widgets[widget].groupid,
        );

        return {
            name: 'Widgets',
            items: [
                {
                    type: 'icon-button',
                    Icon: FilterIcon,
                    name: 'Filter widgets',
                    color: viewSettings.filterWidgets?.length ? '#c00000' : undefined,
                    disabled: !props.editMode,
                    onAction: () => setFilterDialog(true),
                } as ToolbarItem,
                {
                    type: 'multiselect',
                    name: I18n.t('Active widget(s) from %s', shownWidgets.length),
                    doNotTranslateName: true,
                    items: shownWidgets.map((widgetId: AnyWidgetId) => {
                        const tpl = widgets[widgetId].tpl;
                        const widgetType = widgetTypes.find(w => w.name === tpl);
                        let widgetLabel = widgetType?.title || '';
                        let widgetColor = widgetType ? widgetType.setColor : '#FF0000';
                        if (widgetType?.label) {
                            widgetLabel = I18n.t(widgetType.label);
                        }

                        // remove legacy stuff
                        widgetLabel = widgetLabel.split('<br')[0];
                        widgetLabel = widgetLabel.split('<span')[0];
                        widgetLabel = widgetLabel.split('<div')[0];

                        let setLabel = widgetType?.set;
                        if (widgetType?.setLabel) {
                            setLabel = I18n.t(widgetType.setLabel);
                        } else if (setLabel) {
                            const widgetWithSetLabel = widgetTypes.find(w => w.set === setLabel && w.setLabel);
                            if (widgetWithSetLabel) {
                                widgetColor = widgetWithSetLabel.setColor;
                                setLabel = I18n.t(widgetWithSetLabel.setLabel);
                            }
                        }

                        let widgetIcon = widgetType ? widgetType.preview || '' : 'icon/question.svg';
                        if (widgetIcon.startsWith('<img')) {
                            const prev = widgetIcon.match(/src="([^"]+)"/);
                            if (prev && prev[1]) {
                                widgetIcon = prev[1];
                            }
                        }
                        let name;
                        if (widgets[widgetId] && widgets[widgetId].data?.name) {
                            name = (
                                <span>
                                    <span>{widgets[widgetId].data?.name}</span>
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            fontSize: 10,
                                            fontStyle: 'italic',
                                            opacity: 0.8,
                                        }}
                                    >
                                        {`[${widgetId}]`}
                                    </span>
                                </span>
                            );
                        } else {
                            name = widgetId;
                        }

                        let subName = widgetType
                            ? `(${setLabel} - ${tpl === '_tplGroup' ? I18n.t('group') : widgetLabel})`
                            : tpl;

                        if (widgets[widgetId].marketplace) {
                            subName = `${widgets[widgetId].marketplace.name} (${I18n.t('version')} ${widgets[widgetId].marketplace.version})`;
                        }

                        return {
                            name,
                            subName,
                            value: widgetId,
                            color: widgetColor,
                            icon: widgetIcon.startsWith('<') ? '' : widgetIcon,
                        };
                    }),
                    width: 240,
                    value: props.selectedWidgets,
                    onAction: value => props.setSelectedWidgets(value as AnyWidgetId[]),
                } as ToolbarItem,
                [
                    [
                        {
                            type: 'icon-button',
                            Icon: DeleteIcon,
                            name: 'Delete widgets',
                            disabled:
                                !props.selectedWidgets.length ||
                                (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onAction: () => props.deleteWidgets(),
                        } as ToolbarItem,
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: FileCopyIcon,
                            name: 'Clone widget',
                            disabled:
                                !props.selectedWidgets.length ||
                                (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onAction: () => props.cloneWidgets(),
                        } as ToolbarItem,
                    ],
                ],

                { type: 'divider' },

                [
                    [
                        {
                            type: 'icon-button',
                            Icon: BiCut,
                            name: 'Cut',
                            size: 'normal',
                            disabled:
                                !props.selectedWidgets.length ||
                                (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onAction: () => props.cutWidgets(),
                        } as ToolbarItem,
                        {
                            type: 'icon-button',
                            Icon: BiCopy,
                            name: 'Copy',
                            size: 'normal',
                            disabled:
                                !props.selectedWidgets.length ||
                                (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onAction: () => props.copyWidgets(),
                        } as ToolbarItem,
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: BiPaste,
                            name: 'Paste',
                            size: 'normal',
                            disabled: !Object.keys(props.widgetsClipboard.widgets).length,
                            onAction: () => props.pasteWidgets(),
                        } as ToolbarItem,
                    ],
                ],
                {
                    type: 'icon-button',
                    Icon: UndoIcon,
                    name: 'Undo',
                    subName: `(${props.historyCursor + 1} / ${props.history.length})`,
                    onAction: props.undo,
                    disabled: !props.editMode || props.historyCursor === 0,
                } as ToolbarItem,
                {
                    type: 'icon-button',
                    Icon: RedoIcon,
                    name: 'Redo',
                    onAction: props.redo,
                    disabled: !props.editMode || props.historyCursor === props.history.length - 1,
                } as ToolbarItem,

                { type: 'divider' },

                window.innerWidth > 1410
                    ? [
                          [
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignHorizontalLeft,
                                  name: 'Align horizontal/left',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('left'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignVerticalTop,
                                  name: 'Align vertical/top',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('top'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignHorizontalCenter,
                                  name: 'Align horizontal/center',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('horizontal-center'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: CgArrowAlignH,
                                  name: 'Align horizontal/equal',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('horizontal-equal'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: AiOutlineColumnWidth,
                                  name: 'Align width. Press more time to get the desired width.',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('width'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: RiBringToFront,
                                  name: 'Bring to front',
                                  size: 'normal',
                                  disabled: !props.selectedWidgets.length,
                                  onAction: () => props.orderWidgets('front'),
                              },
                          ] as ToolbarItem[],
                          [
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignHorizontalRight,
                                  name: 'Align horizontal/right',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('right'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignVerticalBottom,
                                  name: 'Align vertical/bottom',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('bottom'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: MdAlignVerticalCenter,
                                  name: 'Align vertical/center',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('vertical-center'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: CgArrowAlignV,
                                  name: 'Align vertical/equal',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('vertical-equal'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: AiOutlineColumnHeight,
                                  name: 'Align height. Press more time to get the desired height.',
                                  size: 'normal',
                                  disabled: props.selectedWidgets.length < 2,
                                  onAction: () => props.alignWidgets('height'),
                              },
                              {
                                  type: 'icon-button',
                                  Icon: RiSendToBack,
                                  name: 'Send to back',
                                  size: 'normal',
                                  disabled: !props.selectedWidgets.length,
                                  onAction: () => props.orderWidgets('back'),
                              },
                          ] as ToolbarItem[],
                      ]
                    : null,
                window.innerWidth > 1410 ? { type: 'divider' } : null,
                [
                    [
                        {
                            type: 'icon-button',
                            Icon: OpenInNewIcon,
                            name: 'Lock dragging',
                            selected: props.lockDragging,
                            onAction: () => props.toggleLockDragging(),
                        } as ToolbarItem,
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: props.widgetHint === 'hide' ? VisibilityOffIcon : VisibilityIcon,
                            color: props.widgetHint === 'light' ? 'white' : 'black',
                            name: `Toggle widget hint (${props.widgetHint})`,
                            onAction: () => props.toggleWidgetHint(),
                        } as ToolbarItem,
                    ],
                ],
                { type: 'divider' },
                [
                    [
                        {
                            type: 'icon-button',
                            Icon: BiImport,
                            name: 'Import widgets',
                            size: 'normal',
                            disabled: !props.editMode,
                            onAction: () => setImportDialog(true),
                        } as ToolbarItem,
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: BiExport,
                            name: 'Export widgets',
                            size: 'normal',
                            disabled: !props.selectedWidgets.length,
                            onAction: () => setExportDialog(true),
                        } as ToolbarItem,
                    ],
                ],
            ],
        } as ToolbarGroup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props.selectedGroup,
        props.selectedWidgets,
        props.editMode,
        props.lockDragging,
        props.widgetHint,
        props.historyCursor,
        props.history.length,
        props.widgetsLoaded,
        props.openedViews.length,
        viewSettings,
    ]);

    if (!props.widgetsLoaded) {
        return null;
    }
    if (!props.openedViews.length) {
        return null;
    }
    if (!store.getState().visProject[props.selectedView]) {
        return null;
    }

    return (
        <>
            <ToolbarItems
                theme={props.theme}
                group={toolbar}
                changeProject={props.changeProject}
                selectedView={props.selectedView}
                setSelectedWidgets={props.setSelectedWidgets}
                themeType={props.themeType}
                toolbarHeight={props.toolbarHeight}
            />
            {importDialog ? (
                <WidgetImportDialog
                    onClose={() => setImportDialog(false)}
                    changeProject={props.changeProject}
                    selectedView={props.selectedView}
                    selectedGroup={props.selectedGroup}
                    themeType={props.themeType}
                />
            ) : null}
            {exportDialog ? (
                <WidgetExportDialog
                    onClose={() => setExportDialog(false)}
                    widgets={store.getState().visProject[props.selectedView].widgets}
                    selectedWidgets={props.selectedWidgets}
                    themeType={props.themeType}
                />
            ) : null}
            {filterDialog ? (
                <WidgetFilterDialog
                    onClose={() => setFilterDialog(false)}
                    changeProject={props.changeProject}
                    selectedView={props.selectedView}
                />
            ) : null}
        </>
    );
};

export default Widgets;
