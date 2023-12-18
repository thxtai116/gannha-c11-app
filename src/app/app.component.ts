import {
	Component,
	HostBinding,
	Input,
	AfterViewInit,
	OnInit,
	ElementRef,
	ViewChild,
	ChangeDetectionStrategy,
} from '@angular/core';

import {
	Router,
	NavigationEnd
} from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import {
	AuthService,
	LayoutConfigService,
	ClassInitService,
	TranslationService,
	PageConfigService,
	SplashScreenService,

	StorageUtility,
	LocalStorageKey
} from "./core/core.module";

import { locale as enLang } from './config/i18n/en';
import { locale as vilang } from './config/i18n/vi';

import { filter } from 'rxjs/operators';

import * as objectPath from 'object-path';

@Component({
	selector: 'body[m-root]',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnInit {
	title = 'Metronic';

	@Input() attributes: any;

	@HostBinding('style') style: any;
	@HostBinding('class') classes: any = '';

	@ViewChild('splashScreen', { static: true })
	splashScreen: ElementRef;

	constructor(
		private _router: Router,
		private _sanitizer: DomSanitizer,
		private _layoutConfigService: LayoutConfigService,
		private _classInitService: ClassInitService,
		private _translationService: TranslationService,
		private _pageConfigService: PageConfigService,
		private _splashScreenService: SplashScreenService,
		private _authService: AuthService,
		private _storageUtil: StorageUtility
	) {
		console.log("App Loaded");

		this._classInitService.onClassesUpdated$.subscribe(classes => {
			setTimeout(() => this.classes = classes.body.join(' '));
		});

		this._classInitService.onAttributeUpdated$.subscribe(attributes => {
			this.attributes = attributes.body;
		});

		this._layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			this._classInitService.setConfig(model);

			this.style = '';
			if (objectPath.get(model.config, 'self.layout') === 'boxed') {
				const backgroundImage = objectPath.get(model.config, 'self.background');
				if (backgroundImage) {
					this.style = this._sanitizer.bypassSecurityTrustStyle('background-image: url(' + objectPath.get(model.config, 'self.background') + ')');
				}
			}
		});

		this._translationService.loadTranslations(enLang, vilang);

		this._router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this._layoutConfigService.setModel({ page: objectPath.get(this._pageConfigService.getCurrentPageConfig(), 'config') }, true);
			});
	}

	ngOnInit(): void {
		console.log("App Inited");

		this._authService.init();

		this._authService.tryLogin({
			disableOAuth2StateCheck: true,
			onTokenReceived: context => {
				console.log('onTokenReceived:', context);
			},
			onLoginError: (err) => {
				console.log('onLoginError:', err);
			}
		}).then(() => {
			if (!this._authService.hasValidAccessToken()) {
				console.log("Try Login Failed");

				this._storageUtil.set(LocalStorageKey.returnUrl, window.location.href.replace(window.location.origin, ""));

				this._authService.initImplicitFlow();
			} else {
				console.log("Try Login Successful");
			}
		});
	}

	ngAfterViewInit(): void {
		if (this.splashScreen) {
			this._splashScreenService.init(this.splashScreen.nativeElement);
		}
	}
}
