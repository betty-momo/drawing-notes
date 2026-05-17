(() => {
  const pageBase = () => {
    try {
      const config = JSON.parse(document.getElementById("__config")?.textContent || "{}");
      return config.base && config.base !== "." ? `${config.base}/` : "";
    } catch {
      return "";
    }
  };

  const mountHeaderActions = () => {
    const header = document.querySelector(".md-header__inner");
    if (!header || header.querySelector(".neo-actions")) return;

    const actions = document.createElement("div");
    actions.className = "neo-actions";

    const audio = document.createElement("button");
    audio.type = "button";
    audio.className = "neo-action neo-action--audio";
    audio.setAttribute("aria-label", "音乐");
    audio.setAttribute("aria-pressed", "false");
    audio.addEventListener("click", () => {
      const active = audio.getAttribute("aria-pressed") !== "true";
      audio.setAttribute("aria-pressed", String(active));
      audio.classList.toggle("is-active", active);
    });

    const portfolio = document.createElement("a");
    portfolio.className = "neo-action neo-action--portfolio";
    portfolio.href = `${pageBase()}作品集.html`;
    portfolio.textContent = "作品集";

    actions.append(audio, portfolio);

    const search = header.querySelector(".md-search");
    if (search) {
      search.insertAdjacentElement("afterend", actions);
    } else {
      header.append(actions);
    }
  };

  if (window.document$) {
    window.document$.subscribe(mountHeaderActions);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountHeaderActions, { once: true });
  } else {
    mountHeaderActions();
  }
})();
