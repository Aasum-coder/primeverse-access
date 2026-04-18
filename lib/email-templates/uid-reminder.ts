import { baseEmailTemplate } from './base'

interface UidReminderTranslation {
  subject: string
  preview: string
  heading: string
  greeting: string
  pending_label: string
  body: string
  uid_explainer_title: string
  uid_explainer_body: string
  steps_label: string
  step_1: string
  step_2: string
  step_3: string
  cta: string
  body_closing: string
  help: string
  sign_name: string
}

const translations: Record<string, UidReminderTranslation> = {
  en: {
    subject: "You have leads who haven't finished signing up yet — time to follow up",
    preview: '{name}, you have {pending_count} lead(s) who still need to complete broker signup and KYC.',
    heading: 'Follow up with your pending leads',
    greeting: 'Hey {name},',
    pending_label: 'PENDING LEADS',
    body: "You have {pending_count} lead(s) who registered through your page but haven't yet opened a broker account or completed KYC. A quick personal message often makes the difference.",
    uid_explainer_title: 'Why follow up?',
    uid_explainer_body: "Once a lead completes KYC, they're automatically verified and credited to you. Until then, they might just need a friendly nudge to finish the broker signup.",
    steps_label: 'How to follow up:',
    step_1: 'Log in to your dashboard at primeverseaccess.com',
    step_2: 'Go to the Leads tab and find the pending lead(s)',
    step_3: 'Send them a quick personal message or reminder',
    cta: 'GO TO MY DASHBOARD',
    body_closing: 'The sooner you follow up, the sooner they complete KYC and auto-verify — then your commissions start flowing.',
    help: 'Some leads just need a nudge. A short, personal message goes a long way.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Du har leads som ikke har fullført registreringen ennå — følg opp',
    preview: '{name}, du har {pending_count} lead(s) som fortsatt må fullføre meglerregistrering og KYC.',
    heading: 'Følg opp dine ventende leads',
    greeting: 'Hei {name},',
    pending_label: 'VENTENDE LEADS',
    body: 'Du har {pending_count} lead(s) som registrerte seg via siden din, men som ennå ikke har åpnet meglerkonto eller fullført KYC. En rask personlig melding utgjør ofte forskjellen.',
    uid_explainer_title: 'Hvorfor følge opp?',
    uid_explainer_body: 'Når en lead fullfører KYC, verifiseres de automatisk og krediteres deg. Inntil da trenger de kanskje bare en vennlig påminnelse om å fullføre meglerregistreringen.',
    steps_label: 'Slik følger du opp:',
    step_1: 'Logg inn på dashboardet på primeverseaccess.com',
    step_2: 'Gå til Leads-fanen og finn de ventende lead(s)',
    step_3: 'Send dem en rask personlig melding eller påminnelse',
    cta: 'GÅ TIL DASHBOARDET',
    body_closing: 'Jo raskere du følger opp, jo raskere fullfører de KYC og auto-verifiseres — så begynner provisjonene å strømme.',
    help: 'Noen leads trenger bare en påminnelse. En kort, personlig melding har stor effekt.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Du har leads som inte har slutfört registreringen ännu — följ upp',
    preview: '{name}, du har {pending_count} lead(s) som fortfarande behöver slutföra mäklarregistrering och KYC.',
    heading: 'Följ upp dina väntande leads',
    greeting: 'Hej {name},',
    pending_label: 'VÄNTANDE LEADS',
    body: 'Du har {pending_count} lead(s) som registrerade sig via din sida men som ännu inte öppnat mäklarkonto eller slutfört KYC. Ett snabbt personligt meddelande gör ofta skillnad.',
    uid_explainer_title: 'Varför följa upp?',
    uid_explainer_body: 'När en lead slutför KYC verifieras de automatiskt och krediteras till dig. Tills dess behöver de kanske bara en vänlig påminnelse om att slutföra mäklarregistreringen.',
    steps_label: 'Så följer du upp:',
    step_1: 'Logga in på din dashboard på primeverseaccess.com',
    step_2: 'Gå till Leads-fliken och hitta de väntande lead(s)',
    step_3: 'Skicka ett snabbt personligt meddelande eller påminnelse',
    cta: 'GÅ TILL MIN DASHBOARD',
    body_closing: 'Ju snabbare du följer upp, desto snabbare slutför de KYC och auto-verifieras — sedan börjar provisionerna flöda.',
    help: 'Vissa leads behöver bara en puff. Ett kort, personligt meddelande räcker långt.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: 'Tienes leads que aún no han terminado de registrarse — hora de hacer seguimiento',
    preview: '{name}, tienes {pending_count} lead(s) que aún necesitan completar el registro del bróker y KYC.',
    heading: 'Haz seguimiento a tus leads pendientes',
    greeting: 'Hey {name},',
    pending_label: 'LEADS PENDIENTES',
    body: 'Tienes {pending_count} lead(s) que se registraron a través de tu página pero aún no han abierto una cuenta de bróker ni completado el KYC. Un mensaje personal rápido suele marcar la diferencia.',
    uid_explainer_title: '¿Por qué hacer seguimiento?',
    uid_explainer_body: 'Una vez que un lead completa el KYC, se verifica automáticamente y se te acredita. Hasta entonces, quizás solo necesiten un recordatorio amistoso para terminar el registro con el bróker.',
    steps_label: 'Cómo hacer seguimiento:',
    step_1: 'Inicia sesión en tu panel en primeverseaccess.com',
    step_2: 'Ve a la pestaña de Leads y encuentra los leads pendientes',
    step_3: 'Envíales un mensaje personal rápido o recordatorio',
    cta: 'IR A MI PANEL',
    body_closing: 'Cuanto antes hagas seguimiento, antes completarán el KYC y se auto-verificarán — luego tus comisiones empiezan a fluir.',
    help: 'Algunos leads solo necesitan un empujón. Un mensaje corto y personal llega lejos.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'У вас есть лиды, которые ещё не завершили регистрацию — время связаться',
    preview: '{name}, у вас {pending_count} лид(ов), которым ещё нужно завершить регистрацию у брокера и KYC.',
    heading: 'Свяжитесь с вашими ожидающими лидами',
    greeting: 'Привет, {name},',
    pending_label: 'ОЖИДАЮЩИЕ ЛИДЫ',
    body: 'У вас {pending_count} лид(ов), которые зарегистрировались через вашу страницу, но ещё не открыли счёт у брокера или не прошли KYC. Короткое личное сообщение часто решает дело.',
    uid_explainer_title: 'Зачем связываться?',
    uid_explainer_body: 'Как только лид проходит KYC, он автоматически верифицируется и зачисляется на ваш счёт. До этого ему может просто нужно дружеское напоминание завершить регистрацию у брокера.',
    steps_label: 'Как связаться:',
    step_1: 'Войдите в дашборд на primeverseaccess.com',
    step_2: 'Перейдите на вкладку Лиды и найдите ожидающих',
    step_3: 'Отправьте им короткое личное сообщение или напоминание',
    cta: 'ПЕРЕЙТИ В ДАШБОРД',
    body_closing: 'Чем быстрее вы свяжетесь, тем быстрее они пройдут KYC и авто-верифицируются — тогда ваши комиссии начнут поступать.',
    help: 'Некоторым лидам нужен только толчок. Короткое личное сообщение работает отлично.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'لديك عملاء لم يكملوا التسجيل بعد — حان وقت المتابعة',
    preview: '{name}، لديك {pending_count} عميل(عملاء) لا يزالون بحاجة إلى إكمال تسجيل الوسيط و KYC.',
    heading: 'تابع مع عملائك المعلقين',
    greeting: 'مرحباً {name}،',
    pending_label: 'العملاء المعلقون',
    body: 'لديك {pending_count} عميل(عملاء) سجلوا من خلال صفحتك لكنهم لم يفتحوا حساب وسيط بعد أو لم يكملوا KYC. رسالة شخصية سريعة غالباً ما تحدث الفرق.',
    uid_explainer_title: 'لماذا المتابعة؟',
    uid_explainer_body: 'بمجرد أن يكمل العميل KYC، يتم التحقق منه تلقائياً وإضافته إلى حسابك. حتى ذلك الحين، قد يحتاجون فقط إلى تذكير ودي لإتمام التسجيل لدى الوسيط.',
    steps_label: 'كيفية المتابعة:',
    step_1: 'سجل الدخول إلى لوحة التحكم على primeverseaccess.com',
    step_2: 'اذهب إلى تبويب العملاء وابحث عن العملاء المعلقين',
    step_3: 'أرسل لهم رسالة شخصية سريعة أو تذكيراً',
    cta: 'الذهاب إلى لوحة التحكم',
    body_closing: 'كلما أسرعت في المتابعة، كلما أسرعوا في إكمال KYC والتحقق التلقائي — ثم تبدأ عمولاتك في التدفق.',
    help: 'بعض العملاء يحتاجون فقط إلى تذكير. رسالة قصيرة وشخصية تقطع شوطاً طويلاً.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'May mga lead kang hindi pa natatapos mag-sign up — oras na para mag-follow up',
    preview: '{name}, mayroon kang {pending_count} lead(s) na kailangan pang tapusin ang broker signup at KYC.',
    heading: 'Mag-follow up sa iyong mga pending lead',
    greeting: 'Hey {name},',
    pending_label: 'PENDING LEADS',
    body: 'Mayroon kang {pending_count} lead(s) na nag-sign up sa page mo pero hindi pa nagbubukas ng broker account o natapos ang KYC. Minsan, isang mabilis na personal message ay sapat na.',
    uid_explainer_title: 'Bakit mag-follow up?',
    uid_explainer_body: 'Kapag natapos ng lead ang KYC, awtomatiko silang na-verify at naka-credit sa iyo. Hanggang sa mangyari iyon, maaaring kailangan lang nila ng magiliw na paalala na tapusin ang broker signup.',
    steps_label: 'Paano mag-follow up:',
    step_1: 'Mag-log in sa dashboard mo sa primeverseaccess.com',
    step_2: 'Pumunta sa Leads tab at hanapin ang pending lead(s)',
    step_3: 'Padalhan sila ng mabilis na personal message o paalala',
    cta: 'PUMUNTA SA DASHBOARD KO',
    body_closing: 'Kapag mas mabilis mong na-follow up, mas mabilis nilang natatapos ang KYC at awtomatikong na-verify — tapos magsisimulang dumaloy ang mga komisyon.',
    help: 'May mga lead na nangangailangan lang ng tulong. Isang maikling personal message ay malaki ang naitutulong.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Você tem leads que ainda não terminaram o cadastro — hora de fazer follow-up',
    preview: '{name}, você tem {pending_count} lead(s) que ainda precisam completar o cadastro da corretora e o KYC.',
    heading: 'Faça follow-up com seus leads pendentes',
    greeting: 'Hey {name},',
    pending_label: 'LEADS PENDENTES',
    body: 'Você tem {pending_count} lead(s) que se cadastraram pela sua página mas ainda não abriram uma conta na corretora ou concluíram o KYC. Uma mensagem pessoal rápida muitas vezes faz a diferença.',
    uid_explainer_title: 'Por que fazer follow-up?',
    uid_explainer_body: 'Assim que um lead conclui o KYC, ele é automaticamente verificado e creditado para você. Até lá, pode ser que só precisem de um lembrete amigável para terminar o cadastro na corretora.',
    steps_label: 'Como fazer follow-up:',
    step_1: 'Faça login no seu painel em primeverseaccess.com',
    step_2: 'Vá até a aba Leads e encontre os leads pendentes',
    step_3: 'Envie uma mensagem pessoal rápida ou um lembrete',
    cta: 'IR PARA MEU PAINEL',
    body_closing: 'Quanto antes você fizer follow-up, mais rápido eles concluirão o KYC e se auto-verificarão — então suas comissões começam a fluir.',
    help: 'Alguns leads só precisam de um empurrão. Uma mensagem curta e pessoal faz muita diferença.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คุณมี leads ที่ยังสมัครไม่เสร็จ — ถึงเวลาติดตาม',
    preview: '{name}, คุณมี {pending_count} lead ที่ยังต้องทำการสมัครโบรกเกอร์และ KYC ให้เสร็จ',
    heading: 'ติดตาม leads ที่รอดำเนินการของคุณ',
    greeting: 'เฮ้ {name},',
    pending_label: 'LEADS ที่รอดำเนินการ',
    body: 'คุณมี {pending_count} lead ที่สมัครผ่านหน้าเว็บของคุณแต่ยังไม่ได้เปิดบัญชีโบรกเกอร์หรือทำ KYC ให้เสร็จ ข้อความส่วนตัวสั้นๆ มักสร้างความแตกต่าง',
    uid_explainer_title: 'ทำไมต้องติดตาม?',
    uid_explainer_body: 'เมื่อ lead ทำ KYC เสร็จ พวกเขาจะได้รับการยืนยันโดยอัตโนมัติและเครดิตเข้าบัญชีคุณ จนกว่าจะถึงตอนนั้น พวกเขาอาจต้องการเพียงการเตือนที่เป็นมิตรเพื่อทำการสมัครโบรกเกอร์ให้เสร็จ',
    steps_label: 'วิธีติดตาม:',
    step_1: 'เข้าสู่ระบบแดชบอร์ดที่ primeverseaccess.com',
    step_2: 'ไปที่แท็บ Leads และค้นหา lead ที่รอดำเนินการ',
    step_3: 'ส่งข้อความส่วนตัวสั้นๆ หรือคำเตือนให้พวกเขา',
    cta: 'ไปที่แดชบอร์ดของฉัน',
    body_closing: 'ยิ่งคุณติดตามเร็วเท่าไหร่ พวกเขาก็จะทำ KYC เสร็จและยืนยันอัตโนมัติเร็วขึ้น — แล้วค่าคอมมิชชั่นของคุณก็จะเริ่มไหลเข้ามา',
    help: 'บาง leads ต้องการเพียงการกระตุ้น ข้อความสั้นๆ ที่เป็นส่วนตัวมีผลมาก',
    sign_name: '— ทีม 1Move',
  },
}

