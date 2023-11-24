import PropTypes from 'prop-types';
import { useState } from 'react';
import { toPng } from 'html-to-image';

import {
    Widgets as WidgetIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
import {
    AiOutlineGroup, AiOutlineUngroup,
} from 'react-icons/ai';

import { I18n } from '@iobroker/adapter-react-v5';

import { store } from '../Store';

import IOContextMenu from '../Components/IOContextMenu';
import WidgetExportDialog from '../Toolbar/WidgetExportDialog';
import WidgetImportDialog from '../Toolbar/WidgetImportDialog';
import { getWidgetTypes } from './visWidgetsCatalog';

const VisContextMenu = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    if (!store.getState().visProject[props.selectedView]) {
        return null;
    }

    const menuItemsData = menuPosition => {
        const view = store.getState().visProject[props.selectedView];
        const coordinatesWidgets = menuPosition ? Object.keys(view.widgets)
            .filter(widget => {
                const rect = window.document.getElementById(widget)?.getBoundingClientRect();
                if (view.widgets[widget].grouped) {
                    return false;
                }

                return rect && menuPosition.left >= rect.left && menuPosition.left <= rect.right && menuPosition.top >= rect.top && menuPosition.top <= rect.bottom;
            }) : [];

        // find name and widget type
        let widgetType = null;
        let widgetName = '';
        let showSelect = coordinatesWidgets.length > 1;
        // let marketplaceUpdate;
        if (view && coordinatesWidgets[0] && view.widgets[coordinatesWidgets[0]] && view.widgets[coordinatesWidgets[0]].tpl) {
            if (view.widgets[coordinatesWidgets[0]].data?.locked) {
                showSelect = true;
            }
            widgetName = coordinatesWidgets[0];
            if (view.widgets[coordinatesWidgets[0]].data && view.widgets[coordinatesWidgets[0]].data.name) {
                widgetName = view.widgets[coordinatesWidgets[0]].data.name;
                widgetType = coordinatesWidgets[0];
            } else {
                const tpl = view.widgets[coordinatesWidgets[0]].tpl;
                if (tpl === '_tplGroup') {
                    widgetType = I18n.t('Group');
                } else {
                    const wSet = view.widgets[coordinatesWidgets[0]].widgetSet;
                    const widgetItem = getWidgetTypes().find(item => item.name === tpl && item.set === wSet);
                    widgetType = widgetItem ? widgetItem.title : tpl;
                }
            }

            if (view.widgets[coordinatesWidgets[0]].marketplace) {
                widgetType = `${view.widgets[coordinatesWidgets[0]].marketplace.name} (${I18n.t('version')} ${view.widgets[coordinatesWidgets[0]].marketplace.version})`;
                // marketplaceUpdate = store.getState().visProject.___settings.marketplace.find(u =>
                //     u.widget_id === view.widgets[coordinatesWidgets[0]].marketplace.widget_id &&
                //     u.version > view.widgets[coordinatesWidgets[0]].marketplace.version);
            }
        }

        return [
            {
                leftIcon: <WidgetIcon />,
                hide: coordinatesWidgets.length !== 1,
                label: widgetName,
                subLabel: widgetType,
                style: { fontWeight: 'bold' },
                disabled: true,
            },
            {
                hide: !showSelect,
                label: 'Select',
                items: [
                    {
                        label: 'all',
                        hide: coordinatesWidgets.length === 1,
                        onClick: () => props.setSelectedWidgets(coordinatesWidgets),
                    },
                    ...coordinatesWidgets.map(widget => ({
                        label: widget,
                        onClick: () => props.setSelectedWidgets([widget]),
                    })),
                ],
            },
            {
                leftIcon: <AiOutlineGroup />,
                label: 'Group widgets',
                onClick: () => props.groupWidgets(),
                hide: props.selectedWidgets.length < 2,
            },
            {
                leftIcon: <AiOutlineUngroup />,
                label: 'Ungroup',
                subLabel: store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]]?.marketplace ?
                    I18n.t('convert from widgeteria widget') :
                    null,
                onClick: () => props.ungroupWidgets(),
                hide: props.selectedWidgets.length !== 1 ||
                    store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]].tpl !== '_tplGroup',
            },
            window.VisMarketplace ? {
                leftIcon: <img
                    src="./img/marketplace.png"
                    alt="widgeteria"
                    style={{ width: 16, height: 16, verticalAlign: 'middle' }}
                />,
                label: 'Add to widgeteria',
                onClick: async () => {
                    // copy all selected widgets
                    const widgets = props.selectedWidgets.map(wid => {
                        const w = JSON.parse(JSON.stringify(store.getState().visProject[props.selectedView].widgets[wid]));
                        w._id = wid;
                        w.isRoot = true;
                        delete w.marketplace;
                        w.widgetSet = window.visWidgetTypes.find(type => type.name === w.tpl).set;
                        return w;
                    });

                    const groupWidgets = [];

                    let gIdx = 1;
                    let wIdx = 1;
                    const len = widgets.length;
                    for (let w = 0; w < len; w++) {
                        const widget = widgets[w];
                        // if we are creating the group of groups (only two groups could be leveled)
                        if (widget.tpl === '_tplGroup') {
                            const newId = `f${gIdx.toString().padStart(6, '0')}`;
                            gIdx++;

                            if (widget.data && widget.data.members) {
                                const members = [];
                                widget.data.members.forEach(member => {
                                    if (groupWidgets.includes(member)) {
                                        return;
                                    }
                                    const memberWidget = JSON.parse(JSON.stringify(store.getState().visProject[props.selectedView].widgets[member]));
                                    memberWidget._id = `i${wIdx.toString().padStart(6, '0')}`;
                                    memberWidget.widgetSet = window.visWidgetTypes.find(type => type.name === memberWidget.tpl).set;
                                    wIdx++;
                                    members.push(memberWidget._id);
                                    memberWidget.groupid = newId;
                                    memberWidget.grouped = true;
                                    delete memberWidget.isRoot;
                                    delete w.marketplace;
                                    widgets.push(memberWidget);
                                    groupWidgets.push(member);
                                });

                                widget.data.members = members;
                            }
                            widget._id = newId;
                        } else if (widget._id.startsWith('w')) {
                            if (widget.grouped) {
                                delete widget.grouped;
                                delete widget.groupid;
                                delete widget._id;
                            } else {
                                widget._id = `i${wIdx.toString().padStart(6, '0')}`;
                                wIdx++;
                            }
                        }
                    }

                    Array.from(document.getElementsByClassName('vis-editmode-resizer')).forEach(el => el.style.display = 'none');
                    const cachePosition = document.getElementById(props.selectedWidgets[0]).style.position;
                    document.getElementById(props.selectedWidgets[0]).style.position = 'initial';

                    // create image of widget
                    const dataUrl = await toPng(document.getElementById(props.selectedWidgets[0]));
                    document.getElementById(props.selectedWidgets[0]).style.position = cachePosition;
                    Array.from(document.getElementsByClassName('vis-editmode-resizer')).forEach(el => el.style.display = 'block');
                    // console.log(document.getElementById(props.selectedWidgets[0]));

                    props.setMarketplaceDialog({
                        addPage: true,
                        widget: { widget: widgets, image: dataUrl },
                    });
                },
                hide: props.selectedWidgets.length !== 1 ||
                    store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]].tpl !== '_tplGroup' ||
                    store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]].marketplace,
            } : null,
            {
            // leftIcon: <AiOutlineUngroup />,
                label: 'Edit group',
                onClick: () => props.setSelectedGroup(props.selectedWidgets[0]),
                hide: props.selectedWidgets.length !== 1 ||
                    store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]].tpl !== '_tplGroup' ||
                    store.getState().visProject[props.selectedView].widgets[props.selectedWidgets[0]].marketplace,
            },
            {
                leftIcon: <BiCopy />,
                label: 'Copy',
                onClick: () => props.copyWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                leftIcon: <BiCut />,
                label: 'Cut',
                onClick: () => props.cutWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                leftIcon: <BiPaste />,
                label: 'Paste',
                onClick: () => props.pasteWidgets(),
                disabled: !Object.keys(props.widgetsClipboard.widgets).length,
            },
            {
                leftIcon: <DeleteIcon fontSize="small" />,
                label: 'Delete',
                onClick: () => props.deleteWidgets(),
                disabled: !props.selectedWidgets.length,
            },
            {
                label: 'More',
                items: [
                    {
                        leftIcon: <LockIcon fontSize="small" />,
                        label: 'Lock',
                        onClick: () => props.lockWidgets('lock'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <LockOpenIcon fontSize="small" />,
                        label: 'Unlock',
                        onClick: () => props.lockWidgets('unlock'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <RiBringToFront />,
                        label: 'Bring to front',
                        onClick: () => props.orderWidgets('front'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <RiSendToBack />,
                        label: 'Sent to back',
                        onClick: () => props.orderWidgets('back'),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <BiExport />,
                        label: 'Export widgets',
                        onClick: () => setExportDialog(true),
                        disabled: !props.selectedWidgets.length,
                    },
                    {
                        leftIcon: <BiImport />,
                        label: 'Import widgets',
                        onClick: () => setImportDialog(true),
                    },
                ],
            },
        ];
    };

    return <>
        <IOContextMenu
            menuItemsData={menuItemsData}
            disabled={props.disabled}
        >
            {props.children}
        </IOContextMenu>
        {importDialog ? <WidgetImportDialog
            open={importDialog}
            onClose={() => setImportDialog(false)}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            project={store.getState().visProject}
        /> : null}
        {exportDialog ? <WidgetExportDialog
            open={exportDialog}
            onClose={() => setExportDialog(false)}
            widgets={store.getState().visProject[props.selectedView].widgets}
            selectedWidgets={props.selectedWidgets}
        /> : null}
    </>;
};

VisContextMenu.propTypes = {
    changeProject: PropTypes.func,
    children: PropTypes.any,
    copyWidgets: PropTypes.func,
    cutWidgets: PropTypes.func,
    deleteWidgets: PropTypes.func,
    disabled: PropTypes.bool,
    groupWidgets: PropTypes.func,
    lockWidgets: PropTypes.func,
    orderWidgets: PropTypes.func,
    pasteWidgets: PropTypes.func,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    setSelectedGroup: PropTypes.func,
    setSelectedWidgets: PropTypes.func,
    ungroupWidgets: PropTypes.func,
    widgetsClipboard: PropTypes.object,
};

export default VisContextMenu;
