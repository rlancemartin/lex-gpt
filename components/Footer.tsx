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
          href="https://yentingl.com"
          target="_blank"
          rel="noreferrer"
        >
          林彥廷
        </a>
        based on
        <a
          className="hover:opacity-50 ml-1"
          href="https://www.facebook.com/mengkung.hsieh.3"
          target="_blank"
          rel="noreferrer"
        >
          Gooaye
        </a>
        {`'s blog`}
        <a
          className="hover:opacity-50 ml-1"
          href="https://linktr.ee/gooaye"
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
          href="https://yentingl.com"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandTwitter size={24} />
        </a>

        <a
          className="flex items-center hover:opacity-50"
          href="https://github.com/adamlin120/lex-gpt"
          target="_blank"
          rel="noreferrer"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
    </div>
  );
};
