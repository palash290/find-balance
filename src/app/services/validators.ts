import { AbstractControl, ValidatorFn } from '@angular/forms';

export function numberRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      // If the value is not a valid decimal number, do not perform the range check
      return null;
    }
    const numberValue = parseFloat(value); // Convert the string to a number
    if (numberValue < min || numberValue > max) {
      return { 'numberRange': { value: control.value } };
    }
    return null;
  };
}


// utils.ts
export function stripHtmlTags(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText;
}
