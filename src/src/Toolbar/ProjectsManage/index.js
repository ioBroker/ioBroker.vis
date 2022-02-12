import PropTypes from 'prop-types';
import { useState } from 'react';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, IconButton, TextField, Tooltip, withStyles,
} from '@material-ui/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import AddIcon from '@material-ui/icons/Add';
import { BiImport, BiExport } from 'react-icons/bi';
import IODialog from '../../Components/IODialog';
import ImportProjectDialog from './ImportProjectDialog';

const styles = () => ({
    projectBlock: {
        display: 'flex',
        alignItems: 'center',
    },
    buttonActions: {
        textAlign: 'right',
        flex: 1,
    },
    dialog: {
        width: 200,
    },
});

const ProjectsManage = props => {
    const [addDialog, setAddDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    if (!props.projects) {
        return null;
    }

    const exportProject = projectName => {
        props.socket.readFile('vis.0', `${projectName}/vis-views.json`).then(project => {
            const zip = new JSZip();

            zip.file(`${projectName}.json`, project);

            zip.generateAsync({ type: 'blob' }).then(content => {
                saveAs(content, `${projectName}.zip`);
            });
        });
    };

    return <IODialog open={props.open} onClose={props.onClose} title="Manage projects" closeTitle="Close">
        <div className={props.classes.dialog}>
            <div>
                <Tooltip title={I18n.t('Add')} size="small">
                    <IconButton onClick={() => setAddDialog('')}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={I18n.t('Import')}>
                    <IconButton size="small">
                        <BiImport fontSize="20" onClick={() => setImportDialog('')} />
                    </IconButton>
                </Tooltip>
            </div>
            {props.projects.map((projectName, key) => <div key={key} className={props.classes.projectBlock}>
                <Button color={projectName === props.projectName ? 'primary' : undefined} onClick={() => props.loadProject(projectName)}>{projectName}</Button>
                <span className={props.classes.buttonActions}>
                    <Tooltip title={I18n.t('Import')}>
                        <IconButton size="small">
                            <BiImport fontSize="20" onClick={() => setImportDialog(projectName)} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Export')}>
                        <IconButton onClick={() => exportProject(projectName)} size="small">
                            <BiExport fontSize="20" />
                        </IconButton>
                    </Tooltip>
                </span>
            </div>)}
        </div>
        <IODialog
            title="Add project"
            action={() => props.addProject(addDialog)}
            actionTitle="Add project"
            ActionIcon={AddIcon}
            actionDisabled={props.projects.includes(addDialog)}
            open={addDialog !== false}
            onClose={() => setAddDialog(false)}
        >
            <TextField value={addDialog} onChange={e => setAddDialog(e.target.value)} label={I18n.t('Project name')} />
        </IODialog>
        <ImportProjectDialog
            open={importDialog !== false}
            onClose={() => setImportDialog(false)}
            projectName={importDialog}
            socket={props.socket}
            refreshProjects={props.refreshProjects}
        />
    </IODialog>;
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
