/** @jsxRuntime automatic */
// Planche des emblèmes de discipline v4.
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/emblems-v4.sheet.tsx .cache/design-renders/emblems-v4.png
import { SubjectArt, type SubjectArtId } from '../../src/design-system/icons/subject-art';
import { subjectColors } from '../../src/design-system/tokens';

const SUBJECTS: SubjectArtId[] = ['language', 'reading', 'writing', 'math'];
const sizes = [160, 96, 64, 48, 32, 24];

export default {
  title: 'ECOLNA — emblèmes de discipline v4',
  width: 1400,
  sections: [
    ...sizes.map((size) => ({
      title: `${size} px`,
      cellWidth: Math.max(size + 24, 80),
      cellHeight: size + 16,
      background: '#ffffff',
      cells: SUBJECTS.map((subject) => ({ label: subject, node: <SubjectArt subject={subject} size={size} /> })),
    })),
    {
      title: 'Symbole seul sur la couleur profonde (cartes de discipline)',
      cellWidth: 180,
      cellHeight: 160,
      cells: SUBJECTS.map((subject) => ({
        label: subject,
        node: (
          <div style={{ background: subjectColors[subject].deep, borderRadius: 28, padding: 18, lineHeight: 0 }}>
            <SubjectArt subject={subject} size={112} variant="glyph" />
          </div>
        ),
      })),
    },
    {
      title: 'Fermé',
      cellWidth: 120,
      cellHeight: 112,
      background: '#ffffff',
      cells: SUBJECTS.map((subject) => ({ label: subject, node: <SubjectArt subject={subject} size={96} muted /> })),
    },
  ],
};
