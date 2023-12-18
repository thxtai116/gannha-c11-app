import { ChangeDetectionStrategy, OnInit, Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import { JobModel, GnServiceConfigModel, SubheaderService, SystemAlertService, BrandService, OpenServiceConfigurationForm, JobService } from '../../../../../../core/core.module';

import { JobsDetailState } from '../../states';

import { MenuService } from '../../services';
import { JobUnitsViewModel } from '../../view-models';

@Component({
    selector: 'm-jobs-units',
    templateUrl: './jobs-units.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class JobsUnitsPage implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Job", false]
    ]);

    form: FormGroup;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        submitting: false,
        editMode: false
    };

    viewData: any = {
        job: new JobModel(),
    };

    viewModel: any = {
        config: new JobUnitsViewModel()
    }

    constructor(
        private _jobsDetailState: JobsDetailState,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _jobService: JobService,
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        if (this._jobsDetailState.job$.getValue()) {
            this.viewData.job = this._jobsDetailState.job$.getValue();

            this._readyConditions.set("Job", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        if (this.viewControl.submitting)
            return;

        this.viewControl.loading$.next(true);

        this.viewControl.submitting = true;

        let job = this.parseForm(this.form, this.viewData.job);

        let result = await this._jobService.update(job)

        if (result) {
            let job = await this._jobService.get(this.viewData.job.Id);
            this.viewControl.ready = false;
            this._jobsDetailState.job$.next(job);
            this._systemAlertService.success(this._translate.instant("JOBS.UPDATE_SUCCESSFUL"));
        }

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        this.viewControl.editMode = false;
    }

    edit(): void {
        this.setForm(this.viewData.job);

        this.viewControl.editMode = true;
    }

    cancel(): void {
        this.viewControl.editMode = false;
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._jobsDetailState.menu$.next(this._menuService.getJobDetailMenu());

            this.viewModel.config = this.parseViewModel(this.viewData.job);

            this.viewControl.loading$.next(false);
        }
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            AllUnits: new FormControl(true),
            Units: new FormControl([]),
        });
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' },
            { title: `${this.viewData.job.Title}`, page: `/jobs/${this.viewData.job.Id}` },
            { title: "FORM.FIELDS.UNITS", page: `/jobs/${this.viewData.job.Id}/units` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsDetailState.job$.subscribe(value => {
                if (value) {
                    this.viewData.job = value;

                    this._readyConditions.set("Job", true);

                    this.init();
                }
            })
        );
    }

    private setForm(model: JobModel): void {
        if (model.Units.length > 0) {
            this.form.get("AllUnits").setValue(false);
            this.form.get("Units").setValue(model.Units);
        }
    }

    private parseViewModel(model: GnServiceConfigModel): JobUnitsViewModel {
        let vm = new JobUnitsViewModel();

        if (model.Units.length === 0) {
            vm.AllUnits = true;
        } else {
            vm.Units = model.Units;
        }

        vm.BrandId = model.BrandId;

        return vm;
    }

    private parseForm(form: FormGroup, job: JobModel): JobModel {
        job.Units = form.get("AllUnits").value || form.get("Units").value.length === 0 ? [] : form.get("Units").value;
        job.StartDate = new Date(job.StartDate);
        job.EndDate = new Date(job.EndDate);
        return job;
    }
}