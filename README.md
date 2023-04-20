# Obsidian Links

Manipulate links in Obsidian (https://obsidian.md).

- [Obsidian Links](#obsidian-links)
- [Features](#features)
  - [Remove link](#remove-link)
  - [Convert link to markdown link](#convert-link-to-markdown-link)
  - [Convert markdown link to Wikilink](#convert-markdown-link-to-wikilink)
  - [Copy link to clipboard](#copy-link-to-clipboard)
  - [Remove links from headings](#remove-links-from-headings)
  - [Edit link text](#edit-link-text)
  - [Add link text](#add-link-text)
  - [Create link from selection](#create-link-from-selection)


# Features

## Remove link

- Command palette: **Remove link**
- Context menu: **Remove link**
<details>
<summary>Demo</summary>

![remove link](docs/img/remove-link.gif)

</details>


## Convert link to markdown link

Convert Wikilink or HTML link to markdown link. (With HTML link works only if link is expanded)

- Command palette: **Convert link to markdown link**
- Context menu: **Convert to markdown link**

<details>
<summary>Demo</summary>

![convert to markdown link](docs/img/convert-to-markdown-link.gif)

</details>



## Convert markdown link to Wikilink
- Command palette: **Convert link to wikilink**
- Context menu: **Convert to wikilink**


<details>
<summary>Demo</summary>

![convert to markdown link](docs/img/convert-to-wikilink.gif)

</details>


## Copy link to clipboard

Copy link part of markdown, wiki or html link to clipboard.

- Command palette: **Copy link clipboard**

## Remove links from headings

Remove links from headings in selection or in an entier note.

- Command palette:  **Remove links from headings**

<details>
<summary>Demo</summary>

![convert to markdown link](docs/img/remove-links-from-headings.gif)

</details>

## Edit link text

Select link text and place cursor at the end of the text

- Command palette: **Edit link text**
- Context menu: **Edit link text**

<details>
<summary>Demo</summary>

![convert to markdown link](docs/img/edit-link-text.gif)

</details>

## Add link text
Add link text, select it and place cursor at the end of the text. 
Link text depends on the kind of a link. 
For local notes text will be either file name of the note or popup with suggested link texts. Title separator can be specified in setting. 
For external http[s] links, page content is requested and link text is set to the title (content of `<title/>` element) of the page.


- Command palette: **Add link text**
- Context menu: **Add link text**


<details>
<summary>Demo. Link to local note</summary>

![convert to markdown link](docs/img/add-link-text-local.gif)

</details>

<details>
<summary>Demo. Link to a heading in local note</summary>

![convert to markdown link](docs/img/add-link-text-local-heading.gif)

</details>

<details>
<summary>Demo. External link</summary>

![convert to markdown link](docs/img/add-link-text-external.gif)

</details>

## Create link from selection
Create wiki link from selected text.

- Command palette: **Create link from selection**
- Context menu: **Create link**


<details>
<summary>Demo</summary>

![convert to markdown link](docs/img/create-wikilink-from-selection.gif)

</details>

