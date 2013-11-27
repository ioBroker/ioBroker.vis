/**
 *  DashUI
 *  https://github.com/GermanBluefox/DashUI/
 *
 *  Copyright (c) 2013 Bluefox https://github.com/GermanBluefox
 *  MIT License (MIT)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 *  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *  the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

// duiEdit - the DashUI Editor extensions

dui = $.extend(true, dui, {
    styleSelect: {
        // local variables
        _currentElement: 0,
        _scrollWidth:    -1,
        _internalList:   null,
        // Default settings
        settings: {
            // List of styles
            styles:        null,
            width:         100,
            style:         "",     // Init style as text
            onchange:      null,   // onchange fuction: handler (newStyle, onchangeParam);
            onchangeParam: null,   // user parameter for onchange function
            parent:        null,
            height:        30,
            dropOpened:    false,
            name:          null,
            id:            -1,
            filterFile:    null,
            filterName:    null,
            filterAttrs:   null
        },
        _findTitle: function (styles, style) {
            for(var st in styles) {
                if (styles[st] == style) {
                    return ((st == "") ? style : st);
                }
            }
            return style;
        },
        
        // Functions
        Show: function (options) {
            // Fill the list of styles
            if (this._internalList == null) {
                this._internalList = {};
                var sSheetList = document.styleSheets;
                for (var sSheet = 0; sSheet < sSheetList.length; sSheet++) {
                    var ruleList = document.styleSheets[sSheet].cssRules;
                    if (ruleList !== undefined && ruleList != null) {
                        var bglen = "hq-background-".length;
                        for (var rule = 0; rule < ruleList.length; rule ++) {
                            if (ruleList[rule].selectorText === undefined || ruleList[rule].selectorText == null || ruleList[rule].selectorText == "")
                                continue;
                                
                            var styles = ruleList[rule].selectorText.split(' ');
                            for (var i = 0; i < styles.length; i++) {
                                if (styles[i] == "" || styles[i][0] != '.' || styles[i].indexOf(':') != -1)
                                    break;
                                    
                                var name = styles[i];
                                name = name.replace (",", "");
                                if (name.length > 0 && (name[0] == '.' || name[0] == '#'))
                                    name = name.substring(1);                       
                                var val  = name;
                                if (name.length >= bglen && name.substring(0, bglen) == "hq-background-")
                                    name = name.substring(bglen);
                                    
                                if (name.substring(0, "hq-".length) == "hq-")
                                    name = name.substring(3);
                                    
                                if (name.substring(0, "ui-".length) == "ui-")
                                    name = name.substring(3);
                                    
                                name = name.replace (/-/g, " ");
                                if (name.length > 0) {
                                    name = name[0].toUpperCase() + name.substring(1);
                                    var fff = document.styleSheets[sSheet].href;
                                    if (fff != null && fff != "" && fff.indexOf('/') != -1)
                                        fff = fff.substring(fff.lastIndexOf('/')+1);
                                    this._internalList[name] = {style: val, file: fff, attrs: ruleList[rule].style};
                                }
                                break;
                            }
	                    }
                    }
                }        
            }

            // Detect scrollbar width
            if (this._scrollWidth == -1) {
                // Create the measurement node
                var scrollDiv = document.createElement("div");
                scrollDiv.style.width = 100;
                scrollDiv.style.height = 100;
                scrollDiv.style.overflow = "scroll";
                scrollDiv.style.position = "absolute";
                scrollDiv.style.top = "-9999px";
                document.body.appendChild(scrollDiv);

                // Get the scrollbar width
                this._scrollWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                
                // Delete the DIV 
                document.body.removeChild(scrollDiv);
            }
            if (options.name === undefined || options.name == "") {
                options.name = ""+ this._currentElement;
            }
            
            var nameImg  = "styleSelectImg" +options.name;
            var nameText = "styleSelectText"+options.name;
            var nameBtn  = "styleSelectB"   +options.name;
            var nameElem = "styleSelect"    +options.name;
            if (document.getElementById (nameElem) != undefined) {
                $('#'+nameElem).remove ();
                $('#styleSelectBox'+options.name).remove ();
            }
            var text = "<table id='"+nameElem+"'><tr><td>";
                text += "<table><tr><td><div id='"+nameImg+"'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div  style='text-align: left; vertical-align: middle;' id='"+nameText+"'></div>";
                text += "</td></tr></table></td><td>";
                text += "<button id='"+nameBtn+"' />";
                text += "</td></tr></table>";
                
            var parent = (options.parent == null) ? $("body") : options.parent;
            parent.append (text);
            var htmlElem = document.getElementById (nameElem);
            htmlElem.settings = {};
            htmlElem.settings = $.extend (htmlElem.settings, this.settings);
            htmlElem.settings = $.extend (htmlElem.settings, options);
            htmlElem.settings.parent = parent;
            htmlElem.settings.id = options.name;
            htmlElem.settings.styles = {};
            htmlElem.settings.styles[dui.translate("Default")] = {style: null, file: null};
            
            if (options.styles) {
                htmlElem.settings.styles = $.extend (htmlElem.settings.styles, options.styles);
            }
            else {
                // IF filter defined
                if (htmlElem.settings.filterFile != null || htmlElem.settings.filterName != null) {
                    var filters = null;
                    if (htmlElem.settings.filterName != null && htmlElem.settings.filterName != "")
                        filters = htmlElem.settings.filterName.split(' ');
                        
                    var attrs = null;
                    if (htmlElem.settings.filterAttrs != null && htmlElem.settings.filterAttrs != "")
                        attrs = htmlElem.settings.filterAttrs.split(' ');
                
                    for(var name in this._internalList) {
                        if (htmlElem.settings.filterFile == null || 
                           (this._internalList[name].file != null && this._internalList[name].file.indexOf (htmlElem.settings.filterFile) != -1)) {
                            var isFound = (filters == null);
                            if (!isFound) {
                                for (var k = 0; k < filters.length; k++) {
                                    if (this._internalList[name].style.indexOf (filters[k]) != -1) {
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                            if (isFound) {
                                isFound = (attrs == null);
                                if (!isFound) {
                                    for (var k = 0; k < attrs.length; k++) {
                                        var t = this._internalList[name].attrs[attrs[k]];
                                        if (t !== undefined && t != null && t != "") {
                                            isFound = true;
                                            break;
                                        }
                                    }
                                }
                            }                            
                            if (isFound) {
                                htmlElem.settings.styles[name] = {style: this._internalList[name].style, file: this._internalList[name].file};
                            }
                        }
                    }
                } else {
                    htmlElem.settings.styles = $.extend (htmlElem.settings.styles, this._internalList);
                }
            }
            
            $('#'+nameImg).css  ({width: htmlElem.settings.height*2, height: htmlElem.settings.height - 4}).addClass ('ui-corner-all');
            $('#'+nameText).css ({width: htmlElem.settings.width});
            $('#'+nameBtn).button ({icons: {primary: "ui-icon-circle-triangle-s"}, text: false});
            $('#'+nameBtn).click (htmlElem, function (e) {
                dui.styleSelect._toggleDrop(e.data);
            });
            $('#'+nameBtn).height(htmlElem.settings.height).width(htmlElem.settings.height);
            var elem = $('#styleSelect'+options.name);
            elem.addClass ('ui-corner-all ui-widget-content');
            if (htmlElem.settings.style != "") {
                $('#'+nameImg).addClass (htmlElem.settings.style);
                $('#'+nameText).html (this._findTitle(htmlElem.settings.styles, htmlElem.settings.style));
            } else {
                $('#'+nameText).html ("None");
            }
            
            // Build dropdown box
            if (document.getElementById ("styleSelectBox"+options.name) == undefined) {
                var text = "<form id='styleSelectBox"+options.name+"' style='z-index:1'>";
                var i = 0;
                for (var st in htmlElem.settings.styles) {
                    text += "<input type='radio' id='styleSelectBox"+options.name+""+i+"' name='radio' /><label for='styleSelectBox"+options.name+""+i+"'>";
                    text += "<table><tr><td width='"+(htmlElem.settings.height*2+4)+"px'><div class='ui-corner-all "+htmlElem.settings.styles[st].style+"' style='width:"+(htmlElem.settings.height*2)+"px; height:"+(htmlElem.settings.height-4)+"px'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div style='text-align: left; vertical-align: middle;'>";
                    text += ((st != "")?st:htmlElem.settings.styles[st].style)+"</div></td></tr></table>";
                    text += "</label><br>";
                    i++;
                }
                text += "</form>";            
                htmlElem.settings.parent.append (text);
            }
            
            var box = $('#styleSelectBox'+options.name);
            box.buttonset();
            $('#styleSelectBox'+options.name+" :radio").click(htmlElem, function(e) {
                var rawElement = this;
                dui.styleSelect._select (e.data, rawElement.iStyle);
                dui.styleSelect._toggleDrop(e.data);
            });
            i = 0;
            // Set context
            for (var st in htmlElem.settings.styles) {
                document.getElementById ("styleSelectBox"+options.name+""+i).iStyle = htmlElem.settings.styles[st].style;
                // Select current button
                if (htmlElem.settings.style == htmlElem.settings.styles[st].style) {
                    $("#styleSelectBox"+options.name+""+i).attr("checked","checked");
                    box.buttonset('refresh');
                }
                i++;
            }
            htmlElem.settings.count = i;
            box.css ({width: $('#styleSelect'+options.name).width(), overflow: "auto"}).addClass('ui-corner-all ui-widget-content');
            box.css ({position: 'absolute', top: elem.position().top + elem.height(), left: elem.position().left});
            box.hide ();
            this._currentElement++;
            return htmlElem;
        },
        _toggleDrop: function (obj) {
            if (obj.settings.dropOpened) {
                $("#styleSelectBox"+obj.settings.id).css ({display: "none"});
                $("#styleSelectB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-s" }});
                obj.settings.dropOpened = false;
            }
            else {
                var elem = $('#styleSelect'+obj.settings.id);		
                var elemBox = $("#styleSelectBox"+obj.settings.id);		
                //if ($(window).height() < elemBox.height() + elemBox.position().top) {
                // Get position of last element
                var iHeight = obj.settings.count * (obj.settings.height + 18);
                if (iHeight > $(window).height() - elem.position().top - elem.height() - 5) {
                    iHeight = $(window).height() - elem.position().top - elem.height() - 5;
                } else {
                    iHeight += 5;
                }

                if (iHeight < 150) {
                    iHeight = 150;
                }
                elemBox.height(iHeight + 5);
                    
                var iWidth = $("#styleSelect"+obj.settings.id).width();
                elemBox.buttonset().find('table').width(iWidth - 37 - this._scrollWidth);
                $("#styleSelectBox"+obj.settings.id).css ({display: "", width: elem.width(), top: elem.position().top + elem.height(), left: elem.position().left});			
                $("#styleSelectB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-n" }});
                obj.settings.dropOpened = true;
            }
             
        },
        _select: function (obj, iStyle) {
            var nameImg  = "styleSelectImg" +obj.settings.id;
            var nameText = "styleSelectText"+obj.settings.id;
            $('#'+nameImg).removeClass (obj.settings.style);
            obj.settings.style = iStyle;
            $('#'+nameImg).addClass (obj.settings.style);
            $('#'+nameText).html (this._findTitle(obj.settings.styles, obj.settings.style));
            if (obj.settings.onchange)
                obj.settings.onchange (obj.settings.style, obj.settings.onchangeParam);     
        },
        destroy: function (htmlElem) {
            $("#styleSelectBox"+htmlElem.settings.id).remove ();			
            $('#styleSelect'+htmlElem.settings.id).remove ();			
        }
    },   
	// Image selection Dialog
	imageSelect: {
		// possible settings
		settings: {
			iwidth:      32,
			iheight:     32,
			withName:    false,
			onselect:    null,
			onselectArg: null,
			result:      "",
			current:     null,   // current image
			parent:      $('body'), 
			elemName:    "idialog_",
			zindex:      5050,
			filter:      null    // filter
		},
		_pictDir:    "img/",
		_rootDir:    null,
		_curDir:     null,
		_selectText: "",
		_cancelText: "",    
		_titleText:  "",
		_dirImage:   "kde_folder.png",
		_soundImage: "sound.png",
		_curImage:   "",
		
		Show:  function (options) {
			var i = 0;
			
			if (this._selectText == "") {
				this._selectText = dui.translate ("Select");
				this._cancelText = dui.translate ("Cancel");
				this._uploadText = dui.translate ("Upload");
				this._titleText  = dui.translate ("Selected image: ");
			}
			   
			if (!options.elemName || options.elemName == "") {
				options.elemName = "idialog_";
			}
			if (!options.parent) {
				options.parent = $('body');
			}
			
			if (document.getElementById (options.elemName) != undefined) {
				$('#'+options.elemName).remove ();
			}
			options.parent.append("<div class='dialog' id='imageSelect' title='" + this._titleText + "'></div>");
			var htmlElem = document.getElementById ("imageSelect");
			htmlElem.settings = {};
			htmlElem.settings = $.extend (htmlElem.settings, this.settings);
			htmlElem.settings = $.extend (htmlElem.settings, options);
			$(htmlElem).css({'z-index': htmlElem.settings.zindex});
			
			 // Define dialog buttons
			var dialog_buttons = {};
			dialog_buttons[this._uploadText] = function() {
				$( this ).trigger('click');
			}
			dialog_buttons[this._selectText] = function() {
				$( this ).dialog( "close" );

				if (this.settings.onselect)
					this.settings.onselect (dui.imageSelect._pictDir+this.settings.result, this.settings.onselectArg);
				$( this ).remove ();
			}
			dialog_buttons[this._cancelText] = function() {
				$( this ).dialog( "close" );
				$( this ).remove ();
			}
			$(htmlElem).dialog({
				resizable: true,
				height: $(window).height(),
				modal: true,
				width: 600,
				buttons: dialog_buttons,
				close: dialog_buttons[this._cancelText]
			});

			$(htmlElem).dropzone({
				url: "/upload?path=./www/dashui/img/",
				acceptedFiles: "image/*",
				uploadMultiple: false,
				previewTemplate: '<div class="dz-preview dz-file-preview"><div class="dz-details"><div class="dz-filename"><span data-dz-name></span></div><br/>' +
					'<div class="dz-size" data-dz-size></div><br/><img data-dz-thumbnail /></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>' +
					'<div class="dz-error-message"><span data-dz-errormessage></span></div></div>',
				previewsContainer: "#uploadPreview",
				clickable: true,
				dragover: function (e) {
					var el = $(e.toElement);
					$(e.toElement).closest("li.ui-li").addClass("upload-start");
				},
				dragleave: function (e) {
					$(e.toElement).closest("li.ui-li").removeClass("upload-start");
				},
				drop: function (e, ui) {
					var closest = $(e.toElement).closest("li.ui-li");
					closest.removeClass("upload-start");

				},
				complete: function (e) {
					if (this.element.settings.onselect) {
						this.element.settings.onselect ("img/"+dui.imageSelect._curDir+ e.name, this.element.settings.onselectArg);
					}
					$(this.element).dialog( "close" );
					$(this.element).remove ();
				},
				init: function () {
					this.on("processing", function() {
						this.options.url = "/upload?path=./www/dashui/img/"+dui.imageSelect._curDir;
					});
				}

			});

			// Show wait icon
			if (!document.getElementById ('dashui-waitico'))
				$(htmlElem).append("<p id='dashui-waitico'>Please wait...</p>");
				
			$('#dashui-waitico').show();
			this._rootDir = "www/dashui/img/";
			this._curDir = "";
			htmlElem.settings.result = htmlElem.settings.current;
			// Find current directory
			if (htmlElem.settings.result && htmlElem.settings.result != "") { 
				var str = htmlElem.settings.result;
				if (str.substring (0, this._pictDir.length) == this._pictDir) {
					str = str.substring (this._pictDir.length);
				}
				if (str.indexOf ('/') != -1) {
					var disr = str.split ("/");
					for (var z=0; z < disr.length -1; z++)
						this._curDir += disr[z]+"/";
				}
			}
			
			this.getFileList (htmlElem);
		},
		getFileList: function (htmlElem) {
			// find selected image
			dui.imageSelect._curImage = "";
			
			if (htmlElem.settings.result && htmlElem.settings.result != "") { 
				var str = htmlElem.settings.result;
				if (str.substring (0, dui.imageSelect._pictDir.length) == dui.imageSelect._pictDir) {
					str = str.substring (dui.imageSelect._pictDir.length);
				}
				if  (str.substring (0, dui.imageSelect._curDir.length) == dui.imageSelect._curDir) {
					str = str.substring (dui.imageSelect._curDir.length);
					if (str.indexOf ('/') == -1) {
						dui.imageSelect._curImage = str;
					}
				}
			}
			
			// Load directory
			dui.socket.emit('readdir', this._rootDir + this._curDir, function(dirArr) {
				dui.imageSelect.showImages(dirArr, htmlElem);
			});
		},
		showImages: function (aImages, obj) {	
			// Remove wait icon
			$('#dashui-waitico').hide ();
			obj.settings.columns = Math.floor (($(obj).width()-30) / (obj.settings.iwidth+5));
			obj.settings.rows    = Math.floor (aImages.length / obj.settings.columns) + 2;
			
			if (document.getElementById (obj.settings.elemName+"_tbl0")) {
				$('#'+obj.settings.elemName+"_tbl0").remove ();
			}
			if (document.getElementById (obj.settings.elemName+"_tbl1")) {
				$('#'+obj.settings.elemName+"_tbl1").remove ();
			}

			// Remove directory image and place directories first
			var bImages = new Array ();
			var j = 0;
			if (dui.imageSelect._curDir != null && dui.imageSelect._curDir != "") {
				bImages[j++] = "..";
			}

			for (var i = 0; i < aImages.length; i++) {
				if (aImages[i].indexOf ('.') == -1) {
					bImages[j++] = aImages[i];
				}
			}

			for (var i = 0; i < aImages.length; i++) {
				if (aImages[i].indexOf ('.') != -1 && aImages[i] != dui.imageSelect._dirImage) {
					bImages[j++] = aImages[i];
				}
			}

			aImages = bImages;
			
			var sText = "<table id='"+obj.settings.elemName+"_tbl0'>";
			var row;
			var col;
			var id = 0;
			var filters = null;
			if (obj.settings.filter != null && obj.settings.filter != '') {
				filters = obj.settings.filter.split(';');
			} 
			
			for (row = 0; row < obj.settings.rows; row++) {
				sText += "<tr>";
				var isDirs = (aImages[id].indexOf ('.') == -1);
				for (col = 0; col < obj.settings.columns; col++) {
					if (aImages.length > id) {
						var isDir = (aImages[id].indexOf ('.') == -1) || (aImages[id] == "..");
						
						// Start from new line if directories shown
						if (isDirs && !isDir) {
							if (col != 0) {
								sText += "<td colspan='"+(obj.settings.columns-col)+"'></td>";
							}
							sText += "</tr></table><table id='"+obj.settings.elemName+"_tbl1'>";
							break;      
						} 
						if (!isDir && filters) {
							var isFound = false;
							for(var i = 0; i < filters.length; i++) {
								if (aImages[id].indexOf(filters[i]) != -1) {
									isFound = true;
									break;
								}
							}
							if (!isFound) {
								id++;
								continue;
							}
						}                 

						sText += "<td id='"+obj.settings.elemName+"_"+id+"' style='text-align: center; width:"+obj.settings.iwidth+";height:"+obj.settings.iheight+"'>";
						
						if (obj.settings.withName || isDir) {
							sText += "<table><tr><td>";
						}
					
						sText += "<img id='"+obj.settings.elemName+"_img"+id+"'";
						// File or directory
						if (aImages[id] == "..") {
							sText += " src=\""+dui.imageSelect._pictDir+dui.imageSelect._dirImage+"\" title='"+dui.translate ("Back")+"'";
						}
						else 
						if (isDir) {
							sText += " src=\""+dui.imageSelect._pictDir+dui.imageSelect._dirImage+"\" title='"+aImages[id]+"' ";
						}
						else 
						if (aImages[id].indexOf(".wav") != -1 || aImages[id].indexOf(".mp3") != -1) {
							sText += " src=\""+dui.imageSelect._pictDir+dui.imageSelect._soundImage+"\" title='"+aImages[id]+"' ";                    
						}
						else {
							sText += "title='"+aImages[id]+"' ";
						}
						sText += " />";
						
						if (obj.settings.withName || isDir) {
							sText += "</td></tr><tr><td style='font-size:0.6em;font-weight:normal'>";
							if (aImages[id] == "..") {
								sText += "<span class='ui-icon ui-icon-arrowreturnthick-1-w' style='top:50%; left:50%'></span>";
							}
							else {
								sText += aImages[id];
							}
							sText += "</td></tr></table>";
						}
						id++;
						sText += "</td>";	
					}
					else {
						sText += "<td colspan='"+(obj.settings.columns-col)+"'></td>";
						break;
					}
				}
				sText += "</tr>";
				if (id >= aImages.length) {
					break;
				}
			}
			
			sText += "</table>";//</div>";
			
			$(obj).append (sText);
			$(obj).css ({overflow: 'auto'});
			var table = $('#'+obj.settings.elemName+'_tbl0').addClass("hq-no-select");
			table.css({padding: 0, 'mapping': 0});
			table = $('#'+obj.settings.elemName+'_tbl1');
			if (table) {
				table.addClass("hq-no-select");
				table.css({padding: 0, 'mapping': 0});
			}
			
			obj.curElement = null;
			
			for (i = 0; i < aImages.length; i++) {
				var img   = $('#'+obj.settings.elemName+"_"+i);
				var image = $('#'+obj.settings.elemName+'_img'+i);
				img.addClass ("ui-state-default ui-widget-content").css({width: obj.settings.iwidth+4, height: obj.settings.iheight+4});           
				img.parent = obj;
				img.result = aImages[i];
				image.parent = img;
				image.iwidth = obj.settings.iwidth;
				image.iheight = obj.settings.iheight;
				image.i = i;
				image.isLast = (i == aImages.length-1);
				img.image = image;
				if (dui.imageSelect._curImage == aImages[i]) {	
					obj.settings.curElement = img;
					img.removeClass ("ui-state-default").addClass ("ui-state-active");
				}
				
				if (image.isLast && obj.settings.curElement) {
					image.current = obj.settings.curElement;
				}
				
				image.bind ("load", {msg: image}, function (event) {
					var obj_ = event.data.msg;
					if (obj_.width() > obj_.iwidth || obj_.height() > obj_.iheight) {
						if (obj_.width() > obj_.height()) {
							obj_.css ({height: (obj_.height() / obj_.width())  *obj._iwidth,  width:  obj_.iwidth});
						} else {
							obj_.css ({width:  (obj_.width()  / obj_.height()) *obj_.iheight, height: obj_.iheight});
						}
					}
					if (obj_.isLast && obj_.current) {
						$(obj_.parent.parent).animate ({scrollTop: obj_.current.image.position().top + obj_.current.image.height()}, 'fast');
					}
				});
				image.error (function () {
					$(this).hide();
				});
				img.bind ("mouseenter", {msg: img}, function (event) {
					var obj = event.data.msg;
					obj.removeClass("ui-state-default").removeClass("ui-state-active").addClass("ui-state-hover");
				});
				img.bind ("mouseleave", {msg: img}, function (event) {			
					var obj = event.data.msg;
					obj.removeClass("ui-state-hover");
					if (obj == obj.parent.settings.curElement) {
						obj.addClass  ("ui-state-active");
					} else {
						obj.addClass  ("ui-state-default");
					}
				});
				img.bind ("click", {msg: img}, function (event) {			
					var obj_ = event.data.msg;
					// back directory
					if (obj_.result == "..") {
						var dirs = dui.imageSelect._curDir.split ('/');
						dui.imageSelect._curDir = "";
						for (var t = 0; t < dirs.length - 2; t++)
							dui.imageSelect._curDir += dirs[t]+"/";
						dui.imageSelect.getFileList (obj);
					} else if (obj_.result.indexOf ('.') == -1) {
						dui.imageSelect._curDir += obj_.result+"/";
						dui.imageSelect.getFileList (obj);
					} else {
						obj.settings.result = dui.imageSelect._curDir+obj_.result;
						if (obj.settings.curElement) {
							obj.settings.curElement.removeClass("ui-state-active").addClass("ui-state-default");
						}
						obj.settings.curElement = obj_;
						obj_.removeClass("ui-state-hover").addClass ("ui-state-active");
						$(obj).dialog('option', 'title', dui.imageSelect._titleText + obj.settings.result);
					}
				});				
				img.bind ("dblclick", {msg: img}, function (event) {
					var obj_ = event.data.msg;
					obj.settings.result = dui.imageSelect._pictDir + dui.imageSelect._curDir + obj_.result;
					if (obj.settings.onselect) {
						console.log(obj);
						obj.settings.onselect (obj.settings.result, obj.settings.onselectArg);
					}
					$( obj ).dialog( "close" );
					$( obj ).remove ();
				});				
				// If File
				if (aImages[i] != ".." && aImages[i].indexOf ('.') != -1 && aImages[i].indexOf(".wav") == -1 && aImages[i].indexOf(".mp3") == -1) {
					image.attr('src', dui.imageSelect._pictDir+dui.imageSelect._curDir+aImages[i]);
				}
			}
			// Show active image
			if (dui.imageSelect._curImage != null && dui.imageSelect._curImage != "") { 
				$(obj).dialog('option', 'title', dui.imageSelect._titleText + dui.imageSelect._curDir + dui.imageSelect._curImage);
			}
			else {
				$(obj).dialog('option', 'title', dui.imageSelect._titleText + dui.imageSelect._curDir);
			}
		},
		// Returns only file name of root directory is _pictDir or root
		GetFileName: function (path, root) {
			if (path != null && path != "") {
				if (root == undefined || root === null) {
					root = dui.imageSelect._pictDir;
				} else if (path.length >= root.length) {
					if (path.substring(0, root.length) == root) {
						path = path.substring (root.length);
					}
				}
			}
			return path;
		}

	}
});





// Color selection Dialog
var colorSelect = {
    // possible settings
    settings: {
        onselect:    null,
        onselectArg: null,
        result:      "",
        current:     null,   // current value
        parent:      $('body'), 
        elemName:    "idialog_",
        zindex:      5050
    },
    _selectText: "",
    _cancelText: "",    
    _titleText:  "",
    
    Show:  function (options) {
        var i = 0;
        
        if (this._selectText == "") {
            this._selectText = dui.translate ("Select");
            this._cancelText = dui.translate ("Cancel");
            this._titleText  = dui.translate ("Select color");
        }
           
        if (!options.elemName || options.elemName == "") {
            options.elemName = "idialog_";
        }
        if (!options.parent) {
            options.parent = $('body');
        }
        
        if (document.getElementById (options.elemName) != undefined) {
            $('#'+options.elemName).remove ();
        }
        options.parent.append("<div class='dialog' id='colorSelect' title='" + this._titleText + "' style='text-align: center;' ><div style='display: inline-block;' id='colorpicker'></div><input type='text' id='colortext'/></div>");
        var htmlElem = document.getElementById ("colorSelect");
        htmlElem.settings = {};
        htmlElem.settings = $.extend (htmlElem.settings, this.settings);
        htmlElem.settings = $.extend (htmlElem.settings, options);
        $(htmlElem).css({'z-index': htmlElem.settings.zindex});
        
         // Define dialog buttons
        var dialog_buttons = {}; 
        dialog_buttons[this._selectText] = function() { 
            $( this ).dialog( "close" ); 
            if (this.settings.onselect)
                this.settings.onselect ($('#colortext').val(), this.settings.onselectArg);
            $( this ).remove ();
        }
        dialog_buttons[this._cancelText] = function() {
            $( this ).dialog( "close" ); 
            $( this ).remove ();
        }   
        $('#colorSelect')
        .dialog({
            resizable: false,
            height:    380,
            width:     320,
            modal:     true,
            buttons:   dialog_buttons
        });     
        if (htmlElem.settings.current != null && htmlElem.settings.current != "") {
            $('#colortext').val (htmlElem.settings.current);
        } else {
            $('#colortext').val ('#FFFFFF');
        }
        $('#colorpicker').farbtastic('#colortext');
    },
    GetColor: function () {
        return $('#colortext').val();
    }
};

// Device selection dialog
var hmSelect = {
	timeoutHnd:   null, // timeout for search
	value:        null,
	valueObj:     null,
	_userArg:     null,
	_onsuccess:   null,
	images:       null,
	mydata:       null,
    _homematic:   null,
	_selectText:  null,
	_cancelText:  null,
    _buttonsLoc:  null, // Array with rooms buttons for filter
    _buttonsFunc: null, // Array with function buttons for filter 
    _filterLoc:   "",   // rooms filter
    _filterFunc:  "",   // functions filter
    _filter:      null, // current filter
    _devices:     null, // devices instance
    _ignoreFilter:false,// If ignore device or point filter
    
	_convertName: function (text) {
		var oldText = text;
		do
		{
			oldText = text;
			text = text.replace ("%C4", "&Auml;");
			text = text.replace ("%E4", "&auml;");
			text = text.replace ("%D6", "&Ouml;");
			text = text.replace ("%F6", "&ouml;");
			text = text.replace ("%DC", "&Uuml;");
			text = text.replace ("%FC", "&uuml;");
			text = text.replace ("%DF", "&szlig;");
			text = text.replace ("%20", " ");
			text = text.replace ("%3A", ".");
		}while (text != oldText);
		
		return text;
	}, // Convert name
	_getImage: function (type) {
		if (this.images == null) {
			this.deviceImgPath = 'img/devices/50/';
			// Devices -> Images
			this.images =  {
				'HM-LC-Dim1TPBU-FM': 'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw1PBU-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-LC-Bl1PBU-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw1-PB-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-PB-2-WM':        'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw2-PB-FM':   'PushButton-4ch-wm_thumb.png',
				'HM-PB-4-WM':        'PushButton-4ch-wm_thumb.png',
				'HM-LC-Dim1L-Pl':    'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1T-Pl':    'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl':      'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1L-Pl-2':  'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl-OM54': 'OM55_DimmerSwitch_thumb.png',
				'HM-Sys-sRP-Pl':     'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1T-Pl-2':  'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl-2':    'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Ba-PCB':  '88_hm-lc-sw4-ba-pcb_thumb.png',
				'HM-Sen-RD-O':       '87_hm-sen-rd-o_thumb.png',
				'HM-RC-Sec4-2':      '86_hm-rc-sec4-2_thumb.png',
				'HM-PB-6-WM55':      '86_hm-pb-6-wm55_thumb.png',
				'HM-RC-Key4-2':      '85_hm-rc-key4-2_thumb.png',
				'HM-RC-4-2':         '84_hm-rc-4-2_thumb.png',
				'HM-Sen-WA-OD':      '82_hm-sen-wa-od_thumb.png',
				'HM-Dis-TD-T':       '81_hm-dis-td-t_thumb.png',
				'HM-Sen-MDIR-O':     '80_hm-sen-mdir-o_thumb.png',
				'HM-OU-LED16':       '78_hm-ou-led16_thumb.png',
				'HM-LC-Sw1-Ba-PCB':  '77_hm-lc-sw1-ba-pcb_thumb.png',
				'HM-LC-Sw4-WM':      '76_hm-lc-sw4-wm_thumb.png',
				'HM-PB-2-WM55':      '75_hm-pb-2-wm55_thumb.png',
				'atent':             '73_hm-atent_thumb.png',
				'HM-RC-BRC-H':       '72_hm-rc-brc-h_thumb.png',
				'HMW-IO-12-Sw14-DR': '71_hmw-io-12-sw14-dr_thumb.png',
				'HM-PB-4Dis-WM':     '70_hm-pb-4dis-wm_thumb.png',
				'HM-LC-Sw2-DR':      '69_hm-lc-sw2-dr_thumb.png',
				'HM-LC-Sw4-DR':      '68_hm-lc-sw4-dr_thumb.png',
				'HM-SCI-3-FM':       '67_hm-sci-3-fm_thumb.png',
				'HM-LC-Dim1T-CV':    '66_hm-lc-dim1t-cv_thumb.png',
				'HM-LC-Dim1T-FM':    '65_hm-lc-dim1t-fm_thumb.png',
				'HM-LC-Dim2T-SM':    '64_hm-lc-dim2T-sm_thumb.png',
				'HM-LC-Bl1-pb-FM':   '61_hm-lc-bl1-pb-fm_thumb.png',
				'HM-LC-Bi1-pb-FM':   '61_hm-lc-bi1-pb-fm_thumb.png',
				'HM-OU-CF-Pl':       '60_hm-ou-cf-pl_thumb.png',
				'HM-OU-CFM-Pl':      '60_hm-ou-cf-pl_thumb.png',
				'HMW-IO-12-FM':      '59_hmw-io-12-fm_thumb.png',
				'HMW-Sen-SC-12-FM':  '58_hmw-sen-sc-12-fm_thumb.png',
				'HM-CC-SCD':         '57_hm-cc-scd_thumb.png',
				'HMW-Sen-SC-12-DR':  '56_hmw-sen-sc-12-dr_thumb.png',
				'HM-Sec-SFA-SM':     '55_hm-sec-sfa-sm_thumb.png',
				'HM-LC-ddc1':        '54a_lc-ddc1_thumb.png',
				'HM-LC-ddc1-PCB':    '54_hm-lc-ddc1-pcb_thumb.png',
				'HM-Sen-MDIR-SM':    '53_hm-sen-mdir-sm_thumb.png',
				'HM-Sec-SD-Team':    '52_hm-sec-sd-team_thumb.png',
				'HM-Sec-SD':         '51_hm-sec-sd_thumb.png',
				'HM-Sec-MDIR':       '50_hm-sec-mdir_thumb.png',
				'HM-Sec-WDS':        '49_hm-sec-wds_thumb.png',
				'HM-Sen-EP':         '48_hm-sen-ep_thumb.png',
				'HM-Sec-TiS':        '47_hm-sec-tis_thumb.png',
				'HM-LC-Sw4-PCB':     '46_hm-lc-sw4-pcb_thumb.png',
				'HM-LC-Dim2L-SM':    '45_hm-lc-dim2l-sm_thumb.png',
				'HM-EM-CCM':         '44_hm-em-ccm_thumb.png',
				'HM-CC-VD':          '43_hm-cc-vd_thumb.png',
				'HM-CC-TC':          '42_hm-cc-tc_thumb.png',
				'HM-Swi-3-FM':       '39_hm-swi-3-fm_thumb.png',
				'HM-PBI-4-FM':       '38_hm-pbi-4-fm_thumb.png',
				'HMW-Sys-PS7-DR':    '36_hmw-sys-ps7-dr_thumb.png',
				'HMW-Sys-TM-DR':     '35_hmw-sys-tm-dr_thumb.png',
				'HMW-Sys-TM':        '34_hmw-sys-tm_thumb.png',
				'HMW-Sec-TR-FM':     '33_hmw-sec-tr-fm_thumb.png',
				'HMW-WSTH-SM':       '32_hmw-wsth-sm_thumb.png',
				'HMW-WSE-SM':        '31_hmw-wse-sm_thumb.png',
				'HMW-IO-12-Sw7-DR':  '30_hmw-io-12-sw7-dr_thumb.png',
				'HMW-IO-4-FM':       '29_hmw-io-4-fm_thumb.png',
				'HMW-LC-Dim1L-DR':   '28_hmw-lc-dim1l-dr_thumb.png',
				'HMW-LC-Bl1-DR':     '27_hmw-lc-bl1-dr_thumb.png',
				'HMW-LC-Sw2-DR':     '26_hmw-lc-sw2-dr_thumb.png',
				'HM-EM-CMM':         '25_hm-em-cmm_thumb.png',
				'HM-CCU-1':          '24_hm-cen-3-1_thumb.png',
				'HM-RCV-50':         '24_hm-cen-3-1_thumb.png',
				'HMW-RCV-50':        '24_hm-cen-3-1_thumb.png',
				'HM-RC-Key3':        '23_hm-rc-key3-b_thumb.png',
				'HM-RC-Key3-B':      '23_hm-rc-key3-b_thumb.png',
				'HM-RC-Sec3':        '22_hm-rc-sec3-b_thumb.png',
				'HM-RC-Sec3-B':      '22_hm-rc-sec3-b_thumb.png',
				'HM-RC-P1':          '21_hm-rc-p1_thumb.png',
				'HM-RC-19':          '20_hm-rc-19_thumb.png',
				'HM-RC-19-B':        '20_hm-rc-19_thumb.png',
				'HM-RC-12':          '19_hm-rc-12_thumb.png',
				'HM-RC-12-B':        '19_hm-rc-12_thumb.png',
				'HM-RC-4':           '18_hm-rc-4_thumb.png',
				'HM-RC-4-B':         '18_hm-rc-4_thumb.png',
				'HM-Sec-RHS':        '17_hm-sec-rhs_thumb.png',
				'HM-Sec-SC':         '16_hm-sec-sc_thumb.png',
				'HM-Sec-Win':        '15_hm-sec-win_thumb.png',
				'HM-Sec-Key':        '14_hm-sec-key_thumb.png',
				'HM-Sec-Key-S':      '14_hm-sec-key_thumb.png',
				'HM-WS550STH-I':     '13_hm-ws550sth-i_thumb.png',
				'HM-WDS40-TH-I':     '13_hm-ws550sth-i_thumb.png',
				'HM-WS550-US':       '9_hm-ws550-us_thumb.png',
				'WS550':             '9_hm-ws550-us_thumb.png',
				'HM-WDC7000':        '9_hm-ws550-us_thumb.png',
				'HM-LC-Sw1-SM':      '8_hm-lc-sw1-sm_thumb.png',
				'HM-LC-Bl1-FM':      '7_hm-lc-bl1-fm_thumb.png',
				'HM-LC-Bl1-SM':      '6_hm-lc-bl1-sm_thumb.png',
				'HM-LC-Sw2-FM':      '5_hm-lc-sw2-fm_thumb.png',
				'HM-LC-Sw1-FM':      '4_hm-lc-sw1-fm_thumb.png',
				'HM-LC-Sw4-SM':      '3_hm-lc-sw4-sm_thumb.png',
				'HM-LC-Dim1L-CV':    '2_hm-lc-dim1l-cv_thumb.png',
				'HM-LC-Dim1PWM-CV':  '2_hm-lc-dim1l-cv_thumb.png',
				'HM-WS550ST-IO':     'IP65_G201_thumb.png',
				'HM-WDS30-T-O':      'IP65_G201_thumb.png',
				'HM-WDS100-C6-O':    'WeatherCombiSensor_thumb.png',
				'HM-WDS10-TH-O':     'TH_CS_thumb.png',
				'HM-WS550STH-O':     'TH_CS_thumb.png'
			};	
		}
		if (this.images[type]) {
			return this.deviceImgPath + this.images[type];
        } else {
			return "";
        }
	}, // Get image for type
    _type2Str: function (type, subtype) {
        type    = parseInt (type);
        subtype = parseInt (subtype);
        switch (type) {
            case 2:
                if (subtype == 6) {
                    return dui.translate('Alarm');
                } else if (subtype == 2) {
                    return dui.translate('Logical');
                } else {
                    return dui.translate('Boolean')+","+subtype;
                }

            case 20:
                if (subtype == 11) {
                    return dui.translate('String');
                } else {
                    return dui.translate('String')+","+subtype;
                }
            case 4:
                if (subtype == 0) {
                    return dui.translate('Number');
                } else {
                    return dui.translate('Number')+","+subtype;
                }

            case 16:
                if (subtype == 29) {
                    return dui.translate('Enum');
                } else {
                    return dui.translate('Enum')+","+subtype;
                }
            default:
                return ''+type+","+subtype;
        }
    },
    _buildVarsGrid: function (homematic) {
        var variables  = homematic.regaIndex["VARDP"]; // IDs of all devices
		var selectedId = null;
                
        var w = $('#hmSelect').dialog ("option", "width");
		$('#hmSelect').dialog("option", "width", w-50);
         // Build the data tree together
		if (this.myVarsData == null) {
            this.myVarsData = new Array ();
		    var i = 0;
			// Add all elements
			for(var vari in variables) {
                var variObj = homematic.regaObjects[variables[vari]];
				this.myVarsData[i] = {
					id:           ""+(i+1), 
					"Type":       this._type2Str(variObj["ValueType"], variObj["ValueSubType"]),
					"Description":this._convertName(variObj["DPInfo"]),
					"Unit":       this._convertName(variObj["ValueUnit"]),
					"Name":       this._convertName(variObj["Name"]),
					"data":       /*vari.substring(1) + "[" + */this._convertName(variObj["Name"])/* + "]"*/,
                    "_ID":        variables[vari],
					isLeaf:       true,
					level:        "0",
					parent:       "null",
					expanded:     false, 
					loaded:       true
				};
				if (hmSelect.value && this.myVarsData[i]["_ID"] == hmSelect.value) {
					selectedId = this.myVarsData[i].id;
				}
                i++;
			}
		}
        else if (hmSelect.value != null && hmSelect.value != "") {
			for(var i = 0; i < this.myVarsData.length; i++) {
				if (hmSelect.value && this.myVarsData[i]["_ID"] == hmSelect.value) {
					selectedId = this.myVarsData[i].id;
				}
			}
        }

        // Create the grid
		$("#hmVarsContent").jqGrid({
			datatype:    "jsonstring",
			datastr:     this.myVarsData,
			height:      $('#tabs-vars').height() - 35,
			autowidth:   true,
			shrinkToFit: false,
			colNames:['Id', dui.translate ('Name'), '', dui.translate ('Type'), dui.translate ('Unit'), dui.translate ('Description'), ''],
			colModel:[
                {name:'id',         index:'id',          width:1,   hidden:true, key:true},
				{name:'Name',       index:'Name',        width:250, sortable:"text"},
                {name:'data',       index:'data',        width:1,   hidden:true},
				{name:'Type',       index:'Type',        width:80,  sortable:false, align:"right", search: false},
				{name:'Units',      index:'Unit',        width:80,  sorttype:"text", search: false},
				{name:'Description',index:'Description', width:400, sorttype:"text"},
				{name:'_ID',        index:'_ID',         width:0,   hidden:true}
			],
			onSelectRow: function(id) {
				value    = $("#hmVarsContent").jqGrid ('getCell', id, '_ID');
                valueObj = null;
				if (value != null && value != "") {
					$(":button:contains('"+hmSelect._selectText+"')").prop("disabled", false).removeClass("ui-state-disabled");
				}
			},
			
			sortname:       'id',
			multiselect:    false,
			gridview:       true,
			scrollrows :    true,
            treeGrid:       true,
            treeGridModel:  'adjacency',
            treedatatype:   'local',
            ExpandColumn:   'Name',
			ExpandColClick: true, 
			pgbuttons:      true,
			viewrecords:    true,
			jsonReader: {
				repeatitems: false,
				root:    function (obj) { return obj; },
				page:    function (obj) { return 1; },
				total:   function (obj) { return 1; },
				records: function (obj) { return obj.length; }
			}
		});
        // Add the filter column
		$("#hmVarsContent").jqGrid('filterToolbar',{searchOperators : false,
			beforeSearch: function () {
				var searchData = jQuery.parseJSON(this.p.postData.filters);
                hmSelect._varsFilter = searchData;
                hmSelect._filterVarsApply ();
			}
		});
        // Select current element
		if (selectedId != null) {
			$("#hmVarsContent").setSelection(selectedId, true);
			$("#"+$("#hmVarsContent").jqGrid('getGridParam','selrow')).focus();
		}
        
		// Disable "Select" button if nothing selected
		if (selectedId == null)	{
			$(":button:contains('"+this._selectText+"')").prop("disabled", true).addClass("ui-state-disabled");
		}        
        // Increase dialog because of bug in jqGrid
		$('#hmSelect').dialog("option", "width", w);
        this._onResize ();
        // Filter items with last filter
        this._filterVarsApply ();
    },
    _buildProgsGrid: function (homematic) {
        var programs   = homematic.regaIndex["PROGRAM"]; // IDs of all devices
		var selectedId = null;
                
        var w = $('#hmSelect').dialog ("option", "width");
		$('#hmSelect').dialog("option", "width", w-50);
        // Build the data tree together
		if (this.myProgsData == null) {
            this.myProgsData = new Array ();
		    var i = 0;
			// Add all elements
			for(var prog in programs) {
				this.myProgsData[i] = {
					id:           ""+(i+1), 
					"Description":this._convertName(homematic.regaObjects[programs[prog]]["PrgInfo"]),
					"Name":       this._convertName(homematic.regaObjects[programs[prog]]["Name"]),
					"data":       /*prog.substring(1) + "[" + */this._convertName(homematic.regaObjects[programs[prog]]["Name"])/* + "]"*/,
                    "_ID":        programs[prog],
					isLeaf:       true,
					level:        "0",
					parent:       "null",
					expanded:     false, 
					loaded:       true
                    
				};
				if (hmSelect.value && this.myProgsData[i]["_ID"] == hmSelect.value) {
					selectedId = this.myProgsData[i].id;
				}
                i++;
			}
		}
        else if (hmSelect.value != null && hmSelect.value != "") {
			for(var i = 0; i < this.myProgsData.length; i++) {
				if (hmSelect.value && this.myProgsData[i]["_ID"] == hmSelect.value) {
					selectedId = this.myProgsData[i].id;
				}
			}
        }

        // Create the grid
		$("#hmProgsContent").jqGrid({
			datatype:    "jsonstring",
			datastr:     this.myProgsData,
			height:      $('#tabs-progs').height() - 35,
			autowidth:   true,
			shrinkToFit: false,
			colNames:['Id', dui.translate ('Name'), '', dui.translate ('Description'), ''],
			colModel:[
                {name:'id',          index:'id',          width:1,   hidden:true, key:true},
				{name:'Name',        index:'Name',        width:250, sortable:"text"},
                {name:'data',        index:'data',        width:1,   hidden:true},
				{name:'Description', index:'Description', width:570, sorttype:"text"},
				{name:'_ID',         index:'_ID',         width:0,   hidden:true}
			],
			onSelectRow: function(id) {
				var value    = $("#hmProgsContent").jqGrid ('getCell', id, "_ID");
                valueObj = null;
				if (value != null && value != "") {
					$(":button:contains('"+hmSelect._selectText+"')").prop("disabled", false).removeClass("ui-state-disabled");
				}
			},
			
			sortname:       'id',
			multiselect:    false,
			gridview:       true,
			scrollrows :    true,
            treeGrid:       true,
            treeGridModel:  'adjacency',
            treedatatype:   'local',
            ExpandColumn:   'Name',
			ExpandColClick: true, 
			pgbuttons:      true,
			viewrecords:    true,
			jsonReader: {
				repeatitems: false,
				root:    function (obj) { return obj; },
				page:    function (obj) { return 1; },
				total:   function (obj) { return 1; },
				records: function (obj) { return obj.length; }
			}
		});
        // Add the filter column
		$("#hmProgsContent").jqGrid('filterToolbar',{searchOperators : false,
			beforeSearch: function () {
				var searchData = jQuery.parseJSON(this.p.postData.filters);
                hmSelect._progsFilter = searchData;
                hmSelect._filterProgsApply ();
			}
		});
        // Select current element
		if (selectedId != null) {
			$("#hmProgsContent").setSelection(selectedId, true);
			$("#"+$("#hmProgsContent").jqGrid('getGridParam','selrow')).focus();
		}
        
		// Disable "Select" button if nothing selected
		if (selectedId == null)	{
			$(":button:contains('"+this._selectText+"')").prop("disabled", true).addClass("ui-state-disabled");
		}  
        // Increase dialog because of bug in jqGrid
		$('#hmSelect').dialog("option", "width", w);         
        this._onResize ();
        
        // Filter items with last filter
        this._filterProgsApply ();
    },    
    _getRoom: function (homematic, id, isNotRecursive) {
        var result_room = "";
        var _id = id;
        var dev = id;
        var rooms       = homematic.regaIndex["ENUM_ROOMS"]; // IDs of all ROOMS
        
        while (result_room == "" && _id !== undefined) {
            for (var room in rooms) {
                for (var k = 0; k < homematic.regaObjects[rooms[room]]["Channels"].length; k++) {
                    if (homematic.regaObjects[rooms[room]]["Channels"][k] == _id) {
                        if (result_room.indexOf (homematic.regaObjects[rooms[room]]["Name"]) == -1) {
                            result_room = ((result_room == "") ? "" : ", ") + homematic.regaObjects[rooms[room]]["Name"];
                        }
                        break;
                    }
                } 
            }
            _id = homematic.regaObjects[_id]["Parent"];
            if (_id !== undefined) dev = _id;
        }   
        if (result_room == "" && !isNotRecursive) {
            // Get rooms of all channels of this device
            for (var k = 0; k < homematic.regaObjects[dev]["Channels"].length; k++) {
                var t = hmSelect._getRoom (homematic, homematic.regaObjects[dev]["Channels"][k], true);
                if (t != "") {
                    if (result_room.indexOf (t) == -1) {
                        result_room += ((result_room == "") ? "" : ", ") + t;
                    }
                }
            }
        }
        
        return result_room;
    },
    _getFunction: function (homematic, id, isNotRecursive) {
        var result_func = "";
        var _id = id;
        var dev = id;
        var functions   = homematic.regaIndex["ENUM_FUNCTIONS"]; // IDS of all functions
        
        while (result_func == "" && _id !== undefined) {
            for (var func in functions) {
                for (var k = 0; k < homematic.regaObjects[functions[func]]["Channels"].length; k++) {
                    if (homematic.regaObjects[functions[func]]["Channels"][k] == _id) {
                        if (homematic.regaObjects[functions[func]]["Name"] != "" &&
                            result_func.indexOf (homematic.regaObjects[functions[func]]["Name"]) == -1) {
                            result_func = ((result_func == "") ? "" : ", ") + homematic.regaObjects[functions[func]]["Name"];
                        }
                        break;
                    }
                } 
            }
            _id = homematic.regaObjects[_id]["Parent"];
            if (_id !== undefined) dev = _id;
        }   
        if (result_func == "" && !isNotRecursive) {
            // Get functions of all channels of this device
            for (var k = 0; k < homematic.regaObjects[dev]["Channels"].length; k++) {
                var t = hmSelect._getFunction (homematic, homematic.regaObjects[dev]["Channels"][k], true);
                if (t != "") {
                    if (result_func.indexOf (t) == -1) {
                        result_func += ((result_func == "") ? "" : ", ") + t;
                    }
                }
            }
        }
        
        return result_func;
    },
    _buildDevicesGrid: function (homematic, filter, devFilter) {
        var devicesCCU  = homematic.regaIndex["DEVICE"]; // IDs of all devices
        var rooms       = homematic.regaIndex["ENUM_ROOMS"]; // IDs of all ROOMS
        var functions   = homematic.regaIndex["ENUM_FUNCTIONS"]; // IDS of all functions

        if (this.myFilter != filter || this.myDevFilter != devFilter) {
            this._devices    = null;
            this.myFilter    = filter;
            this.myDevFilter = devFilter;
        }
        
        // If filter changed
        if (this._devices == null && filter != "all" && !this._ignoreFilter) {            
            // Clear prepared data
            this.mydata = null;
            
            if (this.myFilter != 'variables' && this.myFilter != 'programs') {
            
                if (this.myFilter == "all") {
                    this._devices = null;
                }
                //leave only desired elements
                var f = filter.split(',');
                for (var t = 0; t < f.length; t++) {
                    if (f[t][0] != '.') {
                        f[t] = "." + f[t];
                    }
                }
                var newDevices = new Object ();
                var iDevs = 0;
                var iPnts = 0;
                var iChns = 0;
                for(var dev in devicesCCU) {
                    var idDev  = devicesCCU[dev];
                    var device = homematic.regaObjects[idDev];
                    var newChannels = new Object ();
                    iPnts = 0;
                    iChns = 0;
                    
                    for (var chn in device.Channels) {
                        var idChn     = device["Channels"][chn];
                        var channel   = homematic.regaObjects[idChn];
                        var newPoints = new Object ();
                        iPnts = 0;
                        
                        if (channel["HssType"] !== undefined && channel["HssType"] == "MAINTENANCE" &&
                            (device["HssType"] == "HM-Sec-SC" || device["HssType"] == "HM-Sec-RHS"|| device["HssType"] == "HM-SCI-3-FM"))
                            continue;
                            
                        for (var dp in channel.DPs) {
                            var idPnt = channel.DPs[dp];
                            var point = homematic.regaObjects[idPnt];                        
                            var name = this._convertName(point.Name);
                            for (var t = 0; t < f.length; t++) {
                                if (name.indexOf (f[t]) != -1) {
                                    newPoints [idPnt] = point;
                                    newPoints [idPnt]["Type"] = dp;
                                    iPnts++;
                                    break;
                                }
                            }
                        }
                        if (iPnts > 0) {
                            if (iPnts == 1) {
                                for (var idPnt in newPoints) {
                                    newChannels[idPnt] = {
                                        "HssType":   channel.HssType,
                                        "Address":   newPoints[idPnt]["Name"],
                                        "Name":      channel.Name,
                                        DPs:         null,
                                        cnt:         0
                                    }
                                    break;
                                }
                                iPnts = 0;
                            }
                            else {
                                newChannels[idChn] = {
                                    "HssType":   channel.HssType,
                                    "Address":   channel.Address,
                                    "Name":      channel.Name,
                                    cnt:         iPnts,
                                    DPs:         newPoints
                                }
                            }
                            iChns++;
                        }
                    }
                    if (iChns > 0) {
                        if (iChns == 1 && iPnts == 0) {
                            for (var idChn in newChannels) {
                                newDevices[idChn] = {
                                    "Interface": device.Interface,
                                    "HssType":   device.HssType,
                                    "Address":   newChannels[idChn]["Address"],
                                    "Name":      newChannels[idChn]["Name"],
                                    cnt:         0,
                                    Channels:    null
                                };
                                break;
                            }
                            iChns = 0;
                        }
                        else {
                            newDevices[idDev] = { 
                                "Interface": device.Interface,
                                "HssType":   device.HssType,
                                "Address":   device.Address,
                                "Name":      device.Name,
                                cnt:         iChns,
                                Channels:    newChannels
                            };
                        }
                        
                        iDevs++;
                    }
                }
                
                this._devices = newDevices;
            }
        }
        
        // Filter by hssType of device
        if (this._devices == null) {
            this.mydata = null;
            
            if (filter == "all" || this._devices == null || this._ignoreFilter) {
                var f = null;
                var isWithDPs = true;
                if (!this._ignoreFilter && this.myDevFilter != '' && this.myDevFilter != null && this.myDevFilter != undefined) {
                    //leave only desired elements
                    f = devFilter.split(',');
                    isWithDPs  = (f.length > 0 && f[0].length > 0 && f[0][0] == '.');
                }
                var newDevices = new Object ();
                var iChns = 0;
                for(var dev in devicesCCU) {
                    var idDev  = devicesCCU[dev];
                    var device = homematic.regaObjects[idDev];
                    var isFound = false;
                    iChns = 0;                    
                    
                    if (f === null)
                        isFound = true;
                    else {
                        for (var t = 0; t < f.length; t++) {
                            if (device.HssType.indexOf (f[t]) != -1) {
                                isFound = true;
                                break;
                            }
                        }     
                    }
                    
                    if (!isFound)
                        continue;
                    // Special process temperature inside
                    if (f !== null && device.HssType == "HM-CC-TC") {
                        newDevices[idDev] = {
                                    "Interface": device.Interface,
                                    "HssType":   device.HssType,
                                    "Address":   device.Interface + "." + device.Address,
                                    "Name":      device.Name
                            };
                    }
                    else {
                        for (var chn in device.Channels) {
                            var idChn   = device["Channels"][chn];
                            var channel = homematic.regaObjects[idChn];       
                            
                            if (channel["HssType"] !== undefined && channel["HssType"] == "MAINTENANCE")
                                continue;
                                
                            if (isWithDPs) {
                                var iPnts = 0;
                                var newPoints = new Object ();
                            
                                for (var dp in channel["DPs"]) {
                                    var idPnt = channel["DPs"][dp];
                                    var point = homematic.regaObjects[idPnt];                        
                                    var name = this._convertName(point.Name);
                                    if (f == null) {
                                        newPoints [idPnt] = point;
                                        newPoints [idPnt]["Type"] = dp;
                                        iPnts++;
                                    }
                                    else {
                                        for (var t = 0; t < f.length; t++) {
                                            if (name.indexOf (f[t]) != -1) {
                                                newPoints [idPnt] = point;
                                                newPoints [idPnt]["Type"] = dp;
                                                iPnts++;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (iPnts > 0) {
                                    if (iPnts == 1) {
                                        for (var idPnt in newPoints) {
                                            newDevices[idPnt] = {
                                                "Interface": device.Interface,
                                                "HssType":   device.HssType,
                                                "Address":   newPoints[idPnt]["Name"],
                                                "Name":      channel["Name"],
                                                cnt:         0,
                                                Channels:    null
                                            };
                                            break;
                                        }
                                        iPnts = 0;
                                    }  
                                    else {
                                        newDevices[idChn] = {
                                                "Interface": device.Interface,
                                                "HssType":   device.HssType,
                                                "Address":   device.Interface+"."+channel.Address,
                                                "Name":      channel["Name"]
                                        };
                                        newDevices[idChn].cnt = iPnts;                                        
                                        newDevices[idChn].Channels = [];
                                        for (var idPnt in newPoints) {
                                            newDevices[idChn].Channels[idPnt] = {'Name': newPoints[idPnt]["Type"], 'Address': newPoints[idPnt]["Name"]};
                                        }                                      
                                    }                                    
                                }
                            }
                            else {
                                newDevices[idChn] = {
                                        "Interface": device["Interface"],
                                        "HssType":   device["HssType"],
                                        "Address":   device["Interface"]+"."+channel["Address"],
                                        "Name":      channel["Name"]
                                };
                            }
                        }
                    }
                }
                
                this._devices = newDevices;
            }
        }
        
        // Fill the locations and functions toolbar
        if (1) {
            $("#hmSelectFilter").html ("");
            
            // Fill the locations toolbar
            var text = dui.translate('Rooms')+":&nbsp;<select id='hmSelectLocations'>";
                text += "<option value=''>"+dui.translate('All')+"</option>";
            for (var room in rooms) {
                var selected = "";
                if (hmSelect._filterLoc == homematic.regaObjects[rooms[room]]["Name"]) {
                    selected = " selected ";
                }                
                text += "<option value='"+homematic.regaObjects[rooms[room]]["Name"]+"' "+selected+">"+homematic.regaObjects[rooms[room]]["Name"]+"</option>";
            }
            text += "</select>&nbsp;&nbsp;";
            
            // Fill the functions toolbar
            text += dui.translate('Functions')+":&nbsp;<select id='hmSelectFunctions'>";
            text += "<option value=''>"+dui.translate('All')+"</option>";
            for (var func in functions) {
                var selected = "";
                if (hmSelect._filterFunc == homematic.regaObjects[functions[func]]["Name"]) {
                    selected = " selected ";
                }                
                text += "<option value='"+homematic.regaObjects[functions[func]]["Name"]+"' "+selected+">"+homematic.regaObjects[functions[func]]["Name"]+"</option>";
            }
            text += "</select>\n";
            if (filter != "all" || devFilter != null || devFilter != "") {
                text += dui.translate ("Disable device filter:") + "<input type='checkbox' id='hmSelectIgnoreFilter' "+ (this._ignoreFilter ? "checked" : "") +">";
            }
            $("#hmSelectFilter").append (text);
            
            // Ignore filter switch
            $("#hmSelectIgnoreFilter").change (function () {
                hmSelect._ignoreFilter = !hmSelect._ignoreFilter;
                hmSelect._devices    = null;
                $('#hmSelect').remove();
                hmSelect.show (hmSelect._homematic,  hmSelect._userArg, hmSelect._onsuccess, hmSelect.myFilter, hmSelect.myDevFilter);
            });
            
            
            $("#hmSelectLocations").change (function () {
                // toggle state
                if (hmSelect._filterLoc != $(this).val()) {                       
                    hmSelect._filterLoc = $(this).val();
                    hmSelect._filterDevsApply ();
                }
            });
            $("#hmSelectFunctions").change (function () {
                // toggle state
                if (hmSelect._filterFunc != $(this).val()) {                       
                    hmSelect._filterFunc = $(this).val();
                    hmSelect._filterDevsApply ();
                }
            });
            if (hmSelect._filterLoc != "") {
                hmSelect._filterDevsApply ();
            }
            if (hmSelect._filterFunc != "") {
                hmSelect._filterDevsApply ();
            }    
        }
    
        var selectedId = null;
                
        // Build the data tree together
		if (this.mydata == null) {
            this.mydata = new Array ();
		    var i = 0;
            
            // Calculate leafs
			for (var dev in this._devices) {
                if (this._devices[dev].cnt != undefined)
                    break;
                    
                var iCnt = 0;
                for (var chn in this._devices[dev].Channels) {
                    iCnt++;
                    var iDps = 0;
                    for (var dp in this._devices[dev].Channels[chn].DPs) {
                        iDps++;
                        break;
                    }
                    this._devices[dev].Channels[chn].cnt = iDps;
                }
                this._devices[dev].cnt = iCnt;
            }            
                       
			// Add all elements
			for(var dev in this._devices) {
				// Try to find room
				if (this._devices[dev].room === undefined || this._devices[dev].room === null) {
					var arr = new Object ();
					this._devices[dev].room = hmSelect._getRoom (homematic, dev, false);
				}
                
                // Try to find function
				if (this._devices[dev].func === undefined || this._devices[dev].func === null) {
					var arr = new Object ();
					this._devices[dev].func = hmSelect._getFunction (homematic, dev, false);
				}
			
				this.mydata[i] = {
					id:          ""+(i+1), 
					"Image":     "<img src='"+this._getImage(this._devices[dev].HssType)+"' width=25 height=25 />",
					"Location":  this._devices[dev].room,
					"Interface": this._devices[dev].Interface,
					"Type":      this._devices[dev].HssType,
					"Function":  this._devices[dev].func,
					"Address":   this._devices[dev].Address,
					"Name":      this._convertName(this._devices[dev].Name),
                    "_ID":       dev,
					isLeaf:      (this._devices[dev].cnt !== undefined && this._devices[dev].cnt > 0) ? false : true,
					level:       "0",
					parent:      "null",
					expanded:   false, 
					loaded:     true
				};
				if (hmSelect.value && this.mydata[i]["_ID"] == hmSelect.value) {
					selectedId = this.mydata[i].id;
				}
				var _parent = this.mydata[i].id;
				i++;
				for (var chn in this._devices[dev].Channels) {
					var channel = this._devices[dev].Channels[chn];
					this.mydata[i] = {
						id:          ""+(i+1), 
						"Image":     "",//"<img src='"+this._getImage(channel.HssType)+"' width=25 height=25 />",
						"Location":  channel.room,
						"Interface": this._devices[dev].Interface,
						"Type":      channel.HssType,
						"Function":  channel.func,
						"Address":   channel.Address,
						"Name":      this._convertName(channel.Name),
					    "_ID":       chn,
						isLeaf:      (channel.cnt !== undefined && channel.cnt > 0) ? false : true,
						level:       "1",
						parent:      _parent,
						expanded:    false, 
						loaded:      true
					};
					if (hmSelect.value && this.mydata[i]["_ID"] == hmSelect.value) {
						selectedId = this.mydata[i].id;
					}
					var parent1 = this.mydata[i].id;
					i++;
					for (var dp in channel.DPs)	{	
						var point = channel.DPs[dp];
						this.mydata[i] = {
							id:          ""+(i+1), 
							"Image":     "",
							"Location":  channel.room,
							"Interface": this._devices[dev].Interface,
							"Type":      point.ValueUnit,
							"Function":  channel.func,
							"Address":   this._convertName(point.Name),
							"Name":      point.Type,
                            "_ID":       dp,
							isLeaf:      true,
							level:       "2",
							parent:      parent1,
							expanded:    false, 
							loaded:      true
						};
						if (hmSelect.value && this.mydata[i]["_ID"] == hmSelect.value) {
							selectedId = this.mydata[i].id;
						}
						i++;
					}
				}				
			}
		}
        else if (hmSelect.value != null && hmSelect.value != "") {
            // Just find the selected element
            for (var i = 0; i < this.mydata.length; i++) {
                if (this.mydata[i]["_ID"] == hmSelect.value) {
					selectedId = this.mydata[i].id;
                    break;
				}
            }
        }
        
        // Create the grid
		$("#hmDevsContent").jqGrid({
			datatype:    "jsonstring",
			datastr:     this.mydata,
			height:      $('#tabs-devs').height() - 35 - $('#hmSelectFilter').height (),
			autowidth:   true,
			shrinkToFit: false,
			colNames:['Id', dui.translate ('Name'), '', dui.translate ('Location'), dui.translate ('Interface'), dui.translate ('Type'), dui.translate ('Function'), dui.translate ('Address'), ''],
			colModel:[
                {name:'id',       index:'id',        width:1,   hidden:true, key:true},
				{name:'Name',     index:'Name',      width:250, sortable:"text"},
				{name:'Image',    index:'Image',     width:22,  sortable:false, align:"right", search: false},
				{name:'Location', index:'Location',  width:110, sorttype:"text", search: false},
				{name:'Interface',index:'Interface', width:80,  sorttype:"text"},
				{name:'Type',     index:'Type',      width:120, sorttype:"text"},		
				{name:'Function', index:'Function',  width:120, hidden:true, search: false, sorttype:"text"},		
				{name:'Address',  index:'Address',   width:220, sorttype:"text"},
				{name:'_ID',      index:'_ID',       width:0,   hidden:true}
			],
			onSelectRow: function(id) {
				value    = $("#hmDevsContent").jqGrid ('getCell', id, '_ID');
                valueObj = (value != "" && value != null) ? hmSelect._devices[value] :null;

				if (value != null && value != "") {
					$(":button:contains('"+hmSelect._selectText+"')").prop("disabled", false).removeClass("ui-state-disabled");
				}
			},
			
			sortname: 'id',
			multiselect: false,
			gridview: true,
			scrollrows : true,
            treeGrid: true,
            treeGridModel: 'adjacency',
            treedatatype: "local",
            ExpandColumn: 'Name',
			ExpandColClick: true, 
			pgbuttons: true,
			viewrecords: true,
			jsonReader: {
				repeatitems: false,
				root: function (obj) { return obj; },
				page: function (obj) { return 1; },
				total: function (obj) { return 1; },
				records: function (obj) { return obj.length; }
			}
		});
        // Add the filter column
		$("#hmDevsContent").jqGrid('filterToolbar',{searchOperators : false,
			beforeSearch: function () {
				var searchData = jQuery.parseJSON(this.p.postData.filters);
                hmSelect._filter = searchData;
                hmSelect._filterDevsApply ();
			}
		});
        // Select current element
		if (selectedId != null) {
			$("#hmDevsContent").setSelection(selectedId, true);
			$("#"+$("#hmDevsContent").jqGrid('getGridParam','selrow')).focus();
		}	
		// Show dialog
		$('#hmSelect').dialog("open");
        // Increase dialog because of bug in jqGrid
		$('#hmSelect').dialog("option", "width", 900);
		// Disable "Select" button if nothing selected
		if (selectedId == null)	{
			$(":button:contains('"+this._selectText+"')").prop("disabled", true).addClass("ui-state-disabled");
		}
        // Filter items with last filter
        this._filterDevsApply ();
   },
    _onResize: function () {
        $('#hmSelect_tabs').width ($('#hmSelect').width()    - 30);
        $('#hmSelect_tabs').height ($('#hmSelect').height()  - 12);
        $('#hmSelectFilter').width ($('#tabs-devs').width()  - 6);
        
        $('#tabs-devs').width  ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-devs').height ($('#hmSelect_tabs').height() - 60);
        $('#tabs-vars').width  ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-vars').height ($('#hmSelect_tabs').height() - 60);
        $('#tabs-progs').width ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-progs').height($('#hmSelect_tabs').height() - 60);
        
        $("#hmDevsContent").setGridWidth  ($('#tabs-devs').width()   - 6);
        $("#hmDevsContent").setGridHeight ($('#tabs-devs').height()  - 35 - $('#hmSelectFilter').height ());
        $("#hmVarsContent").setGridWidth  ($('#tabs-vars').width()   - 6);
        $("#hmVarsContent").setGridHeight  ($('#tabs-vars').height() - 35);
        $("#hmProgsContent").setGridWidth ($('#tabs-progs').width()  - 6);
        $("#hmProgsContent").setGridHeight($('#tabs-progs').height() - 35);
    },
    show: function (homematic, userArg, onSuccess, filter, devFilter) { // onsuccess (userArg, value, valueObj)  
        this._onsuccess = onSuccess;
        this._userArg   = userArg;
        this._homematic = homematic;
        // points filter, e.g. 'WORKING' or 'STATE,TEMPERATURE,HUMIDITY'
        if (filter == undefined || filter == null || filter == "") {           
            filter = 'all';
        }
            
		_userArg = userArg || null;
		_onsuccess = onSuccess || null;
		if (!document.getElementById ("hmSelect")) {
			$("body").append("<div class='dialog' id='hmSelect' title='" + dui.translate ("Select HM parameter") + "'></div>");
            var text = "<div id='hmSelect_tabs'>";
            text += "  <ul>";
            var i = 0;
            if (devFilter == undefined || this._ignoreFilter) {
                if (filter == 'all' || this._ignoreFilter || (filter != 'variables' && filter != 'programs')) {           
                    text += "    <li><a href='#tabs-devs'  id='dev_select'>Devices</a></li>";
                }
                if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'variables'))) {           
                    text += "    <li><a href='#tabs-vars'  id='var_select'>Variables</a></li>";
                }
                if (this._ignoreFilter || (devFilter == undefined && ( filter == 'all' || filter == 'programs'))) {           
                    text += "    <li><a href='#tabs-progs' id='prog_select'>Functions</a></li>";
                }
                text += "  </ul>";
            }
            if (this._ignoreFilter || filter == 'all' || (filter != 'variables' && filter != 'programs')) {           
                text += "  <div id='tabs-devs' style='padding: 3px'></div>";
            }
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'variables'))) {           
                text += "  <div id='tabs-vars' style='padding: 3px'></div>";
            }
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'programs'))) {       
                text += "  <div id='tabs-progs' style='padding: 3px'></div>";
            }            
            text += "</div>";
            $("#hmSelect").append(text);
            if (filter == 'all' || this._ignoreFilter || (filter != 'variables' && filter != 'programs')) {           
                $("#tabs-devs").append  ("<table id='hmDevsContent'></table>");     
            }                
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'variables'))) {           
                $("#tabs-vars").append  ("<table id='hmVarsContent'></table>");        
            }
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'programs'))) {       
                 $("#tabs-progs").append ("<table id='hmProgsContent'></table>");      
            }            
            
            if (filter == 'all' || this._ignoreFilter || (filter != 'variables' && filter != 'programs')) {           
                $('#tabs-devs').prepend ("<div id='hmSelectFilter' class='ui-state-highlight'></div>");
                $('#tabs-devs').prepend ("<p id='dashui-waitico'>Please wait...</p>");
            } else if (filter == 'variables') {
                $('#tabs-vars').prepend ("<p id='dashui-waitico'>Please wait...</p>");
            } else {
                $('#tabs-progs').prepend ("<p id='dashui-waitico'>Please wait...</p>");
            }

            if (filter == 'all' || this._ignoreFilter || (filter != 'variables' && filter != 'programs')) {           
                $('#dev_select').click (function (e) {
                    var w = $('#hmSelect').dialog ("option", "width");
                    $('#hmSelect').dialog("option", "width", w-50);
                    $('#hmSelect').dialog("option", "width", w);
                    //hmSelect._onResize ();
                });
            }
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'variables'))) {           
                $('#var_select').click (function (e) {
                    hmSelect._buildVarsGrid (homematic);
                });
            }
            if (this._ignoreFilter || (devFilter == undefined && (filter == 'all' || filter == 'programs'))) {       
                $('#prog_select').click (function (e) {
                    hmSelect._buildProgsGrid (homematic);
                });
            }
		}
        $("#hmSelect_tabs").tabs();
        
        // Define dialog buttons
		this._selectText = dui.translate ("Select");
		this._cancelText = dui.translate ("Cancel");
        
		var dialog_buttons = {}; 
		dialog_buttons[this._selectText] = function() { 
			$( this ).dialog( "close" ); 
			if (_onsuccess)
				_onsuccess (_userArg, value, valueObj);
		}
		dialog_buttons[this._cancelText] = function() {
			$( this ).dialog( "close" ); 
		}   
		
		$('#hmSelect')
		.dialog({
			resizable: true,
			height: $(window).height(),
			modal: true,
			width: 870,
			resize: function(event, ui) { 
                hmSelect._onResize ();
			},
            close: function(event, ui) { $('#hmSelect').remove(); $('#hmDevsContent').jqGrid('GridUnload'); },
			buttons: dialog_buttons
		});
        $('#dashui-waitico').show().css({top: ($("#hmSelect").height() + $('#dashui-waitico').height())/2});
        $('#dashui-waitico').hide();
        $('#hmSelect_tabs').width  ($('#hmSelect').width());
        $('#hmSelect_tabs').height ($('#hmSelect').height()  - 12);
        
        $('#tabs-devs').width  ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-devs').height ($('#hmSelect_tabs').height() - 60);
        $('#tabs-vars').width  ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-vars').height ($('#hmSelect_tabs').height() - 60);
        $('#tabs-progs').width ($('#hmSelect_tabs').width()  - 6);
        $('#tabs-progs').height($('#hmSelect_tabs').height() - 60);
        
        this._buildDevicesGrid (homematic, filter, devFilter);
        if (this.value != null && homematic.regaObjects[this.value] != null) {
            if (homematic.regaObjects[this.value]["TypeName"] != undefined && homematic.regaObjects[this.value]["TypeName"] == "VARDP") {
                $('#var_select').trigger("click");
            } else if (homematic.regaObjects[this.value]["TypeName"] != undefined && homematic.regaObjects[this.value]["TypeName"] == "PROGRAM") {
                $('#prog_select').trigger("click");
            }
        }
	},
    _filterDevsApply: function () {
        // Custom filter
        var rows = $("#hmDevsContent").jqGrid('getGridParam', 'data');
        if (rows) {
            for (var i = 0; i < rows.length; i++) {
                var isShow = true;
                if (rows[i].level!="0")
                    continue;
                if (hmSelect._filter != null) {
                    for (var j = 0; j < hmSelect._filter.rules.length; j++) {
                        if (rows[i][hmSelect._filter.rules[j].field].indexOf (hmSelect._filter.rules[j].data) == -1) {
                            isShow = false;
                            break;
                        }
                    }
                }
                if (isShow && hmSelect._filterLoc != "" && rows[i]['Location'].indexOf (hmSelect._filterLoc) == -1) {
                    isShow = false;
                }
                if (isShow && hmSelect._filterFunc != "" && rows[i]['Function'].indexOf (hmSelect._filterFunc) == -1) {
                    isShow = false;
                }            
                $("#"+rows[i].id,"#hmDevsContent").css({display: (isShow) ? "":"none"});
            }
        }
    },
    _filterProgsApply: function () {
        // Custom filter
        var rows = $("#hmProgsContent").jqGrid('getGridParam', 'data');
        for (var i = 0; i < rows.length; i++) {
            var isShow = true;
            if (rows[i].level!="0")
                continue;
            if (hmSelect._progsFilter != null) {
                for (var j = 0; j < hmSelect._progsFilter.rules.length; j++) {
                    if (rows[i][hmSelect._progsFilter.rules[j].field].indexOf (hmSelect._progsFilter.rules[j].data) == -1) {
                        isShow = false;
                        break;
                    }
                }
            }
       
            $("#"+rows[i].id,"#hmProgsContent").css({display: (isShow) ? "":"none"});
        }
    },
    _filterVarsApply: function () {
        // Custom filter
        var rows = $("#hmVarsContent").jqGrid('getGridParam', 'data');
        for (var i = 0; i < rows.length; i++) {
            var isShow = true;
            if (rows[i].level!="0")
                continue;
            if (hmSelect._varsFilter != null) {
                for (var j = 0; j < hmSelect._varsFilter.rules.length; j++) {
                    if (rows[i][hmSelect._varsFilter.rules[j].field].indexOf (hmSelect._varsFilter.rules[j].data) == -1) {
                        isShow = false;
                        break;
                    }
                }
            }
       
            $("#"+rows[i].id,"#hmVarsContent").css({display: (isShow) ? "":"none"});
        }
    }
};

