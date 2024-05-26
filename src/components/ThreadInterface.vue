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
                <div class="spacer">
                    <div ref="refresh" class="pull-to-refresh">
                        {{ `${refreshTriggered ? "Release" : "Pull"} to refresh` }}
                    </div>
                </div>
            </div>
        </div>
        <div class="input-container" ref="input_container">
            <div class="input-container-inner">
                <input
                    v-model="newMessage"
                    @keyup.enter="sendMessage"
                    placeholder="Type your message..."
                    ref="input"
                />
            </div>
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
            observer: null as IntersectionObserver | null,
            refreshTriggeredTimeout: undefined as number | undefined,
            refreshTriggered: false,
        };
    },
    created() {
        this.threadStore.loadMessages().then(() => this.scrollToBottom(false));
    },
    mounted() {
        (this.$refs.input as HTMLElement).focus();
        this.observer = new IntersectionObserver(this.handleIntersection, {
            root: null,
            threshold: 1,
            rootMargin: `-${(this.$refs.input_container as HTMLElement).offsetHeight + 10}px`,
        });

        this.observer.observe(this.$refs.refresh as Element);
    },
    beforeUnmount() {
        clearTimeout(this.refreshTriggeredTimeout);
        this.observer && this.observer.disconnect();
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
        refreshTriggered(newTriggered) {
            console.info("refresh triggered", newTriggered);
            if (!newTriggered) { // must release before refresh occurs
                this.threadStore.loadMessages();
            }
        }
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
        handleIntersection(entries: IntersectionObserverEntry[]) {
            // add delay to prevent unintentional overscroll triggering refresh
            if (!!entries.length && entries[0].isIntersecting) {
                this.refreshTriggeredTimeout = setTimeout(() => {
                    this.refreshTriggeredTimeout = undefined;
                    this.refreshTriggered = true;
                }, 500);
            } else {
                clearTimeout(this.refreshTriggeredTimeout);
                this.refreshTriggeredTimeout = undefined;
                this.refreshTriggered = false;
            }

        },
    },
};
</script>

<style scoped>
.chat-container {
    position: relative;
}

.messages {
    height: 100vh;
    width: 100vw;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    padding: 0 1rem;
}

.messages::-webkit-scrollbar {
    display: none;
}
.messages {
    scrollbar-width: none;
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
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0.5rem 1rem;
    height: 3.5rem;
    background-color: black;
    border-top: 1px solid white;
}

.spacer {
    height: 3.5rem;
    margin: auto;
}

.pull-to-refresh {
}

.input-container input {
    display: block;
    width: 100%;
    border: none;
}
</style>
