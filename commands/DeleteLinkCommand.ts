import { Editor, TFile } from "obsidian";
import { CommandBase, Func } from "./ICommand"
import { LinkData, findLink, isAbsoluteFilePath, isAbsoluteUri } from "../utils";
import { IObsidianProxy } from "./IObsidianProxy";
import parseFilepath from "parse-filepath";
import { ButtonInfo } from "../ui/PromotModal.common";

export class DeleteLinkCommand extends CommandBase {

	obsidianProxy: IObsidianProxy;

	constructor(obsidianProxy: IObsidianProxy, isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
		super(isPresentInContextMenu, isEnabled);

		this.obsidianProxy = obsidianProxy;

		this.isPresentInContextMenu = () => this.obsidianProxy.settings.contexMenu.deleteLink;

		this.id = 'editor-delete-link';
		this.displayNameCommand = 'Delete link';
		this.displayNameContextMenu = 'Delete';
		this.icon = 'trash-2';
	}

	handler(editor: Editor, checking: boolean): boolean | void {
		if (checking && !this.isEnabled()) {
			return false;
		}

		const text = editor.getValue();
		const cursorOffset = editor.posToOffset(editor.getCursor('from'));
		const linkData = findLink(text, cursorOffset, cursorOffset);
		if (checking) {
			return !!linkData;
		}
		if (linkData) {
			this.deleteLink(linkData, editor);
		}
	}

	deleteLink(linkData: LinkData, editor: Editor) {
		//TODO: draft!

		const destination = linkData.destination?.content;
		try {
			if (this.obsidianProxy.settings.ffDeleteUnreferencedLinkTarget
				&& this.obsidianProxy.settings.deleteOrphanedLinkTargetOnDeleteLink
				&& destination !== undefined
				&& !isAbsoluteUri(destination)
				&& !isAbsoluteFilePath(destination)) {
				const hashIdx = destination.indexOf('#');
				if (hashIdx == 0) {
					return;
				}

				const filePath = hashIdx > 0 ? destination.substring(0, hashIdx) : destination;
				let file = this.obsidianProxy.Vault.getAbstractFileByPath(filePath) as TFile;
				if (!file) {
					const path = parseFilepath(filePath);
					if (path.ext === '') {
						file = this.obsidianProxy.Vault.getAbstractFileByPath(filePath + '.md') as TFile;
					}
				}
				if (!file) {
					return;
				}
				const cache = this.obsidianProxy.Vault.getBacklinksForFileByPath(file);
				if (!cache) {
					return;
				}
				const backlinks = Object.keys(cache);
				if (backlinks.length != 1
					|| (backlinks.length === 1 && cache[backlinks[0]].length > 1)) {
					return;
				}
				this.obsidianProxy.showPromptModal(
					"Delete file",
					[
						`The file "${filePath}" is no longer referenced by any note.`,
						"Do you want to delete it?"
					],
					[
						new ButtonInfo('Yes', 'Yes', true, true),
						new ButtonInfo('No', 'No')
					],
					(result) => {
						if (result === 'Yes') {
							this.obsidianProxy.Vault.delete(file);
						}
					});
			}
		}
		finally {
			editor.replaceRange(
				'',
				editor.offsetToPos(linkData.position.start),
				editor.offsetToPos(linkData.position.end));
		}
	}
}