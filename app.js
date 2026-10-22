/* =========================================================
   그러니까, 제가 왜 늦었냐면.. — 사과문 생성기
   API 키 없이도 내장 생성기가 자동으로 사과문을 만들어 줍니다.
   ========================================================= */

/* ---------- 뷰 전환 ---------- */
const views = {
  splash: document.getElementById('view-splash'),
  form: document.getElementById('view-form'),
  loading: document.getElementById('view-loading'),
  result: document.getElementById('view-result'),
};
function show(name){
  Object.values(views).forEach(v => v.classList.remove('is-active'));
  views[name].classList.add('is-active');
  views[name].style.display = 'block';
  Object.entries(views).forEach(([k,v]) => { if(k!==name) v.style.display=''; });
  window.scrollTo({top:0, behavior:'instant'});
}

/* ---------- 스플래시: 사과(🍎) 밀어서 시작 ---------- */
const dragzone = document.getElementById('dragzone');
const knob = document.getElementById('appleKnob');
let dragging = false, startX = 0, maxX = 0;

function knobStart(x){ dragging = true; startX = x - knob.offsetLeft; maxX = dragzone.clientWidth - knob.offsetWidth - 12; }
function knobMove(x){
  if(!dragging) return;
  let pos = Math.max(0, Math.min(maxX, x - startX));
  knob.style.left = pos + 'px';
  if(pos >= maxX - 4){ dragging = false; launch(); }
}
function knobEnd(){ if(dragging){ dragging = false; knob.style.transition='left .3s'; knob.style.left='0px'; setTimeout(()=>knob.style.transition='',300);} }
function launch(){ knob.style.left = maxX + 'px'; setTimeout(()=>{ show('form'); knob.style.left='0px'; }, 260); }

knob.style.position='absolute'; knob.style.left='0px';
knob.addEventListener('mousedown', e=>{ e.preventDefault(); knobStart(e.clientX); });
window.addEventListener('mousemove', e=> knobMove(e.clientX));
window.addEventListener('mouseup', knobEnd);
knob.addEventListener('touchstart', e=> knobStart(e.touches[0].clientX), {passive:true});
window.addEventListener('touchmove', e=>{ if(dragging){ knobMove(e.touches[0].clientX);} }, {passive:true});
window.addEventListener('touchend', knobEnd);
knob.addEventListener('click', ()=>{ show('form'); });
document.getElementById('skipSplash').addEventListener('click', ()=> show('form'));

/* ---------- 헤더 단어 애니메이션 ---------- */
const rotWords = ["사과문을","변명을","반성문을","해명을","위로를","진심을"];
let rotI = 0;
const rotEl = document.getElementById('animatedText');
setInterval(()=>{
  if(!rotEl) return;
  rotEl.style.opacity = '0';
  setTimeout(()=>{ rotI = (rotI+1)%rotWords.length; rotEl.textContent = rotWords[rotI]; rotEl.style.opacity='1'; }, 400);
}, 2600);

/* ---------- 글자수 카운터 ---------- */
document.querySelectorAll('.field input').forEach(inp=>{
  const counter = document.querySelector(`.field__count[data-for="${inp.id}"]`);
  if(!counter) return;
  const max = inp.getAttribute('maxlength');
  const upd = ()=> counter.textContent = `${inp.value.length}/${max}`;
  inp.addEventListener('input', upd); upd();
});

/* ---------- 상세 설정 토글 ---------- */
const detailToggle = document.getElementById('detailToggle');
const detail = document.getElementById('detail');
detailToggle.addEventListener('click', ()=>{
  const open = detail.hasAttribute('hidden');
  if(open){ detail.removeAttribute('hidden'); } else { detail.setAttribute('hidden',''); }
  detailToggle.classList.toggle('is-open', open);
});

/* ---------- T/F 슬라이더 → 형용사 ---------- */
// 왼쪽(T·논리) → 오른쪽(F·감성) 순서
const ADJ = ["노골적인","무례할 정도로 솔직한","거침없는","직접적인","솔직한",
  "직선적인","명확한","단호한","논리적인","냉정한",
  "동정심 많은","감동적인","공감적인","이해심 있는","배려 깊은",
  "인정 많은","관대한","민감한","따뜻한","애정 어린"];
