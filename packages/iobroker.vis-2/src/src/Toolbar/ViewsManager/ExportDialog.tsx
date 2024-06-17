import PropTypes from 'prop-types';

import { FileCopy as FileCopyIcon } from '@mui/icons-material';

import { Utils, I18n, ThemeType } from '@iobroker/adapter-react-v5';

import React from 'react';
import IODialog from '../../Components/IODialog';
import CustomAceEditor from '../../Components/CustomAceEditor';
import { store } from '../../Store';

interface ExportDialogProps {
    onClose: () => void;
    open: boolean;
    themeType: ThemeType;
    view: string;
}

const ExportDialog:React.FC<ExportDialogProps> = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    title={I18n.t('Export "%s"', props.view)}
    closeTitle="Close"
    action={() => Utils.copyToClipboard(JSON.stringify(store.getState().visProject[props.view], null, 2))}
    actionTitle="Copy to clipboard"
    actionNoClose
    ActionIcon={FileCopyIcon}
>
    <CustomAceEditor
        type="json"
        themeType={props.themeType}
        value={JSON.stringify(store.getState().visProject[props.view], null, 2)}
        height={200}
    />
</IODialog>;

export default ExportDialog;
