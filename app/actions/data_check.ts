import { QUESTIONS, CHARACTERS } from './shingekiData';

const stats: Record<string, { p5: number; p4: number; p3: number; p2: number; p1: number; total: number }> = {};
Object.keys(CHARACTERS).forEach(name => {
  stats[name] = { p5: 0, p4: 0, p3: 0, p2: 0, p1: 0, total: 0 };
});

QUESTIONS.forEach(q => {
  q.options.forEach(o => {
    Object.entries(o.scores).forEach(([name, score]) => {
      if (stats[name]) {
        if (score === 5) stats[name].p5++;
        if (score === 4) stats[name].p4++;
        if (score === 3) stats[name].p3++;
        if (score === 2) stats[name].p2++;
        if (score === 1) stats[name].p1++;
        stats[name].total += score;
      }
    });
  });
});

console.log('=== Character Scoring Potential Stats ===');
const tableData = Object.entries(stats).map(([name, s]) => ({
  Character: name,
  '5pts': s.p5,
  '4pts': s.p4,
  '3pts': s.p3,
  '2pts': s.p2,
  '1pt': s.p1,
  'Total Potential': s.total,
  'Avg per Q': (s.total / 24).toFixed(2)
})).sort((a, b) => b['Total Potential'] - a['Total Potential']);

console.table(tableData);
