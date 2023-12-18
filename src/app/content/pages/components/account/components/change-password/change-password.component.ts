import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    UserInfoModel,

    UserService,

    SubheaderService,
    SystemAlertService,
    ProfileModel
} from '../../../../../../core/core.module';

import { AccountState } from '../../states';
import { MatchPassword } from '../../validators';

@Component({
    selector: 'm-change-password',
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Profile", false]
    ]);

    viewData: any = {
        profile: new ProfileModel()
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    }

    form: FormGroup;

    constructor(
        private _userService: UserService,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _accountState: AccountState,
        private _formBuilder: FormBuilder
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.bindBreadcrumbs();
        this.bindSubscribes();

        if (this._accountState.profile$.getValue()) {
            this.viewData.profile = this._accountState.profile$.getValue();

            this._readyConditions.set("Profile", true);

            this.init();
        }
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    save(): void {
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

        let model = this.parseForm(this.form);

        this.viewControl.loading$.next(true);

        Promise.all([
            this._userService.changePassword(model.OldPassword, model.NewPassword, model.ConfirmNewPassword)
        ]).then(value => {
            if (value[0]) {
                this._systemAlertService.success(this._translate.instant("PROFILE.CHANGE_PASSWORD_SUCCESSFUL"));

                this.form.reset();
            }
        }).finally(() => {
            this.viewControl.submitting = false;

            this.viewControl.loading$.next(false);
        })
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PROFILE.ACCOUNT", page: '/account' },
            { title: "PROFILE.CHANGE_PASSWORD", page: `/account/change-password` }
        ]);
    }


    private bindSubscribes(): void {
        this._obsers.push(
            this._accountState.profile$.subscribe(value => {
                if (value) {
                    this.viewData.profile = value;

                    this._readyConditions.set("Profile", true);

                    this.init();
                }
            })
        );
    }

    private parseForm(form: FormGroup): any {
        let model: any = {};

        model.OldPassword = form.get("OldPassword").value;
        model.NewPassword = form.get("NewPassword").value;
        model.ConfirmNewPassword = form.get("ConfirmNewPassword").value;

        return model;
    }

    private generateForm() {
        return this._formBuilder.group(
            {
                OldPassword: new FormControl("", [<any>Validators.required]),
                NewPassword: new FormControl("", [<any>Validators.required, <any>Validators.minLength(6)]),
                ConfirmNewPassword: new FormControl("", [<any>Validators.required])
            },
            {
                validator: MatchPassword.validate
            });
    }
}