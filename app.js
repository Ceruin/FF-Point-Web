/* ============================================================
   PLACEHOLDER — Neon RPG Venue  (vanilla JS, no dependencies)

   Modules in this file:
     A. VENUE config        — edit this to rebrand the whole site
     B. Tiny helpers
     C. Audio (generated SFX, no autoplay)
     D. Particles (ambient dust/magic)
     E. Intro sequence
     F. Event countdown clock (Now Open / Opens In)
     G. Dialogue modal (RPG box w/ typewriter)
     H. Quest system
     I. Object handlers (Staff / Menu / Events / Discord / Secret)
     J. Controls (sound / share) + flicker + wanderer + boot
   ============================================================ */

/* ---------- A. VENUE CONFIG (single source of truth) ---------- */
const VENUE = {
    name: "Placeholder",
    location: "Crystal | Behemoth | Limsa | W1 | P1",
    discordUrl: "https://discord.com",        // replace with your invite link
    event: {
        title: "Neon Masquerade",
        timeLabel: "Saturday–Sunday | 11:00 PM – 3:00 AM",
        days: [6, 0],          // 0 = Sunday ... 6 = Saturday
        startHour: 23, startMinute: 0,
        endHour: 3,   endMinute: 0
    },
    // Staff shown as RPG character cards. Swap `avatar` paths for your sprites.
    staff: [
        { name: "Bun",    role: "Host",    quote: "Right this way, adventurer.", avatar: "images/hds-bunny.png" },
        { name: "Azim",   role: "Barkeep", quote: "Name your poison.",           avatar: "images/hds-azim.png" },
        { name: "Kernel", role: "Floor",   quote: "Keep it classy, kupo.",       avatar: "images/hds-corn.png" },
        { name: "Coco",   role: "Kitchen", quote: "Hot plates coming through!",  avatar: "images/hds-chkn.png" }
    ],
    // Menu styled like an RPG item shop. Swap `icon` paths for your art.
    menu: {
        Drinks: [
            { name: "Aether Spritz",     price: "45g", flavor: "Fizzes with raw aether; tingles the tongue.", icon: "images/item-carmal.png" },
            { name: "Moogle Mead",       price: "30g", flavor: "Honeyed brew, kupo-approved.",                icon: "images/item-corn.png" },
            { name: "Starlight Martini", price: "60g", flavor: "Shaken beneath a crystal moon.",              icon: "images/item-flint.png" }
        ],
        Food: [
            { name: "Behemoth Skewers", price: "55g", flavor: "Smoky, fire-grilled, faintly dangerous.", icon: "images/item-cornmeal.png" },
            { name: "Gilded Cornbread", price: "40g", flavor: "Warm honey slice with a golden crust.",   icon: "images/item-cornbread.png" },
            { name: "Dancer's Tart",    price: "35g", flavor: "Sweet enough to start a duet.",            icon: "images/item-carmal.png" }
        ],
        Specials: [
            { name: "Limsa Sunrise",  price: "75g", flavor: "House special — tastes like sea breeze.", icon: "images/item-flint.png" },
            { name: "Crystal Fizz",   price: "25g", flavor: "Sparkling, glowing, zero proof.",          icon: "images/item-corn.png" }
        ]
    },
    quests: [
        { id: "staff",   label: "Meet the Staff" },
        { id: "menu",    label: "View the Menu" },
        { id: "events",  label: "Check Tonight's Event" },
        { id: "discord", label: "Join the Fellowship" }
    ]
};

