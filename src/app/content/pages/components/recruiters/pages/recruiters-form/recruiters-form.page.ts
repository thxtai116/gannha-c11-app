import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ValidPhone, BrandModel, RecruiterModel, SystemAlertService, RecruiterService, MinArray, SubheaderService } from '../../../../../../core/core.module';
import { RecruitersState } from '../../states';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'm-recruiters-form',
    templateUrl: 'recruiters-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecruitersFormPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    viewData: any = {
        brand: new BrandModel(),
        recruiter: new RecruiterModel(),
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submiting: false,
    }

    form: FormGroup;

    constructor(
        private _router: Router,
        private _recrutiersState: RecruitersState,
        private _recruiterService: RecruiterService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        this.bindBreadcrumbs();
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

        let result = await this._recruiterService.create(recruiter);

        this.viewControl.loading$.next(false);

        if (result) {
            this._systemAlertService.success(this._translate.instant("RECRUITERS.CREATE_SUCCESSFUL"));
            this._router.navigate(["recruiters", result.Id]);
        }
    }

    private parseFormToModel(form: FormGroup): RecruiterModel {
        let recruiter = new RecruiterModel();

        recruiter.Title = form.get('Title').value;
        recruiter.Name = form.get('Name').value;
        recruiter.Email = form.get('Email').value;
        recruiter.PhoneNumber = form.get('PhoneNumber').value;

        return recruiter;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RECRUITERS.LIST", page: '/recruiters' },
            { title: "RECRUITERS.CREATE", page: '/recruiters/create' },
        ]);
    }

    private bindSubscribes() {
        this._obsers.push(
            this._recrutiersState.brand$.subscribe(brand => {
                this.viewData.brand = brand;
            })
        );
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