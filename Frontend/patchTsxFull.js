const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'screens');

const replacements = [
  {
    file: 'FamilyPlanningScreen.tsx',
    replacements: [
      {
        old: '>Discover evidence-based guidance, track your milestones, and build a healthy foundation for your growing family.<',
        new: '>{t("heroDescriptionFP")}<'
      }
    ]
  },
  {
    file: 'PreconceptionCareScreen.tsx',
    replacements: [
      { old: '>The Essential Guide to Preconception Care<', new: '>{t("preconceptionSubtitle")}<' },
      { old: '>Preparing your body for a healthy pregnancy starts well before conception. Discover the crucial steps for both partners to ensure optimal health.<', new: '>{t("preconceptionIntroText")}<' },
      { old: '>Preconception care is a vital, proactive approach to family planning that focuses on optimizing health and identifying potential risks before conception. It\'s not just for women; preconception health is equally important for men to ensure healthy sperm development and a supportive environment.<', new: '>{t("preconceptionPara1")}<' },
      { old: '>Why Preconception Care Matters<', new: '>{t("preconceptionWhyMatters")}<' },
      { old: '>Many critical developments in fetal growth occur within the first few weeks of pregnancy often before a woman even realizes she is pregnant. By adopting healthy habits and addressing medical conditions early, you significantly reduce the risk of complications and birth defects.<', new: '>{t("preconceptionPara2")}<' },
      { old: '>The Preconception Checklist<', new: '>{t("preconceptionChecklist")}<' },
      { old: '>Health Screenings<', new: '>{t("preconceptionHealthScreenings")}<' },
      { old: '>Comprehensive blood panel & thyroid check.<', new: '>{t("preconceptionCheck1")}<' },
      { old: '>Screening for STIs and genetic carrier testing.<', new: '>{t("preconceptionCheck2")}<' },
      { old: '>Review of current medications and immunizations.<', new: '>{t("preconceptionCheck3")}<' },
      { old: '>Nutrition & Vitamins<', new: '>{t("preconceptionNutritionVitamins")}<' },
      { old: '>Start a daily prenatal vitamin with 400mcg of Folic Acid.<', new: '>{t("preconceptionCheck4")}<' },
      { old: '>Ensure adequate Iron, Calcium, and Vitamin D intake.<', new: '>{t("preconceptionCheck5")}<' },
      { old: '>Adopt a balanced diet rich in leafy greens and lean proteins.<', new: '>{t("preconceptionCheck6")}<' },
      { old: '>Lifestyle Adjustments<', new: '>{t("preconceptionLifestyle")}<' },
      { old: '>Eliminate alcohol, smoking, and recreational drugs.<', new: '>{t("preconceptionCheck7")}<' },
      { old: '>Limit caffeine intake to less than 200mg per day.<', new: '>{t("preconceptionCheck8")}<' },
      { old: '>Maintain a healthy weight through regular, moderate exercise.<', new: '>{t("preconceptionCheck9")}<' },
      { old: '>Environmental Factors<', new: '>{t("preconceptionEnvironment")}<' },
      { old: '>Avoid exposure to toxic substances (e.g., strong cleaning chemicals).<', new: '>{t("preconceptionCheck10")}<' },
      { old: '>Manage stress levels with relaxation techniques or counseling.<', new: '>{t("preconceptionCheck11")}<' },
      { old: '>Discuss any workplace hazards with your healthcare provider.<', new: '>{t("preconceptionCheck12")}<' },
      { old: '>A Note for Partners<', new: '>{t("preconceptionPartnersNote")}<' },
      { old: '>Sperm generation takes about 74 days. Male partners should adopt healthier lifestyle choices—such as reducing alcohol, quitting smoking, and eating a balanced diet—at least three months before trying to conceive.<', new: '>{t("preconceptionPartnersDesc")}<' }
    ]
  },
  {
    file: 'FamilyPlanningMethodsScreen.tsx',
    replacements: [
      { old: '>Family Planning Guide<', new: '>{t("fpMethodsHeader")}<' },
      { old: 'Family Planning{\\\'\\\\n\\\'}in Sri Lanka', new: '{t("fpMethodsTitle")}' },
      { old: '>Every family’s journey is different. Whether you are preparing for your first baby, considering another child, or choosing to delay pregnancy, family planning helps you make informed decisions about your future. It supports your right to decide whether and when to have children, while reducing the health risks associated with unintended pregnancies.<', new: '>{t("fpMethodsP1")}<' },
      { old: '>Prepare for pregnancy with confidence<', new: '>{t("fpMethodsH2_1")}<' },
      { old: '>A healthy pregnancy begins with care before conception. Arrange a discussion with a healthcare professional about existing health conditions, medicines, vaccinations, and any concerns about previous pregnancies or inherited conditions. This helps identify the support you may need before trying for a baby.<', new: '>{t("fpMethodsP2")}<' },
      { old: '>Folic acid is an important part of this preparation. WHO recommends 400 micrograms daily from the time you begin trying to conceive until 12 weeks of pregnancy. Ask your doctor or clinic about the appropriate dose for you, as some people need a different prescription.<', new: '>{t("fpMethodsP3")}<' },
      { old: '>Understand your family planning options<', new: '>{t("fpMethodsH2_2")}<' },
      { old: '>Contraceptive methods differ in how they are used and how long they work. Options include:<', new: '>{t("fpMethodsP4")}<' },
      { old: '>Condoms: <', new: '>{t("fpMethodsL1Bold")}<' },
      { old: '>Help prevent pregnancy and also protect against sexually transmitted infections.<', new: '>{t("fpMethodsL1Desc")}<' },
      { old: '>Contraceptive pills: <', new: '>{t("fpMethodsL2Bold")}<' },
      { old: '>Require regular use according to the prescribed instructions.<', new: '>{t("fpMethodsL2Desc")}<' },
      { old: '>Injectable contraceptives: <', new: '>{t("fpMethodsL3Bold")}<' },
      { old: '>Require repeat appointments at the recommended intervals.<', new: '>{t("fpMethodsL3Desc")}<' },
      { old: '>Implants and IUDs: <', new: '>{t("fpMethodsL4Bold")}<' },
      { old: '>Provide highly effective, long-lasting, reversible contraception.<', new: '>{t("fpMethodsL4Desc")}<' },
      { old: '>Permanent methods: <', new: '>{t("fpMethodsL5Bold")}<' },
      { old: '>Intended for people who are certain they do not want future pregnancies.<', new: '>{t("fpMethodsL5Desc")}<' },
      { old: '>Fertility-awareness methods require careful monitoring and are generally less reliable than modern contraceptive methods. Your health, breastfeeding status, preferences, and future pregnancy plans should guide your choice with a trained healthcare provider.<', new: '>{t("fpMethodsP5")}<' },
      { old: '>Build healthy everyday habits<', new: '>{t("fpMethodsH2_3")}<' },
      { old: '>Choose varied, balanced meals using familiar foods such as vegetables, leafy greens, fruit, dhal, beans, whole grains, eggs, or fish. Limit foods and drinks high in added sugar, salt, and unhealthy fats. Healthy eating supports your general wellbeing as you prepare for parenthood.<', new: '>{t("fpMethodsP6")}<' },
      { old: '>Regular physical activity and avoiding tobacco and alcohol are also part of preparing for pregnancy. Both partners can support healthier routines and discuss concerns with a healthcare professional. Small, consistent changes can make preparation more manageable.<', new: '>{t("fpMethodsP7")}<' },
      { old: '>Find support in Sri Lanka<', new: '>{t("fpMethodsSupportTitle")}<' },
      { old: '>Your local Public Health Midwife (PHM) or Medical Officer of Health (MOH) clinic is a practical starting point for family planning advice. Ask about available methods, possible side effects, follow-up appointments, and planning pregnancy after childbirth.<', new: '>{t("fpMethodsSupportDesc")}<' },
      { old: '>Take the next step<', new: '>{t("fpMethodsNextStepTitle")}<' },
      { old: '>Write down your questions and discuss your goals with a healthcare professional. You may involve your partner if you wish, while keeping your own comfort and preferences central to the decision.<', new: '>{t("fpMethodsNextStepDesc")}<' },
      { old: '>This article provides general health information. Your PHM or doctor can help you choose care suited to your individual needs.<', new: '>{t("fpMethodsDisclaimer")}<' }
    ]
  },
  {
    file: 'NutritionGuideScreen.tsx',
    replacements: [
      { old: '>Nutrition Guide<', new: '>{t("nutritionHeaderTitle")}<' },
      { old: 'Nutrition Guide{\\\'\\\\n\\\'}for Toddlers', new: '{t("nutritionTitle")}' },
      { old: '>By Dr. Amarasinghe • 5 min read<', new: '>{t("nutritionAuthor")}<' },
      { old: '>Ensuring your toddler receives the right balance of nutrients is crucial for their rapid physical and cognitive development during these formative years. As they transition from infant formulas or breast milk to solid foods, introducing a variety of textures and flavors helps establish healthy lifelong eating habits.<', new: '>{t("nutritionP1")}<' },
      { old: '>Building a Balanced Plate<', new: '>{t("nutritionH2_1")}<' },
      { old: '>A toddler\'s stomach is small, so they need nutrient-dense meals and snacks spread throughout the day. Aim for three small meals and two to three healthy snacks daily. Each main meal should ideally include components from major food groups.<', new: '>{t("nutritionP2")}<' },
      { old: '>Proteins: <', new: '>{t("nutritionL1Bold")}<' },
      { old: '>Essential for growth. Include lean meats, poultry, fish, eggs, beans, and lentils.<', new: '>{t("nutritionL1Desc")}<' },
      { old: '>Carbohydrates: <', new: '>{t("nutritionL2Bold")}<' },
      { old: '>Provide necessary energy. Focus on whole grains like brown rice, whole-wheat pasta, and oats.<', new: '>{t("nutritionL2Desc")}<' },
      { old: '>Fruits & Vegetables: <', new: '>{t("nutritionL3Bold")}<' },
      { old: '>Vital for vitamins, minerals, and fiber. Offer a rainbow of colors daily.<', new: '>{t("nutritionL3Desc")}<' },
      { old: '>Dairy or Alternatives: <', new: '>{t("nutritionL4Bold")}<' },
      { old: '>Crucial for calcium and bone health. Whole milk, yogurt, and cheese are excellent choices for this age group.<', new: '>{t("nutritionL4Desc")}<' },
      { old: '>Key Tip: Managing Picky Eating<', new: '>{t("nutritionTipTitle")}<' },
      { old: '>It\'s common for toddlers to suddenly refuse foods they previously loved. Keep offering a variety of healthy options without pressuring them to eat. It can take up to 15 exposures to a new food before a child accepts it.<', new: '>{t("nutritionTipDesc")}<' },
      { old: '>Foods to Limit or Avoid<', new: '>{t("nutritionH2_2")}<' },
      { old: '>While exploring new foods is encouraged, certain items should be restricted to protect a toddler\'s developing system and prevent choking hazards.<', new: '>{t("nutritionP3")}<' },
      { old: '>Choking Hazards<', new: '>{t("nutritionHazard1Title")}<' },
      { old: '>Avoid whole grapes, nuts, popcorn, hot dogs (unless cut lengthwise), and hard candies.<', new: '>{t("nutritionHazard1Desc")}<' },
      { old: '>Added Sugars & Sodium<', new: '>{t("nutritionHazard2Title")}<' },
      { old: '>Limit fruit juices (even 100% juice), highly processed snacks, and foods with high added salt content.<', new: '>{t("nutritionHazard2Desc")}<' }
    ]
  },
  {
    file: 'WhyImmunizeScreen.tsx',
    replacements: [
      { old: '>Immunization is one of the safest and most effective ways to protect your child\'s health and the well-being of the community. Here is why staying on schedule matters.<', new: '>{t("whyImmunizeIntroText")}<' },
      { old: '>Vaccines train your child\'s immune system to recognize and fight serious diseases, providing immunity before exposure.<', new: '>{t("whyImmunizeReason1Desc")}<' },
      { old: '>High vaccination rates prevent outbreaks, protecting vulnerable individuals who cannot be vaccinated due to medical conditions.<', new: '>{t("whyImmunizeReason2Desc")}<' },
      { old: '>Check your personalized immunization timeline or book an appointment with your pediatrician.<', new: '>{t("whyImmunizeActionDesc")}<' }
    ]
  }
];

