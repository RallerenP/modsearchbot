import "ulog"

import anylogger from "anylogger";
import Snoowrap, { Comment, Submission } from "snoowrap";
import { CommentStream, SubmissionStream } from "snoostorm";
import { ConfigFactory } from "./Config";
import Item from "./Item";
import HandlerManager from "./handlers/HandlerManager";

const log = anylogger('application');

const BOT_START = Date.now() / 1000;

const config = ConfigFactory.create();

const subreddits: string[] = ['modsearchbottests'];

const credentials = {
    userAgent: config.account_config.user_agent,
    clientId: config.account_config.client_id,
    clientSecret: config.account_config.client_secret,
    username: config.account_config.username,
    password: config.account_config.password
}

const settings = {
    subreddit: Object.keys(config.subreddits).join('+'),
    pollTime: 10000,
    limit: 0
}

HandlerManager.instance.create(config.subreddits)

const client = new Snoowrap(credentials)

const comments = new CommentStream(client, settings);
const submissions = new SubmissionStream(client, settings);

comments.on('item', async (item: Comment) => {
    if (item.created < BOT_START)
    {
        log.warn('Recieved comment or submission made before bot start!')
        return;
    }
    
    log.debug(`Comment on ${item.subreddit.display_name}`)
    
    handlerProxy({
        body: item.body,
        link: item.permalink,
        created: item.created_utc,
        author: item.author,
        subreddit: item.subreddit,
        //is_nsfw: true,
        is_nsfw: await client.getSubmission(item.permalink.match(/(?<=\/r\/.{1,20}\/comments\/).*(?=\/.*\/.*\/)/)![0]).over_18,
        reply: (text: string) => item.reply(text)
    });
})

submissions.on('item', (item: Submission) => {
    if (item.created < BOT_START)
    {
        log.warn('Recieved comment or submission made before bot start!')
        return;
    }
    log.debug(`Submission on ${item.subreddit.display_name}`)
    handlerProxy({
        body: item.selftext,
        link: item.permalink,
        created: item.created_utc,
        author: item.author,
        subreddit: item.subreddit,
        is_nsfw: item.over_18,
        reply: (text: string) => item.reply(text)
    }, true);
})

function handlerProxy(item: Item, submission = false) {
    if (item.author.name == "modsearchbot") return; // Don't analyse your own comments, this should prevent accidental infinite comment chains.

    // Avoid reacting to comments from before bot was started (though theoretically that shouldn't happen)
    

    const handler = HandlerManager.instance.get(item.subreddit.display_name);

    if (!handler) {
        log.error(`Comment from unhandled subreddit: ${item.subreddit.display_name}, link ${item.link}`)
    } else {
        handler.handleItem(item);
    }
}

log(`Started listening for comments on ${Object.keys(config.subreddits).join(', ')}`);
