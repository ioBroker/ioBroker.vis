import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

// import 'ace-builds/webpack-resolver';

import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/worker-javascript';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/theme-clouds_midnight';
import 'ace-builds/src-min-noconflict/theme-chrome';

const Scripts = props => <AceEditor
    mode="javascript"
    theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
    width="100%"
    height="100%"
    readOnly={!props.editMode}
    value={props.project.___settings.scripts}
    onChange={newValue => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.scripts = newValue;
        props.changeProject(project);
    }}
    setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
    }}
/>;

Scripts.propTypes = {
    changeProject: PropTypes.func,
    project: PropTypes.object,
    themeName: PropTypes.string,
};

export default Scripts;
