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
import Tooltip from '@mui/material/Tooltip';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';

import { Utils, Icon, I18n } from '@iobroker/adapter-react-v5';

const MENU_WIDTH_FULL = 200;
const MENU_WIDTH_NARROW = 56;
const TOOLBAR_HEIGHT = 48;

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        // overflow: 'hidden',
    },
    toolBar: {
        width: '100%',
        height: TOOLBAR_HEIGHT,
        overflow: 'hidden',
        lineHeight: `${TOOLBAR_HEIGHT}px`,
        paddingLeft: 16,
        fontSize: 20,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        transition: 'padding-left 0.4s ease-in-out',
    },
    toolBarWithClosedMenu: {
        paddingLeft: 16 + TOOLBAR_HEIGHT,
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
        top: 5,
        width: TOOLBAR_HEIGHT,
        height: TOOLBAR_HEIGHT,
        zIndex: 999,
        transition: 'all 0.3s ease-in-out',
    },
    openMenuButtonFull: {
        left: MENU_WIDTH_FULL - TOOLBAR_HEIGHT,
    },
    openMenuButtonNarrow: {
        left: 8,
    },
    openMenuButtonHidden: {
        left: 8,
        opacity: 0.5,
    },
    openMenuButtonIconHidden: {
        transform: 'rotate(180deg)',
        transformOrigin: 'center',
        transition: 'all 0.3s ease-in-out',
    },
    menu: {
        transition: 'width 0.4s ease-in-out, opacity 0.3s ease-in-out',
    },
    menuFull: {
        width: MENU_WIDTH_FULL,
        height: '100%',
        display: 'inline-block',
        overflow: 'hidden',
        opacity: 1,
    },
    menuNarrow: {
        width: MENU_WIDTH_NARROW,
        height: '100%',
        display: 'inline-block',
        overflow: 'hidden',
        opacity: 1,
    },
    menuHidden: {
        width: 0,
        height: '100%',
        display: 'inline-block',
        opacity: 0,
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
        height: 'calc(100% - 49px)',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    menuItem: {
        minHeight: TOOLBAR_HEIGHT,
    },
    listItemIcon: {
        width: 24,
        height: 24,
    },
    listItemIconText: {
        paddingLeft: 8,
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
        position: 'absolute',
        top: 12,
        left: 16,
    },
    listItemText: {
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease-in-out',
        opacity: 1,
    },
    listItemTextNarrow: {
        opacity: 0,
    },
    selectedMenu: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    menuToolbar: {
        height: TOOLBAR_HEIGHT,
        display: 'flex',
        lineHeight: `${TOOLBAR_HEIGHT}px`,
        verticalAlign: 'middle',
        paddingLeft: 16,
        fontSize: 20,
        whiteSpace: 'nowrap',
        transition: 'opacity 0.3s ease-in-out',
    },
    menuToolbarFull: {
        opacity: 1,
    },
    menuToolbarNarrow: {
        opacity: 0,
    },
    transparent: {
        opacity: 0,
    },
});

