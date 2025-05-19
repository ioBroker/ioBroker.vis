import React from 'react';
import type { ThemeType } from '@iobroker/adapter-react-v5';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
    type?: 'javascript' | 'css' | 'html' | 'json' | 'text';
    value: string;
    onChange?: (value: string) => void;
    themeType?: ThemeType;
    readOnly?: boolean;
    height?: number | string;
    width?: number | string;
    error?: boolean;
}

export function CustomEditor(props: MonacoEditorProps): React.JSX.Element {
    const { type, value, onChange, themeType, height } = props;
    const [defaultValue] = React.useState(value);

    return (
        <>
            <style>
                {`
                .vis-monaco {
                    boxSizing: border-box;
                    border: 1px solid transparent;
                }
                .vis-monaco-error {
                    boxSizing: border-box;
                    border: 1px solid #800;
                }`}
            </style>
            <Editor
                theme={themeType === 'dark' ? 'vs-dark' : 'vs-light'}
                height={height}
                language={type}
                // value={value}
                defaultValue={defaultValue}
                onChange={onChange ? (value: string): void => onChange(value || '') : undefined}
                className={props.error ? 'vis-monaco-error' : 'vis-monaco'}
                options={{
                    readOnly: !onChange,
                    minimap: { enabled: false },
                    stickyScroll: {
                        enabled: false,
                    },
                }}
            />
        </>
    );
}

export default CustomEditor;
