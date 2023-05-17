import {
    Button, Dialog, DialogActions, DialogContent,
} from '@mui/material';
import React from 'react';

window.apiUrl = 'https://iobroker.net';
window.webPrefix = '/market';
// window.apiUrl = 'http://localhost:3009'; 
// window.webPrefix = '';

const MarketplaceDialog = props => {
    const VisMarketplace = window.VisMarketplace?.default;

    return <Dialog open={props.open} fullScreen onClose={props.onClose}>
        <DialogContent>
            {VisMarketplace &&
                    <VisMarketplace
                        addPage={props.addPage}
                        widget={props.widget}
                        onClose={props.onClose}
                        installWidget={props.installWidget}
                    />}
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onClose}>Close</Button>
        </DialogActions>
    </Dialog>;
};

export default MarketplaceDialog;
