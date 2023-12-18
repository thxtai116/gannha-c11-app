import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CollectionResourceViewModel, ResourceType, ResourceModel, SellingPointOverviewViewModel, SellingPointModel, SellingPointBasicViewModel } from '../../../../../../../core/core.module';



@Component({
    selector: 'm-collections-slider',
    templateUrl: './collections-slider.component.html',
    styleUrls: ['./collections-slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsSliderComponent implements OnInit {
    @Input() readonly: boolean = true;
    @Input() collections$: BehaviorSubject<CollectionResourceViewModel[]> = new BehaviorSubject<CollectionResourceViewModel[]>([]);

    @Output() onChange: EventEmitter<CollectionResourceViewModel[]> = new EventEmitter<CollectionResourceViewModel[]>();

    models: CollectionResourceViewModel[] = [];


    @Input() images$: BehaviorSubject<ResourceModel[]> = new BehaviorSubject<ResourceModel[]>([]);
    model: CollectionResourceViewModel;

    private _obsers: any[] = [];

    constructor(
        private _changeRef: ChangeDetectorRef,
    ) {

    }

    ngOnInit() {
        this.bindSubscribes();

    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    remove(index: number): void {
        this.models.splice(index, 1);

        this.models = this.indexing(this.models);

        this.onChange.emit(this.models);
    }

    view(index: number): void {
        console.log(`Preview: ${index}`);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.collections$.subscribe(value => {
                this.models = value;

                this._changeRef.detectChanges();
            })
        );
    }

    drop(e: any, model: CollectionResourceViewModel) {
        let prePanel = this.models.find(x => x.Order === e.dragData.Order);
        let nexPanel = this.models.find(x => x.Order === model.Order);
        let order = JSON.parse(JSON.stringify(prePanel.Order));

        prePanel.Order = nexPanel.Order;
        nexPanel.Order = order;

        this.models = this.models.sort((a, b) => {
            if (a.Order > b.Order) {
                return 1;
            }

            if (a.Order < b.Order) {
                return -1;
            }

            return 0;
        });

        
          this.onChange.emit(this.models);

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
}
