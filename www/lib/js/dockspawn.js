!function (e) {
    if ("object" == typeof exports && "undefined" != typeof module)module.exports = e(); else if ("function" == typeof define && define.amd)define([], e); else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.dockspawn = e()
    }
}(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a)return a(o, !0);
                    if (i)return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {exports: {}};
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }

        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++)s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            module.exports = {
                pkg: require('../package.json'),

                // tab
                TabHandle: require('./tab/TabHandle'),
                TabHost: require('./tab/TabHost'),
                TabPage: require('./tab/TabPage'),

                // dialog
                Dialog: require('./dialog/Dialog'),

                // decorators
                DraggableContainer: require('./decorators/DraggableContainer'),
                ResizableContainer: require('./decorators/ResizableContainer'),

                // dock
                DockLayoutEngine: require('./dock/DockLayoutEngine'),
                DockManager: require('./dock/DockManager'),
                DockManagerContext: require('./dock/DockManagerContext'),
                DockModel: require('./dock/DockModel'),
                DockNode: require('./dock/DockNode'),
                DockWheel: require('./dock/DockWheel'),
                DockWheelItem: require('./dock/DockWheelItem'),

                // containers
                DocumentManagerContainer: require('./containers/DocumentManagerContainer'),
                FillDockContainer: require('./containers/FillDockContainer'),
                HorizontalDockContainer: require('./containers/HorizontalDockContainer'),
                PanelContainer: require('./containers/PanelContainer'),
                SplitterDockContainer: require('./containers/SplitterDockContainer'),
                VerticalDockContainer: require('./containers/VerticalDockContainer'),

                // splitter
                SplitterBar: require('./splitter/SplitterBar'),
                SplitterPanel: require('./splitter/SplitterPanel'),

                // serialization
                DockGraphDeserializer: require('./serialization/DockGraphDeserializer'),
                DockGraphSerializer: require('./serialization/DockGraphSerializer'),

                // utils
                Point: require('./utils/Point'),
                EventHandler: require('./utils/EventHandler'),
                UndockInitiator: require('./utils/UndockInitiator')
            };

            module.exports.version = module.exports.pkg.version;

            if (!Array.prototype.remove) {
                Array.prototype.remove = function (value) {
                    var idx = this.indexOf(value);

                    if (idx !== -1) {
                        return this.splice(idx, 1);
                    }

                    return false;
                };
            }

            if (!Array.prototype.contains) {
                Array.prototype.contains = function (obj) {
                    var i = this.length;

                    while (i--) {
                        if (this[i] === obj) {
                            return true;
                        }
                    }

                    return false;
                };
            }

            if (!Array.prototype.orderByIndexes) {
                Array.prototype.orderByIndexes = function (indexes) {
                    var sortedArray = [];

                    for (var i = 0; i < indexes.length; i++) {
                        sortedArray.push(this[indexes[i]]);
                    }

                    return sortedArray;
                };
            }

        }, {
            "../package.json": 2,
            "./containers/DocumentManagerContainer": 3,
            "./containers/FillDockContainer": 5,
            "./containers/HorizontalDockContainer": 6,
            "./containers/PanelContainer": 7,
            "./containers/SplitterDockContainer": 8,
            "./containers/VerticalDockContainer": 9,
            "./decorators/DraggableContainer": 10,
            "./decorators/ResizableContainer": 11,
            "./dialog/Dialog": 12,
            "./dock/DockLayoutEngine": 13,
            "./dock/DockManager": 14,
            "./dock/DockManagerContext": 15,
            "./dock/DockModel": 16,
            "./dock/DockNode": 17,
            "./dock/DockWheel": 18,
            "./dock/DockWheelItem": 19,
            "./serialization/DockGraphDeserializer": 20,
            "./serialization/DockGraphSerializer": 21,
            "./splitter/SplitterBar": 22,
            "./splitter/SplitterPanel": 23,
            "./tab/TabHandle": 24,
            "./tab/TabHost": 25,
            "./tab/TabPage": 26,
            "./utils/EventHandler": 27,
            "./utils/Point": 28,
            "./utils/UndockInitiator": 30
        }],
        2: [function (require, module, exports) {
            module.exports = {
                "name": "dock-spawn",
                "version": "1.0.0",
                "description": "Panel docking library similar to Visual Studio docking.",
                "author": "Chad Engler <chad@pantherdev.com>",
                "homepage": "https://github.com/englercj/dock-spawn",
                "main": "./src/index",
                "scripts": {
                    "build": "gulp build"
                },
                "repository": {
                    "type": "git",
                    "url": "https://github.com/englercj/dock-spawn.git"
                },
                "bugs": {
                    "url": "https://github.com/englercj/dock-spawn/issues"
                },
                "dependencies": {},
                "devDependencies": {
                    "browserify": "^6.0.3",
                    "gulp": "^3.8.8",
                    "gulp-jshint": "^1.8.5",
                    "gulp-util": "^3.0.1",
                    "jshint-summary": "^0.4.0",
                    "vinyl-source-stream": "^1.0.0",
                    "watchify": "^2.0.0"
                }
            }

        }, {}],
        3: [function (require, module, exports) {
            var FillDockContainer = require('./FillDockContainer'),
                DocumentTabPage = require('./DocumentTabPage'),
                TabHost = require('../tab/TabHost');

            /**
             * The document manager is then central area of the dock layout hierarchy.
             * This is where more important panels are placed (e.g. the text editor in an IDE,
             * 3D view in a modelling package etc
             */

            function DocumentManagerContainer(dockManager) {
                FillDockContainer.call(this, dockManager, TabHost.DIRECTION_TOP);
                this.minimumAllowedChildNodes = 0;
                this.element.classList.add('document-manager');
                this.tabHost.createTabPage = this._createDocumentTabPage;
                this.tabHost.displayCloseButton = true;
            }

            DocumentManagerContainer.prototype = Object.create(FillDockContainer.prototype);
            DocumentManagerContainer.prototype.constructor = DocumentManagerContainer;
            module.exports = DocumentManagerContainer;

            DocumentManagerContainer.prototype._createDocumentTabPage = function (tabHost, container) {
                return new DocumentTabPage(tabHost, container);
            };

            DocumentManagerContainer.prototype.saveState = function (state) {
                FillDockContainer.prototype.saveState.call(this, state);
                state.documentManager = true;
            };

            /** Returns the selected document tab */
            DocumentManagerContainer.prototype.selectedTab = function () {
                return this.tabHost.activeTab;
            };

        }, {"../tab/TabHost": 25, "./DocumentTabPage": 4, "./FillDockContainer": 5}],
        4: [function (require, module, exports) {
            var TabPage = require('../tab/TabPage'),
                utils = require('../utils/utils');

            /**
             * Specialized tab page that doesn't display the panel's frame when docked in a tab page
             */
            function DocumentTabPage(host, container) {
                TabPage.call(this, host, container);

                // If the container is a panel, extract the content element and set it as the tab's content
                if (this.container.containerType === 'panel') {
                    this.panel = container;
                    this.containerElement = this.panel.elementContent;

                    // detach the container element from the panel's frame.
                    // It will be reattached when this tab page is destroyed
                    // This enables the panel's frame (title bar etc) to be hidden
                    // inside the tab page
                    utils.removeNode(this.containerElement);
                }
            }

            DocumentTabPage.prototype = Object.create(TabPage.prototype);
            DocumentTabPage.prototype.constructor = DocumentTabPage;
            module.exports = DocumentTabPage;

            DocumentTabPage.prototype.destroy = function () {
                TabPage.prototype.destroy.call(this);

                // Restore the panel content element back into the panel frame
                utils.removeNode(this.containerElement);
                this.panel.elementContentHost.appendChild(this.containerElement);
            };

        }, {"../tab/TabPage": 26, "../utils/utils": 31}],
        5: [function (require, module, exports) {
            var TabHost = require('../tab/TabHost'),
                utils = require('../utils/utils');

            function FillDockContainer(dockManager, tabStripDirection) {
                if (arguments.length === 0) {
                    return;
                }

                if (tabStripDirection === undefined) {
                    tabStripDirection = TabHost.DIRECTION_BOTTOM;
                }

                this.dockManager = dockManager;
                this.tabOrientation = tabStripDirection;
                this.name = utils.getNextId('fill_');
                this.element = document.createElement('div');
                this.containerElement = this.element;
                this.containerType = 'fill';
                this.minimumAllowedChildNodes = 2;
                this.element.classList.add('dock-container');
                this.element.classList.add('dock-container-fill');
                this.tabHost = new TabHost(this.tabOrientation);
                var that = this;
                this.tabHostListener = {
                    onChange: function (e) {
                        that.dockManager._requestTabReorder(that, e);
                    }
                };
                this.tabHost.addListener(this.tabHostListener);
                this.element.appendChild(this.tabHost.hostElement);
            }

            module.exports = FillDockContainer;

            FillDockContainer.prototype.setActiveChild = function (child) {
                this.tabHost.setActiveTab(child);
            };

            FillDockContainer.prototype.resize = function (width, height) {
                this.element.style.width = width + 'px';
                this.element.style.height = height + 'px';
                this.tabHost.resize(width, height);
            };

            FillDockContainer.prototype.performLayout = function (children) {
                this.tabHost.performLayout(children);
            };

            FillDockContainer.prototype.destroy = function () {
                if (utils.removeNode(this.element))
                    delete this.element;
            };

            FillDockContainer.prototype.saveState = function (state) {
                state.width = this.width;
                state.height = this.height;
            };

            FillDockContainer.prototype.loadState = function (state) {
                // this.resize(state.width, state.height);
                // this.width = state.width;
                // this.height = state.height;
                this.state = {width: state.width, height: state.height};
            };

            Object.defineProperty(FillDockContainer.prototype, 'width', {
                get: function () {
                    // if(this.element.clientWidth === 0 && this.stateWidth !== 0)
                    //     return this.stateWidth;
                    return this.element.clientWidth;
                },
                set: function (value) {
                    this.element.style.width = value + 'px';
                }
            });

            Object.defineProperty(FillDockContainer.prototype, 'height', {
                get: function () {
                    // if(this.element.clientHeight === 0 && this.stateHeight !== 0)
                    //     return this.stateHeight;
                    return this.element.clientHeight;
                },
                set: function (value) {
                    this.element.style.height = value + 'px';
                }
            });

        }, {"../tab/TabHost": 25, "../utils/utils": 31}],
        6: [function (require, module, exports) {
            var SplitterDockContainer = require('./SplitterDockContainer'),
                utils = require('../utils/utils');

            function HorizontalDockContainer(dockManager, childContainers) {
                this.stackedVertical = false;
                SplitterDockContainer.call(this, utils.getNextId('horizontal_splitter_'), dockManager, childContainers);
                this.containerType = 'horizontal';
            }

            HorizontalDockContainer.prototype = Object.create(SplitterDockContainer.prototype);
            HorizontalDockContainer.prototype.constructor = HorizontalDockContainer;
            module.exports = HorizontalDockContainer;

        }, {"../utils/utils": 31, "./SplitterDockContainer": 8}],
        7: [function (require, module, exports) {
            var EventHandler = require('../utils/EventHandler'),
                UndockInitiator = require('../utils/UndockInitiator'),
                utils = require('../utils/utils');

            /**
             * This dock container wraps the specified element on a panel frame with a title bar and close button
             */
            function PanelContainer(elementContent, dockManager, title) {
                if (!title)
                    title = 'Panel';
                this.elementContent = elementContent;
                this.dockManager = dockManager;
                this.title = title;
                this.containerType = 'panel';
                this.iconName = '';
                this.minimumAllowedChildNodes = 0;
                this._floatingDialog = undefined;
                this.isDialog = false;
                this._canUndock = dockManager._undockEnabled;
                this.eventListeners = [];
                this._initialize();
            }

            module.exports = PanelContainer;

            PanelContainer.prototype.canUndock = function (state) {
                this._canUndock = state;
                this.undockInitiator.enabled = state;
                this.eventListeners.forEach(function (listener) {
                    if (listener.onDockEnabled) {
                        listener.onDockEnabled({self: this, state: state});
                    }
                });

            };

            PanelContainer.prototype.addListener = function (listener) {
                this.eventListeners.push(listener);
            };

            PanelContainer.prototype.removeListener = function (listener) {
                this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
            };

            Object.defineProperty(PanelContainer.prototype, 'floatingDialog', {
                get: function () {
                    return this._floatingDialog;
                },
                set: function (value) {
                    this._floatingDialog = value;
                    var canUndock = (this._floatingDialog === undefined);
                    this.undockInitiator.enabled = canUndock;
                }
            });

            PanelContainer.loadFromState = function (state, dockManager) {
                var elementName = state.element;
                var elementContent = document.getElementById(elementName);
                if (elementContent === null) {
                    return null;
                }
                var ret = new PanelContainer(elementContent, dockManager);
                ret.loadState(state);
                return ret;
            };

            PanelContainer.prototype.saveState = function (state) {
                state.element = this.elementContent.id;
                state.width = this.width;
                state.height = this.height;
            };

            PanelContainer.prototype.loadState = function (state) {
                this.width = state.width;
                this.height = state.height;
                this.state = {width: state.width, height: state.height};
                // this.resize(this.width, this.height);
            };

            PanelContainer.prototype.setActiveChild = function (/*child*/) {
            };

            Object.defineProperty(PanelContainer.prototype, 'containerElement', {
                get: function () {
                    return this.elementPanel;
                }
            });

            PanelContainer.prototype._initialize = function () {
                this.name = utils.getNextId('panel_');
                this.elementPanel = document.createElement('div');
                this.elementTitle = document.createElement('div');
                this.elementTitleText = document.createElement('div');
                this.elementContentHost = document.createElement('div');
                this.elementButtonClose = document.createElement('div');

                this.elementPanel.appendChild(this.elementTitle);
                this.elementTitle.appendChild(this.elementTitleText);
                this.elementTitle.appendChild(this.elementButtonClose);
                this.elementButtonClose.innerHTML = '<span class="ui-icon ui-icon-closethick"></span>';
                this.elementButtonClose.classList.add('panel-titlebar-button-close');
                this.elementPanel.appendChild(this.elementContentHost);

                this.elementPanel.classList.add('panel-base');
                this.elementTitle.classList.add('panel-titlebar', 'ui-state-default');
                this.elementTitle.classList.add('disable-selection');
                this.elementTitleText.classList.add('panel-titlebar-text');
                this.elementContentHost.classList.add('panel-content');
                this.elementContentHost.classList.add('ui-widget-header');

                // set the size of the dialog elements based on the panel's size
                var panelWidth = this.elementContent.clientWidth;
                var panelHeight = this.elementContent.clientHeight ;
                var titleHeight = this.elementTitle.clientHeight;
                this._setPanelDimensions(panelWidth, panelHeight + titleHeight);

                // Add the panel to the body
                document.body.appendChild(this.elementPanel);

                this.closeButtonClickedHandler =
                    new EventHandler(this.elementButtonClose, 'click', this.onCloseButtonClicked.bind(this));

                utils.removeNode(this.elementContent);
                this.elementContentHost.appendChild(this.elementContent);

                // Extract the title from the content element's attribute
                var contentTitle = this.elementContent.dataset.panelCaption;
                var contentIcon = this.elementContent.dataset.panelicon;
                if (contentTitle) this.title = contentTitle;
                if (contentIcon) this.iconName = contentIcon
                this._updateTitle();

                this.undockInitiator = new UndockInitiator(this.elementTitle, this.performUndockToDialog.bind(this));
                delete this.floatingDialog;
            };


            PanelContainer.prototype.hideCloseButton = function (state) {
                this.elementButtonClose.style.display = state ? 'none' : 'block';
                this.eventListeners.forEach(function (listener) {
                    if (listener.onHideCloseButton) {
                        listener.onHideCloseButton({self: this, state: state});
                    }
                });
            };


            PanelContainer.prototype.destroy = function () {
                utils.removeNode(this.elementPanel);
                if (this.closeButtonClickedHandler) {
                    this.closeButtonClickedHandler.cancel();
                    delete this.closeButtonClickedHandler;
                }
            };

            /**
             * Undocks the panel and and converts it to a dialog box
             */
            PanelContainer.prototype.performUndockToDialog = function (e, dragOffset) {
                this.isDialog = true;
                this.undockInitiator.enabled = false;
                return this.dockManager.requestUndockToDialog(this, e, dragOffset);
            };

            /**
             * Undocks the container and from the layout hierarchy
             * The container would be removed from the DOM
             */
            PanelContainer.prototype.performUndock = function () {

                this.undockInitiator.enabled = false;
                this.dockManager.requestUndock(this);
            };

            PanelContainer.prototype.prepareForDocking = function () {
                this.isDialog = false;
                this.undockInitiator.enabled = this.canUndock;
            };

            Object.defineProperty(PanelContainer.prototype, 'width', {
                get: function () {
                    return this._cachedWidth;
                },
                set: function (value) {
                    if (value !== this._cachedWidth) {
                        this._cachedWidth = value;
                        this.elementPanel.style.width = value + 'px';
                    }
                }
            });

            Object.defineProperty(PanelContainer.prototype, 'height', {
                get: function () {
                    return this._cachedHeight;
                },
                set: function (value) {
                    if (value !== this._cachedHeight) {
                        this._cachedHeight = value;
                        this.elementPanel.style.height = value + 'px';
                    }
                }
            });

            PanelContainer.prototype.resize = function (width, height) {
                // if (this._cachedWidth === width && this._cachedHeight === height)
                // {
                //     // Already in the desired size
                //     return;
                // }
                this._setPanelDimensions(width, height);
                this._cachedWidth = width;
                this._cachedHeight = height;
            };

            PanelContainer.prototype._setPanelDimensions = function (width, height) {
                this.elementTitle.style.width = width + 'px';
                this.elementContentHost.style.width = width + 'px';
                this.elementContent.style.width = width + 'px';
                this.elementPanel.style.width = width+ 'px';

                var titleBarHeight = this.elementTitle.clientHeight +8 ;
                var contentHeight = height - titleBarHeight +8 ;
                this.elementContentHost.style.height = contentHeight + 'px';
                this.elementContent.style.height = contentHeight   + 'px';
                this.elementPanel.style.height = height + 'px';
            };

            PanelContainer.prototype.setTitle = function (title) {
                this.title = title;
                this._updateTitle();
                if (this.onTitleChanged)
                    this.onTitleChanged(this, title);
            };

            PanelContainer.prototype.setTitleIcon = function (iconName) {
                this.iconName = iconName;
                this._updateTitle();
                if (this.onTitleChanged)
                    this.onTitleChanged(this, this.title);
            };


            PanelContainer.prototype._updateTitle = function () {
                if (this.iconName == "") {
                    this.elementTitleText.innerHTML = this.title;
                } else {
                    this.elementTitleText.innerHTML = '<span style="display: inline-block" class="ui-icon ' + this.iconName + '"></span>' + this.title;
                }

            };

            PanelContainer.prototype.getRawTitle = function () {
                return this.elementTitleText.innerHTML;
            };

            PanelContainer.prototype.performLayout = function (/*children*/) {
            };

            PanelContainer.prototype.onCloseButtonClicked = function () {
                this.close();
            };

            PanelContainer.prototype.close = function () {
                //TODO: hide
                if (this.isDialog) {
                    this.floatingDialog.hide();

                    this.floatingDialog.setPosition(this.dockManager.defaultDialogPosition.x, this.dockManager.defaultDialogPosition.y);
                }
                else {
                    this.performUndockToDialog();
                    this.floatingDialog.hide();
                    this.floatingDialog.setPosition(this.dockManager.defaultDialogPosition.x, this.dockManager.defaultDialogPosition.y);
                }
                this.dockManager.notifyOnClosePanel(this);
            };

        }, {"../utils/EventHandler": 27, "../utils/UndockInitiator": 30, "../utils/utils": 31}],
        8: [function (require, module, exports) {
            var SplitterPanel = require('../splitter/SplitterPanel');

            function SplitterDockContainer(name, dockManager, childContainers) {
                // for prototype inheritance purposes only
                if (arguments.length === 0) {
                    return;
                }

                this.name = name;
                this.dockManager = dockManager;
                this.splitterPanel = new SplitterPanel(childContainers, this.stackedVertical);
                this.containerElement = this.splitterPanel.panelElement;
                this.minimumAllowedChildNodes = 2;
            }

            module.exports = SplitterDockContainer;

            SplitterDockContainer.prototype.resize = function (width, height) {
//    if (_cachedWidth === _cachedWidth && _cachedHeight === _height) {
//      // No need to resize
//      return;
//    }
                this.splitterPanel.resize(width, height);
                this._cachedWidth = width;
                this._cachedHeight = height;
            };

            SplitterDockContainer.prototype.performLayout = function (childContainers) {
                this.splitterPanel.performLayout(childContainers);
            };

            SplitterDockContainer.prototype.setActiveChild = function (/*child*/) {
            };

            SplitterDockContainer.prototype.destroy = function () {
                this.splitterPanel.destroy();
            };

            /**
             * Sets the percentage of space the specified [container] takes in the split panel
             * The percentage is specified in [ratio] and is between 0..1
             */
            SplitterDockContainer.prototype.setContainerRatio = function (container, ratio) {
                this.splitterPanel.setContainerRatio(container, ratio);
                this.resize(this.width, this.height);
            };

            SplitterDockContainer.prototype.saveState = function (state) {
                state.width = this.width;
                state.height = this.height;
            };

            SplitterDockContainer.prototype.loadState = function (state) {
                this.state = {width: state.width, height: state.height};
                // this.resize(state.width, state.height);
            };

            Object.defineProperty(SplitterDockContainer.prototype, 'width', {
                get: function () {
                    if (this._cachedWidth === undefined)
                        this._cachedWidth = this.splitterPanel.panelElement.clientWidth;
                    return this._cachedWidth;
                }
            });

            Object.defineProperty(SplitterDockContainer.prototype, 'height', {
                get: function () {
                    if (this._cachedHeight === undefined)
                        this._cachedHeight = this.splitterPanel.panelElement.clientHeight;
                    return this._cachedHeight;
                }
            });

        }, {"../splitter/SplitterPanel": 23}],
        9: [function (require, module, exports) {
            var SplitterDockContainer = require('./SplitterDockContainer'),
                utils = require('../utils/utils');

            function VerticalDockContainer(dockManager, childContainers) {
                this.stackedVertical = true;
                SplitterDockContainer.call(this, utils.getNextId('vertical_splitter_'), dockManager, childContainers);
                this.containerType = 'vertical';
            }

            VerticalDockContainer.prototype = Object.create(SplitterDockContainer.prototype);
            VerticalDockContainer.prototype.constructor = VerticalDockContainer;
            module.exports = VerticalDockContainer;

        }, {"../utils/utils": 31, "./SplitterDockContainer": 8}],
        10: [function (require, module, exports) {
            var EventHandler = require('../utils/EventHandler'),
                Point = require('../utils/Point'),
                utils = require('../utils/utils');

            function DraggableContainer(dialog, delegate, topLevelElement, dragHandle) {
                this.dialog = dialog;
                this.delegate = delegate;
                this.containerElement = delegate.containerElement;
                this.dockManager = delegate.dockManager;
                this.topLevelElement = topLevelElement;
                this.containerType = delegate.containerType;
                this.mouseDownHandler = new EventHandler(dragHandle, 'mousedown', this.onMouseDown.bind(this));
                this.topLevelElement.style.marginLeft = topLevelElement.offsetLeft + 'px';
                this.topLevelElement.style.marginTop = topLevelElement.offsetTop + 'px';
                this.minimumAllowedChildNodes = delegate.minimumAllowedChildNodes;
            }

            module.exports = DraggableContainer;

            DraggableContainer.prototype.destroy = function () {
                this.removeDecorator();
                this.delegate.destroy();
            };

            DraggableContainer.prototype.saveState = function (state) {
                this.delegate.saveState(state);
            };

            DraggableContainer.prototype.loadState = function (state) {
                this.delegate.loadState(state);
            };

            DraggableContainer.prototype.setActiveChild = function (/*child*/) {
            };

            Object.defineProperty(DraggableContainer.prototype, 'width', {
                get: function () {
                    return this.delegate.width;
                }
            });

            Object.defineProperty(DraggableContainer.prototype, 'height', {
                get: function () {
                    return this.delegate.height;
                }
            });

            DraggableContainer.prototype.name = function (value) {
                if (value)
                    this.delegate.name = value;
                return this.delegate.name;
            };

            DraggableContainer.prototype.resize = function (width, height) {
                this.delegate.resize(width, height);
            };

            DraggableContainer.prototype.performLayout = function (children) {
                this.delegate.performLayout(children);
            };

            DraggableContainer.prototype.removeDecorator = function () {
                if (this.mouseDownHandler) {
                    this.mouseDownHandler.cancel();
                    delete this.mouseDownHandler;
                }
            };

            DraggableContainer.prototype.onMouseDown = function (event) {
                this._startDragging(event);
                this.previousMousePosition = {x: event.pageX, y: event.pageY};
                if (this.mouseMoveHandler) {
                    this.mouseMoveHandler.cancel();
                    delete this.mouseMoveHandler;
                }
                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                    delete this.mouseUpHandler;
                }

                this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMove.bind(this));
                this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
            };

            DraggableContainer.prototype.onMouseUp = function (event) {
                this._stopDragging(event);
                this.mouseMoveHandler.cancel();
                delete this.mouseMoveHandler;
                this.mouseUpHandler.cancel();
                delete this.mouseUpHandler;
            };

            DraggableContainer.prototype._startDragging = function (event) {
                if (this.dialog.eventListener)
                    this.dialog.eventListener.onDialogDragStarted(this.dialog, event);
                document.body.classList.add('disable-selection');
            };

            DraggableContainer.prototype._stopDragging = function (event) {
                if (this.dialog.eventListener)
                    this.dialog.eventListener.onDialogDragEnded(this.dialog, event);
                document.body.classList.remove('disable-selection');
            };

            DraggableContainer.prototype.onMouseMove = function (event) {
                var currentMousePosition = new Point(event.pageX, event.pageY);

                var dx = this.dockManager.checkXBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
                var dy = this.dockManager.checkYBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
                this._performDrag(dx, dy);
                this.previousMousePosition = currentMousePosition;
            };

            DraggableContainer.prototype._performDrag = function (dx, dy) {
                var left = dx + utils.getPixels(this.topLevelElement.style.marginLeft);
                var top = dy + utils.getPixels(this.topLevelElement.style.marginTop);
                this.topLevelElement.style.marginLeft = left + 'px';
                this.topLevelElement.style.marginTop = top + 'px';
            };

        }, {"../utils/EventHandler": 27, "../utils/Point": 28, "../utils/utils": 31}],
        11: [function (require, module, exports) {
            var EventHandler = require('../utils/EventHandler'),
                Point = require('../utils/Point'),
                utils = require('../utils/utils');

            /**
             * Decorates a dock container with resizer handles around its base element
             * This enables the container to be resized from all directions
             */
            function ResizableContainer(dialog, delegate, topLevelElement) {
                this.dialog = dialog;
                this.delegate = delegate;
                this.containerElement = delegate.containerElement;
                this.dockManager = delegate.dockManager;
                this.topLevelElement = topLevelElement;
                this.containerType = delegate.containerType;
                this.topLevelElement.style.marginLeft = this.topLevelElement.offsetLeft + 'px';
                this.topLevelElement.style.marginTop = this.topLevelElement.offsetTop + 'px';
                this.minimumAllowedChildNodes = delegate.minimumAllowedChildNodes;
                this._buildResizeHandles();
                this.readyToProcessNextResize = true;
            }

            module.exports = ResizableContainer;

            ResizableContainer.prototype.setActiveChild = function (/*child*/) {
            };

            ResizableContainer.prototype._buildResizeHandles = function () {
                this.resizeHandles = [];
//    this._buildResizeHandle(true, false, true, false); // Dont need the corner resizer near the close button
                this._buildResizeHandle(false, true, true, false);
                this._buildResizeHandle(true, false, false, true);
                this._buildResizeHandle(false, true, false, true);

                this._buildResizeHandle(true, false, false, false);
                this._buildResizeHandle(false, true, false, false);
                this._buildResizeHandle(false, false, true, false);
                this._buildResizeHandle(false, false, false, true);
            };

            ResizableContainer.prototype._buildResizeHandle = function (east, west, north, south) {
                var handle = new ResizeHandle();
                handle.east = east;
                handle.west = west;
                handle.north = north;
                handle.south = south;

                // Create an invisible div for the handle
                handle.element = document.createElement('div');
                this.topLevelElement.appendChild(handle.element);

                // Build the class name for the handle
                var verticalClass = '';
                var horizontalClass = '';
                if (north) verticalClass = 'n';
                if (south) verticalClass = 's';
                if (east) horizontalClass = 'e';
                if (west) horizontalClass = 'w';
                var cssClass = 'resize-handle-' + verticalClass + horizontalClass;
                if (verticalClass.length > 0 && horizontalClass.length > 0)
                    handle.corner = true;

                handle.element.classList.add(handle.corner ? 'resize-handle-corner' : 'resize-handle');
                handle.element.classList.add(cssClass);
                this.resizeHandles.push(handle);

                var self = this;
                handle.mouseDownHandler = new EventHandler(handle.element, 'mousedown', function (e) {
                    self.onMouseDown(handle, e);
                });
            };

            ResizableContainer.prototype.saveState = function (state) {
                this.delegate.saveState(state);
            };

            ResizableContainer.prototype.loadState = function (state) {
                this.delegate.loadState(state);
            };

            Object.defineProperty(ResizableContainer.prototype, 'width', {
                get: function () {
                    return this.delegate.width;
                }
            });

            Object.defineProperty(ResizableContainer.prototype, 'height', {
                get: function () {
                    return this.delegate.height;
                }
            });

            ResizableContainer.prototype.name = function (value) {
                if (value)
                    this.delegate.name = value;
                return this.delegate.name;
            };

            ResizableContainer.prototype.resize = function (width, height) {
                this.delegate.resize(width, height);
                this._adjustResizeHandles(width, height);
            };

            ResizableContainer.prototype._adjustResizeHandles = function (width, height) {
                var self = this;
                this.resizeHandles.forEach(function (handle) {
                    handle.adjustSize(self.topLevelElement, width, height);
                });
            };

            ResizableContainer.prototype.performLayout = function (children) {
                this.delegate.performLayout(children);
            };

            ResizableContainer.prototype.destroy = function () {
                this.removeDecorator();
                this.delegate.destroy();
            };

            ResizableContainer.prototype.removeDecorator = function () {
            };

            ResizableContainer.prototype.onMouseMoved = function (handle, e) {
                if (!this.readyToProcessNextResize)
                    return;
                this.readyToProcessNextResize = false;

//    window.requestLayoutFrame(() {
                this.dockManager.suspendLayout();
                var currentMousePosition = new Point(e.pageX, e.pageY);
                var dx = this.dockManager.checkXBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
                var dy = this.dockManager.checkYBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
                this._performDrag(handle, dx, dy);
                this.previousMousePosition = currentMousePosition;
                this.readyToProcessNextResize = true;
                if (this.dialog.panel)
                    this.dockManager.resumeLayout(this.dialog.panel);
            };

            ResizableContainer.prototype.onMouseDown = function (handle, event) {
                this.previousMousePosition = new Point(event.pageX, event.pageY);
                if (handle.mouseMoveHandler) {
                    handle.mouseMoveHandler.cancel();
                    delete handle.mouseMoveHandler;
                }
                if (handle.mouseUpHandler) {
                    handle.mouseUpHandler.cancel();
                    delete handle.mouseUpHandler;
                }

                // Create the mouse event handlers
                var self = this;
                handle.mouseMoveHandler = new EventHandler(window, 'mousemove', function (e) {
                    self.onMouseMoved(handle, e);
                });
                handle.mouseUpHandler = new EventHandler(window, 'mouseup', function (e) {
                    self.onMouseUp(handle, e);
                });

                document.body.classList.add('disable-selection');
            };

            ResizableContainer.prototype.onMouseUp = function (handle) {
                handle.mouseMoveHandler.cancel();
                handle.mouseUpHandler.cancel();
                delete handle.mouseMoveHandler;
                delete handle.mouseUpHandler;

                document.body.classList.remove('disable-selection');
            };

            ResizableContainer.prototype._performDrag = function (handle, dx, dy) {
                var bounds = {};
                bounds.left = utils.getPixels(this.topLevelElement.style.marginLeft);
                bounds.top = utils.getPixels(this.topLevelElement.style.marginTop);
                bounds.width = this.topLevelElement.clientWidth;
                bounds.height = this.topLevelElement.clientHeight;

                if (handle.east) this._resizeEast(dx, bounds);
                if (handle.west) this._resizeWest(dx, bounds);
                if (handle.north) this._resizeNorth(dy, bounds);
                if (handle.south) this._resizeSouth(dy, bounds);
            };

            ResizableContainer.prototype._resizeWest = function (dx, bounds) {
                this._resizeContainer(dx, 0, -dx, 0, bounds);
            };

            ResizableContainer.prototype._resizeEast = function (dx, bounds) {
                this._resizeContainer(0, 0, dx, 0, bounds);
            };

            ResizableContainer.prototype._resizeNorth = function (dy, bounds) {
                this._resizeContainer(0, dy, 0, -dy, bounds);
            };

            ResizableContainer.prototype._resizeSouth = function (dy, bounds) {
                this._resizeContainer(0, 0, 0, dy, bounds);
            };

            ResizableContainer.prototype._resizeContainer = function (leftDelta, topDelta, widthDelta, heightDelta, bounds) {
                bounds.left += leftDelta;
                bounds.top += topDelta;
                bounds.width += widthDelta;
                bounds.height += heightDelta;

                var minWidth = 50;  // TODO: Move to external configuration
                var minHeight = 50;  // TODO: Move to external configuration
                bounds.width = Math.max(bounds.width, minWidth);
                bounds.height = Math.max(bounds.height, minHeight);

                this.topLevelElement.style.marginLeft = bounds.left + 'px';
                this.topLevelElement.style.marginTop = bounds.top + 'px';

                this.resize(bounds.width, bounds.height);
            };


            function ResizeHandle() {
                this.element = undefined;
                this.handleSize = 6;   // TODO: Get this from DOM
                this.cornerSize = 12;  // TODO: Get this from DOM
                this.east = false;
                this.west = false;
                this.north = false;
                this.south = false;
                this.corner = false;
            }

            ResizeHandle.prototype.adjustSize = function (container, clientWidth, clientHeight) {
                if (this.corner) {
                    if (this.west) this.element.style.left = '0px';
                    if (this.east) this.element.style.left = (clientWidth - this.cornerSize) + 'px';
                    if (this.north) this.element.style.top = '0px';
                    if (this.south) this.element.style.top = (clientHeight - this.cornerSize) + 'px';
                }
                else {
                    if (this.west) {
                        this.element.style.left = '0px';
                        this.element.style.top = this.cornerSize + 'px';
                    }
                    if (this.east) {
                        this.element.style.left = (clientWidth - this.handleSize) + 'px';
                        this.element.style.top = this.cornerSize + 'px';
                    }
                    if (this.north) {
                        this.element.style.left = this.cornerSize + 'px';
                        this.element.style.top = '0px';
                    }
                    if (this.south) {
                        this.element.style.left = this.cornerSize + 'px';
                        this.element.style.top = (clientHeight - this.handleSize) + 'px';
                    }

                    if (this.west || this.east) {
                        this.element.style.height = (clientHeight - this.cornerSize * 2) + 'px';
                    } else {
                        this.element.style.width = (clientWidth - this.cornerSize * 2) + 'px';
                    }
                }
            };

        }, {"../utils/EventHandler": 27, "../utils/Point": 28, "../utils/utils": 31}],
        12: [function (require, module, exports) {
            var PanelContainer = require('../containers/PanelContainer'),
                DraggableContainer = require('../decorators/DraggableContainer'),
                ResizableContainer = require('../decorators/ResizableContainer'),
                EventHandler = require('../utils/EventHandler'),
                utils = require('../utils/utils');

            function Dialog(panel, dockManager) {
                this.panel = panel;
                this.zIndexCounter = 100;
                this.dockManager = dockManager;
                this.eventListener = dockManager;
                this._initialize();
                this.dockManager.context.model.dialogs.push(this);
                this.position = dockManager.defaultDialogPosition;
                this.dockManager.notifyOnCreateDialog(this);
            }

            module.exports = Dialog;

            Dialog.prototype.saveState = function (x, y) {
                this.position = {x: x, y: y};
                this.dockManager.notifyOnChangeDialogPosition(this, x, y);
            };

            Dialog.fromElement = function (id, dockManager) {
                return new Dialog(new PanelContainer(document.getElementById(id), dockManager), dockManager);
            };

            Dialog.prototype._initialize = function () {
                this.panel.floatingDialog = this;
                this.elementDialog = document.createElement('div');
                this.elementDialog.appendChild(this.panel.elementPanel);
                this.draggable = new DraggableContainer(this, this.panel, this.elementDialog, this.panel.elementTitle);
                this.resizable = new ResizableContainer(this, this.draggable, this.draggable.topLevelElement);

                document.body.appendChild(this.elementDialog);
                this.elementDialog.classList.add('dialog-floating');
                this.elementDialog.classList.add('rounded-corner-top');
                this.panel.elementTitle.classList.add('rounded-corner-top');

                this.mouseDownHandler = new EventHandler(this.elementDialog, 'mousedown', this.onMouseDown.bind(this));
                this.resize(this.panel.elementPanel.clientWidth, this.panel.elementPanel.clientHeight);
                this.isHidden = false;
                this.bringToFront();
            };

            Dialog.prototype.setPosition = function (x, y) {
                this.position = {x: x, y: y};
                this.elementDialog.style.left = x + 'px';
                this.elementDialog.style.top = y + 'px';
                this.dockManager.notifyOnChangeDialogPosition(this, x, y);
            };

            Dialog.prototype.getPosition = function () {
                return {
                    left: this.position ? this.position.x : 0,
                    top: this.position ? this.position.y : 0
                };
            };

            Dialog.prototype.onMouseDown = function () {
                this.bringToFront();
            };

            Dialog.prototype.destroy = function () {
                if (this.mouseDownHandler) {
                    this.mouseDownHandler.cancel();
                    delete this.mouseDownHandler;
                }
                this.elementDialog.classList.remove('rounded-corner-top');
                this.panel.elementTitle.classList.remove('rounded-corner-top');
                utils.removeNode(this.elementDialog);
                this.draggable.removeDecorator();
                utils.removeNode(this.panel.elementPanel);
                this.dockManager.context.model.dialogs.remove(this);
                delete this.panel.floatingDialog;
            };

            Dialog.prototype.resize = function (width, height) {
                this.resizable.resize(width, height);
            };

            Dialog.prototype.setTitle = function (title) {
                this.panel.setTitle(title);
            };

            Dialog.prototype.setTitleIcon = function (iconName) {
                this.panel.setTitleIcon(iconName);
            };

            Dialog.prototype.bringToFront = function () {
                this.elementDialog.style.zIndex = this.zIndexCounter++;
            };

            Dialog.prototype.hide = function () {
                this.elementDialog.style.zIndex = 0;
                this.elementDialog.style.display = 'none';
                if (!this.isHidden) {
                    this.isHidden = true;
                    this.dockManager.notifyOnHideDialog(this);
                }
            };

            Dialog.prototype.show = function (h, w) {
                if(this.panel._cachedWidth == 0 && w == undefined){
                   w = 200
                }
                if(this.panel._cachedHeight == 0 && h == undefined){
                   h = 300
                }
                this.elementDialog.style.marginLeft = (parseInt($("#main").css("width")) - (w || this.panel._cachedWidth)) / 2 + "px";
                this.elementDialog.style.marginTop = "100px";
                this.elementDialog.style.zIndex = 1000;
                this.elementDialog.style.display = 'block';
                this.elementDialog.style.top = 0;
                this.elementDialog.style.left = 0;
                if (this.isHidden) {
                    this.isHidden = false;
                    this.dockManager.notifyOnShowDialog(this);
                }
                //this._floatingDialog.show(h,w)
                if (w && h) {
                    this.resizable.resize(w, h);
                }

            };

        }, {
            "../containers/PanelContainer": 7,
            "../decorators/DraggableContainer": 10,
            "../decorators/ResizableContainer": 11,
            "../utils/EventHandler": 27,
            "../utils/utils": 31
        }],
        13: [function (require, module, exports) {
            var DockNode = require('./DockNode'),
                HorizontalDockContainer = require('../containers/HorizontalDockContainer'),
                VerticalDockContainer = require('../containers/VerticalDockContainer'),
                FillDockContainer = require('../containers/FillDockContainer'),
                Rectangle = require('../utils/Rectangle'),
                utils = require('../utils/utils');

            function DockLayoutEngine(dockManager) {
                this.dockManager = dockManager;
            }

            module.exports = DockLayoutEngine;

            /** docks the [newNode] to the left of [referenceNode] */
            DockLayoutEngine.prototype.dockLeft = function (referenceNode, newNode) {
                this._performDock(referenceNode, newNode, 'horizontal', true);
            };

            /** docks the [newNode] to the right of [referenceNode] */
            DockLayoutEngine.prototype.dockRight = function (referenceNode, newNode) {
                this._performDock(referenceNode, newNode, 'horizontal', false);
            };

            /** docks the [newNode] to the top of [referenceNode] */
            DockLayoutEngine.prototype.dockUp = function (referenceNode, newNode) {
                this._performDock(referenceNode, newNode, 'vertical', true);
            };

            /** docks the [newNode] to the bottom of [referenceNode] */
            DockLayoutEngine.prototype.dockDown = function (referenceNode, newNode) {
                this._performDock(referenceNode, newNode, 'vertical', false);
            };

            /** docks the [newNode] by creating a new tab inside [referenceNode] */
            DockLayoutEngine.prototype.dockFill = function (referenceNode, newNode) {
                this._performDock(referenceNode, newNode, 'fill', false);
            };

            DockLayoutEngine.prototype.undock = function (node) {
                var parentNode = node.parent;
                if (!parentNode)
                    throw new Error('Cannot undock.  panel is not a leaf node');

                // Get the position of the node relative to it's siblings
                var siblingIndex = parentNode.children.indexOf(node);

                // Detach the node from the dock manager's tree hierarchy
                node.detachFromParent();

                // Fix the node's parent hierarchy
                if (parentNode.children.length < parentNode.container.minimumAllowedChildNodes) {
                    // If the child count falls below the minimum threshold, destroy the parent and merge
                    // the children with their grandparents
                    var grandParent = parentNode.parent;
                    for (var i = 0; i < parentNode.children.length; i++) {
                        var otherChild = parentNode.children[i];
                        if (grandParent) {
                            // parent node is not a root node
                            grandParent.addChildAfter(parentNode, otherChild);
                            parentNode.detachFromParent();
                            var width = parentNode.container.containerElement.clientWidth;
                            var height = parentNode.container.containerElement.clientHeight;
                            parentNode.container.destroy();

                            otherChild.container.resize(width, height);
                            grandParent.performLayout();
                        }
                        else {
                            // Parent is a root node.
                            // Make the other child the root node
                            parentNode.detachFromParent();
                            parentNode.container.destroy();
                            this.dockManager.setRootNode(otherChild);
                        }
                    }
                }
                else {
                    // the node to be removed has 2 or more other siblings. So it is safe to continue
                    // using the parent composite container.
                    parentNode.performLayout();

                    // Set the next sibling as the active child (e.g. for a Tab host, it would select it as the active tab)
                    if (parentNode.children.length > 0) {
                        var nextActiveSibling = parentNode.children[Math.max(0, siblingIndex - 1)];
                        parentNode.container.setActiveChild(nextActiveSibling.container);
                    }
                }
                this.dockManager.invalidate();

                this.dockManager.notifyOnUnDock(node);
            };

            DockLayoutEngine.prototype.reorderTabs = function (node, handle, state, index) {
                var N = node.children.length;
                var nodeIndexToDelete = state === 'left' ? index : index + 1;
                var indexes = Array.apply(null, {length: N}).map(Number.call, Number);
                var indexValue = indexes.splice(nodeIndexToDelete, 1)[0]; //remove element
                indexes.splice(state === 'left' ? index - 1 : index, 0, indexValue); //insert

                node.children = node.children.orderByIndexes(indexes); //apply
                node.container.tabHost.performTabsLayout(indexes);
                this.dockManager.notifyOnTabsReorder(node);
            };

            DockLayoutEngine.prototype._performDock = function (referenceNode, newNode, direction, insertBeforeReference) {
                if (referenceNode.parent && referenceNode.parent.container.containerType === 'fill')
                    referenceNode = referenceNode.parent;

                if (direction === 'fill' && referenceNode.container.containerType === 'fill') {
                    referenceNode.addChild(newNode);
                    referenceNode.performLayout();
                    referenceNode.container.setActiveChild(newNode.container);
                    this.dockManager.invalidate();
                    this.dockManager.notifyOnDock(newNode);
                    return;
                }

                // Check if reference node is root node
                var model = this.dockManager.context.model,
                    compositeContainer,
                    compositeNode,
                    referenceParent;

                if (referenceNode === model.rootNode) {
                    compositeContainer = this._createDockContainer(direction, newNode, referenceNode);
                    compositeNode = new DockNode(compositeContainer);

                    if (insertBeforeReference) {
                        compositeNode.addChild(newNode);
                        compositeNode.addChild(referenceNode);
                    }
                    else {
                        compositeNode.addChild(referenceNode);
                        compositeNode.addChild(newNode);
                    }

                    // Attach the root node to the dock manager's DOM
                    this.dockManager.setRootNode(compositeNode);
                    this.dockManager.rebuildLayout(this.dockManager.context.model.rootNode);
                    compositeNode.container.setActiveChild(newNode.container);
                    this.dockManager.invalidate();
                    this.dockManager.notifyOnDock(newNode);
                    return;
                }

                if (referenceNode.parent.container.containerType !== direction) {
                    referenceParent = referenceNode.parent;

                    // Get the dimensions of the reference node, for resizing later on
                    var referenceNodeWidth = referenceNode.container.containerElement.clientWidth;
                    var referenceNodeHeight = referenceNode.container.containerElement.clientHeight;

                    // Get the dimensions of the reference node, for resizing later on
                    var referenceNodeParentWidth = referenceParent.container.containerElement.clientWidth;
                    var referenceNodeParentHeight = referenceParent.container.containerElement.clientHeight;

                    // Replace the reference node with a new composite node with the reference and new node as it's children
                    compositeContainer = this._createDockContainer(direction, newNode, referenceNode);
                    compositeNode = new DockNode(compositeContainer);

                    referenceParent.addChildAfter(referenceNode, compositeNode);
                    referenceNode.detachFromParent();
                    utils.removeNode(referenceNode.container.containerElement);

                    if (insertBeforeReference) {
                        compositeNode.addChild(newNode);
                        compositeNode.addChild(referenceNode);
                    }
                    else {
                        compositeNode.addChild(referenceNode);
                        compositeNode.addChild(newNode);
                    }

                    referenceParent.performLayout();
                    compositeNode.performLayout();

                    compositeNode.container.setActiveChild(newNode.container);
                    compositeNode.container.resize(referenceNodeWidth, referenceNodeHeight);
                    referenceParent.container.resize(referenceNodeParentWidth, referenceNodeParentHeight);
                }
                else {
                    // Add as a sibling, since the parent of the reference node is of the right composite type
                    referenceParent = referenceNode.parent;
                    if (insertBeforeReference)
                        referenceParent.addChildBefore(referenceNode, newNode);
                    else
                        referenceParent.addChildAfter(referenceNode, newNode);
                    referenceParent.performLayout();
                    referenceParent.container.setActiveChild(newNode.container);
                }

                // force resize the panel
                var containerWidth = newNode.container.containerElement.clientWidth;
                var containerHeight = newNode.container.containerElement.clientHeight;
                newNode.container.resize(containerWidth, containerHeight);

                this.dockManager.invalidate();
                this.dockManager.notifyOnDock(newNode);
            };

            DockLayoutEngine.prototype._forceResizeCompositeContainer = function (container) {
                var width = container.containerElement.clientWidth;
                var height = container.containerElement.clientHeight;
                container.resize(width, height);
            };

            DockLayoutEngine.prototype._createDockContainer = function (containerType, newNode, referenceNode) {
                if (containerType === 'horizontal')
                    return new HorizontalDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
                if (containerType === 'vertical')
                    return new VerticalDockContainer(this.dockManager, [newNode.container, referenceNode.container]);
                if (containerType === 'fill')
                    return new FillDockContainer(this.dockManager);
                throw new Error('Failed to create dock container of type: ' + containerType);
            };


            /**
             * Gets the bounds of the new node if it were to dock with the specified configuration
             * The state is not modified in this function.  It is used for showing a preview of where
             * the panel would be docked when hovered over a dock wheel button
             */
            DockLayoutEngine.prototype.getDockBounds = function (referenceNode, containerToDock, direction, insertBeforeReference) {
                var compositeNode; // The node that contains the splitter / fill node
                var childCount;
                var childPosition;
                var bounds;

                if (direction === 'fill') {
                    // Since this is a fill operation, the highlight bounds is the same as the reference node
                    // TODO: Create a tab handle highlight to show that it's going to be docked in a tab
                    var targetElement = referenceNode.container.containerElement;
                    bounds = new Rectangle();
                    bounds.x = targetElement.offsetLeft;
                    bounds.y = targetElement.offsetTop;
                    bounds.width = targetElement.clientWidth;
                    bounds.height = targetElement.clientHeight;
                    return bounds;
                }

                if (referenceNode.parent && referenceNode.parent.container.containerType === 'fill')
                // Ignore the fill container's child and move one level up
                    referenceNode = referenceNode.parent;

                // Flag to indicate of the renference node was replaced with a new composite node with 2 children
                var hierarchyModified = false;
                if (referenceNode.parent && referenceNode.parent.container.containerType === direction) {
                    // The parent already is of the desired composite type.  Will be inserted as sibling to the reference node
                    compositeNode = referenceNode.parent;
                    childCount = compositeNode.children.length;
                    childPosition = compositeNode.children.indexOf(referenceNode) + (insertBeforeReference ? 0 : 1);
                } else {
                    // The reference node will be replaced with a new composite node of the desired type with 2 children
                    compositeNode = referenceNode;
                    childCount = 1;   // The newly inserted composite node will contain the reference node
                    childPosition = (insertBeforeReference ? 0 : 1);
                    hierarchyModified = true;
                }

                var splitBarSize = 5;  // TODO: Get from DOM
                var targetPanelSize = 0;
                var targetPanelStart = 0;
                if (direction === 'vertical' || direction === 'horizontal') {
                    // Existing size of the composite container (without the splitter bars).
                    // This will also be the final size of the composite (splitter / fill)
                    // container after the new panel has been docked
                    var compositeSize = this._getVaringDimension(compositeNode.container, direction) - (childCount - 1) * splitBarSize;

                    // size of the newly added panel
                    var newPanelOriginalSize = this._getVaringDimension(containerToDock, direction);
                    var scaleMultiplier = compositeSize / (compositeSize + newPanelOriginalSize);

                    // Size of the panel after it has been docked and scaled
                    targetPanelSize = newPanelOriginalSize * scaleMultiplier;
                    if (hierarchyModified)
                        targetPanelStart = insertBeforeReference ? 0 : compositeSize * scaleMultiplier;
                    else {
                        for (var i = 0; i < childPosition; i++)
                            targetPanelStart += this._getVaringDimension(compositeNode.children[i].container, direction);
                        targetPanelStart *= scaleMultiplier;
                    }
                }

                bounds = new Rectangle();
                if (direction === 'vertical') {
                    bounds.x = compositeNode.container.containerElement.offsetLeft;
                    bounds.y = compositeNode.container.containerElement.offsetTop + targetPanelStart;
                    bounds.width = compositeNode.container.width;
                    bounds.height = targetPanelSize;
                } else if (direction === 'horizontal') {
                    bounds.x = compositeNode.container.containerElement.offsetLeft + targetPanelStart;
                    bounds.y = compositeNode.container.containerElement.offsetTop;
                    bounds.width = targetPanelSize;
                    bounds.height = compositeNode.container.height;
                }

                return bounds;
            };

            DockLayoutEngine.prototype._getVaringDimension = function (container, direction) {
                if (direction === 'vertical')
                    return container.height;
                if (direction === 'horizontal')
                    return container.width;
                return 0;
            };

        }, {
            "../containers/FillDockContainer": 5,
            "../containers/HorizontalDockContainer": 6,
            "../containers/VerticalDockContainer": 9,
            "../utils/Rectangle": 29,
            "../utils/utils": 31,
            "./DockNode": 17
        }],
        14: [function (require, module, exports) {
            var DockManagerContext = require('./DockManagerContext'),
                DockNode = require('./DockNode'),
                DockWheel = require('./DockWheel'),
                DockLayoutEngine = require('./DockLayoutEngine'),
                Dialog = require('../dialog/Dialog'),
                DockGraphSerializer = require('../serialization/DockGraphSerializer'),
                DockGraphDeserializer = require('../serialization/DockGraphDeserializer'),
                EventHandler = require('../utils/EventHandler'),
                Point = require('../utils/Point'),
                utils = require('../utils/utils');

            /**
             * Dock manager manages all the dock panels in a hierarchy, similar to visual studio.
             * It owns a Html Div element inside which all panels are docked
             * Initially the document manager takes up the central space and acts as the root node
             */

            function DockManager(element) {
                if (element === undefined)
                    throw new Error('Invalid Dock Manager element provided');

                this.element = element;
                this.context = this.dockWheel = this.layoutEngine = this.mouseMoveHandler = undefined;
                this.layoutEventListeners = [];

                this.defaultDialogPosition = new Point(0, 0);
            }

            module.exports = DockManager;

            DockManager.prototype.initialize = function () {
                this.context = new DockManagerContext(this);
                var documentNode = new DockNode(this.context.documentManagerView);
                this.context.model.rootNode = documentNode;
                this.context.model.documentManagerNode = documentNode;
                this.context.model.dialogs = [];
                this.setRootNode(this.context.model.rootNode);
                // Resize the layout
                this.resize(this.element.clientWidth, this.element.clientHeight);
                this.dockWheel = new DockWheel(this);
                this.layoutEngine = new DockLayoutEngine(this);
                this._undockEnabled = true;
                this.rebuildLayout(this.context.model.rootNode);
            };

            DockManager.prototype.checkXBounds = function (container, currentMousePosition, previousMousePosition) {
                var dx = Math.floor(currentMousePosition.x - previousMousePosition.x);
                var leftBounds = currentMousePosition.x + dx < 0 || (container.offsetLeft + container.offsetWidth + dx - 40 ) < 0;
                var rightBounds =
                    currentMousePosition.x + dx > this.element.offsetWidth ||
                    (container.offsetLeft + dx + 40) > this.element.offsetWidth;

                if (leftBounds || rightBounds) {
                    previousMousePosition.x = currentMousePosition.x;
                    dx = 0;
                }

                return dx;
            };

            DockManager.prototype.checkYBounds = function (container, currentMousePosition, previousMousePosition) {
                var dy = Math.floor(currentMousePosition.y - previousMousePosition.y);
                var topBounds = container.offsetTop + dy < this.element.offsetTop;
                var bottomBounds =
                    currentMousePosition.y + dy > this.element.offsetHeight ||
                    (container.offsetTop + dy > this.element.offsetHeight + this.element.offsetTop - 20);

                if (topBounds || bottomBounds) {
                    previousMousePosition.y = currentMousePosition.y;
                    dy = 0;
                }

                return dy;
            };

            DockManager.prototype.rebuildLayout = function (node) {
                var self = this;
                node.children.forEach(function (child) {
                    self.rebuildLayout(child);
                });
                node.performLayout();

            };

            DockManager.prototype.invalidate = function () {
                this.resize(this.element.clientWidth, this.element.clientHeight);
            };

            DockManager.prototype.resize = function (width, height) {
                this.element.style.width = width + 'px';
                this.element.style.height = height + 'px';
                this.context.model.rootNode.container.resize(width, height);
            };

            /**
             * Reset the dock model . This happens when the state is loaded from json
             */
            DockManager.prototype.setModel = function (model) {
                utils.removeNode(this.context.documentManagerView.containerElement);
                this.context.model = model;
                this.setRootNode(model.rootNode);

                this.rebuildLayout(model.rootNode);
                this.loadResize(model.rootNode);
                // this.invalidate();
            };

            DockManager.prototype.loadResize = function (node) {
                var self = this;
                node.children.reverse().forEach(function (child) {
                    self.loadResize(child);
                    node.container.setActiveChild(child.container);
                });
                node.children.reverse();
                node.container.resize(node.container.state.width, node.container.state.height);

                // node.performLayout();
            };

            DockManager.prototype.setRootNode = function (node) {
                // if (this.context.model.rootNode)
                // {
                //     // detach it from the dock manager's base element
                //     context.model.rootNode.detachFromParent();
                // }

                // Attach the new node to the dock manager's base element and set as root node
                node.detachFromParent();
                this.context.model.rootNode = node;
                this.element.appendChild(node.container.containerElement);
            };

            var showWheel_time;
            DockManager.prototype.onDialogDragStarted = function (sender, e) {
                this.dockWheel.activeNode = this._findNodeOnPoint(e.pageX, e.pageY);
                this.dockWheel.activeDialog = sender;
                var that = this;
                showWheel_time = setTimeout(function () {
                    that.dockWheel.showWheel();
                }, 300);
                if (this.mouseMoveHandler) {
                    this.mouseMoveHandler.cancel();
                    delete this.mouseMoveHandler;
                }
                this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMoved.bind(this));
            };

            DockManager.prototype.onDialogDragEnded = function (sender) {
                clearTimeout(showWheel_time);
                if (this.mouseMoveHandler) {
                    this.mouseMoveHandler.cancel();
                    delete this.mouseMoveHandler;
                }
                this.dockWheel.onDialogDropped(sender);
                this.dockWheel.hideWheel();
                delete this.dockWheel.activeDialog;
                //TODO: not so good
                sender.saveState(sender.elementDialog.offsetLeft, sender.elementDialog.offsetTop);
            };

            DockManager.prototype.onMouseMoved = function (e) {
                this.dockWheel.activeNode = this._findNodeOnPoint(e.clientX, e.clientY);
            };

            /**
             * Perform a DFS on the dock model's tree to find the
             * deepest level panel (i.e. the top-most non-overlapping panel)
             * that is under the mouse cursor
             * Retuns null if no node is found under this point
             */
            DockManager.prototype._findNodeOnPoint = function (x, y) {
                var stack = [];
                stack.push(this.context.model.rootNode);
                var bestMatch;

                while (stack.length > 0) {
                    var topNode = stack.pop();

                    if (utils.isPointInsideNode(x, y, topNode)) {
                        // This node contains the point.
                        bestMatch = topNode;

                        // Keep looking future down
                        [].push.apply(stack, topNode.children);
                    }
                }
                return bestMatch;
            };

            /** Dock the [dialog] to the left of the [referenceNode] node */
            DockManager.prototype.dockDialogLeft = function (referenceNode, dialog) {
                return this._requestDockDialog(referenceNode, dialog, this.layoutEngine.dockLeft.bind(this.layoutEngine));
            };

            /** Dock the [dialog] to the right of the [referenceNode] node */
            DockManager.prototype.dockDialogRight = function (referenceNode, dialog) {
                return this._requestDockDialog(referenceNode, dialog, this.layoutEngine.dockRight.bind(this.layoutEngine));
            };

            /** Dock the [dialog] above the [referenceNode] node */
            DockManager.prototype.dockDialogUp = function (referenceNode, dialog) {
                return this._requestDockDialog(referenceNode, dialog, this.layoutEngine.dockUp.bind(this.layoutEngine));
            };

            /** Dock the [dialog] below the [referenceNode] node */
            DockManager.prototype.dockDialogDown = function (referenceNode, dialog) {
                return this._requestDockDialog(referenceNode, dialog, this.layoutEngine.dockDown.bind(this.layoutEngine));
            };

            /** Dock the [dialog] as a tab inside the [referenceNode] node */
            DockManager.prototype.dockDialogFill = function (referenceNode, dialog) {
                return this._requestDockDialog(referenceNode, dialog, this.layoutEngine.dockFill.bind(this.layoutEngine));
            };

            /** Dock the [container] to the left of the [referenceNode] node */
            DockManager.prototype.dockLeft = function (referenceNode, container, ratio) {
                return this._requestDockContainer(referenceNode, container, this.layoutEngine.dockLeft.bind(this.layoutEngine), ratio);
            };

            /** Dock the [container] to the right of the [referenceNode] node */
            DockManager.prototype.dockRight = function (referenceNode, container, ratio) {
                return this._requestDockContainer(referenceNode, container, this.layoutEngine.dockRight.bind(this.layoutEngine), ratio);
            };

            /** Dock the [container] above the [referenceNode] node */
            DockManager.prototype.dockUp = function (referenceNode, container, ratio) {
                return this._requestDockContainer(referenceNode, container, this.layoutEngine.dockUp.bind(this.layoutEngine), ratio);
            };

            /** Dock the [container] below the [referenceNode] node */
            DockManager.prototype.dockDown = function (referenceNode, container, ratio) {
                return this._requestDockContainer(referenceNode, container, this.layoutEngine.dockDown.bind(this.layoutEngine), ratio);
            };

            /** Dock the [container] as a tab inside the [referenceNode] node */
            DockManager.prototype.dockFill = function (referenceNode, container) {
                return this._requestDockContainer(referenceNode, container, this.layoutEngine.dockFill.bind(this.layoutEngine));
            };
            DockManager.prototype.floatDialog = function (container, x, y) {
                var panel = container;
                utils.removeNode(panel.elementPanel);
                panel.isDialog = true;
                var dialog = new Dialog(panel, this);
                dialog.setPosition(x, y);
                return dialog;
            };

            DockManager.prototype._requestDockDialog = function (referenceNode, dialog, layoutDockFunction) {
                // Get the active dialog that was dragged on to the dock wheel
                var panel = dialog.panel;
                var newNode = new DockNode(panel);
                panel.prepareForDocking();
                dialog.destroy();
                layoutDockFunction(referenceNode, newNode);
                // this.invalidate();
                return newNode;
            };

            DockManager.prototype._requestDockContainer = function (referenceNode, container, layoutDockFunction, ratio) {
                // Get the active dialog that was dragged on to the dock wheel
                var newNode = new DockNode(container);
                if (container.containerType === 'panel') {
                    var panel = container;
                    panel.prepareForDocking();
                    utils.removeNode(panel.elementPanel);
                }
                layoutDockFunction(referenceNode, newNode);

                if (ratio && newNode.parent &&
                    (newNode.parent.container.containerType === 'vertical' || newNode.parent.container.containerType === 'horizontal')) {
                    var splitter = newNode.parent.container;
                    splitter.setContainerRatio(container, ratio);
                }

                this.rebuildLayout(this.context.model.rootNode);
                this.invalidate();
                return newNode;
            };

            DockManager.prototype._requestTabReorder = function (container, e) {
                var node = this._findNodeFromContainer(container);
                this.layoutEngine.reorderTabs(node, e.handle, e.state, e.index);
            };

            /**
             * Undocks a panel and converts it into a floating dialog window
             * It is assumed that only leaf nodes (panels) can be undocked
             */
            DockManager.prototype.requestUndockToDialog = function (container, event, dragOffset) {
                var node = this._findNodeFromContainer(container);


                this.layoutEngine.undock(node);

                // Create a new dialog window for the undocked panel
                var dialog = new Dialog(node.container, this);


                if (event !== undefined) {
                    // Adjust the relative position
                    var dialogWidth = dialog.elementDialog.clientWidth;
                    if (dragOffset.x > dialogWidth)
                        dragOffset.x = 0.75 * dialogWidth;
                    dialog.setPosition(
                        event.clientX - dragOffset.x,
                        event.clientY - dragOffset.y);
                    dialog.draggable.onMouseDown(event);
                }



                return dialog;
            };

            /** Undocks a panel and converts it into a floating dialog window
             * It is assumed that only leaf nodes (panels) can be undocked
             */
            DockManager.prototype.requestUndock = function (container) {
                var node = this._findNodeFromContainer(container);
                this.layoutEngine.undock(node);
            };

            /**
             * Removes a dock container from the dock layout hierarcy
             * Returns the node that was removed from the dock tree
             */
            DockManager.prototype.requestRemove = function (container) {
                var node = this._findNodeFromContainer(container);
                var parent = node.parent;
                node.detachFromParent();
                if (parent)
                    this.rebuildLayout(parent);
                return node;
            };

            /** Finds the node that owns the specified [container] */
            DockManager.prototype._findNodeFromContainer = function (container) {
                //this.context.model.rootNode.debugDumpTree();

                var stack = [];
                stack.push(this.context.model.rootNode);

                while (stack.length > 0) {
                    var topNode = stack.pop();

                    if (topNode.container === container)
                        return topNode;
                    [].push.apply(stack, topNode.children);
                }

                throw new Error('Cannot find dock node belonging to the element');
            };

            DockManager.prototype.findNodeFromContainerElement = function (containerElm) {
                //this.context.model.rootNode.debugDumpTree();

                var stack = [];
                stack.push(this.context.model.rootNode);

                while (stack.length > 0) {
                    var topNode = stack.pop();

                    if (topNode.container.containerElement === containerElm)
                        return topNode;
                    [].push.apply(stack, topNode.children);
                }

                throw new Error('Cannot find dock node belonging to the element');
            };

            DockManager.prototype.addLayoutListener = function (listener) {
                this.layoutEventListeners.push(listener);
            };

            DockManager.prototype.removeLayoutListener = function (listener) {
                this.layoutEventListeners.splice(this.layoutEventListeners.indexOf(listener), 1);
            };

            DockManager.prototype.suspendLayout = function () {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onSuspendLayout) listener.onSuspendLayout(self);
                });
            };

            DockManager.prototype.resumeLayout = function (panel) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onResumeLayout) listener.onResumeLayout(self, panel);
                });
            };

            DockManager.prototype.notifyOnDock = function (dockNode) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onDock) {
                        listener.onDock(self, dockNode);
                    }
                });
            };

            DockManager.prototype.notifyOnTabsReorder = function (dockNode) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onTabsReorder) {
                        listener.onTabsReorder(self, dockNode);
                    }
                });
            };


            DockManager.prototype.notifyOnUnDock = function (dockNode) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onUndock) {
                        listener.onUndock(self, dockNode);
                    }
                });
            };

            DockManager.prototype.notifyOnClosePanel = function (panel) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onClosePanel) {
                        listener.onClosePanel(self, panel);
                    }
                });
            };


            DockManager.prototype.notifyOnCreateDialog = function (dialog) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onCreateDialog) {
                        listener.onCreateDialog(self, dialog);
                    }
                });
            };

            DockManager.prototype.notifyOnHideDialog = function (dialog) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onHideDialog) {
                        listener.onHideDialog(self, dialog);
                    }
                });
            };


            DockManager.prototype.notifyOnShowDialog = function (dialog) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onShowDialog) {
                        listener.onShowDialog(self, dialog);
                    }
                });
            };


            DockManager.prototype.notifyOnChangeDialogPosition = function (dialog, x, y) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onChangeDialogPosition) {
                        listener.onChangeDialogPosition(self, dialog, x, y);
                    }
                });
            };

            DockManager.prototype.notifyOnTabChange = function (tabpage) {
                var self = this;
                this.layoutEventListeners.forEach(function (listener) {
                    if (listener.onTabChanged) {
                        listener.onTabChanged(self, tabpage);
                    }
                });
            };

            DockManager.prototype.saveState = function () {
                var serializer = new DockGraphSerializer();
                return serializer.serialize(this.context.model);
            };

            DockManager.prototype.loadState = function (json) {
                var deserializer = new DockGraphDeserializer(this);
                this.context.model = deserializer.deserialize(json);
                this.setModel(this.context.model);
            };

            DockManager.prototype.getPanels = function () {
                var panels = [];
                //all visible nodes
                this._allPanels(this.context.model.rootNode, panels);

                //all visible or not dialogs
                this.context.model.dialogs.forEach(function (dialog) {
                    //TODO: check visible
                    panels.push(dialog.panel);
                });

                return panels;
            };

            DockManager.prototype.undockEnabled = function (state) {
                this._undockEnabled = state;
                this.getPanels().forEach(function (panel) {
                    panel.canUndock(state);
                });
            };

            DockManager.prototype.lockDockState = function (state) {
                this.undockEnabled(!state); // false - not enabled
                this.hideCloseButton(state); //true - hide
            };

            DockManager.prototype.hideCloseButton = function (state) {
                this.getPanels().forEach(function (panel) {
                    panel.hideCloseButton(state);
                });
            };

            DockManager.prototype.updatePanels = function (ids) {
                var panels = [];
                //all visible nodes
                this._allPanels(this.context.model.rootNode, panels);
                //only remove
                panels.forEach(function (panel) {
                    if (!ids.contains(panel.elementContent.id)) {
                        panel.close();
                    }
                });

                this.context.model.dialogs.forEach(function (dialog) {
                    if (ids.contains(dialog.panel.elementContent.id)) {
                        dialog.show();
                    }
                    else {
                        dialog.hide();
                    }
                });
                return panels;
            };

            DockManager.prototype.getVisiblePanels = function () {
                var panels = [];
                //all visible nodes
                this._allPanels(this.context.model.rootNode, panels);

                //all visible
                this.context.model.dialogs.forEach(function (dialog) {
                    if (!dialog.isHidden) {
                        panels.push(dialog.panel);
                    }
                });

                return panels;
            };

            DockManager.prototype._allPanels = function (node, panels) {
                var self = this;
                node.children.forEach(function (child) {
                    self._allPanels(child, panels);
                });
                if (node.container.containerType === 'panel') {
                    panels.push(node.container);
                }
            };


