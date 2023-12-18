import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RecruitmentModel, SubheaderService } from '../../../../../../core/core.module';
import { RecruitmentsDetailState } from '../../states';
import { MenuService } from '../../services';

@Component({
    selector: 'm-recruitments-basic-info',
    templateUrl: './recruitments-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecruitmentsBasicInfoPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Recruitment", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    };

    viewData: any = {
        recruitment: new RecruitmentModel()
    };

    constructor(
        private _recruitmentsDetailState: RecruitmentsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService
    ) {
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        if (this._recruitmentsDetailState.recruitment$.getValue()) {
            this.viewData.recruitment = this._recruitmentsDetailState.recruitment$.getValue();

            this._readyConditions.set("Recruitment", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._recruitmentsDetailState.menu$.next(this._menuService.getRecruitmentDetailMenu());

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITMENTS.LIST", page: '/recruitments' },
            { title: `${this.viewData.recruitment.Title}`, page: `/recruitments/${this.viewData.recruitment.Id}` },
            { title: "RECRUITMENTS.BASIC_INFO", page: `/recruitments/${this.viewData.recruitment.Id}/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._recruitmentsDetailState.recruitment$.subscribe(value => {
                if (value) {
                    this.viewData.recruitment = value;

                    this._readyConditions.set("Recruitment", true);

                    this.init();
                }
            })
        );
    }
}
