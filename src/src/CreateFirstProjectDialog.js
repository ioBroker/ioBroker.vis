import I18n from '@iobroker/adapter-react/i18n';
import IODialog from './Components/IODialog';

const CreateFirstProjectDialog = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    action={() => props.addProject('Demo project')}
    actionTitle="Yes"
    closeTitle="No"
>
    {I18n.t('Do you want to create first demo project?')}
</IODialog>;

export default CreateFirstProjectDialog;
