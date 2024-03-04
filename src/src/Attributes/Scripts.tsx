import React from 'react';
import { store } from '@/Store';
import CustomAceEditor from '../Components/CustomAceEditor';

interface ScriptsProps {
    changeProject: (project: any) => void;
    themeType: string;
    editMode: boolean;
}

const Scripts = (props: ScriptsProps) => <CustomAceEditor
    type="javascript"
    themeType={props.themeType}
    readOnly={!props.editMode}
    value={store.getState().visProject.___settings.scripts as string}
    onChange={newValue => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project.___settings.scripts = newValue;
        props.changeProject(project);
    }}
/>;

export default Scripts;
