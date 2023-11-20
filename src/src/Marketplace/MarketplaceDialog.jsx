import React from 'react';
import PropTypes from 'prop-types';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';
import { store } from '../Store';

const MarketplaceDialog = props => {
    const VisMarketplace = window.VisMarketplace?.default;

    let installWidget;

    if (props.installWidget) {
        installWidget = async marketplace => {
            const widgets = [];
            const project = store.getState().visProject;

            Object.keys(project).forEach(view => {
                if (view !== '___settings') {
                    const viewWidgets = {
                        name: view,
                        widgets: [],
                    };
                    Object.keys(project[view].widgets).forEach(widget => {
                        if (project[view].widgets[widget].marketplace?.widget_id === marketplace.widget_id &&
                        project[view].widgets[widget].marketplace?.version !== marketplace.version) {
                            viewWidgets.widgets.push(widget);
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

MarketplaceDialog.propTypes = {
    addPage: PropTypes.func,
    onClose: PropTypes.func,
    widget: PropTypes.object,
    installedWidgets: PropTypes.array,
    updateWidgets: PropTypes.func,
    installWidget: PropTypes.func,
    themeName: PropTypes.string,
};

export default MarketplaceDialog;
