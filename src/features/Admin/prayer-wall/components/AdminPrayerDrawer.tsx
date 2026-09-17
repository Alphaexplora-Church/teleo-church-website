import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Edit3,
    Feather,
    Flame,
    Heart,
    HeartHandshake,
    MessageSquare,
    Send,
    Shield,
    Sparkles,
    Trash2,
    UserCheck,
    X
} from 'lucide-react';
import type { AdminPrayer, AdminPrayerComment } from '../model/adminPrayerWall.types';

interface AdminPrayerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    prayer: AdminPrayer | null;
    comments: AdminPrayerComment[];
    isLoadingComments: boolean;
    onTogglePrayed: (prayerId: string) => Promise<void>;
    isActionLoading: boolean;
    onAddComment: (content: string) => Promise<void>;
    onUpdateComment: (commentId: string, content: string) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
}

const QUICK_PASTORAL_SNIPPETS = [
    '🙏 Interceded with pastoral team today',
    '✨ Standing in faith with you',
    '📖 Philippians 4:6-7 — The peace of God guards your heart',
    '❤️ You are deeply loved and covered in prayer',
];

export default function AdminPrayerDrawer({
    isOpen,
    onClose,
    prayer,
    comments,
    isLoadingComments,
    onTogglePrayed,
    isActionLoading,
    onAddComment,
    onUpdateComment,
    onDeleteComment
}: AdminPrayerDrawerProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Auto-dismiss feedback after 3.5 seconds
    useEffect(() => {
        if (!feedback) return;
        const timer = setTimeout(() => {
            setFeedback(null);
        }, 3500);
        return () => clearTimeout(timer);
    }, [feedback]);

    if (!prayer) return null;

    const author = prayer.author_name || 'Anonymous';
    const isAnonymous = !prayer.author_name || prayer.author_name.toLowerCase() === 'anonymous' || prayer.is_anonymous;
    const isPrayed = prayer.team_status === 'PRAYED' || prayer.is_prayed_by_church;

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment('');
            setFeedback({ type: 'success', message: 'Pastoral note added successfully.' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to post note';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (comment: AdminPrayerComment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!editContent.trim() || isEditingSubmitting) return;
        setIsEditingSubmitting(true);
        try {
            await onUpdateComment(commentId, editContent.trim());
            setEditingCommentId(null);
            setEditContent('');
            setFeedback({ type: 'success', message: 'Pastoral note updated.' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to update note';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setIsEditingSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteCommentId) return;
        const commentId = pendingDeleteCommentId;
        setDeletingId(commentId);
        try {
            await onDeleteComment(commentId);
            setPendingDeleteCommentId(null);
            setFeedback({ type: 'success', message: 'Pastoral note deleted successfully.' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to delete note';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setDeletingId(null);
        }
    };

    const handleQuickSnippet = (snippet: string) => {
        setNewComment(prev => (prev ? `${prev} ${snippet}` : snippet));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm transition-opacity"
                    />

                    {/* Slide-over Drawer Panel */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[#fafaf9] shadow-2xl border-l border-midnight-teal/10"
                    >
                        {/* Drawer Header */}
                        <header className="flex items-center justify-between border-b border-midnight-teal/10 bg-white/90 px-6 py-4.5 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-midnight-teal font-serif text-sm font-bold text-white shadow-sm ring-2 ring-midnight-teal/10">
                                    {isAnonymous ? 'A' : author.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-midnight-teal">{author}</h2>
                                        {isAnonymous && (
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                                                Confidential
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                                        <Clock size={11} />
                                        <span>{prayer.created_at_metadata?.relative_time ?? 'Recently shared'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-midnight-teal/5 hover:text-midnight-teal transition"
                                aria-label="Close drawer"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        {/* Animated Feedback Notification Banner */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`flex items-center justify-between border-b px-6 py-3 text-xs font-semibold overflow-hidden transition-colors ${
                                        feedback.type === 'success'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {feedback.type === 'success' ? (
                                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                        ) : (
                                            <AlertCircle size={16} className="text-rose-600 shrink-0" />
                                        )}
                                        <span>{feedback.message}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFeedback(null)}
                                        className="p-1 rounded-md hover:bg-black/5 transition"
                                        aria-label="Dismiss"
                                    >
                                        <X size={13} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Badges & Title Section */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {prayer.is_urgent && (
                                        <span className="flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700">
                                            <Flame size={12} className="text-rose-600" /> Urgent Need
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 rounded-full bg-midnight-teal/10 border border-midnight-teal/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight-teal">
                                        {prayer.audience === 'CHURCH_INTERCESSION' ? (
                                            <>
                                                <Shield size={11} /> Church Intercession
                                            </>
                                        ) : (
                                            <>
                                                <HeartHandshake size={11} /> {prayer.audience.replace('_', ' ')}
                                            </>
                                        )}
                                    </span>
                                    {prayer.prayer_tag && (
                                        <span className="rounded-full bg-harvest-orange/15 border border-harvest-orange/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-harvest-orange">
                                            {prayer.prayer_tag}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-serif text-2xl font-bold leading-snug text-midnight-teal">
                                    {prayer.title}
                                </h3>
                            </div>

                            {/* Full Situation Description Box */}
                            <div className="relative overflow-hidden rounded-2xl border border-midnight-teal/10 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between border-b border-midnight-teal/5 pb-2.5 mb-3">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-midnight-teal/50">
                                        <Feather size={12} /> Prayer Request Narrative
                                    </span>
                                    {isPrayed && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                            <UserCheck size={11} /> Covered
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap selection:bg-harvest-orange/20">
                                    {prayer.description}
                                </p>
                            </div>

                            {/* Intercession Action Bar */}
                            <div className="flex items-center justify-between rounded-2xl border border-midnight-teal/10 bg-gradient-to-r from-white via-white to-midnight-teal/[0.02] p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                    <div className="flex size-7 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                                        <Heart size={14} fill="currentColor" />
                                    </div>
                                    <span>{prayer.reactions_count ?? 0} {prayer.reactions_count === 1 ? 'reaction' : 'reactions'}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onTogglePrayed(prayer.id)}
                                    disabled={isActionLoading}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 ${
                                        isPrayed
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-600/30'
                                            : 'bg-midnight-teal text-white hover:bg-harvest-orange'
                                    }`}
                                >
                                    {isActionLoading ? (
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isPrayed ? (
                                        <>
                                            <CheckCircle2 size={15} />
                                            Prayed by Team
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={15} />
                                            Mark as Prayed
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Pastoral Comments Thread */}
                            <div className="space-y-3.5 pt-2">
                                <div className="flex items-center justify-between border-b border-midnight-teal/10 pb-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} className="text-midnight-teal" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.14em] text-midnight-teal">
                                            Pastoral Notes &amp; Updates ({comments.length})
                                        </h4>
                                    </div>
                                    <span className="text-[10px] text-gray-400">Leadership Only</span>
                                </div>

                                {isLoadingComments ? (
                                    <div className="py-8 text-center text-xs text-gray-400">
                                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-midnight-teal border-t-transparent" />
                                        <p className="mt-2 font-medium">Loading pastoral notes...</p>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-midnight-teal/15 bg-white/60 p-6 text-center">
                                        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-midnight-teal/5 text-midnight-teal/60 mb-2">
                                            <Feather size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-midnight-teal">No pastoral notes yet</p>
                                        <p className="mt-1 text-[11px] text-gray-400">
                                            Leave scripture, updates, or intercession feedback for the ministry team.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map(comment => (
                                            <div
                                                key={comment.id}
                                                className="rounded-2xl border border-midnight-teal/10 bg-white p-4 shadow-sm transition hover:shadow-md space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="grid h-7 w-7 place-items-center rounded-full bg-harvest-orange/15 text-harvest-orange font-bold text-[11px]">
                                                            {(comment.author_name || 'Leader').slice(0, 1).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-midnight-teal">
                                                                {comment.author_name || 'Pastoral Team'}
                                                            </span>
                                                            <span className="ml-2 text-[10px] text-gray-400">
                                                                {comment.created_at_metadata?.relative_time ?? 'Recently'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Edit / Delete Buttons */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(comment)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-midnight-teal/5 hover:text-midnight-teal transition"
                                                            title="Edit note"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPendingDeleteCommentId(comment.id)}
                                                            disabled={deletingId === comment.id}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                                                            title="Delete note"
                                                        >
                                                            {deletingId === comment.id ? (
                                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                                                            ) : (
                                                                <Trash2 size={13} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Edit Form or Comment Content */}
                                                {editingCommentId === comment.id ? (
                                                    <div className="space-y-2 pt-1">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={e => setEditContent(e.target.value)}
                                                            rows={3}
                                                            className="w-full rounded-xl border border-midnight-teal/30 p-2.5 text-xs text-gray-800 outline-none focus:border-harvest-orange focus:ring-1 focus:ring-harvest-orange"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingCommentId(null)}
                                                                className="rounded-lg px-3 py-1 text-[11px] font-bold text-gray-500 hover:bg-gray-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveEdit(comment.id)}
                                                                disabled={isEditingSubmitting}
                                                                className="rounded-lg bg-midnight-teal px-3.5 py-1 text-[11px] font-bold text-white hover:bg-harvest-orange transition"
                                                            >
                                                                {isEditingSubmitting ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap pl-0.5">
                                                        {comment.content}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Pastoral Encouragement Composer */}
                        <footer className="border-t border-midnight-teal/10 bg-white p-4 space-y-3">
                            {/* Quick Pastoral Prompts */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                {QUICK_PASTORAL_SNIPPETS.map(snippet => (
                                    <button
                                        key={snippet}
                                        type="button"
                                        onClick={() => handleQuickSnippet(snippet)}
                                        className="shrink-0 rounded-full border border-midnight-teal/10 bg-midnight-teal/[0.03] px-2.5 py-1 text-[10px] font-semibold text-midnight-teal/75 hover:border-harvest-orange/40 hover:bg-harvest-orange/10 hover:text-harvest-orange transition"
                                    >
                                        {snippet}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Write a pastoral note, scripture, or intercession update..."
                                    rows={2}
                                    className="flex-1 rounded-xl border border-gray-200 bg-[#fafafa] p-3 text-xs text-gray-800 outline-none transition focus:border-harvest-orange focus:bg-white focus:ring-2 focus:ring-harvest-orange/20 resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="self-end flex items-center justify-center rounded-xl bg-midnight-teal px-4 py-3.5 text-white font-bold transition hover:bg-harvest-orange disabled:cursor-not-allowed disabled:opacity-40 shadow-sm active:scale-95"
                                    aria-label="Send comment"
                                >
                                    {isSubmitting ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                                    ) : (
                                        <Send size={15} />
                                    )}
                                </button>
                            </form>
                        </footer>
                    </motion.aside>

                    {/* Centered Delete Confirmation Dialog */}
                    <AnimatePresence>
                        {pendingDeleteCommentId && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => !deletingId && setPendingDeleteCommentId(null)}
                                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                                />
                                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-midnight-teal/10 text-center space-y-4"
                                    >
                                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/60">
                                            <Trash2 size={22} />
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-serif text-lg font-bold text-midnight-teal">
                                                Delete Pastoral Note?
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                This note will be permanently removed from this prayer's pastoral record.
                                            </p>
                                        </div>

                                        {(() => {
                                            const target = comments.find(c => c.id === pendingDeleteCommentId);
                                            if (!target) return null;
                                            return (
                                                <div className="rounded-xl border border-gray-100 bg-[#f9fafb] p-3 text-left">
                                                    <p className="text-[11px] font-semibold text-gray-700 line-clamp-2 italic">
                                                        "{target.content}"
                                                    </p>
                                                </div>
                                            );
                                        })()}

                                        <div className="flex items-center gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setPendingDeleteCommentId(null)}
                                                disabled={Boolean(deletingId)}
                                                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleConfirmDelete}
                                                disabled={Boolean(deletingId)}
                                                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 transition active:scale-95 disabled:opacity-50"
                                            >
                                                {deletingId ? (
                                                    <>
                                                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Yes, Delete'
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
