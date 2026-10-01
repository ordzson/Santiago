/* Santiago 3 — páginas, notas del griego, preguntas y repaso.
   N(versículo, 'palabra exacta del texto', 'griego', 'transliteración', 'significado', 'explicación')
   La palabra debe aparecer tal cual en ese versículo (herramientas/verificar.py lo comprueba). */
  const BOOK = { name: 'Santiago', ch: 3, key: 'stgo3-page' };
  const NBLA = __NBLA__;          // se llena con texto/santiago-3.txt
  const HEADINGS = __TITULOS__;   // títulos de sección del mismo archivo
  const SECTIONS = {
    intro:  { name: 'Antes de empezar', color: 'var(--ochre)', long: 2 },
    s1:     { name: HEADINGS[1],  color: 'var(--red)',  long: 1, from: 1,  to: 12 },
    s2:     { name: HEADINGS[13], color: 'var(--teal)', long: 4, from: 13, to: 18 },
    repaso: { name: 'Repaso', color: 'var(--sage)', long: 3 }
  };
  const INTRO = { title: 'Lentos para hablar', ref: 'Santiago 1 al 3', vig: 'scroll' };
  const RECAP_TITLE = 'Dos sabidurías';
  const N = (v, k, gr, tr, gloss, body, occ) => ({ v, k, gr, tr, gloss, body, occ: occ || 1 });
