import ISource, { Query } from "./ISource";
import { BingSourceConfig, NexusSourceConfig } from "../Config";
import SearchResult from "./SearchResult";
import { truncate } from "../util";
import anylogger from "anylogger";
import { NoResultsError } from "../errors/NoResultsError";
import fetch from "node-fetch";

type BingResponse = {
    webPages: {
        webSearchUrl: string,
        value: {
            name: string,
            url: string
        }[]
    }
}

export default class BingSource implements ISource {
    public readonly name: string;

    private readonly config_id: string | { nsfw_posts: string, sfw_posts: string };
    private readonly subscription_id: string 
    private readonly config: BingSourceConfig;

    constructor(config: BingSourceConfig) {
        this.name = config.col_name;
        this.config_id = config.custom_search_config_id;
        this.subscription_id = config.azure_resource_subscription_key;
        this.config = config;
    }

    async search(query: Query): Promise<SearchResult> {
        const { search_term, post_nsfw  } = query
        const log = anylogger(`BS (${this.name}`);

        const _query = encodeURIComponent(
            truncate(search_term, 50)
        )

        let safe_search: 'off' | 'moderate' | 'strict' = 'strict';
        let config_id = this.config.custom_search_config_id;

        log.debug(`Bing source config safe_search option is ${JSON.stringify(this.config.safe_search)} and post is ${post_nsfw ? '' : 'not'} nsfw`);

        if (
            this.config.safe_search === 'off' ||
            this.config.safe_search === 'moderate' ||
            this.config.safe_search === 'strict'
        ) {
            safe_search = this.config.safe_search
        }
        else if (post_nsfw === true){
            safe_search = this.config.safe_search.nsfw_posts;
        } 
        else if (post_nsfw === false){
            safe_search = this.config.safe_search.non_nsfw_posts;
        } 

        if (
            typeof this.config.custom_search_config_id === "string"
        ) {
            config_id = this.config.custom_search_config_id;
        }
        else if (post_nsfw === true){
            config_id = this.config.custom_search_config_id.nsfw_posts;
        } 
        else if (post_nsfw === false){
            config_id = this.config.custom_search_config_id.sfw_posts;
        } 

        log.debug(`safe_search set to ${safe_search}`)
        log.debug(`config_id set to ${config_id}`)

        const url =
            `https://api.bing.microsoft.com/v7.0/custom/search?q=${_query}&customConfig=${config_id}&safeSearch=${safe_search}`;

        log.debug(`querying ${url}`)

        const headers = {
            'Ocp-Apim-Subscription-Key': this.subscription_id
        }

        const response = await fetch(url, {
            headers
        })

        if (response.status !== 200) {
            log.error(`Fetch to ${url} returned code ${response.status}`)
            log.error(`Response: ${await response.text()}`)
            throw new Error(`Fetch to ${url} returned code ${response.status}`);
        }

        const json: BingResponse = await response.json() as BingResponse;

        //console.log(json.webPages.value[0])

        if (!json.webPages) {
            throw new NoResultsError(`No results for query ${search_term}`, this.name)
        }

        return {
            display_name: json.webPages.value[0].name,
            url: json.webPages.value[0].url,
        }
    }

    get_search_page_link(): string {
        return "";
    }
}
