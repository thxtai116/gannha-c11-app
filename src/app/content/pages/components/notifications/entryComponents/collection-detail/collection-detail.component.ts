import { ChangeDetectionStrategy, Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import {
    CollectionService,

    CollectionModel,

    LanguagePipe,

    ScheduleUtility
} from '../../../../../../core/core.module';

class CollectionBasicInfoViewModel {
    Title: string = "";

    Description: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: string = "";

    Status: number = 0;

    CreatedAt: Date = new Date();
}

@Component({
    selector: 'm-notification-collection-detail',
    templateUrl: './collection-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionDetailComponent implements OnInit {

    @Input() resourceId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewModel: any = {
        collection: new CollectionBasicInfoViewModel()
    }

    form: FormGroup;

    constructor(
        private _collectionService: CollectionService,
        private _scheduleUtil: ScheduleUtility,
        private _changeRef: ChangeDetectorRef
    ) {
        this.form = this.generateForm();
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

                this.setForm(value[0]);

                this._changeRef.detectChanges();
            }).finally(() => {
                this.viewControl.loading$.next(false);
            })
        }
    }

    private setForm(model: CollectionModel): void {
        this.form.get("Gallery").setValue(model.Gallery);
        this.form.get("Resources").setValue(model.Resources);
        this.form.get("TimeRanges").setValue(model.TimeRanges);
    }

    private parseToViewModel(model: CollectionModel): CollectionBasicInfoViewModel {
        let vm = new CollectionBasicInfoViewModel();

        vm.Title = new LanguagePipe().transform(model.Title);
        vm.Description = new LanguagePipe().transform(model.Description);

        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);
        vm.TimeRanges = model.TimeRanges;

        vm.Status = model.Status;
        vm.CreatedAt = new Date(model.CreatedAt);

        vm.Repeat = this._scheduleUtil.toString(model.Repeat);

        return vm;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Gallery: new FormControl([]),
            Resources: new FormControl([]),
            TimeRanges: new FormControl([])
        });
    }
}
