import IODialog from './IODialog';

const CreateFirstProjectDialog = props => {
    if (props.open) {
        return null;
    }

    return <IODialog
        open={!0}
        onClose={props.onClose}
        title="Do you want to create first demo project?"
        action={() => props.addProject('Demo project')}
        actionTitle="Yes"
        closeTitle="No"
    />;
};

export default CreateFirstProjectDialog;
