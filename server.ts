import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import https from 'https';
import fs from 'fs';
import { freeFeaturedScholarships, premiumScholarshipDatabases } from './src/scholarshipsData';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, query, where, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';

dotenv.config();

let firebaseConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  console.error("Firebase config missing", err);
}

// Initialize Firebase Client SDK securely for server database tasks inside the environment
let dbClient: any = null;
if (firebaseConfig) {
  try {
    const clientApp = initializeApp(firebaseConfig, 'serverApp');
    dbClient = getFirestore(clientApp, firebaseConfig.firestoreDatabaseId);
    console.log("[Firebase] Server Client SDK initialized successfully with DB:", firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error("Error initializing client Firebase inside server.ts:", err);
  }
}


// Lazily initialize the Google GenAI SDK to prevent app crashing on startup if API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY haijapatikana kwenye secrets. Tafadhali weka Gemini API Key kwenye Secrets Panel ili kutumia zana ya Smart-Draft AI.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper function to retry API calls on 503 errors
async function generateContentWithRetry(ai: any, params: any, retries = 3): Promise<any> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    // Check if error is 503
    if (error.status === 503 || (error.message && error.message.includes('503'))) {
      if (retries > 0) {
        console.log(`Gemini API 503 error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateContentWithRetry(ai, params, retries - 1);
      }
    }
    throw error;
  }
}

// Helper function to retry chat messages on 503 errors
async function sendMessageWithRetry(chat: any, message: any, retries = 3): Promise<any> {
  try {
    return await chat.sendMessage(message);
  } catch (error: any) {
    // Check if error is 503
    if (error.status === 503 || (error.message && error.message.includes('503'))) {
      if (retries > 0) {
        console.log(`Gemini API chat 503 error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return sendMessageWithRetry(chat, message, retries - 1);
      }
    }
    throw error;
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API Healtcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    api_key_configured: !!process.env.GEMINI_API_KEY,
    env_keys: Object.keys(process.env).filter(k => 
      k.includes('API') || k.includes('MONGIKE') || k.includes('KEY') || k.includes('MC') || k.includes('SE') || k.length <= 5
    )
  });
});

// Endpoint za Mongike Payments
app.post('/api/payments/initiate', async (req: Request, res: Response) => {
  try {
    const { phone, plan, tenantId, amount, businessName } = req.body;
    
    // Clean and validate phone number
    // Strip all non-numeric characters (spaces, dashes, +, etc.)
    let formattedPhone = phone?.toString().trim() || '';
    formattedPhone = formattedPhone.replace(/\D/g, '');
    
    // Format to local Tanzanian format (0XXXXXXXXX, total 10 digits)
    if (formattedPhone.startsWith('255') && formattedPhone.length === 12) {
      formattedPhone = '0' + formattedPhone.substring(3);
    } else if ((formattedPhone.startsWith('7') || formattedPhone.startsWith('6') || formattedPhone.startsWith('8') || formattedPhone.startsWith('9')) && formattedPhone.length === 9) {
      formattedPhone = '0' + formattedPhone;
    }
    
    // Create direct order ID and select API Key
    const orderId = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const apiKey = process.env.MONGIKE_API_KEY || 'test_key_fake_environment';

    // Build the public base URL using process.env.APP_URL if available
    const appBaseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `https://${req.headers.host}`;
    const webhookUrl = `${appBaseUrl}/api/payments/webhook`;

    // 1. KUTUMA MAELEZO YA MALIPO (PAYLOAD) KWENDA MONGIKE
    const mongikePayload = {
      order_id: orderId,
      amount: Number(amount) || 20000,
      buyer_phone: formattedPhone, // e.g. 255712345678
      fee_payer: "MERCHANT", // Merchant absorbs fees
      webhook_url: webhookUrl,
      callback_url: webhookUrl,
      metadata: {
        tenantId: tenantId || 'anonymous',
        plan: plan || 'VIP',
        businessName: businessName || 'User Business'
      }
    };

    console.log("[Payment] Initiating Mongike push request to:", formattedPhone, "with order:", orderId);
    console.log("[Payment] Webhook URL being sent:", webhookUrl);

    // Call Mongike Gateway using fetch. For mock environments without real keys, we might simulate success.
    // If the apiKey looks legitimate, we call the real endpoint.
    if (apiKey === 'test_key_fake_environment' || (process.env.NODE_ENV !== 'production' && !process.env.MONGIKE_API_KEY)) {
      // MOCK BEHAVIOR FOR PREVIEW
      console.log("[Payment] Running in mock/preview fallback environment.");
      
      if (dbClient) {
        await addDoc(collection(dbClient, 'payments'), {
          tenantId: tenantId || 'anonymous',
          amount: Number(amount) || 20000,
          status: 'PENDING',
          phone: formattedPhone,
          gateway_id: "mock_gateway123",
          order_id: orderId,
          created_at: serverTimestamp(),
          systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
        });
      }

      // Automatically simulate a successful payment after 4 seconds for preview/mock testing!
      setTimeout(async () => {
        console.log(`[Payment Mock Auto-Complete] Simulating successful callback for order ${orderId}`);
        try {
          if (dbClient) {
            const q = query(collection(dbClient, 'payments'), where("order_id", "==", orderId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const batch = writeBatch(dbClient);
              querySnapshot.forEach((document) => {
                const docRef = doc(dbClient, 'payments', document.id);
                batch.update(docRef, {
                  status: 'SUCCESS',
                  updated_at: serverTimestamp(),
                  systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
                });
              });
              await batch.commit();
            }

            if (tenantId && tenantId !== 'anonymous') {
              const userDocRef = doc(dbClient, 'users', tenantId);
              await setDoc(userDocRef, {
                isPaid: true,
                paidAt: serverTimestamp(),
                paymentReference: orderId,
                systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
              }, { merge: true });
              console.log(`[Payment Mock Auto-Complete] Account successfully mock-activated for user ${tenantId}`);
            }
          }
        } catch (err) {
          console.error("Error running mock auto-complete callback:", err);
        }
      }, 4000);
      
      return res.json({ 
        success: true, 
        message: "Payment initiated successfully (Mock Mode)", 
        orderId 
      });
    }

    console.log("[Payment] Calling Mongike Real Gateway with API Key prefix:", apiKey.substring(0, 10));
    
    const response = await fetch('https://mongike.com/api/v1/payments/mobile-money/tanzania', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mongikePayload)
    });

    const data: any = await response.json();
    console.log("[Payment] Mongike Response Status:", response.status, "Body:", JSON.stringify(data));
    
    if (!response.ok) {
      console.error("[Payment] Mongike Gateway failed:", data.message || data.error || "Unknown Error");
      return res.status(response.status).json({ 
        error: data.message || data.error || "Mchakato wa malipo umefeli kwenye Mongike gateway." 
      });
    }

    // 2. KUTUNZA KUMBUKUMBU KWENYE DATABASE YETU YA FIRESTORE
    if (dbClient) {
      await addDoc(collection(dbClient, 'payments'), {
        tenantId: tenantId || 'anonymous',
        amount: Number(amount),
        status: 'PENDING', 
        phone: formattedPhone,
        gateway_id: data.data?.id || data.id || null,
        order_id: orderId,
        created_at: serverTimestamp(),
        systemKey: "FundSeed_Server_Admin_Secure_Key_2026",
      });
    }

    return res.json({ 
      success: true, 
      message: "Payment initiated successfully",
      gatewayId: data.data?.id || data.id,
      orderId
    });
  } catch (err: any) {
    console.error("[Payment] Initiation Error:", err);
    res.status(500).json({ error: "System error pushing USSD." });
  }
});

