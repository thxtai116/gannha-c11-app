import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuItemModel, JobService, JobModel, BrandModel, GlobalState } from '../../../../../../core/core.module';

import { JobsDetailState, JobsState } from '../../states';

@Component({
    selector: 'm-jobs-detail',
    templateUrl: './jobs-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsDetailPage implements OnInit {

    private _obsers: any[] = [];
    private _id: string = "";
    private _brand: BrandModel = new BrandModel();
    private _job: JobModel = new JobModel();

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false]
    ]);

    menu: MenuItemModel[] = [];
    ready: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _jobService: JobService,
        private _globalState: GlobalState,
        private _jobsDetailState: JobsDetailState,
        private _jobsState: JobsState,

    ) { }

    ngOnInit() {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        this._jobsDetailState.job$.next(null);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.ready) {
                this._router.navigate(['units']);
            } else {
                this._id = this._route.snapshot.params["id"];

                if (this._id) {
                    Promise.all([
                        this._jobService.get(this._id),
                    ]).then(value => {
                        if (value[0]) {
                            this._job = value[0];

                            if (this._job.BrandId !== this._brand.Id) {
                                this._globalState.syncBrand.next(this._job.BrandId);
                            } else {
                                this.ready = true;

                                this._jobsDetailState.job$.next(this._job);
                            }
                        } else {
                            this._router.navigate(['units']);
                        }
                    });
                }
            }
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsDetailState.menu$.subscribe(value => {
                if (value) {
                    this.menu = value;
                }
            })
        );

        this._obsers.push(
            this._jobsState.brand$.subscribe(value => {
                if (value && value.Id.length > 0) {
                    this._brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        )
    }
}
