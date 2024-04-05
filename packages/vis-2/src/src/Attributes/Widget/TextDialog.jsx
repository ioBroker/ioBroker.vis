import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import IODialog from '../../Components/IODialog';
import CustomAceEditor from '../../Components/CustomAceEditor';

const TextDialog = props => {
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

TextDialog.propTypes = {
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    themeType: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
};

export default TextDialog;
