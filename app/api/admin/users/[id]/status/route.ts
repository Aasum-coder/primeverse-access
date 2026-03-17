import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
)

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
)

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')

const ADMIN_EMAILS = ['aasum85@gmail.com', 'bitaasum@gmail.com']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Auth check
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAnon.auth.getUser(token)
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { ib_status, ib_status_note } = body

  if (!['approved', 'rejected', 'pending'].includes(ib_status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updateData: Record<string, any> = {
    ib_status,
    ib_status_note: ib_status_note || null,
  }

  if (ib_status === 'approved') {
    updateData.ib_approved_at = new Date().toISOString()
  }

  const { error } = await supabaseAdmin
    .from('distributors')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update status', details: error }, { status: 500 })
  }

  // Send approval email if status changed to approved
  if (ib_status === 'approved') {
    const { data: dist } = await supabaseAdmin
      .from('distributors')
      .select('name, email')
      .eq('id', id)
      .single()

    if (dist?.email) {
      try {
        await resend.emails.send({
          from: '1Move Academy <noreply@primeverseaccess.com>',
          to: [dist.email],
          subject: "You're approved! Welcome to SYSTM8 \uD83C\uDF89",
          html: buildApprovalEmail(dist.name || 'there'),
        })
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr)
      }
    }
  }

  return NextResponse.json({ success: true })
}

function buildApprovalEmail(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#1A1A2E;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:2.5rem;margin-bottom:8px;">\uD83C\uDF89</div>
      <h1 style="color:#D4A843;font-size:1.5rem;margin:0 0 8px;">You're Approved!</h1>
    </div>
    <div style="background:#16162a;border:1px solid #2a2a4a;border-radius:12px;padding:28px 24px;color:#E0E0E0;font-size:0.95rem;line-height:1.7;">
      <p style="margin:0 0 16px;">Hi ${name},</p>
      <p style="margin:0 0 16px;">Great news! Your IB application has been <strong style="color:#22c55e;">approved</strong>. You now have full access to SYSTM8.</p>
      <p style="margin:0 0 16px;">Here's what you can do next:</p>
      <ul style="margin:0 0 16px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;">Set up your IB profile and bio</li>
        <li style="margin-bottom:8px;">Customize and publish your landing page</li>
        <li style="margin-bottom:8px;">Share your referral link and start generating leads</li>
      </ul>
      <p style="margin:0 0 24px;">Log in now to get started:</p>
      <div style="text-align:center;">
        <a href="https://www.primeverseaccess.com/login" style="display:inline-block;background:#D4A843;color:#1A1A2E;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
          Open SYSTM8
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#555;font-size:0.75rem;margin-top:24px;">
      &copy; 1Move Academy &mdash; <a href="https://www.primeverseaccess.com" style="color:#888;text-decoration:none;">primeverseaccess.com</a>
    </p>
  </div>
</body>
</html>`
}
