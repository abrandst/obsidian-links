import { IObsidianLinksSettings } from "settings";
import { LinkData, InternalWikilinkWithoutTextAction } from "../utils";
import { IVault } from "IVault";
import { App } from "obsidian";
import { ButtonInfo } from "ui/PromotModal.common";
import { IUiFactory } from "ui/IUiFactory";

export class Notice {
    noticeEl: HTMLElement;

    setMessage(message: string | DocumentFragment): this {
        throw new Error('Method not implemented.');
    }
    hide(): void {
        throw new Error('Method not implemented.');
    }
}

export interface RequestUrlParam {
    /** @public */
    url: string;
    /** @public */
    method?: string;
    /** @public */
    contentType?: string;
    /** @public */
    body?: string | ArrayBuffer;
    /** @public */
    headers?: Record<string, string>;
    /**
     * Whether to throw an error when the status code is >= 400
     * Defaults to true
     * @public
     */
    throw?: boolean;
}

export interface RequestUrlResponse {
    /** @public */
    status: number;
    /** @public */
    headers: Record<string, string>;
    /** @public */
    arrayBuffer: ArrayBuffer;
    /** @public */
    json: any;
    /** @public */
    text: string;
}

export interface RequestUrlResponsePromise extends Promise<RequestUrlResponse> {
    /** @public */
    arrayBuffer: Promise<ArrayBuffer>;
    /** @public */
    json: Promise<any>;
    /** @public */
    text: Promise<string>;
}

export class ObsidianProxyMock {

    app: App;

    __mocks: {
        NoticeMock: {
            setMessage: jest.Mock
            hide: jest.Mock
        }
        requestUrlMock: jest.Mock
        clipboardWriteText: jest.Mock
        clipboardReadText: jest.Mock
        createNotice: jest.Mock
        linkTextSuggestContextSetLinkData: jest.Mock
        showPromptModal: jest.Mock

    } = {
            NoticeMock: {
                setMessage: jest.fn(),
                hide: jest.fn()
            },
            requestUrlMock: jest.fn(),
            clipboardWriteText: jest.fn(),
            clipboardReadText: jest.fn(),
            createNotice: jest.fn(),
            linkTextSuggestContextSetLinkData: jest.fn(),
            showPromptModal: jest.fn()
        }

    Vault: IVault;
    uiFactory: IUiFactory;

    settings: IObsidianLinksSettings = {
        linkReplacements: [],
        titleSeparator: " • ",
        showPerformanceNotification: false,

        //TODO: remove
        removeLinksFromHeadingsInternalWikilinkWithoutTextReplacement: "Delete",

        deleteOrphanedLinkTargetOnDeleteLink: true,
        removeLinksFromHeadingsInternalWikilinkWithoutTextAction: InternalWikilinkWithoutTextAction.Delete,

        //feature flags
        ffReplaceLink: true,
        ffExtractSection: true,
        ffSetLinkTextFromClipboard: true,
        ffWrapNoteInFolder: true,
        ffConvertLinksInFolder: true,
        ffConvertLinkToHtmllink: true,
        ffObsidianUrlSupport: true,
        ffDeleteUnreferencedLinkTarget: true,

        //context menu
        contexMenu: {
            editLinkText: true,
            setLinkText: true,
            setLinkTextFromClipboard: true,
            editLinkDestination: true,
            copyLinkDestination: true,
            unlink: true,
            convertToWikilink: true,
            convertToAutolink: true,
            convertToMakrdownLink: true,
            convertToHtmlLink: true,
            replaceLink: true,
            embedUnembedLink: true,
            deleteLink: true,
            createLink: true,
            createLinkFromClipboard: true,
            convertAllLinksToMdLinks: true,
            convertWikilinkToMdLinks: true,
            convertUrlsToMdlinks: true,
            convertAutolinksToMdlinks: true,
            convertHtmllinksToMdlinks: true,
            extractSection: true,
            wrapNoteInFolder: true,
            copyLinkToClipboard: true,
            cutLinkToClipboard: true
        }
    }

    constructor(vault?: IVault, uiFactory?: IUiFactory) {
        this.clipboardWriteText = this.__mocks.clipboardWriteText;
        this.clipboardReadText = this.__mocks.clipboardReadText;
        this.__mocks.createNotice.mockReturnValue(this.__mocks.NoticeMock);
        this.createNotice = this.__mocks.createNotice;
        this.linkTextSuggestContextSetLinkData = this.__mocks.linkTextSuggestContextSetLinkData;
        // this.showPromptModal = this.__mocks.showPromptModal;

        if (vault) {
            this.Vault = vault;
        }
        if (uiFactory) {
            this.uiFactory = uiFactory;
        }
    }

    createNotice(message: string | DocumentFragment, timeout?: number): Notice {
        // return this.__mocks.NoticeMock;
        throw new Error('Method not implemented.');
    }

    requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise {
        return this.__mocks.requestUrlMock()
    }

    clipboardWriteText(text: string): void {
        throw new Error('Method not implemented.');
    }

    clipboardReadText(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    linkTextSuggestContextSetLinkData(linkData: LinkData, titles: string[]): void {
        throw new Error('Method not implemented.');
    }

    showPromptModal(title: string, text: string[], buttons: ButtonInfo[], onSubmit: (result: string) => void): void {
        this.__mocks.showPromptModal(title, text, buttons, onSubmit);
        this.uiFactory.createPromptModal(title, text, buttons, onSubmit)
            .open();
    }

}