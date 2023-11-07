import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputAdornment,
    Grid,
    Radio,
    RadioGroup, TextField, LinearProgress, Pagination,
} from '@mui/material';

import {
    Search as SearchIcon,
    Close as ClearIcon,
    Check as CheckIcon,
    Delete as EraseIcon,
} from '@mui/icons-material';

import { I18n, Utils, Icon } from '@iobroker/adapter-react-v5';

import UploadFile from './UploadFile';

const MAX_ICONS = 250;

const styles = theme => ({
    dialog: {
        height: '100%',
    },
    iconName: {
        fontSize: 10,
        width: 50,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    iconDiv: {
        margin: 0,
        textAlign: 'center',
        cursor: 'pointer',
        padding: 2,
        borderRadius: 2,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
        },
    },
    icon: {
        width: 48,
        height: 48,
        color: theme.palette.text.primary,
    },
    iconSelected: {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
        },
    },
    typeName: {
        whiteSpace: 'nowrap',
    },
});

const ICON_TYPES = ['baseline', 'outline', 'round', 'sharp', 'twotone', 'knx-uf', 'upload'];

class MaterialIconSelector extends Component {
    constructor(props) {
        super(props);
        this.list = {};
        this.index = null;
        const iconType = this.props.iconType || window.localStorage.getItem('vis.icon.type') || ICON_TYPES[0];
        this.state = {
            listLoaded: false,
            selectedIcon: '',
            filter: this.props.filter || window.localStorage.getItem('vis.icon.filter') || '',
            iconType,
            iconTypeLoaded: {},
            filtered: [],
            loading: iconType !== 'upload',
            page: 1,
            maxPages: 0,
        };
    }

    setStateAsync(state) {
        return new Promise(resolve => {
            this.setState(state, resolve);
        });
    }

    async loadIconSet(type) {
        if (!this.list[type]) {
            await this.setStateAsync({ loading: true });
            this.list[type] = true;
            if (type === 'customIcons') {
                try {
                    this.list[type] = await fetch(this.props.customIcons)
                        .then(res => res.json());
                } catch (e) {
                    this.list[type] = {};
                    console.error(`Cannot load custom icons from ${this.props.customIcons}: ${e}`);
                }
            } else {
                this.list[type] = await fetch(`./material-icons/${type}.json`)
                    .then(res => res.json());
            }
            const icons = Object.keys(this.list[type]);
            for (let i = 0; i < icons.length; i++) {
                const icon = icons[i];
                this.list[type][icon] = `data:image/svg+xml;base64,${this.list[type][icon]}`;
            }
            this.setState({
                iconTypeLoaded: { ...this.state.iconTypeLoaded, [type]: true },
                filtered: [],
                loading: false,
            }, () =>
                this.applyFilter(true));
        }
    }

    loadList() {
        if (!this.state.listLoaded) {
            fetch('./material-icons/index.json')
                .then(res => res.json())
                .then(async index => {
                    this.index = index;
                    await this.loadIconSet(this.state.iconType);
                    this.setState({ listLoaded: true }, () =>
                        this.applyFilter(true));
                });
        }
    }

    componentWillUnmount() {
        this.filterTimer && clearTimeout(this.filterTimer);
    }

    applyFilter(filter) {
        let timeout = 200;
        if (filter === true) {
            timeout = 0;
            filter = undefined;
        }
        this.filterTimer && clearTimeout(this.filterTimer);
        this.filterTimer = setTimeout(() => {
            this.filterTimer = null;
            let filtered;
            filter = filter === undefined ? this.state.filter : filter;
            if (filter) {
                filter = filter.toLowerCase();
                if (this.state.iconType === 'knx-uf') {
                    filtered = Object.keys(this.list['knx-uf']).filter(icon => icon.includes(filter));
                } else if (this.state.iconType === 'customIcons') {
                    filtered = Object.keys(this.list.customIcons).filter(icon => icon.includes(filter));
                } else {
                    filtered = this.index
                        .filter(icon =>
                            !icon.unsupported_families?.includes(this.state.iconType) &&
                            (icon.name.includes(filter) || icon.tags?.find(tag => tag.includes(filter))))
                        .map(icon => icon.name);
                }
            } else if (this.state.iconType === 'knx-uf') {
                filtered = Object.keys(this.list['knx-uf']);
            } else if (this.state.iconType === 'customIcons') {
                filtered = Object.keys(this.list.customIcons);
            } else {
                filtered = this.index
                    .filter(icon => !icon.unsupported_families || !icon.unsupported_families.includes(this.state.iconType))
                    .map(icon => icon.name);
            }

            this.setState({
                filtered,
                page: 1,
                maxPages: Math.ceil(filtered.length / MAX_ICONS),
            });
        }, timeout);
    }

