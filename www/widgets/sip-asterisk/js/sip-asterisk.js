'use strict';

// add translations for edit mode
if (vis.editMode) {
	$.extend(true, systemDictionary, {
		"privateIdentity": {
			"en": "Private identity",
			"de": "Private Identität",
			"ru": "Private identity",
			"pt": "Identidade privada",
			"nl": "Privé identiteit",
			"fr": "Identité privée",
			"it": "Identità privata",
			"es": "Identidad privada",
			"pl": "Prywatna tożsamość",
			"zh-cn": "私人身份"
		},
		"publicIdentity": {
			"en": "Public identity",
			"de": "Öffentliche Identität",
			"ru": "Public identity",
			"pt": "Identidade pública",
			"nl": "Publieke identiteit",
			"fr": "Identité publique",
			"it": "Identità pubblica",
			"es": "Identidad pública",
			"pl": "Tożsamość publiczna",
			"zh-cn": "公众身份"
		},
		"password": {
			"en": "Password",
			"de": "Passwort",
			"ru": "пароль",
			"pt": "Senha",
			"nl": "Wachtwoord",
			"fr": "Mot de passe",
			"it": "Parola d'ordine",
			"es": "Contraseña",
			"pl": "Hasło",
			"zh-cn": "密码"
		},
		"displayName": {
			"en": "Display name",
			"de": "Anzeigename",
			"ru": "Показать имя",
			"pt": "Nome em Exibição",
			"nl": "Weergavenaam",
			"fr": "Afficher un nom",
			"it": "Nome da visualizzare",
			"es": "Nombre para mostrar",
			"pl": "Wyświetlana nazwa",
			"zh-cn": "显示名称"
		},
		"realm": {
			"en": "Realm",
			"de": "Reich",
			"ru": "область",
			"pt": "Reino",
			"nl": "Rijk",
			"fr": "Domaine",
			"it": "Regno",
			"es": "Reino",
			"pl": "Królestwo",
			"zh-cn": "领域"
		},
		"websocketProxyURL": {
			"en": "Websocket proxy URL",
			"de": "Websocket-Proxy-URL",
			"ru": "URL прокси Websocket",
			"pt": "URL de proxy do Websocket",
			"nl": "Websocket proxy-URL",
			"fr": "URL du proxy Websocket",
			"it": "URL proxy WebSocket",
			"es": "URL proxy de Websocket",
			"pl": "Adres URL serwera proxy Websocket",
			"zh-cn": "Websocket代理URL"
		},
		"phoneNumber": {
			"en": "Call number",
			"de": "Rufnummer",
			"ru": "Номер для звонка",
			"pt": "Numero de telefone",
			"nl": "Bel nummer",
			"fr": "Numéro de téléphone",
			"it": "Chiama il numero",
			"es": "Número de llamada",
			"pl": "Zadzwoń na numer",
			"zh-cn": "电话号码"
		},
		"noOutgoingCalls": {
			"en": "No outgoing calls",
			"de": "Keine ausgehenden Anrufe",
			"ru": "Нет исходящих звонков",
			"pt": "Nenhuma chamada efetuada",
			"nl": "Geen uitgaande oproepen",
			"fr": "Aucun appel sortant",
			"it": "Nessuna chiamata in uscita",
			"es": "No hay llamadas salientes",
			"pl": "Brak połączeń wychodzących",
			"zh-cn": "没有拨出电话"
		},
		"defaultVolume": {
			"en": "Default volume",
			"de": "Standardlautstärke",
			"ru": "Громкость по умолчанию",
			"pt": "Volume padrão",
			"nl": "Standaard volume",
			"fr": "Volume par défaut",
			"it": "Volume predefinito",
			"es": "Volumen predeterminado",
			"pl": "Domyślna głośność",
			"zh-cn": "默认音量"
		},
		"calling-oid": {
			"en": "Calling number",
			"de": "Telefonnummer",
			"ru": "Вызывающий номер",
			"pt": "Número de chamada",
			"nl": "Bellen nummer",
			"fr": "Numéro appelant",
			"it": "Numero chiamante",
			"es": "Número que llama",
			"pl": "Numer telefonu",
			"zh-cn": "电话号码"
		},
		"incall-oid": {
			"en": "Number in call now",
			"de": "Nummer in Anruf jetzt",
			"ru": "Номер в звонке сейчас",
			"pt": "Número em chamada agora",
			"nl": "Nummer in gesprek nu",
			"fr": "Numéro en appel maintenant",
			"it": "Numero in chiamata ora",
			"es": "Número en llamada ahora",
			"pl": "Numer w rozmowie teraz",
			"zh-cn": "立即拨打电话"
		},
		"callduration-oid": {
			"en": "Current call duration",
			"de": "Aktuelle Anrufdauer",
			"ru": "Текущая продолжительность звонка",
			"pt": "Duração atual da chamada",
			"nl": "Huidige gespreksduur",
			"fr": "Durée actuelle de l'appel",
			"it": "Durata della chiamata corrente",
			"es": "Duración actual de la llamada",
			"pl": "Aktualny czas trwania połączenia",
			"zh-cn": "当前通话时间"
		},
		"lastcall-oid": {
			"en": "Last calling number",
			"de": "Letzte rufende Nummer",
			"ru": "Последний номер",
			"pt": "Último número de chamada",
			"nl": "Laatste oproepnummer",
			"fr": "Dernier numéro d'appel",
			"it": "Ultimo numero chiamante",
			"es": "Último número de llamada",
			"pl": "Numer ostatniego dzwoniącego",
			"zh-cn": "最后通话号码"
		},
		"lastduration-oid": {
			"en": "Last call duration",
			"de": "Letzte Anrufdauer",
			"ru": "Продолжительность последнего звонка",
			"pt": "Duração da última chamada",
			"nl": "Laatste gespreksduur",
			"fr": "Durée du dernier appel",
			"it": "Durata dell'ultima chiamata",
			"es": "Duración de la última llamada",
			"pl": "Czas trwania ostatniego połączenia",
			"zh-cn": "上次通话时间"
		},
		"group_sipoids": {
			"en": "Object IDs",
			"de": "Objekt-IDs",
			"ru": "Идентификаторы объектов",
			"pt": "IDs de objeto",
			"nl": "Object ID's",
			"fr": "ID d'objet",
			"it": "ID oggetto",
			"es": "ID de objeto",
			"pl": "Identyfikatory obiektów",
			"zh-cn": "对象ID"
		},
		"sipShowStatus": {
			"en": "Show status",
			"de": "Status anzeigen",
			"ru": "Показать статус",
			"pt": "Mostrar status",
			"nl": "Status weergeven",
			"fr": "Afficher le statut",
			"it": "Mostra stato",
			"es": "Mostrar estado",
			"pl": "Pokaż status",
			"zh-cn": "显示状态"
		}
	});
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
	"Enter phone number...": {
		"en": "Enter phone number...",
		"de": "Telefonnummer eingeben...",
		"ru": "Введите номер телефона...",
		"pt": "Digite o número de telefone ...",
		"nl": "Voer telefoonnummer in...",
		"fr": "Entrez le numéro de téléphone ...",
		"it": "Inserisci il numero di telefono...",
		"es": "Ingresa número telefónico...",
		"pl": "Wpisz numer telefonu...",
		"zh-cn": "输入电话号码..."
	},
	"Call": {
		"en": "Call",
		"de": "Anruf",
		"ru": "Вызов",
		"pt": "Ligar",
		"nl": "telefoontje",
		"fr": "Appel",
		"it": "Chiamata",
		"es": "Llamada",
		"pl": "Połączenie",
		"zh-cn": "呼叫"
	},
	"Calling %s": {
		"en": "Calling %s",
		"de": "Aufruf von %s ",
		"ru": "Вызов %s ",
		"pt": "Chamando %s ",
		"nl": "% S bellen",
		"fr": "Appel de %s ",
		"it": "Chiamata %s ",
		"es": "Llamando a %s ",
		"pl": "Wywoływanie %s ",
		"zh-cn": "呼叫％s"
	},
	"Accept": {
		"en": "Accept",
		"de": "Akzeptieren",
		"ru": "принимать",
		"pt": "Aceitar",
		"nl": "Aanvaarden",
		"fr": "J'accepte",
		"it": "Accettare",
		"es": "Aceptar",
		"pl": "Zaakceptować",
		"zh-cn": "接受"
	},
	"Decline": {
		"en": "Decline",
		"de": "Ablehnen",
		"ru": "снижение",
		"pt": "Declínio",
		"nl": "Afwijzen",
		"fr": "Déclin",
		"it": "Declino",
		"es": "Disminución",
		"pl": "Upadek",
		"zh-cn": "下降"
	},
	"Hang up": {
		"en": "Hang up",
		"de": "Auflegen",
		"ru": "Вешать трубку",
		"pt": "Desligar",
		"nl": "Ophangen",
		"fr": "Raccrocher",
		"it": "Appendere",
		"es": "Colgar",
		"pl": "Odłożyć słuchawkę",
		"zh-cn": "挂断"
	},
	"Incoming call from %s": {
		"en": "Incoming call from %s",
		"de": "Eingehender Anruf von %s ",
		"ru": "Входящий звонок от %s ",
		"pt": "Chamada recebida de %s ",
		"nl": "Inkomende oproep van %s ",
		"fr": "Appel entrant de %s ",
		"it": "Chiamata in arrivo da %s ",
		"es": "Llamada entrante de %s ",
		"pl": "Połączenie przychodzące z %s ",
		"zh-cn": "％s的来电"
	},
	"In call with %s": {
		"en": "In call with %s",
		"de": "Im Gespräch mit %s ",
		"ru": "В вызове с %s ",
		"pt": "Em chamada com %s ",
		"nl": "In gesprek met %s ",
		"fr": "En communication avec %s ",
		"it": "In chiamata con %s ",
		"es": "En llamada con %s ",
		"pl": "W połączeniu z %s ",
		"zh-cn": "正在与％s通话"
	},
	"Waiting for calls...": {
		"en": "Waiting for calls...",
		"de": "Warten auf Anrufe ...",
		"ru": "В ожидании звонков ...",
		"pt": "Esperando por chamadas ...",
		"nl": "Wachten op oproepen ...",
		"fr": "Envie d'appels ...",
		"it": "Wating per le chiamate ...",
		"es": "Esperando llamadas ...",
		"pl": "Wating dla połączeń ...",
		"zh-cn": "正在等待通话..."
	}
});