// Endpoint kupokea Majibu (Webhooks)
app.post('/api/payments/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log("[Payment] Webhook Received:", JSON.stringify(payload));
    
    // Support flat structure and nested structure under 'data' or standard gateways
    const orderId = payload.order_id || payload.orderId || payload.data?.order_id || payload.data?.orderId;
    const rawStatus = payload.status || payload.data?.status || payload.payment_status || payload.paymentStatus || '';
    const paymentStatus = rawStatus.toString().toUpperCase().trim(); // e.g. "SUCCESS", "FAILED"
    
    let metadata = payload.metadata || payload.data?.metadata;
    let tenantId: string | null = null;
    if (metadata) {
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          console.error("Failed to parse metadata string:", e);
        }
      }
      if (metadata && typeof metadata === 'object') {
        tenantId = metadata.tenantId || null;
      }
    }
    
    if (!orderId || !paymentStatus) {
      console.warn("[Payment Webhook] Missing orderId or paymentStatus in payload:", payload);
      return res.status(400).send("Bad request structure");
    }

    if (dbClient) {
      // 1. Update the payments collection
      const q = query(collection(dbClient, 'payments'), where("order_id", "==", orderId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const batch = writeBatch(dbClient);
        querySnapshot.forEach((document) => {
          const docData = document.data();
          // Fallback if tenantId is missing from incoming webhook metadata but present in DB
          if (!tenantId && docData.tenantId) {
            tenantId = docData.tenantId;
          }
          const docRef = doc(dbClient, 'payments', document.id);
          batch.update(docRef, {
            status: paymentStatus,
            updated_at: serverTimestamp(),
            systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
          });
        });
        await batch.commit();
        console.log(`[Payment Webhook] Updated existing payment record for order ${orderId} with status ${paymentStatus}`);
      } else {
        // Fallback: If no payment records found, create a new one to prevent blocking
        console.log(`[Payment Webhook] Payment record for orderId ${orderId} not found, creating a new record with status ${paymentStatus}.`);
        await addDoc(collection(dbClient, 'payments'), {
          tenantId: tenantId || 'anonymous',
          amount: payload.amount || payload.data?.amount || 20000,
          status: paymentStatus,
          phone: payload.buyer_phone || payload.data?.buyer_phone || payload.phone || '',
          gateway_id: payload.id || payload.data?.id || payload.gateway_id || payload.data?.gateway_id || null,
          order_id: orderId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
        });
      }

      // 2. Activate the user account in users collection if payment successful
      if (paymentStatus === "SUCCESS" || paymentStatus === "COMPLETED") {
        if (tenantId && tenantId !== 'anonymous') {
          const userDocRef = doc(dbClient, "users", tenantId);
          await setDoc(userDocRef, {
            isPaid: true,
            paidAt: serverTimestamp(),
            paymentReference: orderId,
            systemKey: "FundSeed_Server_Admin_Secure_Key_2026"
          }, { merge: true });
          console.log(`[Payment Webhook] Account successfully activated for user ${tenantId}`);
        } else {
          console.warn(`[Payment Webhook] Payment successful but tenantId is missing or anonymous, cannot activate user. (tenantId: ${tenantId})`);
        }
      }
    }

    res.status(200).send("Webhook received and processed");
  } catch (err) {
    console.error("[Payment] Webhook Error:", err);
    res.status(500).send("Webhook processing error");
  }
});