/* ---------- B. Tiny helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

/* ---------- C. Audio — generated SFX, never autoplays ---------- */
const Sfx = (() => {
    let ctx = null, enabled = false;
    const ensure = () => {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
    };
    const setEnabled = (v) => { enabled = v; if (v) ensure(); };
    /* Play a short tone. Hook your own audio files in here later if you prefer. */
    const tone = (freq = 440, dur = 0.12, type = "sine", gain = 0.05) => {
        if (!enabled || !ctx) return;
        const osc = ctx.createOscillator(), amp = ctx.createGain();
        osc.type = type; osc.frequency.value = freq; amp.gain.value = gain;
        osc.connect(amp); amp.connect(ctx.destination);
        const t = ctx.currentTime;
        amp.gain.setValueAtTime(gain, t);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.start(t); osc.stop(t + dur);
    };
    return {
        setEnabled, isEnabled: () => enabled, ensure,
        click:   () => tone(620, 0.07, "triangle"),
        open:    () => { tone(440, 0.1, "sine"); setTimeout(() => tone(660, 0.12, "sine"), 60); },
        success: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.16, "triangle", 0.06), i * 90)),
        secret:  () => [880, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.14, "sine", 0.05), i * 80))
    };
})();

/* ---------- D. Particles — drifting dust / magic motes ---------- */
const Particles = (() => {
    const canvas = $("#particles");
    const ctx = canvas.getContext("2d");
    let parts = [], w = 0, h = 0, raf = null;
    const COLORS = ["#ff2a85", "#39ff14", "#28e0ff", "#ffd166"];

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const count = Math.min(70, Math.floor(w * h / 24000));
        parts = Array.from({ length: count }, spawn);
    };
    function spawn() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 2 + 0.6,
            vy: -(Math.random() * 0.4 + 0.15),
            vx: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.5 + 0.2,
            tw: Math.random() * Math.PI * 2,
            color: COLORS[(Math.random() * COLORS.length) | 0]
        };
    }
    const frame = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
            p.x += p.vx; p.y += p.vy; p.tw += 0.05;
            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
            if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
            const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8; ctx.shadowColor = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) frame(); };
    window.addEventListener("resize", resize);
    resize();
    return { start };
})();

/* ---------- E. Intro sequence ---------- */
const Intro = (() => {
    const root = $("#intro");
    const lines = $$(".intro__line", root);
    const enterBtn = $("#enter-btn");

    function typeLine(el, text) {
        return new Promise((resolve) => {
            el.classList.add("show");
            let i = 0;
            const tick = () => {
                el.textContent = text.slice(0, ++i);
                if (i < text.length) setTimeout(tick, 28);
                else setTimeout(resolve, 380);
            };
            tick();
        });
    }
    async function run(onEnter) {
        for (const el of lines) await typeLine(el, el.dataset.text);
        enterBtn.hidden = false;
        requestAnimationFrame(() => enterBtn.classList.add("show"));
        enterBtn.addEventListener("click", () => {
            Sfx.open();                       // user gesture: safe to start audio ctx
            root.classList.add("hide");
            setTimeout(() => { root.style.display = "none"; }, 800);
            onEnter();
        }, { once: true });
    }
    return { run };
})();

/* ---------- F. Event countdown clock ---------- */
const EventClock = (() => {
    const card = $("#event-card");
    const stateEl = $("#event-state");
    const clockEl = $("#event-clock");
    const cfg = VENUE.event;

    // Build the open/close window for a given day offset from "now".
    function windowFor(now, dayOffset) {
        const day = new Date(now); day.setDate(now.getDate() + dayOffset);
        const start = new Date(day); start.setHours(cfg.startHour, cfg.startMinute, 0, 0);
        const end = new Date(day);   end.setHours(cfg.endHour, cfg.endMinute, 0, 0);
        if (end <= start) end.setDate(end.getDate() + 1);   // crosses midnight
        return { start, end };
    }
    function compute(now) {
        // Is the venue currently open?
        for (let off = -1; off <= 1; off++) {
            const day = (now.getDay() + off + 7) % 7;
            if (!cfg.days.includes(day)) continue;
            const win = windowFor(now, off);
            if (now >= win.start && now <= win.end) return { open: true, target: win.end };
        }
        // Otherwise find the next opening.
        for (let off = 0; off <= 7; off++) {
            const day = (now.getDay() + off) % 7;
            if (!cfg.days.includes(day)) continue;
            const win = windowFor(now, off);
            if (win.start > now) return { open: false, target: win.start };
        }
        return { open: false, target: now };
    }
    function tick() {
        const now = new Date();
        const { open, target } = compute(now);
        const secs = Math.max(0, Math.floor((target - now) / 1000));
        const hh = String((secs / 3600) | 0).padStart(2, "0");
        const mm = String(((secs % 3600) / 60) | 0).padStart(2, "0");
        const ss = String(secs % 60).padStart(2, "0");
        clockEl.textContent = `${hh}:${mm}:${ss}`;
        stateEl.textContent = open ? "Now Open" : "Opens In";
        card.classList.toggle("is-open", open);
    }
    function start() { tick(); setInterval(tick, 1000); }
    function statusLine() {           // human-readable status for the board dialogue
        const { open } = compute(new Date());
        return open ? "The doors are <b>open now</b> — come on in!" :
                      "The doors are closed; check the countdown on the panel.";
    }
    return { start, statusLine };
})();

