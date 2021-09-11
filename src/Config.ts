import BingSource from "./sources/BingSource";
import yaml from "js-yaml";
import fs from "fs";
import Joi from "joi";

export class ConfigFactory {
    public static create(): Config {
        const config_file = fs.readFileSync(process.env.MODSEARCHBOT_CONFIG_FILE || './msb.config.yaml', 'utf-8');

        const original_config: Config = yaml.load(config_file) as Config;

        const config_schema = Joi.object({
            account_config: Joi.object({
               user_agent: Joi.string().required(),
               client_id: Joi.string().required(),
               client_secret: Joi.string().required(),
               username: Joi.string().required(),
               password: Joi.string().required()
            }).required(),
            subreddits: Joi.object().pattern(
                /.*/,
                {
                    sources: Joi.array().items(
                        Joi.object().pattern(/.*/,
                            Joi.alternatives().try(
                                {
                                    type: Joi.string().valid('Nexus').required(),
                                    game_id: Joi.string().required(),
                                    col_name: Joi.string().default('Nexus'),
                                    include_adult: Joi.alternatives().try(
                                        Joi.boolean(),
                                        Joi.object({
                                            nsfw_posts: Joi.boolean().default(true),
                                            non_nsfw_posts: Joi.boolean().default(false)
                                        })
                                    ).default({nsfw_posts: true, non_nsfw_posts: false}),
                                    limit: Joi.boolean().default(false)
                                },
                                {
                                    type: Joi.string().valid('Bing').required(),
                                    custom_search_config_id: Joi.alternatives().try(
                                        Joi.string(),
                                        Joi.object({
                                            nsfw_posts: Joi.string(),
                                            sfw_posts: Joi.string()
                                        })
                                    ).required(),
                                    azure_resource_subscription_key: Joi.string().required(),
                                    col_name: Joi.string().default('Bing'),
                                    safe_search: Joi.alternatives().try(
                                        Joi.string().valid('off', 'moderate', 'strict'),
                                        Joi.object({
                                            nsfw_posts: Joi.string().valid('off', 'moderate', 'strict').default('off'),
                                            non_nsfw_posts: Joi.string().valid('off', 'moderate', 'strict').default('strict')
                                        })
                                    ).default({nsfw_posts: 'off', non_nsfw_posts: 'strict'}),
                                    limit: Joi.boolean().default(true)
                                }
                            )).required()
                    ).required()
                }
            ).required()
        }).required();

        return Joi.attempt(original_config, config_schema);
    }
}

type Config = {
    account_config: {
        user_agent: string,
        client_id: string,
        client_secret: string,
        username: string
        password: string
    }
    subreddits: {
        [subreddit: string]: SubredditConfig
    }
}

export type SubredditConfig = {
    sources: [
        {
            [source: string]: NexusSourceConfig | BingSourceConfig
        }
    ]
}

export type BaseSourceConfig = {
    type: SourceType,
    col_name: string
    limit: boolean
}

export type NexusSourceConfig = {
    game_id: string,
    include_adult: boolean | {
        nsfw_posts: boolean
        non_nsfw_posts: boolean
    }
} & BaseSourceConfig

export type BingSourceConfig = {
    custom_search_config_id: string | {
        nsfw_posts: string,
        sfw_posts: string
    },
    azure_resource_subscription_key: string,
    safe_search: 'off' | 'moderate' | 'strict' | {
        nsfw_posts: 'off' | 'moderate' | 'strict'
        non_nsfw_posts: 'off' | 'moderate' | 'strict'
    }
} & BaseSourceConfig

export type SourceType = 'Nexus' | 'Bing'

export default Config;
