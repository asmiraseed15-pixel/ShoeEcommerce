
import React from "react";

const images = Object.entries(
  import.meta.glob("./assets/*.png", {
    eager: true,
    import: "default",
  })
)
  .filter(([path]) => /\/(girls|boy|kids)\d+\.png$/i.test(path))
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

export default function ImagePreview() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 16,
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {images.map(([path, image]) => (
        <div key={path} style={{ border: "1px solid #ddd", padding: 10 }}>
          <img
            src={image}
            alt={path}
            style={{ width: "100%", height: 150, objectFit: "contain" }}
          />
          <p style={{ textAlign: "center", color: "#111" }}>
            {path.split("/").pop()}
          </p>
        </div>
      ))}
    </div>
  );
}

