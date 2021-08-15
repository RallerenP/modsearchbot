import "ulog"

import anylogger from "anylogger";
import Snoowrap, { Comment, Submission } from "snoowrap";
import { CommentStream, SubmissionStream } from "snoostorm";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import yaml from 'js-yaml';
import Config from "./Config";
import Item from "./Item";
import HandlerManager from "./handlers/HandlerManager";

const log = anylogger('application');

const BOT_START = Date.now() / 1000;

const config_file = fs.readFileSync('./msb.config.yaml', 'utf-8');

const config: Config = yaml.load(config_file) as Config;

const subreddits: string[] = ['modsearchbottests'];

dotenv.config();

const credentials = {
    userAgent: process.env.USER_AGENT as string,
    clientId: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    username: process.env.REDDIT_USERNAME as string,
    password: process.env.REDDIT_PASSWORD as string
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

comments.on('item', (item: Comment) => {
    log.debug(`Comment on ${item.subreddit.display_name}`)
    handlerProxy({
        body: item.body,
        link: item.permalink,
        created: item.created_utc,
        author: item.author,
        subreddit: item.subreddit,
        reply: (text: string) => item.reply(text)
    });
})

submissions.on('item', (item: Submission) => {
    log.debug(`Submission on ${item.subreddit.display_name}`)
    handlerProxy({
        body: item.selftext,
        link: item.permalink,
        created: item.created_utc,
        author: item.author,
        subreddit: item.subreddit,
        reply: (text: string) => item.reply(text)
    }, true);
})

function handlerProxy(item: Item, submission = false) {
    if (item.author.name == "modsearchbot") return; // Don't analyse your own comments, this should prevent accidental infinite comment chains.

    // Avoid reacting to comments from before bot was started (though theoretically that shouldn't happen)
    if (item.created < BOT_START)
    {
        log.warn('Recieved comment or submission made before bot start!')
        return;
    }

    const handler = HandlerManager.instance.get(item.subreddit.display_name);

    if (!handler) {
        log.error(`Comment from unhandled subreddit: ${item.subreddit.display_name}, link ${item.link}`)
    } else {
        handler.handleItem(item);
    }
}

log(`Started listening for comments on ${Object.keys(config.subreddits).join(', ')}`);
