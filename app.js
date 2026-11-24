(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const chapterLabel = document.querySelector('#chapter-label');
  const timeLabel = document.querySelector('#time-label');
  const pageLabel = document.querySelector('#page-label');
  const progress = document.querySelector('#slide-progress');
  const bottomProgress = document.querySelector('#bottom-progress');
  const overview = document.querySelector('#overview-dialog');
  const overviewList = document.querySelector('#overview-list');
  const toast = document.querySelector('#toast');
  let current = 0;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 1800);
  };

  const copyText = async (text, label = '已複製到剪貼簿') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast('請手動複製文字');
    }
  };

  const renderNavigation = () => {
    progress.innerHTML = '';
    overviewList.innerHTML = '';
    slides.forEach((slide, index) => {
      const progressButton = document.createElement('button');
      progressButton.type = 'button';
      progressButton.title = `第 ${index + 1} 頁：${slide.dataset.chapter}`;
      progressButton.addEventListener('click', () => goTo(index));
      progress.append(progressButton);

      const item = document.createElement('button');
      item.type = 'button';
      item.innerHTML = `<small>${String(index + 1).padStart(2, '0')}</small>${slide.dataset.chapter}<i>${slide.dataset.time}</i>`;
      item.addEventListener('click', () => {
        overview.close();
        goTo(index);
      });
      overviewList.append(item);
    });
  };

  const goTo = (nextIndex) => {
    current = Math.max(0, Math.min(slides.length - 1, nextIndex));
    slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
    [...progress.children].forEach((button, index) => button.classList.toggle('active', index === current));
    [...overviewList.children].forEach((button, index) => button.classList.toggle('selected', index === current));
    chapterLabel.textContent = slides[current].dataset.chapter;
    timeLabel.textContent = slides[current].dataset.time;
    pageLabel.innerHTML = `${String(current + 1).padStart(2, '0')} <i>/ ${String(slides.length).padStart(2, '0')}</i>`;
    bottomProgress.style.width = `${((current + 1) / slides.length) * 100}%`;
    document.querySelector('#previous-button').disabled = current === 0;
    document.querySelector('#next-button').disabled = current === slides.length - 1;
    history.replaceState(null, '', `#${current + 1}`);
  };

  document.querySelector('#next-button').addEventListener('click', () => goTo(current + 1));
  document.querySelector('#previous-button').addEventListener('click', () => goTo(current - 1));
  document.querySelector('#home-button').addEventListener('click', () => goTo(0));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => goTo(Number(button.dataset.go))));
  document.querySelector('#overview-button').addEventListener('click', () => overview.showModal());
  document.querySelector('#close-overview').addEventListener('click', () => overview.close());
  document.querySelector('#fullscreen-button').addEventListener('click', async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('#deck').requestFullscreen();
  });
  document.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(current + 1);
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(current - 1);
    if (event.key === 'Escape' && overview.open) overview.close();
  });

  document.querySelector('#show-vague-result').addEventListener('click', () => {
    document.querySelector('#vague-preview').innerHTML = '<div class="browser-bar"><span>● ● ●</span> travel-preview.local</div><div class="tour-hero"><span>EXPLORE THE WORLD</span><h3>岡山，遇見美好。</h3><span class="fake-button">探索岡山旅程 ↗</span></div><div class="tour-bottom"><b>精選旅行靈感</b><p>岡山城　/　倉敷漫遊　/　吉備路散策</p></div>';
    document.querySelector('#vague-note').hidden = false;
  });

  const spellDetails = [
    '使用者：給家人使用，主要在手機查看。',
    '使用情境：旅途中快速確認今天要去哪裡。',
    '核心功能：切換日期，查看每日行程與支出。',
    '介面風格：日系簡約，閱讀清楚、按鈕容易點。',
    '限制條件：保留既有資料，不使用外部套件或 API。',
    '驗收條件：日期切換、總支出與手機版都能正常操作。'
  ];
  let spellIndex = 0;
  const updateSpell = () => {
    const lines = ['請幫我做一個旅遊網頁。', ...spellDetails.slice(0, spellIndex)];
    document.querySelector('#spell-prompt').textContent = lines.join('\n\n');
    document.querySelector('#spell-count').textContent = `${spellIndex} / 6`;
    document.querySelector('#spell-meter').textContent = `${spellIndex} / 6`;
    document.querySelector('#phone-summary').textContent = spellIndex ? `已補上 ${spellIndex} 個需求線索。` : '先從一個清楚的小需求開始。';
    [...document.querySelectorAll('.spell-chip')].forEach((chip, index) => chip.classList.toggle('on', index < spellIndex));
    document.querySelector('#add-spell-part').disabled = spellIndex === spellDetails.length;
  };
  document.querySelector('#add-spell-part').addEventListener('click', () => { spellIndex = Math.min(spellDetails.length, spellIndex + 1); updateSpell(); });
  document.querySelector('#reset-spell').addEventListener('click', () => { spellIndex = 0; updateSpell(); });
  document.querySelectorAll('.spell-chip').forEach((chip, index) => chip.addEventListener('click', () => { spellIndex = index + 1; updateSpell(); }));
  document.querySelector('#copy-spell').addEventListener('click', () => copyText(document.querySelector('#spell-prompt').textContent));

  const feedbacks = {
    需求: ['先提出最小需求', '「先讓我可以切換日期，查看每天要去的景點。」', '第一版先確認日期切換，再逐步加入支出或個人化內容。'],
    驗收: ['驗收不是看一眼', '「我切到 DAY 3，請確認行程與支出是否都改成第三天的資料。」', '用真實操作找出差距，才能知道功能是否真的可用。'],
    修正: ['把差距說具體', '「保留日期切換與景點卡片，只把總支出放在支出明細下方。」', '同時說清楚要改什麼，以及哪些已完成的內容要保留。']
  };
  document.querySelectorAll('.loop-step').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.loop-step').forEach(item => item.classList.toggle('selected', item === button));
    const [label, quote, detail] = feedbacks[button.dataset.feedback];
    document.querySelector('#feedback-panel').innerHTML = `<span class="small-label">${label}</span><blockquote>${quote}</blockquote><p>${detail}</p>`;
  }));

  document.querySelector('#copy-context-prompt').addEventListener('click', () => copyText(document.querySelector('#live-prompt').textContent));
  document.querySelector('#copy-workshop-prompt').addEventListener('click', () => copyText(document.querySelector('#workshop-prompt').textContent));
  document.querySelector('#toggle-complete').addEventListener('click', event => {
    const total = document.querySelector('#demo-total');
    const completed = total.classList.toggle('completed');
    total.innerHTML = completed ? '<span>當日總支出</span><b>¥900</b>' : '<span>當日總支出</span><b>完成後顯示</b>';
    event.currentTarget.textContent = completed ? '還原示範' : '模擬完成結果';
  });

  const verificationItems = [...document.querySelectorAll('#verify-list input')];
  verificationItems.forEach(item => item.addEventListener('change', () => {
    const complete = verificationItems.filter(input => input.checked).length;
    document.querySelector('#verify-status').textContent = complete === verificationItems.length ? '驗收完成。你已確認可交付的成果。' : `已驗收 ${complete} / ${verificationItems.length} 項，請繼續操作確認。`;
  }));

  renderNavigation();
  updateSpell();
  const initial = Math.max(0, Math.min(slides.length - 1, Number(location.hash.slice(1)) - 1 || 0));
  goTo(initial);
})();
