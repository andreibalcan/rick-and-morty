import { Component, HostListener, Input, Type, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'app-modal',
    imports: [],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.scss',
})
export class ModalComponent {
    @Input() childComponent!: Type<any>;
    @Input() childData?: any;
    @Input() close!: () => void;
    @Input() borderColor?: string;

    @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainerRef!: ViewContainerRef;

    ngAfterViewInit(): void {
        const compRef = this.viewContainerRef.createComponent(this.childComponent);
        if (this.childData) {
            Object.assign(compRef.instance, this.childData);
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscape(event: KeyboardEvent): void {
        event.preventDefault();
        this.close();
    }
}
