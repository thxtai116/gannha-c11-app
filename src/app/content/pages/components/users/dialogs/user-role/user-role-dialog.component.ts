import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import {
    UserInfoModel,

    TenantService,
    SystemAlertService
} from '../../../../../../core/core.module';

class UserRoleModel {
    Id: string = "";
    Role: string = "";
}

@Component({
    selector: 'm-user-role-dialog.component',
    templateUrl: './user-role-dialog.component.html'
})
export class UserRoleDialogComponent implements OnInit {
    viewControl: any = {
        viewLoading: false,
        loadingAfterSubmit: false
    }

    viewData: any = {
        user: new UserInfoModel(),
        roles: new Array<any>()
    }

    viewForm: any = {
        formGroup: FormGroup,
    }

    constructor(
        private _tenantService: TenantService,
        private _systemAlertService: SystemAlertService,
        public dialogRef: MatDialogRef<UserRoleDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.viewForm.formGroup = this.generateForm();
    }

    ngOnInit() {
        this.viewData.user = this.data.user;

        this.viewControl.viewLoading = true;

        Promise.all([
            this._tenantService.getAcceptableRoles()
        ]).then(value => {
            this.viewData.roles = value[0];

            this.viewForm.formGroup.controls['Role'].setValue(this.viewData.user.RoleNames[0], { onlySelf: false });

            this.viewControl.viewLoading = false;
        }).catch(() => {
            this.viewControl.viewLoading = false;
        })
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (!this.viewForm.formGroup.valid) return;

        let model = this.parseToModel(this.viewForm.formGroup);

        model.Id = this.viewData.user.Id;

        this.viewControl.viewLoading = true;
        this.viewControl.loadingAfterSubmit = true;

        Promise.all([
            this._tenantService.changeUserRole(model.Id, model.Role)
        ]).then(value => {
            let result = value[0];

            this.viewControl.viewLoading = false;
            this.viewControl.loadingAfterSubmit = false;

            if (result) {
                this._systemAlertService.success("SUCCESFUL");

                this.dialogRef.close({
                    successful: true
                });
            }
        }).catch(() => {
            this.viewControl.viewLoading = false;
            this.viewControl.loadingAfterSubmit = false;
        })
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Role: new FormControl('', [<any>Validators.required])
        });
    }

    private parseToModel(formGroup: FormGroup): UserRoleModel {
        let model = new UserRoleModel();

        model.Role = formGroup.get('Role').value;

        return model;
    }
}
