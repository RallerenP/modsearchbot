export const getDefaultFooter = () => {
    return `

---

^(I'm a bot |) [^(source code)](https://github.com/RallerenP/modsearchbot) ^| [^(about modsearchbot)](https://reddit.com/user/RallerenP/comments/pg2lqj/modsearchbot_about/) ^| [^(bing sources)](https://reddit.com/user/RallerenP/comments/pg2l0g/modsearchbot_bing_search/) ^| ^(Some mods might be falsely classified as SFW or NSFW. Classifications are provided by each source.)
`
}

export const getDefaultNSFWWarning = () => {
    return `
I also found some potentially **NSFW** links, (but this post isn't marked NSFW).

If I didn't find what you were looking for above, please look below. (Just click the black boxes!)


`
}

export function truncate(text: string, length: number) {
    if (text.length > length) return text.substring(0, length);
    else return text;
}

export function repeat(text: string, times: number) {
    let str = ""

    for (let i = 0; i < times; i++) {
        str += text;
    }

    return str;
}
