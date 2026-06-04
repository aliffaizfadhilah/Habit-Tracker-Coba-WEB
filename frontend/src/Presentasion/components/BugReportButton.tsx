import { useState } from 'react'
import { Bug, X, Send } from 'lucide-react'
import { http } from '../../BusinessLogic/services/HttpService'
import { useAuth } from '../../BusinessLogic/context/AuthContext'

type ReportType = 'bug' | 'post' | 'user'

export default function BugReportButton() {
  const { isLoggedIn, user } = useAuth()
  const [open,    setOpen]    = useState(false)
  const [type,    setType]    = useState<ReportType>('bug')
  const [note,    setNote]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  if (!isLoggedIn || user?.role === 'ADMIN') return null

  const submit = async () => {
    if (!note.trim()) return
    setSending(true)
    try {
      await http.post('/api/reports', {
        type,
        note,
        page: window.location.pathname,
        reason: type === 'bug' ? 'Bug / Error' : undefined,
      })
      setSent(true)
      setTimeout(() => { setSent(false); setOpen(false); setNote('') }, 2000)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        title="Laporkan masalah"
        className="fixed bottom-6 right-6 z-[200] w-11 h-11 rounded-full bg-white border border-border shadow-float flex items-center justify-center cursor-pointer hover:shadow-green hover:border-border-mid transition-all hover:scale-105"
      >
        <Bug size={18} className="text-muted" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-[rgba(11,26,14,0.4)] backdrop-blur-[4px] flex items-end justify-end z-[400] p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-float w-full max-w-[360px] p-5 animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body font-bold text-ink text-[15px]">Laporkan Masalah</h3>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center cursor-pointer hover:bg-border transition-all">
                <X size={14} className="text-muted" />
              </button>
            </div>

            {sent ? (
              <div className="py-6 text-center">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-sm font-semibold text-success">Laporan terkirim! Terima kasih.</p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-[0.5px] block mb-1.5">Jenis</label>
                  <div className="flex gap-2">
                    {([['bug', 'Bug / Error'], ['post', 'Postingan'], ['user', 'Pengguna']] as [ReportType, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setType(v)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ` +
                          (type === v ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border hover:text-ink')}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-[0.5px] block mb-1.5">Deskripsi</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ceritakan masalah yang kamu temukan..."
                    rows={4}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-primary transition-colors font-body text-ink placeholder:text-muted/60"
                  />
                </div>

                <div className="text-xs text-muted mb-4">
                  Halaman: <code className="bg-surface px-1 py-0.5 rounded text-[11px]">{window.location.pathname}</code>
                </div>

                <button
                  onClick={submit}
                  disabled={!note.trim() || sending}
                  className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                  <Send size={14} />
                  {sending ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
