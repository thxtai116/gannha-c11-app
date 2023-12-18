import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GnServiceConnectionModel, LanguagePipe } from '../../../../../../../core/core.module';


@Component({
    selector: 'm-membership-content',
    templateUrl: './membership-content.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipContentComponent implements OnInit {
    @Input() service$: BehaviorSubject<GnServiceConnectionModel> = new BehaviorSubject<GnServiceConnectionModel>(null);

    private _obsers: any[] = [];

    lang: string = "vi";

    viewModel: any = {
        Title: "",
        Query: new Array<string>()
    }

    constructor() { }

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

        for (let item of service.Parameters.Query.split("&")) {
            let query = item.split("=")[1];

            this.viewModel.Query.push(query);
        }
    }
}
