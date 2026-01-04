import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 't',
  standalone: true  // ← IMPORTANTE
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);
  transform(key: string): string {
    return this.translationService.translate(key);
  }
}
