import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';
import { ThemeName } from '@iobroker/adapter-react-v5/types';
import {
    GroupWidget,
    GroupWidgetId,
    MarketplaceWidgetRevision,
    SingleWidget,
    SingleWidgetId,
} from '@iobroker/types-vis-2';
import { store } from '../Store';

export interface MarketplaceDialogProps {
    onClose: () => void;
    addPage?: boolean;
    widget?: { name: string; date: string; widget_id: string; image_id: string };
    installedWidgets: MarketplaceWidgetRevision[];
    updateWidgets: (widget: MarketplaceWidgetRevision) => void;
    installWidget: (widgetId: string, id: string) => void;
    themeName: ThemeName;
}

const MarketplaceDialog = (props: MarketplaceDialogProps) => {
    const VisMarketplace = window.VisMarketplace?.default;

    let installWidget: (marketplace: MarketplaceWidgetRevision) => void;

    if (props.installWidget) {
        installWidget = async marketplace => {
            const widgets = [];
            const project = store.getState().visProject;

            Object.keys(project).forEach(view => {
                if (view !== '___settings') {
                    const viewWidgets: { name: string; widgets: (GroupWidgetId | SingleWidgetId)[] } = {
                        name: view,
                        widgets: [],
                    };
                    Object.keys(project[view].widgets).forEach((wid: GroupWidgetId | SingleWidgetId) => {
                        const widget: GroupWidget | SingleWidget = project[view].widgets[wid];
                        if (widget.marketplace?.widget_id === marketplace.widget_id &&
                            widget.marketplace?.version !== marketplace.version
                        ) {
                            viewWidgets.widgets.push(wid);
                        }
                    });
                    if (viewWidgets.widgets.length) {
                        widgets.push(viewWidgets);
                    }
                }
            });
            if (widgets.length) {
                await props.updateWidgets(marketplace);
            } else {
                await props.installWidget(marketplace.widget_id, marketplace.id);
            }
            props.onClose();
        };
    }

    return <Dialog
        open={!0}
        fullScreen
        onClose={props.onClose}
        PaperProps={{ color: 'primary' }}
    >
        <DialogTitle>{props.addPage ? I18n.t('Add new or update existing widget') : I18n.t('Browse the widgeteria')}</DialogTitle>
        <DialogContent>
            {VisMarketplace &&
                // @ts-expect-error how to fix it?
                <VisMarketplace
                    language={I18n.getLanguage()}
                    addPage={props.addPage}
                    widget={props.widget}
                    onClose={props.onClose}
                    installWidget={installWidget}
                    installedWidgets={props.installedWidgets}
                    themeName={props.themeName}
                    onAdded={() => props.onClose()}
                />}
        </DialogContent>
        <DialogActions>
            <Button
                onClick={props.onClose}
                variant="contained"
                startIcon={<Close />}
            >
                {I18n.t('Close')}
            </Button>
        </DialogActions>
    </Dialog>;
};

export default MarketplaceDialog;
