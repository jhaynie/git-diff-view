import { FileDiff } from "@pierre/diffs/react";
import { parsePatchFiles, type FileDiffMetadata } from "@pierre/diffs";
import React, { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

interface DiffData {
  patch: string;
  theme: "pierre-dark" | "pierre-light";
}

type DiffStyle = "unified" | "split";

interface IconProps {
  size?: number;
}

function IconDiffSplit({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <path d="M14 0H8.5v16H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2m-1.5 6.5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0" />
      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.5V0zm.5 7.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1" opacity={0.3} />
    </svg>
  );
}

function IconDiffUnified({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <path fillRule="evenodd" d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8.5h16zm-8-4a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1A.5.5 0 0 0 8 10" clipRule="evenodd" />
      <path fillRule="evenodd" d="M14 0a2 2 0 0 1 2 2v5.5H0V2a2 2 0 0 1 2-2zM6.5 3.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z" clipRule="evenodd" opacity={0.4} />
    </svg>
  );
}

function IconCodeStyleBars({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <g opacity={0.4}>
        <path d="M4.25 13a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1 0-1.5zM6.25 1a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1 0-1.5zM4 4.75A.75.75 0 0 1 4.75 4h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 4.75" />
      </g>
      <path fillRule="evenodd" d="M4 7.75A.75.75 0 0 1 4.75 7h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 7.75" clipRule="evenodd" />
      <path d="M4 10.75a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75M0 7.5A.5.5 0 0 1 .5 7h1a.5.5 0 0 1 .5.5V11a.5.5 0 0 1-.5.5h-1A.5.5 0 0 1 0 11z" />
    </svg>
  );
}

function IconCodeStyleBg({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <path d="M0 2.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 2.25" opacity={0.4} />
      <path fillRule="evenodd" d="M15 5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2.5 9a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1zm0-2a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1z" clipRule="evenodd" />
      <path d="M0 14.75A.75.75 0 0 1 .75 14h5.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75" opacity={0.4} />
    </svg>
  );
}

function IconChevronDown({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <path fillRule="evenodd" d="M4.22 5.72a.75.75 0 0 1 1.06 0L8 8.44l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.78a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function IconChevronRight({ size = 16 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width={size} height={size}>
      <path fillRule="evenodd" d="M5.72 11.78a.75.75 0 0 1 0-1.06L8.44 8 5.72 5.28a.75.75 0 0 1 1.06-1.06l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0z" clipRule="evenodd" />
    </svg>
  );
}

interface IconButtonProps {
  onClick: () => void;
  icon: ReactNode;
  title: string;
}

function IconButton({ onClick, icon, title }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.7,
        color: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
    >
      {icon}
    </button>
  );
}

const App = () => {
  const [data, setData] = useState<DiffData | null>(null);
  const [files, setFiles] = useState<FileDiffMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [diffStyle, setDiffStyle] = useState<DiffStyle>("unified");
  const [disableBackground, setDisableBackground] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Record<number, boolean>>({});

  const toggleCollapse = (index: number) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  const renderHeaderMetadata = (index: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: -4 }}>
      <IconButton
        onClick={() => setDiffStyle((c) => (c === "split" ? "unified" : "split"))}
        icon={diffStyle === "split" ? <IconDiffSplit size={16} /> : <IconDiffUnified size={16} />}
        title={diffStyle === "split" ? "Switch to unified" : "Switch to split"}
      />
      <IconButton
        onClick={() => setDisableBackground((c) => !c)}
        icon={disableBackground ? <IconCodeStyleBars size={16} /> : <IconCodeStyleBg size={16} />}
        title={disableBackground ? "Enable background" : "Disable background"}
      />
      <IconButton
        onClick={() => toggleCollapse(index)}
        icon={collapsedFiles[index] ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
        title={collapsedFiles[index] ? "Expand" : "Collapse"}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {files.map((file, i) => {
        const isCollapsed = collapsedFiles[i] ?? false;
        return (
          <FileDiff
            key={`${i}-${isCollapsed}`}
            fileDiff={file}
            options={{
              theme: data.theme,
              diffStyle,
              diffIndicators: "bars",
              lineDiffType: "word",
              disableBackground,
              unsafeCSS: isCollapsed ? "[data-code] { display: none; }" : "",
            }}
            renderHeaderMetadata={() => renderHeaderMetadata(i)}
          />
        );
      })}
    </div>
  );
};

createRoot(document.getElementById("diff")!).render(<App />);
