// i18n dictionary. Primary language: EN. DE/FR/ES are machine-translated —
// review with a native speaker before launch (ES: VR-ES-MACHINE-TRANSLATED). Structural data (prices, posters, ids) lives in
// lib/catalog.ts; all user-facing text lives here.

export type Lang = 'EN' | 'DE' | 'FR' | 'ES'

export const translations: Record<Lang, Record<string, any>> = {
  EN: {
    announce: { shipping: 'Free shipping over {amount}', personalized: 'Personalized from your birth data', freeActivated: '✓ Free Shipping Activated ✦ A symbolic artwork inspired by your birth data', fallback: 'Premium personalized prints. Secure checkout. Refined local production.' },
    preview: { announce: 'Preview — our shop is launching soon ✦', notForSale: 'Preview — not yet available for purchase', soon: 'Coming soon' },
    // Noon-fallback disclosure (REQ-018). Rendered by the personalization form
    // (near the birth-time field) and by the cart/summary. Stable keys for the
    // next coder; honest framing — discloses the assumption, never claims a
    // precise computed chart.
    noonFallback: {
      fieldHint: 'If your birth time is unknown, we use 12:00 PM (noon) — this can influence the result.',
      summaryNotice: 'Birth time unknown: composed using 12:00 PM (noon) as the default — this can influence the result.',
    },
    nav: { home: 'Home', tagline: 'Astrology · Art · Atelier', startPersonalizing: 'Start Personalizing', poster: 'Personalized Posters', collections: 'Collections', gifts: 'Gifts', tcm: 'TCM', bundles: 'Bundles', digital: 'Digital', blog: 'Blog', wissen: 'Knowledge', faq: 'FAQ', about: 'About', contact: 'Contact', menu: 'Menu', open: 'Open menu', close: 'Close', cart: 'Cart',
      // Shop-oriented primary navigation (REQ-003 / T-201) — the exact 8 entries
      // in spec order. FAQ/About/Contact/Blog are intentionally NOT here.
      primary: { bestseller: 'Bestsellers', new: 'New In', posters: 'Posters', tcm: 'TCM Posters', wuxing: 'Wuxing', offers: 'Offers', posterSets: 'Poster Sets', inspiration: 'Inspiration' },
      posterMenu: { bazi: 'Personalized BaZi Posters', birthChart: 'Personalized Birth Chart Posters', couple: 'Personalized Couple Compatibility Posters', fireHorse: 'Fire Horse 2026 Edition', tcm: 'TCM Educational Posters', digital: 'Digital Analysis PDFs', bundles: 'Bundles', gifts: 'Gift Collection' },
      mega: {
        personalized: { title: 'Personalized Posters', baziPosters: 'BaZi Posters', personalizedPosters: 'All Personalized', compatibility: 'Couple Compatibility', startPersonalizing: 'Start Personalizing' },
        tcm: { title: 'TCM Posters', tcmPosters: 'TCM Educational Posters' },
        wuxing: { title: 'Wuxing Posters', wuxingPosters: 'Five Elements' },
        analysis: { title: 'Analysis PDFs', analysisPdfs: 'Digital BaZi Analysis' },
        bundles: { title: 'Bundles', bundles: 'Bundles & Sets' },
        featured: { title: 'Featured', fireHorse: 'Fire Horse 2026', inspiration: 'Inspiration Gallery', allCollections: 'View all collections' },
        // Asset-light promo tiles (REQ-004 / T-203). Text-forward: title + CTA;
        // the image field is a generic placeholder until OQ-001 resolves.
        tiles: {
          ctaShop: 'Shop now', ctaExplore: 'Explore', ctaPersonalize: 'Personalize',
          posters: { baziTitle: 'Personalized BaZi Posters', baziCta: 'Personalize', personalizedTitle: 'All Personalized Posters', personalizedCta: 'Explore' },
          tcm: { eduTitle: 'TCM Educational Posters', eduCta: 'Shop now', practiceTitle: 'For Practice & Studio', practiceCta: 'Explore' },
          wuxing: { fiveTitle: 'Five Elements Poster', fiveCta: 'Shop now', balanceTitle: 'Wuxing Balance Series', balanceCta: 'Explore' },
        },
      } },
    offers: {
      eyebrow: 'Offers', title: 'Offers & Editions',
      intro: 'A curated hub of our worlds — each section gathers a real selection you can shop straight away. No fake countdowns, no invented discounts: every price is the product’s own.',
      placeholderLabel: 'Placeholder — campaign visuals follow',
      sections: {
        bundles: { eyebrow: 'Curated sets', title: 'Bundles & Sets', text: 'Coordinated poster sets for practice, studio and home — curated to pair well together.', cta: 'Shop all bundles' },
        'fire-horse': { eyebrow: 'Limited edition', title: 'Fire Horse 2026', text: 'The numbered, signed edition for the Year of the Fire Horse — while stock lasts.', cta: 'View the edition' },
        bazi: { eyebrow: 'Personalized', title: 'Personalized BaZi Posters', text: 'Symbolic Four-Pillars artwork composed from the birth data you enter — made to order.', cta: 'Shop BaZi posters' },
        tcm: { eyebrow: 'Ready to ship', title: 'TCM Knowledge Posters', text: 'Curated teaching graphics for practice and home — standard products, no birth data, ships right away.', cta: 'Shop TCM posters' },
      },
    },
    hero: { eyebrow: 'PERSONALIZED ASTROLOGY POSTERS', title1: 'Your', title2: 'Birth Chart', subtitle: 'Enter your birth details and create a premium personalized BaZi or Birth Chart poster designed specifically for you.', cta1: 'Start Personalizing', cta2: 'Explore Collections' },
    personalize: {
      eyebrow: 'Personalize', title: 'Create your personalized poster', intro: 'Enter your birth details, choose your design and we generate a premium poster made specifically for you.',
      chooseType: '1 · Choose your poster', from: 'from',
      types: {
        bazi: { name: 'Personalized BaZi Poster', sub: 'Your Four Pillars chart from birth date, time & place.' },
        birthchart: { name: 'Personalized Birth Chart Poster', sub: 'Your personal star chart as refined wall art.' },
        couple: { name: 'Couple Compatibility Poster', sub: 'Two charts, one shared piece — for partners.' },
        firehorse: { name: 'Fire Horse 2026 Edition', sub: 'Limited edition for the Year of the Fire Horse.' },
        digital: { name: 'Digital Analysis PDF', sub: '10–15 page PDF analysis of your chart.' },
        bundle: { name: 'Poster + Digital Analysis', sub: 'Your poster plus the full PDF analysis.' },
      },
      birthHeading: '2 · Your birth data', birthHeadingA: '2 · Person A — birth data', birthHeadingB: 'Person B — birth data',
      unknownTime: 'I don’t know my birth time', unknownTimeHint: 'If you do not know your exact birth time, we use 12:00 noon as the default assumption. Your poster will be composed based on this fallback value.',
      langHeading: '3 · Poster language',
      designHeading: '4 · Design', frameWord: 'Frame colour', paletteWord: 'Background palette', posterBgHeading: 'Poster background', sizeHeading: 'Size',
      pdfAddon: 'Add the digital PDF analysis', pdfNote: 'A 10–15 page personal analysis of your chart, delivered as a download.', pdfBadge: 'Digital PDF',
      summaryHeading: '5 · Review your personalization', sumType: 'Product', partnerName: 'Partner', timeUnknown: 'Unknown — 12:00 PM default', sumLang: 'Language', sumDesign: 'Design', sumSize: 'Size', sumPrice: 'Price',
      previewCertainty: 'What you see here is what will be used for your personalized order. Review your details carefully before ordering.',
      trustData: 'Created from your birth data', trustLogic: 'Composed into a symbolic artwork', trustPreview: 'Preview before ordering', trustPremium: 'Premium print quality',
      errFix: 'Please complete the highlighted birth-data fields before adding to cart.',
      addToCart: 'Add Personalized Poster to Cart',
    },
    trust: {
      apiTitle: 'Made from your data', apiSub: 'A symbolic artwork inspired by your birth data',
      deliveryTitle: '5–7 Day Delivery', deliverySub: 'Worldwide, tracked',
      secureTitle: 'Stripe Secure', secureSub: 'Encrypted checkout',
      artTitle: 'Premium Art', artSub: 'Museum-grade archival print',
      payTitle: 'Secure payment',
    },
    path: {
      eyebrow: 'How it works', title: 'The Path To Your Poster',
      steps: [
        { title: 'Enter Your Birth Details', desc: 'Your date, time and place of birth — your partner’s too for a couple chart.' },
        { title: 'We Compose Your Artwork', desc: 'We take your birth data and compose a personal, symbolic artwork inspired by it.' },
        { title: 'Preview & Add To Cart', desc: 'See a live preview and a full summary of every detail before you order.' },
        { title: '5–7 Day Delivery', desc: 'Made to order, then climate-neutral shipping worldwide in 5–7 days.' },
      ],
    },
    catalog: { title: 'The Collection', more: 'See the full collection →' },
    carousel: { prev: 'Previous product', next: 'Next product', goto: 'Go to product', hint: 'Swipe to explore' },
    search: { placeholder: 'Search products, collections, posters…', hint: 'Try “BaZi”, “Birth Chart”, “Couple”, “Fire Horse”, “Gift”…', noResults: 'No matching results', error: 'Search is temporarily unavailable', products: 'Posters', collections: 'Collections', gifts: { wedding: 'Wedding Gift Ideas', birthday: 'Birthday Gift Ideas', anniversary: 'Anniversary Gift Ideas', baby: 'Baby Shower Gift Ideas', newbeginning: 'New Beginning Gifts', studio: 'Practice & Studio Gifts' } },
    auth: {
      account: 'Account', loginTitle: 'Welcome back', createTitle: 'Create your profile', forgotTitle: 'Reset your password', resetTitle: 'Set a new password',
      subtitle: 'Sign in to view your orders and account.',
      email: 'Email address', password: 'Password', newPassword: 'New password',
      marketingConsent: 'I agree to receive weekly energy charts, product insights, product launch announcements and marketing emails from SizhuAtelier. I can unsubscribe at any time.',
      loginCta: 'Log in', createCta: 'Create profile', forgotCta: 'Send reset link', resetCta: 'Set new password',
      toSignup: 'Create a profile', toLogin: 'Back to log in', toForgot: 'Forgot password?',
      resetSent: 'If that email exists, a reset link is on its way.', resetDone: 'Your password has been updated.',
      dashboardTitle: 'Your Profile', logout: 'Log out', emailLabel: 'Email', newsletterStatus: 'Newsletter', marketingPrefs: 'Marketing preferences', saved: 'Saved ✦', orderHistory: 'Order history', noOrders: 'No orders yet.',
      err: { invalid_email: 'Please enter a valid email address.', weak_password: 'Password must be at least 8 characters.', email_taken: 'An account with this email already exists.', invalid_credentials: 'Wrong email or password.', auth_unconfigured: 'Accounts are not available yet.', invalid_token: 'This reset link is invalid or has expired.', unauthorized: 'Please log in again.', wrong_password: 'Your current password is incorrect.', payment_unconfigured: 'Payment is not configured yet.', rate_limited: 'Too many attempts — please wait a moment and try again.', server_error: 'Something went wrong — please try again.', network_error: 'Network error — please try again.' },
    },
    account: {
      personalDetails: 'Personal details', name: 'Name', namePh: 'Your name', language: 'Preferred language', save: 'Save', saved: 'Saved ✦', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', status: 'Status',
      changePassword: 'Change password', currentPassword: 'Current password', newPassword: 'New password', updatePassword: 'Update password', passwordChanged: 'Password updated ✦',
      shippingAddresses: 'Shipping addresses', billingAddress: 'Billing address', addAddress: 'Add address', editAddress: 'Edit address', setDefault: 'Set as default', default: 'Default', noAddresses: 'No addresses saved yet.', sameAsShipping: 'Billing address same as shipping',
      fullName: 'Full name', line1: 'Address line 1', line2: 'Address line 2 (optional)', postalCode: 'Postal code', city: 'City', region: 'State / region (optional)', country: 'Country (2-letter, e.g. DE)', phone: 'Phone (optional)',
      paymentMethods: 'Payment methods', paymentDesc: 'Your saved cards are managed securely by Stripe. We never store card numbers.', managePayments: 'Manage payment methods', paymentNone: 'No saved payment methods yet — add one at checkout.', paymentUnavailable: 'Payment management is not available yet.',
      preferences: 'Preferences',
    },
    card: { bought: 'bought', reviews: 'reviews', sold: 'sold', personalize: 'Personalize', personalLine: 'Created from your birth date, time & place.', shop: 'Shop this poster' },
    coll: {
      allPosters: 'All personalized posters',
      cards: {
        bazi: { title: 'Personalized BaZi Posters', desc: 'Turn your Four Pillars chart into a premium personalized wall print.', cta: 'Start Personalizing' },
        birthchart: { title: 'Personalized Birth Chart Posters', desc: 'Your personal star chart, designed as refined wall art.', cta: 'Start Personalizing' },
        couple: { title: 'Couple Compatibility Posters', desc: 'Two charts, one shared piece — made for partners.', cta: 'Start Personalizing' },
        firehorse: { title: 'Fire Horse 2026 Edition', desc: 'A limited collector’s edition for the Year of the Fire Horse — ships ready to hang.', cta: 'Shop this poster' },
        digital: { title: 'Digital Analysis PDFs', desc: 'A 10–15 page personal analysis of your chart, as a download.', cta: 'Explore' },
        bundles: { title: 'Bundles', desc: 'Poster + digital analysis, combined at a special price.', cta: 'Explore' },
        gifts: { title: 'Gift Collection', desc: 'A meaningful personalized poster — made for someone you love.', cta: 'Start Personalizing' },
      },
    },
    bundles: { eyebrow: 'Take more, pay less', title: 'Bundles', sub: 'Curated sets — posters and digital analysis combined, at a special price.', add: 'Add set to cart', save: 'Save' },
    newsletter: { eyebrow: 'The Atelier Circle', title: 'The Cosmic Pulse — Your Weekly Energy Charts', copy: 'Align your days with celestial inspiration. Subscribe to receive our weekly Energy Charts straight to your inbox — a reflective astrological reading of the current cosmic shifts, offering you a weekly energetic outlook for the days ahead. You’ll also be first to receive our marketing updates — new product launches, collections and exclusive offers. ✨ No spam, just relevant insights.', benefits: ['Weekly Energy Charts to your inbox', 'New product & collection launches', 'Seasonal gift-idea campaigns'], placeholder: 'Your email address', langPref: 'Emails in', button: 'Subscribe', consent: 'I agree to receive weekly energy charts, product insights, product launch announcements and marketing emails from SizhuAtelier. I can unsubscribe at any time. See our', privacy: 'Privacy Policy', success: 'Welcome to the Atelier Circle — check your inbox to confirm your subscription.', error: 'Something went wrong — please try again.', consentErr: 'Please accept the terms to continue.', fine: 'Double opt-in · unsubscribe anytime' },
    wissen: { eyebrow: 'Blog', title: 'What lies behind BaZi', sub: 'Background for your consultations and for anyone who wants to understand their poster.', read: 'Read more →' },
    gifts: {
      eyebrow: 'Gift Ideas', title: 'Find a Personalized Gift With Meaning', sub: 'Created from real birth data — refined, intentional and made for one person. Or a ready-to-hang educational poster for a practice or studio.',
      personalizedTag: 'Personalized', shopTag: 'Ready to ship', ctaPersonalize: 'Create a Personalized Gift', ctaShop: 'Shop This Gift',
      cards: {
        wedding: { title: 'Wedding Gifts', copy: 'A meaningful wedding gift created around two people, their connection and their shared symbolic story.' },
        birthday: { title: 'Birthday Gifts', copy: 'A personal gift created from birth data — designed to feel intentional, refined and made for one person.' },
        anniversary: { title: 'Anniversary Gifts', copy: 'Celebrate a shared story with a visual piece based on personal birth data and symbolic compatibility.' },
        baby: { title: 'Baby Shower Gifts', copy: 'A refined keepsake for a new life chapter, created from the baby’s birth details. Birth time unknown? We use a 12:00 PM default.' },
        newbeginning: { title: 'New Beginning Gifts', copy: 'For a move, a new job, a new year or a personal reset — a symbolic visual reminder of direction and renewal.' },
        spiritual: { title: 'Spiritual Gifts', copy: 'A contemplative Five Elements piece created from personal birth data — for meditation corners and mindful spaces.' },
        couple: { title: 'Couple Gifts', copy: 'Two charts in one shared artwork — a compatibility poster made for partners from both birth details.' },
        housewarming: { title: 'Housewarming Gifts', copy: 'The limited Fire Horse 2026 edition — a striking, ready-to-hang piece to mark a new home. Ships ready to frame.' },
        wellness: { title: 'Wellness Studio Gifts', copy: 'Calming educational wall art for treatment and rest rooms — explaining the Five Elements with visual clarity. Ready to ship.' },
        yoga: { title: 'Yoga Studio Gifts', copy: 'Grounding teaching posters for studio walls — earthy, clear and ready to hang. Not personalized.' },
        tcmpractice: { title: 'TCM Practice Gifts', copy: 'Educational posters for TCM practices and treatment rooms — calm, professional and ready to frame.' },
      },
      faqTitle: 'Gift FAQ',
      faqs: [
        { q: 'Which gifts are personalized?', a: 'BaZi, Birth Chart and Couple Compatibility posters are created from birth data. Fire Horse and TCM educational posters ship ready to hang and are not personalized.' },
        { q: 'What if I don’t know the recipient’s birth time?', a: 'No problem — choose “I don’t know my birth time” and we use 12:00 noon as the default assumption.' },
        { q: 'Can I send it directly as a gift?', a: 'Add a personalized poster or an educational poster to your cart and check out as usual.' },
      ],
    },
    faq: { eyebrow: 'FAQ', title: 'Frequently asked questions', viewFull: 'View full FAQ' },
    faqHome: [
      { q: 'How is my poster personalized?', a: 'We take the birth date, time and place you enter and use them to compose a personal, symbolic artwork — a structured visual layout inspired by your birth data and made specifically for you.' },
      { q: 'What if I do not know my birth time?', a: 'No problem — choose “I don’t know my birth time” and we use 12:00 noon as the default assumption. Your poster is composed from that fallback value.' },
      { q: 'Will I see a preview or summary before ordering?', a: 'Yes — the personalization flow shows a live preview and a full summary of every detail before you add to cart.' },
      { q: 'How long does shipping take?', a: 'Production takes a few business days, then climate-neutral shipping (DE 1–2 days), worldwide.' },
      { q: 'Can I return a personalized poster?', a: 'Personalized items are made to order and cannot be returned once production has started. Your statutory rights remain for damaged, defective or incorrect items.' },
    ],
    // V2 homepage modules 03/06/07/08/09 + 12 (REQ-008 / REQ-012). Honest framing
    // only — symbolic artwork inspired by birth data; no precision/health claims.
    home: {
      world: {
        eyebrow: 'Shop by world', title: 'Find your product world', sub: 'Four curated worlds — from personalized birth-chart art to ready-to-hang teaching posters.',
        cards: {
          bazi: { title: 'BaZi Posters', desc: 'Personalized Four Pillars artwork, inspired by your birth data.' },
          tcm: { title: 'TCM Posters', desc: 'Curated teaching graphics of the Five Elements — ready to ship.' },
          wuxing: { title: 'Wuxing Posters', desc: 'The cycle of the Five Elements as a calm, atmospheric print.' },
          personalized: { title: 'Personalized Posters', desc: 'Every motif we compose from your birth data — made for you.' },
        },
        cta: 'Explore world',
      },
      firehorse: {
        eyebrow: 'Limited Edition · Featured', title: 'Fire Horse 2026', copy: 'The limited edition for the Year of the Fire Horse 2026 — numbered and signed, while stocks last. A striking collector’s piece, ready to hang.', cta: 'Discover Fire Horse 2026',
      },
      compatibility: {
        eyebrow: 'For couples', title: 'Compatibility posters for two', copy: 'Two birth charts brought together in one calm, symbolic artwork — inspired by your shared birth data. A personal gift for weddings, anniversaries and new homes.', ctaCollection: 'See couple posters', ctaPersonalize: 'Start a couple poster',
      },
      analysis: {
        eyebrow: 'Digital', title: 'Digital BaZi analysis as a PDF', copy: 'A personal 10–15 page PDF that captures your four pillars and the balance of the Five Elements — a captured reading of your inputs, available on its own or discounted with a poster.', cta: 'Explore the analysis PDFs',
      },
      inspiration: {
        eyebrow: 'Inspiration', title: 'See the posters in context', copy: 'Browse our curated inspiration wall — interior mockups and gift ideas that link straight to the matching collections and products.', cta: 'Open the inspiration gallery',
      },
      seo: {
        title: 'Personalized astrology posters, TCM & Wuxing wall art',
        intro: 'SizhuAtelier composes premium wall art from your birth data and curates educational posters around East-Asian symbolism. Every personalized motif is a symbolic artwork inspired by your birth data — not a fortune-telling tool and not medical advice.',
        sections: [
          { heading: 'Personalized BaZi posters online', body: 'A BaZi poster lays out the four pillars — year, month, day and hour of your birth — as a calm, personal diagram, inspired by the data you enter.', linkLabel: 'Shop BaZi posters', to: '/collections/bazi-posters' },
          { heading: 'TCM posters for practice, knowledge & home', body: 'Our TCM posters are curated teaching graphics of the Five Elements — designed for treatment rooms, studios and home. They explain and decorate; they make no health promise.', linkLabel: 'Shop TCM posters', to: '/collections/tcm-posters' },
          { heading: 'Wuxing and the Five Elements', body: 'The Wuxing poster shows how the five elements nourish and control one another — a calm, atmospheric knowledge graphic for practice and home.', linkLabel: 'Shop Wuxing posters', to: '/collections/wuxing-posters' },
          { heading: 'Couple & compatibility posters', body: 'Bring two birth charts together in one symbolic artwork — a personal gift inspired by your shared birth data.', linkLabel: 'Shop compatibility posters', to: '/collections/compatibility-posters' },
        ],
        knowledgeLabel: 'See the posters in context',
        knowledgeTo: '/inspiration',
        // OQ-007: structure is final; the keyword set is not. This is a marked
        // content TODO so no invented final keyword set is implied.
        keywordTodo: 'Content TODO (OQ-007): finalize the SEO keyword set with a native-language SEO review before launch; the H2 structure and internal links are in place.',
      },
    },
    apiTrust: {
      eyebrow: 'Personal', title: 'Why Your Poster Is Truly Personalized',
      copy: 'Every SizhuAtelier poster is composed from the birth details you provide. We turn your data into a structured visual foundation — a symbolic artwork inspired by your birth data, so your piece is not generic but made specifically for you.',
      badges: ['Created from birth data', 'Symbolic artwork, made for you', 'Personalized preview', 'Premium print quality', 'Made for you only'],
    },
    howItWorks: {
      eyebrow: 'How it works', title: 'From your birth data to wall art', cta: 'Start Personalizing',
      steps: [
        { title: 'Enter your birth details', desc: 'Your date, time and place of birth — your partner’s too for a couple chart.' },
        { title: 'We compose your artwork', desc: 'We turn your birth data into a structured visual foundation — a symbolic artwork inspired by it.' },
        { title: 'Choose your design', desc: 'Pick your palette, frame, size and poster language — with a live preview.' },
        { title: 'Preview, then we print', desc: 'Confirm what you see, and we produce your premium personalized wall art.' },
      ],
    },
    footer: { inspiration: 'Inspiration', howItWorks: 'How it works', about: 'About', contact: 'Contact', faq: 'FAQ', shipping: 'Shipping', returns: 'Returns & Withdrawal', terms: 'Terms', privacy: 'Privacy', impressum: 'Imprint', claim: 'Personalized from your birth data · climate-neutral shipping' },
    cart: { title: 'Cart', remaining: 'You’re only {amount} away from free shipping!', reached: 'Free shipping activated!', empty: 'Empty', emptyHint: 'Design your first BaZi poster.', toCollection: 'To the collection', alsoLike: 'You may also like', clear: 'Clear cart', remove: 'Remove', subtotal: 'Subtotal', shipFree: 'Free shipping', ship: 'Shipping {amount}', inclVat: '· incl. VAT', checkout: 'Checkout', ssl: '· SSL secured', toastAdded: 'Added to cart', toastSet: 'Set added to cart', editPersonalization: 'Edit personalization', unknownTimeNotice: 'Birth time: Unknown — composed with 12:00 noon as the default assumption', reviewBirth: 'Review your birth details above before checkout.', confirmLabel: 'I confirm that my personalization details are correct. If my birth time is unknown, I understand that 12:00 noon will be used as the default assumption.', returnNotice: 'Personalized items are made to order and cannot be returned or cancelled once production has started. This does not affect your statutory rights if an item arrives damaged, defective, incorrect or not as described.', incompleteWarn: 'Some items are missing required personalization details — please complete them before checkout.', signInPrompt: 'Sign in to use your saved address and payment method.', signInCta: 'Sign in' },
    checkout: { back: '← Back to cart', title: 'Checkout', expressHint: 'Express checkout — pay in seconds', orGuest: 'or pay as guest', contact: 'Contact & delivery', noAccount: '— no account needed', email: 'Email address', firstName: 'First name', lastName: 'Last name', street: 'Street & number', zip: 'ZIP', city: 'City', placeOrder: 'Place order now', noHidden: '🔒 No hidden costs · shipping & taxes shown below', summary: 'Your order', subtotal: 'Subtotal', shipping: 'Shipping', shipFree: 'Free shipping', total: 'Total', vat: 'incl. {amount} VAT (19%)', emptyTitle: 'Your cart is empty', toShop: 'To the shop', orderToast: 'Order confirmed — thank you! ✦', starting: 'Redirecting to secure checkout…', payError: 'Payment could not be started. Please try again.', successTitle: 'Thank you — your order is confirmed ✦', successBody: 'We’ve emailed your confirmation. Your poster is made to order and ships within 5–7 business days.', successHome: 'Back to the shop', successOrder: 'Order reference', cancelTitle: 'Checkout cancelled', cancelBody: 'No payment was taken — your cart is still here whenever you’re ready.', cancelRetry: 'Back to cart', signInPrompt: 'Sign in to use your saved address and payment method.', signInCta: 'Sign in', signedInAs: 'Signed in as' },
    product: { back: '← Back to the collection', reviews: 'reviews', sold: 'sold', inclVat: 'incl. VAT · free shipping over {amount}', save: 'Save', addToCart: 'Add to cart', secure: '🔒 Secure payment', returns: '↺ Replacement if faulty', climate: '✺ Climate-neutral', related: 'Frequently bought together', accessories: 'Frame & accessories', inspirationTitle: 'See it in context', inspirationCta: 'Browse the inspiration gallery', caption: 'Live preview — frame, background and your data are applied instantly.', detail: 'Detail<br/>Frame macro', lifestyle: 'Lifestyle<br/>Practice mockup', personalNotice: 'This artwork is created specifically from your submitted birth data and design choices. Please review your details carefully before checkout.', express: 'Redirecting to express payment …' },
    configurator: {
      step1: '1 · Birth data for your calculation', date: 'Date of birth', time: 'Time of birth', place: 'Place of birth', placePh: 'e.g. Munich', name: 'Name on the poster', namePh: 'e.g. Mara',
      step2: '2 · Frame colour', step3: '3 · Background colour', step4: '4 · Format', inclusive: 'incl.',
    },
    options: {
      frames: { '#B98A5E': 'Natural oak', '#1B1B1B': 'Matte black' },
      backgrounds: { '#E9DFCB': 'Sandstone', '#AFBCA6': 'Sage', '#BC7A5E': 'Terracotta', '#2C3A57': 'Indigo', '#2A2A2C': 'Anthracite' },
      sizes: { A3: 'for nooks & shelves', A2: 'the versatile standard', A1: 'big presence' },
    },
    pages: {
      tcmEyebrow: 'TCM · Practice · Studio', tcmTitle: 'Posters for practice, yoga & wellness', tcmIntro: 'Calm element and BaZi posters for treatment rooms, studios and waiting areas — they ground the room and open conversations.',
      bundlesEyebrow: 'Sets · special price', bundlesTitle: 'Bundles', bundlesIntro: 'Curated sets — posters and digital analysis combined, at a special price.',
      kollEyebrow: 'All posters', kollTitle: 'The Collection', kollIntro: 'BaZi, Wuxing, the limited Fire Horse edition and our practice & studio posters — every motif at a glance.',
      blogEyebrow: 'Journal', blogTitle: 'Blog', blogIntro: 'Background on BaZi, Chinese astrology and TCM — for your consultations and for anyone who wants to understand their poster.', blogRead: 'Read more →', articleBack: '← Journal', articleCta: 'Ready for your own chart?', articleCtaBtn: 'Design your poster →',
      digitalEyebrow: 'Digital · PDF', digitalHeroTitle: 'BaZi · Personal analysis', digitalAdd: 'Add to cart', digitalSecure: 'Secure payment · instant download once ready',
      notFound: 'Not found', toJournal: '← To the journal', productNotFound: 'Product not found', toShop: 'Back to the shop →',
      about: {
        eyebrow: 'THE ATELIER',
        title1: 'Where astrology', title2: 'becomes art',
        heroIntro: 'SizhuAtelier is a Swiss art studio that translates the wisdom of East Asian astrology into timeless, personalised wall art.',
        philTitle: 'Our philosophy',
        philP1: 'We created SizhuAtelier because most astrology posters are generic. They may look decorative, but they do not truly reflect the person behind them.',
        philP2: 'Our focus is different: every poster starts with personal birth data. We built our own design system to transform that data into refined, symbolic visual artwork.',
        philP3: 'The result is a personalized poster that feels intentional, refined and made specifically for one person.',
        processTitle: 'The path to your poster',
        steps: [
          { num: '01', title: 'Enter your birth data', desc: 'Share the date, time and place of your birth. For couple charts, your partner’s data too.' },
          { num: '02', title: 'Compose your artwork', desc: 'We turn your birth data into a symbolic visual layout drawing on traditional Four Pillars motifs.' },
          { num: '03', title: 'Choose a design', desc: 'Pick from different design styles, colour palettes and layouts that match your personal energy.' },
          { num: '04', title: 'Print at the atelier', desc: 'Your poster is printed on premium Hahnemühle paper with archival inks and packed with care.' },
        ],
        materialsTitle: 'Materials with meaning',
        materialsIntro: 'We use only the highest-quality materials. Every detail is chosen carefully to ensure both the aesthetic and energetic quality of your poster.',
        materials: [
          { title: 'Hahnemühle paper', desc: '100% cotton, 308gsm, museum grade. Acid-free for a lifespan of over 100 years.' },
          { title: 'Archival inks', desc: 'Pigment-based inks with UV resistance. Colours that do not fade.' },
          { title: 'Solid-wood frames', desc: 'Solid wood frames from sustainable forestry. Available in oak, walnut and black.' },
        ],
        ctaTitle: 'Ready for your personal artwork?',
        ctaBtn1: 'Design poster', ctaBtn2: 'Contact',
      },
      contact: {
        heroTitle: 'Say hello',
        heroIntro: 'We look forward to your message — whether a question, a special request or an atelier visit.',
        name: 'Name', email: 'Email', subject: 'Subject', message: 'Message', send: 'Send',
        subjectGeneral: 'General enquiry', subjectOrder: 'Order', subjectCustom: 'Custom work', subjectVisit: 'Atelier visit',
        directTitle: 'Direct contact',
        emailLabel: 'Email', instagramLabel: 'Instagram', atelierLabel: 'Atelier', atelierValue: 'SizhuAtelier|Switzerland',
        responseLabel: 'Response time', responseValue: 'We reply within 24 hours.',
        faqTitle: 'Frequent questions',
        faqIntro: 'Answers to the most important questions about our posters and the ordering process.',
        faqs: [
          { q: 'How do I request a piece?', a: 'Simply choose your preferred poster format from our collection, enter your birth data and we create your personalised chart poster. For custom work, reach us via the contact form.' },
          { q: 'Does the atelier take commissions?', a: 'Yes, we are glad to create individual commissions. Whether for weddings, corporate events, wellness studios or as a special gift — get in touch and we’ll find the perfect solution together.' },
          { q: 'Which formats are available?', a: 'Our standard posters come in A4, A3, A2 and 50×70 cm. Frames can be added in oak, walnut or black. Special formats on request.' },
          { q: 'How does the process work?', a: 'After your order, your birth data flows into a symbolic artwork and we create a design proposal. Once you approve, we print your poster at the atelier and ship within 5–7 business days.' },
          { q: 'How can I get in touch?', a: 'Reach us by email at hello@sizhuatelier.shop, via the contact form on this page or directly on Instagram @sizhuatelier. We reply within 24 hours.' },
          { q: 'Can I return my poster?', a: 'As each poster is personalised, we generally cannot accept returns. In case of damaged delivery or printing errors we will of course replace it free of charge.' },
        ],
      },
    },
    content: {
      digital: { title: 'Digital BaZi Chart Analysis', subtitle: '10–15 page PDF', desc: ['A personal, detailed PDF analysis of your BaZi chart: the four pillars, your day master, the balance of the five elements and what they mean for you.', 'Delivered as a download once ready — on its own or discounted in a bundle with a poster.'], bullets: ['Four pillars & day master, clearly explained', 'Balance of the five elements — strengths & patterns', '10–15 pages, as a downloadable PDF', 'Individually or discounted in a bundle'] },
      digitalBundle: { title: 'BaZi Poster + Digital Analysis', sub: 'Your personalised poster plus the 10–15 page PDF analysis of your chart.' },
      bundles: { b1: { title: 'Practice Starter Set', sub: '3 posters for treatment, reception & waiting area' }, b2: { title: 'Wellness Trio', sub: 'Coherent calm for studio, hallway & quiet room' } },
      bundleMeta: 'Poster + PDF analysis · special price', bundleMeta3: '3-piece set · special price',
      addons: { a1: { title: 'Premium Passepartout', note: 'Acid-free museum board' }, a2: { title: 'Gift wrapping', note: 'Recycled, with a band' }, a3: { title: 'Hanging kit', note: 'Incl. nail & spirit level' }, a4: { title: 'Glass cleaning cloth', note: 'Microfibre, reusable' } },
      products: {
        1: { title: 'BaZi Birth Chart — Four Pillars', bullets: ['Composed from your birth data into a symbolic artwork — no generic motif', 'Fine-grain natural paper print, acid-free & lightfast', 'Solid wood frame with anti-reflective glass', 'Produced in 3 business days, numbered'] },
        2: { title: 'BaZi Practice Edition', bullets: ['Calm indigo for treatment & waiting areas', 'Large format with clear distance impact', 'Wipeable museum glass, hygienic', 'Optionally with practice name instead of a person'] },
        3: { title: 'BaZi Elements Poster', bullets: ['Warm sage green — soothing for quiet rooms', 'Highlights the five-element balance', 'Sustainable recycled paper, FSC-certified', 'Also popular as a voucher gift'] },
        4: { title: 'BaZi Yoga-Flow Chart', bullets: ['Earthy terracotta — suits wood & plants', 'Compact format for studio walls', 'Lightweight frame, easy wall mounting', 'Set discount for multiple studio rooms'] },
        5: { title: 'BaZi Moon & Stars', bullets: ['Deep anthracite for an elegant, calm effect', 'Premium matte black frame', 'Optional gold accent lettering', 'A premium gift for the turn of the year'] },
        6: { title: 'BaZi Minimal', bullets: ['Reduced sandstone — understated & timeless', 'Black frame, clean line', 'Fits any practice and living space', 'Bestseller for first-time buyers'] },
        7: { title: 'Wuxing Five-Element Poster', bullets: ['Wood, fire, earth, metal, water in balance', 'Calm sage green, soothing for any room', 'Educational for practice & home', 'Museum-grade archival pigment print'] },
        8: { title: 'Fire Horse 2026 · Limited Edition', bullets: ['Limited edition for the Year of the Fire Horse 2026', 'Powerful terracotta, numbered & signed', 'A collector’s piece with character', 'While stocks last'] },
        11: { title: 'TCM Five Elements — Educational Poster', bullets: ['Wood, Fire, Earth, Metal, Water and their relationships', 'A clear teaching aid for treatment rooms and studios', 'Museum-grade archival print — not personalized'] },
        12: { title: 'TCM Practice Poster', bullets: ['Refined educational wall art for TCM practices', 'Explains elemental and energetic systems with calm clarity', 'Premium archival print — not personalized'] },
        13: { title: 'TCM Wellness Poster', bullets: ['Calm educational poster for wellness & treatment spaces', 'Visualizes core TCM principles', 'Premium archival print — not personalized'] },
        14: { title: 'TCM Yoga Studio Poster', bullets: ['Educational poster for yoga & studio walls', 'Elemental relationships at a glance', 'Premium archival print — not personalized'] },
      },
      articles: {
        r1: { tag: 'Basics', title: 'What is BaZi? The four pillars of destiny', meta: '6 min read · Atelier Journal', excerpt: 'Year, month, day and hour of your birth form four "pillars" — the map of your energy.', body: ['BaZi (Chinese 八字, "eight characters") reads your moment of birth as four pillars: year, month, day and hour. Each pillar carries a heavenly stem and an earthly branch — eight characters that describe your constitution.', 'The day pillar is considered your core, the "day master". From it, you look at how the other pillars support or challenge you. This paints a picture of strengths, patterns and favourable windows — not fortune-telling, but a tool for self-reflection.', 'Your poster captures exactly these eight characters: a calm, personal diagram that opens conversations in practice and studio, and a quiet companion at home.'] },
        r2: { tag: 'Theory', title: 'The five elements and their balance', meta: '5 min read · Atelier Journal', excerpt: 'Wood, fire, earth, metal, water — how their interplay colours your pillars.', body: ['Each of the eight characters belongs to one of the five elements. They nourish and control each other in a cycle: wood feeds fire, fire creates earth, earth bears metal, metal gathers water, water nourishes wood.', 'A BaZi chart shows which elements are abundant and which are missing. This balance is at the heart of many TCM and wellness consultations — from nutrition to interior design.', 'The five background colours of our posters echo this language: sandstone for earth, sage for wood, terracotta for fire, indigo for water, anthracite for metal.'] },
        r3: { tag: 'For the practice', title: 'BaZi in TCM practice: room & atmosphere', meta: '4 min read · Atelier Journal', excerpt: 'How a personal chart builds trust and grounds treatment rooms.', body: ['A BaZi poster visible on the wall signals depth: it shows clients that work is done here with tradition and care. That lowers the barrier to a conversation.', 'In treatment rooms, calm tones like indigo or sage create a quiet, grounded atmosphere. A large format with clear distance impact anchors the room without overloading it.', 'Many practices offer personalised charts as a gift or add-on — a high-quality, meaningful keepsake that strengthens the bond with the practice.'] },
      },
      shopFaqs: [
        { q: 'How is my BaZi poster created?', a: 'We take the date, time and place of birth you enter and use them to compose a symbolic Four Pillars artwork (year, month, day, hour) laid out on the poster.' },
        { q: 'What data do I need to order?', a: 'Date of birth, the most accurate time of birth possible, and place of birth. Optionally a name for the poster.' },
        { q: 'I don’t know my exact birth time — is that ok?', a: 'Yes — just tick “I don’t know my birth time” and we use 12:00 noon as the default assumption. Your poster is composed from that fallback value.' },
        { q: 'How long do production and shipping take?', a: 'Made-to-order production plus 5–7 business days shipping, worldwide. Free shipping over €80.' },
        { q: 'Which formats, frames and colours are available?', a: 'Several formats, frame colours and background palettes; all selectable in the configurator with a live preview.' },
        { q: 'What paper do you print on?', a: 'Museum-grade archival pigment print, made in Germany.' },
        { q: 'Can I see my poster before buying?', a: 'Yes, the configurator shows a live preview with your data, frame and background.' },
        { q: 'What is the digital BaZi chart analysis?', a: 'A personal 10–15 page PDF analysis of your chart, available on its own or as a bundle.' },
        { q: 'How secure is payment?', a: 'Encrypted payment via PayPal, Apple Pay and Google Pay.' },
        { q: 'Returns & exchanges?', a: 'PLACEHOLDER — adapt to your actual return/withdrawal policy; personalised items may be exempt from withdrawal.', placeholder: true },
      ],
      faqDefs: {
        details: { q: 'Details & material', a: 'Fine-grain fine-art print on 250 g/m² acid-free natural paper, lightfast for decades. Solid wood frame with anti-reflective real glass. Each poster is numbered in the atelier.' },
        size: { q: 'Size guide', a: 'A3 (30×42 cm) for nooks & shelves, A2 (42×59 cm) the versatile standard for practice walls, A1 (59×84 cm) for big distance impact in reception or waiting areas.' },
        ship: { q: 'Shipping & production', a: 'Production in 3 business days, then climate-neutral shipping (DE 1–2 days). Free shipping over €80. Personalized items are made to order — see our Return Policy; your statutory rights apply for faulty items.' },
        bazi: { q: 'About your personalization', a: 'From the date, time and place you enter, we compose a symbolic Four Pillars layout with heavenly stems and earthly branches. If you don’t know your birth time, we use 12:00 noon as the default assumption — this can influence the result.' },
      },
    },
  },

  DE: {
    announce: { shipping: 'Kostenloser Versand ab {amount}', personalized: 'Personalisiert aus deinen Geburtsdaten', freeActivated: '✓ Kostenloser Versand aktiviert ✦ Ein symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten', fallback: 'Premium personalisierte Drucke. Sichere Kasse. Hochwertige Produktion.' },
    preview: { announce: 'Vorschau — unser Shop startet in Kürze ✦', notForSale: 'Vorschau — noch nicht bestellbar', soon: 'Bald verfügbar' },
    // Noon-Fallback-Offenlegung (REQ-018) — siehe EN-Kommentar.
    noonFallback: {
      fieldHint: 'Wenn die Geburtszeit unbekannt ist, verwenden wir 12:00 Uhr mittags — das kann das Ergebnis beeinflussen.',
      summaryNotice: 'Geburtszeit unbekannt: erstellt mit 12:00 Uhr mittags als Standard — das kann das Ergebnis beeinflussen.',
    },
    nav: { home: 'Start', tagline: 'Astrologie · Kunst · Atelier', startPersonalizing: 'Personalisierung starten', poster: 'Personalisierte Poster', collections: 'Kollektionen', gifts: 'Geschenke', tcm: 'TCM', bundles: 'Bundles', digital: 'Digital', blog: 'Blog', wissen: 'Wissen', faq: 'FAQ', about: 'Atelier', contact: 'Kontakt', menu: 'Menü', open: 'Menü öffnen', close: 'Schließen', cart: 'Warenkorb',
      // Shop-orientierte Primär-Navigation (REQ-003 / T-201) — exakt die 8 Soll-
      // Einträge in Spec-Reihenfolge. FAQ/Atelier/Kontakt/Blog bewusst NICHT hier.
      primary: { bestseller: 'Bestseller', new: 'Neuheiten', posters: 'Poster', tcm: 'TCM Poster', wuxing: 'Wuxing', offers: 'Angebote', posterSets: 'Poster Sets', inspiration: 'Inspiration' },
      posterMenu: { bazi: 'Personalisierte BaZi-Poster', birthChart: 'Personalisierte Geburtschart-Poster', couple: 'Personalisierte Paar-Kompatibilitäts-Poster', fireHorse: 'Feuerpferd 2026 Edition', tcm: 'TCM-Lehrposter', digital: 'Digitale Analyse-PDFs', bundles: 'Bundles', gifts: 'Geschenk-Kollektion' },
      mega: {
        personalized: { title: 'Personalisierte Poster', baziPosters: 'BaZi-Poster', personalizedPosters: 'Alle personalisierten', compatibility: 'Paar-Kompatibilität', startPersonalizing: 'Personalisierung starten' },
        tcm: { title: 'TCM-Poster', tcmPosters: 'TCM-Lehrposter' },
        wuxing: { title: 'Wuxing-Poster', wuxingPosters: 'Fünf Elemente' },
        analysis: { title: 'Analyse-PDFs', analysisPdfs: 'Digitale BaZi-Analyse' },
        bundles: { title: 'Bundles', bundles: 'Bundles & Sets' },
        featured: { title: 'Featured', fireHorse: 'Feuerpferd 2026', inspiration: 'Inspirations-Galerie', allCollections: 'Alle Kollektionen ansehen' },
        // Asset-light Promo-Kacheln (REQ-004 / T-203). Text-forward: Titel + CTA;
        // das Bildfeld ist ein generischer Platzhalter bis OQ-001 gelöst ist.
        tiles: {
          ctaShop: 'Jetzt kaufen', ctaExplore: 'Entdecken', ctaPersonalize: 'Personalisieren',
          posters: { baziTitle: 'Personalisierte BaZi-Poster', baziCta: 'Personalisieren', personalizedTitle: 'Alle personalisierten Poster', personalizedCta: 'Entdecken' },
          tcm: { eduTitle: 'TCM-Lehrposter', eduCta: 'Jetzt kaufen', practiceTitle: 'Für Praxis & Studio', practiceCta: 'Entdecken' },
          wuxing: { fiveTitle: 'Fünf-Elemente-Poster', fiveCta: 'Jetzt kaufen', balanceTitle: 'Wuxing-Balance-Serie', balanceCta: 'Entdecken' },
        },
      } },
    offers: {
      eyebrow: 'Angebote', title: 'Angebote & Editionen',
      intro: 'Ein kuratierter Hub unserer Welten — jede Sektion bündelt eine echte Auswahl, die du direkt kaufen kannst. Keine erfundenen Countdowns, keine erfundenen Rabatte: jeder Preis ist der des Produkts.',
      placeholderLabel: 'Platzhalter — Kampagnen-Visuals folgen',
      sections: {
        bundles: { eyebrow: 'Kuratierte Sets', title: 'Bundles & Sets', text: 'Aufeinander abgestimmte Poster-Sets für Praxis, Studio und Zuhause — kuratiert, damit sie gut zusammenpassen.', cta: 'Alle Bundles ansehen' },
        'fire-horse': { eyebrow: 'Limited Edition', title: 'Feuerpferd 2026', text: 'Die nummerierte, signierte Edition zum Jahr des Feuer-Pferds — solange der Vorrat reicht.', cta: 'Edition ansehen' },
        bazi: { eyebrow: 'Personalisiert', title: 'Personalisierte BaZi-Poster', text: 'Symbolisches Vier-Säulen-Kunstwerk, komponiert aus deinen eingegebenen Geburtsdaten — auf Bestellung gefertigt.', cta: 'BaZi-Poster ansehen' },
        tcm: { eyebrow: 'Direkt versandfertig', title: 'TCM-Wissensposter', text: 'Kuratierte Lehrgrafiken für Praxis und Zuhause — Standardprodukte, keine Geburtsdaten, direkt versandfertig.', cta: 'TCM-Poster ansehen' },
      },
    },
    hero: { eyebrow: 'PERSONALISIERTE ASTROLOGIE-POSTER', title1: 'Dein', title2: 'Geburtschart', subtitle: 'Gib deine Geburtsdaten ein und gestalte ein hochwertiges, personalisiertes BaZi- oder Geburtschart-Poster, das eigens für dich entworfen wird.', cta1: 'Personalisierung starten', cta2: 'Kollektionen entdecken' },
    personalize: {
      eyebrow: 'Personalisieren', title: 'Gestalte dein personalisiertes Poster', intro: 'Gib deine Geburtsdaten ein, wähle dein Design und wir erstellen ein hochwertiges Poster, das eigens für dich gemacht ist.',
      chooseType: '1 · Wähle dein Poster', from: 'ab',
      types: {
        bazi: { name: 'Personalisiertes BaZi-Poster', sub: 'Dein Vier-Säulen-Chart aus Datum, Zeit & Ort.' },
        birthchart: { name: 'Personalisiertes Geburtschart-Poster', sub: 'Dein persönliches Sternenbild als edle Wandkunst.' },
        couple: { name: 'Paar-Kompatibilitäts-Poster', sub: 'Zwei Charts, ein gemeinsames Werk — für Paare.' },
        firehorse: { name: 'Feuerpferd 2026 Edition', sub: 'Limitierte Edition zum Jahr des Feuer-Pferds.' },
        digital: { name: 'Digitale Analyse-PDF', sub: '10–15-seitige PDF-Auswertung deines Charts.' },
        bundle: { name: 'Poster + Digitalanalyse', sub: 'Dein Poster plus die vollständige PDF-Analyse.' },
      },
      birthHeading: '2 · Deine Geburtsdaten', birthHeadingA: '2 · Person A — Geburtsdaten', birthHeadingB: 'Person B — Geburtsdaten',
      unknownTime: 'Ich kenne meine Geburtszeit nicht', unknownTimeHint: 'Wenn du deine genaue Geburtszeit nicht kennst, verwenden wir 12:00 Uhr (Mittag) als Standardannahme. Dein Poster wird auf Grundlage dieses Ersatzwertes gestaltet.',
      langHeading: '3 · Poster-Sprache',
      designHeading: '4 · Design', frameWord: 'Rahmenfarbe', paletteWord: 'Hintergrund-Palette', posterBgHeading: 'Poster-Hintergrund', sizeHeading: 'Format',
      pdfAddon: 'Digitale PDF-Analyse hinzufügen', pdfNote: 'Eine 10–15-seitige persönliche Auswertung deines Charts als Download.', pdfBadge: 'Digitale PDF',
      summaryHeading: '5 · Personalisierung prüfen', sumType: 'Produkt', partnerName: 'Partner', timeUnknown: 'Unbekannt — Standard 12:00 Uhr', sumLang: 'Sprache', sumDesign: 'Design', sumSize: 'Format', sumPrice: 'Preis',
      previewCertainty: 'Was du hier siehst, wird für deine personalisierte Bestellung verwendet. Bitte prüfe deine Angaben sorgfältig vor der Bestellung.',
      trustData: 'Aus deinen Geburtsdaten erstellt', trustLogic: 'Zu einem symbolischen Kunstwerk komponiert', trustPreview: 'Vorschau vor der Bestellung', trustPremium: 'Premium-Druckqualität',
      errFix: 'Bitte fülle die markierten Geburtsdaten-Felder aus, bevor du in den Warenkorb legst.',
      addToCart: 'Personalisiertes Poster in den Warenkorb',
    },
    trust: {
      apiTitle: 'Aus deinen Daten', apiSub: 'Ein symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten',
      deliveryTitle: '5–7 Tage Lieferung', deliverySub: 'Weltweit, mit Tracking',
      secureTitle: 'Stripe-sicher', secureSub: 'Verschlüsselte Kasse',
      artTitle: 'Premium-Kunst', artSub: 'Archivdruck in Museumsqualität',
      payTitle: 'Sichere Zahlung',
    },
    path: {
      eyebrow: 'So funktioniert’s', title: 'Der Weg zu deinem Poster',
      steps: [
        { title: 'Geburtsdaten eingeben', desc: 'Datum, Uhrzeit und Ort deiner Geburt — bei Paaren auch die deines Partners.' },
        { title: 'Wir gestalten dein Kunstwerk', desc: 'Aus deinen Daten gestalten wir ein persönliches, symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten.' },
        { title: 'Vorschau & in den Warenkorb', desc: 'Live-Vorschau und vollständige Zusammenfassung jedes Details vor dem Kauf.' },
        { title: '5–7 Tage Lieferung', desc: 'Auftragsfertigung, dann klimaneutraler Versand weltweit in 5–7 Tagen.' },
      ],
    },
    catalog: { title: 'Die Kollektion', more: 'Weiter zur Kollektion →' },
    carousel: { prev: 'Vorheriges Produkt', next: 'Nächstes Produkt', goto: 'Zum Produkt', hint: 'Wischen zum Entdecken' },
    search: { placeholder: 'Produkte, Kollektionen, Poster suchen…', hint: 'Versuche „BaZi“, „Geburtschart“, „Paar“, „Feuerpferd“, „Geschenk“…', noResults: 'Keine passenden Ergebnisse', error: 'Suche momentan nicht verfügbar', products: 'Poster', collections: 'Kollektionen', gifts: { wedding: 'Hochzeits-Geschenkideen', birthday: 'Geburtstags-Geschenkideen', anniversary: 'Jahrestags-Geschenkideen', baby: 'Baby-Geschenkideen', newbeginning: 'Neuanfang-Geschenke', studio: 'Praxis- & Studio-Geschenke' } },
    auth: {
      account: 'Konto', loginTitle: 'Willkommen zurück', createTitle: 'Profil erstellen', forgotTitle: 'Passwort zurücksetzen', resetTitle: 'Neues Passwort festlegen',
      subtitle: 'Melde dich an, um Bestellungen und Konto zu sehen.',
      email: 'E-Mail-Adresse', password: 'Passwort', newPassword: 'Neues Passwort',
      marketingConsent: 'Ich stimme zu, wöchentliche Energy Charts, Produkt-Insights, Launch-Ankündigungen und Marketing-E-Mails von SizhuAtelier zu erhalten. Ich kann mich jederzeit abmelden.',
      loginCta: 'Anmelden', createCta: 'Profil erstellen', forgotCta: 'Reset-Link senden', resetCta: 'Passwort speichern',
      toSignup: 'Profil erstellen', toLogin: 'Zurück zur Anmeldung', toForgot: 'Passwort vergessen?',
      resetSent: 'Falls die E-Mail existiert, ist ein Reset-Link unterwegs.', resetDone: 'Dein Passwort wurde aktualisiert.',
      dashboardTitle: 'Dein Profil', logout: 'Abmelden', emailLabel: 'E-Mail', newsletterStatus: 'Newsletter', marketingPrefs: 'Marketing-Einstellungen', saved: 'Gespeichert ✦', orderHistory: 'Bestellhistorie', noOrders: 'Noch keine Bestellungen.',
      err: { invalid_email: 'Bitte gib eine gültige E-Mail-Adresse ein.', weak_password: 'Das Passwort muss mindestens 8 Zeichen haben.', email_taken: 'Ein Konto mit dieser E-Mail existiert bereits.', invalid_credentials: 'Falsche E-Mail oder Passwort.', auth_unconfigured: 'Konten sind noch nicht verfügbar.', invalid_token: 'Dieser Reset-Link ist ungültig oder abgelaufen.', unauthorized: 'Bitte melde dich erneut an.', wrong_password: 'Dein aktuelles Passwort ist falsch.', payment_unconfigured: 'Zahlung ist noch nicht konfiguriert.', rate_limited: 'Zu viele Versuche — bitte warte einen Moment und versuche es erneut.', server_error: 'Etwas ist schiefgelaufen — bitte erneut versuchen.', network_error: 'Netzwerkfehler — bitte erneut versuchen.' },
    },
    account: {
      personalDetails: 'Persönliche Daten', name: 'Name', namePh: 'Dein Name', language: 'Bevorzugte Sprache', save: 'Speichern', saved: 'Gespeichert ✦', cancel: 'Abbrechen', edit: 'Bearbeiten', delete: 'Löschen', status: 'Status',
      changePassword: 'Passwort ändern', currentPassword: 'Aktuelles Passwort', newPassword: 'Neues Passwort', updatePassword: 'Passwort aktualisieren', passwordChanged: 'Passwort aktualisiert ✦',
      shippingAddresses: 'Versandadressen', billingAddress: 'Rechnungsadresse', addAddress: 'Adresse hinzufügen', editAddress: 'Adresse bearbeiten', setDefault: 'Als Standard', default: 'Standard', noAddresses: 'Noch keine Adressen gespeichert.', sameAsShipping: 'Rechnungsadresse gleich Versandadresse',
      fullName: 'Vollständiger Name', line1: 'Adresszeile 1', line2: 'Adresszeile 2 (optional)', postalCode: 'PLZ', city: 'Stadt', region: 'Bundesland / Region (optional)', country: 'Land (2-stellig, z. B. DE)', phone: 'Telefon (optional)',
      paymentMethods: 'Zahlungsmethoden', paymentDesc: 'Deine gespeicherten Karten werden sicher von Stripe verwaltet. Wir speichern keine Kartennummern.', managePayments: 'Zahlungsmethoden verwalten', paymentNone: 'Noch keine Zahlungsmethoden — füge eine an der Kasse hinzu.', paymentUnavailable: 'Zahlungsverwaltung ist noch nicht verfügbar.',
      preferences: 'Einstellungen',
    },
    card: { bought: 'gekauft', reviews: 'Bewertungen', sold: 'verkauft', personalize: 'Personalisieren', personalLine: 'Aus deinem Geburtsdatum, -zeit & -ort erstellt.', shop: 'Poster ansehen' },
    coll: {
      allPosters: 'Alle personalisierten Poster',
      cards: {
        bazi: { title: 'Personalisierte BaZi-Poster', desc: 'Verwandle dein Vier-Säulen-Chart in einen hochwertigen, personalisierten Wanddruck.', cta: 'Personalisierung starten' },
        birthchart: { title: 'Personalisierte Geburtschart-Poster', desc: 'Dein persönliches Sternenbild als edle Wandkunst gestaltet.', cta: 'Personalisierung starten' },
        couple: { title: 'Paar-Kompatibilitäts-Poster', desc: 'Zwei Charts, ein gemeinsames Werk — für Paare gemacht.', cta: 'Personalisierung starten' },
        firehorse: { title: 'Feuerpferd 2026 Edition', desc: 'Eine limitierte Sammler-Edition zum Jahr des Feuer-Pferds — fertig zum Aufhängen.', cta: 'Poster ansehen' },
        digital: { title: 'Digitale Analyse-PDFs', desc: 'Eine 10–15-seitige persönliche Auswertung deines Charts als Download.', cta: 'Entdecken' },
        bundles: { title: 'Bundles', desc: 'Poster + digitale Analyse, kombiniert zum Vorteilspreis.', cta: 'Entdecken' },
        gifts: { title: 'Geschenk-Kollektion', desc: 'Ein bedeutungsvolles personalisiertes Poster — für einen geliebten Menschen.', cta: 'Personalisierung starten' },
      },
    },
    bundles: { eyebrow: 'Mehr nehmen, weniger zahlen', title: 'Bundles', sub: 'Abgestimmte Sets — Poster und digitale Analyse kombiniert, zum Vorteilspreis.', add: 'Set in den Warenkorb', save: 'Spare' },
    newsletter: { eyebrow: 'Der Atelier-Kreis', title: 'Der Cosmic Pulse — Deine wöchentlichen Energy Charts', copy: 'Richte deine Tage mit kosmischer Inspiration aus. Abonniere unsere wöchentlichen Energy Charts direkt in dein Postfach — eine besinnliche astrologische Deutung der aktuellen kosmischen Verschiebungen mit einem wöchentlichen energetischen Ausblick für die kommende Woche. Außerdem erhältst du unsere Marketing-Updates zuerst — neue Produkte, Kollektionen und exklusive Angebote. ✨ Kein Spam, nur Relevantes.', benefits: ['Wöchentliche Energy Charts ins Postfach', 'Neue Produkt- & Kollektions-Launches', 'Saisonale Geschenkideen-Kampagnen'], placeholder: 'Deine E-Mail-Adresse', langPref: 'E-Mails auf', button: 'Abonnieren', consent: 'Ich stimme zu, wöchentliche Energy Charts, Produkt-Insights, Launch-Ankündigungen und Marketing-E-Mails von SizhuAtelier zu erhalten. Ich kann mich jederzeit abmelden. Siehe unsere', privacy: 'Datenschutzerklärung', success: 'Willkommen im Atelier-Kreis — prüfe dein Postfach, um dein Abo zu bestätigen.', error: 'Etwas ist schiefgelaufen — bitte erneut versuchen.', consentErr: 'Bitte akzeptiere die Bedingungen, um fortzufahren.', fine: 'Double-Opt-in · jederzeit abbestellbar' },
    wissen: { eyebrow: 'Blog', title: 'Was hinter BaZi steckt', sub: 'Hintergründe für deine Beratung und für alle, die ihr Poster verstehen möchten.', read: 'Weiterlesen →' },
    gifts: {
      eyebrow: 'Geschenkideen', title: 'Finde ein personalisiertes Geschenk mit Bedeutung', sub: 'Aus echten Geburtsdaten erstellt — edel, bewusst und für einen Menschen gemacht. Oder ein fertig aufhängbares Lehrposter für Praxis oder Studio.',
      personalizedTag: 'Personalisiert', shopTag: 'Sofort lieferbar', ctaPersonalize: 'Personalisiertes Geschenk erstellen', ctaShop: 'Dieses Geschenk kaufen',
      cards: {
        wedding: { title: 'Hochzeits-Geschenke', copy: 'Ein bedeutungsvolles Hochzeitsgeschenk rund um zwei Menschen, ihre Verbindung und ihre gemeinsame symbolische Geschichte.' },
        birthday: { title: 'Geburtstags-Geschenke', copy: 'Ein persönliches Geschenk aus Geburtsdaten — bewusst, edel und für einen Menschen gemacht.' },
        anniversary: { title: 'Jahrestags-Geschenke', copy: 'Feiere eine gemeinsame Geschichte mit einem Werk auf Basis persönlicher Geburtsdaten und symbolischer Kompatibilität.' },
        baby: { title: 'Baby-Geschenke', copy: 'Ein edles Andenken für ein neues Lebenskapitel, aus den Geburtsdaten des Babys erstellt. Geburtszeit unbekannt? Wir verwenden 12:00 Uhr mittags als Standard.' },
        newbeginning: { title: 'Neuanfang-Geschenke', copy: 'Für Umzug, neuen Job, neues Jahr oder einen persönlichen Neustart — ein symbolischer Anker für Richtung und Erneuerung.' },
        spiritual: { title: 'Spirituelle Geschenke', copy: 'Ein kontemplatives Fünf-Elemente-Werk aus persönlichen Geburtsdaten — für Meditationsecken und achtsame Räume.' },
        couple: { title: 'Paar-Geschenke', copy: 'Zwei Charts in einem Werk — ein Kompatibilitäts-Poster für Partner, aus beiden Geburtsdaten erstellt.' },
        housewarming: { title: 'Einzugs-Geschenke', copy: 'Die limitierte Feuerpferd-2026-Edition — ein markantes, fertig aufhängbares Stück zum Einzug. Versandfertig zum Rahmen.' },
        wellness: { title: 'Wellness-Studio-Geschenke', copy: 'Beruhigende Lehr-Wandkunst für Behandlungs- & Ruheräume — erklärt die Fünf Elemente klar und visuell ruhig. Sofort lieferbar.' },
        yoga: { title: 'Yoga-Studio-Geschenke', copy: 'Erdende Lehrposter für Studio-Wände — erdig, klar und fertig aufhängbar. Nicht personalisiert.' },
        tcmpractice: { title: 'TCM-Praxis-Geschenke', copy: 'Lehrposter für TCM-Praxen und Behandlungsräume — ruhig, professionell und versandfertig.' },
      },
      faqTitle: 'Geschenk-FAQ',
      faqs: [
        { q: 'Welche Geschenke sind personalisiert?', a: 'BaZi-, Geburtschart- und Paar-Kompatibilitäts-Poster werden aus Geburtsdaten erstellt. Feuerpferd und TCM-Lehrposter werden fertig geliefert und sind nicht personalisiert.' },
        { q: 'Was, wenn ich die Geburtszeit nicht kenne?', a: 'Kein Problem — wähle „Ich kenne meine Geburtszeit nicht“, und wir verwenden 12:00 Uhr (Mittag) als Standardannahme.' },
        { q: 'Kann ich es direkt verschenken?', a: 'Lege ein personalisiertes Poster oder ein Lehrposter in den Warenkorb und schließe wie gewohnt ab.' },
      ],
    },
    faq: { eyebrow: 'FAQ', title: 'Häufige Fragen', viewFull: 'Vollständige FAQ ansehen' },
    faqHome: [
      { q: 'Wie wird mein Poster personalisiert?', a: 'Wir nehmen Datum, Zeit und Ort deiner Geburt und gestalten daraus ein persönliches, symbolisches Kunstwerk — ein strukturiertes visuelles Layout, inspiriert von deinen Geburtsdaten und eigens für dich gemacht.' },
      { q: 'Was, wenn ich meine Geburtszeit nicht kenne?', a: 'Kein Problem — wähle „Ich kenne meine Geburtszeit nicht“, und wir verwenden 12:00 Uhr (Mittag) als Standardannahme. Dein Poster wird auf Grundlage dieses Ersatzwertes gestaltet.' },
      { q: 'Sehe ich vor der Bestellung eine Vorschau oder Zusammenfassung?', a: 'Ja — der Personalisierungsflow zeigt eine Live-Vorschau und eine vollständige Zusammenfassung aller Angaben, bevor du in den Warenkorb legst.' },
      { q: 'Wie lange dauert der Versand?', a: 'Die Produktion dauert wenige Werktage, anschließend klimaneutraler Versand (DE 1–2 Tage), weltweit.' },
      { q: 'Kann ich ein personalisiertes Poster zurückgeben?', a: 'Personalisierte Artikel werden auf Bestellung gefertigt und können nach Produktionsbeginn nicht zurückgegeben werden. Deine gesetzlichen Rechte bei beschädigter, fehlerhafter oder falscher Ware bleiben bestehen.' },
    ],
    // V2-Homepage-Module 03/06/07/08/09 + 12 (REQ-008 / REQ-012). Ehrliches
    // Framing — symbolisches Kunstwerk, inspiriert von Geburtsdaten; keine
    // Präzisions-/Heilversprechen.
    home: {
      world: {
        eyebrow: 'Nach Welt shoppen', title: 'Finde deine Produktwelt', sub: 'Vier kuratierte Welten — von personalisierter Geburtschart-Kunst bis zu versandfertigen Lehrpostern.',
        cards: {
          bazi: { title: 'BaZi-Poster', desc: 'Personalisiertes Vier-Säulen-Kunstwerk, inspiriert von deinen Geburtsdaten.' },
          tcm: { title: 'TCM-Poster', desc: 'Kuratierte Lehrgrafiken der Fünf Elemente — direkt versandfertig.' },
          wuxing: { title: 'Wuxing-Poster', desc: 'Der Kreislauf der Fünf Elemente als ruhiger, atmosphärischer Druck.' },
          personalized: { title: 'Personalisierte Poster', desc: 'Jedes Motiv, das wir aus deinen Geburtsdaten komponieren — für dich gemacht.' },
        },
        cta: 'Welt entdecken',
      },
      firehorse: {
        eyebrow: 'Limited Edition · Featured', title: 'Feuerpferd 2026', copy: 'Die limitierte Edition zum Jahr des Feuer-Pferds 2026 — nummeriert und signiert, solange der Vorrat reicht. Ein markantes Sammlerstück, direkt zum Aufhängen.', cta: 'Feuerpferd 2026 entdecken',
      },
      compatibility: {
        eyebrow: 'Für Paare', title: 'Kompatibilitäts-Poster für zwei', copy: 'Zwei Geburtscharts vereint in einem ruhigen, symbolischen Kunstwerk — inspiriert von euren gemeinsamen Geburtsdaten. Ein persönliches Geschenk zu Hochzeit, Jahrestag und Einzug.', ctaCollection: 'Paar-Poster ansehen', ctaPersonalize: 'Paar-Poster starten',
      },
      analysis: {
        eyebrow: 'Digital', title: 'Digitale BaZi-Analyse als PDF', copy: 'Ein persönliches 10–15-seitiges PDF, das deine vier Säulen und die Balance der Fünf Elemente erfasst — eine erfasste Auswertung deiner Eingaben, einzeln oder vergünstigt mit einem Poster.', cta: 'Analyse-PDFs entdecken',
      },
      inspiration: {
        eyebrow: 'Inspiration', title: 'Die Poster im Kontext sehen', copy: 'Stöbere durch unsere kuratierte Inspirationswand — Interior-Mockups und Geschenkideen, die direkt zu den passenden Kollektionen und Produkten verlinken.', cta: 'Zur Inspirations-Galerie',
      },
      seo: {
        title: 'Personalisierte Astrologie-Poster, TCM- & Wuxing-Wandkunst',
        intro: 'SizhuAtelier komponiert Premium-Wandkunst aus deinen Geburtsdaten und kuratiert Lehrposter rund um ostasiatische Symbolik. Jedes personalisierte Motiv ist ein symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten — kein Wahrsage-Werkzeug und keine medizinische Beratung.',
        sections: [
          { heading: 'Personalisierte BaZi-Poster online', body: 'Ein BaZi-Poster hält die vier Säulen — Jahr, Monat, Tag und Stunde deiner Geburt — als ruhiges, persönliches Diagramm fest, inspiriert von den Daten, die du eingibst.', linkLabel: 'BaZi-Poster ansehen', to: '/collections/bazi-posters' },
          { heading: 'TCM-Poster für Praxis, Wissen & Zuhause', body: 'Unsere TCM-Poster sind kuratierte Lehrgrafiken der Fünf Elemente — gestaltet für Behandlungsräume, Studios und Zuhause. Sie erklären und schmücken; sie geben kein Heilversprechen.', linkLabel: 'TCM-Poster ansehen', to: '/collections/tcm-posters' },
          { heading: 'Wuxing und die Fünf Elemente', body: 'Das Wuxing-Poster zeigt, wie sich die fünf Elemente nähren und kontrollieren — eine ruhige, atmosphärische Wissensgrafik für Praxis und Zuhause.', linkLabel: 'Wuxing-Poster ansehen', to: '/collections/wuxing-posters' },
          { heading: 'Paar- & Kompatibilitäts-Poster', body: 'Zwei Geburtscharts vereint in einem symbolischen Kunstwerk — ein persönliches Geschenk, inspiriert von euren gemeinsamen Geburtsdaten.', linkLabel: 'Kompatibilitäts-Poster ansehen', to: '/collections/compatibility-posters' },
        ],
        knowledgeLabel: 'Die Poster im Kontext sehen',
        knowledgeTo: '/inspiration',
        keywordTodo: 'Content-TODO (OQ-007): finales SEO-Keyword-Set vor dem Launch mit einer muttersprachlichen SEO-Prüfung festlegen; H2-Struktur und interne Links stehen.',
      },
    },
    apiTrust: {
      eyebrow: 'Persönlich', title: 'Warum dein Poster wirklich personalisiert ist',
      copy: 'Jedes SizhuAtelier-Poster entsteht aus den Geburtsdaten, die du angibst. Wir übersetzen deine Daten in eine strukturierte visuelle Grundlage — ein symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten, nicht generisch, sondern eigens für dich gemacht.',
      badges: ['Aus Geburtsdaten erstellt', 'Symbolisches Kunstwerk, für dich gemacht', 'Personalisierte Vorschau', 'Premium-Druckqualität', 'Nur für dich gemacht'],
    },
    howItWorks: {
      eyebrow: 'So funktioniert’s', title: 'Von deinen Geburtsdaten zur Wandkunst', cta: 'Personalisierung starten',
      steps: [
        { title: 'Geburtsdaten eingeben', desc: 'Datum, Uhrzeit und Ort deiner Geburt — bei Paaren auch die deines Partners.' },
        { title: 'Wir gestalten dein Kunstwerk', desc: 'Wir verwandeln deine Geburtsdaten in eine strukturierte visuelle Grundlage — ein symbolisches Kunstwerk, inspiriert davon.' },
        { title: 'Design wählen', desc: 'Wähle Palette, Rahmen, Format und Poster-Sprache — mit Live-Vorschau.' },
        { title: 'Vorschau, dann Druck', desc: 'Bestätige, was du siehst, und wir fertigen deine hochwertige personalisierte Wandkunst.' },
      ],
    },
    footer: { inspiration: 'Inspiration', howItWorks: 'So funktioniert’s', about: 'Atelier', contact: 'Kontakt', faq: 'FAQ', shipping: 'Versand', returns: 'Rückgabe & Widerruf', terms: 'AGB', privacy: 'Datenschutz', impressum: 'Impressum', claim: 'Personalisiert aus deinen Geburtsdaten · klimaneutraler Versand' },
    cart: { title: 'Warenkorb', remaining: 'Dir fehlen nur noch {amount} bis zum kostenlosen Versand!', reached: 'Kostenloser Versand aktiviert!', empty: 'Noch leer', emptyHint: 'Gestalte dein erstes BaZi-Poster.', toCollection: 'Zur Kollektion', alsoLike: 'Das könnte dir auch gefallen', clear: 'Leeren', remove: 'Entfernen', subtotal: 'Zwischensumme', shipFree: 'Versand kostenlos', ship: 'Versand {amount}', inclVat: '· inkl. MwSt.', checkout: 'Zur Kasse', ssl: '· SSL gesichert', toastAdded: 'Zum Warenkorb hinzugefügt', toastSet: 'Set zum Warenkorb hinzugefügt', editPersonalization: 'Personalisierung bearbeiten', unknownTimeNotice: 'Geburtszeit: Unbekannt — gestaltet mit 12:00 Uhr (Mittag) als Standardannahme', reviewBirth: 'Prüfe deine Geburtsdaten oben vor der Kasse.', confirmLabel: 'Ich bestätige, dass meine Personalisierungsdaten korrekt sind. Falls meine Geburtszeit unbekannt ist, verstehe ich, dass 12:00 Uhr (Mittag) als Standardannahme verwendet wird.', returnNotice: 'Personalisierte Artikel werden eigens angefertigt und können nach Produktionsbeginn nicht zurückgegeben oder storniert werden. Deine gesetzlichen Rechte bei beschädigter, fehlerhafter, falscher oder nicht wie beschriebener Ware bleiben unberührt.', incompleteWarn: 'Bei einigen Artikeln fehlen Personalisierungsangaben — bitte vor der Kasse ergänzen.', signInPrompt: 'Melde dich an, um deine gespeicherte Adresse und Zahlungsmethode zu nutzen.', signInCta: 'Anmelden' },
    checkout: { back: '← Zurück zum Warenkorb', title: 'Kasse', expressHint: 'Express-Checkout — in Sekunden bezahlen', orGuest: 'oder als Gast bezahlen', contact: 'Kontakt & Lieferung', noAccount: '— kein Konto nötig', email: 'E-Mail-Adresse', firstName: 'Vorname', lastName: 'Nachname', street: 'Straße & Hausnummer', zip: 'PLZ', city: 'Ort', placeOrder: 'Jetzt zahlungspflichtig bestellen', noHidden: '🔒 Keine versteckten Kosten · Versand & Steuern unten ausgewiesen', summary: 'Deine Bestellung', subtotal: 'Zwischensumme', shipping: 'Versand', shipFree: 'Versand kostenlos', total: 'Gesamt', vat: 'inkl. {amount} MwSt. (19%)', emptyTitle: 'Dein Warenkorb ist leer', toShop: 'Zum Shop', orderToast: 'Bestellung bestätigt — danke! ✦', starting: 'Weiterleitung zur sicheren Kasse…', payError: 'Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.', successTitle: 'Danke — deine Bestellung ist bestätigt ✦', successBody: 'Die Bestätigung ist per E-Mail unterwegs. Dein Poster wird auf Bestellung gefertigt und in 5–7 Werktagen versendet.', successHome: 'Zurück zum Shop', successOrder: 'Bestellnummer', cancelTitle: 'Bezahlung abgebrochen', cancelBody: 'Es wurde nichts abgebucht — dein Warenkorb bleibt erhalten.', cancelRetry: 'Zurück zum Warenkorb', signInPrompt: 'Melde dich an, um deine gespeicherte Adresse und Zahlungsmethode zu nutzen.', signInCta: 'Anmelden', signedInAs: 'Angemeldet als' },
    product: { back: '← Zurück zur Kollektion', reviews: 'Bewertungen', sold: 'verkauft', inclVat: 'inkl. MwSt. · Kostenloser Versand ab {amount}', save: 'Spare', addToCart: 'In den Warenkorb', secure: '🔒 Sichere Zahlung', returns: '↺ Ersatz bei Mängeln', climate: '✺ Klimaneutral', related: 'Wird oft zusammen gekauft', accessories: 'Rahmen & Zubehör', inspirationTitle: 'Im Raum sehen', inspirationCta: 'Zur Inspirations-Galerie', caption: 'Live-Vorschau — Rahmen, Hintergrund und deine Daten werden sofort übernommen.', detail: 'Detail<br/>Rahmen-Makro', lifestyle: 'Lifestyle<br/>Praxis-Mockup', personalNotice: 'Dieses Kunstwerk wird eigens aus deinen übermittelten Geburtsdaten und Design-Entscheidungen erstellt. Bitte prüfe deine Angaben sorgfältig vor der Kasse.', express: 'Weiterleitung zur Express-Zahlung …' },
    configurator: {
      step1: '1 · Geburtsdaten für deine Berechnung', date: 'Geburtsdatum', time: 'Geburtszeit', place: 'Geburtsort', placePh: 'z. B. München', name: 'Name auf dem Poster', namePh: 'z. B. Mara',
      step2: '2 · Rahmenfarbe', step3: '3 · Hintergrundfarbe', step4: '4 · Format', inclusive: 'inkl.',
    },
    options: {
      frames: { '#B98A5E': 'Eiche natur', '#1B1B1B': 'Schwarz matt' },
      backgrounds: { '#E9DFCB': 'Sandstein', '#AFBCA6': 'Salbei', '#BC7A5E': 'Terracotta', '#2C3A57': 'Indigo', '#2A2A2C': 'Anthrazit' },
      sizes: { A3: 'für Nischen & Regale', A2: 'der vielseitige Standard', A1: 'große Fernwirkung' },
    },
    pages: {
      tcmEyebrow: 'TCM · Praxis · Studio', tcmTitle: 'Poster für Praxis, Yoga & Wellness', tcmIntro: 'Ruhige Element- und BaZi-Poster für Behandlungsräume, Studios und Wartebereiche — erden den Raum und eröffnen Gespräche.',
      bundlesEyebrow: 'Sets · Vorteilspreis', bundlesTitle: 'Bundles', bundlesIntro: 'Abgestimmte Sets — Poster und digitale Analyse kombiniert, zum Vorteilspreis.',
      kollEyebrow: 'Alle Poster', kollTitle: 'Die Kollektion', kollIntro: 'BaZi, Wuxing, die limitierte Feuerpferd-Edition und unsere Praxis- & Studio-Poster — alle Motive auf einen Blick.',
      blogEyebrow: 'Journal', blogTitle: 'Blog', blogIntro: 'Hintergründe zu BaZi, chinesischer Astrologie und TCM — für deine Beratung und für alle, die ihr Poster verstehen möchten.', blogRead: 'Weiterlesen →', articleBack: '← Journal', articleCta: 'Bereit für dein eigenes Chart?', articleCtaBtn: 'Poster gestalten →',
      digitalEyebrow: 'Digital · PDF', digitalHeroTitle: 'BaZi · Persönliche Analyse', digitalAdd: 'In den Warenkorb', digitalSecure: 'Sichere Zahlung · sofortiger Download nach Fertigstellung',
      notFound: 'Nicht gefunden', toJournal: '← Zum Journal', productNotFound: 'Produkt nicht gefunden', toShop: 'Zurück zum Shop →',
      about: {
        eyebrow: 'DAS ATELIER',
        title1: 'Wo Astrologie', title2: 'zur Kunst wird',
        heroIntro: 'SizhuAtelier ist ein Schweizer Kunststudio, das die Weisheit der ostasiatischen Astrologie in zeitlose, personalisierte Wandkunst übersetzt.',
        philTitle: 'Unsere Philosophie',
        philP1: 'Wir haben SizhuAtelier gegründet, weil die meisten Astrologie-Poster generisch sind. Sie mögen dekorativ aussehen, spiegeln aber nicht wirklich die Person dahinter wider.',
        philP2: 'Unser Fokus ist ein anderer: Jedes Poster beginnt mit persönlichen Geburtsdaten. Wir haben ein eigenes Gestaltungssystem entwickelt, um diese Daten in raffinierte, symbolische visuelle Kunst zu übersetzen.',
        philP3: 'Das Ergebnis ist ein personalisiertes Poster, das sich bewusst, edel und eigens für einen Menschen gemacht anfühlt.',
        processTitle: 'Der Weg zu deinem Poster',
        steps: [
          { num: '01', title: 'Geburtsdaten eingeben', desc: 'Teile uns Datum, Uhrzeit und Ort deiner Geburt mit. Für Paar-Charts auch die Daten deines Partners.' },
          { num: '02', title: 'Kunstwerk gestalten', desc: 'Wir übersetzen deine Geburtsdaten in ein symbolisches visuelles Layout, das traditionelle Vier-Säulen-Motive aufgreift.' },
          { num: '03', title: 'Design wählen', desc: 'Wähle aus verschiedenen Design-Stilen, Farbpaletten und Layouts, die zu deiner persönlichen Energie passen.' },
          { num: '04', title: 'Im Atelier drucken', desc: 'Dein Poster wird auf hochwertigem Hahnemühle-Papier mit archivalischen Tinten gedruckt und sorgfältig verpackt.' },
        ],
        materialsTitle: 'Materialien mit Bedeutung',
        materialsIntro: 'Wir verwenden ausschliesslich Materialien von höchster Qualität. Jedes Detail wird sorgfältig ausgewählt, um sowohl die ästhetische als auch die energetische Qualität deines Posters zu gewährleisten.',
        materials: [
          { title: 'Hahnemühle Papier', desc: '100% Baumwolle, 308gsm, museum grade. Acid-free für eine Lebensdauer von über 100 Jahren.' },
          { title: 'Archivale Tinten', desc: 'Pigmentbasierte Tinten mit UV-Beständigkeit. Farben, die nicht verblassen.' },
          { title: 'Massivholzrahmen', desc: 'Massivholzrahmen aus nachhaltiger Forstwirtschaft. Erhältlich in Eiche, Nuss und Schwarz.' },
        ],
        ctaTitle: 'Bereit für dein persönliches Kunstwerk?',
        ctaBtn1: 'Poster gestalten', ctaBtn2: 'Kontakt',
      },
      contact: {
        heroTitle: 'Sag Hallo',
        heroIntro: 'Wir freuen uns auf deine Nachricht — ob Frage, Sonderwunsch oder Atelierbesuch.',
        name: 'Name', email: 'E-Mail', subject: 'Betreff', message: 'Nachricht', send: 'Senden',
        subjectGeneral: 'Allgemeine Anfrage', subjectOrder: 'Bestellung', subjectCustom: 'Sonderanfertigung', subjectVisit: 'Atelierbesuch',
        directTitle: 'Direkter Kontakt',
        emailLabel: 'E-Mail', instagramLabel: 'Instagram', atelierLabel: 'Atelier', atelierValue: 'SizhuAtelier|Schweiz',
        responseLabel: 'Antwortzeit', responseValue: 'Wir antworten innerhalb von 24 Stunden.',
        faqTitle: 'Häufige Fragen',
        faqIntro: 'Antworten auf die wichtigsten Fragen rund um unsere Poster und den Bestellprozess.',
        faqs: [
          { q: 'Wie kann ich ein Werk anfragen?', a: 'Wähle einfach dein gewünschtes Poster-Format aus unserer Kollektion aus, gib deine Geburtsdaten ein und wir erstellen dein personalisiertes Chart-Poster. Für Sonderanfertigungen kannst du uns über das Kontaktformular erreichen.' },
          { q: 'Bietet das Atelier Auftragsarbeiten an?', a: 'Ja, wir erstellen gerne individuelle Auftragsarbeiten. Ob für Hochzeiten, Firmenevents, Wellness-Studios oder als besonderes Geschenk — sprich uns an und wir finden gemeinsam die perfekte Lösung.' },
          { q: 'Welche Formate sind verfügbar?', a: 'Unsere Standard-Poster sind in den Formaten A4, A3, A2 und 50×70 cm erhältlich. Rahmen können in Eiche, Nussbaum oder Schwarz dazubestellt werden. Sonderformate auf Anfrage.' },
          { q: 'Wie läuft der Prozess ab?', a: 'Nach deiner Bestellung fließen deine Geburtsdaten in ein symbolisches Kunstwerk ein und wir erstellen einen Design-Vorschlag. Nach deiner Freigabe drucken wir dein Poster im Atelier und versenden es innerhalb von 5–7 Werktagen.' },
          { q: 'Wie kann ich Kontakt aufnehmen?', a: 'Du erreichst uns per E-Mail an hello@sizhuatelier.shop, über das Kontaktformular auf dieser Seite oder direkt über Instagram @sizhuatelier. Wir antworten innerhalb von 24 Stunden.' },
          { q: 'Kann ich mein Poster zurückgeben?', a: 'Da jedes Poster personalisiert ist, können wir grundsätzlich keine Retouren annehmen. Bei beschädigter Lieferung oder Druckfehlern tauschen wir selbstverständlich kostenlos aus.' },
        ],
      },
    },
    content: {
      digital: { title: 'Digitale BaZi-Chart-Analyse', subtitle: '10–15 Seiten PDF', desc: ['Eine persönliche, ausführliche PDF-Auswertung deines BaZi-Charts: die vier Säulen, dein Tagesmeister, die Balance der fünf Elemente und was sie für dich bedeuten.', 'Sofort nach Fertigstellung als Download — einzeln oder vergünstigt im Bundle mit einem Poster.'], bullets: ['Vier Säulen & Tagesmeister verständlich erklärt', 'Balance der fünf Elemente — Stärken & Muster', '10–15 Seiten, als PDF zum Download', 'Einzeln oder vergünstigt im Bundle'] },
      digitalBundle: { title: 'BaZi Poster + Digitalanalyse', sub: 'Dein personalisiertes Poster plus die 10–15-seitige PDF-Auswertung deines Charts.' },
      bundles: { b1: { title: 'Praxis Starter-Set', sub: '3 Poster für Behandlung, Empfang & Wartebereich' }, b2: { title: 'Wellness Trio', sub: 'Stimmige Ruhe für Studio, Flur & Ruheraum' } },
      bundleMeta: 'Poster + PDF-Analyse · Vorteilspreis', bundleMeta3: '3-teiliges Set · Vorteilspreis',
      addons: { a1: { title: 'Premium Passepartout', note: 'Säurefreier Museumskarton' }, a2: { title: 'Geschenkverpackung', note: 'Recycelt, mit Banderole' }, a3: { title: 'Aufhänge-Set', note: 'Inkl. Nagel & Wasserwaage' }, a4: { title: 'Glas-Pflegetuch', note: 'Mikrofaser, wiederverwendbar' } },
      products: {
        1: { title: 'BaZi Geburtschart — Vier Säulen', bullets: ['Aus deinen Geburtsdaten zu einem symbolischen Kunstwerk komponiert — kein Standardmotiv', 'Feinkörniger Naturpapier-Druck, säurefrei & lichtecht', 'Massivholzrahmen mit entspiegeltem Glas', 'Produktion in 3 Werktagen, nummeriert'] },
        2: { title: 'BaZi Praxis-Edition', bullets: ['Ruhiges Indigo für Behandlungs- & Wartebereiche', 'Großformat mit klarer Fernwirkung', 'Abwischbares Museumsglas, hygienefreundlich', 'Optional mit Praxisname statt Personenname'] },
        3: { title: 'BaZi Elemente-Poster', bullets: ['Warmes Salbeigrün — beruhigend für Ruheräume', 'Betont die Fünf-Elemente-Balance', 'Nachhaltiges Recyclingpapier, FSC-zertifiziert', 'Auch als Gutschein-Geschenk beliebt'] },
        4: { title: 'BaZi Yoga-Flow Chart', bullets: ['Erdiges Terracotta — passt zu Holz & Pflanzen', 'Kompaktes Format für Studio-Wände', 'Leichter Rahmen, einfache Wandmontage', 'Set-Rabatt für mehrere Studio-Räume'] },
        5: { title: 'BaZi Mond & Sterne', bullets: ['Tiefes Anthrazit für eine elegante, ruhige Wirkung', 'Premium-Schwarzrahmen, matt', 'Goldfarbene Akzentschrift optional', 'Hochwertiges Geschenk zum Jahreswechsel'] },
        6: { title: 'BaZi Minimal', bullets: ['Reduziertes Sandstein — zurückhaltend & zeitlos', 'Schwarzer Rahmen, klare Linie', 'Passt in jede Praxis- und Wohnumgebung', 'Bestseller für Erstbesteller'] },
        7: { title: 'Wuxing Fünf-Elemente Poster', bullets: ['Holz, Feuer, Erde, Metall, Wasser im Gleichgewicht', 'Ruhiges Salbeigrün, beruhigend für jeden Raum', 'Lehrreich für Praxis & Zuhause', 'Archiv-Pigmentdruck in Museumsqualität'] },
        8: { title: 'Feuerpferd 2026 · Limited Edition', bullets: ['Limitierte Edition zum Jahr des Feuer-Pferds 2026', 'Kraftvolles Terracotta, nummeriert & signiert', 'Sammlerstück mit Charakter', 'Solange der Vorrat reicht'] },
        11: { title: 'TCM Fünf Elemente — Lehrposter', bullets: ['Holz, Feuer, Erde, Metall, Wasser und ihre Beziehungen', 'Klare Lehrhilfe für Behandlungsräume und Studios', 'Premium-Archivdruck — nicht personalisiert'] },
        12: { title: 'TCM Praxis-Poster', bullets: ['Edle Lehr-Wandkunst für TCM-Praxen', 'Erklärt elementare und energetische Systeme ruhig und klar', 'Premium-Archivdruck — nicht personalisiert'] },
        13: { title: 'TCM Wellness-Poster', bullets: ['Ruhiges Lehrposter für Wellness- & Behandlungsräume', 'Visualisiert zentrale TCM-Prinzipien', 'Premium-Archivdruck — nicht personalisiert'] },
        14: { title: 'TCM Yoga-Studio-Poster', bullets: ['Lehrposter für Yoga- & Studio-Wände', 'Elementbeziehungen auf einen Blick', 'Premium-Archivdruck — nicht personalisiert'] },
      },
      articles: {
        r1: { tag: 'Grundlagen', title: 'Was ist BaZi? Die vier Säulen des Schicksals', meta: '6 Min. Lesezeit · Atelier-Journal', excerpt: 'Jahr, Monat, Tag und Stunde deiner Geburt ergeben vier „Säulen" — die Landkarte deiner Energie.', body: ['BaZi (chinesisch 八字, „acht Zeichen") liest deinen Geburtszeitpunkt als vier Säulen: Jahr, Monat, Tag und Stunde. Jede Säule trägt einen Himmelsstamm und einen Erdzweig — zusammen acht Zeichen, die deine Konstitution beschreiben.', 'Die Tagessäule gilt als dein Kern, das „Tagesmeister"-Zeichen. Von ihm aus betrachtet man, wie die übrigen Säulen stützen oder fordern. So entsteht ein Bild von Stärken, Mustern und günstigen Zeitfenstern — keine Wahrsagerei, sondern ein Werkzeug zur Selbstreflexion.', 'Auf deinem Poster halten wir genau diese acht Zeichen fest: ein ruhiges, persönliches Diagramm, das Gespräche in Praxis und Studio eröffnet und zuhause ein stiller Begleiter ist.'] },
        r2: { tag: 'Theorie', title: 'Die fünf Elemente und ihre Balance', meta: '5 Min. Lesezeit · Atelier-Journal', excerpt: 'Holz, Feuer, Erde, Metall, Wasser — wie ihr Zusammenspiel deine Säulen färbt.', body: ['Jedes der acht Zeichen gehört zu einem der fünf Elemente. Sie nähren und kontrollieren einander in einem Kreislauf: Holz nährt Feuer, Feuer schafft Erde, Erde trägt Metall, Metall sammelt Wasser, Wasser nährt Holz.', 'Ein BaZi-Chart zeigt, welche Elemente reichlich vorhanden sind und welche fehlen. Diese Balance ist der Kern vieler TCM- und Wellness-Beratungen — von Ernährung bis Raumgestaltung.', 'Die fünf Hintergrundfarben unserer Poster greifen diese Sprache auf: Sandstein für Erde, Salbei für Holz, Terracotta für Feuer, Indigo für Wasser, Anthrazit für Metall.'] },
        r3: { tag: 'Für die Praxis', title: 'BaZi in der TCM-Praxis: Raum & Atmosphäre', meta: '4 Min. Lesezeit · Atelier-Journal', excerpt: 'Wie ein persönliches Chart Vertrauen schafft und Behandlungsräume erdet.', body: ['Ein an der Wand sichtbares BaZi-Poster signalisiert Tiefe: Es zeigt Klient:innen, dass hier mit Tradition und Sorgfalt gearbeitet wird. Das senkt die Einstiegshürde für ein Gespräch.', 'In Behandlungsräumen schaffen ruhige Töne wie Indigo oder Salbei eine ruhige, geerdete Atmosphäre. Ein großes Format mit klarer Fernwirkung erdet den Raum, ohne ihn zu überladen.', 'Viele Praxen bieten personalisierte Charts als Geschenk oder Zusatzleistung an — ein hochwertiges, sinnstiftendes Mitbringsel, das die Bindung zur Praxis stärkt.'] },
      },
      shopFaqs: [
        { q: 'Wie entsteht mein BaZi-Poster?', a: 'Aus Geburtsdatum, -zeit und -ort, die du eingibst, gestalten wir ein symbolisches Vier-Säulen-Kunstwerk (Jahr, Monat, Tag, Stunde), das aufs Poster gebracht wird.' },
        { q: 'Welche Daten brauche ich für die Bestellung?', a: 'Geburtsdatum, möglichst genaue Geburtszeit und Geburtsort. Optional ein Name fürs Poster.' },
        { q: 'Ich kenne meine genaue Geburtszeit nicht — geht das trotzdem?', a: 'Ja — wähle einfach „Ich kenne meine Geburtszeit nicht“ und wir verwenden 12:00 Uhr (Mittag) als Standardannahme. Dein Poster wird auf Grundlage dieses Ersatzwertes gestaltet.' },
        { q: 'Wie lange dauern Produktion und Versand?', a: 'Auftragsfertigung plus 5–7 Werktage Versand, weltweit. Kostenloser Versand ab 80 €.' },
        { q: 'Welche Formate, Rahmen und Farben gibt es?', a: 'Mehrere Formate, Rahmenfarben und Hintergrund-Paletten; alles im Konfigurator wählbar mit Live-Vorschau.' },
        { q: 'Auf welchem Papier wird gedruckt?', a: 'Archiv-Pigmentdruck in Museumsqualität, gefertigt in Deutschland.' },
        { q: 'Kann ich mein Poster vor dem Kauf sehen?', a: 'Ja, der Konfigurator zeigt eine Live-Vorschau mit deinen Daten, Rahmen und Hintergrund.' },
        { q: 'Was ist die digitale BaZi-Chart-Analyse?', a: 'Eine persönliche 10–15-seitige PDF-Auswertung deines Charts, einzeln oder als Bundle erhältlich.' },
        { q: 'Wie sicher ist die Zahlung?', a: 'Verschlüsselte Bezahlung über PayPal, Apple Pay und Google Pay.' },
        { q: 'Rückgabe & Umtausch?', a: 'PLATZHALTER — an eure tatsächliche Rückgabe-/Widerrufsrichtlinie anpassen; personalisierte Artikel sind ggf. vom Widerruf ausgenommen.', placeholder: true },
      ],
      faqDefs: {
        details: { q: 'Details & Material', a: 'Feinkörniger Fine-Art-Druck auf 250 g/m² säurefreiem Naturpapier, lichtecht über Jahrzehnte. Massivholzrahmen mit entspiegeltem Echtglas. Jedes Poster wird im Atelier nummeriert.' },
        size: { q: 'Größenberater', a: 'A3 (30×42 cm) für Nischen & Regale, A2 (42×59 cm) als vielseitiger Standard für Praxiswände, A1 (59×84 cm) für große Fernwirkung im Empfangs- oder Wartebereich.' },
        ship: { q: 'Versand & Produktion', a: 'Produktion in 3 Werktagen, anschließend klimaneutraler Versand (DE 1–2 Tage). Kostenloser Versand ab 80 €. Personalisierte Artikel werden auf Bestellung gefertigt — siehe Rückgaberichtlinie; deine gesetzlichen Rechte bei Mängeln bleiben unberührt.' },
        bazi: { q: 'Über deine Personalisierung', a: 'Aus Datum, Uhrzeit und Ort, die du eingibst, gestalten wir ein symbolisches Vier-Säulen-Layout mit Himmelsstämmen und Erdzweigen. Wenn du deine Geburtszeit nicht kennst, verwenden wir 12:00 Uhr (Mittag) als Standardannahme — das kann das Ergebnis beeinflussen.' },
      },
    },
  },

  FR: {
    announce: { shipping: 'Livraison offerte dès {amount}', personalized: 'Personnalisé à partir de vos données de naissance', freeActivated: '✓ Livraison offerte activée ✦ Une œuvre symbolique inspirée de vos données de naissance', fallback: 'Impressions personnalisées premium. Paiement sécurisé. Production locale soignée.' },
    preview: { announce: 'Aperçu — notre boutique ouvre bientôt ✦', notForSale: 'Aperçu — pas encore disponible à l’achat', soon: 'Bientôt disponible' },
    // Divulgation du repli midi (REQ-018) — voir le commentaire EN.
    noonFallback: {
      fieldHint: 'Si votre heure de naissance est inconnue, nous utilisons 12:00 (midi) — cela peut influencer le résultat.',
      summaryNotice: 'Heure de naissance inconnue : composé avec 12:00 (midi) par défaut — cela peut influencer le résultat.',
    },
    nav: { home: 'Accueil', tagline: 'Astrologie · Art · Atelier', startPersonalizing: 'Commencer la personnalisation', poster: 'Posters personnalisés', collections: 'Collections', gifts: 'Cadeaux', tcm: 'MTC', bundles: 'Coffrets', digital: 'Digital', blog: 'Blog', wissen: 'Savoir', faq: 'FAQ', about: 'Atelier', contact: 'Contact', menu: 'Menu', open: 'Ouvrir le menu', close: 'Fermer', cart: 'Panier',
      // Navigation principale orientée boutique (REQ-003 / T-201) — exactement
      // les 8 entrées dans l’ordre de la spec. FAQ/Atelier/Contact/Blog absents.
      primary: { bestseller: 'Meilleures ventes', new: 'Nouveautés', posters: 'Posters', tcm: 'Posters MTC', wuxing: 'Wuxing', offers: 'Offres', posterSets: 'Sets de posters', inspiration: 'Inspiration' },
      posterMenu: { bazi: 'Posters BaZi personnalisés', birthChart: 'Posters carte du ciel personnalisés', couple: 'Posters compatibilité de couple personnalisés', fireHorse: 'Édition Cheval de Feu 2026', tcm: 'Posters pédagogiques MTC', digital: 'PDF d’analyse digitale', bundles: 'Coffrets', gifts: 'Collection cadeau' },
      mega: {
        personalized: { title: 'Posters personnalisés', baziPosters: 'Posters BaZi', personalizedPosters: 'Tous les personnalisés', compatibility: 'Compatibilité de couple', startPersonalizing: 'Commencer la personnalisation' },
        tcm: { title: 'Posters MTC', tcmPosters: 'Posters pédagogiques MTC' },
        wuxing: { title: 'Posters Wuxing', wuxingPosters: 'Cinq Éléments' },
        analysis: { title: 'PDF d’analyse', analysisPdfs: 'Analyse BaZi digitale' },
        bundles: { title: 'Coffrets', bundles: 'Coffrets & sets' },
        featured: { title: 'À la une', fireHorse: 'Cheval de Feu 2026', inspiration: 'Galerie d’inspiration', allCollections: 'Voir toutes les collections' },
        // Tuiles promo asset-light (REQ-004 / T-203). Text-forward : titre + CTA ;
        // le champ image est un placeholder générique jusqu’à la résolution d’OQ-001.
        tiles: {
          ctaShop: 'Acheter', ctaExplore: 'Explorer', ctaPersonalize: 'Personnaliser',
          posters: { baziTitle: 'Posters BaZi personnalisés', baziCta: 'Personnaliser', personalizedTitle: 'Tous les posters personnalisés', personalizedCta: 'Explorer' },
          tcm: { eduTitle: 'Posters pédagogiques MTC', eduCta: 'Acheter', practiceTitle: 'Pour cabinet & studio', practiceCta: 'Explorer' },
          wuxing: { fiveTitle: 'Poster Cinq Éléments', fiveCta: 'Acheter', balanceTitle: 'Série Équilibre Wuxing', balanceCta: 'Explorer' },
        },
      } },
    offers: {
      eyebrow: 'Offres', title: 'Offres & Éditions',
      intro: 'Un hub curé de nos univers — chaque section rassemble une vraie sélection que vous pouvez acheter directement. Pas de comptes à rebours inventés, pas de remises fictives : chaque prix est celui du produit.',
      placeholderLabel: 'Placeholder — visuels de campagne à venir',
      sections: {
        bundles: { eyebrow: 'Sets curés', title: 'Coffrets & sets', text: 'Des sets de posters coordonnés pour le cabinet, le studio et la maison — curés pour bien s’accorder.', cta: 'Voir tous les coffrets' },
        'fire-horse': { eyebrow: 'Édition limitée', title: 'Cheval de Feu 2026', text: 'L’édition numérotée et signée pour l’année du Cheval de Feu — jusqu’à épuisement des stocks.', cta: 'Voir l’édition' },
        bazi: { eyebrow: 'Personnalisé', title: 'Posters BaZi personnalisés', text: 'Œuvre symbolique des Quatre Piliers composée à partir des données de naissance que vous saisissez — fabriquée sur commande.', cta: 'Voir les posters BaZi' },
        tcm: { eyebrow: 'Prêt à expédier', title: 'Posters de savoir MTC', text: 'Des graphiques pédagogiques curés pour le cabinet et la maison — produits standard, sans données de naissance, expédiés tout de suite.', cta: 'Voir les posters MTC' },
      },
    },
    hero: { eyebrow: 'POSTERS ASTROLOGIQUES PERSONNALISÉS', title1: 'Votre', title2: 'Carte du Ciel', subtitle: 'Saisissez vos données de naissance et créez un poster BaZi ou carte du ciel personnalisé haut de gamme, conçu spécialement pour vous.', cta1: 'Commencer la personnalisation', cta2: 'Découvrir les collections' },
    personalize: {
      eyebrow: 'Personnaliser', title: 'Créez votre poster personnalisé', intro: 'Saisissez vos données de naissance, choisissez votre design et nous générons un poster haut de gamme conçu spécialement pour vous.',
      chooseType: '1 · Choisissez votre poster', from: 'dès',
      types: {
        bazi: { name: 'Poster BaZi personnalisé', sub: 'Votre thème des Quatre Piliers à partir de la date, l’heure & le lieu.' },
        birthchart: { name: 'Poster carte du ciel personnalisé', sub: 'Votre carte du ciel personnelle en œuvre murale raffinée.' },
        couple: { name: 'Poster compatibilité de couple', sub: 'Deux thèmes, une œuvre commune — pour les couples.' },
        firehorse: { name: 'Édition Cheval de Feu 2026', sub: 'Édition limitée pour l’année du Cheval de Feu.' },
        digital: { name: 'PDF d’analyse digitale', sub: 'Analyse PDF de 10–15 pages de votre thème.' },
        bundle: { name: 'Poster + Analyse digitale', sub: 'Votre poster plus l’analyse PDF complète.' },
      },
      birthHeading: '2 · Vos données de naissance', birthHeadingA: '2 · Personne A — données de naissance', birthHeadingB: 'Personne B — données de naissance',
      unknownTime: 'Je ne connais pas mon heure de naissance', unknownTimeHint: 'Si vous ne connaissez pas votre heure exacte de naissance, nous utilisons 12 h (midi) par défaut. Votre poster sera composé sur la base de cette valeur.',
      langHeading: '3 · Langue du poster',
      designHeading: '4 · Design', frameWord: 'Couleur du cadre', paletteWord: 'Palette de fond', posterBgHeading: 'Fond du poster', sizeHeading: 'Format',
      pdfAddon: 'Ajouter l’analyse PDF digitale', pdfNote: 'Une analyse personnelle de 10–15 pages de votre thème, livrée en téléchargement.', pdfBadge: 'PDF digital',
      summaryHeading: '5 · Vérifiez votre personnalisation', sumType: 'Produit', partnerName: 'Partenaire', timeUnknown: 'Inconnue — 12:00 PM par défaut', sumLang: 'Langue', sumDesign: 'Design', sumSize: 'Format', sumPrice: 'Prix',
      previewCertainty: 'Ce que vous voyez ici sera utilisé pour votre commande personnalisée. Vérifiez vos informations attentivement avant de commander.',
      trustData: 'Créé à partir de vos données de naissance', trustLogic: 'Composé en une œuvre symbolique', trustPreview: 'Aperçu avant la commande', trustPremium: 'Qualité d’impression premium',
      errFix: 'Veuillez compléter les champs de naissance surlignés avant d’ajouter au panier.',
      addToCart: 'Ajouter le poster personnalisé au panier',
    },
    trust: {
      apiTitle: 'À partir de vos données', apiSub: 'Une œuvre symbolique inspirée de vos données de naissance',
      deliveryTitle: 'Livraison 5–7 jours', deliverySub: 'Mondiale, suivie',
      secureTitle: 'Sécurisé par Stripe', secureSub: 'Paiement chiffré',
      artTitle: 'Art premium', artSub: 'Impression archive qualité musée',
      payTitle: 'Paiement sécurisé',
    },
    path: {
      eyebrow: 'Comment ça marche', title: 'Le Chemin Vers Votre Poster',
      steps: [
        { title: 'Saisissez vos données de naissance', desc: 'Date, heure et lieu de naissance — et ceux de votre partenaire pour un thème de couple.' },
        { title: 'Nous composons votre œuvre', desc: 'À partir de vos données, nous composons une œuvre personnelle et symbolique inspirée de vos données de naissance.' },
        { title: 'Aperçu & ajout au panier', desc: 'Un aperçu en direct et un récapitulatif complet de chaque détail avant de commander.' },
        { title: 'Livraison 5–7 jours', desc: 'Fabriqué sur commande, puis livraison neutre en carbone dans le monde en 5–7 jours.' },
      ],
    },
    catalog: { title: 'La Collection', more: 'Voir toute la collection →' },
    carousel: { prev: 'Produit précédent', next: 'Produit suivant', goto: 'Aller au produit', hint: 'Glissez pour explorer' },
    search: { placeholder: 'Rechercher produits, collections, posters…', hint: 'Essayez « BaZi », « Carte du ciel », « Couple », « Cheval de Feu », « Cadeau »…', noResults: 'Aucun résultat correspondant', error: 'Recherche temporairement indisponible', products: 'Posters', collections: 'Collections', gifts: { wedding: 'Idées cadeaux mariage', birthday: 'Idées cadeaux anniversaire', anniversary: 'Idées cadeaux anniversaire de couple', baby: 'Idées cadeaux baby shower', newbeginning: 'Cadeaux nouveau départ', studio: 'Cadeaux cabinet & studio' } },
    auth: {
      account: 'Compte', loginTitle: 'Bon retour', createTitle: 'Créez votre profil', forgotTitle: 'Réinitialiser le mot de passe', resetTitle: 'Définir un nouveau mot de passe',
      subtitle: 'Connectez-vous pour voir vos commandes et votre compte.',
      email: 'Adresse e-mail', password: 'Mot de passe', newPassword: 'Nouveau mot de passe',
      marketingConsent: 'J’accepte de recevoir des Energy Charts hebdomadaires, des informations produit, des annonces de lancement et des e-mails marketing de SizhuAtelier. Je peux me désinscrire à tout moment.',
      loginCta: 'Se connecter', createCta: 'Créer le profil', forgotCta: 'Envoyer le lien', resetCta: 'Enregistrer le mot de passe',
      toSignup: 'Créer un profil', toLogin: 'Retour à la connexion', toForgot: 'Mot de passe oublié ?',
      resetSent: 'Si cet e-mail existe, un lien de réinitialisation est en route.', resetDone: 'Votre mot de passe a été mis à jour.',
      dashboardTitle: 'Votre profil', logout: 'Se déconnecter', emailLabel: 'E-mail', newsletterStatus: 'Newsletter', marketingPrefs: 'Préférences marketing', saved: 'Enregistré ✦', orderHistory: 'Historique des commandes', noOrders: 'Aucune commande pour l’instant.',
      err: { invalid_email: 'Veuillez saisir une adresse e-mail valide.', weak_password: 'Le mot de passe doit comporter au moins 8 caractères.', email_taken: 'Un compte avec cet e-mail existe déjà.', invalid_credentials: 'E-mail ou mot de passe incorrect.', auth_unconfigured: 'Les comptes ne sont pas encore disponibles.', invalid_token: 'Ce lien de réinitialisation est invalide ou expiré.', unauthorized: 'Veuillez vous reconnecter.', wrong_password: 'Votre mot de passe actuel est incorrect.', payment_unconfigured: 'Le paiement n’est pas encore configuré.', rate_limited: 'Trop de tentatives — veuillez patienter un instant et réessayer.', server_error: 'Une erreur est survenue — veuillez réessayer.', network_error: 'Erreur réseau — veuillez réessayer.' },
    },
    account: {
      personalDetails: 'Données personnelles', name: 'Nom', namePh: 'Votre nom', language: 'Langue préférée', save: 'Enregistrer', saved: 'Enregistré ✦', cancel: 'Annuler', edit: 'Modifier', delete: 'Supprimer', status: 'Statut',
      changePassword: 'Changer le mot de passe', currentPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe', updatePassword: 'Mettre à jour', passwordChanged: 'Mot de passe mis à jour ✦',
      shippingAddresses: 'Adresses de livraison', billingAddress: 'Adresse de facturation', addAddress: 'Ajouter une adresse', editAddress: 'Modifier l’adresse', setDefault: 'Définir par défaut', default: 'Par défaut', noAddresses: 'Aucune adresse enregistrée.', sameAsShipping: 'Adresse de facturation identique à la livraison',
      fullName: 'Nom complet', line1: 'Adresse ligne 1', line2: 'Adresse ligne 2 (facultatif)', postalCode: 'Code postal', city: 'Ville', region: 'Région (facultatif)', country: 'Pays (2 lettres, ex. FR)', phone: 'Téléphone (facultatif)',
      paymentMethods: 'Moyens de paiement', paymentDesc: 'Vos cartes enregistrées sont gérées en toute sécurité par Stripe. Nous ne stockons jamais les numéros de carte.', managePayments: 'Gérer les moyens de paiement', paymentNone: 'Aucun moyen de paiement enregistré — ajoutez-en un au paiement.', paymentUnavailable: 'La gestion des paiements n’est pas encore disponible.',
      preferences: 'Préférences',
    },
    card: { bought: 'achetés', reviews: 'avis', sold: 'vendus', personalize: 'Personnaliser', personalLine: 'Créé à partir de votre date, heure & lieu de naissance.', shop: 'Voir le poster' },
    coll: {
      allPosters: 'Tous les posters personnalisés',
      cards: {
        bazi: { title: 'Posters BaZi personnalisés', desc: 'Transformez votre thème des Quatre Piliers en une impression murale personnalisée haut de gamme.', cta: 'Commencer la personnalisation' },
        birthchart: { title: 'Posters carte du ciel personnalisés', desc: 'Votre carte du ciel personnelle, conçue en œuvre murale raffinée.', cta: 'Commencer la personnalisation' },
        couple: { title: 'Posters compatibilité de couple', desc: 'Deux thèmes, une œuvre commune — pensée pour les couples.', cta: 'Commencer la personnalisation' },
        firehorse: { title: 'Édition Cheval de Feu 2026', desc: 'Une édition de collection limitée pour l’année du Cheval de Feu — prête à accrocher.', cta: 'Voir le poster' },
        digital: { title: 'PDF d’analyse digitale', desc: 'Une analyse personnelle de 10–15 pages de votre thème, en téléchargement.', cta: 'Découvrir' },
        bundles: { title: 'Coffrets', desc: 'Poster + analyse digitale, combinés à prix avantageux.', cta: 'Découvrir' },
        gifts: { title: 'Collection cadeau', desc: 'Un poster personnalisé porteur de sens — pour une personne que vous aimez.', cta: 'Commencer la personnalisation' },
      },
    },
    bundles: { eyebrow: 'Plus on prend, moins on paie', title: 'Coffrets', sub: 'Des ensembles assortis — posters et analyse digitale combinés, à prix avantageux.', add: 'Ajouter le coffret', save: 'Économisez' },
    newsletter: { eyebrow: 'Le Cercle de l’Atelier', title: 'Le Cosmic Pulse — Vos Energy Charts hebdomadaires', copy: 'Alignez vos journées avec une inspiration céleste. Abonnez-vous pour recevoir nos Energy Charts hebdomadaires directement dans votre boîte mail — une lecture astrologique introspective des mouvements cosmiques actuels, offrant un aperçu énergétique hebdomadaire pour les jours à venir. Vous recevrez aussi en avant-première nos actualités marketing — nouveautés, collections et offres exclusives. ✨ Pas de spam, uniquement du pertinent.', benefits: ['Energy Charts hebdomadaires dans votre boîte', 'Lancements de produits & collections', 'Campagnes d’idées cadeaux saisonnières'], placeholder: 'Votre adresse e-mail', langPref: 'E-mails en', button: 'S’abonner', consent: 'J’accepte de recevoir des Energy Charts hebdomadaires, des informations produit, des annonces de lancement et des e-mails marketing de SizhuAtelier. Je peux me désinscrire à tout moment. Voir notre', privacy: 'Politique de confidentialité', success: 'Bienvenue dans le Cercle de l’Atelier — vérifiez votre boîte mail pour confirmer.', error: 'Une erreur est survenue — veuillez réessayer.', consentErr: 'Veuillez accepter les conditions pour continuer.', fine: 'Double opt-in · désinscription à tout moment' },
    wissen: { eyebrow: 'Blog', title: 'Ce qui se cache derrière le BaZi', sub: 'Du contexte pour vos consultations et pour qui veut comprendre son poster.', read: 'Lire la suite →' },
    gifts: {
      eyebrow: 'Idées cadeaux', title: 'Trouvez un cadeau personnalisé porteur de sens', sub: 'Créé à partir de vraies données de naissance — raffiné, intentionnel et fait pour une personne. Ou un poster pédagogique prêt à accrocher pour un cabinet ou un studio.',
      personalizedTag: 'Personnalisé', shopTag: 'Prêt à expédier', ctaPersonalize: 'Créer un cadeau personnalisé', ctaShop: 'Acheter ce cadeau',
      cards: {
        wedding: { title: 'Cadeaux de mariage', copy: 'Un cadeau de mariage porteur de sens autour de deux personnes, leur lien et leur histoire symbolique commune.' },
        birthday: { title: 'Cadeaux d’anniversaire', copy: 'Un cadeau personnel créé à partir des données de naissance — pensé pour être intentionnel, raffiné et fait pour une personne.' },
        anniversary: { title: 'Cadeaux d’anniversaire de couple', copy: 'Célébrez une histoire commune avec une œuvre basée sur les données de naissance et la compatibilité symbolique.' },
        baby: { title: 'Cadeaux baby shower', copy: 'Un souvenir raffiné pour un nouveau chapitre de vie, créé à partir des données de naissance du bébé. Heure inconnue ? Nous utilisons 12:00 PM par défaut.' },
        newbeginning: { title: 'Cadeaux nouveau départ', copy: 'Pour un déménagement, un nouveau travail, une nouvelle année ou une remise à zéro — un rappel visuel symbolique de direction et de renouveau.' },
        spiritual: { title: 'Cadeaux spirituels', copy: 'Une œuvre contemplative des Cinq Éléments créée à partir des données de naissance — pour coins méditation et espaces de pleine conscience.' },
        couple: { title: 'Cadeaux de couple', copy: 'Deux thèmes en une œuvre commune — un poster de compatibilité fait pour les partenaires à partir des deux dates de naissance.' },
        housewarming: { title: 'Cadeaux de pendaison de crémaillère', copy: 'L’édition limitée Cheval de Feu 2026 — une pièce saisissante prête à accrocher pour un nouveau foyer. Livrée prête à encadrer.' },
        wellness: { title: 'Cadeaux studio bien-être', copy: 'Œuvre pédagogique apaisante pour salles de soin et de repos — explique les Cinq Éléments avec clarté. Prête à expédier.' },
        yoga: { title: 'Cadeaux studio de yoga', copy: 'Posters pédagogiques ancrants pour les murs de studio — terreux, clairs et prêts à accrocher. Non personnalisés.' },
        tcmpractice: { title: 'Cadeaux cabinet MTC', copy: 'Posters pédagogiques pour cabinets MTC et salles de soin — calmes, professionnels et prêts à encadrer.' },
      },
      faqTitle: 'FAQ cadeaux',
      faqs: [
        { q: 'Quels cadeaux sont personnalisés ?', a: 'Les posters BaZi, carte du ciel et compatibilité de couple sont créés à partir des données de naissance. Le Cheval de Feu et les posters pédagogiques TCM sont livrés prêts à accrocher et non personnalisés.' },
        { q: 'Et si je ne connais pas l’heure de naissance ?', a: 'Pas de souci — choisissez « Je ne connais pas mon heure de naissance » et nous utilisons 12:00 PM (midi) par défaut.' },
        { q: 'Puis-je l’offrir directement ?', a: 'Ajoutez un poster personnalisé ou un poster pédagogique au panier et commandez comme d’habitude.' },
      ],
    },
    faq: { eyebrow: 'FAQ', title: 'Questions fréquentes', viewFull: 'Voir toute la FAQ' },
    faqHome: [
      { q: 'Comment mon poster est-il personnalisé ?', a: 'Nous prenons la date, l’heure et le lieu de naissance que vous saisissez et composons une œuvre personnelle et symbolique — une mise en page visuelle structurée, inspirée de vos données de naissance et faite spécialement pour vous.' },
      { q: 'Et si je ne connais pas mon heure de naissance ?', a: 'Pas de souci — choisissez « Je ne connais pas mon heure de naissance » et nous utilisons 12:00 PM (midi) par défaut. Votre poster est créé sur la base de cette valeur.' },
      { q: 'Verrai-je un aperçu ou un récapitulatif avant de commander ?', a: 'Oui — le parcours de personnalisation affiche un aperçu en direct et un récapitulatif complet avant l’ajout au panier.' },
      { q: 'Combien de temps prend la livraison ?', a: 'La production prend quelques jours ouvrés, puis livraison neutre en carbone (DE 1–2 jours), dans le monde entier.' },
      { q: 'Puis-je retourner un poster personnalisé ?', a: 'Les articles personnalisés sont fabriqués sur commande et ne peuvent être retournés une fois la production lancée. Vos droits légaux subsistent en cas d’article endommagé, défectueux ou incorrect.' },
    ],
    // Modules de la page d’accueil V2 03/06/07/08/09 + 12 (REQ-008 / REQ-012).
    // Cadrage honnête — œuvre symbolique inspirée des données de naissance ;
    // aucune promesse de précision ni de santé.
    home: {
      world: {
        eyebrow: 'Acheter par univers', title: 'Trouvez votre univers produit', sub: 'Quatre univers curatés — de l’art de thème natal personnalisé aux posters pédagogiques prêts à accrocher.',
        cards: {
          bazi: { title: 'Posters BaZi', desc: 'Œuvre des quatre piliers personnalisée, inspirée de vos données de naissance.' },
          tcm: { title: 'Posters TCM', desc: 'Graphiques pédagogiques curatés des Cinq Éléments — prêts à expédier.' },
          wuxing: { title: 'Posters Wuxing', desc: 'Le cycle des Cinq Éléments en une impression calme et atmosphérique.' },
          personalized: { title: 'Posters personnalisés', desc: 'Chaque motif que nous composons à partir de vos données de naissance — fait pour vous.' },
        },
        cta: 'Découvrir l’univers',
      },
      firehorse: {
        eyebrow: 'Édition limitée · À la une', title: 'Cheval de Feu 2026', copy: 'L’édition limitée pour l’année du Cheval de Feu 2026 — numérotée et signée, jusqu’à épuisement des stocks. Une pièce de collection marquante, prête à accrocher.', cta: 'Découvrir le Cheval de Feu 2026',
      },
      compatibility: {
        eyebrow: 'Pour les couples', title: 'Posters de compatibilité à deux', copy: 'Deux thèmes natals réunis dans une œuvre calme et symbolique — inspirée de vos données de naissance partagées. Un cadeau personnel pour les mariages, anniversaires et emménagements.', ctaCollection: 'Voir les posters de couple', ctaPersonalize: 'Créer un poster de couple',
      },
      analysis: {
        eyebrow: 'Numérique', title: 'Analyse BaZi numérique en PDF', copy: 'Un PDF personnel de 10–15 pages qui restitue vos quatre piliers et l’équilibre des Cinq Éléments — une lecture restituée de vos saisies, seule ou à prix réduit avec un poster.', cta: 'Découvrir les PDF d’analyse',
      },
      inspiration: {
        eyebrow: 'Inspiration', title: 'Voir les posters en contexte', copy: 'Parcourez notre mur d’inspiration curaté — des mises en situation intérieures et des idées cadeaux qui renvoient directement aux collections et produits correspondants.', cta: 'Ouvrir la galerie d’inspiration',
      },
      seo: {
        title: 'Posters d’astrologie personnalisés, art mural TCM & Wuxing',
        intro: 'SizhuAtelier compose un art mural premium à partir de vos données de naissance et cure des posters pédagogiques autour de la symbolique est-asiatique. Chaque motif personnalisé est une œuvre symbolique inspirée de vos données de naissance — ni outil de divination ni conseil médical.',
        sections: [
          { heading: 'Posters BaZi personnalisés en ligne', body: 'Un poster BaZi présente les quatre piliers — année, mois, jour et heure de votre naissance — comme un diagramme calme et personnel, inspiré des données que vous saisissez.', linkLabel: 'Voir les posters BaZi', to: '/collections/bazi-posters' },
          { heading: 'Posters TCM pour cabinet, savoir & maison', body: 'Nos posters TCM sont des graphiques pédagogiques curatés des Cinq Éléments — conçus pour les salles de soin, les studios et la maison. Ils expliquent et décorent ; ils ne font aucune promesse de santé.', linkLabel: 'Voir les posters TCM', to: '/collections/tcm-posters' },
          { heading: 'Wuxing et les Cinq Éléments', body: 'Le poster Wuxing montre comment les cinq éléments se nourrissent et se contrôlent — un graphique de savoir calme et atmosphérique pour cabinet et maison.', linkLabel: 'Voir les posters Wuxing', to: '/collections/wuxing-posters' },
          { heading: 'Posters de couple & de compatibilité', body: 'Réunissez deux thèmes natals dans une œuvre symbolique — un cadeau personnel inspiré de vos données de naissance partagées.', linkLabel: 'Voir les posters de compatibilité', to: '/collections/compatibility-posters' },
        ],
        knowledgeLabel: 'Voir les posters en contexte',
        knowledgeTo: '/inspiration',
        keywordTodo: 'TODO contenu (OQ-007) : finaliser le jeu de mots-clés SEO avant le lancement avec une relecture SEO en langue native ; la structure H2 et les liens internes sont en place.',
      },
    },
    apiTrust: {
      eyebrow: 'Personnel', title: 'Pourquoi votre poster est vraiment personnalisé',
      copy: 'Chaque poster SizhuAtelier est composé à partir des données de naissance que vous fournissez. Nous traduisons vos données en une base visuelle structurée — une œuvre symbolique inspirée de vos données de naissance, non générique, faite spécialement pour vous.',
      badges: ['Créé à partir des données de naissance', 'Œuvre symbolique, faite pour vous', 'Aperçu personnalisé', 'Qualité d’impression premium', 'Fait uniquement pour vous'],
    },
    howItWorks: {
      eyebrow: 'Comment ça marche', title: 'De vos données de naissance à l’œuvre murale', cta: 'Commencer la personnalisation',
      steps: [
        { title: 'Saisissez vos données de naissance', desc: 'Date, heure et lieu de naissance — ceux de votre partenaire aussi pour un thème de couple.' },
        { title: 'Nous composons votre œuvre', desc: 'Nous transformons vos données de naissance en une base visuelle structurée — une œuvre symbolique qui s’en inspire.' },
        { title: 'Choisissez votre design', desc: 'Palette, cadre, format et langue du poster — avec un aperçu en direct.' },
        { title: 'Aperçu, puis impression', desc: 'Confirmez ce que vous voyez, et nous produisons votre œuvre murale personnalisée premium.' },
      ],
    },
    footer: { inspiration: 'Inspiration', howItWorks: 'Comment ça marche', about: 'Atelier', contact: 'Contact', faq: 'FAQ', shipping: 'Livraison', returns: 'Retours & rétractation', terms: 'CGV', privacy: 'Confidentialité', impressum: 'Mentions légales', claim: 'Personnalisé à partir de vos données de naissance · livraison neutre en carbone' },
    cart: { title: 'Panier', remaining: 'Plus que {amount} pour la livraison offerte !', reached: 'Livraison offerte activée !', empty: 'Encore vide', emptyHint: 'Composez votre premier poster BaZi.', toCollection: 'Vers la collection', alsoLike: 'Vous aimerez aussi', clear: 'Vider', remove: 'Retirer', subtotal: 'Sous-total', shipFree: 'Livraison offerte', ship: 'Livraison {amount}', inclVat: '· TVA incluse', checkout: 'Commander', ssl: '· sécurisé SSL', toastAdded: 'Ajouté au panier', toastSet: 'Coffret ajouté au panier', editPersonalization: 'Modifier la personnalisation', unknownTimeNotice: 'Heure de naissance : Inconnue — composée avec 12 h (midi) par défaut', reviewBirth: 'Vérifiez vos données de naissance ci-dessus avant de commander.', confirmLabel: 'Je confirme que mes informations de personnalisation sont correctes. Si mon heure de naissance est inconnue, je comprends que 12 h (midi) sera utilisé par défaut.', returnNotice: 'Les articles personnalisés sont fabriqués sur commande et ne peuvent être retournés ou annulés une fois la production lancée. Cela n’affecte pas vos droits légaux si un article arrive endommagé, défectueux, incorrect ou non conforme.', incompleteWarn: 'Certains articles n’ont pas toutes les informations de personnalisation — veuillez les compléter avant de commander.', signInPrompt: 'Connectez-vous pour utiliser votre adresse et votre moyen de paiement enregistrés.', signInCta: 'Se connecter' },
    checkout: { back: '← Retour au panier', title: 'Commande', expressHint: 'Paiement express — payez en quelques secondes', orGuest: 'ou payer en tant qu’invité', contact: 'Contact & livraison', noAccount: '— sans compte', email: 'Adresse e-mail', firstName: 'Prénom', lastName: 'Nom', street: 'Rue & numéro', zip: 'Code postal', city: 'Ville', placeOrder: 'Commander et payer', noHidden: '🔒 Aucun frais caché · livraison & taxes indiquées ci-dessous', summary: 'Votre commande', subtotal: 'Sous-total', shipping: 'Livraison', shipFree: 'Livraison offerte', total: 'Total', vat: 'dont {amount} de TVA (19 %)', emptyTitle: 'Votre panier est vide', toShop: 'Vers la boutique', orderToast: 'Commande confirmée — merci ! ✦', starting: 'Redirection vers le paiement sécurisé…', payError: 'Le paiement n’a pas pu démarrer. Veuillez réessayer.', successTitle: 'Merci — votre commande est confirmée ✦', successBody: 'Votre confirmation arrive par e-mail. Votre poster est fabriqué sur commande et expédié sous 5–7 jours ouvrés.', successHome: 'Retour à la boutique', successOrder: 'Référence de commande', cancelTitle: 'Paiement annulé', cancelBody: 'Aucun paiement n’a été effectué — votre panier est conservé.', cancelRetry: 'Retour au panier', signInPrompt: 'Connectez-vous pour utiliser votre adresse et votre moyen de paiement enregistrés.', signInCta: 'Se connecter', signedInAs: 'Connecté en tant que' },
    product: { back: '← Retour à la collection', reviews: 'avis', sold: 'vendus', inclVat: 'TVA incluse · livraison offerte dès {amount}', save: 'Économisez', addToCart: 'Ajouter au panier', secure: '🔒 Paiement sécurisé', returns: '↺ Remplacement si défaut', climate: '✺ Neutre en carbone', related: 'Souvent achetés ensemble', accessories: 'Cadre & accessoires', inspirationTitle: 'Voir en situation', inspirationCta: 'Voir la galerie d’inspiration', caption: 'Aperçu en direct — le cadre, le fond et vos données sont appliqués instantanément.', detail: 'Détail<br/>Macro cadre', lifestyle: 'Lifestyle<br/>Mise en situation', personalNotice: 'Cette œuvre est créée spécialement à partir des données de naissance et des choix de design que vous soumettez. Vérifiez vos informations attentivement avant de commander.', express: 'Redirection vers le paiement express …' },
    configurator: {
      step1: '1 · Données de naissance pour le calcul', date: 'Date de naissance', time: 'Heure de naissance', place: 'Lieu de naissance', placePh: 'p. ex. Munich', name: 'Nom sur le poster', namePh: 'p. ex. Mara',
      step2: '2 · Couleur du cadre', step3: '3 · Couleur de fond', step4: '4 · Format', inclusive: 'incl.',
    },
    options: {
      frames: { '#B98A5E': 'Chêne naturel', '#1B1B1B': 'Noir mat' },
      backgrounds: { '#E9DFCB': 'Grès', '#AFBCA6': 'Sauge', '#BC7A5E': 'Terracotta', '#2C3A57': 'Indigo', '#2A2A2C': 'Anthracite' },
      sizes: { A3: 'pour niches & étagères', A2: 'le standard polyvalent', A1: 'forte présence' },
    },
    pages: {
      tcmEyebrow: 'MTC · Cabinet · Studio', tcmTitle: 'Posters pour cabinet, yoga & bien-être', tcmIntro: 'Des posters apaisants des éléments et du BaZi pour salles de soin, studios et salles d’attente — ils ancrent l’espace et ouvrent la conversation.',
      bundlesEyebrow: 'Coffrets · prix avantageux', bundlesTitle: 'Coffrets', bundlesIntro: 'Des ensembles assortis — posters et analyse digitale combinés, à prix avantageux.',
      kollEyebrow: 'Tous les posters', kollTitle: 'La Collection', kollIntro: 'BaZi, Wuxing, l’édition limitée Cheval de Feu et nos posters cabinet & studio — tous les motifs d’un coup d’œil.',
      blogEyebrow: 'Journal', blogTitle: 'Blog', blogIntro: 'Du contexte sur le BaZi, l’astrologie chinoise et la MTC — pour vos consultations et pour qui veut comprendre son poster.', blogRead: 'Lire la suite →', articleBack: '← Journal', articleCta: 'Prêt(e) pour votre propre carte ?', articleCtaBtn: 'Composer mon poster →',
      digitalEyebrow: 'Digital · PDF', digitalHeroTitle: 'BaZi · Analyse personnelle', digitalAdd: 'Ajouter au panier', digitalSecure: 'Paiement sécurisé · téléchargement immédiat une fois prêt',
      notFound: 'Introuvable', toJournal: '← Vers le journal', productNotFound: 'Produit introuvable', toShop: 'Retour à la boutique →',
      about: {
        eyebrow: 'L’ATELIER',
        title1: 'Là où l’astrologie', title2: 'devient art',
        heroIntro: 'SizhuAtelier est un atelier d’art suisse qui traduit la sagesse de l’astrologie est-asiatique en œuvres murales intemporelles et personnalisées.',
        philTitle: 'Notre philosophie',
        philP1: 'Nous avons créé SizhuAtelier parce que la plupart des posters astrologiques sont génériques. Ils peuvent être décoratifs, mais ne reflètent pas vraiment la personne derrière eux.',
        philP2: 'Notre approche est différente : chaque poster commence par des données de naissance personnelles. Nous avons développé notre propre système de design pour transformer ces données en œuvre visuelle raffinée et symbolique.',
        philP3: 'Le résultat est un poster personnalisé qui semble intentionnel, raffiné et fait spécialement pour une seule personne.',
        processTitle: 'Le chemin vers votre poster',
        steps: [
          { num: '01', title: 'Saisir vos données de naissance', desc: 'Indiquez la date, l’heure et le lieu de votre naissance. Pour les thèmes de couple, aussi les données de votre partenaire.' },
          { num: '02', title: 'Composer votre œuvre', desc: 'Nous traduisons vos données de naissance en une mise en page visuelle symbolique qui reprend les motifs traditionnels des Quatre Piliers.' },
          { num: '03', title: 'Choisir un design', desc: 'Choisissez parmi différents styles, palettes de couleurs et mises en page qui correspondent à votre énergie.' },
          { num: '04', title: 'Imprimer à l’atelier', desc: 'Votre poster est imprimé sur papier Hahnemühle premium avec des encres d’archivage et emballé avec soin.' },
        ],
        materialsTitle: 'Des matériaux qui ont du sens',
        materialsIntro: 'Nous n’utilisons que des matériaux de la plus haute qualité. Chaque détail est choisi avec soin pour garantir la qualité esthétique et énergétique de votre poster.',
        materials: [
          { title: 'Papier Hahnemühle', desc: '100% coton, 308gsm, qualité musée. Sans acide pour une durée de vie de plus de 100 ans.' },
          { title: 'Encres d’archivage', desc: 'Encres à base de pigments résistantes aux UV. Des couleurs qui ne s’estompent pas.' },
          { title: 'Cadres en bois massif', desc: 'Cadres en bois massif issus de forêts durables. Disponibles en chêne, noyer et noir.' },
        ],
        ctaTitle: 'Prêt pour votre œuvre personnelle ?',
        ctaBtn1: 'Créer un poster', ctaBtn2: 'Contact',
      },
      contact: {
        heroTitle: 'Dites bonjour',
        heroIntro: 'Nous attendons votre message avec impatience — qu’il s’agisse d’une question, d’une demande spéciale ou d’une visite à l’atelier.',
        name: 'Nom', email: 'E-mail', subject: 'Objet', message: 'Message', send: 'Envoyer',
        subjectGeneral: 'Demande générale', subjectOrder: 'Commande', subjectCustom: 'Travail sur mesure', subjectVisit: 'Visite de l’atelier',
        directTitle: 'Contact direct',
        emailLabel: 'E-mail', instagramLabel: 'Instagram', atelierLabel: 'Atelier', atelierValue: 'SizhuAtelier|Suisse',
        responseLabel: 'Délai de réponse', responseValue: 'Nous répondons sous 24 heures.',
        faqTitle: 'Questions fréquentes',
        faqIntro: 'Réponses aux questions les plus importantes sur nos posters et le processus de commande.',
        faqs: [
          { q: 'Comment puis-je commander une œuvre ?', a: 'Choisissez simplement le format de poster souhaité dans notre collection, saisissez vos données de naissance et nous créons votre poster de thème personnalisé. Pour le sur-mesure, contactez-nous via le formulaire.' },
          { q: 'L’atelier accepte-t-il les commandes ?', a: 'Oui, nous réalisons volontiers des commandes individuelles. Mariages, événements d’entreprise, studios de bien-être ou cadeau spécial — contactez-nous et nous trouverons ensemble la solution parfaite.' },
          { q: 'Quels formats sont disponibles ?', a: 'Nos posters standard sont disponibles en A4, A3, A2 et 50×70 cm. Les cadres peuvent être ajoutés en chêne, noyer ou noir. Formats spéciaux sur demande.' },
          { q: 'Comment se déroule le processus ?', a: 'Après votre commande, vos données de naissance se transforment en une œuvre symbolique et nous créons une proposition de design. Après votre validation, nous imprimons votre poster à l’atelier et l’expédions sous 5–7 jours ouvrés.' },
          { q: 'Comment puis-je vous contacter ?', a: 'Contactez-nous par e-mail à hello@sizhuatelier.shop, via le formulaire de cette page ou directement sur Instagram @sizhuatelier. Nous répondons sous 24 heures.' },
          { q: 'Puis-je retourner mon poster ?', a: 'Chaque poster étant personnalisé, nous ne pouvons en principe pas accepter de retours. En cas de livraison endommagée ou d’erreur d’impression, nous procédons bien sûr à un échange gratuit.' },
        ],
      },
    },
    content: {
      digital: { title: 'Analyse digitale de carte BaZi', subtitle: 'PDF de 10–15 pages', desc: ['Une analyse PDF personnelle et détaillée de votre carte BaZi : les quatre piliers, votre maître du jour, l’équilibre des cinq éléments et ce qu’ils signifient pour vous.', 'Livrée en téléchargement une fois prête — seule ou à prix réduit dans un coffret avec un poster.'], bullets: ['Quatre piliers & maître du jour, clairement expliqués', 'Équilibre des cinq éléments — forces & schémas', '10–15 pages, en PDF à télécharger', 'Seule ou à prix réduit en coffret'] },
      digitalBundle: { title: 'Poster BaZi + Analyse digitale', sub: 'Votre poster personnalisé plus l’analyse PDF de 10–15 pages de votre carte.' },
      bundles: { b1: { title: 'Coffret Démarrage Cabinet', sub: '3 posters pour soin, accueil & salle d’attente' }, b2: { title: 'Trio Bien-être', sub: 'Une harmonie apaisante pour studio, couloir & salle de repos' } },
      bundleMeta: 'Poster + analyse PDF · prix avantageux', bundleMeta3: 'Coffret 3 pièces · prix avantageux',
      addons: { a1: { title: 'Passe-partout premium', note: 'Carton musée sans acide' }, a2: { title: 'Emballage cadeau', note: 'Recyclé, avec bandeau' }, a3: { title: 'Kit d’accrochage', note: 'Clou & niveau inclus' }, a4: { title: 'Chiffon pour verre', note: 'Microfibre, réutilisable' } },
      products: {
        1: { title: 'Carte de naissance BaZi — Quatre Piliers', bullets: ['Composé à partir de vos données de naissance en une œuvre symbolique — aucun motif générique', 'Impression sur papier naturel à grain fin, sans acide & résistant à la lumière', 'Cadre en bois massif avec verre antireflet', 'Production en 3 jours ouvrés, numéroté'] },
        2: { title: 'BaZi Édition Cabinet', bullets: ['Indigo apaisant pour salles de soin & d’attente', 'Grand format à forte présence à distance', 'Verre musée lavable, hygiénique', 'En option avec le nom du cabinet au lieu d’une personne'] },
        3: { title: 'Poster des Éléments BaZi', bullets: ['Vert sauge chaud — apaisant pour les pièces calmes', 'Met en avant l’équilibre des cinq éléments', 'Papier recyclé durable, certifié FSC', 'Apprécié aussi en bon cadeau'] },
        4: { title: 'BaZi Yoga-Flow', bullets: ['Terracotta terreux — s’accorde au bois & aux plantes', 'Format compact pour murs de studio', 'Cadre léger, fixation murale facile', 'Remise coffret pour plusieurs salles'] },
        5: { title: 'BaZi Lune & Étoiles', bullets: ['Anthracite profond pour un effet élégant et calme', 'Cadre noir mat premium', 'Lettrage doré en option', 'Un cadeau haut de gamme pour la nouvelle année'] },
        6: { title: 'BaZi Minimal', bullets: ['Grès épuré — discret & intemporel', 'Cadre noir, ligne nette', 'S’intègre à tout cabinet et intérieur', 'Best-seller pour une première commande'] },
        7: { title: 'Poster Wuxing Cinq Éléments', bullets: ['Bois, feu, terre, métal, eau en équilibre', 'Vert sauge apaisant pour toute pièce', 'Pédagogique pour cabinet & maison', 'Impression pigmentaire d’archivage qualité musée'] },
        8: { title: 'Cheval de Feu 2026 · Édition limitée', bullets: ['Édition limitée pour l’année du Cheval de Feu 2026', 'Terracotta puissant, numéroté & signé', 'Une pièce de collection avec du caractère', 'Jusqu’à épuisement des stocks'] },
        11: { title: 'TCM Cinq Éléments — Poster pédagogique', bullets: ['Bois, Feu, Terre, Métal, Eau et leurs relations', 'Un support pédagogique clair pour salles de soin et studios', 'Impression archive premium — non personnalisé'] },
        12: { title: 'Poster TCM Cabinet', bullets: ['Œuvre murale pédagogique raffinée pour cabinets de MTC', 'Explique les systèmes élémentaires et énergétiques avec clarté', 'Impression archive premium — non personnalisé'] },
        13: { title: 'Poster TCM Bien-être', bullets: ['Poster pédagogique apaisant pour espaces bien-être & soin', 'Visualise les principes fondamentaux de la MTC', 'Impression archive premium — non personnalisé'] },
        14: { title: 'Poster TCM Studio de Yoga', bullets: ['Poster pédagogique pour murs de yoga & studio', 'Relations élémentaires en un coup d’œil', 'Impression archive premium — non personnalisé'] },
      },
      articles: {
        r1: { tag: 'Bases', title: 'Qu’est-ce que le BaZi ? Les quatre piliers du destin', meta: '6 min de lecture · Journal de l’Atelier', excerpt: 'Année, mois, jour et heure de votre naissance forment quatre « piliers » — la carte de votre énergie.', body: ['Le BaZi (chinois 八字, « huit caractères ») lit votre moment de naissance comme quatre piliers : année, mois, jour et heure. Chaque pilier porte un tronc céleste et une branche terrestre — huit caractères qui décrivent votre constitution.', 'Le pilier du jour est considéré comme votre noyau, le « maître du jour ». À partir de lui, on observe comment les autres piliers soutiennent ou sollicitent. Cela dresse un tableau de forces, de schémas et de fenêtres favorables — non pas de la voyance, mais un outil d’introspection.', 'Votre poster fixe précisément ces huit caractères : un diagramme calme et personnel qui ouvre la conversation en cabinet et en studio, et un compagnon silencieux à la maison.'] },
        r2: { tag: 'Théorie', title: 'Les cinq éléments et leur équilibre', meta: '5 min de lecture · Journal de l’Atelier', excerpt: 'Bois, feu, terre, métal, eau — comment leur jeu colore vos piliers.', body: ['Chacun des huit caractères appartient à l’un des cinq éléments. Ils se nourrissent et se contrôlent en cycle : le bois nourrit le feu, le feu crée la terre, la terre porte le métal, le métal recueille l’eau, l’eau nourrit le bois.', 'Une carte BaZi montre quels éléments sont abondants et lesquels manquent. Cet équilibre est au cœur de nombreuses consultations MTC et bien-être — de la nutrition à l’aménagement.', 'Les cinq couleurs de fond de nos posters reprennent ce langage : grès pour la terre, sauge pour le bois, terracotta pour le feu, indigo pour l’eau, anthracite pour le métal.'] },
        r3: { tag: 'Pour le cabinet', title: 'Le BaZi en cabinet de MTC : espace & atmosphère', meta: '4 min de lecture · Journal de l’Atelier', excerpt: 'Comment une carte personnelle installe la confiance et ancre les salles de soin.', body: ['Un poster BaZi visible au mur signale de la profondeur : il montre aux client·e·s qu’on travaille ici avec tradition et soin. Cela abaisse le seuil pour engager la conversation.', 'Dans les salles de soin, des tons calmes comme l’indigo ou la sauge créent une atmosphère calme et ancrée. Un grand format à forte présence ancre l’espace sans le surcharger.', 'De nombreux cabinets proposent des cartes personnalisées en cadeau ou en prestation — un souvenir de qualité et porteur de sens qui renforce le lien avec le cabinet.'] },
      },
      shopFaqs: [
        { q: 'Comment ma carte BaZi est-elle créée ?', a: 'À partir de la date, de l’heure et du lieu de naissance que vous saisissez, nous composons une œuvre symbolique des quatre piliers (année, mois, jour, heure) mise en forme sur le poster.' },
        { q: 'Quelles données faut-il pour commander ?', a: 'Date de naissance, heure de naissance la plus précise possible, et lieu de naissance. En option, un nom pour le poster.' },
        { q: 'Je ne connais pas mon heure exacte de naissance — est-ce possible ?', a: 'Oui — cochez simplement « Je ne connais pas mon heure de naissance » et nous utilisons 12 h (midi) par défaut. Votre poster est composé sur la base de cette valeur.' },
        { q: 'Combien de temps prennent la production et la livraison ?', a: 'Production sur commande plus 5–7 jours ouvrés de livraison, dans le monde entier. Livraison offerte dès 80 €.' },
        { q: 'Quels formats, cadres et couleurs proposez-vous ?', a: 'Plusieurs formats, couleurs de cadre et palettes de fond ; tout est sélectionnable dans le configurateur avec un aperçu en direct.' },
        { q: 'Sur quel papier imprimez-vous ?', a: 'Impression pigmentaire d’archivage qualité musée, fabriquée en Allemagne.' },
        { q: 'Puis-je voir mon poster avant l’achat ?', a: 'Oui, le configurateur affiche un aperçu en direct avec vos données, le cadre et le fond.' },
        { q: 'Qu’est-ce que l’analyse digitale de carte BaZi ?', a: 'Une analyse PDF personnelle de 10–15 pages de votre carte, disponible seule ou en coffret.' },
        { q: 'Le paiement est-il sécurisé ?', a: 'Paiement chiffré via PayPal, Apple Pay et Google Pay.' },
        { q: 'Retours & échanges ?', a: 'ESPACE RÉSERVÉ — à adapter à votre politique réelle de retour/rétractation ; les articles personnalisés peuvent être exclus du droit de rétractation.', placeholder: true },
      ],
      faqDefs: {
        details: { q: 'Détails & matériau', a: 'Impression fine-art à grain fin sur papier naturel 250 g/m² sans acide, résistant à la lumière pendant des décennies. Cadre en bois massif avec véritable verre antireflet. Chaque poster est numéroté à l’atelier.' },
        size: { q: 'Guide des tailles', a: 'A3 (30×42 cm) pour niches & étagères, A2 (42×59 cm) le standard polyvalent pour les murs de cabinet, A1 (59×84 cm) pour une forte présence en accueil ou salle d’attente.' },
        ship: { q: 'Livraison & production', a: 'Production en 3 jours ouvrés, puis livraison neutre en carbone (DE 1–2 jours). Livraison offerte dès 80 €. Les articles personnalisés sont fabriqués sur commande — voir notre politique de retour ; vos droits légaux s’appliquent en cas de défaut.' },
        bazi: { q: 'À propos de votre personnalisation', a: 'À partir de la date, de l’heure et du lieu que vous saisissez, nous composons une mise en page symbolique des quatre piliers avec troncs célestes et branches terrestres. Si vous ne connaissez pas votre heure de naissance, nous utilisons 12 h (midi) par défaut — cela peut influencer le résultat.' },
      },
    },
  },

  // ES — machine-translated full locale (REQ-015 / T-501). Key parity with EN
  // is guaranteed (AT-015-1); translation QUALITY is an open value-risk the user
  // reviews (VR-ES-MACHINE-TRANSLATED). Not native-reviewed.
  ES: {
    announce: {
      shipping: 'Envío gratis a partir de {amount}',
      personalized: 'Personalizado a partir de tus datos de nacimiento',
      freeActivated: '✓ Envío gratis activado ✦ Una obra simbólica inspirada en tus datos de nacimiento',
      fallback: 'Impresiones personalizadas premium. Pago seguro. Producción local refinada.'
    },
    preview: {
      announce: 'Vista previa — nuestra tienda se lanza muy pronto ✦',
      notForSale: 'Vista previa — aún no disponible para la compra',
      soon: 'Próximamente'
    },
    noonFallback: {
      fieldHint: 'Si no conoces tu hora de nacimiento, usamos las 12:00 del mediodía — esto puede influir en el resultado.',
      summaryNotice: 'Hora de nacimiento desconocida: compuesto usando las 12:00 del mediodía por defecto — esto puede influir en el resultado.'
    },
    nav: {
      home: 'Inicio',
      tagline: 'Astrología · Arte · Atelier',
      startPersonalizing: 'Empieza a personalizar',
      poster: 'Pósteres personalizados',
      collections: 'Colecciones',
      gifts: 'Regalos',
      tcm: 'TCM',
      bundles: 'Packs',
      digital: 'Digital',
      blog: 'Blog',
      wissen: 'Conocimiento',
      faq: 'FAQ',
      about: 'Sobre nosotros',
      contact: 'Contacto',
      menu: 'Menú',
      open: 'Abrir menú',
      close: 'Cerrar',
      cart: 'Cesta',
      primary: {
        bestseller: 'Más vendidos',
        new: 'Novedades',
        posters: 'Pósteres',
        tcm: 'Pósteres TCM',
        wuxing: 'Wuxing',
        offers: 'Ofertas',
        posterSets: 'Sets de pósteres',
        inspiration: 'Inspiración'
      },
      posterMenu: {
        bazi: 'Pósteres BaZi personalizados',
        birthChart: 'Pósteres de carta natal personalizados',
        couple: 'Pósteres de compatibilidad de pareja personalizados',
        fireHorse: 'Edición Fire Horse 2026',
        tcm: 'Pósteres educativos de TCM',
        digital: 'PDFs de análisis digital',
        bundles: 'Packs',
        gifts: 'Colección de regalos'
      },
      mega: {
        personalized: {
          title: 'Pósteres personalizados',
          baziPosters: 'Pósteres BaZi',
          personalizedPosters: 'Todos los personalizados',
          compatibility: 'Compatibilidad de pareja',
          startPersonalizing: 'Empieza a personalizar'
        },
        tcm: {
          title: 'Pósteres TCM',
          tcmPosters: 'Pósteres educativos de TCM'
        },
        wuxing: {
          title: 'Pósteres Wuxing',
          wuxingPosters: 'Cinco elementos'
        },
        analysis: {
          title: 'PDFs de análisis',
          analysisPdfs: 'Análisis BaZi digital'
        },
        bundles: {
          title: 'Packs',
          bundles: 'Packs y sets'
        },
        featured: {
          title: 'Destacados',
          fireHorse: 'Fire Horse 2026',
          inspiration: 'Galería de inspiración',
          allCollections: 'Ver todas las colecciones'
        },
        tiles: {
          ctaShop: 'Comprar ahora',
          ctaExplore: 'Explorar',
          ctaPersonalize: 'Personalizar',
          posters: {
            baziTitle: 'Pósteres BaZi personalizados',
            baziCta: 'Personalizar',
            personalizedTitle: 'Todos los pósteres personalizados',
            personalizedCta: 'Explorar'
          },
          tcm: {
            eduTitle: 'Pósteres educativos de TCM',
            eduCta: 'Comprar ahora',
            practiceTitle: 'Para consulta y estudio',
            practiceCta: 'Explorar'
          },
          wuxing: {
            fiveTitle: 'Póster de los cinco elementos',
            fiveCta: 'Comprar ahora',
            balanceTitle: 'Serie Equilibrio Wuxing',
            balanceCta: 'Explorar'
          }
        }
      }
    },
    offers: {
      eyebrow: 'Ofertas',
      title: 'Ofertas y ediciones',
      intro: 'Un espacio cuidado con nuestros mundos — cada sección reúne una selección real que puedes comprar de inmediato. Sin cuentas atrás falsas, sin descuentos inventados: cada precio es el propio del producto.',
      placeholderLabel: 'Marcador de posición — las imágenes de campaña llegarán pronto',
      sections: {
        bundles: {
          eyebrow: 'Sets seleccionados',
          title: 'Packs y sets',
          text: 'Sets de pósteres coordinados para consulta, estudio y hogar — seleccionados para combinar bien entre sí.',
          cta: 'Comprar todos los packs'
        },
        'fire-horse': {
          eyebrow: 'Edición limitada',
          title: 'Fire Horse 2026',
          text: 'La edición numerada y firmada para el Año del Caballo de Fuego — hasta agotar existencias.',
          cta: 'Ver la edición'
        },
        bazi: {
          eyebrow: 'Personalizado',
          title: 'Pósteres BaZi personalizados',
          text: 'Obra simbólica de los Cuatro Pilares compuesta a partir de los datos de nacimiento que introduces — hecha por encargo.',
          cta: 'Comprar pósteres BaZi'
        },
        tcm: {
          eyebrow: 'Listo para enviar',
          title: 'Pósteres de conocimiento TCM',
          text: 'Láminas didácticas seleccionadas para consulta y hogar — productos estándar, sin datos de nacimiento, se envían de inmediato.',
          cta: 'Comprar pósteres TCM'
        }
      }
    },
    hero: {
      eyebrow: 'PÓSTERES DE ASTROLOGÍA PERSONALIZADOS',
      title1: 'Tu',
      title2: 'Carta natal',
      subtitle: 'Introduce tus datos de nacimiento y crea un póster BaZi o de carta natal personalizado premium diseñado específicamente para ti.',
      cta1: 'Empieza a personalizar',
      cta2: 'Explorar colecciones'
    },
    personalize: {
      eyebrow: 'Personalizar',
      title: 'Crea tu póster personalizado',
      intro: 'Introduce tus datos de nacimiento, elige tu diseño y generamos un póster premium hecho específicamente para ti.',
      chooseType: '1 · Elige tu póster',
      from: 'desde',
      types: {
        bazi: {
          name: 'Póster BaZi personalizado',
          sub: 'Tu carta de los Cuatro Pilares a partir de la fecha, hora y lugar de nacimiento.'
        },
        birthchart: {
          name: 'Póster de carta natal personalizado',
          sub: 'Tu carta estelar personal como refinado arte de pared.'
        },
        couple: {
          name: 'Póster de compatibilidad de pareja',
          sub: 'Dos cartas, una pieza compartida — para parejas.'
        },
        firehorse: {
          name: 'Edición Fire Horse 2026',
          sub: 'Edición limitada para el Año del Caballo de Fuego.'
        },
        digital: {
          name: 'PDF de análisis digital',
          sub: 'Análisis en PDF de 10–15 páginas de tu carta.'
        },
        bundle: {
          name: 'Póster + análisis digital',
          sub: 'Tu póster más el análisis completo en PDF.'
        }
      },
      birthHeading: '2 · Tus datos de nacimiento',
      birthHeadingA: '2 · Persona A — datos de nacimiento',
      birthHeadingB: 'Persona B — datos de nacimiento',
      unknownTime: 'No conozco mi hora de nacimiento',
      unknownTimeHint: 'Si no conoces tu hora exacta de nacimiento, usamos las 12:00 del mediodía como suposición por defecto. Tu póster se compondrá a partir de ese valor de reserva.',
      langHeading: '3 · Idioma del póster',
      designHeading: '4 · Diseño',
      frameWord: 'Color del marco',
      paletteWord: 'Paleta de fondo',
      posterBgHeading: 'Fondo del póster',
      sizeHeading: 'Tamaño',
      pdfAddon: 'Añade el análisis digital en PDF',
      pdfNote: 'Un análisis personal de 10–15 páginas de tu carta, entregado como descarga.',
      pdfBadge: 'PDF digital',
      summaryHeading: '5 · Revisa tu personalización',
      sumType: 'Producto',
      partnerName: 'Pareja',
      timeUnknown: 'Desconocida — 12:00 del mediodía por defecto',
      sumLang: 'Idioma',
      sumDesign: 'Diseño',
      sumSize: 'Tamaño',
      sumPrice: 'Precio',
      previewCertainty: 'Lo que ves aquí es lo que se usará para tu pedido personalizado. Revisa tus datos con atención antes de pedir.',
      trustData: 'Creado a partir de tus datos de nacimiento',
      trustLogic: 'Compuesto en una obra simbólica',
      trustPreview: 'Vista previa antes de pedir',
      trustPremium: 'Calidad de impresión premium',
      errFix: 'Por favor, completa los campos de datos de nacimiento resaltados antes de añadir a la cesta.',
      addToCart: 'Añadir póster personalizado a la cesta'
    },
    trust: {
      apiTitle: 'Hecho a partir de tus datos',
      apiSub: 'Una obra simbólica inspirada en tus datos de nacimiento',
      deliveryTitle: 'Entrega en 5–7 días',
      deliverySub: 'En todo el mundo, con seguimiento',
      secureTitle: 'Stripe Secure',
      secureSub: 'Pago cifrado',
      artTitle: 'Arte premium',
      artSub: 'Impresión de archivo de calidad museo',
      payTitle: 'Pago seguro'
    },
    path: {
      eyebrow: 'Cómo funciona',
      title: 'El camino hacia tu póster',
      steps: [
        {
          title: 'Introduce tus datos de nacimiento',
          desc: 'Tu fecha, hora y lugar de nacimiento — también los de tu pareja para una carta de pareja.'
        },
        {
          title: 'Componemos tu obra',
          desc: 'Tomamos tus datos de nacimiento y componemos una obra personal y simbólica inspirada en ellos.'
        },
        {
          title: 'Vista previa y añadir a la cesta',
          desc: 'Mira una vista previa en vivo y un resumen completo de cada detalle antes de pedir.'
        },
        {
          title: 'Entrega en 5–7 días',
          desc: 'Hecho por encargo y luego envío climáticamente neutro a todo el mundo en 5–7 días.'
        }
      ]
    },
    catalog: {
      title: 'La colección',
      more: 'Ver la colección completa →'
    },
    carousel: {
      prev: 'Producto anterior',
      next: 'Producto siguiente',
      goto: 'Ir al producto',
      hint: 'Desliza para explorar'
    },
    search: {
      placeholder: 'Busca productos, colecciones, pósteres…',
      hint: 'Prueba «BaZi», «Carta natal», «Pareja», «Fire Horse», «Regalo»…',
      noResults: 'No hay resultados que coincidan',
      error: 'La búsqueda no está disponible temporalmente',
      products: 'Pósteres',
      collections: 'Colecciones',
      gifts: {
        wedding: 'Ideas de regalo de boda',
        birthday: 'Ideas de regalo de cumpleaños',
        anniversary: 'Ideas de regalo de aniversario',
        baby: 'Ideas de regalo para baby shower',
        newbeginning: 'Regalos de nuevos comienzos',
        studio: 'Regalos para consulta y estudio'
      }
    },
    auth: {
      account: 'Cuenta',
      loginTitle: 'Bienvenido de nuevo',
      createTitle: 'Crea tu perfil',
      forgotTitle: 'Restablece tu contraseña',
      resetTitle: 'Establece una nueva contraseña',
      subtitle: 'Inicia sesión para ver tus pedidos y tu cuenta.',
      email: 'Dirección de correo electrónico',
      password: 'Contraseña',
      newPassword: 'Nueva contraseña',
      marketingConsent: 'Acepto recibir cartas energéticas semanales, novedades de productos, anuncios de lanzamientos y correos de marketing de SizhuAtelier. Puedo darme de baja en cualquier momento.',
      loginCta: 'Iniciar sesión',
      createCta: 'Crear perfil',
      forgotCta: 'Enviar enlace de restablecimiento',
      resetCta: 'Establecer nueva contraseña',
      toSignup: 'Crear un perfil',
      toLogin: 'Volver a iniciar sesión',
      toForgot: '¿Olvidaste tu contraseña?',
      resetSent: 'Si ese correo existe, te enviaremos un enlace de restablecimiento.',
      resetDone: 'Tu contraseña se ha actualizado.',
      dashboardTitle: 'Tu perfil',
      logout: 'Cerrar sesión',
      emailLabel: 'Correo electrónico',
      newsletterStatus: 'Boletín',
      marketingPrefs: 'Preferencias de marketing',
      saved: 'Guardado ✦',
      orderHistory: 'Historial de pedidos',
      noOrders: 'Aún no hay pedidos.',
      err: {
        invalid_email: 'Por favor, introduce una dirección de correo electrónico válida.',
        weak_password: 'La contraseña debe tener al menos 8 caracteres.',
        email_taken: 'Ya existe una cuenta con este correo electrónico.',
        invalid_credentials: 'Correo electrónico o contraseña incorrectos.',
        auth_unconfigured: 'Las cuentas aún no están disponibles.',
        invalid_token: 'Este enlace de restablecimiento no es válido o ha caducado.',
        unauthorized: 'Por favor, inicia sesión de nuevo.',
        wrong_password: 'Tu contraseña actual es incorrecta.',
        payment_unconfigured: 'El pago aún no está configurado.',
        rate_limited: 'Demasiados intentos — espera un momento y vuelve a intentarlo.',
        server_error: 'Algo salió mal — por favor, inténtalo de nuevo.',
        network_error: 'Error de red — por favor, inténtalo de nuevo.'
      }
    },
    account: {
      personalDetails: 'Datos personales',
      name: 'Nombre',
      namePh: 'Tu nombre',
      language: 'Idioma preferido',
      save: 'Guardar',
      saved: 'Guardado ✦',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      status: 'Estado',
      changePassword: 'Cambiar contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      updatePassword: 'Actualizar contraseña',
      passwordChanged: 'Contraseña actualizada ✦',
      shippingAddresses: 'Direcciones de envío',
      billingAddress: 'Dirección de facturación',
      addAddress: 'Añadir dirección',
      editAddress: 'Editar dirección',
      setDefault: 'Establecer como predeterminada',
      default: 'Predeterminada',
      noAddresses: 'Aún no hay direcciones guardadas.',
      sameAsShipping: 'Dirección de facturación igual que la de envío',
      fullName: 'Nombre completo',
      line1: 'Línea de dirección 1',
      line2: 'Línea de dirección 2 (opcional)',
      postalCode: 'Código postal',
      city: 'Ciudad',
      region: 'Provincia / región (opcional)',
      country: 'País (2 letras, p. ej. DE)',
      phone: 'Teléfono (opcional)',
      paymentMethods: 'Métodos de pago',
      paymentDesc: 'Tus tarjetas guardadas se gestionan de forma segura mediante Stripe. Nunca almacenamos números de tarjeta.',
      managePayments: 'Gestionar métodos de pago',
      paymentNone: 'Aún no hay métodos de pago guardados — añade uno al pagar.',
      paymentUnavailable: 'La gestión de pagos aún no está disponible.',
      preferences: 'Preferencias'
    },
    card: {
      bought: 'comprados',
      reviews: 'reseñas',
      sold: 'vendidos',
      personalize: 'Personalizar',
      personalLine: 'Creado a partir de tu fecha, hora y lugar de nacimiento.',
      shop: 'Comprar este póster'
    },
    coll: {
      allPosters: 'Todos los pósteres personalizados',
      cards: {
        bazi: {
          title: 'Pósteres BaZi personalizados',
          desc: 'Convierte tu carta de los Cuatro Pilares en una impresión de pared personalizada premium.',
          cta: 'Empieza a personalizar'
        },
        birthchart: {
          title: 'Pósteres de carta natal personalizados',
          desc: 'Tu carta estelar personal, diseñada como refinado arte de pared.',
          cta: 'Empieza a personalizar'
        },
        couple: {
          title: 'Pósteres de compatibilidad de pareja',
          desc: 'Dos cartas, una pieza compartida — hecha para parejas.',
          cta: 'Empieza a personalizar'
        },
        firehorse: {
          title: 'Edición Fire Horse 2026',
          desc: 'Una edición de coleccionista limitada para el Año del Caballo de Fuego — se envía lista para colgar.',
          cta: 'Comprar este póster'
        },
        digital: {
          title: 'PDFs de análisis digital',
          desc: 'Un análisis personal de 10–15 páginas de tu carta, como descarga.',
          cta: 'Explorar'
        },
        bundles: {
          title: 'Packs',
          desc: 'Póster + análisis digital, combinados a un precio especial.',
          cta: 'Explorar'
        },
        gifts: {
          title: 'Colección de regalos',
          desc: 'Un póster personalizado con significado — hecho para alguien a quien quieres.',
          cta: 'Empieza a personalizar'
        }
      }
    },
    bundles: {
      eyebrow: 'Llévate más, paga menos',
      title: 'Packs',
      sub: 'Sets seleccionados — pósteres y análisis digital combinados, a un precio especial.',
      add: 'Añadir set a la cesta',
      save: 'Ahorra'
    },
    newsletter: {
      eyebrow: 'El Círculo del Atelier',
      title: 'El Pulso Cósmico — Tus cartas energéticas semanales',
      copy: 'Alinea tus días con la inspiración celeste. Suscríbete para recibir nuestras cartas energéticas semanales directamente en tu bandeja de entrada — una lectura astrológica reflexiva de los cambios cósmicos actuales, que te ofrece una perspectiva energética semanal para los días por venir. También serás el primero en recibir nuestras novedades de marketing — lanzamientos de nuevos productos, colecciones y ofertas exclusivas. ✨ Sin spam, solo ideas relevantes.',
      benefits: [
        'Cartas energéticas semanales en tu bandeja de entrada',
        'Lanzamientos de nuevos productos y colecciones',
        'Campañas de ideas de regalo de temporada'
      ],
      placeholder: 'Tu dirección de correo electrónico',
      langPref: 'Correos en',
      button: 'Suscribirse',
      consent: 'Acepto recibir cartas energéticas semanales, novedades de productos, anuncios de lanzamientos y correos de marketing de SizhuAtelier. Puedo darme de baja en cualquier momento. Consulta nuestra',
      privacy: 'Política de privacidad',
      success: 'Bienvenido al Círculo del Atelier — revisa tu bandeja de entrada para confirmar tu suscripción.',
      error: 'Algo salió mal — por favor, inténtalo de nuevo.',
      consentErr: 'Por favor, acepta los términos para continuar.',
      fine: 'Doble confirmación · cancela cuando quieras'
    },
    wissen: {
      eyebrow: 'Blog',
      title: 'Lo que hay detrás del BaZi',
      sub: 'Información de fondo para tus consultas y para quien quiera entender su póster.',
      read: 'Leer más →'
    },
    gifts: {
      eyebrow: 'Ideas de regalo',
      title: 'Encuentra un regalo personalizado con significado',
      sub: 'Creado a partir de datos de nacimiento reales — refinado, intencional y hecho para una sola persona. O un póster educativo listo para colgar para una consulta o estudio.',
      personalizedTag: 'Personalizado',
      shopTag: 'Listo para enviar',
      ctaPersonalize: 'Crea un regalo personalizado',
      ctaShop: 'Comprar este regalo',
      cards: {
        wedding: {
          title: 'Regalos de boda',
          copy: 'Un regalo de boda con significado creado en torno a dos personas, su conexión y su historia simbólica compartida.'
        },
        birthday: {
          title: 'Regalos de cumpleaños',
          copy: 'Un regalo personal creado a partir de datos de nacimiento — diseñado para sentirse intencional, refinado y hecho para una sola persona.'
        },
        anniversary: {
          title: 'Regalos de aniversario',
          copy: 'Celebra una historia compartida con una pieza visual basada en datos de nacimiento personales y compatibilidad simbólica.'
        },
        baby: {
          title: 'Regalos para baby shower',
          copy: 'Un recuerdo refinado para un nuevo capítulo de la vida, creado a partir de los datos de nacimiento del bebé. ¿Hora de nacimiento desconocida? Usamos las 12:00 del mediodía por defecto.'
        },
        newbeginning: {
          title: 'Regalos de nuevos comienzos',
          copy: 'Para una mudanza, un nuevo trabajo, un nuevo año o un nuevo comienzo personal — un recordatorio visual simbólico de rumbo y renovación.'
        },
        spiritual: {
          title: 'Regalos espirituales',
          copy: 'Una pieza contemplativa de los cinco elementos creada a partir de datos de nacimiento personales — para rincones de meditación y espacios de calma.'
        },
        couple: {
          title: 'Regalos de pareja',
          copy: 'Dos cartas en una obra compartida — un póster de compatibilidad hecho para parejas a partir de los datos de nacimiento de ambos.'
        },
        housewarming: {
          title: 'Regalos de inauguración de hogar',
          copy: 'La edición limitada Fire Horse 2026 — una pieza llamativa, lista para colgar, para marcar un nuevo hogar. Se envía lista para enmarcar.'
        },
        wellness: {
          title: 'Regalos para estudios de bienestar',
          copy: 'Arte de pared educativo y relajante para salas de tratamiento y descanso — que explica los cinco elementos con claridad visual. Listo para enviar.'
        },
        yoga: {
          title: 'Regalos para estudios de yoga',
          copy: 'Pósteres didácticos que aportan calma para las paredes del estudio — terrosos, claros y listos para colgar. No personalizados.'
        },
        tcmpractice: {
          title: 'Regalos para consultas de TCM',
          copy: 'Pósteres educativos para consultas de TCM y salas de tratamiento — serenos, profesionales y listos para enmarcar.'
        }
      },
      faqTitle: 'Preguntas frecuentes sobre regalos',
      faqs: [
        {
          q: '¿Qué regalos son personalizados?',
          a: 'Los pósteres BaZi, de carta natal y de compatibilidad de pareja se crean a partir de datos de nacimiento. Los pósteres educativos Fire Horse y TCM se envían listos para colgar y no son personalizados.'
        },
        {
          q: '¿Y si no conozco la hora de nacimiento del destinatario?',
          a: 'Sin problema — elige «No conozco mi hora de nacimiento» y usamos las 12:00 del mediodía como suposición por defecto.'
        },
        {
          q: '¿Puedo enviarlo directamente como regalo?',
          a: 'Añade un póster personalizado o un póster educativo a tu cesta y paga como de costumbre.'
        }
      ]
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Preguntas frecuentes',
      viewFull: 'Ver todas las preguntas frecuentes'
    },
    faqHome: [
      {
        q: '¿Cómo se personaliza mi póster?',
        a: 'Tomamos la fecha, hora y lugar de nacimiento que introduces y los usamos para componer una obra personal y simbólica — una composición visual estructurada inspirada en tus datos de nacimiento y hecha específicamente para ti.'
      },
      {
        q: '¿Y si no conozco mi hora de nacimiento?',
        a: 'Sin problema — elige «No conozco mi hora de nacimiento» y usamos las 12:00 del mediodía como suposición por defecto. Tu póster se compone a partir de ese valor de reserva.'
      },
      {
        q: '¿Veré una vista previa o un resumen antes de pedir?',
        a: 'Sí — el proceso de personalización muestra una vista previa en vivo y un resumen completo de cada detalle antes de añadir a la cesta.'
      },
      {
        q: '¿Cuánto tarda el envío?',
        a: 'La producción tarda unos días laborables y luego el envío climáticamente neutro (DE 1–2 días), a todo el mundo.'
      },
      {
        q: '¿Puedo devolver un póster personalizado?',
        a: 'Los artículos personalizados se hacen por encargo y no se pueden devolver una vez iniciada la producción. Tus derechos legales se mantienen para artículos dañados, defectuosos o incorrectos.'
      }
    ],
    home: {
      world: {
        eyebrow: 'Compra por mundo',
        title: 'Encuentra tu mundo de producto',
        sub: 'Cuatro mundos seleccionados — desde arte de carta natal personalizado hasta pósteres didácticos listos para colgar.',
        cards: {
          bazi: {
            title: 'Pósteres BaZi',
            desc: 'Obra de los Cuatro Pilares personalizada, inspirada en tus datos de nacimiento.'
          },
          tcm: {
            title: 'Pósteres TCM',
            desc: 'Láminas didácticas seleccionadas de los cinco elementos — listas para enviar.'
          },
          wuxing: {
            title: 'Pósteres Wuxing',
            desc: 'El ciclo de los cinco elementos como una impresión serena y atmosférica.'
          },
          personalized: {
            title: 'Pósteres personalizados',
            desc: 'Cada motivo que componemos a partir de tus datos de nacimiento — hecho para ti.'
          }
        },
        cta: 'Explorar mundo'
      },
      firehorse: {
        eyebrow: 'Edición limitada · Destacado',
        title: 'Fire Horse 2026',
        copy: 'La edición limitada para el Año del Caballo de Fuego 2026 — numerada y firmada, hasta agotar existencias. Una llamativa pieza de coleccionista, lista para colgar.',
        cta: 'Descubre Fire Horse 2026'
      },
      compatibility: {
        eyebrow: 'Para parejas',
        title: 'Pósteres de compatibilidad para dos',
        copy: 'Dos cartas natales reunidas en una obra serena y simbólica — inspirada en vuestros datos de nacimiento compartidos. Un regalo personal para bodas, aniversarios y nuevos hogares.',
        ctaCollection: 'Ver pósteres de pareja',
        ctaPersonalize: 'Empezar un póster de pareja'
      },
      analysis: {
        eyebrow: 'Digital',
        title: 'Análisis BaZi digital en PDF',
        copy: 'Un PDF personal de 10–15 páginas que recoge tus cuatro pilares y el equilibrio de los cinco elementos — una lectura registrada de tus datos, disponible por separado o con descuento junto a un póster.',
        cta: 'Explorar los PDFs de análisis'
      },
      inspiration: {
        eyebrow: 'Inspiración',
        title: 'Mira los pósteres en contexto',
        copy: 'Explora nuestro muro de inspiración seleccionado — montajes de interiores e ideas de regalo que enlazan directamente con las colecciones y productos correspondientes.',
        cta: 'Abrir la galería de inspiración'
      },
      seo: {
        title: 'Pósteres de astrología personalizados, arte de pared TCM y Wuxing',
        intro: 'SizhuAtelier compone arte de pared premium a partir de tus datos de nacimiento y selecciona pósteres educativos en torno al simbolismo del Este asiático. Cada motivo personalizado es una obra simbólica inspirada en tus datos de nacimiento — no es una herramienta de adivinación ni un consejo médico.',
        sections: [
          {
            heading: 'Pósteres BaZi personalizados online',
            body: 'Un póster BaZi presenta los cuatro pilares — año, mes, día y hora de tu nacimiento — como un diagrama personal y sereno, inspirado en los datos que introduces.',
            linkLabel: 'Comprar pósteres BaZi',
            to: '/collections/bazi-posters'
          },
          {
            heading: 'Pósteres TCM para consulta, conocimiento y hogar',
            body: 'Nuestros pósteres TCM son láminas didácticas seleccionadas de los cinco elementos — diseñadas para salas de tratamiento, estudios y hogar. Explican y decoran; no prometen ningún beneficio para la salud.',
            linkLabel: 'Comprar pósteres TCM',
            to: '/collections/tcm-posters'
          },
          {
            heading: 'Wuxing y los cinco elementos',
            body: 'El póster Wuxing muestra cómo los cinco elementos se nutren y se controlan entre sí — una lámina de conocimiento serena y atmosférica para consulta y hogar.',
            linkLabel: 'Comprar pósteres Wuxing',
            to: '/collections/wuxing-posters'
          },
          {
            heading: 'Pósteres de pareja y compatibilidad',
            body: 'Reúne dos cartas natales en una obra simbólica — un regalo personal inspirado en vuestros datos de nacimiento compartidos.',
            linkLabel: 'Comprar pósteres de compatibilidad',
            to: '/collections/compatibility-posters'
          }
        ],
        knowledgeLabel: 'Mira los pósteres en contexto',
        knowledgeTo: '/inspiration',
        keywordTodo: 'TAREA de contenido (OQ-007): finaliza el conjunto de palabras clave SEO con una revisión SEO en idioma nativo antes del lanzamiento; la estructura de H2 y los enlaces internos ya están en su sitio.'
      }
    },
    apiTrust: {
      eyebrow: 'Personal',
      title: 'Por qué tu póster es verdaderamente personalizado',
      copy: 'Cada póster de SizhuAtelier se compone a partir de los datos de nacimiento que proporcionas. Convertimos tus datos en una base visual estructurada — una obra simbólica inspirada en tus datos de nacimiento, para que tu pieza no sea genérica sino hecha específicamente para ti.',
      badges: [
        'Creado a partir de datos de nacimiento',
        'Obra simbólica, hecha para ti',
        'Vista previa personalizada',
        'Calidad de impresión premium',
        'Hecho solo para ti'
      ]
    },
    howItWorks: {
      eyebrow: 'Cómo funciona',
      title: 'De tus datos de nacimiento al arte de pared',
      cta: 'Empieza a personalizar',
      steps: [
        {
          title: 'Introduce tus datos de nacimiento',
          desc: 'Tu fecha, hora y lugar de nacimiento — también los de tu pareja para una carta de pareja.'
        },
        {
          title: 'Componemos tu obra',
          desc: 'Convertimos tus datos de nacimiento en una base visual estructurada — una obra simbólica inspirada en ellos.'
        },
        {
          title: 'Elige tu diseño',
          desc: 'Elige tu paleta, marco, tamaño e idioma del póster — con una vista previa en vivo.'
        },
        {
          title: 'Vista previa y luego imprimimos',
          desc: 'Confirma lo que ves y producimos tu arte de pared personalizado premium.'
        }
      ]
    },
    footer: {
      inspiration: 'Inspiración',
      howItWorks: 'Cómo funciona',
      about: 'Sobre nosotros',
      contact: 'Contacto',
      faq: 'FAQ',
      shipping: 'Envío',
      returns: 'Devoluciones y desistimiento',
      terms: 'Términos',
      privacy: 'Privacidad',
      impressum: 'Aviso legal',
      claim: 'Personalizado a partir de tus datos de nacimiento · envío climáticamente neutro'
    },
    cart: {
      title: 'Cesta',
      remaining: '¡Solo te faltan {amount} para el envío gratis!',
      reached: '¡Envío gratis activado!',
      empty: 'Vacía',
      emptyHint: 'Diseña tu primer póster BaZi.',
      toCollection: 'A la colección',
      alsoLike: 'También te puede gustar',
      clear: 'Vaciar la cesta',
      remove: 'Quitar',
      subtotal: 'Subtotal',
      shipFree: 'Envío gratis',
      ship: 'Envío {amount}',
      inclVat: '· IVA incl.',
      checkout: 'Pagar',
      ssl: '· protegido con SSL',
      toastAdded: 'Añadido a la cesta',
      toastSet: 'Set añadido a la cesta',
      editPersonalization: 'Editar personalización',
      unknownTimeNotice: 'Hora de nacimiento: Desconocida — compuesto con las 12:00 del mediodía como suposición por defecto',
      reviewBirth: 'Revisa tus datos de nacimiento de arriba antes de pagar.',
      confirmLabel: 'Confirmo que los datos de mi personalización son correctos. Si mi hora de nacimiento es desconocida, entiendo que se usarán las 12:00 del mediodía como suposición por defecto.',
      returnNotice: 'Los artículos personalizados se hacen por encargo y no se pueden devolver ni cancelar una vez iniciada la producción. Esto no afecta a tus derechos legales si un artículo llega dañado, defectuoso, incorrecto o no conforme a lo descrito.',
      incompleteWarn: 'A algunos artículos les faltan datos de personalización obligatorios — por favor, complétalos antes de pagar.',
      signInPrompt: 'Inicia sesión para usar tu dirección y método de pago guardados.',
      signInCta: 'Iniciar sesión'
    },
    checkout: {
      back: '← Volver a la cesta',
      title: 'Pagar',
      expressHint: 'Pago exprés — paga en segundos',
      orGuest: 'o paga como invitado',
      contact: 'Contacto y entrega',
      noAccount: '— no necesitas cuenta',
      email: 'Dirección de correo electrónico',
      firstName: 'Nombre',
      lastName: 'Apellidos',
      street: 'Calle y número',
      zip: 'Código postal',
      city: 'Ciudad',
      placeOrder: 'Realizar pedido ahora',
      noHidden: '🔒 Sin costes ocultos · envío e impuestos mostrados abajo',
      summary: 'Tu pedido',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      shipFree: 'Envío gratis',
      total: 'Total',
      vat: 'IVA {amount} incl. (19%)',
      emptyTitle: 'Tu cesta está vacía',
      toShop: 'A la tienda',
      orderToast: 'Pedido confirmado — ¡gracias! ✦',
      starting: 'Redirigiendo al pago seguro…',
      payError: 'No se pudo iniciar el pago. Por favor, inténtalo de nuevo.',
      successTitle: 'Gracias — tu pedido está confirmado ✦',
      successBody: 'Te hemos enviado la confirmación por correo. Tu póster se hace por encargo y se envía en 5–7 días laborables.',
      successHome: 'Volver a la tienda',
      successOrder: 'Referencia del pedido',
      cancelTitle: 'Pago cancelado',
      cancelBody: 'No se realizó ningún cargo — tu cesta sigue aquí cuando estés listo.',
      cancelRetry: 'Volver a la cesta',
      signInPrompt: 'Inicia sesión para usar tu dirección y método de pago guardados.',
      signInCta: 'Iniciar sesión',
      signedInAs: 'Sesión iniciada como'
    },
    product: {
      back: '← Volver a la colección',
      reviews: 'reseñas',
      sold: 'vendidos',
      inclVat: 'IVA incl. · envío gratis a partir de {amount}',
      save: 'Ahorra',
      addToCart: 'Añadir al carrito',
      secure: '🔒 Pago seguro',
      returns: '↺ Reemplazo si está defectuoso',
      climate: '✺ Climáticamente neutro',
      related: 'Comprados juntos habitualmente',
      accessories: 'Marco y accesorios',
      inspirationTitle: 'Míralo en contexto',
      inspirationCta: 'Explora la galería de inspiración',
      caption: 'Vista previa en vivo — el marco, el fondo y tus datos se aplican al instante.',
      detail: 'Detalle<br/>Macro del marco',
      lifestyle: 'Ambiente<br/>Montaje de consulta',
      personalNotice: 'Esta obra se crea específicamente a partir de los datos de nacimiento que has enviado y de tus elecciones de diseño. Por favor, revisa tus datos con atención antes de pagar.',
      express: 'Redirigiendo al pago exprés…'
    },
    configurator: {
      step1: '1 · Datos de nacimiento para tu composición',
      date: 'Fecha de nacimiento',
      time: 'Hora de nacimiento',
      place: 'Lugar de nacimiento',
      placePh: 'p. ej. Múnich',
      name: 'Nombre en el póster',
      namePh: 'p. ej. Mara',
      step2: '2 · Color del marco',
      step3: '3 · Color de fondo',
      step4: '4 · Formato',
      inclusive: 'incl.'
    },
    options: {
      frames: {
        '#B98A5E': 'Roble natural',
        '#1B1B1B': 'Negro mate'
      },
      backgrounds: {
        '#E9DFCB': 'Arenisca',
        '#AFBCA6': 'Salvia',
        '#BC7A5E': 'Terracota',
        '#2C3A57': 'Índigo',
        '#2A2A2C': 'Antracita'
      },
      sizes: {
        A3: 'para rincones y estanterías',
        A2: 'el estándar versátil',
        A1: 'gran presencia'
      }
    },
    pages: {
      tcmEyebrow: 'TCM · Consulta · Estudio',
      tcmTitle: 'Pósteres para consulta, yoga y bienestar',
      tcmIntro: 'Pósteres serenos de elementos y BaZi para salas de tratamiento, estudios y salas de espera — dan equilibrio a la sala e inician conversaciones.',
      bundlesEyebrow: 'Sets · precio especial',
      bundlesTitle: 'Packs',
      bundlesIntro: 'Sets seleccionados — pósteres y análisis digital combinados, a un precio especial.',
      kollEyebrow: 'Todos los pósteres',
      kollTitle: 'La colección',
      kollIntro: 'BaZi, Wuxing, la edición limitada Fire Horse y nuestros pósteres de consulta y estudio — todos los motivos de un vistazo.',
      blogEyebrow: 'Diario',
      blogTitle: 'Blog',
      blogIntro: 'Información de fondo sobre BaZi, astrología china y TCM — para tus consultas y para quien quiera entender su póster.',
      blogRead: 'Leer más →',
      articleBack: '← Diario',
      articleCta: '¿Listo para tu propia carta?',
      articleCtaBtn: 'Diseña tu póster →',
      digitalEyebrow: 'Digital · PDF',
      digitalHeroTitle: 'BaZi · Análisis personal',
      digitalAdd: 'Añadir al carrito',
      digitalSecure: 'Pago seguro · descarga inmediata cuando esté listo',
      notFound: 'No encontrado',
      toJournal: '← Al diario',
      productNotFound: 'Producto no encontrado',
      toShop: 'Volver a la tienda →',
      about: {
        eyebrow: 'EL ATELIER',
        title1: 'Donde la astrología',
        title2: 'se convierte en arte',
        heroIntro: 'SizhuAtelier es un estudio de arte suizo que traduce la sabiduría de la astrología del Este asiático en arte de pared atemporal y personalizado.',
        philTitle: 'Nuestra filosofía',
        philP1: 'Creamos SizhuAtelier porque la mayoría de los pósteres de astrología son genéricos. Pueden parecer decorativos, pero no reflejan de verdad a la persona que hay detrás.',
        philP2: 'Nuestro enfoque es distinto: cada póster parte de datos de nacimiento personales. Hemos creado nuestro propio sistema de diseño para transformar esos datos en una obra visual refinada y simbólica.',
        philP3: 'El resultado es un póster personalizado que se siente intencional, refinado y hecho específicamente para una persona.',
        processTitle: 'El camino hacia tu póster',
        steps: [
          {
            num: '01',
            title: 'Introduce tus datos de nacimiento',
            desc: 'Comparte la fecha, hora y lugar de tu nacimiento. Para cartas de pareja, también los datos de tu pareja.'
          },
          {
            num: '02',
            title: 'Compón tu obra',
            desc: 'Convertimos tus datos de nacimiento en una composición visual simbólica basada en los motivos tradicionales de los Cuatro Pilares.'
          },
          {
            num: '03',
            title: 'Elige un diseño',
            desc: 'Elige entre distintos estilos de diseño, paletas de color y composiciones que encajen con tu energía personal.'
          },
          {
            num: '04',
            title: 'Imprime en el atelier',
            desc: 'Tu póster se imprime en papel Hahnemühle premium con tintas de archivo y se embala con cuidado.'
          }
        ],
        materialsTitle: 'Materiales con significado',
        materialsIntro: 'Usamos solo materiales de la máxima calidad. Cada detalle se elige con cuidado para garantizar tanto la calidad estética como la energética de tu póster.',
        materials: [
          {
            title: 'Papel Hahnemühle',
            desc: '100% algodón, 308 g/m², calidad museo. Sin ácido para una durabilidad de más de 100 años.'
          },
          {
            title: 'Tintas de archivo',
            desc: 'Tintas a base de pigmentos con resistencia UV. Colores que no se desvanecen.'
          },
          {
            title: 'Marcos de madera maciza',
            desc: 'Marcos de madera maciza de silvicultura sostenible. Disponibles en roble, nogal y negro.'
          }
        ],
        ctaTitle: '¿Listo para tu obra personal?',
        ctaBtn1: 'Diseñar póster',
        ctaBtn2: 'Contacto'
      },
      contact: {
        heroTitle: 'Saluda',
        heroIntro: 'Esperamos tu mensaje — ya sea una pregunta, una petición especial o una visita al atelier.',
        name: 'Nombre',
        email: 'Correo electrónico',
        subject: 'Asunto',
        message: 'Mensaje',
        send: 'Enviar',
        subjectGeneral: 'Consulta general',
        subjectOrder: 'Pedido',
        subjectCustom: 'Trabajo personalizado',
        subjectVisit: 'Visita al atelier',
        directTitle: 'Contacto directo',
        emailLabel: 'Correo electrónico',
        instagramLabel: 'Instagram',
        atelierLabel: 'Atelier',
        atelierValue: 'SizhuAtelier|Suiza',
        responseLabel: 'Tiempo de respuesta',
        responseValue: 'Respondemos en menos de 24 horas.',
        faqTitle: 'Preguntas frecuentes',
        faqIntro: 'Respuestas a las preguntas más importantes sobre nuestros pósteres y el proceso de pedido.',
        faqs: [
          {
            q: '¿Cómo solicito una pieza?',
            a: 'Simplemente elige tu formato de póster preferido de nuestra colección, introduce tus datos de nacimiento y creamos tu póster de carta personalizado. Para trabajos personalizados, contáctanos a través del formulario.'
          },
          {
            q: '¿El atelier acepta encargos?',
            a: 'Sí, nos encanta crear encargos individuales. Ya sea para bodas, eventos corporativos, estudios de bienestar o como un regalo especial — ponte en contacto y encontraremos juntos la solución perfecta.'
          },
          {
            q: '¿Qué formatos están disponibles?',
            a: 'Nuestros pósteres estándar vienen en A4, A3, A2 y 50×70 cm. Se pueden añadir marcos en roble, nogal o negro. Formatos especiales bajo petición.'
          },
          {
            q: '¿Cómo funciona el proceso?',
            a: 'Tras tu pedido, tus datos de nacimiento se integran en una obra simbólica y creamos una propuesta de diseño. Cuando la apruebas, imprimimos tu póster en el atelier y lo enviamos en 5–7 días laborables.'
          },
          {
            q: '¿Cómo puedo ponerme en contacto?',
            a: 'Contáctanos por correo en hello@sizhuatelier.shop, a través del formulario de contacto de esta página o directamente en Instagram @sizhuatelier. Respondemos en menos de 24 horas.'
          },
          {
            q: '¿Puedo devolver mi póster?',
            a: 'Como cada póster es personalizado, por lo general no podemos aceptar devoluciones. En caso de entrega dañada o errores de impresión, por supuesto lo reemplazamos sin coste.'
          }
        ]
      }
    },
    content: {
      digital: {
        title: 'Análisis digital de la carta BaZi',
        subtitle: 'PDF de 10–15 páginas',
        desc: [
          'Un análisis personal y detallado en PDF de tu carta BaZi: los cuatro pilares, tu maestro del día, el equilibrio de los cinco elementos y lo que significan para ti.',
          'Entregado como descarga cuando esté listo — por separado o con descuento en un pack con un póster.'
        ],
        bullets: [
          'Cuatro pilares y maestro del día, explicados con claridad',
          'Equilibrio de los cinco elementos — fortalezas y patrones',
          '10–15 páginas, en PDF descargable',
          'Por separado o con descuento en un pack'
        ]
      },
      digitalBundle: {
        title: 'Póster BaZi + análisis digital',
        sub: 'Tu póster personalizado más el análisis en PDF de 10–15 páginas de tu carta.'
      },
      bundles: {
        b1: {
          title: 'Set de inicio para consulta',
          sub: '3 pósteres para tratamiento, recepción y sala de espera'
        },
        b2: {
          title: 'Trío de bienestar',
          sub: 'Calma coherente para estudio, pasillo y sala de descanso'
        }
      },
      bundleMeta: 'Póster + análisis en PDF · precio especial',
      bundleMeta3: 'Set de 3 piezas · precio especial',
      addons: {
        a1: {
          title: 'Passepartout premium',
          note: 'Cartón de museo sin ácido'
        },
        a2: {
          title: 'Envoltorio de regalo',
          note: 'Reciclado, con una cinta'
        },
        a3: {
          title: 'Kit de colgado',
          note: 'Incl. clavo y nivel'
        },
        a4: {
          title: 'Paño de limpieza para cristal',
          note: 'Microfibra, reutilizable'
        }
      },
      products: {
        1: {
          title: 'Carta natal BaZi — Cuatro Pilares',
          bullets: [
            'Compuesto a partir de tus datos de nacimiento en una obra simbólica — sin motivo genérico',
            'Impresión en papel natural de grano fino, sin ácido y resistente a la luz',
            'Marco de madera maciza con cristal antirreflejos',
            'Producido en 3 días laborables, numerado'
          ]
        },
        2: {
          title: 'BaZi Edición Consulta',
          bullets: [
            'Índigo sereno para salas de tratamiento y espera',
            'Gran formato con claro impacto a distancia',
            'Cristal de museo lavable, higiénico',
            'Opcionalmente con el nombre de la consulta en lugar de una persona'
          ]
        },
        3: {
          title: 'Póster BaZi de elementos',
          bullets: [
            'Verde salvia cálido — reconfortante para salas tranquilas',
            'Resalta el equilibrio de los cinco elementos',
            'Papel reciclado sostenible, certificado FSC',
            'También popular como regalo con vale'
          ]
        },
        4: {
          title: 'Carta BaZi Yoga-Flow',
          bullets: [
            'Terracota terroso — combina con madera y plantas',
            'Formato compacto para las paredes del estudio',
            'Marco ligero, fácil de montar en la pared',
            'Descuento por set para varias salas del estudio'
          ]
        },
        5: {
          title: 'BaZi Luna y Estrellas',
          bullets: [
            'Antracita profundo para un efecto elegante y sereno',
            'Marco negro mate premium',
            'Letras con acento dorado opcionales',
            'Un regalo premium para el cambio de año'
          ]
        },
        6: {
          title: 'BaZi Minimal',
          bullets: [
            'Arenisca reducido — sobrio y atemporal',
            'Marco negro, línea limpia',
            'Encaja en cualquier consulta y espacio de vida',
            'Más vendido para quienes compran por primera vez'
          ]
        },
        7: {
          title: 'Póster Wuxing de los cinco elementos',
          bullets: [
            'Madera, fuego, tierra, metal y agua en equilibrio',
            'Verde salvia sereno, reconfortante para cualquier sala',
            'Educativo para consulta y hogar',
            'Impresión de pigmentos de archivo de calidad museo'
          ]
        },
        8: {
          title: 'Fire Horse 2026 · Edición limitada',
          bullets: [
            'Edición limitada para el Año del Caballo de Fuego 2026',
            'Terracota intenso, numerado y firmado',
            'Una pieza de coleccionista con carácter',
            'Hasta agotar existencias'
          ]
        },
        11: {
          title: 'TCM Cinco Elementos — Póster educativo',
          bullets: [
            'Madera, Fuego, Tierra, Metal y Agua y sus relaciones',
            'Un recurso didáctico claro para salas de tratamiento y estudios',
            'Impresión de archivo de calidad museo — no personalizado'
          ]
        },
        12: {
          title: 'Póster de consulta TCM',
          bullets: [
            'Arte de pared educativo y refinado para consultas de TCM',
            'Explica los sistemas elementales y energéticos con serena claridad',
            'Impresión de archivo premium — no personalizado'
          ]
        },
        13: {
          title: 'Póster de bienestar TCM',
          bullets: [
            'Póster educativo sereno para espacios de bienestar y tratamiento',
            'Visualiza los principios fundamentales de la TCM',
            'Impresión de archivo premium — no personalizado'
          ]
        },
        14: {
          title: 'Póster de estudio de yoga TCM',
          bullets: [
            'Póster educativo para paredes de yoga y estudio',
            'Las relaciones elementales de un vistazo',
            'Impresión de archivo premium — no personalizado'
          ]
        }
      },
      articles: {
        r1: {
          tag: 'Conceptos básicos',
          title: '¿Qué es el BaZi? Los cuatro pilares del destino',
          meta: '6 min de lectura · Diario del Atelier',
          excerpt: 'El año, el mes, el día y la hora de tu nacimiento forman cuatro «pilares» — el mapa de tu energía.',
          body: [
            'El BaZi (chino 八字, «ocho caracteres») lee tu momento de nacimiento como cuatro pilares: año, mes, día y hora. Cada pilar lleva un tronco celeste y una rama terrestre — ocho caracteres que describen tu constitución.',
            'El pilar del día se considera tu núcleo, el «maestro del día». A partir de él, observas cómo los demás pilares te apoyan o te desafían. Esto dibuja un retrato de fortalezas, patrones y momentos favorables — no es adivinación, sino una herramienta de autorreflexión.',
            'Tu póster recoge exactamente estos ocho caracteres: un diagrama personal y sereno que inicia conversaciones en la consulta y el estudio, y un compañero tranquilo en casa.'
          ]
        },
        r2: {
          tag: 'Teoría',
          title: 'Los cinco elementos y su equilibrio',
          meta: '5 min de lectura · Diario del Atelier',
          excerpt: 'Madera, fuego, tierra, metal, agua — cómo su interacción matiza tus pilares.',
          body: [
            'Cada uno de los ocho caracteres pertenece a uno de los cinco elementos. Se nutren y se controlan entre sí en un ciclo: la madera alimenta el fuego, el fuego crea la tierra, la tierra produce el metal, el metal reúne el agua, el agua nutre la madera.',
            'Una carta BaZi muestra qué elementos abundan y cuáles faltan. Este equilibrio está en el centro de muchas consultas de TCM y bienestar — desde la nutrición hasta el diseño de interiores.',
            'Los cinco colores de fondo de nuestros pósteres reflejan este lenguaje: arenisca para la tierra, salvia para la madera, terracota para el fuego, índigo para el agua, antracita para el metal.'
          ]
        },
        r3: {
          tag: 'Para la consulta',
          title: 'El BaZi en la consulta de TCM: sala y ambiente',
          meta: '4 min de lectura · Diario del Atelier',
          excerpt: 'Cómo una carta personal genera confianza y da equilibrio a las salas de tratamiento.',
          body: [
            'Un póster BaZi visible en la pared transmite profundidad: muestra a los clientes que aquí se trabaja con tradición y cuidado. Eso reduce la barrera para iniciar una conversación.',
            'En las salas de tratamiento, tonos serenos como el índigo o la salvia crean un ambiente tranquilo y equilibrado. Un gran formato con claro impacto a distancia ancla la sala sin recargarla.',
            'Muchas consultas ofrecen cartas personalizadas como regalo o complemento — un recuerdo de alta calidad y con significado que refuerza el vínculo con la consulta.'
          ]
        }
      },
      shopFaqs: [
        {
          q: '¿Cómo se crea mi póster BaZi?',
          a: 'Tomamos la fecha, hora y lugar de nacimiento que introduces y los usamos para componer una obra simbólica de los Cuatro Pilares (año, mes, día, hora) dispuesta en el póster.'
        },
        {
          q: '¿Qué datos necesito para pedir?',
          a: 'Fecha de nacimiento, la hora de nacimiento más precisa posible y lugar de nacimiento. Opcionalmente, un nombre para el póster.'
        },
        {
          q: 'No conozco mi hora exacta de nacimiento — ¿pasa algo?',
          a: 'Sí — solo marca «No conozco mi hora de nacimiento» y usamos las 12:00 del mediodía como suposición por defecto. Tu póster se compone a partir de ese valor de reserva.'
        },
        {
          q: '¿Cuánto tardan la producción y el envío?',
          a: 'Producción por encargo más 5–7 días laborables de envío, a todo el mundo. Envío gratis a partir de 80 €.'
        },
        {
          q: '¿Qué formatos, marcos y colores están disponibles?',
          a: 'Varios formatos, colores de marco y paletas de fondo; todo seleccionable en el configurador con una vista previa en vivo.'
        },
        {
          q: '¿En qué papel imprimís?',
          a: 'Impresión de pigmentos de archivo de calidad museo, hecha en Alemania.'
        },
        {
          q: '¿Puedo ver mi póster antes de comprar?',
          a: 'Sí, el configurador muestra una vista previa en vivo con tus datos, marco y fondo.'
        },
        {
          q: '¿Qué es el análisis digital de la carta BaZi?',
          a: 'Un análisis personal en PDF de 10–15 páginas de tu carta, disponible por separado o como pack.'
        },
        {
          q: '¿Qué seguridad tiene el pago?',
          a: 'Pago cifrado mediante PayPal, Apple Pay y Google Pay.'
        },
        {
          q: '¿Devoluciones y cambios?',
          a: 'MARCADOR DE POSICIÓN — adapta esto a tu política real de devolución/desistimiento; los artículos personalizados pueden quedar excluidos del desistimiento.',
          placeholder: true
        }
      ],
      faqDefs: {
        details: {
          q: 'Detalles y material',
          a: 'Impresión de bellas artes de grano fino en papel natural de 250 g/m² sin ácido, resistente a la luz durante décadas. Marco de madera maciza con cristal real antirreflejos. Cada póster se numera en el atelier.'
        },
        size: {
          q: 'Guía de tamaños',
          a: 'A3 (30×42 cm) para rincones y estanterías, A2 (42×59 cm) el estándar versátil para las paredes de la consulta, A1 (59×84 cm) para gran impacto a distancia en recepción o salas de espera.'
        },
        ship: {
          q: 'Envío y producción',
          a: 'Producción en 3 días laborables y luego envío climáticamente neutro (DE 1–2 días). Envío gratis a partir de 80 €. Los artículos personalizados se hacen por encargo — consulta nuestra Política de devoluciones; tus derechos legales se aplican a los artículos defectuosos.'
        },
        bazi: {
          q: 'Sobre tu personalización',
          a: 'A partir de la fecha, hora y lugar que introduces, componemos una composición simbólica de los Cuatro Pilares con troncos celestes y ramas terrestres. Si no conoces tu hora de nacimiento, usamos las 12:00 del mediodía como suposición por defecto — esto puede influir en el resultado.'
        }
      }
    }
  },
}
