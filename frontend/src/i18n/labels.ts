export const getProviderLabel = (value: string, locale: string): string => {
  const dict: Record<string, Record<string, string>> = {
    en: {
      gcp: 'Google Cloud Platform (GCP)',
      aws: 'Amazon Web Services (AWS)',
      azure: 'Microsoft Azure (Azure)',
      onprem: 'On-Premises / Private Cloud'
    },
    es: {
      gcp: 'Google Cloud Platform (GCP)',
      aws: 'Amazon Web Services (AWS)',
      azure: 'Microsoft Azure (Azure)',
      onprem: 'En las instalaciones / Nube privada'
    },
    fr: {
      gcp: 'Google Cloud Platform (GCP)',
      aws: 'Amazon Web Services (AWS)',
      azure: 'Microsoft Azure (Azure)',
      onprem: 'Sur site / Cloud privé'
    },
    de: {
      gcp: 'Google Cloud Platform (GCP)',
      aws: 'Amazon Web Services (AWS)',
      azure: 'Microsoft Azure (Azure)',
      onprem: 'On-Premises / Private Cloud'
    },
    zh: {
      gcp: '谷歌云平台 (GCP)',
      aws: '亚马逊云服务 (AWS)',
      azure: '微软 Azure (Azure)',
      onprem: '本地部署 / 私有云'
    },
    ja: {
      gcp: 'Google Cloud Platform (GCP)',
      aws: 'Amazon Web Services (AWS)',
      azure: 'Microsoft Azure (Azure)',
      onprem: 'オンプレミス / プライベートクラウド'
    },
    kn: {
      gcp: 'ಗೂಗಲ್ ಕ್ಲೌಡ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ (GCP)',
      aws: 'ಅಮೆಜಾನ್ ವೆಬ್ ಸರ್ವೀಸಸ್ (AWS)',
      azure: 'ಮೈಕ್ರೋಸಾಫ್ಟ್ ಅಜುರೆ (Azure)',
      onprem: 'ಸ್ಥಳೀಯ / ಖಾಸಗಿ ಕ್ಲೌಡ್'
    },
    hi: {
      gcp: 'गूगल क्लाउड प्लेटफॉर्म (GCP)',
      aws: 'अमेज़न वेब सर्विसेज (AWS)',
      azure: 'माइक्रोसॉफ्ट अज़ूर (Azure)',
      onprem: 'ऑन-प्रिमाइसेस / निजी क्लाउड'
    },
    ta: {
      gcp: 'கூகிள் கிளவுட் பிளாட்பார்ம் (GCP)',
      aws: 'அமேசான் வெப் சர்வீசஸ் (AWS)',
      azure: 'மைக்ரோசாப்ட் அஸூர் (Azure)',
      onprem: 'உள்ளூர் / தனியார் கிளவுட்'
    },
    te: {
      gcp: 'గూగుల్ క్లౌడ్ ప్లాట్‌ఫారమ్ (GCP)',
      aws: 'అమెజాన్ వెబ్ సర్వీసెస్ (AWS)',
      azure: 'మైక్రోసాఫ్ట్ అజూర్ (Azure)',
      onprem: 'ఆన్-ప్రామిసెస్ / ప్రైవేట్ క్లౌడ్'
    },
    ml: {
      gcp: 'ഗൂഗിൾ ക്ലൗഡ് പ്ലാറ്റ്‌ഫോം (GCP)',
      aws: 'ആമസോൺ വെബ് സർവീസസ് (AWS)',
      azure: 'മൈക്രോസോഫ്റ്റ് അജൂർ (Azure)',
      onprem: 'ഓൺ-പ്രമൈസസ് / പ്രൈവറ്റ് ക്ലൗഡ്'
    },
    mr: {
      gcp: 'गुगल क्लाउड प्लॅटफॉर्म (GCP)',
      aws: 'ॲमेझॉन वेब सर्व्हिस (AWS)',
      azure: 'मायक्रोसॉफ्ट अझूर (Azure)',
      onprem: 'ऑन-प्रिमाइसेस / खाजगी क्लाउड'
    },
    bn: {
      gcp: 'গুগল ক্লাউড প্ল্যাটফর্ম (GCP)',
      aws: 'অ্যামাজন ওয়েব সার্ভিসেস (AWS)',
      azure: 'মাইক্রোসফট অ্যাজুর (Azure)',
      onprem: 'অন-প্রেমিসেস / প্রাইভেট ক্লাউড'
    },
    gu: {
      gcp: 'ગૂગલ ક્લાઉડ પ્લેટફોર્મ (GCP)',
      aws: 'એમેઝોન વેબ સર્વિસીસ (AWS)',
      azure: 'માઇક્રોસોફ્ટ અઝુર (Azure)',
      onprem: 'ઓન-પ્રિમાઈસીસ / ખાનગી ક્લાઉડ'
    }
  };
  return (dict[locale] || dict["en"])[value] || (dict["en"][value] || value);
};

