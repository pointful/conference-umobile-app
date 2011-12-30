/*
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * PortalWindowView.js contains the main home view, controlled
 * by PortalWindowController.js
 */
exports.states = {
    INCLUDED        : "Included",
    INITIALIZED     : "Initialized",
    OPENED          : "Opened",
    HIDDEN          : "Hidden",
    CLOSED          : "Closed"
};

exports.indicatorStates = {
    NONE        : "None",
    GUEST       : "Guest",
    NO_PORTAL   : "NoPortal"
};

exports.events = {
    ANDROID_SEARCH_CLICKED  : 'HomeAndroidSearchButtonClicked',
    NOTIFICATION_CLICKED    : 'PortalDownNotificationClicked'
};
 
var _state, styles, deviceProxy, localDictionary, app, config,
_layoutState = exports.indicatorStates['NONE'],
_win, _contentLayer, _titleBar, _activityIndicator, notificationsView, isNotificationsViewInitialized, portalGridView;

exports.initialize = function (portalProxy) {
    portalGridView = require('/js/views/PortalGridView');
    portalGridView.doSetPortalProxy(portalProxy);
    notificationsView = require('/js/views/PortalNotificationsView');
    exports.saveState(exports.states['INITIALIZED']);
};

exports.open = function (_modules, _isGuestLayout, _isPortalReachable, _isFirstOpen) {
    app = require('/js/Facade');
    config = require('/js/config');
    styles = require('/js/style');
    deviceProxy = require('/js/models/DeviceProxy');
    localDictionary = require('/js/localization')[Ti.App.Properties.getString('locale')];
    
    if (!_win) _win = Ti.UI.createWindow(styles.portalWindow);

    if (exports.retrieveState() === exports.states['INITIALIZED']) {
        _win.open();
        _drawUI(_isGuestLayout, _isPortalReachable);
        
        Ti.App.addEventListener(portalGridView.events['STATE_CHANGE'], _onPortalGridViewStateChange);
        Ti.App.addEventListener(notificationsView.events['EMERGENCY_NOTIFICATION'], _onEmergencyNotification);
    }
    else {
        _win.show();
        _updateUI(_isGuestLayout, _isPortalReachable);
    }
    if (deviceProxy.isIOS()) _win.visible = true;
    
    _win.addEventListener('android:search', _onAndroidSearch);

    // exports.showActivityIndicator(localDictionary.gettingPortlets);
    // portalGridView.updateGrid(_modules);
            
    exports.saveState(exports.states.OPENED);
};

exports.close = function () {
    app = null;
    config = null;
    styles = null;
    deviceProxy = null;
    localDictionary = null;
    _win.hide();
    _win.removeEventListener('android:search', _onAndroidSearch);
    
    exports.saveState(exports.states.HIDDEN);
};

exports.rotateView = function (orientation) {
    if (_contentLayer) {
        _contentLayer.width = styles.portalContentLayer.width;
        _contentLayer.height = styles.portalContentLayer.height;
    }
    if (isNotificationsViewInitialized) notificationsView.view().top = styles.homeGuestNote.top;
    if (portalGridView) portalGridView.rotate(orientation, notificationsView.currentState() === notificationsView.states['HIDDEN'] ? false : true);
    if (_activityIndicator) _activityIndicator.rotate();
    if (_titleBar) _titleBar.rotate();
};

function _drawUI (_isGuestLayout, _isPortalReachable) {
    // This method should only be concerned with drawing the UI, not with any other logic. Leave that to the caller.
    if (_contentLayer) {
        _win.remove(_contentLayer);
    }
    
    _contentLayer = Ti.UI.createView(styles.portalContentLayer);
    _win.add(_contentLayer);
    _contentLayer.add(portalGridView.retrieveGridView());

    _controlNotificationsBar();

    _activityIndicator = require('/js/views/UI/ActivityIndicator');
    _win.add(_activityIndicator.view);

    _titleBar = require('/js/views/UI/TitleBar');
    _titleBar.addSettingsButton();
    _titleBar.addInfoButton();
    _titleBar.updateTitle(localDictionary.homeTitle);
    _win.add(_titleBar.view);
};

function _updateUI (_isGuestLayout, _isPortalReachable) {
    _controlNotificationsBar(_isGuestLayout, _isPortalReachable);
};

exports.saveState = function (newState) {
    _state = newState;
};

exports.retrieveState = function () {
    return _state;
};

exports.updateModules = function (_modules, _isPortalReachable, _isGuestLayout) {
    if (portalGridView) portalGridView.updateGrid(_modules);
    if (!_isPortalReachable) _layoutState = exports.indicatorStates['NO_PORTAL'];
    if (_isGuestLayout) _layoutState = exports.indicatorStates['GUEST'];
    _controlNotificationsBar();
    exports.hideActivityIndicator();
};

