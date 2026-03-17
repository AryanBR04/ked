import React, { useState, useEffect } from 'react';
import { apiFetchWithAuth } from '../../lib/apiClient';
import { CourseNote } from '../../lib/types';
import { YoutubeLessonPlayerHandle } from './YoutubeLessonPlayer';

interface CourseNotesProps {
  playlistId: string;
  videoIndex: number;
  playerRef: React.RefObject<YoutubeLessonPlayerHandle>;
}

const CourseNotes: React.FC<CourseNotesProps> = ({ playlistId, videoIndex, playerRef }) => {
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [playlistId, videoIndex]);

  const fetchNotes = async () => {
    try {
      const data = await apiFetchWithAuth<CourseNote[]>(`/notes/${playlistId}/${videoIndex}`);
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !playerRef.current) return;

    setLoading(true);
    try {
      const timestampSeconds = await playerRef.current.getCurrentTime();
      await apiFetchWithAuth('/notes', {
        method: 'POST',
        body: JSON.stringify({
          playlistId,
          videoIndex,
          timestampSeconds: Math.floor(timestampSeconds),
          noteText: newNote
        })
      });
      setNewNote('');
      setIsAdding(false);
      fetchNotes();
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      await apiFetchWithAuth(`/notes/${noteId}`, {
        method: 'PATCH',
        body: JSON.stringify({ noteText: editText })
      });
      setEditingNoteId(null);
      fetchNotes();
    } catch (err) {
      alert('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await apiFetchWithAuth(`/notes/${noteId}`, {
        method: 'DELETE'
      });
      fetchNotes();
    } catch (err) {
      alert('Failed to delete note');
    }
  };

  const formatTimestamp = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-ink flex items-center gap-2">
          <span>📝</span> Lesson Notes
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-ink text-sand rounded-full text-sm font-semibold shadow-soft hover:opacity-90 transition-all"
          >
            + Add Note
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-2xl border border-ink/10 shadow-soft animate-in fade-in slide-in-from-top-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your note here... (Current timestamp will be captured)"
            className="w-full p-4 rounded-xl border border-ink/10 focus:ring-2 focus:ring-moss/20 focus:border-moss outline-none min-h-[100px] text-ink"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-ink/60 text-sm font-semibold hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddNote}
              disabled={loading || !newNote.trim()}
              className="px-6 py-2 bg-ink text-sand rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-10 bg-ink/5 rounded-2xl border border-dashed border-ink/20">
            <p className="text-ink/40 text-sm italic">No notes for this lesson yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="group bg-white p-5 rounded-2xl border border-ink/10 shadow-soft hover:border-moss/30 transition-all relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      onClick={() => playerRef.current?.seekTo(note.timestamp_seconds)}
                      className="px-2 py-0.5 bg-moss/10 text-moss rounded text-[10px] font-black hover:bg-moss hover:text-white transition-all"
                    >
                      {formatTimestamp(note.timestamp_seconds)}
                    </button>
                    <span className="text-[10px] text-ink/30 uppercase tracking-widest font-bold">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {editingNoteId === note.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-moss/30 focus:ring-1 focus:ring-moss outline-none text-sm text-ink"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditingNoteId(null)} className="text-xs text-ink/40">Cancel</button>
                        <button onClick={() => handleUpdateNote(note.id)} className="text-xs text-moss font-bold">Update</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-ink/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {note.note_text}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingNoteId(note.id); setEditText(note.note_text); }}
                    className="p-1.5 text-ink/40 hover:text-moss transition-colors"
                    title="Edit Note"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-ink/40 hover:text-red-500 transition-colors"
                    title="Delete Note"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseNotes;
