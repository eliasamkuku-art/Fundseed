// Localization database for FundSeed in Swahili and English
// This supports a bilingual, standard-grade financial and academic portal.

import { Opportunity, Testimonial } from './types';

export interface TranslationDict {
  [key: string]: {
    sw: string;
    en: string;
  };
}

export const uiTranslations: TranslationDict = {
  // Navigation & Branding
  brandName: {
    sw: "FundSeed",
    en: "FundSeed"
  },
  slogan: {
    sw: "Ufadhili na AI",
    en: "Funding & AI"
  },
  navHome: {
    sw: "Nyumbani",
    en: "Home"
  },
  navGrants: {
    sw: "Ruzuku na Mikopo",
    en: "Grants & Loans"
  },
  navScholarships: {
    sw: "Fursa za Masomo",
    en: "Scholarships Hub"
  },
  navMentorship: {
    sw: "Mentorship na Uunganishi",
    en: "Mentorship & Network"
  },
  navDashboard: {
    sw: "Smart-Draft AI",
    en: "Smart-Draft AI"
  },
  navMembership: {
    sw: "Akaunti Yangu",
    en: "My Account"
  },
  navAdmin: {
    sw: "Msimamizi",
    en: "Admin Portal"
  },
  btnActivateVIP: {
    sw: "Onyesha VIP",
    en: "Unlock VIP"
  },
  vipBadge: {
    sw: "Mwanachama VIP",
    en: "VIP Member"
  },

  // Hero Section
  heroPreTitle: {
    sw: "UWEZESHAJI WA KIBIASHARA NA KITAALUMA",
    en: "EMPOWERING BUSINESSES & ACADEMICS"
  },
  heroTitleRow1: {
    sw: "Msaidizi wa AI kwa Mipango",
    en: "AI Assistant for Smart Plans"
  },
  heroTitleRow2: {
    sw: "ya Maendeleo na Ruzuku",
    en: "& Development Funding"
  },
  heroDesc: {
    sw: "FundSeed inawawezesha wajasiriamali na wasomi nchini Tanzania kuandaa Mipango ya Biashara ya kitaalamu, andiko la Pitch Deck la kishindo, na kupata database ya ruzuku zaidi ya 50 zilizothibitishwa kwa sekunde chache.",
    en: "FundSeed empowers entrepreneurs and scholars in Tanzania to draft expert Business Plans, compelling Pitch Decks, and access a database of 50+ verified local and global grants in seconds."
  },
  heroCTAWrite: {
    sw: "Msaidizi wa Smart-Draft AI",
    en: "Smart-Draft AI Assistant"
  },
  heroCTAGrants: {
    sw: "Database ya Ruzuku",
    en: "Explore Grants Database"
  },
  heroHeroBadge: {
    sw: "Imesajiliwa na Kudhinishwa Tanzania",
    en: "Registered and Approved in Tanzania"
  },

  // Portal Cards
  portalHeadingPre: {
    sw: "HUDUMA ZETU",
    en: "OUR SERVICES"
  },
  portalHeadingTitle: {
    sw: "Mifumo ya Kitaalamu ya FundSeed",
    en: "Professional Systems of FundSeed"
  },
  portalHeadingDesc: {
    sw: "Tumeigawa FundSeed katika mifumo thabiti kukusaidia kupata ruzuku, kufanya maombi kwa mafanikio, na kuandaa maelezo ya kitaalamu ya mradi wako.",
    en: "We partitioned FundSeed into robust modules to help you secure funding, apply successfully, and construct expert project portfolios."
  },
  portalCard1Title: {
    sw: "Mkusanyiko wa Ruzuku (Business Grants)",
    en: "Business Grants & Funding"
  },
  portalCard1Desc: {
    sw: "Database ya fursa mpya 50+ za ruzuku, mikopo yenye dhamana, na incubator zilizothibitishwa nchini Tanzania kama SIDO, TADB, na Tony Elumelu.",
    en: "Database of 50+ vetted grants, guaranteed loans, and verified incubators in Tanzania, such as SIDO, TADB, and Tony Elumelu programs."
  },
  portalCard1Btn: {
    sw: "Fungua Grants Database",
    en: "Access Grants Database"
  },
  portalCard2Title: {
    sw: "Fursa za Masomo (Scholarships Hub)",
    en: "Scholarships & Academic Hub"
  },
  portalCard2Desc: {
    sw: "Udhamini kamili wa masomo nje ya nchi. Inajumuisha miongozo na zana ya kuandaa barua za Statement of Purpose ya ushindi.",
    en: "Fully-funded international scholarships. Includes guidebooks and tools to draft winning Statement of Purpose documents."
  },
  portalCard2Btn: {
    sw: "Fungua Scholarships Hub",
    en: "Access Scholarships Hub"
  },
  portalCard3Title: {
    sw: "Smart-Draft AI Workspace",
    en: "Smart-Draft AI Workspace"
  },
  portalCard3Desc: {
    sw: "Zana ya AI inayokuandalia mchanganuo kamili wa Business Plan au Pitch Deck kwa weledi wa hali ya juu ya kiuchumi na soko nchini Tanzania.",
    en: "An AI tool that writes comprehensive Business Plans or investor-grade Pitch Decks optimized for Tanzanian market realities."
  },
  portalCard3Btn: {
    sw: "Ingia AI Dashboard",
    en: "Enter AI Workspace"
  },

  // Problem & Solution
  problemLabel: {
    sw: "MCHANGANUO WA HALI HALISI",
    en: "REALISTIC ASSESSMENT"
  },
  problemTitle: {
    sw: "Mbona Miradi Mingi Haiufadhiliwi nchini Tanzania?",
    en: "Why Do Most Tanzanian Projects Fail to Secure Funding?"
  },
  problemDesc1: {
    sw: "Wajasiriamali na wasomi wenye vipaji nchini wanakosa mitaji sio kwa sababu ya kukosa mawazo mazuri, bali kutokana na kutojua namna ya kuwasilisha mawazo yao kiweledi.",
    en: "Talented entrepreneurs and scholars miss out on capital not due to poor ideas, but because they struggle to present them professionally."
  },
  problemPoint1Title: {
    sw: "Ukosefu wa Mipango Rasmi ya Biashara",
    en: "Lack of Official Business Plans"
  },
  problemPoint1Desc: {
    sw: "Mabenki na wafadhili wa nje wanahitaji makadirio thabiti ya kifedha na soko ambayo wajasiriamali wadogo wanashindwa kuandika.",
    en: "Banks and global donors require concrete financial and market projections that small business owners struggle to draft."
  },
  problemPoint2Title: {
    sw: "Kutokujua Fursa Halisi",
    en: "Information Asymmetry on Opportunities"
  },
  problemPoint2Desc: {
    sw: "Ruzuku nyingi maalum za kilimo, mazingira na teknolojia zinapitishwa bila taarifa kuwafikia washiriki stahiki vijijini na mijini.",
    en: "Many specialized grants in agriculture, climate, and technology close without matching qualified applicants in rural cities."
  },
  problemPoint3Title: {
    sw: "Vikwazo Katika Maandishi ya Masomo",
    en: "Academic Writing Barriers"
  },
  problemPoint3Desc: {
    sw: "Kuandika barua bora ya maombi ya udhamini na malengo (SOP/LOR) inahitaji miongozo ya utawala ambayo wasomi wengi hawaipati.",
    en: "Crafting exceptional personal statements (SOPs/LORs) requires strategic structure that many local applicants lack access to."
  },
  solutionTitle: {
    sw: "Suluhisho letu kamilifu",
    en: "Our Integrated Solution"
  },
  solutionDesc: {
    sw: "FundSeed inakupa weledi wa miaka kumi wa mwandishi wa miradi kwenye kiganja chako. Tunapunguza muda wa uandishi kutoka wiki mbili hadi sekunde chache.",
    en: "FundSeed puts a decade of professional grant writing experience into your palms. We shrink development times from two weeks to under 30 seconds."
  },

  // How It Works
  howPre: {
    sw: "NJIA RAHISI",
    en: "SIMPLE METHOD"
  },
  howTitle: {
    sw: "Hatua nne za kupata Mafanikio",
    en: "Four Steps to Success"
  },
  howStep1Title: {
    sw: "1. Chagua Mfumo Wako",
    en: "1. Select Your Module"
  },
  howStep1Desc: {
    sw: "Vinjari mikusanyiko ya ruzuku za Tanzania au fursa za masomo ya sasa hivi kulingana na mahitaji yako.",
    en: "Browse Tanzanian grant directories or scholarship catalogs tailored specifically to your needs."
  },
  howStep2Title: {
    sw: "2. Jaza Profaili ya Mtaji",
    en: "2. Provide Project Parameters"
  },
  howStep2Desc: {
    sw: "Jibu maswali machache mepesi kuhusu jina la kampuni au malengo ya masomo unayotarajia kusomea.",
    en: "Answer simple prompts about your company name, industry, or your chosen academic goals."
  },
  howStep3Title: {
    sw: "3. Smart-Draft AI Kuzalisha",
    en: "3. AI Generates Instantly"
  },
  howStep3Desc: {
    sw: "Mfumo wa kisasa wa Gemini AI utatengeneza andiko kamili lenye muundo rasmi wa kibenki na kifedha nchini.",
    en: "Our Gemini AI model outputs a comprehensive document structured according to standard banking and donor formulas."
  },
  howStep4Title: {
    sw: "4. Wasilisha kwa Ujasiri",
    en: "4. Submit with Confidence"
  },
  howStep4Desc: {
    sw: "Nakili, pakua, au chapa andiko lako la kitaalamu na uwasilishe kwenye vyombo vya ruzuku au vyuo husika.",
    en: "Copy or export your customized proposal and submit it confidently to target donors or universities."
  },

  // Interactive AI Dashboard Workspace
  dashboardTitle: {
    sw: "Smart-Draft AI Co-Pilot",
    en: "Smart-Draft AI Co-Pilot"
  },
  dashboardSub: {
    sw: "Zana ya kisasa inayokuandalia mipango ya biashara na mawasilisho ya mradi kwa Kiswahili na Kiingereza",
    en: "State-of-the-art interface generating business plans and investor pitch scripts in Swahili and English"
  },
  tabBusinessPlan: {
    sw: "Mpango wa Biashara (Business Plan)",
    en: "Business Plan Builder"
  },
  tabPitchDeck: {
    sw: "Andiko la Pitch-Deck",
    en: "Pitch-Deck Scriptwriter"
  },
  formInputTitle: {
    sw: "Ingiza Taarifa za mradi",
    en: "Project Input Parameters"
  },
  formPreInputDesc: {
    sw: "Taarifa hizi zitatumika na AI yetu kusanifu andiko la kitaalamu la kibiashara nchini Tanzania.",
    en: "These metrics are utilized by our model to draft a contextually relevant corporate dossier."
  },
  lblBusinessName: {
    sw: "Jina la Biashara / Mradi",
    en: "Business or Project Name"
  },
  plhBusinessName: {
    sw: "Mfan: Salama Organic Poultry",
    en: "e.g., Salama Organic Poultry"
  },
  lblIndustry: {
    sw: "Sekta / Aina ya Uzalishaji",
    en: "Industry / Economic sector"
  },
  plhIndustry: {
    sw: "Mfan: Kilimo na Ufugaji",
    en: "e.g., Kilimo na Ufugaji"
  },
  lblProblem: {
    sw: "Tatizo la wateja unalotatua",
    en: "Customer Problem You Solve"
  },
  plhProblem: {
    sw: "Mfan: Ukosefu wa kuku salama wa kienyeji na mayai ya uhakika yasiyo na kemikali katika wilaya ya Kigamboni",
    en: "e.g., Shortage of affordable, organic fertilizer or long distances to access veterinary laboratory testing"
  },
  lblSolution: {
    sw: "Suluhisho lako (Linalotolewa na mradi wako)",
    en: "Your Unique Solution"
  },
  plhSolution: {
    sw: "Mfan: Kuanzisha mradi wa kisasa wa kuzalisha, kusindika, na kusambaza kuku wa kienyeji na mayai asilia nchini.",
    en: "e.g., Producing processed eco-compost delivered directly to smallholders using custom transport services"
  },
  lblTargetCustomers: {
    sw: "Wateja walengwa au Soko lako",
    en: "Target Market / Ideal Customers"
  },
  plhTargetCustomers: {
    sw: "Mfan: Hoteli, migahawa ya kiwango cha juu, na mama lishe nchini Kigamboni na Temeke.",
    en: "e.g., Smallholder farmers in Mwanza and Shinyanga regions"
  },
  lblBudget: {
    sw: "Gharama au Mtaji unaohitajika",
    en: "Estimated Startup Capital / Budget"
  },
  plhBudget: {
    sw: "Mfan: Milioni 15 TZS",
    en: "e.g., Milioni 15 TZS"
  },
  lblStartupName: {
    sw: "Jina la Startup Yako",
    en: "Your Startup Name"
  },
  btnGenerateDraft: {
    sw: "Andaa Andiko Lako na AI Sasa",
    en: "Generate with AI Now"
  },
  btnGeneratePlan: {
    sw: "Tengeneza Mpango wa Biashara sasa hivi",
    en: "Generate Business Plan Now"
  },
  btnGenerating: {
    sw: "Inachakata na kuandaa na AI...",
    en: "Processing and Drafting with AI..."
  },

  // Pitch Deck Specific Inputs
  lblPitchStartup: {
    sw: "Jina la Startup au mradi",
    en: "Startup or Venture Name"
  },
  lblPitchMarketSize: {
    sw: "Ukubwa wa soko / Wigo wa kukua",
    en: "Estimated Market Size"
  },
  plhPitchMarketSize: {
    sw: "Mfan: Wakulima wadogo zaidi ya 30,000 Lushoto na soko la mazao safi la TZS Bilioni 2.5 kwa mwaka Dar es Salaam.",
    en: "e.g., Two hundred thousand households in Dar es Salaam requiring utility services"
  },
  lblPitchModel: {
    sw: "Mfumo wa mapato (Business Model)",
    en: "Revenue Model"
  },
  plhPitchModel: {
    sw: "Mfan: Tutapokea asilimia 12 ya kila mauzo ya mazao yanayosafirishwa kupitia mtandao wetu.",
    en: "e.g., Direct sales plus subscription-based farm advisory programs"
  },
  lblPitchFunding: {
    sw: "Mtaji unaoombwa kutoka kwa Wawekezaji/Wafadhili",
    en: "Target Funding Requested from Stakeholders"
  },
  plhPitchFunding: {
    sw: "Mfan: Milioni 30 TZS",
    en: "e.g., Milioni 30 TZS"
  },
  btnGeneratePitch: {
    sw: "Tengeneza Pitch-Deck Script sasa hivi",
    en: "Generate Investor Pitch Script"
  },

  // Output display panel
  panelOutputTitle: {
    sw: "Hati Yako Iliyotayarishwa na AI",
    en: "Your Customized AI Document"
  },
  panelOutputDesc: {
    sw: "Hapa kuna andiko lako la kitaalamu la kibiashara. Unaweza kunakili au kulisave kwenye account yako ya VIP.",
    en: "Here is your professional venture document. You can copy the contents or save it directly to your VIP profile."
  },
  btnCopy: {
    sw: "Copy Andishi",
    en: "Copy Text"
  },
  btnCopied: {
    sw: "Imenakiliwa!",
    en: "Copied!"
  },
  btnSaveToProfile: {
    sw: "Save Kwenye Akaunti Yako",
    en: "Save to My Profile"
  },
  btnSavedToProfile: {
    sw: "Imewekwa Kwenye Akaunti!",
    en: "Saved successfully!"
  },

  // Opportunities / Grants Database Section
  grantsTitle: {
    sw: "Database ya Ruzuku na Mikopo ya Tanzania",
    en: "Tanzania Corporate Grants & Loans Database"
  },
  grantsSub: {
    sw: "Mkusanyiko wa fursa mpya zilizothibitishwa za ruzuku (Grants), mikopo na incubator za kibiashara",
    en: "Vetted index of commercial opportunities, active grants, financial loans, and regional incubators"
  },
  filterSearchPlh: {
    sw: "Tafuta ruzuku za TADB, SIDO, Tony Elumelu, MasterCard au neno lolote...",
    en: "Search database for SIDO, TADB, Tony Elumelu, MasterCard or any keyword..."
  },
  filterCategory: {
    sw: "Aina ya Fursa",
    en: "Category"
  },
  filterOrigin: {
    sw: "Chujio la Maeneo",
    en: "Geographic Origin"
  },
  optAll: {
    sw: "Zote",
    en: "All Categories"
  },
  optGrants: {
    sw: "Ruzuku pekee (Grants)",
    en: "Grants Only"
  },
  optLoans: {
    sw: "Mikopo yenye masharti nafuu",
    en: "Concessional Loans"
  },
  optEquity: {
    sw: "Mitaji ya Uwekezaji (Equity)",
    en: "Equity Investments"
  },
  optIncubators: {
    sw: "Incubator na Accelerators",
    en: "Incubators & Accelerators"
  },
  originAll: {
    sw: "Maeneo Yote",
    en: "All Locations"
  },
  originTz: {
    sw: "Zilizo nchini Tanzania tu",
    en: "Tanzania Domestic Only"
  },
  originGlobal: {
    sw: "Zinazofadhiliwa Duniani",
    en: "Global Funding Partners"
  },
  loadingText: {
    sw: "Inatafuta kwenye hifadhidata yetu...",
    en: "Querying historical database..."
  },
  grantsFoundCount: {
    sw: "Fursa zilizopatikana kwenye database",
    en: "Vetted programs identified in database"
  },
  cardProvider: {
    sw: "Mtoa Fursa",
    en: "Issuer"
  },
  cardAmount: {
    sw: "Kiasi",
    en: "Funding Amount"
  },
  cardOrigin: {
    sw: "Eneo la Mfuko",
    en: "Region"
  },
  cardDeadline: {
    sw: "Mwisho wa Maombi",
    en: "Deadline"
  },
  cardEligibility: {
    sw: "Sifa za Mwombaji",
    en: "Key Eligibility Guidelines"
  },
  cardBtnApply: {
    sw: "Tazama Tovuti Rasmi ya Apply",
    en: "Access Official Application Link"
  },
  premiumLockAlert: {
    sw: "Fungua Database kamili ili uone ruzuku zingine 45+ zilizofichwa za Tanzania za sasa hivi.",
    en: "Unlock our extended VIP database to expose 45+ private active grants and loans in Tanzania."
  },
  premiumUnlockBtn: {
    sw: "Boresha Kuwa VIP (Kupata Kamili)",
    en: "Upgrade to VIP (Full Access)"
  },

  // Checkout / Payment Section
  pricingPre: {
    sw: "BEI NA VIWANGO VYA CHINI",
    en: "MEMBERSHIP FEE AND RATES"
  },
  pricingTitle: {
    sw: "Fungua Mifumo Yote ya Kibiashara",
    en: "Unlock Complete Venture Suite"
  },
  pricingDesc: {
    sw: "Malipo ya mara moja tu ya TZS 20,000. Hakuna makato ya mwezi, hakuna gharama za siri. Uanachama wa maisha.",
    en: "One-time registration of 20,000 TZS. No recurring invoices, no monthly fees. Lifetime professional access."
  },
  priceValue: {
    sw: "20,000 TZS",
    en: "20,000 TZS"
  },
  priceSubtitle: {
    sw: "Uanachama wa Maisha (One-time payment)",
    en: "Lifetime VIP Access (One-time payment)"
  },
  pricingFeature1: {
    sw: "Matumizi yasiyo na kikomo ya Smart-Draft AI",
    en: "Unlimited generational runs of Smart-Draft AI"
  },
  pricingFeature2: {
    sw: "Database kamili ya ruzuku 50+ zilizothibitishwa nchini",
    en: "Expose 50+ active regional grants, loans, and fellowships"
  },
  pricingFeature3: {
    sw: "Scholarships Success Kit",
    en: "SOP and CV checklists & matching tools"
  },
  pricingFeature4: {
    sw: "Kuokoa maandishi, pitch-deck, na mipango yote kwenye akaunti",
    en: "Save and reload drafts on your private secure dashboard"
  },
  pricingFeature5: {
    sw: "Ushauri wa bure wa maombi ya ruzuku na timu ya FundSeed",
    en: "Direct consultations on complex application criteria"
  },
  paymentGuideTitle: {
    sw: "Malipo kwa Njia ya Mitandaoni ya Simu (Tanzania)",
    en: "Tanzanian Mobile Network Payment Guides"
  },
  paymentGuideDesc: {
    sw: "Fuata maelekezo ya kulipa kupitia Halopesa, Mixx by Yas, Airtel Money, au M-Pesa kujiandikisha kujiunga mara moja.",
    en: "Consult payment methods: Halopesa, Mixx by Yas, Airtel Money, or M-Pesa for immediate activation."
  },
  paymentStep1Title: {
    sw: "1. Tuma Malipo",
    en: "1. Process Mobile Money"
  },
  paymentStep1Desc: {
    sw: "Tuma kiasi cha TZS 20,000 kwenda kwa Namba ya Lipa: VODA LIPA NAMBA 543912 (FundSeed Corporate) au bonyeza carrier hapa chini kuona namba zingine.",
    en: "Transfer exactly 20,000 TZS to Vodacom Till/Lipa: 543912 (FundSeed Corporate) or click other providers below."
  },
  paymentStep2Title: {
    sw: "2. Weka Namba ya Simu & Muamala",
    en: "2. Input Phone & Transaction Code"
  },
  paymentStep3Title: {
    sw: "3. Thibitisha Akaunti Yako VIP",
    en: "3. Verify VIP Membership Credentials"
  },
  lblPhone: {
    sw: "Namba ya Simu ya Malipo",
    en: "Payer Mobile Number"
  },
  lblTxId: {
    sw: "Namba ya Muamala (Transaction ID)",
    en: "Transaction Reference ID"
  },
  plhTxId: {
    sw: "Mfan: MP482L941X au TG0482K1...",
    en: "e.g., MP482L941X or TG0482K1..."
  },
  lblFullNameCheckout: {
    sw: "Jina Lako Kamili",
    en: "Your Full Name"
  },
  lblEmailCheckout: {
    sw: "Barua Pepe (Email Address)",
    en: "Secure Email Address"
  },
  btnSubmitPayment: {
    sw: "Wasilisha & Amilisha Akaunti VIP",
    en: "Submit & Activate VIP Access"
  },
  btnVerifyingPayment: {
    sw: "Inahakiki Muamala na Mitandao ya Simu...",
    en: "Resolving reference ID with network logs..."
  },
  pmtSuccessAlert: {
    sw: "Muamala wako umethibitishwa kwa mafanikio. Karibu FundSeed Premium. Sasa una akaunti thabiti ya VIP!",
    en: "Success! Payer record verified. Welcome to FundSeed Premium. Your lifetime VIP profile is now fully active!"
  },

  // Authentification & Dual Dashboard Flow
  authLoginTitle: {
    sw: "Ingia / Jisajili Kwenye Akaunti Yako",
    en: "VIP Portal Registration & Login"
  },
  authLoginDesc: {
    sw: "Ingia hapa kuona maandishi yako yote uliyotengeneza na kuhifadhi, au jisajili muamala wako mpya uliolipia.",
    en: "Sign in here to recover your compiled dossier portfolio or connect your recent activation reference."
  },
  btnLogin: {
    sw: "Ingia Kwenye Jukwaa",
    en: "Authenticate Credentials"
  },
  btnSignout: {
    sw: "Ondoka Kwenye Mfumo",
    en: "Sign Out"
  },
  userWelcomeTitle: {
    sw: "Habari Ndugu",
    en: "Greetings,"
  },
  userWelcomeSub: {
    sw: "Karibu kwenye maktaba yako ya VIP. Hapa unaweza kupitia na kupakua mipango yako ya mradi.",
    en: "Welcome to your premium VIP dossier. Modify, print, or download your constructed templates below."
  },
  dashboardStatusVIP: {
    sw: "Uanachama: VIP Portfolio",
    en: "Account Type: VIP Portfolio"
  },
  dashboardStatusFree: {
    sw: "Uanachama: Maonyesho tu (Lipia kuona VIP)",
    en: "Account Type: Basic (Awaiting Upgrades)"
  },
  userSavedDraftsTitle: {
    sw: "Maandiko Yangu Yaliyohifadhiwa",
    en: "Your Compiled Document Portfolio"
  },
  userSavedDraftsDesc: {
    sw: "Hapa yanaonekana andiko lolote la Business Plan au Pitch Deck ambalo umewahi kulizaa na kulisave kupitia AI yetu ya Smart-Draft.",
    en: "Drafts generated by our smart system, saved to your account memory."
  },
  tblDraftName: {
    sw: "Jina la Mradi",
    en: "Venture Name"
  },
  tblDraftType: {
    sw: "Aina",
    en: "Type"
  },
  tblDraftDate: {
    sw: "Tarehe ya Kutengeneza",
    en: "Date Generated"
  },
  tblActions: {
    sw: "Hatua Maalum",
    en: "Actions"
  },
  btnViewDraft: {
    sw: "Tazama/Soma Andiko",
    en: "Review Blueprint"
  },
  btnDeleteDraft: {
    sw: "Futa",
    en: "Delete"
  },
  noDraftsMessage: {
    sw: "Bado hujaokoa andiko lolote. Nenda kwenye zana yetu ya Smart-Draft AI kuanza uandishi sasa!",
    en: "No documents committed to memory yet. Launch Smart-Draft AI to populate your enterprise portfolio."
  },
  vipCoursesTitle: {
    sw: "FundSeed Academy VIP Courses",
    en: "FundSeed Academy VIP Masterclasses"
  },
  vipCoursesDesc: {
    sw: "Masomo ya video na makabrasha ya kusoma mbinu za kushinda ruzuku za kimataifa, yaliyotayarishwa na Adamu Kafuruma sasa yanapatikana hapa:",
    en: "Audio blueprints and instructional materials created by Adamu Kafuruma on securing international financing:"
  },
  course1Title: {
    sw: "Siri ya Kushinda Maombi ya USADF na Tony Elumelu",
    en: "Mastering USADF and TEF Application Guidelines"
  },
  course1Desc: {
    sw: "Jifunze maneno sahihi ya kutumia tanzania tangu sekunde ya kwanza uandapo barua bila kukosa.",
    en: "A structured look into drafting narrative frameworks that immediately register with evaluators."
  },
  course2Title: {
    sw: "Uchambuzi wa Kiuchumi na Bajeti ya Mipango",
    en: "Financial Forecasting & Regional Economic Modeling"
  },
  course2Desc: {
    sw: "Jinsi ya kutengeneza spreadsheet ya kifedha inayoeleweka mbele ya maafisa uhasibu.",
    en: "Constructing balance sheets and cash flows suited for credit officers in regional hubs."
  },

  // Adamu Kafuruma Admin Dashboard translations
  adminStatsUsers: {
    sw: "Jumla ya Watumiaji",
    en: "Total Users"
  },
  adminStatsVIP: {
    sw: "Watumiaji wa VIP",
    en: "VIP Subscribers"
  },
  adminStatsRevenue: {
    sw: "Mapato Makisio",
    en: "Est. Revenue (TZS)"
  },
  adminStatsConversion: {
    sw: "Kiwango cha Conversion",
    en: "Conversion Rate"
  },
  adminWelcomeTitle: {
    sw: "Mkuu, Karibu Kwenye Admin Portal ya FundSeed!",
    en: "Welcome, Administrator Adamu Kafuruma!"
  },
  adminWelcomeSub: {
    sw: "Msaidizi halali wa kufuatilia mapato yote ya mradi wako, wasifu wa watumiaji, na kumbukumbu za malipo nchini Tanzania.",
    en: "Your core system dashboard to track sales metrics, review customer enrollments, and approve pending transactions."
  },
  adminMetricUsers: {
    sw: "Watumiaji Wote",
    en: "Total Registrations"
  },
  adminMetricVIP: {
    sw: "Wanachama Walipiaji (VIP)",
    en: "Paid Subscriptions"
  },
  adminMetricRevenue: {
    sw: "Jumla ya Mapato",
    en: "Total Registered Revenue"
  },
  adminMetricConversion: {
    sw: "Kiwango cha Kujiunga",
    en: "Conversion Rate"
  },
  adminSectionUsersList: {
    sw: "Database ya Wasifu wa Vijana & Malipo yao",
    en: "Client Registry & Activation Vault"
  },
  adminSectionAddGrant: {
    sw: "Ongeza Ruzuku au Fursa Mpya Kwenye Database",
    en: "Publish New Opportunity and Broadcast to Database"
  },
  statusVerified: {
    sw: "Imethibitishwa VIP",
    en: "Verified VIP Partner"
  },
  statusPending: {
    sw: "Muamala unahakikiwa",
    en: "Awaiting Verification"
  },
  btnActivateUser: {
    sw: "Thibitisha / Amilisha",
    en: "Activate Account"
  },
  btnDemoteUser: {
    sw: "Rudisha Bure",
    en: "Demote to Basic"
  },
  formAddGrantTitle: {
    sw: "Kichwa cha Ruzuku / Udhamini",
    en: "Program Title"
  },
  formAddGrantProvider: {
    sw: "Mtoa Mfumo / Kampuni",
    en: "Funding Provider"
  },
  formAddGrantAmount: {
    sw: "Kiasi kinachofadhiliwa",
    en: "Funding Amount"
  },
  formAddGrantCategory: {
    sw: "Aina ya Msaada",
    en: "Opportunity Classification"
  },
  formAddGrantDesc: {
    sw: "Maelezo mafupi ya sifa na mradi",
    en: "Short description of objectives"
  },
  formAddGrantBtn: {
    sw: "Chapisha Kwenye Hifadhi Data Sasa",
    en: "Commit to Live Database Index"
  },
  adminLoggedDraftsTitle: {
    sw: "Kumbukumbu za Mipango Iliyotengenezwa na Vijana",
    en: "Client Generative Log Analysis"
  },
  adminLoggedDraftsDesc: {
    sw: "Hapa Adamu unaweza kuona kile ambacho watumiaji wako wanakizalisha kwa sasa kwenye andiko lao ili kuelewa sekta zinazovutia mitaji kwa wingi nchini.",
    en: "Expose real-time data on emerging economic sectors being explored by regional clients."
  }
};

