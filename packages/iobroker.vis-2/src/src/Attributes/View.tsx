import React, {
    useEffect,
    useState,
    useMemo,
} from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Tooltip,
    IconButton,
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon, FormatPaint,
    Info as InfoIcon, Visibility,
} from '@mui/icons-material';

import {
    Utils,
    I18n,
    type LegacyConnection,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import { store } from '@/Store';
import type { Project, View } from '@iobroker/types-vis-2';

import { resolution, getFields, type Field } from './View/Items';
import getEditField from './View/EditField';
import { renderApplyDialog, getViewsWithDifferentValues, type ApplyField } from './View/ApplyProperties';
import showAllViewsDialog from './View/AllViewsDialog';

const styles: Record<string, any> = (theme: Record<string, any>) => ({
    backgroundClass: {
        display: 'flex',
        alignItems: 'center',
    },
    backgroundClassSquare: {
        width: 40,
        height: 40,
        display: 'inline-block',
        marginRight: 4,
    },
    accordionRoot: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
        },
        '&:before': {
            opacity: 0,
        },
    },
    clearPadding: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
        },
    },
    accordionOpenedSummary: {
        fontWeight: 'bold',
    },
    lightedPanel: theme.classes.lightedPanel,
    accordionDetails: {
        ...theme.classes.lightedPanel,
        borderRadius: '0 0 4px 4px',
        flexDirection: 'column',
        padding: 0,
        margin: 0,
    },
    fieldTitle: {
        width: 140,
        fontSize: '80%',
    },
    fieldContent: {
        '&&&&&&': {
            fontSize: '80%',
        },
        '& svg': {
            fontSize: '1rem',
        },
    },
    fieldContentDiv: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    fieldContentColor: {
        '&&&&&& label': {
            display: 'none',
        },
        '&&&&&& input': {
            fontSize: '80%',
        },
    },
    groupSummary: {
        '&&&&&&': {
            marginTop: 10,
            borderRadius: '4px',
            padding: '2px',
        },
    },
    groupSummaryExpanded: {
        '&&&&&&': {
            marginTop: 10,
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '4px',
            padding: '2px',
        },
    },
    fieldContentSlider: {
        display: 'inline',
        width: 'calc(100% - 82px)',
        marginRight: 8,
    },
    fieldContentSliderInput: {
        display: 'inline',
        width: 50,
    },
    fieldContentSliderClear: {
        display: 'inline',
        width: 32,
    },
    fieldHelpText: {
        float: 'right',
        fontSize: 16,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    draggableItem: {
        width: '100%',
        display: 'flex',
        padding: 8,
        alignItems: 'center',
    },
});

const checkFunction = (
    funcText: boolean | string | ((settings: Record<string, any>) => boolean),
    settings: Record<string, any>,
): boolean => {
    if (funcText === true) {
        return true;
    }
    if (funcText === false || funcText === undefined) {
        return false;
    }
    try {
        let _func: (dataSettings: Record<string, any>) => boolean;
        if (typeof funcText === 'function') {
            _func = funcText;
        } else {
            // eslint-disable-next-line no-new-func
            _func = (new Function('data', `return ${funcText}`)) as (dataSettings: Record<string, any>) => boolean;
        }
        return _func(settings);
    } catch (e) {
        console.error(`Cannot execute hidden on "${funcText}": ${e}`);
    }
    return false;
};

