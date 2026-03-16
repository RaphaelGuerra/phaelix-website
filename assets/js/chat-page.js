/**
 * Chat page loader for Phaelix AI website
 */

class ChatPageApp {
  initialize() {
    this.initializeChatbotShell();
  }

  initializeChatbotShell() {
    const chatbotShell = document.querySelector('[data-chatbot-shell]');
    const chatbotEmbed = chatbotShell?.querySelector('gradio-app');
    if (!chatbotShell || !chatbotEmbed) return;

    let isReady = false;
    let fallbackTimer = null;

    const markReady = () => {
      if (isReady) return;
      isReady = true;
      chatbotShell.classList.add('is-ready');
      chatbotEmbed.setAttribute('aria-busy', 'false');
      observer.disconnect();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const observer = new MutationObserver(() => {
      if (chatbotEmbed.querySelector('iframe') || chatbotEmbed.shadowRoot?.querySelector('iframe')) {
        markReady();
      }
    });

    chatbotEmbed.setAttribute('aria-busy', 'true');
    observer.observe(chatbotEmbed, { childList: true, subtree: true });

    ['load', 'ready', 'gradio-ready', 'gradio-loaded'].forEach((eventName) => {
      chatbotEmbed.addEventListener(eventName, markReady, { once: true });
    });

    fallbackTimer = window.setTimeout(markReady, 6000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ChatPageApp();
  app.initialize();
});
