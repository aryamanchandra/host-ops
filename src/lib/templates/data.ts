import type { Template } from '@/types/template';

// Bundled starter templates. content is HTML rendered on the public subdomain
// page; customCss is injected alongside.
export const TEMPLATES: Template[] = [
  {
    id: 'landing-saas',
    name: 'SaaS Landing',
    category: 'landing',
    description: 'A clean product landing page with hero, features, and a call to action.',
    tags: ['startup', 'product', 'marketing'],
    content: `
<h2>Ship faster with Domainbase</h2>
<p>The all-in-one platform to launch pages, shorten links, and understand your traffic.</p>
<h3>Why teams choose us</h3>
<ul>
  <li>Spin up subdomains in seconds</li>
  <li>Real-time analytics out of the box</li>
  <li>Clean, fast, and reliable</li>
</ul>
<p><a href="#get-started">Get started →</a></p>
`.trim(),
  },
  {
    id: 'link-in-bio',
    name: 'Link in Bio',
    category: 'link-in-bio',
    description: 'A minimal link hub for your social profiles and projects.',
    tags: ['creator', 'social', 'links'],
    content: `
<h2>@yourhandle</h2>
<p>Creator · Builder · Writer</p>
<ul>
  <li><a href="https://twitter.com">Twitter / X</a></li>
  <li><a href="https://github.com">GitHub</a></li>
  <li><a href="https://youtube.com">YouTube</a></li>
  <li><a href="mailto:hello@example.com">Email me</a></li>
</ul>
`.trim(),
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    category: 'coming-soon',
    description: 'A teaser page with a headline and email capture prompt.',
    tags: ['launch', 'waitlist'],
    content: `
<h2>Something great is coming</h2>
<p>We're putting the finishing touches on it. Check back soon.</p>
<p><a href="mailto:hello@example.com">Notify me</a></p>
`.trim(),
  },
  {
    id: 'docs-home',
    name: 'Docs Home',
    category: 'docs',
    description: 'A documentation landing page with sections and code samples.',
    tags: ['documentation', 'developer'],
    content: `
<h2>Documentation</h2>
<p>Welcome to the docs. Start with the quickstart below.</p>
<h3>Quickstart</h3>
<pre><code>npm install your-package</code></pre>
<h3>Guides</h3>
<ul>
  <li><a href="#install">Installation</a></li>
  <li><a href="#config">Configuration</a></li>
  <li><a href="#api">API reference</a></li>
</ul>
`.trim(),
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'portfolio',
    description: 'A personal portfolio with intro, work, and contact.',
    tags: ['personal', 'work', 'resume'],
    content: `
<h2>Jane Doe</h2>
<p>Designer & front-end engineer based in Berlin.</p>
<h3>Selected work</h3>
<ul>
  <li>Project Atlas — design system</li>
  <li>Northwind — e-commerce redesign</li>
  <li>Lumen — mobile app</li>
</ul>
<h3>Contact</h3>
<p><a href="mailto:jane@example.com">jane@example.com</a></p>
`.trim(),
  },
];
