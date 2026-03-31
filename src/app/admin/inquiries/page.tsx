"use client";

import { useEffect, useState, useCallback } from "react";
import { FaSpinner, FaSave, FaEnvelope, FaCamera, FaPhone, FaUser, FaPaperPlane, FaReply, FaTimes } from "react-icons/fa";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  description?: string;
  contactMethod?: string;
  images?: string; // JSON string
  status: string;
  adminNotes?: string;
  createdAt: string;
  type: "contact" | "appraisal";
}

interface Reply {
  id: string;
  inquiryId: string;
  inquiryType: string;
  fromAdmin: boolean;
  message: string;
  sentTo: string;
  sentAt: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  new: "bg-red-50 text-red-600 ring-1 ring-red-200",
  read: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  responded: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
};

function parseImages(images: string | string[] | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export default function InquiriesPage() {
  const [activeTab, setActiveTab] = useState<"contact" | "appraisal">("contact");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Reply state
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    if (lightboxImage) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [lightboxImage]);

  const fetchInquiries = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries?type=${type}`);
      const data = await res.json();
      const items: Inquiry[] = data.inquiries || [];
      setInquiries(items);
      const notesMap: Record<string, string> = {};
      const statusMap: Record<string, string> = {};
      items.forEach((item) => {
        notesMap[item.id] = item.adminNotes || "";
        statusMap[item.id] = item.status;
      });
      setNotes(notesMap);
      setStatuses(statusMap);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = useCallback(async (id: string, type: string) => {
    setLoadingReplies((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/inquiries/${id}?type=${type}`);
      const data = await res.json();
      setReplies((prev) => ({ ...prev, [id]: data.replies || [] }));
    } catch {
      setReplies((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  useEffect(() => {
    fetchInquiries(activeTab);
  }, [activeTab]);

  // Fetch replies when a card is expanded
  useEffect(() => {
    if (expandedId) {
      fetchReplies(expandedId, activeTab);
    }
  }, [expandedId, activeTab, fetchReplies]);

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          status: statuses[id],
          adminNotes: notes[id],
        }),
      });
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: statuses[id], adminNotes: notes[id] }
            : item
        )
      );
    } catch {
      alert("Failed to save changes");
    } finally {
      setSavingId(null);
    }
  };

  const handleSendReply = async (inquiry: Inquiry) => {
    const text = replyTexts[inquiry.id]?.trim();
    if (!text) return;

    setSendingReply(inquiry.id);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          message: text,
          toEmail: inquiry.email,
          toName: inquiry.name,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Add the new reply to local state
        setReplies((prev) => ({
          ...prev,
          [inquiry.id]: [...(prev[inquiry.id] || []), data.reply],
        }));
        // Clear the textarea
        setReplyTexts((prev) => ({ ...prev, [inquiry.id]: "" }));
        // Update status to responded
        setStatuses((prev) => ({ ...prev, [inquiry.id]: "responded" }));
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === inquiry.id ? { ...item, status: "responded" } : item
          )
        );

        if (!data.emailSent) {
          alert("Reply saved but email could not be sent (SMTP not configured).");
        }
      } else {
        alert("Failed to send reply");
      }
    } catch {
      alert("Failed to send reply");
    } finally {
      setSendingReply(null);
    }
  };

  const newCount = inquiries.filter((i) => (statuses[i.id] || i.status) === "new").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Inquiries</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {newCount > 0 ? (
              <span className="text-red-500 font-medium">{newCount} new {newCount === 1 ? "inquiry" : "inquiries"}</span>
            ) : (
              "Manage contact and appraisal requests"
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-6 bg-gray-100 p-0.5 rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab("contact"); setExpandedId(null); }}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "contact"
              ? "bg-white text-[#1B2A4A] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Contact Submissions
        </button>
        <button
          onClick={() => { setActiveTab("appraisal"); setExpandedId(null); }}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "appraisal"
              ? "bg-white text-[#1B2A4A] shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Appraisal Requests
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-3xl text-[#C9A84C]" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <FaEnvelope className="text-5xl mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">
              No {activeTab === "contact" ? "contact" : "appraisal"} inquiries yet
            </p>
          </div>
        ) : (
          inquiries.map((inquiry) => {
            const images = parseImages(inquiry.images);
            const isExpanded = expandedId === inquiry.id;
            const currentStatus = statuses[inquiry.id] || inquiry.status;
            const inquiryReplies = replies[inquiry.id] || [];
            const isLoadingReplies = loadingReplies[inquiry.id] || false;

            return (
              <div
                key={inquiry.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-[#C9A84C] text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {inquiry.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {inquiry.email}
                        {inquiry.phone && <span className="ml-2">· {inquiry.phone}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {activeTab === "appraisal" && images.length > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaCamera /> {images.length}
                      </span>
                    )}
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[currentStatus] || statusColors.new}`}>
                      {currentStatus.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {inquiry.createdAt ? format(new Date(inquiry.createdAt), "MMM d, yyyy") : "—"}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-5">
                    {inquiry.subject && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject</label>
                        <p className="text-gray-700">{inquiry.subject}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                        {activeTab === "contact" ? "Message" : "Description"}
                      </label>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                        {inquiry.message || inquiry.description || "No message provided"}
                      </p>
                    </div>

                    {inquiry.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhone className="text-[#C9A84C]" />
                        <a href={`tel:${inquiry.phone}`} className="hover:text-[#C9A84C] transition-colors">{inquiry.phone}</a>
                      </div>
                    )}

                    {activeTab === "appraisal" && images.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                          Uploaded Images
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {images.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxImage(img)}
                              className="cursor-pointer"
                            >
                              <img
                                src={img}
                                alt={`Appraisal image ${i + 1}`}
                                className="w-28 h-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 hover:ring-2 hover:ring-[#C9A84C] transition-all"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conversation Thread */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                        <FaReply className="text-[#C9A84C]" />
                        Conversation
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                        {/* Original message - left aligned */}
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {inquiry.message || inquiry.description || "No message provided"}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 ml-1">
                              {inquiry.name} &middot;{" "}
                              {inquiry.createdAt
                                ? format(new Date(inquiry.createdAt), "MMM d, yyyy 'at' h:mm a")
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Replies */}
                        {isLoadingReplies ? (
                          <div className="flex justify-center py-4">
                            <FaSpinner className="animate-spin text-[#C9A84C]" />
                          </div>
                        ) : (
                          inquiryReplies.map((reply) => (
                            <div key={reply.id} className="flex justify-end">
                              <div className="max-w-[80%]">
                                <div className="bg-[#1B2A4A] text-white rounded-lg p-3 shadow-sm">
                                  <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-right mr-1">
                                  Admin &middot;{" "}
                                  {reply.sentAt
                                    ? format(new Date(reply.sentAt), "MMM d, yyyy 'at' h:mm a")
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Reply textarea */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                        Reply to {inquiry.name}
                      </label>
                      <textarea
                        value={replyTexts[inquiry.id] || ""}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [inquiry.id]: e.target.value }))
                        }
                        rows={4}
                        className="input-field w-full"
                        placeholder={`Write your reply to ${inquiry.email}...`}
                      />
                      <button
                        onClick={() => handleSendReply(inquiry)}
                        disabled={sendingReply === inquiry.id || !replyTexts[inquiry.id]?.trim()}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md"
                      >
                        {sendingReply === inquiry.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPaperPlane />
                        )}
                        Send Reply
                      </button>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => setStatuses((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                          className="input-field w-full"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Admin Notes</label>
                      <textarea
                        value={notes[inquiry.id] || ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                        rows={3}
                        className="input-field w-full"
                        placeholder="Internal notes about this inquiry..."
                      />
                    </div>

                    <button
                      onClick={() => handleSave(inquiry.id)}
                      disabled={savingId === inquiry.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white rounded-lg transition-all font-medium disabled:opacity-60 shadow-sm hover:shadow-md"
                    >
                      {savingId === inquiry.id ? <FaSpinner className="animate-spin" /> : <FaSave />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="text-2xl" />
          </button>
          <img
            src={lightboxImage}
            alt="Appraisal image full view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
