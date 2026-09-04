import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Edit3, Flame, Heart, MessageSquare, Send, Sparkles, Trash2, X } from 'lucide-react';
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

    if (!prayer) return null;

    const author = prayer.author_name || 'Anonymous';
    const isPrayed = prayer.team_status === 'PRAYED' || prayer.is_prayed_by_church;

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment('');
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
        } finally {
            setIsEditingSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this pastoral comment?')) return;
        setDeletingId(commentId);
        try {
            await onDeleteComment(commentId);
        } finally {
            setDeletingId(null);
        }
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
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Slide-over Drawer Panel */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl"
                    >
                        {/* Drawer Header */}
                        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-[#fafafa]">
                            <div className="flex items-center gap-2">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-midnight-teal text-white font-serif text-xs font-bold">
                                    {author === 'Anonymous' ? 'A' : author.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-midnight-teal">{author}</h2>
                                    <p className="text-[11px] text-gray-400">{prayer.created_at_metadata?.relative_time ?? 'Recently'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                                aria-label="Close drawer"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Title & Badges */}
                            <div>
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                    {prayer.is_urgent && (
                                        <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700">
                                            <Flame size={12} /> Urgent
                                        </span>
                                    )}
                                    <span className="rounded-full bg-soft-linen px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight-teal/70">
                                        {prayer.audience.replace('_', ' ')}
                                    </span>
                                    {prayer.prayer_tag && (
                                        <span className="rounded-full bg-soft-linen px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-midnight-teal/70">
                                            {prayer.prayer_tag}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-serif text-xl font-bold text-midnight-teal leading-snug">{prayer.title}</h3>
                            </div>

                            {/* Full Situation Description */}
                            <div className="rounded-2xl border border-midnight-teal/10 bg-[#f9fafb] p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-midnight-teal/50 mb-2">Prayer Details</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{prayer.description}</p>
                            </div>

                            {/* Quick Team Intercession Action Bar */}
                            <div className="flex items-center justify-between rounded-2xl border border-midnight-teal/10 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Heart size={16} className="text-rose-500" fill="currentColor" />
                                    <span>{prayer.reactions_count ?? 0} reactions</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onTogglePrayed(prayer.id)}
                                    disabled={isActionLoading}
                                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                                        isPrayed
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            : 'bg-midnight-teal text-white hover:bg-harvest-orange'
                                    }`}
                                >
                                    {isActionLoading ? (
                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isPrayed ? (
                                        <>
                                            <CheckCircle2 size={14} />
                                            Prayed by Team
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Mark as Prayed
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Pastoral Comments Thread */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <MessageSquare size={16} className="text-midnight-teal" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-midnight-teal">
                                        Pastoral Notes &amp; Updates ({comments.length})
                                    </h4>
                                </div>

                                {isLoadingComments ? (
                                    <div className="py-8 text-center text-xs text-gray-400">Loading comments...</div>
                                ) : comments.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                                        No pastoral notes yet. Leave an encouraging word below.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {comments.map(comment => (
                                            <div
                                                key={comment.id}
                                                className="rounded-2xl border border-gray-100 bg-[#fbfcfc] p-4 text-xs space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="grid h-6 w-6 place-items-center rounded-full bg-harvest-orange/20 text-harvest-orange font-bold text-[10px]">
                                                            {(comment.author_name || 'Leader').slice(0, 1).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-midnight-teal">{comment.author_name || 'Pastoral Team'}</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {comment.created_at_metadata?.relative_time ?? 'Recently'}
                                                        </span>
                                                    </div>

                                                    {/* Edit / Delete Buttons */}
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartEdit(comment)}
                                                            className="p-1 text-gray-400 hover:text-midnight-teal transition"
                                                            title="Edit comment"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(comment.id)}
                                                            disabled={deletingId === comment.id}
                                                            className="p-1 text-gray-400 hover:text-rose-600 transition disabled:opacity-50"
                                                            title="Delete comment"
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
                                                                className="rounded-lg bg-midnight-teal px-3 py-1 text-[11px] font-bold text-white hover:bg-harvest-orange transition"
                                                            >
                                                                {isEditingSubmitting ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Pastoral Encouragement Composer */}
                        <footer className="border-t border-gray-100 p-4 bg-white">
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Write a pastoral note or scripture..."
                                    rows={2}
                                    className="flex-1 rounded-xl border border-gray-200 p-3 text-xs text-gray-800 outline-none focus:border-harvest-orange focus:ring-1 focus:ring-harvest-orange resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="self-end rounded-xl bg-midnight-teal px-4 py-3 text-white font-bold transition hover:bg-harvest-orange disabled:cursor-not-allowed disabled:opacity-40"
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
                </>
            )}
        </AnimatePresence>
    );
}
