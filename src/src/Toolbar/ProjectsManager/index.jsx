import PropTypes from 'prop-types';
import { useState } from 'react';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    AppBar, Button, IconButton, Tooltip, Menu, MenuItem,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BiImport, BiExport } from 'react-icons/bi';

import { Utils } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import ImportProjectDialog from './ImportProjectDialog';
import ProjectDialog from './ProjectDialog';

const styles = theme => ({
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
        minWidth: 400,
        minHeight: 300,
    },
    topBar: {
        flexDirection: 'row',
        borderRadius: 4,
        marginBottom: 12,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    button: {
        margin: 4,
    },
    '@keyframes my-blink': {
        '0%': {
            backgroundColor: theme.palette.primary.light,
        },
        '50%': {
            backgroundColor: theme.palette.secondary.main,
        },
    },
    blink: {
        animation: '$my-blink 3s infinite',
    },
});

const ProjectsManage = props => {
    const [dialog, setDialog] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogProject, setDialogProject] = useState(null);
    const [showExportDialog, setShowExportDialog] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

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

    const getLiveHost = async () => {
        const res = await props.socket.getObjectViewSystem('host', 'system.host.', 'system.host.\u9999');
        const hosts = Object.keys(res).map(id => `${id}.alive`);
        if (!hosts.length) {
            return null;
        }
        const states = await props.socket.getForeignStates(hosts);
        for (const h in states) {
            if (states[h].val) {
                return h.substring(0, h.length - '.alive'.length);
            }
        }

        return null;
    };

    const exportProject = async (projectName, isAnonymize) => {
        const host = await getLiveHost();

        if (!host) {
            window.alert(I18n.t('No live hosts found!'));
            return;
        }

        // to do find active host
        props.socket.getRawSocket().emit('sendToHost', host, 'readDirAsZip', {
            id: `${props.adapterName}.${props.instance}`,
            name: projectName || 'main',
            options: {
                settings: isAnonymize,
            },
        }, data => {
            if (data.error) {
                window.alert(data.error);
            } else {
                const d = new Date();
                let date = d.getFullYear();
                let m = d.getMonth() + 1;
                if (m < 10) {
                    m = `0${m}`;
                }
                date += `-${m}`;
                m = d.getDate();
                if (m < 10) {
                    m = `0${m}`;
                }
                date += `-${m}-`;
                window.$('body').append(`<a id="zip_download" href="data: application/zip;base64,${data.data}" download="${date}${projectName}.zip"></a>`);
                document.getElementById('zip_download').click();
                document.getElementById('zip_download').remove();
            }
        });
    };

    const exportDialog = <Menu
        onClose={() => setShowExportDialog(false)}
        open={!!showExportDialog}
        anchorEl={anchorEl}
    >
        <MenuItem
            onClick={async () => {
                setAnchorEl(null);
                setShowExportDialog(null);
                await exportProject(showExportDialog);
            }}
        >
            {I18n.t('normal')}
        </MenuItem>
        <MenuItem
            onClick={async () => {
                setAnchorEl(null);
                setShowExportDialog(null);
                await exportProject(showExportDialog, true);
            }}
        >
            {I18n.t('anonymize')}
        </MenuItem>
    </Menu>;

    return props.open ? <IODialog
        open={!0}
        onClose={props.onClose}
        title="Manage projects"
        closeTitle="Close"
        closeDisabled={!props.projects.length}
    >
        <div className={props.classes.dialog}>
            <AppBar position="static" className={props.classes.topBar}>
                <Tooltip title={I18n.t('Add')} size="small" classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => showDialog('add')} size="small" className={Utils.clsx(props.classes.button, !props.projects.length && props.classes.blink)}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={I18n.t('Import')} classes={{ popper: props.classes.tooltip }}>
                    <IconButton onClick={() => setImportDialog(true)} size="small" style={{ width: 34 }} className={props.classes.button}>
                        <BiImport fontSize={20} />
                    </IconButton>
                </Tooltip>
            </AppBar>
            {props.projects.map((projectName, key) => <div key={key} className={props.classes.projectBlock}>
                <Button
                    fullWidth
                    className={props.classes.projectButton}
                    color={projectName === props.projectName ? 'primary' : 'grey'}
                    onClick={() => {
                        props.loadProject(projectName);
                        props.onClose();
                    }}
                >
                    {projectName}
                </Button>
                <span className={props.classes.viewManageButtonActions}>
                    <Tooltip title={I18n.t('Export')} classes={{ popper: props.classes.tooltip }}>
                        <IconButton
                            onClick={event => {
                                setAnchorEl(event.currentTarget);
                                setShowExportDialog(projectName);
                            }}
                            size="small"
                        >
                            <BiExport fontSize="20" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Edit')} classes={{ popper: props.classes.tooltip }}>
                        <IconButton size="small" onClick={() => showDialog('rename', projectName)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={I18n.t('Delete')} onClick={() => showDialog('delete', projectName)} classes={{ popper: props.classes.tooltip }}>
                        <IconButton size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </span>
            </div>)}
        </div>
        {exportDialog}
        {dialog ? <ProjectDialog
            dialog={dialog}
            dialogProject={dialogProject}
            dialogName={dialogName}
            setDialog={setDialog}
            setDialogProject={setDialogProject}
            setDialogName={setDialogName}
            {...props}
            classes={{}}
        /> : null}
        {importDialog ? <ImportProjectDialog
            open
            projects={props.projects}
            themeType={props.themeType}
            onClose={closeAll => {
                setImportDialog(false);
                if (closeAll) {
                    props.onClose();
                }
            }}
            projectName={props.projectName}
            socket={props.socket}
            refreshProjects={props.refreshProjects}
            getLiveHost={getLiveHost}
            loadProject={props.loadProject}
            adapterName={props.adapterName}
            instance={props.instance}
        /> : null}
    </IODialog> : null;
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
    themeType: PropTypes.string,
};

export default withStyles(styles)(ProjectsManage);
