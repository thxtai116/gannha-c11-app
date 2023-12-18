export const environment = {
    production: false,
    enableOneSignal: false,
    name: "Local",

    oauth: {
        loginUrl: 'http://passport.dev.gannha.com/connect/authorize',
        logoutUrl: 'http://passport.dev.gannha.com/account/logout',
        issuer: 'http://passport.dev.gannha.com/connect/token',
        clientId: '78dd1f26-41e6-4b4d-b9bf-9de848197bb7',
        redirectUri: window.location.origin + '/sign-in',
        redirectLogoutUri: window.location.origin + '/logout',
        silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
        scope: 'nearme.central',
    },

    service: {
        endpoint_vnext: 'http://central.dev.gannha.com',
        endpoint: 'http://central.dev.gannha.com/v1',
        passport: "http://passport.dev.gannha.com/api/v1",
        gnCommerce: "http://commerce-dev.gannha.com/v1",
        promotions: "http://commerce-dev.gannha.com/v1"
    },

    applicationInsights: {
        instrumentationKey: ""
    },

    version: "v1.0.0.0",
    storageEndpoint: "http://file.dev.gannha.com/assets/icons/",
    googleKey: "AIzaSyBW3OkWO9d7AhngXLLg03bkgsjHL-u6V6c",
    fileStorageEndpoint: "http://file.dev.gannha.com",

    oneSignal: "46c9d8d5-3fd1-4ab4-bffb-bb476de00309",
};
