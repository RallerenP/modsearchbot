"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
var SkyrimHandler = /** @class */ (function () {
    function SkyrimHandler() {
    }
    SkyrimHandler.prototype.handleItem = function (item, submission) {
        if (submission === void 0) { submission = false; }
        return __awaiter(this, void 0, void 0, function () {
            var body, mod_searches, reply, pending_searches, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = !submission ? item.body : item.selftext;
                        mod_searches = body.match(/{{.*?}}/g);
                        if (mod_searches === null)
                            return [2 /*return*/];
                        reply = "Search Term | LE Nexus | SE Nexus\n:-:|:-:|:-:\n";
                        pending_searches = [];
                        mod_searches.forEach(function (mod_search) {
                            pending_searches.push(_this.search(mod_search));
                        });
                        return [4 /*yield*/, Promise.all(pending_searches)];
                    case 1:
                        results = _a.sent();
                        console.log(results);
                        results.forEach(function (result) {
                            var line = result.term + " | " + (result.LE || 'Not Found :(') + " | " + (result.SE || 'Not Found :(') + "\n";
                            reply += line;
                        });
                        reply += "\n\n---\n\n^(I'm a bot |) ^[source](https://github.com/RallerenP/modsearchbot) ^(| For bugs, questions and suggestions, please file an issue on github)\n";
                        item.reply(reply);
                        return [2 /*return*/];
                }
            });
        });
    };
    SkyrimHandler.prototype.search = function (search) {
        return __awaiter(this, void 0, void 0, function () {
            var cleaned_search, cleaned_search_term, le_response, se_response, le_result, se_result, le_found, se_found;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleaned_search = search
                            .substring(2, search.length - 2)
                            .trim();
                        cleaned_search_term = cleaned_search
                            .split(' ')
                            .join(',');
                        return [4 /*yield*/, node_fetch_1["default"]("https://search.nexusmods.com/mods?terms=" + cleaned_search_term + "&game_id=110&blocked_tags=&blocked_authors=&include_adult=1")];
                    case 1:
                        le_response = _a.sent();
                        return [4 /*yield*/, node_fetch_1["default"]("https://search.nexusmods.com/mods?terms=" + cleaned_search_term + "&game_id=1704&blocked_tags=&blocked_authors=&include_adult=1")];
                    case 2:
                        se_response = _a.sent();
                        return [4 /*yield*/, le_response.json()];
                    case 3:
                        le_result = _a.sent();
                        return [4 /*yield*/, se_response.json()];
                    case 4:
                        se_result = _a.sent();
                        le_found = null;
                        se_found = null;
                        if (le_result.total > 0) {
                            le_found = "[" + le_result.results[0].name + "](https://www.nexusmods.com/skyrim/mods/" + le_result.results[0].mod_id + ")";
                        }
                        if (se_result.total) {
                            se_found = "[" + se_result.results[0].name + "](https://www.nexusmods.com/skyrimspecialedition/mods/" + se_result.results[0].mod_id + ")";
                        }
                        return [2 /*return*/, {
                                term: cleaned_search + " ^^[LE](https://www.nexusmods.com/skyrim/search/?gsearch=" + cleaned_search.split(' ').join('+') + "&gsearchtype=mods) ^^& ^^[SE](https://www.nexusmods.com/skyrimspecialedition/search/?gsearch=" + cleaned_search.split(' ').join('+') + "&gsearchtype=mods)",
                                LE: le_found,
                                SE: se_found
                            }];
                }
            });
        });
    };
    return SkyrimHandler;
}());
exports["default"] = SkyrimHandler;
