import PropTypes from 'prop-types';
import CustomAceEditor from '../Components/CustomAceEditor';
import { store } from '../Store';

const Scripts = props => <CustomAceEditor
    type="javascript"
    themeType={props.themeType}
    readOnly={!props.editMode}
    value={store.getState().visProject.___settings.scripts}
    onChange={newValue => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project.___settings.scripts = newValue;
        props.changeProject(project);
    }}
/>;

Scripts.propTypes = {
    changeProject: PropTypes.func,
    themeType: PropTypes.string,
    editMode: PropTypes.bool,
};

export default Scripts;
