export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  level: string;
  benefits: string;
  eligibility: string;
  status: 'Wazi' | 'Mzunguko Umefungwa';
  url: string;
  deadlineInfo: string;
  category: 'Government' | 'Foundation' | 'Europe' | 'Asia/Americas';
}

export interface PremiumScholarshipDatabase {
  id: string;
  name: string;
  scope: string;
  countries: string;
  type: string;
  officialUrl: string;
  description: string;
}

export interface ScholarshipAlumnus {
  id: string;
  name: string;
  university: string;
  scholarshipName: string;
  course: string;
  location: string;
  story: string;
  year: string;
  avatarColor: string;
  avatarChar: string;
  city: string;
  image?: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
}

// 4 high-profile featured scholarships (accessible to everyone)
export const newFeaturedGrants: Scholarship[] = [
  {
    id: "grant-nfast-costech-crdb",
    title: "COSTECH NFAST & CRDB Bank Foundation Special Credit Window for Startups",
    provider: "Tanzania Commission for Science and Technology (COSTECH) & CRDB Bank Foundation",
    level: "MVP / Product Market Fit Stage",
    benefits: "Commercialization Loans, Overdrafts, and Matching Funds (Collateral is the asset itself, personal guarantee, or third-party guarantee)",
    eligibility: "Locally registered Tanzanian innovation startup, majority Tanzanian-owned, has MVP/PMF, positive credit score, and demonstrates financial traction.",
    status: "Wazi",
    deadlineInfo: "Kuanzia tarehe 5 Mei 2025",
    url: "https://cgs.costech.or.tz",
    category: "Government"
  },
  {
    id: "grant-tra-innovation",
    title: "TRA Innovation Portal Challenge - Tanzania Revenue Authority",
    provider: "Tanzania Revenue Authority (TRA)",
    level: "Early Stage / MVP / Idea Stage",
    benefits: "Awards up to TZS 50,000,000 (Milioni 50) and a unique path to pilot, integrate, or scale your solution within the national tax administration framework.",
    eligibility: "Tanzanian-owned startups, individual developers, wasomi, or innovations focusing on tax-base broadening, SME payment simplification, modernizing digital processes, AI/blockchain tax tracking, and resolving tax disputes.",
    status: "Wazi",
    deadlineInfo: "Maombi Yako Wazi",
    url: "https://innovationportal.tra.go.tz",
    category: "Government"
  },
  {
    id: "grant-tvl-accelerator",
    title: "Tanzania Ventures Lab (TVL) Call for Applications (Madini & Nishati Accelerators)",
    provider: "Sahara Consult, DTBi, buni",
    level: "Early to Scaling Stage",
    benefits: "High-potential ventures ready to grow, validate, and scale",
    eligibility: "Innovative, scalable, market-driven solution in mining, extractives, energy, or cleantech. Registered in Tanzania.",
    status: "Wazi",
    deadlineInfo: "Maombi Yapo Wazi",
    url: "#",
    category: "Government"
  },
  {
    id: "event-africa-tech-show",
    title: "Africa Technology Show 2026 (Exhibition & Conference)",
    provider: "Kenyatta International Convention Centre",
    level: "B2B Exhibition",
    benefits: "Innovate, Connect, Transform! East Africa's Premier B2B Exhibition",
    eligibility: "Tech, Innovation and Digital Transformation Sectors",
    status: "Wazi",
    deadlineInfo: "22-24 July 2026",
    url: "https://africatechshow.com",
    category: "Foundation"
  }
];

