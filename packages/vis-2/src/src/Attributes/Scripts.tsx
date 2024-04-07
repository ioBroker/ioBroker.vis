import React from 'react';
import { store } from '@/Store';
// @ts-expect-error not a tsx file yet
import CustomAceEditor from '../Components/CustomAceEditor';

interface ScriptsProps {
    changeProject: (project: any) => void;
    themeType: 'dark' | 'light';
    editMode: boolean;
}

const Scripts = (props: ScriptsProps) => <CustomAceEditor
    type="javascript"
    themeType={props.themeType}
    readOnly={!props.editMode}
    value={store.getState().visProject.___settings.scripts as string}
    // @ts-expect-error will be fixed if ace editor is tsx
    onChange={newValue => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project.___settings.scripts = newValue;
        props.changeProject(project);
    }}
/>;

export default Scripts;
