import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import { withStyles } from '@mui/styles';

import image from '../img/Prev_HTML.png';

const styles = () => ({
    widget: {
        borderStyle: 'solid',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: 'orange',
        width: 120,
        display: 'inline-flex',
        margin: 4,
        height: 30,
    },
    widgetTitle: {
        textAlign: 'center', flex: 1, alignSelf: 'center', color: 'black',
    },
    widgetImage: {
        width: 20,
    },
    widgetImageContainer: {
        borderLeftStyle: 'solid', borderLeftWidth: 1, borderLeftColor: 'gray', display: 'flex', padding: 4, alignItems: 'center',
    },
});

const Widget = props => <div className={props.classes.widget}>
    <div className={props.classes.widgetTitle}>{window._(props.widgetType.name)}</div>
    <span className={props.classes.widgetImageContainer}>
        <img className={props.classes.widgetImage} src={image} alt="" />
    </span>
</div>;

Widget.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(Widget);
