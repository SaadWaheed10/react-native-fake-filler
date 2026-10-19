import type { LocaleCode, PersonaId } from './types';

export interface PersonaProfile {
  id: PersonaId | string;
  label: string;
  locale: LocaleCode;
  /** Field type → fixed value. Applied as overrides during fill. */
  values: Record<string, string>;
}

const PERSONAS: Record<string, PersonaProfile> = {
  'qa-adult-us': {
    id: 'qa-adult-us',
    label: 'QA Adult (US)',
    locale: 'en-US',
    values: {
      firstName: 'Jordan',
      lastName: 'Lee',
      fullName: 'Jordan Lee',
      email: 'jordan.lee.qa@example.com',
      username: 'jordanlee42',
      password: 'MyStorm!42',
      confirmPassword: 'MyStorm!42',
      mobileNumber: '+1 415 555 0198',
      street: '742 Maple Dr',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94107',
      country: 'United States',
      dateOfBirth: '1990-04-12',
      age: '35',
      gender: 'Female',
    },
  },
  'qa-adult-uk': {
    id: 'qa-adult-uk',
    label: 'QA Adult (UK)',
    locale: 'en-GB',
    values: {
      firstName: 'Oliver',
      lastName: 'Bennett',
      fullName: 'Oliver Bennett',
      email: 'oliver.bennett.qa@example.com',
      username: 'obennett21',
      password: 'MyFalcon!21',
      confirmPassword: 'MyFalcon!21',
      mobileNumber: '+44 7700 900123',
      street: '14 High St',
      city: 'London',
      state: 'England',
      postalCode: 'E1 6AN',
      zipCode: 'E1 6AN',
      country: 'United Kingdom',
      dateOfBirth: '1988-09-03',
      gender: 'Male',
    },
  },
  'qa-adult-in': {
    id: 'qa-adult-in',
    label: 'QA Adult (India)',
    locale: 'hi-IN',
    values: {
      firstName: 'Aarav',
      lastName: 'Sharma',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma.qa@example.com',
      username: 'aaravsharma7',
      password: 'MyNebula!07',
      confirmPassword: 'MyNebula!07',
      mobileNumber: '+91 98765 43210',
      street: '12 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      dateOfBirth: '1992-11-21',
      gender: 'Male',
    },
  },
  'qa-adult-sa': {
    id: 'qa-adult-sa',
    label: 'QA Adult (Saudi Arabia)',
    locale: 'ar-SA',
    values: {
      firstName: 'Noura',
      lastName: 'Al-Harbi',
      fullName: 'Noura Al-Harbi',
      email: 'noura.alharbi.qa@example.com',
      username: 'nourah11',
      password: 'MyQuartz!11',
      confirmPassword: 'MyQuartz!11',
      mobileNumber: '+966 50 123 4567',
      street: 'King Fahd Rd',
      city: 'Riyadh',
      state: 'Riyadh Province',
      zipCode: '11564',
      country: 'Saudi Arabia',
      dateOfBirth: '1991-06-18',
      gender: 'Female',
    },
  },
  'edge-long-name': {
    id: 'edge-long-name',
    label: 'Edge: very long name',
    locale: 'en-US',
    values: {
      firstName: 'Maximilienne-Christabelle',
      lastName: 'van der Huffington-Smythesworth III',
      fullName: 'Maximilienne-Christabelle van der Huffington-Smythesworth III',
      email: 'max.longname.edge@example.com',
      username: 'maxlongnameedge999',
      password: 'MyEmber!99',
      confirmPassword: 'MyEmber!99',
      description:
        'This is an intentionally long description used to stress-test layout wrapping, truncation, and validation max-length boundaries in QA forms.',
    },
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal required fields',
    locale: 'en-US',
    values: {
      firstName: 'Pat',
      lastName: 'Kim',
      email: 'pat.kim@example.com',
      password: 'MyOrbit!10',
      confirmPassword: 'MyOrbit!10',
    },
  },
};

const customPersonas = new Map<string, PersonaProfile>();

export function getPersona(id: PersonaId | string): PersonaProfile | undefined {
  return customPersonas.get(id) ?? PERSONAS[id];
}

export function listPersonas(): PersonaProfile[] {
  return [...Object.values(PERSONAS), ...customPersonas.values()];
}

export function registerPersona(persona: PersonaProfile): void {
  customPersonas.set(persona.id, persona);
}
