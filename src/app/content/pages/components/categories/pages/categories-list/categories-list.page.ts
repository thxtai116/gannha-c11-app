import { OnInit, OnDestroy, ChangeDetectionStrategy, Component, ViewChild, ElementRef } from "@angular/core";
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import {
    SubheaderService,
    CategoryService,
    CategoriesDataSource,
    CategoryModel,
} from "../../../../../../core/core.module";

import { environment } from "../../../../../../../environments/environment";

@Component({
    selector: 'app-categories-list',
    templateUrl: './categories-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CategoriesListPage implements OnInit, OnDestroy {

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    storageEndpoint: string = environment.storageEndpoint;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false,
    }

    viewData: any = {
        dataSource: new CategoriesDataSource(),
        categories$: new BehaviorSubject<CategoryModel[]>([]),
        searchText: new BehaviorSubject<string>(""),
    }

    constructor(
        private _router: Router,
        private _categoryService: CategoryService,
        private _subheaderService: SubheaderService,
    ) {

    }

    ngOnInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let cate = await this._categoryService.getAll(true);

        this.viewData.categories$.next(cate);

        this.viewControl.loading$.next(false);
    }

    onAddCategory(event) {
        this._router.navigate([`/brand-categories/create`], { queryParams: { parentId: event } })
    }

    onEditCategory(event) {
        this._router.navigate([`/brand-categories/${event}`]);
    }

    async init() {
        this.viewControl.loading$.next(true);

        if (this.viewControl.ready) return;
        this.viewControl.ready = true;

        Promise.all([
            this._categoryService.getAll(true)
        ]).then(value => {
            let cate = value[0];

            this.viewData.categories$.next(cate);
        })
        this.viewControl.loading$.next(false);

        this.bindBreadcrumbs();
        this.bindEvents();
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "CATEGORIES.LIST", page: '/categories' }
        ]);
    }

    private bindEvents(): void {
        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.viewData.searchText.next(this.searchInput.nativeElement.value);
                })
            ).subscribe()
        );
    }
}