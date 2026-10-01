/* Santiago 2 — páginas, notas del griego, preguntas y repaso.
   N(versículo, 'palabra exacta del texto', 'griego', 'transliteración', 'significado', 'explicación')
   La palabra debe aparecer tal cual en ese versículo (herramientas/verificar.py lo comprueba). */
const BOOK = { name: 'Santiago', ch: 2, key: 'stgo2-page' };

const NBLA = __NBLA__;          // se llena con texto/santiago-2.txt
const HEADINGS = __TITULOS__;   // títulos de sección del mismo archivo

const SECTIONS = {
  intro:  { name: 'Antes de empezar', color: 'var(--ochre)', long: 2 },
  s1:     { name: HEADINGS[1]  || 'El pecado de la parcialidad', color: 'var(--red)',  long: 1, from: 1,  to: 13 },
  s2:     { name: HEADINGS[14] || 'La fe y las obras',           color: 'var(--teal)', long: 4, from: 14, to: 26 },
  repaso: { name: 'Repaso', color: 'var(--sage)', long: 3 }
};
const INTRO = { title: 'Dos escenas', ref: 'Santiago 1 y 2', vig: 'scroll' };
const RECAP_TITLE = 'Fe viva, fe muerta';
const N = (v, k, gr, tr, gloss, body, occ) => ({ v, k, gr, tr, gloss, body, occ: occ || 1 });

