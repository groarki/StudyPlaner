# StudyPlaner

StudyPlaner to aplikacja mobilna w React Native/Expo do organizowania nauki: planowania zajęć, zarządzania zadaniami, dodawania załączników oraz pracy z podstawowym trybem offline. Dane użytkownika są synchronizowane z Supabase, a ostatnio pobrane zadania i zajęcia są zapisywane lokalnie w AsyncStorage.

## Funkcjonalności

- Rejestracja i logowanie użytkownika przez Supabase Auth.
- Chronione ekrany aplikacji po zalogowaniu.
- Kalendarz zajęć z podziałem na dni tygodnia.
- Dodawanie, edycja i usuwanie zajęć.
- Lista zadań z widokiem upcoming/completed.
- Oznaczanie zadań jako wykonane gestem swipe.
- Dodawanie, edycja i podgląd zadań.
- Dodawanie zdjęć, zdjęć z aparatu i plików do zadań.
- Ustawienia profilu, avatar i pomocne linki.
- Podstawowy tryb offline: przeglądanie wcześniej załadowanych danych.
- Obsługa błędów sieciowych i retry dla danych.
- Testy jednostkowe dla logiki aplikacji, store'ów i helperów.

## Technologie

- React Native 0.81
- Expo 54
- Expo Router
- TypeScript
- Zustand
- Supabase Auth, Database i Storage
- AsyncStorage
- Expo SecureStore
- Expo Image Picker
- Expo Document Picker
- Expo File System
- Expo Haptics
- NetInfo
- React Native Gesture Handler
- React Native Paper
- Jest
- React Native Testing Library
- ESLint i Prettier

## Wymagania

- Node.js
- npm
- Expo Go na telefonie lub emulator Android/iOS
- Konto Supabase
- Opcjonalnie: konto Expo/EAS do builda produkcyjnego

## Uruchomienie projektu

1. Sklonuj repozytorium.

```bash
git clone <repo-url>
cd StudyPlaner
```

2. Zainstaluj zależności.

```bash
npm install
```

3. Utwórz plik `.env` w katalogu głównym projektu.

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Uruchom aplikację.

```bash
npm start
```

5. Otwórz projekt w Expo Go albo uruchom na emulatorze.

```bash
npm run android
npm run ios
npm run web
```

## Konfiguracja Supabase

Aplikacja korzysta z Supabase do autoryzacji, bazy danych i przechowywania avatara.

Wymagane tabele:

### `lectures`

| Kolumna | Typ | Opis |
| --- | --- | --- |
| `id` | uuid/text | Id zajęć |
| `user_id` | uuid | Id użytkownika |
| `title` | text | Tytuł zajęć |
| `day_of_week` | number | Dzień tygodnia |
| `start_time` | text | Godzina rozpoczęcia |
| `end_time` | text | Godzina zakończenia |
| `color` | text/null | Kolor karty |
| `notes` | text/null | Notatki |
| `alert_minutes` | number/null | Przypomnienie |
| `created_at` | timestamp | Data utworzenia |

### `tasks`

| Kolumna | Typ | Opis |
| --- | --- | --- |
| `id` | uuid/text | Id zadania |
| `user_id` | uuid | Id użytkownika |
| `title` | text | Tytuł zadania |
| `due_date` | text | Termin |
| `due_time` | text | Godzina |
| `color` | text/null | Kolor karty |
| `notes` | text/null | Notatki |
| `alert_minutes` | number/null | Przypomnienie |
| `is_completed` | boolean | Status wykonania |
| `file_urls` | text[]/null | Załączniki |
| `created_at` | timestamp | Data utworzenia |

W Supabase Storage należy utworzyć bucket `avatars`, aby działała zmiana avatara w ustawieniach konta.

## Architektura

Projekt jest podzielony na warstwy:

- `app/` - routing i ekrany aplikacji oparte o Expo Router.
- `components/` - komponenty UI, formularze, karty i modale.
- `store/` - globalny stan aplikacji w Zustand.
- `utils/` - helpery, obsługa offline, cache i operacje na plikach.
- `lib/` - konfiguracja Supabase i mapowanie danych z bazy.
- `types/` - typy TypeScript.
- `constants/` - kolory, spacing, fonty i opcje formularzy.
- `__tests__/` - testy jednostkowe.

## Testy

Projekt zawiera testy dla kluczowej logiki aplikacji:

- helpery dat, czasu, URL i inicjałów,
- mapowanie danych z Supabase,
- store zadań,
- store autoryzacji i profilu,
- cache AsyncStorage,
- obsługa NetInfo i offline.

