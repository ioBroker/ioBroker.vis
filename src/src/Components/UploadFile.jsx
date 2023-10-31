import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { CircularProgress } from '@mui/material';

import { FolderZip } from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

const UploadFile = props => {
    const [fileName, setFileName] = useState('');
    const [fileData, setFileData] = useState(null);
    const [working, setWorking] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length) {
            setWorking(true);
            const reader = new FileReader();
            setFileName(acceptedFiles[0].name);

            reader.onload = async evt => {
                setWorking(false);
                setFileData(evt.target.result);
                props.onUpload(acceptedFiles[0].name, evt.target.result);
            };

            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: props.maxSize || undefined,
        accept: props.accept,
    });

    return <div
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
        {props.disabled || working ? null : <input {...getInputProps()} />}
        {working ? <CircularProgress /> :
            <p
                style={{
                    textAlign: 'center',
                    color: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit',
                }}
            >
                {fileName ? <>
                    <div>{fileName}</div>
                    {fileName.endsWith('.zip') ? <FolderZip /> : null}
                    {IMAGE_TYPES.find(ext => fileName.toLowerCase().endsWith(ext)) ?
                        <img
                            src={fileData}
                            alt="uploaded"
                            style={{
                                maxWidth: 100,
                                maxHeight: 100,
                            }}
                        /> : null}
                    {fileData ? <div style={{ fontSize: 10, opacity: 0.5 }}>
                        (
                        {Utils.formatBytes(fileData.length)}
                        )
                    </div> : null}
                </> : (props.instruction || I18n.t('Drop the files here ...'))}
            </p>}
    </div>;
};

UploadFile.propTypes = {
    onUpload: PropTypes.func,
    disabled: PropTypes.bool,
    themeType: PropTypes.string,
    accept: PropTypes.object, // {'application/zip': ['.zip'], 'application/json': ['.json']},
    instruction: PropTypes.string,
    maxSize: PropTypes.number,
};

export default UploadFile;
