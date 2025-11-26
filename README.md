# NeurIPS 2025 Atlas

Interactive visualization of ~6,000 NeurIPS 2025 papers using UMAP dimensionality reduction and semantic search.

## Features

- 🗺️ Interactive neural map visualization with deck.gl
- 🔍 Semantic search powered by SPECTER2 embeddings
- 🎯 Filter papers by award, track, and topic
- 📊 Cluster-based organization with topic labels
- 💡 AI-powered paper summaries and recommendations

## Tech Stack

- **React** + **Vite** - Frontend framework
- **deck.gl** - WebGL-powered visualization
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Markdown** - Markdown rendering

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file contains the deployment configuration.

## Project Structure

```
src/
├── components/
│   ├── NeuralMap.jsx      # Main visualization component
│   ├── ControlPanel.jsx   # Filter and settings panel
│   ├── PaperSidebar.jsx   # Paper details sidebar
│   └── MiniSearch.jsx     # Search interface
├── App.jsx                # Main app component
└── main.jsx              # Entry point

public/
├── neurips_data.json      # Paper data
└── cluster_labels.json    # Cluster metadata
```

## License

MIT
