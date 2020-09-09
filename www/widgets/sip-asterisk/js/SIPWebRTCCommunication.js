class SIPWebRTCCommunication {

    constructor(sipAccount, audioElement){
        this._init(sipAccount.Realm, sipAccount.PrivateIdentity, sipAccount.PublicIdentity, sipAccount.Password, sipAccount.DisplayName, sipAccount.WebsocketProxyURL);
        this._audioRemoteElement = audioElement;
    }

    /*
    * PUBLIC METHODS
    */
    makeCall(identity) {
        this._callSession = this._sipStack.newSession(
            'call-audio', {
                events_listener: {
                    events: '*',
                    listener: (e) => this._callEventsListener(e)
                },
                audio_remote: this._audioRemoteElement
            });

        this._callSession.call(identity);
    }

    acceptCall() {
        this._callSession.accept();
    }

    declineCall() {
        this._callSession.reject();
    }

    endCall() {
        this._callSession.hangup();
    }

    getRemoteFriendlyName() {
        return this._callSession.getRemoteFriendlyName() || "unknown";
    }

    /*
    * PRIVATE METHODS
    */
    _init(realm, privateIdentity, publicIdentity, password, displayName, websocket_proxy_url){
        let readyCallback = (e) => {
            this._createSipStack(realm, privateIdentity, publicIdentity, password, displayName, websocket_proxy_url);
        }

        let errorCallback = (e) => {
            console.error (e.message);
        }

        SIPml.init(readyCallback, errorCallback);
    }

    _createSipStack(realm, privateIdentity, publicIdentity, password, displayName, websocket_proxy_url){
        this._sipStack = new SIPml.Stack({
            realm: realm,
            impi: privateIdentity, //private
            impu: publicIdentity, //public
            password: password,
            display_name: displayName,
            websocket_proxy_url: websocket_proxy_url,
            outbound_proxy_url: null,
            ice_servers: "[]", // disable ICE gathering
            enable_rtcweb_breaker: false,
            enable_early_ims: true, // Must be true unless you're using a real IMS network
            enable_media_stream_cache: true,
            events_listener: {events: '*', listener: (e) => this._stackEventsListener(e)}
        });

        this._sipStack.start();
    }

    _login(){
        this._registerSession = this._sipStack.newSession(
            'register',
            {
                events_listener: {events: '*', listener: (e) => this._sessionEventsListener(e)}
            });

        this._registerSession.register();
    }

    /*
     * EVENT HANDLER
     */
    _stackEventsListener(event) {
        console.log('Stack Event.', event.type);
        if(event.type == 'started'){
            this._login();
        }
        else if(event.type == 'i_new_call'){
            // incoming audio/video call
            this._callSession = event.newSession;
            this._callSession.setConfiguration({
                audio_remote:  this._audioRemoteElement,
                events_listener: { events: '*', listener: (e) => this._callEventsListener(e)},
            });
            if(this.onCallIncoming){
                this.onCallIncoming();
            }
        }
    }

    _sessionEventsListener(event) {
        console.log('Session Event.', event.type);
    }

    _callEventsListener(event) {
        console.log('Call Event.', event.type);
        if(event.type == 'connected'){
            this._audioRemoteElement.play();
            this.onCallConnected();
        }
        if(event.type == 'terminated'){
            if(this.onCallTerminated){
                this.onCallTerminated();
            }
        }
    }

}
