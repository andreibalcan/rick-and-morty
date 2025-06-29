import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToastService);
        jest.useFakeTimers(); 
    });

    afterEach(() => {
        jest.clearAllTimers();
        service['toasts'] = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('.add', () => {
        it('should add a toast to the array', () => {
            service.add('Test message');
            expect(service.toasts.length).toBe(1);
            expect(service.toasts[0]).toEqual({
                message: 'Test message',
                duration: 3000,
                type: 'success',
            });
        });

        it('should use custom duration and type when provided', () => {
            service.add('Error message', 5000, 'error');
            expect(service.toasts[0]).toEqual({
                message: 'Error message',
                duration: 5000,
                type: 'error',
            });
        });

        it('should automatically remove toast after duration', () => {
            service.add('Test message', 3000);
            expect(service.toasts.length).toBe(1);

            jest.advanceTimersByTime(3000);
            expect(service.toasts.length).toBe(0);
        });

        it('should handle multiple toasts correctly', () => {
            service.add('First message', 2000);
            service.add('Second message', 3000);

            expect(service.toasts.length).toBe(2);

            jest.advanceTimersByTime(2000);
            expect(service.toasts.length).toBe(1);

            jest.advanceTimersByTime(1000);
            expect(service.toasts.length).toBe(0);
        });
    });

    describe('.remove', () => {
        it('should remove toast at specified index', () => {
            service.add('First message');
            service.add('Second message');

            service.remove(0);
            expect(service.toasts.length).toBe(1);
            expect(service.toasts[0].message).toBe('Second message');
        });

        it('should not throw when removing from empty array', () => {
            expect(() => service.remove(0)).not.toThrow();
        });

        it('should not throw when index is out of bounds', () => {
            service.add('Test message');
            expect(() => service.remove(5)).not.toThrow();
        });
    });
});
