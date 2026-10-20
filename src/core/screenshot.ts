import { forE2E } from '../e2e/helpers';
import type { E2EBundle } from '../e2e/helpers';
import type { FillOptions, PersonaId, ScenarioId } from './types';

export interface ScreenshotFixture extends E2EBundle {
  /** Stable numeric seed used for this fixture */
  seed: number;
  /** Handy label for Storybook / Maestro screenshot titles */
  title: string;
}

/**
 * Frozen, deterministic dataset for visual regression / Storybook screenshots.
 * Same inputs always produce the same values across CI runs.
 *
 * @example
 * ```ts
 * const fx = FakeFiller.forScreenshot({ persona: 'qa-adult-us', seed: 42 });
 * // use fx.values in your component story
 * ```
 */
export function forScreenshot(
  options: FillOptions & {
    persona?: PersonaId | string;
    scenario?: ScenarioId | string;
    title?: string;
    fields?: string[];
  } = {}
): ScreenshotFixture {
  const seed = options.seed ?? 42;
  const bundle = forE2E({
    ...options,
    seed,
    mode: 'seeded',
    // Screenshots should be stable — prefer persona when given
    persona: options.persona ?? (options.scenario ? undefined : 'qa-adult-us'),
  });

  const title =
    options.title ??
    `ff-shot-${options.persona ?? options.scenario ?? 'default'}-s${seed}`;

  return {
    ...bundle,
    seed,
    title,
  };
}
