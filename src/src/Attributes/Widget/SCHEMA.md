# Explanation of getWidgetInfo
## Example
```
class MyWidget extends Generic {
  // ...
     static getWidgetInfo() {
        return {
            id: 'tplMaterial2Switches',                      // Unique widget type ID. Should start with `tpl` followed by unique widget set ID.
            visSet: 'vis-2-widgets-material',                // Unique ID of widget set 
            visSetLabel: 'vis_2_widgets_material_set_label', // Label of widget set. it is enough to set label only in one widget of set
            visSetColor: '#0783ff',                          // Color of widget set. it is enough to set color only in one widget of set
            visName: 'Switches',                             // Name of widget
            visWidgetLabel: 'vis_2_widgets_material_switches_or_buttons', // Label of widget
            visWidgetColor: '#005cc4',                       // Optional widget color. If not set, default color of widget set will be used.
            visResizeLocked: true,                           // require, that width is always equal to height
            visResizable: false,                             // widget is not resizable 
            visDraggable: false,                             // widget is not draggable 
            visOrder: 1,                                     // order of widget in palette
            visAttrs: [
                {
                    name: 'common', // group name
                    fields: [
                        {
                            name: 'name',
                            label: 'vis_2_widgets_material_name',
                        },
                        {
                            name: 'count',
                            type: 'number',
                            default: 2,
                            label: 'vis_2_widgets_material_count',
                            onChange: (field, data, changeData) => changeData(data),
                        },
                        {
                            name: 'type',
                            type: 'select',
                            label: 'vis_2_widgets_material_type',
                            options: [
                                {
                                    value: 'switches',
                                    label: 'vis_2_widgets_material_switches'
                                },
                                {
                                    value: 'buttons',
                                    label: 'vis_2_widgets_material_buttons'
                                }
                            ],
                            default: 'switches',
                        },
                    ],
                },
                {
                    name: 'switch', // name of custom group
                    label: 'vis_2_widgets_material_group_switch', // label of custom group
                    indexFrom: 1, // optional start index of iterator
                    indexTo: 'count', // if indexFrom is defined, indexTo is required and could be a number or a name of attribute in same widget
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                            label: 'vis_2_widgets_material_oid',
                        },
                        {
                            name: 'title',
                            type: 'text',
                            label: 'vis_2_widgets_material_title',
                            hidden: '!!data["oid" + index]',
                            onChange: (field, data, changeData, index) => changeData(data), // index only if indexFrom and indexTo are defined
                        },
                    ],
                }
            ],
            visDefaultStyle: { // default style
                width: 240,
                height: 120
            },
            visPrev: 'widgets/vis-2-widgets-material/img/prev_switches.png', // preview image
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() { // this function is MANDATORY in widget class and has ALWAYS to be implemented in such a way
        return Switches.getWidgetInfo();
    }
    
    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        
        return <div>Custom</div>;
    }
```

## Common settings
- `id`: [mandatory] Unique widget type ID. Should start with `tpl` followed by unique widget set ID.
- `visSet`: [mandatory] Unique ID of widget set
- `visSetLabel`: Label of the widget set. It is enough to set label only in one widget of the set
- `visSetColor`: Color of the widget set. It is enough to set color only in one widget of the set
- `visName`: [mandatory] Name of the widget
- `visWidgetLabel`: Label of the widget
- `visWidgetColor`: color of the widget 
- `visAttrs`: Groups with attributes.

## Group
`visAttrs` consist of groups.

Group can have the following attributes:
- `name`: name of the group. There are some predefined groups: `common`, `visibility`, `fixed`, `signals`, `css_common`, `css_font_text`, `css_background`, `css_border`, `css_shadow_padding`, `gestures`, `last_change`, `echarts`. Avoid using of all reserved group names except `common`.
- `label`: Translated label of the group. Like `vis_2_widgets_material_group_switch`. Label is not required for `common` group.
- `indexFrom`: [optional] start index of iterator
- `indexTo`: [optional] if `indexFrom` is defined, `indexTo` is required and could be a number or a name of attribute in same widget.
- `fields`: Array of fields. See the next chapter
- `hidden`: [optional] JS code to calculate the hidden state of the attribute. Or real function in form `function (data, index, style) => boolean`.

