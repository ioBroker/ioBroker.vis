import React, { Component } from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-html';
import 'ace-builds/src-min-noconflict/worker-html';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/theme-clouds_midnight';
import 'ace-builds/src-min-noconflict/theme-chrome';

import {
    Dialog, Button, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';

import IconCopy from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

import { I18n } from '@iobroker/adapter-react-v5';

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
                <AceEditor
                    mode={this.props.mode || 'html'}
                    theme={this.props.themeType === 'dark' ? 'clouds_midnight' : 'chrome'}
                    readOnly
                    value={this.props.code}
                    width="100%"
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => {
                        copy(this.props.code);
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
