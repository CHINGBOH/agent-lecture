import { useState, useEffect, useCallback } from 'react';
import { getDb, seedDatabase, queryAll, queryOne, addNote, getNotes, deleteNote } from '../lib/db';

// ============================================================
// 通用 DB Hook
// ============================================================
export function useDb() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        await seedDatabase();
        setReady(true);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  return { ready, error };
}

// ============================================================
// 内容查询 Hooks
// ============================================================
export interface ContentSection {
  id: number;
  layer: number;
  section_key: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  order_index: number;
}

export function useSections(layer: number) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const refresh = useCallback(() => {
    setSections(queryAll<ContentSection>(
      'SELECT * FROM content_sections WHERE layer = ? ORDER BY order_index',
      [layer]
    ));
  }, [layer]);

  useEffect(() => { refresh(); }, [refresh]);
  return sections;
}

export interface Mapping {
  id: number;
  tech_concept: string;
  jianghu_role: string;
  scene: string;
  explanation: string;
  layer: number;
  link_to_tech: string;
}

export function useMappings(layer?: number) {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const refresh = useCallback(() => {
    if (layer !== undefined) {
      setMappings(queryAll<Mapping>(
        'SELECT * FROM mappings WHERE layer = ? ORDER BY id', [layer]
      ));
    } else {
      setMappings(queryAll<Mapping>('SELECT * FROM mappings ORDER BY layer, id'));
    }
  }, [layer]);

  useEffect(() => { refresh(); }, [refresh]);
  return mappings;
}

export interface Character {
  id: number;
  name: string;
  title: string;
  avatar_emoji: string | null;
  description: string | null;
  skills: string | null;
  tech_link: string | null;
  layer_link: number | null;
}

export function useCharacters() {
  const [chars, setChars] = useState<Character[]>([]);
  useEffect(() => {
    setChars(queryAll<Character>('SELECT * FROM characters ORDER BY id'));
  }, []);
  return chars;
}

export interface Scene {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  events: string | null;
}

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  useEffect(() => {
    setScenes(queryAll<Scene>('SELECT * FROM scenes ORDER BY id'));
  }, []);
  return scenes;
}

export interface CodeSnippet {
  id: number;
  key: string;
  title: string;
  code: string;
  language: string;
  layer: number;
}

export function useCodeSnippets(layer?: number) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  useEffect(() => {
    if (layer !== undefined) {
      setSnippets(queryAll<CodeSnippet>(
        'SELECT * FROM code_snippets WHERE layer = ? ORDER BY id', [layer]
      ));
    } else {
      setSnippets(queryAll<CodeSnippet>('SELECT * FROM code_snippets ORDER BY layer, id'));
    }
  }, [layer]);
  return snippets;
}

export interface KernelConcept {
  id: number;
  name: string;
  category: string;
  detail: string;
  code_example: string | null;
  mermaid_diagram: string | null;
  analogy: string | null;
  order_index: number;
}

export function useKernelConcepts(category?: string) {
  const [concepts, setConcepts] = useState<KernelConcept[]>([]);
  useEffect(() => {
    if (category) {
      setConcepts(queryAll<KernelConcept>(
        'SELECT * FROM kernel_concepts WHERE category = ? ORDER BY order_index', [category]
      ));
    } else {
      setConcepts(queryAll<KernelConcept>(
        'SELECT * FROM kernel_concepts ORDER BY order_index'
      ));
    }
  }, [category]);
  return concepts;
}

export interface Concept {
  id: number;
  layer: number;
  name: string;
  category: string;
  detail: string;
  analogy: string;
  order_index: number;
}

export function useConcepts(layer: number) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  useEffect(() => {
    setConcepts(queryAll<Concept>(
      'SELECT * FROM concepts WHERE layer = ? ORDER BY order_index', [layer]
    ));
  }, [layer]);
  return concepts;
}

// ============================================================
// 笔记 Hooks
// ============================================================
export function useNotes(sectionKey: string) {
  const [notes, setNotes] = useState<{ id: number; content: string; created_at: string }[]>([]);
  const refresh = useCallback(() => {
    setNotes(getNotes(sectionKey));
  }, [sectionKey]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback((content: string) => {
    addNote(sectionKey, content);
    refresh();
  }, [sectionKey, refresh]);

  const remove = useCallback((id: number) => {
    deleteNote(id);
    refresh();
  }, [refresh]);

  return { notes, addNote: add, deleteNote: remove, refresh };
}

// ============================================================
// 搜索 Hook
// ============================================================
export function useSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = `%${query.toLowerCase()}%`;
    const rows = queryAll<any>(`
      SELECT section_key as id, title, subtitle, layer FROM content_sections
      WHERE LOWER(title) LIKE ? OR LOWER(subtitle) LIKE ?
      LIMIT 20
    `, [q, q]);

    const mappings = queryAll<any>(`
      SELECT tech_concept as id, tech_concept as title, jianghu_role as subtitle, layer FROM mappings
      WHERE LOWER(tech_concept) LIKE ? OR LOWER(jianghu_role) LIKE ?
      LIMIT 20
    `, [q, q]);

    const characters = queryAll<any>(`
      SELECT name as id, name as title, title as subtitle, COALESCE(layer_link, 0) as layer FROM characters
      WHERE LOWER(name) LIKE ? OR LOWER(title) LIKE ?
      LIMIT 10
    `, [q, q]);

    const kernel = queryAll<any>(`
      SELECT name as id, name as title, category as subtitle, 2 as layer FROM kernel_concepts
      WHERE LOWER(name) LIKE ? OR LOWER(detail) LIKE ?
      LIMIT 20
    `, [q, q]);

    const all = [...rows, ...mappings, ...characters, ...kernel].slice(0, 30);
    setResults(all);
  }, [query]);

  return results;
}
