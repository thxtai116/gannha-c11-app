import { Component, OnInit, ChangeDetectionStrategy, Inject, ComponentRef, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatButtonToggleChange } from '@angular/material';

import { SellingPointFilterType } from '../../consts';
import { MultiBrandSellingPointsSelectorComponent } from '../multi-brand-selling-points-selector/multi-brand-selling-points-selector.component';
import { SingleBrandSellingPointsSelectorComponent } from '../single-brand-selling-points-selector/single-brand-selling-points-selector.component';
import { TagSellingPointsSelectorComponent } from '../tag-selling-points-selector/tag-selling-points-selector.component';

@Component({
    selector: 'm-collection-selling-points-selector',
    templateUrl: './selling-points-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellingPointsSelectorComponent implements OnInit {
    @ViewChild('filter', { read: ViewContainerRef, static: true }) filter: ViewContainerRef;

    private _obsers: any[] = [];

    viewControl: any = {
        mode: SellingPointFilterType.MULTI_BRAND
    }

    viewData: any = {
        selected: [],
        filter: {}
    }

    sellingPointFilterType: any = SellingPointFilterType;

    componentRef: ComponentRef<any>;

    constructor(
        private _resolver: ComponentFactoryResolver,
        public dialogRef: MatDialogRef<SellingPointsSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
        this.parseInjectionData(this.data);
        this.initFilter(this.viewControl.mode, this.data);
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        if (this.componentRef)
            this.componentRef.destroy();
    }

    private parseInjectionData(data: any) {
        this.viewControl.mode = data['mode'] || SellingPointFilterType.MULTI_BRAND;
    }

    onCancelClick(): void {
        this.dialogRef.close({
            mode: this.viewControl.mode,
            filter: this.viewData.filter,
        });
    }

    onSubmit(): void {
        if (this.viewData.selected.length === 0)
            return;

        this.dialogRef.close({
            data: this.viewData.selected,
            mode: this.viewControl.mode,
            filter: this.viewData.filter
        });
    }

    onSelectFilterType(event: MatButtonToggleChange): void {
        this.viewControl.mode = event.value;

        this.initFilter(this.viewControl.mode, this.data);
    }

    private initFilter(type: string, data: any): void {
        this.filter.clear();

        const factory = this.getFilterFactory(type);

        if (factory) {
            if (this.componentRef)
                this.componentRef.destroy();

            this.componentRef = this.filter.createComponent(factory);

            this.componentRef.instance.data = data;

            if (this.componentRef.instance.onChange) {
                this.componentRef.instance.onChange.subscribe(value => {
                    this.viewData.selected = value;
                })
            }

            if (this.componentRef.instance.onFilterChange) {
                this.componentRef.instance.onFilterChange.subscribe(value => {
                    for (let key of Object.keys(value)) {
                        this.viewData.filter[key] = value[key];
                    }
                })
            }
        }
    }

    private getFilterFactory(type: string): any {
        let factory: any = null;

        switch (type.toLocaleLowerCase()) {
            case SellingPointFilterType.MULTI_BRAND:
                factory = this._resolver.resolveComponentFactory(MultiBrandSellingPointsSelectorComponent);

                break;

            case SellingPointFilterType.TAG:
                factory = this._resolver.resolveComponentFactory(TagSellingPointsSelectorComponent);

                break;

            default:
                factory = this._resolver.resolveComponentFactory(SingleBrandSellingPointsSelectorComponent);

                break;
        }

        return factory;
    }
}