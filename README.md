# Statyczny widok chatbota Enigma

Repozytorium zostało uproszczone do jednego statycznego widoku HTML/CSS/JS, aby można go było bezpośrednio wgrać na hosting (np. home.pl) bez procesu budowania Reacta czy TypeScriptu.

## Uruchomienie
1. Skopiuj pliki `index.html`, `style.css`, `script.js` oraz zasób referencyjny `wzor.png` (kopia pliku "wzór.png" z repo) na serwer w jednym katalogu.
2. Otwórz `index.html` w przeglądarce. Nie są wymagane żadne dodatkowe zależności ani konfiguracja.

## Funkcjonalność
- Interfejs został przebudowany tak, aby bliżej odwzorować makietę z pliku `wzór.png` – z kartą czatu, bocznym panelem statusu i złotymi akcentami.
- Wbudowana prosta logika czatu: wiadomości użytkownika trafiają na listę, a po chwili pojawia się losowa odpowiedź systemu, co pozwala przetestować układ bez integracji z API.
- Przycisk „Wyczyść” zeruje historię w oknie konwersacji.
- Dodano przełączany podgląd makiety: przycisk „Przełącz podgląd wzoru” nakłada półprzezroczysty obraz referencyjny na stronę, a suwak zmienia jego przezroczystość, co ułatwia pixel-perfect poprawki bez zewnętrznych narzędzi. Gdy podgląd jest aktywny, strzałki przesuwają warstwę (Shift = większy krok), a klawisz „R” resetuje pozycję.

Jeżeli chcesz zintegrować prawdziwe API, możesz rozbudować `script.js`, zachowując statyczny charakter frontendu.

## Co zrobić, gdy narzędzie zgłasza błąd „Pliki binarne nie są obsługiwane”
- W repo pozostaje tylko jeden plik binarny potrzebny do podglądu: `wzor.png` (referencyjny zrzut ekranu). Usunięto zbędne binaria (`copy-of-enigma-interface (3).zip`, duplikat `wzór.png`), żeby uprościć push/PR.
- Jeśli Twoja platforma nadal blokuje PR z powodu `wzor.png`, możesz:
  - tymczasowo usunąć ten plik z commita (`git rm wzor.png`) i wgrać go ręcznie na hosting jako zasób statyczny,
  - albo dodać zewnętrzny URL w `style.css`/`index.html` do obrazka hostowanego poza repozytorium (np. wgrywając `wzor.png` na własny CDN),
  - ewentualnie skorzystać z Git LFS, jeśli jest dozwolone w Twoim repozytorium.
