import ISource from "./ISource";
import { NexusSourceConfig, SourceType } from "../Config";
import NexusSource from "./NexusSource";

export default class SourceFactory {
    get(type: SourceType, config: NexusSourceConfig): ISource {
        switch (type) {
            case "Nexus":
                return new NexusSource(config as NexusSourceConfig)
                break;
            default:
                throw new TypeError(`Type '${type}' is not a valid source type`);
        }
    }
}
