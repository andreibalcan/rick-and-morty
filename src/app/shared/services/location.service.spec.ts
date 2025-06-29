import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LocationService } from './location.service';

describe('DataHttpService', () => {
    let service: LocationService;
    let httpMock: HttpTestingController;
    const mockData = {
        id: 21,
        name: 'Testicle Monster Dimension',
        type: 'Dimension',
        dimension: 'Testicle Monster Dimension',
        residents: [
            'https://rickandmortyapi.com/api/character/7',
            'https://rickandmortyapi.com/api/character/436',
        ],
        url: 'https://rickandmortyapi.com/api/location/21',
        created: '2017-11-18T19:41:01.605Z',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LocationService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(LocationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('.getData', () => {
        it('should make GET request and return data', () => {
            service.getLocation('https://rickandmortyapi.com/api/location/21').subscribe(data => {
                expect(data).toEqual(mockData);
            });

            const req = httpMock.expectOne("https://rickandmortyapi.com/api/location/21");
            expect(req.request.method).toEqual('GET');
            req.flush(mockData);
        });

        it('should handle GET errors', () => {
            const mockError = { error: "Hey! you must provide an id" };

            service.getLocation('https://rickandmortyapi.com/api/location/invalid-id').subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error.error).toEqual(mockError.error);
                }
            });

            const req = httpMock.expectOne('https://rickandmortyapi.com/api/location/invalid-id');
            req.flush(mockError, { status: 404, statusText: 'Not Found' });
        });

        it('should handle network errors', () => {
            service.getLocation('https://rickandmortyapi.com/api/location/21').subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error).toBeInstanceOf(ProgressEvent);
                    expect(error.type).toBe('error');
                }
            });

            const req = httpMock.expectOne('https://rickandmortyapi.com/api/location/21');
            req.error(new ProgressEvent('network error'));
        });
    });
});