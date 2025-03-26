// yolosint-wayfinder-ui.js
// Part of the YOLOSINT OSINT toolkit by savant42
// Navigate the echoes of dead links with style

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const CONFIG_URL = '/config.json';

function TreeNode({ node, path = [] }) {
  const [open, setOpen] = useState(false);
  const isLeaf = node.live_url;

  return (
    <div className="ml-4">
      <div
        className="cursor-pointer hover:text-red-400"
        onClick={() => setOpen(!open)}
      >
        {isLeaf ? '📄 ' : open ? '📂 ' : '📁 '} {path[path.length - 1] || 'root'}
      </div>
      {open && !isLeaf && (
        <div className="ml-2 border-l border-gray-600 pl-2">
          {Object.entries(node).map(([key, child]) => (
            <TreeNode key={key} node={child} path={[...path, key]} />
          ))}
        </div>
      )}
      {open && isLeaf && (
        <div className="ml-6 text-sm">
          🔗 <a href={node.live_url} target="_blank" rel="noreferrer">Live</a> | 🕰 <a href={node.archive_url} target="_blank" rel="noreferrer">Archive</a>
        </div>
      )}
    </div>
  );
}

function App() {
  const [config, setConfig] = useState(null);
  const [domain, setDomain] = useState('');
  const [limit, setLimit] = useState(1000);
  const [tree, setTree] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(CONFIG_URL)
      .then(res => res.json())
      .then(cfg => {
        setConfig(cfg);
        setDomain(cfg.defaultDomain || '');
        setLimit(cfg.defaultLimit || 1000);
        setHistory(cfg.history || []);
      });
  }, []);

  const fetchCDX = async () => {
    if (!domain.match(/^[a-z0-9.-]+$/i)) {
      alert('Invalid domain name.');
      return;
    }
    if (config.blocklist?.includes(domain)) {
      alert('Domain is blocked.');
      return;
    }
    const url = `https://web.archive.org/cdx/search/cdx?url=*.${domain}/*&output=json&fl=original&collapse=urlkey&limit=${limit}`;
    const res = await fetch(url);
    const json = await res.json();
    const urls = json.slice(1).map(row => row[0]);
    const tree = {};
    for (const rawUrl of urls) {
      try {
        const u = new URL(rawUrl);
        const parts = [u.hostname, ...u.pathname.split('/').filter(Boolean)];
        let node = tree;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!node[parts[i]]) node[parts[i]] = {};
          node = node[parts[i]];
        }
        const leaf = parts[parts.length - 1] || 'index';
        node[leaf] = {
          live_url: rawUrl,
          archive_url: `https://web.archive.org/web/*/${rawUrl}`,
        };
      } catch (err) {
        console.warn('Bad URL:', rawUrl);
      }
    }
    setTree(tree);
  };

  return (
    <div className="p-4 text-gray-100 font-mono">
      <h1 className="text-2xl mb-4">YOLOSINT Wayfinder 🌐</h1>
      <div className="mb-4">
        <input
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="example.com"
          className="text-black px-2 py-1 mr-2"
        />
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="text-black px-1">
          {[100, 500, 1000, 5000, 10000].map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
        <button onClick={fetchCDX} className="bg-red-600 px-3 py-1 ml-2 rounded">Fetch</button>
      </div>
      {tree && <TreeNode node={tree} />}

      <hr className="my-6 border-gray-700" />

      <div>
        <h2 className="text-xl mb-2">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400">No history available.</p>
        ) : (
          <ul className="list-disc pl-6">
            {history.map((entry, i) => (
              <li key={i}>{entry.domain} — {entry.timestamp}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
