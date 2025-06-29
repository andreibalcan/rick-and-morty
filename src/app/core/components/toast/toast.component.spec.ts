import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../shared/services/toast.service';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let fixture: ComponentFixture<ToastComponent>;
    let toastService: ToastService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToastComponent, CommonModule],
            providers: [ToastService],
        }).compileComponents();

        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
        toastService = TestBed.inject(ToastService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Rendering', () => {
        it('should not render any toasts when service is empty', () => {
            toastService.toasts = [];
            fixture.detectChanges();

            const toastElements = fixture.nativeElement.querySelectorAll('.toast');
            expect(toastElements.length).toBe(0);
        });

        it('should render multiple toasts', () => {
            toastService.toasts = [
                { message: 'Test 1', duration: 3000, type: 'success' },
                { message: 'Test 2', duration: 3000, type: 'error' },
            ];
            fixture.detectChanges();

            const toastElements = fixture.nativeElement.querySelectorAll('.toast');
            expect(toastElements.length).toBe(2);
            expect(toastElements[0].textContent).toContain('Test 1');
            expect(toastElements[1].textContent).toContain('Test 2');
        });

        it('should apply correct CSS classes based on toast type', () => {
            toastService.toasts = [
                { message: 'Success', duration: 3000, type: 'success' },
                { message: 'Error', duration: 3000, type: 'error' },
            ];
            fixture.detectChanges();

            const toastElements = fixture.nativeElement.querySelectorAll('.toast');
            expect(toastElements[0].classList).toContain('success');
            expect(toastElements[1].classList).toContain('error');
        });
    });

    describe('removeToast', () => {
        it('should call remove on toast service with correct index', () => {
            toastService.toasts = [
                { message: 'Test 1', duration: 3000, type: 'success' },
                { message: 'Test 2', duration: 3000, type: 'error' },
            ];
            fixture.detectChanges();

            const removeSpy = jest.spyOn(toastService, 'remove');
            const closeButtons = fixture.nativeElement.querySelectorAll('.close-btn');

            closeButtons[1].click();
            expect(removeSpy).toHaveBeenCalledWith(1);
        });

        it('should not throw when removing non-existent index', () => {
            const removeSpy = jest.spyOn(toastService, 'remove');
            expect(() => component.removeToast(999)).not.toThrow();
            expect(removeSpy).toHaveBeenCalledWith(999);
        });
    });

    describe('Auto-removal', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should automatically remove toast after duration', () => {
            toastService.add('Test', 3000);
            expect(toastService.toasts.length).toBe(1);

            jest.advanceTimersByTime(3000);
            expect(toastService.toasts.length).toBe(0);
        });
    });
});
