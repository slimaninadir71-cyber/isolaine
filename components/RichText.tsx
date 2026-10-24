// Mise en forme d'une description texte : paragraphes, listes à puces et intertitres courts.
type Block = { t: "p" | "h"; text: string } | { t: "ul"; items: string[] };

export function toBlocks(src: string): Block[] {
  const lines = src.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const out: Block[] = [];
  for (const l of lines) {
    const bullet = l.match(/^(?:[-•*–·✓✔]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      const last = out[out.length - 1];
      if (last && last.t === "ul") last.items.push(bullet[1]);
      else out.push({ t: "ul", items: [bullet[1]] });
    } else if (l.length <= 70 && /:$/.test(l)) {
      out.push({ t: "h", text: l.replace(/\s*:$/, "") });
    } else {
      out.push({ t: "p", text: l });
    }
  }
  return out;
}

export function RichText({ text }: { text: string }) {
  const blocks = toBlocks(text);
  return (
    <div className="rich">
      {blocks.map((b, i) =>
        b.t === "ul" ? <ul key={i}>{b.items.map((x, k) => <li key={k}>{x}</li>)}</ul>
          : b.t === "h" ? <h3 key={i}>{b.text}</h3>
            : <p key={i}>{b.text}</p>)}
    </div>
  );
}
