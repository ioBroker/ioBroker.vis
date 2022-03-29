import i18n from '@iobroker/adapter-react-v5/i18n';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { withStyles } from '@mui/styles';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WidgetField from './WidgetField';

const getWidgetTypes = () => Array.from(document.querySelectorAll('script[type="text/ejs"]'))
    .map(script => ({
        name: script.attributes.id.value,
        params: Object.values(script.attributes)
            .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
            .map(attribute => attribute.value)
            .join(''),
    }));

const styles = theme => ({
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
    clearPadding: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
        },
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
            marginTop: 20,
            borderRadius: '4px',
            padding: '2px',
        },
    },
    groupSummaryExpanded: {
        '&&&&&&': {
            marginTop: 20,
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '4px',
            padding: '2px',
        },
    },
    lightedPanel: theme.classes.lightedPanel,
});

const getFieldsBefore = () => [
    {
        name: 'general',
        fields: [
            { name: 'name' },
            { name: 'comment' },
            { name: 'class', type: 'class' },
            { name: 'filterkey', type: 'auto' },
            { name: 'views', type: 'select-views' },
            { name: 'locked', type: 'checkbox' },
        ],
    },
    {
        name: 'visibility',
        fields: [{ name: 'visibility-oid', type: 'id' },
            {
                name: 'visibility-cond', type: 'select', options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], default: '==',
            },
            { name: 'visibility-val', default: 1 },
            { name: 'visibility-groups', type: 'groups' },
            {
                name: 'visibility-groups-action', type: 'select', options: ['hide', 'disabled'], default: 'hide',
            }],
    },
];

const getFieldsAfter = () => [
    { name: 'css_common', fields: [] },
    { name: 'css_font', fields: [] },
    { name: 'css_background', fields: [] },
    { name: 'css_border', fields: [] },
    { name: 'css_padding', fields: [] },
    { name: 'gestures', fields: [] },
    { name: 'notification', fields: [] },
    {
        name: 'show_last',
        fields: [
            { name: 'lc-oid', type: 'id' },
            {
                name: 'lc-type', type: 'select', options: ['last-change', 'timestamp'], default: 'last-change',
            },
            { name: 'lc-is-interval', type: 'checkbox', default: true },
            { name: 'lc-is-moment', type: 'checkbox', default: false },
            {
                name: 'lc-format', type: 'auto', options: ['YYYY.MM.DD hh:mm:ss', 'DD.MM.YYYY hh:mm:ss', 'YYYY.MM.DD', 'DD.MM.YYYY', 'YYYY/MM/DD hh:mm:ss', 'YYYY/MM/DD', 'hh:mm:ss'], default: '',
            },
            {
                name: 'lc-position-vert', type: 'select', options: ['top', 'middle', 'bottom'], default: 'top',
            },
            {
                name: 'lc-position-horz', type: 'select', options: ['left', /* 'middle', */'right'], default: 'right',
            },
            {
                name: 'lc-offset-vert', type: 'slider', options: { min: -120, max: 120, step: 1 }, default: 0,
            },
            {
                name: 'lc-offset-horz', type: 'slider', options: { min: -120, max: 120, step: 1 }, default: 0,
            },
            {
                name: 'lc-font-size', type: 'auto', options: ['', 'medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit'], default: '12px',
            },
            { name: 'lc-font-family', type: 'fontname', default: '' },
            {
                name: 'lc-font-style', type: 'auto', options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'], default: '',
            },
            { name: 'lc-bkg-color', type: 'color', default: '' },
            { name: 'lc-color', type: 'color', default: '' },
            { name: 'lc-border-width', default: '0' },
            {
                name: 'lc-border-style', type: 'auto', options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit'], default: '',
            },
            { name: 'lc-border-color', type: 'color', default: '' },
            {
                name: 'lc-border-radius', type: 'slider', options: { min: 0, max: 20, step: 1 }, default: 10,
            },
            { name: 'lc-padding' },
            {
                name: 'lc-zindex', type: 'slider', options: { min: -10, max: 20, step: 1 }, default: 0,
            },
        ],
    },
];

