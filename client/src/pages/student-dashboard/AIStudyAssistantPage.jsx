import React from "react";
import AIAssistant from "../../components/student/AIAssistant";

const AIStudyAssistantPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Study Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">Generate flashcards, study guides, and practice tests from your notes</p>
      </div>
      <AIAssistant />
    </div>
  );
};

export default AIStudyAssistantPage;