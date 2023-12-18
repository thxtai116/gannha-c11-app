import { Component, OnInit, Input, SimpleChange, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-object-status-badge',
    templateUrl: './object-status-badge.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectStatusBadgeComponent implements OnInit {

    @Input("status") status: number = 0;

    statusClass: string = "metal"
    statusName: string = "N/A";

    constructor() {
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
        let name = "metal";

        switch (status) {
            case 0:
                name = "metal";
                break;

            case 2:
                name = "success";
                break;

            case 4:
                name = "focus";
                break;

            case 8:
                name = "danger";
                break;

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
            case 0:
                name = "Pending";
                break;

            case 2:
                name = "Active";
                break;

            case 4:
                name = "Expired";
                break;

            case 8:
                name = "Deactive";
                break;

            case 10:
                name = "Pending";
                break;

            case 20:
                name = "Processing";
                break;

            case 30:
                name = "Complete";
                break;

            case 40:
                name = "Cancelled";
                break;
        }

        return name;
    }
}
