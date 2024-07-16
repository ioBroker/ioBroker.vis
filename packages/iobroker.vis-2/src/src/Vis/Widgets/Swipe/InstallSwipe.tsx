interface SwipeElement extends HTMLElement {
    _swipe?: true;
}

export default class InstallSwipe {
    private el: SwipeElement;

    private locked = false;

    private x0: null | number = null;

    private readonly onSwipeLeft: null | (() => void) = null;

    private readonly onSwipeRight: null | (() => void) = null;

    private hideIndication = false;

    private indicationLeft = '';

    private indicationRight = '';

    private swipeThreshold = 30;

    private indicatorNode: null | HTMLElement = null;

    constructor(options: {
        onSwipeLeft?: null | (() => void);
        onSwipeRight?: null | (() => void);
    }) {
        this.onSwipeRight = options.onSwipeRight;
        this.onSwipeLeft = options.onSwipeLeft;
    }

    install(el?: HTMLElement, options?: {
        hideIndication?: boolean;
        indicationLeft?: string;
        indicationRight?: string;
        swipeThreshold?: number;
    }) {
        if (el) {
            this.el = el as SwipeElement;
        }
        if (options) {
            if (options.hideIndication !== undefined) {
                this.hideIndication = options.hideIndication;
            }
            if (options.indicationLeft !== undefined) {
                this.indicationLeft = options.indicationLeft;
            }
            if (options.indicationRight !== undefined) {
                this.indicationRight = options.indicationRight;
            }
            if (options.swipeThreshold !== undefined) {
                this.swipeThreshold = Math.abs(options.swipeThreshold) || 30;
            }
        }

        this.init();
    }

    destroy() {
        if (this.el?._swipe) {
            this.el.removeEventListener('mousedown', this.moveStart, false);
            this.el.removeEventListener('touchstart', this.moveStart, false);
            delete this.el._swipe;
            this.removeIndicator();
        }
    }

    static unify(e: MouseEvent | TouchEvent): MouseEvent {
        return (e as TouchEvent).changedTouches ? (e as TouchEvent).changedTouches[0] as unknown as MouseEvent : e as MouseEvent;
    }

    private move = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();

        if (this.locked) {
            const dx = InstallSwipe.unify(e).clientX - this.x0;
            if ((dx > 0 && this.onSwipeRight && this.indicationRight)) {
                this.el.style.transform = `translateX(${dx}px)`;
            } else if ((dx < 0 && this.onSwipeLeft && this.indicationLeft)) {
                this.el.style.transform = `translateX(${dx}px)`;
            }
            if (Math.abs(dx) > this.swipeThreshold) {
                // show indicator
                this.showIndication(dx);
            } else if (this.indicatorNode) {
                this.indicatorNode.style.display = 'none';
            }
        }
    };

    private removeIndicator() {
        if (this.indicatorNode) {
            this.indicatorNode.remove();
            this.indicatorNode = null;
        }
        if (this.locked) {
            if (this.el) {
                this.el.style.transform = '';
                this.el.removeEventListener('mousemove', this.move, false);
                this.el.removeEventListener('touchmove', this.move, false);

                this.el.removeEventListener('mouseup', this.moveEnd, false);
                this.el.removeEventListener('touchend', this.moveEnd, false);
            }

            this.x0 = null;
            this.locked = false;
        }
    }

    private moveEnd = (e: MouseEvent | TouchEvent) => {
        if (this.locked) {
            // calculate X distance
            const dx = InstallSwipe.unify(e).clientX - this.x0;

            this.removeIndicator();

            if (dx > this.swipeThreshold && this.onSwipeRight) {
                this.onSwipeRight();
            } else if (dx < -1 * this.swipeThreshold && this.onSwipeLeft) {
                this.onSwipeLeft();
            }
        }
    };

    private moveStart = (e: MouseEvent | TouchEvent) => {
        if (!this.locked) {
            this.locked = true;
            // remember start point
            this.x0 = InstallSwipe.unify(e).clientX;

            this.el.addEventListener('mousemove', this.move, false);
            this.el.addEventListener('touchmove', this.move, false);

            this.el.addEventListener('mouseup', this.moveEnd, false);
            this.el.addEventListener('touchend', this.moveEnd, false);
        }
    };

    private init() {
        if (!this.el._swipe) {
            this.el.addEventListener('mousedown', this.moveStart, false);
            this.el.addEventListener('touchstart', this.moveStart, false);
            this.el._swipe = true;
        }
    }

    private showIndication(dx: number) {
        if (this.hideIndication) {
            return;
        }
        if (!this.indicatorNode) {
            this.indicatorNode = document.createElement('div');
            this.indicatorNode.style.position = 'absolute';
            this.indicatorNode.setAttribute('id', 'vis-2-swipe-indicator');
            this.indicatorNode.style.top = 'calc(50% - 16px)';
            this.indicatorNode.style.zIndex = '2000';
            this.indicatorNode.style.fontSize = '32px';
            this.el.parentNode.appendChild(this.indicatorNode);
        }

        if (dx > this.swipeThreshold) {
            this.indicatorNode.innerHTML = `← ${this.indicationRight}`;
            this.indicatorNode.style.left = '5%';
            this.indicatorNode.style.right = '';
            this.indicatorNode.style.display = 'block';
        } else if (dx < -1 * this.swipeThreshold) {
            this.indicatorNode.innerHTML = `${this.indicationLeft} →`;
            this.indicatorNode.style.right = '5%';
            this.indicatorNode.style.left = '';
            this.indicatorNode.style.display = 'block';
        } else {
            this.indicatorNode.style.display = 'none';
        }
    }
}
