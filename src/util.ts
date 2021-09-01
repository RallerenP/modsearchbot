export const getDefaultFooter = () => {
    return `

---

^(I'm a bot |) [^(source code)](https://github.com/RallerenP/modsearchbot) ^| [^(about modsearchbot)](https://reddit.com/user/RallerenP/comments/pg2lqj/modsearchbot_about/) ^| [^(bing sources)](https://reddit.com/user/RallerenP/comments/pg2l0g/modsearchbot_bing_search/)
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
