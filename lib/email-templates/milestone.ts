import { baseEmailTemplate } from './base'

export const MILESTONES = [5, 10, 25, 50, 100] as const
export type MilestoneNumber = (typeof MILESTONES)[number]

interface MilestoneTranslation {
  subject: string
  preview: string
  heading: string
  sub_heading: string
  milestone_5: string
  milestone_10: string
  milestone_25: string
  milestone_50: string
  milestone_100: string
  journey_label: string
  next_milestone: string
  remaining: string
  max_reached: string
  cta: string
  link_label: string
  body_closing: string
  help: string
  sign_name: string
}

const translations: Record<string, MilestoneTranslation> = {
  en: {
    subject: 'You just hit {milestone} leads! 🏆',
    preview: "Milestone unlocked. You're one of our top-performing IBs.",
    heading: 'MILESTONE UNLOCKED! 🏆',
    sub_heading: '{name}, you just hit {milestone} leads!',
    milestone_5: "Your first 5 — this is where it all begins. You've proven you can do this. Most people never even get started, but you're already building momentum.",
    milestone_10: "Double digits! You're officially building a real network. Your page is working, your strategy is paying off, and you're just getting warmed up.",
    milestone_25: "25 leads is no joke. You're in the top tier of active IBs. People are responding to what you're sharing — that's real influence.",
    milestone_50: "Half a century of leads. You're running a serious operation now. This is the kind of consistency that builds long-term success.",
    milestone_100: "Triple digits. 100 leads. You've reached a level that very few IBs ever see. You're not just participating — you're leading. We see you.",
    journey_label: 'YOUR JOURNEY SO FAR',
    next_milestone: 'Next milestone: {next_milestone} leads',
    remaining: 'Only {remaining} more to go!',
    max_reached: "You've reached the highest milestone. You're a legend. Stay tuned — we're building something special for IBs like you.",
    cta: 'KEEP GROWING',
    link_label: 'Your link:',
    body_closing: 'The best IBs never stop sharing. Your next milestone is closer than you think.',
    help: 'Need help? Contact your team leader or use the Report feature in your dashboard.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Du nådde nettopp {milestone} leads! 🏆',
    preview: 'Milepæl låst opp. Du er en av våre best presterende IBer.',
    heading: 'MILEPÆL LÅST OPP! 🏆',
    sub_heading: '{name}, du nådde nettopp {milestone} leads!',
    milestone_5: 'Dine første 5 — her begynner alt. Du har bevist at du kan gjøre dette. De fleste kommer aldri i gang, men du bygger allerede momentum.',
    milestone_10: 'Tosifrede tall! Du bygger offisielt et ekte nettverk. Siden din fungerer, strategien din lønner seg, og du er bare i oppvarmingen.',
    milestone_25: '25 leads er ikke noe tull. Du er i toppsjiktet av aktive IBer. Folk responderer på det du deler — det er ekte innflytelse.',
    milestone_50: 'Et halvt hundre leads. Du driver en seriøs operasjon nå. Denne typen konsistens bygger langsiktig suksess.',
    milestone_100: 'Tresifrede tall. 100 leads. Du har nådd et nivå som svært få IBer noen gang ser. Du deltar ikke bare — du leder. Vi ser deg.',
    journey_label: 'DIN REISE SÅ LANGT',
    next_milestone: 'Neste milepæl: {next_milestone} leads',
    remaining: 'Bare {remaining} igjen!',
    max_reached: 'Du har nådd den høyeste milepælen. Du er en legende. Følg med — vi bygger noe spesielt for IBer som deg.',
    cta: 'FORTSETT Å VOKSE',
    link_label: 'Din lenke:',
    body_closing: 'De beste IBene slutter aldri å dele. Din neste milepæl er nærmere enn du tror.',
    help: 'Trenger du hjelp? Kontakt teamlederen din eller bruk Rapporter-funksjonen i dashboardet.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Du nådde precis {milestone} leads! 🏆',
    preview: 'Milstolpe upplåst. Du är en av våra bäst presterande IBs.',
    heading: 'MILSTOLPE UPPLÅST! 🏆',
    sub_heading: '{name}, du nådde precis {milestone} leads!',
    milestone_5: 'Dina första 5 — det är här allt börjar. Du har bevisat att du kan göra detta. De flesta kommer aldrig igång, men du bygger redan momentum.',
    milestone_10: 'Tvåsiffriga tal! Du bygger officiellt ett riktigt nätverk. Din sida fungerar, din strategi lönar sig och du har bara värmt upp.',
    milestone_25: '25 leads är inget skämt. Du är i toppskiktet av aktiva IBs. Folk reagerar på det du delar — det är riktigt inflytande.',
    milestone_50: 'Ett halvt sekel av leads. Du driver en seriös verksamhet nu. Den här typen av konsekvens bygger långsiktig framgång.',
    milestone_100: 'Tresiffriga tal. 100 leads. Du har nått en nivå som väldigt få IBs någonsin ser. Du deltar inte bara — du leder. Vi ser dig.',
    journey_label: 'DIN RESA HITTILLS',
    next_milestone: 'Nästa milstolpe: {next_milestone} leads',
    remaining: 'Bara {remaining} kvar!',
    max_reached: 'Du har nått den högsta milstolpen. Du är en legend. Håll utkik — vi bygger något speciellt för IBs som dig.',
    cta: 'FORTSÄTT VÄXA',
    link_label: 'Din länk:',
    body_closing: 'De bästa IBsen slutar aldrig dela. Din nästa milstolpe är närmare än du tror.',
    help: 'Behöver du hjälp? Kontakta din teamledare eller använd Rapportera-funktionen i din dashboard.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: '¡Acabas de alcanzar {milestone} leads! 🏆',
    preview: 'Hito desbloqueado. Eres uno de nuestros IBs con mejor rendimiento.',
    heading: '¡HITO DESBLOQUEADO! 🏆',
    sub_heading: '¡{name}, acabas de alcanzar {milestone} leads!',
    milestone_5: 'Tus primeros 5 — aquí es donde todo comienza. Has demostrado que puedes hacerlo. La mayoría nunca empieza, pero tú ya estás construyendo impulso.',
    milestone_10: '¡Números de dos dígitos! Estás construyendo oficialmente una red real. Tu página funciona, tu estrategia está dando frutos y apenas estás calentando.',
    milestone_25: '25 leads no es broma. Estás en el nivel más alto de IBs activos. La gente responde a lo que compartes — eso es influencia real.',
    milestone_50: 'Medio centenar de leads. Estás operando en serio ahora. Este tipo de consistencia construye éxito a largo plazo.',
    milestone_100: 'Tres dígitos. 100 leads. Has alcanzado un nivel que muy pocos IBs llegan a ver. No solo participas — lideras. Te vemos.',
    journey_label: 'TU RECORRIDO HASTA AHORA',
    next_milestone: 'Próximo hito: {next_milestone} leads',
    remaining: '¡Solo faltan {remaining} más!',
    max_reached: 'Has alcanzado el hito más alto. Eres una leyenda. Mantente atento — estamos construyendo algo especial para IBs como tú.',
    cta: 'SIGUE CRECIENDO',
    link_label: 'Tu enlace:',
    body_closing: 'Los mejores IBs nunca dejan de compartir. Tu próximo hito está más cerca de lo que piensas.',
    help: '¿Necesitas ayuda? Contacta a tu líder de equipo o usa la función de Reportar en tu panel.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'Вы только что достигли {milestone} лидов! 🏆',
    preview: 'Достижение разблокировано. Вы один из наших лучших IB.',
    heading: 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО! 🏆',
    sub_heading: '{name}, вы только что достигли {milestone} лидов!',
    milestone_5: 'Ваши первые 5 — здесь всё начинается. Вы доказали, что можете это сделать. Большинство людей даже не начинают, а вы уже набираете обороты.',
    milestone_10: 'Двузначные числа! Вы официально строите настоящую сеть. Ваша страница работает, стратегия окупается, и вы только разогреваетесь.',
    milestone_25: '25 лидов — это серьёзно. Вы в высшей лиге активных IB. Люди реагируют на то, чем вы делитесь — это настоящее влияние.',
    milestone_50: 'Полсотни лидов. Вы ведёте серьёзную операцию. Такая последовательность строит долгосрочный успех.',
    milestone_100: 'Три цифры. 100 лидов. Вы достигли уровня, который видят очень немногие IB. Вы не просто участвуете — вы лидируете. Мы вас видим.',
    journey_label: 'ВАШ ПУТЬ',
    next_milestone: 'Следующее достижение: {next_milestone} лидов',
    remaining: 'Осталось всего {remaining}!',
    max_reached: 'Вы достигли высшего уровня. Вы легенда. Следите за новостями — мы создаём нечто особенное для IB, как вы.',
    cta: 'ПРОДОЛЖАТЬ РАСТИ',
    link_label: 'Ваша ссылка:',
    body_closing: 'Лучшие IB никогда не прекращают делиться. Ваше следующее достижение ближе, чем вы думаете.',
    help: 'Нужна помощь? Свяжитесь с лидером команды или используйте функцию «Сообщить» в дашборде.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'لقد وصلت للتو إلى {milestone} عميل! 🏆',
    preview: 'تم فتح إنجاز. أنت واحد من أفضل الـ IBs أداءً لدينا.',
    heading: 'تم فتح إنجاز! 🏆',
    sub_heading: '{name}، لقد وصلت للتو إلى {milestone} عميل!',
    milestone_5: 'أول 5 لك — هنا يبدأ كل شيء. لقد أثبتّ أنك تستطيع. معظم الناس لا يبدأون حتى، لكنك تبني الزخم بالفعل.',
    milestone_10: 'أرقام من خانتين! أنت تبني رسمياً شبكة حقيقية. صفحتك تعمل، استراتيجيتك تؤتي ثمارها، وأنت بالكاد في مرحلة الإحماء.',
    milestone_25: '25 عميل ليس أمراً بسيطاً. أنت في المستوى الأعلى من الـ IBs النشطين. الناس يستجيبون لما تشاركه — هذا تأثير حقيقي.',
    milestone_50: 'نصف مئة عميل. أنت تدير عملية جادة الآن. هذا النوع من الاستمرارية يبني النجاح طويل المدى.',
    milestone_100: 'ثلاث خانات. 100 عميل. لقد وصلت إلى مستوى نادراً ما يراه أي IB. أنت لا تشارك فحسب — أنت تقود. نحن نراك.',
    journey_label: 'رحلتك حتى الآن',
    next_milestone: 'الإنجاز التالي: {next_milestone} عميل',
    remaining: 'باقي {remaining} فقط!',
    max_reached: 'لقد وصلت إلى أعلى إنجاز. أنت أسطورة. ترقب — نحن نبني شيئاً مميزاً لـ IBs مثلك.',
    cta: 'استمر في النمو',
    link_label: 'رابطك:',
    body_closing: 'أفضل الـ IBs لا يتوقفون عن المشاركة أبداً. إنجازك التالي أقرب مما تظن.',
    help: 'تحتاج مساعدة؟ تواصل مع قائد فريقك أو استخدم ميزة الإبلاغ في لوحة التحكم.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'Na-hit mo lang ang {milestone} leads! 🏆',
    preview: 'Milestone unlocked. Isa ka sa mga top-performing IBs namin.',
    heading: 'MILESTONE UNLOCKED! 🏆',
    sub_heading: '{name}, na-hit mo lang ang {milestone} leads!',
    milestone_5: 'Ang unang 5 mo — dito nagsisimula ang lahat. Napatunayan mo na kaya mo ito. Karamihan hindi nagsisimula, pero ikaw ay nagbu-build na ng momentum.',
    milestone_10: 'Double digits! Opisyal ka nang nagbu-build ng tunay na network. Gumagana ang page mo, nagbabayad ang strategy mo, at nagwo-warm up ka pa lang.',
    milestone_25: 'Ang 25 leads ay hindi biro. Nasa top tier ka ng mga aktibong IBs. Tumutugon ang mga tao sa mga shine-share mo — tunay na impluwensya iyan.',
    milestone_50: 'Kalahating daan ng leads. Seryoso na ang operasyon mo ngayon. Itong uri ng consistency ang nagbu-build ng long-term na tagumpay.',
    milestone_100: 'Triple digits. 100 leads. Naabot mo ang level na kakaunting IBs lang ang nakakakita. Hindi ka lang lumalahok — ikaw ang nangunguna. Nakikita ka namin.',
    journey_label: 'ANG PAGLALAKBAY MO',
    next_milestone: 'Susunod na milestone: {next_milestone} leads',
    remaining: '{remaining} na lang ang kulang!',
    max_reached: 'Naabot mo na ang pinakamataas na milestone. Isa kang alamat. Abangan — may ginagawa kaming espesyal para sa mga IBs na katulad mo.',
    cta: 'PATULOY NA LUMAGO',
    link_label: 'Ang link mo:',
    body_closing: 'Ang pinakamahusay na IBs ay hindi tumitigil sa pag-share. Ang susunod mong milestone ay mas malapit kaysa sa iniisip mo.',
    help: 'Kailangan ng tulong? Kontakin ang team leader mo o gamitin ang Report feature sa dashboard mo.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Você acabou de atingir {milestone} leads! 🏆',
    preview: 'Marco desbloqueado. Você é um dos nossos IBs com melhor desempenho.',
    heading: 'MARCO DESBLOQUEADO! 🏆',
    sub_heading: '{name}, você acabou de atingir {milestone} leads!',
    milestone_5: 'Seus primeiros 5 — é aqui que tudo começa. Você provou que consegue. A maioria das pessoas nem começa, mas você já está construindo impulso.',
    milestone_10: 'Dois dígitos! Você está oficialmente construindo uma rede real. Sua página está funcionando, sua estratégia está dando resultado e você está apenas aquecendo.',
    milestone_25: '25 leads não é brincadeira. Você está no nível mais alto dos IBs ativos. As pessoas estão respondendo ao que você compartilha — isso é influência real.',
    milestone_50: 'Meio centenário de leads. Você está gerenciando uma operação séria agora. Esse tipo de consistência constrói sucesso a longo prazo.',
    milestone_100: 'Três dígitos. 100 leads. Você atingiu um nível que pouquíssimos IBs chegam a ver. Você não está apenas participando — está liderando. Nós vemos você.',
    journey_label: 'SUA JORNADA ATÉ AQUI',
    next_milestone: 'Próximo marco: {next_milestone} leads',
    remaining: 'Faltam apenas {remaining}!',
    max_reached: 'Você atingiu o marco mais alto. Você é uma lenda. Fique ligado — estamos construindo algo especial para IBs como você.',
    cta: 'CONTINUE CRESCENDO',
    link_label: 'Seu link:',
    body_closing: 'Os melhores IBs nunca param de compartilhar. Seu próximo marco está mais perto do que você imagina.',
    help: 'Precisa de ajuda? Entre em contato com seu líder de equipe ou use o recurso de Reportar no seu painel.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คุณเพิ่งถึง {milestone} lead แล้ว! 🏆',
    preview: 'ปลดล็อกเป้าหมายแล้ว คุณเป็นหนึ่งใน IB ที่มีผลงานดีที่สุดของเรา',
    heading: 'ปลดล็อกเป้าหมายแล้ว! 🏆',
    sub_heading: '{name} คุณเพิ่งถึง {milestone} lead แล้ว!',
    milestone_5: '5 คนแรกของคุณ — นี่คือจุดเริ่มต้นของทุกอย่าง คุณพิสูจน์แล้วว่าคุณทำได้ คนส่วนใหญ่ไม่เคยแม้แต่จะเริ่มต้น แต่คุณกำลังสร้างโมเมนตัมแล้ว',
    milestone_10: 'เลขสองหลัก! คุณกำลังสร้างเครือข่ายจริงๆ อย่างเป็นทางการ หน้าเว็บทำงานได้ กลยุทธ์คุ้มค่า และคุณเพิ่งเริ่มอุ่นเครื่อง',
    milestone_25: '25 lead ไม่ใช่เรื่องเล่นๆ คุณอยู่ในระดับสูงสุดของ IB ที่ใช้งานอยู่ ผู้คนตอบรับสิ่งที่คุณแชร์ — นั่นคืออิทธิพลที่แท้จริง',
    milestone_50: 'ครึ่งร้อยของ lead คุณกำลังดำเนินการอย่างจริงจังแล้ว ความสม่ำเสมอแบบนี้สร้างความสำเร็จระยะยาว',
    milestone_100: 'เลขสามหลัก 100 lead คุณถึงระดับที่ IB น้อยมากเคยเห็น คุณไม่ได้แค่เข้าร่วม — คุณกำลังนำ เราเห็นคุณ',
    journey_label: 'เส้นทางของคุณ',
    next_milestone: 'เป้าหมายถัดไป: {next_milestone} lead',
    remaining: 'อีกแค่ {remaining} เท่านั้น!',
    max_reached: 'คุณถึงเป้าหมายสูงสุดแล้ว คุณคือตำนาน คอยติดตาม — เรากำลังสร้างสิ่งพิเศษสำหรับ IB อย่างคุณ',
    cta: 'เติบโตต่อไป',
    link_label: 'ลิงก์ของคุณ:',
    body_closing: 'IB ที่ดีที่สุดไม่เคยหยุดแชร์ เป้าหมายถัดไปของคุณใกล้กว่าที่คิด',
    help: 'ต้องการความช่วยเหลือ? ติดต่อหัวหน้าทีมของคุณหรือใช้ฟีเจอร์รายงานในแดชบอร์ด',
    sign_name: '— ทีม 1Move',
  },
}

