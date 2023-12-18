import { Component, OnInit, ViewChild, ElementRef, Renderer, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, merge, fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../../../../../environments/environment';

import {
    IconTransformer,

    QueryParamsModel,
    IconViewModel,
    Blob,

    IconsDataSource,

    IconService,
    SystemAlertService,
    SubheaderService,
    ConfirmService
} from '../../../../../../core/core.module';

@Component({
    selector: 'app-icons-list',
    templateUrl: './icons-list.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconsListPage implements OnInit, OnDestroy {

    @ViewChild("fileInputMulti", { static: true }) fileInputMulti: ElementRef;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    blobs: Blob[] = [];

    storageEndpoint: string = environment.storageEndpoint;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewFilter: any = {
        filterName: "",
    }

    viewData: any = {
        displayedColumns: ["Index", "Name", "Actions"],
        dataSource: new IconsDataSource(),
        icons$: new BehaviorSubject<IconViewModel[]>([]),
        iconsResult: new Array<IconViewModel>(),
        iconsStored: new Array<IconViewModel>(),
    }

    constructor(
        private _renderer: Renderer,
        private _iconService: IconService,
        private _systemAlertService: SystemAlertService,
        private _subheaderService: SubheaderService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        private _iconTransformer: IconTransformer,
    ) { }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.init();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    loadIcons(): void {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
            this.paginator.pageIndex,
            this.paginator.pageSize
        );

        this.viewData.dataSource.load(this.viewData.iconsStored, queryParams);
    }

    async refresh() {
        this.viewControl.loading$.next(true);

        let icons = await this._iconService.getBlobs();

        this.viewControl.loading$.next(false);

        this.viewData.icons$.next(this._iconTransformer.convertModelToViewModel(icons));
    }

    create() {
        let event = new MouseEvent('click', { bubbles: true });

        this._renderer.invokeElementMethod(this.fileInputMulti.nativeElement, "dispatchEvent", [event]);
    }

    download(value: IconViewModel) {
        if (value.Name.length > 0) {
            window.open(value.Url);
        }
    }

    async delete(value: IconViewModel) {
        var blob = this.viewData.iconsStored.find(x => x.Url === value.Url);

        if (blob) {
            const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), "Bạn thật sự muốn xóa tập tin này?");

            let sub = dialogRef.afterClosed().subscribe(async res => {
                if (res) {
                    this.viewControl.loading$.next(true);

                    let result = await this._iconService.delete(blob.Name);

                    this.viewControl.loading$.next(false);

                    if (result) {
                        this._systemAlertService.success("Xóa tập tin thành công");

                        await this.refresh();
                    }
                }
            });

            this._obsers.push(sub);
        } else {
            this._systemAlertService.error("Không tìm thấy tập tin");
        }
    }

    async fileChange(event) {
        let files = event.target.files;
        if (files) {
            this.viewControl.loading$.next(true);

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                let formData: FormData = new FormData();

                formData.append('file', file, file.name);

                let result = await this._iconService.submit(formData);

                if (result) {
                    this._systemAlertService.success("Tải lên thành công.");

                    await this.refresh();
                }
            }

            this.fileInputMulti.nativeElement.value = "";

            this.viewControl.loading$.next(false);
        }
    }

    private init() {
        Promise.all([
            this._iconService.getBlobs()
        ]).then(value => {
            let vm = this._iconTransformer.convertModelToViewModel(value[0]);

            this.viewData.icons$.next(vm);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })

        this.bindBreadcrumbs();
        this.bindDataSource();
        this.bindEvents();
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        filter.Name = searchText;

        return filter;
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.icons$, queryParams);
    }

    private bindBreadcrumbs(): void {
        this._subheaderService.setBreadcrumbs([
            { title: "ICONS.LIST", page: '/icons' }
        ]);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
        );

        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.iconsResult = res;
            })
        );

        this._obsers.push(
            this.viewData.icons$.subscribe(res => {
                this.viewData.iconsStored = res;
            })
        );
    }

    private bindEvents(): void {
        this._obsers.push(
            merge(this.sort.sortChange, this.paginator.page)
                .pipe(
                    tap(() => {
                        this.loadIcons();
                    })
                )
                .subscribe()
        );

        this._obsers.push(
            fromEvent(this.searchInput.nativeElement, 'keyup')
                .pipe(
                    debounceTime(150),
                    distinctUntilChanged(),
                    tap(() => {
                        this.paginator.pageIndex = 0;

                        this.loadIcons();
                    })
                )
                .subscribe()
        );
    }
}
