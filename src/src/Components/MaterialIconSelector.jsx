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
    RadioGroup, TextField, LinearProgress,
} from '@mui/material';

import {
    Search as SearchIcon,
    Close as ClearIcon,
    Check as CheckIcon,
    Delete as EraseIcon,
} from '@mui/icons-material';

import { I18n, Utils, Icon } from '@iobroker/adapter-react-v5';

const styles = theme => ({
    iconName: {
        fontSize: 10,
        width: 50,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    iconDiv: {
        textAlign: 'center',
        cursor: 'pointer',
        padding: 2,
        borderRadius: 2,
        '&:hover': {
            backgroundColor: theme.palette.secondary.main,
        },
        paddingLeft: '2px !important',
        paddingTop: '2px !important',
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

const ICON_TYPES = ['baseline', 'outline', 'round', 'sharp', 'twotone', 'knx-uf'];

class MaterialIconSelector extends Component {
    constructor(props) {
        super(props);
        this.list = {};
        this.index = null;
        this.state = {
            listLoaded: false,
            selectedIcon: '',
            filter: this.props.filter || window.localStorage.getItem('vis.icon.filter') || '',
            iconType: this.props.iconType || window.localStorage.getItem('vis.icon.type') || ICON_TYPES[0],
            iconTypeLoaded: {},
            filtered: [],
            loading: true,
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
            this.list[type] = await fetch(`./material-icons/${type}.json`).then(res => res.json());
            const icons = Object.keys(this.list[type]);
            for (let i = 0; i < icons.length; i++) {
                const icon = icons[i];
                this.list[type][icon] = `data:image/svg+xml;base64,${this.list[type][icon]}`;
            }
            this.setState({
                iconTypeLoaded: { ...this.state.iconTypeLoaded, [type]: true },
                filtered: [],
                loading: false,
            }, () => {
                this.applyFilter(true);
            });
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
                } else {
                    filtered = this.index
                        .filter(icon =>
                            !icon.unsupported_families?.includes(this.state.iconType) &&
                            (icon.name.includes(filter) || icon.tags?.find(tag => tag.includes(filter))))
                        .map(icon => icon.name);
                }
            } else if (this.state.iconType === 'knx-uf') {
                filtered = Object.keys(this.list['knx-uf']);
            } else {
                filtered = this.index
                    .filter(icon => !icon.unsupported_families || !icon.unsupported_families.includes(this.state.iconType))
                    .map(icon => icon.name);
            }

            this.setState({ filtered });
        }, timeout);
    }

    componentDidMount() {
        this.loadList();
    }

    onSelect() {
        if (this.list[this.state.iconType] && this.list[this.state.iconType] !== true) {
            this.props.onClose(this.list[this.state.iconType][this.state.selectedIcon]);
        }
    }

    render() {
        return <Dialog
            open={!0}
            maxWidth="lg"
        >
            <DialogTitle>
                <span style={{ marginRight: 20 }}>
                    {this.state.iconType === 'knx-uf' ? 'KNX UF' : 'Material'}
                    &nbsp;Icon Selector</span>
                <TextField
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
                />
            </DialogTitle>
            <DialogContent>
                {!this.props.iconType ? <div style={{ width: 120, display: 'inline-block', verticalAlign: 'top' }}>
                    <FormControl>
                        <RadioGroup
                            value={this.state.iconType}
                            onChange={e => this.setState({ iconType: e.target.value })}
                        >
                            {ICON_TYPES.map(type => <FormControlLabel
                                onClick={async () => {
                                    window.localStorage.setItem('vis.icon.type', type);
                                    await this.loadIconSet(type);
                                    const newState = { iconType: type };
                                    if (this.state.selectedIcon && !this.list[type][this.state.selectedIcon]) {
                                        newState.selectedIcon = '';
                                    }
                                    this.setState(newState);
                                }}
                                key={type}
                                value={type}
                                control={<Radio />}
                                label={I18n.t(`material_icons_${type}`)}
                                classes={{ label: this.props.classes.typeName }}
                            />)}
                        </RadioGroup>
                    </FormControl>
                </div> : null}
                <div style={{ width: 'calc(100% - 120px)', display: 'inline-block' }}>
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
                    {!this.state.loading && this.list[this.state.iconType] && this.list[this.state.iconType] !== true ? <div style={{ width: '100%' }}>
                        <Grid container spacing={2}>
                            {this.state.filtered.map(icon =>
                                <Grid
                                    item
                                    key={icon}
                                    className={Utils.clsx(this.props.classes.iconDiv, this.state.selectedIcon === icon && this.props.classes.iconSelected)}
                                    onClick={() => this.setState({ selectedIcon: icon })}
                                    onDoubleClick={() => this.setState({ selectedIcon: icon }, () => this.onSelect())}
                                >
                                    <Icon
                                        src={this.list[this.state.iconType][icon]}
                                        className={this.props.classes.icon}
                                    />
                                    <div className={this.props.classes.iconName}>{icon.replace(/_/g, ' ')}</div>
                                </Grid>)}
                        </Grid>
                    </div> : <LinearProgress />}
                </div>
            </DialogContent>
            <DialogActions>
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
};

export default withStyles(styles)(MaterialIconSelector);
