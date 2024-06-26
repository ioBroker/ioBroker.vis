import React, { useEffect, useState } from 'react';

import type { ThemeType } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import CustomAceEditor from '../../Components/CustomAceEditor';

interface TextDialogProps {
    onChange: (value: string) => void;
    onClose: () => void;
    open: boolean;
    themeType: ThemeType;
    type: string;
    value: string;
}

const TextDialog = (props: TextDialogProps) => {
    const [value, changeValue] = useState('');

    useEffect(() => {
        changeValue(props.value);
    }, [props.open]);

    return props.open ? <IODialog
        keyboardDisabled
        title={props.type === 'json' ? 'JSON edit' : (props.type === 'html' ? 'HTML edit' : 'Text edit')}
        open={!0}
        actionTitle="Save"
        action={() => props.onChange(value)}
        onClose={props.onClose}
        minWidth={800}
        actionDisabled={value === props.value}
    >
        <CustomAceEditor
            type={props.type}
            themeType={props.themeType}
            value={value}
            focus
            height={400}
            onChange={newValue => changeValue(newValue)}
        />
    </IODialog> : null;
};

export default TextDialog;