## Fields
`visAttrs[x].fields` consist of input fields.

- `name`: [mandatory] Attribute name to be stored in data
- `label`: [optional] Label to be displayed in the UI. If you want to have empty label, set it to "".
- `tooltip`: [optional] Tooltip of the label (small "i" symbol appears next to text)
- `default`: [optional] default initial value
- `hidden`: [optional] JS code to calculate the hidden state of the attribute. Or real function in form `function (data, index, style) => boolean`.
   Example `!!data["oid" + index]` or `data.type !== "digital" && data.type !== "digital2"`.
- `disabled`: [optional] JS code to calculate the error state of the attribute. Syntax is the same as `hidden`. You can set it permanently to `true`.
- `error`: [optional] JS code to calculate the error state of the attribute. Syntax is the same as `hidden`, but you may return string instead of boolean.
- `component`: in development
- `noBinding`: [optional] if true, no binding button will be shown for this attribute
- `onChange`: [optional] Script, that will be called, when value of attribute will be changed. Example: 
```
onChange: async (field, data, changeData, socket) => {
    const object = await socket.getObject(data[field]);
    if (object && object.common) {
        data.name = typeof object.common.name === 'object' ? object.common.name[I18n.getLanguage()] || object.common.name.en : object.common.name;
    } else {
        data.name = data[field].split('.').pop();
        data.withStates = false;
    }
    changeData(data);
},
```
- `type`: default value is '' and just an input field. It can have the following values:
  - `instance` - Instance selector. It could have additional settings: 
     - `adapter` - [optional] Additionally, you can provide `adapter` to filter the instances of specific adapter. With special adapter name `_dataSources` you can get all adapters with flag `common.getHistory`.
     - `isShort` - [optional] In this case only instance number (like `0`) is shown and not `history.0`. It can be set to true only with non-empty `adapter` setting.
  - `number` - Number input. It could have additional settings:
    - `min` - [optional] minimum value
    - `max` - [optional] maximum value
    - `step` - [optional] step value
  - `password` - Input in form `****`
  - `image` - Image selector from ioBroker Database
  - `icon` - 
  - `id` - Object ID
    - `noInit` - [optional] Do not write 'nothing_selected' into the field by creation
    - `noSubscribe` - [optional] Do not subscribe on changes of the object
    - `filter` - [optional] Filter of objects (not JSON string, it is an object), like:
      - `{common: {custom: true}}` - show only objects with some custom settings
      - `{common: {custom: 'sql.0'}}` - show only objects with sql.0 custom settings (only of the specific instance)
      - `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
      - `{common: {custom: 'adapterName.'}}` - show only objects of the custom settings for specific adapter (all instances)
      - `{type: 'channel'}` - show only channels
      - `{type: ['channel', 'device']}` - show only channels and devices
      - `{common: {type: 'number'}` - show only states of type 'number
      - `{common: {type: ['number', 'string']}` - show only states of type 'number and string
      - `{common: {role: 'switch']}` - show only states with roles starting from switch
      - `{common: {role: ['switch', 'button]}` - show only states with roles starting from `switch` and `button` 
  - `history` - Selector of objects with history. It has predefined filter `{common: {custom: '_dataSources'}}`
  - `hid` - Same as `history`
  - `checkbox` - Checkbox
  - `dimension` - Input field with `px`, `%` - Used for styles like `width`, `height`
  - `color` - Color picker
  - `slider` - Slider. It could have additional settings:
    - `min` - [mandatory] minimum value
    - `max` - [mandatory] maximum value
    - `step` - [optional] step value, by default 1
    - `marks` - [optional] array of possible marks. Like `[{value: 1, label: 'one'}, {value: 10}, {value: 100}]`
    - `valueLabelDisplay` - [optional] `auto`, `on`, `off`. Controls when the value label is displayed: `auto` the value label will display when the thumb is hovered or focused. `on` will display persistently. `off` will never display.
  - `select` - Dropdown menu with options. All options will be translated.
    - `options` - [mandatory] array of options. Like `[{value: 1, label: 'auto'}, {value: 2, label: 'manual'}]` or `['auto', 'on', 'off']`
    - `noTranslation` - [optional] if true, options will not be translated.
  - `nselect` - Same as `select` but values will not be translated and `options` can be only like `['auto', 'on', 'off']` 
  - `fontname` - Font selector
  - `effect` - Effect selector. One of `['','show','blind', 'bounce', 'clip', 'drop', 'explode', 'fade', 'fold', 'highlight', 'puff', 'pulsate', 'scale', 'shake', 'size', 'slide']`. It used for old jQuery widgets.
  - `widget` - Widget ID selector. It could have additional settings:
    - `tpl` - [optional] type of the widget, like `tplMaterial2Switches`
    - `all` - [optional] if true, all widgets of all views will be shown, not only from the current view. Default is false.
    - `withGroups` - [optional] if true, grouped widgets will be shown too. Default is false.
    - `withSelf` - [optional] if true, current widget will be shown in the list too.
    - `checkUsage` - [optional] if true, it will be checked if the widget is used somewhere else and user will be asked.
    - `hideUsed` - [optional] if true, only widgets will be shown, which are not used in some view. Default is false.
  - `select-views` - Select view via the drop-down menu with folders.
    - `multiple` - [optional] if false, only one view can be selected. Default is true. 
  - `groups` - Selects a user group
  - `auto` - Autocomplete. It must have additional settings:
    - `options` - [mandatory] array of options. Like `['auto', 'on', 'off']`
  - `class` - CSS class selector
  - `filters` - Filter selector. If some widgets have field `filter` set, whit field will collect all possible filters and represent it as auto-complete field.
  - `views` - Select view via auto-complete input.
  - `style` - Drop-down menu with all possible styles. ?
  - `custom` - Custom field editor. See [below](#custom-field-editor)
  - `text` - Input field with Edit dialog.
    - `noButton` - [optional] if true, no edit button will be shown. Default is true. 
  - `html` - Input field with Edit dialog and parsing of HTML code
    - `multiline` - show multi-line editor
  - `json` - Input field with Edit dialog and parsing of JSON code
    - `multiline` - show multi-line editor
  - `icon64` - Select from predefined material icons as base64 (svg)
  - `help` - show help text
    - `text` - [required] This text will be shown without a label
    - `noTranslation` - [optional] if true, the text will not be translated
    - `style` - [optional] this style will be applied to the text
  - `delimiter` - just line between fields

### Custom field editor
Example of custom field
```
{
    name: 'customField',
    label: 'vis_2_widgets_basic_custom',
    type: 'custom',  // important
    component: (     // important
        field,       // field properties: {name, label, type, set, singleName, component,...}
        data,        // widget data
        onDataChange,// function to call, when data changed 
        props,       // additional properties : {socket, projectName, instance, adapterName, selectedView, selectedWidgets, project, widgetID}
                     // widgetID: widget ID or widgets IDs. If selecteld more than one widget, it is array of IDs
                     // project object: {VIEWS..., [view]: {widgets: {[widgetID]: {tpl, data, style}}, settings, parentId, rerender, filterList, activeWidgets}, ___settings: {}}
    ) => <TextField
        fullWidth
        value={data[field.name]}
        onChange={e => {
            onDataChange({ [field.name]: e.target.value }); // returns all changed field as object.
            // If some property is null, so it will be deleted from data
        }}
    />,
}
```
