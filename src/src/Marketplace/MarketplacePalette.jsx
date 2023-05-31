import React from 'react';
import {
    Button,
} from '@mui/material';
import I18n from '@iobroker/adapter-react-v5/i18n';

const MarketplacePalette = props => <div>
    <div>{I18n.t('Marketplace')}</div>
    <Button variant="contained" color="primary" onClick={() => props.setMarketplaceDialog({})}>
        {I18n.t('Open marketplace')}
    </Button>
</div>;

export default MarketplacePalette;
