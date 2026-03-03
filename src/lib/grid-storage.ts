import type { GridConfig, MergedArea } from "./grid-utils";

export interface SavedGridTemplate {
  id: string;
  name: string;
  config: GridConfig;
  mergedAreas: MergedArea[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "grid-layout-templates";

export function saveGridLayout(template: Omit<SavedGridTemplate, "id" | "createdAt" | "updatedAt">): SavedGridTemplate {
  const templates = getSavedGridLayouts();
  const existingIndex = templates.findIndex((t) => t.name === template.name);
  
  const now = new Date().toISOString();
  
  let savedTemplate: SavedGridTemplate;
  
  if (existingIndex >= 0) {
    savedTemplate = {
      ...templates[existingIndex],
      ...template,
      updatedAt: now,
    };
    templates[existingIndex] = savedTemplate;
  } else {
    savedTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    templates.push(savedTemplate);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return savedTemplate;
}

export function getSavedGridLayouts(): SavedGridTemplate[] {
  if (typeof window === "undefined") {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as SavedGridTemplate[];
  } catch {
    console.error("Failed to load grid templates from localStorage");
    return [];
  }
}

export function loadGridLayout(id: string): SavedGridTemplate | null {
  const templates = getSavedGridLayouts();
  return templates.find((t) => t.id === id) || null;
}

export function loadGridLayoutByName(name: string): SavedGridTemplate | null {
  const templates = getSavedGridLayouts();
  return templates.find((t) => t.name === name) || null;
}

export function deleteGridLayout(id: string): boolean {
  const templates = getSavedGridLayouts();
  const index = templates.findIndex((t) => t.id === id);
  
  if (index < 0) {
    return false;
  }
  
  templates.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return true;
}

export function deleteGridLayoutByName(name: string): boolean {
  const templates = getSavedGridLayouts();
  const filtered = templates.filter((t) => t.name !== name);
  
  if (filtered.length === templates.length) {
    return false;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function clearAllGridLayouts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportGridLayouts(): string {
  const templates = getSavedGridLayouts();
  return JSON.stringify(templates, null, 2);
}

export function importGridLayouts(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as SavedGridTemplate[];
    if (!Array.isArray(imported)) {
      return false;
    }
    
    for (const template of imported) {
      if (!template.name || !template.config) {
        return false;
      }
    }
    
    const existing = getSavedGridLayouts();
    const existingNames = new Set(existing.map((t) => t.name));
    
    const merged = [...existing];
    for (const template of imported) {
      if (existingNames.has(template.name)) {
        const index = merged.findIndex((t) => t.name === template.name);
        merged[index] = template;
      } else {
        merged.push({
          ...template,
          id: template.id || crypto.randomUUID(),
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch {
    console.error("Failed to import grid templates");
    return false;
  }
}