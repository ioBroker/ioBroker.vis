import React from 'react';

import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Tabs,
    Tab, Box,
} from '@mui/material';

import {
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';

import { Utils, Icon } from '@iobroker/adapter-react-v5';
import type { ViewSettings, VisContext, VisTheme } from '@iobroker/types-vis-2';
import commonStyles from '@/Utils/styles';

const MENU_WIDTH_FULL = 200;
const MENU_WIDTH_NARROW = 56;
const TOOLBAR_SIZE = 48;

const styles: Record<string, any> = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        // overflow: 'hidden',
    },
    rootHorizontal: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        // overflow: 'hidden',
    },
    toolBar: (theme: VisTheme) => ({
        width: '100%',
        height: TOOLBAR_SIZE,
        overflow: 'hidden',
        lineHeight: `${TOOLBAR_SIZE}px`,
        pl: '16px',
        fontSize: 20,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        transition: 'padding-left 0.4s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    }),
    toolbarIcon: {
        height: 32,
        width: 'auto',
    },
    verticalMenu: (theme: VisTheme) => ({
        width: '100%',
        top: 0,
        left: 0,
        height: TOOLBAR_SIZE,
        overflow: 'hidden',
        lineHeight: `${TOOLBAR_SIZE}px`,
        backgroundColor: theme.palette.primary.main,
        zIndex: 450,
    }),
    toolBarWithClosedMenu: {
        paddingLeft: 16 + TOOLBAR_SIZE,
    },
    viewContentWithToolbar: {
        position: 'relative',
        height: `calc(100% - ${TOOLBAR_SIZE}px)`,
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
        width: TOOLBAR_SIZE,
        height: TOOLBAR_SIZE,
        zIndex: 999,
        transition: 'all 0.3s ease-in-out',
    },
    openMenuButtonFull: {
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
        minHeight: TOOLBAR_SIZE,
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
    selectedMenu: (theme: VisTheme) => ({
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
    }),
    menuToolbar: {
        height: TOOLBAR_SIZE,
        display: 'flex',
        lineHeight: `${TOOLBAR_SIZE}px`,
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
};

interface VisNavigationProps {
    context: VisContext;
    view: string;
    activeView: string;
    editMode: boolean;
    menuWidth: string;
    setMenuWidth: (width: string) => void;
    theme: VisTheme;
    visInWidget?: boolean;
    children: React.ReactNode;
}

interface VisNavigationState {
    menuWidth: string;
}

interface MenuItem {
    text: string;
    color: string;
    icon: string;
    noText: boolean;
    order: number;
    view: string;
}

class VisNavigation extends React.Component<VisNavigationProps, VisNavigationState> {
    renderMenu(settings: ViewSettings, menuFullWidth: number) {
        const items: MenuItem[] = [];

        Object.keys(this.props.context.views).forEach(view => {
            if (view === '___settings') {
                return;
            }
            const viewSettings = this.props.context.views[view].settings;
            if (viewSettings.navigation) {
                const item = {
                    text: settings.navigationOrientation === 'horizontal' && viewSettings.navigationOnlyIcon ? null : (viewSettings.navigationTitle || view),
                    color: viewSettings.navigationColor,
                    icon: viewSettings.navigationIcon || viewSettings.navigationImage,
                    noText: viewSettings.navigationOnlyIcon,
                    order: parseInt(viewSettings.navigationOrder as any as string || '0'),
                    view,
                };

                items.push(item);

                if (item.icon?.startsWith('_PRJ_NAME/')) {
                    item.icon = `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}${item.icon.substring(9)}`;  // "_PRJ_NAME".length = 9
                }
            }
        });

        items.sort((prevItem, nextItem) => (prevItem.order === nextItem.order ? 0 : prevItem.order < nextItem.order ? -1 : 1));

        if (settings.navigationOrientation === 'horizontal') {
            return <Box
                component="div"
                sx={styles.verticalMenu}
                style={{
                    backgroundColor: settings.navigationBarColor || this.props.context.theme.palette.background.paper,
                    opacity: this.props.editMode ? 0.4 : 1,
                    position: this.props.editMode ? 'relative' : 'fixed',
                }}
            >
                <Tabs
                    value={this.props.activeView}
                >
                    {items.map((item, index) => <Tab
                        iconPosition="start"
                        key={index}
                        style={{ minHeight: 48, minWidth: item.noText ? 20 : undefined }}
                        icon={item.icon ? <Icon src={item.icon} style={styles.listItemIcon} /> : undefined}
                        onClick={() => this.props.context.changeView(item.view)}
                        value={item.view}
                        label={item.text}
                    />)}
                </Tabs>
            </Box>;
        }

        return <div
            style={{
                ...styles.menu,
                ...(this.props.menuWidth === 'full' ? styles.menuFull : undefined),
                ...(this.props.menuWidth === 'narrow' ? styles.menuNarrow : undefined),
                ...(this.props.menuWidth === 'hidden' ? styles.menuHidden : undefined),
                opacity: this.props.editMode ? 0.4 : 1,
                backgroundColor: (settings.navigationBackground as string) || undefined,
                width: this.props.menuWidth === 'full' ? menuFullWidth : undefined,
            }}
        >
            <div
                style={{
                    ...styles.menuToolbar,
                    ...(this.props.menuWidth === 'full' ? styles.menuToolbarFull : undefined),
                    ...(this.props.menuWidth === 'narrow' ? styles.menuToolbarNarrow : undefined),
                    ...(this.props.menuWidth === 'hidden' ? styles.menuToolbarNarrow : undefined),
                    color: (settings.navigationHeaderTextColor as string) || undefined,
                }}
            >
                {(settings.navigationHeaderText as string) || ''}
            </div>
            <Divider />
            <div style={styles.menuList}>
                <List>
                    {items.map((item, index) => {
                        const menuItem = <ListItem
                            key={index}
                            disablePadding
                            sx={Utils.getStyle(this.props.theme, styles.menuItem, this.props.activeView === item.view && styles.selectedMenu)}
                            style={{ backgroundColor: this.props.activeView === item.view ? (settings.navigationSelectedBackground as string) : undefined }}
                            onClick={async () => {
                                if (settings.navigationHideOnSelection) {
                                    await this.hideNavigationMenu();
                                }
                                this.props.context.changeView(item.view);
                            }}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    {item.icon ? <Icon
                                        src={item.icon}
                                        style={{ color: this.props.activeView === item.view ? (settings.navigationSelectedColor as string) : (settings.navigationColor as string), backgroundColor: 'rgba(1,1,1,0)' }}
                                        sx={Utils.getStyle(this.props.theme, styles.listItemIcon, this.props.activeView === item.view && styles.selectedMenu)}
                                    /> :
                                        <>
                                            <DashboardIcon
                                                style={{ color: this.props.activeView === item.view ? (settings.navigationSelectedColor as string) : (settings.navigationColor as string), backgroundColor: 'rgba(1,1,1,0)' }}
                                                sx={Utils.getStyle(this.props.theme, this.props.menuWidth !== 'full' && styles.transparent, this.props.activeView === item.view && styles.selectedMenu)}
                                            />
                                            {item.text ? <span
                                                style={{
                                                    ...styles.listItemIconText,
                                                    ...(this.props.menuWidth === 'full' ? styles.transparent : undefined),
                                                    color: this.props.activeView === item.view ? (settings.navigationSelectedColor as string) : (settings.navigationColor as string),
                                                }}
                                            >
                                                {item.text[0].toUpperCase()}
                                            </span> : null}
                                        </>}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    style={{ color: this.props.activeView === item.view ? (settings.navigationSelectedColor as string) : (settings.navigationColor as string) }}
                                    sx={{
                                        '&.MuListItemText-primary': Utils.getStyle(
                                            this.props.theme,
                                            styles.listItemText,
                                            this.props.activeView === item.view && !settings.navigationSelectedColor && styles.selectedMenu,
                                            this.props.menuWidth === 'narrow' && styles.listItemTextNarrow,
                                        ),
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>;

                        return <Tooltip
                            title={this.props.menuWidth !== 'full' ? item.text : ''}
                            key={index}
                            componentsProps={{ popper: { sx: commonStyles.tooltip } }}
                        >
                            {menuItem}
                        </Tooltip>;
                    })}
                </List>
            </div>
        </div>;
    }

    renderToolbar(settings: ViewSettings) {
        if (!settings.navigationBar) {
            return null;
        }
        let style: React.CSSProperties;
        if (settings.navigationBarColor) {
            style = {
                backgroundColor: settings.navigationBarColor as string,
                color: Utils.getInvertedColor(settings.navigationBarColor as string, this.props.context.themeType, true),
            };
        } else {
            style = {};
        }
        style.opacity = this.props.editMode ? 0.4 : 1;

        let icon: string = (settings.navigationBarIcon || settings.navigationBarImage) as string;
        if (icon?.startsWith('_PRJ_NAME/')) {
            icon = `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}${icon.substring(9)}`;  // "_PRJ_NAME".length = 9
        }

        return <Box
            component="div"
            sx={Utils.getStyle(
                this.props.theme,
                styles.toolBar,
                this.props.menuWidth === 'hidden' && styles.toolBarWithClosedMenu,
            )}
            style={style}
        >
            {icon ? <Icon
                src={icon}
                style={styles.toolbarIcon}
            /> : null}
            {(settings.navigationBarText as string) || this.props.activeView}
        </Box>;
    }

    /**
     * Hide the navigation menu
     */
    hideNavigationMenu() {
        window.localStorage.setItem('vis.navOpened', 'hidden');
        this.props.setMenuWidth('hidden');
    }

    render() {
        if (!this.props.context.views || !this.props.context.views[this.props.view]) {
            return null;
        }

        const settings: ViewSettings = this.props.context.views[this.props.view].settings;
        const menuFullWidth = parseInt(settings.navigationWidth as any as string, 10) || MENU_WIDTH_FULL;

        if (settings.navigation &&
            !this.props.visInWidget &&
            settings.navigationOrientation === 'horizontal' &&
            this.props.view === this.props.activeView
        ) {
            return <div style={styles.rootHorizontal}>
                {this.renderMenu(settings, menuFullWidth)}
                <div
                    style={{
                        ...styles.viewContentWithToolbar,
                        marginTop: this.props.editMode ? undefined : TOOLBAR_SIZE,
                    }}
                >
                    {this.props.children}
                </div>
            </div>;
        }

        if (!settings.navigation && settings.navigationBar) {
            return <div style={styles.afterMenuHidden}>
                {this.renderToolbar(settings)}
                <div style={styles.viewContentWithToolbar}>
                    {this.props.children}
                </div>
            </div>;
        }

        return <div style={styles.root}>
            {!settings.navigationHideMenu ? <div
                style={{
                    ...styles.openMenuButton,
                    ...(this.props.menuWidth === 'full' ? styles.openMenuButtonFull : undefined),
                    ...(this.props.menuWidth === 'narrow' ? styles.openMenuButtonNarrow : undefined),
                    ...(this.props.menuWidth === 'hidden' ? styles.openMenuButtonHidden : undefined),
                    left: this.props.menuWidth === 'full' ? menuFullWidth - TOOLBAR_SIZE : undefined,
                    opacity: settings.navigationBar && this.props.menuWidth === 'hidden' ? 1 : undefined,
                }}
            >
                <IconButton
                    onClick={() => {
                        if (this.props.menuWidth === 'full') {
                            window.localStorage.setItem('vis.navOpened', 'narrow');
                            this.props.setMenuWidth('narrow');
                        } else if (this.props.menuWidth === 'narrow') {
                            if (!settings.navigationNoHide) {
                                this.hideNavigationMenu();
                            } else {
                                window.localStorage.setItem('vis.navOpened', 'full');
                                this.props.setMenuWidth('full');
                            }
                        } else {
                            window.localStorage.setItem('vis.navOpened', 'full');
                            this.props.setMenuWidth('full');
                        }
                    }}
                    style={{
                        backgroundColor: this.props.menuWidth === 'hidden' && settings.navigationButtonBackground ? settings.navigationButtonBackground || (this.props.context.themeType === 'dark' ? 'white' : 'black') : 'inherit',
                        color: this.props.menuWidth === 'hidden' && settings.navigationButtonBackground ? settings.navigationButtonBackground || (this.props.context.themeType === 'dark' ? 'black' : 'white')  : 'inherit',
                    }}
                >
                    <ChevronLeftIcon
                        style={{
                            ...(this.props.menuWidth === 'hidden' || (this.props.menuWidth === 'narrow' && settings.navigationNoHide) ? styles.openMenuButtonIconHidden : undefined),
                            color: settings.navigationBar && this.props.menuWidth === 'hidden' ?
                                settings.navigationChevronColor || (this.props.context.themeType === 'dark' ? '#000' : '#FFF') :
                                settings.navigationChevronColor as string,
                        }}
                    />
                </IconButton>
            </div> : null}
            {!settings.navigationHideMenu ? this.renderMenu(settings, menuFullWidth) : null}
            <div
                style={{
                    ...styles.afterMenu,
                    ...(!settings.navigationHideMenu && this.props.menuWidth === 'full' ? styles.afterMenuFull : undefined),
                    ...(!settings.navigationHideMenu && this.props.menuWidth === 'narrow' ? styles.afterMenuNarrow : undefined),
                    ...((settings.navigationHideMenu || this.props.menuWidth === 'hidden') ? styles.afterMenuHidden : undefined),
                    width: !settings.navigationHideMenu && this.props.menuWidth === 'full' ? `calc(100% - ${menuFullWidth}px)` : undefined,
                }}
            >
                {this.renderToolbar(settings)}
                <div style={settings.navigationBar ? styles.viewContentWithToolbar : styles.viewContentWithoutToolbar}>
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
}

export default VisNavigation;