function patchTsx() {
  for (const rep of replacements) {
    const filePath = path.join(srcDir, rep.file);
    if (!fs.existsSync(filePath)) {
      console.log('Skipping ' + rep.file);
      continue;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    for (const r of rep.replacements) {
      if (!content.includes(r.old)) {
         // handle the case with newlines replacing
         if(r.old.includes('{\\\'\\\\n\\\'}')) {
             let altOld = `>${r.old.replace(/{\\\'\\\\n\\\'}/g, '\\n')}<`;
             let altOld2 = `>${r.old.replace(/{\\\'\\\\n\\\'}/g, '\\n').replace(/Family Planning/, 'Family Planning\n')}<`;
             // simpler regex for Family Planning in Sri Lanka
             if(rep.file === 'FamilyPlanningMethodsScreen.tsx' && r.old.includes('Sri Lanka')) {
                 content = content.replace(/Family Planning\{\'\\n\'\}in Sri Lanka/, '{t("fpMethodsTitle")}');
             }
             if(rep.file === 'NutritionGuideScreen.tsx' && r.old.includes('Toddlers')) {
                 content = content.replace(/Nutrition Guide\{\'\\n\'\}for Toddlers/, '{t("nutritionTitle")}');
             }
         } else {
             console.log('Could not find string in ' + rep.file + ': ' + r.old.substring(0, 30));
         }
      }
      content = content.replace(r.old, r.new);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched ' + rep.file);
  }
}

patchTsx();
