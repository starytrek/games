# Akademia Zarodników — planszowa przygoda

Publiczny adres pozostaje `/gry/akademia-zarodnikow/`. Statyczna gra 2D bez kont, bibliotek zewnętrznych i płatnego zaplecza. Ilustracja `assets/krainy.webp` z poprzedniej wersji została zachowana; obiekty, pionek i schematy są własnymi SVG.

## Zapis i przywracanie

Punkt przywracania przed przebudową: commit repozytorium `ebd90cb6c11c0c57487c2c4ca001548494e95652`.

Klucz `naukogramy.myko.v1` pozostaje bez zmian. Pierwsza migracja dodaje wersję 2, pozycje i zawieszone misje; zapisuje niezmienioną kopię wcześniejszych danych jako `naukogramy.myko.v1.backup-before-board`. Nie przelicza ani nie usuwa starych punktów, historii, wykonanych misji i odpowiedzi. Starsza rozpoczęta misja kończy swój dotychczasowy zestaw. Pierwotne 54 identyfikatory i treści są zachowane; 18 dodatkowych pytań ma osobne ID `myko-extra-*`.

Punkty naliczane są jako poprawa najlepszego wyniku pytania: 100 samodzielnie, 60 z tropem, 20 po błędzie. Ponowne sprawdzenie rozwiązanej odpowiedzi i powtórzenie łatwej misji nie mnoży punktów. Zapis obejmuje rozwiązanie przed kliknięciem „Dalej”, wybór odpowiedzi i dwustopniowe tropy. Zmiana misji zawiesza poprzednią sesję. Zmiana krainy zatrzymuje ruch i zamyka panel.

## Mechanika

Sześć krain, 18 przygód, 72 pytania, sześć typów zadań. Trzy miejsca w każdej krainie; ostatnie jest finałem wątku. Pionek porusza się po jednym wspólnym szlaku SVG, mierzonym długością łuku. Kolejne polecenie zastępuje cel z aktualnej pozycji, bez nowej pętli animacji. Przyspieszenie i hamowanie: smoothstep. „Pomiń spacer” skraca pozostałe przejście do 240 ms, zachowując drogę. Ograniczenie animacji wyłącza podskoki i dekoracje, a spacer trwa 240 ms.

Dotyk i mysz używają tego samego mechanizmu pointer. Klawiatura: strzałki/WASD przesuwają pionek wzdłuż szlaku, E idzie do mieszkańca. Zadania przez dotknięcie, także sortowanie i kolejność; nie ma operacji wymagających przeciągania. Dźwięk domyślnie wyłączony, synteza przez Web Audio dopiero po interakcji.

Każde ukończone miejsce ma własny stan graficzny i kartę w Atlasie. Zielona energia: koło młyna, ogród, światło latarni. Pozostałe krainy mają własne palety, mieszkańców, ilustracje i odkrycia.

## Weryfikacja

Uruchom z katalogu repozytorium:

```sh
node tests/myko-engine.cjs
node tests/myko-app.cjs
node tests/myko-app.cjs --mobile
```

Test silnika sprawdza migrację, zachowanie 54 pytań, sześć typów odpowiedzi, punktację, błędy, tropy i ciągłość ścieżki. Test aplikacji używa lekkiego modelu DOM; sprawdza pełne przejście 18 misji, renderery, wielokrotne kliknięcia, zawieszone sesje i anulowanie ruchu. Nie zastępuje wizualnej kontroli w przeglądarce.

`qa/` to przeglądarkowy podgląd rzeczywistej gry w ramkach 320×640, 360×740, 390×844 i 1080×720. Ładuje wyłącznie osobny klucz `.qa`, może przygotować starszy zapis i odblokowane krainy. Nie zapisuje aktywności do kalendarza nauki. Ten podgląd nie emuluje sprzętu ani systemu Android.

Materiały sprawdzone w ZPE: fotosynteza, oddychanie, grzyby i porosty; odnośniki w Atlasie. Oddychanie roślin zachodzi w dzień i w nocy; fotosynteza wymaga światła. Świat jest fantastyczny, schematy biologiczne są osobno oznaczone.

Sprawdzenie w Chromium: cała Zielona energia (12 odpowiedzi, 1200 punktów, 3 efekty), sortowanie, dopasowanie, kolejność i schematy, powrót po odświeżeniu, szybka zmiana celu, zmiana krainy podczas ruchu, dwa tropy, błąd i poprawa bez mnożenia punktów, przełącznik dźwięku, stary zapis 300 punktów / jedna misja / karta Atlasu. Układy 320×640, 360×740 i 390×844 bez przewijania poziomego; panel pytań i przyciski w zasięgu ekranu. Test urządzenia fizycznego z Androidem nie był wykonywany. Brak błędów konsoli pochodzących z gry.

## Wyprawa Myko

