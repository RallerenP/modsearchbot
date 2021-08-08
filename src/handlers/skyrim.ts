import { Comment, Submission } from 'snoowrap';
import fetch, { Response } from "node-fetch";

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

        mod_searches.forEach(mod_search => {
            pending_searches.push(this.search(mod_search))
        })

        const results: SearchResult[] = await Promise.all(pending_searches);

        console.log(results)

        results.forEach(result => {
            let line = `${result.term} | ${result.LE || 'Not Found :('} | ${result.SE || 'Not Found :('}
`;
            reply += line;
        });

        reply += `

---

^(I'm a bot |) ^[source](https://github.com/RallerenP/modsearchbot) ^(| For bugs, questions and suggestions, please file an issue on github)
`

        item.reply(reply);
    }

    async search(search: string): Promise<SearchResult>
    {
        const cleaned_search =
            search
                .substring(2, search.length - 2)
                .trim()

        const cleaned_search_term =
            cleaned_search
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
            term: `${cleaned_search} ^^[LE](https://www.nexusmods.com/skyrim/search/?gsearch=${cleaned_search.split(' ').join('+')}&gsearchtype=mods) ^^& ^^[SE](https://www.nexusmods.com/skyrimspecialedition/search/?gsearch=${cleaned_search.split(' ').join('+')}&gsearchtype=mods)`,
            LE: le_found,
            SE: se_found
        };
    }
}
