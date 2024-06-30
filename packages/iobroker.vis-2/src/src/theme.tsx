import type React from 'react';
import { Theme, type ThemeName } from '@iobroker/adapter-react-v5';
import type { VisTheme } from '@iobroker/types-vis-2';

export default function createTheme(
    themeName: ThemeName,
    overrides?: Record<string, any>,
): VisTheme {
    const danger = '#dd5325';
    const success = '#73b6a8';
    const theme: VisTheme = Theme(themeName, overrides) as VisTheme;
    theme.palette.text.danger = {
        color: danger,
    };
    theme.palette.text.success = {
        color: success,
    };

    const classes: {
        blockHeader: React.CSSProperties;
        viewTabs: React.CSSProperties;
        viewTab: React.CSSProperties;
        lightedPanel: React.CSSProperties;
        toolbar: React.CSSProperties;
        viewManageBlock: React.CSSProperties;
        viewManageButtonActions: React.CSSProperties;
    } = {
        blockHeader: {
            fontSize: 16,
            textAlign: 'left',
            marginTop: '8px',
            borderRadius: '2px',
            paddingLeft: '8px',
        },
        viewTabs: {
            minHeight: 0,
        },
        viewTab: {
            minWidth: 0,
            minHeight: 0,
        },
        lightedPanel: {
            backgroundColor: themeName === 'dark' || themeName === 'blue' ? 'hsl(0deg 0% 20%)' : 'hsl(0deg 0% 90%)',
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            paddingTop: '10px',
            paddingBottom: '10px',
        },
        viewManageBlock: {
            display: 'flex',
            alignItems: 'center',
        },
        viewManageButtonActions: {
            textAlign: 'right',
            flex: 1,
        },
    };

    if (!theme.classes) {
        theme.classes = classes;
    } else {
        Object.assign(theme.classes, classes);
    }

    return theme;
}
