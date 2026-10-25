import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ArrowRight, Bot, Box, ChevronLeft, ChevronRight, CircleHelp, CloudUpload,
  Database, File, FileText, Home, MessageCircle, Paperclip, Plus, Search,
  Send, Settings, Sparkles, Trash2, Upload, User, X
} from 'lucide-react';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const initialDocuments = [
  { name: 'AI_Notes.pdf', type: 'PDF', size: '2.4 MB', chunks: 120, color: 'red', pages: [] },
  { name: 'Cloud_Architecture.docx', type: 'DOCX', size: '1.8 MB', chunks: 85, color: 'blue', pages: [] },
  { name: 'RAG_Research_Paper.pdf', type: 'PDF', size: '3.1 MB', chunks: 150, color: 'red', pages: [] },
  { name: 'Internship_Report.txt', type: 'TXT', size: '0.6 MB', chunks: 40, color: 'slate', pages: [] }
];

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'knowledge', label: 'Knowledge Base', icon: Box },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function Logo() {
  return <div className="logo-mark"><span /><span /><span /></div>;
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="brand"><Logo /><strong>RAG Assistant</strong></div>
      <nav>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
            <Icon size={21} strokeWidth={2.2} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="profile">
        <div className="avatar">K</div>
        <div><strong>Kishore</strong><small>Student</small></div>
      </div>
    </aside>
  );
}

function PageHeader({ title, subtitle, action, onAction }) {
  return <header className="page-header">
    <div><h1>{title}</h1><p>{subtitle}</p></div>
    {action && <button className="primary-button" onClick={onAction}><Plus size={21} />{action}</button>}
  </header>;
}

function Landing({ setPage }) {
  return <main className="landing">
    <header className="landing-nav">
      <div className="brand dark"><Logo /><strong>RAG Assistant</strong></div>
      <div className="landing-links"><a href="#features">Home</a><a href="#features">Features</a><a href="#how">How it Works</a><a href="#about">About</a><button className="primary-button" onClick={() => setPage('documents')}>Get Started</button></div>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <h1>Chat with<br /><em>Your Documents</em></h1>
        <p>Upload your documents and get accurate,<br />context-aware answers using<br />Retrieval-Augmented Generation (RAG).</p>
        <button className="primary-button hero-button" onClick={() => setPage('documents')}>Get Started <ArrowRight size={20} /></button>
      </div>
      <div className="hero-illustration">
        <div className="doc-float pdf">PDF</div><div className="doc-float docx">DOCX</div><div className="doc-float txt">TXT</div>
        <div className="rag-box">RAG</div><div className="answer-card"><div /><div /><div className="answer-arrow">→</div><div className="openai">◌</div></div>
      </div>
    </section>
    <section className="feature-row" id="features">
      <Feature icon={<FileText />} tone="green" title="Upload Documents" text="PDF, DOCX, TXT and more" />
      <Feature icon={<Search />} tone="blue" title="Search & Retrieve" text="Find relevant information" />
      <Feature icon={<MessageCircle />} tone="purple" title="AI-Powered Answers" text="Get accurate, cited responses" />
    </section>
  </main>;
}

function Feature({ icon, tone, title, text }) {
  return <div className="feature-card"><div className={`feature-icon ${tone}`}>{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}

async function extractPdfPages(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push({ page: pageNumber, text: content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim() });
  }
  return pages;
}

