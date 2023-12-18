import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
    FacebookPostsDataSource,

    FacebookPostModel,
    QueryParamsModel,

    FacebookPostOverviewViewModel,

    FilterStorageService,
    SubheaderService,
    FacebookPageService,

    FacebookPostTransformer,
    Status,
    SystemAlertService
} from '../../../../../../core/core.module';

import { RawSellingPointsFilterComponent } from '../raw-selling-points-filter/raw-selling-points-filter.component';
import { RawSellingPointsFormComponent } from '../raw-selling-points-form/raw-selling-points-form.component';
import { RawSellingPointsDetailComponent } from '../raw-selling-points-detail/raw-selling-points-detail.component';

@Component({
    selector: 'm-raw-selling-points-list',
    templateUrl: './raw-selling-points-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RawSellingPointsListPage implements OnInit {

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    private _obsers: any[] = [];
    private _searchParams;

    lang: string = "vi";

    viewControl: any = {
        ready: false,
        loading$: new BehaviorSubject<boolean>(false)
    };

    viewData: any = {
        displayedColumns: ["Index", "Id", "CreatedAt", "Status", "Actions"],
        dataSource: new FacebookPostsDataSource(),
        posts: new Array<FacebookPostModel>(),
        posts$: new BehaviorSubject<FacebookPostOverviewViewModel[]>([]),
        postsResult: new Array<FacebookPostOverviewViewModel>(),
        postsStored: new Array<FacebookPostOverviewViewModel>()
    };

    viewFilter: any = {
        filterStatus: ""
    };

    constructor(
        private _router: Router,
        private _facebookPageService: FacebookPageService,
        private _subheaderService: SubheaderService,
        private _filterStorageService: FilterStorageService,
        private _systemAlertService: SystemAlertService,
        private _translate: TranslateService,
        private _postTransformer: FacebookPostTransformer,
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;

        this.initSearchParams();

        this.bindSubscribes();
        this.bindBreadcrumbs();
        this.bindDataSource();
        this.bindEvents();

        this.init();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    onStatusChange(): void {
        this.loadPosts();
    }

    loadPosts(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.postsStored, queryParams);
    }

    refresh(): void {
        if (!this._searchParams)
            return;

        this.viewControl.loading$.next(true);

        Promise.all([
            this._facebookPageService.getPosts(this._searchParams.Id, this._searchParams.StartDate, this._searchParams.EndDate)
        ]).then(value => {
            this.viewData.posts = value[0];

            this.viewData.posts$.next(value[0].map(x => this._postTransformer.toFacebookPostOverview(x)));
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    search(): void {
        const dialogRef = this.dialog.open(RawSellingPointsFilterComponent, { data: this._searchParams, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            if (!res || !res.data) return;

            this._searchParams = res.data;

            this.saveSearchParams(this._searchParams);

            this.refresh();

            sub.unsubscribe();
        });
    }

    view(id: string): void {
        let post = this.viewData.posts.find(x => x.Id === id) as FacebookPostModel;

        if (post) {
            this.dialog.open(RawSellingPointsDetailComponent, { data: post, disableClose: true });
        }
    }

    create(id: string): void {
        let post = this.viewData.posts.find(x => x.Id === id) as FacebookPostModel;

        if (post) {
            if (post.Status === Status.Pending) {
                this._facebookPageService.updatePostStatus(post.PageId, post.Id, Status.Expired);
            }

            const dialogRef = this.dialog.open(RawSellingPointsFormComponent, { data: post, disableClose: true });

            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res || !res.data)
                    return;

                this.viewControl.loading$.next(true);

                Promise.all([
                    this._facebookPageService.updatePostStatus(post.PageId, post.Id, Status.Active, res.data.Id)
                ]).then(value => {
                    if (value) {
                        this._systemAlertService.success(this._translate.instant("RAW_SELLING_POINTS.IDENTIFY_SUCCESS"));

                        this.refresh();
                    }
                }).finally(() => {
                    this.viewControl.loading$.next(false);

                    sub.unsubscribe();
                })
            });
        }
    }

    private init(): void {
        if (this._searchParams) {
            this.refresh();
        }
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.posts$, queryParams);
    }

    private filterConfiguration(): any {
        const filter: any = {};

        if (this.viewFilter.filterStatus && this.viewFilter.filterStatus.length > 0) {
            filter.Status = this.viewFilter.filterStatus;
        }

        return filter;
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "RAW_SELLING_POINTS.LIST", page: '/raw-selling-points' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.postsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.posts$.subscribe(res => {
                this.viewData.postsStored = res;
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                this.bindBreadcrumbs();
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadPosts();
                    })
                )
                .subscribe()
        );
    }

    private saveSearchParams(searchParams: any): void {
        this._filterStorageService.set(RawSellingPointsListPage.name, searchParams);
    }

    private initSearchParams() {
        let params = this._filterStorageService.get(RawSellingPointsListPage.name);

        if (params) {
            this._searchParams = params;
        }
    }
}
