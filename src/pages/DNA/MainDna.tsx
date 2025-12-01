import { useState } from "react";
import MandateListPage from "./Mandate/Mandate";
import DNAList from "./DNA/DNAList";

export default function MainDna() {
  const [activeTab, setActiveTab] = useState("mandate");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-emerald-600 px-6 py-4">
        <button
          onClick={() => setActiveTab("mandate")}
          className={`pb-2 text-lg font-semibold transition-all ${
            activeTab === "mandate"
              ? "text-emerald-400 border-b-4 border-emerald-400"
              : "text-gray-400 hover:text-emerald-300"
          }`}
        >
          Mandate
        </button>

        <button
          onClick={() => setActiveTab("dna")}
          className={`pb-2 text-lg font-semibold transition-all ${
            activeTab === "dna"
              ? "text-emerald-400 border-b-4 border-emerald-400"
              : "text-gray-400 hover:text-emerald-300"
          }`}
        >
          DNA
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "mandate" && <MandateListPage />}
        {activeTab === "dna" && <DNAList />}
      </div>
    </div>
  );
}