const tfRange = document.getElementById('tfRange');
const toneWord = document.getElementById('toneWord');
function adjByTF(v){ return ADJ[Math.min(19, Math.floor(v/5.1))]; }
tfRange.addEventListener('input', ()=> toneWord.textContent = adjByTF(+tfRange.value));
toneWord.textContent = adjByTF(+tfRange.value);

/* ---------- localStorage: API 키 ---------- */
const apikeyInput = document.getElementById('apikey');
apikeyInput.value = localStorage.getItem('s4bl_key') || '';
apikeyInput.addEventListener('change', ()=> localStorage.setItem('s4bl_key', apikeyInput.value.trim()));

/* =========================================================
   관계 · 말투 설정 (말투 / 친한 정도 / 정중 모드)
   ========================================================= */
const registerSeg = document.getElementById('registerSeg');
const segBtns = [...registerSeg.querySelectorAll('.seg__btn')];
const closeRange = document.getElementById('closeRange');
const closeWord = document.getElementById('closeWord');
const strictEl = document.getElementById('strict');
const strictLabel = document.getElementById('strictLabel');
const relHint = document.getElementById('relHint');
const toInput = document.getElementById('to');

let register = 'polite';            // formal | polite | casual
let userTouched = false;            // 사용자가 직접 바꾸면 자동 추천을 멈춤

const CLOSE_WORDS = ["어려운","조금 아는","친한","아주 친한"];
const closeLevel = v => Math.min(3, Math.floor(v/25));   // 0~3
function updCloseWord(){ closeWord.textContent = CLOSE_WORDS[closeLevel(+closeRange.value)]; }

function setRegister(v){
  if(strictEl.checked && v==='casual') v = 'formal';
  register = v;
  segBtns.forEach(b=>{
    const on = b.dataset.v===v;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-checked', on);
  });
}
function setStrict(on){
  strictEl.checked = on;
  strictLabel.classList.toggle('is-on', on);
  segBtns.find(b=>b.dataset.v==='casual').disabled = on;
  if(on && register==='casual') setRegister('formal');
}

segBtns.forEach(b=> b.addEventListener('click', ()=>{ if(b.disabled) return; userTouched=true; relHint.textContent=''; setRegister(b.dataset.v); }));
closeRange.addEventListener('input', ()=>{ userTouched=true; relHint.textContent=''; updCloseWord(); });
strictEl.addEventListener('change', ()=>{ userTouched=true; relHint.textContent=''; setStrict(strictEl.checked); });
updCloseWord();

// 받는 사람 이름을 보고 말투를 자동으로 추천 (직접 바꾸기 전까지만)
const ELDER = /(교수|선생|팀장|부장|과장|차장|실장|대리|이사|대표|사장|원장|조교|담임|선배님|어머님|아버님|할머니|할아버지|님$)/;
const FRIEND = /(친구|썸|남친|여친|남자친구|여자친구|애인|자기|베프|동생|짝꿍|동기)/;
toInput.addEventListener('input', ()=>{
  if(userTouched) return;
  const t = toInput.value.trim();
  if(ELDER.test(t)){
    setStrict(true); setRegister('formal'); closeRange.value = 15; updCloseWord();
    relHint.textContent = `‘${t}’ — 윗사람이라 정중 모드로 맞췄어요`;
  }else if(FRIEND.test(t)){
    setStrict(false); setRegister('casual'); closeRange.value = 65; updCloseWord();
    relHint.textContent = `‘${t}’ — 편한 사이라 반말로 맞췄어요`;
  }else{
    relHint.textContent = '';
  }
});

/* =========================================================
   사과문 생성기 (내장)
   ========================================================= */
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

function collect(){
  return {
    to: document.getElementById('to').value.trim(),
    intent: document.getElementById('intent').value.trim(),
    goal: document.getElementById('goal').value.trim(),
    from: document.getElementById('from').value.trim(),
    type: document.getElementById('type').value.trim(),
    etc: document.getElementById('etc').value.trim(),
    len: +document.getElementById('lengthRange').value,   // 0=장문 100=단문
    tf:  +document.getElementById('tfRange').value,        // 0=T 100=F
    reg: register,                                         // formal | polite | casual
    close: closeLevel(+closeRange.value),                  // 0=어려운 … 3=아주 친한
    strict: strictEl.checked,                              // 윗사람·공적인 자리
  };
}

