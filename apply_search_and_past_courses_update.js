const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// Determine newline style
const isCRLF = content.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';

// Normalize to \n for matching, then convert replacements to appropriate newline
let normalized = content.replace(/\r\n/g, '\n');

// 1. past-courses-modal HTML update
const headerMarker = `<div class="text-[11px] font-semibold text-emerald-300 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span>الساعات المحددة: <strong id="pastModalHoursCount" class="text-white font-black text-xs">0</strong> س</span>
            <span class="text-slate-500">|</span>
            <span>عدد المواد: <strong id="pastModalCoursesCount" class="text-white font-black text-xs">0</strong></span>
          </div>
        </div>
      </div>

      <!-- Checklist Body -->`;

const newHeaderSearch = `<div class="text-[11px] font-semibold text-emerald-300 flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span>الساعات المحددة: <strong id="pastModalHoursCount" class="text-white font-black text-xs">0</strong> س</span>
            <span class="text-slate-500">|</span>
            <span>عدد المواد: <strong id="pastModalCoursesCount" class="text-white font-black text-xs">0</strong></span>
          </div>
        </div>
      </div>

      <!-- Search & Add Bar in Past Courses Modal -->
      <div class="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div class="relative">
          <input type="text" id="pastCoursesSearchInput" oninput="filterPastCoursesModal(this.value)" placeholder="🔍 ابحث بكود المادة أو اسمها (أو اكتب اسم مادة لإضافتها إذا لم تكن موجودة بالقائمة)..." class="w-full text-xs font-bold pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute right-3 top-2.5"></i>
        </div>
        <div id="pastCoursesSearchAddBox" class="hidden mt-2 p-2.5 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">+</span>
            <div class="truncate">
              <span class="font-extrabold text-slate-800 text-xs">مادة غير مدرجة بالقائمة: </span>
              <span id="pastCoursesSearchCustomName" class="font-bold text-emerald-800 text-xs"></span>
            </div>
          </div>
          <button type="button" onclick="addPastCustomCourse()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs shrink-0 flex items-center gap-1">
            <span>+ إضافة كمادة سابقة مجتازة</span>
          </button>
        </div>
      </div>

      <!-- Checklist Body -->`;

if (normalized.includes(headerMarker)) {
  normalized = normalized.replace(headerMarker, newHeaderSearch);
  console.log('✓ 1. past-courses-modal HTML search bar added successfully');
} else {
  console.log('❌ 1. headerMarker not found in normalized content');
}

// 2. Search block replacement
const sMarker = `// محرك البحث الفوري الشامل
    function searchCourseCatalog(rawQuery) {`;

const eMarker = `function updateActiveAutocompleteItem(items, activeIndex, listDiv) {
      items.forEach(item => item.classList.remove("autocomplete-active"));
      if (items[activeIndex]) {
        items[activeIndex].classList.add("autocomplete-active");
        items[activeIndex].scrollIntoView({ block: "nearest" });
      }
      listDiv.dataset.activeIndex = activeIndex.toString();
    }`;

const sIdx = normalized.indexOf(sMarker);
const eIdx = normalized.indexOf(eMarker);

