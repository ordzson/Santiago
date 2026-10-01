/* Santiago 1 — páginas, notas del griego, preguntas y repaso.
   N(versículo, 'palabra exacta del texto', 'griego', 'transliteración', 'significado', 'explicación')
   La palabra debe aparecer tal cual en ese versículo (herramientas/verificar.py lo comprueba). */
const BOOK = { name: 'Santiago', ch: 1, key: 'stgo1-page' };

const NBLA = __NBLA__;          // se llena con texto/santiago-1.txt
const HEADINGS = __TITULOS__;   // títulos de sección del mismo archivo

const SECTIONS = {
  intro:  { name: 'Antes de empezar', color: 'var(--ochre)', long: 2 },
  s1:     { name: HEADINGS[1]  || 'Saludo',                         color: 'var(--ochre)', long: 2, from: 1,  to: 1 },
  s2:     { name: HEADINGS[2]  || 'Fe y sabiduría',                 color: 'var(--teal)',  long: 4, from: 2,  to: 8 },
  s3:     { name: HEADINGS[9]  || 'Lo transitorio de las riquezas', color: 'var(--red)',   long: 1, from: 9,  to: 11 },
  s4:     { name: HEADINGS[12] || 'La tentación explicada',         color: 'var(--sage)',  long: 3, from: 12, to: 18 },
  s5:     { name: HEADINGS[19] || 'Hacedores de la palabra',        color: 'var(--red)',   long: 1, from: 19, to: 27 },
  repaso: { name: 'Repaso', color: 'var(--sage)', long: 3 }
};
const INTRO = { title: 'La primera página', ref: 'Santiago 1', vig: 'scroll' };
const RECAP_TITLE = 'Oír y hacer';
const N = (v, k, gr, tr, gloss, body, occ) => ({ v, k, gr, tr, gloss, body, occ: occ || 1 });

