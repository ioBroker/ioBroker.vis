/*
hqWidgets is a “high quality” home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button – To present and/or control some switch (e.g. Lamp)
- Dimmer – To present and control dimmer
- Window blind – to present and control one blind and display up to 4 window leafs
- Indoor temperature – to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature – to display outdoor temperature and humidity
- Door – to present a door
- Lock – to present and control lock
- Image – to show a static image
- Text – to show a static text with different colors and font styles
- Info – To display some information. Supports format string, condition for active state and different icons for active and static state.
 
 Known problems: 
 - Dimmer does not work on mobile devices
 
------ Version V0.1 ------
 
 
----
Used software:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
 
 
Copyright (c) 2013 Denis Khaev deniskhaev@gmail.com
 
It is licensed under the Creative Commons Attribution-Non Commercial-Share Alike 3.0 license.
The full text of the license you can get at http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode
 
Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may distribute derivative works only under a license identical to the license that governs the original work.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
*/


// Main object and container
var hqWidgets = {
    gOptions: {
        // ======== Global variables ============
        gBtWidth:      45,          // Width of the button >= gBtHeight
        gBtHeight:     45,          // Height of the button
        gBtIconWidth:  32,          // Width of the icon of button
        gBtIconHeight: 32,          // Heigth of the icon of button
        gPictDir:      "img/",      // Pictures directory
        gLocale:       'de',        // Localisation for float formatting
        gGetImages:    null,        // Callback function to get the list of images (used only if hqUtils used)
                                    // getImages (callback, userParam) - callback must be called as the image list received from server  
                                    // like callback (imageList, userParam);
                                    // e.g. "function GetImages (callback, param) { if (callback) callback (aImages, param); }"
    },
    // Button states
    gState: {
        gStateUnknown :0,
        gStateOn      :1, // On
        gStateOff     :2, // Off
    },   
    // Button Types
    gButtonType: {
        gTypeButton : 0,
        gTypeInTemp : 1,
        gTypeOutTemp: 2,
        gTypeBlind  : 3,
        gTypeLock   : 4,
        gTypeDoor   : 5,
        gTypeInfo   : 6,
        gTypeHeat   : 7,   // Force mode of heater
        gTypeMotion : 8,   // Motion Detector
        gTypePhone  : 9,   // Phone
        gTypeImage  : 10,  // e.g. Background
        gTypeText   : 11,  // movable text
        gTypeDimmer : 12,  // Dimmer
    },
    gWindowState: {
        // State of the leaf
        gWindowClosed: 0,
        gWindowOpened: 1,
        gWindowToggle: 2,
        gWindowUpdate: 3,
    },
    gSwingType: {
        // Type of the leaf
        gSwingDeaf:  0, // Window or door cannot be opened
        gSwingLeft:  1, // Window or door opened on the right side
        gSwingRight: 2, // Window or door opened on the left side
    },
    gLockType: {
        gLockClose:    0, // Command to close lock
        gLockOpen:     1, // Command to open lock
        gLockOpenDoor: 2, // Command to open door
    },
    gDlgResult: {
        // Dialog result
        gDlgClose:    0,
        gDlgOk:       1,
        gDlgCancel:   2,
        gDlgYes:      3,
        gDlgNo:       4,
        gDlgInvalid: -1,
    },
    gDynamics: {
        gRightClickDetection : null,    // Timer to detect the right click
        gIsTouch             : false,   // Is touch event
        gActiveSlider        : null,    // Active slider
        gActiveElement       : null,    // Actual moved element
        gShownBig            : null,    // Shown big window element (blind or lock)
        gActiveBig           : null,    // Active (Changin) big window element (blind or lock)
        gActiveMenu          : null,    // Active Menu
        gIsEditMode          : false,   // Move the buttons
        gDivID               : 0,       // Used for div name generation
        gBodyStyle           : "",      // Body class
        gElements            : new Array(),
    },
    Translate: function (text) {
        return text;
    },
    TempFormat: function (t){
        var tStr = parseFloat(Math.round(t * 10) / 10).toFixed(1) + "";
        if (this.gOptions.gLocale != 'de' && 
            this.gOptions.gLocale != 'ru')
            return tStr;
        else
            return tStr.replace (".", ",");
    },
    Clone: function (obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    },
    // Internal functions
    // On mouse up event handler
    onMouseUp: function (isTouch) {
        if (this.gDynamics.gActiveElement != null)
        {
            this.gDynamics.gActiveElement.OnMouseUp ();		
            this.gDynamics.gActiveElement = null;
        }
        else
        if (this.gDynamics.gActiveBig!=null)
        {
            this.gDynamics.gActiveBig.ShowBigWindow(false);
            this.gDynamics.gActiveBig.SendPercent ();
            this.gDynamics.gActiveBig=null;		
        }
        if (this.gDynamics.gActiveSlider!=null)
        {
            //this.gDynamics.gActiveSlider.SendPosition ();
            this.gDynamics.gActiveSlider=null;		
        }
        this.gDynamics.gIsTouch = false;
    },
    // On mouse move handler
    onMouseMove: function (x_, y_) {
        if (this.gDynamics.gActiveElement != null)
            this.gDynamics.gActiveElement.OnMouseMove (x_,y_);
        else
        if (this.gDynamics.gActiveBig != null)
            this.gDynamics.gActiveBig.settings._jbigWindow.OnMouseMove (x_,y_);//.SetPositionOffset(y_ - this.gDynamics.gActiveBig.cursorY);
        else
        if (this.gDynamics.gActiveSlider != null) 
            this.gDynamics.gActiveSlider.OnMouseMove(x_, y_);
    },
    // Convert button type to string
    Type2Name: function  (t) {
        switch (t)
        {
        case this.gButtonType.gTypeButton: return this.Translate("Button");
        case this.gButtonType.gTypeInTemp: return this.Translate("In. Temp.");
        case this.gButtonType.gTypeOutTemp:return this.Translate("Out. Temp.");
        case this.gButtonType.gTypeBlind:  return this.Translate("Blind");
        case this.gButtonType.gTypeLock:   return this.Translate("Lock");
        case this.gButtonType.gTypeDoor:   return this.Translate("Door");
        case this.gButtonType.gTypeInfo:   return this.Translate("Info");
        case this.gButtonType.gTypeHeat:   return this.Translate("Heater");
        case this.gButtonType.gTypeMotion: return this.Translate("Motion");
        case this.gButtonType.gTypePhone:  return this.Translate("Phone");
        case this.gButtonType.gTypeDimmer: return this.Translate("Dimmer");
        case this.gButtonType.gTypeImage:  return this.Translate("Image");
        case this.gButtonType.gTypeText:   return this.Translate("Text");
        default: return "";
        }
    },
    // Add created button object to the list
    Add: function (newCreatedButton) {
        var i=0;
        while (this.gDynamics.gElements[i])
        {
            if (this.gDynamics.gElements[i] == newCreatedButton)
                return newCreatedButton;
            i++;
        }
        this.gDynamics.gElements[i] = newCreatedButton;
        return newCreatedButton;
    },
    // Get button by elemName
    Get: function (buttonName) {
        var i=0;
        while (this.gDynamics.gElements[i])
        {
            if (this.gDynamics.gElements[i].advSettings.elemName == buttonName) {
                return this.gDynamics.gElements[i];
            }
            i++;
        }
        return null;
    },
    // Delete button from the list
    Delete: function (buttonToDelete) {
        console.log ("Delete " + buttonToDelete);
        if (buttonToDelete.settings == undefined) {
            // May be this is te name of the div element
            buttonToDelete = this.Get (buttonToDelete);
        }
        if (buttonToDelete == null || buttonToDelete.settings == undefined) {
            // Button not found
            return;
        }
       
        
        if (buttonToDelete.settings.isContextMenu && hqUtils != undefined && hqUtils != null) {
            var dlg = new hqUtils.Dialog ({
                title:     hqWidgets.Translate("Delete"), 
                content:   hqWidgets.Translate("Are you sure?"), 
                positionX: 'center', 
                positionY: 'middle', 
                isYes:     true, 
                isNo:      true, 
                height:    80, 
                action: function (result) { 
                    if (result != hqWidgets.gDlgResult.gDlgYes) return; 
                    buttonToDelete.Delete ();
                    var i=0;
                    while (hqWidgets.gDynamics.gElements[i])
                    {
                        if (hqWidgets.gDynamics.gElements[i] == buttonToDelete)
                        {
                            var j = i + 1;
                            while (hqWidgets.gDynamics.gElements[j])
                            {
                                hqWidgets.gDynamics.gElements[j-1] = hqWidgets.gDynamics.gElements[j];
                                j++;
                            }
                            hqWidgets.gDynamics.gElements[j-1] = null;
                            break;
                        }
                        i++;
                    }			
                },
                modal: true});
        }
        else {
            buttonToDelete.Delete ();
            var i=0;
            while (this.gDynamics.gElements[i])
            {
                if (this.gDynamics.gElements[i] == buttonToDelete)
                {
                    var j = i + 1;
                    while (this.gDynamics.gElements[j])
                    {
                        this.gDynamics.gElements[j-1] = this.gDynamics.gElements[j];
                        j++;
                    }
                    this.gDynamics.gElements[j-1] = null;
                    break;
                }
                i++;
            }
        }			
    },
    // Create and add button to the list
    Create: function (options, advOptions) {
        var btnObj = new this.hqButton (options, advOptions);
        this.Add (btnObj);
        return btnObj;
    },
    SetEditMode: function  (isEditMode) {
        if (isEditMode == true)
            this.gDynamics.gIsEditMode = true;
        else
        if (isEditMode==false)
            this.gDynamics.gIsEditMode = false;
        else
            this.gDynamics.gIsEditMode =! this.gDynamics.gIsEditMode;
            
        var i=0;
        while (this.gDynamics.gElements[i])
        {
            this.gDynamics.gElements[i].SetEditMode (this.gDynamics.gIsEditMode);
            i++;
        }
        
        return this.gDynamics.gIsEditMode;
    },
    GetMaxZindex: function  () {
        var i=0;
        var maxZindex = 0;
        while (this.gDynamics.gElements[i])
        {
            if (this.gDynamics.gElements[i].type == this.gButtonType.gTypeImage && 
                maxZindex < this.gDynamics.gElements[i].zindex)
                maxZindex = this.gDynamics.gElements[i].zindex;
            i++;
        }
        
        return maxZindex;
    },
    ShowSignal: function (isShow) {
        var i=0;
        while (this.gDynamics.gElements[i])
        {
            if (this.gDynamics.gElements[i].strength)
                this.gDynamics.gElements[i].ShowSignal (true, this.gDynamics.gElements[i].strength);
            i++;
        }
    },
    // Install document handlers
    Init: function (options) {
        this.gOptions = $.extend (this.gOptions, options);
    
        // ======== Mouse events bind ============
        $(document).mouseup(function(){
            hqWidgets.onMouseUp (false);
        });
        document.addEventListener('touchend', function() {
            hqWidgets.onMouseUp (true);
        }, false);
        $(document).mousemove(function(event){
            if (hqWidgets.gDynamics.gIsTouch) return;
            hqWidgets.onMouseMove (event.pageX, event.pageY);
        }); 
        document.addEventListener('touchmove', function(e) {
            if ((hqWidgets.gDynamics.gActiveElement != null) || 
                (hqWidgets.gDynamics.gActiveBig     != null) || 
                (hqWidgets.gDynamics.gActiveSlider  != null))
            {
                //$('#statusM').html(" x"+e.touches[0].pageX+" y"+e.touches[0].pageY);	
                e.preventDefault();
                hqWidgets.onMouseMove (e.touches[0].pageX, e.touches[0].pageY);
            }
        }, false);
        // Install prototype function for strings to 
        // calculate the width of string
        String.prototype.width = function(font) {
            var f = font || '10px "Tahoma", sans-serif',
                    o = $('<div>' + this + '</div>')
                            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
                            .appendTo($('body')),
                    w = o.width();

            o.remove();

            return w;
        }
    },
    // HButton
    hqButton: function (options, advOptions) {	
        var advSettings = {
            // Parent and container (Will not be stored)
            elemName:     null,         // name of the container HTML element (div)
            parent:      $('body'),     // jQuery parent class
        };
        
        var settings = {       
            // Position and form
            x:                null,     // Position if absolute
            y:                null,
            height:           hqWidgets.gOptions.gBtHeight, 
            width:            hqWidgets.gOptions.gBtWidth, 
            radius:           hqWidgets.gOptions.gBtHeight/2,   // Cycle by default
            zindex:           'auto',   // z-index (Used only with images)
            dimmerThick:      20,       // Thickness for dimmer cycle
            dimmerColorAct:   'yellow', // Colors for dimmer
            dimmerColorInact: 'grey',   // Colors for dimmer 
            
            // Static state properties
            buttonType:       hqWidgets.gButtonType.gTypeButton,// button type
            doorType:         hqWidgets.gSwingType.gSwingLeft,  // Swing direction for door
            windowConfig:     hqWidgets.gSwingType.gSwingDeaf,  // Window configuration and state
            infoTextFont:     null,  // Font for the dynamic text in the middle of the button
            infoTextColor:    null,  // Color for the dynamic text in the middle of the button
            infoFormat:       "%s",  // format string for info
            infoCondition:    null,  // Condition like "> 0", " < 0", " >= 5", " == 6.7", "== 'true'" for active state
            infoIsHideInactive: false,// If hide if inactive state
            iconOn:           null,  // Button active image
            iconName:         null,  // Button inactive image
            title:            null,  // Tooltip
            room:             null,  // Room name
            isIgnoreEditMode: false, // Special state for Edit button (normally: not used)
            staticText:       null,  // Static text if gTypeText
            staticTextFont:   null,  // Font for static text
            staticTextColor:  null,  // Color for static text
            isContextMenu:    false, // If install edit context menu
            
            // Local variables (Will not be stored)
            _noBackground:false,        // If show background or just text or image
            _contextMenu: null,         // Context menu
            _element:     null,         // HTML container as object
            _isEditMode:  false,        // Is Edit mode
            _currentClass:"",           // Current style class for _jelement
            _isPressed:   false,        // Is mouse button pressed state
            _isMoved:     false,        // Is the element moved or just pressed
            _isNonClick:  false,        // on tablet if I click the button in edit mode, it is moved immediately
            _description: null,         // Description of the element (title or button type)
            _timerID:     null,         // Timer to hide the big window
            _iconWidth:   15,           // Width of the refresh, unknown, working icon
            _iconHeight:  15,           // Height of the refresh, unknown, working icon
            _cursorX:     0,            // Last position by move
            _cursorY:     0,            // Last position by move
            _clickDetection: null,      // Timer
            _inited:      false,        // Is button drawn
            _isHoover:    false,        // Is mover hover or not
            _percentStateSet: 0,        // Set value for percent state
            
            _backOff:     "",           // class name for background in off or unknown state
            _backOffHover:"",           // class name for background in off or unknown state and mouse hover
            _backOn:      "",           // class name for background in on state
            _backOnHover: "",           // class name for background in on state and mouse hover
            _backMoving:  "",           // class name for background if object moved in edit mode
                    
            _jelement:    null,         // $(#_element)
            _blinds:      null,         // Array with window parts
            _jcenter:     null,         // jQuery container for icon in the center
            _jbattery:    null,         // jQuery battery container
            _jsignal:     null,         // jQuery signal strength container
            _jdoor:       null,         // jQuery door container
            _jinfoText:   null,         // jQuery dynamic text in the middle container
            _jright:      null,         // jQuery right panel for setTemp, valve or dimmer percent
            _jtemp:       null,         // jQuery temperature in the middle
            _jhumid:      null,         // jQuery humidity in the middle
            _jpercent:    null,         // jQuery percent in the right panel
            _jleft:       null,         // jQuery left panel for room and button name (in Edit mode)
            _jroom:       null,         // jQuery room in the left panel
            _jdesc:       null,         // jQuery description in the left panel
            _jvalve:      null,         // jQuery valve position in the right panel
            _jsettemp:    null,         // jQuery set temperature in the right panel
            _jdimmer:     null,         // jQuery cycle behind the button
            _jbigWindow:  null,         // jQuery blinds or lock big window container
            _jbigBlind1:  null,         // jQuery (rolladen) movable part on the _jbigWindow
            _jicon:       null,         // jQuery working, unknown state or refreshing icon state
            _jstaticText: null,         // jQuery static text container (Only if gTypeText)
            
        };
        
        var dynStates = {
            // Dynamic variables (Will not be stored)
            infoText:    null,          // Dynamic text in the middle of the button
            state:       hqWidgets.gState.gStateUnknown, // Unknown, active, inactive
            lowBattery:  false,         // If show low battery icon or not
            strength:    null,          // If set, so the signal strength will be shown
            isStrengthShow: false,      // If show strength
            isRefresh:   false,         // Is refresh state
            isWorking:   false,         // Is working state
            percentState:0,             // State of blind or dimmer in percent
            action:      null,          // On click action in form handler (object, ["state" | "pos"], state or position)
            store:       null,          // function on store settings handler (object, settings)
            valve:       null,
            setTemp:     null,
            temperature: null,
            humidity:    null,
            hideValve:   false,
            };
        
        var intern = {
            // Local variables (Will not be stored)
            _noBackground:false,        // If show background or just text or image
            _contextMenu: null,         // Context menu
            _element:     null,         // HTML container as object
            _isEditMode:  false,        // Is Edit mode
            _currentClass:"",           // Current style class for _jelement
            _isPressed:   false,        // Is mouse button pressed state
            _isMoved:     false,        // Is the element moved or just pressed
            _isNonClick:  false,        // on tablet if I click the button in edit mode, it is moved immediately
            _description: null,         // Description of the element (title or button type)
            _timerID:     null,         // Timer to hide the big window
            _iconWidth:   15,           // Width of the refresh, unknown, working icon
            _iconHeight:  15,           // Height of the refresh, unknown, working icon
            _cursorX:     0,            // Last position by move
            _cursorY:     0,            // Last position by move
            _clickDetection: null,      // Timer
            _inited:      false,        // Is button drawn
            
            _backOff:     "",           // class name for background in off or unknown state
            _backOffHover:"",           // class name for background in off or unknown state and mouse hover
            _backOn:      "",           // class name for background in on state
            _backOnHover: "",           // class name for background in on state and mouse hover
            _backMoving:  "",           // class name for background if object moved in edit mode
                    
            _jelement:    null,         // $(#_element)
            _blinds:      null,         // Array with window parts
            _jcenter:     null,         // jQuery container for icon in the center
            _jbattery:    null,         // jQuery battery container
            _jsignal:     null,         // jQuery signal strength container
            _jdoor:       null,         // jQuery door container
            _jinfoText:   null,         // jQuery dynamic text in the middle container
            _jright:      null,         // jQuery right panel for setTemp, valve or dimmer percent
            _jtemp:       null,         // jQuery temperature in the middle
            _jhumid:      null,         // jQuery humidity in the middle
            _jpercent:    null,         // jQuery percent in the right panel
            _jleft:       null,         // jQuery left panel for room and button name (in Edit mode)
            _jroom:       null,         // jQuery room in the left panel
            _jdesc:       null,         // jQuery description in the left panel
            _jvalve:      null,         // jQuery valve position in the right panel
            _jsettemp:    null,         // jQuery set temperature in the right panel
            _jdimmer:     null,         // jQuery cycle behind the button
            _jbigWindow:  null,         // jQuery blinds or lock big window container
            _jbigBlind1:  null,         // jQuery (rolladen) movable part on the _jbigWindow
            _jicon:       null,         // jQuery working, unknown state or refreshing icon state
            _jstaticText: null,         // jQuery static text container (Only if gTypeText)
        };
        
        if (advSettings != undefined)
            this.advSettings = $.extend (advSettings, advOptions);
        
        this.settings = $.extend (settings, options);
        if (this.advSettings.elemName == null) {
            this.advSettings.elemName = ("elem" + (hqWidgets.gDynamics.gDivID++));
        }		
        this.dynStates = dynStates;
        
        this.settings._element = document.getElementById (this.advSettings.elemName);
        // Create HTML container if not exists
        if (!this.settings._element)
        {
            var $newdiv1 = $('<div id="'+this.advSettings.elemName+'"></div>');
            this.advSettings.parent.append ($newdiv1); 
            this.settings._element = document.getElementById (this.advSettings.elemName);
        }
        else {
            $(this.settings._element).empty();
        }
        
        this.settings._jelement = $('#'+this.advSettings.elemName);
        
        // Draw window content
        this.DrawOneWindow = function (index, type, xoffset, width_, height_) {
            var name = this.settings._jelement.attr("id")+"_"+index;
            if (!this.settings._jelement.leaf) this.settings._jelement.leaf = new Array ();
            this.settings._jelement.prepend("<div id='"+name+"_0' class='hq-blind-blind1'></div>");
            var wnd = new Object ();
            wnd.ooffset = (Math.tan(15 * Math.PI/180) * width_)/2 + 2;
            wnd.width   = width_  - 9;
            wnd.height  = height_ - 9;
            wnd.owidth  = (wnd.width * Math.cos(15 * Math.PI/180)) * 0.9;
            wnd.divs = new Array ();
            wnd.style = type;
            wnd.state = hqWidgets.gWindowState.gWindowClosed;
            wnd.leafIndex=3;
            wnd.blindIndex=2;
            wnd.divs[0] = $("#"+name+"_0");
            wnd.divs[0].css({height: height_-2, width: width_-2, top: 3, position: 'absolute', left: xoffset+4}); // Set size
            wnd.divs[0].append("<div id='"+name+"_1'  class='hq-blind-blind2'></div>");
            wnd.divs[0].addClass('hq-no-select');
            wnd.divs[1] = $("#"+name+"_1");
            wnd.divs[1].css({height: height_-9, width: width_-9}); // Set size
            wnd.divs[1].append("<div id='"+name+"_2'  class='hq-blind-blind'></div>");
            wnd.divs[1].addClass('hq-no-select');
            wnd.divs[2] = $("#"+name+"_2");
            wnd.divs[2].css({height: 0, width: width_-9}); // Set size
            wnd.divs[2].append("<div id='"+name+"_3'  class='hq-blind-blind3'></div>");
            wnd.divs[2].addClass('hq-no-select');
            wnd.divs[3] = $("#"+name+"_3");
            wnd.divs[3].css({height: height_-9, width: width_-9}); // Set size
            wnd.divs[3].addClass('hq-no-select');
            this.settings._jelement.leaf[index] = wnd;
            
            wnd.divs[3].parentQuery=this;
            if (!this.settings._blinds) this.settings._blinds = new Array ();
            this.settings._blinds[index] = wnd;
        }
        this.GetWindowType = function () {
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
            {
                var result = "";
                var i;
                for (i = 0; i < this.settings._blinds.length; i++)
                    result += ((result=="") ? "" : ",") + this.settings._blinds[i].style;
                return result;
            }
            else
                return "";
        }
        // Set window configuration: Can be called as SetWindowType('1,2,3,4') or SetWindowType(1,2,3,4)
        this.SetWindowType = function (type1, type2, type3, type4) {
            if ((type1+"").indexOf(',') != -1)
            {
                // trim
                var a=type1.split(',');
                if (a.length<1) {type1 = hqWidgets.gSwingType.gSwingDeaf; type2 = null; type3 = null; type4 = null;}
                else
                if (a.length==1) {type1=a[0]; type2=null; type3=null; type4=null;}
                else
                if (a.length==2) {type1=a[0]; type2=a[1]; type3=null; type4=null;}
                else
                if (a.length==3) {type1=a[0]; type2=a[1]; type3=a[2]; type4=null;}
                else
                {type1=a[0]; type2=a[1]; type3=a[2]; type4=a[3];}			
            }
            
            var iCount = (type4 != undefined && type4 != null) ? 4 : ((type3 != undefined && type3 != null) ? 3 : ((type2 != undefined && type2 != null) ? 2 : 1));
                
            // Clear all 
            if (this.settings._blinds != undefined && this.settings._blinds != null)
            {
                for (var i = 0; i < this.settings._blinds.length; i++)
                    this.settings._blinds[i].divs[0].remove ();
            }
            this.settings._blinds = null;

            if (iCount >= 1) this.DrawOneWindow (0, type1, 0,                                  this.settings._jelement.width() / iCount, this.settings._jelement.height());
            if (iCount >= 2) this.DrawOneWindow (1, type2, this.settings._jelement.width() / iCount * 1, this.settings._jelement.width() / iCount, this.settings._jelement.height());
            if (iCount >= 3) this.DrawOneWindow (2, type3, this.settings._jelement.width() / iCount * 2, this.settings._jelement.width() / iCount, this.settings._jelement.height());
            if (iCount >= 4) this.DrawOneWindow (3, type4, this.settings._jelement.width() / iCount * 3, this.settings._jelement.width() / iCount, this.settings._jelement.height());		
            
            this.advSettings.parent.on('contextmenu', "#"+name+"_3", function(e){ 
                if (e.target.parentQuery) e.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
                return false; 
            });
            
            if (this.settings._jbattery) 
                this.ShowBattery (true);
                
            if (this.settings._jsignal) 
                this.ShowSignal (true, this.dynStates.strength);	
                
            this.settings.windowConfig = this.GetWindowType ();
        }
        // Set door configuration
        this.SetDoorType = function (type) {
            if (this.settings._jdoor && this.settings.doorType != type)
            {
                this.settings.doorType=type;
                this.ShowState ();
            }
        }
        this.SetSize = function (_width, _height, isForce) {
            if (isForce || this.settings.width != _width || this.settings.height != _height) {
                this.settings.width  = _width;
                this.settings.height = _height;
                this.settings._jelement.css ({width: _width, height: _height});	
                if (this.settings._jbigWindow)
                {
                    var xx = this.settings.x + (this.settings._jelement.width()  - this.settings._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.settings._jelement.height() - this.settings._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    this.settings._jbigWindow.css ({top: yy, left:xx});	
                }
                
                if (this.settings._jdoor)
                    this.settings._jdoor.css ({width: this.settings.width, height: this.settings.height});	
                    
                if (this.settings._jdoorHandle)
                {
                    this.settings._jdoorHandle.css ({top: (this.settings.height - this.settings._jdoorHandle.height()) / 2});
                    this.ShowDoorState (true);
                    /*
                    if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                        this.jdoorHandle.css ({left: ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.settings._jelement.width() * 0.2 : 0) + 5});
                    else
                        this.jdoorHandle.css ({left: (this.settings._jelement.width() - this.jdoorHandle.width() - 5) - ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.settings._jelement.width() * 0.2 : 0)});
                        */
                }
                
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                {
                    this.SetWindowType (this.GetWindowType ());
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                    this.ShowBlindState();
                }
                    
                if (this.settings._jinfoText)
                    this.settings._jinfoText.css({top: (this.settings.height - this.settings._jinfoText.height()) / 2, left: (this.settings.width - this.settings._jinfoText.width()) / 2 });
                
                if (this.settings._jtemp)
                    this.settings._jtemp.css({top:this.settings.height/2-11, width: this.settings.width}); // Set size
                
                if (this.settings._jhumid)
                    this.settings._jhumid.css({top:this.settings.height/2+1, width: this.settings.width}); // Set size
                
                if (this.settings._jright) {
                    if (this.settings._jpercent)
                        this.settings._jright.css({left:this.settings.x+this.settings.width/2, width: hqWidgets.gOptions.gBtWidth*0.7 + this.settings.width/2}); // Set size
                    else
                        this.settings._jright.css({left:this.settings.x+this.settings.width/2, width: hqWidgets.gOptions.gBtWidth*0.8 + this.settings.width/2}); // Set size
                    if (this.settings._jvalve)   this.settings._jvalve.css  ({left:this.settings.width/2+5}); // Set size
                    if (this.settings._jsettemp) this.settings._jsettemp.css({left:this.settings.width/2+1}); // Set size
                }
                
                if (this.settings._jpercent) {
                    this.settings._jpercent.css({left:this.settings.width / 2 + 3}); // Set size
                }	
                
                if (this.settings._jdimmer) {
                    this.settings._jdimmer.css({left:   this.settings.x - this.settings.dimmerThick, 
                                                top:    this.settings.y - this.settings.dimmerThick,
                                                /*width:  this.settings.width  + this.settings.dimmerThick*2,
                                                height: this.settings.height + this.settings.dimmerThick*2*/
                                                }); // Set size
                }
                
                if (this.settings._jcenter) {
                    this.settings._jcenter.css({left:   (this.settings.width  - hqWidgets.gOptions.gBtIconWidth) / 2, 
                                                top:    (this.settings.height - hqWidgets.gOptions.gBtIconHeight) / 2,
                                                }); // Set position                 
                }
                if (this.settings._jleft) {
                    this.settings._jleft.css({left:  this.settings.x - this.settings._jleft.offset, 
                                              width: this.settings._jleft.offset + this.settings.width / 2}); // Set size
                }
                
                this.StoreSettings ();
            }
        }	
        // ------- Functions ----------	
        // Set current style class for background (timems - time in ms for effects
        this.SetClass = function (newClass, timems)	{
            if (this.settings._currentClass != newClass)
            {
                //if (this.isIgnoreEditMode)
                //	$('#status').append ("show " + newClass +" " +timems +"<br>");
                    
                if (timems)
                    this.settings._jelement.removeClass (this.settings._currentClass).addClass(newClass);
                else
                    this.settings._jelement.removeClass (this.settings._currentClass).addClass(newClass);
                this.settings._currentClass = newClass;
            }
        }		
        // Set icon in ON state
        this.SetIconOn = function (iconName_) {
            if (iconName_!= undefined && iconName_ != null && iconName_ != "" && this.settings._jcenter)
            {
                this.settings.iconOn = ((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_;
                if (this.dynStates.state == hqWidgets.gState.gStateOn) {
                    this.settings._jcenter.attr('src', this.settings.iconOn);
                }
            }
            else
            {
                this.settings.iconOn = null;
                if (this.settings._jcenter) this.settings._jcenter.attr('src', this.settings.iconName);
            }
        }	
        // Set icon in Off state
        this.SetIcon = function (iconName_)	{
            // Icon in the middle of the button
            this.settings.iconName = (iconName_ != null && iconName_ != "") ? (((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_) : null;
        
            if (this.settings.iconName)
            {
                if (!document.getElementById(this.advSettings.elemName+"_center")) 
                    this.settings._jelement.prepend("<img id='"+this.advSettings.elemName+"_center' src='"+this.settings.iconName+"'></img>");
                this.settings._jcenter = $('#'+this.advSettings.elemName + '_center');

                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                    this.settings._jcenter.css({position: 'absolute', 
                                                top:      ((this.settings._jelement.height()-hqWidgets.gOptions.gBtIconHeight)/2), 
                                                left:     ((this.settings._jelement.width() -hqWidgets.gOptions.gBtIconWidth) /2), 
                                                'z-index':'10', 
                                                width:     hqWidgets.gOptions.gBtIconWidth, 
                                                height:    hqWidgets.gOptions.gBtIconHeight});
                }
                else {
                    if (this.settings.width)  this.settings._jcenter.css({width:this.settings.width});
                    if (this.settings.height) this.settings._jcenter.css({height:this.settings.height});
                }
                if (this.dynStates.state == hqWidgets.gOptions.gStateOff || 
                    this.settings.iconOn == undefined || 
                    this.settings.iconOn == null || 
                    this.settings.iconOn == "")
                    this.settings._jcenter.attr('src', this.settings.iconName);
                    
                this.settings._jcenter.addClass('hq-no-select');
                this.settings._jcenter.show();
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                    this.settings._jelement.css ({width: this.settings._jcenter.width(), height: this.settings._jcenter.height()});
                }
            }
            else
            {
                if (this.settings._jcenter) 
                {
                    this.settings._jcenter.hide();
                    this.settings._jcenter.html("");
                }
            }
        }	
        this.SetInfoText = function (text, textFont, textColor) {
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeInfo) return;
            if (text      == undefined || text      == null || text     == "") text      = null;
            if (textFont  == undefined || textFont  == null || textFont == "") textFont  = '20px "Tahoma", sans-serif';
            if (textColor == undefined || textColor == null || textColor== "") textColor = "white"; 
 
            this.dynStates.infoText     = text;
            this.settings.infoTextFont  = textFont;
            this.settings.infoTextColor = textColor;
              
            if (text != null && this.settings._jinfoText == null) {
                this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_infoText'></div>");
                this.settings._jinfoText = jQuery('#'+this.advSettings.elemName + '_infoText');
                this.settings._jinfoText.addClass('hq-no-select');
                this.settings._jinfoText.addClass('hq-info-text');
            }
            if (this.settings._jinfoText)
            {
                // state condition
                if (this.settings.infoCondition != null && this.settings.infoCondition != "") {
                    // create condition
                    var c = "'" + text + "' " + this.settings.infoCondition;
                    try {
                        if (eval(c)) {
                            this.SetState (hqWidgets.gState.gStateOn);
                            this.show();
                        }
                        else {
                            this.SetState (hqWidgets.gState.gStateOff);
                            if (this.settings.infoIsHideInactive)
                                this.hide();
                        }
                    }
                    catch (err) {
                        console.log ("Error by condition [" + c + ": " + err);
                        this.SetState (hqWidgets.gState.gStateOff);
                    }
                }
                else
                    this.SetState (hqWidgets.gState.gStateOff);
            
                // format string
                if (this.settings.infoFormat != null && this.settings.infoFormat != "") {
                    // try to cut the float value
                    if (text.indexOf ('.') != -1) {
                        var f = parseFloat(text);
                        var t = text;
                        while (t.length > 0 && t[t.length-1] == 0)
                            t = t.substring (0, t.length -1);
                        
                        if (f+"" == t) {// it is float 
                            // leave only one digit after point
                            f = Math.floor (f*10);
                            f = f / 10;
                            text = f+"";
                        }
                    }
                    text = this.settings.infoFormat.replace ("%s", text);
                }
                    
                this.settings._jinfoText.css({font: textFont, color: textColor});
                this.settings._jinfoText.html ((text) || "");
                if (text != null) {
                
                    var w = text.width(textFont);
                    // Place it in the middle
                    this.settings._jinfoText.css({top:  (this.settings.height - this.settings._jinfoText.height()) / 2, 
                                                  left: (this.settings.width  - w) / 2,
                                                  width: w});
                }                                                  
            }
        }
        this.ShowDoorState = function (noDelay)	{
            if (this.settings._jdoor)
            {
                if (this.settings._isEditMode && this.settings.isContextMenu)
                {
                    this.settings._jdoor.hide ();
                    if (this.settings._jdoorHandle)
                    {
                        if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                            this.settings._jdoorHandle.css ({left: 5 + this.settings._jdoorHandle.width()});
                        else
                            this.settings._jdoorHandle.css ({left: this.settings._jelement.width() - this.settings._jdoorHandle.width() - 5});
                    }
                    if (this.settings._isPressed)
                        this.SetClass (this.settings._backMoving);				
                    else
                        this.SetClass (this.settings._backOff);				
                }
                else
                {
                    this.settings._jdoor.show ();
                    if (this.settings._jdoorHandle)
                    {
                        if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                            this.settings._jdoorHandle.animate ({left: ((this.dynStates.state==hqWidgets.gState.gStateOn) ? this.settings._jelement.width() * 0.2 : 0) + 5},  (noDelay) ? 0 : 200);
                        else
                            this.settings._jdoorHandle.animate ({left: (this.settings._jelement.width() - this.settings._jdoorHandle.width() - 5) - ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.settings._jelement.width() * 0.2 : 0)},  (noDelay) ? 0 : 200);
                    }
                    if (this.dynStates.state == hqWidgets.gState.gStateOn && 
                        this.settings.doorType != hqWidgets.gSwingType.gSwingDeaf)				
                        this.settings._jdoor.stop().animate ({width: this.settings._jelement.width() * 0.8, 
                                                              left: (this.settings.doorType!=hqWidgets.gSwingType.gSwingLeft) ? 0: this.settings._jelement.width() * 0.2}, (noDelay) ? 0 : 200);
                    else
                        this.settings._jdoor.stop().animate ({left:0, width: this.settings._jelement.width()}, (noDelay) ? 0 : 200);
                }
            }
        }
        this.ShowState = function () {
            if (this.settings._isEditMode)
            {
                if (this.settings.isContextMenu) {
                    if (this.settings._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeImage)  
                        this.settings._jcenter.stop().hide();		
                    if (this.settings._jtemp)    this.settings._jtemp.stop().hide();
                    if (this.settings._jhumid)   this.settings._jhumid.stop().hide();
                    if (this.settings._jinfoText)this.settings._jinfoText.stop().hide();
                }
                
                if (this.settings._jleft)    this.settings._jleft.stop().show();
                if (this.settings._jbattery) this.settings._jbattery.stop().hide();
                if (this.settings._jsignal)  this.settings._jsignal.stop().hide();
                if (this.settings._jicon)	 this.settings._jicon.removeClass("ui-icon-cancel").hide();
                
                if (this.settings._jdoor)	
                    this.ShowDoorState ();
                else
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                {
                    if (this.settings._isPressed)	
                        this.SetClass (this.settings._backMoving);
                    else
                    {
                        if (this.settings.isContextMenu) {
                            if (!this.settings._noBackground) {
                                if (this.settings.isIgnoreEditMode)
                                    this.SetClass (this.settings._backOn);
                                else
                                    this.SetClass (this.settings._backOff);
                            }
                            else
                                this.SetClass ("hq-no-background-edit");
                        }
                        else {
                            if (this.dynStates.state == hqWidgets.gState.gStateOn)
                            {
                                if (this.settings._isPressed)
                                    this.SetClass (this.settings._backOnHover);
                                else
                                    this.SetClass (this.settings._backOn);
                            }
                            else
                            {
                                if (this.settings._isPressed)
                                    this.SetClass (this.settings._backOffHover);
                                else
                                    this.SetClass (this.settings._backOff);
                            }	
                        }
                    }
                }
                else
                {
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowClosed);
                    this.ShowBlindState();
                }
            }
            else {// not Edit mode
                if (this.settings._jcenter) {
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                        if (!this.settings._isPressed)  
                            this.settings._jcenter.stop().show();
                        else
                            this.settings._jcenter.stop().hide();
                    }
                }                
                if (this.settings._jtemp)        this.settings._jtemp.stop().show();
                if (this.settings._jhumid)       this.settings._jhumid.stop().show();
                if (this.settings._jinfoText)    this.settings._jinfoText.stop().show();
                if (this.settings._jleft)        this.settings._jleft.stop().hide();
                if (this.settings._jbattery)     this.settings._jbattery.stop().show();
                if (this.settings._jsignal)      this.settings._jsignal.stop().show();
                if (this.settings._jstaticText)  this.settings._jstaticText.stop().show();
                if (this.dynStates.state != hqWidgets.gState.gStateUnknown) {
                    if (this.settings._jicon)
                        this.settings._jicon.removeClass("ui-icon-cancel");
                        
                    if (this.settings._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                    {
                        if (this.dynStates.state == hqWidgets.gState.gStateOn)
                        {
                            if (this.settings._isPressed)
                                this.SetClass (this.settings._backOnHover);
                            else
                                this.SetClass (this.settings._backOn);
                        }
                        else
                        {
                            if (this.settings._isPressed)
                                this.SetClass (this.settings._backOffHover);
                            else
                                this.SetClass (this.settings._backOff);
                        }	
                    }
                    else
                    {
                        this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                        this.ShowBlindState();
                    }
                    
                    if (this.settings._jicon)
                    {
                        if (this.dynStates.isRefresh)
                        {
                            this.settings._jicon.addClass("ui-icon-refresh");
                            this.settings._jicon.removeClass("ui-icon-gear");
                            this.settings._jicon.show();
                        }
                        else
                        {
                            this.settings._jicon.removeClass("ui-icon-refresh");
                            if (this.dynStates.isWorking)
                            {
                                this.settings._jicon.addClass("ui-icon-gear");
                                this.settings._jicon.show();
                            }
                            else
                            {
                                this.settings._jicon.removeClass("ui-icon-gear");
                                this.settings._jicon.hide();
                            }
                        }
                    }
                }
                else
                {
                    if (this.settings._jicon)
                    {
                        this.settings._jicon.show();
                        this.settings._jicon.removeClass("ui-icon-refresh");
                        this.settings._jicon.removeClass("ui-icon-gear");
                        this.settings._jicon.addClass("ui-icon-cancel");
                    }
                    if (this.settings._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                        this.SetClass (this.settings._backOff, 100);
                    else
                    {
                        this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                        this.ShowBlindState();
                    }
                }		
            }			
        }
        this.SetEditMode = function (isEditMode) {
            if (this.settings._isEditMode != isEditMode)
            {
                this.settings._isEditMode = isEditMode;			
                this.ShowState ();
            }		
        }	
        this.SetState = function (newState)	{
            if (this.dynStates.state != newState)
            {
                this.dynStates.state = newState;
                if (this.settings.iconOn)
                {
                    if (this.dynStates.state == hqWidgets.gState.gStateOn)
                        this.settings._jcenter.attr('src', this.settings.iconOn);
                    else
                        this.settings._jcenter.attr('src', this.settings.iconName);
                }
                this.ShowState ();
            }		
        }	
        this.SetRefresh = function (isRefresh_)	{
            if (this.dynStates.isRefresh != isRefresh_)
            {
                this.dynStates.isRefresh = isRefresh_;
                this.ShowState ();
            }
        }	
        this.SetWorking = function (isWorking_)	{
            if (this.dynStates.isWorking != isWorking_)
            {
                this.dynStates.isWorking = isWorking_;
                this.ShowState ();
            }
        }	
        this.SetPosition = function (x_, y_) {
            if (this.settings.x != x_ || this.settings.y != y_)
            {
                this.settings.x = x_;
                this.settings.y = y_;
                this.settings._jelement.css({left: x_, top: y_});
                if (this.settings._jright) 
                    this.settings._jright.css({top:y_, left:x_+this.settings._jelement.width()/2});
                if (this.settings._jleft)  
                    this.settings._jleft.css({top:y_, left:x_-this.settings._jleft.offset});
                if (this.settings._jbigWindow)
                {
                    var x = x_ + (this.settings._jelement.width()  - this.settings._jbigWindow.width())/2;
                    var y = y_ + (this.settings._jelement.height() - this.settings._jbigWindow.height())/2;
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    this.settings._jbigWindow.css ({top: y, left:x});
                    this.settings._jbigWindow.x = x;
                    this.settings._jbigWindow.y = y;
                }
                if (this.settings._jdimmer)
                {
                    this.settings._jdimmer.css({left:   this.settings.x - this.settings.dimmerThick, 
                                                top:    this.settings.y - this.settings.dimmerThick
                                               }); 
                }
                this.settings._isMoved = true;
                this.StoreSettings ();
            }
        }
        this.ShowBattery = function (isShow) {
            // Show battery icon
            if (isShow) 
            {
                if (!this.settings._jbattery) 
                {
                    if (!document.getElementById(this.advSettings.elemName+"_battery"))
                        this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_battery'></div>");
                    this.settings._jbattery=$('#'+this.advSettings.elemName+"_battery").show();
                    this.settings._jbattery.addClass("hq-battery0");
                    this.settings._jbattery.prepend("<div id='"+this.advSettings.elemName+"_battery1'></div>");
                    $('#'+this.advSettings.elemName+"_battery1").addClass("hq-battery1"); 
                    this.settings._jbattery.prepend("<div id='"+this.advSettings.elemName+"_batteryTop'></div>");
                    $('#'+this.advSettings.elemName+"_batteryTop").addClass("hq-battery-top"); 
                }
                else
                    this.settings._jbattery.show();
            }
            else
            {
                if (this.settings._jbattery)
                {
                    this.settings._jbattery.html("").hide();
                    this.settings._jbattery = null;
                }
            }
        }
        // Show signal strength
        this.ShowSignal = function (isShow, value) {
            // Show battery icon
            if (isShow) 
            {
                var iCnt = 5; // Count of bars
                var i;
                this.dynStates.strength=value;
                if (!this.settings._jsignal) 
                {
                    if (!document.getElementById(this.advSettings.elemName+"_signal"))
                        this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_signal'></div>");
                    this.settings._jsignal=$('#'+this.advSettings.elemName+"_signal").show();
                    this.settings._jsignal.addClass("hq-signal");
                    this.settings._jsignal.bar = new Array ();
                    var h=this.settings._jsignal.height ();
                    var w=this.settings._jsignal.width ();
                    var ws=0;
                    for (i = iCnt-1; i >= 0; i--) 
                    {
                        this.settings._jsignal.prepend("<div id='"+this.advSettings.elemName+"_signalBar"+i+"'></div>");
                        this.settings._jsignal.bar[i] = $('#'+this.advSettings.elemName+"_signalBar"+i).addClass("hq-signal-bar");
                        if (ws==0) ws=this.settings._jsignal.bar[i].width();
                        var hh =(h/iCnt)/2 + (h-(h/iCnt)/2)/iCnt*i;
                        this.settings._jsignal.bar[i].css({top: h-hh, left: w - w/iCnt * (iCnt-i+1), height: hh});
                    }
                }
                else
                    this.settings._jsignal.show();

                for (i = 0; i < iCnt; i++) 
                {
                    /* excelence => all green*/
                    if (value > -65)
                        this.settings._jsignal.bar[i].addClass('hq-signal5');
                    else
                    if (value > -85)
                    {
                        if (i <= 3) 
                            this.settings._jsignal.bar[i].addClass('hq-signal4');
                        else
                            this.settings._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    if (value > -100)
                    {
                        if (i <= 2) 
                            this.settings._jsignal.bar[i].addClass('hq-signal3');
                        else
                            this.settings._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    if (value > -115)
                    {
                        if (i <= 1) 
                            this.settings._jsignal.bar[i].addClass('hq-signal2');
                        else
                            this.settings._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    {
                        if (i <= 0) 
                            this.settings._jsignal.bar[i].addClass('hq-signal1');
                        else
                            this.settings._jsignal.bar[i].addClass('hq-signal0');
                    }
                }
                this.settings._jsignal.attr('title', value+"dB");
            }
            else
            {
                if (this.settings._jsignal)
                {
                    this.settings._jsignal.html("").hide();
                    this.settings._jsignal = null;
                }
            }
        }
        this.SetStaticText = function (text, textFont, textColor) {
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeText) return;
            if (text      == undefined || text      == null || text     == "") text      = hqWidgets.Translate ("Text");
            if (textFont  == undefined || textFont  == null || textFont == "") textFont  = '20px "Tahoma", sans-serif';
            if (textColor == undefined || textColor == null || textColor== "") textColor = "white"; 
            this.settings._jstaticText.html(text).css({font: textFont, color: textColor});

            this.settings.staticText      = text;
            this.settings.staticTextFont  = textFont;
            this.settings.staticTextColor = textColor;
        }
        // Set title (Tooltip)
        this.SetTitle = function (room, title)	{
            if (!this.settings._jleft) 
            {
                if (!document.getElementById(this.advSettings.elemName+'_left')) 
                {
                    var $newdiv2 = $('<div id="'+this.advSettings.elemName+'_left"></div>');
                    this.advSettings.parent.append ($newdiv2);
                }
                this.settings._jleft=$('#'+this.advSettings.elemName+"_left");
                this.settings._jleft.css({position:     'absolute', 
                                          top:          this.settings.y,
                                          borderRadius: 10, 
                                          height:       30, 
                                          'z-index':    (this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1, 
                                          fontSize:     10, 
                                          color:    'black'}); // Set position
                this.settings._jleft.addClass ("hq-button-base-info-left");
                this.settings._jleft.prepend("<div id='"+this.advSettings.elemName+"_descr'></div>");
                this.settings._jleft.prepend("<div id='"+this.advSettings.elemName+"_room'></div>");
                this.settings._jdesc = $('#'+this.advSettings.elemName+"_descr");
                this.settings._jdesc.css ({position:'absolute', top:3, left:5});
                this.settings._jroom = $('#'+this.advSettings.elemName+"_room");
                this.settings._jroom.css ({position:'absolute', top:15, left:5});
            }
            if (title != undefined) this.settings.title = title;
            if (room  != undefined) this.settings.room  = room;
            if (this.settings.room == null)
                this.settings.room = "";
            
            // If description is empty => set type
            this.settings._description = this.settings.title;
            if (this.settings._description == null || this.settings._description == "") {
                this.settings._description = hqWidgets.Type2Name (this.settings.buttonType);
                this.settings._jelement.attr ('title', "");
            }
            else
                this.settings._jelement.attr ('title', this.settings.title);

            this.settings._jleft.offset = this.settings._description.width();
            var w = this.settings.room.width();
            this.settings._jleft.offset = ((this.settings._jleft.offset > w) ? this.settings._jleft.offset : w)+ 10;
            this.settings._jleft.css({left:  this.settings.x - this.settings._jleft.offset, 
                                      width: this.settings._jleft.offset + this.settings._jelement.width() / 2}); // Set size
            this.settings._jdesc.html(this.settings._description);
            this.settings._jroom.html(this.settings.room);
        }
        this.ShowBigWindow = function (isShow, delay, customTimeout)	{
            if (isShow && hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this)
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);
            
            if (isShow)
            {
                if (!customTimeout)
                    customTimeout = 5000; // show for standard period for 5 seconds
                hqWidgets.gDynamics.gShownBig = this;
                // Close window after X seconds
                this.settings._timerID = setTimeout (function () {
                    if (hqWidgets.gDynamics.gShownBig) {
                        hqWidgets.gDynamics.gShownBig.ShowBigWindow(false); 
                        hqWidgets.gDynamics.gShownBig.settings._timerID = null;
                    } 
                    hqWidgets.gDynamics.gShownBig=null;
                }, customTimeout);
                
                this.settings._jbigWindow.show();
                if (this.settings._jbigWindow.bwidth==undefined) 
                {
                    this.settings._jbigWindow.bheight = this.settings._jbigWindow.height();
                    this.settings._jbigWindow.bwidth  = this.settings._jbigWindow.width();
                    this.settings._jbigWindow.x       = this.settings._jbigWindow.position().left;
                    this.settings._jbigWindow.y       = this.settings._jbigWindow.position().top;
                }
                this.settings._jbigWindow.css ({top:    this.settings.y, 
                                                left:   this.settings.x, 
                                                width:  this.settings._jelement.width(), 
                                                height: this.settings._jelement.height()});
                                                
                this.settings._jbigWindow.animate ({top:    this.settings._jbigWindow.y, 
                                                    left:   this.settings._jbigWindow.x, 
                                                    width:  this.settings._jbigWindow.bwidth, 
                                                    height: this.settings._jbigWindow.bheight}, 500);
                if (this.settings._jbigWindow.buttons) {
                    setTimeout (function () {
                        var i;
                        for (i=0;i<3;i++) hqWidgets.gDynamics.gShownBig.settings._jbigWindow.buttons[i].show();
                    }, 500);	
                }
                else
                if (this.settings._jbigBlind1 != null)
                    this.settings._jbigBlind1.css({height:this.settings._jbigWindow.bheight * this.dynStates.percentState / 100});		
            }
            else
            {
                hqWidgets.gDynamics.gShownBig = this;
                if (this.settings._timerID)
                {
                    clearTimeout (this.settings._timerID);
                    this.settings._timerID = null;
                }
                
                if (delay)
                {
                    setTimeout (function (){
                        if (hqWidgets.gDynamics.gShownBig != null)
                        {
                            hqWidgets.gDynamics.gShownBig.settings._jbigWindow.animate ({
                                                                     top:    hqWidgets.gDynamics.gShownBig.settings.y, 
                                                                     left:   hqWidgets.gDynamics.gShownBig.settings.x, 
                                                                     width:  hqWidgets.gDynamics.gShownBig.settings._jelement.width(), 
                                                                     height: hqWidgets.gDynamics.gShownBig.settings._jelement.height()}, 500);
                                                                     
                            setTimeout(function(elem) {elem.settings._jbigWindow.hide();}, 500, hqWidgets.gDynamics.gShownBig);
                            
                            if (hqWidgets.gDynamics.gShownBig.settings._jbigWindow.buttons)	{
                                var i;
                                for (i=0; i<3; i++)
                                    hqWidgets.gDynamics.gShownBig.settings._jbigWindow.buttons[i].hide();
                            }
                        }
                    }, delay);
                }
                else
                {
                    hqWidgets.gDynamics.gShownBig.settings._jbigWindow.animate ({top:    this.settings.y, 
                                                             left:   this.settings.x, 
                                                             width:  this.settings._jelement.width(), 
                                                             height: this.settings._jelement.height()}, 500);
                                                             
                    setTimeout(function(elem) {elem.settings._jbigWindow.hide();}, 500, this);
                    if (this.settings._jbigWindow.buttons) {
                        var i;
                        for (i=0;i<3;i++)
                            this.settings._jbigWindow.buttons[i].hide();
                    }
                }	
            }
        }
        this.SetPercent = function (percent, isForSet)	{
            if (percent < 0)   percent = 0;
            if (percent > 100) percent =100;
            
            if ((!isForSet && percent != this.dynStates.percentState) ||
                (isForSet  && percent != this.settings._percentStateSet))
            {
                if (isForSet)
                    this.settings._percentStateSet=percent;
                else
                    this.dynStates.percentState=percent;
                    
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                   this.ShowBlindState (isForSet);
                   
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                   this.ShowDimmerState (isForSet);
            }
        }		
        this.StoreSettings = function()	{
            // Store settings in DB
            if (this.dynStates.store != null)
                this.dynStates.store (this, this.GetSettings());
        }
        // Send command with new position to real device
        this.SendPercent = function()	{
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                this.ShowBlindState ();
        
            if (!this.settings._isEditMode && this.dynStates.action)
                this.dynStates.action (this, "pos", this.settings._percentStateSet);
        }
        this.ShowBlindState = function ()	{
            if (this.settings._jelement.leaf)
            {
                var i=0;
                while (this.settings._jelement.leaf[i])
                {
                    if (this.settings._isEditMode && this.settings.iContextMenu)
                        this.settings._jelement.leaf[i].divs[0].hide();
                    else
                    {
                        this.settings._jelement.leaf[i].divs[0].show();
                        this.settings._jelement.leaf[i].divs[this.settings._jelement.leaf[i].blindIndex].animate ({height:this.settings._jelement.leaf[i].height * (this.dynStates.percentState / 100)}, 500);
                    }
                    i++;
                }
            }
        }
        this.ShowDimmerState = function (isForSet)	{
            var pState = (isForSet) ? this.settings._percentStateSet : this.dynStates.percentState;
        
            if (this.settings._jpercent)
                this.settings._jpercent.html (pState + "%");
                
            if ((this.settings._isHoover || this.settings._isPressed) && !this.settings._isEditMode)
            {
                if (this.settings._jcenter && this.settings._isPressed)
                    this.settings._jcenter.hide ();  
                    
                if (this.settings._jright)
                    this.settings._jright.show ();
                               
                if (this.settings._jdimmer) {
                    this.settings._jdimmer.context.save();
                    this.settings._jdimmer.context.clearRect ( 0, 0, this.settings._jdimmer.canvas.width, this.settings._jdimmer.canvas.height);
                    if (pState > 0) {
                        this.settings._jdimmer.context.beginPath();
                        this.settings._jdimmer.context.arc (this.settings._jdimmer.x, 
                                                           this.settings._jdimmer.y, 
                                                           this.settings._jdimmer.radius, 
                                                           1.57079 /* PI / 2 */, 
                                                           ((0.02 * pState) + 0.5) * Math.PI, 
                                                           false);
                        this.settings._jdimmer.context.lineWidth = this.settings.dimmerThick;

                        // line color
                        this.settings._jdimmer.context.strokeStyle = this.settings.dimmerColorAct;
                        this.settings._jdimmer.context.stroke();
                        this.settings._jdimmer.context.closePath();
                    }
                    if (pState != 100) {
                        this.settings._jdimmer.context.beginPath();
                        this.settings._jdimmer.context.arc (this.settings._jdimmer.x, 
                                                           this.settings._jdimmer.y, 
                                                           this.settings._jdimmer.radius, 
                                                           ((0.02 * pState) + 0.5) * Math.PI, 
                                                            1.57079 /* PI / 2 */, 
                                                           false);
                        this.settings._jdimmer.context.lineWidth = this.settings.dimmerThick;

                        // line color
                        this.settings._jdimmer.context.strokeStyle = this.settings.dimmerColorInact;
                        this.settings._jdimmer.context.stroke();
                        this.settings._jdimmer.context.closePath();
                    }
                    this.settings._jdimmer.context.restore();
                    this.settings._jdimmer.stop().show ();
                }
            }
            else {
                if (this.settings._jcenter)
                    this.settings._jcenter.show ();
               
                if (this.settings._jdimmer)
                    this.settings._jdimmer.hide ();
            }
        }	
        this.SetWindowState = function (index, state)	{
            if (index==-1 && this.settings._jelement.leaf)
            {
                var i=0;
                while (this.settings._jelement.leaf[i])
                {
                    this.SetWindowState(i, state);
                    i++;
                }
                return;
            }
        
            if (this.settings._jelement.leaf && this.settings._jelement.leaf[index])
            {
                var wnd = this.settings._jelement.leaf[index]; 
                
                if (state == hqWidgets.gWindowState.gWindowToggle)
                    state = (wnd.state == hqWidgets.gWindowState.gWindowClosed) ? hqWidgets.gWindowState.gWindowOpened: hqWidgets.gWindowState.gWindowClosed;
                else
                if (state == hqWidgets.gWindowState.gWindowUpdate)
                    state  = wnd.state;
                    
                this.settings._jelement.leaf[index].state = state;
                
                if (this.settings._isEditMode && !this.settings.isContextMenu)
                    state=hqWidgets.gOptions.gWindowOpened;

                if (state == hqWidgets.gWindowState.gWindowClosed || (this.settings._isEditMode && this.settings.isContextMenu))
                {
                    if (!this.settings._isEditMode) wnd.state = hqWidgets.gWindowState.gWindowClosed;
                    wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-left');
                    wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-right');
                    wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3');
                    wnd.divs[wnd.leafIndex].css ({top: 0, left: 0, width: wnd.width});
                }
                else
                {
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingLeft)
                    {
                        if (!this.settings._isEditMode) wnd.state = hqWidgets.gOptions.gWindowOpened;
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3-opened-left');
                        wnd.divs[wnd.leafIndex].css ({top: wnd.ooffset-3, left: 0, width: wnd.owidth});
                    }
                    else
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingRight)
                    {
                        if (!this.settings._isEditMode)wnd.state = hqWidgets.gOptions.gWindowOpened;
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3-opened-right');
                        wnd.divs[wnd.leafIndex].css ({top:  wnd.ooffset-3, left: wnd.width-wnd.owidth-1	, width: wnd.owidth});
                    }
                }			
            }
        }
        this.SetTemperature = function (temp)	{
            if (temp)
            {
                // State is no more unknown 
                if (temp.temperature != undefined && temp.temperature != null && this.dynStates.state == hqWidgets.gState.gStateUnknown)
                    this.SetState (hqWidgets.gOptions.gStateOff);
                
                if (temp.valve      !=undefined && this.settings._jvalve)  this.settings._jvalve.html(Math.round(temp.valve) + '%');
                if (temp.setTemp    !=undefined && this.settings._jsettemp){
                    // If state word
                    if (typeof temp.setTemp === "string" && (temp.setTemp[0] < '0' || temp.setTemp[0] > '9'))
                        this.settings._jsettemp.html(temp.setTemp);
                    else
                        this.settings._jsettemp.html(hqWidgets.TempFormat(temp.setTemp) + '&#176;C');
                }
                if (temp.temperature!=undefined && this.settings._jtemp)   this.settings._jtemp.html(hqWidgets.TempFormat(temp.temperature) + '&#176;C');
                if (temp.humidity   !=undefined && this.settings._jhumid)  this.settings._jhumid.html(Math.round(temp.humidity)+'%');
                if (temp.hideValve  !=undefined && this.settings._jvalve)  {
                    if (!temp.hideValve)
                        this.settings._jvalve.show();
                    else
                        this.settings._jvalve.hide();
                }
            }
            else
            {	
                if (this.settings._jvalve)   this.settings._jvalve.html('--%');
                if (this.settings._jsettemp) this.settings._jsettemp.html('--,-&#176;C');
                if (this.settings._jtemp)    this.settings._jtemp.html('--,-&#176;C');
                if (this.settings._jhumid)   this.settings._jhumid.html('--,-%');
            }
        }
        this.settings._jelement.bind ("mouseenter", {msg: this}, function (event)	{
            var obj = event.data.msg;
            if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                return;
            
            if (!hqWidgets.gDynamics.gActiveElement || 
                 hqWidgets.gDynamics.gActiveElement == this)
                obj.settings._isHoover = true;
            
            if (!obj.settings._isEditMode || !obj.settings._isPressed)
            {		
                if (obj.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && obj.dynStates.action)
                {
                    if (obj.settings._isEditMode && obj.settings.isIgnoreEditMode)
                        obj.SetClass (obj.settings._backOnHover, 100);
                    else
                    if (obj.dynStates.state != hqWidgets.gState.gStateOn)
                        obj.SetClass (obj.settings._backOffHover, 100);
                    else
                        obj.SetClass (obj.settings._backOnHover, 100);
                }
                if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer && !obj.settings._isEditMode) {
                    obj.ShowDimmerState ();
                }
            }
        });
        this.settings._jelement.bind ("mouseleave", {msg: this}, function (event)	{			
            var obj = event.data.msg;
            if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                return;
            var _width  = obj.settings._jelement.width();
            var _height = obj.settings._jelement.height();

            obj.settings._isHoover = false;
            
            // Disable pressed if without hqUtils
            if (obj.settings._isEditMode && !obj.settings.isContextMenu)
                obj.settings._isPressed = false;

            if (!obj.settings._isEditMode || !obj.settings._isPressed)
            {	
                if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer && !obj.settings._isEditMode) {
                    if (!obj.settings._isPressed)
                        obj.ShowDimmerState ();
                    else
                        return;
                }
            
                if (obj.settings._isPressed)
                {                
                    obj.settings._isPressed = false;
                    if (obj.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                    {
                        obj.settings._jelement.stop().animate({width:        _width, 
                                                               height:       _height, 
                                                               borderRadius: obj.settings.radius, 
                                                               left:         obj.settings.x, 
                                                               top:          obj.settings.y}, 50);
                        if (obj.settings._jcenter)
                            obj.settings._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth, 
                                                                  height: hqWidgets.gOptions.gBtIconHeight, 
                                                                  left:  (_width  - hqWidgets.gOptions.gBtIconWidth)/2, 
                                                                  top:   (_height - hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                        obj.settings._jicon.stop().animate({top:  (_height / 15), 
                                                            left: (_width  / 15)}, 50);
                        if (obj.settings._jtemp)     obj.settings._jtemp.stop().show(50);
                        if (obj.settings._jhumid)    obj.settings._jhumid.stop().show(50);
                        if (obj.settings._jright)    obj.settings._jright.stop().show(50);
                        if (obj.settings._jinfoText) obj.settings._jinfoText.stop().show(50);
                    }
                }
                
                if (obj.dynStates.action && obj.settings.buttonType != hqWidgets.gButtonType.gTypeImage)
                {
                    if (obj.settings._isEditMode && obj.settings.isIgnoreEditMode)
                        obj.SetClass (obj.settings._backOn, 100);
                    else
                    if (obj.dynStates.state != hqWidgets.gState.gStateOn)
                        obj.SetClass (obj.settings._backOff, 100);
                    else
                        obj.SetClass (obj.settings._backOn, 100);
                }
            }
        });	
        this.OnContextMenu = function (x_, y_, isTouch)	{
            if (this.settings._isEditMode && this.settings._contextMenu && !this.settings._contextMenu.IsEmpty ())
            {
                if (hqWidgets.gDynamics.gActiveElement)
                {
                    hqWidgets.gDynamics.gActiveElement.settings._isPressed = false;
                    if (hqWidgets.gDynamics.gActiveElement.settings._noBackground) 
                        hqWidgets.gDynamics.gActiveElement.SetClass ("hq-no-background-edit", 100);
                    else 
                        hqWidgets.gDynamics.gActiveElement.SetClass (hqWidgets.gDynamics.gActiveElement.settings._backOffHover, 100);
                    hqWidgets.gDynamics.gActiveElement = null;
                }
                this.settings._contextMenu.Show (x_, y_);
                if (this.settings._jstaticText)  
                    this.settings._jstaticText.stop().show();
            }
        }
        this.OnMouseDown = function (x_, y_, isTouch)	{
            this.settings._isPressed = true;
            this.settings._isMoved   = false;
            
            if (!this.settings._isEditMode) {
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeImage)
                {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                    {
                        hqWidgets.gDynamics.gActiveElement = this;
                        this.settings._cursorX = this.settings.x + this.settings.width  / 2;
                        this.settings._cursorY = this.settings.y + this.settings.height / 2;
                    }
                
                    if (this.dynStates.action)
                    {
                        var _width  = this.settings._jelement.width();
                        var _height = this.settings._jelement.height();
                        if (!this.settings.x) this.settings.x = this.settings._jelement.position().left;
                        if (!this.settings.y) this.settings.y = this.settings._jelement.position().top;
                        var iShrink = 4;
                        var iShrinkCtr = hqWidgets.gOptions.gBtIconHeight/_height*iShrink;
                        this.settings._jelement.stop().animate({
                            width:        _width  - iShrink, 
                            height:       _height - iShrink, 
                            borderRadius: (this.settings.radius ? this.settings.radius : (_height - iShrink)/2), 
                            left:         this.settings.x + iShrink/2, 
                            top:          this.settings.y + iShrink/2}, 
                            50);
                            
                        if (this.settings._jcenter)
                            this.settings._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth -iShrinkCtr, 
                                                                   height: hqWidgets.gOptions.gBtIconHeight-iShrinkCtr, 
                                                                   left:  (_width - iShrink - hqWidgets.gOptions.gBtIconWidth  + iShrinkCtr)/2, 
                                                                   top:   (_height- iShrink - hqWidgets.gOptions.gBtIconHeight + iShrinkCtr)/2}, 50);
                                                                   
                        if (this.settings._jtemp)     this.settings._jtemp.stop().hide(50);
                        if (this.settings._jhumid)    this.settings._jhumid.stop().hide(50);
                        if (this.settings._jright)    this.settings._jright.stop().hide(50);
                        if (this.settings._jinfoText) this.settings._jinfoText.stop().hide(50);
                        
                        this.settings._jicon.stop().animate({top:  (_height / 15 + iShrink / 2), 
                                                             left: (_width  / 15 + iShrink / 2)}, 50);
                    }
                }
                return false;
            }
            else {
                if (!this.settings.isContextMenu)
                    return;
                    
                //$('#status').append('down ' + x_+" "+y_+'<br>');
                hqWidgets.gDynamics.gActiveElement = this;
                this.SetClass (this.settings._backMoving);											
                this.settings._cursorX = x_;
                this.settings._cursorY = y_;
                if (this.settings._jstaticText)	
                    hqWidgets.gDynamics.gActiveElement.settings._jstaticText.hide ();
                    
                if (isTouch)
                {
                    this.settings._isNonClick = false; // on tablet if I click the button in edit mode, it is moved immediately
                                                       // to detect the click, if mouse Up faster than 500 ms => click
                    hqWidgets.gDynamics.gRightClickDetection = setTimeout (function () {
                        hqWidgets.gDynamics.gActiveElement.OnContextMenu ((hqWidgets.gDynamics.gActiveElement.settings._cursorX - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.settings._cursorX - 70) : 0, 
                                                                          (hqWidgets.gDynamics.gActiveElement.settings._cursorY - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.settings._cursorY - 70) : 0);
                    }, 1000);
                    
                    this.settings._clickDetection = setTimeout (function () {
                        hqWidgets.gDynamics.gActiveElement.settings._isNonClick = true;
                    }, 500);
                    
                    return true;
                }
                else
                {
                    this.settings._isNonClick = true;
                    if (hqWidgets.gDynamics.gRightClickDetection) clearTimeout (hqWidgets.gDynamics.gRightClickDetection);
                    hqWidgets.gDynamics.gRightClickDetection = setTimeout (function () {
                        if (hqWidgets.gDynamics.gActiveElement)	
                            hqWidgets.gDynamics.gActiveElement.OnContextMenu (hqWidgets.gDynamics.gActiveElement.settings._cursorX, hqWidgets.gDynamics.gActiveElement.settings._cursorY);
                    }, 1000);
                    //$('#status').append("started " + hqWidgets.gDynamics.gRightClickDetection+"<br>");
                }
            }	
            return false;
        }
        this.OnMouseUp = function (isTouch) {
            if (hqWidgets.gDynamics.gRightClickDetection) { 
                clearTimeout (hqWidgets.gDynamics.gRightClickDetection); 
                hqWidgets.gDynamics.gRightClickDetection = null;
            }
            
            this.settings._isHoover  = false;
            
            if (!this.settings._isEditMode) {
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                    if (this.dynStates.action || this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer && this.settings._isPressed) {
                            this.settings._isPressed = false;
                            if (this.settings._isMoved)
                            {
                                this.SendPercent ();
                                this.ShowDimmerState ();
                            }
                        }
                        
                        this.settings._jelement.stop().animate({width:        this.settings.width, 
                                                                height:       this.settings.height, 
                                                                borderRadius: this.settings.radius, 
                                                                left:         this.settings.x, 
                                                                top:          this.settings.y}, 50);
                        if (this.settings._jcenter) {
                            this.settings._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth,
                                                                   height: hqWidgets.gOptions.gBtIconHeight, 
                                                                   left:   (this.settings.width - hqWidgets.gOptions.gBtIconWidth )/2, 
                                                                   top:    (this.settings.height- hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                            // Bugfix: somethimes it is in the wrong position
                            setTimeout (function (elem){
                                elem.settings._jcenter.stop().css({width:  hqWidgets.gOptions.gBtIconWidth,
                                                                   height: hqWidgets.gOptions.gBtIconHeight, 
                                                                   left:   (elem.settings.width - hqWidgets.gOptions.gBtIconWidth )/2, 
                                                                   top:    (elem.settings.height- hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                                                       }, 50, this);
                        }
                                                                   
                        this.settings._jicon.stop().animate({top:  '' + this.settings.height / 15, 
                                                             left: '' + this.settings.width  / 15}, 50);
                        if (this.settings._jtemp)     this.settings._jtemp.stop().show(50);
                        if (this.settings._jhumid)    this.settings._jhumid.stop().show(50);
                        if (this.settings._jright)    this.settings._jright.stop().show(50);
                        if (this.settings._jinfoText && (this.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer)) 
                            this.settings._jinfoText.stop().show(50);
                    }
                }
                this.settings._isPressed = false;
                
                // Bug fix: first click does not work
                if (!this.settings._isMoved) {
                    setTimeout (function (e) {
                        e.OnClick ()
                    }, 50, this);
                }
            }
            else
            {
                this.settings._isPressed = false;
                
                clearTimeout (this.settings._clickDetection);
                this.settings._clickDetection = null;
            
                //$('#status').append('up ' + this.settings._isEditMode+'<br>');
                
                if (isTouch && this.settings.isIgnoreEditMode && (!this.settings._contextMenu || !this.settings._contextMenu.isVisible))
                    this.OnClick ();
                    
                if (hqWidgets.gDynamics.gActiveElement && hqWidgets.gDynamics.gActiveElement.settings._jstaticText)	
                    hqWidgets.gDynamics.gActiveElement.settings._jstaticText.show ();
                    
                this.Generate    
                    
                if (this.settings._noBackground)
                    this.SetClass ("hq-no-background-edit", 100);
                else 
                if (!isTouch)
                {
                    if (this.settings.isIgnoreEditMode)
                        this.SetClass (this.settings._backOnHover, 100);			
                    else
                        this.SetClass (this.settings._backOffHover, 100);
                }
                else
                {
                    if (this.settings.isIgnoreEditMode && this.settings._isEditMode)
                        this.SetClass (this.settings._backOn, 100);			
                    else
                        this.SetClass (this.settings._backOff, 100);
                }
                
                if (!this.settings.isContextMenu) {
                    // update position
                    var pos = this.settings._jelement.position ();
                    this.SetPosition (pos.left, pos.top);
                }
            }
            if (hqWidgets.gDynamics.gActiveElement != null && (this.settings._isEditMode ||
                hqWidgets.gDynamics.gActiveElement.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer ||
                hqWidgets.gDynamics.gActiveElement == this))
                hqWidgets.gDynamics.gActiveElement = null;
        }	
        this.settings._element.parentQuery = this;
        this.hide = function () {
            this.settings._jelement.hide(); 
            if (this.settings._jright) 
                this.settings._jright.hide (); 
            if (this.settings._jleft) 
                this.settings._jleft.hide (); 
        }
        this.show = function () {
            this.settings._jelement.show(); 
            if (this.settings._jright) 
                this.settings._jright.show (); 
            if (this.settings._jleft && this.settings._isEditMode) 
                this.settings._jleft.show ();
        }
        this.OnClick = function () {
            //$('#status').append('click start ' + this.settings._isEditMode+" " + this.clickTimer +'<br>');
            // Filter the double click 
            if (this.settings._clickTimer) return;
            this.settings._clickTimer = setTimeout (function (elem) { 
                clearTimeout (elem.settings._clickTimer);
                elem.settings._clickTimer = null;
            }, 300, this);
            
            if (hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this)
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);

            if ((!this.settings._isEditMode || (this.settings.isIgnoreEditMode && !this.settings._isMoved)) && 
                 this.dynStates.action && !this.settings._jbigWindow)
                this.dynStates.action (this, "state", this.dynStates.state);
             
            if (!this.settings._isEditMode && this.settings._jbigWindow)
                this.ShowBigWindow(true);	
                
            //hqWidgets.gDynamics.gActiveElement = null;
            //$('#status').append('click end ' + this.settings._isEditMode+" " + this.clickTimer +" "+ this.dynStates.state+'<br>');
        }
        this.OnMouseMove = function (x_, y_) {
            if (this.settings._isEditMode) {

                if (!this.settings.isContextMenu)
                    return;
            
                // filter out normal mouse click
                var mustBe = 0;
                if (hqWidgets.gDynamics.gRightClickDetection)       mustBe = 10;
                if (!this.settings._isNonClick) mustBe = 20;
                 
                var delta = Math.abs(this.settings._cursorX - x_);
                if (delta <= mustBe) delta = Math.abs(this.settings._cursorY - y_);
                        
                if (delta > mustBe)
                {
                    if (hqWidgets.gDynamics.gRightClickDetection) { 
                        //$('#status').append('cleard ' + hqWidgets.gDynamics.gRightClickDetection + "<br>");
                        clearTimeout (hqWidgets.gDynamics.gRightClickDetection); 
                        hqWidgets.gDynamics.gRightClickDetection = null; 
                    }
                    this.SetPosition (this.settings.x + x_ - this.settings._cursorX, this.settings.y + y_ - this.settings._cursorY);
                    this.settings._cursorX = x_;
                    this.settings._cursorY = y_;
                    //$('#statusM').html(delta + " x"+x_+" y"+y_);	
                }			
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer && this.settings._isPressed)
            {
                // filter out normal mouse click
                var mustBe = 0;
                if (!this.settings._isNonClick) mustBe = 20;
                 
                var delta = Math.abs(this.settings._cursorX - x_);
                if (delta <= mustBe) delta = Math.abs(this.settings._cursorY - y_);
                        
                if (delta > mustBe)
                {
                    this.settings._isMoved = true;
                    var percent = (x_ - this.settings._cursorX) * (x_ - this.settings._cursorX) + 
                                  (y_ - this.settings._cursorY) * (y_ - this.settings._cursorY);
                    percent = Math.sqrt (percent) * 1.2;
                    percent -= (this.settings.height / 2) * 1.5;
                    percent = Math.floor (percent);
                    this.SetPercent (percent, true);
                }	            
            }
        }
        this.settings._jelement.bind ("mousedown", {msg: this}, function (e)	{
            if (e.button == 0) // right
            {
                if (e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) {
                    e.preventDefault();
                }
                // Hide active menu
                if (hqWidgets.gDynamics.gActiveMenu)
                {
                    hqWidgets.gDynamics.gActiveMenu.Show(false);
                    hqWidgets.gDynamics.gActiveMenu = null;
                }
            }
            else
                e.data.msg.OnContextMenu (e.pageX, e.pageY, false);
                
            return false;
        });
        this.advSettings.parent.on('contextmenu', '#'+this.advSettings.elemName, function(e){ 
            if (e.target.parentQuery) 
                e.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
            return false; 
        });
        this.settings._element.addEventListener('touchstart', function(e) {
            hqWidgets.gDynamics.gIsTouch=true;
            if (e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true))
                e.preventDefault();		
        }, false);
        this.settings._jelement.bind ("resize", {msg: this}, function (e)	{
            if (e.data.msg.settings.isContextMenu)
                return;
                    
            e.data.msg.SetSize (e.data.msg.settings._jelement.width(), e.data.msg.settings._jelement.height());
        });
        this.settings._jelement.bind ("change", {msg: this}, function (e)	{
            if (e.data.msg.settings.isContextMenu)
                return;
                    
            var pos = e.data.msg.settings._jelement.position();
            e.data.msg.SetPosition (pos.left, pos.top);
        });
        this.settings._element.addEventListener('touchend', function(e) {
            e.target.parentQuery.OnMouseUp (true);
        }, false);	
        this.settings._jelement.bind ("click", {msg: this}, function (e)	{
            e.data.msg.OnClick ();
        });
        this.settings._jelement.bind ("mouseup", {msg: this}, function (e)	{
            e.data.msg.OnMouseUp (false);
        });	
        this.Delete = function () {
            this.hide();
            this.settings._jelement.remove ();
            this.settings._jelement = null;
            if (this.settings._jright)
            {
                this.settings._jright.remove ();
                this.settings._jright = null;
            }
            if (this.settings._jleft)
            {
                this.settings._jleft.remove ();
                this.settings._jleft = null;
            }
            if (this.settings._jdimmer)
            {
                this.settings._jdimmer.remove ();
                this.settings._jdimmer = null;
            }
            if (this.settings._contextMenu)
            {
                this.settings._contextMenu.Delete ();
                this.settings._contextMenu = null;
            }
        }	
        this.SetType = function (buttonType) {
            if (this.settings.buttonType == buttonType && this.settings._inited)
                return;

            var width  = this.settings._jelement.width();
            var height = this.settings._jelement.height();

            // Delete old structures
            if (this.settings._currentClass != undefined && this.settings._currentClass != "") 
                this.settings._jelement.removeClass (this.settings._currentClass);
                
            if (this.settings.buttonType != undefined && this.settings._inited) 
            {
                this.settings._backOff        = "";
                this.settings._backOffHover   = "";
                this.settings._backOn         = "";
                this.settings._backOnHover    = "";
                this.settings._backMoving     = "";

                this.settings._jelement.html("");
                this.settings._jelement.removeClass ("hq-button-base");
                this.settings._jelement.removeClass ('hq-blind-base');
                this.settings._jelement.removeClass ('hq-door-black');
                this.settings._jelement.removeClass ("hq-backround");
                
                //this.settings._jelement.removeAttr("style")
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp  ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeLock    ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer  ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeButton)
                {
                    if (this.settings._jright)
                    {
                        this.settings._jright.html("").hide();
                        this.settings._jright.remove();
                        this.settings._jright = null;
                    }
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp || 
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                    {
                        // Temperature and humidity
                        this.settings._jtemp  = null;
                        this.settings._jhumid = null;

                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                        {
                            this.settings._jvalve = null;
                            this.settings._jsettemp = null;					
                        }
                    }
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeLock)
                {
                    this.settings._jbigWindow.html("").hide();
                    this.settings._jbigWindow.remove ();
                    this.settings._jbigWindow = null;
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                {	
                    this.settings._jbigWindow.removeClass('hq-blind-big');
                    this.settings._jbigWindow.html("").hide();
                    this.settings._jbigWindow.remove ();
                    this.settings._jbigWindow = null;
                    this.settings._jbigBlind1 = null;
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDoor)
                {
                    this.settings._jdoor=null;
                    this.settings._jdoorHandle=null;
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeText)
                {
                    this.settings._jstaticText=null;
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                {
                    if (this.settings._contextMenu)
                    {
                        this.settings._contextMenu.Remove("Bring to back");
                        this.settings._contextMenu.Remove("Bring to front");
                    }
                    this.settings._jcenter.html("");
                    this.settings._jcenter=null;
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                {
                    this.settings._jdimmer.remove("");
                    this.settings._jdimmer=null;
                }		
                // Destroy icon
                if (this.settings._jicon)
                {
                    this.settings._jicon = null;
                }		
            }

            this.settings.buttonType = (buttonType==undefined) ? hqWidgets.gButtonType.gTypeButton : buttonType;
            this.SetTitle (this.settings.room, this.settings.title);

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeLock    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeButton) {
                // Colors of the states
                if (!this.settings._noBackground) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        this.settings._backOff        = "hq-button-base-intemp";
                        this.settings._backOffHover   = "hq-button-base-intemp-hover";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                    {
                        this.settings._backOff        = "hq-button-base-outtemp";
                        this.settings._backOffHover   = "hq-button-base-outtemp-hover";
                    }
                    else
                    {
                        this.settings._backOff        = "hq-button-base-normal";
                        this.settings._backOffHover   = "hq-button-base-normal-hover";
                    }
                    this.settings._backOn         = "hq-button-base-on";
                    this.settings._backOnHover    = "hq-button-base-on-hover";
                }
                else {
                    this.settings._backOff        = "";
                    this.settings._backOffHover   = "";
                    this.settings._backOn         = "";
                    this.settings._backOnHover    = "";
                }
        
                this.settings._backMoving     = "hq-button-base-moving";
                this.settings._jelement.addClass ("hq-button-base");
                this.settings._jelement.addClass ("hq-no-select");
                this.settings._jelement.css ({width:        this.settings.width, 
                                              height:       this.settings.height, 
                                              borderRadius: this.settings.radius, 
                                              'z-index':    this.settings.zindex}); // Set size
        
                // Create circle 
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer) {                
                    if (!document.getElementById(this.advSettings.elemName+'_right')) {
                        var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_right"></div>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    if (!document.getElementById(this.advSettings.elemName+'_dimmer')) {
                        var $newdiv1 = $('<canvas id="'+this.advSettings.elemName+'_dimmer" width="'+(this.settings.width + this.settings.dimmerThick*2)+'" height="'+(this.settings.height + this.settings.dimmerThick*2)+'"></canvas>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    this.settings._jdimmer=$('#'+this.advSettings.elemName+"_dimmer");
                    this.settings._jdimmer.addClass('hq-no-select').show();
                    this.settings._jdimmer.radius = (this.settings.width + this.settings.dimmerThick) / 2 - 3;
                    this.settings._jdimmer.css({position: 'absolute', 
                                                top:    this.settings.y - this.settings.dimmerThick, 
                                                left:   this.settings.x - this.settings.dimmerThick, 
                                                'z-index':(this.settings.zindex == 'auto') ? -2 : this.settings.zindex-2,  
                                                color:'yellow'}); // Set size
                    
                    this.settings._jdimmer.canvas = document.getElementById(this.advSettings.elemName+'_dimmer');
                    this.settings._jdimmer.context = this.settings._jdimmer.canvas.getContext('2d');
                    this.settings._jdimmer.x = this.settings._jdimmer.canvas.width  / 2;
                    this.settings._jdimmer.y = this.settings._jdimmer.canvas.height / 2;
                    
                    this.settings._jright=$('#'+this.advSettings.elemName+"_right");
                    this.settings._jright.css({position: 'absolute', 
                                               top:      this.settings.y, 
                                               left:     this.settings.x+this.settings.width/2, 
                                               borderRadius: 10, 
                                               height:   30, 
                                               width:    hqWidgets.gOptions.gBtWidth*0.7 + this.settings.width/2, 
                                               'z-index':(this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1, 
                                               fontSize: 10, 
                                               color:    'black'}); // Set size
                    this.settings._jright.addClass ("hq-button-base-info").show();
                    
                    if (!document.getElementById(this.advSettings.elemName+"_percent"))
                        this.settings._jright.prepend("<div id='"+this.advSettings.elemName+"_percent'></div>");
                        
                    this.settings._jpercent=$('#'+this.advSettings.elemName+"_percent");
                    this.settings._jpercent.css({position: 'absolute', 
                                                 top:      10, 
                                                 left:     (this.settings._jelement.width()/2 + 7), 
                                                 height:   15, 
                                                 'z-index':'2', 
                                                 fontSize: 9, 
                                                 color:    'black'}); // Set size
                    this.settings._jpercent.addClass('hq-no-select').show();
                    this.settings._jright.addClass('hq-no-select');
                    this.ShowDimmerState();
                }
                
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp || 
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                    // Temperature and humidity
                    if (!document.getElementById(this.advSettings.elemName+"_temp"))
                        this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_temp'></div>");
                    if (!document.getElementById(this.advSettings.elemName+"_humid"))
                        this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_humid'></div>");
                    this.settings._jtemp=$('#'+this.advSettings.elemName+"_temp");
                    this.settings._jhumid=$('#'+this.advSettings.elemName+"_humid");
                    this.settings._jtemp.css({position: 'absolute', top:this.settings.height/2-11, left:0, height: 15, width: this.settings.width, 'z-index':'11', fontSize:11, 'font-weight':'bold', color:'black'}); // Set size
                    this.settings._jtemp.css("text-align", "center").show();
                    this.settings._jhumid.css({position: 'absolute', top:this.settings.height/2+1, left:0, height: 15, width: this.settings.width, 'z-index':'11', fontSize:11, 'font-weight':'normal', color:'darkblue'}); // Set size
                    this.settings._jhumid.css("text-align", "center").show();
                    this.settings._jtemp.addClass('hq-no-select');
                    this.settings._jhumid.addClass('hq-no-select');
                    this.settings._jhumid.parentQuery=this;
                    this.advSettings.parent.on('contextmenu', '#'+this.advSettings.elemName+"_temp", function(e){ 
                        if (event.target.parentQuery) event.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
                        return false; 
                    });			
                    this.settings._jtemp.parentQuery=this;
                    this.advSettings.parent.on('contextmenu', '#'+this.advSettings.elemName+"_humid", function(e){ 
                        if (event.target.parentQuery) event.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
                        return false; 
                    });			
                    // create info on the right side
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        if (!document.getElementById(this.advSettings.elemName+'_right')) {
                            var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_right"></div>');
                            this.advSettings.parent.append ($newdiv1);
                        }
                        this.settings._jright=$('#'+this.advSettings.elemName+"_right");
                        this.settings._jright.css({position:  'absolute', 
                                                   top:       this.settings.y, 
                                                   left:      this.settings.x+this.settings.width/2,
                                                   borderRadius: 10, 
                                                   height:    30, 
                                                   width:     hqWidgets.gOptions.gBtWidth*0.8 + this.settings.width/2, 
                                                   'z-index': (this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1,  
                                                   fontSize:  10, 
                                                   color:     'black'}); // Set size
                        this.settings._jright.addClass ("hq-button-base-info").show();
                        if (!document.getElementById(this.advSettings.elemName+"_valve"))
                            this.settings._jright.prepend("<div id='"+this.advSettings.elemName+"_valve'></div>");
                            
                        if (!document.getElementById(this.advSettings.elemName+"_settemp"))
                            this.settings._jright.prepend("<div id='"+this.advSettings.elemName+"_settemp'></div>");
                            
                        this.settings._jvalve  =$('#'+this.advSettings.elemName+"_valve");
                        this.settings._jsettemp=$('#'+this.advSettings.elemName+"_settemp");
                        this.settings._jvalve.css({position: 'absolute', 
                                                   top:15, 
                                                   left:this.settings.width/2+5, 
                                                   height: 15, 
                                                   'z-index':'2', 
                                                   fontSize:9, 
                                                   color:'black'}); // Set size
                        this.settings._jvalve.css("text-align", "left");
                        this.settings._jsettemp.css({position: 'absolute', 
                                                     top: 3, 
                                                     left:this.settings.width/2 + 1, 
                                                     height: 15, 
                                                     'z-index':'2', 
                                                     fontSize:9, 
                                                     color:'black'}); // Set size
                        this.settings._jsettemp.css("text-align", "left").show();
                        this.settings._jvalve.addClass('hq-no-select').show();
                        this.settings._jsettemp.addClass('hq-no-select');
                        this.settings._jright.addClass('hq-no-select');
                    }
                    this.SetTemperature ();
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeLock) {
                    this.SetSize (this.settings.width, this.settings.height, true);
                    this.settings._backMoving     = "hq-lock-moving";
                    this.settings._backOff        = "";
                    this.settings._backOffHover   = "";
                    this.settings._backOn         = "";
                    this.settings._backOnHover    = "";
                    this.settings._noBackground   = true;
                    
                    if (!document.getElementById(this.advSettings.elemName+'_lock')) {
                        var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_lock"></div>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    this.settings._jbigWindow=$('#'+this.advSettings.elemName+"_lock");
                    this.settings._jbigWindow.hide();
                    this.settings._jbigWindow.addClass('hq-lock-big');
                    this.settings._jbigWindow.addClass('hq-no-select');		
                    var xx = this.settings.x + (this.settings.width  - this.settings._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.settings.height - this.settings._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    this.settings._jbigWindow.css ({top: yy, left:xx});
                    this.settings._jbigWindow.buttons = new Array ();
                    this.settings._jbigWindow.prepend('<div id="'+this.advSettings.elemName+'_lock1"></div><div id="'+this.advSettings.elemName+'_lock2"></div><div id="'+this.advSettings.elemName+'_lock3"></div>');
                    this.settings._jbigWindow.buttons[0] = new hqWidgets.hqButton ({radius: 5, iconName: 'LockOrange.png'}, {elemName: this.advSettings.elemName+'_lock1'});
                    this.settings._jbigWindow.buttons[0].parentLock = this;
                    this.settings._jbigWindow.buttons[0].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockClose); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.settings._jbigWindow.buttons[0].settings._jelement.addClass('hq-lock-big-button1');
                    this.settings._jbigWindow.buttons[0].SetState(hqWidgets.gOptions.gStateOff);
                    this.settings._jbigWindow.buttons[1] = new hqWidgets.hqButton ({radius: 5, iconName: 'LockOpened.png'}, {elemName: this.advSettings.elemName+'_lock2'});
                    this.settings._jbigWindow.buttons[1].parentLock = this;
                    this.settings._jbigWindow.buttons[1].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockOpen); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.settings._jbigWindow.buttons[1].settings._jelement.addClass('hq-lock-big-button2');
                    this.settings._jbigWindow.buttons[1].SetState(hqWidgets.gOptions.gStateOff);
                    this.settings._jbigWindow.buttons[2] = new hqWidgets.hqButton ({radius: 5, iconName: 'DoorOpenedIcon.png'},{elemName: this.advSettings.elemName+'_lock3'});
                    this.settings._jbigWindow.buttons[2].parentLock = this;
                    this.settings._jbigWindow.buttons[2].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockOpenDoor); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.settings._jbigWindow.buttons[2].settings._jelement.addClass('hq-lock-big-button3');
                    this.settings._jbigWindow.buttons[2].SetState(hqWidgets.gOptions.gStateOff);
                    this.settings._jbigWindow.buttons[0].hide();
                    this.settings._jbigWindow.buttons[1].hide();
                    this.settings._jbigWindow.buttons[2].hide();
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor); 
                }
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                this.settings._backMoving  = "hq-blind-blind3-moving";
                this.settings._jelement.addClass ('hq-blind-base');
                this.settings._jelement.css ({borderRadius: 0});
                this.settings._backOff        = "hq-blind-base";
                this.settings._backOffHover   = "hq-blind-base";
                this.SetWindowType (this.settings.windowConfig);
                this.SetSize (this.settings.width, this.settings.height, true);
                
                if (!document.getElementById(this.advSettings.elemName+'_big')) {
                    var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_big"></div>');
                    this.advSettings.parent.append ($newdiv1);
                }
                this.settings._jbigWindow=$('#'+this.advSettings.elemName+"_big");
                this.settings._jbigWindow.addClass('hq-blind-big');
                this.settings._jbigWindow.addClass('hq-no-select');
                this.settings._jbigWindow.bheight   = this.settings._jbigWindow.height();  // Size of the big window
                var xx = this.settings.x + (this.settings.width  - this.settings._jbigWindow.width())/2;
                var yy = this.settings.y + (this.settings.height - this.settings._jbigWindow.height())/2;
                if (xx < 0) xx = 0;
                if (yy < 0) yy = 0;
                this.settings._jbigWindow.hide();
                this.settings._jbigWindow.css ({top: yy, left:xx});
                
                if (!document.getElementById(this.advSettings.elemName+'_bigBlind'))
                    this.settings._jbigWindow.prepend('<div id="'+this.advSettings.elemName+'_bigBlind"></div>');
                    
                this.settings._jbigBlind1 = $('#'+this.advSettings.elemName+"_bigBlind");
                this.settings._jbigBlind1.addClass('hq-blind-big-blind');
                this.settings._jbigBlind1.addClass('hq-no-select');
                this.settings._jbigBlind1.css({height: 0});
                this.settings._jbigWindow.parent = this;
                var big  = document.getElementById (this.advSettings.elemName+"_big");
                var big1 = document.getElementById (this.advSettings.elemName+"_bigBlind");
                big.parentQuery = this;
                big1.parentQuery = this;
                // Handlers
                this.settings._jbigWindow.OnMouseMove = function (x_, y_) {
                    this.SetPositionOffset(y_ - this.parent.settings._cursorY);
                }
                
                this.settings._jbigWindow.mouseDown = function (element, y_) {
                    var y_ = event.pageY;
                    hqWidgets.gDynamics.gActiveBig = element;
                    hqWidgets.gDynamics.gActiveBig.settings._cursorY = y_;
                    var yOffset = y_ - hqWidgets.gDynamics.gActiveBig.settings._jbigWindow.position().top;
                    hqWidgets.gDynamics.gActiveBig.settings._percentStateSet = hqWidgets.gDynamics.gActiveBig.dynStates.percentState;
                    hqWidgets.gDynamics.gActiveBig.settings._jbigWindow.startPosOffset = 100 / hqWidgets.gDynamics.gActiveBig.settings._jbigWindow.bheight * yOffset;
                    hqWidgets.gDynamics.gActiveBig.settings._jbigWindow.SetPositionOffset (0);
                }
                this.settings._jbigWindow.bind ("mousedown", {msg: this}, function (event) {
                    event.target.parentQuery.settings._jbigWindow.mouseDown (event.target.parentQuery, event.pageY);
                });
                big.addEventListener('touchstart', function(event) {
                    hqWidgets.gDynamics.gIsTouch=true;
                    event.target.parentQuery.settings._jbigWindow.mouseDown (event.target.parentQuery, event.touches[0].pageY);
                }, false);
                this.settings._jbigWindow.SetPositionOffset = function (newPosOffset)
                {
                    if (this.parent.settings._timerID) {
                        clearTimeout (this.parent.settings._timerID);
                        this.parent.settings._timerID = null;
                    }				
                    newPosOffset = this.startPosOffset + newPosOffset * 100 / this.bheight;
                    this.parent.settings._percentStateSet = Math.floor (newPosOffset);
                    if (this.parent.settings._percentStateSet < 0)    this.parent.settings._percentStateSet = 0;
                    if (this.parent.settings._percentStateSet > 100)  this.parent.settings._percentStateSet = 100;
                    this.parent.settings._jbigBlind1.css({height:this.bheight * this.parent.settings._percentStateSet / 100});		
                };
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDoor)
            {
                this.SetSize (this.settings.width, this.settings.height, true);
                this.settings._backMoving     = "hq-door-moving";
                this.settings._jelement.addClass ('hq-door-black');
                this.settings._jelement.css ({borderRadius: 0});
                this.settings._backOff        = "hq-door-black";
                this.settings._backOffHover   = "hq-door-black";
                if (!document.getElementById(this.advSettings.elemName+'_door'))
                    this.settings._jelement.prepend('<div id="'+this.advSettings.elemName+'_door"></div>');
                this.settings._jdoor=$('#'+this.advSettings.elemName+"_door");
                this.settings._jdoor.addClass ('hq-door');
                this.settings._jdoor.addClass ('hq-no-select').show();
                this.settings._jdoor.css ({width: this.settings.width, height: this.settings.height});
                this.SetDoorType (this.settings.doorType);
                if (!document.getElementById(this.advSettings.elemName+'_handle'))
                    this.settings._jelement.prepend('<div id="'+this.advSettings.elemName+'_handle"></div>');
                this.settings._jdoorHandle=$('#'+this.advSettings.elemName+"_handle");
                this.settings._jdoorHandle.addClass ('hq-door-handle').show();
                this.settings._jdoorHandle.addClass ('hq-no-select');
                this.settings._jdoorHandle.css ({position: 'absolute', top: (this.settings.height - this.settings._jdoorHandle.height()) / 2});
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
            {
                this.settings._backMoving     = "hq-button-base-moving";
                this.settings._jelement.addClass ("hq-backround");
                this.settings._jelement.addClass ("hq-no-select").css ({'z-index': this.settings.zindex});
                this.settings._backOff="";
                if (this.settings._contextMenu) {
                    this.settings._contextMenu.Add({text:"Bring to back", action:function(elem) {
                            var options = new Object ();
                            options.zindex = 0;
                            elem.SetSettings (options);
                        }});
                    this.settings._contextMenu.Add({text:"Bring to front", action:function(elem) {
                            var options = new Object ();
                            options.zindex = GetMaxZindex () + 1;
                            elem.SetSettings (options);
                        }});
                }
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeText) {
                this.dynStates.state = hqWidgets.gOptions.gStateOff;
                this.settings._backMoving = "hq-lock-moving";
                this.settings._jelement.addClass ("hq-no-select").addClass("hq-button-base-text").css ({'z-index': this.settings.zindex, borderRadius: 1});
                if (!document.getElementById(this.advSettings.elemName+'_stext'))
                    this.settings._jelement.append("<div id='"+this.advSettings.elemName+"_stext' ></div>");
                this.settings._jstaticText = $('#'+this.advSettings.elemName+"_stext").show();
                this.settings._jstaticText.addClass("hq-no-select");
                this.settings._noBackground = true;
                this.SetStaticText (this.staticText, this.staticTextFont, this.staticTextColor);
                document.getElementById(this.advSettings.elemName+'_stext').parentQuery = this;
                this.settings._jstaticText.bind ("mousedown", {msg: this}, function (e)
                {
                    e.target.parentQuery.OnMouseDown(e.pageX, e.pageY, false);
                });		
            }
        
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                // Icon, like battery, refresh or state unknown
                if (!document.getElementById(this.advSettings.elemName+"_icon"))
                    this.settings._jelement.prepend("<div id='"+this.advSettings.elemName+"_icon'></div>");
                this.settings._jicon          = $('#'+this.advSettings.elemName + '_icon');
                this.settings._iconWidth     = 15;
                this.settings._iconHeight    = 15;
                this.settings._jicon.width (this.settings._iconWidth);
                this.settings._jicon.height(this.settings._iconHeight);		
                this.settings._jicon.css({ position: 'absolute', 
                                           top:  '' + this.settings.height / 15, 
                                           left: '' + this.settings.width  / 15, 
                                           'z-index':'20' });
                this.settings._jicon.addClass ('ui-icon');
                this.settings._jicon.addClass('hq-no-select');
            }
        
            this.SetTitle (this.settings.room, this.settings.title);
            if (this.settings._jbattery) 
                this.ShowBattery (true);
                
            if (this.settings._jsignal) 
                this.ShowSignal (true, this.dynStates.strength);	
                
            this.SetSize (this.settings.width, this.settings.height, true);
            this.ShowState ();
            this.settings._inited = true;
        }
        this.SetStates = function (dynOptions) {
            
            // InfoText and InfoTextCSS
            if (dynOptions.infoText != undefined) 
                this.SetInfoText (dynOptions.infoText, this.settings.infoTextFont, this.settings.infoTextColor);
        
            // Signal strength
            if (dynOptions.strength != undefined) {
                this.dynStates.strength = dynOptions.strength;
                if (this.settings._jsignal)
                    this.ShowSignal (true, this.dynStates.strength);
            }
            // Show signal
            if (dynOptions.isStrengthShow != undefined && this.dynStates.strength != null) 
                this.ShowSignal (dynOptions.isStrengthShow, this.dynStates.strength);

            // Action function
            if (dynOptions.action != undefined)
                this.dynStates.action = dynOptions.action;

            // Context menu
            if (dynOptions._contextMenu != undefined) 
                this.settings._contextMenu = dynOptions.contextMenu;

            // isRefresh
            if (dynOptions.isRefresh != undefined) 
                this.SetRefresh (dynOptions.isRefresh);
                
            // isWorking
            if (dynOptions.isWorking != undefined) 
                this.SetWorking (dynOptions.isWorking);
                
            // Temperature
            this.SetTemperature (dynOptions);
            
            //  lowBattery
            if (dynOptions.lowBattery != undefined) 
                this.ShowBattery (dynOptions.lowBattery); 

            //  windowState  - like "0,2,1" means first leaf is unknown state, middle is closed and the third is opened
            if (dynOptions.windowState != undefined && 
                this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                // trim
                if (dynOptions.windowState!=null && dynOptions.windowState.replace(/^\s+|\s+$/g, '') != "") 
                {
                    var a=dynOptions.windowState.split(',');
                    var i;
                    for (i=0; i < a.length; i++) this.SetWindowState (i, a[i]);
                }
            }

            //  percentState - blinds position from 0 to 100 or dimmer state from 0 to 100
            if (dynOptions.percentState!=undefined) 
                this.SetPercent (dynOptions.percentState);
                
            //  state
            if (dynOptions.state!=undefined) 
                this.SetState (dynOptions.state);     
                
            this.dynStates = $.extend (this.dynStates, dynOptions);
        }
        this.SetSettings = function (options, isSave) {
            //  Type
            if (options.buttonType!=undefined) 
                this.SetType (options.buttonType);

            // Position
            if (options.x!= undefined && options.y!=undefined)
                this.SetPosition(options.x, options.y);
            else 
            if (options.x!= undefined)
                this.SetPosition(options.x, this.settings.y);
            else
            if (options.y!=undefined)
                this.SetPosition(this.settings.x, options.y);

            // Width and height
            if (options.width!= undefined && options.height!=undefined)
                this.SetSize(options.width, options.height);
            else 
            if (options.width!= undefined)
                this.SetSize(options.width, this.settings._jelement.height());
            else
            if (options.height!=undefined)
                this.SetSize(this.settings._jelement.width(), options.y);

            // Radius
            if (options.radius!= undefined && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeText) {
                this.settings.radius = options.radius;
                if (this.settings.radius == undefined || this.settings.radius == null)
                    this.settings.radius = hqWidgets.gOptions.gBtHeight/2;
                this.settings._jelement.css ({borderRadius: this.settings.radius});
            }

            // State
            if (options.state!= undefined) 
                this.SetState (options.state);

            // Room and description
            if (options.title != undefined && options.room != undefined)
                this.SetTitle (options.room, options.title);
            else
            if (options.title != undefined)
                this.SetTitle (this.room, options.title);
            else
            if (options.room != undefined)
                this.SetTitle (options.room, this.title);


            // noBackground
            if (options._noBackground != undefined) {
                if (this.settings._noBackground != options._noBackground) 
                {
                    this.settings._noBackground = options._noBackground;

                    // Colors of the states
                    if (!options._noBackground)
                    {
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                        {
                            this.settings._backOff        = "hq-button-base-intemp";
                            this.settings._backOffHover   = "hq-button-base-intemp-hover";
                        }
                        else
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                        {
                            this.settings._backOff        = "hq-button-base-outtemp";
                            this.settings._backOffHover   = "hq-button-base-outtemp-hover";
                        }
                        else
                        {
                            this.settings._backOff        = "hq-button-base-normal";
                            this.settings._backOffHover   = "hq-button-base-normal-hover";
                        }
                        this.settings._backOn         = "hq-button-base-on";
                        this.settings._backOnHover    = "hq-button-base-on-hover";
                    }
                    else
                    {
                        this.settings._backOff        = "";
                        this.settings._backOffHover   = "";
                        this.settings._backOn         = "";
                        this.settings._backOnHover    = "";
                    }
                    this.ShowState ();
                }
            }
            
            //  iconName
            if (options.iconName !== undefined) 
                this.SetIcon (options.iconName);

            //  iconOn
            if (options.iconOn !== undefined) 
                this.SetIconOn (options.iconOn);

            // doorType
            if (options.doorType!=undefined) 
                this.SetDoorType (options.doorType); 

            //  windowConfig - like "1,0,2" means 3 leafs, first is gSwingLeft, middle is deaf and the third is gSwingRight
            if (options.windowConfig != undefined && 
                this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                // trim
                if (options.windowConfig != null && options.windowConfig.replace(/^\s+|\s+$/g, '') != "")
                {                
                    this.SetWindowType (options.windowConfig);
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                    this.ShowBlindState();
                }
            }
                
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeText) {
                if (options.staticText != undefined && options.staticTextFont != undefined && options.staticTextColor != undefined) 
                    this.SetStaticText (options.staticText, options.staticTextFont, options.staticTextColor);
                else
                if (options.staticText != undefined && options.staticTextFont != undefined) 
                    this.SetStaticText (options.staticText, options.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticText != undefined && options.staticTextColor != undefined) 
                    this.SetStaticText (options.staticText, this.settings.staticTextFont, options.staticTextColor);
                else
                if (options.staticTextFont != undefined && options.staticTextColor != undefined) 
                    this.SetStaticText (this.settings.staticText, options.staticTextFont, options.staticTextColor);
                else
                if (options.staticText != undefined) 
                    this.SetStaticText (options.staticText, this.settings.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticTextFont != undefined) 
                    this.SetStaticText (this.settings.staticText, options.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticTextColor != undefined) 
                    this.SetStaticText (this.settings.staticText, this.settings.staticTextFont, options.staticTextColor);
            }
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                if (options.infoTextFont != undefined && options.infoTextColor != undefined) 
                    this.SetInfoText (this.dynStates.infoText, options.infoTextFont, options.infoTextColor);
                else
                if (options.infoTextColor != undefined) 
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, options.infoTextColor);
                else
                if (options.infoTextFont != undefined) 
                    this.SetInfoText (this.dynStates.infoText, options.infoTextFont, this.settings.infoTextColor);
                    
                if (options.infoFormat != undefined) {
                    this.settings.infoFormat = options.infoFormat;
                    this.SetInfoText (this.dynStates.infoText, this.dynStates.infoTextFont, this.dynStates.infoTextColor);
                }
                if (options.infoCondition != undefined) {
                    this.settings.infoCondition = options.infoCondition;
                    this.SetInfoText (this.dynStates.infoText, this.dynStates.infoTextFont, this.dynStates.infoTextColor);
                }
                if (options.infoIsHideInactive != undefined) {
                    this.settings.infoIsHideInactive = options.infoIsHideInactive;
                    this.SetInfoText (this.dynStates.infoText, this.dynStates.infoTextFont, this.dynStates.infoTextColor);
                }
            }
               
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage && options.zindex != undefined){
                //this.settings.zindex = (options.zindex < 998) ? options.zindex: 997; 
                this.settings._jelement.css({'z-index':this.settings.zindex});
            }
            if (isSave) {
                this.settings = $.extend (this.settings, options);
                this.StoreSettings ();
            }
        }
        // Get all options as parameter
        this.GetStates = function () {
            var dynOptions = hqWidgets.Clone (this.dynStates);
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) 
            {
                dynOptions.windowState = "";
                var index = 0;
                while (this.settings._blinds[index])
                    dynOptions.windowState = ((options.windowState == "") ? "" : ",") + this.settings._blinds[index].state;
            }
        }
        this.GetAdvSettings = function () {
            var advOptions = new Object ();
            advOptions.parent   = this.advSettings.parent;
            advOptions.elemName = this.advSettings.elemName;
            return advOptions;
        }
        this.GetSettings = function (isAllOrName) {
            var options = new Object ();

            if (isAllOrName !== undefined && isAllOrName !== true && isAllOrName !== false)
                return this.settings[isAllOrName];
            
            
            for(var propertyName in this.settings) {
                if (propertyName[0] == '_')
                    continue;
                if ((isAllOrName === undefined || isAllOrName === false) && this.settings[propertyName] === null)
                    continue;
                    
                // ignore some settings
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer && 
                    (propertyName == "dimmerColorAct" || propertyName == "dimmerThick"  || propertyName == "dimmerColorInact"))
                    continue;

                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeDoor && propertyName == "doorType")
                    continue;
                    
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && propertyName == "windowConfig")
                    continue;
                    
                options[propertyName] = this.settings[propertyName];
            }
            if (options.iconName) options.iconName = (options.iconName.substring(0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? options.iconName.substring(hqWidgets.gOptions.gPictDir.length) : options.iconName;
            if (options.iconOn)   options.iconOn   = (options.iconOn.substring  (0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? options.iconOn.substring  (hqWidgets.gOptions.gPictDir.length) : options.iconOn;
            return options;
             /*
            options.buttonType = this.settings.buttonType;
            options.x          = this.settings.x;
            options.y          = this.settings.y;
            options.width      = this.settings.width;
            options.height     = this.settings.height;
            
            try
            {
                if (this.settings._jinfoText)	
                    options.infoTextCss=this.settings._jinfoText.css();
            }
            catch (err)
            {
            }
            if (this.settings.radius != null && this.radius != undefined) options.radius = this.settings.radius;
            if (this.settings.room)                     options.room         = this.room;
            if (this.settings.title != null)            options.description  = this.settings.title;
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) options.windowConfig = this.settings.windowConfig;
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDoor)  options.doorType = this.settings.doorType;
            if (this.settings.iconName)                 options.iconName = (this.settings.iconName.substring(0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? this.settings.iconName.substring(hqWidgets.gOptions.gPictDir.length) : this.settings.iconName;
            if (this.settings.iconOn)                   options.iconOn   = (this.settings.iconOn.substring  (0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? this.settings.iconOn.substring  (hqWidgets.gOptions.gPictDir.length) : this.settings.iconOn;
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeText){
                options.staticText      = this.settings.staticText;
                options.staticTextFont  = this.settings.staticTextFont;
                options.staticTextColor = this.settings.staticTextColor;
            }
                
            return options;*/
        }

        // ------------ INIT ALL SETTINGS --------------------------------	
        if (options.x!=undefined && options.y!=undefined)
            this.settings._jelement.css ({top: options.y, left: options.x, position: 'absolute'}); // Set position
        
        // States and local variables
        //this.settings.zindex = (options.zindex != undefined) ? ((options.zindex < 998) ? options.zindex : 997) : ((options.buttonType == hqWidgets.gButtonType.gTypeImage) ? 0 : 1000);

        if (this.settings.isContextMenu && (typeof hqUtils != 'undefined') && hqUtils != null) {
            this.settings._contextMenu    = new hqUtils.ContextMenu ({parent: this});
            this.settings._contextMenu.Add ({text:hqWidgets.Type2Name(this.settings.buttonType)});
            this.settings._contextMenu.Add ({text:"Settings", action:function(elem){
                    var m   = new hqUtils.SettingsDialogContent({options: elem.GetSettings (), getImages: hqWidgets.gOptions.getImages}); 
                    var dlg = new hqUtils.Dialog ({
                        title:        hqWidgets.Translate("Settings"), 
                        contentClass: m, 
                        isOk:         true, 
                        isCancel:     true, 
                        height:       400, 
                        width:        300,
                        action: function (result) { 
                            if (result != hqWidgets.gDlgResult.gDlgOk) return; 
                            m.options.x = elem.settings.x;
                            m.options.y = elem.settings.y;
                            elem.SetSettings (m.options);
                        },
                        modal: true});			
                }
            });
            this.settings._contextMenu.Add ({line:true});
            this.settings._contextMenu.Add ({text:"Delete", action:function(elem){DeleteButton(elem);}});
        }
        
        // Images has no defined width and height (take it from image itself)
        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
            this.settings.width  = null;
            this.settings.height = null;
        }
        // If radius is not set, get the default radius
        if (this.settings.radius == null) {
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDoor && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                this.settings.radius = (this.settings.width > this.settings.height) ? this.settings.height / 2 : this.settings.width / 2;
        }

        // Remember actual position for calculations 
        this.settings.x = this.settings._jelement.position().left;
        this.settings.y = this.settings._jelement.position().top;
        
        // Apply all settings
        this.SetSettings (this.settings);
        
        // Show button
        this.ShowState ();
        
        // Disable context menu on the page
        if (this.settings.isContextMenu)
            document.oncontextmenu = function() {return false;};
    },
    // Creates in the parent table lines with settings
    hqButtonEdit: function (options, obj, additionalSettingsFunction)
    {
        var e_settings = {
            parent:    null,
            elemName:  'inspect',
            width:     200,
            imgSelect: null, // image selection dialog
            timeout:   500,  // object update timeout
        };
        var e_internal = {
            attr:            null,
            controlRadius:   null,
            obj:             null,
            iconChanged:     null, //function
            inactiveChanged: null,
            timer:           null,
            textChanged:     null,
            textFontChanged: null,
            textColorChanged:null,
            infoChanged:     null,
            infoFontChanged: null,
            infoColorChanged:null,
            parent:          null,
            state:           hqWidgets.gState.gStateOff, // Simulate state
            extra:           null,
        };
        this.e_settings = $.extend (e_settings, options);
        
        if (this.e_settings.parent == null)
            return;
            
        this.e_internal        = e_internal;
        this.e_internal.attr   = obj.GetSettings ();
        this.e_internal.obj    = obj;
        this.e_internal.parent = this;
        this.e_internal.extra  = additionalSettingsFunction;
        
        // clear all
        this.e_settings.parent.html("");
        
        var sText = "";
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp) {
            sText += "<tr><td>"+ hqWidgets.Translate("Test state:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_state'>";
        }
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind)
            sText += "<tr><td>"+ hqWidgets.Translate("Radius:")+"</td><td id='"+this.e_settings.elemName+"_radius'></td></tr>";

        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDoor) {
            sText += "<tr><td>"+ hqWidgets.Translate("Slide:")+"</td><td><select style='width: "+this.e_settings.width+"px'  id='"+this.e_settings.elemName+"_door'>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
            sText += "</select></td></tr>";
        }
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind) {
            var wnd = this.e_internal.attr.windowConfig;
            var a = wnd.split(',');
            
            sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;count:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wndCount'>";
            sText += "<option value='1' "+((a.length==1) ? "selected" : "") +">1</option>";
            sText += "<option value='2' "+((a.length==2) ? "selected" : "") +">2</option>";
            sText += "<option value='3' "+((a.length==3) ? "selected" : "") +">3</option>";
            sText += "<option value='4' "+((a.length==4) ? "selected" : "") +">4</option>";
            sText += "</select></td></tr>";
            
            var i;
            for (i =0 ; i < a.length; i++)
            {
                sText += "<tr><td>"+ hqWidgets.Translate("Slide&nbsp;type:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wnd"+i+"'>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingDeaf +"' " +((a[i] == hqWidgets.gSwingType.gSwingDeaf)  ? "selected" : "") +">"+hqWidgets.Translate("Not opened")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' " +((a[i] == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' " +((a[i] == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
                sText += "</select></td></tr>";
            }
        }
        
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText) {
            sText += "<tr><td>"+ hqWidgets.Translate("Icon:")+"</td><td>";
            sText += "<input id='"+this.e_settings.elemName+"_icon' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconName==undefined) ? "" : this.e_internal.attr.iconName)+"'>";
            sText += "<input id='"+this.e_settings.elemName+"_iconBtn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";
        }
        
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer&& 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeButton &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp) {
            sText += "<tr><td>"+ hqWidgets.Translate("Test text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_info'  type='text' value='"+(this.e_internal.obj.dynStates.infoText || "")+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoFont'  type='text' value='"+this.e_internal.attr.infoTextFont+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoColor' type='text' value='"+this.e_internal.attr.infoTextColor+"'></td></tr>";
        }
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeText) {
            sText += "<tr><td>"+ hqWidgets.Translate("Text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_text'  type='text' value='"+this.e_internal.attr.staticText+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_font'  type='text' value='"+this.e_internal.attr.staticTextFont+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_color' type='text' value='"+this.e_internal.attr.staticTextColor+"'></td></tr>";
        }  
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp) {
            sText += "<tr><td>"+ hqWidgets.Translate("Icon&nbsp;active:")+"</td><td>";
            sText += "<input id='"+this.e_settings.elemName+"_iconOn' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconOn == undefined) ? "":this.e_internal.attr.iconOn)+"'>";
            sText += "<input id='"+this.e_settings.elemName+"_iconOnBtn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";
        } 
        
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo) {
            sText += "<tr><td>"+ hqWidgets.Translate("Format string:")    +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_format'     type='text' value='"+this.e_internal.attr.infoFormat+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Active condition:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_condition'  type='text' value='"+this.e_internal.attr.infoCondition+"'></td></tr>";
            sText += "<tr><td>"+ hqWidgets.Translate("Hide inactive:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_hideInactive' "+((this.e_internal.attr.infoIsHideInactive) ? "checked" : "")+">";
        }  
        sText += "<tr><td>"+ hqWidgets.Translate("Description:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_title' type='text' value='"+((this.e_internal.attr.title) || "")+"'></td></tr>";

        this.e_settings.parent.append (sText);
        // Apply functionality
        
        if ((elem = document.getElementById (this.e_settings.elemName+'_state')) != null) {
            var _jcheckbox = $('#'+this.e_settings.elemName+'_state');
            elem.parent = this;
            this.e_internal.stateChanged = function ()
            {
                this.state = (this.state == hqWidgets.gState.gStateOff) ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                this.obj.SetStates ({state: this.state});
            };
            
            _jcheckbox.change (function () { this.parent.e_internal.stateChanged ();});
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_radius')) != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_radius'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.radius, 
                                                     max:      ((this.e_internal.attr.height>this.e_internal.attr.width) ? this.e_internal.attr.width/ 2:this.e_internal.attr.height/ 2), 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        obj_.e_internal.attr.radius = pos;
                                                        
                                                        if (!isNaN(obj_.e_internal.attr.radius))
                                                            obj_.e_internal.obj.SetSettings ({radius: obj_.e_internal.attr.radius}, true);
                                                     }
            });
        }	
        // Process doorType changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_door')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_door').change (function () {
                    this.parent.e_internal.attr.doorType = $(this).val();
                    this.parent.e_internal.obj.SetSettings ({doorType: this.parent.e_internal.attr.doorType}, true);
                });
        }		
        // Process window count changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_wndCount')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_wndCount').change (function () {
                    var iCnt = $(this).val();
                    var a = this.parent.e_internal.attr.windowConfig.split(',');
                    var i;
                    var newS = "";
                    for (i = 0; i < iCnt; i++) {
                        newS  += ((newS  == "") ? "" : ",") + ((i < a.length) ? a[i] : hqWidgets.gSwingType.gSwingRight);
                    }
                    
                    this.parent.e_internal.attr.windowConfig = newS;
                    this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    hqWidgets.hqButtonEdit (this.parent.e_settings, this.parent.e_internal.obj, this.parent.e_internal.extra);
                });
        }	
        // Process window types changes
        var i;
        for (i =0 ; i < 4; i++) {
            elem = document.getElementById (this.e_settings.elemName+'_wnd'+i);
            if (elem)
            {
                elem.parent = this;
                elem.index = i;
                $('#'+this.e_settings.elemName+'_wnd'+i).change (function () {
                        var a = this.parent.e_internal.attr.windowConfig.split(',');
                        var i;
                        var newS = "";
                        for (i = 0; i < a.length; i++)
                            newS  += ((newS  == "") ? "" : ",") + ((this.index != i) ? a[i] : $(this).val());
                        
                        this.parent.e_internal.attr.windowConfig = newS;
                        this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    });
            }	
        }				
        // Process center image
        if ((elem = document.getElementById (this.e_settings.elemName+'_icon')) != null) {
            var _jicon = $('#'+this.e_settings.elemName+'_icon');
            elem.parent = this;
            this.e_internal.iconChanged = function ()
            {
                this.attr.iconName = $('#'+this.parent.e_settings.elemName+'_icon').val();
                if (this.attr.iconName == "")
                    this.attr.iconName = null;
                this.obj.SetSettings ({iconName: this.attr.iconName}, true);
            };
            
            _jicon.change (function () { this.parent.e_internal.iconChanged ();});
            _jicon.keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.iconChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
            
            if (this.e_settings.imgSelect)
            {
                var _jiconBtn = $('#'+this.e_settings.elemName+'_iconBtn');
                _jiconBtn.bind("click", {msg: this}, function (event) {
                    var _obj = event.data.msg;
                    var _settings = {
                        current:     _obj.e_internal.attr.iconName,
                        onselectArg: _obj.e_settings.elemName,
                        onselect:    function (img, elemName)
                        {
                            $('#'+elemName+'_icon').val(_obj.e_settings.imgSelect.GetFileName(img, hqWidgets.gOptions.gPictDir));
                            $('#'+elemName+'_icon').trigger("change");
                        }};
                    _obj.e_settings.imgSelect.Show (_settings);                    
                });
            }
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_iconOn')) != null) {
            elem.parent = this;
            var _jiconOn = $('#'+this.e_settings.elemName+'_iconOn');
            this.e_internal.iconOnChanged = function ()
            {
                this.attr.iconOn = $('#'+this.parent.e_settings.elemName+'_iconOn').val();
                if (this.attr.iconOn == "")
                    this.attr.iconOn = null;
                this.obj.SetSettings ({iconOn: this.attr.iconOn}, true);
            };
            _jiconOn.change (function () { this.parent.e_internal.iconOnChanged ();});
            _jiconOn.keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {
                    elem.e_internal.iconOnChanged ();}, 
                this.parent.e_settings.timeout, this.parent);
            });
            if (this.e_settings.imgSelect) {
                var _jiconOnBtn = $('#'+this.e_settings.elemName+'_iconOnBtn');
                _jiconOnBtn.bind("click", {msg: this}, function (event) {
                    var _obj = event.data.msg;
                    var _settings = {
                        current:     _obj.e_internal.attr.iconOn,
                        onselectArg: _obj.e_settings.elemName,
                        onselect:    function (img, elemName)
                        {
                            $('#'+elemName+'_iconOn').val(_obj.e_settings.imgSelect.GetFileName(img, hqWidgets.gOptions.gPictDir));
                            $('#'+elemName+'_iconOn').trigger("change");
                        }};
                    _obj.e_settings.imgSelect.Show (_settings);                    
                });                           
            }
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_info')) != null) {
            elem.parent = this;
            this.e_internal.infoChanged = function ()
            {
                this.attr.infoText = $('#'+this.parent.e_settings.elemName+'_info').val();
                if (this.attr.infoText == "")
                    this.attr.infoText = undefined;
                this.obj.SetStates ({infoText: this.attr.infoText});
            };
            $('#'+this.e_settings.elemName+'_info').change (function () { this.parent.e_internal.infoChanged ();});
            $('#'+this.e_settings.elemName+'_info').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {
                    elem.e_internal.infoChanged ();}, 
                    this.parent.e_settings.timeout, this.parent);
            });
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_infoFont')) != null) {
            elem.parent = this;
            this.e_internal.infoFontChanged = function () {
                this.attr.infoTextFont = $('#'+this.parent.e_settings.elemName+'_infoFont').val();
                if (this.attr.infoTextFont == "")
                    this.attr.infoTextFont = undefined;
                this.obj.SetSettings ({infoTextFont: this.attr.infoTextFont}, true);
            };
            $('#'+this.e_settings.elemName+'_infoFont').change (function () { this.parent.e_internal.infoFontChanged ();});
            $('#'+this.e_settings.elemName+'_infoFont').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.infoFontChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_infoColor')) != null) {
            elem.parent = this;
            this.e_internal.infoColorChanged = function () {
                this.attr.infoTextColor = $('#'+this.parent.e_settings.elemName+'_infoColor').val();
                if (this.attr.infoTextColor == "")
                    this.attr.infoTextColor = undefined;
                this.obj.SetSettings ({infoTextColor: this.attr.infoTextColor}, true);
            };
            $('#'+this.e_settings.elemName+'_infoColor').change (function () { this.parent.e_internal.infoColorChanged ();});
            $('#'+this.e_settings.elemName+'_infoColor').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.infoColorChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_text')) != null) {
            elem.parent = this;
            this.e_internal.textChanged = function ()
            {
                this.attr.staticText = $('#'+this.parent.e_settings.elemName+'_text').val();
                this.obj.SetSettings ({staticText: this.attr.staticText}, true);
            };
            $('#'+this.e_settings.elemName+'_text').change (function () { this.parent.e_internal.textChanged ();});
            $('#'+this.e_settings.elemName+'_text').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.textChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_font')) != null) {
            elem.parent = this;
            this.e_internal.textFontChanged = function ()
            {
                this.attr.staticTextFont = $('#'+this.parent.e_settings.elemName+'_font').val();
                this.obj.SetSettings ({staticTextFont: this.attr.staticTextFont}, true);
            };
            $('#'+this.e_settings.elemName+'_font').change (function () { this.parent.e_internal.textFontChanged ();});
            $('#'+this.e_settings.elemName+'_font').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.textFontChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_color')) != null) {
            elem.parent = this;
            this.e_internal.textColorChanged = function ()
            {
                this.attr.staticTextColor = $('#'+this.parent.e_settings.elemName+'_color').val();
                this.obj.SetSettings ({staticTextColor: this.attr.staticTextColor}, true);
            };
            $('#'+this.e_settings.elemName+'_color').change (function () { this.parent.e_internal.textColorChanged ();});
            $('#'+this.e_settings.elemName+'_color').keyup (function () {
                if (this.parent.e_internal.timer) clearTimeout (this.parent.e_internal.timer);
                this.parent.e_internal.timer = setTimeout (function(elem) {elem.e_internal.textColorChanged ();}, this.parent.e_settings.timeout, this.parent);
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_title')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_title').change (function () { 
                this.parent.e_internal.attr.title = $('#'+this.parent.e_settings.elemName+'_title').val();
                this.parent.e_internal.obj.SetSettings ({title: this.parent.e_internal.attr.title}, true);
            });
            
            $('#'+this.e_settings.elemName+'_title').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_title'));
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_format')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_format').change (function () { 
                this.parent.e_internal.attr.infoFormat = $('#'+this.parent.e_settings.elemName+'_format').val();
                this.parent.e_internal.obj.SetSettings ({infoFormat: this.parent.e_internal.attr.infoFormat}, true);
            });
            
            $('#'+this.e_settings.elemName+'_format').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_format'));
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_condition')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_condition').change (function () { 
                this.parent.e_internal.attr.infoCondition = $('#'+this.parent.e_settings.elemName+'_condition').val();
                this.parent.e_internal.obj.SetSettings ({infoCondition: this.parent.e_internal.attr.infoCondition}, true);
            });
            
            $('#'+this.e_settings.elemName+'_condition').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_condition'));
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_hideInactive')) != null) {
            var _jcheckbox = $('#'+this.e_settings.elemName+'_hideInactive');
            elem.parent = this;
            this.e_internal.inactiveChanged = function ()
            {
                this.attr.infoIsHideInactive = $('#'+this.parent.e_settings.elemName+'_hideInactive').prop('checked');
                this.obj.SetSettings ({infoIsHideInactive: this.attr.infoIsHideInactive}, true);
            };
            
            _jcheckbox.change (function () { this.parent.e_internal.inactiveChanged ();});
        }	
        if (this.e_internal.extra)
            this.e_internal.extra ();
    },
    // Slider element for e_settings
    hqSlider: function (options){
        var settings = {
            parent:   $('body'),
            x:        null,
            y:        null,
            width:    100,  // - default horizontal
            height:   null, // - if vertical
            withText: true,
            min:      0,
            max:      100,
            position: null,
            onchange: null,   //- function (newPos, param)
            onchangePrm: null,
            orientation: 'horizontal',
        };
        var internal = {
            elemName:   null,
            isVertical: false,
            maxLength:  5,
            sposition:  999999,
            isVisible:  true,
            jelement:   null,
            element:    null,
            slider:     null,
            scale:      null,
            scalePos:   null,
            handler:    null,
            changed:    null, // function
            timer:      null,
            text:       null,
        };
        
        this.settings = $.extend (settings, options);
        this.internal = internal;
        var i = 0;
        while (document.getElementById ("slider_"+i)) i++;
        this.internal.elemName = "slider_"+i;
        this.internal.isVertical = (this.settings.orientation == 'vertical') || (this.settings.height != undefined);
        if (this.internal.isVertical) 
            this.settings.height = this.settings.height || 100;
        this.internal.maxLength  = (this.settings.max >= 10000) ? 5 : ((this.settings.max >= 1000) ? 4 : ((this.settings.max >= 100) ? 3: ((this.settings.max >= 10) ? 2 : 1)));

        var sText = "<table id='"+this.internal.elemName+"'><tr>";
        if (this.settings.withText) {
            sText += "<td><input type='text' id='"+this.internal.elemName+"_text' maxlength='"+this.internal.maxLength+"'></td>";
            if (this.internal.isVertical) 
                sText += "</tr><tr>";
        }
        sText += "<td><div id='"+this.internal.elemName+"_bar'></div></td></tr></table>";
        
        this.settings.parent.append (sText);
        this.internal.jelement = $('#'+this.internal.elemName).addClass("h-no-select");
        this.internal.slider   = $('#'+this.internal.elemName+'_bar').addClass("h-no-select");
        this.internal.slider.parent = this;
        
        if (this.settings.x != undefined)
            this.internal.jelement.css ({position: 'absolute', left: this.settings.x, top: (this.settings.y !== null) ? this.settings.y: 0});
        
        // Add class
        if (this.internal.isVertical) 
            this.internal.slider.addClass ('hq-slider-base-vert').css({height: '100%'});
        else 
            this.internal.slider.addClass ('hq-slider-base-horz').css({width: '100%'});
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_scale'></div>");
        this.internal.element = document.getElementById (this.internal.elemName+'_bar');
        this.internal.scale = $('#'+this.internal.elemName+"_scale");
        
        if (this.internal.isVertical) 
            this.internal.scale.css({position: 'absolute', top: 0, left: (this.internal.slider.width() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-vert");
        else 
            this.internal.scale.css({position: 'absolute', left: 0, top: (this.internal.slider.height() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-horz");
        
        this.internal.scale.append("<div id='"+this.internal.elemName+"_scalePos'></div>").addClass("h-no-select");
        this.internal.scalePos = $('#'+this.internal.elemName+"_scalePos");
        this.internal.scalePos.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.scalePos.addClass("ui-state-hover").addClass("hq-slider-control-pos-vert");
        else  
            this.internal.scalePos.addClass("ui-state-hover").addClass ("hq-slider-control-pos-horz");
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_handler'></div>");
        this.internal.handler = $('#'+this.internal.elemName+"_handler");
        this.internal.handler.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-vert");
        else 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-horz");
        
        if (this.settings.withText) {
            this.internal.text = $('#'+this.internal.elemName+'_text').addClass('hq-slider-info');
            var elem = document.getElementById (this.internal.elemName+'_text');
            var timeout = 500;
            if (elem)
            {
                elem.parent = this;
                this.internal.parent = this;
                this.internal.changed = function ()
                {
                    var iPos = parseInt($('#'+this.elemName+'_text').val());
                    if (!isNaN(iPos))
                    {
                        this.parent.SetPosition (iPos);
                    }						
                };
                
                $('#'+this.internal.elemName+'_text').change (function () {this.parent.internal.changed ();});
                $('#'+this.internal.elemName+'_text').keyup (function () {
                    if (this.parent.internal.timer) clearTimeout (this.parent.internal.timer);
                    this.parent.internal.timer = setTimeout (function(elem) { elem.changed (); }, 500, this.parent);
                });
            }		
            
            this.internal.text.change (function () {			
                this.parent.SetPosition (parseInt ($(this).val()));
            });	}
            
        if (this.internal.isVertical) 
            this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
        else 
            this.internal.slider.css({width: this.settings.width   - ((this.internal.text) ? this.internal.text.width() : 0)});

        this.SetPosition = function (newPos, isForce) {
            newPos = parseInt (newPos);
            if (newPos < this.settings.min) newPos = this.settings.min;
            if (newPos > this.settings.max) newPos = this.settings.max;
            
            if (this.internal.sposition != newPos || isForce)
            {
                this.internal.sposition=newPos;
                if (this.internal.isVertical)
                {
                    var k = this.internal.slider.height()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({height:k});
                    this.internal.handler.css({top:k - this.internal.handler.height()/2});
                }
                else
                {
                    var k = this.internal.slider.width()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({width:k});
                    this.internal.handler.css({left:k - this.internal.handler.width()/2});
                }
                if (this.internal.text)
                    document.getElementById (this.internal.elemName + "_text").value = ""+newPos;
                    
                if (this.settings.onchange)
                    this.settings.onchange (this.internal.sposition, this.settings.onchangePrm);
            }
        };
        this.SetRange = function (min, max) {
            this.settings.min = min;
            this.settings.max = max;
            this.SetPosition (this.internal.sposition, true);
        }
        // Set length or height
        this.SetSize = function (size) {
            if (size != undefined)
            {
                if (this.internal.isVertical)
                {
                    this.settings.height = size;
                    this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
                }
                else 
                {
                    this.settings.width = size;
                    this.internal.slider.css({width: this.settings.width - ((this.internal.text) ? this.internal.text.width() : 0)});
                }

                this.SetPosition(this.internal.sposition, true);
            }
        }
        
        document.getElementById (this.internal.elemName+'_bar').parentQuery = this;
        this.OnMouseMove = function (x, y) {
            var pos;
            if (this.internal.isVertical)
            {
                var yOffset = y - this.internal.slider.offset().top;// - this.slider.position().top;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.height () * yOffset + this.settings.min;
            }
            else
            {
                var xOffset = x - this.internal.slider.offset().left; //this.slider.position().left;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.width () * xOffset + this.settings.min;
            }
            this.SetPosition (pos);
        }
        this.OnMouseDown = function (x, y, isTouch) {
            hqWidgets.gDynamics.gActiveSlider = this;
            hqWidgets.onMouseMove (x, y);	
            return false;
        }
        this.internal.slider.bind ("mousedown", {msg: this}, function (e) {
            if (e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) e.preventDefault();	
            return false;
        });
        this.internal.element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            hqWidgets.gDynamics.gIsTouch=true;
            e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true);
        }, false);
        this.Position = function () {
            return this.internal.sposition;
        }
        this.Show = function () {
            this.internal.isVisible = true;
            this.internal.jelement.show();
            return this;
        }
        this.Hide = function () {
            this.internal.isVisible = false;
            this.internal.jelement.hide();
            return this;
        }	
        this.SetPosition ((this.settings.position !== null) ? this.settings.position : this.settings.min);
    },

};