const TEXT_PAGES = [
  { sec: 's1', vv: [1, 4], title: 'Sin favoritismos', vig: 'ring',
    notes: [
      N(1, 'glorioso Señor Jesucristo', 'τοῦ κυρίου ἡμῶν Ἰησοῦ Χριστοῦ τῆς δόξης', 'tou kyriou hēmōn Iēsou Christou tēs doxēs', 'nuestro Señor Jesucristo, el de la gloria', 'Literalmente, «de la gloria». Frente al Señor de la gloria, la gloria de un anillo o de una ropa fina no vale nada. Es la segunda y última vez que Santiago nombra a Jesús; la primera está en 1:1.'),
      N(1, 'favoritismo', 'προσωπολημψία', 'prosōpolēmpsia', 'recibir la cara', 'Juzgar a alguien por su apariencia. La palabra viene de una expresión hebrea, «levantar el rostro», y en griego solo la usan los escritores cristianos. Dios no hace acepción de personas (Hechos 10:34; Romanos 2:11).'),
      N(2, 'congregación', 'συναγωγή', 'synagōgē', 'sinagoga, reunión', 'Santiago llama sinagoga a la reunión de los creyentes. Es la única vez que el Nuevo Testamento usa esa palabra para una reunión cristiana, y muestra lo judío de las iglesias a las que escribe.'),
      N(2, 'anillo de oro', 'χρυσοδακτύλιος', 'chrysodaktylios', 'con dedos de oro', 'Una sola palabra: «dedos de oro», alguien con anillos de oro. Única vez en el Nuevo Testamento. En Roma, el anillo de oro distinguía a los de la clase alta.'),
      N(2, 'ropa lujosa', 'ἐσθῆτι λαμπρᾷ', 'esthēti lampra', 'ropa brillante', 'Lampros es «resplandeciente». Es la misma ropa espléndida que Herodes le puso a Jesús para burlarse de Él (Lucas 23:11).'),
      N(2, 'ropa sucia', 'ῥυπαρᾷ ἐσθῆτι', 'rhypara esthēti', 'ropa manchada', 'La ropa de quien trabaja con las manos o no tiene otra. Es de la misma familia que la «inmundicia» de 1:21: lo que hay que limpiar no es la ropa del pobre, sino el corazón.'),
      N(3, 'estrado', 'ὑποπόδιον', 'hypopodion', 'escabel', 'El banquito donde se apoyan los pies. Sentar al pobre junto al estrado era ponerlo a la altura de los pies del que manda. En el Salmo 110:1, Dios pone a los enemigos por estrado de los pies del rey.'),
      N(4, 'distinciones', 'διεκρίθητε', 'diekrithēte', 'se dividieron', 'Es el verbo de 1:6, «el que duda». Quien hace diferencias entre las personas está dividido por dentro, como el hombre de doble ánimo.'),
      N(4, 'malos pensamientos', 'διαλογισμῶν πονηρῶν', 'dialogismōn ponērōn', 'razonamientos malvados', 'Jueces que deciden con criterios torcidos. Jesús dijo que de dentro del corazón salen los malos pensamientos (Marcos 7:21, la misma palabra).')
    ],
    observe: { q: '¿Cómo trata la congregación a cada uno de los dos hombres?',
               a: 'Al del anillo de oro y la ropa lujosa le ofrecen un buen asiento; al pobre lo dejan de pie o lo mandan a sentarse junto al estrado (vv. 2–3). Los tratan según su apariencia.' },
    apply: '¿A quién tiendes a tratar mejor sin darte cuenta: al que tiene dinero, al que se viste bien, al que es importante? ¿Cómo recibes al que llega por primera vez?',
    links: [['Levítico 19:15', 'No favorezcas al pobre ni complazcas al rico: juzga con justicia.'], ['1 Samuel 16:7', 'El hombre mira la apariencia, pero el Señor mira el corazón.']]
  },
  { sec: 's1', vv: [5, 7], title: 'Ricos en fe', vig: 'crown',
    notes: [
      N(5, 'escogió', 'ἐξελέξατο', 'exelexato', 'eligió', 'Dios elige a los que el mundo no tiene en cuenta: lo necio, lo débil, lo despreciado (1 Corintios 1:26–29).'),
      N(5, 'ricos en fe', 'πλουσίους ἐν πίστει', 'plousious en pistei', 'ricos en fe', 'Pobres a los ojos del mundo, pero ricos donde importa. Jesús dijo: dichosos ustedes los pobres, porque suyo es el reino de Dios (Lucas 6:20).'),
      N(5, 'herederos del reino', 'κληρονόμους τῆς βασιλείας', 'klēronomous tēs basileias', 'herederos del reino', 'La única vez que Santiago habla del reino. La herencia no se compra: se recibe por ser hijo. Es la misma promesa de 1:12, para los que aman a Dios.'),
      N(6, 'despreciado', 'ἠτιμάσατε', 'ētimasate', 'deshonraron', 'Quitarle a alguien su honra. El que oprime al pobre afrenta a su Hacedor (Proverbios 14:31).'),
      N(6, 'oprimen', 'καταδυναστεύουσιν', 'katadynasteuousin', 'dominan con fuerza', 'Usar el poder para aplastar a otros. Pedro usa el mismo verbo para los oprimidos por el diablo a quienes Jesús sanó (Hechos 10:38).'),
      N(6, 'arrastran', 'ἕλκουσιν', 'helkousin', 'arrastran', 'Llevar a alguien a la fuerza, como arrastraron a Pablo y a Silas ante las autoridades de Filipos (Hechos 16:19).'),
      N(7, 'buen nombre', 'τὸ καλὸν ὄνομα', 'to kalon onoma', 'el hermoso nombre', 'Probablemente el nombre de Cristo, pronunciado sobre ellos en el bautismo. En Antioquía, a los discípulos los empezaron a llamar cristianos (Hechos 11:26).')
    ],
    observe: { q: 'Según los vv. 6–7, ¿cómo trataban los ricos a los creyentes?',
               a: 'Los oprimían, los arrastraban a los tribunales y blasfemaban el buen nombre por el cual habían sido llamados. Aun así, la congregación los honraba más que al pobre.' },
    apply: '¿Qué cambiaría en tu trato con un hermano pobre si lo vieras como «rico en fe y heredero del reino»?',
    links: [['1 Corintios 1:26–29', 'Dios escogió lo débil del mundo.'], ['Lucas 6:20', 'Dichosos ustedes los pobres, porque suyo es el reino de Dios.']]
  },
  { sec: 's1', vv: [8, 9], title: 'La ley real', vig: 'scepter',
    notes: [
      N(8, 'ley real', 'νόμον βασιλικόν', 'nomon basilikon', 'la ley del rey', 'La ley del Rey, la que manda sobre las demás. Jesús enseñó que de amar a Dios y al prójimo dependen toda la ley y los profetas (Mateo 22:37–40).'),
      N(8, 'conforme a la Escritura', 'κατὰ τὴν γραφήν', 'kata tēn graphēn', 'según la Escritura', 'Santiago cita Levítico 19:18. Ese mismo capítulo prohíbe el favoritismo en el juicio, sea hacia el pobre o hacia el rico (Levítico 19:15).'),
      N(8, 'prójimo', 'τὸν πλησίον', 'ton plēsion', 'el que está cerca', 'Con la parábola del buen samaritano, Jesús mostró que el prójimo es cualquiera que está cerca y necesita ayuda (Lucas 10:29–37).'),
      N(8, 'bien hacen', 'καλῶς ποιεῖτε', 'kalōs poieite', 'hacen bien', 'La misma expresión vuelve en el v. 19, esta vez con ironía: crees que Dios es uno; «haces bien».'),
      N(9, 'muestran favoritismo', 'προσωπολημπτεῖτε', 'prosōpolēmpteite', 'hacen acepción de personas', 'El verbo de la palabra del v. 1. Única vez en el Nuevo Testamento.'),
      N(9, 'transgresores', 'παραβάται', 'parabatai', 'los que pasan el límite', 'Parabatēs es el que cruza una línea. El favoritismo no es una falta de cortesía: es pasar por encima de la ley de Dios.')
    ],
    observe: { q: '¿Qué mandamiento llama Santiago «la ley real»?',
               a: '«Amarás a tu prójimo como a ti mismo» (Levítico 19:18). Mostrar favoritismo es quebrantar esa ley.' },
    apply: 'Piensa en alguien a quien te cuesta tratar con el mismo respeto que a otros. ¿Qué sería amarlo como a ti mismo esta semana?',
    links: [['Levítico 19:15–18', 'No hacer acepción de personas; amar al prójimo.'], ['Mateo 22:37–40', 'Los dos grandes mandamientos.']]
  },
  { sec: 's1', vv: [10, 11], title: 'Culpable de todos', vig: 'chain',
    notes: [
      N(10, 'guarda toda la ley', 'ὅλον τὸν νόμον τηρήσῃ', 'holon ton nomon tērēsē', 'guarde la ley entera', 'La ley es un todo, como una cadena: si se rompe un eslabón, se rompe la cadena. Pablo dice algo parecido en Gálatas 3:10 y 5:3.'),
      N(10, 'falla', 'πταίσῃ', 'ptaisē', 'tropieza', 'Es el verbo de 3:2: todos tropezamos de muchas maneras.'),
      N(10, 'en un punto', 'ἐν ἑνί', 'en heni', 'en uno solo', 'Basta un mandamiento quebrantado. En este contexto, el favoritismo del v. 9: no se puede cumplir el resto de la ley y despreciar al pobre.'),
      N(10, 'culpable de todos', 'πάντων ἔνοχος', 'pantōn enochos', 'responsable de todo', 'Enochos es estar sujeto a juicio, como en Mateo 5:22. Santiago no dice que todos los pecados sean iguales, sino que cualquiera nos hace transgresores ante el único Legislador (4:12).'),
      N(11, 'el que dijo', 'ὁ εἰπών', 'ho eipōn', 'el que dijo', 'La ley es una sola porque viene de un solo Dios. Quien quebranta un mandamiento ofende al mismo Dios que dio todos los demás.'),
      N(11, 'No cometas adulterio', 'μὴ μοιχεύσῃς', 'mē moicheusēs', 'no cometas adulterio', 'Santiago pone el adulterio antes que el homicidio, el mismo orden que siguen Lucas 18:20 y Romanos 13:9.')
    ],
    observe: { q: '¿Qué ejemplo usa Santiago en el v. 11 para mostrar que la ley es una sola?',
               a: 'El que no comete adulterio pero mata es transgresor de la ley, porque el mismo Dios dio los dos mandamientos. No se puede escoger qué parte obedecer.' },
    apply: '¿Hay algún mandamiento que tiendes a ver como menos importante porque cumples bien los demás?',
    links: [['Gálatas 3:10', 'Maldito el que no permanece en todo lo escrito en la ley.'], ['Mateo 5:19', 'El que quebranta uno de estos mandamientos muy pequeños…']]
  },
  { sec: 's1', vv: [12, 13], title: 'La misericordia triunfa', vig: 'mercy',
    notes: [
      N(12, 'Así hablen', 'οὕτως λαλεῖτε καὶ οὕτως ποιεῖτε', 'houtōs laleite kai houtōs poieite', 'así hablen y así hagan', 'Palabras y obras juntas: los dos grandes temas de la carta, la lengua (capítulo 3) y las obras (2:14–26).'),
      N(12, 'ley de la libertad', 'νόμου ἐλευθερίας', 'nomou eleutherias', 'la ley de la libertad', 'La misma ley de 1:25, una ley que libera porque Dios la escribe en el corazón. Por ella seremos juzgados.'),
      N(13, 'sin misericordia', 'ἀνέλεος', 'aneleos', 'despiadado', 'Única vez en el Nuevo Testamento. Es la lección de la parábola del siervo que no quiso perdonar a su compañero (Mateo 18:23–35).'),
      N(13, 'mostrado misericordia', 'ποιήσαντι ἔλεος', 'poiēsanti eleos', 'haber hecho misericordia', 'En griego la misericordia se «hace»: es una acción, no solo un sentimiento. Así prepara el tema de las obras, que empieza en el v. 14.'),
      N(13, 'misericordia triunfa', 'κατακαυχᾶται ἔλεος κρίσεως', 'katakauchatai eleos kriseōs', 'la misericordia se gloría sobre el juicio', 'Literalmente, la misericordia «se jacta» frente al juicio: tiene la última palabra. Jesús dijo: dichosos los misericordiosos, porque ellos recibirán misericordia (Mateo 5:7).')
    ],
    observe: { q: '¿Qué relación hay entre la misericordia que mostramos y el juicio que recibiremos?',
               a: 'El juicio será sin misericordia para el que no la mostró. Pero para el que sí la muestra, la misericordia triunfa sobre el juicio (v. 13).' },
    apply: '¿Con quién necesitas mostrar misericordia esta semana en vez de juzgar?',
    links: [['Mateo 18:32–35', 'El siervo que no tuvo compasión de su compañero.'], ['Mateo 5:7', 'Dichosos los misericordiosos.']]
  },
  { sec: 's2', vv: [14, 17], title: '¿De qué sirve?', vig: 'bowl',
    notes: [
      N(14, '¿De qué sirve', 'τί τὸ ὄφελος', 'ti to ophelos', '¿cuál es el provecho?', 'Santiago discute como los maestros de su época, con preguntas y un oponente imaginario. Repite la misma pregunta al final del v. 16.'),
      N(14, 'dice que tiene fe', 'πίστιν λέγῃ τις ἔχειν', 'pistin legē tis echein', 'alguien dice tener fe', 'Santiago no habla de la fe verdadera, sino de la que solo se dice. El problema es una fe de palabras.'),
      N(14, 'salvarlo', 'μὴ δύναται ἡ πίστις σῶσαι αὐτόν', 'mē dynatai hē pistis sōsai auton', '¿puede esa fe salvarlo?', 'En griego dice «la fe», con artículo: esa fe, la que no tiene obras. La pregunta espera un «no». Pablo lo dice con otras palabras: lo que vale es la fe que obra por el amor (Gálatas 5:6).'),
      N(15, 'sustento diario', 'τῆς ἐφημέρου τροφῆς', 'tēs ephēmerou trophēs', 'el alimento del día', 'Única vez en el Nuevo Testamento: la comida de cada día, lo que Jesús nos enseñó a pedir en el Padre Nuestro (Mateo 6:11).'),
      N(16, 'Vayan en paz', 'ὑπάγετε ἐν εἰρήνῃ', 'hypagete en eirēnē', 'vayan en paz', 'La despedida piadosa de costumbre. Sin ayuda real, la bendición se convierte en una frase vacía.'),
      N(16, 'caliéntense y sáciense', 'θερμαίνεσθε καὶ χορτάζεσθε', 'thermainesthe kai chortazesthe', 'caliéntense y llénense', 'Buenos deseos que no calientan a nadie. Juan dice lo mismo: no amemos de palabra, sino de hecho y en verdad (1 Juan 3:17–18).'),
      N(17, 'muerta', 'νεκρά', 'nekra', 'muerta', 'No dice débil ni pequeña: una fe sin obras está muerta, como un cuerpo sin espíritu (v. 26).')
    ],
    observe: { q: '¿Qué ejemplo usa Santiago para mostrar una fe que no sirve?',
               a: 'Alguien ve a un hermano sin ropa y sin comida, le desea lo mejor y no le da nada. Las palabras bonitas no lo calientan ni lo alimentan (vv. 15–16).' },
    apply: '¿Conoces a alguien que necesita algo que tú puedes darle? ¿Qué harás esta semana, además de orar por esa persona?',
    links: [['1 Juan 3:17–18', 'No amemos de palabra, sino de hecho y en verdad.'], ['Gálatas 5:6', 'Lo que vale es la fe que obra por el amor.']]
  },
  { sec: 's2', vv: [18, 20], title: 'Muéstrame tu fe', vig: 'tree',
    notes: [
      N(18, 'alguien dirá', 'ἀλλ᾽ ἐρεῖ τις', 'all erei tis', 'pero dirá alguno', 'Santiago da la palabra a un interlocutor, como hacían los maestros de su época. No es fácil saber dónde terminan sus palabras; por eso las versiones ponen las comillas de maneras distintas.'),
      N(18, 'Muéstrame', 'δεῖξόν μοι', 'deixon moi', 'muéstrame', 'La fe no se ve; las obras sí. La única manera de mostrar la fe es por lo que hace.'),
      N(19, 'Dios es uno', 'εἷς ἐστιν ὁ θεός', 'heis estin ho theos', 'Dios es uno', 'Es la confesión que Israel repetía cada día, el Shemá: Escucha, Israel, el Señor nuestro Dios, el Señor uno es (Deuteronomio 6:4). Creerlo es correcto, pero no basta.'),
      N(19, 'demonios', 'τὰ δαιμόνια', 'ta daimonia', 'los demonios', 'Su fe es correcta en el contenido: saben quién es Jesús (Marcos 1:24; 5:7). Pero esa fe no los cambia.'),
      N(19, 'tiemblan', 'φρίσσουσιν', 'phrissousin', 'se estremecen', 'Única vez en el Nuevo Testamento: temblar de terror, con los pelos de punta. Saber la verdad sobre Dios sin amarlo produce miedo, no vida.'),
      N(20, 'hombre vano', 'ὦ ἄνθρωπε κενέ', 'ō anthrōpe kene', 'hombre vacío', 'Kenos, vacío. Una fe sin obras deja a la persona hueca por dentro.'),
      N(20, 'estéril', 'ἀργή', 'argē', 'ociosa, que no trabaja', 'De a-ergos, «sin obra». Hay un juego de palabras: la fe sin obras (erga) es argē, una fe que no trabaja.')
    ],
    observe: { q: '¿Qué tienen en común la fe de los demonios y la fe sin obras?',
               a: 'Las dos saben cosas correctas sobre Dios, pero ninguna produce obediencia ni amor. Por eso no salvan (vv. 19–20).' },
    apply: 'Si alguien observara tu vida esta semana, ¿qué obras le mostrarían tu fe?',
    links: [['Deuteronomio 6:4–5', 'El Señor uno es; amarás al Señor tu Dios.'], ['Mateo 7:21', 'No todo el que me dice «Señor, Señor» entrará en el reino.']]
  },
  { sec: 's2', vv: [21, 24], title: 'Abraham, amigo de Dios', vig: 'altar',
    notes: [
      N(21, 'justificado', 'ἐδικαιώθη', 'edikaiōthē', 'fue declarado justo', 'Pablo usa la misma palabra para mostrar que Dios justifica por la fe (Romanos 4:2–5). Santiago responde a otro problema: una fe que no hace nada. Para los dos, la fe verdadera se ve en obras (Gálatas 5:6).'),
      N(21, 'ofreció a su hijo Isaac', 'ἀνενέγκας Ἰσαάκ', 'anenenkas Isaak', 'habiendo ofrecido a Isaac', 'La historia está en Génesis 22. Abraham obedeció confiando en que Dios podía resucitar a su hijo (Hebreos 11:17–19). Dios detuvo su mano y proveyó un carnero.'),
      N(22, 'actuaba juntamente', 'συνήργει', 'synērgei', 'trabajaba junto con', 'De aquí viene «sinergia»: la fe y las obras trabajando juntas. No compiten: la fe actúa por medio de las obras.'),
      N(22, 'perfeccionada', 'ἐτελειώθη', 'eteleiōthē', 'llegó a su meta', 'De la familia de teleios, «completo» (1:4). La obediencia de Abraham llevó su fe a la madurez.'),
      N(23, 'contado por justicia', 'ἐλογίσθη αὐτῷ εἰς δικαιοσύνην', 'elogisthē autō eis dikaiosynēn', 'se le acreditó como justicia', 'Cita de Génesis 15:6, muchos años antes de Génesis 22. Cuando Abraham ofreció a Isaac, esa palabra «se cumplió»: su fe mostró lo que era.'),
      N(23, 'amigo de Dios', 'φίλος θεοῦ', 'philos theou', 'amigo de Dios', 'Así llaman a Abraham 2 Crónicas 20:7 e Isaías 41:8. Compara 4:4: la amistad del mundo es enemistad hacia Dios.'),
      N(24, 'no solo por la fe', 'οὐκ ἐκ πίστεως μόνον', 'ouk ek pisteōs monon', 'no por fe sola', 'Santiago rechaza una fe sola, separada de las obras. La fe que salva nunca está sola.')
    ],
    observe: { q: 'Según el v. 22, ¿cómo se relacionaban la fe y las obras de Abraham?',
               a: 'Trabajaban juntas: la fe actuaba con sus obras, y por las obras la fe fue perfeccionada, llegó a su madurez.' },
    apply: '¿Qué paso de obediencia te está pidiendo Dios para mostrar tu confianza en Él?',
    links: [['Génesis 22:1–14', 'Abraham ofrece a Isaac, y el Señor provee.'], ['Hebreos 11:17–19', 'Por la fe Abraham ofreció a Isaac.']]
  },
  { sec: 's2', vv: [25, 26], title: 'La fe de Rahab', vig: 'cord',
    notes: [
      N(25, 'ramera Rahab', 'Ῥαὰβ ἡ πόρνη', 'Rhaab hē pornē', 'Rahab la prostituta', 'Una mujer cananea con un pasado conocido. Santiago la pone junto a Abraham, el padre del pueblo: la fe que obra no depende de quién eras antes. Rahab aparece en la genealogía de Jesús (Mateo 1:5).'),
      N(25, 'recibió a los mensajeros', 'ὑποδεξαμένη τοὺς ἀγγέλους', 'hypodexamenē tous angelous', 'habiendo recibido a los mensajeros', 'Los dos espías que Josué envió a Jericó. Rahab los escondió en su azotea, bajo unos tallos de lino (Josué 2:1–6).'),
      N(25, 'otro camino', 'ἑτέρᾳ ὁδῷ', 'hetera hodō', 'por otro camino', 'Su casa estaba sobre la muralla, y los bajó con una cuerda por la ventana para que huyeran a las montañas (Josué 2:15–16). El cordón rojo atado a esa ventana salvó a su familia (Josué 2:18–21).'),
      N(26, 'cuerpo sin el espíritu', 'τὸ σῶμα χωρὶς πνεύματος', 'to sōma chōris pneumatos', 'el cuerpo sin aliento', 'Pneuma también significa aliento. Un cuerpo sin aliento es un cadáver; así es una fe sin obras.'),
      N(26, 'está muerta', 'νεκρά ἐστιν', 'nekra estin', 'está muerta', 'Santiago termina como en el v. 17: la fe sin obras está muerta. La fe viva respira por medio de sus obras.')
    ],
    observe: { q: '¿Qué tienen en común Abraham y Rahab, tan distintos entre sí?',
               a: 'Él era el padre del pueblo de Dios; ella, una extranjera con mala fama. Pero los dos mostraron su fe con hechos que les costaban algo: Abraham ofreció a su hijo y Rahab arriesgó su vida por los mensajeros.' },
    apply: '¿Qué riesgo concreto te pide tu fe esta semana, como el de Rahab?',
    links: [['Josué 2:8–21', 'Rahab esconde a los espías y ata el cordón rojo.'], ['Hebreos 11:31', 'Por la fe Rahab no pereció con los desobedientes.']]
  }
];

