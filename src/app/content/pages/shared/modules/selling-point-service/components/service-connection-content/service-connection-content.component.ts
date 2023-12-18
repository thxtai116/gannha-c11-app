import { ChangeDetectionStrategy, Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewContainerRef, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GnServiceConnectionModel } from '../../../../../../../core/models';

import { ActionApiServiceType } from '../../consts';

import { CallToActionContentComponent } from '../call-to-action-content/call-to-action-content.component';
import { CallServiceContentComponent } from '../call-service-content/call-service-content.component';
import { OrderServiceContentComponent } from '../order-service-content/order-service-content.component';
import { PromotionCodeContentComponent } from '../promotion-code-content/promotion-code-content.component';
import { MembershipContentComponent } from '../membership-content/membership-content.component';

@Component({
    selector: 'm-service-connection-content',
    templateUrl: './service-connection-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceConnectionContentComponent implements OnInit {

    @ViewChild('content', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;

    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(new GnServiceConnectionModel());

    componentRef: ComponentRef<any>;

    private _obsers: any[] = [];

    constructor(
        private _resolver: ComponentFactoryResolver,
        private _changeRef: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }

        if (this.componentRef)
            this.componentRef.destroy();
    }

    private renderComponent(service: GnServiceConnectionModel): void {
        this.entry.clear();

        if (this.componentRef)
            this.componentRef.destroy();

        const factory = this.getComponentContent(service.Type);

        if (factory) {
            this.componentRef = this.entry.createComponent(factory);

            this.componentRef.instance.service$.next(service);

            this._changeRef.detectChanges();
        }
    }

    private bindSubscribes(): void {
        if (this.service$) {
            this._obsers.push(
                this.service$.subscribe(value => {
                    if (value) {
                        this.renderComponent(value);
                    }
                })
            );
        }
    }

    private getComponentContent(type: string): any {
        let factory: any = null;

        switch (type) {
            case ActionApiServiceType.CALL_TO_ACTION:
                factory = this._resolver.resolveComponentFactory(CallToActionContentComponent);

                break;

            case ActionApiServiceType.CALL_SERVICE:
                factory = this._resolver.resolveComponentFactory(CallServiceContentComponent);

                break;

            case ActionApiServiceType.GN_COMMERCE:
                factory = this._resolver.resolveComponentFactory(OrderServiceContentComponent);

                break;

            case ActionApiServiceType.PROMOTION_CODE:
                factory = this._resolver.resolveComponentFactory(PromotionCodeContentComponent);

                break;

            case ActionApiServiceType.MEMBERSHIP:
                factory = this._resolver.resolveComponentFactory(MembershipContentComponent);

                break;
        }

        return factory;
    }
}
