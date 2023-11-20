import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';

import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight,
    MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';
import { AiOutlineColumnWidth, AiOutlineColumnHeight } from 'react-icons/ai';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
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

import { I18n } from '@iobroker/adapter-react-v5';
import { store } from '../Store';

import ToolbarItems from './ToolbarItems';
import { getWidgetTypes } from '../Vis/visWidgetsCatalog';
import WidgetImportDialog from './WidgetImportDialog';
import WidgetExportDialog from './WidgetExportDialog';
import WidgetFilterDialog from './WidgetFilterDialog';

const Widgets = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);

    const toolbar = useMemo(() => {
        const project = store.getState().visProject;

        if (!props.widgetsLoaded) {
            return null;
        }
        if (!props.openedViews.length) {
            return null;
        }
        if (!project[props.selectedView]) {
            return null;
        }
        const widgetTypes = getWidgetTypes();
        const widgets = project[props.selectedView].widgets;

        const shownWidgets = Object.keys(widgets)
            .filter(widget => (props.selectedGroup ?
                widgets[widget].groupid === props.selectedGroup || widget === props.selectedGroup :
                !widgets[widget].groupid));

        return {
            name: 'Widgets',
            items: [
                {
                    type: 'icon-button',
                    Icon: FilterIcon,
                    name: 'Filter widgets',
                    color: project[props.selectedView].filterWidgets?.length ? '#c00000' : undefined,
                    disabled: !props.editMode,
                    onClick: () => setFilterDialog(true),
                },
                {
                    type: 'multiselect',
                    name: I18n.t('Active widget(s) from %s', shownWidgets.length),
                    doNotTranslateName: true,
                    items: shownWidgets
                        .map(widgetId => {
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

                            let widgetIcon = widgetType ? (widgetType.preview || '') : 'icon/question.svg';
                            if (widgetIcon.startsWith('<img')) {
                                const prev = widgetIcon.match(/src="([^"]+)"/);
                                if (prev && prev[1]) {
                                    widgetIcon = prev[1];
                                }
                            }
                            let name;
                            if (widgets[widgetId] && widgets[widgetId].data?.name) {
                                name = <span>
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
                                </span>;
                            } else {
                                name = widgetId;
                            }

                            let subName = widgetType ? `(${setLabel} - ${tpl === '_tplGroup' ? I18n.t('group') : widgetLabel})` : tpl;

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
                    onChange: value => props.setSelectedWidgets(value),
                },
                [
                    [
                        {
                            type: 'icon-button',
                            Icon: DeleteIcon,
                            name: 'Delete widgets',
                            disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onClick: () => props.deleteWidgets(),
                        },
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: FileCopyIcon,
                            name: 'Clone widget',
                            disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                            onClick: () => props.cloneWidgets(),
                        },
                    ],
                ],

                { type: 'divider' },

                [[
                    {
                        type: 'icon-button',
                        Icon: BiCut,
                        name: 'Cut',
                        size: 'normal',
                        disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                        onClick: () => props.cutWidgets(),
                    },
                    {
                        type: 'icon-button',
                        Icon: BiCopy,
                        name: 'Copy',
                        size: 'normal',
                        disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                        onClick: () => props.copyWidgets(),
                    },
                ], [
                    {
                        type: 'icon-button',
                        Icon: BiPaste,
                        name: 'Paste',
                        size: 'normal',
                        disabled: !Object.keys(props.widgetsClipboard.widgets).length,
                        onClick: () => props.pasteWidgets(),
                    },
                ]],
                {
                    type: 'icon-button',
                    Icon: UndoIcon,
                    name: 'Undo',
                    subName: `(${props.historyCursor + 1} / ${props.history.length})`,
                    onClick: props.undo,
                    disabled: !props.editMode || props.historyCursor === 0,
                },
                {
                    type: 'icon-button',
                    Icon: RedoIcon,
                    name: 'Redo',
                    onClick: props.redo,
                    disabled: !props.editMode || props.historyCursor === props.history.length - 1,
                },

                { type: 'divider' },

                [
                    [
                        {
                            type: 'icon-button',
                            Icon: MdAlignHorizontalLeft,
                            name: 'Align horizontal/left',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('left'),
                        },
                        {
                            type: 'icon-button',
                            Icon: MdAlignVerticalTop,
                            name: 'Align vertical/top',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('top'),
                        },
                        {
                            type: 'icon-button',
                            Icon: MdAlignHorizontalCenter,
                            name: 'Align horizontal/center',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('horizontal-center'),
                        },
                        {
                            type: 'icon-button',
                            Icon: CgArrowAlignH,
                            name: 'Align horizontal/equal',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('horizontal-equal'),
                        },
                        {
                            type: 'icon-button',
                            Icon: AiOutlineColumnWidth,
                            name: 'Align width. Press more time to get the desired width.',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('width'),
                        },
                        {
                            type: 'icon-button',
                            Icon: RiBringToFront,
                            name: 'Bring to front',
                            size: 'normal',
                            disabled: !props.selectedWidgets.length,
                            onClick: () => props.orderWidgets('front'),
                        },
                    ],
                    [
                        {
                            type: 'icon-button',
                            Icon: MdAlignHorizontalRight,
                            name: 'Align horizontal/right',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('right'),
                        },
                        {
                            type: 'icon-button',
                            Icon: MdAlignVerticalBottom,
                            name: 'Align vertical/bottom',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('bottom'),
                        },
                        {
                            type: 'icon-button',
                            Icon: MdAlignVerticalCenter,
                            name: 'Align vertical/center',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('vertical-center'),
                        },
                        {
                            type: 'icon-button',
                            Icon: CgArrowAlignV,
                            name: 'Align vertical/equal',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('vertical-equal'),
                        },
                        {
                            type: 'icon-button',
                            Icon: AiOutlineColumnHeight,
                            name: 'Align height. Press more time to get the desired height.',
                            size: 'normal',
                            disabled: props.selectedWidgets.length < 2,
                            onClick: () => props.alignWidgets('height'),
                        },
                        {
                            type: 'icon-button',
                            Icon: RiSendToBack,
                            name: 'Send to back',
                            size: 'normal',
                            disabled: !props.selectedWidgets.length,
                            onClick: () => props.orderWidgets('back'),
                        },
                    ],
                ],
                { type: 'divider' },
                [
                    [{
                        type: 'icon-button',
                        Icon: OpenInNewIcon,
                        name: 'Lock dragging',
                        selected: props.lockDragging,
                        onClick: () => props.toggleLockDragging(),
                    }],
                    [{
                        type: 'icon-button',
                        Icon: props.widgetHint === 'hide' ? VisibilityOffIcon : VisibilityIcon,
                        color: props.widgetHint === 'light' ? 'white' : 'black',
                        name: `Toggle widget hint (${props.widgetHint})`,
                        onClick: () => props.toggleWidgetHint(),
                    }],
                ],
                { type: 'divider' },
                [
                    [{
                        type: 'icon-button',
                        Icon: BiImport,
                        name: 'Import widgets',
                        size: 'normal',
                        disabled: !props.editMode || !!props.selectedGroup,
                        onClick: () => setImportDialog(true),
                    }],
                    [{
                        type: 'icon-button',
                        Icon: BiExport,
                        name: 'Export widgets',
                        size: 'normal',
                        disabled: !props.selectedWidgets.length,
                        onClick: () => setExportDialog(true),
                    }],
                ],
            ],
        };
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
        store.getState().visProject[props.selectedView],
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

    return <>
        <ToolbarItems group={toolbar} {...props} classes={{}} />
        {importDialog ? <WidgetImportDialog
            onClose={() => setImportDialog(false)}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            project={store.getState().visProject}
            themeType={props.themeType}
            getNewWidgetIdNumber={props.getNewWidgetIdNumber}
        /> : null}
        {exportDialog ? <WidgetExportDialog
            onClose={() => setExportDialog(false)}
            widgets={store.getState().visProject[props.selectedView].widgets}
            selectedWidgets={props.selectedWidgets}
            themeType={props.themeType}
        /> : null}
        {filterDialog ? <WidgetFilterDialog
            onClose={() => setFilterDialog(false)}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            project={store.getState().visProject}
        /> : null}
    </>;
};

Widgets.propTypes = {
    openedViews: PropTypes.array,
    themeType: PropTypes.string,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    selectedGroup: PropTypes.string,
};

export default Widgets;
