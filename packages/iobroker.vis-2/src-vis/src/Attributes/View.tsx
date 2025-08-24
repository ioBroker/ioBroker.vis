import React, { useEffect, useState, useMemo } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Tooltip, IconButton, Box } from '@mui/material';

import { ExpandMore as ExpandMoreIcon, FormatPaint, Info as InfoIcon, Visibility } from '@mui/icons-material';

import { Utils, I18n, type LegacyConnection, type ThemeType } from '@iobroker/adapter-react-v5';

import { store } from '@/Store';
import type { Project, View, VisTheme, AdditionalIconSet } from '@iobroker/types-vis-2';

import commonStyles from '@/Utils/styles';
import { resolution, getFields, type Field } from './View/Items';
import getEditField from './View/EditField';
import { renderApplyDialog, getViewsWithDifferentValues, type ApplyField } from './View/ApplyProperties';
import showAllViewsDialog from './View/AllViewsDialog';

const styles: Record<string, any> = {
    accordionRoot: {
        p: 0,
        m: 0,
        minHeight: 0,
        '&:before': {
            opacity: 0,
        },
    },
    accordionOpenedSummary: {
        fontWeight: 'bold',
    },
    lightedPanel: (theme: VisTheme) => theme.classes.lightedPanel,
    accordionDetails: (theme: VisTheme) => ({
        ...theme.classes.lightedPanel,
        borderRadius: '0 0 4px 4px',
        flexDirection: 'column',
        p: 0,
        m: 0,
    }),
    fieldTitle: {
        width: 140,
        fontSize: '80%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    groupSummary: {
        mt: '10px',
        borderRadius: '4px',
        p: '2px',
        minHeight: 0,
    },
    groupSummaryExpanded: {
        mt: '10px',
        borderTopRightRadius: '4px',
        borderTopLeftRadius: '4px',
        p: '2px',
        minHeight: 0,
    },
};

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
            _func = new Function('data', `return ${funcText}`) as (dataSettings: Record<string, any>) => boolean;
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
    onShowViews: () => void,
    onClick?: () => void,
): React.JSX.Element {
    return (
        <div style={{ display: 'flex', width: '100%', alignItems: 'end' }}>
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
            {onClick ? (
                <Tooltip
                    title={I18n.t('Apply ALL navigation properties to all views')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
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
                </Tooltip>
            ) : null}
            {onShowViews ? (
                <Tooltip
                    title={I18n.t('Show this attribute by all views')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
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
                </Tooltip>
            ) : (
                <div style={{ width: 24, height: 24 }} />
            )}
        </div>
    );
}

interface ViewProps {
    selectedView: string;
    editMode: boolean;
    changeProject: (project: Record<string, any>) => void;
    triggerAllOpened: number;
    triggerAllClosed: number;
    isAllClosed: boolean;
    setIsAllClosed: (closed: boolean) => void;
    isAllOpened: boolean;
    setIsAllOpened: (opened: boolean) => void;
    userGroups: Record<string, ioBroker.GroupObject>;
    adapterName: string;
    themeType: ThemeType;
    theme: VisTheme;
    instance: number;
    projectName: string;
    socket: LegacyConnection;
    additionalSets: AdditionalIconSet;
}

const ViewAttributes = (props: ViewProps): React.JSX.Element | null => {
    const [triggerAllOpened, setTriggerAllOpened] = useState(0);
    const [triggerAllClosed, setTriggerAllClosed] = useState(0);
    const [showAllViewDialog, setShowAllViewDialog] = useState<ApplyField | null>(null);
    const [showViewsDialog, setShowViewsDialog] = useState<Field | null>(null);

    const project: Project = store.getState().visProject;

    const view: View | null = project[props.selectedView];
    let resolutionSelect = view?.settings?.resolution || 'none';
    const fields = useMemo(
        () => (view ? getFields(resolutionSelect, view, props.selectedView, props.editMode, props.changeProject) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            view,
            resolutionSelect,
            view?.settings?.sizex,
            view?.settings?.sizey,
            props.selectedView,
            props.editMode,
            props.changeProject,
        ],
    );

    const [accordionOpen, setAccordionOpen] = useState<Record<string, 0 | 1 | 2>>({});
    useEffect(() => {
        // init by start
        let _accordionOpen: Record<string, 0 | 1 | 2>;
        const accordionOpenStr = window.localStorage.getItem('attributesView');
        if (_accordionOpen) {
            try {
                _accordionOpen = JSON.parse(accordionOpenStr || '');
            } catch {
                // ignore
            }
        }
        if (_accordionOpen) {
            // convert from old format
            Object.keys(_accordionOpen).forEach(key => {
                if ((_accordionOpen[key] as any) === true || _accordionOpen[key] === 1) {
                    _accordionOpen[key] = 1;
                } else {
                    _accordionOpen[key] = 0;
                }
            });
            setAccordionOpen(_accordionOpen);
        }
    }, []);

    useEffect(() => {
        const newAccordionOpen: Record<string, 0 | 1 | 2> = {};
        if (props.triggerAllOpened !== triggerAllOpened) {
            fields.forEach((_group, key) => (newAccordionOpen[key] = 1));
            setTriggerAllOpened(props.triggerAllOpened || 0);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
        if (props.triggerAllClosed !== triggerAllClosed) {
            fields.forEach((_group, key) => (newAccordionOpen[key] = 0));
            setTriggerAllClosed(props.triggerAllClosed || 0);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.triggerAllOpened, props.triggerAllClosed, fields]);

    if (!project?.[props.selectedView]) {
        return null;
    }

    resolutionSelect = `${view.settings.sizex}x${view.settings.sizey}`;
    if (!view.settings || (view.settings.sizex === undefined && view.settings.sizey === undefined)) {
        resolutionSelect = 'none';
    } else if (!resolution.find(item => item.value === resolutionSelect)) {
        resolutionSelect = 'user';
    }

    const allOpened = !fields.find((_group, key) => accordionOpen[key] === 0 || accordionOpen[key] === 2);
    const allClosed = !fields.find((_group, key) => accordionOpen[key] === 1);

    if (props.isAllClosed !== allClosed) {
        setTimeout(() => props.setIsAllClosed(allClosed), 50);
    }
    if (props.isAllOpened !== allOpened) {
        setTimeout(() => props.setIsAllOpened(allOpened), 50);
    }

    const viewList = Object.keys(project).filter(v => v !== '___settings' && v !== props.selectedView);

    const allViewDialog = renderApplyDialog({
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
        userGroups: props.userGroups,
        adapterName: props.adapterName,
        themeType: props.themeType,
        instance: props.instance,
        projectName: props.projectName,
        socket: props.socket,
        theme: props.theme,
        checkFunction,
        additionalSets: props.additionalSets,
    });

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            {fields.map((group, key) => {
                if (checkFunction(group.hidden, project[props.selectedView]?.settings || {})) {
                    return null;
                }
                return (
                    <Accordion
                        sx={{
                            '&.MuiAccordion-root': styles.accordionRoot,
                            '& .Mui-expanded': commonStyles.clearPadding,
                        }}
                        square
                        key={key}
                        elevation={0}
                        expanded={accordionOpen[key] === 1}
                        onChange={(_e, expanded) => {
                            const newAccordionOpen: Record<string, 0 | 1 | 2> = { ...accordionOpen };
                            newAccordionOpen[key] = expanded ? 1 : 2;
                            expanded && window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                            setAccordionOpen(newAccordionOpen);

                            if (!expanded) {
                                props.setIsAllClosed(false);
                                setTimeout(() => {
                                    const _newAccordionOpen: Record<string, 0 | 1 | 2> = { ...accordionOpen };
                                    _newAccordionOpen[key] = 0;
                                    window.localStorage.setItem('attributesView', JSON.stringify(_newAccordionOpen));
                                    setAccordionOpen(_newAccordionOpen);
                                }, 200);
                            }
                        }}
                    >
                        <AccordionSummary
                            sx={{
                                '&.MuiAccordionSummary-root': Utils.getStyle(
                                    props.theme,
                                    commonStyles.clearPadding,
                                    accordionOpen[key] === 1 ? styles.groupSummaryExpanded : styles.groupSummary,
                                    styles.lightedPanel,
                                ),
                                '& .MuiAccordionSummary-content': Utils.getStyle(
                                    props.theme,
                                    commonStyles.clearPadding,
                                    accordionOpen[key] === 1 && styles.accordionOpenedSummary,
                                ),
                                '& .Mui-expanded': commonStyles.clearPadding,
                                '& .MuiAccordionSummary-expandIconWrapper': commonStyles.clearPadding,
                            }}
                            expandIcon={<ExpandMoreIcon />}
                        >
                            {I18n.t(group.label)}
                        </AccordionSummary>
                        {accordionOpen[key] !== 0 ? (
                            <AccordionDetails sx={styles.accordionDetails}>
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
                                                    disabled = !!checkFunction(
                                                        field.disabled,
                                                        project[props.selectedView].settings || {},
                                                    );
                                                }
                                            }

                                            let result = getEditField({
                                                field,
                                                disabled,
                                                view: props.selectedView,
                                                editMode: props.editMode,
                                                changeProject: props.changeProject,
                                                userGroups: props.userGroups,
                                                adapterName: props.adapterName,
                                                themeType: props.themeType,
                                                instance: props.instance,
                                                projectName: props.projectName,
                                                socket: props.socket,
                                                checkFunction,
                                                project,
                                                theme: props.theme,
                                                additionalSets: props.additionalSets,
                                            });

                                            if (!result) {
                                                return null;
                                            }

                                            let helpText = null;
                                            if (field.title) {
                                                helpText = (
                                                    <Tooltip
                                                        title={I18n.t(field.title)}
                                                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                                    >
                                                        <InfoIcon
                                                            style={styles.fieldHelpText}
                                                            fontSize="small"
                                                        />
                                                    </Tooltip>
                                                );
                                            }

                                            // if all attributes of navigation could be applied to all views with enabled navigation
                                            if (field.groupApply) {
                                                // find all fields with applyToAll flag, and if any is not equal show button
                                                const isShow = group.fields.find(
                                                    _field =>
                                                        _field.applyToAll &&
                                                        getViewsWithDifferentValues(
                                                            project,
                                                            _field,
                                                            props.selectedView,
                                                            viewList,
                                                            checkFunction,
                                                        ),
                                                );

                                                result = addButton(
                                                    result,
                                                    !props.editMode || disabled,
                                                    () => setShowViewsDialog(field),
                                                    isShow &&
                                                        (project[props.selectedView].settings as Record<string, any>)?.[
                                                            field.attr
                                                        ]
                                                        ? () => setShowAllViewDialog({ ...field, group })
                                                        : null,
                                                );
                                            } else if (field.attr?.startsWith('navigation')) {
                                                result = addButton(result, !props.editMode || disabled, () =>
                                                    setShowViewsDialog(field),
                                                );
                                            }

                                            return (
                                                <tr key={key2}>
                                                    <td
                                                        style={styles.fieldTitle}
                                                        title={!field.title ? undefined : I18n.t(field.title)}
                                                    >
                                                        {I18n.t(field.label)}
                                                        {helpText}
                                                    </td>
                                                    <Box
                                                        component="td"
                                                        sx={{ ...commonStyles.fieldContent, width: '100%' }}
                                                    >
                                                        {result}
                                                    </Box>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </AccordionDetails>
                        ) : null}
                    </Accordion>
                );
            })}
            {allViewDialog}
            {showViewsDialogElement}
        </div>
    );
};

export default ViewAttributes;
