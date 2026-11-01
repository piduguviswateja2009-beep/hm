function inlineText(line:string) {
  const parts=line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:part.startsWith("*")&&part.endsWith("*")?<em key={index}>{part.slice(1,-1)}</em>:part.startsWith("`")&&part.endsWith("`")?<code key={index} className="rounded bg-surface px-1 py-0.5 font-mono text-[.9em]">{part.slice(1,-1)}</code>:part);
}

/** Renders the supported Markdown subset as React text nodes; raw HTML is never interpreted. */
export function MarkdownContent({content}:{content:string}) {
  const blocks=content.replace(/\r\n?/g,"\n").split(/\n\s*\n/).map((block)=>block.trim()).filter(Boolean);
  return <div className="space-y-5 text-base leading-8 text-ink">{blocks.map((block,index)=>{
    const lines=block.split("\n");
    const heading=lines.length===1&&/^(#{1,4})\s+(.+)$/.exec(lines[0]);
    if(heading){const level=heading[1].length;const text=heading[2];const className="font-semibold tracking-tight text-navy "+(level===1?"text-3xl":level===2?"text-2xl":level===3?"text-xl":"text-lg");if(level<=2)return level===1?<h2 key={index} className={className}>{inlineText(text)}</h2>:<h3 key={index} className={className}>{inlineText(text)}</h3>;return <h4 key={index} className={className}>{inlineText(text)}</h4>;}
    if(lines.every((line)=>/^[-*]\s+/.test(line)))return <ul key={index} className="list-disc space-y-2 pl-6">{lines.map((line,item)=><li key={item}>{inlineText(line.replace(/^[-*]\s+/,""))}</li>)}</ul>;
    if(lines.every((line)=>/^\d+\.\s+/.test(line)))return <ol key={index} className="list-decimal space-y-2 pl-6">{lines.map((line,item)=><li key={item}>{inlineText(line.replace(/^\d+\.\s+/,""))}</li>)}</ol>;
    if(lines.every((line)=>/^>\s?/.test(line)))return <blockquote key={index} className="border-l-4 border-aqua pl-5 italic text-muted">{lines.map((line,item)=><span key={item}>{inlineText(line.replace(/^>\s?/,""))}{item<lines.length-1&&<br/>}</span>)}</blockquote>;
    return <p key={index}>{lines.map((line,item)=><span key={item}>{inlineText(line)}{item<lines.length-1&&<br/>}</span>)}</p>;
  })}</div>;
}
