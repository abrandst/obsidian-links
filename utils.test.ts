import exp from 'constants';
import { findLink, findHtmlLink, replaceAllHtmlLinks, removeLinksFromHeadings, LinkTypes, getPageTitle, replaceMarkdownTarget, HasLinksInHeadings, HasLinks, removeLinks } from './utils';
import { expect, test } from '@jest/globals';


test.each([
    // markdown
    {
        name: "md link: cursor on text",
        input: "Incididunt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
        cursorPos: "Incididunt [do".length,
        linkType: LinkTypes.Markdown,
        linkText: "[dolore](http://dolore.com)",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt [dolore](http://dolore.com)".length,
        text: "dolore",
        textStart: "[".length,
        textEnd: "[dolore".length,
        target: "http://dolore.com",
        targetStart: "[dolore](".length,
        targetEnd: "[dolore](http://dolore.com".length
    },
    {
        name: "md link: cursor on target",
        input: "Incididunt [dolore](http://dolore.com) ullamco [sunt](https://sunt.com) ullamco non.",
        cursorPos: "Incididunt [dolore](htt".length,
        linkType: LinkTypes.Markdown,
        linkText: "[dolore](http://dolore.com)",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt [dolore](http://dolore.com)".length,
        text: "dolore",
        textStart: "[".length,
        textEnd: "[dolore".length,
        target: "http://dolore.com",
        targetStart: "[dolore](".length,
        targetEnd: "[dolore](http://dolore.com".length
    },

    // html
    {
        name: "html link: cursor on text",
        input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco sunt ullamco non.",
        cursorPos: "Incididunt <a href=\"http://dolore.com\">dol".length,
        linkType: LinkTypes.Html,
        linkText: "<a href=\"http://dolore.com\">dolore</a>",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt <a href=\"http://dolore.com\">dolore</a>".length,
        text: "dolore",
        textStart: "<a href=\"http://dolore.com\">".length,
        textEnd: "<a href=\"http://dolore.com\">dolore".length,
        target: "http://dolore.com",
        targetStart: "<a href=\"".length,
        targetEnd: "<a href=\"http://dolore.com".length
    },

    // wiki
    {
        name: "wikilink: cursor on destination",
        input: "Incididunt [[dolore]] ullamco [[sunt]] ullamco non.",
        cursorPos: "Incididunt [[dol".length,
        linkType: LinkTypes.Wiki,
        linkText: "[[dolore]]",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt [[dolore]]".length,
        text: undefined,
        textStart: undefined,
        textEnd: undefined,
        target: "dolore",
        targetStart: "[[".length,
        targetEnd: "[[dolore".length
    },
    {
        name: "wikilink with text: cursor on text",
        input: "Incididunt [[dolore|dolore text]] ullamco [[sunt]] ullamco non.",
        cursorPos: "Incididunt [[dolore|dol".length,
        linkType: LinkTypes.Wiki,
        linkText: "[[dolore|dolore text]]",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt [[dolore|dolore text]]".length,
        text: "dolore text",
        textStart: "[[dolore|".length,
        textEnd: "[[dolore|dolore text".length,
        target: "dolore",
        targetStart: "[[".length,
        targetEnd: "[[dolore".length
    },
    {
        name: "wikilink with empty text: cursor after |",
        input: "Incididunt [[dolore|]] ullamco [[sunt]] ullamco non.",
        cursorPos: "Incididunt [[dolore|".length,
        linkType: LinkTypes.Wiki,
        linkText: "[[dolore|]]",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt [[dolore|]]".length,
        text: "",
        textStart: "[[dolore|".length,
        textEnd: "[[dolore|".length,
        target: "dolore",
        targetStart: "[[".length,
        targetEnd: "[[dolore".length
    }
])('findLink: $# $name', ({ name, input, cursorPos, linkType, linkText, linkStart, linkEnd,
    text, textStart, textEnd, target, targetStart, targetEnd }) => {
    const result = findLink(input, cursorPos, cursorPos);
    expect(result).toBeDefined();
    expect(result?.type).toBe(linkType);
    expect(result?.content).toBe(linkText);
    expect(result?.position.start).toBe(linkStart);
    expect(result?.position.end).toBe(linkEnd);
    if (text !== undefined) {
        expect(result?.text?.content).toBe(text);
        expect(result!.text!.position.start).toBe(textStart);
        expect(result!.text!.position.end).toBe(textEnd);
    } else {
        expect(result?.text).toBeUndefined();
    }
    if (target) {
        expect(result?.link?.content).toBe(target);
        expect(result!.link!.position.start).toBe(targetStart);
        expect(result!.link!.position.end).toBe(targetEnd);
    }
    else {
        expect(result?.link).toBeUndefined();
    }
});

test.each([
    {
        name: "cursor on text",
        input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco sunt ullamco non.",
        cursorPos: "Incididunt <a href=\"http://dolore.com\">dol".length,
        linkText: "<a href=\"http://dolore.com\">dolore</a>",
        linkStart: "Incididunt ".length,
        linkEnd: "Incididunt <a href=\"http://dolore.com\">dolore</a>".length,
        text: "dolore",
        textStart: "<a href=\"http://dolore.com\">".length,
        textEnd: "<a href=\"http://dolore.com\">dolore".length,
        target: "http://dolore.com",
        targetStart: "<a href=\"".length,
        targetEnd: "<a href=\"http://dolore.com".length
    }
])('findHtmlLink: $# html link [$name]', ({ name, input, cursorPos, linkText, linkStart, linkEnd,
    text, textStart, textEnd, target, targetStart, targetEnd }) => {
    const result = findHtmlLink(input, cursorPos, cursorPos);
    expect(result).toBeDefined();
    expect(result?.content).toBe(linkText);
    expect(result?.position.start).toBe(linkStart);
    expect(result?.position.end).toBe(linkEnd);
    expect(result?.text?.content).toBe(text);
    expect(result!.text!.position.start).toBe(textStart);
    expect(result!.text!.position.end).toBe(textEnd);
    expect(result?.link?.content).toBe(target);
    expect(result!.link!.position.start).toBe(targetStart);
    expect(result!.link!.position.end).toBe(targetEnd);
});

test.each([
    {
        name: "standard links",
        input: "Incididunt <a href=\"http://dolore.com\">dolore</a> ullamco <a href=\"http://sunt.com\">sunt</a> ullamco non.",
        expected: "Incididunt [dolore](http://dolore.com) ullamco [sunt](http://sunt.com) ullamco non."
    }
])('replaceAllHtmlLinks: $# convert html links to markdown [$name]', ({ name, input, expected }) => {
    const result = replaceAllHtmlLinks(input);
    expect(result).toBe(expected);
});

test.each([
    {
        name: "wiki, markdown, html links",
        input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
            "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
            "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
            "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
            " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
            "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
            "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
            "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
            "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
            "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
            " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
            "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
            "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n"
    },
    {
        name: "headings without links",
        input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
        "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
        "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
        "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
        " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
        "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
        "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        expected: null
    }
])('HasLinksInHeadings: $# check & remove links from headings [$name]', ({ name, input, expected }) => {

    const hasLinks = HasLinksInHeadings(input);
    if(expected){
        expect(hasLinks).toBeTruthy();
        const result = removeLinksFromHeadings(input);
        expect(result).toBe(expected);
    } else{
        expect(hasLinks).toBeFalsy();
    }
});

test.only.each([
    {
        name: "text without links",
        input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
        "# Aute [[officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
        "sit consequat ]] mollit. Duis cupidatat minim </a> commodo <a>exercitation labore qui non qui eiusmod labore \n" +
        "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est [ipsum] culpa (nulla) eu nulla culpa ullamco.\r\n" +
        " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
        "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
        "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        expected: null
    },
    {
        name: "wiki, markdown, html links",
        input: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
            "# Aute officia [do eu](ea sit aute). Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
            "sit consequat mollit. [Duis](duis) cupidatat minim [[commodo]] exercitation [[lkjf0934|labore qui]] non qui eiusmod labore \n" +
            "## [[amet mollit velit|Duis cupidatat]]. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
            " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
            "Et magna velit <a href=\"http://hi.com\">adipisicing</a> non exercitation commodo officia in sunt aliquip.\n" +
            "## <a href=\"google.com\">amet mollit velit1</a>. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n",
        expected: "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip. \r\n" +
            "# Aute officia do eu. Dolore eiusmod aliqua non esse ut laborum adipisicing sit\n" +
            "sit consequat mollit. Duis cupidatat minim commodo exercitation labore qui non qui eiusmod labore \n" +
            "## Duis cupidatat. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\r\n" +
            " Ut aliquip qui eu nulla Lorem elit aliqua.\n" +
            "Et magna velit adipisicing non exercitation commodo officia in sunt aliquip.\n" +
            "## amet mollit velit1. Velit dolor non ut occaecat eiusmod est ipsum culpa nulla eu nulla culpa ullamco.\n"
    }
    
])('HasLinks/RemoveLinks: $# check & remove links from headings [$name]', ({ name, input, expected }) => {

    console.log(input);
    const hasLinks = HasLinks(input);
    if(expected){
        expect(hasLinks).toBeTruthy();
        const result = removeLinks(input);
        console.log('____________________________________________________________________________');
        console.log(result);
        console.log('____________________________________________________________________________');
        console.log(expected);
        expect(result).toBe(expected);
    } else{
        expect(hasLinks).toBeFalsy();
    }
});

test.each([
    {
        name: "simple page",
        url: "https://simple-page.com",
        pageText: `
<!DOCTYPE html>
<html>
<head>
  <title>Simple page</title>
</head>
<body>
</body>
</html>`,
        expected: "Simple page"
    }

])("getPageTitle: $# get page title [$name]", async ({ name, url, pageText, expected }) => {
    const result = await getPageTitle(new URL(url), async (url: URL) => Promise.resolve(pageText));
    expect(result).toBe(expected);
})


test.each([
    {
        name: "markddown with http urls",
        target: "http://link1.com",
        newtarget: "link 1 page",
        input: "Dolore qui elit cillum ex. [link1 text 1](http://link1.com) Veniam veniam est sit cillum tempor in nostrud ad. Cillum ex irure ipsum [link1 text 2](http://link1.com) et esse aliquip minim. Elit ullamco qui laboris reprehenderit. Reprehenderit incididunt nulla cupidatat id enim nisi dolor nulla id do mollit.",
        expected: "Dolore qui elit cillum ex. [link1 text 1](link%201%20page) Veniam veniam est sit cillum tempor in nostrud ad. Cillum ex irure ipsum [link1 text 2](link%201%20page) et esse aliquip minim. Elit ullamco qui laboris reprehenderit. Reprehenderit incididunt nulla cupidatat id enim nisi dolor nulla id do mollit."
    }
])("$# replace markdown target [$name]", ({name, target, newtarget, input, expected}) => {
    const [output, count] = replaceMarkdownTarget(input, target, newtarget);
    expect(count).toBe(2);
    expect(output).toBe(expected);
});