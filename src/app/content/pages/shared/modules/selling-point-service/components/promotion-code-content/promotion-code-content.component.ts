import { Component, OnInit, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
    GnServiceConnectionModel,
    PromotionCodeCampaignModel,
    PromotionCodeCampaignService,
} from '../../../../../../../core/core.module';

import { PromotionCodeModel } from '../../models';

@Component({
    selector: 'm-promotion-code-content',
    templateUrl: './promotion-code-content.component.html'
})
export class PromotionCodeContentComponent implements OnInit {
    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(null);

    private _obsers: any[] = [];

    lang: string = "vi";

    viewControl: any = {
        loading$: new BehaviorSubject<boolean>(true),
        ready: false
    }

    viewData: any = {
        model: new PromotionCodeModel(),
        campaign: new Array<PromotionCodeCampaignModel[]>()
    }

    constructor(
        private _promotionCodeCampaignService: PromotionCodeCampaignService
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.service$.subscribe(value => {
                if (value) {
                    this.viewData.model = this.parseModel(value);

                    this.init(this.viewData.model);
                }
            })
        );
    }

    private init(model: PromotionCodeModel) {
        this.viewControl.loading$.next(true);

        Promise.all([
            this._promotionCodeCampaignService.get(model.CampaignId)
        ]).then(value => {
            this.viewData.campaign = value[0];

            this.viewControl.ready = true;
        }).finally(() => {
            this.viewControl.loading$.next(false);
        });
    }

    private parseModel(entity: GnServiceConnectionModel): PromotionCodeModel {
        let model = new PromotionCodeModel();

        model.Title = entity.Parameters.Title;
        model.CampaignId = entity.Parameters.CampaignId;

        return model;
    }
}
