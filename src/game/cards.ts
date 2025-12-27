// src/game/cards.ts
import { Card } from "./types";

export const ALL_CARDS: Card[] = [
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    anime: "one_piece",
    stats: {
      captain: 98,
      viceCaptain: 60,
      tank: 85,
      healer: 5,
      support: 75,
    },
  },
  {
    id: "zoro",
    name: "Roronoa Zoro",
    anime: "one_piece",
    stats: {
      captain: 80,
      viceCaptain: 95,
      tank: 90,
      healer: 5,
      support: 60,
    },
  },
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    anime: "naruto",
    stats: {
      captain: 95,
      viceCaptain: 85,
      tank: 80,
      healer: 10,
      support: 90,
    },
  },
  {
    id: "sasuke",
    name: "Sasuke Uchiha",
    anime: "naruto",
    stats: {
      captain: 88,
      viceCaptain: 92,
      tank: 75,
      healer: 5,
      support: 70,
    },
  },
  {
    id: "sakura",
    name: "Sakura Haruno",
    anime: "naruto",
    stats: {
      captain: 60,
      viceCaptain: 65,
      tank: 70,
      healer: 95,
      support: 80,
    },
  },
  {
    id: "ichigo",
    name: "Ichigo Kurosaki",
    anime: "bleach",
    stats: {
      captain: 92,
      viceCaptain: 80,
      tank: 85,
      healer: 5,
      support: 75,
    },
  },
  {
    id: "rukia",
    name: "Rukia Kuchiki",
    anime: "bleach",
    stats: {
      captain: 70,
      viceCaptain: 85,
      tank: 65,
      healer: 60,
      support: 80,
    },
  },
  {
    id: "byakuya",
    name: "Byakuya Kuchiki",
    anime: "bleach",
    stats: {
      captain: 90,
      viceCaptain: 88,
      tank: 80,
      healer: 10,
      support: 75,
    },
  },
];
