/* Santiago 4 — páginas, notas del griego, preguntas y repaso.
   N(versículo, 'palabra exacta del texto', 'griego', 'transliteración', 'significado', 'explicación')
   La palabra debe aparecer tal cual en ese versículo (herramientas/verificar.py lo comprueba). */
const INTRO = { title: 'Paz o guerra', ref: 'Santiago 3 y 4', vig: 'scroll' };
const RECAP_TITLE = 'Dos caminos';
const BOOK = { name: 'Santiago', ch: 4, key: 'stgo4-page' };

const NBLA = __NBLA__;          // se llena con texto/santiago-4.txt
const HEADINGS = __TITULOS__;   // títulos de sección del mismo archivo

const SECTIONS = {
  intro:  { name: 'Antes de empezar', color: 'var(--ochre)', long: 2 },
  s1:     { name: HEADINGS[1]  || 'Guerras y conflictos',        color: 'var(--red)',  long: 1, from: 1,  to: 12 },
  s2:     { name: HEADINGS[13] || 'La incertidumbre de la vida', color: 'var(--teal)', long: 4, from: 13, to: 17 },
  repaso: { name: 'Repaso', color: 'var(--sage)', long: 3 }
};
const N = (v, k, gr, tr, gloss, body, occ) => ({ v, k, gr, tr, gloss, body, occ: occ || 1 });

