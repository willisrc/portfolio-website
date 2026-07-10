const sendBtn = document.querySelector('.send-btn');
const chatInput = document.querySelector('.chat-input');
const chatBody = document.querySelector('.chatbox-body');

const conversation = [];

const welcomeMessages = [
  'This is an AI powered interactive resume built by William Cronin.',
  'Ask any questions you have about William\'s background or experience!'
];

function addMessage(text, type = 'incoming') {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  
  // For assistant messages, render markdown; for user messages, plain text
  if (type === 'incoming') {
    messageElement.innerHTML = marked.parse(text);
  } else {
    messageElement.textContent = text;
  }
  
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(6px)';
  chatBody.appendChild(messageElement);

  requestAnimationFrame(() => {
    messageElement.style.transition = 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  });

  chatBody.scrollTop = chatBody.scrollHeight;
  return messageElement;
}

let welcomeTimers = [];
let welcomeStarted = false;

function clearWelcomeSequence() {
  welcomeTimers.forEach((timerId) => clearTimeout(timerId));
  welcomeTimers = [];
}

function showWelcomeMessages() {
  if (!chatBody || welcomeStarted) return;

  welcomeStarted = true;
  clearWelcomeSequence();
  chatBody.innerHTML = '';
  welcomeTimers.push(setTimeout(() => addMessage(welcomeMessages[0], 'incoming'), 400));
  welcomeTimers.push(setTimeout(() => addMessage(welcomeMessages[1], 'incoming'), 1700));
}

// Toggle Chatbox
// toggleBtn.addEventListener('click', () => {
//   chatbox.style.display = 'flex';
//   toggleBtn.style.display = 'none';
// });

// closeBtn.addEventListener('click', () => {
//   chatbox.style.display = 'none';
//   toggleBtn.style.display = 'block';
// });

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !chatBody) return;

  conversation.push({ role: 'user', content: text });
  addMessage(text, 'outgoing');
  chatInput.value = '';

  const assistantMessage = addMessage('', 'incoming');

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation })
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let replyText = '';

      if (!reader) {
        throw new Error('No response stream available');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n\n').forEach((frame) => {
          if (!frame.startsWith('data: ')) return;

          const payload = frame.slice('data: '.length).trim();
          if (payload === '[DONE]') return;

          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed.text === 'string') {
              replyText += parsed.text;
              assistantMessage.innerHTML = marked.parse(replyText);
              chatBody.scrollTop = chatBody.scrollHeight;
            }
          } catch (error) {
            console.error('Failed to parse chat stream payload', error);
          }
        });
      }
    })
    .catch((error) => {
      console.error(error);
      assistantMessage.textContent = 'I could not reach the chat service right now. Please try again later.';
    });
}

window.addEventListener('hashchange', () => {
  if (location.hash === '#chat') {
    showWelcomeMessages();
  } else {
    clearWelcomeSequence();
    welcomeStarted = false;
  }
});

window.addEventListener('load', () => {
  if (location.hash === '#chat') {
    showWelcomeMessages();
  }
});

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
