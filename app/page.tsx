'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@supabase/supabase-js'

const WorkflowCanvas = dynamic(() => import('@/components/WorkflowCanvas'), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

function parseProfileImage(value: string | null) {
  if (!value) return { url: '', x: 50, y: 50 }
  try {
    const p = JSON.parse(value)
    if (p && typeof p.url === 'string') return { url: p.url, x: p.x ?? 50, y: p.y ?? 50 }
  } catch {}
  return { url: value, x: 50, y: 50 }
}

function serializeProfileImage(url: string, x: number, y: number): string {
  return JSON.stringify({ url, x, y })
}

const SYSTM8_LOGO = 'https://rzlbpudnorjqgqsonweg.supabase.co/storage/v1/object/public/assets/b22efab2-ba87-4639-8648-2599cbfffb93.png'

/* ─────────────────────────────────────────────
   TRANSLATIONS
   ───────────────────────────────────────────── */
const translations: Record<string, Record<string, string>> = {
  en: {
    leadsTab: 'Leads',
    profileTab: 'My profile',
    registerLead: 'Register new lead manually',
    fullName: 'Full name',
    emailAddress: 'Email address',
    uidPlaceholder: 'UID from PuPrime broker',
    addLead: 'Add lead',
    sending: 'Sending...',
    pendingHeader: 'Awaiting verification',
    noPending: 'No leads waiting.',
    approvedHeader: 'Approved members',
    noApproved: 'No approved members yet.',
    approve: 'Approve',
    approvedDate: 'Approved',
    notProvided: 'Not provided',
    editProfile: 'Edit profile',
    profileImage: 'Profile image',
    uploadImage: 'Upload image',
    changeImage: 'Change image',
    uploading: 'Uploading...',
    imageHint: 'JPG or PNG · Max 5MB',
    yourUrl: 'Your URL',
    bio: 'Bio',
    bioPlaceholder: 'Tell who you are and what your members can expect from you...',
    saveProfile: 'Save profile',
    saving: 'Saving...',
    saved: 'Saved!',
    yourPage: 'Your page',
    viewPage: 'View my page',
    sharePage: 'Share My Page',
    shareTitle: '— Primeverse Access',
    shareText: 'Check out my page on Primeverse Access!',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    shareVia: 'Share via',
    selectLanguage: 'Select language',
    logout: 'Log out',
    loading: 'Loading...',
    aiHelper: 'AI helps you',
    aiTitle: 'AI Bio-assistant',
    startAi: 'Start AI assistant',
    aiGenerating: 'Generating your bio...',
    aiNext: 'Next',
    aiChooseTone: 'Choose a tone for your bio:',
    aiPreview: 'Your generated bio:',
    aiUseThis: 'Use this bio',
    aiRegenerate: 'Generate new',
    aiStartOver: 'Start over',
    aiOtherLangs: 'View in other languages',
    aiStepOf: 'of',
    fillAll: 'Fill in all fields',
    referralRequired: 'This field must be filled in',
    referralInvalid: 'Only PuPrime partner links are accepted (must start with https://puvip.co/la-partners/)',
    slugTaken: 'This URL is already in use. Please choose another.',
    socialMedia: 'Social media',
    metricsTab: 'Metrics',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    allTime: 'All time',
    pageViews: 'Page Views',
    uniqueVisitors: 'unique visitors',
    conversions: 'Conversions',
    rate: 'rate',
    conversionRate: 'Conversion Rate',
    regToApproved: 'reg → approved',
    profileStrength: 'Profile Strength',
    customUrl: 'Custom URL',
    referralLink: 'Referral link',
    approvalRate: 'Approval Rate',
    xOfYVerified: '{0} of {1} verified',
    pageViewsOverTime: 'Page Views Over Time',
    leadBreakdown: 'Lead breakdown',
    registeredLeads: 'Registered leads',
    pendingVerification: 'Pending verification',
    conversionRateLower: 'Conversion rate',
    pending: 'pending',
    approved: 'approved',
    ibResourcesTab: 'Marketing Resources',
    ibResourcesSubtitle: 'Tools and training to help you succeed',
    aiMarketingTools: 'AI Marketing Tools',
    resourcesSection: 'Resources',
    ibTraining: 'IB Training',
    ibTrainingDesc: 'Access training materials and guides to help you get started',
    contentLibrary: 'Content Library',
    contentLibraryDesc: 'Browse marketing content, templates and inspiration for your social media',
    comingSoon: 'Coming soon',
    vipSupport: 'VIP Support',
    vipSupportDesc: 'Direct access to VIP support for IB partners',
    pvPresentation: 'PV Presentation',
    pvPresentationDesc: 'View the official PrimeVerse presentation',
    postWriter: 'Post Writer',
    postWriterDesc: 'AI-powered social media post generator. Create engaging posts for Facebook, Instagram, TikTok and more.',
    captionGenerator: 'Caption Generator',
    captionGeneratorDesc: 'Generate scroll-stopping captions for your images and videos.',
    hashtagResearch: 'Hashtag Research',
    hashtagResearchDesc: 'Find the best hashtags for your niche to maximize reach and engagement.',
    contentCalendar: 'Content Calendar',
    contentCalendarDesc: 'Get a weekly posting schedule tailored to your audience and timezone.',
    aiPowered: 'AI Powered',
    selectPlatform: 'Select platform',
    topicLabel: 'Topic / product',
    topicPlaceholder: 'e.g. Trading education, Copy trading, Financial freedom...',
    toneLabel: 'Tone',
    toneProfessional: 'Professional',
    toneCasual: 'Casual',
    toneMotivational: 'Motivational',
    toneEducational: 'Educational',
    generatePost: 'Generate Post',
    generating: 'Generating...',
    regenerate: 'Regenerate',
    copyText: 'Copy',
    captionTopicPlaceholder: 'Describe your image or video...',
    captionStyle: 'Style',
    styleEngaging: 'Engaging',
    styleInspirational: 'Inspirational',
    styleEducational: 'Educational',
    styleHumorous: 'Humorous',
    generateCaption: 'Generate Caption',
    emojiSuggestions: 'Emoji suggestions',
    nicheLabel: 'Niche / topic',
    nichePlaceholder: 'e.g. Forex trading, Crypto, Financial education...',
    researchHashtags: 'Research Hashtags',
    researching: 'Researching...',
    topHashtags: 'Top (High competition)',
    mediumHashtags: 'Medium (Balanced)',
    nicheHashtags: 'Niche (Low competition)',
    copyAll: 'Copy All',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Other URL',
    telegramUrl: 'https://t.me/yourusername',
    whatsappPhone: '+1234567890',
    updateInfo: 'Update my information',
    updating: 'Updating...',
    updated: 'Updated!',
    generatePage: 'Generate my landing page',
    generatingPage: 'Generating your page...',
    pageIsLive: 'Your page is live!',
    dragToReposition: 'Drag to reposition',
    rememberToSave: 'Remember to save after repositioning',
    pageLiveAt: 'Your landing page is ready and live at:',
    viewLandingPage: 'View your landing page',
    yourPageAt: 'Your page:',
    aiDescription: 'Answer 5 questions, choose a tone, and AI will create a professional bio for you — in all languages.',
    somethingWentWrong: 'Something went wrong',
    noDataYet: 'No data yet',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Upload error: ',
    reportBug: 'Report a bug',
    bugModalTitle: 'Report a bug',
    bugModalInstructions: 'Help us improve SYSTM8! Please include a screenshot of the problem — reports without screenshots will not be processed.',
    bugWhatHappened: 'What happened?',
    bugWhatExpected: 'What did you expect to happen?',
    bugWhichPage: 'Which page were you on?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Other',
    bugScreenshot: 'Screenshot',
    bugScreenshotHint: 'PNG or JPG · Max 5MB',
    bugScreenshotRequired: 'Screenshot is required',
    bugSeverity: 'Severity',
    bugSeverityCritical: 'Critical',
    bugSeverityHigh: 'High',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Low',
    bugSend: 'Send report',
    bugCancel: 'Cancel',
    bugSending: 'Sending...',
    bugSuccess: 'Thank you! Your report has been sent.',
    bugFillRequired: 'Please fill in all required fields and attach a screenshot.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'You are one of 18 selected beta testers. Your feedback shapes the future of SYSTM8.',
    betaProgress: 'tests completed',
    betaPassed: 'Passed',
    betaFailed: 'Failed',
    betaRemaining: 'Remaining',
    betaAddNote: 'Add a note...',
    betaScreenshot: 'Screenshot',
    betaUntested: 'Untested',
    betaPass: 'Pass',
    betaFail: 'Fail',
    betaSubmitAll: 'Submit All Results',
    betaThankYou: 'tests completed. Thank you for your contribution to SYSTM8!',
    betaFoundingMember: 'Beta Tester — Founding Member',
    betaBugTitle: 'Bug title',
    betaBugDesc: 'What went wrong?',
    betaBugSeverity: 'Severity',
    betaBugSubmit: 'Submit Bug Report',
    betaBugCritical: 'Critical',
    betaBugMajor: 'Major',
    betaBugMinor: 'Minor',
    betaBugCosmetic: 'Cosmetic',
    betaSec1: 'Registration & Verification',
    betaSec2: 'Profile Setup',
    betaSec3: 'AI Bio Assistant',
    betaSec4: 'Landing Page',
    betaSec5: 'Language Switching',
    betaSec6: 'Sharing & Leads',
    betaSec7: 'Automated Emails',
    betaSec8: 'Dashboard Features',
    marketingTab: 'Marketing',
    broadcastsSubTab: 'Broadcasts',
    workflowsSubTab: 'Workflows',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'New Broadcast',
    noBroadcasts: 'No broadcasts yet. Create your first campaign to reach your leads.',
    campaignName: 'Campaign name',
    campaignNamePlaceholder: 'e.g. Welcome new members, Weekly update...',
    messageLabel: 'Message',
    messagePlaceholder: 'Write your broadcast message...',
    mergeTags: 'Merge tags',
    channelsLabel: 'Channels',
    emailChannel: 'Email',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(opens wa.me links)',
    telegramChannel: 'Telegram',
    telegramHint: '(requires bot setup)',
    audienceLabel: 'Audience',
    audienceAll: 'All my leads',
    audienceVerified: 'All verified members',
    audienceLast7: 'Leads from last 7 days',
    audienceLast30: 'Leads from last 30 days',
    previewLabel: 'Preview',
    scheduleLabel: 'Schedule',
    sendNow: 'Send now',
    scheduleLater: 'Schedule for later',
    recipientCount: 'This broadcast will be sent to {0} recipients',
    sendBroadcast: 'Send Broadcast',
    confirmSendTitle: 'Confirm broadcast',
    confirmSendMsg: 'You are about to send to {0} recipients via {1}. Confirm?',
    confirmBtn: 'Confirm & Send',
    cancelBtn: 'Cancel',
    broadcastSending: 'Sending...',
    broadcastSent: 'Sent',
    broadcastDraft: 'Draft',
    broadcastScheduled: 'Scheduled',
    statsSent: 'Sent',
    statsDelivered: 'Delivered',
    statsOpened: 'Opened',
    statsClicked: 'Clicked',
    viewRecipients: 'View recipients',
    backToBroadcasts: 'Back to broadcasts',
    whatsappLinks: 'WhatsApp links',
    whatsappLinksDesc: 'Click each link to send the message via WhatsApp:',
    telegramComingSoon: 'Telegram bot integration coming soon',
    broadcastSuccess: 'Broadcast sent successfully!',
    broadcastError: 'Failed to send broadcast',
    wfNoWorkflows: 'No workflows yet. Start with a template or build your own.',
    wfNewWorkflow: 'New Workflow',
    wfTemplateLibrary: 'Template Library',
    wfActive: 'Active',
    wfDraft: 'Draft',
    wfPaused: 'Paused',
    wfEnrolled: 'Enrolled',
    wfCompleted: 'Completed',
    wfCompletionRate: 'Completion',
    wfEditWorkflow: 'Edit Workflow',
    wfWorkflowName: 'Workflow name',
    wfWorkflowNamePh: 'e.g. Welcome Sequence, Onboarding...',
    wfDescription: 'Description',
    wfDescriptionPh: 'What does this workflow do?',
    wfTrigger: 'Trigger',
    wfTriggerLeadSignup: 'Lead Signup',
    wfTriggerLeadInactive: 'Lead Inactive',
    wfTriggerStageChange: 'Stage Change',
    wfTriggerManual: 'Manual',
    wfTriggerScheduled: 'Scheduled',
    wfInactiveDays: 'Days inactive',
    wfSelectStage: 'Select stage',
    wfSteps: 'Steps',
    wfAddStep: 'Add Step',
    wfStepEmail: 'Email',
    wfStepWait: 'Wait',
    wfStepCondition: 'Condition',
    wfStepSwitch: 'Switch Workflow',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Subject',
    wfBody: 'Body',
    wfPreview: 'Preview',
    wfWaitValue: 'Wait',
    wfHours: 'hours',
    wfDays: 'days',
    wfConditionIf: 'If lead',
    wfConditionOpened: 'opened',
    wfConditionClicked: 'clicked',
    wfConditionNotOpened: 'did not open',
    wfConditionEmail: 'email from step',
    wfConditionThen: 'Then go to step',
    wfConditionElse: 'Else go to step',
    wfSwitchTo: 'Switch to workflow',
    wfSaveDraft: 'Save as Draft',
    wfActivate: 'Activate',
    wfBackToWorkflows: 'Back to workflows',
    wfDeleteStep: 'Delete',
    wfSelectStepType: 'Select step type',
    wfUseTemplate: 'Use Template',
    wfCloseTemplates: 'Close',
    wfTemplateUsed: 'Template added! Customize it before activating.',
    wfSaved: 'Workflow saved!',
    wfActivated: 'Workflow activated!',
    wfDeactivated: 'Workflow paused.',
    wfSaveError: 'Failed to save workflow',
    wfEmailPreviewTitle: 'Email Preview',
    wfClose: 'Close',
  },
  no: {
    leadsTab: 'Leads',
    profileTab: 'Min profil',
    registerLead: 'Registrer nytt lead manuelt',
    fullName: 'Fullt navn',
    emailAddress: 'Epostadresse',
    uidPlaceholder: 'UID fra PuPrime broker',
    addLead: 'Legg til lead',
    sending: 'Sender...',
    pendingHeader: 'Venter på verifisering',
    noPending: 'Ingen leads venter.',
    approvedHeader: 'Godkjente members',
    noApproved: 'Ingen godkjente ennå.',
    approve: 'Godkjenn',
    approvedDate: 'Godkjent',
    notProvided: 'Ikke oppgitt',
    editProfile: 'Rediger profil',
    profileImage: 'Profilbilde',
    uploadImage: 'Last opp bilde',
    changeImage: 'Bytt bilde',
    uploading: 'Laster opp...',
    imageHint: 'JPG eller PNG · Maks 5MB',
    yourUrl: 'Din URL',
    bio: 'Bio',
    bioPlaceholder: 'Fortell hvem du er og hva dine members kan forvente av deg...',
    saveProfile: 'Lagre profil',
    saving: 'Lagrer...',
    saved: 'Lagret!',
    yourPage: 'Din side',
    viewPage: 'Se min side',
    sharePage: 'Del min side',
    shareTitle: '— Primeverse Access',
    shareText: 'Sjekk ut min side på Primeverse Access!',
    copyLink: 'Kopier lenke',
    copied: 'Kopiert!',
    shareVia: 'Del via',
    selectLanguage: 'Velg språk',
    logout: 'Logg ut',
    loading: 'Laster...',
    aiHelper: 'AI hjelper deg',
    aiTitle: 'AI Bio-assistent',
    startAi: 'Start AI-assistenten',
    aiGenerating: 'Genererer bioen din...',
    aiNext: 'Neste',
    aiChooseTone: 'Velg en tone for bioen din:',
    aiPreview: 'Din genererte bio:',
    aiUseThis: 'Bruk denne',
    aiRegenerate: 'Generer ny',
    aiStartOver: 'Start på nytt',
    aiOtherLangs: 'Se på andre språk',
    aiStepOf: 'av',
    fillAll: 'Fyll inn alle feltene',
    referralRequired: 'Dette feltet må fylles ut',
    referralInvalid: 'Kun PuPrime-partnerlenker godtas (må starte med https://puvip.co/la-partners/)',
    slugTaken: 'Denne URL-en er allerede i bruk. Velg en annen.',
    socialMedia: 'Sosiale medier',
    metricsTab: 'Metrikk',
    daily: 'Daglig',
    weekly: 'Ukentlig',
    monthly: 'Månedlig',
    allTime: 'All tid',
    pageViews: 'Sidevisninger',
    uniqueVisitors: 'unike besøkende',
    conversions: 'Konverteringer',
    rate: 'rate',
    conversionRate: 'Konverteringsrate',
    regToApproved: 'reg → godkjent',
    profileStrength: 'Profilstyrke',
    customUrl: 'Egendefinert URL',
    referralLink: 'Referanselenke',
    approvalRate: 'Godkjenningsrate',
    xOfYVerified: '{0} av {1} verifisert',
    pageViewsOverTime: 'Sidevisninger over tid',
    leadBreakdown: 'Lead-oversikt',
    registeredLeads: 'Registrerte leads',
    pendingVerification: 'Venter på verifisering',
    conversionRateLower: 'Konverteringsrate',
    pending: 'ventende',
    approved: 'godkjent',
    ibResourcesTab: 'Markedsføringsressurser',
    ibResourcesSubtitle: 'Verktøy og opplæring for å hjelpe deg å lykkes',
    aiMarketingTools: 'AI Markedsføringsverktøy',
    resourcesSection: 'Ressurser',
    ibTraining: 'IB-opplæring',
    ibTrainingDesc: 'Tilgang til opplæringsmateriell og guider for å komme i gang',
    contentLibrary: 'Innholdsbibliotek',
    contentLibraryDesc: 'Bla gjennom markedsføringsinnhold, maler og inspirasjon for sosiale medier',
    comingSoon: 'Kommer snart',
    vipSupport: 'VIP-støtte',
    vipSupportDesc: 'Direkte tilgang til VIP-støtte for IB-partnere',
    pvPresentation: 'PV-presentasjon',
    pvPresentationDesc: 'Se den offisielle PrimeVerse-presentasjonen',
    postWriter: 'Innleggsskriver',
    postWriterDesc: 'AI-drevet generator for innlegg på sosiale medier. Lag engasjerende innlegg for Facebook, Instagram, TikTok og mer.',
    captionGenerator: 'Bildetekstgenerator',
    captionGeneratorDesc: 'Generer fengende bildetekster for bilder og videoer.',
    hashtagResearch: 'Hashtag-forskning',
    hashtagResearchDesc: 'Finn de beste hashtaggene for din nisje for å maksimere rekkevidde og engasjement.',
    contentCalendar: 'Innholdskalender',
    contentCalendarDesc: 'Få en ukentlig publiseringsplan tilpasset ditt publikum og tidssone.',
    aiPowered: 'AI-drevet',
    selectPlatform: 'Velg plattform',
    topicLabel: 'Emne / produkt',
    topicPlaceholder: 'f.eks. Handelsopplæring, Copy trading, Finansiell frihet...',
    toneLabel: 'Tone',
    toneProfessional: 'Profesjonell',
    toneCasual: 'Uformell',
    toneMotivational: 'Motiverende',
    toneEducational: 'Lærerik',
    generatePost: 'Generer innlegg',
    generating: 'Genererer...',
    regenerate: 'Generer på nytt',
    copyText: 'Kopier',
    captionTopicPlaceholder: 'Beskriv bildet eller videoen din...',
    captionStyle: 'Stil',
    styleEngaging: 'Engasjerende',
    styleInspirational: 'Inspirerende',
    styleEducational: 'Lærerik',
    styleHumorous: 'Humoristisk',
    generateCaption: 'Generer bildetekst',
    emojiSuggestions: 'Emoji-forslag',
    nicheLabel: 'Nisje / emne',
    nichePlaceholder: 'f.eks. Forex-handel, Krypto, Finansiell utdanning...',
    researchHashtags: 'Søk etter hashtagger',
    researching: 'Søker...',
    topHashtags: 'Topp (Høy konkurranse)',
    mediumHashtags: 'Medium (Balansert)',
    nicheHashtags: 'Nisje (Lav konkurranse)',
    copyAll: 'Kopier alle',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Annen URL',
    updateInfo: 'Oppdater mine opplysninger',
    updating: 'Oppdaterer...',
    updated: 'Oppdatert!',
    generatePage: 'Generer landingssiden min',
    generatingPage: 'Genererer siden din...',
    pageIsLive: 'Siden din er live!',
    dragToReposition: 'Dra for å reposisjonere',
    rememberToSave: 'Husk å lagre etter reposisjonering',
    pageLiveAt: 'Landingssiden din er klar og live på:',
    viewLandingPage: 'Se landingssiden din',
    yourPageAt: 'Din side:',
    aiDescription: 'Svar på 5 spørsmål, velg en tone, og AI lager en profesjonell bio for deg — på alle språk.',
    somethingWentWrong: 'Noe gikk galt',
    noDataYet: 'Ingen data ennå',
    errorPrefix: 'Feil: ',
    uploadErrorPrefix: 'Feil ved opplasting: ',
    reportBug: 'Rapporter en feil',
    bugModalTitle: 'Rapporter en feil',
    bugModalInstructions: 'Hjelp oss å forbedre SYSTM8! Vennligst inkluder et skjermbilde av problemet — rapporter uten skjermbilder vil ikke bli behandlet.',
    bugWhatHappened: 'Hva skjedde?',
    bugWhatExpected: 'Hva forventet du skulle skje?',
    bugWhichPage: 'Hvilken side var du på?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landingsside',
    bugPageLogin: 'Innlogging',
    bugPageOther: 'Annet',
    bugScreenshot: 'Skjermbilde',
    bugScreenshotHint: 'PNG eller JPG · Maks 5MB',
    bugScreenshotRequired: 'Skjermbilde er påkrevd',
    bugSeverity: 'Alvorlighetsgrad',
    bugSeverityCritical: 'Kritisk',
    bugSeverityHigh: 'Høy',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Lav',
    bugSend: 'Send rapport',
    bugCancel: 'Avbryt',
    bugSending: 'Sender...',
    bugSuccess: 'Takk! Din rapport er sendt.',
    bugFillRequired: 'Vennligst fyll inn alle påkrevde felt og legg ved et skjermbilde.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'Du er en av 18 utvalgte betatestere. Tilbakemeldingen din former fremtiden til SYSTM8.',
    betaProgress: 'tester fullført',
    betaPassed: 'Bestått',
    betaFailed: 'Feilet',
    betaRemaining: 'Gjenstående',
    betaAddNote: 'Legg til en merknad...',
    betaScreenshot: 'Skjermbilde',
    betaUntested: 'Ikke testet',
    betaPass: 'Bestått',
    betaFail: 'Feil',
    betaSubmitAll: 'Send inn alle resultater',
    betaThankYou: 'tester fullført. Takk for ditt bidrag til SYSTM8!',
    betaFoundingMember: 'Betatester — Grunnleggende medlem',
    betaBugTitle: 'Feiltittel',
    betaBugDesc: 'Hva gikk galt?',
    betaBugSeverity: 'Alvorlighetsgrad',
    betaBugSubmit: 'Send feilrapport',
    betaBugCritical: 'Kritisk',
    betaBugMajor: 'Stor',
    betaBugMinor: 'Liten',
    betaBugCosmetic: 'Kosmetisk',
    betaSec1: 'Registrering og verifisering',
    betaSec2: 'Profiloppsett',
    betaSec3: 'AI Bio-assistent',
    betaSec4: 'Landingsside',
    betaSec5: 'Språkbytte',
    betaSec6: 'Deling og leads',
    betaSec7: 'Automatiserte e-poster',
    betaSec8: 'Dashboard-funksjoner',
    marketingTab: 'Markedsføring',
    broadcastsSubTab: 'Utsendelser',
    workflowsSubTab: 'Arbeidsflyter',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'Ny utsendelse',
    noBroadcasts: 'Ingen utsendelser ennå. Lag din første kampanje for å nå dine leads.',
    campaignName: 'Kampanjenavn',
    campaignNamePlaceholder: 'f.eks. Velkommen nye medlemmer, Ukentlig oppdatering...',
    messageLabel: 'Melding',
    messagePlaceholder: 'Skriv din utsendelsesmelding...',
    mergeTags: 'Flettekoder',
    channelsLabel: 'Kanaler',
    emailChannel: 'E-post',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(åpner wa.me-lenker)',
    telegramChannel: 'Telegram',
    telegramHint: '(krever bot-oppsett)',
    audienceLabel: 'Publikum',
    audienceAll: 'Alle mine leads',
    audienceVerified: 'Alle verifiserte medlemmer',
    audienceLast7: 'Leads fra siste 7 dager',
    audienceLast30: 'Leads fra siste 30 dager',
    previewLabel: 'Forhåndsvisning',
    scheduleLabel: 'Planlegging',
    sendNow: 'Send nå',
    scheduleLater: 'Planlegg for senere',
    recipientCount: 'Denne utsendelsen sendes til {0} mottakere',
    sendBroadcast: 'Send utsendelse',
    confirmSendTitle: 'Bekreft utsendelse',
    confirmSendMsg: 'Du er i ferd med å sende til {0} mottakere via {1}. Bekreft?',
    confirmBtn: 'Bekreft og send',
    cancelBtn: 'Avbryt',
    broadcastSending: 'Sender...',
    broadcastSent: 'Sendt',
    broadcastDraft: 'Utkast',
    broadcastScheduled: 'Planlagt',
    statsSent: 'Sendt',
    statsDelivered: 'Levert',
    statsOpened: 'Åpnet',
    statsClicked: 'Klikket',
    viewRecipients: 'Se mottakere',
    backToBroadcasts: 'Tilbake til utsendelser',
    whatsappLinks: 'WhatsApp-lenker',
    whatsappLinksDesc: 'Klikk på hver lenke for å sende meldingen via WhatsApp:',
    telegramComingSoon: 'Telegram-botintegrasjon kommer snart',
    broadcastSuccess: 'Utsendelse sendt!',
    broadcastError: 'Kunne ikke sende utsendelse',
    wfNoWorkflows: 'Ingen arbeidsflyter ennå. Start med en mal eller bygg din egen.',
    wfNewWorkflow: 'Ny arbeidsflyt',
    wfTemplateLibrary: 'Malbibliotek',
    wfActive: 'Aktiv',
    wfDraft: 'Utkast',
    wfPaused: 'Pauset',
    wfEnrolled: 'Registrert',
    wfCompleted: 'Fullført',
    wfCompletionRate: 'Fullføring',
    wfEditWorkflow: 'Rediger arbeidsflyt',
    wfWorkflowName: 'Arbeidsflytnavn',
    wfWorkflowNamePh: 'f.eks. Velkomstsekvens, Onboarding...',
    wfDescription: 'Beskrivelse',
    wfDescriptionPh: 'Hva gjør denne arbeidsflyten?',
    wfTrigger: 'Trigger',
    wfTriggerLeadSignup: 'Lead registrering',
    wfTriggerLeadInactive: 'Lead inaktiv',
    wfTriggerStageChange: 'Statusendring',
    wfTriggerManual: 'Manuell',
    wfTriggerScheduled: 'Planlagt',
    wfInactiveDays: 'Dager inaktiv',
    wfSelectStage: 'Velg status',
    wfSteps: 'Steg',
    wfAddStep: 'Legg til steg',
    wfStepEmail: 'E-post',
    wfStepWait: 'Vent',
    wfStepCondition: 'Betingelse',
    wfStepSwitch: 'Bytt arbeidsflyt',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Emne',
    wfBody: 'Innhold',
    wfPreview: 'Forhåndsvisning',
    wfWaitValue: 'Vent',
    wfHours: 'timer',
    wfDays: 'dager',
    wfConditionIf: 'Hvis lead',
    wfConditionOpened: 'åpnet',
    wfConditionClicked: 'klikket',
    wfConditionNotOpened: 'ikke åpnet',
    wfConditionEmail: 'e-post fra steg',
    wfConditionThen: 'Gå til steg',
    wfConditionElse: 'Ellers gå til steg',
    wfSwitchTo: 'Bytt til arbeidsflyt',
    wfSaveDraft: 'Lagre som utkast',
    wfActivate: 'Aktiver',
    wfBackToWorkflows: 'Tilbake til arbeidsflyter',
    wfDeleteStep: 'Slett',
    wfSelectStepType: 'Velg stegtype',
    wfUseTemplate: 'Bruk mal',
    wfCloseTemplates: 'Lukk',
    wfTemplateUsed: 'Mal lagt til! Tilpass den før du aktiverer.',
    wfSaved: 'Arbeidsflyt lagret!',
    wfActivated: 'Arbeidsflyt aktivert!',
    wfDeactivated: 'Arbeidsflyt pauset.',
    wfSaveError: 'Kunne ikke lagre arbeidsflyt',
    wfEmailPreviewTitle: 'E-postforhåndsvisning',
    wfClose: 'Lukk',
  },
  sv: {
    leadsTab: 'Leads',
    profileTab: 'Min profil',
    registerLead: 'Registrera nytt lead manuellt',
    fullName: 'Fullständigt namn',
    emailAddress: 'E-postadress',
    uidPlaceholder: 'UID från PuPrime broker',
    addLead: 'Lägg till lead',
    sending: 'Skickar...',
    pendingHeader: 'Väntar på verifiering',
    noPending: 'Inga leads väntar.',
    approvedHeader: 'Godkända members',
    noApproved: 'Inga godkända ännu.',
    approve: 'Godkänn',
    approvedDate: 'Godkänd',
    notProvided: 'Ej angiven',
    editProfile: 'Redigera profil',
    profileImage: 'Profilbild',
    uploadImage: 'Ladda upp bild',
    changeImage: 'Byt bild',
    uploading: 'Laddar upp...',
    imageHint: 'JPG eller PNG · Max 5MB',
    yourUrl: 'Din URL',
    bio: 'Bio',
    bioPlaceholder: 'Berätta vem du är och vad dina members kan förvänta sig...',
    saveProfile: 'Spara profil',
    saving: 'Sparar...',
    saved: 'Sparat!',
    yourPage: 'Din sida',
    viewPage: 'Se min sida',
    sharePage: 'Dela min sida',
    shareTitle: '— Primeverse Access',
    shareText: 'Kolla in min sida på Primeverse Access!',
    copyLink: 'Kopiera länk',
    copied: 'Kopierad!',
    shareVia: 'Dela via',
    selectLanguage: 'Välj språk',
    logout: 'Logga ut',
    loading: 'Laddar...',
    aiHelper: 'AI hjälper dig',
    aiTitle: 'AI Bio-assistent',
    startAi: 'Starta AI-assistenten',
    aiGenerating: 'Genererar din bio...',
    aiNext: 'Nästa',
    aiChooseTone: 'Välj en ton för din bio:',
    aiPreview: 'Din genererade bio:',
    aiUseThis: 'Använd denna',
    aiRegenerate: 'Generera ny',
    aiStartOver: 'Börja om',
    aiOtherLangs: 'Visa på andra språk',
    aiStepOf: 'av',
    fillAll: 'Fyll i alla fält',
    referralRequired: 'Detta fält måste fyllas i',
    referralInvalid: 'Endast PuPrime-partnerlänkar accepteras (måste börja med https://puvip.co/la-partners/)',
    slugTaken: 'Denna URL används redan. Välj en annan.',
    socialMedia: 'Sociala medier',
    metricsTab: 'Statistik',
    daily: 'Dagligen',
    weekly: 'Veckovis',
    monthly: 'Månadsvis',
    allTime: 'All tid',
    pageViews: 'Sidvisningar',
    uniqueVisitors: 'unika besökare',
    conversions: 'Konverteringar',
    rate: 'andel',
    conversionRate: 'Konverteringsgrad',
    regToApproved: 'reg → godkänd',
    profileStrength: 'Profilstyrka',
    customUrl: 'Anpassad URL',
    referralLink: 'Referenslänk',
    approvalRate: 'Godkännandegrad',
    xOfYVerified: '{0} av {1} verifierade',
    pageViewsOverTime: 'Sidvisningar över tid',
    leadBreakdown: 'Lead-översikt',
    registeredLeads: 'Registrerade leads',
    pendingVerification: 'Väntar på verifiering',
    conversionRateLower: 'Konverteringsgrad',
    pending: 'väntande',
    approved: 'godkända',
    ibResourcesTab: 'Marknadsföringsresurser',
    ibResourcesSubtitle: 'Verktyg och utbildning för att hjälpa dig lyckas',
    aiMarketingTools: 'AI Marknadsföringsverktyg',
    resourcesSection: 'Resurser',
    ibTraining: 'IB-utbildning',
    ibTrainingDesc: 'Tillgång till utbildningsmaterial och guider för att komma igång',
    contentLibrary: 'Innehållsbibliotek',
    contentLibraryDesc: 'Bläddra bland marknadsföringsinnehåll, mallar och inspiration för sociala medier',
    comingSoon: 'Kommer snart',
    vipSupport: 'VIP-support',
    vipSupportDesc: 'Direkt tillgång till VIP-support för IB-partners',
    pvPresentation: 'PV-presentation',
    pvPresentationDesc: 'Se den officiella PrimeVerse-presentationen',
    postWriter: 'Inläggsförfattare',
    postWriterDesc: 'AI-driven generator för sociala medieinlägg. Skapa engagerande inlägg för Facebook, Instagram, TikTok och mer.',
    captionGenerator: 'Bildtextgenerator',
    captionGeneratorDesc: 'Generera fängslande bildtexter för dina bilder och videor.',
    hashtagResearch: 'Hashtagforskning',
    hashtagResearchDesc: 'Hitta de bästa hashtaggarna för din nisch för att maximera räckvidd och engagemang.',
    contentCalendar: 'Innehållskalender',
    contentCalendarDesc: 'Få ett veckoschema för publicering anpassat efter din publik och tidszon.',
    aiPowered: 'AI-driven',
    selectPlatform: 'Välj plattform',
    topicLabel: 'Ämne / produkt',
    topicPlaceholder: 't.ex. Handelsutbildning, Copy trading, Ekonomisk frihet...',
    toneLabel: 'Ton',
    toneProfessional: 'Professionell',
    toneCasual: 'Avslappnad',
    toneMotivational: 'Motiverande',
    toneEducational: 'Utbildande',
    generatePost: 'Generera inlägg',
    generating: 'Genererar...',
    regenerate: 'Generera nytt',
    copyText: 'Kopiera',
    captionTopicPlaceholder: 'Beskriv din bild eller video...',
    captionStyle: 'Stil',
    styleEngaging: 'Engagerande',
    styleInspirational: 'Inspirerande',
    styleEducational: 'Utbildande',
    styleHumorous: 'Humoristisk',
    generateCaption: 'Generera bildtext',
    emojiSuggestions: 'Emoji-förslag',
    nicheLabel: 'Nisch / ämne',
    nichePlaceholder: 't.ex. Forex-handel, Krypto, Finansiell utbildning...',
    researchHashtags: 'Sök hashtagar',
    researching: 'Söker...',
    topHashtags: 'Topp (Hög konkurrens)',
    mediumHashtags: 'Medium (Balanserad)',
    nicheHashtags: 'Nisch (Låg konkurrens)',
    copyAll: 'Kopiera alla',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Annan URL',
    updateInfo: 'Uppdatera mina uppgifter',
    updating: 'Uppdaterar...',
    updated: 'Uppdaterat!',
    generatePage: 'Generera min landningssida',
    generatingPage: 'Genererar din sida...',
    pageIsLive: 'Din sida är live!',
    dragToReposition: 'Dra för att flytta',
    rememberToSave: 'Kom ihåg att spara efter ompositionering',
    pageLiveAt: 'Din landningssida är klar och live på:',
    viewLandingPage: 'Se din landningssida',
    yourPageAt: 'Din sida:',
    aiDescription: 'Svara på 5 frågor, välj en ton, så skapar AI en professionell bio åt dig — på alla språk.',
    somethingWentWrong: 'Något gick fel',
    noDataYet: 'Ingen data ännu',
    errorPrefix: 'Fel: ',
    uploadErrorPrefix: 'Uppladdningsfel: ',
    reportBug: 'Rapportera en bugg',
    bugModalTitle: 'Rapportera en bugg',
    bugModalInstructions: 'Hjälp oss förbättra SYSTM8! Inkludera en skärmbild av problemet — rapporter utan skärmbilder kommer inte att behandlas.',
    bugWhatHappened: 'Vad hände?',
    bugWhatExpected: 'Vad förväntade du dig skulle hända?',
    bugWhichPage: 'Vilken sida var du på?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landningssida',
    bugPageLogin: 'Inloggning',
    bugPageOther: 'Annat',
    bugScreenshot: 'Skärmbild',
    bugScreenshotHint: 'PNG eller JPG · Max 5MB',
    bugScreenshotRequired: 'Skärmbild krävs',
    bugSeverity: 'Allvarlighetsgrad',
    bugSeverityCritical: 'Kritisk',
    bugSeverityHigh: 'Hög',
    bugSeverityMedium: 'Medium',
    bugSeverityLow: 'Låg',
    bugSend: 'Skicka rapport',
    bugCancel: 'Avbryt',
    bugSending: 'Skickar...',
    bugSuccess: 'Tack! Din rapport har skickats.',
    bugFillRequired: 'Fyll i alla obligatoriska fält och bifoga en skärmbild.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'Du är en av 18 utvalda betatestare. Din feedback formar framtiden för SYSTM8.',
    betaProgress: 'tester slutförda',
    betaPassed: 'Godkänd',
    betaFailed: 'Underkänd',
    betaRemaining: 'Återstående',
    betaAddNote: 'Lägg till en anteckning...',
    betaScreenshot: 'Skärmbild',
    betaUntested: 'Ej testad',
    betaPass: 'Godkänd',
    betaFail: 'Underkänd',
    betaSubmitAll: 'Skicka alla resultat',
    betaThankYou: 'tester slutförda. Tack för ditt bidrag till SYSTM8!',
    betaFoundingMember: 'Betatestare — Grundande medlem',
    betaBugTitle: 'Buggtitel',
    betaBugDesc: 'Vad gick fel?',
    betaBugSeverity: 'Allvarlighetsgrad',
    betaBugSubmit: 'Skicka buggrapport',
    betaBugCritical: 'Kritisk',
    betaBugMajor: 'Stor',
    betaBugMinor: 'Liten',
    betaBugCosmetic: 'Kosmetisk',
    betaSec1: 'Registrering & verifiering',
    betaSec2: 'Profilinställning',
    betaSec3: 'AI Bio-assistent',
    betaSec4: 'Landningssida',
    betaSec5: 'Språkbyte',
    betaSec6: 'Delning & leads',
    betaSec7: 'Automatiserade e-postmeddelanden',
    betaSec8: 'Dashboardfunktioner',
    marketingTab: 'Marknadsföring',
    broadcastsSubTab: 'Utskick',
    workflowsSubTab: 'Arbetsflöden',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'Nytt utskick',
    noBroadcasts: 'Inga utskick ännu. Skapa din första kampanj för att nå dina leads.',
    campaignName: 'Kampanjnamn',
    campaignNamePlaceholder: 't.ex. Välkomna nya medlemmar, Veckovis uppdatering...',
    messageLabel: 'Meddelande',
    messagePlaceholder: 'Skriv ditt utskicksmeddelande...',
    mergeTags: 'Kopplingskoder',
    channelsLabel: 'Kanaler',
    emailChannel: 'E-post',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(öppnar wa.me-länkar)',
    telegramChannel: 'Telegram',
    telegramHint: '(kräver bot-inställning)',
    audienceLabel: 'Målgrupp',
    audienceAll: 'Alla mina leads',
    audienceVerified: 'Alla verifierade medlemmar',
    audienceLast7: 'Leads från senaste 7 dagarna',
    audienceLast30: 'Leads från senaste 30 dagarna',
    previewLabel: 'Förhandsvisning',
    scheduleLabel: 'Schemaläggning',
    sendNow: 'Skicka nu',
    scheduleLater: 'Schemalägg för senare',
    recipientCount: 'Detta utskick skickas till {0} mottagare',
    sendBroadcast: 'Skicka utskick',
    confirmSendTitle: 'Bekräfta utskick',
    confirmSendMsg: 'Du är på väg att skicka till {0} mottagare via {1}. Bekräfta?',
    confirmBtn: 'Bekräfta och skicka',
    cancelBtn: 'Avbryt',
    broadcastSending: 'Skickar...',
    broadcastSent: 'Skickat',
    broadcastDraft: 'Utkast',
    broadcastScheduled: 'Schemalagt',
    statsSent: 'Skickat',
    statsDelivered: 'Levererat',
    statsOpened: 'Öppnat',
    statsClicked: 'Klickat',
    viewRecipients: 'Visa mottagare',
    backToBroadcasts: 'Tillbaka till utskick',
    whatsappLinks: 'WhatsApp-länkar',
    whatsappLinksDesc: 'Klicka på varje länk för att skicka meddelandet via WhatsApp:',
    telegramComingSoon: 'Telegram-botintegration kommer snart',
    broadcastSuccess: 'Utskick skickat!',
    broadcastError: 'Kunde inte skicka utskick',
    wfNoWorkflows: 'Inga arbetsflöden ännu. Börja med en mall eller bygg ditt eget.',
    wfNewWorkflow: 'Nytt arbetsflöde',
    wfTemplateLibrary: 'Mallbibliotek',
    wfActive: 'Aktiv',
    wfDraft: 'Utkast',
    wfPaused: 'Pausad',
    wfEnrolled: 'Registrerad',
    wfCompleted: 'Slutförd',
    wfCompletionRate: 'Slutförande',
    wfEditWorkflow: 'Redigera arbetsflöde',
    wfWorkflowName: 'Arbetsflödesnamn',
    wfWorkflowNamePh: 't.ex. Välkomstsekvens, Onboarding...',
    wfDescription: 'Beskrivning',
    wfDescriptionPh: 'Vad gör detta arbetsflöde?',
    wfTrigger: 'Trigger',
    wfTriggerLeadSignup: 'Lead registrering',
    wfTriggerLeadInactive: 'Lead inaktiv',
    wfTriggerStageChange: 'Statusändring',
    wfTriggerManual: 'Manuell',
    wfTriggerScheduled: 'Schemalagd',
    wfInactiveDays: 'Dagar inaktiv',
    wfSelectStage: 'Välj status',
    wfSteps: 'Steg',
    wfAddStep: 'Lägg till steg',
    wfStepEmail: 'E-post',
    wfStepWait: 'Vänta',
    wfStepCondition: 'Villkor',
    wfStepSwitch: 'Byt arbetsflöde',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Ämne',
    wfBody: 'Innehåll',
    wfPreview: 'Förhandsgranskning',
    wfWaitValue: 'Vänta',
    wfHours: 'timmar',
    wfDays: 'dagar',
    wfConditionIf: 'Om lead',
    wfConditionOpened: 'öppnade',
    wfConditionClicked: 'klickade',
    wfConditionNotOpened: 'inte öppnade',
    wfConditionEmail: 'e-post från steg',
    wfConditionThen: 'Gå till steg',
    wfConditionElse: 'Annars gå till steg',
    wfSwitchTo: 'Byt till arbetsflöde',
    wfSaveDraft: 'Spara som utkast',
    wfActivate: 'Aktivera',
    wfBackToWorkflows: 'Tillbaka till arbetsflöden',
    wfDeleteStep: 'Ta bort',
    wfSelectStepType: 'Välj stegtyp',
    wfUseTemplate: 'Använd mall',
    wfCloseTemplates: 'Stäng',
    wfTemplateUsed: 'Mall tillagd! Anpassa den innan du aktiverar.',
    wfSaved: 'Arbetsflöde sparat!',
    wfActivated: 'Arbetsflöde aktiverat!',
    wfDeactivated: 'Arbetsflöde pausat.',
    wfSaveError: 'Kunde inte spara arbetsflöde',
    wfEmailPreviewTitle: 'E-postförhandsgranskning',
    wfClose: 'Stäng',
  },
  es: {
    leadsTab: 'Leads',
    profileTab: 'Mi perfil',
    registerLead: 'Registrar nuevo lead manualmente',
    fullName: 'Nombre completo',
    emailAddress: 'Correo electrónico',
    uidPlaceholder: 'UID de PuPrime broker',
    addLead: 'Agregar lead',
    sending: 'Enviando...',
    pendingHeader: 'Esperando verificación',
    noPending: 'No hay leads esperando.',
    approvedHeader: 'Miembros aprobados',
    noApproved: 'Ningún aprobado aún.',
    approve: 'Aprobar',
    approvedDate: 'Aprobado',
    notProvided: 'No proporcionado',
    editProfile: 'Editar perfil',
    profileImage: 'Foto de perfil',
    uploadImage: 'Subir imagen',
    changeImage: 'Cambiar imagen',
    uploading: 'Subiendo...',
    imageHint: 'JPG o PNG · Máx 5MB',
    yourUrl: 'Tu URL',
    bio: 'Bio',
    bioPlaceholder: 'Cuenta quién eres y qué pueden esperar tus miembros...',
    saveProfile: 'Guardar perfil',
    saving: 'Guardando...',
    saved: '¡Guardado!',
    yourPage: 'Tu página',
    viewPage: 'Ver mi página',
    sharePage: 'Compartir mi página',
    shareTitle: '— Primeverse Access',
    shareText: '¡Mira mi página en Primeverse Access!',
    copyLink: 'Copiar enlace',
    copied: '¡Copiado!',
    shareVia: 'Compartir vía',
    selectLanguage: 'Seleccionar idioma',
    logout: 'Cerrar sesión',
    loading: 'Cargando...',
    aiHelper: 'AI te ayuda',
    aiTitle: 'AI Bio-asistente',
    startAi: 'Iniciar asistente AI',
    aiGenerating: 'Generando tu bio...',
    aiNext: 'Siguiente',
    aiChooseTone: 'Elige un tono para tu bio:',
    aiPreview: 'Tu bio generada:',
    aiUseThis: 'Usar esta',
    aiRegenerate: 'Generar nueva',
    aiStartOver: 'Empezar de nuevo',
    aiOtherLangs: 'Ver en otros idiomas',
    aiStepOf: 'de',
    fillAll: 'Completa todos los campos',
    referralRequired: 'Este campo debe completarse',
    referralInvalid: 'Solo se aceptan enlaces de socios PuPrime (debe comenzar con https://puvip.co/la-partners/)',
    slugTaken: 'Esta URL ya está en uso. Elige otra.',
    socialMedia: 'Redes sociales',
    metricsTab: 'Métricas',
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    allTime: 'Todo el tiempo',
    pageViews: 'Visitas',
    uniqueVisitors: 'visitantes únicos',
    conversions: 'Conversiones',
    rate: 'tasa',
    conversionRate: 'Tasa de conversión',
    regToApproved: 'reg → aprobado',
    profileStrength: 'Fortaleza del perfil',
    customUrl: 'URL personalizada',
    referralLink: 'Enlace de referencia',
    approvalRate: 'Tasa de aprobación',
    xOfYVerified: '{0} de {1} verificados',
    pageViewsOverTime: 'Visitas a lo largo del tiempo',
    leadBreakdown: 'Desglose de leads',
    registeredLeads: 'Leads registrados',
    pendingVerification: 'Pendiente de verificación',
    conversionRateLower: 'Tasa de conversión',
    pending: 'pendientes',
    approved: 'aprobados',
    ibResourcesTab: 'Recursos de Marketing',
    ibResourcesSubtitle: 'Herramientas y formación para ayudarte a tener éxito',
    aiMarketingTools: 'Herramientas de Marketing IA',
    resourcesSection: 'Recursos',
    ibTraining: 'Formación IB',
    ibTrainingDesc: 'Accede a materiales de formación y guías para comenzar',
    contentLibrary: 'Biblioteca de contenido',
    contentLibraryDesc: 'Explora contenido de marketing, plantillas e inspiración para tus redes sociales',
    comingSoon: 'Próximamente',
    vipSupport: 'Soporte VIP',
    vipSupportDesc: 'Acceso directo a soporte VIP para socios IB',
    pvPresentation: 'Presentación PV',
    pvPresentationDesc: 'Ver la presentación oficial de PrimeVerse',
    postWriter: 'Escritor de Posts',
    postWriterDesc: 'Generador de publicaciones con IA. Crea posts atractivos para Facebook, Instagram, TikTok y más.',
    captionGenerator: 'Generador de Subtítulos',
    captionGeneratorDesc: 'Genera subtítulos irresistibles para tus imágenes y videos.',
    hashtagResearch: 'Investigación de Hashtags',
    hashtagResearchDesc: 'Encuentra los mejores hashtags para tu nicho y maximiza el alcance y la interacción.',
    contentCalendar: 'Calendario de Contenido',
    contentCalendarDesc: 'Obtén un calendario semanal de publicaciones adaptado a tu audiencia y zona horaria.',
    aiPowered: 'Con IA',
    selectPlatform: 'Seleccionar plataforma',
    topicLabel: 'Tema / producto',
    topicPlaceholder: 'ej. Educación en trading, Copy trading, Libertad financiera...',
    toneLabel: 'Tono',
    toneProfessional: 'Profesional',
    toneCasual: 'Casual',
    toneMotivational: 'Motivacional',
    toneEducational: 'Educativo',
    generatePost: 'Generar publicación',
    generating: 'Generando...',
    regenerate: 'Regenerar',
    copyText: 'Copiar',
    captionTopicPlaceholder: 'Describe tu imagen o video...',
    captionStyle: 'Estilo',
    styleEngaging: 'Atractivo',
    styleInspirational: 'Inspirador',
    styleEducational: 'Educativo',
    styleHumorous: 'Humorístico',
    generateCaption: 'Generar subtítulo',
    emojiSuggestions: 'Sugerencias de emojis',
    nicheLabel: 'Nicho / tema',
    nichePlaceholder: 'ej. Trading Forex, Cripto, Educación financiera...',
    researchHashtags: 'Investigar hashtags',
    researching: 'Investigando...',
    topHashtags: 'Top (Alta competencia)',
    mediumHashtags: 'Medio (Equilibrado)',
    nicheHashtags: 'Nicho (Baja competencia)',
    copyAll: 'Copiar todo',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Otra URL',
    updateInfo: 'Actualizar mis datos',
    updating: 'Actualizando...',
    updated: '¡Actualizado!',
    generatePage: 'Generar mi página',
    generatingPage: 'Generando tu página...',
    pageIsLive: '¡Tu página está en línea!',
    dragToReposition: 'Arrastra para reposicionar',
    rememberToSave: 'Recuerda guardar después de reposicionar',
    pageLiveAt: 'Tu página de aterrizaje está lista y activa en:',
    viewLandingPage: 'Ver tu página de aterrizaje',
    yourPageAt: 'Tu página:',
    aiDescription: 'Responde 5 preguntas, elige un tono, y la IA creará una bio profesional para ti — en todos los idiomas.',
    somethingWentWrong: 'Algo salió mal',
    noDataYet: 'Aún no hay datos',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Error de carga: ',
    reportBug: 'Reportar un error',
    bugModalTitle: 'Reportar un error',
    bugModalInstructions: '¡Ayúdanos a mejorar SYSTM8! Por favor incluye una captura de pantalla del problema — los reportes sin capturas no serán procesados.',
    bugWhatHappened: '¿Qué pasó?',
    bugWhatExpected: '¿Qué esperabas que pasara?',
    bugWhichPage: '¿En qué página estabas?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Página de aterrizaje',
    bugPageLogin: 'Inicio de sesión',
    bugPageOther: 'Otro',
    bugScreenshot: 'Captura de pantalla',
    bugScreenshotHint: 'PNG o JPG · Máx 5MB',
    bugScreenshotRequired: 'La captura de pantalla es obligatoria',
    bugSeverity: 'Gravedad',
    bugSeverityCritical: 'Crítica',
    bugSeverityHigh: 'Alta',
    bugSeverityMedium: 'Media',
    bugSeverityLow: 'Baja',
    bugSend: 'Enviar reporte',
    bugCancel: 'Cancelar',
    bugSending: 'Enviando...',
    bugSuccess: '¡Gracias! Tu reporte ha sido enviado.',
    bugFillRequired: 'Por favor completa todos los campos obligatorios y adjunta una captura de pantalla.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'Eres uno de los 18 beta testers seleccionados. Tu feedback da forma al futuro de SYSTM8.',
    betaProgress: 'pruebas completadas',
    betaPassed: 'Aprobado',
    betaFailed: 'Fallido',
    betaRemaining: 'Restante',
    betaAddNote: 'Agregar una nota...',
    betaScreenshot: 'Captura de pantalla',
    betaUntested: 'Sin probar',
    betaPass: 'Aprobado',
    betaFail: 'Fallido',
    betaSubmitAll: 'Enviar todos los resultados',
    betaThankYou: 'pruebas completadas. ¡Gracias por tu contribución a SYSTM8!',
    betaFoundingMember: 'Beta Tester — Miembro fundador',
    betaBugTitle: 'Título del bug',
    betaBugDesc: '¿Qué salió mal?',
    betaBugSeverity: 'Severidad',
    betaBugSubmit: 'Enviar reporte de bug',
    betaBugCritical: 'Crítico',
    betaBugMajor: 'Mayor',
    betaBugMinor: 'Menor',
    betaBugCosmetic: 'Cosmético',
    betaSec1: 'Registro y verificación',
    betaSec2: 'Configuración de perfil',
    betaSec3: 'Asistente de bio AI',
    betaSec4: 'Página de destino',
    betaSec5: 'Cambio de idioma',
    betaSec6: 'Compartir y leads',
    betaSec7: 'Correos automatizados',
    betaSec8: 'Funciones del panel',
    marketingTab: 'Marketing',
    broadcastsSubTab: 'Difusiones',
    workflowsSubTab: 'Flujos de trabajo',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'Nueva difusión',
    noBroadcasts: 'Aún no hay difusiones. Crea tu primera campaña para llegar a tus leads.',
    campaignName: 'Nombre de campaña',
    campaignNamePlaceholder: 'ej. Bienvenida nuevos miembros, Actualización semanal...',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Escribe tu mensaje de difusión...',
    mergeTags: 'Etiquetas de combinación',
    channelsLabel: 'Canales',
    emailChannel: 'Correo',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(abre enlaces wa.me)',
    telegramChannel: 'Telegram',
    telegramHint: '(requiere configurar bot)',
    audienceLabel: 'Audiencia',
    audienceAll: 'Todos mis leads',
    audienceVerified: 'Todos los miembros verificados',
    audienceLast7: 'Leads de los últimos 7 días',
    audienceLast30: 'Leads de los últimos 30 días',
    previewLabel: 'Vista previa',
    scheduleLabel: 'Programación',
    sendNow: 'Enviar ahora',
    scheduleLater: 'Programar para después',
    recipientCount: 'Esta difusión se enviará a {0} destinatarios',
    sendBroadcast: 'Enviar difusión',
    confirmSendTitle: 'Confirmar difusión',
    confirmSendMsg: 'Estás a punto de enviar a {0} destinatarios vía {1}. ¿Confirmar?',
    confirmBtn: 'Confirmar y enviar',
    cancelBtn: 'Cancelar',
    broadcastSending: 'Enviando...',
    broadcastSent: 'Enviado',
    broadcastDraft: 'Borrador',
    broadcastScheduled: 'Programado',
    statsSent: 'Enviados',
    statsDelivered: 'Entregados',
    statsOpened: 'Abiertos',
    statsClicked: 'Clicados',
    viewRecipients: 'Ver destinatarios',
    backToBroadcasts: 'Volver a difusiones',
    whatsappLinks: 'Enlaces de WhatsApp',
    whatsappLinksDesc: 'Haz clic en cada enlace para enviar el mensaje vía WhatsApp:',
    telegramComingSoon: 'Integración de bot de Telegram próximamente',
    broadcastSuccess: '¡Difusión enviada con éxito!',
    broadcastError: 'Error al enviar la difusión',
    wfNoWorkflows: 'No hay flujos de trabajo aún. Comienza con una plantilla o crea el tuyo.',
    wfNewWorkflow: 'Nuevo flujo',
    wfTemplateLibrary: 'Biblioteca de plantillas',
    wfActive: 'Activo',
    wfDraft: 'Borrador',
    wfPaused: 'Pausado',
    wfEnrolled: 'Inscritos',
    wfCompleted: 'Completados',
    wfCompletionRate: 'Completado',
    wfEditWorkflow: 'Editar flujo',
    wfWorkflowName: 'Nombre del flujo',
    wfWorkflowNamePh: 'p.ej. Secuencia de bienvenida, Onboarding...',
    wfDescription: 'Descripción',
    wfDescriptionPh: '¿Qué hace este flujo de trabajo?',
    wfTrigger: 'Disparador',
    wfTriggerLeadSignup: 'Registro de lead',
    wfTriggerLeadInactive: 'Lead inactivo',
    wfTriggerStageChange: 'Cambio de etapa',
    wfTriggerManual: 'Manual',
    wfTriggerScheduled: 'Programado',
    wfInactiveDays: 'Días inactivo',
    wfSelectStage: 'Seleccionar etapa',
    wfSteps: 'Pasos',
    wfAddStep: 'Agregar paso',
    wfStepEmail: 'Email',
    wfStepWait: 'Esperar',
    wfStepCondition: 'Condición',
    wfStepSwitch: 'Cambiar flujo',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Asunto',
    wfBody: 'Cuerpo',
    wfPreview: 'Vista previa',
    wfWaitValue: 'Esperar',
    wfHours: 'horas',
    wfDays: 'días',
    wfConditionIf: 'Si el lead',
    wfConditionOpened: 'abrió',
    wfConditionClicked: 'hizo clic',
    wfConditionNotOpened: 'no abrió',
    wfConditionEmail: 'email del paso',
    wfConditionThen: 'Ir al paso',
    wfConditionElse: 'Si no, ir al paso',
    wfSwitchTo: 'Cambiar al flujo',
    wfSaveDraft: 'Guardar borrador',
    wfActivate: 'Activar',
    wfBackToWorkflows: 'Volver a flujos',
    wfDeleteStep: 'Eliminar',
    wfSelectStepType: 'Seleccionar tipo de paso',
    wfUseTemplate: 'Usar plantilla',
    wfCloseTemplates: 'Cerrar',
    wfTemplateUsed: '¡Plantilla añadida! Personalízala antes de activar.',
    wfSaved: '¡Flujo guardado!',
    wfActivated: '¡Flujo activado!',
    wfDeactivated: 'Flujo pausado.',
    wfSaveError: 'Error al guardar flujo',
    wfEmailPreviewTitle: 'Vista previa del email',
    wfClose: 'Cerrar',
  },
  ru: {
    leadsTab: 'Лиды',
    profileTab: 'Мой профиль',
    registerLead: 'Зарегистрировать лид вручную',
    fullName: 'Полное имя',
    emailAddress: 'Электронная почта',
    uidPlaceholder: 'UID от брокера PuPrime',
    addLead: 'Добавить лид',
    sending: 'Отправка...',
    pendingHeader: 'Ожидают верификации',
    noPending: 'Нет ожидающих лидов.',
    approvedHeader: 'Одобренные участники',
    noApproved: 'Пока нет одобренных.',
    approve: 'Одобрить',
    approvedDate: 'Одобрен',
    notProvided: 'Не указан',
    editProfile: 'Редактировать профиль',
    profileImage: 'Фото профиля',
    uploadImage: 'Загрузить фото',
    changeImage: 'Сменить фото',
    uploading: 'Загрузка...',
    imageHint: 'JPG или PNG · Макс 5МБ',
    yourUrl: 'Ваш URL',
    bio: 'Биография',
    bioPlaceholder: 'Расскажите, кто вы и чего могут ожидать ваши участники...',
    saveProfile: 'Сохранить профиль',
    saving: 'Сохранение...',
    saved: 'Сохранено!',
    yourPage: 'Ваша страница',
    viewPage: 'Моя страница',
    sharePage: 'Поделиться страницей',
    shareTitle: '— Primeverse Access',
    shareText: 'Посмотрите мою страницу на Primeverse Access!',
    copyLink: 'Копировать ссылку',
    copied: 'Скопировано!',
    shareVia: 'Поделиться через',
    selectLanguage: 'Выбрать язык',
    logout: 'Выйти',
    loading: 'Загрузка...',
    aiHelper: 'AI помогает',
    aiTitle: 'AI Био-ассистент',
    startAi: 'Запустить AI-ассистента',
    aiGenerating: 'Генерируем вашу биографию...',
    aiNext: 'Далее',
    aiChooseTone: 'Выберите тон для биографии:',
    aiPreview: 'Ваша сгенерированная биография:',
    aiUseThis: 'Использовать',
    aiRegenerate: 'Сгенерировать новую',
    aiStartOver: 'Начать сначала',
    aiOtherLangs: 'Посмотреть на других языках',
    aiStepOf: 'из',
    fillAll: 'Заполните все поля',
    referralRequired: 'Это поле обязательно для заполнения',
    referralInvalid: 'Принимаются только партнёрские ссылки PuPrime (должна начинаться с https://puvip.co/la-partners/)',
    slugTaken: 'Этот URL уже используется. Выберите другой.',
    socialMedia: 'Социальные сети',
    metricsTab: 'Метрики',
    daily: 'За день',
    weekly: 'За неделю',
    monthly: 'За месяц',
    allTime: 'За всё время',
    pageViews: 'Просмотры',
    uniqueVisitors: 'уникальных посетителей',
    conversions: 'Конверсии',
    rate: 'процент',
    conversionRate: 'Коэффициент конверсии',
    regToApproved: 'рег → одобрен',
    profileStrength: 'Сила профиля',
    customUrl: 'Свой URL',
    referralLink: 'Реферальная ссылка',
    approvalRate: 'Процент одобрения',
    xOfYVerified: '{0} из {1} подтверждено',
    pageViewsOverTime: 'Просмотры за период',
    leadBreakdown: 'Разбивка лидов',
    registeredLeads: 'Зарегистрированные лиды',
    pendingVerification: 'Ожидают верификации',
    conversionRateLower: 'Коэффициент конверсии',
    pending: 'ожидают',
    approved: 'одобрено',
    ibResourcesTab: 'Маркетинговые ресурсы',
    ibResourcesSubtitle: 'Инструменты и обучение для вашего успеха',
    aiMarketingTools: 'AI Маркетинговые инструменты',
    resourcesSection: 'Ресурсы',
    ibTraining: 'Обучение IB',
    ibTrainingDesc: 'Доступ к учебным материалам и руководствам для начала работы',
    contentLibrary: 'Библиотека контента',
    contentLibraryDesc: 'Просматривайте маркетинговый контент, шаблоны и вдохновение для соцсетей',
    comingSoon: 'Скоро',
    vipSupport: 'VIP-поддержка',
    vipSupportDesc: 'Прямой доступ к VIP-поддержке для IB-партнёров',
    pvPresentation: 'Презентация PV',
    pvPresentationDesc: 'Посмотреть официальную презентацию PrimeVerse',
    postWriter: 'Генератор постов',
    postWriterDesc: 'Генератор постов на основе ИИ. Создавайте привлекательные посты для Facebook, Instagram, TikTok и других.',
    captionGenerator: 'Генератор подписей',
    captionGeneratorDesc: 'Создавайте цепляющие подписи к вашим фото и видео.',
    hashtagResearch: 'Подбор хештегов',
    hashtagResearchDesc: 'Найдите лучшие хештеги для вашей ниши для максимального охвата.',
    contentCalendar: 'Контент-календарь',
    contentCalendarDesc: 'Получите недельный план публикаций, адаптированный под вашу аудиторию.',
    aiPowered: 'На базе ИИ',
    selectPlatform: 'Выберите платформу',
    topicLabel: 'Тема / продукт',
    topicPlaceholder: 'напр. Обучение трейдингу, Копитрейдинг, Финансовая свобода...',
    toneLabel: 'Тон',
    toneProfessional: 'Профессиональный',
    toneCasual: 'Неформальный',
    toneMotivational: 'Мотивирующий',
    toneEducational: 'Образовательный',
    generatePost: 'Сгенерировать пост',
    generating: 'Генерация...',
    regenerate: 'Сгенерировать новый',
    copyText: 'Копировать',
    captionTopicPlaceholder: 'Опишите ваше фото или видео...',
    captionStyle: 'Стиль',
    styleEngaging: 'Вовлекающий',
    styleInspirational: 'Вдохновляющий',
    styleEducational: 'Образовательный',
    styleHumorous: 'Юмористический',
    generateCaption: 'Сгенерировать подпись',
    emojiSuggestions: 'Предложения эмодзи',
    nicheLabel: 'Ниша / тема',
    nichePlaceholder: 'напр. Форекс, Криптовалюта, Финансовое образование...',
    researchHashtags: 'Подобрать хештеги',
    researching: 'Подбор...',
    topHashtags: 'Топ (Высокая конкуренция)',
    mediumHashtags: 'Средние (Сбалансированные)',
    nicheHashtags: 'Нишевые (Низкая конкуренция)',
    copyAll: 'Копировать все',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Другая URL',
    updateInfo: 'Обновить мои данные',
    updating: 'Обновление...',
    updated: 'Обновлено!',
    generatePage: 'Создать мою страницу',
    generatingPage: 'Создаём вашу страницу...',
    pageIsLive: 'Ваша страница онлайн!',
    dragToReposition: 'Перетащите для изменения позиции',
    rememberToSave: 'Не забудьте сохранить после изменения позиции',
    pageLiveAt: 'Ваша страница готова и доступна по адресу:',
    viewLandingPage: 'Посмотреть вашу страницу',
    yourPageAt: 'Ваша страница:',
    aiDescription: 'Ответьте на 5 вопросов, выберите тон, и AI создаст профессиональную биографию — на всех языках.',
    somethingWentWrong: 'Что-то пошло не так',
    noDataYet: 'Данных пока нет',
    errorPrefix: 'Ошибка: ',
    uploadErrorPrefix: 'Ошибка загрузки: ',
    reportBug: 'Сообщить об ошибке',
    bugModalTitle: 'Сообщить об ошибке',
    bugModalInstructions: 'Помогите нам улучшить SYSTM8! Пожалуйста, приложите скриншот проблемы — отчёты без скриншотов не будут обработаны.',
    bugWhatHappened: 'Что произошло?',
    bugWhatExpected: 'Что вы ожидали?',
    bugWhichPage: 'На какой странице вы были?',
    bugPageDashboard: 'Панель управления',
    bugPageLanding: 'Лендинг',
    bugPageLogin: 'Вход',
    bugPageOther: 'Другое',
    bugScreenshot: 'Скриншот',
    bugScreenshotHint: 'PNG или JPG · Макс 5МБ',
    bugScreenshotRequired: 'Скриншот обязателен',
    bugSeverity: 'Серьёзность',
    bugSeverityCritical: 'Критическая',
    bugSeverityHigh: 'Высокая',
    bugSeverityMedium: 'Средняя',
    bugSeverityLow: 'Низкая',
    bugSend: 'Отправить отчёт',
    bugCancel: 'Отмена',
    bugSending: 'Отправка...',
    bugSuccess: 'Спасибо! Ваш отчёт отправлен.',
    bugFillRequired: 'Пожалуйста, заполните все обязательные поля и прикрепите скриншот.',
    betaTestTab: 'Бета-тест',
    betaTitle: 'SYSTM8 Бета-тест',
    betaSubtitle: 'Вы один из 18 выбранных бета-тестеров. Ваш отзыв формирует будущее SYSTM8.',
    betaProgress: 'тестов выполнено',
    betaPassed: 'Пройдено',
    betaFailed: 'Провал',
    betaRemaining: 'Осталось',
    betaAddNote: 'Добавить заметку...',
    betaScreenshot: 'Скриншот',
    betaUntested: 'Не проверено',
    betaPass: 'Пройдено',
    betaFail: 'Провал',
    betaSubmitAll: 'Отправить все результаты',
    betaThankYou: 'тестов выполнено. Спасибо за ваш вклад в SYSTM8!',
    betaFoundingMember: 'Бета-тестер — Основатель',
    betaBugTitle: 'Название бага',
    betaBugDesc: 'Что пошло не так?',
    betaBugSeverity: 'Серьёзность',
    betaBugSubmit: 'Отправить баг-репорт',
    betaBugCritical: 'Критический',
    betaBugMajor: 'Серьёзный',
    betaBugMinor: 'Незначительный',
    betaBugCosmetic: 'Косметический',
    betaSec1: 'Регистрация и верификация',
    betaSec2: 'Настройка профиля',
    betaSec3: 'AI-ассистент био',
    betaSec4: 'Лендинг-страница',
    betaSec5: 'Переключение языка',
    betaSec6: 'Шеринг и лиды',
    betaSec7: 'Автоматические письма',
    betaSec8: 'Функции дашборда',
    marketingTab: 'Маркетинг',
    broadcastsSubTab: 'Рассылки',
    workflowsSubTab: 'Автоматизации',
    pipelineSubTab: 'Воронка',
    newBroadcast: 'Новая рассылка',
    noBroadcasts: 'Рассылок пока нет. Создайте первую кампанию для связи с вашими лидами.',
    campaignName: 'Название кампании',
    campaignNamePlaceholder: 'напр. Приветствие новых участников, Еженедельная рассылка...',
    messageLabel: 'Сообщение',
    messagePlaceholder: 'Напишите сообщение рассылки...',
    mergeTags: 'Переменные подстановки',
    channelsLabel: 'Каналы',
    emailChannel: 'Электронная почта',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(открывает ссылки wa.me)',
    telegramChannel: 'Telegram',
    telegramHint: '(требуется настройка бота)',
    audienceLabel: 'Аудитория',
    audienceAll: 'Все мои лиды',
    audienceVerified: 'Все верифицированные участники',
    audienceLast7: 'Лиды за последние 7 дней',
    audienceLast30: 'Лиды за последние 30 дней',
    previewLabel: 'Предпросмотр',
    scheduleLabel: 'Планирование',
    sendNow: 'Отправить сейчас',
    scheduleLater: 'Запланировать на потом',
    recipientCount: 'Эта рассылка будет отправлена {0} получателям',
    sendBroadcast: 'Отправить рассылку',
    confirmSendTitle: 'Подтвердите рассылку',
    confirmSendMsg: 'Вы собираетесь отправить {0} получателям через {1}. Подтвердить?',
    confirmBtn: 'Подтвердить и отправить',
    cancelBtn: 'Отмена',
    broadcastSending: 'Отправка...',
    broadcastSent: 'Отправлено',
    broadcastDraft: 'Черновик',
    broadcastScheduled: 'Запланировано',
    statsSent: 'Отправлено',
    statsDelivered: 'Доставлено',
    statsOpened: 'Открыто',
    statsClicked: 'Кликнуто',
    viewRecipients: 'Посмотреть получателей',
    backToBroadcasts: 'Назад к рассылкам',
    whatsappLinks: 'Ссылки WhatsApp',
    whatsappLinksDesc: 'Нажмите на каждую ссылку, чтобы отправить сообщение через WhatsApp:',
    telegramComingSoon: 'Интеграция Telegram-бота скоро появится',
    broadcastSuccess: 'Рассылка успешно отправлена!',
    broadcastError: 'Ошибка отправки рассылки',
    wfNoWorkflows: 'Нет автоматизаций. Начните с шаблона или создайте свою.',
    wfNewWorkflow: 'Новая автоматизация',
    wfTemplateLibrary: 'Библиотека шаблонов',
    wfActive: 'Активна',
    wfDraft: 'Черновик',
    wfPaused: 'Пауза',
    wfEnrolled: 'Зачислено',
    wfCompleted: 'Завершено',
    wfCompletionRate: 'Завершение',
    wfEditWorkflow: 'Редактировать',
    wfWorkflowName: 'Название',
    wfWorkflowNamePh: 'напр. Приветственная серия, Онбординг...',
    wfDescription: 'Описание',
    wfDescriptionPh: 'Что делает эта автоматизация?',
    wfTrigger: 'Триггер',
    wfTriggerLeadSignup: 'Регистрация лида',
    wfTriggerLeadInactive: 'Лид неактивен',
    wfTriggerStageChange: 'Смена этапа',
    wfTriggerManual: 'Ручной',
    wfTriggerScheduled: 'Запланированный',
    wfInactiveDays: 'Дней неактивности',
    wfSelectStage: 'Выберите этап',
    wfSteps: 'Шаги',
    wfAddStep: 'Добавить шаг',
    wfStepEmail: 'Email',
    wfStepWait: 'Ожидание',
    wfStepCondition: 'Условие',
    wfStepSwitch: 'Переключить',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Тема',
    wfBody: 'Текст',
    wfPreview: 'Просмотр',
    wfWaitValue: 'Ждать',
    wfHours: 'часов',
    wfDays: 'дней',
    wfConditionIf: 'Если лид',
    wfConditionOpened: 'открыл',
    wfConditionClicked: 'кликнул',
    wfConditionNotOpened: 'не открыл',
    wfConditionEmail: 'email из шага',
    wfConditionThen: 'Перейти к шагу',
    wfConditionElse: 'Иначе к шагу',
    wfSwitchTo: 'Переключить на',
    wfSaveDraft: 'Сохранить черновик',
    wfActivate: 'Активировать',
    wfBackToWorkflows: 'Назад',
    wfDeleteStep: 'Удалить',
    wfSelectStepType: 'Выберите тип шага',
    wfUseTemplate: 'Использовать',
    wfCloseTemplates: 'Закрыть',
    wfTemplateUsed: 'Шаблон добавлен! Настройте его перед активацией.',
    wfSaved: 'Автоматизация сохранена!',
    wfActivated: 'Автоматизация активирована!',
    wfDeactivated: 'Автоматизация приостановлена.',
    wfSaveError: 'Ошибка сохранения',
    wfEmailPreviewTitle: 'Просмотр email',
    wfClose: 'Закрыть',
  },
  ar: {
    leadsTab: 'العملاء المحتملون',
    profileTab: 'ملفي الشخصي',
    registerLead: 'تسجيل عميل محتمل يدوياً',
    fullName: 'الاسم الكامل',
    emailAddress: 'البريد الإلكتروني',
    uidPlaceholder: 'UID من وسيط PuPrime',
    addLead: 'إضافة عميل',
    sending: 'جاري الإرسال...',
    pendingHeader: 'بانتظار التحقق',
    noPending: 'لا يوجد عملاء بالانتظار.',
    approvedHeader: 'الأعضاء المعتمدون',
    noApproved: 'لا يوجد معتمدون بعد.',
    approve: 'اعتماد',
    approvedDate: 'معتمد',
    notProvided: 'غير متوفر',
    editProfile: 'تعديل الملف الشخصي',
    profileImage: 'صورة الملف الشخصي',
    uploadImage: 'رفع صورة',
    changeImage: 'تغيير الصورة',
    uploading: 'جاري الرفع...',
    imageHint: 'JPG أو PNG · حد أقصى 5MB',
    yourUrl: 'رابطك',
    bio: 'نبذة',
    bioPlaceholder: 'أخبرنا من أنت وماذا يمكن لأعضائك توقعه...',
    saveProfile: 'حفظ الملف الشخصي',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ!',
    yourPage: 'صفحتك',
    viewPage: 'عرض صفحتي',
    sharePage: 'مشاركة صفحتي',
    shareTitle: '— Primeverse Access',
    shareText: 'تحقق من صفحتي على Primeverse Access!',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    shareVia: 'مشاركة عبر',
    selectLanguage: 'اختر اللغة',
    logout: 'تسجيل خروج',
    loading: 'جاري التحميل...',
    aiHelper: 'AI يساعدك',
    aiTitle: 'مساعد AI للنبذة',
    startAi: 'بدء مساعد AI',
    aiGenerating: 'جارٍ إنشاء نبذتك...',
    aiNext: 'التالي',
    aiChooseTone: 'اختر نغمة لنبذتك:',
    aiPreview: 'نبذتك المُنشأة:',
    aiUseThis: 'استخدم هذه',
    aiRegenerate: 'إنشاء جديدة',
    aiStartOver: 'البدء من جديد',
    aiOtherLangs: 'عرض بلغات أخرى',
    aiStepOf: 'من',
    fillAll: 'املأ جميع الحقول',
    referralRequired: 'يجب ملء هذا الحقل',
    referralInvalid: 'يتم قبول روابط شركاء PuPrime فقط (يجب أن تبدأ بـ https://puvip.co/la-partners/)',
    slugTaken: 'هذا الرابط مستخدم بالفعل. اختر رابطاً آخر.',
    socialMedia: 'وسائل التواصل الاجتماعي',
    metricsTab: 'المقاييس',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    allTime: 'كل الوقت',
    pageViews: 'مشاهدات الصفحة',
    uniqueVisitors: 'زوار فريدون',
    conversions: 'التحويلات',
    rate: 'معدل',
    conversionRate: 'معدل التحويل',
    regToApproved: 'تسجيل → معتمد',
    profileStrength: 'قوة الملف الشخصي',
    customUrl: 'رابط مخصص',
    referralLink: 'رابط الإحالة',
    approvalRate: 'معدل الاعتماد',
    xOfYVerified: '{0} من {1} تم التحقق',
    pageViewsOverTime: 'المشاهدات عبر الزمن',
    leadBreakdown: 'تفصيل العملاء',
    registeredLeads: 'عملاء مسجلون',
    pendingVerification: 'بانتظار التحقق',
    conversionRateLower: 'معدل التحويل',
    pending: 'معلق',
    approved: 'معتمد',
    ibResourcesTab: 'موارد التسويق',
    ibResourcesSubtitle: 'أدوات وتدريب لمساعدتك على النجاح',
    aiMarketingTools: 'أدوات التسويق بالذكاء الاصطناعي',
    resourcesSection: 'الموارد',
    ibTraining: 'تدريب IB',
    ibTrainingDesc: 'الوصول إلى المواد التدريبية والأدلة لمساعدتك على البدء',
    contentLibrary: 'مكتبة المحتوى',
    contentLibraryDesc: 'تصفح محتوى التسويق والقوالب والإلهام لوسائل التواصل الاجتماعي',
    comingSoon: 'قريباً',
    vipSupport: 'دعم VIP',
    vipSupportDesc: 'وصول مباشر إلى دعم VIP لشركاء IB',
    pvPresentation: 'عرض PV',
    pvPresentationDesc: 'عرض العرض التقديمي الرسمي لـ PrimeVerse',
    postWriter: 'كاتب المنشورات',
    postWriterDesc: 'مولّد منشورات مدعوم بالذكاء الاصطناعي. أنشئ منشورات جذابة لفيسبوك وإنستغرام وتيك توك والمزيد.',
    captionGenerator: 'مولّد التعليقات',
    captionGeneratorDesc: 'أنشئ تعليقات لافتة لصورك ومقاطع الفيديو.',
    hashtagResearch: 'بحث الهاشتاغ',
    hashtagResearchDesc: 'اعثر على أفضل الهاشتاغات لمجالك لتعظيم الوصول والتفاعل.',
    contentCalendar: 'تقويم المحتوى',
    contentCalendarDesc: 'احصل على جدول نشر أسبوعي مصمم لجمهورك ومنطقتك الزمنية.',
    aiPowered: 'مدعوم بالذكاء الاصطناعي',
    selectPlatform: 'اختر المنصة',
    topicLabel: 'الموضوع / المنتج',
    topicPlaceholder: 'مثال: تعليم التداول، نسخ التداول، الحرية المالية...',
    toneLabel: 'النغمة',
    toneProfessional: 'احترافي',
    toneCasual: 'عفوي',
    toneMotivational: 'تحفيزي',
    toneEducational: 'تعليمي',
    generatePost: 'إنشاء منشور',
    generating: 'جارٍ الإنشاء...',
    regenerate: 'إعادة الإنشاء',
    copyText: 'نسخ',
    captionTopicPlaceholder: 'صف صورتك أو مقطع الفيديو...',
    captionStyle: 'الأسلوب',
    styleEngaging: 'جذاب',
    styleInspirational: 'ملهم',
    styleEducational: 'تعليمي',
    styleHumorous: 'فكاهي',
    generateCaption: 'إنشاء تعليق',
    emojiSuggestions: 'اقتراحات الرموز التعبيرية',
    nicheLabel: 'المجال / الموضوع',
    nichePlaceholder: 'مثال: تداول الفوركس، العملات المشفرة، التعليم المالي...',
    researchHashtags: 'بحث الهاشتاغات',
    researching: 'جارٍ البحث...',
    topHashtags: 'الأعلى (منافسة عالية)',
    mediumHashtags: 'متوسط (متوازن)',
    nicheHashtags: 'متخصص (منافسة منخفضة)',
    copyAll: 'نسخ الكل',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'رابط آخر',
    updateInfo: 'تحديث بياناتي',
    updating: 'جاري التحديث...',
    updated: 'تم التحديث!',
    generatePage: 'إنشاء صفحتي',
    generatingPage: 'جاري إنشاء صفحتك...',
    pageIsLive: 'صفحتك جاهزة!',
    dragToReposition: 'اسحب لتغيير الموضع',
    rememberToSave: 'تذكّر الحفظ بعد تغيير الموضع',
    pageLiveAt: 'صفحتك جاهزة ومباشرة على:',
    viewLandingPage: 'عرض صفحتك',
    yourPageAt: 'صفحتك:',
    aiDescription: 'أجب على 5 أسئلة، اختر نغمة، وسيقوم AI بإنشاء نبذة احترافية لك — بجميع اللغات.',
    somethingWentWrong: 'حدث خطأ',
    noDataYet: 'لا توجد بيانات بعد',
    errorPrefix: 'خطأ: ',
    uploadErrorPrefix: 'خطأ في التحميل: ',
    reportBug: 'الإبلاغ عن خطأ',
    bugModalTitle: 'الإبلاغ عن خطأ',
    bugModalInstructions: 'ساعدنا في تحسين SYSTM8! يرجى تضمين لقطة شاشة للمشكلة — لن تتم معالجة التقارير بدون لقطات شاشة.',
    bugWhatHappened: 'ماذا حدث؟',
    bugWhatExpected: 'ماذا كنت تتوقع أن يحدث؟',
    bugWhichPage: 'في أي صفحة كنت؟',
    bugPageDashboard: 'لوحة التحكم',
    bugPageLanding: 'صفحة الهبوط',
    bugPageLogin: 'تسجيل الدخول',
    bugPageOther: 'أخرى',
    bugScreenshot: 'لقطة شاشة',
    bugScreenshotHint: 'PNG أو JPG · الحد الأقصى 5 ميجابايت',
    bugScreenshotRequired: 'لقطة الشاشة مطلوبة',
    bugSeverity: 'الخطورة',
    bugSeverityCritical: 'حرجة',
    bugSeverityHigh: 'عالية',
    bugSeverityMedium: 'متوسطة',
    bugSeverityLow: 'منخفضة',
    bugSend: 'إرسال التقرير',
    bugCancel: 'إلغاء',
    bugSending: 'جارٍ الإرسال...',
    bugSuccess: 'شكراً! تم إرسال تقريرك.',
    bugFillRequired: 'يرجى ملء جميع الحقول المطلوبة وإرفاق لقطة شاشة.',
    betaTestTab: 'اختبار تجريبي',
    betaTitle: 'اختبار SYSTM8 التجريبي',
    betaSubtitle: 'أنت واحد من 18 مختبر تجريبي مختار. ملاحظاتك تشكّل مستقبل SYSTM8.',
    betaProgress: 'اختبار مكتمل',
    betaPassed: 'ناجح',
    betaFailed: 'فاشل',
    betaRemaining: 'متبقي',
    betaAddNote: 'أضف ملاحظة...',
    betaScreenshot: 'لقطة شاشة',
    betaUntested: 'لم يُختبر',
    betaPass: 'ناجح',
    betaFail: 'فاشل',
    betaSubmitAll: 'إرسال جميع النتائج',
    betaThankYou: 'اختبار مكتمل. شكراً لمساهمتك في SYSTM8!',
    betaFoundingMember: 'مختبر تجريبي — عضو مؤسس',
    betaBugTitle: 'عنوان الخطأ',
    betaBugDesc: 'ما الذي حدث خطأ؟',
    betaBugSeverity: 'الخطورة',
    betaBugSubmit: 'إرسال تقرير الخطأ',
    betaBugCritical: 'حرج',
    betaBugMajor: 'كبير',
    betaBugMinor: 'صغير',
    betaBugCosmetic: 'تجميلي',
    betaSec1: 'التسجيل والتحقق',
    betaSec2: 'إعداد الملف الشخصي',
    betaSec3: 'مساعد السيرة الذاتية AI',
    betaSec4: 'صفحة الهبوط',
    betaSec5: 'تبديل اللغة',
    betaSec6: 'المشاركة والعملاء',
    betaSec7: 'رسائل البريد التلقائية',
    betaSec8: 'ميزات لوحة التحكم',
    marketingTab: 'التسويق',
    broadcastsSubTab: 'الرسائل الجماعية',
    workflowsSubTab: 'سير العمل',
    pipelineSubTab: 'مسار المبيعات',
    newBroadcast: 'رسالة جماعية جديدة',
    noBroadcasts: 'لا توجد رسائل جماعية بعد. أنشئ حملتك الأولى للوصول إلى عملائك.',
    campaignName: 'اسم الحملة',
    campaignNamePlaceholder: 'مثال: ترحيب بالأعضاء الجدد، تحديث أسبوعي...',
    messageLabel: 'الرسالة',
    messagePlaceholder: 'اكتب رسالتك الجماعية...',
    mergeTags: 'علامات الدمج',
    channelsLabel: 'القنوات',
    emailChannel: 'البريد الإلكتروني',
    whatsappChannel: 'واتساب',
    whatsappHint: '(يفتح روابط wa.me)',
    telegramChannel: 'تيليجرام',
    telegramHint: '(يتطلب إعداد البوت)',
    audienceLabel: 'الجمهور',
    audienceAll: 'جميع عملائي',
    audienceVerified: 'جميع الأعضاء المعتمدين',
    audienceLast7: 'عملاء آخر 7 أيام',
    audienceLast30: 'عملاء آخر 30 يوماً',
    previewLabel: 'معاينة',
    scheduleLabel: 'الجدولة',
    sendNow: 'إرسال الآن',
    scheduleLater: 'جدولة لاحقاً',
    recipientCount: 'سيتم إرسال هذه الرسالة إلى {0} مستلم',
    sendBroadcast: 'إرسال الرسالة الجماعية',
    confirmSendTitle: 'تأكيد الإرسال',
    confirmSendMsg: 'أنت على وشك الإرسال إلى {0} مستلم عبر {1}. تأكيد؟',
    confirmBtn: 'تأكيد وإرسال',
    cancelBtn: 'إلغاء',
    broadcastSending: 'جارٍ الإرسال...',
    broadcastSent: 'مُرسل',
    broadcastDraft: 'مسودة',
    broadcastScheduled: 'مجدول',
    statsSent: 'مُرسل',
    statsDelivered: 'تم التسليم',
    statsOpened: 'تم الفتح',
    statsClicked: 'تم النقر',
    viewRecipients: 'عرض المستلمين',
    backToBroadcasts: 'العودة إلى الرسائل الجماعية',
    whatsappLinks: 'روابط واتساب',
    whatsappLinksDesc: 'انقر على كل رابط لإرسال الرسالة عبر واتساب:',
    telegramComingSoon: 'تكامل بوت تيليجرام قريباً',
    broadcastSuccess: 'تم إرسال الرسالة الجماعية بنجاح!',
    broadcastError: 'فشل إرسال الرسالة الجماعية',
    wfNoWorkflows: 'لا توجد مسارات عمل بعد. ابدأ بقالب أو أنشئ مسارك الخاص.',
    wfNewWorkflow: 'مسار عمل جديد',
    wfTemplateLibrary: 'مكتبة القوالب',
    wfActive: 'نشط',
    wfDraft: 'مسودة',
    wfPaused: 'متوقف',
    wfEnrolled: 'مسجّل',
    wfCompleted: 'مكتمل',
    wfCompletionRate: 'الإكمال',
    wfEditWorkflow: 'تعديل المسار',
    wfWorkflowName: 'اسم المسار',
    wfWorkflowNamePh: 'مثال: سلسلة الترحيب، الإعداد...',
    wfDescription: 'الوصف',
    wfDescriptionPh: 'ماذا يفعل هذا المسار؟',
    wfTrigger: 'المشغّل',
    wfTriggerLeadSignup: 'تسجيل عميل محتمل',
    wfTriggerLeadInactive: 'عميل غير نشط',
    wfTriggerStageChange: 'تغيير المرحلة',
    wfTriggerManual: 'يدوي',
    wfTriggerScheduled: 'مجدول',
    wfInactiveDays: 'أيام عدم النشاط',
    wfSelectStage: 'اختر المرحلة',
    wfSteps: 'الخطوات',
    wfAddStep: 'إضافة خطوة',
    wfStepEmail: 'بريد إلكتروني',
    wfStepWait: 'انتظار',
    wfStepCondition: 'شرط',
    wfStepSwitch: 'تبديل المسار',
    wfStepWhatsApp: 'واتساب',
    wfStepTelegram: 'تيليجرام',
    wfSubject: 'الموضوع',
    wfBody: 'المحتوى',
    wfPreview: 'معاينة',
    wfWaitValue: 'انتظر',
    wfHours: 'ساعات',
    wfDays: 'أيام',
    wfConditionIf: 'إذا العميل',
    wfConditionOpened: 'فتح',
    wfConditionClicked: 'نقر',
    wfConditionNotOpened: 'لم يفتح',
    wfConditionEmail: 'بريد من الخطوة',
    wfConditionThen: 'انتقل للخطوة',
    wfConditionElse: 'وإلا انتقل للخطوة',
    wfSwitchTo: 'التبديل إلى',
    wfSaveDraft: 'حفظ كمسودة',
    wfActivate: 'تفعيل',
    wfBackToWorkflows: 'العودة',
    wfDeleteStep: 'حذف',
    wfSelectStepType: 'اختر نوع الخطوة',
    wfUseTemplate: 'استخدام القالب',
    wfCloseTemplates: 'إغلاق',
    wfTemplateUsed: 'تمت إضافة القالب! خصصه قبل التفعيل.',
    wfSaved: 'تم حفظ المسار!',
    wfActivated: 'تم تفعيل المسار!',
    wfDeactivated: 'تم إيقاف المسار.',
    wfSaveError: 'فشل حفظ المسار',
    wfEmailPreviewTitle: 'معاينة البريد',
    wfClose: 'إغلاق',
  },
  tl: {
    leadsTab: 'Leads',
    profileTab: 'Aking profile',
    registerLead: 'Mag-register ng bagong lead',
    fullName: 'Buong pangalan',
    emailAddress: 'Email address',
    uidPlaceholder: 'UID mula sa PuPrime broker',
    addLead: 'Idagdag ang lead',
    sending: 'Ipinapadala...',
    pendingHeader: 'Naghihintay ng verification',
    noPending: 'Walang naghihintay na leads.',
    approvedHeader: 'Approved members',
    noApproved: 'Wala pang approved.',
    approve: 'I-approve',
    approvedDate: 'Na-approve',
    notProvided: 'Hindi ibinigay',
    editProfile: 'I-edit ang profile',
    profileImage: 'Profile picture',
    uploadImage: 'Mag-upload ng larawan',
    changeImage: 'Palitan ang larawan',
    uploading: 'Nag-a-upload...',
    imageHint: 'JPG o PNG · Max 5MB',
    yourUrl: 'Iyong URL',
    bio: 'Bio',
    bioPlaceholder: 'Sabihin kung sino ka at ano ang maaasahan ng iyong members...',
    saveProfile: 'I-save ang profile',
    saving: 'Sine-save...',
    saved: 'Na-save!',
    yourPage: 'Iyong pahina',
    viewPage: 'Tingnan ang pahina ko',
    sharePage: 'Ibahagi ang pahina ko',
    shareTitle: '— Primeverse Access',
    shareText: 'Tingnan ang aking pahina sa Primeverse Access!',
    copyLink: 'Kopyahin ang link',
    copied: 'Nakopya!',
    shareVia: 'Ibahagi sa pamamagitan ng',
    selectLanguage: 'Pumili ng wika',
    logout: 'Mag-logout',
    loading: 'Naglo-load...',
    aiHelper: 'AI tumutulong',
    aiTitle: 'AI Bio-assistant',
    startAi: 'Simulan ang AI assistant',
    aiGenerating: 'Ginagawa ang iyong bio...',
    aiNext: 'Susunod',
    aiChooseTone: 'Pumili ng tono para sa iyong bio:',
    aiPreview: 'Ang na-generate na bio mo:',
    aiUseThis: 'Gamitin ito',
    aiRegenerate: 'Gumawa ng bago',
    aiStartOver: 'Magsimula ulit',
    aiOtherLangs: 'Tingnan sa ibang wika',
    aiStepOf: 'ng',
    fillAll: 'Punan lahat ng fields',
    referralRequired: 'Kailangang punan ang field na ito',
    referralInvalid: 'Tanging mga PuPrime partner link lang ang tinatanggap (dapat magsimula sa https://puvip.co/la-partners/)',
    slugTaken: 'Ginagamit na ang URL na ito. Pumili ng iba.',
    socialMedia: 'Social media',
    metricsTab: 'Metrics',
    daily: 'Araw-araw',
    weekly: 'Lingguhan',
    monthly: 'Buwanan',
    allTime: 'Lahat ng oras',
    pageViews: 'Mga View',
    uniqueVisitors: 'natatanging bisita',
    conversions: 'Mga Conversion',
    rate: 'rate',
    conversionRate: 'Conversion Rate',
    regToApproved: 'reg → na-approve',
    profileStrength: 'Lakas ng Profile',
    customUrl: 'Custom URL',
    referralLink: 'Referral link',
    approvalRate: 'Approval Rate',
    xOfYVerified: '{0} sa {1} na-verify',
    pageViewsOverTime: 'Mga View sa Paglipas ng Panahon',
    leadBreakdown: 'Breakdown ng leads',
    registeredLeads: 'Mga naka-register na leads',
    pendingVerification: 'Naghihintay ng verification',
    conversionRateLower: 'Conversion rate',
    pending: 'naghihintay',
    approved: 'na-approve',
    ibResourcesTab: 'Marketing Resources',
    ibResourcesSubtitle: 'Mga tool at pagsasanay para makatulong sa iyong tagumpay',
    aiMarketingTools: 'AI Marketing Tools',
    resourcesSection: 'Mga Resource',
    ibTraining: 'IB Training',
    ibTrainingDesc: 'I-access ang mga training material at gabay para makapagsimula',
    contentLibrary: 'Content Library',
    contentLibraryDesc: 'Mag-browse ng marketing content, template at inspirasyon para sa iyong social media',
    comingSoon: 'Malapit na',
    vipSupport: 'VIP Support',
    vipSupportDesc: 'Direktang access sa VIP support para sa mga IB partner',
    pvPresentation: 'PV Presentation',
    pvPresentationDesc: 'Tingnan ang opisyal na PrimeVerse presentation',
    postWriter: 'Post Writer',
    postWriterDesc: 'AI-powered na social media post generator. Gumawa ng engaging posts para sa Facebook, Instagram, TikTok at iba pa.',
    captionGenerator: 'Caption Generator',
    captionGeneratorDesc: 'Gumawa ng nakaka-engganyo na caption para sa iyong mga larawan at video.',
    hashtagResearch: 'Hashtag Research',
    hashtagResearchDesc: 'Hanapin ang pinakamahusay na hashtag para sa iyong niche para ma-maximize ang reach at engagement.',
    contentCalendar: 'Content Calendar',
    contentCalendarDesc: 'Kumuha ng lingguhang posting schedule na naaangkop sa iyong audience at timezone.',
    aiPowered: 'AI Powered',
    selectPlatform: 'Pumili ng platform',
    topicLabel: 'Paksa / produkto',
    topicPlaceholder: 'hal. Trading education, Copy trading, Financial freedom...',
    toneLabel: 'Tono',
    toneProfessional: 'Propesyonal',
    toneCasual: 'Casual',
    toneMotivational: 'Motivational',
    toneEducational: 'Pang-edukasyon',
    generatePost: 'Gumawa ng Post',
    generating: 'Ginagawa...',
    regenerate: 'Gumawa ng bago',
    copyText: 'Kopyahin',
    captionTopicPlaceholder: 'Ilarawan ang iyong larawan o video...',
    captionStyle: 'Estilo',
    styleEngaging: 'Engaging',
    styleInspirational: 'Inspirational',
    styleEducational: 'Pang-edukasyon',
    styleHumorous: 'Nakakatawa',
    generateCaption: 'Gumawa ng Caption',
    emojiSuggestions: 'Mga mungkahing emoji',
    nicheLabel: 'Niche / paksa',
    nichePlaceholder: 'hal. Forex trading, Crypto, Financial education...',
    researchHashtags: 'Mag-research ng Hashtag',
    researching: 'Nagre-research...',
    topHashtags: 'Top (Mataas na kompetisyon)',
    mediumHashtags: 'Medium (Balansado)',
    nicheHashtags: 'Niche (Mababang kompetisyon)',
    copyAll: 'Kopyahin Lahat',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Ibang URL',
    updateInfo: 'I-update ang aking impormasyon',
    updating: 'Ina-update...',
    updated: 'Na-update!',
    generatePage: 'Gumawa ng aking landing page',
    generatingPage: 'Ginagawa ang iyong pahina...',
    pageIsLive: 'Live na ang pahina mo!',
    dragToReposition: 'I-drag para i-reposition',
    rememberToSave: 'Tandaan na i-save pagkatapos i-reposition',
    pageLiveAt: 'Ang landing page mo ay handa na at live sa:',
    viewLandingPage: 'Tingnan ang landing page mo',
    yourPageAt: 'Ang page mo:',
    aiDescription: 'Sagutin ang 5 tanong, pumili ng tono, at gagawa ang AI ng professional bio para sa iyo — sa lahat ng wika.',
    somethingWentWrong: 'May nangyaring mali',
    noDataYet: 'Wala pang data',
    errorPrefix: 'Error: ',
    uploadErrorPrefix: 'Error sa pag-upload: ',
    reportBug: 'Mag-report ng bug',
    bugModalTitle: 'Mag-report ng bug',
    bugModalInstructions: 'Tulungan kaming pagbutihin ang SYSTM8! Mangyaring mag-attach ng screenshot ng problema — hindi ipoproseso ang mga report na walang screenshot.',
    bugWhatHappened: 'Ano ang nangyari?',
    bugWhatExpected: 'Ano ang inaasahan mong mangyari?',
    bugWhichPage: 'Saang page ka?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Iba pa',
    bugScreenshot: 'Screenshot',
    bugScreenshotHint: 'PNG o JPG · Max 5MB',
    bugScreenshotRequired: 'Kailangan ang screenshot',
    bugSeverity: 'Kalubhaan',
    bugSeverityCritical: 'Kritikal',
    bugSeverityHigh: 'Mataas',
    bugSeverityMedium: 'Katamtaman',
    bugSeverityLow: 'Mababa',
    bugSend: 'Ipadala ang report',
    bugCancel: 'Kanselahin',
    bugSending: 'Ipinapadala...',
    bugSuccess: 'Salamat! Naipadala na ang iyong report.',
    bugFillRequired: 'Mangyaring punan ang lahat ng kinakailangang field at mag-attach ng screenshot.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'Isa ka sa 18 na napiling beta tester. Ang feedback mo ang humuhubog sa kinabukasan ng SYSTM8.',
    betaProgress: 'test na nakumpleto',
    betaPassed: 'Pumasa',
    betaFailed: 'Nabigo',
    betaRemaining: 'Natitira',
    betaAddNote: 'Magdagdag ng note...',
    betaScreenshot: 'Screenshot',
    betaUntested: 'Hindi pa nasubukan',
    betaPass: 'Pumasa',
    betaFail: 'Nabigo',
    betaSubmitAll: 'I-submit lahat ng resulta',
    betaThankYou: 'test na nakumpleto. Salamat sa iyong kontribusyon sa SYSTM8!',
    betaFoundingMember: 'Beta Tester — Founding Member',
    betaBugTitle: 'Pamagat ng bug',
    betaBugDesc: 'Ano ang nangyaring mali?',
    betaBugSeverity: 'Kalubhaan',
    betaBugSubmit: 'I-submit ang bug report',
    betaBugCritical: 'Kritikal',
    betaBugMajor: 'Malaki',
    betaBugMinor: 'Maliit',
    betaBugCosmetic: 'Kosmetiko',
    betaSec1: 'Pagpaparehistro at Beripikasyon',
    betaSec2: 'Pag-setup ng Profile',
    betaSec3: 'AI Bio Assistant',
    betaSec4: 'Landing Page',
    betaSec5: 'Pagpapalit ng Wika',
    betaSec6: 'Pagbabahagi at Leads',
    betaSec7: 'Automated na Email',
    betaSec8: 'Mga Feature ng Dashboard',
    marketingTab: 'Marketing',
    broadcastsSubTab: 'Mga Broadcast',
    workflowsSubTab: 'Mga Workflow',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'Bagong Broadcast',
    noBroadcasts: 'Wala pang broadcast. Gumawa ng unang kampanya para maabot ang iyong mga lead.',
    campaignName: 'Pangalan ng kampanya',
    campaignNamePlaceholder: 'hal. Welcome sa mga bagong miyembro, Lingguhang update...',
    messageLabel: 'Mensahe',
    messagePlaceholder: 'Isulat ang iyong broadcast message...',
    mergeTags: 'Mga merge tag',
    channelsLabel: 'Mga Channel',
    emailChannel: 'Email',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(magbubukas ng wa.me link)',
    telegramChannel: 'Telegram',
    telegramHint: '(kailangan ng bot setup)',
    audienceLabel: 'Audience',
    audienceAll: 'Lahat ng leads ko',
    audienceVerified: 'Lahat ng verified na miyembro',
    audienceLast7: 'Mga lead mula sa huling 7 araw',
    audienceLast30: 'Mga lead mula sa huling 30 araw',
    previewLabel: 'Preview',
    scheduleLabel: 'Iskedyul',
    sendNow: 'Ipadala ngayon',
    scheduleLater: 'I-schedule para mamaya',
    recipientCount: 'Ipapadala ang broadcast na ito sa {0} na tatanggap',
    sendBroadcast: 'Ipadala ang Broadcast',
    confirmSendTitle: 'Kumpirmahin ang broadcast',
    confirmSendMsg: 'Ipapadala mo sa {0} na tatanggap sa pamamagitan ng {1}. Kumpirmahin?',
    confirmBtn: 'Kumpirmahin at Ipadala',
    cancelBtn: 'Kanselahin',
    broadcastSending: 'Ipinapadala...',
    broadcastSent: 'Naipadala',
    broadcastDraft: 'Draft',
    broadcastScheduled: 'Naka-schedule',
    statsSent: 'Naipadala',
    statsDelivered: 'Na-deliver',
    statsOpened: 'Nabuksan',
    statsClicked: 'Na-click',
    viewRecipients: 'Tingnan ang mga tatanggap',
    backToBroadcasts: 'Bumalik sa mga broadcast',
    whatsappLinks: 'Mga WhatsApp link',
    whatsappLinksDesc: 'I-click ang bawat link para ipadala ang mensahe sa WhatsApp:',
    telegramComingSoon: 'Telegram bot integration malapit na',
    broadcastSuccess: 'Matagumpay na naipadala ang broadcast!',
    broadcastError: 'Hindi naipadala ang broadcast',
    wfNoWorkflows: 'Wala pang mga workflow. Magsimula sa template o gumawa ng sarili mo.',
    wfNewWorkflow: 'Bagong Workflow',
    wfTemplateLibrary: 'Template Library',
    wfActive: 'Active',
    wfDraft: 'Draft',
    wfPaused: 'Naka-pause',
    wfEnrolled: 'Naka-enroll',
    wfCompleted: 'Nakumpleto',
    wfCompletionRate: 'Pagkumpleto',
    wfEditWorkflow: 'I-edit ang Workflow',
    wfWorkflowName: 'Pangalan ng workflow',
    wfWorkflowNamePh: 'hal. Welcome Sequence, Onboarding...',
    wfDescription: 'Paglalarawan',
    wfDescriptionPh: 'Ano ang ginagawa ng workflow na ito?',
    wfTrigger: 'Trigger',
    wfTriggerLeadSignup: 'Lead Signup',
    wfTriggerLeadInactive: 'Lead Inactive',
    wfTriggerStageChange: 'Stage Change',
    wfTriggerManual: 'Manual',
    wfTriggerScheduled: 'Naka-schedule',
    wfInactiveDays: 'Araw na inactive',
    wfSelectStage: 'Pumili ng stage',
    wfSteps: 'Mga hakbang',
    wfAddStep: 'Magdagdag ng hakbang',
    wfStepEmail: 'Email',
    wfStepWait: 'Maghintay',
    wfStepCondition: 'Kondisyon',
    wfStepSwitch: 'Palitan ang Workflow',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Subject',
    wfBody: 'Nilalaman',
    wfPreview: 'Preview',
    wfWaitValue: 'Maghintay',
    wfHours: 'oras',
    wfDays: 'araw',
    wfConditionIf: 'Kung ang lead',
    wfConditionOpened: 'binuksan',
    wfConditionClicked: 'na-click',
    wfConditionNotOpened: 'hindi binuksan',
    wfConditionEmail: 'email mula sa hakbang',
    wfConditionThen: 'Pumunta sa hakbang',
    wfConditionElse: 'Kung hindi, pumunta sa hakbang',
    wfSwitchTo: 'Lumipat sa workflow',
    wfSaveDraft: 'I-save bilang Draft',
    wfActivate: 'I-activate',
    wfBackToWorkflows: 'Bumalik sa mga workflow',
    wfDeleteStep: 'Tanggalin',
    wfSelectStepType: 'Pumili ng uri ng hakbang',
    wfUseTemplate: 'Gamitin ang Template',
    wfCloseTemplates: 'Isara',
    wfTemplateUsed: 'Naidagdag ang template! I-customize bago i-activate.',
    wfSaved: 'Na-save ang workflow!',
    wfActivated: 'Na-activate ang workflow!',
    wfDeactivated: 'Naka-pause ang workflow.',
    wfSaveError: 'Hindi ma-save ang workflow',
    wfEmailPreviewTitle: 'Email Preview',
    wfClose: 'Isara',
  },
  pt: {
    leadsTab: 'Leads',
    profileTab: 'Meu perfil',
    registerLead: 'Registrar novo lead manualmente',
    fullName: 'Nome completo',
    emailAddress: 'Endereço de e-mail',
    uidPlaceholder: 'UID do broker PuPrime',
    addLead: 'Adicionar lead',
    sending: 'Enviando...',
    pendingHeader: 'Aguardando verificação',
    noPending: 'Nenhum lead aguardando.',
    approvedHeader: 'Membros aprovados',
    noApproved: 'Nenhum aprovado ainda.',
    approve: 'Aprovar',
    approvedDate: 'Aprovado',
    notProvided: 'Não informado',
    editProfile: 'Editar perfil',
    profileImage: 'Foto de perfil',
    uploadImage: 'Enviar imagem',
    changeImage: 'Trocar imagem',
    uploading: 'Enviando...',
    imageHint: 'JPG ou PNG · Máx 5MB',
    yourUrl: 'Seu URL',
    bio: 'Bio',
    bioPlaceholder: 'Conte quem você é e o que seus membros podem esperar de você...',
    saveProfile: 'Salvar perfil',
    saving: 'Salvando...',
    saved: 'Salvo!',
    yourPage: 'Sua página',
    viewPage: 'Ver minha página',
    sharePage: 'Compartilhar minha página',
    shareTitle: '— Primeverse Access',
    shareText: 'Confira minha página no Primeverse Access!',
    copyLink: 'Copiar link',
    copied: 'Copiado!',
    shareVia: 'Compartilhar via',
    selectLanguage: 'Selecionar idioma',
    logout: 'Sair',
    loading: 'Carregando...',
    aiHelper: 'IA te ajuda',
    aiTitle: 'Assistente de Bio IA',
    startAi: 'Iniciar assistente IA',
    aiGenerating: 'Gerando sua bio...',
    aiNext: 'Próximo',
    aiChooseTone: 'Escolha um tom para sua bio:',
    aiPreview: 'Sua bio gerada:',
    aiUseThis: 'Usar esta',
    aiRegenerate: 'Gerar nova',
    aiStartOver: 'Recomeçar',
    aiOtherLangs: 'Ver em outros idiomas',
    aiStepOf: 'de',
    fillAll: 'Preencha todos os campos',
    referralRequired: 'Este campo deve ser preenchido',
    referralInvalid: 'Somente links de parceiros PuPrime são aceitos (deve começar com https://puvip.co/la-partners/)',
    slugTaken: 'Este URL já está em uso. Escolha outro.',
    socialMedia: 'Redes sociais',
    metricsTab: 'Métricas',
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    allTime: 'Todo o período',
    pageViews: 'Visualizações',
    uniqueVisitors: 'visitantes únicos',
    conversions: 'Conversões',
    rate: 'taxa',
    conversionRate: 'Taxa de conversão',
    regToApproved: 'reg → aprovado',
    profileStrength: 'Força do perfil',
    customUrl: 'URL personalizado',
    referralLink: 'Link de indicação',
    approvalRate: 'Taxa de aprovação',
    xOfYVerified: '{0} de {1} verificados',
    pageViewsOverTime: 'Visualizações ao longo do tempo',
    leadBreakdown: 'Detalhamento de leads',
    registeredLeads: 'Leads registrados',
    pendingVerification: 'Aguardando verificação',
    conversionRateLower: 'Taxa de conversão',
    pending: 'pendentes',
    approved: 'aprovados',
    ibResourcesTab: 'Recursos de Marketing',
    ibResourcesSubtitle: 'Ferramentas e treinamento para ajudá-lo a ter sucesso',
    aiMarketingTools: 'Ferramentas de Marketing IA',
    resourcesSection: 'Recursos',
    ibTraining: 'Treinamento IB',
    ibTrainingDesc: 'Acesse materiais de treinamento e guias para começar',
    contentLibrary: 'Biblioteca de conteúdo',
    contentLibraryDesc: 'Navegue por conteúdo de marketing, modelos e inspiração para suas redes sociais',
    comingSoon: 'Em breve',
    vipSupport: 'Suporte VIP',
    vipSupportDesc: 'Acesso direto ao suporte VIP para parceiros IB',
    pvPresentation: 'Apresentação PV',
    pvPresentationDesc: 'Ver a apresentação oficial do PrimeVerse',
    postWriter: 'Escritor de Posts',
    postWriterDesc: 'Gerador de posts com IA. Crie posts envolventes para Facebook, Instagram, TikTok e mais.',
    captionGenerator: 'Gerador de Legendas',
    captionGeneratorDesc: 'Gere legendas irresistíveis para suas imagens e vídeos.',
    hashtagResearch: 'Pesquisa de Hashtags',
    hashtagResearchDesc: 'Encontre as melhores hashtags para seu nicho e maximize o alcance e engajamento.',
    contentCalendar: 'Calendário de Conteúdo',
    contentCalendarDesc: 'Obtenha um cronograma semanal de postagens adaptado ao seu público e fuso horário.',
    aiPowered: 'Com IA',
    selectPlatform: 'Selecionar plataforma',
    topicLabel: 'Tema / produto',
    topicPlaceholder: 'ex. Educação em trading, Copy trading, Liberdade financeira...',
    toneLabel: 'Tom',
    toneProfessional: 'Profissional',
    toneCasual: 'Casual',
    toneMotivational: 'Motivacional',
    toneEducational: 'Educacional',
    generatePost: 'Gerar post',
    generating: 'Gerando...',
    regenerate: 'Gerar novo',
    copyText: 'Copiar',
    captionTopicPlaceholder: 'Descreva sua imagem ou vídeo...',
    captionStyle: 'Estilo',
    styleEngaging: 'Envolvente',
    styleInspirational: 'Inspirador',
    styleEducational: 'Educacional',
    styleHumorous: 'Humorístico',
    generateCaption: 'Gerar legenda',
    emojiSuggestions: 'Sugestões de emoji',
    nicheLabel: 'Nicho / tema',
    nichePlaceholder: 'ex. Trading Forex, Cripto, Educação financeira...',
    researchHashtags: 'Pesquisar hashtags',
    researching: 'Pesquisando...',
    topHashtags: 'Top (Alta competição)',
    mediumHashtags: 'Médio (Equilibrado)',
    nicheHashtags: 'Nicho (Baixa competição)',
    copyAll: 'Copiar tudo',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'Outro URL',
    updateInfo: 'Atualizar minhas informações',
    updating: 'Atualizando...',
    updated: 'Atualizado!',
    generatePage: 'Gerar minha landing page',
    generatingPage: 'Gerando sua página...',
    pageIsLive: 'Sua página está no ar!',
    dragToReposition: 'Arraste para reposicionar',
    rememberToSave: 'Lembre-se de salvar após reposicionar',
    pageLiveAt: 'Sua landing page está pronta e no ar em:',
    viewLandingPage: 'Ver sua landing page',
    yourPageAt: 'Sua página:',
    aiDescription: 'Responda 5 perguntas, escolha um tom, e a IA criará uma bio profissional para você — em todos os idiomas.',
    somethingWentWrong: 'Algo deu errado',
    noDataYet: 'Ainda não há dados',
    errorPrefix: 'Erro: ',
    uploadErrorPrefix: 'Erro no upload: ',
    reportBug: 'Reportar um bug',
    bugModalTitle: 'Reportar um bug',
    bugModalInstructions: 'Ajude-nos a melhorar o SYSTM8! Por favor inclua uma captura de tela do problema — relatórios sem capturas de tela não serão processados.',
    bugWhatHappened: 'O que aconteceu?',
    bugWhatExpected: 'O que você esperava que acontecesse?',
    bugWhichPage: 'Em qual página você estava?',
    bugPageDashboard: 'Dashboard',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'Login',
    bugPageOther: 'Outro',
    bugScreenshot: 'Captura de tela',
    bugScreenshotHint: 'PNG ou JPG · Máx 5MB',
    bugScreenshotRequired: 'A captura de tela é obrigatória',
    bugSeverity: 'Gravidade',
    bugSeverityCritical: 'Crítica',
    bugSeverityHigh: 'Alta',
    bugSeverityMedium: 'Média',
    bugSeverityLow: 'Baixa',
    bugSend: 'Enviar relatório',
    bugCancel: 'Cancelar',
    bugSending: 'Enviando...',
    bugSuccess: 'Obrigado! Seu relatório foi enviado.',
    bugFillRequired: 'Por favor preencha todos os campos obrigatórios e anexe uma captura de tela.',
    betaTestTab: 'Beta Test',
    betaTitle: 'SYSTM8 Beta Test',
    betaSubtitle: 'Você é um dos 18 beta testers selecionados. Seu feedback molda o futuro do SYSTM8.',
    betaProgress: 'testes concluídos',
    betaPassed: 'Aprovado',
    betaFailed: 'Reprovado',
    betaRemaining: 'Restante',
    betaAddNote: 'Adicionar uma nota...',
    betaScreenshot: 'Captura de tela',
    betaUntested: 'Não testado',
    betaPass: 'Aprovado',
    betaFail: 'Reprovado',
    betaSubmitAll: 'Enviar todos os resultados',
    betaThankYou: 'testes concluídos. Obrigado pela sua contribuição ao SYSTM8!',
    betaFoundingMember: 'Beta Tester — Membro Fundador',
    betaBugTitle: 'Título do bug',
    betaBugDesc: 'O que deu errado?',
    betaBugSeverity: 'Severidade',
    betaBugSubmit: 'Enviar relatório de bug',
    betaBugCritical: 'Crítico',
    betaBugMajor: 'Maior',
    betaBugMinor: 'Menor',
    betaBugCosmetic: 'Cosmético',
    betaSec1: 'Registro e verificação',
    betaSec2: 'Configuração de perfil',
    betaSec3: 'Assistente de bio AI',
    betaSec4: 'Página de destino',
    betaSec5: 'Troca de idioma',
    betaSec6: 'Compartilhamento e leads',
    betaSec7: 'E-mails automatizados',
    betaSec8: 'Recursos do painel',
    marketingTab: 'Marketing',
    broadcastsSubTab: 'Transmissões',
    workflowsSubTab: 'Fluxos de trabalho',
    pipelineSubTab: 'Pipeline',
    newBroadcast: 'Nova transmissão',
    noBroadcasts: 'Nenhuma transmissão ainda. Crie sua primeira campanha para alcançar seus leads.',
    campaignName: 'Nome da campanha',
    campaignNamePlaceholder: 'ex. Boas-vindas novos membros, Atualização semanal...',
    messageLabel: 'Mensagem',
    messagePlaceholder: 'Escreva sua mensagem de transmissão...',
    mergeTags: 'Tags de mesclagem',
    channelsLabel: 'Canais',
    emailChannel: 'E-mail',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(abre links wa.me)',
    telegramChannel: 'Telegram',
    telegramHint: '(requer configuração de bot)',
    audienceLabel: 'Público',
    audienceAll: 'Todos os meus leads',
    audienceVerified: 'Todos os membros verificados',
    audienceLast7: 'Leads dos últimos 7 dias',
    audienceLast30: 'Leads dos últimos 30 dias',
    previewLabel: 'Pré-visualização',
    scheduleLabel: 'Agendamento',
    sendNow: 'Enviar agora',
    scheduleLater: 'Agendar para depois',
    recipientCount: 'Esta transmissão será enviada para {0} destinatários',
    sendBroadcast: 'Enviar transmissão',
    confirmSendTitle: 'Confirmar transmissão',
    confirmSendMsg: 'Você está prestes a enviar para {0} destinatários via {1}. Confirmar?',
    confirmBtn: 'Confirmar e enviar',
    cancelBtn: 'Cancelar',
    broadcastSending: 'Enviando...',
    broadcastSent: 'Enviado',
    broadcastDraft: 'Rascunho',
    broadcastScheduled: 'Agendado',
    statsSent: 'Enviados',
    statsDelivered: 'Entregues',
    statsOpened: 'Abertos',
    statsClicked: 'Clicados',
    viewRecipients: 'Ver destinatários',
    backToBroadcasts: 'Voltar às transmissões',
    whatsappLinks: 'Links do WhatsApp',
    whatsappLinksDesc: 'Clique em cada link para enviar a mensagem via WhatsApp:',
    telegramComingSoon: 'Integração de bot do Telegram em breve',
    broadcastSuccess: 'Transmissão enviada com sucesso!',
    broadcastError: 'Falha ao enviar transmissão',
    wfNoWorkflows: 'Nenhum fluxo ainda. Comece com um modelo ou crie o seu.',
    wfNewWorkflow: 'Novo Fluxo',
    wfTemplateLibrary: 'Biblioteca de Modelos',
    wfActive: 'Ativo',
    wfDraft: 'Rascunho',
    wfPaused: 'Pausado',
    wfEnrolled: 'Inscritos',
    wfCompleted: 'Concluídos',
    wfCompletionRate: 'Conclusão',
    wfEditWorkflow: 'Editar Fluxo',
    wfWorkflowName: 'Nome do fluxo',
    wfWorkflowNamePh: 'ex. Sequência de boas-vindas, Onboarding...',
    wfDescription: 'Descrição',
    wfDescriptionPh: 'O que este fluxo faz?',
    wfTrigger: 'Gatilho',
    wfTriggerLeadSignup: 'Cadastro de lead',
    wfTriggerLeadInactive: 'Lead inativo',
    wfTriggerStageChange: 'Mudança de etapa',
    wfTriggerManual: 'Manual',
    wfTriggerScheduled: 'Agendado',
    wfInactiveDays: 'Dias inativo',
    wfSelectStage: 'Selecionar etapa',
    wfSteps: 'Etapas',
    wfAddStep: 'Adicionar etapa',
    wfStepEmail: 'Email',
    wfStepWait: 'Aguardar',
    wfStepCondition: 'Condição',
    wfStepSwitch: 'Trocar fluxo',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'Assunto',
    wfBody: 'Corpo',
    wfPreview: 'Pré-visualização',
    wfWaitValue: 'Aguardar',
    wfHours: 'horas',
    wfDays: 'dias',
    wfConditionIf: 'Se o lead',
    wfConditionOpened: 'abriu',
    wfConditionClicked: 'clicou',
    wfConditionNotOpened: 'não abriu',
    wfConditionEmail: 'email da etapa',
    wfConditionThen: 'Ir para etapa',
    wfConditionElse: 'Senão, ir para etapa',
    wfSwitchTo: 'Trocar para fluxo',
    wfSaveDraft: 'Salvar rascunho',
    wfActivate: 'Ativar',
    wfBackToWorkflows: 'Voltar aos fluxos',
    wfDeleteStep: 'Excluir',
    wfSelectStepType: 'Selecionar tipo de etapa',
    wfUseTemplate: 'Usar Modelo',
    wfCloseTemplates: 'Fechar',
    wfTemplateUsed: 'Modelo adicionado! Personalize antes de ativar.',
    wfSaved: 'Fluxo salvo!',
    wfActivated: 'Fluxo ativado!',
    wfDeactivated: 'Fluxo pausado.',
    wfSaveError: 'Falha ao salvar fluxo',
    wfEmailPreviewTitle: 'Pré-visualização do email',
    wfClose: 'Fechar',
  },
  th: {
    leadsTab: 'ลีด',
    profileTab: 'โปรไฟล์ของฉัน',
    registerLead: 'ลงทะเบียนลีดใหม่ด้วยตนเอง',
    fullName: 'ชื่อ-นามสกุล',
    emailAddress: 'อีเมล',
    uidPlaceholder: 'UID จากโบรกเกอร์ PuPrime',
    addLead: 'เพิ่มลีด',
    sending: 'กำลังส่ง...',
    pendingHeader: 'รอการยืนยัน',
    noPending: 'ไม่มีลีดรอดำเนินการ',
    approvedHeader: 'สมาชิกที่อนุมัติแล้ว',
    noApproved: 'ยังไม่มีสมาชิกที่อนุมัติ',
    approve: 'อนุมัติ',
    approvedDate: 'อนุมัติแล้ว',
    notProvided: 'ไม่ได้ระบุ',
    editProfile: 'แก้ไขโปรไฟล์',
    profileImage: 'รูปโปรไฟล์',
    uploadImage: 'อัปโหลดรูป',
    changeImage: 'เปลี่ยนรูป',
    uploading: 'กำลังอัปโหลด...',
    imageHint: 'JPG หรือ PNG · สูงสุด 5MB',
    yourUrl: 'URL ของคุณ',
    bio: 'ไบโอ',
    bioPlaceholder: 'บอกว่าคุณเป็นใครและสมาชิกของคุณจะได้อะไร...',
    saveProfile: 'บันทึกโปรไฟล์',
    saving: 'กำลังบันทึก...',
    saved: 'บันทึกแล้ว!',
    yourPage: 'หน้าของคุณ',
    viewPage: 'ดูหน้าของฉัน',
    sharePage: 'แชร์หน้าของฉัน',
    shareTitle: '— Primeverse Access',
    shareText: 'ดูหน้าของฉันบน Primeverse Access!',
    copyLink: 'คัดลอกลิงก์',
    copied: 'คัดลอกแล้ว!',
    shareVia: 'แชร์ผ่าน',
    selectLanguage: 'เลือกภาษา',
    logout: 'ออกจากระบบ',
    loading: 'กำลังโหลด...',
    aiHelper: 'AI ช่วยคุณ',
    aiTitle: 'ผู้ช่วย AI สร้างไบโอ',
    startAi: 'เริ่มผู้ช่วย AI',
    aiGenerating: 'กำลังสร้างไบโอของคุณ...',
    aiNext: 'ถัดไป',
    aiChooseTone: 'เลือกโทนสำหรับไบโอของคุณ:',
    aiPreview: 'ไบโอที่สร้างให้คุณ:',
    aiUseThis: 'ใช้อันนี้',
    aiRegenerate: 'สร้างใหม่',
    aiStartOver: 'เริ่มใหม่',
    aiOtherLangs: 'ดูในภาษาอื่น',
    aiStepOf: 'จาก',
    fillAll: 'กรุณากรอกข้อมูลทุกช่อง',
    referralRequired: 'ต้องกรอกช่องนี้',
    referralInvalid: 'รับเฉพาะลิงก์พาร์ทเนอร์ PuPrime เท่านั้น (ต้องขึ้นต้นด้วย https://puvip.co/la-partners/)',
    slugTaken: 'URL นี้ถูกใช้แล้ว กรุณาเลือกอันอื่น',
    socialMedia: 'โซเชียลมีเดีย',
    metricsTab: 'สถิติ',
    daily: 'รายวัน',
    weekly: 'รายสัปดาห์',
    monthly: 'รายเดือน',
    allTime: 'ทั้งหมด',
    pageViews: 'ยอดเข้าชม',
    uniqueVisitors: 'ผู้เยี่ยมชมที่ไม่ซ้ำ',
    conversions: 'การแปลง',
    rate: 'อัตรา',
    conversionRate: 'อัตราการแปลง',
    regToApproved: 'ลงทะเบียน → อนุมัติ',
    profileStrength: 'ความแข็งแกร่งของโปรไฟล์',
    customUrl: 'URL กำหนดเอง',
    referralLink: 'ลิงก์แนะนำ',
    approvalRate: 'อัตราการอนุมัติ',
    xOfYVerified: '{0} จาก {1} ยืนยันแล้ว',
    pageViewsOverTime: 'ยอดเข้าชมตามช่วงเวลา',
    leadBreakdown: 'รายละเอียดลีด',
    registeredLeads: 'ลีดที่ลงทะเบียน',
    pendingVerification: 'รอการยืนยัน',
    conversionRateLower: 'อัตราการแปลง',
    pending: 'รอดำเนินการ',
    approved: 'อนุมัติแล้ว',
    ibResourcesTab: 'ทรัพยากรการตลาด',
    ibResourcesSubtitle: 'เครื่องมือและการฝึกอบรมเพื่อช่วยให้คุณประสบความสำเร็จ',
    aiMarketingTools: 'เครื่องมือการตลาด AI',
    resourcesSection: 'ทรัพยากร',
    ibTraining: 'การฝึกอบรม IB',
    ibTrainingDesc: 'เข้าถึงสื่อการฝึกอบรมและคู่มือเพื่อเริ่มต้น',
    contentLibrary: 'คลังเนื้อหา',
    contentLibraryDesc: 'เรียกดูเนื้อหาการตลาด เทมเพลต และแรงบันดาลใจสำหรับโซเชียลมีเดียของคุณ',
    comingSoon: 'เร็วๆ นี้',
    vipSupport: 'ซัพพอร์ต VIP',
    vipSupportDesc: 'เข้าถึงซัพพอร์ต VIP โดยตรงสำหรับพาร์ทเนอร์ IB',
    pvPresentation: 'งานนำเสนอ PV',
    pvPresentationDesc: 'ดูงานนำเสนออย่างเป็นทางการของ PrimeVerse',
    postWriter: 'นักเขียนโพสต์',
    postWriterDesc: 'เครื่องมือสร้างโพสต์โซเชียลมีเดียด้วย AI สร้างโพสต์ที่น่าสนใจสำหรับ Facebook, Instagram, TikTok และอื่นๆ',
    captionGenerator: 'เครื่องสร้างแคปชั่น',
    captionGeneratorDesc: 'สร้างแคปชั่นที่ดึงดูดสายตาสำหรับรูปภาพและวิดีโอของคุณ',
    hashtagResearch: 'วิจัยแฮชแท็ก',
    hashtagResearchDesc: 'ค้นหาแฮชแท็กที่ดีที่สุดสำหรับกลุ่มเฉพาะของคุณเพื่อเพิ่มการเข้าถึง',
    contentCalendar: 'ปฏิทินเนื้อหา',
    contentCalendarDesc: 'รับตารางโพสต์รายสัปดาห์ที่เหมาะกับผู้ชมและเขตเวลาของคุณ',
    aiPowered: 'ขับเคลื่อนด้วย AI',
    selectPlatform: 'เลือกแพลตฟอร์ม',
    topicLabel: 'หัวข้อ / ผลิตภัณฑ์',
    topicPlaceholder: 'เช่น การศึกษาเทรด, Copy trading, อิสรภาพทางการเงิน...',
    toneLabel: 'โทน',
    toneProfessional: 'มืออาชีพ',
    toneCasual: 'สบายๆ',
    toneMotivational: 'สร้างแรงบันดาลใจ',
    toneEducational: 'ให้ความรู้',
    generatePost: 'สร้างโพสต์',
    generating: 'กำลังสร้าง...',
    regenerate: 'สร้างใหม่',
    copyText: 'คัดลอก',
    captionTopicPlaceholder: 'อธิบายรูปภาพหรือวิดีโอของคุณ...',
    captionStyle: 'สไตล์',
    styleEngaging: 'น่าสนใจ',
    styleInspirational: 'สร้างแรงบันดาลใจ',
    styleEducational: 'ให้ความรู้',
    styleHumorous: 'ตลก',
    generateCaption: 'สร้างแคปชั่น',
    emojiSuggestions: 'แนะนำอิโมจิ',
    nicheLabel: 'กลุ่มเฉพาะ / หัวข้อ',
    nichePlaceholder: 'เช่น เทรด Forex, คริปโต, การศึกษาทางการเงิน...',
    researchHashtags: 'วิจัยแฮชแท็ก',
    researching: 'กำลังวิจัย...',
    topHashtags: 'ยอดนิยม (แข่งขันสูง)',
    mediumHashtags: 'ปานกลาง (สมดุล)',
    nicheHashtags: 'เฉพาะกลุ่ม (แข่งขันต่ำ)',
    copyAll: 'คัดลอกทั้งหมด',
    youtubeUrl: 'YouTube URL',
    otherUrl: 'URL อื่น',
    updateInfo: 'อัปเดตข้อมูลของฉัน',
    updating: 'กำลังอัปเดต...',
    updated: 'อัปเดตแล้ว!',
    generatePage: 'สร้าง landing page ของฉัน',
    generatingPage: 'กำลังสร้างหน้าของคุณ...',
    pageIsLive: 'หน้าของคุณพร้อมใช้แล้ว!',
    dragToReposition: 'ลากเพื่อปรับตำแหน่ง',
    rememberToSave: 'อย่าลืมบันทึกหลังจากปรับตำแหน่ง',
    pageLiveAt: 'Landing page ของคุณพร้อมแล้วที่:',
    viewLandingPage: 'ดู landing page ของคุณ',
    yourPageAt: 'หน้าของคุณ:',
    aiDescription: 'ตอบ 5 คำถาม เลือกโทน แล้ว AI จะสร้างไบโอมืออาชีพให้คุณ — ในทุกภาษา',
    somethingWentWrong: 'เกิดข้อผิดพลาด',
    noDataYet: 'ยังไม่มีข้อมูล',
    errorPrefix: 'ข้อผิดพลาด: ',
    uploadErrorPrefix: 'ข้อผิดพลาดในการอัปโหลด: ',
    reportBug: 'รายงานบัก',
    bugModalTitle: 'รายงานบัก',
    bugModalInstructions: 'ช่วยเราปรับปรุง SYSTM8! กรุณาแนบภาพหน้าจอของปัญหา — รายงานที่ไม่มีภาพหน้าจอจะไม่ได้รับการดำเนินการ',
    bugWhatHappened: 'เกิดอะไรขึ้น?',
    bugWhatExpected: 'คุณคาดหวังว่าจะเกิดอะไรขึ้น?',
    bugWhichPage: 'คุณอยู่หน้าไหน?',
    bugPageDashboard: 'แดชบอร์ด',
    bugPageLanding: 'Landing page',
    bugPageLogin: 'เข้าสู่ระบบ',
    bugPageOther: 'อื่นๆ',
    bugScreenshot: 'ภาพหน้าจอ',
    bugScreenshotHint: 'PNG หรือ JPG · สูงสุด 5MB',
    bugScreenshotRequired: 'จำเป็นต้องแนบภาพหน้าจอ',
    bugSeverity: 'ความรุนแรง',
    bugSeverityCritical: 'วิกฤต',
    bugSeverityHigh: 'สูง',
    bugSeverityMedium: 'ปานกลาง',
    bugSeverityLow: 'ต่ำ',
    bugSend: 'ส่งรายงาน',
    bugCancel: 'ยกเลิก',
    bugSending: 'กำลังส่ง...',
    bugSuccess: 'ขอบคุณ! รายงานของคุณถูกส่งแล้ว',
    bugFillRequired: 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมดและแนบภาพหน้าจอ',
    betaTestTab: 'เบต้าเทสต์',
    betaTitle: 'SYSTM8 เบต้าเทสต์',
    betaSubtitle: 'คุณเป็นหนึ่งใน 18 เบต้าเทสเตอร์ที่ได้รับเลือก ความคิดเห็นของคุณกำหนดอนาคตของ SYSTM8',
    betaProgress: 'การทดสอบเสร็จสิ้น',
    betaPassed: 'ผ่าน',
    betaFailed: 'ไม่ผ่าน',
    betaRemaining: 'เหลือ',
    betaAddNote: 'เพิ่มบันทึก...',
    betaScreenshot: 'ภาพหน้าจอ',
    betaUntested: 'ยังไม่ทดสอบ',
    betaPass: 'ผ่าน',
    betaFail: 'ไม่ผ่าน',
    betaSubmitAll: 'ส่งผลลัพธ์ทั้งหมด',
    betaThankYou: 'การทดสอบเสร็จสิ้น ขอบคุณสำหรับการมีส่วนร่วมใน SYSTM8!',
    betaFoundingMember: 'เบต้าเทสเตอร์ — สมาชิกผู้ก่อตั้ง',
    betaBugTitle: 'ชื่อบัก',
    betaBugDesc: 'เกิดอะไรขึ้น?',
    betaBugSeverity: 'ความรุนแรง',
    betaBugSubmit: 'ส่งรายงานบัก',
    betaBugCritical: 'วิกฤต',
    betaBugMajor: 'สำคัญ',
    betaBugMinor: 'เล็กน้อย',
    betaBugCosmetic: 'เครื่องสำอาง',
    betaSec1: 'การลงทะเบียนและการยืนยัน',
    betaSec2: 'การตั้งค่าโปรไฟล์',
    betaSec3: 'ผู้ช่วย AI Bio',
    betaSec4: 'แลนดิ้งเพจ',
    betaSec5: 'การเปลี่ยนภาษา',
    betaSec6: 'การแชร์และ Lead',
    betaSec7: 'อีเมลอัตโนมัติ',
    betaSec8: 'ฟีเจอร์แดชบอร์ด',
    marketingTab: 'การตลาด',
    broadcastsSubTab: 'การส่งข้อความ',
    workflowsSubTab: 'เวิร์กโฟลว์',
    pipelineSubTab: 'ไปป์ไลน์',
    newBroadcast: 'ส่งข้อความใหม่',
    noBroadcasts: 'ยังไม่มีการส่งข้อความ สร้างแคมเปญแรกของคุณเพื่อเข้าถึงลีดของคุณ',
    campaignName: 'ชื่อแคมเปญ',
    campaignNamePlaceholder: 'เช่น ต้อนรับสมาชิกใหม่, อัปเดตประจำสัปดาห์...',
    messageLabel: 'ข้อความ',
    messagePlaceholder: 'เขียนข้อความของคุณ...',
    mergeTags: 'แท็กรวม',
    channelsLabel: 'ช่องทาง',
    emailChannel: 'อีเมล',
    whatsappChannel: 'WhatsApp',
    whatsappHint: '(เปิดลิงก์ wa.me)',
    telegramChannel: 'Telegram',
    telegramHint: '(ต้องตั้งค่าบอท)',
    audienceLabel: 'กลุ่มเป้าหมาย',
    audienceAll: 'ลีดทั้งหมดของฉัน',
    audienceVerified: 'สมาชิกที่ยืนยันแล้วทั้งหมด',
    audienceLast7: 'ลีดจาก 7 วันที่ผ่านมา',
    audienceLast30: 'ลีดจาก 30 วันที่ผ่านมา',
    previewLabel: 'ตัวอย่าง',
    scheduleLabel: 'กำหนดเวลา',
    sendNow: 'ส่งตอนนี้',
    scheduleLater: 'กำหนดเวลาภายหลัง',
    recipientCount: 'การส่งข้อความนี้จะส่งถึง {0} ผู้รับ',
    sendBroadcast: 'ส่งข้อความ',
    confirmSendTitle: 'ยืนยันการส่ง',
    confirmSendMsg: 'คุณกำลังจะส่งถึง {0} ผู้รับผ่าน {1} ยืนยัน?',
    confirmBtn: 'ยืนยันและส่ง',
    cancelBtn: 'ยกเลิก',
    broadcastSending: 'กำลังส่ง...',
    broadcastSent: 'ส่งแล้ว',
    broadcastDraft: 'ฉบับร่าง',
    broadcastScheduled: 'กำหนดเวลาแล้ว',
    statsSent: 'ส่งแล้ว',
    statsDelivered: 'ส่งถึงแล้ว',
    statsOpened: 'เปิดแล้ว',
    statsClicked: 'คลิกแล้ว',
    viewRecipients: 'ดูผู้รับ',
    backToBroadcasts: 'กลับไปที่การส่งข้อความ',
    whatsappLinks: 'ลิงก์ WhatsApp',
    whatsappLinksDesc: 'คลิกแต่ละลิงก์เพื่อส่งข้อความผ่าน WhatsApp:',
    telegramComingSoon: 'การเชื่อมต่อบอท Telegram เร็วๆ นี้',
    broadcastSuccess: 'ส่งข้อความสำเร็จ!',
    broadcastError: 'ส่งข้อความไม่สำเร็จ',
    wfNoWorkflows: 'ยังไม่มีเวิร์กโฟลว์ เริ่มจากเทมเพลตหรือสร้างเอง',
    wfNewWorkflow: 'เวิร์กโฟลว์ใหม่',
    wfTemplateLibrary: 'คลังเทมเพลต',
    wfActive: 'ใช้งาน',
    wfDraft: 'แบบร่าง',
    wfPaused: 'หยุดชั่วคราว',
    wfEnrolled: 'ลงทะเบียน',
    wfCompleted: 'เสร็จสิ้น',
    wfCompletionRate: 'ความสำเร็จ',
    wfEditWorkflow: 'แก้ไขเวิร์กโฟลว์',
    wfWorkflowName: 'ชื่อเวิร์กโฟลว์',
    wfWorkflowNamePh: 'เช่น ลำดับต้อนรับ, การเริ่มต้น...',
    wfDescription: 'คำอธิบาย',
    wfDescriptionPh: 'เวิร์กโฟลว์นี้ทำอะไร?',
    wfTrigger: 'ทริกเกอร์',
    wfTriggerLeadSignup: 'ลีดสมัคร',
    wfTriggerLeadInactive: 'ลีดไม่ใช้งาน',
    wfTriggerStageChange: 'เปลี่ยนขั้นตอน',
    wfTriggerManual: 'ด้วยตนเอง',
    wfTriggerScheduled: 'ตั้งเวลา',
    wfInactiveDays: 'วันที่ไม่ใช้งาน',
    wfSelectStage: 'เลือกขั้นตอน',
    wfSteps: 'ขั้นตอน',
    wfAddStep: 'เพิ่มขั้นตอน',
    wfStepEmail: 'อีเมล',
    wfStepWait: 'รอ',
    wfStepCondition: 'เงื่อนไข',
    wfStepSwitch: 'เปลี่ยนเวิร์กโฟลว์',
    wfStepWhatsApp: 'WhatsApp',
    wfStepTelegram: 'Telegram',
    wfSubject: 'หัวเรื่อง',
    wfBody: 'เนื้อหา',
    wfPreview: 'ดูตัวอย่าง',
    wfWaitValue: 'รอ',
    wfHours: 'ชั่วโมง',
    wfDays: 'วัน',
    wfConditionIf: 'ถ้าลีด',
    wfConditionOpened: 'เปิด',
    wfConditionClicked: 'คลิก',
    wfConditionNotOpened: 'ไม่เปิด',
    wfConditionEmail: 'อีเมลจากขั้นตอน',
    wfConditionThen: 'ไปขั้นตอน',
    wfConditionElse: 'ไม่เช่นนั้นไปขั้นตอน',
    wfSwitchTo: 'เปลี่ยนไปเวิร์กโฟลว์',
    wfSaveDraft: 'บันทึกแบบร่าง',
    wfActivate: 'เปิดใช้งาน',
    wfBackToWorkflows: 'กลับ',
    wfDeleteStep: 'ลบ',
    wfSelectStepType: 'เลือกประเภทขั้นตอน',
    wfUseTemplate: 'ใช้เทมเพลต',
    wfCloseTemplates: 'ปิด',
    wfTemplateUsed: 'เพิ่มเทมเพลตแล้ว! ปรับแต่งก่อนเปิดใช้งาน',
    wfSaved: 'บันทึกเวิร์กโฟลว์แล้ว!',
    wfActivated: 'เปิดใช้งานเวิร์กโฟลว์แล้ว!',
    wfDeactivated: 'หยุดเวิร์กโฟลว์ชั่วคราว',
    wfSaveError: 'ไม่สามารถบันทึกเวิร์กโฟลว์',
    wfEmailPreviewTitle: 'ดูตัวอย่างอีเมล',
    wfClose: 'ปิด',
  },
}

const languageLabels: Record<string, string> = {
  en: 'English',
  no: 'Norsk',
  sv: 'Svenska',
  es: 'Español',
  ru: 'Русский',
  ar: 'العربية',
  tl: 'Tagalog',
  pt: 'Português',
  th: 'ไทย',
}

const languageFlags: Record<string, string> = {
  en: '\u{1F1EC}\u{1F1E7}',
  no: '\u{1F1F3}\u{1F1F4}',
  sv: '\u{1F1F8}\u{1F1EA}',
  es: '\u{1F1EA}\u{1F1F8}',
  ru: '\u{1F1F7}\u{1F1FA}',
  ar: '\u{1F1F8}\u{1F1E6}',
  tl: '\u{1F1F5}\u{1F1ED}',
  pt: '\u{1F1E7}\u{1F1F7}',
  th: '\u{1F1F9}\u{1F1ED}',
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --gold-light: #e8c975;
    --gold: #d4a537;
    --gold-dark: #a07818;
    --gold-deep: #7a5c12;
    --marble-dark: #0a0a0a;
    --card-bg: rgba(8, 8, 8, 0.75);
    --card-border: rgba(212, 165, 55, 0.15);
    --text-primary: #f0e6d0;
    --text-secondary: #9a917e;
    --text-dim: #5a5347;
    --input-bg: rgba(20, 18, 14, 0.8);
    --input-border: rgba(212, 165, 55, 0.2);
    --input-focus: rgba(212, 165, 55, 0.5);
    --success-bg: rgba(74, 157, 90, 0.1);
    --success-border: rgba(74, 157, 90, 0.25);
    --success-text: #6dc07f;
    --warning-bg: rgba(212, 165, 55, 0.08);
    --warning-border: rgba(212, 165, 55, 0.2);
    --warning-text: var(--gold-light);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body, html {
    min-height: 100vh;
    font-family: 'Outfit', sans-serif;
    background: var(--marble-dark);
    color: var(--text-primary);
  }

  .marble-bg {
    position: fixed; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 80% at 20% 30%, rgba(30, 25, 18, 0.9) 0%, transparent 60%),
      radial-gradient(ellipse 100% 120% at 80% 70%, rgba(25, 20, 14, 0.8) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(35, 28, 18, 0.5) 0%, transparent 50%),
      linear-gradient(137deg, transparent 30%, rgba(212,165,55,0.03) 32%, transparent 34%),
      linear-gradient(217deg, transparent 45%, rgba(212,165,55,0.04) 47%, transparent 49%),
      linear-gradient(352deg, transparent 55%, rgba(180,140,45,0.03) 57%, transparent 59%),
      linear-gradient(78deg, transparent 20%, rgba(160,120,24,0.025) 22%, transparent 24%),
      linear-gradient(195deg, transparent 65%, rgba(212,165,55,0.03) 66.5%, transparent 68%),
      linear-gradient(142deg, transparent 40%, rgba(255,255,255,0.012) 40.2%, transparent 40.4%),
      linear-gradient(320deg, transparent 25%, rgba(255,255,255,0.01) 25.15%, transparent 25.3%),
      radial-gradient(ellipse 150% 100% at 50% 50%, #0d0b08 0%, #070605 100%);
  }
  .marble-bg::before {
    content: ''; position: absolute; inset: 0;
    background:
      linear-gradient(165deg, transparent 28%, rgba(212,165,55,0.02) 28.5%, transparent 29%),
      linear-gradient(245deg, transparent 52%, rgba(200,155,50,0.025) 52.8%, transparent 53.5%),
      linear-gradient(10deg, transparent 70%, rgba(180,135,40,0.02) 70.3%, transparent 70.6%);
    opacity: 0.8;
  }
  .marble-bg::after {
    content: ''; position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 200px 200px; opacity: 0.5;
  }

  .dash-wrap {
    position: relative; z-index: 1;
    max-width: 960px; margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  /* Header */
  .dash-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2rem; padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--card-border);
  }
  .dash-header-left { display: flex; align-items: center; gap: 14px; }
  /* SYSTM8 Logo */
  .systm8-logo {
    width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
    border: 1.5px solid var(--gold-dark);
    box-shadow: 0 2px 16px rgba(212,165,55,0.25), 0 0 24px rgba(212,165,55,0.08);
    flex-shrink: 0;
    transition: box-shadow 0.3s ease;
  }
  .systm8-logo:hover {
    box-shadow: 0 2px 20px rgba(212,165,55,0.4), 0 0 32px rgba(212,165,55,0.15);
  }
  .header-divider {
    width: 1px; height: 32px;
    background: linear-gradient(to bottom, transparent, var(--card-border), transparent);
    flex-shrink: 0;
  }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 2px 12px rgba(212,165,55,0.15);
  }
  .avatar-placeholder {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(212,165,55,0.1); border: 2px solid var(--gold-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: var(--gold);
  }
  .dash-username {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem; font-weight: 600;
    color: var(--text-primary); letter-spacing: 0.02em;
  }
  .dash-email { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .header-actions { display: flex; gap: 10px; align-items: center; }

  /* Language selector — trigger button */
  .lang-trigger {
    background: none; border: 1px solid rgba(212,165,55,0.15);
    color: var(--text-secondary); padding: 0.3rem 0.5rem; border-radius: 8px;
    cursor: pointer; transition: all 0.3s; backdrop-filter: blur(10px);
    display: flex; align-items: center; gap: 0.3rem; line-height: 1;
  }
  .lang-trigger:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }
  .lang-trigger svg { width: 14px; height: 14px; opacity: 0.5; flex-shrink: 0; }
  .lang-trigger:hover svg { opacity: 0.8; }
  .lang-trigger .lang-flag { font-size: 1rem; line-height: 1; }

  /* Language modal overlay */
  .lang-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    animation: langFadeIn 0.2s ease;
  }
  @keyframes langFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .lang-modal {
    background: #1A1A2E; border: 1px solid rgba(212,165,55,0.25);
    border-radius: 16px; padding: 1.2rem 0.5rem; min-width: 240px; max-width: 90vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    animation: langSlideUp 0.2s ease;
  }
  @keyframes langSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .lang-modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600;
    color: var(--gold-light); text-align: center; padding: 0 0.7rem 0.7rem;
    border-bottom: 1px solid rgba(212,165,55,0.1); margin-bottom: 0.3rem;
  }
  .lang-modal-option {
    display: flex; align-items: center; gap: 0.7rem;
    width: 100%; background: none; border: none;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; padding: 0.6rem 1rem; text-align: left;
    cursor: pointer; transition: all 0.15s; border-radius: 8px; margin: 0 0.2rem;
  }
  .lang-modal-option:hover { background: rgba(212,165,55,0.1); color: var(--gold-light); }
  .lang-modal-option-active { color: var(--gold); background: rgba(212,165,55,0.07); }
  .lang-modal-option .lang-flag { font-size: 1.15rem; line-height: 1; }
  .lang-modal-option .lang-check { margin-left: auto; opacity: 0.7; font-size: 0.75rem; color: var(--gold); }

  /* Logout link in header */
  .logout-link {
    background: none; border: none; color: var(--text-dim);
    font-family: 'Outfit', sans-serif; font-size: 0.72rem;
    cursor: pointer; transition: color 0.2s; padding: 0;
    text-decoration: none; white-space: nowrap;
  }
  .logout-link:hover { color: var(--gold-light); }

  /* Share dropdown */
  .share-wrapper { position: relative; }
  .share-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    background: rgba(15,13,10,0.95); border: 1px solid rgba(212,165,55,0.2);
    border-radius: 8px; overflow: hidden; min-width: 180px;
    backdrop-filter: blur(20px); box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    z-index: 50; animation: dropIn 0.2s ease;
  }
  .share-option {
    display: flex; align-items: center; gap: 0.6rem; width: 100%;
    background: none; border: none; color: var(--text-secondary);
    font-family: 'Outfit', sans-serif; font-size: 0.82rem;
    padding: 0.6rem 0.9rem; text-align: left; cursor: pointer;
    transition: all 0.2s; text-decoration: none;
  }
  .share-option:hover { background: rgba(212,165,55,0.08); color: var(--gold-light); }
  .share-option svg { flex-shrink: 0; opacity: 0.7; }
  .share-option:hover svg { opacity: 1; }

  /* Brushed Gold Buttons */
  .gold-btn {
    position: relative; padding: 0.7rem 1.4rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer;
    overflow: hidden; color: #0a0804; text-decoration: none;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: linear-gradient(135deg, #c9a227 0%, #e8c975 15%, #d4a537 30%, #b8922a 45%, #e8c975 55%, #d4a537 70%, #c9a227 85%, #dbb84c 100%);
    background-size: 200% 200%;
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 4px 16px rgba(160,120,24,0.25), 0 1px 3px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .gold-btn::before {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px);
    border-radius: inherit; pointer-events: none;
  }
  .gold-btn::after {
    content: ''; position: absolute; top: -50%; left: -75%; width: 50%; height: 200%;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 58%, transparent 70%);
    transform: skewX(-20deg); transition: left 0.7s ease; pointer-events: none;
  }
  .gold-btn:hover::after { left: 125%; }
  .gold-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 8px 28px rgba(160,120,24,0.35), 0 2px 6px rgba(0,0,0,0.3);
  }
  .gold-btn:active { transform: translateY(0.5px); }
  .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .gold-btn:disabled::after { display: none; }
  .gold-btn-sm { padding: 0.5rem 1rem; font-size: 0.78rem; }

  .btn-outline {
    padding: 0.55rem 1.1rem; background: transparent;
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-family: 'Outfit', sans-serif;
    font-size: 0.82rem; cursor: pointer; transition: all 0.3s;
  }
  .btn-outline:hover { border-color: rgba(212,165,55,0.4); color: var(--gold-light); }

  .btn-success {
    padding: 0.6rem 1.2rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #fff;
    background: linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #2e7d32 100%);
    box-shadow: 0 2px 10px rgba(46,125,50,0.3);
    transition: transform 0.2s, box-shadow 0.3s;
  }
  .btn-success:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(46,125,50,0.4); }
  .btn-success:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Tabs */
  .tabs { display: flex; margin-bottom: 2rem; border-bottom: 1px solid var(--card-border); overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn {
    padding: 0.75rem 1.5rem; background: none; border: none;
    font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 400;
    color: var(--text-secondary); cursor: pointer; white-space: nowrap;
    border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.3s;
  }
  .tab-btn:hover { color: var(--gold-light); }
  .tab-btn-active { color: var(--gold); border-bottom-color: var(--gold); font-weight: 600; }

  /* IB Resources */
  .ib-resources-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  @media (max-width: 640px) { .ib-resources-grid { grid-template-columns: 1fr; } }
  .ib-resource-card {
    position: relative; display: flex; align-items: flex-start; gap: 1rem;
    background: #141414; border: 1px solid rgba(212,165,55,0.25); border-radius: 12px;
    padding: 1.5rem; text-decoration: none; color: inherit;
    transition: box-shadow 0.3s, border-color 0.3s; cursor: pointer;
  }
  .ib-resource-card:hover {
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(212,165,55,0.15), 0 0 40px rgba(212,165,55,0.06);
  }
  .ib-resource-card-disabled {
    opacity: 0.55; cursor: default; pointer-events: none;
  }
  .ib-resource-badge {
    position: absolute; top: 12px; right: 12px;
    background: rgba(212,165,55,0.15); color: var(--gold); border: 1px solid rgba(212,165,55,0.3);
    border-radius: 6px; padding: 2px 8px; font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.03em;
  }
  .ib-resource-icon {
    flex-shrink: 0; width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(212,165,55,0.1); border-radius: 10px; color: var(--gold);
  }
  .ib-resource-text { flex: 1; min-width: 0; }
  .ib-resource-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.3rem; }
  .ib-resource-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; }
  .ib-resource-arrow {
    flex-shrink: 0; color: var(--gold); font-size: 1.1rem; margin-top: 0.15rem;
    transition: transform 0.2s;
  }
  .ib-resource-card:hover .ib-resource-arrow { transform: translateX(3px); }

  /* AI Marketing Section */
  .ai-section-header {
    font-size: 1.1rem; font-weight: 700; color: var(--gold);
    margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .ai-section-header svg { flex-shrink: 0; }
  .ai-tool-badge {
    display: inline-block; font-size: 0.65rem; font-weight: 600;
    padding: 2px 7px; border-radius: 5px; letter-spacing: 0.03em;
    vertical-align: middle; margin-left: 6px;
  }
  .ai-tool-badge-gold {
    background: rgba(212,165,55,0.15); color: var(--gold);
    border: 1px solid rgba(212,165,55,0.3);
  }

  /* AI Tool Modal */
  .ai-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: fadeIn 0.2s;
  }
  .ai-modal {
    background: #111; border: 1px solid rgba(212,165,55,0.25);
    border-radius: 16px; width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto; padding: 2rem;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,165,55,0.08);
  }
  .ai-modal-title {
    font-size: 1.15rem; font-weight: 700; color: var(--gold);
    margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .ai-modal-close {
    margin-left: auto; background: none; border: none; color: var(--text-secondary);
    font-size: 1.3rem; cursor: pointer; padding: 4px; line-height: 1;
  }
  .ai-modal-close:hover { color: var(--text-primary); }
  .ai-modal-field { margin-bottom: 1rem; }
  .ai-modal-label {
    display: block; font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.4rem;
  }
  .ai-modal-select {
    width: 100%; padding: 0.6rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239a917e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
  .ai-modal-select:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .ai-pill-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .ai-pill {
    padding: 0.4rem 0.9rem; border-radius: 20px; font-size: 0.82rem;
    border: 1px solid var(--input-border); background: var(--input-bg);
    color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
  }
  .ai-pill:hover { border-color: rgba(212,165,55,0.4); color: var(--text-primary); }
  .ai-pill-active {
    background: rgba(212,165,55,0.15); border-color: var(--gold);
    color: var(--gold); font-weight: 500;
  }
  .ai-result-box {
    background: rgba(20,18,14,0.8); border: 1px solid rgba(212,165,55,0.2);
    border-radius: 10px; padding: 1.25rem; margin-top: 1rem;
    white-space: pre-wrap; line-height: 1.6; font-size: 0.9rem;
    color: var(--text-primary);
  }
  .ai-result-actions {
    display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;
  }
  .ai-hashtag-group { margin-bottom: 1rem; }
  .ai-hashtag-group-title {
    font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ai-hashtag-tags {
    display: flex; flex-wrap: wrap; gap: 0.35rem;
  }
  .ai-hashtag-tag {
    background: rgba(212,165,55,0.08); border: 1px solid rgba(212,165,55,0.2);
    border-radius: 6px; padding: 3px 8px; font-size: 0.8rem;
    color: var(--gold-light);
  }
  .ai-copy-btn {
    background: none; border: 1px solid rgba(212,165,55,0.3); border-radius: 6px;
    color: var(--gold); font-size: 0.75rem; padding: 2px 8px; cursor: pointer;
    transition: all 0.2s;
  }
  .ai-copy-btn:hover { background: rgba(212,165,55,0.1); }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* Broadcast / Marketing */
  .bc-sub-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .bc-sub-tab {
    padding: 0.45rem 1rem; border-radius: 20px; font-size: 0.82rem;
    border: 1px solid var(--input-border); background: transparent;
    color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
    font-family: 'Outfit', sans-serif; position: relative;
  }
  .bc-sub-tab:hover { border-color: rgba(212,165,55,0.4); color: var(--text-primary); }
  .bc-sub-tab-active {
    background: rgba(212,165,55,0.15); border-color: var(--gold);
    color: var(--gold); font-weight: 500;
  }
  .bc-sub-tab-badge {
    font-size: 0.6rem; background: rgba(212,165,55,0.15); color: var(--gold);
    border: 1px solid rgba(212,165,55,0.3); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; vertical-align: 1px;
  }
  .bc-card {
    background: #141414; border: 1px solid rgba(212,165,55,0.2);
    border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem;
    cursor: pointer; transition: border-color 0.3s;
  }
  .bc-card:hover { border-color: var(--gold); }
  .bc-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
  .bc-card-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
  .bc-status {
    font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 10px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .bc-status-sent { background: rgba(74,157,90,0.15); color: #6dc07f; }
  .bc-status-draft { background: rgba(150,150,150,0.15); color: #999; }
  .bc-status-scheduled { background: rgba(100,149,237,0.15); color: #6495ed; }
  .bc-status-sending { background: rgba(212,165,55,0.15); color: var(--gold); }
  .bc-card-meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.78rem; color: var(--text-secondary); }
  .bc-card-meta svg { vertical-align: -2px; margin-right: 3px; }
  .bc-stats-row { display: flex; gap: 1.25rem; margin-top: 0.75rem; flex-wrap: wrap; }
  .bc-stat { text-align: center; }
  .bc-stat-value { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
  .bc-stat-label { font-size: 0.68rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
  .bc-open-bar {
    height: 6px; background: #2a2a4a; border-radius: 3px; overflow: hidden; margin-top: 0.5rem;
  }
  .bc-open-bar-fill { height: 100%; background: var(--gold); border-radius: 3px; transition: width 0.5s; }
  .bc-composer-section { margin-bottom: 1.5rem; }
  .bc-composer-label {
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem;
  }
  .bc-merge-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
  .bc-merge-chip {
    background: rgba(212,165,55,0.1); border: 1px solid rgba(212,165,55,0.25);
    border-radius: 6px; padding: 3px 10px; font-size: 0.75rem; color: var(--gold);
    cursor: pointer; font-family: monospace; transition: all 0.2s;
  }
  .bc-merge-chip:hover { background: rgba(212,165,55,0.2); border-color: var(--gold); }
  .bc-channel-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .bc-channel-opt {
    display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem;
    border-radius: 8px; border: 1px solid var(--input-border);
    background: var(--input-bg); cursor: pointer; transition: all 0.2s;
    font-size: 0.85rem; color: var(--text-secondary);
  }
  .bc-channel-opt:hover { border-color: rgba(212,165,55,0.4); }
  .bc-channel-active { border-color: var(--gold); background: rgba(212,165,55,0.1); color: var(--gold); }
  .bc-channel-hint { font-size: 0.7rem; color: var(--text-dim); margin-left: 2px; }
  .bc-audience-row { display: flex; flex-direction: column; gap: 0.5rem; }
  .bc-audience-opt {
    display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem;
    border-radius: 8px; border: 1px solid var(--input-border);
    background: var(--input-bg); cursor: pointer; font-size: 0.85rem;
    color: var(--text-secondary); transition: all 0.2s;
  }
  .bc-audience-opt:hover { border-color: rgba(212,165,55,0.4); }
  .bc-audience-active { border-color: var(--gold); background: rgba(212,165,55,0.1); color: var(--gold); }
  .bc-preview-box {
    background: rgba(20,18,14,0.8); border: 1px solid rgba(212,165,55,0.15);
    border-radius: 10px; padding: 1.25rem; white-space: pre-wrap;
    line-height: 1.6; font-size: 0.88rem; color: var(--text-primary);
  }
  .bc-schedule-toggle { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .bc-recipient-count {
    text-align: center; padding: 0.75rem; background: rgba(212,165,55,0.06);
    border: 1px solid rgba(212,165,55,0.15); border-radius: 8px;
    font-size: 0.88rem; color: var(--gold-light); margin-bottom: 1rem;
  }
  .bc-empty {
    text-align: center; padding: 3rem 1rem; color: var(--text-secondary);
    font-size: 0.9rem;
  }
  .bc-confirm-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: fadeIn 0.2s;
  }
  .bc-confirm-box {
    background: #111; border: 1px solid rgba(212,165,55,0.25);
    border-radius: 16px; padding: 2rem; max-width: 440px; width: 100%;
    text-align: center;
  }
  .bc-wa-list { list-style: none; padding: 0; margin: 0.5rem 0; }
  .bc-wa-list li {
    margin-bottom: 0.5rem; padding: 0.5rem 0.75rem;
    background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2);
    border-radius: 8px;
  }
  .bc-wa-list a { color: #25D366; text-decoration: none; font-size: 0.85rem; }
  .bc-wa-list a:hover { text-decoration: underline; }
  .bc-detail-recipient {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.85rem;
  }

  /* Cards */
  .card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 12px; padding: 1.75rem; backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.25);
    margin-bottom: 1.5rem;
  }
  .card-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem;
    font-weight: 600; color: var(--text-primary);
    margin-bottom: 1.25rem; letter-spacing: 0.03em;
  }

  /* Inputs */
  .field-input {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-input::placeholder { color: var(--text-dim); }
  .field-input:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .field-textarea {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 8px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.9rem; outline: none; resize: vertical; line-height: 1.65;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .field-textarea::placeholder { color: var(--text-dim); }
  .field-textarea:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .field-label {
    display: block; font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.4rem;
  }
  .field-group { margin-bottom: 1rem; }

  /* Lead items */
  .lead-item {
    background: rgba(15,13,10,0.5); border: 1px solid var(--card-border);
    border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 0.6rem;
    display: flex; justify-content: space-between; align-items: center;
    transition: border-color 0.3s;
  }
  .lead-item:hover { border-color: rgba(212,165,55,0.25); }
  .lead-item-pending { border-left: 3px solid var(--gold); }
  .lead-item-approved { border-left: 3px solid var(--success-text); }
  .lead-name { font-weight: 600; font-size: 0.92rem; color: var(--text-primary); }
  .lead-detail { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
  .lead-uid { font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }
  .lead-uid strong { color: var(--text-secondary); }
  .lead-date { font-size: 0.72rem; color: var(--text-dim); margin-top: 4px; }

  .section-header {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;
    display: flex; align-items: center; gap: 10px;
  }
  .badge {
    font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600;
    padding: 2px 10px; border-radius: 10px;
  }
  .badge-warning { background: var(--warning-bg); color: var(--warning-text); border: 1px solid var(--warning-border); }
  .badge-success { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-border); }
  .empty-text { color: var(--text-dim); font-size: 0.85rem; }

  /* Profile */
  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }

  .upload-area {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(212,165,55,0.06); border: 2px dashed rgba(212,165,55,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; overflow: hidden; flex-shrink: 0; transition: border-color 0.3s;
  }
  .upload-area:hover { border-color: var(--gold); }
  .upload-area img { width: 100%; height: 100%; object-fit: cover; }

  .url-input-wrap {
    display: flex; align-items: center;
    border: 1px solid var(--input-border); border-radius: 8px;
    overflow: hidden; background: var(--input-bg);
  }
  .url-prefix {
    padding: 0.7rem; background: rgba(212,165,55,0.06);
    color: var(--text-dim); font-size: 0.75rem;
    border-right: 1px solid var(--input-border); white-space: nowrap;
  }
  .url-input-wrap input {
    flex: 1; padding: 0.7rem 0.75rem; background: transparent;
    border: none; outline: none; color: var(--text-primary);
    font-family: 'Outfit', sans-serif; font-size: 0.9rem;
  }
  .url-input-wrap:focus-within { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }

  /* AI Chat */
  .ai-panel {
    border: 1px solid var(--card-border); border-radius: 12px;
    overflow: hidden; display: flex; flex-direction: column;
    backdrop-filter: blur(24px);
  }
  .ai-header {
    padding: 0.85rem 1.1rem; background: rgba(15,12,8,0.9);
    border-bottom: 1px solid var(--card-border);
    font-size: 0.82rem; font-weight: 600; color: var(--text-primary);
    display: flex; align-items: center; gap: 8px;
  }
  .ai-header .sparkle { color: var(--gold); font-size: 1rem; }
  .ai-header .powered { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); font-weight: 400; }
  .ai-body {
    padding: 1.25rem; background: rgba(8,8,6,0.5);
  }
  .ai-step-indicator {
    display: flex; gap: 6px; margin-bottom: 1.2rem;
  }
  .ai-step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--card-border); transition: background 0.3s;
  }
  .ai-step-dot.active { background: var(--gold); }
  .ai-step-dot.done { background: rgba(212,165,55,0.4); }
  .ai-question {
    font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;
    margin-bottom: 1rem; font-weight: 500;
  }
  .ai-question-count {
    font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.5rem;
  }
  .ai-textarea {
    width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg);
    border: 1px solid var(--input-border); border-radius: 10px;
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.84rem; outline: none; resize: vertical; min-height: 70px;
    line-height: 1.6; box-sizing: border-box;
  }
  .ai-textarea:focus { border-color: var(--input-focus); }
  .ai-next-btn {
    margin-top: 0.8rem; padding: 0.6rem 1.6rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-next-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .ai-tone-grid {
    display: flex; gap: 0.6rem; flex-wrap: wrap;
  }
  .ai-tone-btn {
    flex: 1; min-width: 100px; padding: 0.9rem 0.6rem; border-radius: 10px;
    border: 1px solid var(--card-border); background: rgba(15,13,10,0.6);
    color: var(--text-primary); font-family: 'Outfit', sans-serif;
    font-size: 0.84rem; font-weight: 500; cursor: pointer;
    text-align: center; transition: all 0.3s;
  }
  .ai-tone-btn:hover { border-color: var(--gold); background: rgba(212,165,55,0.08); }
  .ai-tone-emoji { font-size: 1.4rem; display: block; margin-bottom: 0.4rem; }
  .ai-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 2.5rem 1rem; text-align: center;
  }
  .ai-spinner {
    width: 36px; height: 36px; border: 3px solid var(--card-border);
    border-top-color: var(--gold); border-radius: 50%;
    animation: spin 0.8s linear infinite; margin-bottom: 1rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .ai-preview-bio {
    background: rgba(15,13,10,0.6); border: 1px solid var(--card-border);
    border-radius: 10px; padding: 1rem 1.1rem; font-size: 0.86rem;
    line-height: 1.7; color: var(--text-primary); margin-bottom: 1rem;
    white-space: pre-wrap;
  }
  .ai-btn-row {
    display: flex; gap: 0.6rem; flex-wrap: wrap;
  }
  .ai-btn-primary {
    padding: 0.6rem 1.4rem; border: none; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; color: #0a0804;
    background: linear-gradient(135deg, #c9a227, #e8c975, #d4a537);
    transition: opacity 0.2s;
  }
  .ai-btn-secondary {
    padding: 0.6rem 1.4rem; border: 1px solid var(--card-border); border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 0.82rem; font-weight: 500;
    cursor: pointer; color: var(--text-secondary); background: transparent;
    transition: all 0.2s;
  }
  .ai-btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
  .ai-lang-toggle {
    margin-top: 0.8rem; padding: 0; border: none; background: none;
    color: var(--text-dim); font-size: 0.78rem; cursor: pointer;
    font-family: 'Outfit', sans-serif; text-decoration: underline;
    text-underline-offset: 2px;
  }
  .ai-lang-toggle:hover { color: var(--gold); }
  .ai-lang-list {
    margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem;
  }
  .ai-lang-item {
    background: rgba(15,13,10,0.4); border: 1px solid var(--card-border);
    border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.8rem;
    color: var(--text-secondary); line-height: 1.6;
  }
  .ai-lang-item strong {
    color: var(--gold); font-weight: 600; display: block;
    margin-bottom: 0.25rem; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ai-placeholder {
    background: rgba(15,13,10,0.4); border: 1px dashed var(--card-border);
    border-radius: 12px; padding: 2.5rem; text-align: center;
    height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .ai-placeholder .sparkle-big { font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--gold); }
  .ai-placeholder h3 {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 0.6rem;
  }
  .ai-placeholder p {
    font-size: 0.82rem; color: var(--text-secondary);
    line-height: 1.7; margin-bottom: 1.25rem; max-width: 260px;
  }

  .gold-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
  .gold-link:hover { color: var(--gold-light); text-decoration: underline; }

  .profile-saved-text { text-align: center; margin-top: 0.75rem; font-size: 0.82rem; color: var(--text-secondary); }

  .loading-screen { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; gap: 16px; }
  .loading-logo {
    width: 64px; height: 64px; border-radius: 50%; object-fit: cover;
    border: 2px solid var(--gold-dark);
    box-shadow: 0 4px 24px rgba(212,165,55,0.3);
    animation: logoPulse 2s ease infinite;
  }
  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 4px 24px rgba(212,165,55,0.2); transform: scale(1); }
    50% { box-shadow: 0 4px 36px rgba(212,165,55,0.45); transform: scale(1.03); }
  }
  .loading-text {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem;
    color: var(--gold); letter-spacing: 0.1em; animation: pulse 1.5s ease infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

  /* ── Metrics Redesign ───────────────────────────────────────────────── */
  .metric-cards-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 2rem;
  }
  .metric-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(24px); position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .metric-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .metric-card-label {
    font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 0.75rem; font-weight: 500;
  }
  .metric-card-value {
    font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 600;
    color: var(--text-primary); line-height: 1;
  }
  .metric-card-change {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 0.7rem; font-weight: 600; margin-top: 0.5rem;
    padding: 2px 8px; border-radius: 12px;
  }
  .metric-card-change.up { color: #6dc07f; background: rgba(109,192,127,0.1); }
  .metric-card-change.down { color: #e85555; background: rgba(232,85,85,0.1); }
  .metric-card-change.neutral { color: var(--text-dim); background: rgba(255,255,255,0.05); }
  .metric-card-sub { font-size: 0.68rem; color: var(--text-dim); margin-top: 0.25rem; }

  /* Rolex-inspired gauges */
  .gauges-row {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 2rem;
  }
  .rolex-gauge-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem 1rem 1.25rem;
    backdrop-filter: blur(24px); display: flex; flex-direction: column;
    align-items: center; text-align: center; position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .rolex-gauge-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .rolex-gauge-wrap {
    position: relative; width: 220px; height: 220px;
  }
  .rolex-gauge-bezel {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    border-radius: 50%;
    background: #141414;
    border: 4px solid transparent;
    background-clip: padding-box;
    box-shadow:
      inset 0 0 20px rgba(0,0,0,0.5),
      0 0 15px rgba(212,165,55,0.15);
  }
  .rolex-gauge-bezel::before {
    content: ''; position: absolute; inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8B6914, #d4a537, #F5D77A, #d4a537, #8B6914);
    z-index: -1;
  }
  .rolex-gauge-overlay {
    position: absolute; inset: 0;
  }
  .rolex-gauge-number {
    position: absolute;
    font-family: Georgia, serif; font-size: 11px; font-weight: 700;
    color: #d4a537; text-shadow: 0 0 6px rgba(212,165,55,0.3);
    pointer-events: none;
    line-height: 1; text-align: center; white-space: nowrap;
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 16px;
    margin-left: -12px; margin-top: -8px;
  }
  .rolex-gauge-inner-ring {
    position: absolute; top: 7.5%; left: 7.5%; width: 85%; height: 85%;
    border-radius: 50%; border: 1px solid rgba(212,165,55,0.3);
    pointer-events: none;
  }
  .rolex-gauge-center {
    position: absolute; top: 50%; left: 50%;
    width: 16px; height: 16px; transform: translate(-50%, -50%);
    border-radius: 50%; z-index: 3;
    background: radial-gradient(circle at 35% 35%, #f5d77a, #d4a537 50%, #8b6914);
    box-shadow: 0 0 8px rgba(212,165,55,0.5);
  }
  .rolex-gauge-needle-g {
    transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: 50% 50%;
  }
  .rolex-gauge-title-text {
    font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
    color: #888; margin-top: 0.6rem; font-weight: 500;
  }
  .rolex-gauge-value {
    font-family: Georgia, serif; font-size: 28px; font-weight: 700;
    color: #d4a537; line-height: 1; margin-top: 0.25rem;
    text-shadow: 0 0 10px rgba(212,165,55,0.2);
  }
  .rolex-gauge-sub { font-size: 11px; color: #555; margin-top: 4px; }

  /* Chart section */
  .chart-section {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(24px); position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(212,165,55,0.04) inset, 0 12px 40px rgba(0,0,0,0.35);
  }
  .chart-section::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .chart-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .chart-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600;
    color: var(--text-primary);
  }
  .chart-tabs { display: flex; gap: 4px; }
  .chart-tab {
    padding: 4px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--card-border); background: transparent;
    color: var(--text-dim); font-family: 'Outfit', sans-serif; transition: all 0.2s;
  }
  .chart-tab:hover { color: var(--text-secondary); border-color: rgba(212,165,55,0.3); }
  .chart-tab-active {
    background: rgba(212,165,55,0.1); border-color: rgba(212,165,55,0.4);
    color: var(--gold);
  }
  .chart-svg { width: 100%; height: 200px; }
  .chart-grid-line { stroke: rgba(212,165,55,0.06); stroke-width: 1; }
  .chart-line { fill: none; stroke: var(--gold); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .chart-area { fill: url(#chartGradient); }
  .chart-dot { fill: var(--gold); filter: drop-shadow(0 0 3px rgba(212,165,55,0.5)); }
  .chart-x-label { font-size: 9px; fill: var(--text-dim); font-family: 'Outfit', sans-serif; }
  .chart-y-label { font-size: 9px; fill: var(--text-dim); font-family: 'Outfit', sans-serif; }

  /* Period selector */
  .period-row {
    display: flex; gap: 6px; justify-content: center;
    margin-top: 1rem; flex-wrap: wrap;
  }
  .period-btn {
    padding: 4px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    border: 1px solid var(--card-border); background: transparent;
    color: var(--text-dim); font-family: 'Outfit', sans-serif; transition: all 0.2s;
  }
  .period-btn:hover { color: var(--text-secondary); border-color: rgba(212,165,55,0.3); }
  .period-btn-active {
    background: rgba(212,165,55,0.1); border-color: rgba(212,165,55,0.4);
    color: var(--gold);
  }
  .period-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  .metrics-summary {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: 12px; backdrop-filter: blur(24px); overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.25); margin-top: 2rem;
  }
  .metrics-summary-title {
    padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--card-border);
    font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600;
    color: var(--text-primary);
  }
  .metrics-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 1.5rem; border-bottom: 1px solid rgba(212,165,55,0.05);
    transition: background 0.2s;
  }
  .metrics-row:last-child { border-bottom: none; }
  .metrics-row:hover { background: rgba(212,165,55,0.03); }
  .metrics-row-label { font-size: 0.82rem; color: var(--text-secondary); }
  .metrics-row-value { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
  .metrics-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* Profile strength progress */
  .strength-items { margin-top: 0.5rem; }
  .strength-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.72rem; color: var(--text-dim); padding: 2px 0;
  }
  .strength-check { color: #6dc07f; }
  .strength-miss { color: rgba(255,255,255,0.2); }

  @media (max-width: 900px) {
    .metric-cards-row, .gauges-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .metric-cards-row, .gauges-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .dash-wrap { padding: 1.5rem 1rem 3rem; }
    .dash-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
    .header-actions { width: 100%; flex-wrap: wrap; }
    .systm8-logo { width: 36px; height: 36px; }
    .share-dropdown { right: 0; left: auto; max-width: calc(100vw - 2rem); }
  }

  /* Live dot animation */
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
  .copy-btn {
    padding: 0.45rem 1rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600;
    font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(212,165,55,0.3); background: rgba(212,165,55,0.08);
    color: var(--gold);
  }
  .copy-btn:hover { background: rgba(212,165,55,0.15); border-color: rgba(212,165,55,0.5); }
  .copy-btn-done { background: rgba(74,205,99,0.1); border-color: rgba(74,205,99,0.3); color: #4acd63; }

  /* Setup guide */
  .setup-card {
    background: rgba(212,165,55,0.04); border: 1px solid rgba(212,165,55,0.18);
    border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;
  }
  .setup-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem;
  }
  .setup-sub { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1.25rem; }
  .setup-steps { display: flex; flex-direction: column; gap: 0.6rem; }
  .setup-step {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.85rem; color: var(--text-secondary);
  }
  .setup-step-done { color: var(--text-primary); }
  .step-icon {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
  }
  .step-icon-done { background: rgba(74,205,99,0.15); border: 1px solid rgba(74,205,99,0.3); color: #4acd63; }
  .step-icon-todo { background: rgba(212,165,55,0.1); border: 1px solid rgba(212,165,55,0.2); color: var(--gold); }
  .setup-cta { margin-top: 1.1rem; }
  .progress-bar-wrap {
    height: 4px; background: rgba(212,165,55,0.1); border-radius: 2px;
    margin-top: 1.1rem; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold-light));
    transition: width 0.6s ease;
  }

  /* Accessibility: visually hidden but available to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Focus indicators */
  .gold-btn:focus-visible,
  .btn-outline:focus-visible,
  .tab-btn:focus-visible,
  .lang-trigger:focus-visible,
  .lang-modal-option:focus-visible,
  .btn-success:focus-visible,
  .gold-link:focus-visible,
  .ai-next-btn:focus-visible,
  .ai-btn-primary:focus-visible,
  .ai-btn-secondary:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }

  .field-input:focus,
  .field-textarea:focus,
  .ai-textarea:focus {
    outline: 2px solid var(--gold);
    outline-offset: 1px;
  }

  /* Bug Report Floating Button */
  .bug-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 100;
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(15,13,10,0.9); border: 1px solid rgba(212,165,55,0.3);
    color: var(--gold); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    transition: all 0.3s; backdrop-filter: blur(10px);
  }
  .bug-fab:hover {
    border-color: var(--gold); box-shadow: 0 4px 24px rgba(212,165,55,0.2);
    transform: translateY(-2px);
  }

  /* Bug Report Modal */
  .bug-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem; animation: dropIn 0.25s ease;
  }
  .bug-modal {
    background: #111; border: 1px solid rgba(212,165,55,0.25);
    border-radius: 14px; width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto; padding: 2rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  }
  .bug-modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
    font-weight: 600; color: var(--gold); margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .bug-modal-instructions {
    font-size: 0.82rem; color: var(--text-secondary);
    line-height: 1.55; margin-bottom: 1.5rem;
    padding: 0.75rem; background: rgba(212,165,55,0.06);
    border: 1px solid rgba(212,165,55,0.12); border-radius: 8px;
  }
  .bug-field { margin-bottom: 1rem; }
  .bug-field label { display: block; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem; }
  .bug-field textarea { width: 100%; min-height: 80px; padding: 0.7rem 0.9rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.88rem; resize: vertical; outline: none; transition: border-color 0.3s; }
  .bug-field textarea:focus { border-color: var(--input-focus); box-shadow: 0 0 0 3px rgba(212,165,55,0.08); }
  .bug-field select { width: 100%; padding: 0.7rem 0.9rem; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 0.88rem; outline: none; appearance: none; cursor: pointer; }
  .bug-field select:focus { border-color: var(--input-focus); }
  .bug-file-zone {
    border: 2px dashed rgba(212,165,55,0.25); border-radius: 10px;
    padding: 1.25rem; text-align: center; cursor: pointer;
    transition: border-color 0.3s, background 0.3s;
  }
  .bug-file-zone:hover { border-color: rgba(212,165,55,0.5); background: rgba(212,165,55,0.03); }
  .bug-file-zone-active { border-color: var(--gold); background: rgba(212,165,55,0.06); }
  .bug-file-hint { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.3rem; }
  .bug-file-name { font-size: 0.82rem; color: var(--gold-light); margin-top: 0.4rem; }
  .bug-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  .bug-actions .gold-btn { flex: 1; }
  .bug-actions .btn-outline { flex: 0 0 auto; }
  .bug-error { font-size: 0.8rem; color: #e57373; margin-top: 0.5rem; }

  /* Toast notifications */
  .toast-container {
    position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
    z-index: 10000; max-width: 420px; width: calc(100% - 2rem);
    animation: toastSlideIn 0.3s ease-out;
  }
  .toast-inner {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem;
    border-radius: 12px; backdrop-filter: blur(24px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    font-size: 0.85rem; line-height: 1.4;
  }
  .toast-error {
    background: rgba(40, 10, 10, 0.95); border: 1px solid rgba(229,115,115,0.3);
    color: #e57373;
  }
  .toast-info {
    background: rgba(10, 25, 40, 0.95); border: 1px solid rgba(100,180,255,0.3);
    color: #90caf9;
  }
  .toast-close {
    background: none; border: none; color: inherit; cursor: pointer;
    opacity: 0.6; font-size: 1.1rem; padding: 0; margin-left: auto; flex-shrink: 0;
  }
  .toast-close:hover { opacity: 1; }
  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-1rem); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .bug-success-msg {
    text-align: center; padding: 2rem 1rem;
    font-size: 1rem; color: var(--success-text);
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  }
`;

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [distributor, setDistributor] = useState<any>(null)
  const [impersonating, setImpersonating] = useState<string | null>(null)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadUid, setLeadUid] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'leads' | 'profile' | 'metrics' | 'resources' | 'marketing' | 'beta'>('metrics')
  const [isBetaTester, setIsBetaTester] = useState(false)
  const [betaResults, setBetaResults] = useState<Record<string, { status: string; comment: string; id?: string }>>({})
  const [betaOpenSections, setBetaOpenSections] = useState<Set<string>>(new Set())
  const [betaFailItem, setBetaFailItem] = useState<string | null>(null)
  const [betaBugForm, setBetaBugForm] = useState({ title: '', description: '', severity: 'major' })
  const [betaSubmitted, setBetaSubmitted] = useState(false)
  const [betaUploading, setBetaUploading] = useState<string | null>(null)
  const [metricPeriod, setMetricPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week')
  const [pageViews, setPageViews] = useState(0)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('7d')
  const [pageViewHistory, setPageViewHistory] = useState<{ date: string; count: number }[]>([])

  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSlug, setProfileSlug] = useState('')
  const [slugError, setSlugError] = useState(false)
  const [profileReferralLink, setProfileReferralLink] = useState('')
  const [profileDirection, setProfileDirection] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imgX, setImgX] = useState(50)
  const [imgY, setImgY] = useState(50)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updateSaved, setUpdateSaved] = useState(false)
  const [referralError, setReferralError] = useState('')
  const [socialTelegram, setSocialTelegram] = useState('')
  const [socialWhatsapp, setSocialWhatsapp] = useState('')
  const [socialTiktok, setSocialTiktok] = useState('')
  const [socialInstagram, setSocialInstagram] = useState('')
  const [socialFacebook, setSocialFacebook] = useState('')
  const [socialSnapchat, setSocialSnapchat] = useState('')
  const [socialLinkedin, setSocialLinkedin] = useState('')
  const [socialYoutube, setSocialYoutube] = useState('')
  const [socialOther, setSocialOther] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ clientX: 0, clientY: 0, imgX: 50, imgY: 50 })

  const [urlCopied, setUrlCopied] = useState(false)

  const copyPageUrl = () => {
    const url = `${window.location.origin}/${distributor?.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    })
  }

  const [showAI, setShowAI] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [bioStep, setBioStep] = useState(0)
  const [bioAnswers, setBioAnswers] = useState<Record<string, string>>({})
  const [bioCurrentAnswer, setBioCurrentAnswer] = useState('')
  const [bioTone, setBioTone] = useState<string | null>(null)
  const [generatedBios, setGeneratedBios] = useState<Record<string, string> | null>(null)
  const [bioLangOpen, setBioLangOpen] = useState(false)
  const [bioError, setBioError] = useState<string | null>(null)
  const [bioTranslations, setBioTranslations] = useState<Record<string, string> | null>(null)

  // Share
  const [shareOpen, setShareOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  // Bug report
  const [bugOpen, setBugOpen] = useState(false)
  const [bugWhat, setBugWhat] = useState('')
  const [bugExpected, setBugExpected] = useState('')
  const [bugPage, setBugPage] = useState('Dashboard')
  const [bugFile, setBugFile] = useState<File | null>(null)
  const [bugSeverity, setBugSeverity] = useState('Medium')
  const [bugSending, setBugSending] = useState(false)
  const [bugSent, setBugSent] = useState(false)
  const [bugError, setBugError] = useState('')
  const bugFileRef = useRef<HTMLInputElement>(null)

  // AI Marketing Tools state
  const [aiToolModal, setAiToolModal] = useState<'post' | 'caption' | 'hashtags' | null>(null)
  const [aiToolPlatform, setAiToolPlatform] = useState('Facebook')
  const [aiToolTopic, setAiToolTopic] = useState('')
  const [aiToolTone, setAiToolTone] = useState('Professional')
  const [aiToolStyle, setAiToolStyle] = useState('Engaging')
  const [aiToolLoading, setAiToolLoading] = useState(false)
  const [aiToolResult, setAiToolResult] = useState('')
  const [aiToolHashtags, setAiToolHashtags] = useState<{ top: string[]; medium: string[]; niche: string[] } | null>(null)
  const [aiToolCopied, setAiToolCopied] = useState('')

  const aiToolGenerate = async () => {
    if (!aiToolTopic.trim()) return
    setAiToolLoading(true)
    setAiToolResult('')
    setAiToolHashtags(null)
    try {
      const res = await fetch('/api/ai-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: aiToolModal,
          platform: aiToolPlatform,
          topic: aiToolTopic,
          tone: aiToolTone,
          style: aiToolStyle,
          language: lang,
          name: profileName,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setAiToolResult('Error: ' + data.error)
      } else if (aiToolModal === 'hashtags' && data.hashtags) {
        setAiToolHashtags(data.hashtags)
      } else if (data.content) {
        setAiToolResult(data.content)
      }
    } catch (e) {
      setAiToolResult('Network error: ' + String(e))
    }
    setAiToolLoading(false)
  }

  const aiToolCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setAiToolCopied(label)
    setTimeout(() => setAiToolCopied(''), 2000)
  }

  const aiToolReset = () => {
    setAiToolModal(null)
    setAiToolTopic('')
    setAiToolResult('')
    setAiToolHashtags(null)
    setAiToolCopied('')
    setAiToolPlatform('Facebook')
    setAiToolTone('Professional')
    setAiToolStyle('Engaging')
  }

  // Broadcast state
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [bcSubTab, setBcSubTab] = useState<'broadcasts' | 'workflows' | 'pipeline'>('broadcasts')
  const [bcView, setBcView] = useState<'list' | 'compose' | 'detail'>('list')
  const [bcTitle, setBcTitle] = useState('')
  const [bcMessage, setBcMessage] = useState('')
  const [bcChannels, setBcChannels] = useState<Set<string>>(new Set(['email']))
  const [bcAudience, setBcAudience] = useState<'all' | 'verified' | 'last7days' | 'last30days'>('all')
  const [bcScheduleMode, setBcScheduleMode] = useState<'now' | 'later'>('now')
  const [bcScheduleDate, setBcScheduleDate] = useState('')
  const [bcSending, setBcSending] = useState(false)
  const [bcConfirmOpen, setBcConfirmOpen] = useState(false)
  const [bcDetailBroadcast, setBcDetailBroadcast] = useState<any>(null)
  const [bcRecipients, setBcRecipients] = useState<any[]>([])
  const [bcWhatsappLinks, setBcWhatsappLinks] = useState<{ name: string; url: string }[]>([])

  // Workflow state
  const [workflows, setWorkflows] = useState<any[]>([])
  const [wfView, setWfView] = useState<'list' | 'builder'>('list')
  const [wfEditing, setWfEditing] = useState<any>(null)
  const [wfName, setWfName] = useState('')
  const [wfDescription, setWfDescription] = useState('')
  const [wfTriggerType, setWfTriggerType] = useState<string>('lead_signup')
  const [wfTriggerConfig, setWfTriggerConfig] = useState<any>({})
  const [wfSteps, setWfSteps] = useState<any[]>([])
  const [wfSaving, setWfSaving] = useState(false)
  const [wfTemplatesOpen, setWfTemplatesOpen] = useState(false)
  const [wfTemplates, setWfTemplates] = useState<any[]>([])
  const [wfPreviewStep, setWfPreviewStep] = useState<number | null>(null)
  const [wfAddStepOpen, setWfAddStepOpen] = useState(false)
  const [wfEnrollmentCounts, setWfEnrollmentCounts] = useState<Record<string, { enrolled: number; completed: number }>>({})

  const fetchWorkflows = useCallback(async () => {
    if (!distributor?.user_id) return
    const { data } = await supabase
      .from('email_workflows')
      .select('*')
      .eq('owner_id', distributor.user_id)
      .eq('is_template', false)
      .order('created_at', { ascending: false })
    setWorkflows(data || [])
    // Fetch enrollment counts
    if (data && data.length > 0) {
      const wfIds = data.map((w: any) => w.id)
      const { data: enrollments } = await supabase
        .from('workflow_enrollments')
        .select('workflow_id, status')
        .in('workflow_id', wfIds)
      const counts: Record<string, { enrolled: number; completed: number }> = {}
      for (const e of enrollments || []) {
        if (!counts[e.workflow_id]) counts[e.workflow_id] = { enrolled: 0, completed: 0 }
        counts[e.workflow_id].enrolled++
        if (e.status === 'completed') counts[e.workflow_id].completed++
      }
      setWfEnrollmentCounts(counts)
    }
  }, [distributor?.user_id])

  const fetchWfTemplates = async () => {
    const { data } = await supabase
      .from('email_workflows')
      .select('*, workflow_steps(*)')
      .eq('is_template', true)
      .eq('is_global', true)
      .order('created_at', { ascending: true })
    setWfTemplates(data || [])
  }

  const wfToggleActive = async (wf: any) => {
    const newStatus = wf.status === 'active' ? 'paused' : 'active'
    await supabase.from('email_workflows').update({ status: newStatus }).eq('id', wf.id)
    showToast(newStatus === 'active' ? t.wfActivated : t.wfDeactivated, 'info')
    fetchWorkflows()
  }

  const wfOpenBuilder = (wf?: any) => {
    setWfEditing(wf || null)
    fetchWfTemplates()
    setWfView('builder')
  }

  const wfAddStep = (type: string) => {
    const order = wfSteps.length + 1
    let config: any = {}
    if (type === 'email') config = { subject: '', body: '' }
    else if (type === 'wait') config = { value: 1, unit: 'days' }
    else if (type === 'condition') config = { condition_type: 'opened', target_step_order: 1, then_step_order: order + 1, else_step_order: order + 1 }
    else if (type === 'switch_workflow') config = { target_workflow_id: '' }
    setWfSteps([...wfSteps, { step_order: order, step_type: type, config }])
    setWfAddStepOpen(false)
  }

  const wfUpdateStep = (index: number, config: any) => {
    const updated = [...wfSteps]
    updated[index] = { ...updated[index], config: { ...updated[index].config, ...config } }
    setWfSteps(updated)
  }

  const wfDeleteStep = (index: number) => {
    const updated = wfSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 }))
    setWfSteps(updated)
  }

  const wfMoveStep = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= wfSteps.length) return
    const updated = [...wfSteps]
    const temp = updated[index]
    updated[index] = updated[index + direction]
    updated[index + direction] = temp
    setWfSteps(updated.map((s, i) => ({ ...s, step_order: i + 1 })))
  }

  const wfSave = async (activate: boolean) => {
    if (!wfName.trim()) return
    setWfSaving(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Auth error:', authError)
        showToast('Not authenticated')
        setWfSaving(false)
        return
      }
      console.log('Saving workflow as user:', user.id)
      const wfData = {
        owner_id: user.id,
        name: wfName.trim(),
        description: wfDescription.trim(),
        trigger_type: wfTriggerType,
        trigger_config: wfTriggerConfig,
        status: activate ? 'active' : 'draft',
        is_template: false,
        is_global: false,
      }
      let wfId: string
      if (wfEditing) {
        const { error: updateError } = await supabase.from('email_workflows').update(wfData).eq('id', wfEditing.id)
        if (updateError) {
          console.error('Workflow save error:', JSON.stringify(updateError))
          showToast(t.wfSaveError)
          setWfSaving(false)
          return
        }
        wfId = wfEditing.id
        await supabase.from('workflow_steps').delete().eq('workflow_id', wfId)
      } else {
        const { data, error } = await supabase.from('email_workflows').insert(wfData).select('id').single()
        if (error || !data) {
          console.error('Workflow save error:', JSON.stringify(error))
          showToast(t.wfSaveError)
          setWfSaving(false)
          return
        }
        wfId = data.id
        console.log('Created workflow id:', wfId)
      }
      // Insert steps
      if (wfSteps.length > 0) {
        console.log('Saving steps for workflow_id:', wfId)
        const stepsToInsert = wfSteps.map((s, i) => ({
          workflow_id: wfId,
          step_order: i + 1,
          step_type: s.step_type,
          config: s.config,
        }))
        const { error: stepsError } = await supabase.from('workflow_steps').insert(stepsToInsert)
        if (stepsError) console.error('Workflow save error:', JSON.stringify(stepsError))
      }
      showToast(activate ? t.wfActivated : t.wfSaved, 'info')
      setWfView('list')
      fetchWorkflows()
    } catch (err) {
      console.error('Workflow save error:', err)
      showToast(t.wfSaveError)
    }
    setWfSaving(false)
  }

  const wfUseTemplate = async (template: any) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      showToast('Not authenticated')
      return
    }
    console.log('Using template as user:', user.id)
    const { data: wf, error } = await supabase.from('email_workflows').insert({
      owner_id: user.id,
      name: template.name,
      description: template.description || '',
      trigger_type: template.trigger_type,
      trigger_config: template.trigger_config || {},
      status: 'draft',
      is_template: false,
      is_global: false,
      created_from: template.id,
    }).select('id').single()
    if (error || !wf) {
      console.error('Workflow save error:', JSON.stringify(error))
      showToast(t.wfSaveError)
      return
    }
    // Clone steps
    const steps = (template.workflow_steps || []).sort((a: any, b: any) => a.step_order - b.step_order)
    if (steps.length > 0) {
      const stepsToInsert = steps.map((s: any) => ({
        workflow_id: wf.id,
        step_order: s.step_order,
        step_type: s.step_type,
        config: s.config,
      }))
      await supabase.from('workflow_steps').insert(stepsToInsert)
    }
    showToast(t.wfTemplateUsed, 'info')
    setWfTemplatesOpen(false)
    fetchWorkflows()
    // Open in builder for customization
    const { data: fullWf } = await supabase.from('email_workflows').select('*').eq('id', wf.id).single()
    if (fullWf) wfOpenBuilder(fullWf)
  }

  const fetchBroadcasts = useCallback(async () => {
    if (!distributor?.id) return
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
    setBroadcasts(data || [])
  }, [distributor?.id])

  useEffect(() => {
    if (distributor?.id && activeTab === 'marketing') { fetchBroadcasts(); fetchWorkflows() }
  }, [distributor?.id, activeTab, fetchBroadcasts, fetchWorkflows])

  const bcRecipientCount = (() => {
    if (!leads.length) return 0
    if (bcAudience === 'all') return leads.length
    if (bcAudience === 'verified') return leads.filter(l => l.uid_verified).length
    const now = Date.now()
    const days = bcAudience === 'last7days' ? 7 : 30
    return leads.filter(l => (now - new Date(l.created_at).getTime()) < days * 86400000).length
  })()

  const bcInsertMergeTag = (tag: string) => {
    setBcMessage(prev => prev + tag)
  }

  const bcPreviewMessage = () => {
    return bcMessage
      .replace(/\{first_name\}/g, 'John')
      .replace(/\{landing_page_url\}/g, `https://primeverseaccess.com/${profileSlug || 'yourpage'}`)
      .replace(/\{referral_link\}/g, profileReferralLink || 'https://puvip.co/la-partners/...')
  }

  const bcToggleChannel = (ch: string) => {
    setBcChannels(prev => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  const bcSend = async () => {
    if (!distributor || !bcTitle.trim() || !bcMessage.trim()) return
    setBcSending(true)
    setBcConfirmOpen(false)
    try {
      // Create broadcast record
      const { data: bc, error: bcErr } = await supabase
        .from('broadcasts')
        .insert({
          distributor_id: distributor.id,
          title: bcTitle,
          message: bcMessage,
          channels: Array.from(bcChannels),
          audience: bcAudience,
          status: bcScheduleMode === 'later' ? 'scheduled' : 'sending',
          scheduled_at: bcScheduleMode === 'later' ? bcScheduleDate : null,
        })
        .select()
        .single()

      if (bcErr || !bc) {
        showToast(t.broadcastError)
        setBcSending(false)
        return
      }

      if (bcScheduleMode === 'later') {
        showToast(t.broadcastScheduled, 'info')
        setBcSending(false)
        setBcView('list')
        setBcTitle('')
        setBcMessage('')
        setBcChannels(new Set(['email']))
        setBcAudience('all')
        setBcScheduleMode('now')
        await fetchBroadcasts()
        return
      }

      // Send via API
      const res = await fetch('/api/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcastId: bc.id,
          distributorId: distributor.id,
          title: bcTitle,
          message: bcMessage,
          channels: Array.from(bcChannels),
          audience: bcAudience,
          distributorName: profileName || distributor.name,
          distributorSlug: profileSlug,
          distributorReferralLink: profileReferralLink,
        }),
      })
      const result = await res.json()

      if (result.whatsappLinks?.length) {
        setBcWhatsappLinks(result.whatsappLinks)
      }

      showToast(t.broadcastSuccess, 'info')
      setBcView('list')
      setBcTitle('')
      setBcMessage('')
      setBcChannels(new Set(['email']))
      setBcAudience('all')
      setBcScheduleMode('now')
      await fetchBroadcasts()
    } catch {
      showToast(t.broadcastError)
    }
    setBcSending(false)
  }

  const bcViewDetail = async (broadcast: any) => {
    setBcDetailBroadcast(broadcast)
    setBcView('detail')
    const { data } = await supabase
      .from('broadcast_recipients')
      .select('*')
      .eq('broadcast_id', broadcast.id)
      .order('created_at', { ascending: false })
    setBcRecipients(data || [])
  }

  // Toast notifications
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'error' | 'info'>('error')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = useCallback((msg: string, type: 'error' | 'info' = 'error') => {
    setToastMsg(msg); setToastType(type)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 5000)
  }, [])

  // Language
  const [lang, setLangState] = useState('en')
  const [langOpen, setLangOpen] = useState(false)
  const t = translations[lang] || translations.en

  // Persist language to localStorage + Supabase
  const setLang = useCallback((code: string) => {
    setLangState(code)
    try { localStorage.setItem('systm8_language', code) } catch {}
  }, [])

  // Save to Supabase when lang changes (after initial load)
  const langInitialized = useRef(false)
  useEffect(() => {
    if (!langInitialized.current) return
    const saveLang = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('distributors').update({ language: lang }).eq('user_id', userData.user.id)
      }
    }
    saveLang()
  }, [lang])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/login'); return }

      // Check for impersonation cookie
      const impCookie = document.cookie.split('; ').find(c => c.startsWith('impersonate_user_id='))
      const impUserId = impCookie ? impCookie.split('=')[1] : null

      if (impUserId) {
        // Impersonation mode: load the impersonated user's distributor record
        const { data: impDist } = await supabase.from('distributors').select('*').eq('user_id', impUserId).maybeSingle()
        if (impDist) {
          setImpersonating(impDist.name || impDist.email || impUserId)
          setDistributor(impDist)
          setProfileName(impDist.name || '')
          setProfileBio(impDist.bio || '')
          setProfileSlug(impDist.slug || '')
          setProfileReferralLink(impDist.referral_link || '')
          setProfileDirection(impDist.direction || '')
          setSocialTelegram(impDist.social_telegram || '')
          setSocialWhatsapp(impDist.social_whatsapp || '')
          setSocialTiktok(impDist.social_tiktok || '')
          setSocialInstagram(impDist.social_instagram || '')
          setSocialFacebook(impDist.social_facebook || '')
          setSocialSnapchat(impDist.social_snapchat || '')
          setSocialLinkedin(impDist.social_linkedin || '')
          setSocialYoutube(impDist.social_youtube || '')
          setSocialOther(impDist.social_other || '')
          const pi = parseProfileImage(impDist.profile_image)
          setProfileImage(pi.url || null)
          setImgX(pi.x)
          setImgY(pi.y)
          await fetchLeads(impDist.id)
          setLoading(false)
          return
        }
      }

      const userId = userData.user.id
      const email = userData.user.email!
      // 1. Try to find by user_id
      const { data: byUserId } = await supabase.from('distributors').select('*').eq('user_id', userId).maybeSingle()
      let dist = byUserId

      if (!dist) {
        // 2. Fall back to email lookup (rows created by admin without user_id)
        const { data: byEmail } = await supabase.from('distributors').select('*').eq('email', email).maybeSingle()
        if (byEmail) {
          // Claim the row by writing user_id so future logins find it correctly
          await supabase.from('distributors').update({ user_id: userId }).eq('id', byEmail.id)
          dist = { ...byEmail, user_id: userId }
        }
      }

      if (!dist) {
        // 3. No row at all — create one
        const autoSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '')
        const { data: newDist, error } = await supabase.from('distributors').insert({ name: email.split('@')[0], email, user_id: userId, slug: autoSlug, ib_status: 'pending' }).select().maybeSingle()
        if (error) { showToast(t.errorPrefix + error.message); return }
        dist = newDist
      }
      // If existing record has no slug, set one from email
      if (dist && !dist.slug) {
        const autoSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '')
        await supabase.from('distributors').update({ slug: autoSlug }).eq('id', dist.id)
        dist = { ...dist, slug: autoSlug }
      }
      setDistributor(dist)
      // Auto-create default pipeline stages if they don't exist yet
      fetch('/api/create-default-stages', { method: 'POST' }).catch(() => {})
      // Load beta tester flag and existing test results
      if (dist.is_beta_tester) {
        setIsBetaTester(true)
        supabase.from('test_results').select('id, test_item, status, comment').eq('tester_id', userId).then(({ data }) => {
          if (data) {
            const results: Record<string, { status: string; comment: string; id?: string }> = {}
            for (const r of data) results[r.test_item] = { status: r.status, comment: r.comment || '', id: r.id }
            setBetaResults(results)
          }
        })
      }
      // Update last_login timestamp
      supabase.from('distributors').update({ last_login: new Date().toISOString() }).eq('id', dist.id).then(() => {})
      // Restore language: Supabase > localStorage > 'en'
      const savedLang = dist.language || (() => { try { return localStorage.getItem('systm8_language') } catch { return null } })() || 'en'
      if (translations[savedLang]) { setLangState(savedLang); try { localStorage.setItem('systm8_language', savedLang) } catch {} }
      langInitialized.current = true
      setProfileName(dist.name || '')
      setProfileBio(dist.bio || '')
      setBioTranslations(dist.bio_translations || null)
      setProfileSlug(dist.slug || '')
      setProfileReferralLink(dist.referral_link || '')
      setProfileDirection(dist.direction || '')
      setSocialTelegram(dist.social_telegram || '')
      setSocialWhatsapp(dist.social_whatsapp || '')
      setSocialTiktok(dist.social_tiktok || '')
      setSocialInstagram(dist.social_instagram || '')
      setSocialFacebook(dist.social_facebook || '')
      setSocialSnapchat(dist.social_snapchat || '')
      setSocialLinkedin(dist.social_linkedin || '')
      setSocialYoutube(dist.social_youtube || '')
      setSocialOther(dist.social_other || '')
      const pi = parseProfileImage(dist.profile_image)
      setProfileImage(pi.url || null)
      setImgX(pi.x)
      setImgY(pi.y)
      await fetchLeads(dist.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchLeads = async (distributorId: string) => {
    const { data } = await supabase.from('leads').select('*').eq('distributor_id', distributorId).order('created_at', { ascending: false })
    setLeads(data || [])
  }

  const fetchPageViews = async (distributorId: string, period: 'day' | 'week' | 'month' | 'all') => {
    setMetricsLoading(true)
    const now = new Date()
    let from: string | null = null
    if (period === 'day') { const d = new Date(now); d.setHours(0,0,0,0); from = d.toISOString() }
    else if (period === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); from = d.toISOString() }
    else if (period === 'month') { const d = new Date(now); d.setMonth(d.getMonth() - 1); from = d.toISOString() }

    let q = supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('distributor_id', distributorId)
    if (from) q = q.gte('created_at', from)
    const { count } = await q
    setPageViews(count || 0)
    setMetricsLoading(false)
  }

  const fetchPageViewHistory = async (distributorId: string, period: '7d' | '30d' | '90d') => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const from = new Date(); from.setDate(from.getDate() - days)
    const { data } = await supabase.from('page_views').select('created_at').eq('distributor_id', distributorId).gte('created_at', from.toISOString()).order('created_at', { ascending: true })
    if (!data) { setPageViewHistory([]); return }
    const grouped: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
      grouped[d.toISOString().slice(0, 10)] = 0
    }
    data.forEach(r => { const d = r.created_at.slice(0, 10); if (grouped[d] !== undefined) grouped[d]++ })
    setPageViewHistory(Object.entries(grouped).map(([date, count]) => ({ date, count })))
  }

  useEffect(() => {
    if (distributor?.id && activeTab === 'metrics') fetchPageViews(distributor.id, metricPeriod)
  }, [distributor?.id, activeTab, metricPeriod])

  useEffect(() => {
    if (distributor?.id && activeTab === 'metrics') fetchPageViewHistory(distributor.id, chartPeriod)
  }, [distributor?.id, activeTab, chartPeriod])

  const addLead = async () => {
    if (!distributor || !leadName || !leadEmail || !leadUid) { showToast(t.fillAll); return }
    setSubmitting(true)
    const { data: insertedLead, error } = await supabase.from('leads').insert({ distributor_id: distributor.id, name: leadName, email: leadEmail, uid: leadUid, uid_verified: false }).select('id').single()
    if (error) { showToast(t.errorPrefix + error.message); setSubmitting(false); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_registration', leadName, leadEmail, leadUid, distributorName: distributor.name, distributorEmail: distributor.email }) })
    fetch('/api/milestone-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ distributorId: distributor.id }) }).catch(() => {})
    if (insertedLead?.id) { fetch('/api/auto-enroll-workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: insertedLead.id, distributorId: distributor.id }) }).catch(() => {}) }
    setLeadName(''); setLeadEmail(''); setLeadUid('')
    setSubmitting(false)
    await fetchLeads(distributor.id)
  }

  const approveLead = async (lead: any) => {
    setApprovingId(lead.id)
    const { error } = await supabase.from('leads').update({ uid_verified: true, uid_verified_at: new Date().toISOString() }).eq('id', lead.id)
    if (error) { showToast(t.errorPrefix + error.message); setApprovingId(null); return }
    await fetch('/api/send-lead-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'approved', leadName: lead.name, leadEmail: lead.email, distributorName: distributor.name, distributorEmail: distributor.email }) })
    setApprovingId(null)
    await fetchLeads(distributor.id)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !distributor?.id) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const path = `${distributor.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { showToast(t.uploadErrorPrefix + uploadError.message); setUploadingImage(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const newUrl = data.publicUrl
    const newX = 50
    const newY = 30
    setProfileImage(newUrl)
    setImgX(newX)
    setImgY(newY)
    // Auto-save image immediately to database
    await supabase.from('distributors').update({ profile_image: serializeProfileImage(newUrl, newX, newY) }).eq('id', distributor.id)
    setUploadingImage(false)
  }

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true
    dragStart.current = { clientX, clientY, imgX, imgY }
  }, [imgX, imgY])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return
    const dx = clientX - dragStart.current.clientX
    const dy = clientY - dragStart.current.clientY
    setImgX(Math.max(0, Math.min(100, dragStart.current.imgX - dx * 0.4)))
    setImgY(Math.max(0, Math.min(100, dragStart.current.imgY - dy * 0.4)))
  }, [])

  const endDrag = useCallback(() => { isDragging.current = false }, [])

  const handleShare = async () => {
    if (!distributor?.slug) return
    const url = `https://www.primeverseaccess.com/${distributor.slug}`
    const title = `${distributor.name || ''} ${t.shareTitle}`
    const text = t.shareText

    const canShare = typeof navigator !== 'undefined'
      && typeof navigator.share === 'function'
      && !window.matchMedia('(display-mode: standalone)').matches

    if (canShare) {
      try {
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        await Promise.race([navigator.share({ title, text, url }), timeout])
        return
      } catch {
        // share failed, cancelled, or timed out — fall through to modal
      }
    }

    setShareOpen(prev => !prev)
  }

  const copyShareLink = async () => {
    if (!distributor?.slug) return
    const url = `https://www.primeverseaccess.com/${distributor.slug}`
    await navigator.clipboard.writeText(url)
    showToast(t.copied)
    setShareOpen(false)
  }

  // Validate and normalize PuPrime referral link
  const validateReferralLink = (link: string): { valid: boolean; normalized: string; error: string } => {
    const trimmed = link.trim()
    if (!trimmed) return { valid: false, normalized: '', error: 'referralRequired' }
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : 'https://' + trimmed)
      const host = url.hostname.replace(/^www\./, '').toLowerCase()
      if (host !== 'puvip.co' || !url.pathname.toLowerCase().startsWith('/la-partners')) {
        return { valid: false, normalized: trimmed, error: 'referralInvalid' }
      }
      // Normalize: always https
      url.protocol = 'https:'
      return { valid: true, normalized: url.toString(), error: '' }
    } catch {
      return { valid: false, normalized: trimmed, error: 'referralInvalid' }
    }
  }

  const saveProfile = async () => {
    const rv = validateReferralLink(profileReferralLink)
    if (!rv.valid) {
      setReferralError(rv.error)
      return
    }
    const normalizedLink = rv.normalized
    setProfileReferralLink(normalizedLink)
    setReferralError('')
    setSlugError(false)
    setSavingProfile(true)
    // Server-side validation
    try {
      const valRes = await fetch('/api/validate-referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referral_link: normalizedLink }) })
      if (!valRes.ok) { const d = await valRes.json().catch(() => ({})); setReferralError('referralInvalid'); showToast(d.error || t.referralInvalid); setSavingProfile(false); return }
    } catch { /* network error — allow save with frontend validation only */ }
    const isFirstSave = !distributor.slug
    const profileImageValue = profileImage ? serializeProfileImage(profileImage, imgX, imgY) : null
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: normalizedLink, direction: profileDirection, social_telegram: socialTelegram || null, social_whatsapp: socialWhatsapp ? socialWhatsapp.replace(/[^\d]/g, '') : null, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null }).eq('id', distributor.id)
    if (error) {
      if (error.message?.includes('distributors_slug_key') || error.code === '23505') {
        setSlugError(true)
      } else {
        showToast(t.errorPrefix + error.message)
      }
      setSavingProfile(false)
      return
    }
    if (isFirstSave && profileSlug) {
      fetch('/api/welcome-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: profileName, email: distributor.email, slug: profileSlug, lang }) }).catch(() => {})
      fetch('/api/page-live-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ distributorId: distributor.id }) }).catch(() => {})
    }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: normalizedLink, direction: profileDirection, social_telegram: socialTelegram || null, social_whatsapp: socialWhatsapp ? socialWhatsapp.replace(/[^\d]/g, '') : null, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null })
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const updateProfile = async () => {
    const rv = validateReferralLink(profileReferralLink)
    if (!rv.valid) {
      setReferralError(rv.error)
      return
    }
    const normalizedLink = rv.normalized
    setProfileReferralLink(normalizedLink)
    setReferralError('')
    setSlugError(false)
    setUpdatingProfile(true)
    // Server-side validation
    try {
      const valRes = await fetch('/api/validate-referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referral_link: normalizedLink }) })
      if (!valRes.ok) { const d = await valRes.json().catch(() => ({})); setReferralError('referralInvalid'); showToast(d.error || t.referralInvalid); setUpdatingProfile(false); return }
    } catch { /* network error — allow save with frontend validation only */ }
    const profileImageValue = profileImage ? serializeProfileImage(profileImage, imgX, imgY) : null
    const { error } = await supabase.from('distributors').update({ name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: normalizedLink, direction: profileDirection, social_telegram: socialTelegram || null, social_whatsapp: socialWhatsapp ? socialWhatsapp.replace(/[^\d]/g, '') : null, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null }).eq('id', distributor.id)
    if (error) {
      if (error.message?.includes('distributors_slug_key') || error.code === '23505') {
        setSlugError(true)
      } else {
        showToast(t.errorPrefix + error.message)
      }
      setUpdatingProfile(false)
      return
    }
    setDistributor({ ...distributor, name: profileName, bio: profileBio, bio_translations: bioTranslations, slug: profileSlug, profile_image: profileImageValue, referral_link: normalizedLink, direction: profileDirection, social_telegram: socialTelegram || null, social_whatsapp: socialWhatsapp ? socialWhatsapp.replace(/[^\d]/g, '') : null, social_tiktok: socialTiktok || null, social_instagram: socialInstagram || null, social_facebook: socialFacebook || null, social_snapchat: socialSnapchat || null, social_linkedin: socialLinkedin || null, social_youtube: socialYoutube || null, social_other: socialOther || null })
    setUpdatingProfile(false)
    setUpdateSaved(true)
    setTimeout(() => setUpdateSaved(false), 3000)
  }

  const bioQuestionKeys = ['background', 'motivation', 'unique', 'ideal_client', 'expectations'] as const

  const bioQuestionTexts: Record<string, Record<string, string>> = {
    background: { en: 'What is your background in trading/finance?', no: 'Hva er din bakgrunn innen trading/finans?', sv: 'Vad är din bakgrund inom trading/finans?', es: '¿Cuál es tu experiencia en trading/finanzas?', ru: 'Какой у вас опыт в трейдинге/финансах?', ar: 'ما خلفيتك في التداول/المالية؟', tl: 'Ano ang background mo sa trading/finance?', pt: 'Qual é sua experiência em trading/finanças?', th: 'พื้นฐานของคุณในการเทรด/การเงินคืออะไร?' },
    motivation: { en: 'What motivates you to help others with trading?', no: 'Hva motiverer deg til å hjelpe andre med trading?', sv: 'Vad motiverar dig att hjälpa andra med trading?', es: '¿Qué te motiva a ayudar a otros con el trading?', ru: 'Что мотивирует вас помогать другим с трейдингом?', ar: 'ما الذي يحفزك لمساعدة الآخرين في التداول؟', tl: 'Ano ang motivation mo na tulungan ang iba sa trading?', pt: 'O que te motiva a ajudar outros com trading?', th: 'อะไรเป็นแรงจูงใจให้คุณช่วยคนอื่นด้านการเทรด?' },
    unique: { en: 'What makes you unique as a partner/mentor?', no: 'Hva gjør deg unik som partner/mentor?', sv: 'Vad gör dig unik som partner/mentor?', es: '¿Qué te hace único como socio/mentor?', ru: 'Что делает вас уникальным как партнёра/ментора?', ar: 'ما الذي يجعلك فريداً كشريك/مرشد؟', tl: 'Ano ang natatangi sa iyo bilang partner/mentor?', pt: 'O que te torna único como parceiro/mentor?', th: 'อะไรทำให้คุณเป็นพาร์ทเนอร์/ที่ปรึกษาที่ไม่เหมือนใคร?' },
    ideal_client: { en: 'Who is your ideal client?', no: 'Hvem er din ideelle klient?', sv: 'Vem är din ideala klient?', es: '¿Quién es tu cliente ideal?', ru: 'Кто ваш идеальный клиент?', ar: 'من هو عميلك المثالي؟', tl: 'Sino ang ideal mong kliyente?', pt: 'Quem é seu cliente ideal?', th: 'ลูกค้าในอุดมคติของคุณคือใคร?' },
    expectations: { en: 'What can people expect when working with you?', no: 'Hva kan folk forvente når de jobber med deg?', sv: 'Vad kan folk förvänta sig när de jobbar med dig?', es: '¿Qué pueden esperar las personas al trabajar contigo?', ru: 'Что люди могут ожидать от работы с вами?', ar: 'ماذا يمكن للناس توقعه عند العمل معك؟', tl: 'Ano ang maaasahan ng mga tao kapag nakipagtulungan sa iyo?', pt: 'O que as pessoas podem esperar ao trabalhar com você?', th: 'ผู้คนจะได้อะไรเมื่อทำงานกับคุณ?' },
  }

  const toneLabels: Record<string, Record<string, string>> = {
    professional: { en: 'Professional', no: 'Profesjonell', sv: 'Professionell', es: 'Profesional', ru: 'Профессиональный', ar: 'احترافي', tl: 'Professional', pt: 'Profissional', th: 'มืออาชีพ' },
    casual: { en: 'Casual', no: 'Avslappet', sv: 'Avslappnad', es: 'Casual', ru: 'Непринуждённый', ar: 'عادي', tl: 'Casual', pt: 'Casual', th: 'เป็นกันเอง' },
    motivational: { en: 'Motivational', no: 'Motiverende', sv: 'Motiverande', es: 'Motivacional', ru: 'Мотивирующий', ar: 'تحفيزي', tl: 'Motivational', pt: 'Motivacional', th: 'สร้างแรงบันดาลใจ' },
  }

  const langLabels: Record<string, string> = { en: 'English', no: 'Norsk', sv: 'Svenska', es: 'Español', ru: 'Русский', ar: 'العربية', tl: 'Filipino', pt: 'Português', th: 'ไทย' }

  const startAI = () => {
    setShowAI(true)
    setBioStep(0)
    setBioAnswers({})
    setBioCurrentAnswer('')
    setBioTone(null)
    setGeneratedBios(null)
    setBioLangOpen(false)
    setBioError(null)
  }

  const bioNextQuestion = () => {
    if (!bioCurrentAnswer.trim()) return
    const key = bioQuestionKeys[bioStep]
    const newAnswers = { ...bioAnswers, [key]: bioCurrentAnswer.trim() }
    setBioAnswers(newAnswers)
    setBioCurrentAnswer('')
    setBioStep(bioStep + 1)
  }

  const bioSelectTone = async (tone: string) => {
    setBioTone(tone)
    setBioStep(bioQuestionKeys.length + 1)
    setAiLoading(true)
    setBioError(null)
    try {
      const res = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bioAnswers, language: lang, tone, fullName: profileName }),
      })
      const data = await res.json()
      if (data.bios) {
        setGeneratedBios(data.bios)
        setProfileBio(data.bios[lang] || Object.values(data.bios)[0] || '')
      } else {
        setGeneratedBios(null)
        setBioError(data.error || 'Unknown error from API')
      }
    } catch (e) {
      setGeneratedBios(null)
      setBioError('Network error: ' + String(e))
    }
    setAiLoading(false)
  }

  const bioRegenerate = async () => {
    if (!bioTone) return
    setBioStep(bioQuestionKeys.length + 1)
    setAiLoading(true)
    setGeneratedBios(null)
    setBioError(null)
    try {
      const res = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: bioAnswers, language: lang, tone: bioTone, fullName: profileName }),
      })
      const data = await res.json()
      if (data.bios) {
        setGeneratedBios(data.bios)
        setProfileBio(data.bios[lang] || Object.values(data.bios)[0] || '')
      } else {
        setBioError(data.error || 'Unknown error from API')
      }
    } catch (e) {
      setBioError('Network error: ' + String(e))
    }
    setAiLoading(false)
  }

  const bioUseCurrent = () => {
    if (generatedBios) {
      setProfileBio(generatedBios[lang] || Object.values(generatedBios)[0] || '')
      setBioTranslations(generatedBios)
    }
    setShowAI(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const submitBugReport = async () => {
    if (!bugWhat.trim() || !bugExpected.trim() || !bugFile) {
      setBugError(t.bugFillRequired)
      return
    }
    setBugSending(true)
    setBugError('')
    try {
      const reader = new FileReader()
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(bugFile)
      })
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatHappened: bugWhat,
          whatExpected: bugExpected,
          page: bugPage,
          severity: bugSeverity,
          screenshot: fileData,
          fileName: bugFile.name,
          userEmail: distributor?.email || '',
          userName: distributor?.name || '',
          userSlug: distributor?.slug || '',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          language: lang,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setBugSent(true)
      setTimeout(() => {
        setBugOpen(false)
        setBugSent(false)
        setBugWhat('')
        setBugExpected('')
        setBugPage('Dashboard')
        setBugFile(null)
        setBugSeverity('Medium')
      }, 2500)
    } catch {
      setBugError(t.somethingWentWrong)
    } finally {
      setBugSending(false)
    }
  }

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />
      <div className="loading-screen">
        <img src={SYSTM8_LOGO} className="loading-logo" alt="SYSTM8" />
        <span className="loading-text">{t.loading}</span>
      </div>
    </>
  )

  // ── IB Approval Gate ──
  if (distributor && distributor.ib_status !== 'approved') {
    const isPending = distributor.ib_status === 'pending' || !distributor.ib_status
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="marble-bg" />
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Arial, sans-serif', zIndex: 9999,
        }}>
          <div style={{
            background: '#16162a', border: '1px solid #2a2a4a', borderRadius: 16,
            padding: '48px 40px', maxWidth: 480, width: '90%', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>{isPending ? '\u23F3' : '\u274C'}</div>
            <h1 style={{ color: '#D4A843', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px' }}>
              {isPending ? 'Application Under Review' : 'Application Not Approved'}
            </h1>
            <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 20px' }}>
              {isPending
                ? 'Your IB application is being reviewed by the 1Move team. You will receive an email once approved.'
                : (distributor.ib_status_note || 'Your application was not approved at this time. Please contact support for more information.')}
            </p>
            <div style={{ color: '#888', fontSize: '0.82rem', marginBottom: 24 }}>
              <div style={{ fontWeight: 600, color: '#ccc' }}>{distributor.name}</div>
              <div>{distributor.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:support@1move.global" style={{
                background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)',
                borderRadius: 8, padding: '10px 24px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
              }}>
                Contact Support
              </a>
              <button onClick={handleLogout} style={{
                background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const pending = leads.filter(l => !l.uid_verified)
  const approved = leads.filter(l => l.uid_verified)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="marble-bg" />

      {/* Toast notification */}
      {toastMsg && (
        <div className="toast-container">
          <div className={`toast-inner ${toastType === 'error' ? 'toast-error' : 'toast-info'}`}>
            <span>{toastMsg}</span>
            <button className="toast-close" onClick={() => setToastMsg('')}>✕</button>
          </div>
        </div>
      )}

      {/* Language modal overlay */}
      {langOpen && (
        <div className="lang-modal-backdrop" onClick={() => setLangOpen(false)} role="dialog" aria-modal="true" aria-label="Select language">
          <div className="lang-modal" onClick={e => e.stopPropagation()}>
            <div className="lang-modal-title">{t.selectLanguage || 'Select language'}</div>
            {Object.entries(languageLabels).map(([code, label]) => (
              <button
                key={code}
                className={`lang-modal-option${code === lang ? ' lang-modal-option-active' : ''}`}
                onClick={() => { setLang(code); setLangOpen(false); }}
              >
                <span className="lang-flag" aria-hidden="true">{languageFlags[code]}</span>
                {label}
                {code === lang && <span className="lang-check" aria-hidden="true">&#10003;</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Impersonation Banner */}
      {impersonating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(120,53,15,0.8)', borderBottom: '1px solid rgba(217,119,6,0.4)', backdropFilter: 'blur(8px)', fontFamily: "'Outfit', sans-serif" }}>
          <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>👁 Admin view — viewing as <strong>{distributor?.full_name || distributor?.name || impersonating}</strong></span>
          <button onClick={() => { document.cookie = 'impersonate_user_id=; path=/; max-age=0'; window.location.reload() }} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid rgba(245,158,11,0.4)', background: 'transparent', color: '#fcd34d', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            Exit
          </button>
        </div>
      )}

      <div className="dash-wrap" id="main-content" style={impersonating ? { paddingTop: 40 } : undefined}>

        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-header-left">
            {/* SYSTM8 Logo */}
            <img src={SYSTM8_LOGO} className="systm8-logo" alt="SYSTM8" />
            <div className="header-divider" aria-hidden="true" />
            {distributor?.profile_image ? (
              <img src={parseProfileImage(distributor.profile_image).url} className="avatar"
                style={{ objectPosition: `${parseProfileImage(distributor.profile_image).x}% ${parseProfileImage(distributor.profile_image).y}%` }}
                alt={distributor.name ? `Profile picture of ${distributor.name}` : 'Profile picture'} />
            ) : (
              <div className="avatar-placeholder" aria-hidden="true">👤</div>
            )}
            <div>
              <div className="dash-username">
                {distributor?.name || 'Dashboard'}
                {distributor?.landing_active && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginLeft: 6, verticalAlign: 'middle', boxShadow: '0 0 6px rgba(74,205,99,0.6)', animation: 'livePulse 2s ease infinite' }} title="Page is live" />}
              </div>
              <div className="dash-email">{distributor?.email}</div>
              {distributor?.landing_active === true && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,205,99,0.6)', animation: 'livePulse 2s ease infinite' }} />
                  <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 500, letterSpacing: '0.03em' }}>Your page is live</span>
                </div>
              )}
            </div>
          </div>
          <div className="header-actions">
            {distributor?.slug && (
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                {(distributor?.landing_active || distributor?.slug) && (
                  <div style={{
                    position: 'absolute',
                    top: -18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      width: 7,
                      height: 7,
                      background: distributor?.landing_active ? '#4ade80' : '#f87171',
                      borderRadius: '50%',
                      animation: 'livePulse 2s ease infinite'
                    }} />
                    <span style={{
                      color: distributor?.landing_active ? '#4ade80' : '#f87171',
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}>
                      {distributor?.landing_active ? 'Live' : 'Pending'}
                    </span>
                  </div>
                )}
                <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-btn gold-btn-sm">
                  {t.viewPage} <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
            )}

            {distributor?.slug && (
              <div className="share-wrapper" ref={shareRef}>
                <button onClick={handleShare} className="gold-btn gold-btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  {t.sharePage}
                </button>
                {shareOpen && (() => {
                  const url = `https://www.primeverseaccess.com/${distributor.slug}`
                  const text = t.shareText
                  const title = `${distributor.name || ''} ${t.shareTitle}`
                  return (
                    <div className="share-dropdown">
                      <button className="share-option" onClick={copyShareLink}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        {t.copyLink}
                      </button>
                      <a className="share-option" href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </a>
                      <a className="share-option" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        Telegram
                      </a>
                      <a className="share-option" href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=966242223397117&redirect_uri=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
                        Messenger
                      </a>
                      <a className="share-option" href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n' + url)}`} onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Email
                      </a>
                      <a className="share-option" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </a>
                      <a className="share-option" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        X / Twitter
                      </a>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Language trigger — globe + flag */}
            <button
              className="lang-trigger"
              onClick={() => setLangOpen(true)}
              aria-label={`Select language, current: ${languageLabels[lang]}`}
              aria-haspopup="dialog"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/>
              </svg>
              <span className="lang-flag" aria-hidden="true">{languageFlags[lang]}</span>
            </button>

            <button onClick={handleLogout} className="logout-link">{t.logout}</button>

            {/* Admin Console — only for bitaasum@gmail.com */}
            {distributor?.email === 'bitaasum@gmail.com' && (
              <a href="/admin/console" className="gold-btn gold-btn-sm" style={{ marginLeft: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 2 }}>
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Admin
              </a>
            )}
          </div>
        </header>

        {/* TABS */}
        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          <button
            role="tab"
            aria-selected={activeTab === 'metrics'}
            aria-controls="tab-panel-metrics"
            id="tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`tab-btn${activeTab === 'metrics' ? ' tab-btn-active' : ''}`}
          >
            {t.metricsTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'profile'}
            aria-controls="tab-panel-profile"
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`tab-btn${activeTab === 'profile' ? ' tab-btn-active' : ''}`}
          >
            {t.profileTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'leads'}
            aria-controls="tab-panel-leads"
            id="tab-leads"
            onClick={() => setActiveTab('leads')}
            className={`tab-btn${activeTab === 'leads' ? ' tab-btn-active' : ''}`}
          >
            {t.leadsTab} ({leads.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'resources'}
            aria-controls="tab-panel-resources"
            id="tab-resources"
            onClick={() => setActiveTab('resources')}
            className={`tab-btn${activeTab === 'resources' ? ' tab-btn-active' : ''}`}
          >
            {t.ibResourcesTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'marketing'}
            aria-controls="tab-panel-marketing"
            id="tab-marketing"
            onClick={() => setActiveTab('marketing')}
            className={`tab-btn${activeTab === 'marketing' ? ' tab-btn-active' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4, verticalAlign: '-2px' }}><path d="M3 11V3h4l3 4h10v4H3zm0 2h18l-1.5 8H4.5L3 13z"/></svg>
            {t.marketingTab}
          </button>
          {isBetaTester && (
          <button
            role="tab"
            aria-selected={activeTab === 'beta'}
            aria-controls="tab-panel-beta"
            id="tab-beta"
            onClick={() => {
              setActiveTab('beta')
              // Re-fetch test results from Supabase to ensure persistence across tab switches
              if (distributor?.user_id) {
                supabase.from('test_results').select('id, test_item, status, comment').eq('tester_id', distributor.user_id).then(({ data }) => {
                  if (data) {
                    const results: Record<string, { status: string; comment: string; id?: string }> = {}
                    for (const r of data) results[r.test_item] = { status: r.status, comment: r.comment || '', id: r.id }
                    setBetaResults(results)
                  }
                })
              }
            }}
            className={`tab-btn${activeTab === 'beta' ? ' tab-btn-active' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 4, verticalAlign: '-2px' }}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
            {t.betaTestTab}
          </button>
          )}
        </div>

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div role="tabpanel" id="tab-panel-leads" aria-labelledby="tab-leads">

            {/* SETUP GUIDE — shown when profile is incomplete */}
            {(() => {
              const hasPhoto = !!distributor?.profile_image
              const hasBio = !!(distributor?.bio?.trim())
              const hasReferral = !!(distributor?.referral_link?.trim())
              const done = [hasPhoto, hasBio, hasReferral].filter(Boolean).length
              if (done === 3) return null
              return (
                <div className="setup-card">
                  <div className="setup-title">
                    {lang === 'no' ? '👋 Sett opp din side' : lang === 'sv' ? '👋 Konfigurera din sida' : lang === 'es' ? '👋 Configura tu página' : '👋 Set up your page'}
                  </div>
                  <div className="setup-sub">
                    {lang === 'no' ? `Din landingsside er opprettet! Fullfør disse ${3 - done} stegene for å gjøre den klar til å dele.`
                      : lang === 'sv' ? `Din landningssida är skapad! Slutför dessa ${3 - done} steg för att göra den redo att dela.`
                      : lang === 'es' ? `¡Tu página de aterrizaje está creada! Completa estos ${3 - done} pasos para compartirla.`
                      : `Your landing page is created! Complete these ${3 - done} steps to make it ready to share.`}
                  </div>
                  <div className="setup-steps">
                    <div className={`setup-step${hasPhoto ? ' setup-step-done' : ''}`}>
                      <span className={`step-icon${hasPhoto ? ' step-icon-done' : ' step-icon-todo'}`}>{hasPhoto ? '✓' : '1'}</span>
                      {lang === 'no' ? 'Last opp profilbilde' : lang === 'sv' ? 'Ladda upp profilbild' : lang === 'es' ? 'Sube tu foto de perfil' : 'Upload a profile photo'}
                    </div>
                    <div className={`setup-step${hasBio ? ' setup-step-done' : ''}`}>
                      <span className={`step-icon${hasBio ? ' step-icon-done' : ' step-icon-todo'}`}>{hasBio ? '✓' : '2'}</span>
                      {lang === 'no' ? 'Skriv en bio' : lang === 'sv' ? 'Skriv en bio' : lang === 'es' ? 'Escribe una bio' : 'Write a bio'}
                    </div>
                    <div className={`setup-step${hasReferral ? ' setup-step-done' : ''}`}>
                      <span className={`step-icon${hasReferral ? ' step-icon-done' : ' step-icon-todo'}`}>{hasReferral ? '✓' : '3'}</span>
                      {lang === 'no' ? 'Lim inn din IB-link (referral link fra broker)' : lang === 'sv' ? 'Klistra in din IB-länk' : lang === 'es' ? 'Pega tu enlace IB del broker' : 'Paste your IB referral link from the broker'}
                    </div>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${(done / 3) * 100}%` }} />
                  </div>
                  <div className="setup-cta">
                    <button className="gold-btn gold-btn-sm" onClick={() => setActiveTab('profile')}>
                      {lang === 'no' ? 'Gå til profil →' : lang === 'sv' ? 'Gå till profil →' : lang === 'es' ? 'Ir a perfil →' : 'Go to profile →'}
                    </button>
                  </div>
                </div>
              )
            })()}

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="section-header">
                <span aria-hidden="true">⏳</span> {t.pendingHeader}
                <span className="badge badge-warning" aria-label={`${pending.length} pending`}>{pending.length}</span>
              </h3>
              {pending.length === 0 && <p className="empty-text">{t.noPending}</p>}
              <ul aria-label={t.pendingHeader} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pending.map(lead => (
                  <li key={lead.id} className="lead-item lead-item-pending">
                    <div>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-detail">{lead.email}</div>
                      <div className="lead-uid">UID: <strong>{lead.uid || t.notProvided}</strong></div>
                      <div className="lead-date">
                        <time dateTime={new Date(lead.created_at).toISOString()}>
                          {new Date(lead.created_at).toLocaleDateString('no-NO')}
                        </time>
                      </div>
                    </div>
                    <button
                      onClick={() => approveLead(lead)}
                      disabled={approvingId === lead.id}
                      className="btn-success"
                      aria-label={`${t.approve} ${lead.name}`}
                      aria-busy={approvingId === lead.id}
                    >
                      {approvingId === lead.id ? t.sending : <><span aria-hidden="true">✓ </span>{t.approve}</>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="section-header">
                <span aria-hidden="true">✅</span> {t.approvedHeader}
                <span className="badge badge-success" aria-label={`${approved.length} approved`}>{approved.length}</span>
              </h3>
              {approved.length === 0 && <p className="empty-text">{t.noApproved}</p>}
              <ul aria-label={t.approvedHeader} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {approved.map(lead => (
                  <li key={lead.id} className="lead-item lead-item-approved">
                    <div>
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-detail">{lead.email}</div>
                      <div className="lead-uid">UID: <strong>{lead.uid}</strong></div>
                      <div className="lead-date">
                        {t.approvedDate}:{' '}
                        {lead.uid_verified_at ? (
                          <time dateTime={new Date(lead.uid_verified_at).toISOString()}>
                            {new Date(lead.uid_verified_at).toLocaleDateString('no-NO')}
                          </time>
                        ) : '-'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-grid" role="tabpanel" id="tab-panel-profile" aria-labelledby="tab-profile">
            <div>
              <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>{t.editProfile}</h2>

              <div className="field-group" style={{ marginBottom: '1.5rem' }}>
                <label className="field-label" htmlFor="profile-image-upload">{t.profileImage}</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 6 }}>
                  {profileImage ? (
                    <div>
                      <div
                        className="upload-area"
                        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
                        onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY) }}
                        onMouseMove={e => moveDrag(e.clientX, e.clientY)}
                        onMouseUp={endDrag}
                        onMouseLeave={endDrag}
                        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY) }}
                        onTouchEnd={endDrag}
                        role="img"
                        aria-label={`${profileName ? `Profile picture of ${profileName}` : 'Profile picture'}. Drag to reposition.`}
                      >
                        <img src={profileImage} alt=""
                          style={{ objectPosition: `${imgX}% ${imgY}%` }} />
                      </div>
                      <p style={{ margin: '5px 0 0', fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span aria-hidden="true">↔</span> {t.dragToReposition}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="upload-area"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label={t.uploadImage}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                    >
                      <span style={{ fontSize: 24, color: 'var(--gold)' }} aria-hidden="true">{uploadingImage ? '⏳' : '📷'}</span>
                    </div>
                  )}
                  <div style={{ paddingTop: 4 }}>
                    <button
                      id="profile-image-upload"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="gold-btn gold-btn-sm"
                      aria-busy={uploadingImage}
                    >
                      {uploadingImage ? t.uploading : profileImage ? t.changeImage : t.uploadImage}
                    </button>
                    <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.imageHint}</p>
                    {profileImage && <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'var(--text-dim)' }}>{t.rememberToSave}</p>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-name">{t.fullName}</label>
                <input id="profile-name" className="field-input" value={profileName} onChange={e => setProfileName(e.target.value)} />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-slug">{t.yourUrl}</label>
                <div className="url-input-wrap" style={slugError ? { borderColor: '#d44a37' } : undefined}>
                  <span className="url-prefix" aria-hidden="true">primeverseaccess.com/</span>
                  <input id="profile-slug" value={profileSlug} onChange={e => { setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugError(false) }} placeholder="ditt-navn" aria-label={`${t.yourUrl}: primeverseaccess.com/`} aria-invalid={slugError} />
                </div>
                {slugError && <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#d44a37' }}>{t.slugTaken}</p>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="profile-referral">IB / Referral-link</label>
                <input id="profile-referral" type="url" className="field-input" value={profileReferralLink} onChange={e => { setProfileReferralLink(e.target.value); setReferralError('') }} onBlur={() => { if (profileReferralLink.trim()) { const rv = validateReferralLink(profileReferralLink); if (!rv.valid) setReferralError(rv.error) } }} placeholder="https://puvip.co/la-partners/..." style={referralError ? { borderColor: '#d44a37' } : undefined} aria-invalid={!!referralError} />
                {referralError && <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#d44a37' }}>{referralError === 'referralInvalid' ? t.referralInvalid : t.referralRequired}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">{t.socialMedia || 'Social media'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input className="field-input" value={socialTelegram} onChange={e => setSocialTelegram(e.target.value)} onBlur={() => { const v = socialTelegram.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialTelegram('https://' + v) }} placeholder={t.telegramUrl || 'https://t.me/yourusername'} />
                  <input className="field-input" value={socialWhatsapp} onChange={e => setSocialWhatsapp(e.target.value.replace(/[^\d+]/g, ''))} placeholder={t.whatsappPhone || '+1234567890'} />
                  <input className="field-input" value={socialTiktok} onChange={e => setSocialTiktok(e.target.value)} onBlur={() => { const v = socialTiktok.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialTiktok('https://' + v) }} placeholder="TikTok URL" />
                  <input className="field-input" value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} onBlur={() => { const v = socialInstagram.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialInstagram('https://' + v) }} placeholder="Instagram URL" />
                  <input className="field-input" value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} onBlur={() => { const v = socialFacebook.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialFacebook('https://' + v) }} placeholder="Facebook URL" />
                  <input className="field-input" value={socialSnapchat} onChange={e => setSocialSnapchat(e.target.value)} onBlur={() => { const v = socialSnapchat.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialSnapchat('https://' + v) }} placeholder="Snapchat URL" />
                  <input className="field-input" value={socialLinkedin} onChange={e => setSocialLinkedin(e.target.value)} onBlur={() => { const v = socialLinkedin.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialLinkedin('https://' + v) }} placeholder="LinkedIn URL" />
                  <input className="field-input" value={socialYoutube} onChange={e => setSocialYoutube(e.target.value)} onBlur={() => { const v = socialYoutube.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialYoutube('https://' + v) }} placeholder={t.youtubeUrl || 'YouTube URL'} />
                  <input className="field-input" value={socialOther} onChange={e => setSocialOther(e.target.value)} onBlur={() => { const v = socialOther.trim(); if (v && !/^https?:\/\//i.test(v)) setSocialOther('https://' + v) }} placeholder={t.otherUrl || 'Other URL'} />
                </div>
              </div>

              <div className="field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="field-label" htmlFor="profile-bio" style={{ marginBottom: 0 }}>{t.bio}</label>
                  <button
                    onClick={() => { if (!showAI) startAI(); else setShowAI(false); }}
                    aria-expanded={showAI}
                    aria-controls="ai-panel"
                    style={{
                      fontSize: '0.72rem', padding: '4px 12px',
                      background: showAI ? 'rgba(212,165,55,0.15)' : 'transparent',
                      color: showAI ? 'var(--gold)' : 'var(--text-secondary)',
                      border: '1px solid var(--card-border)', borderRadius: 20,
                      cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500, transition: 'all 0.3s'
                    }}
                  >
                    <span aria-hidden="true">✦ </span>{t.aiHelper}
                  </button>
                </div>
                <textarea id="profile-bio" className="field-textarea" value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder={t.bioPlaceholder} rows={6} />
              </div>

              {distributor?.slug ? (
                <button onClick={updateProfile} disabled={updatingProfile || !!referralError} className="btn-outline" style={{ width: '100%', fontSize: '1rem', padding: '14px', letterSpacing: '0.05em' }} aria-busy={updatingProfile}>
                  {updatingProfile ? t.updating : updateSaved ? `✓ ${t.updated}` : t.updateInfo}
                </button>
              ) : (
                <button onClick={saveProfile} disabled={savingProfile || !!referralError} className="gold-btn" style={{ width: '100%', fontSize: '1rem', padding: '14px', letterSpacing: '0.05em' }} aria-busy={savingProfile}>
                  {savingProfile ? `⏳ ${t.generatingPage}` : profileSaved ? `✓ ${t.pageIsLive}` : `🚀 ${t.generatePage}`}
                </button>
              )}

              {profileSaved && distributor?.slug && (
                <div style={{
                  marginTop: '1rem', padding: '1.25rem 1.5rem',
                  background: 'rgba(212,165,55,0.08)', border: '1px solid var(--gold)',
                  borderRadius: 12, textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t.pageLiveAt}</p>
                  <a
                    href={`/${distributor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--gold)', fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none',
                      display: 'block', marginBottom: '0.75rem'
                    }}
                  >
                    primeverseaccess.com/{distributor.slug}
                    <span className="sr-only"> (åpner i ny fane)</span>
                  </a>
                  <a
                    href={`/${distributor.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-btn"
                    style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 24px', fontSize: '0.85rem' }}
                  >
                    {t.viewLandingPage} →
                  </a>
                </div>
              )}

              {!profileSaved && distributor?.slug && (
                <p style={{ margin: '0.75rem 0 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {t.yourPageAt} <a href={`/${distributor.slug}`} target="_blank" rel="noopener noreferrer" className="gold-link">primeverseaccess.com/{distributor.slug}</a>
                </p>
              )}
            </div>

            <div id="ai-panel">
              {showAI ? (
                <div className="ai-panel">
                  <div className="ai-header">
                    <span className="sparkle" aria-hidden="true">✦</span> {t.aiTitle}
                    <span className="powered">AI</span>
                  </div>
                  <div className="ai-body">
                    {/* Step indicator dots */}
                    <div className="ai-step-indicator">
                      {bioQuestionKeys.map((_, i) => (
                        <div key={i} className={`ai-step-dot${i === bioStep ? ' active' : i < bioStep ? ' done' : ''}`} />
                      ))}
                      <div className={`ai-step-dot${bioStep === bioQuestionKeys.length ? ' active' : bioStep > bioQuestionKeys.length ? ' done' : ''}`} />
                      <div className={`ai-step-dot${bioStep > bioQuestionKeys.length ? ' active' : ''}`} />
                    </div>

                    {/* Step 1: Questions (one at a time) */}
                    {bioStep < bioQuestionKeys.length && (
                      <div>
                        <div className="ai-question-count">{bioStep + 1} {t.aiStepOf} {bioQuestionKeys.length}</div>
                        <div className="ai-question">{bioQuestionTexts[bioQuestionKeys[bioStep]][lang] || bioQuestionTexts[bioQuestionKeys[bioStep]].en}</div>
                        <textarea className="ai-textarea" value={bioCurrentAnswer} onChange={e => setBioCurrentAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && bioCurrentAnswer.trim()) { e.preventDefault(); bioNextQuestion() } }} rows={3} autoFocus />
                        <button className="ai-next-btn" onClick={bioNextQuestion} disabled={!bioCurrentAnswer.trim()}>{t.aiNext} →</button>
                      </div>
                    )}

                    {/* Step 2: Choose tone */}
                    {bioStep === bioQuestionKeys.length && (
                      <div>
                        <div className="ai-question">{t.aiChooseTone}</div>
                        <div className="ai-tone-grid">
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('professional')}>
                            <span className="ai-tone-emoji">💼</span>
                            {toneLabels.professional[lang] || toneLabels.professional.en}
                          </button>
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('casual')}>
                            <span className="ai-tone-emoji">😊</span>
                            {toneLabels.casual[lang] || toneLabels.casual.en}
                          </button>
                          <button className="ai-tone-btn" onClick={() => bioSelectTone('motivational')}>
                            <span className="ai-tone-emoji">🔥</span>
                            {toneLabels.motivational[lang] || toneLabels.motivational.en}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Loading */}
                    {bioStep > bioQuestionKeys.length && aiLoading && (
                      <div className="ai-loading">
                        <div className="ai-spinner" />
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{t.aiGenerating}</div>
                      </div>
                    )}

                    {/* Step 4: Preview */}
                    {bioStep > bioQuestionKeys.length && !aiLoading && generatedBios && (
                      <div>
                        <div className="ai-question">{t.aiPreview}</div>
                        <div className="ai-preview-bio">{generatedBios[lang] || Object.values(generatedBios)[0]}</div>
                        <div className="ai-btn-row">
                          <button className="ai-btn-primary" onClick={bioUseCurrent}>{t.aiUseThis}</button>
                          <button className="ai-btn-secondary" onClick={bioRegenerate}>{t.aiRegenerate}</button>
                          <button className="ai-btn-secondary" onClick={startAI}>{t.aiStartOver}</button>
                        </div>
                        <button className="ai-lang-toggle" onClick={() => setBioLangOpen(!bioLangOpen)}>
                          {bioLangOpen ? '▾' : '▸'} {t.aiOtherLangs}
                        </button>
                        {bioLangOpen && (
                          <div className="ai-lang-list">
                            {Object.entries(generatedBios).filter(([code]) => code !== lang).map(([code, bio]) => (
                              <div key={code} className="ai-lang-item">
                                <strong>{langLabels[code] || code}</strong>
                                {bio}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error state */}
                    {bioStep > bioQuestionKeys.length && !aiLoading && !generatedBios && (
                      <div className="ai-loading">
                        <div style={{ color: '#d44a37', fontSize: '0.84rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                          {t.somethingWentWrong}
                        </div>
                        {bioError && (
                          <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem', marginBottom: '1rem', maxWidth: '340px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {bioError}
                          </div>
                        )}
                        <div className="ai-btn-row" style={{ justifyContent: 'center' }}>
                          <button className="ai-btn-secondary" onClick={bioRegenerate}>{t.aiRegenerate}</button>
                          <button className="ai-btn-secondary" onClick={startAI}>{t.aiStartOver}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <div className="sparkle-big" aria-hidden="true">✦</div>
                  <h3>{t.aiTitle}</h3>
                  <p>{t.aiDescription}</p>
                  <button onClick={startAI} className="gold-btn">{t.startAi}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MARKETING RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div role="tabpanel" id="tab-panel-resources" aria-labelledby="tab-resources">
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)', margin: '0 0 0.35rem' }}>{t.ibResourcesTab}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>{t.ibResourcesSubtitle}</p>
            </div>

            {/* AI Marketing Tools Section */}
            <div className="ai-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" fill="var(--gold)" stroke="none"/></svg>
              {t.aiMarketingTools}
            </div>
            <div className="ib-resources-grid" style={{ marginBottom: '2.5rem' }}>
              {/* Post Writer */}
              <div className="ib-resource-card" onClick={() => setAiToolModal('post')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setAiToolModal('post')}>
                <span className="ai-tool-badge ai-tool-badge-gold">{t.aiPowered}</span>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.postWriter}</div>
                  <div className="ib-resource-desc">{t.postWriterDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
              {/* Caption Generator */}
              <div className="ib-resource-card" onClick={() => setAiToolModal('caption')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setAiToolModal('caption')}>
                <span className="ai-tool-badge ai-tool-badge-gold">{t.aiPowered}</span>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.captionGenerator}</div>
                  <div className="ib-resource-desc">{t.captionGeneratorDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
              {/* Hashtag Research */}
              <div className="ib-resource-card" onClick={() => setAiToolModal('hashtags')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setAiToolModal('hashtags')}>
                <span className="ai-tool-badge ai-tool-badge-gold">{t.aiPowered}</span>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.hashtagResearch}</div>
                  <div className="ib-resource-desc">{t.hashtagResearchDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
              {/* Content Calendar */}
              <div className="ib-resource-card ib-resource-card-disabled">
                <div className="ib-resource-badge">{t.comingSoon}</div>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <rect x="7" y="14" width="3" height="3" rx="0.5" fill="var(--gold)" stroke="none" opacity="0.3"/><rect x="14" y="14" width="3" height="3" rx="0.5" fill="var(--gold)" stroke="none" opacity="0.3"/>
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.contentCalendar}</div>
                  <div className="ib-resource-desc">{t.contentCalendarDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
            </div>

            {/* Resources Section */}
            <div className="ai-section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              {t.resourcesSection}
            </div>
            <div className="ib-resources-grid">
              <a
                href="https://seed-timpani-7f1.notion.site/29eb91acac5281c589cee5eb17a53522?v=29eb91acac5281c18d3a000ca39a21d0&source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.ibTraining}</div>
                  <div className="ib-resource-desc">{t.ibTrainingDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
              <div className="ib-resource-card ib-resource-card-disabled">
                <div className="ib-resource-badge">{t.comingSoon}</div>
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.contentLibrary}</div>
                  <div className="ib-resource-desc">{t.contentLibraryDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </div>
              <a
                href="https://puprimelive.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.vipSupport}</div>
                  <div className="ib-resource-desc">{t.vipSupportDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
              <a
                href="https://www.canva.com/design/DAHCjaOppW8/yeLC5W-gz6d_F6hjfkfOqQ/view"
                target="_blank"
                rel="noopener noreferrer"
                className="ib-resource-card"
              >
                <div className="ib-resource-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <polygon points="10,8 10,12 14,10" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="ib-resource-text">
                  <div className="ib-resource-title">{t.pvPresentation}</div>
                  <div className="ib-resource-desc">{t.pvPresentationDesc}</div>
                </div>
                <span className="ib-resource-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        )}

        {/* AI TOOL MODALS */}
        {aiToolModal && (
          <div className="ai-modal-overlay" onClick={e => { if (e.target === e.currentTarget) aiToolReset() }}>
            <div className="ai-modal">
              <div className="ai-modal-title">
                {aiToolModal === 'post' && <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>{t.postWriter}</>}
                {aiToolModal === 'caption' && <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>{t.captionGenerator}</>}
                {aiToolModal === 'hashtags' && <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>{t.hashtagResearch}</>}
                <button className="ai-modal-close" onClick={aiToolReset}>&times;</button>
              </div>

              {/* Platform selector (post & hashtags) */}
              {(aiToolModal === 'post' || aiToolModal === 'hashtags') && (
                <div className="ai-modal-field">
                  <div className="ai-modal-label">{t.selectPlatform}</div>
                  <div className="ai-pill-group">
                    {['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'X/Twitter'].map(p => (
                      <button key={p} className={`ai-pill${aiToolPlatform === p ? ' ai-pill-active' : ''}`} onClick={() => setAiToolPlatform(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic input */}
              <div className="ai-modal-field">
                <div className="ai-modal-label">{aiToolModal === 'hashtags' ? t.nicheLabel : aiToolModal === 'caption' ? t.topicLabel : t.topicLabel}</div>
                <input
                  className="field-input"
                  placeholder={aiToolModal === 'hashtags' ? t.nichePlaceholder : aiToolModal === 'caption' ? t.captionTopicPlaceholder : t.topicPlaceholder}
                  value={aiToolTopic}
                  onChange={e => setAiToolTopic(e.target.value)}
                />
              </div>

              {/* Tone selector (post only) */}
              {aiToolModal === 'post' && (
                <div className="ai-modal-field">
                  <div className="ai-modal-label">{t.toneLabel}</div>
                  <div className="ai-pill-group">
                    {[
                      { key: 'Professional', label: t.toneProfessional },
                      { key: 'Casual', label: t.toneCasual },
                      { key: 'Motivational', label: t.toneMotivational },
                      { key: 'Educational', label: t.toneEducational },
                    ].map(item => (
                      <button key={item.key} className={`ai-pill${aiToolTone === item.key ? ' ai-pill-active' : ''}`} onClick={() => setAiToolTone(item.key)}>{item.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Style selector (caption only) */}
              {aiToolModal === 'caption' && (
                <div className="ai-modal-field">
                  <div className="ai-modal-label">{t.captionStyle}</div>
                  <div className="ai-pill-group">
                    {[
                      { key: 'Engaging', label: t.styleEngaging },
                      { key: 'Inspirational', label: t.styleInspirational },
                      { key: 'Educational', label: t.styleEducational },
                      { key: 'Humorous', label: t.styleHumorous },
                    ].map(item => (
                      <button key={item.key} className={`ai-pill${aiToolStyle === item.key ? ' ai-pill-active' : ''}`} onClick={() => setAiToolStyle(item.key)}>{item.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Language selector */}
              <div className="ai-modal-field">
                <div className="ai-modal-label">{t.selectLanguage}</div>
                <select className="ai-modal-select" value={lang} disabled>
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>{languageFlags[code]} {label}</option>
                  ))}
                </select>
              </div>

              {/* Generate button */}
              <button
                className="gold-btn"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={aiToolGenerate}
                disabled={aiToolLoading || !aiToolTopic.trim()}
              >
                {aiToolLoading ? t.generating : aiToolModal === 'post' ? t.generatePost : aiToolModal === 'caption' ? t.generateCaption : t.researchHashtags}
              </button>

              {/* Results - Post & Caption */}
              {aiToolResult && aiToolModal !== 'hashtags' && (
                <>
                  <div className="ai-result-box">{aiToolResult}</div>
                  {!aiToolResult.startsWith('Error') && (
                    <div className="ai-result-actions">
                      <button className="gold-btn" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => aiToolCopy(aiToolResult, 'main')}>
                        {aiToolCopied === 'main' ? t.copied : t.copyText}
                      </button>
                      <button className="gold-btn" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={aiToolGenerate} disabled={aiToolLoading}>
                        {t.regenerate}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Results - Caption emoji suggestions */}
              {aiToolResult && aiToolModal === 'caption' && aiToolResult.includes('---') && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div className="ai-modal-label">{t.emojiSuggestions}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {aiToolResult.split('---')[1]?.trim().split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results - Hashtags */}
              {aiToolHashtags && aiToolModal === 'hashtags' && (
                <div style={{ marginTop: '1rem' }}>
                  {([
                    { key: 'top' as const, label: t.topHashtags },
                    { key: 'medium' as const, label: t.mediumHashtags },
                    { key: 'niche' as const, label: t.nicheHashtags },
                  ]).map(group => (
                    <div key={group.key} className="ai-hashtag-group">
                      <div className="ai-hashtag-group-title">
                        <span>{group.label}</span>
                        <button className="ai-copy-btn" onClick={() => aiToolCopy((aiToolHashtags[group.key] || []).join(' '), group.key)}>
                          {aiToolCopied === group.key ? t.copied : t.copyAll}
                        </button>
                      </div>
                      <div className="ai-hashtag-tags">
                        {(aiToolHashtags[group.key] || []).map((tag, i) => (
                          <span key={i} className="ai-hashtag-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hashtag error */}
              {aiToolResult && aiToolModal === 'hashtags' && (
                <div className="ai-result-box" style={{ color: 'var(--warning-text)' }}>{aiToolResult}</div>
              )}
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {activeTab === 'marketing' && (
          <div role="tabpanel" id="tab-panel-marketing" aria-labelledby="tab-marketing">
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold)', margin: '0 0 0.35rem' }}>{t.marketingTab}</h2>
            </div>

            {/* Sub-tabs */}
            <div className="bc-sub-tabs">
              <button className={`bc-sub-tab${bcSubTab === 'broadcasts' ? ' bc-sub-tab-active' : ''}`} onClick={() => setBcSubTab('broadcasts')}>{t.broadcastsSubTab}</button>
              <button className={`bc-sub-tab${bcSubTab === 'workflows' ? ' bc-sub-tab-active' : ''}`} onClick={() => setBcSubTab('workflows')}>{t.workflowsSubTab}</button>
              <button className={`bc-sub-tab`} disabled style={{ opacity: 0.5, cursor: 'default' }}>{t.pipelineSubTab}<span className="bc-sub-tab-badge">{t.comingSoon}</span></button>
            </div>

            {bcSubTab === 'broadcasts' && bcView === 'list' && (
              <div>
                <button className="gold-btn" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setBcView('compose')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {t.newBroadcast}
                </button>

                {broadcasts.length === 0 && (
                  <div className="bc-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1" style={{ marginBottom: '1rem' }}><path d="M3 11V3h4l3 4h10v4H3zm0 2h18l-1.5 8H4.5L3 13z"/></svg>
                    <p>{t.noBroadcasts}</p>
                  </div>
                )}

                {broadcasts.map(bc => (
                  <div key={bc.id} className="bc-card" onClick={() => bcViewDetail(bc)}>
                    <div className="bc-card-header">
                      <div className="bc-card-title">{bc.title}</div>
                      <span className={`bc-status bc-status-${bc.status || 'draft'}`}>
                        {bc.status === 'sent' ? t.broadcastSent : bc.status === 'scheduled' ? t.broadcastScheduled : bc.status === 'sending' ? t.broadcastSending : t.broadcastDraft}
                      </span>
                    </div>
                    <div className="bc-card-meta">
                      {(bc.channels || []).includes('email') && (
                        <span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
                          {t.emailChannel}
                        </span>
                      )}
                      {(bc.channels || []).includes('whatsapp') && (
                        <span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                          {t.whatsappChannel}
                        </span>
                      )}
                      <span>{new Date(bc.created_at).toLocaleDateString()}</span>
                      {bc.sent_count != null && <span>{bc.sent_count} {t.statsSent.toLowerCase()}</span>}
                    </div>
                    {bc.status === 'sent' && (
                      <>
                        <div className="bc-stats-row">
                          <div className="bc-stat">
                            <div className="bc-stat-value">{bc.sent_count || 0}</div>
                            <div className="bc-stat-label">{t.statsSent}</div>
                          </div>
                          <div className="bc-stat">
                            <div className="bc-stat-value">{bc.delivered_count || bc.sent_count || 0}</div>
                            <div className="bc-stat-label">{t.statsDelivered}</div>
                          </div>
                          <div className="bc-stat">
                            <div className="bc-stat-value">{bc.opened_count || 0}{bc.sent_count ? ` (${Math.round(((bc.opened_count || 0) / bc.sent_count) * 100)}%)` : ''}</div>
                            <div className="bc-stat-label">{t.statsOpened}</div>
                          </div>
                          <div className="bc-stat">
                            <div className="bc-stat-value">{bc.clicked_count || 0}{bc.sent_count ? ` (${Math.round(((bc.clicked_count || 0) / bc.sent_count) * 100)}%)` : ''}</div>
                            <div className="bc-stat-label">{t.statsClicked}</div>
                          </div>
                        </div>
                        {bc.sent_count > 0 && (
                          <div className="bc-open-bar">
                            <div className="bc-open-bar-fill" style={{ width: `${Math.round(((bc.opened_count || 0) / bc.sent_count) * 100)}%` }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* BROADCAST COMPOSER */}
            {bcSubTab === 'broadcasts' && bcView === 'compose' && (
              <div>
                <button style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }} onClick={() => setBcView('list')}>
                  &larr; {t.backToBroadcasts}
                </button>

                <div className="bc-composer-section">
                  <div className="bc-composer-label">{t.campaignName}</div>
                  <input className="field-input" placeholder={t.campaignNamePlaceholder} value={bcTitle} onChange={e => setBcTitle(e.target.value)} />
                </div>

                <div className="bc-composer-section">
                  <div className="bc-composer-label">{t.mergeTags}</div>
                  <div className="bc-merge-chips">
                    {['{first_name}', '{landing_page_url}', '{referral_link}'].map(tag => (
                      <button key={tag} className="bc-merge-chip" onClick={() => bcInsertMergeTag(tag)}>{tag}</button>
                    ))}
                  </div>
                  <div className="bc-composer-label">{t.messageLabel}</div>
                  <textarea className="field-textarea" rows={8} placeholder={t.messagePlaceholder} value={bcMessage} onChange={e => setBcMessage(e.target.value)} />
                </div>

                <div className="bc-composer-section">
                  <div className="bc-composer-label">{t.channelsLabel}</div>
                  <div className="bc-channel-row">
                    <div className={`bc-channel-opt${bcChannels.has('email') ? ' bc-channel-active' : ''}`} onClick={() => bcToggleChannel('email')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
                      {t.emailChannel}
                    </div>
                    <div className={`bc-channel-opt${bcChannels.has('whatsapp') ? ' bc-channel-active' : ''}`} onClick={() => bcToggleChannel('whatsapp')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      {t.whatsappChannel} <span className="bc-channel-hint">{t.whatsappHint}</span>
                    </div>
                    <div className={`bc-channel-opt${bcChannels.has('telegram') ? ' bc-channel-active' : ''}`} onClick={() => bcToggleChannel('telegram')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.2 4.4L2.4 10.6c-.6.2-.6 1.1 0 1.3l4.3 1.4 1.6 5.1c.2.5.8.7 1.2.4l2.3-1.9 4.5 3.3c.5.3 1.1 0 1.2-.5L21.2 4.4z"/></svg>
                      {t.telegramChannel} <span className="bc-channel-hint">{t.telegramHint}</span>
                    </div>
                  </div>
                </div>

                <div className="bc-composer-section">
                  <div className="bc-composer-label">{t.audienceLabel}</div>
                  <div className="bc-audience-row">
                    {([
                      { key: 'all' as const, label: t.audienceAll },
                      { key: 'verified' as const, label: t.audienceVerified },
                      { key: 'last7days' as const, label: t.audienceLast7 },
                      { key: 'last30days' as const, label: t.audienceLast30 },
                    ]).map(opt => (
                      <div key={opt.key} className={`bc-audience-opt${bcAudience === opt.key ? ' bc-audience-active' : ''}`} onClick={() => setBcAudience(opt.key)}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid', borderColor: bcAudience === opt.key ? 'var(--gold)' : 'var(--input-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {bcAudience === opt.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />}
                        </div>
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                {bcMessage.trim() && (
                  <div className="bc-composer-section">
                    <div className="bc-composer-label">{t.previewLabel}</div>
                    <div className="bc-preview-box">{bcPreviewMessage()}</div>
                  </div>
                )}

                <div className="bc-composer-section">
                  <div className="bc-composer-label">{t.scheduleLabel}</div>
                  <div className="bc-schedule-toggle">
                    <button className={`ai-pill${bcScheduleMode === 'now' ? ' ai-pill-active' : ''}`} onClick={() => setBcScheduleMode('now')}>{t.sendNow}</button>
                    <button className={`ai-pill${bcScheduleMode === 'later' ? ' ai-pill-active' : ''}`} onClick={() => setBcScheduleMode('later')}>{t.scheduleLater}</button>
                  </div>
                  {bcScheduleMode === 'later' && (
                    <input type="datetime-local" className="field-input" value={bcScheduleDate} onChange={e => setBcScheduleDate(e.target.value)} />
                  )}
                </div>

                <div className="bc-recipient-count">
                  {t.recipientCount.replace('{0}', String(bcRecipientCount))}
                </div>

                <button
                  className="gold-btn"
                  style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                  disabled={bcSending || !bcTitle.trim() || !bcMessage.trim() || bcChannels.size === 0 || bcRecipientCount === 0}
                  onClick={() => setBcConfirmOpen(true)}
                >
                  {bcSending ? t.broadcastSending : t.sendBroadcast}
                </button>
              </div>
            )}

            {/* BROADCAST DETAIL */}
            {bcSubTab === 'broadcasts' && bcView === 'detail' && bcDetailBroadcast && (
              <div>
                <button style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem', padding: 0 }} onClick={() => { setBcView('list'); setBcDetailBroadcast(null) }}>
                  &larr; {t.backToBroadcasts}
                </button>
                <div className="bc-card" style={{ cursor: 'default' }}>
                  <div className="bc-card-header">
                    <div className="bc-card-title">{bcDetailBroadcast.title}</div>
                    <span className={`bc-status bc-status-${bcDetailBroadcast.status || 'draft'}`}>
                      {bcDetailBroadcast.status === 'sent' ? t.broadcastSent : bcDetailBroadcast.status === 'scheduled' ? t.broadcastScheduled : bcDetailBroadcast.status === 'sending' ? t.broadcastSending : t.broadcastDraft}
                    </span>
                  </div>
                  {bcDetailBroadcast.status === 'sent' && (
                    <>
                      <div className="bc-stats-row">
                        <div className="bc-stat">
                          <div className="bc-stat-value">{bcDetailBroadcast.sent_count || 0}</div>
                          <div className="bc-stat-label">{t.statsSent}</div>
                        </div>
                        <div className="bc-stat">
                          <div className="bc-stat-value">{bcDetailBroadcast.delivered_count || bcDetailBroadcast.sent_count || 0}</div>
                          <div className="bc-stat-label">{t.statsDelivered}</div>
                        </div>
                        <div className="bc-stat">
                          <div className="bc-stat-value">{bcDetailBroadcast.opened_count || 0}{bcDetailBroadcast.sent_count ? ` (${Math.round(((bcDetailBroadcast.opened_count || 0) / bcDetailBroadcast.sent_count) * 100)}%)` : ''}</div>
                          <div className="bc-stat-label">{t.statsOpened}</div>
                        </div>
                        <div className="bc-stat">
                          <div className="bc-stat-value">{bcDetailBroadcast.clicked_count || 0}{bcDetailBroadcast.sent_count ? ` (${Math.round(((bcDetailBroadcast.clicked_count || 0) / bcDetailBroadcast.sent_count) * 100)}%)` : ''}</div>
                          <div className="bc-stat-label">{t.statsClicked}</div>
                        </div>
                      </div>
                      {bcDetailBroadcast.sent_count > 0 && (
                        <div className="bc-open-bar" style={{ marginBottom: '1rem' }}>
                          <div className="bc-open-bar-fill" style={{ width: `${Math.round(((bcDetailBroadcast.opened_count || 0) / bcDetailBroadcast.sent_count) * 100)}%` }} />
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <div className="bc-composer-label">{t.messageLabel}</div>
                    <div className="bc-preview-box">{bcDetailBroadcast.message}</div>
                  </div>
                </div>

                {/* Recipient list */}
                <div style={{ marginTop: '1rem' }}>
                  <div className="bc-composer-label">{t.viewRecipients} ({bcRecipients.length})</div>
                  {bcRecipients.map((r, i) => (
                    <div key={r.id || i} className="bc-detail-recipient">
                      <span style={{ color: 'var(--text-primary)' }}>{r.lead_name || r.lead_email || `Lead #${i + 1}`}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{r.channel}</span>
                        <span className={`bc-status bc-status-${r.status || 'sent'}`}>{r.status || 'sent'}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WORKFLOWS LIST */}
            {bcSubTab === 'workflows' && wfView === 'list' && (
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <button className="gold-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => wfOpenBuilder()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {t.wfNewWorkflow}
                  </button>
                  <button className="gold-btn" style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={() => { fetchWfTemplates(); setWfTemplatesOpen(true) }}>
                    {t.wfTemplateLibrary}
                  </button>
                </div>

                {workflows.length === 0 && (
                  <div className="bc-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1" style={{ marginBottom: '1rem' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <p>{t.wfNoWorkflows}</p>
                  </div>
                )}

                {workflows.map(wf => {
                  const counts = wfEnrollmentCounts[wf.id] || { enrolled: 0, completed: 0 }
                  const completionRate = counts.enrolled > 0 ? Math.round((counts.completed / counts.enrolled) * 100) : 0
                  return (
                    <div key={wf.id} className="bc-card" style={{ cursor: 'pointer' }} onClick={() => wfOpenBuilder(wf)}>
                      <div className="bc-card-header">
                        <div className="bc-card-title">{wf.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`bc-status bc-status-${wf.status === 'active' ? 'sent' : wf.status === 'paused' ? 'scheduled' : 'draft'}`}>
                            {wf.status === 'active' ? t.wfActive : wf.status === 'paused' ? t.wfPaused : t.wfDraft}
                          </span>
                          <div onClick={e => { e.stopPropagation(); wfToggleActive(wf) }} style={{ width: 40, height: 22, borderRadius: 11, background: wf.status === 'active' ? 'var(--gold)' : 'var(--input-border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: wf.status === 'active' ? 20 : 2, transition: 'left 0.2s' }} />
                          </div>
                        </div>
                      </div>
                      <div className="bc-card-meta">
                        <span>{({ lead_signup: t.wfTriggerLeadSignup, lead_inactive: t.wfTriggerLeadInactive, stage_change: t.wfTriggerStageChange, manual: t.wfTriggerManual, scheduled: t.wfTriggerScheduled } as Record<string, string>)[wf.trigger_type] || wf.trigger_type}</span>
                        <span>{t.wfEnrolled}: {counts.enrolled}</span>
                        <span>{t.wfCompletionRate}: {completionRate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* WORKFLOW CANVAS BUILDER */}
            {bcSubTab === 'workflows' && wfView === 'builder' && (
              <div style={{ margin: '-1rem', minHeight: '80vh' }}>
                <WorkflowCanvas
                  distributor={distributor}
                  supabase={supabase}
                  workflow={wfEditing}
                  templates={wfTemplates}
                  workflows={workflows}
                  t={t}
                  lang={lang}
                  onBack={() => setWfView('list')}
                  onSaved={() => { fetchWorkflows(); setWfView('list') }}
                  showToast={showToast}
                />
              </div>
            )}
          </div>
        )}

        {/* Template modal moved into WorkflowCanvas component */}

        {/* BROADCAST CONFIRM MODAL */}
        {bcConfirmOpen && (
          <div className="bc-confirm-overlay" onClick={e => { if (e.target === e.currentTarget) setBcConfirmOpen(false) }}>
            <div className="bc-confirm-box">
              <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>{t.confirmSendTitle}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                {t.confirmSendMsg.replace('{0}', String(bcRecipientCount)).replace('{1}', Array.from(bcChannels).join(', '))}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="gold-btn" onClick={bcSend} disabled={bcSending}>
                  {bcSending ? t.broadcastSending : t.confirmBtn}
                </button>
                <button style={{ background: 'transparent', border: '1px solid var(--input-border)', borderRadius: 8, padding: '0.5rem 1.25rem', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }} onClick={() => setBcConfirmOpen(false)}>
                  {t.cancelBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WHATSAPP LINKS MODAL */}
        {bcWhatsappLinks.length > 0 && (
          <div className="bc-confirm-overlay" onClick={e => { if (e.target === e.currentTarget) setBcWhatsappLinks([]) }}>
            <div className="bc-confirm-box" style={{ textAlign: 'left' }}>
              <h3 style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>{t.whatsappLinks}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>{t.whatsappLinksDesc}</p>
              <ul className="bc-wa-list">
                {bcWhatsappLinks.map((link, i) => (
                  <li key={i}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a></li>
                ))}
              </ul>
              {bcChannels.has('telegram') && (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>{t.telegramComingSoon}</p>
              )}
              <button className="gold-btn" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setBcWhatsappLinks([])}>OK</button>
            </div>
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <MetricsTab
            leads={leads}
            pageViews={pageViews}
            period={metricPeriod}
            setPeriod={setMetricPeriod}
            loading={metricsLoading}
            distributor={distributor}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            pageViewHistory={pageViewHistory}
            t={t}
          />
        )}

        {/* BETA TEST TAB */}
        {activeTab === 'beta' && isBetaTester && (() => {
          const betaSections = [
            { key: 'sec1', label: t.betaSec1, items: [
              'Homepage loads without errors',
              'Click Sign Up — registration form appears',
              'Password hint shows (min 6 characters)',
              'Submit with valid email — confirmation message appears',
              'Verification email arrives (from noreply@primeverseaccess.com)',
              'Email has 1Move branding (dark theme, gold accents, logo)',
              'Click verification link — redirects to dashboard',
            ]},
            { key: 'sec2', label: t.betaSec2, items: [
              'Dashboard loads with all tabs visible',
              'Upload profile photo — preview works correctly',
              'Enter full name, region, niche',
              'Add referral link (must start with https://puvip.co/la-partners/)',
              'Invalid referral link shows error message',
              'Add at least 2 social media links (incl. Telegram and WhatsApp)',
              'Telegram: full URL accepted (https://t.me/username)',
              'WhatsApp: phone number with country code accepted',
              'Select a language using globe icon',
              'Language persists after page refresh',
            ]},
            { key: 'sec3', label: t.betaSec3, items: [
              'Bio assistant stepper opens correctly',
              'Answer all 5 questions + choose tone',
              'Generated bio is in FIRST PERSON (I, my, me)',
              'Bio uses your REAL NAME (not invented)',
              'Preview displays correctly',
              'Bio saves to profile',
            ]},
            { key: 'sec4', label: t.betaSec4, items: [
              'Choose a unique slug — page generates',
              'Duplicate slug shows inline error',
              'Landing page loads at primeverseaccess.com/[slug]',
              'Hero text shows your name correctly',
              'Profile photo displays',
              'Bio text appears',
              'Social media icons show (only filled ones)',
              'Telegram and WhatsApp icons visible',
              'Risk disclaimer says "lose all of invested capital"',
              '"How it works" — all 5 steps visible',
            ]},
            { key: 'sec5', label: t.betaSec5, items: [
              'Globe icon visible in header',
              'Language modal opens (centered, dark/gold)',
              'Switch language — content translates',
              'Bio translates dynamically',
              'Modal closes on backdrop click',
            ]},
            { key: 'sec6', label: t.betaSec6, items: [
              '"Share My Page" button visible on dashboard',
              'Share opens modal (WhatsApp, Telegram, Messenger, Email, FB, X, Copy Link)',
              'Copy link works — paste shows correct URL',
              'Open landing page in different browser',
              'Lead signup form works',
              'Lead appears in Leads tab',
            ]},
            { key: 'sec7', label: t.betaSec7, items: [
              'Email 1: Verification — branded, not Supabase default',
              'Email 2: Welcome — received after verification',
              'Email 4: Page Live! — after generating page',
              'Email 6: New Lead Alert — after test lead signs up',
              'All emails: 1Move branding, correct language',
              'No emails say "reply to this email"',
              'Emails 3 & 5: note for 24h delayed verification',
            ]},
            { key: 'sec8', label: t.betaSec8, items: [
              'Metrics tab — Rolex gauges display correctly',
              'My Profile — all fields editable',
              '"Update my details" saves without new page generation',
              'Leads tab — shows registered leads',
              'Marketing Resources — AI tools and resource cards visible with working links',
            ]},
          ]
          const allItems = betaSections.flatMap(s => s.items)
          const totalTests = allItems.length
          const completed = allItems.filter(i => betaResults[i]?.status === 'pass' || betaResults[i]?.status === 'fail').length
          const passed = allItems.filter(i => betaResults[i]?.status === 'pass').length
          const failed = allItems.filter(i => betaResults[i]?.status === 'fail').length
          const remaining = totalTests - completed

          const cycleStatus = (item: string) => {
            const current = betaResults[item]?.status || ''
            const next = current === '' ? 'pass' : current === 'pass' ? 'fail' : ''
            if (next === '') {
              // Delete from DB using tester_id + test_item (unique constraint)
              supabase.from('test_results').delete().eq('tester_id', distributor?.user_id).eq('test_item', item).then(() => {})
              setBetaResults(prev => { const n = { ...prev }; delete n[item]; return n })
              setBetaFailItem(null)
              return
            }
            const section = betaSections.find(s => s.items.includes(item))?.label || ''
            const row = { tester_id: distributor?.user_id, tester_email: distributor?.email, tester_name: distributor?.name, section, test_item: item, status: next, comment: betaResults[item]?.comment || '', platform: 'systm8' as const, updated_at: new Date().toISOString() }
            // Upsert on (tester_id, test_item) — immediately persists to Supabase
            supabase.from('test_results').upsert(row, { onConflict: 'tester_id,test_item' }).select('id').single().then(({ data }) => {
              setBetaResults(prev => ({ ...prev, [item]: { status: next, comment: prev[item]?.comment || '', id: data?.id } }))
            })
            // Optimistic UI update
            setBetaResults(prev => ({ ...prev, [item]: { ...prev[item], status: next, comment: prev[item]?.comment || '' } }))
            if (next === 'fail') { setBetaFailItem(item); setBetaBugForm({ title: item, description: '', severity: 'major' }) }
            else setBetaFailItem(null)
          }

          const saveComment = (item: string, comment: string) => {
            setBetaResults(prev => ({ ...prev, [item]: { ...prev[item], status: prev[item]?.status || '', comment } }))
            // Save comment to Supabase using tester_id + test_item
            supabase.from('test_results').update({ comment, updated_at: new Date().toISOString() }).eq('tester_id', distributor?.user_id).eq('test_item', item).then(() => {})
          }

          const uploadScreenshot = async (item: string, file: File) => {
            setBetaUploading(item)
            const ext = file.name.split('.').pop() || 'png'
            const path = `${distributor?.id}/${Date.now()}.${ext}`
            const { error } = await supabase.storage.from('beta-screenshots').upload(path, file)
            setBetaUploading(null)
            if (error) { showToast(t.errorPrefix + error.message); return }
            const { data: urlData } = supabase.storage.from('beta-screenshots').getPublicUrl(path)
            const url = urlData?.publicUrl || ''
            await supabase.from('test_results').update({ screenshot_url: url, updated_at: new Date().toISOString() }).eq('tester_id', distributor?.user_id).eq('test_item', item)
            showToast('Screenshot uploaded')
          }

          const submitBugReport = async () => {
            if (!betaBugForm.title || !betaBugForm.description) return
            await supabase.from('bug_reports').insert({
              reporter_id: distributor?.user_id,
              reporter_email: distributor?.email,
              reporter_name: distributor?.name,
              platform: 'systm8',
              severity: betaBugForm.severity,
              title: betaBugForm.title,
              description: betaBugForm.description,
              language: lang,
              device_info: navigator.userAgent,
            })
            showToast('Bug report submitted')
            setBetaFailItem(null)
            setBetaBugForm({ title: '', description: '', severity: 'major' })
          }

          const toggleSection = (key: string) => {
            setBetaOpenSections(prev => {
              const n = new Set(prev)
              if (n.has(key)) n.delete(key); else n.add(key)
              return n
            })
          }

          const progressPct = totalTests > 0 ? Math.round((completed / totalTests) * 100) : 0

          return (
          <div role="tabpanel" id="tab-panel-beta" aria-labelledby="tab-beta">
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--gold)', margin: '0 0 0.5rem' }}>{t.betaTitle}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>{t.betaSubtitle}</p>

              {/* Progress bar */}
              <div style={{ background: '#1a1a2e', borderRadius: 8, padding: '12px 16px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: '#E0E0E0' }}>{completed}/{totalTests} {t.betaProgress}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{progressPct}%</span>
                </div>
                <div style={{ height: 8, background: '#2a2a4a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #D4A843, #e6c468)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.82rem' }}>
                <span><span style={{ color: '#4ade80', fontWeight: 700 }}>{passed}</span> <span style={{ color: '#888' }}>{t.betaPassed}</span></span>
                <span><span style={{ color: '#f87171', fontWeight: 700 }}>{failed}</span> <span style={{ color: '#888' }}>{t.betaFailed}</span></span>
                <span><span style={{ color: '#888', fontWeight: 700 }}>{remaining}</span> <span style={{ color: '#888' }}>{t.betaRemaining}</span></span>
              </div>
            </div>

            {/* Test sections */}
            {betaSections.map(section => {
              const sectionCompleted = section.items.filter(i => betaResults[i]?.status === 'pass' || betaResults[i]?.status === 'fail').length
              const isOpen = betaOpenSections.has(section.key)
              return (
                <div key={section.key} style={{ marginBottom: '0.75rem', background: '#16213E', borderRadius: 8, border: '1px solid #2a2a4a', overflow: 'hidden' }}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#E0E0E0' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{section.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', background: sectionCompleted === section.items.length ? '#D4A843' : '#2a2a4a', color: sectionCompleted === section.items.length ? '#1A1A2E' : '#888', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                        {sectionCompleted}/{section.items.length}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                    </span>
                  </button>

                  {/* Section items */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #2a2a4a' }}>
                      {section.items.map(item => {
                        const result = betaResults[item]
                        const status = result?.status || ''
                        return (
                          <div key={item} style={{ borderBottom: '1px solid #1a1a2e' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
                              {/* Status toggle */}
                              <button
                                onClick={() => cycleStatus(item)}
                                style={{ width: 28, height: 28, minWidth: 28, borderRadius: 6, border: `2px solid ${status === 'pass' ? '#4ade80' : status === 'fail' ? '#f87171' : '#555'}`, background: status === 'pass' ? 'rgba(74,222,128,0.15)' : status === 'fail' ? 'rgba(248,113,113,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: status === 'pass' ? '#4ade80' : status === 'fail' ? '#f87171' : '#555', fontSize: '14px', fontWeight: 700 }}
                              >
                                {status === 'pass' ? '✓' : status === 'fail' ? '✕' : ''}
                              </button>
                              {/* Item text */}
                              <span style={{ flex: 1, fontSize: '0.84rem', color: status ? '#E0E0E0' : '#999', lineHeight: 1.4 }}>{item}</span>
                              {/* Screenshot button */}
                              <label style={{ cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }} title={t.betaScreenshot}>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f && result?.id) uploadScreenshot(item, f) }} />
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={betaUploading === item ? 'var(--gold)' : 'currentColor'} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              </label>
                            </div>
                            {/* Comment field */}
                            {status && (
                              <div style={{ padding: '0 16px 8px 54px' }}>
                                <input
                                  type="text"
                                  value={result?.comment || ''}
                                  onChange={e => saveComment(item, e.target.value)}
                                  placeholder={t.betaAddNote}
                                  style={{ width: '100%', background: '#0f0f23', border: '1px solid #2a2a4a', borderRadius: 4, padding: '6px 10px', color: '#E0E0E0', fontSize: '0.78rem', outline: 'none' }}
                                />
                              </div>
                            )}
                            {/* Bug report slide-down for failed items */}
                            {betaFailItem === item && status === 'fail' && (
                              <div style={{ padding: '8px 16px 12px 54px', background: 'rgba(248,113,113,0.05)', borderTop: '1px solid rgba(248,113,113,0.2)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <input
                                    type="text"
                                    value={betaBugForm.title}
                                    onChange={e => setBetaBugForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder={t.betaBugTitle}
                                    style={{ background: '#0f0f23', border: '1px solid #2a2a4a', borderRadius: 4, padding: '6px 10px', color: '#E0E0E0', fontSize: '0.82rem', outline: 'none' }}
                                  />
                                  <textarea
                                    value={betaBugForm.description}
                                    onChange={e => setBetaBugForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder={t.betaBugDesc}
                                    rows={3}
                                    style={{ background: '#0f0f23', border: '1px solid #2a2a4a', borderRadius: 4, padding: '6px 10px', color: '#E0E0E0', fontSize: '0.82rem', outline: 'none', resize: 'vertical' }}
                                  />
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <select
                                      value={betaBugForm.severity}
                                      onChange={e => setBetaBugForm(p => ({ ...p, severity: e.target.value }))}
                                      style={{ background: '#0f0f23', border: '1px solid #2a2a4a', borderRadius: 4, padding: '6px 10px', color: '#E0E0E0', fontSize: '0.82rem', outline: 'none', flex: 1 }}
                                    >
                                      <option value="critical">{t.betaBugCritical}</option>
                                      <option value="major">{t.betaBugMajor}</option>
                                      <option value="minor">{t.betaBugMinor}</option>
                                      <option value="cosmetic">{t.betaBugCosmetic}</option>
                                    </select>
                                    <button
                                      onClick={submitBugReport}
                                      style={{ background: '#f87171', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                      {t.betaBugSubmit}
                                    </button>
                                  </div>
                                  <button onClick={() => setBetaFailItem(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}>✕ close</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Submit All / Badge */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {betaSubmitted ? (
                <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213E 100%)', border: '2px solid #D4A843', borderRadius: 12, padding: '24px 20px', display: 'inline-block' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏅</div>
                  <div style={{ color: '#D4A843', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>{t.betaFoundingMember}</div>
                  <div style={{ color: '#888', fontSize: '0.82rem', marginTop: 6 }}>{completed} {t.betaThankYou}</div>
                </div>
              ) : (
                <button
                  onClick={() => setBetaSubmitted(true)}
                  disabled={completed === 0}
                  style={{ background: completed > 0 ? '#D4A843' : '#333', color: completed > 0 ? '#1A1A2E' : '#666', border: 'none', borderRadius: 6, padding: '14px 32px', fontSize: '1rem', fontWeight: 700, cursor: completed > 0 ? 'pointer' : 'default', letterSpacing: '0.5px' }}
                >
                  {t.betaSubmitAll}
                </button>
              )}
            </div>
          </div>
          )
        })()}

      </div>

      {/* ── Bug Report FAB ── */}
      <button className="bug-fab" onClick={() => { setBugOpen(true); setBugSent(false); setBugError('') }} aria-label={t.reportBug} title={t.reportBug}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
          <path d="M12 20v2M6 13H2M6 17H3M18 13h4M18 17h3" />
        </svg>
      </button>

      {/* ── Bug Report Modal ── */}
      {bugOpen && (
        <div className="bug-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBugOpen(false) }}>
          <div className="bug-modal">
            {bugSent ? (
              <div className="bug-success-msg">
                <span style={{ fontSize: '2.5rem' }}>✓</span>
                <span>{t.bugSuccess}</span>
              </div>
            ) : (
              <>
                <div className="bug-modal-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
                    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
                    <path d="M12 20v2M6 13H2M6 17H3M18 13h4M18 17h3" />
                  </svg>
                  {t.bugModalTitle}
                </div>
                <div className="bug-modal-instructions">{t.bugModalInstructions}</div>

                <div className="bug-field">
                  <label>{t.bugWhatHappened} *</label>
                  <textarea value={bugWhat} onChange={e => setBugWhat(e.target.value)} />
                </div>

                <div className="bug-field">
                  <label>{t.bugWhatExpected} *</label>
                  <textarea value={bugExpected} onChange={e => setBugExpected(e.target.value)} />
                </div>

                <div className="bug-field">
                  <label>{t.bugWhichPage}</label>
                  <select value={bugPage} onChange={e => setBugPage(e.target.value)}>
                    <option value="Dashboard">{t.bugPageDashboard}</option>
                    <option value="Landing page">{t.bugPageLanding}</option>
                    <option value="Login">{t.bugPageLogin}</option>
                    <option value="Other">{t.bugPageOther}</option>
                  </select>
                </div>

                <div className="bug-field">
                  <label>{t.bugScreenshot} *</label>
                  <input
                    ref={bugFileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f && f.size <= 5 * 1024 * 1024) setBugFile(f)
                      else if (f) setBugError('Max 5MB')
                    }}
                  />
                  <div
                    className={`bug-file-zone${bugFile ? ' bug-file-zone-active' : ''}`}
                    onClick={() => bugFileRef.current?.click()}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 4 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {bugFile ? '' : t.bugScreenshot}
                    </div>
                    {bugFile && <div className="bug-file-name">{bugFile.name}</div>}
                    <div className="bug-file-hint">{t.bugScreenshotHint}</div>
                  </div>
                </div>

                <div className="bug-field">
                  <label>{t.bugSeverity}</label>
                  <select value={bugSeverity} onChange={e => setBugSeverity(e.target.value)}>
                    <option value="Critical">{t.bugSeverityCritical}</option>
                    <option value="High">{t.bugSeverityHigh}</option>
                    <option value="Medium">{t.bugSeverityMedium}</option>
                    <option value="Low">{t.bugSeverityLow}</option>
                  </select>
                </div>

                {bugError && <div className="bug-error">{bugError}</div>}

                <div className="bug-actions">
                  <button onClick={submitBugReport} disabled={bugSending} className="gold-btn">
                    {bugSending ? t.bugSending : t.bugSend}
                  </button>
                  <button onClick={() => setBugOpen(false)} className="btn-outline">{t.bugCancel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Rolex Gauge component ────────────────────────────────────────────────── */
function RolexGauge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  // Needle rotates from 220° (0%) to 500° (100%) — full sweep through top
  const needleAngle = 220 + pct * 280

  // Gold number labels positioned absolutely around the edge
  const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const centerX = 110, centerY = 110, numRadius = 65

  const numberPositions = numbers.map((n, i) => {
    const angleDeg = 220 + (i / (numbers.length - 1)) * 280
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      n,
      left: centerX + Math.cos(angleRad) * numRadius,
      top: centerY + Math.sin(angleRad) * numRadius,
    }
  })

  return (
    <div className="rolex-gauge-wrap">
      {/* CSS bezel */}
      <div className="rolex-gauge-bezel" />
      {/* Inner ring for depth */}
      <div className="rolex-gauge-inner-ring" />
      {/* Number labels */}
      {numberPositions.map(p => (
        <span key={p.n} className="rolex-gauge-number"
          style={{ left: p.left, top: p.top }}>
          {p.n}
        </span>
      ))}
      {/* SVG tick marks + needle */}
      <svg className="rolex-gauge-overlay" viewBox="0 0 220 220">
        <defs>
          <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b6914" />
            <stop offset="50%" stopColor="#d4a537" />
            <stop offset="100%" stopColor="#f5d77a" />
          </linearGradient>
          <filter id="needleGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Tick marks */}
        {Array.from({ length: 51 }, (_, i) => {
          const angleDeg = 220 + (i / 50) * 280
          const angleRad = (angleDeg * Math.PI) / 180
          const isMajor = i % 5 === 0
          const outerR = 100
          const innerR = isMajor ? 88 : 93
          const x1 = 110 + Math.cos(angleRad) * outerR
          const y1 = 110 + Math.sin(angleRad) * outerR
          const x2 = 110 + Math.cos(angleRad) * innerR
          const y2 = 110 + Math.sin(angleRad) * innerR
          return (
            <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? '#d4a537' : 'rgba(212,165,55,0.4)'}
              strokeWidth={isMajor ? 2 : 0.8}
            />
          )
        })}
        <g className="rolex-gauge-needle-g" style={{ transform: `rotate(${needleAngle}deg)` }}
          filter="url(#needleGlow)">
          <polygon
            points="110,108 110,112 172,110"
            fill="url(#needleGrad)"
          />
        </g>
      </svg>
      {/* Center dot */}
      <div className="rolex-gauge-center" />
    </div>
  )
}

/* ─── Mini Line Chart ──────────────────────────────────────────────────────── */
function ViewsChart({ data, noDataLabel }: { data: { date: string; count: number }[]; noDataLabel?: string }) {
  if (!data.length) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{noDataLabel || 'No data yet'}</div>

  const maxVal = Math.max(...data.map(d => d.count), 1)
  const padL = 36, padR = 16, padT = 12, padB = 28
  const w = 600, h = 200
  const chartW = w - padL - padR
  const chartH = h - padT - padB

  const points = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + chartH - (d.count / maxVal) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`

  // Y-axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((maxVal / ySteps) * i))

  // X-axis labels (show ~6 evenly spaced)
  const xLabelCount = Math.min(data.length, 6)
  const xIndices = Array.from({ length: xLabelCount }, (_, i) => Math.round((i / (xLabelCount - 1)) * (data.length - 1)))

  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,165,55,0.25)" />
          <stop offset="100%" stopColor="rgba(212,165,55,0)" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {yLabels.map((v, i) => {
        const y = padT + chartH - (v / maxVal) * chartH
        return <line key={i} x1={padL} y1={y} x2={w - padR} y2={y} className="chart-grid-line" />
      })}
      {/* Y labels */}
      {yLabels.map((v, i) => {
        const y = padT + chartH - (v / maxVal) * chartH
        return <text key={i} x={padL - 6} y={y + 3} className="chart-y-label" textAnchor="end">{v}</text>
      })}
      {/* Area */}
      <path d={areaPath} className="chart-area" />
      {/* Line */}
      <path d={linePath} className="chart-line" />
      {/* Dots on last 3 points */}
      {points.slice(-3).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="chart-dot" />
      ))}
      {/* X labels */}
      {xIndices.map(idx => {
        const p = points[idx]
        const label = p.date.slice(5) // MM-DD
        return <text key={idx} x={p.x} y={h - 6} className="chart-x-label" textAnchor="middle">{label}</text>
      })}
    </svg>
  )
}

/* ─── Metrics tab ──────────────────────────────────────────────────────────── */
function MetricsTab({ leads, pageViews, period, setPeriod, loading, distributor, chartPeriod, setChartPeriod, pageViewHistory, t }: {
  leads: any[]; pageViews: number; period: string;
  setPeriod: (p: 'day' | 'week' | 'month' | 'all') => void; loading: boolean;
  distributor: any; chartPeriod: '7d' | '30d' | '90d';
  setChartPeriod: (p: '7d' | '30d' | '90d') => void;
  pageViewHistory: { date: string; count: number }[];
  t: Record<string, string>;
}) {
  const now = new Date()
  const cutoff = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d }
  const startOf = (unit: 'day' | 'week' | 'month' | 'all'): Date | null => {
    if (unit === 'all') return null
    if (unit === 'day') { const d = new Date(now); d.setHours(0,0,0,0); return d }
    if (unit === 'week') return cutoff(7)
    return cutoff(30)
  }
  const start = startOf(period as 'day' | 'week' | 'month' | 'all')
  const filtered = start ? leads.filter(l => new Date(l.created_at) >= start) : leads
  const registered = filtered.length
  const approved = filtered.filter(l => l.uid_verified).length
  const pending = filtered.filter(l => !l.uid_verified).length
  const convRate = registered > 0 ? Math.round((approved / registered) * 100) : 0

  // Profile strength
  const hasImage = !!distributor?.profile_image
  const hasBio = !!distributor?.bio
  const hasSlug = !!distributor?.slug
  const hasReferral = !!distributor?.referral_link
  const hasSocial = !!(distributor?.social_tiktok || distributor?.social_instagram || distributor?.social_facebook || distributor?.social_snapchat || distributor?.social_linkedin || distributor?.social_youtube || distributor?.social_other)
  const strengthParts = [hasImage, hasBio, hasSlug, hasReferral, hasSocial]
  const profileStrength = strengthParts.filter(Boolean).length * 20

  // Approval rate
  const totalLeads = leads.length
  const totalApproved = leads.filter(l => l.uid_verified).length
  const approvalRate = totalLeads > 0 ? Math.round((totalApproved / totalLeads) * 100) : 0

  const periods: { key: 'day' | 'week' | 'month' | 'all'; label: string }[] = [
    { key: 'day', label: t.daily }, { key: 'week', label: t.weekly },
    { key: 'month', label: t.monthly }, { key: 'all', label: t.allTime },
  ]

  return (
    <div role="tabpanel" id="tab-panel-metrics" aria-labelledby="tab-metrics">

      {/* Period selector */}
      <div className="period-row" style={{ marginBottom: '1.75rem' }}>
        {periods.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`period-btn${period === p.key ? ' period-btn-active' : ''}`}
            aria-pressed={period === p.key}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Metric Cards ── */}
      <div className="metric-cards-row">
        <div className="metric-card">
          <div className="metric-card-label">{t.pageViews}</div>
          <div className="metric-card-value">{loading ? '—' : pageViews.toLocaleString()}</div>
          <div className="metric-card-sub">{t.uniqueVisitors}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">{t.leadsTab}</div>
          <div className="metric-card-value">{registered}</div>
          <div className="metric-card-sub">{pending} {t.pending} · {approved} {t.approved}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">{t.conversions}</div>
          <div className="metric-card-value">{approved}</div>
          <div className="metric-card-change neutral">{convRate}% {t.rate}</div>
        </div>
      </div>

      {/* ── Rolex Gauge Instruments ── */}
      <div className="gauges-row">
        <div className="rolex-gauge-card">
          <RolexGauge value={convRate} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.conversionRate}</div>
          <div className="rolex-gauge-value">{convRate}%</div>
          <div className="rolex-gauge-sub">{t.regToApproved}</div>
        </div>
        <div className="rolex-gauge-card">
          <RolexGauge value={profileStrength} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.profileStrength}</div>
          <div className="rolex-gauge-value">{profileStrength}%</div>
          <div className="strength-items">
            {[
              { ok: hasImage, text: t.profileImage },
              { ok: hasBio, text: t.bio },
              { ok: hasSlug, text: t.customUrl },
              { ok: hasReferral, text: t.referralLink },
              { ok: hasSocial, text: t.socialMedia },
            ].map(s => (
              <div key={s.text} className="strength-item">
                <span className={s.ok ? 'strength-check' : 'strength-miss'}>{s.ok ? '✓' : '○'}</span>
                <span style={s.ok ? { color: 'var(--text-secondary)' } : {}}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rolex-gauge-card">
          <RolexGauge value={approvalRate} max={100} label="%" />
          <div className="rolex-gauge-title-text">{t.approvalRate}</div>
          <div className="rolex-gauge-value">{approvalRate}%</div>
          <div className="rolex-gauge-sub">{t.xOfYVerified.replace('{0}', String(totalApproved)).replace('{1}', String(totalLeads))}</div>
        </div>
      </div>

      {/* ── Line Chart ── */}
      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-title">{t.pageViewsOverTime}</div>
          <div className="chart-tabs">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setChartPeriod(p)}
                className={`chart-tab${chartPeriod === p ? ' chart-tab-active' : ''}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ViewsChart data={pageViewHistory} noDataLabel={t.noDataYet} />
      </div>

      {/* ── Lead Breakdown ── */}
      <div className="metrics-summary">
        <div className="metrics-summary-title">{t.leadBreakdown}</div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#d4a537' }} />
            <span className="metrics-row-label">{t.pageViews}</span>
          </div>
          <span className="metrics-row-value">{loading ? '—' : pageViews.toLocaleString()}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#c9a84c' }} />
            <span className="metrics-row-label">{t.registeredLeads}</span>
          </div>
          <span className="metrics-row-value">{registered}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#f4a742' }} />
            <span className="metrics-row-label">{t.pendingVerification}</span>
          </div>
          <span className="metrics-row-value">{pending}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#6dc07f' }} />
            <span className="metrics-row-label">{t.approvedHeader}</span>
          </div>
          <span className="metrics-row-value">{approved}</span>
        </div>
        <div className="metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="metrics-dot" style={{ background: '#e8c975' }} />
            <span className="metrics-row-label">{t.conversionRateLower}</span>
          </div>
          <span className="metrics-row-value">{convRate}%</span>
        </div>
      </div>

    </div>
  )
}
