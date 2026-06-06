import { redirect } from 'next/navigation'
import { verifyWelcomeToken } from '@/lib/welcome-token'
import { UnlockForm } from './unlock-form'

interface Props {
  searchParams: Promise<{ t?: string }>
}

export default async function UnlockPage({ searchParams }: Props) {
  const { t } = await searchParams

  if (!t) {
    redirect('/unlock/error?reason=missing_token')
  }

  const payload = verifyWelcomeToken(t)
  if (!payload) {
    redirect('/unlock/error?reason=invalid_token')
  }

  return <UnlockForm email={payload.email} token={t} />
}
