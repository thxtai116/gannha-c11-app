import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    TenantService,
    SystemAlertService,

    UserInfoModel,

    RoleType,
    LanguagePipe,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-supervisor-assignment',
    templateUrl: './supervisor-assignment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupervisorAssignmentComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        users: new Array<UserInfoModel>(),
        users$: new BehaviorSubject<any[]>([]),
    }

    form: FormGroup;

    constructor(
        private _tenantService: TenantService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        public dialogRef: MatDialogRef<SupervisorAssignmentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.init();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        this.dialogRef.close({ data: this.form.get("UserId").value });
    }

    init(): void {
        Promise.all([
            this._tenantService.getUsers()
        ]).then(value => {
            //this.viewData.users = value[0].filter(x => x.RoleNames.indexOf(RoleType.Supervisor) > -1 && x.Active && !x.Locked);

            this.viewData.users = value[0];

            this.viewData.users$.next(this.viewData.users.map(x => {
                return {
                    id: x.Id,
                    text: `${x.FullName ? x.FullName : x.DisplayName} - ${x.Email}`
                }
            }));

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private generateForm() {
        return new FormGroup({
            UserId: new FormControl('', [<any>Validators.required]),
        });
    }

    //#region 

    get ctrlUserId() { return this.form.get('UserId'); }

    //#endregion
}
