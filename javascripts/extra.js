(() => {
  const pageBase = () => {
    try {
      const config = JSON.parse(document.getElementById("__config")?.textContent || "{}");
      return config.base && config.base !== "." ? `${config.base}/` : "";
    } catch {
      return "";
    }
  };

  const musicTracks = [
    { name: "练习脉冲", notes: [261.63, 329.63, 392, 523.25, 392, 329.63], wave: "triangle", interval: 780 },
    { name: "夜色回路", notes: [293.66, 349.23, 440, 587.33, 523.25, 440], wave: "sine", interval: 720 },
    { name: "高光节拍", notes: [220, 277.18, 329.63, 415.3, 369.99, 277.18], wave: "triangle", interval: 840 },
  ];

  const musicSettings = {
    volume: 0.055,
    tempo: 1,
    tone: 0,
  };

  let music = null;
  let musicTrackIndex = 0;
  let musicUi = null;

  const musicInterval = (track) => Math.max(220, track.interval / musicSettings.tempo);

  const setMusicUi = () => {
    if (!musicUi) return;
    const track = music?.track || musicTracks[(musicTrackIndex + musicTracks.length - 1) % musicTracks.length] || musicTracks[0];
    const active = Boolean(music);
    musicUi.audio.classList.toggle("is-active", active);
    musicUi.audio.setAttribute("aria-pressed", String(active));
    musicUi.audio.title = active ? `音乐：${track.name}` : "音乐";
    musicUi.audio.setAttribute("aria-label", active ? `音乐：${track.name}` : "音乐");
    musicUi.panel.classList.toggle("is-playing", active);
    musicUi.track.textContent = track.name;
    musicUi.playText.textContent = active ? "暂停" : "播放";
  };

  const syncMusicSettings = () => {
    if (!music) return;
    music.master.gain.cancelScheduledValues(music.context.currentTime);
    music.master.gain.setTargetAtTime(musicSettings.volume, music.context.currentTime, 0.06);
    window.clearInterval(music.timer);
    music.timer = window.setInterval(music.playNote, musicInterval(music.track));
  };

  const stopMusic = () => {
    if (!music) return;
    const current = music;
    music = null;
    window.clearInterval(current.timer);
    current.master.gain.cancelScheduledValues(current.context.currentTime);
    current.master.gain.setTargetAtTime(0, current.context.currentTime, 0.05);
    window.setTimeout(() => {
      current.context.close();
    }, 180);
    setMusicUi();
  };

  const startMusic = async () => {
    if (music) return music.track;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    const context = new AudioContext();
    const master = context.createGain();
    const delay = context.createDelay();
    const feedback = context.createGain();
    const track = musicTracks[musicTrackIndex % musicTracks.length];
    musicTrackIndex += 1;
    const notes = track.notes;
    let step = 0;

    master.gain.value = 0;
    delay.delayTime.value = 0.22;
    feedback.gain.value = 0.18;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    master.connect(context.destination);
    master.gain.setTargetAtTime(musicSettings.volume, context.currentTime, 0.08);

    const playNote = () => {
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = track.wave;
      osc.frequency.value = notes[step % notes.length] * Math.pow(2, musicSettings.tone / 1200);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
      osc.connect(gain);
      gain.connect(master);
      gain.connect(delay);
      osc.start(now);
      osc.stop(now + 0.68);
      step += 1;
    };

    if (context.state === "suspended") {
      await context.resume();
    }

    playNote();
    music = {
      context,
      master,
      track,
      playNote,
      timer: window.setInterval(playNote, musicInterval(track)),
    };

    setMusicUi();
    return track;
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
      <div class="neo-music-panel__head">
        <button class="neo-music-disc" type="button" data-music-play aria-label="播放或暂停音乐"></button>
        <div class="neo-music-title">
          <span>LOOP PLAYER</span>
          <strong data-music-track>${musicTracks[0].name}</strong>
        </div>
      </div>
      <div class="neo-music-controls">
        <label>音量<input data-music-volume type="range" min="0" max="0.12" step="0.005" value="${musicSettings.volume}"></label>
        <label>速度<input data-music-tempo type="range" min="0.72" max="1.38" step="0.02" value="${musicSettings.tempo}"></label>
        <label>音色<input data-music-tone type="range" min="-80" max="80" step="10" value="${musicSettings.tone}"></label>
      </div>
      <div class="neo-music-actions">
        <button type="button" data-music-play-text>播放</button>
        <button type="button" data-music-next>切换曲型</button>
      </div>
    `;

    const togglePlayback = async () => {
      if (music) {
        stopMusic();
      } else {
        await startMusic();
      }
      setMusicUi();
    };

    const setPanelOpen = (open) => {
      panel.classList.toggle("is-open", open);
      panel.style.opacity = open ? "1" : "";
      panel.style.transform = open ? "translateY(0)" : "";
    };

    musicUi = {
      audio,
      panel,
      track: panel.querySelector("[data-music-track]"),
      playText: panel.querySelector("[data-music-play-text]"),
    };

    audio.addEventListener("click", async (event) => {
      event.stopPropagation();
      setPanelOpen(!panel.classList.contains("is-open"));
      await togglePlayback();
    });

    panel.querySelector("[data-music-play]").addEventListener("click", togglePlayback);
    panel.querySelector("[data-music-play-text]").addEventListener("click", togglePlayback);
    panel.querySelector("[data-music-next]").addEventListener("click", async () => {
      const wasPlaying = Boolean(music);
      stopMusic();
      if (wasPlaying) await startMusic();
      setMusicUi();
    });
    panel.querySelector("[data-music-volume]").addEventListener("input", (event) => {
      musicSettings.volume = Number(event.target.value);
      syncMusicSettings();
    });
    panel.querySelector("[data-music-tempo]").addEventListener("input", (event) => {
      musicSettings.tempo = Number(event.target.value);
      syncMusicSettings();
    });
    panel.querySelector("[data-music-tone]").addEventListener("input", (event) => {
      musicSettings.tone = Number(event.target.value);
    });
    document.addEventListener("click", (event) => {
      if (!actions.contains(event.target)) setPanelOpen(false);
    });

    actions.append(audio, portfolio, panel);
    setMusicUi();

    const search = header.querySelector(".md-search");
    if (search) {
      const keepSearchInline = () => {
        const toggle = document.getElementById("__search");
        if (toggle) toggle.checked = false;
        search.removeAttribute("data-md-state");
      };
      search.addEventListener("focusin", () => window.requestAnimationFrame(keepSearchInline));
      search.addEventListener("input", () => window.requestAnimationFrame(keepSearchInline), true);
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
    try {
      const data = JSON.parse(source.textContent || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Drawing notes data parse failed", error);
      return [];
    }
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
      if (root.dataset.dataReady === "true") return;
      const items = readJsonData(root, ".course-data");
      const roster = root.querySelector(".course-roster");
      if (!items.length || !roster) return;

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
      root.dataset.dataReady = "true";
    });
  };

  const renderPortfolioData = () => {
    document.querySelectorAll(".portfolio-showcase").forEach((root) => {
      if (root.dataset.dataReady === "true") return;
      const items = readJsonData(root, ".portfolio-data");
      const roster = root.querySelector(".portfolio-roster");
      if (!items.length || !roster) return;

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
      root.dataset.dataReady = "true";
    });
  };

  const mountDataSections = () => {
    renderCourseData();
    renderPortfolioData();
  };

  const bindPreviewSwitcher = (root, linkSelector, targetSelector, update) => {
    if (!root || root.dataset.previewReady === "true") return;

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
      link.addEventListener("mouseenter", () => activate(link));
      link.addEventListener("focus", () => activate(link));
      link.addEventListener("click", (event) => {
        if (link.getAttribute("href")?.startsWith("#")) {
          event.preventDefault();
          activate(link);
        }
      });
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
      });
    });
  };

  const mountAll = () => {
    mountHeaderActions();
    mountDataSections();
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
