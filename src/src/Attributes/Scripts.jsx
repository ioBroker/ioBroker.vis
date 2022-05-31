import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import ace from 'ace-builds/src-noconflict/ace';
import javascriptWorkerUrl from 'ace-builds/src-noconflict/worker-javascript?url';

ace.config.setModuleUrl('ace/mode/javascript_worker', javascriptWorkerUrl);

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

const Scripts = props => <div>
    <AceEditor
        mode="javascript"
        theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
        width="100%"
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
    />
</div>;

Scripts.propTypes = {
    changeProject: PropTypes.func,
    project: PropTypes.object,
    themeName: PropTypes.string,
};

export default Scripts;
