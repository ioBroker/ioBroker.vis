import I18n from '@iobroker/adapter-react/i18n';
import { Card, CardContent } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import image from '../img/Prev_HTML.png';
import staticImage from '../img/static.png';

const styles = () => ({
    widgetTitle: { textAlign: 'center' },
    widgetImage: { display: 'flex', alignItems: 'start' },
    widgetType: { opacity: 0.2 },
});

const Widget = props => <Card style={{ display: 'inline-block', margin: 4 }} elevation={4}>
    <CardContent>
        <div className={props.classes.widgetTitle}>{I18n.t('HTML')}</div>
        <div className={props.classes.widgetImage}>
            <img src={image} alt="" style={{ width: props.small ? 40 : null, height: props.small ? 40 : null }} />
            <img src={staticImage} alt="" className={props.classes.widgetType} />
        </div>
    </CardContent>
</Card>;

export default withStyles(styles)(Widget);