/* ---------- 말투별 문장 모음 ----------
   F = 감성·공감, T = 논리·팩트
   reason = 진지한 이유, joke = 친한 사이에서만 쓰는 가벼운 변명 */
const SET = {
  /* ===== 격식 존댓말 (~습니다) ===== */
  formal: {
    title:{ F:to=>[`${to}께 드리는 사과의 말씀`, `늦었지만 진심을 담은 사과의 말씀`],
            T:to=>[`${to}께 드리는 사과와 앞으로의 다짐`, `상황을 있는 그대로 말씀드리는 사과`] },
    opener:[`갑작스럽게 연락드려 송구합니다.`, `바쁘신 중에 글을 올리게 되어 죄송합니다.`],
    greet:{ F:to=>[`${to}께 조심스럽게 이 글을 올립니다.`, `${to}, 먼저 사과의 말씀부터 드리겠습니다.`],
            T:to=>[`${to}, 바로 본론부터 말씀드리겠습니다.`, `${to}께 사실 그대로 말씀드립니다.`] },
    situ:{ F:i=>[`「${i}」 — 그 일로 불편을 드린 점, 마음이 무겁습니다.`, `「${i}」 — 돌이켜보면 제가 더 신경 썼어야 했습니다.`],
           T:i=>[`「${i}」 — 변명 없이 상황부터 말씀드립니다.`, `「${i}」 — 이 부분은 명백히 제 잘못입니다.`, `「${i}」 — 이에 대한 책임은 전적으로 저에게 있습니다.`] },
    sorry:{ F:[`진심으로 사과드립니다. 어떤 말로도 부족하다는 것을 잘 알고 있습니다.`, `정말 죄송합니다. 제 진심이 조금이라도 전해지기를 바랍니다.`],
            T:[`사과드립니다. 원인은 분명하며, 핑계는 대지 않겠습니다.`, `잘못을 인정합니다. 같은 일이 반복되지 않도록 하겠습니다.`] },
    reason:[`예상하지 못한 일이 겹치면서`, `제 부주의로 시간을 잘못 계산하여`, `일정 관리를 제대로 하지 못해`],
    joke:[`마음은 진작 도착했는데 몸이 늦게 따라오는 바람에`],
    reasonEnd:` 이런 일이 생겼습니다.`,
    reasonTail:{ F:` 그래도 이유가 사과를 대신할 수는 없다고 생각합니다.`, T:` 다만 이유와 관계없이 결과에 대한 책임은 제게 있습니다.` },
    goal:{ F:g=>`「${g}」 — 이 마음이 말뿐이 되지 않도록 행동으로 보여 드리겠습니다.`, T:g=>`「${g}」 — 다음부터 바로 실천하겠습니다.` },
    close:{ F:[`다시 한번 너그러운 이해를 부탁드립니다.`, `부족한 저를 믿어 주셔서 감사하고, 또 죄송합니다.`],
            T:[`신뢰를 회복할 기회를 주시면 감사하겠습니다.`, `끝까지 읽어 주셔서 감사합니다. 결과로 증명하겠습니다.`] },
    sign:(n,strict)=> n ? `— ${n} ${strict?'올림':'드림'}` : `— 진심을 담아`,
  },

  /* ===== 존댓말 (~해요) ===== */
  polite: {
    title:{ F:to=>[`${to}께 전하는 진심 어린 사과`, `늦었지만, 마음만은 진심인 사과`],
            T:to=>[`${to}께 드리는 솔직한 사과`, `있는 그대로 전하는 사과`] },
    opener:[`갑자기 연락드려서 죄송해요.`, `바쁘실 텐데 이렇게 글 남겨서 죄송해요.`],
    greet:{ F:to=>[`${to}, 안녕하세요. 꼭 사과드리고 싶어서 연락드려요.`, `${to}, 조심스럽게 이야기 꺼내 볼게요.`],
            T:to=>[`${to}, 바로 본론부터 말씀드릴게요.`, `${to}, 있는 그대로 말씀드릴게요.`] },
    greetClose:{ F:to=>[`${to}, 저예요. 꼭 할 말이 있어서요.`], T:to=>[`${to}, 돌려 말하지 않고 바로 말할게요.`] },
    situ:{ F:i=>[`「${i}」 — 그 일로 많이 속상하셨죠. 생각할수록 마음이 무거워요.`, `「${i}」 — 돌이켜보니 제가 더 신경 썼어야 했어요.`],
           T:i=>[`「${i}」 — 이건 분명히 제 잘못이에요.`, `「${i}」 — 핑계 없이 상황부터 말씀드릴게요.`] },
    sorry:{ F:[`정말 미안해요. 제 마음이 조금이라도 전해졌으면 좋겠어요.`, `진심으로 사과할게요. 말로는 다 부족한 거 알아요.`],
            T:[`미안해요. 원인은 분명하고, 핑계는 안 댈게요.`, `잘못한 거 인정해요. 다시는 같은 일 없게 할게요.`] },
    reason:[`예상 못 한 일이 겹쳐서`, `제가 시간을 잘못 계산해서`, `일정 관리를 제대로 못 해서`],
    joke:[`마음은 진작 도착했는데 몸이 늦게 따라와서`, `알람이랑 제가 서로 못 본 척해서`],
    reasonEnd:` 이렇게 됐어요.`,
    reasonTail:{ F:` 그래도 이유가 사과를 대신할 수는 없다고 생각해요.`, T:` 그래도 결과에 대한 책임은 제가 질게요.` },
    goal:{ F:g=>`「${g}」 — 말로만 끝나지 않게 행동으로 보여 드릴게요.`, T:g=>`「${g}」 — 다음부터 바로 고칠게요.` },
    close:{ F:[`너그럽게 이해해 주시면 정말 고맙겠어요.`, `늘 고맙고, 또 미안해요.`],
            T:[`다시 믿어 주실 기회를 주시면 결과로 보여 드릴게요.`, `끝까지 읽어 줘서 고마워요.`] },
    sign:n=> n ? `— ${n} 드림` : `— 진심을 담아`,
  },

  /* ===== 반말 (~해) ===== */
  casual: {
    title:{ F:to=>[`${to}한테 하는 진심 사과`, `늦었지만, 진심인 사과`],
            T:to=>[`${to}한테 하는 솔직한 사과`, `돌려 말 안 하는 사과`] },
    titleJoke:[`그러니까, 내가 왜 늦었냐면..`],
    opener:[`갑자기 연락해서 놀랐지? 꼭 할 말이 있어서.`],
    greet:{ F:()=>[`있잖아, 꼭 하고 싶은 말이 있어.`, `음… 이건 꼭 말하고 싶었어.`],
            T:()=>[`바로 본론부터 말할게.`, `돌려 말 안 하고 그냥 말할게.`] },
    situ:{ F:i=>[`「${i}」 — 그 일로 많이 속상했지. 생각할수록 마음이 무거워.`, `「${i}」 — 돌이켜보니까 내가 더 신경 썼어야 했어.`],
           T:i=>[`「${i}」 — 이건 확실히 내 잘못이야.`, `「${i}」 — 핑계 안 대고 상황부터 말할게.`] },
    sorry:{ F:[`진짜 미안해. 내 마음이 조금이라도 전해졌으면 좋겠어.`, `정말 미안해. 말로는 다 부족한 거 알아.`],
            T:[`미안해. 원인은 분명하고, 핑계는 안 댈게.`, `내 잘못 인정해. 다시는 이런 일 없게 할게.`] },
    reason:[`예상 못 한 일이 겹쳐서`, `내가 시간 계산을 잘못해서`],
    joke:[`마음은 진작 도착했는데 몸이 늦게 따라와서`, `알람이랑 내가 서로 못 본 척해서`, `시계가 나보다 성격이 급해서`],
    reasonEnd:` 이렇게 됐어.`,
    reasonTail:{ F:` 그래도 이유가 사과를 대신할 순 없다고 생각해.`, T:` 그래도 결과는 내 책임이야.` },
    jokeTail:`…라고 하면 핑계겠지? 그냥 내 잘못이야.`,
    goal:{ F:g=>`「${g}」 — 말로만 안 끝나게 행동으로 보여 줄게.`, T:g=>`「${g}」 — 다음부턴 바로 고칠게.` },
    close:{ F:[`천천히 생각해 보고, 괜찮아지면 연락 줘.`, `늘 고맙고, 또 미안해.`],
            T:[`한 번만 믿어 줘. 결과로 보여 줄게.`] },
    closeBest:[`다음에 맛있는 거 내가 쏠게. 진짜 미안해 🙏`, `화 풀리면 연락 줘. 기다릴게!`],
    sign:n=> n ? `— ${n}` : `— 진심으로, 내가`,
  },
};

