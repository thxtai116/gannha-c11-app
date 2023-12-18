import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { AccountState } from '../../states';

import {
    SubheaderService,
    SystemAlertService,
    UserService,

    ProfileModel,

    GlobalState
} from '../../../../../../core/core.module';
import { environment } from '../../../../../../../environments/environment.develop';

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD-MM-YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY',
    },
};

export class Gender {
    Id: number;
    GenderName: string = "";
}

@Component({
    selector: 'm-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})
export class UserProfileComponent implements OnInit {

    private _obsers: any[] = [];
    private _readyConditions: Map<string, boolean> = new Map([
        ["Profile", false]
    ]);

    viewData: any = {
        profile: new ProfileModel(),
        genders: new Array<Gender>(),
        selectedGender: new Gender(),
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
        editMode: false,
    }

    form: FormGroup;

    constructor(
        private _accountState: AccountState,
        private _globalState: GlobalState,
        private _userService: UserService,
        private _subheaderService: SubheaderService,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
    ) {
        this.form = this.generateUpdateForm();
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

    async save() {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        await this.update();

        this.viewControl.editMode = false;
    }

    cancel() {
        this.parseToFormGroup(JSON.parse(JSON.stringify(this.viewData.profile)));
        this.viewControl.editMode = false;

        this.disableFormGroup();
    }

    edit() {
        this.viewControl.editMode = true;

        this.enableFormGroup();
    }

    private async update() {
        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let profile = this.parseFormGroupToModel(this.form);

        if (!profile.Picture.startsWith(environment.fileStorageEndpoint)) {
            let result = await this._userService.UploadProfileImage(profile.Picture);
            if (result) {
                profile.Picture = result.Picture;
            }
        }

        let data = await this._userService.updateProfile(profile);
        this.viewControl.submitting = false;

        if (data) {
            let result = await this._userService.getProfile();
            this.viewControl.ready = false;
            this._accountState.profile$.next(result);
            this._globalState.userInfoSub$.next(result);
            this._systemAlertService.success("Cập nhật thông tin thành công.");
        }
        this.viewControl.loading$.next(false);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;
            this.viewControl.ready = true;

            this.viewData.genders = [{ Id: 0, GenderName: "Khác" }, { Id: 1, GenderName: "Nam" }, { Id: 2, GenderName: "Nữ" }];
            this.viewData.selectedGender = this.viewData.genders.find(x => x.Id == this.viewData.profile.Gender) || 0;

            this.parseToFormGroup(JSON.parse(JSON.stringify(this.viewData.profile)));

            this.disableFormGroup();
            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "PROFILE.ACCOUNT", page: '/account' },
            { title: "PROFILE.USER_PROFILE", page: `/account/user-profile` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );

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

    private parseToFormGroup(profile: ProfileModel) {
        this.form.get('UserEmail').setValue(profile.Email);
        this.form.get('UserRole').setValue(profile.RoleNames);
        this.form.get('UserPhoneNumber').setValue(profile.PhoneNumber);

        this.form.get('UserName').setValue(profile.FullName);
        this.form.get('UserBirthDay').setValue(profile.DateOfBirth);
        this.form.get('UserImage').setValue(profile.Picture);
        this.form.get('UserGender').setValue(profile.Gender);
    }

    private parseFormGroupToModel(form: FormGroup): ProfileModel {
        let profile = new ProfileModel();

        profile.FullName = form.get('UserName').value;
        var date = form.get('UserBirthDay').value;

        try {
            profile.DateOfBirth = date.toDate();
        } catch{
            profile.DateOfBirth = new Date(date);
        }

        profile.Gender = form.get('UserGender').value;
        profile.Picture = form.get('UserImage').value;

        return profile;
    }

    private disableFormGroup() {
        this.form.get('UserName').disable();
        this.form.get('UserBirthDay').disable();
        this.form.get('UserImage').disable();
        this.form.get('UserGender').disable();
    }

    private enableFormGroup() {
        this.form.get('UserName').enable();
        this.form.get('UserBirthDay').enable();
        this.form.get('UserImage').enable();
        this.form.get('UserGender').enable();
    }

    private generateUpdateForm(): FormGroup {
        return new FormGroup({
            UserEmail: new FormControl({ value: '', disabled: true }),
            UserRole: new FormControl({ value: '', disabled: true }),
            UserPhoneNumber: new FormControl({ value: '', disabled: true }),

            UserName: new FormControl('', [<any>Validators.required]),
            UserBirthDay: new FormControl(new Date()),
            UserImage: new FormControl('', [<any>Validators.required]),
            UserGender: new FormControl('', [<any>Validators.required])
        });
    }
}
