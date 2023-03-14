import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className="hidden sm:flex italic text-sm">
        Created by
        <a
          className="hover:opacity-50 mx-1"
          href="https://twitter.com/RLanceMartin"
          target="_blank"
          rel="noreferrer"
        >
          Lance Martin
        </a>
        based on
        <a
          className="hover:opacity-50 ml-1"
          href="https://twitter.com/lexfridman"
          target="_blank"
          rel="noreferrer"
        >
          Lex Fridman
        </a>
        {`'s blog`}
        <a
          className="hover:opacity-50 ml-1"
          href="https://lexfridman.com/podcast/"
          target="_blank"
          rel="noreferrer"
        >
          Podcast
        </a>
        .
      </div>

      <div className="flex space-x-4">
        <a
          className="flex items-center hover:opacity-50"
          href="https://twitter.com/RLanceMartin"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a>

        <a
          className="flex items-center hover:opacity-50"
          href="https://github.com/PineappleExpress808/lex-gpt"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
    </div>
  );
};
