import {
    Accordion, AccordionDetails, AccordionSummary, TextField,
} from '@material-ui/core';

const fields = [
    {
        name: 'CSS Common',
        fields: [
            { name: 'Comment' },
            { name: 'CSS Class' },
            { name: 'Initial filter' },
            { name: 'Theme' },
            { name: 'Only for groups' },
            { name: 'If user not in group' },
        ],
    },
    {
        name: 'CSS background (background-...)',
        fields: [
            { name: 'Use background' },
            { name: 'background' },
            { name: '-color' },
            { name: '-image' },
            { name: '-repeat' },
            { name: '-attachment' },
            { name: '-position' },
            { name: '-size' },
            { name: '-clip' },
            { name: '-origin' },

        ],
    },
    {
        name: 'CSS Font & Text',
        fields: [
            { name: 'color' },
            { name: 'text-shadow' },
            { name: 'font-family' },
            { name: 'font-style' },
            { name: 'font-variant' },
            { name: 'font-weight' },
            { name: 'font-size' },
            { name: 'line-height' },
            { name: 'letter-spacing' },
            { name: 'word-spacing' },
        ],
    },
];

const View = props => <div>
    {fields.map((group, key) => <Accordion key={key}>
        <AccordionSummary>{group.name}</AccordionSummary>
        <AccordionDetails style={{ flexDirection: 'column' }}>
            {
                group.fields.map((field, key2) => <div key={key2}>
                    <TextField label={field.name} />
                </div>)
            }
        </AccordionDetails>
    </Accordion>)}
</div>;

export default View;
