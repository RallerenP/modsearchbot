import ISource, { Query } from "../sources/ISource";
import { SubredditConfig } from "../Config";
import SourceFactory from "../sources/SourceFactory";
import anylogger from "anylogger";
import { Comment, Submission } from "snoowrap";
import Item from "../Item";
import { NoResultsError } from "../errors/NoResultsError";
import { getDefaultFooter, getDefaultNSFWWarning, repeat } from "../util";
import { LoggedError } from "../errors/LoggedError";
import TableFormatter from "../outputs/TableFormatter";

export default class SubredditHandler {
    private readonly sources: ISource[];
    private readonly source_factory = new SourceFactory();
    private log = anylogger("SubredditHandler")

    constructor(config: SubredditConfig) {
        this.sources = config.sources.map(source => {
            const inner = source[Object.keys(source)[0]];
            return this.source_factory.get(inner.type, inner)
        })
    }

    async handleItem(item: Item) {
        const { body, link } = item;

        const mod_searches = body.match(/{{.*?}}/g);

        if (mod_searches === null) {
            this.log.debug(`Item contained no search tags! (${link})`);
            return;
        }

        let reply = TableFormatter.formatHeader(['Search Term', ...this.sources.map(source => source.name)]);
        
//         `Search Term | ${this.sources.map(source => source.name).join(' | ')}
// ${repeat(':-:|', 1 + this.sources.length)}
// `

        const default_rows = await this.search(mod_searches, item);

        default_rows.forEach(row => {
            reply += row + '\n';
        });

        if (!item.is_nsfw) {
            const sources: ISource[] = this.sources.filter(source => source.name !== 'Bing');

            const nsfw_rows = await this.search(mod_searches, item, {sources, force_adult: true, censor: true});
            const def = await this.search(mod_searches, item, {sources: sources, censor: true});

            let diff = false;

            for (let i = 0; i < nsfw_rows.length; i++) {
                const row = nsfw_rows[i];
                
                if (row !== def[i]) diff = true;
            }

            if (diff) {
                reply += getDefaultNSFWWarning();

                reply += TableFormatter.formatHeader(['Search Term', ...sources.map(source => source.name)]);
            
                nsfw_rows.forEach(row => {
                    reply += row + '\n';
                });
            }
            
        }

        reply += getDefaultFooter()

        item.reply(reply);

    }

    
    private async search(mod_searches: RegExpMatchArray, item: Item, options?: SearchOptions) {
        const search_terms: string[] = [];
        const pending: Promise<string>[] = [];

        if (!options) options={force_adult: false}

        mod_searches.forEach(mod_search => {
            const cleaned_search = mod_search
                .substring(2, mod_search.length - 2)
                .trim();

            if (search_terms.indexOf(cleaned_search.toLowerCase()) !== -1)
                return;

            search_terms.push(cleaned_search.toLowerCase());
            pending.push(this.createRow({ search_term: cleaned_search, post_nsfw: item.is_nsfw || options!.force_adult! }, options));
        });

        return await Promise.all(pending);
    }

    async createRow(query: Query, options?: SearchOptions): Promise<string> {
        let row = query.search_term;
        const results = [];

        let hasFoundExact = false;

        const sourcesToSearch = options?.sources || this.sources;

        for (let i = 0; i < sourcesToSearch.length; i++) {
            const source = sourcesToSearch[i];

            try {
                if (hasFoundExact && source.config.limit) {
                    this.log.debug(`Skipping ${source.name} for search ${query.search_term}, as previous sources got the exact search term, and this source's config was set to 'limited = true'`)

                    row += ` | Skipped[^Why?](https://github.com/RallerenP/modsearchbot/blob/main/docs/SEARCH.md#why-was-my-search-skipped)`
                    continue;
                }
                const result = await source.search(query);
                results.push(result);

                if (result.display_name === query.search_term) {
                    hasFoundExact = true;
                }

                row += ` | ${options?.censor ? '>!' : ''}[${result.display_name}](${result.url})${options?.censor ? '!<' : ''}`;
            } catch (e) {
                if (e instanceof NoResultsError)
                {
                    row += ` | No Results :(`
                }
                else if (e instanceof LoggedError) {
                    row += ` | An Error Occurred :(`
                }
                else
                {
                    this.log.error(e);
                    row += ` | An Error Occurred :(`
                }

            }
        }

        return row;
    }
}

type SearchOptions = {
    force_adult?: boolean;
    sources?: ISource[]
    censor?: boolean;
}
