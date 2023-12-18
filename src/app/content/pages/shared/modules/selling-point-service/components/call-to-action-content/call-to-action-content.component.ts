import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GnServiceConnectionModel, LanguagePipe } from '../../../../../../../core/core.module';

@Component({
    selector: 'm-call-to-action-content',
    templateUrl: './call-to-action-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallToActionContentComponent implements OnInit {

    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(null);

    private _obsers: any[] = [];

    lang: string = "vi";

    viewModel: any = {
        Title: "",
        Url: ""
    }

    constructor(
    ) {
    }

    ngOnInit(): void {
        this.bindSubscribes();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    private bindSubscribes(): void {
        this._obsers.push(
            this.service$.subscribe(value => {
                if (value) {
                    this.parseModel(value);
                }
            })
        );
    }

    private parseModel(service: GnServiceConnectionModel): void {
        this.viewModel.Title = new LanguagePipe().transform(service.Parameters.Title);
        this.viewModel.Url = new LanguagePipe().transform(service.Parameters.Url);
    }
}
