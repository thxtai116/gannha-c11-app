export const environment = {
    production: false,
    enableOneSignal: false,
    name: "Staging",

    oauth: {
        loginUrl: 'https://staging-passport.gannha.com/connect/authorize',
        logoutUrl: 'https://staging-passport.gannha.com/account/logout',
        issuer: 'https://staging-passport.gannha.com/connect/token',
        clientId: 'b5a8c4ac-60c1-47d2-b528-36eacc372897',
        redirectUri: window.location.origin + '/sign-in',
        redirectLogoutUri: window.location.origin + '/logout',
        silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
        scope: 'nearme.central',
    },

    service: {
        endpoint_vnext: 'http://central.dev.gannha.com',
        endpoint: 'https://staging-api.gannha.com/v1',
        passport: "https://staging-passport.gannha.com/api/v1",
        gnCommerce: "https://commerce-dev.gannha.com/v1",
        promotions: "http://commerce-dev.gannha.com/v1"
    },

    applicationInsights: {
        instrumentationKey: ""
    },

    version: "v1.0.0.0",
    googleKey: "AIzaSyC1jP4-w0vxSJDAtQi1QKgveucEYoEn2Jg",
    fileStorageEndpoint: "https://file.gannha.com",
    storageEndpoint: "http://file.gannha.com/assets/icons/",
    oneSignal: "46c9d8d5-3fd1-4ab4-bffb-bb476de00309",
};
