import { Editor, MarkdownView, Notice, Plugin, requestUrl } from 'obsidian';
import { findLink, replaceAllHtmlLinks, LinkTypes, LinkData, removeHtmlLinksFromHeadings, getPageTitle, getFileName, replaceMarkdownTarget } from './utils';
import { ReplaceLinkModal } from 'ui/ReplaceLinkModal';

interface ObsidianLinksinSettings {
	linkReplacements: { source: string, target: string }[];
}

const DEFAULT_SETTINGS: ObsidianLinksinSettings = {
	linkReplacements: []
}

export default class ObsidianLinksPlugin extends Plugin {
	settings: ObsidianLinksinSettings;

	generateLinkTextOnEdit = true;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'links-editor-remove-link',
			name: 'Remove link',
			editorCallback: (editor: Editor, view: MarkdownView) => this.removeLinkUnderCursor(editor, view)
		});

		this.addCommand({
			id: 'links-editor-convert-link-to-mdlink',
			name: 'Convert link to Markdown link',
			editorCallback: (editor: Editor, view: MarkdownView) => this.convertSelectedLinkToMarkdownLink(editor, view)
		});

		this.addCommand({
			id: 'links-editor-copy-link-to-clipboard',
			name: 'Copy link to clipboard',
			editorCallback: (editor: Editor, view: MarkdownView) => this.copyLinkToClipboard(editor, view)
		});

		this.addCommand({
			id: 'links-editor-convert-link-to-wikilink',
			name: 'Convert link to Wikilink',
			editorCallback: (editor: Editor, view: MarkdownView) => this.convertSelectedLinkToWikilink(editor, view)
		});

		this.addCommand({
			id: 'links-editor-remove-links-from-headings',
			name: 'Remove links from headings',
			editorCallback: (editor: Editor, view: MarkdownView) => this.removeLinksFromHeadings(editor, view)
		});

		this.addCommand({
			id: 'links-editor-edit-link-text',
			name: 'Edit link text',
			editorCallback: (editor: Editor, view: MarkdownView) => this.editLinkTextUnderCursor(editor)
		});

		this.addCommand({
			id: 'links-editor-add-link-text',
			name: 'Add link text',
			editorCallback: (editor: Editor, view: MarkdownView) => this.addLinkTextUnderCursor(editor)
		});

		this.addCommand({
			id: 'links-editor-replace-external-link-with-internal',
			name: 'Replace link',
			editorCallback: (editor: Editor, view: MarkdownView) => this.replaceExternalLinkUnderCursor(editor)
		});

		this.addCommand({
			id: 'links-editor-replace-markdown-targets-in-note',
			name: '#delete Replace markdown link in notes',
			editorCallback: (editor: Editor, view: MarkdownView) => this.replaceMarkdownTargetsInNote()
		});

		// this.registerEvent(
		// 	this.app.workspace.on("file-open", this.convertHtmlLinksToMdLinks)
		// )

		this.registerEvent(
			this.app.workspace.on("file-open",  (file) => this.replaceMarkdownTargetsInNote())
		)

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const linkData = this.getLink(editor);
				if (!linkData) {
					return;
				}
				if (linkData.type == LinkTypes.Markdown) {
					menu.addItem((item) => {
						item
							.setTitle("Convert to wikilink")
							.setIcon("rotate-cw")
							.onClick(async () => {
								this.convertLinkToWikiLink(linkData, editor);
							});
					});

					menu.addItem((item) => {
						item
							.setTitle("Replace link")
							.setIcon("pencil")
							.onClick(async () => {
								this.replaceExternalLink(linkData, editor);
							});
					});
				} else {
					menu.addItem((item) => {
						item
							.setTitle("Convert to markdown link")
							.setIcon("rotate-cw")
							.onClick(async () => {
								this.convertLinkToMarkdownLink(linkData, editor);
							});
					});
				}
				menu.addItem((item) => {
					item
						.setTitle("Remove link")
						.setIcon("trash-2")
						.onClick(async () => {
							this.removeLink(linkData, editor);
						});
				});
				if (linkData.text) {
					menu.addItem((item) => {
						item
							.setTitle("Edit link text")
							.setIcon("text-cursor-input")
							.onClick(async () => {
								this.editLinkText(linkData, editor);
							});
					});
				} else if (linkData.link) {
					menu.addItem((item) => {
						item
							.setTitle("Add link text")
							.setIcon("text-cursor-input")
							.onClick(async () => {
								this.addLinkText(linkData, editor);
							});
					});
				}

			})
		);
	}
	

	onunload() {

	}

	async loadSettings() {
		console.log("settings loaded");
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		console.log("settings saved");
		console.log(this.settings);
	}

	getLink(editor: Editor): LinkData | undefined {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		return findLink(text, cursorOffset, cursorOffset);
	}

	removeLinkUnderCursor(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (linkData) {
			this.removeLink(linkData, editor);
		}
	}

	removeLink(linkData: LinkData, editor: Editor) {
		let text = linkData.text ? linkData.text.content : "";
		if (linkData.type === LinkTypes.Wiki && !text) {
			text = linkData.link ? linkData.link.content : "";
		}
		editor.replaceRange(
			text,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	convertSelectedLinkToMarkdownLink(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Wiki | LinkTypes.Html);
		if (linkData) {
			this.convertLinkToMarkdownLink(linkData, editor);
		}
	}

	convertLinkToMarkdownLink(linkData: LinkData, editor: Editor) {
		let text = linkData.text ? linkData.text.content : "";
		const link = linkData.link ? linkData.link.content : "";

		if (linkData.type === LinkTypes.Wiki && !text) {
			text = link;
		}

		editor.replaceRange(
			`[${text}](${link ? encodeURI(link) : ""})`,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	convertSelectedLinkToWikilink(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset, LinkTypes.Markdown | LinkTypes.Html);
		if (linkData) {
			this.convertLinkToWikiLink(linkData, editor);
		}
	}

	convertLinkToWikiLink(linkData: LinkData, editor: Editor) {
		const link = linkData.type === LinkTypes.Markdown ? (linkData.link ? decodeURI(linkData.link.content) : "") : linkData.link;
		const text = linkData.text ? (linkData.text.content !== link ? "|" + linkData.text.content : "") : "";
		editor.replaceRange(
			`[[${link}${text}]]`,
			editor.offsetToPos(linkData.position.start),
			editor.offsetToPos(linkData.position.end));
	}

	copyLinkToClipboard(editor: Editor, view: MarkdownView) {
		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (linkData) {
			navigator.clipboard.writeText(linkData.content);
		}
	}

	convertHtmlLinksToMdLinks = () => {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (mdView && mdView.getViewData()) {
			const text = mdView.getViewData();
			const result = replaceAllHtmlLinks(text)
			mdView.setViewData(result, false);
		}
	}

	removeLinksFromHeadings(editor: Editor, view: MarkdownView) {
		const selection = editor.getSelection();

		if (selection) {
			const result = removeHtmlLinksFromHeadings(selection);
			editor.replaceSelection(result);
		} else {
			const text = editor.getValue();
			if (text) {
				const result = removeHtmlLinksFromHeadings(text);
				editor.setValue(result);
			}
		}
	}

	editLinkTextUnderCursor(editor: Editor) {
		const linkData = this.getLink(editor);
		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.editLinkText(linkData, editor);
			}, 500);
		}
	}

	editLinkText(linkData: LinkData, editor: Editor) {
		if (linkData.text) {
			const start = linkData.position.start + linkData.text.position.start;
			const end = linkData.position.start + linkData.text.position.end;
			editor.setSelection(editor.offsetToPos(start), editor.offsetToPos(end));
		} else if (this.generateLinkTextOnEdit) {
			//TODO: 
		}
	}

	async addLinkText(linkData: LinkData, editor: Editor) {
		if (!linkData.link || (linkData.text && linkData.text.content !== "")) {
			return;
		}

		if (linkData.type == LinkTypes.Wiki) {
			const text = getFileName(linkData.link?.content);
			let textStart = linkData.position.start + linkData.link?.position.end;
			editor.setSelection(editor.offsetToPos(textStart));
			editor.replaceSelection("|" + text);
			textStart++;
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		} else if (linkData.type == LinkTypes.Markdown) {
			const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
			let text = "";
			if (urlRegEx.test(linkData.link.content)) {
				const notice = new Notice("Getting title ...", 0);
				try {
					text = await getPageTitle(new URL(linkData.link.content), this.getPageText);
				}
				catch (error) {
					new Notice(error);
				}
				finally {
					notice.hide();
				}
			} else {
				text = getFileName(decodeURI(linkData.link?.content));
			}
			const textStart = linkData.position.start + 1;
			editor.setSelection(editor.offsetToPos(textStart));
			editor.replaceSelection(text);
			editor.setSelection(editor.offsetToPos(textStart), editor.offsetToPos(textStart + text.length));
		}
	}

	addLinkTextUnderCursor(editor: Editor) {
		const linkData = this.getLink(editor);
		if (linkData) {
			// workaround: if executed from command palette, whole link is selected.
			// with timeout, only specified region is selected.
			setTimeout(() => {
				this.addLinkText(linkData, editor);
			}, 500);
		}
	}

	async getPageText(url: URL): Promise<string> {
		const response = await requestUrl({ url: url.toString() });
		if (response.status !== 200) {
			throw new Error(`Failed to request '${url}': ${response.status}`);
		}
		return response.text;
	}

	replaceExternalLinkUnderCursor(editor: Editor) {
		const linkData = this.getLink(editor);
		if (linkData) {
			this.replaceExternalLink(linkData, editor);
		}
	}

	replaceExternalLink(linkData: LinkData, editor: Editor) {
		new ReplaceLinkModal(this.app, async (linkInfo) => {
			if (linkInfo) {
				new Notice(linkInfo.path);
				this.settings.linkReplacements.push({
					source: linkData.link!.content,
					target: linkInfo.path
				})
				await this.saveSettings();
				this.replaceMarkdownTargetsInNote();
			}
		}).open();
	}

	escapeRegex(str: string) : string {
		return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	replaceMarkdownTargetsInNote() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (mdView && mdView.getViewData()) {
			const text = mdView.getViewData();
			const [result, count] = this.replaceInputString(text)
			if (count) {
				mdView.setViewData(result, false);
				new Notice(`Links: ${count} items replaced.`);
			}
		}
	}

	replaceInputString(text: string): [string, number] {
		let targetText = text;
		let totalCount = 0;
		this.settings.linkReplacements.forEach(e => {
			const [newText, count] = replaceMarkdownTarget(targetText, e.source, e.target);
			targetText = newText;
			totalCount += count;
		});
		return [targetText, totalCount];
	}

}
