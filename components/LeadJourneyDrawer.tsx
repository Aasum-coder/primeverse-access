'use client';
import React from 'react';

const RolexDivider = () => (
  <div style={{ display:'flex', alignItems:'center', margin:'0 auto', width:'100%', gap:'6px', padding:'0 16px' }}>
    <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, #c9a84c88)' }}/>
    <div style={{ width:'28px', height:'28px', borderRadius:'50%', border:'1.5px solid #c9a84c', background:'radial-gradient(circle at 30% 30%, #f0d08022, #080808)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 8px rgba(201,168,76,0.4), inset 0 0 4px rgba(240,208,128,0.2)', position:'relative' }}>
      <div style={{ position:'absolute', top:'2px', left:'50%', transform:'translateX(-50%)', width:'3px', height:'3px', background:'#f0d080', borderRadius:'50%', boxShadow:'0 0 3px #f0d080' }}/>
      <div style={{ position:'absolute', bottom:'2px', left:'50%', transform:'translateX(-50%)', width:'3px', height:'3px', background:'#f0d080', borderRadius:'50%', boxShadow:'0 0 3px #f0d080' }}/>
      <div style={{ position:'absolute', left:'2px', top:'50%', transform:'translateY(-50%)', width:'3px', height:'3px', background:'#f0d080', borderRadius:'50%', boxShadow:'0 0 3px #f0d080' }}/>
      <div style={{ position:'absolute', right:'2px', top:'50%', transform:'translateY(-50%)', width:'3px', height:'3px', background:'#f0d080', borderRadius:'50%', boxShadow:'0 0 3px #f0d080' }}/>
    </div>
    <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, #c9a84c88)' }}/>
  </div>
);

