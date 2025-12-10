import React, { useState, useEffect } from "react";
import { X, Plus, Folder, Loader2, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Collection {
  id: string;
  name: string;
  description?: string;
  company_count?: number;
  created_at: string;
}

interface FavoriteCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | number;
  companyName: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function FavoriteCollectionsModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
  onError,
}: FavoriteCollectionsModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Fetch collections when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        onError?.("Please log in to view collections");
        return;
      }

      const response = await fetch(
        "https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/get-fav-collections",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setCollections(result.data || []);
      } else {
        onError?.(result.error || "Failed to fetch collections");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      onError?.("Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      onError?.("Please enter a collection name");
      return;
    }

    setCreatingCollection(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        onError?.("Please log in to create collections");
        return;
      }

      //   const response = await fetch(
      //     "https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/create-collection",
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${session.access_token}`,
      //         apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      //       },
      //       body: JSON.stringify({
      //         name: newCollectionName.trim(),
      //         description: newCollectionDescription.trim() || null,
      //       }),
      //     }
      //   );

      const result = await response.json();

      if (result.success) {
        onSuccess?.("Collection created successfully!");
        setNewCollectionName("");
        setNewCollectionDescription("");
        setShowNewCollectionForm(false);
        fetchCollections(); // Refresh the list
      } else {
        onError?.(result.error || "Failed to create collection");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      onError?.("Failed to create collection");
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!selectedCollectionId) {
      onError?.("Please select a collection");
      return;
    }

    setAdding(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        onError?.("Please log in to add favorites");
        return;
      }

      const response = await fetch(
        "https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/add-favorite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            company_id: companyId,
            collection_id: selectedCollectionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.message || `${companyName} added to favorites!`);
        onClose();
      } else {
        onError?.(result.error || "Failed to add favorite");
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
      onError?.("Failed to add favorite");
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Add to Favorites
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Save{" "}
              <span className="font-semibold text-blue-400">{companyName}</span>{" "}
              to a collection
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-500 mr-3" size={32} />
              <span className="text-slate-300">Loading collections...</span>
            </div>
          ) : (
            <>
              {/* Collections List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Select Collection
                </h3>

                {collections.length === 0 ? (
                  <div className="text-center py-8 bg-slate-800/50 rounded-lg border border-slate-700">
                    <Folder className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No collections yet</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Create your first collection below
                    </p>
                  </div>
                ) : (
                  collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollectionId(collection.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedCollectionId === collection.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Folder
                            className={`w-5 h-5 mt-0.5 ${
                              selectedCollectionId === collection.id
                                ? "text-blue-400"
                                : "text-slate-400"
                            }`}
                          />
                          <div>
                            <h4 className="font-semibold text-white">
                              {collection.name}
                            </h4>
                            {collection.description && (
                              <p className="text-sm text-slate-400 mt-1">
                                {collection.description}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              {collection.company_count || 0} companies
                            </p>
                          </div>
                        </div>
                        {selectedCollectionId === collection.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* New Collection Form */}
              {showNewCollectionForm ? (
                <div className="bg-slate-800/50 rounded-lg border-2 border-blue-500/30 p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-400" />
                    New Collection
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Collection Name *
                      </label>
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., High Priority Leads"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newCollectionDescription}
                        onChange={(e) =>
                          setNewCollectionDescription(e.target.value)
                        }
                        placeholder="Add a description..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
                        maxLength={500}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateCollection}
                        disabled={
                          creatingCollection || !newCollectionName.trim()
                        }
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {creatingCollection ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Create Collection
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewCollectionForm(false);
                          setNewCollectionName("");
                          setNewCollectionDescription("");
                        }}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCollectionForm(true)}
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg text-slate-300 font-semibold hover:border-blue-500 hover:text-blue-400 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create New Collection
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !showNewCollectionForm && (
          <div className="p-6 border-t border-slate-700 bg-slate-900/50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCollection}
                disabled={!selectedCollectionId || adding}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 rounded-lg font-semibold hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Adding...
                  </>
                ) : (
                  <>
                    <Star size={20} />
                    Add to Collection
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
