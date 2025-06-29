import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    public toasts: { message: string; duration: number; type: 'success' | 'error' }[] = [];

    public add(message: string, duration: number = 3000, type: 'success' | 'error' = 'success'): void {
        this.toasts.push({ message, duration, type });
        setTimeout(() => this.remove(0), duration);
    }

    public remove(index: number): void {
        this.toasts.splice(index, 1);
    }
}
