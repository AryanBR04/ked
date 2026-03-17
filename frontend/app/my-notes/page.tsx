"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Alert } from "@/components/common/Alert";
import { Spinner } from "@/components/common/Spinner";
import { apiFetchWithAuth } from "@/lib/apiClient";
import { CourseNote } from "@/lib/types";

interface GroupedNotes {
  [title: string]: {
    notes: CourseNote[];
    playlistId: string;
  };
}

export default function MyNotesPage() {
  return (
    <AuthGuard>
      <MyNotesContent />
    </AuthGuard>
  );
}

function MyNotesContent() {
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const data = await apiFetchWithAuth<CourseNote[]>("/notes");
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notes");
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  const groupedNotes = notes.reduce((acc, note) => {
    const groupKey = note.course_title || note.playlist_id;
    if (!acc[groupKey]) {
      acc[groupKey] = { 
        notes: [],
        playlistId: note.playlist_id
      };
    }
    acc[groupKey].notes.push(note);
    return acc;
  }, {} as GroupedNotes);

  const formatTimestamp = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Learning Tools</p>
        <h1 className="mt-3 text-4xl font-semibold">My Study Notes</h1>
        <p className="mt-2 text-ink/65">Review all the bookmarks and notes you've captured during your courses.</p>
      </section>

      {error ? <Alert title="Sync error" tone="error">{error}</Alert> : null}

      {Object.keys(groupedNotes).length === 0 ? (
        <section className="rounded-4xl border border-dashed border-ink/20 bg-ink/[0.02] p-16 text-center">
          <div className="text-4xl mb-4 text-ink/20">📝</div>
          <p className="text-ink/45 italic mb-6">You haven't taken any notes yet.</p>
          <Link 
            href="/courses" 
            className="inline-flex h-11 items-center justify-center rounded-xl bg-ink px-8 text-sm font-bold text-sand shadow-soft transition-all hover:opacity-90 active:scale-95"
          >
            Start Learning
          </Link>
        </section>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedNotes).map(([groupTitle, { notes, playlistId }]) => (
            <section key={groupTitle} className="space-y-5">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h2 className="text-2xl font-bold text-ink">
                  {groupTitle}
                </h2>
                <Link 
                  href={`/course/youtube/${playlistId}`}
                  className="text-moss text-sm font-bold hover:underline"
                >
                  Go to Course →
                </Link>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white p-6 rounded-3xl border border-ink/10 shadow-soft hover:border-moss/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-moss/10 text-moss rounded-md text-[10px] font-black uppercase">
                          Lesson {note.video_index + 1}
                        </span>
                        <span className="px-2 py-0.5 bg-ink/5 text-ink/40 rounded-md text-[10px] font-black">
                          {formatTimestamp(note.timestamp_seconds)}
                        </span>
                      </div>
                      <p className="text-ink text-sm leading-relaxed mb-6 italic">
                        "{note.note_text}"
                      </p>
                    </div>
                    <div className="text-[10px] text-ink/30 font-bold uppercase tracking-widest pt-4 border-t border-ink/5 flex justify-between items-center">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <Link 
                        href={`/course/youtube/${playlistId}?lesson=${note.video_index + 1}`}
                        className="text-moss hover:text-moss/70 transition-colors"
                      >
                        Launch Player
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
