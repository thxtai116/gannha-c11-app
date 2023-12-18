import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'm-brand-overview',
    templateUrl: './brand-overview.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandOverviewPage implements OnInit {

    private _obsers: any[] = [];

    constructor(
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        // for (let obs of this._obsers) {
        //     obs.unsubscribe();
        // }
    }
}
