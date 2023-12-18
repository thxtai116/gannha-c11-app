import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy
} from '@angular/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'm-messenger',
	templateUrl: './messenger.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessengerComponent implements OnInit {
	@Input() messages: Observable<any>;

	constructor() { }

	ngOnInit(): void {
	}
}
