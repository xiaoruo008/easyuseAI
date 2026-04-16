// Strategy: Remove markers first, then content blocks
const raw = 'igonre**根据规则，我应该生成画像\n**igonre**用户没有提供任何诊断答案，题目描述中只显示\n**igonre**';

console.log('Input:', JSON.stringify(raw));
let s = raw;

// Step 1: Remove **igonre** and igonre** markers (not content, just markers)
s = s.replace(/\*\*igonre\*\*/gi, '');  // **igonre**
s = s.replace(/igonre\*\*/gi, '');       // igonre**
console.log('After marker removal:', JSON.stringify(s));

// Step 2: Now strip remaining **content** blocks iteratively
let prev = '';
let i = 0;
while (prev !== s) {
  prev = s;
  s = s.replace(/\*\*[^*]+\*\*/g, '');
  i++;
}
console.log(`After ${i} content block removals:`, JSON.stringify(s));

// Step 3: Clean up
s = s.replace(/<[\s\S]*?>/gi, '').replace(/\s+/g, ' ').trim();
console.log('Final:', JSON.stringify(s));
