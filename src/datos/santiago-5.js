/* Santiago 5 — páginas, notas del griego, preguntas y repaso.
   N(versículo, 'palabra exacta del texto', 'griego', 'transliteración', 'significado', 'explicación')
   La palabra debe aparecer tal cual en ese versículo (herramientas/verificar.py lo comprueba). */
const BOOK = { name: 'Santiago', ch: 5, key: 'stgo5-page' };

const NBLA = __NBLA__;          // se llena con texto/santiago-5.txt
const HEADINGS = __TITULOS__;   // títulos de sección del mismo archivo

const SECTIONS = {
  intro:  { name: 'Antes de empezar', color: 'var(--ochre)', long: 2 },
  s1:     { name: HEADINGS[1]  || 'Advertencias a los ricos',   color: 'var(--red)',  long: 1, from: 1,  to: 6 },
  s2:     { name: HEADINGS[7]  || 'Exhortación a la paciencia', color: 'var(--teal)', long: 4, from: 7,  to: 11 },
  s3:     { name: HEADINGS[12] || 'Exhortaciones varias',       color: 'var(--sage)', long: 3, from: 12, to: 20 },
  repaso: { name: 'Repaso', color: 'var(--sage)', long: 3 }
};
const INTRO = { title: 'La última página', ref: 'Santiago 4 y 5', vig: 'scroll' };
const RECAP_TITLE = 'Acumular o esperar';
const N = (v, k, gr, tr, gloss, body, occ) => ({ v, k, gr, tr, gloss, body, occ: occ || 1 });

