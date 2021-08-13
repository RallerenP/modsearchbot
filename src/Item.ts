import { ReplyableContent, Comment, Submission, RedditUser, Subreddit } from "snoowrap";

export default interface Item {
    body: string;
    link: string;
    created: number;
    author: RedditUser
    subreddit: Subreddit
    reply(text: string): Promise<ReplyableContent<Comment | Submission>>
}
