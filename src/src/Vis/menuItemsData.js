import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';

const iconStyle = { width: 40 };

const menuItemsData = [
    {
        leftIcon: <BiCopy style={iconStyle} />,
        label: 'Copy',
        callback: () => console.log('New clicked'),
    },
    {
        leftIcon: <BiCut style={iconStyle} />,
        label: 'Cut',
        callback: () => console.log('Save clicked'),
    },
    {
        leftIcon: <BiPaste style={iconStyle} />,
        label: 'Paste',
        callback: () => console.log('Save clicked'),
    },
    {
        leftIcon: <DeleteIcon style={iconStyle} fontSize="small" />,
        label: 'Delete',
        callback: () => console.log('Save clicked'),
    },
    {
        label: 'More',
        items: [
            {
                leftIcon: <LockIcon style={iconStyle} fontSize="small" />,
                label: 'Lock',
                callback: () => console.log('Save As > Option 1 clicked'),
            },
            {
                leftIcon: <LockOpenIcon style={iconStyle} fontSize="small" />,
                label: 'Unlock',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiBringToFront style={iconStyle} />,
                label: 'Bring to front',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <RiSendToBack style={iconStyle} />,
                label: 'Sent to back',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiExport style={iconStyle} />,
                label: 'Export widgets',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
            {
                leftIcon: <BiImport style={iconStyle} />,
                label: 'Import widgets',
                callback: () => console.log('Save As > Option 2 clicked'),
            },
        ],
    },
];

export default menuItemsData;