function buildLetter(d){
  const F = d.tf >= 50;                 // 감성 register
  const k = F ? 'F' : 'T';
  const short = d.len >= 66;            // 단문형
  const long  = d.len <= 33;            // 장문형
  const reg = (d.strict && d.reg==='casual') ? 'formal' : d.reg;
  const S = SET[reg];
  const to = d.to || (reg==='casual' ? "너" : "여러분");
  const name = d.from || "";
  const humor = !d.strict && d.close >= 2;        // 친한 사이 + 정중 모드 아님 → 가벼운 농담 허용
  const best  = !d.strict && d.close >= 3;        // 아주 친한 사이

  /* --- 제목 --- */
  let titlePool = S.title[k](to);
  if(best && S.titleJoke) titlePool = titlePool.concat(S.titleJoke);
  const title = "제목: " + rand(titlePool);

  /* --- 문단 조립 --- */
  const P = [];

  // 1) 인사 (어려운 사이면 조심스러운 첫마디를 앞에)
  let greet = (d.close >= 2 && S.greetClose) ? rand(S.greetClose[k](to)) : rand(S.greet[k](to));
  if(d.close === 0 && !short) greet = rand(S.opener) + " " + greet;
  P.push(greet);

  // 2) 상황 인정 (사용자 입력을 대시로 분리해 조사 충돌 방지)
  P.push(rand(S.situ[k](d.intent || "이번 일")));

  // 3) 핵심 사과
  let sorry = rand(S.sorry[k]);
  if(reg==='polite' && (d.strict || d.close <= 1)){   // 해요체라도 어려운 사이면 '죄송'으로
    sorry = sorry.replace('정말 미안해요','정말 죄송해요').replace('미안해요','죄송해요').replace('사과할게요','사과드릴게요');
  }
  P.push(sorry);

  // 4) 이유(변명) — 장문/중간에서만. 친한 사이면 가끔 농담 섞인 변명
  if(!short){
    if(humor && Math.random() < 0.6){
      P.push(rand(S.joke) + (S.jokeTail || S.reasonEnd + S.reasonTail[k]));
    }else{
      P.push(rand(S.reason) + S.reasonEnd + S.reasonTail[k]);
    }
  }

  // 5) 다짐 / 의도
  if(d.goal) P.push(S.goal[k](d.goal));

  // 6) 기타
  if(d.etc) P.push(`${d.etc}.`);

  // 7) 맺음 — 장문에서만 (아주 친한 반말이면 장문 아니어도 한 줄)
  if(long || (best && S.closeBest && !short)){
    let closePool = S.close[k];
    if(best && S.closeBest) closePool = S.closeBest;
    let c = rand(closePool);
    if(reg==='polite' && (d.strict || d.close <= 1)) c = c.replace('미안해요','죄송해요').replace('줘서 고마워요','주셔서 감사해요');
    P.push(c);
  }

  let body = P.join(short ? "\n" : "\n\n");

  /* --- 형식 반영 --- */
  if(d.type){
    if(/카톡|카카오|문자|메시지|dm|디엠/i.test(d.type)){
      body = body.replace(/\n\n/g, "\n");   // 메신저는 짧게
    }
    if(/손편지|편지/.test(d.type)){
      body = `To. ${to}\n\n` + body;
    }
  }

  const sign = S.sign(name, d.strict);
  return { title, body, sign, type:d.type };
}

