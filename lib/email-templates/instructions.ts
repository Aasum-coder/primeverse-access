import { baseEmailTemplate } from './base'

// TODO(richy): Replace the placeholder PDF at
// public/downloads/primeverse-auto-approval-setup.pdf with the Notion export
// once the guide is finalized. The URL below is stable and public.
const NOTION_URL =
  'https://www.notion.so/PrimeVerse-Auto-Approval-Setup-34be6af83e5a80cc9653c0611f47f27a?source=copy_link'
const PDF_URL =
  'https://www.primeverseaccess.com/downloads/primeverse-auto-approval-setup.pdf'

type Lang = 'en' | 'no' | 'sv' | 'es' | 'ru' | 'ar' | 'tl' | 'pt' | 'th'

interface InstructionsTranslation {
  subject: string
  preview: string
  heading: string
  body_1: string
  body_2: string
  cta: string
  pdf_label: string
  help: string
  sign_off: string
  sign_name: string
}

const translations: Record<Lang, InstructionsTranslation> = {
  en: {
    subject: 'Your setup guide – PrimeVerse Auto-Verify',
    preview: 'Step-by-step guide to connect your email provider to PrimeVerse Auto-Verify.',
    heading: 'Your setup guide is here, {name}',
    body_1: 'This guide walks you through the whole Auto-Verify setup — adding the forwarding address, creating the filter, and confirming your first PuPrime mail lands.',
    body_2: 'Open it online for the always-fresh version, or save the PDF for later.',
    cta: 'READ ONLINE',
    pdf_label: 'Or download the PDF',
    help: 'Questions? Reach out to your team leader.',
    sign_off: "Let's get you auto-verified.",
    sign_name: '— The 1Move Team',
  },
  no: {
    subject: 'Din oppsettveiledning – PrimeVerse Auto-Verify',
    preview: 'Trinn-for-trinn-veiledning for å koble e-postleverandøren din til PrimeVerse Auto-Verify.',
    heading: 'Her er oppsettveiledningen din, {name}',
    body_1: 'Denne veiledningen tar deg gjennom hele Auto-Verify-oppsettet — legge til videresendingsadresse, opprette filter og bekrefte at første PuPrime-epost kommer inn.',
    body_2: 'Åpne den online for alltid oppdatert versjon, eller lagre PDF-en til senere.',
    cta: 'LES ONLINE',
    pdf_label: 'Eller last ned PDF-en',
    help: 'Spørsmål? Kontakt din teamleder.',
    sign_off: 'La oss få deg auto-verifisert.',
    sign_name: '— 1Move-teamet',
  },
  sv: {
    subject: 'Din installationsguide – PrimeVerse Auto-Verify',
    preview: 'Steg-för-steg-guide för att ansluta din e-postleverantör till PrimeVerse Auto-Verify.',
    heading: 'Här är din installationsguide, {name}',
    body_1: 'Den här guiden tar dig igenom hela Auto-Verify-uppsättningen — lägga till vidarebefordringsadress, skapa filter och bekräfta att första PuPrime-mejlet kommer in.',
    body_2: 'Öppna den online för alltid uppdaterad version, eller spara PDF-en till senare.',
    cta: 'LÄS ONLINE',
    pdf_label: 'Eller ladda ner PDF-en',
    help: 'Frågor? Kontakta din teamledare.',
    sign_off: 'Låt oss få dig auto-verifierad.',
    sign_name: '— 1Move-teamet',
  },
  es: {
    subject: 'Tu guía de configuración – PrimeVerse Auto-Verify',
    preview: 'Guía paso a paso para conectar tu proveedor de correo a PrimeVerse Auto-Verify.',
    heading: 'Aquí está tu guía de configuración, {name}',
    body_1: 'Esta guía te lleva por toda la configuración de Auto-Verify: añadir la dirección de reenvío, crear el filtro y confirmar que llega tu primer correo de PuPrime.',
    body_2: 'Ábrela online para ver siempre la versión más reciente, o guarda el PDF para después.',
    cta: 'LEER EN LÍNEA',
    pdf_label: 'O descarga el PDF',
    help: '¿Preguntas? Contacta a tu líder de equipo.',
    sign_off: 'Vamos a auto-verificarte.',
    sign_name: '— El equipo 1Move',
  },
  ru: {
    subject: 'Ваше руководство по настройке – PrimeVerse Auto-Verify',
    preview: 'Пошаговое руководство по подключению вашего почтового провайдера к PrimeVerse Auto-Verify.',
    heading: 'Ваше руководство готово, {name}',
    body_1: 'Это руководство проведёт вас через всю настройку Auto-Verify — добавление адреса пересылки, создание фильтра и подтверждение получения первого письма PuPrime.',
    body_2: 'Откройте онлайн, чтобы видеть самую свежую версию, или сохраните PDF.',
    cta: 'ОТКРЫТЬ ОНЛАЙН',
    pdf_label: 'Или скачайте PDF',
    help: 'Вопросы? Свяжитесь со своим тимлидом.',
    sign_off: 'Давайте автоверифицируем вас.',
    sign_name: '— Команда 1Move',
  },
  ar: {
    subject: 'دليل الإعداد الخاص بك – PrimeVerse Auto-Verify',
    preview: 'دليل خطوة بخطوة لربط مزود البريد الإلكتروني بـ PrimeVerse Auto-Verify.',
    heading: 'دليل الإعداد هنا يا {name}',
    body_1: 'يأخذك هذا الدليل عبر إعداد Auto-Verify بالكامل — إضافة عنوان إعادة التوجيه، وإنشاء الفلتر، وتأكيد وصول أول بريد من PuPrime.',
    body_2: 'افتحه عبر الإنترنت للإصدار الأحدث، أو احفظ ملف PDF لوقت لاحق.',
    cta: 'افتح عبر الإنترنت',
    pdf_label: 'أو قم بتنزيل ملف PDF',
    help: 'هل لديك أسئلة؟ تواصل مع قائد فريقك.',
    sign_off: 'لنبدأ التحقق التلقائي.',
    sign_name: '— فريق 1Move',
  },
  tl: {
    subject: 'Ang iyong setup guide – PrimeVerse Auto-Verify',
    preview: 'Step-by-step na gabay para ikonekta ang iyong email provider sa PrimeVerse Auto-Verify.',
    heading: 'Nandito na ang setup guide mo, {name}',
    body_1: 'Dadalhin ka ng guide na ito sa buong Auto-Verify setup — pagdagdag ng forwarding address, paglikha ng filter, at pagkumpirma na dumating ang unang PuPrime mail.',
    body_2: 'Buksan online para sa laging updated na bersyon, o i-save ang PDF para sa susunod.',
    cta: 'BASAHIN ONLINE',
    pdf_label: 'O i-download ang PDF',
    help: 'May tanong? Kontakin ang iyong team leader.',
    sign_off: 'Auto-verifyin ka na natin.',
    sign_name: '— Ang 1Move Team',
  },
  pt: {
    subject: 'Seu guia de configuração – PrimeVerse Auto-Verify',
    preview: 'Guia passo a passo para conectar seu provedor de e-mail ao PrimeVerse Auto-Verify.',
    heading: 'Seu guia de configuração chegou, {name}',
    body_1: 'Este guia leva você por toda a configuração do Auto-Verify — adicionar o endereço de encaminhamento, criar o filtro e confirmar que seu primeiro e-mail do PuPrime chega.',
    body_2: 'Abra online para ver sempre a versão mais recente, ou salve o PDF para depois.',
    cta: 'LER ONLINE',
    pdf_label: 'Ou baixe o PDF',
    help: 'Dúvidas? Fale com seu líder de equipe.',
    sign_off: 'Vamos te auto-verificar.',
    sign_name: '— A equipe 1Move',
  },
  th: {
    subject: 'คู่มือการตั้งค่าของคุณ – PrimeVerse Auto-Verify',
    preview: 'คู่มือทีละขั้นตอนในการเชื่อมต่อผู้ให้บริการอีเมลของคุณกับ PrimeVerse Auto-Verify',
    heading: 'คู่มือการตั้งค่าของคุณมาแล้ว {name}',
    body_1: 'คู่มือนี้จะพาคุณผ่านการตั้งค่า Auto-Verify ทั้งหมด — เพิ่มที่อยู่ส่งต่อ, สร้างตัวกรอง และยืนยันว่าอีเมล PuPrime ฉบับแรกเข้ามาถึง',
    body_2: 'เปิดออนไลน์เพื่อเวอร์ชันล่าสุดเสมอ หรือบันทึก PDF ไว้อ่านภายหลัง',
    cta: 'อ่านออนไลน์',
    pdf_label: 'หรือดาวน์โหลด PDF',
    help: 'มีคำถาม? ติดต่อหัวหน้าทีมของคุณ',
    sign_off: 'มาเริ่มการยืนยันอัตโนมัติกันเถอะ',
    sign_name: '— ทีม 1Move',
  },
}

