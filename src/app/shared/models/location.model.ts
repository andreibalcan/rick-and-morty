  import { Character } from './character.model';

  export interface Location {
    /** The id of the location. */
    id: number;

    /** The name of the location. */
    name: string;

    /** The type of the location. */
    type: string;

    /** The dimension in which the location is located. */
    dimension: string;

    /** List of character who have been last seen in the location. */
    residents: Character['url'][];

    /** Link to the location's own endpoint. */
    url: string;

    /** Time at which the location was created in the database. */
    created: string;
  }

  export interface LocationResponse {
    info: {
      count: number;
      pages: number;
      next: number | string | null;
      prev: number | string | null;
    };
    results: Location[];
  }