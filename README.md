![Logo](admin/vis.png)
ioBroker.vis
============

WEB visualisation for ioBroker platform.

## Changelog
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

## Installation & Dokumentation

![CC BY-NC License](https://github.com/GermanBluefox/DashUI/raw/master/images/user0.png)
![CC BY-NC License](https://github.com/GermanBluefox/DashUI/raw/master/images/user7.png)

[Online Demos](http://dashui.ccu.io)

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



## Licence
 Copyright (c) 2013-2015 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 Creative Common Attribution-NonCommercial (CC BY-NC)

 http://creativecommons.org/licenses/by-nc/4.0/

![CC BY-NC License](https://github.com/GermanBluefox/DashUI/raw/master/images/cc-nc-by.png)

Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
