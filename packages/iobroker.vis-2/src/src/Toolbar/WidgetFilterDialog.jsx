import PropTypes from 'prop-types';

import { useEffect, useState } from 'react';

import {
    Button, Checkbox,
    ListItemAvatar,
    ListItemButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    ListItemText,
    Switch, Box,
} from '@mui/material';
import {
    Close,
    FilterAlt,
    LayersClear as Clear,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';
import { store } from '../Store';

const WidgetFilterDialog = props => {
    const [filters, setFilters] = useState([]);
    const [filterWidgets, setFilterWidgets] = useState(store.getState().visProject[props.selectedView].filterWidgets || []);
    const [filterInvert, setFilterInvert] = useState(store.getState().visProject[props.selectedView].filterInvert || false);

    useEffect(() => {
        // Collect all filters of all widgets
        const _filters = [];
        const widgets = store.getState().visProject[props.selectedView].widgets;
        Object.values(widgets).forEach(widget => {
            if (widget.data && widget.data.filterkey) {
                widget.data.filterkey.split(',').forEach(filter => {
                    filter = filter.trim();
                    const pos = _filters.findIndex(a => a.key === filter);
                    if (pos === -1) {
                        _filters.push({ key: filter, count: 1 });
                    } else {
                        _filters[pos].count++;
                    }
                });
            }
        });
        setFilters(_filters);
    }, [store.getState().visProject, props.selectedView]);

    return <Dialog
        open={!0}
        onClose={props.onClose}
    >
        <DialogTitle>{I18n.t('Set widgets filter for edit mode')}</DialogTitle>
        <DialogContent>
            {filters.length > 1 ? <Button
                disabled={filters.length === filterWidgets.length}
                color="primary"
                onClick={() => setFilterWidgets([...filters.map(f => f.key)])}
                variant="contained"
            >
                {I18n.t('Select all')}
            </Button> : null}
            {filters.length > 1 ? <Button
                disabled={!filterWidgets.length}
                color="grey"
                style={{ marginLeft: 10 }}
                onClick={() => setFilterWidgets([])}
                variant="contained"
            >
                {I18n.t('Unselect all')}
            </Button> : null}
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box style={{ opacity: !filterInvert ? 1 : 0.5, display: 'flex', alignItems: 'center' }}>
                    {I18n.t('Hide selected widgets')}
                    <VisibilityOff style={{ marginLeft: 8 }} />
                </Box>
                <Switch
                    checked={filterInvert}
                    onChange={e => setFilterInvert(e.target.checked)}
                />
                <Box style={{ opacity: filterInvert ? 1 : 0.5, display: 'flex', alignItems: 'center' }}>
                    <Visibility style={{ marginRight: 8 }} />
                    {I18n.t('Show only selected widgets')}
                </Box>
            </div>
            <div>
                {!filters.length ? I18n.t('To use it, define by some widget the filter key') : null}
                {filters.map(filter => <ListItemButton
                    key={filter.key}
                    onClick={() => {
                        const _filterWidgets = [...filterWidgets];
                        const pos = _filterWidgets.indexOf(filter.key);
                        if (pos !== -1) {
                            _filterWidgets.splice(pos, 1);
                        } else {
                            _filterWidgets.push(filter.key);
                        }
                        setFilterWidgets(_filterWidgets);
                    }}
                >
                    <ListItemAvatar>
                        <Checkbox checked={filterWidgets.includes(filter.key)} />
                    </ListItemAvatar>
                    <ListItemText primary={<>
                        <span>{filter.key}</span>
                        {filter.count > 1 ? <span
                            style={{
                                marginLeft: 10,
                                opacity: 0.7,
                                fontStyle: 'italic',
                                fontSize: '0.8em',
                            }}
                        >
                            {I18n.t('%s widgets', filter.count)}
                        </span> : null}
                    </>}
                    />
                </ListItemButton>)}
            </div>
        </DialogContent>
        <DialogActions>
            {store.getState().visProject[props.selectedView].filterWidgets?.length ? <Button
                disabled={!filters.length}
                variant="outlined"
                onClick={() => {
                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                    project[props.selectedView].filterWidgets = [];
                    props.changeProject(project);
                    props.onClose();
                }}
                color="primary"
                startIcon={<Clear />}
            >
                {I18n.t('Clear filter')}
            </Button> : null}
            <Button
                disabled={!filters.length}
                variant="contained"
                autoFocus
                onClick={() => {
                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                    project[props.selectedView].filterWidgets = filterWidgets;
                    project[props.selectedView].filterInvert = filterInvert;
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
                {I18n.t('ra_Cancel')}
            </Button>
        </DialogActions>
    </Dialog>;
};

WidgetFilterDialog.propTypes = {
    changeProject: PropTypes.func,
    onClose: PropTypes.func,
    selectedView: PropTypes.string,
};
export default WidgetFilterDialog;