export const freeFeaturedScholarships: Scholarship[] = [
  {
    id: "sch-chevening",
    title: "Chevening Scholarship (UK)",
    provider: "Serikali ya Uingereza (FCDO)",
    level: "Masters (Mwaka 1)",
    benefits: "Full Funding (Ada zote, ndege, maisha na posho ya kila mwezi)",
    eligibility: "Uzoefu wa kazi miaka 2+, Shahada ya Kwanza, na uwezo wa uongozi",
    status: "Wazi",
    deadlineInfo: "Hufunguliwa Agosti na kufungwa Novemba kila mwaka",
    url: "https://www.chevening.org/apply/",
    category: "Government"
  },
  {
    id: "sch-fulbright",
    title: "Fulbright Foreign Student Program (USA)",
    provider: "Serikali ya Marekani",
    level: "Masters & PhD",
    benefits: "Full Funding (Ada ya chuo yote, tiketi ya ndege, bima na posho ya kujikimu)",
    eligibility: "Walinzi wa elimu, wahadhiri au wataalamu wanaotaka kuleta mabadiliko chanya",
    status: "Mzunguko Umefungwa",
    deadlineInfo: "Maombi huwasilishwa kabla ya Mei kupitia Ubalozi wa Marekani",
    url: "https://tz.usembassy.gov/education-culture/study-usa/fulbright/",
    category: "Government"
  },
  {
    id: "sch-daad",
    title: "DAAD Scholarships (Germany)",
    provider: "German Academic Exchange Service",
    level: "Masters & PhD (Development-Related)",
    benefits: "Full Funding (Posho €934/1200 kwa mwezi, bima, na usafiri wa ndege)",
    eligibility: "Uzoefu wa kazi miaka 2, diploma/degree ya miaka 6 iliyopita au pungufu",
    status: "Wazi",
    deadlineInfo: "Muda hutofautiana kwa kozi ila nyingi ni kati ya Agosti na Oktoba",
    url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    category: "Europe"
  },
  {
    id: "sch-erasmus",
    title: "Erasmus Mundus Joint Masters (EU)",
    provider: "Umoja wa Ulaya (European Union)",
    level: "Masters (Kusoma nchi 2 au zaidi)",
    benefits: "Full Funding (€24,000 kwa mwaka, ada zote, bima, na posho)",
    eligibility: "Mwanafunzi yeyote mwenye ufaulu wa kiwango cha juu cha kitaaluma",
    status: "Wazi",
    deadlineInfo: "Hufunguliwa Oktoba hadi Januari/Februari kila mwaka",
    url: "https://ec.europa.eu/programmes/erasmus-plus/opportunities/individuals/students/erasmus-mundus-joint-master-degrees_en",
    category: "Europe"
  }
];

// Rich Premium scholarships database, representing over 50+ master level sources/platforms combined
export const premiumScholarshipDatabases: PremiumScholarshipDatabase[] = [
  {
    id: "db-1",
    name: "Commonwealth Scholarships (UK)",
    scope: "Ruzuku kamili ya masomo ya Masters/PhD nchini Uingereza",
    countries: "Nchi wanachama wa Commonwealth (ikiwemo Tanzania)",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://cscuk.fcdo.gov.uk/apply/",
    description: "Hutoa fursa za mafunzo na masomo kwa wanafunzi wenye vipaji nchini Tanzania, inayofunika gharama kamili ikiwa ni pamoja na ada na usafiri."
  },
  {
    id: "db-2",
    name: "Mastercard Foundation Scholars Program",
    scope: "Masomo nchini Canada, USA, na vyuo vikuu vikuu vya Afrika",
    countries: "Vijana wa ngazi ya chini kiuchumi wa Afrika",
    type: "Taasisi Binafsi",
    officialUrl: "https://mastercardfdn.org/all/scholars/",
    description: "Inalenga kuendeleza kizazi kijacho cha viongozi barani Afrika. Inafunika gharama zote za masomo na malazi katika vyuo washirika kama McGill, Toronto, nk."
  },
  {
    id: "db-3",
    name: "Swedish Institute Scholarships (SISGP)",
    scope: "Scholarship kamili ya Serikali ya Sweden kwa ajili ya Masters",
    countries: "Tanzania na nchi chache teule za kidemokrasia",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
    description: "Inaleta wataalamu na viongozi kutoka Tanzania kupata ujuzi maalum nchini Sweden. Gharama zote hulipwa pamoja na posho ya kila mwezi."
  },
  {
    id: "db-4",
    name: "MEXT Japanese Government Scholarship",
    scope: "Diploma, Bachelor, Masters na PhD nchini Japan",
    countries: "Dunia nzima kupitia ubalozi wa Japan Tanzania",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://www.tz.emb-japan.go.jp/itpr_en/MEXT_Scholarships_E.html",
    description: "Inaruhusu wanafunzi wa Kitanzania kusoma kwa ufadhili usio na kikomo nchini Japan. Hakuna ada, na inatoa posho nzuri sana."
  },
  {
    id: "db-5",
    name: "Türkiye Bursları Scholarships",
    scope: "Ufadhili mzima wa kiserikali ngazi zote (Bachelor hadi PhD)",
    countries: "Wanafunzi wa Kimataifa (ikiwemo Tanzania)",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://www.turkiyeburslari.gov.tr/",
    description: "Inajumuisha mafunzo ya lugha ya Kituruki kwa mwaka mmoja, ada ya chuo, bima ya afya, tiketi ya ndege, malazi, na posho ya kujikimu kila mwezi."
  },
  {
    id: "db-6",
    name: "Gates Cambridge Scholarship",
    scope: "Ngazi ya Masters & PhD katika Chuo kikuu cha Cambridge",
    countries: "Wanafunzi bora wa kimataifa nje ya UK",
    type: "Ufadhili wa Foundation",
    officialUrl: "https://www.gatescambridge.org/",
    description: "Inadhaminiwa na Bill & Melinda Gates Foundation kwa ajili ya kusoma chuo kikuu bora duniani cha Cambridge nchini Uingereza."
  },
  {
    id: "db-7",
    name: "Struga & Swiss Government Excellence Scholarships",
    scope: "Utafiti, PhD na Postdoc katika vyuo vyote vya Switzerland",
    countries: "Wasomi na wanafunzi wa utafiti kutoka Tanzania",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
    description: "Inalenga watafiti wenye sifa za juu nchini ili wabunifu kwenye mifumo ya teknolojia, sayansi na uchumi nchini Switzerland."
  },
  {
    id: "db-8",
    name: "Russian Government Scholarship Program",
    scope: "Kusoma Urusi kwa ufadhili kamili wa Kiserikali",
    countries: "Kupitia ubalozi wa Urusi au wizara ya elimu nchini",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://studyinrussia.ru/en/actual/scholarships/",
    description: "Inaruhusu wanafunzi wa Tanzania kusoma katika fani za Sayansi, Nyuklia, Uhandisi, na Udaktari nchini Urusi kwa ruzuku ya kiserikali."
  },
  {
    id: "db-9",
    name: "Chinese Government Scholarship (CSC)",
    scope: "Kusoma China kwa ruzuku kamili (Aina A, B, C)",
    countries: "Kupitia Wizara ya Elimu Tanzania (MoEST) au Vyuo vya China",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://www.campuschina.org/",
    description: "Zaidi ya wanafunzi 100 wa Kitanzania hupata scholarship hii kila mwaka kusomea maendeleo ya viwanda, biashara, na teknolojia ya habari nchini China."
  },
  {
    id: "db-10",
    name: "Australia Awards Scholarships",
    scope: "Ufadhili kamili wa masomo ya Masters barani Australia",
    countries: "Wataalamu wa maendeleo wa Kiafrika",
    type: "Ufadhili wa Serikali",
    officialUrl: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    description: "Inalenga sekta kama vile kilimo, usalama wa chakula, afya na ujasiriamali ili kukuza maendeleo endelevu nchini Tanzania."
  }
];

