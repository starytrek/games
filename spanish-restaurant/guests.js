'use strict';
// Stylized illustrations and fictional restaurant dialogue, not real endorsements or quotes.
const GUESTS=[
{id:'katy',name:'Katy Perry',skin:'#f1c5ad',hair:'#202536',shirt:'#dc6d9c',style:'bob',lip:'#b64365',location:'barra',tag:'NOC POPU',glasses:false},
{id:'taco',name:'Taco Hemingway',skin:'#e9bb9b',hair:'#3c302c',shirt:'#657969',style:'short',beard:true,location:'mesa',tag:'STOLIK HIP-HOP',glasses:false},
{id:'snoop',name:'Snoop Dogg',skin:'#b67b55',hair:'#2c2827',shirt:'#608fbb',style:'braids',beard:true,hat:true,glasses:true,location:'barra',tag:'GOŚĆ SPECJALNY'},
{id:'dua',name:'Dua Lipa',skin:'#e3b18c',hair:'#29242e',shirt:'#8c74b5',style:'long',lip:'#aa5366',location:'mesa',tag:'STOLIK POP',earrings:true},
{id:'bad',name:'Bad Bunny',skin:'#dca77c',hair:'#38302c',shirt:'#e0ac4f',style:'short',beard:true,beanie:true,glasses:true,location:'barra',tag:'LATIN NIGHT'},
{id:'rihanna',name:'Rihanna',skin:'#bb805d',hair:'#773d35',shirt:'#e1c079',style:'long',lip:'#943947',location:'mesa',tag:'GOŚĆ SPECJALNY',earrings:true},
{id:'lucia',name:'Lucía',skin:'#e9bd94',hair:'#795640',shirt:'#d78355',style:'bun',lip:'#ac5961',location:'mesa',tag:'AMIGA DE GABA'},
{id:'mateo',name:'Mateo · DJ',skin:'#c68f69',hair:'#272937',shirt:'#537c7a',style:'short',glasses:true,location:'barra',tag:'PO KONCERCIE'},
{id:'paula',name:'Paula · viajera',skin:'#efc8a6',hair:'#ad6d42',shirt:'#8f9d64',style:'bob',location:'mesa',tag:'PODRÓŻNICZKA'},
{id:'leo',name:'Leo · estudiante',skin:'#996647',hair:'#252424',shirt:'#a47658',style:'short',location:'barra',tag:'WPADŁ PO LEKCJACH'},
{"id": "leo-dicaprio", "name": "Leonardo DiCaprio", "tag": "KINO · NOCNA PREMIERA", "location": "barra", "atlas": "extra", "cell": 0, "recipe": ["pescado", "arroz", "lechuga"]},
{"id": "brad", "name": "Brad Pitt", "tag": "HOLLYWOOD · STOLIK 2", "location": "mesa", "atlas": "extra", "cell": 1, "recipe": ["carne", "patata", "tomate"]},
{"id": "angelina", "name": "Angelina Jolie", "tag": "KINO · PÓŹNA KOLACJA", "location": "mesa", "atlas": "extra", "cell": 2, "recipe": ["huevo", "pan", "pepino"]},
{"id": "margot", "name": "Margot Robbie", "tag": "KINO · PO PREMIERZE", "location": "barra", "atlas": "extra", "cell": 3, "recipe": ["pescado", "patata", "lechuga"]},
{"id": "keanu", "name": "Keanu Reeves", "tag": "KINO · SPOKOJNY STOLIK", "location": "mesa", "atlas": "extra", "cell": 4, "recipe": ["carne", "arroz", "brocoli"]},
{"id": "zendaya", "name": "Zendaya", "tag": "KINO · NOCNE MENU", "location": "mesa", "atlas": "extra", "cell": 5, "recipe": ["huevo", "patata", "tomate"]},
{"id": "johnny", "name": "Johnny Depp", "tag": "KINO · WINYLOWA NOC", "location": "barra", "atlas": "extra", "cell": 6, "recipe": ["jamon", "pan", "aceitunas"]},
{"id": "emma", "name": "Emma Stone", "tag": "KINO · STOLIK PRZY SCENIE", "location": "mesa", "atlas": "extra", "cell": 7, "recipe": ["pescado", "arroz", "pepino"]},
{"id": "ryan", "name": "Ryan Gosling", "tag": "KINO · STOLIK JAZZ", "location": "mesa", "atlas": "extra", "cell": 8, "recipe": ["carne", "patata", "pimiento"]},
{"id": "scarlett", "name": "Scarlett Johansson", "tag": "KINO · NOCNA PREMIERA", "location": "barra", "atlas": "extra", "cell": 9, "recipe": ["pescado", "pan", "tomate"]},
{"id": "robert", "name": "Robert Downey Jr.", "tag": "KINO · GOŚĆ SPECJALNY", "location": "mesa", "atlas": "extra", "cell": 10, "recipe": ["carne", "arroz", "cebolla"]},
{"id": "tom", "name": "Tom Hanks", "tag": "KINO · KOLACJA Z EKIPĄ", "location": "mesa", "atlas": "extra", "cell": 11, "recipe": ["huevo", "patata", "brocoli"]},
{"id": "denzel", "name": "Denzel Washington", "tag": "KINO · STOLIK SOUL", "location": "barra", "atlas": "extra", "cell": 12, "recipe": ["carne", "arroz", "legumbres"]},
{"id": "morgan", "name": "Morgan Freeman", "tag": "KINO · SPOKOJNY WIECZÓR", "location": "mesa", "atlas": "extra", "cell": 13, "recipe": ["pescado", "patata", "pepino"]},
{"id": "meryl", "name": "Meryl Streep", "tag": "KINO · GOŚĆ SPECJALNY", "location": "mesa", "atlas": "extra", "cell": 14, "recipe": ["huevo", "pan", "tomate"]},
{"id": "julia", "name": "Julia Roberts", "tag": "KINO · STOLIK PRZY OKNIE", "location": "barra", "atlas": "extra", "cell": 15, "recipe": ["pescado", "arroz", "lechuga"]},
{"id": "turnau", "name": "Grzegorz Turnau", "tag": "JAZZ · PRZY FORTEPIANIE", "location": "mesa", "atlas": "extra", "cell": 16, "recipe": ["pescado", "patata", "lechuga"]},
{"id": "sanah", "name": "sanah", "tag": "POP · PO KONCERCIE", "location": "mesa", "atlas": "extra", "cell": 17, "recipe": ["huevo", "arroz", "tomate"]},
{"id": "dawid", "name": "Dawid Podsiadło", "tag": "POP · NOCNA ZMIANA", "location": "barra", "atlas": "extra", "cell": 18, "recipe": ["carne", "patata", "brocoli"]},
{"id": "daria", "name": "Daria Zawiałow", "tag": "POP · STOLIK PRZY SCENIE", "location": "mesa", "atlas": "extra", "cell": 19, "recipe": ["pescado", "pan", "pimiento"]},
{"id": "zalewski", "name": "Krzysztof Zalewski", "tag": "SOUL · PO KONCERCIE", "location": "mesa", "atlas": "extra", "cell": 20, "recipe": ["carne", "arroz", "tomate"]},
{"id": "brodka", "name": "Brodka", "tag": "ALTERNATYWA · NOCNE MENU", "location": "barra", "atlas": "extra", "cell": 21, "recipe": ["huevo", "patata", "pepino"]},
{"id": "natalia", "name": "Natalia Przybysz", "tag": "SOUL · STOLIK 3", "location": "mesa", "atlas": "extra", "cell": 22, "recipe": ["pescado", "arroz", "brocoli"]},
{"id": "vito", "name": "Vito Bambino", "tag": "GROOVE · PRZY BARZE", "location": "mesa", "atlas": "extra", "cell": 23, "recipe": ["jamon", "pan", "tomate"]},
{"id": "eminem", "name": "Eminem", "tag": "HIP-HOP · PO KONCERCIE", "location": "barra", "atlas": "extra", "cell": 24, "recipe": ["carne", "patata", "cebolla"]},
{"id": "kendrick", "name": "Kendrick Lamar", "tag": "HIP-HOP · STOLIK 4", "location": "mesa", "atlas": "extra", "cell": 25, "recipe": ["pescado", "arroz", "legumbres"]},
{"id": "drake", "name": "Drake", "tag": "HIP-HOP · NOCNE MENU", "location": "mesa", "atlas": "extra", "cell": 26, "recipe": ["carne", "arroz", "pimiento"]},
{"id": "jayz", "name": "Jay-Z", "tag": "HIP-HOP · GOŚĆ SPECJALNY", "location": "barra", "atlas": "extra", "cell": 27, "recipe": ["carne", "patata", "brocoli"]},
{"id": "beyonce", "name": "Beyoncé", "tag": "SOUL · PO KONCERCIE", "location": "mesa", "atlas": "extra", "cell": 28, "recipe": ["pescado", "arroz", "tomate"]},
{"id": "billie", "name": "Billie Eilish", "tag": "POP · NOCNE MENU", "location": "mesa", "atlas": "extra", "cell": 29, "recipe": ["huevo", "pan", "lechuga"]},
{"id": "taylor", "name": "Taylor Swift", "tag": "POP · GOŚĆ SPECJALNY", "location": "barra", "atlas": "extra", "cell": 30, "recipe": ["pescado", "patata", "tomate"]},
{"id": "bruno", "name": "Bruno Mars", "tag": "FUNK · PRZY BARZE", "location": "mesa", "atlas": "extra", "cell": 31, "recipe": ["jamon", "arroz", "pepino"]},
{"id": "adele", "name": "Adele", "tag": "SOUL · KOLACJA PO BISIE", "location": "mesa", "atlas": "extra", "cell": 32, "recipe": ["carne", "patata", "lechuga"]},
{"id": "gaga", "name": "Lady Gaga", "tag": "POP · STOLIK PRZY SCENIE", "location": "barra", "atlas": "extra", "cell": 33, "recipe": ["huevo", "arroz", "pimiento"]},
{"id": "ed", "name": "Ed Sheeran", "tag": "POP · PO KONCERCIE", "location": "mesa", "atlas": "extra", "cell": 34, "recipe": ["jamon", "pan", "pepino"]},
{"id": "shakira", "name": "Shakira", "tag": "LATIN · NOCNA ZMIANA", "location": "mesa", "atlas": "extra", "cell": 35, "recipe": ["pescado", "arroz", "aceitunas"]},
{"id": "harry", "name": "Harry Styles", "tag": "POP · NOCNE MENU", "location": "barra", "atlas": "extra", "cell": 36, "recipe": ["huevo", "patata", "tomate"]},
{"id": "weeknd", "name": "The Weeknd", "tag": "R&B · PRZY BARZE", "location": "mesa", "atlas": "extra", "cell": 37, "recipe": ["carne", "arroz", "legumbres"]},
{"id": "rosalia", "name": "Rosalía", "tag": "LATIN · PO KONCERCIE", "location": "mesa", "atlas": "extra", "cell": 38, "recipe": ["jamon", "pan", "aceitunas"]},
{"id": "mama", "name": "Twoja Stara", "tag": "SZEFOWA OSIEDLA · GOŚĆ SPECJALNY", "location": "barra", "atlas": "extra", "cell": 39, "recipe": ["carne", "patata", "pepino"]}
];
function guestPortrait(g){if(g.id==='leo-dicaprio')return `<img class="comic-portrait solo-portrait" src="assets/leonardo-dicaprio-v2.webp" alt="Komiksowy portret: Leonardo DiCaprio" width="512" height="512">`;const extra=g.atlas==='extra',i=extra?g.cell:GUESTS.findIndex(x=>x.id===g.id),cols=extra?8:5,rows=extra?5:2,x=(i%cols)*100/(cols-1),y=Math.floor(i/cols)*100/(rows-1);return `<span class="comic-portrait ${extra?'extra-cast':''}" role="img" aria-label="Komiksowy portret: ${g.name}" style="background-position:${x}% ${y}%"></span>`;}
const GUEST_RECIPES=[['pescado','arroz','tomate'],['carne','patata','lechuga'],['jamon','pan','pepino'],['huevo','arroz','brocoli'],['carne','pan','pimiento'],['pescado','patata','aceitunas'],['huevo','pan','tomate'],['jamon','arroz','pepino'],['pescado','pan','lechuga'],['carne','patata','legumbres']];
GUESTS.forEach((g,i)=>{if(!g.recipe)g.recipe=GUEST_RECIPES[i%GUEST_RECIPES.length];});
function guestMeal(g){const recipe=[...g.recipe];if(Math.random()<.35)recipe[2]=VEG_FOODS[Math.floor(Math.random()*VEG_FOODS.length)];return recipe;}
function renderGuestbook(){return GUESTS.map(g=>`<div class="cast-card">${guestPortrait(g)}<strong>${g.name}</strong><small>${g.tag}</small><p>W grze lubi: ${g.recipe.map(short).join(', ')}.</p></div>`).join('');}
function barDrinks(){return `<span class="bar-drinks" aria-hidden="true"><svg viewBox="0 0 150 75"><path d="M12 9h35L30 34v27m-12 0h24" fill="none" stroke="#8de9e7" stroke-width="3"/><path d="M16 14h27L30 31Z" fill="#ed73b5"/><circle cx="44" cy="11" r="8" fill="#aacb52"/><path d="M66 12h26l-3 43H69Z" fill="#f7b348" stroke="#f9d39b" stroke-width="2"/><path d="M80 36l13-33" stroke="#f6eecc" stroke-width="3"/><path d="M112 10h28l-3 44h-22Z" fill="#80cabc" stroke="#bbfff2" stroke-width="2"/><path d="M124 30l13-27" stroke="#f5dbed" stroke-width="3"/><circle cx="113" cy="10" r="8" fill="#eec764"/></svg></span>`;}
function customer(text,label='ZAMÓWIENIE PO HISZPAŃSKU'){
 const g=session.guest||GUESTS[0],atBar=g.location==='barra';
 return `<div class="guest-scene ${atBar?'at-bar':'at-table'}"><div class="guest-seat"><div class="venue-light" aria-hidden="true"></div><span class="venue-sign">${atBar?'LA BARRA':'MESA '+(session.round%4+1)}</span><div class="guest-portrait">${guestPortrait(g)}</div><div class="restaurant-counter" aria-hidden="true"><span>GABA’S NIGHT DINER</span>${barDrinks()}</div><span class="guest-name">${g.name}</span></div><div class="customer"><div class="bubble"><small>${g.tag} · ${label}</small><h2>${text}</h2><span class="guest-note">Rysunkowy gość · fikcyjna scenka językowa</span></div></div></div>`;
}