// Endpoint za Smart-Draft AI
app.post('/api/smart-draft/business-plan', async (req: Request, res: Response) => {
  try {
    const { businessName, industry, problem, solution, targetCustomers, budgetString } = req.body;

    if (!businessName || !industry || !problem || !solution) {
      res.status(400).json({ error: 'Tafadhali jaza taarifa zote muhimu ili kuanza.' });
      return;
    }

    // Lazy load the client & handle missing keys elegantly
    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      // Warm, informative fallback in case GEMINI_API_KEY is not defined yet
      const fallbackBusinessPlan = `
# MPANGO WA BIASHARA: ${businessName.toUpperCase()}
*(ILIYOZALISHWA KWA MFANO - Sababu: Gemini API Key haijawekwa kwenye siri ya mfumo)*

## 1. Muhtasari wa Mtendaji (Executive Summary)
Biashara ya **${businessName}** katika sekta ya **${industry}** imejikita katika kutatua changamoto zifuatazo: *${problem}*. Suluhisho letu thabiti ni *${solution}*. Biashara hii inalenga soko la kitanzania, hasa kundi la uwezo wa wateja kama: **${targetCustomers || 'Wateja wote'}**.

## 2. Uchambuzi wa Soko na Fursa
- **Sekta:** ${industry}
- **Wateja Walengwa:** ${targetCustomers || 'Wanafamilia na vijana nchini'}
- **Changamoto Tunayotatua:** ${problem}

## 3. Mpango wa Bidhaa na Huduma
Huduma au bidhaa ya **${businessName}** imetengenezwa kukabili changamoto hii kwa kuonyesha weledi mkubwa wa kiufundi. Lengo ni kuhakikisha huduma inatolewa kwa gharama nafuu na viwango vya hali ya juu zaidi nchini Tanzania kabisa.

## 4. Mpango wa Makadirio ya Kifedha
- **Bajeti ya Jumla:** ${budgetString || 'Mkataba wa Awali - TZS 20,000,000'}
- **Chanzo cha Mtaji:** Ufadhili / Ruzuku au Mikopo ya muda mrefu kupitia washirika wa FundSeed.

*Kumbuka: Ili kupata Business Plan ilizoshonwa kikamilifu na AI na maelezo ya kina ya kifedha, msimamizi wa mfumo anapaswa kuunganisha **GEMINI_API_KEY** kwenye paneli ya siri ya AI Studio (Settings > Secrets).*
      `;
      res.json({ result: fallbackBusinessPlan.trim() });
      return;
    }

    const prompt = `Wewe ni mtaalamu mwandishi wa Mpango wa Biashara (Business Plan Writer) nchini Tanzania. 
Msaada wangu uandike Mpango wa Biashara makini na wa kuvutia kwa lugha ya Kiswahili safi kwa kutumia taarifa zifuatazo:
- Jina la Biashara: ${businessName}
- Sekta: ${industry}
- Changamoto inayotatuliwa: ${problem}
- Suluhisho tunalotoa: ${solution}
- Soko lengwa / Wateja wetu: ${targetCustomers || 'Wateja wanaohitaji huduma hii nchini'}
- Makadirio ya Bajeti/Mtaji: ${budgetString || 'Tsh 15,000,000'}

Mpango huu wa biashara uandikiwe katika mtindo wa Markdown (Markdown format) ukiwa na vichwa vya habari vifuatazo, uandike kwa urefu, weledi, na uchambuzi mzuri wa soko halisi la kiuchumi nchini Tanzania:
# MPANGO WA BIASHARA: ${businessName.toUpperCase()}

## 1. Muhtasari wa Mtendaji (Executive Summary)
(Maelezo ya jumla ya biashara, dhamira kuu, na kile kinachoifanya biashara kuwa ya kipekee)

## 2. Uchambuzi wa Soko na Washindani (Market Analysis)
(Chunguza fursa za soko la Tanzania, ukubwa wa hitaji la bidhaa/huduma hii, na namna ya kuwashinda washindani)

## 3. Mpango wa Bidhaa au Huduma (Product & Service Details)
(Fafanua kina kuhusu kile kinachouzwa na umuhimu wake, na jinsi inavyonufaisha mteja)

## 4. Mkakati wa Masoko na Uuzaji (Marketing & Sales Strategy)
(Jinsi ya kufikia wateja, mifumo ya kukuza mauzo kama mitandao ya kijamii, au mawakala, na mifumo ya uuzaji nchini)

## 5. Mpango wa Uendeshaji na Usimamizi (Operational Plan)
(Hatua za kila siku za uendeshaji, usimamizi wa uzalishaji au uwasilishaji wa huduma kwa wateja)

## 6. Mpango na Makadirio ya Kifedha (Financial Projections)
(Uchanganuzi wa bajeti ya ${budgetString || 'Tsh 15,000,000'} - weka matumizi kwenye jedwali la markdown, makadirio ya mauzo ya mwezi, na makadirio ya faida ya mwaka wa kwanza)`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Wewe ni mchambuzi mahiri wa biashara na mtaalamu wa uandishi wa mipango ya biashara wenye uzoefu mkubwa katika mazingira ya kiuchumi ya Tanzania. Lengo lako ni kutoa mwongozo wa kitaalamu, wa vitendo, na wenye ushawishi. Andika kwa lugha ya Kiswahili fasaha, inayozingatia lugha ya kibiashara inayotumiwa na wawekezaji na taasisi za kifedha nchini Tanzania. Epuka lugha ya kimashine au ya kutafsiriwa—badala yake, tumia mtiririko wa mawazo wa mjasiriamali wa kitanzania anayetafuta fursa halisi. Hakikisha maelezo ni ya kina, yenye tija, na yanaakisi uhalisia wa soko la Tanzania.',
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Business plan generation error:', error);
    res.status(500).json({ error: error.message || 'Hitilafu ya kiufundi imetokea wakati wa kuzalisha andiko.' });
  }
});

