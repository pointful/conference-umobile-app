exports.events = {
    SESSION_ACTIVITY            : 'SessionActivity',
    NETWORK_ERROR               : 'networkConnectionError',
    SHOW_WINDOW                 : 'showWindow',
    SHOW_PORTLET                : 'showPortlet',
    //Layout-related events
    LAYOUT_CLEANUP              : 'layoutcleanup',
    DIMENSION_CHANGES           : 'dimensionchanges',
    ANDROID_ORIENTATION_CHANGE  : 'androidorientationchange',
    //Platform level events
    OPEN_EXTERNAL_URL           : 'OpenExternalURL'
};

exports.loginEvents = {
    ESTABLISH_NETWORK_SESSION: "EstablishNetworkSession",
    CLEAR_SESSION           : "ClearNetworkSession",
    NETWORK_SESSION_FAILURE : "EstablishNetworkSessionFailure",
    NETWORK_SESSION_SUCCESS : "EstablishNetworkSessionSuccess",
    LOGIN_METHOD_RESPONSE   : "LoginProxyLoginMethodResponse",
    LOGIN_METHOD_COMPLETE   : "LoginProxyLoginMethodComplete",
    WEBVIEW_LOGIN_RESPONSE  : "LoginProxyWebviewLoginResponse",
    WEBVIEW_LOGIN_FAILURE   : "LoginProxyWebviewLoginFailure",
    WEBVIEW_LOGIN_SUCCESS   : "LoginProxyWebviewLoginSuccess"
};

exports.userTypes = {
    GUEST   : "guest",
    NO_USER : "NoUser"
};

exports.portalEvents = {
    GETTING_PORTLETS            : 'PortalProxyGettingPortlets',
    PORTLETS_RETRIEVED_SUCCESS  : 'PortalProxyPortletsRetrievedSuccess',
    PORTLETS_RETRIEVED_FAILURE  : 'PortalProxyPortletsRetrievedFailure',
    PORTAL_REACHABLE          : "PortalUnreachable",
    PORTLETS_LOADED             : 'PortalProxyPortletsLoaded', //When portlets are sorted, organized, ready to use
    NETWORK_ERROR               : 'PortalProxyNetworkError'
};