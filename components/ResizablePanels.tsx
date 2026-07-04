"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number; // percentage, e.g. 45
  minWidth?: number; // pixels, e.g. 320
}

export default function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 45,
  minWidth = 320,
}: ResizablePanelsProps) {
  const [leftWidthPct, setLeftWidthPct] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If left panel is null/false (e.g. fullscreen mode), we don't show the handle and right panel takes 100%
  const isLeftPanelVisible = !!leftPanel;

  // On window resize, if window is too small, we disable dragging (handled by CSS/layout mostly, but we can reset)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDoubleClick = () => {
    if (isMobile) return;
    setLeftWidthPct(defaultLeftWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate new percentage based on mouse X relative to container
      // Subtracting rect.left gets us the X inside the container
      let newPct = ((e.clientX - rect.left) / rect.width) * 100;
      
      // We need to enforce minWidth in pixels for both left and right sides.
      // E.g. left side must be at least minWidth pixels
      const minPctForLeft = (minWidth / rect.width) * 100;
      const maxPctForLeft = 100 - (minWidth / rect.width) * 100;

      // also user requested max split 80/20 in either direction
      const finalMinPct = Math.max(20, minPctForLeft);
      const finalMaxPct = Math.min(80, maxPctForLeft);

      if (newPct < finalMinPct) newPct = finalMinPct;
      if (newPct > finalMaxPct) newPct = finalMaxPct;

      setLeftWidthPct(newPct);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minWidth]);

  const isRightPanelVisible = !!rightPanel;

  if (!isLeftPanelVisible) {
    return <>{rightPanel}</>;
  }

  if (!isRightPanelVisible) {
    return <>{leftPanel}</>;
  }

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ display: "flex", padding: "0.5rem", background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", gap: "0.5rem", zIndex: 10 }}>
          <button
            onClick={() => setMobileTab("edit")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: mobileTab === "edit" ? 600 : 400,
              background: mobileTab === "edit" ? "var(--accent-soft)" : "transparent",
              color: mobileTab === "edit" ? "var(--accent)" : "var(--text-muted)",
              border: mobileTab === "edit" ? "1px solid var(--accent)" : "1px solid transparent",
              transition: "all 0.2s"
            }}
          >
            ✏️ Edit Form
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: mobileTab === "preview" ? 600 : 400,
              background: mobileTab === "preview" ? "var(--accent-soft)" : "transparent",
              color: mobileTab === "preview" ? "var(--accent)" : "var(--text-muted)",
              border: mobileTab === "preview" ? "1px solid var(--accent)" : "1px solid transparent",
              transition: "all 0.2s"
            }}
          >
            📄 Preview
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: mobileTab === "edit" ? "block" : "none", height: "100%", overflowY: "auto" }}>
            {leftPanel}
          </div>
          <div style={{ display: mobileTab === "preview" ? "block" : "none", height: "100%", overflowY: "auto", background: "var(--bg-elevated)" }}>
            {rightPanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex flex-1 min-w-0"
      style={{ height: "100%" }}
    >
      {/* Left Panel */}
      <div 
        style={{ 
          flexBasis: `calc(${leftWidthPct}% - 10px)`, 
          width: `calc(${leftWidthPct}% - 10px)`,
          flexGrow: 0,
          flexShrink: 0,
          minWidth: 0 
        }}
      >
        {leftPanel}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          width: "12px",
          margin: "0 4px",
          cursor: "col-resize",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "4px",
          transition: "background-color 0.2s",
        }}
        className="group hover:bg-[var(--accent)] active:bg-[var(--accent)]"
        title="Drag to resize, double-click to reset"
      >
        <div style={{
          height: "24px",
          width: "4px",
          borderRadius: "2px",
          backgroundColor: "var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="group-hover:bg-white group-active:bg-white"
        >
          <div style={{ width: "2px", height: "2px", backgroundColor: "inherit", borderRadius: "50%" }}></div>
          <div style={{ width: "2px", height: "2px", backgroundColor: "inherit", borderRadius: "50%" }}></div>
          <div style={{ width: "2px", height: "2px", backgroundColor: "inherit", borderRadius: "50%" }}></div>
        </div>
      </div>

      {/* Right Panel */}
      <div 
        style={{ 
          flexBasis: `calc(${100 - leftWidthPct}% - 10px)`, 
          width: `calc(${100 - leftWidthPct}% - 10px)`,
          flexGrow: 0,
          flexShrink: 0,
          minWidth: 0 
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
