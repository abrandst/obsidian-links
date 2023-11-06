import { IObsidianLinksSettings } from "settings";
import { IObsidianProxy } from "./IObsidianProxy";
import { ICommand } from "./ICommand";
import { UnlinkLinkCommand } from "./UnlinkLinkCommand";
import { DeleteLinkCommand } from "./DeleteLinkCommand";
import { ConvertLinkToMdlinkCommand } from "./ConvertLinkToMdlinkCommand";
import { ConvertLinkToWikilinkCommand } from "./ConvertLinkToWikilinkCommand";
import { ConvertLinkToAutolinkCommand } from "./ConvertLinkToAutolinkCommand";
import { CopyLinkDestinationToClipboardCommand } from "./CopyLinkDestinationToClipboardCommand";
import { RemoveLinksFromHeadingsCommand } from "./RemoveLinksFromHeadingsCommand";
import { EditLinkTextCommand } from "./EditLinkTextCommand";
import { SetLinkTextCommand } from "./SetLinkTextCommand";
import { EditLinkDestinationCommand } from "./EditLinkDestinationCommand";
import { CreateLinkFromSelectionCommand } from "./CreateLinkFromSelectionCommand";
import { CreateLinkFromClipboardCommand } from "./CreateLinkFromClipboardCommand";
import { EmbedLinkCommand } from "./EmbedLinkCommand";
import { UnembedLinkCommand } from "./UnembedLinkCommand";
import { ConvertAllLinksToMdlinksCommand } from "./ConvertAllLinksToMdlinksCommand";
import { ConvertWikilinksToMdlinksCommand } from "./ConvertWikilinksToMdlinksCommand";
import { ConvertAutolinksToMdlinksCommand } from "./ConvertAutolinksToMdlinksCommand";


var commands: Map<string, ICommand> = new Map<string, ICommand>();

function createCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings) {
    if (commands.size > 0) {
        return;
    }
    commands.set(UnlinkLinkCommand.name, new UnlinkLinkCommand(() => settings.contexMenu.unlink));
    commands.set(DeleteLinkCommand.name, new DeleteLinkCommand(() => settings.contexMenu.deleteLink));
    commands.set(ConvertLinkToMdlinkCommand.name, new ConvertLinkToMdlinkCommand(obsidianProxy, () => settings.contexMenu.convertToMakrdownLink));
    commands.set(ConvertLinkToWikilinkCommand.name, new ConvertLinkToWikilinkCommand(() => settings.contexMenu.convertToWikilink));
    commands.set(ConvertLinkToAutolinkCommand.name, new ConvertLinkToAutolinkCommand(() => settings.contexMenu.convertToAutolink));
    commands.set(CopyLinkDestinationToClipboardCommand.name,
        new CopyLinkDestinationToClipboardCommand(obsidianProxy, () => settings.contexMenu.copyLinkDestination));
    const options = {
        get internalWikilinkWithoutTextAction() {
            return settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction;
        }
    };
    commands.set(RemoveLinksFromHeadingsCommand.name, new RemoveLinksFromHeadingsCommand(options));
    commands.set(EditLinkTextCommand.name, new EditLinkTextCommand(() => settings.contexMenu.editLinkText));
    commands.set(SetLinkTextCommand.name, new SetLinkTextCommand(obsidianProxy, () => settings.contexMenu.setLinkText));
    commands.set(EditLinkDestinationCommand.name, new EditLinkDestinationCommand(() => settings.contexMenu.editLinkDestination));
    commands.set(CreateLinkFromSelectionCommand.name, new CreateLinkFromSelectionCommand(() => settings.contexMenu.createLink));
    commands.set(CreateLinkFromClipboardCommand.name, new CreateLinkFromClipboardCommand(obsidianProxy, () => settings.contexMenu.createLinkFromClipboard));
    commands.set(EmbedLinkCommand.name, new EmbedLinkCommand(() => settings.contexMenu.embedUnembedLink));
    commands.set(UnembedLinkCommand.name, new UnembedLinkCommand(() => settings.contexMenu.embedUnembedLink));
    commands.set(ConvertAllLinksToMdlinksCommand.name,
        new ConvertAllLinksToMdlinksCommand(obsidianProxy, () => false,
            () => settings.ffMultipleLinkConversion));
    commands.set(ConvertWikilinksToMdlinksCommand.name,
        new ConvertWikilinksToMdlinksCommand(obsidianProxy, () => false,
            () => settings.ffMultipleLinkConversion));
    commands.set(ConvertAutolinksToMdlinksCommand.name,
        new ConvertAutolinksToMdlinksCommand(obsidianProxy, () => false,
            () => settings.ffMultipleLinkConversion));
}

export function getPaletteCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings): ICommand[] {
    createCommands(obsidianProxy, settings);
    return Array.from(commands.values());
}

export function getContextMenuCommands(obsidianProxy: IObsidianProxy, settings: IObsidianLinksSettings): (ICommand | null)[] {
    createCommands(obsidianProxy, settings);

    const commandNames = [
        null,
        EditLinkTextCommand.name,
        SetLinkTextCommand.name,
        EditLinkDestinationCommand.name,
        CopyLinkDestinationToClipboardCommand.name,
        null,
        UnlinkLinkCommand.name,
        null,
        ConvertLinkToWikilinkCommand.name,
        ConvertLinkToAutolinkCommand.name,
        ConvertLinkToMdlinkCommand.name,
        UnembedLinkCommand.name,
        EmbedLinkCommand.name,
        DeleteLinkCommand.name,
        null,
        CreateLinkFromSelectionCommand.name,
        CreateLinkFromClipboardCommand.name,
    ];

    let contextMenuCommands = [];
    for (const cmdName of commandNames) {
        if (cmdName == null) {
            contextMenuCommands.push(null);
            continue;
        }
        const cmd = commands.get(cmdName);
        if (cmd && cmd.isEnabled() && cmd.isPresentInContextMenu()) {
            contextMenuCommands.push(cmd);
        }
    }

    return contextMenuCommands;
}