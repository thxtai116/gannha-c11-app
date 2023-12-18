import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { InterviewsState } from '../../states';
import { tap } from 'rxjs/operators';
import { BrandService, SubheaderService, SystemAlertService, QueryParamsModel, RecruitmentInterviewsDataSource, Interview } from '../../../../../../core/core.module';
import { TranslateService } from '@ngx-translate/core';
import { InterviewLocationComponent } from '../../components/interview-location/interview-location.component';

@Component({
  selector: 'm-interviews-list',
  templateUrl: './interviews-list.page.html',
  styleUrls: ['./interviews-list.page.scss']
})
export class InterviewsListPage implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  private _obsers: any[] = [];

  viewControl: any = {
    loading$: new BehaviorSubject<boolean>(false),
    ready: false,
    readyConditions: new Map([
      ["Brand", false]
    ])
  };

  viewFilter: any = {
    filterUnit: "",
    filterStatus: "true",
  };

  viewData: any = {
    displayedColumns: ["Index", "FullName", "Phone", "Time", "Type", "Job", "Location"],
    brand$: new BehaviorSubject<any>({}),
    units$: new BehaviorSubject<any[]>([]),
  }

  constructor(
    private _interviewsState: InterviewsState,
    private _brandService: BrandService,
    private _subheaderService: SubheaderService,
    private _systemAlert: SystemAlertService,
    private _matDialog: MatDialog,
    private _translate: TranslateService,
    public dataSource: RecruitmentInterviewsDataSource,
  ) { }

  ngOnInit() {
    this.viewControl.loading$ = this.dataSource.loadingSubject;
    this.viewControl.loading$.next(true);

    this.restoreQueryParams();
    this.bindBreadcrumbs();
    this.bindEvents();
    this.bindSubscribes();
  }

  ngOnDestroy(): void {
    for (let obs of this._obsers) {
      obs.unsubscribe();
    }
  }

  refresh() {
    if (this.viewFilter.filterUnit.length > 0) {
      this.loadInterviews();
    } else {
      this._systemAlert.error(this._translate.instant("COMMON.ERROR.SELECT_UNIT"));
    }
  }

  loadInterviews(): void {
    const queryParams = new QueryParamsModel(
      {
        unitId: this.viewFilter.filterUnit,
        isActive: this.viewFilter.filterStatus
      },
      'asc',
      '',
      this.paginator.pageIndex,
      this.paginator.pageSize
    );

    this.dataSource.load(queryParams);
  }

  openMap(interview: Interview) {
    const dialog = this._matDialog.open(InterviewLocationComponent, {
      data: {
        address: interview.Location,
        lat: interview.Latitude,
        lng: interview.Longitude,
      },
      disableClose: false,
      width: "40%"
    });

    dialog.afterClosed().subscribe(async res => {
      if (res) {
        await this.refresh();
      }
    });
  }

  private init() {
    if (Array.from(this.viewControl.readyConditions.values()).filter(x => x === false).length === 0) {
      if (this.viewControl.ready) return;

      this.viewControl.ready = true;

      this._brandService.getUnits(this.viewData.brand$.value.Id).then(res => {
        this.viewData.units$.next(res.map(x => {
          return { id: x.Id, text: x.Name["vi"] };
        }));

        this.viewFilter.filterUnit = "";
        this.viewFilter.filterStatus = "true";
        this.dataSource.entitySubject.next([]);

        this.viewControl.loading$.next(false);

      });
    }
  }

  private bindSubscribes(): void {
    this._obsers.push(
      this._interviewsState.brand$.subscribe(value => {
        if (value) {
          this.viewControl.readyConditions.set("Brand", true);
          this.viewData.brand$.next(value);
          this.viewControl.ready = false;
          this.init();
        }
      })
    )
  }

  private restoreQueryParams(): void {
    if (this.dataSource.queryParams) {
      this.paginator.pageIndex = this.dataSource.queryParams.pageNumber;
      this.paginator.pageSize = this.dataSource.queryParams.pageSize;
      this.viewFilter.filterUnit = this.dataSource.queryParams.filter['unitId'];
      this.viewFilter.filterStatus = this.dataSource.queryParams.filter['isActive'];
    }
  }

  private bindBreadcrumbs(): void {
    this._subheaderService.setBreadcrumbs([
      { title: "INTERVIEWS.LIST", page: '/interviews' }
    ]);
  }

  private bindEvents(): void {
    merge(this.paginator.page)
      .pipe(
        tap(() => {
          this.loadInterviews();
        })
      )
      .subscribe();
  }
}