// Vetted Opportunity Translations
export function getTranslatedOpportunities(opportunities: Opportunity[], lang: 'sw' | 'en'): Opportunity[] {
  if (lang === 'sw') {
    // Return original and clean off any emojis in titles/deadlines
    return opportunities.map(opp => ({
      ...opp,
      title: opp.title.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, ''),
      deadline: opp.deadline.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    }));
  }

  const translations: Record<string, { title: string; provider: string; amount: string; description: string; eligibility: string[]; deadline: string }> = {
    'opp-costech-crdb-loan': {
      title: 'COSTECH NFAST & CRDB Bank Foundation Credit Window',
      provider: 'COSTECH / NFAST & CRDB Bank Foundation',
      amount: '10 Million - Up to 500 Million TZS (Commercialization Loans & Overdrafts)',
      description: 'Special credit window managed by COSTECH (NFAST) in partnership with CRDB Bank Foundation to de-risk and enable Tanzanian innovative startups to acquire commercial capital for scaling and market entry.',
      eligibility: [
        'Locally registered business entity in Tanzania, majority owned by Tanzanian citizens',
        'Has a Minimum Viable Product (MVP) or Product-Market Fit (PMF) product',
        'Viable business dealing with production, processing, value addition, or technology development',
        'Can offer any enforceable collateral including personal guarantee or third-party guarantee',
        'Must possess a positive credit score and demonstrated financial traction'
      ],
      deadline: 'Applications Open (Starts May 5th, 2025)'
    },
    'opp-tra-innovation': {
      title: 'TRA Innovation Portal Challenge (Mbunifu Jiamulie Mambo)',
      provider: 'Tanzania Revenue Authority (TRA)',
      amount: 'Awards Up to 50 Million TZS (Innovation Grant & Integration opportunity)',
      description: 'An open invitation for Tanzanian innovators to submit ideas and products that streamline tax administration, broaden the tax base, simplify compliance for small businesses, or leverage cutting-edge tech such as AI and Blockchain for TRA integration.',
      eligibility: [
        'Tanzanian individual innovators, system developers, tech generalists, or early startups',
        'Solutions targeting: tax base widening, small business tax simplification, digital tax channels, or revenue collection cost reduction',
        'Use of advanced technologies (AI, Big Data, Blockchain) in modern tax administration and dispute resolution',
        'Aiming to make tax services faster, more transparent, and highly reliable'
      ],
      deadline: 'Ongoing Applications'
    },
    'opp-1': {
      title: 'Tony Elumelu Foundation (TEF) Entrepreneurship Programme',
      provider: 'Tony Elumelu Foundation',
      amount: '$5,000 (Seed Grant Capital)',
      description: 'The largest entrepreneurship program in Africa offering seed funding, business mentorship, and structural training for aspiring youth with high-impact business ideas.',
      eligibility: ['Feasible business idea or venture under 3 years old', 'Citizen of any African nation', 'At least 18 years of age'],
      deadline: 'March 31st annually'
    },
    'opp-2': {
      title: 'Tanzania Agricultural Development Bank (TADB) - Youth & Women Portfolios',
      provider: 'Tanzania Agricultural Development Bank',
      amount: '5 Million - 50 Million TZS (Guarantees & Concessional Loans)',
      description: 'Affordable credit products and low-interest loans for Tanzanian enterprises and groups operating in agricultural production, livestock raising, and food processing.',
      eligibility: ['Small and Medium-sized Enterprises (SMEs)', 'Action in farming, aquaculture, or post-harvest processing', 'Duly registered in Tanzania'],
      deadline: 'Ongoing Enrollment'
    },
    'opp-3': {
      title: 'COSTECH Support and Development Grants',
      provider: 'Tanzania Commission for Science and Technology',
      amount: '10 Million - 30 Million TZS (Fully Funded)',
      description: 'Capital disbursement from the Tanzanian government supporting high-growth tech innovations and scientific designs solving tangible local issues.',
      eligibility: ['Researchers or startups with validated physical prototypes', 'Affiliation with COSTECH or SIDO incubators', 'Socio-economic impact potential'],
      deadline: 'October 15th, 2026'
    },
    'opp-4': {
      title: 'Mastercard Foundation - Young Africa Works',
      provider: 'Mastercard Foundation',
      amount: 'Up to $25,000 (Disbursements & Advisory)',
      description: 'Corporate partnership visant to create dignifying employment opportunities for young men and women via financial grants and market development workflows.',
      eligibility: ['Youth or female-led enterprises in Tanzania', 'Ability to scale payroll and employ local labor', 'Auditable bookkeeping records'],
      deadline: 'November 30th, 2026'
    },
    'opp-5': {
      title: 'Anzisha Prize for African Youth',
      provider: 'African Leadership Academy & Mastercard',
      amount: '$2,500 to $25,000 (Awards & Seed Funding)',
      description: 'A prestigious business prize celebrating young founders under 22 who have established active, employing commercial ventures in their home countries.',
      eligibility: ['Youth between 15 and 22 years of age', 'Founder of a functioning business with payroll', 'Proven leadership character'],
      deadline: 'July 15th, 2026'
    },
    'opp-6': {
      title: 'PASS Trust Agricultural Guarantees',
      provider: 'Private Agricultural Sector Support',
      amount: 'Up to 60% Corporate Bank Credit Guarantees',
      description: 'Guarantees backing commercial bank loans (CRDB, NMB, NBC) for modern agrientrepreneurs lacking collateral but possessing feasible models.',
      eligibility: ['Individual farmers, groups, or agri-corporates', 'Commercial viability of proposed project', 'Internal credit appraisal by PASS Trust officers'],
      deadline: 'Applications welcome year-round'
    },
    'opp-7': {
      title: 'SIDO National Entrepreneurship Development Fund (NEDF)',
      provider: 'Small Industries Development Organization',
      amount: '1 Million - 10 Million TZS (Concessional Credit)',
      description: 'Government-supported micro-credit facilities for cottage industries, soap-makers, food-packagers, and localized production yards.',
      eligibility: ['Micro-enterprises (Small Industries)', 'Completion of pre-enrollment SIDO business training', 'Presence of two reliable personal guarantees'],
      deadline: 'Administered at regional SIDO directorates'
    },
    'opp-8': {
      title: 'Y Combinator Startup Accelerator',
      provider: 'Y Combinator (Silicon Valley)',
      amount: '$500,000 (Venture Capital Equity)',
      description: 'The world-renowned tech accelerator offering massive investment, 3 months of intense pitch prep, and access to the global angel investor pipeline.',
      eligibility: ['Tech-focused founding team with scalable code/software', 'Multi-billion dollar market scalability', 'Willingness to attend intensive programming'],
      deadline: 'Bi-annual cycles (Summer and Winter)'
    },
    'opp-9': {
      title: 'Savannah Fund Seed Investment Program',
      provider: 'Savannah Fund (Africa)',
      amount: '$25,000 - $100,000 (Equity-Based Capital)',
      description: 'Early-stage venture fund investing in tech-enabled models across East and West Africa, specifically fintech, agtech, logistics and mobility.',
      eligibility: ['Scalable software or tech platform', 'Full-time founding team with balanced skills', 'Established initial product traction'],
      deadline: 'September 30th, 2026'
    },
    'opp-10': {
      title: 'Sahara Accelerator Program - Dar es Salaam',
      provider: 'Sahara Ventures',
      amount: '10 Million - 50 Million TZS + VC Direct Options',
      description: 'A intensive 3-month seed stage accelerator including free co-working, legal training, and investor matching in Dar es Salaam.',
      eligibility: ['Early-stage startups with tech-enabled solutions', 'Full time presence in Dar es Salaam program', 'Social or commercial scale potential'],
      deadline: 'August 15th, 2026'
    },
    'opp-11': {
      title: 'USADF Grant Funding for African Enterprises',
      provider: 'US African Development Foundation',
      amount: 'Up to $250,500 (Direct Infrastructure Grants)',
      description: 'USADF awards grants to local agricultural cooperatives and local enterprises to support machinery acquisition, training, and export capabilities.',
      eligibility: ['Local developer groups, co-ops, and qualified local SMEs', 'Gender diversity among members and beneficiaries', '100% locally owned and operated'],
      deadline: 'Annual October application window'
    },
    'opp-12': {
      title: 'CRDB Imbeju Program for Youth & Women',
      provider: 'CRDB Bank Foundation',
      amount: '5% Low Interest Loans & Tiered Grants',
      description: 'Special empowerment program providing collateral-free credit and direct capital tools to young founders pursuing community growth.',
      eligibility: ['Women and young founders under 35', 'Active CRDB Imbeju savings account', 'SIDO or CRDB training certificate'],
      deadline: 'Rolled out in regional waves nationwide'
    }
  };

  return opportunities.map(opp => {
    const tr = translations[opp.id];
    if (tr) {
      return {
        ...opp,
        title: tr.title,
        provider: tr.provider,
        amount: tr.amount,
        description: tr.description,
        eligibility: tr.eligibility,
        deadline: tr.deadline
      };
    }
    // Fallback translation if not specifically in dictionary
    return {
      ...opp,
      title: opp.title + " (Multilateral Funding)",
      provider: opp.provider,
      amount: opp.amount,
      description: "Verified active funding opportunity. Please consult official portal link to verify specific guidelines.",
      deadline: "Check official portal"
    };
  });
}

