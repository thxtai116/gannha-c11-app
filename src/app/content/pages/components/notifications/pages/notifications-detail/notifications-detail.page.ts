import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
    CollectionService,
    
    CollectionModel,

    LanguagePipe
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-notifications-detail',
    templateUrl: './notifications-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsDetailPage implements OnInit {

    @Input() resourceId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewModel: any = {
        collection: {}
    }

    constructor(
        private _collectionService: CollectionService
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
                this._collectionService.get(id)
            ]).then(value => {
                this.viewModel.collection = this.parseToViewModel(value[0]);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private parseToViewModel(model: CollectionModel): any {
        let vm: any = {};

        vm.Title = new LanguagePipe().transform(model.Title);

        return vm;
    }
}
