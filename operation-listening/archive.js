'use strict';
// Short editorial notes, separate from the 1939–1941 question bank.
const ARCHIVE_SOURCES={
 kleeberg:['IPN','https://ipn.gov.pl/pl/historia-z-ipn/237033%2CGeneral-Franciszek-Kleeberg.html'],
 sikorski:['IPN','https://ipn.gov.pl/pl/dla-mediow/materialy-do-pobrania/187725%2C80-rocznica-smierci-gen-Wladyslawa-Sikorskiego-4-lipca-1943-r-materialy-IPN.html'],
 anders:['Muzeum Wojska Polskiego','https://muzeumwp.pl/od-buzuluku-do-monte-cassino/'],
 maczek:['Polska w Holandii','https://www.gov.pl/web/holandia/75-rocznica-wyzwolenia-bredy'],
 maczekCivil:['Ministerstwo Obrony Narodowej','https://www.gov.pl/web/obrona-narodowa/w-holdzie-generalowi-maczkowi-i-jego-zolnierzom'],
 ford:['US Holocaust Memorial Museum','https://encyclopedia.ushmm.org/content/en/article/antisemitism-and-henry-fords-international-jew'],
 siemens:['Siemens · archiwum historyczne','https://press.siemens.com/global/en/pressrelease/auschwitz-liberated-70-years-ago-today-siemens-remembers-victims-national-socialism'],
 boss:['Roman Köster · badanie historii firmy','https://group.hugoboss.com/fileadmin/media/pdf/corporate/EN/Study_on_the_Company_s_History_Abridged_Verson_en_final.pdf'],
 porsche:['Porsche · badanie historii firmy','https://newsroom.porsche.com/en/company/porsche-1931-1951-history-study-book-design-office-ferdinand-porsche-14144.html'],
 braun:['NASA · biografia','https://www.nasa.gov/people/wernher-von-braun/'],
 hahn:['NobelPrize.org · biografia','https://www.nobelprize.org/prizes/chemistry/1944/hahn/biographical/'],
 meitner:['NobelPrize.org · odkrycie rozszczepienia','https://www.nobelprize.org/prizes/chemistry/1944/hahn/facts/']
};
const ARCHIVE_FACTS=[
 {name:'gen. Franciszek Kleeberg',kind:'DOWÓDCY',date:'1939',portrait:0,source:'kleeberg',text:'Dowodził Samodzielną Grupą Operacyjną „Polesie”. Pod Kockiem walczył do początku października 1939 r.; decyzję o kapitulacji wymusił brak amunicji i środków medycznych.'},
 {name:'Henry Ford',kind:'PRZEMYSŁ I PROPAGANDA',date:'LATA 20.',stamp:'FORD',source:'ford',text:'Finansował gazetę „The Dearborn Independent”, która rozpowszechniała antysemickie kłamstwa. Jej teksty wydano też jako „The International Jew”. Hitler podziwiał Forda i jego antysemityzm.'},
 {name:'gen. Stanisław Maczek',kind:'DOWÓDCY',date:'1944',portrait:3,source:'maczek',text:'Żołnierze jego 1. Dywizji Pancernej wyzwolili holenderską Bredę 29 października 1944 r. Polskie wojsko jest tam do dziś szczególnie pamiętane.'},
 {name:'Wernher von Braun',kind:'NAUKA I ODPOWIEDZIALNOŚĆ',date:'1937 / 1940',stamp:'V–2',source:'braun',text:'Późniejszy konstruktor rakiety księżycowej Saturn V wcześniej pracował dla nazistowskich Niemiec. Wstąpił do NSDAP w 1937 r., a w 1940 r. został oficerem SS.'},
 {name:'Hugo Ferdinand Boss',kind:'FIRMY POD NAZIZMEM',date:'1931–1945',stamp:'BOSS',source:'boss',text:'Wstąpił do NSDAP w 1931 r. Jego zakład szył mundury, w czasie wojny m.in. dla Wehrmachtu i Waffen-SS. Badanie historyczne nie potwierdza popularnej opowieści, że firma projektowała te mundury.'},
 {name:'gen. Władysław Sikorski',kind:'DOWÓDCY',date:'II WOJNA ŚWIATOWA',portrait:1,source:'sikorski',text:'Łączył dwie kluczowe funkcje: był premierem polskiego rządu na uchodźstwie i Naczelnym Wodzem Polskich Sił Zbrojnych. Reprezentował więc zarówno władzę cywilną, jak i dowództwo wojskowe.'},
 {name:'Siemens',kind:'PRZEMYSŁ I PRACA PRZYMUSOWA',date:'1940–1945',stamp:'SIEMENS',source:'siemens',text:'Firma podaje, że zatrudniała co najmniej 80 tysięcy robotników przymusowych. Co najmniej 5 tysięcy z nich stanowili więźniowie obozów koncentracyjnych.'},
 {name:'Otto Hahn i Fritz Strassmann',kind:'NAUKA',date:'1938',stamp:'U / 92',source:'hahn',text:'Pod koniec 1938 r. odkryli rozszczepienie jądra uranu. Pierwsze publikacje ukazały się na początku 1939 r. Odkrycie zmieniło fizykę jądrową — nie było jeszcze gotową bombą atomową.'},
 {name:'gen. Władysław Anders',kind:'DOWÓDCY',date:'1944',portrait:2,source:'anders',text:'Dowodził 2. Korpusem Polskim. W maju 1944 r. jego żołnierze walczyli o Monte Cassino; zdobycie pozycji niemieckich otworzyło aliantom drogę w głąb Włoch.'},
 {name:'Ferdinand Porsche',kind:'FIRMY POD NAZIZMEM',date:'II WOJNA ŚWIATOWA',stamp:'PORSCHE',source:'porsche',text:'Biuro konstrukcyjne Porsche pracowało nad pojazdami wojskowymi. Historyczne badanie firmy podaje, że Porsche KG wykorzystywała pracę ponad 400 robotników przymusowych.'},
 {name:'Lise Meitner i Otto Frisch',kind:'NAUKA',date:'1938–1939',stamp:'ATOM',source:'meitner',text:'Wyjaśnili teoretycznie wyniki doświadczeń Hahna i Strassmanna: jądro uranu rzeczywiście zostało rozszczepione. Odkrycie było pracą kilku badaczy, a nie jednego „geniusza od bomby”.'},
 {name:'Henry Ford',kind:'PRZEMYSŁ I PROPAGANDA',date:'1938',stamp:'FORD',source:'ford',text:'Nazistowskie Niemcy przyznały mu Wielki Krzyż Orderu Orła Niemieckiego. To potwierdzony związek z reżimem; nie jest jednak dowodem, że Ford osobiście finansował Hitlera.'},
 {name:'gen. Franciszek Kleeberg',kind:'LOSY PO WOJNIE',date:'1969',portrait:0,source:'kleeberg',text:'Zmarł w niemieckiej niewoli. W 1969 r., w 30. rocznicę bitwy pod Kockiem, jego szczątki sprowadzono do Polski i pochowano na cmentarzu wojskowym w Kocku.'},
 {name:'Wernher von Braun',kind:'NAUKA PO WOJNIE',date:'1960–1969',stamp:'SATURN V',source:'braun',text:'W NASA kierował ośrodkiem Marshall i pracami nad rakietą Saturn V, która umożliwiła loty Apollo na Księżyc. Ten sukces nie usuwa jego wcześniejszej odpowiedzialności za współpracę z nazistami.'},
 {name:'Zakład Hugo Boss',kind:'PRACA PRZYMUSOWA',date:'II WOJNA ŚWIATOWA',stamp:'BOSS',source:'boss',text:'Zakład wykorzystywał 140 robotników przymusowych, głównie kobiety. Przez część wojny pracowało tam również 40 francuskich jeńców wojennych. Firma opublikowała historyczne badanie i wyraziła żal za krzywdy ofiar.'},
 {name:'gen. Władysław Anders',kind:'DOWÓDCY',date:'1942–1943',portrait:2,source:'anders',text:'Po ewakuacji armii Andersa z ZSRR polscy żołnierze trafili do Iranu. Na Bliskim Wschodzie, po połączeniu z Brygadą Strzelców Karpackich, powstał w 1943 r. 2. Korpus Polski.'},
 {name:'Siemens-Schuckertwerke',kind:'PRACA WIĘŹNIÓW OBOZÓW',date:'1943–1945',stamp:'SIEMENS',source:'siemens',text:'W podobozie Bobrek koło Auschwitz firma prowadziła zakład produkujący obrabiarki. Pracowało w nim około 200 więźniów. To przykład bezpośredniego udziału przemysłu w wykorzystywaniu więźniów.'},
 {name:'Ferdinand Porsche',kind:'TECHNIKA I REŻIM',date:'LATA 30.',stamp:'PORSCHE',source:'porsche',text:'Projekt Volkswagena i sukces biura Porsche były ściśle związane z III Rzeszą. Podczas wojny rozwijano także wojskowe wersje „samochodu dla ludu”. Dzisiejsza marka sportowa Porsche rozpoczęła się dopiero w 1948 r.'},
 {name:'gen. Władysław Sikorski',kind:'DOWÓDCY',date:'4 LIPCA 1943',portrait:1,source:'sikorski',text:'Zginął w katastrofie samolotu przy Gibraltarze. Jego śmierć oznaczała utratę zarówno premiera, jak i Naczelnego Wodza. Sensacyjne hipotezy o zamachu nie są tu przedstawiane jako ustalone fakty.'},
 {name:'Wernher von Braun i V–2',kind:'NAUKA I ZBRODNIE',date:'1943–1945',stamp:'V–2',source:'braun',text:'Rakiety V–2 produkowano w Mittelwerk, wykorzystując niewolniczą pracę więźniów Mittelbau-Dora. Według NASA von Braun znał straszne warunki i uczestniczył w decyzjach dotyczących tej pracy.'},
 {name:'Ford: dwa oblicza wojny',kind:'FIRMY I WOJNA',date:'II WOJNA ŚWIATOWA',stamp:'FORD',source:'ford',text:'Amerykańska Ford Motor Company produkowała dla aliantów. Równocześnie niemiecka Ford Werke, pod kontrolą nazistowską, produkowała pojazdy dla Niemiec i wykorzystywała robotników przymusowych. Trzeba rozróżniać te zakłady.'},
 {name:'Otto Hahn',kind:'NAUKA',date:'NOBEL 1944',stamp:'NOBEL',source:'hahn',text:'Otrzymał Nagrodę Nobla z chemii za odkrycie rozszczepienia ciężkich jąder atomowych. Nagroda dotyczyła odkrycia naukowego — nie zbudowania niemieckiej bomby atomowej.'},
 {name:'gen. Stanisław Maczek',kind:'DOWÓDCY',date:'1944',portrait:3,source:'maczek',text:'Wyzwolenie Bredy jest pamiętane również dlatego, że Maczek starał się ograniczać straty mieszkańców i zniszczenia miasta. Zwycięstwo wojskowe nie musiało oznaczać zrównania miasta z ziemią.'},
 {name:'Wernher von Braun',kind:'NAUKA PO WOJNIE',date:'1945',stamp:'PAPERCLIP',source:'braun',text:'W ramach programu Paperclip trafił z grupą niemieckich specjalistów rakietowych do USA. Zanim dołączył do NASA, przez 15 lat pracował przy rakietach dla amerykańskiej armii.'}
];
let archiveCursor=0,archiveLayer='b';
function showArchiveFact(){
 const entry=ARCHIVE_FACTS[archiveCursor%ARCHIVE_FACTS.length],next=archiveLayer==='a'?'b':'a',card=$('historian-'+next),portrait=card.querySelector('.historian-portrait'),source=ARCHIVE_SOURCES[entry.source];
 portrait.style.backgroundImage=entry.portrait===undefined?'none':'url("assets/commanders.webp?v=6")';
 portrait.style.backgroundPosition=entry.portrait===undefined?'':(entry.portrait*100/3)+'% 50%';portrait.textContent=entry.portrait===undefined?entry.stamp:'';portrait.classList.toggle('archive-stamp',entry.portrait===undefined);
 card.querySelector('strong').textContent=entry.name;card.querySelector('.archive-category').textContent=entry.kind+' / '+entry.date;
 card.querySelector('.archive-fact').textContent=entry.text;
 card.querySelector('.archive-art-note').textContent=entry.portrait===undefined?'Karta archiwalna':'Portret historyczny · ilustracja';
 const link=card.querySelector('.archive-source');link.href=source[1];link.textContent='Źródło: '+source[0]+' ↗';
 $('historian-'+archiveLayer).classList.remove('active');$('historian-'+archiveLayer).setAttribute('aria-hidden','true');card.classList.add('active');card.setAttribute('aria-hidden','false');archiveLayer=next;
 $('archive-count').textContent=(archiveCursor%ARCHIVE_FACTS.length+1)+' / '+ARCHIVE_FACTS.length;archiveCursor++;
}
document.getElementById('archive-next').onclick=showArchiveFact;