const Widget = props => {
    if (props.selectedWidgets && props.selectedWidgets[0]) {
        const widget = props.project[props.selectedView].widgets[props.selectedWidgets[0]];
        console.log(getWidgetTypes());
        const widgetType = getWidgetTypes().find(type => type.name === widget.tpl);

        let fields = [...getFieldsBefore(), {
            name: 'common',
            fields: [],
        }];

        let currentGroup = fields[fields.length - 1];
        widgetType.params.split(';').forEach(fieldString => {
            if (!fieldString) {
                return;
            }
            if (fieldString.split('/')[0].startsWith('group.')) {
                const groupName = fieldString.split('/')[0].split('.')[1];
                currentGroup = fields.find(group => group.name === groupName);
                if (!currentGroup) {
                    fields.push(
                        {
                            name: groupName,
                            fields: [],
                        },
                    );
                    currentGroup = fields[fields.length - 1];
                }
            } else {
                const match = fieldString.match(/([a-zA-Z0-9._-]+)(\([a-zA-Z.0-9-_]*\))?(\[.*])?(\/[-_,^§~\s:\/\.a-zA-Z0-9]+)?/);

                const field = {
                    name: match[1],
                    repeats: match[2],
                    default: match[3] ? match[3].substring(1, match[3].length - 1) : undefined,
                    type: match[4] ? match[4].substring(1) : undefined,
                };

                if (field.name === 'oid' || field.name.match(/^oid-/)) {
                    field.type = field.type || 'id';
                }

                if (field.type && (field.type.startsWith('select,') || field.type.startsWith('nselect,'))) {
                    const options = field.type.split(',');
                    [field.type] = options;
                    field.options = options.slice(1);
                }
                if (field.type && field.type.startsWith('slider,')) {
                    const options = field.type.split(',');
                    field.type = options[0];
                    field.min = parseInt(options[1]);
                    field.max = parseInt(options[2]);
                    field.step = parseInt(options[3]);
                    if (!field.step) {
                        field.step = (field.max - field.min / 100);
                    }
                }

                currentGroup.fields.push(field);
            }
        });

        fields = [...fields, ...getFieldsAfter()];

        const [accordionOpen, setAccordionOpen] = useState(
            window.localStorage.getItem('attributesWidget')
                ? JSON.parse(window.localStorage.getItem('attributesWidget'))
                : fields.map(() => true),
        );

        return <div>
            <div>Widget</div>
            <pre>
                {JSON.stringify(widgetType, null, 2)}
                {JSON.stringify(fields, null, 2)}
            </pre>
            {fields.map((group, key) => <Accordion
                classes={{
                    root: props.classes.clearPadding,
                    expanded: props.classes.clearPadding,
                }}
                square
                key={key}
                elevation={0}
                expanded={accordionOpen[key]}
                onChange={(e, expanded) => {
                    const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                    newAccordionOpen[key] = expanded;
                    window.localStorage.setItem('attributesWidget', JSON.stringify(newAccordionOpen));
                    setAccordionOpen(newAccordionOpen);
                }}
            >
                <AccordionSummary
                    classes={{
                        root: clsx(props.classes.clearPadding, accordionOpen[key]
                            ? props.classes.groupSummaryExpanded : props.classes.groupSummary, props.classes.lightedPanel),
                        content: props.classes.clearPadding,
                        expanded: props.classes.clearPadding,
                        expandIcon: props.classes.clearPadding,
                    }}
                    expandIcon={<ExpandMoreIcon />}
                >
                    {group.name}
                </AccordionSummary>
                <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
                    <table>
                        <tbody>
                            {
                                group.fields.map((field, key2) => <tr key={key2}>
                                    <td className={props.classes.fieldTitle}>{i18n.t(field.name)}</td>
                                    <td className={props.classes.fieldContent}>
                                        <WidgetField field={field} widget={widget} {...props} />
                                    </td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>)}
            <pre>
                {JSON.stringify(widget, null, 2)}
            </pre>
        </div>;
    }
    return null;
};

Widget.propTypes = {
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    project: PropTypes.object,
};

export default withStyles(styles)(Widget);
