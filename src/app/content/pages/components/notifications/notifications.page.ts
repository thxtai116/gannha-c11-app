import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'm-notifications',
    templateUrl: './notifications.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPage implements OnInit {

    constructor(
    ) {
    }

    ngOnInit(): void {
    }
}
