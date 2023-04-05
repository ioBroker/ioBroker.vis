import PropTypes from 'prop-types';
import CustomAceEditor from '../Components/CustomAceEditor';

const Scripts = props => <CustomAceEditor
    type="javascript"
    themeType={props.themeType}
    readOnly={!props.editMode}
    value={props.project.___settings.scripts}
    onChange={newValue => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.scripts = newValue;
        props.changeProject(project);
    }}
/>;

Scripts.propTypes = {
    changeProject: PropTypes.func,
    project: PropTypes.object,
    themeType: PropTypes.string,
    editMode: PropTypes.bool,
};

export default Scripts;
