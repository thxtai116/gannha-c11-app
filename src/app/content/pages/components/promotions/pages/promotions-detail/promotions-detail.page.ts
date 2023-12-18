import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  MenuItemModel, PromotionCodeCampaignService, PromotionCodeCampaignModel
} from "../../../../../../core/core.module";
import { ActivatedRoute } from '@angular/router';
import { PromotionsDetailState } from '../../states';

@Component({
  selector: 'm-promotions-detail',
  templateUrl: './promotions-detail.page.html',
  styleUrls: ['./promotions-detail.page.scss']
})
export class PromotionsDetailPage implements OnInit {
  private _obsers: any[] = [];
  private _id: number = 0;

  menu: MenuItemModel[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _promotionsDetailState: PromotionsDetailState,
    private _changeRef: ChangeDetectorRef,
    private _promotionCodeCampaignService: PromotionCodeCampaignService,
  ) { }

  ngOnInit() {
    this.menu = this._promotionsDetailState.menu$.getValue();

    this._id = this._route.snapshot.params["id"];

    if (this._id) {
      Promise.all([
        this._promotionCodeCampaignService.get(this._id),
      ]).then(value => {
        this._promotionsDetailState.promotion$.next(value[0]);
      });
    }

    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._promotionsDetailState.menu$.subscribe(value => {
        this.menu = value;
        this._changeRef.detectChanges();
      })
    );
  }

}
