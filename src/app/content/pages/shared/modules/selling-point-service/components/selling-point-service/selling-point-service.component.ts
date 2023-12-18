import { ChangeDetectionStrategy, Component, OnInit, forwardRef, Input, ElementRef, Renderer, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
    GnServiceConnectionModel,

    OpenService,

    OpenServiceType,

    QueryParamsModel,
    ConfirmService,
    ActionType
} from '../../../../../../../core/core.module';

import { ServiceConnectionsDataSource } from '../../datasources';
import { ServiceConnectionViewModel } from '../../view-models';
import { ActionApiServiceType } from '../../consts';

import { CallToActionComponent } from '../call-to-action/call-to-action.component';
import { CallServiceComponent } from '../call-service/call-service.component';
import { OrderServiceComponent } from '../order-service/order-service.component';
import { PromotionCodeComponent } from '../promotion-code/promotion-code.component';
import { MembershipComponent } from '../membership/membership.component';

@Component({
    selector: 'm-selling-point-service',
    templateUrl: './selling-point-service.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SellingPointServiceComponent),
            multi: true
        }
    ],
})
export class SellingPointServiceComponent implements OnInit, ControlValueAccessor {
    @Input() readonly: boolean = true;
    @Input() max: number = 1;
    @Input() serviceType: string = OpenServiceType.SellingPoint;

    private _obsers: any[] = [];

    private _onChangeCallback: (_: any) => void = () => { };

    viewData: any = {
        displayedColumns: ['Type', 'Integration'],
        displayedColumnsEdit: ['Type', 'Integration', 'Action'],
        dataSource: new ServiceConnectionsDataSource(),
        openServices: [],
        services$: new BehaviorSubject<ServiceConnectionViewModel[]>([]),
        servicesResult: new Array<ServiceConnectionViewModel>(),
        servicesStored: new Array<ServiceConnectionViewModel>()
    };

    lang: string = "vi";

    colConnent: BehaviorSubject<ServiceConnectionViewModel>[] = [];

    constructor(
        private _element: ElementRef,
        private _renderer: Renderer,
        private _openService: OpenService,
        private _confirmService: ConfirmService,
        private _translate: TranslateService,
        private _changeRef: ChangeDetectorRef,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        Promise.all([
            this._openService.getByType(this.serviceType, ActionType.SpService)
        ]).then(value => {
            this.viewData.openServices = value[0];
        });

        this.bindDataSource();
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.services$.next(obj);

            this.initColContent(obj);
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {

    }

    setDisabledState?(isDisabled: boolean): void {

    }

    add(service: GnServiceConnectionModel): void {
        let data = {
            readonly: false
        }

        const dialogRef = this.getDialog(service.Type, data);

        if (dialogRef) {
            let sub = dialogRef.afterClosed().subscribe(res => {
                if (!res || !res.data) return;

                this.addNewService(service, res.data);
                this.emitChange();

                sub.unsubscribe();
            })
        } else {
            this.addNewService(service);
            this.emitChange();
        }
    }

    edit(index: number): void {
        let service = this.viewData.services$.getValue()[index];

        if (service) {
            let data = {
                readonly: this.readonly,
                model: service.Parameters
            }

            const dialogRef = this.getDialog(service.Type, data);

            if (dialogRef) {
                let sub = dialogRef.afterClosed().subscribe(res => {
                    if (!res || !res.data) return;

                    service.Parameters = JSON.parse(JSON.stringify(res.data));

                    this.colConnent[index].next(service);

                    this.emitChange();

                    sub.unsubscribe();
                })
            }
        }
    }

    remove(index: number): void {
        let confirmRemove = this._confirmService.show(this._translate.instant("COMMON.WARNING.REMOVE_ACTION_TITLE"),
            this._translate.instant("COMMON.WARNING.REMOVE_ACTION_MESSAGE"));

        confirmRemove.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                let services = this.viewData.services$.getValue() as GnServiceConnectionModel[];

                services.splice(index, 1);

                this.colConnent.splice(index, 1);

                this.viewData.services$.next(services);

                this.emitChange();
            }
        })
    }

    getColContent(index: number): any {
        return this.colConnent[index] || null;
    }

    private initColContent(services: GnServiceConnectionModel[]): void {
        for (let service of services) {
            this.colConnent.push(new BehaviorSubject<GnServiceConnectionModel>(service));
        }
    }

    private addNewService(service: GnServiceConnectionModel, data: any = null): void {
        let newService = JSON.parse(JSON.stringify(service)) as GnServiceConnectionModel;
        let services = this.viewData.services$.getValue();

        if (data) {
            newService.Parameters = data;
        }

        services.push(newService);

        this.colConnent.push(new BehaviorSubject<GnServiceConnectionModel>(newService));

        this.viewData.services$.next(services);
    }

    private emitChange() {
        this._onChangeCallback(this.viewData.services$.getValue());

        let event = new CustomEvent('change', { bubbles: true });

        this._renderer.invokeElementMethod(this._element.nativeElement, 'dispatchEvent', [event]);
    }

    private getDialog(type: string, data: any): any {
        let panelClass = ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'];

        switch (type) {
            case ActionApiServiceType.CALL_TO_ACTION:
                return this.dialog.open(CallToActionComponent, { data: data, disableClose: true, panelClass: panelClass });
            case ActionApiServiceType.CALL_SERVICE:
                return this.dialog.open(CallServiceComponent, { data: data, disableClose: true, panelClass: panelClass });
            case ActionApiServiceType.GN_COMMERCE:
                return this.dialog.open(OrderServiceComponent, { data: data, disableClose: true, panelClass: panelClass });
            case ActionApiServiceType.PROMOTION_CODE:
                return this.dialog.open(PromotionCodeComponent, { data: data, disableClose: true, panelClass: panelClass });
            case ActionApiServiceType.MEMBERSHIP:
                return this.dialog.open(MembershipComponent, { data: data, disableClose: true, panelClass: panelClass });

            default:
                return null;
        }
    }

    private bindDataSource(): void {
        const queryParams = new QueryParamsModel({});

        this.viewData.dataSource.init(this.viewData.services$, queryParams);
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.viewData.dataSource.entitySubject.subscribe(res => {
                this.viewData.servicesResult = res;
                this._changeRef.detectChanges();
            })
        );

        this._obsers.push(
            this.viewData.services$.subscribe(res => {
                this.viewData.servicesStored = res;
            })
        );
    }
}
