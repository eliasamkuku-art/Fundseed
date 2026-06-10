import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function main() {
  let firebaseConfig = null;
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (err) {
    console.error("Firebase config missing", err);
    return;
  }

  if (!firebaseConfig) {
    console.error("No config.");
    return;
  }

  const tempAppName = 'tempApp-' + Date.now();
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const db = getFirestore(tempApp, firebaseConfig.firestoreDatabaseId);

  try {
    // 1. Tanzania Ventures Lab (TVL)
    await addDoc(collection(db, 'opportunities'), {
      title: "Tanzania Ventures Lab (TVL) Call for Applications (Madini & Nishati Accelerators)",
      provider: "Sahara Consult, DTBi, buni",
      amount: "High-potential ventures ready to grow, validate, and scale",
      category: "incubator",
      description: "Are you building an innovative, scalable, market-driven solution in mining, extractives, energy, or cleantech? Applications open for innovative Tanzanian ventures.",
      eligibility: ["Registered or actively operating venture in Tanzania", "Validated solution: prototype, pilot, or product already in the market", "Clear value proposition addressing a sector-specific challenge or opportunity", "Strong potential for growth, scalability, and measurable impact", "Committed and capable founding or management team", "Willingness to actively participate in all programme activities"],
      deadline: "Applications are open for the accelerators",
      origin: "Tanzania",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Africa Technology Show 2026
    await addDoc(collection(db, 'opportunities'), {
      title: "Africa Technology Show 2026 (Exhibition & Conference)",
      provider: "Kenyatta International Convention Centre",
      amount: "B2B Exhibition & Conference",
      category: "ruzuku",
      description: "East Africa's Premier B2B Exhibition & Conference for Technology, Innovation and Digital Transformation. Sectors: AI & Robotics, Cloud & Data Centre, Cyber Security, Manufacturing & Industry 4.0, Fintech, Telecoms, E-Commerce & Retail Tech, Health Tech.",
      eligibility: ["10,000+ Visitors", "300+ Exhibitors", "30+ Countries"],
      deadline: "22-24 July 2026",
      origin: "Duniani",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 3. COSTECH NFAST & CRDB Bank Foundation Credit Window
    await addDoc(collection(db, 'opportunities'), {
      title: "COSTECH NFAST & CRDB Bank Foundation Special Credit Window for Startups",
      provider: "Tanzania Commission for Science and Technology (COSTECH) & CRDB Bank Foundation",
      amount: "Commercialization Loans, Overdrafts, and Matching Funds (Collateral is the asset itself, personal guarantee, or third-party guarantee)",
      category: "mkopo",
      description: "Special credit window under the National Fund for Advancement of Science and Technology (NFAST) to support commercialization of innovations in collaboration with CRDB Bank Foundation.",
      eligibility: [
        "Has Minimum viable product (MVP) or market fit product (PMF) for their innovation",
        "A locally registered business entity emanating from innovation or research activities, majority owned by Tanzanian citizens and with main office in the United Republic of Tanzania",
        "Has a viable business dealing with production, processing, manufacturing, technology development or any other identified value addition business, provided that it has undergone a thorough COSTECH and Partner Financial Institution credit assessment and qualifies",
        "The business has the potential of creating employment, generating tax revenue thus contributing to the country’s economic growth",
        "Can offer any enforceable collateral including personal guarantee and third-party guarantee",
        "Must have a positive credit score",
        "Has potential to attract commercial funding once the innovation is de-risked",
        "Has demonstrated financial traction"
      ],
      deadline: "Opens on May 5th, 2025 (Ongoing)",
      origin: "Tanzania",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isFeatured: true
    });

    // 4. TRA Innovation Portal Challenge
    await addDoc(collection(db, 'opportunities'), {
      title: "TRA Innovation Portal Challenge (Mbunifu Jiamulie Mambo)",
      provider: "Tanzania Revenue Authority (TRA)",
      amount: "Awards Up to 50 Million TZS (Innovation Grant & Integration opportunity)",
      category: "ruzuku",
      description: "An open invitation for Tanzanian innovators to submit ideas and products that streamline tax administration, broaden the tax base, simplify compliance for small businesses, or leverage cutting-edge tech such as AI and Blockchain for TRA integration.",
      eligibility: [
        "Tanzanian individual innovators, system developers, tech generalists, or early startups",
        "Solutions targeting: tax base widening, small business tax simplification, digital tax channels, or revenue collection cost reduction",
        "Use of advanced technologies (AI, Big Data, Blockchain) in modern tax administration and dispute resolution",
        "Aiming to make tax services faster, more transparent, and highly reliable"
      ],
      deadline: "Ongoing Applications",
      origin: "Tanzania",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isFeatured: true
    });

    console.log("Successfully added new grants/events!");
  } catch (e) {
    console.error("Error adding doc:", e);
  } finally {
    await deleteApp(tempApp);
  }
}

main();
