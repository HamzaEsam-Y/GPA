// Test script for custom course addition and search matching
const fs = require('fs');

const COURSE_CATALOG = [
  { code: "CS 101", codeAr: "ع ح 101", nameAr: "مقدمة في علوم الحاسب", nameEn: "Intro. to Computer Science", credits: 3, prereq: "-", type: "إجباري" },
  { code: "CS 102", codeAr: "ع ح 102", nameAr: "برمجة الحاسبات", nameEn: "Computers Programming", credits: 3, prereq: "CS 101", type: "إجباري" },
  { code: "CS 201", codeAr: "ع ح 201", nameAr: "هياكل البيانات والخوارزميات", nameEn: "Data Structures and Algorithms", credits: 3, prereq: "CS 102", type: "إجباري" }
];

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

function searchCourseCatalog(rawQuery) {
  const normQuery = normalizeSearchText(rawQuery);
  const compactQuery = normQuery.replace(/\s+/g, "");

  if (!normQuery) {
    return COURSE_CATALOG.slice(0, 10);
  }

  const queryWords = normQuery.split(/\s+/).filter(Boolean);

  return COURSE_CATALOG.filter(c => {
    const normCode = normalizeSearchText(c.code);
    const compactCode = normCode.replace(/\s+/g, "");
    const normCodeAr = normalizeSearchText(c.codeAr || "");
    const compactCodeAr = normCodeAr.replace(/\s+/g, "");
    const normAr = normalizeSearchText(c.nameAr);
    const normEn = normalizeSearchText(c.nameEn);

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

    const fullTargetText = `${normAr} ${normEn} ${normCode} ${normCodeAr}`;
    const targetWords = fullTargetText.split(/\s+/).filter(Boolean);
    const targetWordsStripped = targetWords.map(w => stripArabicPrefix(w));

    return queryWords.every(qWord => {
      const qStripped = stripArabicPrefix(qWord);
      return (
        fullTargetText.includes(qWord) ||
        fullTargetText.includes(qStripped) ||
        targetWordsStripped.some(tw => tw.includes(qStripped))
      );
    });
  });
}

function extractCourseCode(text) {
  if (!text) return "";
  const trimmed = text.trim();
  const m = trimmed.match(/([A-Z]{1,3}\s*\d{2,3})/i);
  if (m) return m[1].replace(/\s+/g, " ").toUpperCase();
  const cat = COURSE_CATALOG.find(c => 
    c.codeAr === trimmed || 
    c.nameAr === trimmed || 
    trimmed.includes(c.nameAr) ||
    (c.codeAr && trimmed.includes(c.codeAr))
  );
  if (cat) return cat.code.toUpperCase();
  const firstPart = trimmed.split("-")[0].trim();
  return firstPart.toUpperCase();
}

function addCustomCourse(name) {
  const code = extractCourseCode(name) || `CUSTOM-${Date.now().toString().slice(-4)}`;
  const newCourse = {
    code: code,
    codeAr: code,
    nameAr: name,
    nameEn: name,
    credits: 3,
    prereq: "-",
    type: "اختياري",
    isCustom: true
  };
  COURSE_CATALOG.push(newCourse);
  return newCourse;
}

// Tests
console.log('Search "هياكل":', searchCourseCatalog('هياكل').length);
console.log('Search "البرمجة":', searchCourseCatalog('البرمجة').length);
console.log('Search "لغة المانية" (not found):', searchCourseCatalog('لغة المانية').length);

addCustomCourse('لغة المانية');
console.log('Search "المانية" after adding:', searchCourseCatalog('المانية').map(c => c.nameAr));
console.log('All tests passed!');
