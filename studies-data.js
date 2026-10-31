/**
 * studies-data.js
 * Base de Dados Oficial de Estudos e Artigos Teológicos
 * Categorias: Estudos do GC, Mulheres, Homens, Educação Cristã, Família, Missões,
 * Juventude, Adolescentes, Igreja, Autores Reformados, Teologia, Devocionais.
 * Com base nos acervos de Ligonier Ministries (learn.ligonier.org) e Desiring God (desiringgod.org).
 */

const STUDIES_TOPICS = [
  {
    id: 'gc',
    name: 'Estudos do GC',
    shortName: 'Pequenos Grupos',
    icon: 'groups',
    badge: 'Série Oficial ICEMP',
    color: 'emerald',
    accentColor: '#059669',
    bgGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80',
    description: '11 Lições oficiais da Série Mutualidade em PDF no Google Drive para Grupos de Crescimento nos lares, comunhão e edificação pastoral.',
    driveFolderUrl: 'https://drive.google.com/drive/folders/19pWPew6b8x5NF_Adqa7SpWTFfkEMsdxo',
    isGc: true,
    isFeatured: true
  },
  {
    id: 'estudos-pastorais',
    name: 'Estudos Pastorais',
    shortName: 'Artigos Pastorais',
    icon: 'history_edu',
    badge: 'Autoria Pastoral • ICEMP',
    color: 'sky',
    accentColor: '#0284c7',
    bgGradient: 'from-sky-900 via-iceb-navy to-slate-950',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    description: '15 Artigos e estudos bíblicos do Pr. Ubiracy Lucas Barbosa publicados no portal oficial da ICE Metropolitana de Palmas (icemetropolitana.com.br/artigosbiblicos).',
    isGc: false,
    isPastoral: true,
    isFeatured: true
  },
  {
    id: 'mulheres',
    name: 'Mulheres',
    shortName: 'Feminilidade Bíblica',
    icon: 'spa',
    badge: 'Vida Cristã',
    color: 'rose',
    accentColor: '#e11d48',
    bgGradient: 'from-rose-700 via-pink-800 to-slate-900',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    description: 'Feminilidade bíblica, graça no cotidiano, maternidade, amizade cristã e piedade no lar e na igreja.',
    isGc: false
  },
  {
    id: 'homens',
    name: 'Homens',
    shortName: 'Masculinidade Bíblica',
    icon: 'shield_person',
    badge: 'Liderança e Caráter',
    color: 'slate',
    accentColor: '#334155',
    bgGradient: 'from-slate-800 via-slate-900 to-iceb-navy',
    image: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=600&q=80',
    description: 'Masculinidade bíblica, liderança de servos no lar, integridade no trabalho e firmeza na fé cristã.',
    isGc: false
  },
  {
    id: 'educacao-crista',
    name: 'Educação Cristã',
    shortName: 'Ensino Bíblico',
    icon: 'school',
    badge: 'Doutrina & EBD',
    color: 'amber',
    accentColor: '#d97706',
    bgGradient: 'from-amber-700 via-yellow-800 to-slate-900',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    description: 'Catequese bíblica, Escola Bíblica Dominical, formação de discípulos e cosmovisão cristã sólida.',
    isGc: false
  },
  {
    id: 'familia',
    name: 'Família',
    shortName: 'Casamento & Lar',
    icon: 'diversity_1',
    badge: 'Aliança & Lar',
    color: 'sky',
    accentColor: '#0284c7',
    bgGradient: 'from-sky-800 via-cyan-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
    description: 'Casamento bíblico segundo a aliança, culto doméstico, criação de filhos na graça e resolução bíblica de conflitos.',
    isGc: false
  },
  {
    id: 'missoes',
    name: 'Missões',
    shortName: 'Povos & Evangelismo',
    icon: 'public',
    badge: 'Grande Comissão',
    color: 'teal',
    accentColor: '#0d9488',
    bgGradient: 'from-teal-800 via-emerald-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
    description: 'A glória de Deus entre as nações, a urgência da Grande Comissão, plantação de igrejas e evangelismo bíblico.',
    isGc: false
  },
  {
    id: 'juventude',
    name: 'Juventude',
    shortName: 'Jovens JUMP',
    icon: 'bolt',
    badge: 'Vocação & Pureza',
    color: 'indigo',
    accentColor: '#4f46e5',
    bgGradient: 'from-indigo-800 via-violet-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    description: 'Vivendo com paixão pelo Evangelho na faculdade e no início de carreira, pureza, vocação e testemunho cristão.',
    isGc: false
  },
  {
    id: 'adolescentes',
    name: 'Adolescentes',
    shortName: 'Geração Eleita',
    icon: 'psychology',
    badge: 'Identidade em Cristo',
    color: 'orange',
    accentColor: '#ea580c',
    bgGradient: 'from-orange-700 via-amber-800 to-slate-900',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    description: 'Identidade bíblica em Cristo, vencendo as pressões das redes sociais e cultivando amizades saudáveis.',
    isGc: false
  },
  {
    id: 'igreja',
    name: 'Igreja',
    shortName: 'Eclesiologia',
    icon: 'church',
    badge: 'Corpo de Cristo',
    color: 'blue',
    accentColor: '#2563eb',
    bgGradient: 'from-blue-800 via-iceb-navy to-slate-950',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80',
    description: 'Eclesiologia bíblica, a bênção da membresia na igreja local, culto congregacional, sacramentos e governo bíblico.',
    isGc: false
  },
  {
    id: 'autores-reformados',
    name: 'Autores Reformados',
    shortName: 'Herança Histórica',
    icon: 'history_edu',
    badge: 'Tradição Histórica',
    color: 'stone',
    accentColor: '#78716c',
    bgGradient: 'from-stone-800 via-neutral-900 to-slate-950',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    description: 'Vida e escritos dos gigantes da fé: Calvino, Lutero, Jonathan Edwards, Spurgeon, R.C. Sproul e John Piper.',
    isGc: false
  },
  {
    id: 'teologia',
    name: 'Teologia',
    shortName: 'Doutrinas da Graça',
    icon: 'menu_book',
    badge: 'Sã Doutrina',
    color: 'purple',
    accentColor: '#9333ea',
    bgGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    image: 'https://images.unsplash.com/photo-1507842229451-7f01be8860ee?auto=format&fit=crop&w=600&q=80',
    description: 'As verdades que fundamentam a nossa fé: soberania de Deus, justificação somente pela fé, os 5 Solas e Teologia Bíblica.',
    isGc: false
  },
  {
    id: 'devocionais',
    name: 'Devocionais',
    shortName: 'Coração e Oração',
    icon: 'favorite',
    badge: 'Alimento Diário',
    color: 'red',
    accentColor: '#dc2626',
    bgGradient: 'from-rose-800 via-red-900 to-slate-950',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    description: 'Meditações centradas no Evangelho para aquecer a alma pela manhã, consolo no sofrimento e descanso na graça de Deus.',
    isGc: false
  }
];

// Lista Oficial das 11 Lições da Série Mutualidade nos Lares (ICEMP)
const GC_STUDIES_LIST = [
  {
    id: 'gc-licao-1',
    lessonNumber: 1,
    title: 'Lição 1: O Princípio da Mutualidade',
    topic: 'Mutualidade Cristã',
    desc: 'O fundamento bíblico de pertencer, acolher e servir uns aos outros como membros vivos do Corpo de Cristo.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_1_Mutualidade.pdf',
    fileName: 'Licao_1_Mutualidade.pdf',
    driveUrl: 'https://drive.google.com/file/d/1Fl_avr-vD9Fvd25TRv8uiHPNhBn_dyxC/view?usp=sharing',
    size: '1.2 MB'
  },
  {
    id: 'gc-licao-2',
    lessonNumber: 2,
    title: 'Lição 2: Visibilidade, Afeto e Cuidado',
    topic: 'Afeto & Cuidado Mútuo',
    desc: 'Enxergando as necessidades do próximo, acolhendo com carinho fraterno e praticando o cuidado ativo e intencional.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_2_Visibilidade_Afeto_Cuidado.pdf',
    fileName: 'Licao_2_Visibilidade_Afeto_Cuidado.pdf',
    driveUrl: 'https://drive.google.com/file/d/17O-w-JbJzVOjSRmjr60xtZ5w8XRVv5H3/view?usp=sharing',
    size: '1.3 MB'
  },
  {
    id: 'gc-licao-3',
    lessonNumber: 3,
    title: 'Lição 3: Submissão e Tolerância Mútua',
    topic: 'Submissão & Tolerância',
    desc: 'A prática da humildade sincera, da paciência no convívio e da consideração do próximo como superior a si mesmo.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_3_Submissao_Tolerancia.pdf',
    fileName: 'Licao_3_Submissao_Tolerancia.pdf',
    driveUrl: 'https://drive.google.com/file/d/1jZ_rYqTf4kp4bsC890w0LQnz3x4UWU_h/view?usp=sharing',
    size: '1.9 MB'
  },
  {
    id: 'gc-licao-4',
    lessonNumber: 4,
    title: 'Lição 4: Coração Guardado',
    topic: 'Guarda do Coração',
    desc: 'Protegendo os sentimentos, as intenções e a saúde espiritual contra amarguras e ressentimentos no convívio fraterno.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_4_Coracao_Guardado.pdf',
    fileName: 'Licao_4_Coracao_Guardado.pdf',
    driveUrl: 'https://drive.google.com/file/d/1GvM_ykJAMhsVaziDzixF3BHriJFFSuAG/view?usp=sharing',
    size: '22.1 MB'
  },
  {
    id: 'gc-licao-5',
    lessonNumber: 5,
    title: 'Lição 5: Semeando Paz com as Palavras',
    topic: 'Comunicação Edificante',
    desc: 'O poder transformador da comunicação guiada pelo Espírito Santo para abençoar, curar e promover a reconciliação.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_5_Semeando Paz com as Palavras.pdf',
    fileName: 'Licao_5_Semeando Paz com as Palavras.pdf',
    driveUrl: 'https://drive.google.com/file/d/1VsEDRzdBGF1FMNkfeGxDN7iJSrQWCiAJ/view?usp=sharing',
    size: '2.0 MB'
  },
  {
    id: 'gc-licao-6',
    lessonNumber: 6,
    title: 'Lição 6: Superando a Hostilidade e as Provocações',
    topic: 'Vencendo Hostilidades',
    desc: 'Como responder a afrontas e atritos interpessoais com mansidão bíblica, quebrando o ciclo do mal com o bem.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Lição 6 - Superando a Hostilidade e as Provocações.pdf',
    fileName: 'Lição 6 - Superando a Hostilidade e as Provocações.pdf',
    driveUrl: 'https://drive.google.com/file/d/1UB-aMzLaJOyu0v813tXXm7cU1zPWoGdJ/view?usp=sharing',
    size: '1.0 MB'
  },
  {
    id: 'gc-licao-7',
    lessonNumber: 7,
    title: 'Lição 7: O Perigo da Falsidade e da Máscara',
    topic: 'Autenticidade Cristã',
    desc: 'Despojando-se da hipocrisia religiosa para viver em transparência, verdade e integridade de coração diante dos irmãos.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_7_Perigo_Falsidade_e_Mascara.pdf',
    fileName: 'Licao_7_Perigo_Falsidade_e_Mascara.pdf',
    driveUrl: 'https://drive.google.com/file/d/1EEzzTGqqV5KGVvBm16rL24Ci68OmN5XR/view?usp=sharing',
    size: '1.5 MB'
  },
  {
    id: 'gc-licao-8',
    lessonNumber: 8,
    title: 'Lição 8: O Remédio Definitivo - Perdoem-se Mutuamente',
    topic: 'Perdão Mútuo',
    desc: 'O perdão como remédio restaurador de Cristo para curar feridas, restabelecer a paz e selar a unidade fraterna.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Lição 8_ O Remédio Definitivo - Perdoem-se Mutuamente.pdf',
    fileName: 'Lição 8_ O Remédio Definitivo - Perdoem-se Mutuamente.pdf',
    driveUrl: 'https://drive.google.com/file/d/19A3qazRcYCnch5fggrU2sF_Ovs4GbwR7/view?usp=sharing',
    size: '616 KB'
  },
  {
    id: 'gc-licao-9',
    lessonNumber: 9,
    title: 'Lição 9: O Fundamento da Edificação e o Ensino da Verdade',
    topic: 'Edificação & Ensino Mútuo',
    desc: 'O crescimento espiritual através do processo contínuo de edificação mútua e do ensino da Palavra no dia a dia do pequeno grupo.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_9_Edificacao_e_Ensino_da_Verdade.pdf',
    fileName: 'Licao_9_Edificacao_e_Ensino_da_Verdade.pdf',
    driveUrl: 'https://drive.google.com/file/d/1udbd8R0lUhGSn6WVy0FYjSBkcgew2tUv/view?usp=sharing',
    size: '455 KB'
  },
  {
    id: 'gc-licao-10',
    lessonNumber: 10,
    title: 'Lição 10: As Duas Faces da Exortação',
    topic: 'Exortação & Encorajamento',
    desc: 'O equilíbrio bíblico entre o confronto amoroso do pecado e o encorajamento consolador para perseverança na fé.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_10_As_Duas_Faces_da_Exortacao.pdf',
    fileName: 'Licao_10_As_Duas_Faces_da_Exortacao.pdf',
    driveUrl: 'https://drive.google.com/file/d/1nwNnN0G5vzkPLGM7GXmsancCbytrtygM/view?usp=sharing',
    size: '1.1 MB'
  },
  {
    id: 'gc-licao-11',
    lessonNumber: 11,
    title: 'Lição 11: A Mútua Edificação através do Louvor',
    topic: 'Louvor & Edificação',
    desc: 'Como a adoração comunitária e os cânticos espirituais nos pequenos grupos transmitem doutrina, aquecem a fé e fortalecem os irmãos.',
    file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_11_A_Mutua_Edificacao_atraves_do_Louvor.pdf',
    fileName: 'Licao_11_A_Mutua_Edificacao_atraves_do_Louvor.pdf',
    driveUrl: 'https://drive.google.com/file/d/1cV3FiJXVp2L0LvYWAGJTaS80ytxK7nyR/view?usp=sharing',
    size: '1.2 MB'
  }
];

