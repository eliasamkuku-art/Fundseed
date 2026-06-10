import { Opportunity, Testimonial } from './types';

export const curatedOpportunities: Opportunity[] = [
  {
    id: 'opp-costech-crdb-loan',
    title: 'NFAST & CRDB Bank Foundation Credit Window (Ushirikiano wa Kukuza Ubunifu)',
    provider: 'COSTECH / NFAST na CRDB Bank Foundation',
    amount: 'Milioni 10 - Hadi 500 TZS (Mikopo ya Kukuza Ubunifu na Overdraft)',
    category: 'mkopo',
    description: 'Dirisha maalum la mkopo linalosimamiwa na COSTECH (NFAST) kwa ushirikiano na CRDB Bank Foundation ili kusaidia Startups na wabunifu wa Kitanzania kupata mitaji ya kukuza biashara au kupenya sokoni.',
    eligibility: [
      'Kampuni iliyosajiliwa kisheria nchini Tanzania na yenye umiliki wa wengi wa Kitanzania',
      'Kuwa na kiwango cha bidhaa cha MVP (Minimum Viable Product) au PMF (Product Market Fit)',
      'Biashara inayojihusisha na uzalishaji, usindikaji, viwanda, au maendeleo ya teknolojia',
      'Kuwa na uwezo wa kutoa dhamana/dhamana ya nafsi au dhamana ya tatu',
      'Kuwa na sifa nzuri ya mkopo (positive credit score) na mzunguko wa kimaendeleo (traction)'
    ],
    deadline: 'Maombi Yamefunguliwa (Kuanzia Mei 5, 2025)',
    origin: 'Tanzania',
    link: 'https://cgs.costech.or.tz'
  },
  {
    id: 'opp-tra-innovation',
    title: 'TRA Innovation Portal Challenge (Mbunifu Jiamulie Mambo)',
    provider: 'Tanzania Revenue Authority (TRA)',
    amount: 'Zawadi Hadi Milioni 50 TZS (Ufadhili na Kuingiza Mfumo wako TRA)',
    category: 'ruzuku',
    description: 'Fursa ya kuwasilisha wazo lenye tija au suluhisho la kibunifu kuchangia kuboresha mfumo wa kodi nchini Tanzania, kushindania zawadi ya hadi TZS Milioni 50 na kupata fusra ya kutoa mchango na kujumuishwa mifumo ya kodi nchini.',
    eligibility: [
      'Wabunifu, watengenezaji mifumo ya kiteknolojia (developers), wasomi au startups wa Kitanzania',
      'Wazo linalolenga kupanua wigo wa kodi, au kurahisisha ukadiriaji na ulipaji kodi kwa biashara ndogo ndogo',
      'Kuimarisha huduma za kodi za kidijitali na kupunguza gharama za ukusanyaji wa mapato nchini',
      'Utumiaji wa teknolojia za kisasa kama vile block-chain, AI, au Big Data katika usimamizi wa kodi au kurahisisha huduma',
      'Kuboresha utatuzi wa migogoro ya kodi nchini ili kuwa wa haraka, wazi na wenye kuaminika zaidi'
    ],
    deadline: 'Maombi Yako Wazi',
    origin: 'Tanzania',
    link: 'https://innovationportal.tra.go.tz'
  },
  {
    id: 'opp-1',
    title: 'Tony Elumelu Foundation (TEF) Entrepreneurship Programme',
    provider: 'Tony Elumelu Foundation',
    amount: '$5,000 (Ruzuku ya kuanzia)',
    category: 'ruzuku',
    description: 'Mpango mkubwa zaidi wa ufadhili wa wajasiriamali barani Afrika unaotoa mitaji ya kuanza, mafunzo ya kibiashara, na ushauri wa kitaalamu kwa vijana wenye mawazo bunifu ya biashara.',
    eligibility: ['Wazo bunifu au biashara iliyo chini ya miaka 3', 'Raia yeyote wa nchi ya Afrika', 'Umri kuanzia miaka 18'],
    deadline: 'Tarehe 31 Machi kilas mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-2',
    title: 'Mfuko wa Maendeleo ya Kilimo Tanzania (TADB) - Vijana na Wanawake',
    provider: 'Tanzania Agricultural Development Bank',
    amount: 'Milioni 5 - 50 TZS (Dhamana & Mikopo ya Nafuu)',
    category: 'mkopo',
    description: 'Ufadhili wa mikopo yenye masharti nafuu na isiyo na riba kubwa kwa vikundi na wajasiriamali binafsi wa kitanzania wanaojishughulisha na mnyororo wa thamani wa kilimo, ufugaji, na uvuvi.',
    eligibility: ['Wajasiriamali wadogo na wa kati (SMEs)', 'Kujihusisha na kilimo, ufugaji au usindikaji wa chakula', 'Kusajiliwa nchini Tanzania'],
    deadline: 'Maombi yanaendelea',
    origin: 'Tanzania'
  },
  {
    id: 'opp-3',
    title: 'Ruzuku ya Ubunifu kupitia COSTECH',
    provider: 'Tume ya Sayansi na Teknolojia Tanzania',
    amount: 'Milioni 10 - 30 TZS (Ruzuku kamili)',
    category: 'ruzuku',
    description: 'Msaada wa kifedha kutoka serikali ya Tanzania kwa miradi yenye ubunifu mkubwa wa kiteknolojia na kisayansi inayotatua changamoto za kijamii na kiuchumi nchini.',
    eligibility: ['Watafiti na wajasiriamali wenye protoraypu iliyothibitishwa', 'Kusajiliwa COSTECH au SIDO', 'Mradi uwe na mchango wa kijamii'],
    deadline: 'Tarehe 15 Oktoba 2026',
    origin: 'Tanzania'
  },
  {
    id: 'opp-4',
    title: 'Mastercard Foundation - Young Africa Works',
    provider: 'Mastercard Foundation',
    amount: 'Hadi $25,000 (Ufadhili & Mafunzo)',
    category: 'ruzuku',
    description: 'Ushirikiano wa kuwawezesha vijana wa kike na kiume kupata fursa za kazi zenye hadhi na kuimarisha biashara zao kupitia ruzuku ya mitaji na msaada wa kukuza soko.',
    eligibility: ['Biashara zinazoongozwa na vijana/wanawake nchini Tanzania', 'Kutoa fursa za ajira kwa vijana wengine', 'Kuweka kumbukumbu sahihi za kifedha'],
    deadline: 'Tarehe 30 Novemba 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-5',
    title: 'Anzisha Prize for African Youth',
    provider: 'African Leadership Academy & Mastercard',
    amount: '$2,500 hadi $25,000 (Tuzo & Mitaji)',
    category: 'ruzuku',
    description: 'Tuzo na mtaji kwa viongozi na wajasiriamali vijana wenye umri mdogo zaidi barani Afrika ambao wameanzisha biashara zenye manufaa kwa jamii zao.',
    eligibility: ['Vijana wenye umri kati ya miaka 15 na 22', 'Waanzilishi wa biashara inayofanya kazi na kuajiri watu', 'Msimamo thabiti wa kiuongozi'],
    deadline: 'Tarehe 15 Julai 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-6',
    title: 'Dhamana ya Kilimo ya PASS Trust',
    provider: 'Private Agricultural Sector Support',
    amount: 'Hadi 60% ya Dhamana ya Mikopo ya Benki',
    category: 'mkopo',
    description: 'PASS inatoa dhamana ya mikopo kwa wajasiriamali wa kilimo ambao hawana dhamana za kutosha kukopesheka na benki washirika (kama CRDB, NMB, NBC).',
    eligibility: ['Wakulima binafsi, vikundi, au makampuni ya kilimo', 'Kuwa na mradi wenye uwezekano wa kibiashara', 'Kupitia ukaguzi wa PASS Trust'],
    deadline: 'Maombi yako wazi daima',
    origin: 'Tanzania'
  },
  {
    id: 'opp-7',
    title: 'SIDO Mfuko wa Dhamana ya Kitaifa (NEDF)',
    provider: 'Shirika la Viwanda SIDO',
    amount: 'Milioni 1 - 10 TZS (Mikopo Nafuu)',
    category: 'mkopo',
    description: 'Mpango wa serikali kupitia SIDO kutoa mikopo micro-micro kwa wajasiriamali wadogo sana viwandani na katika usindikaji wa chakula au uzalishaji wa sabuni, mafuta n.k.',
    eligibility: ['Wajasiriamali wadogo (Viwanda Vidogo)', 'Kupata mafunzo/ushauri wa SIDO mapema', 'Kuwa na wadhamini wawili waaminifu'],
    deadline: 'Inapokelewa ofisi za mikoa za SIDO',
    origin: 'Tanzania'
  },
  {
    id: 'opp-8',
    title: 'Y Combinator Startup Accelerator',
    provider: 'Y Combinator (Silicon Valley)',
    amount: '$500,000 (Mtaji wa Uwekezaji - Equity)',
    category: 'equity',
    description: 'Uwekezaji wa kiwango cha juu ulimwenguni kwa startups za kiteknolojia au zinazokua kwa kasi, inayojumuisha miezi 3 ya mafunzo makali na kujiandaa mbele ya wawekezaji wakubwa wa kimataifa.',
    eligibility: ['Waanzilishi wenye wazo thabiti la kiteknolojia/programu', 'Uwezo wa kukuza biashara kimataifa', 'Uwezo wa kuhamia kwa dharura au kuhudhuria mtandaoni'],
    deadline: 'Maombi ya msimu wa Winter/Summer kila mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-9',
    title: 'Savannah Fund Seed Investment Program',
    provider: 'Savannah Fund (Africa)',
    amount: '$25,000 - $100,000 (Mseto wa Equity)',
    category: 'equity',
    description: 'Mfuko wa uwekezaji wa kiwango cha awali (Seed stage) kwa kampuni zinazochipukia nchini Tanzania, Kenya, Uganda na Afrika ya Kusini katika sekta ya FinTech, AgTech, na Logistics.',
    eligibility: ['Teknolojia inayoweza kukuzwa (scalable)', 'Timu iliyokamilika (angalia waanzilishi-wenza)', 'Kuwa na mfano thabiti wa mapato (traction)'],
    deadline: 'Tarehe 30 Septemba 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-10',
    title: 'Sahara Accelerator Program - Tanzania',
    provider: 'Sahara Ventures',
    amount: 'Milioni 10 - 50 TZS + Seed Investment Option',
    category: 'incubator',
    description: 'Programu ya miezi 3 kulea na kukuza mawazo ya kijasiriamali kuingia sokoni nchini Tanzania, ikijumuisha ofisi za bure, mafunzo ya kisheria na ufunguzi wa fursa mbele ya malaika wawekezaji.',
    eligibility: ['Vijana wenye startups za hatua za kwanza', 'Kujitolea kushiriki programu Dar es Salaam', 'Wazo lenye mrengo wa kijamii au kiteknolojia'],
    deadline: 'Tarehe 15 Agosti 2026',
    origin: 'Tanzania'
  },
  {
    id: 'opp-11',
    title: 'USADF Grant Funding for African Enterprises',
    provider: 'US African Development Foundation',
    amount: 'Hadi $250,000 (Ruzuku kamili ya miundombinu)',
    category: 'ruzuku',
    description: 'USADF inatoa ruzuku za moja kwa moja kwa vikundi vya wakulima na ushirika ili kuboresha zana za kazi na kuingia kwenye soko kubwa.',
    eligibility: ['Ushirika wa wakulima na SME za ndani', 'Kuweka usawa wa jinsia (wanawake wengi)', 'Biashara inayomilikiwa na kusimamiwa na wazawa 100%'],
    deadline: 'Mwisho wa kila msimu wa maombi (Oktoba)',
    origin: 'Duniani'
  },
  {
    id: 'opp-12',
    title: 'CRDB Imbeju Program for Youth & Women',
    provider: 'CRDB Bank Foundation',
    amount: 'Mikopo ya Riba nafuu 5% na Ruzuku ya Awamu',
    category: 'mkopo',
    description: 'Mpango maalum uliotengenezwa kuwawezesha vijana wenye mawazo ya kibiashara lakini hawana historia ya benki. Unaanzia mafunzo ya ununuzi na kuishia kutoa mikopo isiYo na dhamana ngumu.',
    eligibility: ['Wanawake na vijana chini ya miaka 35', 'Kuwa na akaunti ya CRDB Imbeju', 'Kushiriki mafunzo ya uendeshaji biashara'],
    deadline: 'Maombi yanafunguliwa kwa awamu tanzania nzima',
    origin: 'Tanzania'
  },
  {
    id: 'opp-13',
    title: 'NMB Foundation - Kilimo Biashara Fund',
    provider: 'NMB Bank Foundation',
    amount: 'Ruzuku za Vipaa na Zana za Kazi',
    category: 'ruzuku',
    description: 'Utoaji wa msaada usio wa kifedha wa moja kwa moja bali ruzuku ya pembejeo za kilimo au vifaa vya ujenzi wa vitalu nyumba (greenhouses) kwa vijana na wanawake nchini.',
    eligibility: ['Kikundi kilichosajiliwa kisheria ngazi ya mtaa/wilaya', 'Kushughulikia kilimo cha mboga mboga au uzalishaji mazao', 'Uthibitisho wa eneo la mradi'],
    deadline: 'Tarehe 20 Novemba 2026',
    origin: 'Tanzania'
  },
  {
    id: 'opp-14',
    title: 'Google for Startups Accelerator: Africa',
    provider: 'Google',
    amount: 'Mafunzo, Miundombinu ya Cloud ($100k credit)',
    category: 'incubator',
    description: 'Programu ya kulea kampuni teknolojia Afrika ikitoa ufikiaji wa rasilimali za Google, mentors wa kimataifa, na msaada wa kibunifu wa mifumo ya Cloud na AI.',
    eligibility: ['Startup ya kiteknolojia hatua ya Seed hadi Series A', 'Inayolenga kutatua matatizo makubwa ya kiafrika', 'Matumizi ya teknolojia ndio nguzo mkuu'],
    deadline: 'Inatangazwa kila mwanzo wa mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-15',
    title: 'L’Oréal-UNESCO For Women in Science',
    provider: 'L’Oréal Foundation',
    amount: '€10,000 hadi €15,000 (Ruzuku ya Utafiti)',
    category: 'ruzuku',
    description: 'Mpango huu wa kifahari unafadhili wanasayansi wanawake barani Afrika wanaofanya tafiti muhimu za sayansi ambazo zinaweza kubadilishwa kuwa biashara.',
    eligibility: ['Wanasayansi wanawake na wagunduzi', 'Tafiti katika sekta ya kilimo, afya, mazingira au uhandisi', 'Kuwa mkazi wa nchi ya Sub-Saharan'],
    deadline: 'Tarehe 30 Juni 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-16',
    title: 'HEINEKEN Africa Foundation Grants',
    provider: 'HEINEKEN Africa Foundation',
    amount: 'Hadi €50,000 (Ruzuku ya Jamii & Maji)',
    category: 'ruzuku',
    description: 'Inafadhili miradi inayolenga kuboresha afya, usafi na maji safi katika jamii mbalimbali karibu na maeneo ya uendeshaji ya Heineken nchini Tanzania au kwingineko.',
    eligibility: ['Mashirika yasiyo ya kiserikali (NGOs/CBOs) washirika', 'Inayotatua changamoto za moja kwa moja za usafi na afya', 'Kuwa na uzoefu wa miaka 2+ katika mradi'],
    deadline: 'Tarehe 15 Septemba 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-17',
    title: 'Equity Group Foundation - Entrepreneurship Loan',
    provider: 'Equity Bank Tanzania',
    amount: 'Milioni 3 - 100 TZS (Mikopo Maalum)',
    category: 'mkopo',
    description: 'Mikopo ya maendeleo ya kibiashara kwa wanawake wajasiriamali na vikundi vya uzalishaji kupitia mafunzo ya ujasiriamali yasiyolipiwa kutoka Equity Group.',
    eligibility: ['Biashara ndogo inayofanya kazi', 'Kuwepo kwa dhamana ya kibiashara au ya jamii (guarantee)', 'Kufungua akaunti ya biashara Equity Bank'],
    deadline: 'Maombi yako wazi muda wote',
    origin: 'Tanzania'
  },
  {
    id: 'opp-18',
    title: 'Akiira One Seed Funding for Clean Energy',
    provider: 'Akiira Foundation',
    amount: 'Hadi $50,000 (Uwekezaji wa awali)',
    category: 'equity',
    description: 'Inayolenga startups zinazoshughulikia miradi ya nishati jadidifu (Solar, Bio-gas, n.k.) barani Afrika ili kuleta ufumbuzi wa bei nafuu maeneo ya vijijini.',
    eligibility: ['Mawazo ya kizazi kipya cha umeme safi', 'Kuwa na ulinzi wa mazingira kama lengo kuu', 'Kuwa na angalau mfano wa kifaa kikitenda kazi'],
    deadline: 'Tarehe 10 Julai 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-19',
    title: 'She Leads Climate Fund (African Women)',
    provider: 'Climate Justice Alliance',
    amount: '$15,000 (Ruzuku ya Kubuni mradi)',
    category: 'ruzuku',
    description: 'Kuwawezesha wanawake kupambana na changamoto za mabadiliko ya nchi kupitia rasilimali na mikakati thabiti ya uzalishaji mboga mboga na ufugaji nyuki Tanzania.',
    eligibility: ['Vikundi vya wanawake pekee', 'Kusisitiza umuhimu wa mazingira mepesi na endelevu', 'Mradi uwe maeneo ya pembezoni mwa miji au vijijini'],
    deadline: 'Tarehe 5 Septemba 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-20',
    title: 'Safaricom Spark Venture Fund for Tech',
    provider: 'Safaricom Spark Fund (East Africa)',
    amount: 'Hadi $250,000 (Equity & Msaada wa Soko)',
    category: 'equity',
    description: 'Mfuko wa uwekezaji ukiunga mkono matumizi ya huduma za kidijitali kuvuka mipaka nchini Tanzania, Kenya na Uganda kwa wasambazaji wa huduma dhabiti.',
    eligibility: ['Startups zenye mfumo unaomsaidia mteja mwisho kupitia simu', 'Kuonyesha uwezo wa kushirikiana na mitandao ya simu', 'Uadilifu wa hali ya juu wa usalama wa mtandao'],
    deadline: 'Yanaendelea kupokelewa',
    origin: 'Duniani'
  },
  {
    id: 'opp-21',
    title: 'Chevening Scholarships kwa ajili ya Watanzania',
    provider: 'UK Government',
    amount: 'Ufadhili kamili wa masomo na gharama za maisha nchini Uingereza',
    category: 'scholarship',
    description: 'Ufadhili kamili wa masomo ya uzamili (Master\'s) kwa viongozi na watu wenye uwezo mkubwa kutoka Tanzania. Lengo ni kuunganisha watu ambao baada ya masomo watarudi kujenga Taifa.',
    eligibility: ['Kuwa na Shahada ya Kwanza', 'Uwezo wa kiuongozi uliothibitishwa', 'Uzoefu wa kazi angalau miaka 2'],
    deadline: 'Mwezi Novemba kila mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-22',
    title: 'Fulbright Foreign Student Program',
    provider: 'US Department of State',
    amount: 'Ufadhili kamili (Masomo na Maisha)',
    category: 'scholarship',
    description: 'Fursa ya masomo ya Umahiri (Master\'s) na Uzamivu (PhD) kwa wanafunzi wa Kitanzania na wataalamu vijana. Inatoa fursa kubwa ya kubadilishana tamaduni na wataalamu wa kimataifa.',
    eligibility: ['Shahada ya kwanza na matokeo mazuri', 'Kujua lugha ya Kiingereza fasaha', 'Kurudi Tanzania baada ya masomo'],
    deadline: 'Kati ya Februari hadi Mei kila mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-23',
    title: 'Mo Dewji Foundation Mentorship & Grants',
    provider: 'Mo Dewji Foundation',
    amount: 'Hadi Milioni 5 TZS & Mentorship',
    category: 'ruzuku',
    description: 'Programu inayolenga kutoa mitaji midogo na ushauri makini (mentorship) kwa vijana wa kitanzania wanaoingia kwenye ujasiriamali. Inaunga mkono maendeleo endelevu na ubunifu.',
    eligibility: ['Vijana wa Kitanzania', 'Mawazo yanayoweza kutatua changamoto za ndani', 'Kuweza kushiriki kwenye vipindi vya mentorship'],
    deadline: 'Maombi yanafunguliwa kwa awamu',
    origin: 'Tanzania'
  },
  {
    id: 'opp-25',
    title: 'The Zawadi Africa Education Fund',
    provider: 'Zawadi Africa',
    amount: 'Ufadhili kamili wa masomo (Full Scholarship)',
    category: 'scholarship',
    description: 'Mpango wa kutoa udhamini kamili kwa wasichana wenye uwezo mkubwa wa kitaaluma kutoka nchi za Afrika ili kusoma katika vyuo vikuu bora zaidi duniani (Marekani, Canada).',
    eligibility: ['Wasichana pekee', 'Ufaulu wa kiwango cha juu kidogo', 'Uwezo wa kiuongozi'],
    deadline: 'Tarehe 15 Septemba kila mwaka',
    origin: 'Duniani'
  },
  {
    id: 'opp-26',
    title: 'Tanzania Women Fund (TWF) Grant',
    provider: 'Tanzania Women Fund',
    amount: 'Milioni 5 - 20 TZS',
    category: 'ruzuku',
    description: 'Ruzuku inalenga kusaidia asasi za kiraia na vikundi vya wanawake vinavyopigania haki za wanawake, usawa wa kijinsia, na maendeleo ya kiuchumi.',
    eligibility: ['Vikundi vya wanawake registered', 'Mradi wa haki za kijinsia', 'Uongozi wa wanawake'],
    deadline: 'Maombi wazi mara mbili kwa mwaka',
    origin: 'Tanzania'
  },
  {
    id: 'opp-27',
    title: 'Entrepreneurship for Social Change (E4SC)',
    provider: 'Social Impact Foundation',
    amount: 'Hadi $10,000 (Ruzuku ya kuanzia)',
    category: 'ruzuku',
    description: 'Programu hii inasaidia kulea biashara ndogo zenye mrengo wa kijamii (social enterprises) ili kuleta tija kwenye jamii za pembezoni mwa miji nchini.',
    eligibility: ['Startups zenye impact ya kijamii', 'Umri kuanzia 18-35', 'Biashara isiyo na changamoto za kisheria'],
    deadline: 'Tarehe 30 Novemba 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-28',
    title: 'African Women in Tech (AWIT) Scholarship',
    provider: 'AnitaB.org & Partners',
    amount: 'Ufadhili wa Utafiti na Vifaa vya Tech ($5,000)',
    category: 'scholarship',
    description: 'Udhamini huu unalenga wasichana wanaochipukia katika sekta ya Teknolojia (Tech) ili kuwapa nguvu ya kuwa wataalamu na waanzilishi wa kampuni za kiteknolojia.',
    eligibility: ['Wasichana wanaosomea Computer Science au Related fields', 'Kuonyesha project inayotumia kodigo (coding)', 'Nia ya kufundisha wengine'],
    deadline: 'Tarehe 20 Agosti 2026',
    origin: 'Duniani'
  },
  {
    id: 'opp-29',
    title: 'SIDO - Mfuko wa Ruzuku ya Uzalishaji (Industrial Grant)',
    provider: 'SIDO',
    amount: 'Milioni 5 - 20 TZS (Msaada wa Vifaa)',
    category: 'ruzuku',
    description: 'Ruzuku kupitia SIDO kwa vikundi vidogo vya uzalishaji viwandani (kama usindikaji wa mboga, utengenezaji wa sabuni, n.k.) ili kuboresha teknolojia.',
    eligibility: ['Kikundi kilichosajiliwa', 'Biashara iliyo kwenye hatua ya uzalishaji', 'Kutumia malighafi za kitanzania'],
    deadline: 'Maombi yanaendelea mikoa yote',
    origin: 'Tanzania'
  }
];

