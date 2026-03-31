"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaSave, FaSpinner, FaTimes, FaUpload } from "react-icons/fa";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    published: false,
  });
  const [existingCover, setExistingCover] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || "",
          content: data.content || "",
          excerpt: data.excerpt || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
          published: data.published || false,
        });
        if (data.coverImage) {
          setExistingCover(data.coverImage);
        }
      } catch {
        // handle error
      } finally {
        setFetching(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    setExistingCover(null);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    setExistingCover(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("excerpt", form.excerpt);
      formData.append("tags", form.tags);
      formData.append("published", String(form.published));
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      if (!existingCover && !coverImage) {
        formData.append("removeCover", "true");
      }

      const res = await fetch(`/api/blog/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/blog");
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-[#C9A84C]" />
      </div>
    );
  }

  const displayCover = coverPreview || existingCover;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          Edit Blog Post
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Update your article</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200/80 p-6 space-y-6 max-w-3xl"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field w-full"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <p className="text-xs text-gray-400 mb-1">HTML supported</p>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={12}
            className="input-field w-full font-mono text-sm"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            className="input-field w-full"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          {displayCover ? (
            <div className="relative inline-block mb-3">
              <img
                src={displayCover}
                alt="Cover preview"
                className="w-48 h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeCover}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              <FaUpload />
              Upload Cover Image
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImage}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Comma-separated (e.g., gold, coins, investing)"
            className="input-field w-full"
          />
        </div>

        {/* Published */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            id="published"
            checked={form.published}
            onChange={handleChange}
            className="w-4 h-4 text-[#C9A84C] rounded"
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700"
          >
            Published
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSave />
            )}
            {loading ? "Saving..." : "Update Post"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
