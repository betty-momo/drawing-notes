(() => {
  const pageBase = () => {
    try {
      const config = JSON.parse(document.getElementById("__config")?.textContent || "{}");
      return config.base && config.base !== "." ? `${config.base}/` : "";
    } catch {
      return "";
    }
  };

  let music = null;

  const stopMusic = () => {
    if (!music) return;
    window.clearInterval(music.timer);
    music.master.gain.cancelScheduledValues(music.context.currentTime);
    music.master.gain.setTargetAtTime(0, music.context.currentTime, 0.05);
    window.setTimeout(() => {
      music.context.close();
      music = null;
    }, 180);
  };

  const startMusic = async () => {
    if (music) return true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    const context = new AudioContext();
    const master = context.createGain();
    const delay = context.createDelay();
    const feedback = context.createGain();
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
    let step = 0;

    master.gain.value = 0;
    delay.delayTime.value = 0.22;
    feedback.gain.value = 0.18;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);
    master.connect(context.destination);
    master.gain.setTargetAtTime(0.055, context.currentTime, 0.08);

    const playNote = () => {
      const now = context.currentTime;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "triangle";
      osc.frequency.value = notes[step % notes.length];
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
      timer: window.setInterval(playNote, 780),
    };

    return true;
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
    audio.addEventListener("click", async () => {
      const willPlay = audio.getAttribute("aria-pressed") !== "true";
      if (willPlay) {
        const started = await startMusic();
        if (!started) return;
      } else {
        stopMusic();
      }
      audio.setAttribute("aria-pressed", String(willPlay));
      audio.classList.toggle("is-active", willPlay);
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
        setText(target, "h3", item.dataset.previewTitle);
        setText(target, ".portfolio-date", item.dataset.previewDate);
        setText(target, ".portfolio-desc", item.dataset.previewDesc);
        setText(target, ".portfolio-note", item.dataset.previewNote);
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
