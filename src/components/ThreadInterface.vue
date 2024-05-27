<template>
    <div class="chat-container">
        <div class="messages">
            <div class="messages-inner">
                <span ref="top"></span>
                <div class="message-list">
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
                <button id="settings-button" @click="forceSettingsDisplay">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>cog</title>
                        <path
                            d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
                        />
                    </svg>
                    &#8203;
                </button>
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
            if (!newTriggered) {
                // must release before refresh occurs
                this.threadStore.loadMessages();
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
        forceSettingsDisplay() {
            this.$emit("force-settings-display");
        },
    },
};
</script>

<style scoped>
.chat-container {
    position: relative;
    overflow: hidden;
    overscroll-behavior: none;
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

.messages-inner,
.message-list {
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
    border-radius: 1rem 1rem 0 1rem;
}

.message.assistant {
    border: 1px solid white;
    color: white;
    background-color: black;
    text-align: left;
    margin-right: 3rem;
    border-radius: 1rem 1rem 1rem 0;
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

.input-container input {
    display: block;
    width: 100%;
    border: none;
}

.input-container-inner {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
}

#settings-button {
    fill: white;
    height: 2rem;
    width: 2rem;
    background: none;
    border: none;
    outline: none;
    padding: 0;
}

.message-list {
    min-height: 100vh;
}
</style>
