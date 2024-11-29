import React from 'react';
import IODialog from './IODialog';

interface CreateFirstProjectDialogProps {
    open: boolean;
    onClose: () => void;
    addProject: (name: string) => void;
}

const CreateFirstProjectDialog = (props: CreateFirstProjectDialogProps): React.JSX.Element | null => {
    if (props.open) {
        return null;
    }

    return (
        <IODialog
            open={!0}
            onClose={props.onClose}
            title="Do you want to create first demo project?"
            action={() => props.addProject('Demo project')}
            actionTitle="Yes"
            closeTitle="No"
        />
    );
};

export default CreateFirstProjectDialog;
