/*
hqWidgets is a "high quality" home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button - To present and/or control some switch (e.g. Lamp)
- Dimmer - To present and control dimmer
- Window blind - to present and control one blind and display up to 4 window leafs
- Indoor temperature - to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature - to display outdoor temperature and humidity
- Door   - to present a door
- Lock   - to present and control lock
- Image  - to show a static image
- Text   - to show a static text with different colors and font styles
- Info   - To display some information. Supports format string, condition for active state and different icons for active and static state.
 
------ Version V0.1 ------
 
 
----
Used software and icons:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
* door bell by Lorc http://lorcblog.blogspot.de/
 
 
Copyright (c) 2013 Bluefox dogafox@gmail.com
 
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
    version: "0.1.11",
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
        gIsTouchDevice: false,      // if desktop or touch device
        gHideDescription: false     // Hide description left in edit mode
    },
    // Button states
    gState: {
        gStateUnknown :0,
        gStateOn      :1, // On
        gStateOff     :2  // Off
    },   
	// Active condition operations
	gOperations: {
		eq: "=  ",
		neq:"<> ",
		gr: ">  ",
		ls: "<  ",
		gre:">= ",
		lse:"<= ",
		has:"has"
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
        gTypeGauge  : 15,
        gTypeLowbat : 16   // Show widget only if low battery problem
    },
    gWindowState: {
        // State of the leaf
        gWindowClosed: 0,
        gWindowOpened: 1,
        gWindowTilted: 2,
        gWindowToggle: 3,
        gWindowUpdate: 4
    },
    gSwingType: {
        // Type of the leaf
        gSwingDeaf:  0, // Window or door cannot be opened
        gSwingLeft:  1, // Window or door opened on the right side
        gSwingRight: 2, // Window or door opened on the left side
		gSwingTop:   3  // Window opened on the top (like roof window)
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
        gLockOpenDoor: 2  // Command to open door
    },
    gDlgResult: {
        // Dialog result
        gDlgClose:    0,
        gDlgOk:       1,
        gDlgCancel:   2,
        gDlgYes:      3,
        gDlgNo:       4,
        gDlgInvalid: -1
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
        gElements            : [],
        gClickTimer          : null     // Timer to filer out the double clicks
    },
    translate: function (text) {
        return text;
    },
    TempFormat: function (t){
        var tStr = parseFloat(Math.round(t * 10) / 10).toFixed(1) + "";
        if (this.gOptions.gLocale != 'de' && 
            this.gOptions.gLocale != 'ru') {
            return tStr;
        }else{
            return tStr.replace (".", ",");
        }
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
            
        if (this.gDynamics.gActiveElement != null) {
            this.gDynamics.gActiveElement.OnMouseUp ();		
            this.gDynamics.gActiveElement = null;
        }
        else
        if (this.gDynamics.gActiveBig!=null) {               
            this.gDynamics.gActiveBig.ShowBigWindow(false);
            this.gDynamics.gActiveBig.SendPercent ();
            this.gDynamics.gActiveBig = null;
        }
        if (this.gDynamics.gActiveSlider!=null) {
            //this.gDynamics.gActiveSlider.SendPosition ();
            this.gDynamics.gActiveSlider=null;		
        }
        this.gDynamics.gIsTouch = false;
    },
    // On mouse move handler
    onMouseMove: function (x_, y_) {
        if (this.gDynamics.gActiveElement != null) {
            this.gDynamics.gActiveElement.OnMouseMove (x_,y_);
        }
        else
        if (this.gDynamics.gActiveBig != null) {
            this.gDynamics.gActiveBig.intern._jbigWindow.OnMouseMove (x_,y_);//.SetPositionOffset(y_ - this.gDynamics.gActiveBig.cursorY);
        }
        else
        if (this.gDynamics.gActiveSlider != null) {
            this.gDynamics.gActiveSlider.OnMouseMove(x_, y_);
        }
    },
    // Convert button type to string
    Type2Name: function  (t) {
        switch (t){
        case this.gButtonType.gTypeButton: return this.translate("Button");
        case this.gButtonType.gTypeInTemp: return this.translate("In. Temp.");
        case this.gButtonType.gTypeOutTemp:return this.translate("Out. Temp.");
        case this.gButtonType.gTypeBlind:  return this.translate("Blind");
        case this.gButtonType.gTypeLock:   return this.translate("Lock");
        case this.gButtonType.gTypeDoor:   return this.translate("Door");
        case this.gButtonType.gTypeInfo:   return this.translate("Info");
        case this.gButtonType.gTypeHeat:   return this.translate("Heater");
        case this.gButtonType.gTypeMotion: return this.translate("Motion");
        case this.gButtonType.gTypePhone:  return this.translate("Phone");
        case this.gButtonType.gTypeDimmer: return this.translate("Dimmer");
        case this.gButtonType.gTypeImage:  return this.translate("Image");
        case this.gButtonType.gTypeText:   return this.translate("Text");
        case this.gButtonType.gTypeDimmer: return this.translate("Dimmer");
        case this.gButtonType.gTypeCam:    return this.translate("Camera");
        case this.gButtonType.gTypeGong:   return this.translate("Gong");
        case this.gButtonType.gTypeGauge:  return this.translate("Gauge");
        case this.gButtonType.gTypeLowbat: return this.translate("Low battery");
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
        while (this.gDynamics.gElements[i]){
            if (this.gDynamics.gElements[i].advSettings.elemName == buttonName) {
                return this.gDynamics.gElements[i];
            }
            i++;
        }
        return null;
    },
    // Delete button from the list
    Delete: function (buttonToDelete) {
        if (buttonToDelete.settings == undefined) {
            // May be this is te name of the div element
            buttonToDelete = this.Get (buttonToDelete);
        }
        if (buttonToDelete == null || buttonToDelete.settings == undefined) {
            // Button not found
            return;
        }
       
        
        if (buttonToDelete.settings.isContextMenu && hqUtils !== undefined && hqUtils != null) {
            var dlg = new hqUtils.Dialog ({
                title:     hqWidgets.translate("Delete"), 
                content:   hqWidgets.translate("Are you sure?"), 
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
    SetHideDescription: function  (isHide) {
        this.gOptions.gHideDescription = isHide;
        var i = 0;
        while (this.gDynamics.gElements[i])
        {
            this.gDynamics.gElements[i].hide();
            this.gDynamics.gElements[i].show();
            i++;
        }

        return this.gOptions.gHideDescription;
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
        var result = "";
        if (newTime === undefined)
            newTime = new Date ();
        var seconds = (newTime.getTime() - oldTime.getTime ()) / 1000;
        if (seconds <= 3600)
            result = "vor "+ Math.floor (seconds / 60)+" Min.";
        else
        if (seconds <= 3600*24)
            result = "vor "+ Math.floor (seconds / 3600)+" St. und "+(Math.floor (seconds / 60) % 60)+" Min.";
        else
        if (seconds > 3600*24 && seconds <= 3600*48)
            result = "gestern";
        else
        if (seconds > 3600*48)
            result = "vor "+ Math.floor (seconds / 3600)+" Stunden";

        return result;
    },
    // Format timr
    TimeToString: function (time, timeFormat) {
		if (!timeFormat) {
			timeFormat = "YYYY.MM.DD hh:mm:ss";
		}
		// Translate format from german
		timeFormat = timeFormat.replace ("JJ", "YY").replace ("JJ", "YY").replace ("J", "Y");
		timeFormat = timeFormat.replace ("SS", "hh").replace ("S", "h");
		timeFormat = timeFormat.replace ("TT", "DD").replace ("T", "D");
	
        var dateStr = "";
        var year = time.getFullYear();
		if (timeFormat.indexOf ("YYYY") == -1) {
			year = parseInt (year) % 100;
			if (timeFormat.indexOf ("YY") == -1) {
				year = parseInt (year) % 10;
			}
		}
		timeFormat = timeFormat.replace("YYY", "Y").replace("YY", "Y");
        
        var month = time.getMonth() + 1;
		if (timeFormat.indexOf ("MM") != -1) {
			month = (month < 10) ? "0" + month : "" + month;
			timeFormat = timeFormat.replace("MM", "M");
		}
        
        var day  = time.getDate();
		if (timeFormat.indexOf ("DD") != -1) {
			day = (day < 10) ? "0" + day : "" + day;
			timeFormat = timeFormat.replace("DD", "D");
		}
        
        var hours = time.getHours();
		if (timeFormat.indexOf ("hh") != -1) {
			hours = (hours < 10) ? "0" + hours : "" + hours;
			timeFormat = timeFormat.replace("hh", "h");
		}

        var minutes = time.getMinutes();
		if (timeFormat.indexOf ("mm") != -1) {
			minutes = (minutes < 10) ? "0" + minutes : "" + minutes;
			timeFormat = timeFormat.replace("mm", "m");
		}

        var seconds = time.getSeconds();
		if (timeFormat.indexOf ("ss") != -1) {
			seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
			timeFormat = timeFormat.replace("ss", "s");
		}
		dateStr = timeFormat;
		dateStr = dateStr.replace ("Y", year);
		dateStr = dateStr.replace ("M", month);
		dateStr = dateStr.replace ("D", day);
		dateStr = dateStr.replace ("h", hours);
		dateStr = dateStr.replace ("m", minutes);
		dateStr = dateStr.replace ("s", seconds);
		
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
            if (hqWidgets.gDynamics.gIsTouch) {
                return;
            }
            hqWidgets.onMouseMove(event.pageX, event.pageY);
        }); 
        document.addEventListener('touchmove', function(e) {
            if ((hqWidgets.gDynamics.gActiveElement != null) || 
                (hqWidgets.gDynamics.gActiveBig     != null) || 
                (hqWidgets.gDynamics.gActiveSlider  != null))
            {
                //$('#statusM').html(" x"+e.touches[0].pageX+" y"+e.touches[0].pageY);	
                e.preventDefault();
                hqWidgets.onMouseMove(e.touches[0].pageX, e.touches[0].pageY);
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
        };
        String.prototype.dimensions = function(font) {
            var f = font || '10px "Tahoma", sans-serif',
                    o = $('<div>' + this + '</div>')
                            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
                            .appendTo($('body')),
                    w = {width: o.width(), height: o.height()};

            o.remove();

            return w;
        };        
		this.CyclicService ();
    },
    //Calculate condition 
	evalCondition : function (value, cond) {
		if (cond == null || cond == undefined || cond.length < 4) {
			return false;
		}
		// first 3 chars are always compare condition
		var c = cond.substring(0,3);
		var cval = cond.substring(3);
		
		if (value === null || value === undefined) {
			value = "";
		}
		if (cval === "null" || cval == "''" || cval == "\"\"") {
			cval = "";
		}
		
		// If substring
		if (c == hqWidgets.gOperations.has) {
			value = value.toString();
			return (value.indexOf (cval) != -1);
		}
		
		// If boolean compare
		if (value === "true" || value === "false" || value === true || value === false) {
			value = (value === "true" || value === true) ? true: false;
			cval  = (cval === "true"  || cval === true)  ? true: false;
			
			// equal
			if (c == hqWidgets.gOperations.eq) {
				return (cval === value);
			} else
			if (c == hqWidgets.gOperations.neq) {
				return (cval !== value);
			} else {
				return false;
			}
		}
		else {		
			// equal
			if (c == hqWidgets.gOperations.eq) {
				return (value == cval);
			} else
			// not equal
			if (c == hqWidgets.gOperations.neq) {
				return (value != cval);
			}else
			// greater
			if (c == hqWidgets.gOperations.gr) {
				return (value > cval);
			} else
			// less
			if (c == hqWidgets.gOperations.ls) {
				return (value > cval);
			}else
			// greater or equal
			if (c == hqWidgets.gOperations.gre) {
				return (value >= cval);
			}else
			// less or equal
			if (c == hqWidgets.gOperations.lse) {
				return (value <= cval);
			}
		}
		
		return false;
	},
	// HButton
    hqButton: function (options, advOptions) {	
        var advSettings = {
            // Parent and container (Will not be stored)
            elemName:     null,         // name of the container HTML element (div)
            parent:       $('body')     // jQuery parent class
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
            btIconWidth:      hqWidgets.gOptions.gBtIconWidth,  // Width of the icon
            btIconHeight:     hqWidgets.gOptions.gBtIconHeight, // Height of the icon

            //styles
            styleNormal:      null,
            styleNormalHover: null,
            styleActive:      null,
            styleActiveHover: null,
            
            // Static state properties
            buttonType:       hqWidgets.gButtonType.gTypeButton,// button type
            doorType:         hqWidgets.gSwingType.gSwingLeft,  // Swing direction for door
            windowConfig:     hqWidgets.gSwingType.gSwingDeaf,  // Window configuration and state
            doNotAnimate:     false, // disable animation of popUp for slow devices
            
            infoTextFont:     null,  // Font for the dynamic text in the middle of the button
            infoTextColor:    null,  // Color for the dynamic text in the middle of the button
            infoTextColorActive:null,// Color for the dynamic text in the middle of the button in active state
            infoFormat:       "%s",  // format string for info
            infoCondition:    null,  // Condition like ">  0", "<  0", ">  5", "== 6.7", "== true" for active state
            infoIsHideInactive: false,// If hide if inactive state
            infoAccuracy:     null,  // Number of digits after point or "" if no float
			
			timeFormat:       hqWidgets.translate ("YYYY.MM.DD hh:mm:ss"), // Time format
            
            iconOn:           null,  // Button active image
            iconName:         null,  // Button inactive image
            title:            null,  // Tooltip
            room:             null,  // Room name
            isIgnoreEditMode: false, // Special state for Edit button (normally: not used)

            staticText:       null,  // Static text if gTypeText
            staticTextFont:   null,  // Font for static text
            staticTextColor:  null,  // Color for static text
            
            isShowPercent:    false, // Is show percent by window
            isContextMenu:    false, // If install edit context menu
            noBackground:     false, // If show background or just text or image
            usejQueryStyle:   false, // Use jQuery style for active/passive background
            showDescription:  false, // If show description of widget in normal (not edit) mode

            ipCamImageURL:    null,  // Url of image
            ipCamVideoURL:    null,  // Video Url
            ipCamUpdateSec:   30,    // Update interval in seconds
            isPopupEnabled:   true,  // Is popup enabled (e.g. by ipcam)
            
            popUpDelay:       5000,  // Dela for popup window, like camera, blinds
            ipCamVideoDelay:  1000,  // Video delay

            gongMelody:       null,  // Play melody if gong goes from Off to On
            gongActionBtn:    false, // Show on the gong dialog Bell button
            gongBtnText:      "Gong",// Text for button play gong

            ctrlActionBtn:    false, // Show action button on ip camera big window
            ctrlQuestion:     hqWidgets.translate("Open the door?"), // Text for the door bell question
            ctrlQuestionImg:  "DoorOpen.png", // Icon by question
            ctrlBtnText:      hqWidgets.translate("Open lock"), // Action button text for camera popup

            hoursLastAction:  -1,    // If the last action time must be shown (-1 - do not show, 0 -always show, x - not older as x hours, -2 show absolute time always, "-x" - show absolute time x hours
            stateTimeout:     600,   // 5 min state timeout
            showChanging:     true,  // Show changes as animation

            valueMin:         6,     // Min for inner temperature control
            valueMax:         30,    // Max for inner temperature control
            
            gaugeStart:       true,
            gaugeHorz:        false,
            gaugeColor:       'blue',

            hideValve:        false  // if the valve status must be shown
        };
        
        // Dynamical states (will not be stored)
        var dynStates = {
            // Dynamic variables (Will not be stored)
            infoText:      null,          // Dynamic text in the middle of the button
            state:         hqWidgets.gState.gStateUnknown, // Unknown, active, inactive
            handleState:   hqWidgets.gHandlePos.gPosClosed, // Set default position to closed
            lowBattery:    false,         // If show low battery icon or not
			lowBatteryDesc:null,          // ToolTip for battery icon
            strength:      null,          // If set, so the signal strength will be shown
            isStrengthShow:false,         // If show strength
            isRefresh:     false,         // Is refresh state
            isWorking:     false,         // Is working state
            percentState:  0,             // State of blind or dimmer in percent
            action:        null,          // On click action in form handler (object, ["state" | "pos"], state or position)
            store:         null,          // function on store settings handler (object, settings)
            valve:         null,          // valve status
            valueSet:      null,          // actual "must" temperature
            temperature:   null,          // actual "is" temperature
            humidity:      null,          // humidity in %
            bigPinned:     false,         // If big window pinned or not
            lastAction:    null,          // Since this time the element has actual status
			isVisible:     true,          // If widget visible
			hideHumidity:  false,         // if hide humidity by temperature
            infoWindow:  {
                isEnabled: false,
                width:     400,
                height:    300,
                x:         null,
                y:         null,
                onShow:    null,          // function (obj, jContent)
                onHide:    null,          // function (obj, jContent)
                onResize:  null,          // function (obj, jContent)
                hideDelay: 5000,
                title:     "Information", // window title
                pinShow:   false,
                showPinned: false,        // If show window pinned
                isMovable: true,
                isResizable: true ,               
                content:   ""             // Dynamic content of the window as html
            }
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
            _jright:      null,         // jQuery right panel for valueSet, valve or dimmer percent
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
			_jPercent:    null,         // jQuery container for _jPercentValue and small image
			_jPercentValue: null        // jQuery container for percent value (brightness fo motion)
        };
        
        if (advSettings !== undefined)
            this.advSettings = $.extend (advSettings, advOptions);
        this.settingsDefault = $.extend ({}, settings);
        this.settings = $.extend (settings, options);
            
        if (this.advSettings.elemName == null) {
            this.advSettings.elemName = ("elem" + (hqWidgets.gDynamics.gDivID++));
        }		
        this.dynStates = dynStates;
        this.intern    = intern;
        
        this.intern._element = document.getElementById (this.advSettings.elemName);
        // Create HTML container if not exists
        if (!this.intern._element) {
            var newdiv1 = $('<div id="'+this.advSettings.elemName+'"></div>');
            this.advSettings.parent.append (newdiv1);
            this.intern._element = document.getElementById (this.advSettings.elemName);
        }
        else {
            $(this.intern._element).empty();
        }
        
        this.intern._jelement = $('#'+this.advSettings.elemName);
        
        // ------- Functions ----------	
        // Check if the state do not go to unknown or update the last action time
        this._CreateInfoPopup = function (wndClass) {
            if (this.intern._jbigWindow) {
                this.intern._jbigWindow.remove ();
                this.intern._jbigWindow = null;
            }
            if (this.dynStates.infoWindow.isEnabled) {            
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
                if (wndClass !== undefined)
                    this.intern._jbigWindow.addClass (wndClass);
                
                var xx = this.dynStates.infoWindow.x;
                var yy = this.dynStates.infoWindow.y;
                var ww = this.dynStates.infoWindow.width;
                var hh = this.dynStates.infoWindow.height;
                if (ww == null) {
                    // Init first position
                    ww = this.intern._jbigWindow.width();
                    hh = this.intern._jbigWindow.height();
                }
                this.intern._jbigWindow.css ({width: ww, height: hh});
                if (xx == null) {
                    // Init first position
                    xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                    yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
					if (this.intern._jbigButtonUp) {
						if (yy - this.intern._jbigButtonUp.height () - 5 < 0) yy = this.intern._jbigButtonUp.height () + 5;
					} else {
						if (yy < 0) yy = 0;				
					}                
				}
                this.intern._jbigWindow.hide();
                this.intern._isBigVisible = false;
                this.intern._jbigWindow.css ({top: yy, left:xx});
                this.intern._jbigWindow.parent = this;
                this.intern._jbigWindow.OnClick = function () {
                    if (this.parent.intern._clickTimer) return;
                    this.parent.ShowBigWindow (false);
                }
                // Create inner context and button (Very dirty)
                var text = "<table style='width: 100%; height: 100%'><tr style='height: 33px'><td><div width='100%' id='"+this.advSettings.elemName+"_title' class='ui-widget ui-widget-header ui-corner-all ui-dialog-titlebar'>";
                // Add description
                text += "<table id='"+this.advSettings.elemName+"_hdr' width='100%' class='ui-widget-header'><tr><td width='93%'><span class='ui-dialog-title' style='padding: 1px 1px 1px 10px'  id='"+this.advSettings.elemName+"_bigTitle' ></span></td>";
                if (this.dynStates.infoWindow.pinShow)    
                    text += "<td style='text-align:right'><button id='"+this.advSettings.elemName+"_pin'></button></td>";
                text += "</tr></table></div></td></tr>";
                text += "<tr><td style='height: 100%; width:100%'><div style='height: 100%; width:100%' id='"+this.advSettings.elemName+"_bigContent'></div></td></tr>";
                if (this.dynStates.infoWindow.isShowButtons) {
                    text += "<tr style='height:40px'><td id='"+this.advSettings.elemName+"_btns' ></td></tr>";                    
                }
                text += "</table>";
                
                this.intern._jbigWindow.append (text);
                this.intern._jbigWindow.jbigWindowHdr     = $('#'+this.advSettings.elemName+"_hdr");
                this.intern._jbigWindow.jbigWindowBtns    = $('#'+this.advSettings.elemName+"_btns");
                this.intern._jbigWindow.jbigWindowTitle   = $('#'+this.advSettings.elemName+"_bigTitle");
                this.intern._jbigWindow.jbigWindowContent = $('#'+this.advSettings.elemName+"_bigContent");
                // Make header draggable
                if (this.dynStates.infoWindow.isMovable)
                    this.intern._jbigWindow.draggable ({handle: "div"});
                    
                if (this.dynStates.infoWindow.isResizable)
                    this.intern._jbigWindow.resizable ();
                
                // Setup pin button
                var pin = document.getElementById(this.advSettings.elemName+"_pin");
                if (pin) {
                    pin.parentQuery = this;
                    pin._onClick = function( event ) {
                        if (this.parentQuery.intern._clickTimer) {
                            return;
                        }
                        this.parentQuery.intern._clickTimer = _setTimeout(function (elem) {
                            clearTimeout(elem.intern._clickTimer);
                            elem.intern._clickTimer = null;
                        }, 500, this.parentQuery);

                        if (event) {
                            event.preventDefault();
                        }
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
                            this.parentQuery.intern._timerID = _setTimeout(function () {
                                if (hqWidgets.gDynamics.gShownBig) {
                                    hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);
                                    if (hqWidgets.gDynamics.gShownBig) {
                                        hqWidgets.gDynamics.gShownBig.intern._timerID = null;
                                    }
                                }
                                hqWidgets.gDynamics.gShownBig=null;
                            }, this.parentQuery.settings.popUpDelay);
                        }
                    };
                    $("#"+this.advSettings.elemName+"_pin")
                    .addClass('hq-ipcam-pin-btn')
                    .button({icons: {primary: (this.dynStates.bigPinned ? "ui-icon-pin-s" : "ui-icon-pin-w")}, text: false})
                    .click(pin._onClick);
                    
                    if (this.dynStates.infoWindow.showPinned) {
                        pin._onClick();
                    }
                }
                
                this.intern._jbigWindow.OnShow = function () {
                    if (this.parent.dynStates.infoWindow.onShow)
                        this.parent.dynStates.infoWindow.onShow (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
                }
                this.intern._jbigWindow.OnHide = function () {
                    this.parent.intern._jbigWindow.bind("resize", null, null);
					// Store position
                    var obj = this.parent;
                    var pos = obj.intern._jbigWindow.position ();
                    obj.dynStates.infoWindow.x      = pos.left;
                    obj.dynStates.infoWindow.y      = pos.top;
                    obj.dynStates.infoWindow.height = obj.intern._jbigWindow.height();
                    obj.dynStates.infoWindow.width  = obj.intern._jbigWindow.width();
                    obj.intern._jbigWindow.bheight  = obj.dynStates.infoWindow.height;
                    obj.intern._jbigWindow.bwidth   = obj.dynStates.infoWindow.width;
                    obj.intern._jbigWindow.x        = obj.dynStates.infoWindow.x;
                    obj.intern._jbigWindow.y        = obj.dynStates.infoWindow.y;
                    if (this.parent.dynStates.infoWindow.onHide)
                        this.parent.dynStates.infoWindow.onHide (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
                    if (this.parent.dynStates.infoWindow._onHide)
                        this.parent.dynStates.infoWindow._onHide (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
                }                    
            }   
        };    
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
                                         left:     (this.intern._jelement.width()/2 + 6 + ((this.settings.redius < 3) ? 5 : 0)), 
                                         height:   15, 
                                         'z-index':'2', 
                                         fontSize: 9, 
                                         color:    'black'}); // Set size
            this.intern._jrightText.addClass('hq-no-select').show();
            this.intern._jright.addClass('hq-no-select');
        };
        this._CreateRightMotionInfo = function () {
			if ((this.settings.hoursLastAction == -1) && !this.settings.isShowPercent) {
				if (this.intern._jright) {
					this.intern._jright.remove ();
					this.intern._jright.hide();
					this.intern._jright = undefined;
				}
				return;
			}
		
			if (!document.getElementById(this.advSettings.elemName+'_right')) {
				var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_right"></div>');
				this.advSettings.parent.append ($newdiv1);
			}
			this.intern._jright=$('#'+this.advSettings.elemName+"_right");
			this.intern._jright.html("");
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
			
			// Create last action 
            if (this.settings.hoursLastAction != -1) {
				if (!document.getElementById(this.advSettings.elemName+"_rightText"))
					this.intern._jright.prepend("<div id='"+this.advSettings.elemName+"_rightText'></div>");
					
				this.intern._jrightText=$('#'+this.advSettings.elemName+"_rightText");
				this.intern._jrightText.html("");
				this.intern._jrightText.css({position: 'absolute', 
											 left:     (this.intern._jelement.width()/2 + 8 + ((this.settings.redius < 3) ? 5 : 0)), 
											 height:   15, 
											 'z-index':'2', 
											 fontSize: 9, 
											 color:    'black'}); // Set size
				this.intern._jrightText.addClass('hq-no-select').show();
				this.intern._jright.addClass('hq-no-select');         
            }
			// Create last percent
			if (this.settings.isShowPercent) {
				if (!document.getElementById(this.advSettings.elemName+"_percent"))
					this.intern._jright.prepend("<div id='"+this.advSettings.elemName+"_percent'></div>");
					
				this.intern._jPercent     =$('#'+this.advSettings.elemName+"_percent");
				this.intern._jPercent.html("<table class='hq-no-space'><tr class='hq-no-space'><td class='hq-no-space'><img class='hq-no-space' src='" + hqWidgets.gOptions.gPictDir + "sun.png' /></td><td class='hq-no-space' stale='vertical-align:top' id='"+this.advSettings.elemName+"_percentValue'></td></tr></table>");
				this.intern._jPercentValue=$('#'+this.advSettings.elemName+"_percentValue");
				this.intern._jPercent.css({position: 'absolute', 
										   top:(this.settings.hoursLastAction != -1) ? this.settings.width/2 -11: (this.settings.width - 9) / 2,
										   left:this.settings.width/2+5,
										   height: 15, // Height of the image
										   'z-index':'2' 
										   }); // Set size
				this.intern._jPercentValue.css ( {fontSize:12, color:'black'});
				this.intern._jPercentValue.css("text-align", "left");
				this.intern._jPercent.css("text-align", "left");
			}
		},
        this._CreateRightTemp = function () {
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
									   left:this.settings.width/2 + 5, 
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
			// Generate action event, because the normal button is overloaded by temperature control
			/*if (!this.intern._isEditMode) {
				this.intern._jright.bind("click", {msg: this}, function (e) {
					var obj = e.data.msg;
					if (obj.intern._jbigWindow && obj.dynStates.infoWindow.isEnabled)
						obj.ShowBigWindow(true);
				});
			}       */             
		},
        this._DrawOneWindow = function (index, type, xoffset, width_, height_) {
            var name = this.intern._jelement.attr("id")+"_"+index;
            if (!this.intern._jelement.leaf) this.intern._jelement.leaf = [];
            this.intern._jelement.prepend("<div id='"+name+"_0' class='hq-blind-blind1'></div>");
            var wnd = {};
            wnd.ooffset = (Math.tan(10 * Math.PI/180) * width_)/2 + 2;
            wnd.width   = width_  - 9;
            wnd.height  = height_ - 9;
            wnd.owidth  = (wnd.width  * Math.cos(15 * Math.PI/180)) * 0.9;
            wnd.oheight = (wnd.height * Math.cos(15 * Math.PI/180)) * 0.9;
            wnd.divs = [];
            wnd.style = type;
            wnd.state = hqWidgets.gWindowState.gWindowClosed;
            wnd.handleState = hqWidgets.gHandlePos.gPosClosed;
            wnd.leafIndex  = 3;
            wnd.blindIndex = 2;
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
            if (type != hqWidgets.gSwingType.gSwingDeaf) {
                wnd.divs[3].append("<div id='"+name+"_4'></div>");
                wnd.divs[4] = $("#"+name+"_4");
                wnd.divs[4].addClass('hq-no-select hq-blind-handle-closed hq-blind-handle-bg');
                var h = wnd.divs[3].height();
                var w = wnd.divs[3].width();
                var size = (h > w) ? w : h;
                wnd.divs[4].css({height: size * 0.15});
                if (type == hqWidgets.gSwingType.gSwingLeft)
                    wnd.divs[4].css({left: wnd.divs[2].width() - wnd.divs[4].width(), top: wnd.divs[3].height() / 2});
                else if (type == hqWidgets.gSwingType.gSwingTop)
                    wnd.divs[4].css({left: (wnd.divs[2].width() - size * 0.15) / 2, top: 0});
                else // Right
                    wnd.divs[4].css({left: 0, top: wnd.divs[3].height() / 2});
            }
            
            this.intern._jelement.leaf[index] = wnd;
            
            wnd.divs[3].parentQuery=this;
            if (!this.intern._blinds) this.intern._blinds = [];
            this.intern._blinds[index] = wnd;
        };
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
        };
        this._PlayMelody = function () {
            if (this.settings.gongMelody) {
                //$('body').append('<embed id="sound_" autostart="true" hidden="true" src="' + ((this.settings.gongMelody.indexOf('/') == -1) ? hqWidgets.gOptions.gPictDir : "") + this.settings.gongMelody + '" />');
				if (!document.getElementById ('sound_')) {
					$('body').append('<audio id="sound_"  preload="auto" autobuffer></audio>');
				}
				
				var d = new Date ();
				$('#sound_').off('canplaythrough').on('canplaythrough', function() {   
					this.play ();
				});
				document.getElementById('sound_').src = ((this.settings.gongMelody.indexOf('/') == -1) ? hqWidgets.gOptions.gPictDir : "") + this.settings.gongMelody;
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
        this._SetInfoPopupTitle = function (newTitle) {
            if (newTitle === undefined) {
                newTitle = this.dynStates.infoWindow.title;
            }
            else {
                this.dynStates.infoWindow.title = newTitle;
            }
            this.intern._jbigWindow.jbigWindowTitle.html (newTitle);
        };
        this._SetInfoPopupContent = function (newContent) {
            if (newContent === undefined) {
                newContent = this.dynStates.infoWindow.content;
            }
            else {
                this.dynStates.infoWindow.content = newContent;
            }
            this.intern._jbigWindow.jbigWindowContent.html (newContent);
        };            
		this._SetType = function (buttonType) {
            if (this.settings.buttonType == buttonType && this.intern._inited)
                return;

            var width  = this.intern._jelement.width();
            var height = this.intern._jelement.height();

            // Delete old structures
            if (this.intern._currentClass !== undefined && this.intern._currentClass != "") 
                this.intern._jelement.removeClass (this.intern._currentClass);
                
            if (this.settings.buttonType !== undefined && this.intern._inited) {
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
                if (this.intern._jright) {
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
                this.intern._jgauge      = null;
                
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
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
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
            this.SetTitle(this.settings.room, this.settings.title);

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeLock    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeButton  ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeGong    ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeMotion) {
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
                        this.settings.isShowPercent = true;
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
                    this.intern._jtemp.css({position: 'absolute', left:0, height: 15, width: this.settings.width, 'z-index':'11', 'font-weight':'bold', color: this.settings.infoTextColor || 'black'}); // Set size
                    this.intern._jtemp.css({'font': this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif"});
                    var w = "0".dimensions (this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif");
                    this.intern._jtemp.css({top:this.settings.height / 2 - w.height});
                    this.intern._jtemp.css("text-align", "center").show();
                    this.intern._jhumid.css({position: 'absolute', top:this.settings.height/2+1, left:0, height: 15, width: this.settings.width, 'z-index':'11', 'font-weight':'normal', color:'darkblue'}); // Set size
                    this.intern._jhumid.css({font: this.settings.infoTextFont ? this.settings.infoTextFont.replace("bold", "") : "11px 'Tahoma', sans-serif"});
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
						
						// create info on the right side
						this._CreateRightTemp ();
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
                    this.dynStates.infoWindow.isEnabled = true;
                    this.intern._jbigWindow.hide();
                    this.intern._jbigWindow.addClass('hq-lock-big');
                    this.intern._jbigWindow.addClass('hq-no-select');		
                    var xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                    var yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                    if (xx < 0) xx = 0;
					if (this.intern._jbigButtonUp) {
						if (yy - this.intern._jbigButtonUp.height () - 5 < 0) yy = this.intern._jbigButtonUp.height () + 5;
					} else {
						if (yy < 0) yy = 0;				
					}                    
					this.intern._jbigWindow.css ({top: yy, left:xx});
                    this.intern._jbigWindow.buttons = [];
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
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive); 
                }
				else
				if (this.settings.buttonType == hqWidgets.gButtonType.gTypeMotion) {
					this._CreateRightMotionInfo ();
				}
            }
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                // Colors of the states
                this._SetUsejQueryStyle (this.settings.usejQueryStyle);
                this.settings.radius = 0;
                this.intern._jelement.addClass ('hq-blind-base');
                this.intern._jelement.css ({borderRadius: 0});
                this._SetWindowType (this.settings.windowConfig);
                this.SetSize (this.settings.width, this.settings.height, true);
                
                if (!document.getElementById(this.advSettings.elemName+'_big')) {
                    var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_big"></div>');
                    this.advSettings.parent.append ($newdiv1);
                }
                if (!document.getElementById(this.advSettings.elemName+'_bigUp')) {
                    var $newdiv1 = $('<div id="'+this.advSettings.elemName+'_bigUp" class="hq-blind-big-button"><div class="hq-blind-big-button-img"><img src="' + hqWidgets.gOptions.gPictDir + 'inject-bottom.png" /></div></div>');
                    this.advSettings.parent.append ($newdiv1);
					$newdiv1 = $('<div id="'+this.advSettings.elemName+'_bigDown" class="hq-blind-big-button"><div class="hq-blind-big-button-img"><img src="' + hqWidgets.gOptions.gPictDir + 'inject-top.png" /></div></div>');
                    this.advSettings.parent.append ($newdiv1);
                }
				
                var big     = document.getElementById (this.advSettings.elemName+"_big");
                big.parentQuery     = this;
				
                this.intern._jbigWindow=$(big);
                this.dynStates.infoWindow.isEnabled = true;
                this.intern._jbigWindow.addClass('hq-blind-big');
                this.intern._jbigWindow.addClass('hq-no-select');
                this.intern._jbigWindow.bheight = this.intern._jbigWindow.height();  // Size of the big window
				
                if (!document.getElementById(this.advSettings.elemName+'_bigBlind')) {
                    this.intern._jbigWindow.prepend('<div id="'+this.advSettings.elemName+'_bigBlind"></div>');
				}
                var big1    = document.getElementById (this.advSettings.elemName+"_bigBlind");
                big1.parentQuery    = this;
                var bigUp   = document.getElementById (this.advSettings.elemName+"_bigUp");
                var bigDown = document.getElementById (this.advSettings.elemName+"_bigDown");
                bigUp.parentQuery   = this;
                bigDown.parentQuery = this;
               				
                this.intern._jbigBlind1 = $(big1);
                this.intern._jbigBlind1.addClass('hq-blind-big-blind');
                this.intern._jbigBlind1.addClass('hq-no-select');
                this.intern._jbigBlind1.css({height: 0});
                this.intern._jbigWindow.parent = this;

				this.intern._jbigButtonUp = $(bigUp);
				this.intern._jbigButtonDown = $(bigDown);
				
                var xx = this.settings.x + (this.settings.width  - this.intern._jbigWindow.width())/2;
                var yy = this.settings.y + (this.settings.height - this.intern._jbigWindow.height())/2;
                if (xx < 0) xx = 0;
				if (this.intern._jbigButtonUp) {
					if (yy - this.intern._jbigButtonUp.height () - 5 < 0) yy = this.intern._jbigButtonUp.height () + 5;
				} else {
					if (yy < 0) yy = 0;				
				}
                this.intern._jbigWindow.hide();
                this.intern._jbigWindow.css ({top: yy, left:xx});
				
				this.intern._jbigButtonUp.css ({top: yy - this.intern._jbigButtonUp.height() - 6, left:xx});
				this.intern._jbigButtonDown.css ({top: yy + this.intern._jbigWindow.height() + 10, left:xx});
				this.intern._jbigButtonDown.hide();
				this.intern._jbigButtonUp.hide();
				
                // Handlers
                this.intern._jbigWindow.OnMouseMove = function (x_, y_) {
                    this.SetPositionOffset(y_ - this.parent.intern._cursorY);
                }
                
                this.intern._jbigWindow.mouseDown = function (element, y_) {
                    //var y_ = event.pageY;
                    hqWidgets.gDynamics.gActiveBig = element;
                    hqWidgets.gDynamics.gActiveBig.intern._cursorY = y_;
                    var yOffset = y_ - hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.position().top;
                    hqWidgets.gDynamics.gActiveBig.intern._percentStateSet = hqWidgets.gDynamics.gActiveBig.dynStates.percentState;
                    hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.startPosOffset = 100 / hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.bheight * yOffset;
                    hqWidgets.gDynamics.gActiveBig.intern._jbigWindow.SetPositionOffset (0);
                }

                big.addEventListener('touchstart', function(event) {
                    hqWidgets.gDynamics.gIsTouch=true;
                    event.target.parentQuery.intern._jbigWindow.mouseDown (event.target.parentQuery, event.touches[0].pageY);
                }, false);
                this.intern._jbigWindow.SetPositionOffset = function (newPosOffset) {
                    if (this.parent.intern._timerID) {
                        clearTimeout (this.parent.intern._timerID);
                        this.parent.intern._timerID = null;
                    }				
                    newPosOffset = this.startPosOffset + newPosOffset * 100 / this.bheight;
                    this.parent.intern._percentStateSet = Math.floor (newPosOffset);
                    if (this.parent.intern._percentStateSet < 0)    this.parent.intern._percentStateSet = 0;
                    if (this.parent.intern._percentStateSet > 100)  this.parent.intern._percentStateSet = 100;
                    this.parent.intern._jbigBlind1.css({height:this.bheight * this.parent.intern._percentStateSet / 100});
                    if (this.parent.settings.isShowPercent && this.parent.intern._jbigWindow && this.parent.intern._jbigWindow.jtext) {
                        this.parent.intern._jbigWindow.jtext.html(this.parent.intern._percentStateSet+"%");
					}
                };
                if (this.settings.isShowPercent) {
                    this._CreateRightInfo ();
                    
                    if (!document.getElementById(this.advSettings.elemName+'_bigBlindText'))
                        this.intern._jbigWindow.append('<div id="'+this.advSettings.elemName+'_bigBlindText"></div>');
                    this.intern._jbigWindow.jtext = $('#'+this.advSettings.elemName+'_bigBlindText');
                    this.intern._jbigWindow.jtext.addClass('ui-widget').css({position: 'absolute'});
                    this.intern._jbigWindow.jtext.parentQuery = this;
                }            
				
				this.intern._jbigButtonUp.bind ("click", {msg: this}, function (e) {
                    this.parentQuery.intern._percentStateSet = 0;
                    this.parentQuery.intern._jbigBlind1.css({height: 0});
					this.parentQuery.SendPercent ();
					this.parentQuery.ShowBigWindow(false);
					hqWidgets.gDynamics.gActiveBig=null;		
				});
				this.intern._jbigButtonDown.bind ("click", {msg: this}, function (e) {
                    this.parentQuery.intern._percentStateSet = 100;
                    this.parentQuery.intern._jbigBlind1.css({height: this.parentQuery.intern._jbigWindow.bheight});
					this.parentQuery.SendPercent ();
					this.parentQuery.ShowBigWindow(false);
					hqWidgets.gDynamics.gActiveBig=null;		
				});
				
				this.intern._jbigWindow.OnShow  = function () {
					if (this.parent.intern._jbigButtonUp) {
						this.parent.intern._jbigButtonUp.show ();
					}
					if (this.parent.intern._jbigButtonDown) {
						this.parent.intern._jbigButtonDown.show ();
					}
					this.parent.intern._jbigWindow.bind ("mousedown", {msg: this.parent}, function (event) {
						event.target.parentQuery.intern._jbigWindow.mouseDown (event.target.parentQuery, event.pageY);
					});
				};
				this.intern._jbigWindow.OnHide  = function () {
					this.parent.intern._jbigWindow.unbind ("mousedown");
					if (this.parent.intern._jbigButtonUp) {
						this.parent.intern._jbigButtonUp.hide ();
					}
					if (this.parent.intern._jbigButtonDown) {
						this.parent.intern._jbigButtonDown.hide ();
					}
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
                            var options = {};
                            options.zindex = 0;
                            elem.SetSettings (options);
                        }});
                    this.intern._contextMenu.Add({text:"Bring to front", action:function(elem) {
                            var options = {};
                            options.zindex = GetMaxZindex () + 1;
                            elem.SetSettings (options);
                        }});
                }
                if (width == 0 || height == 0) {
                    this.intern._jelement.css({width: 'auto', height: 'auto'});
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
            else
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                this.intern._jelement.append ("<div id='"+this.advSettings.elemName+"_gauge'></div>");
                this.intern._jgauge       = $('#'+this.advSettings.elemName+"_gauge");
                this.intern._jgauge.css ({borderRadius: (this.settings.radius > 4) ? 4: this.settings.radius, position: 'absolute', 'border': '1px solid black'});
                this.SetInfoText (this.dynStates.valueSet, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive); 
            }      
            // no else here !!!
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeCam ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {

                // Create bigger image
                this._CreateBigCam = function () {
                    this.dynStates.infoWindow.isEnabled     = true;
                    this.dynStates.infoWindow.isMovable     = true;
                    this.dynStates.infoWindow.isResizable   = true;
                    this.dynStates.infoWindow.pinShow       = true;                    
                    this.dynStates.infoWindow.onShow        = function (elem, jBigWindow) {
                        elem.intern._jbigWindow.trigger("resize");
                        if (elem.settings["ipCamVideoURL"] != null && elem.settings["ipCamVideoURL"] != "") {
                            // activate video
                            //http://192.168.1.8/videostream.cgi?user=xxx&pwd=xxx
                            // Show last loaded image
                            if (elem.intern._jbigWindow.jbigImage) {
							
                                elem.intern._jbigWindow.jbigImage.attr ('src', elem.settings["ipCamVideoURL"]);
								
                                elem.intern._jbigWindow.bind("resize", {msg: elem}, function (e)	{
                                    var big = e.data.msg.intern._jbigWindow;
                                    big.jbigImage.height(big.height() - big.jbigWindowHdr.height() - 15 - ((big.jbigWindowBtns) ? big.jbigWindowBtns.height(): 0) );
                                });
                                elem.intern._jbigWindow.trigger("resize");
                            }
                        }
                        else {
                            // Show last loaded image
                            if (elem.intern._jbigWindow.jbigImage) {
                                elem.intern._jbigWindow.jbigImage.load(function () {
                                    if (this.parentQuery.intern._isBigVisible) {
                                        var d = new Date();
                                        // update images as fast as possible
                                        if (this.parentQuery.settings.ipCamVideoDelay) {
                                            this.parentQuery.intern._ipCamBigTimer = _setTimeout(function (elem) {
                                                elem._UpdateBigCam ();                                    
                                            }, this.parentQuery.settings.ipCamVideoDelay, this.parentQuery);
                                        }
                                        else 
                                            this.parentQuery._UpdateBigCam (); 
                                    }                                        
                                });
                                elem._UpdateBigCam ();
                                elem.intern._jbigWindow.bind("resize", {msg: elem}, function (e)	{
                                    var big = e.data.msg.intern._jbigWindow;
                                    big.jbigImage.height(big.height() - big.jbigWindowHdr.height() - 15 - ((big.jbigWindowBtns) ? big.jbigWindowBtns.height(): 0) );
                                });
                                elem.intern._jbigWindow.trigger("resize");
                            }
                        }
                    }
                    this.dynStates.infoWindow._onHide = function (elem) {
                        if (elem.intern._jbigWindow.jbigImage) {
                            elem.intern._jbigWindow.bind("resize", null, null);
                            // Stop update of the images
                            clearTimeout(elem.intern._ipCamBigTimer);
                            elem.intern._ipCamBigTimer = null;
                            elem.intern._jbigWindow.jbigImage.load(null);
							elem.intern._jbigWindow.jbigImage.attr ('src', "");
                        }
                    }
                    
                    var isShowButtons = (this.settings.ctrlActionBtn || this.settings.gongActionBtn); // && (this.dynStates.action != null)
                    this.dynStates.infoWindow.isShowButtons = isShowButtons;
                    
                    if (!isShowButtons)
                        this._CreateInfoPopup ('hq-ipcam-big');
                    else
                        this._CreateInfoPopup ('hq-ipcam-big-with-action');
                        
                    // Create inner image and buttons (Very dirty)
                    this._SetInfoPopupTitle (((this.settings.buttonType == hqWidgets.gButtonType.gTypeCam) ? (this.settings.title || hqWidgets.translate ("IP Camera")) : this.settings.ctrlQuestion));
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeInfo) {
                        this._SetInfoPopupContent ("<img style='height: 100%; width:100%' id='"+this.advSettings.elemName+"_bigImage' />");
                    }

                    if (isShowButtons) {
                        //text += "<tr id='"+this.advSettings.elemName+"_btns' style='height:40px'>"
                        var text = "<table style='width:100%'><tr><td style='width: 93%'></td>";
                        if (this.settings.gongActionBtn)
                            text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigGong' style='width:8em'>"+this.settings.gongBtnText+"</button></td>";
                        if (this.settings.ctrlActionBtn)
                            text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigButton' style='width:8em'>"+this.settings.ctrlBtnText+"</button></td>";
                        
                        text += "</tr></table>";
                        this.intern._jbigWindow.jbigWindowBtns.append (text);
                    }

                    this.intern._jbigWindow.jbigImage = $('#'+this.advSettings.elemName+"_bigImage");
                    this.intern._jbigWindow.jbigImage.bind("click", {msg: this.intern._jbigWindow}, function (e) {
                        e.data.msg.OnClick ();
                    });                    
                    this.intern._jbigWindow.jbigImage.parent = this;
                    document.getElementById(this.advSettings.elemName+'_bigImage').parentQuery = this;
                    this.intern._jbigWindow.jbigImage.bind("click", {msg: this.intern._jbigWindow}, function (e)	{
                        e.data.msg.OnClick ();
                    });  

                    // Setup action button
                    if (this.settings.ctrlActionBtn && isShowButtons) {
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
                } // end of Create bigger image
                    
                // if url exists
                if (this.settings.ipCamImageURL != null && this.settings.ipCamImageURL != "" && this.settings.isPopupEnabled) {
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
                            event.target.parentQuery.SetStates ({'isWorking': false/*, state: hqWidgets.gState.gStateOff*/});
                        });
                        // Start slow update process
                        this.intern._iuCamUpdateTimer = _setTimeout(function (elem) { elem._UpdateSmallCam (); }, 2000, this);
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
            
            if (this.settings.styleNormal != null)
                this.intern._jelement.removeClass (this.settings.styleNormal);
            if (this.settings.styleNormalHover != null)
                this.intern._jelement.removeClass (this.settings.styleNormalHover);
            if (this.settings.styleActive != null)
                this.intern._jelement.removeClass (this.settings.styleActive);
            if (this.settings.styleActiveHover != null)
                this.intern._jelement.removeClass (this.settings.styleActiveHover);
                
            this.intern._currentClass = ""; // force update
            if (isUse) {
                // Colors of the states
                if (!this.settings.noBackground) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        this.intern._backOff        = "ui-state-default";
                        this.intern._backOffHover   = "ui-state-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
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
                    else {
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
                        this.intern._backOff        = (this.settings.styleNormal) ? this.settings.styleNormal : "hq-button-base-intemp";
                        this.intern._backOffHover   = (this.settings.styleNormalHover) ? this.settings.styleNormalHover : "hq-button-base-intemp-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp)
                    {
                        this.intern._backOff        = (this.settings.styleNormal) ? this.settings.styleNormal : "hq-button-base-outtemp";
                        this.intern._backOffHover   = (this.settings.styleNormalHover) ? this.settings.styleNormalHover : "hq-button-base-outtemp-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {	
                        this.intern._backOff        = (this.settings.styleNormal) ? this.settings.styleNormal : "hq-blind-base";
                        this.intern._backOffHover   = (this.settings.styleNormalHover) ? this.settings.styleNormalHover : "hq-blind-base";
                        this.intern._backMoving     = "hq-blind-blind3-moving";
                    }
                    else
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage) {
                        this.intern._backOff="";  
                    } 
                    else
                    {
                        this.intern._backOff        = (this.settings.styleNormal) ? this.settings.styleNormal : "hq-button-base-normal";
                        this.intern._backOffHover   = (this.settings.styleNormalHover) ? this.settings.styleNormalHover : "hq-button-base-normal-hover";
                        this.intern._backMoving     = "hq-button-base-moving";
                    }                
                    this.intern._backOn         = (this.settings.styleActive) ? this.settings.styleActive : "hq-button-base-on";
                    this.intern._backOnHover    = (this.settings.styleActiveHover) ? this.settings.styleActiveHover : "hq-button-base-on-hover";
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
            
            var iCount = (type4 !== undefined && type4 != null) ? 4 : ((type3 !== undefined && type3 != null) ? 3 : ((type2 !== undefined && type2 != null) ? 2 : 1));
                
            // Clear all 
            if (this.intern._blinds !== undefined && this.intern._blinds != null)
            {
                for (var i = 0; i < this.intern._blinds.length; i++)
                    this.intern._blinds[i].divs[0].remove ();
            }
            this.intern._blinds = null;

            if (iCount >= 1) this._DrawOneWindow (0, type1, 0,                                          this.intern._jelement.width() / iCount, this.intern._jelement.height());
            if (iCount >= 2) this._DrawOneWindow (1, type2, this.intern._jelement.width() / iCount,     this.intern._jelement.width() / iCount, this.intern._jelement.height());
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
            if (this.settings.showChanging && this.dynStates.isVisible) {
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
                pState = (isForSet) ? this.intern._percentStateSet : Math.round ((this.dynStates.valueSet - this.settings.valueMin) / (this.settings.valueMax - this.settings.valueMin) * 100, 1);
        
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer)
                this._ShowRightInfo (pState + "%");
            else { 
                if (isForSet) {
                    this.intern._jtemp.hide ();
                    this.intern._jhumid.hide ();
                    this.intern._jsetTemp.show ();
                    var temp = Math.round (((this.settings.valueMax - this.settings.valueMin) * pState / 100 + this.settings.valueMin) * 2) / 2;
                    this.intern._jsetTemp.html (hqWidgets.TempFormat (temp) + '&deg;');
                }
                else {
                    if (this.intern._jtemp) {
                        this.intern._jtemp.show ();
                        if (!this.dynStates.hideHumidity) this.intern._jhumid.show ();
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
        this._ShowGauge = function () {
            var pState = Math.round((this.dynStates.valueSet - this.settings.valueMin) / (this.settings.valueMax - this.settings.valueMin) * 100);
            if (pState < 0)   pState = 0;
            if (pState > 100) pState = 100;
            this.intern._jgauge.css({background: this.settings.gaugeColor});
            if (this.settings.gaugeHorz) {
                this.intern._jgauge.css ({height: this.settings.height-2, width: this.settings.width * pState / 100});
                if (this.settings.gaugeStart)
                    this.intern._jgauge.css ({left: 0, top: 0});
                else
                    this.intern._jgauge.css ({top:0, left: this.settings.width - this.settings.width * pState / 100});
                    
            }
            else {
                this.intern._jgauge.css ({width: this.settings.width - 2, height: this.settings.height * pState / 100});
                if (this.settings.gaugeStart)
                    this.intern._jgauge.css ({top: 0, left: 0});
                else
                    this.intern._jgauge.css ({left:0, top: this.settings.height - this.settings.height * pState / 100});
            }
            
            this.SetInfoText (this.dynStates.valueSet, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive); 
            this.SetPercent (pState);
        }
        this._ShowLastActionTime = function () {
            if (this.intern._jrightText && (this.settings.hoursLastAction != -1)) {
                if (this.dynStates.lastAction != null) {
                    // Show absolute time
                    if (this.settings.hoursLastAction < 0) {
                        if (this.settings.hoursLastAction == -2) {
							if (this.dynStates.isVisible){
								this.intern._jright.show ();
							}
                            this._ShowRightInfo (hqWidgets.TimeToString(this.dynStates.lastAction, this.settings.timeFormat));
                        }
                        else {
                            // Check the interval
                            var seconds = ((new Date()).getTime () -  this.dynStates.lastAction.getTime()) / 1000;
                            if (seconds / 3600 <= ((-1) * this.settings.hoursLastAction)) {
                                this._ShowRightInfo (hqWidgets.TimeToString(this.dynStates.lastAction, this.settings.timeFormat));
                            }
                            else
                                this._ShowRightInfo (null);
                        }
                    }
                    else {
                        // Check the interval
                        var seconds = ((new Date()).getTime () -  this.dynStates.lastAction.getTime()) / 1000;
                        if (!this.settings.hoursLastAction || seconds / 3600 <= this.settings.hoursLastAction) {
                            this._ShowRightInfo (hqWidgets.GetTimeInterval(this.dynStates.lastAction));
                        }
                        else 
                            this._ShowRightInfo (null);
                    }
                
                }
                else
                    this._ShowRightInfo (null);            
            }
            else 
            if (this.intern._jrightText && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDimmer &&
                this.settings.buttonType != hqWidgets.gButtonType.gTypeInTemp &&
                this.settings.buttonType != hqWidgets.gButtonType.gTypeGauge &&
                this.settings.buttonType != hqWidgets.gButtonType.gTypeMotion)
                this.intern._jright.hide ();            
        }
        this._ShowRightInfo = function (newText, newPercent) {
            if (this.intern._jright && (this.intern._jrightText || this.intern._jPercentValue)) {
			
                if (newText == undefined && this.intern._jrightText) 
                    newText = this.intern._jrightText.html();
					
                if (newPercent == undefined && this.intern._jPercent) 
                    newPercent = this.intern._jPercentValue.html();
					
                // Calculate new width
                if ((newText == "" || newText == null) && (newPercent == "" || newPercent == null))
                    this.intern._jright.hide ();
                else {
                    var w1 = (newText)    ? newText.width('9px "Tahoma", sans-serif') : 0;
                    var w2 = (newPercent) ? newPercent.width('12px "Tahoma", sans-serif') + 16: 0;
					var w  = (w1 > w2) ? w1 : w2;
					if (this.intern._jPercent) {
						if (newPercent == "" || newPercent == null)
							this.intern._jPercent.hide ();
						else if(this.dynStates.isVisible) {
							this.intern._jPercent.show ();
						}
					}
					
                    if (w) {
						if(this.dynStates.isVisible) {
							this.intern._jright.stop().show ();
						}
						if (this.intern._jrightText) {
							this.intern._jrightText.css({left: (this.intern._jelement.width()/2 + 8 + ((this.settings.radius < 3) ? 8 : 0))});
							this.intern._jrightText.html(newText);
						}
						if (this.intern._jPercent) {
							this.intern._jPercent.css({left: (this.intern._jelement.width()/2 + 6 + ((this.settings.radius < 3) ? 8 : 0))});
							this.intern._jPercentValue.html(newPercent);
						}
						this.intern._jright.css({left:this.settings.x+this.settings.width/2, height: 30, width: this.settings.width / 2 + 7 + ((this.settings.radius < 3) ? 8 : 0) + w*1.2}); // Set size
					}
                }
				
				// Set the height
				var isTextVisible = false;
				var isPercentVisible = false;
				
                if (this.intern._jrightText && this.intern._jrightText.html() != "") {
					if (this.intern._jPercent && this.intern._jPercentValue.html() != "") {
						isTextVisible = true;
						isPercentVisible = true;
						this.intern._jrightText.css({top: 15});
						this.intern._jPercent.css({top: 3});
					}
					else {
						isTextVisible = true;
						this.intern._jrightText.css({top: (this.intern._jright.height() - this.intern._jrightText.height()) / 2 +3});
					}
                }
				else 
				if (this.intern._jPercent && this.intern._jPercentValue.html() != "") {
					isPercentVisible = true;
					// Workaround because the image loaded later and change the height of the _jPercent
					//this.intern._jPercent.css({top: (this.intern._jright.height() - this.intern._jPercent.height()) / 2});
					this.intern._jPercent.css({top: (this.intern._jright.height() - 15) / 2});
				}
				if (!isPercentVisible && !isTextVisible) 
					this.intern._jright.hide();
				else if (this.dynStates.isVisible) {
					this.intern._jright.show();
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
            
            if (this.intern._ipCamImageURL == null && this.settings.ipCamImageURL) {
                this.intern._ipCamImageURL = this.settings.ipCamImageURL + ((this.settings.ipCamImageURL.indexOf ('?') > 0) ? '&' : '?');
            }
            if (!this.intern._jcenter && this.intern._ipCamImageURL) {
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
                this.SetStates ({'isWorking': true, "state": hqWidgets.gState.gStateOff});
                this.intern._ipCamLastImage = this.intern._ipCamImageURL + d.getTime();
                //$('#status').append("update" + this.intern._ipCamLastImage + "<br>");
                this.intern._jcenter.attr('src', this.intern._ipCamLastImage);
                // Update big image too
                if (this.intern._jbigWindow && this.intern._isBigVisible)
                    this.intern._jbigWindow.jbigImage.attr('src', this.intern._ipCamLastImage);
                    
                this.intern._iuCamUpdateTimer = _setTimeout(function (obj) {
                    obj._UpdateSmallCam();
                }, this.settings.ipCamUpdateSec * 1000, this);
            }
        }
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
                // Deactivate this code, while only temperature sensors send theirs information continually
                /*
                if (this.dynStates.state != hqWidgets.gState.gStateUnknown && 
                    this.intern._lastUpdate != null && 
                    this.settings.stateTimeout > 0) {
                    if (dt == undefined)
                        dt = new Date ();
                    var seconds = (dt.getTime() - this.intern._lastUpdate.getTime()) / 1000;
                    if (seconds > this.settings.stateTimeout)
                        this.SetState (hqWidgets.gState.gStateUnknown);
                }*/
            }
        }
        this.GetAdvSettings = function () {
            var advOptions = {};
            advOptions.parent   = this.advSettings.parent;
            advOptions.elemName = this.advSettings.elemName;
            return advOptions;
        }
        this.GetStates = function () {
            var dynOptions = hqWidgets.Clone (this.dynStates);
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                dynOptions.windowState = "";
                dynOptions.handleState = "";
                var index = 0;
                while (this.intern._blinds[index]) {
                    dynOptions.windowState = ((options.windowState == "") ? "" : ",") + this.intern._blinds[index].state;
                    dynOptions.handleState = ((options.handleState == "") ? "" : ",") + this.intern._blinds[index].handleState;
                    index++;
                }
            }
            
            return dynOptions;
        }
        // Get all options as one parameter
        this.GetSettings = function (isAllOrOneName, ignoreDefault) {
            var options = {};

            if (isAllOrOneName !== undefined && isAllOrOneName !== true && isAllOrOneName !== false)
                return this.settings[isAllOrOneName];
            
            for(var propertyName in this.settings) {
                if (propertyName[0] == '_')
                    continue;
                if ((isAllOrOneName === undefined || isAllOrOneName === false) && this.settings[propertyName] === null)
                    continue;
                
                if (ignoreDefault !== undefined && ignoreDefault == true && this.settings[propertyName] == this.settingsDefault[propertyName])
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
            if (options.iconName) 
                options.iconName = (options.iconName.substring(0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? options.iconName.substring(hqWidgets.gOptions.gPictDir.length) : options.iconName;
            
            if (options.iconOn)   
                options.iconOn   = (options.iconOn.substring  (0, hqWidgets.gOptions.gPictDir.length) == hqWidgets.gOptions.gPictDir) ? options.iconOn.substring  (hqWidgets.gOptions.gPictDir.length) : options.iconOn;
            return options;
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
					if (this.intern._jbigButtonUp) {
						if (yy - this.intern._jbigButtonUp.height () - 5 < 0) yy = this.intern._jbigButtonUp.height () + 5;
					} else {
						if (yy < 0) yy = 0;				
					}
					this.intern._jbigWindow.css ({top: yy, left:xx});	
                }
                
                if (this.intern._jdoor)
                    this.intern._jdoor.css ({width: '100%'/*this.settings.width*/, height: '100%'/*this.settings.height*/});	
                    
                if (this.intern._jdoorHandle) {
                    this.intern._jdoorHandle.css ({top: (this.settings.height - this.intern._jdoorHandle.height()) / 2});
                    this.ShowDoorState (true);
                    /*
                    if (this.settings.doorType == hqWidgets.gSwingType.gSwingLeft)
                        this.jdoorHandle.css ({left: ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0) + 5});
                    else
                        this.jdoorHandle.css ({left: (this.intern._jelement.width() - this.jdoorHandle.width() - 5) - ((this.dynStates.state == hqWidgets.gState.gStateOn) ? this.intern._jelement.width() * 0.2 : 0)});
                        */
                }
                
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                    this._SetWindowType (this._GetWindowType ());
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                    this.ShowBlindState();
                }
                else
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                    this._ShowGauge ();
                }
                    
                if (this.intern._jinfoText) {
					this.intern._jinfoText.css({top: (this.settings.height - this.intern._jinfoText.height()) / 2, left: (this.settings.width - this.intern._jinfoText.width()) / 2 });
                }
				
                if (this.intern._jtemp) {
                    this.intern._jtemp.css({'font': this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif"});
                    var w = "0".dimensions (this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif");
                    this.intern._jtemp.css({top:this.settings.height / 2 - w.height, width: this.settings.width}); // Set size
                }
                
                if (this.intern._jhumid)
                    this.intern._jhumid.css({top:this.settings.height / 2 + 1, width: this.settings.width}); // Set size
                
                if (this.intern._jright) {
                    if (this.intern._jrightText)
                        this._ShowRightInfo ();
                    else
                        this.intern._jright.css({left:this.settings.x+this.settings.width/2, width: hqWidgets.gOptions.gBtWidth*0.8 + this.settings.width/2}); // Set size

					if (this.intern._jvalve)   this.intern._jvalve.css  ({left:this.settings.width/2+5}); // Set size
                    if (this.intern._jsettemp) this.intern._jsettemp.css({left:this.settings.width/2+1}); // Set size
                }
                                
                if (this.intern._jcircle) {
                    this.intern._jcircle.css({left:   this.settings.x - this.settings.dimmerThick, 
                                                top:    this.settings.y - this.settings.dimmerThick/*,
                                                width:  this.settings.width  + this.settings.dimmerThick*2,
                                                height: this.settings.height + this.settings.dimmerThick*2*/
                                                }); // Set size
                }
                
                if (this.intern._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeCam) {
                    this.intern._jcenter.css({left:   (this.settings.width  - this.settings.btIconWidth) / 2, 
                                              top:    (this.settings.height - this.settings.btIconHeight) / 2
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
            if (iconName_) {
                this.settings.iconOn = ((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_;
				if (!document.getElementById(this.advSettings.elemName+"_center")) {
                    this.intern._jelement.prepend("<img id='"+this.advSettings.elemName+"_center'></img>");
					this.intern._jcenter = $('#'+this.advSettings.elemName + '_center');
                    this.intern._jcenter.css({position: 'absolute', 
                                                top:      ((this.intern._jelement.height()- this.settings.btIconHeight)/2), 
                                                left:     ((this.intern._jelement.width() - this.settings.btIconWidth) /2), 
                                                'z-index':'10', 
                                                width:     this.settings.btIconWidth, 
                                                height:    this.settings.btIconHeight});
					if (this.settings.iconName) {
						if (this.dynStates.state == hqWidgets.gState.gStateOff) {
							this.intern._jcenter.attr('src', this.settings.iconName);
							this.intern._jcenter.show();
						}
					} else
					{
						if (this.dynStates.state != hqWidgets.gState.gStateOn) {
							this.intern._jcenter.hide();
						}
					}
				}
				
                if (this.dynStates.state == hqWidgets.gState.gStateOn) {
					this.intern._jcenter.attr('src', this.settings.iconOn);
					this.intern._jcenter.show();
                }
                this.intern._jcenter.addClass('hq-no-select');
            }
            else {
                this.settings.iconOn = null;
                if (this.settings.iconName && this.intern._jcenter) {
                    this.intern._jcenter.attr('src', this.settings.iconName);
                }
            }
        }	
        // Set icon in Off state
        this.SetIcon = function (iconName_)	{
            // Icon in the middle of the button
            this.settings.iconName = (iconName_ != null && iconName_ != "") ? (((iconName_.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName_) : null;
        
            if (this.settings.iconName) {
                if (!document.getElementById(this.advSettings.elemName+"_center")) {
                    this.intern._jelement.prepend("<img id='"+this.advSettings.elemName+"_center' src='"+this.settings.iconName+"'></img>");
					this.intern._jcenter = $('#'+this.advSettings.elemName + '_center');
				}

                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                    this.intern._jcenter.css({position: 'absolute', 
                                                top:      ((this.intern._jelement.height()- this.settings.btIconHeight)/2), 
                                                left:     ((this.intern._jelement.width() - this.settings.btIconWidth) /2), 
                                                'z-index':'10', 
                                                width:     this.settings.btIconWidth, 
                                                height:    this.settings.btIconHeight});
                }
                else {
                
                    this.intern._jelement.css({width:'auto', height: 'auto'});
                    if (this.settings.width)
                        this.intern._jcenter.css({width:this.settings.width});
                    else
                        this.intern._jcenter.css({width:'auto'});

                    if (this.settings.height) 
                        this.intern._jcenter.css({height:this.settings.height});
                    else
                        this.intern._jcenter.css({height:'auto'});
                }
                if (this.dynStates.state == hqWidgets.gState.gStateOff || !this.settings.iconOn) {
                    if (this.settings.iconName != null) {
                        this.intern._jcenter.attr('src', this.settings.iconName);
						this.intern._jcenter.show();
                    }
                }
                    
                this.intern._jcenter.addClass('hq-no-select');
                
            }
            else {
                if (this.intern._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeCam) {
                    this.intern._jcenter.hide();
                    this.intern._jcenter.html("");
                }
            }
        }	
        this.SetInfoText = function (text, textFont, textColor, activeTextColor) {
            if (this.settings.buttonType != hqWidgets.gButtonType.gTypeInfo &&
                this.settings.buttonType != hqWidgets.gButtonType.gTypeGauge) 
                return;
            if (text      === undefined || text      === null) text      = null;
            if (textFont  ==  undefined || textFont  ==  null || textFont ==  "") textFont  = '20px "Tahoma", sans-serif';
            if (textColor ==  undefined || textColor ==  null || textColor==  "") textColor = "white"; 
            if (activeTextColor ==  undefined || activeTextColor ==  null || activeTextColor==  "") activeTextColor = null; 
 
            this.dynStates.infoText           = text;
            this.settings.infoTextFont        = textFont;
            this.settings.infoTextColor       = textColor;
            this.settings.infoTextColorActive = activeTextColor;
            
                
            if (text !== null && this.intern._jinfoText == null) {
                this.intern._jelement.prepend("<div id='"+this.advSettings.elemName+"_infoText'></div>");
                this.intern._jinfoText = jQuery('#'+this.advSettings.elemName + '_infoText');
                this.intern._jinfoText.addClass('hq-no-select');
                this.intern._jinfoText.addClass('hq-info-text');
            }
            if (this.intern._jinfoText){
                // state condition
                if (this.settings.infoCondition != null && this.settings.infoCondition != "") {
					// Evaluate condition
					if (hqWidgets.evalCondition (text, this.settings.infoCondition)) {
						this.SetState (hqWidgets.gState.gStateOn);
						this.show();
					}
					else {
						this.SetState (hqWidgets.gState.gStateOff);
						if (this.settings.infoIsHideInactive)
							this.hide();
					}
                }
                else
                    this.SetState (hqWidgets.gState.gStateOff);
            
                // Get active color
                if (this.dynStates.state == hqWidgets.gState.gStateOn &&
                    this.settings.infoTextColorActive != null && 
                    this.settings.infoTextColorActive != "") {
                    textColor = this.settings.infoTextColorActive;
                }
                
                // format string
                if (this.settings.infoFormat != null && this.settings.infoFormat != "") {
                    text += "";
                    if (this.settings.infoAccuracy !== undefined && 
                        this.settings.infoAccuracy !== null &&
                        this.settings.infoAccuracy !== "") {
                        var t = text.replace (",",".");
                        text = parseFloat(text).toFixed(parseInt (this.settings.infoAccuracy))+"";
                        if (hqWidgets.gOptions.gLocale == 'de' ||  hqWidgets.gOptions.gLocale == 'ru') {
                        	text = text.replace (".", ",");
                        }
                    }

                    text = this.settings.infoFormat.replace ("%s", text);
                } else {
					// If no format, no text
					text = "";
				}
                    
                this.intern._jinfoText.css({font: textFont, color: textColor});
                this.intern._jinfoText.html ((text) || "");
                if (text != null) {
                    var w = text.dimensions(textFont);
					
                    // Place it in the middle
                    this.intern._jinfoText.css({top:  (this.settings.height - w.height) / 2, 
                                                left: (this.settings.width  - w.width) / 2,
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
            if (this.intern._isEditMode){
                if (this.settings.isContextMenu) {
                    if (this.intern._jcenter && this.settings.buttonType != hqWidgets.gButtonType.gTypeImage)  
                        this.intern._jcenter.stop().hide();		
                    if (this.intern._jtemp)    this.intern._jtemp.stop().hide();
                    if (this.intern._jhumid)   this.intern._jhumid.stop().hide();
                    if (this.intern._jinfoText)this.intern._jinfoText.stop().hide();
                }
                
                if (this.intern._jleft && ((this.intern._isEditMode && !hqWidgets.gOptions.gHideDescription) || this.settings.showDescription))
                    this.intern._jleft.stop().show();
                if (this.intern._jbattery) this.intern._jbattery.stop().hide();
                if (this.intern._jsignal)  this.intern._jsignal.stop().hide();
                if (this.intern._jicon)	   this.intern._jicon.removeClass("ui-icon-cancel").hide();
                
                if (this.intern._jgauge){
                    this._ShowGauge ();
                }
                else
                if (this.intern._jdoor)	
                    this.ShowDoorState ();
                else
                if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind) {
                    if (this.intern._isPressed)	
                        this._SetClass (this.intern._backMoving);
                    else {
                        if (this.settings.isContextMenu) {
                            if (!this.settings.noBackground) {
                                if (this.settings.isIgnoreEditMode)
                                    this._SetClass (this.intern._backOn);
                                else
                                    this._SetClass (this.intern._backOff);
                            } else
                                this._SetClass ("hq-no-background-edit");
                        } else {
                            if (this.dynStates.state == hqWidgets.gState.gStateOn)
                            {
                                if (this.intern._isPressed)
                                    this._SetClass (this.intern._backOnHover);
                                else
                                    this._SetClass (this.intern._backOn);
                            } else {
                                if (this.intern._isPressed)
                                    this._SetClass (this.intern._backOffHover);
                                else
                                    this._SetClass (this.intern._backOff);
                            }	
                        }
                    }
                }
                else {
                    this.SetWindowState(-1, hqWidgets.gWindowState.gWindowClosed, hqWidgets.gHandlePos.gPosClosed);
                    this.ShowBlindState();
                }
            }
            else {// not Edit mode
                if (this.intern._jcenter) {
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeImage) {
                        if (!this.intern._isPressed) { 
							if (this.settings.iconName && this.dynStates.state == hqWidgets.gState.gStateOff) {
								this.intern._jcenter.stop().show();
							} else
							if (this.settings.iconOn && this.dynStates.state == hqWidgets.gState.gStateOn){
								this.intern._jcenter.stop().show();
							}
						}
                        else
                            this.intern._jcenter.stop().hide();
                    }
                }                
                if (this.intern._jtemp)        this.intern._jtemp.stop().show();
                if (this.intern._jhumid && !this.dynStates.hideHumidity) this.intern._jhumid.stop().show();
                if (this.intern._jinfoText)    this.intern._jinfoText.stop().show();
                if (this.intern._jleft && !this.settings.showDescription) this.intern._jleft.stop().hide();
                if (this.intern._jbattery)     this.intern._jbattery.stop().show();
                if (this.intern._jsignal)      this.intern._jsignal.stop().show();
                if (this.intern._jstaticText)  this.intern._jstaticText.stop().show();
                if (this.dynStates.state != hqWidgets.gState.gStateUnknown) {
                    if (this.intern._jicon)
                        this.intern._jicon.removeClass("ui-icon-cancel");
                        
                    if (this.intern._jgauge){
                        this._ShowGauge ();
                    }
                    else
                    if (this.intern._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind) {
                        if (this.dynStates.state == hqWidgets.gState.gStateOn) {
                            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
                                this.show();
                            }
                            
                            if (this.intern._isPressed)
                                this._SetClass (this.intern._backOnHover);
                            else
                                this._SetClass (this.intern._backOn);
                        } else
                        {
                            // Hide element if lowbat is false
                            if (this.dynStates.state == hqWidgets.gState.gStateOff && 
                                this.settings.buttonType == hqWidgets.gButtonType.gTypeLowbat &&
                                this.settings.infoIsHideInactive == true) {
                                this.hide();
                            }

                            if (this.intern._isPressed)
                                this._SetClass (this.intern._backOffHover);
                            else
                                this._SetClass (this.intern._backOff);
                        }	
                    }
                    else {
                        this.SetWindowState(-1, hqWidgets.gWindowState.gWindowUpdate);
                        this.ShowBlindState();
                    }
                    
                    if (this.intern._jicon) {
                        if (this.dynStates.isRefresh)
                        {
                            this.intern._jicon.addClass("ui-icon-refresh");
                            this.intern._jicon.removeClass("ui-icon-gear");
                            this.intern._jicon.show();
                        } else
                        {
                            this.intern._jicon.removeClass("ui-icon-refresh");
                            if (this.dynStates.isWorking) {
                                this.intern._jicon.addClass("ui-icon-gear");
                                this.intern._jicon.show();
                            }
                            else {
                                this.intern._jicon.removeClass("ui-icon-gear");
                                this.intern._jicon.hide();
                            }
                        }
                    }
                }
                else {
                    if (this.intern._jicon) {
                        this.intern._jicon.show();
                        this.intern._jicon.removeClass("ui-icon-refresh");
                        this.intern._jicon.removeClass("ui-icon-gear");
                        this.intern._jicon.addClass("ui-icon-cancel");
                    }
                    
                    if (this.intern._jgauge){
                        this._ShowGauge ();
                    }
                    if (this.intern._jdoor)
                        this.ShowDoorState ();
                    else
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind)
                        this._SetClass (this.intern._backOff, 100);
                    else {
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
						this.intern._jcenter.show();
                    }
                    else {
						if (this.settings.iconName) {
							this.intern._jcenter.attr('src', this.settings.iconName);
							this.intern._jcenter.show();
						} else 
						{
							this.intern._jcenter.hide();
						}
					}
                }
                                
                // Show information window if state chaged to true
                if (newState == hqWidgets.gState.gStateOn && 
                    oldState != hqWidgets.gState.gStateUnknown && oldState != null) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGong ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeCam) {
                        
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {
							this._PlayMelody();
						}
                        
                        // Hide big window
                        if (this.intern._jbigWindow && hqWidgets.gDynamics.gActiveBig != null && hqWidgets.gDynamics.gActiveBig != this)
                            hqWidgets.gDynamics.gActiveBig.ShowBigWindow (false);

                        if (this.intern._jbigWindow && this.settings.ipCamImageURL) {
                             if (!this.intern._isBigVisible)
                                this.ShowBigWindow (true);
                        }
                        // Show dialog
                        else 
                        if (this.dynStates.action && !this.intern._isBigVisible && this.settings.ctrlActionBtn) {
                            if (!document.getElementById('gongDialog')) {
                                this.intern._isBigVisible = true;
                                var text = "<div id='gongDialog' style='width:"+(200 + this.settings.ctrlQuestion.width('18px "Arial", sans-serif')) + "px'><table style='width: 100%; height: 100%' class='ui-widget-content'><tr><td>";
                                var iconName = this.settings.ctrlQuestionImg;
                                iconName = (iconName != null && iconName != "") ? (((iconName.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName) : null;

                                text += "<img src='"+iconName+"' /></td>";
                                text += "<td><p>"+this.settings.ctrlQuestion+"</p></td></tr></table></div>"
                                // Show dialog, that will hide automatically after 10 seconds
                                var btns = {};
                                btns[this.settings.ctrlBtnText] = function() {
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
                                btns[hqWidgets.translate(hqWidgets.gOptions.gCancelText)] = function() {
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
                                
                                this.intern.timerID = _setTimeout(function (elem) {
                                    elem.intern._isBigVisible = false;
                                    $('#gongDialog').dialog('close').remove ();
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
                    this.dynStates.lastAction = new Date ();
                    // Set tooltip
                    if (this.intern._jrightText)
                        this.intern._jrightText.attr('title', this.dynStates.lastAction + "");
                        
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
            if (this.settings.x != x_ || this.settings.y != y_) {
                this.settings.x = x_;
                this.settings.y = y_;
                this.intern._jelement.css ({left: x_, top: y_});
                //if (this.intern._jeventhnd)
                //    this.intern._jeventhnd.css({left: x_, top: y_});
                if (this.intern._jright) 
                    this.intern._jright.css({top:y_, left:x_ + this.intern._jelement.width()/2});
                if (this.intern._jleft)  
                    this.intern._jleft.css ({top:y_, left:x_ - this.intern._jleft.offset});
                if (this.intern._jbigWindow) {
                    var x = x_ + (this.intern._jelement.width()  - this.intern._jbigWindow.width())/2;
                    var y = y_ + (this.intern._jelement.height() - this.intern._jbigWindow.height())/2;
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    this.intern._jbigWindow.css ({top: y, left:x});
                    this.intern._jbigWindow.x = x;
                    this.intern._jbigWindow.y = y;
                }
                if (this.intern._jcircle) {
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
					if (this.dynStates.lowBatteryDesc != null)
						this.intern._jbattery.prop('title', this.dynStates.lowBatteryDesc);
					else
						this.intern._jbattery.prop('title', '');
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
                    this.intern._jsignal.bar = [];
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
            if (text      == undefined || text      == null || text     == "") text      = hqWidgets.translate ("Text");
            if (textFont  == undefined || textFont  == null || textFont == "") textFont  = '20px "Tahoma", sans-serif';
            if (textColor == undefined || textColor == null || textColor== "") textColor = "white"; 
            this.intern._jstaticText.html(text).css({font: textFont, color: textColor});

            this.settings.staticText      = text;
            this.settings.staticTextFont  = textFont;
            this.settings.staticTextColor = textColor;
        }
        // Set title (Tooltip) or SetLeftInfo
        this.SetTitle = function (room, title)	{
            if (!this.intern._jleft) {
                if (!document.getElementById(this.advSettings.elemName+'_left')) {
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
            if (title !== undefined) this.settings.title = title;
            if (room  !== undefined) this.settings.room  = room;
            if (this.settings.room == null)
                this.settings.room = "";
            
            // If description is empty => set type
            this.intern._description = this.settings.title;
            if (this.intern._description == null || this.intern._description == "") {
                this.intern._description = hqWidgets.Type2Name (this.settings.buttonType);
                this.intern._jelement.attr ('title', "");
            }
            else {
                this.intern._jelement.attr ('title', this.settings.title.replace("<br>", " / "));
            }

            this.intern._jleft.offset = this.intern._description.width();
            var w = this.settings.room.width();
            this.intern._jleft.offset = ((this.intern._jleft.offset > w) ? this.intern._jleft.offset : w)+ 10;
            this.intern._jleft.css({left:  this.settings.x - this.intern._jleft.offset, 
                                      width: this.intern._jleft.offset + this.intern._jelement.width() / 2}); // Set size
            this.intern._jdesc.html(this.intern._description);
            this.intern._jroom.html(this.settings.room);
        }
        this.ShowBigWindow = function (isShow, delay, customTimeout)	{
            if (isShow && hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this) {
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);
            }
            
            this.intern._isBigVisible = isShow;
            if (isShow) {
                if (customTimeout === undefined)
                    customTimeout = this.settings.popUpDelay; // show for standard period for 5 seconds
                    
                hqWidgets.gDynamics.gShownBig = this;
                // Close window after X seconds
                if (customTimeout > 0 && !this.dynStates.bigPinned) {
                    this.intern._timerID = _setTimeout(function () {
                        if (hqWidgets.gDynamics.gShownBig) {
                            hqWidgets.gDynamics.gShownBig.intern._timerID = null;
                            hqWidgets.gDynamics.gShownBig.ShowBigWindow(false); 
                        } 
                        hqWidgets.gDynamics.gShownBig = null;
                    }, customTimeout);
                }
                
                this.intern._jbigWindow.show();

                if (this.settings.doNotAnimate || !this.settings.showChanging) {
                    this.intern._jbigWindow.css ({
                        top:    this.intern._jbigWindow.y,
                        left:   this.intern._jbigWindow.x,
                        width:  this.intern._jbigWindow.bwidth,
                        height: this.intern._jbigWindow.bheight,
                        'z-index': 22
                    });
                    if (this.intern._jbigWindow.buttons) {
                        var i;
                        for (i=0;i<3;i++) hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons[i].show();
                    }
                    else
                    if (this.intern._jbigBlind1 != null) {
                        this.intern._jbigBlind1.css({height:this.intern._jbigWindow.bheight * this.dynStates.percentState / 100});
                        if (this.settings.isShowPercent && this.intern._jbigWindow && this.intern._jbigWindow.jtext) {
                            this.intern._jbigWindow.jtext.html(this.dynStates.percentState+"%");
                        }
                        if (this.intern._jbigWindow.OnShow){
                            this.intern._jbigWindow.OnShow();
                        }
                    }
                    else
                    if (this.intern._jbigWindow.jbigImage) {
                        this.intern._jbigWindow.OnShow();
                    }
                    else
                    if (this.intern._jbigWindow.OnShow){
                        this.intern._jbigWindow.OnShow();;
                    }
                }
                else {
                    if (this.intern._jbigWindow.bwidth == undefined) {
                        this.intern._jbigWindow.bheight = this.intern._jbigWindow.height();
                        this.intern._jbigWindow.bwidth  = this.intern._jbigWindow.width();
                        this.intern._jbigWindow.x       = this.intern._jbigWindow.position().left;
                        this.intern._jbigWindow.y       = this.intern._jbigWindow.position().top;
                    }

                    this.intern._jbigWindow.css ({top:    this.settings.y,
                                                  left:   this.settings.x,
                                                  width:  this.intern._jelement.width(),
                                                  height: this.intern._jelement.height(),
                                                  'z-index': 22
                                                  });

                    this.intern._jbigWindow.animate ({top:    this.intern._jbigWindow.y,
                                                      left:   this.intern._jbigWindow.x,
                                                      width:  this.intern._jbigWindow.bwidth,
                                                      height: this.intern._jbigWindow.bheight}, 500);
                    if (this.intern._jbigWindow.buttons) {
                        setTimeout(function () {
                            var i;
                            for (i=0;i<3;i++) hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons[i].show();
                        }, 500);
                    }
                    else
                    if (this.intern._jbigBlind1 != null) {
                        this.intern._jbigBlind1.css({height:this.intern._jbigWindow.bheight * this.dynStates.percentState / 100});
                        if (this.settings.isShowPercent && this.intern._jbigWindow && this.intern._jbigWindow.jtext) {
                            this.intern._jbigWindow.jtext.html(this.dynStates.percentState+"%");
                        }
                        if (this.intern._jbigWindow.OnShow){
                            _setTimeout(function (el) { el.OnShow(); }, 510, this.intern._jbigWindow);
                        }
                    }
                    else
                    if (this.intern._jbigWindow.jbigImage) {
                        _setTimeout(function (el) { el.OnShow(); }, 510, this.intern._jbigWindow);
                    }
                    else
                    if (this.intern._jbigWindow.OnShow){
                        _setTimeout(function (el) { el.OnShow(); }, 510, this.intern._jbigWindow);
                    }
                }
            }
            else {
                if (this.intern._jbigWindow.is(':visible')) {
                    hqWidgets.gDynamics.gShownBig = this;

                    // remember position if it was moved
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeCam ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeGong) {

                        if (!hqWidgets.gOptions.gIsTouchDevice) {
                            this.intern._jbigWindow.bheight = this.intern._jbigWindow.height();
                            this.intern._jbigWindow.bwidth  = this.intern._jbigWindow.width();
                        }
                        this.intern._jbigWindow.x = this.intern._jbigWindow.position().left;
                        this.intern._jbigWindow.y = this.intern._jbigWindow.position().top;
                    }

                    if (this.intern._timerID) {
                        clearTimeout (this.intern._timerID);
                        this.intern._timerID = null;
                    }

                    if (this.intern._jbigWindow.jbigImage) {
                        this.intern._jbigWindow.OnHide ();
                    }
                    else
                    if (this.intern._jbigWindow.OnHide)
                        this.intern._jbigWindow.OnHide ();

                    if (delay) {
                        _setTimeout(function (el){
                            if (hqWidgets.gDynamics.gShownBig != null) {
                                if (el.settings.doNotAnimate || !el.settings.showChanging) {
                                    hqWidgets.gDynamics.gShownBig.intern._jbigWindow.hide();
                                }
                                else {
                                    hqWidgets.gDynamics.gShownBig.intern._jbigWindow.animate ({
                                             top:    hqWidgets.gDynamics.gShownBig.settings.y,
                                             left:   hqWidgets.gDynamics.gShownBig.settings.x,
                                             width:  hqWidgets.gDynamics.gShownBig.intern._jelement.width(),
                                             height: hqWidgets.gDynamics.gShownBig.intern._jelement.height()}, 500);

                                    _setTimeout(function(elem){
                                        elem.intern._jbigWindow.hide();
                                    }, 500, hqWidgets.gDynamics.gShownBig);
                                }

                                if (hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons) {
                                    var i;
                                    for (i=0; i<3; i++)
                                        hqWidgets.gDynamics.gShownBig.intern._jbigWindow.buttons[i].hide();
                                }

                                hqWidgets.gDynamics.gShownBig = null;
                            }
                        }, delay, this);
                    }
                    else {
                        if (this.settings.doNotAnimate || !this.settings.showChanging) {
                            this.intern._jbigWindow.hide();
                        }
                        else{
                            hqWidgets.gDynamics.gShownBig.intern._jbigWindow.animate ({
                                top:    this.settings.y,
                                left:   this.settings.x,
                                width:  this.intern._jelement.width(),
                                height: this.intern._jelement.height()}, 500);

                            _setTimeout(function(elem) {elem.intern._jbigWindow.hide();}, 500, this);
                        }
                        if (this.intern._jbigWindow.buttons) {
                            var i;
                            for (i=0;i<3;i++)
                                this.intern._jbigWindow.buttons[i].hide();
                        }
                        hqWidgets.gDynamics.gShownBig = null;
                    }
                }
            }
        }
        this.SetPercent = function (percent, isForSet, isForce)	{
            if (percent < 0)   percent = 0;
            if (percent > 100) percent =100;
            
            if (isForce ||
                (!isForSet && percent != this.dynStates.percentState) ||
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
				   
                if (this.settings.isShowPercent) {
					if (this.intern._jPercent)
						this._ShowRightInfo (undefined, percent+"%");
					else
						this._ShowRightInfo ("  "+percent+"%");
					
                    if (this.intern._jbigWindow && this.intern._jbigWindow.jtext)
                        this.intern._jbigWindow.jtext.html(percent+"%");
                }
            }
        }		
        this.StoreSettings = function()	{
            // Store settings in DB
            if (this.dynStates.store != null)
                this.dynStates.store (this, this.GetSettings(false, true));
        }
        // Send command with new position to real device
        this.SendPercent = function()	{
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                this.ShowBlindState ();
			}
        
            if (!this.intern._isEditMode && this.dynStates.action) {
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp)
                    this.dynStates.action (this, "pos", Math.round (((this.settings.valueMax - this.settings.valueMin) * this.intern._percentStateSet / 100 + this.settings.valueMin) * 2) / 2);
                else
                    this.dynStates.action (this, "pos", this.intern._percentStateSet);
            }
        }
        this.ShowBlindState = function ()	{
            if (this.intern._jelement.leaf) {
                var i=0;
                while (this.intern._jelement.leaf[i]) {
                    if (this.intern._isEditMode && this.settings.iContextMenu) {
                        this.intern._jelement.leaf[i].divs[0].hide();
					}
                    else {
                        this.intern._jelement.leaf[i].divs[0].show();
                        this.intern._jelement.leaf[i].divs[this.intern._jelement.leaf[i].blindIndex].animate ({height:this.intern._jelement.leaf[i].height * (this.dynStates.percentState / 100)}, 500);
                    }
                    i++;
                }
            }
        }
        this.SetWindowState = function (index, state, handleState)	{            
            // If set all leafs to this state
            if (index==-1 && this.intern._jelement.leaf) {
                var i=0;
                while (this.intern._jelement.leaf[i]) {
                    this.SetWindowState(i, state, handleState);
                    i++;
                }
                return;
            }
                
            if (this.intern._jelement.leaf && this.intern._jelement.leaf[index]) {
                var wnd = this.intern._jelement.leaf[index]; 
        
                if (handleState === undefined)
                    handleState = wnd.handleState;

                if (state === undefined)
                    state = wnd.state;
        
                if (state == hqWidgets.gWindowState.gWindowToggle)
                    state = (wnd.state == hqWidgets.gWindowState.gWindowClosed) ? hqWidgets.gWindowState.gWindowOpened: hqWidgets.gWindowState.gWindowClosed;
                else
                if (state == hqWidgets.gWindowState.gWindowUpdate)
                    state = wnd.state;
                    
                this.intern._jelement.leaf[index].state       = state;
                this.intern._jelement.leaf[index].handleState = handleState;
                
                if (this.intern._isEditMode && !this.settings.isContextMenu)
                    state = hqWidgets.gOptions.gWindowOpened;
                    
                if (wnd.divs[4])
                    wnd.divs[4].removeClass('hq-blind-handle-closed').
                                removeClass('hq-blind-handle-bg').
                                removeClass('hq-blind-handle-opened-bg').
                                removeClass('hq-blind-handle-opened').
                                removeClass('hq-blind-handle-tilted').
                                removeClass('hq-blind-handle-tilted-bg');

                if (state == hqWidgets.gWindowState.gWindowClosed || (this.intern._isEditMode && this.settings.isContextMenu)) {
                    if (!this.intern._isEditMode) wnd.state = hqWidgets.gWindowState.gWindowClosed;
                    wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-left')
                                           .removeClass ('hq-blind-blind3-opened-right')
                                           .removeClass ('hq-blind-blind3-tilted');
                    wnd.divs[wnd.leafIndex].addClass ('hq-blind-blind3').css ({top: 0, left: 0, width: wnd.width, height: wnd.height});
                    // Set the handle state
                    if (wnd.style && wnd.style != hqWidgets.gSwingType.gSwingDeaf) { 
                        var h = wnd.divs[3].height();
                        var w = wnd.divs[3].width();
                        var size = (h > w) ? w : h;
                    
						// Tilted
                        if (this.intern._jelement.leaf[index].handleState == hqWidgets.gHandlePos.gPosTilted) {
                            wnd.divs[4].addClass('hq-blind-handle-tilted hq-blind-handle-tilted-bg');
							if (wnd.style == hqWidgets.gSwingType.gSwingTop){
								wnd.divs[4].css({height: size * 0.15, width: 2, top: 0});
							}
							else {
								wnd.divs[4].css({height: size * 0.15, width: 2, top: wnd.divs[3].height() / 2});
							}
                        }
                        else 
						// Opened 
                        if (this.intern._jelement.leaf[index].handleState == hqWidgets.gHandlePos.gPosOpened) {
                            wnd.divs[4].addClass('hq-blind-handle-opened hq-blind-handle-opened-bg');
							if (wnd.style == hqWidgets.gSwingType.gSwingTop){
								wnd.divs[4].css({height: size * 0.15, width: 2, top: 0});
							}
							else {
								wnd.divs[4].css({width: size * 0.15, height: 2, top: (wnd.divs[3].height() - wnd.divs[4].height()) / 2});
							}
                        }
						// Closed
                        else {
                            wnd.divs[4].addClass('hq-blind-handle-closed hq-blind-handle-bg');
							if (wnd.style == hqWidgets.gSwingType.gSwingTop){
								wnd.divs[4].css({width: size * 0.15, height: 2, top: 0});
							}
							else {
								wnd.divs[4].css({height: size * 0.15, width: 2, top: wnd.divs[3].height() / 2});
							}
                        }
                    
                        if (wnd.style == hqWidgets.gSwingType.gSwingLeft)
                            wnd.divs[4].css({left: wnd.divs[2].width() - wnd.divs[4].width()});
						else
                        if (wnd.style == hqWidgets.gSwingType.gSwingTop) {
                            //wnd.divs[4].css({left: (wnd.divs[2].width() - size * 0.15) / 2});
						}
                        else
                            wnd.divs[4].css({left: 0});
                    }
                }
                else { // Opened or tilted
                    // If handle says tilted => window is tilted
                    if (this.intern._jelement.leaf[index].handleState == hqWidgets.gHandlePos.gPosTilted)
                        state = hqWidgets.gWindowState.gWindowTilted;
                        
                    var hh = wnd.divs[3].height();
                    var w = wnd.divs[3].width();
                    var size = (hh > w) ? w : hh;
               
                    // Show tilted state
                    if (wnd.style && wnd.style != hqWidgets.gSwingType.gSwingDeaf && 
                        (state == hqWidgets.gWindowState.gWindowTilted || wnd.style == hqWidgets.gSwingType.gSwingTop)) {
						
                        if (!this.intern._isEditMode) {
							wnd.state = hqWidgets.gOptions.gWindowTilted;
						}
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-left');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-right');
                        wnd.divs[wnd.leafIndex].addClass    ('hq-blind-blind3-tilted');
                        wnd.divs[wnd.leafIndex].css ({top: wnd.height - wnd.oheight - 2, left: 5, height: wnd.oheight, width: wnd.width});
                        // Set handle state
                        wnd.divs[4].addClass('hq-blind-handle-tilted hq-blind-handle-bg');
                        wnd.divs[4].css({height: size * 0.15, width: 2});
                        if (wnd.style == hqWidgets.gSwingType.gSwingLeft) {
                            wnd.divs[4].css({left: wnd.divs[3].width() - wnd.divs[4].width() - 1, top: wnd.divs[3].height() / 2});
						} else 
						if (wnd.style == hqWidgets.gSwingType.gSwingTop) {
                            wnd.divs[4].css({left: wnd.divs[3].width() / 2 - 1, top: wnd.divs[4].width() + 1});
						}
                        else {
                            wnd.divs[4].css({left: 0, top: wnd.divs[3].height() / 2});
						}
                    }
                    else // Show opened state
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingLeft) {
                        if (!this.intern._isEditMode) wnd.state = hqWidgets.gOptions.gWindowOpened;
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-tilted');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-right');
                        wnd.divs[wnd.leafIndex].addClass    ('hq-blind-blind3-opened-left');
                        wnd.divs[wnd.leafIndex].css ({top: wnd.ooffset-3, left: 0, width: wnd.owidth, height: wnd.height});
                        // Set handle state
                        wnd.divs[4].css({width: size * 0.15, height: 2});
                        wnd.divs[4].css({top: (wnd.divs[3].height() - wnd.divs[4].height()) / 2});
                        wnd.divs[4].addClass('hq-blind-handle-opened hq-blind-handle-bg');
                        wnd.divs[4].css({left: wnd.divs[3].width() - wnd.divs[4].width() - 1});
                    }
                    else // Show opened state
                    if (wnd.style && wnd.style == hqWidgets.gSwingType.gSwingRight)
                    {
                        if (!this.intern._isEditMode)wnd.state = hqWidgets.gOptions.gWindowOpened;
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-tilted');
                        wnd.divs[wnd.leafIndex].removeClass ('hq-blind-blind3-opened-left');
                        wnd.divs[wnd.leafIndex].addClass    ('hq-blind-blind3-opened-right');
                        wnd.divs[wnd.leafIndex].css ({top:  wnd.ooffset-3, left: wnd.width-wnd.owidth-1, width: wnd.owidth, height: wnd.height});
                        // Set handle state
                        wnd.divs[4].css({width: size * 0.15, height: 2});
                        wnd.divs[4].css({top: (wnd.divs[3].height() - wnd.divs[4].height()) / 2});
                        wnd.divs[4].addClass('hq-blind-handle-opened hq-blind-handle-bg');
                        wnd.divs[4].css({left: 0});
                    }
                }			
            }
        };
        this.SetTemperature = function (temp)	{
            if (temp === "changeFont") {
                if (this.intern._jtemp) {
                    this.intern._jtemp.css ({font: this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif", color: this.settings.infoTextColor || 'black'});
                    var dim = "0".dimensions (this.settings.infoTextFont || "bold 11px 'Tahoma', sans-serif");
                    this.intern._jtemp.css({top:this.settings.height / 2 - dim.height});
                }
                if (this.intern._jhumid && this.settings.infoTextFont) {
                    this.intern._jhumid.css ({font: this.settings.infoTextFont ? this.settings.infoTextFont.replace("bold", "") : "11px 'Tahoma', sans-serif"});
                }
            }
            else
            if (temp) {
                // State is no more unknown 
                if (temp.temperature !== undefined && temp.temperature != null && this.dynStates.state == hqWidgets.gState.gStateUnknown)
                    this.SetState (hqWidgets.gState.gStateOff);
                
                if (temp.valve      !=undefined && this.intern._jvalve)  this.intern._jvalve.html(Math.round(temp.valve) + '%');
                if (temp.valueSet   !=undefined && this.intern._jsettemp){
                    // If state word
                    if (typeof temp.valueSet === "string" && (temp.valueSet[0] < '0' || temp.valueSet[0] > '9'))
                        this.intern._jsettemp.html(temp.valueSet);
                    else
                        this.intern._jsettemp.html(hqWidgets.TempFormat(temp.valueSet) + hqWidgets.gOptions.gTempSymbol);
                }
                if (temp.temperature !== undefined && this.intern._jtemp) { 
					this.intern._jtemp.html(hqWidgets.TempFormat(temp.temperature) + hqWidgets.gOptions.gTempSymbol);
				}
				
				var hideHumidity = (temp.hideHumidity === undefined) ? this.dynStates.hideHumidity : temp.hideHumidity;
				if (hideHumidity != true) {
					if (temp.humidity !== undefined && this.intern._jhumid) {
						this.intern._jhumid.show();
						this.intern._jhumid.html(Math.round(temp.humidity)+'%');
					}
				} else if (this.intern._jhumid){
					this.intern._jhumid.hide();
				}
                if (this.settings.hideValve  !=undefined && this.intern._jvalve)  {
                    if (!this.settings.hideValve)
                        this.intern._jvalve.show();
                    else
                        this.intern._jvalve.hide();
                }
            }
            else {	
                if (this.intern._jvalve)   this.intern._jvalve.html('--%');
                if (this.intern._jsettemp) this.intern._jsettemp.html('--,-&#176;C');
                if (this.intern._jtemp)    this.intern._jtemp.html('--,-&#176;C');
                if (this.intern._jhumid)   this.intern._jhumid.html('--,-%');
            }
        };
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
                    this.settings.buttonType != hqWidgets.gButtonType.gTypeCam) {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        hqWidgets.gDynamics.gActiveElement = this;
                        this.intern._cursorX = this.settings.x + this.settings.width  / 2;
                        this.intern._cursorY = this.settings.y + this.settings.height / 2;
                        this.intern._angle   = -1; // unknown state
                        
                        // Wokaround for tablets
                        this.intern._hideDimmer = _setTimeout(function (elem) {
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
                
                    if (this.dynStates.action){
                        var _width  = this.intern._jelement.width();
                        var _height = this.intern._jelement.height();
                        if (!this.settings.x) this.settings.x = this.intern._jelement.position().left;
                        if (!this.settings.y) this.settings.y = this.intern._jelement.position().top;
                        var iShrink = 4;
                        var iShrinkCtr = hqWidgets.gOptions.gBtIconHeight/_height*iShrink;
                        this.intern._jelement.stop().animate({
                            width:        _width  - iShrink, 
                            height:       _height - iShrink, 
                            borderRadius: (((this.settings.radius !== null) && (this.settings.radius !== undefined)) ? this.settings.radius : (_height - iShrink)/2),
                            left:         this.settings.x + iShrink/2, 
                            top:          this.settings.y + iShrink/2}, 
                            50);
                            
                        if (this.intern._jcenter)
                            this.intern._jcenter.stop().animate({width:  this.settings.btIconWidth - iShrinkCtr, 
                                                                 height: this.settings.btIconHeight- iShrinkCtr, 
                                                                 left:  (_width - iShrink - this.settings.btIconWidth  + iShrinkCtr)/2, 
                                                                 top:   (_height- iShrink - this.settings.btIconHeight + iShrinkCtr)/2}, 50);
                       
                        this.intern._jicon.stop().animate({top:  (_height / 15 + iShrink / 2), 
                                                             left: (_width  / 15 + iShrink / 2)}, 50);
                    }
                }
                return false;
            }
            else {
                if (!this.settings.isContextMenu)
                    return false;
                    
                //$('#status').append('down ' + x_+" "+y_+'<br>');
                hqWidgets.gDynamics.gActiveElement = this;
                this._SetClass (this.intern._backMoving);											
                this.intern._cursorX = x_;
                this.intern._cursorY = y_;
                if (this.intern._jstaticText)	
                    hqWidgets.gDynamics.gActiveElement.intern._jstaticText.hide ();
                    
                if (isTouch){
                    this.intern._isNonClick = false; // on tablet if I click the button in edit mode, it is moved immediately
                                                       // to detect the click, if mouse Up faster than 500 ms => click
                    hqWidgets.gDynamics.gRightClickDetection = _setTimeout(function () {
                        hqWidgets.gDynamics.gActiveElement.OnContextMenu ((hqWidgets.gDynamics.gActiveElement.intern._cursorX - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.intern._cursorX - 70) : 0, 
                                                                          (hqWidgets.gDynamics.gActiveElement.intern._cursorY - 70 >= 0) ? (hqWidgets.gDynamics.gActiveElement.intern._cursorY - 70) : 0);
                    }, 1000);
                    
                    this.intern._clickDetection = _setTimeout(function () {
                        hqWidgets.gDynamics.gActiveElement.intern._isNonClick = true;
                    }, 500);
                    
                    return true;
                }
                else {
                    this.intern._isNonClick = true;
                    if (hqWidgets.gDynamics.gRightClickDetection) clearTimeout (hqWidgets.gDynamics.gRightClickDetection);
                    hqWidgets.gDynamics.gRightClickDetection = _setTimeout(function () {
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

            this.intern._isHoover = false;
            
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
                            this.intern._jcenter.stop().animate({width:  this.settings.btIconWidth,
                                                                 height: this.settings.btIconHeight, 
                                                                 left:   (this.settings.width - this.settings.btIconWidth )/2, 
                                                                 top:    (this.settings.height- this.settings.btIconHeight)/2}, 50);
                            // Bugfix: somethimes it is in the wrong position
                            _setTimeout(function (elem){
                                elem.intern._jcenter.stop().css({width:  elem.settings.btIconWidth,
                                                                 height: elem.settings.btIconHeight, 
                                                                 left:   (elem.settings.width - elem.settings.btIconWidth )/2, 
                                                                 top:    (elem.settings.height- elem.settings.btIconHeight)/2}, 50);
                                                       }, 50, this);
                        }
                                                                   
                        this.intern._jicon.stop().animate({top:  '' + this.settings.height / 15, 
                                                             left: '' + this.settings.width  / 15}, 50);
                    }
                }
                this.intern._isPressed = false;
                
                // Bug fix: first click does not work
                if (!this.intern._isMoved) {
                    _setTimeout(function (e) {
                        e.OnClick ()
                    }, 50, this);
                }
            }
            else {
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
        this.hide = function (isOnlyPanels) {
			if (isOnlyPanels !== true)
				this.intern._jelement.hide(); 
            if (this.intern._jright) 
                this.intern._jright.hide (); 
            if (this.intern._jleft) 
                this.intern._jleft.hide (); 
			this.dynStates.isVisible = false;
        }
        this.show = function () {
			this.dynStates.isVisible = true;
            this.intern._jelement.show(); 
            if (this.intern._jright && (this.intern._jvalve || (this.intern._jrightText && this.intern._jrightText.html() != ""))) 
                this.intern._jright.show (); 
            if (this.intern._jleft && ((this.intern._isEditMode && !hqWidgets.gOptions.gHideDescription) || this.settings.showDescription))
                this.intern._jleft.show ();
        }
        this.OnClick = function (isForce) {
            //$('#status').append('click start ' + this.intern._isEditMode+" " + this.clickTimer +'<br>');
            // Filter the double click 
            if (this.intern._clickTimer) return;
            this.intern._clickTimer = _setTimeout(function (elem) {
                clearTimeout (elem.intern._clickTimer);
                elem.intern._clickTimer = null;
            }, 500, this);
            
            hqWidgets.gDynamics.gClickTimer = _setTimeout(function () {
                clearTimeout (hqWidgets.gDynamics.gClickTimer);
                hqWidgets.gDynamics.gClickTimer = null;
            }, 500);
            
            if (hqWidgets.gDynamics.gShownBig != null && hqWidgets.gDynamics.gShownBig != this)
                hqWidgets.gDynamics.gShownBig.ShowBigWindow(false);

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo && this.settings.ctrlActionBtn){
                if ((!this.intern._isEditMode || isForce) && this.dynStates.action && !this.intern._isBigVisible) {
                    if (!document.getElementById('infoDialog')) {
                        this.intern._isBigVisible = true;
                        var text = "<div id='infoDialog' style='width:"+(200 + this.settings.ctrlQuestion.width('18px "Arial", sans-serif')) + "px'><table style='width: 100%; height: 100%' class='ui-widget-content'><tr><td>";
                        var iconName = this.settings.ctrlQuestionImg;
                        iconName = (iconName != null && iconName != "") ? (((iconName.indexOf ("/") != -1) ? "" : hqWidgets.gOptions.gPictDir) + iconName) : null;

                        text += "<img src='"+iconName+"' /></td>";
                        text += "<td><p>"+this.settings.ctrlQuestion+"</p></td></tr></table></div>"
                        // Show dialog, that will hide automatically after 10 seconds
                        var btns = {};
                        btns[this.settings.ctrlBtnText] = function() {
                                        var dlg = document.getElementById ('infoDialog');
                                        dlg.parentQuery.intern._isBigVisible = false;
                                        $( this ).dialog( "close" );
                                        $( this ).remove();
                                        dlg.parentQuery.dynStates.action (dlg.parentQuery, "open", hqWidgets.gState.gStateOn);
                                        if (dlg.parentQuery.intern.timerID) {
                                          clearTimeout (dlg.parentQuery.intern.timerID);
                                          dlg.parentQuery.intern.timerID = null;
                                        }
                                    };
                        btns[hqWidgets.translate(hqWidgets.gOptions.gCancelText)] = function() {
                                    var dlg = document.getElementById ('infoDialog');
                                    dlg.parentQuery.intern._isBigVisible = false;
                                    $( this ).dialog( "close" );
                                    $( this ).remove();
                                    if (dlg.parentQuery.intern.timerID) {
                                        clearTimeout (dlg.parentQuery.intern.timerID);
                                        dlg.parentQuery.intern.timerID = null;
                                    }
                                };
                        $('body').append(text);
                        var dlg = document.getElementById ('infoDialog');
                        dlg.parentQuery = this;
                        
                        var jdlg = $('#infoDialog').dialog ({title: this.settings.title, 
                                         resizable: false,
                                         modal: true,
                                         autoOpen:true,
                                         width: 'auto',
                                         buttons: btns});
                        
                        jdlg.parentQuery = this;
                        
                        this.intern.timerID = _setTimeout(function (elem) {
                            elem.intern._isBigVisible = false;
                            $('#infoDialog').dialog('close').remove ();
                            elem.intern.timerID = null;
                        }, this.settings.popUpDelay, this);
                        //dlg.dialog('open');
                    }
                }    
            }
            else {       
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
                    if (this.intern._jbigWindow && this.dynStates.infoWindow.isEnabled && !this.intern._isMoved && this.settings.isPopupEnabled)
                        this.ShowBigWindow(true);
                }
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
                        
                if (delta > mustBe) {
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
                        
                if (delta > mustBe) {
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
                    this.SetPercent (Math.floor (ang / 360 * 100), true);
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
        this.GetInfoWindowSettings = function () {
            return this.dynStates.infoWindow;
        },
        this.SetInfoWindowSettings  = function (infoWnd) {
            if (infoWnd.isEnabled !== undefined) {
                this.dynStates.infoWindow = $.extend (this.dynStates.infoWindow, infoWnd);
                                
                if (this.dynStates.infoWindow.isEnabled) {
                    if (this.settings.buttonType != hqWidgets.gButtonType.gTypeCam  &&
                        this.settings.buttonType != hqWidgets.gButtonType.gTypeGong && 
                        this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind) {

                        if (!this.dynStates.infoWindow.isShowButtons)
                            this._CreateInfoPopup ('hq-ipcam-big');
                        else
                            this._CreateInfoPopup ('hq-ipcam-big-with-action');
                        
                        this._SetInfoPopupTitle (this.dynStates.infoWindow.title);
                        this._SetInfoPopupContent (this.dynStates.infoWindow.content);
                    
                        if (this.dynStates.infoWindow.isShowButtons) {
                            //text += "<tr id='"+this.advSettings.elemName+"_btns' style='height:40px'>"
                            var text = "<table style='width:100%'><tr><td style='width: 93%'></td>";
                            text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigOK' style='width:8em'>OK</button></td>";
                            text += "</tr></table>";
                            this.intern._jbigWindow.jbigWindowBtns.append (text);
                            
                            document.getElementById(this.advSettings.elemName+"_bigOK").parentQuery = this;
                            $("#"+this.advSettings.elemName+"_bigOK").button({text: true}).click(function( event ) {
                                this.parentQuery.intern._jbigWindow.OnClick ();
                            });
                        }
                    }
                    else if (this.intern._jbigWindow) {
                        var xx = this.dynStates.infoWindow.x;
                        var yy = this.dynStates.infoWindow.y;
                        var ww = this.dynStates.infoWindow.width;
                        var hh = this.dynStates.infoWindow.height;
                        if (ww != null)
                            this.intern._jbigWindow.css ({width: ww, height: hh});
                            
                        if (yy != null)
                            this.intern._jbigWindow.css ({top: yy, left:xx});
						
						this.intern._jbigWindow.OnShow = function () {
							this.parent.intern._jbigWindow.bind("resize", {msg: this.parent}, function (e)	{
								var obj = e.data.msg;                        
								if (obj.dynStates.infoWindow.onResize)
									obj.dynStates.infoWindow.onResize (obj, obj.intern._jbigWindow.jbigWindowContent);
							});
							
							if (this.parent.dynStates.infoWindow.onShow)
								this.parent.dynStates.infoWindow.onShow (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
						}             
						
						this.intern._jbigWindow.OnHide = function () {
							this.parent.intern._jbigWindow.bind("resize", null, null);
							var obj = this.parent;
							var pos = obj.intern._jbigWindow.position ();
							obj.dynStates.infoWindow.x      = Math.round(pos.left);
							obj.dynStates.infoWindow.y      = Math.round(pos.top);
							obj.dynStates.infoWindow.height = Math.round(obj.intern._jbigWindow.height());
							obj.dynStates.infoWindow.width  = Math.round(obj.intern._jbigWindow.width());
							obj.intern._jbigWindow.bheight  = obj.dynStates.infoWindow.height;
							obj.intern._jbigWindow.bwidth   = obj.dynStates.infoWindow.width;
							obj.intern._jbigWindow.x        = obj.dynStates.infoWindow.x;
							obj.intern._jbigWindow.y        = obj.dynStates.infoWindow.y;
							if (this.parent.dynStates.infoWindow.onHide)
								this.parent.dynStates.infoWindow.onHide (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
						}    
                    }
					else {
						console.log ("Why this.intern._jbigWindow does not exist");
					}
				}
                else {
                    if (this.intern._jbigWindow) {
                        this.intern._jbigWindow.remove ();
                        this.intern._jbigWindow = null;
                    }
                }
            }
            else {
                this.dynStates.infoWindow = $.extend (this.dynStates.infoWindow, infoWnd);

                if (infoWnd.title !== undefined) {
                    this._SetInfoPopupTitle (this.dynStates.infoWindow.title);
                }
                if (infoWnd.content !== undefined) {
                    this._SetInfoPopupContent (this.dynStates.infoWindow.content);
                }
            }
        },
        this.SetInfoWindowContent  = function (content) {
            if (this.dynStates.infoWindow.isEnabled) {
                this._SetInfoPopupTitle (this.dynStates.infoWindow.title);
                this._SetInfoPopupContent (this.dynStates.infoWindow.content);
                
                if (this.dynStates.infoWindow.isShowButtons) {
                    //text += "<tr id='"+this.advSettings.elemName+"_btns' style='height:40px'>"
                    var text = "<table style='width:100%'><tr><td style='width: 93%'></td>";
                    text += "<td><button style='height:40px' id='"+this.advSettings.elemName+"_bigOK' style='width:8em'>OK</button></td>";
                    text += "</tr></table>";
                    this.intern._jbigWindow.jbigWindowBtns.append (text);
                    
                    document.getElementById(this.advSettings.elemName+"_bigOK").parentQuery = this;
                    $("#"+this.advSettings.elemName+"_bigOK").button({text: true}).click(function( event ) {
                        this.parentQuery.intern._jbigWindow.OnClick ();
                    });
                }
                this.intern._jbigWindow.OnShow = function () {
                    this.parent.intern._jbigWindow.bind("resize", {msg: this.parent}, function (e)	{
                        var obj = e.data.msg;                        
                        if (obj.dynStates.infoWindow.onResize)
                            obj.dynStates.infoWindow.onResize (obj, obj.intern._jbigWindow.jbigWindowContent);
                    });
                    
                    if (this.parent.dynStates.infoWindow.onShow)
                        this.parent.dynStates.infoWindow.onShow (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
                }             
                
                this.intern._jbigWindow.OnHide = function () {
                    this.parent.intern._jbigWindow.bind("resize", null, null);
                    var obj = this.parent;
                    var pos = obj.intern._jbigWindow.position ();
                    obj.dynStates.infoWindow.x      = pos.left;
                    obj.dynStates.infoWindow.y      = pos.top;
                    obj.dynStates.infoWindow.height = obj.intern._jbigWindow.height();
                    obj.dynStates.infoWindow.width  = obj.intern._jbigWindow.width();
                    obj.intern._jbigWindow.bheight  = obj.dynStates.infoWindow.height;
                    obj.intern._jbigWindow.bwidth   = obj.dynStates.infoWindow.width;
                    obj.intern._jbigWindow.x        = obj.dynStates.infoWindow.x;
                    obj.intern._jbigWindow.y        = obj.dynStates.infoWindow.y;
                    if (this.parent.dynStates.infoWindow.onHide)
                        this.parent.dynStates.infoWindow.onHide (this.parent, this.parent.intern._jbigWindow.jbigWindowContent);
                }    
            }
            else {
                if (this.intern._jbigWindow) {
                    this.intern._jbigWindow.remove ();
                    this.intern._jbigWindow = null;
                }
            }
        },
        this.SetStates = function (dynOptions) {
            
            // InfoText and InfoTextCSS
            if (dynOptions.infoText !== undefined) 
                this.SetInfoText (dynOptions.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);
        
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
            if (dynOptions.action !== undefined)
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
            
            // Last action time
            if (dynOptions.lastAction !== undefined) {
                this.dynStates.lastAction = dynOptions.lastAction;
                // Set tooltip
                if (this.intern._jrightText)
                    this.intern._jrightText.attr('title', this.dynStates.lastAction + "");
                    
                this._ShowLastActionTime ();
            }
            
            //  lowBattery
            if (dynOptions.lowBattery !== undefined) {
				if (dynOptions.lowBatteryDesc !== undefined)
					this.dynStates.lowBatteryDesc = dynOptions.lowBatteryDesc;
				else
					this.dynStates.lowBatteryDesc = null;
                this.ShowBattery (dynOptions.lowBattery); 
			}

            //  windowState  - like "0,2,1" means first leaf is unknown state, middle is closed and the third is opened
            if (dynOptions.windowState !== undefined && 
                this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                // trim
                if (dynOptions.windowState!=null && dynOptions.windowState.replace(/^\s+|\s+$/g, '') != "") {
                    var a=dynOptions.windowState.split(',');
                    var i;
                    for (i=0; i < a.length; i++) this.SetWindowState (i, a[i]);
                }
            }
            //  handleState  - like "0,2,1" means first handle is unknown state, middle is closed and the third is opened
            if (dynOptions.handleState !== undefined && 
                this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                // trim
                if (dynOptions.handleState != null && dynOptions.handleState.replace(/^\s+|\s+$/g, '') != "") {
                    var a=dynOptions.handleState.split(',');
                    var i;
                    for (i=0; i < a.length; i++) this.SetWindowState (i, undefined, a[i]);
                }
            }

            //  percentState - blinds position from 0 to 100 or dimmer state from 0 to 100
            if (dynOptions.percentState !== undefined) {
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeMotion) {
                    //Calculate percent
                    if (dynOptions.percentState < this.settings.valueMin) dynOptions.percentState = this.settings.valueMin;
                    if (dynOptions.percentState > this.settings.valueMax) dynOptions.percentState = this.settings.valueMax;
                    dynOptions.percentState = Math.round ((dynOptions.percentState - this.settings.valueMin) / (this.settings.valueMax - this.settings.valueMin) * 100);
                }
                this.SetPercent (dynOptions.percentState);
            }

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge && dynOptions.valueSet !== undefined) {
                this.dynStates.valueSet = parseFloat(dynOptions.valueSet);
                dynOptions.state = hqWidgets.gState.gStateOff;
                this._ShowGauge ();
            }
                
            //  state
            if (dynOptions.state !== undefined) { 
                this.SetState (dynOptions.state);
                if (this.settings.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
                    dynOptions.lowBattery = (dynOptions.state == hqWidgets.gState.gStateOn);
                    this.ShowBattery (dynOptions.lowBattery); 
                }            
                if (dynOptions.state == null)
                    dynOptions.state = undefined;
            }                
                
            this.dynStates = $.extend (this.dynStates, dynOptions);
        };
        this.SetSettings = function (options, isSave) {
            
            // Styles
            {
                var isSet = false;
                if (options.styleNormal !== undefined) {
                    this.intern._jelement.removeClass (this.settings.styleNormal);
                    this.settings.styleNormal = options.styleNormal;
                    isSet = true;
                }
                if (options.styleNormalHover !== undefined) {
                    this.intern._jelement.removeClass (this.settings.styleNormalHover);
                    this.settings.styleNormalHover = options.styleNormalHover;
                    isSet = true;
                }
                if (options.styleActive !== undefined) {
                    this.intern._jelement.removeClass (this.settings.styleActive);
                    this.settings.styleActive = options.styleActive;
                    isSet = true;
                }
                if (options.styleActiveHover !== undefined) {
                    this.intern._jelement.removeClass (this.settings.styleActiveHover);
                    this.settings.styleActiveHover = options.styleActiveHover;
                    isSet = true;
                }
                if (isSet)
                    this._SetUsejQueryStyle (this.settings.usejQueryStyle, true);
            }
            
            //  Type
            if (options.buttonType !== undefined) 
                this._SetType (options.buttonType);

            // Position
            if (options.x!== undefined && options.y!=undefined)
                this.SetPosition(options.x, options.y);
            else 
            if (options.x!== undefined)
                this.SetPosition(options.x, this.settings.y);
            else
            if (options.y!=undefined)
                this.SetPosition(this.settings.x, options.y);

            // Width and height
            if (options.width!== undefined && options.height!=undefined)
                this.SetSize(options.width, options.height);
            else 
            if (options.width!== undefined)
                this.SetSize(options.width, this.intern._jelement.height());
            else
            if (options.height!=undefined)
                this.SetSize(this.intern._jelement.width(), options.y);
            
            // Icon size
            if (options.btIconWidth !== undefined || options.btIconHeight !== undefined) {
                if (options.btIconWidth !== undefined)
                    this.settings.btIconWidth = options.btIconWidth;
                    
                if (options.btIconHeight !== undefined)
                    this.settings.btIconHeight = options.btIconHeight;
                    
                this.SetIcon(this.settings.iconName);
            }
                
            // Radius
            if (options.radius!== undefined && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeBlind && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
                this.settings.buttonType != hqWidgets.gButtonType.gTypeText) {
                this.settings.radius = options.radius;
                if (this.settings.radius == undefined || this.settings.radius == null)
                    this.settings.radius = hqWidgets.gOptions.gBtHeight/2;
                this.intern._jelement.css ({borderRadius: this.settings.radius});
            }

            // State
            /*if (options.state !== undefined) {
                this.SetState (options.state);
            }  */              
            
            // Room and description
            if (options.title !== undefined && options.room !== undefined)
                this.SetTitle (options.room, options.title);
            else
            if (options.title !== undefined)
                this.SetTitle (this.room, options.title);
            else
            if (options.room !== undefined)
                this.SetTitle (options.room, this.title);

            // jQuery style
            if (options.usejQueryStyle !== undefined)
                this._SetUsejQueryStyle (options.usejQueryStyle, true);

            // noBackground
            if (options.noBackground !== undefined) {
                this.settings.noBackground = options.noBackground;
                this._SetUsejQueryStyle (this.settings.usejQueryStyle, true);
            }
            
            //  iconName
            if (options.iconName !== undefined) {
                this.SetIcon (options.iconName);
                options.iconName = this.settings.iconName;
            }
            
            // ipCamImageURL => reset internal URl link
            if (options.ipCamImageURL !== undefined || options.isPopupEnabled !== undefined) {
                if ((settings.ipCamImageURL == null || settings.ipCamImageURL == "") && options.ipCamImageURL != null && options.ipCamImageURL != "") {
                    if (options.ipCamVideoDelay !== undefined) {
                        this.settings.ipCamVideoDelay = options.ipCamVideoDelay;
                    }
                    if (options.isPopupEnabled !== undefined) {
                        this.settings.isPopupEnabled = options.isPopupEnabled;
                    }                    
                    if (this.settings.isPopupEnabled && this._CreateBigCam) {
                        this._CreateBigCam ();
                    }
                }
                else 
                if (!this.settings.isPopupEnabled && options.isPopupEnabled) {
                    this.settings.isPopupEnabled = true;
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

            if (options.isShowPercent !== undefined) {
                if (options.isShowPercent) {
                    this._CreateRightInfo ();
					if (this.intern._jPercent)
						this._ShowRightInfo (undefined, this.dynStates.percentState+"%");
					else
						this._ShowRightInfo ("  "+this.dynStates.percentState+"%");

                    if (this.intern._jbigWindow && this.intern._jbigWindow.jtext == undefined) {
                        if (!document.getElementById(this.advSettings.elemName+'_bigBlindText'))
                            this.intern._jbigWindow.append('<div id="'+this.advSettings.elemName+'_bigBlindText"></div>');
                        this.intern._jbigWindow.jtext = $('#'+this.advSettings.elemName+'_bigBlindText');
                        this.intern._jbigWindow.jtext.addClass('ui-widget hq-blind-big-text');
                    }
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                        this.settings.isShowPercent = true;
                        this._ShowGauge ();
                    }
                }
                else {
                    if (this.settings.buttonType == hqWidgets.gButtonType.gTypeDimmer ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeBlind ||
                        this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                        if (this.intern._jright)
                            this.intern._jright.remove ();
                        this.intern._jright     = null;
                        this.intern._jrightText = null;
                        if (this.intern._jbigWindow && this.intern._jbigWindow.jtext) {
                            this.intern._jbigWindow.jtext.remove ();
                            this.intern._jbigWindow.jtext = undefined;
                        }
                        if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                            this.settings.isShowPercent = false;
                            this._ShowGauge ();
                        }
                    }
                }
            }
                
            //  windowConfig - like "1,0,2" means 3 leafs, first is gSwingLeft, middle is deaf and the third is gSwingRight
            if (options.windowConfig !== undefined && 
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
                if (options.staticText !== undefined && options.staticTextFont !== undefined && options.staticTextColor !== undefined) 
                    this.SetStaticText (options.staticText, options.staticTextFont, options.staticTextColor);
                else
                if (options.staticText !== undefined && options.staticTextFont !== undefined) 
                    this.SetStaticText (options.staticText, options.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticText !== undefined && options.staticTextColor !== undefined) 
                    this.SetStaticText (options.staticText, this.settings.staticTextFont, options.staticTextColor);
                else
                if (options.staticTextFont !== undefined && options.staticTextColor !== undefined) 
                    this.SetStaticText (this.settings.staticText, options.staticTextFont, options.staticTextColor);
                else
                if (options.staticText !== undefined) 
                    this.SetStaticText (options.staticText, this.settings.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticTextFont !== undefined) 
                    this.SetStaticText (this.settings.staticText, options.staticTextFont, this.settings.staticTextColor);
                else
                if (options.staticTextColor !== undefined) 
                    this.SetStaticText (this.settings.staticText, this.settings.staticTextFont, options.staticTextColor);
            }
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInfo ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                if (options.infoTextFont !== undefined && options.infoTextColor !== undefined) 
                    this.SetInfoText (this.dynStates.infoText, options.infoTextFont, options.infoTextColor, this.settings.infoTextColorActive);
                else
                if (options.infoTextColor !== undefined) 
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, options.infoTextColor, this.settings.infoTextColorActive);
                else
                if (options.infoTextFont !== undefined) 
                    this.SetInfoText (this.dynStates.infoText, options.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);

                if (options.infoTextColorActive !== undefined) 
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, options.infoTextColorActive);
                    
                if (options.infoFormat !== undefined) {
                    this.settings.infoFormat = options.infoFormat;
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);
                }
                if (options.infoCondition !== undefined) {
                    this.settings.infoCondition = options.infoCondition;
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);
                }
                if (options.infoIsHideInactive !== undefined) {
                    this.settings.infoIsHideInactive = options.infoIsHideInactive;
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);
                }
                if (options.infoAccuracy !== undefined) {
                    this.settings.infoAccuracy = options.infoAccuracy;
                    this.SetInfoText (this.dynStates.infoText, this.settings.infoTextFont, this.settings.infoTextColor, this.settings.infoTextColorActive);
                }
            }

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
                this.settings.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                if (options.infoTextFont !== undefined) {
                    this.settings.infoTextFont = options.infoTextFont;
                }
                if (options.infoTextColor !== undefined) {
                    this.settings.infoTextColor = options.infoTextColor;
                }

                this.SetTemperature ("changeFont");
            }

            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                var isSet = false;
                if (options.valueMin !== undefined) {
                    this.settings.valueMin = parseInt(options.valueMin);
                    isSet = true;
                }
                if (options.gaugeColor !== undefined) {
                    this.settings.gaugeColor = options.gaugeColor;
                    isSet = true;
                }
                if (options.valueMax !== undefined) {
                    this.settings.valueMax = parseInt(options.valueMax);
                    isSet = true;
                }
                if (options.gaugeHorz !== undefined) {
                    this.settings.gaugeHorz = options.gaugeHorz;
                    isSet = true;
                }
                if (options.gaugeStart !== undefined) {
                    this.settings.gaugeStart = options.gaugeStart;
                    isSet = true;
                }
                
                if (isSet)
                    this._ShowGauge ();
            }

            if  (options.showDescription !== undefined && this.intern._isEditMode) {
                this.settings.showDescription = options.showDescription;
                this.hide();
                _setTimeout(function (_this) { _this.show() }, 100, this);
            }
            
            if (this.settings.buttonType == hqWidgets.gButtonType.gTypeImage && options.zindex !== undefined){
                //this.settings.zindex = (options.zindex < 998) ? options.zindex: 997; 
                //this.intern._jelement.css({'z-index':this.settings.zindex});
            }
            if (options.zindex !== undefined){
               // this.intern._jelement.css({'z-index':this.settings.zindex});
            }
            if (isSave) {
                this.settings = $.extend (this.settings, options);
                this.StoreSettings ();
            }
            if (this._CreateBigCam && this.settings.isPopupEnabled &&
                (options.title        !== undefined || options.ctrlActionBtn !== undefined ||
                 options.ctrlBtnText  !== undefined || options.gongActionBtn !== undefined ||
                 options.ctrlQuestion !== undefined || options.gongBtnText   !== undefined)) {
                this._CreateBigCam ();
            }
        }


        // ------------ INIT ALL SETTINGS --------------------------------	
        if (options.x!=undefined && options.y!=undefined)
            this.intern._jelement.css ({top: options.y, left: options.x, position: 'absolute'}); // Set position
        
        // States and local variables
        //this.settings.zindex = (options.zindex !== undefined) ? ((options.zindex < 998) ? options.zindex : 997) : ((options.buttonType == hqWidgets.gButtonType.gTypeImage) ? 0 : 1000);

        if (this.settings.isContextMenu && (typeof hqUtils != 'undefined') && hqUtils != null) {
            this.intern._contextMenu    = new hqUtils.ContextMenu ({parent: this});
            this.intern._contextMenu.Add ({text:hqWidgets.Type2Name(this.settings.buttonType)});
            this.intern._contextMenu.Add ({text:"Settings", action:function(elem){
                    var m   = new hqUtils.SettingsDialogContent({options: elem.GetSettings (false, false), getImages: hqWidgets.gOptions.getImages}); 
                    var dlg = new hqUtils.Dialog ({
                        title:        hqWidgets.translate("Settings"), 
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
        if (this.intern._jelement.css('display') != "none") {
            var pos = this.intern._jelement.position();
            if (pos.top != 0 || pos.left != 0) {
                this.settings.x = this.intern._jelement.position().left;
                this.settings.y = this.intern._jelement.position().top;
            }
        }
        
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
                                      "background-color": "transparent"
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
            //var _width  = obj.intern._jelement.width();
            //var _height = obj.intern._jelement.height();
            var _width  = obj.settings.width;
            var _height = obj.settings.height;

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
                            obj.intern._jcenter.stop().animate({width:  obj.settings.btIconWidth, 
                                                                height: obj.settings.btIconHeight, 
                                                                left:  (_width  - obj.settings.btIconWidth)/2, 
                                                                top:   (_height - obj.settings.btIconHeight)/2}, 50);
                        obj.intern._jicon.stop().animate({top:  (_height / 15), 
                                                            left: (_width  / 15)}, 50);
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
            if (e.button == 0) { // right
                if ((!e.data.msg.intern._isEditMode || e.data.msg.settings.isContextMenu) && e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) {
                    e.preventDefault();
                }
                // Hide active menu
                if (hqWidgets.gDynamics.gActiveMenu) {
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
            if (e.data.msg.intern._isEditMode) {
                e.data.msg.SetSize (e.data.msg.intern._jelement.width(), e.data.msg.intern._jelement.height());
            }
        });
    }
};