const TEXT_PAGES = [
  { sec: 's1', vv: [1, 3], title: '¿De dónde vienen los pleitos?', vig: 'swords',
    notes: [
      N(1, 'guerras', 'πόλεμοι καὶ μάχαι', 'polemoi kai machai', 'guerras y batallas', 'Santiago usa dos palabras militares: polemos, una guerra larga, y machē, el choque de una batalla. Habla de pleitos dentro de la iglesia, justo después de alabar la paz (3:18).'),
      N(1, 'pasiones', 'ἡδονῶν', 'hēdonōn', 'placeres', 'Hēdonē es el placer, de donde viene «hedonismo». Estos deseos combaten como un ejército acampado dentro de la persona (compara 1 Pedro 2:11).'),
      N(2, 'codician', 'ἐπιθυμεῖτε', 'epithymeite', 'desean con intensidad', 'Santiago ya describió la cadena en 1:14–15: el deseo concibe el pecado, y el pecado da a luz la muerte.'),
      N(2, 'homicidio', 'φονεύετε', 'phoneuete', 'matan', 'Puede ser literal, pero también recuerda a Jesús, que llevó el «no matarás» hasta el enojo (Mateo 5:21–22), y a Juan: el que odia a su hermano es homicida (1 Juan 3:15).'),
      N(2, 'envidiosos', 'ζηλοῦτε', 'zēloute', 'arden de envidia', 'Es la raíz de los «celos amargos» de 3:14. La sabiduría terrenal del capítulo anterior aquí da su fruto.'),
      N(2, 'no piden', 'διὰ τὸ μὴ αἰτεῖσθαι', 'dia to mē aiteisthai', 'porque no piden', 'Santiago ya había invitado a pedir sabiduría a Dios, que da a todos con generosidad (1:5). Muchas peleas empiezan donde la oración nunca empezó.'),
      N(3, 'malos propósitos', 'κακῶς αἰτεῖσθε', 'kakōs aiteisthe', 'piden mal', 'Pedir con la intención equivocada. El verbo que sigue, «gastar», es el mismo que describe al hijo pródigo cuando derrochó todo (Lucas 15:14).')
    ],
    observe: { q: '¿Qué dos razones da Santiago para que no tengan lo que desean?',
               a: 'No piden (v. 2). Y cuando piden, piden mal, para gastarlo en sus propios placeres (v. 3).' },
    apply: 'Piensa en tu último pleito. ¿Qué deseo tuyo estaba en juego? ¿Se lo has pedido a Dios, y con qué propósito?',
    links: [['Santiago 1:14–15', 'El deseo concibe el pecado, y el pecado da a luz la muerte.'], ['Mateo 7:7', 'Pidan, y se les dará.']]
  },
  { sec: 's1', vv: [4, 6], title: 'Una gracia mayor', vig: 'cup',
    notes: [
      N(4, 'almas adúlteras', 'μοιχαλίδες', 'moichalides', 'adúlteras', 'En griego dice solo «adúlteras». Es el lenguaje de los profetas, que llamaban adúltero a Israel cuando se iba tras otros dioses (Oseas 1–3; Jeremías 3:20). Dios ama a su pueblo como un esposo fiel.'),
      N(4, 'amistad', 'ἡ φιλία τοῦ κόσμου', 'hē philia tou kosmou', 'la amistad del mundo', 'Philia, la amistad, solo aparece aquí en el Nuevo Testamento. Abraham fue llamado amigo de Dios (2:23). Santiago pone delante las dos amistades posibles.'),
      N(4, 'enemigo de Dios', 'ἐχθρὸς τοῦ θεοῦ καθίσταται', 'echthros tou theou kathistatai', 'queda puesto como enemigo de Dios', 'El verbo kathistatai significa «queda establecido». Es el mismo de 3:6, donde la lengua «está puesta» entre nuestros miembros.'),
      N(5, 'celosamente', 'πρὸς φθόνον ἐπιποθεῖ', 'pros phthonon epipothei', 'anhela con celo', 'Uno de los versículos más difíciles de la carta. Puede leerse como Dios que anhela con celo al espíritu que puso en nosotros, como un esposo que no comparte a su esposa. Ningún versículo del Antiguo Testamento lo dice con estas palabras; Santiago resume lo que la Escritura enseña sobre el celo de Dios (Éxodo 20:5; 34:14).'),
      N(5, 'Espíritu', 'τὸ πνεῦμα ὃ κατῴκισεν', 'to pneuma ho katōkisen', 'el espíritu que hizo habitar', 'Puede referirse al Espíritu Santo que Dios hizo habitar en los creyentes, o al espíritu humano, el aliento de vida que Dios sopló al crear (Génesis 2:7). Por eso las versiones traducen este versículo de maneras distintas.'),
      N(6, 'mayor gracia', 'μείζονα χάριν', 'meizona charin', 'una gracia más grande', 'Lo que Dios pide es total, pero lo que da es todavía más. En 3:1 Santiago habló de un juicio mayor; aquí habla de una gracia mayor.'),
      N(6, 'soberbios', 'ὑπερηφάνοις ἀντιτάσσεται', 'hyperēphanois antitassetai', 'se pone en contra de los soberbios', 'Cita de Proverbios 3:34 en la Biblia griega; Pedro cita el mismo versículo (1 Pedro 5:5). «Resiste» es un término militar: ponerse en formación de batalla. Los que hacen guerra (v. 1) encuentran a Dios en el otro bando.'),
      N(6, 'humildes', 'ταπεινοῖς', 'tapeinois', 'los de condición baja', 'Tapeinos es el pequeño, el que no cuenta. Santiago ya dijo que el hermano de condición humilde puede gloriarse en su alta posición (1:9).')
    ],
    observe: { q: '¿Qué hace Dios con los soberbios y qué hace con los humildes (v. 6)?',
               a: 'A los soberbios los resiste; a los humildes les da gracia. Santiago lo cita de Proverbios 3:34.' },
    apply: '¿En qué área de tu vida quieres ser amigo del mundo y amigo de Dios a la vez?',
    links: [['Santiago 2:23', 'Abraham fue llamado amigo de Dios.'], ['1 Pedro 5:5–6', 'Dios da gracia a los humildes; humíllense bajo su mano.']]
  },
  { sec: 's1', vv: [7, 8], title: 'Acérquense a Dios', vig: 'pitcher',
    notes: [
      N(7, 'sométanse', 'ὑποτάγητε', 'hypotagēte', 'pónganse bajo', 'Un término de orden: tomar el propio lugar bajo alguien. Es el primero de diez mandatos seguidos en los vv. 7–10.'),
      N(7, 'Resistan', 'ἀντίστητε', 'antistēte', 'hagan frente', 'Mantenerse firme frente al enemigo. Pedro usa la misma palabra (1 Pedro 5:9). Y viene con promesa: el diablo huirá.'),
      N(7, 'diablo', 'διάβολος', 'diabolos', 'el calumniador', 'Diabolos significa «calumniador», el que acusa y divide. Por eso, unos versículos después, Santiago prohíbe hablar mal unos de otros (v. 11).'),
      N(8, 'Acérquense', 'ἐγγίσατε', 'engisate', 'acérquense', 'Es lenguaje del templo: los sacerdotes se acercaban a Dios para servirle. Ahora la invitación es para todos, y Dios responde acercándose (compara Hebreos 10:22).'),
      N(8, 'manos', 'καθαρίσατε χεῖρας', 'katharisate cheiras', 'limpien las manos', 'Los sacerdotes lavaban sus manos antes de servir (Éxodo 30:19–21). Las manos representan lo que hacemos. Santiago llama a sus lectores «pecadores» sin rodeos.'),
      N(8, 'doble ánimo', 'δίψυχοι', 'dipsychoi', 'de dos almas', 'No aparece en ningún texto griego anterior a Santiago, que la usa aquí y en 1:8. Quizá él mismo acuñó la palabra.'),
      N(8, 'corazones', 'ἁγνίσατε καρδίας', 'hagnisate kardias', 'purifiquen los corazones', 'Hagnizō es de la misma raíz que «pura» en 3:17. Manos limpias y corazón puro: la misma pareja del Salmo 24:3–4.')
    ],
    observe: { q: 'Los mandatos del v. 8 van en pares. ¿Qué parte de la persona limpia cada uno?',
               a: 'Las manos, que representan lo que hacemos, y el corazón, que representa lo que deseamos. Es la misma pareja del Salmo 24:3–4.' },
    apply: '¿Qué paso concreto sería para ti acercarte a Dios esta semana?',
    links: [['Salmo 24:3–4', 'Manos limpias y corazón puro para subir al monte del Señor.'], ['Hebreos 10:22', 'Acerquémonos con un corazón sincero.']]
  },
  { sec: 's1', vv: [9, 10], title: 'Humíllense ante el Señor', vig: 'kneel',
    notes: [
      N(9, 'Aflíjanse', 'ταλαιπωρήσατε', 'talaipōrēsate', 'reconozcan su miseria', 'Es la palabra de Pablo en «¡Miserable de mí!» (Romanos 7:24). No es tristeza por tristeza: es tomar en serio el pecado.'),
      N(9, 'laméntense', 'πενθήσατε καὶ κλαύσατε', 'penthēsate kai klausate', 'hagan duelo y lloren', 'Penthos es el duelo por un muerto; la misma palabra vuelve en este versículo como «lamento». Jesús dijo: dichosos los que lloran, porque serán consolados (Mateo 5:4).'),
      N(9, 'risa', 'γέλως', 'gelōs', 'risa', 'La risa despreocupada de quien no toma a Dios en serio. Única vez en el Nuevo Testamento. Recuerda la advertencia de Lucas 6:25 a los que ahora ríen.'),
      N(9, 'tristeza', 'κατήφεια', 'katēpheia', 'mirada baja', 'Describe los ojos bajos de quien siente vergüenza, como el recaudador que no se atrevía a alzar la vista (Lucas 18:13). Única vez en el Nuevo Testamento.'),
      N(10, 'Humíllense', 'ταπεινώθητε', 'tapeinōthēte', 'háganse pequeños', 'Cierra la serie de mandatos que empezó en el v. 7 y responde al v. 6: Dios da gracia a los humildes.'),
      N(10, 'exaltará', 'ὑψώσει', 'hypsōsei', 'levantará en alto', 'Jesús lo enseñó: el que se humilla será exaltado (Lucas 14:11; 18:14). Pedro lo repite en 1 Pedro 5:6.')
    ],
    observe: { q: '¿Qué le promete el v. 10 a quien obedece el v. 9?',
               a: 'Que no se quedará abajo. El que se humilla y llora su pecado será exaltado por el Señor. Dios levanta a los que se inclinan ante Él.' },
    apply: '¿Hay algo que tomas a la ligera y que Dios toma en serio? ¿Qué sería para ti humillarte ante Él?',
    links: [['Lucas 18:13–14', 'El recaudador no alzaba los ojos y volvió a casa justificado.'], ['Mateo 5:4', 'Dichosos los que lloran.']]
  },
  { sec: 's1', vv: [11, 12], title: 'Un solo Juez', vig: 'tablets',
    notes: [
      N(11, 'hablen mal', 'μὴ καταλαλεῖτε', 'mē katalaleite', 'no hablen en contra', 'Katalaleō es hablar contra alguien, muchas veces a sus espaldas. Santiago vuelve al tema de la lengua del capítulo 3.'),
      N(11, 'hermano', 'ἀδελφός', 'adelphos', 'hermano', 'En un solo versículo dice «hermano» tres veces. La persona criticada es de la familia.'),
      N(11, 'ley', 'νόμος', 'nomos', 'la ley', 'Probablemente la ley real de 2:8: «Amarás a tu prójimo como a ti mismo» (Levítico 19:18). En el mismo pasaje, Levítico 19:16 prohíbe andar con chismes.'),
      N(11, 'cumplidor', 'ποιητὴς νόμου', 'poiētēs nomou', 'hacedor de la ley', 'Santiago ya pidió ser hacedores de la palabra y no solo oidores (1:22–25). Quien juzga a su hermano deja de hacer la ley y se pone por encima de ella.'),
      N(12, 'Legislador', 'νομοθέτης καὶ κριτής', 'nomothetēs kai kritēs', 'el que da la ley y juzga', 'Nomothetēs aparece solo aquí en el Nuevo Testamento. Dios escribe la ley y solo Él juzga con ella.'),
      N(12, 'salvar', 'σῶσαι καὶ ἀπολέσαι', 'sōsai kai apolesai', 'salvar y destruir', 'Solo Dios tiene ese poder sobre la vida (Deuteronomio 32:39; Mateo 10:28). Juzgar a otro es ocupar un lugar que no nos corresponde.'),
      N(12, 'prójimo', 'τὸν πλησίον', 'ton plēsion', 'el que está cerca', 'Es la misma palabra de la ley real: amarás a tu prójimo (2:8). El que juzgamos es aquel a quien deberíamos amar.')
    ],
    observe: { q: 'Según el v. 11, ¿qué hace en realidad quien habla mal de su hermano?',
               a: 'Habla mal de la ley y la juzga. En lugar de cumplirla, se pone por encima de ella como si fuera el juez.' },
    apply: '¿De quién hablaste mal esta semana? ¿Qué cambiaría si recordaras que hay un solo Juez?',
    links: [['Levítico 19:16–18', 'No andar con chismes; amar al prójimo como a uno mismo.'], ['Mateo 7:1–5', 'No juzguen, para no ser juzgados.']]
  },
  { sec: 's2', vv: [13, 15], title: 'Si el Señor quiere', vig: 'hourglass',
    notes: [
      N(13, 'Oigan ahora', 'Ἄγε νῦν', 'Age nyn', '¡vamos, ahora!', 'Una expresión enérgica para llamar la atención. Santiago la repite en 5:1, cuando habla a los ricos.'),
      N(13, 'negocio', 'ἐμπορευσόμεθα', 'emporeusometha', 'comerciaremos', 'El emporos era el mercader que viajaba de ciudad en ciudad, algo común entre los judíos dispersos por el imperio.'),
      N(13, 'ganancia', 'κερδήσομεν', 'kerdēsomen', 'ganaremos', 'Jesús preguntó de qué sirve ganar el mundo entero y perder el alma (Mateo 16:26).'),
      N(14, 'mañana', 'τὸ τῆς αὔριον', 'to tēs aurion', 'lo de mañana', 'Eco de Proverbios 27:1: no te jactes del día de mañana, porque no sabes qué traerá el día.'),
      N(14, 'vapor', 'ἀτμίς', 'atmis', 'vapor', 'El vapor de una olla o el aliento en el frío: se ve un momento y desaparece. En Hechos 2:19 se usa para el vapor de humo. El Eclesiastés dice algo parecido con la palabra hebel, «soplo».'),
      N(15, 'Si el Señor quiere', 'ἐὰν ὁ κύριος θελήσῃ', 'ean ho kyrios thelēsē', 'si el Señor quiere', 'Pablo hablaba así de sus planes (Hechos 18:21; 1 Corintios 4:19; 16:7). Siglos después, los cristianos lo escribían en sus cartas en latín: Deo volente.')
    ],
    observe: { q: '¿Qué tiene de malo el plan del v. 13? Fíjate en lo que falta.',
               a: 'Hacer planes no es pecado. El problema es planear como si el mañana fuera nuestro, sin contar con Dios. Falta decir «si el Señor quiere» (v. 15).' },
    apply: 'Mira tu agenda de esta semana. ¿Cómo cambiaría si escribieras «si el Señor quiere» junto a cada plan?',
    links: [['Proverbios 27:1', 'No te jactes del mañana.'], ['Lucas 12:16–21', 'El rico que planeó graneros más grandes y murió esa noche.']]
  },
  { sec: 's2', vv: [16, 17], title: 'El bien que sabemos', vig: 'candle',
    notes: [
      N(16, 'jactan', 'καυχᾶσθε', 'kauchasthe', 'se glorían', 'Santiago no condena toda gloria: el humilde puede gloriarse en su alta posición (1:9). Lo malo es gloriarse de lo que no controlamos.'),
      N(16, 'arrogancia', 'ἀλαζονείαις', 'alazoneiais', 'fanfarronerías', 'El alazōn era el charlatán que presumía de lo que no tenía, como el vendedor ambulante que promete maravillas. Juan habla de la arrogancia de la vida (1 Juan 2:16).'),
      N(17, 'sabe hacer lo bueno', 'εἰδότι καλὸν ποιεῖν', 'eidoti kalon poiein', 'al que sabe hacer el bien', 'El pecado de omisión. Santiago lo ilustró en 2:15–16: desearle lo mejor a quien tiene hambre sin darle nada.'),
      N(17, 'pecado', 'ἁμαρτία', 'hamartia', 'errar el blanco', 'Pecar no es solo hacer el mal. También es dejar de hacer el bien que ya sabemos (compara Lucas 12:47).')
    ],
    observe: { q: '¿Qué clase de pecado describe el v. 17?',
               a: 'El pecado de omisión: saber cuál es el bien que debemos hacer y no hacerlo.' },
    apply: '¿Qué bien sabes que deberías hacer y has estado posponiendo? ¿Cuándo lo harás?',
    links: [['Santiago 1:22', 'Hacedores de la palabra, no solo oidores.'], ['Santiago 2:15–16', 'Desearle bien a un necesitado sin darle nada.']]
  }
];

