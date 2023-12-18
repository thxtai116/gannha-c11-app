import { Component, OnInit, Input, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-order-status-badge',
    templateUrl: './order-status-badge.component.html',
    styleUrls: ['./order-status-badge.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderStatusBadgeComponent implements OnInit {

    @Input("status") status: number = 0;

    statusClass: string = "pending";
    statusName: string = "N/A";

    lang: string = "vi";

    constructor(
        private _translate: TranslateService
    ) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (let propName in changes) {
            if (propName == "status") {
                this.statusName = this.getStatusName(this.status);
                this.statusClass = this.getStatusClass(this.status);
            }
        }
    }

    private getStatusClass(status: number = 0): string {
        let name = "pending";

        switch (status) {
            case 10:
                name = "pending";
                break;

            case 20:
                name = "processing";
                break;

            case 30:
                name = "complete";
                break;

            case 40:
                name = "cancelled";
                break;
        }

        return name;
    }

    private getStatusName(status: number = 0): string {
        let name = "N/A";

        switch (status) {
            case 10:
                name = this._translate.instant("ORDERS.STATUSES.PENDING");
                break;

            case 20:
                name = this._translate.instant("ORDERS.STATUSES.PROCESSING");
                break;

            case 30:
                name = this._translate.instant("ORDERS.STATUSES.COMPLETE");
                break;

            case 40:
                name = this._translate.instant("ORDERS.STATUSES.CANCELLED");
                break;
        }

        return name;
    }
}