class VisNavigation extends React.Component {
    renderMenu(settings) {
        const items = [];
        let navigationHeaderText = settings.navigationHeaderText;

        Object.keys(this.props.views).forEach(view => {
            if (view === '___settings') {
                return;
            }
            const viewSettings = this.props.views[view].settings;
            if (viewSettings.navigation) {
                const item = {
                    text: viewSettings.navigationTitle || view,
                    color: viewSettings.navigationColor,
                    icon: viewSettings.navigationIcon || viewSettings.navigationImage,
                    view,
                };
                items.push(item);
                if (viewSettings.navigationHeaderTextAll) {
                    navigationHeaderText = viewSettings.navigationHeaderText;
                }

                if (item.icon && item.icon.startsWith('_PRJ_NAME/')) {
                    item.icon = `../${this.props.adapterName}.${this.props.instance}/${this.props.projectName}${item.icon.substring(9)}`;  // "_PRJ_NAME".length = 9
                }
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
            <div
                className={Utils.clsx(
                    this.props.classes.menuToolbar,
                    this.props.menuWidth === 'full' && this.props.classes.menuToolbarFull,
                    this.props.menuWidth === 'narrow' && this.props.classes.menuToolbarNarrow,
                    this.props.menuWidth === 'hidden' && this.props.classes.menuToolbarNarrow,
                )}
            >
                {navigationHeaderText || ''}
            </div>
            <Divider />
            <div className={this.props.classes.menuList}>
                <List>
                    {items.map((item, index) => {
                        const menuItem = <ListItem
                            key={index}
                            disablePadding
                            className={Utils.clsx(this.props.classes.menuItem, this.props.activeView === item.view && this.props.classes.selectedMenu)}
                            onClick={() => this.navigate(item.view)}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    {item.icon ? <Icon
                                        src={item.icon}
                                        className={Utils.clsx(
                                            this.props.classes.listItemIcon,
                                            this.props.activeView === item.view && this.props.classes.selectedMenu,
                                        )}
                                    /> :
                                        <>
                                            <DashboardIcon
                                                className={Utils.clsx(
                                                    this.props.activeView === item.view && this.props.classes.selectedMenu,
                                                    this.props.menuWidth !== 'full' && this.props.classes.transparent,
                                                )}
                                            />
                                            <span
                                                className={Utils.clsx(
                                                    this.props.classes.listItemIconText,
                                                    this.props.activeView === item.view && this.props.classes.selectedMenu,
                                                    this.props.menuWidth === 'full' && this.props.classes.transparent,
                                                )}
                                            >
                                                {item.text[0].toUpperCase()}
                                            </span>
                                        </>}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    classes={{
                                        primary: Utils.clsx(
                                            this.props.classes.listItemText,
                                            this.props.activeView === item.view && this.props.classes.selectedMenu,
                                            this.props.menuWidth === 'narrow' && this.props.classes.listItemTextNarrow,
                                        ),
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>;

                        return <Tooltip
                            title={this.props.menuWidth !== 'full' ? item.text : ''}
                            key={index}
                            classes={{ popper: this.props.classes.tooltip }}
                        >
                            {menuItem}
                        </Tooltip>;
                    })}
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
        let style = {};
        if (settings.navigationBarColor) {
            style = {
                backgroundColor: settings.navigationBarColor,
                color: Utils.getInvertedColor(settings.navigationBarColor, this.props.themeType, true),
            };
        }

        return <div
            className={Utils.clsx(
                this.props.classes.toolBar,
                this.props.menuWidth === 'hidden' && this.props.classes.toolBarWithClosedMenu,
            )}
            style={style}
        >
            {this.props.activeView}
        </div>;
    }

    render() {
        if (!this.props.views || !this.props.view || !this.props.views[this.props.view]) {
            return null;
        }
        const settings = this.props.views[this.props.view].settings;

        return <div className={this.props.classes.root}>
            <div
                className={Utils.clsx(
                    this.props.classes.openMenuButton,
                    this.props.menuWidth === 'full' && this.props.classes.openMenuButtonFull,
                    this.props.menuWidth === 'narrow' && this.props.classes.openMenuButtonNarrow,
                    this.props.menuWidth === 'hidden' && this.props.classes.openMenuButtonHidden,
                )}
                style={settings.navigationBar && this.props.menuWidth === 'hidden' ? { opacity: 1 } : null}
            >
                <IconButton
                    onClick={() => {
                        if (this.props.menuWidth === 'full') {
                            window.localStorage.setItem('vis.navOpened', 'narrow');
                            this.props.setMenuWidth('narrow');
                        } else if (this.props.menuWidth === 'narrow') {
                            window.localStorage.setItem('vis.navOpened', 'hidden');
                            this.props.setMenuWidth('hidden');
                        } else {
                            window.localStorage.setItem('vis.navOpened', 'full');
                            this.props.setMenuWidth('full');
                        }
                    }}
                >
                    <ChevronLeftIcon
                        className={this.props.menuWidth === 'hidden' ? this.props.classes.openMenuButtonIconHidden : ''}
                        style={settings.navigationBar && this.props.menuWidth === 'hidden' ? { color: this.props.themeType === 'dark' ? '#000' : '#FFF' } : null}
                    />
                </IconButton>
            </div>
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
    themeType: PropTypes.string,
    menuWidth: PropTypes.string,
    setMenuWidth: PropTypes.func,

    adapterName: PropTypes.string,
    instance: PropTypes.number,
    projectName: PropTypes.string,
};

export default withStyles(styles)(VisNavigation);
