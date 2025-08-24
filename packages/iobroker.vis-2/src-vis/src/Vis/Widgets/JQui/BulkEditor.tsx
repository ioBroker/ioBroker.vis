import React from 'react';

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TableBody,
    TableRow,
    TextField,
    Table,
    TableHead,
    TableCell,
    MenuItem,
    DialogActions,
    Popper,
    Fade,
    Paper,
    ButtonGroup,
    Fab,
    Slider,
    FormControlLabel,
    Checkbox,
    Radio,
} from '@mui/material';

import { Clear, Close, Check, Delete, Clear as ClearIcon, Add, Edit } from '@mui/icons-material';

import {
    ColorPicker,
    I18n,
    Icon,
    SelectFile as SelectFileDialog,
    type LegacyConnection,
    type Connection,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import MaterialIconSelector from '@/Components/MaterialIconSelector';
import type { AdditionalIconSet, VisTheme } from '@iobroker/types-vis-2';
import commonStyles from '../../../Utils/styles';

const BUTTONS: Record<string, string> = {
    AUTO: 'thermostat_auto',
    MANUAL: 'pan_tool',
    VACATION: 'houseboat',
    PARTY: 'celebration',
    COOL: 'ac_unit',
    DRY: 'dry',
    ECO: 'park',
    FAN_ONLY: 'air',
    HEAT: 'wb_sunny',
    HEATING: 'wb_sunny',
    OFF: 'power_settings_new',
};

export interface BulkEditorData {
    variant?: 'contained' | 'outlined' | 'text' | 'standard';
    type: 'button' | 'select' | 'radio' | 'slider';
    oid: string;
    count: number;

    [key: `value${number}`]: string | number;
    [key: `color${number}`]: string;
    [key: `text${number}`]: string;
    [key: `icon${number}`]: string | null;
    [key: `g_states-${number}`]: boolean;
    [key: `image${number}`]: string;
    [key: `activeColor${number}`]: string;
    [key: `tooltip${number}`]: string;
}

interface BulkEditorProps {
    socket: LegacyConnection;
    data: BulkEditorData;
    themeType: ThemeType;
    theme: VisTheme;
    adapterName: string;
    instance: number;
    projectName: string;
    onDataChange: (data: BulkEditorData) => void;
    additionalSets: AdditionalIconSet;
}

interface BulkEditorState {
    minMaxDialog?: boolean;
    activeLine?: number;
    editDialog?: {
        index?: number;
        value: string | number;
        /** True if add dialog, false if edit dialog */
        add: boolean;
    } | null;
    textDialogFocused: unknown[];
    states: null;
    unit: string;
    originalUnit: string;
    usePercents: boolean;
    min: number;
    max: number;
    step?: number;
    steps: number;
    texts: string[];
    values: (string | number)[];
    colors: string[];
    activeColors: string[];
    icons: (string | null)[];
    images: string[];
    tooltips: string[];
    iconDialog: null | number;
    imageDialog: null | number;
    dialog: boolean;
    dialogDelete: null | number;
    numbers?: boolean;
}

class BulkEditor extends React.Component<BulkEditorProps, BulkEditorState> {
    private readonly textRef: React.RefObject<any>[];

    constructor(props: BulkEditorProps) {
        super(props);
        this.state = {
            textDialogFocused: [],
            states: null,
            unit: '',
            originalUnit: '',
            usePercents: true,
            min: 0,
            max: 100,
            steps: 4,
            texts: [],
            values: [],
            colors: [],
            activeColors: [],
            icons: [],
            images: [],
            tooltips: [],

            iconDialog: null,
            imageDialog: null,
            dialog: false,
            dialogDelete: null,
        };
        this.textRef = [];
    }

    static iconPromise: Promise<Record<string, any>>;

    static getIcon(icon: string): Promise<string | null> {
        if (!(BulkEditor.iconPromise instanceof Promise)) {
            BulkEditor.iconPromise = fetch('./material-icons/baseline.json').then(res => res.json());
        }

        return BulkEditor.iconPromise
            .then(icons => {
                if (icons[icon]) {
                    return `data:image/svg+xml;base64,${icons[icon]}`;
                }
                return null;
            })
            .catch((e: any): null => {
                console.error(e);
                return null;
            });
    }

    static async generateFields(data: BulkEditorData, socket: LegacyConnection): Promise<BulkEditorData | false> {
        const oid: string | null | undefined = data.oid;
        if (!oid || oid === 'nothing_selected') {
            return false;
        }

        if (data.count <= 1) {
            let changed = false;
            const obj = await socket.getObject(oid);
            if (obj?.common?.states) {
                let states = obj.common.states;
                if (Array.isArray(states)) {
                    states = {};
                    Object.keys(obj.common.states).forEach(key => (states[key] = key));
                }
                const keys = Object.keys(obj.common.states);
                for (let i = 0; i < keys.length; i++) {
                    if (data[`text${i + 1}`] !== states[keys[i]]) {
                        data[`text${i + 1}`] = states[keys[i]];
                        changed = true;
                    }
                    if (data[`value${i + 1}`] !== keys[i]) {
                        data[`value${i + 1}`] = keys[i];
                        changed = true;
                    }
                    if (BUTTONS[states[keys[i]].toUpperCase()]) {
                        const icon = await BulkEditor.getIcon(BUTTONS[states[keys[i]].toUpperCase()]);
                        if (data[`icon${i + 1}`] !== icon) {
                            data[`icon${i + 1}`] = icon;
                        }
                        changed = true;
                    }

                    if (!data[`g_states-${i + 1}`]) {
                        data[`g_states-${i + 1}`] = true;
                        changed = true;
                    }
                }
                if (data.count !== keys.length) {
                    data.count = keys.length;
                    changed = true;
                }
            } else if (obj?.common?.type === 'number') {
                const unit = obj.common.unit || '';
                const min = obj.common.min !== undefined ? obj.common.min : 0;
                const max = obj.common.max !== undefined ? obj.common.max : 100;
                const step = (max - min) / 4;

                let count = 0;
                for (let i = min; i < max; i += step) {
                    count++;
                    const percent = Math.round(((i - min) / (max - min)) * 100);
                    if (data[`text${count}`] !== percent.toString() + unit) {
                        data[`text${count}`] = percent.toString() + unit;
                        changed = true;
                    }
                    if (data[`value${count}`] !== i.toString()) {
                        data[`value${count}`] = i.toString();
                        changed = true;
                    }
                    if (!data[`g_states-${count}`]) {
                        data[`g_states-${count}`] = true;
                        changed = true;
                    }
                }
                count++;
                if (data[`text${count}`] !== 100 + unit) {
                    data[`text${count}`] = 100 + unit;
                    changed = true;
                }
                if (data[`value${count}`] !== max.toString()) {
                    data[`value${count}`] = max.toString();
                    changed = true;
                }
                if (!data[`g_states-${count}`]) {
                    data[`g_states-${count}`] = true;
                    changed = true;
                }
                if (data.count !== count) {
                    changed = true;
                    data.count = count;
                }
            }
            return changed ? data : false;
        }

        return false;
    }

    async calculateFirst(useStates?: boolean): Promise<void> {
        const newState: Pick<BulkEditorState, keyof BulkEditorState> = {
            ...this.state,
            dialog: true,
        };

        if (this.props.data.count < 1 || useStates !== undefined) {
            const oid = this.props.data.oid;
            if (oid && oid !== 'nothing_selected') {
                const obj = await this.props.socket.getObject(oid);
                newState.texts = [];
                newState.values = [];

                if (obj?.common?.states) {
                    newState.numbers = false;

                    let states = obj.common.states;
                    if (Array.isArray(states)) {
                        states = {};
                        Object.keys(obj.common.states).forEach(key => (states[key] = key));
                    }
                    newState.states = states;
                    const keys = Object.keys(states);
                    newState.texts = [];
                    newState.values = [];
                    for (let i = 0; i < keys.length; i++) {
                        newState.texts[i] = states[keys[i]];
                        newState.values[i] = keys[i];
                        if (BUTTONS[states[keys[i]].toUpperCase()]) {
                            newState.icons[i] = await BulkEditor.getIcon(BUTTONS[states[keys[i]].toUpperCase()]);
                        }
                    }
                } else if (obj?.common?.type === 'number') {
                    newState.numbers = true;
                    newState.unit = obj.common.unit || '';
                    newState.min = obj.common.min !== undefined ? obj.common.min : 0;
                    newState.max = obj.common.max !== undefined ? obj.common.max : 100;
                    newState.step = (newState.max - newState.min) / 4;
                    for (let i = newState.min; i < newState.max; i += newState.step) {
                        const value = Math.round(((i - newState.min) / (newState.max - newState.min)) * 100);
                        newState.texts.push(value + newState.unit);
                        newState.values.push(i);
                    }
                    newState.texts.push(100 + newState.unit);
                    newState.values.push(newState.max);
                }
            }
        } else {
            newState.texts = [];
            newState.values = [];
            newState.icons = [];
            newState.images = [];
            newState.colors = [];
            newState.activeColors = [];
            newState.tooltips = [];
            for (let i = 0; i < this.props.data.count; i++) {
                newState.texts[i] = this.props.data[`text${i + 1}`] || '';
                newState.values[i] = this.props.data[`value${i + 1}`] || '';
                newState.icons[i] = this.props.data[`icon${i + 1}`] || '';
                newState.images[i] = this.props.data[`image${i + 1}`] || '';
                newState.colors[i] = this.props.data[`color${i + 1}`] || '';
                newState.activeColors[i] = this.props.data[`activeColor${i + 1}`] || '';
                newState.tooltips[i] = this.props.data[`tooltip${i + 1}`] || '';
            }
        }

        this.setState(newState);
    }

    renderDeleteDialog(): React.JSX.Element | null {
        if (this.state.dialogDelete === null) {
            return null;
        }
        return (
            <Dialog
                key="deleteDialog"
                open={!0}
                onClose={() => this.setState({ dialogDelete: null })}
            >
                <DialogContent>{I18n.t('jqui_Are you sure?')}</DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Delete />}
                        onClick={() => {
                            const values = [...this.state.values];
                            const texts = [...this.state.texts];
                            const icons = [...this.state.icons];
                            const images = [...this.state.images];
                            const colors = [...this.state.colors];
                            const activeColors = [...this.state.activeColors];
                            const tooltips = [...this.state.tooltips];
                            if (typeof this.state.dialogDelete === 'number') {
                                values.splice(this.state.dialogDelete, 1);
                                texts.splice(this.state.dialogDelete, 1);
                                icons.splice(this.state.dialogDelete, 1);
                                images.splice(this.state.dialogDelete, 1);
                                colors.splice(this.state.dialogDelete, 1);
                                tooltips.splice(this.state.dialogDelete, 1);
                                activeColors.splice(this.state.dialogDelete, 1);
                            }

                            this.setState({
                                values,
                                texts,
                                icons,
                                images,
                                colors,
                                activeColors,
                                tooltips,
                                dialogDelete: null,
                            });
                        }}
                    >
                        {I18n.t('Delete')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        startIcon={<Close />}
                        onClick={() => this.setState({ dialogDelete: null })}
                    >
                        {I18n.t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderMaterialDialog(): React.JSX.Element | null {
        if (this.state.iconDialog === null) {
            return null;
        }
        return (
            <MaterialIconSelector
                theme={this.props.theme}
                key="iconDialog"
                additionalSets={this.props.additionalSets}
                themeType={this.props.themeType}
                value={this.state.icons[this.state.iconDialog]}
                onClose={(icon: string) => {
                    this.setState({ iconDialog: null });
                    if (icon !== null) {
                        const icons = [...this.state.icons];
                        if (typeof this.state.iconDialog === 'number') {
                            icons[this.state.iconDialog] = icon;
                        }
                        this.setState({ icons, iconDialog: null });
                    }
                }}
            />
        );
    }

    renderImageDialog(): React.JSX.Element | null {
        if (this.state.imageDialog === null) {
            return null;
        }
        let value = this.state.images[this.state.imageDialog];
        if (value.startsWith('../')) {
            value = value.substring(3);
        } else if (value.startsWith('_PRJ_NAME/')) {
            value = value.replace(
                '_PRJ_NAME/',
                `../${this.props.adapterName}.${this.props.instance}/${this.props.projectName}/`,
            );
        }

        const onChange = (selected: string | undefined, isClose: boolean): void => {
            const projectPrefix = `${this.props.adapterName}.${this.props.instance}/${this.props.projectName}/`;
            if (selected?.startsWith(projectPrefix)) {
                selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
            } else if (selected?.startsWith('/')) {
                selected = `..${selected}`;
            } else if (selected && !selected.startsWith('.')) {
                selected = `../${selected}`;
            }
            const images = [...this.state.images];
            if (typeof this.state.imageDialog === 'number') {
                images[this.state.imageDialog] = selected || '';
            }
            this.setState({ images });

            isClose && this.setState({ imageDialog: null });
        };

        return (
            <SelectFileDialog
                theme={this.props.theme}
                key="imageDialog"
                title={I18n.t('jqui_Select file')}
                onClose={() => this.setState({ imageDialog: null })}
                restrictToFolder={`${this.props.adapterName}.${this.props.instance}/${this.props.projectName}`}
                allowNonRestricted
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                selected={value}
                filterByType="images"
                onOk={(selectedOrArray: string | string[] | undefined) =>
                    onChange(Array.isArray(selectedOrArray) ? selectedOrArray[0] : selectedOrArray, true)
                }
                socket={this.props.socket as any as Connection}
            />
        );
    }

    /**
     * Called when Bulk Editor data is submitted
     */
    onEnter(): void {
        const values = [...this.state.values];

        if (this.state.editDialog?.add) {
            const index = values.length;
            values[index] = this.state.editDialog.value;

            const texts = [...this.state.texts];
            const icons = [...this.state.icons];
            const images = [...this.state.images];
            const colors = [...this.state.colors];
            const activeColors = [...this.state.activeColors];
            const tooltips = [...this.state.tooltips];
            texts[index] = texts[index] || '';
            icons[index] = icons[index] || '';
            images[index] = images[index] || '';
            colors[index] = colors[index] || '';
            activeColors[index] = activeColors[index] || '';
            tooltips[index] = tooltips[index] || '';

            this.setState({
                values,
                texts,
                icons,
                images,
                colors,
                activeColors,
                tooltips,
                editDialog: null,
            });
        } else {
            if (this.state.editDialog?.index !== undefined) {
                values[this.state.editDialog.index] = this.state.editDialog.value;
            }

            this.setState({
                values,
                editDialog: null,
            });
        }
    }

    renderEditDialog(): React.JSX.Element | null {
        if (!this.state.editDialog) {
            return null;
        }
        const isUnique = !this.state.values
            .map(v => (typeof v === 'string' ? v.trim() : v))
            .includes(this.state.editDialog.value);

        return (
            <Dialog
                key="editDialog"
                maxWidth="sm"
                open={!0}
                onClose={() => this.setState({ editDialog: null })}
            >
                <DialogTitle>{this.state.editDialog.add ? I18n.t('jqui_Add new value') : I18n.t('Edit')}</DialogTitle>
                <DialogContent>
                    <TextField
                        onKeyDown={e => e.key === 'Enter' && isUnique && this.state.editDialog?.value && this.onEnter()}
                        fullWidth
                        autoFocus
                        variant="standard"
                        label={I18n.t('Value')}
                        value={this.state.editDialog.value}
                        onChange={e => {
                            if (this.state.editDialog) {
                                this.setState(prevState => ({
                                    editDialog: {
                                        value: e.target.value,
                                        add: prevState.editDialog.add,
                                        index: prevState.editDialog.index,
                                    },
                                }));
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!isUnique || !this.state.editDialog.value}
                        startIcon={this.state.editDialog.add ? <Add /> : <Check />}
                        onClick={() => this.onEnter()}
                    >
                        {this.state.editDialog.add ? I18n.t('Add') : I18n.t('Apply')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        startIcon={<Close />}
                        onClick={() => this.setState({ editDialog: null })}
                    >
                        {I18n.t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderLine(i: number): React.JSX.Element {
        let image = null;
        this.textRef[i] = this.textRef[i] || React.createRef();
        if (!this.state.icons[i]) {
            const value = this.state.images[i];

            const urlPopper = (
                <Popper
                    key="popper"
                    open={!!(this.state.textDialogFocused[i] && value?.toString().startsWith(window.location.origin))}
                    anchorEl={this.textRef[i]?.current}
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
                                    onClick={() => {
                                        const images = [...this.state.images];
                                        images[i] = `.${images[i].toString().slice(window.location.origin.length)}`;
                                        this.setState({ images });
                                    }}
                                >
                                    {I18n.t('jqui_Replace to')}
                                    {` .${value.toString().slice(window.location.origin.length)}`}
                                </Button>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        const textDialogFocused = [...this.state.textDialogFocused];
                                        textDialogFocused[i] = false;
                                        this.setState({ textDialogFocused });
                                    }}
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            );
            image = [
                <TextField
                    key="image"
                    variant="standard"
                    fullWidth
                    slotProps={{
                        input: {
                            sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                            endAdornment: (
                                <Button
                                    size="small"
                                    onClick={() => this.setState({ imageDialog: i })}
                                >
                                    ...
                                </Button>
                            ),
                        },
                    }}
                    ref={this.textRef[i]}
                    value={this.state.images[i] || ''}
                    onFocus={() => {
                        const textDialogFocused = [...this.state.textDialogFocused];
                        textDialogFocused[i] = true;
                        this.setState({ textDialogFocused });
                    }}
                    onBlur={() => {
                        const textDialogFocused = [...this.state.textDialogFocused];
                        textDialogFocused[i] = false;
                        this.setState({ textDialogFocused });
                    }}
                    onChange={e => {
                        const images = [...this.state.images];
                        images[i] = e.target.value;
                        this.setState({ images });
                    }}
                />,
                urlPopper,
            ];
        }

        let button;
        let iconSrc = this.state.images[i] || this.state.icons[i] || '';
        if (iconSrc.startsWith('_PRJ_NAME/')) {
            iconSrc = iconSrc.replace(
                '_PRJ_NAME/',
                `../${this.props.adapterName}.${this.props.instance}/${this.props.projectName}/`,
            );
        }

        if (this.props.data.type === 'radio') {
            const icon = (
                <Icon
                    src={iconSrc}
                    style={{ width: 24, height: 24 }}
                />
            );
            const text = (
                <div style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {this.state.texts[i]}
                </div>
            );
            button = (
                <FormControlLabel
                    control={
                        <Radio
                            onClick={() => this.setState({ activeLine: i })}
                            checked={this.state.activeLine === i}
                        />
                    }
                    labelPlacement="end"
                    label={text}
                />
            );
        } else if (this.props.data.type === 'select') {
            const icon = (
                <Icon
                    src={iconSrc}
                    style={{ width: 24, height: 24 }}
                />
            );
            const text = (
                <div style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {this.state.texts[i]}
                </div>
            );
            button = (
                <MenuItem
                    onClick={() => this.setState({ activeLine: i })}
                    selected={this.state.activeLine === i}
                >
                    {text}
                </MenuItem>
            );
        } else {
            button = (
                <Button
                    style={{
                        color:
                            this.state.activeLine === i
                                ? this.state.activeColors[i] || this.state.colors[i]
                                : this.state.colors[i] || undefined,
                    }}
                    color={this.state.activeLine === i ? 'primary' : 'grey'}
                    // "contained" | "outlined" | "text"
                    variant={
                        this.props.data.variant === undefined
                            ? 'contained'
                            : this.props.data.variant === 'standard'
                              ? 'contained'
                              : this.props.data.variant
                    }
                    onClick={() => this.setState({ activeLine: i })}
                    startIcon={
                        <Icon
                            src={iconSrc}
                            style={{ width: 24, height: 24 }}
                        />
                    }
                >
                    {this.state.texts[i]}
                </Button>
            );
        }

        return (
            <TableRow key={`${this.state.values[i]}_${i}`}>
                <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                    {this.state.values[i]}
                    <IconButton
                        size="small"
                        onClick={() =>
                            this.setState(prevState => ({ editDialog: { add: false, index: i, value: prevState.values[i] } }))
                        }
                    >
                        <Edit />
                    </IconButton>
                </TableCell>
                <TableCell>
                    <TextField
                        size="small"
                        fullWidth
                        variant="standard"
                        value={this.state.texts[i] || ''}
                        onChange={e => {
                            const texts = [...this.state.texts];
                            texts[i] = e.target.value;
                            this.setState({ texts });
                        }}
                    />
                </TableCell>
                <TableCell>
                    {this.state.images[i] ? null : (
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                value={this.state.icons[i] || ''}
                                onChange={e => {
                                    const icons = [...this.state.icons];
                                    icons[i] = e.target.value;
                                    this.setState({ icons });
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: this.state.icons[i] ? (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const icons = [...this.state.icons];
                                                    icons[i] = '';
                                                    this.setState({ icons });
                                                }}
                                            >
                                                <Clear />
                                            </IconButton>
                                        ) : null,
                                        sx: { ...commonStyles.clearPadding, ...commonStyles.fieldContent },
                                    },
                                }}
                            />
                            <Button
                                variant={this.state.icons[i] ? 'outlined' : undefined}
                                color={this.state.icons[i] ? 'grey' : undefined}
                                onClick={() => this.setState({ iconDialog: i })}
                            >
                                {this.state.icons[i] ? (
                                    <Icon
                                        src={this.state.icons[i]}
                                        style={{ width: 36, height: 36 }}
                                    />
                                ) : (
                                    '...'
                                )}
                            </Button>
                        </div>
                    )}
                </TableCell>
                <TableCell>{image}</TableCell>
                <TableCell>
                    <ColorPicker
                        value={this.state.colors[i]}
                        onChange={color => {
                            const colors = [...this.state.colors];
                            colors[i] = color;
                            this.setState({ colors });
                        }}
                    />
                </TableCell>
                <TableCell>
                    <ColorPicker
                        value={this.state.activeColors[i]}
                        onChange={color => {
                            const activeColors = [...this.state.activeColors];
                            activeColors[i] = color;
                            this.setState({ activeColors });
                        }}
                    />
                </TableCell>
                <TableCell>
                    <TextField
                        size="small"
                        fullWidth
                        variant="standard"
                        value={this.state.tooltips[i] || ''}
                        onChange={e => {
                            const tooltips = [...this.state.tooltips];
                            tooltips[i] = e.target.value;
                            this.setState({ tooltips });
                        }}
                    />
                </TableCell>
                <TableCell>
                    <IconButton onClick={() => this.setState({ dialogDelete: i })}>
                        <Delete />
                    </IconButton>
                </TableCell>
                <TableCell>{button}</TableCell>
            </TableRow>
        );
    }

    renderMinMaxDialog(): React.JSX.Element | null {
        if (!this.state.minMaxDialog) {
            return null;
        }
        const buttons = [];
        const step = Math.round((this.state.max - this.state.min) / this.state.steps);
        for (let i = this.state.min; i < this.state.max; i += step) {
            let value = i;
            if (this.state.usePercents) {
                value = Math.round(((i - this.state.min) / (this.state.max - this.state.min)) * 100);
            }
            buttons.push(
                <Button
                    key={i}
                    variant="contained"
                    disabled
                >
                    {Math.round(value).toString() + this.state.unit}
                </Button>,
            );
        }
        buttons.push(
            <Button
                key={1000}
                variant="contained"
                disabled
            >
                {(this.state.usePercents ? 100 : this.state.max).toString() + this.state.unit}
            </Button>,
        );

        return (
            <Dialog
                key="minMaxDialog"
                fullWidth
                maxWidth="md"
                open={!0}
                onClose={() => this.setState({ minMaxDialog: false })}
            >
                <DialogTitle>{I18n.t('jqui_Number settings')}</DialogTitle>
                <DialogContent>
                    {this.state.min !== 0 || this.state.max !== 100 ? (
                        <div style={{ width: '100%' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.usePercents}
                                        onChange={e => {
                                            let unit = this.state.unit;
                                            if (e.target.checked) {
                                                unit = unit || '%';
                                            } else if (unit === '%') {
                                                unit = this.state.originalUnit || '';
                                            }
                                            this.setState({ usePercents: e.target.checked, unit });
                                        }}
                                    />
                                }
                                label={I18n.t('jqui_Percents')}
                            />
                        </div>
                    ) : null}
                    <TextField
                        fullWidth
                        type="number"
                        variant="standard"
                        label={I18n.t('jqui_Minimum value')}
                        value={this.state.min}
                        onChange={e => this.setState({ min: Number(e.target.value) })}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        variant="standard"
                        label={I18n.t('jqui_Maximum value')}
                        value={this.state.max}
                        onChange={e => this.setState({ max: Number(e.target.value) })}
                    />
                    <div style={{ width: '100%' }}>
                        <div style={{ width: '100%' }}>{I18n.t('Steps')}</div>
                        <div style={{ width: '100%' }}>
                            <Slider
                                value={this.state.steps}
                                step={1}
                                valueLabelDisplay="auto"
                                min={2}
                                max={20}
                                marks={[
                                    {
                                        value: 0,
                                        label: '0',
                                    },
                                    {
                                        value: 20,
                                        label: '20',
                                    },
                                ]}
                                onChange={(_e, value) => this.setState({ steps: value as number })}
                            />
                        </div>
                    </div>
                    <TextField
                        fullWidth
                        variant="standard"
                        label={I18n.t('Unit')}
                        value={this.state.unit}
                        onChange={e => this.setState({ unit: e.target.value })}
                    />
                    <ButtonGroup
                        style={{ marginTop: 20 }}
                        // "contained" | "outlined" | "text"
                        variant={
                            this.props.data.variant === undefined
                                ? 'contained'
                                : this.props.data.variant === 'standard'
                                  ? 'contained'
                                  : this.props.data.variant
                        }
                    >
                        {buttons}
                    </ButtonGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Check />}
                        onClick={() => {
                            const newState: BulkEditorState = {
                                ...this.state,
                                minMaxDialog: false,
                                values: [],
                                texts: [...this.state.texts],
                                icons: [...this.state.icons],
                                images: [...this.state.images],
                                colors: [...this.state.colors],
                                activeColors: [...this.state.activeColors],
                                tooltips: [...this.state.tooltips],
                            };

                            const _step = Math.round((this.state.max - this.state.min) / this.state.steps);
                            let index = 0;
                            for (let i = this.state.min; i < this.state.max; i += _step) {
                                if (this.state.usePercents) {
                                    newState.texts[index] =
                                        Math.round(((i - this.state.min) / (this.state.max - this.state.min)) * 100) +
                                        this.state.unit;
                                } else {
                                    newState.texts[index] = i + this.state.unit;
                                }
                                newState.values[index] = i.toString();
                                newState.icons[index] = newState.icons[index] || '';
                                newState.images[index] = newState.images[index] || '';
                                newState.colors[index] = newState.colors[index] || '';
                                newState.activeColors[index] = newState.activeColors[index] || '';
                                newState.tooltips[index] = newState.tooltips[index] || '';
                                index++;
                            }
                            newState.values[index] = this.state.max.toString();
                            newState.texts[index] = 100 + this.state.unit;
                            this.setState(newState);
                        }}
                    >
                        {I18n.t('Apply')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        startIcon={<Close />}
                        onClick={() => this.setState({ minMaxDialog: false })}
                    >
                        {I18n.t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderDialog(): React.JSX.Element | null {
        if (!this.state.dialog) {
            return null;
        }

        return (
            <Dialog
                key="dialog"
                fullWidth
                maxWidth="lg"
                open={!0}
                onClose={() => this.setState({ dialog: false })}
            >
                <DialogTitle>{I18n.t('jqui_Bulk edit')}</DialogTitle>
                <DialogContent>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            const oid = this.props.data.oid;
                            const newState: BulkEditorState = {
                                ...this.state,
                                minMaxDialog: true,
                                usePercents: true,
                                min: this.state.min,
                                max: this.state.max || 100,
                                steps: 4,
                                unit: '%',
                            };

                            if (oid && oid !== 'nothing_selected') {
                                const obj = await this.props.socket.getObject(oid);
                                newState.min = obj?.common?.min;
                                if (newState.min === undefined || newState.min === null) {
                                    newState.min = 0;
                                }
                                newState.max = obj?.common?.max;
                                if (newState.max === undefined || newState.max === null) {
                                    newState.max = 100;
                                }
                                newState.originalUnit = obj?.common?.unit || '';
                            }
                            this.setState(newState);
                        }}
                    >
                        {I18n.t('jqui_Generate steps')}
                    </Button>
                    {this.state.states ? (
                        <Button
                            variant="contained"
                            onClick={() => this.calculateFirst(true)}
                        >
                            {I18n.t('jqui_Generate states')}
                        </Button>
                    ) : null}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{I18n.t('Value')}</TableCell>
                                <TableCell>{I18n.t('Text')}</TableCell>
                                <TableCell>{I18n.t('Icon')}</TableCell>
                                <TableCell>{I18n.t('Image')}</TableCell>
                                <TableCell>{I18n.t('color')}</TableCell>
                                <TableCell>{I18n.t('jqui_active_color')}</TableCell>
                                <TableCell>{I18n.t('jqui_tooltip')}</TableCell>
                                <TableCell>
                                    <Fab
                                        size="small"
                                        style={{ marginRight: 8 }}
                                        onClick={() => this.setState({ editDialog: { add: true, value: '' } })}
                                    >
                                        <Add />
                                    </Fab>
                                </TableCell>
                                <TableCell>{I18n.t('jqui_Example')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{this.state.values.map((_, i) => this.renderLine(i))}</TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Check />}
                        onClick={() => {
                            // apply changes
                            const data = { ...this.props.data };
                            for (let i = 0; i < this.state.values.length; i++) {
                                data[`text${i + 1}`] = this.state.texts[i];
                                data[`value${i + 1}`] = this.state.values[i];
                                data[`icon${i + 1}`] = this.state.icons[i];
                                data[`image${i + 1}`] = this.state.images[i];
                                data[`color${i + 1}`] = this.state.colors[i];
                                data[`tooltip${i + 1}`] = this.state.tooltips[i];
                                data[`activeColor${i + 1}`] = this.state.activeColors[i];
                                data[`g_states-${i + 1}`] = true;
                            }
                            // delete all others
                            for (let i = this.state.values.length + 1; i < 30; i++) {
                                delete data[`text${i}`];
                                delete data[`value${i}`];
                                delete data[`icon${i}`];
                                delete data[`image${i}`];
                                delete data[`color${i}`];
                                delete data[`tooltip${i}`];
                                delete data[`activeColor${i}`];
                                delete data[`g_states-${i}`];
                            }

                            data.count = this.state.values.length;

                            this.props.onDataChange(data);

                            this.setState({ dialog: false });
                        }}
                    >
                        {I18n.t('Apply')}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        startIcon={<Close />}
                        onClick={() => this.setState({ dialog: false })}
                    >
                        {I18n.t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render(): React.JSX.Element[] {
        return [
            <Button
                fullWidth
                key="button"
                variant="outlined"
                disabled={!this.props.data.oid}
                onClick={() => this.calculateFirst()}
            >
                {I18n.t('jqui_generate')}
            </Button>,
            this.renderMinMaxDialog(),
            this.renderImageDialog(),
            this.renderMaterialDialog(),
            this.renderDeleteDialog(),
            this.renderDialog(),
            this.renderEditDialog(),
        ];
    }
}

export default BulkEditor;
