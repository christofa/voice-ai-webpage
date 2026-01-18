import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Bot = {
  id: string;
  name: string;
  system_prompt: string;
  voice_id: string;
  created_at: string;
};