// ... imports



app.post('/api/smart-draft/pitch-deck', async (req: Request, res: Response) => {
  try {
    const { startupName, industry, problem, solution, marketSize, businessModel, fundingNeeds } = req.body;

    if (!startupName || !industry || !problem || !solution) {
      res.status(400).json({ error: 'Tafadhali jaza taarifa zote muhimu ili kuanza kutengeneza Pitch Deck.' });
      return;
    }

    // Lazy load the client & handle missing keys elegantly
    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      // Warm, informative fallback in case GEMINI_API_KEY is not defined yet
      const fallbackPitchDeck = `
# PITCH DECK STRUCTURE: ${startupName.toUpperCase()}
*(ILIYOZALISHWA KWA MFANO - Sababu: Gemini API Key haijawekwa kwenye siri ya mfumo)*

### Slide 1: Msingi wa Jina la Mradi
- **Jina la Mradi:** ${startupName}
- **Sekta:** ${industry}
- **Lengo letu kuu:** Badili biashara yako iwe ya kisasa.

### Slide 2: Changamoto Kubwa nchini (The Problem)
- *${problem}*
- Tatizo hili linakumba mamia ya wateja kila uchao nchini Tanzania kwa kutokuwepo kwa urahisi wa kupata huduma hii ya kipekee.

### Slide 3: Suluhisho Letu la Kipekee (The Solution)
- *${solution}*
- Tunaleta suluhu ya gharama nafuu na rahisi kutumia ambayo itafika mikononi mwa walengwa kupitia matumizi ya simu na mifumo yetu imara ya kidijitali.

### Slide 4: Ukubwa wa Soko (Market Opportunity)
- **Ukubwa wa Soko la Jumla:** ${marketSize || 'Makadirio ya soko nchini - Watumiaji laki 5 nchini'}
- Tunalenga kuanza na 10% ya wasambazaji katika mkoa wa kwanza ndani ya mwaka mmoja.

### Slide 5: Mfumo wa Mapato (Business Model)
- **Namna ya kuingiza kipato:** ${businessModel || 'Ada ya huduma na mauzo ya moja kwa moja ya bidhaa'}

### Slide 6: Mtaji Unaohitajika & Matumizi (Funding Request)
- **Mahitaji ya Mtaji:** ${fundingNeeds || 'TZS 10,000,000'}
- Fedha hii itasaidia moja kwa moja kuboresha bidhaa yetu ya kwanza, kuongeza nguvu ya uuzaji sokoni, na kuajiri wabunifu wengine wawili wa kitanzania.

*Kumbuka: Ili kuandaa Pitch Deck ya kisasa iliyotengenezwa vizuri sana na AI yetu, tafadhali weka **GEMINI_API_KEY** katika Secrets Panel kwenye AI Studio settings dashboard.*
      `;
      res.json({ result: fallbackPitchDeck.trim() });
      return;
    }

    const prompt = `Wewe ni mshauri wa uwekezaji na startups nchini Tanzania na Afrika Mashariki.
Msaidie mjasiriamali kuandaa herufi na andishi rasmi la mawasilisho ya biashara mbele ya wawekezaji (Pitch Deck Script) katika mtindo wa Markdown. 
Tumia maelezo yafuatayo ya Startup yake:
- Jina la Mradi: ${startupName}
- Sekta: ${industry}
- Changamoto kubwa wanayotatua (Problem): ${problem}
- Suluhisho lao la kipekee (Solution): ${solution}
- Ukubwa wa soko / Uwezo wa kukua (Market Opportunity): ${marketSize || 'Soko zima la Tanzania'}
- Jinsi ya kuingiza fedha (Business Model): ${businessModel || 'Mauzo ya moja kwa moja'}
- Mtaji na Ruzuku inayotafutwa (Funding Needs): ${fundingNeeds || 'TZS 10,000,000'}

Andika andishi hili kwa Lugha ya Kiswahili safi ya kibiashara, ya kushawishi, na likitengwa kwa awamu ya Slides (Slide Structure). Kila slide iwe na mapendekezo ya andiko la kusema na maelezo ya picha/visual za kuweka kwenye slide hiyo.
Andika katika mfumo wa Markdown kama ifuatavyo:
# INVESTOR PITCH DECK: ${startupName.toUpperCase()}

### Slide 1: Utangulizi & Slogan Kuu
- **Kichwa cha Slide:** ${startupName} - [Slogan ya Kuvutia]
- **Maelezo ya Visual:** (Mchoro gani au picha gani iwekwe kwenye slide hii ya mwanzo)
- **Script ya Kusema:** (Maelezo ya msemaji kwa wawekezaji ili kuwavutia tangu sekunde ya kwanza)

### Slide 2: Changamoto Kubwa (The Problem)
- **Kichwa cha Slide:** Maumivu ya Soko: Changamoto Halisi
- **Yaliyomo (Key Points):** [Orodha ya Pointi kulingana na tatizo la mteja: ${problem}]
- **Maelezo ya Visual:** (Chati au picha ya kuonyesha ukubwa wa changamoto)
- **Script ya Kusema:** (Jinsi ya kueleza changamoto hii kwa kuigusa mioyo ya wawekezaji)

### Slide 3: Suluhisho la Kipekee (The Solution)
- **Kichwa cha Slide:** FundSeed Smart-Draft inatambulisha: ${startupName}
- **Yaliyomo (Key Points):** [Njia gani mnasuluhisha tatizo: ${solution}]
- **Maelezo ya Visual:** (Sura ya bidhaa/prototype au huduma)
- **Script ya Kusema:** (Fafanua jinsi suluhisho lenu lilivyo rahisi kuliko yaliyopo)

### Slide 4: Ukubwa nauwezo wa Soko (Market Opportunity)
- **Kichwa cha Slide:** Soko na Fursa ya Kukua
- **Yaliyomo (Key Points):** [Eleza kuhusu ${marketSize || 'Uwezo wa watumiaji Tanzania'}]
- **Script ya Kusema:** (Maelezo yanayoonyesha kuwa hii sio biashara ya mtaani tu bali inaweza kusambaa wilaya hadi wilaya au kikanda)

### Slide 5: Jinsi ya Kutengeneza Mapato (Business Model)
- **Kichwa cha Slide:** Ununuzi na Mfumo wa Mapato Yetu
- **Yaliyomo (Key Points):** [Andika kuhusu jinsi mtakavyoingiza faida: ${businessModel}]
- **Script ya Kusema:** (Jinsi gani mteja atawasilisha malipo na mtakavyohakikisha faida inaongezeka)

### Slide 6: Mapambano na Ushindani (Competition & Edge)
- **Kichwa cha Slide:** Kwa nini Sisi? Competitive Advantage yetu
- **Yaliyomo:** (Kitu kinachowatofautisha na wengine)
- **Script ya Kusema:** (Ufunguo wa siri au ujuzi unaowarudisha nyuma washindani)

### Slide 7: Mpango wa Mtaji & Ahadi (Funding Request & Milestones)
- **Kichwa cha Slide:** Ombi la Mtaji: ${fundingNeeds}
- **Yaliyomo (Key Points):** [Eleza jinsi ${fundingNeeds} zitakavyowasaidia kukua katika miezi 12 ijayo]
- **Script ya Kusema:** (Ujumbe wa mwisho wa neno la CTA kwa wawekezaji kujiunga na safari yenu ya kishindo)
`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Wewe ni mtaalamu wa uwekezaji na mshauri wa startups mwenye rekodi ya mafanikio makubwa katika kusaidia kampuni changa barani Afrika, hasa Tanzania, kupata mitaji kutoka kwa wawekezaji (Venture Capitalists) na mashirika ya ruzuku. Andika andishi la mawasilisho (Pitch Deck) kwa lugha ya Kiswahili ya kibiashara, yenye mvuto wa hali ya juu, ya kushawishi, na inayolenga moja kwa moja mahitaji ya mwekezaji. Epuka mtindo wa kutoa maelezo kwa njia ya kawaida—tumia lugha ya kijasiri na ya kibiashara inayojenga imani ya mwekezaji kwenye mradi huu. Hakikisha muundo wa mawasilisho unasisitiza ukuaji, kutatua tatizo la soko, na kurudisha faida (ROI).',
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Pitch deck generation error:', error);
    res.status(500).json({ error: error.message || 'Hitilafu ya kiufundi imetokea wakati wa kuzalisha andiko.' });
  }
});

