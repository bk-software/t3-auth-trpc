"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function PostCRUD() {
  const [name, setName] = useState("");
  const [editingPost, setEditingPost] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const utils = api.useUtils();
  const posts = api.post.getAll.useQuery();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      // Changed to async
      await utils.post.getAll.invalidate(); // Await the invalidate call
      setName("");
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.getAll.invalidate();
      setEditingPost(null);
    },
  });
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => utils.post.getAll.invalidate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, name });
    } else {
      createPost.mutate({ name });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Posts CRUD</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Post name"
          className="mr-2 rounded-md border p-2 text-black"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
          disabled={createPost.isPending || updatePost.isPending}
        >
          {editingPost ? "Update" : "Create"} Post
        </button>
      </form>

      {posts.data?.map((post) => (
        <div key={post.id} className="mb-2 flex items-center">
          <span className="mr-2">{post.name}</span>
          <button
            onClick={() => {
              setEditingPost({ id: post.id, name: post.name ?? "" });
              setName(post.name ?? "");
            }}
            className="mr-2 rounded-md bg-yellow-500 px-2 py-1 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => deletePost.mutate({ id: post.id })}
            className="rounded-md bg-red-500 px-2 py-1 text-white"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
