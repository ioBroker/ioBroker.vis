import I18n from '@iobroker/adapter-react/i18n';
import IODialog from './Components/IODialog';

const CreateFirstProjectDialog = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    title="Do you want to create first demo project?"
    action={() => props.addProject('Demo project')}
    actionTitle="Yes"
    closeTitle="No"
/>;

export default CreateFirstProjectDialog;
