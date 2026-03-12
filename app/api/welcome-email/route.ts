import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const translations: Record<string, { subject: string; hi: string; congrats: string; live_at: string; how_to: string; photo_title: string; photo_text: string; bio_title: string; bio_text: string; social_title: string; social_text: string; social_1: string; social_2: string; referral_title: string; referral_text: string; good_luck: string; footer: string }> = {
  en: {
    subject: 'Welcome to 1Move — Your landing page is live!',
    hi: 'Hi',
    congrats: 'Congratulations! Your personal landing page is now live at:',
    live_at: 'Visit your page',
    how_to: "Here's how to make the most of your page:",
    photo_title: 'PROFILE PHOTO',
    photo_text: 'The image you upload in your dashboard becomes the portrait photo on your landing page. Use a professional, clear photo — this is the first thing visitors see.',
    bio_title: 'BIO',
    bio_text: 'Your bio is what makes your page personal. It tells visitors who you are and why they should trust you. Take time to write something authentic that reflects your expertise and personality.',
    social_title: 'SOCIAL MEDIA LINKS',
    social_text: 'Fill in as many social media links as possible. This is important for two reasons:',
    social_1: 'Visitors will check your social profiles to verify that you are a real, trustworthy person',
    social_2: 'SYSTM8 will use these profiles later to automatically generate and post content for you',
    referral_title: 'REFERRAL LINK',
    referral_text: 'Make sure your IB / referral link is correct. This is the link visitors are redirected to when they click "Get Access Now" on your page.',
    good_luck: 'Good luck — and welcome to the team!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  no: {
    subject: 'Velkommen til 1Move — Landingssiden din er live!',
    hi: 'Hei',
    congrats: 'Gratulerer! Din personlige landingsside er nå live på:',
    live_at: 'Besøk siden din',
    how_to: 'Slik får du mest mulig ut av siden din:',
    photo_title: 'PROFILBILDE',
    photo_text: 'Bildet du laster opp i dashboardet ditt blir portrettbildet på landingssiden din. Bruk et profesjonelt, tydelig bilde — dette er det første besøkende ser.',
    bio_title: 'BIO',
    bio_text: 'Bioen din er det som gjør siden personlig. Den forteller besøkende hvem du er og hvorfor de kan stole på deg. Ta deg tid til å skrive noe autentisk som gjenspeiler din ekspertise og personlighet.',
    social_title: 'SOSIALE MEDIER-LENKER',
    social_text: 'Fyll inn så mange sosiale medier-lenker som mulig. Dette er viktig av to grunner:',
    social_1: 'Besøkende vil sjekke sosiale profiler for å verifisere at du er en ekte, pålitelig person',
    social_2: 'SYSTM8 vil bruke disse profilene senere til å automatisk generere og publisere innhold for deg',
    referral_title: 'REFERRAL-LENKE',
    referral_text: 'Sørg for at IB / referral-lenken din er riktig. Dette er lenken besøkende sendes til når de klikker «Get Access Now» på siden din.',
    good_luck: 'Lykke til — og velkommen til teamet!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  sv: {
    subject: 'Välkommen till 1Move — Din landningssida är live!',
    hi: 'Hej',
    congrats: 'Grattis! Din personliga landningssida är nu live på:',
    live_at: 'Besök din sida',
    how_to: 'Så här får du ut det mesta av din sida:',
    photo_title: 'PROFILBILD',
    photo_text: 'Bilden du laddar upp i din dashboard blir porträttbilden på din landningssida. Använd ett professionellt, tydligt foto — det är det första besökare ser.',
    bio_title: 'BIO',
    bio_text: 'Din bio är det som gör din sida personlig. Den berättar för besökare vem du är och varför de kan lita på dig. Ta dig tid att skriva något autentiskt som speglar din expertis och personlighet.',
    social_title: 'SOCIALA MEDIER-LÄNKAR',
    social_text: 'Fyll i så många sociala medier-länkar som möjligt. Det är viktigt av två skäl:',
    social_1: 'Besökare kommer att kontrollera dina sociala profiler för att verifiera att du är en riktig, pålitlig person',
    social_2: 'SYSTM8 kommer att använda dessa profiler senare för att automatiskt generera och publicera innehåll åt dig',
    referral_title: 'REFERRAL-LÄNK',
    referral_text: 'Se till att din IB / referral-länk är korrekt. Det är länken besökare skickas till när de klickar "Get Access Now" på din sida.',
    good_luck: 'Lycka till — och välkommen till teamet!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  es: {
    subject: '¡Bienvenido a 1Move — Tu página de aterrizaje está activa!',
    hi: 'Hola',
    congrats: '¡Felicitaciones! Tu página de aterrizaje personal ahora está activa en:',
    live_at: 'Visita tu página',
    how_to: 'Así es como puedes aprovechar al máximo tu página:',
    photo_title: 'FOTO DE PERFIL',
    photo_text: 'La imagen que subes en tu panel se convierte en la foto de retrato en tu página. Usa una foto profesional y clara — es lo primero que ven los visitantes.',
    bio_title: 'BIO',
    bio_text: 'Tu bio es lo que hace tu página personal. Les dice a los visitantes quién eres y por qué deben confiar en ti. Tómate el tiempo para escribir algo auténtico que refleje tu experiencia y personalidad.',
    social_title: 'ENLACES DE REDES SOCIALES',
    social_text: 'Completa tantos enlaces de redes sociales como sea posible. Esto es importante por dos razones:',
    social_1: 'Los visitantes revisarán tus perfiles sociales para verificar que eres una persona real y confiable',
    social_2: 'SYSTM8 usará estos perfiles más tarde para generar y publicar contenido automáticamente para ti',
    referral_title: 'ENLACE DE REFERIDO',
    referral_text: 'Asegúrate de que tu enlace IB / referido sea correcto. Este es el enlace al que se redirige a los visitantes cuando hacen clic en "Get Access Now" en tu página.',
    good_luck: '¡Buena suerte — y bienvenido al equipo!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  ru: {
    subject: 'Добро пожаловать в 1Move — Ваша страница активна!',
    hi: 'Привет',
    congrats: 'Поздравляем! Ваша персональная страница теперь доступна по адресу:',
    live_at: 'Посетить страницу',
    how_to: 'Вот как извлечь максимум из вашей страницы:',
    photo_title: 'ФОТО ПРОФИЛЯ',
    photo_text: 'Изображение, которое вы загружаете в панели управления, становится портретным фото на вашей странице. Используйте профессиональное, чёткое фото — это первое, что видят посетители.',
    bio_title: 'БИО',
    bio_text: 'Ваша биография делает страницу персональной. Она рассказывает посетителям, кто вы и почему им стоит вам доверять. Уделите время написанию чего-то подлинного, отражающего вашу экспертизу и личность.',
    social_title: 'ССЫЛКИ НА СОЦИАЛЬНЫЕ СЕТИ',
    social_text: 'Заполните как можно больше ссылок на социальные сети. Это важно по двум причинам:',
    social_1: 'Посетители проверят ваши социальные профили, чтобы убедиться, что вы реальный, заслуживающий доверия человек',
    social_2: 'SYSTM8 будет использовать эти профили позже для автоматической генерации и публикации контента за вас',
    referral_title: 'РЕФЕРАЛЬНАЯ ССЫЛКА',
    referral_text: 'Убедитесь, что ваша IB / реферальная ссылка верна. Это ссылка, на которую перенаправляются посетители при нажатии «Get Access Now» на вашей странице.',
    good_luck: 'Удачи — и добро пожаловать в команду!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  ar: {
    subject: 'مرحباً بك في 1Move — صفحتك الآن مباشرة!',
    hi: 'مرحباً',
    congrats: 'تهانينا! صفحتك الشخصية الآن مباشرة على:',
    live_at: 'زيارة صفحتك',
    how_to: 'إليك كيفية الاستفادة القصوى من صفحتك:',
    photo_title: 'صورة الملف الشخصي',
    photo_text: 'الصورة التي تقوم بتحميلها في لوحة التحكم تصبح صورة البورتريه على صفحتك. استخدم صورة احترافية وواضحة — هذا أول ما يراه الزوار.',
    bio_title: 'السيرة الذاتية',
    bio_text: 'سيرتك الذاتية هي ما يجعل صفحتك شخصية. إنها تخبر الزوار من أنت ولماذا يجب أن يثقوا بك. خذ وقتك في كتابة شيء حقيقي يعكس خبرتك وشخصيتك.',
    social_title: 'روابط وسائل التواصل الاجتماعي',
    social_text: 'املأ أكبر عدد ممكن من روابط وسائل التواصل الاجتماعي. هذا مهم لسببين:',
    social_1: 'سيتحقق الزوار من ملفاتك الاجتماعية للتأكد من أنك شخص حقيقي وموثوق',
    social_2: 'سيستخدم SYSTM8 هذه الملفات لاحقاً لإنشاء ونشر المحتوى تلقائياً نيابة عنك',
    referral_title: 'رابط الإحالة',
    referral_text: 'تأكد من أن رابط IB / الإحالة الخاص بك صحيح. هذا هو الرابط الذي يتم توجيه الزوار إليه عند النقر على "Get Access Now" في صفحتك.',
    good_luck: 'حظاً موفقاً — ومرحباً بك في الفريق!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
  tl: {
    subject: 'Welcome sa 1Move — Ang landing page mo ay live na!',
    hi: 'Hi',
    congrats: 'Congratulations! Ang iyong personal na landing page ay live na sa:',
    live_at: 'Bisitahin ang page mo',
    how_to: 'Narito kung paano masulit ang iyong page:',
    photo_title: 'PROFILE PHOTO',
    photo_text: 'Ang larawang ina-upload mo sa dashboard ang magiging portrait photo sa iyong landing page. Gumamit ng professional at malinaw na larawan — ito ang unang makikita ng mga bisita.',
    bio_title: 'BIO',
    bio_text: 'Ang iyong bio ang nagpapersonal sa iyong page. Sinasabi nito sa mga bisita kung sino ka at bakit dapat nilang pagkatiwalaan ka. Maglaan ng oras na magsulat ng tunay na nagrerepresenta sa iyong expertise at personalidad.',
    social_title: 'SOCIAL MEDIA LINKS',
    social_text: 'Punan ang pinakamaraming social media links hangga\'t maaari. Mahalaga ito sa dalawang dahilan:',
    social_1: 'Titingnan ng mga bisita ang iyong social profiles para ma-verify na ikaw ay tunay at mapagkakatiwalaang tao',
    social_2: 'Gagamitin ng SYSTM8 ang mga profile na ito mamaya para awtomatikong gumawa at mag-post ng content para sa iyo',
    referral_title: 'REFERRAL LINK',
    referral_text: 'Siguraduhing tama ang iyong IB / referral link. Ito ang link na pupuntahan ng mga bisita kapag nag-click sila ng "Get Access Now" sa iyong page.',
    good_luck: 'Good luck — at welcome sa team!',
    footer: '© 2025 1Move Academy × PrimeVerse',
  },
}

function buildHtml(t: typeof translations['en'], name: string, slug: string): string {
  const url = `primeverseaccess.com/${slug}`
  const logo = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/1move-logo.png'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#1a1a1a;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px"><img src="${logo}" alt="1Move" width="120" style="display:inline-block"/></div>
  <h1 style="color:#d4a537;font-size:24px;margin:0 0 16px">${t.hi} ${name},</h1>
  <p style="color:#e0e0e0;font-size:15px;line-height:1.6;margin:0 0 8px">${t.congrats}</p>
  <p style="text-align:center;margin:16px 0 24px"><a href="https://${url}" style="display:inline-block;background:#d4a537;color:#1a1a1a;padding:12px 28px;font-weight:700;text-decoration:none;border-radius:6px;font-size:15px">${t.live_at} →</a></p>
  <p style="color:#e0e0e0;font-size:15px;line-height:1.6;margin:0 0 24px">${t.how_to}</p>
  <h2 style="color:#d4a537;font-size:16px;margin:0 0 8px">📷 ${t.photo_title}</h2>
  <p style="color:#e0e0e0;font-size:14px;line-height:1.6;margin:0 0 20px">${t.photo_text}</p>
  <h2 style="color:#d4a537;font-size:16px;margin:0 0 8px">✍️ ${t.bio_title}</h2>
  <p style="color:#e0e0e0;font-size:14px;line-height:1.6;margin:0 0 20px">${t.bio_text}</p>
  <h2 style="color:#d4a537;font-size:16px;margin:0 0 8px">🔗 ${t.social_title}</h2>
  <p style="color:#e0e0e0;font-size:14px;line-height:1.6;margin:0 0 6px">${t.social_text}</p>
  <ol style="color:#e0e0e0;font-size:14px;line-height:1.7;margin:0 0 20px;padding-left:20px">
    <li>${t.social_1}</li>
    <li>${t.social_2}</li>
  </ol>
  <h2 style="color:#d4a537;font-size:16px;margin:0 0 8px">🎯 ${t.referral_title}</h2>
  <p style="color:#e0e0e0;font-size:14px;line-height:1.6;margin:0 0 28px">${t.referral_text}</p>
  <p style="color:#d4a537;font-size:16px;font-weight:700;margin:0 0 32px">${t.good_luck}</p>
  <div style="border-top:1px solid #333;padding-top:20px;text-align:center">
    <p style="color:#666;font-size:12px;margin:0">${t.footer}</p>
  </div>
</div>
</body></html>`
}

export async function POST(request: Request) {
  const { name, email, slug, lang } = await request.json()
  if (!name || !email || !slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const t = translations[lang] || translations.en
  const html = buildHtml(t, name, slug)
  const { error } = await resend.emails.send({
    from: '1Move Academy <noreply@primeverseaccess.com>',
    to: [email],
    subject: t.subject,
    html,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
