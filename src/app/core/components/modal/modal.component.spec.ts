import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { Component, ViewContainerRef } from '@angular/core';
import { By } from '@angular/platform-browser';

// Test component to be rendered inside modal
@Component({ template: '<div class="test-content">Test</div>' })
class TestComponent {}

describe('ModalComponent', () => {
    let component: ModalComponent;
    let fixture: ComponentFixture<ModalComponent>;
    let mockCloseFn: jest.Mock;

    beforeEach(async () => {
        mockCloseFn = jest.fn();

        await TestBed.configureTestingModule({
            imports: [ModalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalComponent);
        component = fixture.componentInstance;

        component.childComponent = TestComponent;
        component.close = mockCloseFn;
        component.borderColor = '#ffffff';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Rendering', () => {
        it('should render modal structure', () => {
            expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.modal')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.modal__close')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.modal__content')).toBeTruthy();
        });

        it('should render close button with "x"', () => {
            const closeBtn = fixture.nativeElement.querySelector('.modal__close');
            expect(closeBtn.textContent.trim()).toBe('x');
        });
    });

    describe('Input Bindings', () => {
        it('should apply border color', () => {
            component.borderColor = '#ff0000';
            fixture.detectChanges();
            const modal = fixture.nativeElement.querySelector('.modal');
            expect(modal.style.border).toContain('#ff0000');
        });

        it('should render child component', () => {
            fixture.detectChanges(); // Trigger ngAfterViewInit
            expect(fixture.nativeElement.querySelector('.test-content')).toBeTruthy();
        });
    });

    describe('Close Functionality', () => {
        it('should call close on backdrop click', () => {
            const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
            backdrop.click();
            expect(mockCloseFn).toHaveBeenCalled();
        });

        it('should call close on button click', () => {
            const closeBtn = fixture.nativeElement.querySelector('.modal__close');
            closeBtn.click();
            expect(mockCloseFn).toHaveBeenCalled();
        });

        it('should call close on Escape key', () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(event);
            expect(mockCloseFn).toHaveBeenCalled();
        });
    });

    describe('ViewContainerRef', () => {
        it('should be defined after view init', () => {
            expect(component.viewContainerRef).toBeDefined();
        });

        it('should create component in ngAfterViewInit', () => {
            const createSpy = jest.spyOn(component.viewContainerRef, 'createComponent');
            component.ngAfterViewInit();
            expect(createSpy).toHaveBeenCalledWith(TestComponent);
        });
    });
});