const EMAIL_LABELS: Record<string, string> = {
  welcome: 'Welcome email sent',
  profile_nudge: 'Profile reminder sent',
  page_live: 'Page live notification sent',
  first_share: 'First share guide sent',
  new_lead: 'New lead alert sent',
  uid_reminder: 'UID reminder sent',
  weekly_summary: 'Weekly summary sent',
  verification: 'Verification email sent',
  approved: 'Access approved email sent',
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

const StepRow = ({ done, label, date, status, isEmail }: { done:boolean, label:string, date?:string, status?:string, isEmail?:boolean }) => (
  <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 16px', background: done ? 'rgba(201,168,76,0.05)' : 'transparent', borderLeft: done ? (isEmail ? '2px solid #4a6fa5' : '2px solid #c9a84c') : '2px solid #333', margin:'0 16px', borderRadius:'0 6px 6px 0' }}>
    <span style={{ fontSize:'16px', marginTop:'1px', color: done ? (isEmail ? '#7a9fd4' : '#c9a84c') : '#555' }}>
      {isEmail ? '✉' : done ? '◆' : '◇'}
    </span>
    <div style={{ flex:1 }}>
      <div style={{ fontFamily:'Outfit', fontSize:'14px', color: done ? '#f8f8ff' : '#666' }}>{label}</div>
      <div style={{ fontFamily:'Outfit', fontSize:'12px', color:'#888', marginTop:'2px', fontStyle: done ? 'normal' : 'italic' }}>
        {done ? (date ? formatDate(date) : '') : (status || 'Not yet')}
      </div>
    </div>
    <span style={{ color: done ? '#c9a84c' : '#555', fontSize:'14px' }}>{done ? '✓' : '?'}</span>
  </div>
);

interface Lead {
  id: string;
  name: string;
  email: string;
  created_at: string;
  uid?: string;
  uid_verified?: boolean;
  referral_link_clicked?: boolean;
  email_sends?: Array<{ email_type: string; sent_at: string }>;
}

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadJourneyDrawer({ lead, onClose }: Props) {
  if (!lead) return null;

  const stepBadge = lead.uid_verified ? 'Verified' : lead.uid ? 'UID Submitted' : lead.referral_link_clicked ? 'Broker Clicked' : 'Registered';
  const badgeColor = lead.uid_verified ? '#22c55e' : lead.uid ? '#f97316' : '#c9a84c';

  const nextStep = lead.uid_verified
    ? 'This lead is fully verified. No action needed.'
    : lead.uid
    ? 'Verify this lead\'s UID in the Leads tab.'
    : lead.referral_link_clicked
    ? 'Follow up — ask them to submit their broker UID.'
    : 'Share your landing page link directly with this lead.';

  const emails = (lead.email_sends || []).sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

  const steps = [
    { done: true, label: 'Landing page visited', date: lead.created_at },
    { done: !!lead.email, label: 'Lead registered', date: lead.created_at },
    { done: !!lead.referral_link_clicked, label: 'Broker link clicked', status: 'Not yet' },
    { done: !!lead.uid, label: 'UID submitted', date: lead.created_at, status: 'Waiting for UID' },
    { done: !!lead.uid_verified, label: 'Account verified', status: 'Pending verification' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:998 }}/>
      <div style={{ position:'fixed', top:0, right:0, height:'100vh', width:'420px', background:'#080808', borderLeft:'1px solid #c9a84c', zIndex:999, overflowY:'auto', boxShadow:'0 0 60px rgba(201,168,76,0.15)', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #c9a84c33' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'22px', color:'#c9a84c', letterSpacing:'0.1em', fontWeight:600 }}>
                {lead.name || '—'}
              </div>
              <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'13px', color:'#888', marginTop:'4px' }}>
                {lead.email || '—'}
              </div>
              <div style={{ marginTop:'8px' }}>
                <span style={{ fontFamily:'Outfit', fontSize:'11px', border:`1px solid ${badgeColor}`, color:badgeColor, padding:'2px 10px', borderRadius:'20px', letterSpacing:'0.05em' }}>
                  {stepBadge}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'#c9a84c', fontSize:'22px', cursor:'pointer', padding:'4px 8px', lineHeight:1 }}>×</button>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding:'20px 0', flex:1 }}>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'13px', color:'#c9a84c', letterSpacing:'0.15em', textTransform:'uppercase', padding:'0 20px', marginBottom:'16px' }}>
            Lead Journey
          </div>

          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <StepRow {...step} />
              {i < steps.length - 1 && <RolexDivider />}
            </React.Fragment>
          ))}

          {emails.length > 0 && (
            <>
              <RolexDivider />
              <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'13px', color:'#7a9fd4', letterSpacing:'0.15em', textTransform:'uppercase', padding:'12px 20px 8px' }}>
                Emails Sent
              </div>
              {emails.map((e, i) => (
                <React.Fragment key={i}>
                  <StepRow done isEmail label={EMAIL_LABELS[e.email_type] || e.email_type} date={e.sent_at} />
                  {i < emails.length - 1 && <RolexDivider />}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* Next Step */}
        <div style={{ margin:'0 16px 24px', padding:'16px', border:'1px solid #c9a84c44', background:'linear-gradient(135deg, #c9a84c11, #080808)', borderRadius:'8px', position:'relative' }}>
          <div style={{ position:'absolute', top:'-1px', left:'-1px', width:'12px', height:'12px', borderTop:'2px solid #c9a84c', borderLeft:'2px solid #c9a84c' }}/>
          <div style={{ position:'absolute', bottom:'-1px', right:'-1px', width:'12px', height:'12px', borderBottom:'2px solid #c9a84c', borderRight:'2px solid #c9a84c' }}/>
          <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:'13px', color:'#c9a84c', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'8px' }}>
            ▸ Next Step
          </div>
          <div style={{ fontFamily:'Outfit, sans-serif', fontSize:'14px', color:'#f8f8ff', lineHeight:1.5 }}>
            {nextStep}
          </div>
        </div>

      </div>
    </>
  );
}
