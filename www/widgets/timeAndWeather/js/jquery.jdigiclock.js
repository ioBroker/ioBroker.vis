/*
 * jDigiClock plugin 2.1
 *
 * http://www.radoslavdimov.com/jquery-plugins/jquery-plugin-digiclock/
 *
 * Copyright (c) 2009 Radoslav Dimov
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
/* Changes for DahsUI *_container => *_cAntainer, because container is occuped */
var jdigiclockCounter = 0;

(function($) {
    $.fn.extend({
        jdigiclock: function(options) {

            var defaults = {
                clockImagesPath:     'images/clock/',
                weatherImagesPath:   'images/weather/',
                lang:                'en',
                am_pm:               false,
                weatherLocationCode: 'EUR|BG|BU002|BOURGAS',
                weatherMetric:       'C',
                weatherUpdate:       0,
                proxyType:           'yahoo',
                curID:               0
            };

            var regional = [];
            regional['en'] = {
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            };
            regional['de'] = {
                monthNames: ['Jan', 'Feb', 'M&auml;r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
                dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
            };
            regional['ru'] = {
                monthNames: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июня', 'Июля', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                dayNames: ['Вос', 'Пон', 'Вт', 'Ср', 'Чет', 'Пят', 'Суб']
            };


            var options = $.extend(defaults, options);
            options.curID = jdigiclockCounter++;
            var i = options.weatherLocationCode.indexOf('[');
            if (i != -1) {
                options.weatherLocationCode = options.weatherLocationCode.substring(i+1);
                i = options.weatherLocationCode.indexOf(']');
                options.weatherLocationCode = options.weatherLocationCode.substring(0, i);
            }

            return this.each(function() {
                
                var $this = $(this);
                var o = options;
                $this.o = o;
                $this.clockImagesPath = o.clockImagesPath;
                $this.weatherImagesPath = o.weatherImagesPath;
                $this.lang = regional[o.lang] == undefined ? regional['en'] : regional[o.lang];
				$this.lang.lang = o.lang;
                $this.am_pm = o.am_pm;
                $this.weatherLocationCode = o.weatherLocationCode;
                $this.weatherMetric = o.weatherMetric == 'C' ? 1 : 0;
                $this.weatherUpdate = o.weatherUpdate;
                $this.proxyType = o.proxyType;
                $this.currDate = '';
                $this.timeUpdate = '';


                var html = '<div id="plugin_cAntainer'+o.curID+'" class="dc_plugin_container">';
                html    += '<p id="left_arrow'+o.curID+'" class="dc_left_arrow"><img src="'+o.clockImagesPath+'../icon_left.png" /></p>';
                html    += '<p id="right_arrow'+o.curID+'" class="dc_right_arrow"><img src="'+o.clockImagesPath+'../icon_right.png" /></p>';
                html    += '<div id="digital_cAntainer'+o.curID+'" class="dc_digital_container">';
                html    += '<div id="clock'+o.curID+'" class="dc_clock"></div>';
                html    += '<div id="weather'+o.curID+'" class="dc_weather"></div>';
                html    += '</div>';
                html    += '<div id="forecast_cAntainer'+o.curID+'" class="dc_forecast_container"></div>';
                html    += '</div>';

                $this.html(html);

                $this.displayClock($this);

                $this.displayWeather($this);               

                var panel_pos = ($('#plugin_cAntainer'+o.curID+' > div').length - 1) * 500;
                var next = function() {
                    //$('#right_arrow').unbind('click', next);
                    $('#plugin_cAntainer' + this.o.curID + ' > div').filter(function(i) {
                        $(this).animate({'left': (i * 500) - 500 + 'px'}, 400, function() {
                            if (i == 0) {
                                $(this).appendTo('#plugin_cAntainer' + this.o.curID).css({'left':panel_pos + 'px'});
                            }
                            //$('#right_arrow').bind('click touchstart', next);
                        });                        
                    });
                };
                $('#right_arrow' + o.curID).bind('click touchstart', function (e) {
                    // Protect against two events
                    if (vis.detectBounce(this)) return;

                    next(e);
                });

                var prev = function() {
                    //$('#left_arrow').unbind('click', prev);
                    $('#plugin_cAntainer'+this.o.curID+' > div:last').prependTo('#plugin_cAntainer'+this.o.curID).css({'left':'-500px'});
                    $('#plugin_cAntainer'+this.o.curID+' > div').filter(function(i) {
                        $(this).animate({'left': i * 500 + 'px'}, 400, function() {
                            //$('#left_arrow').bind('click', prev);
                        });
                    });
                };
                document.getElementById ('left_arrow' + o.curID).o = o;
                document.getElementById ('right_arrow' + o.curID).o = o;
                document.getElementById ('digital_cAntainer' + o.curID).o = o;
                document.getElementById ('forecast_cAntainer' + o.curID).o = o;
                $('#left_arrow' + o.curID).bind('click touchstart', function (e) {
                    // Protect against two events
                    if (vis.detectBounce(this)) return;

                    prev(e);
                });
            });
        }
    });  

    $.fn.displayClock = function(el) {
        $.fn.getTime(el);
        setTimeout(function() {$.fn.displayClock(el)}, $.fn.delay());
    }

    $.fn.displayWeather = function(el) {
        $.fn.getWeather(el);
        if (el.weatherUpdate > 0) {
            setTimeout(function() {$.fn.displayWeather(el)}, (el.weatherUpdate * 60 * 1000));
        }
    }

    $.fn.delay = function() {
        var now = new Date();
        var delay = (60 - now.getSeconds()) * 1000;
        
        return delay;
    }

    $.fn.getTime = function(el) {
        var now = new Date();
        var old = new Date();
        old.setTime(now.getTime() - 60000);
        
        var now_hours, now_minutes, old_hours, old_minutes, timeOld = '';
        now_hours =  now.getHours();
        now_minutes = now.getMinutes();
        old_hours =  old.getHours();
        old_minutes = old.getMinutes();

        if (el.am_pm) {
            var am_pm = now_hours > 11 ? 'pm' : 'am';
            now_hours = ((now_hours > 12) ? now_hours - 12 : now_hours);
            old_hours = ((old_hours > 12) ? old_hours - 12 : old_hours);
        } 

        now_hours   = ((now_hours <  10) ? "0" : "") + now_hours;
        now_minutes = ((now_minutes <  10) ? "0" : "") + now_minutes;
        old_hours   = ((old_hours <  10) ? "0" : "") + old_hours;
        old_minutes = ((old_minutes <  10) ? "0" : "") + old_minutes;
        // date
        el.currDate = el.lang.dayNames[now.getDay()] + ',&nbsp;' + now.getDate() + '&nbsp;' + el.lang.monthNames[now.getMonth()];
        // time update
        el.timeUpdate = el.currDate + ',&nbsp;' + now_hours + ':' + now_minutes;

        var firstHourDigit = old_hours.substr(0,1);
        var secondHourDigit = old_hours.substr(1,1);
        var firstMinuteDigit = old_minutes.substr(0,1);
        var secondMinuteDigit = old_minutes.substr(1,1);
        
        timeOld += '<div id="hours'+el.o.curID+'" class="dc_hours"><div class="dc_line"></div>';
        timeOld += '<div id="hours_bg'+el.o.curID+'" class="dc_hours_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstHourDigit + '.png" id="fhd'+el.o.curID+'" class="dc_first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondHourDigit + '.png" id="shd'+el.o.curID+'" class="dc_second_digit" />';
        timeOld += '</div>';
        timeOld += '<div id="minutes'+el.o.curID+'" class="dc_minutes"><div class="dc_line"></div>';
        if (el.am_pm) {
            timeOld += '<div id="am_pm'+el.o.curID+'" class="dc_am_pm"><img src="' + el.clockImagesPath + am_pm + '.png" /></div>';
        }
        timeOld += '<div id="minutes_bg'+el.o.curID+'" class="dc_minutes_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstMinuteDigit + '.png" id="fmd'+el.o.curID+'" class="dc_first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondMinuteDigit + '.png" id="smd'+el.o.curID+'" class="dc_second_digit" />';
        timeOld += '</div>';

        el.find('#clock'+el.o.curID).html(timeOld);

        // set minutes
        if (secondMinuteDigit != '9') {
            firstMinuteDigit = firstMinuteDigit + '1';
        }

        if (old_minutes == '59') {
            firstMinuteDigit = '511';
        }

        setTimeout(function(el) {
            $('#fmd'+el.o.curID).attr('src', el.clockImagesPath + firstMinuteDigit + '-1.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200, el);
        setTimeout(function(el) { $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg3.png')},250,el);
        setTimeout(function(el) {
            $('#fmd'+el.o.curID).attr('src', el.clockImagesPath + firstMinuteDigit + '-2.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400, el);
        setTimeout(function(el) { $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg5.png')},450, el);
        setTimeout(function(el) {
            $('#fmd'+el.o.curID).attr('src', el.clockImagesPath + firstMinuteDigit + '-3.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600, el);

        setTimeout(function(el) {
            $('#smd'+el.o.curID).attr('src', el.clockImagesPath + secondMinuteDigit + '-1.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200, el);
        setTimeout(function(el) { $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg3.png')},250, el);
        setTimeout(function(el) {
            $('#smd'+el.o.curID).attr('src', el.clockImagesPath + secondMinuteDigit + '-2.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400, el);
        setTimeout(function(el) { $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg5.png')},450, el);
        setTimeout(function(el) {
            $('#smd'+el.o.curID).attr('src', el.clockImagesPath + secondMinuteDigit + '-3.png');
            $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600, el);

        setTimeout(function(el) {$('#fmd'+el.o.curID).attr('src', el.clockImagesPath + now_minutes.substr(0,1) + '.png')},800, el);
        setTimeout(function(el) {$('#smd'+el.o.curID).attr('src', el.clockImagesPath + now_minutes.substr(1,1) + '.png')},800, el);
        setTimeout(function(el) { $('#minutes_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg1.png')},850, el);

        // set hours
        if (now_minutes == '00') {
           
            if (el.am_pm) {
                if (now_hours == '00') {                   
                    firstHourDigit = firstHourDigit + '1';
                    now_hours = '12';
                } else if (now_hours == '01') {
                    firstHourDigit = '001';
                    secondHourDigit = '111';
                } else {
                    firstHourDigit = firstHourDigit + '1';
                }
            } else {
                if (now_hours != '10') {
                    firstHourDigit = firstHourDigit + '1';
                }

                if (now_hours == '20') {
                    firstHourDigit = '1';
                }

                if (now_hours == '00') {
                    firstHourDigit = firstHourDigit + '1';
                    secondHourDigit = secondHourDigit + '11';
                }
            }

            setTimeout(function(el) {
                $('#fhd'+el.o.curID).attr('src', el.clockImagesPath + firstHourDigit + '-1.png');
                $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200, el);
            setTimeout(function(el) { $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg3.png')},250, el);
            setTimeout(function(el) {
                $('#fhd'+el.o.curID).attr('src', el.clockImagesPath + firstHourDigit + '-2.png');
                $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400, el);
            setTimeout(function(el) { $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg5.png')},450, el);
            setTimeout(function(el) {
                $('#fhd'+el.o.curID).attr('src', el.clockImagesPath + firstHourDigit + '-3.png');
                $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600, el);

            setTimeout(function() {
            $('#shd'+el.o.curID).attr('src', el.clockImagesPath + secondHourDigit + '-1.png');
            $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200, el);
            setTimeout(function(el) { $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function(el) {
                $('#shd'+el.o.curID).attr('src', el.clockImagesPath + secondHourDigit + '-2.png');
                $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400, el);
            setTimeout(function(el) { $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function(el) {
                $('#shd'+el.o.curID).attr('src', el.clockImagesPath + secondHourDigit + '-3.png');
                $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600, el);

            setTimeout(function(el) {$('#fhd'+el.o.curID).attr('src', el.clockImagesPath + now_hours.substr(0,1) + '.png')},800, el);
            setTimeout(function(el) {$('#shd'+el.o.curID).attr('src', el.clockImagesPath + now_hours.substr(1,1) + '.png')},800, el);
            setTimeout(function(el) { $('#hours_bg'+el.o.curID+' img').attr('src', el.clockImagesPath + 'clockbg1.png')},850, el);
        }
    }

	$.fn.processAnswer = function(el, data) {
        var metric = el.weatherMetric == 1 ? 'C' : 'F';
		
		el.find('#weather'+el.o.curID+' .dc_loading, #forecast_cAntainer'+el.o.curID+' .dc_loading').hide();

		var curr_temp = '<p class="">' + data.curr_temp + '&deg;<span class="dc_metric">' + metric + '</span></p>';
		var curr_img0 = "";
		if (data.curr_icon.indexOf("http://") == -1)
            curr_img0 = el.weatherImagesPath + data.curr_icon + '.png';
		else
			curr_img0 = data.curr_icon;
		var weather = '<div id="local'+el.o.curID+'" class="dc_local"><p class="dc_city_main">' + data.city + '</p><p>' + data.curr_text + '</p></div>';
		weather += '<div id="temp'+el.o.curID+'" class="dc_temp"><p id="date'+el.o.curID+'" class="dc_date">' + el.currDate + '</p>' + curr_temp + '</div>';
		weather += '<img id="img0_'+el.o.curID+'" src="'+curr_img0+'" style="position: absolute; top: 20px; left: 160px; width: 333px; height: 240px">';
		el.find('#weather'+el.o.curID+'').html(weather);

		// forecast
		el.find('#forecast_cAntainer'+el.o.curID+'').append('<div id="current'+el.o.curID+'" class="dc_current" style="height:238px"></div>');
		curr_temp = curr_temp.replace ('class=""', 'class="dc_actual"');
		var curr_for = curr_temp + '<p class="dc_high_low">' + data.forecast[0].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[0].day_ltemp + '&deg;</p>';
		curr_for    += '<p class="dc_city">' + data.city + '</p>';
		curr_for    += '<p class="dc_text">' + data.forecast[0].day_text + '</p>';
		
		var curr_img = "";
		if (data.forecast[0].day_icon.indexOf("http://") == -1)
			curr_img = 'background: url(' + el.weatherImagesPath + data.forecast[0].day_icon + '.png) 50% 0 no-repeat';
		else
			curr_img = 'background: url('+data.forecast[0].day_icon + ') 100% 0 no-repeat; background-size: 80% auto';
		curr_for += '<div class="dc_image" style="'+curr_img+'"></div>';
		
		
		el.find('#current'+el.o.curID).append(curr_for);

		el.find('#forecast_cAntainer'+el.o.curID).append('<ul id="forecast'+el.o.curID+'" class="dc_forecast" style="position: absolute; top:238px"></ul>');
		data.forecast.shift();
		for (var i in data.forecast) {
			var d_date = new Date(data.forecast[i].day_date);
			var day_name = el.lang.dayNames[d_date.getDay()];
			var forecast = '<li>';
			forecast    += '<p>' + day_name + '</p>';
			forecast    += '<img src="';
			
			if (data.forecast[i].day_icon.indexOf("http://") == -1)
				forecast += el.weatherImagesPath + data.forecast[i].day_icon + '.png';
			else
				forecast += data.forecast[i].day_icon;
				
			forecast    += '" alt="' + data.forecast[i].day_text + '" title="' + data.forecast[i].day_text + '" />';
			forecast    += '<p>' + data.forecast[i].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[i].day_ltemp + '&deg;</p>';
			forecast    += '</li>';
			el.find('#forecast'+el.o.curID).append(forecast);
		}

		el.find('#forecast_cAntainer'+el.o.curID).append('<div id="update' + el.o.curID + '" class="dc_update" style="position: absolute; top:365px; left:200px"><img src="' + el.clockImagesPath + '../refresh_01.png" alt="reload" title="reload" id="reload' + el.o.curID + '" />' + el.timeUpdate + '</div>');

		$('#reload' + el.o.curID).on('click touchstart', function() {
            // Protect against two events
            if (vis.detectBounce(this)) return;

            el.find('#weather' + el.o.curID).html('');
			el.find('#forecast_cAntainer' + el.o.curID).html('');
			$.fn.getWeather(el);
		});
	}
	
	// Get time string as date
	$.fn._getTimeAsDate = function(t) {

		d = new Date();
		r = new Date(d.toDateString() +' '+ t);

		return r;
	};	
    $.fn.getWeather = function(el) {

        el.find('#weather'+el.o.curID).html('<p class="dc_loading">Update Weather ...</p>');
        el.find('#forecast_cAntainer'+el.o.curID).html('<p class="dc_loading">Update Weather ...</p>');
        var proxy = '';

			
        switch (el.proxyType) {
            case 'php':
                proxy = 'php/proxy.php';
                $.getJSON('lib/proxy/' + proxy + '?location=' + el.weatherLocationCode + '&metric=' + el.weatherMetric, function (data) {$.fn.processAnswer (el, data);});
				break;
            case 'asp':
                proxy = 'asp/WeatherProxy.aspx';
                $.getJSON('lib/proxy/' + proxy + '?location=' + el.weatherLocationCode + '&metric=' + el.weatherMetric, function (data) {$.fn.processAnswer (el, data);});
				break;
			case 'yahoo':
				var now = new Date();
			    // Create Yahoo Weather feed API address
				var query = "select * from weather.forecast where woeid in ('"+ el.weatherLocationCode +"') and u='"+ (el.weatherMetric ? 'c' : 'f') +"'";
				var api = 'http://query.yahooapis.com/v1/public/yql?q='+ encodeURIComponent(query) +'&rnd='+ now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';
				
				// Send request
				$.ajax({
					type:     'GET',
					url:      api,
					dataType: 'json',
					context:  el,
					success:  function(data) {
						if (data.query) {
							var modData = {};
							var feed = data.query.results.channel;
                            if (feed.item.forecast === undefined) {
                                return;
                            }
							var wf = feed.item.forecast[0];
							// Determine day or night image
							wpd = feed.item.pubDate;
							n = wpd.indexOf(":");
							tpb =  $.fn._getTimeAsDate(wpd.substr(n-2,8));
							tsr =  $.fn._getTimeAsDate(feed.astronomy.sunrise);
							tss =  $.fn._getTimeAsDate(feed.astronomy.sunset);

							// Get night or day
							if (tpb>tsr && tpb<tss) { daynight = 'day'; } else { daynight = 'night'; }
									// Translation function

							var _tt = []; {
                            _tt[0] = {'en': 'Tornado', 'de': 'Sitze Zuhause:)', 'ru': 'Торнадо - сиди дома!'};
                            _tt[1] = {'en': 'Tropical storm', 'de': 'Tropischer Sturm', 'ru': 'Тропический шторм'};
                            _tt[2] = {'en': 'Hurricane', 'de': 'Hurrikan', 'ru': 'Ураган'};
                            _tt[3] = {'en': 'Severe thunderstorms', 'de': 'Heftiges Gewitter', 'ru': 'Сильная непогода'};
                            _tt[4] = {'en': 'Thunderstorms', 'de': 'Gewitter', 'ru': 'Грозы'};
                            _tt[5] = {'en': 'Mixed rain and snow', 'de': 'Regen mit Schnee', 'ru': 'Дождь со снегом'};
                            _tt[6] = {'en': 'Mixed rain and sleet', 'de': 'Regen mit Graupel', 'ru': 'Дождь с градом'};
                            _tt[7] = {'en': 'Mixed snow and sleet', 'de': 'Schnee mit Graupel', 'ru': 'Снег с градом'};
                            _tt[8] = {'en': 'Freezing drizzle', 'de': 'Eisnieselregen', 'ru': 'Изморозь'};
                            _tt[9] = {'en': 'Drizzle', 'de': 'Nieselregen', 'ru': 'Моросящий дождь'};
                            _tt[10] = {'en': 'Freezing rain', 'de': 'Eisregen', 'ru': 'Ледяной дождь'};
                            _tt[11] = {'en': 'Showers', 'de': 'Regenschauer', 'ru': 'Ливень'};
                            _tt[12] = {'en': 'Showers', 'de': 'Regenschauer', 'ru': 'Ливень'};
                            _tt[13] = {'en': 'Snow flurries', 'de': 'Schneetreiben', 'ru': 'Снегопад'};
                            _tt[14] = {'en': 'Light snow showers', 'de': 'Leichter Regen mit Schnee', 'ru': 'Небольшой дождь со снегом'};
                            _tt[15] = {'en': 'Bowing snow', 'de': 'Schnee', 'ru': 'Снег'};
                            _tt[16] = {'en': 'Snow', 'de': 'Schnee', 'ru': 'Снег'};
                            _tt[17] = {'en': 'Hail', 'de': 'Hagel', 'ru': 'Град'};
                            _tt[18] = {'en': 'Sleet', 'de': 'Graupel', 'ru': 'Мелкий град'};
                            _tt[19] = {'en': 'Dust', 'de': 'Staubig', 'ru': 'Пыльно'};
                            _tt[20] = {'en': 'Foggy', 'de': 'Neblig', 'ru': 'Туманно'};
                            _tt[21] = {'en': 'Haze', 'de': 'Nebel', 'ru': 'Туман'};
                            _tt[22] = {'en': 'Smoky', 'de': 'Qualmig', 'ru': 'Задымление'};
                            _tt[23] = {'en': 'Blustery', 'de': 'Stürmisch', 'ru': 'Порывистый ветер'};
                            _tt[24] = {'en': 'Windy', 'de': 'Windig', 'ru': 'Ветрянно'};
                            _tt[25] = {'en': 'Cold', 'de': 'Kalt', 'ru': 'Холодно'};
                            _tt[26] = {'en': 'Cloudy', 'de': 'W&ouml;lkig', 'ru': 'Облачно'};
                            _tt[27] = {'en': 'Mostly cloudy (night)', 'de': '&Uuml;berwiegend w&ouml;lkig', 'ru': 'В основном облачно'};
                            _tt[28] = {'en': 'Mostly cloudy (day)', 'de': '&Uuml;berwiegend w&ouml;lkig', 'ru': 'В основном облачно'};
                            _tt[29] = {'en': 'partly cloudy (night)', 'de': 'Teilweise wolkig', 'ru': 'Местами облачно'};
                            _tt[30] = {'en': 'partly cloudy (day)', 'de': 'Meistens sonnig', 'ru': 'Приемущественно солнечно'};
                            _tt[31] = {'en': 'clear (night)', 'de': 'Klar', 'ru': 'Ясно'};
                            _tt[32] = {'en': 'sunny', 'de': 'Sonnig', 'ru': 'Солнечно'};
                            _tt[33] = {'en': 'fair (night)', 'de': 'Sch&ouml;nwetter', 'ru': 'Прекрасная погода'};
                            _tt[34] = {'en': 'fair (day)', 'de': 'Sch&ouml;nwetter', 'ru': 'Прекрасная погода'};
                            _tt[35] = {'en': 'mixed rain and hail', 'de': 'Regen mit Hagel', 'ru': 'Снег с градом'};
                            _tt[36] = {'en': 'hot', 'de': 'Warm', 'ru': 'Жарко'};
                            _tt[37] = {'en': 'isolated thunderstorms', 'de': 'Vereinzeltes Gewitter', 'ru': 'Одиночные грозы'};
                            _tt[38] = {'en': 'scattered thunderstorms', 'de': 'Verstreutes Gewitter', 'ru': 'Грозы'};
                            _tt[39] = {'en': 'scattered thunderstorms', 'de': 'Verstreutes Gewitter', 'ru': 'Грозы'};
                            _tt[40] = {'en': 'scattered showers', 'de': 'Verstreuter Regen', 'ru': 'Дождь'};
                            _tt[41] = {'en': 'heavy snow', 'de': 'Starker Schneefall', 'ru': 'Сильный снегопад'};
                            _tt[42] = {'en': 'scattered snow showers', 'de': 'Verstreuter Schneeregen', 'ru': 'Ливень с дождем'};
                            _tt[43] = {'en': 'heavy snow', 'de': 'Starker Schneefall', 'ru': 'Сильный снегопад'};
                            _tt[44] = {'en': 'partly cloudy', 'de': 'Teilweise wolkig', 'ru': 'Переменная облачность'};
                            _tt[45] = {'en': 'thundershowers', 'de': 'Gewitterschauer', 'ru': 'Штормовой дождь'};
                            _tt[46] = {'en': 'snow showers', 'de': 'Schneeregen', 'ru': 'Снег с дождем'};
                            _tt[47] = {'en': 'isolated thundershowers', 'de': 'Vereinzelter Gewitterschauer', 'ru': 'Местами грозы'};
                            _tt[3200] = {'en': 'not available', 'de': '', 'ru': ''};
                            }

                            modData['city']      = feed.location.city;
							modData['curr_text'] = _tt[feed.item.condition.code][el.lang.lang];
							modData['curr_temp'] = feed.item.condition.temp;
							modData['curr_icon'] = 'http://l.yimg.com/a/i/us/nws/weather/gr/'+ feed.item.condition.code + daynight.substring(0,1) +'.png';
							modData['forecast']    = [];
							for (var i = 0; i < feed.item.forecast.length; i++)
							{
								modData['forecast'][i] = {};
								modData['forecast'][i]['day_htemp'] = feed.item.forecast[i].high;
								modData['forecast'][i]['day_ltemp'] = feed.item.forecast[i].low;
								modData['forecast'][i]['day_text']  = _tt[ feed.item.forecast[i].code][el.lang.lang];//feed.item.forecast[i].text;
								modData['forecast'][i]['day_icon']  = 'http://l.yimg.com/a/i/us/nws/weather/gr/'+ feed.item.forecast[i].code + daynight.substring(0,1) +'.png';
								modData['forecast'][i]['day_date']  = feed.item.forecast[i].date;
							}
							
							$.fn.processAnswer (el, modData);
						} 
						else {
							//if (options.showerror) $e.html('<p>Weather information unavailable</p>');
						}
					},
					error: function(data) {
						//if (options.showerror) $e.html('<p>Weather request failed</p>');
					}
				});
            break;
        }
    }
	
	$.fn._getWeatherAddress = function (data) {

		// Get address
		var address = data.name;
		if (data.admin2) address += ',\n' + data.admin2.content;
		if (data.admin1) address += ',\n' + data.admin1.content;
		address += ',\n' + data.country.content;

		// Get WEOID
		var woeid = data.woeid;

		return address + '\n['+ woeid +']';
	}
})(jQuery);