function Documents({ documents, setDocuments, setPage }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const addFiles = async (files) => {
    setProcessing(true);
    setError('');
    try {
      const additions = [];
      for (const file of [...files]) {
        const type = file.name.split('.').pop().toUpperCase();
        const pages = type === 'PDF' ? await extractPdfPages(file) : [];
        additions.push({ name: file.name, type, size: `${(file.size / 1048576).toFixed(1)} MB`, chunks: pages.length, color: 'blue', pages });
      }
      setDocuments([...documents, ...additions]);
    } catch (uploadError) {
      setError(`Could not read the PDF: ${uploadError.message}`);
    } finally {
      setProcessing(false);
    }
  };
  const shown = documents.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
  return <main className="app-content">
    <PageHeader title="Documents" subtitle="Upload and manage your documents to build your knowledge base." action="Upload Documents" onAction={() => inputRef.current?.click()} />
    <input ref={inputRef} type="file" multiple hidden accept=".pdf,.docx,.txt,.csv" onChange={e => addFiles(e.target.files)} />
    <div className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
      <CloudUpload size={57} className="cloud-icon" /><h3>Drag & drop your files here</h3><strong>or click to browse</strong><p>Supports PDF, DOCX, TXT, CSV (Max 50MB)</p>
    </div>
    {processing && <p className="processing-message">Reading your PDF and building searchable document chunks...</p>}
    {error && <p className="upload-error">{error}</p>}
    <div className="table-heading"><h2>Uploaded Documents ({documents.length})</h2><label className="search-field"><Search size={20} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documents..." /></label></div>
    <div className="document-table">
      <div className="table-row table-head"><span>#</span><span>File Name <small>⌄</small></span><span>Type</span><span>Size</span><span>Status</span><span>Actions</span></div>
      {shown.map((doc, i) => <div className="table-row" key={`${doc.name}-${i}`}><span>{i + 1}</span><span className="filename">{doc.name}</span><span>{doc.type}</span><span>{doc.size}</span><span><b className="status">Processed</b></span><span className="actions"><button title="Ask questions" onClick={() => setPage('chat')}><MessageCircle size={21} /></button><button title="Delete" onClick={() => setDocuments(documents.filter(d => d !== doc))}><Trash2 size={20} /></button></span></div>)}
    </div>
  </main>;
}

function Chat({ documents }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const ask = () => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const terms = cleanQuestion.toLowerCase().split(/\W+/).filter(term => term.length > 2);
    const matches = documents.flatMap(document => (document.pages || []).map(page => ({ ...page, document: document.name })))
      .map(source => ({ ...source, score: terms.reduce((score, term) => score + (source.text.toLowerCase().includes(term) ? 1 : 0), 0) }))
      .filter(source => source.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    const answer = matches.length
      ? `I found this information in your uploaded documents:\n\n${matches.map(source => `${source.text.slice(0, 600)}${source.text.length > 600 ? '...' : ''}`).join('\n\n')}`
      : documents.some(document => document.pages?.length)
        ? 'I could not find a matching passage in the uploaded PDF. Try using a few exact words from the document.'
        : 'Upload a PDF in Documents first. I will read its pages and use the extracted text to answer your questions.';
    setMessages([...messages, { question: cleanQuestion, answer, sources: matches }]);
    setQuestion('');
  };
  return <main className="app-content chat-page"><PageHeader title="Chat with Your Documents" subtitle="Ask questions and get accurate answers based on your uploaded documents." action="New Chat" onAction={() => setMessages([])} />
    <div className="chat-window">{messages.length === 0 && <><div className="question-bubble">What is Retrieval-Augmented Generation (RAG)? <div className="user-icon"><User size={18} /></div></div><div className="answer-bubble"><div className="bot-icon"><Bot size={21} /></div><p><strong>Retrieval-Augmented Generation (RAG)</strong> is an AI framework that combines information retrieval with text generation. It first retrieves relevant information from a knowledge base (such as your uploaded documents), and then uses a large language model (LLM) to generate a context-aware and accurate response based on the retrieved content.</p><div className="sources"><b>Sources:</b><div><span>1. RAG_Research_Paper.pdf</span><small>Page 2</small><span>2. AI_Notes.pdf</span><small>Page 5</small><span>3. Cloud_Architecture.docx</span><small>Page 3</small></div></div></div></>}
      {messages.map((message, i) => <div key={i} className="message-pair"><div className="question-bubble">{message.question}</div><div className="answer-bubble"><div className="bot-icon"><Bot size={21} /></div><p>{message.answer}</p>{message.sources.length > 0 && <div className="sources"><b>Retrieved sources:</b><div>{message.sources.map(source => <span key={`${source.document}-${source.page}`}>{source.document}<small>Page {source.page}</small></span>)}</div></div>}</div></div>)}</div>
    <div className="suggestions">{['How does RAG work?', 'What are its advantages?', 'Use cases of RAG', 'Compare RAG with fine-tuning'].map(x => <button key={x} onClick={() => setQuestion(x)}>{x}</button>)}</div>
    <div className="chat-input"><button><Paperclip size={22} /></button><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask a question about your documents..." /><button className="send" onClick={ask}><Send size={23} /></button></div>
  </main>;
}

