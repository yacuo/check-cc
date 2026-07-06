import fs from "node:fs";
import path from "node:path";

export type PostFaq = { question: string; answer: string };

export type Post = {
  title: string;
  description: string;
  slug: string;
  date: string;
  category: string;
  tags: string[];
  faqs: PostFaq[];
  body: string;
  html: string;
};

export type PostGroup = {
  title: string;
  description: string;
  slugs: string[];
};

const postsDirectory = path.join(process.cwd(), "content/posts");

export const postGroups: PostGroup[] = [
  {
    title: "Claude 封号与风控",
    description: "围绕 Claude 封号原因、封号机制、账号受限、解封申诉和退款风险，排查环境画像问题。",
    slugs: [
      "claude-feng-hao",
      "claude-feng-hao-yuan-yin",
      "claude-feng-hao-ji-zhi",
      "claude-feng-hao-jie-feng",
      "claude-feng-hao-tui-kuan",
    ],
  },
  {
    title: "Claude 账号申请",
    description: "申请 Claude 账号前，检查 IP 地区、系统时区、浏览器语言和设备环境是否稳定。",
    slugs: ["claude-shen-qing"],
  },
  {
    title: "Claude 开发者工具",
    description: "面向 Claude API、Claude Code 和 Claude Pro 订阅用户，整理开发者环境与调用风险。",
    slugs: ["claude-api-shen-qing", "claude-code-shen-qing"],
  },
];

type FrontmatterValue = string | string[] | PostFaq[] | undefined;

function asStringArray(value: FrontmatterValue) {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const item of value) {
    if (typeof item === "string") items.push(item);
  }
  return items;
}

function asFaqArray(value: FrontmatterValue) {
  if (!Array.isArray(value)) return [];
  const items: PostFaq[] = [];
  for (const item of value) {
    if (typeof item === "object" && item !== null && "question" in item && "answer" in item) {
      items.push(item as PostFaq);
    }
  }
  return items;
}

function parseList(lines: string[], start: number) {
  const values: string[] = [];
  let index = start;
  while (index < lines.length && /^\s+-\s+/.test(lines[index])) {
    values.push(lines[index].replace(/^\s+-\s+/, "").trim());
    index += 1;
  }
  return { values, next: index };
}

function parseFaqs(lines: string[], start: number) {
  const faqs: PostFaq[] = [];
  let index = start;
  while (index < lines.length) {
    const questionMatch = lines[index].match(/^\s+-\s+question:\s*(.*)$/);
    if (!questionMatch) break;
    const question = questionMatch[1].trim();
    const answerLine = lines[index + 1] ?? "";
    const answerMatch = answerLine.match(/^\s+answer:\s*(.*)$/);
    faqs.push({ question, answer: answerMatch?.[1]?.trim() ?? "" });
    index += answerMatch ? 2 : 1;
  }
  return { faqs, next: index };
}

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Post frontmatter is required");
  const lines = match[1].split("\n");
  const meta: Record<string, FrontmatterValue> = {};
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!field) {
      index += 1;
      continue;
    }
    const [, key, value] = field;
    if (key === "tags") {
      const parsed = parseList(lines, index + 1);
      meta.tags = parsed.values;
      index = parsed.next;
      continue;
    }
    if (key === "faqs") {
      const parsed = parseFaqs(lines, index + 1);
      meta.faqs = parsed.faqs;
      index = parsed.next;
      continue;
    }
    meta[key] = value.trim();
    index += 1;
  }
  return { meta, body: match[2].trim() };
}

function inlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      continue;
    }
    flushList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  flushList();
  return html.join("\n");
}

export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => getPostBySlug(file.replace(/\.md$/, "")))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getGroupedPosts() {
  const posts = getAllPosts();
  return postGroups.map((group) => ({
    ...group,
    posts: group.slugs.map((slug) => posts.find((post) => post.slug === slug)).filter((post): post is Post => Boolean(post)),
  }));
}

export function getRelatedPosts(slug: string, limit = 5) {
  const posts = getAllPosts();
  const group = postGroups.find((item) => item.slugs.includes(slug));
  const grouped = group
    ? group.slugs
        .map((item) => posts.find((post) => post.slug === item))
        .filter((post): post is Post => Boolean(post))
        .filter((post) => post.slug !== slug)
    : [];
  const fallback = posts.filter((post) => post.slug !== slug && !grouped.some((item) => item.slug === post.slug));
  return [...grouped, ...fallback].slice(0, limit);
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const markdown = fs.readFileSync(filePath, "utf8");
  const { meta, body } = parseFrontmatter(markdown);
  return {
    title: String(meta.title),
    description: String(meta.description),
    slug: String(meta.slug),
    date: String(meta.date),
    category: String(meta.category),
    tags: asStringArray(meta.tags),
    faqs: asFaqArray(meta.faqs),
    body,
    html: markdownToHtml(body),
  };
}

export function findPostBySlug(slug: string) {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  return fs.existsSync(filePath) ? getPostBySlug(slug) : null;
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    previous: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}
