/*
hqWidgets is a Уhigh qualityФ home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button Ц To present and/or control some switch (e.g. Lamp)
- Dimmer Ц To present and control dimmer
- Window blind Ц to present and control one blind and display up to 4 window leafs
- Indoor temperature Ц to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature Ц to display outdoor temperature and humidity
- Door   Ц to present a door
- Lock   Ц to present and control lock
- Image  Ц to show a static image
- Text   Ц to show a static text with different colors and font styles
- Info   Ц To display some information. Supports format string, condition for active state and different icons for active and static state.
 
------ Version V0.1 ------
 
 
----
Used software and icons:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
* door bell by Lorc http://lorcblog.blogspot.de/
 
 
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
    version: "0.1.1",
    gOptions: {
        // ======== Global variables ============
        gBtWidth:      45,          // Width of the button >= gBtHeight
        gBtHeight:     45,          // Height of the button
        gBtIconWidth:  32,          // Width of the icon of button
        gBtIconHeight: 32,          // Heigth of the icon of button
        gPictDir:      "img/",      // Pictures directory
        gLocale:       'de',        // Localisation for float formatting
        gCancelText:   'Close',     // Cancel text
        gCyclicTimer:  null,        // Garbage collector timer
        gCyclicInterval:60000,      // Garbage collector and state update interval
        gGetFiles:     null,        // Callback function to get the list of images/wavs (used only if hqUtils used)
                                    // getFiles (callback, userParam) - callback must be called as the image list received from server  
                                    // like callback (imageList, userParam);
                                    // e.g. "function GetFiles (callback, param) { if (callback) callback (aImages, param); }"
        gTempSymbol:   '&#176;C',   // Farenheit or celcius
        gIsTouchDevice: false,      // if desctop or touch device
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
        gTypeCam    : 13,  // Ip Camera
        gTypeGong   : 14,  // Gong indicator with camera view on knock
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
    // Window handle position
    gHandlePos: {
        gPosUnknown: 0,
        gPosClosed:  1,
        gPosTilted:  2,
        gPosOpened:  3
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
        gClickTimer          : null,    // Timer to filer out the double clicks
    },
    Translate: function (text) {
            if (!this.words) {
            this.words = {
                "IP Camera"                 : {"en": "IP Camera",       "de": "IP Kamera",              "ru" : " амера"},
                "Description:"              : {"en": "Description:",    "de": "Beschreibung:",          "ru" : "ќписание:"},
                "Close"                     : {"en": "Hide",            "de": "Ignore",                 "ru" : "—пр€тать"},
                "Advanced..."               : {"en": "Advanced...",     "de": "Erweitert...",           "ru" : "≈щЄ"},
                "Pop up delay (ms):"        : {"en": "Pop up delay (ms):", "de": "Verzogerung (ms)",    "ru" : "«адержка закрыти€ (мс):"},
                "Open door button:"         : {"en": "Open door button:",  "de": "'Tur aufmachen' Knopf:","ru" : " нопка 'ќткрыть дверь'"},
                "Small image update(sec):"  : {"en": "Small image update(sec):",    "de": "Kleines Bild erneuern(Sek):",    "ru" : "ќбновление мал. картинки:"},
                "Open door text:"           : {"en": "Open door text:", "de": "Knopfbeschrieftung:",    "ru" : "“екст на кнопке:"},
                "Open&nbsp;lock"            : {"en": "Open&nbsp;lock",  "de": "Aufmachen",              "ru" : "ќткрыть"},
                "Open the door?"            : {"en": "Open the door?",  "de": "Tur aufmachen?",         "ru" : "ќткрыть дверь?"},
                "Simulate click"            : {"en": "Simulate click",  "de": "Simuliere Click",        "ru" : "ўелчок мышью"},
                "Test state"                : {"en": "Test state",      "de": "Zustand testen",         "ru" : "ѕроверить состо€ние"},
           };
        }
        if (this.words[text]) {
            if (this.words[text][this.gOptions.gLocale])
                return this.words[text][this.gOptions.gLocale];
            else 
            if (this.words[text]["en"])
                return this.words[text]["en"];
        }

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
        //$('#status').append("global UP<br>");
        // Workaround for tablets
        if (hqWidgets.gDynamics.gClickTimer)
            return;
            
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
            this.gDynamics.gActiveBig.intern._jbigWindow.OnMouseMove (x_,y_);//.SetPositionOffset(y_ - this.gDynamics.gActiveBig.cursorY);
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
    // Delete button from the list
    CyclicService: function (isStop) {
        if (isStop) {
            if (this.gDynamics.gCyclicTimer) {
                clearTimeout(this.gDynamics.gCyclicTimer);
                this.gDynamics.gCyclicTimer = null;
            }
            return;
        }
    
        var isDeleted;
        do {
            var i = 0;
            isDeleted = false;
            // Check all buttons
            while (this.gDynamics.gElements[i]) {
                // If button exists but container not => delete button
                if (!document.getElementById (this.gDynamics.gElements[i].advSettings.elemName)) {
                    isDeleted = true;
                    this.Delete (this.gDynamics.gElements[i]);
                    break;
                }
                i++;
            }
        }while (isDeleted);
        
        i = 0;
        var dt = new Date ();
        // Check all buttons
        while (this.gDynamics.gElements[i]) {
            // If button exists but container not => delete button
            this.gDynamics.gElements[i].CheckStates (dt);
            i++;
        }    
        this.gDynamics.gCyclicTimer = setTimeout (function (elem) {
            elem.CyclicService ();
        }, this.gOptions.gCyclicInterval, this);
    },
    // Create and add button to the list
    Create: function (options, advOptions) {
        var btnObj = new this.hqButton (options, advOptions);
        this.Add (btnObj);
        return btnObj;
    },
    SetEditMode: function  (isEditMode) {
        if (isEditMode == true) {
            this.gDynamics.gIsEditMode = true;
        }
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
    GetTimeInterval: function (oldTime, newTime) {
        if (newTime === undefined)
            newTime = new Date ();
        var seconds = (newTime.getTime() - oldTime.getTime ()) / 1000;
        if (seconds <= 3600)
            return "vor "+ Math.floor (seconds / 60)+" Min.";
        if (seconds <= 3600*24)
            return "vor "+ Math.floor (seconds / 3600)+" St. und "+Math.floor (seconds / 60)+" Min.";
        if (seconds > 3600*24 && seconds <= 3600*48)
            return "gestern";
        if (seconds > 3600*48)
            return "vor "+ Math.floor (seconds / 3600)+" Stunden";
    },
    // Format timr
    TimeToString: function (time) {
        var dateStr = "";
        var t = time.getFullYear();
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t + ".";
        
        t = time.getMonth() + 1;
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t + ".";
        
        t = time.getDate();
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t + " ";
        
        t = time.getHours();
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t + ":";

        t = time.getMinutes();
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t + ":";

        t = time.getSeconds();
        t = (t < 10) ? "0" + t : "" + t;
        dateStr += t;
        return dateStr;
    },
    // Install document handlers
    Init: function (options) {
        // Set breakpoint here if you want to debug hqWidgets.html
        this.gOptions = $.extend (this.gOptions, options);
        this.gOptions.gIsTouchDevice = 'ontouchstart' in document.documentElement;
    
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
        this.CyclicService ();
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
            noBackground:     false,    // If show background or just text or image
            
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
            noBackground:     false, // If show background or just text or image
            usejQueryStyle:   false, // Use jQuery style for active/passive background
            ipCamImageURL:    null,  // Url of image
            ipCamVideoURL:    null,  // Video Url
            ipCamUpdateSec:   30,    // Update interval in seconds
            popUpDelay:       5000,  // Dela for popup window, like camera, blinds
            openDoorBttn:    false, // Show action button on ip camera big window
            openDoorBttnText:hqWidgets.Translate("Open&nbsp;lock"), // Action button text for camera popup
            ipCamVideoDelay:  1000,  // Video delay
            gongMelody:       null,  // Play melody if gong goes from Off to On
            gongActionBtn:    false, // Show on the gong dialog Bell button
            gongQuestion:     hqWidgets.Translate("Open the door?"), // Text for the door bell question
            gongQuestionImg:  "DoorOpen.png", // Icon by question
            gongBtnText:      "Gong",// Text for button play gong
            hoursLastAction:  3,     // If the last action time must be shown (-1 - do not show, 0 -always show, x - not older as x hours, -2 show absolute time always, "-x" - show absolute time x hours
            stateTimeout:     600,   // 5 min state timeout
            showChanging:     true,  // Show changes as animation
            heatCtrlMin:      6,     // Min for inner temperature control
            heatCtrlMax:      30,    // Max for inner temperature control
        };
        
        // Dynamical states (will not be stored)
        var dynStates = {
            // Dynamic variables (Will not be stored)
            infoText:    null,          // Dynamic text in the middle of the button
            state:       hqWidgets.gState.gStateUnknown, // Unknown, active, inactive
            hndState:    hqWidgets.gHandlePos.gPosClosed, // Set default position to closed
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
            bigPinned:   false,         // If big window pinned or not
            };
        
        // Local variables (Will not be stored)
        var intern = {
            // Local variables (Will not be stored)
            _contextMenu: null,         // Context menu
            _element:     null,         // HTML container as object
            _center:      null,         // HTML container of center image
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
            _percentStateSet: 0,        // Set value for percent state or for inner temperature control
            _ipCamUpdateTimer: null,    // ip cam update timeout
            _ipCamLastImage: null,      // last loaded image
            _ipCamImageURL:  null,      // url with & or ?
            _ipCamBigTimer: null,       // timer for update of big image
            _isBigVisible: false,       // if big window visible or not
            _lastAction:  null,         // Last time the element has status ON
            _lastUpdate:  null,         // Last time the element was updated, to detect comm break
            
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
            _jsetTemp:    null,         // jQuery set temperature in the middle, when control
            _jrightText:  null,         // jQuery percent or text with one line in the right panel
            _jleft:       null,         // jQuery left panel for room and button name (in Edit mode)
            _jroom:       null,         // jQuery room in the left panel
            _jdesc:       null,         // jQuery description in the left panel
            _jvalve:      null,         // jQuery valve position in the right panel
            _jsettemp:    null,         // jQuery set temperature in the right panel
            _jcircle:     null,         // jQuery cycle behind the button
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
        this.intern    = intern;
        
        this.intern._element = document.getElementById (this.advSettings.elemName);
        // Create HTML container if not exists
        if (!this.intern._element) {
            var $newdiv1 = $('<div id="'+this.advSettings.elemName+'"></div>');
            this.advSettings.parent.append ($newdiv1); 
            this.intern._element = document.getElementById (this.advSettings.elemName);
        }
        else {
            $(this.intern._element).empty();
        }
        
        this.intern._jelement = $('#'+this.advSettings.elemName);
        
        // ------- Functions ----------	
        this._DrawOneWindow = function (index, type, xoffset, width_, height_) {
            var name = this.intern._jelement.attr("id")+"_"+index;
            if (!this.intern._jelement.leaf) this.intern._jelement.leaf = new Array ();
            this.intern._jelement.prepend("<div id='"+name+"_0' class='hq-blind-blind1'></div>");
            var wnd = new Object ();
            wnd.ooffset = (Math.tan(10 * Math.PI/180) * width_)/2 + 2;
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
            // handle
            /*wnd.divs[4] = $("#"+name+"_4");
            wnd.divs[4].css({height: 9, width: 2, top: '50%', left: 0}); // Set size
            wnd.divs[4].addClass('hq-no-select');*/
            
            this.intern._jelement.leaf[index] = wnd;
            
            wnd.divs[3].parentQuery=this;
            if (!this.intern._blinds) this.intern._blinds = new Array ();
            this.intern._blinds[index] = wnd;
        }
        this._GetWindowType = function () {
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
            {
                var result = "";
                var i;
                for (i = 0; i < this.intern._blinds.length; i++)
                    result += ((result=="") ? "" : ",") + this.intern._blinds[i].style;
                return result;
            }
            else
                return "";
        }
        this._PlayMelody = function () {
            if (this.settings.gongMelody) {
                $("#sound_").remove()
                $('body').append('<embed id="sound_" autostart="true" hidden="true" src="' + ((this.settings.gongMelody.indexOf('/') == -1) ? hqWidgets.gOptions.gPictDir : "") + this.settings.gongMelody + '" />');
            }        
        }
        // Set current style class for background (timems - time in ms for effects
        this._SetClass = function (newClass, timems)	{
            if (this.intern._currentClass != newClass)
            {
                //if (this.isIgnoreEditMode)
                //	$('#status').append ("show " + newClass +" " +timems +"<br>");
                    
                if (timems)
                    this.intern._jelement.removeClass (this.intern._currentClass).addClass(newClass);
                else
                    this.intern._jelement.removeClass (this.intern._currentClass).addClass(newClass);
                this.intern._currentClass = newClass;
            }
        }		
        // Check if the state do not go to unknown or update the last action time
        this._CreateRightInfo = function () {
            if (!document.getElementById(this.advSettings.elemName+'_right')) {
                var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_right"></div>');
                this.advSettings.parent.append ($newdiv1);
            }
            
            this.intern._jright=$('#'+this.advSettings.elemName+"_right");
            this.intern._jright.css({position:     'absolute', 
                                       top:          this.settings.y, 
                                       left:         this.settings.x+this.settings.width/2, 
                                       borderRadius: 10, 
                                       height:       30, 
                                       width:        hqWidgets.gOptions.gBtWidth*0.7 + this.settings.width/2, 
                                       'z-index':    (this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1, 
                                       fontSize:     10, 
                                       color:        'black'}); // Set size 
                                       
            this.intern._jright.addClass ("hq-button-base-info").show();
            
            if (!document.getElementById(this.advSettings.elemName+"_rightText"))
                this.intern._jright.prepend("<div id='"+this.advSettings.elemName+"_rightText'></div>");
                
            this.intern._jrightText=$('#'+this.advSettings.elemName+"_rightText");
            this.intern._jrightText.css({position: 'absolute', 
                                         top:      10, 
                                         left:     (this.intern._jelement.width()/2 + 7), 
                                         height:   15, 
                                         'z-index':'2', 
                                         fontSize: 9, 
                                         color:    'black'}); // Set size
            this.intern._jrightText.addClass('hq-no-select').show();
            this.intern._jright.addClass('hq-no-select');
        }
        this._SetType = function (buttonType) {
            if (this.settings.buttonType == buttonType && this.intern._inited)
                return;

            var width  = this.intern._jelement.width();
            var height = this.intern._jelement.height();

            // Delete old structures
            if (this.intern._currentClass != undefined && this.intern._currentClass != "") 
                this.intern._jelement.removeClass (this.intern._currentClass);
                
            if (this.settings.buttonType != undefined && this.intern._inited) {
                this.intern._backOff        = "";
                this.intern._backOffHover   = "";
                this.intern._backOn         = "";
                this.intern._backOnHover    = "";
                this.intern._backMoving     = "";
                
                this.intern._isBigVisible   = false;

                this.intern._jelement.html("");
                this.intern._jelement.removeClass ("hq-button-base");
                this.intern._jelement.removeClass ('hq-blind-base');
                this.intern._jelement.removeClass ('hq-door-black');
                this.intern._jelement.removeClass ("hq-background");
               
                // Stop update timer
                if (this.intern._iuCamUpdateTimer) {
                    clearTimeout (this.intern._iuCamUpdateTimer);
                    this.intern._ipCamUpdateTimer = null;
                }
                
                if (this.intern._jbigWindow) {
                    this.intern._isBigVisible = false;
                    this.intern._jbigWindow.html("").hide();
                    this.intern._jbigWindow.remove ();
                    this.intern._jbigWindow = null;                
                }
                if (this.intern._jright)
                {
                    this.intern._jright.html("").hide();
                    this.intern._jright.remove();
                    this.intern._jright = null;
                }              
                this.intern._jtemp       = null;
                this.intern._jsetTemp    = null;
                this.intern._jhumid      = null;
                this.intern._jvalve      = null;
                this.intern._jsettemp    = null;					
                this.intern._jbigBlind1  = null;
                this.intern._jdoor       = null;
                this.intern._jdoorHandle = null;
                this.intern._jstaticText = null;
                
                if ( this.intern._jcenter) {
                    this.intern._jcenter.html("");
                    this.intern._jcenter = null;
                    this.intern._center  = null;
                }
                if ( this.intern._jcircle) {
                    this.intern._jcircle.remove("");
                    this.intern._jcircle=null;
                }
        
                //this.intern._jelement.removeAttr("style")
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                {
                    if (this.intern._contextMenu)
                    {
                        this.intern._contextMenu.Remove("Bring to back");
                        this.intern._contextMenu.Remove("Bring to front");
                    }
                }
	
                // Destroy icon
                if (this.intern._jicon) {
                    this.intern._jicon = null;
                }		
            }

            this.settings.buttonType = (buttonType==undefined) ? hqWidgets.gButtonType.gTypeButton : buttonType;
            this.SetTitle (this.settings.room, this.settings.title);

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeLock    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeButton  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {
                // Colors of the states
                this._SetUsejQueryStyle (this.settings.usejQueryStyle);
                this.intern._jelement.addClass ("hq-button-base");
                this.intern._jelement.addClass ("hq-no-select");
                this.intern._jelement.css ({width:        this.settings.width, 
                                              height:       this.settings.height, 
                                              borderRadius: this.settings.radius, 
                                              'z-index':    this.settings.zindex}); // Set size
        
                // Create circle 
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) {                
                    if (!document.getElementById(this.advSettings.elemName+'_circle')) {
                        var $newdiv1 = $('<canvas id="'+this.advSettings.elemName+'_circle" width="'+(this.settings.width + this.settings.dimmerThick*2)+'" height="'+(this.settings.height + this.settings.dimmerThick*2)+'"></canvas>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    this.intern._jcircle=$('#'+this.advSettings.elemName+"_circle");
                    this.intern._jcircle.addClass('hq-no-select').show();
                    this.intern._jcircle.radius = (this.settings.width + this.settings.dimmerThick) / 2 - 3;
                    this.intern._jcircle.css({position: 'absolute', 
                                                top:    this.settings.y - this.settings.dimmerThick, 
                                                left:   this.settings.x - this.settings.dimmerThick, 
                                                'z-index':(this.settings.zindex == 'auto') ? -2 : this.settings.zindex-2,  
                                                color:'yellow'}); // Set size
                    
                    this.intern._jcircle.canvas = document.getElementById(this.advSettings.elemName+'_circle');
                    this.intern._jcircle.context = this.intern._jcircle.canvas.getContext('2d');
                    this.intern._jcircle.x = this.intern._jcircle.canvas.width  / 2;
                    this.intern._jcircle.y = this.intern._jcircle.canvas.height / 2;
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        this._CreateRightInfo ();
                    }
                    this._ShowCircleState();
                }
                
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp || 
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                    // Temperature and humidity
                    if (!document.getElementById(this.advSettings.elemName+"_temp"))
                        this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_temp'></div>");
                    if (!document.getElementById(this.advSettings.elemName+"_humid"))
                        this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_humid'></div>");
                    this.intern._jtemp=$('#'+this.advSettings.elemName+"_temp");
                    this.intern._jhumid=$('#'+this.advSettings.elemName+"_humid");
                    this.intern._jtemp.css({position: 'absolute', top:this.settings.height/2-11, left:0, height: 15, width: this.settings.width, 'z-index':'11', fontSize:11, 'font-weight':'bold', color:'black'}); // Set size
                    this.intern._jtemp.css("text-align", "center").show();
                    this.intern._jhumid.css({position: 'absolute', top:this.settings.height/2+1, left:0, height: 15, width: this.settings.width, 'z-index':'11', fontSize:11, 'font-weight':'normal', color:'darkblue'}); // Set size
                    this.intern._jhumid.css("text-align", "center").show();
                    this.intern._jtemp.addClass('hq-no-select');
                    this.intern._jhumid.addClass('hq-no-select');
                    this.intern._jhumid.parentQuery=this;
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        if (!document.getElementById(this.advSettings.elemName+"_setTempCtrl"))
                            this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_setTempCtrl'></div>");
                        this.intern._jsetTemp=$('#'+this.advSettings.elemName+"_setTempCtrl");
                        this.intern._jsetTemp.css({position: 'absolute', top:this.settings.height/2-10, left:0, height: 15, width: this.settings.width, 'z-index':'11', fontSize:14, 'font-weight':'bold', color:'black'}); // Set size
                        this.intern._jsetTemp.css("text-align", "center").hide();
                        this.intern._jsetTemp.addClass('hq-no-select');
                        this.intern._jsetTemp.parentQuery=this;
                    }
                    // create info on the right side
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        if (!document.getElementById(this.advSettings.elemName+'_right')) {
                            var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_right"></div>');
                            this.advSettings.parent.append ($newdiv1);
                        }
                        this.intern._jright=$('#'+this.advSettings.elemName+"_right");
                        this.intern._jright.css({position:  'absolute', 
                                                   top:       this.settings.y, 
                                                   left:      this.settings.x+this.settings.width/2,
                                                   borderRadius: 10, 
                                                   height:    30, 
                                                   width:     hqWidgets.gOptions.gBtWidth*0.8 + this.settings.width/2, 
                                                   'z-index': (this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1,  
                                                   fontSize:  10, 
                                                   color:     'black'}); // Set size 
                        this.intern._jright.addClass ("hq-button-base-info").show();
                        if (!document.getElementById(this.advSettings.elemName+"_valve"))
                            this.intern._jright.prepend("<div id='"+this.advSettings.elemName+"_valve'></div>");
                            
                        if (!document.getElementById(this.advSettings.elemName+"_settemp"))
                            this.intern._jright.prepend("<div id='"+this.advSettings.elemName+"_settemp'></div>");
                            
                        this.intern._jvalve  =$('#'+this.advSettings.elemName+"_valve");
                        this.intern._jsettemp=$('#'+this.advSettings.elemName+"_settemp");
                        this.intern._jvalve.css({position: 'absolute', 
                                                   top:15, 
                                                   left:this.settings.width/2+5, 
                                                   height: 15, 
                                                   'z-index':'2', 
                                                   fontSize:9, 
                                                   color:'black'}); // Set size
                        this.intern._jvalve.css("text-align", "left");
                        this.intern._jsettemp.css({position: 'absolute', 
                                                     top: 3, 
                                                     left:this.settings.width/2 + 1, 
                                                     height: 15, 
                                                     'z-index':'2', 
                                                     fontSize:9, 
                                                     color:'black'}); // Set size
                        this.intern._jsettemp.css("text-align", "left").show();
                        this.intern._jvalve.addClass('hq-no-select').show();
                        this.intern._jsettemp.addClass('hq-no-select');
                        this.intern._jright.addClass('hq-no-select');
                    }
                    this.SetTemperature ();
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeLock) {
                    this.SetSize (this.settings.width, this.settings.height, true);
                    this.intern._backMoving     = "hq-lock-moving";
                    this.intern._backOff        = "";
                    this.intern._backOffHover   = "";
                    this.intern._backOn         = "";
                    this.intern._backOnHover    = "";
                    this.settings.noBackground   = true;
                    
                    if (!document.getElementById(this.advSettings.elemName+'_lock')) {
                        var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_lock"></div>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    this.intern._jbigWindow=$('#'+this.advSettings.elemName+"_lock");
                    this.intern._jbigWindow.hide();
                    this.intern._jbigWindow.addClass('hq-lock-big');
                    this.intern._jbigWindow.addClass('hq-no-select');		
                    var xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    this.intern._jbigWindow.css ({top: yy, left:xx});
                    this.intern._jbigWindow.buttons = new Array ();
                    this.intern._jbigWindow.prepend('<div id="'+this.advSettings.elemName+'_lock1"></div><div id="'+this.advSettings.elemName+'_lock2"></div><div id="'+this.advSettings.elemName+'_lock3"></div>');
                    this.intern._jbigWindow.buttons[0] = new hqWidgets.hqButton ({radius: 5, iconName: 'LockOrange.png', hoursLastAction:-1}, {elemName: this.advSettings.elemName+'_lock1', parent: this.advSettings.parent});
                    this.intern._jbigWindow.buttons[0].parentLock = this;
                    this.intern._jbigWindow.buttons[0].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockClose); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.intern._jbigWindow.buttons[0].intern._jelement.addClass('hq-lock-big-button1');
                    this.intern._jbigWindow.buttons[0].SetState(hqWidgets.gState.gStateOff);
                    this.intern._jbigWindow.buttons[1] = new hqWidgets.hqButton ({radius: 5, iconName: 'LockOpened.png', hoursLastAction:-1}, {elemName: this.advSettings.elemName+'_lock2', parent: this.advSettings.parent});
                    this.intern._jbigWindow.buttons[1].parentLock = this;
                    this.intern._jbigWindow.buttons[1].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockOpen); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.intern._jbigWindow.buttons[1].intern._jelement.addClass('hq-lock-big-button2');
                    this.intern._jbigWindow.buttons[1].SetState(hqWidgets.gState.gStateOff);
                    this.intern._jbigWindow.buttons[2] = new hqWidgets.hqButton ({radius: 5, iconName: 'DoorOpenedIcon.png', hoursLastAction:-1},{elemName: this.advSettings.elemName+'_lock3', parent: this.advSettings.parent});
                    this.intern._jbigWindow.buttons[2].parentLock = this;
                    this.intern._jbigWindow.buttons[2].dynStates.action = function (p) {
                            if (p.parentLock && p.parentLock.dynStates.action) 
                                p.parentLock.dynStates.action (p.parentLock, "state", hqWidgets.gLockType.gLockOpenDoor); 
                            if (p.parentLock) 
                                p.parentLock.ShowBigWindow(false, 150);
                        };
                    this.intern._jbigWindow.buttons[2].intern._jelement.addClass('hq-lock-big-button3');
                    this.intern._jbigWindow.buttons[2].SetState(hqWidgets.gState.gStateOff);
                    this.intern._jbigWindow.buttons[0].hide();
                    this.intern._jbigWindow.buttons[1].hide();
                    this.intern._jbigWindow.buttons[2].hide();
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor); 
                }
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                // Colors of the states
                this._SetUsejQueryStyle (this.settings.usejQueryStyle);

                this.intern._jelement.addClass ('hq-blind-base');
                this.intern._jelement.css ({borderRadius: 0});
                this._SetWindowType (this.settings.windowConfig);
                this.SetSize (this.settings.width, this.settings.height, true);
                
                if (!document.getElementById(this.advSettings.elemName+'_big')) {
                    var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_big"></div>');
                    this.advSettings.parent.append ($newdiv1);
                }
                this.intern._jbigWindow=$('#'+this.advSettings.elemName+"_big");
                this.intern._jbigWindow.addClass('hq-blind-big');
                this.intern._jbigWindow.addClass('hq-no-select');
                this.intern._jbigWindow.bheight   = this.intern._jbigWindow.height();  // Size of the big window
                var xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                var yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                if (xx < 0) xx = 0;
                if (yy < 0) yy = 0;
                this.intern._jbigWindow.hide();
                this.intern._jbigWindow.css ({top: yy, left:xx});
                
                if (!document.getElementById(this.advSettings.elemName+'_bigBlind'))
                    this.intern._jbigWindow.prepend('<div id="'+this.advSettings.elemName+'_bigBlind"></div>');
                    
                this.intern._jbigBlind1 = $('#'+this.advSettings.elemName+"_bigBlind");
                this.intern._jbigBlind1.addClass('hq-blind-big-blind');
                this.intern._jbigBlind1.addClass('hq-no-select');
                this.intern._jbigBlind1.css({height: 0});
                this.intern._jbigWindow.parent = this;
                var big  = document.getElementById (this.advSettings.elemName+"_big");
                var big1 = document.getElementById (this.advSettings.elemName+"_bigBlind");
                big.parentQuery = this;
                big1.parentQuery = this;
                // Handlers
                this.intern._jbigWindow.OnMouseMove = function (x_, y_) {
                    this.SetPositionOffset(y_ - this.parent.intern._cursorY);
                }
                
                this.intern._jbigWindow.mouseDown = function (element, y_) {
                    var y_ = event.pageY;
                    hqWidgets.gDynamics.gActiveBig = element;
                    hqWidgets.gDynamics.gActiveBig.intern._cursorY = y_;
                    var yOffset = y_ - hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.position().top;
                    hqWidgets.gDynamics.gActiveBig.intern._percentStateSet = hqWidgets.gDynamics.gActiveBig.dynStates.percentState;
                    hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.startPosOffset = 100 / hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.bheight * yOffset;
                    hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.SetPositionOffset (0);
                }
                this.intern._jbigWindow.bind ("mousedown", {msg: this}, function (event) {
                    event.target.parentQuery.intern._jbigWindow.mouseDown (event.target.parentQuery, event.pageY);
                });
                big.addEventListener('touchstart', function(event) {
                    hqWidgets.gDynamics.gIsTouch=true;
                    event.target.parentQuery.intern._jbigWindow.mouseDown (event.target.parentQuery, event.touches[0].pageY);
                }, false);
                this.intern._jbigWindow.SetPositionOffset = function (newPosOffset)
                {
                    if (this.parent.intern._timerID) {
                        clearTimeout (this.parent.intern._timerID);
                        this.parent.intern._timerID = null;
                    }				
                    newPosOffset = this.startPosOffset + newPosOffset * 100 / this.bheight;
                    this.parent.intern._percentStateSet = Math.floor (newPosOffset);
                    if (this.parent.intern._percentStateSet < 0)    this.parent.intern._percentStateSet = 0;
                    if (this.parent.intern._percentStateSet > 100)  this.parent.intern._percentStateSet = 100;
                    this.parent.intern._jbigBlind1.css({height:this.bheight * this.parent.intern._percentStateSet / 100});		
                };
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDoor) {
                this.SetSize (this.settings.width, this.settings.height, true);
                this.intern._backMoving     = "hq-door-moving";
                this.intern._jelement.addClass ('hq-door-black');
                this.intern._jelement.css ({borderRadius: 0});
                this.intern._backOff        = "hq-door-black";
                this.intern._backOffHover   = "hq-door-black";
                if (!document.getElementById(this.advSettings.elemName+'_door'))
                    this.intern._jelement.prepend('<div id="'+this.advSettings.elemName+'_door"></div>');
                this.intern._jdoor=$('#'+this.advSettings.elemName+"_door");
                this.intern._jdoor.addClass ('hq-door');
                this.intern._jdoor.addClass ('hq-no-select').show();
                this.intern._jdoor.css ({width: '100%'/*this.settings.width*/, height: '100%'/*this.settings.height*/});
                this.SetDoorType (this.settings.doorType);
                if (!document.getElementById(this.advSettings.elemName+'_handle'))
                    this.intern._jelement.prepend('<div id="'+this.advSettings.elemName+'_handle"></div>');
                this.intern._jdoorHandle=$('#'+this.advSettings.elemName+"_handle");
                this.intern._jdoorHandle.addClass ('hq-door-handle').show();
                this.intern._jdoorHandle.addClass ('hq-no-select');
                this.intern._jdoorHandle.css ({position: 'absolute', top: (this.settings.height - this.intern._jdoorHandle.height()) / 2});
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                this.intern._backMoving     = "hq-button-base-moving";
                this.intern._jelement.addClass ("hq-background");
                this.intern._jelement.addClass ("hq-no-select").css ({'z-index': this.settings.zindex});
                this.intern._backOff="";
                if (this.intern._contextMenu) {
                    this.intern._contextMenu.Add({text:"Bring to back", action:function(elem) {
                            var options = new Object ();
                            options.zindex = 0;
                            elem.SetSettings (options);
                        }});
                    this.intern._contextMenu.Add({text:"Bring to front", action:function(elem) {
                            var options = new Object ();
                            options.zindex = GetMaxZindex () + 1;
                            elem.SetSettings (options);
                        }});
                }
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeText) {
                this.dynStates.state = hqWidgets.gState.gStateOff;
                this.intern._backMoving = "hq-lock-moving";
                this.intern._jelement.addClass ("hq-no-select").addClass("hq-button-base-text").css ({'z-index': this.settings.zindex, borderRadius: 1});
                if (!document.getElementById(this.advSettings.elemName+'_stext'))
                    this.intern._jelement.append("<div id='"+this.advSettings.elemName+"_stext' ></div>");
                this.intern._jstaticText = $('#'+this.advSettings.elemName+"_stext").show();
                this.intern._jstaticText.addClass("hq-no-select");
                this.settings.noBackground = true;
                this.SetStaticText (this.settings.staticText, this.settings.staticTextFont, this.settings.staticTextColor);
                document.getElementById(this.advSettings.elemName+'_stext').parentQuery = this;
                this.intern._jstaticText.bind ("mousedown", {msg: this}, function (e)
                {
                    e.target.parentQuery.OnMouseDown(e.pageX, e.pageY, false);
                });		
            }
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeCam ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {

                // Create bigger image
                this._CreateBigCam = function () {
                    if (this.intern._jbigWindow) {
                        this.intern._jbigWindow.remove();
                    }
                
                    if (!document.getElementById(this.advSettings.elemName+'_big')) {
                        var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_big"></div>');
                        this.advSettings.parent.append ($newdiv1);
                    }
                    this.intern._jbigWindow=$('#'+this.advSettings.elemName+"_big");
                    this.intern._jbigWindow.empty ();
                    this.intern._jbigWindow.jbigImage = null;
                    this.intern._jbigWindow.bheight = undefined;
                    this.intern._jbigWindow.bwidth  = undefined;
                    this.intern._jbigWindow.x       = undefined;
                    this.intern._jbigWindow.y       = undefined;
                    this.intern._jbigWindow.show();

                    //this.intern._jbigWindow.addClass('ui-widget-content');
                    
                    var isShowButtons = (this.settings.openDoorBttn || this.settings.gongActionBtn); // && (this.dynStates.action != null)
                    
                    if (!isShowButtons)
                        this.intern._jbigWindow.addClass('hq-ipcam-big');
                    else
                        this.intern._jbigWindow.addClass('hq-ipcam-big-with-action');

                    // Init first position
                    var xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    this.intern._jbigWindow.hide();
                    this.intern._isBigVisible = false;
                    this.intern._jbigWindow.css ({top: yy, left:xx});
                    this.intern._jbigWindow.parent = this;
                    this.intern._jbigWindow.OnClick = function () {
                        if (this.parent.intern._clickTimer) return;
                        this.parent.ShowBigWindow (false);
                    }
                    
                    
                    // Create inner image and buttons (Very dirty)
                    var text = "<table style='width: 100%; height: 100%'><tr style='height: 33px'><td><div width='100%' id='"+this.advSettings.elemName+"_title' class='ui-widget ui-widget-header ui-corner-all ui-dialog-titlebar'>";
                    // Add description
                    text += "<table  id='"+this.advSettings.elemName+"_hdr' width='100%' class='ui-widget-header'><tr><td width='93%'><span class='ui-dialog-title' style='padding: 1px 1px 1px 10px'>"+((this.settings.buttonType == hqWidgets.gButtonType.gTypeCam) ? (this.settings.title || hqWidgets.Translate ("IP Camera")) : this.settings.gongQuestion)+"</span></td>";
                        
                    text += "<td><button id='"+this.advSettings.elemName+"_pin'></button></div></td></tr></table></td></tr>";
                    text += "<tr><td><div style='height: 100%; width:100%'><img style='height: 100%; width:100%' id='"+this.advSettings.elemName+"_bigImage' /></div></td></tr>";
                    if (isShowButtons) {
                        text += "<tr id='"+this.advSettings.elemName+"_btns' style='height:40px'><td><table style='width:100%'><tr><td style='width: 93%'></td>";
                        if (this.settings.gongActionBtn)
                            text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigGong' style='width:8em'>"+this.settings.gongBtnText+"</button></td>";
                        if (this.settings.openDoorBttn)
                            text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigButton' style='width:8em'>"+this.settings.openDoorBttnText+"</button></td>";
                        
                        text += "</tr>";
                    }
                    text += "</table>";
                    
                    this.intern._jbigWindow.append (text);
                    this.intern._jbigWindow.jbigImage = $('#'+this.advSettings.elemName+"_bigImage");
                    this.intern._jbigWindow.jbigImageHdr  = $('#'+this.advSettings.elemName+"_hdr");
                    this.intern._jbigWindow.jbigImageBtns = $('#'+this.advSettings.elemName+"_btns");
                    this.intern._jbigWindow.jbigImage.parent = this;
                    document.getElementById(this.advSettings.elemName+'_bigImage').parentQuery = this;
                    this.intern._jbigWindow.jbigImage.bind("click", {msg: this.intern._jbigWindow}, function (e)	{
                        e.data.msg.OnClick ();
                    });                    
                    // Make header draggable
                    this.intern._jbigWindow.draggable ({handle: "div"});
                    this.intern._jbigWindow.resizable ();
                    
                    // Setup pin button
                    document.getElementById(this.advSettings.elemName+"_pin").parentQuery = this;
                    $("#"+this.advSettings.elemName+"_pin").addClass('hq-ipcam-pin-btn').button({icons: {primary: (this.dynStates.bigPinned ? "ui-icon-pin-s" : "ui-icon-pin-w")}, text: false}).click(function( event ) {
                            if (this.parentQuery.intern._clickTimer) return;
                            this.parentQuery.intern._clickTimer = setTimeout (function (elem) { 
                                clearTimeout (elem.intern._clickTimer);
                                elem.intern._clickTimer = null;
                            }, 500, this.parentQuery);
                            
                            event.preventDefault();
                            this.parentQuery.dynStates.bigPinned = !this.parentQuery.dynStates.bigPinned;
                            $(this).button({icons: {primary: (this.parentQuery.dynStates.bigPinned ? "ui-icon-pin-s" : "ui-icon-pin-w")}});
                            // Start or stop pin timer
                            if (this.parentQuery.dynStates.bigPinned) {
                                // Stop timer
                                clearTimeout (this.parentQuery.intern._timerID);
                                this.parentQuery.intern._timerID = null;
                            }
                            else {
                                // Start timer
                                this.parentQuery.intern._timerID = setTimeout (function () {
                                    if (hqWidgets.gDynamics.gShownBig) {
                                        hqWidgets.gDynamics.gShownBig.ShowBigWindow(false); 
                                        hqWidgets.gDynamics.gShownBig.intern._timerID = null;
                                    } 
                                    hqWidgets.gDynamics.gShownBig=null;
                                }, this.parentQuery.settings.popUpDelay);
                            }
                        });

                    // Setup action button
                    if (this.settings.openDoorBttn && isShowButtons) {
                        document.getElementById(this.advSettings.elemName+"_bigButton").parentQuery = this;
                        $("#"+this.advSettings.elemName+"_bigButton").button({icons: {primary: "ui-icon-unlocked"}, text: true}).click(function( event ) {
                            //event.preventDefault();
                            // Send open command
                            if (this.parentQuery.dynStates.action)
                                this.parentQuery.dynStates.action (this.parentQuery, "open", hqWidgets.gState.gStateOn);
                        });
                    }

                    // Setup action button
                    if (this.settings.gongActionBtn && isShowButtons) {
                        document.getElementById(this.advSettings.elemName+"_bigGong").parentQuery = this;
                        $("#"+this.advSettings.elemName+"_bigGong").button({icons: {primary: "ui-icon-volume-on"}, text: true}).click(function( event ) {
                            //event.preventDefault();
                            // Send open command
                            if (this.parentQuery.dynStates.action)
                                this.parentQuery.dynStates.action (this.parentQuery, "state", hqWidgets.gState.gStateOn);
                        });
                    }
                    
                    this.intern._jbigWindow.OnShow = function () {
                        this.parent.intern._jbigWindow.trigger("resize");
                        if (this.parent.settings["ipCamVideoURL"] != null && this.parent.settings["ipCamVideoURL"] != "") {
                            // activate video
                            //http://192.168.1.8/videostream.cgi?user=xxx&pwd=xxx
                        }
                        else {
                            // Show last loaded image
                            this.parent.intern._jbigWindow.jbigImage.load(function () {
                                if (this.parentQuery.intern._isBigVisible) {
                                    var d = new Date();
                                    // update images as fast as possible
                                    if (this.parentQuery.settings.ipCamVideoDelay) {
                                        this.parentQuery.intern._ipCamBigTimer = setTimeout (function (elem) {
                                            elem._UpdateBigCam ();                                    
                                        }, this.parentQuery.settings.ipCamVideoDelay, this.parentQuery);
                                    }
                                    else 
                                        this.parentQuery._UpdateBigCam (); 
                                }                                        
                            });
                            this.parent._UpdateBigCam ();
                            this.parent.intern._jbigWindow.bind("resize", {msg: this.parent}, function (e)	{
                                var big = e.data.msg.intern._jbigWindow;
                                big.jbigImage.height(big.height() - big.jbigImageHdr.height() - 15 - ((big.jbigImageBtns) ? big.jbigImageBtns.height(): 0) );
                            });
                            this.parent.intern._jbigWindow.trigger("resize");
                        }
                    }
                    this.intern._jbigWindow.OnHide = function () {
                        this.parent.intern._jbigWindow.bind("resize", null, null);
                        // Stop update of the images
                        clearTimeout(this.parent.intern._ipCamBigTimer);
                        this.parent.intern._ipCamBigTimer = null;
                        this.parent.intern._jbigWindow.jbigImage.load(null);
                    }
                } // end of Create bigger image
                    
                // if url exists
                if (this.settings.ipCamImageURL != null && this.settings.ipCamImageURL != "") {
                    // create base image
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeCam) {
                        this.intern._jelement.addClass('hq-ipcam-base').addClass('hq-no-select').css({width: this.settings.width, height: this.settings.height});
                        
                        if (!document.getElementById(this.advSettings.elemName+"_center")) 
                            this.intern._jelement.prepend("<img id='"+this.advSettings.elemName+"_center'></img>");
                            
                        this.intern._jcenter = $('#'+this.advSettings.elemName + '_center');
                        this.intern._jcenter.css ({width: '100%', height: '100%'});

                        // Start timer and give some time to load nosignal image
                        this.intern._center = document.getElementById(this.advSettings.elemName+"_center");
                        this.intern._center.parentQuery = this;
                        // remove "cancel" image
                        this.intern._jcenter.load(function (event) {
                            event.target.parentQuery.SetStates ({'isWorking': false, state: hqWidgets.gState.gStateOff});
                        });
                        // Start slow update process
                        this.intern._iuCamUpdateTimer = setTimeout (function (elem) { elem._UpdateSmallCam (); }, 2000, this);
                    }
                    
                    this._CreateBigCam ();
                }
            }
            if ((this.settings.buttonType != hqWidgets.gButtonType.gTypeImage ||
                this.settings.buttonType  != hqWidgets.gButtonType.gTypeBlind ||
                this.settings.buttonType  != hqWidgets.gButtonType.gTypeText ||
                this.settings.buttonType  != hqWidgets.gButtonType.gTypeInTemp ||
                this.settings.buttonType  != hqWidgets.gButtonType.gTypeDimmer) &&
                !this.intern._jright && this.settings.hoursLastAction != -1) {
                this._CreateRightInfo ();
                this.intern._jright.hide ();
            }
            
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                // Icon, like battery, refresh or state unknown
                if (!document.getElementById(this.advSettings.elemName+"_icon"))
                    this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_icon'></div>");
                this.intern._jicon         = $('#'+this.advSettings.elemName + '_icon');
                this.intern._iconWidth     = 15;
                this.intern._iconHeight    = 15;
                this.intern._jicon.width (this.intern._iconWidth);
                this.intern._jicon.height(this.intern._iconHeight);		
                this.intern._jicon.css({ position: 'absolute', 
                                           top:  '' + this.settings.height / 15, 
                                           left: '' + this.settings.width  / 15, 
                                           'z-index':'20' });
                this.intern._jicon.addClass ('ui-icon');
                this.intern._jicon.addClass('hq-no-select');
            }
        
            this.SetTitle (this.settings.room, this.settings.title);
            if (this.intern._jbattery) 
                this.ShowBattery (true);
                
            if (this.intern._jsignal) 
                this.ShowSignal (true, this.dynStates.strength);	
                
            this.SetSize (this.settings.width, this.settings.height, true);
            this.ShowState ();
            this.intern._inited = true;
        }
        this._SetUsejQueryStyle = function (isUse, isUpdate) {
            this.settings.usejQueryStyle = isUse;
            
            this.intern._jelement.removeClass ("ui-state-default").
            removeClass("ui-state-hover").removeClass("ui-state-active").
            removeClass("hq-button-base-normal").removeClass("hq-button-base-normal-hover").
            removeClass("hq-button-base-intemp").removeClass("hq-button-base-intemp-hover").
            removeClass("hq-button-base-intemp").removeClass("hq-button-base-intemp-hover").
            removeClass("hq-button-base-on").removeClass("hq-button-base-on-hover");
            this.intern._currentClass = ""; // force update
            if (isUse) {
                // Colors of the states
                if (!this.settings.noBackground) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        this.intern._backOff        = "ui-state-default";
                        this.intern._backOffHover   = "ui-state-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                    {
                        this.intern._backOff        = "ui-state-default";
                        this.intern._backOffHover   = "ui-state-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                        this.intern._backOff        = "hq-blind-base";
                        this.intern._backOffHover   = "hq-blind-base";
                        this.intern._backMoving     = "hq-blind-blind3-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                        this.intern._backOff="";  
                    }                        
                    else
                    {
                        this.intern._backOff        = "ui-state-default";
                        this.intern._backOffHover   = "ui-state-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }                
                    this.intern._backOn         = "ui-state-active";
                    this.intern._backOnHover    = "ui-state-active";
                }
                else {
                    this.intern._backOff        = "";
                    this.intern._backOffHover   = "";
                    this.intern._backOn         = "";
                    this.intern._backOnHover    = "";
                    this.intern._backMoving     = "hq-button-base-moving";
                }
            }
            else {
                // Colors of the hqWidgets states
                if (!this.settings.noBackground) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        this.intern._backOff        = "hq-button-base-intemp";
                        this.intern._backOffHover   = "hq-button-base-intemp-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                    {
                        this.intern._backOff        = "hq-button-base-outtemp";
                        this.intern._backOffHover   = "hq-button-base-outtemp-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                        this.intern._backOff        = "hq-blind-base";
                        this.intern._backOffHover   = "hq-blind-base";
                        this.intern._backMoving     = "hq-blind-blind3-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                        this.intern._backOff="";  
                    } 
                    else
                    {
                        this.intern._backOff        = "hq-button-base-normal";
                        this.intern._backOffHover   = "hq-button-base-normal-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }                
                    this.intern._backOn         = "hq-button-base-on";
                    this.intern._backOnHover    = "hq-button-base-on-hover";
                }
                else {
                    this.intern._backOff        = "";
                    this.intern._backOffHover   = "";
                    this.intern._backOn         = "";
                    this.intern._backOnHover    = "";
                    this.intern._backMoving     = "hq-button-base-moving";
                }

            }
            //if (isUpdate)
                this.ShowState ();
        };
        this._SetWindowType = function (type1, type2, type3, type4) {
            if ((type1+"").indexOf(',') != -1) {
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
            if (this.intern._blinds != undefined && this.intern._blinds != null)
            {
                for (var i = 0; i < this.intern._blinds.length; i++)
                    this.intern._blinds[i].divs[0].remove ();
            }
            this.intern._blinds = null;

            if (iCount >= 1) this._DrawOneWindow (0, type1, 0,                                  this.intern._jelement.width() / iCount, this.intern._jelement.height());
            if (iCount >= 2) this._DrawOneWindow (1, type2, this.intern._jelement.width() / iCount * 1, this.intern._jelement.width() / iCount, this.intern._jelement.height());
            if (iCount >= 3) this._DrawOneWindow (2, type3, this.intern._jelement.width() / iCount * 2, this.intern._jelement.width() / iCount, this.intern._jelement.height());
            if (iCount >= 4) this._DrawOneWindow (3, type4, this.intern._jelement.width() / iCount * 3, this.intern._jelement.width() / iCount, this.intern._jelement.height());		
            
            this.advSettings.parent.on('contextmenu', "#"+name+"_3", function(e){ 
                if (e.target.parentQuery) e.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
                return false; 
            });
            
            if (this.intern._jbattery) 
                this.ShowBattery (true);
                
            if (this.intern._jsignal) 
                this.ShowSignal (true, this.dynStates.strength);	
                
            this.settings.windowConfig = this._GetWindowType ();
        }
        this._ShowAction = function () {
            if (this.settings.showChanging) {
                $('#'+this.advSettings.elemName+'_action1').stop().remove();
                var text = "<div id='"+this.advSettings.elemName+"_action1' style='z-index:2000; top:"+(this.settings.y-3.5)+"px; left:"+(this.settings.x-3.5)+"px; width: "+this.settings.width+"px; height: "+this.settings.height+"px; position: absolute'></div>";
                this.advSettings.parent.append(text);
                var _css = {
                    left:        this.settings.x - 4 - this.settings.width / 2,
                    top:         this.settings.y - 4 - this.settings.height / 2,
                    height:      this.settings.height * 2,
                    width:       this.settings.width *2,
                    opacity:     0,
                    //borderWidth: 1,
                    borderRadius: 10+(this.settings.height > this.settings.width) ? this.settings.width : this.settings.height};
                    
                $('#'+this.advSettings.elemName+'_action1').addClass('hq-changing-normal').css({borderRadius: this.settings.radius+10}).animate(_css,
                1000, 'swing', function (){$(this).remove();});  

                $('#'+this.advSettings.elemName+'_action2').stop().remove();
                text = text.replace("action1", "action2");
                this.advSettings.parent.append(text);
                $('#'+this.advSettings.elemName+'_action2').addClass('hq-changing-normal').css({borderRadius: this.settings.radius+10}).animate(_css,
                2000, 'swing', function (){$(this).remove();});  
            }
        }
        this._ShowCircleState = function (isForSet)	{
            var pState;
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                pState = (isForSet) ? this.intern._percentStateSet : this.dynStates.percentState;
            else
                pState = (isForSet) ? this.intern._percentStateSet : Math.round ((this.dynStates.setTemp - this.settings.heatCtrlMin) / (this.settings.heatCtrlMax - this.settings.heatCtrlMin) * 100, 1);
        
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                this._ShowRightInfo (pState + "%");
            else { 
                if (isForSet) {
                    this.intern._jtemp.hide ();
                    this.intern._jhumid.hide ();
                    this.intern._jsetTemp.show ();
                    var temp = Math.round (((this.settings.heatCtrlMax - this.settings.heatCtrlMin) * pState / 100 + this.settings.heatCtrlMin) * 2) / 2;
                    this.intern._jsetTemp.html (hqWidgets.TempFormat (temp) + '&deg;');
                }
                else {
                    if (this.intern._jtemp) {
                        this.intern._jtemp.show ();
                        this.intern._jhumid.show ();
                        this.intern._jsetTemp.hide ();
                    }
                }
            }
                
            if ((this.intern._isHoover || this.intern._isPressed) && !this.intern._isEditMode) {                    
                if (this.intern._jright)
                    this.intern._jright.show ();
                               
                if (this.intern._jcircle) {
                    this.intern._jcircle.context.save();
                    this.intern._jcircle.context.clearRect ( 0, 0, this.intern._jcircle.canvas.width, this.intern._jcircle.canvas.height);
                    if (pState > 0) {
                        this.intern._jcircle.context.beginPath();
                        this.intern._jcircle.context.arc (this.intern._jcircle.x, 
                                                           this.intern._jcircle.y, 
                                                           this.intern._jcircle.radius, 
                                                           1.57079 /* PI / 2 */, 
                                                           ((0.02 * pState) + 0.5) * Math.PI, 
                                                           false);
                        this.intern._jcircle.context.lineWidth = this.settings.dimmerThick;

                        // line color
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                            this.intern._jcircle.context.strokeStyle = this.settings.dimmerColorAct;
                        else {
                            
                            this.intern._jcircle.context.strokeStyle = "rgb("+Math.round(255 * pState / 100)+",80,"+Math.round(255 * (100 - pState) / 100)+")";
                        }
                        this.intern._jcircle.context.stroke();
                        this.intern._jcircle.context.closePath();
                    }
                    if (pState != 100) {
                        this.intern._jcircle.context.beginPath();
                        this.intern._jcircle.context.arc (this.intern._jcircle.x, 
                                                           this.intern._jcircle.y, 
                                                           this.intern._jcircle.radius, 
                                                           ((0.02 * pState) + 0.5) * Math.PI, 
                                                            1.57079 /* PI / 2 */, 
                                                           false);
                        this.intern._jcircle.context.lineWidth = this.settings.dimmerThick;

                        // line color
                        this.intern._jcircle.context.strokeStyle = this.settings.dimmerColorInact;
                        this.intern._jcircle.context.stroke();
                        this.intern._jcircle.context.closePath();
                    }
                    this.intern._jcircle.context.restore();
                    this.intern._jcircle.stop().show ();
                }
            }
            else {
                //if (this.intern._jcenter)
                //    this.intern._jcenter.show ();
               
                if (this.intern._jcircle)
                    this.intern._jcircle.hide ();
            }
        }	
        this._ShowLastActionTime = function () {
            if (this.intern._jrightText && (this.settings.hoursLastAction != -1)) {
                if (this.intern._lastAction != null) {
                    // Show absolut time
                    if (this.settings.hoursLastAction < 0) {
                        if (this.settings.hoursLastAction == -2) {
                            this.intern._jright.show ();
                            this._ShowRightInfo (hqWidgets.TimeToString(this.intern._lastAction));
                        }
                        else {
                            // Check the interval
                            var seconds = ((new Date()).getTime () -  this.intern._lastAction.getTime()) / 1000;
                            if (seconds / 3600 <= ((-1) * this.settings.hoursLastAction)) {
                                this._ShowRightInfo (hqWidgets.TimeToString(this.intern._lastAction));
                            }
                            else
                                this._jright.hide ();
                        }
                    }
                    else {
                        // Check the interval
                        var seconds = ((new Date()).getTime () -  this.intern._lastAction.getTime()) / 1000;
                        if (!this.settings.hoursLastAction || seconds / 3600 <= this.settings.hoursLastAction) {
                            this._ShowRightInfo (hqWidgets.GetTimeInterval(this.intern._lastAction));
                        }
                        else 
                            this.intern._jright.hide ();
                    }
                
                }
                else
                    this.intern._jright.hide ();            
            }
            else 
            if (this.intern._jrightText && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer &&
                this.settings.buttonType != hqWidgets.gButtonType.gTypeInTemp)
                this.intern._jright.hide ();            
        }
        this._ShowRightInfo = function (newText) {
            if (this.intern._jright && this.intern._jrightText) {
                if (newText == undefined) 
                    newText = this.intern._jrightText.html();
                // Calculate new width
                if (newText == "" || newText == null)
                    this.intern._jright.hide ();
                else {
                    var w = newText.width('9px "Tahoma", sans-serif');
                        
                    this.intern._jright.stop().show ();
                    this.intern._jright.css({left:this.settings.x+this.settings.width/2, height: 30, width: this.settings.width / 2 + w*1.2}); // Set size
                    this.intern._jrightText.html(newText);
                }
            }
        }
        this._UpdateSmallCam = function () {
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGong)
                return;
            
            if (this.intern._iuCamUpdateTimer) {
                clearTimeout (this.intern._iuCamUpdateTimer);
                this.intern._iuCamUpdateTimer = null;
            }
            
            if (this.intern._ipCamImageURL == null && this.settings.ipCamImageURL != null && this.settings.ipCamImageURL != "") {
                this.intern._ipCamImageURL = this.settings.ipCamImageURL + ((this.settings.ipCamImageURL.indexOf ('?') > 0) ? '&' : '?');
            }
            if (!this.intern._jcenter && this.intern._ipCamImageURL != null && this.intern._ipCamImageURL != "") {
               if (!document.getElementById(this.advSettings.elemName+"_center")) 
                    this.intern._jelement.prepend("<img id='"+this.advSettings.elemName+"_center'></img>");
                    
                this.intern._jcenter = $('#'+this.advSettings.elemName + '_center');
                this.intern._jcenter.css ({width: '100%', height: '100%'});
            }
            
            if (this.intern._jcenter && this.intern._ipCamImageURL != null && this.intern._ipCamImageURL != "") {
                var d = new Date();
                this.intern._jcenter.jparent = this;
                // remove unknown state
                // Set unknown state
                this.SetStates ({'isWorking': true});
                this.intern._ipCamLastImage = this.intern._ipCamImageURL + d.getTime();
                //$('#status').append("update" + this.intern._ipCamLastImage + "<br>");
                this.intern._jcenter.attr('src', this.intern._ipCamLastImage);
                // Update big image too
                if (this.intern._jbigWindow && this.intern._isBigVisible)
                    this.intern._jbigWindow.jbigImage.attr('src', this.intern._ipCamLastImage);
                    
                this.intern._iuCamUpdateTimer = setTimeout (function (obj) { obj._UpdateSmallCam() }, this.settings.ipCamUpdateSec * 1000, this);
            }
        },
        this._UpdateBigCam = function () {
            if (this.settings.ipCamImageURL != null && this.settings.ipCamImageURL != "") {
                if (this.intern._ipCamImageURL == null) {
                    this.intern._ipCamImageURL = this.settings.ipCamImageURL + ((this.settings.ipCamImageURL.indexOf ('?') > 0) ? '&' : '?');
                }
                var d = new Date();
                var url = this.intern._ipCamImageURL + d.getTime();                                        
                this.intern._jbigWindow.jbigImage.attr ('src', url);
            }
        }
        this.CheckStates = function (dt) {
            if (!this.intern._isEditMode) {
                // Update last ON state
                this._ShowLastActionTime ();
                
                // Check last update of the element state
                if (this.dynStates.state != hqWidgets.gState.gStateUnknown && 
                    this.intern._lastUpdate != null && 
                    this.settings.stateTimeout > 0) {
                    if (dt == undefined)
                        dt = new Date ();
                    var seconds = (dt.getTime() - this.intern._lastUpdate.getTime()) / 1000;
                    if (seconds > this.settings.stateTimeout)
                        this.SetState (hqWidgets.gState.gStateUnknown);
                }
            }
        }
        this.GetAdvSettings = function () {
            var advOptions = new Object ();
            advOptions.parent   = this.advSettings.parent;
            advOptions.elemName = this.advSettings.elemName;
            return advOptions;
        }
        this.GetStates = function () {
            var dynOptions = hqWidgets.Clone (this.dynStates);
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) 
            {
                dynOptions.windowState = "";
                var index = 0;
                while (this.intern._blinds[index])
                    dynOptions.windowState = ((options.windowState == "") ? "" : ",") + this.intern._blinds[index].state;
            }
        }
        // Get all options as one parameter
        this.GetSettings = function (isAllOrOneName) {
            var options = new Object ();

            if (isAllOrOneName !== undefined && isAllOrOneName !== true && isAllOrOneName !== false)
                return this.settings[isAllOrOneName];
            
            
            for(var propertyName in this.settings) {
                if (propertyName[0] == '_')
                    continue;
                if ((isAllOrOneName === undefined || isAllOrOneName === false) && this.settings[propertyName] === null)
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
                if (this.intern._jinfoText)	
                    options.infoTextCss=this.intern._jinfoText.css();
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
        // Draw window content
        // Set window configuration: Can be called as _SetWindowType('1,2,3,4') or _SetWindowType(1,2,3,4)
        // Set door configuration
        this.SetDoorType = function (type) {
            if (this.intern._jdoor && this.settings.doorType != type)
            {
                this.settings.doorType=type;
                this.ShowState ();
            }
        }
        this.SetSize = function (_width, _height, isForce) {
            if (isForce || this.settings.width != _width || this.settings.height != _height) {
                this.settings.width  = _width;
                this.settings.height = _height;
                this.intern._jelement.css  ({width: _width, height: _height});	
                if (this.intern._jeventhnd)
                    this.intern._jeventhnd.css ({width: _width, height: _height});	

                if (this.intern._jbigWindow)
                {
                    var xx = this.settings.x + (this.intern._jelement.width()  - this.intern._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.intern._jelement.height() - this.intern._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
                    if (yy < 0) yy = 0;
                    this.intern._jbigWindow.css ({top: yy, left:xx});	
                }
                
                if (this.intern._jdoor)
                    this.intern._jdoor.css ({width: '100%'/*this.settings.width*/, height: '100%'/*this.settings.height*/});	
                    
                if (this.intern._jdoorHandle)
                {
                    this.intern._jdoorHandle.css ({top: (this.settings.height - this.intern._jdoorHandle.height()) / 2});
                    this.ShowDoorState (true);
                    /*
                    if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                        this.jdoorHandle.css ({left: ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0) + 5});
                    else
                        this.jdoorHandle.css ({left: (this.intern._jelement.width() - this.jdoorHandle.width() - 5) - ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0)});
                        */
                }
                
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                {
                    this._SetWindowType (this._GetWindowType ());
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                    this.ShowBlindState();
                }
                    
                if (this.intern._jinfoText)
                    this.intern._jinfoText.css({top: (this.settings.height - this.intern._jinfoText.height()) / 2, left: (this.settings.width - this.intern._jinfoText.width()) / 2 });
                
                if (this.intern._jtemp)
                    this.intern._jtemp.css({top:this.settings.height/2-11, width: this.settings.width}); // Set size
                
                if (this.intern._jhumid)
                    this.intern._jhumid.css({top:this.settings.height/2+1, width: this.settings.width}); // Set size
                
                if (this.intern._jright) {
                    if (this.intern._jrightText)
                        this._ShowRightInfo ();
                    else
                        this.intern._jright.css({left:this.settings.x+this.settings.width/2, width: hqWidgets.gOptions.gBtWidth*0.8 + this.settings.width/2}); // Set size
                    if (this.intern._jvalve)   this.intern._jvalve.css  ({left:this.settings.width/2+5}); // Set size
                    if (this.intern._jsettemp) this.intern._jsettemp.css({left:this.settings.width/2+1}); // Set size
                }
                
                if (this.intern._jrightText) {
                    this.intern._jrightText.css({left:this.settings.width / 2 + 3}); // Set size
                }	
                
                if (this.intern._jcircle) {
                    this.intern._jcircle.css({left:   this.settings.x - this.settings.dimmerThick, 
                                                top:    this.settings.y - this.settings.dimmerThick,
                                                /*width:  this.settings.width  + this.settings.dimmerThick*2,
                                                height: this.settings.height + this.settings.dimmerThick*2*/
                                                }); // Set size
                }
                
                if (this.intern._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeCam) {
                    this.intern._jcenter.css({left:   (this.settings.width  - hqWidgets.gOptions.gBtIconWidth) / 2, 
                                                top:    (this.settings.height - hqWidgets.gOptions.gBtIconHeight) / 2,
                                                }); // Set position                 
                }
                if (this.intern._jleft) {
                    this.intern._jleft.css({left:  this.settings.x - this.intern._jleft.offset, 
                                              width: this.intern._jleft.offset + this.settings.width / 2}); // Set size
                }
                
                this.StoreSettings ();
            }
        }	
        // Set icon in ON state
        this.SetIconOn = function (iconName_) {
            if (iconName_!= undefined && iconName_ != null && iconName_ != "" && this.intern._jcenter)
            {
                this.settings.iconOn = ((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_;
                if (this.dynStates.state == hqWidgets.gState.gStateOn) {
                    this.intern._jcenter.attr('src', this.settings.iconOn);
                }
            }
            else
            {
                this.settings.iconOn = null;
                if (this.intern._jcenter) this.intern._jcenter.attr('src', this.settings.iconName);
            }
        }	
        // Set icon in Off state
        this.SetIcon = function (iconName_)	{
            // Icon in the middle of the button
            this.settings.iconName = (iconName_ != null && iconName_ != "") ? (((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_) : null;
        
            if (this.settings.iconName)
            {
                if (!document.getElementById(this.advSettings.elemName+"_center")) 
                    this.intern._jelement.prepend("<img id='"+this.advSettings.elemName+"_center' src='"+this.settings.iconName+"'></img>");
                this.intern._jcenter = $('#'+this.advSettings.elemName + '_center');

                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                    this.intern._jcenter.css({position: 'absolute', 
                                                top:      ((this.intern._jelement.height()-hqWidgets.gOptions.gBtIconHeight)/2), 
                                                left:     ((this.intern._jelement.width() -hqWidgets.gOptions.gBtIconWidth) /2), 
                                                'z-index':'10', 
                                                width:     hqWidgets.gOptions.gBtIconWidth, 
                                                height:    hqWidgets.gOptions.gBtIconHeight});
                }
                else {
                    if (this.settings.width)  this.intern._jcenter.css({width:this.settings.width});
                    if (this.settings.height) this.intern._jcenter.css({height:this.settings.height});
                }
                if (this.dynStates.state == hqWidgets.gState.gStateOff || 
                    this.settings.iconOn == undefined || 
                    this.settings.iconOn == null || 
                    this.settings.iconOn == "")
                    this.intern._jcenter.attr('src', this.settings.iconName);
                    
                this.intern._jcenter.addClass('hq-no-select');
                this.intern._jcenter.show();
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                    this.intern._jelement.css ({width: this.intern._jcenter.width(), height: this.intern._jcenter.height()});
                }
            }
            else
            {
                if (this.intern._jcenter) 
                {
                    this.intern._jcenter.hide();
                    this.intern._jcenter.html("");
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
              
            if (text != null && this.intern._jinfoText == null) {
                this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_infoText'></div>");
                this.intern._jinfoText = jQuery('#'+this.advSettings.elemName + '_infoText');
                this.intern._jinfoText.addClass('hq-no-select');
                this.intern._jinfoText.addClass('hq-info-text');
            }
            if (this.intern._jinfoText)
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
                        if (t[t.length-1] == '.')
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
                    
                this.intern._jinfoText.css({font: textFont, color: textColor});
                this.intern._jinfoText.html ((text) || "");
                if (text != null) {
                
                    var w = text.width(textFont);
                    // Place it in the middle
                    this.intern._jinfoText.css({top:  (this.settings.height - this.intern._jinfoText.height()) / 2, 
                                                  left: (this.settings.width  - w) / 2,
                                                  width: w});
                }                                                  
            }
        }
        this.ShowDoorState = function (noDelay)	{
            if (this.intern._jdoor) {
                if (this.intern._isEditMode && this.settings.isContextMenu)
                {
                    this.intern._jdoor.hide ();
                    if (this.intern._jdoorHandle)
                    {
                        if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                            this.intern._jdoorHandle.css ({left: 5 + this.intern._jdoorHandle.width()});
                        else
                            this.intern._jdoorHandle.css ({left: this.intern._jelement.width() - this.intern._jdoorHandle.width() - 5});
                    }
                    if (this.intern._isPressed)
                        this._SetClass (this.intern._backMoving);				
                    else
                        this._SetClass (this.intern._backOff);				
                }
                else
                {
                    this.intern._jdoor.show ();
                    if (this.intern._jdoorHandle)
                    {
                        if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                            this.intern._jdoorHandle.animate ({left: ((this.dynStates.state==hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0) + 5},  (noDelay) ? 0 : 200);
                        else
                            this.intern._jdoorHandle.animate ({left: (this.intern._jelement.width() - this.intern._jdoorHandle.width() - 5) - ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0)},  (noDelay) ? 0 : 200);
                    }
                    if (this.dynStates.state == hqWidgets.gState.gStateOn && 
                        this.settings.doorType != hqWidgets.gSwingType.gSwingDeaf)				
                        this.intern._jdoor.stop().animate ({width: this.intern._jelement.width() * 0.8, 
                                                              left: (this.settings.doorType!=hqWidgets.gSwingType.gSwingLeft) ? 0: this.intern._jelement.width() * 0.2}, (noDelay) ? 0 : 200);
                    else
                        this.intern._jdoor.stop().animate ({left:0, width: '100%'/*this.intern._jelement.width()*/}, (noDelay) ? 0 : 200);
                }
            }
        }
        this.ShowState = function () {
            if (this.intern._isEditMode)
            {
                if (this.settings.isContextMenu) {
                    if (this.intern._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeImage)  
                        this.intern._jcenter.stop().hide();		
                    if (this.intern._jtemp)    this.intern._jtemp.stop().hide();
                    if (this.intern._jhumid)   this.intern._jhumid.stop().hide();
                    if (this.intern._jinfoText)this.intern._jinfoText.stop().hide();
                }
                
                if (this.intern._jleft)    this.intern._jleft.stop().show();
                if (this.intern._jbattery) this.intern._jbattery.stop().hide();
                if (this.intern._jsignal)  this.intern._jsignal.stop().hide();
                if (this.intern._jicon)	 this.intern._jicon.removeClass("ui-icon-cancel").hide();
                
                if (this.intern._jdoor)	
                    this.ShowDoorState ();
                else
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                {
                    if (this.intern._isPressed)	
                        this._SetClass (this.intern._backMoving);
                    else
                    {
                        if (this.settings.isContextMenu) {
                            if (!this.settings.noBackground) {
                                if (this.settings.isIgnoreEditMode)
                                    this._SetClass (this.intern._backOn);
                                else
                                    this._SetClass (this.intern._backOff);
                            }
                            else
                                this._SetClass ("hq-no-background-edit");
                        }
                        else {
                            if (this.dynStates.state == hqWidgets.gState.gStateOn)
                            {
                                if (this.intern._isPressed)
                                    this._SetClass (this.intern._backOnHover);
                                else
                                    this._SetClass (this.intern._backOn);
                            }
                            else
                            {
                                if (this.intern._isPressed)
                                    this._SetClass (this.intern._backOffHover);
                                else
                                    this._SetClass (this.intern._backOff);
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
                if (this.intern._jcenter) {
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                        if (!this.intern._isPressed)  
                            this.intern._jcenter.stop().show();
                        else
                            this.intern._jcenter.stop().hide();
                    }
                }                
                if (this.intern._jtemp)        this.intern._jtemp.stop().show();
                if (this.intern._jhumid)       this.intern._jhumid.stop().show();
                if (this.intern._jinfoText)    this.intern._jinfoText.stop().show();
                if (this.intern._jleft)        this.intern._jleft.stop().hide();
                if (this.intern._jbattery)     this.intern._jbattery.stop().show();
                if (this.intern._jsignal)      this.intern._jsignal.stop().show();
                if (this.intern._jstaticText)  this.intern._jstaticText.stop().show();
                if (this.dynStates.state != hqWidgets.gState.gStateUnknown) {
                    if (this.intern._jicon)
                        this.intern._jicon.removeClass("ui-icon-cancel");
                        
                    if (this.intern._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                    {
                        if (this.dynStates.state == hqWidgets.gState.gStateOn)
                        {
                            if (this.intern._isPressed)
                                this._SetClass (this.intern._backOnHover);
                            else
                                this._SetClass (this.intern._backOn);
                        }
                        else
                        {
                            if (this.intern._isPressed)
                                this._SetClass (this.intern._backOffHover);
                            else
                                this._SetClass (this.intern._backOff);
                        }	
                    }
                    else
                    {
                        this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                        this.ShowBlindState();
                    }
                    
                    if (this.intern._jicon)
                    {
                        if (this.dynStates.isRefresh)
                        {
                            this.intern._jicon.addClass("ui-icon-refresh");
                            this.intern._jicon.removeClass("ui-icon-gear");
                            this.intern._jicon.show();
                        }
                        else
                        {
                            this.intern._jicon.removeClass("ui-icon-refresh");
                            if (this.dynStates.isWorking)
                            {
                                this.intern._jicon.addClass("ui-icon-gear");
                                this.intern._jicon.show();
                            }
                            else
                            {
                                this.intern._jicon.removeClass("ui-icon-gear");
                                this.intern._jicon.hide();
                            }
                        }
                    }
                }
                else
                {
                    if (this.intern._jicon)
                    {
                        this.intern._jicon.show();
                        this.intern._jicon.removeClass("ui-icon-refresh");
                        this.intern._jicon.removeClass("ui-icon-gear");
                        this.intern._jicon.addClass("ui-icon-cancel");
                    }
                    if (this.intern._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                        this._SetClass (this.intern._backOff, 100);
                    else
                    {
                        this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                        this.ShowBlindState();
                    }
                }		
            }			
        }
        this.SetEditMode = function (isEditMode) {
            if (this.intern._isEditMode != isEditMode)
            {
                this.intern._isEditMode = isEditMode;			
                if (this.intern._isEditMode && !this.settings.isContextMenu)
                    this.intern._jeventhnd.hide ();
                else
                    this.intern._jeventhnd.show ();
                this.ShowState ();
            }		
        }	
        this.SetState = function (newState)	{
            // Remember last update, to detect connections problem
            if ((newState             != hqWidgets.gState.gStateUnknown && newState != null) || 
                (this.dynStates.state != hqWidgets.gState.gStateUnknown && newState == null))
                this.intern._lastUpdate = new Date ();
                
            var oldState = this.dynStates.state;
            // If state changed
            if (newState != null && this.dynStates.state != newState) {
                this.dynStates.state = newState;
                
                    
                if (this.settings.iconOn) {
                    if (this.dynStates.state == hqWidgets.gState.gStateOn) {
                        this.intern._jcenter.attr('src', this.settings.iconOn);
                    }
                    else
                        this.intern._jcenter.attr('src', this.settings.iconName);
                }
                                
                if (newState == hqWidgets.gState.gStateOn) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {
                        this._PlayMelody();
                        // Hide big window
                        if (this.intern._jbigWindow && hqWidgets.gDynamics.gActiveBig != null && hqWidgets.gDynamics.gActiveBig != this)
                            hqWidgets.gDynamics.gActiveBig.ShowBigWindow (false);

                        if (this.intern._jbigWindow && this.settings.ipCamImageURL) {
                             if (!this.intern._isBigVisible)
                                this.ShowBigWindow (true);
                        }
                        // Show dialog
                        else 
                        if (this.dynStates.action && !this.intern._isBigVisible && this.settings.openDoorBttn)
                        {
                            if (!document.getElementById('gongDialog')) {
                                this.intern._isBigVisible = true;
                                var text = "<div id='gongDialog' style='width:"+(200 + this.settings.gongQuestion.width('18px "Arial", sans-serif')) + "px'><table style='width: 100%; height: 100%' class='ui-widget-content'><tr><td>";
                                var iconName = this.settings.gongQuestionImg;
                                iconName = (iconName != null && iconName != "") ? (((iconName.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName) : null;

                                text += "<img src='"+iconName+"' /></td>";
                                text += "<td><p>"+this.settings.gongQuestion+"</p></td></tr></table></div>"
                                // Show dialog, that will hide automatically after 10 seconds
                                var btns = {};
                                btns[this.settings.openDoorBttnText] = function() {
                                                var dlg = document.getElementById ('gongDialog');
                                                dlg.parentQuery.intern._isBigVisible = false;
                                                $( this ).dialog( "close" );
                                                $( this ).remove();
                                                dlg.parentQuery.dynStates.action (dlg.parentQuery, "open", hqWidgets.gState.gStateOn);
                                                if (dlg.parentQuery.intern.timerID) {
                                                  clearTimeout (dlg.parentQuery.intern.timerID);
                                                  dlg.parentQuery.intern.timerID = null;
                                                }
                                            };
                                btns[hqWidgets.Translate(hqWidgets.gOptions.gCancelText)] = function() {
                                            var dlg = document.getElementById ('gongDialog');
                                            dlg.parentQuery.intern._isBigVisible = false;
                                            $( this ).dialog( "close" );
                                            $( this ).remove();
                                            if (dlg.parentQuery.intern.timerID) {
                                                clearTimeout (dlg.parentQuery.intern.timerID);
                                                dlg.parentQuery.intern.timerID = null;
                                            }
                                        };
                                $('body').append(text);
                                var dlg = document.getElementById ('gongDialog');
                                dlg.parentQuery = this;
                                
                                var jdlg = $('#gongDialog').dialog ({title: this.settings.title, 
                                                 resizable: false,
                                                 modal: true,
                                                 autoOpen:true,
                                                 width: 'auto',
                                                 buttons: btns});
                                
                                jdlg.parentQuery = this;
                                
                                this.intern.timerID = setTimeout (function (elem) {
                                    elem.intern._isBigVisible = false;
                                    $('#gongDialog').dialog('close');
                                    $('#gongDialog').remove ();
                                    elem.intern.timerID = null;
                                }, this.settings.popUpDelay, this);
                                //dlg.dialog('open');
                            }
                        }      
                    }
                }
                
                this.ShowState ();
                // Show animation by change
                if (oldState != hqWidgets.gState.gStateUnknown && oldState != null) {
                    this.intern._lastAction = new Date ();
                    // Set tooltip
                    if (this.intern._jrightText)
                        this.intern._jrightText.attr('title', this.intern._lastAction + "");
                    this._ShowLastActionTime ();
                    this._ShowAction (); 
                }
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
                this.intern._jelement.css ({left: x_, top: y_});
                //if (this.intern._jeventhnd)
                //    this.intern._jeventhnd.css({left: x_, top: y_});
                if (this.intern._jright) 
                    this.intern._jright.css({top:y_, left:x_+this.intern._jelement.width()/2});
                if (this.intern._jleft)  
                    this.intern._jleft.css({top:y_, left:x_-this.intern._jleft.offset});
                if (this.intern._jbigWindow)
                {
                    var x = x_ + (this.intern._jelement.width()  - this.intern._jbigWindow.width())/2;
                    var y = y_ + (this.intern._jelement.height() - this.intern._jbigWindow.height())/2;
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    this.intern._jbigWindow.css ({top: y, left:x});
                    this.intern._jbigWindow.x = x;
                    this.intern._jbigWindow.y = y;
                }
                if (this.intern._jcircle)
                {
                    this.intern._jcircle.css({left:   this.settings.x - this.settings.dimmerThick, 
                                                top:    this.settings.y - this.settings.dimmerThick
                                               }); 
                }
                this.intern._isMoved = true;
                this.StoreSettings ();
            }
        }
        this.ShowBattery = function (isShow) {
            // Show battery icon
            if (isShow) 
            {
                if (!this.intern._jbattery) 
                {
                    if (!document.getElementById(this.advSettings.elemName+"_battery"))
                        this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_battery'></div>");
                    this.intern._jbattery=$('#'+this.advSettings.elemName+"_battery").show();
                    this.intern._jbattery.addClass("hq-battery0");
                    this.intern._jbattery.prepend("<div id='"+this.advSettings.elemName+"_battery1'></div>");
                    $('#'+this.advSettings.elemName+"_battery1").addClass("hq-battery1"); 
                    this.intern._jbattery.prepend("<div id='"+this.advSettings.elemName+"_batteryTop'></div>");
                    $('#'+this.advSettings.elemName+"_batteryTop").addClass("hq-battery-top"); 
                }
                else
                    this.intern._jbattery.show();
            }
            else
            {
                if (this.intern._jbattery)
                {
                    this.intern._jbattery.html("").hide();
                    this.intern._jbattery = null;
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
                if (!this.intern._jsignal) 
                {
                    if (!document.getElementById(this.advSettings.elemName+"_signal"))
                        this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_signal'></div>");
                    this.intern._jsignal=$('#'+this.advSettings.elemName+"_signal").show();
                    this.intern._jsignal.addClass("hq-signal");
                    this.intern._jsignal.bar = new Array ();
                    var h=this.intern._jsignal.height ();
                    var w=this.intern._jsignal.width ();
                    var ws=0;
                    for (i = iCnt-1; i >= 0; i--) 
                    {
                        this.intern._jsignal.prepend("<div id='"+this.advSettings.elemName+"_signalBar"+i+"'></div>");
                        this.intern._jsignal.bar[i] = $('#'+this.advSettings.elemName+"_signalBar"+i).addClass("hq-signal-bar");
                        if (ws==0) ws=this.intern._jsignal.bar[i].width();
                        var hh =(h/iCnt)/2 + (h-(h/iCnt)/2)/iCnt*i;
                        this.intern._jsignal.bar[i].css({top: h-hh, left: w - w/iCnt * (iCnt-i+1), height: hh});
                    }
                }
                else
                    this.intern._jsignal.show();

                for (i = 0; i < iCnt; i++) 
                {
                    /* excelence => all green*/
                    if (value > -65)
                        this.intern._jsignal.bar[i].addClass('hq-signal5');
                    else
                    if (value > -85)
                    {
                        if (i <= 3) 
                            this.intern._jsignal.bar[i].addClass('hq-signal4');
                        else
                            this.intern._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    if (value > -100)
                    {
                        if (i <= 2) 
                            this.intern._jsignal.bar[i].addClass('hq-signal3');
                        else
                            this.intern._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    if (value > -115)
                    {
                        if (i <= 1) 
                            this.intern._jsignal.bar[i].addClass('hq-signal2');
                        else
                            this.intern._jsignal.bar[i].addClass('hq-signal0');
                    }
                    else
                    {
                        if (i <= 0) 
                            this.intern._jsignal.bar[i].addClass('hq-signal1');
                        else
                            this.intern._jsignal.bar[i].addClass('hq-signal0');
                    }
                }
                this.intern._jsignal.attr('title', value+"dB");
            }
            else
            {
                if (this.intern._jsignal)
                {
                    this.intern._jsignal.html("").hide();
                    this.intern._jsignal = null;
                }
            }
        }
        this.SetStaticText = function (text, textFont, textColor) {
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeText) return;
            if (text      == undefined || text      == null || text     == "") text      = hqWidgets.Translate ("Text");
            if (textFont  == undefined || textFont  == null || textFont == "") textFont  = '20px "Tahoma", sans-serif';
            if (textColor == undefined || textColor == null || textColor== "") textColor = "white"; 
            this.intern._jstaticText.html(text).css({font: textFont, color: textColor});

            this.settings.staticText      = text;
            this.settings.staticTextFont  = textFont;
            this.settings.staticTextColor = textColor;
        }
        // Set title (Tooltip)
        this.SetTitle = function (room, title)	{
            if (!this.intern._jleft) 
            {
                if (!document.getElementById(this.advSettings.elemName+'_left')) 
                {
                    var $newdiv2 = $('<div id="'+this.advSettings.elemName+'_left"></div>');
                    this.advSettings.parent.append ($newdiv2);
                }
                this.intern._jleft=$('#'+this.advSettings.elemName+"_left");
                this.intern._jleft.css({position:     'absolute', 
                                          top:          this.settings.y,
                                          borderRadius: 10, 
                                          height:       30, 
                                          'z-index':    (this.settings.zindex == 'auto') ? -1 : this.settings.zindex-1, 
                                          fontSize:     10, 
                                          color:    'black'}); // Set position
                this.intern._jleft.addClass ("hq-button-base-info-left");
                this.intern._jleft.prepend("<div id='"+this.advSettings.elemName+"_descr'></div>");
                this.intern._jleft.prepend("<div id='"+this.advSettings.elemName+"_room'></div>");
                this.intern._jdesc = $('#'+this.advSettings.elemName+"_descr");
                this.intern._jdesc.css ({position:'absolute', top:3, left:5});
                this.intern._jroom = $('#'+this.advSettings.elemName+"_room");
                this.intern._jroom.css ({position:'absolute', top:15, left:5});
            }
            if (title != undefined) this.settings.title = title;
            if (room  != undefined) this.settings.room  = room;
            if (this.settings.room == null)
                this.settings.room = "";
            
            // If description is empty => set type
            this.intern._description = this.settings.title;
            if (this.intern._description == null || this.intern._description == "") {
                this.intern._description = hqWidgets.Type2Name (this.settings.buttonType);
                this.intern._jelement.attr ('title', "");
            }
            else
                this.intern._jelement.attr ('title', this.settings.title);

            this.intern._jleft.offset = this.intern._description.width();
            var w = this.settings.room.width();
            this.intern._jleft.offset = ((this.intern._jleft.offset > w) ? this.intern._jleft.offset : w)+ 10;
            this.intern._jleft.css({left:  this.settings.x - this.intern._jleft.offset, 
                                      width: this.intern._jleft.offset + this.intern._jelement.width() / 2}); // Set size
            this.intern._jdesc.html(this.intern._description);
            this.intern._jroom.html(this.settings.room);
        }
        this.ShowBigWindow = function (isShow, delay, customTimeout)	{
            if (isShow && hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this)
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);
            
            this.intern._isBigVisible = isShow;
            if (isShow) {
                if (customTimeout === undefined)
                    customTimeout = this.settings.popUpDelay; // show for standard period for 5 seconds
                    
                hqWidgets.gDynamics.gShownBig = this;
                // Close window after X seconds
                if (customTimeout > 0 && !this.dynStates.bigPinned) {
                    this.intern._timerID = setTimeout (function () {
                        if (hqWidgets.gDynamics.gShownBig) {
                            hqWidgets.gDynamics.gShownBig.intern._timerID = null;
                            hqWidgets.gDynamics.gShownBig.ShowBigWindow(false); 
                        } 
                        hqWidgets.gDynamics.gShownBig=null;
                    }, customTimeout);
                }
                
                this.intern._jbigWindow.show();
                if (this.intern._jbigWindow.bwidth == undefined) 
                {
                    this.intern._jbigWindow.bheight = this.intern._jbigWindow.height();
                    this.intern._jbigWindow.bwidth  = this.intern._jbigWindow.width();
                    this.intern._jbigWindow.x       = this.intern._jbigWindow.position().left;
                    this.intern._jbigWindow.y       = this.intern._jbigWindow.position().top;
                }
                this.intern._jbigWindow.css ({top:    this.settings.y, 
                                              left:   this.settings.x, 
                                              width:  this.intern._jelement.width(), 
                                              height: this.intern._jelement.height(),
                                              'z-index': 22, 
                                              });
                                                
                this.intern._jbigWindow.animate ({top:    this.intern._jbigWindow.y, 
                                                  left:   this.intern._jbigWindow.x, 
                                                  width:  this.intern._jbigWindow.bwidth, 
                                                  height: this.intern._jbigWindow.bheight}, 500);
                if (this.intern._jbigWindow.buttons) {
                    setTimeout (function () {
                        var i;
                        for (i=0;i<3;i++) hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons[i].show();
                    }, 500);	
                }
                else
                if (this.intern._jbigBlind1 != null)
                    this.intern._jbigBlind1.css({height:this.intern._jbigWindow.bheight * this.dynStates.percentState / 100});
                else
                if (this.intern._jbigWindow.jbigImage) {
                    setTimeout (function (el) { el.OnShow(); }, 510, this.intern._jbigWindow);
                }
            }
            else {
                hqWidgets.gDynamics.gShownBig = this;
                
                // remember position if it was moved
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeCam ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {
                    if (!hqWidgets.gOptions.gIsTouchDevice) {
                        this.intern._jbigWindow.bheight = this.intern._jbigWindow.height();
                        this.intern._jbigWindow.bwidth  = this.intern._jbigWindow.width();
                    }
                    this.intern._jbigWindow.x       = this.intern._jbigWindow.position().left;
                    this.intern._jbigWindow.y       = this.intern._jbigWindow.position().top;
                }
                
                if (this.intern._timerID) {
                    clearTimeout (this.intern._timerID);
                    this.intern._timerID = null;
                }
                 
                if (this.intern._jbigWindow.jbigImage) {
                    this.intern._jbigWindow.OnHide ();
                }
                
                if (delay) {
                    setTimeout (function (){
                        if (hqWidgets.gDynamics.gShownBig != null)
                        {
                            hqWidgets.gDynamics.gShownBig.intern._jbigWindow.animate ({
                                                                     top:    hqWidgets.gDynamics.gShownBig.settings.y, 
                                                                     left:   hqWidgets.gDynamics.gShownBig.settings.x, 
                                                                     width:  hqWidgets.gDynamics.gShownBig.intern._jelement.width(), 
                                                                     height: hqWidgets.gDynamics.gShownBig.intern._jelement.height()}, 500);
                                                                     
                            setTimeout(function(elem) {elem.intern._jbigWindow.hide();}, 500, hqWidgets.gDynamics.gShownBig);
                            
                            if (hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons)	{
                                var i;
                                for (i=0; i<3; i++)
                                    hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons[i].hide();
                            }
                            hqWidgets.gDynamics.gShownBig = null;
                        }
                    }, delay);
                }
                else {
                    hqWidgets.gDynamics.gShownBig.intern._jbigWindow.animate ({top:    this.settings.y, 
                                                             left:   this.settings.x, 
                                                             width:  this.intern._jelement.width(), 
                                                             height: this.intern._jelement.height()}, 500);
                                                             
                    setTimeout(function(elem) {elem.intern._jbigWindow.hide();}, 500, this);
                    if (this.intern._jbigWindow.buttons) {
                        var i;
                        for (i=0;i<3;i++)
                            this.intern._jbigWindow.buttons[i].hide();
                    }
                    hqWidgets.gDynamics.gShownBig = null;
                }	
            }
        }
        this.SetPercent = function (percent, isForSet)	{
            if (percent < 0)   percent = 0;
            if (percent > 100) percent =100;
            
            if ((!isForSet && percent != this.dynStates.percentState) ||
                (isForSet  && percent != this.intern._percentStateSet)) {
                if (isForSet)
                    this.intern._percentStateSet=percent;
                else
                    this.dynStates.percentState=percent;
                    
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind)
                   this.ShowBlindState (isForSet);
                   
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                    this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                   this._ShowCircleState (isForSet);
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
        
            if (!this.intern._isEditMode && this.dynStates.action) {
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    this.dynStates.action (this, "pos", Math.round (((this.settings.heatCtrlMax - this.settings.heatCtrlMin) * this.intern._percentStateSet / 100 + this.settings.heatCtrlMin) * 2) / 2);
                else
                    this.dynStates.action (this, "pos", this.intern._percentStateSet);
            }
        }
        this.ShowBlindState = function ()	{
            if (this.intern._jelement.leaf)
            {
                var i=0;
                while (this.intern._jelement.leaf[i])
                {
                    if (this.intern._isEditMode && this.settings.iContextMenu)
                        this.intern._jelement.leaf[i].divs[0].hide();
                    else
                    {
                        this.intern._jelement.leaf[i].divs[0].show();
                        this.intern._jelement.leaf[i].divs[this.intern._jelement.leaf[i].blindIndex].animate ({height:this.intern._jelement.leaf[i].height * (this.dynStates.percentState / 100)}, 500);
                    }
                    i++;
                }
            }
        }
        this.SetWindowState = function (index, state)	{
            if (index==-1 && this.intern._jelement.leaf)
            {
                var i=0;
                while (this.intern._jelement.leaf[i])
                {
                    this.SetWindowState(i, state);
                    i++;
                }
                return;
            }
        
            if (this.intern._jelement.leaf && this.intern._jelement.leaf[index])
            {
                var wnd = this.intern._jelement.leaf[index]; 
                
                if (state == hqWidgets.gWindowState.gWindowToggle)
                    state = (wnd.state == hqWidgets.gWindowState.gWindowClosed) ? hqWidgets.gWindowState.gWindowOpened: hqWidgets.gWindowState.gWindowClosed;
                else
                if (state == hqWidgets.gWindowState.gWindowUpdate)
                    state  = wnd.state;
                    
                this.intern._jelement.leaf[index].state = state;
                
                if (this.intern._isEditMode && !this.settings.isContextMenu)
                    state=hqWidgets.gOptions.gWindowOpened;

                if (state == hqWidgets.gWindowState.gWindowClosed || (this.intern._isEditMode && this.settings.isContextMenu))
                {
                    if (!this.intern._isEditMode) wnd.state = hqWidgets.gWindowState.gWindowClosed;
                    wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-left');
                    wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-right');
                    wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3');
                    wnd.divs[wnd.leafIndex].css ({top: 0, left: 0, width: wnd.width});
                }
                else
                {
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingLeft)
                    {
                        if (!this.intern._isEditMode) wnd.state = hqWidgets.gOptions.gWindowOpened;
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3-opened-left');
                        wnd.divs[wnd.leafIndex].css ({top: wnd.ooffset-3, left: 0, width: wnd.owidth});
                    }
                    else
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingRight)
                    {
                        if (!this.intern._isEditMode)wnd.state = hqWidgets.gOptions.gWindowOpened;
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
                    this.SetState (hqWidgets.gState.gStateOff);
                
                if (temp.valve      !=undefined && this.intern._jvalve)  this.intern._jvalve.html(Math.round(temp.valve) + '%');
                if (temp.setTemp    !=undefined && this.intern._jsettemp){
                    // If state word
                    if (typeof temp.setTemp === "string" && (temp.setTemp[0] < '0' || temp.setTemp[0] > '9'))
                        this.intern._jsettemp.html(temp.setTemp);
                    else
                        this.intern._jsettemp.html(hqWidgets.TempFormat(temp.setTemp) + hqWidgets.gOptions.gTempSymbol);
                }
                if (temp.temperature!=undefined && this.intern._jtemp)   this.intern._jtemp.html(hqWidgets.TempFormat(temp.temperature) + hqWidgets.gOptions.gTempSymbol);
                if (temp.humidity   !=undefined && this.intern._jhumid)  this.intern._jhumid.html(Math.round(temp.humidity)+'%');
                if (temp.hideValve  !=undefined && this.intern._jvalve)  {
                    if (!temp.hideValve)
                        this.intern._jvalve.show();
                    else
                        this.intern._jvalve.hide();
                }
            }
            else
            {	
                if (this.intern._jvalve)   this.intern._jvalve.html('--%');
                if (this.intern._jsettemp) this.intern._jsettemp.html('--,-&#176;C');
                if (this.intern._jtemp)    this.intern._jtemp.html('--,-&#176;C');
                if (this.intern._jhumid)   this.intern._jhumid.html('--,-%');
            }
        }
        this.OnContextMenu = function (x_, y_, isTouch)	{
            if (this.intern._isEditMode && this.intern._contextMenu && !this.intern._contextMenu.IsEmpty ())
            {
                if (hqWidgets.gDynamics.gActiveElement)
                {
                    hqWidgets.gDynamics.gActiveElement.intern._isPressed = false;
                    if (hqWidgets.gDynamics.gActiveElement.settings.noBackground) 
                        hqWidgets.gDynamics.gActiveElement._SetClass ("hq-no-background-edit", 100);
                    else 
                        hqWidgets.gDynamics.gActiveElement._SetClass (hqWidgets.gDynamics.gActiveElement.intern._backOffHover, 100);
                    hqWidgets.gDynamics.gActiveElement = null;
                }
                this.intern._contextMenu.Show (x_, y_);
                if (this.intern._jstaticText)  
                    this.intern._jstaticText.stop().show();
            }
        }
        this.OnMouseDown = function (x_, y_, isTouch)	{
            this.intern._isPressed = true;
            this.intern._isMoved   = false;
            
            if (!this.intern._isEditMode) {
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeImage && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeCam)
                {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    {
                        hqWidgets.gDynamics.gActiveElement = this;
                        this.intern._cursorX = this.settings.x + this.settings.width  / 2;
                        this.intern._cursorY = this.settings.y + this.settings.height / 2;
                        this.intern._angle   = -1; // unknown state
                        
                        // Wokaround for tablets
                        this.intern._hideDimmer = setTimeout (function (elem) {
                            //$('#status').append("try clear");
                            if (elem.intern._isMoved)
                                return;
                            //$('#status').append(" now clear");
                            elem.intern._isPressed = false;
                            elem.intern._isHoover  = false;
                            elem._ShowCircleState ();
                        }, 2000, this);
                        //$('#status').html(x_+"down<br>")
                    }
                
                    if (this.dynStates.action)
                    {
                        var _width  = this.intern._jelement.width();
                        var _height = this.intern._jelement.height();
                        if (!this.settings.x) this.settings.x = this.intern._jelement.position().left;
                        if (!this.settings.y) this.settings.y = this.intern._jelement.position().top;
                        var iShrink = 4;
                        var iShrinkCtr = hqWidgets.gOptions.gBtIconHeight/_height*iShrink;
                        this.intern._jelement.stop().animate({
                            width:        _width  - iShrink, 
                            height:       _height - iShrink, 
                            borderRadius: (this.settings.radius ? this.settings.radius : (_height - iShrink)/2), 
                            left:         this.settings.x + iShrink/2, 
                            top:          this.settings.y + iShrink/2}, 
                            50);
                            
                        if (this.intern._jcenter)
                            this.intern._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth -iShrinkCtr, 
                                                                   height: hqWidgets.gOptions.gBtIconHeight-iShrinkCtr, 
                                                                   left:  (_width - iShrink - hqWidgets.gOptions.gBtIconWidth  + iShrinkCtr)/2, 
                                                                   top:   (_height- iShrink - hqWidgets.gOptions.gBtIconHeight + iShrinkCtr)/2}, 50);
                       
                        this.intern._jicon.stop().animate({top:  (_height / 15 + iShrink / 2), 
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
                this._SetClass (this.intern._backMoving);											
                this.intern._cursorX = x_;
                this.intern._cursorY = y_;
                if (this.intern._jstaticText)	
                    hqWidgets.gDynamics.gActiveElement.intern._jstaticText.hide ();
                    
                if (isTouch)
                {
                    this.intern._isNonClick = false; // on tablet if I click the button in edit mode, it is moved immediately
                                                       // to detect the click, if mouse Up faster than 500 ms => click
                    hqWidgets.gDynamics.gRightClickDetection = setTimeout (function () {
                        hqWidgets.gDynamics.gActiveElement.OnContextMenu ((hqWidgets.gDynamics.gActiveElement.intern._cursorX - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.intern._cursorX - 70) : 0, 
                                                                          (hqWidgets.gDynamics.gActiveElement.intern._cursorY - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.intern._cursorY - 70) : 0);
                    }, 1000);
                    
                    this.intern._clickDetection = setTimeout (function () {
                        hqWidgets.gDynamics.gActiveElement.intern._isNonClick = true;
                    }, 500);
                    
                    return true;
                }
                else
                {
                    this.intern._isNonClick = true;
                    if (hqWidgets.gDynamics.gRightClickDetection) clearTimeout (hqWidgets.gDynamics.gRightClickDetection);
                    hqWidgets.gDynamics.gRightClickDetection = setTimeout (function () {
                        if (hqWidgets.gDynamics.gActiveElement)	
                            hqWidgets.gDynamics.gActiveElement.OnContextMenu (hqWidgets.gDynamics.gActiveElement.intern._cursorX, hqWidgets.gDynamics.gActiveElement.intern._cursorY);
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
            
            this.intern._isHoover  = false;
            
            if (!this.intern._isEditMode) {
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeImage && 
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeCam) {
                    if (this.dynStates.action || 
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        if ((this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                             this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) && this.intern._isPressed) {
                            this.intern._isPressed = false;
                            if (this.intern._isMoved)
                            {
                                this.SendPercent ();
                                this._ShowCircleState ();
                                
                            }
                        }
                        
                        this.intern._jelement.stop().animate({width:        this.settings.width, 
                                                                height:       this.settings.height, 
                                                                borderRadius: this.settings.radius, 
                                                                left:         this.settings.x, 
                                                                top:          this.settings.y}, 50);
                        if (this.intern._jcenter) {
                            this.intern._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth,
                                                                   height: hqWidgets.gOptions.gBtIconHeight, 
                                                                   left:   (this.settings.width - hqWidgets.gOptions.gBtIconWidth )/2, 
                                                                   top:    (this.settings.height- hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                            // Bugfix: somethimes it is in the wrong position
                            setTimeout (function (elem){
                                elem.intern._jcenter.stop().css({width:  hqWidgets.gOptions.gBtIconWidth,
                                                                   height: hqWidgets.gOptions.gBtIconHeight, 
                                                                   left:   (elem.settings.width - hqWidgets.gOptions.gBtIconWidth )/2, 
                                                                   top:    (elem.settings.height- hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                                                       }, 50, this);
                        }
                                                                   
                        this.intern._jicon.stop().animate({top:  '' + this.settings.height / 15, 
                                                             left: '' + this.settings.width  / 15}, 50);
                        /*if (this.intern._jtemp)     this.intern._jtemp.stop().show(50);
                        if (this.intern._jhumid)    this.intern._jhumid.stop().show(50);
                        if (this.intern._jright)    this.intern._jright.stop().show(50);
                        if (this.intern._jinfoText && (this.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer)) 
                            this.intern._jinfoText.stop().show(50);*/
                    }
                }
                this.intern._isPressed = false;
                
                // Bug fix: first click does not work
                if (!this.intern._isMoved) {
                    setTimeout (function (e) {
                        e.OnClick ()
                    }, 50, this);
                }
            }
            else
            {
                this.intern._isPressed = false;
                
                clearTimeout (this.intern._clickDetection);
                this.intern._clickDetection = null;
            
                //$('#status').append('up ' + this.intern._isEditMode+'<br>');
                
                if (isTouch && this.settings.isIgnoreEditMode && (!this.intern._contextMenu || !this.intern._contextMenu.isVisible))
                    this.OnClick ();
                    
                if (hqWidgets.gDynamics.gActiveElement && hqWidgets.gDynamics.gActiveElement.intern._jstaticText)	
                    hqWidgets.gDynamics.gActiveElement.intern._jstaticText.show ();
                                        
                if (this.settings.noBackground)
                    this._SetClass ("hq-no-background-edit", 100);
                else 
                if (!isTouch)
                {
                    if (this.settings.isIgnoreEditMode)
                        this._SetClass (this.intern._backOnHover, 100);			
                    else
                        this._SetClass (this.intern._backOffHover, 100);
                }
                else
                {
                    if (this.settings.isIgnoreEditMode && this.intern._isEditMode)
                        this._SetClass (this.intern._backOn, 100);			
                    else
                        this._SetClass (this.intern._backOff, 100);
                }
                
                if (!this.settings.isContextMenu) {
                    // update position
                    var pos = this.intern._jelement.position ();
                    this.SetPosition (pos.left, pos.top);
                }
            }
            if (hqWidgets.gDynamics.gActiveElement != null && (this.intern._isEditMode ||
                hqWidgets.gDynamics.gActiveElement.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer ||
                hqWidgets.gDynamics.gActiveElement == this))
                hqWidgets.gDynamics.gActiveElement = null;
        }	
        this.intern._element.parentQuery = this;
        this.hide = function () {
            this.intern._jelement.hide(); 
            if (this.intern._jright) 
                this.intern._jright.hide (); 
            if (this.intern._jleft) 
                this.intern._jleft.hide (); 
        }
        this.show = function () {
            this.intern._jelement.show(); 
            if (this.intern._jright && (this.intern._jvalve || (this.intern._jrightText && this.intern._jrightText.html() != ""))) 
                this.intern._jright.show (); 
            if (this.intern._jleft && this.intern._isEditMode) 
                this.intern._jleft.show ();
        }
        this.OnClick = function (isForce) {
            //$('#status').append('click start ' + this.intern._isEditMode+" " + this.clickTimer +'<br>');
            // Filter the double click 
            if (this.intern._clickTimer) return;
            this.intern._clickTimer = setTimeout (function (elem) { 
                clearTimeout (elem.intern._clickTimer);
                elem.intern._clickTimer = null;
            }, 500, this);
            
            hqWidgets.gDynamics.gClickTimer = setTimeout (function () {
                clearTimeout (hqWidgets.gDynamics.gClickTimer);
                hqWidgets.gDynamics.gClickTimer = null;
            }, 500);
            
            if (hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this)
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);

            if ((!this.intern._isEditMode || (this.settings.isIgnoreEditMode && !this.intern._isMoved)) && 
                this.dynStates.action && !this.intern._jbigWindow)
                this.dynStates.action (this, "state", this.dynStates.state);
             
            if (!this.intern._isEditMode || isForce) {
                // Send gong signal if gong pressed. Do not show camera dialog
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {
                    if (this.dynStates.action)
                        this.dynStates.action (this, "state", this.dynStates.state);
                   // Play melody
                    this._PlayMelody ();
                }
                else   
                if (this.intern._jbigWindow)
                    this.ShowBigWindow(true);
            }
                
            //hqWidgets.gDynamics.gActiveElement = null;
            //$('#status').append('click end ' + this.intern._isEditMode+" " + this.clickTimer +" "+ this.dynStates.state+'<br>');
        }
        this.OnMouseMove = function (x_, y_) {
            if (this.intern._isEditMode) {

                if (!this.settings.isContextMenu)
                    return;
            
                // filter out normal mouse click
                var mustBe = 0;
                if (hqWidgets.gDynamics.gRightClickDetection)       mustBe = 10;
                if (!this.intern._isNonClick) mustBe = 20;
                 
                var delta = Math.abs(this.intern._cursorX - x_);
                if (delta <= mustBe) delta = Math.abs(this.intern._cursorY - y_);
                        
                if (delta > mustBe)
                {
                    if (hqWidgets.gDynamics.gRightClickDetection) { 
                        //$('#status').append('cleard ' + hqWidgets.gDynamics.gRightClickDetection + "<br>");
                        clearTimeout (hqWidgets.gDynamics.gRightClickDetection); 
                        hqWidgets.gDynamics.gRightClickDetection = null; 
                    }
                    this.SetPosition (this.settings.x + x_ - this.intern._cursorX, this.settings.y + y_ - this.intern._cursorY);
                    this.intern._cursorX = x_;
                    this.intern._cursorY = y_;
                    //$('#statusM').html(delta + " x"+x_+" y"+y_);	
                }			
            }
            else
            if ((this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                 this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) && this.intern._isPressed) {
                //$('#status').append(x_+"aaa<br>")
                // filter out normal mouse click
                var mustBe = 0;
                if (!this.intern._isNonClick) mustBe = 20;
                 
                var delta = Math.abs(this.intern._cursorX - x_);
                if (delta <= mustBe) delta = Math.abs(this.intern._cursorY - y_);
                        
                if (delta > mustBe)
                {
                    // Y/X = tg (A)
                    var center_x = (this.settings.x + this.settings.width  / 2);
                    var center_y = (this.settings.y + this.settings.height / 2);
                    var ang = 0;
                    if (y_ >= center_y && x_ >= center_x)
                        ang = (270 + Math.atan ((y_ - center_y) / (x_ - center_x)) / 3.14149 * 180);
                    else
                    if (y_ >= center_y && x_ < center_x)
                        ang = (90  + Math.atan ((y_ - center_y) / (x_ - center_x)) / 3.14149 * 180);
                    else
                    if (y_ < center_y && x_ < center_x)
                        ang = (90  + Math.atan ((y_ - center_y) / (x_ - center_x)) / 3.14149 * 180);
                    else
                        ang = (270 + Math.atan ((y_ - center_y) / (x_ - center_x)) / 3.14149 * 180);
                    
                    var newang = Math.floor (ang / 90);
                    if (this.intern._angle == -1)
                        this.intern._angle = newang;
                    else
                    if (this.intern._angle == 0 && newang == 3)
                        ang = 0;
                    else
                    if (this.intern._angle == 3 && newang == 0)
                        ang = 360;
                    else
                        this.intern._angle = newang;

                    this.intern._isMoved = true;
                    percent = Math.floor (ang / 360 * 100);
                    this.SetPercent (percent, true);
                }	            
            }
        }
        this.Delete = function () {
            this.hide();
            this.intern._jelement.remove ();
            this.intern._jelement = null;
            if (this.intern._jright)
            {
                this.intern._jright.remove ();
                this.intern._jright = null;
            }
            if (this.intern._jleft)
            {
                this.intern._jleft.remove ();
                this.intern._jleft = null;
            }
            if (this.intern._jcircle)
            {
                this.intern._jcircle.remove ();
                this.intern._jcircle = null;
            }
            if (this.intern._contextMenu)
            {
                this.intern._contextMenu.Delete ();
                this.intern._contextMenu = null;
            }
        }	
        this.SetStates = function (dynOptions) {
            
            // InfoText and InfoTextCSS
            if (dynOptions.infoText !== undefined) 
                this.SetInfoText (dynOptions.infoText, this.settings.infoTextFont, this.settings.infoTextColor);
        
            // Signal strength
            if (dynOptions.strength !== undefined) {
                this.dynStates.strength = dynOptions.strength;
                if (this.intern._jsignal)
                    this.ShowSignal (true, this.dynStates.strength);
            }
            // Show signal
            if (dynOptions.isStrengthShow !== undefined && this.dynStates.strength != null) 
                this.ShowSignal (dynOptions.isStrengthShow, this.dynStates.strength);

            // Action function
            if (dynOptions.action != undefined)
                this.dynStates.action = dynOptions.action;

            // Context menu
            if (dynOptions._contextMenu !== undefined) 
                this.intern._contextMenu = dynOptions.contextMenu;

            // isRefresh
            if (dynOptions.isRefresh !== undefined) 
                this.SetRefresh (dynOptions.isRefresh);
                
            // isWorking
            if (dynOptions.isWorking !== undefined) 
                this.SetWorking (dynOptions.isWorking);
                
            // Temperature
            this.SetTemperature (dynOptions);
            
            //  lowBattery
            if (dynOptions.lowBattery !== undefined) 
                this.ShowBattery (dynOptions.lowBattery); 

            //  windowState  - like "0,2,1" means first leaf is unknown state, middle is closed and the third is opened
            if (dynOptions.windowState !== undefined && 
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
            if (dynOptions.percentState !== undefined) 
                this.SetPercent (dynOptions.percentState);
                
            //  state
            if (dynOptions.state !== undefined) { 
                this.SetState (dynOptions.state);
                if (dynOptions.state == null)
                    dynOptions.state = undefined;
            }                
                
            this.dynStates = $.extend (this.dynStates, dynOptions);
        }
        this.SetSettings = function (options, isSave) {
            //  Type
            if (options.buttonType!=undefined) 
                this._SetType (options.buttonType);

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
                this.SetSize(options.width, this.intern._jelement.height());
            else
            if (options.height!=undefined)
                this.SetSize(this.intern._jelement.width(), options.y);

            // Radius
            if (options.radius!= undefined && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeText) {
                this.settings.radius = options.radius;
                if (this.settings.radius == undefined || this.settings.radius == null)
                    this.settings.radius = hqWidgets.gOptions.gBtHeight/2;
                this.intern._jelement.css ({borderRadius: this.settings.radius});
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

            // jQuery style
            if (options.usejQueryStyle != undefined)
                this._SetUsejQueryStyle (options.usejQueryStyle, true);

            // noBackground
            if (options.noBackground != undefined) {
                this.settings.noBackground = options.noBackground;
                this._SetUsejQueryStyle (this.settings.usejQueryStyle, true);
            }
            
            //  iconName
            if (options.iconName !== undefined) {
                this.SetIcon (options.iconName);
                options.iconName = this.settings.iconName;
            }
            
            // ipCamImageURL => reset internal URl link
            if (options.ipCamImageURL !== undefined) {
                if ((settings.ipCamImageURL == null || settings.ipCamImageURL == "") && options.ipCamImageURL != null && options.ipCamImageURL != "") {
                    this._CreateBigCam ();
                }
                var upd = ((this.settings.ipCamImageURL != null && this.settings.ipCamImageURL != "") ||
                          (options.ipCamImageURL != null && options.ipCamImageURL != ""));
                this.intern._ipCamImageURL = null;
                this.settings.ipCamImageURL = options.ipCamImageURL;
                if (upd)
                    this._UpdateSmallCam ();
            }
                

            //  iconOn
            if (options.iconOn !== undefined) {
                this.SetIconOn (options.iconOn);
                options.iconOn = this.settings.iconOn;
            }

            //  Hide or show last action
            if (options.hoursLastAction !== undefined) {
                options.hoursLastAction = parseInt (options.hoursLastAction);
                this.settings.hoursLastAction = options.hoursLastAction;
                this._ShowLastActionTime ();
            }

            
            // doorType
            if (options.doorType!=undefined) 
                this.SetDoorType (options.doorType); 

            //  windowConfig - like "1,0,2" means 3 leafs, first is gSwingLeft, middle is deaf and the third is gSwingRight
            if (options.windowConfig != undefined && 
                this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                // trim
                if (options.windowConfig != null && options.windowConfig.replace(/^\s+|\s+$/g, '') != "")
                {                
                    this._SetWindowType (options.windowConfig);
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
                this.intern._jelement.css({'z-index':this.settings.zindex});
            }
            if (options.zindex != undefined){
                this.intern._jelement.css({'z-index':this.settings.zindex});
            }
            if (isSave) {
                this.settings = $.extend (this.settings, options);
                this.StoreSettings ();
            }
            if (this._CreateBigCam &&
                (options.title           != undefined || options.openDoorBttn  != undefined ||
                options.openDoorBttnText != undefined || options.gongActionBtn != undefined ||
                options.gongQuestion     != undefined || options.gongBtnText   != undefined)) {
                this._CreateBigCam ();
            }
        }


        // ------------ INIT ALL SETTINGS --------------------------------	
        if (options.x!=undefined && options.y!=undefined)
            this.intern._jelement.css ({top: options.y, left: options.x, position: 'absolute'}); // Set position
        
        // States and local variables
        //this.settings.zindex = (options.zindex != undefined) ? ((options.zindex < 998) ? options.zindex : 997) : ((options.buttonType == hqWidgets.gButtonType.gTypeImage) ? 0 : 1000);

        if (this.settings.isContextMenu && (typeof hqUtils != 'undefined') && hqUtils != null) {
            this.intern._contextMenu    = new hqUtils.ContextMenu ({parent: this});
            this.intern._contextMenu.Add ({text:hqWidgets.Type2Name(this.settings.buttonType)});
            this.intern._contextMenu.Add ({text:"Settings", action:function(elem){
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
            this.intern._contextMenu.Add ({line:true});
            this.intern._contextMenu.Add ({text:"Delete", action:function(elem){DeleteButton(elem);}});
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

        
        // Apply all settings
        this.SetSettings (this.settings);
        
        // Remember actual position for calculations 
        this.settings.x = this.intern._jelement.position().left;
        this.settings.y = this.intern._jelement.position().top;
        
        // Show button
        this.ShowState ();
        
        // Disable context menu on the page
        if (this.settings.isContextMenu)
            document.oncontextmenu = function() {return false;};
            
        // Create invisible handler layer
        this.intern._eventhnd = document.getElementById (this.advSettings.elemName+'_hnd');
        // Create HTML container if not exists
        if (!this.intern._eventhnd) {
            var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_hnd"></div>');
            this.intern._jelement.append ($newdiv1); 
            this.intern._eventhnd = document.getElementById (this.advSettings.elemName+'_hnd');
        }
        
        this.intern._jeventhnd = $('#'+this.advSettings.elemName+'_hnd');        
        this.intern._jeventhnd.css ({width:  this.settings.width, 
                                      height: this.settings.height,
                                      top:    0,//this.settings.y,
                                      left:   0,//this.settings.x,
                                      'z-index': 21,
                                      position: 'absolute',
                                      "background-color": "transparent",
                                      });
        this.intern._eventhnd.parentQuery = this;
        // ------------ Install all handlers on invisible handling div -----------------------------
        this.intern._jeventhnd.bind ("mouseenter", {msg: this}, function (event)	{
            var obj = event.data.msg;
            if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                return;
            
            if (!hqWidgets.gDynamics.gActiveElement || 
                 hqWidgets.gDynamics.gActiveElement == this)
                obj.intern._isHoover = true;
            
            if (!obj.intern._isEditMode || !obj.intern._isPressed)
            {		
                if (obj.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && obj.dynStates.action)
                {
                    if (obj.intern._isEditMode && obj.settings.isIgnoreEditMode)
                        obj._SetClass (obj.intern._backOnHover, 100);
                    else
                    if (obj.dynStates.state != hqWidgets.gState.gStateOn)
                        obj._SetClass (obj.intern._backOffHover, 100);
                    else
                        obj._SetClass (obj.intern._backOnHover, 100);
                }
                if ((obj.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                     obj.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) && !obj.intern._isEditMode) {
                    obj._ShowCircleState ();
                }
            }
        });
        this.intern._jeventhnd.bind ("mouseleave", {msg: this}, function (event)	{			
            var obj = event.data.msg;
            if (obj.settings.buttonType == hqWidgets.gButtonType.gTypeImage)
                return;
            var _width  = obj.intern._jelement.width();
            var _height = obj.intern._jelement.height();

            obj.intern._isHoover = false;
            
            // Disable pressed if without hqUtils
            if (obj.intern._isEditMode && !obj.settings.isContextMenu)
                obj.intern._isPressed = false;

            if (!obj.intern._isEditMode || !obj.intern._isPressed)
            {	
                if ((obj.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                     obj.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) && !obj.intern._isEditMode) {
                    if (!obj.intern._isPressed)
                        obj._ShowCircleState ();
                    else
                        return;
                }
            
                if (obj.intern._isPressed)
                {                
                    obj.intern._isPressed = false;
                    if (obj.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                    {
                        obj.intern._jelement.stop().animate({width:        _width, 
                                                               height:       _height, 
                                                               borderRadius: obj.settings.radius, 
                                                               left:         obj.settings.x, 
                                                               top:          obj.settings.y}, 50);
                        if (obj.intern._jcenter)
                            obj.intern._jcenter.stop().animate({width:  hqWidgets.gOptions.gBtIconWidth, 
                                                                  height: hqWidgets.gOptions.gBtIconHeight, 
                                                                  left:  (_width  - hqWidgets.gOptions.gBtIconWidth)/2, 
                                                                  top:   (_height - hqWidgets.gOptions.gBtIconHeight)/2}, 50);
                        obj.intern._jicon.stop().animate({top:  (_height / 15), 
                                                            left: (_width  / 15)}, 50);
                        /*if (obj.intern._jtemp)     obj.intern._jtemp.stop().show(50);
                        if (obj.intern._jhumid)    obj.intern._jhumid.stop().show(50);
                        if (obj.intern._jright)    obj.intern._jright.stop().show(50);
                        if (obj.intern._jinfoText) obj.intern._jinfoText.stop().show(50);*/
                    }
                }
                
                if (obj.dynStates.action && obj.settings.buttonType != hqWidgets.gButtonType.gTypeImage)
                {
                    if (obj.intern._isEditMode && obj.settings.isIgnoreEditMode)
                        obj._SetClass (obj.intern._backOn, 100);
                    else
                    if (obj.dynStates.state != hqWidgets.gState.gStateOn)
                        obj._SetClass (obj.intern._backOff, 100);
                    else
                        obj._SetClass (obj.intern._backOn, 100);
                }
            }
        });	
        this.intern._jeventhnd.bind ("mousedown",  {msg: this}, function (e)	{
            if (e.button == 0) // right
            {
                if ((!e.data.msg.intern._isEditMode || e.data.msg.settings.isContextMenu) && e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) {
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
        this.advSettings.parent.on  ('contextmenu', '#'+this.advSettings.elemName, function(e){ 
            if (e.target.parentQuery) 
                e.target.parentQuery.OnContextMenu (e.pageX, e.pageY, false);
            return false; 
        });
        this.intern._eventhnd.addEventListener('touchstart', function(e) {
            hqWidgets.gDynamics.gIsTouch=true;
            if (e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true))
                e.preventDefault();		
        }, false);
        this.intern._eventhnd.addEventListener('touchend',   function(e) {
            e.target.parentQuery.OnMouseUp (true);
        }, false);	
        this.intern._jeventhnd.bind ("change",  {msg: this}, function (e)	{
            if (e.data.msg.settings.isContextMenu)
                return;
                    
            var pos = e.data.msg.intern._jelement.position();
            e.data.msg.SetPosition (pos.left, pos.top);
        });
        this.intern._jeventhnd.bind ("click",   {msg: this}, function (e)	{
            e.data.msg.OnClick ();
        });
        this.intern._jeventhnd.bind ("mouseup", {msg: this}, function (e)	{
            e.data.msg.OnMouseUp (false);
        });	
        this.intern._jelement.bind  ("resize",  {msg: this}, function (e)	{
            if (e.data.msg.settings.isContextMenu)
                return;
                    
            e.data.msg.SetSize (e.data.msg.intern._jelement.width(), e.data.msg.intern._jelement.height());
        });
    },
    // Creates in the parent table lines with settings
    hqButtonEdit: function (options, obj, additionalSettingsFunction) {
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
        
        var sText     = "";
        var sTextAdv  = "";
        var iAdvCount = 0;
        
        this._EditTextHandler = function (eee, filter, isStates) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.filter   = (filter === undefined) ? null : filter;
                elem.isStates = isStates;
                $('#'+this.e_settings.elemName+'_'+eee).change (function () {
                    // If really changed
                    if (!elem.isStates) {
                        if (this.parent.e_internal.attr[this.ctrlAttr] != $(this).val()) {
                            this.parent.e_internal.attr[this.ctrlAttr] = $(this).val();
                            
                            if (this.parent.e_internal.attr[this.ctrlAttr] == "")
                                this.parent.e_internal.attr[this.ctrlAttr] = null;
                            
                            var newSettings = {};
                            if (this.ctrlAttr == 'openDoorBttnText') {            
                                this.parent.e_internal.attr['openDoorBttn'] = (this.parent.e_internal.attr[this.ctrlAttr] != null);
                                newSettings['openDoorBttn'] = this.parent.e_internal.attr['openDoorBttn'];
                            }
                                
                            newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                            this.parent.e_internal.obj.SetSettings (newSettings, true);
                        }
                    }
                    else {
                        if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] != $(this).val()) {
                            this.parent.e_internal.obj.dynStates[this.ctrlAttr] = $(this).val();
                            
                            if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] == "")
                                this.parent.e_internal.obj.dynStates[this.ctrlAttr] = null;
                            
                            var newSettings = {};
                            newSettings[this.ctrlAttr] = this.parent.e_internal.obj.dynStates[this.ctrlAttr];
                            this.parent.e_internal.obj.SetStates (newSettings, true);
                        }
                    }
                });
                
                $('#'+this.e_settings.elemName+'_'+eee).keyup (function () {
                    if (this.parent.e_internal.timer) 
                        clearTimeout (this.parent.e_internal.timer);
                        
                    this.parent.e_internal.timer = setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.e_internal.timer=null;
                    }, this.parent.e_settings.timeout, this);
                });            
                if (this.e_settings.imgSelect)
                {
                    var btn = document.getElementById (this.e_settings.elemName+'_'+eee+'Btn');
                    if (btn) {
                        btn.ctrlAttr = eee;
                        btn.filter   = document.getElementById (this.e_settings.elemName+'_'+eee).filter;
                        $(btn).bind("click", {msg: this}, function (event) {
                            var _obj = event.data.msg;
                            var _settings = {
                                current:     _obj.e_internal.attr[this.ctrlAttr],
                                onselectArg: this.ctrlAttr,
                                filter:      (this.filter == null) ? ".png;.gif;.jpg;.bmp" : this.filter,
                                onselect:    function (img, ctrlAttr) {
                                    $('#'+_obj.e_settings.elemName+'_'+ctrlAttr).val(_obj.e_settings.imgSelect.GetFileName(img, hqWidgets.gOptions.gPictDir)).trigger("change");
                                }};
                            _obj.e_settings.imgSelect.Show (_settings);                    
                        });
                    }
                }
            }	
        }
        this._EditCheckboxHandler = function (eee, isStates, valFalse, valTrue, onChange) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.isStates = (isStates == undefined) ? true : isStates;
                elem.valFalse = (valFalse == undefined) ? hqWidgets.gState.gStateOff : valFalse;
                elem.valTrue  = (valTrue  == undefined) ? hqWidgets.gState.gStateOn  : valTrue;
                elem.onChange = onChange;
                
                $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                    this.parent.e_internal.attr[this.ctrlAttr] = $(this).prop('checked') ? this.valTrue : this.valFalse;
                    var newSettings = {};
                    newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                    
                    if (this.isStates)
                        this.parent.e_internal.obj.SetStates (newSettings);
                    else
                        this.parent.e_internal.obj.SetSettings (newSettings, true);
                    
                    if (this.onChange)
                        this.onChange (this.parent.e_internal.attr[this.ctrlAttr], this.parent);
                });
            }        
        }
        
        // Active/Inactive state
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sText += "<tr><td>"+ hqWidgets.Translate("Test state:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_state'>";
        }
        
        // Simulate click
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText += "<tr><td></td><td><input type='button' value='"+hqWidgets.Translate("Simulate click")+"' id='"+this.e_settings.elemName+"_popUp'>";
        }
        
        // Radius and Is Use jQuery Style
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Radius:")+"</td><td id='"+this.e_settings.elemName+"_radius'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("jQuery Styles:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_usejQueryStyle' "+((this.e_internal.attr.usejQueryStyle) ? "checked" : "")+">";
        }

        // Door swing type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDoor) {
            sText += "<tr><td>"+ hqWidgets.Translate("Slide:")+"</td><td><select style='width: "+this.e_settings.width+"px'  id='"+this.e_settings.elemName+"_door'>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.Translate("Left")+"</option>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.Translate("Right")+"</option>";
            sText += "</select></td></tr>";
        }
        
        // Blind window types
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
        
        // Normal icon image
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText&& 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sText += "<tr><td>"+ hqWidgets.Translate("Icon:")+"</td><td>";
            sText += "<input id='"+this.e_settings.elemName+"_iconName' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconName==undefined) ? "" : this.e_internal.attr.iconName)+"'>";
            sText += "<input id='"+this.e_settings.elemName+"_iconNameBtn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";
        }
        
        // Info Text color, font, type
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer&& 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeButton &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGong) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Test text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoText'  type='text' value='"+(this.e_internal.obj.dynStates.infoText || "")+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextFont'  type='text' value='"+this.e_internal.attr.infoTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextColor' type='text' value='"+this.e_internal.attr.infoTextColor+"'></td></tr>";
        }
        
        // Static Text color, font, type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeText) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticText'  type='text' value='"+this.e_internal.attr.staticText+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextFont'  type='text' value='"+this.e_internal.attr.staticTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextColor' type='text' value='"+this.e_internal.attr.staticTextColor+"'></td></tr>";
        }  
        
        // Active state icon
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Icon&nbsp;active:")+"</td><td>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOn' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.iconOn == undefined) ? "":this.e_internal.attr.iconOn)+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOnBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        } 
        
        // Camera URL, pop up delay, if show open door button
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            var s = "<td>"+ hqWidgets.Translate("Camera URL:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamImageURL'  type='text' value='"+(this.e_internal.attr.ipCamImageURL || "")+"'></td></tr>";
            if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam)
                sText += "<tr>"+s;
            else
                sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'>"+s;
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Pop up delay (ms):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_popUpDelay'  type='text' value='"+this.e_internal.attr.popUpDelay+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Open door button:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_openDoorBttn' "+(this.e_internal.attr.openDoorBttn ? "checked" : "")+" ></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Open door text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_openDoorBttnText'  type='text' value='"+this.e_internal.attr.openDoorBttnText+"'></td></tr>";
        }

        // Camera update interval for small image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Small image update(sec):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamUpdateSec'  type='text' value='"+this.e_internal.attr.ipCamUpdateSec+"'></td></tr>";
        }
        
        // gong wav, gong question, gong question image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText    += "<tr><td>"+ hqWidgets.Translate("Gong wav file:")+"</td><td>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelody' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.gongMelody == undefined) ? "":this.e_internal.attr.gongMelody)+"'>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelodyBtn' style='width: 30px' type='button' value='...'>";
            sText    += "</td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Gong question:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_gongQuestion'  type='text' value='"+this.e_internal.attr.gongQuestion+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Gong question image:")+"</td><td>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gongQuestionImg' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.gongQuestionImg == undefined) ? "":this.e_internal.attr.gongQuestionImg)+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gongQuestionImgBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        }
            
        // if hide last action info after x hours
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer) {            
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Hide last action after (hrs):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_hoursLastAction'  type='text' value='"+this.e_internal.attr.hoursLastAction+"'></td></tr>";
        }
        
        
        // Format string, active condition, If hide when incative state
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Format string:")    +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoFormat'     type='text' value='"+this.e_internal.attr.infoFormat+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Active condition:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoCondition'  type='text' value='"+((this.e_internal.attr.infoCondition != undefined) ? this.e_internal.attr.infoCondition : "")+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("Hide inactive:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_infoIsHideInactive' "+((this.e_internal.attr.infoIsHideInactive) ? "checked" : "")+">";
        }  
        
        // No background
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.Translate("No background:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_back' "+((this.e_internal.attr.noBackground) ? "checked" : "")+">";
        }
        
        // Description
        sText += "<tr><td>"+ hqWidgets.Translate("Description:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_title' type='text' value='"+((this.e_internal.attr.title) || "")+"'></td></tr>";

        this.e_settings.parent.append (sText);
        if (sTextAdv != "") {
            sTextAdv = "<tr><td colspan=2><button id='idShowAdv'>"+hqWidgets.Translate("Advanced...")+"</td></tr>" + sTextAdv;
            this.e_settings.parent.append (sTextAdv);
            var advBtn = document.getElementById ('idShowAdv');
            advBtn.obj   = this;
            advBtn.state = false;
            
            $('#idShowAdv').button({icons: {primary: "ui-icon-carat-1-s"}}).click(function( event ) {
                                        this.state = !this.state;
                                        if (this.state) {
                                            $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                                            var i = 0;
                                            while (document.getElementById ('idAdv'+i)) {
                                                $('#idAdv'+i).show();
                                                i++;
                                            }
                                        }
                                        else {
                                            $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                                            var i = 0;
                                            while (document.getElementById ('idAdv'+i)) {
                                                $('#idAdv'+i).hide();
                                                i++;
                                            }                                        
                                        }
                                  });
            // Hide all                      
            var i = 0;
            while (document.getElementById ('idAdv'+i)) {
                $('#idAdv'+i).hide();
                i++;
            }
        }
        // Apply functionality
        
        this._EditCheckboxHandler ('state');
    
        var elem;
        if ((elem = document.getElementById (this.e_settings.elemName+'_popUp')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_popUp').click (function () { 
                this.parent.e_internal.obj.OnClick (true);
                $(this).attr('checked', false);
            });
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
        this._EditTextHandler('iconName');
        this._EditTextHandler('iconOn');   
        
        this._EditTextHandler('infoText', '', true);   
        this._EditTextHandler('infoTextFont');   
        this._EditTextHandler('infoTextColor');   
        this._EditTextHandler('infoFormat');   
        this._EditTextHandler('infoCondition');  
        
        this._EditTextHandler('staticText');   
        this._EditTextHandler('staticTextFont');   
        this._EditTextHandler('staticTextColor');   
        
        this._EditTextHandler('title');   
        
        this._EditTextHandler('infoTextColor');   
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_info')) != null) {
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
        }*/
        this._EditCheckboxHandler ('infoIsHideInactive', false, false, true);
        this._EditCheckboxHandler ('noBackChanged', false, false, true);
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_hideInactive')) != null) {
            var _jcheckbox = $('#'+this.e_settings.elemName+'_hideInactive');
            elem.parent = this;
            this.e_internal.inactiveChanged = function ()
            {
                this.attr.infoIsHideInactive = $('#'+this.parent.e_settings.elemName+'_hideInactive').prop('checked');
                this.obj.SetSettings ({infoIsHideInactive: this.attr.infoIsHideInactive}, true);
            };
            
            _jcheckbox.change (function () { this.parent.e_internal.inactiveChanged ();});
        }	
        if ((elem = document.getElementById (this.e_settings.elemName+'_back')) != null) {
            var _jcheckbox = $('#'+this.e_settings.elemName+'_back');
            elem.parent = this;
            this.e_internal.noBackChanged = function ()
            {
                this.attr.noBackground = $('#'+this.parent.e_settings.elemName+'_back').prop('checked');
                this.obj.SetSettings ({noBackground: this.attr.noBackground}, true);
            };
            
            _jcheckbox.change (function () { this.parent.e_internal.noBackChanged ();});
        }*/
        this._EditCheckboxHandler ('usejQueryStyle', false, false, true);
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_usejQueryStyle')) != null) {
            var _jcheckbox = $('#'+this.e_settings.elemName+'_usejQueryStyle');
            elem.parent = this;
            this.e_internal.jQueryStyleChanged = function ()
            {
                this.attr.usejQueryStyle = $('#'+this.parent.e_settings.elemName+'_usejQueryStyle').prop('checked');
                this.obj.SetSettings ({usejQueryStyle: this.attr.usejQueryStyle}, true);
            };
            
            _jcheckbox.change (function () { this.parent.e_internal.jQueryStyleChanged ();});
        }*/
        this._EditTextHandler('ipCamImageURL');   
        this._EditTextHandler('popUpDelay');   
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_ipCamImageURL')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_ipCamImageURL').change (function () { 
                this.parent.e_internal.attr.ipCamImageURL = $('#'+this.parent.e_settings.elemName+'_ipCamImageURL').val();
                this.parent.e_internal.obj.SetSettings ({ipCamImageURL: this.parent.e_internal.attr.ipCamImageURL}, true);
            });
            
            $('#'+this.e_settings.elemName+'_ipCamImageURL').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_ipCamImageURL'));
            });
        }
        if ((elem = document.getElementById (this.e_settings.elemName+'_popUpDelay')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_popUpDelay').change (function () { 
                this.parent.e_internal.attr.popUpDelay = $('#'+this.parent.e_settings.elemName+'_popUpDelay').val();
                this.parent.e_internal.obj.SetSettings ({popUpDelay: this.parent.e_internal.attr.popUpDelay}, true);
            });
            
            $('#'+this.e_settings.elemName+'_popUpDelay').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_popUpDelay'));
            });
        }*/
        this._EditCheckboxHandler ('openDoorBttn', false, false, true, function (isChecked, obj) {
            document.getElementById(obj.e_settings.elemName+'_openDoorBttnText').disabled = !isChecked;
        });
        if (document.getElementById(this.e_settings.elemName+'_openDoorBttnText')) {
            document.getElementById(this.e_settings.elemName+'_openDoorBttnText').disabled = !this.e_internal.attr.openDoorBttn;
        }
        this._EditTextHandler ('openDoorBttnText');
        this._EditTextHandler ('hoursLastAction');
        this._EditTextHandler ('gongQuestion');
        this._EditTextHandler ('gongQuestionImg');
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_openDoorBttnText')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_openDoorBttnText').change (function () { 
                this.parent.e_internal.attr.ipCamBtnText = $('#'+this.parent.e_settings.elemName+'_openDoorBttnText').val();
                this.parent.e_internal.attr.openDoorBttn = (this.parent.e_internal.attr.ipCamBtnText != "");
                this.parent.e_internal.obj.SetSettings ({ipCamBtnText: this.parent.e_internal.attr.ipCamBtnText}, true);
            });
            
            $('#'+this.e_settings.elemName+'_openDoorBttnText').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_ipCamBtnText'));
            });
        }           
        */
        this._EditTextHandler ('ipCamUpdateSec');
        /*if ((elem = document.getElementById (this.e_settings.elemName+'_ipCamUpdateSec')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_ipCamUpdateSec').change (function () { 
                this.parent.e_internal.attr.ipCamUpdateSec = $('#'+this.parent.e_settings.elemName+'_ipCamUpdateSec').val();
                this.parent.e_internal.obj.SetSettings ({ipCamUpdateSec: this.parent.e_internal.attr.ipCamUpdateSec}, true);
            });
            
            $('#'+this.e_settings.elemName+'_ipCamUpdateSec').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_ipCamUpdateSec'));
            });
        }    */    
        this._EditTextHandler ('gongMelody', ".mp3;.wav");
        /*
        if ((elem = document.getElementById (this.e_settings.elemName+'_gongMelody')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_gongMelody').change (function () {
                this.attr.gongMelody = $('#'+this.parent.e_settings.elemName+'_gongMelody').val();
                if (this.attr.gongMelody == "")
                    this.attr.gongMelody = null;
                this.obj.SetSettings ({gongMelody: this.attr.gongMelody}, true);
            });
            
            $('#'+this.e_settings.elemName+'_gongMelody').keyup (function () {
                if (this.parent.e_internal.timer) 
                    clearTimeout (this.parent.e_internal.timer);
                    
                this.parent.e_internal.timer = setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.e_internal.timer=null;
                }, this.parent.e_settings.timeout, document.getElementById (this.parent.e_settings.elemName+'_gongMelody'));
            });            
            if (this.e_settings.imgSelect) {
                var _jBtn = $('#'+this.e_settings.elemName+'_gongMelodyBtn');
                _jBtn.bind("click", {msg: this}, function (event) {
                    var _obj = event.data.msg;
                    var _settings = {
                        current:     _obj.e_internal.attr.iconName,
                        onselectArg: _obj.e_settings.elemName,
                        filter:      ".mp3;.wav",
                        onselect:    function (img, elemName)
                        {
                            $('#'+elemName+'_gongMelody').val(_obj.e_settings.imgSelect.GetFileName(img, hqWidgets.gOptions.gPictDir));
                            $('#'+elemName+'_gongMelody').trigger("change");
                        }};
                    _obj.e_settings.imgSelect.Show (_settings);                    
                });
            }
        }	*/
        
        this._EditTextHandler ('gongQuestionImg');
        
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