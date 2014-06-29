/*
LCARS Framework jQuery Plugin v2.0
Requires Jquery 1.4.*
@author: Josh Messer
@date: 1.26.2011
*/
if (typeof jQuery != 'undefined') {  // here we check if jquery is set (aka loaded onto page)

(function($) {
  $.lcars = function(options) { // set defaults
	var defaults = {
		screen: 'full', // Screen Types = Full, Panel, Split, Mobile
		title: '',
		subTitle: '',
		colors: { // defind your colors
			color1: 'orange',
			color2: 'pink'
		},
		content: {
			padding: '0', // padding: top, right, bottom, left
			ele: '#content' // define the element for your main content area
		},
		sidePanel: '#side-panel', // define the element for your side buttons
		upperContent: '#upper-content', // define the upper content area (only in Split screens)
		css: 'widgets/lcars/css/',
		debug: false
	};
	var options = $.extend(defaults, options);
	
	// ALL BELOW HERE UNTILL LINE IS FOR DEBUGGING!!!
	if(options.debug == true){
		$('body').prepend(
			'<div class="lcars-debug"><pre></pre></div>'+
			'<a class="lcars-debug" href="#" onclick="$(\'div.lcars-debug\').toggle();return false;">Show / Hide Debug</a>'
		);
		$('a.lcars-debug').css({
			'display':'block'
		});
	}
	
	_log("info", "LCARS-> LCARS Framework jQuery Plugin v2.0 Developed by Josh Messer.<br>------> Last Date modified was 1.26.2011<br>----------|Begin Debugging|----------");
    _log("log", "LCARS-> Jquery found!");
// ==========================================================================================================================================================================================	
	// Prepend are stylesheet to the document
	$('head').prepend('<link rel="stylesheet" href="'+options.css+'jquery.lcars.css" />');
	_log('log', 'LCARS-> Stylesheet has been prepend to page.');
	
	// below we check the color options and set the if they're using keywords (EX: orange = #ff9900)
	if( options.colors.color1.search('\#') == -1){
		options.colors.color1 = lcars_colors(options.colors.color1);
	}
	if( options.colors.color2.search('\#') == -1){
		options.colors.color2 = lcars_colors(options.colors.color2);
	}
	
	_log("log", "LCARS-> Completed color check. Color1="+options.colors.color1+", Color2="+options.colors.color2); // announce the completion of the color check
	_log("log", "LCARS-> Detected desired screen type => ["+options.screen+"]"); // tell the user there chosen screen type
// ==========================================================================================================================================================================================
// all below is for the FULL screen type
		if(options.screen == 'full'){
			// ------------------------------------------- we will append and prepend the signature LCARS lines
			$('body').prepend('<div class="line-top" style="background-color:'+options.colors.color1+';margin-bottom:-3px;"></div>').append('<div style="clear:both"></div><div class="line-bottom" style="background-color:'+options.colors.color2+';"></div>');
			if( $(options.upperContent).length != 0){ // here we hide the side panel (if we find it)
				$(options.upperContent).remove();
				_log('warning', 'LCARS-> The Upper Content Element has been removed!<br>------> Not needed for panel screen');
			}else{
				_log('warning','LCARS-> The Element for Upper Content can not be found!<br>------> Not needed for panel screen');
			}
			if( $(options.content.ele).length != 0){ // here we detect if the content area requested does exist
				$(options.content.ele).addClass('content'); // we add the content class (for styling)
				var winHeight = $(window).height() - 51;
				var winWidth = $(window).width() - 110;
				$(options.content.ele).css({'height':winHeight+'px', 'width':winWidth+'px'}); // morph the content area to fill the whole screen
				if(options.content.padding != 0){ // detect if the user wants padding inside the content area
					$(options.content.ele).wrapInner('<div></div>').find('div').css('padding',options.content.padding); // add the needed padding
					_log("warning", "LCARS-> Added content padding of "+options.content.padding);
				}
					_log("log", "LCARS-> Content Element found and morphed to fit screen size.");
			}else{
				_log("error", "LCARS-> Content Element does not exist! ["+options.content.ele+"]");
			}
			
			// This is where we check what element has been asigned to be the Side Panel. It much be a list
			if( $(options.sidePanel).length == 0){
				_log('error','LCARS-> The Element for Side Panel can not be found! ['+options.screen+']');
			}
			var SidePanelType = $(options.sidePanel).get(0).tagName;
			if( SidePanelType == 'UL' || SidePanelType == 'OL' ){
				var sidePanel = $(options.sidePanel); // put side panel in variable
				sidePanel.addClass('side-panel'); // add the class
				var _li = sidePanel.find('li').length; // get LI number
				if( _li < 6){ // if the user defines less then 6 links
					var u = 6 - _li;
					var i = 1;
					for (i=1;i<=u;i++){
					var ran = getRandom(100,999);
					sidePanel.append('<li>' + ran + '</li>'); //Create list items with random number as title
					}
				}else{ var u = 0; }
				
				var _li_height = Math.round( (winHeight / 8) - 1); // get the required height for side items
				var _li_height_last = (_li_height * 3) - 4; // get required height for last side item
				sidePanel.find('li').height(_li_height).wrapInner('<span style="padding-right:2px"></span>'); // wrap a span within side items for padding
				sidePanel.find('li:last').height(_li_height_last).css('border-bottom','none'); // give last item correct height and remove border
				sidePanel.find('li:even').css('background-color',options.colors.color1); // even items are color 1
				sidePanel.find('li:odd').css('background-color',options.colors.color2); // odd items are color 2
				sidePanel.find('li:first').wrapInner('<div></div>').find('div').css('line-height',( (_li_height * 2) - 20 )+'px'); // move the link title to the bottom of the square
				
				_log('log', 'LCARS-> Side Panel is a list of type ['+SidePanelType+'] with '+_li+' link(s).<br>------> The System added '+u+' link(s) to the Side Panel.'); // Log these actions
				
			}else{
				_log('error', 'LCARS-> Side Panel must be a list [OL] or [UL] it is currently a ['+SidePanelType+']');
			}
		} // end of Full Screen Style
// ==========================================================================================================================================================================================
		else if(options.screen == 'panel'){ // start Panel Screen Style
			
			if( options.title!='' || options.subTitle!='' ){
				$('body').prepend(
				'<div class="lcars-title" style="background-color:'+options.colors.color1+';">'+
				'<h1>'+options.title+'</h1>'+
				'</div>'
				);
				$('body').append(
				'<div class="lcars-subTitle" style="background-color:'+options.colors.color2+';">'+
				'<h2>'+options.subTitle+'</h2>'+
				'</div>'
				);
			}else{
				_log('error','LCARS-> You must have a Title and Sub Title for the Panel Screen!');
			}
			
			if( $(options.sidePanel).length != 0){ // here we hide the side panel (if we find it)
				$(options.sidePanel).remove();
				_log('warning', 'LCARS-> The Side Panel Element has been removed!<br>------> Not needed for panel screen');
			}else{
				_log('warning','LCARS-> The Element for Side Panel can not be found!<br>------> Not needed for panel screen');
			}
			if( $(options.upperContent).length != 0){ // here we hide the side panel (if we find it)
				$(options.upperContent).remove();
				_log('warning', 'LCARS-> The Upper Content Element has been removed!<br>------> Not needed for panel screen');
			}else{
				_log('warning','LCARS-> The Element for Upper Content can not be found!<br>------> Not needed for panel screen');
			}
			
			if( $(options.content.ele).length != 0){ // here we detect if the content area requested does exist
				$(options.content.ele).addClass('content'); // we add the content class (for styling)
				var winHeight = $(window).height() - 100;
				var winWidth = $(window).width();
				$(options.content.ele).css({'height':winHeight+'px', 'width':winWidth+'px'}); // morph the content area to fill the whole screen
				if(options.content.padding != 0){ // detect if the user wants padding inside the content area
					$(options.content.ele).wrapInner('<div></div>').find('div').css('padding',options.content.padding); // add the needed padding
					_log("warning", "LCARS-> Added content padding of "+options.content.padding);
				}
					_log("log", "LCARS-> Content Element found and morphed to fit screen size.");
			}else{
				_log("error", "LCARS-> Content Element does not exist! ["+options.content.ele+"]");
			}
		} // end of Panel Screen Style
// ==========================================================================================================================================================================================		
		else if(options.screen == 'split'){ // start Split Screen Style
			// Get height / width of window
			var winHeight = $(window).height();
			var winWidth = $(window).width();
			
			// This is where we check what element has been asigned to be the Side Panel. It much be a list
			if( $(options.sidePanel).length == 0){
				_log('error','LCARS-> The Element for Side Panel can not be found! ['+options.screen+']');
			}
			var SidePanelType = $(options.sidePanel).get(0).tagName;
			if( SidePanelType == 'UL' || SidePanelType == 'OL' ){
				var sidePanel = $(options.sidePanel); // put side panel in variable
				sidePanel.addClass('side-panel'); // add the class
				var _li = sidePanel.find('li').length; // get LI number
				if( _li < 6){ // if the user defines less then 6 links
					var u = 6 - _li;
					var i = 1;
					for (i=1;i<=u;i++){
					var ran = getRandom(100,999);
					sidePanel.append('<li>' + ran + '</li>'); //Create list items with random number as title
					}
				}else{ var u = 0; }
				
				var _li_height = Math.round( (winHeight / 8) - 1); // get the required height for side items
				var _li_height_last = (_li_height / 2) + (_li_height * 2) + 5; // get required height for last side item
				sidePanel.find('li').height(_li_height).wrapInner('<span style="padding-right:2px"></span>'); // wrap a span within side items for padding
				sidePanel.find('li:last').height(_li_height_last).css('border-bottom','none'); // give last item correct height and remove border
				sidePanel.find('li:even').css('background-color',options.colors.color1); // even items are color 1
				sidePanel.find('li:odd').css('background-color',options.colors.color2); // odd items are color 2
				// move the link title to the bottom of the square
				sidePanel.find('li:first').height( (_li_height / 2) + _li_height ).wrapInner('<div></div>').find('div').css('line-height',( _li_height * 2)+(_li_height / 2)+25+'px');
				// make this sorter and add spacing at bottom
				sidePanel.find('li:nth-child(2)').css('margin-bottom','45px').height(_li_height / 2);
				sidePanel.find('li:nth-child(3)').wrapInner('<div></div>').find('div').css('line-height',( _li_height)+(_li_height / 2)+25+'px');
				
				_log('log', 'LCARS-> Side Panel is a list of type ['+SidePanelType+'] with '+_li+' link(s).<br>------> The System added '+u+' link(s) to the Side Panel.'); // Log these actions
				
			}else{
				_log('error', 'LCARS-> Side Panel must be a list [OL] or [UL] it is currently a ['+SidePanelType+']');
			}
		
			if( $(options.upperContent).length != 0 ){ // look for upper content area
				var upperContent = $(options.upperContent);
				upperContent.addClass('upper-content').height(_li_height * 2).width(winWidth - 110);
				upperContent.after('<div class="line-middle"><div class="top" style="background-color:'+options.colors.color2+';"></div><div class="bottom" style="background-color:'+options.colors.color1+';"></div></div>');
				$('div.line-middle').width(winWidth).css('top',( _li_height * 2) + 'px' );
				
				if(options.content.padding != 0){ // detect if the user wants padding inside the content area
					upperContent.wrapInner('<div></div>').find('div').css('padding',options.content.padding); // add the needed padding
					_log("warning", "LCARS-> Added Upper Content padding of "+options.content.padding);
				}
				
				_log('log', 'LCARS-> Upper Content Element found and morphed to fit screen size.');
			}else{
				_log('error', 'LCARS-> Upper Content Element does not exist! ['+options.upperContent+']');
			}
			
			if( $(options.content.ele).length != 0){ // here we detect if the content area requested does exist
				$(options.content.ele).addClass('content'); // we add the content class (for styling)
				$(options.content.ele).width(winWidth - 110).height( (_li_height * 3) + _li_height_last + 10 ).css('margin-top','45px'); // morph the content area to fill the whole screen
				if(options.content.padding != 0){ // detect if the user wants padding inside the content area
					$(options.content.ele).wrapInner('<div></div>').find('div').css('padding',options.content.padding); // add the needed padding
					_log("warning", "LCARS-> Added Content padding of "+options.content.padding);
				}
					_log("log", "LCARS-> Content Element found and morphed to fit screen size.");
			}else{
				_log("error", "LCARS-> Content Element does not exist! ["+options.content.ele+"]");
			}
		
		} // end of Split Screen Style
		
// fall back if Screen Style declared doesn't exist
// ==========================================================================================================================================================================================
		else{
			_log('error', 'LCARS-> The screen type declared does not exist!<br>------> The page might be rindered strangly.');
			return;
		}
		
	_log('info', '----------|Finish Debugging|----------');
	_log('log', '---| Debug system developed by Josh Messer.<br>---| Change the Debug option to <i>false</i> to remove.');
// ==========================================================================================================================================================================================
		function getRandom(min, max){		
		var randomNum = Math.random() * (max-min); 
		// Round to the closest integer and return it
		return(Math.round(randomNum) + min); 
		}
	}
// END OF LCARS SCREEN MANIPULATION BEGIN BUTTONS
// ==========================================================================================================================================================================================
 $.fn.lcarsButton = function(options) { // set defaults
	var defaults = {
		rounded: 'both', // accepts both, left, right, none
		extended: false, // this is true or false
		color: 'orange',
		subTitle: { // The sub title for your button
			direction: 'none', // left or right
			text: '' // the text for the sub title
		},
		blank: 'none', // blank button? left / right / none
		debug: false
	};
	var options = $.extend(defaults, options);
		if( options.debug == true){
			var debug_div = $('div.lcars-debug').length;
			if (debug_div == 0){
				$('body').prepend(
					'<div class="lcars-debug"><pre></pre></div>'+
					'<a class="lcars-debug" href="#" onclick="$(\'div.lcars-debug\').toggle();return false;">Show / Hide Debug</a>'
				);
				$('a.lcars-debug').css({
					'display':'block'
				});
			}
		}
// END DEBUGGING CHECK
		_button_log('info','LCARS-> Button System v1 Developed by Josh Messer<br>------>Last Date Modified 1.27.2011<br>--------|Begin Button Debugging|--------');
		
		// here we get the class for are rounded button
		var button_rounded = [];
		button_rounded["both"] = "RR";
		button_rounded["right"] = "SR";
		button_rounded["left"] = "RS";
		button_rounded['none'] = "";
		options.rounded = button_rounded[options.rounded];
		
		if( options.extended == true){
			var _extend = 'L';
		}else{
			var _extend = '';
		}
		
		var subtitle_dir = [];
		subtitle_dir['left'] = 'B_titleL';
		subtitle_dir['right'] = 'B_titleR';
		subtitle_dir['none'] = undefined;
		options.subTitle.direction = subtitle_dir[options.subTitle.direction];
		if( options.subTitle.text == undefined ){
			options.subTitle.text = '';
		}
		
		var blank_dir = [];
		blank_dir['none'] = undefined;
		blank_dir['left'] = 'B_blankL';
		blank_dir['right'] = 'B_blankR';
		options.blank = blank_dir[options.blank];
		
		
		this.each(function(){
			var _this = $(this);
		if(!_this.hasClass('button')){
			_button_log('log','LCARS-> System has added [button] class to ['+this.tagName+']');
			_this.addClass('button');
		}
		
		_this.addClass(options.rounded).addClass(_extend).css('background-color',lcars_colors(options.color));
		
		_button_log('log','LCARS-> Button has been morphed');
		
		if( options.subTitle.direction != '' || options.subTitle.direction != undefined ){
			_this.prepend('<span class="'+options.subTitle.direction+'" style="color:'+lcars_colors(options.color)+'">'+options.subTitle.text+'</span>');
			_button_log('log', 'LCARS-> Button Sub Title Added');
		}
		
			
		if( options.blank == '' || options.blank == undefined ){
		}else{
			if( _this.find('span').length >= 1){
				_this.removeClass(options.rounded).find('span').removeClass(options.subTitle.direction).addClass(options.blank).html('');
				_button_log('warning','LCARS-> Removed Sub Title from button to make it blank!<br>------> This is okay.');
			}
			if( _this.find('span').length == 0){
				_this.removeClass(options.rounded);
				_this.prepend('<span class="'+options.blank+'"></span>');
				_button_log('log','LCARS-> Made Button blank (offline).');
			}
			
			if(options.blank == 'B_blankL'){
				_this.addClass('RS');
			}
			if(options.blank == 'B_blankR'){
				_this.addClass('SR');
			}
		}
		
		});
		
		_button_log('info', '------|Finished Button Debugging|-------');
// debugger function for the buttons section
		function _button_log(type, message){
			if( options.debug == true){
				_log(type, message);
			}
		}
}

})(jQuery);

}else{
    _log("error", "LCARS-> Jquery has not been loaded!");
}

