'use strict';
const FOODS = [
['aceite','el aceite de oliva','oliwa','🫒'],['pepino','el pepino','ogórek','🥒'],['platano','el plátano','banan','🍌'],['manzana','la manzana','jabłko','🍎'],['yogur','el yogur','jogurt','🥛'],['pan','el pan','chleb','🍞'],['jamon','el jamón','szynka','🍖'],['galleta','la galleta','herbatnik','🍪'],['naranja','la naranja','pomarańcza','🍊'],['pescado','el pescado','ryba','🐟'],['leche','la leche','mleko','🥛'],['carne','la carne','mięso','🥩'],['huevo','el huevo','jajko','🥚'],['lechuga','la lechuga','sałata','🥬'],['tomate','el tomate','pomidor','🍅'],['queso','el queso','ser','🧀'],['arroz','el arroz','ryż','🍚'],['fresa','la fresa','truskawka','🍓'],['mantequilla','la mantequilla','masło','🧈'],['patata','la patata','ziemniak','🥔'],['pasta','la pasta','makaron','🍝'],['pimiento','el pimiento','papryka','🫑'],['cebolla','la cebolla','cebula','🧅'],['aceitunas','las aceitunas','oliwki','🫒'],['uvas','las uvas','winogrona','🍇'],['brocoli','el brócoli','brokuł','🥦'],['legumbres','las legumbres','warzywa strączkowe','🫘']
].map(([id,es,pl,emoji])=>({id,es,pl,emoji}));
const MODES=[
['stock','📦','01 · ROZGRZEWKA','Magazyn kuchenny','Rozpoznawaj produkty. Bez pośpiechu.'],
['orders','🍽️','02 · PIERWSI GOŚCIE','Na talerz!','Zamówienia z dwóch i trzech składników.'],
['dialog','💬','03 · PRZY STOLIKU','Porozmawiajmy','Układaj zdania: gustar i częstotliwość.'],
['menu','📋','04 · MENU DNIA','Szefowa kuchni','Dobierz danie do życzenia klienta.'],
['lunch','🥡','05 · KUCHNIA ŚWIATA','Poleć lunchbox','Wybierz posiłek i uzasadnij wybór.'],
['rush','🔥','06 · WIELKI FINAŁ','Godziny szczytu','10 gości, 90 sekund i 3 serduszka.'],
['blogs','📱','BONUS · PO PRACY','Blogowy detektyw','Czytaj opisy i znajdź temat bloga.']
].map(([id,icon,kicker,title,desc])=>({id,icon,kicker,title,desc}));
const DIALOGS=[
{q:'Powiedz: Lubię jeść jajka.',a:['Me gusta','comer','huevos.'],d:['Me gustan','como'],why:'Me gusta comer huevos: lubię czynność (comer), dlatego gusta. Przy samym los huevos używamy gustan.'},
{q:'Powiedz: Lubię jajka.',a:['Me gustan','los huevos.'],d:['Me gusta','el huevo.'],why:'Los huevos to liczba mnoga → Me gustan los huevos.'},
{q:'Powiedz: Nie lubię sera.',a:['No','me gusta','el queso.'],d:['me gustan','los quesos.'],why:'El queso jest w liczbie pojedynczej → me gusta. Przeczenie no stoi przed me.'},
{q:'¿Con qué frecuencia comes pan? Odpowiedz: Jem chleb codziennie.',a:['Como pan','todos los días.'],d:['a veces.','muy a menudo.'],why:'Todos los días = codziennie; a veces = czasami; muy a menudo = bardzo często.'},
{q:'¿Con qué frecuencia comes pescado? Odpowiedz: Jem rybę czasami.',a:['Como pescado','a veces.'],d:['todos los días.','a menudo.'],why:'A veces = czasami. Como to „jem”, pierwsza osoba czasownika comer.'},
{q:'Powiedz: Jem warzywa bardzo często.',a:['Como verduras','muy a menudo.'],d:['a veces.','todos los días.'],why:'Muy a menudo = bardzo często; a menudo = często.'},
{q:'Powiedz: Interesuje mnie blog o modzie.',a:['Me interesa','el blog','de moda.'],d:['Me interesan','de bicicletas.'],why:'El blog jest w liczbie pojedynczej → me interesa.'},
{q:'Powiedz: Chcę mięso z makaronem i warzywami.',a:['Quiero','carne con pasta','y verduras.'],d:['Quieres','con pescado.'],why:'Quiero = chcę; con = z; y = i.'}
];
const DISHES=[
{id:'sopa',es:'Sopa de pescado',pl:'Zupa rybna',emoji:'🍲',ingredients:'pescado'},
{id:'ensalada',es:'Ensalada',pl:'Sałatka',emoji:'🥗',ingredients:'lechuga, tomate, pepino'},
{id:'carne',es:'Carne en su salsa',pl:'Mięso w sosie',emoji:'🥩',ingredients:'carne, salsa'},
{id:'pescado',es:'Pescado del día',pl:'Ryba dnia',emoji:'🐟',ingredients:'pescado'},
{id:'tortilla',es:'Tortilla',pl:'Hiszpański omlet ziemniaczany',emoji:'🍳',ingredients:'huevo, patata'},
{id:'gazpacho',es:'Gazpacho',pl:'Chłodnik warzywny',emoji:'🥣',ingredients:'tomate, pepino, pimiento'},
{id:'bocadillo',es:'Bocadillo',pl:'Kanapka',emoji:'🥖',ingredients:'pan, queso'},
{id:'hamburguesa',es:'Hamburguesa',pl:'Hamburger',emoji:'🍔',ingredients:'pan, carne'},
{id:'croquetas',es:'Croquetas',pl:'Krokieciki',emoji:'🧆',ingredients:'croquetas'},
{id:'tapas',es:'Tapas variadas',pl:'Różne przekąski',emoji:'🍢',ingredients:'tapas'}
];
const MENU_QUESTIONS=[
['Quiero una sopa con pescado.','sopa'],['Quiero una ensalada con lechuga y tomate.','ensalada'],['Quiero carne en salsa.','carne'],['Quiero el pescado del día.','pescado'],['Quiero un plato con huevos y patatas.','tortilla'],['Quiero una sopa fría con tomate y pepino.','gazpacho'],['Quiero un bocadillo con queso.','bocadillo'],['Quiero carne entre dos trozos de pan.','hamburguesa'],['Quiero croquetas.','croquetas'],['Quiero varias tapas diferentes.','tapas']
];
const BOXES=[
{id:'pandora',name:'Pandora · Grecia',emoji:'🥩🍝🥬',items:['carne','pasta','lechuga','cebolla','pimiento','aceitunas']},
{id:'lan',name:'Lan · Vietnam',emoji:'🐟🍚🫘',items:['pescado','arroz','legumbres']},
{id:'paola',name:'Paola · Italia',emoji:'🍝🥦🫑',items:['pasta','brocoli','pimiento','aceitunas']},
{id:'diego',name:'Diego · Brasil',emoji:'🥚🍚🫘',items:['huevo','arroz','legumbres','lechuga']},
{id:'filip',name:'Filip · Polonia',emoji:'🍞🍇🍎',items:['pan','uvas','manzana','lechuga']},
{id:'jose',name:'José · España',emoji:'🍞🍪🍓',items:['pan','galleta','fresa','lechuga']},
{id:'emma',name:'Emma · Estados Unidos',emoji:'🍞🥚🍓',items:['pan','huevo','fresa','lechuga']},
{id:'amar',name:'Amar · India',emoji:'🥩🍚🍎',items:['carne','arroz','manzana']}
];
// Schematyczne posiłki ćwiczeniowe inspirowane zdjęciami; nie rekonstrukcja przepisów.
const BLOGS=[
['Alicia comparte platos vegetarianos de China, Noruega y Ecuador.','comida','Platos vegetarianos i comer verdura wskazują na jedzenie.'],
['Luisa publica fotos de sus desayunos y zumos naturales.','comida','Desayunos = śniadania, zumos = soki.'],
['Ignacio explica cómo llegar a Roma y dónde dormir en Venecia.','viajes','Cómo llegar i dónde dormir to wskazówki dla podróżujących.'],
['Consejos para elegir ropa, perfumes y maquillaje.','moda','Ropa = ubrania, maquillaje = makijaż.'],
['Florencio presenta bicicletas urbanas y nuevos modelos.','bicicletas','Bicicletas = rowery; nuevos modelos = nowe modele.'],
['Las nuevas tendencias y las claves para vestir mejor.','moda','Vestir = ubierać się, tendencias = trendy.'],
['Lugares desconocidos de Italia: qué ver y cómo viajar.','viajes','Lugares = miejsca, viajar = podróżować.']
];
