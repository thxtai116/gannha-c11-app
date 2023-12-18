import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BrandService, LanguagePipe, BrandModel } from '../../../../../../core/core.module';

@Component({
    selector: 'm-notification-brand-detail',
    templateUrl: './brand-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandDetailComponent implements OnInit {

    @Input() resourceId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewModel: any = {
        brand: {}
    }

    constructor(
        private _brandService: BrandService
    ) {
    }

    ngOnInit() {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.resourceId$.subscribe(value => {
                if (value) {
                    this.init(value);
                }
            })
        );
    }

    private init(id: string): void {
        if (id) {
            this.viewControl.loading$.next(true);

            Promise.all([
                this._brandService.get(id)
            ]).then(value => {
                this.viewModel.brand = this.parseToViewModel(value[0]);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private parseToViewModel(model: BrandModel): any {
        let vm: any = {};

        vm.Name = new LanguagePipe().transform(model.Name);

        return vm;
    }
}