app.post('/api/smart-draft/pitch-critique', async (req: Request, res: Response) => {
  try {
    const { pitchText, industry } = req.body;

    if (!pitchText) {
      res.status(400).json({ error: 'Tafadhali ingiza maelezo au andishi la Pitch Deck lako ili tuweze kulikosoa.' });
      return;
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      // Return a professional elegant Swahili fallback critique in case key is missing
      const fallbackCritique = `
# CHANGANUZI WA PITCH DECK LAKO (MFANO)
*(ILIYOZALISHWA KWA MFANO - Sababu: Gemini API Key haijawekwa katika Secrets Panel tangu sasa)*

Sekta uliyochagua: **${industry || 'Haijatajwa'}**

### 1. Strengths (Mambo Yaliyofanyika Vizuri):
* **Lengo lililo Wazi:** Uwasilishaji unajaribu kupasua maelezo ya kile unachofanya mapema bila kupoteza muda.
* **Mvuto kwa Tanzania:** Suluhisho linaonekana kuendana vyema na changamoto za kijamii za Tanzania katika soko lako lililoteuliwa.

### 2. Areas for Improvement (Maeneo ya Kuboresha):
* **Ufumbuzi wa Kidijitali:** Pamoja na kwamba teknolojia imetajwa, bado haieleweki jinsi utakavyowaleta wateja wa kwanza.
* **Namba na Alama:** Sura ya mapato (Revenue models) na makadirio ya soko bado hayajachambuliwa kwa kina (k.m. TAM, SAM, SOM). Toa takwimu rasmi kutoka mamlaka kama NBS au tafiti zako binafsi.

### 3. Hatua za Kuchukua (Actionable Recommendations):
* **Hatua 1:** Toa utaratibu rahisi wa jinsi ya kuanza kuzalisha faida ndani ya miezi mitatu ya kwanza tangu upokee mtaji.
* **Hatua 2:** Eleza kwa nini timu yako ni bora kuliko washindani na uzoefu mlio nao katika kusimamia fedha.
* **Hatua 3:** Andika andishi lako tena huku ukiondoa maneno mengi yanayojirudia.

### 4. Alama ya Jumla (Critique Score):
## **6.5 / 10**

*Kumbuka: Ili kupata tathmini kubwa ya hali ya juu sana iliyotengenezwa vizuri kwa kutumia AI yetu yenye uelewa mkubwa wa soko, tafadhali weka **GEMINI_API_KEY** katika Secrets Panel kwenye AI Studio settings dashboard.*
      `;
      res.json({ result: fallbackCritique.trim() });
      return;
    }

    const prompt = `Wewe ni mshauri mkuu wa uwekezaji, ruzuku na mifumo ya ujenzi wa startups nchini Tanzania na Afrika Mashariki.
Mteja/Mjasiriamali ameandika andishi lake la mawasilisho ya biashara (Pitch Deck) hapa chini na anataka kupata tathmini na ukosoaji wa kitaalamu (Pitch Critique) kwa lugha ya Kiswahili fasaha ya kibiashara, ya kushawishi, na inayojenga.

Hapa kuna taarifa za ziada:
- Sekta ya Biashara: ${industry || 'Haijatajwa'}

Andandishi la Pitch Deck la mteja:
"""
${pitchText}
"""

Tafadhali chambua andiko hili kwa umakini sana kwa lugha ya Kiswahili na utoe tathmini safi ya kitaalamu katika vipengele vifuatavyo kwa kutumia muundo mzuri wa Markdown (tumia tija, herufi nzito, na alama zinazovutia kama Emoji):

1. **Vipengele Imara (Strengths - Mambo Yaliyofanywa Vizuri mno)**: Fafanua ni wapi pitch hii inang'ara na kuwashawishi wawekezaji au watoa ruzuku nchini Tanzania (k.m. COSTECH NFAST, TRA Innovation, n.k.).
2. **Maeneo ya Kuboresha (Areas for Improvement - Mapungufu yanayotakiwa kurekebishwa haraka)**: Toa ukosoaji wenye kujenga na unyooshe maelezo yoyote ambayo hayako wazi au hayana mvuto (k.m. soko halisi kuuzika vizuri zaidi au mapato).
3. **Mapendekezo ya Hatua Thabiti (Actionable Recommendations - Ushauri wa Moja kwa Moja wa Kuchukuliwa Hatua)**: Toa miongozo ya hatua 3 hadi 5 za kivitendo jinsi ya kuboresha uandishi huu na uwasilishaji kuanzia leo.
4. **Alama ya Jumla (Critique Score)**: Toa alama ya makadirio kati ya 1/10 hadi 10/10 kulingana na uwezo wa sasa wa pitch deck yao kupata ufadhili au uwekezaji.

Hakikisha majibu yako yana sauti ya kitaaluma, ya ushawishi, ya kirafiki, na yanamtia moyo mjasiriamali wakati huo huo ikimpa ukweli kamili kulingana na viwango vya kimataifa vya uandishi wa miradi.`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Wewe ni mtaalamu na mshauri wa kitaalamu wa uwekezaji kutoka Tanzania, ukiwa na uzoefu wa miaka mingi wa kuongoza na kukosoa mawasilisho ya ruzuku na uwekezaji nchini. Unaleta ufahamu mzuri wa mazingira ya kibiashara ya kitanzania (kama COSTECH, NFAST, TRA, ruzuku za serikali na binafsi). Toa mrejesho wako wote kwa lugha fasaha ya Kiswahili pekee.',
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Pitch critique generation error:', error);
    res.status(500).json({ error: error.message || 'Hitilafu ya kiufundi imetokea wakati wa kuchanganua pitch yako.' });
  }
});

