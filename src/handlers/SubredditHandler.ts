import ISource from "../sources/ISource";
import { SubredditConfig } from "../Config";
import SourceFactory from "../sources/SourceFactory";
import anylogger from "anylogger";
import { Comment, Submission } from "snoowrap";
import Item from "../Item";
import { NoResultsError } from "../errors/NoResultsError";
import { getDefaultFooter } from "../util";

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

        let reply = `Search Term | ${this.sources.map(source => source.name).join(' | ')}
:-:|:-:|:-:
`

        const pending: Promise<string>[] = [];
        const search_terms: string[] = [];

        mod_searches.forEach(mod_search => {
            const cleaned_search =
                mod_search
                    .substring(2, mod_search.length - 2)
                    .trim()

            if (search_terms.indexOf(cleaned_search.toLowerCase()) !== -1) return;

            search_terms.push(cleaned_search.toLowerCase());
            pending.push(this.createRow(cleaned_search));
        })

        const rows: string[] = await Promise.all(pending);

        rows.forEach(row => {
            reply += row + '\n';
        });

        reply += getDefaultFooter()

        item.reply(reply);

    }

    async createRow(search_term: string): Promise<string> {
        let row = search_term;

        for (let i = 0; i < this.sources.length; i++) {
            const source = this.sources[i];

            try {
                const result = await source.search(search_term);

                row += ` | [${result.display_name}](${result.url})`;
            } catch (e) {
                if (e instanceof NoResultsError)
                {
                    row += ` | No Results :(`
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