// African Testimonials Translations
export function getTranslatedTestimonials(testimonials: Testimonial[], lang: 'sw' | 'en'): Testimonial[] {
  if (lang === 'sw') {
    return testimonials.map(t => ({
      ...t,
      story: t.story.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    }));
  }

  const stories: Record<string, string> = {
    'test-1': 'We used to process rice with basic, manual tools before I used FundSeed to structure our expansion proposal. The USADF approved our document and we secured 35 Million TZS to buy our first high-grade milling assembly! FundSeed made us stand out to global evaluators.',
    'test-2': 'Drafting standard financial and credit plans for bank administrators always gave me intense headaches. With FundSeed, I answered a series of prompts and the platform constructed an exceptional blueprint. SIDO approved our funding package instantly!',
    'test-3': 'I had the vision to sell quality honey but had no idea how to represent it on paper. The 20,000 TZS fee I processed on FundSeed changed my life. I structured a flawless Pitch Deck via the AI Co-pilot which convinced Tony Elumelu selectors to fund my firm.',
    'test-4': 'As a technical software visualizer trying to expand ecological waste-tiles in Arusha, I lacked deep financial and accounting vocabularies. FundSeed guided me line-by-line to structure the exact parameters PASS Trust Credit officers wanted.',
    'test-5': 'I utilized this system not only to architect a sound Business Plan, but also directly networked with esteemed scholars and verified mentors. Completing the scholarship criteria correctly got me to the UK for a fully-funded Master’s degree!',
    'test-6': 'I was running a disjointed agribusiness until matching with a mentor through the FundSeed portal. They guided my branding parameters to commercial standards. This framework connects real professionals rather than simply listing cash grants.'
  };

  return testimonials.map(t => ({
    ...t,
    story: stories[t.id] || t.story
  }));
}

// Local storage helpers
export const storageKeys = {
  LANGUAGE: 'fundseed_lang',
  CURRENT_USER: 'fundseed_logged_user',
  USERS_LIST: 'fundseed_all_users_db',
  SAVED_DRAFTS_LOG: 'fundseed_saved_drafts_log_db',
  CUSTOM_OPPORTUNITIES: 'fundseed_custom_opportunities'
};
