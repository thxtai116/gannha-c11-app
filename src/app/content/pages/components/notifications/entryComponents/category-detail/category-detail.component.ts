import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CategoryService, CategoryModel, LanguagePipe } from '../../../../../../core/core.module';

@Component({
    selector: 'm-notification-category-detail',
    templateUrl: './category-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDetailComponent implements OnInit {

    @Input() resourceId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewModel: any = {
        category: {}
    }

    constructor(
        private _categoryService: CategoryService
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
                this._categoryService.get(id)
            ]).then(value => {
                this.viewModel.category = this.parseToViewModel(value[0]);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private parseToViewModel(model: CategoryModel): any {
        let vm: any = {};

        vm.Name = new LanguagePipe().transform(model.Name);

        return vm;
    }
}
