# Bing Source Configuration

In the `msb.configuration.yaml` file, you can configure the Bing Source as a source for the subreddit. You set this by setting the 'type' to 'Bing'


_Example_
````yaml
subreddits:
  (subreddit_name):
    sources:
      - (source_name):
          type: "Bing"
          custom_search_config_id: "[Bing Custom Search ID]"
          azure_resource_subscription_key: "[Azure Resource Subscription Key]"
          safe_search: "off"
````

`type: "Bing"` *Required*, marks the source to search from the Nexus

`custom_search_config_id` *Required*, ID of the Bing Custom Search Configuration (See Below)

`azure_resource_subscription_key` *Required*, Azure Resource Subscription Key (See Below)

`col_name` *Optional*, Display name of the column (Default: "*Nexus*")

`safe_search` *Optional*, Whether or not to include adult content from this source. (Accepted values: "*off*", "*moderate*", "*strict*")

`safe_search` Can also be divided into 

```yaml
safe_search:
  nsfw_posts: 'off'
  non_nsfw_psots: 'strict'
```

This is the default values

---

### Azure Resource Subscription Key

For this you will need an [Azure Account](https://azure.microsoft.com/en-us/account/) and an Azure Subscription (A free account will **not** do).

Log into the [Azure Portal](https://portal.azure.com/), find the marketplace and create an instance of `Bing Custom Search`. Select an appropriate pricing tier (free tier will **not** do).

Once the resource has been deployed, go to the overview, and find the text that says `Manage keys`. Copying the key will be your Azure Resource Subscription Key.

### Bing Custom Search Config ID

This is the ID of a custom search engine created with https://www.customsearch.ai/.  Create an [Azure Account](https://azure.microsoft.com/en-us/account/) if necessary, and create an instance of the custom search engine.

Configure the sites, and goto the 'Production' tab. Here you will find a box with your `Custom Configuration ID`









