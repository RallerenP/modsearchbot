import ISource from "./ISource";
import { BingSourceConfig, NexusSourceConfig, SourceType } from "../Config";
import NexusSource from "./NexusSource";
import BingSource from "./BingSource";

export default class SourceFactory {
    get(type: SourceType, config: NexusSourceConfig | BingSourceConfig): ISource {
        switch (type) {
            case "Nexus":
                return new NexusSource(config as NexusSourceConfig)
                break;
            case "Bing":
                return new BingSource(config as BingSourceConfig)
            default:
                throw new TypeError(`Type '${type}' is not a valid source type`);
        }
    }
}
