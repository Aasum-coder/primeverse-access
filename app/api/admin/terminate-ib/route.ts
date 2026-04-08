import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = '1688433893'

export async function POST(request: NextRequest) {
  try {
    const { distributor_id, user_id } = await request.json()

    if (!distributor_id || !user_id) {
      return NextResponse.json({ error: 'Missing distributor_id or user_id' }, { status: 400 })
    }

    // Verify caller is admin via auth header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: { user: caller } } = await supabase.auth.getUser(token)
    if (!caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: callerDist } = await supabase.from('distributors').select('is_admin').eq('user_id', caller.id).single()
    if (!callerDist?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch distributor info before deletion for the notification
    const { data: dist } = await supabase.from('distributors').select('name, email').eq('id', distributor_id).single()
    const distName = dist?.name || 'Unknown'
    const distEmail = dist?.email || 'Unknown'

    // 1. Delete leads
    try {
      await supabase.from('leads').delete().eq('distributor_id', distributor_id)
    } catch (e) { console.error('Terminate: leads delete error', e) }

    // 2. Delete email_sends
    try {
      await supabase.from('email_sends').delete().eq('distributor_id', distributor_id)
    } catch (e) { console.error('Terminate: email_sends delete error', e) }

    // 3. Delete social_connections
    try {
      await supabase.from('social_connections').delete().eq('distributor_id', distributor_id)
    } catch (e) { console.error('Terminate: social_connections delete error', e) }

    // 4. Delete email_workflows
    try {
      await supabase.from('email_workflows').delete().eq('owner_id', distributor_id)
    } catch (e) { console.error('Terminate: email_workflows delete error', e) }

    // 5. Delete scheduled_posts (if table exists)
    try {
      await supabase.from('scheduled_posts').delete().eq('owner_id', distributor_id)
    } catch (e) { console.error('Terminate: scheduled_posts delete error', e) }

    // 6. Delete distributor record
    try {
      const { error: distErr } = await supabase.from('distributors').delete().eq('id', distributor_id)
      if (distErr) console.error('Terminate: distributors delete error', distErr)
    } catch (e) { console.error('Terminate: distributors delete error', e) }

    // 7. Delete Supabase Auth user (most important — last)
    try {
      const { error: authErr } = await supabase.auth.admin.deleteUser(user_id)
      if (authErr) console.error('Terminate: auth user delete error', authErr)
    } catch (e) { console.error('Terminate: auth user delete error', e) }

    // Send Telegram notification
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const message = `🔴 IB TERMINATED\nName: ${distName}\nEmail: ${distEmail}\nDeleted by admin at ${timestamp}`
    if (TELEGRAM_BOT_TOKEN) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message }),
        })
      } catch (e) { console.error('Terminate: Telegram notification error', e) }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Terminate IB error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
