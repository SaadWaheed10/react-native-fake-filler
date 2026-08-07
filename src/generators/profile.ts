import { PRNG } from '../core/prng';
import { UniquenessTracker } from '../core/uniqueness';
import { getLocale } from '../locales/data';
import type { GeneratorContext, FieldMeta } from '../core/types';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'Product'];
const DESIGNATIONS = ['Software Engineer', 'Product Manager', 'Sales Executive', 'QA Analyst', 'Marketing Specialist', 'HR Coordinator', 'Data Analyst'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const NATIONALITIES = ['American', 'British', 'French', 'German', 'Indian', 'Japanese', 'Saudi Arabian', 'Canadian', 'Australian'];
const DEGREES = ['B.Sc.', 'B.A.', 'B.Tech', 'M.Sc.', 'M.A.', 'MBA', 'Ph.D.'];
const MAJORS = ['Computer Science', 'Business Administration', 'Mechanical Engineering', 'Psychology', 'Economics', 'Biology', 'Design'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function makeProfileGenerators(prng: PRNG, uniq: UniquenessTracker) {
  function company(ctx: GeneratorContext): string {
    return prng.pick(getLocale(ctx.locale).companies);
  }

  function department(): string {
    return prng.pick(DEPARTMENTS);
  }

  function designation(): string {
    return prng.pick(DESIGNATIONS);
  }

  function employeeId(ctx: GeneratorContext): string {
    const gen = () => `EMP-${prng.digits(6)}`;
    if (ctx.mode === 'unique') return uniq.unique('employeeId', gen, () => prng.digits(2));
    return gen();
  }

  function website(ctx: GeneratorContext): string {
    const locale = getLocale(ctx.locale);
    const name = prng.pick(locale.companies).toLowerCase().replace(/[^a-z0-9]+/g, '');
    return `https://www.${name}.${prng.pick(locale.domainTlds)}`;
  }

  function dateOfBirth(ctx: GeneratorContext): string {
    const meta: FieldMeta = ctx.meta ?? {};
    const minAge = meta.minAge ?? 18;
    const maxAge = meta.maxAge ?? 65;
    const now = new Date();
    const age = prng.int(minAge, maxAge);
    const year = now.getFullYear() - age;
    const month = prng.int(1, 12);
    const day = prng.int(1, 28);
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function age(ctx: GeneratorContext): string {
    const meta: FieldMeta = ctx.meta ?? {};
    return String(prng.int(meta.minAge ?? 18, meta.maxAge ?? 65));
  }

  function gender(): string {
    return prng.pick(GENDERS);
  }

  function nationality(): string {
    return prng.pick(NATIONALITIES);
  }

  function school(): string {
    const names = ['Lincoln High School', 'Riverside High School', 'Greenwood High School', 'Oakridge High School'];
    return prng.pick(names);
  }

  function college(): string {
    const names = ['Riverdale College', 'Hillview College', 'Northgate College', 'Sunview College'];
    return prng.pick(names);
  }

  function university(): string {
    const names = ['State University', 'Metropolitan University', 'National Institute of Technology', 'Central University'];
    return prng.pick(names);
  }

  function degree(): string {
    return prng.pick(DEGREES);
  }

  function major(): string {
    return prng.pick(MAJORS);
  }

  function bloodGroup(): string {
    return prng.pick(BLOOD_GROUPS);
  }

  function height(): string {
    // cm, adult range
    return `${prng.int(150, 200)} cm`;
  }

  function weight(): string {
    // kg, adult range
    return `${prng.int(45, 110)} kg`;
  }

  return {
    company,
    department,
    designation,
    employeeId,
    website,
    dateOfBirth,
    age,
    gender,
    nationality,
    school,
    college,
    university,
    degree,
    major,
    bloodGroup,
    height,
    weight,
  };
}
