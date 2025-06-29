import { Component, inject } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
})
export class ToastComponent {
    public readonly toastService = inject(ToastService);

    public removeToast(index: number) : void{
        this.toastService.remove(index);
    }
}
