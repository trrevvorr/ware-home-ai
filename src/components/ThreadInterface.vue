<template>
    <div class="chat-container">
        <div class="messages">
            <div class="messages-inner">
                <span ref="top"></span>
                <div
                    v-for="(messageGroup, groupIndex) in messageGroups"
                    :key="groupIndex"
                    :class="`message-group ${messageGroup.role}`"
                >
                    <div
                        v-for="message in messageGroup.messages"
                        :key="message.id"
                        :class="`message ${message.role}`"
                    >
                        <span v-for="(content, index) in message.content" :key="index">
                            <MarkdownText :content="content.text.value" />
                        </span>
                    </div>
                </div>
                <span ref="bottom"></span>
            </div>
        </div>
        <div class="input-container">
            <div class="input-container-inner">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    placeholder="Type your message..."
                />
            </div>
            <div class="chin"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { useThreadStore } from "@/stores/thread";
import type { Message } from "@/stores/thread";
import MarkdownText from "@/components/MarkdownText.vue";
import { mapState } from "pinia";

export default {
    name: "ThreadInterface",
    components: {
        MarkdownText,
    },
    data() {
        return {
            newMessage: "",
            threadStore: useThreadStore(),
        };
    },
    created() {
        this.threadStore.loadMessages().then(() => this.scrollToBottom(false));
    },
    computed: {
        ...mapState(useThreadStore, ["messages", "messageGroups", "runStatus", "runDuration"]),
    },
    watch: {
        messages(newMessages?: Message[], oldMessages?: Message[]) {
            const mostRecentNewMessage = newMessages && newMessages[0];
            const mostRecentOldMessage = oldMessages && oldMessages[0];
            if (
                mostRecentNewMessage &&
                mostRecentOldMessage &&
                mostRecentNewMessage.id !== mostRecentOldMessage.id
            ) {
                this.scrollToBottom(true);
            }
        },
    },
    methods: {
        async sendMessage() {
            if (this.newMessage.trim()) {
                const originalNewMessage = this.newMessage;
                try {
                    this.newMessage = "";
                    await this.threadStore.addMessage(originalNewMessage);
                } catch (e) {
                    this.newMessage = originalNewMessage; // reset text field if there was an error in sending the message
                }
            }
        },
        scrollToBottom(smooth: boolean) {
            console.log("scrolling into view...");
            this.$nextTick(() => {
                (this.$refs.bottom as HTMLElement).scrollIntoView({
                    behavior: smooth ? "smooth" : "instant",
                });
            });
        },
        messageClass(message: Message) {
            return message.role === "user" ? "user-message" : "bot-message";
        },
    },
};
</script>

<style scoped>
.chat-container {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100vh;
    width: 100vw;
}

.messages {
    overflow-y: auto;
    overscroll-behavior-y: contain;
    border-bottom: 1px solid white;
    padding: 0 1rem;
}

.messages-inner {
    display: grid;
    gap: 0.5rem;
}

.message-group {
    width: 100%;
    display: grid;
    gap: 0.25rem;
}
.message-group.user {
    justify-content: right;
}
.message-group.assistant {
    justify-content: left;
}

.messages-inner,
.input-container-inner {
    max-width: 25rem;
    margin: auto;
}

.message,
input {
    padding: 0.25rem 0.5rem;
    font-size: 15px;
    line-height: 1.6;
    overflow: auto;
}

.message.user {
    margin-left: 3rem;
}

.message.user,
input {
    text-align: right;
    color: black;
    background-color: white;
    border-radius: 0.75rem 0.75rem 0 0.75rem;
}

.message.assistant {
    border: 1px solid white;
    color: white;
    background-color: black;
    text-align: left;
    margin-right: 3rem;
    border-radius: 0.75rem 0.75rem 0.75rem 0;
}

.input-container {
    width: 100%;
    padding: 0.5rem 1rem;
}

.input-container input {
    display: block;
    width: 100%;
    border: none;
}

.chin {
    height: 1rem;
}
</style>
