import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { JobBasicInfoViewModel } from '../../view-models';

import { JobsDetailState, JobsState } from '../../states';

import {
    JobModel,

    SubheaderService,
    SystemAlertService,
    JobService,
    RecruitmentService,
    ConfirmService,

    BrandModel,
    MaterialDateRangesValidator,
    MomentToDatePipe,
} from '../../../../../../core/core.module';

import { MenuService } from '../../services';

@Component({
    selector: 'm-jobs-basic-info',
    templateUrl: './jobs-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsBasicInfoPage implements OnInit {

    private OPEN_SERVICE_CONFIG_RECRUITMENT = "5b276ef6c779e11c24ac5f03";

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Job", false],
        ["JobTypes", false],
        ["JobBenefits", false],
        ["JobTitles", false],
    ]);

    form: FormGroup;
    jobPreview: FormControl = new FormControl();

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        submitting: false,
    };

    viewData: any = {
        brand: new BrandModel(),
        job: new JobModel(),
        recruitments: [],
        jobBenefits: [],
        jobTypes: [],
        resumeRequireFields: []
    };

    viewModel: any = {
        job: new JobBasicInfoViewModel()
    }

    locale: any = {
        format: 'DD/MM/YYYY',
        displayFormat: 'DD/MM/YYYY',
    };

    constructor(
        private _jobsDetailState: JobsDetailState,
        private _jobsState: JobsState,
        private _jobService: JobService,
        private _recruitmentService: RecruitmentService,
        private _subheaderService: SubheaderService,
        private _menuService: MenuService,
        private _systemAlertService: SystemAlertService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

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

        this.viewControl.submitting = true;

        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.viewControl.submitting = false;

            return;
        }

        let job = this.parseJob(this.form);

        job.Id = this.viewData.job.Id;
        job.BrandId = this.viewData.job.BrandId;

        this.viewControl.loading$.next(true);

        let result = await this._jobService.update(job);

        this.viewControl.loading$.next(false);
        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("JOBS.UPDATE_SUCCESSFUL"));

            this.viewControl.loading$.next(true);

            Promise.all([
                this._jobService.get(job.Id),
            ]).then(value => {
                this.viewControl.ready = false;

                if (value[0]) {
                    this._jobsDetailState.job$.next(value[0]);
                }
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });
        }

        this.viewControl.editMode = false;
    }

    activate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('JOBS.CRUD_MESSAGE.ACTIVATE_COMFIRM'));

        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            this._jobService.activate(this.viewData.job.Id).then(res => {
                if (res) {
                    this._systemAlertService.success(this._translate.instant('JOBS.CRUD_MESSAGE.ACTIVATE_SUCCESSFUL'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            })
        });
    }

    deactivate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('JOBS.CRUD_MESSAGE.DEACTIVATE_CONFIRM'));

        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            this._jobService.deactivate(this.viewData.job.Id).then(res => {
                if (res) {
                    this._systemAlertService.success(this._translate.instant('JOBS.CRUD_MESSAGE.DEACTIVATE_SUCCESSFUL'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            })
        });
    }

    private reload(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._jobService.get(this.viewData.job.Id),
        ]).then(value => {
            this.viewControl.ready = false;

            if (value[0]) {
                this._jobsDetailState.job$.next(value[0]);
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this._jobsDetailState.menu$.next(this._menuService.getJobDetailMenu());

            Promise.all([
                this._recruitmentService.getAll(),
                this._jobService.getOptionalFields()
            ]).then(value => {
                this.viewData.recruitments = value[0].map(x => { return { Id: x.Id, Name: x.Title }; });

                if (value[1].SupportResumeFields) {
                    this.viewData.resumeRequireFields = value[1].SupportResumeFields;
                }

                this.viewModel.job = this.parseJobBasicViewModel(JSON.parse(JSON.stringify(this.viewData.job)));

                this.parseToForm(this.viewData.job);
            }).finally(() => {
                this.viewControl.loading$.next(false);
            });

            this.parseJobPreview(this.form);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' },
            { title: `${this.viewData.job.Title}`, page: `/jobs/${this.viewData.job.Id}` },
            { title: "JOBS.BASIC_INFO", page: `/jobs/${this.viewData.job.Id}/basic-info` }
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

        this._obsers.push(
            this._jobsState.jobTypes$.subscribe(res => {
                if (res) {
                    this.viewData.jobTypes = res.map(x => { return { Id: x, Name: x } });

                    this._readyConditions.set("JobTypes", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.jobBenefits$.subscribe(res => {
                if (res) {
                    this.viewData.jobBenefits = res.map(x => { return { Id: x, Name: x } });

                    this._readyConditions.set("JobBenefits", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.brand$.subscribe(res => {
                if (res) {
                    this.viewData.brand = res;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.jobTitles$.subscribe(res => {
                if (res) {
                    this.viewData.jobTitles = res.map(x => { return { Id: x.Id, Title: x.Title } });

                    this._readyConditions.set("JobTitles", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.parseJobPreview(this.form);
            })
        );
    }

    private parseJobPreview(form: FormGroup) {
        let jobPreview: any = {
            brandLogo: this.viewData.brand.Logo,

            title: form.get("Title").value,
            salary: form.get("Salary").value,
            types: form.get("JobTypes").value.map(x => x.Name),
            dateRange: [form.get("DateRanges").value['startDate'], form.get("DateRanges").value['endDate']],

            benefits: form.get("JobBenefits").value.map(x => x.Name),
            workingAddress: form.get("WorkingAddress").value,
            jobDescription: form.get("Description").value,
            requirements: form.get("Requirements").value,
        };

        this.jobPreview.setValue(jobPreview);
    }

    private parseJobBasicViewModel(model: JobModel): JobBasicInfoViewModel {
        let vm = new JobBasicInfoViewModel();

        vm.Title = model.Title;
        vm.Description = model.Description;
        vm.Requirements = model.Requirements;
        vm.WorkingAddress = model.WorkingAddress;

        vm.JobTypes = model.JobTypes;
        vm.JobBenefits = model.JobBenefits;
        vm.Recruitment = model.Campaign.Title;

        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);

        vm.Salary = model.Salary;
        vm.Demands = model.Demands;

        vm.CreatedAt = new Date(model.CreatedAt);

        vm.RequireSubmitFields = this.convertRequiredFieldsToArray(model.RequireSubmitFields);

        vm.Status = model.Status;

        return vm;
    }

    private parseToForm(model: JobModel): void {
        this.form.get('Title').setValue(model.Title);
        this.form.get('Description').setValue(model.Description);
        this.form.get('Requirements').setValue(model.Requirements);
        this.form.get('WorkingAddress').setValue(model.WorkingAddress);


        this.form.get('JobTypes').setValue(model.JobTypes.map(x => { return { Id: x, Name: x }; }));
        this.form.get('JobBenefits').setValue(model.JobBenefits.map(x => { return { Id: x, Name: x }; }));

        this.form.get('JobTitles').setValue(model.JobTitles.map(x => x.Id));

        this.form.get('Recruitment').setValue([
            {
                "Id": model.Campaign.Id,
                "Name": model.Campaign.Title
            }
        ]);

        this.form.get('DateRanges').setValue({
            startDate: new Date(model.StartDate),
            endDate: new Date(model.EndDate)
        });
        this.form.get('Salary').setValue(model.Salary);
        this.form.get('Demands').setValue(model.Demands);

        this.form.get('RequireSubmitFields').setValue(this.convertRequiredFieldsToArray(model.RequireSubmitFields));
    }

    private parseJob(form: FormGroup): JobModel {
        let job = new JobModel();

        job.Title = form.get("Title").value;
        job.Description = form.get("Description").value;
        job.Requirements = form.get("Requirements").value;
        job.WorkingAddress = form.get("WorkingAddress").value;

        job.JobTypes = form.get("JobTypes").value.map(x => x.Name);
        job.JobBenefits = form.get("JobBenefits").value.map(x => x.Name);

        job.JobTitles = this.viewData.jobTitles.filter(x => form.get("JobTitles").value.indexOf(x.Id) > -1).map(x => {
            return {
                Id: x.Id,
                Title: x.Title
            }
        });

        job.Campaign = {
            "Id": form.get("Recruitment").value[0].Id,
            "Title": form.get("Recruitment").value[0].Name
        }

        job.StartDate = new MomentToDatePipe().transform(form.get("DateRanges").value['startDate']);
        job.EndDate = new MomentToDatePipe().transform(form.get("DateRanges").value['endDate']);

        job.Salary = form.get("Salary").value;
        job.Demands = form.get("Demands").value;

        job.RequireSubmitFields = form.get("RequireSubmitFields").value.reduce(function (result, item) {
            result[item] = true;
            return result;
        }, {});
        return job;
    }

    private convertRequiredFieldsToArray(model: any): string[] {
        let fields = [];

        for (let field of this.viewData.resumeRequireFields) {
            let value = model[field];

            if (value) {
                fields.push(field);
            }
        }

        return fields;
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Title: new FormControl('', [Validators.required]),
            Description: new FormControl('', [Validators.required]),
            Requirements: new FormControl('', [Validators.required]),
            WorkingAddress: new FormControl(''),

            JobBenefits: new FormControl([], [Validators.required]),
            JobTypes: new FormControl([], [Validators.required]),
            JobTitles: new FormControl([], [Validators.required]),
            Recruitment: new FormControl('', [Validators.required]),

            DateRanges: new FormControl({
                startDate: new Date(),
                endDate: new Date()
            }, [<any>MaterialDateRangesValidator.validate()]),

            Salary: new FormControl('', [Validators.required]),

            Demands: new FormControl(1, [Validators.required, Validators.min(1)]),

            RequireSubmitFields: new FormControl([])
        });
    }
}