const MEMO = { v: 8 };

function introBody(){
  const outline = ['s1', 's2'].map(k => {
    const s = SECTIONS[k], pi = pageOfVerse(s.from);
    return `<li><button data-go="${pi}" style="--c:${s.color}"><i></i><span><small>vv. ${s.from}–${s.to}</small><b>${s.name}</b></span>${ICON.arrow}</button></li>`;
  }).join('');
  return `
    <div class="prose">
      <p>El capítulo 3 terminó con una semilla que se siembra en paz (3:18). El capítulo 4 empieza con lo contrario: guerras y pleitos dentro de la comunidad.</p>
      <p>Santiago sigue el mismo hilo. La sabiduría terrenal produce celos y ambición personal (3:14–16), y de ahí nacen los conflictos. Pero el capítulo no se queda en el diagnóstico: llama a volver a Dios con humildad.</p>
      <p>El centro del capítulo es el v. 6: Dios resiste a los soberbios, pero da gracia a los humildes. Las dos secciones muestran formas de orgullo y su remedio.</p>
      <ul class="outline">${outline}</ul>
      <p>Y una promesa para el camino: el que se acerca a Dios descubre que Dios también se acerca a él (4:8).</p>
    </div>`;
}
function recapBody(){
  const low = [['Pleitos y guerras', 'v. 1'], ['Codicia y envidia', 'v. 2'], ['Pedir para los placeres', 'v. 3'], ['Amistad con el mundo', 'v. 4'], ['Hablar mal y juzgar', 'v. 11'], ['Planes sin Dios', 'v. 13'], ['Jactancia', 'v. 16']];
  const high = [['Pedirle a Dios', 'v. 2'], ['Someterse a Dios', 'v. 7'], ['Resistir al diablo', 'v. 7'], ['Acercarse a Dios', 'v. 8'], ['Manos y corazón limpios', 'v. 8'], ['Llorar el pecado', 'v. 9'], ['«Si el Señor quiere»', 'v. 15'], ['Hacer el bien que sabemos', 'v. 17']];
  const imgs = [['Guerras', 1], ['Amistad', 4], ['Gracia', 6], ['Manos', 8], ['Llanto', 9], ['El Juez', 12], ['La ciudad', 13], ['Vapor', 14]];
  const li = a => a.map(([t, r]) => `<li><span>${t}</span><small>${r}</small></li>`).join('');
  return `
    <p class="prose" style="margin-top:22px">El v. 6 resume el capítulo: Dios resiste a los soberbios, pero da gracia a los humildes. Cada actitud lleva a una respuesta distinta de Dios.</p>
    <div class="compare">
      <div class="col" style="--c:var(--red)">
        <h3>Soberbia</h3>
        <ul>${li(low)}</ul>
        <p class="harvest"><b>Respuesta de Dios</b>Los resiste (v. 6)</p>
      </div>
      <div class="col" style="--c:var(--teal)">
        <h3>Humildad</h3>
        <ul>${li(high)}</ul>
        <p class="harvest"><b>Respuesta de Dios</b>Da mayor gracia y exalta (vv. 6, 10)</p>
      </div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--red)">Las imágenes del capítulo</p>
    <div class="chips">${imgs.map(([t, v]) => `<button class="chip" data-go="${pageOfVerse(v)}">${t}<small>v. ${v}</small></button>`).join('')}</div>
    ${letterBlock()}
    ${memoBlock()}
    <p class="blk-label sub-h" style="--c:var(--ochre)">Oración</p>
    <p class="prayer">Señor, no quiero pelear por lo que deseo, sino pedírtelo con un corazón limpio. Me someto a ti. Acércate a mí mientras me acerco a ti. Mi vida es un vapor; que mis planes digan siempre: si tú quieres. Amén.</p>`;
}
