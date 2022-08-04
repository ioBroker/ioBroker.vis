import * as React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';

import { Utils, Icon, I18n } from '@iobroker/adapter-react-v5';

const MENU_WIDTH_FULL = 200;
const MENU_WIDTH_NARROW = 56;
const TOOLBAR_HEIGHT = 48;

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
    },
    toolBar: {
        width: '100%',
        height: TOOLBAR_HEIGHT,
        overflow: 'hidden',
    },
    viewContentWithToolbar: {
        position: 'relative',
        height: `calc(100% - ${TOOLBAR_HEIGHT}px)`,
        width: '100%',
    },
    viewContentWithoutToolbar: {
        position: 'relative',
        height: '100%',
        width: '100%',
    },
    openMenuButton: {
        position: 'absolute',
        opacity: 0.5,
        top: 0,
        left: 0,
        width: 40,
        height: 40,
        zIndex: 999,
        backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#FFF',
    },
    menu: {
        transition: 'width 0.4s ease-in-out',
    },
    menuFull: {
        width: MENU_WIDTH_FULL,
        height: '100%',
        display: 'inline-block',
        overflow: 'hidden',
    },
    menuNarrow: {
        width: MENU_WIDTH_NARROW,
        height: '100%',
        display: 'inline-block',
        overflow: 'hidden',
    },
    menuHidden: {
        width: 0,
        height: '100%',
        display: 'inline-block',
    },
    afterMenu: {
        transition: 'width 0.4s ease-in-out',
    },
    afterMenuFull: {
        width: `calc(100% - ${MENU_WIDTH_FULL}px)`,
        height: '100%',
        display: 'inline-block',
    },
    afterMenuNarrow: {
        width: `calc(100% - ${MENU_WIDTH_NARROW}px)`,
        height: '100%',
        display: 'inline-block',
    },
    afterMenuHidden: {
        width: '100%',
        height: '100%',
        display: 'inline-block',
    },
    menuList: {
        width: '100%',
        height: 'calc(100% - 41px)',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    menuItem: {
        minHeight: 48,
    },
    listItemIcon: {
        width: 24,
        height: 24,
    },
    listItemIconText: {
        paddingLeft: 8,
    },
    listItemText: {
        whiteSpace: 'nowrap',
    },
    selectedMenu: {
        backgroundColor: theme.palette.secondary.main,
    },
});

class VisNavigation extends React.Component {
    renderMenu() {
        const items = [];
        Object.keys(this.props.views).forEach(view => {
            if (view === '___settings') {
                return;
            }
            const viewSettings = this.props.views[view].settings;
            if (viewSettings.navigation) {
                items.push({
                    text: viewSettings.navigationTitle || view,
                    color: viewSettings.navigationColor,
                    icon: viewSettings.navigationIcon,
                    view,
                });
            }
        });

        return <div
            className={Utils.clsx(
                this.props.classes.menu,
                this.props.menuWidth === 'full' && this.props.classes.menuFull,
                this.props.menuWidth === 'narrow' && this.props.classes.menuNarrow,
                this.props.menuWidth === 'hidden' && this.props.classes.menuHidden,
            )}
        >
            {this.props.menuWidth === 'hidden' ? <div className={this.props.classes.openMenuButton}>
                <IconButton
                    onClick={() => {
                        window.localStorage.setItem('vis.navOpened', 'full');
                        this.props.setMenuWidth('full');
                    }}
                >
                    <ChevronRightIcon />
                </IconButton>
            </div> : null}
            <div style={{ height: 40, display: 'flex' }}>
                {this.props.menuWidth === 'full' ? <div style={{ flexGrow: 1 }} /> : <div style={{ width: 6 }} />}
                <IconButton
                    onClick={() => {
                        if (this.props.menuWidth === 'full') {
                            window.localStorage.setItem('vis.navOpened', 'narrow');
                            this.props.setMenuWidth('narrow');
                        } else {
                            window.localStorage.setItem('vis.navOpened', 'hidden');
                            this.props.setMenuWidth('hidden');
                        }
                    }}
                >
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            <div className={this.props.classes.menuList}>
                <List>
                    {items.map((item, index) => (
                        <ListItem
                            key={index}
                            disablePadding
                            className={Utils.clsx(this.props.classes.menuItem, this.props.activeView === item.view && this.props.classes.selectedMenu)}
                            onClick={() => this.navigate(item.view)}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    {item.icon ? <Icon src={item.icon} className={this.props.classes.listItemIcon} /> :
                                        (this.props.menuWidth === 'full' ? <DashboardIcon /> :
                                            <span className={this.props.classes.listItemIconText}>{item.text[0].toUpperCase()}</span>)}
                                </ListItemIcon>
                                {this.props.menuWidth === 'full' ? <ListItemText primary={item.text} classes={{ primary: this.props.classes.listItemText }} className={this.props.classes.listItemText}/> : null}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </div>
        </div>;
    }

    navigate(view) {
        if (this.props.editMode) {
            window.alert(I18n.t('Ignored in edit mode'));
        } else {
            window.vis.changeView(view, view);
        }
    }

    renderToolbar(settings) {
        if (!settings.navigationBar) {
            return null;
        }
        return <div className={this.props.classes.toolBar}>
            {this.props.activeView}
        </div>;
    }

    render() {
        if (!this.props.views || !this.props.view || !this.props.views[this.props.view]) {
            return null;
        }
        const settings = this.props.views[this.props.view].settings;

        return <div className={this.props.classes.root}>
            {this.renderMenu(settings)}
            <div
                className={Utils.clsx(
                    this.props.classes.afterMenu,
                    this.props.menuWidth === 'full' && this.props.classes.afterMenuFull,
                    this.props.menuWidth === 'narrow' && this.props.classes.afterMenuNarrow,
                    this.props.menuWidth === 'hidden' && this.props.classes.afterMenuHidden,
                )}
            >
                {this.renderToolbar(settings)}
                <div className={settings.navigationBar ? this.props.classes.viewContentWithToolbar : this.props.classes.viewContentWithoutToolbar}>
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
}

VisNavigation.propTypes = {
    view: PropTypes.string,
    activeView: PropTypes.string,
    editMode: PropTypes.bool,
    views: PropTypes.object,
    menuWidth: PropTypes.string,
    setMenuWidth: PropTypes.func,
};

export default withStyles(styles)(VisNavigation);