function SIPWebRTCCommunication(sipAccount, audioElement) {
	/*
    * PUBLIC METHODS
    */
	this.makeCall = function (identity) {
		this._callSession = this._sipStack.newSession(
			'call-audio', {
				events_listener: {
					events: '*',
					listener: (e) => this._callEventsListener(e)
				},
				audio_remote: this._audioRemoteElement
			});

		this._callSession.call(identity);
	};

	this.acceptCall = function () {
		this._callSession.accept();
	};

	this.declineCall = function () {
		this._callSession.reject();
	};

	this.endCall = function () {
		this._callSession.hangup();
	};

	this.getRemoteFriendlyName = function () {
		return this._callSession.getRemoteFriendlyName() || 'unknown';
	};

	/*
    * PRIVATE METHODS
    */
	this._init = function (realm, privateIdentity, publicIdentity, password, displayName, websocketProxyURL) {
		let readyCallback = e => this._createSipStack(realm, privateIdentity, publicIdentity, password, displayName, websocketProxyURL);
		let errorCallback = e => console.error(e.message);
		SIPml.init(readyCallback, errorCallback);
	};

	this._createSipStack = function (realm, privateIdentity, publicIdentity, password, displayName, websocketProxyURL) {
		this._sipStack = new SIPml.Stack({
			realm: realm,
			impi: privateIdentity, //private
			impu: publicIdentity, //public
			password: password,
			display_name: displayName,
			websocket_proxy_url: websocketProxyURL,
			outbound_proxy_url: null,
			ice_servers: '[]', // disable ICE gathering
			enable_rtcweb_breaker: false,
			enable_early_ims: true, // Must be true unless you're using a real IMS network
			enable_media_stream_cache: true,
			events_listener: {events: '*', listener: (e) => this._stackEventsListener(e)}
		});

		this._sipStack.start();
	};

	this._login = function () {
		this._registerSession = this._sipStack.newSession(
			'register',
			{events_listener: {events: '*', listener: (e) => this._sessionEventsListener(e)}}
		);

		this._registerSession.register();
	};

	/*
     * EVENT HANDLER
     */
	this._stackEventsListener = function (event) {
		console.log('Stack Event.', event.type);
		if (event.type === 'started') {
			this._login();
		}
		else if (event.type === 'i_new_call') {
			// incoming audio/video call
			this._callSession = event.newSession;
			this._callSession.setConfiguration({
				audio_remote:  this._audioRemoteElement,
				events_listener: { events: '*', listener: (e) => this._callEventsListener(e)},
			});
			this.onCallIncoming && this.onCallIncoming();
		}
	};

	this._sessionEventsListener = function (event) {
		console.log('Session Event.', event.type);
	};

	this._callEventsListener = function (event) {
		console.log('Call Event.', event.type);
		if (event.type === 'connected') {
			this._audioRemoteElement.play();
			this.onCallConnected();
		}
		if (event.type === 'terminated'){
			this.onCallTerminated && this.onCallTerminated();
		}
	};

	this._init(sipAccount.realm, sipAccount.privateIdentity, sipAccount.publicIdentity, sipAccount.password, sipAccount.displayName, sipAccount.websocketProxyURL);
	this._audioRemoteElement = audioElement;
}

