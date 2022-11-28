/*
 * Copyright 2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 */
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import IconCancel from '@mui/icons-material/Cancel';
import IconOk from '@mui/icons-material/Check';

import Utils from '@iobroker/adapter-react-v5/Components/Utils';
import I18n from '@iobroker/adapter-react-v5/i18n';
import FileBrowser from './FileBrowser';

const styles = () => ({
    headerID: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    dialog: {
        height: '95%',
    },
    dialogMobile: {
        padding: 4,
        width: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100% - 16px)',
        height: '100%',
    },
    content: {
        height: '100%',
        overflow: 'hidden',
    },
    contentMobile: {
        padding: '8px 4px',
    },
    titleRoot: {
        whiteSpace: 'nowrap',
        width: 'calc(100% - 72px)',
        overflow: 'hidden',
        display: 'inline-block',
        textOverflow: 'ellipsis',
    },
});

/**
 * @typedef {object} DialogSelectIDProps
 * @property {string} [dialogName] The internal name of the dialog; default: "default"
 * @property {string} [title] The dialog title; default: Please select object ID... (translated)
 * @property {boolean} [multiSelect] Set to true to allow the selection of multiple IDs.
 * @property {boolean} [foldersFirst] Show folders before any leaves.
 * @property {string} [imagePrefix] Prefix (default: '.')
 * @property {boolean} [showExpertButton] Show the expert button?
 * @property {import('../Components/types').ObjectBrowserColumn[]} [columns] Columns to display; default: 'name', 'type', 'role', 'room', 'func', 'val'
 * @property {import('../Components/types').ObjectBrowserType[]} [types] Object types to show; default: 'state' only
 * @property {ioBroker.Languages} [lang] The language.
 * @property {import('../Connection').default} socket The socket connection.
 * @property {boolean} [notEditable] Can't objects be edited? (default: true)
 * @property {string} [themeName] Theme name.
 * @property {string} [themeType] Theme type.
 * @property {import('../Components/types').ObjectBrowserCustomFilter} [customFilter] Custom filter.
 * @property {string | string[]} [selected] The selected IDs.
 * @property {string} [ok] The ok button text; default: OK (translated)
 * @property {string} [cancel] The cancel button text; default: Cancel (translated)
 * @property {() => void} onClose Close handler that is always called when the dialog is closed.
 * @property {(selected: string | string[] | undefined, name: string) => void} onOk Handler that is called when the user presses OK.
 * @property {{headerID: string; dialog: string; content: string}} [classes] The styling class names.
 *
 * @extends {React.Component<DialogSelectIDProps>}
 */
class DialogSelectFile extends React.Component {
    /**
     * @param {DialogSelectIDProps} props
     */
    constructor(props) {
        super(props);
        this.dialogName = this.props.dialogName || 'default';
        this.dialogName = `SelectFile.${this.dialogName}`;

        this.filters = (window._localStorage || window.localStorage).getItem(this.dialogName) || '{}';

        try {
            this.filters = JSON.parse(this.filters);
        } catch (e) {
            this.filters = {};
        }

        if (props.filters) {
            this.filters = { ...this.filters, ...props.filters };
        }

        let selected = this.props.selected || [];
        if (typeof selected !== 'object') {
            selected = [selected];
        } else {
            selected = [...selected];
        }
        selected = selected.filter(id => id);

        this.state =  {
            selected,
        };
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onOk(this.props.multiSelect || !Array.isArray(this.state.selected) ? this.state.selected : this.state.selected[0] || '');
        this.props.onClose();
    }

    render() {
        let title;
        if (this.state.selected.length) {
            if (!Array.isArray(this.state.selected) || this.state.selected.length === 1) {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" className={this.props.classes.headerID}>
                        {this.state.selected}
                    </span>,
                ];
            } else {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" className={this.props.classes.headerID}>
                        {I18n.t('%s items', this.state.selected.length)}
                    </span>,
                ];
            }
        } else {
            title = this.props.title || I18n.t('ra_Please select object ID...');
        }

        return <Dialog
            onClose={() => {}}
            maxWidth={false}
            classes={{ paper: Utils.clsx(this.props.classes.dialog, this.props.classes.dialogMobile) }}
            fullWidth
            open={!0}
            aria-labelledby="selectfile-dialog-title"
        >
            <DialogTitle id="selectfile-dialog-title" classes={{ root: this.props.classes.titleRoot }}>{title}</DialogTitle>
            <DialogContent className={Utils.clsx(this.props.classes.content, this.props.classes.contentMobile)}>
                <FileBrowser
                    ready
                    allowUpload={this.props.allowUpload}
                    allowDownload={this.props.allowDownload}
                    allowCreateFolder={this.props.allowCreateFolder}
                    allowDelete={this.props.allowDelete}
                    allowView={this.props.allowView}
                    showToolbar={this.props.showToolbar}
                    imagePrefix={this.props.imagePrefix || this.props.prefix || '../'} // prefix is for back compatibility
                    selected={this.props.selected}
                    filterByType={this.props.filterByType}
                    t={this.props.t || I18n.t}
                    lang={this.props.lang || I18n.getLanguage()}
                    socket={this.props.socket}
                    themeType={this.props.themeType}
                    themeName={this.props.themeName}
                    showExpertButton={this.props.showExpertButton}
                    expertMode={this.props.expertMode}
                    showTypeSelector={this.props.showTypeSelector}
                    onSelect={(selected, isDouble) => {
                        if (JSON.stringify(selected) !== JSON.stringify(this.state.selected)) {
                            this.setState({ selected }, () =>
                                isDouble && this.handleOk());
                        } else if (isDouble) {
                            this.handleOk();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} startIcon={<IconOk />} disabled={!this.state.selected.length} color="primary">{this.props.ok || I18n.t('ra_Ok')}</Button>
                <Button color="grey" variant="contained" onClick={() => this.handleCancel()} startIcon={<IconCancel />}>{this.props.cancel || I18n.t('ra_Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogSelectFile.propTypes = {
    dialogName: PropTypes.string, // where to store settings in localStorage
    classes: PropTypes.object,
    allowUpload: PropTypes.bool,
    allowDownload: PropTypes.bool,
    allowCreateFolder: PropTypes.bool,
    allowDelete: PropTypes.bool,
    allowView: PropTypes.bool,
    showToolbar: PropTypes.bool,
    filterByType: PropTypes.string, // e.g. images
    showTypeSelector: PropTypes.bool, // If type selector should be shown

    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    title: PropTypes.string,
    lang: PropTypes.string,
    selected: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array, // not implemented
    ]),
    socket: PropTypes.object.isRequired,
    cancel: PropTypes.string,
    imagePrefix: PropTypes.string,
    ok: PropTypes.string,
    themeName: PropTypes.string,
    themeType: PropTypes.string,
    showExpertButton: PropTypes.bool,
    expertMode: PropTypes.bool, // force expert mode
    multiSelect: PropTypes.bool, // not implemented
};

/** @type {typeof DialogSelectFile} */
const _export = withStyles(styles)(DialogSelectFile);
export default _export;
