

const TIPS = [
  { icon: '🟦', title: 'Add a shape', text: 'Click Rectangle or Circle. It appears already selected.' },
  { icon: '🔤', title: 'Add text', text: 'Click Text, then double-click it to type. Click outside when done.' },
  { icon: '🖌️', title: 'Draw freehand', text: 'Turn the Pen on and drag on the canvas. Turn it off to select again.' },
  { icon: '✋', title: 'Move', text: 'Click an object and drag it.' },
  { icon: '↔️', title: 'Resize', text: 'Drag the corner squares of a selected object.' },
  { icon: '🔄', title: 'Rotate', text: 'Drag the small handle floating above a selected object.' },
  { icon: '🎨', title: 'Change colour', text: 'Select an object, then pick a colour. New shapes use it too.' },
  { icon: '🗑️', title: 'Delete', text: 'Select an object and click Delete.' },
  { icon: '🔍', title: 'Zoom', text: 'Use ➕ / ➖, pinch on a trackpad, or Ctrl + scroll.' },
  { icon: '🧭', title: 'Move around', text: 'Scroll or swipe with two fingers to reach off-screen areas.' },
  { icon: '💾', title: 'Save', text: 'Click Save at the top. Reopening this link brings the canvas back.' }
];

function HelpPanel({ onClose }) {
  return (
    <aside className="help">
      <div className="help__header">
        <span>How to use</span>
        <button className="help__close" onClick={onClose} title="Hide guide">×</button>
      </div>
      <ul className="help__list">
        {TIPS.map(({ icon, title, text }) => (
          <li key={title} className="help__item">
            <span className="help__icon">{icon}</span>
            <div>
              <div className="help__title">{title}</div>
              <div className="help__text">{text}</div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default HelpPanel;
