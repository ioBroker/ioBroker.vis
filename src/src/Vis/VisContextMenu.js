import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useState } from 'react';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
import {
    AiOutlineGroup, AiOutlineUngroup,
} from 'react-icons/ai';
import IOContextMenu from '../Components/IOContextMenu';
import WidgetExportDialog from '../Toolbar/WidgetExportDialog';
import WidgetImportDialog from '../Toolbar/WidgetImportDialog';

const VisContextMenu = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const menuItemsData = menuPosition => {
        const coordinatesWidgets = menuPosition ? Object.keys(props.project[props.selectedView].widgets).filter(widget => {
            const rect = window.document.getElementById(widget)?.getBoundingClientRect();
            if (rect) {
                if (menuPosition.left >= rect.left && menuPosition.left <= rect.right && menuPosition.top >= rect.top && menuPosition.top <= rect.bottom) {
                    return true;
                }
            }
            return false;
        }) : [];

        return [
            {
                label: 'select',
                items: [
                    {
                        label: 'all',
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
                hide: !(
                    props.selectedWidgets.length === 1
                && props.project[props.selectedView].widgets[props.selectedWidgets[0]].tpl === '_tplGroup'
                ),
            },
            {
            // leftIcon: <AiOutlineUngroup />,
                label: 'Edit group',
                onClick: () => props.setSelectedGroup(props.selectedWidgets[0]),
                hide: !(
                    props.selectedWidgets.length === 1
                && props.project[props.selectedView].widgets[props.selectedWidgets[0]].tpl === '_tplGroup'
                ),
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
        <IOContextMenu menuItemsData={menuItemsData} disabled={props.disabled}>
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
            widgets={props.selectedWidgets.map(selectedWidget => props.project[props.selectedView].widgets[selectedWidget])}
        />
    </>;
};
export default VisContextMenu;
