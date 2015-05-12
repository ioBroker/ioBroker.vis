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

    - "static - HTML - Dialog",
    - "static - Icon - Dialog",
    - "container - HTML - view in jqui Dialog",
    - "container - ext cmd - view in jqui Dialog",
    - "container - Icon - view in jqui Dialog",
    - "container - Button - view in jqui Dialog".

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
### 0.4.0 (2015-05-09)
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