    componentDidMount() {
        this.loadList();
    }

    onSelect() {
        if (this.state.selectedIcon && this.state.selectedIcon.startsWith('data:')) {
            this.props.onClose(this.state.selectedIcon);
        } else if (this.list[this.state.iconType] && this.list[this.state.iconType] !== true) {
            this.props.onClose(this.list[this.state.iconType][this.state.selectedIcon]);
        }
    }

    renderIcons() {
        const iconStyle = this.props.customColor && this.state.iconType === 'customIcons' ? { color: this.props.customColor } : {};
        const icons = [];

        for (let i = (this.state.page - 1) * MAX_ICONS; i < this.state.page * MAX_ICONS && i < this.state.filtered.length; i++) {
            const icon = this.state.filtered[i];
            icons.push(<div
                key={icon}
                className={Utils.clsx(this.props.classes.iconDiv, this.state.selectedIcon === icon && this.props.classes.iconSelected)}
                onClick={() => this.setState({ selectedIcon: icon })}
                onDoubleClick={() => this.setState({ selectedIcon: icon }, () => this.onSelect())}
            >
                <Icon
                    src={this.list[this.state.iconType][icon]}
                    className={this.props.classes.icon}
                    style={iconStyle}
                />
                <div className={this.props.classes.iconName}>{icon.replace(/_/g, ' ')}</div>
            </div>);
        }

        return icons;
    }

