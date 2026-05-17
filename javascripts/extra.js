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

  const setText = (root, selector, value) => {
    const node = root?.querySelector(selector);
    if (node && value) node.textContent = value;
  };

  const setImage = (image, item) => {
    const src = item.dataset.previewImg;
    if (!image || !src || image.getAttribute("src") === src) return;
    image.style.opacity = "0";
    window.setTimeout(() => {
      image.setAttribute("src", src);
      image.setAttribute("alt", item.dataset.previewTitle || "");
      image.style.opacity = "";
    }, 80);
  };

  const bindPreviewSwitcher = (root, linkSelector, targetSelector, update) => {
    if (!root || root.dataset.previewReady === "true") return;

    const links = Array.from(root.querySelectorAll(linkSelector));
    const target = root.querySelector(targetSelector);
    if (!links.length || !target) return;

    const activate = (item) => {
      links.forEach((link) => link.classList.toggle("is-active", link === item));
      target.setAttribute("href", item.getAttribute("href") || "#");
      update(root, target, item);
    };

    const activateFromEvent = (event) => {
      const item = event.target?.closest?.(linkSelector);
      if (item && root.contains(item)) activate(item);
    };

    links.forEach((link) => {
      link.addEventListener("mouseenter", () => activate(link));
      link.addEventListener("focus", () => activate(link));
    });

    root.addEventListener("pointerover", activateFromEvent);
    root.addEventListener("mouseover", activateFromEvent);
    root.addEventListener("focusin", activateFromEvent);

    root.dataset.previewReady = "true";
  };

  const mountPreviewSwitchers = () => {
    document.querySelectorAll(".hub-map").forEach((root) => {
      bindPreviewSwitcher(root, ".hub-map__nav a", ".hub-map__visual", (stage, target, item) => {
        setImage(target.querySelector("img"), item);
        setText(target, ".hub-map__tag", item.dataset.previewKicker);
        setText(target, "strong", item.dataset.previewTitle);
        setText(target, "small", item.dataset.previewDesc);
        setText(stage, ".hub-map__brief h3", item.dataset.briefTitle);
        setText(stage, ".hub-map__brief p:last-child", item.dataset.briefDesc);
      });
    });

    document.querySelectorAll(".topic-showcase").forEach((root) => {
      bindPreviewSwitcher(root, ".topic-rail a", ".topic-feature", (_stage, target, item) => {
        setImage(target.querySelector("img"), item);
        setText(target, ".hub-kicker", item.dataset.previewKicker);
        setText(target, "h3", item.dataset.previewTitle);
        setText(target, ".topic-feature__copy p:not(.hub-kicker)", item.dataset.previewDesc);
      });
    });

    document.querySelectorAll(".process-showcase").forEach((root) => {
      bindPreviewSwitcher(root, ".process-switch a", ".process-focus", (_stage, target, item) => {
        setImage(target.querySelector("img"), item);
        setText(target, ".hub-kicker", item.dataset.previewKicker);
        setText(target, "h3", item.dataset.previewTitle);
        setText(target, ".process-focus__copy p:not(.hub-kicker)", item.dataset.previewDesc);
      });
    });
  };

  const mountAll = () => {
    mountHeaderActions();
    mountPreviewSwitchers();
  };

  if (window.document$) {
    window.document$.subscribe(mountAll);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll, { once: true });
  } else {
    mountAll();
  }
})();
