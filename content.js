(function () {
  const VIDEO_RE = /\.(mp4|mov)(\?[^#]*)?(#.*)?$/i;
  const PROCESSED = "data-ghvp-processed";

  function isVideoLink(anchor) {
    const href = anchor.getAttribute("href");
    if (!href) return false;
    // Skip links that are already inside a video preview we created
    if (anchor.closest(".ghvp-preview")) return false;
    // Skip links that are already toggle buttons
    if (anchor.classList.contains("ghvp-toggle")) return false;
    return VIDEO_RE.test(href.split("?")[0]);
  }

  function resolveUrl(href) {
    // Convert relative GitHub URLs to absolute, and convert blob URLs to raw
    try {
      const url = new URL(href, location.origin);
      // Convert github.com blob links to raw.githubusercontent.com for direct playback
      const blobMatch = url.pathname.match(
        /^\/([^/]+)\/([^/]+)\/blob\/(.+)/
      );
      if (blobMatch && url.hostname === "github.com") {
        return `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}`;
      }
      return url.href;
    } catch {
      return href;
    }
  }

  function createPreview(anchor) {
    const videoUrl = resolveUrl(anchor.getAttribute("href"));

    const wrapper = document.createElement("div");
    wrapper.className = "ghvp-preview";

    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.src = videoUrl;
    video.setAttribute("playsinline", "");

    video.addEventListener("error", () => {
      wrapper.innerHTML = "";
      const err = document.createElement("div");
      err.className = "ghvp-error";
      err.textContent = "Unable to load video preview.";
      wrapper.appendChild(err);
    });

    wrapper.appendChild(video);
    return wrapper;
  }

  function processLink(anchor) {
    if (anchor.hasAttribute(PROCESSED)) return;
    anchor.setAttribute(PROCESSED, "true");

    const preview = createPreview(anchor);
    const insertTarget = anchor.closest("p, li, div, td") || anchor;
    insertTarget.after(preview);
  }

  function scanForVideoLinks(root) {
    const anchors = (root || document).querySelectorAll(
      `a[href]:not([${PROCESSED}])`
    );
    for (const anchor of anchors) {
      if (isVideoLink(anchor)) {
        processLink(anchor);
      }
    }
  }

  // Initial scan
  scanForVideoLinks();

  // GitHub uses Turbo (pjax-like) navigation — watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check the node itself
          if (node.tagName === "A" && isVideoLink(node)) {
            processLink(node);
          }
          // Check children
          scanForVideoLinks(node);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also re-scan on Turbo navigation events
  document.addEventListener("turbo:load", () => scanForVideoLinks());
  document.addEventListener("turbo:render", () => scanForVideoLinks());
})();
