import SearchResult from "./SearchResult";

export default interface ISource {
    name: string
    search(query: Query): Promise<SearchResult>
    get_search_page_link(search_term: string): string;
}

export type Query = {
    search_term: string,
    post_nsfw: boolean | 'off' | 'moderate' | 'strict'
}
