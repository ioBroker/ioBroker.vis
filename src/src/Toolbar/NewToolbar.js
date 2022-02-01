import {
    Button,
    ButtonBase,
    Checkbox, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, withStyles,
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';

import I18n from '@iobroker/adapter-react/i18n';

import Views from './NewViews';
import Widgets from './NewWidgets';
import Projects from './NewProjects';

const styles = () => ({
    text: { paddingRight: 4 },
    button: { margin: 4 },
    textInput: { margin: '0px 4px', width: 120 },
});

const NewToolbar = props => <div className={props.classes.toolbar} style={{ alignItems: 'initial' }}>
    <Views {...props} />
    <Widgets {...props} />
    <Projects {...props} />
</div>;

export default NewToolbar;
