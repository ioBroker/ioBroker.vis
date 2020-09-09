class SIPWebRTCAccount {

    constructor(){
        this.CONST_PRIVATE_IDENTITY = "privateIdentity";
        this.CONST_PUBLIC_IDENTITY = "publicIdentity";
        this.CONST_PASSWORD = "password";
        this.CONST_DISPLAY_NAME = "displayName";
        this.CONST_WEBSOCKET_PROXY_URL = "websocket_proxy_url";
        this.CONST_REALM = "realm";

        this._privateIdentity = null;
        this._publicIdentity = null;
        this._password = null;
        this._displayName = null;        
        this._websocket_proxy_url = null;
        this._realm = null;

        this._loadAccountDataToLocalStorage();
    }

    setAccountData(privateIdentity, publicIdentity, password, displayName, websocket_proxy_url, realm){
        this._privateIdentity = privateIdentity;
        this._publicIdentity = publicIdentity;
        this._password = password;
        this._displayName = displayName;
        this._websocket_proxy_url = websocket_proxy_url;
        this._realm = realm;

        this._saveAccountDataToLocalStorage();
    }

    get PrivateIdentity(){
        return this._privateIdentity;
    }

    get PublicIdentity(){
        return this._publicIdentity;
    }

    get Password(){
        return this._password;
    }

    get DisplayName(){
        return this._displayName;
    }

    get WebsocketProxyURL(){
        return this._websocket_proxy_url;
    }

    get Realm(){
        return this._realm;
    }

    IsCorrectInitialized(){
        if(this._privateIdentity && this._publicIdentity && this._password && this._displayName){
            return true;
        } else {
            return false;
        }
    }

    _saveAccountDataToLocalStorage(){
        localStorage.setItem(this.CONST_PRIVATE_IDENTITY, this._privateIdentity);
        localStorage.setItem(this.CONST_PUBLIC_IDENTITY, this._publicIdentity);
        localStorage.setItem(this.CONST_PASSWORD, this._password);
        localStorage.setItem(this.CONST_DISPLAY_NAME, this._displayName);
        localStorage.setItem(this.CONST_WEBSOCKET_PROXY_URL, this._websocket_proxy_url );
        localStorage.setItem(this.CONST_REALM, this._realm);
    }

    _loadAccountDataToLocalStorage(){
        this._privateIdentity = localStorage.getItem(this.CONST_PRIVATE_IDENTITY);
        this._publicIdentity = localStorage.getItem(this.CONST_PUBLIC_IDENTITY);
        this._password = localStorage.getItem(this.CONST_PASSWORD);
        this._displayName = localStorage.getItem(this.CONST_DISPLAY_NAME);
        this._websocket_proxy_url = localStorage.getItem(this.CONST_WEBSOCKET_PROXY_URL);
        this._realm = localStorage.getItem(this.CONST_REALM);
    }

}
