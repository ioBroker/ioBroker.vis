import type React from 'react';
import type { Theme } from '@mui/material';

const commonStyles: {
    backgroundClass: React.CSSProperties;
    backgroundClassSquare: React.CSSProperties;
    selected: (theme: Theme) => React.CSSProperties;
    clearPadding: Record<string, any>;
    fieldContent: Record<string, any>;
    fieldContentColor: Record<string, any>;
    fieldContentSlider: React.CSSProperties;
    fieldContentSliderInput: React.CSSProperties;
    menuItem: React.CSSProperties;
    listFolder: React.CSSProperties;
    iconFolder: React.CSSProperties;
    fieldContentSliderClear: React.CSSProperties;
    fieldHelpText: React.CSSProperties;
    iconPreview: React.CSSProperties;
} = {
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
    selected: (theme: Theme): React.CSSProperties => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    }),
    clearPadding: {
        p: 0,
        mt: 0,
        mb: 0,
        ml: 0,
        mr: 0,
        minHeight: 'initial',
    },
    fieldContent: {
        fontSize: '80%',
        '& svg': {
            fontSize: '1rem',
        },
    },
    fieldContentColor: {
        '& label': {
            display: 'none',
        },
        '& input': {
            fontSize: '80%',
        },
    },
    fieldContentSlider: {
        display: 'inline',
        width: 'calc(100% - 50px)',
        marginRight: 8,
    },
    fieldContentSliderInput: {
        display: 'inline',
        width: 50,
    },
    menuItem: {
        cursor: 'pointer',
    },
    listFolder: {
        backgroundColor: 'inherit',
        lineHeight: '36px',
    },
    iconFolder: {
        verticalAlign: 'middle',
        marginRight: 6,
        marginTop: -3,
        fontSize: 20,
        color: '#00dc00',
    },
    fieldContentSliderClear: {
        display: 'inline',
        width: 32,
    },
    fieldHelpText: {
        float: 'right',
        fontSize: 16,
    },
    iconPreview: {},
};

export default commonStyles;
