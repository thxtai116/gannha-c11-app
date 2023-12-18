import { ValidatorFn, AbstractControl } from "@angular/forms";

export class MaxWords {
	static validate(number: number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } => {
			let value: string = control.value;
			if (value) {
				value = value.trim();
				return (value.split(" ").length > number) ? { "maxWords": true } : null;
			}
			return null;
		};
	}
}
