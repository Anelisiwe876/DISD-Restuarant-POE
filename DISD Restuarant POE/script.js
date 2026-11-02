/* =====================================================================
   Blackwood & Bean - Part 3 JavaScript (WEDE5020 POE)
   One file, loaded on every page. Each feature only runs when the
   elements it needs exist on the current page.

   Features
   1. Scroll-reveal animations
   2. "Customer Favourites" tabs - dynamic content rendered from data (index)
   3. Menu search, category filter and sort (menu)
   4. Gallery / image lightbox (index, menu, about, enquiry, contact)
   5. FAQ accordion (enquiry)
   6. Form validation, error messages and AJAX submission (enquiry)
   7. Contact form: validation + compiled email (contact)
   8. Interactive Leaflet map (contact)
   ===================================================================== */
(function () {
    "use strict";

    /* ------------------------------------------------------------------
       Settings
       ------------------------------------------------------------------ */
    // The email recipient for the contact form (change here if it ever moves)
    const CONTACT_RECIPIENT = "hello@blackwoodandbean.co.za";
    // Venue coordinates for the map (central Johannesburg - illustrative)
    const VENUE = { lat: -26.2041, lng: 28.0473 };
    const TOTAL_SEATS = 80;

    /* ------------------------------------------------------------------
       Small helpers (DOM building uses textContent, never innerHTML,
       so user input can never be injected as markup)
       ------------------------------------------------------------------ */
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const prefersReducedMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function el(tag, props = {}, ...children) {
        const node = document.createElement(tag);
        Object.entries(props).forEach(([key, value]) => {
            if (value === false || value === null || value === undefined) return;
            if (key === "class") node.className = value;
            else if (key === "text") node.textContent = value;
            else if (key.startsWith("on") && typeof value === "function") {
                node.addEventListener(key.slice(2), value);
            } else node.setAttribute(key, value === true ? "" : value);
        });
        children.flat().filter(Boolean).forEach((child) => node.append(child));
        return node;
    }

    const rand = (amount) => "R" + Math.round(amount).toLocaleString("en-ZA");
    const pad = (n) => String(n).padStart(2, "0");

    function makeReference(prefix) {
        const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const random = Math.random().toString(36).slice(2, 6).toUpperCase();
        return `BB-${prefix}-${stamp}-${random}`;
    }

    /* Date helpers - dates from <input type="date"> are "YYYY-MM-DD" */
    function parseDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const [y, m, d] = value.split("-").map(Number);
        const date = new Date(y, m - 1, d);
        const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
        return valid ? date : null;
    }

    function startOfToday() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const daysFromToday = (date) => Math.round((date - startOfToday()) / 86400000);

    function toIsoDate(date) {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function longDate(date) {
        return date.toLocaleDateString("en-ZA", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    }

    /* Opening hours match the Contact page: [open hour, close hour] */
    function openingHours(dateString) {
        const date = parseDate(dateString);
        const day = date ? date.getDay() : 1;
        if (day === 0) return [9, 18];   // Sunday
        if (day === 6) return [8, 20];   // Saturday
        return [7, 21];                  // Monday - Friday
    }

    /* ------------------------------------------------------------------
       1. Scroll-reveal animations (CSS transition + IntersectionObserver)
       ------------------------------------------------------------------ */
    function initReveal() {
        if (!("IntersectionObserver" in window) || prefersReducedMotion) return;

        const targets = $$("main section, #menu-intro").filter((node) => node.id !== "hero");
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.06 });

        targets.forEach((node) => {
            node.classList.add("reveal");
            observer.observe(node);
        });
    }

    /* ------------------------------------------------------------------
       2. Customer Favourites - dynamic content with accessible tabs
       ------------------------------------------------------------------ */
    const FAVOURITES = {
        Breakfast: [
            { name: "Farmhouse Breakfast", desc: "Eggs, bacon, sausage, grilled tomato, toast", price: 89 },
            { name: "Eggs Benedict", desc: "Poached eggs, back bacon, hollandaise, English muffin", price: 79 },
            { name: "French Toast", desc: "Cinnamon-dusted French toast, berries, maple syrup", price: 62 }
        ],
        Lunch: [
            { name: "Beef Burger", desc: "Beef patty, cheddar, lettuce, tomato, chips", price: 95 },
            { name: "Chicken Caesar Salad", desc: "Grilled chicken, cos lettuce, parmesan, croutons", price: 78 },
            { name: "Butter Chicken Wrap", desc: "Grilled chicken, butter chicken sauce, salad, wrap", price: 72 }
        ],
        Dinner: [
            { name: "Sirloin Steak", desc: "300g sirloin, chips, side salad, choice of sauce", price: 145 },
            { name: "Pan-Seared Salmon", desc: "Salmon fillet, lemon butter sauce, seasonal vegetables", price: 160 },
            { name: "Lamb Shank", desc: "Slow-braised lamb shank, red wine jus, creamy mash", price: 175 }
        ],
        Coffee: [
            { name: "Flat White", desc: "Espresso with steamed milk and a thin layer of microfoam", price: 34 },
            { name: "Cinnamon Honey Latte", desc: "Espresso, steamed milk, cinnamon and honey", price: 38 },
            { name: "Masala Chai Latte", desc: "Spiced tea with steamed milk, cinnamon and cardamom", price: 36 }
        ]
    };

    function initFavourites() {
        const tabList = $("#fav-tabs");
        const grid = $("#fav-grid");
        if (!tabList || !grid) return;

        const categories = Object.keys(FAVOURITES);

        function select(category, moveFocus) {
            $$("button", tabList).forEach((button) => {
                const active = button.dataset.cat === category;
                button.setAttribute("aria-selected", String(active));
                button.tabIndex = active ? 0 : -1;
                if (active && moveFocus) button.focus();
            });
            grid.setAttribute("aria-labelledby", "tab-" + category.toLowerCase());
            grid.replaceChildren(
                ...FAVOURITES[category].map((item) =>
                    el("article", { class: "fav-card" },
                        el("h3", { text: item.name }),
                        el("p", { text: item.desc }),
                        el("div", { class: "fav-meta" },
                            el("span", { class: "fav-price", text: rand(item.price) }),
                            el("a", { href: "menu.html#" + category.toLowerCase(), text: "See on menu" })
                        )
                    )
                )
            );
        }

        categories.forEach((category) => {
            tabList.append(el("button", {
                type: "button",
                role: "tab",
                id: "tab-" + category.toLowerCase(),
                "data-cat": category,
                "aria-controls": "fav-grid",
                "aria-selected": "false",
                tabindex: "-1",
                text: category,
                onclick: () => select(category, false)
            }));
        });

        // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
        tabList.addEventListener("keydown", (event) => {
            const current = categories.indexOf(
                ($("button[aria-selected='true']", tabList) || {}).dataset?.cat
            );
            let next = null;
            if (event.key === "ArrowRight") next = (current + 1) % categories.length;
            if (event.key === "ArrowLeft") next = (current - 1 + categories.length) % categories.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = categories.length - 1;
            if (next !== null) {
                event.preventDefault();
                select(categories[next], true);
            }
        });

        select(categories[0], false);
    }

    /* ------------------------------------------------------------------
       3. Menu search, category filter and sort
       ------------------------------------------------------------------ */
    function initMenuTools() {
        const tools = $("#menu-tools");
        if (!tools) return;

        const search = $("#menu-search");
        const category = $("#menu-category");
        const sort = $("#menu-sort");
        const reset = $("#menu-reset");
        const count = $("#menu-count");
        const empty = $("#menu-empty");
        const sections = $$("main section[id]").filter((section) => $("table", section));

        tools.hidden = false; // controls only appear when JavaScript works

        // Remember the original order so "Menu order" can restore it
        sections.forEach((section) =>
            $$("tbody tr", section).forEach((row, index) => { row.dataset.order = index; })
        );

        const priceOf = (row) => {
            const match = $("td:last-child", row).textContent.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
        };
        const nameOf = (row) => $("td:first-child", row).textContent.trim().toLowerCase();

        function apply() {
            const query = search.value.trim().toLowerCase();
            const chosen = category.value;
            const mode = sort.value;
            let shown = 0;

            sections.forEach((section) => {
                const tbody = $("tbody", section);
                const rows = $$("tr", tbody);

                rows.sort((a, b) => {
                    if (mode === "price-asc") return priceOf(a) - priceOf(b);
                    if (mode === "price-desc") return priceOf(b) - priceOf(a);
                    if (mode === "name") return nameOf(a).localeCompare(nameOf(b));
                    return Number(a.dataset.order) - Number(b.dataset.order);
                });
                rows.forEach((row) => tbody.appendChild(row));

                let visible = 0;
                rows.forEach((row) => {
                    const match = !query || row.textContent.toLowerCase().includes(query);
                    row.hidden = !match;
                    if (match) visible++;
                });

                const inCategory = chosen === "all" || section.id === chosen;
                section.hidden = !inCategory || visible === 0;
                if (inCategory) shown += visible;
            });

            count.textContent = shown === 1 ? "1 item shown" : `${shown} items shown`;
            empty.hidden = shown > 0;
        }

        [search, category, sort].forEach((control) => {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        reset.addEventListener("click", () => {
            search.value = "";
            category.value = "all";
            sort.value = "default";
            apply();
            search.focus();
        });

        apply();
    }

    /* ------------------------------------------------------------------
       4. Lightbox (uses the native <dialog> element)
       ------------------------------------------------------------------ */
    function initLightbox() {
        const triggers = $$("[data-lightbox]");
        if (!triggers.length) return;

        const dialog = el("dialog", { class: "lightbox", "aria-label": "Image viewer" });
        const image = el("img", { class: "lightbox-img", alt: "" });
        const caption = el("span", { class: "lightbox-caption" });
        const counter = el("span", { class: "lightbox-counter" });
        const prev = el("button", {
            type: "button", class: "lightbox-btn lightbox-prev",
            "aria-label": "Previous image", text: "\u2039"
        });
        const next = el("button", {
            type: "button", class: "lightbox-btn lightbox-next",
            "aria-label": "Next image", text: "\u203A"
        });
        const close = el("button", {
            type: "button", class: "lightbox-btn lightbox-close",
            "aria-label": "Close image viewer", text: "\u00D7"
        });
        dialog.append(
            close, prev,
            el("figure", { class: "lightbox-figure" },
                image,
                el("figcaption", {}, caption, counter)),
            next
        );
        document.body.append(dialog);

        let group = [];
        let index = 0;
        let lastFocus = null;

        const groupKey = (node) =>
            node.dataset.lightbox + ":" + (node.closest("section") ? node.closest("section").id : "");
        const imageOf = (node) => (node.tagName === "IMG" ? node : $("img", node));

        function show(position) {
            index = (position + group.length) % group.length;
            const source = imageOf(group[index]);
            dialog.classList.add("loading");
            image.onload = () => dialog.classList.remove("loading");
            image.onerror = () => {
                dialog.classList.remove("loading");
                caption.textContent = "Sorry, this image could not be loaded.";
            };
            image.src = source.currentSrc || source.src;
            image.alt = source.alt;
            caption.textContent = source.alt;
            counter.textContent = `${index + 1} / ${group.length}`;
            prev.hidden = next.hidden = group.length < 2;
        }

        function open(trigger) {
            lastFocus = trigger;
            group = triggers.filter((node) => groupKey(node) === groupKey(trigger));
            show(group.indexOf(trigger));
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
        }

        triggers.forEach((trigger) => {
            if (trigger.tagName === "IMG") {
                // Plain images become keyboard-accessible "buttons"
                trigger.tabIndex = 0;
                trigger.setAttribute("role", "button");
                trigger.setAttribute("aria-label", "View larger: " + trigger.alt);
                trigger.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        open(trigger);
                    }
                });
            }
            trigger.addEventListener("click", () => open(trigger));
        });

        prev.addEventListener("click", () => show(index - 1));
        next.addEventListener("click", () => show(index + 1));
        close.addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close(); // click on the backdrop
        });
        dialog.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") show(index - 1);
            if (event.key === "ArrowRight") show(index + 1);
        });
        dialog.addEventListener("close", () => {
            image.removeAttribute("src");
            if (lastFocus) lastFocus.focus();
        });

        // Simple swipe support for phones
        let touchStartX = null;
        dialog.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
        dialog.addEventListener("touchend", (event) => {
            if (touchStartX === null) return;
            const distance = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(distance) > 50) show(index + (distance < 0 ? 1 : -1));
            touchStartX = null;
        });
    }

    /* ------------------------------------------------------------------
       5. FAQ accordion
       ------------------------------------------------------------------ */
    function initAccordion() {
        $$(".accordion").forEach((accordion) => {
            const triggers = $$(".accordion-trigger", accordion);

            function setState(button, open) {
                button.setAttribute("aria-expanded", String(open));
                const panel = document.getElementById(button.getAttribute("aria-controls"));
                if (panel) panel.classList.toggle("open", open);
            }

            triggers.forEach((button, position) => {
                button.addEventListener("click", () => {
                    const wasOpen = button.getAttribute("aria-expanded") === "true";
                    triggers.forEach((other) => setState(other, false)); // one open at a time
                    setState(button, !wasOpen);
                });
                button.addEventListener("keydown", (event) => {
                    let target = null;
                    if (event.key === "ArrowDown") target = triggers[(position + 1) % triggers.length];
                    if (event.key === "ArrowUp") target = triggers[(position - 1 + triggers.length) % triggers.length];
                    if (event.key === "Home") target = triggers[0];
                    if (event.key === "End") target = triggers[triggers.length - 1];
                    if (target) {
                        event.preventDefault();
                        target.focus();
                    }
                });
            });
        });
    }

    /* ------------------------------------------------------------------
       6. Form validation engine
       Each field declares its rule with data-validate="..." in the HTML.
       A rule returns an error message, or "" when the value is fine.
       ------------------------------------------------------------------ */
    const RULES = {
        name(value) {
            const v = value.trim();
            if (!v) return "Please enter your full name.";
            if (v.length < 2 || v.length > 60) return "Your name must be between 2 and 60 characters.";
            if (!/^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F '\-]*$/.test(v)) {
                return "Names can only contain letters, spaces, apostrophes and hyphens.";
            }
            return "";
        },

        email(value) {
            const v = value.trim();
            if (!v) return "Please enter your email address.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
                return "Enter a valid email address, e.g. name@example.com.";
            }
            return "";
        },

        phone(value, input) {
            const cleaned = value.replace(/[\s()\-]/g, "");
            if (!cleaned) return input.required ? "Please enter your phone number." : "";
            if (!/^(\+27|0)[1-9]\d{8}$/.test(cleaned)) {
                return "Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.";
            }
            return "";
        },

        select(value) {
            return value ? "" : "Please choose an option from the list.";
        },

        guests(value, input) {
            if (value === "") return "Please enter the number of guests.";
            const number = Number(value);
            const min = Number(input.min || 1);
            const max = input.max ? Number(input.max) : Infinity;
            if (!Number.isInteger(number)) return "Please use a whole number of guests.";
            if (number < min) return `Please enter at least ${min} guests.`;
            if (number > max) {
                return input.id === "resGuests"
                    ? `For more than ${max} guests, please use the event booking form.`
                    : `We can host up to ${max} guests. Please call us for larger groups.`;
            }
            return "";
        },

        resDate(value) {
            if (!value) return "Please choose a date.";
            const date = parseDate(value);
            if (!date) return "Please enter a valid date.";
            const days = daysFromToday(date);
            if (days < 0) return "The date can't be in the past.";
            if (days > 90) return "We take table reservations up to 90 days ahead.";
            return "";
        },

        resTime(value, input, form) {
            if (!value) return "Please choose a time.";
            const [hour, minute] = value.split(":").map(Number);
            const minutes = hour * 60 + minute;
            const [open, close] = openingHours(form.elements.resDate.value);
            if (minutes < open * 60 || minutes > (close - 1) * 60) {
                return `On that day we seat guests between ${pad(open)}:00 and ${pad(close - 1)}:00.`;
            }
            const date = parseDate(form.elements.resDate.value);
            if (date && daysFromToday(date) === 0) {
                const now = new Date();
                if (minutes <= now.getHours() * 60 + now.getMinutes()) return "That time has already passed today.";
            }
            return "";
        },

        eventDate(value) {
            if (!value) return "Please choose a preferred date.";
            const date = parseDate(value);
            if (!date) return "Please enter a valid date.";
            const days = daysFromToday(date);
            if (days < 3) return "Events need at least 3 days' notice. Please pick a later date.";
            if (days > 365) return "Please choose a date within the next 12 months.";
            return "";
        },

        text(value, input) {
            const trimmed = value.trim();
            const min = Number(input.getAttribute("minlength") || 1);
            const max = Number(input.getAttribute("maxlength") || 5000);
            if (!trimmed) return "This field can't be empty.";
            if (trimmed.length < min) return `Please write at least ${min} characters (you have ${trimmed.length}).`;
            if (trimmed.length > max) return `Please keep this under ${max} characters.`;
            return "";
        },

        optional(value, input) {
            const max = Number(input.getAttribute("maxlength") || 5000);
            return value.trim().length > max ? `Please keep this under ${max} characters.` : "";
        }
    };

    function setStatus(form, message, type) {
        const status = $(".form-status", form);
        if (!status) return;
        status.textContent = message;
        status.className = "form-status" + (type ? " " + type : "");
    }

    function clearValidation(form) {
        $$("[data-validate]", form).forEach((field) => {
            field.classList.remove("valid", "invalid");
            field.removeAttribute("aria-invalid");
            const error = document.getElementById(field.id + "-error");
            if (error) error.textContent = "";
        });
    }

    function setupValidation(form, onValid) {
        form.noValidate = true; // we show our own, friendlier messages
        const fields = $$("[data-validate]", form);
        const submitButton = $("button[type='submit']", form);

        // Status line + one error holder per field
        submitButton.insertAdjacentElement("beforebegin", el("p", { class: "form-status", role: "status" }));
        fields.forEach((field) => {
            const error = el("span", { class: "error-msg", id: field.id + "-error" });
            field.insertAdjacentElement("afterend", error);
            field.setAttribute("aria-describedby", error.id);
        });

        function check(field) {
            const rule = RULES[field.dataset.validate];
            const message = rule ? rule(field.value, field, form) : "";
            document.getElementById(field.id + "-error").textContent = message;
            field.classList.toggle("invalid", Boolean(message));
            field.classList.toggle("valid", !message && field.value.trim() !== "");
            field.setAttribute("aria-invalid", message ? "true" : "false");

            // A date change can make an already-typed time invalid (opening hours differ)
            if (field.dataset.revalidate) {
                const dependent = form.elements[field.dataset.revalidate];
                if (dependent && dependent.value) check(dependent);
            }
            return !message;
        }

        fields.forEach((field) => {
            field.addEventListener("blur", () => check(field));
            field.addEventListener("change", () => check(field));
            field.addEventListener("input", () => {
                if (field.classList.contains("invalid")) check(field); // live feedback while fixing
            });
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const results = fields.map((field) => [field, check(field)]);
            const firstInvalid = results.find((result) => !result[1]);
            if (firstInvalid) {
                firstInvalid[0].focus();
                const problems = results.filter((result) => !result[1]).length;
                setStatus(form, `Please fix ${problems} highlighted ${problems === 1 ? "field" : "fields"} and try again.`, "error");
                return;
            }
            setStatus(form, "", "");
            onValid(Object.fromEntries(new FormData(form)), form);
        });
    }

    /* ------------------------------------------------------------------
       Result dialog (modal) used for confirmations, quotes and the email
       ------------------------------------------------------------------ */
    function showResult(result) {
        const dialog = el("dialog", { class: "modal", "aria-labelledby": "modal-title" });
        const closeButton = el("button", {
            type: "button", class: "btn btn-secondary", text: "Close",
            onclick: () => dialog.close()
        });

        // optional parts are only added when they exist (append(null) would print "null")
        dialog.append(...[
            el("h2", { id: "modal-title", text: result.title }),
            el("p", { class: "modal-lead", text: result.lead }),
            result.rows && result.rows.length
                ? el("dl", { class: "modal-details" },
                    result.rows.flatMap(([label, value]) => [el("dt", { text: label }), el("dd", { text: value })]))
                : null,
            result.preview ? el("pre", { class: "email-preview", text: result.preview }) : null,
            result.note ? el("p", { class: "modal-note", text: result.note }) : null,
            el("div", { class: "modal-actions" }, ...(result.actions || []), closeButton)
        ].filter(Boolean));

        dialog.addEventListener("close", () => dialog.remove());
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
        document.body.append(dialog);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
        closeButton.focus();
    }

    /* ------------------------------------------------------------------
       AJAX submission: sends the validated data to the form's action URL
       with fetch() (no page reload), shows a loading state, then displays
       a response built from the visitor's own input (price, availability...).

       No server is connected yet, so the forms carry data-simulate="true":
       the request is then simulated locally (short delay, nothing leaves the
       browser). To go live, put a real endpoint (e.g. a Formspree form URL) in
       the form's action attribute and delete data-simulate="true".
       ------------------------------------------------------------------ */
    function simulateServer(data) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                ok: true,
                json: async () => ({ received: true, fields: Object.keys(data).length })
            }), 700);
        });
    }

    async function submitWithAjax(form, data, buildResult) {
        const button = $("button[type='submit']", form);
        const originalLabel = button.textContent;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);

        button.disabled = true;
        button.classList.add("is-loading");
        button.textContent = "Sending...";
        setStatus(form, "", "");

        try {
            const response = form.dataset.simulate === "true"
                ? await simulateServer(data)
                : await fetch(form.action, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
            if (!response.ok) throw new Error("The server responded with status " + response.status);
            await response.json();

            showResult(buildResult(data));
            form.reset();
            clearValidation(form);
            setStatus(form, "Thank you - your request was sent successfully.", "success");
        } catch (error) {
            setStatus(
                form,
                "Sorry, we couldn't send your request right now. Please check your connection and try again, or call us on 011 123 4567.",
                "error"
            );
        } finally {
            clearTimeout(timer);
            button.disabled = false;
            button.classList.remove("is-loading");
            button.textContent = originalLabel;
        }
    }

    /* ------------------------------------------------------------------
       Enquiry page - response builders (availability, quotes, replies)
       ------------------------------------------------------------------ */
    function reservationResult(data) {
        const date = parseDate(data.resDate);
        const day = date.getDay();
        const [hour, minute] = data.resTime.split(":").map(Number);
        const guests = Number(data.resGuests);

        // Estimated seats already taken at that time (typical occupancy)
        let booked = 20;
        if (hour >= 12 && hour < 14) booked = 55;                       // lunch rush
        if ((day === 5 || day === 6) && hour >= 18) booked = 68;       // Friday/Saturday dinner
        if (day === 0 && hour >= 12 && hour < 15) booked = 60;         // Sunday lunch
        const remaining = TOTAL_SEATS - booked;

        const rows = [
            ["Reference", makeReference("RSV")],
            ["Name", data.resName.trim()],
            ["Date", longDate(date)],
            ["Time", `${pad(hour)}:${pad(minute)}`],
            ["Guests", String(guests)]
        ];

        let title, lead, note;
        if (guests <= remaining - 8) {
            title = "Table available";
            lead = `Good news, ${data.resName.trim().split(" ")[0]}! We have space for ${guests} at that time.`;
            rows.push(["Status", "Confirmed - check your email"]);
        } else if (guests <= remaining) {
            title = "Limited availability";
            lead = "That time is busy, but we can hold a table for you.";
            rows.push(["Status", "Table held for 24 hours"]);
            note = "We'll email you to confirm. Reply within 24 hours to keep the table.";
        } else {
            const earlier = `${pad(Math.max(hour - 2, 7))}:${pad(minute)}`;
            const later = `${pad(Math.min(hour + 2, 20))}:${pad(minute)}`;
            title = "Added to our waiting list";
            lead = "That time is fully booked right now, so we've added you to the waiting list.";
            rows.push(["Status", "Waiting list"]);
            rows.push(["Quieter times", `${earlier} or ${later}`]);
            note = "We'll email you straight away if a table opens up.";
        }

        if (guests >= 8) {
            rows.push(["Deposit", `${rand(guests * 50)} (R50 per guest, refundable)`]);
        } else {
            rows.push(["Deposit", "None required"]);
        }
        rows.push(["Special requests", data.resNotes.trim() || "None"]);

        return { title, lead, rows, note };
    }

    const EVENT_RATES = {
        birthday: { label: "Birthday", perPerson: 180 },
        corporate: { label: "Corporate Function", perPerson: 240 },
        "private-dining": { label: "Private Dining", perPerson: 320 },
        celebration: { label: "Celebration / Anniversary", perPerson: 210 },
        other: { label: "Other", perPerson: 190 }
    };

    function eventResult(data) {
        const date = parseDate(data.eventDate);
        const guests = Number(data.eventGuests);
        const rate = EVENT_RATES[data.eventType] || EVENT_RATES.other;
        const day = date.getDay();
        const weekend = day === 5 || day === 6 || day === 0;

        const subtotal = guests * rate.perPerson;
        const surcharge = weekend ? subtotal * 0.1 : 0;
        const discount = guests >= 30 ? (subtotal + surcharge) * 0.1 : 0;
        const total = subtotal + surcharge - discount;

        const rows = [
            ["Reference", makeReference("EVT")],
            ["Event", rate.label],
            ["Date", longDate(date)],
            ["Guests", String(guests)],
            ["Rate", `${rand(rate.perPerson)} per person`],
            ["Subtotal", rand(subtotal)]
        ];
        if (weekend) rows.push(["Weekend surcharge (10%)", "+ " + rand(surcharge)]);
        if (discount) rows.push(["Group discount (10%)", "- " + rand(discount)]);
        rows.push(["Estimated total", rand(total)]);
        rows.push(["Deposit to secure (30%)", rand(total * 0.3)]);

        return {
            title: "Your event estimate",
            lead: `Thanks, ${data.eventName.trim().split(" ")[0]}! Here is an estimate for your ${rate.label.toLowerCase()}.`,
            rows,
            note: (day === 6 ? "Saturdays book up quickly, so we recommend confirming soon. " : "") +
                "This is an estimate only. Our events team will confirm availability and the final price within 1 business day."
        };
    }

    const ENQUIRY_REPLIES = {
        general: "A member of our team will reply by email within 1 business day.",
        catering: "Catering starts from R150 per person for groups of 10 or more. We'll send a tailored quote within 1 business day.",
        "bulk-order": "Bulk orders of 20 or more items get 10% off. Please allow 48 hours' notice. We'll confirm availability and pricing by email.",
        feedback: "Thank you for taking the time to tell us. Our manager reads every message and will follow up if you'd like a reply.",
        other: "Thanks for reaching out. We'll direct your message to the right person and reply within 1 business day."
    };

    function generalEnquiryResult(data) {
        const select = $("#enquiryType");
        const typeLabel = select.options[select.selectedIndex].textContent;
        return {
            title: "Enquiry received",
            lead: ENQUIRY_REPLIES[data.enquiryType] || ENQUIRY_REPLIES.other,
            rows: [
                ["Reference", makeReference("ENQ")],
                ["Name", data.fullName.trim()],
                ["Enquiry type", typeLabel],
                ["Reply to", data.email.trim()]
            ],
            note: "Please quote your reference number if you contact us about this enquiry."
        };
    }

    function initEnquiryForms() {
        const reservation = $("#reservationForm");
        const event = $("#eventForm");
        const general = $("#enquiryForm");

        // Sensible date limits straight from the calendar picker
        const today = startOfToday();
        const plusDays = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
        if (reservation) {
            reservation.elements.resDate.min = toIsoDate(today);
            reservation.elements.resDate.max = toIsoDate(plusDays(90));
            setupValidation(reservation, (data, form) => submitWithAjax(form, data, reservationResult));
        }
        if (event) {
            event.elements.eventDate.min = toIsoDate(plusDays(3));
            event.elements.eventDate.max = toIsoDate(plusDays(365));
            setupValidation(event, (data, form) => submitWithAjax(form, data, eventResult));
        }
        if (general) {
            setupValidation(general, (data, form) => submitWithAjax(form, data, generalEnquiryResult));
        }
    }

    /* ------------------------------------------------------------------
       7. Contact form - validate, compile an email, let the user send it
       ------------------------------------------------------------------ */
    function initContactForm() {
        const form = $("#contactForm");
        if (!form) return;

        setupValidation(form, (data) => {
            const typeSelect = form.elements.contactType;
            const typeLabel = typeSelect.options[typeSelect.selectedIndex].textContent;
            const name = data.contactName.trim();

            const subject = `Website message (${typeLabel}) from ${name}`;
            const body = [
                "Hello Blackwood & Bean team,",
                "",
                data.contactMessage.trim(),
                "",
                "---",
                `Name: ${name}`,
                `Email: ${data.contactEmail.trim()}`,
                `Phone: ${data.contactPhone.trim() || "Not provided"}`,
                `Message type: ${typeLabel}`,
                "Sent from the Blackwood & Bean website contact form."
            ].join("\r\n");

            const mailto = `mailto:${CONTACT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            const openLink = el("a", {
                class: "btn", href: mailto, text: "Open in my email app",
                onclick: () => setStatus(form, "Your email app should now be open. Press Send there to finish.", "success")
            });
            const copyButton = el("button", { type: "button", class: "btn btn-secondary", text: "Copy email text" });
            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(`To: ${CONTACT_RECIPIENT}\nSubject: ${subject}\n\n${body}`);
                    copyButton.textContent = "Copied!";
                } catch (error) {
                    copyButton.textContent = "Copy not available - select the text above";
                }
            });

            showResult({
                title: "Your email is ready",
                lead: `We've put your message together. Check it below, then open it in your email app to send it to ${CONTACT_RECIPIENT}.`,
                preview: `To: ${CONTACT_RECIPIENT}\nSubject: ${subject}\n\n${body.replace(/\r\n/g, "\n")}`,
                note: "If nothing opens, use \"Copy email text\" and paste it into your email app.",
                actions: [openLink, copyButton]
            });
        });
    }

    /* ------------------------------------------------------------------
       8. Interactive map (Leaflet + OpenStreetMap)
       ------------------------------------------------------------------ */
    function initMap() {
        const container = $("#map");
        if (!container) return;

        if (typeof window.L === "undefined") {
            container.append(el("p", {
                class: "map-fallback",
                text: "The interactive map couldn't be loaded. You'll find us at 123 Main Street, Johannesburg."
            }));
            return;
        }

        const L = window.L;
        const position = [VENUE.lat, VENUE.lng];
        const map = L.map(container, { scrollWheelZoom: false }).setView(position, 15);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CartoDB</a>',
            subdomains: "abcd",
            maxZoom: 20
        }).addTo(map);

        const popup = el("div", {},
            el("strong", { text: "Blackwood & Bean" }),
            el("br"),
            document.createTextNode("123 Main Street, Johannesburg"),
            el("br"),
            document.createTextNode("011 123 4567")
        );
        L.marker(position, { title: "Blackwood & Bean" }).addTo(map).bindPopup(popup).openPopup();

        // Scroll-wheel zoom only after the visitor clicks the map (so the page still scrolls)
        map.on("click", () => map.scrollWheelZoom.enable());
        map.on("mouseout", () => map.scrollWheelZoom.disable());

        const recentre = $("#map-recentre");
        if (recentre) recentre.addEventListener("click", () => map.setView(position, 15));
    }

    /* ------------------------------------------------------------------
       Start everything
       ------------------------------------------------------------------ */
    initReveal();
    initFavourites();
    initMenuTools();
    initLightbox();
    initAccordion();
    initEnquiryForms();
    initContactForm();
    initMap();
})();
