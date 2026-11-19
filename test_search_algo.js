function normalizeSearchText(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .trim();
}

function stripArabicPrefix(word) {
  if (word.startsWith("ال") && word.length > 3) {
    return word.slice(2);
  }
  return word;
}

const mockCatalog = [
  { code: "CS 101", codeAr: "ع ح 101", nameAr: "مقدمة في علوم الحاسب", nameEn: "Intro. to Computer Science", credits: 3 },
  { code: "CS 102", codeAr: "ع ح 102", nameAr: "برمجة الحاسبات", nameEn: "Computers Programming", credits: 3 },
  { code: "CS 201", codeAr: "ع ح 201", nameAr: "هياكل البيانات والخوارزميات", nameEn: "Data Structures and Algorithms", credits: 3 },
  { code: "H 102", codeAr: "إ ن 102", nameAr: "اللغة الإنجليزية", nameEn: "English Language", credits: 2 },
  { code: "BS 101", codeAr: "ع أ 101", nameAr: "التفاضل والتكامل", nameEn: "Calculus", credits: 3 },
  { code: "CS 304", codeAr: "ع ح 304", nameAr: "نظم قواعد البيانات", nameEn: "Database Systems", credits: 3 }
];

function searchTest(rawQuery) {
  const normQuery = normalizeSearchText(rawQuery);
  const compactQuery = normQuery.replace(/\s+/g, "");
  if (!normQuery) return mockCatalog.slice(0, 10);

  const queryWords = normQuery.split(/\s+/).filter(Boolean);

  return mockCatalog.filter(c => {
    const normCode = normalizeSearchText(c.code);
    const compactCode = normCode.replace(/\s+/g, "");
    const normCodeAr = normalizeSearchText(c.codeAr);
    const compactCodeAr = normCodeAr.replace(/\s+/g, "");
    const normAr = normalizeSearchText(c.nameAr);
    const normEn = normalizeSearchText(c.nameEn);

    // 1. Direct or compact code / text match
    if (
      normCode.includes(normQuery) ||
      compactCode.includes(compactQuery) ||
      normCodeAr.includes(normQuery) ||
      compactCodeAr.includes(compactQuery) ||
      normAr.includes(normQuery) ||
      normEn.includes(normQuery)
    ) {
      return true;
    }

    // 2. Arabic flexible word match with/without 'ال'
    const fullTargetText = `${normAr} ${normEn} ${normCode} ${normCodeAr}`;
    const targetWords = fullTargetText.split(/\s+/).filter(Boolean);
    const targetWordsStripped = targetWords.map(w => stripArabicPrefix(w));

    const allWordsMatch = queryWords.every(qWord => {
      const qStripped = stripArabicPrefix(qWord);
      return (
        fullTargetText.includes(qWord) ||
        fullTargetText.includes(qStripped) ||
        targetWordsStripped.some(tw => tw.includes(qStripped))
      );
    });

    return allWordsMatch;
  });
}

// Test cases
console.log('CS 101 ->', searchTest('CS 101').map(c => c.code));
console.log('cs101 ->', searchTest('cs101').map(c => c.code));
console.log('ع ح 101 ->', searchTest('ع ح 101').map(c => c.code));
console.log('عح101 ->', searchTest('عح101').map(c => c.code));
console.log('البرمجة ->', searchTest('البرمجة').map(c => c.code));
console.log('لغة انجليزية ->', searchTest('لغة انجليزية').map(c => c.code));
console.log('هياكل ->', searchTest('هياكل').map(c => c.code));
console.log('data structures ->', searchTest('data structures').map(c => c.code));
console.log('قواعد بيانات ->', searchTest('قواعد بيانات').map(c => c.code));
console.log('مادة مش موجودة ->', searchTest('مادة مش موجودة').map(c => c.code));
