import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {
    BrandModel,

    JobBenefitService,
    JobTypeService,
    JobTitleService,

    GlobalState,
} from '../../../../core/core.module';

import { JobsState } from './states';

@Component({
    selector: 'm-jobs',
    templateUrl: './jobs.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsPage implements OnInit {
    private _obsers: any[] = [];
    private _ready: boolean = false;
    private _brand: BrandModel = new BrandModel();

    constructor(
        private _jobBenefitService: JobBenefitService,
        private _jobTypeService: JobTypeService,
        private _jobTitleService: JobTitleService,
        private _globalState: GlobalState,
        private _jobsState: JobsState,
    ) { }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private init(): void {
        if (this._ready)
            return;

        this._ready = true;

        Promise.all([
            this._jobBenefitService.getAll(),
            this._jobTypeService.getAll(),
            this._jobTitleService.getAll(),
        ]).then(value => {
            this._jobsState.jobBenefits$.next(value[0]);
            this._jobsState.jobTypes$.next(value[1]);
            this._jobsState.jobTitles$.next(value[2]);
        });
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._globalState.brand$.subscribe(value => {
                if (value) {
                    this._brand == value;

                    this._jobsState.brand$.next(value);

                    this.init();
                }
            })
        )
    }
}
