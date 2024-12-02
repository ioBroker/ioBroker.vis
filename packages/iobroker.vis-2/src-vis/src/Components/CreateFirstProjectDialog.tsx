import React from 'react';
import IODialog from './IODialog';

interface CreateFirstProjectDialogProps {
    onClose: () => void;
    addProject: (name: string) => void;
}

const CreateFirstProjectDialog = (props: CreateFirstProjectDialogProps): React.JSX.Element => {
    return (
        <IODialog
            onClose={props.onClose}
            title="Do you want to create first demo project?"
            action={() => props.addProject('Demo project')}
            actionTitle="Yes"
            closeTitle="No"
        />
    );
};

export default CreateFirstProjectDialog;
