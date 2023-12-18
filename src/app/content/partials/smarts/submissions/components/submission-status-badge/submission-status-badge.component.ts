import { Component, OnInit, ChangeDetectionStrategy, Input, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { SubmissionStatus } from '../../../../../../core/core.module';

@Component({
    selector: 'rbp-submission-status-badge',
    templateUrl: './submission-status-badge.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionStatusBadgeComponent implements OnInit {
    @Input()
    get status() {
        return this._status$.getValue();
    }
    set status(value) {
        this._status$.next(value);
    }

    private _obsers: any[] = [];
    private _status$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private _translate: TranslateService,
    ) { }

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
            this._status$.subscribe(value => {
                this.renderer.setProperty(this.el.nativeElement, 'innerHTML', `${this.generateHTML(value)}`);
            })
        );
    }

    private generateHTML(status: number | SubmissionStatus): string {
        let htmlString: string = "";

        switch (status) {
            case SubmissionStatus.New:
                htmlString = `<span class="m--font-boldest">${this._translate.instant("SUBMISSION.STATUSES.NEW")}</span>`;

                break;

            case SubmissionStatus.Accepted:
                htmlString = `<span class="m--font-boldest m--font-primary">${this._translate.instant("SUBMISSION.STATUSES.ACCEPTED")}</span>`;

                break;

            case SubmissionStatus.Rejected:
                htmlString = `<span class="m--font-boldest m--font-danger">${this._translate.instant("SUBMISSION.STATUSES.REJECTED")}</span>`;

                break;

            case SubmissionStatus.Interview:
                htmlString = `<span class="m--font-boldest m--font-warning">${this._translate.instant("SUBMISSION.STATUSES.INTERVIEW")}</span>`;

                break;

            case SubmissionStatus.Interview_Fail:
                htmlString = `<span class="m--font-boldest m--font-danger">${this._translate.instant("SUBMISSION.STATUSES.INTERVIEW_FAIL")}</span>`;

                break;

            case SubmissionStatus.Hired:
                htmlString = `<span class="m--font-boldest m--font-success">${this._translate.instant("SUBMISSION.STATUSES.HIRED")}</span>`;

                break;
        }

        return htmlString;
    }
}
