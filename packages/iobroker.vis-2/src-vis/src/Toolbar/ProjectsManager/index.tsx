import React, { useState } from 'react';
import {
    AppBar,
    Button,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    CircularProgress,
    type PopoverProps,
} from '@mui/material';

import type JQuery from 'jquery';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FileCopy as IconDocument,
    Person as PermissionsIcon,
} from '@mui/icons-material';
import { BiImport, BiExport } from 'react-icons/bi';

import { I18n, type ThemeType, type LegacyConnection } from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import type { VisTheme } from '@iobroker/types-vis-2';
import IODialog from '../../Components/IODialog';
import ImportProjectDialog, { getLiveHost } from './ImportProjectDialog';
import ProjectDialog from './ProjectDialog';
import PermissionsDialog from './PermissionsDialog';

declare global {
    interface Window {
        $: JQuery;
    }
}

const styles: Record<string, React.CSSProperties> = {
    projectBlock: {
        display: 'flex',
        alignItems: 'center',
    },
    projectButton: {
        justifyContent: 'left',
        textTransform: 'none',
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
    button: {
        margin: 4,
    },
    blink: {
        animation: 'my-vis-blink 3s infinite',
    },
};

interface ProjectsManagerProps {
    addProject: Editor['addProject'];
    loadProject: Editor['loadProject'];
    onClose: () => void;
    projects: string[];
    projectName: string;
    refreshProjects: Editor['refreshProjects'];
    socket: LegacyConnection;
    themeType: ThemeType;
    theme: VisTheme;
    adapterName: string;
    instance: number;
    selectedView: string;
    changeProject: Editor['changeProject'];
    deleteProject: Editor['deleteProject'];
    renameProject: Editor['renameProject'];
}

const ProjectsManager: React.FC<ProjectsManagerProps> = props => {
    const [dialog, setDialog] = useState<'add' | 'rename' | 'delete' | null>(null);
    const [dialogName, setDialogName] = useState<string>('');
    const [dialogProject, setDialogProject] = useState<string | null>(null);
    const [showExportDialog, setShowExportDialog] = useState<string | false | null>(null);
    const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
    const [working, setWorking] = useState<string | boolean>(false);

    const [importDialog, setImportDialog] = useState(false);

    if (!props.projects) {
        return null;
    }

    const showDialog = (type: 'add' | 'rename' | 'delete', project?: string): void => {
        project = project || props.selectedView;

        const dialogDefaultName = {
            add: 'New project',
            rename: project,
            delete: '',
        };

        setDialog(type);
        setDialogProject(project);
        setDialogName(dialogDefaultName[type]);
    };

    const exportProject = async (projectName: string | false, isAnonymize?: boolean): Promise<void> => {
        setWorking(projectName);
        const host = await getLiveHost(props.socket);

        if (!host) {
            setWorking(false);
            window.alert(I18n.t('No live hosts found!'));
            return;
        }

        // to do find active host
        props.socket.getRawSocket().emit(
            'sendToHost',
            host,
            'readDirAsZip',
            {
                id: `${props.adapterName}.${props.instance}`,
                name: projectName || 'main',
                options: {
                    settings: isAnonymize,
                },
            },
            (data: { error?: string; data?: string }) => {
                if (data.error) {
                    setWorking(false);
                    window.alert(data.error);
                } else {
                    const d = new Date();
                    let date = d.getFullYear().toString();
                    let m = d.getMonth() + 1;
                    let mString = m.toString();
                    if (m < 10) {
                        mString = `0${m}`;
                    }
                    date += `-${mString}`;
                    m = d.getDate();
                    if (m < 10) {
                        mString = `0${m}`;
                    }
                    date += `-${mString}-`;
                    setWorking(false);
                    (window.$ as any)('body').append(
                        `<a id="zip_download" href="data: application/zip;base64,${data.data}" download="${date}${projectName}.zip"></a>`,
                    );
                    document.getElementById('zip_download').click();
                    document.getElementById('zip_download').remove();
                }
            },
        );
    };

    const exportDialog = (
        <Menu
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
        </Menu>
    );

    return (
        <IODialog
            onClose={props.onClose}
            title="Manage projects"
            closeTitle="Close"
            closeDisabled={!props.projects.length || !!working}
        >
            <style>
                {` 
@keyframes my-vis-blink {
    0% {
        background-color: ${props.theme.palette.primary.light};
    }
    50% {
        background-color: ${props.theme.palette.secondary.main};
    }
}         
            `}
            </style>
            <div style={styles.dialog}>
                <AppBar
                    position="static"
                    style={styles.topBar}
                >
                    <Tooltip
                        title={I18n.t('Add')}
                        // size="small"
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <IconButton
                            onClick={() => showDialog('add')}
                            size="small"
                            style={{ ...styles.button, ...(!props.projects.length ? styles.blink : undefined) }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={I18n.t('Import')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <IconButton
                            onClick={() => setImportDialog(true)}
                            size="small"
                            style={{ ...styles.button, width: 34 }}
                        >
                            <BiImport fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </AppBar>
                {props.projects
                    .sort((projName1, projName2) => projName1.toLowerCase().localeCompare(projName2))
                    .map((projectName, key) => (
                        <div
                            key={key}
                            style={styles.projectBlock}
                        >
                            <Button
                                fullWidth
                                style={styles.projectButton}
                                color={projectName === props.projectName ? 'primary' : 'grey'}
                                onClick={() => (window.location.href = `?${projectName}`)}
                                startIcon={<IconDocument />}
                            >
                                {projectName}
                            </Button>
                            <span style={styles.viewManageButtonActions}>
                                <Tooltip
                                    title={I18n.t('Permissions')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    {working === projectName ? (
                                        <CircularProgress size={22} />
                                    ) : (
                                        <IconButton
                                            onClick={event => {
                                                setAnchorEl(event.currentTarget);
                                                // TODO ensure correct project is opened
                                                if (props.projectName !== projectName) {
                                                    props.loadProject(projectName);
                                                }
                                                setShowPermissionsDialog(!!projectName);
                                            }}
                                            size="small"
                                        >
                                            <PermissionsIcon fontSize="medium" />
                                        </IconButton>
                                    )}
                                </Tooltip>
                                <Tooltip
                                    title={I18n.t('Export')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    {working === projectName ? (
                                        <CircularProgress size={22} />
                                    ) : (
                                        <IconButton
                                            onClick={event => {
                                                setAnchorEl(event.currentTarget);
                                                setShowExportDialog(projectName);
                                            }}
                                            size="small"
                                        >
                                            <BiExport fontSize="medium" />
                                        </IconButton>
                                    )}
                                </Tooltip>
                                <Tooltip
                                    title={I18n.t('Edit')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => showDialog('rename', projectName)}
                                            disabled={!!working}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip
                                    title={I18n.t('Delete')}
                                    onClick={() => showDialog('delete', projectName)}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <span>
                                        <IconButton
                                            size="small"
                                            disabled={!!working}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </span>
                        </div>
                    ))}
            </div>
            {exportDialog}
            {dialog ? (
                <ProjectDialog
                    dialog={dialog}
                    dialogProject={dialogProject}
                    dialogName={dialogName}
                    closeDialog={() => setDialog(null)}
                    setDialogProject={setDialogProject}
                    setDialogName={setDialogName}
                    addProject={props.addProject}
                    deleteProject={props.deleteProject}
                    projects={props.projects}
                    renameProject={props.renameProject}
                />
            ) : null}
            {showPermissionsDialog ? (
                <PermissionsDialog
                    socket={props.socket}
                    changeProject={props.changeProject}
                    onClose={() => setShowPermissionsDialog(false)}
                    // loadProject={props.loadProject}
                />
            ) : null}
            {importDialog ? (
                <ImportProjectDialog
                    projects={props.projects}
                    themeType={props.themeType}
                    onClose={(created, newProjectName) => {
                        setImportDialog(false);
                        if (created && props.projectName !== newProjectName) {
                            window.location.href = `?${newProjectName}`;
                        } else if (created) {
                            props.onClose();
                        }
                    }}
                    projectName={props.projectName}
                    socket={props.socket}
                    refreshProjects={props.refreshProjects}
                    loadProject={props.loadProject}
                    adapterName={props.adapterName}
                    instance={props.instance}
                    openNewProjectOnCreate
                />
            ) : null}
        </IODialog>
    );
};

export default ProjectsManager;