const TEXT_PAGES = [
  { sec: 's1', vv: [1, 3], title: 'Riquezas podridas', vig: 'coins',
    notes: [
      N(1, 'Oigan ahora', 'Ἄγε νῦν', 'Age nyn', '¡vamos, ahora!', 'La misma llamada enérgica de 4:13. Allí hablaba a los comerciantes que hacían planes sin Dios; aquí, a los ricos que oprimen.'),
      N(1, 'aúllen', 'ὀλολύζοντες', 'ololyzontes', 'aullando', 'Una palabra que suena a lo que dice: gemir a gritos. Los profetas la usaban al anunciar el juicio (Isaías 13:6). Única vez en el Nuevo Testamento.'),
      N(1, 'miserias', 'ταλαιπωρίαις', 'talaipōriais', 'desdichas', 'De la misma raíz que «Aflíjanse» en 4:9. Allí llamó a afligirse ante Dios por voluntad propia; aquí anuncia la desdicha que llega a quien no lo hizo.'),
      N(2, 'podrido', 'σέσηπεν', 'sesēpen', 'se ha podrido', 'Quizá habla del grano y los alimentos almacenados. Santiago lo dice en pasado, como si ya hubiera ocurrido: así de seguro es.'),
      N(2, 'polilla', 'σητόβρωτα', 'sētobrōta', 'comidas por la polilla', 'Única vez en el Nuevo Testamento. Es eco de Jesús: no acumulen tesoros en la tierra, donde la polilla y el óxido destruyen (Mateo 6:19–20).'),
      N(3, 'oxidado', 'κατίωται', 'katiōtai', 'se ha oxidado', 'El oro y la plata no se oxidan. Santiago exagera a propósito: hasta lo que parece eterno se corrompe.'),
      N(3, 'herrumbre', 'ἰός', 'ios', 'herrumbre', 'La misma palabra que en 3:8 era el veneno de la lengua. La riqueza que nunca ayudó a nadie será un testigo en contra de su dueño.'),
      N(3, 'últimos días', 'ἐν ἐσχάταις ἡμέραις', 'en eschatais hēmerais', 'en los últimos días', 'Acumularon justo cuando el tiempo se acaba. Para el Nuevo Testamento, los últimos días empezaron con Jesús (Hechos 2:17; Hebreos 1:2).')
    ],
    observe: { q: '¿Qué les pasa a los tres tipos de riqueza que menciona Santiago?',
               a: 'Las riquezas se pudren, la ropa se apolilla y el oro y la plata se oxidan (vv. 2–3). Todo lo acumulado se corrompe.' },
    apply: '¿Qué guardas que se está echando a perder mientras alguien más lo necesita?',
    links: [['Mateo 6:19–21', 'Tesoros en el cielo, donde la polilla y el óxido no destruyen.'], ['1 Timoteo 6:17–19', 'A los ricos: ser generosos y ricos en buenas obras.']]
  },
  { sec: 's1', vv: [4, 6], title: 'El clamor de los segadores', vig: 'sheaf',
    notes: [
      N(4, 'jornal', 'ὁ μισθός', 'ho misthos', 'el salario', 'La ley mandaba pagar al jornalero el mismo día, antes de ponerse el sol, porque vivía de ese pago (Deuteronomio 24:14–15; Levítico 19:13).'),
      N(4, 'retenido', 'ἀπεστερημένος', 'apesterēmenos', 'defraudado', 'Retener el salario es robar. Jesús lo nombró entre los mandamientos: no defraudes (Marcos 10:19). Y ese salario «clama», como la sangre de Abel (Génesis 4:10).'),
      N(4, 'Señor de los ejércitos', 'κυρίου Σαβαώθ', 'kyriou Sabaōth', 'el Señor de los ejércitos', 'Santiago deja la palabra hebrea Sabaot, que solo aparece aquí y en Romanos 9:29. El que manda los ejércitos del cielo escucha a unos segadores pobres (compara Isaías 5:9).'),
      N(5, 'lujosamente', 'ἐτρυφήσατε', 'etryphēsate', 'vivieron en el lujo', 'Única vez en el Nuevo Testamento: una vida blanda y cómoda mientras otros pasaban necesidad.'),
      N(5, 'placer desenfrenado', 'ἐσπαταλήσατε', 'espatalēsate', 'vivieron en derroche', 'Pablo usa la misma palabra para la persona que vive para el placer (1 Timoteo 5:6).'),
      N(5, 'matanza', 'ἐν ἡμέρᾳ σφαγῆς', 'en hēmera sphagēs', 'en el día de la matanza', 'Como el ganado que sigue comiendo el mismo día en que lo van a matar, sin darse cuenta. La imagen viene de Jeremías 12:3.'),
      N(6, 'justo', 'τὸν δίκαιον', 'ton dikaion', 'el justo', 'Cualquier inocente pobre que pierde un juicio injusto. Los primeros cristianos también recordaban a Jesús, «el Justo» (Hechos 7:52).'),
      N(6, 'resistencia', 'οὐκ ἀντιτάσσεται', 'ouk antitassetai', 'no se les opone', 'Es el mismo verbo de 4:6, «Dios resiste a los soberbios». El justo no les hace resistencia, pero Dios sí.')
    ],
    observe: { q: '¿Quién escucha el clamor de los segadores?',
               a: 'El Señor de los ejércitos (v. 4). Los ricos no los escuchan, pero Dios sí.' },
    apply: '¿Le debes algo a alguien que has estado reteniendo: un pago, un reconocimiento, una palabra?',
    links: [['Deuteronomio 24:14–15', 'Pagar al jornalero su salario el mismo día.'], ['Malaquías 3:5', 'Dios será testigo contra los que oprimen al jornalero.']]
  },
  { sec: 's2', vv: [7, 8], title: 'Como el labrador', vig: 'rain',
    notes: [
      N(7, 'pacientes', 'μακροθυμήσατε', 'makrothymēsate', 'sean de ánimo largo', 'Literalmente, «largos de ánimo»: la paciencia con las personas, lo contrario de la mecha corta. Recuerda 1:19, lentos para la ira.'),
      N(7, 'venida', 'παρουσία', 'parousia', 'presencia, llegada', 'Era la palabra para la visita de un rey a una ciudad. Los cristianos la usaron para el regreso de Jesús (Mateo 24:27; 1 Tesalonicenses 4:15).'),
      N(7, 'labrador', 'γεωργός', 'geōrgos', 'agricultor', 'El que trabaja la tierra. De esta palabra viene el nombre Jorge.'),
      N(7, 'fruto precioso', 'τίμιον καρπόν', 'timion karpon', 'fruto valioso', 'La cosecha vale la espera. Pedro usa el mismo adjetivo para la sangre preciosa de Cristo (1 Pedro 1:19).'),
      N(7, 'lluvia temprana', 'πρόϊμον καὶ ὄψιμον', 'proimon kai opsimon', 'la temprana y la tardía', 'En Israel, la lluvia temprana cae en octubre y noviembre, al sembrar, y la tardía en marzo y abril, antes de la cosecha (Deuteronomio 11:14; Joel 2:23). El labrador no puede hacer que llueva: espera.'),
      N(8, 'Fortalezcan', 'στηρίξατε', 'stērixate', 'afirmen', 'Como poner un tutor a una planta para que no se doble. Jesús le dijo lo mismo a Pedro: fortalece a tus hermanos (Lucas 22:32).'),
      N(8, 'está cerca', 'ἤγγικεν', 'ēngiken', 'se ha acercado', 'El mismo verbo de 4:8, «acérquense a Dios», y de la predicación de Jesús: el reino de los cielos se ha acercado (Mateo 4:17).')
    ],
    observe: { q: '¿Qué puede hacer el labrador mientras espera, y qué no puede hacer?',
               a: 'Puede sembrar, cuidar el campo y esperar con paciencia. No puede hacer que llueva: la lluvia temprana y la tardía dependen de Dios (v. 7).' },
    apply: '¿En qué situación estás esperando una lluvia que no puedes controlar? ¿Cómo sería esperar como el labrador?',
    links: [['Deuteronomio 11:14', 'Dios promete la lluvia temprana y la tardía.'], ['Gálatas 6:9', 'No nos cansemos de hacer el bien: a su tiempo cosecharemos.']]
  },
  { sec: 's2', vv: [9, 11], title: 'La paciencia de Job', vig: 'door',
    notes: [
      N(9, 'quejen', 'στενάζετε', 'stenazete', 'giman', 'Bajo presión es fácil desquitarse con el que está al lado. Santiago pide no convertir el sufrimiento en queja contra los hermanos.'),
      N(9, 'a las puertas', 'πρὸ τῶν θυρῶν', 'pro tōn thyrōn', 'ante las puertas', 'Jesús usó la misma imagen: cuando vean estas cosas, sepan que está cerca, a las puertas (Mateo 24:33). Es el mismo Juez de 4:12.'),
      N(10, 'ejemplo', 'ὑπόδειγμα', 'hypodeigma', 'modelo para copiar', 'Jesús usó esta palabra al lavar los pies de sus discípulos: les he dado ejemplo (Juan 13:15).'),
      N(10, 'aflicción', 'κακοπαθίας', 'kakopathias', 'sufrimiento', 'Sufrir el mal. Es la raíz del «¿Sufre alguien?» del v. 13.'),
      N(11, 'bienaventurados', 'μακαρίζομεν', 'makarizomen', 'los llamamos dichosos', 'Santiago empezó la carta así: dichoso el que soporta la prueba (1:12).'),
      N(11, 'paciencia de Job', 'ὑπομονή', 'hypomonē', 'aguante, perseverancia', 'No es la misma palabra de los vv. 7–8. Esta es la resistencia bajo la prueba (1:3–4). Job no sufrió en silencio, se quejó con fuerza, pero no soltó a Dios.'),
      N(11, 'resultado', 'τὸ τέλος κυρίου', 'to telos kyriou', 'el final que dio el Señor', 'Lo que el Señor hizo al final de la historia de Job: le devolvió el doble de lo que tenía (Job 42:10–17).'),
      N(11, 'compasivo', 'πολύσπλαγχνος', 'polysplanchnos', 'de entrañas grandes', 'Única vez en el Nuevo Testamento. Las entrañas eran el lugar de la compasión. Es el retrato de Dios en Éxodo 34:6 y el Salmo 103:8.')
    ],
    observe: { q: '¿Qué dos ejemplos de paciencia da Santiago?',
               a: 'Los profetas que hablaron en el nombre del Señor (v. 10) y Job (v. 11). Todos sufrieron, y Dios no los abandonó.' },
    apply: '¿Contra quién te has quejado últimamente? ¿Qué cambiaría si recordaras que el Juez está a la puerta?',
    links: [['Job 42:10–12', 'El Señor restauró a Job.'], ['Mateo 5:11–12', 'Así persiguieron a los profetas.']]
  },
  { sec: 's3', vv: [12, 12], title: 'Que su sí sea sí', vig: 'plumb',
    notes: [
      N(12, 'sobre todo', 'Πρὸ πάντων', 'Pro pantōn', 'antes que nada', 'Marca algo importante para el cierre de la carta. Pedro usa la misma expresión antes de decir que el amor cubre multitud de pecados (1 Pedro 4:8), la misma frase con que termina Santiago.'),
      N(12, 'no juren', 'μὴ ὀμνύετε', 'mē omnyete', 'no juren', 'Es casi palabra por palabra lo que enseñó Jesús en el Sermón del Monte (Mateo 5:33–37).'),
      N(12, 'ni por el cielo', 'μήτε τὸν οὐρανόν', 'mēte ton ouranon', 'ni por el cielo', 'Algunos juraban por el cielo o por la tierra para no nombrar a Dios y dejarse una salida. Jesús respondió que todo es de Dios: el cielo es su trono y la tierra el estrado de sus pies (Mateo 5:34–35).'),
      N(12, 'el sí de ustedes, sí', 'τὸ ναὶ ναί', 'to nai nai', 'que el sí sea sí', 'Una palabra que no necesita juramento para ser creída. Pablo dice que en Cristo todas las promesas de Dios son «sí» (2 Corintios 1:17–20).'),
      N(12, 'juicio', 'ὑπὸ κρίσιν', 'hypo krisin', 'bajo juicio', 'Otra vez el tema de la lengua: las palabras también serán juzgadas (compara 3:1).')
    ],
    observe: { q: '¿Qué enseñanza de Jesús repite Santiago casi palabra por palabra?',
               a: 'La del Sermón del Monte: no juren de ninguna manera, que su sí sea sí y su no, no (Mateo 5:33–37).' },
    apply: '¿En qué conversaciones sientes que tienes que jurar o exagerar para que te crean? ¿Qué te haría confiable sin juramentos?',
    links: [['Mateo 5:33–37', 'No juren de ninguna manera.'], ['2 Corintios 1:17–20', 'En Cristo todas las promesas son «sí».']]
  },
  { sec: 's3', vv: [13, 15], title: 'La oración de fe', vig: 'oil',
    notes: [
      N(13, 'Sufre', 'κακοπαθεῖ', 'kakopathei', 'sufre el mal', 'La misma raíz de la «aflicción» de los profetas (v. 10). La respuesta al sufrimiento no es la queja (v. 9) sino la oración.'),
      N(13, 'cante alabanzas', 'ψαλλέτω', 'psalletō', 'que cante salmos', 'Al principio significaba tocar las cuerdas de un instrumento; de aquí viene «salmo». La alegría también se lleva a Dios (Efesios 5:19).'),
      N(14, 'ancianos', 'τοὺς πρεσβυτέρους', 'tous presbyterous', 'los presbíteros', 'Los líderes de la iglesia local (Hechos 14:23; 20:17). El enfermo toma la iniciativa: los llama.'),
      N(14, 'aceite', 'ἐλαίῳ', 'elaiō', 'con aceite', 'El aceite era la medicina común de la época, como en la parábola del buen samaritano (Lucas 10:34), y también una señal de que la persona se pone en manos de Dios. Los discípulos ungían a los enfermos (Marcos 6:13).'),
      N(15, 'oración de fe', 'ἡ εὐχὴ τῆς πίστεως', 'hē euchē tēs pisteōs', 'la oración hecha con fe', 'Recuerda 1:6: pedir con fe, sin dudar. El poder no está en el aceite ni en quien ora: el Señor es quien levanta.'),
      N(15, 'restaurará', 'σώσει', 'sōsei', 'salvará', 'El mismo verbo sirve para sanar el cuerpo y para salvar la vida. Jesús le dijo a la mujer enferma: tu fe te ha sanado (Marcos 5:34).'),
      N(15, 'levantará', 'ἐγερεῖ', 'egerei', 'levantará', 'El verbo de la resurrección. Jesús tomó de la mano a la suegra de Pedro y la levantó (Marcos 1:31).')
    ],
    observe: { q: 'Santiago menciona tres situaciones en los vv. 13–14. ¿Qué respuesta da a cada una?',
               a: 'Si alguien sufre, que ore. Si está alegre, que cante alabanzas. Si está enfermo, que llame a los ancianos para que oren por él. Todo termina en oración.' },
    apply: '¿Hay alguien enfermo o sufriendo a quien podrías visitar u ofrecerle orar juntos esta semana?',
    links: [['Marcos 6:13', 'Los discípulos ungían con aceite a muchos enfermos.'], ['Filipenses 4:6', 'En todo, oración y gratitud.']]
  },
  { sec: 's3', vv: [16, 18], title: 'Como Elías', vig: 'elijah',
    notes: [
      N(16, 'confiésense', 'ἐξομολογεῖσθε', 'exomologeisthe', 'confiesen abiertamente', 'Una confesión mutua entre hermanos, no solo ante Dios (compara 1 Juan 1:9). Lo escondido pierde fuerza cuando se dice en voz alta ante alguien que ora por nosotros.'),
      N(16, 'sanados', 'ἰαθῆτε', 'iathēte', 'sean sanados', 'Sanidad del cuerpo y del alma. Pedro usa la misma forma: por sus heridas fueron sanados (1 Pedro 2:24).'),
      N(16, 'oración eficaz', 'δέησις ἐνεργουμένη', 'deēsis energoumenē', 'súplica que actúa', 'De energoumenē viene «energía». Es una oración que está obrando.'),
      N(16, 'justo', 'δικαίου', 'dikaiou', 'el justo', 'En el v. 6 el justo sufría bajo los ricos; aquí el justo ora, y su oración tiene poder. Y Elías muestra que «justo» no quiere decir perfecto.'),
      N(17, 'pasiones semejantes', 'ὁμοιοπαθής', 'homoiopathēs', 'de la misma naturaleza', 'Pablo y Bernabé dijeron lo mismo en Listra: somos hombres como ustedes (Hechos 14:15). Después de su gran victoria, Elías huyó con miedo y quiso morir (1 Reyes 19:4).'),
      N(17, 'oró fervientemente', 'προσευχῇ προσηύξατο', 'proseuchē prosēuxato', 'oró con oración', 'Una forma hebrea de dar énfasis, repitiendo la misma palabra: oró de verdad.'),
      N(17, 'tres años y seis meses', 'ἐνιαυτοὺς τρεῖς καὶ μῆνας ἕξ', 'eniautous treis kai mēnas hex', 'tres años y seis meses', 'La historia está en 1 Reyes 17–18. Jesús menciona el mismo tiempo en Lucas 4:25.'),
      N(18, 'Oró de nuevo', 'πάλιν προσηύξατο', 'palin prosēuxato', 'volvió a orar', 'En el monte Carmelo, Elías oró inclinado hasta el suelo siete veces, hasta que subió del mar una nube pequeña como la mano de un hombre (1 Reyes 18:42–45).')
    ],
    observe: { q: '¿Por qué dice Santiago que Elías era «un hombre de pasiones semejantes a las nuestras»?',
               a: 'Para que nadie piense que la oración poderosa es solo para gente especial. Elías era como nosotros, y Dios respondió su oración (vv. 17–18).' },
    apply: '¿Con quién podrías tener la confianza de confesar tus luchas y orar juntos?',
    links: [['1 Reyes 18:41–45', 'Elías ora siete veces y sube una nube pequeña.'], ['1 Juan 1:9', 'Si confesamos nuestros pecados, Él es fiel para perdonar.']]
  },
  { sec: 's3', vv: [19, 20], title: 'El hermano que se extravía', vig: 'sheep',
    notes: [
      N(19, 'se extravía', 'πλανηθῇ', 'planēthē', 'se desvía', 'Andar errante. De esta raíz viene «planeta», la estrella que vaga. Santiago ya había advertido: no se engañen (1:16).'),
      N(19, 'le hace volver', 'ἐπιστρέψῃ', 'epistrepsē', 'lo hace dar la vuelta', 'Es la palabra de la conversión (Hechos 3:19). Jesús le dijo a Pedro: cuando hayas vuelto, fortalece a tus hermanos (Lucas 22:32).'),
      N(20, 'error de su camino', 'ἐκ πλάνης ὁδοῦ αὐτοῦ', 'ek planēs hodou autou', 'del extravío de su camino', 'La vida como un camino, como en el Salmo 1. Y Jesús contó del pastor que deja a las noventa y nueve para buscar a la oveja perdida (Lucas 15:4–7).'),
      N(20, 'salvará su alma de muerte', 'σώσει ψυχὴν αὐτοῦ ἐκ θανάτου', 'sōsei psychēn autou ek thanatou', 'salvará su vida de la muerte', 'Santiago empezó advirtiendo que el pecado, cuando madura, da a luz la muerte (1:15). Termina con alguien que rescata a otro de ese final.'),
      N(20, 'multitud de pecados', 'καλύψει πλῆθος ἁμαρτιῶν', 'kalypsei plēthos hamartiōn', 'cubrirá multitud de pecados', 'Eco de Proverbios 10:12: el amor cubre todas las faltas. Pedro dice lo mismo (1 Pedro 4:8).')
    ],
    observe: { q: '¿Cómo termina Santiago su carta? ¿Qué nos encarga?',
               a: 'No con un saludo, sino con una misión: buscar al hermano que se extravía y ayudarle a volver. El que lo hace salva una vida de la muerte (vv. 19–20).' },
    apply: '¿Hay alguien que se ha alejado de la fe o de la comunidad? ¿Qué primer paso podrías dar para buscarlo?',
    links: [['Lucas 15:4–7', 'El pastor que busca la oveja perdida.'], ['Gálatas 6:1', 'Restaurar con mansedumbre al que cae.']]
  }
];

