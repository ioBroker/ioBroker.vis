![Logo](admin/vis.png)
ioBroker.vis
============

WEB visualisation for ioBroker platform.

## Installation & Dokumentation

![Demo interface](https://github.com/GermanBluefox/DashUI/raw/master/images/user0.png)
![Demo interface](https://github.com/GermanBluefox/DashUI/raw/master/images/user7.png)

[Online Demos](http://dashui.ccu.io)

## Bindings of objects
Normally most of widgets have ObjectID attribute. And this attribute can be bound with some value of object ID.
But there is another option how to bind *any* attribute of widget to some ObjectID. 

Just write into attribute ```{object.id}``` and it will be bound (not in edit mode) to this object's value. 
If you will use special format, you can even make some simple operations with it, e.g. multiplying or formatting.
Patten has following format:

```
{objectID;operation1;operation2;...}
```

Following operations are supported:

- \* - multiplying. Argument must be in brackets, like "*(4)". In this sample we multiplying value with 4.
- \+ - add. Argument must be in brackets, like "+(4.5)". In this sample we add to value 4.5.
- \- - subtract. Argument must be in brackets, like "-(-674.5)". In this sample we subtract from value -674.5.
- / - dividing. Argument must be in brackets, like "/(0.5)". In this sample we dividing value by 0.5.
- % - modulo. Argument must be in brackets, like "%(5)". In this sample we take modulo of 5.
- round - round the value.
- round(N) - round the value with N places after point, e.g. 34.678;round(1) => 34.7
- hex - convert value to hexadecimal value. All letters are lower cased. 
- hex2 - convert value to hexadecimal value. All letters are lower cased. If value less 16, so the leading zero will be added.
- HEX - same as hex, but upper cased.
- HEX2 - same as hex2, but upper cased.
- date - format date according to given format. Format is the same as in [ioBroker.javascript](https://github.com/ioBroker/ioBroker.javascript/blob/master/README.md#formatdate)
- min(N) - if value is less than N, take the N, elsewise value
- max(M) - if value is greater than M, take the M, elsewise value
- sqrt - square root
- pow(n) - power of N.
- pow - power of 2.
- floor - Math.floor
- ceil - Math.ceil
- random(R) - Math.random() * R, or just Math.random() if no argument

You can use this pattern in any text, like

```
My calculations with {objectID1;operation1;operation2;...} are {objectID2;operation3;operation4;...}
```

or color calculations:

```
#{objectRed;/(100);*(255);HEX2}{objectGreen;HEX2}{objectBlue;HEX2}
```

To show timestamp of object write ".ts" or ".lc" (for last change) at the end of object id, e.g.:

```
Last change: {objectRed.lc;date(hh:mm)}
```

There is another possibility to write pattern:

```
Hypotenuse of {height} and {width} = {h:height;w:width;Math.max(20, Math.sqrt(h*h + w*w))}
```

```{h:height;w:width;h*w}``` will be interpreted as function:

```
value = (function () {
    var h = "10";
    var w = "20";
    return Math.max(20, Math.sqrt(h*h + w*w));
})();
```

You can use *any* javascript functions. Arguments must be defined with ':', if not, it will be interpreted as formula.

Take care about types. All of them defined as strings. To be sure, that value will be treated as number use parseFloat function.

```
Hypotenuse of {height} and {width} = {h:height;w:width;Math.max(20, Math.sqrt(Math.pow(parseFloat(h), 2) + Math.pow(parseFloat(w), 2)))}
```

Note: there is a special object ID - "username". It shows logged in user. 
      And there is a "language" object id: can be "de", "en" or "ru".
      "view" - has a name of actual view
      "wid" - has a name of actual widget
      "wname" - widget name
	  "widget" - is an object with all data of widget. Can be used only in JS part, like {a:a;widget.data.name}
Note: to use ":" in calculatinos (e.g. in string formula) use "::" instead.

## Filters
To visualise on the one view thw whole number of widgets you can use filters to reduce the amount of widgets simultaneously shown on the view.
 
Every widget has a field "filter". If you set it to some value, e.g. "light", so you can use other widget (bars - filters, filter - dropdown) to control which filter is actually active. 

## Control interface
Vis creates 3 variables:

- control.instance - Here the browser instance should be written or FFFFFFFF if every browser must be controlled.
- control.data     - Parameter for command. See specific command description.
- control.command  - Command name. Write this variable triggers the command. That means before command will be written the "instance" and "data" must be prepared with data.

Commands:

* alert - show alert window in vis. "control.data" has following format "message;title;jquery-icon". Title and jquery-icon are optional. Icon names can be found [here](http://jqueryui.com/themeroller/). To show icon "ui-icon-info" write ```Message;;info```.
* changeView - switch to desired view. "control.data" must have name of view. You can specify project name too as "project/view". Default project is "main".
* refresh - reload vis, for instance after project is changed to reload on all browsers.
* reload - same as refresh.
* dialog - Show dialog window. Dialog must exist on view. One of:

    - "static    - HTML    - Dialog",
    - "static    - Icon    - Dialog",
    - "container - HTML    - view in jqui Dialog",
    - "container - ext cmd - view in jqui Dialog",
    - "container - Icon    - view in jqui Dialog",
    - "container - Button  - view in jqui Dialog".

    "control.data" must have id of dialog widget, e.g. "w00056".
* popup - opens a new browser window. Link must be specified in "control.data", e.g. http://google.com
* playSound - play sound file. The link to file is specified in "control.data", e.g. http://www.modular-planet.de/fx/marsians/Marsiansrev.mp3.
  You can upload your own file in vis and let it play as for instance "/vis.0/main/img/myFile.mp3".

If user changes the view or at start the variables will be filled by vis with

- "control.instance": browser instance and ack=true
- "control.data": project and view name in form "project/view", e.g. "main/view" (and ack=true)
- "control.command": "changedView" and ack=true

You can write the JSON-string or Object into control.command as ```{instance: 'AABBCCDD', command: 'cmd', data: 'ddd'}```. In this case the instance and data will be taken from JSON object.

## Default view
You can define for every view the desired resolution (Menu=>Tools=>Resolution). This is only the visual border in edit mode to show you the screen size on some specific device. In real time mode it will not be visible and all widgets outside of border will be visible.  

Additionally you can define if this view must be used as default for this resolution. 

So every time the **index.html** (without #viewName) is called, the best suitable for this resolution view will be opened. 
If only one view has *"Default"* flag, so this view will be opened independent from screen resolution or orientation.      

E.g. you can create two views "Landscape-Mobile" and "Portrait-Mobile" and these two views will be switched automatically when you change the orientation or screen size.

There is a helper widget "basic - Screen Resolution" that shows actual screen resolution and best suitable default view for this resolution. 

## Changelog
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
- (bluefox) fix install for ioBroker. Required newest ioBroke.js-controller

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
