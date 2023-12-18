import { Component, OnInit, Input, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-raw-unit-status-badge',
    templateUrl: './raw-unit-status-badge.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawUnitStatusBadgeComponent implements OnInit {

    @Input("status") status: number = 0;

    statusClass: string = "metal"
    statusName: string = "N/A";

    constructor(
        private _translate: TranslateService,
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
        }

        return name;
    }

    private getStatusName(status: number = 0): string {
        let name = "N/A";

        switch (status) {
            case 0:
                name = this._translate.instant('RAW_UNITS.ACTION_STATUS.NEW')
                break;

            case 2:
                name = this._translate.instant('RAW_UNITS.ACTION_STATUS.IDENTIFIED')
                break;

            case 4:
                name = this._translate.instant('RAW_UNITS.ACTION_STATUS.READ')
                break;
        }

        return name;
    }
}
