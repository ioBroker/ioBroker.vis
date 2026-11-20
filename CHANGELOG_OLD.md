## Changelog
### 1.4.15 (2022-04-10)
* (bluefox) Better check of the offline license

### 1.4.14 (2022-03-31)
* (bluefox) Corrected GUI bug

### 1.4.13 (2022-03-22)
* (pascal-hari) The group attributes will be replaced recursively

### 1.4.12 (2022-02-12)
* (bluefox) Fixed bug with the export of specific widgets

### 1.4.11 (2022-02-12)
* (bluefox) Removed ES6 commands to be supported by older browsers
* (oweitman) Fixed problem with update of grouped widgets
* (stephanritscher) Added web manifest to be able to handle vis as the web app

### 1.4.8 (2022-01-29)
* (bluefox) Added support for js-controller 4.x

### 1.4.7 (2021-12-28)
* (mswiege) Fixed subscribeOidAtRuntime if called with invalid IDs
* (bluefox) Added support of license manager

### 1.4.6 (2021-11-20)
* (bluefox) Added the license check even without internet

### 1.4.5 (2021-10-08)
* (jens-maus) Added frame-src spec to content-security-policy header fixing frame related content blocking issues (e.g. using KioskPro iOS app).
* (bluefox) Showed the extended error messages by license check
* (Scrounger) Patch visibility oid binding

### 1.4.4 (2021-08-31)
* (jobe451) Allowed to have ":" in the binding object IDs

### 1.4.3 (2021-07-11)
* (bluefox) Added possibility to check license offline (only special once)

### 1.4.0 (2021-07-01)
* (bluefox) Changed path for check of certificates
* (thost96) fixes for issues found by adapter-checker

### 1.3.10 (2021-05-25)
* (bluefox) Fixed the support of admin5

### 1.3.9 (2021-04-29)
* (agav99) Added support of local browser variables
* (Scrounger) Bug fix for null & NaN values in width and height
* (bluefox) Added support for admin5

### 1.3.8 (2021-03-03)
* (bluefox) fix play sounds on iOS Safari an android
* (Scrounger) visEditInspect: format dimension added
* (foxriver76) Replace travis and appveyor by the GitHub actions
* (Excodibur) Allow resources to be loaded as blob
* (Excodibur ) Allow resources to be loaded as blob

### 1.3.7 (2021-01-20)
* (Scrounger) Bug Fixed - Binding in JSON string

### 1.3.6 (2020-12-13)
* (twonky4) Corrected: old browser issue
* (rbaranga) Corrected: play sounds on iOS Safari
* (Scrounger) Added the optional arguments to support Material Design Widgets

### 1.3.4 (2020-10-04)
* (foxriver76) Corrected the error on older devices

### 1.3.3 (2020-09-21)
* (bluefox) Return de-bounce settings back
* (bluefox) Corrected error with {username} binding
* (bluefox) Fixed "show last change" option

### 1.3.1 (2020-09-18)
* (bluefox) Added the auto-focus option to the input widgets

### 1.3.0 (2020-09-17)
* (foxriver76) on pending getStates, try again instead of drop
* (foxriver76) fixed the file manager typos
* (Scrounger) Added momentDate for the bindings

### 1.2.12 (2020-09-08)
* (foxriver76) only parse arrays and json objects, not booleans, normal strings etc

### 1.2.11 (2020-08-25)
* (bluefox) The error message about the non-found chart view was fixed.

### 1.2.10 (2020-08-23)
* (gsicilia82/fceller) JSON strings will be parsed in VIS bindings

### 1.2.9 (2020-08-22)
* (bluefox) Charts are now supported

### 1.2.6 (2020-03-22)
* (bluefox) Added the better error message if license could not be parsed

### 1.2.4 (2020-02-11)
* (bluefox) Table widget was extended with the selected object ID.

### 1.2.3 (2019-12-14)
* (bluefox) Small changes in license handling were made

### 1.2.2 (2019-10-27)
* (bluefox) Preparations for js-controller 2.0. Check undefined adn null.

### 1.2.1 (2019-09-10)
* (bluefox) fixed upload of files

