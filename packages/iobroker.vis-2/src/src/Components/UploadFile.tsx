import React, { useState, useCallback } from 'react';
import { useDropzone, type FileError } from 'react-dropzone';

import { CircularProgress } from '@mui/material';

import { FolderZip } from '@mui/icons-material';

import { I18n, Utils, type ThemeType } from '@iobroker/adapter-react-v5';

const IMAGE_TYPES = [
    '.png',
    '.jpg',
    '.svg',
    '.gif',
    '.apng',
    '.avif',
    '.webp',
    '.jpeg',
    '.bmp',
    '.ico',
    '.tiff',
    '.tif',
];

interface UploadFileProps {
    onUpload: (fileName: string, fileData: string | ArrayBuffer) => void;
    disabled?: boolean;
    themeType: ThemeType;
    accept?: Record<string, string[]>; // {'application/zip': ['.zip'], 'application/json': ['.json']},
    instruction?: string;
    maxSize?: number;
}

const UploadFile = (props: UploadFileProps): React.JSX.Element => {
    const [fileName, setFileName] = useState('');
    const [fileData, setFileData] = useState(null);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState('');

    const onDrop = useCallback(
        (
            acceptedFiles: File[],
            fileRejections: {
                file: File;
                errors: FileError[];
            }[],
        ) => {
            if (acceptedFiles?.length) {
                setWorking(true);
                error && setError('');
                const reader = new FileReader();
                setFileName(acceptedFiles[0].name);

                reader.onload = async (evt: ProgressEvent<FileReader>): Promise<void> => {
                    setWorking(false);
                    setFileData(evt.target.result);
                    props.onUpload(acceptedFiles[0].name, evt.target.result);
                };

                reader.readAsDataURL(acceptedFiles[0]);
            }
            if (fileRejections?.length) {
                fileRejections[0].errors.forEach(err => {
                    if (err.code === 'file-too-large') {
                        setError(I18n.t('File too large'));
                    } else if (err.code === 'file-invalid-type') {
                        setError(I18n.t('Invalid file type'));
                    } else {
                        setError(`Error: ${err.message}`);
                    }
                    setTimeout(() => error && setError(''), 3000);
                });
            }
        },
        [],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: props.maxSize || undefined,
        accept: props.accept,
    });

    return (
        <div
            {...getRootProps()}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 200,
                borderRadius: 4,
                boxSizing: 'border-box',
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit',
            }}
        >
            {error ? <div style={{ color: '#a90000' }}>{error}</div> : null}
            {props.disabled || working ? null : <input {...getInputProps()} />}
            {working ? (
                <CircularProgress />
            ) : (
                <p
                    style={{
                        textAlign: 'center',
                        color: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit',
                    }}
                >
                    {fileName ? (
                        <>
                            <div>{fileName}</div>
                            {fileName.endsWith('.zip') ? <FolderZip /> : null}
                            {IMAGE_TYPES.find(ext => fileName.toLowerCase().endsWith(ext)) ? (
                                <img
                                    src={fileData}
                                    alt="uploaded"
                                    style={{
                                        maxWidth: 100,
                                        maxHeight: 100,
                                    }}
                                />
                            ) : null}
                            {fileData ? (
                                <div style={{ fontSize: 10, opacity: 0.5 }}>({Utils.formatBytes(fileData.length)})</div>
                            ) : null}
                        </>
                    ) : (
                        props.instruction ||
                        `${I18n.t('Drop the files here ...')} ${props.maxSize ? I18n.t('(Maximal file size is %s)', Utils.formatBytes(props.maxSize)) : ''}`
                    )}
                </p>
            )}
        </div>
    );
};

export default UploadFile;
