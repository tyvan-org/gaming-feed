const sourceLabels: Record<string, string> = {
  ign: "IGN",
  pcgamer: "PC Gamer",
  gamespot: "GameSpot",
  polygon: "Polygon",
  kotaku: "Kotaku",
  eurogamer: "Eurogamer",
  rockpapershotgun: "Rock Paper Shotgun",
  "steam-news": "Steam News",
  "steam-sale": "Steam Sale",
  "youtube-indie-games-hub": "Indie Games Hub",
  "youtube-gametrailers": "GameTrailers",
  "youtube-playstation": "PlayStation",
};

export function formatSourceLabel(sourceId: string) {
  return (
    sourceLabels[sourceId] ??
    sourceId
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}
