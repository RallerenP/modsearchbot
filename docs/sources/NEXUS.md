# Nexus Source Configuration

In the `msb.configuration.yaml` file, you can configure the Nexus Source as a source for the subreddit. You set this by setting the 'type' to 'Nexus'


_Example_
````yaml
subreddits:
  (subreddit_name):
    sources:
      - (source_name):
          type: "Nexus"
          game_id: "110"
          col_name: "LE Skyrim"
          include_adult: false
````

`type: "Nexus"` *Required*, marks the source to search from the Nexus

`game_id` *Required*, the ID of the game, from the Nexus.

`col_name` *Optional*, Display name of the column (Default: "*Nexus*")

`include_adult` *Optional*, Whether or not to include adult content from this source.

`include_adult` can also be divided into

```yaml
include_adult:
  nsfw_posts: true
  non_nsfw_posts: false
```

This is the default values




