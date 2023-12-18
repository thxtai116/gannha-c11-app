import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { ErrorPageComponent } from './snippets/error-page/error-page.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: '',
				redirectTo: 'dashboard'
			},
			{
				path: 'dashboard',
				loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			{
				path: 'sign-in',
				loadChildren: () => import('./components/sign-in/sign-in.module').then(m => m.SignInModule)
			},
			{
				path: 'brands',
				loadChildren: () => import('./components/brands/brands.module').then(m => m.BrandsModule)
			},
			{
				path: "brand-categories",
				loadChildren: () => import('./components/categories/categories.module').then(m => m.CategoriesModule)
			},
			{
				path: "units",
				loadChildren: () => import('./components/units/units.module').then(m => m.UnitsModule)
			},
			{
				path: "brand-selling-points",
				loadChildren: () => import('./components/selling-points/selling-points.module').then(m => m.SellingPointsModule)
			},
			{
				path: "recommendation-embryos",
				loadChildren: () => import('./components/collections/collections.module').then(m => m.CollectionsModule)
			},
			{
				path: "recommendation-configs",
				loadChildren: () => import('./components/recommendations/recommendations.module').then(m => m.RecommendationsModule)
			},
			{
				path: "trend-categories",
				loadChildren: () => import('./components/trends/trends.module').then(m => m.TrendsModule)
			},
			{
				path: "utilities",
				loadChildren: () => import('./components/utilities/utilities.module').then(m => m.UtilitiesModule)
			},
			{
				path: "tenants",
				loadChildren: () => import('./components/tenants/tenants.module').then(m => m.TenantsModule)
			},
			{
				path: "users",
				loadChildren: () => import('./components/users/users.module').then(m => m.UsersModule)
			},
			{
				path: "icons",
				loadChildren: () => import('./components/icons/icons.module').then(m => m.IconsModule)
			},
			{
				path: "selling-point-types",
				loadChildren: () => import('./components/selling-point-types/selling-point-types.module').then(m => m.SellingPointTypesModule)
			},
			{
				path: "jobs",
				loadChildren: () => import('./components/jobs/jobs.module').then(m => m.JobsModule)
			},
			{
				path: "interviews",
				loadChildren: () => import('./components/interviews/interviews.module').then(m => m.InterviewsModule)
			},
			{
				path: "recruitments",
				loadChildren: () => import('./components/recruitments/recruitments.module').then(m => m.RecruitmentsModule)
			},
			{
				path: "notification",
				loadChildren: () => import("./components/notifications/notifications.module").then(m => m.NotificationsModule)
			},
			{
				path: "merchant-unit",
				loadChildren: () => import('./components/raw-units/raw-units.module').then(m => m.RawUnitsModule)
			},
			{
				path: "posts",
				loadChildren: () => import('./components/raw-selling-points/raw-selling-points.module').then(m => m.RawSellingPointsModule)
			},
			{
				path: "account",
				loadChildren: () => import('./components/account/account.module').then(m => m.AccountModule)
			},
			{
				path: "places",
				loadChildren: () => import('./components/places/places.module').then(m => m.PlacesModule)
			},
			{
				path: "units",
				loadChildren: () => import('./components/units/units.module').then(m => m.UnitsModule)
			},
			{
				path: "selling-points",
				loadChildren: () => import('./components/selling-points/selling-points.module').then(m => m.SellingPointsModule)
			},
			{
				path: "brand",
				loadChildren: () => import('./components/brand/brand.module').then(m => m.BrandModule)
			},
			{
				path: "orders",
				loadChildren: () => import('./components/orders/orders.module').then(m => m.OrdersModule)
			},
			{
				path: "discounts",
				loadChildren: () => import('./components/discounts/discounts.module').then(m => m.DiscountsModule)
			},
			{
				path: "commerce-categories",
				loadChildren: () => import('./components/commerce-categories/commerce-categories.module').then(m => m.CommerceCategoriesModule)
			},
			{
				path: "products",
				loadChildren: () => import('./components/products/products.module').then(m => m.ProductsModule)
			},
			{
				path: "resumes",
				loadChildren: () => import('./components/resumes/resumes.module').then(m => m.ResumesModule)
			},
			{
				path: "recruiters",
				loadChildren: () => import('./components/recruiters/recruiters.module').then(m => m.RecruitersModule)
			},
			{
				path: "promotions",
				loadChildren: () => import('./components/promotions/promotions.module').then(m => m.PromotionsModule)
			},
			{
				path: "folders",
				loadChildren: () => import("./components/folders/folders.module").then(m => m.FoldersModule)
			}
		]
	},
	{
		path: '404',
		component: ErrorPageComponent
	},
];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [
		RouterModule
	]
})
export class PagesRoutingModule { }
