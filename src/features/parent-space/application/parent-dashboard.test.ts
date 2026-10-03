import manifest from '@/content/manifests/curriculum-v1.json';

import { describeSkill } from './parent-dashboard';

/** Toutes les compétences citées par le manifeste. */
function allSkillIds(): string[] {
  const found = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === 'object') {
      for (const [key, inner] of Object.entries(value)) {
        if (key === 'skillId' && typeof inner === 'string') {
          found.add(inner);
        } else if ((key === 'skillIds' || key === 'skills') && Array.isArray(inner)) {
          inner.filter((entry): entry is string => typeof entry === 'string').forEach((id) => found.add(id));
        } else {
          walk(inner);
        }
      }
    }
  };
  walk(manifest);
  return [...found];
}

describe('describeSkill', () => {
  const ids = allSkillIds();

  it('trouve les compétences du programme', () => {
    expect(ids.length).toBeGreaterThan(100);
  });

  it('écrit chaque compétence en français lisible : un article, aucun identifiant brut', () => {
    // Un parent ne doit jamais lire « structures » ou « e1 » : chaque libellé
    // commence par un article et ne garde ni trait d'union d'identifiant ni code d'accent.
    const unreadable = ids
      .map((id) => describeSkill(id))
      .filter((label) => !/^(le |la |les |l’)/.test(label) || /\b[a-z]+\d\b|-[a-z]+-/.test(label));
    expect(unreadable).toEqual([]);
  });

  it('décode les accents et les groupes de sons', () => {
    expect(describeSkill('skill-son-e1')).toBe('le son « é »');
    expect(describeSkill('skill-son-ac-ec-oc-ic')).toBe('les sons « ac », « ec », « oc », « ic »');
    expect(describeSkill('skill-langage-structures')).toBe('le langage (structure des phrases)');
    expect(describeSkill('skill-nombre-0-5')).toBe('les nombres de 0 à 5');
  });
});
