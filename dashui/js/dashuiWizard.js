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
 // duiEdit - the DashUI Editor Wizard

dui = $.extend(true, dui, {
	hm2Widget: {
		'tplHqButton' : ['HM-LC-Sw1-Pl', 'HM-LC-Sw1-FM']
	},
	hmDeviceToWidget: function (device) {
		for (var w in hm2Widget) {
			for (var j = 0; j < hm2Widget[w].length; j++) {
				if (hm2Widget[w][j] == device) {
					return w;
				}
			}
		}
	},
	wizardRun: function () {
		
	},
	fillWizard: function () {
		var elems = homematic.regaIndex['ENUM_ROOMS'];// IDs of all ROOMS
		var jSelect = $('#wizard_rooms').html("").addClass('dashui-edit-select');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+homematic.regaObjects[elems[r]]["Name"]+"</option>\n");
		}
		elems = homematic.regaIndex['ENUM_FUNCTIONS'];// IDs of all ROOMS
		jSelect = $('#wizard_funcs').html("").addClass('dashui-edit-select');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+homematic.regaObjects[elems[r]]["Name"]+"</option>\n");
		}
		jSelect = $('#wizard_widgets').html("").addClass('dashui-edit-select');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in dui.hm2Widget) {
			for (var i = 0; i < dui.widgetSets.length; i++) {
				var name = dui.widgetSets[i].name || dui.widgetSets[i];
				$(".dashui-tpl[data-dashui-set='" + name + "']").each(function () {
					if (r == $(this).attr("id")) {
						$('#wizard_widgets').append("<option value='"+$(this).attr("id")+"'>"+$(this).attr("data-dashui-name")+"</option>\n");
					}
				});	
			}
		}
		$('#wizard_run').button().click (dui.wizardRun());
	}
});