app.post('/api/scholarships/match', async (req: Request, res: Response) => {
  try {
    const { academicLevel, course, countryOfInterest } = req.body;

    if (!course) {
      res.status(400).json({ error: 'Tafadhali jaza kozi au mchepuo wako ili kuanza.' });
      return;
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      // High quality fallback matching when GEMINI_API_KEY is not defined yet
      const field = course.toLowerCase();
      let match1 = "";
      let match2 = "";
      let url1 = "";
      let url2 = "";

      if (field.includes('it') || field.includes('computer') || field.includes('teknolojia') || field.includes('software') || field.includes('is') || field.includes('digital')) {
        match1 = "Erasmus Mundus Joint Masters (EU) - Digital Communication and Technology";
        url1 = "https://ec.europa.eu/programmes/erasmus-plus/opportunities/individuals/students/erasmus-mundus-joint-master-degrees_en";
        match2 = "Swedish Institute Scholarships (SISGP) - Master in Computer Science & IT programs";
        url2 = "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/";
      } else if (field.includes('kilimo') || field.includes('agri') || field.includes('climate') || field.includes('mazingira') || field.includes('misitu') || field.includes('environmental') || field.includes('energy') || field.includes('nature')) {
        match1 = "DAAD Scholarships (Germany) - Development-Related Courses (MSc Sustainable Resource Management)";
        url1 = "https://www.daad.de/en/study-and-research-in-germany/scholarships/";
        match2 = "Australia Awards Scholarships - Agricultural Innovation, Water and Food Security programs";
        url2 = "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships";
      } else if (field.includes('biashara') || field.includes('business') || field.includes('finance') || field.includes('uchumi') || field.includes('economics') || field.includes('management') || field.includes('maendeleo') || field.includes('law')) {
        match1 = "Chevening Scholarship (UK) - MSc in Finance & Development and Public Policy";
        url1 = "https://www.chevening.org/apply/";
        match2 = "MEXT Japanese Government Scholarship - MBA and Global Management Programs";
        url2 = "https://www.tz.emb-japan.go.jp/itpr_en/MEXT_Scholarships_E.html";
      } else {
        match1 = "Chevening Scholarship (UK) - Masomo ya Uzamili katika Chuo Kikuu chochote cha Uingereza";
        url1 = "https://www.chevening.org/apply/";
        match2 = "Commonwealth Scholarships (UK) - Kwa fani za Maendeleo Endelevu";
        url2 = "https://cscuk.fcdo.gov.uk/apply/";
      }

      const levelStr = academicLevel === 'degree' ? 'Bachelor Degree' : academicLevel === 'masters' ? 'Masters Degree' : 'PhD Research';

      const fallbackAdvice = `
# RIPOTI YA AI YA USHAURI WA SCHOLARSHIPS (Njia ya Majaribio)
*(Ripoti hii imetengenezwa kwa njia ya mfano kwani Gemini API Key bado haijaunganishwa)*

## 1. Uchambuzi wa Awali wa Wasifu Wako (Profile Evaluation)
- **Kozi Uliyochagua:** **${course}**
- **Ngazi ya Elimu:** **${levelStr}**
- **Nchi Unayopendelea:** **${countryOfInterest}**

Wasifu wako unaonyesha uwezo thabiti wa kiakademik nchini Tanzania. Sekta ya **${course}** kwasasa ina vipaumbele vya kipekee vya ufadhili na uwezo mkubwa wa masomeo ya juu kimataifa katika ngazi ya **${levelStr}** ili kuongeza tija kwenye soko letu la ndani nchini.

## 2. Udhamini Muhimu Unaopendekezwa (Recommended Scholarships)
Tumechambua database yetu ya programu 50+ na hapa kuna fursa 2 mkuu ambazo ni chaguo bora kwako:

### Jina la Scholarship: ${match1}
- **Mtoa Huduma:** Umoja wa Ulaya au Serikali husika
- **Maelezo ya Udhamini:** Ufadhili kamili (Full Funding) unaolipa ada zote, usafiri wa ndege na posho ya kila mwezi kukusaidia masomoni.
- **Uhusiano na Wasifu Wako:** Inashauriwa kwa watu wenye nia dhabiti ya kuanzisha miradi ya kiteknolojia na maendeleo chanya nchini Tanzania.
- **Njia ya Maomba:** Unaweza kuanza kujifunza sifa zake kupitia kiungo rasmi hapa: [Fungua Tovuti](${url1})

### Jina la Scholarship: ${match2}
- **Mtoa Huduma:** Serikali/Taasisi mshirika wetu masika
- **Maelezo ya Udhamini:** Udhamini rasmi usio na deni baada ya kuhitimu, unajumuisha bima na malazi.
- **Uhusiano na Wasifu Wako:** Inashajiisha wasomi wa kitanzania kuboresha ujuzi kwenye nchi ya **${countryOfInterest}**.
- **Njia ya Maomba:** Maelezo kamili ya maombi yanapatikana hapa: [Fungua Tovuti](${url2})

---

## 3. Hatua kwa Hatua za Maandalizi ya Kushinda (Actionable SOP & CV Steps)
1. **Kuandika SOP Maalum:** Katika andiko lako la Statement of Purpose (SOP) kwa fani ya **${course}**, hakikisha unatoa fafanuzi safi ya namna gani ruzuku hii itakusaidia kurejea Tanzania na kutatua changamoto za wananchi kibunifu baada ya kuhitimu.
2. **Kupata Recommendation Letters:** Wasiliana na wahadhiri au wasimamizi wako (wapendekezaji angalau 2) ambao wanakujua kiakademiki na utendaji wako wa kazi vizuri.
3. **Academic CV/Resume:** Tumia template zenye muundo wa kimataifa (kama Europass au mtindo safi wa PDF bila mapambo ya rangi nyingi).

## 4. Ushauri Muhimu wa ziada (Expert Tip)
*Kumbuka: Ili kupata ripoti dhabiti iliyoshonwa na Gemini AI yetu, tafadhali weka **GEMINI_API_KEY** katika Secrets Panel kwenye AI Studio settings dashboard. Kama tayari wewe ni mwanachama wa VIP, usisite kutupa CV yako kwa ajili ya ushauri wa ana kwa ana kwenye Kikundi chetu ca WhatsApp!*
      `;
      res.json({ result: fallbackAdvice.trim() });
      return;
    }

    const prompt = `Wewe ni mtaalamu wa ushauri wa masomo ya juu ya kimataifa na ruzuku za masomo (Scholarships Expert) nchini Tanzania na Afrika Mashariki.
Msaidie mwanafunzi huyu kupata nafasi za udhamini (scholarships) kulingana na sifa zake:
- Ngazi ya Elimu: ${academicLevel}
- Kozi/Mchepuo wa masomo: ${course}
- Nchi inayopendwa: ${countryOfInterest}

Hapa chini kuna orodha ya ruzuku na mifumo rasmi iliyothibitishwa zaidi ya 14 (ambayo ni sehemu ya database yetu kubwa zaidi ya vyombo 50+):
${JSON.stringify([...freeFeaturedScholarships, ...premiumScholarshipDatabases], null, 2)}

Tafadhali chambua taarifa hizi na upendekeze ruzuku 2 au zipi 3 zinazofaa zaidi sifa na malengo ya mwanafunzi huyu. Unaweza pia kutaja udhamini mwingine maarufu duniani unaolenga nchi aliyochagua lakini hakikisha unaangazia wale wanaofaa wasifu wake nchini Tanzania kwanza.

Andika ripoti yako kwa Kiswahili fasaha chenye weledi na matumaini makubwa. Ripoti iandikwe katika mfumo safi wa Markdown wenye mpangilio ufuatao:

# RIPOTI YA AI YA USHAURI WA SCHOLARSHIPS
## 1. Uchambuzi wa Wasifu Wako (Profile Evaluation)
Eleza kwa kifupi sifa alizoweka na jinsi zinavyoendana na fursa za kimataifa (k.m., fani ya ${course} katika ngazi ya ${academicLevel}).

## 2. Udhamini Muhimu Unaopendekezwa (Recommended Scholarships)
Orodhesha programu 2 au 3 za scholarships zinazopendekezwa zaidi kutoka kwenye orodha na ueleze sababu hasa za kuchagua kila moja (Uhusiano wa kozi, nchi na ngazi). Weka taarifa zifuatazo kwa kila ruzuku kuonekana kwa ujasiri:
- **Jina la Scholarship:** [Jina la udhamini]
- **Mtoa Huduma:** [Mtoa huduma]
- **Maelezo ya Udhamini:** [Maelezo mafupi pamoja na faida kuu k.m. Full Funding]
- **Uhusiano na Wasifu Wako:** [Kwa nini inakufaa]
- **Njia ya Maombi:** [Wasilisha link husika au tovuti rasmi ya apply]

## 3. Hatua kwa Hatua za Maandalizi (Actionable SOP & CV Steps)
Toa ushauri maalum kwa ajili ya fani ya ${course}:
- Jinsi ya kuandika Statement of Purpose (SOP) yenye nguvu ikilenga kutatua changamoto za Tanzania kupitia fani hii.
- Ushauri wa namna ya kuandaa wasifu (Academic CV) na kupata barua za pendekezo (Recommendation Letters) kutoka kwa wahadhiri husika.

## 4. Ushauri wa Mtaalamu (Expert Tip)
Maneno mafupi ya usaidizi au hitimisho safi ya kukujenga, na kusisitiza uaminifu wa kupitia links kamilifu zilizothibitishwa bila kupitia matapeli.`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Wewe ni mtaalamu wa uandishi na maelekezo ya scholarships nchini Tanzania. Unasaidia vijana na wasomi kwa lugha ya Kiswahili safi kabisa, yenye tija, na andika kwa urefu safi wa kishindo.',
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Scholarships matching error:', error);
    res.status(500).json({ error: error.message || 'Hitilafu ya kiufundi imetokea wakati wa usindikaji wa AI.' });
  }
});