/* ---------- G. Dialogue modal (RPG box + typewriter) ---------- */
const Dialogue = (() => {
    const overlay = $("#dialogue-overlay");
    const nameEl = $("#dialogue-name");
    const avatarEl = $("#dialogue-avatar");
    const bodyEl = $("#dialogue-body");
    const actionsEl = $("#dialogue-actions");
    let typingTimer = null;

    function close() {
        overlay.classList.remove("show");
        setTimeout(() => { overlay.hidden = true; }, 250);
        clearTimeout(typingTimer);
    }
    function buildAvatar(av) {
        if (!av) { avatarEl.innerHTML = ""; return; }
        if (av.img) avatarEl.innerHTML = `<img src="${esc(av.img)}" alt="">`;
        else if (av.crystal) avatarEl.innerHTML = `<span class="crystal-gem"></span>`;
        else if (av.icon) avatarEl.innerHTML = `<i class="${esc(av.icon)}"></i>`;
    }
    function typewrite(text) {
        const p = document.createElement("p");
        p.className = "dialogue__text";
        bodyEl.innerHTML = "";
        bodyEl.appendChild(p);
        let i = 0;
        const full = text;
        const tick = () => {
            p.innerHTML = esc(full.slice(0, ++i)) + '<span class="caret">▌</span>';
            if (i < full.length) typingTimer = setTimeout(tick, 22);
            else p.innerHTML = full;          // allow simple <b> in final text
        };
        // Click to skip to full text.
        bodyEl.onclick = () => { clearTimeout(typingTimer); p.innerHTML = full; };
        tick();
    }

    /* open({ name, avatar:{img|icon|crystal}, text?, html?, actions:[{label,kind,onClick,close}] }) */
    function open(cfg) {
        clearTimeout(typingTimer);
        bodyEl.onclick = null;
        nameEl.textContent = cfg.name || "";
        buildAvatar(cfg.avatar);

        if (cfg.html != null) bodyEl.innerHTML = cfg.html;
        else if (cfg.text != null) typewrite(cfg.text);
        else bodyEl.innerHTML = "";

        actionsEl.innerHTML = "";
        (cfg.actions || []).forEach(a => {
            const b = document.createElement("button");
            b.className = "btn" + (a.kind === "green" ? " btn--green" : "");
            b.innerHTML = a.label;
            b.addEventListener("click", () => {
                Sfx.click();
                if (a.onClick) a.onClick();
                if (a.close !== false) close();
            });
            actionsEl.appendChild(b);
        });

        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("show"));
        Sfx.open();
    }

    $("#dialogue-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !overlay.hidden) close(); });

    return { open, close };
})();