const STUDIES_ARTICLES = [
  // ==========================================
  // SÉRIE OFICIAL ICEMP: ESTUDOS DO GC (11 LIÇÕES DA MÚTUA EDIFICAÇÃO)
  // Acessíveis diretamente pelos PDFs no Google Drive
  // Pasta Oficial: https://drive.google.com/drive/folders/19pWPew6b8x5NF_Adqa7SpWTFfkEMsdxo
  // ==========================================
  {
    id: 'gc-art-01',
    topicId: 'gc',
    title: 'Lição 1: O Princípio da Mutualidade',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1Fl_avr-vD9Fvd25TRv8uiHPNhBn_dyxC/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 01 • GC',
    keyVerse: '"Assim nós, embora muitos, somos um só corpo em Cristo, e cada um, de sua parte, membros uns dos outros." — Romanos 12:5',
    summary: 'O fundamento bíblico de pertencer, acolher e servir uns aos outros como membros vivos do Corpo de Cristo nos lares.',
    contentHtml: `
      <p class="lead-text">O Evangelho não nos chama para uma caminhada solitária. No plano eterno de Deus, cada crente é enxertado como membro vivo de uma família espiritual chamada Igreja, onde aprendemos a conjugar os mandamentos recíprocos de "uns aos outros".</p>
      <h3>1. O Que É a Mutualidade Bíblica</h3>
      <p>A palavra "mutualidade" traduz o pronome grego <em>allelon</em> ("uns aos outros"), que aparece mais de cem vezes no Novo Testamento. Ela expressa a reciprocidade sagrada: amar uns aos outros, perdoar uns aos outros, suportar uns aos outros e edificar uns aos outros.</p>
      <blockquote>"No pequeno grupo, saímos do anonimato das multidões para viver a beleza prática do discipulado e do cuidado recíproco." — Pr. Ubiracy Lucas Barbosa</blockquote>
      <h3>2. Membros Uns dos Outros</h3>
      <p>Não somos meros conhecidos de banco de igreja; somos membros do mesmo organismo vivo. Quando um membro sofre, todos sofrem; quando um é honrado, todos se alegram.</p>
    `,
    reflectionQuestions: [
      'O que significa para você ser "membro uns dos outros" no dia a dia da igreja?',
      'Como seu pequeno grupo pode ser um ambiente mais acolhedor para novos irmãos?',
      'De que forma você pode exercer o cuidado mútuo por alguém da congregação nesta semana?'
    ]
  },
  {
    id: 'gc-art-02',
    topicId: 'gc',
    title: 'Lição 2: Visibilidade, Afeto e Cuidado',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/17O-w-JbJzVOjSRmjr60xtZ5w8XRVv5H3/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 02 • GC',
    keyVerse: '"Amai-vos cordialmente uns aos outros com amor fraternal, preferindo-vos em honra uns aos outros." — Romanos 12:10',
    summary: 'Enxergando as necessidades do próximo, acolhendo com carinho fraterno e praticando o cuidado ativo e intencional no Corpo de Cristo.',
    contentHtml: `
      <p class="lead-text">O amor cristão autêntico não é invisível nem abstrato. Ele se expressa em olhares atentos que enxergam a dor do outro, ouvidos pacientes que escutam desabafos e braços abertos para acolher com cordialidade fraterna.</p>
      <h3>1. Dar Visibilidade ao Próximo</h3>
      <p>Em uma sociedade apressada, é fácil passar despercebido. No GC, somos chamados a enxergar cada pessoa como alguém por quem Cristo morreu, dando valor e honra aos que o mundo muitas vezes despreza.</p>
      <h3>2. Afeto e Cuidado Intencional</h3>
      <p>O apóstolo Paulo nos exorta ao afeto cordial. Cuidar exige tempo, renúncia e presença real. O amor fraterno é demonstrado em ações concretas de socorro, visitação e oração nos lares.</p>
    `,
    reflectionQuestions: [
      'Você tem estado atento aos irmãos ao seu redor que possam estar passando por lutas em silêncio?',
      'Como manifestar afeto e honra fraterna sem hipocrisia ou bajulação?',
      'Qual irmão você pode visitar ou enviar uma mensagem de encorajamento hoje?'
    ]
  },
  {
    id: 'gc-art-03',
    topicId: 'gc',
    title: 'Lição 3: Submissão e Tolerância Mútua',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1jZ_rYqTf4kp4bsC890w0LQnz3x4UWU_h/view?usp=sharing',
    readTime: '7 min',
    date: 'Lição 03 • GC',
    keyVerse: '"Sujeitando-vos uns aos outros no temor de Cristo... suportando-vos uns aos outros em amor." — Efésios 5:21; 4:2',
    summary: 'A prática da humildade sincera, da paciência no convívio e da consideração do próximo como superior a si mesmo.',
    contentHtml: `
      <p class="lead-text">Onde há relacionamento humano, há inevitavelmente diferenças de personalidade, história e temperamento. O segredo da unidade cristã duradoura não é a ausência de diferenças, mas a abundância da humildade e da tolerância de Cristo.</p>
      <h3>1. Submissão no Temor de Cristo</h3>
      <p>A submissão bíblica mútua é a antítese do orgulho. Significa abrir mão do direito de sempre vencer discussões para buscar a edificação e a paz do irmão.</p>
      <h3>2. Suportar em Amor</h3>
      <p>Suportar não é tolerar com frieza ou desprezo; é sustentar com paciência, sabendo que Deus também nos suporta com misericórdia infinita todos os dias.</p>
    `,
    reflectionQuestions: [
      'Quais diferenças de temperamento mais desafiam sua paciência nos relacionamentos?',
      'Como a consciência de quanto fomos perdoados por Deus nos capacita a suportar os outros?',
      'De que maneira a humildade desarma conflitos no lar e no pequeno grupo?'
    ]
  },
  {
    id: 'gc-art-04',
    topicId: 'gc',
    title: 'Lição 4: Coração Guardado',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1GvM_ykJAMhsVaziDzixF3BHriJFFSuAG/view?usp=sharing',
    readTime: '7 min',
    date: 'Lição 04 • GC',
    keyVerse: '"Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as fontes da vida." — Provérbios 4:23',
    summary: 'Protegendo os sentimentos, as intenções e a saúde espiritual contra amarguras e ressentimentos no convívio fraterno.',
    contentHtml: `
      <p class="lead-text">O coração é a cidadela da nossa vida espiritual. Se ele for contaminado por amargura, desconfiança ou ressentimento, todas as nossas atitudes, palavras e orações serão envenenadas na fonte.</p>
      <h3>1. O Perigo da Raiz de Amargura</h3>
      <p>O autor aos Hebreus adverte que uma raiz de amargura pode brotar e contaminar a muitos. As ofensas surgem com facilidade; mas permitir que elas criem raiz no coração é uma escolha perigosa.</p>
      <blockquote>"Guardar o coração não é construir muros para não se relacionar, mas lavar diariamente a alma com a graça e o perdão da cruz de Cristo." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Você tem identificado alguma mágoa ou rancor tentando se alojar no seu coração?',
      'Quais práticas espirituais ajudam você a manter o coração limpo diante de Deus e dos homens?',
      'Como o Espírito Santo pode ajudá-lo a liberar o perdão hoje mesmo?'
    ]
  },
  {
    id: 'gc-art-05',
    topicId: 'gc',
    title: 'Lição 5: Semeando Paz com as Palavras',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1VsEDRzdBGF1FMNkfeGxDN7iJSrQWCiAJ/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 05 • GC',
    keyVerse: '"Não saia da vossa boca nenhuma palavra torpe, mas só a que for boa para promover a edificação... para que dê graça aos que a ouvem." — Efésios 4:29',
    summary: 'O poder transformador da comunicação guiada pelo Espírito Santo para abençoar, curar e promover a reconciliação.',
    contentHtml: `
      <p class="lead-text">As palavras têm o poder de edificar ou destruir, curar ou ferir, unir ou separar. No Corpo de Cristo, a nossa fala deve ser temperada com o sal da graça, sendo instrumento de vida e reconciliação.</p>
      <h3>1. Palavras que Transmitem Graça</h3>
      <p>Paulo nos instrui a não permitir que nenhuma palavra torpe saia da nossa boca. Fofocas, murmurações e ironias corrosivas não têm lugar na comunidade dos santos. Cada frase deve ter o propósito de edificar.</p>
      <h3>2. Pacificadores no Lar e no GC</h3>
      <p>Bem-aventurados os pacificadores, porque serão chamados filhos de Deus. Ser um semeador de paz é usar o diálogo para desarmar tempestades e semear a verdade em amor.</p>
    `,
    reflectionQuestions: [
      'Como tem sido o teor das suas conversas diárias: palavras de ânimo ou de reclamação?',
      'Você já presenciou o poder curador de uma palavra dita com mansidão em um momento tenso?',
      'Como podemos nos comprometer a banir a murmuração do nosso pequeno grupo?'
    ]
  },
  {
    id: 'gc-art-06',
    topicId: 'gc',
    title: 'Lição 6: Superando a Hostilidade e as Provocações',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1UB-aMzLaJOyu0v813tXXm7cU1zPWoGdJ/view?usp=sharing',
    readTime: '7 min',
    date: 'Lição 06 • GC',
    keyVerse: '"A resposta branda desvia o furor, mas a palavra dura suscita a ira." — Provérbios 15:1',
    summary: 'Como responder a afrontas e atritos interpessoais com mansidão bíblica, quebrando o ciclo do mal com o bem.',
    contentHtml: `
      <p class="lead-text">Quando somos confrontados por hostilidade ou palavras duras, o impulso natural da carne é responder com agressividade semelhante. No entanto, o Evangelho nos convida a agir com domínio próprio e graça sobrenatural.</p>
      <h3>1. Quebrando o Ciclo da Reação Carnal</h3>
      <p>Responder com agressividade à agressão é colocar lenha na fogueira. A resposta branda, pelo contrário, tem o poder de desarmar o furor e abrir espaço para a reflexão santa.</p>
      <h3>2. O Exemplo Perfeito de Cristo</h3>
      <p>Quando ultrajado, Jesus não revidava; quando maltratado, não fazia ameaças, mas entregava-Se Àquele que julga com justiça (1 Pe 2:23). Nele encontramos força para vencer a hostilidade.</p>
    `,
    reflectionQuestions: [
      'Como você costuma reagir quando se sente injustiçado ou provocado?',
      'De que maneira a resposta mansa e paciente reflete a autoridade de Cristo?',
      'Em que relacionamento você precisa exercitar a paciência redentora de Jesus hoje?'
    ]
  },
  {
    id: 'gc-art-07',
    topicId: 'gc',
    title: 'Lição 7: O Perigo da Falsidade e da Máscara',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1EEzzTGqqV5KGVvBm16rL24Ci68OmN5XR/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 07 • GC',
    keyVerse: '"Por isso deixai a mentira, e falai a verdade cada um com o seu próximo; porque somos membros uns dos outros." — Efésios 4:25',
    summary: 'Despojando-se da hipocrisia religiosa para viver em transparência, verdade e integridade de coração diante dos irmãos.',
    contentHtml: `
      <p class="lead-text">O medo da rejeição frequentemente nos tenta a usar máscaras religiosas de perfeição fingida. Mas onde reina a falsidade, o amor autêntico e a cura mútua não podem florescer.</p>
      <h3>1. A Queda das Máscaras na Cruz</h3>
      <p>Cristo nos conheceu no nosso pior estado de pecado e nos amou até a morte. Não precisamos fingir virtudes que não temos diante de Deus nem dos irmãos; a graça nos liberta para sermos autênticos.</p>
      <h3>2. Andar na Luz</h3>
      <p>Se andarmos na luz, como Ele na luz está, temos comunhão uns com os outros, e o sangue de Jesus nos purifica de todo pecado (1 Jo 1:7). Transparência é o berço do crescimento verdadeiro.</p>
    `,
    reflectionQuestions: [
      'Você se sente seguro para compartilhar suas fraquezas reais e pedir oração no GC?',
      'Quais receios impedem as pessoas de serem autênticas e transparentes na igreja?',
      'Como o grupo de crescimento pode ser um lugar de refúgio e cura, livre de julgamentos precipitados?'
    ]
  },
  {
    id: 'gc-art-08',
    topicId: 'gc',
    title: 'Lição 8: O Remédio Definitivo – Perdoem-se Mutuamente',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/19A3qazRcYCnch5fggrU2sF_Ovs4GbwR7/view?usp=sharing',
    readTime: '7 min',
    date: 'Lição 08 • GC',
    keyVerse: '"Suportai-vos uns aos outros, perdoai-vos mutuamente, caso alguém tenha motivo de queixa contra outrem. Assim como o Senhor vos perdoou, assim também perdoai vós." — Colossenses 3:13',
    summary: 'O perdão como remédio restaurador de Cristo para curar feridas, restabelecer a paz e selar a unidade fraterna.',
    contentHtml: `
      <p class="lead-text">O perdão cristão não é mero esquecimento superficial nem sentimento passivo: é uma decisão deliberada e corajosa de liberar o ofensor da dívida moral, fundada no perdão supremo que recebemos do Senhor na cruz.</p>
      <h3>1. A Medida do Perdão</h3>
      <p>Paulo define o padrão inegociável: <em>"assim como o Senhor vos perdoou, perdoai vós também"</em>. Não perdoamos porque o ofensor merece, mas porque nós mesmos fomos imerecidamente perdoados de uma dívida impagável.</p>
      <blockquote>"O perdão é a chave que abre a cela do ressentimento e descobre que o prisioneiro libertado era você mesmo." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Há alguém na sua história ou no seu convívio a quem você precisa conceder perdão bíblico sincero?',
      'Como a lembrança da cruz nos capacita a perdoar mesmo quando a dor é profunda?',
      'De que forma o perdão restaura o poder e a comunhão no pequeno grupo?'
    ]
  },
  {
    id: 'gc-art-09',
    topicId: 'gc',
    title: 'Lição 9: O Fundamento da Edificação e o Ensino da Verdade',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1udbd8R0lUhGSn6WVy0FYjSBkcgew2tUv/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 09 • GC',
    keyVerse: '"Edificai-vos uns aos outros, assim como já estais fazendo." — 1 Tessalonicenses 5:11',
    summary: 'O crescimento espiritual através do processo contínuo de edificação mútua e do ensino da Palavra no dia a dia do pequeno grupo.',
    contentHtml: `
      <p class="lead-text">O pequeno grupo não é apenas um espaço de convivência social agradável; é uma oficina espiritual onde a Palavra de Deus é estudada, assimilada e aplicada na prática do dia a dia para o amadurecimento dos discípulos.</p>
      <h3>1. O Conceito Bíblico de Edificação</h3>
      <p>Edificar é construir tijolo por tijolo. Cada estudo bíblico compartilhado, cada testemunho e cada oração é um bloco que fortalece as paredes da fé contra os ventos das provações.</p>
      <h3>2. O Ensino Mútuo da Verdade</h3>
      <p>Todos nós somos aprendizes de Cristo. Quando compartilhamos as Escrituras em humildade, Deus usa até o membro mais tímido para ministrar verdades preciosas ao coração dos irmãos.</p>
    `,
    reflectionQuestions: [
      'Como os estudos bíblicos do GC têm impactado suas decisões práticas no lar e no trabalho?',
      'De que maneira você pode contribuir ativamente com reflexões bíblicas nos encontros?',
      'O que podemos fazer para que a Palavra de Deus continue sendo a bússola central do nosso grupo?'
    ]
  },
  {
    id: 'gc-art-10',
    topicId: 'gc',
    title: 'Lição 10: As Duas Faces da Exortação',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1nwNnN0G5vzkPLGM7GXmsancCbytrtygM/view?usp=sharing',
    readTime: '7 min',
    date: 'Lição 10 • GC',
    keyVerse: '"Exortai-vos mutuamente cada dia, durante o tempo que se chama Hoje, a fim de que nenhum de vós seja endurecido pelo engano do pecado." — Hebreus 3:13',
    summary: 'O equilíbrio bíblico entre o confronto amoroso do pecado e o encorajamento consolador para perseverança na fé cristã.',
    contentHtml: `
      <p class="lead-text">No Novo Testamento, a palavra grega <em>parakaleo</em> (exortar) tem duas facetas inseparáveis: de um lado, advertir contra o engano do pecado com fidelidade; de outro, encorajar, consolar e animar com ternura pastoral.</p>
      <h3>1. O Confronto Amoroso que Salva</h3>
      <p>Ver um irmão se desviando do caminho da verdade e se calar por comodismo não é amor; é negligência. Exortar biblicamente é estender a mão para resgatar a ovelha antes que o pecado endureça seu coração.</p>
      <h3>2. O Encorajamento Consolador</h3>
      <p>A exortação bíblica nunca destrói: ela ergue o abatido, renova a esperança e aponta para a suficiência da graça de Cristo para recomeçar.</p>
      <blockquote>"A verdadeira exortação tem lágrimas nos olhos e graça nos lábios; seu alvo nunca é condenar, mas restaurar o caído para a comunhão do Pai." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Você já teve a experiência de ser advertido em amor por um irmão e isso poupar você de maiores sofrimentos?',
      'Como encontrar o equilíbrio entre firmeza doutrinária e gentileza pastoral ao falar de áreas sensíveis?',
      'Quem no seu círculo precisa de uma palavra de consolo e encorajamento hoje?'
    ]
  },
  {
    id: 'gc-art-11',
    topicId: 'gc',
    title: 'Lição 11: A Mútua Edificação através do Louvor',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Série Mutualidade',
    sourceUrl: 'https://drive.google.com/file/d/1cV3FiJXVp2L0LvYWAGJTaS80ytxK7nyR/view?usp=sharing',
    readTime: '6 min',
    date: 'Lição 11 • GC',
    keyVerse: '"Habite ricamente em vós a palavra de Cristo; instruí-vos e aconselhai-vos mutuamente em toda a sabedoria, louvando a Deus com salmos, hinos e cânticos espirituais..." — Colossenses 3:16',
    summary: 'Como a adoração comunitária e os cânticos espirituais nos pequenos grupos transmitem doutrina, aquecem a fé e fortalecem os irmãos.',
    contentHtml: `
      <p class="lead-text">O louvor a Deus no ambiente do Grupo de Crescimento é muito mais do que um momento preliminar de cânticos: é um poderoso instrumento de pregação mútua, onde declaramos as grandezas do Senhor e fortalecemos a alma uns dos outros.</p>
      <h3>1. Salmos, Hinos e Cânticos que Ensinam</h3>
      <p>Quando cantamos com entendimento bíblico, a verdade teológica é fixada no coração. As canções da igreja funcionam como catequese viva, enraizando a alma nas promessas eternas.</p>
      <h3>2. A Força da Voz Congregacional nos Lares</h3>
      <p>Ouvir a voz dos irmãos ao lado entoando que "O Senhor é o meu pastor e nada me faltará" renova a coragem nos dias de fraqueza. O louvor comunitário dissipa a tristeza e sela a unidade da fé.</p>
    `,
    reflectionQuestions: [
      'De que maneira as letras dos cânticos e hinos têm edificado e consolado você nos momentos de aflição?',
      'Como a adoração em pequenos grupos nos lares favorece a comunhão íntima e a participação de todos?',
      'Qual cântico ou hino tem sido a canção da sua alma nos últimos dias?'
    ]
  },
  // ==========================================
  // TEMA 1: ESTUDOS PASTORAIS (ICEMP)
  // Publicados originalmente em https://icemetropolitana.com.br/artigosbiblicos
  // Autoria: Pr. Ubiracy Lucas Barbosa • ICE Metropolitana de Palmas
  // ==========================================
  {
    id: 'art-pastoral-01',
    topicId: 'estudos-pastorais',
    title: 'A prioridade que muda tudo',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1LoMdE5LbpUNc4cy6fpWx0xwOkP4PXczh/view?usp=sharing',
    readTime: '6 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas." — Mateus 6:33',
    summary: 'Quando o Reino de Deus e a Sua justiça assumem a primazia da nossa vida diária, as ansiedades terrenas perdem sua força sufocante.',
    contentHtml: `
      <p class="lead-text">Vivemos em uma época caracterizada pelo acúmulo frenético de compromissos e pela constante sensação de urgência. Em meio a tantas demandas que disputam a nossa atenção, Jesus nos apresenta uma verdade libertadora no Sermão do Monte: há uma prioridade que reorganiza todas as outras.</p>

      <h3>1. O Engano das Falsas Prioridades</h3>
      <p>Muitas vezes investimos nossas maiores energias correndo atrás do que comer, beber ou vestir — preocupações naturais da existência humana, mas que, quando desordenadas, geram ansiedade e nos afastam do descanso na providência de Deus. Os gentios é que se desesperam por essas coisas; nosso Pai celestial sabe exatamente do que precisamos.</p>

      <blockquote>"Colocar Deus em primeiro lugar não significa apenas dar a Ele a primeira hora do dia, mas submeter todos os nossos planos, afetos e decisões ao Seu senhorio eterno." — Pr. Ubiracy Lucas Barbosa</blockquote>

      <h3>2. O que Significa Buscar em Primeiro Lugar o Reino</h3>
      <p>Buscar primeiro o Reino significa desejar que a soberania, os valores e a justiça de Deus governem nossos pensamentos, nossas relações e nosso trabalho. Quando o coração do cristão está alinhado com o trono de Deus, todas as demais bênçãos necessárias nos são acrescentadas segundo a perfeita medida da Sua graça.</p>

      <div class="p-3 my-4 rounded-xl bg-sky-50 border border-sky-200">
        <p class="text-xs text-sky-900 font-bold mb-1">Acesse o Artigo Original da ICEMP:</p>
        <p class="text-[11px] text-sky-800">Você pode ler o texto pastoral integral e acompanhar os demais artigos no portal oficial: <a href="https://icemetropolitana.com.br/artigosbiblicos" target="_blank" class="underline font-bold">icemetropolitana.com.br/artigosbiblicos</a>.</p>
      </div>
    `,
    reflectionQuestions: [
      'O que tem ocupado o primeiro lugar nas suas prioridades e preocupações nos últimos dias?',
      'Como a promessa de Jesus em Mateus 6:33 traz alívio para a ansiedade em relação ao sustento familiar?',
      'Que atitude prática você pode tomar hoje para demonstrar a centralidade do Reino em sua rotina?'
    ]
  },
  {
    id: 'art-pastoral-02',
    topicId: 'estudos-pastorais',
    title: 'Sobre o jejum',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/10vMxpeYUMeEHZ5_Vgenk0efEHsQ4kdHF/view?usp=sharing',
    readTime: '5 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Quando jejuardes, não vos mostreis contristados como os hipócritas... Tu, porém, quando jejuares, unge a cabeça e lava o rosto." — Mateus 6:16-17',
    summary: 'A disciplina bíblica do jejum cristão como instrumento de quebrantamento, consagração e fome espiritual de Deus.',
    contentHtml: `
      <p class="lead-text">O jejum é uma das disciplinas espirituais mais mencionadas nas Sagradas Escrituras e, ao mesmo tempo, uma das mais negligenciadas ou mal compreendidas na igreja contemporânea. Jesus não disse "se jejuardes", mas "quando jejuardes".</p>

      <h3>1. A Motivação Correta do Jejum</h3>
      <p>O jejum bíblico nunca é uma tentativa de barganhar com Deus ou de manipular Sua vontade em nosso favor. Não jejuamos para forçar a mão do Todo-Poderoso, mas para quebrantar a nossa própria carne, reordenar nossos desejos e expressar que nossa fome mais profunda é por Deus e por Sua comunhão.</p>

      <blockquote>"O jejum desmascara aquilo que controla o nosso coração. Quando nos abstemos voluntariamente do alimento físico, revelamos se dependemos mais de Deus ou dos confortos terrenos." — Pr. Ubiracy Lucas Barbosa</blockquote>

      <h3>2. Em Secreto Diante do Pai</h3>
      <p>Jesus nos adverte com firmeza contra a ostentação religiosa. O jejum autêntico é vivido na intimidade: unge a cabeça, lava o rosto e apresenta o quebrantamento ao Pai que vê em secreto. Ele é quem sacia a alma sedenta e recompensa a sinceridade do adorador.</p>
    `,
    reflectionQuestions: [
      'Você tem integrado o jejum bíblico em sua vida de oração e consagração ao Senhor?',
      'Qual a diferença entre um jejum religioso formal e o jejum bíblico de quebrantamento e humildade?',
      'De que maneiras o jejum pode ajudá-lo a vencer tentações e manter a sensibilidade espiritual?'
    ]
  },
  {
    id: 'art-pastoral-03',
    topicId: 'estudos-pastorais',
    title: 'E de tudo lhe deu Abrão o dízimo',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1Vo0bilmrKA0457wjc3nVwoec0-gg7lBg/view?usp=sharing',
    readTime: '7 min',
    date: 'Publicação Pastoral',
    keyVerse: '"E bendito seja o Deus Altíssimo, que entregou os teus adversários nas tuas mãos. E de tudo lhe deu Abrão o dízimo." — Gênesis 14:20',
    summary: 'A doutrina bíblica da generosidade, mordomia cristã e a prática dos dízimos como expressão de gratidão à soberania de Deus.',
    contentHtml: `
      <p class="lead-text">O episódio em que Abraão entrega o dízimo a Melquisedeque, rei de Salém e sacerdote do Deus Altíssimo, é anterior à dispensação da lei mosaica e estabelece um princípio eterno de reconhecimento e adoração através da mordomia dos nossos bens.</p>

      <h3>1. Reconhecendo Quem nos Deu a Vitória</h3>
      <p>Ao retornar vitorioso do resgate de seu sobrinho Ló, Abraão não atribuiu o êxito à sua força militar ou sagacidade estratégica. Quando Melquisedeque o abençoou declarando que o Deus Altíssimo havia entregue os adversários em suas mãos, a resposta natural e espontânea do patriarca foi render adoração prática: <em>"e de tudo lhe deu o dízimo"</em>.</p>

      <blockquote>"Contribuir para a obra do Senhor não é um fardo legalista; é a confissão alegre de que tudo o que possuímos pertence a Ele e foi colocado em nossas mãos pela Sua benevolência." — Pr. Ubiracy Lucas Barbosa</blockquote>

      <h3>2. Mordomia Cristã no Novo Testamento</h3>
      <p>Na Nova Aliança, somos chamados a uma generosidade ainda mais profunda: contribuir com alegria, sem constrangimento ou tristeza, porque Deus ama ao que dá com alegria (2 Co 9:7). A fidelidade nos dízimos e ofertas é o sustento das missões, do ministério pastoral e do cuidado aos necessitados na igreja local.</p>
    `,
    reflectionQuestions: [
      'Como sua maneira de lidar com as finanças reflete sua confiança no sustento de Deus?',
      'Você experimenta alegria em contribuir para o avanço do ministério na sua igreja local?',
      'Em quais áreas de sua vida material o Senhor está chamando você a exercitar maior desprendimento?'
    ]
  },
  {
    id: 'art-pastoral-04',
    topicId: 'estudos-pastorais',
    title: 'O Pai Nosso: a oração que reorganiza prioridades (parte 2)',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1pZuTNfnFmSMI4DwDofSZx87-5g9LKTma/view?usp=sharing',
    readTime: '6 min',
    date: 'Série Oração do Senhor',
    keyVerse: '"O pão nosso de cada dia dá-nos hoje; perdoa-nos as nossas dívidas, assim como nós temos perdoado aos nossos devedores." — Mateus 6:11-12',
    summary: 'A segunda metade do Pai Nosso: a súplica pelo sustento diário, a necessidade imperativa do perdão mútuo e a proteção divina.',
    contentHtml: `
      <p class="lead-text">Após nos ensinar a colocar a glória, o Reino e a vontade de Deus no ápice da nossa oração, o Senhor Jesus desce com ternura às nossas necessidades cotidianas, ensinando-nos a orar pelo sustento, pelo relacionamento fraterno e pelo combate espiritual.</p>

      <h3>1. O Pão Nosso de Cada Dia</h3>
      <p>A petição pelo pão diário ensina humildade e combate o espírito acumulador e ganancioso. Deus nos convida a confiar nEle dia após dia, recebendo com gratidão a provisão presente sem sermos consumidos pela ansiedade do amanhã.</p>

      <h3>2. O Perdão como Via de Mão Dupla</h3>
      <p>A oração une o perdão que recebemos de Deus à disposição indispensável de perdoar os que nos ofendem. A graça recebida na cruz é a fonte inesgotável que nos capacita a liberar o perdão recíproco na convivência da comunidade cristã.</p>

      <blockquote>"Um coração que recusa perdoar ao próximo esqueceu o tamanho incomparável da dívida que Jesus cancelou por ele no Calvário." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Há alguma ofensa não perdoada que tem pesado em suas orações diante de Deus?',
      'Você consegue agradecer a Deus pelo pão de hoje sem se desesperar com as contas do mês seguinte?',
      'Como a petição "livra-nos do mal" orienta suas decisões diárias contra o pecado?'
    ]
  },
  {
    id: 'art-pastoral-05',
    topicId: 'estudos-pastorais',
    title: 'A oração que reorganiza prioridades',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1ItkB53EKQa93M6IFSGf7L11869xR2bJy/view?usp=sharing',
    readTime: '6 min',
    date: 'Série Oração do Senhor',
    keyVerse: '"Pai nosso, que estás nos céus, santificado seja o teu nome; venha o teu reino; faça-se a tua vontade, assim na terra como no céu." — Mateus 6:9-10',
    summary: 'A oração modelo deixada por Jesus: o primeiro passo é glorificar a Deus e submeter nossos anseios ao Seu governo soberano.',
    contentHtml: `
      <p class="lead-text">Quando os discípulos pediram a Jesus: <em>"Senhor, ensina-nos a orar"</em>, eles não receberam apenas um texto para recitação mecânica, mas uma estrutura que redefine a cosmovisão do crente. Orar de verdade começa por alinhar a nossa mente com a santidade de Deus.</p>

      <h3>1. Santificado Seja o Teu Nome</h3>
      <p>A oração começa pela adoração. O anseio supremo de todo filho de Deus redimido deve ser que o Santo Nome do Senhor seja conhecido, honrado e reverenciado em todo o universo, a começar pelo testemunho da nossa própria conduta.</p>

      <h3>2. Seja Feita a Tua Vontade</h3>
      <p>Orar não é tentar convencer Deus a adotar o nosso plano, mas render nossa vontade frágil e limitada à perfeita, boa e agradável vontade dAquele que reina soberanamente nos céus e na terra.</p>

      <blockquote>"Antes de pedir qualquer coisa para nós mesmos, a oração bíblica nos prostra diante do trono para dizer: Tua é a glória, Teu é o Reino e Tua é a vontade soberana." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Sua vida de oração tem começado pela adoração e glorificação de Deus ou diretamente por petições?',
      'Como render-se à vontade de Deus traz verdadeiro descanso nas horas de incerteza?',
      'O que significa na prática desejar que o Reino de Deus venha em sua cidade e em seu lar?'
    ]
  },
  {
    id: 'art-pastoral-06',
    topicId: 'estudos-pastorais',
    title: 'Como se deve orar',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1TGvqpfBDk7p_Z0cECdOKrjd5I8g1cea-/view?usp=sharing',
    readTime: '5 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Tu, porém, quando orares, entra no teu quarto e, fechada a porta, orarás a teu Pai, que está em secreto; e teu Pai, que vê em secreto, te recompensará." — Mateus 6:6',
    summary: 'Os pilares essenciais da vida de oração bíblica: despojamento de vanglória, intimidade no secreto e fé filial.',
    contentHtml: `
      <p class="lead-text">A hipocrisia é o veneno que corrói a religião exterior. No Sermão do Monte, Jesus nos alerta contra o perigo sutil de orar para ser visto e elogiado pelos homens, convidando-nos ao recinto sagrado da comunhão sincera com o Pai.</p>

      <h3>1. O Quarto Fechado da Comunhão</h3>
      <p>Entrar no quarto e fechar a porta é mais do que um local físico: é uma atitude da alma. Significa silenciar os aplausos humanos, desligar as distrações e derramar o coração diante d’Aquele que conhece os pensamentos mais íntimos do ser humano.</p>

      <h3>2. Não Usem de Vãs Repetições</h3>
      <p>Deus não nos ouve por causa do nosso palavreado volumoso ou fórmulas mágicas. Ele é nosso Pai amoroso, que nos acolhe em Cristo Jesus e já conhece cada uma das nossas carências antes mesmo de as pronunciarmos.</p>
    `,
    reflectionQuestions: [
      'Como está a qualidade do seu tempo diário no quarto de oração com Deus?',
      'Quais distrações têm dificultado sua concentração e perseverança em orar?',
      'Como a certeza de que Deus é nosso Pai celestial transforma a sua confiança ao orar?'
    ]
  },
  {
    id: 'art-pastoral-07',
    topicId: 'estudos-pastorais',
    title: 'Razões da Existência da Igreja',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/19JqBbXJVq0pKnNv_rfVSFHO6bvwKWEGW/view',
    readTime: '8 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Para que a multiforme sabedoria de Deus se torne conhecida, por meio da igreja, aos principados e potestades nas regiões celestiais." — Efésios 3:10',
    summary: 'A eclesiologia bíblica na prática: por que Cristo instituiu a Sua igreja e qual o propósito glorioso da comunidade dos santos.',
    contentHtml: `
      <p class="lead-text">Em um tempo marcado pelo individualismo religioso e pelo afastamento das congregações, é urgente revisitarmos as razões fundamentais pelas quais Cristo fundou a Sua igreja e prometeu que as portas do inferno jamais prevaleceriam contra ela.</p>

      <h3>1. Glorificar a Deus Através do Culto Congregacional</h3>
      <p>A razão suprema da existência da igreja é adorar ao Deus Trino em espírito e em verdade. Quando os santos se reúnem para entoar louvores, ouvir a proclamação da Palavra e celebrar os santos sacramentos, a glória de Deus se manifesta com poder singular.</p>

      <h3>2. Edificação Mútua e Comunhão nos Lares</h3>
      <p>Ninguém foi chamado para viver a fé isolado. A igreja é um corpo vivo em que cada membro supre o outro com dons espirituais, consolo, exortação mútua e oração constante nos cultos e nos Grupos de Crescimento.</p>

      <h3>3. A Proclamação da Verdade ao Mundo Perdido</h3>
      <p>A igreja é coluna e baluarte da verdade, enviada como embaixada de Cristo para proclamar o arrependimento e a fé em todos os povos, cumprindo com fidelidade a Grande Comissão.</p>
    `,
    reflectionQuestions: [
      'Você tem compreendido o valor insubstituível da comunhão congregacional para sua caminhada cristã?',
      'De que forma você tem exercido seus dons espirituais para o crescimento e edificação dos irmãos?',
      'Como nossa igreja local pode ser mais relevante no testemunho do Evangelho em nossa cidade?'
    ]
  },
  {
    id: 'art-pastoral-08',
    topicId: 'estudos-pastorais',
    title: 'A Vingança Pertence a Deus',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1EeZa-MZzwzQvXMdvfA1rtb3cGBr6uqyW/view?usp=sharing',
    readTime: '5 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Não vos vingueis a vós mesmos, amados, mas dai lugar à ira; porque está escrito: Minha é a vingança; eu recompensarei, diz o Senhor." — Romanos 12:19',
    summary: 'Como o cristão deve responder às ofensas e injustiças: renunciando ao revide e descansando na perfeita retribuição de Deus.',
    contentHtml: `
      <p class="lead-text">O desejo de fazer justiça com as próprias mãos é uma das reações mais primitivas da natureza humana caída. No entanto, o apóstolo Paulo orienta a igreja a trilhar o caminho elevado de Cristo: não pagar o mal com o mal, mas vencer o mal com o bem.</p>

      <h3>1. O Veneno da Retaliação</h3>
      <p>Quem busca se vingar assume um papel que não lhe pertence. Ao tentar punir o ofensor, enchemos a própria alma de ressentimento e amargura, permitindo que a ferida se torne um cativeiro espiritual.</p>

      <h3>2. O Descanso na Soberana Justiça Divina</h3>
      <p>Dar lugar à ira de Deus significa confiar que o Juiz de toda a terra fará o que é reto. Ele enxerga todas as afrontas e recompensará com justiça irrevogável. Ao crente cabe amar, perdoar e orar pelos que o perseguem.</p>
    `,
    reflectionQuestions: [
      'Há alguma situação passada em que você ainda sente tentação de buscar desforra ou alimentar mágoa?',
      'Como a entrega da vingança a Deus liberta o coração para amar com liberdade cristã?',
      'O que significa na prática "vencer o mal com o bem" no ambiente de trabalho ou na família?'
    ]
  },
  {
    id: 'art-pastoral-09',
    topicId: 'estudos-pastorais',
    title: 'O Cristão e os Juramentos',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1ZUZ2O57LC2bIOR13m7scDhbj3dltkwYY/view?usp=sharing',
    readTime: '6 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Seja, porém, o vosso falar: Sim, sim; Não, não; porque o que passa disto é de procedência maligna." — Mateus 5:37',
    summary: 'A ética da veracidade radical: a palavra do homem e da mulher de Deus deve ser íntegra e dispensar subterfúgios religiosos.',
    contentHtml: `
      <p class="lead-text">Nos dias de Jesus, os líderes religiosos haviam criado um intrincado sistema de juramentos para justificar quebras de promessas. O Senhor corta pela raiz essa hipocrisia, exigindo que Seus discípulos vivam com honestidade transparente.</p>

      <h3>1. A Queda da Confiança Humana</h3>
      <p>Os homens só precisam jurar porque a mentira se tornou generalizada na cultura humana. Quando a palavra de alguém precisa ser acompanhada de garantias mirabolantes para ser crida, isso revela a crise moral da sociedade.</p>

      <h3>2. O Falar do Crente: Sim, Sim; Não, Não</h3>
      <p>A integridade cristã requer que nosso compromisso seja absoluto. Se dissermos "sim", que seja sim; se dissermos "não", que seja não. A verdade deve permear nossos contratos, nossas palavras no lar e nossas conversas fraternas.</p>
    `,
    reflectionQuestions: [
      'Sua palavra tem sido firme e confiável nas promessas que faz no dia a dia?',
      'Você já se pegou usando meias-verdades ou desculpas para amenizar falhas?',
      'Como o testemunho de retidão nas conversas pode atrair outras pessoas a Cristo?'
    ]
  },
  {
    id: 'art-pastoral-010',
    topicId: 'estudos-pastorais',
    title: 'Bem-aventurados os que têm fome e sede de justiça',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1zEaUCRuwdD9REsLft1eK4uV6g2rd9NJ3/view?usp=sharing',
    readTime: '6 min',
    date: 'Série Bem-Aventuranças',
    keyVerse: '"Bem-aventurados os que têm fome e sede de justiça, porque serão fartos." — Mateus 5:6',
    summary: 'O anseio visceral da alma renascida pela justiça de Cristo e pela manifestação da santidade nas ações práticas do dia a dia.',
    contentHtml: `
      <p class="lead-text">Fome e sede são os apetites vitais mais intensos do corpo físico: ninguém pode sobreviver muito tempo sem se alimentar ou matar a sede. Jesus usa essa metáfora potente para retratar a fome incessante do coração regenerado pela justiça de Deus.</p>

      <h3>1. A Justiça Imputada por Cristo</h3>
      <p>Antes de tudo, o crente anseia pela justiça que não procede de si mesmo, mas que é recebida pela fé na obra consumada de Cristo na cruz. Nossa justiça própria é trapo de imundícia; a justiça de Jesus nos veste com perfeição irrepreensível.</p>

      <h3>2. O Desejo Ardente pela Santidade</h3>
      <p>Ter fome e sede de justiça significa também lamentar a iniquidade do mundo e desejar viver em conformidade prática com os mandamentos divinos. E a promessa gloriosa do Mestre é infalível: <em>"eles serão fartos"</em>.</p>
    `,
    reflectionQuestions: [
      'Qual tem sido o verdadeiro anseio da sua alma: os prazeres transitórios ou a comunhão santa com Deus?',
      'Como cultivar um apetite mais vigoroso pela leitura bíblica e pela obediência prática?',
      'De que forma a igreja pode ser instrumento de justiça e misericórdia em sua comunidade?'
    ]
  },
  {
    id: 'art-pastoral-011',
    topicId: 'estudos-pastorais',
    title: 'As três primeiras bem-aventuranças',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/184VyqTqOuDBUoxF8063yYt2GPL83vbky/view?usp=sharing',
    readTime: '7 min',
    date: 'Série Bem-Aventuranças',
    keyVerse: '"Bem-aventurados os humildes de espírito, porque deles é o reino dos céus. Bem-aventurados os que choram... os mansos..." — Mateus 5:3-5',
    summary: 'A porta de entrada do Reino: quebrantamento interior, choro santo pelo pecado e a mansidão dos verdadeiros herdeiros da graça.',
    contentHtml: `
      <p class="lead-text">As Bem-Aventuranças não são conselhos morais de autoajuda, mas o perfil soberano dos cidadãos do Reino de Deus gerados pelo Espírito Santo. Jesus começa com três atitudes que contrariam radicalmente a sabedoria deste mundo.</p>

      <h3>1. Humildes de Espírito: O Fim da Autossuficiência</h3>
      <p>Ser humilde de espírito é reconhecer a nossa falência espiritual absoluta longe da graça. Ninguém entra no Reino de Deus batendo no peito cheio de méritos; entramos de joelhos, vazios de nós mesmos para sermos preenchidos por Cristo.</p>

      <h3>2. Os que Choram: O Pesar Santo Pelo Pecado</h3>
      <p>O choro abençoado não é autopiedade nem desespero mundano, mas a tristeza segundo Deus diante do pecado e da sua destruição, com a certeza doce do consolo celestial.</p>

      <h3>3. Os Mansos: Força Sob Controle Divino</h3>
      <p>A mansidão cristã é a postura dos que renunciam à agressividade e descansam na soberania do Senhor, sabendo que herdaremos a nova terra com o Rei da Glória.</p>
    `,
    reflectionQuestions: [
      'Você já experimentou o alívio de abandonar toda autossuficiência diante de Deus?',
      'Como a mansidão bíblica pode transformar a maneira como você lida com divergências familiares?',
      'O que significa para você receber o consolo do Espírito Santo nos momentos de aflição?'
    ]
  },
  {
    id: 'art-pastoral-012',
    topicId: 'estudos-pastorais',
    title: 'Alma próspera como elemento constitutivo para o desenvolvimento em tudo na vida',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1iJELLwxDgFL1dHm5TpL8l1kfiFKpWL1N/view?usp=sharing',
    readTime: '8 min',
    date: 'Publicação Pastoral',
    keyVerse: '"Amado, acima de tudo, faço votos por tua prosperidade e saúde, assim como é próspera a tua alma." — 3 João 1:2',
    summary: 'A verdadeira ordem bíblica do crescimento: quando a alma floresce na comunhão com o Senhor, todo o restante da vida ganha alicerce seguro.',
    contentHtml: `
      <p class="lead-text">O apóstolo João expressa ao seu querido cooperador Gaio um voto extraordinário de saúde e prosperidade, mas condiciona esse desejo ao estado interior: <em>"assim como é próspera a tua alma"</em>. Essa é a chave de ouro para o desenvolvimento integral do ser humano.</p>

      <h3>1. A Raiz Interior de Todos os Frutos</h3>
      <p>Muitas pessoas buscam enriquecer financeiramente, alcançar posições de prestígio ou desfrutar de conforto exterior, enquanto sua alma definha em amargura, medo e vazio espiritual. A verdadeira prosperidade bíblica é o crescimento da alma alimentada pela verdade das Escrituras.</p>

      <blockquote>"De que adianta ao homem ganhar o mundo inteiro e perder a sua alma? Mas quando a alma prospera na graça de Cristo, até os desertos mais áridos se tornam mananciais de vida e esperança." — Pr. Ubiracy Lucas Barbosa</blockquote>

      <h3>2. O Desenvolvimento Saudável em Todas as Áreas</h3>
      <p>Uma alma próspera tem paz com Deus, integridade no lar, generosidade nas finanças e equilíbrio emocional. Esse florescimento interior é o elemento constitutivo indispensável para construirmos uma vida frutífera que glorifique a Deus em tudo.</p>
    `,
    reflectionQuestions: [
      'Como está a saúde da sua alma hoje: descansada em Deus ou agitada pelas pressões externas?',
      'O que você tem feito para nutrir sua espiritualidade no dia a dia da congregação?',
      'De que maneira o desenvolvimento interior pode transformar o ambiente da sua família e do seu trabalho?'
    ]
  },
  {
    id: 'art-pastoral-013',
    topicId: 'estudos-pastorais',
    title: 'Sexo antes do casamento',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1dUE3ts2JMt4ehF8vPVeBCVPlGDBuwDm4/view?usp=sharing',
    readTime: '7 min',
    date: 'Ética e Pureza Cristã',
    keyVerse: '"Digno de honra entre todos seja o matrimônio, bem como o leito sem mácula; porque Deus julgará os impuros e adúlteros." — Hebreus 13:4',
    summary: 'Orientação pastoral franca e bíblica sobre a pureza sexual, o propósito sagrado do matrimônio e a preservação do coração cristão.',
    contentHtml: `
      <p class="lead-text">Em um mundo hipererotizado que banaliza a sexualidade e a reduz a mero consumo hedonista, os cristãos são chamados a refletir a santidade do Criador. Deus não é contra o prazer sexual; Ele é o seu Santo Autor e definiu a sua moldura protetora: o pacto matrimonial permanente.</p>

      <h3>1. O Propósito Sagrado do Sexo</h3>
      <p>A intimidade sexual na Bíblia não é apenas ato biológico; é um selo de aliança em que duas pessoas se tornam uma só carne diante de Deus e da comunidade. Tirar o sexo do contexto do casamento é separar o privilégio da responsabilidade da aliança mútua.</p>

      <h3>2. A Proteção do Coração e o Valor da Espera</h3>
      <p>A pureza antes do casamento não é carência ou repressão, mas honra e respeito ao futuro cônjuge e obediência alegre a Cristo. Guardar o coração e o corpo preserva a alma de culpas, desilusões profundas e abre espaço para um casamento verdadeiramente abençoado.</p>

      <blockquote>"A santidade sexual é uma confissão prática de que confiamos na sabedoria do Criador mais do que nos impulsos passageiros da carne." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Como você tem blindado seus olhos e pensamentos diante das tentações da cultura atual?',
      'De que forma o ensino bíblico sobre o leito sem mácula valoriza o compromisso conjugal?',
      'Como a igreja e a juventude podem apoiar uns aos outros no caminho da pureza e do testemunho cristão?'
    ]
  },
  {
    id: 'art-pastoral-014',
    topicId: 'estudos-pastorais',
    title: 'Ser cristão significa viver segundo a vontade de Deus',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1kxIxmWXx7tFmw6cyfUFR_O5Is4ymQGyE/view?usp=sharing',
    readTime: '6 min',
    date: 'Discipulado Bíblico',
    keyVerse: '"Nem todo o que me diz: Senhor, Senhor! entrará no reino dos céus, mas aquele que faz a vontade de meu Pai, que está nos céus." — Mateus 7:21',
    summary: 'O verdadeiro discipulado de Jesus: a profissão de fé sem a obediência prática à santa vontade do Pai é uma ilusão fatal.',
    contentHtml: `
      <p class="lead-text">O cristianismo bíblico nunca foi uma mera adesão intelectual a doutrinas corretas ou um pertencimento sociológico a uma comunidade religiosa. Ser cristão significa pertencer a Cristo e ter a vida guiada alegremente pela santa vontade do Pai.</p>

      <h3>1. O Perigo da Fé Nominal</h3>
      <p>As palavras de Jesus em Mateus 7 são solenes e devem sacudir toda mornidão espiritual: dizer <em>"Senhor, Senhor"</em> não garante entrada na glória. O teste definitivo da autenticidade da fé é a conformação do nosso viver à vontade revelada nas Escrituras.</p>

      <h3>2. A Vontade de Deus é a Nossa Santificação</h3>
      <p>Viver segundo a vontade do Senhor é amar a Deus sobre todas as coisas, amar o próximo como a nós mesmos, perdoar aos que nos ofendem e fugir do pecado com a força que o Espírito Santo nos concede diariamente.</p>
    `,
    reflectionQuestions: [
      'O que na sua rotina evidencia que Cristo é realmente o Senhor das suas decisões?',
      'Existe alguma área da sua vida que você ainda tem relutado em submeter à vontade de Deus?',
      'Como o amor a Cristo nos motiva a obedecer com prazer e não com fardo?'
    ]
  },
  {
    id: 'art-pastoral-015',
    topicId: 'estudos-pastorais',
    title: 'Defesa da verdade',
    author: 'Pr. Ubiracy Lucas Barbosa',
    authorRole: 'Pastor Titular da ICE Metropolitana de Palmas',
    source: 'ICEMP • Artigos Bíblicos',
    sourceUrl: 'https://drive.google.com/file/d/1Wy-1hK6iZ7uARRbpHx3x0NlnIvM8y8yl/view?usp=sharing',
    readTime: '7 min',
    date: 'Apologética e Fidelidade',
    keyVerse: '"Batalhar diligentemente pela fé que uma vez por todas foi entregue aos santos." — Judas 1:3',
    summary: 'A imperativa missão da igreja e de cada discípulo de preservar com firmeza e mansidão o tesouro inegociável do Evangelho de Cristo.',
    contentHtml: `
      <p class="lead-text">Vivemos em um tempo em que as verdades fundamentais das Escrituras são constantemente desafiadas pelo relativismo pós-moderno e por heresias sutis que tentam esvaziar o poder da cruz. Diante disso, o apelo de Judas ecoa com vigor inadiável.</p>

      <h3>1. A Fé Entregue Uma Vez por Todas</h3>
      <p>A mensagem do Evangelho não é uma construção humana aberta a adaptações ao sabor das modas culturais. Trata-se da fé santa e perfeita revelada por Deus aos santos apóstolos e profetas, registrada com infalibilidade na Bíblia Sagrada.</p>

      <h3>2. Batalhar com Firmeza e Mansidão</h3>
      <p>A defesa da verdade cristã não se faz com arrogância, hostilidade ou agressividade mundana, mas com mansidão, reverência e clareza apostólica (1 Pe 3:15). Defender a verdade é amar as almas e resguardar as próximas gerações no porto seguro da sã doutrina.</p>

      <blockquote>"Uma igreja que não defende a verdade das Escrituras perde a sua própria razão de existir; mas quando nos apegamos firmes à Palavra da vida, resplandecemos como luzeiros no mundo." — Pr. Ubiracy Lucas Barbosa</blockquote>
    `,
    reflectionQuestions: [
      'Você se sente preparado para explicar com mansidão as razões da sua fé bíblica?',
      'Quais relativismos da cultura atual mais tentam pressionar a igreja a abandonar a ortodoxia?',
      'Como podemos defender a verdade com firmeza e ao mesmo tempo transbordar de amor e misericórdia?'
    ]
  },
  // ==========================================
  // TEMA 2: MULHERES
  // ==========================================
  {
    id: 'art-mulheres-01',
    topicId: 'mulheres',
    title: 'A Beleza Incorruptível da Mansidão',
    author: 'John Piper',
    authorRole: 'Fundador do Desiring God e Chanceler do Bethlehem College & Seminary',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/the-incorruptible-beauty-of-meekness',
    readTime: '7 min',
    date: 'Edição Especial',
    keyVerse: '"O enfeite delas não seja o exterior... mas seja o homem encoberto no coração; no incorruptível trajo de um espírito manso e quieto, que é precioso diante de Deus." — 1 Pedro 3:3-4',
    summary: 'A verdadeira formosura da mulher cristã não reside nas tendências efêmeras do mundo, mas na esperança inabalável depositada em Deus.',
    contentHtml: `
      <p class="lead-text">O mundo moderno gasta bilhões em produtos que prometem adiar o envelhecimento exterior. No entanto, o apóstolo Pedro nos aponta para uma beleza que jamais se deteriora: a beleza de um coração descansado em Deus.</p>

      <h3>1. Não Ter Medo de Nenhuma Perturbação</h3>
      <p>Pedro lembra às santas mulheres do passado que elas <em>"esperavam em Deus e não temiam perturbação alguma"</em> (1 Pe 3:5-6). A mansidão bíblica não é fraqueza, timidez ou passividade; é poder sob controle celestial. Uma mulher mansa é corajosa porque sua alma não depende dos aplausos humanos, mas da fidelidade do Todo-Poderoso.</p>

      <blockquote>"A mulher que teme ao Senhor é livre do pavor da velhice, da perda de status ou das incertezas do amanhã, porque sua âncora está no trono eterno de Deus." — John Piper</blockquote>

      <h3>2. O Espírito Tranquilo no Meio do Caos</h3>
      <p>Em um mundo ruidoso, dominado pela ansiedade, pressa e comparações nas redes sociais, o "espírito manso e tranquilo" brilha com luz sobrenatural. Não significa nunca falar, mas saber quando e como falar com sabedoria e instrução de bondade nos lábios (Pv 31:26).</p>

      <h3>3. Preciosa Aos Olhos do Criador</h3>
      <p>O texto bíblico declara que essa postura interior é <em>"de grande valor diante de Deus"</em>. Quando a mulher cristã escolhe confiar na providência divina ao invés do controle ou do desespero, os céus se alegram e o lar se enche da fragrância de Cristo.</p>
    `,
    reflectionQuestions: [
      'Quais ansiedades têm tentado roubar a paz e o espírito tranquilo do seu coração ultimamente?',
      'Como a certeza da soberania de Deus pode ajudá-la a não temer o futuro?',
      'De que maneira você pode encorajar outra irmã da congregação nesta semana?'
    ]
  },
  {
    id: 'art-mulheres-02',
    topicId: 'mulheres',
    title: 'Maternidade e a Glória Oculta do Cotidiano',
    author: 'Courtney Reissig',
    authorRole: 'Autora e Colaboradora da Ligonier Ministries e The Gospel Coalition',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles',
    readTime: '5 min',
    date: 'Artigo Selecionado',
    keyVerse: '"Tudo o que fizerdes, fazei-o de todo o coração, como ao Senhor e não aos homens." — Colossenses 3:23',
    summary: 'Trocar fraldas, lavar pratos e ensinar as Escrituras: como o trabalho silencioso das mães possui peso de glória eterna.',
    contentHtml: `
      <p class="lead-text">Muitas mães cristãs enfrentam momentos de cansaço extremo, perguntando-se se as tarefas repetitivas do dia a dia realmente importam para o Reino de Deus. A resposta bíblica é um retumbante SIM.</p>

      <h3>O Evangelho na Mesa da Cozinha</h3>
      <p>Discipular uma criança não começa quando ela entra no seminário; começa no abraço que enxuga as lágrimas, na oração ao pé da cama antes de dormir e no testemunho de paciência quando o leite é derramado no chão. Deus usa a fidelidade no pouco para formar o caráter dos futuros líderes e servos de Sua Igreja.</p>
    `,
    reflectionQuestions: [
      'Você tem enxergado as tarefas do seu lar como atos de adoração ao Senhor?',
      'Como a graça de Deus renova suas forças quando o cansaço materno se manifesta?'
    ]
  },

  // ==========================================
  // TEMA 3: HOMENS
  // ==========================================
  {
    id: 'art-homens-01',
    topicId: 'homens',
    title: 'A Verdadeira Força da Masculinidade Bíblica',
    author: 'John Piper',
    authorRole: 'Fundador do Desiring God',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/all',
    readTime: '8 min',
    date: 'Estudo Pastoral',
    keyVerse: '"Vigiai, estai firmes na fé, portai-vos varonilmente e fortalecei-vos. Todas as vossas coisas sejam feitas com amor." — 1 Coríntios 16:13-14',
    summary: 'A essência da liderança bíblica masculina: tomar a iniciativa de proteger, prover e sacrificar-se pelo bem daqueles sob seus cuidados.',
    contentHtml: `
      <p class="lead-text">A sociedade oscila perigosamente entre dois extremos desastrosos: o machismo tirânico e a passividade covarde. As Escrituras Sagradas nos apresentam um caminho glorioso e redentor: a masculinidade à imagem de Cristo.</p>

      <h3>1. Liderança que Lava os Pés</h3>
      <p>Jesus Cristo, o Leão de Judá, colocou a toalha na cintura e lavou os pés imundos de Seus discípulos. Ele assumiu a responsabilidade pelo pecado da Sua noiva na cruz do Calvário. Portanto, o homem bíblico não exige ser servido; ele toma a dianteira no serviço, na paciência e no perdão.</p>

      <blockquote>"No coração da masculinidade madura reside o senso primordial de responsabilidade benevolente de liderar, sustentar e proteger." — John Piper</blockquote>

      <h3>2. Três Marcas do Homem Cristão</h3>
      <ul>
        <li><strong>Firmeza Doutrinária:</strong> Não ser levado por ventos de doutrina e proteger a família dos erros do mundo.</li>
        <li><strong>Pureza Moral e Integridade:</strong> Guardar os olhos e a mente em um mundo saturado de imoralidade.</li>
        <li><strong>Ternura e Amor:</strong> Paulo ordena: <em>"Todas as vossas coisas sejam feitas com amor"</em>. Força sem amor gera crueldade; amor sem força gera fraqueza. Cristo uniu ambos perfeitamente.</li>
      </ul>
    `,
    reflectionQuestions: [
      'Em que áreas do seu lar você tem agido com passividade quando deveria assumir a liderança espiritual?',
      'Como você tem cuidado da saúde emocional e espiritual da sua esposa e filhos?'
    ]
  },
  {
    id: 'art-homens-02',
    topicId: 'homens',
    title: 'O Homem Piedoso e a Integridade no Trabalho',
    author: 'Sinclair B. Ferguson',
    authorRole: 'Teaching Fellow da Ligonier Ministries e Professor de Teologia Sistemática',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles',
    readTime: '6 min',
    date: 'Série Caráter Cristão',
    keyVerse: '"Servindo de boa vontade como ao Senhor, e não como a homens." — Efésios 6:7',
    summary: 'Seja na oficina, no escritório ou no campo, o homem cristão honra a Cristo através da excelência profissional e da honestidade inegociável.',
    contentHtml: `
      <p class="lead-text">O trabalho não é um castigo decorrente da queda, mas uma vocação divina instituída no Éden. O pecado corrompeu o trabalho com espinhos e fadiga, mas a redenção em Cristo restaura o trabalho como arena de santificação e testemunho público.</p>
      <p>Um homem piedoso não corta caminhos antiéticos, cumpre suas promessas mesmo com prejuízo próprio (Sl 15:4) e trata seus subordinados e clientes com justiça e respeito irrepreensíveis.</p>
    `,
    reflectionQuestions: [
      'O seu testemunho de integridade no trabalho aponta para a glória de Deus?',
      'Você tem orado pelos seus colegas de trabalho e pelos desafios diários da sua profissão?'
    ]
  },

  // ==========================================
  // TEMA 4: EDUCAÇÃO CRISTÃ
  // ==========================================
  {
    id: 'art-edu-01',
    topicId: 'educacao-crista',
    title: 'A Importância Vital da Catequese Bíblica na Igreja',
    author: 'R.C. Sproul',
    authorRole: 'Fundador da Ligonier Ministries e Autor de "A Santidade de Deus"',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/importance-catechesis',
    readTime: '7 min',
    date: 'Acervo Histórico',
    keyVerse: '"Tu, porém, permanece naquilo que aprendeste e de que foste inteirado..." — 2 Timóteo 3:14',
    summary: 'Por que o ensino sistemático e metódico das doutrinas bíblicas é indispensável para proteger a igreja contra as heresias e o relativismo cultural.',
    contentHtml: `
      <p class="lead-text">Durante séculos, a igreja cristã usou catecismos — perguntas e respostas bíblicas — para firmar os novos crentes e as crianças nas grandes verdades da redenção. Nos últimos cinquenta anos, essa prática foi abandonada em muitos lugares, gerando uma geração teologicamente frágil.</p>

      <h3>A Mente Moldada pela Verdade</h3>
      <p>A fé cristã não é um mero sentimento subjetivo; ela possui conteúdo objetivo revelado na Escritura. Precisamos saber quem é Deus, o que significa a Trindade, como fomos salvos e qual o nosso destino eterno. A Educação Cristã na igreja local e no lar é a muralha que impede a invasão das filosofias vãs do nosso tempo.</p>
    `,
    reflectionQuestions: [
      'Como você tem nutrido a sua mente com o estudo regular da doutrina bíblica?',
      'Como a Escola Bíblica Dominical (EBD) pode ser melhor aproveitada por você e sua família?'
    ]
  },

  // ==========================================
  // TEMA 5: FAMÍLIA
  // ==========================================
  {
    id: 'art-familia-01',
    topicId: 'familia',
    title: 'O Casamento Como Parábola da Aliança de Cristo',
    author: 'John Piper',
    authorRole: 'Autor de "Casamento Temporário: Parábola de Permanência"',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/marriage-is-a-parable',
    readTime: '8 min',
    date: 'Estudo sobre Casamento',
    keyVerse: '"Grande é este mistério; digo-o, porém, a respeito de Cristo e da igreja." — Efésios 5:32',
    summary: 'O matrimônio humano não é uma mera invenção social; é uma obra de arte divina desenhada para espelhar o amor eterno e sacrificial de Jesus por Sua Igreja.',
    contentHtml: `
      <p class="lead-text">Se você perguntar ao mundo contemporâneo qual o propósito do casamento, a resposta usual será: "a felicidade individual dos cônjuges". Se a felicidade acabar, o casamento é descartado. Mas as Escrituras nos ensinam algo infinitamente mais alto e sublime.</p>

      <h3>1. A Aliança que Reflete o Calvário</h3>
      <p>Em Efésios 5, Paulo desvenda o grande mistério: o casamento existe primordialmente para exibir a glória da graça de Cristo. O marido representa Cristo, amando sacrificialmente sua esposa até a morte. A esposa representa a igreja, honrando e seguindo seu marido com respeito sincero.</p>

      <blockquote>"Manter a aliança conjugal não é uma questão de apenas 'continuar apaixonado'; é um juramento sagrado diante do Deus Todo-Poderoso de ilustrar a fidelidade irrevogável de Jesus à Sua noiva." — John Piper</blockquote>

      <h3>2. O Poder do Perdão no Lar</h3>
      <p>Casamento é a união de dois grandes pecadores salvos pela graça. Portanto, não há lar sem conflitos, ofensas e mal-entendidos. A diferença na família cristã é a cruz: perdoamos como o Senhor nos perdoou (Cl 3:13). O perdão no lar quebra o ciclo da amargura e renova a ternura matrimonial.</p>
    `,
    reflectionQuestions: [
      'De que forma o seu casamento tem transmitido o amor paciente de Cristo aos que estão ao seu redor?',
      'Existe alguma mágoa ou pendência no seu relacionamento que precisa ser resolvida hoje à luz da cruz?'
    ]
  },
  {
    id: 'art-familia-02',
    topicId: 'familia',
    title: 'O Culto Doméstico: Restaurando o Altar no Lar',
    author: 'Joel Beeke & R.C. Sproul',
    authorRole: 'Pastores e Autores Reformados',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles',
    readTime: '6 min',
    date: 'Vida Familiar',
    keyVerse: '"Estas palavras que hoje te ordeno estarão no teu coração; e as intimarás a teus filhos..." — Deuteronômio 6:6-7',
    summary: 'Três elementos essenciais para implementar uma reunião familiar bíblica diária de 10 a 15 minutos: Leitura, Louvor e Oração.',
    contentHtml: `
      <p class="lead-text">Muitos pais sentem-se intimidados ao pensar em realizar culto doméstico, imaginando que precisam de um sermão teológico elaborado. Na verdade, a simplicidade e a constância são as maiores virtudes da adoração no lar.</p>

      <h3>A Regra dos Três Pilares:</h3>
      <ul>
        <li><strong>1. Leitura:</strong> Leia um capítulo ou alguns versículos da Bíblia de forma clara e compreensível.</li>
        <li><strong>2. Louvor:</strong> Cantem juntos um hino histórico ou cântico congregacional de louvor a Deus.</li>
        <li><strong>3. Oração:</strong> O pai ou a mãe lidera uma oração breve, agradecendo pelo dia e entregando as necessidades de cada filho.</li>
      </ul>
    `,
    reflectionQuestions: [
      'Qual o melhor horário do dia para sua família se reunir por 10 minutos ao redor da Palavra de Deus?',
      'Como envolver os filhos pequenos nas orações e leituras bíblicas?'
    ]
  },

  // ==========================================
  // TEMA 6: MISSÕES
  // ==========================================
  {
    id: 'art-missoes-01',
    topicId: 'missoes',
    title: 'As Missões Existem Porque o Louvor Não Existe',
    author: 'John Piper',
    authorRole: 'Autor de "Alegrem-se os Povos: A Supremacia de Deus em Missões"',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/missions-exists-because-worship-doesnt',
    readTime: '7 min',
    date: 'Perspectiva Missionária',
    keyVerse: '"Louvem-te os povos, ó Deus; louvem-te os povos todos. Alegrem-se e regozijem-se as nações..." — Salmo 67:3-4',
    summary: 'A adoração é o objetivo final da igreja; as missões são o meio temporário para reunir os verdadeiros adoradores de todas as línguas e nações.',
    contentHtml: `
      <p class="lead-text">A famosa declaração que abre o livro de John Piper transformou a visão missionária global: <em>"As missões não são o objetivo final da igreja. A adoração é. As missões existem porque o louvor não existe."</em></p>

      <h3>Missão é Proclamar a Glória do Rei</h3>
      <p>Quando a história deste mundo chegar ao fim e os remidos estiverem diante do trono celestial, as missões cessarão, pois não haverá mais ninguém para evangelizar. Mas a adoração continuará para todo o sempre. Portanto, o ardor missionário não brota meramente de piedade humana por pessoas perdidas, mas de um ciúme santo pela glória e honra devidas ao nome de Jesus.</p>
    `,
    reflectionQuestions: [
      'Você tem orado regularmente por missionários em campos transculturais?',
      'Como sua igreja local e seu GC podem participar ativamente do envio e sustento missionário?'
    ]
  },

  // ==========================================
  // TEMA 7: JUVENTUDE
  // ==========================================
  {
    id: 'art-juv-01',
    topicId: 'juventude',
    title: 'Não Desperdice a Sua Juventude',
    author: 'John Piper',
    authorRole: 'Fundador do Desiring God',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/dont-waste-your-youth',
    readTime: '6 min',
    date: 'Mensagem aos Jovens',
    keyVerse: '"Ninguém despreze a tua mocidade; mas sê o exemplo dos fiéis, na palavra, no trato, no amor, no espírito, na fé, na pureza." — 1 Timóteo 4:12',
    summary: 'A juventude não é uma sala de espera para a futilidade, mas o momento mais fértil para consagrar talentos, energia e intelecto a Cristo.',
    contentHtml: `
      <p class="lead-text">A cultura atual diz aos jovens entre 18 e 30 anos: "Divirta-se ao máximo, experimente tudo, não assuma compromissos sérios, viva para o fim de semana". As Escrituras Sagradas, contudo, convocam os jovens cristãos para a grandeza e a coragem.</p>

      <h3>Exemplo dos Fiéis</h3>
      <p>Timóteo era jovem, mas foi incumbido de liderar igrejas e defender a sã doutrina em Éfeso. Jovens cheios do Espírito Santo transformam faculdades, escritórios e bairros. A melhor decisão que você pode tomar hoje é recusar a mediocridade espiritual e colocar sua força a serviço do Reino eterno.</p>
    `,
    reflectionQuestions: [
      'O que você tem feito com seu tempo livre: consumindo distrações fúteis ou se aprofundando na Palavra?',
      'Como usar sua formação acadêmica ou trabalho como instrumento de testemunho cristão?'
    ]
  },

  // ==========================================
  // TEMA 8: ADOLESCENTES
  // ==========================================
  {
    id: 'art-adol-01',
    topicId: 'adolescentes',
    title: 'Quem Você Realmente É? Sua Identidade Além das Redes',
    author: 'Paul David Tripp',
    authorRole: 'Autor de "Idade de Oportunidades" e Conselheiro Bíblico',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/who-are-you-online',
    readTime: '5 min',
    date: 'Discipulado de Adolescentes',
    keyVerse: '"Porque fostes comprados por bom preço; glorificai, pois, a Deus no vosso corpo, e no vosso espírito, os quais pertencem a Deus." — 1 Coríntios 6:20',
    summary: 'Likes, seguidores e comentários não definem seu valor. O sangue de Jesus derramado na cruz já declarou quem você verdadeiramente é.',
    contentHtml: `
      <p class="lead-text">Nunca houve uma geração tão conectada e ao mesmo tempo tão solitária e ansiosa. As redes sociais criaram um tribunal silencioso onde todo adolescente se sente julgado pela aparência, pelas roupas e pelo número de curtidas.</p>

      <h3>O Descanso de Ser Filho de Deus</h3>
      <p>Em Cristo Jesus, você não precisa fingir ser outra pessoa para ser aceito. Você já foi perdoado, reconciliado e adotado pelo Criador do universo. Quando sua identidade está enraizada no amor incondicional de Jesus, a opinião dos outros deixa de ser o seu oxigênio.</p>
    `,
    reflectionQuestions: [
      'Quanto tempo você gasta rolando telas no celular em comparação com sua oração diária?',
      'Você já teve medo de demonstrar que é cristão diante dos seus colegas de classe?'
    ]
  },

  // ==========================================
  // TEMA 9: IGREJA
  // ==========================================
  {
    id: 'art-igreja-01',
    topicId: 'igreja',
    title: 'Por Que a Membresia na Igreja Local Importa',
    author: 'R.C. Sproul',
    authorRole: 'Fundador da Ligonier Ministries',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/why-church-membership-matters',
    readTime: '7 min',
    date: 'Eclesiologia Prática',
    keyVerse: '"Obedecei a vossos pastores, e sujeitai-vos a eles; porque velam por vossas almas..." — Hebreus 13:17',
    summary: 'Comprometer-se formalmente com uma congregação local não é burocracia, mas uma proteção espiritual divina para a sua alma.',
    contentHtml: `
      <p class="lead-text">Na era do consumo religioso, muitas pessoas pulam de igreja em igreja, assistindo a cultos como espectadores de um teatro. No entanto, o Novo Testamento não concebe a vida cristã sem a submissão voluntária e o compromisso formal com um corpo local visível.</p>

      <h3>A Proteção do Rebanho</h3>
      <p>Como os pastores prestarão contas pelas almas sob seus cuidados (Hb 13:17) se não souberem quem são as ovelhas que pertencem ao seu rebanho? A membresia bíblica garante que você terá irmãos para admoestá-lo quando errar, orar por você na enfermidade e celebrar as bênçãos com você.</p>
    `,
    reflectionQuestions: [
      'Você considera sua participação na igreja como um espectador ou como membro ativo do corpo de Cristo?',
      'Quais dons e talentos o Senhor lhe deu que estão prontos para abençoar a sua igreja local?'
    ]
  },

  // ==========================================
  // TEMA 10: AUTORES REFORMADOS
  // ==========================================
  {
    id: 'art-autores-01',
    topicId: 'autores-reformados',
    title: 'Quem Foi João Calvino e Qual o Seu Verdadeiro Legado?',
    author: 'W. Robert Godfrey',
    authorRole: 'Presidente Emérito do Westminster Seminary California e Teaching Fellow da Ligonier',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/who-was-john-calvin',
    readTime: '8 min',
    date: 'História da Reforma',
    keyVerse: '"Porque dele, por ele e para ele são todas as coisas; glória, pois, a ele eternamente. Amém." — Romanos 11:36',
    summary: 'Muitos conhecem Calvino apenas por caricaturas. Descubra o coração pastoral do reformador de Genebra que viveu apaixonado pela glória de Deus e pelo texto bíblico.',
    contentHtml: `
      <p class="lead-text">Nascido em Noyon, na França, em 1509, João Calvino foi um homem de saúde frágil, tímido por temperamento, mas que se tornou um dos instrumentos mais poderosos nas mãos de Deus para restaurar a centralidade da Palavra nas igrejas da Europa.</p>

      <h3>O Pastor de Genebra</h3>
      <p>Calvino não era um teórico isolado em uma torre de marfim; era um pastor que pregava quase todos os dias, visitava enfermos em meio a surtos de peste, aconselhava refugiados perseguidos e escreveu as imortais <em>Institutas da Religião Cristã</em> com o objetivo explícito de ensinar os crentes simples a ler a Bíblia com proveito.</p>

      <blockquote>"O coração do homem é uma fábrica perpétua de ídolos; somente a contemplação do Deus vivo em Cristo pode saciar a nossa alma." — João Calvino</blockquote>

      <h3>As 5 Marcas da Teologia de Calvino</h3>
      <ul>
        <li><strong>Sola Scriptura:</strong> A Bíblia como única regra infalível de fé e prática.</li>
        <li><strong>Soli Deo Gloria:</strong> Tudo existe para a suprema manifestação da glória do Criador.</li>
        <li><strong>União com Cristo:</strong> Todas as bênçãos da salvação nos chegam porque estamos enxertados em Jesus pelo Espírito Santo.</li>
        <li><strong>A Soberania da Graça:</strong> Nossa salvação começa e termina na livre misericórdia de Deus, e não nos méritos humanos.</li>
      </ul>
    `,
    reflectionQuestions: [
      'Você já leu algum trecho das Institutas ou comentários bíblicos de João Calvino?',
      'Como a verdade de que "todas as coisas são para a glória de Deus" influencia suas decisões diárias?'
    ]
  },
  {
    id: 'art-autores-02',
    topicId: 'autores-reformados',
    title: 'Martinho Lutero e a Descoberta da Justificação Pela Fé',
    author: 'R.C. Sproul',
    authorRole: 'Fundador da Ligonier Ministries',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/martin-luther-justification',
    readTime: '7 min',
    date: '500 Anos da Reforma',
    keyVerse: '"Visto que a justiça de Deus se descobre no evangelho de fé em fé, como está escrito: Mas o justo viverá pela fé." — Romanos 1:17',
    summary: 'Como um monge angustiado na Alemanha encontrou a paz eterna ao compreender que a justiça que salva é um presente imputado por Cristo.',
    contentHtml: `
      <p class="lead-text">Lutero tentou de tudo para aplacar a ira de um Deus santo: jejuns rigorosos, confissões intermináveis e penitências duras. Mas sua consciência continuava pesada e aterrorizada. Até que o Espírito Santo abriu seus olhos ao estudar a carta aos Romanos.</p>
      <p>Ele compreendeu que a "justiça de Deus" revelada no Evangelho não é a justiça com que Deus condena o pecador, mas a justiça perfeita de Jesus Cristo que Deus dá gratuitamente a todo aquele que crê. Nas palavras do próprio Lutero: <em>"Senti que havia renascido completamente e que havia entrado no próprio paraíso através de portas abertas."</em></p>
    `,
    reflectionQuestions: [
      'Você ainda tenta conquistar o favor de Deus pelas suas próprias forças ou descansa inteiramente na obra de Cristo na cruz?',
      'O que significa a expressão "simul justus et peccator" (ao mesmo tempo justo e pecador)?'
    ]
  },

  // ==========================================
  // TEMA 11: TEOLOGIA
  // ==========================================
  {
    id: 'art-teologia-01',
    topicId: 'teologia',
    title: 'O Que São as Doutrinas da Graça (Os Cinco Pontos do Calvinismo)?',
    author: 'R.C. Sproul',
    authorRole: 'Fundador da Ligonier Ministries',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/tulip-and-reformed-theology',
    readTime: '9 min',
    date: 'Fundamentos da Fé',
    keyVerse: '"Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus. Não vem das obras, para que ninguém se glorie." — Efésios 2:8-9',
    summary: 'Uma explicação clara, bíblica e pastoral sobre a soberania absoluta de Deus na salvação do pecador (o famoso acrônimo TULIP).',
    contentHtml: `
      <p class="lead-text">As chamadas "Doutrinas da Graça" não são invenção humana, mas o resumo bíblico sintetizado no Sínodo de Dort (1618-1619) para responder aos desvios do arminianismo. Conhecidas pelo acrônimo em inglês TULIP, revelam a magnitude da misericórdia do Pai.</p>

      <h3>1. Depravação Total (Total Depravity)</h3>
      <p>O pecado afetou todas as faculdades humanas: mente, vontade e emoções. O homem natural está espiritualmente morto em ofensas e pecados (Ef 2:1) e incapaz, por si mesmo, de buscar ou escolher a Deus sem a regeneração prévia do Espírito Santo.</p>

      <h3>2. Eleição Incondicional (Unconditional Election)</h3>
      <p>Antes da fundação do mundo, Deus escolheu soberanamente um povo para a salvação em Cristo, não baseado em boas obras ou fé que Ele anteviu, mas unicamente segundo o beneplácito de Sua santa vontade (Ef 1:4-5).</p>

      <h3>3. Expiação Eficaz (Limited/Definite Atonement)</h3>
      <p>A morte de Cristo na cruz não foi uma mera tentativa hipotética de salvação, mas uma redenção real, definitiva e eficaz por todas as Suas ovelhas (Jo 10:14-15).</p>

      <h3>4. Graça Irresistível (Irresistible Grace)</h3>
      <p>Quando o Espírito Santo aplica a obra de Cristo ao coração do eleito pelo chamado eficaz, Ele vence todas as resistências humanas, concedendo vida nova e fé salvadora (Jo 6:37, 44).</p>

      <h3>5. Perseverança dos Santos (Perseverance of the Saints)</h3>
      <p>Aqueles a quem Deus elegeu, chamou e justificou, Ele também preservará até o fim; nenhuma ovelha jamais será arrebatada das mãos do Bom Pastor (Jo 10:28-29; Rm 8:29-30).</p>
    `,
    reflectionQuestions: [
      'Como a certeza de que a salvação é 100% fruto da graça de Deus produz em você humildade em vez de orgulho?',
      'De que forma a perseverança dos santos lhe concede segurança e ânimo para continuar servindo ao Senhor?'
    ]
  },
  {
    id: 'art-teologia-02',
    topicId: 'teologia',
    title: 'A Santidade de Deus: O Atributo Que Muda Tudo',
    author: 'R.C. Sproul',
    authorRole: 'Autor do Clássico "A Santidade de Deus"',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/holiness-of-god',
    readTime: '8 min',
    date: 'Teologia Sistemática',
    keyVerse: '"Santo, Santo, Santo é o Senhor dos Exércitos; toda a terra está cheia da sua glória." — Isaías 6:3',
    summary: 'A Bíblia nunca repete que Deus é "amor, amor, amor" ou "misericórdia, misericórdia, misericórdia". Ela repete três vezes que Ele é SANTO.',
    contentHtml: `
      <p class="lead-text">No pensamento hebraico, a repetição tripla é o grau superlativo absoluto. Os anjos serafins cobrem os olhos e os pés diante do Todo-Poderoso proclamando Sua santidade transcendente.</p>
      <p>Ser santo significa ser totalmente puro, separado do pecado e incomparável em majestade. Quando Isaías viu o Senhor no templo, seu grito imediato não foi de orgulho, mas de quebrantamento: <em>"Ai de mim! Pois estou perdido! Porque sou um homem de lábios impuros..."</em> (Is 6:5). Somente quando compreendemos a santidade de Deus é que o valor da graça na cruz de Cristo brilha com toda a intensidade.</p>
    `,
    reflectionQuestions: [
      'A sua visão de Deus é grandiosa e reverente como a de Isaías?',
      'Como a santidade do Senhor deve influenciar a maneira como nos vestimos, conversamos e cultuamos?'
    ]
  },

  // ==========================================
  // TEMA 12: DEVOCIONAIS
  // ==========================================
  {
    id: 'art-devocional-01',
    topicId: 'devocionais',
    title: 'A Alegria no Senhor é a Nossa Força',
    author: 'John Piper',
    authorRole: 'Autor de "Em Busca de Deus: A Plenitude da Alegria Cristã"',
    source: 'Desiring God',
    sourceUrl: 'https://www.desiringgod.org/articles/the-joy-of-the-lord-is-your-strength',
    readTime: '5 min',
    date: 'Devocional Diário',
    keyVerse: '"Não vos entristeçais; porque a alegria do Senhor é a vossa força." — Neemias 8:10',
    summary: 'O hedonismo cristão bíblico: Deus é mais glorificado em nós quando estamos mais satisfeitos n’Ele.',
    contentHtml: `
      <p class="lead-text">Muitas pessoas pensam que o dever e a alegria são inimigos. Imaginam que a vida cristã autêntica é uma caminhada pesada, sombria e sem sorriso. As Escrituras nos revelam exatamente o oposto.</p>

      <h3>O Propósito da Nossa Alma</h3>
      <p>O Catecismo Maior de Westminster declara: <em>"O fim principal do homem é glorificar a Deus e comprazer-se n’Ele para sempre."</em> Não são dois propósitos separados; nós glorificamos a Deus encontrando n'Ele a nossa maior fonte de felicidade, deleite e contentamento, acima de qualquer tesouro terreno.</p>

      <blockquote>"Você não honra um banquete apenas comendo por obrigação; você honra o anfitrião saboreando cada prato com profunda gratidão e alegria." — John Piper</blockquote>
    `,
    reflectionQuestions: [
      'O que tem trazido mais satisfação ao seu coração nesta semana: as coisas temporais ou a presença de Cristo?',
      'Como você pode transformar suas orações diárias em momentos de deleite no Senhor?'
    ]
  },
  {
    id: 'art-devocional-02',
    topicId: 'devocionais',
    title: 'Graça Para o Dia de Hoje: Vivendo um Dia de Cada Vez',
    author: 'Sinclair B. Ferguson',
    authorRole: 'Teaching Fellow da Ligonier Ministries',
    source: 'Ligonier Ministries',
    sourceUrl: 'https://learn.ligonier.org/articles/grace-for-today',
    readTime: '4 min',
    date: 'Meditação Matinal',
    keyVerse: '"As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim; renovam-se cada manhã; grande é a tua fidelidade." — Lamentações 3:22-23',
    summary: 'Deus não concede graça antecipada para as ansiedades de amanhã; Ele promete a porção exata para o sustento do dia de hoje.',
    contentHtml: `
      <p class="lead-text">No deserto, Deus alimentava os israelitas com o maná diário. Se alguém tentasse acumular comida para os dias seguintes com medo do futuro, o alimento estragava. Assim opera a providência celestial.</p>
      <p>Não desperdice suas energias sofrendo por cenários que talvez nunca aconteçam. O Pai celestial conhece cada uma das suas necessidades e renovará Suas misericórdias ao romper da próxima alvorada. Descanse o coração nas promessas do Cordeiro.</p>
    `,
    reflectionQuestions: [
      'Qual preocupação do dia de amanhã você precisa entregar nas mãos de Deus agora mesmo?',
      'Lembre-se de uma ocasião em que a fidelidade do Senhor sustentou você no momento mais difícil.'
    ]
  }
];