interface InstructionsEmailOptions {
  name: string
  lang?: string
}

export function buildInstructionsEmail({ name, lang = 'en' }: InstructionsEmailOptions) {
  const tr = (translations as Record<string, InstructionsTranslation>)[lang] || translations.en
  const firstName = (name || '').split(' ')[0] || name || 'there'
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const content = `
    <h1 style="color:#c9a84c;font-size:22px;font-weight:700;margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;">
      ${tr.heading.replace('{name}', firstName)}
    </h1>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 16px;">
      ${tr.body_1}
    </p>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${tr.body_2}
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="border-radius:6px;background-color:#c9a84c;">
          <a href="${NOTION_URL}" target="_blank" style="display:inline-block;padding:14px 32px;color:#080808;font-size:15px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.05em;">
            ${tr.cta} &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 24px;">
      ${tr.pdf_label}: <a href="${PDF_URL}" target="_blank" style="color:#c9a84c;text-decoration:underline;">primeverse-auto-approval-setup.pdf</a>
    </p>

    <div style="border-top:1px solid rgba(201,168,76,0.2);padding-top:20px;margin-top:24px;">
      <p style="color:#E0E0E0;font-size:14px;line-height:1.6;margin:0 0 6px;">
        ${tr.sign_off}
      </p>
      <p style="color:#c9a84c;font-size:14px;font-weight:600;margin:0 0 16px;">
        ${tr.sign_name}
      </p>
      <p style="color:#888;font-size:12px;line-height:1.5;margin:0;font-style:italic;">
        ${tr.help}
      </p>
    </div>
  `

  return {
    subject: tr.subject,
    html: baseEmailTemplate({ content, previewText: tr.preview, dir }),
  }
}
