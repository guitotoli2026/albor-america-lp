/* ==========================================================
   Albor América · script
   ========================================================== */

/* WhatsApp do treino: o P&D informa o número antes do encontro 1.
   Coloque só os dígitos, com 55 e DDD. Exemplo: "5512900000000".
   Enquanto estiver vazio, o botão abre o WhatsApp para escolher o contato. */
const WHATSAPP_NUMERO = "";
const WHATSAPP_MENSAGEM = "Olá! Quero saber mais sobre o Albor América.";

(function configurarWhatsApp() {
  const link = document.getElementById("whatsapp");
  if (!link) return;
  const texto = encodeURIComponent(WHATSAPP_MENSAGEM);
  link.href = WHATSAPP_NUMERO
    ? `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`
    : `https://wa.me/?text=${texto}`;
})();

/* ---------- Galeria em tela cheia ---------- */

(function galeria() {
  const botoes = Array.from(document.querySelectorAll(".mosaico button"));
  const tela = document.getElementById("tela-cheia");
  if (!botoes.length || !tela) return;

  const img = document.getElementById("tela-cheia-img");
  const legenda = document.getElementById("tela-cheia-legenda");
  const contador = document.getElementById("tela-cheia-contador");
  const fechar = tela.querySelector(".tela-cheia__fechar");
  const anterior = tela.querySelector(".tela-cheia__anterior");
  const proxima = tela.querySelector(".tela-cheia__proxima");

  const imagens = botoes.map((b) => b.querySelector("img"));
  let atual = 0;
  let origem = null;

  function mostrar(indice) {
    atual = (indice + imagens.length) % imagens.length;
    const fonte = imagens[atual];
    img.src = fonte.currentSrc || fonte.src;
    img.alt = fonte.alt;
    legenda.textContent = fonte.alt;
    contador.textContent = `${atual + 1} de ${imagens.length}`;
  }

  function abrir(indice) {
    origem = document.activeElement;
    mostrar(indice);
    tela.hidden = false;
    document.body.classList.add("sem-rolagem");
    fechar.focus();
  }

  function fecharTela() {
    tela.hidden = true;
    document.body.classList.remove("sem-rolagem");
    if (origem) origem.focus();
  }

  botoes.forEach((b, i) => b.addEventListener("click", () => abrir(i)));
  fechar.addEventListener("click", fecharTela);
  anterior.addEventListener("click", () => mostrar(atual - 1));
  proxima.addEventListener("click", () => mostrar(atual + 1));

  // Tocar fora da imagem fecha
  tela.addEventListener("click", (e) => {
    if (e.target === tela) fecharTela();
  });

  // Teclado: Esc, setas e foco preso dentro da tela cheia
  document.addEventListener("keydown", (e) => {
    if (tela.hidden) return;
    if (e.key === "Escape") fecharTela();
    else if (e.key === "ArrowLeft") mostrar(atual - 1);
    else if (e.key === "ArrowRight") mostrar(atual + 1);
    else if (e.key === "Tab") {
      const focaveis = [fechar, anterior, proxima];
      const i = focaveis.indexOf(document.activeElement);
      e.preventDefault();
      const passo = e.shiftKey ? -1 : 1;
      focaveis[(i + passo + focaveis.length) % focaveis.length].focus();
    }
  });

  // Arrastar para o lado no celular
  let inicioX = null;
  tela.addEventListener("touchstart", (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
  tela.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
    inicioX = null;
  });
})();

/* ---------- Plantas: abas por tipo e carrossel ---------- */

(function plantas() {
  const abas = Array.from(document.querySelectorAll('.plantas__abas [role="tab"]'));
  const contador = document.querySelector(".carrossel__contador");
  if (!abas.length) return;

  let painel = document.getElementById(abas[0].getAttribute("aria-controls"));
  let atual = 0;

  function imagens() { return Array.from(painel.querySelectorAll("img")); }

  function mostrar(indice) {
    const lista = imagens();
    atual = (indice + lista.length) % lista.length;
    lista.forEach((img, i) => { img.hidden = i !== atual; });
    contador.textContent = `${atual + 1} de ${lista.length}`;
  }

  function escolher(aba, focar) {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", ativa ? "true" : "false");
      a.tabIndex = ativa ? 0 : -1;
      document.getElementById(a.getAttribute("aria-controls")).hidden = !ativa;
    });
    painel = document.getElementById(aba.getAttribute("aria-controls"));
    if (focar) aba.focus();
    mostrar(0);
  }

  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => escolher(aba));
    aba.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const passo = e.key === "ArrowRight" ? 1 : -1;
        escolher(abas[(i + passo + abas.length) % abas.length], true);
      }
    });
  });

  document.querySelectorAll(".carrossel__seta").forEach((b) => {
    b.addEventListener("click", () => mostrar(atual + Number(b.dataset.passo)));
  });

  // Arrastar para o lado no celular
  document.querySelectorAll(".carrossel__trilho").forEach((trilho) => {
    let inicioX = null;
    trilho.addEventListener("touchstart", (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    trilho.addEventListener("touchend", (e) => {
      if (inicioX === null) return;
      const dx = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      inicioX = null;
    });
  });

  mostrar(0);
})();

/* ---------- Formulário de contato ---------- */

(function formulario() {
  const form = document.getElementById("formulario");
  const confirmacao = document.getElementById("confirmacao");
  if (!form) return;

  const telefone = form.telefone;

  // Máscara simples: (12) 99999-9999
  telefone.addEventListener("input", () => {
    const d = telefone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    telefone.value = v;
  });

  function erro(nome, mensagem, campo) {
    const p = document.getElementById(`${nome}-erro`);
    p.textContent = mensagem;
    if (campo) {
      campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
      if (mensagem) campo.setAttribute("aria-describedby", `${nome}-erro`);
      else campo.removeAttribute("aria-describedby");
    }
    return !mensagem;
  }

  function validar() {
    const digitos = telefone.value.replace(/\D/g, "");
    const email = form.email.value.trim();
    const resultados = [
      erro("nome", form.nome.value.trim().length < 2 ? "Escreva seu nome." : "", form.nome),
      erro("telefone", digitos.length < 10 ? "Escreva o telefone com DDD, por exemplo (12) 99999-9999." : "", telefone),
      erro("email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Escreva um e-mail válido, por exemplo nome@email.com." : "", form.email),
      erro("apartamento", !form.querySelector('input[name="apartamento"]:checked') ? "Escolha uma opção." : ""),
      erro("aceite", !form.aceite.checked ? "Marque o aceite para a equipe poder falar com você." : "", form.aceite),
    ];
    return resultados.every(Boolean);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validar()) {
      const primeiro = form.querySelector('[aria-invalid="true"]') || form.querySelector('input[name="apartamento"]');
      if (primeiro) primeiro.focus();
      return;
    }
    // No treino, o contato não é enviado de verdade.
    form.hidden = true;
    confirmacao.hidden = false;
    confirmacao.focus();
  });
})();
