import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'm-units-overview',
    templateUrl: './units-overview.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitsOverviewPage implements OnInit {

    constructor(
    ) {
    }

    ngOnInit(): void {
    }
}