const MEMO = { v: 16 };

function introBody(){
  const outline = ['s1', 's2', 's3'].map(k => {
    const s = SECTIONS[k], pi = pageOfVerse(s.from);
    return `<li><button data-go="${pi}" style="--c:${s.color}"><i></i><span><small>vv. ${s.from}–${s.to}</small><b>${s.name}</b></span>${ICON.arrow}</button></li>`;
  }).join('');
  return `
    <div class="prose">
      <p>Santiago 5 cierra la carta. Empieza donde terminó el capítulo 4: después de hablar a los comerciantes que hacían planes sin Dios (4:13–17), ahora habla a los ricos que acumulan y oprimen.</p>
      <p>Luego se vuelve a los hermanos que sufren esa injusticia y los anima a esperar con paciencia la venida del Señor. Termina con consejos prácticos sobre la palabra dada, la oración, la confesión y el cuidado de los que se extravían.</p>
      <p>La carta termina donde empezó. En el capítulo 1 habló de la paciencia en las pruebas (1:2–4) y de pedir a Dios (1:5). El capítulo 5 vuelve a la paciencia (vv. 7–11) y a la oración (vv. 13–18).</p>
      <ul class="outline">${outline}</ul>
      <p>Y una palabra para el camino: el Señor es muy compasivo y misericordioso (5:11).</p>
    </div>`;
}
function recapBody(){
  const low = [['Acumulan tesoros', 'v. 3'], ['Retienen el jornal', 'v. 4'], ['Viven en lujo y placer', 'v. 5'], ['Engordan su corazón', 'v. 5'], ['Condenan al justo', 'v. 6']];
  const high = [['Esperan como el labrador', 'v. 7'], ['Fortalecen su corazón', 'v. 8'], ['No se quejan', 'v. 9'], ['Su sí es sí', 'v. 12'], ['Oran en todo', 'vv. 13–14'], ['Confiesan y oran juntos', 'v. 16'], ['Buscan al extraviado', 'v. 19']];
  const imgs = [['Polilla', 2], ['Herrumbre', 3], ['Segadores', 4], ['Labrador', 7], ['Las puertas', 9], ['Job', 11], ['Aceite', 14], ['Elías', 17]];
  const letter = [
    [1, 'Pruebas que maduran, sabiduría que se pide y una palabra que se practica.'],
    [2, 'Fe sin favoritismos: la fe verdadera se ve en las obras.'],
    [3, 'La lengua y la sabiduría que viene de lo alto.'],
    [4, 'Humildad: Dios resiste a los soberbios y da mayor gracia.'],
    [5, 'Paciencia y oración hasta que venga el Señor.']
  ];
  const li = a => a.map(([t, r]) => `<li><span>${t}</span><small>${r}</small></li>`).join('');
  return `
    <p class="prose" style="margin-top:22px">Los ricos acumulan como si el tiempo nunca se acabara. Los hermanos esperan como el labrador, sabiendo que el Señor viene. Las dos maneras de vivir llevan a finales distintos.</p>
    <div class="compare">
      <div class="col" style="--c:var(--red)">
        <h3>Los ricos</h3>
        <ul>${li(low)}</ul>
        <p class="harvest"><b>Su final</b>Lloran por las miserias que vienen (v. 1)</p>
      </div>
      <div class="col" style="--c:var(--teal)">
        <h3>Los pacientes</h3>
        <ul>${li(high)}</ul>
        <p class="harvest"><b>Su final</b>El Señor es compasivo y misericordioso (v. 11)</p>
      </div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--red)">Las imágenes del capítulo</p>
    <div class="chips">${imgs.map(([t, v]) => `<button class="chip" data-go="${pageOfVerse(v)}">${t}<small>v. ${v}</small></button>`).join('')}</div>
    ${letterBlock()}
    ${memoBlock()}
    <p class="blk-label sub-h" style="--c:var(--ochre)">Oración</p>
    <p class="prayer">Señor, enséñame a esperar como el labrador, sin quejarme de mis hermanos. Que mi sí sea sí y mi no, no. Cuando sufra, que ore; cuando esté alegre, que te cante. Y dame valor para buscar al que se aleja de ti. Amén.</p>`;
}
