/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
		var connLink     = window.localStorage.getItem("connLink") || "";
		var connSettings = window.localStorage.getItem("connSettings");
		connSettings = (connSettings === "true" || connSettings === true);
		
        console.log('connSettings: ' + connSettings);
        console.log('connLink: ' + connLink);
		
		if (!connLink || connSettings) {
			console.log('Go to settings');
			receivedElement.setAttribute('style', 'display:none;');
			document.getElementById("settings").setAttribute('style', 'display:block;');
			document.getElementById("connLink").value = window.localStorage.getItem("connLink") || "";
			window.localStorage.setItem("connSettings", false);
		} else {	
			console.log('Go to DashUI');
			window.location.href = "dashui/index.html";
		}
    },
	setLink: function () {
		var link = document.getElementById('connLink').value;
		if (link && (link.indexOf("http://") != -1 || link.indexOf("https://") != -1)) {
			console.log('Go to DashUI');
			window.localStorage.setItem('connLink', link);
			window.location.href = 'dashui/index.html';
		} else {
			document.getElementById('error').innerHTML = 'Invalid link. Use format "http://ip:port"';
		}
	}	
};