function Knowledge() {
  const [selected, setSelected] = useState(2);
  const chunks = ['RAG combines retrieval and generation...', 'The retrieval step uses a vector database...', 'The generator (LLM) uses retrieved passages ...', 'RAG improves accuracy and reduces ...', 'Common use cases include document QA...'];
  return <main className="app-content knowledge-page"><PageHeader title="Knowledge Base" subtitle="View stored document chunks and their embeddings." /><label className="search-field kb-search"><Search size={20} /><input placeholder="Search chunks..." /></label>
    <div className="knowledge-grid"><section className="panel doc-list"><h2>Documents</h2>{initialDocuments.map((d, i) => <button key={d.name} className={selected === i + 1 ? 'selected' : ''} onClick={() => setSelected(i + 1)}><FileText size={26} /><span>{d.name}<small>{d.chunks} chunks</small></span></button>)}</section><section className="panel chunk-list"><h2>Document Chunks</h2>{chunks.map((c, i) => <button key={c} className={selected === i + 1 ? 'selected' : ''} onClick={() => setSelected(i + 1)}><b>{i + 1}</b><span>{c}</span></button>)}<div className="pagination"><ChevronLeft size={19} /><b>1</b><span>2</span><span>3</span><span>...</span><span>30</span><ChevronRight size={19} /></div></section><section className="panel details"><h2>Chunk Details</h2><strong>Chunk ID</strong><code>chunk_0023</code><strong>Content</strong><p>The retrieval step uses a vector database to find semantically similar document chunks based on the user query. These retrieved chunks are then passed to the LLM as additional context to generate a more accurate and relevant response.</p><strong>Embedding (first 5 values)</strong><code>[0.0321, -0.0145, 0.0278, -0.0091,<br /> 0.0056, ...]</code><strong>Source</strong><code>RAG_Research_Paper.pdf (Page 3)</code><strong>Metadata</strong><span className="muted">Chunk Size: 512 tokens<br />Created: Oct 20, 2026 10:35 AM</span></section></div>
  </main>;
}

function SettingsPage() { return <main className="app-content"><PageHeader title="Settings" subtitle="Manage your workspace preferences." /><div className="settings-card"><h2>Workspace Settings</h2><label>Workspace name<input defaultValue="Kishore's RAG Workspace" /></label><label>Answer style<select defaultValue="balanced"><option value="balanced">Balanced and accurate</option><option value="concise">Concise</option><option value="detailed">Detailed</option></select></label><button className="primary-button">Save changes</button></div></main>; }

function App() {
  const [page, setPage] = useState('landing');
  const [documents, setDocuments] = useState(initialDocuments);
  if (page === 'landing') return <Landing setPage={setPage} />;
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} />{page === 'documents' && <Documents documents={documents} setDocuments={setDocuments} setPage={setPage} />}{page === 'chat' && <Chat documents={documents} />}{page === 'knowledge' && <Knowledge />}{page === 'settings' && <SettingsPage />}{page === 'home' && <Landing setPage={setPage} />}</div>;
}

import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);
