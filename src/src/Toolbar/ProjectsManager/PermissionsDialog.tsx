import React from 'react';

import {
    Check as SaveIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import {
    Checkbox,
} from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import { type Connection, I18n } from '@iobroker/adapter-react-v5';
import {
    AnyWidgetId, Permissions, Project, Widget,
} from '@/types';
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

/** Permissions assignment to username */
type PermissionsMap = Map<string, Permissions>

interface PermissionsDialogState {
    /** Contains all existing users */
    users: string[];
    /** Permissions for each user for the current project */
    projectPermissions: PermissionsMap;
    /** The permissions assignment to users for each view */
    viewPermissions: Record<string, PermissionsMap>;
    /** The permissions assignment to users for each widget */
    widgetPermissions: Record<string, PermissionsMap>;
    /** Id for each card and open status */
    cardOpen: Record<string, boolean>;
}

interface RenderViewPermissionsOptions {
    /** The user which the permissions should be shown for */
    user: string;
    /** The currently logged-in user */
    activeUser: string;
    /** The view the permissions should be rendered for */
    view: string;
    /** The current project */
    visProject: Project;
}

interface RenderWidgetPermissionsOptions extends RenderViewPermissionsOptions {
    /** The widget id */
    wid: AnyWidgetId;
    /** The widget */
    widget: Widget;
}

export default class PermissionsDialog extends React.Component<PermissionsDialogProps, PermissionsDialogState> {
    /** Admin user cannot be disabled */
    private readonly ADMIN_USER = 'admin';

    constructor(props: PermissionsDialogProps) {
        super(props);

        this.state = {
            users: [],
            projectPermissions: new Map(),
            viewPermissions: {},
            widgetPermissions: {},
            cardOpen: {},
        };
    }

    /**
     * Lifecycle hook called when component is mounted
     */
    async componentDidMount(): Promise<void> {
        const userView: Record<string, ioBroker.UserObject> = await this.props.socket.getObjectViewSystem('user', 'system.user.', 'system.user.\u9999');
        const { visProject } = store.getState();
        const projectPermissions = new Map<string, Permissions>();
        const viewPermissions: Record<string, PermissionsMap> = {};
        const widgetPermissions: Record<string, PermissionsMap> = {};

        for (const user of Object.keys(userView)) {
            projectPermissions.set(user, visProject.___settings.permissions?.[user] ?? DEFAULT_PERMISSIONS);

            for (const [viewName, view] of Object.entries(visProject)) {
                if (viewName === '___settings') {
                    continue;
                }

                if (!viewPermissions[viewName]) {
                    viewPermissions[viewName] = new Map<string, Permissions>();
                }

                viewPermissions[viewName].set(user, view.settings?.permissions?.[user] ?? DEFAULT_PERMISSIONS);

                for (const [wid, widget] of Object.entries(view.widgets)) {
                    if (!widgetPermissions[wid]) {
                        widgetPermissions[wid] = new Map<string, Permissions>();
                    }

                    widgetPermissions[wid].set(user, widget.permissions?.[user] ?? DEFAULT_PERMISSIONS);
                }
            }
        }

        this.setState({
            users: Object.keys(userView), projectPermissions, viewPermissions, widgetPermissions,
        });
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

            for (const [viewName, view] of Object.entries(project)) {
                if (viewName === '___settings') {
                    continue;
                }

                if (view.settings === undefined) {
                    view.settings = {};
                }

                if (view.settings.permissions === undefined) {
                    view.settings.permissions = {};
                }

                view.settings.permissions[user] = this.state.viewPermissions[viewName].get(user) ?? DEFAULT_PERMISSIONS;

                for (const [wid, widget] of Object.entries(view.widgets)) {
                    if (widget.permissions === undefined) {
                        widget.permissions = {};
                    }

                    widget.permissions[user] = this.state.widgetPermissions[wid].get(user) ?? DEFAULT_PERMISSIONS;
                }
            }
        }

        this.props.changeProject(project);
        this.props.onClose();
    }

    /**
     * Render the info dialog
     */
    renderInfoDialog(): React.JSX.Element {
        return <div style={{
            display: 'inline-flex', alignItems: 'center', border: '1px solid', borderRadius: '5px', width: '100%',
        }}
        >
            <InfoIcon sx={{ margin: '4px' }} />
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
     * Render the widget permissions
     *
     * @param options project, wid, user and view info
     */
    renderWidgetPermissions(options: RenderWidgetPermissionsOptions): React.JSX.Element {
        const {
            view, user, activeUser, wid, widget,
        } = options;

        return <div style={{ display: 'flex' }} key={`${user}-${view}-${wid}`}>
            <p style={{ margin: 'auto', fontSize: 12 }}>{`${widget.data.name ? `${widget.data.name} (${wid})` : wid}:`}</p>
            <div style={{
                width: '100%',
                alignSelf: 'center',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
            }}
            >
                <Checkbox
                    disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER || !this.state.projectPermissions.get(user)?.read || !this.state.viewPermissions[view].get(user)?.read}
                    checked={this.state.widgetPermissions[wid]?.get(user)?.read}
                    onClick={() => {
                        const newState = this.state;
                        const currVal = this.state.widgetPermissions[wid].get(user);

                        newState.widgetPermissions[wid].set(user, {
                            read: !currVal?.read,
                            write: !!currVal?.write,
                        });
                        this.setState(newState);
                    }}
                />
                {I18n.t('Read')}
                <Checkbox
                    disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER || !this.state.projectPermissions.get(user)?.write || !this.state.viewPermissions[view].get(user)?.write}
                    checked={this.state.widgetPermissions[wid]?.get(user)?.write}
                    onClick={() => {
                        const newState = this.state;
                        const currVal = this.state.widgetPermissions[wid].get(user);

                        newState.widgetPermissions[wid].set(user, {
                            read: !!currVal?.read,
                            write: !currVal?.write,
                        });
                        this.setState(newState);
                    }}
                />
                {I18n.t('Write')}
            </div>
        </div>;
    }

    /**
     * Render the view permissions dialog
     *
     * @param options information about view and user
     */
    renderViewPermissions(options: RenderViewPermissionsOptions): React.JSX.Element {
        const {
            view, user, activeUser, visProject,
        } = options;

        const viewId = `${user}-${view}`;

        return <Card sx={{ border: '1px solid rgba(211,211,211,0.6)', marginTop: '5px' }}>
            <CardHeader
                title={view}
                titleTypographyProps={{ fontWeight: 'bold', fontSize: 12 }}
                action={<div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    key={viewId}
                >
                    <div style={{ display: 'flex' }}>
                        <div style={{
                            width: '100%',
                            alignSelf: 'center',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }}
                        >
                            <Checkbox
                                disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER || !this.state.projectPermissions.get(user)?.read}
                                checked={this.state.viewPermissions[view]?.get(user)?.read}
                                onClick={() => {
                                    const newState = this.state;
                                    const currVal = this.state.viewPermissions[view].get(user);

                                    newState.viewPermissions[view].set(user, {
                                        read: !currVal?.read,
                                        write: !!currVal?.write,
                                    });
                                    this.setState(newState);
                                }}
                            />
                            {I18n.t('Read')}
                            <Checkbox
                                disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER || !this.state.projectPermissions.get(user)?.write}
                                checked={this.state.viewPermissions[view]?.get(user)?.write}
                                onClick={() => {
                                    const newState = this.state;
                                    const currVal = this.state.viewPermissions[view].get(user);

                                    newState.viewPermissions[view].set(user, {
                                        read: !!currVal?.read,
                                        write: !currVal?.write,
                                    });
                                    this.setState(newState);
                                }}
                            />
                            {I18n.t('Write')}
                        </div>
                        <IconButton
                            onClick={() => {
                                this.setState({
                                    cardOpen: {
                                        ...this.state.cardOpen,
                                        [viewId]: !this.state.cardOpen[viewId],
                                    },
                                });
                            }}
                            aria-label="expand"
                            size="small"
                        >
                            {this.state.cardOpen[viewId] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </div>
                </div>}
            />
            <Collapse
                in={this.state.cardOpen[viewId]}
                sx={{ borderTop: '1px solid rgba(211,211,211,0.6)' }}
            >
                <CardContent>
                    {this.state.cardOpen[viewId] ? Object.entries(visProject[view].widgets).map(([wid, widget]) => this.renderWidgetPermissions({ ...options, wid: wid as AnyWidgetId, widget })) : null}
                </CardContent>
            </Collapse>
        </Card>;
    }

    /**
     * Render the actual component
     */
    render(): React.JSX.Element {
        const { activeUser, visProject } = store.getState();

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
            minWidth="600px"
        >
            {this.renderInfoDialog()}
            {this.state.users.map(user =>
                <Card sx={{ border: '1px solid rgba(211,211,211,0.6)', marginTop: '5px' }}>
                    <CardHeader
                        title={user}
                        titleTypographyProps={{ fontWeight: 'bold', fontSize: 12 }}
                        action={<div
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            key={user}
                        >
                            <div>
                                <Checkbox
                                    disabled={user === this.ADMIN_USER || activeUser !== this.ADMIN_USER}
                                    checked={this.state.projectPermissions.get(user)?.read}
                                    onClick={() => {
                                        const newState = this.state;
                                        const currVal = this.state.projectPermissions.get(user);

                                        newState.projectPermissions.set(user, {
                                            read: !currVal?.read,
                                            write: !!currVal?.write,
                                        });
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

                                        newState.projectPermissions.set(user, {
                                            read: !!currVal?.read,
                                            write: !currVal?.write,
                                        });
                                        this.setState(newState);
                                    }}
                                />
                                {I18n.t('Write')}

                                <IconButton
                                    onClick={() => {
                                        this.setState({
                                            cardOpen: {
                                                ...this.state.cardOpen,
                                                [user]: !this.state.cardOpen[user],
                                            },
                                        });
                                    }}
                                    aria-label="expand"
                                    size="small"
                                >
                                    {this.state.cardOpen[user] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </div>
                        </div>}
                    >
                    </CardHeader>
                    <Collapse
                        in={this.state.cardOpen[user]}
                        sx={{ borderTop: '1px solid rgba(211,211,211,0.6)' }}
                    >
                        <CardContent>
                            {this.state.cardOpen[user] ? Object.keys(visProject).map(view => (view === '___settings' ? null : this.renderViewPermissions({
                                visProject, view, user, activeUser,
                            }))) : null}
                        </CardContent>
                    </Collapse>
                </Card>)}
        </IODialog>;
    }
}
