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
import IOContextMenu from '../Components/IOContextMenu';
import WidgetExportDialog from '../Toolbar/WidgetExportDialog';
import WidgetImportDialog from '../Toolbar/WidgetImportDialog';

const VisContextMenu = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const menuItemsData = [
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
                    onClick: () => console.log('Save As > Option 1 clicked'),
                    disabled: !props.selectedWidgets.length,
                },
                {
                    leftIcon: <LockOpenIcon fontSize="small" />,
                    label: 'Unlock',
                    onClick: () => console.log('Save As > Option 2 clicked'),
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

    return <>
        <IOContextMenu menuItemsData={menuItemsData}>
            {props.children}
        </IOContextMenu>
        <WidgetImportDialog open={importDialog} onClose={() => setImportDialog(false)} />
        <WidgetExportDialog
            open={exportDialog}
            onClose={() => setExportDialog(false)}
            widgets={props.selectedWidgets.map(selectedWidget => props.project[props.selectedView].widgets[selectedWidget])}
        />
    </>;
};
export default VisContextMenu;
