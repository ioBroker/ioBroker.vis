import Tools from './Tools';
import View from './View';
import Widgets from './Widgets';
import NewToolbar from './NewToolbar';

const toolbars = { Tools, View, Widgets };

const Toolbar = props => {
    const Tab = toolbars[props.selected];

    return <div>
        {Tab ? <Tab
            {...props}
        /> : null}
        <NewToolbar {...props} />
    </div>;
};

export default Toolbar;