// Success stories slide carousel (Tanzanian Scholars with photos and cities)
export const tanzanianScholars: ScholarshipAlumnus[] = [
  {
    id: "al-neema",
    name: "Neema Kimambo",
    university: "University of Oxford",
    scholarshipName: "Chevening Scholarship",
    course: "MSc in Environmental Change and Management",
    location: "Sasa yupo: Wizara ya Nishati, Dodoma",
    story: "Nilitumia andiko langu kuandaa mapendekezo thabiti ya sera ya nishati safi nchini. FundSeed na mafunzo yao yalinisaidia sana kufanya Statement of Purpose yangu iwe ya kiwango cha juu nikaibuka kidedea kati ya maombi 50,000.",
    year: "Alumni 2024",
    avatarChar: "NK",
    avatarColor: "bg-teal-600 text-white",
    city: "Oxford, Uingereza (UK)",
    image: "/images/scholar_neema_1780944133268.png"
  },
  {
    id: "al-edwin",
    name: "Edwin Mtali",
    university: "Harvard University",
    scholarshipName: "Fulbright Program",
    course: "Master in Public Administration (MPA)",
    location: "Sasa yupo: Mbunifu na Mshauri wa Kiuchumi, Dar",
    story: "Fulbright inatafuta viongozi wasomi wenye ndoto ya juu. Maandalizi ya Essay yalikuwa dhoruba kubwa kwangu lakini kupata miongozo ya kuombea msaada na kuijaribu mifumo ya kidijitali kulinipa uelekeo sahihi na thabiti.",
    year: "Alumni 2023",
    avatarChar: "EM",
    avatarColor: "bg-blue-600 text-white",
    city: "Cambridge, Massachusetts (USA)",
    image: "/images/scholar_edwin_1780944146763.png"
  },
  {
    id: "al-amina",
    name: "Amina Juma",
    university: "Technical University of Munich",
    scholarshipName: "DAAD Scholarship",
    course: "MSc in Sustainable Resource Management",
    location: "Sasa yupo: Mtafiti wa Agro-Forestry, Iringa",
    story: "Udhamini wa DAAD ulitaka uzoefu wa miaka miwili na andiko la utafiti lililonyooka. Zana za kidijitali za kuandika miundo ya miradi ziliniongezea tija kubwa, na kupata vithibitisho vya tovuti rasmi kunazuia ushawishi wa matapeli wa mitandaoni.",
    year: "Alumni 2025",
    avatarChar: "AJ",
    avatarColor: "bg-purple-600 text-white",
    city: "Munich, Ujerumani (Germany)",
    image: "/images/scholar_amina_1780944159515.png"
  },
  {
    id: "al-juma",
    name: "Juma Rashid",
    university: "University of Barcelona & Sorbonne",
    scholarshipName: "Erasmus Mundus Joint Masters",
    course: "Master in Digital Communication and Technology",
    location: "Sasa yupo: Mhandisi Mkuu wa Systems, Dar es Salaam",
    story: "Erasmus Mundus ilinifanya nisongee katika nchi tatu tofauti Ulaya. Nilikuwa miongoni mwa Watanzania wachache sana wanaofahamu fursa hii, naipongeza sana FundSeed Academy kwa kuiweka wazi kwa vijana wa huku.",
    year: "Alumni 2024",
    avatarChar: "JR",
    avatarColor: "bg-indigo-600 text-white",
    city: "Paris & Barcelona, Ulaya",
    image: "/images/scholar_juma_1780944174075.png"
  },
  {
    id: "al-elizabeth",
    name: "Elizabeth Sanga",
    university: "University of Melbourne",
    scholarshipName: "Australia Awards",
    course: "Master of Public Health",
    location: "Sasa yupo: Mtaalamu wa Afya ya Jamii, Mtwara",
    story: "Watu wengi wanadhani Australia ni mbali, lakini Australia Awards inatoa fursa kubwa sana kwa wataalamu wa afya. FundSeed ilinisaidia kuandaa mpango kazi wa utafiti niliouwasilisha kwenye maombi yangu, ambao uliwavutia sana waamuzi wa ufadhili huu.",
    year: "Alumni 2024",
    avatarChar: "ES",
    avatarColor: "bg-amber-600 text-white",
    city: "Melbourne, Australia",
    image: "/images/scholar_elizabeth_1781126855245.png"
  },
  {
    id: "al-ibrahim",
    name: "Ibrahim Mussa",
    university: "University of Tokyo",
    scholarshipName: "MEXT Scholarship",
    course: "MSc in Robotics",
    location: "Sasa yupo: Mhandisi wa Mifumo, Arusha",
    story: "Kusoma teknolojia ya roboti katika moja ya maabara bora duniani ilikuwa ndoto yangu. Mchakato wa MEXT ni mrefu na mgumu kwa sababu unahusisha mitihani ya lugha na usaili, lakini mwongozo wa hatua kwa hatua wa FundSeed ulinisaidia sana kufanya maandalizi ya kila hatua bila kusahau chochote.",
    year: "Alumni 2023",
    avatarChar: "IM",
    avatarColor: "bg-red-600 text-white",
    city: "Tokyo, Japan",
    image: "/images/scholar_ibrahim_1781126870423.png"
  }
];

