/**
 * This file contains shared utils between edit and runtime
 */
import type { CSSProperties } from '@mui/styles';

/**
 * Adds an overflow visible attribute if no specific overflow is present
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