const newSearchAndCustomBlock = `// استبعاد سابقة "ال" التعريفية في الكلمات العربية للبحث المرن
    function stripArabicPrefix(word) {
      if (word && word.startsWith("ال") && word.length > 3) {
        return word.slice(2);
      }
      return word;
    }

    // إدارة المقررات المخصصة المحفوظة
    function saveCustomCoursesToStorage() {
      try {
        const customOnly = COURSE_CATALOG.filter(c => c.isCustom);
        localStorage.setItem("hti_custom_courses", JSON.stringify(customOnly));
      } catch (e) {
        console.error("Failed to save custom courses to localStorage", e);
      }
    }

    function loadCustomCoursesFromStorage() {
      try {
        const saved = localStorage.getItem("hti_custom_courses");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            list.forEach(c => {
              if (!COURSE_CATALOG.some(existing => existing.code.toUpperCase() === c.code.toUpperCase() || existing.nameAr === c.nameAr)) {
                c.isCustom = true;
                COURSE_CATALOG.push(c);
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to load custom courses from localStorage", e);
      }
    }

    // محرك البحث الفوري الشامل والمطور (يدعم كود المادة، الاسم عربي/إنجليزي، والبحث المرن)
    function searchCourseCatalog(rawQuery) {
      const normQuery = normalizeSearchText(rawQuery);
      const compactQuery = normQuery.replace(/\\s+/g, "");

      if (!normQuery) {
        return COURSE_CATALOG.slice(0, 10);
      }

      const queryWords = normQuery.split(/\\s+/).filter(Boolean);

      return COURSE_CATALOG.filter(c => {
        const normCode = normalizeSearchText(c.code);
        const compactCode = normCode.replace(/\\s+/g, "");
        const normCodeAr = normalizeSearchText(c.codeAr || "");
        const compactCodeAr = normCodeAr.replace(/\\s+/g, "");
        const normAr = normalizeSearchText(c.nameAr);
        const normEn = normalizeSearchText(c.nameEn);

        // 1. مطابقة مباشرة للكود أو الاسم
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

        // 2. مطابقة ذكية للكلمات العربية مع أو بدون "ال" التعريف
        const fullTargetText = \`\${normAr} \${normEn} \${normCode} \${normCodeAr}\`;
        const targetWords = fullTargetText.split(/\\s+/).filter(Boolean);
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

    // إضافة مقرر جديد غير مدرج بالكتالوج
    function addCustomCourseFromSearch(rowId, courseName, isBestWorst = false) {
      const trimmed = (courseName || "").trim();
      if (!trimmed) return;

      let code = extractCourseCode(trimmed);
      if (!code || code === trimmed.toUpperCase()) {
        const mCode = trimmed.match(/^([A-Za-z]{1,4}\\s*\\d{2,3})/);
        if (mCode) {
          code = mCode[1].toUpperCase();
        } else {
          code = trimmed;
        }
      }

      let existing = COURSE_CATALOG.find(c => 
        c.code.toUpperCase() === code.toUpperCase() || 
        c.nameAr === trimmed
      );

      if (!existing) {
        existing = {
          code: code,
          codeAr: code,
          nameAr: trimmed,
          nameEn: trimmed,
          credits: 3,
          prereq: "-",
          type: "اختياري",
          isCustom: true
        };
        COURSE_CATALOG.push(existing);
        saveCustomCoursesToStorage();
      }

      const searchInput = document.getElementById(\`search_\${rowId}\`);
      if (searchInput) {
        searchInput.value = existing.code !== existing.nameAr ? \`\${existing.code} - \${existing.nameAr}\` : existing.nameAr;
      }

      const creditsSelect = document.getElementById(\`credits_\${rowId}\`);
      if (creditsSelect) {
        creditsSelect.value = existing.credits || 3;
      }

      const listDiv = document.getElementById(\`autocomplete_\${rowId}\`);
      if (listDiv) listDiv.classList.add("hidden");

      if (!isBestWorst) {
        recalculateAll();
        autoSaveAll();
      }

      showToast(\`تمت إضافة المقرر "\${trimmed}" بنجاح وتحديده في جدولك! 🎉\`);
      if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
    }

    function handleCourseSearchInput(e, rowId, isBestWorst = false) {
      const rawQuery = e.target.value;
      const listDiv = document.getElementById(\`autocomplete_\${rowId}\`);
      if (!listDiv) return;

      document.querySelectorAll(".autocomplete-items").forEach(el => {
        if (el.id !== \`autocomplete_\${rowId}\`) el.classList.add("hidden");
      });

      const trimmedQuery = rawQuery.trim();
      const escapedQuery = trimmedQuery.replace(/"/g, '&quot;');

      const matches = searchCourseCatalog(rawQuery);

      if (matches.length === 0) {
        if (trimmedQuery) {
          listDiv.innerHTML = \`
            <div class="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl m-1 hover:border-emerald-500 transition cursor-pointer" onclick="addCustomCourseFromSearch('\${rowId}', '\${escapedQuery}', \${isBestWorst})">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 overflow-hidden">
                  <span class="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">+</span>
                  <div class="text-right truncate">
                    <p class="text-xs font-black text-slate-800 truncate">المادة غير موجودة بالكتالوج</p>
                    <p class="text-[11px] text-emerald-800 font-bold truncate">اضغط لإضافة: "\${escapedQuery}"</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs">
                  <span>+ إضافة المادة</span>
                </span>
              </div>
            </div>
          \`;
        } else {
          listDiv.innerHTML = \`<div class="p-3 text-xs text-slate-400 text-center">اكتب كود أو اسم المادة للبحث...</div>\`;
        }
        listDiv.classList.remove("hidden");
        if (!isBestWorst) autoSaveAll();
        return;
      }

      listDiv.innerHTML = "";
      listDiv.dataset.activeIndex = "-1";

      matches.slice(0, 12).forEach((match, idx) => {
        const item = document.createElement("div");
        item.className = "autocomplete-item flex items-center justify-between gap-2";
        item.dataset.index = idx;

        const highlightedCode = highlightMatch(match.code, rawQuery.trim());
        const highlightedCodeAr = highlightMatch(match.codeAr || "", rawQuery.trim());
        const highlightedAr = highlightMatch(match.nameAr, rawQuery.trim());
        const highlightedEn = highlightMatch(match.nameEn, rawQuery.trim());

        const typeBadgeClass = match.type === "إجباري" 
          ? "bg-blue-50 text-blue-700 border-blue-200" 
          : "bg-amber-50 text-amber-800 border-amber-200";

        item.innerHTML = \`
          <div class="flex flex-col text-right">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-mono font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]" dir="ltr">\${highlightedCode}</span>
              \${match.codeAr ? \`<span class="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">\${highlightedCodeAr}</span>\` : ''}
              <span class="font-extrabold text-slate-900 text-xs">\${highlightedAr}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <span class="text-[11px] text-slate-500 font-medium" dir="ltr">\${highlightedEn}</span>
              \${(() => {
                if (!match.prereq || match.prereq === "-") return '';
                const pCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === match.prereq.toUpperCase());
                const pTitle = pCourse ? \` (\${pCourse.nameAr})\` : '';
                const pStatus = checkCoursePrerequisite(match.code, currentViewYear, activeSelectedSemester);
                if (pStatus.status === "ok") {
                  return \`<span class="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">متطلب: <span dir="ltr">\${match.prereq}</span>\${pTitle} (مجتاز ✓)</span>\`;
                } else if (pStatus.status === "failed") {
                  return \`<span class="text-[10px] text-rose-800 font-black bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">متطلب: <span dir="ltr">\${match.prereq}</span>\${pTitle} (راسب F 🚨)</span>\`;
                } else {
                  return \`<span class="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">متطلب: <span dir="ltr">\${match.prereq}</span>\${pTitle} (غير مستوفى ⚠️)</span>\`;
                }
              })()}
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              \${match.credits} ساعات
            </span>
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded border \${typeBadgeClass}">
              \${match.type}
            </span>
          </div>
        \`;

        item.onclick = () => {
          const selectedCode = match.code;
          const tbody = document.getElementById(\`coursesTableBody-\${activeSelectedSemester}\`);
          
          let isDuplicate = false;
          if (tbody) {
            tbody.querySelectorAll("tr").forEach(r => {
              if (r.id !== rowId) {
                const val = document.getElementById(\`search_\${r.id}\`)?.value || "";
                if (extractCourseCode(val) === selectedCode.toUpperCase()) {
                  isDuplicate = true;
                }
              }
            });
          }

          if (isDuplicate) {
            showToast(\`⚠️ تنبيه: المقرر (\${match.code} - \${match.nameAr}) مسجل بالفعل في هذا الفصل!\`, true);
          }

          const prereqCheck = checkCoursePrerequisite(selectedCode, currentViewYear, activeSelectedSemester);
          if (prereqCheck.status === "failed") {
            showToast(\`🚨 تنبيه رسوب: رسبت بتقدير F في المتطلب السابق (\${prereqCheck.prereqTitle}) لهذا المقرر!\`, true);
          } else if (prereqCheck.status === "same_term") {
            showToast(\`⚠️ تنبيه: لا يجوز تسجيل المقرر بالتزامن مع متطلبه السابق في نفس الترم!\`, true);
          } else if (prereqCheck.status === "not_taken") {
            showToast(\`⚠️ تنبيه: لم تجتز المتطلب السابق (\${prereqCheck.prereqTitle}) لهذا المقرر بعد!\`, true);
          }

          e.target.value = \`\${match.code} - \${match.nameAr} (\${match.nameEn})\`;
          const creditsSelect = document.getElementById(\`credits_\${rowId}\`);
          if (creditsSelect) creditsSelect.value = match.credits;
          listDiv.classList.add("hidden");
          if (!isBestWorst) {
            recalculateAll();
            autoSaveAll();
          }
        };
        listDiv.appendChild(item);
      });

      // خيار إضافي في أسفل القائمة لإضافة المادة إذا لم تكن مطابقة بالكامل لما كتبه الطالب
      if (trimmedQuery && !matches.some(m => m.code.toUpperCase() === trimmedQuery.toUpperCase() || m.nameAr === trimmedQuery)) {
        const addFooter = document.createElement("div");
        addFooter.className = "p-2.5 border-t border-slate-200 bg-slate-50/80 hover:bg-emerald-50 flex items-center justify-between gap-2 text-xs transition cursor-pointer";
        addFooter.onclick = () => addCustomCourseFromSearch(rowId, trimmedQuery, isBestWorst);
        addFooter.innerHTML = \`
          <span class="text-slate-600 text-[11px] font-medium">مادتك غير موجودة بالضبط في النتائج؟</span>
          <span class="text-emerald-700 hover:text-emerald-800 font-black text-[11px] underline flex items-center gap-1">
            + إضافة "\${escapedQuery}" كمقرر جديد
          </span>
        \`;
        listDiv.appendChild(addFooter);
      }

      listDiv.classList.remove("hidden");
      if (!isBestWorst) autoSaveAll();
    }

    function handleCourseSearchKeydown(e, rowId) {
      const listDiv = document.getElementById(\`autocomplete_\${rowId}\`);
      if (!listDiv || listDiv.classList.contains("hidden")) return;

      const items = listDiv.querySelectorAll(".autocomplete-item");
      let activeIndex = parseInt(listDiv.dataset.activeIndex || "-1", 10);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          activeIndex = (activeIndex + 1) % items.length;
          updateActiveAutocompleteItem(items, activeIndex, listDiv);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          activeIndex = (activeIndex - 1 + items.length) % items.length;
          updateActiveAutocompleteItem(items, activeIndex, listDiv);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].click();
        } else {
          const val = e.target.value.trim();
          if (val) {
            const matches = searchCourseCatalog(val);
            if (matches.length > 0) {
              const firstItem = listDiv.querySelector(".autocomplete-item");
              if (firstItem) firstItem.click();
            } else {
              addCustomCourseFromSearch(rowId, val, false);
            }
          }
        }
      } else if (e.key === "Escape") {
        listDiv.classList.add("hidden");
      }
    }

    function updateActiveAutocompleteItem(items, activeIndex, listDiv) {
      items.forEach(item => item.classList.remove("autocomplete-active"));
      if (items[activeIndex]) {
        items[activeIndex].classList.add("autocomplete-active");
        items[activeIndex].scrollIntoView({ block: "nearest" });
      }
      listDiv.dataset.activeIndex = activeIndex.toString();
    }`;

