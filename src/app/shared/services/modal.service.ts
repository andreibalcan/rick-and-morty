import {
    ApplicationRef,
    ComponentRef,
    createComponent,
    Injectable,
    Injector,
    Type,
} from '@angular/core';
import { ModalComponent } from '../../core/components/modal/modal.component';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private modalRef!: ComponentRef<ModalComponent>;

    constructor(
        private appRef: ApplicationRef,
        private injector: Injector,
    ) {}

    open<T>(component: Type<T>, data?: Partial<T>, borderColor?: string) {
        this.modalRef = createComponent(ModalComponent, {
            environmentInjector: this.appRef.injector, // Required in standalone world
            elementInjector: this.injector,
        });

        this.modalRef.instance.childComponent = component;
        this.modalRef.instance.childData = data;
        this.modalRef.instance.borderColor = borderColor;
        this.modalRef.instance.close = () => this.close();

        this.appRef.attachView(this.modalRef.hostView);
        const domElem = this.modalRef.location.nativeElement;
        document.body.appendChild(domElem);
    }

    close() {
        this.appRef.detachView(this.modalRef.hostView);
        this.modalRef.destroy();
    }
}
