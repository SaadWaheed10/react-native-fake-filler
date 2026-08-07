import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import { makeNameGenerators } from './personal';
import { makeContactGenerators } from './contact';
import { makeProfileGenerators } from './profile';
import { makeFinanceGenerators } from './finance';
import { makeMiscGenerators } from './misc';
import type { FieldKey, Generator, GeneratorContext } from '../core/types';

/**
 * Builds the full FieldKey -> Generator map bound to a specific PRNG and
 * uniqueness tracker instance. Each FakeFiller instance owns exactly one
 * of these registries so seeding/reset stay isolated.
 */
export function buildGeneratorRegistry(
  prng: PRNG,
  uniq: UniquenessTracker
): Record<FieldKey, Generator> {
  const names = makeNameGenerators(prng, uniq);
  const contact = makeContactGenerators(prng, uniq);
  const profile = makeProfileGenerators(prng, uniq);
  const finance = makeFinanceGenerators(prng, uniq);
  const misc = makeMiscGenerators(prng, uniq);

  const registry: Record<FieldKey, Generator> = {
    // Personal
    firstName: (ctx) => names.firstName(ctx),
    lastName: (ctx) => names.lastName(ctx),
    middleName: (ctx) => names.middleName(ctx),
    fullName: (ctx) => names.fullName(ctx),
    nickname: (ctx) => names.nickname(ctx),
    username: (ctx) => names.username(ctx),
    initials: (ctx) => names.initials(ctx),

    // Auth
    email: (ctx) => names.email(ctx),
    password: () => names.password(),
    confirmPassword: () => names.password(),
    otp: () => names.otp(),
    pin: () => names.pin(),
    securityAnswer: () => names.securityAnswer(),

    // Phone
    mobileNumber: (ctx) => contact.phoneNumber(ctx),
    homeNumber: (ctx) => contact.phoneNumber(ctx),
    officeNumber: (ctx) => contact.phoneNumber(ctx),
    countryCode: (ctx) => contact.countryCode(ctx),

    // Address
    street: (ctx) => contact.street(ctx),
    apartment: () => contact.apartment(),
    houseNumber: () => contact.houseNumber(),
    building: () => contact.building(),
    city: (ctx) => contact.city(ctx),
    state: (ctx) => contact.state(ctx),
    province: (ctx) => contact.state(ctx),
    country: (ctx) => contact.country(ctx),
    zipCode: (ctx) => contact.zipCode(ctx),
    postalCode: (ctx) => contact.zipCode(ctx),

    // Business
    company: (ctx) => profile.company(ctx),
    department: () => profile.department(),
    designation: () => profile.designation(),
    employeeId: (ctx) => profile.employeeId(ctx),
    website: (ctx) => profile.website(ctx),

    // Identity
    dateOfBirth: (ctx) => profile.dateOfBirth(ctx),
    age: (ctx) => profile.age(ctx),
    gender: () => profile.gender(),
    nationality: () => profile.nationality(),

    // Banking
    creditCardNumber: () => finance.creditCardNumber(),
    cardExpiry: () => finance.cardExpiry(),
    cvv: () => finance.cvv(),
    accountNumber: (ctx) => finance.accountNumber(ctx),
    iban: (ctx) => finance.iban(ctx),
    bankName: () => finance.bankName(),

    // Vehicle
    vehicleNumber: (ctx) => finance.vehicleNumber(ctx),
    licensePlate: (ctx) => finance.licensePlate(ctx),
    vehicleManufacturer: () => finance.vehicleManufacturer(),
    vehicleModel: () => finance.vehicleModel(),
    vin: (ctx) => finance.vin(ctx),

    // Education
    school: () => profile.school(),
    college: () => profile.college(),
    university: () => profile.university(),
    degree: () => profile.degree(),
    major: () => profile.major(),

    // Healthcare
    bloodGroup: () => profile.bloodGroup(),
    height: () => profile.height(),
    weight: () => profile.weight(),

    // Technology
    uuid: (ctx) => misc.uuid(ctx),
    apiKey: () => misc.apiKey(),
    refreshToken: () => misc.refreshToken(),
    accessToken: () => misc.accessToken(),

    // Internet
    domain: (ctx) => misc.domain(ctx),
    url: (ctx) => misc.url(ctx),
    ipv4: () => misc.ipv4(),
    ipv6: () => misc.ipv6(),
    macAddress: () => misc.macAddress(),

    // Text
    loremWord: () => misc.loremWord(),
    sentence: () => misc.sentence(),
    paragraph: () => misc.paragraph(),
    review: () => misc.review(),
    description: () => misc.description(),
    comment: () => misc.comment(),

    // Numbers
    integer: () => misc.integer(),
    float: () => misc.float(),
    percentage: () => misc.percentage(),
    currency: () => misc.currency(),

    // Dates
    pastDate: () => misc.pastDate(),
    futureDate: () => misc.futureDate(),
    currentDate: () => misc.currentDate(),
    randomDate: () => misc.randomDate(),

    // Fallback
    genericText: () => misc.sentence(),
  };

  return registry;
}

export type { GeneratorContext };
