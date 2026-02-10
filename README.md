# GitHub PR Video Previews

A Chrome extension that renders inline video previews for `.mp4` and `.mov` links on GitHub Pull Request pages.

## Installation (Developer Mode)

1. Clone or download this repository:
   ```
   git clone <repo-url>
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** using the toggle in the top-right corner

4. Click **Load unpacked**

5. Select the `github-expand-videos-extension` folder

6. Navigate to any GitHub Pull Request page — video links will automatically render as inline previews.

## How it works

The extension detects `.mp4` and `.mov` links in PR comments and descriptions, converts GitHub blob URLs to raw URLs, and embeds a `<video>` player directly below the link. It uses a `MutationObserver` to handle GitHub's Turbo navigation so previews appear on dynamically loaded content as well.
