import React, { useState, useEffect } from 'react';
import { tokens } from '../factories/tokens';
import { Button, Card, Badge } from '../factories/ComponentFactory';
import { PageHeader, EmptyState, ModalOverlay } from '../factories/SectionFactory';
import { reminderService } from '../services/ReminderService';

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  tags: string | null;
  pinned: boolean;
  reminder: string | null;
  reminder_alerted: boolean;
  created_at: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  border: `1.5px solid ${tokens.border}`,
  borderRadius: tokens.radius,
  fontFamily: tokens.fontBody,
  color: tokens.text,
  outline: 'none',
  boxSizing: 'border-box' as const,
};

function NoteCard({ note, onDelete, onPin, onEdit }: { note: Note, onDelete: () => void, onPin: () => void, onEdit: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!note.reminder || note.reminder_alerted) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(note.reminder!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Time's up!");
        clearInterval(timer);
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [note.reminder, note.reminder_alerted]);

  const tagsArray = note.tags ? note.tags.split(',').map(t => t.trim()).filter(t => t) : [];

  return (
    <Card padding="20px" style={{
      background: note.color,
      border: note.pinned ? `2px solid ${tokens.primary}` : `1px solid ${tokens.border}`,
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.text, margin: 0 }}>{note.title}</h3>
        <button onClick={onPin} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: note.pinned ? 1 : 0.3 }}>
          {note.pinned ? '📌' : '📍'}
        </button>
      </div>

      <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.5, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
        {note.content}
      </p>

      {tagsArray.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {tagsArray.map(tag => (
            <Badge key={tag} color="blue">{tag}</Badge>
          ))}
        </div>
      )}

      {note.reminder && (
        <div style={{
          background: note.reminder_alerted ? tokens.successBg : tokens.primaryLight,
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          color: note.reminder_alerted ? tokens.success : tokens.primary,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 600
        }}>
          {note.reminder_alerted ? '✅ Selesai' : `⏰ ${timeLeft || new Date(note.reminder).toLocaleString()}`}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Button variant="ghost" size="sm" onClick={onEdit} style={{ flex: 1, padding: '6px' }}>✏️ Edit</Button>
        <Button variant="danger" size="sm" onClick={onDelete} style={{ flex: 1, padding: '6px' }}>🗑️ Hapus</Button>
      </div>
    </Card>
  );
}

export default function ReminderView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: '#ffffff',
    tags: '',
    reminder: '',
    pinned: false
  });

  useEffect(() => {
    // Subscribe ke singleton service
    const unsubscribe = reminderService.subscribe((updatedNotes) => {
      setNotes(updatedNotes);
      setLoading(false);
    });

    // Pastikan polling jalan
    reminderService.startPolling();

    return () => unsubscribe();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return;
    try {
      const res = await reminderService.addNote(newNote);
      if (res.status === 'success') {
        setShowAddModal(false);
        setNewNote({ title: '', content: '', color: '#ffffff', tags: '', reminder: '', pinned: false });
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleUpdateNote = async (id: number, fields: Partial<Note>) => {
    try {
      const res = await reminderService.updateNote(id, fields);
      if (res.status === 'success') {
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Hapus reminder ini?')) return;
    try {
      await reminderService.deleteNote(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(n =>
    (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (n.tags && n.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Reminder & Catatan"
        subtitle="Kelola pengingat dan catatan penting kamu di sini."
        action={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            + Tambah Reminder
          </Button>
        }
      />

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Cari catatan atau tag..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: tokens.radius,
            border: `1.5px solid ${tokens.border}`,
            background: tokens.white,
            fontFamily: tokens.fontBody,
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: tokens.textMuted }}>Memuat...</div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Belum ada reminder"
          description="Buat pengingat untuk tugas atau catatan pentingmu."
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              + Buat Reminder
            </Button>
          }
        />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Reminder tidak ditemukan"
          description={`Tidak ada hasil untuk pencarian "${searchTerm}". Coba kata kunci lain.`}
          action={
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              Bersihkan Pencarian
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={() => handleDeleteNote(note.id)}
              onPin={() => handleUpdateNote(note.id, { pinned: !note.pinned })}
              onEdit={() => setEditingNote(note)}
            />
          ))}
        </div>
      )}

      {(showAddModal || editingNote) && (
        <ModalOverlay onClose={() => { setShowAddModal(false); setEditingNote(null); }}>
          <Card padding="32px" style={{ width: '100%', maxWidth: 500 }}>
            <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 22, fontWeight: 700, color: tokens.text, marginBottom: 24 }}>
              {editingNote ? 'Edit Reminder' : 'Tambah Reminder Baru'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Judul</label>
                <input
                  value={editingNote ? (editingNote.title || '') : newNote.title}
                  onChange={e => editingNote ? setEditingNote({ ...editingNote, title: e.target.value }) : setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Judul catatan"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Isi Catatan</label>
                <textarea
                  value={editingNote ? (editingNote.content || '') : newNote.content}
                  onChange={e => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Tulis sesuatu..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Tag</label>
                  <input
                    value={editingNote ? (editingNote.tags || '') : newNote.tags}
                    onChange={e => editingNote ? setEditingNote({ ...editingNote, tags: e.target.value }) : setNewNote({ ...newNote, tags: e.target.value })}
                    placeholder="kerja, penting..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Warna</label>
                  <input
                    type="color"
                    value={editingNote ? (editingNote.color || '#ffffff') : newNote.color}
                    onChange={e => editingNote ? setEditingNote({ ...editingNote, color: e.target.value }) : setNewNote({ ...newNote, color: e.target.value })}
                    style={{ ...inputStyle, padding: '4px', height: 42 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Waktu Reminder (Opsional)</label>
                <input
                  type="datetime-local"
                  value={editingNote ? (editingNote.reminder ? editingNote.reminder.substring(0, 16) : '') : newNote.reminder}
                  onChange={e => editingNote ? setEditingNote({ ...editingNote, reminder: e.target.value }) : setNewNote({ ...newNote, reminder: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditingNote(null); }}>Batal</Button>
                <Button variant="primary" onClick={editingNote ? () => handleUpdateNote(editingNote.id, editingNote) : handleAddNote}>
                  {editingNote ? 'Simpan Perubahan' : 'Tambah Reminder'}
                </Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  );
}
