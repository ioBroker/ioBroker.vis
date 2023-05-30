import {
    Button,
} from '@mui/material';
import React, { useState } from 'react';
import MarketplaceDialog from './MarketplaceDialog';

const MarketplacePalette = props => <div>
    <div>Marketplace</div>
    <Button variant="contained" color="primary" onClick={() => props.setMarketplaceDialog({})}>
        Open marketplace
    </Button>
</div>;

export default MarketplacePalette;