function buildStepRow(number: number, text: string): string {
  return `<tr>
    <td width="32" valign="top" style="padding:8px 0;color:#c9a84c;font-size:16px;font-weight:700;line-height:1.4;">
      ${number}.
    </td>
    <td valign="top" style="padding:8px 0 8px 4px;color:#E0E0E0;font-size:15px;line-height:1.4;">
      ${text}
    </td>
  </tr>`
}

interface UidReminderOptions {
  name: string
  pendingCount: number
  lang?: string
}

export function buildUidReminderEmail({ name, pendingCount, lang = 'en' }: UidReminderOptions) {
  const t = translations[lang] || translations.en
  const isRtl = lang === 'ar'
  const textAlign = isRtl ? 'right' : 'left'

  const content = `
<!-- Heading -->
<h1 style="color:#c9a84c;font-size:24px;margin:0 0 16px;text-align:center;">${t.heading}</h1>

<!-- Greeting -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.greeting.replace('{name}', name)}</p>

<!-- Pending count scoreboard -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#080808;border:2px solid #c9a84c;border-radius:10px;width:200px;">
        <tr>
          <td style="padding:20px 24px;text-align:center;">
            <p style="color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">${t.pending_label}</p>
            <p style="color:#c9a84c;font-size:52px;font-weight:800;margin:0;line-height:1;">${pendingCount}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Body -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:${textAlign};">${t.body.replace('{pending_count}', String(pendingCount))}</p>

<!-- Explainer box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:#080808;border:1px solid #c9a84c;border-radius:8px;padding:20px 24px;">
      <p style="color:#c9a84c;font-size:15px;font-weight:700;margin:0 0 8px;text-align:${textAlign};">${t.uid_explainer_title}</p>
      <p style="color:#CCCCCC;font-size:14px;line-height:1.6;margin:0;text-align:${textAlign};">${t.uid_explainer_body}</p>
    </td>
  </tr>
</table>

<!-- Steps -->
<p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 12px;text-align:${textAlign};font-weight:700;">${t.steps_label}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  ${buildStepRow(1, t.step_1)}
  ${buildStepRow(2, t.step_2)}
  ${buildStepRow(3, t.step_3)}
</table>

<!-- CTA Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td align="center">
      <a href="https://www.primeverseaccess.com" style="display:inline-block;background-color:#c9a84c;color:#080808;padding:16px 40px;font-size:17px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.5px;">
        ${t.cta}
      </a>
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
    previewText: t.preview.replace('{name}', name).replace('{pending_count}', String(pendingCount)),
    dir: isRtl ? 'rtl' : 'ltr',
  })

  return { html, subject: t.subject }
}
