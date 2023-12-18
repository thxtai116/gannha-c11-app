import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { BehaviorSubject } from 'rxjs';

import {
    SellingPointMaxWords,
    ResourceType,

    SellingPointBasicViewModel,
    SellingPointModel,
    SellingPointTypeModel,
    BrandModel,
    ResourceModel,

    SellingPointForm,

    MaxWords,
    MinArray,
    LanguagePipe,

    SubheaderService,
    SellingPointService,
    SystemAlertService,
    ConfirmService,

    ScheduleUtility,
    GnActionModel,
    ScheduleRepeatEveryModel,
    ResourceService,
} from '../../../../../../core/core.module';

import { environment } from '../../../../../../../environments/environment';

import { SellingPointsDetailState, SellingPointsState } from '../../states';

@Component({
    selector: 'm-selling-points-basic-info',
    templateUrl: './selling-points-basic-info.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsBasicInfoPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _readyConditions: Map<string, boolean> = new Map([
        ["Brand", false],
        ["Icons", false],
        ["SellingPoint", false]
    ]);
    private _storageEndPoint = environment.storageEndpoint;

    form: FormGroup;

    sellingPointPreview: FormControl = new FormControl({});

    ids: any;

    viewControl: any = {
        ready: false,
        submitting: false,
        loading$: new BehaviorSubject<boolean>(false),
    };

    viewData: any = {
        brand: new BrandModel(),
        sellingPointTypes: new Array<SellingPointTypeModel>(),
        sellingPoint: new SellingPointModel(),
        icons$: new BehaviorSubject<any[]>([]),
        icons: new Array<any[]>(),
    };

    viewModel: any = {
        sellingPoint: new SellingPointBasicViewModel(),
        form: new SellingPointForm(),
    };

    sellingPointMaxWords = SellingPointMaxWords;

    storageEndpoint: string = environment.storageEndpoint;

    lang: string = "vi";

    constructor(
        private _sellingPointsState: SellingPointsState,
        private _sellingPointsDetailState: SellingPointsDetailState,
        private _subheaderService: SubheaderService,
        private _sellingPointService: SellingPointService,
        private _translate: TranslateService,
        private _confirmService: ConfirmService,
        private _systemAlertService: SystemAlertService,
        private _scheduleUtil: ScheduleUtility,
        private _formBuilder: FormBuilder,
    ) {
        this.form = this.generateForm();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async save() {
        if (this.viewControl.submitting)
            return;

        const controls = this.form.controls;

        if (this.form.invalid) {
            Object.keys(controls).forEach(controlName => {
                controls[controlName].markAsTouched();
                controls[controlName].markAsDirty();
            });

            this._systemAlertService.error(this._translate.instant("COMMON.ERROR.FORM_INVALID"));
            this.viewControl.submitting = false;

            return;
        }

        this.viewControl.submitting = true;

        this.viewControl.loading$.next(true);

        let sellingPoint = this.parseSellingPoint(this.form);

        let result = await this._sellingPointService.update(sellingPoint);

        if (result) {
            let sellingPointResult = await this._sellingPointService.get(sellingPoint.Id);
            this.viewControl.ready = false;
            this._sellingPointsDetailState.sellingPoint$.next(sellingPointResult);
            this._systemAlertService.success(this._translate.instant("SELLING_POINTS.UPDATE_SUCCESSFUL"));
        }

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;
    }

    activate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SELLING_POINTS.ACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._sellingPointService.activate(this.viewData.sellingPoint.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.ACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    deactivate(): void {
        const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('SELLING_POINTS.DEACTIVATE_COMFIRM'));

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.viewControl.loading$.next(true);

            Promise.all([
                this._sellingPointService.deactivate(this.viewData.sellingPoint.Id)
            ]).then(value => {
                if (value[0]) {
                    this._systemAlertService.success(this._translate.instant('COMMON.DEACTIVATE_SUCCESS'));

                    this.reload();
                } else {
                    this.viewControl.loading$.next(false);
                }
            }).catch(() => {
                this.viewControl.loading$.next(false);
            }).finally(() => sub.unsubscribe());
        });
    }

    private parseSellingPoint(form: FormGroup): SellingPointModel {
        let sp = new SellingPointModel();

        sp.BrandId = this.viewData.brand.Id;
        sp.Id = this.viewData.sellingPoint.Id;

        sp.Detail.FullTitle[this.lang] = form.get('SellingPointTitle').value;
        sp.Detail.Title[this.lang] = form.get('SellingPointTitle').value;
        sp.Detail.FullTitle["en"] = form.get('SellingPointTitleEn').value;
        sp.Detail.Title["en"] = form.get('SellingPointTitleEn').value;

        sp.Detail.Description[this.lang] = form.get('SellingPointDescription').value;
        sp.Detail.Description["en"] = form.get('SellingPointDescriptionEn').value;

        form.get('Posters').value.forEach(element => {
            sp.Gallery.push(element);
        });

        form.get('Video').value.forEach(element => {
            sp.Gallery.push(element);
        });

        sp.Icon = form.get('Icon').value;
        sp.Order = form.get('Order').value;
        sp.Tags = form.get('Tags').value.map(x => x.Name);
        for (let service of form.get('Actions').value) {
            let action = new GnActionModel();

            action.Service = service;

            sp.Actions.push(action);
        }
        sp.StartDate = form.get('DateRanges').value[0];
        sp.EndDate = form.get('DateRanges').value[1];
        sp.Repeat = form.get('Repeat').value;
        sp.TimeRanges = form.get('TimeRanges').value;

        sp.Units = form.get('ApplyForSomeUnits').value ? [] : form.get('Units').value;

        return sp;
    }

    private reload() {
        Promise.all([
            this._sellingPointService.get(this.viewData.sellingPoint.Id)
        ]).then(value => {
            let sellingPoint = value[0];

            this.viewControl.ready = false;

            this._sellingPointsDetailState.sellingPoint$.next(sellingPoint);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) return;

            this.viewControl.ready = true;

            this.ids = { "brandId": this.viewData.brand.Id, "spId": this.viewData.sellingPoint.Id };

            this.bindBreadcrumbs();

            this.viewModel.sellingPoint = this.parseToViewModel(this.viewData.sellingPoint);

            this.parseToForm(JSON.parse(JSON.stringify(this.viewData.sellingPoint)));

            this.viewControl.loading$.next(false);
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINTS.LIST", page: '/selling-points' },
            { title: new LanguagePipe().transform(this.viewData.sellingPoint.Detail.Title), page: `/selling-points/${this.viewData.sellingPoint.Id}` },
            { title: "SELLING_POINTS.BASIC_INFO", page: `/selling-points/${this.viewData.sellingPoint.Id}/basic-info` }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this._sellingPointsState.brand$.subscribe(value => {
                if (value) {
                    this.viewData.brand = value;

                    this._readyConditions.set("Brand", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._sellingPointsState.icons$.subscribe(value => {
                if (value) {
                    this.viewData.icons = value.map(x => {
                        return {
                            id: x.id,
                            text: x.text,
                            url: this._storageEndPoint + x.id + ".png"
                        }
                    });
                    this.viewData.icons$.next(value);

                    this._readyConditions.set("Icons", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._sellingPointsDetailState.sellingPoint$.subscribe(value => {
                if (value) {
                    this.viewData.sellingPoint = value;

                    this._readyConditions.set("SellingPoint", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this.form.valueChanges.subscribe(value => {
                this.parseSellingPointPreview(this.form)
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("SellingPoint")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private parseSellingPointPreview(form: any) {
        let preview: any = {
            Type: "",
            DateRanges: [],
            TimeRanges: [],
            SellingPointTitle: "",
            SellingPointDescription: "",
            Backgrounds: [],
            ActionButton: {},
        };

        preview.Type = this.viewData.icons.filter(X => X.id == form.get("Icon").value);
        preview.DateRanges = form.get("DateRanges").value;
        preview.TimeRanges = form.get("TimeRanges").value;
        preview.SellingPointTitle = form.get("SellingPointTitle").value;
        preview.SellingPointDescription = form.get("SellingPointDescription").value;
        preview.Backgrounds = form.get("Posters").value;

        let actions = form.get("Actions").value;
        if (actions && actions.length > 0 && actions[0].Parameters && actions[0].Parameters.Title) {
            preview.ActionButton = actions[0].Parameters.Title[this.lang];
        } else {
            preview.ActionButton = this._translate.instant("SELLING_POINT_PREVIEW.ACTIONS.ACTION_API");
        }

        this.sellingPointPreview.setValue(preview)
    }

    private parseToForm(sellingPoint: SellingPointModel) {
        this.form.get('SellingPointTitle').setValue(new LanguagePipe().transform(sellingPoint.Detail.Title));
        this.form.get('SellingPointTitleEn').setValue(sellingPoint.Detail.Title["en"] || "");
        this.form.get('SellingPointDescription').setValue(new LanguagePipe().transform(sellingPoint.Detail.Description));
        this.form.get('SellingPointDescriptionEn').setValue(sellingPoint.Detail.Description["en"] || "");

        let posters: ResourceModel[] = [];

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();

            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;

            if (gallery.Type === ResourceType.Image) {
                posters.push(gallery);
            }
        }
        this.form.get('Video').setValue(sellingPoint.Gallery.filter(x => x.Type == ResourceType.HLS || x.Type == ResourceType.Video) || []);
        this.form.get('Posters').setValue(posters);

        this.form.get('Icon').setValue(sellingPoint.Icon);
        this.form.get('Order').setValue(sellingPoint.Order);
        this.form.get('Tags').setValue(sellingPoint.Tags.map(x => { return { Id: "", Name: x } }));
        this.form.get('Actions').setValue(sellingPoint.Actions.map(x => x.Service));

        this.form.get('DateRanges').setValue([new Date(sellingPoint.StartDate), new Date(sellingPoint.EndDate)]);
        this.form.get('TimeRanges').setValue(sellingPoint.TimeRanges);
        this.form.get('Repeat').setValue(sellingPoint.Repeat);
        this.form.get('ApplyForSomeUnits').setValue(!sellingPoint.Units || sellingPoint.Units.length === 0);
        this.form.get('Units').setValue(sellingPoint.Units);
    }

    private parseToViewModel(sellingPoint: SellingPointModel): SellingPointBasicViewModel {
        let vm = new SellingPointBasicViewModel();

        vm.Title = new LanguagePipe().transform(sellingPoint.Detail.Title);
        vm.TitleEn = new LanguagePipe().transform(sellingPoint.Detail.Title, "en");
        vm.Description = new LanguagePipe().transform(sellingPoint.Detail.Description);
        vm.DescriptionEn = new LanguagePipe().transform(sellingPoint.Detail.Description, "en");
        vm.StartDate = new Date(sellingPoint.StartDate);
        vm.EndDate = new Date(sellingPoint.EndDate);
        vm.Status = sellingPoint.Status;
        vm.Icon = sellingPoint.Icon;
        vm.Order = sellingPoint.Order;
        vm.TimeRanges = sellingPoint.TimeRanges;
        vm.Tags = sellingPoint.Tags;
        vm.Units = sellingPoint.Units;
        vm.RepeatString = this._scheduleUtil.toString(sellingPoint.Repeat);
        if (this.viewData.icons.length > 0) {
            let icon = this.viewData.icons.find(x => x.id === sellingPoint.Icon);
            vm.IconName = icon ? icon.text : "";
        }

        for (let i = 0; i < sellingPoint.Gallery.length; i++) {
            let gallery = new ResourceModel();

            gallery.Url = sellingPoint.Gallery[i].Url;
            gallery.Type = sellingPoint.Gallery[i].Type;

            if (gallery.Type === ResourceType.Video) {
                vm.Video.push(gallery.Url);
            }
            else if (gallery.Type === ResourceType.Image) {
                vm.Posters.push(gallery);
            }
        }

        vm.Actions = sellingPoint.Actions.map(x => x.Service);

        return vm;
    }

    private generateForm(): FormGroup {
        return this._formBuilder.group(
            {
                Order: new FormControl(0),

                Icon: new FormControl('', [<any>Validators.required]),
                SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
                SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
                SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
                SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),

                Posters: new FormControl([], [<any>Validators.required]),
                Video: new FormControl([]),
                Tags: new FormControl([], [<any>Validators.required, MinArray.validate(5)]),

                DateRanges: new FormControl([]),
                Repeat: new FormControl(new ScheduleRepeatEveryModel()),

                TimeRanges: new FormControl([[8, 22]], [<any>Validators.required]),
                Actions: new FormControl([], [<any>Validators.required]),

                ApplyForSomeUnits: new FormControl(true),
                Units: new FormControl([]),
            },
        );
    }
}
