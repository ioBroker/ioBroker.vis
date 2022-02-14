import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react/i18n';
import {
    AppBar,
    IconButton, Tooltip, withStyles,
} from '@material-ui/core';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { usePreview } from 'react-dnd-preview';

import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import AddIcon from '@material-ui/icons/Add';
import { useState } from 'react';
import { BiImport } from 'react-icons/bi';

import IODialog from '../../Components/IODialog';
import Folder from './Folder';
import View from './View';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';
import FolderDialog from './FolderDialog';

const styles = theme => ({
    viewManageBlock: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'grab',
    },
    buttonActions: {
        textAlign: 'right',
        flex: 1,
    },
    dialog: {
        minWidth: 400,
    },
    topBar: {
        flexDirection: 'row',
        borderRadius: 4,
        marginBottom: 12,
    },
    folderContainer: {
        clear: 'right',
        '& $buttonActions': {
            visibility: 'hidden',
        },
        '&:hover $buttonActions': {
            visibility: 'initial',
        },
    },
    viewContainer: {
        clear: 'right',
        '& $buttonActions': {
            visibility: 'hidden',
        },
        '&:hover $buttonActions': {
            visibility: 'initial',
        },
    },
});

const DndPreview = () => {
    const { display/* , itemType */, item, style } = usePreview();
    if (!display) {
        return null;
    }
    return <div style={style}>{item.preview}</div>;
};

function mobileCheck() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; }(navigator.userAgent || navigator.vendor || window.opera));
    return check;
}

function isTouchDevice() {
    if (!mobileCheck()) {
        return false;
    }
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

const ViewsManage = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    const [folderDialog, setFolderDialog] = useState(null);
    const [folderDialogName, setFolderDialogName] = useState('');
    const [folderDialogId, setFolderDialogId] = useState(null);
    const [folderDialogParentId, setFolderDialogParentId] = useState(null);

    const moveFolder = (id, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.find(folder => folder.id === id).parentId = parentId;
        props.changeProject(project);
    };

    const moveView = (name, parentId) => {
        const project = JSON.parse(JSON.stringify(props.project));
        project[name].parentId = parentId;
        props.changeProject(project);
    };

    const importViewAction = (view, data) => {
        const project = JSON.parse(JSON.stringify(props.project));
        const viewObject = JSON.parse(data);
        if (!viewObject || !viewObject.settings || !viewObject.widgets || !viewObject.activeWidgets) {
            return;
        }
        viewObject.name = view;
        project[view] = viewObject;
        props.changeProject(project);
    };

    const renderViews = parentId => Object.keys(props.project)
        .filter(name => !name.startsWith('___'))
        .filter(name => (parentId ? props.project[name].parentId === parentId : !props.project[name].parentId))
        .map((name, key) => <div key={key} className={props.classes.viewContainer}>
            <View
                name={name}
                moveView={moveView}
                setExportDialog={setExportDialog}
                setImportDialog={setImportDialog}
                {...props}
            />
        </div>);

    const renderFolders = parentId => {
        const folders = props.project.___settings.folders
            .filter(folder => (parentId ? folder.parentId === parentId : !folder.parentId));
        return folders.map((folder, key) => <div key={key}>
            <div className={props.classes.folderContainer}>
                <Folder
                    folder={folder}
                    setFolderDialog={setFolderDialog}
                    setFolderDialogName={setFolderDialogName}
                    setFolderDialogId={setFolderDialogId}
                    setFolderDialogParentId={setFolderDialogParentId}
                    moveFolder={moveFolder}
                    {...props}
                />
            </div>
            <div style={{ paddingLeft: 10 }}>
                {renderFolders(folder.id)}
                {renderViews(folder.id)}
            </div>
        </div>);
    };

    return <IODialog open={props.open} onClose={props.onClose} title="Manage views" closeTitle="Close">
        <div className={props.classes.dialog}>
            <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
                <DndPreview />
                <AppBar position="static" className={props.classes.topBar}>
                    <Tooltip title={I18n.t('Add view')}>
                        <IconButton size="small" onClick={() => props.showDialog('add', props.name)}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Import')}>
                        <IconButton onClick={() => setImportDialog('')} size="small">
                            <BiImport />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Add folder')}>
                        <IconButton
                            size="small"
                            onClick={() => {
                                setFolderDialog('add');
                                setFolderDialogName('');
                                setFolderDialogParentId(null);
                            }}
                        >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </Tooltip>
                </AppBar>
                <Folder
                    folder={{ name: I18n.t('root') }}
                    setFolderDialog={setFolderDialog}
                    setFolderDialogName={setFolderDialogName}
                    setFolderDialogId={setFolderDialogId}
                    setFolderDialogParentId={setFolderDialogParentId}
                    moveFolder={moveFolder}
                    {...props}
                />
                <div style={{ paddingLeft: 10 }}>
                    {renderFolders()}
                    {renderViews()}
                </div>
            </DndProvider>
        </div>
        <FolderDialog
            dialog={folderDialog}
            dialogFolder={folderDialogId}
            dialogName={folderDialogName}
            dialogParentId={folderDialogParentId}
            setDialog={setFolderDialog}
            setDialogFolder={setFolderDialogId}
            setDialogName={setFolderDialogName}
            {...props}
        />
        <ImportDialog
            open={importDialog !== false}
            onClose={() => setImportDialog(false)}
            view={importDialog}
            importViewAction={importViewAction}
            project={props.project}
            themeName={props.themeName}
        />
        <ExportDialog
            open={exportDialog !== false}
            onClose={() => setExportDialog(false)}
            view={exportDialog}
            project={props.project}
            themeName={props.themeName}
        />
    </IODialog>;
};

ViewsManage.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    name: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    showDialog: PropTypes.func,
    themeName: PropTypes.string,
};

export default withStyles(styles)(ViewsManage);
