## Todo
- ✅ Reload all vis instances by file subscribe (could be disabled by config)

### Palette
- ✅ Show widgets in palette by group
- ✅ Allow for one widget to show the detailed information with screenshot (i18n): many texts (HTML) and one picture (on none)
- ✅ Add widget from palette
- ✅ Close all groups / open all groups
- ✅ Take in count new react widget types => onLoaded([])

### View
- ✅ Delete widget (With suppress dialog)
- ✅ Copy/paste/cut widget (With preview) - !cut does not work sometimes (BF: Check deletion of widget)
- ✅ Move with keyboard (with shift and without) - !somehow does not work
- ✅ Show rulers lines by moving of widget (red lines) - !on key press?
- ✅ Show screen resolution - !bug
- ✅ Grid and snap to grid - if enabled, the background disappeared - !6px
- ✅ Align buttons in toolbar
- ✅ Copy/paste/Cut buttons in toolbar
- ✅ Export/Import widget - preselect text or make it empty - !group export
- ✅ Rename button near Widget selector to "clone widgets" instead of copy widget
- ✅ Lock/Unlock widget
- ✅ Remove show interaction - and replace with show widget ID 
- ✅ Context menu - collect all widgets under cursor and show them in context menu
- ✅ Bring to front / Send back (Max z-index is 1199)
- ✅ Undo!!/Redo
- ✅ Ctrl+A / Esc(Deselect all) / ...
- ✅ If dimension is in % so after resize and move it should stay in %
- ✅ Ask about not saved file (because of 1 sec delay)
- [ ] Allow selection of background image and x-offset, y-offset, opacity, repeat, size

## groups edit
- ✅ Check

### Widget
- ✅ By edit widget, if someone enters URL that starts with the same `http(s)://hostname:port/(vis/)data.html` ask to short to `(vis/)data.html`

- [Gestures] (do not implement)
- Last change by Rx
- Signal by Rx

### Runtime
#### Engine
- ✅ Bindings in View settings

### Toolbar
- ✅ 3 Levels of visibility:
    - ✅ opened full (as now)
    - ✅ middle (without titles "Views of main", "Widgets", "Projects")
    - ✅ narrow (only important buttons: add view, active widgets, align - only one line) and user/theme/mode on one line

### use react-rnd
- POC ?

### Backend by start
- ✅ Collect enabled widgets and pack all of them into widgets.html
- ✅ Do not copy widgetName.html into widgets folder
- ✅ Remove unused widget folders

### Edit widgets
- ✅ Old `onChangeFunc` should work

### Widgets
All widgets from vis.1 must work in vis.2 or rewritten in react
- Basic
- bars
- ...

### New widget set - material like
- Add widgets from material adapter

### Wizard for new widget set


## Documentation CAN
https://v2.canjs.com/docs/can.view.html