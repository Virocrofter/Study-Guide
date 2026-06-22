import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const FlashCards = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContext);

  const [folders, setFolders] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activeTag, setActiveTag] = useState("All");
  const [tags, setTags] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", tag: "" });

  // Determine if we're in folder detail view
  const isFolderView = Boolean(folderId);

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/study/folders`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
        });
        const data = await res.json();
        if (data.success) setFolders(data.folders);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
      }
    };
    fetchFolders();
  }, [backendUrl, userData]);

  // Fetch folder details and flashcards when folderId changes
  useEffect(() => {
    if (!folderId) {
      setSelectedFolder(null);
      setFlashcards([]);
      setLoading(false);
      return;
    }

    const fetchFolderDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/study/folders/${folderId}`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSelectedFolder(data.folder);
          setFlashcards(data.folder.flashcards || []);
          // Extract unique tags
          const allTags = [...new Set(data.folder.flashcards?.map(c => c.tag).filter(Boolean))];
          setTags(allTags);
        }
      } catch (err) {
        console.error("Failed to fetch folder:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFolderDetail();
  }, [folderId, backendUrl, userData]);

  // Filter flashcards by tag
  const filteredCards = activeTag === "All" 
    ? flashcards 
    : flashcards.filter(c => c.tag === activeTag);

  // Menu actions
  const handleMenuAction = (action, folder) => {
    setShowMenu(null);
    switch (action) {
      case "add-tag":
        // Implement add tag logic
        break;
      case "edit":
        navigate(`/student/flash-cards/folder/${folder._id}/edit`);
        break;
      case "share":
        // Implement share logic
        navigator.clipboard.writeText(`${window.location.origin}/student/flash-cards/folder/${folder._id}`);
        break;
      case "unpin":
        // Unpin from sidebar
        break;
      case "delete":
        if (confirm("Delete this folder?")) {
          // API call to delete
        }
        break;
      default:
        break;
    }
  };

  // Add new flashcard
  const handleAddCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    try {
      const res = await fetch(`${backendUrl}/api/study/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.token}`,
        },
        body: JSON.stringify({ ...newCard, folderId }),
      });
      const data = await res.json();
      if (data.success) {
        setFlashcards([...flashcards, data.flashcard]);
        setNewCard({ front: "", back: "", tag: "" });
        setShowAddModal(false);
      }
    } catch (err) {
      console.error("Failed to add card:", err);
    }
  };

  // Folder list view (no folderId)
  if (!isFolderView) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Flash Cards</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <img src={assets.add_icon} alt="+" className="w-4 h-4" />
            New Folder
          </button>
        </div>

        {folders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No folders yet</h3>
            <p className="text-gray-500 mb-4">Create a folder to organize your flashcards</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map(folder => (
              <div 
                key={folder._id}
                onClick={() => navigate(`/student/flash-cards/folder/${folder._id}`)}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🗂️</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === folder._id ? null : folder._id); }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    ⋮
                  </button>
                </div>
                {showMenu === folder._id && (
                  <div className="absolute right-4 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    <button onClick={() => handleMenuAction("add-tag", folder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Add tag</button>
                    <button onClick={() => handleMenuAction("edit", folder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Edit</button>
                    <button onClick={() => handleMenuAction("share", folder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Share</button>
                    <button onClick={() => handleMenuAction("unpin", folder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Unpin from sidebar</button>
                    <hr className="my-1" />
                    <button onClick={() => handleMenuAction("delete", folder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">Delete</button>
                  </div>
                )}
                <h3 className="font-semibold text-gray-800 mb-1">{folder.name}</h3>
                <p className="text-sm text-gray-500">{folder.flashcardCount || 0} cards</p>
                {folder.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {folder.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Folder detail view
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <button onClick={() => navigate("/student/flash-cards")} className="hover:text-blue-600">Flash Cards</button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{selectedFolder?.name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{selectedFolder?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{flashcards.length} cards</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <img src={assets.add_icon} alt="+" className="w-4 h-4" />
            Add Card
          </button>
          <button 
            onClick={() => setShowMenu(showMenu === 'main' ? null : 'main')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ⋮
          </button>
        </div>
      </div>

      {showMenu === 'main' && (
        <div className="absolute right-6 top-24 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
          <button onClick={() => handleMenuAction("add-tag", selectedFolder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Add tag</button>
          <button onClick={() => handleMenuAction("edit", selectedFolder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Edit folder</button>
          <button onClick={() => handleMenuAction("share", selectedFolder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Share</button>
          <button onClick={() => handleMenuAction("unpin", selectedFolder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Unpin from sidebar</button>
          <hr className="my-1" />
          <button onClick={() => handleMenuAction("delete", selectedFolder)} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">Delete folder</button>
        </div>
      )}

      {/* Tag filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTag("All")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTag === "All" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            +{tag}
          </button>
        ))}
        <button 
          onClick={() => handleMenuAction("add-tag", selectedFolder)}
          className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          + Tag
        </button>
      </div>

      {/* Flashcards grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {activeTag === "All" ? "No flashcards yet" : `No cards with tag "${activeTag}"`}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTag === "All" ? "Add your first flashcard to start studying" : "Try a different tag or add new cards"}
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Study Materials
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <div 
              key={card._id}
              className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{card.tag || "General"}</span>
                <button className="p-1 hover:bg-gray-100 rounded">⋮</button>
              </div>
              <p className="font-medium text-gray-800 mb-2">{card.front}</p>
              <p className="text-sm text-gray-500">{card.back}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Add Flashcard</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front</label>
                <input 
                  type="text"
                  value={newCard.front}
                  onChange={e => setNewCard({...newCard, front: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Question or term..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Back</label>
                <textarea 
                  value={newCard.back}
                  onChange={e => setNewCard({...newCard, back: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Answer or definition..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                <input 
                  type="text"
                  value={newCard.tag}
                  onChange={e => setNewCard({...newCard, tag: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Biology, Chapter 1..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;