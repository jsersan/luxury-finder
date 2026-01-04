import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}
  
  transform(key: string): string {
    return this.translationService.translate(key);
  }
}