Checkpoint przed wyprawą: `6ad302838df49c2cda87c4f1e7f1cc1872115137` (zawiera poprawną mobilną geometrię). Nowe pole profilu `expedition` jest dodatkiem do dotychczasowego zapisu v2. Pierwsze uruchomienie wykonuje jednorazową kopię `naukogramy.myko.v1.backup-before-expedition`. Punkty, pytania, rozpoczęte i zawieszone misje pozostają bez zmiany. Dawne ukończone misje otrzymują jednokrotnie fragment mapy i składnik, a ich pokój jest już złożony.

18 pokoi ma własne nazwy, cele i trzy wskazówki do znalezienia oraz dopasowania przez kliknięcie/dotknięcie. Biologiczne zadania uruchamiają urządzenie i wyjście. Stan przeszukania, złożonych części i odpowiedzi pozostaje po odświeżeniu. Każde nowe rozwiązane pytanie zwiększa wygląd Myko; trzy ukończone misje odblokowują kanię, sześć kozaka, dziewięć muchomora. Kania podświetla wskazówki, kozak szybciej chodzi, muchomor raz na krainę chroni przed fabularnym zagrożeniem. Wybór postaci w plecaku.

Każda ukończona misja daje jeden z trzech fragmentów mapy swojej krainy i składnik. Fragmenty trzeba dopasować w plecaku do początku, środka i końca ścieżki. Złożona mapa ujawnia portal na końcu szlaku; pierwszy spacer do sekretu daje dodatkową rosę i zarodnik. Ponowne wizyty nie mnożą łupów. Trzy receptury zużywają różne pary składników. Eliksir przygotowuje pojedynczą osłonę, która automatycznie chroni w niebezpiecznym pokoju. Laboratorium i przystań w krainie mikromieszkańców mają jednokrotne spotkanie. Brak ochrony osłabia Myko i spowalnia spacer, ale nie zabiera postępu ani nie blokuje nauki. Lecznica przywraca siły po naprawczym zadaniu o rolach bakterii, bez naliczania dodatkowych punktów. Bibi jest pożyteczną bakterią.

Moce, osłabienie i eliksiry są wyraźnie podpisaną fikcją; nie stanowią zaleceń dotyczących leczenia. Schematy są biologiczne. Nie wszystkie bakterie lub protisty są przeciwnikami.

Dodatkowy test: `node tests/myko-expedition.cjs` — wszystkie pokoje i mapy, jednorazowe nagrody, migracja, rozwój, receptury i zużywanie ochrony.

Kontrola wyprawy w Chromium: szukanie i dopasowanie części (także błąd i poprawa), odświeżenie z jedną złożoną częścią, pełna pierwsza misja 4/4 i 400 punktów, wzrost po odkryciu, kania i sokoli wzrok, tworzenie/aktywacja osłony, ręczne złożenie mapy i spacer do sekretu, osłabienie w laboratorium, lecznica z błędną odpowiedzią i poprawą. Cele w pokoju przy 320 px mają 44×44 px; plansza zachowuje viewBox 600×820 bez rozciągania. Testy na fizycznym Androidzie nadal niewykonane.

Potwierdzono również wejście z aktywnym eliksirem: osłona została wykorzystana, postać pozostała zdrowa. Oznaczenie niebezpiecznego miejsca pojawia się na planszy przed wejściem.

## Nocny widok etapu
Pokój i zagadka otwierają się teraz w szerokim widoku na środku ekranu, nad przyciemnioną mapą. Na komputerze ilustracja i elementy układanki zajmują dwie kolumny; pytanie i odpowiedzi również mają osobne kolumny. Na telefonie etap zajmuje dostępny ekran pod górnym paskiem. Stopka jest krótsza, a podczas zadania znika. Pasek przewijania jest ukryty, ale długie treści nadal można przewijać kółkiem, dotykiem i klawiaturą. Nocna paleta zachowuje kontrast tekstu i jasne biologiczne schematy. Geometria mapy oraz zapis bez zmian.

## Szlak kryształów — zamiast escape roomów
Punkt przywracania: `333a824acf28038930e09e277b3cb7e4f975c98d` (pliki gry bez późniejszych zmian). Mieszkaniec otwiera od razu zadanie biologiczne. Na każdym z trzech odcinków są trzy kryształy: 9 na krainę, 54 w grze. Myko zbiera je podczas przechodzenia przez ich pozycję; dotknięcie kryształu zleca spacer do niego. Ruch pomijany i ograniczone animacje również zbierają wszystkie przekroczone kryształy. Zebrane nie pojawiają się ponownie. Trzy dostępne kryształy można wymienić w plecaku na jedną magiczną osłonę. Kryształy i wyniki wiedzy są opisane osobno. Fragmenty map nadal są nagrodą za ukończenie biologicznej przygody, a mapy otwierają istniejące sekrety.
Zapis: nowy `expedition.trail` z listą identyfikatorów i liczbą wydanych kryształów. Dawne znalezione wskazówki przeliczamy na zebrane kryształy bez utraty punktów, części map, eliksirów ani odpowiedzi. Przed migracją powstaje `.backup-before-trail`. Stare dane pokojów pozostają w zapisie, ale nie blokują żadnego pytania.
