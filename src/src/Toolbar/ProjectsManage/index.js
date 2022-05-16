import PropTypes from 'prop-types';
import { useState } from 'react';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    AppBar, Button, IconButton, Tooltip,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BiImport, BiExport } from 'react-icons/bi';
import IODialog from '../../Components/IODialog';
import ImportProjectDialog from './ImportProjectDialog';
import ProjectDialog from './ProjectDialog';

const styles = () => ({
    projectBlock: {
        display: 'flex',
        alignItems: 'center',
    },
    projectButton: {
        justifyContent: 'left',
    },
    viewManageButtonActions: {
        textAlign: 'right',
        width: 220,
    },
    dialog: {
        minWidth: 200,
    },
    topBar: {
        flexDirection: 'row',
        borderRadius: 4,
        marginBottom: 12,
    },
});

const ProjectsManage = props => {
    const [dialog, setDialog] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogProject, setDialogProject] = useState(null);

    const [importDialog, setImportDialog] = useState(false);

    if (!props.projects) {
        return null;
    }

    const showDialog = (type, project) => {
        project = project || props.selectedView;

        const dialogDefaultName = {
            add: 'New project',
            rename: project,
        };

        setDialog(type);
        setDialogProject(project);
        setDialogName(dialogDefaultName[type]);
    };

    const exportProject = projectName => {
        props.socket.readFile('vis.0', `${projectName}/vis-views.json`).then(project => {
            const zip = new JSZip();

            if (project.type) {
                zip.file(`${projectName}.json`, project.data);
            } else {
                zip.file(`${projectName}.json`, project);
            }

            zip.generateAsync({ type: 'blob' }).then(content => {
                saveAs(content, `${projectName}.zip`);
            });
        });
    };

    return (
        <IODialog
            open={props.open}
            onClose={props.onClose}
            title="Manage projects"
            closeTitle="Close"
            closeDisabled={!props.projects.length}
        >
            <div className={props.classes.dialog}>
                <AppBar position="static" className={props.classes.topBar}>
                    <Tooltip title={I18n.t('Add')} size="small">
                        <IconButton onClick={() => showDialog('add')} size="large">
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Import')}>
                        <IconButton onClick={() => setImportDialog('')} size="large" style={{ width: 48 }}>
                            <BiImport fontSize={20} />
                        </IconButton>
                    </Tooltip>
                </AppBar>
                {props.projects.map((projectName, key) => <div key={key} className={props.classes.projectBlock}>
                    <Button
                        fullWidth
                        className={props.classes.projectButton}
                        color={projectName === props.projectName ? 'primary' : 'grey'}
                        onClick={() => props.loadProject(projectName)}
                    >
                        {projectName}
                    </Button>
                    <span className={props.classes.viewManageButtonActions}>
                        <Tooltip title={I18n.t('Import')} onClick={() => setImportDialog(projectName)}>
                            <IconButton size="small">
                                <BiImport fontSize="20" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={I18n.t('Export')}>
                            <IconButton onClick={() => exportProject(projectName)} size="small">
                                <BiExport fontSize="20" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={I18n.t('Edit')}>
                            <IconButton size="small" onClick={() => showDialog('rename', projectName)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={I18n.t('Delete')} onClick={() => showDialog('delete', projectName)}>
                            <IconButton size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>)}
            </div>
            <ProjectDialog
                dialog={dialog}
                dialogProject={dialogProject}
                dialogName={dialogName}
                setDialog={setDialog}
                setDialogProject={setDialogProject}
                setDialogName={setDialogName}
                {...props}
                classes={{}}
            />
            <ImportProjectDialog
                open={importDialog !== false}
                onClose={() => setImportDialog(false)}
                projectName={importDialog || ''}
                socket={props.socket}
                refreshProjects={props.refreshProjects}
            />
        </IODialog>
    );
};

ProjectsManage.propTypes = {
    addProject: PropTypes.func,
    loadProject: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    projects: PropTypes.array,
    projectName: PropTypes.string,
    refreshProjects: PropTypes.func,
    socket: PropTypes.object,
};

export default withStyles(styles)(ProjectsManage);
