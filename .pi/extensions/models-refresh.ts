/**
 * models-refresh — query live model catalogs from the providers configured in
 * models.json and update models.json from the queried results.
 *
 * Commands:
 *   /models                        preview: query every provider, show live model lists
 *   /models list [provider]        query one provider (or all) without writing
 *   /models refresh [provider]     query and merge new models into models.json (confirms first)
 *   /models refresh --prune [provider]
 *                                  also remove models the server no longer lists (confirms first)
 *
 * Supported APIs:
 *   openai-completions / openai-responses — GET {baseUrl}/models. Works with OpenAI-
 *     compatible servers, llama.cpp routers (context size and modalities are picked up
 *     from the extra fields they report) and Ollama, with a fallback to Ollama's native
 *     GET {baseUrl}/api/tags.
 *   anthropic-messages               — GET {baseUrl}/v1/models
 *   google-generative-ai             — GET {baseUrl}/v1beta/models
 *
 * Safety: existing model entries keep their metadata untouched; new models are added
 * with whatever metadata the endpoint reports. A backup is written to models.json.bak
 * before every update. Nothing is written without an explicit confirmation, and the
 * write only happens when an interactive UI is available.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelEntry {
  id: string;
  [key: string]: unknown;
}

interface ProviderConfig {
  name?: string;
  baseUrl?: string;
  api?: string;
  apiKey?: string;
  models?: ModelEntry[];
  [key: string]: unknown;
}

interface ModelsJson {
  $schema?: string;
  providers?: Record<string, ProviderConfig>;
  [key: string]: unknown;
}

export interface QueriedModel {
  id: string;
  name?: string;
  contextWindow?: number;
  maxTokens?: number;
  input?: string[];
}

export interface ProviderResult {
  providerId: string;
  models: QueriedModel[];
  endpoint: string;
}

interface ProviderError {
  providerId: string;
  error: string;
}

// ---------------------------------------------------------------------------
// models.json path and IO
// ---------------------------------------------------------------------------

export function modelsJsonPath(): string {
  const envDir = process.env["PI_CODING_AGENT_DIR"];
  const dir = envDir
    ? envDir.startsWith("~")
      ? join(homedir(), envDir.slice(1))
      : envDir
    : join(homedir(), ".pi", "agent");
  return join(dir, "models.json");
}

export function readModelsJson(path: string): ModelsJson | { error: string } {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf-8");
  try {
    return JSON.parse(raw) as ModelsJson;
  } catch (err) {
    return {
      error: `models.json does not parse: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export function writeModelsJson(path: string, doc: ModelsJson): void {
  if (existsSync(path)) copyFileSync(path, `${path}.bak`);
  writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`, "utf-8");
}

// ---------------------------------------------------------------------------
// Querying
// ---------------------------------------------------------------------------

async function fetchJson(
  url: string,
  apiKey: string | undefined,
  signal: AbortSignal | undefined,
  timeoutMs = 15000,
): Promise<{ status: number; body: unknown }> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const res = await fetch(url, { headers, signal: combined });
  const text = await res.text();
  let body: unknown = undefined;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 200);
  }
  return { status: res.status, body };
}

/**
 * OpenAI-compatible /models responses. Also understands the extra fields a
 * llama.cpp router reports (preset block, --ctx-size arg, architecture).
 */
