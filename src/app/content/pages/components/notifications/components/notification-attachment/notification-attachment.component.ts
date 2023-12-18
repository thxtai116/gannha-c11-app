import { ChangeDetectionStrategy, Component, OnInit, forwardRef, Input, ElementRef, Renderer, ViewContainerRef, ViewChild, ComponentRef, ComponentFactoryResolver, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';

import { SingleSellingPointSelectorComponent } from '../../../../shared/modules/single-selling-point-selector/single-selling-point-selector.module';
import { SingleBrandSelectorComponent } from '../../../../shared/modules/single-brand-selector/single-brand-selector.module';
import { SingleCategorySelectorComponent } from '../../../../shared/modules/single-category-selector/single-category-selector.module';
import { SingleCollectionSelectorComponent } from '../../../../shared/modules/single-collection-selector/single-collection-selector.module';

import { SellingPointDetailComponent } from '../../entryComponents/selling-point-detail/selling-point-detail.component';
import { CollectionDetailComponent } from '../../entryComponents/collection-detail/collection-detail.component';
import { CategoryDetailComponent } from '../../entryComponents/category-detail/category-detail.component';
import { BrandDetailComponent } from '../../entryComponents/brand-detail/brand-detail.component';

@Component({
    selector: 'm-notification-attachment',
    templateUrl: './notification-attachment.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NotificationAttachmentComponent),
            multi: true,
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationAttachmentComponent implements OnInit, ControlValueAccessor {

    @Input() readonly: boolean = true;
    @Output() typeChange: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('displayer', { read: ViewContainerRef, static: true }) displayer: ViewContainerRef;

    private _resourceId: string = "";
    private _filter: any = {
        'status-selling-point': "2",
        'brand-selling-point': "",
        'text-selling-point': "",

        'status-collection': "",
        'text-collection': "",

        'status-category': "",
        'text-category': "",

        'category-brand': "",
        'status-brand': "2",
        'text-brand': "",
    };

    private _onChangeCallback = (value: any) => { };

    private ATTACHMENT_SELLING_POINT_TYPE = "0";
    private ATTACHMENT_BRAND_TYPE = "1";
    private ATTACHMENT_CATEGORY_TYPE = "2";
    private ATTACHMENT_COLLECTION_TYPE = "3";

    private _obsers: Subscription[] = [];

    attachment: any;

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false)
    }

    viewData: any = {
        attachmentType: "0"
    }

    lang: string = "vi";

    componentRef: ComponentRef<any>;

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer,
        private _resolver: ComponentFactoryResolver,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.componentRef)
            this.componentRef.destroy();

        this._obsers.forEach(x => x.unsubscribe());
    }

    writeValue(obj: any): void {
        if (obj) {
            this._resourceId = obj;
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState?(isDisabled: boolean): void {
    }

    onAttachmentTypeChange(): void {

    }

    attachFile(): void {
        const data: any = {
            selected: this._resourceId,
            filter: this._filter
        }

        const dialogRef = this.getDialogRef(this.viewData.attachmentType, data);

        let sub = dialogRef.afterClosed().subscribe(res => {

            this.saveFilter(res.filter);
            if (!res.data)
                return;

            this.attachment = res.data;

            this._resourceId = res.data.Id;

            this.emitChange();

            this.openDetailResource(this.viewData.attachmentType);

            this.componentRef.changeDetectorRef.detectChanges();
        });

        this._obsers.push(sub);
    }

    private saveFilter(filter: any) {
        for (let key of Object.keys(filter)) {
            this._filter[key] = filter[key];
        }
    }

    private openDetailResource(attachmentType: string): void {
        this.displayer.clear();

        const factory = this.getDetailRef(attachmentType);

        if (factory) {
            this.componentRef = this.displayer.createComponent(factory);

            this.componentRef.instance.resourceId$.next(this._resourceId);
        }
    }

    private emitChange() {
        this._onChangeCallback(this._resourceId);

        let event = new CustomEvent('change', { bubbles: true });

        this._renderer.invokeElementMethod(this._element.nativeElement, 'dispatchEvent', [event]);

        this.typeChange.emit(this.viewData.attachmentType);
    }

    private getDialogRef(attachmentType: string, data: any): any {
        let dialogRef;

        switch (attachmentType.toLowerCase()) {
            case this.ATTACHMENT_BRAND_TYPE:
                dialogRef = this.dialog.open(SingleBrandSelectorComponent, { data: data, disableClose: true });

                break;

            case this.ATTACHMENT_CATEGORY_TYPE:
                dialogRef = this.dialog.open(SingleCategorySelectorComponent, { data: data, disableClose: true });

                break;

            case this.ATTACHMENT_COLLECTION_TYPE:
                dialogRef = this.dialog.open(SingleCollectionSelectorComponent, { data: data, disableClose: true });

                break;

            default:
                dialogRef = this.dialog.open(SingleSellingPointSelectorComponent, { data: data, disableClose: true });

                break;
        }

        return dialogRef;
    }

    private getDetailRef(attachmentType: string): any {
        let factory: any = null;

        switch (attachmentType.toLocaleLowerCase()) {
            case this.ATTACHMENT_BRAND_TYPE:
                factory = this._resolver.resolveComponentFactory(BrandDetailComponent);

                break;

            case this.ATTACHMENT_CATEGORY_TYPE:
                factory = this._resolver.resolveComponentFactory(CategoryDetailComponent);

                break;

            case this.ATTACHMENT_COLLECTION_TYPE:
                factory = this._resolver.resolveComponentFactory(CollectionDetailComponent);

                break;

            default:
                factory = this._resolver.resolveComponentFactory(SellingPointDetailComponent);

                break;
        }

        return factory;
    }
}
