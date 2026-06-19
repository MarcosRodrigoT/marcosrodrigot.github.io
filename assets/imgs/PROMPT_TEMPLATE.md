# Portfolio Image Prompt Template

Generate images using **Google Gemini (nano banana)**.

## Template

```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration of [SUBJECT DESCRIPTION] centered in the frame. [MAIN VISUAL ELEMENTS — describe the key objects, their arrangement (left-to-right pipeline, centered dashboard, circular composition, etc.), and what each element represents]. [SECONDARY DETAILS — smaller icons, labels, subtle textures, or supporting graphics]. [GLOW AND HIGHLIGHT CUES — which elements glow in coral to draw attention, which are dimmed or muted in blue]. All content sits within the central 55% of the image vertically, occupying about 50% of the height. Plain dark background fills the rest. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

## Style Rules

- **Resolution**: 1024x1024, 1:1 square
- **Background**: Dark (near-black or very dark navy)
- **Primary accent**: Coral / warm orange-red for highlights and key elements
- **Secondary accent**: Blue / deep blue for supporting elements and muted items
- **Illustration style**: Clean, modern, semi-realistic tech illustration
- **Vertical constraint**: All content within the central 55% of the image vertically; generous dark empty space at top and bottom
- **Composition**: Horizontally oriented layouts work best (left-to-right pipelines, centered dashboards, wide diagrams)

## Tips

- Avoid real company logos or brand imagery — use abstract geometric icons or generic placeholders instead
- Use coral glow to emphasize the most important output or result
- Use dimmed/muted blue for secondary or input elements
- Describe concrete visual elements (icons, bars, grids, arrows) rather than abstract concepts
- Keep the vertical footprint compact — the CSS crops from the bottom (`object-fit: cover`) so top-heavy compositions get cut off
- Refer to existing prompts below as examples of the right level of detail

## Example Prompts

### Kubernetes Cluster Dashboard
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration of a monitoring dashboard screen centered in the frame, showing a Kubernetes cluster overview. The dashboard displays a grid of 17 node status tiles, each with a GPU utilization bar glowing in coral. A Kubernetes helm wheel logo sits in the dashboard header. Small Docker and NFS icons appear in a sidebar. The dashboard screen is contained within the central 55% of the image vertically, surrounded by plain dark background on all sides. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

### Bird Sound Classification (Bachelor's Thesis)
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration with a bird silhouette on the left side and another on the right side of the image, both at vertical center height. Each bird emits concentric sound wave arcs toward the center. Where the waves meet in the middle, they transform into a glowing MFCC feature matrix rendered as a small grid of coral and blue cells. A spectrogram texture subtly fills the background behind the wave arcs. The entire scene is horizontally oriented and vertically compact, sitting in the middle 50% of the image. Dark empty space at top and bottom. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

### Sports Video Summarization Pipeline (Master's Thesis)
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration showing a horizontal processing pipeline centered in the frame. On the left, a short video clip strip shows a martial artist performing a corkscrew kick. Arrows flow rightward through three stacked processing blocks with icons representing body keypoint extraction (a stick figure with joint dots), trajectory analysis (curved dotted paths following limb movement), and temporal grouping and filtering (a series of vertical bars being sorted by a funnel). On the right, a curated highlight clip emerges glowing in coral, framed like a video thumbnail with a play button. The pipeline sits in the vertical middle of the image, occupying about 50% of the height. Plain dark background fills the rest. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

### PhD Thesis
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration of an open doctoral thesis book lying flat in the center of the frame, viewed from slightly above. From the open pages, holographic projections of sports highlight clips rise upward, showing athletes from tennis, basketball, and athletics. Face-recognition markers and highlight selection indicators glow in coral on the projections. The book and projections are compactly arranged within the central 55% of the image vertically. Generous dark empty space at the top and bottom. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

### AI Research Paper Analyzer (Paper Copilot)
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration of an AI research paper analysis pipeline centered in the frame. On the left, a research paper PDF page with visible equations and figure placeholders feeds into a horizontal processing chain. Three connected processing blocks in the center show icons representing text extraction (a document with highlighted lines), image analysis (a small figure thumbnail with a magnifying glass), and reference parsing (a pie chart forming from citation nodes). On the right, a clean markdown summary document emerges glowing in coral, with visible section headers and bullet points. Thin glowing connection lines link each stage. The entire pipeline sits within the central 55% of the image vertically. Generous dark empty space at top and bottom. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

### AI Job Monitoring Agent (Job Finder)
```
1024x1024 pixels, 1:1 square aspect ratio. A stylized digital illustration of a horizontal workflow centered in the frame. On the left, a grid of small rectangular career page tiles in muted blue tones, each with a generic briefcase icon, representing multiple job sources being crawled. Arrows flow rightward into a central AI processing node depicted as a glowing coral brain silhouette with small circuit-line patterns. From the node, three thin parallel paths branch out representing rule scoring (a checklist icon), semantic scoring (clustered dots), and LLM scoring (a chat bubble icon). The paths converge on the right into a single ranked results panel showing five horizontal bars sorted from bright coral at the top to dim blue at the bottom. The entire workflow sits within the central 55% of the image vertically, occupying about 50% of the height. Plain dark background fills the rest. Dark background with blue and coral accents. Clean, modern, semi-realistic tech illustration style.
```

## Image Optimization

Every portfolio image ships in **two formats** so visitors download a tiny file while keeping a safe fallback. Each card uses a `<picture>` element:

```html
<picture>
    <source srcset="assets/imgs/<name>.webp" type="image/webp">
    <img src="assets/imgs/<name>.png" alt="<Alt text>" loading="lazy">
</picture>
```

- **WebP** (`<name>.webp`) is what modern browsers actually load — typically **~20–65 KB**.
- **PNG** (`<name>.png`) is only a fallback for old browsers.

**Naming**: lowercase, hyphen-separated, no spaces (e.g. `transformer-llms.png`). The `<source>` and `<img>` share the same base name.

### Recipe

Keep the original **1024×1024** resolution (do **not** downscale). Generate both files from the AI-generated PNG:

```bash
# 1. WebP companion — what gets served (~40x smaller than the PNG)
convert <name>.png -quality 80 -define webp:method=6 <name>.webp

# 2. Shrink the PNG fallback in place (preserves high quality, ~75-80% smaller)
#    pngquant ships with the project's npm deps:
node_modules/pngquant-bin/vendor/pngquant --strip --quality=70-95 --speed 1 --force --ext .png <name>.png
```

Requires ImageMagick (`convert`) for the WebP step; `pngquant` comes from the `pngquant-bin` npm package. After this, drop both files in `assets/imgs/` and reference them from the card as shown above.