const MEMO = { v: 26 };

function introBody(){
  const outline = ['s1', 's2'].map(k => {
    const s = SECTIONS[k], pi = pageOfVerse(s.from);
    return `<li><button data-go="${pi}" style="--c:${s.color}"><i></i><span><small>vv. ${s.from}–${s.to}</small><b>${s.name}</b></span>${ICON.arrow}</button></li>`;
  }).join('');
  return `
    <div class="prose">
      <p>El capítulo 1 terminó con una religión pura: visitar a los huérfanos y a las viudas en sus aflicciones (1:27). El capítulo 2 pone esa idea a prueba con dos escenas.</p>
      <p>En la primera, un rico y un pobre entran a la misma reunión. ¿Cómo los reciben? En la segunda, un hermano no tiene ropa ni comida. ¿Basta con desearle lo mejor?</p>
      <p>Las dos escenas preguntan lo mismo: si la fe es real, se nota en la manera en que tratamos a las personas.</p>
      <ul class="outline">${outline}</ul>
      <p>Y una palabra para el camino: la misericordia triunfa sobre el juicio (2:13).</p>
    </div>`;
}
function recapBody(){
  const low = [['Mira la apariencia', 'vv. 2–3'], ['Desprecia al pobre', 'v. 6'], ['Escoge qué mandamiento cumplir', 'v. 10'], ['Juzga sin misericordia', 'v. 13'], ['Da buenos deseos, nada más', 'v. 16'], ['Cree como los demonios', 'v. 19']];
  const high = [['No hace acepción de personas', 'v. 1'], ['Ama al prójimo como a sí mismo', 'v. 8'], ['Muestra misericordia', 'v. 13'], ['Da lo necesario al que no tiene', 'vv. 15–16'], ['Obedece como Abraham', 'v. 21'], ['Arriesga como Rahab', 'v. 25']];
  const imgs = [['Anillo de oro', 2], ['Estrado', 3], ['Tribunales', 6], ['Ley real', 8], ['Sustento diario', 15], ['Demonios', 19], ['Altar', 21], ['Cuerpo sin espíritu', 26]];
  const letter = [
    [1, 'Pruebas que maduran, sabiduría que se pide y una palabra que se practica.'],
    [2, 'Fe sin favoritismos: la fe verdadera se ve en las obras.'],
    [3, 'La lengua y la sabiduría que viene de lo alto.'],
    [4, 'Humildad: Dios resiste a los soberbios y da mayor gracia.'],
    [5, 'Paciencia y oración hasta que venga el Señor.']
  ];
  const li = a => a.map(([t, r]) => `<li><span>${t}</span><small>${r}</small></li>`).join('');
  const arrow = '<i aria-hidden="true"><svg viewBox="0 0 16 10" width="15" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h13M10 1.5 14 5l-4 3.5"/></svg></i>';
  const chain = a => a.map((t, i) => (i ? arrow : '') + `<span>${t}</span>`).join('');
  return `
    <p class="prose" style="margin-top:22px">Santiago no pregunta si tenemos fe, sino qué clase de fe tenemos. Una fe muerta dice cosas correctas; una fe viva se nota en cómo tratamos a las personas.</p>
    <div class="compare">
      <div class="col" style="--c:var(--red)">
        <h3>Fe muerta</h3>
        <ul>${li(low)}</ul>
        <p class="harvest"><b>Su final</b>Juicio sin misericordia (v. 13)</p>
      </div>
      <div class="col" style="--c:var(--teal)">
        <h3>Fe viva</h3>
        <ul>${li(high)}</ul>
        <p class="harvest"><b>Su final</b>La misericordia triunfa sobre el juicio (v. 13)</p>
      </div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--sage)">Dos ejemplos de fe que obra</p>
    <div class="births">
      <div class="birth" style="--c:var(--ochre-ink)"><p class="bh">Abraham · vv. 21–23</p><p class="chain">${chain(['Creyó a Dios', 'ofreció a Isaac', 'amigo de Dios'])}</p></div>
      <div class="birth" style="--c:var(--red)"><p class="bh">Rahab · v. 25</p><p class="chain">${chain(['Creyó', 'recibió a los mensajeros', 'justificada por sus obras'])}</p></div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--red)">Las imágenes del capítulo</p>
    <div class="chips">${imgs.map(([t, v]) => `<button class="chip" data-go="${pageOfVerse(v)}">${t}<small>v. ${v}</small></button>`).join('')}</div>
    ${letterBlock()}
    ${memoBlock()}
    <p class="blk-label sub-h" style="--c:var(--ochre)">Oración</p>
    <p class="prayer">Señor de la gloria, perdóname cuando miro a las personas por su apariencia. Enséñame a amar a mi prójimo como a mí mismo y a mostrar misericordia. Que mi fe no se quede en palabras, sino que se vea en lo que hago, como la de Abraham y la de Rahab. Amén.</p>`;
}