//typedef void LayoutEngineDockFunction(DockNode referenceNode, DockNode newNode);

            /**
             * The Dock Manager notifies the listeners of layout changes so client containers that have
             * costly layout structures can detach and reattach themself to avoid reflow
             */
//abstract class LayoutEventListener {
//void onSuspendLayout(DockManager dockManager);
//void onResumeLayout(DockManager dockManager);
//}

        }, {
            "../dialog/Dialog": 12,
            "../serialization/DockGraphDeserializer": 20,
            "../serialization/DockGraphSerializer": 21,
            "../utils/EventHandler": 27,
            "../utils/Point": 28,
            "../utils/utils": 31,
            "./DockLayoutEngine": 13,
            "./DockManagerContext": 15,
            "./DockNode": 17,
            "./DockWheel": 18
        }],
        15: [function (require, module, exports) {
            var DockModel = require('./DockModel'),
                DocumentManagerContainer = require('../containers/DocumentManagerContainer');

            function DockManagerContext(dockManager) {
                this.dockManager = dockManager;
                this.model = new DockModel();
                this.documentManagerView = new DocumentManagerContainer(this.dockManager);
            }

            module.exports = DockManagerContext;

        }, {"../containers/DocumentManagerContainer": 3, "./DockModel": 16}],
        16: [function (require, module, exports) {
            /**
             * The Dock Model contains the tree hierarchy that represents the state of the
             * panel placement within the dock manager.
             */
            function DockModel() {
                this.rootNode = this.documentManagerNode = undefined;
            }

            module.exports = DockModel;

        }, {}],
        17: [function (require, module, exports) {
            function DockNode(container) {
                /** The dock container represented by this node */
                this.container = container;
                this.children = [];
            }

            module.exports = DockNode;

            DockNode.prototype.detachFromParent = function () {
                if (this.parent) {
                    this.parent.removeChild(this);
                    delete this.parent;
                }
            };

            DockNode.prototype.removeChild = function (childNode) {
                var index = this.children.indexOf(childNode);
                if (index >= 0)
                    this.children.splice(index, 1);
            };

            DockNode.prototype.addChild = function (childNode) {
                childNode.detachFromParent();
                childNode.parent = this;
                this.children.push(childNode);
            };

            DockNode.prototype.addChildBefore = function (referenceNode, childNode) {
                this._addChildWithDirection(referenceNode, childNode, true);
            };

            DockNode.prototype.addChildAfter = function (referenceNode, childNode) {
                this._addChildWithDirection(referenceNode, childNode, false);
            };

            DockNode.prototype._addChildWithDirection = function (referenceNode, childNode, before) {
                // Detach this node from it's parent first
                childNode.detachFromParent();
                childNode.parent = this;

                var referenceIndex = this.children.indexOf(referenceNode);
                var preList = this.children.slice(0, referenceIndex);
                var postList = this.children.slice(referenceIndex + 1, this.children.length);

                this.children = preList.slice(0);
                if (before) {
                    this.children.push(childNode);
                    this.children.push(referenceNode);
                }
                else {
                    this.children.push(referenceNode);
                    this.children.push(childNode);
                }
                Array.prototype.push.apply(this.children, postList);
            };

            DockNode.prototype.performLayout = function () {
                var childContainers = this.children.map(function (childNode) {
                    return childNode.container;
                });
                this.container.performLayout(childContainers);
            };

            DockNode.prototype.debugDumpTree = function (indent) {
                if (indent === undefined)
                    indent = 0;

                var message = this.container.name;
                for (var i = 0; i < indent; i++)
                    message = '\t' + message;

                var parentType = this.parent === undefined ? 'null' : this.parent.container.containerType;
                console.log('>>' + message + ' [' + parentType + ']');

                this.children.forEach(function (childNode) {
                    childNode.debugDumpTree(indent + 1);
                });
            };

        }, {}],
        18: [function (require, module, exports) {
            var DockWheelItem = require('./DockWheelItem'),
                utils = require('../utils/utils');

            /**
             * Manages the dock overlay buttons that are displayed over the dock manager
             */
            function DockWheel(dockManager) {
                this.dockManager = dockManager;
                this.elementMainWheel = document.createElement('div');    // Contains the main wheel's 5 dock buttons
                this.elementSideWheel = document.createElement('div');    // Contains the 4 buttons on the side
                this.wheelItems = {};
                var wheelTypes = [
                    'left', 'right', 'top', 'down', 'fill',     // Main dock wheel buttons
                    'left-s', 'right-s', 'top-s', 'down-s'      // Buttons on the extreme 4 sides
                ];
                var self = this;
                wheelTypes.forEach(function (wheelType) {
                    self.wheelItems[wheelType] = new DockWheelItem(self, wheelType);
                    if (wheelType.substr(-2, 2) === '-s')
                    // Side button
                        self.elementSideWheel.appendChild(self.wheelItems[wheelType].element);
                    else
                    // Main dock wheel button
                        self.elementMainWheel.appendChild(self.wheelItems[wheelType].element);
                });

                var zIndex = 100000;
                this.elementMainWheel.classList.add('dock-wheel-base');
                this.elementSideWheel.classList.add('dock-wheel-base');
                this.elementMainWheel.style.zIndex = zIndex + 1;
                this.elementSideWheel.style.zIndex = zIndex;
                this.elementPanelPreview = document.createElement('div');
                this.elementPanelPreview.classList.add('dock-wheel-panel-preview');
                this.elementPanelPreview.style.zIndex = zIndex - 1;
                this.activeDialog = undefined;  // The dialog being dragged, when the wheel is visible
                this._activeNode = undefined;
                this._visible = false;
            }

            module.exports = DockWheel;

            /** The node over which the dock wheel is being displayed on */
            Object.defineProperty(DockWheel.prototype, 'activeNode', {
                get: function () {
                    return this._activeNode;
                },
                set: function (value) {
                    var previousValue = this._activeNode;
                    this._activeNode = value;

                    if (previousValue !== this._activeNode) {
                        // The active node has been changed.
                        // Reattach the wheel to the new node's element and show it again
                        if (this._visible)
                            this.showWheel();
                    }
                }
            });

            DockWheel.prototype.showWheel = function () {
                this._visible = true;
                if (!this.activeNode) {
                    // No active node selected. make sure the wheel is invisible
                    utils.removeNode(this.elementMainWheel);
                    utils.removeNode(this.elementSideWheel);
                    return;
                }
                var element = this.activeNode.container.containerElement;
                var containerWidth = element.clientWidth;
                var containerHeight = element.clientHeight;
                var baseX = Math.floor(containerWidth / 2) + element.offsetLeft;
                var baseY = Math.floor(containerHeight / 2) + element.offsetTop;
                this.elementMainWheel.style.left = baseX + 'px';
                this.elementMainWheel.style.top = baseY + 'px';

                // The positioning of the main dock wheel buttons is done automatically through CSS
                // Dynamically calculate the positions of the buttons on the extreme sides of the dock manager
                var sideMargin = 20;
                var dockManagerWidth = this.dockManager.element.clientWidth;
                var dockManagerHeight = this.dockManager.element.clientHeight;
                // var dockManagerOffsetX = this.dockManager.element.offsetLeft;
                // var dockManagerOffsetY = this.dockManager.element.offsetTop;

                utils.removeNode(this.elementMainWheel);
                utils.removeNode(this.elementSideWheel);
                element.appendChild(this.elementMainWheel);
                this.dockManager.element.appendChild(this.elementSideWheel);

                this._setWheelButtonPosition('left-s', sideMargin, -dockManagerHeight / 2);
                this._setWheelButtonPosition('right-s', dockManagerWidth - sideMargin * 2, -dockManagerHeight / 2);
                this._setWheelButtonPosition('top-s', dockManagerWidth / 2, -dockManagerHeight + sideMargin);
                this._setWheelButtonPosition('down-s', dockManagerWidth / 2, -sideMargin);
            };

            DockWheel.prototype._setWheelButtonPosition = function (wheelId, left, top) {
                var item = this.wheelItems[wheelId];
                var itemHalfWidth = item.element.clientWidth / 2;
                var itemHalfHeight = item.element.clientHeight / 2;

                var x = Math.floor(left - itemHalfWidth);
                var y = Math.floor(top - itemHalfHeight);
//    item.element.style.left = '${x}px';
//    item.element.style.top = '${y}px';
                item.element.style.marginLeft = x + 'px';
                item.element.style.marginTop = y + 'px';
            };

            DockWheel.prototype.hideWheel = function () {
                this._visible = false;
                this.activeNode = undefined;
                utils.removeNode(this.elementMainWheel);
                utils.removeNode(this.elementSideWheel);
                utils.removeNode(this.elementPanelPreview);

                // deactivate all wheels
                for (var wheelType in this.wheelItems)
                    this.wheelItems[wheelType].active = false;
            };

            DockWheel.prototype.onMouseOver = function (wheelItem) {
                if (!this.activeDialog)
                    return;

                // Display the preview panel to show where the panel would be docked
                var rootNode = this.dockManager.context.model.rootNode;
                var bounds;
                if (wheelItem.id === 'top') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(this.activeNode, this.activeDialog.panel, 'vertical', true);
                } else if (wheelItem.id === 'down') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(this.activeNode, this.activeDialog.panel, 'vertical', false);
                } else if (wheelItem.id === 'left') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(this.activeNode, this.activeDialog.panel, 'horizontal', true);
                } else if (wheelItem.id === 'right') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(this.activeNode, this.activeDialog.panel, 'horizontal', false);
                } else if (wheelItem.id === 'fill') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(this.activeNode, this.activeDialog.panel, 'fill', false);
                } else if (wheelItem.id === 'top-s') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(rootNode, this.activeDialog.panel, 'vertical', true);
                } else if (wheelItem.id === 'down-s') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(rootNode, this.activeDialog.panel, 'vertical', false);
                } else if (wheelItem.id === 'left-s') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(rootNode, this.activeDialog.panel, 'horizontal', true);
                } else if (wheelItem.id === 'right-s') {
                    bounds = this.dockManager.layoutEngine.getDockBounds(rootNode, this.activeDialog.panel, 'horizontal', false);
                }

                if (bounds) {
                    this.dockManager.element.appendChild(this.elementPanelPreview);
                    this.elementPanelPreview.style.left = Math.round(bounds.x) + 'px';
                    this.elementPanelPreview.style.top = Math.round(bounds.y) + 'px';
                    this.elementPanelPreview.style.width = Math.round(bounds.width) + 'px';
                    this.elementPanelPreview.style.height = Math.round(bounds.height) + 'px';
                }
            };

            DockWheel.prototype.onMouseOut = function () {
                utils.removeNode(this.elementPanelPreview);
            };

            /**
             * Called if the dialog is dropped in a dock panel.
             * The dialog might not necessarily be dropped in one of the dock wheel buttons,
             * in which case the request will be ignored
             */
            DockWheel.prototype.onDialogDropped = function (dialog) {
                // Check if the dialog was dropped in one of the wheel items
                var wheelItem = this._getActiveWheelItem();
                if (wheelItem)
                    this._handleDockRequest(wheelItem, dialog);
            };

            /**
             * Returns the wheel item which has the mouse cursor on top of it
             */
            DockWheel.prototype._getActiveWheelItem = function () {
                for (var wheelType in this.wheelItems) {
                    var wheelItem = this.wheelItems[wheelType];
                    if (wheelItem.active)
                        return wheelItem;
                }
                return undefined;
            };

            DockWheel.prototype._handleDockRequest = function (wheelItem, dialog) {
                if (!this.activeNode)
                    return;
                if (wheelItem.id === 'left') {
                    this.dockManager.dockDialogLeft(this.activeNode, dialog);
                } else if (wheelItem.id === 'right') {
                    this.dockManager.dockDialogRight(this.activeNode, dialog);
                } else if (wheelItem.id === 'top') {
                    this.dockManager.dockDialogUp(this.activeNode, dialog);
                } else if (wheelItem.id === 'down') {
                    this.dockManager.dockDialogDown(this.activeNode, dialog);
                } else if (wheelItem.id === 'fill') {
                    this.dockManager.dockDialogFill(this.activeNode, dialog);
                } else if (wheelItem.id === 'left-s') {
                    this.dockManager.dockDialogLeft(this.dockManager.context.model.rootNode, dialog);
                } else if (wheelItem.id === 'right-s') {
                    this.dockManager.dockDialogRight(this.dockManager.context.model.rootNode, dialog);
                } else if (wheelItem.id === 'top-s') {
                    this.dockManager.dockDialogUp(this.dockManager.context.model.rootNode, dialog);
                } else if (wheelItem.id === 'down-s') {
                    this.dockManager.dockDialogDown(this.dockManager.context.model.rootNode, dialog);
                }
            };


        }, {"../utils/utils": 31, "./DockWheelItem": 19}],
        19: [function (require, module, exports) {
            var EventHandler = require('../utils/EventHandler');

            function DockWheelItem(wheel, id) {
                this.wheel = wheel;
                this.id = id;
                var wheelType = id.replace('-s', '');
                this.element = document.createElement('div');
                this.element.classList.add('dock-wheel-item');
                this.element.classList.add('disable-selection');
                this.element.classList.add('dock-wheel-' + wheelType);
                this.element.classList.add('dock-wheel-' + wheelType + '-icon');
                this.hoverIconClass = 'dock-wheel-' + wheelType + '-icon-hover';
                this.mouseOverHandler = new EventHandler(this.element, 'mouseover', this.onMouseMoved.bind(this));
                this.mouseOutHandler = new EventHandler(this.element, 'mouseout', this.onMouseOut.bind(this));
                this.active = false;    // Becomes active when the mouse is hovered over it
            }

            module.exports = DockWheelItem;

            DockWheelItem.prototype.onMouseMoved = function (e) {
                this.active = true;
                this.element.classList.add(this.hoverIconClass);
                this.wheel.onMouseOver(this, e);
            };

            DockWheelItem.prototype.onMouseOut = function (e) {
                this.active = false;
                this.element.classList.remove(this.hoverIconClass);
                this.wheel.onMouseOut(this, e);
            };

        }, {"../utils/EventHandler": 27}],
        20: [function (require, module, exports) {
            var DockModel = require('../dock/DockModel'),
                DockNode = require('../dock/DockNode'),
                PanelContainer = require('../containers/PanelContainer'),
                HorizontalDockContainer = require('../containers/HorizontalDockContainer'),
                VerticalDockContainer = require('../containers/VerticalDockContainer'),
                DocumentManagerContainer = require('../containers/DocumentManagerContainer'),
                FillDockContainer = require('../containers/FillDockContainer'),
                Dialog = require('../dialog/Dialog'),
                utils = require('../utils/utils');

            /**
             * Deserializes the dock layout hierarchy from JSON and creates a dock hierarhcy graph
             */
            function DockGraphDeserializer(dockManager) {
                this.dockManager = dockManager;
            }

            module.exports = DockGraphDeserializer;

            DockGraphDeserializer.prototype.deserialize = function (_json) {
                var info = JSON.parse(_json);
                var model = new DockModel();
                model.rootNode = this._buildGraph(info.graphInfo);
                model.dialogs = this._buildDialogs(info.dialogsInfo);
                return model;
            };

            DockGraphDeserializer.prototype._buildGraph = function (nodeInfo) {
                var childrenInfo = nodeInfo.children;
                var children = [];
                var self = this;
                childrenInfo.forEach(function (childInfo) {
                    var childNode = self._buildGraph(childInfo);
                    if (childNode !== null) {
                        children.push(childNode);
                    }
                });

                // Build the container owned by this node
                var container = this._createContainer(nodeInfo, children);
                if (container === null) {
                    return null;
                }
                // Build the node for this container and attach it's children
                var node = new DockNode(container);
                node.children = children;
                node.children.reverse().forEach(function (childNode) {
                    childNode.parent = node;
                });
                node.children.reverse();
                // node.container.setActiveChild(node.container);
                return node;
            };

            DockGraphDeserializer.prototype._createContainer = function (nodeInfo, children) {
                var containerType = nodeInfo.containerType;
                var containerState = nodeInfo.state;
                var container;

                var childContainers = [];
                children.forEach(function (childNode) {
                    childContainers.push(childNode.container);
                });


                if (containerType === 'panel') {
                    container = new PanelContainer.loadFromState(containerState, this.dockManager);
                    if (!container.prepareForDocking)
                        return null;
                    container.prepareForDocking();
                    utils.removeNode(container.elementPanel);
                }
                else if (containerType === 'horizontal')
                    container = new HorizontalDockContainer(this.dockManager, childContainers);
                else if (containerType === 'vertical')
                    container = new VerticalDockContainer(this.dockManager, childContainers);
                else if (containerType === 'fill') {
                    // Check if this is a document manager

                    // TODO: Layout engine compares the string 'fill', so cannot create another subclass type
                    // called document_manager and have to resort to this hack. use RTTI in layout engine
                    var typeDocumentManager = containerState.documentManager;
                    if (typeDocumentManager)
                        container = new DocumentManagerContainer(this.dockManager);
                    else
                        container = new FillDockContainer(this.dockManager);
                }
                else
                    throw new Error('Cannot create dock container of unknown type: ' + containerType);

                // Restore the state of the container

                container.loadState(containerState);

                // container.performLayout(childContainers);
                return container;
            };

            DockGraphDeserializer.prototype._buildDialogs = function (dialogsInfo) {
                var dialogs = [];
                var self = this;
                dialogsInfo.forEach(function (dialogInfo) {
                    var containerType = dialogInfo.containerType;
                    var containerState = dialogInfo.state;
                    var container;
                    if (containerType === 'panel') {
                        container = new PanelContainer.loadFromState(containerState, self.dockManager);
                        if (container.prepareForDocking) {
                            utils.removeNode(container.elementPanel);
                            container.isDialog = true;
                            var dialog = new Dialog(container, self.dockManager);
                            if (dialogInfo.position.left > document.body.clientWidth ||
                                dialogInfo.position.top > document.body.clientHeight - 70) {
                                dialogInfo.position.left = 20;
                                dialogInfo.position.top = 70;
                            }
                            dialog.setPosition(dialogInfo.position.left, dialogInfo.position.top);
                            dialog.isHidden = dialogInfo.isHidden;
                            if (dialog.isHidden)
                                dialog.hide();
                            dialogs.push(dialog);
                        }
                    }

                });
                return dialogs;
            };

        }, {
            "../containers/DocumentManagerContainer": 3,
            "../containers/FillDockContainer": 5,
            "../containers/HorizontalDockContainer": 6,
            "../containers/PanelContainer": 7,
            "../containers/VerticalDockContainer": 9,
            "../dialog/Dialog": 12,
            "../dock/DockModel": 16,
            "../dock/DockNode": 17,
            "../utils/utils": 31
        }],
        21: [function (require, module, exports) {
            /**
             * The serializer saves / loads the state of the dock layout hierarchy
             */
            function DockGraphSerializer() {
            }

            module.exports = DockGraphSerializer;

            DockGraphSerializer.prototype.serialize = function (model) {
                var graphInfo = this._buildGraphInfo(model.rootNode);
                var dialogs = this._buildDialogsInfo(model.dialogs);
                return JSON.stringify({graphInfo: graphInfo, dialogsInfo: dialogs});
            };

            DockGraphSerializer.prototype._buildGraphInfo = function (node) {
                var nodeState = {};
                node.container.saveState(nodeState);

                var childrenInfo = [];
                var self = this;
                node.children.forEach(function (childNode) {
                    childrenInfo.push(self._buildGraphInfo(childNode));
                });

                var nodeInfo = {};
                nodeInfo.containerType = node.container.containerType;
                nodeInfo.state = nodeState;
                nodeInfo.children = childrenInfo;
                return nodeInfo;
            };

            DockGraphSerializer.prototype._buildDialogsInfo = function (dialogs) {
                var dialogsInfo = [];
                dialogs.forEach(function (dialog) {
                    var panelState = {};
                    var panelContainer = dialog.panel;
                    panelContainer.saveState(panelState);

                    var panelInfo = {};
                    panelInfo.containerType = panelContainer.containerType;
                    panelInfo.state = panelState;
                    panelInfo.children = [];
                    panelInfo.position = dialog.getPosition();
                    panelInfo.isHidden = dialog.isHidden;
                    dialogsInfo.push(panelInfo);
                });

                return dialogsInfo;
            };

        }, {}],
        22: [function (require, module, exports) {
            var EventHandler = require('../utils/EventHandler'),
                utils = require('../utils/utils');

            function SplitterBar(previousContainer, nextContainer, stackedVertical) {
                // The panel to the left/top side of the bar, depending on the bar orientation
                this.previousContainer = previousContainer;
                // The panel to the right/bottom side of the bar, depending on the bar orientation
                this.nextContainer = nextContainer;
                this.stackedVertical = stackedVertical;
                this.barElement = document.createElement('div');
                this.barElement.classList.add(stackedVertical ? 'splitbar-horizontal' : 'splitbar-vertical');
                this.mouseDownHandler = new EventHandler(this.barElement, 'mousedown', this.onMouseDown.bind(this));
                this.minPanelSize = 55; // TODO: Get from container configuration
                this.readyToProcessNextDrag = true;
            }

            module.exports = SplitterBar;

            SplitterBar.prototype.onMouseDown = function (e) {
                this._startDragging(e);
            };

            SplitterBar.prototype.onMouseUp = function (e) {
                this._stopDragging(e);
            };

            SplitterBar.prototype.onMouseMoved = function (e) {
                if (!this.readyToProcessNextDrag)
                    return;
                this.readyToProcessNextDrag = false;

                var dockManager = this.previousContainer.dockManager;
                dockManager.suspendLayout();
                var dx = e.pageX - this.previousMouseEvent.pageX;
                var dy = e.pageY - this.previousMouseEvent.pageY;
                this._performDrag(dx, dy);
                this.previousMouseEvent = e;
                this.readyToProcessNextDrag = true;
                dockManager.resumeLayout();
            };

            SplitterBar.prototype._performDrag = function (dx, dy) {
                var previousWidth = this.previousContainer.containerElement.clientWidth;
                var previousHeight = this.previousContainer.containerElement.clientHeight;
                var nextWidth = this.nextContainer.containerElement.clientWidth;
                var nextHeight = this.nextContainer.containerElement.clientHeight;

                var previousPanelSize = this.stackedVertical ? previousHeight : previousWidth;
                var nextPanelSize = this.stackedVertical ? nextHeight : nextWidth;
                var deltaMovement = this.stackedVertical ? dy : dx;
                var newPreviousPanelSize = previousPanelSize + deltaMovement;
                var newNextPanelSize = nextPanelSize - deltaMovement;

                if (newPreviousPanelSize < this.minPanelSize || newNextPanelSize < this.minPanelSize) {
                    // One of the panels is smaller than it should be.
                    // In that case, check if the small panel's size is being increased
                    var continueProcessing = (newPreviousPanelSize < this.minPanelSize && newPreviousPanelSize > previousPanelSize) ||
                        (newNextPanelSize < this.minPanelSize && newNextPanelSize > nextPanelSize);

                    if (!continueProcessing)
                        return;
                }

                if (this.stackedVertical) {
                    this.previousContainer.resize(previousWidth, newPreviousPanelSize);
                    this.nextContainer.resize(nextWidth, newNextPanelSize);
                }
                else {
                    this.previousContainer.resize(newPreviousPanelSize, previousHeight);
                    this.nextContainer.resize(newNextPanelSize, nextHeight);
                }
            };

            SplitterBar.prototype._startDragging = function (e) {
                utils.disableGlobalTextSelection();
                if (this.mouseMovedHandler) {
                    this.mouseMovedHandler.cancel();
                    delete this.mouseMovedHandler;
                }
                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                    delete this.mouseUpHandler;
                }
                this.mouseMovedHandler = new EventHandler(window, 'mousemove', this.onMouseMoved.bind(this));
                this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
                this.previousMouseEvent = e;
            };

            SplitterBar.prototype._stopDragging = function () {
                utils.enableGlobalTextSelection();
                document.body.classList.remove('disable-selection');
                if (this.mouseMovedHandler) {
                    this.mouseMovedHandler.cancel();
                    delete this.mouseMovedHandler;
                }
                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                    delete this.mouseUpHandler;
                }
            };

        }, {"../utils/EventHandler": 27, "../utils/utils": 31}],
        23: [function (require, module, exports) {
            var SplitterBar = require('./SplitterBar'),
                utils = require('../utils/utils');

            /**
             * A splitter panel manages the child containers inside it with splitter bars.
             * It can be stacked horizontally or vertically
             */
            function SplitterPanel(childContainers, stackedVertical) {
                this.childContainers = childContainers;
                this.stackedVertical = stackedVertical;
                this.panelElement = document.createElement('div');
                this.spiltterBars = [];
                this._buildSplitterDOM();
            }

            module.exports = SplitterPanel;

            SplitterPanel.prototype._buildSplitterDOM = function () {
                if (this.childContainers.length <= 1)
                    throw new Error('Splitter panel should contain atleast 2 panels');

                this.spiltterBars = [];
                for (var i = 0; i < this.childContainers.length - 1; i++) {
                    var previousContainer = this.childContainers[i];
                    var nextContainer = this.childContainers[i + 1];
                    var splitterBar = new SplitterBar(previousContainer, nextContainer, this.stackedVertical);
                    this.spiltterBars.push(splitterBar);

                    // Add the container and split bar to the panel's base div element
                    this._insertContainerIntoPanel(previousContainer);
                    this.panelElement.appendChild(splitterBar.barElement);
                }
                this._insertContainerIntoPanel(this.childContainers.slice(-1)[0]);
            };

            SplitterPanel.prototype.performLayout = function (children) {
                this.removeFromDOM();

                // rebuild
                this.childContainers = children;
                this._buildSplitterDOM();
            };

            SplitterPanel.prototype.removeFromDOM = function () {
                this.childContainers.forEach(function (container) {
                    if (container.containerElement) {
                        container.containerElement.classList.remove('splitter-container-vertical');
                        container.containerElement.classList.remove('splitter-container-horizontal');
                        utils.removeNode(container.containerElement);
                    }
                });
                this.spiltterBars.forEach(function (bar) {
                    utils.removeNode(bar.barElement);
                });
            };

            SplitterPanel.prototype.destroy = function () {
                this.removeFromDOM();
                this.panelElement.parentNode.removeChild(this.panelElement);
            };

            SplitterPanel.prototype._insertContainerIntoPanel = function (container) {
                if (!container) {
                    console.log('undefined');
                }

                utils.removeNode(container.containerElement);
                var child = this.panelElement.appendChild(container.containerElement);
                $(child).show();
                container.containerElement.classList.add(
                    this.stackedVertical ? 'splitter-container-vertical' : 'splitter-container-horizontal'
                );
            };

            /**
             * Sets the percentage of space the specified [container] takes in the split panel
             * The percentage is specified in [ratio] and is between 0..1
             */
            SplitterPanel.prototype.setContainerRatio = function (container, ratio) {
                var splitPanelSize = this.stackedVertical ? this.panelElement.clientHeight : this.panelElement.clientWidth;
                var newContainerSize = splitPanelSize * ratio;
                var barSize = this.stackedVertical ?
                    this.spiltterBars[0].barElement.clientHeight : this.spiltterBars[0].barElement.clientWidth;

                var otherPanelSizeQuota = splitPanelSize - newContainerSize - barSize * this.spiltterBars.length;
                var otherPanelScaleMultipler = otherPanelSizeQuota / splitPanelSize;

                for (var i = 0; i < this.childContainers.length; i++) {
                    var child = this.childContainers[i];
                    var size;
                    if (child !== container) {
                        size = this.stackedVertical ? child.containerElement.clientHeight : child.containerElement.clientWidth;
                        size *= otherPanelScaleMultipler;
                    }
                    else
                        size = newContainerSize;

                    if (this.stackedVertical)
                        child.resize(child.width, Math.floor(size));
                    else
                        child.resize(Math.floor(size), child.height);
                }
            };

            SplitterPanel.prototype.resize = function (width, height) {
                if (this.childContainers.length <= 1)
                    return;

                var i;

                // Adjust the fixed dimension that is common to all (i.e. width, if stacked vertical; height, if stacked horizontally)
                for (i = 0; i < this.childContainers.length; i++) {
                    var childContainer = this.childContainers[i];
                    if (this.stackedVertical)
                        childContainer.resize(width, childContainer.height);
                    else
                        childContainer.resize(childContainer.width, height);

                    if (i < this.spiltterBars.length) {
                        var splitBar = this.spiltterBars[i];
                        if (this.stackedVertical)
                            splitBar.barElement.style.width = width + 'px';
                        else
                            splitBar.barElement.style.height = height + 'px';
                    }
                }

                // Adjust the varying dimension
                var totalChildPanelSize = 0;
                // Find out how much space existing child containers take up (excluding the splitter bars)
                var self = this;
                this.childContainers.forEach(function (container) {
                    var size = self.stackedVertical ?
                        container.height :
                        container.width;
                    totalChildPanelSize += size;
                });

                // Get the thickness of the bar
                var barSize = this.stackedVertical ?
                    this.spiltterBars[0].barElement.clientHeight : this.spiltterBars[0].barElement.clientWidth;

                // Find out how much space existing child containers will take after being resized (excluding the splitter bars)
                var targetTotalChildPanelSize = this.stackedVertical ? height : width;
                targetTotalChildPanelSize -= barSize * this.spiltterBars.length;

                // Get the scale multiplier
                totalChildPanelSize = Math.max(totalChildPanelSize, 1);
                var scaleMultiplier = targetTotalChildPanelSize / totalChildPanelSize;


                // Update the size with this multiplier
                var updatedTotalChildPanelSize = 0;
                for (i = 0; i < this.childContainers.length; i++) {
                    var child = this.childContainers[i];
                    var original = this.stackedVertical ?
                        child.containerElement.clientHeight :
                        child.containerElement.clientWidth;

                    var newSize = scaleMultiplier > 1 ? Math.floor(original * scaleMultiplier) :
                        Math.ceil(original * scaleMultiplier);
                    updatedTotalChildPanelSize += newSize;

                    // If this is the last node, add any extra pixels to fix the rounding off errors and match the requested size
                    if (i === this.childContainers.length - 1)
                        newSize += targetTotalChildPanelSize - updatedTotalChildPanelSize;

                    // Set the size of the panel
                    if (this.stackedVertical)
                        child.resize(child.width, newSize);
                    else
                        child.resize(newSize, child.height);
                }

                this.panelElement.style.width = width + 'px';
                this.panelElement.style.height = height + 'px';
            };

        }, {"../utils/utils": 31, "./SplitterBar": 22}],
        24: [function (require, module, exports) {
            var PanelContainer = require('../containers/PanelContainer'),
                UndockInitiator = require('../utils/UndockInitiator'),
                EventHandler = require('../utils/EventHandler'),
                utils = require('../utils/utils');

            /**
             * A tab handle represents the tab button on the tab strip
             */
            function TabHandle(parent) {
                this.parent = parent;
                var undockHandler = TabHandle.prototype._performUndock.bind(this);
                this.elementBase = document.createElement('div');
                this.elementText = document.createElement('div');
                this.elementCloseButton = document.createElement('div');
                this.elementBase.classList.add('tab-handle', 'ui-state-default', 'ui-corner-top');
                this.elementBase.classList.add('disable-selection'); // Disable text selection
                this.elementText.classList.add('tab-handle-text');
                this.elementCloseButton.classList.add('tab-handle-close-button');
                this.elementBase.appendChild(this.elementText);
                if (this.parent.host.displayCloseButton)
                    this.elementBase.appendChild(this.elementCloseButton);

                this.parent.host.tabListElement.appendChild(this.elementBase);

                var panel = parent.container;
                var title = panel.getRawTitle();
                var that = this;
                this.undockListener = {
                    onDockEnabled: function (e) {
                        that.undockEnabled(e.state);
                    },
                    onHideCloseButton: function (e) {
                        that.hideCloseButton(e.state);
                    }
                };
                this.eventListeners = [];
                panel.addListener(this.undockListener);

                this.elementText.innerHTML = title;


                this.elementCloseButton.innerHTML = '<span class="ui-icon ui-icon-closethick"></span>';


                this._bringToFront(this.elementBase);

                this.undockInitiator = new UndockInitiator(this.elementBase, undockHandler);
                this.undockInitiator.enabled = true;
                this.mouseClickHandler = new EventHandler(this.elementBase, 'click', this.onMouseClicked.bind(this));
                this.mouseDownHandler = new EventHandler(this.elementBase, 'mousedown', this.onMouseDown.bind(this));
                this.closeButtonHandler = new EventHandler(this.elementCloseButton, 'mousedown', this.onCloseButtonClicked.bind(this));

                this.moveThreshold = 10;
                this.zIndexCounter = 1000;

                this.elementBase.addEventListener("mouseenter", function () {
                    that.elementBase.classList.add('ui-state-hover');
                });
                this.elementBase.addEventListener("mouseleave", function () {
                    that.elementBase.classList.remove('ui-state-hover');
                });


            }

            module.exports = TabHandle;

            TabHandle.prototype.addListener = function (listener) {
                this.eventListeners.push(listener);
            };

            TabHandle.prototype.removeListener = function (listener) {
                this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
            };

            TabHandle.prototype.undockEnabled = function (state) {
                this.undockInitiator.enabled = state;
            };

            TabHandle.prototype.onMouseDown = function (e) {
                if (this.undockInitiator.enabled)
                    this.undockInitiator.setThresholdPixels(40, false);
                if (this.mouseMoveHandler) {
                    this.mouseMoveHandler.cancel();
                    delete this.mouseMoveHandler;
                }
                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                    delete this.mouseUpHandler;
                }
                this.stargDragPosition = e.clientX;
                this.mouseMoveHandler = new EventHandler(this.elementBase, 'mousemove', this.onMouseMove.bind(this));
                this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
            };

            TabHandle.prototype.onMouseUp = function () {
                if (this.undockInitiator.enabled)
                    this.undockInitiator.setThresholdPixels(10, true);
                if (this.elementBase) {
                    this.elementBase.classList.remove('tab-handle-dragged');
                }
                this.dragged = false;
                this.mouseMoveHandler.cancel();
                this.mouseUpHandler.cancel();
                delete this.mouseMoveHandler;
                delete this.mouseUpHandler;

            };

            TabHandle.prototype.generateMoveTabEvent = function (event, pos) {
                var contain = pos > event.rect.left && pos < event.rect.right;
                var m = Math.abs(event.bound - pos);
                if (m < this.moveThreshold && contain)
                    this.moveTabEvent(this, event.state);
            };

            TabHandle.prototype.moveTabEvent = function (that, state) {
                that.eventListeners.forEach(function (listener) {
                    if (listener.onMoveTab) {
                        listener.onMoveTab({self: that, state: state});
                    }
                });

            };

            TabHandle.prototype.onMouseMove = function (e) {
                if (Math.abs(this.stargDragPosition - e.clientX) < 10)
                    return;
                this.elementBase.classList.add('tab-handle-dragged');
                this.dragged = true;
                this.prev = this.current;
                this.current = e.clientX;
                this.direction = this.current - this.prev;
                var tabRect = this.elementBase.getBoundingClientRect();
                var event = this.direction < 0 ? {state: 'left', bound: tabRect.left, rect: tabRect} :
                {state: 'right', bound: tabRect.right, rect: tabRect};
                if (this.direction !== 0) this.generateMoveTabEvent(event, this.current);
            };

            TabHandle.prototype.hideCloseButton = function (state) {
                this.elementCloseButton.style.display = state ? 'none' : 'block';
            };

            TabHandle.prototype.updateTitle = function () {
                if (this.parent.container instanceof PanelContainer) {
                    var panel = this.parent.container;
                    var title = panel.getRawTitle();
                    this.elementText.innerHTML = title;
                }
            };

            TabHandle.prototype.destroy = function () {
                var panel = this.parent.container;
                panel.removeListener(this.undockListener);

                this.mouseClickHandler.cancel();
                this.mouseDownHandler.cancel();
                this.closeButtonHandler.cancel();

                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                }

                utils.removeNode(this.elementBase);
                utils.removeNode(this.elementCloseButton);
                delete this.elementBase;
                delete this.elementCloseButton;
            };

            TabHandle.prototype._performUndock = function (e, dragOffset) {
                if (this.parent.container.containerType === 'panel') {
                    this.undockInitiator.enabled = false;
                    var panel = this.parent.container;

                    return panel.performUndockToDialog(e, dragOffset);
                }

                else
                    return null;
            };

            TabHandle.prototype.onMouseClicked = function () {
                this.parent.onSelected();
            };

            TabHandle.prototype.onCloseButtonClicked = function () {
                // If the page contains a panel element, undock it and destroy it
                if (this.parent.container.containerType === 'panel') {
                    this.parent.container.close();
                    // this.undockInitiator.enabled = false;
                    // var panel = this.parent.container;
                    // panel.performUndock();
                }
            };

            TabHandle.prototype.setSelected = function (selected) {
                var selectedClassName = 'tab-handle-selected';
                if (selected) {
                    this.elementBase.classList.add("ui-state-active");
                    this.elementBase.classList.add(selectedClassName);
                }


                else {
                    this.elementBase.classList.remove(selectedClassName);
                    this.elementBase.classList.remove("ui-state-active");
                }

            };

            TabHandle.prototype.setZIndex = function (zIndex) {
                this.elementBase.style.zIndex = zIndex;
            };

            TabHandle.prototype._bringToFront = function (element) {
                element.style.zIndex = this.zIndexCounter;
                this.zIndexCounter++;
            };

        }, {
            "../containers/PanelContainer": 7,
            "../utils/EventHandler": 27,
            "../utils/UndockInitiator": 30,
            "../utils/utils": 31
        }],
        25: [function (require, module, exports) {
            var TabPage = require('./TabPage');

            /**
             * Tab Host control contains tabs known as TabPages.
             * The tab strip can be aligned in different orientations
             */
            function TabHost(tabStripDirection, displayCloseButton) {
                /**
                 * Create a tab host with the tab strip aligned in the [tabStripDirection] direciton
                 * Only TabHost.DIRECTION_BOTTOM and TabHost.DIRECTION_TOP are supported
                 */
                if (tabStripDirection === undefined) {
                    tabStripDirection = TabHost.DIRECTION_BOTTOM;
                }

                if (displayCloseButton === undefined) {
                    displayCloseButton = false;
                }

                this.tabStripDirection = tabStripDirection;
                this.displayCloseButton = displayCloseButton; // Indicates if the close button next to the tab handle should be displayed
                this.pages = [];
                var that = this;
                that.eventListeners = [];
                this.tabHandleListener = {
                    onMoveTab: function (e) {
                        that.onMoveTab(e);
                    }
                };
                this.hostElement = document.createElement('div');       // The main tab host DOM element
                this.tabListElement = document.createElement('div');    // Hosts the tab handles
                this.separatorElement = document.createElement('div');  // A seperator line between the tabs and content
                this.contentElement = document.createElement('div');    // Hosts the active tab content
                this.createTabPage = this._createDefaultTabPage;        // Factory for creating tab pages

                if (this.tabStripDirection === TabHost.DIRECTION_BOTTOM) {
                    this.hostElement.appendChild(this.contentElement);
                    this.hostElement.appendChild(this.separatorElement);
                    this.hostElement.appendChild(this.tabListElement);
                }
                else if (this.tabStripDirection === TabHost.DIRECTION_TOP) {
                    this.hostElement.appendChild(this.tabListElement);
                    this.hostElement.appendChild(this.separatorElement);
                    this.hostElement.appendChild(this.contentElement);
                }
                else {
                    throw new Error('Only top and bottom tab strip orientations are supported');
                }

                this.hostElement.classList.add('tab-host');
                this.tabListElement.classList.add('tab-handle-list-container');
                this.separatorElement.classList.add('tab-handle-content-seperator', 'ui-widget-header');
                this.contentElement.classList.add('tab-content');
                this.contentElement.classList.add('ui-widget-header');
            }

            module.exports = TabHost;

// constants
            TabHost.DIRECTION_TOP = 0;
            TabHost.DIRECTION_BOTTOM = 1;
            TabHost.DIRECTION_LEFT = 2;
            TabHost.DIRECTION_RIGHT = 3;

            TabHost.prototype.onMoveTab = function (e) {
                // this.tabListElement;
                var index = Array.prototype.slice.call(this.tabListElement.childNodes).indexOf(e.self.elementBase);

                this.change(/*host*/this, /*handle*/e.self, e.state, index);
            };

            TabHost.prototype.performTabsLayout = function (indexes) {
                this.pages = this.pages.orderByIndexes(indexes);

                var items = this.tabListElement.childNodes;
                var itemsArr = [];
                for (var i in items) {
                    if (items[i].nodeType === 1) { // get rid of the whitespace text nodes
                        itemsArr.push(items[i]);
                    }
                }
                itemsArr = itemsArr.orderByIndexes(indexes);
                for (i = 0; i < itemsArr.length; ++i) {
                    this.tabListElement.appendChild(itemsArr[i]);
                }
            };

            TabHost.prototype.addListener = function (listener) {
                this.eventListeners.push(listener);
            };

            TabHost.prototype.removeListener = function (listener) {
                this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
            };

            TabHost.prototype.change = function (host, handle, state, index) {
                this.eventListeners.forEach(function (listener) {
                    if (listener.onChange) {
                        listener.onChange({host: host, handle: handle, state: state, index: index});
                    }
                });
            };

            TabHost.prototype._createDefaultTabPage = function (tabHost, container) {
                return new TabPage(tabHost, container);
            };

            TabHost.prototype.setActiveTab = function (/*container*/) {
                if (this.pages.length > 0) {
                    this.onTabPageSelected(this.pages[0]);
                }
            };

            TabHost.prototype.resize = function (width, height) {
                this.hostElement.style.width = width + 'px';
                this.hostElement.style.height = height + 'px';

                var tabHeight = this.tabListElement.clientHeight;
                if (this.timeoutPerform) //lazy check
                    clearTimeout(this.timeoutPerform);
                var self = this;
                this.timeoutPerform = setTimeout(function () {
                    self.resizeTabListElement(width, height);
                }, 100);
                var separatorHeight = this.separatorElement.clientHeight ;
                var contentHeight = height - tabHeight - separatorHeight -8 ;
                this.contentElement.style.height = contentHeight + 'px';

                if (this.activeTab)
                    this.activeTab.resize(width, contentHeight);
            };

            TabHost.prototype.resizeTabListElement = function (width/*, height*/) {
                if (this.pages.length === 0) return;
                var tabListWidth = 0;
                this.pages.forEach(function (page) {
                    var handle = page.handle;
                    handle.elementBase.style.width = ''; //clear
                    handle.elementText.style.width = '';
                    tabListWidth += handle.elementBase.clientWidth;
                });
                var scaleMultiplier = width / tabListWidth;
                if (scaleMultiplier > 1.2) return; //with a reserve
                var self = this;
                this.pages.forEach(function (page, index) {
                    var handle = page.handle;
                    var newSize = scaleMultiplier * handle.elementBase.clientWidth;
                    if (index === self.pages.length - 1)
                        newSize = newSize;
                    handle.elementBase.style.width = newSize + 'px';
                    if (self.tabStripDirection === TabHost.DIRECTION_TOP) {
                        handle.elementText.style.width = newSize - handle.elementCloseButton.clientWidth - 16 + 'px';
                    }
                });
            };

            TabHost.prototype.performLayout = function (children) {
                // Destroy all existing tab pages
                this.pages.forEach(function (tab) {
                    tab.handle.removeListener(this.tabHandleListener);
                    tab.destroy();
                });
                this.pages.length = 0;

                var oldActiveTab = this.activeTab;
                delete this.activeTab;

                var childPanels = children.filter(function (child) {
                    return child.containerType === 'panel';
                });

                if (childPanels.length > 0) {
                    // Rebuild new tab pages
                    var self = this;
                    childPanels.forEach(function (child) {
                        var page = self.createTabPage(self, child);
                        page.handle.addListener(self.tabHandleListener);
                        self.pages.push(page);

                        // Restore the active selected tab
                        if (oldActiveTab && page.container === oldActiveTab.container)
                            self.activeTab = page;
                    });
                    this._setTabHandlesVisible(true);
                }
                else
                // Do not show an empty tab handle host with zero tabs
                    this._setTabHandlesVisible(false);

                if (this.activeTab)
                    this.onTabPageSelected(this.activeTab);
            };

            TabHost.prototype._setTabHandlesVisible = function (visible) {
                this.tabListElement.style.display = visible ? 'block' : 'none';
                this.separatorElement.style.display = visible ? 'block' : 'none';
            };

            TabHost.prototype.onTabPageSelected = function (page) {

                this.activeTab = page;
                this.pages.forEach(function (tabPage) {
                    var selected = (tabPage === page);
                    tabPage.setSelected(selected);
                });

                // adjust the zIndex of the tabs to have proper shadow/depth effect
                var zIndexDelta = 1;
                var zIndex = 100;
                this.pages.forEach(function (tabPage) {
                    tabPage.handle.setZIndex(zIndex);
                    var selected = (tabPage === page);
                    if (selected)
                        zIndexDelta = -1;
                    zIndex += zIndexDelta;
                });

            };

        }, {"./TabPage": 26}],
        26: [function (require, module, exports) {
            var TabHandle = require('./TabHandle'),
                PanelContainer = require('../containers/PanelContainer'),
                utils = require('../utils/utils');

            function TabPage(host, container) {
                if (arguments.length === 0) {
                    return;
                }

                this.selected = false;
                this.host = host;
                this.container = container;

                this.handle = new TabHandle(this);
                this.containerElement = container.containerElement;

                if (container instanceof PanelContainer) {
                    var panel = container;
                    panel.onTitleChanged = this.onTitleChanged.bind(this);
                }
            }

            module.exports = TabPage;

            TabPage.prototype.onTitleChanged = function (/*sender, title*/) {
                this.handle.updateTitle();
            };

            TabPage.prototype.destroy = function () {
                this.handle.destroy();

                if (this.container instanceof PanelContainer) {
                    var panel = this.container;
                    delete panel.onTitleChanged;
                }
            };

            TabPage.prototype.onSelected = function () {
                this.host.onTabPageSelected(this);
                if (this.container instanceof PanelContainer) {
                    var panel = this.container;
                    panel.dockManager.notifyOnTabChange(this);
                }

            };

            TabPage.prototype.setSelected = function (flag) {

                this.selected = flag;
                this.handle.setSelected(flag);

                if(!$.contains(this.host.contentElement,this.containerElement)){
                    this.host.contentElement.appendChild(this.containerElement);
                }
                if (this.selected) {
                    $(this.containerElement).show();
                    // force a resize again
                    var width = this.host.contentElement.clientWidth;
                    var height = this.host.contentElement.clientHeight;
                    this.container.resize(width, height);
                }
                else {
                    $(this.containerElement).hide()

                    //utils.removeNode(this.containerElement);
                }
            };

            TabPage.prototype.resize = function (width, height) {
                this.container.resize(width, height);
            };

        }, {"../containers/PanelContainer": 7, "../utils/utils": 31, "./TabHandle": 24}],
        27: [function (require, module, exports) {
            function EventHandler(source, eventName, target) {
                // wrap the target
                this.target = target;
                this.eventName = eventName;
                this.source = source;

                this.source.addEventListener(eventName, this.target);
            }

            module.exports = EventHandler;

            EventHandler.prototype.cancel = function () {
                this.source.removeEventListener(this.eventName, this.target);
            };

        }, {}],
        28: [function (require, module, exports) {
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }

            module.exports = Point;

        }, {}],
        29: [function (require, module, exports) {
            function Rectangle(x, y, width, height) {
                this.x = x || 0;
                this.y = y || 0;
                this.width = width || 0;
                this.height = height || 0;
            }

            module.exports = Rectangle;

        }, {}],
        30: [function (require, module, exports) {
            var EventHandler = require('./EventHandler'),
                Point = require('./Point');

            /**
             * Listens for events on the [element] and notifies the [listener]
             * if an undock event has been invoked.  An undock event is invoked
             * when the user clicks on the event and drags is beyond the
             * specified [thresholdPixels]
             */
            function UndockInitiator(element, listener, thresholdPixels) {
                if (!thresholdPixels) {
                    thresholdPixels = 10;
                }

                this.element = element;
                this.listener = listener;
                this.thresholdPixels = thresholdPixels;
                this._enabled = false;
                this.horizontalChange = true;
            }

            module.exports = UndockInitiator;

            Object.defineProperty(UndockInitiator.prototype, 'enabled', {
                get: function () {
                    return this._enabled;
                },
                set: function (value) {
                    this._enabled = value;
                    if (this._enabled) {
                        if (this.mouseDownHandler) {
                            this.mouseDownHandler.cancel();
                            delete this.mouseDownHandler;
                        }

                        this.mouseDownHandler = new EventHandler(this.element, 'mousedown', this.onMouseDown.bind(this));
                    }
                    else {
                        if (this.mouseDownHandler) {
                            this.mouseDownHandler.cancel();
                            delete this.mouseDownHandler;
                        }

                        if (this.mouseUpHandler) {
                            this.mouseUpHandler.cancel();
                            delete this.mouseUpHandler;
                        }

                        if (this.mouseMoveHandler) {
                            this.mouseMoveHandler.cancel();
                            delete this.mouseMoveHandler;
                        }
                    }
                }
            });

            UndockInitiator.prototype.setThresholdPixels = function (thresholdPixels, horizontalChange) {
                this.horizontalChange = horizontalChange;
                this.thresholdPixels = thresholdPixels;
            };

            UndockInitiator.prototype.onMouseDown = function (e) {
                // Make sure we dont do this on floating dialogs
                if (this.enabled) {
                    if (this.mouseUpHandler) {
                        this.mouseUpHandler.cancel();
                        delete this.mouseUpHandler;
                    }

                    if (this.mouseMoveHandler) {
                        this.mouseMoveHandler.cancel();
                        delete this.mouseMoveHandler;
                    }

                    this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
                    this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMove.bind(this));
                    this.dragStartPosition = new Point(e.pageX, e.pageY);
                }
            };

            UndockInitiator.prototype.onMouseUp = function () {
                if (this.mouseUpHandler) {
                    this.mouseUpHandler.cancel();
                    delete this.mouseUpHandler;
                }

                if (this.mouseMoveHandler) {
                    this.mouseMoveHandler.cancel();
                    delete this.mouseMoveHandler;
                }
            };

            UndockInitiator.prototype.onMouseMove = function (e) {
                var position = new Point(e.pageX, e.pageY);
                var dx = this.horizontalChange ? position.x - this.dragStartPosition.x : 10;
                var dy = position.y - this.dragStartPosition.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.thresholdPixels) {
                    this.enabled = false;
                    this._requestUndock(e);
                }
            };

            UndockInitiator.prototype._requestUndock = function (e) {
                var dragOffsetX = this.dragStartPosition.x - this.element.offsetLeft;
                var dragOffsetY = this.dragStartPosition.y - this.element.offsetTop;
                var dragOffset = new Point(dragOffsetX, dragOffsetY);
                this.listener(e, dragOffset);
            };

        }, {"./EventHandler": 27, "./Point": 28}],
        31: [function (require, module, exports) {
            var counter = 0;

            module.exports = {
                getPixels: function (pixels) {
                    if (pixels === null) {
                        return 0;
                    }

                    return parseInt(pixels.replace('px', ''));
                },

                disableGlobalTextSelection: function () {
                    document.body.classList.add('disable-selection');
                },

                enableGlobalTextSelection: function () {
                    document.body.classList.remove('disable-selection');
                },

                isPointInsideNode: function (px, py, node) {
                    var element = node.container.containerElement;

                    return (
                    px >= element.offsetLeft &&
                    px <= element.offsetLeft + element.clientWidth &&
                    py >= element.offsetTop &&
                    py <= element.offsetTop + element.clientHeight
                    );
                },

                getNextId: function (prefix) {
                    return prefix + counter++;
                },

                removeNode: function (node) {
                    if (node.parentNode === null) {
                        return false;
                    }

                    node.parentNode.removeChild(node);

                    return true;
                }
            };

        }, {}]
    }, {}, [1])(1)
});