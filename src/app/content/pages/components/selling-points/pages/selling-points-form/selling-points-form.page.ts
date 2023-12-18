import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from "@angular/router";

import {
    BrandModel,
    ResourceModel,
    SellingPointModel,
    ScheduleRepeatEveryModel,
    SellingPointTypeModel,
    GnActionModel,
    ActionType,
    SellingPointService,
    SubheaderService,
    SystemAlertService,
    SellingPointTypeService,

    MinArray,
    MaxWords,
    SellingPointMaxWords,
    ResourceType,
    StorageUtility,
    LocalStorageKey,
    UuidUtility,
    LanguagePipe,
} from '../../../../../../core/core.module';

import { SellingPointsState } from '../../states';

import { environment } from '../../../../../../../environments/environment';

@Component({
    selector: 'm-selling-points-form',
    templateUrl: './selling-points-form.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsFormPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];
    private _readyConditions: Map<string, boolean> = new Map([
        ["SellingPoint", false],
        ["Brand", false],
        ["Icons", false]
    ]);
    private _storageEndPoint = environment.storageEndpoint;
    private _id: string = "";

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        submitting: false,
        loading$: new BehaviorSubject<boolean>(false)
    };

    form: FormGroup;

    sellingPointPreview: FormControl = new FormControl({});

    ids: any;

    viewData: any = {
        brand: new BrandModel(),
        spType: new Array<SellingPointTypeModel>(),
        icons: new Array<any>([]),
        spId: "",
        draftId: "",
    };

    sellingPointMaxWords = SellingPointMaxWords;

    constructor(
        private _router: Router,
        private _sellingPointService: SellingPointService,
        private _sellingPointsState: SellingPointsState,
        private _subheaderService: SubheaderService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _spTypeService: SellingPointTypeService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _storageUtil: StorageUtility,
        private _uuidUtility: UuidUtility,
    ) {
        this.form = this.generateForm();
        this.viewData.draftId = this._uuidUtility.UUID();
    }

    ngOnInit(): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._sellingPointService.generateId(),
            this._spTypeService.getAll(),
        ]).then(value => {
            this.viewData.spId = value[0];
            this.viewData.spType = value[1];

            this._readyConditions.set("SellingPoint", true);

            this.init();
        });

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


        let sellingPoint = this.parseForm(this.form);

        this.viewControl.loading$.next(true);

        let result = await this._sellingPointService.create(sellingPoint);

        this.viewControl.loading$.next(false);

        this.viewControl.submitting = false;

        if (result) {
            this.deleteDraft(this.viewData.draftId);
            this._systemAlertService.success(this._translate.instant("SELLING_POINTS.CREATE_SUCCESSFUL"));
            this._router.navigate(["selling-points", result.Id]);
        }
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready) {
                this._router.navigate(['selling-points']);
            } else {
                this.viewControl.ready = true;

                let _id = this._route.snapshot.params["id"];

                this.ids = { "brandId": this.viewData.brand.Id, "spId": this.viewData.spId };

                this.bindBreadcrumbs();

                this.viewControl.loading$.next(false);

                if (_id && _id.length > 0) {
                    this.viewData.draftId = _id;

                    let currentList: SellingPointModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints));

                    let spDraft = currentList.find(x => x.Id == this.viewData.draftId);

                    this.parseToForm(spDraft);
                }
            }
        }
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "SELLING_POINTS.LIST", page: `/selling-points` },
            { title: "SELLING_POINTS.NEW_SELLING_POINT", page: `/selling-points/create` }
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
                    value.sort((a, b) => (a.text > b.text) ? 1 : (b.text > a.text) ? -1 : 0);

                    this.viewData.icons = value.map(x => {
                        return {
                            id: x.id,
                            text: x.text,
                            url: this._storageEndPoint + x.id + ".png"
                        }
                    });

                    this._readyConditions.set("Icons", true);
                }
            })
        );

        this._obsers.push(
            this.form.valueChanges.subscribe(() => {
                this.parseSellingPointPreview(this.form);
                this.saveDraft(this.form);
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
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

    private parseSellingPointPreview(form: FormGroup) {
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

    private parseForm(form: FormGroup): SellingPointModel {
        let sp = new SellingPointModel();
        sp.BrandId = this.viewData.brand.Id;
        sp.Id = this.viewData.spId;

        sp.Detail.Description[this.lang] = form.get('SellingPointDescription').value;
        sp.Detail.FullTitle[this.lang] = form.get('SellingPointTitle').value;
        sp.Detail.Title[this.lang] = form.get('SellingPointTitle').value;

        sp.Detail.Description["en"] = form.get('SellingPointDescriptionEn').value;
        sp.Detail.FullTitle["en"] = form.get('SellingPointTitleEn').value;
        sp.Detail.Title["en"] = form.get('SellingPointTitleEn').value;

        sp.StartDate = form.get('DateRanges').value[0];
        sp.EndDate = form.get('DateRanges').value[1];
        sp.Icon = form.get('Icon').value;
        sp.Units = form.get('Units').value || [];

        form.get('Posters').value.forEach(element => {
            sp.Gallery.push(element);
        });

        form.get('Video').value.forEach(element => {
            sp.Gallery.push(element);
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
        sp.Tags = form.get('Tags').value.map(x => x.Name);;
        sp.TimeRanges = form.get('TimeRanges').value;

        return sp;
    }

    private generateForm(): FormGroup {
        return this._formBuilder.group(
            {
                SellingPointTitle: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
                SellingPointTitleEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxTitle)]),
                SellingPointDescription: new FormControl('', [<any>Validators.required, <any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),
                SellingPointDescriptionEn: new FormControl('', [<any>MaxWords.validate(SellingPointMaxWords.MaxDescription)]),

                DateRanges: new FormControl([new Date(), new Date()]),
                Repeat: new FormControl(new ScheduleRepeatEveryModel()),
                TimeRanges: new FormControl([[8, 22]], [<any>Validators.required]),

                Posters: new FormControl([], [<any>Validators.required]),
                Video: new FormControl([]),

                Actions: new FormControl([], [<any>Validators.required]),

                ApplyForSomeUnits: new FormControl(true),
                Units: new FormControl([]),

                Icon: new FormControl('', [<any>Validators.required]),
                Order: new FormControl(1),
                Tags: new FormControl([], [<any>Validators.required, MinArray.validate(5)]),
            }
        );
    }

    private saveDraft(form: FormGroup) {
        let currentList: SellingPointModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints));
        let model = this.parseForm(form);
        model.Id = this.viewData.draftId;
        if (!currentList) {
            currentList = [model];
        } else {
            var oldItem = currentList.find(x => x.Id == model.Id);

            if (!oldItem) {
                currentList.push(model);
            } else {
                let index = currentList.findIndex(x => x.Id == oldItem.Id);
                currentList[index] = model;
            }
        }
        this._storageUtil.set(LocalStorageKey.draftSellingPoints, JSON.stringify(currentList));
    }

    private deleteDraft(id: string) {
        let currentList: SellingPointModel[] = JSON.parse(this._storageUtil.get(LocalStorageKey.draftSellingPoints));

        if (currentList) {
            let index = currentList.findIndex(x => x.Id == id);
            currentList.splice(index, 1);
            this._storageUtil.set(LocalStorageKey.draftSellingPoints, JSON.stringify(currentList));
        }
    }
}