function addButton(
    content: React.JSX.Element,
    disabled: boolean,
    classes: Record<string, string>,
    onShowViews: () => void,
    onClick?: () => void,
) {
    return <div style={{ display: 'flex', width: '100%', alignItems: 'end' }}>
        <div
            style={{
                flex: 1,
                lineHeight: '36px',
                marginRight: 4,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {content}
        </div>
        {onClick ? <Tooltip
            title={I18n.t('Apply ALL navigation properties to all views')}
            classes={{ popper: classes.tooltip }}
        >
            <span>
                <IconButton
                    size="small"
                    disabled={disabled}
                    color="primary"
                    onClick={() => onClick()}
                >
                    <FormatPaint />
                </IconButton>
            </span>
        </Tooltip> : null}
        {onShowViews ? <Tooltip
            title={I18n.t('Show this attribute by all views')}
            classes={{ popper: classes.tooltip }}
        >
            <span>
                <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={() => onShowViews()}
                >
                    <Visibility />
                </IconButton>
            </span>
        </Tooltip> : <div style={{ width: 24, height: 24 }} />}
    </div>;
}

interface ViewProps {
    selectedView: string;
    editMode: boolean;
    changeProject: (project: Record<string, any>) => void;
    classes: Record<string, any>;
    triggerAllOpened: number;
    triggerAllClosed: number;
    isAllClosed: boolean;
    setIsAllClosed: (closed: boolean) => void;
    isAllOpened: boolean;
    setIsAllOpened: (opened: boolean) => void;
    userGroups: Record<string, ioBroker.GroupObject>;
    adapterName: string;
    themeType: ThemeType;
    instance: number;
    projectName: string;
    socket: LegacyConnection;
}

const ViewAttributes = (props: ViewProps) => {
    const project: Project = store.getState().visProject;
    if (!project?.[props.selectedView]) {
        return null;
    }
    const classes = props.classes;

    const [triggerAllOpened, setTriggerAllOpened] = useState(0);
    const [triggerAllClosed, setTriggerAllClosed] = useState(0);
    const [showAllViewDialog, setShowAllViewDialog] = useState<ApplyField | null>(null);
    const [showViewsDialog, setShowViewsDialog] = useState<Field | null>(null);

    const view: View = project[props.selectedView];

    let resolutionSelect = `${view.settings.sizex}x${view.settings.sizey}`;
    if (!view.settings || (view.settings.sizex === undefined && view.settings.sizey === undefined)) {
        resolutionSelect = 'none';
    } else if (!resolution.find(item => item.value === resolutionSelect)) {
        resolutionSelect = 'user';
    }

    const fields = useMemo(
        () => getFields(resolutionSelect, view, classes, props.selectedView, props.editMode, props.changeProject),
        [resolutionSelect, view.settings?.sizex, view.settings?.sizey, props.selectedView, props.editMode],
    );

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('attributesView')
            ? JSON.parse(window.localStorage.getItem('attributesView') || '')
            : fields.map(() => false),
    );

    useEffect(() => {
        const newAccordionOpen: Record<string, boolean> = {};
        if (props.triggerAllOpened !== triggerAllOpened) {
            fields.forEach((group, key) => newAccordionOpen[key] = true);
            setTriggerAllOpened(props.triggerAllOpened || 0);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
        if (props.triggerAllClosed !== triggerAllClosed) {
            fields.forEach((group, key) => newAccordionOpen[key] = false);
            setTriggerAllClosed(props.triggerAllClosed || 0);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
    }, [props.triggerAllOpened, props.triggerAllClosed]);

    const allOpened = !fields.find((group, key) => !accordionOpen[key]);
    const allClosed = !fields.find((group, key) => accordionOpen[key]);

    if (props.isAllClosed !== allClosed) {
        setTimeout(() => props.setIsAllClosed(allClosed), 50);
    }
    if (props.isAllOpened !== allOpened) {
        setTimeout(() => props.setIsAllOpened(allOpened), 50);
    }

    const viewList = Object.keys(project).filter(v => v !== '___settings' && v !== props.selectedView);

    const allViewDialog =  renderApplyDialog({
        field: showAllViewDialog,
        viewList,
        project,
        selectedView: props.selectedView,
        changeProject: props.changeProject,
        onClose: () => setShowAllViewDialog(null),
        checkFunction,
    });

    const showViewsDialogElement = showAllViewsDialog({
        project,
        field: showViewsDialog,
        onClose: () => setShowViewsDialog(null),
        changeProject: props.changeProject,
        classes,
        userGroups: props.userGroups,
        adapterName: props.adapterName,
        themeType: props.themeType,
        instance: props.instance,
        projectName: props.projectName,
        socket: props.socket,
        checkFunction,
    });

    return <div style={{ height: '100%', overflowY: 'auto' }}>
        {fields.map((group, key) => {
            if (checkFunction(group.hidden, project[props.selectedView]?.settings || {})) {
                return null;
            }
            return <Accordion
                classes={{
                    root: classes.accordionRoot,
                    expanded: classes.clearPadding,
                }}
                square
                key={key}
                elevation={0}
                expanded={accordionOpen[key]}
                onChange={(e, expanded) => {
                    const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                    newAccordionOpen[key] = expanded;
                    window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                    setAccordionOpen(newAccordionOpen);
                }}
            >
                <AccordionSummary
                    classes={{
                        root: Utils.clsx(classes.clearPadding, accordionOpen[key]
                            ? classes.groupSummaryExpanded : classes.groupSummary, classes.lightedPanel),
                        content:  Utils.clsx(classes.clearPadding, accordionOpen[key] && classes.accordionOpenedSummary),
                        expanded: classes.clearPadding,
                        expandIconWrapper: classes.clearPadding,
                    }}
                    expandIcon={<ExpandMoreIcon />}
                >
                    {I18n.t(group.label)}
                </AccordionSummary>
                {accordionOpen[key] ? <AccordionDetails
                    classes={{ root: classes.accordionDetails }}
                >
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {group.fields.map((field, key2) => {
                                let disabled = false;
                                if (field.disabled !== undefined) {
                                    if (field.disabled === true) {
                                        disabled = true;
                                    } else if (field.disabled === false) {
                                        disabled = false;
                                    } else {
                                        disabled = !!checkFunction(field.disabled, project[props.selectedView].settings || {});
                                    }
                                }

                                let result = getEditField({
                                    field,
                                    disabled,
                                    view: props.selectedView,
                                    editMode: props.editMode,
                                    changeProject: props.changeProject,
                                    classes,
                                    userGroups: props.userGroups,
                                    adapterName: props.adapterName,
                                    themeType: props.themeType,
                                    instance: props.instance,
                                    projectName: props.projectName,
                                    socket: props.socket,
                                    checkFunction,
                                    project,
                                });

                                if (!result) {
                                    return null;
                                }

                                let helpText = null;
                                if (field.title) {
                                    helpText = <Tooltip title={I18n.t(field.title)} classes={{ popper: props.classes.tooltip }}>
                                        <InfoIcon className={classes.fieldHelpText} />
                                    </Tooltip>;
                                }

                                // if all attributes of navigation could be applied to all views with enabled navigation
                                if (field.groupApply) {
                                    // find all fields with applyToAll flag, and if any is not equal show button
                                    const isShow = group.fields.find(_field =>
                                        _field.applyToAll &&
                                        getViewsWithDifferentValues(
                                            project,
                                            _field,
                                            props.selectedView,
                                            viewList,
                                            checkFunction,
                                        ));

                                    result = addButton(
                                        result,
                                        !props.editMode || disabled,
                                        props.classes,
                                        () => setShowViewsDialog(field),
                                        isShow && (project[props.selectedView].settings as Record<string, any>)?.[field.attr] ? () => setShowAllViewDialog({ ...field, group }) : null,
                                    );
                                } else if (field.attr?.startsWith('navigation')) {
                                    result = addButton(
                                        result,
                                        !props.editMode || disabled,
                                        props.classes,
                                        () => setShowViewsDialog(field),
                                    );
                                }

                                return <tr key={key2}>
                                    <td
                                        className={classes.fieldTitle}
                                        title={!field.title ? undefined : I18n.t(field.title)}
                                    >
                                        {I18n.t(field.label)}
                                        {helpText}
                                    </td>
                                    <td className={classes.fieldContent}>{result}</td>
                                </tr>;
                            })}
                        </tbody>
                    </table>
                </AccordionDetails> : null}
            </Accordion>;
        })}
        {allViewDialog}
        {showViewsDialogElement}
    </div>;
};

export default withStyles(styles)(ViewAttributes);
