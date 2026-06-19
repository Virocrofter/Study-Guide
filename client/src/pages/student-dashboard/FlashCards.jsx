import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const FlashCards = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [cards, setCards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [studyMode, setStudyMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", tags: "", folderId: "" });
  const [newFolder, setNewFolder] = useState({ name: "", color: "#10b981" });
  const [showFolderAdd, setShowFolderAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Generator Tab State
  const [activeGenTab, setActiveGenTab] = useState("upload");
  const [pastedText, setPastedText] = useState("");

  const fetchData = async () => {
    try {
      const [cardsRes, foldersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/user/flashcards`, { withCredentials: true }),
        axios.get(`${backendUrl}/api/user/folders`, { withCredentials: true }),
      ]);
      if (cardsRes.data.success) setCards(cardsRes.data.flashcards);
      if (foldersRes.data.success) setFolders(foldersRes.data.folders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return toast.error("Fill both sides");
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/flashcards`,
        { ...newCard, tags: newCard.tags.split(",").map((t) => t.trim()).filter(Boolean) },
        { withCredentials: true }
      );
      if (data.success) {
        setCards([data.flashcard, ...cards]);
        setShowAdd(false);
        setNewCard({ front: "", back: "", tags: "", folderId: "" });
        toast.success("Flashcard created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const addFolder = async () => {
    if (!newFolder.name.trim()) return toast.error("Enter folder name");
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/folders`,
        newFolder,
        { withCredentials: true }
      );
      if (data.success) {
        setFolders([data.folder, ...folders]);
        setShowFolderAdd(false);
        setNewFolder({ name: "", color: "#10b981" });
        toast.success("Folder created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteCard = async (id) => {
    if (!confirm("Delete this flashcard?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/flashcards/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        setCards(cards.filter((c) => c._id !== id));
        toast.success("Deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const reviewCard = async (id, quality) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/flashcards/${id}/review`,
        { quality },
        { withCredentials: true }
      );
      if (data.success) {
        setCards(cards.map((c) => (c._id === id ? data.flashcard : c)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCards = selectedFolder === "all"
    ? cards
    : cards.filter((c) => c.folderId === selectedFolder);

  const dueCards = filteredCards.filter((c) => !c.nextReview || new Date(c.nextReview) <= new Date());

  useEffect(() => {
    if (userData) fetchData();
  }, [userData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 max-w-6xl text-left">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flash Cards</h1>
          <p className="text-slate-500 mt-1">Create, organize, and study with spaced repetition.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFolderAdd(true)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            New Folder
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Card
          </button>
        </div>
      </div>

      {/* AI GENERATE FLASHCARDS MODULE */}
      {!studyMode && (
        <div className="bg-[#030712] text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Generate flashcards with AI</h2>
            <p className="text-slate-400 text-sm mt-1">
              Choose or upload source documents to instantly build customized smart decks
            </p>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-800/80 pb-3 mb-6 text-xs md:text-sm font-medium overflow-x-auto">
            <button
              onClick={() => setActiveGenTab("upload")}
              className={`pb-2 whitespace-nowrap transition-all ${activeGenTab === "upload" ? "text-blue-400 border-b-2 border-blue-500 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Upload files
            </button>
            <button
              onClick={() => setActiveGenTab("paste")}
              className={`pb-2 whitespace-nowrap transition-all ${activeGenTab === "paste" ? "text-blue-400 border-b-2 border-blue-500 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Paste text
            </button>
            <button
              onClick={() => setActiveGenTab("drive")}
              className={`pb-2 whitespace-nowrap transition-all ${activeGenTab === "drive" ? "text-blue-400 border-b-2 border-blue-500 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
            >
              Google Drive
            </button>
          </div>

          <div className="min-h-[220px]">
            {activeGenTab === "upload" && (
              <div className="border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/10 min-h-[220px]">
                <div className="flex items-center justify-center -space-x-1 mb-4">
                  <span className="bg-blue-600 text-white font-bold text-[9px] px-2 py-1.5 rounded-md transform -rotate-12">.DOCX</span>
                  <span className="bg-pink-600 text-white font-bold text-[9px] px-2 py-1.5 rounded-md relative z-10">.PDF</span>
                  <span className="bg-amber-500 text-white font-bold text-[9px] px-2 py-1.5 rounded-md transform rotate-12">.PPTX</span>
                </div>
                <p className="text-sm text-slate-200 font-medium">Drag and drop notes, syllabus guidelines, or study text</p>
                <p className="text-[11px] text-slate-500 mt-1">Supported file types are .docx, .pdf, .pptx</p>
                <button className="mt-5 bg-slate-800 border border-slate-700 text-xs font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-700 transition-all text-slate-200">
                  Browse files
                </button>
              </div>
            )}

            {activeGenTab === "paste" && (
              <div className="w-full">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your custom learning text here..."
                  className="w-full min-h-[200px] bg-transparent text-slate-200 placeholder-slate-600 text-sm p-4 rounded-2xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {activeGenTab === "drive" && (
              <div className="border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 min-h-[220px]">
                <div className="w-10 h-10 mb-4 flex items-center justify-center bg-slate-900 rounded-full border border-slate-800">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M8.5 4.5L2.5 15L5.5 20.5L11.5 10L8.5 4.5Z" fill="#0066DA" />
                    <path d="M21.5 15L15.5 4.5H9.5L15.5 15H21.5Z" fill="#00AA47" />
                    <path d="M15.5 15L12.5 20.5H2.5L5.5 15H15.5Z" fill="#FFBA00" />
                  </svg>
                </div>
                <p className="text-sm text-slate-200 font-medium">Select materials straight from your Google Drive storage</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Make sure pop-up blockers are turned off before syncing your account.
                </p>
                <button className="mt-5 bg-[#161b30] border border-slate-800 text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1f2642] transition-all text-slate-200">
                  Connect Drive
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Dashboard Cards */}
      {!studyMode && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-slate-900">{cards.length}</p>
            <p className="text-sm text-slate-500">Total Cards</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-emerald-600">{dueCards.length}</p>
            <p className="text-sm text-slate-500">Due for Review</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(cards.reduce((acc, c) => acc + (c.mastery || 0), 0) / (cards.length || 1))}%
            </p>
            <p className="text-sm text-slate-500">Avg Mastery</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-violet-600">
              {cards.reduce((acc, c) => acc + (c.reviewCount || 0), 0)}
            </p>
            <p className="text-sm text-slate-500">Total Reviews</p>
          </div>
        </div>
      )}

      {/* Filter Options */}
      {!studyMode && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFolder("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedFolder === "all" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"}`}
          >
            All Cards
          </button>
          {folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => setSelectedFolder(folder._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${selectedFolder === folder._id ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
              {folder.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Study Deck Session Window */}
      {studyMode && dueCards.length > 0 ? (
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-emerald-700">
              Card {currentCard + 1} of {dueCards.length}
            </p>
            <button onClick={() => { setStudyMode(false); setCurrentCard(0); setFlipped(false); }} className="text-sm text-slate-500 hover:text-slate-700">
              Exit Study Mode
            </button>
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            className="bg-white rounded-2xl p-12 min-h-[300px] flex items-center justify-center cursor-pointer shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">{flipped ? "Answer" : "Question"}</p>
              <p className="text-2xl font-bold text-slate-800">
                {flipped ? dueCards[currentCard].back : dueCards[currentCard].front}
              </p>
              {dueCards[currentCard].tags?.length > 0 && (
                <div className="flex gap-2 justify-center mt-4">
                  {dueCards[currentCard].tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: "Again", color: "bg-red-500 hover:bg-red-600", quality: 0 },
              { label: "Hard", color: "bg-amber-500 hover:bg-amber-600", quality: 1 },
              { label: "Good", color: "bg-emerald-500 hover:bg-emerald-600", quality: 2 },
              { label: "Easy", color: "bg-blue-500 hover:bg-blue-600", quality: 3 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => {
                  reviewCard(dueCards[currentCard]._id, btn.quality);
                  setFlipped(false);
                  if (currentCard < dueCards.length - 1) {
                    setCurrentCard(currentCard + 1);
                  } else {
                    setStudyMode(false);
                    setCurrentCard(0);
                    toast.success("Study session complete!");
                  }
                }}
                className={`py-3 rounded-xl text-white font-semibold text-sm transition-colors ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {dueCards.length > 0 && !studyMode && (
            <button
              onClick={() => setStudyMode(true)}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg mb-6 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Study {dueCards.length} Due Cards
            </button>
          )}

          {!studyMode && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <div key={card._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group text-left">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {card.mastery || 0}%
                    </div>
                    <button
                      onClick={() => deleteCard(card._id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-1 line-clamp-2">{card.front}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{card.back}</p>
                  {card.tags?.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {card.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span>{card.reviewCount || 0} reviews</span>
                    {card.nextReview && new Date(card.nextReview) > new Date() && (
                      <span>• Due {new Date(card.nextReview).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No flashcards in this deck</h3>
                  <p className="text-slate-400">Add custom cards manually or generate them with AI above.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Manual Input Modals */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Flashcard</h3>
            <div className="space-y-3">
              <textarea
                placeholder="Front (Question)"
                value={newCard.front}
                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              />
              <textarea
                placeholder="Back (Answer)"
                value={newCard.back}
                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              />
              <input
                placeholder="Tags (comma separated)"
                value={newCard.tags}
                onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newCard.folderId}
                onChange={(e) => setNewCard({ ...newCard, folderId: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addCard} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Create</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showFolderAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Folder</h3>
            <div className="space-y-3">
              <input
                placeholder="Folder name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewFolder({ ...newFolder, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${newFolder.color === color ? "scale-125 ring-2 ring-slate-400" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addFolder} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Create</button>
              <button onClick={() => setShowFolderAdd(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;