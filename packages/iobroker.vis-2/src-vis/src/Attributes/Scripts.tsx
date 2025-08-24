import React from 'react';

import type { ThemeType } from '@iobroker/adapter-react-v5';
import { store } from '@/Store';
import type { Project } from '@iobroker/types-vis-2';
import CustomEditor from '../Components/CustomEditor';

interface ScriptsProps {
    changeProject: (project: Project) => void;
    themeType: ThemeType;
    editMode: boolean;
}

const Scripts = (props: ScriptsProps): React.JSX.Element => (
    <CustomEditor
        type="javascript"
        themeType={props.themeType}
        readOnly={!props.editMode}
        value={store.getState().visProject.___settings.scripts}
        onChange={newValue => {
            const project: Project = JSON.parse(JSON.stringify(store.getState().visProject));
            project.___settings.scripts = newValue;
            props.changeProject(project);
        }}
    />
);

export default Scripts;
