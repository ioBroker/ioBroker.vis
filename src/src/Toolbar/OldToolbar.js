import Tools from './OldTools';
import View from './OldView';
import Widgets from './OldWidgets';

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