    render() {
        return <Dialog
            open={!0}
            maxWidth="lg"
            fullWidth
            classes={{ paper: this.props.classes.dialog }}
        >
            <DialogTitle>
                <span style={{ marginRight: 20 }}>
                    {this.state.iconType === 'knx-uf' ? 'KNX UF' : (this.state.iconType !== 'upload' ? 'Material' : '')}
                    &nbsp;Icon Selector
                </span>
                {this.state.iconType !== 'upload' ? <TextField
                    value={this.state.filter}
                    InputProps={{
                        startAdornment:
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>,
                        endAdornment:
                            this.state.filter ? <InputAdornment position="start">
                                <ClearIcon
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        window.localStorage.removeItem('vis.icon.filter');
                                        this.setState({ filter: '' }, () => this.applyFilter(true));
                                    }}
                                />
                            </InputAdornment> : null,
                    }}
                    variant="standard"
                    onChange={e => {
                        window.localStorage.setItem('vis.icon.filter', e.target.value);
                        this.setState({ filter: e.target.value }, () =>
                            this.applyFilter());
                    }}
                    helperText={I18n.t('material_icons_result', this.state.filtered.length)}
                /> : null}
            </DialogTitle>
            <DialogContent style={{ overflowY: 'hidden', height: '100%' }}>
                {!this.props.iconType ? <div style={{ width: 140, display: 'inline-block', verticalAlign: 'top' }}>
                    <FormControl>
                        <RadioGroup
                            value={this.state.iconType}
                            onChange={e => this.setState({ iconType: e.target.value })}
                        >
                            {ICON_TYPES.map(type => <FormControlLabel
                                onClick={async () => {
                                    window.localStorage.setItem('vis.icon.type', type);
                                    const newState = { iconType: type };
                                    if (type !== 'upload') {
                                        await this.loadIconSet(type);
                                        if (this.state.selectedIcon && !this.list[type][this.state.selectedIcon]) {
                                            newState.selectedIcon = '';
                                        }
                                    } else {
                                        newState.selectedIcon = '';
                                        newState.maxPages = 0;
                                    }

                                    this.setState(newState, () => this.applyFilter(true));
                                }}
                                key={type}
                                value={type}
                                control={<Radio />}
                                label={I18n.t(`material_icons_${type}`)}
                                classes={{ label: this.props.classes.typeName }}
                            />)}
                            {this.props.customIcons ? <FormControlLabel
                                onClick={async () => {
                                    window.localStorage.setItem('vis.icon.type', 'customIcons');
                                    await this.loadIconSet('customIcons');
                                    const newState = { iconType: 'customIcons' };
                                    if (this.state.selectedIcon && !this.list.customIcons[this.state.selectedIcon]) {
                                        newState.selectedIcon = '';
                                    }
                                    this.setState(newState);
                                }}
                                key="customIcons"
                                value="customIcons"
                                control={<Radio />}
                                label={I18n.t('custom_icons')}
                                classes={{ label: this.props.classes.typeName }}
                            /> : null}
                        </RadioGroup>
                    </FormControl>
                </div> : null}
                <div
                    style={{
                        width: 'calc(100% - 150px)',
                        display: 'inline-block',
                        height: '100%',
                        overflowY: 'auto',
                        paddingLeft: 10,
                    }}
                >
                    {this.state.iconType === 'knx-uf' ? <div style={{ paddingBottom: 20 }}>
                        {I18n.t('Source:')}
                        &nbsp;
                        <a
                            style={{ textDecoration: 'none' }}
                            href="https://github.com/OpenAutomationProject/knx-uf-iconset"
                            target="_blank"
                            rel="noreferrer"
                        >
                            https://github.com/OpenAutomationProject/knx-uf-iconset
                        </a>
                    </div> : null}
                    {this.state.iconType !== 'upload' && !this.state.loading && this.list[this.state.iconType] && this.list[this.state.iconType] !== true ? <div style={{ width: '100%' }}>
                        <Grid
                            container
                            spacing={2}
                            style={{
                                width: '100%',
                                paddingTop: 20,
                            }}
                        >
                            {this.renderIcons()}
                        </Grid>
                    </div> : (this.state.iconType !== 'upload' ? <LinearProgress /> : null)}
                    {this.state.iconType === 'upload' ? <div>
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            {I18n.t('icon_upload_hint')}
                            <br />
                            <Button
                                variant="outlined"
                                onClick={() => window.open('https://github.com/ioBroker/ioBroker.vis-2#svg-and-currentcolor', '_blank')}
                            >
                                {I18n.t('Read about currentColor in SVG')}
                            </Button>
                        </div>
                        <UploadFile
                            themeType={this.props.themeType}
                            onUpload={(name, data) => this.setState({ selectedIcon: data })}
                            maxSize={10_000}
                            accept={{
                                'image/png': ['.png'],
                                'image/jpeg': ['.jpg'],
                                'image/svg+xml': ['.svg'],
                                'image/gif': ['.gif'],
                                'image/apng': ['.apng'],
                                'image/avif': ['.avif'],
                                'image/webp': ['.webp'],
                            }}
                        />
                    </div> : null}
                </div>
            </DialogContent>
            <DialogActions>
                {this.state.maxPages > 1 && !this.state.loading ? <div style={{ marginLeft: 140 }}>
                    <Pagination
                        count={this.state.maxPages}
                        color="primary"
                        page={this.state.page}
                        onChange={(event, page) => this.setState({ page })}
                    />
                </div> : null}
                {this.state.maxPages > 1 ? <div style={{ flexGrow: 1 }} /> : null}
                {this.props.value ? <Button
                    variant="outlined"
                    color="grey"
                    onClick={() => this.props.onClose('')}
                    startIcon={<EraseIcon />}
                >
                    {I18n.t('Delete')}
                </Button> : null}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.onSelect()}
                    disabled={!this.state.selectedIcon}
                    startIcon={<CheckIcon />}
                >
                    {I18n.t('Select')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => this.props.onClose(null)}
                    startIcon={<ClearIcon />}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

MaterialIconSelector.propTypes = {
    value: PropTypes.string, // current icon
    filter: PropTypes.string, // filter for icon list
    iconType: PropTypes.string, // icon type (baseline, outlined, round, sharp, twotone)
    onClose: PropTypes.func.isRequired, // close dialog
    customIcons: PropTypes.string, // path to additional icons file
    customColor: PropTypes.string, // additional icons color
    themeType: PropTypes.string,
};

const _MaterialIconSelector = withStyles(styles)(MaterialIconSelector);
window.VisMaterialIconSelector = _MaterialIconSelector;
export default _MaterialIconSelector;
