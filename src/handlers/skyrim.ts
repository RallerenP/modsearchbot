import { Comment, Submission } from 'snoowrap';
import fetch, { Response } from "node-fetch";
import { getDefaultFooter } from "../util";

type SearchResult = {
    term: string
    SE: string | null,
    LE: string | null
}

export default class SkyrimHandler {
    constructor() {

    }

    async handleItem(item: Comment | Submission, submission=false) {
        let body = !submission ? (item as Comment).body : (item as Submission).selftext;

        const mod_searches = body.match(/{{.*?}}/g);

        if (mod_searches === null) return;

        let reply = `Search Term | LE Nexus | SE Nexus
:-:|:-:|:-:
`
        const pending_searches: Promise<SearchResult>[] = [];
        const search_terms: string[] = [];


        mod_searches.forEach(mod_search => {
            const cleaned_search =
                mod_search
                    .substring(2, mod_search.length - 2)
                    .trim()

            if (search_terms.indexOf(cleaned_search) !== -1) return;

            search_terms.push(cleaned_search);
            pending_searches.push(this.search(cleaned_search))
        })

        const results: SearchResult[] = await Promise.all(pending_searches);

        console.log(results)

        results.forEach(result => {
            let line = `${result.term} | ${result.LE || 'Not Found :('} | ${result.SE || 'Not Found :('}
`;
            reply += line;
        });

        reply += getDefaultFooter()

        item.reply(reply);
    }

    async search(search: string): Promise<SearchResult>
    {
        const cleaned_search_term =
            search
                .split(' ')
                .join(',');

        const le_response = await fetch(`https://search.nexusmods.com/mods?terms=${cleaned_search_term}&game_id=110&blocked_tags=&blocked_authors=&include_adult=1`)
        const se_response = await fetch(`https://search.nexusmods.com/mods?terms=${cleaned_search_term}&game_id=1704&blocked_tags=&blocked_authors=&include_adult=1`)

        const le_result = await le_response.json() as any;
        const se_result = await se_response.json() as any;

        let le_found = null;
        let se_found = null;

        if (le_result.total > 0)
        {
            le_found = `[${le_result.results[0].name}](https://www.nexusmods.com/skyrim/mods/${le_result.results[0].mod_id})`
        }

        if (se_result.total) {
            se_found = `[${se_result.results[0].name}](https://www.nexusmods.com/skyrimspecialedition/mods/${se_result.results[0].mod_id})`
        }

        return {
            term: `${search} ^^[LE](https://www.nexusmods.com/skyrim/search/?gsearch=${search.split(' ').join('+')}&gsearchtype=mods) ^^& ^^[SE](https://www.nexusmods.com/skyrimspecialedition/search/?gsearch=${search.split(' ').join('+')}&gsearchtype=mods)`,
            LE: le_found,
            SE: se_found
        };
    }
}