export const getRegionLabel = (value: string, locale: string): string => {
  const dict: Record<string, Record<string, string>> = {
    en: {
      'us-central1': 'us-central1 (Iowa) - Grid Average (400g/kWh)',
      'europe-west4': 'europe-west4 (Eemshaven) - CFE Match (50g/kWh)',
      'us-east4': 'us-east4 (N. Virginia) - Coal Heavy (450g/kWh)',
      'us-east-1': 'us-east-1 (N. Virginia) - Coal Heavy (450g/kWh)',
      'us-west-2': 'us-west-2 (Oregon) - Clean Hydro (80g/kWh)',
      'eu-west-1': 'eu-west-1 (Ireland) - Wind/Gas Mix (280g/kWh)',
      'eu-central-1': 'eu-central-1 (Frankfurt) - Grid Mix (350g/kWh)',
      'eastus': 'eastus (N. Virginia) - Coal Heavy (450g/kWh)',
      'westeurope': 'westeurope (Netherlands) - Low Carbon (50g/kWh)',
      'swedencentral': 'swedencentral (Sweden) - 100% Hydro/Nuclear (10g/kWh)',
      'local-onprem': 'local-onprem (US Grid Average) - (380g/kWh)'
    },
    es: {
      'us-central1': 'us-central1 (Iowa) - Promedio de Red (400g/kWh)',
      'europe-west4': 'europe-west4 (Eemshaven) - CFE Match (50g/kWh)',
      'us-east4': 'us-east4 (N. Virginia) - Carbón Pesado (450g/kWh)',
      'us-east-1': 'us-east-1 (N. Virginia) - Carbón Pesado (450g/kWh)',
      'us-west-2': 'us-west-2 (Oregón) - Hidroeléctrica Limpia (80g/kWh)',
      'eu-west-1': 'eu-west-1 (Irlanda) - Mezcla de Viento/Gas (280g/kWh)',
      'eu-central-1': 'eu-central-1 (Fráncfort) - Mezcla de Red (350g/kWh)',
      'eastus': 'eastus (N. Virginia) - Carbón Pesado (450g/kWh)',
      'westeurope': 'westeurope (Países Bajos) - Bajo Carbono (50g/kWh)',
      'swedencentral': 'swedencentral (Suecia) - 100% Hidro/Nuclear (10g/kWh)',
      'local-onprem': 'local-onprem (Promedio de red de EE. UU.) - (380g/kWh)'
    },
    fr: {
      'us-central1': 'us-central1 (Iowa) - Moyenne Réseau (400g/kWh)',
      'europe-west4': 'europe-west4 (Eemshaven) - CFE Match (50g/kWh)',
      'us-east4': 'us-east4 (N. Virginie) - Charbon Lourd (450g/kWh)',
      'us-east-1': 'us-east-1 (N. Virginie) - Charbon Lourd (450g/kWh)',
      'us-west-2': 'us-west-2 (Oregon) - Hydro Énergie (80g/kWh)',
      'eu-west-1': 'eu-west-1 (Irlande) - Mix Vent/Gaz (280g/kWh)',
      'eu-central-1': 'eu-central-1 (Francfort) - Mix Électricité (350g/kWh)',
      'eastus': 'eastus (N. Virginie) - Charbon Lourd (450g/kWh)',
      'westeurope': 'westeurope (Pays-Bas) - Bas Carbone (50g/kWh)',
      'swedencentral': 'swedencentral (Suède) - 100% Hydro/Nucléaire (10g/kWh)',
      'local-onprem': 'local-onprem (Moyenne Réseau US) - (380g/kWh)'
    },
    de: {
      'us-central1': 'us-central1 (Iowa) - Netzstromschnitt (400g/kWh)',
      'europe-west4': 'europe-west4 (Eemshaven) - CFE Match (50g/kWh)',
      'us-east4': 'us-east4 (Nord-Virginia) - Kohleintensiv (450g/kWh)',
      'us-east-1': 'us-east-1 (Nord-Virginia) - Kohleintensiv (450g/kWh)',
      'us-west-2': 'us-west-2 (Oregon) - Saubere Wasserkraft (80g/kWh)',
      'eu-west-1': 'eu-west-1 (Irland) - Wind-/Gasmix (280g/kWh)',
      'eu-central-1': 'eu-central-1 (Frankfurt) - Netzmix (350g/kWh)',
      'eastus': 'eastus (Nord-Virginia) - Kohleintensiv (450g/kWh)',
      'westeurope': 'westeurope (Niederlande) - Kohlenstoffarm (50g/kWh)',
      'swedencentral': 'swedencentral (Schweden) - 100% Wasserkraft/Kernkraft (10g/kWh)',
      'local-onprem': 'local-onprem (US Netzstromdurchschnitt) - (380g/kWh)'
    },
    zh: {
      'us-central1': 'us-central1 (艾奥瓦) - 电网平均电能 (400g/kWh)',
      'europe-west4': 'europe-west4 (埃姆斯哈文) - 无碳匹配 (50g/kWh)',
      'us-east4': 'us-east4 (弗吉尼亚北部) - 煤电重度 (450g/kWh)',
      'us-east-1': 'us-east-1 (弗吉尼亚北部) - 煤电重度 (450g/kWh)',
      'us-west-2': 'us-west-2 (俄勒冈) - 清洁水电 (80g/kWh)',
      'eu-west-1': 'eu-west-1 (爱尔兰) - 风能/天然气混合 (280g/kWh)',
      'eu-central-1': 'eu-central-1 (法兰克福) - 电网混合能源 (350g/kWh)',
      'eastus': 'eastus (弗吉尼亚北部) - 煤电重度 (450g/kWh)',
      'westeurope': 'westeurope (荷兰) - 低碳电能 (50g/kWh)',
      'swedencentral': 'swedencentral (瑞典) - 100% 水电/核电 (10g/kWh)',
      'local-onprem': 'local-onprem (美国电网平均) - (380g/kWh)'
    },
    ja: {
      'us-central1': 'us-central1 (アイオワ) - グリッド平均 (400g/kWh)',
      'europe-west4': 'europe-west4 (エームスハーフェン) - CFEマッチ (50g/kWh)',
      'us-east4': 'us-east4 (バージニア北部) - 高炭素石炭火力 (450g/kWh)',
      'us-east-1': 'us-east-1 (バージニア北部) - 高炭素石炭火力 (450g/kWh)',
      'us-west-2': 'us-west-2 (オレゴン) - クリーン水力 (80g/kWh)',
      'eu-west-1': 'eu-west-1 (アイルランド) - 風力/ガス混合 (280g/kWh)',
      'eu-central-1': 'eu-central-1 (フランクフルト) - グリッド混合 (350g/kWh)',
      'eastus': 'eastus (バージニア北部) - 高炭素石炭火力 (450g/kWh)',
      'westeurope': 'westeurope (オランダ) - 低炭素エネルギー (50g/kWh)',
      'swedencentral': 'swedencentral (スウェーデン) - 100% 水力/原子力 (10g/kWh)',
      'local-onprem': 'local-onprem (米国グリッド平均) - (380g/kWh)'
    },
    kn: {
      'us-central1': 'us-central1 (ಅಯೋವಾ) - ಗ್ರಿಡ್ ಸರಾಸರಿ (೪೦೦g/kWh)',
      'europe-west4': 'europe-west4 (ಎಮ್‌ಶಾವನ್) - ಸಿಎಫ್‌ಇ ಮ್ಯಾಚ್ (೫೦g/kWh)',
      'us-east4': 'us-east4 (ಉತ್ತರ ವರ್ಜೀನಿಯಾ) - ಕಲ್ಲಿದ್ದಲು ಗರಿಷ್ಠ (೪೫೦g/kWh)',
      'us-east-1': 'us-east-1 (ಉತ್ತರ ವರ್ಜೀನಿಯಾ) - ಕಲ್ಲಿದ್ದಲು ಗರಿಷ್ಠ (೪೫೦g/kWh)',
      'us-west-2': 'us-west-2 (ಒರೆಗಾನ್) - ಶುದ್ಧ ಹೈಡ್ರೋ (೮೦g/kWh)',
      'eu-west-1': 'eu-west-1 (ಐರ್ಲೆಂಡ್) - ವಿಂಡ್/ಗ್ಯಾಸ್ ಮಿಕ್ಸ್ (೨೮೦g/kWh)',
      'eu-central-1': 'eu-central-1 (ಫ್ರಾಂಕ್‌ಫರ್ಟ್) - ಗ್ರಿಡ್ ಮಿಕ್ಸ್ (೩೫೦g/kWh)',
      'eastus': 'eastus (ಉತ್ತರ ವರ್ಜೀನಿಯಾ) - ಕಲ್ಲಿದ್ದಲು ಗರಿಷ್ಠ (೪೫೦g/kWh)',
      'westeurope': 'westeurope (ನೆದರ್ಲ್ಯಾಂಡ್ಸ್) - ಕಡಿಮೆ ಇಂಗಾಲ (೫೦g/kWh)',
      'swedencentral': 'swedencentral (ಸ್ವೀಡನ್) - ೧೦೦% ಹೈಡ್ರೋ/ವಿದ್ಯುತ್ (೧೦g/kWh)',
      'local-onprem': 'local-onprem (ಸ್ಥಳೀಯ ಸರಾಸರಿ) - (೩೮೦g/kWh)'
    },
    hi: {
      'us-central1': 'us-central1 (आयोवा) - ग्रिड औसत (400g/kWh)',
      'europe-west4': 'europe-west4 (एम्सहेवन) - सीएफई मैच (50g/kWh)',
      'us-east4': 'us-east4 (उत्तरी वर्जीनिया) - कोयला भारी (450g/kWh)',
      'us-east-1': 'us-east-1 (उत्तरी वर्जीनिया) - कोयला भारी (450g/kWh)',
      'us-west-2': 'us-west-2 (ओरेगन) - स्वच्छ हाइड्रो (80g/kWh)',
      'eu-west-1': 'eu-west-1 (आयरलैंड) - पवन/गैस मिश्रण (280g/kWh)',
      'eu-central-1': 'eu-central-1 (फ्रैंकफर्ट) - ग्रिड मिश्रण (350g/kWh)',
      'eastus': 'eastus (उत्तरी वर्जीनिया) - कोयला भारी (450g/kWh)',
      'westeurope': 'westeurope (नीदरलैंड) - कम कार्बन (50g/kWh)',
      'swedencentral': 'swedencentral (स्वीडन) - 100% हाइड्रो/परमाणु (10g/kWh)',
      'local-onprem': 'local-onprem (स्थानीय ग्रिड औसत) - (380g/kWh)'
    },
    ta: {
      'us-central1': 'us-central1 (அயோவா) - சராசரி மின்சாரம் (400g/kWh)',
      'europe-west4': 'europe-west4 (எம்ஸ்ஹேவன்) - பசுமை மின்சாரம் (50g/kWh)',
      'us-east4': 'us-east4 (வடக்கு விர்ஜினியா) - நிலக்கரி மின்சாரம் (450g/kWh)',
      'us-east-1': 'us-east-1 (வடக்கு விர்ஜினியா) - நிலக்கரி மின்சாரம் (450g/kWh)',
      'us-west-2': 'us-west-2 (ஒரிகான்) - நீர் மின்சாரம் (80g/kWh)',
      'eu-west-1': 'eu-west-1 (அயர்லாந்து) - காற்று/எరిவாயு கலவை (280g/kWh)',
      'eu-central-1': 'eu-central-1 (பிராங்பேர்ட்) - மின்சார கலவை (350g/kWh)',
      'eastus': 'eastus (வடக்கு விர்ஜினியா) - நிலக்கரி மின்சாரம் (450g/kWh)',
      'westeurope': 'westeurope (நெதர்லாந்து) - குறைந்த கார்பன் (50g/kWh)',
      'swedencentral': 'swedencentral (ஸ்வீடன்) - 100% நீர்/அணு மின்சாரம் (10g/kWh)',
      'local-onprem': 'local-onprem (உள்ளூர் சராசரி) - (380g/kWh)'
    },
    te: {
      'us-central1': 'us-central1 (ఐయోవా) - గ్రిడ్ సగటు (400g/kWh)',
      'europe-west4': 'europe-west4 (ఎమ్స్‌హావెన్) - CFE సరిపోలిక (50g/kWh)',
      'us-east4': 'us-east4 (ఉత్తర వర్జీనియా) - బొగ్గు అధికం (450g/kWh)',
      'us-east-1': 'us-east-1 (ఉత్తర వర్జీనియా) - బొగ్గు అధికం (450g/kWh)',
      'us-west-2': 'us-west-2 (ఒరెగాన్) - స్వచ్ఛమైన జలవిద్యుత్ (80g/kWh)',
      'eu-west-1': 'eu-west-1 (ఐర్లాండ్) - గాలి/గ్యాస్ మిశ్రమం (280g/kWh)',
      'eu-central-1': 'eu-central-1 (ఫ్రాంక్‌ఫర్ట్) - గ్రిడ్ మిశ్రమం (350g/kWh)',
      'eastus': 'eastus (ఉత్తర వర్జీనియా) - బొగ్గు అధికం (450g/kWh)',
      'westeurope': 'westeurope (నెదర్లాండ్స్) - తక్కువ కార్బన్ (50g/kWh)',
      'swedencentral': 'swedencentral (స్వీడన్) - 100% జల/అణుశక్తి (10g/kWh)',
      'local-onprem': 'local-onprem (యుఎస్ గ్రిడ్ సగటు) - (380g/kWh)'
    },
    ml: {
      'us-central1': 'us-central1 (അയോവ) - ഗ്രിഡ് ശരാശരി (400g/kWh)',
      'europe-west4': 'europe-west4 (എംഷാവൻ) - CFE മാച്ച് (50g/kWh)',
      'us-east4': 'us-east4 (ഉത്തര വിർജീനിയ) - കൽക്കരി ഉയർന്നത് (450g/kWh)',
      'us-east-1': 'us-east-1 (ഉത്തര വിർജീനിയ) - കൽക്കരി ഉയർന്നത് (450g/kWh)',
      'us-west-2': 'us-west-2 (ഒറിഗോൺ) - ക്ലീൻ ഹൈഡ്രോ (80g/kWh)',
      'eu-west-1': 'eu-west-1 (അയർലൻഡ്) - വിൻഡ്/ഗ്യാസ് മിശ്രിതം (280g/kWh)',
      'eu-central-1': 'eu-central-1 (ഫ്രാങ്ക്ഫർട്ട്) - ഗ്രിഡ് മിശ്രിതം (350g/kWh)',
      'eastus': 'eastus (ഉത്തര വിർജീനിയ) - കൽക്കരി ഉയർന്നത് (450g/kWh)',
      'westeurope': 'westeurope (നെതർലാൻഡ്‌സ്) - കുറഞ്ഞ കാർബൺ (50g/kWh)',
      'swedencentral': 'swedencentral (സ്വീഡൻ) - 100% ഹൈഡ്രോ/ന്യൂക്ലിയർ (10g/kWh)',
      'local-onprem': 'local-onprem (യുഎസ് ഗ്രിഡ് ശരാശരി) - (380g/kWh)'
    },
    mr: {
      'us-central1': 'us-central1 (आयओवा) - ग्रीड सरासरी (400g/kWh)',
      'europe-west4': 'europe-west4 (एम्सहेवन) - CFE मॅच (50g/kWh)',
      'us-east4': 'us-east4 (उत्तरी व्हर्जिनिया) - कोळसा जास्त (450g/kWh)',
      'us-east-1': 'us-east-1 (उत्तरी व्हर्जिनिया) - कोळसा जास्त (450g/kWh)',
      'us-west-2': 'us-west-2 (ओरेगॉन) - स्वच्छ जलविद्युत (80g/kWh)',
      'eu-west-1': 'eu-west-1 (आयर्लंड) - वारा/गॅस मिश्रण (280g/kWh)',
      'eu-central-1': 'eu-central-1 (फ्रँकफर्ट) - ग्रीड मिश्रण (350g/kWh)',
      'eastus': 'eastus (उत्तरी व्हर्जिनिया) - कोळसा जास्त (450g/kWh)',
      'westeurope': 'westeurope (नेदरलँड्स) - कमी कार्बन (50g/kWh)',
      'swedencentral': 'swedencentral (स्वीडन) - 100% जल/अणू (10g/kWh)',
      'local-onprem': 'local-onprem (यूएस ग्रीड सरासरी) - (380g/kWh)'
    },
    bn: {
      'us-central1': 'us-central1 (আওওয়া) - গ্রিড গড় (400g/kWh)',
      'europe-west4': 'europe-west4 (এমসহেভেন) - CFE ম্যাচ (50g/kWh)',
      'us-east4': 'us-east4 (উঃ ভার্জিনিয়া) - উচ্চ কয়লা (450g/kWh)',
      'us-east-1': 'us-east-1 (উঃ ভার্জিনিয়া) - উচ্চ কয়লা (450g/kWh)',
      'us-west-2': 'us-west-2 (ওরেগন) - জলবিদ্যুৎ (80g/kWh)',
      'eu-west-1': 'eu-west-1 (আয়ারল্যান্ড) - বায়ু/গ্যাস মিশ্রণ (280g/kWh)',
      'eu-central-1': 'eu-central-1 (ফ্রাঙ্কফুর্ট) - গ্রিড মিশ্রণ (350g/kWh)',
      'eastus': 'eastus (উঃ ভার্জিনিয়া) - উচ্চ কয়লা (450g/kWh)',
      'westeurope': 'westeurope (নেদারল্যান্ডস) - কম কার্বন (50g/kWh)',
      'swedencentral': 'swedencentral (সুইডেন) - ১০০% জল/পারমাণবিক (10g/kWh)',
      'local-onprem': 'local-onprem (ইউএস গ্রিড গড়) - (380g/kWh)'
    },
    gu: {
      'us-central1': 'us-central1 (આયોવા) - ગ્રીડ સરેરાશ (400g/kWh)',
      'europe-west4': 'europe-west4 (એમ્સહેવન) - CFE મેચ (50g/kWh)',
      'us-east4': 'us-east4 (ઉત્તર વર્જિનિયા) - કોલસો ભારે (450g/kWh)',
      'us-east-1': 'us-east-1 (ઉત્તર વર્જિનિયા) - કોલસો ભારે (450g/kWh)',
      'us-west-2': 'us-west-2 (ઓરેગોન) - સ્વચ્છ જળવિદ્યુત (80g/kWh)',
      'eu-west-1': 'eu-west-1 (આયર્લેન્ડ) - પવન/ગેસ મિશ્રણ (280g/kWh)',
      'eu-central-1': 'eu-central-1 (ફ્રેન્કફર્ટ) - ગ્રીડ મિશ્રણ (350g/kWh)',
      'eastus': 'eastus (ઉત્તર વર્જિનિયા) - કોલસો ભારે (450g/kWh)',
      'westeurope': 'westeurope (નેધરલેન્ડ) - ઓછું કાર્બન (50g/kWh)',
      'swedencentral': 'swedencentral (સ્વીડન) - 100% જળ/અણુશક્તિ (10g/kWh)',
      'local-onprem': 'local-onprem (યુએસ ગ્રીડ સરેરાશ) - (380g/kWh)'
    }
  };
  return (dict[locale] || dict["en"])[value] || (dict["en"][value] || value);
};

