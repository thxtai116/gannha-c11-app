import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';

import { JobsState } from '../../states';
import {
    SubheaderService,
    RecruitmentService,
    JobService,

    BrandModel,
    SystemAlertService,
    JobModel,

    OpenServiceConfigurationForm,

    MaterialDateRangesValidator,
    MomentToDatePipe
} from '../../../../../../core/core.module';

import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';

@Component({
    selector: 'm-jobs-form',
    templateUrl: './jobs-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsFormPage implements OnInit {

    private _obsers: any[] = [];

    private OPEN_SERVICE_CONFIG_RECRUITMENT = "5b276ef6c779e11c24ac5f03";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
        submitting: false,
        readyConditions: new Map([
            ["JobBenefits", false],
            ["JobTypes", false],
            ["JobTitles", false],
            ["Brand", false]
        ])
    };

    form: FormGroup;
    jobPreview: FormControl = new FormControl();

    viewData: any = {
        brand: new BrandModel(),
        recruitments: [],
        jobBenefits: [],
        jobTypes: [],
        jobTitles: [],
        resumeRequireFields: []
    };

    locale: any = {
        format: 'DD/MM/YYYY',
        displayFormat: 'DD/MM/YYYY',
    };

    constructor(
        private _router: Router,
        private _jobsState: JobsState,
        private _jobService: JobService,
        private _recruitmentService: RecruitmentService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
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

        job.BrandId = this.viewData.brand.Id;

        this.viewControl.loading$.next(true);

        let result = await this._jobService.create(job);

        this.viewControl.loading$.next(false);
        this.viewControl.submitting = false;

        if (result) {
            this._systemAlertService.success(this._translate.instant("JOBS.CREATE_SUCCESSFUL"));

            this._router.navigate(["/jobs", result.Id]);
        }
    }

    private handleBrandNotFound(): void {
        this.viewControl.loading$.next(false);

        this._systemAlertService.error(this._translate.instant("COMMON.ERROR.REQUEST_BRAND_NOT_FOUND"));

        setTimeout(() => {
            this._router.navigate(["jobs"]);
        }, 3000);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._jobsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this.viewControl.readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.jobTypes$.subscribe(res => {
                if (res) {
                    this.viewData.jobTypes = res.map(x => { return { Id: x, Name: x } });

                    this.viewControl.readyConditions.set("JobTypes", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.jobBenefits$.subscribe(res => {
                if (res) {
                    this.viewData.jobBenefits = res.map(x => { return { Id: x, Name: x } });

                    this.viewControl.readyConditions.set("JobBenefits", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._jobsState.jobTitles$.subscribe(res => {
                if (res) {
                    this.viewData.jobTitles = res.map(x => { return { Id: x.Id, Title: x.Title } });

                    this.viewControl.readyConditions.set("JobTitles", true);

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

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "JOBS.LIST", page: '/jobs' },
            { title: "JOBS.NEW_JOB", page: `/jobs/create` }
        ]);
    }

    private init(): void {
        if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['jobs']);
            } else {
                this.viewControl.ready = true;

                Promise.all([
                    this._recruitmentService.getAll(),
                    this._jobService.getOptionalFields()
                ]).then(value => {
                    this.viewData.recruitments = value[0].map(x => { return { Id: x.Id, Name: x.Title }; });

                    if (value[1].SupportResumeFields) {
                        this.viewData.resumeRequireFields = value[1].SupportResumeFields;
                    }
                }).catch(() => {
                    this.handleBrandNotFound();
                });

                this.bindBreadcrumbs();
                this.parseJobPreview(this.form);

                this.viewControl.loading$.next(false);
            }
        }
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

    private parseConfig(form: FormGroup): OpenServiceConfigurationForm {
        let config = new OpenServiceConfigurationForm();

        config.Units = form.get("AllUnits").value || form.get("Units").value.length === 0 ? ["*"] : form.get("Units").value;
        config.StartDate = new MomentToDatePipe().transform(form.get("DateRanges").value['startDate']);
        config.EndDate = new MomentToDatePipe().transform(form.get("DateRanges").value['endDate']);

        return config;
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
                endDate: moment(new Date()).add(1, 'days').toDate()
            }, [<any>MaterialDateRangesValidator.validate()]),

            AllUnits: new FormControl(true),
            Units: new FormControl([]),

            Salary: new FormControl('', [Validators.required]),

            Demands: new FormControl(1, [Validators.required, Validators.min(1)]),

            RequireSubmitFields: new FormControl([])
        });
    }
}
