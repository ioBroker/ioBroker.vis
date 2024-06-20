import React, { useRef, useState } from 'react';

import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';

import { Close } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import type { Widget } from '@iobroker/types-vis-2';
import CustomAceEditor from '../../Components/CustomAceEditor';

interface WidgetJSProps {
    themeType: string;
    editMode: boolean;
    onClose: () => void;
    onChange: (value: string) => void;
    widget: Widget;
}

const WidgetJS = (props: WidgetJSProps) => {
    const [value, setValue] = useState(props.widget.js || '');
    const timeout = useRef(null);

    return <Dialog open={!0} onClose={props.onClose} fullWidth>
        <DialogTitle>{I18n.t('Widget\'s script')}</DialogTitle>
        <DialogContent style={{ height: 400 }}>
            <CustomAceEditor
                type="javascript"
                themeType={props.themeType}
                readOnly={!props.editMode}
                value={value}
                onChange={v => {
                    setValue(v);
                    if (timeout.current) {
                        clearTimeout(timeout.current);
                        timeout.current = null;
                    }
                    timeout.current = setTimeout(() => {
                        timeout.current = null;
                        props.onChange(v);
                    }, 1000);
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button
                onClick={props.onClose}
                color="primary"
                variant="contained"
                startIcon={<Close />}
            >
                {I18n.t('Close')}
            </Button>
        </DialogActions>
    </Dialog>;
};

export default WidgetJS;
