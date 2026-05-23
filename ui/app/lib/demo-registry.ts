export interface DemoVertical {
  id: string;
  name: string;
  blurb: string;
  /** Default iframe URL when no admin override is set. Absent for placeholder demos. */
  defaultUrl?: string;
}

export const demoVerticals: DemoVertical[] = [
  {
    id: "ai-travel-advisor",
    name: "AI travel advisor",
    blurb: "Trip advisor powered by AI",
    defaultUrl: "http://aiobsanb202500.westeurope.cloudapp.azure.com:30100/",
  },
];

export const getDemoVertical = (id: string): DemoVertical | undefined =>
  demoVerticals.find((v) => v.id === id);
