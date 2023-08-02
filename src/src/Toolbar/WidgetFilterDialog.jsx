import PropTypes from 'prop-types';

import { useEffect, useState } from 'react';

import {
    Button, Checkbox,
    ListItemAvatar,
    ListItemButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions, ListItemText,
} from '@mui/material';
import { Close, FilterAlt } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

const WidgetFilterDialog = props => {
    const [filters, setFilters] = useState([]);
    const [filterWidgets, setFilterWidgets] = useState(props.project[props.selectedView].filterWidgets || []);

    useEffect(() => {
        // Collect all filters of all widgets
        const _filters = [];
        const widgets = props.project[props.selectedView].widgets;
        Object.values(widgets).forEach(widget => {
            if (widget.data && widget.data.filterkey) {
                widget.data.filterkey.split(',').forEach(filter => {
                    filter = filter.trim();
                    if (!_filters.includes(filter)) {
                        _filters.push(filter);
                    }
                });
            }
        });
        setFilters(_filters);
    }, [props.project, props.selectedView]);

    return <Dialog
        open={!0}
        onClose={props.onClose}
        title="Import widgets"
        closeTitle="Close"
        actionTitle="Import"
    >
        <DialogTitle>{I18n.t('Set widgets filter for edit mode')}</DialogTitle>
        <DialogContent>
            {filters.length ? <Button
                onClick={() => setFilterWidgets([...filters])}
                variant="contained"
            >
                {I18n.t('Select all')}
            </Button> : null}
            {filters.length ? <Button
                onClick={() => setFilterWidgets([])}
                variant="outllined"
            >
                {I18n.t('Unselect all')}
            </Button> : null}
            <div>
                {!filters.length ? I18n.t('To use it, define by some widget the filter key') : null}
                {filters.map(filter => <ListItemButton
                    key={filter}
                    onClick={() => {
                        const _filterWidgets = [...filterWidgets];
                        const pos = _filterWidgets.indexOf(filter);
                        if (pos !== -1) {
                            _filterWidgets.splice(pos, 1);
                        } else {
                            _filterWidgets.push(filter);
                        }
                        setFilterWidgets(_filterWidgets);
                    }}
                >
                    <ListItemAvatar>
                        <Checkbox checked={filterWidgets.includes(filter)} />
                    </ListItemAvatar>
                    <ListItemText primary={filter} />
                </ListItemButton>)}
            </div>
        </DialogContent>
        <DialogActions>
            <Button
                disabled={!filters.length}
                variant="contained"
                autoFocus
                onClick={() => {
                    const project = JSON.parse(JSON.stringify(props.project));
                    project[props.selectedView].filterWidgets = filterWidgets;
                    props.changeProject(project);
                    props.onClose();
                }}
                color="primary"
                startIcon={<FilterAlt />}
            >
                {I18n.t('Apply')}
            </Button>
            <Button
                variant="contained"
                onClick={props.onClose}
                color="grey"
                startIcon={<Close />}
            >
                {I18n.t('Cancel')}
            </Button>
        </DialogActions>
    </Dialog>;
};

WidgetFilterDialog.propTypes = {
    changeProject: PropTypes.func,
    onClose: PropTypes.func,
    project: PropTypes.object,
    selectedView: PropTypes.string,
};
export default WidgetFilterDialog;
