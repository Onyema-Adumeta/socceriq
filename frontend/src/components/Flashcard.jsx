import { useState } from "react";

export default function Flashcard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={"flashcard" + (flipped ? " flashcard--flipped" : "")} onClick={() => setFlipped(f => !f)} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setFlipped(f => !f)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flashcard-category">{card.category}</div>
          <div className="flashcard-question">{card.front}</div>
          <div className="flashcard-hint">Tap to reveal answer</div>
          <div className="flashcard-counter">{index + 1} / {total}</div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-category">{card.category}</div>
          <div className="flashcard-answer">{card.back}</div>
          <div className="flashcard-hint">Tap to see question</div>
        </div>
      </div>
    </div>
  );
}