import { SubredditConfig } from "../Config";
import SubredditHandler from "./SubredditHandler";

export default class HandlerManager {
    public static readonly instance: HandlerManager = new HandlerManager();
    private readonly handlers: Map<string, SubredditHandler> = new Map();

    private constructor() { }

    public create(subreddits: { [subreddit: string]: SubredditConfig }) {
        this.handlers.clear();

        Object.keys(subreddits).forEach(key => {
            const subreddit = subreddits[key];
            this.handlers.set(key, new SubredditHandler(subreddit));
        })
    }

    public get(subreddit: string): SubredditHandler | undefined {
        return this.handlers.get(subreddit);
    }
}
