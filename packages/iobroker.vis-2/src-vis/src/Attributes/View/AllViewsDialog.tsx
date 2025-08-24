import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';

import { Close, DragHandle, FormatPaint } from '@mui/icons-material';

import { I18n, type LegacyConnection, type ThemeType } from '@iobroker/adapter-react-v5';

import type { Project, ViewSettings, VisTheme, AdditionalIconSet } from '@iobroker/types-vis-2';
import { getViewsWithDifferentValues } from '@/Attributes/View/ApplyProperties';
import getEditField from '@/Attributes/View/EditField';
import type { Field } from '@/Attributes/View/Items';
import { deepClone } from '@/Utils/utils';

const styles: { draggableItem: React.CSSProperties } = {
    draggableItem: {
        width: '100%',
        display: 'flex',
        padding: 8,
        alignItems: 'center',
    },
};

interface ShowAllViewsDialogProps {
    project: Project;
    field: Field;
    changeProject: (newProject: Project) => void;
    onClose: () => void;
    themeType: ThemeType;
    theme: VisTheme;
    checkFunction: (
        funcText: boolean | string | ((settings: ViewSettings) => boolean),
        settings: ViewSettings,
    ) => boolean;
    userGroups: Record<string, ioBroker.GroupObject>;
    adapterName: string;
    instance: number;
    projectName: string;
    socket: LegacyConnection;
    additionalSets: AdditionalIconSet;
}

export default function showAllViewsDialog(props: ShowAllViewsDialogProps): React.JSX.Element | null {
    if (!props.field) {
        return null;
    }

    const viewList = Object.keys(props.project).filter(v => v !== '___settings');

    const items: { control: React.JSX.Element; view: string; order: number }[] = viewList
        .map(view => {
            let disabled = false;
            if (props.field.disabled !== undefined) {
                if (props.field.disabled === true) {
                    disabled = true;
                } else if (props.field.disabled === false) {
                    disabled = false;
                } else {
                    disabled = !!props.checkFunction(props.field.disabled, props.project[view].settings || {});
                }
            }

            const control = getEditField({
                field: props.field,
                disabled,
                view,
                editMode: true,
                changeProject: props.changeProject,
                userGroups: props.userGroups,
                adapterName: props.adapterName,
                themeType: props.themeType,
                instance: props.instance,
                projectName: props.projectName,
                socket: props.socket,
                checkFunction: props.checkFunction,
                project: props.project,
                theme: props.theme,
                additionalSets: props.additionalSets,
            });

            if (!control) {
                return null;
            }
            return {
                control,
                view,
                order: parseInt((props.project[view].settings.navigationOrder as any as string) ?? '0'),
            };
        })
        .filter(it => it);

    items.sort((prevItem, nextItem) =>
        prevItem.order === nextItem.order ? 0 : prevItem.order < nextItem.order ? -1 : 1,
    );
    const viewOrderList = items.map(item => item.view);

    const applyToAllButtonVisible =
        props.field.applyToAll &&
        getViewsWithDifferentValues(props.project, props.field, items[0].view, null, props.checkFunction);

    return (
        <Dialog
            open={!0}
            onClose={props.onClose}
            maxWidth="md"
        >
            <DialogTitle>{I18n.t(props.field.label)}</DialogTitle>
            <DialogContent>
                <DragDropContext
                    onDragEnd={data => {
                        const newProject = deepClone(props.project);
                        // first, fill all views with navigationOrder
                        viewOrderList.forEach((view, index) => {
                            newProject[view].settings.navigationOrder = index;
                        });
                        const index = newProject[viewOrderList[data.destination.index]].settings.navigationOrder;

                        newProject[viewOrderList[data.destination.index]].settings.navigationOrder =
                            newProject[viewOrderList[data.source.index]].settings.navigationOrder;

                        newProject[viewOrderList[data.source.index]].settings.navigationOrder = index;
                        props.changeProject(newProject);
                    }}
                >
                    <Droppable
                        droppableId="items"
                        type="ROW"
                    >
                        {(dropProvided, dropSnapshot) => (
                            <div
                                ref={dropProvided.innerRef}
                                {...dropProvided.droppableProps}
                                style={{
                                    width: '100%',
                                    backgroundColor: dropSnapshot.isDraggingOver ? '#112233' : undefined,
                                }}
                            >
                                {items.map((item, index) => (
                                    <Draggable
                                        key={item.view}
                                        draggableId={item.view || ''}
                                        index={index}
                                    >
                                        {(dragProvided, dragSnapshot) => (
                                            <div
                                                key={item.view}
                                                ref={dragProvided.innerRef}
                                                {...dragProvided.draggableProps}
                                                style={{
                                                    ...styles.draggableItem,
                                                    ...dragProvided.draggableProps.style,
                                                    backgroundColor: dragSnapshot.isDragging ? '#334455' : undefined,
                                                }}
                                            >
                                                <div
                                                    {...dragProvided.dragHandleProps}
                                                    style={{ display: 'inline-block', width: 24, marginRight: 8 }}
                                                >
                                                    <DragHandle />
                                                </div>
                                                <div style={{ display: 'inline-block', width: 200 }}>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                        {props.project[item.view].settings.navigationTitle || item.view}
                                                    </div>
                                                    {props.project[item.view].settings.navigationTitle ? (
                                                        <div style={{ fontSize: 'smaller', opacity: 0.7 }}>
                                                            {item.view}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div style={{ display: 'inline-block', minWidth: 100, flexGrow: 1 }}>
                                                    {item.control}
                                                </div>
                                                {applyToAllButtonVisible ? (
                                                    <Tooltip
                                                        title={I18n.t('Apply to all views')}
                                                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const newProject: Project = deepClone(props.project);

                                                                const _viewsToChange =
                                                                    getViewsWithDifferentValues(
                                                                        props.project,
                                                                        props.field,
                                                                        item.view,
                                                                        null,
                                                                        props.checkFunction,
                                                                    ) || [];
                                                                _viewsToChange?.forEach(_view => {
                                                                    (newProject[_view].settings as Record<string, any>)[
                                                                        props.field.attr
                                                                    ] = (
                                                                        newProject[item.view].settings as Record<
                                                                            string,
                                                                            any
                                                                        >
                                                                    )[props.field.attr];
                                                                });
                                                                props.changeProject(newProject);
                                                            }}
                                                        >
                                                            <FormatPaint />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : null}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {dropProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={props.onClose}
                    color="grey"
                    startIcon={<Close />}
                >
                    {I18n.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