// AI Assistant Msaidizi Endpoint
app.post('/api/msaidizi/chat', async (req: Request, res: Response) => {
  try {
    const { history, message, contextData } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Ujumbe unahitajika.' });
      return;
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      res.status(500).json({ error: 'Mfumo wa AI (Gemini) haujasanidiwa vizuri kwa sasa.' });
      return;
    }

    // Convert history format to Gemini Chat format if you are using chat session
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: `Wewe ni "Fundseed Msaidizi", msaidizi wa AI wa akili kwenye jukwaa la Fundseed. 
Kazi yako ni kusaidia wajasiriamali na waomba ruzuku nchini Tanzania na Afrika Mashariki kwa lugha ya Kiswahili safi.
Jibu maswali yao kwa weledi, fupi lakini yenye taarifa kamili kuhusu biashara, ruzuku (grants), utafutaji mitaji, na usajili.
Mazingira ya sasa kuhusu mambo ya ruzuku (ikiwa yapo): ${contextData || 'Hakuna taarifa za ziada'}`,
        temperature: 0.7,
      }
    });
    
    // We can simulate history by just passing all previous and current as one prompt for simplicity,
    // or properly using sending messages. Since @google/genai chats API requires managing history explicitly:
    let fullPrompt = "";
    if (history && Array.isArray(history)) {
       history.forEach((h: any) => {
         fullPrompt += `${h.role === 'user' ? 'Mteja' : 'Msaidizi'}: ${h.parts[0].text}\n`;
       });
    }
    fullPrompt += `Mteja: ${message}`;

    const response = await sendMessageWithRetry(chat, {
      message: fullPrompt
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Msaidizi chat error:', error);
    if (error.status === 503 || (error.message && error.message.includes('503'))) {
      res.status(503).json({ error: 'Mfumo wa AI una msongamano mkubwa kwa sasa. Tafadhali jaribu tena baada ya muda mfupi.' });
    } else {
      res.status(500).json({ error: 'Hitilafu ya AI Msaidizi: ' + error.message });
    }
  }
});

// Vite Integration Setup for both development and production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  // If we are in development, load the Vite Dev Server and mount as a middleware
  import('vite').then((viteModule) => {
    viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then((viteServer) => {
      app.use(viteServer.middlewares);
      
      // Setup listener on port 3000
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[Development] Server na Vite vinarun kwenye http://0.0.0.0:${PORT}`);
      });
    });
  }).catch((err) => {
    console.error('Hitilafu wakati wa kuwasha Vite middleware:', err);
  });
} else {
  // Serve compiled production build assets
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Production] Fullstack Server inakimbia kwenye port ${PORT}`);
  });
}
