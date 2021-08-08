"use strict";
exports.__esModule = true;
require("ulog");
var anylogger_1 = require("anylogger");
var snoowrap_1 = require("snoowrap");
var snoostorm_1 = require("snoostorm");
var dotenv = require("dotenv");
var skyrim_1 = require("./handlers/skyrim");
var log = anylogger_1["default"]('application');
var BOT_START = Date.now() / 1000;
var handlers = {
    skyrim: new skyrim_1["default"]()
};
var subreddits = [
    'modsearchbottests',
];
dotenv.config();
var credentials = {
    userAgent: process.env.USER_AGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
};
var settings = {
    subreddit: subreddits.join('+'),
    pollTime: 10000,
    limit: 0
};
var client = new snoowrap_1["default"](credentials);
var comments = new snoostorm_1.CommentStream(client, settings);
var submissions = new snoostorm_1.SubmissionStream(client, settings);
comments.on('item', function (item) {
    handlerProxy(item);
});
submissions.on('item', function (item) {
    handlerProxy(item, true);
});
function handlerProxy(item, submission) {
    if (submission === void 0) { submission = false; }
    if (item.author.name == "modsearchbot")
        return; // Don't analyse your own comments, this should prevent accidental infinite comment chains.
    // Avoid reacting to comments from before bot was started (though theoretically that shouldn't happen)
    if (item.created_utc < BOT_START) {
        log.warn('Recieved comment made before bot start!');
        return;
    }
    log.info("Comment on " + item.subreddit.display_name);
    switch (item.subreddit.display_name) {
        case 'modsearchbottests':
            handlers.skyrim.handleItem(item, submission);
            break;
        default:
            log.error("Comment from unhandled subreddit: " + item.subreddit.name + ", link " + item.permalink);
            break;
    }
}
log("Started listening for comments on " + subreddits.join(', '));
