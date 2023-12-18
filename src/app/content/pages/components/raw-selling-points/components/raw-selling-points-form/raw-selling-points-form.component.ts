import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject } from 'rxjs';

import {
    FacebookPostModel,
    ScheduleRepeatEveryModel,
    SellingPointModel,
    SellingPointIconModel,
    GnActionModel,

    SellingPointService,
    BrandService,
    CatalogService,
    SystemAlertService,

    MaxWords,
    SellingPointMaxWords,
    MinArray,
    ActionType,
    LanguagePipe,
} from '../../../../../../core/core.module';

@Component({
    selector: 'm-raw-selling-points-form',
    templateUrl: './raw-selling-points-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawSellingPointsFormComponent implements OnInit {

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        submitting: false,
        submitted: false,
    }

    viewData: any = {
        post: FacebookPostModel,
        brands: new BehaviorSubject<any[]>([]),
        icons$: new BehaviorSubject<any[]>([]),
        spId: "",
    }

    viewForm: any = {
        spForm: FormGroup,
    }

    ids: any;

    sellingPointMaxWords = SellingPointMaxWords;

    constructor(
        private _sellingPointService: SellingPointService,
        private _brandService: BrandService,
        private _catalogService: CatalogService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private dialogRef: MatDialogRef<RawSellingPointsFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.viewForm.spForm = this.generateFormGroup();
    }

    ngOnInit() {
        this.viewControl.loading$.next(true);

        this.viewData.post = this.data;
        this.init();
    }

    private init() {

        Promise.all([
            this._brandService.getAllShort(),
            this._sellingPointService.generateId(),
            this._catalogService.getSellingPointIcons(),
        ]).then(value => {
            this.viewData.brands.next(value[0].map(x => {
                return {
                    id: x.Id,
                    text: new LanguagePipe().transform(x.Name),
                }
            }));

            this.viewData.spId = value[1];
            this.viewData.icons$.next(this.initFilterIcon(value[2]));
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    async onSubmit() {
        const controls = this.viewForm.spForm.controls;

        if (this.viewForm.spForm.invalid) {
            Object.keys(controls).forEach(controlName =>
                controls[controlName].markAsTouched()
            );
            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            return;
        }

        if (this.viewControl.submitting) {
            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let sp = this.parseFormToModel(this.viewForm.spForm);

        Promise.all([
            this._sellingPointService.create(sp)
        ]).then(value => {
            if (value[0]) {
                this._systemAlertService.success(this._translate.instant("RAW_SELLING_POINTS.CREATE_SELLING_POINT_SUCCESS"));

                this.dialogRef.close({
                    data: value[0]
                });
            }
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    onBrandSelected() {
        this.ids = { "brandId": this.viewForm.spForm.get('Brand').value, "spId": this.viewData.spId };
    }

    onCancelClick() {
        this.dialogRef.close();
    }

    private initFilterIcon(icons: SellingPointIconModel[]): any[] {
        return icons.map(x => {
            return {
                id: x.Icon[0],
                text: x.Name["vi"]
            }
        });
    }

    private parseFormToModel(form: FormGroup): SellingPointModel {
        let sp = new SellingPointModel();

        sp.BrandId = form.get('Brand').value;
        sp.Id = this.viewData.spId;

        sp.Detail.Description["vi"] = form.get('SellingPointDescription').value;
        sp.Detail.FullTitle["vi"] = form.get('SellingPointTitle').value;
        sp.Detail.Title["vi"] = form.get('SellingPointTitle').value;

        sp.Detail.Description["en"] = form.get('SellingPointDescriptionEn').value;
        sp.Detail.FullTitle["en"] = form.get('SellingPointTitleEn').value;
        sp.Detail.Title["en"] = form.get('SellingPointTitleEn').value;

        sp.StartDate = form.get('DateRanges').value[0];
        sp.EndDate = form.get('DateRanges').value[1];
        sp.Icon = form.get('Icon').value;
        sp.Units = form.get('Units').value || [];

        form.get('Posters').value.forEach(element => {
            if (element) {
                sp.Gallery.push(element);
            }
        });

        form.get('Video').value.forEach(element => {
            if (element) {
                sp.Gallery.push(element);
            }
        });

        let services = form.get('Actions').value;
        for (let connection of services) {
            connection.ActionType = ActionType.SpService;
        }
        if (services.length > 0) {
            for (let service of [services[0]]) {
                let action = new GnActionModel();
                action.Service = service;
                sp.Actions.push(action);
            }
        }

        sp.Order = form.get('Order').value;
        sp.Repeat = form.get('Repeat').value;
        sp.Tags = form.get('Tags').value.map(x => x.Name);
        sp.TimeRanges = form.get('TimeRanges').value;

        return sp;
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({

            //BrandId
            Brand: new FormControl('', [<any>Validators.required]),

            DateRanges: new FormControl([new Date(), new Date()]),
            Icon: new FormControl('', [<any>Validators.required]),
            Order: new FormControl(0),
            TimeRanges: new FormControl([], [<any>Validators.required]),
            Repeat: new FormControl(new ScheduleRepeatEveryModel()),
            Actions: new FormControl([], [<any>Validators.required]),
            Tags: new FormControl([], [<any>Validators.required, MinArray.validate(5)]),

            //SpDetails
            SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
            SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
            SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),

            //Gallery
            Video: new FormControl([]),
            Posters: new FormControl([], [Validators.required]),

            ApplyForSomeUnits: new FormControl(true),
            Units: new FormControl([]),

            //Id
            //AppId: ProductSeries.Brand
        })
    }

}