/* ---------- H. Quest system ---------- */
const Quests = (() => {
    const listEl = $("#quest-list");
    const completeEl = $("#quest-complete");
    const state = Object.fromEntries(VENUE.quests.map(q => [q.id, false]));

    function render() {
        listEl.innerHTML = VENUE.quests.map(q => `
            <li class="quest-item ${state[q.id] ? "done" : ""}" data-quest="${q.id}">
                <span class="quest-item__box"><i class="fa-solid fa-check"></i></span>
                <span class="quest-item__label">${esc(q.label)}</span>
            </li>`).join("");
    }
    function complete(id) {
        if (state[id] === undefined || state[id]) return;   // unknown or already done
        state[id] = true;
        render();
        $(`.npc[data-quest="${id}"]`)?.classList.add("done");
        const label = VENUE.quests.find(q => q.id === id)?.label;
        Achievement.show(`Quest: ${label}`);
        Sfx.success();
        if (VENUE.quests.every(q => state[q.id])) {
            completeEl.hidden = false;
            $("#hud").animate(
                [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }, { filter: "brightness(1)" }],
                { duration: 900 }
            );
            setTimeout(() => Achievement.show("Ready for Opening Night!"), 700);
        }
    }
    render();
    return { complete };
})();

/* ---------- I. Object handlers ---------- */
const Handlers = {
    staff() {
        const cards = VENUE.staff.map(s => `
            <div class="staff-card">
                <div class="staff-card__avatar"><img src="${esc(s.avatar)}" alt=""></div>
                <div>
                    <div class="staff-card__name">${esc(s.name)}</div>
                    <div class="staff-card__role">${esc(s.role)}</div>
                    <div class="staff-card__quote">“${esc(s.quote)}”</div>
                </div>
            </div>`).join("");
        Dialogue.open({
            name: "The Crew",
            avatar: { img: VENUE.staff[0].avatar },
            html: `<div class="staff-grid">${cards}</div>`
        });
    },
    menu() {
        const sections = Object.entries(VENUE.menu).map(([title, items]) => `
            <div class="shop-section">
                <div class="shop-section__title"><i class="fa-solid fa-wine-glass"></i> ${esc(title)}</div>
                ${items.map(it => `
                    <div class="shop-item">
                        <div class="shop-item__icon"><img src="${esc(it.icon)}" alt=""></div>
                        <div>
                            <div class="shop-item__name">${esc(it.name)}</div>
                            <div class="shop-item__flavor">${esc(it.flavor)}</div>
                        </div>
                        <div class="shop-item__price">${esc(it.price)}</div>
                    </div>`).join("")}
            </div>`).join("");
        Dialogue.open({
            name: "The Bar",
            avatar: { icon: "fa-solid fa-martini-glass-citrus" },
            html: sections
        });
    },
    events() {
        Dialogue.open({
            name: "Notice Board",
            avatar: { icon: "fa-solid fa-scroll" },
            text: `Tonight's Event — ${VENUE.event.title}. Doors ${VENUE.event.timeLabel}. ` +
                  EventClock.statusLine().replace(/<\/?b>/g, "")
        });
    },
    discord() {
        Dialogue.open({
            name: "Aether Crystal",
            avatar: { crystal: true },
            text: "The crystal hums with the voices of the Fellowship. Join us?",
            actions: [
                { label: '<i class="fa-brands fa-discord"></i> Join Discord', kind: "green",
                  onClick: () => window.open(VENUE.discordUrl, "_blank", "noopener") },
                { label: '<i class="fa-solid fa-copy"></i> Copy Venue Info',
                  onClick: copyInvite, close: false }
            ]
        });
    },
    secret() {
        Dialogue.open({
            name: "???",
            avatar: { img: "images/curs-moogle.png" },
            text: "You found the venue mascot. It bounces happily, kupo!"
        });
        Achievement.show("Secret: Mascot Found");
        Sfx.secret();
    }
};

/* ---------- Achievement + toast popups ---------- */
const Achievement = (() => {
    const el = $("#achievement");
    const txt = $("#achievement-text");
    let hideTimer;
    function show(text) {
        txt.textContent = text;
        el.hidden = false;
        requestAnimationFrame(() => el.classList.add("show"));
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => { el.hidden = true; }, 450);
        }, 2600);
    }
    return { show };
})();

