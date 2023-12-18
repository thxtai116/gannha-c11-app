import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

const readLocalStorageObject = (storeKey: string): Object => {
    return JSON.parse(window.localStorage.getItem(storeKey) || '{}');
};

export function Cache({ pool }: { pool: string }) {
    return (target: any, key: string) => {

        Object.defineProperty(target, key, {

            get: () => readLocalStorageObject(pool)[key],

            set: (value: string) => window.localStorage.setItem(pool, JSON.stringify({
                ...readLocalStorageObject(pool),
                [key]: value
            })),

        });

    };
}

let OneSignal;

import { environment as env } from "../../../../environments/environment";

@Injectable()
export class OneSignalService {
    @Cache({ pool: 'OneSignal' }) oneSignalId: any;

    constructor(private _notificationService: NotificationService, ) {
    }

    public init() {
        this.initOneSignal();
    }

    private initOneSignal() {
        OneSignal = window['OneSignal'] || [];

        console.log('Init OneSignal');
        OneSignal.push(['init', {
            appId: env.oneSignal,
            autoRegister: false,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
                enable: false,
            },
        }]);

        console.log('OneSignal Initialized');

        OneSignal.push(() => {
            OneSignal.on('subscriptionChange', (isSubscribed) => {
                console.log('The user\'s subscription state is now:', isSubscribed);

                this.updateLocalUserProfile();
            });
        });

        this.checkIfSubscribed();
    }

    private subscribe() {
        console.log('Register For Push');
        OneSignal.push(["registerForPushNotifications"]);
    }

    private getUserID(): void {
        OneSignal.push(() => {
            Promise.resolve(OneSignal.getUserId()).then(userId => {
                this.oneSignalId = userId;

                console.log("Typscript OneSignal User ID:", userId);
            })
        });
    }

    private checkIfSubscribed() {
        OneSignal.push(() => {
            Promise.resolve(OneSignal.isPushNotificationsEnabled()).then(isEnabled => {
                if (isEnabled) {
                    console.log('Push notifications are enabled!');

                    this.updateLocalUserProfile();
                } else {
                    console.log('Push notifications are not enabled yet.');
                    this.subscribe();
                }
            })
        });
    }

    private updateLocalUserProfile(): void {
        OneSignal.push(() => {
            Promise.resolve(OneSignal.getUserId()).then(userId => {
                if (userId) {
                    console.log("Received User ID and proceed to register to Server");

                    this.oneSignalId = userId;

                    this._notificationService.registerOneSignal(userId).then(() => {
                        console.log("Registed device successful");
                    });
                } else {
                    console.log("Fail to receive User ID");
                }
            })
        });
    }
}