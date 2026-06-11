const DUMMY_LOCALS = [
  'test', 'dummy', 'fake', 'asd', 'asdf', 'qwerty', 'abc', 'abcd',
  '123', '1234', 'temp', 'example', 'sample', 'noreply', 'no-reply',
  'user', 'admin', 'demo', 'email', 'mail', 'hello', 'info',
]

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'tempmail.com',
  '10minutemail.com', 'throwam.com', 'trashmail.com', 'sharklasers.com',
  'spam4.me', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'guerrillamailblock.com', 'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
  'example.com', 'test.com', 'invalid.com',
]

export function isDummyEmail(email: string): boolean {
  if (!email.includes('@')) return false
  const [local, domain] = email.toLowerCase().split('@')
  if (!local || !domain) return false

  if (DISPOSABLE_DOMAINS.includes(domain)) return true
  if (DUMMY_LOCALS.some(d => local === d || local === d + '1' || local === d + '123')) return true

  return false
}

export const DUMMY_EMAIL_WARNING = 'Gunakan email asli agar bisa menerima OTP dan notifikasi penting.'
