import SearchResult from "./SearchResult";

export default interface ISource {
    name: string
    search(search_term: string): Promise<SearchResult>
    get_search_page_link(search_term: string): string;
}
