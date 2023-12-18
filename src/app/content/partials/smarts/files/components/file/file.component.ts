import { Component, OnInit, Input, HostBinding, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ResourceModel } from '../../../../../../core/core.module';

@Component({
    selector: 'rbp-file',
    templateUrl: './file.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent implements OnInit {

    @HostBinding('class') innerClasses = 'image-container';
    @Input() classes: string;
    @Input()
    set model(value) {
        if (value)
            this._model$.next(value);
        if (this.model) {
            this.innerClasses += ' image-container--contained';
        } else {
            this.innerClasses.replace('image-container--contained', '');
        }
    }

    get model() {
        return this._model$.getValue();
    }

    private _model$: BehaviorSubject<ResourceModel> = new BehaviorSubject<ResourceModel>(null);

    constructor() { }

    updateUrl(event: any, item: ResourceModel): void {
        event.srcElement.src = item.Url;
    }

    ngOnInit(): void {

        if (this.classes) {
            this.innerClasses += this.innerClasses ? ' ' + this.classes : '';
        }
    }
}