// Logging function
function _log(type, message){
		var _debugger = $('div.lcars-debug pre');
		if( type == 'log' ){
			var message = '<span style="background:transparent;color:black">'+message+'</span>';
			_debugger.append(message+'<br>');
		}
		else if( type == 'warning' ){
			var message = '<span style="background:orange;color:black;">'+message+'</span>';
			_debugger.append(message+'<br>');
		}
		else if( type == 'error' ){
			var message = '<span style="background:#f00;color:white;font-weight:bold;">'+message+'</span>';
			_debugger.append(message+'<br>');
		}
		else if( type == 'info' ){
			var message = '<span style="background:#99f;color:white;">'+message+'</span>';
			_debugger.append(message+'<br>');
		}
		else{
			_debugger.append('<span style="background:#f00;color:white;font-weight:bold;">Unknown!</span><br>');
		}
}

function lcars_colors(input_color){
	var lcars_colors = [];
	lcars_colors["orange"] = "#ff9900";
	lcars_colors["purple"] = "#cc99cc";
	lcars_colors["blue"] = "#9999ff";
	lcars_colors["lightBlue"] = "#9999cc";
	lcars_colors["red"] = "#cc0000";
	lcars_colors["lightRed"] = "#cc6666";
	lcars_colors["tan"] = "#ff9966";
	lcars_colors["lightTan"] = "#ffcc99";
	lcars_colors["pink"] = "#cc6699";
	lcars_colors["white"] = "#ccccff";
	color = lcars_colors[input_color];
	if(color == undefined){
		return input_color;
	}else{
		return color;
	}
}