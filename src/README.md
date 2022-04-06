## Todo
### Palette
- Show widgets in palette by group
- Add widget from palette
- Close all groups / open all groups

### Runtime
#### Engine
- showMessage method in vis
- onWakeUp method in vis
- changeView method in vis
- changeFilter method in vis
- detectBounce method in vis
- addFont method in vis
- relative position

### View
- Delete widget
- Copy/paste/cut widget
- Move with keyboard (with shift and without)
- Show rulers lines by moving of widget (red lines)
- Show screen resolution
- Grid and snap to grid
- Align buttons in toolbar
- Copy/paste/Cut buttons in toolbar
- Export/Import widget
- Rename button near Widget selector to "clone widgets" instead of copy widget
- If no widgets selected - switch tab from "Widget" to "View" on the right and make "Widget" Tab disabled
- By selecting of widget - jump to "widget" tab on the right 
- Lock/Unlock widget
- Context menu
- Bring to front / Send back
- Undo!!

### Widget
- Gestures
- Last change
- By edit widget, if someone enters URL that starts with the same `http(s)://hostname:port/(vis/)data.html` ask to short to `(vis/)data.html`

## groups edit

### Toolbar
- 3 Levels of visibility:
    - opened full (as now)
    - middle (without titles "Views of main", "Widgets", "Projects")
    - narrow (only important buttons: add view, active widgets, align - only one line) and user/theme/mode on one line

### Backend by start
- Collect enabled widgets and pack all of them into widgets.html
- Do not copy widgetName.html into widgets folder
- Remove unused widget folders

### Widgets
All widgets from vis.1 must work in vis.2 or rewritten in react
- Basic
- bars
- ...
- jQui - load correspond theme

### New widget set - material like
- Lamp
- Window
- Jalousie
- Door
- Slider
- ...
- Side menu with views

### Wizard for new widget set


## Documentation CAN
https://v2.canjs.com/docs/can.view.html