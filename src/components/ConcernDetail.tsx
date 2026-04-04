import React, { useState, Fragment } from 'react';
import { Concern, User, ConcernStatus } from '../types';
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
  MoreHorizontalIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon } from
'lucide-react';
interface ConcernDetailProps {
  concern: Concern;
  currentUser: User;
  onUpdateStatus: (id: string, status: ConcernStatus) => void;
  onAddComment: (id: string, content: string, author: User) => void;
  onForward: (id: string, department: string) => void;
  onClose: () => void;
}
export function ConcernDetail({
  concern,
  currentUser,
  onUpdateStatus,
  onAddComment,
  onForward,
  onClose
}: ConcernDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [showForwardMenu, setShowForwardMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const isStaffOrAdmin =
  currentUser.role === 'staff' || currentUser.role === 'admin';
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-900/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl shadow-purple-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-400 bg-dark-800 px-2 py-1 rounded-md border border-white/10">
              {concern.id}
            </span>
            <StatusBadge status={concern.status} />
            <PriorityBadge priority={concern.priority} />
          </div>

          <div className="flex items-center gap-2">
            {isStaffOrAdmin &&
            <>
                <div className="relative">
                  <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10">
                  
                    Update Status
                  </button>
                  {showStatusMenu &&
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-dark-800 shadow-xl z-10 py-1 overflow-hidden animate-slide-down">
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
                  onClick={() => setShowForwardMenu(!showForwardMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors border border-purple-500/20">
                  
                    Forward <ArrowRightIcon className="h-4 w-4" />
                  </button>
                  {showForwardMenu &&
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-dark-800 shadow-xl z-10 py-1 overflow-hidden animate-slide-down max-h-64 overflow-y-auto custom-scrollbar">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Select Department
                      </div>
                      {departmentsList.
                  filter((d) => d !== concern.department).
                  map((dept) =>
                  <button
                    key={dept}
                    onClick={() => {
                      onForward(concern.id, dept);
                      setShowForwardMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 text-left transition-colors">
                    
                            {dept}
                          </button>
                  )}
                    </div>
                }
                </div>
              </>
            }

            <div className="h-6 w-px bg-white/10 mx-2" />

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col md:flex-row gap-6">
          {/* Left Column: Details */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/20">
                  {concern.category}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  {concern.subcategory}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {concern.title}
              </h2>

              {/* Status Timeline */}
              <div className="mb-6 bg-dark-800 p-4 rounded-xl border border-white/5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Progress
                </h4>
                <div className="flex items-center gap-1 sm:gap-2">
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
                      const colors = isRejected ?
                      'bg-red-500 border-red-500 shadow-red-500/40' :
                      isCompleted ?
                      'bg-purple-500 border-purple-500 shadow-purple-500/40' :
                      'bg-dark-700 border-white/10';
                      return (
                        <Fragment key={step}>
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${colors} ${isCurrent || isRejected ? 'shadow-lg scale-110' : ''}`}>
                              
                              {concern.status === 'rejected' &&
                              step === 'pending' ?
                              <XCircleIcon className="h-4 w-4 text-white" /> :
                              isCompleted ?
                              <CheckCircle2Icon className="h-4 w-4 text-white" /> :

                              <div className="h-2 w-2 rounded-full bg-gray-600" />
                              }
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-medium ${isCurrent || isRejected ? 'text-white' : isCompleted ? 'text-purple-400' : 'text-gray-500'}`}>
                              
                              {concern.status === 'rejected' &&
                              step === 'pending' ?
                              'Rejected' :
                              labels[step]}
                            </span>
                          </div>
                          {i < 2 &&
                          <div
                            className={`flex-1 h-0.5 rounded-full transition-all duration-500 -mt-5 ${concern.status === 'rejected' ? 'bg-white/5' : currentOrder > stepOrder ? 'bg-purple-500' : 'bg-white/5'}`} />

                          }
                        </Fragment>);

                    }
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 bg-dark-800 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">{concern.studentName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BuildingIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-300">{concern.department}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(concern.createdAt)}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  {concern.description}
                </p>
              </div>
            </div>

            {/* Form Data Details */}
            {concern.formData && Object.keys(concern.formData).length > 0 &&
            <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(concern.formData).map(([key, value]) =>
                <div
                  key={key}
                  className="bg-white/5 p-3 rounded-xl border border-white/10">
                  
                      <div className="text-xs text-gray-500 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-300 font-medium break-words">
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
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Attachments
                </h3>
                <div className="flex flex-wrap gap-3">
                  {concern.attachments.map((att, i) =>
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

          {/* Right Column: Comments/Timeline */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col h-[500px] md:h-auto border border-white/10 rounded-2xl bg-dark-800 overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">Activity & Comments</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Initial Submission Timeline Item */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                    <UserIcon className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="w-px h-full bg-white/10 my-1" />
                </div>
                <div className="pb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {concern.studentName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(concern.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/10">
                    Concern submitted and routed to {concern.department}.
                  </div>
                </div>
              </div>

              {/* Comments */}
              {concern.comments.map((comment, index) => {
                const isLast = index === concern.comments.length - 1;
                const isStaff =
                comment.authorRole === 'staff' ||
                comment.authorRole === 'admin';
                return (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border shrink-0 ${isStaff ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-purple-500/20 border-purple-500/30 text-purple-400'}`}>
                        
                        {isStaff ?
                        <BuildingIcon className="h-4 w-4" /> :

                        <UserIcon className="h-4 w-4" />
                        }
                      </div>
                      {!isLast &&
                      <div className="w-px h-full bg-white/10 my-1" />
                      }
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {comment.author}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                          {comment.authorRole}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`text-sm p-3 rounded-xl rounded-tl-none border ${isStaff ? 'bg-blue-500/5 border-blue-500/10 text-gray-300' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                        
                        {comment.content}
                      </div>
                    </div>
                  </div>);

              })}
            </div>

            {/* Comment Input */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <form onSubmit={handleAddComment} className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-dark-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none custom-scrollbar"
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
                  className="absolute right-2 bottom-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors">
                  
                  <SendIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>);

}