var WindowManager = function (facade) {
    var app=facade, init, hidePreviousWindow, self = {}, applicationWindows = [], activityStack = [],
        onAndroidBack, onShowWindow, onShowPortlet, ensureOpenTimer;

    init = function () {
        Ti.App.addEventListener('showWindow', onShowWindow);
        Ti.App.addEventListener('showPortlet', onShowPortlet);
    };
    
    self.addWindow = function (windowParams) {
        if (windowParams && windowParams.key) {
            applicationWindows[windowParams.key] = windowParams;
        }
        else {
            Ti.API.error("Incomplete windowParams were passed in to addWindow() in WindowManager" + JSON.stringify(windowParams));
        }
    };
    
    self.openWindow = function (windowKey, portlet) {
        Ti.API.debug("openWindow() in WindowManager");
        if (applicationWindows[windowKey]) {
            if (activityStack.length == 0) {
                applicationWindows[windowKey].open();
            }
            else if (applicationWindows[activityStack[(activityStack.length - 1)]] != applicationWindows[windowKey]) {
                //We don't want the webview to keep loading as the user navigates to a new window.
                //If the user is navigating to a webView window, it will load the webview when it's ready.
                app.views.SharedWebView.stopLoading();
                hidePreviousWindow();
                
                if (windowKey !== 'home') {
                    //Home is always present, never needs opened or closed.
                    Ti.API.info("new window isn't home");
                    if (portlet) {
                        Ti.API.debug("new window is a portlet");
                        applicationWindows[windowKey].open(portlet);
                    }
                    else {
                        Ti.API.debug("new window is NOT a portlet" + applicationWindows[windowKey].key + '' + applicationWindows[windowKey]);
                        applicationWindows[windowKey].open();
                    }
                }
            }
            else {
                Ti.API.debug("You're trying to navigate to the same window you're already in.");
            }
            //We want the activity stack to know that this was the most recent window.
            activityStack.push(windowKey);
        }
        else {
            Ti.API.error('No window exists for that key: ' + windowKey);
        }
    };
    
    self.goBack = function () {
        //Show the previous window, and add it to the top of the activity stack.
        if (activityStack.length >= 2) {
            self.openWindow(activityStack[activityStack.length - 2]);
        }
    };
    
    self.getCurrentWindow = function () {
        return activityStack[activityStack.length - 1];
    };
    
    hidePreviousWindow = function () {
        // This will hide the previous window, presuming that the previous window
        // exists, and that it isn't the home screen.
        if (activityStack.length > 0 && activityStack[activityStack.length - 1] !== 'home') {
            Ti.API.debug("Hiding previous window: " + activityStack[activityStack.length - 1]);
            applicationWindows[activityStack[activityStack.length - 1]].close();
        }
    };
    
    //Event Handlers
    onAndroidBack = function (e) {
        self.goBack();
    };
    
    onShowWindow = function (e) {
        Ti.API.debug("showWindow Event. New: " + e.newWindow + ", Old: " + e.oldWindow);
        self.openWindow(e.newWindow);
    };
    
    onShowPortlet = function (portlet) {
        Ti.API.info("Showing portlet window " + portlet.title);
        self.openWindow('portlet', portlet);
    };
    
    init();
    
    return self;
};