function getMilestoneMessage(t: MilestoneTranslation, milestone: MilestoneNumber): string {
  const key = `milestone_${milestone}` as keyof MilestoneTranslation
  return t[key] as string
}

function buildProgressBar(currentMilestone: MilestoneNumber, isRtl: boolean): string {
  const milestoneIndex = MILESTONES.indexOf(currentMilestone)

  const cells = MILESTONES.map((m, i) => {
    const reached = i <= milestoneIndex
    const isCurrent = m === currentMilestone

    const color = reached ? '#c9a84c' : '#555'
    const fontSize = isCurrent ? '28px' : '16px'
    const fontWeight = reached ? '800' : '400'
    const checkmark = reached && !isCurrent ? '<span style="font-size:12px;">✓</span><br/>' : ''
    const highlight = isCurrent
      ? 'border:2px solid #c9a84c;border-radius:50%;width:56px;height:56px;line-height:56px;display:inline-block;background-color:#080808;'
      : ''

    return `<td width="20%" style="text-align:center;padding:4px 2px;">
      ${checkmark}
      <div style="${highlight}">
        <span style="color:${color};font-size:${fontSize};font-weight:${fontWeight};">${m}</span>
      </div>
    </td>`
  })

  // Build the connector line row
  const connectorCells = MILESTONES.map((_, i) => {
    if (i === MILESTONES.length - 1) return '<td></td>'
    const reached = i < milestoneIndex
    const lineColor = reached ? '#c9a84c' : '#333'
    return `<td colspan="1" style="padding:0;">
      <div style="height:3px;background-color:${lineColor};margin:0 4px;"></div>
    </td><td style="width:0;padding:0;"></td>`
  })

  // Simpler approach: single row with milestone numbers and visual separators
  const displayOrder = isRtl ? [...cells].reverse() : cells

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
    <tr>
      ${displayOrder.join('')}
    </tr>
  </table>`
}

interface MilestoneEmailOptions {
  name: string
  slug: string
  milestone: MilestoneNumber
  totalLeads: number
  lang?: string
}

export function buildMilestoneEmail({ name, slug, milestone, totalLeads, lang = 'en' }: MilestoneEmailOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const milestoneMsg = getMilestoneMessage(t, milestone)

  const milestoneIdx = MILESTONES.indexOf(milestone)
  const nextMilestone = milestoneIdx < MILESTONES.length - 1 ? MILESTONES[milestoneIdx + 1] : null
  const remaining = nextMilestone ? nextMilestone - totalLeads : 0
  const isMax = milestone === 100

  const nextMilestoneSection = isMax
    ? `<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">${t.max_reached}</p>`
    : `<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 4px;text-align:center;">${t.next_milestone.replace('{next_milestone}', String(nextMilestone))}</p>
       <p style="color:#c9a84c;font-size:17px;font-weight:700;line-height:1.6;margin:0 0 24px;text-align:center;">${t.remaining.replace('{remaining}', String(remaining > 0 ? remaining : 0))}</p>`

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:28px;margin:0 0 12px;text-align:center;font-weight:800;letter-spacing:1px;">${t.heading}</h1>

<!-- Sub-heading -->
<p style="color:#FFFFFF;font-size:18px;margin:0 0 24px;text-align:center;font-weight:600;">${t.sub_heading.replace('{name}', name).replace('{milestone}', String(milestone))}</p>

<!-- Milestone number display -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:3px solid #c9a84c;border-radius:16px;width:220px;">
        <tr>
          <td style="padding:24px 32px;text-align:center;">
            <p style="color:#c9a84c;font-size:64px;font-weight:800;margin:0;line-height:1;">${milestone}</p>
            <p style="color:#c9a84c;font-size:12px;font-weight:700;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">LEADS</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Milestone message -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 28px;text-align:${textAlign};">${milestoneMsg}</p>

<!-- Journey label -->
<p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 12px;text-align:center;text-transform:uppercase;">${t.journey_label}</p>

<!-- Progress bar -->
${buildProgressBar(milestone, isRtl)}

<!-- Next milestone info -->
${nextMilestoneSection}

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td align="center">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#c9a84c;color:#080808;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta}
      </a>
    </td>
  </tr>
</table>

<!-- Link display box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:1px solid #2A2A4A;border-radius:6px;">
        <tr>
          <td style="padding:12px 20px;text-align:center;">
            <span style="color:#888;font-size:12px;">${t.link_label}</span><br/>
            <a href="https://www.primeverseaccess.com/${slug}" style="color:#c9a84c;font-size:16px;font-weight:700;text-decoration:none;">
              primeverseaccess.com/${slug}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Closing -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 20px;text-align:${textAlign};">${t.body_closing}</p>

<!-- Help text -->
<p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;text-align:center;">${t.help}</p>

<!-- Sign-off -->
<p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0;text-align:${textAlign};">${t.sign_name}</p>`

  const html = baseEmailTemplate({
    content,
    previewText: t.preview,
    dir: isRtl ? 'rtl' : 'ltr',
  })

  const subject = t.subject.replace('{milestone}', String(milestone))

  return { html, subject }
}
