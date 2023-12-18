import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'm-list-timeline',
	templateUrl: './list-timeline.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTimelineComponent implements OnInit {
	@Input() type: any;
	@Input() heading: any;

	@Input() logList: Observable<any[]>;

	constructor() { }

	ngOnInit() {
	}
}
