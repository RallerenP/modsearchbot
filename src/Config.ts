type Config = {
    subreddits: {
        [subreddit: string]: SubredditConfig
    }
}

export type SubredditConfig = {
    sources: [
        {
            [source: string]: NexusSourceConfig
        }
    ]
}

export type NexusSourceConfig = {
    type: SourceType,
    game_id: string,
    col_name: string
}

export type SourceType = 'Nexus'

export default Config;
