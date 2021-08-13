export const getDefaultFooter = () => {
    return `

---

^(I'm a bot |) ^[source](https://github.com/RallerenP/modsearchbot) ^(| For bugs, questions and suggestions, please file an issue on github)
`
}

export function truncate(text: string, length: number) {
    if (text.length > length) return text.substring(0, length);
    else return text;
}