export function parseOpenAiModels(body: unknown): QueriedModel[] {
  const data = (body as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  const models: QueriedModel[] = [];
  for (const item of data) {
    const m = item as Record<string, unknown>;
    if (typeof m?.id !== "string" || m.id.length === 0) continue;
    const entry: QueriedModel = { id: m.id };
    if (typeof m.name === "string" && m.name) entry.name = m.name;
    if (typeof m.context_window === "number" && m.context_window > 0) {
      entry.contextWindow = m.context_window;
    }
    // llama.cpp router: context size from the preset block or the --ctx-size arg.
    let ctxSize: number | undefined;
    const preset = typeof m.preset === "string" ? m.preset : undefined;
    const presetMatch = preset ? /ctx-size\s*=\s*(\d+)/.exec(preset) : undefined;
    const args = Array.isArray(m.status?.args) ? (m.status.args as string[]).join(" ") : "";
    const argsMatch = /--ctx-size[=\s](\d+)/.exec(args);
    const sizeMatch = presetMatch ?? argsMatch;
    if (sizeMatch) ctxSize = Number(sizeMatch[1]);
    if (ctxSize && ctxSize > 0 && !entry.contextWindow) entry.contextWindow = ctxSize;
    // Modalities from the architecture block when present.
    const modalities = (m.architecture?.input_modalities ?? null) as string[] | null;
    if (modalities) {
      const input = modalities.filter((mod) => mod === "text" || mod === "image");
      if (input.length > 0) entry.input = input;
    }
    models.push(entry);
  }
  return models;
}

export function parseOllamaTags(body: unknown): QueriedModel[] {
  const models = (body as { models?: unknown })?.models;
  if (!Array.isArray(models)) return [];
  return models.map((item) => {
    const m = item as Record<string, unknown>;
    const details = (m?.details ?? {}) as Record<string, unknown>;
    const capabilities = Array.isArray(m?.capabilities) ? (m.capabilities as string[]) : [];
    const entry: QueriedModel = { id: String(m?.name) };
    if (typeof details.context_length === "number" && details.context_length > 0) {
      entry.contextWindow = details.context_length;
    }
    entry.input = capabilities.includes("vision") ? ["text", "image"] : ["text"];
    return entry;
  });
}

export function parseAnthropicModels(body: unknown): QueriedModel[] {
  const data = (body as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  const models: QueriedModel[] = [];
  for (const item of data) {
    const m = item as Record<string, unknown>;
    if (typeof m?.id !== "string" || m.id.length === 0) continue;
    const entry: QueriedModel = { id: m.id };
    if (typeof m.display_name === "string" && m.display_name) entry.name = m.display_name;
    if (typeof m.max_tokens === "number" && m.max_tokens > 0) entry.maxTokens = m.max_tokens;
    models.push(entry);
  }
  return models;
}

export function parseGoogleModels(body: unknown): QueriedModel[] {
  const models = (body as { models?: unknown })?.models;
  if (!Array.isArray(models)) return [];
  const result: QueriedModel[] = [];
  for (const item of models) {
    const m = item as Record<string, unknown>;
    const rawId = typeof m?.name === "string" ? m.name : undefined;
    if (!rawId) continue;
    const id = rawId.startsWith("models/") ? rawId.slice("models/".length) : rawId;
    const entry: QueriedModel = { id };
    if (typeof m.contextWindow === "number" && m.contextWindow > 0) {
      entry.contextWindow = m.contextWindow;
    }
    if (typeof m.maxOutputTokens === "number" && m.maxOutputTokens > 0) {
      entry.maxTokens = m.maxOutputTokens;
    }
    const modalities = Array.isArray(m.supported_input_modalities)
      ? (m.supported_input_modalities as string[]).map((s) => s.toLowerCase())
      : ["text"];
    const input = modalities.filter((mod) => mod === "text" || mod === "image");
    entry.input = input.length > 0 ? input : ["text"];
    result.push(entry);
  }
  return result;
}

interface QueryOutcome {
  models: QueriedModel[];
  endpoint: string;
}

export async function queryProvider(
  providerId: string,
  config: ProviderConfig,
  apiKey: string | undefined,
  signal: AbortSignal | undefined,
): Promise<QueryOutcome | { error: string }> {
  const baseUrl = (config.baseUrl ?? "").replace(/\/+$/, "");
  if (!baseUrl) return { error: "no baseUrl configured in models.json" };

  const api = config.api ?? "openai-completions";
  const attempts: Array<{ url: string; parse: (body: unknown) => QueriedModel[] }> = [];

  if (api === "openai-completions" || api === "openai-responses") {
    attempts.push({ url: `${baseUrl}/models`, parse: parseOpenAiModels });
    // Ollama native endpoint (works whether or not baseUrl ends in /v1).
    const tagsBase = baseUrl.endsWith("/v1") ? baseUrl.slice(0, -3) : baseUrl;
    attempts.push({ url: `${tagsBase}/api/tags`, parse: parseOllamaTags });
  } else if (api === "anthropic-messages") {
    attempts.push({ url: `${baseUrl}/v1/models`, parse: parseAnthropicModels });
  } else if (api === "google-generative-ai") {
    attempts.push({ url: `${baseUrl}/v1beta/models`, parse: parseGoogleModels });
  } else {
    return { error: `no model-list endpoint known for api "${api}"` };
  }

  for (const attempt of attempts) {
    try {
      const { status, body } = await fetchJson(attempt.url, apiKey, signal);
      if (status >= 400) continue;
      const models = attempt.parse(body);
      if (models.length > 0) return { models, endpoint: attempt.url };
    } catch (err) {
      if (signal?.aborted) throw err;
      continue;
    }
  }
  return {
    error: `no usable model list at ${attempts.map((a) => a.url).join(", ")} (provider "${providerId}")`,
  };
}

// ---------------------------------------------------------------------------
// Merging
// ---------------------------------------------------------------------------

function toModelEntry(q: QueriedModel): ModelEntry {
  const entry: ModelEntry = { id: q.id };
  if (q.name) entry.name = q.name;
  if (q.contextWindow) entry.contextWindow = q.contextWindow;
  if (q.maxTokens) entry.maxTokens = q.maxTokens;
  if (q.input) entry.input = q.input;
  return entry;
}

export interface MergeOutcome {
  models: ModelEntry[];
  added: ModelEntry[];
  removed: ModelEntry[];
  kept: number;
}

export function mergeProviderModels(
  existing: ModelEntry[] | undefined,
  queried: QueriedModel[],
  prune: boolean,
): MergeOutcome {
  const prev = existing ?? [];
  const queriedIds = new Set(queried.map((q) => q.id));
  const existingIds = new Set(prev.map((m) => m.id));

  const models: ModelEntry[] = [];
  const removed: ModelEntry[] = [];
  for (const m of prev) {
    if (!queriedIds.has(m.id) && prune) {
      removed.push(m);
    } else {
      models.push(m); // existing entries keep their metadata; stale ones kept in place
    }
  }
  const added: ModelEntry[] = [];
  for (const q of queried) {
    if (!existingIds.has(q.id)) {
      const entry = toModelEntry(q);
      added.push(entry);
      models.push(entry);
    }
  }
  return { models, added, removed, kept: prev.length - removed.length };
}

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

function formatModelList(models: QueriedModel[], limit = 15): string {
  const lines = models.slice(0, limit).map((m) => {
    const bits = [m.id];
    if (m.contextWindow) bits.push(`${m.contextWindow} ctx`);
    return `  - ${bits.join(" · ")}`;
  });
  if (models.length > limit) lines.push(`  … ${models.length - limit} more`);
  return lines.join("\n");
}

export default function (pi: ExtensionAPI): void {
  pi.registerCommand("models", {
    description:
      "Query live model catalogs from models.json providers and update models.json " +
      "(/models list [provider], /models refresh [--prune] [provider])",
    getArgumentCompletions: (prefix: string) => {
      const options = ["list", "refresh", "--prune"].filter((o) => o.startsWith(prefix));
      return options.length > 0 ? options.map((option) => ({ value: option, label: option })) : null;
    },
    async handler(args: string, ctx: ExtensionCommandContext): Promise<void> {
      const parts = (args ?? "").trim().split(/\s+/).filter(Boolean);
      const positional: string[] = [];
      for (const p of parts) {
        if (p === "--prune") continue;
        positional.push(p);
      }
      const prune = parts.includes("--prune");

      const action = positional[0] === "refresh" ? "refresh" : "list";
      const requested = positional.slice(1);

      const path = modelsJsonPath();
      const doc = readModelsJson(path);
      if ("error" in doc) {
        ctx.ui.notify(doc.error, "error");
        return;
      }
      const providers = doc.providers ?? {};
      const ids = Object.keys(providers);
      if (ids.length === 0) {
        ctx.ui.notify("No providers configured in models.json.", "warning");
        return;
      }

      let targetIds = ids;
      if (requested.length > 0) {
        const missing = requested.filter((id) => !(id in providers));
        if (missing.length > 0) {
          ctx.ui.notify(
            `Unknown provider${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.\n` +
              `Configured: ${ids.join(", ")}`,
            "error",
          );
          return;
        }
        targetIds = requested;
      }

      // Query each provider.
      const results: ProviderResult[] = [];
      const errors: ProviderError[] = [];
      for (const id of targetIds) {
        ctx.ui.setStatus("models-refresh", `Querying ${id}…`);
        const apiKey = await ctx.modelRegistry.getApiKeyForProvider(id);
        try {
          const outcome = await queryProvider(id, providers[id], apiKey, ctx.signal);
          if ("error" in outcome) {
            errors.push({ providerId: id, error: outcome.error });
          } else {
            results.push({ providerId: id, models: outcome.models, endpoint: outcome.endpoint });
          }
        } catch (err) {
          if (ctx.signal?.aborted) return;
          errors.push({ providerId: id, error: String(err instanceof Error ? err.message : err) });
        }
      }
      ctx.ui.setStatus("models-refresh", undefined);

      for (const e of errors) {
        ctx.ui.notify(`models: ${e.providerId}: ${e.error}`, "warning");
      }
      if (results.length === 0) {
        ctx.ui.notify("No providers could be queried.", "error");
        return;
      }

      if (action === "list") {
        for (const r of results) {
          ctx.ui.notify(`${r.providerId} (${r.endpoint})\n${formatModelList(r.models)}`, "info");
        }
        return;
      }

      // refresh: build the merged document and show a diff summary.
      const summary: string[] = [];
      let totalAdded = 0;
      let totalRemoved = 0;
      const docOut: ModelsJson = { ...doc };
      docOut.providers = { ...providers };
      for (const r of results) {
        const merge = mergeProviderModels(providers[r.providerId].models, r.models, prune);
        docOut.providers[r.providerId] = {
          ...providers[r.providerId],
          models: merge.models,
        };
        totalAdded += merge.added.length;
        totalRemoved += merge.removed.length;
        summary.push(
          `${r.providerId}: +${merge.added.length} new` +
            (merge.removed.length ? `, -${merge.removed.length} removed` : "") +
            `, ${merge.kept} kept`,
        );
        for (const m of merge.added) summary.push(`    + ${m.id}`);
        for (const m of merge.removed) summary.push(`    - ${m.id}`);
      }

      if (totalAdded === 0 && totalRemoved === 0) {
        ctx.ui.notify("models.json is already up to date.", "info");
        return;
      }
      if (!ctx.hasUI) {
        ctx.ui.notify(
          `models refresh (preview only, not written — no interactive UI):\n${summary.join("\n")}`,
          "warning",
        );
        return;
      }
      const ok = await ctx.ui.confirm(
        "Update models.json?",
        `${summary.join("\n")}\n\n${path}\nA backup will be written to models.json.bak.`,
      );
      if (!ok) {
        ctx.ui.notify("models.json update cancelled.", "info");
        return;
      }
      writeModelsJson(path, docOut);
      await ctx.modelRegistry.refresh({ allowNetwork: false });
      ctx.ui.notify(
        `models.json updated (+${totalAdded}, -${totalRemoved}); model list reloaded.`,
        "info",
      );
    },
  });
}
