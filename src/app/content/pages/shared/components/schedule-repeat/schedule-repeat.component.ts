import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ComponentRef, ViewChild, ViewContainerRef, OnInit, Component, ComponentFactoryResolver, forwardRef, Input } from '@angular/core';
import { ScheduleRepeatWeeklyComponent } from './components/schedule-repeat-weekly/schedule-repeat-weekly.component';

import { ScheduleRepeatEveryModel, ScheduleEveryType, ScheduleOnType } from '../../../../../core/core.module';

@Component({
    selector: 'm-schedule-repeat',
    templateUrl: './schedule-repeat.component.html',
    styleUrls: ['schedule-repeat.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ScheduleRepeatComponent),
            multi: true,
        }
    ],
    //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleRepeatComponent implements OnInit, ControlValueAccessor {
    @Input() prototypeMode: boolean = false;
    @ViewChild('scheduleRepeat', { read: ViewContainerRef, static: true }) entry: ViewContainerRef;
    @ViewChild('scheduleRepeatDaily', { read: ViewContainerRef, static: true }) entryDaily: ViewContainerRef;
    @ViewChild('scheduleRepeatWeekly', { read: ViewContainerRef, static: true }) entryWeekly: ViewContainerRef;

    private _obsers: any[] = [];

    private _onChangeCallback = (value: any) => { };

    viewData: any = {
        repeat$: new BehaviorSubject<ScheduleRepeatEveryModel>(new ScheduleRepeatEveryModel()),
        selectedIndex: 0,
    }

    componentRef: ComponentRef<any>;

    repeatEveryType: string[] = [
        ScheduleEveryType.Daily,
        ScheduleEveryType.Weekly
    ];

    repeatOnType: string[] = [
        ScheduleOnType.Day,
        ScheduleOnType.First,
        ScheduleOnType.Second,
        ScheduleOnType.Third,
        ScheduleOnType.Fourth,
        ScheduleOnType.Last
    ];

    constructor(
        private _resolver: ComponentFactoryResolver,
    ) { }

    ngOnInit() {
        this.renderRepeatComponent();
    }


    onRepeatEveryTypeChange() {
        this.renderRepeatComponent();
        this.emit();
    }

    ngOnDestroy(): void {
        for (let obs of this._obsers) {
            obs.unsubscribe();
        }
    }

    writeValue(obj: any): void {
        if (obj) {
            this.viewData.selectedIndex = obj.EveryType == "Daily" ? 0 : (obj.EveryType == "Weekly" ? 1 : undefined);
            this.viewData.repeat$.next(obj);
            this.renderRepeatComponent();
        }
    }

    registerOnChange(fn: any): void {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState?(isDisabled: boolean): void { }

    onTabSelected(event: any) {
        switch (event.index) {
            case 0: {
                this.viewData.repeat$.getValue().EveryType = ScheduleEveryType.Daily; break;
            }
            case 1: {
                this.viewData.repeat$.getValue().EveryType = ScheduleEveryType.Weekly; break;
            }
        }

        this.emit();
    }

    private renderRepeatComponent(): void {
        if (this.prototypeMode) {
            this.entryDaily.clear();
            this.entryWeekly.clear();

            const factoryDaily = this.getRepeatComponentFactory("Daily");
            const factoryWeekly = this.getRepeatComponentFactory("Weekly");

            if (factoryDaily) {
                this.componentRef = this.entryDaily.createComponent(factoryDaily);
            }

            if (factoryWeekly) {
                this.componentRef = this.entryWeekly.createComponent(factoryWeekly);

                this.componentRef.instance.repeatEvery = this.viewData.repeat$.getValue().Every;
                this.componentRef.instance.On = this.viewData.repeat$.getValue().On || [];
                this._obsers.push(this.componentRef.instance.onRepeatEveryChange.subscribe(x => {
                    this.viewData.repeat$.getValue().Every = x;
                    this.emit();
                }));
                this._obsers.push(this.componentRef.instance.onRepeatOnChange.subscribe(x => {
                    this.viewData.repeat$.getValue().On = x;
                    this.emit();
                }));
            }
        } else {
            this.entry.clear();

            const factory = this.getRepeatComponentFactory(this.viewData.repeat$.getValue().EveryType);

            if (factory) {
                this.componentRef = this.entry.createComponent(factory);

                if (this.viewData.repeat$.getValue().EveryType == ScheduleEveryType.Weekly) {
                    this.componentRef.instance.repeatEvery = this.viewData.repeat$.getValue().Every;
                    this.componentRef.instance.On = this.viewData.repeat$.getValue().On || [];
                    this._obsers.push(this.componentRef.instance.onRepeatEveryChange.subscribe(x => {
                        this.viewData.repeat$.getValue().Every = x;
                        this.emit();
                    }));
                    this._obsers.push(this.componentRef.instance.onRepeatOnChange.subscribe(x => {
                        this.viewData.repeat$.getValue().On = x;
                        this.emit();
                    }));
                }
            }
        }
    }

    private getRepeatComponentFactory(type: string): any {
        let factory: any = null;

        switch (type) {
            case ScheduleEveryType.Weekly:
                factory = this._resolver.resolveComponentFactory(ScheduleRepeatWeeklyComponent);

                break;
        }

        return factory;
    }

    private emit() {
        if (this.viewData.repeat$.getValue().EveryType === ScheduleEveryType.Weekly) {
            this.viewData.repeat$.getValue().OnType = ScheduleOnType.DayOfWeek;
        } else if (this.viewData.repeat$.getValue().EveryType === ScheduleEveryType.Daily) {
            this.viewData.repeat$.getValue().OnType = ScheduleOnType.Day;
        }

        this._onChangeCallback(this.viewData.repeat$.getValue());
    }
}
