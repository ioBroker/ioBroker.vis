import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import type { Breakpoint } from '@mui/system';

import { Close as CloseIcon } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

interface IODialogProps {
    ActionIcon?: any;
    action?: () => void;
    actionColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    actionDisabled?: boolean;
    actionNoClose?: boolean;
    actionTitle?: string;
    children?: any;
    closeTitle?: string;
    closeDisabled?: boolean;
    dialogActions?: any;
    keyboardDisabled?: boolean;
    onClose: () => void;
    open: boolean;
    title: string;
    fullScreen?: boolean;
    maxWidth?: Breakpoint;
    minWidth?: number | string;
    noTranslation?: boolean;
}

const IODialog = (props: IODialogProps) => (props.open ? <Dialog
    onClose={props.closeDisabled ? null : props.onClose}
    open={!0}
    fullScreen={!!props.fullScreen}
    maxWidth={props.maxWidth || 'md'}
>
    <DialogTitle>{props.noTranslation ? props.title : I18n.t(props.title)}</DialogTitle>
    <DialogContent
        style={{ minWidth: props.minWidth || undefined }}
        onKeyUp={e => {
            if (props.action) {
                if (!props.actionDisabled && !props.keyboardDisabled) {
                    if (e.key === 'Enter') {
                        props.action();
                        if (!props.actionNoClose) {
                            props.onClose();
                        }
                    }
                }
            }
        }}
    >
        {props.children}
    </DialogContent>
    <DialogActions>
        {props.dialogActions || null}
        {props.actionTitle
            ? <Button
                variant="contained"
                onClick={() => {
                    props.action();
                    if (!props.actionNoClose) {
                        props.onClose();
                    }
                }}
                color={props.actionColor || 'primary'}
                disabled={props.actionDisabled}
                startIcon={props.ActionIcon ? <props.ActionIcon /> : undefined}
            >
                {props.noTranslation ? props.actionTitle : I18n.t(props.actionTitle)}
            </Button> : null}
        <Button
            variant="contained"
            color="grey"
            onClick={props.onClose}
            disabled={props.closeDisabled}
            startIcon={<CloseIcon />}
        >
            {props.noTranslation && props.closeTitle ? props.closeTitle : I18n.t(props.closeTitle || 'Cancel')}
        </Button>
    </DialogActions>
</Dialog> : null);

export default IODialog;