if (sIdx !== -1 && eIdx !== -1) {
  const fullOldBlock = normalized.slice(sIdx, eIdx + eMarker.length);
  normalized = normalized.replace(fullOldBlock, newSearchAndCustomBlock);
  console.log('✓ 2. searchCourseCatalog & handleCourseSearchInput updated successfully');
} else {
  console.log('❌ 2. search block not found: sIdx =', sIdx, 'eIdx =', eIdx);
}

// 3. Past courses modal functions replacement
const pMarker = `// بناء قائمة المقررات السابقة حسب فرقة الطالب
    function renderPastCoursesChecklist(currentBatch) {`;

const peMarker = `showToast(\`تم حفظ \${checkedBoxes.length} مقررات سابقة بنجاح! شجرة المتطلبات وسجلك الأكاديمي مفعلان بالكامل 🎉\`);
    }`;

const pIdx = normalized.indexOf(pMarker);
const peIdx = normalized.indexOf(peMarker);

const newPastFnBlock = `// فلترة وبحث المقررات في نافذة المقررات السابقة
    function filterPastCoursesModal(rawQuery) {
      const addBox = document.getElementById("pastCoursesSearchAddBox");
      const customNameSpan = document.getElementById("pastCoursesSearchCustomName");
      const trimmed = (rawQuery || "").trim();
      const norm = normalizeSearchText(trimmed);

      const rows = document.querySelectorAll(".past-course-row");
      let visibleCount = 0;

      rows.forEach(row => {
        const searchData = normalizeSearchText(row.dataset.search || "");
        if (!norm || searchData.includes(norm)) {
          row.classList.remove("hidden");
          visibleCount++;
        } else {
          row.classList.add("hidden");
        }
      });

      // إذا لم توجد نتائج وبحث الطالب عن نص معين، إتاحة إضافته فوراً كمادة سابقة
      if (trimmed && visibleCount === 0) {
        if (addBox && customNameSpan) {
          customNameSpan.innerText = \`"\${trimmed}"\`;
          addBox.classList.remove("hidden");
        }
      } else {
        if (addBox) addBox.classList.add("hidden");
      }
    }

    // إضافة مادة سابقة مخصصة غير مدرجة بالقائمة
    function addPastCustomCourse() {
      const input = document.getElementById("pastCoursesSearchInput");
      const rawName = input ? input.value.trim() : "";
      if (!rawName) return;

      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الثانية";
      const currentIdx = ALL_BATCHES.indexOf(batch);
      const defaultBatch = currentIdx > 0 ? ALL_BATCHES[currentIdx - 1] : "الفرقة الأولى";

      const code = extractCourseCode(rawName) || \`CUSTOM-\${Date.now().toString().slice(-4)}\`;
      const safeCode = code.replace(/\\s+/g, '_');

      let existing = COURSE_CATALOG.find(c => c.code.toUpperCase() === code.toUpperCase() || c.nameAr === rawName);
      if (!existing) {
        existing = {
          code: code,
          codeAr: code,
          nameAr: rawName,
          nameEn: rawName,
          credits: 3,
          prereq: "-",
          type: "اختياري",
          isCustom: true
        };
        COURSE_CATALOG.push(existing);
        saveCustomCoursesToStorage();
      }

      const container = document.getElementById("pastCoursesListContainer");
      const targetGrid = container ? container.querySelector(".grid") : null;
      if (!targetGrid) return;

      const card = document.createElement("label");
      card.className = "past-course-row flex items-center justify-between gap-2 p-2.5 bg-emerald-50/70 hover:bg-emerald-50 rounded-xl border border-emerald-300 transition cursor-pointer select-none";
      card.dataset.search = \`\${code} \${rawName}\`;
      card.innerHTML = \`
        <div class="flex items-center gap-2.5 overflow-hidden">
          <input type="checkbox" id="past_chk_\${safeCode}" data-code="\${code}" data-credits="3" data-batch="\${defaultBatch}" checked onchange="updatePastModalCounters()" class="past-course-checkbox w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0">
          <div class="truncate">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-black text-slate-800 text-[11px] bg-white px-1.5 py-0.2 rounded border border-slate-200" dir="ltr">\${code}</span>
              <strong class="text-xs text-slate-800 truncate">\${rawName}</strong>
            </div>
            <span class="text-[9px] text-emerald-700 font-bold block truncate">(مقرر إضافي مجتاز)</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">3 ساعات</span>
        </div>
      \`;
      targetGrid.prepend(card);

      if (input) input.value = "";
      filterPastCoursesModal("");
      updatePastModalCounters();
      showToast(\`تمت إضافة المقرر "\${rawName}" كمقرر سابق مجتاز بنجاح! 🎉\`);
    }

    // بناء قائمة المقررات السابقة حسب فرقة الطالب (بدون طلب التقدير إطلاقاً)
    function renderPastCoursesChecklist(currentBatch) {
      const container = document.getElementById("pastCoursesListContainer");
      if (!container) return;
      container.innerHTML = "";

      // إعادة تصفير حقل البحث
      const sInput = document.getElementById("pastCoursesSearchInput");
      if (sInput) sInput.value = "";
      const addBox = document.getElementById("pastCoursesSearchAddBox");
      if (addBox) addBox.classList.add("hidden");

      const currentIdx = ALL_BATCHES.indexOf(currentBatch);
      const priorBatches = ALL_BATCHES.slice(0, currentIdx);

      const existingCoursesMap = {};
      priorBatches.forEach(b => {
        SEMESTER_CONFIGS.forEach(s => {
          const list = (allYearsCourses[b] && allYearsCourses[b][s.id]) || [];
          list.forEach(c => {
            const code = extractCourseCode(c.searchVal);
            if (code) existingCoursesMap[code] = c.grade;
          });
        });
      });

      priorBatches.forEach((bName, bIdx) => {
        const bLevelChar = (bIdx + 1).toString();
        const bCourses = COURSE_CATALOG.filter(c => {
          if (c.type !== "إجباري") return false;
          const m = c.code.match(/\\d{3}/);
          return m && m[0].charAt(0) === bLevelChar;
        });

        const section = document.createElement("div");
        section.className = "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3";

        const totalHoursInBatch = bCourses.reduce((sum, c) => sum + c.credits, 0);

        section.innerHTML = \`
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">\${bIdx + 1}</span>
              <h4 class="text-sm font-extrabold text-slate-800">مقررات \${bName}</h4>
            </div>
            <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">\${bCourses.length} مقررات (\${totalHoursInBatch} ساعة)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            \${bCourses.map(c => {
              const safeCode = c.code.replace(/\\s+/g, '_');
              const isChecked = existingCoursesMap[c.code] ? existingCoursesMap[c.code] !== 'F' : true;

              return \`
                <label class="past-course-row flex items-center justify-between gap-2 p-2.5 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer select-none" data-search="\${c.code} \${c.codeAr || ''} \${c.nameAr} \${c.nameEn}">
                  <div class="flex items-center gap-2.5 overflow-hidden">
                    <input type="checkbox" id="past_chk_\${safeCode}" data-code="\${c.code}" data-credits="\${c.credits}" data-batch="\${bName}" onchange="updatePastModalCounters()" \${isChecked ? 'checked' : ''} class="past-course-checkbox w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0">
                    <div class="truncate">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-black text-slate-800 text-[11px] bg-white px-1.5 py-0.2 rounded border border-slate-200" dir="ltr">\${c.code}</span>
                        <strong class="text-xs text-slate-800 truncate">\${c.nameAr}</strong>
                      </div>
                      <span class="text-[9px] text-slate-400 font-medium block truncate" dir="ltr">\${c.nameEn}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">\${c.credits} ساعات</span>
                  </div>
                </label>
              \`;
            }).join('')}
          </div>
        \`;

        container.appendChild(section);
      });

      updatePastModalCounters();
      lucide.createIcons();
    }

    // تحديث عدادات نافذة المقررات السابقة فورياً
    function updatePastModalCounters() {
      const checkboxes = document.querySelectorAll(".past-course-checkbox");
      let totalHours = 0;
      let totalCourses = 0;

      checkboxes.forEach(chk => {
        if (chk.checked) {
          totalCourses++;
          totalHours += parseInt(chk.dataset.credits) || 3;
        }
      });

      const hEl = document.getElementById("pastModalHoursCount");
      const cEl = document.getElementById("pastModalCoursesCount");
      if (hEl) hEl.innerText = totalHours;
      if (cEl) cEl.innerText = totalCourses;
    }

    // تحديد أو إلغاء تحديد كافة مقررات السنوات السابقة
    function selectAllPastCourses(selectAll) {
      document.querySelectorAll(".past-course-checkbox").forEach(chk => {
        chk.checked = selectAll;
      });
      updatePastModalCounters();
    }

    // حفظ المقررات السابقة وتوزيعها تلقائياً على فصول السجل (دون مطالبة بالتقدير)
    function savePastCoursesSelection() {
      const checkboxes = document.querySelectorAll(".past-course-checkbox");
      const checkedBoxes = Array.from(checkboxes).filter(chk => chk.checked);

      if (checkedBoxes.length === 0) {
        showToast("يرجى اختيار المقررات التي اجتزتها لتتمكن من المتابعة!", true);
        return;
      }

      const batch = document.getElementById("displayStudentBatch")?.innerText || "الفرقة الأولى";
      const currentIdx = ALL_BATCHES.indexOf(batch);
      const priorBatches = ALL_BATCHES.slice(0, currentIdx);

      // استخراج التقديرات المسجلة مسبقاً إن وجدت
      const existingCoursesMap = {};
      priorBatches.forEach(b => {
        SEMESTER_CONFIGS.forEach(s => {
          const list = (allYearsCourses[b] && allYearsCourses[b][s.id]) || [];
          list.forEach(c => {
            const code = extractCourseCode(c.searchVal);
            if (code) existingCoursesMap[code] = c.grade;
          });
        });
      });

      // تصفير فصول السنوات السابقة لإعادة تعبئتها بالمقررات المحددة بدقة
      priorBatches.forEach(b => {
        allYearsCourses[b] = { term_1: [], term_2: [], summer_term: [] };
      });

      let totalEarnedHours = 0;
      let totalQualityPts = 0;

      checkedBoxes.forEach(chk => {
        const code = chk.dataset.code;
        const credits = parseInt(chk.dataset.credits) || 3;
        // لا يُطلب التقدير: نعتمد التقدير المسجل مسبقاً إن وجد ولم يكن F، وإلا تقدير B (3.00) كمقرر مجتاز بنجاح
        const grade = (existingCoursesMap[code] && existingCoursesMap[code] !== 'F') ? existingCoursesMap[code] : "B";
        const pts = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : 3.00;

        const catCourse = COURSE_CATALOG.find(c => c.code.toUpperCase() === code.toUpperCase());
        const searchVal = catCourse ? \`\${catCourse.code} - \${catCourse.nameAr} (\${catCourse.nameEn})\` : code;

        const schedule = STANDARD_COURSE_SCHEDULE[code] || { batch: chk.dataset.batch || "الفرقة الأولى", semId: "term_1" };
        const targetBatch = schedule.batch;
        const targetSem = schedule.semId;

        if (!allYearsCourses[targetBatch]) {
          allYearsCourses[targetBatch] = { term_1: [], term_2: [], summer_term: [] };
        }

        allYearsCourses[targetBatch][targetSem].push({
          searchVal: searchVal,
          credits: credits,
          grade: grade,
          isRetake: false
        });

        totalEarnedHours += credits;
        totalQualityPts += (credits * pts);
      });

      // تحديث الساعات والمعدل السابق دون مسح المعدل التراكمي السابق إذا كان الطالب قد أدخله بالفعل
      const prevHoursInput = document.getElementById("prevHoursInput");
      const prevGpaInput = document.getElementById("prevGpaInput");
      if (prevHoursInput) {
        prevHoursInput.value = totalEarnedHours;
      }
      if (prevGpaInput && (!prevGpaInput.value || parseFloat(prevGpaInput.value) === 0)) {
        const calculatedOldGpa = totalEarnedHours > 0 ? (totalQualityPts / totalEarnedHours) : 3.00;
        prevGpaInput.value = calculatedOldGpa.toFixed(2);
      }

      hasConfiguredPastCourses = true;

      if (currentViewYear !== batch) {
        loadYearCoursesToTable(currentViewYear);
      }

      closePastCoursesModal();
      handleBatchChange(false);
      recalculateAll();
      autoSaveAll();

      showToast(\`تم حفظ \${checkedBoxes.length} مقررات سابقة مجتازة بنجاح! شجرة المتطلبات وسجلك مفعلان بالكامل 🎉\`);
    }`;

if (pIdx !== -1 && peIdx !== -1) {
  const fullOldPastBlock = normalized.slice(pIdx, peIdx + peMarker.length);
  normalized = normalized.replace(fullOldPastBlock, newPastFnBlock);
  console.log('✓ 3. renderPastCoursesChecklist & savePastCoursesSelection updated successfully');
} else {
  console.log('❌ 3. past courses block not found: pIdx =', pIdx, 'peIdx =', peIdx);
}

// Convert back to original CRLF
if (isCRLF) {
  normalized = normalized.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, normalized, 'utf8');
console.log('Done! Updated index.html successfully.');
