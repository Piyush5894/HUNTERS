import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FolderGit2,
  FileCode,
  Terminal,
  ExternalLink,
  Download,
  Layers,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Globe,
  Sparkles
} from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pages-fix' | 'commands' | 'parts' | 'structure'>('pages-fix');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectParts = [
    {
      part: 'Part 1: Core Configuration',
      files: [
        { path: 'package.json', desc: 'Dependencies, scripts, and build metadata' },
        { path: 'vite.config.ts', desc: 'Vite & Tailwind CSS v4 bundler setup' },
        { path: 'tsconfig.json', desc: 'TypeScript path mappings and JSX configuration' },
        { path: 'index.html', desc: 'HTML entry point with Plus Jakarta Sans & JetBrains Mono' },
        { path: 'README.md', desc: 'Complete GitHub project documentation' }
      ]
    },
    {
      part: 'Part 2: Data Models & Mock Data',
      files: [
        { path: 'src/types/index.ts', desc: 'Note, User, Branch, Syllabus, and Category types' },
        { path: 'src/data/branchesData.ts', desc: '7 Engineering Branches with 8-semester course syllabi' },
        { path: 'src/data/seedNotes.ts', desc: 'Initial high-yield notes with formulas and preview pages' }
      ]
    },
    {
      part: 'Part 3: State Management & Contexts',
      files: [
        { path: 'src/context/AuthContext.tsx', desc: 'User state, Google login, demo profiles, and bookmarks' },
        { path: 'src/context/NotesContext.tsx', desc: 'Filter state, branch/semester filters, syllabus verification, and downloads' }
      ]
    },
    {
      part: 'Part 4: UI Components & Sections',
      files: [
        { path: 'src/components/Navbar.tsx', desc: 'Sticky header with search bar, navigation tabs, and profile menu' },
        { path: 'src/components/HomeSection.tsx', desc: 'Hero section, instant jump search, and featured notes' },
        { path: 'src/components/BrowseNotesSection.tsx', desc: 'Filterable notes catalog with branch/semester selectors' },
        { path: 'src/components/BranchesSection.tsx', desc: 'Curriculum explorer with semester course units' },
        { path: 'src/components/UploadNotesSection.tsx', desc: 'Contributor publishing studio with live preview' },
        { path: 'src/components/MyAccountSection.tsx', desc: 'Student dashboard with bookmarks and upload history' },
        { path: 'src/components/NotePreviewModal.tsx', desc: 'In-browser multi-page document viewer with zoom & formulas' },
        { path: 'src/components/AuthModal.tsx', desc: 'Google Sign-In and 1-click student demo authentication' },
        { path: 'src/components/NoteCard.tsx', desc: 'Reusable note card with download and bookmark triggers' },
        { path: 'src/components/Footer.tsx', desc: 'Engineering directory footer with course links' }
      ]
    },
    {
      part: 'Part 5: Application Entry Points',
      files: [
        { path: 'src/App.tsx', desc: 'Root component orchestrating the 5 sections and modals' },
        { path: 'src/main.tsx', desc: 'React 19 root DOM hydration' },
        { path: 'src/index.css', desc: 'Tailwind CSS and custom scrollbars' }
      ]
    }
  ];

  const terminalCommands = `# Step 1: Open your terminal inside your project folder
git init

# Step 2: Add all files
git add .

# Step 3: Create initial commit
git commit -m "Add complete EngiNotes engineering platform"

# Step 4: Set primary branch to main
git branch -M main

# Step 5: Connect your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/VERIFIED-COURSE.git

# Step 6: Push all files to GitHub
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center border border-slate-700">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>GitHub Repository Upload Guide</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Commit
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Organized into modular parts to easily upload or commit to GitHub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('pages-fix')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pages-fix'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>GitHub Pages Fix & Deploy</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
              Fixed
            </span>
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'commands'
                ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Git Commands</span>
          </button>
          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'parts'
                ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            File Parts (5 Modules)
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
              activeTab === 'structure'
                ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Folder Structure
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'pages-fix' && (
            <div className="space-y-6">
              {/* Problem & Solution Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">
                      Why did GitHub Pages show a blank white page?
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      GitHub Pages hosts your project at a subfolder URL: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200">https://yourusername.github.io/your-repo-name/</code>. By default, Vite builds assets with an absolute root path (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200">/assets/index.js</code>). The browser tries to load them from the domain root instead of your repository subfolder, resulting in a <strong>404 Not Found</strong> and a blank white screen!
                    </p>
                  </div>
                </div>
              </div>

              {/* Fixes Applied */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Fixes Already Applied to this Project</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100">Relative Base Path</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">Added <code className="text-sky-300">base: './'</code> in <code className="text-slate-300">vite.config.ts</code> so assets load from any repository path.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100">Jekyll Processing Disabled</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">Added <code className="text-sky-300">public/.nojekyll</code> to prevent GitHub Pages from ignoring bundled script files.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100">404 SPA Fallback</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">Added <code className="text-sky-300">public/404.html</code> so direct link reloads don't result in GitHub 404 pages.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100">Auto Deploy Workflow</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">Configured <code className="text-sky-300">.github/workflows/deploy.yml</code> for 1-click CI/CD deployment.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Deployment Methods */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-sky-400" />
                  <span>Choose Your Deployment Method</span>
                </h4>

                {/* Method 1 */}
                <div className="bg-slate-950/80 border border-sky-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-sky-500 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                    Recommended (Zero Manual Work)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      Automated GitHub Actions (Recommended)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Simply push your code to the <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-300">main</code> branch. The included <code className="text-sky-300">.github/workflows/deploy.yml</code> automatically compiles Vite and publishes the production bundle.
                  </p>
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                    <p className="font-semibold text-slate-100">Setup Step on GitHub (One-time only):</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Open your repository on <strong>GitHub.com</strong>.</li>
                      <li>Go to <strong>Settings</strong> &gt; <strong>Pages</strong> (on the left menu).</li>
                      <li>Under <strong>Build and deployment &gt; Source</strong>, change from <em>"Deploy from a branch"</em> to <strong className="text-sky-400">"GitHub Actions"</strong>.</li>
                      <li>Push any commit to <code className="text-sky-300">main</code>, and your site will be live within 60 seconds!</li>
                    </ol>
                  </div>
                </div>

                {/* Method 2 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      Or Deploy via NPM Command (gh-pages)
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400">
                    You can also build locally and deploy the <code className="text-sky-300">dist</code> folder with one terminal command:
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <code className="text-xs font-mono text-emerald-400">npm run deploy</code>
                    <button
                      onClick={() => copyToClipboard('npm run deploy', 'deploy-cmd')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedKey === 'deploy-cmd' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    This automatically runs <code className="text-slate-300">npm run build</code> and pushes the bundled files to the <code className="text-slate-300">gh-pages</code> branch.
                  </p>
                </div>

                {/* Method 3 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      Or Deploy via GitHub's Built-in <code className="text-sky-300 font-mono text-xs">/docs</code> Folder
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The build script automatically outputs the compiled site into both <code className="text-sky-300 font-mono">dist/</code> and <code className="text-sky-300 font-mono">docs/</code>. You can keep GitHub Pages on standard branch mode:
                  </p>
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Go to <strong>Settings</strong> &gt; <strong>Pages</strong> in your GitHub repository.</li>
                      <li>Under <strong>Build and deployment &gt; Source</strong>, keep <strong>"Deploy from a branch"</strong>.</li>
                      <li>Under <strong>Branch</strong>, select <strong className="text-sky-400">main</strong> (or master) and choose the <strong className="text-emerald-400">/docs</strong> folder from the dropdown.</li>
                      <li>Click <strong>Save</strong>. Your website will be live with zero blank page issues!</li>
                    </ol>
                  </div>
                </div>

                {/* Method 4 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h5 className="text-sm font-bold text-white">
                      Or Keep GitHub's Default <code className="text-sky-300 font-mono text-xs">/ (root)</code> Folder
                    </h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We've included the compiled <code className="text-sky-300 font-mono">assets/</code> bundle and <code className="text-sky-300 font-mono">.nojekyll</code> in the repository root directory as well! Even if you leave GitHub Pages on <strong>main &gt; / (root)</strong>, the site will automatically load the pre-built bundle without showing a blank page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                💡 <strong>Tip for GitHub Web UI:</strong> If you are creating files on github.com (via <em>Add file &gt; Create new file</em>), type the full path (e.g. <code className="bg-slate-950 px-1 py-0.5 rounded text-sky-200">src/types/index.ts</code>) into the filename box; GitHub will automatically create the subdirectories for you!
              </div>

              {projectParts.map((group, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>{group.part}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {group.files.length} files
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {group.files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <span className="font-mono text-xs font-semibold text-sky-300">
                            {file.path}
                          </span>
                          <p className="text-[11px] text-slate-400 truncate">
                            {file.desc}
                          </p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(file.path, file.path)}
                          className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy file path"
                        >
                          {copiedKey === file.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Run these commands in your project terminal to push everything to your GitHub repository:
                </span>
                <button
                  onClick={() => copyToClipboard(terminalCommands, 'cmd')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedKey === 'cmd' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                  {terminalCommands}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
{`├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── data/
    │   ├── branchesData.ts
    │   └── seedNotes.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   └── NotesContext.tsx
    └── components/
        ├── Navbar.tsx
        ├── HomeSection.tsx
        ├── BrowseNotesSection.tsx
        ├── BranchesSection.tsx
        ├── UploadNotesSection.tsx
        ├── MyAccountSection.tsx
        ├── NotePreviewModal.tsx
        ├── AuthModal.tsx
        ├── NoteCard.tsx
        ├── BranchIcon.tsx
        └── Footer.tsx`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>All 20 files are compiled and verified</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
