import React from 'react';

import {
    Check as SaveIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import {
    Checkbox,
} from '@mui/material';
import { type Connection, I18n } from '@iobroker/adapter-react-v5';
import { Permissions, Project } from '@/types';
import { store } from '@/Store';
import { deepClone, DEFAULT_PERMISSIONS } from '@/Utils/utils';
import IODialog from '../../Components/IODialog';

interface PermissionsDialogProps {
    /** Function called when dialog is closed */
    onClose: () => void;
    /** Modify the active project */
    changeProject: (project: Project) => void;
    /** The socket connection */
    socket: Connection;
}

interface PermissionsDialogState {
    /** Contains all existing users */
    users: string[];
    /** Permissions for each user for the current project */
    projectPermissions: Map<string, Permissions>;
}

export default class PermissionsDialog extends React.Component<PermissionsDialogProps, PermissionsDialogState> {
    /** Admin user cannot be disabled */
    private readonly ADMIN_USER = 'admin';

    constructor(props: PermissionsDialogProps) {
        super(props);

        this.state = {
            users: [],
            projectPermissions: new Map(),
        };
    }

    /**
     * Lifecycle hook called when component is mounted
     */
    async componentDidMount(): Promise<void> {
        const userView: Record<string, ioBroker.UserObject> = await this.props.socket.getObjectViewSystem('user', 'system.user.', 'system.user.\u9999');
        const { visProject } = store.getState();
        const projectPermissions = new Map<string, Permissions>();

        for (const user of Object.keys(userView)) {
            projectPermissions.set(user, visProject.___settings.permissions?.[user] ?? DEFAULT_PERMISSIONS);
        }

        this.setState({ users: Object.keys(userView), projectPermissions });
    }

    /**
     * On save temporary values are set to the store
     */
    onSave(): void {
        const project = deepClone(store.getState().visProject);

        if (project.___settings.permissions === undefined) {
            project.___settings.permissions = {};
        }

        for (const [user, permissions] of this.state.projectPermissions) {
            if (user === this.ADMIN_USER) {
                continue;
            }

            project.___settings.permissions[user] = permissions;
        }

        this.props.changeProject(project);
        this.props.onClose();
    }

    /**
     * Render the info dialog
     */
    renderInfoDialog(): React.JSX.Element {
        return <div style={{
            display: 'inline-flex', alignItems: 'center', border: '1px solid', borderRadius: '5px', padding: '2px',
        }}
        >
            <InfoIcon />
            <div style={{ margin: '6px', fontSize: '12px' }}>
                <p style={{ margin: 0 }}>
                    {I18n.t('Only the admin user can change permissions')}
                    <br />
                    {I18n.t('Read = Runtime access')}
                    <br />
                    {I18n.t('Write = Edit mode access')}
                </p>
            </div>
        </div>;
    }

    /**
     * Render the actual component
     */
    render(): React.JSX.Element {
        const { activeUser } = store.getState();

        return <IODialog
            title="Permissions"
            open={!0}
            onClose={() => this.props.onClose()}
            actionNoClose
            action={() => this.onSave()}
            actionTitle="Save"
            ActionIcon={SaveIcon}
            actionDisabled={false}
            closeDisabled={false}
        >
            {this.renderInfoDialog()}
            {this.state.users.map(user => <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                key={user}
            >
                <div style={{ display: 'inline' }}>{`${user}:`}</div>
                <div>
                    <Checkbox
                        disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER}
                        checked={this.state.projectPermissions.get(user)?.read}
                        onClick={() => {
                            const newState = this.state;
                            const currVal = this.state.projectPermissions.get(user);

                            newState.projectPermissions.set(user, { read: !currVal?.read, write: !!currVal?.write });
                            this.setState(newState);
                        }}
                    />
                    {I18n.t('Read')}
                    <Checkbox
                        disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER}
                        checked={this.state.projectPermissions.get(user)?.write}
                        onClick={() => {
                            const newState = this.state;
                            const currVal = this.state.projectPermissions.get(user);

                            newState.projectPermissions.set(user, { read: !!currVal?.read, write: !currVal?.write });
                            this.setState(newState);
                        }}
                    />
                    {I18n.t('Write')}
                </div>
            </div>)}
        </IODialog>;
    }
}
