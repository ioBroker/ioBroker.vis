/**
 * Plugin: jquery.zWeatherFeed
 * 
 * Version: 1.2.1
 * (c) Copyright 2011-2013, Zazar Ltd
 * 
 * Description: jQuery plugin for display of Yahoo! Weather feeds
 * 
 * History:
 * 1.2.1 - Handle invalid locations
 * 1.2.0 - Added forecast data option
 * 1.1.0 - Added user callback function
 *         New option to use WOEID identifiers
 *         New day/night CSS class for feed items
 *         Updated full forecast link to feed link location
 * 1.0.3 - Changed full forecast link to Weather Channel due to invalid Yahoo! link
	   Add 'linktarget' option for forecast link
 * 1.0.2 - Correction to options / link
 * 1.0.1 - Added hourly caching to YQL to avoid rate limits
 *         Uses Weather Channel location ID and not Yahoo WOEID
 *         Displays day or night background images
 *
 **/

(function($){

	$.fn.weatherfeed = function(locations, options, fn) {	
	
		// Set plugin defaults
		var defaults = {
			unit:       'c',
			image:      true,
			country:    false,
			highlow:    true,
			wind:       true,
			humidity:   false,
			visibility: false,
			sunrise:    false,
			sunset:     false,
			forecast:   false,
			link:       true,
			showerror:  true,
			linktarget: '_blank',
			woeid:      false,
			lang:       'en',
			update:     60 // minutes
		};  		
		var options = $.extend(defaults, options); 
		var row = 'odd';
		
		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			
			// Add feed class to user div
			if (!$e.hasClass('weatherFeed')) $e.addClass('weatherFeed');

			// Check and append locations
			if (!$.isArray(locations)) return false;

			this.startUpdater = function () {
				_requestData ();
				if (options.update > 0)
                    var that = this;
					setTimeout(function () {
                        that.startUpdater();
                    }, options.update * 60000);
			}


			var _requestData = function () {
				var count = locations.length;
				if (count > 10) count = 10;

				var locationid = '';

				for (var i = 0; i < count; i++) {
					if (locationid != '') locationid += ',';
					locationid += "'" + locations[i] + "'";
				}

				// Cache results for an hour to prevent overuse
				now = new Date();

				// Select location ID type
				var queryType = options.woeid ? 'woeid' : 'location';
						
				// Create Yahoo Weather feed API address
				var query = "select * from weather.forecast where " + queryType + " in (" + locationid + ") and u='" + options.unit + "'";
				var api = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query) + '&rnd=' + now.getFullYear() + now.getMonth() + now.getDay() + now.getHours() +'&format=json&callback=?';
				
				// Send request
				$.ajax({
					type:    'GET',
					url:      api,
					dataType: 'json',
					context:  $e,
					success:  function(data) {

						if (data.query && data.query.results) {
						
							this[0].feed = data.query.results.channel;
							
							if (data.query.results.channel && data.query.results.channel.length > 0 ) {
								
								// Multiple locations
								var result = data.query.results.channel.length;
								for (var i=0; i<result; i++) {
								
									// Create weather feed item
									_process(e, options);
								}
							} else {
								// Single location only
								_process(e, options);
							}

							// Optional user callback function
							if ($.isFunction(fn)) fn.call(this,$e);

						} else {
							if (options.showerror) $e.html('<p>Weather information unavailable</p>');
						}
					},
					error:    function(data) {
						if (options.showerror) $e.html('<p>Weather request failed</p>');
					}
				});
			}
			var timer = 0;
			// Translation function
			var _tt = []; {
            _tt[0]    = {'en':'Tornado',        'de': 'Sitze Zuhause:)', 'ru': 'Торнадо - сиди дома!'};
            _tt[1]    = {'en':'Tropical storm', 'de': 'Tropischer Sturm', 'ru': 'Тропический шторм'};
            _tt[2]    = {'en':'Hurricane',      'de': 'Hurrikan', 'ru': 'Ураган'};
            _tt[3]    = {'en':'Severe thunderstorms', 'de': 'Heftiges Gewitter', 'ru': 'Сильная непогода'};
            _tt[4]    = {'en':'Thunderstorms',  'de': 'Gewitter', 'ru': 'Грозы'};
            _tt[5]    = {'en':'Mixed rain and snow', 'de' : 'Regen mit Schnee', 'ru': 'Дождь со снегом'};
            _tt[6]    = {'en':'Mixed rain and sleet', 'de' : 'Regen mit Graupel', 'ru': 'Дождь с градом'};
            _tt[7]    = {'en':'Mixed snow and sleet', 'de' : 'Schnee mit Graupel', 'ru': 'Снег с градом'};
            _tt[8]    = {'en':'Freezing drizzle', 'de' : 'Eisnieselregen', 'ru': 'Изморозь'};
            _tt[9]    = {'en':'Drizzle',        'de' : 'Nieselregen', 'ru': 'Моросящий дождь'};
            _tt[10]   = {'en':'Freezing rain',  'de': 'Eisregen', 'ru': 'Ледяной дождь'};
            _tt[11]   = {'en':'Showers',        'de': 'Regenschauer', 'ru': 'Ливень'};
            _tt[12]   = {'en':'Showers',        'de': 'Regenschauer', 'ru': 'Ливень'};
            _tt[13]   = {'en':'Snow flurries',  'de': 'Schneetreiben', 'ru': 'Снегопад'};
            _tt[14]   = {'en':'Light snow showers', 'de': 'Leichter Regen mit Schnee', 'ru': 'Небольшой дождь со снегом'};
            _tt[15]   = {'en':'Bowing snow',    'de': 'Schnee', 'ru': 'Снег'};
            _tt[16]   = {'en':'Snow',           'de': 'Schnee', 'ru': 'Снег'};
            _tt[17]   = {'en':'Hail',           'de': 'Hagel', 'ru': 'Град'};
            _tt[18]   = {'en':'Sleet',          'de': 'Graupel', 'ru': 'Мелкий град'};
            _tt[19]   = {'en':'Dust',           'de':'Staubig', 'ru': 'Пыльно'};
            _tt[20]   = {'en':'Foggy',          'de':'Neblig', 'ru': 'Туманно'};
            _tt[21]   = {'en':'Haze',           'de':'Nebel', 'ru': 'Туман'};
            _tt[22]   = {'en':'Smoky',          'de':'Qualmig', 'ru': 'Задымление'};
            _tt[23]   = {'en':'Blustery',       'de':'Stürmisch', 'ru': 'Порывистый ветер'};
            _tt[24]   = {'en':'Windy',          'de':'Windig', 'ru': 'Ветрянно'};
            _tt[25]   = {'en':'Cold',           'de':'Kalt', 'ru': 'Холодно'};
            _tt[26]   = {'en':'Cloudy',         'de':'W&ouml;lkig', 'ru': 'Облачно'};
            _tt[27]   = {'en':'Mostly cloudy (night)', 'de':'&Uuml;berwiegend w&ouml;lkig', 'ru': 'В основном облачно'};
            _tt[28]   = {'en':'Mostly cloudy (day)', 'de':'&Uuml;berwiegend w&ouml;lkig', 'ru': 'В основном облачно'};
            _tt[29]   = {'en':'partly cloudy (night)', 'de':'Teilweise wolkig', 'ru': 'Местами облачно'};
            _tt[30]   = {'en':'partly cloudy (day)', 'de':'Meistens sonnig', 'ru': 'Приемущественно солнечно'};
            _tt[31]   = {'en':'clear (night)',  'de':'Klar', 'ru': 'Ясно'};
            _tt[32]   = {'en':'sunny',          'de':'Sonnig', 'ru': 'Солнечно'};
            _tt[33]   = {'en':'fair (night)',   'de': 'Sch&ouml;nwetter', 'ru': 'Прекрасная погода'};
            _tt[34]   = {'en':'fair (day)',     'de': 'Sch&ouml;nwetter', 'ru': 'Прекрасная погода'};
            _tt[35]   = {'en':'mixed rain and hail', 'de': 'Regen mit Hagel', 'ru': 'Снег с градом'};
            _tt[36]   = {'en':'hot',            'de': 'Warm', 'ru': 'Жарко'};
            _tt[37]   = {'en':'isolated thunderstorms', 'de': 'Vereinzeltes Gewitter', 'ru': 'Одиночные грозы'};
            _tt[38]   = {'en':'scattered thunderstorms', 'de': 'Verstreutes Gewitter', 'ru': 'Грозы'};
            _tt[39]   = {'en':'scattered thunderstorms', 'de': 'Verstreutes Gewitter', 'ru': 'Грозы'};
            _tt[40]   = {'en':'scattered showers', 'de': 'Verstreuter Regen', 'ru': 'Дождь'};
            _tt[41]   = {'en':'heavy snow',     'de':'Starker Schneefall', 'ru': 'Сильный снегопад'};
            _tt[42]   = {'en':'scattered snow showers', 'de': 'Verstreuter Schneeregen', 'ru': 'Ливень с дождем'};
            _tt[43]   = {'en':'heavy snow',     'de':'Starker Schneefall', 'ru': 'Сильный снегопад'};
            _tt[44]   = {'en':'partly cloudy',  'de':'Teilweise wolkig', 'ru': 'Переменная облачность'};
            _tt[45]   = {'en':'thundershowers', 'de':'Gewitterschauer', 'ru': 'Штормовой дождь'};
            _tt[46]   = {'en':'snow showers',   'de': 'Schneeregen', 'ru': 'Снег с дождем'};
            _tt[47]   = {'en':'isolated thundershowers', 'de': 'Vereinzelter Gewitterschauer', 'ru': 'Местами грозы'};
            _tt[3200] = {'en':'not available',  'de': '', 'ru': ''};
			}
			
			var _translate = function (word, lang) {
				if (word === undefined || word == null || word == "")
					return "";
					
				if (lang == 'de') {
					// If date
					if (word.length > 1 && word[0] >= '0' && word[0] <= '9') {
						word = word.replace ('Jan', 'Januar');
						word = word.replace ('Feb', 'Februar');
						word = word.replace ('Mar', 'M&auml;rz');
						word = word.replace ('Apr', 'April');
						word = word.replace ('Mai', 'Mai');
						word = word.replace ('Jun', 'Juni');
						word = word.replace ('Jul', 'Juli');
						word = word.replace ('Aug', 'August');
						word = word.replace ('Sep', 'September');
						word = word.replace ('Oct', 'Oktober');
						word = word.replace ('Nov', 'November');
						word = word.replace ('Dec', 'Dezember');
						return word;
					}
				
					if (word == 'High')
						return 'H&ouml;chste';
					if (word == 'Low')
						return 'Niedrigste';
					if (word == 'Wind')
						return 'Wind';
					if (word == 'Humidity')
						return 'Luftfeuchte';
					if (word == 'Visibility')
						return 'Sichtweite';
					if (word == 'Sunrise')
						return 'Sonnenaufgang';
					if (word == 'Sunset')
						return 'Sonnenuntergang';
					if (word == 'City not found')
						return 'Stadt ist nicht gefunden';
					if (word == 'Full forecast')
						return 'Volle Vorhersage';
					if (word == 'Read full forecast')
						return 'Sehe volle Vorhersage';
					if (word == 'Mon')
						return 'Montag';
					if (word == 'Tue')
						return 'Dienstag';
					if (word == 'Wed')
						return 'Mittwoch';
					if (word == 'Thu')
						return 'Donnerstag';
					if (word == 'Fri')
						return 'Freitag';
					if (word == 'Sat')
						return 'Samstag';
					if (word == 'Sun')
						return 'Sonntag';
				}
                if (lang == 'ru') {
                    // If date
                    if (word.length > 1 && word[0] >= '0' && word[0] <= '9') {
                        word = word.replace ('Jan', 'Январь');
                        word = word.replace ('Feb', 'Февраль');
                        word = word.replace ('Mar', 'Март');
                        word = word.replace ('Apr', 'Апрель');
                        word = word.replace ('Mai', 'Май');
                        word = word.replace ('Jun', 'Июнь');
                        word = word.replace ('Jul', 'Июль');
                        word = word.replace ('Aug', 'Август');
                        word = word.replace ('Sep', 'Сентябрь');
                        word = word.replace ('Oct', 'Октябрь');
                        word = word.replace ('Nov', 'Ноябрь');
                        word = word.replace ('Dec', 'Декабрь');
                        return word;
                    }

                    if (word == 'High')
                        return 'Макс.';
                    if (word == 'Temperature')
                        return 'Температура';
                    if (word == 'Low')
                        return 'Мин.';
                    if (word == 'Wind')
                        return 'Ветер';
                    if (word == 'Humidity')
                        return 'Влажность';
                    if (word == 'Visibility')
                        return 'Видимость';
                    if (word == 'Sunrise')
                        return 'Восход';
                    if (word == 'Sunset')
                        return 'Закат';
                    if (word == 'City not found')
                        return 'Город не найден';
                    if (word == 'Full forecast')
                        return 'Полный прогноз';
                    if (word == 'Read full forecast')
                        return 'См. полный прогноз';
                    if (word == 'Mon')
                        return 'Понедельник';
                    if (word == 'Tue')
                        return 'Вторник';
                    if (word == 'Wed')
                        return 'Среда';
                    if (word == 'Thu')
                        return 'Четверг';
                    if (word == 'Fri')
                        return 'Пятница';
                    if (word == 'Sat')
                        return 'Суббота';
                    if (word == 'Sun')
                        return 'Воскресение';
                }
                return word;
            };

			// Function to each feed item
			var _process = function(e, options) {
				var $e = $(e);

				$e.empty();
                if (options.width)
				    $e.css ({width: options.width});
				if (options.height)
					$e.css ({height: options.height});
				var feed = $e[0].feed;
				
				var isVertical = false;
				var isShort    = (options.width < 100);
				
				// Check for invalid location
				if (feed.description != 'Yahoo! Weather Error') {

					// Format feed items
					var wd = feed.wind.direction;
					if (wd>=348.75&&wd<=360){wd="N"};if(wd>=0&&wd<11.25){wd="N"};if(wd>=11.25&&wd<33.75){wd="NNE"};if(wd>=33.75&&wd<56.25){wd="NE"};if(wd>=56.25&&wd<78.75){wd="ENE"};if(wd>=78.75&&wd<101.25){wd="E"};if(wd>=101.25&&wd<123.75){wd="ESE"};if(wd>=123.75&&wd<146.25){wd="SE"};if(wd>=146.25&&wd<168.75){wd="SSE"};if(wd>=168.75&&wd<191.25){wd="S"};if(wd>=191.25 && wd<213.75){wd="SSW"};if(wd>=213.75&&wd<236.25){wd="SW"};if(wd>=236.25&&wd<258.75){wd="WSW"};if(wd>=258.75 && wd<281.25){wd="W"};if(wd>=281.25&&wd<303.75){wd="WNW"};if(wd>=303.75&&wd<326.25){wd="NW"};if(wd>=326.25&&wd<348.75){wd="NNW"};
					var wf = feed.item.forecast[0];
		
					// Determine day or night image
					wpd = feed.item.pubDate;
					n = wpd.indexOf(":");
					tpb = _getTimeAsDate(wpd.substr(n-2,8));
					tsr = _getTimeAsDate(feed.astronomy.sunrise);
					tss = _getTimeAsDate(feed.astronomy.sunset);

					// Get night or day
					if (tpb > tsr && tpb < tss) { daynight = 'day'; } else { daynight = 'night'; }

					// Add item container
					var html = '<div class="weatherItem '+ row + ' ' + daynight + '"';
					if (options.image) html += ' style="background-image: url(http://l.yimg.com/a/i/us/nws/weather/gr/' + feed.item.condition.code + daynight.substring(0,1) + '.png); background-repeat: no-repeat;"';
					html += '>';
		
					// Add item data
					html += '<div class="weatherCity">' + feed.location.city + '</div>';
					if (options.country) html += '<div class="weatherCountry">' + feed.location.country + '</div>';
					html += '<div class="weatherTemp">' + feed.item.condition.temp + '&deg;</div>';
					html += '<div class="weatherDesc">' + (_tt[feed.item.condition.code][options.lang] || _tt[feed.item.condition.code]['en']) + '</div>';
				
					// Add optional data
					if (options.highlow  && !isShort) html += '<div class="weatherRange">' + _translate('High', options.lang) + ': ' + wf.high + '&deg; ' + _translate('Low', options.lang) + ': ' + wf.low + '&deg;</div>';
					if (options.highlow  && isShort)  html += '<div class="weatherRange">' + wf.low + '&deg;-' + wf.high + '&deg;</div>';
					if (options.wind     && !isShort) html += '<div class="weatherWind">' + _translate('Wind', options.lang) + ': ' + wd + ' ' + feed.wind.speed + _translate(feed.units.speed) + '</div>';
					if (options.humidity && !isShort) html += '<div class="weatherHumidity">' + _translate('Humidity', options.lang) + ': ' + feed.atmosphere.humidity + '%</div>';
					if (options.humidity && isShort)  html += '<div class="weatherHumidity">' + feed.atmosphere.humidity + '%</div>';
					if (options.visibility) html += '<div class="weatherVisibility">' + _translate('Visibility', options.lang) + ': ' + feed.atmosphere.visibility + '</div>';
					if (options.sunrise)    html += '<div class="weatherSunrise">' + _translate('Sunrise', options.lang) + ': ' + feed.astronomy.sunrise + '</div>';
					if (options.sunset)     html += '<div class="weatherSunset">' + _translate('Sunset', options.lang) + ': ' + feed.astronomy.sunset + '</div>';

					// Add item forecast data
					if (options.forecast) {

						html += '<div class="weatherForecast">';

						var wfi = feed.item.forecast;

						for (var i=0; i<wfi.length; i++) {
							//if (options.height)
							html += '<div class="weatherForecastItem" style="background-image: url(http://l.yimg.com/a/i/us/nws/weather/gr/'+ wfi[i].code +'s.png); background-repeat: no-repeat;">';
							html += '<div class="weatherForecastDay">'+ _translate(wfi[i].day, options.lang, isShort) +'</div>';
							html += '<div class="weatherForecastDate">'+ _translate(wfi[i].date, options.lang, isShort) +'</div>';
							html += '<div class="weatherForecastText">'+ (_tt[wfi[i].code][options.lang] || _tt[wfi[i].code]['en']) +'</div>';
							if (isShort)
								html += '<div class="weatherForecastRange">'+ wfi[i].low +'&deg;-'+ wfi[i].high +'&deg;</div>';
							else
								html += '<div class="weatherForecastRange">'+_translate('Temperature', options.lang)+': '+ wfi[i].low +'&deg;-'+ wfi[i].high +'&deg;</div>';
							html += '</div>';
						}

						html += '</div>'
					}

					if (options.link) html += '<div class="weatherLink"><a href="'+ feed.link +'" target="'+ options.linktarget +'" title="'+_translate('Read full forecast', options.lang)+'">'+_translate('Full forecast', options.lang)+'</a></div>';

				} else {
					var html = '<div class="weatherItem ' + row + '">';
					html += '<div class="weatherError">' + _translate('City not found', options.lang) + '</div>';
				}

				html += '</div>';

				// Alternate row classes
				if (row == 'odd') { row = 'even'; } else { row = 'odd';	}
		
				$e.append(html);
                if (typeof options.rendered == 'function') options.rendered();

				if (options.resizable) {
                    $e.resizable().resize (function() {
                        clearTimeout (timer);
                        timer = setTimeout ( function () {
                            options.width  = $e.width();
                            options.height = $e.height();
                            _process (e, options);
                        }, 1000);
                    });
                    console.log('B');
                }
			};

			// Get time string as date
			var _getTimeAsDate = function(t) {
		
				d = new Date();
				r = new Date(d.toDateString() +' '+ t);

				return r;
			};

			this.startUpdater ();
		});
	};

})(jQuery);
