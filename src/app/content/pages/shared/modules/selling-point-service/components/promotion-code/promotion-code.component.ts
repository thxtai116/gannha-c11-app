import { Component, OnInit, ChangeDetectionStrategy, forwardRef, Inject } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    PromotionCodeCampaignModel,

    LanguagePipe,

    SystemAlertService,
    PromotionCodeCampaignService,
} from '../../../../../../../core/core.module';

import { PromotionCodeModel } from '../../models';

@Component({
    selector: 'm-promotion-code',
    templateUrl: './promotion-code.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PromotionCodeComponent)
        }
    ],
})
export class PromotionCodeComponent implements OnInit {
    form: FormGroup;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        campaigns: new Array<PromotionCodeCampaignModel>(),
        filterCampaigns$: new BehaviorSubject<any[]>([]),
    }

    lang: string = "vi";

    constructor(
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _promotionCodeCampaignService: PromotionCodeCampaignService,
        public dialogRef: MatDialogRef<PromotionCodeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        if (this.data && this.data.model) {
            this.setForm(this.data.model);
        }

        this.init();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const controls = this.form.controls;

        Object.keys(controls).forEach(controlName =>
            controls[controlName].markAsTouched()
        );

        if (!this.form.valid) {
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));

            return;
        }

        let model = this.parseForm(this.form);

        this.dialogRef.close({
            data: model
        });
    }

    private init() {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._promotionCodeCampaignService.getAll()
        ]).then(value => {
            this.viewData.campaigns = value[0];

            this.viewData.filterCampaigns$.next(value[0].map(x => {
                return {
                    id: x.Id.toString(),
                    text: x.Name
                }
            }));
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private generateForm(): FormGroup {
        return new FormGroup({
            Title: new FormControl("Lấy mã", [<any>Validators.required]),
            CampaignId: new FormControl("", [<any>Validators.required]),
        });
    }

    private parseForm(form: FormGroup): PromotionCodeModel {
        let model = new PromotionCodeModel();

        model.Title[this.lang] = form.get("Title").value;
        model.CampaignId = +form.get("CampaignId").value;

        return model;
    }

    private setForm(model: PromotionCodeModel): void {
        this.form.get("Title").setValue(new LanguagePipe().transform(model.Title));
        this.form.get("CampaignId").setValue(model.CampaignId.toString());
    }
}
