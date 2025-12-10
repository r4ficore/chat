const chatWindow = document.getElementById('chat-window');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const clearBtn = document.getElementById('clear-btn');

const addMessage = (text, role = 'user') => {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'TY' : 'E';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const sender = document.createElement('p');
  sender.className = 'sender';
  sender.textContent = role === 'user' ? 'Użytkownik' : 'ENIGMA';

  const body = document.createElement('p');
  body.textContent = text;

  bubble.append(sender, body);
  wrapper.append(avatar, bubble);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const botReplies = [
  'Przygotuję strukturę wydarzenia wraz z komunikacją i moodboardem wizualnym.',
  'Zapisuję Twój pomysł i proponuję trzy warianty stylistyczne.',
  'Mogę dobrać listę inspiracji audio i video, aby podbić atmosferę.',
  'Chcesz dodać element AR lub szybki landing page do zbierania zapisów?'
];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  addMessage(value, 'user');
  input.value = '';

  setTimeout(() => {
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    addMessage(reply, 'bot');
  }, 500);
});

clearBtn.addEventListener('click', () => {
  chatWindow.innerHTML = '';
});
