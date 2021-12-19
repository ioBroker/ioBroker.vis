import Tools from './Tools';
import View from './View';
import Widgets from './Widgets';

const toolbars = { Tools, View, Widgets };

const Toolbar = props => {
    const Tab = toolbars[props.selected];

    return <div>
        {Tab ? <Tab
            {...props}
        /> : null}
    </div>;
};

export default Toolbar;
