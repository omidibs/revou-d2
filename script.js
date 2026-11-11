/* ==========================================================================
   REVE SPACE — VENUE (WEDDING & EVENT) & EATERY
   Interactive Scroll Animations, Gallery & Full Booking Engine
   ========================================================================== */

(function () {
  'use strict';

  const OFFICIAL_WA_NUMBER = '6287824280277'; // 0878-2428-0277
  const STORAGE_KEY = 'reve_space_saved_bookings_v1';

  /* ------------------------------------------------------------------------
     1. NAVBAR SCROLL STATE & MOBILE MENU
     ------------------------------------------------------------------------ */
  const mainNavbar = document.getElementById('mainNavbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const heroParallaxImg = document.getElementById('heroParallaxImg');

  const navAnchorLinks = navLinks
    ? Array.from(navLinks.querySelectorAll('a[href^="#"]'))
    : [];

  function updateActiveNavOnScroll() {
    if (navAnchorLinks.length === 0) return;

    let currentActiveHref = navAnchorLinks[0].getAttribute('href');
    const triggerOffset = 180; // Pixels from top of viewport (below sticky navbar)

    navAnchorLinks.forEach((link) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const sectionEl = document.querySelector(targetId);
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      if (rect.top <= triggerOffset) {
        currentActiveHref = targetId;
      }
    });

    // If scrolled near the very bottom of the page, activate the last nav item
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
      currentActiveHref = navAnchorLinks[navAnchorLinks.length - 1].getAttribute('href');
    }

    navAnchorLinks.forEach((link) => {
      const isMatch = link.getAttribute('href') === currentActiveHref;
      link.classList.toggle('active', isMatch);
    });
  }

  function handleWindowScroll() {
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (mainNavbar) {
      if (scrollY > 20) {
        mainNavbar.classList.add('scrolled');
      } else if (mainNavbar.classList.contains('hero-top')) {
        mainNavbar.classList.remove('scrolled');
      }
    }

    // Update active underline in navbar based on current scroll section
    updateActiveNavOnScroll();

    // Fallback JS scroll progress bar when CSS scroll() timeline is unsupported
    if (scrollProgressBar && !CSS.supports('animation-timeline: scroll()')) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      scrollProgressBar.style.transform = `scaleX(${progress})`;
    }

    // Subtle Hero Parallax on Scroll
    if (heroParallaxImg && scrollY < window.innerHeight) {
      const translateY = scrollY * 0.22;
      heroParallaxImg.style.transform = `scale(1.06) translate3d(0, ${translateY}px, 0)`;
    }
  }

  window.addEventListener('scroll', handleWindowScroll, { passive: true });
  handleWindowScroll();

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. SCROLL REVEAL ANIMATIONS & ANIMATED NUMBER COUNTERS
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal, .image-reveal-wrap');
  const counterElements = document.querySelectorAll('.counter');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // Counter Count-Up Animation on Scroll
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    counterElements.forEach((el) => {
      el.textContent = el.getAttribute('data-target') || '0';
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    const duration = 1400;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------------
     3. DEFAULT DATE INITIALIZATION ON LANDING QUICK FORM
     ------------------------------------------------------------------------ */
  const quickDateInput = document.getElementById('quickDate');
  if (quickDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const isoDate = tomorrow.toISOString().split('T')[0];
    quickDateInput.value = isoDate;
  }

  /* ------------------------------------------------------------------------
     4. GALLERY FILTERING & LIGHTBOX (<dialog>)
     ------------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxDialog = document.getElementById('lightboxDialog');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        const applyFilter = () => {
          galleryItems.forEach((item) => {
            const cat = item.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              item.style.display = '';
              requestAnimationFrame(() => item.classList.add('is-visible'));
            } else {
              item.style.display = 'none';
            }
          });
        };

        if (document.startViewTransition) {
          document.startViewTransition(applyFilter);
        } else {
          applyFilter();
        }
      });
    });
  }

  if (lightboxDialog && lightboxImg) {
    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const imgEl = item.querySelector('img');
        const fullSrc = item.getAttribute('data-full') || (imgEl ? imgEl.src : '');
        const caption = item.getAttribute('data-caption') || 'Reve Space Venue Jakarta Selatan';
        lightboxImg.src = fullSrc;
        lightboxImg.onerror = function () {
          if (imgEl && imgEl.src) {
            lightboxImg.src = imgEl.src;
          }
        };
        if (lightboxCaption) lightboxCaption.textContent = caption;
        if (typeof lightboxDialog.showModal === 'function') {
          lightboxDialog.showModal();
        }
      });
    });

    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener('click', () => lightboxDialog.close());
    }

    lightboxDialog.addEventListener('click', (e) => {
      if (e.target === lightboxDialog) {
        lightboxDialog.close();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. SHARED DATA LAYER (LOCALSTORAGE + OPTIONAL CLOUD WEBHOOK)
     ------------------------------------------------------------------------ */
  const WEBHOOK_STORAGE_KEY = 'reve_space_webhook_url_v1';

  const DEFAULT_DEMO_BOOKINGS = [
    {
      refCode: 'RV-2026-8412',
      createdAt: '10 Nov 2026',
      customerName: 'Nadia Putri & Reza Pratama',
      customerPhone: '081288991023',
      customerEmail: 'nadia.reza@email.com',
      modeLabel: 'Wedding & Private Event',
      packageName: 'Paket Royal Garden All-In (500–600 Pax)',
      date: '2026-11-28',
      session: 'Sesi Pagi / Siang (08.00 – 14.00 WIB)',
      area: 'Full Area (Indoor + Outdoor Garden)',
      guests: 500,
      selectedAddons: ['Upacara & Busana Adat (Sunda/Jawa/Betawi)', 'Live Music Acoustic + Saxophone'],
      total: 85500000,
      status: 'Confirmed',
      notes: 'Adat Sunda Siger untuk akad, dekorasi nuansa sage green & gold.',
    },
    {
      refCode: 'RV-2026-7905',
      createdAt: '11 Nov 2026',
      customerName: 'Dimas Anggara & Laras',
      customerPhone: '081377662190',
      customerEmail: 'dimas.laras@email.com',
      modeLabel: 'Wedding & Private Event',
      packageName: 'Paket Intimate Harmony (200 Pax)',
      date: '2026-12-12',
      session: 'Sesi Sore / Malam (15.30 – 21.00 WIB)',
      area: 'Semi-Outdoor & Garden Area',
      guests: 200,
      selectedAddons: ['Photobooth Unlimited Print & Mini Garden'],
      total: 60000000,
      status: 'Pending',
      notes: 'Ingin menjadwalkan food tasting akhir pekan ini.',
    },
    {
      refCode: 'RV-2026-6631',
      createdAt: '11 Nov 2026',
      customerName: 'Bapak Hendra Wijaya (Komunitas Bintaro)',
      customerPhone: '087811223344',
      customerEmail: 'hendra.w@email.com',
      modeLabel: 'Reservasi Meja Eatery Harian',
      packageName: 'Paket Signature Eatery & Dessert',
      date: '2026-11-15',
      session: 'Makan Siang / Lunch (12.00 – 14.00 WIB)',
      area: 'Outdoor Seating (Taman)',
      guests: 15,
      selectedAddons: [],
      total: 1125000,
      status: 'Confirmed',
      notes: 'Meja panjang di area outdoor seating untuk makan siang keluarga.',
    },
    {
      refCode: 'RV-2026-5109',
      createdAt: '11 Nov 2026',
      customerName: 'Clarissa & Kevin',
      customerPhone: '085799001122',
      customerEmail: 'clarissa.k@email.com',
      modeLabel: 'Survey Lokasi & Food Tasting',
      packageName: 'Survey Venue + Sesi Food Tasting Katering',
      date: '2026-11-16',
      session: 'Sesi Siang (13.00 – 15.00 WIB)',
      area: 'Full Area (Indoor + Outdoor Garden)',
      guests: 4,
      selectedAddons: [],
      total: 0,
      status: 'Pending',
      notes: 'Rencana pernikahan bulan Februari 2027 untuk 400 pax.',
    },
  ];

  function formatRupiah(amount) {
    if (!amount || amount === 0) return 'Gratis (Rp 0)';
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  }

  function getBookingsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_BOOKINGS));
        return [...DEFAULT_DEMO_BOOKINGS];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [...DEFAULT_DEMO_BOOKINGS];
    }
  }

  function setBookingsToStorage(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  function saveBookingToStorage(record) {
    const existing = getBookingsFromStorage();
    const withStatus = { status: 'Pending', ...record };
    existing.unshift(withStatus);
    setBookingsToStorage(existing);

    // Optional Cloud Webhook dispatch (Google Sheets / Formspree / Make)
    const webhookUrl = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (webhookUrl && webhookUrl.startsWith('http')) {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withStatus),
      }).catch(() => {});
    }
  }

  function getConfirmedBookedDates() {
    const baseSet = new Set([
      '2026-11-14',
      '2026-11-28',
      '2026-12-05',
      '2026-12-19',
      '2027-01-09',
    ]);
    getBookingsFromStorage().forEach((b) => {
      if (b.status === 'Confirmed' && b.modeLabel === 'Wedding & Private Event' && b.date) {
        baseSet.add(b.date);
      }
    });
    return baseSet;
  }

  /* ------------------------------------------------------------------------
     6. ADMIN DASHBOARD ENGINE (FOR admin.html)
     ------------------------------------------------------------------------ */
  const adminTableBody = document.getElementById('adminTableBody');
  if (adminTableBody) {
    const statTotalCount = document.getElementById('statTotalCount');
    const statPendingCount = document.getElementById('statPendingCount');
    const statConfirmedCount = document.getElementById('statConfirmedCount');
    const statTotalRevenue = document.getElementById('statTotalRevenue');
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminFilterStatus = document.getElementById('adminFilterStatus');
    const adminFilterCategory = document.getElementById('adminFilterCategory');
    const seedDemoDataBtn = document.getElementById('seedDemoDataBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const openWebhookModalBtn = document.getElementById('openWebhookModalBtn');
    const closeWebhookModalBtn = document.getElementById('closeWebhookModalBtn');
    const webhookConfigModal = document.getElementById('webhookConfigModal');
    const webhookUrlInput = document.getElementById('webhookUrlInput');
    const saveWebhookBtn = document.getElementById('saveWebhookBtn');
    const syncModeIndicator = document.getElementById('syncModeIndicator');

    function updateSyncIndicator() {
      const url = localStorage.getItem(WEBHOOK_STORAGE_KEY);
      if (syncModeIndicator) {
        syncModeIndicator.textContent = url
          ? 'Cloud Webhook Aktif + LocalStorage'
          : 'Browser LocalStorage + WhatsApp';
      }
      if (webhookUrlInput && url) {
        webhookUrlInput.value = url;
      }
    }

    function renderAdminDashboard() {
      const allBookings = getBookingsFromStorage();
      const query = (adminSearchInput?.value || '').toLowerCase().trim();
      const statusFilter = adminFilterStatus?.value || 'all';
      const catFilter = adminFilterCategory?.value || 'all';

      // Update KPI Stats
      const pendingCount = allBookings.filter((b) => (b.status || 'Pending') === 'Pending').length;
      const confirmedCount = allBookings.filter((b) => b.status === 'Confirmed').length;
      const activeRevenue = allBookings
        .filter((b) => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + (Number(b.total) || 0), 0);

      if (statTotalCount) statTotalCount.textContent = String(allBookings.length);
      if (statPendingCount) statPendingCount.textContent = String(pendingCount);
      if (statConfirmedCount) statConfirmedCount.textContent = String(confirmedCount);
      if (statTotalRevenue) statTotalRevenue.textContent = formatRupiah(activeRevenue);

      const filtered = allBookings.filter((item) => {
        const itemStatus = item.status || 'Pending';
        const matchStatus = statusFilter === 'all' || itemStatus === statusFilter;
        const matchCat = catFilter === 'all' || item.modeLabel === catFilter;
        const searchTarget = `${item.refCode} ${item.customerName} ${item.customerPhone} ${item.packageName} ${item.date}`.toLowerCase();
        const matchSearch = !query || searchTarget.includes(query);
        return matchStatus && matchCat && matchSearch;
      });

      adminTableBody.innerHTML = '';

      if (filtered.length === 0) {
        adminTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
              Tidak ada data pendaftar yang sesuai dengan filter pencarian.
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach((item) => {
        const status = item.status || 'Pending';
        const badgeClass =
          status === 'Confirmed'
            ? 'badge-confirmed'
            : status === 'Completed'
            ? 'badge-completed'
            : status === 'Cancelled'
            ? 'badge-cancelled'
            : 'badge-pending';

        const statusLabel =
          status === 'Confirmed'
            ? 'Confirmed (DP Masuk)'
            : status === 'Completed'
            ? 'Selesai'
            : status === 'Cancelled'
            ? 'Dibatalkan'
            : 'Menunggu Konfirmasi';

        const cleanCustomerPhone = (item.customerPhone || '').replace(/\D/g, '').replace(/^0/, '62');
        const waFollowUpText = encodeURIComponent(
          `Halo Kak *${item.customerName}*, kami dari Admin *Reve Space* (Jl. Damai Raya No.16, Petukangan Selatan).\n\nMenindaklanjuti pengajuan reservasi kode *${item.refCode}* (${item.packageName}) untuk tanggal *${item.date}* (${item.session}), status jadwal Anda saat ini: *${statusLabel}*.\n\nApakah ada yang ingin didiskusikan lebih lanjut? Terima kasih!`
        );

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <strong style="color: var(--accent-forest); display: block;">${item.refCode}</strong>
            <span style="font-size: 0.76rem; color: var(--text-muted);">${item.createdAt || '-'}</span>
          </td>
          <td>
            <strong>${item.customerName}</strong><br />
            <a href="https://wa.me/${cleanCustomerPhone}?text=${waFollowUpText}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-forest); font-weight: 600; font-size: 0.82rem;">
              📞 ${item.customerPhone}
            </a>
            ${item.notes ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">📝 "${item.notes}"</p>` : ''}
          </td>
          <td>
            <span style="font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent-gold); font-weight: 700; display: block;">
              ${item.modeLabel}
            </span>
            <strong>${item.packageName}</strong>
          </td>
          <td>
            <strong>📅 ${item.date}</strong><br />
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${item.session}</span><br />
            <span style="font-size: 0.76rem; color: var(--text-muted);">🏛️ ${item.area}</span>
          </td>
          <td>
            <strong>${formatRupiah(item.total)}</strong><br />
            <span style="font-size: 0.78rem; color: var(--text-secondary);">👥 ${item.guests} Orang / Pax</span>
          </td>
          <td>
            <span class="badge-status ${badgeClass}">${statusLabel}</span>
          </td>
          <td>
            <div class="admin-action-btns">
              <select class="action-chip-btn status-select" data-ref="${item.refCode}" aria-label="Ubah Status">
                <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>⏳ Set Pending</option>
                <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>✅ Set Confirmed (Kunci Tgl)</option>
                <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>🎉 Set Selesai</option>
                <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Batalkan</option>
              </select>
              <a
                href="https://wa.me/${cleanCustomerPhone}?text=${waFollowUpText}"
                target="_blank"
                rel="noopener noreferrer"
                class="action-chip-btn"
                title="Hubungi Pemesan via WhatsApp"
              >
                💬 Hubungi Tamu
              </a>
              <button type="button" class="action-chip-btn delete-booking-btn" data-ref="${item.refCode}" title="Hapus Data">
                🗑️
              </button>
            </div>
          </td>
        `;
        adminTableBody.appendChild(tr);
      });

      // Attach status change & delete handlers
      adminTableBody.querySelectorAll('.status-select').forEach((sel) => {
        sel.addEventListener('change', (e) => {
          const ref = e.target.getAttribute('data-ref');
          const newStatus = e.target.value;
          const list = getBookingsFromStorage().map((b) =>
            b.refCode === ref ? { ...b, status: newStatus } : b
          );
          setBookingsToStorage(list);
          renderAdminDashboard();
        });
      });

      adminTableBody.querySelectorAll('.delete-booking-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ref = btn.getAttribute('data-ref');
          const list = getBookingsFromStorage().filter((b) => b.refCode !== ref);
          setBookingsToStorage(list);
          renderAdminDashboard();
        });
      });
    }

    if (adminSearchInput) adminSearchInput.addEventListener('input', renderAdminDashboard);
    if (adminFilterStatus) adminFilterStatus.addEventListener('change', renderAdminDashboard);
    if (adminFilterCategory) adminFilterCategory.addEventListener('change', renderAdminDashboard);

    if (seedDemoDataBtn) {
      seedDemoDataBtn.addEventListener('click', () => {
        setBookingsToStorage(DEFAULT_DEMO_BOOKINGS);
        renderAdminDashboard();
      });
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const list = getBookingsFromStorage();
        const headers = [
          'Kode Booking',
          'Tanggal Input',
          'Nama Pemesan',
          'No WhatsApp',
          'Email',
          'Kategori',
          'Paket',
          'Tanggal Acara',
          'Sesi Waktu',
          'Area',
          'Jumlah Tamu',
          'Estimasi Biaya (Rp)',
          'Status',
          'Catatan',
        ];
        const rows = list.map((b) =>
          [
            b.refCode,
            b.createdAt,
            b.customerName,
            b.customerPhone,
            b.customerEmail || '',
            b.modeLabel,
            b.packageName,
            b.date,
            b.session,
            b.area,
            b.guests,
            b.total,
            b.status || 'Pending',
            b.notes || '',
          ]
            .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
            .join(',')
        );
        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Data-Reservasi-Reve-Space-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (openWebhookModalBtn && webhookConfigModal) {
      openWebhookModalBtn.addEventListener('click', () => webhookConfigModal.showModal());
    }
    if (closeWebhookModalBtn && webhookConfigModal) {
      closeWebhookModalBtn.addEventListener('click', () => webhookConfigModal.close());
    }
    if (saveWebhookBtn && webhookConfigModal) {
      saveWebhookBtn.addEventListener('click', () => {
        const val = (webhookUrlInput?.value || '').trim();
        if (val) {
          localStorage.setItem(WEBHOOK_STORAGE_KEY, val);
        } else {
          localStorage.removeItem(WEBHOOK_STORAGE_KEY);
        }
        updateSyncIndicator();
        webhookConfigModal.close();
      });
    }

    const openManualAddModalBtn = document.getElementById('openManualAddModalBtn');
    const closeManualAddModalBtn = document.getElementById('closeManualAddModalBtn');
    const manualAddModal = document.getElementById('manualAddModal');
    const adminManualAddForm = document.getElementById('adminManualAddForm');

    if (openManualAddModalBtn && manualAddModal) {
      openManualAddModalBtn.addEventListener('click', () => manualAddModal.showModal());
    }
    if (closeManualAddModalBtn && manualAddModal) {
      closeManualAddModalBtn.addEventListener('click', () => manualAddModal.close());
    }
    if (adminManualAddForm && manualAddModal) {
      adminManualAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const newRecord = {
          refCode: `RV-2026-${randomDigits}`,
          createdAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          customerName: document.getElementById('manualName').value.trim(),
          customerPhone: document.getElementById('manualPhone').value.trim(),
          customerEmail: '',
          modeLabel: document.getElementById('manualCategory').value,
          packageName: document.getElementById('manualPackage').value.trim(),
          date: document.getElementById('manualDate').value,
          session: document.getElementById('manualSession').value.trim(),
          area: 'Full Area (Indoor + Outdoor Garden)',
          guests: parseInt(document.getElementById('manualGuests').value || '100', 10),
          selectedAddons: [],
          total: parseInt(document.getElementById('manualTotal').value || '0', 10),
          status: document.getElementById('manualStatus').value,
          notes: document.getElementById('manualNotes').value.trim(),
        };
        const currentList = getBookingsFromStorage();
        currentList.unshift(newRecord);
        setBookingsToStorage(currentList);
        renderAdminDashboard();
        adminManualAddForm.reset();
        manualAddModal.close();
      });
    }

    window.addEventListener('storage', renderAdminDashboard);
    updateSyncIndicator();
    renderAdminDashboard();
  }

  /* ------------------------------------------------------------------------
     7. FULL BOOKING ENGINE (FOR booking.html)
     ------------------------------------------------------------------------ */
  const fullBookingForm = document.getElementById('fullBookingForm');
  if (!fullBookingForm) return; // Stop here if we are on index.html

  const BOOKING_MODES = {
    wedding: {
      label: 'Wedding & Private Event',
      step1Title: 'Pilih Paket Venue & Pernikahan',
      minGuests: 50,
      maxGuests: 650,
      stepGuests: 10,
      defaultGuests: 500,
      showAddons: true,
      depositNote: 'Termasuk sewa venue, fasilitas & layanan sesuai paket',
      sessions: [
        'Sesi Pagi / Siang (08.00 – 14.00 WIB)',
        'Sesi Sore / Malam (15.30 – 21.00 WIB)',
        'Full Day Exclusive (08.00 – 21.00 WIB)',
      ],
      packages: [
        {
          id: 'intimate',
          name: 'Paket Intimate Harmony (200 Pax)',
          basePrice: 57500000,
          baseGuests: 200,
          extraPerPax: 95000,
          desc: 'All-In 200 Pax: Venue Semi-Outdoor, Buffet, Dekorasi 7m, MUA & Dokumentasi.',
        },
        {
          id: 'semi-outdoor',
          name: 'Paket Semi-Outdoor Elegance (350 Pax)',
          basePrice: 68500000,
          baseGuests: 350,
          extraPerPax: 95000,
          desc: 'All-In 350 Pax: Area Indoor + Taman, Buffet Lengkap, Stall, MUA & WO.',
        },
        {
          id: 'royal',
          name: 'Paket Royal Garden All-In (500–600 Pax)',
          basePrice: 79000000,
          baseGuests: 500,
          extraPerPax: 90000,
          desc: 'All-In 500+ Pax: Full Area Eksklusif, Pelaminan 8–10m, Gubukan, Adat/Nasional, MC & Musik.',
        },
        {
          id: 'corporate',
          name: 'Event Kecil / Lamaran / Meeting (50–150 Pax)',
          basePrice: 18500000,
          baseGuests: 100,
          extraPerPax: 85000,
          desc: 'Sewa area acara intim, lamaran, arisan, atau corporate meeting + paket hidangan.',
        },
      ],
    },
    eatery: {
      label: 'Reservasi Meja Eatery Harian',
      step1Title: 'Pilih Paket Bersantap / Meja Eatery',
      minGuests: 2,
      maxGuests: 60,
      stepGuests: 1,
      defaultGuests: 4,
      showAddons: false,
      depositNote: 'Buka setiap hari · Eatery tutup pukul 16.30 WIB',
      sessions: [
        'Brunch & Kopi Pagi (10.00 – 12.00 WIB)',
        'Makan Siang / Lunch (12.00 – 14.00 WIB)',
        'Santai Sore / Afternoon Dining (14.00 – 16.30 WIB)',
      ],
      packages: [
        {
          id: 'casual-dining',
          name: 'Paket Santap Harian Reguler',
          basePrice: 55000,
          perPersonPricing: true,
          desc: 'Pilihan hidangan utama + minuman segar (Kisaran Rp 50.000–75.000 / orang).',
        },
        {
          id: 'signature-feast',
          name: 'Paket Signature Eatery & Dessert',
          basePrice: 75000,
          perPersonPricing: true,
          desc: 'Hidangan utama spesial + appetizer/snack + kopi/minuman & dessert.',
        },
        {
          id: 'table-only',
          name: 'Reservasi Meja Saja (Pesan di Tempat)',
          basePrice: 0,
          perPersonPricing: false,
          desc: 'Booking tempat duduk Indoor / Outdoor Seating gratis, bayar sesuai pesanan di lokasi.',
        },
      ],
    },
    survey: {
      label: 'Survey Lokasi & Food Tasting',
      step1Title: 'Pilih Jenis Kunjungan Survey',
      minGuests: 2,
      maxGuests: 10,
      stepGuests: 1,
      defaultGuests: 4,
      showAddons: false,
      depositNote: 'Gratis 100% — Didampingi koordinator venue Reve Space',
      sessions: [
        'Sesi Pagi (10.00 – 12.00 WIB)',
        'Sesi Siang (13.00 – 15.00 WIB)',
        'Sesi Sore Sebelum Tutup (15.00 – 16.30 WIB)',
      ],
      packages: [
        {
          id: 'venue-tour',
          name: 'Private Venue Tour & Konsultasi Paket',
          basePrice: 0,
          perPersonPricing: false,
          desc: 'Keliling area Indoor & Outdoor Jl. Damai Raya No.16 bersama tim Reve Space.',
        },
        {
          id: 'food-tasting',
          name: 'Survey Venue + Sesi Food Tasting Katering',
          basePrice: 0,
          perPersonPricing: false,
          desc: 'Survey lokasi sekaligus mencicipi sampel menu buffet katering pernikahan.',
        },
      ],
    },
  };

  // State
  let currentMode = 'wedding';
  let selectedPackageId = 'royal';
  let currentCalYear = 2026;
  let currentCalMonth = 10; // 0-indexed: 10 = November 2026
  let selectedDateStr = '2026-11-21';

  // DOM Elements
  const tabButtons = document.querySelectorAll('.booking-tab-btn');
  const step1Heading = document.getElementById('step1Heading');
  const tierSelectorGrid = document.getElementById('tierSelectorGrid');
  const bookingGuests = document.getElementById('bookingGuests');
  const guestCountLabel = document.getElementById('guestCountLabel');
  const guestMinText = document.getElementById('guestMinText');
  const guestMaxText = document.getElementById('guestMaxText');
  const bookingArea = document.getElementById('bookingArea');
  const selectedDateInput = document.getElementById('selectedDateInput');
  const bookingSession = document.getElementById('bookingSession');
  const addonsContainer = document.getElementById('addonsContainer');
  const addonsGrid = document.getElementById('addonsGrid');

  // Calendar Elements
  const calendarMonthLabel = document.getElementById('calendarMonthLabel');
  const calendarDaysGrid = document.getElementById('calendarDaysGrid');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');

  // Summary Elements
  const summaryModeText = document.getElementById('summaryModeText');
  const summaryPackageText = document.getElementById('summaryPackageText');
  const summaryDateText = document.getElementById('summaryDateText');
  const summarySessionText = document.getElementById('summarySessionText');
  const summaryAreaText = document.getElementById('summaryAreaText');
  const summaryGuestsText = document.getElementById('summaryGuestsText');
  const summaryAddonsRow = document.getElementById('summaryAddonsRow');
  const summaryAddonsText = document.getElementById('summaryAddonsText');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const summaryDepositNote = document.getElementById('summaryDepositNote');
  const directWaBtn = document.getElementById('directWaBtn');

  function formatRupiah(amount) {
    if (amount === 0) return 'Gratis (Rp 0)';
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const pkgParam = params.get('pkg');
    const guestsParam = params.get('guests');
    const dateParam = params.get('date');
    const areaParam = params.get('area');

    if (typeParam && BOOKING_MODES[typeParam]) {
      currentMode = typeParam;
    }

    const modeObj = BOOKING_MODES[currentMode];
    if (pkgParam && modeObj.packages.some((p) => p.id === pkgParam)) {
      selectedPackageId = pkgParam;
    } else {
      selectedPackageId = modeObj.packages[0].id;
      if (currentMode === 'wedding' && !pkgParam) {
        selectedPackageId = 'royal';
      }
    }

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      selectedDateStr = dateParam;
      const parts = dateParam.split('-').map(Number);
      currentCalYear = parts[0];
      currentCalMonth = parts[1] - 1;
    }

    if (areaParam && bookingArea) {
      if (areaParam === 'outdoor') bookingArea.selectedIndex = 1;
      if (areaParam === 'indoor') bookingArea.selectedIndex = 2;
    }

    renderBookingMode(guestsParam ? parseInt(guestsParam, 10) : null);
  }

  function renderBookingMode(overrideGuests) {
    const modeConfig = BOOKING_MODES[currentMode];

    // Update active tab UI
    tabButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-mode') === currentMode;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });

    if (step1Heading) step1Heading.textContent = modeConfig.step1Title;

    // Render Tier Option Cards
    if (tierSelectorGrid) {
      tierSelectorGrid.innerHTML = '';
      modeConfig.packages.forEach((pkg) => {
        const isSelected = pkg.id === selectedPackageId;
        const card = document.createElement('label');
        card.className = `tier-option ${isSelected ? 'selected' : ''}`;
        const priceDisplay = pkg.perPersonPricing
          ? `${formatRupiah(pkg.basePrice)} / pax`
          : formatRupiah(pkg.basePrice);

        card.innerHTML = `
          <input type="radio" name="packageTier" value="${pkg.id}" ${isSelected ? 'checked' : ''} />
          <div class="tier-option-header">
            <span class="tier-option-title">${pkg.name}</span>
            <span class="tier-option-price">${priceDisplay}</span>
          </div>
          <p class="tier-option-desc">${pkg.desc}</p>
        `;

        card.addEventListener('click', () => {
          selectedPackageId = pkg.id;
          if (pkg.baseGuests && currentMode === 'wedding') {
            bookingGuests.value = String(pkg.baseGuests);
          }
          renderTierSelectionState();
          updateSummaryAndPrice();
        });

        tierSelectorGrid.appendChild(card);
      });
    }

    // Configure Guest Slider
    if (bookingGuests) {
      bookingGuests.min = String(modeConfig.minGuests);
      bookingGuests.max = String(modeConfig.maxGuests);
      bookingGuests.step = String(modeConfig.stepGuests);
      const targetVal = overrideGuests
        ? Math.min(Math.max(overrideGuests, modeConfig.minGuests), modeConfig.maxGuests)
        : modeConfig.defaultGuests;
      bookingGuests.value = String(targetVal);
      if (guestMinText) guestMinText.textContent = `Min ${modeConfig.minGuests} Orang`;
      if (guestMaxText) guestMaxText.textContent = `Maks ${modeConfig.maxGuests} Orang`;
    }

    // Configure Sessions Dropdown
    if (bookingSession) {
      bookingSession.innerHTML = '';
      modeConfig.sessions.forEach((sess) => {
        const opt = document.createElement('option');
        opt.value = sess;
        opt.textContent = sess;
        bookingSession.appendChild(opt);
      });
    }

    // Show or hide Wedding Add-ons
    if (addonsContainer) {
      addonsContainer.style.display = modeConfig.showAddons ? 'block' : 'none';
    }

    renderCalendar();
    updateSummaryAndPrice();
  }

  function renderTierSelectionState() {
    if (!tierSelectorGrid) return;
    tierSelectorGrid.querySelectorAll('.tier-option').forEach((card) => {
      const input = card.querySelector('input');
      const isSelected = input && input.value === selectedPackageId;
      card.classList.toggle('selected', Boolean(isSelected));
      if (input) input.checked = Boolean(isSelected);
    });
  }

  /* ------------------------------------------------------------------------
     6. INTERACTIVE AVAILABILITY CALENDAR
     ------------------------------------------------------------------------ */
  const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Sample pre-booked wedding dates to make availability realistic
  const PRE_BOOKED_DATES = new Set([
    '2026-11-14',
    '2026-11-28',
    '2026-12-05',
    '2026-12-19',
    '2027-01-09',
  ]);

  function renderCalendar() {
    if (!calendarDaysGrid || !calendarMonthLabel) return;
    calendarMonthLabel.textContent = `${MONTH_NAMES_ID[currentCalMonth]} ${currentCalYear}`;
    calendarDaysGrid.innerHTML = '';

    const firstDayOfMonth = new Date(currentCalYear, currentCalMonth, 1).getDay();
    const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptySlot = document.createElement('span');
      calendarDaysGrid.appendChild(emptySlot);
    }

    const bookedDatesSet = getConfirmedBookedDates();

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(day);

      const mStr = String(currentCalMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const fullDate = `${currentCalYear}-${mStr}-${dStr}`;

      const dateObj = new Date(currentCalYear, currentCalMonth, day);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isBooked = currentMode === 'wedding' && bookedDatesSet.has(fullDate);

      if (isBooked) {
        btn.classList.add('booked');
        btn.disabled = true;
        btn.title = 'Tanggal ini sudah penuh untuk acara Wedding';
      } else {
        if (isWeekend) {
          btn.classList.add('high-demand');
          btn.title = 'Akhir Pekan (Tersedia - Segera Amankan Slot)';
        }
        if (fullDate === selectedDateStr) {
          btn.classList.add('selected');
        }
        btn.addEventListener('click', () => {
          selectedDateStr = fullDate;
          if (selectedDateInput) selectedDateInput.value = fullDate;
          renderCalendar();
          updateSummaryAndPrice();
        });
      }

      calendarDaysGrid.appendChild(btn);
    }

    if (selectedDateInput) {
      selectedDateInput.value = selectedDateStr;
    }
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentCalMonth--;
      if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
      }
      renderCalendar();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentCalMonth++;
      if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
      }
      renderCalendar();
    });
  }

  if (selectedDateInput) {
    selectedDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        selectedDateStr = e.target.value;
        const parts = selectedDateStr.split('-').map(Number);
        currentCalYear = parts[0];
        currentCalMonth = parts[1] - 1;
        renderCalendar();
        updateSummaryAndPrice();
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. LIVE PRICE ESTIMATOR & SUMMARY UPDATER
     ------------------------------------------------------------------------ */
  function calculateCurrentBookingDetails() {
    const modeConfig = BOOKING_MODES[currentMode];
    const pkg =
      modeConfig.packages.find((p) => p.id === selectedPackageId) ||
      modeConfig.packages[0];
    const guests = parseInt(bookingGuests ? bookingGuests.value : '100', 10);
    const area = bookingArea ? bookingArea.value : 'Full Area';
    const session = bookingSession ? bookingSession.value : modeConfig.sessions[0];

    let total = 0;
    const selectedAddons = [];

    if (currentMode === 'wedding') {
      total = pkg.basePrice;
      if (guests > pkg.baseGuests) {
        total += (guests - pkg.baseGuests) * pkg.extraPerPax;
      }

      if (addonsGrid) {
        addonsGrid.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
          total += parseInt(cb.value || '0', 10);
          selectedAddons.push(cb.getAttribute('data-name') || 'Add-on');
        });
      }
    } else if (currentMode === 'eatery') {
      if (pkg.perPersonPricing) {
        total = pkg.basePrice * guests;
      } else {
        total = 0;
      }
    } else {
      total = 0;
    }

    return {
      modeLabel: modeConfig.label,
      packageName: pkg.name,
      date: selectedDateStr,
      session,
      area,
      guests,
      selectedAddons,
      total,
      depositNote: modeConfig.depositNote,
    };
  }

  function updateSummaryAndPrice() {
    const details = calculateCurrentBookingDetails();

    if (guestCountLabel) guestCountLabel.textContent = String(details.guests);
    if (summaryModeText) summaryModeText.textContent = details.modeLabel;
    if (summaryPackageText) summaryPackageText.textContent = details.packageName;
    if (summaryDateText) summaryDateText.textContent = details.date;
    if (summarySessionText) summarySessionText.textContent = details.session;
    if (summaryAreaText) summaryAreaText.textContent = details.area;
    if (summaryGuestsText) summaryGuestsText.textContent = `${details.guests} Orang / Pax`;

    if (summaryAddonsRow && summaryAddonsText) {
      if (currentMode === 'wedding') {
        summaryAddonsRow.style.display = 'flex';
        summaryAddonsText.textContent =
          details.selectedAddons.length > 0
            ? details.selectedAddons.join(', ')
            : 'Tidak ada';
      } else {
        summaryAddonsRow.style.display = 'none';
      }
    }

    if (summaryTotalAmount) {
      summaryTotalAmount.textContent = formatRupiah(details.total);
    }
    if (summaryDepositNote) {
      summaryDepositNote.textContent = details.depositNote;
    }
  }

  // Event Listeners for Controls
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const newMode = btn.getAttribute('data-mode');
      if (newMode && BOOKING_MODES[newMode]) {
        currentMode = newMode;
        selectedPackageId = BOOKING_MODES[newMode].packages[0].id;
        renderBookingMode();
      }
    });
  });

  if (bookingGuests) {
    bookingGuests.addEventListener('input', updateSummaryAndPrice);
  }
  if (bookingArea) {
    bookingArea.addEventListener('change', updateSummaryAndPrice);
  }
  if (bookingSession) {
    bookingSession.addEventListener('change', updateSummaryAndPrice);
  }
  if (addonsGrid) {
    addonsGrid.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const parentLabel = cb.closest('.addon-item');
        if (parentLabel) parentLabel.classList.toggle('checked', cb.checked);
        updateSummaryAndPrice();
      });
    });
  }

  function buildWhatsAppUrl(bookingRecord) {
    const lines = [
      `Halo Admin *Reve Space* (Jl. Damai Raya No.16, Petukangan Selatan),`,
      `Saya ingin melakukan konfirmasi reservasi / booking dengan detail berikut:`,
      ``,
      `📌 *Kode Booking:* ${bookingRecord.refCode}`,
      `👤 *Nama Pemesan:* ${bookingRecord.customerName}`,
      `📞 *No. WhatsApp:* ${bookingRecord.customerPhone}`,
      `🏷️ *Kategori:* ${bookingRecord.modeLabel}`,
      `✨ *Paket / Layanan:* ${bookingRecord.packageName}`,
      `📅 *Tanggal:* ${bookingRecord.date}`,
      `🕒 *Sesi Waktu:* ${bookingRecord.session}`,
      `🏛️ *Area Pilihan:* ${bookingRecord.area}`,
      `👥 *Jumlah Tamu:* ${bookingRecord.guests} Orang`,
      bookingRecord.selectedAddons && bookingRecord.selectedAddons.length > 0
        ? `➕ *Tambahan:* ${bookingRecord.selectedAddons.join(', ')}`
        : null,
      `💰 *Estimasi Biaya:* ${formatRupiah(bookingRecord.total)}`,
      bookingRecord.notes ? `📝 *Catatan:* ${bookingRecord.notes}` : null,
      ``,
      `Mohon informasi ketersediaan slot pada tanggal tersebut. Terima kasih!`,
    ].filter(Boolean);

    return `https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  if (directWaBtn) {
    directWaBtn.addEventListener('click', () => {
      const details = calculateCurrentBookingDetails();
      const record = {
        ...details,
        refCode: 'KONSULTASI-WEB',
        customerName: document.getElementById('customerName')?.value || 'Calon Tamu Reve Space',
        customerPhone: document.getElementById('customerPhone')?.value || '-',
        notes: document.getElementById('customerNotes')?.value || '',
      };
      window.open(buildWhatsAppUrl(record), '_blank', 'noopener');
    });
  }

  /* ------------------------------------------------------------------------
     8. FORM SUBMISSION, MODAL (<dialog>) & LOCALSTORAGE HISTORY
     ------------------------------------------------------------------------ */
  const bookingSuccessModal = document.getElementById('bookingSuccessModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const doneModalBtn = document.getElementById('doneModalBtn');
  const printBookingBtn = document.getElementById('printBookingBtn');

  fullBookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const emailInput = document.getElementById('customerEmail');
    const notesInput = document.getElementById('customerNotes');

    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
      nameInput.reportValidity();
      phoneInput.reportValidity();
      return;
    }

    const details = calculateCurrentBookingDetails();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const refCode = `RV-2026-${randomDigits}`;

    const bookingRecord = {
      refCode,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customerName: nameInput.value.trim(),
      customerPhone: phoneInput.value.trim(),
      customerEmail: emailInput ? emailInput.value.trim() : '',
      notes: notesInput ? notesInput.value.trim() : '',
      ...details,
    };

    saveBookingToStorage(bookingRecord);
    renderSavedBookings();

    // Populate Confirmation Modal
    document.getElementById('modalCustomerName').textContent = bookingRecord.customerName;
    document.getElementById('modalRefCode').textContent = bookingRecord.refCode;
    document.getElementById('modalPackageName').textContent = bookingRecord.packageName;
    document.getElementById('modalDateSession').textContent = `${bookingRecord.date} · ${bookingRecord.session}`;
    document.getElementById('modalGuestsArea').textContent = `${bookingRecord.guests} Orang · ${bookingRecord.area}`;
    document.getElementById('modalTotalCost').textContent = formatRupiah(bookingRecord.total);

    const modalWaLink = document.getElementById('modalWhatsappLink');
    if (modalWaLink) {
      modalWaLink.href = buildWhatsAppUrl(bookingRecord);
    }

    if (bookingSuccessModal && typeof bookingSuccessModal.showModal === 'function') {
      bookingSuccessModal.showModal();
    }
  });

  if (closeModalBtn && bookingSuccessModal) {
    closeModalBtn.addEventListener('click', () => bookingSuccessModal.close());
  }
  if (doneModalBtn && bookingSuccessModal) {
    doneModalBtn.addEventListener('click', () => bookingSuccessModal.close());
  }
  if (printBookingBtn) {
    printBookingBtn.addEventListener('click', () => window.print());
  }

  function renderSavedBookings() {
    const listEl = document.getElementById('savedBookingsList');
    if (!listEl) return;

    const saved = getBookingsFromStorage();

    if (saved.length === 0) {
      listEl.innerHTML = `
        <div class="package-card" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">
            Belum ada riwayat pengajuan reservasi di perangkat ini. Silakan lengkapi formulir di atas untuk membuat kode booking.
          </p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    saved.forEach((item) => {
      const status = item.status || 'Pending';
      const badgeClass =
        status === 'Confirmed'
          ? 'badge-confirmed'
          : status === 'Completed'
          ? 'badge-completed'
          : status === 'Cancelled'
          ? 'badge-cancelled'
          : 'badge-pending';
      const statusLabel =
        status === 'Confirmed'
          ? '✅ Terkonfirmasi / DP Masuk'
          : status === 'Completed'
          ? '🎉 Acara Selesai'
          : status === 'Cancelled'
          ? '❌ Dibatalkan'
          : '⏳ Menunggu Konfirmasi Admin';

      const card = document.createElement('div');
      card.className = 'package-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="package-tier" style="margin-bottom: 0;">${item.refCode} · ${item.createdAt}</span>
          <span class="badge-status ${badgeClass}">${statusLabel}</span>
        </div>
        <h3 class="package-name" style="font-size: 1.45rem;">${item.packageName}</h3>
        <div class="package-price" style="font-size: 1.65rem;">${formatRupiah(item.total)}</div>
        <p class="package-unit">${item.customerName} (${item.customerPhone})</p>
        <ul class="package-features" style="margin-bottom: 1.25rem;">
          <li><span class="check">📅</span> <span>${item.date} — ${item.session}</span></li>
          <li><span class="check">🏛️</span> <span>${item.area} (${item.guests} Orang)</span></li>
        </ul>
        <a href="${buildWhatsAppUrl(item)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width: 100%;">
          💬 Kirim Ulang ke WhatsApp
        </a>
      `;
      listEl.appendChild(card);
    });
  }

  window.addEventListener('storage', () => {
    renderCalendar();
    renderSavedBookings();
  });

  // Initialize Booking Page
  parseQueryParams();
  renderSavedBookings();
})();

