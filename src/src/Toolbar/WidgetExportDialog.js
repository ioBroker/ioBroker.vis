import IODialog from '../Components/IODialog';

const WidgetExportDialog = props => <IODialog open={props.open} onClose={props.onClose}>
    <pre>
        {JSON.stringify(props.widgets, null, 2)}
    </pre>
</IODialog>;

export default WidgetExportDialog;