exports.showActivityIndicator = function (message) {
    _activityIndicator.saveLoadingMessage(message || localDictionary.loading);
    _activityIndicator.view.show();
};

exports.hideActivityIndicator = function () {
    _activityIndicator.view.hide();
};

exports.alert = function (title, message) {
    Ti.API.debug('alert() in PortalWindowView');
    exports.hideActivityIndicator();
    // if (deviceProxy.isIOS() || _win.visible) {
        try {
            // alert(message);
            Titanium.UI.createAlertDialog({ title: title,
                message: message, buttonNames: [localDictionary.OK]
                }).show();
        }
        catch (e) {
            Ti.API.error("Couldn't show alert:" + e);
        }            
    // }
};

exports.updateNotificationsView = function (notifications) {
    //Update the layout indicator with number of notifications, or emergency notification.
    if (isNotificationsViewInitialized) notificationsView.showNotificationSummary(notifications);
    
    portalGridView.resizeGrid(notificationsView.currentState() === notificationsView.states['HIDDEN'] ? false : true);
};

function _onEmergencyNotification (e) {
    exports.alert(localDictionary.emergencyNotification, e.message);
}

function _specialLayoutIndicatorClick (e) {
    Ti.API.debug('_specialLayoutIndicatorClick');
    var _emergencyNote;
    switch (notificationsView.currentState()) {
        case notificationsView.states['GUEST_USER']:
            Ti.App.fireEvent(app.events['SHOW_WINDOW'], {newWindow: config.SETTINGS_KEY});
            break;
        case notificationsView.states['PORTAL_UNREACHABLE']:
            Ti.App.fireEvent(app.events['SHOW_WINDOW'], {newWindow: config.SETTINGS_KEY});
            break;
        case notificationsView.states['NOTIFICATIONS_SUMMARY']:
            // notificationsView.showNotificationsList();
            if (_emergencyNote = notificationsView.emergencyNote()) exports.alert(localDictionary.emergencyNotification, _emergencyNote.message);
            break;
        case notificationsView.states['NOTIFICATIONS_EXPANDED']:
            notificationsView.hideNotificationsList();
            break;
        default:
            Ti.App.fireEvent(app.events['SHOW_WINDOW'], {newWindow: config.SETTINGS_KEY});
    }
};

function _controlNotificationsBar () {
    if (_layoutState === exports.indicatorStates['GUEST'] ||
        _layoutState === exports.indicatorStates['NO_USER'] ||
        config.NOTIFICATIONS_ENABLED) {
        _addNotificationsBar();
    }
    else {
        _removeNotificationsBar();
    }
}

function _removeNotificationsBar () {
    notificationsView.hide();
    portalGridView.resizeGrid(false);
};

function _addNotificationsBar () {
    var guestNotificationLabel, _timeout, _method;
    if (!isNotificationsViewInitialized) {
        Ti.API.debug('!!! !isNotificationsViewInitialized');
        Ti.API.debug(isNotificationsViewInitialized);
        notificationsView.createView();
        notificationsView.view().addEventListener('click', _specialLayoutIndicatorClick);
        
        isNotificationsViewInitialized = true;
        
        _contentLayer.add(notificationsView.view());
    }
    notificationsView.show();
    
    _method = _layoutState === exports.indicatorStates['NO_USER'] ? 'showPortalUnreachableNote' : _layoutState === exports.indicatorStates['GUEST'] ? 'showGuestNote' : 'showNotificationSummary';
    notificationsView[_method]();
    
    portalGridView.resizeGrid(notificationsView.currentState() === notificationsView.states['HIDDEN'] ? false : true);
};

function _onAndroidSearch (e) {
	Ti.App.fireEvent(exports.events['ANDROID_SEARCH_CLICKED'], {eventBody: e});
};

function _onDimensionChanges (e) {
    // We want to make sure the content layer (the view holding the icons) 
    // is the appropriate size when the device rotates
    // Let's update the Styles reference again for good measure
    if (_contentLayer) {
        _contentLayer.width = styles.portalContentLayer.width;
        _contentLayer.height = styles.portalContentLayer.height;
    }
    
    if (isNotificationsViewInitialized) {
        notificationsView.view().top = styles.homeGuestNote.top;
    }
};



function _onPortalGridViewStateChange (e) {
    if (portalGridView && _activityIndicator && e.state && e.state === portalGridView.states['COMPLETE']) {
        exports.hideActivityIndicator(portalGridView.states['COMPLETE']);
    }
};