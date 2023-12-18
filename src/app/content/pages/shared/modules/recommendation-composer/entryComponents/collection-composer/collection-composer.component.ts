import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';


import {
    CollectionResourceViewModel,

    LanguagePipe,

    SellingPointModel,
    BrandModel,

    SellingPointService,
    BrandService,
    SellingPointOverviewViewModel,
    SellingPointTransformer,
    ResourceType
} from '../../../../../../../core/core.module';

import { BrandsSelectorComponent } from '../brands-selector/brands-selector.component';
import { SellingPointsSelectorComponent } from '../selling-points-selector/selling-points-selector.component';
import { SellingPointTimelineComponent } from '../../../../components';

@Component({
    selector: 'm-collection-composer',
    templateUrl: './collection-composer.component.html',
    styleUrls: ['./collection-composer.component.scss']
})
export class CollectionComposerComponent implements OnInit {
    @Input() readonly: boolean = true;
    @Input() collections$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);
    @Output() onChange: EventEmitter<CollectionResourceViewModel[]> = new EventEmitter<CollectionResourceViewModel[]>();

    private _obsers: any[] = [];
    private mode: "";
    private _filter: any = {};

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    lang: string = "vi";

    models$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);

    COLLECTION_BRAND_TYPE = "0";
    COLLECTION_SELLING_POINT_TYPE = "1";

    viewData: any = {
        collectionType: "",
        sellingPointModels: Array<SellingPointOverviewViewModel>()
    }

    constructor(
        private _sellingPointService: SellingPointService,
        private _brandService: BrandService,
        public dialog: MatDialog,
        private _sellingPointTransformer: SellingPointTransformer,
    ) { }

    ngOnInit() {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    add(): void {
        const data: any = {
            selected: this.models$.getValue().map(x => x.Id),
            filter: this._filter,
            mode: this.mode,
        }

        const dialogRef = this.getDialogRef(this.viewData.collectionType, data);

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.mode = res.mode;

                for (let key of Object.keys(res.filter)) {
                    this._filter[key] = res.filter[key];
                }

                if (!res.data) return;

                if (this.viewData.collectionType == this.COLLECTION_SELLING_POINT_TYPE) {
                    this.viewData.sellingPointModels.push(...res.data.map(x => this._sellingPointTransformer.toSellingPointOverview(x)));
                }

                let models = this.models$.getValue();

                models.push(...this.parsetoCollectionViewModel(this.viewData.collectionType, res.data));

                models = this.indexing(models);

                this.models$.next(models);
                this.onChange.emit(models);
            }

            sub.unsubscribe();
        });
    }

    showTimeline() {
        this.dialog.open(SellingPointTimelineComponent, { data: this.viewData.sellingPointModels, disableClose: true });
    }

    onSliderChange(event): void {
        this.models$.next(event);
        this.onChange.emit(event);
    }

    onCollectionTypeChange(): void {
        this.models$.next([]);
        this.onChange.emit([]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.collections$.subscribe(value => {
                if (value) {
                    this.init(value);
                }
            })
        );
    }

    private init(models: any[]): void {
        if (models.find(x => x.Type.toString() === this.COLLECTION_BRAND_TYPE)) {
            this.viewData.collectionType = this.COLLECTION_BRAND_TYPE;

            this.initCollectionBrand(models);
        } else if (models.find(x => x.Type.toString() === this.COLLECTION_SELLING_POINT_TYPE)) {
            this.viewData.collectionType = this.COLLECTION_SELLING_POINT_TYPE;

            this.initCollectionSellingPoint(models);
        }
    }

    private initCollectionBrand(collections: any[]): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._brandService.getByIds(collections.map(x => x.Id))
        ]).then(value => {
            let vms = this.parseBrandToCollectionViewModel(value[0]) as CollectionResourceViewModel[];
            let models: CollectionResourceViewModel[] = [];

            for (let item of collections) {
                let model = JSON.parse(JSON.stringify(item)) as CollectionResourceViewModel;

                let entity = vms.find(x => x.Id === model.Id);

                if (entity) {
                    model.Name = entity.Name;
                    model.Status = entity.Status;
                    model.Image = entity.Image;
                }

                models.push(model);
            }

            this.models$.next(models);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private initCollectionSellingPoint(collections: any[]): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._sellingPointService.getByIds(collections.map(x => x.Id))
        ]).then(value => {
            let vms = this.parseSellingPointToCollectionViewModel(value[0]) as CollectionResourceViewModel[];
            let models: CollectionResourceViewModel[] = [];

            this.viewData.sellingPointModels = value[0].map(x => this._sellingPointTransformer.toSellingPointOverview(x));

            for (let item of collections) {
                let model = JSON.parse(JSON.stringify(item)) as CollectionResourceViewModel;

                let entity = vms.find(x => x.Id === model.Id);

                if (entity) {
                    model.Name = entity.Name;
                    model.Description = entity.Description;
                    model.Status = entity.Status;
                    model.Image = entity.Image;
                    model.StartDate = entity.StartDate;
                    model.EndDate = entity.EndDate;
                }

                models.push(model);
            }

            this.models$.next(models);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private indexing(models: any[]): any[] {
        let newModels = [];

        let i = 1;

        for (let item of models) {
            item.Order = i++;

            newModels.push(item);
        }

        return newModels;
    }

    private getDialogRef(collectionType: string, data: any): any {
        let dialogRef;

        switch (collectionType.toString()) {
            case this.COLLECTION_SELLING_POINT_TYPE:
                dialogRef = this.dialog.open(SellingPointsSelectorComponent, { data: data, disableClose: true });
                break;

            default:
                dialogRef = this.dialog.open(BrandsSelectorComponent, { data: data, disableClose: true });
                break;
        }

        return dialogRef;
    }

    private parsetoCollectionViewModel(type: string, data: any[]): any[] {
        let vm = [];

        switch (type) {
            case this.COLLECTION_SELLING_POINT_TYPE:
                vm = this.parseSellingPointToCollectionViewModel(data);
                break;

            default:
                vm = this.parseBrandToCollectionViewModel(data);
                break;
        }

        return vm;
    }

    private parseBrandToCollectionViewModel(brands: BrandModel[]): any[] {
        return brands.map(x => {
            let image = x.Background.find(x => x.Type === ResourceType.Image);

            return {
                Id: x.Id,
                Name: new LanguagePipe().transform(x.Name),
                Type: this.COLLECTION_BRAND_TYPE,
                Order: 0,
                Status: x.Status,
                Description: "",
                Image: image ? image.Url : "",
            }
        });
    }

    private parseSellingPointToCollectionViewModel(sellingPoints: SellingPointModel[]): any[] {
        return sellingPoints.map(x => {
            let image = x.Gallery.find(x => x.Type === ResourceType.Image);

            return {
                Id: x.Id,
                Name: new LanguagePipe().transform(x.Detail.Title),
                Type: this.COLLECTION_SELLING_POINT_TYPE,
                Order: 0,
                Description: new LanguagePipe().transform(x.Detail.Description),
                Status: x.Status,
                Image: image ? image.Url : "",
                StartDate: x.StartDate,
                EndDate: x.EndDate
            }
        });
    }
}
