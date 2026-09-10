import { Point } from 'fabric';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;

//  Zooms in/out around the centre of the canvas (factor > 1 zooms in)

export const zoomBy = (canvas, factor) => {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvas.getZoom() * factor));
  canvas.zoomToPoint(new Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
  return zoom;
};

//  Mouse wheel / trackpad:
//    two-finger swipe or wheel  - scroll up/down/left/right
//    shift + wheel              - scroll left/right (mouse without a horizontal wheel)
//    pinch (ctrl + wheel)       - zooom at the cursor
//  Returns a cleanup function.

export const attachScroll = (canvas, onZoomChange) => {
  const onWheel = (opt) => {
    const e = opt.e;
    e.preventDefault();

    // Trackpad pinch arrives as a wheel event with ctrlKey set
    if (e.ctrlKey || e.metaKey) {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvas.getZoom() * (e.deltaY < 0 ? 1.1 : 0.9)));
      canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
      onZoomChange(zoom);
      return;
    }

    // Some browsers don't translate shift+wheel into deltaX, so do it ourselves
    const dx = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
    const dy = e.shiftKey && e.deltaX === 0 ? 0 : e.deltaY;
    canvas.relativePan(new Point(-dx, -dy));
  };

  canvas.on('mouse:wheel', onWheel);
  return () => canvas.off('mouse:wheel', onWheel);
};
