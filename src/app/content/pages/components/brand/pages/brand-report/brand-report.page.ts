import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MenuItemModel } from '../../../../../../core/core.module';
import { MenuService } from '../../services';
import { BehaviorSubject } from 'rxjs';
import { BrandReportState } from '../../states';

@Component({
  selector: 'm-brand-report',
  templateUrl: './brand-report.page.html',
  styleUrls: ['./brand-report.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandReportPage implements OnInit {

  menu: MenuItemModel[] = [];

  viewControl: any = {
    ready: false,
    loading$: new BehaviorSubject<boolean>(false)
  }

  constructor(
    private _menuService: MenuService,
    private _brandReportState: BrandReportState
  ) { }

  ngOnInit() {
    this.menu = this._menuService.getBrandsReportMenu();
    this.viewControl.loading$ = this._brandReportState.loading$;
  }
}
