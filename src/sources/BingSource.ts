import ISource from "./ISource";
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

    private readonly config_id: string;
    private readonly subscription_id: string;
    private readonly safe_search: 'off' | 'moderate' | 'strict'

    constructor(config: BingSourceConfig) {
        this.name = config.col_name;
        this.config_id = config.custom_search_config_id;
        this.subscription_id = config.azure_resource_subscription_key;
        this.safe_search = config.safe_search
    }

    async search(search_term: string): Promise<SearchResult> {
        const log = anylogger(`BS (${this.name}`);

        const query = encodeURIComponent(
            truncate(search_term, 50)
        )

        const url =
            `https://api.bing.microsoft.com/v7.0/custom/search?q=${query}&customConfig=${this.config_id}&safeSearch=${this.safe_search}`;

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
