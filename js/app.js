const MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

function formatYear(iso) {
  return iso.split("-")[0];
}

function gapLabel(days) {
  if (days < 60) return null;
  if (days < 365) {
    const months = Math.round(days / 30);
    return { tier: "month", text: `${months} ${months === 1 ? "mês depois" : "meses depois"}` };
  }
  if (days < 550) {
    return { tier: "season", text: "quase um ano de silêncio" };
  }
  const years = Math.round(days / 365);
  return { tier: "years", text: `${years} anos de silêncio` };
}

async function loadPosts() {
  const res = await fetch("data/posts.json");
  const posts = await res.json();
  return posts.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
}

function renderTimeline(posts) {
  const list = document.getElementById("post-list");
  if (!list) return;

  if (posts.length === 0) {
    list.outerHTML = '<p class="empty-state">Nenhum texto publicado ainda.</p>';
    return;
  }

  const items = [];
  posts.forEach((post, i) => {
    if (i > 0) {
      const prevDate = parseDate(posts[i - 1].date);
      const thisDate = parseDate(post.date);
      const days = Math.round((thisDate - prevDate) / 86400000);
      const gap = gapLabel(days);
      if (gap) {
        items.push(`
          <li class="silence silence--${gap.tier} reveal-fade" data-reveal="fade">
            <span class="silence-line">${gap.text}</span>
          </li>`);
      }
    }
    items.push(`
      <li>
        <a class="timeline-link" href="post.html?slug=${encodeURIComponent(post.slug)}">
          <div class="timeline-row reveal-blur" data-reveal="blur">
            <span class="timeline-date">
              <span class="year">${formatYear(post.date)}</span>
              ${formatDate(post.date)}
            </span>
            <div>
              <h2 class="timeline-title">${post.title}</h2>
              <p class="timeline-excerpt">${post.excerpt}</p>
            </div>
          </div>
        </a>
      </li>`);
  });

  list.innerHTML = items.join("\n");
}

function renderPost(posts) {
  const container = document.getElementById("post-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) {
    container.innerHTML = `
      <p class="empty-state">
        Esse texto não existe ou foi movido.
        <a href="index.html">Voltar para a lista</a>.
      </p>`;
    document.title = "Não encontrado — Everton Alves";
    document.dispatchEvent(new CustomEvent("content:ready", { detail: { type: "empty" } }));
    return;
  }

  const post = posts[index];
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index < posts.length - 1 ? posts[index + 1] : null;

  document.title = `${post.title} — Everton Alves`;

  const imageHtml = post.image
    ? `<div class="post-hero reveal-fade" data-reveal="fade">
         <img src="${post.image}" alt="${post.title}" data-kenburns>
       </div>`
    : "";

  const bodyHtml = post.body.map((p) => `<p>${p}</p>`).join("\n");
  const caseNumber = `Nº ${String(index + 1).padStart(2, "0")} — ${formatYear(post.date)}`;

  container.innerHTML = `
    <article>
      <header class="post-header reveal-fade" data-reveal="fade">
        <span class="case-number">${caseNumber}</span>
        <h1 class="post-title">${post.title}</h1>
      </header>
      ${imageHtml}
      <div class="post-body reveal-fade" data-reveal="fade">${bodyHtml}</div>
    </article>
    <nav class="post-nav">
      ${
        prev
          ? `<a href="post.html?slug=${encodeURIComponent(prev.slug)}">
               <span class="label">&larr; Antes</span>${prev.title}
             </a>`
          : "<span></span>"
      }
      ${
        next
          ? `<a class="next" href="post.html?slug=${encodeURIComponent(next.slug)}">
               <span class="label">Depois &rarr;</span>${next.title}
             </a>`
          : "<span></span>"
      }
    </nav>`;

  document.dispatchEvent(new CustomEvent("content:ready", { detail: { type: "post" } }));
}

document.addEventListener("DOMContentLoaded", async () => {
  const posts = await loadPosts();
  const list = document.getElementById("post-list");
  if (list) {
    renderTimeline(posts);
    document.dispatchEvent(new CustomEvent("content:ready", { detail: { type: "timeline" } }));
  }
  renderPost(posts);
});
