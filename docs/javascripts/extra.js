(() => {
  const pageBase = () => {
    try {
      const config = JSON.parse(document.getElementById("__config")?.textContent || "{}");
      return config.base && config.base !== "." ? `${config.base}/` : "";
    } catch {
      return "";
    }
  };

  const playerTracks = [
    {
      title: "unfulfilled wish",
      artist: "本地音频",
      src: "audio/unfulfilled wish.ogg",
      cover: "",
      note: "已接入本地音频，暂时没有封面时会显示唱片占位。",
    },
    {
      title: "星空",
      artist: "本地音频",
      src: "audio/星空.ogg",
      cover: "",
      note: "已接入本地音频，后续可以继续补封面和曲目信息。",
    },
  ];

  let playerIndex = 0;
  let playerAudio = null;
  let playerUi = null;
  let playerError = "";

  const currentPlayerTrack = () => playerTracks[playerIndex] || playerTracks[0];

  const playerAssetPath = (src) => {
    if (!src || /^(?:[a-z]+:|\/|#)/i.test(src)) return src || "";
    return encodeURI(`${pageBase()}${src.replace(/^\.?\//, "")}`);
  };

  const hasPlayerSource = (track) => Boolean(track?.src);

  const formatPlayerTime = (value) => {
    if (!Number.isFinite(value) || value <= 0) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const updatePlayerUi = () => {
    if (!playerUi || !playerAudio) return;
    const track = currentPlayerTrack();
    const hasSource = hasPlayerSource(track);
    const playing = hasSource && !playerAudio.paused;
    const duration = Number.isFinite(playerAudio.duration) ? playerAudio.duration : 0;

    playerUi.audioButton.classList.toggle("is-active", playing);
    playerUi.audioButton.setAttribute("aria-pressed", String(playing));
    playerUi.audioButton.setAttribute("aria-expanded", String(playerUi.panel.classList.contains("is-open")));
    playerUi.panel.classList.toggle("is-playing", playing);
    playerUi.panel.classList.toggle("is-empty", !hasSource);
    playerUi.title.textContent = track?.title || "未命名曲目";
    playerUi.artist.textContent = track?.artist || "待上传音乐";
    playerUi.note.textContent = playerError
      ? `音频加载失败：${playerError}`
      : hasSource
        ? (track.note || "本地音频已就绪。")
        : (track.note || "还没有上传音频。");
    playerUi.play.textContent = playing ? "暂停" : hasSource ? "播放" : "待上传";
    playerUi.play.disabled = !hasSource || Boolean(playerError);
    playerUi.prev.disabled = playerTracks.length < 2;
    playerUi.next.disabled = playerTracks.length < 2;
    playerUi.progress.disabled = !hasSource;
    playerUi.progress.max = duration || 100;
    playerUi.progress.value = hasSource ? playerAudio.currentTime || 0 : 0;
    playerUi.current.textContent = formatPlayerTime(playerAudio.currentTime);
    playerUi.duration.textContent = formatPlayerTime(duration);
    playerUi.cover.classList.toggle("has-cover", Boolean(track?.cover));
    playerUi.cover.style.backgroundImage = track?.cover ? `url("${playerAssetPath(track.cover)}")` : "";
    playerUi.coverText.textContent = hasSource ? String(playerIndex + 1).padStart(2, "0") : "NO FILE";
  };

  const loadPlayerTrack = (index, autoplay = false) => {
    if (!playerAudio) return;
    playerIndex = (index + playerTracks.length) % playerTracks.length;
    const track = currentPlayerTrack();
    playerAudio.pause();
    playerError = "";

    if (hasPlayerSource(track)) {
      const src = playerAssetPath(track.src);
      if (!playerAudio.getAttribute("src")?.endsWith(src)) {
        playerAudio.src = src;
        try {
          playerAudio.load();
        } catch {
          updatePlayerUi();
        }
      }
      if (autoplay) {
        playerAudio.play().catch(() => updatePlayerUi());
      }
    } else {
      playerAudio.removeAttribute("src");
    }

    updatePlayerUi();
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

    const portfolio = document.createElement("a");
    portfolio.className = "neo-action neo-action--portfolio";
    portfolio.href = `${pageBase()}作品集.html`;
    portfolio.textContent = "作品集";

    const panel = document.createElement("div");
    panel.className = "neo-music-panel";
    panel.innerHTML = `
      <div class="neo-player-head">
        <button class="neo-player-cover" type="button" data-player-cover data-player-play aria-label="播放或暂停音乐">
          <span data-player-cover-text>NO FILE</span>
        </button>
        <div class="neo-player-title">
          <span>LOCAL PLAYER</span>
          <strong data-player-title>曲目 01</strong>
          <small data-player-artist>待上传音乐</small>
        </div>
      </div>
      <div class="neo-player-bar">
        <input data-player-progress type="range" min="0" max="100" step="0.1" value="0" disabled>
        <div class="neo-player-time"><span data-player-current>0:00</span><span data-player-duration>0:00</span></div>
      </div>
      <div class="neo-player-buttons">
        <button type="button" data-player-prev>上一首</button>
        <button type="button" data-player-play-text>待上传</button>
        <button type="button" data-player-next>下一首</button>
      </div>
      <label class="neo-player-volume">音量<input data-player-volume type="range" min="0" max="1" step="0.01" value="0.72"></label>
      <p class="neo-player-note" data-player-note></p>
    `;

    const togglePlayback = async () => {
      const track = currentPlayerTrack();
      if (!playerAudio || !hasPlayerSource(track)) {
        updatePlayerUi();
        return;
      }
      if (playerAudio.paused) {
        try {
          await playerAudio.play();
          playerError = "";
          setPanelOpen(true);
        } catch (err) {
          playerError = err?.message || "无法播放（可能是自动播放被拦截或格式不支持）";
          console.error("[player] play failed", err, playerAudio.src);
        }
      } else {
        playerAudio.pause();
      }
      updatePlayerUi();
    };

    const setPanelOpen = (open) => {
      panel.classList.toggle("is-open", open);
      panel.style.opacity = open ? "1" : "";
      panel.style.transform = open ? "translateY(0)" : "";
    };

    playerAudio = new Audio();
    playerAudio.preload = "metadata";
    playerAudio.volume = 0.72;

    playerUi = {
      audioButton: audio,
      panel,
      cover: panel.querySelector("[data-player-cover]"),
      coverText: panel.querySelector("[data-player-cover-text]"),
      title: panel.querySelector("[data-player-title]"),
      artist: panel.querySelector("[data-player-artist]"),
      note: panel.querySelector("[data-player-note]"),
      progress: panel.querySelector("[data-player-progress]"),
      current: panel.querySelector("[data-player-current]"),
      duration: panel.querySelector("[data-player-duration]"),
      play: panel.querySelector("[data-player-play-text]"),
      prev: panel.querySelector("[data-player-prev]"),
      next: panel.querySelector("[data-player-next]"),
      volume: panel.querySelector("[data-player-volume]"),
    };

    audio.addEventListener("click", (event) => {
      event.stopPropagation();
      setPanelOpen(!panel.classList.contains("is-open"));
      updatePlayerUi();
    });

    panel.querySelector("[data-player-play]").addEventListener("click", (e) => { e.stopPropagation(); togglePlayback(); });
    panel.querySelector("[data-player-play-text]").addEventListener("click", (e) => { e.stopPropagation(); togglePlayback(); });
    panel.querySelector("[data-player-prev]").addEventListener("click", (e) => {
      e.stopPropagation();
      loadPlayerTrack(playerIndex - 1, playerAudio && !playerAudio.paused);
    });
    panel.querySelector("[data-player-next]").addEventListener("click", (e) => {
      e.stopPropagation();
      loadPlayerTrack(playerIndex + 1, playerAudio && !playerAudio.paused);
    });
    panel.querySelector("[data-player-progress]").addEventListener("input", (e) => {
      e.stopPropagation();
      if (playerAudio && Number.isFinite(playerAudio.duration)) {
        playerAudio.currentTime = Number(e.target.value);
      }
    });
    panel.querySelector("[data-player-volume]").addEventListener("input", (e) => {
      e.stopPropagation();
      if (playerAudio) playerAudio.volume = Number(e.target.value);
    });
    playerAudio.addEventListener("loadedmetadata", () => {
      playerError = "";
      updatePlayerUi();
    });
    playerAudio.addEventListener("timeupdate", updatePlayerUi);
    playerAudio.addEventListener("play", updatePlayerUi);
    playerAudio.addEventListener("pause", updatePlayerUi);
    playerAudio.addEventListener("ended", () => loadPlayerTrack(playerIndex + 1, true));
    playerAudio.addEventListener("error", () => {
      const code = playerAudio.error?.code;
      const codeMap = {
        1: "加载被中止",
        2: "网络错误（检查文件路径）",
        3: "解码失败（浏览器不支持该格式）",
        4: "格式或路径不可用（多半是 404 或编码不被支持）",
      };
      playerError = codeMap[code] || "未知错误";
      console.error("[player] audio error", code, playerAudio.error, playerAudio.src);
      updatePlayerUi();
    });
    document.addEventListener("click", (event) => {
      if (!actions.contains(event.target) && playerAudio?.paused) setPanelOpen(false);
    });

    actions.append(audio, portfolio, panel);
    loadPlayerTrack(0);

    const search = header.querySelector(".md-search");
    if (search) {
      const toggle = document.getElementById("__search");
      const keepSearchInline = () => {
        if (toggle) toggle.checked = false;
        search.removeAttribute("data-md-state");
      };
      if (toggle && !toggle.dataset.searchLocked) {
        toggle.dataset.searchLocked = "true";
        toggle.addEventListener("change", () => {
          if (toggle.checked) keepSearchInline();
        });
        toggle.addEventListener("click", keepSearchInline, true);
      }
      search.addEventListener("focusin", keepSearchInline);
      search.addEventListener("input", keepSearchInline, true);
      keepSearchInline();
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

  const readJsonData = (root, selector) => {
    const source = root.querySelector(selector);
    if (!source) return [];
    const raw = (source.tagName === "TEMPLATE"
      ? (source.content?.textContent ?? source.innerHTML ?? "")
      : (source.textContent ?? "")).trim();
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Drawing notes data parse failed", error);
      return [];
    }
  };

  const dataCache = new Map();
  const getCachedJsonData = (root, selector, cacheKey) => {
    const fresh = readJsonData(root, selector);
    if (fresh.length) {
      dataCache.set(cacheKey, fresh);
      return fresh;
    }
    return dataCache.get(cacheKey) || [];
  };

  const applyCourseDataset = (link, item) => {
    link.dataset.previewKicker = item.kicker || "COURSE / SLOT";
    link.dataset.previewTitle = item.title || "未命名课程";
    link.dataset.previewDirection = item.direction || "待补充";
    link.dataset.previewDesc = item.desc || "";
    link.dataset.previewNote = item.note || "";
    link.dataset.previewImg = item.img || "";
  };

  const applyPortfolioDataset = (link, item) => {
    link.dataset.targetHref = item.targetHref || item.img || "#";
    link.dataset.previewKicker = item.kicker || "PORTFOLIO";
    link.dataset.previewRank = item.rank || "RANK";
    link.dataset.previewRole = item.role || "作品档案";
    link.dataset.previewTitle = item.title || "未命名作品";
    link.dataset.previewDate = item.date || "待补充";
    link.dataset.previewDesc = item.desc || "";
    link.dataset.previewNote = item.note || "";
    link.dataset.previewImg = item.img || "";
    link.dataset.previewAccent = item.accent || "#47e8ff";
  };

  const makeImage = (src, alt = "") => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    return image;
  };

  const renderCourseData = () => {
    document.querySelectorAll(".course-showcase").forEach((root) => {
      const items = getCachedJsonData(root, ".course-data", "course");
      const roster = root.querySelector(".course-roster");
      if (!items.length || !roster) return;
      if (roster.children.length === items.length && roster.dataset.dataSig === String(items.length)) return;

      roster.replaceChildren(...items.map((item, index) => {
        const link = document.createElement("a");
        link.href = item.href || "#";
        link.classList.toggle("is-active", index === 0);
        applyCourseDataset(link, item);
        link.append(makeImage(item.img || "", item.title || ""));

        const label = document.createElement("span");
        const title = document.createElement("strong");
        const direction = document.createElement("small");
        title.textContent = item.title || "未命名课程";
        direction.textContent = item.direction || "待补充";
        label.append(title, direction);
        link.append(label);
        return link;
      }));
      roster.dataset.dataSig = String(items.length);
    });
  };

  const renderPortfolioData = () => {
    document.querySelectorAll(".portfolio-showcase").forEach((root) => {
      const items = getCachedJsonData(root, ".portfolio-data", "portfolio");
      const roster = root.querySelector(".portfolio-roster");
      if (!items.length || !roster) return;
      if (roster.children.length === items.length && roster.dataset.dataSig === String(items.length)) return;

      roster.replaceChildren(...items.map((item, index) => {
        const link = document.createElement("a");
        link.href = `#${item.id || `portfolio-${String(index + 1).padStart(2, "0")}`}`;
        link.classList.toggle("is-active", index === 0);
        link.style.setProperty("--portfolio-accent", item.accent || "#47e8ff");
        applyPortfolioDataset(link, item);
        link.append(makeImage(item.img || "", item.title || ""));

        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        link.append(number);
        return link;
      }));
      roster.dataset.dataSig = String(items.length);
    });
  };

  const mountDataSections = () => {
    renderCourseData();
    renderPortfolioData();
  };

  const bindPreviewSwitcher = (root, linkSelector, targetSelector, update, options = {}) => {
    if (!root || root.dataset.previewReady === "true") return;

    const activateOnHover = options.activateOnHover !== false;
    const activateOnFocus = options.activateOnFocus !== false;
    const links = Array.from(root.querySelectorAll(linkSelector));
    const target = root.querySelector(targetSelector);
    if (!links.length || !target) return;

    const activate = (item) => {
      links.forEach((link) => link.classList.toggle("is-active", link === item));
      target.setAttribute("href", item.dataset.targetHref || item.getAttribute("href") || "#");
      update(root, target, item);
    };

    const activateFromEvent = (event) => {
      const item = event.target?.closest?.(linkSelector);
      if (item && root.contains(item)) activate(item);
    };

    links.forEach((link) => {
      if (activateOnHover) link.addEventListener("mouseenter", () => activate(link));
      if (activateOnFocus) link.addEventListener("focus", () => activate(link));
      link.addEventListener("click", (event) => {
        if (link.getAttribute("href")?.startsWith("#")) {
          event.preventDefault();
          activate(link);
        }
      });
    });

    if (activateOnHover) {
      root.addEventListener("pointerover", activateFromEvent);
      root.addEventListener("mouseover", activateFromEvent);
    }
    if (activateOnFocus) root.addEventListener("focusin", activateFromEvent);

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

    document.querySelectorAll(".course-showcase").forEach((root) => {
      bindPreviewSwitcher(root, ".course-roster a", ".course-feature", (_stage, target, item) => {
        setImage(target.querySelector(".course-feature__art img"), item);
        setText(target, ".hub-kicker", item.dataset.previewKicker);
        setText(target, "h3", item.dataset.previewTitle);
        setText(target, ".course-feature__desc", item.dataset.previewDesc);
        setText(target, ".course-feature__direction", item.dataset.previewDirection);
        setText(target, ".course-feature__note", item.dataset.previewNote);
      });
    });

    document.querySelectorAll(".portfolio-showcase").forEach((root) => {
      bindPreviewSwitcher(root, ".portfolio-roster a", ".portfolio-card", (_stage, target, item) => {
        setImage(target.querySelector(".portfolio-art img"), item);
        setText(target, ".hub-kicker", item.dataset.previewKicker);
        setText(target, ".portfolio-rank__tier", item.dataset.previewRank);
        setText(target, ".portfolio-rank__name", item.dataset.previewRole);
        setText(target, "h3", item.dataset.previewTitle);
        setText(target, ".portfolio-date", item.dataset.previewDate);
        setText(target, ".portfolio-desc", item.dataset.previewDesc);
        setText(target, ".portfolio-note", item.dataset.previewNote);
        setText(target, ".portfolio-role", item.dataset.previewRole);
        if (item.dataset.previewAccent) {
          target.style.setProperty("--portfolio-accent", item.dataset.previewAccent);
        }
      }, { activateOnHover: false, activateOnFocus: false });
    });
  };

  const runMount = (name, mount) => {
    try {
      mount();
    } catch (error) {
      console.warn(`Drawing notes ${name} mount failed`, error);
    }
  };

  const mountAll = () => {
    runMount("header actions", mountHeaderActions);
    runMount("data sections", mountDataSections);
    runMount("preview switchers", mountPreviewSwitchers);
  };

  window.setTimeout(mountAll, 0);
  if (window.document$) window.document$.subscribe(mountAll);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll, { once: true });
  }
})();
