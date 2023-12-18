import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from "@angular/core";
import { BrandModel, RecruiterModel } from '../../../../../../core/models';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MinArray, ValidPhone, RecruiterService, SystemAlertService, SubheaderService } from '../../../../../../core/core.module';
import { RecruitersState } from '../../states';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'm-recruiters-basic-info',
    templateUrl: 'recruiters-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitersBasicInfoPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions = new Map<string, boolean>([
        ["Brand", false],
        ["Recruiter", false],
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submiting: false,
    }

    viewData: any = {
        brand: new BrandModel(),
        recruiter: new RecruiterModel(),
    }

    form: FormGroup;

    constructor(
        private _recrutiersState: RecruitersState,
        private _recruiterService: RecruiterService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        if (this.viewControl.submiting) {
            return
        }

        if (this.form.invalid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            this.form.markAllAsTouched();

            return;
        }

        this.viewControl.submiting = true;

        this.viewControl.loading$.next(true);

        let recruiter: RecruiterModel = this.parseFormToModel(this.form);

        let result = await this._recruiterService.update(recruiter);

        this.viewControl.loading$.next(false);

        if (result) {
            this._systemAlertService.success(this._translate.instant("RECRUITERS.UPDATE_SUCCESSFUL"));
        }
    }

    private init() {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.bindBreadcrumbs();

            this.parseModelToForm(this.viewData.recruiter);

            this.viewControl.loading$.next(false);
        }
    }

    private parseModelToForm(recruiter: RecruiterModel) {
        this.form.get("Title").setValue(recruiter.Title);
        this.form.get("Name").setValue(recruiter.Name);
        this.form.get("Email").setValue(recruiter.Email);
        this.form.get("PhoneNumber").setValue(recruiter.PhoneNumber);
    }

    private parseFormToModel(form: FormGroup): RecruiterModel {
        let recruiter = new RecruiterModel();

        recruiter.Id = this.viewData.recruiter.Id;
        recruiter.Title = form.get('Title').value;
        recruiter.Name = form.get('Name').value;
        recruiter.Email = form.get('Email').value;
        recruiter.PhoneNumber = form.get('PhoneNumber').value;

        return recruiter;
    }

    private bindSubscribes() {
        this._obsers.push(
            this._recrutiersState.selectedRecruiter.subscribe(recruiter => {
                if (recruiter) {
                    this._readyConditions.set("Recruiter", true);

                    this.viewData.recruiter = recruiter;

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._recrutiersState.brand$.subscribe(brand => {
                if (brand) {
                    this._readyConditions.set("Brand", true);

                    this.viewData.brand = brand;

                    this.init();
                }
            })
        );
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITERS.LIST", page: '/recruiters' },
            { title: `${this.viewData.recruiter.Id}`, page: `/recruiters/${this.viewData.recruiter.Id}` }
        ]);
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Title: new FormControl('', [<any>Validators.required, MinArray.validate(3)]),
            Name: new FormControl('', [<any>Validators.required, MinArray.validate(3)]),
            Email: new FormControl('', [<any>Validators.required]),
            PhoneNumber: new FormControl('', [<any>Validators.required, ValidPhone.validate]),
        });
    }
}