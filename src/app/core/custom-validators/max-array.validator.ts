import { ValidatorFn, AbstractControl } from "@angular/forms";

export class MaxArray {
	static validate(number: number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } => {
			let value: any[] = control.value;
			if (value) {
				if (value.length > number)
					return { "maxArray": true }
			}
			return null;
		};
	}
}