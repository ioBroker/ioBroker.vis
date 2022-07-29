import React, { Component } from 'react';
import { withStyles } from '@mui/styles';
import {
    Checkbox, FormControl, MenuItem, Menu, List, ListItemButton, ListItemText, ListItemIcon, InputLabel,
} from '@mui/material';

import IconArrowDown from '@mui/icons-material/ArrowDropDown';
import IconArrowUp from '@mui/icons-material/ArrowDropUp';

const styles = theme => ({
    navMain: {
        borderBottom: '1px solid transparent',
        '&:hover': {
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#BBB' : '#555'}`,
        },
    },
    listItemButton: {
        padding: 0,
        margin: 0,
    },
    nav: {
        padding: 0,
    },
    textRoot: {
        margin: 0,
    },
    primary: {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 14,
    },
    secondary: {
        fontSize: 10,
        position: 'absolute',
        bottom: 0,
        right: 20,
    },
});

class MultiSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            elAnchor: null,
        };
    }

    render() {
        const props = this.props;
        const value = props.value || [];

        let text;
        let subText = null;
        if (value.length === 1) {
            const item = props.options.find(foundItem => foundItem.value === value[0]);
            if (item) {
                text = item.name;
                subText = item.subName;
                /* return <div>
                    <div style={{ }}>{item.name}</div>
                    <div style={{ fontSize: 10, fontStyle: 'italic' }}>{item.subName}</div>
                </div>;
                */
            } else {
                text = value[0];
            }
        } else {
            text = value.map(itemValue => {
                const item = props.options.find(foundItem => foundItem.value === itemValue);
                return item ? item.name : itemValue;
            }).join(', ');
        }

        const isNarrow = !props.label;

        return <FormControl variant="standard" style={{ margin: '0px 10px' }}>
            {props.label ? <InputLabel shrink>{props.label}</InputLabel> : null}

            <List
                component="nav"
                style={{
                    width: props.width,
                    marginTop: isNarrow ? 0 : 16,
                }}
                className={`${this.props.classes.navMain} ${isNarrow ? this.props.classes.nav : null}`}
            >
                <ListItemButton
                    onClick={e => this.setState({ elAnchor: e.currentTarget })}
                    classes={{ root: props.classes.listItemButton }}
                >
                    <ListItemText
                        classes={{ root: props.classes.listItemButton, primary: isNarrow ? props.classes.primary : undefined, secondary: props.classes.secondary }}
                        primary={text}
                        secondary={subText}
                    />
                    <ListItemIcon style={{ minWidth: 16 }}>{this.state.elAnchor ? <IconArrowUp /> : <IconArrowDown />}</ListItemIcon>
                </ListItemButton>
            </List>
            <Menu
                open={!!this.state.elAnchor}
                anchorEl={this.state.elAnchor}
                onClose={() => this.setState({ elAnchor: null })}
            >
                {props.options.map(selectItem => <MenuItem
                    value={selectItem.value}
                    key={selectItem.value}
                    onClick={() =>
                        this.setState({ elAnchor: null }, () =>
                            props.onChange([selectItem.value]))}
                >
                    <div style={{ display: 'flex' }}>
                        <div>
                            <Checkbox
                                checked={props.value.includes(selectItem.value)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const _value = [...value];
                                    if (_value.includes(selectItem.value)) {
                                        _value.splice(_value.indexOf(selectItem.value), 1);
                                    } else {
                                        _value.push(selectItem.value);
                                    }
                                    props.onChange(_value);
                                }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{selectItem.name}</div>
                            <div style={{ fontSize: 10, fontStyle: 'italic' }}>{selectItem.subName}</div>
                        </div>
                    </div>
                </MenuItem>)}
            </Menu>
        </FormControl>;
    }
}

export default withStyles(styles)(MultiSelect);
