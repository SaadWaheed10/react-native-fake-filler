import type { LocaleCode } from '../core/types';

export interface LocaleData {
  firstNamesMale: string[];
  firstNamesFemale: string[];
  lastNames: string[];
  cities: string[];
  states: string[];
  streets: string[];
  countryName: string;
  countryDialCode: string;
  postalCodeFormat: () => string;
  phoneFormat: string;
  companies: string[];
  domainTlds: string[];
  /** Right-to-left script locale (Arabic, etc.) */
  rtl?: boolean;
  /** Sample RTL-friendly sentence for description/comment fields */
  sampleSentence?: string;
}

const RTL_LOCALES: LocaleCode[] = ['ar-SA'];

export function isRtlLocale(code: LocaleCode): boolean {
  return RTL_LOCALES.includes(code) || Boolean(LOCALES[code]?.rtl);
}

export const LOCALES: Record<LocaleCode, LocaleData> = {
  'en-US': {
    firstNamesMale: ['James', 'Michael', 'Robert', 'John', 'David', 'Daniel', 'Matthew', 'Andrew', 'Joseph', 'Ethan'],
    firstNamesFemale: ['Emma', 'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Emily', 'Abigail'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'],
    states: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Ohio', 'Georgia', 'Michigan', 'Washington', 'Colorado'],
    streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine St', 'Washington Ave', 'Lake St', 'Hill Rd', 'Park Ave'],
    countryName: 'United States',
    countryDialCode: '+1',
    postalCodeFormat: () => '#####',
    phoneFormat: '+1 ### ### ####',
    companies: ['Initech', 'Globex', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Hooli', 'Soylent Corp', 'Wonka Industries'],
    domainTlds: ['com', 'io', 'dev', 'app'],
    sampleSentence: 'Looking forward to trying this product with the team.',
  },
  'en-GB': {
    firstNamesMale: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Thomas', 'Oscar', 'William'],
    firstNamesFemale: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Freya', 'Ivy', 'Grace', 'Lily', 'Sophie', 'Poppy'],
    lastNames: ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts'],
    cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff'],
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    streets: ['High St', 'Station Rd', 'Church Ln', 'Victoria Rd', 'Kings Rd', 'Mill Ln', 'Green Ln', 'Manor Rd', 'The Grove', 'Queens Rd'],
    countryName: 'United Kingdom',
    countryDialCode: '+44',
    postalCodeFormat: () => 'AA# #AA',
    phoneFormat: '+44 #### ######',
    companies: ['Initech Ltd', 'Globex UK', 'Ravenwood plc', 'Kingfisher Group', 'Brightside Ltd', 'Northwind Traders'],
    domainTlds: ['co.uk', 'com', 'io'],
    sampleSentence: 'Keen to give this a proper go with the squad.',
  },
  'fr-FR': {
    firstNamesMale: ['Léo', 'Gabriel', 'Louis', 'Hugo', 'Arthur', 'Jules', 'Adam', 'Raphaël', 'Nathan', 'Lucas'],
    firstNamesFemale: ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Léa', 'Manon', 'Rose', 'Anna', 'Inès'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon'],
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
    states: ['Île-de-France', 'Provence-Alpes-Côte d\u2019Azur', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Nouvelle-Aquitaine'],
    streets: ['Rue de la Paix', 'Avenue des Champs', 'Rue du Commerce', 'Rue Victor Hugo', 'Rue de la République', 'Boulevard Saint-Michel'],
    countryName: 'France',
    countryDialCode: '+33',
    postalCodeFormat: () => '#####',
    phoneFormat: '+33 # ## ## ## ##',
    companies: ['Dupont SA', 'Lumière Group', 'Étoile Industries', 'Vertige SARL', 'Horizon Média'],
    domainTlds: ['fr', 'com'],
    sampleSentence: 'J’ai hâte de tester ce produit avec l’équipe.',
  },
  'de-DE': {
    firstNamesMale: ['Ben', 'Paul', 'Leon', 'Finn', 'Jonas', 'Elias', 'Noah', 'Luis', 'Felix', 'Maximilian'],
    firstNamesFemale: ['Mia', 'Emma', 'Hannah', 'Emilia', 'Sofia', 'Lina', 'Marie', 'Lena', 'Anna', 'Clara'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann'],
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen'],
    states: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg', 'Lower Saxony', 'Hesse', 'Saxony'],
    streets: ['Hauptstraße', 'Bahnhofstraße', 'Schulstraße', 'Gartenstraße', 'Bergstraße', 'Kirchstraße'],
    countryName: 'Germany',
    countryDialCode: '+49',
    postalCodeFormat: () => '#####',
    phoneFormat: '+49 ### #######',
    companies: ['Müller GmbH', 'Nordlicht AG', 'Bergmann & Co', 'Sonnenschein Handels GmbH', 'Vogel Industrie'],
    domainTlds: ['de', 'com'],
    sampleSentence: 'Ich freue mich darauf, dieses Produkt mit dem Team zu testen.',
  },
  'ar-SA': {
    firstNamesMale: ['محمد', 'أحمد', 'عبدالله', 'خالد', 'فيصل', 'عمر', 'يوسف', 'سعد', 'فهد', 'ناصر'],
    firstNamesFemale: ['فاطمة', 'عائشة', 'نورة', 'سارة', 'مريم', 'لينا', 'هند', 'ريم', 'علياء', 'ليلى'],
    lastNames: ['آل سعود', 'الغامدي', 'القحطاني', 'العتيبي', 'الحربي', 'الزهراني', 'الشهري', 'العمري'],
    cities: ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الطائف', 'أبها'],
    states: ['منطقة الرياض', 'منطقة مكة', 'المنطقة الشرقية', 'منطقة عسير'],
    streets: ['طريق الملك فهد', 'شارع العليا', 'طريق الأمير سلطان', 'شارع التحلية', 'طريق الأحساء'],
    countryName: 'المملكة العربية السعودية',
    countryDialCode: '+966',
    postalCodeFormat: () => '#####',
    phoneFormat: '+966 5# ### ####',
    companies: ['الفيصل للتجارة', 'مجموعة وردة الصحراء', 'صناعات نجد', 'حجاز القابضة'],
    domainTlds: ['sa', 'com'],
    rtl: true,
    sampleSentence: 'أتطلع إلى تجربة هذا المنتج مع الفريق.',
  },
  'hi-IN': {
    firstNamesMale: ['आरव', 'विवान', 'आदित्य', 'विहान', 'अर्जुन', 'रेयांश', 'कृष्ण', 'ईशान', 'रोहन', 'कबीर'],
    firstNamesFemale: ['सानवी', 'आन्या', 'आध्या', 'दिया', 'अनन्या', 'इशिता', 'रिया', 'मायरा', 'सारा', 'अनिका'],
    lastNames: ['शर्मा', 'वर्मा', 'गुप्ता', 'पटेल', 'रेड्डी', 'अय्यर', 'कुमार', 'सिंह', 'नायर', 'राव'],
    cities: ['मुंबई', 'दिल्ली', 'बेंगलुरु', 'हैदराबाद', 'चेन्नई', 'कोलकाता', 'पुणे', 'अहमदाबाद', 'जयपुर', 'लखनऊ'],
    states: ['महाराष्ट्र', 'दिल्ली', 'कर्नाटक', 'तेलंगाना', 'तमिलनाडु', 'पश्चिम बंगाल', 'गुजरात', 'राजस्थान'],
    streets: ['एमजी रोड', 'नेहरू स्ट्रीट', 'गांधी नगर', 'रिंग रोड', 'चर्च स्ट्रीट', 'स्टेशन रोड'],
    countryName: 'भारत',
    countryDialCode: '+91',
    postalCodeFormat: () => '######',
    phoneFormat: '+91 ##### #####',
    companies: ['शर्मा इंडस्ट्रीज', 'गंगा टेक', 'हिमालय ट्रेडर्स', 'लोटस एंटरप्राइजेज', 'सुंदर ग्रुप'],
    domainTlds: ['in', 'com'],
    sampleSentence: 'मैं टीम के साथ इस उत्पाद को आज़माने के लिए उत्सुक हूँ।',
  },
  'ja-JP': {
    firstNamesMale: ['陽翔', '悠斗', '蒼', '蓮', '陸', '颯真', '大和', '樹', '隼人', '海斗'],
    firstNamesFemale: ['結衣', '陽菜', '結愛', '美緒', '葵', '凛', '桜', '心春', 'あかり', '一花'],
    lastNames: ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'],
    cities: ['東京', '大阪', '横浜', '名古屋', '札幌', '福岡', '神戸', '京都', '川崎', 'さいたま'],
    states: ['東京都', '大阪府', '神奈川県', '愛知県', '北海道', '福岡県'],
    streets: ['桜通り', '中央通り', '銀座通り', '本町', '緑通り'],
    countryName: '日本',
    countryDialCode: '+81',
    postalCodeFormat: () => '###-####',
    phoneFormat: '+81 ##-####-####',
    companies: ['佐藤商事', '富士産業', '桜テック', '改善ホールディングス', '椿グループ'],
    domainTlds: ['jp', 'co.jp', 'com'],
    sampleSentence: 'チームと一緒にこの製品を試すのが楽しみです。',
  },
  'es-ES': {
    firstNamesMale: ['Hugo', 'Martín', 'Lucas', 'Mateo', 'Leo', 'Daniel', 'Alejandro', 'Pablo', 'Manuel', 'Álvaro'],
    firstNamesFemale: ['Lucía', 'Sofía', 'Martina', 'María', 'Julia', 'Paula', 'Valeria', 'Emma', 'Carla', 'Alba'],
    lastNames: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martin'],
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante'],
    states: ['Madrid', 'Cataluña', 'Andalucía', 'Valencia', 'Galicia', 'País Vasco'],
    streets: ['Calle Mayor', 'Avenida de la Constitución', 'Calle Real', 'Paseo del Prado', 'Calle Gran Vía'],
    countryName: 'España',
    countryDialCode: '+34',
    postalCodeFormat: () => '#####',
    phoneFormat: '+34 ### ### ###',
    companies: ['Ibérica SA', 'Sol y Mar SL', 'Nortech España', 'García Hermanos', 'Costa Verde'],
    domainTlds: ['es', 'com'],
    sampleSentence: 'Tengo ganas de probar este producto con el equipo.',
  },
  'pt-BR': {
    firstNamesMale: ['Miguel', 'Arthur', 'Gael', 'Heitor', 'Theo', 'Davi', 'Gabriel', 'Bernardo', 'Samuel', 'João'],
    firstNamesFemale: ['Alice', 'Helena', 'Laura', 'Maria', 'Valentina', 'Sophia', 'Isabella', 'Manuela', 'Júlia', 'Lorena'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'],
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
    states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul'],
    streets: ['Rua das Flores', 'Avenida Paulista', 'Rua Augusta', 'Avenida Brasil', 'Rua XV de Novembro'],
    countryName: 'Brasil',
    countryDialCode: '+55',
    postalCodeFormat: () => '#####-###',
    phoneFormat: '+55 ## #####-####',
    companies: ['Silva Tech', 'Amazônia Soft', 'Verde Mar Ltda', 'Sul Digital', 'Nova Horizonte'],
    domainTlds: ['com.br', 'br', 'com'],
    sampleSentence: 'Estou ansioso para testar este produto com a equipe.',
  },
  'zh-CN': {
    firstNamesMale: ['伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '明', '超'],
    firstNamesFemale: ['芳', '娜', '敏', '静', '丽', '艳', '娟', '霞', '秀英', '桂英'],
    lastNames: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周'],
    cities: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '苏州'],
    states: ['北京市', '上海市', '广东省', '浙江省', '四川省', '湖北省'],
    streets: ['中山路', '解放路', '人民路', '建设路', '和平路'],
    countryName: '中国',
    countryDialCode: '+86',
    postalCodeFormat: () => '######',
    phoneFormat: '+86 ### #### ####',
    companies: ['华信科技', '东方实业', '银河集团', '鹏程贸易', '云帆网络'],
    domainTlds: ['cn', 'com.cn', 'com'],
    sampleSentence: '很期待和团队一起试用这款产品。',
  },
  'tr-TR': {
    firstNamesMale: ['Yusuf', 'Eymen', 'Ömer', 'Mustafa', 'Emir', 'Ahmet', 'Ali', 'Hüseyin', 'İbrahim', 'Hasan'],
    firstNamesFemale: ['Zeynep', 'Elif', 'Defne', 'Asya', 'Azra', 'Ecrin', 'Nehir', 'Miray', 'Eylül', 'Ada'],
    lastNames: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir'],
    cities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli'],
    states: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'],
    streets: ['Atatürk Cad.', 'İstiklal Cad.', 'Cumhuriyet Cad.', 'Gazi Cad.', 'Bağdat Cad.'],
    countryName: 'Türkiye',
    countryDialCode: '+90',
    postalCodeFormat: () => '#####',
    phoneFormat: '+90 ### ### ## ##',
    companies: ['Anadolu AŞ', 'Boğaz Tech', 'Ege Ticaret', 'Karadeniz Holding', 'Akdeniz Yazılım'],
    domainTlds: ['com.tr', 'tr', 'com'],
    sampleSentence: 'Bu ürünü ekiple denemek için sabırsızlanıyorum.',
  },
};

export function getLocale(code: LocaleCode): LocaleData {
  return LOCALES[code] ?? LOCALES['en-US'];
}

export function listLocaleCodes(): LocaleCode[] {
  return Object.keys(LOCALES) as LocaleCode[];
}
