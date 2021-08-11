import ISearcher from "./ISearcher";
import anylogger from "anylogger";
import SearchResult from "./SearchResult";
import fetch from "node-fetch";
import { NoResultsError } from "../../errors/NoResultsError";

type NexusResponse = {
    terms: string[],
    exclude_authors: string[],
    exclude_tags: string[],
    took: number,
    total: number,
    results: {
        name: string,
        downloads: number,
        endorsements: number
        url: string,
        image: string,
        username: string,
        user_id: number,
        game_name: string,
        game_id: number,
        mod_id: number
    }[]
}



export default class NexusSearcher implements ISearcher {
    constructor(private game_id: string, public readonly name: string = 'Nexus') { }

    async search(search_term: string): Promise<SearchResult> {
        const log = anylogger(`NexusSearcher (gid: ${this.game_id})`);

        const formatted_search =
            search_term
                .split(' ')
                .join(',');

        const url = `https://search.nexusmods.com/mods?terms=${formatted_search}&game_id=${this.game_id}&blocked_tags=&blocked_authors=&include_adult=1`

        log.debug('Querying nexusmods:  ' + url);

        const response = await fetch(url);

        const results: NexusResponse = await response.json();

        if (results.total === 0) {
            log.debug(`No results found for search ${search_term}'`);
            throw new NoResultsError(search_term, this.game_id);
        }

        log.debug(`Found ${results.total} results from Nexusmods, search ${search_term}`);

        return {
            display_name: results.results[0].name,
            url: 'https://nexusmods.com' + results.results[0].url
        };
    }
}
