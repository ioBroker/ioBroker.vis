import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
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

export default Scripts;
