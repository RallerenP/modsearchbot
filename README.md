## [u/modsearchbot](https://www.reddit.com/u/modsearchbot)
A bot for searching mods from ~~nexusmods.com~~ multiple sources

### Todo
- [x] Refactor code (a never-ending quest)
    - [x] Create file(s) for configuring the behavior of the bot (probably YAML, will need to research more)
- [x] Ensure security of user-inputted strings. (Max char. limit)
- [ ] Add more sources

### Config

Place a ``msb.config.yaml`` file in the root folder.

````yaml
subreddits:
  (subreddit_name):
    sources:
      - (source_name):
          type: "Nexus"
          game_id: "110"
          col_name: "LE Skyrim"
````

``subreddits`` Contains different subreddits the bot should listen to

``(subreddit_name)`` should be replaced with the name of the sub to listen to (without ()'s). 

``sources`` List of sources to search from

``(source_name)`` Completely arbitrary name for the source (just there for ease of use)

``type`` Type of source. For now, the only accepted value is: ``"Nexus"``

#### Source Configs

Different sources have different configuration options. Currently, only Nexus works as a source.

**type: "Nexus"**

```yaml
type: "Nexus"
game_id: "Nexus Game ID"
col_name: "LE Skyrim"
```

``type: "Nexus"`` *Required*, marks the source to search from the Nexus

``game_id`` *Required*, the ID of the game, from the Nexus.

``col_name`` *Required*, Display name of the column

#### Environment

Create a ``.env`` file in root,

````
USER_AGENT=
CLIENT_ID=
CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
````

``USER_AGENT`` An unique string identifying the bot (eg. 'mod search bot, but u/RallerenP)

``CLIENT_ID`` OAUTH client id,

``CLIENT_SECRET`` OAUTH client secret

``REDDIT_USERNAME`` username of the bot account

``REDDIT_PASSWORD`` password of the bot account




