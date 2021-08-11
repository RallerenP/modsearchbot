import SearchResult from "./SearchResult";

export default interface ISearcher {
    search(search_term: string): Promise<SearchResult>
}
