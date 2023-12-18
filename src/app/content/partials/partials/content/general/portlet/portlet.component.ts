import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'm-portlet',
	templateUrl: './portlet.component.html',
	styleUrls: ['./portlet.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortletComponent implements OnInit, AfterViewInit {
	@Input() loading$: Observable<boolean>;
	@Input() options: any;

	@ViewChild('mPortlet', { static: true }) elPortlet: ElementRef;
	@ViewChild('mPortletHead', { static: true }) elHead: ElementRef;
	@ViewChild('mPortletBody', { static: true }) elBody: ElementRef;
	@ViewChild('mPortletFooter', { static: true }) elFooter: ElementRef;
	@ViewChild('mPortletHeadTools', { static: true }) elHeadTools: ElementRef;

	constructor() {
	}

	ngAfterViewInit(): void {
		// hide portlet footer if no content
		if (this.elFooter && this.elFooter.nativeElement.children.length == 0) {
			this.elFooter.nativeElement.style.display = 'none';
			this.elPortlet.nativeElement.classList.add('m-portlet--full-height');
		}

		// hide portlet header tools if no content
		if (this.elHeadTools && this.elHeadTools.nativeElement.children.length == 0) {
			this.elHeadTools.nativeElement.style.display = 'none';
		}
	}

	ngOnInit() {
	}
}
