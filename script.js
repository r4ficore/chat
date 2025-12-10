const chatWindow = document.getElementById('chat-window');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const clearBtn = document.getElementById('clear-btn');
const overlay = document.getElementById('reference-overlay');
const toggleOverlay = document.getElementById('reference-toggle');
const opacityControl = document.getElementById('reference-opacity');
let overlayOffset = { x: 0, y: 0 };

const addMessage = (text, role = 'user') => {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'TY' : 'E';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const author = role === 'user' ? 'Użytkownik' : 'ENIGMA';
  meta.innerHTML = `<span>${author}</span><span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;

  const body = document.createElement('p');
  body.className = 'body';
  body.textContent = text;

  bubble.append(meta, body);
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

if (toggleOverlay && overlay && opacityControl) {
  toggleOverlay.addEventListener('click', () => {
    overlay.classList.toggle('visible');
    if (overlay.classList.contains('visible')) {
      overlay.style.opacity = Number(opacityControl.value) / 100;
    }
  });

  opacityControl.addEventListener('input', (e) => {
    const value = Number(e.target.value) / 100;
    overlay.style.opacity = overlay.classList.contains('visible') ? value : 0;
  });

  const moveOverlay = (dx, dy) => {
    overlayOffset = { x: overlayOffset.x + dx, y: overlayOffset.y + dy };
    overlay.style.transform = `translate(${overlayOffset.x}px, ${overlayOffset.y}px)`;
  };

  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('visible')) return;
    const step = e.shiftKey ? 10 : 2;
    switch (e.key) {
      case 'ArrowLeft':
        moveOverlay(-step, 0);
        e.preventDefault();
        break;
      case 'ArrowRight':
        moveOverlay(step, 0);
        e.preventDefault();
        break;
      case 'ArrowUp':
        moveOverlay(0, -step);
        e.preventDefault();
        break;
      case 'ArrowDown':
        moveOverlay(0, step);
        e.preventDefault();
        break;
      case 'r':
      case 'R':
        overlayOffset = { x: 0, y: 0 };
        overlay.style.transform = 'translate(0, 0)';
        break;
      default:
        break;
    }
  });
}

const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
  const revealCursor = () => {
    cursorDot.style.opacity = '1';
    cursorOutline.style.opacity = '0.5';
  };

  window.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event;
    cursorDot.style.transform = `translate(${clientX}px, ${clientY}px)`;
    cursorOutline.style.transform = `translate(${clientX}px, ${clientY}px)`;
    if (cursorDot.style.opacity === '0') revealCursor();
  });
}