export const getModelLabel = (value: string, locale: string): string => {
  const dict: Record<string, Record<string, string>> = {
    en: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (Heavy reasoning / high power)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (Lightweight / energy efficient)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (Next-gen fast / green)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (Advanced reasoning / medium power)',
      'claude-3-haiku': 'Claude 3 Haiku (Extremely fast / low power)',
      'llama-3-1-70b': 'Llama 3.1 70B (High capacity open weights / medium power)',
      'llama-3-8b': 'Llama 3 8B (Compact open weights / low power)',
      'gpt-4o': 'GPT-4o (Omni intelligence / high power)',
      'gpt-4o-mini': 'GPT-4o-mini (Lightweight reasoning / low power)',
      'llama-3-70b': 'Llama 3 70B (Local cluster / high load)',
      'mistral-7b': 'Mistral 7B (Optimized local model / low power)'
    },
    es: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (Razonamiento pesado / alta potencia)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (Ligero / eficiente energéticamente)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (Siguiente generación rápido / verde)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (Razonamiento avanzado / potencia media)',
      'claude-3-haiku': 'Claude 3 Haiku (Extremadamente rápido / baja potencia)',
      'llama-3-1-70b': 'Llama 3.1 70B (Pesos abiertos de alta capacidad / potencia media)',
      'llama-3-8b': 'Llama 3 8B (Pesos abiertos compactos / baja potencia)',
      'gpt-4o': 'GPT-4o (Inteligencia omni / alta potencia)',
      'gpt-4o-mini': 'GPT-4o-mini (Razonamiento ligero / baja potencia)',
      'llama-3-70b': 'Llama 3 70B (Clúster local / alta carga)',
      'mistral-7b': 'Mistral 7B (Modelo local optimizado / baja potencia)'
    },
    fr: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (Raisonnement lourd / haute puissance)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (Léger / éco-énergétique)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (Génération future rapide / vert)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (Raisonnement avancé / puissance moyenne)',
      'claude-3-haiku': 'Claude 3 Haiku (Extrêmement rapide / faible puissance)',
      'llama-3-1-70b': 'Llama 3.1 70B (Modèle ouvert grande capacité / puissance moyenne)',
      'llama-3-8b': 'Llama 3 8B (Modèle ouvert compact / faible puissance)',
      'gpt-4o': 'GPT-4o (Intelligence omni / haute puissance)',
      'gpt-4o-mini': 'GPT-4o-mini (Raisonnement léger / faible puissance)',
      'llama-3-70b': 'Llama 3 70B (Serveur local / charge élevée)',
      'mistral-7b': 'Mistral 7B (Modèle local optimisé / faible puissance)'
    },
    de: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (Komplexes Denken / hohe Leistung)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (Leichtgewichtig / energieeffizient)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (Next-Gen schnell / grün)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (Fortgeschrittenes Denken / mittlere Leistung)',
      'claude-3-haiku': 'Claude 3 Haiku (Extrem schnell / geringe Leistung)',
      'llama-3-1-70b': 'Llama 3.1 70B (Open Weights hohe Kapazität / mittlere Leistung)',
      'llama-3-8b': 'Llama 3 8B (Kompakt Open Weights / geringe Leistung)',
      'gpt-4o': 'GPT-4o (Omni-Intelligenz / hohe Leistung)',
      'gpt-4o-mini': 'GPT-4o-mini (Leichtes Denken / geringe Leistung)',
      'llama-3-70b': 'Llama 3 70B (Lokaler Cluster / hohe Auslastung)',
      'mistral-7b': 'Mistral 7B (Optimiertes lokales Modell / geringe Leistung)'
    },
    zh: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (重度推理 / 高功耗)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (轻量级 / 高能效)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (次世代快速 / 绿色节能)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (高级推理 / 中等功耗)',
      'claude-3-haiku': 'Claude 3 Haiku (极速响应 / 低功耗)',
      'llama-3-1-70b': 'Llama 3.1 70B (高容量开源权重 / 中等功耗)',
      'llama-3-8b': 'Llama 3 8B (紧凑型开源权重 / 低功耗)',
      'gpt-4o': 'GPT-4o (全能智能 / 高功耗)',
      'gpt-4o-mini': 'GPT-4o-mini (轻量级推理 / 低功耗)',
      'llama-3-70b': 'Llama 3 70B (本地集群 / 高负载)',
      'mistral-7b': 'Mistral 7B (优化本地模型 / 低功耗)'
    },
    ja: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (高度な論理推論 / 高電力)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (軽量 / 省電力エネルギー効率)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (次世代高速 / グリーン)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (高度な推論 / 中電力)',
      'claude-3-haiku': 'Claude 3 Haiku (極めて高速 / 低電力)',
      'llama-3-1-70b': 'Llama 3.1 70B (大容量オープンウェイト / 中電力)',
      'llama-3-8b': 'Llama 3 8B (コンパクトオープンウェイト / 低電力)',
      'gpt-4o': 'GPT-4o (オムニマルチモーダル / 高電力)',
      'gpt-4o-mini': 'GPT-4o-mini (軽量推論 / 低電力)',
      'llama-3-70b': 'Llama 3 70B (ローカルクラスタ / 高負荷)',
      'mistral-7b': 'Mistral 7B (最適化ローカルモデル / 低電力)'
    },
    kn: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (ಹೆಚ್ಚಿನ ತಾರ್ಕಿಕತೆ / ಗರಿಷ್ಠ ಶಕ್ತಿ)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (ಹಗುರವಾದ / ಶಕ್ತಿ ಉಳಿತಾಯ)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (ವೇಗವಾದ / ಹಸಿರು ಮಾದರಿ)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (ಸುಧಾರಿತ ತಾರ್ಕಿಕತೆ / ಮಧ್ಯಮ ಶಕ್ತಿ)',
      'claude-3-haiku': 'Claude 3 Haiku (ಅತ್ಯಂತ ವೇಗದ / ಕಡಿಮೆ ಶಕ್ತಿ)',
      'llama-3-1-70b': 'Llama 3.1 70B (ತೆರೆದ ತೂಕಗಳು / ಮಧ್ಯಮ ಶಕ್ತಿ)',
      'llama-3-8b': 'Llama 3 8B (ಕಡಿಮೆ ತೂಕದ ಮಾದರಿ / ಕಡಿಮೆ ಶಕ್ತಿ)',
      'gpt-4o': 'GPT-4o (ಸರ್ವೋತ್ತಮ ಮಾದರಿ / ಗರಿಷ್ಠ ಶಕ್ತಿ)',
      'gpt-4o-mini': 'GPT-4o-mini (ಹಗುರವಾದ ತಾರ್ಕಿಕತೆ / ಕಡಿಮೆ ಶಕ್ತಿ)',
      'llama-3-70b': 'Llama 3 70B (ಸ್ಥಳೀಯ ಕ್ಲಸ್ಟರ್ / ಗರಿಷ್ಠ ಲೋಡ್)',
      'mistral-7b': 'Mistral 7B (ಸುಧಾರಿತ ಸ್ಥಳೀಯ ಮಾದರಿ / ಕಡಿಮೆ ಶಕ್ತಿ)'
    },
    hi: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (गहन तर्क / उच्च शक्ति)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (हल्का / ऊर्जा कुशल)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (अगली पीढ़ी तेज़ / हरित)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (उन्नत तर्क / मध्यम शक्ति)',
      'claude-3-haiku': 'Claude 3 Haiku (अत्यंत तेज़ / कम शक्ति)',
      'llama-3-1-70b': 'Llama 3.1 70B (उच्च क्षमता ओपन वेट्स / मध्यम शक्ति)',
      'llama-3-8b': 'Llama 3 8B (कॉम्पैक्ट ओपन वेट्स / कम शक्ति)',
      'gpt-4o': 'GPT-4o (सर्वव्यापी बुद्धि / उच्च शक्ति)',
      'gpt-4o-mini': 'GPT-4o-mini (हल्का तर्क / कम शक्ति)',
      'llama-3-70b': 'Llama 3 70B (स्थानीय क्लस्टर / उच्च लोड)',
      'mistral-7b': 'Mistral 7B (अनुकूलित स्थानीय मॉडल / कम शक्ति)'
    },
    ta: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (ஆழமான பகுப்பாய்வு / அதிக மின்சாரம்)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (எளிய பயன்பாடு / மின் சேமிப்பு)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (அடுத்த தலைமுறை வேகம் / பசுமை)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (മേம்பட்ட பகுப்பாய்வு / மித மின்சாரம்)',
      'claude-3-haiku': 'Claude 3 Haiku (மிக அதிவேகம் / குறைந்த மின்சாரம்)',
      'llama-3-1-70b': 'Llama 3.1 70B (அதிக திறன் திறந்த எடை / மித மின்சாரம்)',
      'llama-3-8b': 'Llama 3 8B (சிறிய திறந்த எடை / குறைந்த மின்சாரம்)',
      'gpt-4o': 'GPT-4o (அனைத்துத்திறன் / அதிக மின்சாரம்)',
      'gpt-4o-mini': 'GPT-4o-mini (எளிய பகுப்பாய்வு / குறைந்த மின்சாரம்)',
      'llama-3-70b': 'Llama 3 70B (உள்ளூர் கிளஸ்டர் / அதிக சுமை)',
      'mistral-7b': 'Mistral 7B (உகந்த உள்ளூர் மாதிரி / குறைந்த மின்சாரம்)'
    },
    te: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (గహన తార్కికత / అధిక శక్తి)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (తేలికైనది / ఇంధన సమర్థవంతమైనది)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (తదుపరి తరం వేగవంతమైన / హరిత)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (అధునాతన తార్కికత / మధ్యమ శక్తి)',
      'claude-3-haiku': 'Claude 3 Haiku (అత్యంత వేగవంతమైన / తక్కువ శక్తి)',
      'llama-3-1-70b': 'Llama 3.1 70B (అధిక సామర్థ్యం ఓపెన్ వెయిట్స్ / మధ్యమ శక్తి)',
      'llama-3-8b': 'Llama 3 8B (సరికొత్త ఓపెన్ వెయిట్స్ / తక్కువ శక్తి)',
      'gpt-4o': 'GPT-4o (సర్వజ్ఞాన బుద్ధి / అధిక శక్తి)',
      'gpt-4o-mini': 'GPT-4o-mini (తేలికైన తార్కికత / తక్కువ శక్తి)',
      'llama-3-70b': 'Llama 3 70B (స్థానిక క్లస్టర్ / అధిక లోడ్)',
      'mistral-7b': 'Mistral 7B (ఆప్టిమైజ్ చేసిన స్థానిక మోడల్ / తక్కువ శక్తి)'
    },
    ml: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (ഉയർന്ന യുക്തി / ഉയർന്ന പവർ)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (ഭാരം കുറഞ്ഞത് / ഊർജ്ജ കാര്യക്ഷമതയുള്ളത്)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (അടുത്ത തലമുറ വേഗതയേറിയ / പച്ചപ്പ്)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (വിപുലമായ യുക്തി / ഇടത്തരം പവർ)',
      'claude-3-haiku': 'Claude 3 Haiku (വളരെ വേഗതയേറിയ / കുറഞ്ഞ പവർ)',
      'llama-3-1-70b': 'Llama 3.1 70B (ഉയർന്ന ശേഷിയുള്ള ഓപ്പൺ വെയ്റ്റ്‌സ് / ഇടത്തരം പവർ)',
      'llama-3-8b': 'Llama 3 8B (കോംപാക്റ്റ് ഓപ്പൺ വെയ്റ്റ്‌സ് / കുറഞ്ഞ പവർ)',
      'gpt-4o': 'GPT-4o (സർവ്വവ്യാപിയായ ബുദ്ധി / ഉയർന്ന പവർ)',
      'gpt-4o-mini': 'GPT-4o-mini (ഭാരം കുറഞ്ഞ യുക്തി / കുറഞ്ഞ പവർ)',
      'llama-3-70b': 'Llama 3 70B (ലോക്കൽ ക്ലസ്റ്റർ / ഉയർന്ന ലോഡ്)',
      'mistral-7b': 'Mistral 7B (ഒപ്റ്റിമൈസ് ചെയ്ത ലോക്കൽ മോഡൽ / കുറഞ്ഞ പവർ)'
    },
    mr: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (गहन युक्तिवाद / उच्च सामर्थ्य)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (हलके / ऊर्जा कार्यक्षम)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (पुढील पिढी जलद / हरित)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (प्रगत युक्तिवाद / मध्यम सामर्थ्य)',
      'claude-3-haiku': 'Claude 3 Haiku (अतिशय जलद / कमी सामर्थ्य)',
      'llama-3-1-70b': 'Llama 3.1 70B (उच्च क्षमता ओपन वेट्स / मध्यम सामर्थ्य)',
      'llama-3-8b': 'Llama 3 8B (कॉम्पॅक्ट ओपन वेट्स / कमी सामर्थ्य)',
      'gpt-4o': 'GPT-4o (सर्वव्यापी बुद्धिमत्ता / उच्च सामर्थ्य)',
      'gpt-4o-mini': 'GPT-4o-mini (हलका युक्तिवाद / कमी सामर्थ्य)',
      'llama-3-70b': 'Llama 3 70B (स्थानिक क्लस्टर / उच्च लोड)',
      'mistral-7b': 'Mistral 7B (अनुकूलित स्थानिक मॉडेल / कमी सामर्थ्य)'
    },
    bn: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (উচ্চ যুক্তি / উচ্চ শক্তি)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (হালকা / কম শক্তি)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (পরবর্তী প্রজন্ম দ্রুত / সবুজ)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (উন্নত যুক্তি / মাঝারি শক্তি)',
      'claude-3-haiku': 'Claude 3 Haiku (অত্যন্ত দ্রুত / কম শক্তি)',
      'llama-3-1-70b': 'Llama 3.1 70B (উচ্চ ক্ষমতা ওপেন ওয়েটস / মাঝারি শক্তি)',
      'llama-3-8b': 'Llama 3 8B (ছোট ওপেন ওয়েটস / কম শক্তি)',
      'gpt-4o': 'GPT-4o (সর্বজনীন বুদ্ধি / উচ্চ শক্তি)',
      'gpt-4o-mini': 'GPT-4o-mini (হালকা যুক্তি / কম শক্তি)',
      'llama-3-70b': 'Llama 3 70B (স্থানীয় ক্লাস্টার / উচ্চ লোড)',
      'mistral-7b': 'Mistral 7B (অপ্টিমাইজড স্থানীয় মডেল / কম শক্তি)'
    },
    gu: {
      'gemini-1.5-pro': 'Gemini 1.5 Pro (ગહન તર્કશક્તિ / ઉચ્ચ શક્તિ)',
      'gemini-1.5-flash': 'Gemini 1.5 Flash (હલકું / ઊર્જા કાર્યક્ષમ)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (નેક્સ્ટ જનરેશન ઝડપી / ગ્રીન)',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet (અદ્યતન તર્કશક્તિ / મધ્યમ શક્તિ)',
      'claude-3-haiku': 'Claude 3 Haiku (અત્યંત ઝડપી / ઓછી શક્તિ)',
      'llama-3-1-70b': 'Llama 3.1 70B (ઉચ્ચ ક્ષમતા ઓપન વેટ્સ / મધ્યમ શક્તિ)',
      'llama-3-8b': 'Llama 3 8B (કોમ્પેક્ટ ઓપन વેટ્સ / ઓછી શક્તિ)',
      'gpt-4o': 'GPT-4o (સર્વગ્રાહી બુદ્ધિ / ઉચ્ચ શક્તિ)',
      'gpt-4o-mini': 'GPT-4o-mini (હલકું તર્કશક્તિ / ઓછી શક્તિ)',
      'llama-3-70b': 'Llama 3 70B (સ્થાનિક ક્લસ્ટર / ઉચ્ચ લોડ)',
      'mistral-7b': 'Mistral 7B (ઓપ્ટિમાઇઝ સ્થાનિક મોડેલ / ઓછી શક્તિ)'
    }
  };
  return (dict[locale] || dict["en"])[value] || (dict["en"][value] || value);
};
