import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { MinArray } from '../../../../../../core/core.module';

@Component({
    selector: 'rbp-submission-reject-reasons',
    templateUrl: './submission-reject-reasons.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionRejectReasonsComponent implements OnInit {
    form: FormGroup;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    constructor(
        public dialogRef: MatDialogRef<SubmissionRejectReasonsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void { }

    onSubmit(): void {
        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this.viewControl.submitting = false;

            return;
        }

        this.dialogRef.close(this.ctrlReasons.value);
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Reasons: new FormControl(this.data.map(x => { return { Id: "", Name: x } }), [<any>Validators.required, MinArray.validate(1)]),
        });
    }

    //#region 

    get ctrlReasons() { return this.form.get("Reasons"); }

    //#endregion
}
