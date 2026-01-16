import { FileDiff } from "@pierre/diffs/react";
import { parsePatchFiles, type FileDiffMetadata } from "@pierre/diffs";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface DiffData {
  patch: string;
  theme: "pierre-dark" | "pierre-light";
}

const App = () => {
  const [data, setData] = useState<DiffData | null>(null);
  const [files, setFiles] = useState<FileDiffMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diff")
      .then((res) => res.json())
      .then((data: DiffData) => {
        setData(data);
        const parsed = parsePatchFiles(data.patch);
        const allFiles = parsed.flatMap((p) => p.files);
        setFiles(allFiles);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div style={{ color: "red", padding: 20 }}>Error: {error}</div>;
  }

  if (!data) {
    return <div style={{ color: "#888", padding: 20 }}>Loading...</div>;
  }

  if (files.length === 0) {
    return <div style={{ color: "#888", padding: 20 }}>No changes</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {files.map((file, i) => (
        <FileDiff
          key={i}
          fileDiff={file}
          options={{
            theme: data.theme,
            diffStyle: "unified",
            diffIndicators: "bars",
            lineDiffType: "word",
          }}
        />
      ))}
    </div>
  );
};

createRoot(document.getElementById("diff")!).render(<App />);
