import "ulog"

import anylogger from "anylogger";
import Snoowrap, { Comment, Submission } from "snoowrap";
import { CommentStream, SubmissionStream } from "snoostorm";
import * as dotenv from 'dotenv';
import SkyrimHandler from "./handlers/skyrim";

const log = anylogger('application');

const BOT_START = Date.now() / 1000;

const handlers = {
    skyrim: new SkyrimHandler()
}

const subreddits = [
    'modsearchbottests',
    'skyrimmods'
]


dotenv.config();

const credentials = {
    userAgent: process.env.USER_AGENT as string,
    clientId: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    username: process.env.REDDIT_USERNAME as string,
    password: process.env.REDDIT_PASSWORD as string
}

const settings = {
    subreddit: subreddits.join('+'),
    pollTime: 10000,
    limit: 0
}

const client = new Snoowrap(credentials)

const comments = new CommentStream(client, settings);
const submissions = new SubmissionStream(client, settings);

comments.on('item', (item: Comment) => {
    handlerProxy(item);
})

submissions.on('item', (item: Submission) => {
    handlerProxy(item, true);
})

function handlerProxy(item: Comment | Submission, submission = false) {
    if (item.author.name == "modsearchbot") return; // Don't analyse your own comments, this should prevent accidental infinite comment chains.

    // Avoid reacting to comments from before bot was started (though theoretically that shouldn't happen)
    if (item.created_utc < BOT_START)
    {
        log.warn('Recieved comment made before bot start!')
        return;
    }

    log.info(`Comment on ${item.subreddit.display_name}`)

    switch (item.subreddit.display_name)
    {
        case 'modsearchbottests':
        case 'skyrimmods':
            handlers.skyrim.handleItem(item, submission);
            break;
        default:
            log.error(`Comment from unhandled subreddit: ${item.subreddit.display_name}, link ${item.permalink}`)
            break;
    }
}

log(`Started listening for comments on ${subreddits.join(', ')}`);
