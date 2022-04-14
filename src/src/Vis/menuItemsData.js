import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';

const menuItemsData = [
    {
        leftIcon: <BiCopy />,
        label: 'Copy',
        callback: () => console.log('New clicked'),
    },
    {
        leftIcon: <BiCut />,
        label: 'Cut',
        callback: () => console.log('Save clicked'),
    },
    {
        leftIcon: <BiPaste />,
        label: 'Paste',
        callback: () => console.log('Save clicked'),
    },
    {
        leftIcon: <DeleteIcon />,
        label: 'Delete',
        callback: () => console.log('Save clicked'),
    },
    {
        label: 'More',
        items: [
            {
                leftIcon: <LockIcon />,
                label: 'Lock',
                callback: () => console.log('Save As > Option 1 clicked'),
            },
            {
                leftIcon: <LockOpenIcon />,
                label: 'Unlock',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiBringToFront />,
                label: 'Bring to front',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiSendToBack />,
                label: 'Sent to back',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiExport />,
                label: 'Export widgets',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiImport />,
                label: 'Import widgets',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
        ],
    },
];

export default menuItemsData;