vis.binds['sip-asterisk'] = {
	version: '0.10.0',
	debug: false,
	inited: false,
	showVersion: function () {
		var sipAdapter = vis.binds['sip-asterisk'];
		if (sipAdapter.version) {
			console.log('Version sip-asterisk: ' + sipAdapter.version);
			sipAdapter.version = null;
		}
	},
	createWidget: function (widgetID, view, data, style) {
		var sipAdapter = vis.binds['sip-asterisk'];
		var $div = $('#' + widgetID);
		// if nothing found => wait
		if (!$div.length) {
			return setTimeout(function () {
				sipAdapter.createWidget(widgetID, view, data, style);
			}, 100);
		}

		var html =
			'      <div class="widget-container vis-widget-body ' + (data['class'] || '') + '">\n' +
			'            <audio class="audioRemote"/>\n' +
			'            <div>\n';
		if (!data.phoneNumber && !data.noOutgoingCalls) {
			html += '                <div class="makeCallContainer">\n';
			html += '                    <input class="phone-number-input" type="tel" placeholder="' + _('Enter phone number...') + '" />\n';
		}
		if (!data.noOutgoingCalls) {
			if (data.phoneNumber) {
				html += '                <div class="makeCallContainer">\n';
			}
			html +=
				'                    <div class="button-container">\n' +
				'                        <div class="callButton button-wrapper">\n' +
				'                            <button class="button-call"">\n' +
				'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">\n' +
				'                                    <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />\n' +
				'                                </svg>\n' +
				'                                <span>' + _('Call') + '</span>\n' +
				'                            </button>\n' +
				'                        </div>\n' +
				'                    </div>\n' +
				'                </div>\n'
		}

		html +=
			'                <div class="incomingCallContainer hidden">\n' +
			'                    <span class="callFromLabel label"></span>\n' +
			'                    <div class="button-container">\n' +
			'                        <div class="button-wrapper">\n' +
			'                            <button class="button-accept">\n' +
			'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">\n' +
			'                                    <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />\n' +
			'                                </svg>\n' +
			'                                <span>' + _('Accept') + '</span>\n' +
			'                            </button>\n' +
			'                        </div>\n' +
			'                        <div class="button-wrapper">\n' +
			'                            <button class="decline">\n' +
			'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">' +
		    '                                    <path fill="currentColor" d="M12,9C10.4,9 8.85,9.25 7.4,9.72V12.82C7.4,13.22 7.17,13.56 6.84,13.72C5.86,14.21 4.97,14.84 4.17,15.57C4,15.75 3.75,15.86 3.5,15.86C3.2,15.86 2.95,15.74 2.77,15.56L0.29,13.08C0.11,12.9 0,12.65 0,12.38C0,12.1 0.11,11.85 0.29,11.67C3.34,8.77 7.46,7 12,7C16.54,7 20.66,8.77 23.71,11.67C23.89,11.85 24,12.1 24,12.38C24,12.65 23.89,12.9 23.71,13.08L21.23,15.56C21.05,15.74 20.8,15.86 20.5,15.86C20.25,15.86 20,15.75 19.82,15.57C19.03,14.84 18.14,14.21 17.16,13.72C16.83,13.56 16.6,13.22 16.6,12.82V9.72C15.15,9.25 13.6,9 12,9Z" />' +
		    ' 			                     </svg>' +
			'                                <span>' + _('Decline') + '</span>\n' +
			'                            </button>\n' +
			'                        </div>\n' +
			'                    </div>\n' +
			'                </div>\n' +

			'                <div class="inCallContainer hidden">\n' +
			'                    <span class="inCallLabel label"></span>\n' +
			'                    <div class="button-container">\n' +
			'                        <div class="button-wrapper">\n' +
			'                            <button class="button-hang-up">\n' +
			'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">' +
			'                                    <path fill="currentColor" d="M12,9C10.4,9 8.85,9.25 7.4,9.72V12.82C7.4,13.22 7.17,13.56 6.84,13.72C5.86,14.21 4.97,14.84 4.17,15.57C4,15.75 3.75,15.86 3.5,15.86C3.2,15.86 2.95,15.74 2.77,15.56L0.29,13.08C0.11,12.9 0,12.65 0,12.38C0,12.1 0.11,11.85 0.29,11.67C3.34,8.77 7.46,7 12,7C16.54,7 20.66,8.77 23.71,11.67C23.89,11.85 24,12.1 24,12.38C24,12.65 23.89,12.9 23.71,13.08L21.23,15.56C21.05,15.74 20.8,15.86 20.5,15.86C20.25,15.86 20,15.75 19.82,15.57C19.03,14.84 18.14,14.21 17.16,13.72C16.83,13.56 16.6,13.22 16.6,12.82V9.72C15.15,9.25 13.6,9 12,9Z" />' +
			' 			                     </svg>' +
			'                                <span>' + _('Hang up') + '</span>\n' +
			'                            </button>\n' +
			'                        </div>\n' +
			'                    </div>\n' +

			'                    <div class="button-container">\n' +
			'                        <div class="button-wrapper">\n' +
			'                            <button class="button-volume-down">\n' +
			'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">\n' +
			'                                    <path fill="currentColor" d="M3,9H7L12,4V20L7,15H3V9M14,11H22V13H14V11Z" />\n' +
			'                                 </svg>\n' +
			'                            </button>\n' +
			'                            <input class="volume-slider" type="range" min="0.1" max="1" step="0.1" value="0.5">\n' +
			'                            <button class="button-volume-up">\n' +
			'                                <svg style="width:24px;height:24px" viewBox="0 0 24 24">\n' +
			'                                    <path fill="currentColor" d="M3,9H7L12,4V20L7,15H3V9M14,11H17V8H19V11H22V13H19V16H17V13H14V11Z"/>\n' +
			'                                </svg>' +
			'                            </button>\n' +
			'                        </div>\n' +
			'                    </div>\n' +
			'                </div>\n' +
			'                    <div class="error-message"></div>';
		if (data.sipShowStatus) {
			html += '                    <div class="status-message"></div>';
		}
		html +=
			'            </div>\n' +
			'        </div>';

		$div.html(html);

		var $el = $div.find('.widget-container');
		if (!vis.editMode) {
			$el.data('calling-oid', data['calling-oid']);
			$el.data('incall-oid', data['incall-oid']);
			$el.data('lastduration-oid', data['lastduration-oid']);
			$el.data('lastnumber-oid', data['lastnumber-oid']);
			$el.data('callduration-oid', data['callduration-oid']);

			$el.find('.button-call').on('click', function () {vis.binds['sip-asterisk'].makeCall($el, data.phoneNumber);});
			$el.find('.button-accept').on('click', function () {vis.binds['sip-asterisk'].acceptCall($el);});
			$el.find('.button-decline').on('click', function () {vis.binds['sip-asterisk'].declineCall($el);});
			$el.find('.button-hang-up').on('click', function () {vis.binds['sip-asterisk'].endCall($el);});
			$el.find('.button-volume-down').on('click', function () {vis.binds['sip-asterisk'].volumeDown($el);});
			$el.find('.button-volume-up').on('click', function () {vis.binds['sip-asterisk'].volumeUp($el);});
			$el.find('.volume-slider').on('change', function () {vis.binds['sip-asterisk'].onVolumeChanged($el);});
			sipAdapter.init($el, data);
		} else {
			if (data.phoneNumber || data.noOutgoingCalls) {
				$el.find('.incomingCallContainer').removeClass('hidden');
				$el.find('.callFromLabel').html(_('Incoming call from %s', '+4912345678901'));
			}
		}
	},
    init: function ($el, data) {
		var sipAdapter = vis.binds['sip-asterisk'];
		sipAdapter.debug && console.log('Start init method');

		if (!vis.editMode) {
			sipAdapter.debug && console.log('set volume');
			var audioElement = $el.find('.audioRemote')[0];
			audioElement.volume = data.defaultVolume || 0.5;

			sipAdapter.debug && console.log('load sip account');
			sipAdapter.initSIP($el, data);
			sipAdapter.debug && console.log('Passed init method');
		}
	},
	formatCallTime(seconds) {
		var min = Math.floor(seconds / 60);
		var sec = seconds % 60;
		if (min < 10) {
			min = '0' + min;
		}
		if (sec < 10) {
			sec = '0' + sec;
		}
		return min + ':' + sec;
	},
	initSIP: function ($el, sipAccount) {
		var sipAdapter = vis.binds['sip-asterisk'];
		sipAdapter.debug && console.log('setup sip communication');
		var sipCommunication = $el.data('sipCommunication');

		if (sipCommunication) {
			sipAdapter.debug && console.log('reload for re-initialization');
			return location.reload();
		}
		try {
			var audioElement = $el.find('.audioRemote')[0];
			try {
				sipCommunication = new SIPWebRTCCommunication(sipAccount, audioElement);
				$el.data('sipCommunication', sipCommunication);
				sipAdapter.debug && console.log('sip communication ready');
				sipCommunication.onCallIncoming   = function () {sipAdapter.onCallIncoming($el, sipCommunication);};
				sipCommunication.onCallTerminated = function () {sipAdapter.onCallTerminated($el, sipCommunication);};
				sipCommunication.onCallConnected  = function () {sipAdapter.onCallConnected($el, sipCommunication);};
				sipAdapter.debug && console.log('sip event handlers added');
				$el.find('.status-message').html(_('Waiting for calls...'));
			} catch (e) {
				$el.find('.error-message').html(e);
			}

		} catch(e) {
			console.error('sip communication failed');
			console.error(e);
		}
	},
	onCallIncoming: function ($el, sipCommunication) {
		var sipAdapter = vis.binds['sip-asterisk'];
		var remoteFriendlyName = sipCommunication.getRemoteFriendlyName();
		sipAdapter.debug && console.log('call incoming from ' + remoteFriendlyName);

		var callingOid = $el.data('calling-oid');
		callingOid && vis.setValue(callingOid, remoteFriendlyName);

		$el.data('callingNumber', remoteFriendlyName);

		$el.find('.callFromLabel').html(_('Incoming call from %s', remoteFriendlyName));
		sipAdapter.showContainer($el, '.incomingCallContainer');
	},
	onCallTerminated: function ($el, sipCommunication) {
		vis.binds['sip-asterisk'].debug && console.log('call terminated');
		vis.binds['sip-asterisk'].showContainer($el, '.makeCallContainer');

		var timer = $el.data('timer');
		if (timer) {
			clearInterval(timer);
			$el.data('timer', null);
		}
		var callStart = $el.data('callStart');
		var callingNumber = $el.data('callingNumber');
		$el.data('callStart', null);
		$el.data('callingNumber', '');

		// Clear current number
		var inCallOid = $el.data('incall-oid');
		inCallOid && vis.setValue(inCallOid, '');

		// Store last number
		var lastNumberOid = $el.data('lastnumber-oid');
		lastNumberOid && vis.setValue(lastNumberOid, callingNumber);

		// Store last duration
		var lastDurationOid = $el.data('lastduration-oid');
		lastDurationOid && vis.setValue(lastDurationOid, vis.binds['sip-asterisk'].formatCallTime(Date.now() - callStart));
	},
	onCallConnected: function ($el, sipCommunication) {
		var sipAdapter = vis.binds['sip-asterisk'];
		var remoteFriendlyName = sipCommunication.getRemoteFriendlyName();

		// Clear calling number
		var callingOid = $el.data('calling-oid');
		callingOid && vis.setValue(callingOid, '');

		// Store current call number
		var incallOid = $el.data('incall-oid');
		$el.data('callingNumber', remoteFriendlyName);
		incallOid && vis.setValue(incallOid, remoteFriendlyName);

		$el.data('callStart', Date.now());

		// Update duration time
		var callDurationOid = $el.data('callduration-oid');

		if (callDurationOid) {
			vis.setValue(callDurationOid, vis.binds['sip-asterisk'].formatCallTime(0));

			$el.data('timer', setInterval(function () {
				vis.setValue(callDurationOid, vis.binds['sip-asterisk'].formatCallTime(Date.now() - $el.data('callStart')));
			}), 2000);
		}

		// Show hang-up button
		$el.find('.inCallLabel').html(_('In call with %s', remoteFriendlyName));
		sipAdapter.showContainer($el, '.inCallContainer');
	},
	makeCall: function ($el, phoneNumber) {
		var sipAdapter = vis.binds['sip-asterisk'];
		var sipCommunication = $el.data('sipCommunication');
		sipAdapter.debug && console.log('make call');
		if (!phoneNumber) {
			phoneNumber = $el.find('.phone-number-input').val();
		}

		sipCommunication.makeCall(phoneNumber);
		$el.find('.inCallLabel').html(_('Calling %s' + phoneNumber));
		sipAdapter.showContainer($el, '.inCallContainer');
	},
	acceptCall: function ($el) {
		vis.binds['sip-asterisk'].debug && console.log('accept call');
		$el.data('sipCommunication').acceptCall();
	},
	declineCall: function ($el) {
		vis.binds['sip-asterisk'].debug && console.log('decline call');

		var callingOid = $el.data('calling-oid');
		callingOid && vis.setValue(callingOid, '');

		var lastCallOid = $el.data('lastnumber-oid');
		lastCallOid && vis.setValue(lastCallOid, $el.data('callingNumber'));

		var lastDurationOid = $el.data('lastduration-oid');
		lastDurationOid && vis.setValue(lastDurationOid, '00:00');

		// stop duration interval
		var timer = $el.data('timer');
		if (timer) {
			clearInterval(timer);
			$el.data('timer', null);
		}
		$el.data('sipCommunication').declineCall();
	},
	endCall: function ($el) {
		vis.binds['sip-asterisk'].debug && console.log('end call');
		$el.data('sipCommunication').endCall($el);
	},

	showContainer : function ($el, container) {
		$el.find('.makeCallContainer').addClass('hidden');
		$el.find('.incomingCallContainer').addClass('hidden');
		$el.find('.inCallContainer').addClass('hidden');
		$el.find(container).removeClass('hidden');
	},
	volumeDown: function ($el) {
		vis.binds['sip-asterisk'].debug && console.log('volume down');
		var audioElement = $el.find('.audioRemote')[0];
		var $volumeSlider = $el.find('.volume-slider');
		var volume = Math.max(audioElement.volume - 0.1, 0.1);
		audioElement.volume = volume;
		$volumeSlider.val(volume);
	},
	volumeUp: function ($el) {
		vis.binds['sip-asterisk'].debug && console.log('volume up');
		var audioElement = $el.find('.audioRemote')[0];
		var $volumeSlider = $el.find('.volume-slider');
		var volume = Math.min(audioElement.volume + 0.1, 1.0);
		audioElement.volume = volume;
		$volumeSlider.val(volume);
	},
	onVolumeChanged: function ($el) {
		var audioElement = $el.find('.audioRemote');
		var $volumeSlider = $el.find('.volume-slider');
		audioElement.volume = $volumeSlider.val();
	}
};

vis.binds['sip-asterisk'].showVersion();