/* =========================================================
   GPT 경로 (선택)
   ========================================================= */
const REG_DESC = { formal:"격식 있는 존댓말(~습니다체)", polite:"부드러운 존댓말(~해요체)", casual:"반말(~해체)" };
async function buildLetterGPT(d, key){
  const adj = adjByTF(d.tf);
  const len = d.len<=33 ? "장문(3~5문단)" : d.len>=66 ? "단문(2~3문장)" : "중간 길이";
  const prompt =
`너는 한국어 사과문을 대신 써 주는 작가야. 아래 조건으로 자연스러운 사과문을 작성해줘.
- 사과 대상: ${d.to}
- 상황: ${d.intent}
- 전하고 싶은 의도/다짐: ${d.goal}
${d.from?`- 보내는 사람: ${d.from}`:""}
${d.type?`- 글의 형식: ${d.type}`:""}
${d.etc?`- 꼭 넣을 내용: ${d.etc}`:""}
- 톤: ${adj} 느낌 (${d.tf>=50?"감성·공감 중심":"논리·팩트 중심"})
- 말투: ${REG_DESC[d.strict && d.reg==='casual' ? 'formal' : d.reg]}
- 받는 사람과의 친한 정도: ${CLOSE_WORDS[d.close]} 사이
${d.strict?"- 받는 사람은 교수님·어른 등 윗사람이야. 장난, 농담, 이모티콘 없이 예의 바르고 정중하게 써.":(d.close>=2?"- 친한 사이니까 너무 딱딱하지 않게, 살짝 귀여운 농담 정도는 괜찮아.":"")}
- 길이: ${len}
첫 줄에 "제목: ..." 형태의 제목을 넣고, 그 아래 본문을 써줘. 군더더기 설명 없이 사과문만.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+key },
    body: JSON.stringify({
      model:"gpt-4o-mini", temperature:0.8, max_tokens:900,
      messages:[{role:"system",content:"You are a warm, articulate Korean apology-letter writer."},
                {role:"user",content:prompt}]
    })
  });
  if(!res.ok) throw new Error("api");
  const j = await res.json();
  const text = j.choices?.[0]?.message?.content?.trim() || "";
  const lines = text.split("\n");
  const title = lines[0].startsWith("제목") ? lines[0] : "제목: 사과의 말씀";
  const body = (lines[0].startsWith("제목") ? lines.slice(1) : lines).join("\n").trim();
  const reg = (d.strict && d.reg==='casual') ? 'formal' : d.reg;
  return { title, body, sign: SET[reg].sign(d.from, d.strict), type:d.type };
}

/* =========================================================
   생성 실행
   ========================================================= */
const form = document.getElementById('excuseForm');
const loadingStatus = document.getElementById('loadingStatus');
const LOAD_MSGS = ["진심을 문장으로 옮기는 중…","적절한 단어를 고르는 중…","조금만 더 정중하게 다듬는 중…","마음을 담는 중…"];
let current = null;

form.addEventListener('submit', e=>{ e.preventDefault(); generate(); });

async function generate(){
  const d = collect();
  if(!d.to || !d.intent || !d.goal){ alert("대상·상황·의도는 꼭 입력해 주세요."); return; }

  show('loading');
  let msgI=0; const timer=setInterval(()=>{ msgI=(msgI+1)%LOAD_MSGS.length; loadingStatus.textContent=LOAD_MSGS[msgI]; },700);

  const key = apikeyInput.value.trim();
  const t0 = performance.now();
  try{
    current = key ? await buildLetterGPT(d, key) : buildLetter(d);
  }catch(err){
    console.warn("GPT 실패, 내장 생성기로 대체:", err);
    current = buildLetter(d);
  }
  const wait = Math.max(0, 1300 - (performance.now()-t0));  // 로딩 연출 최소 시간
  setTimeout(()=>{ clearInterval(timer); render(current); show('result'); }, wait);
}

function render(l){
  document.getElementById('letterTitle').textContent = l.title;
  document.getElementById('letterBody').textContent = l.body;
  document.getElementById('letterSign').textContent = l.sign;
}

/* ---------- 결과 버튼 ---------- */
document.getElementById('editBtn').addEventListener('click', ()=> show('form'));
document.getElementById('regenBtn').addEventListener('click', ()=> generate());
document.getElementById('homeBtn').addEventListener('click', ()=>{
  knob.style.transition='left .3s'; knob.style.left='0px';
  setTimeout(()=>knob.style.transition='',300);
  show('splash');
});

document.getElementById('copyBtn').addEventListener('click', async ()=>{
  const text = `${current.title}\n\n${current.body}\n\n${current.sign}`;
  try{
    if(navigator.share){ await navigator.share({ title:"사과문", text }); return; }
  }catch(_){/* 공유 취소시 복사로 폴백 */}
  try{ await navigator.clipboard.writeText(text); toast("복사됐어요! 붙여넣기 해보세요"); }
  catch(_){ toast("복사에 실패했어요"); }
});

document.getElementById('imageBtn').addEventListener('click', ()=> saveAsImage(current));

/* ---------- 토스트 ---------- */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg){
  toastEl.textContent = msg; toastEl.classList.add('is-show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toastEl.classList.remove('is-show'),1900);
}

/* =========================================================
   이미지로 저장 (canvas)
   ========================================================= */
function saveAsImage(l){
  if(!l) return;
  const W=800, pad=56;
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');

  // 본문 줄바꿈 계산
  ctx.font='26px "Gowun Dodum", sans-serif';
  const bodyLines=[];
  l.body.split("\n").forEach(par=>{
    if(par===""){ bodyLines.push(""); return; }
    let line="";
    for(const ch of par){
      if(ctx.measureText(line+ch).width > W-pad*2){ bodyLines.push(line); line=ch; }
      else line+=ch;
    }
    bodyLines.push(line);
  });

  const titleH=70, lineH=42, signH=70, footH=60;
  const H = pad + titleH + 24 + bodyLines.length*lineH + signH + footH + pad;
  canvas.width=W; canvas.height=H;

  // 배경
  ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#a7d3f0"; ctx.lineWidth=6; ctx.strokeRect(14,14,W-28,H-28);

  let y=pad+8;
  // 브랜드
  ctx.fillStyle="#2f80ed"; ctx.font='34px "Nanum Pen Script", cursive';
  ctx.fillText("🙏 그러니까", pad, y+6);
  y+=48;

  // 제목
  ctx.fillStyle="#1e63c4"; ctx.font='bold 30px "Gaegu","Gowun Dodum",sans-serif';
  wrapFill(ctx, l.title, pad, y, W-pad*2, 38);
  y+=titleH;
  ctx.strokeStyle="#a7d3f0"; ctx.lineWidth=2; ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); ctx.setLineDash([]);
  y+=34;

  // 본문
  ctx.fillStyle="#2c3a4c"; ctx.font='26px "Gowun Dodum",sans-serif';
  bodyLines.forEach(ln=>{ ctx.fillText(ln, pad, y); y+=lineH; });

  // 서명
  y+=18; ctx.fillStyle="#42546b"; ctx.font='24px "Gowun Dodum",sans-serif';
  ctx.textAlign="right"; ctx.fillText(l.sign, W-pad, y); ctx.textAlign="left";

  // 푸터
  ctx.fillStyle="#9aa9bd"; ctx.font='18px "Gowun Dodum",sans-serif';
  ctx.fillText("그러니까, 제가 왜 늦었냐면.. · 사과문 생성기", pad, H-pad+6);

  const url=canvas.toDataURL("image/png");
  const a=document.createElement('a');
  a.href=url; a.download="사과문.png"; a.click();
  toast("이미지로 저장했어요");
}

function wrapFill(ctx,text,x,y,maxW,lh){
  let line="", yy=y;
  for(const ch of text){
    if(ctx.measureText(line+ch).width>maxW){ ctx.fillText(line,x,yy); line=ch; yy+=lh; }
    else line+=ch;
  }
  ctx.fillText(line,x,yy);
}