export const africanTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Neema Mwakalindile',
    business: 'Kwanza Agri-Value Ltd',
    location: 'Mbeya, Tanzania',
    amountGranted: 'Milioni 35 TZS (Ruzuku ya USADF)',
    story: 'Tulikuwa tukisindika mpunga kienyeji tu ndipo nilipotumia zana ya Smart-Draft ya FundSeed kuandaa andiko la mradi na kuomba ruzuku ya USADF. Tulithibitishwa na tukafanikiwa kupata milioni 35 za kununulia mashine mpya ya kisasa! FundSeed kilitusaidia kuonekana kitaalamu.',
    avatarChar: 'N',
    avatarColor: 'bg-emerald-500',
    image: '/images/neema_agri_success_1780929434002.png'
  },
  {
    id: 'test-2',
    name: 'Salum Juma',
    business: 'Okoa Waste Collectors',
    location: 'Kigamboni, Dar es Salaam',
    amountGranted: 'Milioni 12 TZS (Mkopo nafuu wa SIDO)',
    story: 'Kujaza fomu za kuomba mikopo kwenye taasisi kubwa kila siku kulikuwa kunaniletea kichwa kuuma kwa sababu sikuwa na Business Plan rasmi. Kupitia FundSeed nilijibu maswali kule kwenye AI Assistant ikazalisha mpango biashara wenye mpangilio makini sana. SIDO walikubali andiko langu mara moja!',
    avatarChar: 'S',
    avatarColor: 'bg-indigo-500',
    image: '/images/salum_waste_success_1780929449875.png'
  },
  {
    id: 'test-3',
    name: 'Mwasiti Ally',
    business: 'Asali Safi ya Tabora',
    location: 'Tabora, Tanzania',
    amountGranted: '$5,000 (Ruzuku ya Tony Elumelu)',
    story: 'Nilikuwa na wazo la kuuza asali ila sikuwa najua namna ya kuliwasilisha. Ada ya 20,000 TZS ya FundSeed niliyolipa ndiyo iliyotengeneza mabadiliko ya historia yangu. Niliandaa Pitch Deck safi sana kwa kutumia Smart-Draft. TEF waliona andiko langu likajazwa na weledi mkubwa.',
    avatarChar: 'M',
    avatarColor: 'bg-amber-500',
    image: '/images/mwasiti_honey_success_1780929465344.png'
  },
  {
    id: 'test-4',
    name: 'John Bosco',
    business: 'Eco-Tiles Startup',
    location: 'Arusha, Tanzania',
    amountGranted: 'Milioni 15 TZS (Dhamana ya PASS Trust)',
    story: 'Kama msanidi programu na mbunifu wa mazingira, sikuwa najua nyanja za fedha za biashara ya vigae vya kurejesha mazingira. Jukwaa la FundSeed lilinipa mwongozo mzima na mifano ya kujibu maswali magumu ya kadi ya bodi ya mikopo. Leo tunazalisha vyema Arusha.',
    avatarChar: 'J',
    avatarColor: 'bg-teal-500',
    image: '/images/john_tiles_success_1780929479320.png'
  },
  {
    id: 'test-5',
    name: 'Farida Kamugisha',
    business: 'Tech Sis Tz',
    location: 'Mwanza, Tanzania',
    amountGranted: 'Scholarship ya Chevening',
    story: 'Nilitumia mfumo huu sio tu kupata Business Plan, bali pia connection za watu waliofanikiwa na Scholarships. Nilijaza fomu zangu kwa usahihi kwa kutumia muongozo wao. Sasa niko UK nachukua Master’s degree yangu bure kabisa! FundSeed ni mwokozi!',
    avatarChar: 'F',
    avatarColor: 'bg-pink-500',
    image: ''
  },
  {
    id: 'test-6',
    name: 'Elias Mnanka',
    business: 'Kijani Agri Mentorship',
    location: 'Dodoma, Tanzania',
    amountGranted: 'Milioni 5 TZS & Mentorship',
    story: 'Nilikuwa nina kilimo kigumu lakini baada ya kukutana na menta kupitia platform ya FundSeed, mwelekeo ulibadilika. Walinishauri jinsi ya kusimamisha brand yangu vizuri. Mfumo huu unaunganisha watu zaidi ya kutoa ruzuku kavukavu.',
    avatarChar: 'E',
    avatarColor: 'bg-blue-600',
    image: ''
  }
];

