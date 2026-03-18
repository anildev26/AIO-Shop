"use client";

import { useState, type ReactNode } from "react";

interface Props {
  productsTab: ReactNode;
  contactTab: ReactNode;
  feedbackTab: ReactNode;
}

const tabs = ["Products", "Contact", "Feedback"] as const;

export default function DashboardTabs({ productsTab, contactTab, feedbackTab }: Props) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Products");

  return (
    <div>
      <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`pb-3 text-sm font-medium transition border-b-2 -mb-px ${
                active === tab
                  ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div>
        {active === "Products" && productsTab}
        {active === "Contact" && contactTab}
        {active === "Feedback" && feedbackTab}
      </div>
    </div>
  );
}
