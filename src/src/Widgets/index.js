import I18n from '@iobroker/adapter-react/i18n';
import { Typography } from '@material-ui/core';

import Widget from './Widget';

const Widgets = props => <>
    <Typography variant="h6" gutterBottom>
        {I18n.t('Add widget')}
    </Typography>
    {
        Array(4).fill(null).map((value, key) => <Widget key={key} />)
    }
</>;

export default Widgets;
