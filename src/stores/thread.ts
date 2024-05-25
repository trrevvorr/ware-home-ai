import { defineStore } from "pinia";
import { useSettingsStore } from "./settings";
import { v4 as uuidv4 } from "uuid";

type MessageRole = "assistant" | "user";

export interface Message {
    id: string;
    object: string;
    created_at: number;
    assistant_id: string | null;
    thread_id: string;
    run_id: string | null;
    role: MessageRole;
    content: MessageContent[];
}

export interface PlaceholderMessage {
    id: string;
    role: MessageRole;
    content: MessageContent[];
}

type AnyMessage = Message | PlaceholderMessage;

interface MessageContent {
    type: "text";
    text: MessageContentText;
}

interface MessageContentText {
    value: string;
}

export interface Run {
    id: string;
    object: string;
    created_at: number;
    assistant_id: string;
    thread_id: string;
    status:
        | "queued"
        | "in_progress"
        | "requires_action"
        | "cancelling"
        | "cancelled"
        | "failed"
        | "completed"
        | "incomplete"
        | "expired";
    started_at: number;
    expires_at: number;
    cancelled_at: number;
    failed_at: number;
    completed_at: number;
    last_error: any;
    model: string;
    instructions: string;
    incomplete_details: any;
    tools: any[];
    metadata: any;
    usage: any;
    temperature: number;
    top_p: number;
    max_prompt_tokens: number;
    max_completion_tokens: number;
    truncation_strategy: any;
    response_format: string;
    tool_choice: string;
}

export interface MessageGroup {
    role: "assistant" | "user";
    messages: AnyMessage[];
}

export interface ThreadState {
    messages: AnyMessage[];
    lastRun?: Run;
}

export const useThreadStore = defineStore("thread", {
    state: (): ThreadState => ({
        messages: [],
        lastRun: undefined,
    }),
    getters: {
        messageGroups(state): MessageGroup[] {
            return state.messages.reduce((groupedMessages: MessageGroup[], message: AnyMessage) => {
                if (!groupedMessages.length || groupedMessages[0].role !== message.role) {
                    return [{ role: message.role, messages: [message] }, ...groupedMessages];
                } else {
                    return [
                        {
                            ...groupedMessages[0],
                            messages: [message, ...groupedMessages[0].messages],
                        },
                        ...groupedMessages.slice(1),
                    ];
                }
            }, []);
        },
        runStatus(state) {
            return state.lastRun?.status;
        },
        runDuration(state) {
            const seconds = Math.floor(Date.now() / 1000);
            return seconds - (state.lastRun?.started_at || seconds);
        },
    },
    actions: {
        async loadMessages() {
            const settingsStore = useSettingsStore();
            const { secret, threadId } = settingsStore;

            if (!secret || !threadId) {
                throw new Error("Not initialized");
            }

            this.messages = await getMessages(threadId, secret);
        },
        async addMessage(userMessage: string) {
            const settingsStore = useSettingsStore();
            const { secret, threadId, assistantId } = settingsStore;

            if (!secret || !threadId || !assistantId) {
                throw new Error("Not initialized");
            }

            try {
                this.messages = [createPlaceholderMessage("user", userMessage), ...this.messages];
                await sendMessage(threadId, secret, userMessage);

                this.messages = [createPlaceholderMessage("assistant", "..."), ...this.messages];
                this.lastRun = undefined;
                this.lastRun = await createRun(threadId, secret, assistantId);
                this.lastRun = await pollRun(threadId, secret, this.lastRun);
            } finally {
                this.messages = await getMessages(threadId, secret);
            }
        },
    },
});

function createPlaceholderMessage(role: MessageRole, message: string): PlaceholderMessage {
    return {
        id: uuidv4(),
        role: role,
        content: [
            {
                type: "text",
                text: { value: message },
            },
        ],
    };
}

async function getMessages(threadId: string, secret: string): Promise<Message[]> {
    const response = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/messages?limit=100`,
        {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${secret}`,
                "openai-beta": "assistants=v2",
            },
            body: null,
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return (await response.json()).data;
}

async function sendMessage(
    threadId: string,
    secret: string,
    userMessage: string
): Promise<Message> {
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${secret}`,
            "openai-beta": "assistants=v2",
        },
        body: JSON.stringify({
            role: "user",
            content: [
                {
                    type: "text",
                    text: userMessage,
                },
            ],
        }),
        method: "POST",
    });

    if (!messageResponse.ok) {
        throw new Error("Message response was not ok");
    }
    return await messageResponse.json();
}

async function createRun(threadId: string, secret: string, assistantId: string): Promise<Run> {
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${secret}`,
            "openai-beta": "assistants=v2",
        },
        body: JSON.stringify({
            assistant_id: assistantId,
        }),
        method: "POST",
    });

    if (!runResponse.ok) {
        throw new Error("Run response was not ok");
    }
    return await runResponse.json();
}

async function pollRun(threadId: string, secret: string, run: Run): Promise<Run> {
    while (["in_progress", "queued", "cancelling"].includes(run.status)) {
        const pollResponse = await fetch(
            `https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`,
            {
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${secret}`,
                    "openai-beta": "assistants=v2",
                },
                body: null,
                method: "GET",
            }
        );

        if (!pollResponse.ok) {
            throw new Error("Run response was not ok");
        }
        run = await pollResponse.json();
    }

    return run;
}
