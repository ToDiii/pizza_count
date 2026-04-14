export interface AchievementDef {
  type: string;
  emoji: string;
  name: string;
  description: string;
  required: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    type: "ERSTE_PIZZA",
    emoji: "🍕",
    name: "Erste Pizza",
    description: "Erste Pizza eingetragen",
    required: 1,
  },
  {
    type: "ZEHNER_CLUB",
    emoji: "🔟",
    name: "10er Club",
    description: "10 Pizzen gegessen",
    required: 10,
  },
  {
    type: "FUENFZIGER_CLUB",
    emoji: "🥇",
    name: "50er Club",
    description: "50 Pizzen gegessen",
    required: 50,
  },
  {
    type: "CENTURION",
    emoji: "💯",
    name: "Centurion",
    description: "100 Pizzen gegessen",
    required: 100,
  },
  {
    type: "PIZZA_ROYALE",
    emoji: "👑",
    name: "Pizza Royale",
    description: "200 Pizzen gegessen",
    required: 200,
  },
];