export const scholarshipBenefits: Benefit[] = [
  {
    id: "b-1",
    title: "Gharama Zote Kulipwa (Sifuri Deni)",
    description: "Tofauti na mikopo ya bodi ya mikopo (HESLB) au ile ya benki, scholarship hizi zinalipa ada zote (tuition fees) na huna haja ya kurudisha hata senti moja baada ya kukamilisha masomo yako."
  },
  {
    id: "b-2",
    title: "Mshahara/Posho ya Kujikimu kila mwezi",
    description: "Utapokea posho ya kila mwezi (stipend) kuanzia TZS milioni 2.5 hadi milioni 4 ili kukidhi gharama za chakula, kodi ya nyumba, bindi na usafiri binafsi, hivyo unaweza kujikita masomoni pekee."
  },
  {
    id: "b-3",
    title: "Bima kamili na usafiri wa Ndege",
    description: "Tiketi za ndege kwenda na kurudi pamoja na bima thabiti ya matibabu wakati wote wa masomo yako hulipiwa na wafadhili au serikali husika mara unapothibitishwa."
  },
  {
    id: "b-4",
    title: "Mtandao wa Dunia (Global Networking)",
    description: "Kusoma katika vyuo vikuu vikuu ulimwenguni kunaweka njia yako sawa na wasomi, wabunifu na makampuni makubwa duniani ambayo yatahitaji vipawa vyako ufungue miradi mipya thabiti."
  }
];
