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
  postalCodeFormat: () => string; // called with a bound PRNG at generation time via closures
  phoneFormat: string; // '#' = digit placeholder
  companies: string[];
  domainTlds: string[];
}

// Postal code generators are wired up at call sites (they need PRNG),
// so here we just describe the shape; concrete formats live in generators/address.ts.

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
  },
  'ar-SA': {
    firstNamesMale: ['Mohammed', 'Ahmed', 'Abdullah', 'Khalid', 'Faisal', 'Omar', 'Yousef', 'Saad', 'Fahad', 'Nasser'],
    firstNamesFemale: ['Fatima', 'Aisha', 'Noura', 'Sara', 'Maryam', 'Lina', 'Hind', 'Reem', 'Alia', 'Layla'],
    lastNames: ['Al-Saud', 'Al-Ghamdi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Harbi', 'Al-Zahrani', 'Al-Shehri', 'Al-Amri'],
    cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Taif', 'Abha'],
    states: ['Riyadh Province', 'Makkah Province', 'Eastern Province', 'Asir Province'],
    streets: ['King Fahd Rd', 'Olaya St', 'Prince Sultan Rd', 'Tahlia St', 'Al Ahsa Rd'],
    countryName: 'Saudi Arabia',
    countryDialCode: '+966',
    postalCodeFormat: () => '#####',
    phoneFormat: '+966 5# ### ####',
    companies: ['Al-Faisal Trading', 'Desert Rose Group', 'Najd Industries', 'Hejaz Holdings'],
    domainTlds: ['sa', 'com'],
  },
  'hi-IN': {
    firstNamesMale: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan', 'Kabir'],
    firstNamesFemale: ['Saanvi', 'Aanya', 'Aadhya', 'Diya', 'Ananya', 'Ishita', 'Riya', 'Myra', 'Sara', 'Anika'],
    lastNames: ['Sharma', 'Verma', 'Gupta', 'Patel', 'Reddy', 'Iyer', 'Kumar', 'Singh', 'Nair', 'Rao'],
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
    states: ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan'],
    streets: ['MG Road', 'Nehru St', 'Gandhi Nagar', 'Ring Rd', 'Church St', 'Station Rd'],
    countryName: 'India',
    countryDialCode: '+91',
    postalCodeFormat: () => '######',
    phoneFormat: '+91 ##### #####',
    companies: ['Sharma Industries', 'Ganges Tech', 'Himalaya Traders', 'Lotus Enterprises', 'Sundar Group'],
    domainTlds: ['in', 'com'],
  },
  'ja-JP': {
    firstNamesMale: ['Haruto', 'Yuto', 'Sota', 'Ren', 'Riku', 'Sora', 'Yamato', 'Itsuki', 'Hayato', 'Kaito'],
    firstNamesFemale: ['Yui', 'Hina', 'Yua', 'Mio', 'Aoi', 'Rin', 'Sakura', 'Koharu', 'Akari', 'Ichika'],
    lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
    cities: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
    states: ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi', 'Hokkaido', 'Fukuoka'],
    streets: ['Sakura Dori', 'Chuo Dori', 'Ginza St', 'Honmachi', 'Midori St'],
    countryName: 'Japan',
    countryDialCode: '+81',
    postalCodeFormat: () => '###-####',
    phoneFormat: '+81 ##-####-####',
    companies: ['Sato Corp', 'Fuji Industries', 'Sakura Tech', 'Kaizen Holdings', 'Tsubaki Group'],
    domainTlds: ['jp', 'co.jp', 'com'],
  },
};

export function getLocale(code: LocaleCode): LocaleData {
  return LOCALES[code] ?? LOCALES['en-US'];
}
