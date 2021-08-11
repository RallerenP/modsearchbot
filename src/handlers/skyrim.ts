import { Comment, Submission } from 'snoowrap';
import { getDefaultFooter } from "../util";
import NexusSearcher from "./searchers/nexus.searcher";
import { NoResultsError } from "../errors/NoResultsError";
import anylogger from "anylogger";

export default class SkyrimHandler {
    private sources = [
        new NexusSearcher('110', 'LE Nexus'),
        new NexusSearcher('1704', 'SE Nexus')
    ]

    log = anylogger('SkyrimHandler')

    async handleItem(item: Comment | Submission, submission=false) {
        let body = !submission ? (item as Comment).body : (item as Submission).selftext;

        const mod_searches = body.match(/{{.*?}}/g);

        if (mod_searches === null) {
            this.log.debug(`Item contained no search tags! (${item.permalink})`);
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
