export class NoResultsError extends Error {
    constructor(query: string, source: string) {
        super(`No results found for query: '${query}' from source: '${source}'`);

        Object.setPrototypeOf(this, NoResultsError.prototype);
    }

}
