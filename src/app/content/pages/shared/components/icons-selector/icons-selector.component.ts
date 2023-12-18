import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Inject, ElementRef } from '@angular/core';
import { MatDialogRef, MatPaginator, MAT_DIALOG_DATA, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { BehaviorSubject, merge, fromEvent } from 'rxjs';

import {
    IconService,
    IconsDataSource,
    IconViewModel,
    QueryParamsModel,
    IconTransformer,
} from '../../../../../core/core.module';

import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { environment } from "../../../../../../environments/environment";
import { SelectionPreviewComponent } from '../selection-preview/selection-preview.component';

@Component({
    selector: 'm-icons-selector',
    templateUrl: './icons-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconsSelectorComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

    private _obsers: any[] = [];

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        displayedColumns: ["Select", "Name", "Icon"],
        dataSource: new IconsDataSource(),
        selection: new SelectionModel<IconViewModel>(true, []),
        initialResources: new Array<string>(),
        icons$: new BehaviorSubject<IconViewModel[]>([]),
        iconsResult: new Array<IconViewModel>(),
        iconsStored: new Array<IconViewModel>()
    }

    storageEndpoint: string = environment.storageEndpoint;

    constructor(
        private _iconService: IconService,
        private _iconTransformer: IconTransformer,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<IconsSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
        this.viewControl.loading$ = this.viewData.dataSource.loadingSubject;
        this.viewControl.loading$.next(true);

        this.viewData.initialResources = this.data["initialResource"] || [];

        this.parseInjectionData(this.data);
        this.init();

        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private parseInjectionData(data: any) {
        this.searchInput.nativeElement.value = data.filter['text'] || "";
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

    isAllSelected(): boolean {
        const numSelected = this.viewData.selection.selected.length;
        const numRows = this.viewData.dataSource.paginatorTotalSubject.value;

        return numSelected === numRows;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.viewData.selection.clear();
        } else {
            this.viewData.dataSource.entityStoredSubject.value.forEach(row => this.viewData.selection.select(row));
        }
    }

    onPreviewSelection(): void {
        let data = {
            selectedItems: this.viewData.selection.selected.map(x => x.Name)
        }

        const dialogRef = this.dialog.open(SelectionPreviewComponent, { data: data, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'], disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(value => {
            sub.unsubscribe();
        });
    }

    onCancelClick(): void {
        this.dialogRef.close({
            filter: {
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    onSubmit(): void {
        if (this.viewData.selection.selected.length !== 1)
            return;

        this.dialogRef.close({
            data: this.viewData.selection.selected.map(x => x.Name.substring(x.Name.lastIndexOf('/') + 1, x.Name.lastIndexOf('.'))),
            filter: {
                'text': this.searchInput.nativeElement.value
            }
        });
    }

    private filterConfiguration(): any {
        const filter: any = {};

        const searchText: string = this.searchInput.nativeElement.value;

        filter.Name = searchText;

        return filter;
    }

    private init(): void {
        this.bindDataSource();
        this.bindEvents();

        Promise.all([
            this._iconService.getBlobs()
        ]).then(value => {
            let vms = value[0].filter(x => this.viewData.initialResources.indexOf(x.Name) === -1);

            // let vms = this._iconTransformer.convertModelToViewModel(value[0]);

            this.viewData.icons$.next(this._iconTransformer.convertModelToViewModel(vms));

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel(this.filterConfiguration());

        this.viewData.dataSource.init(this.viewData.icons$, queryParams);
    }

    private bindSubscribes(): void {
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
                        this.loadIcons();
                    })
                )
                .subscribe()
        );
    }
}
