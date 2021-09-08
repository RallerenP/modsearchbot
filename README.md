## [u/modsearchbot](https://www.reddit.com/u/modsearchbot)
A bot for searching mods from ~~nexusmods.com~~ multiple sources

### Todo
- [x] Refactor code (a never-ending quest)
    - [x] Create file(s) for configuring the behavior of the bot (probably YAML, will need to research more)
- [x] Ensure security of user-inputted strings. (Max char. limit)
- [x] Add more sources
- [ ] Search results based on post flair
- [ ] Searching for multiple mods, with a single pair of brackets
- [ ] Avoid duplication of results from different sources
- [ ] Make it possible to delete the response of the bot
- [ ] Split very long comments into multiple parts
- [ ] Solve the problem of people accidentally replying to the bot
- [ ] Provide links for manual search pages
- [ ] Create docker image for easier deployment
- [x] Support for only posting NSFW links in NSFW posts

### Config

Place a ``msb.config.yaml`` file in the root folder.

````yaml
account_config:
  user_agent: "mod-search-bot by u/RallerenP"
  client_id: "CLIENT_ID"
  client_secret: "CLIENT_SECRET"
  username: "modsearchbot"
  password: "ACCOUNT_PASSWORD"
subreddits:
  (subreddit_name):
    sources:
      - (source_name):
          type: "Nexus"
          game_id: "110"
          col_name: "LE Skyrim"
````

#### *`account_config`*

`user_agent` *Required*, An unique string identifying the bot (eg. 'mod search bot, by u/RallerenP')

`client_id` *Required*, OAuth Client ID, retrieved from the created application on the reddit account.

`client_secret` *Required*, OAuth Client Secret, retrieved from the created application on the reddit account.

`username` *Required*, Username of the bot account

`password` *Required*, Password of the bot account

#### *``subreddits``*

``(subreddit_name)`` *Required*, should be replaced with the name of the sub to listen to (without ()'s). 

``sources`` *Required*, List of sources to search from

``(source_name)`` *Required*, Completely arbitrary name for the source (just there for ease of use)

``type`` *Required*, Type of source. (Accepted Values: "*Nexus*", "*Bing*")

#### Source Configs

Different sources have different configuration options.

**type: "Nexus"**

See [Nexus Source Configuration](docs/sources/NEXUS.md)

**type: "Bing"**

See [Bing Source Configuration](docs/sources/BING.md)

