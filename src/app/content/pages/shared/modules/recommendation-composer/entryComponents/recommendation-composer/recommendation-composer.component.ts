import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material';

import {
    CollectionResourceViewModel,
    CollectionModel,

    LanguagePipe,

    CollectionService,
    ResourceType
} from '../../../../../../../core/core.module';

import { CollectionsSelectorComponent } from '../collections-selector/collections-selector.component';

@Component({
    selector: 'm-recommendation-composer',
    templateUrl: './recommendation-composer.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./recommendation-composer.component.scss'],



})
export class RecommendationComposerComponent implements OnInit {
    @Input() readonly: boolean = true;
    @Input() collections$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);
    @Output() onChange: EventEmitter<CollectionResourceViewModel[]> = new EventEmitter<CollectionResourceViewModel[]>();

    private _obsers: any[] = [];
    private _filter: any = {
        'status': "",
        'text': ""
    }

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        ready: false
    }

    lang: string = "vi";

    models$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);

    constructor(
        private _collectionService: CollectionService,
        public dialog: MatDialog,
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
            filter: this._filter
        }

        const dialogRef = this.dialog.open(CollectionsSelectorComponent, { data: data, disableClose: true });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this._filter = res.filter;

            if (!res.data) return;

            let models = this.models$.getValue();

            models.push(...this.parseToViewModel(res.data));

            models = this.indexing(models);

            this.models$.next(models);
            this.onChange.emit(models);

            sub.unsubscribe();
        });
    }

    onSliderChange(event): void {
        this.models$.next(event);
        this.onChange.emit(event);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.collections$.subscribe(value => {
                if (value) {
                    if (value.length > 0)
                        this.loadCollections(value);
                }
            })
        );
    }

    private loadCollections(collections: CollectionResourceViewModel[]): void {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._collectionService.getByIds(collections.map(x => x.Id))
        ]).then(value => {
            let vms = this.parseToViewModel(value[0]) as CollectionResourceViewModel[];
            let models: CollectionResourceViewModel[] = [];

            for (let item of collections) {
                let model = JSON.parse(JSON.stringify(item)) as CollectionResourceViewModel;

                let entity = vms.find(x => x.Id === model.Id);

                if (entity) {
                    model.Name = entity.Name;
                    model.Description = entity.Description;
                    model.Image = entity.Image;
                    model.StartDate = entity.StartDate;
                    model.EndDate = entity.EndDate;
                    model.Status = entity.Status;
                }

                models.push(model);
            }

            this.models$.next(models);

            this.viewControl.loading$.next(false);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        });
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

    private parseToViewModel(collections: CollectionModel[]): any[] {
        return collections.map(x => {
            let image = x.Gallery.find(x => x.Type === ResourceType.Image);

            return {
                Id: x.Id,
                Name: new LanguagePipe().transform(x.Title),
                Type: 0,
                Order: 0,
                Description: new LanguagePipe().transform(x.Description),
                Image: image ? image.Url : "",
                StartDate: x.StartDate,
                EndDate: x.EndDate,
                Status: x.Status
            }
        });
    }
}