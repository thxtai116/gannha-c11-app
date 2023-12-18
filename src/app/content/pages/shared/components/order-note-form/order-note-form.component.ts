import { Component, ChangeDetectionStrategy, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { OrderNoteModel, OrderService, SystemAlertService } from '../../../../../core/core.module';

@Component({
    selector: 'm-order-note-form',
    templateUrl: 'order-note-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderNoteFormComponent implements OnInit {

    viewData: any = {
        orderId: "",
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
    }

    form: FormGroup;

    constructor(
        private dialogRef: MatDialogRef<OrderNoteFormComponent>,
        private _orderService: OrderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        this.parseInjectionData(this.data);
    }

    private parseInjectionData(data: any) {
        this.viewData.orderId = data.Id;
    }

    async createNote() {
        this.viewControl.loading$.next(true);

        this.form.markAllAsTouched();

        if (this.form.valid) {

            let note = this.parseFormToNote(this.form);

            let result = await this._orderService.createNote(note)

            this.viewControl.loading$.next(false);

            if (result) {
                this._systemAlertService.success(this._translate.instant("ORDERS.CREATE_SUCCESSFUL"));

                this.dialogRef.close({
                    data: result
                });
            }
        } else {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"))

            this.viewControl.loading$.next(false);
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    private parseFormToNote(form: FormGroup): OrderNoteModel {
        let note: OrderNoteModel = new OrderNoteModel();

        note.OrderId = this.viewData.orderId;
        note.Note = form.get('Note').value;
        note.DisplayToCustomer = form.get('DisplayToCustomer').value;

        return note;
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            Note: new FormControl('', [<any>Validators.required]),
            DisplayToCustomer: new FormControl(false)
        })
    }
}