export const tanzaniaPaymentCarriers = [
  { id: 'voda', name: 'M-Pesa (Vodacom)', color: 'text-red-500', logo: '' },
  { id: 'tigo', name: 'Mixx by Yas (Tigo)', color: 'text-sky-500', logo: '' },
  { id: 'airtel', name: 'Airtel Money (Airtel)', color: 'text-red-600', logo: '' },
  { id: 'halopesa', name: 'HaloPesa (Halotel)', color: 'text-orange-500', logo: '' }
];

export const faqs = [
  {
    q: "Je, ada ya 20,000 TZS ninalipa kila mwezi?",
    a: "Hapana! Malipo ya 20,000 TZS ni ya mara moja tu (One-time payment). Itakupa uanachama wa kudumu na ufikiaji wa kudumu wa mifumo yetu na zana zote za AI (Smart-Draft)."
  },
  {
    q: "Je, FundSeed inanipa ruzuku au inatoa mikopo yenyewe?",
    a: "FundSeed haitoi mikopo au ruzuku moja kwa moja. Sisi ni jukwaa la kidijitali ambalo linakupa taarifa (fursa halali zilizothibitishwa), na zana za kitaalam za AI kukusaidia uandike andiko thabiti la kupata fedha hizo."
  },
  {
    q: "Je, nikishalipia natengenezaje andiko?",
    a: "Ukishamaliza kusajili na kulipa kwa njia ya mitandao ya simu nchini, utaingia kwenye kurasa ya zana ya 'Smart-Draft'. Humo utachagua aina ya hati unayotaka (Business Plan au Pitch Deck), utajibu maswali machache kuhusu biashara yako, na AI msaidizi wetu ataandika hati kamili ya kitaalamu ndani ya sekunde chache."
  },
  {
    q: "Je, malipo yangu yako salama?",
    a: "Ndiyo! Mifumo yetu imesimbwa kwa njia ya usambazaji thabiti wa TLS (SSL) yenye ulinzi kamili wa siri (SSL Secured). Tunashirikiana na mitandao ya simu kuwezesha malipo salama kabisa nchini."
  }
];