// Funções de Consulta e Acesso a Estudos e Artigos com suporte à Gestão Pastoral
function getCustomStudiesList() {
  if (typeof localStorage === 'undefined') return [];
  const cached = localStorage.getItem('icemp_custom_studies');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

function getDeletedStudyIds() {
  if (typeof localStorage === 'undefined') return [];
  const cached = localStorage.getItem('icemp_deleted_studies');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  return [];
}

function getArticlesByTopic(topicId) {
  const deletedIds = getDeletedStudyIds();
  const base = STUDIES_ARTICLES.filter(a => a.topicId === topicId && !deletedIds.includes(a.id));
  const custom = getCustomStudiesList().filter(a => a.topicId === topicId && !deletedIds.includes(a.id));
  
  // Merge por ID (se pastor editou um artigo base, o custom sobrescreve)
  const map = new Map();
  base.forEach(a => map.set(a.id, a));
  custom.forEach(a => map.set(a.id, a));
  return Array.from(map.values());
}

function getArticleById(articleId) {
  const custom = getCustomStudiesList().find(a => a.id === articleId);
  if (custom) return custom;
  return STUDIES_ARTICLES.find(a => a.id === articleId);
}

function getAllStudiesTopics() {
  return STUDIES_TOPICS.map(topic => {
    return {
      ...topic,
      articlesCount: getArticlesByTopic(topic.id).length
    };
  });
}

function getGCStudiesList() {
  return typeof GC_STUDIES_LIST !== 'undefined' ? GC_STUDIES_LIST : [];
}

