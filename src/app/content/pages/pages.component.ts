import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import {
	Component,
	OnInit,
	HostBinding,
	Input,
	ViewChild,
	ElementRef,
	AfterViewInit,
	ChangeDetectionStrategy
} from '@angular/core';
import {
	AnimationBuilder,
	AnimationPlayer,
	style,
	animate
} from '@angular/animations';

import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as objectPath from 'object-path';

import {
	LayoutRefService,
	ClassInitService,
	LayoutConfigService,
	UserService,
	BrandService,
	SystemAlertService,
	OneSignalService,

	MenuItemModel,

	GlobalState,
	BrandModel,
	UserConfigModel,

	AppInsightsUtility,
} from '../../core/core.module';

import { environment as env } from "../../../environments/environment";

@Component({
	selector: 'm-pages',
	templateUrl: './pages.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagesComponent implements OnInit, AfterViewInit {
	@HostBinding('class') classes = 'm-grid m-grid--hor m-grid--root m-page';
	@Input() selfLayout: any = 'blank';
	@Input() asideLeftDisplay: any;
	@Input() asideRightDisplay: any;
	@Input() asideLeftCloseClass: any;

	public player: AnimationPlayer;

	// class for the header container
	pageBodyClass$: Subject<string> = new Subject();

	@ViewChild('mContentWrapper', { static: true }) contenWrapper: ElementRef;
	@ViewChild('mContent', { static: true }) mContent: ElementRef;

	private _obsers: any[] = [];

	private _readyConditions: Map<string, boolean> = new Map([
		["Authenticated", false],
		["User", false]
	]);

	private _ready: boolean = false;

	constructor(
		public classInitService: ClassInitService,
		private _router: Router,
		private _animationBuilder: AnimationBuilder,
		private _configService: LayoutConfigService,
		private _layoutRefService: LayoutRefService,
		private _userService: UserService,
		private _brandService: BrandService,
		private _translate: TranslateService,
		private _systemAlertService: SystemAlertService,
		private _oneSignalService: OneSignalService,
		private _globalState: GlobalState,
		private _appInsightUtil: AppInsightsUtility

	) {
		this._configService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			let pageBodyClass = '';
			this.selfLayout = objectPath.get(config, 'self.layout');
			if (this.selfLayout === 'boxed' || this.selfLayout === 'wide') {
				pageBodyClass += ' m-container m-container--responsive m-container--xxl m-page__container';
			}
			this.pageBodyClass$.next(pageBodyClass);

			this.asideLeftDisplay = objectPath.get(config, 'aside.left.display');

			this.asideRightDisplay = objectPath.get(config, 'aside.right.display');
		});

		this.classInitService.onClassesUpdated$.subscribe((classes) => {
			this.asideLeftCloseClass = objectPath.get(classes, 'aside_left_close');
		});

		// animate page load
		this._router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				if (this.contenWrapper) {
					// hide content
					this.contenWrapper.nativeElement.style.display = 'none';
				}
			}
			if (event instanceof NavigationEnd) {
				if (this.contenWrapper) {
					// show content back
					this.contenWrapper.nativeElement.style.display = '';
					// animate the content
					this.animate(this.contenWrapper.nativeElement);
				}
			}
		});
	}

	ngOnInit() {
		console.log("Page Init");

		if (this._globalState.authenticated$.getValue()) {
			this._readyConditions.set("Authenticated", true);

			this.init();
		}

		if (this._globalState.userInfoSub$.getValue()) {
			this._readyConditions.set("User", true);

			this.init();
		}

		this.bindSubscribes();
	}

	ngOnDestroy(): void {
		for (let obs of this._obsers) {
			obs.unsubscribe();
		}
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			if (this.mContent) {
				// keep content element in the service
				this._layoutRefService.addElement('content', this.mContent.nativeElement);
			}
		});
	}

	/**
	 * Animate page load
	 */
	animate(element) {
		this.player = this._animationBuilder
			.build([
				style({ opacity: 0, transform: 'translateY(15px)' }),
				animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
				style({ transform: 'none' }),
			])
			.create(element);
		this.player.play();
	}

	private init(): void {
		if (Array.from(this._readyConditions.values()).filter(x => x === false).length === 0) {
			if (this._ready) return;

			this._ready = true;

			this.sendSessionTracking();

			Promise.all([
				this._userService.getMenu(),
				this._brandService.getAllShort()
			]).then(value => {
				let config = value[0] as UserConfigModel;
				this._globalState.asideLeftSub$.next(this.convertMenuToMenuConfig(config.Menu));

				this._globalState.brands$.next(value[1]);

				if (config.BrandId.length > 0 && config.BrandId[0].length > 0) {
					this._globalState.syncBrand.next(config.BrandId[0]);
				} else {
					if (value[1].length === 0) {
						this._systemAlertService.error(this._translate.instant("COMMON.ERROR.NO_ASSIGNED_BRAND"));
					} else {
						this._globalState.syncBrand.next(value[1][0].Id);
					}
				}

				if (env.enableOneSignal) {
					this._oneSignalService.init();
				}
			});
		}
	}

	private sendSessionTracking() {
		let user = this._globalState.userInfoSub$.getValue();

		let sessions = {
			appVersion: env.version,
			owner: user.Email
		};

		this._appInsightUtil.trackEvent("SessionStarted", sessions);
	};

	private handleBrandNotFound() {
		this._systemAlertService.error(this._translate.instant("COMMON.ERROR.REQUEST_BRAND_NOT_FOUND"));

		setTimeout(() => {
			this._router.navigate(["dashboard"]);
		}, 3000);
	}

	private syncBrand(id: string): void {
		let brands = this._globalState.brands$.getValue() as BrandModel[];

		let brand = brands.find(x => x.Id === id);

		if (brand) {
			Promise.all([
				this._brandService.get(brand.Id),
				this._brandService.switchBrand(brand.Id)
			]).then(value => {
				if (value[0]) {
					this._globalState.brand$.next(value[0]);
				} else {
					this.handleBrandNotFound();
				}
			});
		} else {
			this.handleBrandNotFound();
		}
	}

	private bindSubscribes(): void {
		this._obsers.push(
			this._globalState.authenticated$.subscribe(value => {
				if (value) {
					this._readyConditions.set("Authenticated", true);

					this.init();
				}
			})
		);

		this._obsers.push(
			this._globalState.syncBrand.subscribe(value => {
				if (value) {
					this.syncBrand(value);
				}
			})
		);

		this._obsers.push(
			this._globalState.userInfoSub$.subscribe(value => {
				if (value) {
					this._readyConditions.set("User", true);

					this.init();
				}
			})
		);
	}

	private convertMenuToMenuConfig(menu: MenuItemModel[]): any[] {
		let items: any[] = [];

		menu.sort((menuItem1, menuItem2) => menuItem1.DisplayIndex - menuItem2.DisplayIndex)

		for (let content of menu) {
			let item: any = {};

			item.title = content.Name;
			item.icon = content.Icon;

			if (content.Childs && content.Childs.length > 0) {
				item.submenu = this.convertMenuToMenuConfig(content.Childs);
				item.root = true;
			}

			if (content.Href !== "#") {
				item.page = content.Href;
			}

			items.push(item);
		}

		return items;
	}
}