Uruchomienie testów:

```bash
npm run test:ci
```


Sprawdzenie TypeScript:

```bash
npx tsc --noEmit
```

Lint:

```bash
npm run lint
```

## Build i deployment

Projekt ma konfigurację EAS w `eas.json`.

Build preview APK dla Androida:

```bash
eas build --platform android --profile preview
```

Build produkcyjny Android App Bundle:

```bash
eas build --platform android --profile production
```

W `app.json` skonfigurowano nazwę aplikacji, ikonę, splash screen, scheme, Android package i iOS bundle identifier.

## Store vs AsyncStorage
Do stanu globalnego używany jest Zustand, ponieważ jest lekki i dobrze pasuje do aplikacji z kilkoma niezależnymi store'ami. Stan lokalny, np. otwarte modale, pola formularzy i loading formularza, zostaje w `useState`.

Store przechowuje aktualny stan aplikacji w pamięci podczas działania aplikacji. Przykłady:

- `useTasksStore`
- `useLecturesStore`
- `useProfileStore`
- `useAuthStore`

AsyncStorage przechowuje dane lokalnie na urządzeniu po zamknięciu aplikacji. W projekcie jest używany na dwa sposoby:

- cache zadań i zajęć w `utils/app-data-cache.ts`,
- persist ustawień profilu w `store/useProfileStore.ts`.

Przepływ danych:

```text
Supabase -> Zustand store -> UI
                 |
                 v
           AsyncStorage cache
```

Po uruchomieniu aplikacji `hydrateAppData` najpierw ładuje cache z AsyncStorage, a potem, jeśli jest internet, pobiera świeże dane z Supabase i zapisuje nowy cache.

## Tryb offline

Aplikacja sprawdza połączenie przez NetInfo. Jeśli użytkownik nie ma internetu:

- może przeglądać wcześniej zapisane zajęcia i zadania,
- operacje zapisu/edycji/usuwania są blokowane czytelnym komunikatem,
- jeśli cache nie istnieje, użytkownik widzi informację o braku zapisanych danych,
- ekrany list mają opcję retry.


## Funkcje natywne

Projekt wykorzystuje natywne funkcje urządzenia:

- Galeria zdjęć przez Expo Image Picker.
- Kamera przez Expo Image Picker.
- Wybór dokumentów przez Expo Document Picker.
- Lokalny zapis plików przez Expo File System.
- Bezpieczne przechowywanie sesji przez Expo SecureStore.
- Haptic feedback przy przełączaniu zakładek przez Expo Haptics.
- Sprawdzanie połączenia internetowego przez NetInfo.


## Nawigacja

Nawigacja jest zbudowana na Expo Router:

- stack dla ekranów logowania/rejestracji,
- tabs dla głównych widoków,
- nested stack dla profilu i zadań,
- parametry w routingu, np. edycja zadania lub zajęć po `taskId`/`lectureId`.

## Obsługa błędów i asynchroniczność

Operacje asynchroniczne są realizowane przez `async/await`. Aplikacja obsługuje:

- loading states,
- błędy Supabase,
- brak użytkownika,
- brak internetu,
- odmowę permissions,
- retry przy pobieraniu danych,
- fallback do cache offline.

Dodatkowo aplikacja ma `ErrorBoundary` dla błędów renderowania.

## Wydajność

W listach używany jest `FlatList`, a nie zwykły `ScrollView`, dla widoków z wieloma elementami. Dłuższe listy zadań i zajęć renderują tylko potrzebne elementy. Część logiki formatowania i mapowania danych jest wydzielona do helperów.

## Styl i UI/UX

Projekt używa własnego spójnego systemu wartości w `constants/theme.ts`:

- kolory,
- spacing,
- font size,
- border radius,
- screen padding.

Interfejs jest zbudowany z powtarzalnych komponentów: kart, formularzy, bottom sheet modalów, pickerów i wspólnych wrapperów ekranu.

## Bezpieczeństwo

- Klucze Supabase są przekazywane przez zmienne środowiskowe.
- Sesja Supabase jest przechowywana w Expo SecureStore, nie w AsyncStorage.
- Dane cache w AsyncStorage nie zawierają tokenów ani haseł.
- Operacje na danych są wykonywane dla aktualnie zalogowanego użytkownika.
- Dane wejściowe są walidowane, np. wymagany tytuł zadania/zajęć i poprawne URL.
- Komunikacja z Supabase odbywa się przez HTTPS.


