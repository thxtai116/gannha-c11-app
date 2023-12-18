import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from "@angular/core";
import { RecruiterService } from '../../../../../../core/services';
import { ActivatedRoute } from '@angular/router';
import { RecruitersState } from '../../states';

@Component({
    selector: 'm-recruiters-detail',
    templateUrl: 'recruiters-detail.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitersDetailPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _id: string = "";

    constructor(
        private _route: ActivatedRoute,
        private _recruitersState: RecruitersState,
        private _recruiterService: RecruiterService,
    ) { }

    ngOnInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers)
            obs.unsubscribe();
    }

    private init() {
        this._id = this._route.snapshot.params["id"];

        Promise.all([
            this._recruiterService.get(this._id)
        ]).then(value => {
            this._recruitersState.selectedRecruiter.next(value[0]);
        })
    }
}