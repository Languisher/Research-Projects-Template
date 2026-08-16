"use strict";

const PROJECTS_ROOT = "02 Projects";
const KNOWLEDGE_ROOT = "04 Knowledge";
const ASSETS_FOLDER_NAME = "assets";

function normalizeVaultPath(path) {
  return String(path || "")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/{2,}/g, "/");
}

function getSourcePath(source) {
  if (typeof source === "string") return source;
  if (source && typeof source.path === "string") return source.path;
  return "";
}

function getEntityAssetsFolder(source) {
  const path = normalizeVaultPath(getSourcePath(source));
  const parts = path.split("/");

  if (
    parts[0] === PROJECTS_ROOT &&
    parts.length >= 3 &&
    parts[1] &&
    parts[1] !== "_Shared"
  ) {
    return `${PROJECTS_ROOT}/${parts[1]}/${ASSETS_FOLDER_NAME}`;
  }

  if (parts[0] === KNOWLEDGE_ROOT && parts.length >= 3 && parts[1]) {
    return `${KNOWLEDGE_ROOT}/${parts[1]}/${ASSETS_FOLDER_NAME}`;
  }

  return null;
}

function getAssetsFolderForEntityFolder(source) {
  const path = normalizeVaultPath(getSourcePath(source));
  const parts = path.split("/");

  if (
    parts.length === 2 &&
    parts[0] === PROJECTS_ROOT &&
    parts[1] &&
    parts[1] !== "_Shared"
  ) {
    return `${path}/${ASSETS_FOLDER_NAME}`;
  }

  if (parts.length === 2 && parts[0] === KNOWLEDGE_ROOT && parts[1]) {
    return `${path}/${ASSETS_FOLDER_NAME}`;
  }

  return null;
}

function splitFilename(filename) {
  const safeName = String(filename || "Attachment").replace(/[\\/]/g, "-");
  const dot = safeName.lastIndexOf(".");

  if (dot <= 0 || dot === safeName.length - 1) {
    return { stem: safeName || "Attachment", extension: "" };
  }

  return {
    stem: safeName.slice(0, dot),
    extension: safeName.slice(dot + 1),
  };
}

module.exports = {
  ASSETS_FOLDER_NAME,
  KNOWLEDGE_ROOT,
  PROJECTS_ROOT,
  getAssetsFolderForEntityFolder,
  getEntityAssetsFolder,
  normalizeVaultPath,
  splitFilename,
};
