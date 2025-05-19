import React, { Component } from 'react';

import {
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    Button,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
} from '@mui/material';

import { HelpOutline, Check as CheckIcon } from '@mui/icons-material';

import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';

import { readFile } from '@/Vis/visUtils';
import { CustomEditor } from '@/Components/CustomEditor';

interface CSSProps {
    projectName: string;
    socket: any;
    saveCssFile: (directory: string, file: string, value: string) => void;
    adapterId: string;
    themeType: ThemeType;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    editMode: boolean;
}
interface CSSState {
    type: 'global' | 'local';
    localCss: string;
    globalCss: string;
    showHelp: boolean;
    saving: boolean;
}

export default class CSS extends Component<CSSProps, CSSState> {
    private localCssTimer: ReturnType<typeof setTimeout> | null = null;
    private globalCssTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: CSSProps) {
        super(props);
        this.state = {
            type: 'global',
            localCss: '',
            globalCss: '',
            showHelp: false,
            saving: false,
        };
    }

    async componentDidMount(): Promise<void> {
        const newState: Partial<CSSState> = {};
        try {
            newState.globalCss = (await readFile(
                this.props.socket,
                this.props.adapterId,
                'vis-common-user.css',
            )) as string;
        } catch (e) {
            if (e !== 'Not exists') {
                console.warn(`Cannot loading global CSS: ${e}`);
            }
        }
        try {
            newState.localCss = (await readFile(
                this.props.socket,
                this.props.adapterId,
                `${this.props.projectName}/vis-user.css`,
            )) as string;
        } catch (e) {
            if (e !== 'Not exists') {
                console.warn(`Cannot load project CSS: ${e}`);
            }
        }
        if (window.localStorage.getItem('CSS.type')) {
            newState.type = window.localStorage.getItem('CSS.type') as 'global' | 'local';
        }
        this.setState(newState as CSSState);
    }

    save(value: string, saveType: 'global' | 'local'): void {
        const newState: Partial<CSSState> = { saving: true };
        if (saveType === 'global') {
            newState.globalCss = value;
        } else {
            newState.localCss = value;
        }

        this.setState(newState as CSSState, () => {
            if (saveType === 'global') {
                if (this.globalCssTimer) {
                    clearTimeout(this.globalCssTimer);
                    this.globalCssTimer = null;
                }
                this.globalCssTimer = setTimeout(() => {
                    this.setState({ saving: false });
                    this.globalCssTimer = null;
                    // inform views about changed CSS
                    this.props.saveCssFile(this.props.adapterId, 'vis-common-user.css', value);
                }, 1000);
            } else {
                if (this.localCssTimer) {
                    clearTimeout(this.localCssTimer);
                    this.localCssTimer = null;
                }
                this.localCssTimer = setTimeout(() => {
                    this.localCssTimer = null;
                    this.setState({ saving: false });
                    // inform views about changed CSS
                    this.props.saveCssFile(this.props.adapterId, `${this.props.projectName}/vis-user.css`, value);
                }, 1000);
            }
        });
    }

    render(): React.JSX.Element {
        const value = this.state.type === 'global' ? this.state.globalCss : this.state.localCss;

        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {this.state.showHelp ? (
                        <Dialog
                            open={!0}
                            maxWidth={this.props.maxWidth || 'md'}
                        >
                            <DialogTitle>{I18n.t('Explanation')}</DialogTitle>
                            <DialogContent>
                                {this.state.type === 'global' ? I18n.t('help_css_global') : I18n.t('help_css_project')}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    color="grey"
                                    variant="contained"
                                    onClick={() => this.setState({ showHelp: false })}
                                    startIcon={<CheckIcon />}
                                >
                                    {I18n.t('Ok')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    ) : null}
                    <Select
                        variant="standard"
                        value={this.state.type}
                        onChange={e => {
                            this.setState({ type: e.target.value as 'global' | 'local' });
                            window.localStorage.setItem('CSS.type', e.target.value);
                        }}
                    >
                        <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                        <MenuItem value="local">{I18n.t('css_project')}</MenuItem>
                    </Select>
                    <IconButton
                        onClick={() => this.setState({ showHelp: true })}
                        size="small"
                    >
                        <HelpOutline />
                    </IconButton>
                    {this.state.saving ? <CircularProgress size={20} /> : null}
                </div>
                <CustomEditor
                    key={this.state.type}
                    type="css"
                    themeType={this.props.themeType}
                    readOnly={!this.props.editMode}
                    value={value}
                    onChange={newValue => this.save(newValue, this.state.type)}
                    width="100%"
                    height="calc(100% - 34px)"
                />
            </>
        );
    }
}
