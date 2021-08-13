import SearchResult from "./SearchResult";

export default interface ISource {
    name: string
    search(search_term: string): Promise<SearchResult>
}
