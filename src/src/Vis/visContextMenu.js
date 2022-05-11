import { useState } from 'react';

import WidgetIcon from '@mui/icons-material/Widgets';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
import {
    AiOutlineGroup, AiOutlineUngroup,
} from 'react-icons/ai';

import I18n from '@iobroker/adapter-react-v5/i18n';

import IOContextMenu from '../Components/IOContextMenu';
import WidgetExportDialog from '../Toolbar/WidgetExportDialog';
import WidgetImportDialog from '../Toolbar/WidgetImportDialog';
import { getWidgetTypes } from '../Utils';

const VisContextMenu = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const menuItemsData = menuPosition => {
        const view = props.project[props.selectedView];
        const coordinatesWidgets = menuPosition ? Object.keys(view.widgets)
            .filter(widget => {
                const rect = window.document.getElementById(widget)?.getBoundingClientRect();
                if (view.widgets[widget].grouped) {
                    return false;
                }

                return rect && menuPosition.left >= rect.left && menuPosition.left <= rect.right && menuPosition.top >= rect.top && menuPosition.top <= rect.bottom;
            }) : [];

        // find name and widget type
        let widgetType = null;
        let widgetName = '';
        let showSelect = coordinatesWidgets.length > 1;
        if (view && coordinatesWidgets[0] && view.widgets[coordinatesWidgets[0]] && view.widgets[coordinatesWidgets[0]].tpl) {
            if (view.widgets[coordinatesWidgets[0]].data?.locked) {
                showSelect = true;
            }
            widgetName = coordinatesWidgets[0];
            if (view.widgets[coordinatesWidgets[0]].data && view.widgets[coordinatesWidgets[0]].data.name) {
                widgetName = view.widgets[coordinatesWidgets[0]].data.name;
                widgetType = coordinatesWidgets[0];
            } else {
                const tpl = view.widgets[coordinatesWidgets[0]].tpl;
                if (tpl === '_tplGroup') {
                    widgetType = I18n.t('Group');
                } else {
                    const wSet = view.widgets[coordinatesWidgets[0]].widgetSet;
                    const widgetItem = getWidgetTypes().find(item => item.name === tpl && item.set === wSet);
                    widgetType = widgetItem ? widgetItem.title : tpl;
                }
            }
        }

        return [
            {
                leftIcon: <WidgetIcon />,
                hide: coordinatesWidgets.length !== 1,
                label: widgetName,
                subLabel: widgetType,
                style: { fontWeight: 'bold' },
                disabled: true,
            },
            {
                hide: !showSelect,
                label: 'Select',
                items: [
                    {
                        label: 'all',
                        hide: coordinatesWidgets.length === 1,
                        onClick: () => props.setSelectedWidgets(coordinatesWidgets),
                    },
                    ...coordinatesWidgets.map(widget => ({
                        label: widget,
                        onClick: () => props.setSelectedWidgets([widget]),
                    })),
                ],
            },
            {
                leftIcon: <AiOutlineGroup />,
                label: 'Group',
                onClick: () => props.groupWidgets(),
                hide: props.selectedWidgets.length < 2,
            },
            {
                leftIcon: <AiOutlineUngroup />,
                label: 'Ungroup',
                onClick: () => props.ungroupWidgets(),
                hide: props.selectedWidgets.length !== 1 ||
                    props.project[props.selectedView].widgets[props.selectedWidgets[0]].tpl !== '_tplGroup',
            },
            {
            // leftIcon: <AiOutlineUngroup />,
                label: 'Edit group',
                onClick: () => props.setSelectedGroup(props.selectedWidgets[0]),
                hide: props.selectedWidgets.length !== 1 ||
                    props.project[props.selectedView].widgets[props.selectedWidgets[0]].tpl !== '_tplGroup',
            },
            {
                leftIcon: <BiCopy />,
                label: 'Copy',
                onClick: () => props.copyWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                leftIcon: <BiCut />,
                label: 'Cut',
                onClick: () => props.cutWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                leftIcon: <BiPaste />,
                label: 'Paste',
                onClick: () => props.pasteWidgets(),
                disabled: !Object.keys(props.widgetsClipboard.widgets).length,
            },
            {
                leftIcon: <DeleteIcon fontSize="small" />,
                label: 'Delete',
                onClick: () => props.deleteWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                label: 'More',
                items: [
                    {
                        leftIcon: <LockIcon fontSize="small" />,
                        label: 'Lock',
                        onClick: () => props.lockWidgets('lock'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <LockOpenIcon fontSize="small" />,
                        label: 'Unlock',
                        onClick: () => props.lockWidgets('unlock'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <RiBringToFront />,
                        label: 'Bring to front',
                        onClick: () => props.orderWidgets('front'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <RiSendToBack />,
                        label: 'Sent to back',
                        onClick: () => props.orderWidgets('back'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <BiExport />,
                        label: 'Export widgets',
                        onClick: () => setExportDialog(true),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <BiImport />,
                        label: 'Import widgets',
                        onClick: () => setImportDialog(true),
                    },
                ],
            },
        ];
    };

    return <>
        <IOContextMenu
            menuItemsData={menuItemsData}
            disabled={props.disabled}
        >
            {props.children}
        </IOContextMenu>
        <WidgetImportDialog
            open={importDialog}
            onClose={() => setImportDialog(false)}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            project={props.project}
            getNewWidgetIdNumber={props.getNewWidgetIdNumber}
        />
        <WidgetExportDialog
            open={exportDialog}
            onClose={() => setExportDialog(false)}
            widgets={props.project[props.selectedView].widgets}
            selectedWidgets={props.selectedWidgets}
        />
    </>;
};

VisContextMenu.propTypes = {
};

export default VisContextMenu;
