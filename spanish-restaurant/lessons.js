'use strict';
// A simple vocabulary level within the same three game modes.
const CocinaLessons=(()=>{
 const basicFoods=['pan','jamon','queso','huevo','carne','pollo','pescado','cutlet','patata','arroz','pasta','fries','lechuga','tomate','pepino','manzana','platano','naranja','leche','agua','zumo','limonada','cola','pizza','burger','helado'];
 const dishes=[
  ['chicken-rice',['pollo','arroz'],['Pollo con arroz','Chicken with rice','Pollo con riso','Kurczak z ryżem']],
  ['fish-potatoes',['pescado','patata'],['Pescado con patatas','Fish with potatoes','Pesce con patate','Ryba z ziemniakami']],
  ['egg-bread',['huevo','pan'],['Huevos con pan','Eggs with bread','Uova con pane','Jajka z chlebem']],
  ['ham-sandwich',['pan','jamon'],['Bocadillo de jamón','Ham sandwich','Panino al prosciutto','Kanapka z szynką']],
  ['cheese-sandwich',['pan','queso'],['Bocadillo de queso','Cheese sandwich','Panino al formaggio','Kanapka z serem']],
  ['simple-salad',['lechuga','tomate','pepino'],['Ensalada','Salad','Insalata','Sałatka']],
  ['meat-fries',['carne','fries'],['Carne con patatas fritas','Meat with fries','Carne con patatine fritte','Mięso z frytkami']],
  ['cutlet-potatoes',['cutlet','patata'],['Escalope con patatas','Schnitzel with potatoes','Cotoletta con patate','Kotlet z ziemniakami']],
  ['simple-pizza',['pizza'],['Pizza','Pizza','Pizza','Pizza']],
  ['simple-burger',['burger'],['Hamburguesa','Burger','Hamburger','Burger']]
 ];
 // Cue language is the menu language; answer tiles use the practice language.
 const dialogs=[
  [['Powiedz: Lubię jabłka.','Say: I like apples.','Di’: Mi piacciono le mele.'],[['Me gustan','las manzanas.'],['I like','apples.'],['Mi piacciono','le mele.']],[['No me gustan','los plátanos.'],['I do not like','bananas.'],['Non mi piacciono','le banane.']]],
  [['Powiedz: Lubię kurczaka.','Say: I like chicken.','Di’: Mi piace il pollo.'],[['Me gusta','el pollo.'],['I like','chicken.'],['Mi piace','il pollo.']],[['Me gustan','el pescado.'],['I likes','fish.'],['Mi piacciono','il pesce.']]],
  [['Powiedz: Nie lubię ryby.','Say: I do not like fish.','Di’: Non mi piace il pesce.'],[['No me gusta','el pescado.'],['I do not like','fish.'],['Non mi piace','il pesce.']],[['Me gusta','el pollo.'],['I like','chicken.'],['Mi piace','il pollo.']]],
  [['Poproś o wodę.','Ask for water.','Chiedi dell’acqua.'],[['Agua,','por favor.'],['Water,','please.'],['Acqua,','per favore.']],[['Leche,','gracias.'],['Milk,','thanks.'],['Latte,','grazie.']]],
  [['Poproś o sok.','Ask for juice.','Chiedi un succo.'],[['Zumo,','por favor.'],['Juice,','please.'],['Succo,','per favore.']],[['Agua,','gracias.'],['Water,','thanks.'],['Acqua,','grazie.']]],
  [['Powiedz: Chcę pizzę.','Say: I would like a pizza.','Di’: Vorrei una pizza.'],[['Quiero','una pizza.'],['I would like','a pizza.'],['Vorrei','una pizza.']],[['Quieres','una hamburguesa.'],['You would like','a burger.'],['Vorresti','un hamburger.']]],
  [['Powiedz: Jestem głodna.','Say: I am hungry.','Di’: Ho fame.'],[['Tengo','hambre.'],['I am','hungry.'],['Ho','fame.']],[['Tienes','sed.'],['You are','thirsty.'],['Hai','sete.']]],
  [['Powiedz: Jestem spragniona.','Say: I am thirsty.','Di’: Ho sete.'],[['Tengo','sed.'],['I am','thirsty.'],['Ho','sete.']],[['Tienes','hambre.'],['You are','hungry.'],['Hai','fame.']]],
  [['Poproś o kanapkę z serem.','Ask for a cheese sandwich.','Chiedi un panino al formaggio.'],[['Un bocadillo','de queso,','por favor.'],['A cheese','sandwich,','please.'],['Un panino','al formaggio,','per favore.']],[['de jamón,','gracias.'],['ham','thanks.'],['al prosciutto,','grazie.']]],
  [['Podziękuj za posiłek.','Say thank you for the meal.','Ringrazia per il pasto.'],[['Gracias','por la comida.'],['Thank you','for the meal.'],['Grazie','per il pasto.']],[['Hola','por el agua.'],['Hello','for the water.'],['Ciao','per l’acqua.']]]
 ];
 const languageIndex=()=>['es','en','it'].indexOf(CocinaI18n.practice),uiIndex=()=>['pl','en','it'].indexOf(CocinaI18n.ui);
 const isBasic=()=>CocinaI18n.level==='aga5';
 function foods(){return isBasic()?FOODS.filter(f=>basicFoods.includes(f.id)):FOODS}
 function lessonDialogs(){if(!isBasic())return DIALOGS;return dialogs.map(([cues,answers,decoys])=>({q:cues[uiIndex()],a:answers[languageIndex()],d:decoys[languageIndex()]}))}
 function lessonDishes(){if(!isBasic())return DISHES;return dishes.map(([id,items,names])=>({id,es:names[languageIndex()],pl:names[{es:0,en:1,it:2,pl:3}[CocinaI18n.ui]],ingredients:items.join(', '),picture:items.find(x=>x!=='pan')||items[0]}))}
 function menuQuestions(){return isBasic()?dishes.map(([id,items])=>[CocinaI18n.order(items,null),id]):MENU_QUESTIONS}
 function drinks(){return isBasic()?['agua','zumo','leche','limonada','cola']:DRINK_FOODS}
 return{foods,dialogs:lessonDialogs,dishes:lessonDishes,menuQuestions,drinks,isBasic};
})();
