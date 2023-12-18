import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';

import { CategoriesSelectorComponent } from '../categories-selector/categories-selector.component';

import { CollectionResourceViewModel, CategoryModel, CategoryService, CategoryUtility, CategoryViewModel, CategoryTransformer } from '../../../../../../../core/core.module';

@Component({
    selector: 'm-category-composer',
    templateUrl: './category-composer.component.html',
    styleUrls: ['./category-composer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryComposerComponent implements OnInit {
    @Input() readonly: boolean = true;
    @Input() collections$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);
    @Output() onChange: EventEmitter<CollectionResourceViewModel[]> = new EventEmitter<CollectionResourceViewModel[]>();

    private _obsers: any[] = [];

    private _filter: any = {
        'status': "",
        'text': ""
    }

    private _readyConditions: Map<string, boolean> = new Map([
        ["Categories", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    }

    viewData: any = {
        categoryViewModels: new Array<CategoryViewModel>(),
        categories$: new BehaviorSubject<CategoryModel[]>(null)
    }

    lang: string = "vi";

    models$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);

    stored: any;

    constructor(
        private _categoryService: CategoryService,
        private _categoryUtil: CategoryUtility,
        private _categoryTransformer: CategoryTransformer,
        public dialog: MatDialog,
    ) { }

    ngOnInit() {
        Promise.all([
            this._categoryService.getAll()
        ]).then(value => {
            this.viewData.categories$.next(value[0]);
        })

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    add(): void {
        const data: any = {
            selectedCategories: this.models$.getValue().map(x => x.Id),
            filter: this._filter
        }

        const dialogRef = this.dialog.open(CategoriesSelectorComponent, { data: data, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;

            if (!res.data) return;

            let models = this.models$.getValue();

            models.push(...res.data);

            models = this.indexing(models);

            this.models$.next(models);
            this.onChange.emit(models);

            sub.unsubscribe();
        })
    }

    onSliderChange(event): void {
        this.models$.next(event);
        this.onChange.emit(event);
    }

    private init(): void {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            let models = this.parseModels(this.stored, this.viewData.categories$.getValue());

            this.models$.next(models);
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.collections$.subscribe(value => {
                if (value) {
                    this.stored = value;
                }
            })
        );

        this._obsers.push(
            this.viewData.categories$.subscribe(value => {
                if (value) {
                    this._readyConditions.set("Categories", true);

                    this.init();
                }
            })
        );
    }

    private indexing(models: any[]): any[] {
        let newModels = [];

        let i = 1;

        for (let item of models) {
            item.Order = i++;
            item.Type = 0;

            newModels.push(item);
        }

        return newModels;
    }

    private parseModels(models: any[], categories: CategoryModel[]): any[] {
        let collections: CollectionResourceViewModel[] = [];
        let viewModels = this._categoryUtil.getCategories(models.map(x => x.Id), categories).map(x => this._categoryTransformer.toCategoryOverView(x));

        for (let model of models) {
            let collection = new CollectionResourceViewModel();

            collection.Id = model.Id;
            collection.Order = model.Order;
            collection.Type = model.Type;

            let cat = viewModels.find(x => x.Id === model.Id);

            if (cat) {
                collection.Name = cat.Name;
                collection.Image = cat.Image;
            }

            collections.push(collection);
        }

        return collections;
    }
}