const TEXT_PAGES = [
  { sec: 's1', vv: [1, 1], title: 'Siervo de Dios', vig: 'dandelion',
    notes: [
      N(1, 'Santiago', 'Ἰάκωβος', 'Iakōbos', 'Jacobo', 'En griego es Jacobo, el nombre del patriarca Jacob; «Santiago» viene de «Sant Iago», san Jacobo. Probablemente es el hermano del Señor (Gálatas 1:19). Durante el ministerio de Jesús sus hermanos no creían en Él (Juan 7:5); después de la resurrección, Jesús se le apareció a Santiago (1 Corintios 15:7).'),
      N(1, 'siervo', 'δοῦλος', 'doulos', 'esclavo', 'Literalmente, esclavo: alguien que pertenece por completo a su señor. Santiago podía presentarse como hermano de Jesús, pero prefiere llamarse su siervo.'),
      N(1, 'Señor Jesucristo', 'κυρίου Ἰησοῦ Χριστοῦ', 'kyriou Iēsou Christou', 'del Señor Jesús el Mesías', 'Santiago nombra a Jesús solo aquí y en 2:1. Lo llama Señor y lo pone junto a Dios como dueño del mismo siervo. Christos es la forma griega de Mesías, el Ungido.'),
      N(1, 'doce tribus', 'ταῖς δώδεκα φυλαῖς', 'tais dōdeka phylais', 'a las doce tribus', 'El pueblo de Dios completo, como el Israel de los doce hijos de Jacob. Probablemente se refiere a creyentes judíos que vivían fuera de Israel; muchos lo leen también como una imagen de toda la iglesia.'),
      N(1, 'dispersión', 'διασπορά', 'diaspora', 'semilla esparcida', 'Viene de un verbo que significa esparcir semilla. Así se llamaba a los judíos que vivían fuera de Israel. Después de la muerte de Esteban, muchos creyentes fueron esparcidos y llevaron el evangelio consigo (Hechos 8:1–4; 11:19).'),
      N(1, 'Saludos', 'χαίρειν', 'chairein', '¡alégrense!', 'El saludo común de las cartas griegas. Aparece también en la carta del concilio de Jerusalén, donde Santiago habló (Hechos 15:13, 23). Y Santiago juega con él: el versículo siguiente empieza con chara, «gozo».')
    ],
    observe: { q: '¿Cómo se presenta Santiago a sí mismo?',
               a: 'Como siervo de Dios y del Señor Jesucristo. No menciona que es hermano de Jesús ni que es líder de la iglesia de Jerusalén.' },
    apply: 'Si tuvieras que presentarte en una sola línea, como Santiago, ¿qué dirías? ¿Qué lugar ocuparía Jesús en esa línea?',
    links: [['Juan 7:5', 'Ni siquiera sus hermanos creían en Él.'], ['1 Corintios 15:7', 'Jesús resucitado se apareció a Santiago.']]
  },
  { sec: 's2', vv: [2, 4], title: 'Sumo gozo', vig: 'crucible',
    notes: [
      N(2, 'sumo gozo', 'πᾶσαν χαρὰν ἡγήσασθε', 'pasan charan hēgēsasthe', 'consideren todo gozo', 'Chara, «gozo», responde al saludo chairein del v. 1. Santiago no dice «sientan gozo», sino «ténganlo por» gozo: es una decisión sobre cómo ver la prueba. No es alegría por el dolor, sino por lo que Dios produce con él (Romanos 5:3–4).'),
      N(2, 'se hallen', 'περιπέσητε', 'peripesēte', 'caigan en medio de', 'Caer de repente en algo que no se buscó, como el hombre que cayó en manos de los ladrones (Lucas 10:30, el mismo verbo). Las pruebas no se buscan; llegan.'),
      N(2, 'diversas pruebas', 'πειρασμοῖς ποικίλοις', 'peirasmois poikilois', 'pruebas de muchos colores', 'Poikilos significa «de varios colores», como una tela bordada. Peirasmos puede ser una prueba que viene de afuera o una tentación que nace adentro; Santiago usa las dos ideas en los vv. 12–14. Pedro habla igual de «diversas pruebas» (1 Pedro 1:6).'),
      N(3, 'prueba de su fe', 'τὸ δοκίμιον τῆς πίστεως', 'to dokimion tēs pisteōs', 'lo probado de su fe', 'Dokimion se usaba para probar los metales en el fuego y mostrar que eran genuinos. Pedro usa la misma expresión: la fe probada vale más que el oro probado por fuego (1 Pedro 1:7).'),
      N(3, 'paciencia', 'ὑπομονή', 'hypomonē', 'quedarse bajo el peso', 'De hypo, «debajo», y menō, «quedarse»: aguantar bajo la carga sin escapar. Es la paciencia de Job (5:11). Santiago empieza y termina su carta con esta virtud.'),
      N(4, 'perfecto resultado', 'ἔργον τέλειον', 'ergon teleion', 'obra completa', 'La paciencia tiene una obra que terminar en nosotros. Teleios, «completo, maduro», es una de las palabras favoritas de Santiago (1:17, 25; 3:2).'),
      N(4, 'completos', 'ὁλόκληροι', 'holoklēroi', 'enteros en todas sus partes', 'Entero, sin que le falte ninguna parte. La Biblia griega usa la palabra para las piedras enteras, sin labrar, del altar (Deuteronomio 27:6). «Sin que nada les falte» prepara el v. 5: «si a alguno de ustedes le falta sabiduría».')
    ],
    observe: { q: '¿Qué cadena describe Santiago en los vv. 3–4?',
               a: 'La prueba de la fe produce paciencia, y la paciencia, cuando termina su obra, nos hace perfectos y completos. La prueba no es el final: es el comienzo de un proceso.' },
    apply: '¿Qué prueba estás pasando ahora? ¿Qué podría estar formando Dios en ti a través de ella?',
    links: [['Romanos 5:3–5', 'La tribulación produce paciencia, y la paciencia, carácter probado.'], ['1 Pedro 1:6–7', 'La fe probada vale más que el oro probado por fuego.']]
  },
  { sec: 's2', vv: [5, 8], title: 'Pedir sin dudar', vig: 'wave',
    notes: [
      N(5, 'le falta sabiduría', 'λείπεται σοφίας', 'leipetai sophias', 'está falto de sabiduría', 'Juego de palabras con el v. 4, «sin que nada les falte». Si en la prueba nos falta algo, es sabiduría para entenderla y vivirla. Santiago describe esa sabiduría en 3:13–18.'),
      N(5, 'abundantemente', 'ἁπλῶς', 'haplōs', 'con sencillez, sin reservas', 'Dios da con generosidad y con una sola intención, sin cálculos ni condiciones. Es lo contrario del hombre de doble ánimo del v. 8: Dios da sin dobleces.'),
      N(5, 'sin reproche', 'μὴ ὀνειδίζοντος', 'mē oneidizontos', 'sin echar en cara', 'Dios no humilla al que pide ni le recuerda sus errores. Muchos dan y después lo echan en cara; Dios no.'),
      N(6, 'sin dudar', 'μηδὲν διακρινόμενος', 'mēden diakrinomenos', 'sin estar dividido', 'No es la duda honesta de quien tiene preguntas, sino estar dividido por dentro: pedirle a Dios y a la vez confiar en otra cosa. Jesús usó el mismo verbo: si tienen fe y no dudan (Mateo 21:21).'),
      N(6, 'ola del mar', 'κλύδωνι θαλάσσης', 'klydōni thalassēs', 'el oleaje del mar', 'Klydōn es el oleaje agitado. Es la misma palabra del oleaje que Jesús calmó en el lago (Lucas 8:24).'),
      N(6, 'impulsada por el viento', 'ἀνεμιζομένῳ καὶ ῥιπιζομένῳ', 'anemizomenō kai rhipizomenō', 'movida por el viento y agitada', 'Dos verbos que solo aparecen aquí en el Nuevo Testamento. Rhipizō es abanicar: el viento lleva la ola de un lado a otro, sin rumbo propio. Pablo usa una imagen parecida: llevados por todo viento de doctrina (Efesios 4:14).'),
      N(8, 'doble ánimo', 'δίψυχος', 'dipsychos', 'de dos almas', 'No aparece en ningún texto griego anterior a Santiago; quizá él acuñó la palabra. Vuelve en 4:8: purifiquen sus corazones, ustedes de doble ánimo.'),
      N(8, 'inestable', 'ἀκατάστατος', 'akatastatos', 'sin estabilidad', 'La misma palabra describe la lengua en 3:8, «un mal turbulento», y su pariente akatastasia es la «confusión» de 3:16. El que vive dividido no tiene dónde apoyarse.')
    ],
    observe: { q: '¿Qué tres cosas dice el v. 5 sobre la manera en que Dios da?',
               a: 'Da a todos, da abundantemente, sin dobleces, y da sin reproche. Y añade una promesa: le será dada.' },
    apply: '¿Para qué decisión o situación necesitas sabiduría hoy? ¿Ya se la pediste a Dios, o la estás buscando en otro lado?',
    links: [['Proverbios 2:6', 'El Señor da la sabiduría.'], ['Mateo 7:7–11', 'Pidan, y se les dará: el Padre da cosas buenas a los que le piden.']]
  },
  { sec: 's3', vv: [9, 11], title: 'Como la flor de la hierba', vig: 'flower',
    notes: [
      N(9, 'condición humilde', 'ὁ ταπεινός', 'ho tapeinos', 'el de abajo', 'El pobre, el que no cuenta para el mundo. Dios da gracia a los humildes (4:6), y María cantó que Dios exaltó a los humildes (Lucas 1:52).'),
      N(9, 'se gloríe', 'καυχάσθω', 'kauchasthō', 'que se jacte', 'Es el verbo de la jactancia mala de 4:16, pero aquí es bueno: gloriarse en lo que Dios da, no en lo que uno tiene (compara Jeremías 9:23–24).'),
      N(9, 'alta posición', 'ἐν τῷ ὕψει αὐτοῦ', 'en tō hypsei autou', 'en su altura', 'Su lugar real ante Dios: rico en fe y heredero del reino (2:5). Lo que el mundo ve abajo, Dios lo ve en lo alto.'),
      N(10, 'humillación', 'ἐν τῇ ταπεινώσει αὐτοῦ', 'en tē tapeinōsei autou', 'en su bajeza', 'Una paradoja: el rico se gloría al descubrir que su riqueza no vale nada ante Dios. Eso lo libra de confiar en ella.'),
      N(10, 'flor de la hierba', 'ὡς ἄνθος χόρτου', 'hōs anthos chortou', 'como flor del pasto', 'Viene de Isaías 40:6–8: toda carne es como hierba; la hierba se seca y la flor se cae, pero la palabra de nuestro Dios permanece para siempre. Pedro cita el mismo pasaje (1 Pedro 1:24–25).'),
      N(11, 'calor abrasador', 'σὺν τῷ καύσωνι', 'syn tō kausōni', 'con el viento ardiente', 'Kausōn puede ser el calor del sol o el siroco, el viento caliente del desierto que en un día seca los campos de Israel. Jesús usa la palabra en Lucas 12:55: «hará calor».'),
      N(11, 'se marchitará', 'μαρανθήσεται', 'maranthēsetai', 'se secará', 'Lo contrario es amarantos, «que no se marchita»: así describe Pedro la herencia que Dios nos guarda (1 Pedro 1:4) y la corona de gloria (1 Pedro 5:4).'),
      N(11, 'empresas', 'ἐν ταῖς πορείαις αὐτοῦ', 'en tais poreiais autou', 'en sus caminos', 'Literalmente, «en sus viajes». El rico se marchita en plena actividad, en medio de sus negocios, como los comerciantes de 4:13–14.')
    ],
    observe: { q: '¿En qué se gloría el humilde y en qué se gloría el rico?',
               a: 'El humilde, en su alta posición: Dios lo levanta. El rico, en su humillación: descubre que su riqueza pasará como la flor de la hierba (vv. 9–10).' },
    apply: '¿En qué pones tu seguridad: en lo que tienes o en quién eres delante de Dios?',
    links: [['Isaías 40:6–8', 'La hierba se seca, pero la palabra de Dios permanece.'], ['1 Timoteo 6:17', 'Que los ricos no pongan su esperanza en las riquezas inciertas.']]
  },
  { sec: 's4', vv: [12, 13], title: 'La corona de la vida', vig: 'wreath',
    notes: [
      N(12, 'Bienaventurado', 'μακάριος', 'makarios', 'dichoso', 'La palabra de las bienaventuranzas (Mateo 5:3–12). Santiago la usa otra vez en 1:25, y en 5:11 llama dichosos a los que sufrieron.'),
      N(12, 'persevera', 'ὑπομένει', 'hypomenei', 'se queda bajo', 'Es el verbo de la paciencia del v. 3: no escapar de la prueba, sino atravesarla.'),
      N(12, 'aprobado', 'δόκιμος', 'dokimos', 'probado y aceptado', 'Se decía del metal o de la moneda que pasaba la prueba y era declarada genuina. Es de la misma familia que «la prueba de su fe» del v. 3.'),
      N(12, 'corona de la vida', 'τὸν στέφανον τῆς ζωῆς', 'ton stephanon tēs zōēs', 'la corona que es la vida', 'El stephanos era la corona de laurel u olivo del vencedor en los juegos, no la de un rey. La corona es la vida misma. Jesús promete lo mismo: sé fiel hasta la muerte, y te daré la corona de la vida (Apocalipsis 2:10).'),
      N(12, 'a los que lo aman', 'τοῖς ἀγαπῶσιν αὐτόν', 'tois agapōsin auton', 'a los que lo aman', 'La promesa no es para los que nunca fallan, sino para los que aman a Dios. Santiago repite la frase en 2:5: el reino prometido a los que lo aman.'),
      N(13, 'tentado', 'πειραζόμενος', 'peirazomenos', 'probado o tentado', 'Es la raíz de «pruebas» en los vv. 2 y 12. La misma situación puede ser una prueba que Dios usa para hacernos crecer o una tentación hacia el mal; depende de lo que hacemos con ella.'),
      N(13, 'no puede ser tentado', 'ἀπείραστος κακῶν', 'apeirastos kakōn', 'intocable por el mal', 'Única vez en el Nuevo Testamento. El mal no tiene ningún punto de apoyo en Dios, y Él no empuja a nadie hacia el mal.')
    ],
    observe: { q: 'Según el v. 13, ¿qué excusa no debemos usar?',
               a: 'Decir «Soy tentado por Dios». Dios prueba la fe para hacerla crecer, pero nunca empuja a nadie hacia el mal.' },
    apply: '¿Hay alguna tentación que hayas excusado culpando a las circunstancias, a otros o incluso a Dios?',
    links: [['Apocalipsis 2:10', 'Sé fiel hasta la muerte, y te daré la corona de la vida.'], ['1 Corintios 10:13', 'Dios no permitirá que sean tentados más allá de lo que pueden soportar.']]
  },
  { sec: 's4', vv: [14, 15], title: 'Cuando la pasión concibe', vig: 'hook',
    notes: [
      N(14, 'llevado', 'ἐξελκόμενος', 'exelkomenos', 'arrastrado afuera', 'Un término de caza y de pesca: sacar a la presa de su escondite. Única vez en el Nuevo Testamento.'),
      N(14, 'seducido', 'δελεαζόμενος', 'deleazomenos', 'atraído con carnada', 'Viene de delear, la carnada del anzuelo. La tentación esconde el anzuelo detrás de algo atractivo. Pedro usa el mismo verbo para los que seducen a las almas inestables (2 Pedro 2:14, 18).'),
      N(14, 'propia pasión', 'τῆς ἰδίας ἐπιθυμίας', 'tēs idias epithymias', 'su propio deseo', 'El problema no está solo afuera. El anzuelo funciona porque algo dentro de nosotros lo desea. En 4:1–2 Santiago muestra adónde llevan esas pasiones.'),
      N(15, 'concebido', 'συλλαβοῦσα', 'syllabousa', 'habiendo concebido', 'Santiago cambia de imagen, de la pesca al nacimiento: el deseo queda embarazado. Es el verbo del anuncio a María: concebirás en tu vientre (Lucas 1:31).'),
      N(15, 'da a luz', 'τίκτει', 'tiktei', 'da a luz', 'El deseo consentido no se queda en un pensamiento: crece y nace como pecado.'),
      N(15, 'consumado', 'ἀποτελεσθεῖσα', 'apotelestheisa', 'llegado a su madurez', 'Cuando el pecado crece hasta su forma adulta. Es lo contrario de la paciencia del v. 4, que también madura, pero hasta hacernos perfectos y completos.'),
      N(15, 'engendra la muerte', 'ἀποκύει θάνατον', 'apokyei thanaton', 'da a luz la muerte', 'Apokyeō solo aparece aquí y en el v. 18, donde Dios «nos hizo nacer». Hay dos nacimientos posibles: el deseo da a luz la muerte; Dios da a luz la vida.')
    ],
    observe: { q: '¿Qué pasos sigue la tentación según los vv. 14–15?',
               a: 'La pasión atrae y seduce, luego concibe y da a luz el pecado; el pecado crece y, cuando se consuma, engendra la muerte. Es una cadena que se puede cortar al principio.' },
    apply: '¿En qué momento de esa cadena sueles darte cuenta de la tentación? ¿Qué te ayudaría a cortarla antes?',
    links: [['Génesis 4:7', 'El pecado acecha a la puerta, pero tú debes dominarlo.'], ['Romanos 6:23', 'La paga del pecado es muerte; la dádiva de Dios es vida eterna.']]
  },
  { sec: 's4', vv: [16, 18], title: 'El Padre de las luces', vig: 'lights',
    notes: [
      N(16, 'no se engañen', 'μὴ πλανᾶσθε', 'mē planasthe', 'no se extravíen', 'De la misma raíz que el hermano que «se extravía» en 5:19. El error que Santiago corrige es pensar que el mal viene de Dios. De Él solo viene lo bueno.'),
      N(17, 'buena dádiva', 'δόσις ἀγαθή', 'dosis agathē', 'buen dar', 'Dosis es el acto de dar, y dōrēma, «don», es el regalo mismo. En griego la frase tiene el ritmo de un verso de poesía, quizá un dicho conocido.'),
      N(17, 'Padre de las luces', 'τοῦ πατρὸς τῶν φώτων', 'tou patros tōn phōtōn', 'Padre de los astros', 'Dios creó el sol, la luna y las estrellas (Génesis 1:14–18; Salmo 136:7). Los astros cambian; su Creador no.'),
      N(17, 'cambio', 'παραλλαγή', 'parallagē', 'variación', 'Única vez en el Nuevo Testamento. Los astros cambian de lugar y de brillo, y la luna crece y mengua. Dios no.'),
      N(17, 'sombra de variación', 'τροπῆς ἀποσκίασμα', 'tropēs aposkiasma', 'sombra producida por un giro', 'Como la sombra que se mueve en un reloj de sol, o el eclipse que oscurece la luz. En Dios no hay giros ni sombras: Yo, el Señor, no cambio (Malaquías 3:6).'),
      N(18, 'nos hizo nacer', 'ἀπεκύησεν', 'apekyēsen', 'nos dio a luz', 'El mismo verbo del v. 15. El deseo da a luz la muerte, pero Dios, por su voluntad, nos dio a luz a una vida nueva (compara 1 Pedro 1:23).'),
      N(18, 'palabra de verdad', 'λόγῳ ἀληθείας', 'logō alētheias', 'por la palabra de verdad', 'El evangelio (Efesios 1:13; Colosenses 1:5). Es la misma palabra que en el v. 21 está implantada y que en el v. 22 hay que poner en práctica.'),
      N(18, 'primicias', 'ἀπαρχή', 'aparchē', 'primeros frutos', 'Los primeros frutos de la cosecha se ofrecían a Dios como señal de que toda la cosecha le pertenecía (Levítico 23:10). Los creyentes son el anticipo de la nueva creación.')
    ],
    observe: { q: 'En el v. 15 la pasión «engendra» la muerte. ¿Qué engendra Dios en el v. 18?',
               a: 'Dios nos hizo nacer por la palabra de verdad. Santiago usa el mismo verbo para mostrar dos nacimientos opuestos: el deseo da a luz la muerte; Dios da a luz la vida.' },
    apply: 'Anota tres buenas dádivas que recibiste esta semana. ¿Le diste gracias por ellas al Padre de las luces?',
    links: [['Malaquías 3:6', 'Yo, el Señor, no cambio.'], ['1 Pedro 1:23', 'Nacidos de nuevo por la palabra de Dios que vive y permanece.']]
  },
  { sec: 's5', vv: [19, 21], title: 'Pronto para oír', vig: 'roots',
    notes: [
      N(19, 'pronto para oír', 'ταχὺς εἰς τὸ ἀκοῦσαι', 'tachys eis to akousai', 'rápido para escuchar', 'Escuchar primero, a Dios en su palabra y a las personas. Es lo único que Santiago pide hacer rápido.'),
      N(19, 'tardo para hablar', 'βραδὺς εἰς τὸ λαλῆσαι', 'bradys eis to lalēsai', 'lento para hablar', 'Santiago desarrolla esta idea en el capítulo 3, el poder de la lengua. En las muchas palabras no falta pecado (Proverbios 10:19).'),
      N(19, 'tardo para la ira', 'βραδὺς εἰς ὀργήν', 'bradys eis orgēn', 'lento para el enojo', 'Así describe la Biblia a Dios mismo: lento para la ira y grande en misericordia (Éxodo 34:6; Salmo 103:8).'),
      N(20, 'ira del hombre', 'ὀργὴ ἀνδρός', 'orgē andros', 'el enojo humano', 'El enojo no produce la vida justa que Dios quiere, aunque parezca tener una causa justa. Lo que sí la produce aparece en 3:18: la justicia se siembra en paz.'),
      N(21, 'desechando', 'ἀποθέμενοι', 'apothemenoi', 'quitándose', 'El verbo de quitarse la ropa. Pablo lo usa para despojarse del viejo hombre (Efesios 4:22) y Pedro para desechar toda malicia (1 Pedro 2:1).'),
      N(21, 'con humildad', 'ἐν πραΰτητι', 'en prautēti', 'con mansedumbre', 'La misma palabra de la «sabia mansedumbre» de 3:13. Recibir la palabra con un corazón enseñable, como tierra preparada para la semilla.'),
      N(21, 'palabra implantada', 'τὸν ἔμφυτον λόγον', 'ton emphyton logon', 'la palabra plantada adentro', 'Única vez en el Nuevo Testamento. Una palabra sembrada en el corazón que echa raíces y crece, como en la parábola del sembrador (Lucas 8:11–15). Recuerda la promesa: pondré mi ley dentro de ellos (Jeremías 31:33).'),
      N(21, 'salvar sus almas', 'σῶσαι τὰς ψυχὰς ὑμῶν', 'sōsai tas psychas hymōn', 'salvar sus vidas', 'Psychē es la vida entera de la persona. Santiago termina la carta con una frase parecida: el que hace volver a un pecador salvará su alma de muerte (5:20).')
    ],
    observe: { q: '¿Cuáles son las tres instrucciones del v. 19? ¿Cuál es rápida y cuáles son lentas?',
               a: 'Pronto para oír; tardo para hablar y tardo para la ira. Solo una cosa debe ser rápida: escuchar.' },
    apply: 'En tu próxima conversación difícil, ¿cómo puedes escuchar primero antes de responder?',
    links: [['Proverbios 17:27–28', 'El que retiene sus palabras tiene conocimiento.'], ['Lucas 8:11–15', 'La semilla es la palabra de Dios; la buena tierra la retiene y da fruto.']]
  },
  { sec: 's5', vv: [22, 25], title: 'El espejo', vig: 'mirror',
    notes: [
      N(22, 'hacedores', 'ποιηταί', 'poiētai', 'hacedores', 'De poiētēs viene «poeta», el que hace o crea algo. Jesús terminó el Sermón del Monte con esta idea: el que oye y hace es como el que edifica sobre la roca (Mateo 7:24–27).'),
      N(22, 'oidores', 'ἀκροαταί', 'akroatai', 'oyentes', 'Era la palabra para el público que escuchaba a un orador. Pablo dice lo mismo: no los oidores de la ley son justos ante Dios, sino los hacedores (Romanos 2:13).'),
      N(22, 'se engañan a sí mismos', 'παραλογιζόμενοι ἑαυτούς', 'paralogizomenoi heautous', 'razonando mal consigo mismos', 'Un engaño por mal cálculo: creer que oír es lo mismo que obedecer.'),
      N(23, 'rostro natural', 'τὸ πρόσωπον τῆς γενέσεως αὐτοῦ', 'to prosōpon tēs geneseōs autou', 'el rostro de su nacimiento', 'Literalmente, «el rostro de su génesis»: la cara con la que nació. La misma palabra genesis aparece en 3:6, en «el curso de nuestra vida».'),
      N(23, 'espejo', 'ἐσόπτρῳ', 'esoptrō', 'espejo', 'Los espejos de la época eran de bronce o cobre pulido y daban una imagen imperfecta (compara 1 Corintios 13:12). Servían para una mirada rápida.'),
      N(24, 'se olvida', 'ἐπελάθετο', 'epelatheto', 'se olvidó', 'Santiago describe la escena con tres verbos rápidos: se mira, se va y se olvida. Oír sin hacer es como no haberse visto.'),
      N(25, 'mira atentamente', 'παρακύψας', 'parakypsas', 'inclinándose para mirar', 'Agacharse para ver mejor, como el discípulo que se inclinó para mirar dentro de la tumba vacía (Juan 20:5). Ya no es la mirada rápida del espejo.'),
      N(25, 'ley de la libertad', 'νόμον τέλειον τὸν τῆς ἐλευθερίας', 'nomon teleion ton tēs eleutherias', 'la ley perfecta, la de la libertad', 'Una ley que no esclaviza, porque Dios la escribe en el corazón. Santiago vuelve a ella en 2:12: hablen y actúen como los que serán juzgados por la ley de la libertad.')
    ],
    observe: { q: '¿Qué diferencia hay entre el hombre del espejo (vv. 23–24) y el del v. 25?',
               a: 'El primero se mira de prisa, se va y se olvida. El segundo mira atentamente, permanece en la palabra y la practica. Por eso es bienaventurado en lo que hace.' },
    apply: '¿Qué verdad de la Biblia has escuchado muchas veces pero todavía no has puesto en práctica?',
    links: [['Mateo 7:24–27', 'El que oye y hace es como el que edificó sobre la roca.'], ['Romanos 2:13', 'No los oidores de la ley, sino los hacedores serán justificados.']]
  },
  { sec: 's5', vv: [26, 27], title: 'La religión pura', vig: 'basket',
    notes: [
      N(26, 'religioso', 'θρησκός', 'thrēskos', 'devoto', 'Única vez en el Nuevo Testamento. Habla de la religión que se ve: oraciones, ayunos, reuniones, ritos.'),
      N(26, 'refrena', 'χαλιναγωγῶν', 'chalinagōgōn', 'llevando con freno', 'La primera vez que aparece la imagen que Santiago desarrolla en el capítulo 3: el freno en la boca del caballo (3:2–3).'),
      N(26, 'vana', 'μάταιος', 'mataios', 'vacía, sin fruto', 'Una religión hueca, que no produce nada. Pedro usa la palabra para la vana manera de vivir de la que Cristo nos rescató (1 Pedro 1:18).'),
      N(27, 'pura y sin mancha', 'καθαρὰ καὶ ἀμίαντος', 'kathara kai amiantos', 'limpia y sin contaminación', 'Palabras del templo y de los sacrificios. Pero la pureza que Dios busca no es solo de ritos: se ve en el amor por los más débiles.'),
      N(27, 'visitar', 'ἐπισκέπτεσθαι', 'episkeptesthai', 'visitar para cuidar', 'No es una visita de cortesía: es ir a ver qué necesita alguien y ocuparse de él. Jesús dijo: estuve enfermo, y me visitaron (Mateo 25:36). Dios mismo visitó a su pueblo (Lucas 1:68).'),
      N(27, 'huérfanos', 'ὀρφανοὺς καὶ χήρας', 'orphanous kai chēras', 'huérfanos y viudas', 'En la Biblia son los más desprotegidos, y Dios se declara su defensor: Padre de los huérfanos y defensor de las viudas (Salmo 68:5; Deuteronomio 10:18).'),
      N(27, 'sin mancha del mundo', 'ἄσπιλον ἀπὸ τοῦ κόσμου', 'aspilon apo tou kosmou', 'sin manchas del mundo', 'En 3:6 la lengua mancha todo el cuerpo, y en 4:4 la amistad del mundo es enemistad con Dios. El amor hacia afuera y la pureza hacia adentro van juntos.')
    ],
    observe: { q: 'Santiago da dos señales de una religión verdadera en el v. 27. ¿Cuáles son?',
               a: 'Cuidar a los huérfanos y a las viudas en sus aflicciones, y guardarse sin mancha del mundo: amor hacia afuera y pureza hacia adentro.' },
    apply: '¿Conoces a alguien solo o desprotegido, como un huérfano o una viuda, a quien podrías visitar esta semana?',
    links: [['Mateo 25:35–40', 'Lo que hicieron por uno de estos pequeños, lo hicieron por mí.'], ['Isaías 1:16–17', 'Aprendan a hacer el bien: defiendan al huérfano, aboguen por la viuda.']]
  }
];