const TEXT_PAGES = [
  { sec: 's1', vv: [1, 2], title: 'No muchos maestros', vig: 'scale',
    notes: [
      N(1, 'maestros', 'διδάσκαλοι', 'didaskaloi', 'los que enseñan', 'En la iglesia primitiva enseñar era un ministerio reconocido (Hechos 13:1; 1 Corintios 12:28). Santiago no prohíbe enseñar. Advierte que quien enseña carga con más responsabilidad.'),
      N(1, 'juicio más severo', 'μεῖζον κρίμα', 'meizon krima', 'un juicio mayor', 'Santiago dice «recibiremos» y se incluye a sí mismo. A mayor influencia, más cuentas que rendir (compara Lucas 12:48).'),
      N(2, 'fallamos', 'πταίομεν', 'ptaiomen', 'tropezamos', 'Es la imagen de alguien que da un traspié en el camino. Santiago usa el mismo verbo en 2:10. Nadie está libre de tropezar, y de muchas maneras.'),
      N(2, 'en lo que dice', 'ἐν λόγῳ', 'en logō', 'en palabra', 'Las palabras son el terreno donde más tropezamos. Por eso el dominio de la lengua sirve como prueba de madurez.'),
      N(2, 'perfecto', 'τέλειος', 'teleios', 'completo, maduro', 'No quiere decir «sin pecado». Describe a una persona madura, que ha llegado a la meta. Es una palabra favorita de Santiago (1:4, 17, 25).'),
      N(2, 'refrenar', 'χαλιναγωγῆσαι', 'chalinagōgēsai', 'guiar con freno', 'Literalmente, «llevar con la brida». Santiago ya la usó en 1:26, y aquí prepara la imagen del versículo siguiente: el freno en la boca del caballo.')
    ],
    observe: { q: '¿A quiénes incluye Santiago cuando dice «recibiremos» y «todos fallamos»?',
               a: 'Se incluye a sí mismo. Habla como un maestro que también será juzgado y que también tropieza.' },
    apply: '¿Dónde enseñan o influyen tus palabras: en casa, en el trabajo, en la iglesia, en redes? ¿Qué cambia si sabes que vas a dar cuenta de ellas?',
    links: [['Mateo 12:36–37', 'Jesús enseña que daremos cuenta de cada palabra descuidada.'], ['Santiago 1:19, 26', 'Ser lentos para hablar y refrenar la lengua.']]
  },
  { sec: 's1', vv: [3, 4], title: 'El freno y el timón', vig: 'ship',
    notes: [
      N(3, 'freno', 'χαλινός', 'chalinos', 'freno, bocado', 'Un pedazo de metal en la boca dirige a un animal que pesa cientos de kilos. Lo pequeño gobierna lo grande.'),
      N(4, 'naves', 'πλοῖα', 'ploia', 'barcos', 'Los barcos mercantes del Mediterráneo eran grandes. En el barco donde naufragó Pablo viajaban 276 personas (Hechos 27:37).'),
      N(4, 'timón muy pequeño', 'ἐλαχίστου πηδαλίου', 'elachistou pēdaliou', 'el timón más pequeño', 'El timón antiguo era un remo grande a un lado de la popa; la palabra reaparece en Hechos 27:40. Elachistos es un superlativo, «pequeñísimo», y subraya el contraste con la nave.'),
      N(4, 'la voluntad del piloto', 'ἡ ὁρμὴ τοῦ εὐθύνοντος', 'hē hormē tou euthynontos', 'el impulso del que dirige', 'El timón obedece al deseo de quien lo maneja. La pregunta de fondo es quién lleva el timón de nuestra lengua.')
    ],
    observe: { q: '¿Qué tienen en común el freno y el timón?',
               a: 'Los dos son pequeños, pero deciden la dirección de algo mucho más grande. El versículo 5 aplica la lección: así es la lengua.' },
    apply: 'Si tu lengua es el timón, ¿quién lo está dirigiendo? ¿Qué vientos fuertes, como el cansancio, el enojo o la prisa, suelen empujar tus palabras?',
    links: [['Proverbios 18:21', 'La lengua tiene poder sobre la vida y la muerte.'], ['Salmo 141:3', 'Una oración para que Dios vigile la puerta de los labios.']]
  },
  { sec: 's1', vv: [5, 6], title: 'Una chispa, un bosque', vig: 'forest',
    notes: [
      N(5, 'se jacta de grandes cosas', 'μεγάλα αὐχεῖ', 'megala auchei', 'presume de cosas grandes', 'La lengua es pequeña pero se cree grande, y sus efectos sí lo son. Santiago vuelve a la jactancia en 3:14 y 4:16.'),
      N(5, 'qué gran bosque', 'ἡλίκον πῦρ ἡλίκην ὕλην', 'hēlikon pyr hēlikēn hylēn', '¡qué fuego, qué bosque!', 'Santiago usa dos veces la misma palabra, hēlikos, con sentidos opuestos: qué pequeño el fuego y qué grande el bosque. Hylē es el bosque o la leña, todo el material listo para arder.'),
      N(6, 'un mundo de iniquidad', 'ὁ κόσμος τῆς ἀδικίας', 'ho kosmos tēs adikias', 'el mundo de la injusticia', 'Todo un universo de maldad cabe en un miembro pequeño. En Santiago, «el mundo» es el sistema de valores que se opone a Dios (1:27; 4:4).'),
      N(6, 'contamina', 'σπιλοῦσα', 'spilousa', 'mancha', 'Contrasta con 1:27, donde la religión pura se guarda sin mancha (aspilos) del mundo. La lengua mancha a la persona entera.'),
      N(6, 'infierno', 'γέεννα', 'geenna', 'Gehena', 'El valle de Hinom, al sur de Jerusalén, asociado con la idolatría y después con el juicio de fuego. Fuera de los labios de Jesús, solo Santiago usa esta palabra en el Nuevo Testamento.'),
      N(6, 'el curso de nuestra vida', 'τὸν τροχὸν τῆς γενέσεως', 'ton trochon tēs geneseōs', 'la rueda de la existencia', 'Literalmente, «la rueda del nacimiento»: todo el ciclo de la vida, de principio a fin. Una chispa de la lengua puede incendiar la vida entera.')
    ],
    observe: { q: '¿Cuántas imágenes de fuego hay en estos dos versículos? ¿De dónde viene ese fuego, según Santiago?',
               a: 'Un fuego pequeño, un bosque que se incendia, la lengua que es un fuego, que es encendida y que inflama. Ese fuego viene del infierno, la Gehena (v. 6).' },
    apply: 'Piensa en un conflicto que empezó con una frase. ¿Qué lo encendió y qué lo habría apagado?',
    links: [['Proverbios 26:20–21', 'Sin leña se apaga el fuego; sin chisme se acaba el pleito.'], ['Mateo 15:18', 'Lo que sale de la boca viene del corazón.']]
  },
  { sec: 's1', vv: [7, 8], title: 'Lo que nadie puede domar', vig: 'serpent',
    notes: [
      N(7, 'toda clase', 'πᾶσα φύσις', 'pasa physis', 'toda naturaleza, toda especie', 'Fieras, aves, reptiles y animales marinos: la lista recuerda Génesis 1:26–28, donde Dios da al ser humano dominio sobre los animales.'),
      N(7, 'ser humano', 'τῇ φύσει τῇ ἀνθρωπίνῃ', 'tē physei tē anthrōpinē', 'la naturaleza humana', 'Juego de palabras: toda naturaleza animal ha sido domada por la naturaleza humana. Pero esa misma naturaleza no logra domarse a sí misma.'),
      N(8, 'domar', 'δαμάσαι', 'damasai', 'domar, someter', 'El mismo verbo aparece en Marcos 5:4: nadie podía dominar al endemoniado de Gadara. Lo que nadie pudo, Jesús lo hizo.'),
      N(8, 'mal turbulento', 'ἀκατάστατον κακόν', 'akatastaton kakon', 'un mal inquieto', 'Un mal que no se queda quieto. Es la misma familia de palabras del hombre de doble ánimo en 1:8 y de la «confusión» de 3:16. Algunos manuscritos dicen «un mal imposible de contener», y por eso otras versiones traducen distinto.'),
      N(8, 'veneno mortal', 'ἰοῦ θανατηφόρου', 'iou thanatēphorou', 'veneno que trae muerte', 'Eco del Salmo 140:3, que Pablo cita en Romanos 3:13: veneno de serpiente bajo los labios. La misma palabra, ios, significa «herrumbre» en Santiago 5:3.')
    ],
    observe: { q: 'Santiago nombra cuatro grupos de animales. ¿Dónde aparece una lista parecida al principio de la Biblia?',
               a: 'En Génesis 1:26–28, cuando Dios da al ser humano dominio sobre peces, aves, ganado y reptiles. Podemos domar a los animales, pero no a nuestra propia lengua.' },
    apply: 'Si ningún ser humano puede domar la lengua, ¿qué esperanza nos queda? Lee Santiago 1:5 y 4:6 y anota lo que Dios ofrece.',
    links: [['Salmo 140:3', 'Veneno de víbora bajo los labios.'], ['Santiago 4:6', 'Dios da mayor gracia.']]
  },
  { sec: 's1', vv: [9, 10], title: 'Una misma boca', vig: 'figure',
    notes: [
      N(9, 'bendecimos', 'εὐλογοῦμεν', 'eulogoumen', 'hablamos bien de', 'En la oración judía se bendecía a Dios muchas veces al día con fórmulas como «Bendito eres, Señor». La boca que bendice en la reunión puede maldecir a la salida.'),
      N(9, 'maldecimos', 'καταρώμεθα', 'katarōmetha', 'deseamos el mal', 'Jesús enseñó lo contrario: bendecir a quienes nos maldicen (Lucas 6:28). Pablo lo repite en Romanos 12:14.'),
      N(9, 'a la imagen de Dios', 'καθ᾽ ὁμοίωσιν θεοῦ', 'kath homoiōsin theou', 'según la semejanza de Dios', 'Santiago toma la palabra de Génesis 1:26 en la Biblia griega. Maldecir a una persona es despreciar la imagen de Aquel a quien decimos bendecir (compara Génesis 9:6).'),
      N(10, 'no debe ser así', 'οὐ χρή', 'ou chrē', 'no conviene', 'Es la única vez que aparece este verbo en el Nuevo Testamento. Señala algo que va contra el orden mismo de la creación.')
    ],
    observe: { q: '¿Qué razón da Santiago para no maldecir a las personas?',
               a: 'Que han sido hechas a la imagen de Dios (v. 9). No podemos bendecir al Padre y maldecir a quienes llevan su imagen.' },
    apply: '¿A quién te cuesta más bendecir con tus palabras? Escribe algo bueno y verdadero que puedas decirle esta semana.',
    links: [['Génesis 1:26–27', 'El ser humano, creado a imagen y semejanza de Dios.'], ['Lucas 6:28', 'Bendecir a quienes nos maldicen.']]
  },
  { sec: 's1', vv: [11, 12], title: 'La fuente y el árbol', vig: 'spring',
    notes: [
      N(11, 'fuente', 'πηγή', 'pēgē', 'manantial', 'En una tierra seca, un manantial era cuestión de vida. Nadie confiaría en uno que a veces diera agua buena y a veces amarga.'),
      N(11, 'amarga', 'πικρόν', 'pikron', 'amarga', 'Santiago repite la palabra en el v. 14, «celos amargos». El agua amarga del manantial anticipa el corazón amargo.'),
      N(11, 'abertura', 'ὀπή', 'opē', 'grieta, hendidura', 'La grieta en la roca por donde brota el agua. La misma palabra nombra las cuevas donde se escondían los fieles en Hebreos 11:38.'),
      N(12, 'higuera', 'συκῆ · ἐλαία · ἄμπελος', 'sykē · elaia · ampelos', 'higuera, olivo, vid', 'Los tres cultivos típicos de Israel. Jesús usó la misma lógica: cada árbol se conoce por su fruto (Mateo 7:16–20).'),
      N(12, 'agua salada', 'ἁλυκόν', 'halykon', 'salobre', 'Un manantial salobre no puede dar agua dulce. Lo que sale revela lo que hay en la fuente.')
    ],
    observe: { q: 'Las preguntas de los vv. 11–12 esperan una respuesta obvia. ¿Cuál es, y qué enseña sobre la boca?',
               a: 'No. Una fuente da un solo tipo de agua y un árbol da el fruto de su especie. Lo que sale de la boca revela lo que hay en la fuente: el corazón.' },
    apply: 'Si tus palabras de esta semana fueran el agua de un manantial, ¿qué dirían de la fuente?',
    links: [['Lucas 6:45', 'De lo que abunda en el corazón habla la boca.'], ['Mateo 7:16–20', 'El árbol se conoce por su fruto.']]
  },
  { sec: 's2', vv: [13, 14], title: '¿Quién es sabio?', vig: 'lamp',
    notes: [
      N(13, 'sabio y entendido', 'σοφὸς καὶ ἐπιστήμων', 'sophos kai epistēmōn', 'sabio y con conocimiento', 'La misma pareja aparece en la Biblia griega de Deuteronomio (1:13; 4:6) para describir a quienes guiaban al pueblo. Santiago pregunta quién merece ese título.'),
      N(13, 'buena conducta', 'καλῆς ἀναστροφῆς', 'kalēs anastrophēs', 'manera de vivir', 'No es un acto aislado, sino el estilo de vida completo. Para Santiago la sabiduría se demuestra viviendo, igual que la fe (2:18).'),
      N(13, 'sabia mansedumbre', 'πραΰτητι σοφίας', 'prautēti sophias', 'mansedumbre de sabiduría', 'Mansedumbre no es debilidad, es fuerza bajo control. En griego la palabra podía describir a un animal amansado, como el caballo con freno del v. 3. Santiago ya la pidió en 1:21.'),
      N(14, 'celos amargos', 'ζῆλον πικρόν', 'zēlon pikron', 'celo amargo, envidia', 'Zēlos puede ser un celo bueno o una envidia que corroe. Aquí es «amargo», como el agua mala del v. 11.'),
      N(14, 'ambición personal', 'ἐριθεία', 'eritheia', 'rivalidad egoísta', 'Antes del Nuevo Testamento se usaba para quien buscaba cargos públicos por interés propio. Pablo la nombra entre las obras de la carne (Gálatas 5:20) y la rechaza en Filipenses 2:3.'),
      N(14, 'no sean arrogantes', 'μὴ κατακαυχᾶσθε', 'mē katakauchasthe', 'no se jacten', 'Pariente del verbo de la lengua que «se jacta» (v. 5). En 2:13 el mismo verbo dice algo hermoso: la misericordia triunfa sobre el juicio.')
    ],
    observe: { q: '¿Cómo dice Santiago que se demuestra la sabiduría?',
               a: 'Con la buena conducta: obras hechas con sabia mansedumbre (v. 13). No con títulos ni con discursos.' },
    apply: 'Piensa en tu próxima conversación difícil. ¿Cómo se vería allí la sabia mansedumbre?',
    links: [['Santiago 2:18', 'La fe se muestra por las obras.'], ['Filipenses 2:3', 'Nada por rivalidad; con humildad, pensar en los demás.']]
  },
  { sec: 's2', vv: [15, 16], title: 'La otra sabiduría', vig: 'thorns',
    notes: [
      N(15, 'de lo alto', 'ἄνωθεν', 'anōthen', 'desde arriba', 'Toda buena dádiva desciende de lo alto (1:17), y la sabiduría se pide a Dios (1:5). Es la misma palabra de Juan 3:3: nacer de lo alto.'),
      N(15, 'terrenal', 'ἐπίγειος', 'epigeios', 'de la tierra', 'Una sabiduría cuyo horizonte termina en esta vida: éxito, fama, ventaja (compara Filipenses 3:19).'),
      N(15, 'natural', 'ψυχική', 'psychikē', 'del alma, solo humana', 'Sabiduría puramente humana, sin el Espíritu de Dios. Pablo usa la palabra en 1 Corintios 2:14, y Judas en el v. 19.'),
      N(15, 'diabólica', 'δαιμονιώδης', 'daimoniōdēs', 'demoníaca', 'Única vez en el Nuevo Testamento. Recuerda 2:19: los demonios también saben cosas de Dios, y tiemblan. Saber no es lo mismo que ser sabio.'),
      N(16, 'confusión', 'ἀκαταστασία', 'akatastasia', 'desorden, inestabilidad', 'Pariente del «mal turbulento» del v. 8. Pablo la usa en 1 Corintios 14:33: Dios no es Dios de confusión, sino de paz.'),
      N(16, 'toda cosa mala', 'πᾶν φαῦλον πρᾶγμα', 'pan phaulon pragma', 'toda práctica vil', 'Phaulos describe lo vil y despreciable. Donde manda la competencia egoísta, todo se degrada.')
    ],
    observe: { q: '¿Qué tres palabras describen la sabiduría que no viene de lo alto? ¿Qué produce?',
               a: 'Terrenal, natural y diabólica (v. 15). Produce confusión y toda cosa mala (v. 16).' },
    apply: '¿Dónde ves hoy celos o ambición disfrazados de inteligencia? ¿Hay algo de eso en ti?',
    links: [['1 Corintios 14:33', 'Dios no es Dios de confusión, sino de paz.'], ['Gálatas 5:19–21', 'Celos, rivalidades y divisiones entre las obras de la carne.']]
  },
  { sec: 's2', vv: [17, 18], title: 'Lo que se siembra en paz', vig: 'sprout',
    notes: [
      N(17, 'pura', 'ἁγνή', 'hagnē', 'limpia, sin mezcla', 'Va «primeramente»: la pureza es la raíz de la que brotan las demás cualidades. Una sabiduría sin motivos ocultos.'),
      N(17, 'pacífica', 'εἰρηνική', 'eirēnikē', 'que ama y produce paz', 'Lo opuesto a la confusión del v. 16. Hebreos 12:11 habla del fruto apacible de justicia.'),
      N(17, 'amable', 'ἐπιεικής', 'epieikēs', 'considerada, razonable', 'Describe a quien no exige todos sus derechos y trata a los demás con consideración (Filipenses 4:5; Tito 3:2).'),
      N(17, 'condescendiente', 'εὐπειθής', 'eupeithēs', 'dispuesta a ceder', 'Única vez en el Nuevo Testamento. Describe a quien se deja persuadir por lo razonable: no es terca, es enseñable.'),
      N(17, 'llena de misericordia', 'μεστὴ ἐλέους', 'mestē eleous', 'llena de compasión', 'Santiago ya dijo que la misericordia triunfa sobre el juicio (2:13). La sabiduría de Dios se nota en cómo trata al débil.'),
      N(17, 'buenos frutos', 'καρπῶν ἀγαθῶν', 'karpōn agathōn', 'buenos frutos', 'Como la fe del capítulo 2, esta sabiduría se ve en obras concretas y no solo en ideas.'),
      N(17, 'sin vacilación', 'ἀδιάκριτος', 'adiakritos', 'sin dudar, imparcial', 'Sin doble cara y sin favoritismos. Se relaciona con el que duda en 1:6 y con las distinciones entre personas de 2:4.'),
      N(17, 'sin hipocresía', 'ἀνυπόκριτος', 'anypokritos', 'sin máscara', 'El hypokritēs era el actor de teatro que hablaba detrás de una máscara. La sabiduría de lo alto no actúa un papel.'),
      N(18, 'la semilla cuyo fruto es la justicia', 'καρπὸς δικαιοσύνης', 'karpos dikaiosynēs', 'fruto de justicia', 'La justicia que Dios quiere no se produce con enojo (1:20). Se cultiva con paciencia y crece en un ambiente de paz.'),
      N(18, 'aquellos que hacen la paz', 'τοῖς ποιοῦσιν εἰρήνην', 'tois poiousin eirēnēn', 'los que hacen la paz', 'El griego puede leerse «por» o «para» los que hacen la paz: ellos siembran y ellos cosechan. Eco de Mateo 5:9, dichosos los que trabajan por la paz.')
    ],
    observe: { q: '¿Qué cualidad va «primeramente»? ¿Por qué crees que va primero?',
               a: 'La pureza. Las demás cualidades brotan de un corazón sin mezcla, sin celos amargos ni ambición personal (v. 14).' },
    apply: 'Elige una de las ocho cualidades del v. 17. ¿Qué paso concreto darás esta semana para que crezca en ti?',
    links: [['Mateo 5:9', 'Dichosos los que trabajan por la paz.'], ['Gálatas 5:22–23', 'El fruto del Espíritu.']]
  }
];
  const MEMO = { v: 17 };
  function introBody(){
    const outline = ['s1', 's2'].map(k => {
      const s = SECTIONS[k], pi = pageOfVerse(s.from);
      return `<li><button data-go="${pi}" style="--c:${s.color}"><i></i><span><small>vv. ${s.from}–${s.to}</small><b>${s.name}</b></span>${ICON.arrow}</button></li>`;
    }).join('');
    return `
      <div class="prose">
        <p>El capítulo 2 terminó con una fe que se demuestra con obras. El capítulo 3 lleva esa prueba a un terreno pequeño y difícil: las palabras.</p>
        <p>En el capítulo 1, Santiago dio la consigna de estar listos para escuchar, ser lentos para hablar y lentos para enojarse (1:19). También advirtió que una religión que no refrena la lengua no sirve de nada (1:26). El capítulo 3 desarrolla esas ideas en dos partes.</p>
        <ul class="outline">${outline}</ul>
        <p>Y una promesa para el camino: si a alguno le falta sabiduría, que se la pida a Dios, quien da a todos abundantemente y sin reproche (1:5).</p>
      </div>`;
  }
  function recapBody(){
    const low = ['Celos amargos', 'Ambición personal', 'Arrogancia', 'Mentira contra la verdad', 'Confusión', 'Toda cosa mala'];
    const high = ['Pura', 'Pacífica', 'Amable', 'Condescendiente', 'Llena de misericordia', 'De buenos frutos', 'Sin vacilación', 'Sin hipocresía'];
    const imgs = [['Freno', 'v. 3', 3], ['Timón', 'v. 4', 4], ['Fuego', 'vv. 5–6', 5], ['Veneno', 'v. 8', 8], ['Imagen de Dios', 'v. 9', 9], ['Fuente', 'v. 11', 11], ['Higuera', 'v. 12', 12], ['Semilla', 'v. 18', 18]];
    return `
      <p class="prose" style="margin-top:22px">Santiago termina el capítulo con dos fuentes. Lo que sale de cada una muestra de dónde viene.</p>
      <div class="compare">
        <div class="col" style="--c:var(--sage)">
          <h3>Terrenal <span>vv. 14–16</span></h3>
          <ul>${low.map(x => `<li>${x}</li>`).join('')}</ul>
          <p class="harvest"><b>Cosecha</b>Confusión y toda cosa mala</p>
        </div>
        <div class="col" style="--c:var(--teal)">
          <h3>De lo alto <span>v. 17</span></h3>
          <ul>${high.map(x => `<li>${x}</li>`).join('')}</ul>
          <p class="harvest"><b>Cosecha</b>Justicia sembrada en paz</p>
        </div>
      </div>
      <p class="blk-label sub-h" style="--c:var(--red)">Las imágenes del capítulo</p>
      <div class="chips">${imgs.map(([t, r, v]) => `<button class="chip" data-go="${pageOfVerse(v)}">${t}<small>${r}</small></button>`).join('')}</div>
      ${letterBlock()}
      ${memoBlock()}
      <p class="blk-label sub-h" style="--c:var(--ochre)">Oración</p>
      <p class="prayer">Padre, mi lengua es pequeña y puede incendiar un bosque. Pon guarda a mi boca. Dame la sabiduría que viene de lo alto, pura, pacífica y llena de misericordia, para que mis palabras siembren paz. Amén.</p>`;
  }
