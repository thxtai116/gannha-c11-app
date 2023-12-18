import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CoreModule } from "../../../../core/core.module";
import { LayoutModule } from '../../../layout/layout.module';
import { PartialsModule } from '../../../partials/partials/partials.module';
import { SharedModule } from '../../shared/shared.module';

import { UsersPage } from '././users.page';
import { UsersListPage } from './pages/users-list/users-list.page';
import { UsersFormPage } from './pages/users-form/users-form.page';
import { UsersDetailPage } from './pages/users-detail/users-detail.page';

import { UsersBasicInfoPage } from './pages/users-basic-info/users-basic-info.page';
import { UsersAssignmentsPage } from './pages/users-assignments/users-assignments.page';

import {
	MatButtonModule,
	MatInputModule,
	MatSelectModule,
	MatPaginatorModule,
	MatTableModule,
	MatProgressSpinnerModule,
	MatSortModule,
	MatCheckboxModule,
	MatIconModule,
	MatMenuModule,
	MatTooltipModule,
	MatChipsModule,
	MatDialogModule,
} from "@angular/material";

import { UsersState, UsersDetailState } from './states';

import { MenuService } from './services';

import { UserRoleDialogComponent } from './dialogs/user-role/user-role-dialog.component';
import { UnitsAssignmentComponent } from './components/units-assignment/units-assignment.component';
import { BrandsAssignmentComponent } from './components/brands-assignment/brands-assignment.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		CoreModule,
		LayoutModule,
		PartialsModule,
		SharedModule,

		MatButtonModule,
		MatInputModule,
		MatSelectModule,
		MatPaginatorModule,
		MatTableModule,
		MatProgressSpinnerModule,
		MatSortModule,
		MatCheckboxModule,
		MatIconModule,
		MatMenuModule,
		MatTooltipModule,
		MatChipsModule,
		MatDialogModule,

		TranslateModule.forChild(),

		RouterModule.forChild([
			{
				path: '',
				component: UsersPage,
				children: [
					{
						path: '',
						component: UsersListPage
					},
					{
						path: 'create',
						component: UsersFormPage
					},
					{
						path: ':id',
						component: UsersDetailPage,
						children: [
							{
								path: "",
								redirectTo: "basic-info"
							},
							{
								path: 'basic-info',
								component: UsersBasicInfoPage,
							},
							{
								path: 'assignments',
								component: UsersAssignmentsPage,
							}
						]
					}
				]
			}
		])
	],
	providers: [
		UsersState,
		UsersDetailState,

		MenuService
	],
	declarations: [
		UsersPage,
		UsersListPage,
		UsersFormPage,
		UsersDetailPage,

		UsersBasicInfoPage,
		UsersAssignmentsPage,

		UserRoleDialogComponent,
		UnitsAssignmentComponent,
		BrandsAssignmentComponent,
	],
	entryComponents: [
		UserRoleDialogComponent,
		UnitsAssignmentComponent,
		BrandsAssignmentComponent,
	]
})
export class UsersModule { }