const MEMO = { v: 22 };

function introBody(){
  const outline = ['s1', 's2', 's3', 's4', 's5'].map(k => {
    const s = SECTIONS[k], pi = pageOfVerse(s.from);
    const r = s.from === s.to ? 'v. ' + s.from : 'vv. ' + s.from + '–' + s.to;
    return `<li><button data-go="${pi}" style="--c:${s.color}"><i></i><span><small>${r}</small><b>${s.name}</b></span>${ICON.arrow}</button></li>`;
  }).join('');
  return `
    <div class="prose">
      <p>La carta la escribe Santiago, probablemente el hermano del Señor, que llegó a ser uno de los líderes de la iglesia de Jerusalén (Hechos 15:13; Gálatas 1:19). Escribe a creyentes dispersos por el mundo.</p>
      <p>Son 108 versículos llenos de mandatos directos, frases cortas e imágenes de la vida diaria. Se parece a Proverbios y repite muchas enseñanzas de Jesús, sobre todo del Sermón del Monte.</p>
      <p>El capítulo 1 presenta casi todos los temas que la carta desarrollará después: las pruebas, la sabiduría, los pobres y los ricos, la lengua, la ira y una fe que se pone en práctica.</p>
      <ul class="outline">${outline}</ul>
      <p>Y una promesa para el camino: Dios da a todos abundantemente y sin reproche (1:5).</p>
    </div>`;
}
function recapBody(){
  const low = [['Duda y vive dividido', 'v. 8'], ['Culpa a Dios en la tentación', 'v. 13'], ['Se deja llevar por su pasión', 'v. 14'], ['Habla pronto y se enoja', 'v. 19'], ['Se mira y se olvida', 'v. 24'], ['No refrena su lengua', 'v. 26']];
  const high = [['Tiene por gozo la prueba', 'v. 2'], ['Pide sabiduría con fe', 'v. 5'], ['Persevera bajo la prueba', 'v. 12'], ['Escucha antes de hablar', 'v. 19'], ['Recibe la palabra con humildad', 'v. 21'], ['Mira atentamente y permanece', 'v. 25'], ['Visita a huérfanos y viudas', 'v. 27']];
  const imgs = [['Ola del mar', 6], ['Flor de la hierba', 10], ['Corona', 12], ['Carnada', 14], ['Nacimiento', 15], ['Padre de las luces', 17], ['Espejo', 23], ['Freno', 26]];
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
    <p class="prose" style="margin-top:22px">Santiago termina el capítulo frente a un espejo. Oír la palabra no basta: el que la escucha y la pone en práctica es bienaventurado en lo que hace (v. 25).</p>
    <div class="compare">
      <div class="col" style="--c:var(--red)">
        <h3>Solo oidores</h3>
        <ul>${li(low)}</ul>
        <p class="harvest"><b>Su final</b>Una religión vana (v. 26)</p>
      </div>
      <div class="col" style="--c:var(--teal)">
        <h3>Hacedores</h3>
        <ul>${li(high)}</ul>
        <p class="harvest"><b>Su final</b>Bienaventurado en lo que hace (v. 25)</p>
      </div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--sage)">Dos nacimientos</p>
    <div class="births">
      <div class="birth" style="--c:var(--red)"><p class="bh">La pasión · vv. 14–15</p><p class="chain">${chain(['Pasión', 'concibe', 'pecado', 'se consuma', 'muerte'])}</p></div>
      <div class="birth" style="--c:var(--teal)"><p class="bh">Dios · v. 18</p><p class="chain">${chain(['Su voluntad', 'palabra de verdad', 'nos hizo nacer', 'primicias'])}</p></div>
    </div>
    <p class="blk-label sub-h" style="--c:var(--red)">Las imágenes del capítulo</p>
    <div class="chips">${imgs.map(([t, v]) => `<button class="chip" data-go="${pageOfVerse(v)}">${t}<small>v. ${v}</small></button>`).join('')}</div>
    ${letterBlock()}
    ${memoBlock()}
    <p class="blk-label sub-h" style="--c:var(--ochre)">Oración</p>
    <p class="prayer">Padre de las luces, gracias por toda buena dádiva. Dame paciencia en las pruebas y sabiduría cuando me falte; que te la pida con fe, sin dudar. Que no solo escuche tu palabra, sino que la ponga en práctica. Amén.</p>`;
}
