import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title correctly', () => {
    const titleElement = fixture.debugElement.query(By.css('.container__title'));
    expect(titleElement.nativeElement.textContent).toContain('Rick and Morty Explorer');
  });

  it('should render the subtitle with correct link', () => {
    const subtitleElement = fixture.debugElement.query(By.css('.container__subtitle'));
    const linkElement = subtitleElement.query(By.css('a'));
    
    expect(subtitleElement.nativeElement.textContent).toContain('Powered by:');
    expect(linkElement.nativeElement.textContent).toBe('https://rickandmortyapi.com/');
    expect(linkElement.nativeElement.getAttribute('href')).toBe('https://rickandmortyapi.com/');
  });

  it('should render a Start button with correct router link', () => {
    const buttonElement = fixture.debugElement.query(By.css('.container__button'));
    
    expect(buttonElement.nativeElement.textContent).toBe('Start');
    expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
    expect(buttonElement.nativeElement.getAttribute('routerLink')).toBe('/characters');
  });

  it('should have all expected CSS classes', () => {
    const containerElement = fixture.debugElement.query(By.css('.container'));
    expect(containerElement).toBeTruthy();
    
    const titleElement = fixture.debugElement.query(By.css('.container__title'));
    expect(titleElement).toBeTruthy();
    
    const subtitleElement = fixture.debugElement.query(By.css('.container__subtitle'));
    expect(subtitleElement).toBeTruthy();
    
    const buttonElement = fixture.debugElement.query(By.css('.container__button'));
    expect(buttonElement).toBeTruthy();
  });
});