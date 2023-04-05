import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
    Dialog, Button, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';

import IconCopy from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

import CustomAceEditor from './CustomAceEditor';

class CodeDialog extends Component {
    render() {
        return <Dialog
            open={!0}
            onClose={() => this.props.onClose()}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle>{this.props.title || I18n.t('Code')}</DialogTitle>
            <DialogContent>
                <CustomAceEditor
                    type={this.props.mode || 'html'}
                    themeType={this.props.themeType}
                    readOnly
                    value={this.props.code}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => {
                        Utils.copyToClipboard(this.props.code);
                        window.alert(I18n.t('Copied to clipboard'));
                    }}
                    startIcon={<IconCopy />}
                    color="primary"
                >
                    {I18n.t('Copy to clipboard')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    startIcon={<CloseIcon />}
                    onClick={() => this.props.onClose()}
                >
                    {I18n.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

CodeDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    themeType: PropTypes.string,
    code: PropTypes.string.isRequired,
    mode: PropTypes.string,
};

export default CodeDialog;
