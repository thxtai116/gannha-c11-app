import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject, merge } from 'rxjs';
import { UsersDataSource } from '../../../../../../core/datasources';
import { BrandModel, UserInfoModel, QueryParamsModel } from '../../../../../../core/models';
import { UserInfoOverviewViewModel } from '../../../../../../core/view-models';
import { BrandService, UserTransformer, AssignService, ConfirmService, SystemAlertService, RoleType } from '../../../../../../core/core.module';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SupervisorAssignmentComponent } from '../supervisor-assignment/supervisor-assignment.component';

@Component({
	selector: 'm-brand-managers',
	templateUrl: './brand-managers.component.html',
	styleUrls: ['./brand-managers.component.scss']
})
export class BrandManagersComponent implements OnInit {
	private _obsers: any[] = [];

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	viewControl: any = {
		loading$: new BehaviorSubject<boolean>(false),
	}

	viewData: any = {
		displayedColumns: ["Index", "Name", "Email", "Role", "Status", "Actions"],
		dataSource: new UsersDataSource(),
		brand: new BrandModel(),
		changeDetect: false,
		users: new Array<UserInfoModel>(),
		users$: new BehaviorSubject<UserInfoOverviewViewModel[]>([]),
		usersStored: new Array<UserInfoOverviewViewModel>()
	}

	constructor(
		public dialogRef: MatDialogRef<BrandManagersComponent>,
		private _brandService: BrandService,
		private _userTransformer: UserTransformer,
		private _translate: TranslateService,
		private _systemAlertService: SystemAlertService,
		private _confirmService: ConfirmService,
		private _assignService: AssignService,
		public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
		this.viewControl.loading$.next(true);
		this.init();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	onCancelClick(): void {
		this.dialogRef.close({ data: this.viewData.changeDetect });
	}

	init(): void {

		this.bindDataSource();
		this.bindEvents();
		this.bindSubscribes();

		Promise.all([
			this._brandService.getSupervisors(this.data)
		]).then(value => {
			this.viewData.users = value[0];
			this.viewData.users$.next(value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x)));
		}).finally(() => {
			this.viewControl.loading$.next(false);
		});
	}

	private bindEvents(): void {
		this._obsers.push(
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadUsers();
					})
				)
				.subscribe()
		);
	}

	loadUsers(): void {
		const queryParams = new QueryParamsModel(
			{},
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.viewData.dataSource.load(this.viewData.usersStored, queryParams);
	}

	assign(): void {
		const dialogRef = this.dialog.open(SupervisorAssignmentComponent, {
			width: '800px', height: 'auto', disableClose: true
		});

		let sub = dialogRef.afterClosed().subscribe(res => {
			if (!res || !res.data) {
				return;
			}

			this.viewControl.loading$.next(true);

			Promise.all([
				this._assignService.assignUserToBrand(res.data, RoleType.Supervisor, [this.data])
			]).then(value => {
				if (value[0]) {
					this._systemAlertService.success(this._translate.instant('USERS.ASSIGN_SUCCESS'));
					this.refresh();
				}
			}).finally(() => {
				this.viewData.changeDetect = true;
				this.viewControl.loading$.next(false);

				sub.unsubscribe();
			});
		});
	}

	unassign(id: string): void {
		let user = this.viewData.users.find(x => x.Id === id) as UserInfoModel;

		if (user) {
			const dialogRef = this._confirmService.show(this._translate.instant('COMMON.CONFIRMATION'), this._translate.instant('USERS.UNASSIGN'));

			let sub = dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}

				this.viewControl.loading$.next(true);

				Promise.all([
					this._assignService.unassignUserFromBrand(user.Id, RoleType.Supervisor, [this.data])
				]).then(value => {
					if (value[0]) {
						this._systemAlertService.success(this._translate.instant('USERS.UNASSIGN_SUCCESS'));

						this.refresh();
					}
				}).finally(() => {
					this.viewData.changeDetect = true;
					this.viewControl.loading$.next(false);

					sub.unsubscribe();
				});
			});
		}
	}

	refresh(): void {
		this.viewControl.loading$.next(true);

		Promise.all([
			this._brandService.getSupervisors(this.data)
		]).then(value => {
			this.viewData.users = value[0];
			this.viewData.users$.next(value[0].map(x => this._userTransformer.toUserInfoOverviewViewModel(x)));
		}).finally(() => {
			this.viewData.changeDetect = true;
			this.viewControl.loading$.next(false);
		});
	}

	private bindDataSource(): void {
		const queryParams = new QueryParamsModel({});

		this.viewData.dataSource.init(this.viewData.users$, queryParams);
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
		);

		this._obsers.push(
			this.viewData.users$.subscribe(res => {
				this.viewData.usersStored = res;
			})
		);
	}
}
