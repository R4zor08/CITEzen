import React, {
  useState,
  Fragment,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Concern, User, ConcernStatus, Role } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { departmentsList } from '../data/mockData';
import {
  XIcon,
  CalendarIcon,
  BuildingIcon,
  UserIcon,
  MessageSquareIcon,
  SendIcon,
  PaperclipIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  CopyIcon,
  CheckIcon } from
'lucide-react';
interface ConcernDetailProps {
  isOpen: boolean;
  concern: Concern | undefined;
  currentUser: User;
  onUpdateStatus: (id: string, status: ConcernStatus) => void;
  onAddComment: (id: string, content: string, author: User) => void;
  onForward: (id: string, department: string) => void;
  onClose: () => void;
}
export function ConcernDetail({
  isOpen,
  concern,
  currentUser,
  onUpdateStatus,
  onAddComment,
  onForward,
  onClose
}: ConcernDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [showForwardPanel, setShowForwardPanel] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const isStaffOrAdmin =
  currentUser.role === 'staff' || currentUser.role === 'admin';

  const reduceMotion = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
      setShowForwardPanel(false);
      setShowStatusMenu(false);
    }
  }, [isOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showForwardPanel) setShowForwardPanel(false);
      else onClose();
    },
    [showForwardPanel, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (!isOpen || !concern) return;
    const id = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, concern?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- focus when id changes; `concern` object identity may churn from parent

  const forwardTargets = concern
    ? departmentsList.filter((d) => d !== concern.department)
    : [];
  const isDesktopForward = useMediaQuery('(min-width: 640px)');
  const isMdLayout = useMediaQuery('(min-width: 768px)');
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern || !newComment.trim()) return;
    onAddComment(concern.id, newComment, currentUser);
    setNewComment('');
  };
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const shortenConcernId = (id: string) =>
  id.length > 18 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;

  const copyConcernId = async () => {
    if (!concern) return;
    try {
      await navigator.clipboard.writeText(concern.id);
      setIdCopied(true);
      window.setTimeout(() => setIdCopied(false), 2000);
    } catch {
      setIdCopied(false);
    }
  };

  const rolePillClass = (role: Role) => {
    if (role === 'admin') {
      return 'text-violet-200 bg-violet-500/15 border-violet-400/25';
    }
    if (role === 'staff') {
      return 'text-sky-200 bg-sky-500/12 border-sky-400/25';
    }
    return 'text-emerald-200/90 bg-emerald-500/10 border-emerald-400/20';
  };

  const modalEnterScale = reduceMotion || !isMdLayout ? 1 : 0.97;
  const modalTransition = reduceMotion ?
  { duration: 0.01 } :
  { duration: 0.28, ease: [0.34, 1.02, 0.32, 1] as const };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && concern ?
        <motion.div
          key={concern.id}
          className="fixed inset-0 z-[130] flex items-stretch justify-center md:items-center md:justify-center md:p-5 lg:p-8 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            reduceMotion ?
            { duration: 0.01 } :
            { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }
          }>
          <motion.button
            type="button"
            aria-label="Close concern details"
            className="absolute inset-0 z-0 bg-black/75 backdrop-blur-md pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="concern-detail-title"
            aria-describedby="concern-detail-description"
            className="relative z-10 glass-panel citezen-concern-modal-shell pointer-events-auto flex flex-col w-full h-full min-h-0 max-h-[100dvh] md:h-auto md:max-h-[min(92vh,920px)] md:w-[min(80vw,1200px)] md:max-w-[80vw] rounded-none md:rounded-2xl overflow-hidden border border-white/10 pt-[max(0.5rem,env(safe-area-inset-top))] md:pt-0 pb-[env(safe-area-inset-bottom)] isolate"
            initial={{ opacity: 0, scale: modalEnterScale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: modalEnterScale }}
            transition={modalTransition}
            onClick={(e) => e.stopPropagation()}>
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between px-3 py-3 sm:px-5 sm:py-4 border-b border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent shrink-0">
          <div className="flex flex-col gap-2.5 min-w-0 flex-1">
            <div className="citezen-detail-label">Reference</div>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div
                className="flex items-center gap-1 min-w-0 max-w-full rounded-lg border border-white/10 bg-dark-800/90 px-2 py-1.5 sm:px-2.5 sm:py-2"
                title={concern.id}>
                <code className="text-[11px] sm:text-sm font-mono text-gray-200 truncate">
                  {shortenConcernId(concern.id)}
                </code>
                <button
                  type="button"
                  onClick={() => void copyConcernId()}
                  aria-label={idCopied ? 'Copied concern ID' : 'Copy full concern ID'}
                  className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation border border-transparent hover:border-white/10">
                  {idCopied ?
                  <CheckIcon className="h-4 w-4 text-emerald-400" /> :

                  <CopyIcon className="h-4 w-4" />
                  }
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={concern.status} />
                <PriorityBadge priority={concern.priority} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end md:pt-5 shrink-0">
            {isStaffOrAdmin &&
            <>
                <div className="relative">
                  <button
                  type="button"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10 touch-manipulation">
                  
                    Update Status
                  </button>
                  {showStatusMenu &&
                <div className="absolute right-0 left-0 sm:left-auto top-full mt-2 w-full sm:w-48 rounded-xl border border-white/10 bg-dark-800 shadow-xl z-20 py-1 overflow-hidden animate-slide-down max-h-[min(50vh,320px)] overflow-y-auto custom-scrollbar">
                      <button
                    onClick={() => {
                      onUpdateStatus(concern.id, 'in-progress');
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:bg-white/5 text-left">
                    
                        <AlertCircleIcon className="h-4 w-4" /> In Progress
                      </button>
                      <button
                    onClick={() => {
                      onUpdateStatus(concern.id, 'resolved');
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-white/5 text-left">
                    
                        <CheckCircle2Icon className="h-4 w-4" /> Resolved
                      </button>
                      <button
                    onClick={() => {
                      onUpdateStatus(concern.id, 'rejected');
                      setShowStatusMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 text-left">
                    
                        <XCircleIcon className="h-4 w-4" /> Rejected
                      </button>
                    </div>
                }
                </div>

                <div className="relative">
                  <button
                  type="button"
                  onClick={() => {
                    setShowStatusMenu(false);
                    setShowForwardPanel(true);
                  }}
                  disabled={forwardTargets.length === 0}
                  className="min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-xl sm:rounded-lg text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border border-purple-500/20 touch-manipulation disabled:opacity-40 disabled:pointer-events-none">
                  
                    Forward <ArrowRightIcon className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </>
            }

            <div className="hidden sm:block h-6 w-px bg-white/10 mx-1" />

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close concern details"
              className="min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10 p-2.5 sm:p-2 rounded-xl sm:rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation ml-auto md:ml-0 ring-offset-2 ring-offset-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
              
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content: mobile stacked flex; desktop two columns */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden md:divide-x divide-white/10">
          <div className="max-md:flex-[1.12] max-md:min-h-0 max-md:overflow-y-auto md:flex-[1.05] md:min-w-0 md:min-h-0 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 md:px-8 md:py-6 custom-scrollbar space-y-4 sm:space-y-6 border-b border-white/10 md:border-b-0">
            <div>
              <p className="citezen-detail-label mb-1.5">Category</p>
              <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 line-clamp-2">
                {concern.category} • {concern.subcategory}
              </p>
              <h2
                id="concern-detail-title"
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 sm:mb-5 leading-[1.2]">
                {concern.title}
              </h2>

              {/* Status Timeline */}
              <div className="mb-4 sm:mb-6 rounded-xl border border-white/10 bg-dark-800/60 p-3 sm:p-5">
                <h4 className="citezen-detail-label mb-3 sm:mb-4">
                  Progress
                </h4>
                <div className="flex items-center justify-between gap-0.5 sm:gap-3 max-w-xl md:max-w-none">
                  {(['pending', 'in-progress', 'resolved'] as const).map(
                    (step, i) => {
                      const statusOrder = {
                        pending: 0,
                        'in-progress': 1,
                        resolved: 2,
                        rejected: -1
                      };
                      const currentOrder = statusOrder[concern.status] ?? -1;
                      const stepOrder = statusOrder[step];
                      const isCompleted =
                      concern.status === 'rejected' ?
                      false :
                      currentOrder >= stepOrder;
                      const isCurrent = concern.status === step;
                      const isRejected =
                      concern.status === 'rejected' && step === 'pending';
                      const labels = {
                        pending: 'Submitted',
                        'in-progress': 'In Progress',
                        resolved: 'Resolved'
                      };
                      const isUpcoming = !isCompleted && !isCurrent && !isRejected;
                      const circleClass = isRejected ?
                      'bg-red-500 border-2 border-red-400 shadow-lg shadow-red-500/25' :
                      isCompleted ?
                      'bg-purple-600 border-2 border-purple-400/90 shadow-md shadow-purple-500/20' :
                      isCurrent ?
                      'bg-dark-800 border-2 border-purple-400 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/15' :
                      isUpcoming ?
                      'bg-transparent border-2 border-dashed border-white/20' :
                      'bg-dark-700 border-2 border-white/10';
                      return (
                        <Fragment key={step}>
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <div
                              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass} ${isCurrent && !isRejected ? 'sm:scale-105' : ''}`}>
                              
                              {concern.status === 'rejected' &&
                              step === 'pending' ?
                              <XCircleIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" /> :
                              isCompleted ?
                              <CheckCircle2Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" /> :

                              <div className={`h-2 w-2 rounded-full ${isUpcoming ? 'bg-white/25' : 'bg-gray-500'}`} />
                              }
                            </div>
                            <span
                              className={`text-[9px] sm:text-[11px] font-medium text-center max-w-[5rem] sm:max-w-none leading-tight ${isCurrent || isRejected ? 'text-white' : isCompleted ? 'text-purple-300' : 'text-gray-500'}`}>
                              
                              {concern.status === 'rejected' &&
                              step === 'pending' ?
                              'Rejected' :
                              labels[step]}
                            </span>
                          </div>
                          {i < 2 &&
                          <div
                            className={`flex-1 h-0.5 rounded-full -mt-6 sm:-mt-7 mx-0.5 ${concern.status === 'rejected' ? 'bg-white/5' : currentOrder > stepOrder ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-white/10'}`} />

                          }
                        </Fragment>);

                    }
                  )}
                </div>
              </div>

              <div className="citezen-detail-label mb-2">Reporter</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400 bg-dark-800/80 p-3 sm:p-4 rounded-xl border border-white/10">
                <div className="flex items-start gap-2 min-w-0 sm:col-span-1">
                  <UserIcon className="h-4 w-4 text-purple-400/80 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="citezen-detail-label mb-0.5 !tracking-wider">Name</div>
                    <span className="text-gray-200 font-medium break-words">{concern.studentName}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 min-w-0">
                  <BuildingIcon className="h-4 w-4 text-purple-400/80 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="citezen-detail-label mb-0.5 !tracking-wider">Department</div>
                    <span className="text-gray-200 font-medium break-words">{concern.department}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
                  <CalendarIcon className="h-4 w-4 text-purple-400/80 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="citezen-detail-label mb-0.5 !tracking-wider">Submitted</div>
                    <span className="text-gray-200">{formatDate(concern.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-none md:max-w-[52ch] lg:max-w-prose">
                <h3 className="citezen-detail-label mb-2 sm:mb-3">
                  Description
                </h3>
                <p
                  id="concern-detail-description"
                  className="text-sm sm:text-[0.9375rem] text-gray-300 whitespace-pre-wrap leading-relaxed bg-white/[0.04] p-3 sm:p-4 rounded-xl border border-white/10 max-md:max-h-[min(36svh,240px)] max-md:overflow-y-auto custom-scrollbar md:shadow-inner">
                  {concern.description}
                </p>
              </div>
            </div>

            {/* Form Data Details */}
            {concern.formData && Object.keys(concern.formData).length > 0 &&
            <div>
                <h3 className="citezen-detail-label mb-2 sm:mb-3">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {Object.entries(concern.formData).map(([key, value]) =>
                <div
                  key={key}
                  className="bg-white/5 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-white/10">
                  
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-300 font-medium break-words">
                        {value as string}
                      </div>
                    </div>
                )}
                </div>
              </div>
            }

            {/* Attachments */}
            {concern.attachments && concern.attachments.length > 0 &&
            <div>
                <h3 className="citezen-detail-label mb-3">
                  Attachments
                </h3>
                <div className="flex flex-wrap gap-3">
                  {concern.attachments.map((_att, i) =>
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/10 cursor-pointer transition-colors">
                  
                      <PaperclipIcon className="h-4 w-4 text-purple-400" />
                      Attachment_{i + 1}.pdf
                    </div>
                )}
                </div>
              </div>
            }
          </div>

          <div className="w-full flex flex-1 flex-col min-h-0 md:flex-1 md:min-w-[min(40%,320px)] lg:min-w-[380px] md:max-w-[50%] bg-[var(--bg-secondary)]/95 overflow-hidden md:border-l border-white/10 md:shadow-[inset_1px_0_0_rgba(255,255,255,0.04)]">
            <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-white/10 bg-white/[0.04] flex items-center gap-2 shrink-0">
              <MessageSquareIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base leading-tight">
                  Activity & Comments
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  Thread for this concern
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 sm:p-4 custom-scrollbar divide-y divide-white/[0.06]">
              <div className="flex gap-3 pb-4 pt-1">
                <div className="flex flex-col items-center pt-0.5">
                  <div className="h-9 w-9 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/35 shrink-0">
                    <UserIcon className="h-4 w-4 text-purple-300" />
                  </div>
                  <div className="w-px flex-1 min-h-[1rem] bg-gradient-to-b from-white/15 to-transparent my-1" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1.5">
                    <span className="text-sm font-semibold text-white">
                      {concern.studentName}
                    </span>
                    <time className="text-[11px] text-gray-500 tabular-nums shrink-0" dateTime={concern.createdAt}>
                      {formatDate(concern.createdAt)}
                    </time>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 bg-white/[0.05] p-3 rounded-2xl rounded-tl-sm border border-white/10 shadow-sm">
                    Concern submitted and routed to{' '}
                    <span className="text-purple-200/90">{concern.department}</span>.
                  </div>
                </div>
              </div>

              {concern.comments.map((comment, index) => {
                const isStaff =
                comment.authorRole === 'staff' ||
                comment.authorRole === 'admin';
                const isLastComment = index === concern.comments.length - 1;
                return (
                  <div key={comment.id} className="flex gap-3 py-4 first:pt-2">
                    <div className="flex flex-col items-center pt-0.5">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center border shrink-0 ${isStaff ? 'bg-sky-500/15 border-sky-400/35 text-sky-300' : 'bg-purple-500/15 border-purple-400/35 text-purple-300'}`}>
                        
                        {isStaff ?
                        <BuildingIcon className="h-4 w-4" /> :

                        <UserIcon className="h-4 w-4" />
                        }
                      </div>
                      {!isLastComment &&
                    <div className="w-px flex-1 min-h-[0.75rem] bg-gradient-to-b from-white/12 to-transparent my-1" />
                    }
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                        <span className="text-sm font-semibold text-white">
                          {comment.author}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${rolePillClass(comment.authorRole)}`}>
                          
                          {comment.authorRole}
                        </span>
                        <time
                          className="text-[11px] text-gray-500 ml-auto tabular-nums"
                          dateTime={comment.createdAt}>
                          
                          {formatDate(comment.createdAt)}
                        </time>
                      </div>
                      <div
                        className={`text-xs sm:text-sm p-3 rounded-2xl rounded-tl-sm border leading-relaxed ${isStaff ? 'bg-sky-500/[0.07] border-sky-500/15 text-gray-200' : 'bg-white/[0.05] border-white/10 text-gray-200'}`}>
                        
                        {comment.content}
                      </div>
                    </div>
                  </div>);

              })}
            </div>

            <div className="px-3 py-2.5 border-t border-white/10 bg-white/[0.04] shrink-0 citezen-safe-bottom sm:px-4 sm:py-3">
              <form onSubmit={handleAddComment} className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a message…"
                  className="w-full bg-dark-900/90 border border-white/12 rounded-xl pl-3 sm:pl-4 pr-14 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/35 transition-all resize-none custom-scrollbar min-h-[76px] sm:min-h-[80px]"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }} />
                
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  aria-label="Send comment"
                  className="absolute right-2 bottom-2 min-h-[44px] min-w-[44px] p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600 transition-colors touch-manipulation flex items-center justify-center shadow-lg shadow-purple-900/30 ring-offset-2 ring-offset-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
                  
                  <SendIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

      <AnimatePresence>
        {showForwardPanel &&
        <>
            <motion.div
            key="forward-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[70] bg-black/65 backdrop-blur-md"
            onClick={() => setShowForwardPanel(false)}
            aria-hidden
          />

            <motion.div
            key="forward-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forward-sheet-title"
            initial={
              isDesktopForward
                ? { opacity: 0, scale: 0.94, y: 0 }
                : { y: '105%', opacity: 1, scale: 1 }
            }
            animate={
              isDesktopForward
                ? { opacity: 1, scale: 1, y: 0 }
                : { y: 0, opacity: 1, scale: 1 }
            }
            exit={
              isDesktopForward
                ? { opacity: 0, scale: 0.94, y: 0 }
                : { y: '105%', opacity: 1, scale: 1 }
            }
            transition={
              reduceMotion ?
              { duration: 0.01 } :
              isDesktopForward ?
              { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const } :
              { type: 'spring', stiffness: 380, damping: 36 }
            }
            className="absolute inset-x-0 bottom-0 z-[71] flex max-h-[min(88dvh,560px)] flex-col rounded-t-[1.35rem] border border-white/10 bg-[var(--bg-secondary)] shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(calc(100vw-2rem),24rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-h-[min(80vh,520px)] overflow-hidden">
            
              <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/10 bg-white/5 shrink-0 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:pt-4">
                <button
                type="button"
                onClick={() => setShowForwardPanel(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors touch-manipulation shrink-0"
                aria-label="Back">
                
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2
                  id="forward-sheet-title"
                  className="text-base sm:text-lg font-semibold text-white leading-tight">
                  
                    Forward concern
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                    From: {concern.department}
                  </p>
                </div>
                <button
                type="button"
                onClick={() => setShowForwardPanel(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 touch-manipulation sm:hidden"
                aria-label="Close">
                
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <p className="px-4 sm:px-5 pt-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Select department
              </p>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                {forwardTargets.map((dept, i) =>
              <motion.button
                key={dept}
                type="button"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.24), duration: 0.25 }}
                onClick={() => {
                  onForward(concern.id, dept);
                  setShowForwardPanel(false);
                }}
                className="w-full flex items-center gap-3 text-left min-h-[52px] px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm sm:text-base text-gray-200 hover:text-white hover:bg-purple-500/15 hover:border-purple-500/30 active:scale-[0.99] transition-all touch-manipulation shadow-sm">
                
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <BuildingIcon className="h-5 w-5" />
                    </span>
                    <span className="font-medium leading-snug flex-1">{dept}</span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-500 shrink-0" />
                  </motion.button>
              )}
                {forwardTargets.length === 0 &&
              <p className="text-center text-sm text-gray-500 py-8 px-4">
                  No other departments available.
                </p>
              }
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
          </motion.div>
        </motion.div>
      : null}
    </AnimatePresence>,
    document.body
  );
}
