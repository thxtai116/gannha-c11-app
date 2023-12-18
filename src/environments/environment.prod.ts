export const environment = {
    production: true,
    enableOneSignal: true,
    name: "Production",

    oauth: {
        loginUrl: 'https://passport.gannha.com/connect/authorize',
        logoutUrl: 'https://passport.gannha.com/account/logout',
        issuer: 'https://passport.gannha.com/connect/token',
        clientId: 'b5a8c4ac-60c1-47d2-b528-36eacc372897',
        redirectUri: window.location.origin + '/sign-in',
        redirectLogoutUri: window.location.origin + '/logout',
        silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
        scope: "nearme.central"
    },

    service: {
        endpoint_vnext: 'https://central.gannha.com',
        endpoint: 'https://central.gannha.com/v1',
        passport: "https://passport.gannha.com/api/v1",
        gnCommerce: "https://commerce.gannha.com/v1",
        promotions: "https://commerce.gannha.com/v1"
    },

    applicationInsights: {
        instrumentationKey: "38025786-b249-47a7-98ab-0622376c6681"
    },

    version: "v1.0.0.0",
    googleKey: "AIzaSyCR_RClyNqsPftfrt8O1JEZDKf2t854wVA",
    fileStorageEndpoint: "https://file.gannha.com",
    storageEndpoint: "https://file.gannha.com/assets/icons/",
    oneSignal: "82d97c21-f664-4859-9945-92a33a44b719",
};