/**
 * MultiTools Hub - College & High School Grade / Final Exam Score Calculator
 * 100% Client-Side Private Computation
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Tab 1 (Final Exam Score)
  const currentGradeInput = document.getElementById('current-grade');
  const targetGradeInput = document.getElementById('target-grade');
  const finalWeightInput = document.getElementById('final-weight');
  const gradeTargetChips = document.querySelectorAll('.target-preset-btn');
  const outRequiredScore = document.getElementById('out-required-score');
  const outScoreStatusBadge = document.getElementById('out-score-status');
  const outFormulaBreakdown = document.getElementById('out-formula-breakdown');

  // DOM Elements - Tab 2 (Weighted Coursework)
  const rowsContainer = document.getElementById('coursework-rows');
  const addRowBtn = document.getElementById('add-assignment-btn');
  const outTotalWeight = document.getElementById('out-total-weight');
  const outSemesterGrade = document.getElementById('out-semester-grade');
  const outLetterGrade = document.getElementById('out-letter-grade');
  const outGpaEquiv = document.getElementById('out-gpa-equiv');

  // Navigation Tabs
  const calcTabBtns = document.querySelectorAll('.grade-tab-btn');
  const calcPanels = document.querySelectorAll('.grade-tab-panel');

  calcTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcTabBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        b.classList.add('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white', 'dark:bg-slate-900', 'text-slate-600', 'dark:text-slate-300');

      const target = btn.dataset.tab;
      calcPanels.forEach(p => {
        if (p.id === target) p.classList.remove('hidden');
        else p.classList.add('hidden');
      });
    });
  });

  // Calculate Final Exam Score Needed
  function calculateFinalExamScore() {
    const current = parseFloat(currentGradeInput?.value) || 0;
    const target = parseFloat(targetGradeInput?.value) || 90;
    const weight = parseFloat(finalWeightInput?.value) || 20;

    if (weight <= 0 || weight > 100) {
      if (outRequiredScore) outRequiredScore.textContent = 'Invalid Weight';
      return;
    }

    const weightDecimal = weight / 100;
    const currentWeightDecimal = 1 - weightDecimal;

    // Mathematical formula: Required = (Target - Current * (1 - W)) / W
    const required = (target - (current * currentWeightDecimal)) / weightDecimal;

    if (outRequiredScore) {
      outRequiredScore.textContent = `${required.toFixed(1)}%`;
    }

    if (outFormulaBreakdown) {
      outFormulaBreakdown.textContent = `Formula: (${target}% - (${current}% × ${(currentWeightDecimal * 100).toFixed(0)}%)) ÷ ${weight}% = ${required.toFixed(1)}%`;
    }

    if (outScoreStatusBadge) {
      if (required <= 0) {
        outScoreStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
        outScoreStatusBadge.textContent = 'Guaranteed! You already secured this grade even with 0% on the final.';
      } else if (required <= 65) {
        outScoreStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
        outScoreStatusBadge.textContent = 'A Breeze! Very easily achievable with basic preparation.';
      } else if (required <= 85) {
        outScoreStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300';
        outScoreStatusBadge.textContent = 'Realistic & Within Reach: Solid standard study routine will get you there.';
      } else if (required <= 100) {
        outScoreStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
        outScoreStatusBadge.textContent = 'High Stakes: Focus heavily and review past exam papers to hit this mark.';
      } else {
        outScoreStatusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
        outScoreStatusBadge.textContent = `Over 100% Needed (${required.toFixed(1)}%): Mathematically impossible unless extra credit or grade curves are awarded.`;
      }
    }
  }

  // Preset target chips
  gradeTargetChips.forEach(btn => {
    btn.addEventListener('click', () => {
      gradeTargetChips.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      if (targetGradeInput) {
        targetGradeInput.value = btn.dataset.target;
        calculateFinalExamScore();
      }
    });
  });

  [currentGradeInput, targetGradeInput, finalWeightInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculateFinalExamScore);
  });

  // Weighted Coursework Calculator Logic
  function getLetterAndGpa(score) {
    if (score >= 93) return { letter: 'A', gpa: '4.0' };
    if (score >= 90) return { letter: 'A-', gpa: '3.7' };
    if (score >= 87) return { letter: 'B+', gpa: '3.3' };
    if (score >= 83) return { letter: 'B', gpa: '3.0' };
    if (score >= 80) return { letter: 'B-', gpa: '2.7' };
    if (score >= 77) return { letter: 'C+', gpa: '2.3' };
    if (score >= 73) return { letter: 'C', gpa: '2.0' };
    if (score >= 70) return { letter: 'C-', gpa: '1.7' };
    if (score >= 67) return { letter: 'D+', gpa: '1.3' };
    if (score >= 60) return { letter: 'D', gpa: '1.0' };
    return { letter: 'F', gpa: '0.0' };
  }

  function calculateSemesterGrade() {
    if (!rowsContainer) return;
    const rows = rowsContainer.querySelectorAll('.assignment-row');

    let totalWeight = 0;
    let weightedScoreSum = 0;

    rows.forEach(row => {
      const weight = parseFloat(row.querySelector('.row-weight')?.value) || 0;
      const score = parseFloat(row.querySelector('.row-score')?.value) || 0;

      totalWeight += weight;
      weightedScoreSum += (score * (weight / 100));
    });

    if (outTotalWeight) {
      outTotalWeight.textContent = `${totalWeight}%`;
      if (totalWeight === 100) {
        outTotalWeight.className = 'font-bold text-emerald-600 dark:text-emerald-400';
      } else {
        outTotalWeight.className = 'font-bold text-amber-600 dark:text-amber-400';
      }
    }

    let finalCumulative = totalWeight > 0 ? (weightedScoreSum / (totalWeight / 100)) : 0;
    const { letter, gpa } = getLetterAndGpa(finalCumulative);

    if (outSemesterGrade) outSemesterGrade.textContent = `${finalCumulative.toFixed(2)}%`;
    if (outLetterGrade) outLetterGrade.textContent = letter;
    if (outGpaEquiv) outGpaEquiv.textContent = `${gpa} / 4.0`;
  }

  function attachRowEvents(row) {
    const inputs = row.querySelectorAll('input');
    inputs.forEach(inp => inp.addEventListener('input', calculateSemesterGrade));

    const removeBtn = row.querySelector('.remove-row-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const totalRows = rowsContainer.querySelectorAll('.assignment-row').length;
        if (totalRows > 1) {
          row.remove();
          calculateSemesterGrade();
        } else {
          if (window.showToast) window.showToast('At least one coursework category is required', 'error');
        }
      });
    }
  }

  if (addRowBtn && rowsContainer) {
    addRowBtn.addEventListener('click', () => {
      const newRow = document.createElement('div');
      newRow.className = 'assignment-row grid grid-cols-12 gap-2 sm:gap-3 items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800';
      newRow.innerHTML = `
        <div class="col-span-6 sm:col-span-5">
          <input type="text" class="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" placeholder="e.g. Quizzes, Midterm" value="Assignment Category">
        </div>
        <div class="col-span-3 sm:col-span-3">
          <input type="number" class="row-weight w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" placeholder="Weight %" value="20" min="0" max="100">
        </div>
        <div class="col-span-2 sm:col-span-3">
          <input type="number" class="row-score w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" placeholder="Score %" value="85" min="0" max="150">
        </div>
        <div class="col-span-1 sm:col-span-1 text-right">
          <button type="button" class="remove-row-btn text-rose-500 hover:text-rose-700 p-1 rounded-md transition-colors" title="Remove row">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      rowsContainer.appendChild(newRow);
      attachRowEvents(newRow);
      if (window.lucide) window.lucide.createIcons();
      calculateSemesterGrade();
    });
  }

  // Attach existing rows
  if (rowsContainer) {
    rowsContainer.querySelectorAll('.assignment-row').forEach(attachRowEvents);
  }

  // Initial runs
  calculateFinalExamScore();
  calculateSemesterGrade();
});
