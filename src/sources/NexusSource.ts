import ISource, { Query } from "./ISource";
import anylogger from "anylogger";
import SearchResult from "./SearchResult";
import fetch from "node-fetch";
import { NoResultsError } from "../errors/NoResultsError";
import { NexusSourceConfig } from "../Config";
import { truncate } from "../util";

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

export default class NexusSource implements ISource {
    private readonly game_id: string;
    public readonly name: string;

    constructor(public config: NexusSourceConfig) {
        this.game_id = config.game_id;
        this.name = config.col_name;
    }

    async search(query: Query): Promise<SearchResult> {
        const { search_term, post_nsfw } = query;
        const log = anylogger(`NS (gid: ${this.game_id})`);

        const formatted_search =
            encodeURI(truncate(search_term, 50)
                .split(' ')
                .join(',')
                .replace('-',',')
                .replace(/[().]/g, ''));

        let include_adult: boolean = false;

        if (this.config.include_adult === true) include_adult = true;
        else if (this.config.include_adult === false) include_adult = false;
        else if (post_nsfw === true && this.config.include_adult.nsfw_posts === true) include_adult = true;
        else if (post_nsfw === false && this.config.include_adult.non_nsfw_posts === true) include_adult = true;


        const url = `https://search.nexusmods.com/mods?terms=${formatted_search}&game_id=${this.game_id}&blocked_tags=&blocked_authors=&include_adult=${+include_adult}`

        log.debug('Querying nexusmods:  ' + url);

        const response = await fetch(url);

        if (response.status !== 200) {
            log.error(`Fetch to ${url} returned code ${response.status}`)
            log.error(`Response: ${await response.text()}`)
            throw new Error(`Fetch to ${url} returned code ${response.status}`);
        }

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

    get_search_page_link(): string {
        return "";
    }
}
