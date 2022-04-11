## Todo

### Palette
- Show widgets in palette by group
- Allow for one widget to show the detailed information with screenshot (i18n): many texts (HTML) and one picture (on none)
- Add widget from palette
- Close all groups / open all groups
- Take in count new react widget types => onLoaded([])

### View
- Delete widget
- Copy/paste/cut widget (With preview)
- Move with keyboard (with shift and without)
- Show rulers lines by moving of widget (red lines)
- Show screen resolution
- Grid and snap to grid
- Align buttons in toolbar
- Copy/paste/Cut buttons in toolbar
- Export/Import widget
- Rename button near Widget selector to "clone widgets" instead of copy widget
- Lock/Unlock widget
- Context menu
- Bring to front / Send back (Max z-index is 1199)
- Undo!!/Redo
- Ctrl+A / Esc(Deselect all) / ...
- If dimension is in % so after resize and move it should stay in %
- Ask about not saved file (because of 1 sec delay)

## groups edit


### Widget
- By edit widget, if someone enters URL that starts with the same `http(s)://hostname:port/(vis/)data.html` ask to short to `(vis/)data.html`
- [Gestures] (do not implement)
- Last change ? Denis
- Signal by Rx

### Runtime
#### Engine
- Bindings in View settings

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

### New widget set - material like
- Group of relative widgets
- Lamp
- Window
- Jalousie
- Door
- Slider
- ...
- Side menu with views
- Add widgets from material adapter

### Wizard for new widget set


## Documentation CAN
https://v2.canjs.com/docs/can.view.html