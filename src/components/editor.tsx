"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@/assets/css/editor.css";
import { BlockNoteEditor, PartialBlock, filterSuggestionItems } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";

import {
    FormattingToolbar,
    FormattingToolbarController,
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    getFormattingToolbarItems,
} from "@blocknote/react";

import {
    AIMenuController,
    AIToolbarButton,
    createAIExtension,
    createBlockNoteAIClient,
    getAISlashMenuItems,
} from "@blocknote/xl-ai";

import "@blocknote/xl-ai/style.css";

import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import {createGroq} from "@ai-sdk/groq";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
}

const client = createBlockNoteAIClient({
    apiKey:  "PLACEHOLDER",
    baseURL:  "https://localhost:3000/ai",
});

// Use an "open" model such as llama, in this case via groq.com
const model = createGroq({
    // call via our proxy client
    ...client.getProviderSettings("groq"),
})("llama-3.3-70b-versatile");

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { edgestore } = useEdgeStore();

    const handleUpload = async (file: File) => {
        const res = await edgestore.publicFiles.upload({
            file,
        });
        return res.url;
    };

    const editor = useCreateBlockNote({
        initialContent: initialContent
            ? (JSON.parse(initialContent) as PartialBlock[])
            : undefined,
        uploadFile: handleUpload,
        dictionary: {
            ...en,
            ai: aiEn, // add default translations for the AI extension
        },
        extensions: [
            createAIExtension({
                model,
            }),
        ],
    } as any);

    const onContentChange = () => {
        onChange(JSON.stringify(editor.document, null, 2));
    };
    return (
        <div className="bg-white">
            <BlockNoteView
                editor={editor}
                editable={editable}
                onChange={onContentChange}
                formattingToolbar={false}
                slashMenu={false}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
            >
                {/* Add the AI Command menu to the editor */}
                <AIMenuController />

                {/* We disabled the default formatting toolbar with `formattingToolbar=false`
        and replace it for one with an "AI button" (defined below).
        (See "Formatting Toolbar" in docs)
        */}
                <FormattingToolbarWithAI />

                {/* We disabled the default SlashMenu with `slashMenu=false`
        and replace it for one with an AI option (defined below).
        (See "Suggestion Menus" in docs)
        */}
                <SuggestionMenuWithAI editor={editor} />
            </BlockNoteView>
        </div>
    );
};

// Formatting toolbar with the `AIToolbarButton` added
function FormattingToolbarWithAI() {
    return (
        <FormattingToolbarController
            formattingToolbar={() => (
                <FormattingToolbar>
                    {...getFormattingToolbarItems()}
                    {/* Add the AI button */}
                    <AIToolbarButton />
                </FormattingToolbar>
            )}
        />
    );
}

// Slash menu with the AI option added
function SuggestionMenuWithAI(props: {
    editor: any;
}) {
    return (
        <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
                filterSuggestionItems(
                    [
                        ...getDefaultReactSlashMenuItems(props.editor),
                        // add the default AI slash menu items, or define your own
                        ...getAISlashMenuItems(props.editor),
                    ],
                    query,
                )
            }
        />
    );
}

export default Editor;
