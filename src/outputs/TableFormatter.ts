import SearchResult from "../sources/SearchResult";
import { repeat } from "../util";

export default class TableFormatter {
    public static formatHeader(labels: string[]): string {
        return `${labels.join(' | ')}
${repeat(':-:|', labels.length)}
`
    }
}

