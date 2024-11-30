import React, { useRef, useState, type RefObject } from 'react';
import { Button, Fade, IconButton, Paper, Popper, TextField } from '@mui/material';

import { Clear as ClearIcon } from '@mui/icons-material';

import {
    I18n,
    SelectFile as SelectFileDialog,
    type LegacyConnection,
    type Connection,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import type { Field } from '@/Attributes/View/Items';
import commonStyles from '@/Utils/styles';
import type { VisTheme } from '@iobroker/types-vis-2';

interface EditFieldImageProps {
    value: string;
    change: (newValue: string) => void;
    disabled?: boolean;
    error?: boolean;
    editMode: boolean;
    field: Field;
    instance: number;
    adapterName: string;
    projectName: string;
    socket: LegacyConnection;
    themeType: ThemeType;
    theme: VisTheme;
}

export default function EditFieldImage(props: EditFieldImageProps): React.JSX.Element {
    const [textDialogFocused, setTextDialogFocused] = useState(false);
    const [textDialogEnabled, setTextDialogEnabled] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const textRef: RefObject<HTMLDivElement> = useRef<HTMLInputElement>();

    const urlPopper = !props.disabled ? (
        <Popper
            open={
                textDialogFocused &&
                textDialogEnabled &&
                !!props.value &&
                props.value.toString().startsWith(window.location.origin)
            }
            anchorEl={textRef.current}
            placement="bottom"
            transition
        >
            {({ TransitionProps }) => (
                <Fade
                    {...TransitionProps}
                    timeout={350}
                >
                    <Paper>
                        <Button
                            style={{ textTransform: 'none' }}
                            onClick={() =>
                                props.change(`.${props.value.toString().slice(window.location.origin.length)}`)
                            }
                        >
                            {I18n.t('Replace to ')}
                            {`.${props.value.toString().slice(window.location.origin.length)}`}
                        </Button>
                        <IconButton
                            size="small"
                            onClick={() => setTextDialogEnabled(false)}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Paper>
                </Fade>
            )}
        </Popper>
    ) : null;

    let showDialogControl: React.JSX.Element;
    if (showDialog) {
        let _value: string;
        _value = props.value;
        if (_value.startsWith('../')) {
            _value = _value.substring(3);
        } else if (_value.startsWith('_PRJ_NAME')) {
            _value = _value.replace('_PRJ_NAME', `../${props.adapterName}.${props.instance}/${props.projectName}/`);
        }
        showDialogControl = (
            <SelectFileDialog
                theme={props.theme}
                title={I18n.t('Select file')}
                onClose={() => setShowDialog(false)}
                restrictToFolder={`${props.adapterName}.${props.instance}/${props.projectName}`}
                allowNonRestricted
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                selected={_value}
                filterByType="images"
                onOk={selectedOrArray => {
                    let selected: string | undefined | null = Array.isArray(selectedOrArray)
                        ? selectedOrArray[0]
                        : selectedOrArray;
                    const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                    if (selected?.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected?.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (selected && !selected.startsWith('.')) {
                        selected = `../${selected}`;
                    } else if (!selected) {
                        selected = null;
                    }
                    props.change(selected);
                    setShowDialog(false);
                }}
                socket={props.socket as any as Connection}
            />
        );
    }

    return (
        <>
            <TextField
                variant="standard"
                fullWidth
                error={!!props.error}
                // helperText={typeof props.error === 'string' ? I18n.t(props.error) : null}
                disabled={!props.editMode || props.disabled}
                slotProps={{
                    input: {
                        sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                        endAdornment: [
                            props.value ? (
                                <IconButton
                                    key="clear"
                                    onClick={() => props.change('')}
                                    size="small"
                                >
                                    <ClearIcon />
                                </IconButton>
                            ) : null,
                            <Button
                                key="select"
                                disabled={!props.editMode || props.disabled}
                                size="small"
                                onClick={() => setShowDialog(true)}
                            >
                                ...
                            </Button>,
                        ],
                    },
                }}
                ref={textRef}
                value={props.value}
                onFocus={() => setTextDialogFocused(true)}
                onBlur={() => setTextDialogFocused(false)}
                onChange={e => props.change(e.target.value)}
            />
            {urlPopper}
            {showDialogControl}
        </>
    );
}
