/**
 * This file contains shared utils between edit and runtime
 */
import type { CSSProperties } from '@mui/styles';

/**
 * Adds an overflow visible attribute if no specific overflow is present,
 * else it deletes the general overflow, so the specific one can take effect
 *
 * @param style the style to modify
 */
export function calculateOverflow(style: CSSProperties): void {
    if (!style.overflowX && !style.overflowY) {
        style.overflow = 'visible';
    } else if (style.overflow) {
        delete style.overflow;
    }
}

/**
 * Check, that given number is not Infinity or NaN
 *
 * @param numberOrString number or string to check
 */
export function isVarFinite(numberOrString: number | string): boolean {
    // the difference between Number.isFinite and window.isFinite is that window.isFinite tries to convert the parameter to a number
    // and Number.isFinite does not and just check against non NaN and non Infinity
    const num = typeof numberOrString === 'string' ? parseFloat(numberOrString) : numberOrString;

    // eslint-disable-next-line no-restricted-properties
    return window.isFinite(num);
}
