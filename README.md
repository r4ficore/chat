# Statyczny widok chatbota Enigma

Repozytorium zostało uproszczone do jednego statycznego widoku HTML/CSS/JS, aby można go było bezpośrednio wgrać na hosting (np. home.pl) bez procesu budowania Reacta czy TypeScriptu.

## Uruchomienie
1. Skopiuj pliki `index.html`, `style.css`, `script.js` oraz zasób `wzór.png` na serwer w jednym katalogu.
2. Otwórz `index.html` w przeglądarce. Nie są wymagane żadne dodatkowe zależności ani konfiguracja.

## Funkcjonalność
- Interfejs został wystylizowany tak, aby odpowiadał makiecie z pliku `wzór.png`.
- Wbudowana prosta logika czatu: wiadomości użytkownika trafiają na listę, a po chwili pojawia się losowa odpowiedź systemu, co pozwala przetestować układ bez integracji z API.
- Przycisk „Wyczyść” zeruje historię w oknie konwersacji.

Jeżeli chcesz zintegrować prawdziwe API, możesz rozbudować `script.js`, zachowując statyczny charakter frontendu.