function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => { el.hidden = true; }, 250);
    }, 2200);
}

/* ---------- Share helper ---------- */
function inviteText() {
    return `Visit ${VENUE.name} on ${VENUE.location}. Open Saturday–Sunday 11 PM–3 AM.`;
}
async function copyInvite() {
    const text = inviteText();
    try {
        await navigator.clipboard.writeText(text);
        toast("Venue invite copied!");
    } catch {
        // Fallback for non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
        toast("Venue invite copied!");
    }
}

/* ---------- J. Controls, flicker, wanderer & boot ---------- */
(function boot() {
    /* NPC clicks -> open dialogue + complete the matching quest */
    $$(".npc").forEach(npc => {
        npc.addEventListener("click", () => {
            const obj = npc.dataset.object;
            Sfx.click();
            Handlers[obj]?.();
            Quests.complete(npc.dataset.quest);
        });
    });

    /* Secret mascot */
    $("#mascot").addEventListener("click", (e) => {
        e.currentTarget.classList.add("found");
        Handlers.secret();
    });

    /* Sound toggle (off by default; no autoplay) */
    const soundBtn = $("#sound-toggle");
    soundBtn.addEventListener("click", () => {
        const on = !Sfx.isEnabled();
        Sfx.setEnabled(on);
        soundBtn.classList.toggle("is-on", on);
        soundBtn.querySelector("i").className = on ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
        if (on) Sfx.click();
        toast(on ? "Sound on" : "Sound off");
    });

    /* Share button */
    $("#share-btn").addEventListener("click", () => { Sfx.click(); copyInvite(); });

    /* Quest tracker collapse (handy on mobile) */
    const tracker = $("#quest-tracker");
    $("#quest-toggle").addEventListener("click", () => {
        const collapsed = tracker.classList.toggle("collapsed");
        $("#quest-toggle").setAttribute("aria-expanded", String(!collapsed));
    });

    /* Subtle neon flicker on the HUD + page dim */
    function flicker() {
        const blinks = (Math.random() * 3 | 0) + 1;
        let n = 0;
        const blink = () => {
            $("#hud").classList.add("flicker-off");
            $("#flicker-dim").classList.add("active");
            setTimeout(() => {
                $("#hud").classList.remove("flicker-off");
                $("#flicker-dim").classList.remove("active");
                if (++n < blinks) setTimeout(blink, Math.random() * 90 + 40);
                else setTimeout(flicker, Math.random() * 9000 + 6000);
            }, Math.random() * 120 + 40);
        };
        blink();
    }

    /* Wandering minion flies across now and then (WAAPI) */
    const wanderer = $("#wanderer");
    function fly() {
        const vw = window.innerWidth;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const startX = dir === 1 ? -120 : vw + 120;
        const endX = dir === 1 ? vw + 120 : -120;
        wanderer.style.top = (60 + Math.random() * (window.innerHeight * 0.5)) + "px";
        wanderer.querySelector("img").style.transform = dir === 1 ? "scaleX(1)" : "scaleX(-1)";
        const anim = wanderer.animate([
            { transform: `translateX(${startX}px) translateY(0)` },
            { transform: `translateX(${(startX + endX) / 2}px) translateY(-26px)` },
            { transform: `translateX(${endX}px) translateY(0)` }
        ], { duration: 9000 + Math.random() * 4000, easing: "ease-in-out" });
        anim.onfinish = scheduleFly;
    }
    function scheduleFly() { setTimeout(fly, 12000 + Math.random() * 12000); }

    /* Run the intro, then reveal the scene + start ambient systems */
    Particles.start();
    Intro.run(() => {
        const scene = $("#scene");
        scene.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => scene.classList.add("ready"));
        EventClock.start();
        flicker();
        scheduleFly();
        setTimeout(() => Achievement.show("Tip: 4 quests await"), 1200);
    });
})();
