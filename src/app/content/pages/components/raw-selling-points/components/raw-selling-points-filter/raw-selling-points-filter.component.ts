import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SystemAlertService, FacebookPageModel } from '../../../../../../core/core.module';
import { RawSellingPointsState } from '../../states';

@Component({
    selector: 'm-raw-selling-points-filter',
    templateUrl: './raw-selling-points-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawSellingPointsFilterComponent implements OnInit {

    private _obsers: any[] = [];
    private _readyConditions: Map<string, boolean> = new Map([
        ["Pages", false]
    ]);

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        pages: new Array<FacebookPageModel>(),
        pages$: new BehaviorSubject<any[]>([])
    };

    form: FormGroup;

    lang: string = "vi";

    constructor(
        private _rawSellingPointsState: RawSellingPointsState,
        private _translate: TranslateService,
        private _systemAlertService: SystemAlertService,
        public dialogRef: MatDialogRef<RawSellingPointsFilterComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        if (this._rawSellingPointsState.pages$.getValue()) {
            this.viewData.pages = this._rawSellingPointsState.pages$.getValue();

            this._readyConditions.set("Pages", true);

            this.init();
        }

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    close(): void {
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

        this.dialogRef.close({ data: this.parseForm(this.form) });
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            let pages = this.viewData.pages.map(x => {
                return {
                    id: x.Id,
                    text: x.Name
                };
            });

            this.viewData.pages$.next(pages);

            if (this.data && this.data.Id)
                this.setForm(this.data);

            this.viewControl.loading$.next(false);
        }
    }

    private parseForm(form: FormGroup): any {
        return {
            "Id": this.form.get("Id").value,
            "StartDate": this.form.get("DateRanges").value[0],
            "EndDate": this.form.get("DateRanges").value[1]
        }
    }

    private setForm(searchParams: any): void {
        this.form.get("Id").setValue(searchParams.Id);
        this.form.get("DateRanges").setValue([new Date(searchParams.StartDate), new Date(searchParams.EndDate)]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._rawSellingPointsState.pages$.subscribe(value => {
                if (value) {
                    this.viewData.pages = value;

                    this._readyConditions.set("Pages", true);

                    this.init();
                }
            })
        );
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Id: new FormControl('', [<any>Validators.required]),
            DateRanges: new FormControl([new Date(), new Date()], [<any>Validators.required])
        });
    }
}
