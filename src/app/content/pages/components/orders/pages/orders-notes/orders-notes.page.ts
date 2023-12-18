import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { OrdersDetailState } from '../../states';
import { MenuService } from '../../services';
import {
    OrderModel,
    SubheaderService,
    OrderService,
} from '../../../../../../core/core.module';
import { FormGroup, FormControl } from '@angular/forms';
import { OrderNoteFormComponent } from '../../../../shared/components';

@Component({
    selector: 'm-orders-notes',
    templateUrl: 'orders-notes.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersNotesPage implements OnInit, OnDestroy {

    private _obsers: any[] = [];

    private _readyConditions: Map<string, boolean> = new Map([
        ["Order", false]
    ]);

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(false),
        editMode: true
    }

    viewData: any = {
        order: new OrderModel(),
    }

    form: FormGroup;

    constructor(
        private _ordersDetailState: OrdersDetailState,
        private _menuService: MenuService,
        private _subheaderService: SubheaderService,
        private _orderService: OrderService,
        private _translate: TranslateService,
        private _dialog: MatDialog,
    ) {
        this.form = this.generateFormGroup();
    }

    ngOnInit(): void {
        this.bindSubscribe();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    async createNote() {
        const data: any = {
            Id: this.viewData.order.Id,
        }

        const dialogRef = this._dialog.open(OrderNoteFormComponent, { data: data, disableClose: true, panelClass: ['m-mat-dialog-container__wrapper', 'mat-dialog-container--confirmation'] });

        let sub = dialogRef.afterClosed().subscribe(res => {
            this.reload();
        });

        this._obsers.push(sub);
    }

    private reload() {
        Promise.all([
            this._orderService.getDetails(this.viewData.order.Id)
        ]).then(value => {
            let order = value[0];

            this.viewControl.ready = false;

            this._ordersDetailState.order$.next(order);
        }).catch(() => {
            this.viewControl.loading$.next(false);
        })
    }

    private init() {
        if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
            if (this.viewControl.ready)
                return;

            this.viewControl.ready = true;

            this._ordersDetailState.menu$.next(this._menuService.getOrdersDetailMenu(this.viewData.order.Id));

            this.bindBreadcrumbs();

            this.parseToFormGroup(this.viewData.order);

            this.viewControl.loading$.next(false);
        }
    }

    private parseToFormGroup(order: OrderModel) {
        this.form.get('OrderNotes').setValue(order.OrderNotes);
    }

    private bindSubscribe() {
        this._obsers.push(
            this._ordersDetailState.order$.subscribe(value => {
                if (value) {
                    this.viewData.order = value;

                    this._readyConditions.set("Order", true);

                    this.init();
                }
            })
        );

        this._obsers.push(
            this._translate.onLangChange.subscribe(() => {
                if (this._readyConditions.get("Order")) {
                    this.bindBreadcrumbs();
                }
            })
        );
    }

    private bindBreadcrumbs() {
        this._subheaderService.setBreadcrumbs([
            { title: "ORDERS.LIST", page: `/orders` },
            { title: `${this.viewData.order.Id}`, page: `/orders/${this.viewData.order.Id}` },
            { title: "ORDERS.NOTES", page: `/orders/${this.viewData.order.Id}/notes` }
        ])
    }

    private generateFormGroup(): FormGroup {
        return new FormGroup({
            OrderNotes: new FormControl([]),
        })
    }
}