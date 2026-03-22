/// <reference types="vite/client" />
// This provides types for the Vite-injected env variables on import.meta.env
// See https://vite.dev/guide/features.html#client-types
export type Board = {
  id: number;
  title: string;
  user_id: number;
};

export type List = {
  id: number;
  title: string;
  board_id: number;
  position: number;
};

export type Card = {
  id: number;
  title: string;
  list_id: number;
  position: number;
};