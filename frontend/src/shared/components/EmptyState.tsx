"use client";

type EmptyStateProps = {
  moduleName: string;
  message?: string;
  onRetry?: () => void;
};

/**
 * Callback-friendly empty state.
 * Template: "No {moduleName} data found"
 * Usage: <EmptyState moduleName="Treatments" /> or getEmptyMessage("Treatments")
 */
export function getEmptyMessage(moduleName: string): string {
  return `No ${moduleName} data found`;
}

export function EmptyState({ moduleName, message, onRetry }: EmptyStateProps) {
  const text = message || getEmptyMessage(moduleName);
  return (
    <div className="py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className="material-icons text-3xl text-zinc-400">inbox</span>
        </div>
        <p className="body-lg text-zinc-500">{text}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span className="material-icons text-base">refresh</span>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

// Callback factory for reuse: createNoDataCallback("Treatments") => () => "No Treatments data found"
export function createNoDataCallback(moduleName: string): () => string {
  return () => getEmptyMessage(moduleName);
}
