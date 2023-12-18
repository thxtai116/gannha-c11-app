import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, Injectable, ChangeDetectorRef } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

import {
    CategoryTreeViewModel,
    CategoryModel,
    CategoryTransformer,
    FilterStorageService
} from '../../../../../core/core.module';

@Injectable()
export class CategoriesDatabase {
    cachedCategories: CategoryModel[] = [];
    dataChange = new BehaviorSubject<CategoryTreeViewModel[]>([]);
    get data(): CategoryTreeViewModel[] { return this.dataChange.value; }

    constructor(
        private _categoryTransformer: CategoryTransformer,
    ) { }

    public setData(categories: CategoryModel[]) {
        let cates = categories.map(x => this._categoryTransformer.toCategoryTreeOverview(x));

        this.cachedCategories = categories;
        this.dataChange.next(cates);
    }

    public filter(searchText: string) {
        this.setData(this.cachedCategories);

        if (searchText.length > 0) {
            let categories = this.data;

            var i = categories.length;

            while (i--) {
                this.tryRemoveNode(categories[i], searchText);

                if (categories[i].Childs.length == 0) {
                    categories.splice(i, 1);
                }
            }

            this.dataChange.next(null);
            this.dataChange.next(categories);
        }
    }

    private tryRemoveNode(category: CategoryTreeViewModel, searchText: string): boolean {

        if (category.Childs && category.Childs.length > 0) {

            var i = category.Childs.length;
            while (i--) {
                let remove = this.tryRemoveNode(category.Childs[i], searchText);

                if (remove) {
                    category.Childs.splice(i, 1);
                }
            }
            if (category.Childs.length == 0) {
                return true;
            }
            return false;
        } else {
            return !this.containsSearchText(category, searchText);
        }
    }

    private containsSearchText(category: CategoryTreeViewModel, searchText: string): boolean {
        if (category.ViName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            return true;
        }
        if (category.EnName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
            return true;
        }
        return false;
    }
}

@Component({
    selector: 'm-advanced-categories',
    templateUrl: './advanced-categories.component.html',
    styleUrls: ['./advanced-categories.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CategoriesDatabase],
})
export class AdvancedCategoriesComponent implements OnInit, OnDestroy {

    @Input() categories: BehaviorSubject<CategoryModel[]>;
    @Input() searchText: BehaviorSubject<"">;
    //Unfinished
    @Input() selectable: boolean = false;
    @Input() selectedCategories: string[] = [];

    @Output() onEditCategory: EventEmitter<string> = new EventEmitter<string>();
    @Output() onAddCategory: EventEmitter<string> = new EventEmitter<string>();

    treeControl = new NestedTreeControl<CategoryTreeViewModel>(node => node.Childs);

    dataSource = new MatTreeNestedDataSource<CategoryTreeViewModel>();

    hasChild = (_: number, node: CategoryTreeViewModel) => !!node.Childs && node.Childs.length > 0;

    private _filter: any = {};

    viewFilter: any = {
        filterExpansion: [],
    }

    private _obsers: any[] = [];

    constructor(
        private _database: CategoriesDatabase,
        private _filterStorageService: FilterStorageService,
        private _changeRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.initFilter();
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        this.saveExpansion(this.treeControl.dataNodes);

        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    viewDetail(event) {
        this.onEditCategory.emit(event.Id);
    }

    createNode() {
        this.onAddCategory.emit("");
    }

    createChildNode(event) {
        this.onAddCategory.emit(event.Id);
    }

    private bindSubscribe() {
        this._obsers.push(this.categories.subscribe(value => {
            this._database.setData(value);
        }));

        this._obsers.push(this.searchText.subscribe(value => {
            this._database.filter(value);

            if (value.length == 0) {
                this.treeControl.collapseAll();
            } else {
                this.treeControl.expandAll();
            }
            this._changeRef.detectChanges()
        }));

        this._obsers.push(this._database.dataChange.subscribe(data => {
            this.dataSource.data = data;
            this.treeControl.dataNodes = data;

            if (this.viewFilter.filterExpansion.length > 0) {
                this.applyFilter();
            }
        }))
    }

    private applyFilter() {
        if (this.treeControl.dataNodes && this.treeControl.dataNodes.length > 0) {
            this.tryExpand(this.treeControl.dataNodes);
        }
    }

    private tryExpand(categories: CategoryTreeViewModel[]) {
        categories.forEach(cate => {
            if (this.viewFilter.filterExpansion.includes(cate.Id)) {
                this.treeControl.expand(cate);
                this._changeRef.detectChanges();
            }

            this.tryExpand(cate.Childs);
        })
    }

    private saveExpansion(categories: CategoryTreeViewModel[]) {
        categories.forEach(cate => {
            if (this.treeControl.isExpanded(cate)) {
                this.viewFilter.filterExpansion.push(cate.Id);
            }

            this.saveExpansion(cate.Childs)
        })

        this.saveFilter('Expansion', this.viewFilter.filterExpansion);
    }

    private saveFilter(key: string, value: any) {
        this._filter[key] = value;

        this._filterStorageService.set(AdvancedCategoriesComponent.name, this._filter);
    }

    private initFilter() {
        this._filter = this._filterStorageService.get(AdvancedCategoriesComponent.name);

        if (this._filter) {
            this.viewFilter.filterExpansion = this._filter['Expansion'];
        } else {
            this._filter = {};
        }
    }
}
