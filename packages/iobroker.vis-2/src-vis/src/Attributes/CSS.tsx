import React, { useEffect, useState } from 'react';

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

const CSS = (props: CSSProps): React.JSX.Element => {
    const [type, setType] = useState<'global' | 'local'>('global');

    const [localCss, setLocalCss] = useState('');
    const [globalCss, setGlobalCss] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const [localCssTimer, setLocalCssTimer] = useState(null);
    const [globalCssTimer, setGlobalCssTimer] = useState(null);

    const timers = {
        global: {
            timer: globalCssTimer,
            setTimer: setGlobalCssTimer,
            value: globalCss,
            setValue: setGlobalCss,
            directory: props.adapterId,
            file: 'vis-common-user.css',
        },
        local: {
            timer: localCssTimer,
            setTimer: setLocalCssTimer,
            value: localCss,
            setValue: setLocalCss,
            directory: props.adapterId,
            file: `${props.projectName}/vis-user.css`,
        },
    };

    useEffect(() => {
        const load = async (): Promise<void> => {
            try {
                const commonCss = (await readFile(props.socket, props.adapterId, 'vis-common-user.css')) as string;
                setGlobalCss(commonCss);
            } catch (e) {
                if (e !== 'Not exists') {
                    console.warn(`Cannot loading global CSS: ${e}`);
                }
            }
            try {
                const userCss = (await readFile(
                    props.socket,
                    props.adapterId,
                    `${props.projectName}/vis-user.css`,
                )) as string;
                setLocalCss(userCss);
            } catch (e) {
                if (e !== 'Not exists') {
                    console.warn(`Cannot load project CSS: ${e}`);
                }
            }
            if (window.localStorage.getItem('CSS.type')) {
                setType(window.localStorage.getItem('CSS.type') as 'global' | 'local');
            }
        };

        load().catch(e => console.error('Error loading CSS: ', e));
    });

    const save = (value: string, saveType: 'global' | 'local'): void => {
        timers[saveType].setValue(value);
        clearTimeout(timers[saveType].timer);
        timers[saveType].setTimer(
            setTimeout(() => {
                timers[saveType].setTimer(null);
                // inform views about changed CSS
                props.saveCssFile(timers[saveType].directory, timers[saveType].file, value);
            }, 1000),
        );
    };

    const value = type === 'global' ? globalCss : localCss;

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {showHelp ? (
                    <Dialog
                        open={!0}
                        maxWidth={props.maxWidth || 'md'}
                    >
                        <DialogTitle>{I18n.t('Explanation')}</DialogTitle>
                        <DialogContent>
                            {type === 'global' ? I18n.t('help_css_global') : I18n.t('help_css_project')}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color="grey"
                                variant="contained"
                                onClick={() => setShowHelp(false)}
                                startIcon={<CheckIcon />}
                            >
                                {I18n.t('Ok')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                ) : null}
                <Select
                    variant="standard"
                    value={type}
                    onChange={e => {
                        setType(e.target.value as 'global' | 'local');
                        window.localStorage.setItem('CSS.type', e.target.value);
                    }}
                >
                    <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                    <MenuItem value="local">{I18n.t('css_project')}</MenuItem>
                </Select>
                <IconButton
                    onClick={() => setShowHelp(true)}
                    size="small"
                >
                    <HelpOutline />
                </IconButton>
                {globalCssTimer || localCssTimer ? <CircularProgress size={20} /> : null}
            </div>
            <CustomEditor
                type="css"
                themeType={props.themeType}
                readOnly={!props.editMode}
                value={value}
                onChange={newValue => save(newValue, type)}
                width="100%"
                height="calc(100% - 34px)"
            />
        </>
    );
};

export default CSS;
