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
    subject: 'You have a lead waiting — submit their UID to complete the connection',
    preview: '{name}, you have {pending_count} lead(s) without a UID. Submit now to complete the connection.',
    heading: 'You have leads waiting for a UID',
    greeting: 'Hey {name},',
    pending_label: 'PENDING UIDs',
    body: 'You have {pending_count} lead(s) who signed up through your page but still don\'t have a UID submitted. Without a UID, the connection between you and your client can\'t be finalized.',
    uid_explainer_title: 'What is a UID?',
    uid_explainer_body: 'A UID (Unique Identifier) is the client\'s trading account number. Once your lead opens a trading account, you\'ll receive their UID. Submit it in your dashboard to link them to you as their IB.',
    steps_label: 'How to submit a UID:',
    step_1: 'Log in to your dashboard at primeverseaccess.com',
    step_2: 'Go to the Leads tab and find the pending lead(s)',
    step_3: 'Enter the UID and click submit — done!',
    cta: 'GO TO MY DASHBOARD',
    body_closing: 'The sooner you submit the UID, the sooner the connection is complete and commissions can start flowing.',
    help: 'Don\'t have the UID yet? Follow up with your lead and remind them to open their trading account.',
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Du har en lead som venter — send inn UID for å fullføre koblingen',
    preview: '{name}, du har {pending_count} lead(s) uten UID. Send inn nå for å fullføre koblingen.',
    heading: 'Du har leads som venter på en UID',
    greeting: 'Hei {name},',
    pending_label: 'VENTENDE UIDs',
    body: 'Du har {pending_count} lead(s) som registrerte seg via siden din, men som fortsatt ikke har en UID. Uten en UID kan ikke koblingen mellom deg og klienten fullføres.',
    uid_explainer_title: 'Hva er en UID?',
    uid_explainer_body: 'En UID (Unique Identifier) er klientens handelskonto-nummer. Når leaden din åpner en handelskonto, vil du motta deres UID. Send den inn i dashboardet for å koble dem til deg som IB.',
    steps_label: 'Slik sender du inn en UID:',
    step_1: 'Logg inn på dashboardet ditt på primeverseaccess.com',
    step_2: 'Gå til Leads-fanen og finn ventende lead(s)',
    step_3: 'Skriv inn UID og klikk send — ferdig!',
    cta: 'GÅ TIL DASHBOARDET',
    body_closing: 'Jo raskere du sender inn UID, jo raskere fullføres koblingen og provisjoner kan begynne å strømme inn.',
    help: 'Har du ikke UID ennå? Følg opp med leaden din og minn dem på å åpne handelskontoen.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Du har en lead som väntar — skicka in UID för att slutföra kopplingen',
    preview: '{name}, du har {pending_count} lead(s) utan UID. Skicka in nu för att slutföra kopplingen.',
    heading: 'Du har leads som väntar på en UID',
    greeting: 'Hej {name},',
    pending_label: 'VÄNTANDE UIDs',
    body: 'Du har {pending_count} lead(s) som registrerade sig via din sida men som fortfarande inte har en UID. Utan en UID kan kopplingen mellan dig och klienten inte slutföras.',
    uid_explainer_title: 'Vad är en UID?',
    uid_explainer_body: 'En UID (Unique Identifier) är klientens handelskonto-nummer. När din lead öppnar ett handelskonto får du deras UID. Skicka in den i din dashboard för att koppla dem till dig som IB.',
    steps_label: 'Så skickar du in en UID:',
    step_1: 'Logga in på din dashboard på primeverseaccess.com',
    step_2: 'Gå till Leads-fliken och hitta väntande lead(s)',
    step_3: 'Ange UID och klicka skicka — klart!',
    cta: 'GÅ TILL MIN DASHBOARD',
    body_closing: 'Ju snabbare du skickar in UID, desto snabbare slutförs kopplingen och provisioner kan börja flöda.',
    help: 'Har du inte UID än? Följ upp med din lead och påminn dem om att öppna sitt handelskonto.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: 'Tienes un lead esperando — envía su UID para completar la conexión',
    preview: '{name}, tienes {pending_count} lead(s) sin UID. Envía ahora para completar la conexión.',
    heading: 'Tienes leads esperando un UID',
    greeting: 'Hey {name},',
    pending_label: 'UIDs PENDIENTES',
    body: 'Tienes {pending_count} lead(s) que se registraron a través de tu página pero aún no tienen un UID enviado. Sin un UID, la conexión entre tú y tu cliente no puede finalizarse.',
    uid_explainer_title: '¿Qué es un UID?',
    uid_explainer_body: 'Un UID (Identificador Único) es el número de cuenta de trading del cliente. Una vez que tu lead abra una cuenta de trading, recibirás su UID. Envíalo en tu panel para vincularlos a ti como su IB.',
    steps_label: 'Cómo enviar un UID:',
    step_1: 'Inicia sesión en tu panel en primeverseaccess.com',
    step_2: 'Ve a la pestaña de Leads y encuentra los leads pendientes',
    step_3: 'Ingresa el UID y haz clic en enviar — ¡listo!',
    cta: 'IR A MI PANEL',
    body_closing: 'Cuanto antes envíes el UID, antes se completará la conexión y las comisiones podrán empezar a fluir.',
    help: '¿Aún no tienes el UID? Haz seguimiento con tu lead y recuérdale que abra su cuenta de trading.',
    sign_name: '— El equipo de 1Move',
  },
  ru: {
    subject: 'У вас есть лид, который ждёт — отправьте его UID для завершения связи',
    preview: '{name}, у вас {pending_count} лид(ов) без UID. Отправьте сейчас, чтобы завершить связь.',
    heading: 'У вас есть лиды, ожидающие UID',
    greeting: 'Привет, {name},',
    pending_label: 'ОЖИДАЮЩИЕ UIDs',
    body: 'У вас {pending_count} лид(ов), которые зарегистрировались через вашу страницу, но для которых UID ещё не отправлен. Без UID связь между вами и клиентом не может быть завершена.',
    uid_explainer_title: 'Что такое UID?',
    uid_explainer_body: 'UID (Уникальный Идентификатор) — это номер торгового счёта клиента. Когда ваш лид откроет торговый счёт, вы получите его UID. Отправьте его в дашборде, чтобы связать клиента с вами как IB.',
    steps_label: 'Как отправить UID:',
    step_1: 'Войдите в дашборд на primeverseaccess.com',
    step_2: 'Перейдите на вкладку Лиды и найдите ожидающих',
    step_3: 'Введите UID и нажмите отправить — готово!',
    cta: 'ПЕРЕЙТИ В ДАШБОРД',
    body_closing: 'Чем скорее вы отправите UID, тем скорее связь будет завершена и комиссии начнут поступать.',
    help: 'Ещё нет UID? Свяжитесь с лидом и напомните ему открыть торговый счёт.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'لديك عميل ينتظر — أرسل معرف UID لإتمام الربط',
    preview: '{name}، لديك {pending_count} عميل(عملاء) بدون UID. أرسل الآن لإتمام الربط.',
    heading: 'لديك عملاء ينتظرون UID',
    greeting: 'مرحباً {name}،',
    pending_label: 'UIDs معلقة',
    body: 'لديك {pending_count} عميل(عملاء) سجلوا من خلال صفحتك لكن لم يتم إرسال UID الخاص بهم بعد. بدون UID، لا يمكن إتمام الربط بينك وبين عميلك.',
    uid_explainer_title: 'ما هو UID؟',
    uid_explainer_body: 'UID (المعرف الفريد) هو رقم حساب التداول الخاص بالعميل. بمجرد أن يفتح العميل حساب تداول، ستتلقى UID الخاص به. أرسله في لوحة التحكم لربطه بك كـ IB.',
    steps_label: 'كيفية إرسال UID:',
    step_1: 'سجل الدخول إلى لوحة التحكم على primeverseaccess.com',
    step_2: 'اذهب إلى تبويب العملاء وابحث عن العملاء المعلقين',
    step_3: 'أدخل UID واضغط إرسال — انتهى!',
    cta: 'الذهاب إلى لوحة التحكم',
    body_closing: 'كلما أسرعت في إرسال UID، كلما اكتمل الربط أسرع وبدأت العمولات في التدفق.',
    help: 'لا تملك UID بعد؟ تابع مع عميلك وذكّره بفتح حساب التداول.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'May lead kang naghihintay — i-submit ang UID para makumpleto ang koneksyon',
    preview: '{name}, mayroon kang {pending_count} lead(s) na walang UID. I-submit na para makumpleto ang koneksyon.',
    heading: 'May mga lead kang naghihintay ng UID',
    greeting: 'Hey {name},',
    pending_label: 'PENDING UIDs',
    body: 'Mayroon kang {pending_count} lead(s) na nag-sign up sa page mo pero wala pa ring UID na nai-submit. Kung walang UID, hindi makukumpleto ang koneksyon sa pagitan mo at ng iyong client.',
    uid_explainer_title: 'Ano ang UID?',
    uid_explainer_body: 'Ang UID (Unique Identifier) ay ang trading account number ng client. Kapag nagbukas ng trading account ang lead mo, matatanggap mo ang kanilang UID. I-submit ito sa dashboard mo para i-link sila sa iyo bilang IB.',
    steps_label: 'Paano mag-submit ng UID:',
    step_1: 'Mag-log in sa dashboard mo sa primeverseaccess.com',
    step_2: 'Pumunta sa Leads tab at hanapin ang pending lead(s)',
    step_3: 'I-type ang UID at i-click ang submit — tapos na!',
    cta: 'PUMUNTA SA DASHBOARD KO',
    body_closing: 'Kapag mas mabilis mong na-submit ang UID, mas mabilis makukumpleto ang koneksyon at magsisimulang dumaloy ang mga komisyon.',
    help: 'Wala pa bang UID? I-follow up ang lead mo at ipaalala sa kanila na mag-open ng trading account.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Você tem um lead esperando — envie o UID para completar a conexão',
    preview: '{name}, você tem {pending_count} lead(s) sem UID. Envie agora para completar a conexão.',
    heading: 'Você tem leads esperando um UID',
    greeting: 'Hey {name},',
    pending_label: 'UIDs PENDENTES',
    body: 'Você tem {pending_count} lead(s) que se cadastraram pela sua página mas ainda não têm um UID enviado. Sem um UID, a conexão entre você e seu cliente não pode ser finalizada.',
    uid_explainer_title: 'O que é um UID?',
    uid_explainer_body: 'Um UID (Identificador Único) é o número da conta de trading do cliente. Quando seu lead abrir uma conta de trading, você receberá o UID dele. Envie no seu painel para vinculá-lo a você como IB.',
    steps_label: 'Como enviar um UID:',
    step_1: 'Faça login no seu painel em primeverseaccess.com',
    step_2: 'Vá até a aba Leads e encontre os leads pendentes',
    step_3: 'Digite o UID e clique enviar — pronto!',
    cta: 'IR PARA MEU PAINEL',
    body_closing: 'Quanto antes você enviar o UID, mais rápido a conexão será completada e as comissões poderão começar a fluir.',
    help: 'Ainda não tem o UID? Faça follow-up com seu lead e lembre-o de abrir a conta de trading.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คุณมี lead รอดำเนินการ — ส่ง UID เพื่อเชื่อมต่อให้สมบูรณ์',
    preview: '{name}, คุณมี {pending_count} lead ที่ยังไม่มี UID ส่งตอนนี้เพื่อเชื่อมต่อให้สมบูรณ์',
    heading: 'คุณมี lead ที่รอ UID อยู่',
    greeting: 'เฮ้ {name},',
    pending_label: 'UIDs ที่รอดำเนินการ',
    body: 'คุณมี {pending_count} lead ที่สมัครผ่านหน้าเว็บของคุณแต่ยังไม่ได้ส่ง UID หากไม่มี UID การเชื่อมต่อระหว่างคุณกับลูกค้าจะไม่สามารถเสร็จสมบูรณ์ได้',
    uid_explainer_title: 'UID คืออะไร?',
    uid_explainer_body: 'UID (Unique Identifier) คือหมายเลขบัญชีเทรดของลูกค้า เมื่อ lead ของคุณเปิดบัญชีเทรด คุณจะได้รับ UID ของพวกเขา ส่งในแดชบอร์ดเพื่อเชื่อมโยงพวกเขากับคุณในฐานะ IB',
    steps_label: 'วิธีส่ง UID:',
    step_1: 'เข้าสู่ระบบแดชบอร์ดที่ primeverseaccess.com',
    step_2: 'ไปที่แท็บ Leads และค้นหา lead ที่รอดำเนินการ',
    step_3: 'กรอก UID แล้วกดส่ง — เสร็จแล้ว!',
    cta: 'ไปที่แดชบอร์ดของฉัน',
    body_closing: 'ยิ่งคุณส่ง UID เร็วเท่าไหร่ การเชื่อมต่อก็จะสมบูรณ์เร็วขึ้นและค่าคอมมิชชั่นจะเริ่มไหลเข้ามา',
    help: 'ยังไม่มี UID? ติดตามกับ lead ของคุณและเตือนพวกเขาให้เปิดบัญชีเทรด',
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
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#0F0F23;border:2px solid #c9a84c;border-radius:10px;width:200px;">
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

<!-- UID Explainer box -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:#0F0F23;border:1px solid #c9a84c;border-radius:8px;padding:20px 24px;">
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