### 1.2.0 (2019-05-07)
* (bluefox) add translations

### 1.1.11 (2019-02-07)
* (bluefox) improve Bool HTML

### 1.1.10 (2019-01-30)
* Add Chinese support

### 1.1.8 (2018-10-29)
* (bluefox) File dialog was corrected

### 1.1.7 (2018-07-24)
* (bluefox) view8 corrected

### 1.1.6 (2018-07-18)
* (bluefox) support of new variables (see [Special bindings](#special-bindings) )
* (bluefox) fix error if fast view changes
* (bluefox) fix "jqui - ctrl - IconState / val - Icon Bool"

### 1.1.5 (2018-06-10)
* (bluefox) show more information if widget cannot be rendered
* (bluefox) fix saving of widgets if they have bindings
* (bluefox) show error stack
* (bluefox) fix binding
* (Apollon77) fix testing
* (bluefox) fix for iobroker.pro and external socket.io settings
* (bluefox) A user variable was added into bindings.
* (bluefox) Fixed widget tabs

### 1.1.4 (2018-04-23)
* (bluefox) fix bool SVG

### 1.1.3 (2018-04-12)
* (bluefox) ignore click by scrolling on touch devices
* (bluefox) remove wrong state vis.0.command
* (bluefox) fix error with jPlot
* (bluefox) better widget behaviour in edit Mode (basic, jqui)
* Fix config dialog

### 1.1.2 (2018-02-02)
* (bluefox) Fixing the saving of project
* (bluefox) Fixing the background selector
* (bluefox) Fixing the null pointer problem
* (bluefox) Fixing the selection helper
* Update translations

### 1.1.1 (2018-01-07)
* (bluefox) The problem with view change on the touch devices fixed

### 1.0.5 (2017-11-19)
* (bluefox) show number of data points in every project

### 1.0.4 (2017-10-22)
* (bluefox) Add autocomplete for view CSS options
* (bluefox) change edit of view CSS background options

### 1.0.3 (2017-10-20)
* (bluefox) Fix parse of invalid bindings
* (bluefox) add moment.js

### 1.0.0 release candidate (2017-10-13)
* (bluefox) fix iframe and image updates
* (bluefox) fix fonts

### 0.15.7 (2017-10-01)
* (bluefox) allow update of images without additional query (but it works only in some very specific cases)
* (bluefox) zoom of iframes

### 0.15.5 (2017-07-24)
* (bluefox) Fix widgets upload

### 0.15.4 (2017-07-19)
* (bluefox) Add swipe

### 0.15.3 (2017-07-12)
* (bluefox) Add full screen widget
* (bluefox) Fix timestamp widget

### 0.15.2 (2017-07-07)
* (bluefox) Fix binding if it has "-" in the OID

### 0.15.1 (2017-06-30)
* (bluefox) Fix error with context menu
* (bluefox) Allow adding of class to view

### 0.15.0 (2017-05-25)
* (bluefox) fix copy of grouped widgets
* (bluefox) fix subscribe if empty states

### 0.14.7 (2017-05-19)
* (bluefox) add templates

### 0.14.6 (2017-05-16)
* (bluefox) Fix error by groups selection
* (apollon77) fix jqui-dialog for auto-open

### 0.14.3 (2017-05-11)
* (bluefox) fix export/import of grouped widgets

### 0.14.2 (2017-04-29)
* (bluefox) Fix install error

### 0.14.1 (2017-04-27)
* (bluefox) move beta to main
* (bluefox) fix choose filter
* (bluefox) fix error if some views do not exist
* (bluefox) fix binding problem, e.g. "a:-45?0" was detected as variable too.
* (bluefox) fix some font sizes
* (bluefox) fix undo
* (bluefox) fix themes change
* (bluefox) optimize load of pages
* (bluefox) check license
* (bluefox) fix basic views 8
* (bluefox) fix time picker if opened in dialog

### 0.14.0 (2017-04-10)
* (bluefox) add mandatory license input

### 0.12.7 (2017-02-09)
* (bluefox) prepare beta

### 0.12.6 (2017-01-29)
* (pmant) fix view copy
* (pmant) Improvements to context menu
* (pmant) usability improvements for both view dropdowns
* (bluefox) small fix of dragging

### 0.12.6 (2017-01-29)
* (pmant) add dropdown menu to views bar
* (pmant) sort widgets widget selector by name
* (bluefox) fix groupAttr in signals and visibility

### 0.12.2 (2016-12-04)
* (bluefox) fix errors with grouping

### 0.12.1 (2016-11-30)
* (bluefox) fix errors with containers

### 0.12.0 (2016-11-24)
* (bluefox) subscribe mode for faster state loading
* (bluefox) add grouping

### 0.10.15 (2016-11-06)
* (bluefox) remove weather-adapter.html
* (bluefox) clean config.js
* (bluefox) remove old widgets
* (bluefox) improve authentication in app
* (bluefox) allow creation of instance from helper widget

### 0.10.14 (2016-10-09)
* (bluefox) fix rendering of widgets
* (bluefox) working on relative positions.
* (bluefox) destroy widgets before views deletion

### 0.10.13 (2016-09-23)
* (bluefox) fixed errors for iPad 1
* (bluefox) start working on relative positions

### 0.10.12 (2016-09-16)
* (bluefox) group specific visibility of widgets and views

### 0.10.11 (2016-09-15)
* (bluefox) fix for iOS 10
* (bluefox) allow disabling of groups for performance

### 0.10.10 (2016-09-14)
* (bluefox) add text2speech widget
* (bluefox) try to fix problem with iOS 10

### 0.10.9 (2016-09-04)
* (bluefox) support of web-sockets force
* (bluefox) destroy unused views after 30 seconds
* (bluefox) do not show middle leading lines if top and bottom are shown
* (bluefox) let timestamp and last-change to show time as interval

### 0.10.7 (2016-07-09)
* (bluefox) add settings to reload vis
* (bluefox) add dark reload screen
* (bluefox) fix reload interval
* (bluefox) export/import
* (bluefox) add global script
* (bluefox) add 'not exist'/'not consist'/'exist' to signal and visibility
* (bluefox) fix OIDs in editor

### 0.10.5 (2016-06-15)
* (bluefox) fix select ID dialog
* (bluefox) add align help lines
* (bluefox) never store data in non-edit mode

### 0.10.4 (2016-06-14)
* (bluefox) fix drag and resize
* (Patrick) fix QuoJS
* (bluefox) support of milliseconds in formatDate
* (bluefox) support of getHistory
* (bluefox) support of show history instances
* (bluefox) grid
* (bluefox) add previews

### 0.10.3 (2016-05-30)
* (bluefox) update canJS
* (pmant) fixes bugs with dialogs on touchscreens
* (bluefox) speedUP show attributes at 300ms
* (bluefox) fix click on widget if signal is active

### 0.10.2 (2016-05-24)
* (bluefox) fix widgets with timestamps

### 0.10.1 (2016-05-23)
* (bluefox) change version

### 0.10.0 (2016-05-23)
* (bluefox) translates
* (bluefox) fix 'no widgets selected'
* (bluefox) change widget icons
* (bluefox) add signals
* (bluefox) add app.css for cordova
* (bluefox) change icons preview
* (bluefox) show properties of widget as icon
* (bluefox) fix error with external commands
* (bluefox) add types icon to preview
* (bluefox) support edit on iPad1
* (bluefox) change security settings

### 0.9.4 (2016-04-05)
* (bluefox) implement more "close" types
* (bluefox) set height of about window
* (bluefox) rename the upper case datei extensions into a lower case by upload
* (bluefox) reload vis if lost connection for longer than 1 minute

### 0.9.3 (2016-03-23)
* (bluefox) allow onChange for OIDs too
* (bluefox) add quality
* (bluefox) changes for app
* (bluefox) add new flag "render always" in this case this view will be rendered in any way.
* (bluefox) add about dialog
* (bluefox) remove bind(this) to enable it run on iPad1

### 0.9.2 (2016-02-29)
* (bluefox) allow onChange for OIDs too
* (bluefox) show reconnecting process
* (pmant) use new gestures lib
* (bluefox) show project name

### 0.9.1 (2016-02-24)
* (bluefox) fix safary error

### 0.9.0 (2016-02-20)
* (pmant) add guestures
* (bluefox) fix svg bool on touch devices

### 0.8.6 (2016-01-27)
* (bluefox) fix load of project CSS

### 0.8.4 (2016-01-26)
* fix load of user and project CSS

### 0.8.3 (2016-01-21)
* (bluefox) non vis adapters may have widgets too

### 0.8.2 (2015-12-22)
* (bluefox) make yahoo widget work again
* (bluefox) add Welcome Page

### 0.8.1 (2015-12-14)
* (bluefox) remove most of themes
* (bluefox) add cordova

### 0.7.9 (2015-12-07)
* (bluefox) fix "bar-basic"

### 0.7.8 (2015-12-06)
* (bluefox) support flag "always" (to always load the widget set)
* (bluefox) fix error in jqui Container view
* (bluefox) make basic xxx8 to possible have any count of entries
* (bluefox) scroll on basic-iframe
* (bluefox) fix basic - table details
* (bluefox) add refreshOnViewChange for iFrame
* (bluefox) remove "basic - val,bulb" and replace it with "basic - ctrl,bulb" + readOnly flag
* (bluefox) add update on view change for "basic - iFrame"
* (bluefox) remove "bar - Vertical" and replace it with "bar" + "orientation = vertical"
* (bluefox) change calculation for bars. Use min/max instead of factor

### 0.7.7 (2015-11-07)
* (bluefox) move jQueryUI css files

### 0.7.6 (2015-11-05)
* (bluefox) fix version

### 0.7.5 (2015-11-02)
* (bluefox) fix Widget "basic - ctrl Bool Html "
* (bluefox) make red-number working again.
* (bluefox) extend dialog with atuoclose timeout
* (bluefox) add editWidgetNames
* (bluefox) remove jqueryUI files to iobroker.web

### 0.7.4 (2015-10-27)
* (SmilingJack) add "jqui-navigation" with password
* (bluefox) fix jqui-selectValue: write number instead of string
* (bluefox) make all jqui buttons resizable.
* (bluefox) add "image height %" to jqui with icons
* (bluefox) add some features to basic and jqui widgets
* (bluefox) add to jqui option: no jQuiery style.
* (bluefox) make possible to use new line in jqui-buttons
* (bluefox) extend basic-screen resolution with instance information
* (SmilingJack) Remove vkb (for own adapter)

### 0.7.3 (2015-10-18)
* (SmilingJack) expand slider to range slider
* (bluefox) fix Basci-htmlBool, basic-svgbool, basic-val bulb
* (bluafox) add basic-input widget

### 0.7.2 (2015-10-13)
* (bluefox) fix error with view change and click on widget

### 0.7.1 (2015-10-10)
* (bluefox) parse value by ctrl widgets
* (bluefox) update select ID
* (bluefox) add to file upload "file select dialog"
* (bluefox) add browse objects dialog
* (bluefox) fix update container by bindings
* (bluefox) warnings clear

### 0.7.0 (2015-10-05)
* (bluefox) add door_tilt pictures
* (bluefox) update RGraph library
* (bluefox) fix RGraph/ bar chart "Label color" bug
* (bluefox) fix jquery valve dialog
* (bluefox) support of binding like "{;Math.random()}
* (bluefox) remove jqui-mfd to own package
* (bluefox) remove RGraph and fancyswitch sets
* (bluefox) increase wait period by view changes to fix click on the next view
* (bluefox) fix view selector for some jqui dialogs
* (bluefox) remove time and weather
* (bluefox) check some possible error

### 0.6.19 (2015-09-27)
* (bluefox) translate segment clock
* (bluefox) fix slider "dark On/Off" and autoOFF
* (bluefox) support mouseup and mouse down by debouncing
* (bluefox) make url as URL and not as sound selector
* (bluefox) add special variables "view", wname and "wid" to use it in bindings
* (bluefox) update ace editor
* (bluefox) highligh vis in admin
* (bluefox) add to dialogs: position, hide header, scroll settings
* (bluefox) make dialogs work
* (bluefox) add jqui dialog close button
* (bluefox) set maximal height for all select menus
* (bluefox) add setId by opening of dialog

### 0.6.18 (2015-09-24)
(bluefox) add segment clock widget
(bluefox) clear filter button in File Manager
(bluefox) add to fancy switch "autoOff" property
(bluefox) add svg shapes
(bluefox) fix problem with view selection for widget
(bluefox) add new widget "Svg clock"

### 0.6.17 (2015-09-20)
* (bluefox) add fancyswitch-6.png
* (bluefox) add icons for some jqui widgets
* (bluefox) fix some errors in qui and jqui-mfd
* (bluefox) add to Bulb on/off image selector
* (bluefox) fix "ctrl - Icon State / val - Icon Bool"
* (bluefox) fix fileManager.js

### 0.6.16 (2015-09-17)
* (bluefox) add to fancyswitch custom values and light style to german switch
* (bluefox) try to accept for visibility true and false

### 0.6.15 (2015-09-15)
* (bluefox) add Custom10 to jqui-mfd
* (bluefox) ignore "touch" event exactly after the view change

### 0.6.14 (2015-09-13)
* (bluefox) allow change the color of jqui-mfd

### 0.6.13 (2015-08-23)
* (bluefox) update select ID dialog, support of role filter in selectId dialog
* (bluefox) fix Gruntfile.js
* (bluefox) call convertOldHqWidgets by import
* (bluefox) remove prepublish script
* (bluefox) allow for visibility false/0, true/1
* (bluefox) support of import of old hqWidgets

### 0.6.12 (2015-08-14)
* (bluefox) update development packets
* (bluefox) improve table widget (do not try to show functions)
* (bluefox) support of custom set OIDs for metro/toggle, basic/BulbOnOff, jqui-mfd/socketCtrl

### 0.6.11 (2015-08-12)
* (bluefox) improve click bounce detection
* (bluefox) add filter to fileManager
* (bluefox) add file manager to "setup" menu
* (bluefox) fix SVG
* (bluefox) remove: Hide on >0/True, Show on Value, Hide on 0/False, Turning handle, Door/Window sensor
* (bluefox) add all previews in basic

### 0.6.10 (2015-08-11)
- (bluefox) protect against double event: click and touchstart
- (bluefox) implement urlTrue/urlFalse and oidTrue/oirFalse by jqui-mfd/socket 
- (bluefox) remove bars and plumbs
- (bluefox) remove jshint warnings

### 0.6.9 (2015-08-11)
- (bluefox) protect against double event: click and touchstart

### 0.6.8 (2015-08-08)
* (bluefox) all jqui-mfd widgets
          do not background if active and no background desired
          new widget jqui-mfd valve
          change jqui-mfd window (close 0, opened 1, closed 2)
* (bluefox) hide "Name: .." text that sometimes is shown
* (bluefox) use "click touchstart" instead of "click" to enable mobile devices
* (bluefox) fix export/import titles
* (bluefox) add preview to stateful image

### 0.6.7 (2015-08-06)
* (bluefox) fix scroll of view tabs
* (bluefox) add comment about group/byindex
* (bluefox) add update interval to small icon jqui-mfd
* (bluefox) filter key as autocomplete
* (bluefox) fix paths for plumps
* (bluefox) enable install for node-red-vis

### 0.6.5 (2015-07-25)
* (bluefox) fix hqWidgets dimmer
* (bluefox) optimize upload
* (bluefox) catch error after import
* (bluefix) add changeView event (required for lcars)
* (bluefox) fix update of cache.manifest

### 0.6.4 (2015-07-19)
* (bluefox) add permissions
* (bluefox) upload config.js to fix error with vis-metro
* (bluefox) remove hqWidgets and colorpicker
* (bluefox) add jqui-mfd translations
* (bluefox) add "new project" menu

### 0.6.2 (2015-07-01)
- (bluefox) fix metro widgets

### 0.6.1 (2015-06-28)
- (bluefox) fix jqui-mfd
- (bluefox) add prev for "jqui-mfd" dimmer dialog
- (bluefox) fix bars in firefox
- (bluefox) add permissions check
- (bluefox) fix problem with hqWidgets and image selector
* (bluefox) implement list of projects
* (bluefox) case insensitive sorting of views
* (bluefox) set automatically temperature ID of metro Heating
* (bluefox) add max_rows for basic-table
* (bluefox) show label on jqui-toggle
* (bluefox) fix cameras jqui-mfd
* (bluefox) jqui-mfd - remove most of all mfd icons

### 0.5.9 (2015-06-10)
- (bluefox) fix jqui-mfd
- (bluefox) change adapter type from "visualisation" to "vis"
- (bluefox) enable zoom on chrome
- (bluefox) fix close button

### 0.5.8 (2015-06-01)
- (bluefox) add forgotten noise.png for hqWidgets buttons
- (bluefox) jqui dialog fixed
- (bluefox) fixed edit number in FireFox
- (bluefox) create logout button
- (bluefox) fix "basic - table"
- (bluefox) fix jqui-mfd
- (bluefox) fix bars on multiple views

### 0.5.5 (2015-05-26)
- (bluefox) activate try/catch again

### 0.5.4 (2015-05-26)
- (bluefox) add some button styles
- (bluefox) fix conn.js

### 0.5.3 (2015-05-25)
- (bluefox) fix "delete counter"
- (bluefox) fix table "scroll" flag
- (bluefox) do not require minmax for jqui increment
- (bluefox) fix jqui-mfd
- (bluefox) add textarea to HTML edit
- (bluefox) change bar buttons

### 0.5.2 (2015-05-21)
- (bluefox) add "change background" in image dialog
- (bluefox) new widget - basic-table
- (bluefox) update objects in selectID dialog
- (bluefox) fix CSS editor

### 0.5.1 (2015-05-19)
- (bluefox) fix german attribute name for RGraph.html
- (bluefox) store css after edit, enable edition of jquery ui CSS in editor
- (bluefox) fix error if all views have the same jquery style
- (bluefox) fix delete more than one widget
- (bluefox) try to fix fileManager
- (bluefox) fix hqWidgets/Circle if greater than 200px

### 0.5.0 (2015-05-16)
- (bluefox) context menu
- (bluefox) lock widgets
- (bluefox) fix metro 
- (bluefox) add preview in basics

### 0.4.1 (2015-05-13)
- (bluefox) fix error with CanJS

### 0.4.0 (2015-05-12)
- (smiling_Jack) Bugfix View select tabs
- (smiling_Jack) Add a optional attr "data-vis-beta" in tpl set. To show a "!!! Beta !!!" label at the Widgetpreview
- (smiling_Jack) *Add plump set*
- (smiling_Jack) change widget-helper size
- (bluefox) fix error in hqWidgets
- (bluefox) *default view settings*
- (bluefox) new metro Widget iFrame /Dialog
- (bluefox) all metro widgets are revised
- (bluefox) add dev6 as string
- (bluefox) add widget filter
- (bluefox) change style selector
- (bluefox) update canJS to 2.2.4
- (bluefox) send vis.command from browsers with no instanceID
- (bluefox) performance improvement in edit mode (no map of states)

### 0.3.2 (2015-05-09)
- (bluefox) fix errors in binding
- (bluefox) start implement hqWidgets

### 0.3.1 (2015-05-01)
- (bluefox) support of binding with formula "{object;*(2);/(3)}"

### 0.3.0 (2015-05-01)
- (bluefox) enable binding of any attribute of widget to object
- (bluefox) implement export/import of array of widgets (and not only whole views)
- (bluefox) update jquery-ui
- (bluefox) optimize styles of views

### 0.2.15 (2015-04-26)
- (bluefox) fix error with bars

### 0.2.14 (2015-04-26)
- (bluefox) Add BARS
- (bluefox) Add "accordion" to properties of widget
- (bluefox) Better import 
- (bluefox) Fix error with lock-widget zindex and the Color Select Dialog and the Image Select Dialog
- (bluefox) Switch Tab to widget, when widget is selected

### 0.2.13 (2015-04-20)
- (smiling_Jack) Bugfix View Size
- (smiling_Jack) Add "_project" view
- (smiling_Jack) Add VBK Widget Set
- (smiling_Jack) Working on Plumb Widget Set
- (smiling_Jack) Working on Plumb Widget Set
- (smiling_Jack) some small Bugfix
- (smiling_Jack) remove animation on add Widget by Drag&Drop
- (smiling_Jack) fm_manager safety function vor sandbox

### 0.2.12 (2015-04-14)
- (bluefox) fix jqui radio
- (bluefox) add to created objects "native"
- (bluefox) fix metro heating
- (bluefox) fix installation process

### 0.2.11 (2015-03-11)
- (bluefox) fix install for iobroker. Required newest ioBroke.js-controller

### 0.2.10 (2015-03-09)
- (bluefox) fix install for node-red-vis

### 0.2.8 (2015-03-08)
- (bluefox) fix the version numbers

### 0.2.7 (2015-03-08)
- (SmilingJack) add css editor
- (SmilingJack) bugfix zoom
- (SmilingJack) Bugfix select view menu
- (bluefox) read last change of the state by start
- (bluefox) fix formatDate and short year

### 0.2.6 (2015-03-03)
- (bluefox) change shutter in metro
- (bluefox) fix jqui- Select List

### 0.2.5 (2015-03-03)
- (bluefox) fix lock interaction with widgets
- (bluefox) add visibility dependency for every widget
- (bluefox) change shutter in metro
- (SmilingJack) Bugfix View theme select
- (SmilingJack) Bugfix widget Align
- (bluefox) use showWidgetHelper instead of direct editing of "widget_helper"
- (bluefox) add px for width and radius of border
- (bluefox) decrease size of widget_helper (selection frame)
- (bluefox) fix "time stamp" and "last change" widgets


### 0.2.4 (2015-02-22)
- (bluefox) create some previews
- (bluefox) fix error with color editor.css
- (bluefox) new lcars widget - End
- (bluefox) show images in selectID dialog
- (bluefox) fix jqui buttons


### 0.2.3 (2015-02-21)
- (bluefox) add tooltips to buttons
- (bluefox) fix view container widgets
- (SmilingJack) fix error with align of widgets
- (bluefox) lcars/metro/jqui/basic
- (bluefox) fix move with arrows
- (bluefox) lcars.html
- (bluefox) update RGraph
- (bluefox) update license text
- (bluefox) add RGraph
- (bluefox) show images in selectID dialog

### 0.2.2 (2015-02-17)
- (smiling_Jack) align icons
- (bluefox) support of sayIt and control
- (smiling_Jack) show color in edit
- (smiling_Jack) show settings in full screen mode


### 0.2.1 (2015-02-14)
- (smiling_Jack) widget lock & no Drag
- (bluefox) fix yahoo weather widget and resizeable
- (bluefox) fix undo
- (smiling_Jack) Safari 6.0 prefix and OSX bug fixing
- (bluefox) fix duplicate widgets
- (bluefox) change ValueList HTML 8
- (smiling_Jack) color attribute preview

### 0.2.0 (2015-02-12)
- (smiling_Jack) widget preview icons
- (bluefox) fixed many bugs
- (bluefox) multiedit (many widgets can be edited together)

### 0.1.0 (2015-01-31)
- (smiling_Jack) New Editor
- (bluefox) new features (many and small)

### 0.0.8 (2015-01-24)
- (smiling_Jack) New Editor

### 0.0.7 (2015-01-18)
- (bluefox) image select dialog is connected

### 0.0.6 (2015-01-14)
- (bluefox) add update interval to basic/static-HTML

### 0.0.5 (2015-01-13)
- (bluefox) fancybuttons and metro

### 0.0.4 (2015-01-06)
- (bluefox) support of file manager

### 0.0.3 (2015-01-03)
- (bluefox) npm install

### 0.0.1 (2014-12-28)
- (bluefox) initial checkin

## License
 Copyright (c) 2013-2015 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 Creative Common Attribution-NonCommercial (CC BY-NC)

 http://creativecommons.org/licenses/by-nc/4.0/

![CC BY-NC License](https://github.com/GermanBluefox/DashUI/raw/master/images/cc-nc-by.png)

Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
