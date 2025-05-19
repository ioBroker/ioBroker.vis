import React, { useState } from 'react';

import type { ThemeType } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import CustomEditor from '../../Components/CustomEditor';

interface TextDialogProps {
    onChange: (value: string) => void;
    onClose: () => void;
    themeType: ThemeType;
    type: 'text' | 'css' | 'json' | 'javascript' | 'html';
    value: string;
}

const TextDialog = (props: TextDialogProps): React.JSX.Element => {
    const [value, changeValue] = useState(props.value || '');

    return (
        <IODialog
            keyboardDisabled
            title={props.type === 'json' ? 'JSON edit' : props.type === 'html' ? 'HTML edit' : 'Text edit'}
            actionTitle="Save"
            action={() => props.onChange(value)}
            onClose={props.onClose}
            minWidth={800}
            actionDisabled={value === props.value}
        >
            <CustomEditor
                type={props.type}
                themeType={props.themeType}
                value={value}
                height={400}
                onChange={newValue => changeValue(newValue)}
            />
        </IODialog>
    );
};

export default TextDialog;
